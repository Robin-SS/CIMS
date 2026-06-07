import { useState } from 'react';
import IngredientsTableUI from '../components/IngredientsTableUI';

interface Ingredient {
  ingredient_id: number;
  ingredient_name: string;
  ingredient_category: string;
  stock_quantity: number;
  measurement_unit: string;
  threshold: number;
  stock_status: string;
  stock_date: string;
  expiry_date: string;
}

interface IngredientsTableProps {
  ingredients: Ingredient[];
}

export default function IngredientsTable({ ingredients }: IngredientsTableProps) {
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

  return (
    <IngredientsTableUI
      sortedIngredients={sortedIngredients}
      sortColumn={sortColumn}
      sortDirection={sortDirection}
      onSort={handleSort}
    />
  );
}