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

const readline = require('readline');
const argon2 = require('argon2');
const { query } = require('./pool');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function createAdmin() {
  console.log('\n=== Création du compte administrateur ===\n');

  try {
    const email = await ask('E-mail: ');
    const firstName = await ask('Prénom: ');
    const lastName = await ask('Nom: ');
    const password = await ask('Mot de passe: ');
    const confirmPassword = await ask('Confirmer le mot de passe: ');

    if (password !== confirmPassword) {
      console.error('\n[ERREUR] Les mots de passe ne correspondent pas.');
      rl.close();
      process.exit(1);
    }

    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 1
    });

    await query(
      `INSERT INTO users (email, first_name, last_name, password_hash, role, email_verified)
       VALUES ($1, $2, $3, $4, 'admin', TRUE)`,
      [email, firstName, lastName, passwordHash]
    );

    console.log('\n[SUCCESS] Compte administrateur créé !');
    console.log(`E-mail: ${email}`);
    console.log(`Nom: ${firstName} ${lastName}`);

    rl.close();
    process.exit(0);
  } catch (err) {
    console.error('\n[ERREUR]:', err.message);
    rl.close();
    process.exit(1);
  }
}

createAdmin();
