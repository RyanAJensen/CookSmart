import { Ingredient } from '../types';
import { initDatabase, insertIngredient, searchIngredients, getIngredientById, getAllIngredients, clearIngredients } from './database';

interface Nutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: number;
  servingUnit: string;
}

interface CommonIngredient {
  id: string;
  name: string;
  category: string;
  common_names: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  serving_size: number;
  serving_unit: string;
  added_at: string;
}

export const commonIngredients: CommonIngredient[] = [
  {
    id: 'chicken-breast',
    name: 'Chicken Breast',
    common_names: 'chicken breast,chicken fillet,chicken meat',
    category: 'Meat',
    added_at: new Date().toISOString(),
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    serving_size: 100,
    serving_unit: 'g'
  },
  {
    id: 'brown-rice',
    name: 'Brown Rice',
    common_names: 'brown rice,whole grain rice',
    category: 'Grains',
    added_at: new Date().toISOString(),
    calories: 112,
    protein: 2.6,
    carbs: 23.5,
    fat: 0.9,
    serving_size: 100,
    serving_unit: 'g'
  },
  {
    id: 'broccoli',
    name: 'Broccoli',
    common_names: 'broccoli,broccoli florets',
    category: 'Vegetables',
    added_at: new Date().toISOString(),
    calories: 34,
    protein: 2.8,
    carbs: 6.6,
    fat: 0.4,
    serving_size: 100,
    serving_unit: 'g'
  },
  {
    id: 'salmon',
    name: 'Salmon',
    common_names: 'salmon,salmon fillet,atlantic salmon',
    category: 'Fish',
    added_at: new Date().toISOString(),
    calories: 208,
    protein: 22,
    carbs: 0,
    fat: 13,
    serving_size: 100,
    serving_unit: 'g'
  },
  {
    id: 'sweet-potato',
    name: 'Sweet Potato',
    common_names: 'sweet potato,yam,sweet yam',
    category: 'Vegetables',
    added_at: new Date().toISOString(),
    calories: 86,
    protein: 1.6,
    carbs: 20,
    fat: 0.1,
    serving_size: 100,
    serving_unit: 'g'
  },
  {
    id: 'quinoa',
    name: 'Quinoa',
    common_names: 'quinoa,quinoa grain',
    category: 'Grains',
    added_at: new Date().toISOString(),
    calories: 120,
    protein: 4.4,
    carbs: 21.3,
    fat: 1.9,
    serving_size: 100,
    serving_unit: 'g'
  },
  {
    id: 'spinach',
    name: 'Spinach',
    common_names: 'spinach,baby spinach,spinach leaves',
    category: 'Vegetables',
    added_at: new Date().toISOString(),
    calories: 23,
    protein: 2.9,
    carbs: 3.6,
    fat: 0.4,
    serving_size: 100,
    serving_unit: 'g'
  },
  {
    id: 'greek-yogurt',
    name: 'Greek Yogurt',
    common_names: 'greek yogurt,strained yogurt',
    category: 'Dairy',
    added_at: new Date().toISOString(),
    calories: 59,
    protein: 10.3,
    carbs: 3.6,
    fat: 0.4,
    serving_size: 100,
    serving_unit: 'g'
  },
  {
    id: 'almonds',
    name: 'Almonds',
    common_names: 'almonds,almond nuts',
    category: 'Nuts',
    added_at: new Date().toISOString(),
    calories: 579,
    protein: 21.2,
    carbs: 21.7,
    fat: 49.9,
    serving_size: 100,
    serving_unit: 'g'
  },
  {
    id: 'banana',
    name: 'Banana',
    common_names: 'banana,bananas',
    category: 'Fruits',
    added_at: new Date().toISOString(),
    calories: 89,
    protein: 1.1,
    carbs: 22.8,
    fat: 0.3,
    serving_size: 100,
    serving_unit: 'g'
  },
  {
    id: 'egg', name: 'Egg', common_names: 'egg,eggs,chicken egg', category: 'Dairy', added_at: new Date().toISOString(), calories: 155, protein: 13, carbs: 1.1, fat: 11, serving_size: 50, serving_unit: 'g'
  },
  { id: 'milk', name: 'Milk', common_names: 'milk,whole milk,cow milk', category: 'Dairy', added_at: new Date().toISOString(), calories: 42, protein: 3.4, carbs: 5, fat: 1, serving_size: 100, serving_unit: 'ml' },
  { id: 'apple', name: 'Apple', common_names: 'apple,apples', category: 'Fruits', added_at: new Date().toISOString(), calories: 52, protein: 0.3, carbs: 14, fat: 0.2, serving_size: 100, serving_unit: 'g' },
  { id: 'olive-oil', name: 'Olive Oil', common_names: 'olive oil,extra virgin olive oil', category: 'Oils', added_at: new Date().toISOString(), calories: 884, protein: 0, carbs: 0, fat: 100, serving_size: 100, serving_unit: 'ml' },
  { id: 'cheddar-cheese', name: 'Cheddar Cheese', common_names: 'cheddar cheese,cheese,cheddar', category: 'Dairy', added_at: new Date().toISOString(), calories: 403, protein: 25, carbs: 1.3, fat: 33, serving_size: 100, serving_unit: 'g' },
  { id: 'carrot', name: 'Carrot', common_names: 'carrot,carrots', category: 'Vegetables', added_at: new Date().toISOString(), calories: 41, protein: 0.9, carbs: 10, fat: 0.2, serving_size: 100, serving_unit: 'g' },
  { id: 'potato', name: 'Potato', common_names: 'potato,potatoes', category: 'Vegetables', added_at: new Date().toISOString(), calories: 77, protein: 2, carbs: 17, fat: 0.1, serving_size: 100, serving_unit: 'g' },
  { id: 'onion', name: 'Onion', common_names: 'onion,onions', category: 'Vegetables', added_at: new Date().toISOString(), calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, serving_size: 100, serving_unit: 'g' },
  { id: 'garlic', name: 'Garlic', common_names: 'garlic,garlic clove', category: 'Vegetables', added_at: new Date().toISOString(), calories: 149, protein: 6.4, carbs: 33, fat: 0.5, serving_size: 100, serving_unit: 'g' },
  { id: 'tomato', name: 'Tomato', common_names: 'tomato,tomatoes', category: 'Vegetables', added_at: new Date().toISOString(), calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, serving_size: 100, serving_unit: 'g' },
  { id: 'lettuce', name: 'Lettuce', common_names: 'lettuce,romaine lettuce,iceberg lettuce', category: 'Vegetables', added_at: new Date().toISOString(), calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2, serving_size: 100, serving_unit: 'g' },
  { id: 'cucumber', name: 'Cucumber', common_names: 'cucumber,cucumbers', category: 'Vegetables', added_at: new Date().toISOString(), calories: 16, protein: 0.7, carbs: 3.6, fat: 0.1, serving_size: 100, serving_unit: 'g' },
  { id: 'strawberry', name: 'Strawberry', common_names: 'strawberry,strawberries', category: 'Fruits', added_at: new Date().toISOString(), calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3, serving_size: 100, serving_unit: 'g' },
  { id: 'blueberry', name: 'Blueberry', common_names: 'blueberry,blueberries', category: 'Fruits', added_at: new Date().toISOString(), calories: 57, protein: 0.7, carbs: 14, fat: 0.3, serving_size: 100, serving_unit: 'g' },
  { id: 'orange', name: 'Orange', common_names: 'orange,oranges', category: 'Fruits', added_at: new Date().toISOString(), calories: 47, protein: 0.9, carbs: 12, fat: 0.1, serving_size: 100, serving_unit: 'g' },
  { id: 'peanut-butter', name: 'Peanut Butter', common_names: 'peanut butter,peanut spread', category: 'Nuts', added_at: new Date().toISOString(), calories: 588, protein: 25, carbs: 20, fat: 50, serving_size: 100, serving_unit: 'g' },
  { id: 'walnuts', name: 'Walnuts', common_names: 'walnuts,walnut', category: 'Nuts', added_at: new Date().toISOString(), calories: 654, protein: 15, carbs: 14, fat: 65, serving_size: 100, serving_unit: 'g' },
  { id: 'cashews', name: 'Cashews', common_names: 'cashews,cashew nuts', category: 'Nuts', added_at: new Date().toISOString(), calories: 553, protein: 18, carbs: 30, fat: 44, serving_size: 100, serving_unit: 'g' },
  { id: 'bread', name: 'Bread', common_names: 'bread,white bread,whole wheat bread', category: 'Grains', added_at: new Date().toISOString(), calories: 265, protein: 9, carbs: 49, fat: 3.2, serving_size: 100, serving_unit: 'g' },
  { id: 'pasta', name: 'Pasta', common_names: 'pasta,spaghetti,penne,macaroni', category: 'Grains', added_at: new Date().toISOString(), calories: 131, protein: 5, carbs: 25, fat: 1.1, serving_size: 100, serving_unit: 'g' },
  { id: 'beef', name: 'Beef', common_names: 'beef,beef steak,ground beef', category: 'Meat', added_at: new Date().toISOString(), calories: 250, protein: 26, carbs: 0, fat: 15, serving_size: 100, serving_unit: 'g' },
  { id: 'pork', name: 'Pork', common_names: 'pork,pork chop,ground pork', category: 'Meat', added_at: new Date().toISOString(), calories: 242, protein: 27, carbs: 0, fat: 14, serving_size: 100, serving_unit: 'g' },
  { id: 'shrimp', name: 'Shrimp', common_names: 'shrimp,shrimps', category: 'Fish', added_at: new Date().toISOString(), calories: 99, protein: 24, carbs: 0.2, fat: 0.3, serving_size: 100, serving_unit: 'g' },
  { id: 'tofu', name: 'Tofu', common_names: 'tofu,bean curd', category: 'Vegetarian', added_at: new Date().toISOString(), calories: 76, protein: 8, carbs: 1.9, fat: 4.8, serving_size: 100, serving_unit: 'g' },
  { id: 'mushroom', name: 'Mushroom', common_names: 'mushroom,mushrooms', category: 'Vegetables', added_at: new Date().toISOString(), calories: 22, protein: 3.1, carbs: 3.3, fat: 0.3, serving_size: 100, serving_unit: 'g' },
  { id: 'avocado', name: 'Avocado', common_names: 'avocado,avocados', category: 'Fruits', added_at: new Date().toISOString(), calories: 160, protein: 2, carbs: 9, fat: 15, serving_size: 100, serving_unit: 'g' },
  { id: 'yogurt', name: 'Yogurt', common_names: 'yogurt,plain yogurt', category: 'Dairy', added_at: new Date().toISOString(), calories: 59, protein: 3.5, carbs: 4.7, fat: 0.4, serving_size: 100, serving_unit: 'g' },
  { id: 'butter', name: 'Butter', common_names: 'butter', category: 'Dairy', added_at: new Date().toISOString(), calories: 717, protein: 0.9, carbs: 0.1, fat: 81, serving_size: 100, serving_unit: 'g' },
  { id: 'mayonnaise', name: 'Mayonnaise', common_names: 'mayonnaise,mayo', category: 'Oils', added_at: new Date().toISOString(), calories: 680, protein: 1, carbs: 1, fat: 75, serving_size: 100, serving_unit: 'g' },
  { id: 'honey', name: 'Honey', common_names: 'honey', category: 'Sweeteners', added_at: new Date().toISOString(), calories: 304, protein: 0.3, carbs: 82, fat: 0, serving_size: 100, serving_unit: 'g' },
  { id: 'sugar', name: 'Sugar', common_names: 'sugar,white sugar', category: 'Sweeteners', added_at: new Date().toISOString(), calories: 387, protein: 0, carbs: 100, fat: 0, serving_size: 100, serving_unit: 'g' },
  { id: 'rice', name: 'Rice', common_names: 'rice,white rice', category: 'Grains', added_at: new Date().toISOString(), calories: 130, protein: 2.7, carbs: 28, fat: 0.3, serving_size: 100, serving_unit: 'g' },
  { id: 'corn', name: 'Corn', common_names: 'corn,corn kernels', category: 'Vegetables', added_at: new Date().toISOString(), calories: 86, protein: 3.2, carbs: 19, fat: 1.2, serving_size: 100, serving_unit: 'g' },
  { id: 'peas', name: 'Peas', common_names: 'peas,green peas', category: 'Vegetables', added_at: new Date().toISOString(), calories: 81, protein: 5, carbs: 14, fat: 0.4, serving_size: 100, serving_unit: 'g' },
  { id: 'bell-pepper', name: 'Bell Pepper', common_names: 'bell pepper,red pepper,green pepper', category: 'Vegetables', added_at: new Date().toISOString(), calories: 20, protein: 0.9, carbs: 4.6, fat: 0.2, serving_size: 100, serving_unit: 'g' },
  { id: 'cabbage', name: 'Cabbage', common_names: 'cabbage', category: 'Vegetables', added_at: new Date().toISOString(), calories: 25, protein: 1.3, carbs: 6, fat: 0.1, serving_size: 100, serving_unit: 'g' },
  { id: 'zucchini', name: 'Zucchini', common_names: 'zucchini,courgette', category: 'Vegetables', added_at: new Date().toISOString(), calories: 17, protein: 1.2, carbs: 3.1, fat: 0.3, serving_size: 100, serving_unit: 'g' },
  { id: 'eggplant', name: 'Eggplant', common_names: 'eggplant,aubergine', category: 'Vegetables', added_at: new Date().toISOString(), calories: 25, protein: 1, carbs: 6, fat: 0.2, serving_size: 100, serving_unit: 'g' },
  { id: 'lemon', name: 'Lemon', common_names: 'lemon,lemons', category: 'Fruits', added_at: new Date().toISOString(), calories: 29, protein: 1.1, carbs: 9, fat: 0.3, serving_size: 100, serving_unit: 'g' },
  { id: 'lime', name: 'Lime', common_names: 'lime,limes', category: 'Fruits', added_at: new Date().toISOString(), calories: 30, protein: 0.7, carbs: 11, fat: 0.2, serving_size: 100, serving_unit: 'g' },
  { id: 'grapes', name: 'Grapes', common_names: 'grapes,grape', category: 'Fruits', added_at: new Date().toISOString(), calories: 69, protein: 0.7, carbs: 18, fat: 0.2, serving_size: 100, serving_unit: 'g' },
  { id: 'pear', name: 'Pear', common_names: 'pear,pears', category: 'Fruits', added_at: new Date().toISOString(), calories: 57, protein: 0.4, carbs: 15, fat: 0.1, serving_size: 100, serving_unit: 'g' },
  { id: 'pineapple', name: 'Pineapple', common_names: 'pineapple,pineapples', category: 'Fruits', added_at: new Date().toISOString(), calories: 50, protein: 0.5, carbs: 13, fat: 0.1, serving_size: 100, serving_unit: 'g' },
  { id: 'mango', name: 'Mango', common_names: 'mango,mangoes', category: 'Fruits', added_at: new Date().toISOString(), calories: 60, protein: 0.8, carbs: 15, fat: 0.4, serving_size: 100, serving_unit: 'g' },
  { id: 'watermelon', name: 'Watermelon', common_names: 'watermelon', category: 'Fruits', added_at: new Date().toISOString(), calories: 30, protein: 0.6, carbs: 8, fat: 0.2, serving_size: 100, serving_unit: 'g' },
  { id: 'chicken-thigh', name: 'Chicken Thigh', common_names: 'chicken thigh,thigh', category: 'Meat', added_at: new Date().toISOString(), calories: 209, protein: 26, carbs: 0, fat: 11, serving_size: 100, serving_unit: 'g' },
  { id: 'turkey', name: 'Turkey', common_names: 'turkey', category: 'Meat', added_at: new Date().toISOString(), calories: 189, protein: 29, carbs: 0, fat: 7, serving_size: 100, serving_unit: 'g' },
  { id: 'lamb', name: 'Lamb', common_names: 'lamb', category: 'Meat', added_at: new Date().toISOString(), calories: 294, protein: 25, carbs: 0, fat: 21, serving_size: 100, serving_unit: 'g' },
  { id: 'duck', name: 'Duck', common_names: 'duck', category: 'Meat', added_at: new Date().toISOString(), calories: 337, protein: 27, carbs: 0, fat: 28, serving_size: 100, serving_unit: 'g' },
  { id: 'cod', name: 'Cod', common_names: 'cod', category: 'Fish', added_at: new Date().toISOString(), calories: 82, protein: 18, carbs: 0, fat: 0.7, serving_size: 100, serving_unit: 'g' },
  { id: 'tuna', name: 'Tuna', common_names: 'tuna', category: 'Fish', added_at: new Date().toISOString(), calories: 132, protein: 28, carbs: 0, fat: 1, serving_size: 100, serving_unit: 'g' },
  { id: 'sardine', name: 'Sardine', common_names: 'sardine,sardines', category: 'Fish', added_at: new Date().toISOString(), calories: 208, protein: 25, carbs: 0, fat: 11, serving_size: 100, serving_unit: 'g' },
  { id: 'anchovy', name: 'Anchovy', common_names: 'anchovy,anchovies', category: 'Fish', added_at: new Date().toISOString(), calories: 210, protein: 29, carbs: 0, fat: 10, serving_size: 100, serving_unit: 'g' },
  { id: 'bacon', name: 'Bacon', common_names: 'bacon', category: 'Meat', added_at: new Date().toISOString(), calories: 541, protein: 37, carbs: 1.4, fat: 42, serving_size: 100, serving_unit: 'g' },
  { id: 'ham', name: 'Ham', common_names: 'ham', category: 'Meat', added_at: new Date().toISOString(), calories: 145, protein: 21, carbs: 1.5, fat: 6, serving_size: 100, serving_unit: 'g' },
  { id: 'sausage', name: 'Sausage', common_names: 'sausage,sausages', category: 'Meat', added_at: new Date().toISOString(), calories: 301, protein: 12, carbs: 1.7, fat: 27, serving_size: 100, serving_unit: 'g' },
  { id: 'salami', name: 'Salami', common_names: 'salami', category: 'Meat', added_at: new Date().toISOString(), calories: 336, protein: 22, carbs: 1.9, fat: 26, serving_size: 100, serving_unit: 'g' },
  { id: 'chorizo', name: 'Chorizo', common_names: 'chorizo', category: 'Meat', added_at: new Date().toISOString(), calories: 455, protein: 24, carbs: 2.6, fat: 38, serving_size: 100, serving_unit: 'g' },
  { id: 'prosciutto', name: 'Prosciutto', common_names: 'prosciutto', category: 'Meat', added_at: new Date().toISOString(), calories: 250, protein: 26, carbs: 0, fat: 14, serving_size: 100, serving_unit: 'g' },
  { id: 'mozzarella', name: 'Mozzarella', common_names: 'mozzarella', category: 'Dairy', added_at: new Date().toISOString(), calories: 280, protein: 18, carbs: 3, fat: 17, serving_size: 100, serving_unit: 'g' },
  { id: 'parmesan', name: 'Parmesan', common_names: 'parmesan', category: 'Dairy', added_at: new Date().toISOString(), calories: 431, protein: 38, carbs: 4, fat: 29, serving_size: 100, serving_unit: 'g' },
  { id: 'cream', name: 'Cream', common_names: 'cream,heavy cream', category: 'Dairy', added_at: new Date().toISOString(), calories: 340, protein: 2, carbs: 3, fat: 36, serving_size: 100, serving_unit: 'g' },
  { id: 'ice-cream', name: 'Ice Cream', common_names: 'ice cream', category: 'Dairy', added_at: new Date().toISOString(), calories: 207, protein: 3.5, carbs: 24, fat: 11, serving_size: 100, serving_unit: 'g' },
  { id: 'coconut-oil', name: 'Coconut Oil', common_names: 'coconut oil', category: 'Oils', added_at: new Date().toISOString(), calories: 862, protein: 0, carbs: 0, fat: 100, serving_size: 100, serving_unit: 'ml' },
  { id: 'canola-oil', name: 'Canola Oil', common_names: 'canola oil', category: 'Oils', added_at: new Date().toISOString(), calories: 884, protein: 0, carbs: 0, fat: 100, serving_size: 100, serving_unit: 'ml' },
  { id: 'sunflower-oil', name: 'Sunflower Oil', common_names: 'sunflower oil', category: 'Oils', added_at: new Date().toISOString(), calories: 884, protein: 0, carbs: 0, fat: 100, serving_size: 100, serving_unit: 'ml' },
  { id: 'sesame-oil', name: 'Sesame Oil', common_names: 'sesame oil', category: 'Oils', added_at: new Date().toISOString(), calories: 884, protein: 0, carbs: 0, fat: 100, serving_size: 100, serving_unit: 'ml' },
  { id: 'vinegar', name: 'Vinegar', common_names: 'vinegar', category: 'Condiments', added_at: new Date().toISOString(), calories: 18, protein: 0, carbs: 0.9, fat: 0, serving_size: 100, serving_unit: 'ml' },
  { id: 'soy-sauce', name: 'Soy Sauce', common_names: 'soy sauce', category: 'Condiments', added_at: new Date().toISOString(), calories: 53, protein: 8, carbs: 4.9, fat: 0.6, serving_size: 100, serving_unit: 'ml' },
  { id: 'ketchup', name: 'Ketchup', common_names: 'ketchup', category: 'Condiments', added_at: new Date().toISOString(), calories: 112, protein: 1.3, carbs: 26, fat: 0.2, serving_size: 100, serving_unit: 'g' },
  { id: 'mustard', name: 'Mustard', common_names: 'mustard', category: 'Condiments', added_at: new Date().toISOString(), calories: 66, protein: 4.4, carbs: 5, fat: 4, serving_size: 100, serving_unit: 'g' },
  { id: 'barbecue-sauce', name: 'Barbecue Sauce', common_names: 'barbecue sauce,bbq sauce', category: 'Condiments', added_at: new Date().toISOString(), calories: 165, protein: 1.2, carbs: 40, fat: 0.4, serving_size: 100, serving_unit: 'g' },
  { id: 'sriracha', name: 'Sriracha', common_names: 'sriracha', category: 'Condiments', added_at: new Date().toISOString(), calories: 101, protein: 1.3, carbs: 23, fat: 1.7, serving_size: 100, serving_unit: 'g' },
  { id: 'hot-sauce', name: 'Hot Sauce', common_names: 'hot sauce', category: 'Condiments', added_at: new Date().toISOString(), calories: 29, protein: 1, carbs: 6, fat: 0.5, serving_size: 100, serving_unit: 'g' },
  { id: 'maple-syrup', name: 'Maple Syrup', common_names: 'maple syrup', category: 'Sweeteners', added_at: new Date().toISOString(), calories: 260, protein: 0, carbs: 67, fat: 0, serving_size: 100, serving_unit: 'g' },
  { id: 'oats', name: 'Oats', common_names: 'oats,rolled oats', category: 'Grains', added_at: new Date().toISOString(), calories: 389, protein: 17, carbs: 66, fat: 7, serving_size: 100, serving_unit: 'g' },
  { id: 'granola', name: 'Granola', common_names: 'granola', category: 'Grains', added_at: new Date().toISOString(), calories: 471, protein: 10, carbs: 64, fat: 20, serving_size: 100, serving_unit: 'g' },
  { id: 'chia-seeds', name: 'Chia Seeds', common_names: 'chia seeds', category: 'Seeds', added_at: new Date().toISOString(), calories: 486, protein: 17, carbs: 42, fat: 31, serving_size: 100, serving_unit: 'g' },
  { id: 'flaxseed', name: 'Flaxseed', common_names: 'flaxseed,flax seeds', category: 'Seeds', added_at: new Date().toISOString(), calories: 534, protein: 18, carbs: 29, fat: 42, serving_size: 100, serving_unit: 'g' },
  { id: 'pumpkin-seeds', name: 'Pumpkin Seeds', common_names: 'pumpkin seeds', category: 'Seeds', added_at: new Date().toISOString(), calories: 559, protein: 30, carbs: 11, fat: 49, serving_size: 100, serving_unit: 'g' },
  { id: 'sunflower-seeds', name: 'Sunflower Seeds', common_names: 'sunflower seeds', category: 'Seeds', added_at: new Date().toISOString(), calories: 584, protein: 21, carbs: 20, fat: 51, serving_size: 100, serving_unit: 'g' },
  { id: 'basil', name: 'Basil', common_names: 'basil', category: 'Herbs', added_at: new Date().toISOString(), calories: 23, protein: 3.2, carbs: 2.7, fat: 0.6, serving_size: 100, serving_unit: 'g' },
  { id: 'parsley', name: 'Parsley', common_names: 'parsley', category: 'Herbs', added_at: new Date().toISOString(), calories: 36, protein: 3, carbs: 6, fat: 0.8, serving_size: 100, serving_unit: 'g' },
  { id: 'cilantro', name: 'Cilantro', common_names: 'cilantro,coriander', category: 'Herbs', added_at: new Date().toISOString(), calories: 23, protein: 2.1, carbs: 3.7, fat: 0.5, serving_size: 100, serving_unit: 'g' },
  { id: 'dill', name: 'Dill', common_names: 'dill', category: 'Herbs', added_at: new Date().toISOString(), calories: 43, protein: 3.5, carbs: 7, fat: 1.1, serving_size: 100, serving_unit: 'g' },
  { id: 'mint', name: 'Mint', common_names: 'mint', category: 'Herbs', added_at: new Date().toISOString(), calories: 44, protein: 3.3, carbs: 8, fat: 0.7, serving_size: 100, serving_unit: 'g' },
  { id: 'rosemary', name: 'Rosemary', common_names: 'rosemary', category: 'Herbs', added_at: new Date().toISOString(), calories: 131, protein: 3.3, carbs: 21, fat: 5.9, serving_size: 100, serving_unit: 'g' },
  { id: 'thyme', name: 'Thyme', common_names: 'thyme', category: 'Herbs', added_at: new Date().toISOString(), calories: 101, protein: 5.6, carbs: 24, fat: 1.7, serving_size: 100, serving_unit: 'g' },
  { id: 'oregano', name: 'Oregano', common_names: 'oregano', category: 'Herbs', added_at: new Date().toISOString(), calories: 265, protein: 9, carbs: 69, fat: 4.3, serving_size: 100, serving_unit: 'g' },
  { id: 'cinnamon', name: 'Cinnamon', common_names: 'cinnamon', category: 'Spices', added_at: new Date().toISOString(), calories: 247, protein: 4, carbs: 81, fat: 1.2, serving_size: 100, serving_unit: 'g' },
  { id: 'black-pepper', name: 'Black Pepper', common_names: 'black pepper,pepper', category: 'Spices', added_at: new Date().toISOString(), calories: 251, protein: 10, carbs: 64, fat: 3.3, serving_size: 100, serving_unit: 'g' },
  { id: 'paprika', name: 'Paprika', common_names: 'paprika', category: 'Spices', added_at: new Date().toISOString(), calories: 282, protein: 14, carbs: 54, fat: 13, serving_size: 100, serving_unit: 'g' },
  { id: 'cumin', name: 'Cumin', common_names: 'cumin', category: 'Spices', added_at: new Date().toISOString(), calories: 375, protein: 18, carbs: 44, fat: 22, serving_size: 100, serving_unit: 'g' },
  { id: 'turmeric', name: 'Turmeric', common_names: 'turmeric', category: 'Spices', added_at: new Date().toISOString(), calories: 354, protein: 8, carbs: 65, fat: 10, serving_size: 100, serving_unit: 'g' },
  { id: 'ginger', name: 'Ginger', common_names: 'ginger', category: 'Spices', added_at: new Date().toISOString(), calories: 80, protein: 1.8, carbs: 18, fat: 0.8, serving_size: 100, serving_unit: 'g' },
  { id: 'nutmeg', name: 'Nutmeg', common_names: 'nutmeg', category: 'Spices', added_at: new Date().toISOString(), calories: 525, protein: 6, carbs: 49, fat: 36, serving_size: 100, serving_unit: 'g' },
  { id: 'cloves', name: 'Cloves', common_names: 'cloves', category: 'Spices', added_at: new Date().toISOString(), calories: 274, protein: 6, carbs: 66, fat: 13, serving_size: 100, serving_unit: 'g' },
  { id: 'vanilla', name: 'Vanilla', common_names: 'vanilla', category: 'Spices', added_at: new Date().toISOString(), calories: 288, protein: 0.1, carbs: 13, fat: 0.1, serving_size: 100, serving_unit: 'g' },
  { id: 'saffron', name: 'Saffron', common_names: 'saffron', category: 'Spices', added_at: new Date().toISOString(), calories: 310, protein: 11, carbs: 65, fat: 6, serving_size: 100, serving_unit: 'g' },
  { id: 'cardamom', name: 'Cardamom', common_names: 'cardamom', category: 'Spices', added_at: new Date().toISOString(), calories: 311, protein: 11, carbs: 68, fat: 7, serving_size: 100, serving_unit: 'g' },
  { id: 'bay-leaf', name: 'Bay Leaf', common_names: 'bay leaf', category: 'Spices', added_at: new Date().toISOString(), calories: 313, protein: 8, carbs: 75, fat: 8, serving_size: 100, serving_unit: 'g' },
  { id: 'star-anise', name: 'Star Anise', common_names: 'star anise', category: 'Spices', added_at: new Date().toISOString(), calories: 337, protein: 18, carbs: 50, fat: 16, serving_size: 100, serving_unit: 'g' },
  { id: 'allspice', name: 'Allspice', common_names: 'allspice', category: 'Spices', added_at: new Date().toISOString(), calories: 263, protein: 6, carbs: 72, fat: 9, serving_size: 100, serving_unit: 'g' },
  { id: 'mustard-seed', name: 'Mustard Seed', common_names: 'mustard seed', category: 'Spices', added_at: new Date().toISOString(), calories: 508, protein: 27, carbs: 29, fat: 36, serving_size: 100, serving_unit: 'g' },
  { id: 'sesame-seed', name: 'Sesame Seed', common_names: 'sesame seed', category: 'Seeds', added_at: new Date().toISOString(), calories: 573, protein: 18, carbs: 23, fat: 50, serving_size: 100, serving_unit: 'g' },
  { id: 'poppy-seed', name: 'Poppy Seed', common_names: 'poppy seed', category: 'Seeds', added_at: new Date().toISOString(), calories: 525, protein: 18, carbs: 28, fat: 42, serving_size: 100, serving_unit: 'g' },
  { id: 'hazelnuts', name: 'Hazelnuts', common_names: 'hazelnuts', category: 'Nuts', added_at: new Date().toISOString(), calories: 628, protein: 15, carbs: 17, fat: 61, serving_size: 100, serving_unit: 'g' },
  { id: 'macadamia', name: 'Macadamia', common_names: 'macadamia,macadamia nuts', category: 'Nuts', added_at: new Date().toISOString(), calories: 718, protein: 8, carbs: 14, fat: 76, serving_size: 100, serving_unit: 'g' },
  { id: 'pecans', name: 'Pecans', common_names: 'pecans', category: 'Nuts', added_at: new Date().toISOString(), calories: 691, protein: 9, carbs: 14, fat: 72, serving_size: 100, serving_unit: 'g' },
  { id: 'pistachios', name: 'Pistachios', common_names: 'pistachios', category: 'Nuts', added_at: new Date().toISOString(), calories: 562, protein: 20, carbs: 28, fat: 45, serving_size: 100, serving_unit: 'g' },
  { id: 'almond-milk', name: 'Almond Milk', common_names: 'almond milk', category: 'Dairy', added_at: new Date().toISOString(), calories: 17, protein: 0.6, carbs: 0.3, fat: 1.1, serving_size: 100, serving_unit: 'ml' },
  { id: 'coconut-milk', name: 'Coconut Milk', common_names: 'coconut milk', category: 'Dairy', added_at: new Date().toISOString(), calories: 230, protein: 2.3, carbs: 6, fat: 24, serving_size: 100, serving_unit: 'ml' },
  { id: 'soy-milk', name: 'Soy Milk', common_names: 'soy milk', category: 'Dairy', added_at: new Date().toISOString(), calories: 54, protein: 3.3, carbs: 6, fat: 1.8, serving_size: 100, serving_unit: 'ml' },
  { id: 'rice-milk', name: 'Rice Milk', common_names: 'rice milk', category: 'Dairy', added_at: new Date().toISOString(), calories: 47, protein: 0.3, carbs: 9.2, fat: 1, serving_size: 100, serving_unit: 'ml' },
  { id: 'goat-cheese', name: 'Goat Cheese', common_names: 'goat cheese', category: 'Dairy', added_at: new Date().toISOString(), calories: 364, protein: 22, carbs: 0.1, fat: 30, serving_size: 100, serving_unit: 'g' },
  { id: 'brie', name: 'Brie', common_names: 'brie', category: 'Dairy', added_at: new Date().toISOString(), calories: 334, protein: 21, carbs: 0.5, fat: 28, serving_size: 100, serving_unit: 'g' },
  { id: 'gouda', name: 'Gouda', common_names: 'gouda', category: 'Dairy', added_at: new Date().toISOString(), calories: 356, protein: 25, carbs: 2.2, fat: 27, serving_size: 100, serving_unit: 'g' },
  { id: 'swiss-cheese', name: 'Swiss Cheese', common_names: 'swiss cheese', category: 'Dairy', added_at: new Date().toISOString(), calories: 380, protein: 27, carbs: 5, fat: 29, serving_size: 100, serving_unit: 'g' },
  { id: 'feta', name: 'Feta', common_names: 'feta', category: 'Dairy', added_at: new Date().toISOString(), calories: 264, protein: 14, carbs: 4, fat: 21, serving_size: 100, serving_unit: 'g' },
  { id: 'cottage-cheese', name: 'Cottage Cheese', common_names: 'cottage cheese', category: 'Dairy', added_at: new Date().toISOString(), calories: 98, protein: 11, carbs: 3.4, fat: 4.3, serving_size: 100, serving_unit: 'g' },
  { id: 'cream-cheese', name: 'Cream Cheese', common_names: 'cream cheese', category: 'Dairy', added_at: new Date().toISOString(), calories: 342, protein: 6, carbs: 4, fat: 34, serving_size: 100, serving_unit: 'g' },
  { id: 'ricotta', name: 'Ricotta', common_names: 'ricotta', category: 'Dairy', added_at: new Date().toISOString(), calories: 174, protein: 11, carbs: 3, fat: 13, serving_size: 100, serving_unit: 'g' },
  { id: 'blue-cheese', name: 'Blue Cheese', common_names: 'blue cheese', category: 'Dairy', added_at: new Date().toISOString(), calories: 353, protein: 21, carbs: 2.3, fat: 28, serving_size: 100, serving_unit: 'g' },
  { id: 'provolone', name: 'Provolone', common_names: 'provolone', category: 'Dairy', added_at: new Date().toISOString(), calories: 351, protein: 26, carbs: 2.1, fat: 27, serving_size: 100, serving_unit: 'g' },
  { id: 'edam', name: 'Edam', common_names: 'edam', category: 'Dairy', added_at: new Date().toISOString(), calories: 357, protein: 25, carbs: 1.4, fat: 28, serving_size: 100, serving_unit: 'g' },
  { id: 'camembert', name: 'Camembert', common_names: 'camembert', category: 'Dairy', added_at: new Date().toISOString(), calories: 300, protein: 20, carbs: 0.5, fat: 24, serving_size: 100, serving_unit: 'g' },
  { id: 'emmental', name: 'Emmental', common_names: 'emmental', category: 'Dairy', added_at: new Date().toISOString(), calories: 380, protein: 29, carbs: 5, fat: 29, serving_size: 100, serving_unit: 'g' },
  { id: 'manchego', name: 'Manchego', common_names: 'manchego', category: 'Dairy', added_at: new Date().toISOString(), calories: 393, protein: 25, carbs: 1.6, fat: 32, serving_size: 100, serving_unit: 'g' },
  { id: 'pecorino', name: 'Pecorino', common_names: 'pecorino', category: 'Dairy', added_at: new Date().toISOString(), calories: 387, protein: 28, carbs: 0, fat: 30, serving_size: 100, serving_unit: 'g' },
  { id: 'stilton', name: 'Stilton', common_names: 'stilton', category: 'Dairy', added_at: new Date().toISOString(), calories: 353, protein: 21, carbs: 0.1, fat: 30, serving_size: 100, serving_unit: 'g' },
  { id: 'roquefort', name: 'Roquefort', common_names: 'roquefort', category: 'Dairy', added_at: new Date().toISOString(), calories: 369, protein: 21, carbs: 2, fat: 30, serving_size: 100, serving_unit: 'g' },
  { id: 'gorgonzola', name: 'Gorgonzola', common_names: 'gorgonzola', category: 'Dairy', added_at: new Date().toISOString(), calories: 358, protein: 21, carbs: 2.3, fat: 29, serving_size: 100, serving_unit: 'g' },
  { id: 'chevre', name: 'Chevre', common_names: 'chevre', category: 'Dairy', added_at: new Date().toISOString(), calories: 364, protein: 22, carbs: 0.1, fat: 30, serving_size: 100, serving_unit: 'g' },
  { id: 'paneer', name: 'Paneer', common_names: 'paneer', category: 'Dairy', added_at: new Date().toISOString(), calories: 265, protein: 18, carbs: 1.2, fat: 21, serving_size: 100, serving_unit: 'g' },
  { id: 'halloumi', name: 'Halloumi', common_names: 'halloumi', category: 'Dairy', added_at: new Date().toISOString(), calories: 321, protein: 22, carbs: 2.2, fat: 26, serving_size: 100, serving_unit: 'g' },
  { id: 'quark', name: 'Quark', common_names: 'quark', category: 'Dairy', added_at: new Date().toISOString(), calories: 68, protein: 12, carbs: 3.5, fat: 0.2, serving_size: 100, serving_unit: 'g' },
  { id: 'mascarpone', name: 'Mascarpone', common_names: 'mascarpone', category: 'Dairy', added_at: new Date().toISOString(), calories: 429, protein: 7, carbs: 4, fat: 44, serving_size: 100, serving_unit: 'g' },
  { id: 'ricotta-salata', name: 'Ricotta Salata', common_names: 'ricotta salata', category: 'Dairy', added_at: new Date().toISOString(), calories: 157, protein: 11, carbs: 3, fat: 11, serving_size: 100, serving_unit: 'g' },
  { id: 'paneer', name: 'Paneer', common_names: 'paneer', category: 'Dairy', added_at: new Date().toISOString(), calories: 265, protein: 18, carbs: 1.2, fat: 21, serving_size: 100, serving_unit: 'g' },
  { id: 'labneh', name: 'Labneh', common_names: 'labneh', category: 'Dairy', added_at: new Date().toISOString(), calories: 174, protein: 9, carbs: 5, fat: 13, serving_size: 100, serving_unit: 'g' },
  { id: 'kefir', name: 'Kefir', common_names: 'kefir', category: 'Dairy', added_at: new Date().toISOString(), calories: 41, protein: 3.3, carbs: 4.7, fat: 1, serving_size: 100, serving_unit: 'ml' },
  { id: 'buttermilk', name: 'Buttermilk', common_names: 'buttermilk', category: 'Dairy', added_at: new Date().toISOString(), calories: 40, protein: 3.3, carbs: 4.8, fat: 0.9, serving_size: 100, serving_unit: 'ml' },
  { id: 'sour-cream', name: 'Sour Cream', common_names: 'sour cream', category: 'Dairy', added_at: new Date().toISOString(), calories: 193, protein: 2.1, carbs: 4.6, fat: 20, serving_size: 100, serving_unit: 'g' },
  { id: 'ghee', name: 'Ghee', common_names: 'ghee', category: 'Oils', added_at: new Date().toISOString(), calories: 900, protein: 0, carbs: 0, fat: 100, serving_size: 100, serving_unit: 'g' },
  { id: 'lard', name: 'Lard', common_names: 'lard', category: 'Oils', added_at: new Date().toISOString(), calories: 902, protein: 0, carbs: 0, fat: 100, serving_size: 100, serving_unit: 'g' },
  { id: 'shortening', name: 'Shortening', common_names: 'shortening', category: 'Oils', added_at: new Date().toISOString(), calories: 884, protein: 0, carbs: 0, fat: 100, serving_size: 100, serving_unit: 'g' },
  { id: 'margarine', name: 'Margarine', common_names: 'margarine', category: 'Oils', added_at: new Date().toISOString(), calories: 717, protein: 0.2, carbs: 0.7, fat: 81, serving_size: 100, serving_unit: 'g' },
  { id: 'duck-fat', name: 'Duck Fat', common_names: 'duck fat', category: 'Oils', added_at: new Date().toISOString(), calories: 900, protein: 0, carbs: 0, fat: 100, serving_size: 100, serving_unit: 'g' },
  { id: 'beef-tallow', name: 'Beef Tallow', common_names: 'beef tallow', category: 'Oils', added_at: new Date().toISOString(), calories: 902, protein: 0, carbs: 0, fat: 100, serving_size: 100, serving_unit: 'g' },
  { id: 'vegetable-oil', name: 'Vegetable Oil', common_names: 'vegetable oil', category: 'Oils', added_at: new Date().toISOString(), calories: 884, protein: 0, carbs: 0, fat: 100, serving_size: 100, serving_unit: 'g' },
  { id: 'rapeseed-oil', name: 'Rapeseed Oil', common_names: 'rapeseed oil', category: 'Oils', added_at: new Date().toISOString(), calories: 884, protein: 0, carbs: 0, fat: 100, serving_size: 100, serving_unit: 'g' },
  { id: 'walnut-oil', name: 'Walnut Oil', common_names: 'walnut oil', category: 'Oils', added_at: new Date().toISOString(), calories: 884, protein: 0, carbs: 0, fat: 100, serving_size: 100, serving_unit: 'g' },
  { id: 'hazelnut-oil', name: 'Hazelnut Oil', common_names: 'hazelnut oil', category: 'Oils', added_at: new Date().toISOString(), calories: 884, protein: 0, carbs: 0, fat: 100, serving_size: 100, serving_unit: 'g' },
  { id: 'almond-oil', name: 'Almond Oil', common_names: 'almond oil', category: 'Oils', added_at: new Date().toISOString(), calories: 884, protein: 0, carbs: 0, fat: 100, serving_size: 100, serving_unit: 'g' },
  { id: 'grapeseed-oil', name: 'Grapeseed Oil', common_names: 'grapeseed oil', category: 'Oils', added_at: new Date().toISOString(), calories: 884, protein: 0, carbs: 0, fat: 100, serving_size: 100, serving_unit: 'g' },
  { id: 'pumpkin-oil', name: 'Pumpkin Oil', common_names: 'pumpkin oil', category: 'Oils', added_at: new Date().toISOString(), calories: 884, protein: 0, carbs: 0, fat: 100, serving_size: 100, serving_unit: 'g' },
  { id: 'rice-bran-oil', name: 'Rice Bran Oil', common_names: 'rice bran oil', category: 'Oils', added_at: new Date().toISOString(), calories: 884, protein: 0, carbs: 0, fat: 100, serving_size: 100, serving_unit: 'g' },
  { id: 'corn-oil', name: 'Corn Oil', common_names: 'corn oil', category: 'Oils', added_at: new Date().toISOString(), calories: 884, protein: 0, carbs: 0, fat: 100, serving_size: 100, serving_unit: 'g' },
  { id: 'safflower-oil', name: 'Safflower Oil', common_names: 'safflower oil', category: 'Oils', added_at: new Date().toISOString(), calories: 884, protein: 0, carbs: 0, fat: 100, serving_size: 100, serving_unit: 'g' },
  { id: 'peanut-oil', name: 'Peanut Oil', common_names: 'peanut oil', category: 'Oils', added_at: new Date().toISOString(), calories: 884, protein: 0, carbs: 0, fat: 100, serving_size: 100, serving_unit: 'g' },
  { id: 'sesame-oil', name: 'Sesame Oil', common_names: 'sesame oil', category: 'Oils', added_at: new Date().toISOString(), calories: 884, protein: 0, carbs: 0, fat: 100, serving_size: 100, serving_unit: 'g' },
  { id: 'avocado-oil', name: 'Avocado Oil', common_names: 'avocado oil', category: 'Oils', added_at: new Date().toISOString(), calories: 884, protein: 0, carbs: 0, fat: 100, serving_size: 100, serving_unit: 'g' },
  { id: 'palm-oil', name: 'Palm Oil', common_names: 'palm oil', category: 'Oils', added_at: new Date().toISOString(), calories: 884, protein: 0, carbs: 0, fat: 100, serving_size: 100, serving_unit: 'g' },
  { id: 'coconut-water', name: 'Coconut Water', common_names: 'coconut water', category: 'Beverages', added_at: new Date().toISOString(), calories: 19, protein: 0.7, carbs: 3.7, fat: 0.2, serving_size: 100, serving_unit: 'ml' },
  { id: 'orange-juice', name: 'Orange Juice', common_names: 'orange juice', category: 'Beverages', added_at: new Date().toISOString(), calories: 45, protein: 0.7, carbs: 10, fat: 0.2, serving_size: 100, serving_unit: 'ml' },
  { id: 'apple-juice', name: 'Apple Juice', common_names: 'apple juice', category: 'Beverages', added_at: new Date().toISOString(), calories: 46, protein: 0.1, carbs: 11, fat: 0.1, serving_size: 100, serving_unit: 'ml' },
  { id: 'grape-juice', name: 'Grape Juice', common_names: 'grape juice', category: 'Beverages', added_at: new Date().toISOString(), calories: 60, protein: 0.4, carbs: 15, fat: 0.1, serving_size: 100, serving_unit: 'ml' },
  { id: 'cranberry-juice', name: 'Cranberry Juice', common_names: 'cranberry juice', category: 'Beverages', added_at: new Date().toISOString(), calories: 46, protein: 0.4, carbs: 12, fat: 0.1, serving_size: 100, serving_unit: 'ml' },
  { id: 'lemonade', name: 'Lemonade', common_names: 'lemonade', category: 'Beverages', added_at: new Date().toISOString(), calories: 40, protein: 0.1, carbs: 10, fat: 0, serving_size: 100, serving_unit: 'ml' },
  { id: 'tea', name: 'Tea', common_names: 'tea,black tea,green tea', category: 'Beverages', added_at: new Date().toISOString(), calories: 1, protein: 0, carbs: 0.3, fat: 0, serving_size: 100, serving_unit: 'ml' },
  { id: 'coffee', name: 'Coffee', common_names: 'coffee', category: 'Beverages', added_at: new Date().toISOString(), calories: 1, protein: 0.1, carbs: 0, fat: 0, serving_size: 100, serving_unit: 'ml' },
  { id: 'beer', name: 'Beer', common_names: 'beer', category: 'Beverages', added_at: new Date().toISOString(), calories: 43, protein: 0.5, carbs: 3.6, fat: 0, serving_size: 100, serving_unit: 'ml' },
  { id: 'wine', name: 'Wine', common_names: 'wine,red wine,white wine', category: 'Beverages', added_at: new Date().toISOString(), calories: 85, protein: 0.1, carbs: 2.6, fat: 0, serving_size: 100, serving_unit: 'ml' },
  { id: 'vodka', name: 'Vodka', common_names: 'vodka', category: 'Beverages', added_at: new Date().toISOString(), calories: 231, protein: 0, carbs: 0, fat: 0, serving_size: 100, serving_unit: 'ml' },
  { id: 'whiskey', name: 'Whiskey', common_names: 'whiskey', category: 'Beverages', added_at: new Date().toISOString(), calories: 250, protein: 0, carbs: 0, fat: 0, serving_size: 100, serving_unit: 'ml' },
  { id: 'rum', name: 'Rum', common_names: 'rum', category: 'Beverages', added_at: new Date().toISOString(), calories: 231, protein: 0, carbs: 0, fat: 0, serving_size: 100, serving_unit: 'ml' },
  { id: 'gin', name: 'Gin', common_names: 'gin', category: 'Beverages', added_at: new Date().toISOString(), calories: 263, protein: 0, carbs: 0, fat: 0, serving_size: 100, serving_unit: 'ml' },
  { id: 'brandy', name: 'Brandy', common_names: 'brandy', category: 'Beverages', added_at: new Date().toISOString(), calories: 231, protein: 0, carbs: 0, fat: 0, serving_size: 100, serving_unit: 'ml' },
  { id: 'champagne', name: 'Champagne', common_names: 'champagne', category: 'Beverages', added_at: new Date().toISOString(), calories: 76, protein: 0.1, carbs: 1.2, fat: 0, serving_size: 100, serving_unit: 'ml' },
  { id: 'soda', name: 'Soda', common_names: 'soda,cola', category: 'Beverages', added_at: new Date().toISOString(), calories: 41, protein: 0, carbs: 10, fat: 0, serving_size: 100, serving_unit: 'ml' },
  { id: 'energy-drink', name: 'Energy Drink', common_names: 'energy drink', category: 'Beverages', added_at: new Date().toISOString(), calories: 45, protein: 0.5, carbs: 11, fat: 0, serving_size: 100, serving_unit: 'ml' },
  { id: 'sports-drink', name: 'Sports Drink', common_names: 'sports drink', category: 'Beverages', added_at: new Date().toISOString(), calories: 24, protein: 0, carbs: 6, fat: 0, serving_size: 100, serving_unit: 'ml' },
  { id: 'coconut', name: 'Coconut', common_names: 'coconut', category: 'Fruits', added_at: new Date().toISOString(), calories: 354, protein: 3.3, carbs: 15, fat: 33, serving_size: 100, serving_unit: 'g' },
  { id: 'banana', name: 'Banana', common_names: 'banana,bananas', category: 'Fruits', added_at: new Date().toISOString(), calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3, serving_size: 100, serving_unit: 'g' },
  { id: 'kiwi', name: 'Kiwi', common_names: 'kiwi,kiwifruit', category: 'Fruits', added_at: new Date().toISOString(), calories: 41, protein: 0.8, carbs: 10, fat: 0.4, serving_size: 100, serving_unit: 'g' },
  { id: 'plum', name: 'Plum', common_names: 'plum,plums', category: 'Fruits', added_at: new Date().toISOString(), calories: 46, protein: 0.7, carbs: 11, fat: 0.3, serving_size: 100, serving_unit: 'g' },
  { id: 'apricot', name: 'Apricot', common_names: 'apricot,apricots', category: 'Fruits', added_at: new Date().toISOString(), calories: 48, protein: 1.4, carbs: 11, fat: 0.4, serving_size: 100, serving_unit: 'g' },
  { id: 'fig', name: 'Fig', common_names: 'fig,figs', category: 'Fruits', added_at: new Date().toISOString(), calories: 74, protein: 0.8, carbs: 19, fat: 0.3, serving_size: 100, serving_unit: 'g' },
  { id: 'date', name: 'Date', common_names: 'date,dates', category: 'Fruits', added_at: new Date().toISOString(), calories: 282, protein: 2.5, carbs: 75, fat: 0.4, serving_size: 100, serving_unit: 'g' },
  { id: 'apricot', name: 'Apricot', common_names: 'apricot,apricots', category: 'Fruits', added_at: new Date().toISOString(), calories: 48, protein: 1.4, carbs: 11, fat: 0.4, serving_size: 100, serving_unit: 'g' },
  { id: 'passion-fruit', name: 'Passion Fruit', common_names: 'passion fruit', category: 'Fruits', added_at: new Date().toISOString(), calories: 97, protein: 2.2, carbs: 23, fat: 0.4, serving_size: 100, serving_unit: 'g' },
  { id: 'guava', name: 'Guava', common_names: 'guava', category: 'Fruits', added_at: new Date().toISOString(), calories: 68, protein: 2.6, carbs: 14, fat: 1, serving_size: 100, serving_unit: 'g' },
  { id: 'papaya', name: 'Papaya', common_names: 'papaya', category: 'Fruits', added_at: new Date().toISOString(), calories: 43, protein: 0.5, carbs: 11, fat: 0.3, serving_size: 100, serving_unit: 'g' },
  { id: 'persimmon', name: 'Persimmon', common_names: 'persimmon', category: 'Fruits', added_at: new Date().toISOString(), calories: 81, protein: 0.6, carbs: 18, fat: 0.3, serving_size: 100, serving_unit: 'g' },
  { id: 'pomegranate', name: 'Pomegranate', common_names: 'pomegranate', category: 'Fruits', added_at: new Date().toISOString(), calories: 83, protein: 1.7, carbs: 19, fat: 1.2, serving_size: 100, serving_unit: 'g' },
  { id: 'starfruit', name: 'Starfruit', common_names: 'starfruit', category: 'Fruits', added_at: new Date().toISOString(), calories: 31, protein: 1, carbs: 7, fat: 0.3, serving_size: 100, serving_unit: 'g' },
  { id: 'dragonfruit', name: 'Dragonfruit', common_names: 'dragonfruit', category: 'Fruits', added_at: new Date().toISOString(), calories: 60, protein: 1.2, carbs: 13, fat: 0, serving_size: 100, serving_unit: 'g' },
  { id: 'lychee', name: 'Lychee', common_names: 'lychee', category: 'Fruits', added_at: new Date().toISOString(), calories: 66, protein: 0.8, carbs: 17, fat: 0.4, serving_size: 100, serving_unit: 'g' },
  { id: 'jackfruit', name: 'Jackfruit', common_names: 'jackfruit', category: 'Fruits', added_at: new Date().toISOString(), calories: 95, protein: 1.7, carbs: 23, fat: 0.6, serving_size: 100, serving_unit: 'g' },
  { id: 'durian', name: 'Durian', common_names: 'durian', category: 'Fruits', added_at: new Date().toISOString(), calories: 147, protein: 1.5, carbs: 27, fat: 5, serving_size: 100, serving_unit: 'g' },
  { id: 'rambutan', name: 'Rambutan', common_names: 'rambutan', category: 'Fruits', added_at: new Date().toISOString(), calories: 68, protein: 0.9, carbs: 16, fat: 0.2, serving_size: 100, serving_unit: 'g' },
  { id: 'sapote', name: 'Sapote', common_names: 'sapote', category: 'Fruits', added_at: new Date().toISOString(), calories: 124, protein: 1.5, carbs: 32, fat: 0.4, serving_size: 100, serving_unit: 'g' },
  { id: 'tamarind', name: 'Tamarind', common_names: 'tamarind', category: 'Fruits', added_at: new Date().toISOString(), calories: 239, protein: 2.8, carbs: 63, fat: 0.6, serving_size: 100, serving_unit: 'g' },
  { id: 'mulberry', name: 'Mulberry', common_names: 'mulberry', category: 'Fruits', added_at: new Date().toISOString(), calories: 43, protein: 1.4, carbs: 10, fat: 0.4, serving_size: 100, serving_unit: 'g' },
  { id: 'gooseberry', name: 'Gooseberry', common_names: 'gooseberry', category: 'Fruits', added_at: new Date().toISOString(), calories: 44, protein: 1, carbs: 10, fat: 0.6, serving_size: 100, serving_unit: 'g' },
  { id: 'currant', name: 'Currant', common_names: 'currant', category: 'Fruits', added_at: new Date().toISOString(), calories: 56, protein: 1.4, carbs: 13, fat: 0.2, serving_size: 100, serving_unit: 'g' },
  { id: 'elderberry', name: 'Elderberry', common_names: 'elderberry', category: 'Fruits', added_at: new Date().toISOString(), calories: 73, protein: 0.7, carbs: 18, fat: 0.5, serving_size: 100, serving_unit: 'g' },
  { id: 'cranberry', name: 'Cranberry', common_names: 'cranberry', category: 'Fruits', added_at: new Date().toISOString(), calories: 46, protein: 0.4, carbs: 12, fat: 0.1, serving_size: 100, serving_unit: 'g' },
  { id: 'blackberry', name: 'Blackberry', common_names: 'blackberry,blackberries', category: 'Fruits', added_at: new Date().toISOString(), calories: 43, protein: 1.4, carbs: 10, fat: 0.5, serving_size: 100, serving_unit: 'g' },
  { id: 'raspberry', name: 'Raspberry', common_names: 'raspberry,raspberries', category: 'Fruits', added_at: new Date().toISOString(), calories: 52, protein: 1.2, carbs: 12, fat: 0.7, serving_size: 100, serving_unit: 'g' },
  { id: 'boysenberry', name: 'Boysenberry', common_names: 'boysenberry', category: 'Fruits', added_at: new Date().toISOString(), calories: 50, protein: 1, carbs: 12, fat: 0.3, serving_size: 100, serving_unit: 'g' },
  { id: 'loganberry', name: 'Loganberry', common_names: 'loganberry', category: 'Fruits', added_at: new Date().toISOString(), calories: 28, protein: 1.5, carbs: 5.9, fat: 0.3, serving_size: 100, serving_unit: 'g' },
  { id: 'cloudberry', name: 'Cloudberry', common_names: 'cloudberry', category: 'Fruits', added_at: new Date().toISOString(), calories: 51, protein: 2.4, carbs: 8, fat: 0.8, serving_size: 100, serving_unit: 'g' },
  { id: 'salmonberry', name: 'Salmonberry', common_names: 'salmonberry', category: 'Fruits', added_at: new Date().toISOString(), calories: 50, protein: 1, carbs: 12, fat: 0.3, serving_size: 100, serving_unit: 'g' },
  { id: 'huckleberry', name: 'Huckleberry', common_names: 'huckleberry', category: 'Fruits', added_at: new Date().toISOString(), calories: 37, protein: 0.4, carbs: 9, fat: 0.2, serving_size: 100, serving_unit: 'g' },
  { id: 'lingonberry', name: 'Lingonberry', common_names: 'lingonberry', category: 'Fruits', added_at: new Date().toISOString(), calories: 50, protein: 0.8, carbs: 11, fat: 0.2, serving_size: 100, serving_unit: 'g' },
  { id: 'rowanberry', name: 'Rowanberry', common_names: 'rowanberry', category: 'Fruits', added_at: new Date().toISOString(), calories: 81, protein: 1.4, carbs: 20, fat: 0.5, serving_size: 100, serving_unit: 'g' },
  { id: 'serviceberry', name: 'Serviceberry', common_names: 'serviceberry', category: 'Fruits', added_at: new Date().toISOString(), calories: 80, protein: 1.3, carbs: 18, fat: 0.5, serving_size: 100, serving_unit: 'g' },
  { id: 'saskatoon', name: 'Saskatoon', common_names: 'saskatoon', category: 'Fruits', added_at: new Date().toISOString(), calories: 85, protein: 1.2, carbs: 18, fat: 0.5, serving_size: 100, serving_unit: 'g' },
  { id: 'goji-berry', name: 'Goji Berry', common_names: 'goji berry', category: 'Fruits', added_at: new Date().toISOString(), calories: 349, protein: 14, carbs: 77, fat: 0.4, serving_size: 100, serving_unit: 'g' },
  { id: 'acai', name: 'Acai', common_names: 'acai', category: 'Fruits', added_at: new Date().toISOString(), calories: 70, protein: 1.2, carbs: 4, fat: 5, serving_size: 100, serving_unit: 'g' },
  { id: 'elderflower', name: 'Elderflower', common_names: 'elderflower', category: 'Flowers', added_at: new Date().toISOString(), calories: 73, protein: 0.7, carbs: 18, fat: 0.5, serving_size: 100, serving_unit: 'g' },
  { id: 'rose', name: 'Rose', common_names: 'rose', category: 'Flowers', added_at: new Date().toISOString(), calories: 162, protein: 3.3, carbs: 38, fat: 0.4, serving_size: 100, serving_unit: 'g' },
  { id: 'hibiscus', name: 'Hibiscus', common_names: 'hibiscus', category: 'Flowers', added_at: new Date().toISOString(), calories: 37, protein: 0.4, carbs: 9, fat: 0.2, serving_size: 100, serving_unit: 'g' },
  { id: 'dandelion', name: 'Dandelion', common_names: 'dandelion', category: 'Flowers', added_at: new Date().toISOString(), calories: 45, protein: 2.7, carbs: 9, fat: 0.7, serving_size: 100, serving_unit: 'g' },
  { id: 'chamomile', name: 'Chamomile', common_names: 'chamomile', category: 'Flowers', added_at: new Date().toISOString(), calories: 1, protein: 0, carbs: 0.2, fat: 0, serving_size: 100, serving_unit: 'g' },
  { id: 'lavender', name: 'Lavender', common_names: 'lavender', category: 'Flowers', added_at: new Date().toISOString(), calories: 49, protein: 4, carbs: 11, fat: 1, serving_size: 100, serving_unit: 'g' },
  { id: 'marigold', name: 'Marigold', common_names: 'marigold', category: 'Flowers', added_at: new Date().toISOString(), calories: 23, protein: 1.8, carbs: 4, fat: 0.3, serving_size: 100, serving_unit: 'g' },
  { id: 'nasturtium', name: 'Nasturtium', common_names: 'nasturtium', category: 'Flowers', added_at: new Date().toISOString(), calories: 28, protein: 2.1, carbs: 5, fat: 0.3, serving_size: 100, serving_unit: 'g' },
  { id: 'violet', name: 'Violet', common_names: 'violet', category: 'Flowers', added_at: new Date().toISOString(), calories: 44, protein: 1.1, carbs: 10, fat: 0.2, serving_size: 100, serving_unit: 'g' },
  { id: 'zucchini-flower', name: 'Zucchini Flower', common_names: 'zucchini flower', category: 'Flowers', added_at: new Date().toISOString(), calories: 12, protein: 1.2, carbs: 2, fat: 0.1, serving_size: 100, serving_unit: 'g' },
  { id: 'pumpkin-flower', name: 'Pumpkin Flower', common_names: 'pumpkin flower', category: 'Flowers', added_at: new Date().toISOString(), calories: 16, protein: 1.2, carbs: 3, fat: 0.1, serving_size: 100, serving_unit: 'g' },
  { id: 'banana-flower', name: 'Banana Flower', common_names: 'banana flower', category: 'Flowers', added_at: new Date().toISOString(), calories: 51, protein: 1.6, carbs: 9.9, fat: 0.6, serving_size: 100, serving_unit: 'g' },
  { id: 'artichoke', name: 'Artichoke', common_names: 'artichoke', category: 'Vegetables', added_at: new Date().toISOString(), calories: 47, protein: 3.3, carbs: 11, fat: 0.2, serving_size: 100, serving_unit: 'g' },
  { id: 'asparagus', name: 'Asparagus', common_names: 'asparagus', category: 'Vegetables', added_at: new Date().toISOString(), calories: 20, protein: 2.2, carbs: 3.9, fat: 0.1, serving_size: 100, serving_unit: 'g' },
  { id: 'beetroot', name: 'Beetroot', common_names: 'beetroot,beet', category: 'Vegetables', added_at: new Date().toISOString(), calories: 43, protein: 1.6, carbs: 10, fat: 0.2, serving_size: 100, serving_unit: 'g' },
  { id: 'bok-choy', name: 'Bok Choy', common_names: 'bok choy', category: 'Vegetables', added_at: new Date().toISOString(), calories: 13, protein: 1.5, carbs: 2.2, fat: 0.2, serving_size: 100, serving_unit: 'g' },
  { id: 'brussels-sprouts', name: 'Brussels Sprouts', common_names: 'brussels sprouts', category: 'Vegetables', added_at: new Date().toISOString(), calories: 43, protein: 3.4, carbs: 9, fat: 0.3, serving_size: 100, serving_unit: 'g' },
  { id: 'cabbage', name: 'Cabbage', common_names: 'cabbage', category: 'Vegetables', added_at: new Date().toISOString(), calories: 25, protein: 1.3, carbs: 6, fat: 0.1, serving_size: 100, serving_unit: 'g' },
  { id: 'cauliflower', name: 'Cauliflower', common_names: 'cauliflower', category: 'Vegetables', added_at: new Date().toISOString(), calories: 25, protein: 1.9, carbs: 5, fat: 0.3, serving_size: 100, serving_unit: 'g' },
  { id: 'celery', name: 'Celery', common_names: 'celery', category: 'Vegetables', added_at: new Date().toISOString(), calories: 16, protein: 0.7, carbs: 3, fat: 0.2, serving_size: 100, serving_unit: 'g' },
  { id: 'chard', name: 'Chard', common_names: 'chard,swiss chard', category: 'Vegetables', added_at: new Date().toISOString(), calories: 19, protein: 1.8, carbs: 3.7, fat: 0.2, serving_size: 100, serving_unit: 'g' },
  { id: 'collard-greens', name: 'Collard Greens', common_names: 'collard greens', category: 'Vegetables', added_at: new Date().toISOString(), calories: 32, protein: 3, carbs: 6, fat: 0.6, serving_size: 100, serving_unit: 'g' },
  { id: 'endive', name: 'Endive', common_names: 'endive', category: 'Vegetables', added_at: new Date().toISOString(), calories: 17, protein: 1.3, carbs: 3.4, fat: 0.2, serving_size: 100, serving_unit: 'g' },
  { id: 'fennel', name: 'Fennel', common_names: 'fennel', category: 'Vegetables', added_at: new Date().toISOString(), calories: 31, protein: 1.2, carbs: 7, fat: 0.2, serving_size: 100, serving_unit: 'g' },
  { id: 'kale', name: 'Kale', common_names: 'kale', category: 'Vegetables', added_at: new Date().toISOString(), calories: 49, protein: 4.3, carbs: 9, fat: 0.9, serving_size: 100, serving_unit: 'g' },
  { id: 'leek', name: 'Leek', common_names: 'leek,leeks', category: 'Vegetables', added_at: new Date().toISOString(), calories: 61, protein: 1.5, carbs: 14, fat: 0.3, serving_size: 100, serving_unit: 'g' },
  { id: 'okra', name: 'Okra', common_names: 'okra', category: 'Vegetables', added_at: new Date().toISOString(), calories: 33, protein: 2, carbs: 7, fat: 0.2, serving_size: 100, serving_unit: 'g' },
  { id: 'parsnip', name: 'Parsnip', common_names: 'parsnip', category: 'Vegetables', added_at: new Date().toISOString(), calories: 75, protein: 1.2, carbs: 18, fat: 0.3, serving_size: 100, serving_unit: 'g' },
  { id: 'radish', name: 'Radish', common_names: 'radish,radishes', category: 'Vegetables', added_at: new Date().toISOString(), calories: 16, protein: 0.7, carbs: 3.4, fat: 0.1, serving_size: 100, serving_unit: 'g' },
  { id: 'rutabaga', name: 'Rutabaga', common_names: 'rutabaga', category: 'Vegetables', added_at: new Date().toISOString(), calories: 37, protein: 1.1, carbs: 9, fat: 0.2, serving_size: 100, serving_unit: 'g' },
  { id: 'turnip', name: 'Turnip', common_names: 'turnip,turnips', category: 'Vegetables', added_at: new Date().toISOString(), calories: 28, protein: 0.9, carbs: 6, fat: 0.1, serving_size: 100, serving_unit: 'g' },
  { id: 'watercress', name: 'Watercress', common_names: 'watercress', category: 'Vegetables', added_at: new Date().toISOString(), calories: 11, protein: 2.3, carbs: 1.3, fat: 0.1, serving_size: 100, serving_unit: 'g' },
  { id: 'yam', name: 'Yam', common_names: 'yam', category: 'Vegetables', added_at: new Date().toISOString(), calories: 118, protein: 1.5, carbs: 28, fat: 0.2, serving_size: 100, serving_unit: 'g' },
  { id: 'sweet-potato', name: 'Sweet Potato', common_names: 'sweet potato,yam,sweet yam', category: 'Vegetables', added_at: new Date().toISOString(), calories: 86, protein: 1.6, carbs: 20, fat: 0.1, serving_size: 100, serving_unit: 'g' },
  { id: 'broccoli', name: 'Broccoli', common_names: 'broccoli,broccoli florets', category: 'Vegetables', added_at: new Date().toISOString(), calories: 34, protein: 2.8, carbs: 6.6, fat: 0.4, serving_size: 100, serving_unit: 'g' },
  { id: 'spinach', name: 'Spinach', common_names: 'spinach,baby spinach,spinach leaves', category: 'Vegetables', added_at: new Date().toISOString(), calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, serving_size: 100, serving_unit: 'g' },
  { id: 'quinoa', name: 'Quinoa', common_names: 'quinoa,quinoa grain', category: 'Grains', added_at: new Date().toISOString(), calories: 120, protein: 4.4, carbs: 21.3, fat: 1.9, serving_size: 100, serving_unit: 'g' },
  { id: 'brown-rice', name: 'Brown Rice', common_names: 'brown rice,whole grain rice', category: 'Grains', added_at: new Date().toISOString(), calories: 112, protein: 2.6, carbs: 23.5, fat: 0.9, serving_size: 100, serving_unit: 'g' },
  { id: 'salmon', name: 'Salmon', common_names: 'salmon,salmon fillet,atlantic salmon', category: 'Fish', added_at: new Date().toISOString(), calories: 208, protein: 22, carbs: 0, fat: 13, serving_size: 100, serving_unit: 'g' },
  { id: 'chicken-breast', name: 'Chicken Breast', common_names: 'chicken breast,chicken fillet,chicken meat', category: 'Meat', added_at: new Date().toISOString(), calories: 165, protein: 31, carbs: 0, fat: 3.6, serving_size: 100, serving_unit: 'g' },
  { id: 'almonds', name: 'Almonds', common_names: 'almonds,almond nuts', category: 'Nuts', added_at: new Date().toISOString(), calories: 579, protein: 21.2, carbs: 21.7, fat: 49.9, serving_size: 100, serving_unit: 'g' },
  { id: 'banana', name: 'Banana', common_names: 'banana,bananas', category: 'Fruits', added_at: new Date().toISOString(), calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3, serving_size: 100, serving_unit: 'g' },
  { id: 'greek-yogurt', name: 'Greek Yogurt', common_names: 'greek yogurt,strained yogurt', category: 'Dairy', added_at: new Date().toISOString(), calories: 59, protein: 10.3, carbs: 3.6, fat: 0.4, serving_size: 100, serving_unit: 'g' }
];

// Initialize database with common ingredients
export const initializeCommonIngredients = async () => {
  try {
    await clearIngredients();
    await initDatabase();
    
    // Add all common ingredients if they don't exist
    const initialIngredients: Ingredient[] = commonIngredients;

    for (const ingredient of initialIngredients) {
      await insertIngredient(ingredient);
    }
  } catch (error) {
    console.error('Error initializing common ingredients:', error);
  }
};

export const searchCommonIngredients = async (query: string): Promise<Ingredient[]> => {
  try {
    return await searchIngredients(query);
  } catch (error) {
    console.error('Error searching ingredients:', error);
    return [];
  }
};

export const getCommonIngredientById = async (id: string): Promise<Ingredient | undefined> => {
  try {
    const ingredient = await getIngredientById(id);
    return ingredient || undefined;
  } catch (error) {
    console.error('Error getting ingredient by ID:', error);
    return undefined;
  }
};

export const getAllCommonIngredients = async (): Promise<Ingredient[]> => {
  try {
    return await getAllIngredients();
  } catch (error) {
    console.error('Error getting all ingredients:', error);
    return [];
  }
}; 