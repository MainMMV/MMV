
import { neon } from '@neondatabase/serverless';

/**
 * Saves the entire application state to Neon Database.
 * Uses an "Upsert" (Insert or Update) strategy on a single row identified by 'current_state'.
 */
export const saveToNeon = async (connectionString: string, jsonData: any) => {
    try {
        const sql = neon(connectionString);
        
        // Ensure table exists (just in case, though usually done manually)
        await sql`CREATE TABLE IF NOT EXISTS app_state (
            id SERIAL PRIMARY KEY,
            key_name TEXT UNIQUE NOT NULL,
            data JSONB NOT NULL,
            updated_at TIMESTAMP DEFAULT NOW()
        )`;

        // Upsert the data
        await sql`
            INSERT INTO app_state (key_name, data, updated_at)
            VALUES ('current_state', ${jsonData}::jsonb, NOW())
            ON CONFLICT (key_name) 
            DO UPDATE SET 
                data = EXCLUDED.data,
                updated_at = NOW();
        `;
        
        return { success: true };
    } catch (error) {
        console.error("Neon Save Error:", error);
        return { success: false, error };
    }
};

/**
 * Loads the application state from Neon Database.
 */
export const loadFromNeon = async (connectionString: string) => {
    try {
        const sql = neon(connectionString);
        
        const result = await sql`
            SELECT data FROM app_state WHERE key_name = 'current_state' LIMIT 1
        `;

        if (result && result.length > 0) {
            return { success: true, data: result[0].data };
        }
        
        return { success: false, error: 'No data found' };
    } catch (error) {
        console.error("Neon Load Error:", error);
        return { success: false, error };
    }
};
