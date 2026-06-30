-- ===================================================================
-- Schéma de base de données — Portail de services internes
-- À exécuter une fois sur la base PostgreSQL vide.
-- Exemple : psql -U portail_user -d portail_services -f schema.sql
-- ===================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto; -- pour gen_random_uuid()

-- ---------------------------------------------------------------
-- Comptes agents
-- ---------------------------------------------------------------
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name      VARCHAR(100) NOT NULL,
  last_name       VARCHAR(100) NOT NULL,
  email           VARCHAR(255) NOT NULL UNIQUE,
  password_hash   VARCHAR(255) NOT NULL,
  status          VARCHAR(20)  NOT NULL DEFAULT 'pending', -- 'pending' | 'active'
  role            VARCHAR(20)  NOT NULL DEFAULT 'agent',    -- 'agent' | 'valideur' | 'admin'
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_status ON users (status);
CREATE INDEX idx_users_role ON users (role);

-- ---------------------------------------------------------------
-- Affectation des valideurs aux catégories de formulaires.
-- Une catégorie correspond à category_key tel qu'utilisé côté front
-- (ex: 'arrivee-depart', 'fournitures'...). Relation many-to-many :
-- un valideur peut couvrir plusieurs catégories, et une catégorie
-- pourrait avoir plusieurs valideurs si besoin un jour.
-- ---------------------------------------------------------------
CREATE TABLE validator_categories (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_key    VARCHAR(50) NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, category_key)
);

CREATE INDEX idx_validator_categories_user ON validator_categories (user_id);
CREATE INDEX idx_validator_categories_category ON validator_categories (category_key);

-- ---------------------------------------------------------------
-- Tokens de mot de passe temporaire pour les comptes créés directement
-- par un administrateur (valideurs) — distinct de email_verifications,
-- qui concerne l'auto-inscription des agents avec vérification de domaine.
-- Le valideur reçoit ce lien par e-mail et doit définir son propre mot de
-- passe au premier accès, plutôt que d'utiliser le mot de passe temporaire
-- généré par l'administrateur indéfiniment.
-- ---------------------------------------------------------------
CREATE TABLE password_setup_tokens (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash      VARCHAR(255) NOT NULL,
  expires_at      TIMESTAMPTZ NOT NULL,
  used_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_password_setup_tokens_user ON password_setup_tokens (user_id);
CREATE INDEX idx_password_setup_tokens_token_hash ON password_setup_tokens (token_hash);

-- ---------------------------------------------------------------
-- Tokens de vérification d'e-mail (lien envoyé à l'inscription)
-- ---------------------------------------------------------------
CREATE TABLE email_verifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash      VARCHAR(255) NOT NULL,
  expires_at      TIMESTAMPTZ NOT NULL,
  used_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_email_verifications_user ON email_verifications (user_id);
CREATE INDEX idx_email_verifications_token_hash ON email_verifications (token_hash);

-- ---------------------------------------------------------------
-- Tokens de réinitialisation de mot de passe ("mot de passe oublié")
-- ---------------------------------------------------------------
CREATE TABLE password_resets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash      VARCHAR(255) NOT NULL,
  expires_at      TIMESTAMPTZ NOT NULL,
  used_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_password_resets_user ON password_resets (user_id);
CREATE INDEX idx_password_resets_token_hash ON password_resets (token_hash);

-- ---------------------------------------------------------------
-- Demandes (tous formulaires confondus)
-- ---------------------------------------------------------------
CREATE TABLE requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reference       VARCHAR(30) NOT NULL UNIQUE,
  category_key    VARCHAR(50) NOT NULL,   -- ex: 'arrivee-depart'
  form_key        VARCHAR(50) NOT NULL,   -- ex: 'arrivee'
  title           VARCHAR(255) NOT NULL,  -- ex: "Arrivée d'un nouvel agent"
  status          VARCHAR(20) NOT NULL DEFAULT 'brouillon',
                  -- 'brouillon' | 'en_cours' | 'traitee' | 'annulee' | 'rejetee'
  data            JSONB NOT NULL DEFAULT '{}'::jsonb, -- réponses du formulaire
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_requests_user ON requests (user_id);
CREATE INDEX idx_requests_status ON requests (status);
CREATE INDEX idx_requests_reference ON requests (reference);

-- ---------------------------------------------------------------
-- Historique des changements de statut sur une demande
-- ---------------------------------------------------------------
CREATE TABLE request_history (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id      UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  previous_status VARCHAR(20),
  new_status      VARCHAR(20) NOT NULL,
  note            TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_request_history_request ON request_history (request_id);

-- ---------------------------------------------------------------
-- Table de sessions pour express-session (via connect-pg-simple)
-- Cette table est aussi créée automatiquement par la librairie au
-- démarrage si elle n'existe pas, mais la créer ici évite un essai
-- d'écriture en base au tout premier lancement.
-- ---------------------------------------------------------------
CREATE TABLE session (
  sid     VARCHAR NOT NULL COLLATE "default",
  sess    JSON    NOT NULL,
  expire  TIMESTAMP(6) NOT NULL
)
WITH (OIDS=FALSE);

ALTER TABLE session ADD CONSTRAINT session_pkey PRIMARY KEY (sid) NOT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX IDX_session_expire ON session (expire);
