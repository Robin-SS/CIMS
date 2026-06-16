import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import type { Product } from '../types/Product';

export interface SelectedIngredientRecipe {
  ingredient_id: number;
  standard_quantity: number;
  standard_measurement_unit: string;
}

export const ProductService = {
  async getAllProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('product_name', { ascending: true });

    if (error || !data) {
      return { data: null, error };
    }

    const productsWithImages = data.map((product) => {
      if (product.image_url) {
        const { data: publicUrlData } = supabase
          .storage
          .from('product-images')
          .getPublicUrl(product.image_url);
        
        return { ...product, image_url: publicUrlData.publicUrl };
      }
      return product;
    });

    return { data: productsWithImages as Product[], error: null };
  },

  // NEW DATABASE INSERTION TRANSACTION HANDLER
  async addProductWithIngredients(
    name: string,
    category: string,
    price: number,
    recipes: SelectedIngredientRecipe[],
    userId: string | number | undefined
  ) {
    const { data: productData, error: productError } = await supabase
      .from('products')
      .insert([
        {
          product_name: name,
          product_category: category,
          product_price: price,
          availability: true
        }
      ])
      .select()
      .single();

    if (productError || !productData) {
      return { success: false, error: productError };
    }

    const newProductId = productData.product_id;

    if (recipes.length > 0) {
      const recipeRows = recipes.map((rec) => ({
        product_id: newProductId,
        ingredient_id: rec.ingredient_id,
        standard_quantity: rec.standard_quantity,
        standard_measurement_unit: rec.standard_measurement_unit
      }));

      const { error: recipeError } = await supabase
        .from('prod_ingredient')
        .insert(recipeRows);

      if (recipeError) {
        console.error("Recipe Link Error:", recipeError);
        return { success: false, error: recipeError };
      }
    }

    await supabase.from('activity_log').insert([
      {
        user_id: userId ? BigInt(userId) : null,
        activity: `Created product "${name}" with ${recipes.length} mapped ingredients.`,
        target: 'products',
        created_at: new Date().toISOString()
      }
    ]);

    return { success: true, error: null };
  },

  // ✅ TRACKED: ADDED CONSOLE LOGGER AGENTS TO PINPOINT DATA PERSISTENCE GRAPH DESYNCS
  async updateProductWithIngredients(
    productId: number,
    name: string,
    category: string,
    price: number,
    recipes: SelectedIngredientRecipe[],
    userId: string | number | undefined
  ) {
    try {
      console.log("%c🚀 PRODUCT SERVICE: STARTING METADATA UPDATE TRANSACTION", "color: #D1915F; font-weight: bold;");
      console.log("📍 TARGET PRODUCT ID:", productId);
      console.log("📥 INCOMING RECIPES ARRAY STATE:", JSON.stringify(recipes, null, 2));

      // 1. Update primary field values inside products table matrix
      const { error: prodError } = await supabase
        .from('products')
        .update({
          product_name: name,
          product_category: category,
          product_price: price,
        })
        .eq('product_id', productId);

      if (prodError) {
        console.error("❌ BASE PRODUCT UPDATE ERROR:", prodError.message);
        throw prodError;
      }

      // 2. Clear out any old recipe structural dependencies row references
      console.log(`🧹 EXECUTION: Sending DELETE query request to table 'prod_ingredient' where product_id = ${productId}...`);
      const { error: deleteError, count } = await supabase
        .from('prod_ingredient')
        .delete({ count: 'exact' })
        .eq('product_id', productId);

      if (deleteError) {
        console.error("❌ INGREDIENT ERASE OPERATION FAILED:", deleteError.message);
        throw deleteError;
      }
      console.log(`✅ OPERATION SUCCESSFUL: Wiped cached relational rows. Removed lines count:`, count);

      // 3. Re-persist the current state snapshot rows mapping payload array down
      if (recipes.length > 0) {
        const recipeRows = recipes.map((rec) => ({
          product_id: productId,
          ingredient_id: rec.ingredient_id,
          standard_quantity: rec.standard_quantity,
          standard_measurement_unit: rec.standard_measurement_unit
        }));

        console.log("📥 EXECUTION: Writing fresh recipe configurations array down to Supabase:", JSON.stringify(recipeRows));
        const { error: insertError } = await supabase
          .from('prod_ingredient')
          .insert(recipeRows);

        if (insertError) {
          console.error("❌ INGREDIENT INJECTION WRITE ERROR:", insertError.message);
          throw insertError;
        }
        console.log("✅ SUCCESSFUL WRITE: Database row structures populated securely.");
      } else {
        console.log("ℹ️ STATUS NOTICE: Recipes submission payload is empty. Skipped relational insertions.");
      }

      // 4. Trace changes cleanly into our activity logs metrics table
      await supabase.from('activity_log').insert([
        {
          user_id: userId ? BigInt(userId) : null,
          activity: `Updated product "${name}" details and recipe mappings.`,
          target: 'products',
          created_at: new Date().toISOString()
        }
      ]);

      return { success: true, error: null };
    } catch (err: any) {
      console.error("%c🚨 TRANSACTION ABORTED REVERT STATE CAUGHT:", "color: #FF2C2C; font-weight: bold;", err);
      return { success: false, error: err };
    }
  },

  // BATCH DELETION TRANSACTION HANDLER
  async deleteProductsBatch(
    productIds: number[],
    userId: string | number | undefined
  ): Promise<{ success: boolean; error?: any }> {
    try {
      if (productIds.length === 0) return { success: true };

      const { error: recipeError } = await supabase
        .from('prod_ingredient')
        .delete()
        .in('product_id', productIds);

      if (recipeError) throw recipeError;

      const { error: prodError } = await supabase
        .from('products')
        .delete()
        .in('product_id', productIds);

      if (prodError) throw prodError;

      await supabase.from('activity_log').insert([
        {
          user_id: userId ? BigInt(userId) : null,
          activity: `Batch deleted ${productIds.length} menu items from the product catalog matrix.`,
          target: 'products',
          created_at: new Date().toISOString()
        }
      ]);

      return { success: true, error: null };
    } catch (err: any) {
      console.error("Database batch deletion transaction aborted:", err);
      return { success: false, error: err };
    }
  }
};

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setIsLoading(true);
    const { data, error } = await ProductService.getAllProducts();
    if (error) {
      console.error("Failed to fetch products:", error);
      setError(error.message);
    } else {
      setProducts(data || []);
      setError(null);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return { 
    products, 
    isLoading, 
    error, 
    refetch: fetchProducts 
  };
}