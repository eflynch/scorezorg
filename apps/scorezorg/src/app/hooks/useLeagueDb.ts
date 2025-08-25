import { useCallback, useEffect, useState } from "react";

const DB_NAME = 'league-db';
const DB_VERSION = 1;
const STORE_NAME = 'leagues';

// Type for league entries in IndexedDB
interface LeagueEntry {
    key: string;
    title: string;
    lastVisited: string;
}

/**
 * Helper function to open IndexedDB and ensure the object store exists
 */
const openDatabase = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onerror = () => reject(request.error);
        
        request.onsuccess = () => {
            const db = request.result;
            
            // Check if the object store exists
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                // If store doesn't exist, we need to upgrade the database
                db.close();
                
                // Delete and recreate the database to force an upgrade
                const deleteRequest = indexedDB.deleteDatabase(DB_NAME);
                deleteRequest.onsuccess = () => {
                    // Retry opening with upgrade
                    const retryRequest = indexedDB.open(DB_NAME, DB_VERSION);
                    retryRequest.onerror = () => reject(retryRequest.error);
                    retryRequest.onsuccess = () => resolve(retryRequest.result);
                    retryRequest.onupgradeneeded = (event) => {
                        const newDb = (event.target as IDBOpenDBRequest).result;
                        newDb.createObjectStore(STORE_NAME);
                    };
                };
                deleteRequest.onerror = () => reject(deleteRequest.error);
            } else {
                resolve(db);
            }
        };
        
        // Handle database creation/upgrade
        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            
            // Create the object store if it doesn't exist
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
    });
};

/**
 * Helper function to perform database operations with proper error handling
 */
const performDbOperation = async <T>(
    mode: IDBTransactionMode,
    operation: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> => {
    const db = await openDatabase();
    const transaction = db.transaction(STORE_NAME, mode);
    const store = transaction.objectStore(STORE_NAME);
    
    return new Promise((resolve, reject) => {
        const request = operation(store);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

export const useLeagueDb = () => {
    const [leagues, setLeagues] = useState<LeagueEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load leagues on mount
    useEffect(() => {
        const loadLeagues = async () => {
            try {
                setIsLoading(true);
                setError(null);
                
                const allEntries = await performDbOperation('readonly', (store) => 
                    store.getAll()
                );
                
                // Filter out any null or invalid entries
                const validEntries = (allEntries as LeagueEntry[]).filter(
                    entry => entry && typeof entry === 'object' && entry.key
                );
                
                setLeagues(validEntries);
            } catch (err) {
                console.error('Failed to load league entries:', err);
                setError('Failed to load saved leagues');
                setLeagues([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadLeagues();
    }, []);

    const addOrUpdateLeague = useCallback(async (key: string, title: string): Promise<void> => {
        try {
            const entry: LeagueEntry = {
                key,
                title,
                lastVisited: new Date().toISOString()
            };

            await performDbOperation('readwrite', (store) => 
                store.put(entry, key)
            );
            
            // Update local state
            setLeagues(prev => {
                const existing = prev.find(league => league.key === key);
                if (existing) {
                    // Update existing entry
                    return prev.map(league => 
                        league.key === key ? entry : league
                    );
                } else {
                    // Add new entry
                    return [...prev, entry];
                }
            });
        } catch (err) {
            console.error('Failed to save league:', err);
            throw new Error('Failed to save league');
        }
    }, []);

    const removeLeague = useCallback(async (key: string): Promise<void> => {
        try {
            await performDbOperation('readwrite', (store) => 
                store.delete(key)
            );
            
            // Update local state
            setLeagues(prev => prev.filter(league => league.key !== key));
        } catch (err) {
            console.error('Failed to remove league:', err);
            throw new Error('Failed to remove league');
        }
    }, []);

    // Convenience method to get just the keys (for backward compatibility)
    const keys = leagues.filter(league => league && league.key).map(league => league.key);

    return {
        leagues,
        keys, // For backward compatibility
        addOrUpdateLeague,
        removeLeague,
        isLoading,
        error
    };
};