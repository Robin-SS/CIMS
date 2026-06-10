import React, { useState } from 'react';
import type { Ingredient } from '../types/InventoryItem';

interface IngredientsTableProps {
  ingredients: Ingredient[];
  children: (props: {
    sortedIngredients: Ingredient[];
    sortColumn: keyof Ingredient;
    sortDirection: 'asc' | 'desc';
    handleSort: (column: keyof Ingredient) => void;
  }) => React.ReactNode;
}

export default function IngredientsTable({ ingredients, children }: IngredientsTableProps) {
  const [sortColumn, setSortColumn] = useState<keyof Ingredient>('ingredient_name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (column: keyof Ingredient) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedIngredients = [...ingredients].sort((a, b) => {
    let valueA = a[sortColumn];
    let valueB = b[sortColumn];

    if (typeof valueA === 'string' && typeof valueB === 'string') {
      valueA = valueA.toLowerCase();
      valueB = valueB.toLowerCase();
    }

    if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
    if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  return <>{children({ sortedIngredients, sortColumn, sortDirection, handleSort })}</>;
}