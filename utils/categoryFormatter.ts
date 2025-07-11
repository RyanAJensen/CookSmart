// Helper function to standardize category display across the app
export const formatCategory = (category: string) => {
  if (!category) return '';
  
  // Standardize common category names
  const categoryMap: Record<string, string> = {
    'Meat': 'Meat & Poultry',
    'Fish': 'Seafood',
    'Dairy': 'Dairy & Eggs',
    'Vegetables': 'Vegetables',
    'Fruits': 'Fruits',
    'Grains': 'Grains & Bread',
    'Nuts': 'Nuts & Seeds',
    'Oils': 'Oils & Fats',
    'Sweeteners': 'Sweeteners',
    'Condiments': 'Condiments & Sauces',
    'Herbs': 'Herbs & Spices',
    'Seeds': 'Nuts & Seeds',
    'Vegetarian': 'Plant-Based',
    'Protein': 'Protein'
  };
  
  return categoryMap[category] || category;
}; 