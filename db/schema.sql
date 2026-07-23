-- Extensions utiles
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),

    CONSTRAINT users_status_check
        CHECK (status IN ('pending', 'active', 'disabled')),

    CONSTRAINT users_role_check
        CHECK (role IN ('user', 'valideur', 'admin'))
);

CREATE INDEX IF NOT EXISTS idx_users_email
ON users(email);


-- Tokens de validation email
CREATE TABLE IF NOT EXISTS email_verifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_verifications_token
ON email_verifications(token_hash);


-- Tokens de configuration initiale du mot de passe valideur
CREATE TABLE IF NOT EXISTS password_setup_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_password_setup_tokens_token
ON password_setup_tokens(token_hash);


-- Catégories associées aux valideurs
CREATE TABLE IF NOT EXISTS validator_categories (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_key VARCHAR(100) NOT NULL,

    UNIQUE(user_id, category_key)
);


-- Demandes des agents
CREATE TABLE IF NOT EXISTS requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    reference VARCHAR(50) NOT NULL UNIQUE,
    category_key VARCHAR(100) NOT NULL,
    form_key VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,

    data JSONB NOT NULL DEFAULT '{}'::jsonb,

    status VARCHAR(30) NOT NULL DEFAULT 'en_cours',

    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);


CREATE INDEX IF NOT EXISTS idx_requests_user_id
ON requests(user_id);


CREATE INDEX IF NOT EXISTS idx_requests_status
ON requests(status);


-- Sessions Express PostgreSQL (connect-pg-simple)
CREATE TABLE IF NOT EXISTS session (
    sid VARCHAR NOT NULL PRIMARY KEY,
    sess JSON NOT NULL,
    expire TIMESTAMP(6) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_session_expire
ON session(expire);
