// Script à exécuter une seule fois en ligne de commande sur le serveur,
// pour créer le tout premier compte administrateur. Volontairement un
// script CLI plutôt qu'une route API : exposer un endpoint HTTP capable de
// créer un compte admin, même temporairement ou avec un "secret" codé en
// dur, serait une faille de sécurité — alors qu'un script lancé directement
// sur le serveur suppose déjà un accès de confiance (SSH, console).
//
// Usage :
//   node src/db/create-admin.js prenom.nom@mon-domaine.com "Prénom" "Nom"
// Le mot de passe est demandé de façon interactive (jamais en argument de
// commande, pour éviter qu'il se retrouve dans l'historique du shell).

require('dotenv').config();
const readline = require('readline');
const argon2 = require('argon2');
const { pool } = require('./pool');

function promptHidden(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    // Masque la saisie à l'écran (approche simple : pas de vraie astérisque,
    // mais évite au minimum l'affichage en clair du mot de passe tapé).
    const stdin = process.stdin;
    process.stdout.write(question);
    let password = '';
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');
    stdin.on('data', function handler(char) {
      char = char.toString();
      if (char === '\n' || char === '\r' || char === '\u0004') {
        stdin.setRawMode(false);
        stdin.pause();
        stdin.removeListener('data', handler);
        process.stdout.write('\n');
        rl.close();
        resolve(password);
      } else if (char === '\u0003') {
        process.exit(1); // Ctrl+C
      } else if (char === '\u007f') {
        password = password.slice(0, -1); // backspace
      } else {
        password += char;
      }
    });
  });
}

async function main() {
  const [email, firstName, lastName] = process.argv.slice(2);

  if (!email || !firstName || !lastName) {
    console.error(
      'Usage : node src/db/create-admin.js <email> <prénom> <nom>\n' +
      'Exemple : node src/db/create-admin.js camille.renard@mon-domaine.com Camille Renard'
    );
    process.exit(1);
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existing = await pool.query('SELECT id, role FROM users WHERE email = $1', [normalizedEmail]);
  if (existing.rows.length > 0) {
    console.error(
      `Un compte existe déjà avec l'adresse ${normalizedEmail} (rôle actuel : ${existing.rows[0].role}). ` +
      'Ce script ne modifie pas les comptes existants — utilisez directement la base si besoin.'
    );
    await pool.end();
    process.exit(1);
  }

  const password = await promptHidden('Mot de passe pour ce compte administrateur : ');
  if (password.length < 8) {
    console.error('Le mot de passe doit contenir au moins 8 caractères.');
    await pool.end();
    process.exit(1);
  }
  const passwordConfirm = await promptHidden('Confirmez le mot de passe : ');
  if (password !== passwordConfirm) {
    console.error('Les mots de passe ne correspondent pas.');
    await pool.end();
    process.exit(1);
  }

  const passwordHash = await argon2.hash(password, { type: argon2.argon2id });

  await pool.query(
    `INSERT INTO users (first_name, last_name, email, password_hash, status, role)
     VALUES ($1, $2, $3, $4, 'active', 'admin')`,
    [firstName.trim(), lastName.trim(), normalizedEmail, passwordHash]
  );

  console.log(`Compte administrateur créé avec succès pour ${normalizedEmail}.`);
  await pool.end();
}

main().catch(async (err) => {
  console.error('Erreur lors de la création du compte administrateur :', err.message);
  await pool.end();
  process.exit(1);
});
