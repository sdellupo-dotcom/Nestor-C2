// Connexion centralisée à PostgreSQL.
// Tous les autres fichiers du projet importent "pool" depuis ici
// plutôt que de créer chacun leur propre connexion.

const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  throw new Error(
    "La variable d'environnement DATABASE_URL est manquante. " +
    "Avez-vous bien copié .env.example vers .env et renseigné les valeurs ?"
  );
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // En environnement interne avec certificat auto-signé, il peut être
  // nécessaire d'ajuster cette option selon la configuration du service
  // informatique. À adapter avec eux si la connexion échoue en SSL.
  ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  console.error('[postgres] Erreur inattendue sur une connexion inactive du pool :', err);
});

module.exports = { pool };
