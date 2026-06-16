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
    // 1. Insert core product into 'products' table
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

    // 2. Map all chosen recipe dependencies into 'prod_ingredient'
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

    // 3. Log the action smoothly inside your custom 'activity_log'
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

  // NEW DATABASE UPDATE TRANSACTION HANDLER FOR EDIT MODE
  async updateProductWithIngredients(
    productId: number,
    name: string,
    category: string,
    price: number,
    recipes: SelectedIngredientRecipe[],
    userId: string | number | undefined
  ) {
    try {
      // 1. Update the primary fields in the 'products' table
      const { error: prodError } = await supabase
        .from('products')
        .update({
          product_name: name,
          product_category: category,
          product_price: price,
        })
        .eq('product_id', productId);

      if (prodError) throw prodError;

      // 2. Clear out any old recipe associations to avoid duplication conflicts
      const { error: deleteError } = await supabase
        .from('prod_ingredient')
        .delete()
        .eq('product_id', productId);

      if (deleteError) throw deleteError;

      // 3. Rewrite updated ingredient connections if any are assigned
      if (recipes.length > 0) {
        const recipeRows = recipes.map((rec) => ({
          product_id: productId,
          ingredient_id: rec.ingredient_id,
          standard_quantity: rec.standard_quantity,
          standard_measurement_unit: rec.standard_measurement_unit
        }));

        const { error: insertError } = await supabase
          .from('prod_ingredient')
          .insert(recipeRows);

        if (insertError) throw insertError;
      }

      // 4. Log the modification step smoothly inside the activity tracker
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
      console.error("Database product update transaction aborted:", err);
      return { success: false, error: err };
    }
  },

  // ✅ NEW: BATCH DELETION TRANSACTION HANDLER FOR DELETE MODE
  async deleteProductsBatch(
    productIds: number[],
    userId: string | number | undefined
  ): Promise<{ success: boolean; error?: any }> {
    try {
      if (productIds.length === 0) return { success: true };

      // 1. Clear linked recipe lines first to satisfy foreign key constraints
      const { error: recipeError } = await supabase
        .from('prod_ingredient')
        .delete()
        .in('product_id', productIds);

      if (recipeError) throw recipeError;

      // 2. Delete primary product records from the products table
      const { error: prodError } = await supabase
        .from('products')
        .delete()
        .in('product_id', productIds);

      if (prodError) throw prodError;

      // 3. Log the batch removal action inside activity tracking logs
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