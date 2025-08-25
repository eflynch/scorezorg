import { Pool } from 'pg';

// Create a connection pool
const pool = new Pool({
  // Use DATABASE_URL if available (preferred for production)
  connectionString: process.env.DATABASE_URL,
  // Fallback to individual environment variables
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'scorezorg',
  password: process.env.DB_PASSWORD || 'password',
  port: parseInt(process.env.DB_PORT || '5432'),
  // Production optimizations
  max: process.env.NODE_ENV === 'production' ? 10 : 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  // SSL configuration for production
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Helper function to execute queries
export const query = async (text: string, params?: unknown[]) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Helper function to get a client from the pool (for transactions)
export const getClient = () => {
  return pool.connect();
};

// Close the pool (useful for testing or when shutting down)
export const closePool = () => {
  return pool.end();
};

export default pool;
