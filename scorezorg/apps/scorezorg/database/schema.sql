-- Create the database (run this as a superuser)
-- CREATE DATABASE scorezorg;

-- Connect to the scorezorg database and run the following:

-- Create leagues table
CREATE TABLE IF NOT EXISTS leagues (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(100) UNIQUE NOT NULL,
    content JSONB
);

INSERT INTO leagues (slug, content) 
VALUES 
    ('test-league', '{}')
ON CONFLICT (slug) DO NOTHING;
