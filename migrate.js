// Applique le schéma de base de données (src/db/schema.sql) sur la base
// configurée dans DATABASE_URL. À lancer une seule fois lors de la mise
// en place du serveur : npm run migrate

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('./pool');

async function migrate() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  console.log('Application du schéma sur la base de données...');
  try {
    await pool.query(schemaSql);
    console.log('Schéma appliqué avec succès.');
  } catch (err) {
    console.error('Échec de la migration :', err.message);
    console.error(
      'Si les tables existent déjà, c\'est probablement normal — ' +
      'ce script est pensé pour une base vide. Vérifiez avant de relancer.'
    );
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

migrate();
