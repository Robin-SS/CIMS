import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import type { Product } from '../types/Product';

export const ProductService = {
  async getAllProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('product_name', { ascending: true });

    // If there's an error or no data, stop here
    if (error || !data) {
      return { data: null, error };
    }

    // Loop through the products and convert filenames into full Public URLs
    const productsWithImages = data.map((product) => {
      if (product.image_url) {
        // Ask Supabase for the full URL from your storage bucket
        const { data: publicUrlData } = supabase
          .storage
          .from('product-images') // ⚠️ IMPORTANT: Change this to your actual Supabase bucket name!
          .getPublicUrl(product.image_url);
        
        // Override the simple filename with the full URL
        return { ...product, image_url: publicUrlData.publicUrl };
      }
      
      // If no image_url exists, return the product as-is (UI will show the 🥤 emoji)
      return product;
    });

    return { data: productsWithImages as Product[], error: null };
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

  // Automatically fetch products when a component uses this hook
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