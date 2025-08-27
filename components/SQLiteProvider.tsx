import React, { createContext, useContext, useEffect, useState } from 'react';
import { initDatabase } from '../services/database';
import { getRecipeCount } from '../services/recipeStorage';
import { populateCommonRecipes } from '../services/recipeDownloader';

// Create context
export const SQLiteContext = createContext<{
  isReady: boolean;
  error: Error | null;
}>({
  isReady: false,
  error: null,
});

// Custom hook to use SQLite context
export const useSQLite = () => useContext(SQLiteContext);

// Provider component
export function SQLiteProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        await initDatabase();
        const count = await getRecipeCount();
        if (count === 0) {
          await populateCommonRecipes(500); // Fill with 500 common recipes
        }
        setIsReady(true);
      } catch (err) {
        console.error('Failed to initialize database:', err);
        setError(err as Error);
      }
    };

    initializeDatabase();
  }, []);

  return (
    <SQLiteContext.Provider value={{ isReady, error }}>
      {children}
    </SQLiteContext.Provider>
  );
} 