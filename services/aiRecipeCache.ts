import AsyncStorage from '@react-native-async-storage/async-storage';
import { Recipe } from '../types';

// Global state manager for AI recipe cache with persistence
// This allows other parts of the app to signal when AI recipes should be regenerated

const CACHE_KEY = 'ai_recipe_cache';
const INVALIDATION_KEY = 'ai_recipe_invalidation';

class AIRecipeCacheManager {
  private listeners: (() => void)[] = [];
  private shouldRegenerate = false;
  private cachedRecipes: Recipe[] = [];
  private initialized = false;

  // Initialize cache from storage
  async initialize() {
    if (this.initialized) return;
    
    try {
      // Load invalidation flag
      const invalidationFlag = await AsyncStorage.getItem(INVALIDATION_KEY);
      this.shouldRegenerate = invalidationFlag === 'true';
      
      // Load cached recipes
      const cachedData = await AsyncStorage.getItem(CACHE_KEY);
      if (cachedData) {
        this.cachedRecipes = JSON.parse(cachedData);
        console.log('📋 Loaded', this.cachedRecipes.length, 'cached AI recipes from storage');
      }
      
      this.initialized = true;
    } catch (error) {
      console.error('Error initializing AI recipe cache:', error);
      this.initialized = true;
    }
  }

  // Called when an ingredient is added to the pantry
  async invalidateCache() {
    console.log('🔄 AI Recipe cache invalidated - pantry changed');
    this.shouldRegenerate = true;
    await AsyncStorage.setItem(INVALIDATION_KEY, 'true');
    console.log('📝 Invalidation flag saved to storage');
    this.notifyListeners();
  }

  // Check if recipes should be regenerated
  getShouldRegenerate(): boolean {
    console.log('🔍 Checking shouldRegenerate flag:', this.shouldRegenerate);
    return this.shouldRegenerate;
  }

  // Force check invalidation flag from storage (for debugging)
  async checkInvalidationFromStorage(): Promise<boolean> {
    try {
      const invalidationFlag = await AsyncStorage.getItem(INVALIDATION_KEY);
      const shouldRegenerate = invalidationFlag === 'true';
      console.log('📱 Storage invalidation flag:', invalidationFlag, '→', shouldRegenerate);
      return shouldRegenerate;
    } catch (error) {
      console.error('Error checking invalidation from storage:', error);
      return false;
    }
  }

  // Reset the flag after regeneration
  async resetFlag() {
    this.shouldRegenerate = false;
    await AsyncStorage.setItem(INVALIDATION_KEY, 'false');
  }

  // Save recipes to cache
  async saveRecipes(recipes: Recipe[]) {
    this.cachedRecipes = recipes;
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(recipes));
    console.log('💾 Saved', recipes.length, 'AI recipes to cache');
  }

  // Get cached recipes
  getCachedRecipes(): Recipe[] {
    return this.cachedRecipes;
  }

  // Clear all cache
  async clearCache() {
    this.cachedRecipes = [];
    this.shouldRegenerate = false;
    await AsyncStorage.multiRemove([CACHE_KEY, INVALIDATION_KEY]);
    console.log('🗑️ AI recipe cache cleared');
  }

  // Subscribe to cache invalidation events
  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  // Debug method to check current cache state
  debugCacheState() {
    console.log('🐛 Cache Debug State:');
    console.log('  - Initialized:', this.initialized);
    console.log('  - Should regenerate:', this.shouldRegenerate);
    console.log('  - Cached recipes count:', this.cachedRecipes.length);
    console.log('  - Listeners count:', this.listeners.length);
  }
}

export const aiRecipeCacheManager = new AIRecipeCacheManager(); 