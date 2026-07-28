// Applique le schéma de base de données (src/db/schema.sql) sur la base
// configurée dans DATABASE_URL. À lancer une seule fois lors de la mise
// en place du serveur : npm run migrate

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { query } = require('./pool');

const schemaSQL = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

async function migrate() {
  console.log('[MIGRATE] Début de la migration...');

  try {
    const { rows } = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'users'
      ) as exists;
    `);

    if (rows[0].exists) {
      console.log('[MIGRATE] La base de données existe déjà. Migration annulée.');
      process.exit(0);
    }

    const queries = schemaSQL
      .split(';')
      .map(q => q.trim())
      .filter(q => q.length > 0);

    for (const q of queries) {
      await query(q);
    }

    console.log('[MIGRATE] Migration terminée avec succès !');
    process.exit(0);
  } catch (err) {
    console.error('[MIGRATE] Erreur:', err.message);
    process.exit(1);
  }
}

migrate();
