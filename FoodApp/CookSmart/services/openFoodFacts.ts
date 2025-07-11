import axios from 'axios';

interface OpenFoodFactsProduct {
  product_name: string;
  brands: string;
  ingredients_text: string;
  nutriments: {
    energy_100g?: number;
    proteins_100g?: number;
    carbohydrates_100g?: number;
    fat_100g?: number;
  };
  image_url?: string;
  quantity?: string;
  serving_size?: string;
  generic_name?: string;
  flavors?: string[];
  flavor?: string;
}

export async function getProductByBarcode(barcode: string) {
  try {
    const response = await axios.get(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
    const data = response.data;

    if (data.status === 1 && data.product) {
      return data.product as OpenFoodFactsProduct;
    }
    return null;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

export function normalizeIngredientName(product: OpenFoodFactsProduct): string {
  function smartTitleCase(str: string) {
    return str.split(' ').map(word => {
      if (word === word.toUpperCase() && word.length > 1) return word;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join(' ');
  }

  const FLAVORS = [
    'Strawberry', 'Grape', 'Mango', 'Green Apple', 'Banana', 'Pineapple', 'Watermelon', 'Peach', 'Lemon', 'Orange', 'Cola', 'Soda', 'Melon', 'Blueberry', 'Cherry', 'Lime', 'Raspberry', 'Blackcurrant', 'Lychee', 'Yogurt', 'Acai', 'Kiwi', 'Fruit', 'Berry', 'Apple', 'Citrus', 'Tropical', 'Mint', 'Chocolate', 'Vanilla', 'Coffee', 'Caramel', 'Coconut', 'Matcha', 'Red', 'White', 'Grapefruit', 'Plum', 'Pear', 'Apricot', 'Guava', 'Passionfruit', 'Pomegranate', 'Cranberry', 'Honey', 'Custard', 'Cream', 'Sour', 'Sweet', 'Salty', 'Spicy', 'Original', 'Mix', 'Assorted'
  ];

  let name = product.product_name || '';
  let generic = product.generic_name || '';
  let brand = product.brands || '';
  let ingredientsText = product.ingredients_text || '';

  name = name.replace(/[!.,;:?]+$/, '').trim();
  generic = generic.replace(/[!.,;:?]+$/, '').trim();
  brand = brand.replace(/[!.,;:?]+$/, '').trim();

  let foundFlavor = '';
  const allText = `${name} ${generic} ${ingredientsText}`;
  for (const flavor of FLAVORS) {
    const regex = new RegExp(`\\b${flavor}\\b`, 'i');
    if (regex.test(allText)) {
      foundFlavor = flavor;
      break;
    }
  }

  let flavorField = '';
  if (Array.isArray(product.flavors) && product.flavors.length > 0) {
    flavorField = product.flavors.join(' ');
  } else if (typeof product.flavor === 'string' && product.flavor.trim()) {
    flavorField = product.flavor.trim();
  }

  const parts: string[] = [];
  if (name) parts.push(name);
  const isGeneric = !!generic || /\b(generic|product|item|food|snack|candy|drink|juice|bar|chips|cookies|crackers|bread|milk|cheese|yogurt|soda|water|tea|coffee|meat|fish|fruit|vegetable|oil|sauce|spread|cereal|rice|pasta|noodles|soup|mix|powder|seasoning|spice|condiment|dressing|frozen|prepared|meal|dish|pack|box|bag|container|can|jar|bottle|carton|loaf|roll|bun|cake|pie|pastry|dessert|treat|snack)\b/i.test(name);
  if (brand && !name.toLowerCase().includes(brand.toLowerCase()) && (isGeneric || !generic)) {
    parts.push(brand);
  }
  if (foundFlavor && !name.toLowerCase().includes(foundFlavor.toLowerCase())) parts.push(foundFlavor);
  if (flavorField && !name.toLowerCase().includes(flavorField.toLowerCase())) parts.push(flavorField);
  if (generic && !name.toLowerCase().includes(generic.toLowerCase())) parts.push(generic);

  const seen = new Set<string>();
  const dedupedParts = parts.map(part => {
    return part.split(' ').filter(word => {
      const lower = word.toLowerCase();
      if (seen.has(lower)) return false;
      seen.add(lower);
      return true;
    }).join(' ');
  }).filter(Boolean);

  let finalName = dedupedParts.join(', ');
  finalName = smartTitleCase(finalName);
  if (!finalName) finalName = brand || generic || 'Unknown Product';
  console.log('normalizeIngredientName result:', finalName);
  return finalName.trim();
}

export function formatNutritionalInfo(product: OpenFoodFactsProduct) {
  const nutriments = product.nutriments || {};
  return {
    energy: nutriments.energy_100g ? `${Math.round(nutriments.energy_100g)} kcal` : 'N/A',
    proteins: nutriments.proteins_100g ? `${Math.round(nutriments.proteins_100g)}g` : 'N/A',
    carbs: nutriments.carbohydrates_100g ? `${Math.round(nutriments.carbohydrates_100g)}g` : 'N/A',
    fat: nutriments.fat_100g ? `${Math.round(nutriments.fat_100g)}g` : 'N/A',
  };
} 