CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    avatar_type VARCHAR(20) DEFAULT 'default',
    avatar_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tasks (
    id VARCHAR(50) PRIMARY KEY, -- Frontend ID (Date.now()) ishlatiladi
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    category VARCHAR(50),
    completed BOOLEAN DEFAULT FALSE,
    pinned BOOLEAN DEFAULT FALSE,
    flagged BOOLEAN DEFAULT FALSE,
    notes TEXT,
    due_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE subtasks (
    id SERIAL PRIMARY KEY,
    task_id VARCHAR(50) REFERENCES tasks(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Auto-update updated_at for tasks
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_task_modtime BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE PROCEDURE update_modified_column();