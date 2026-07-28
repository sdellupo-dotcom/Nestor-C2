// Génération et vérification des tokens à usage unique (vérification
// d'e-mail, réinitialisation de mot de passe).
//
// Principe : on génère un token aléatoire, on l'envoie en clair par e-mail,
// mais on ne stocke en base QUE son empreinte (hash SHA-256). Ainsi, même
// en cas de fuite de la base de données, les tokens ne sont pas exploitables
// directement — il faudrait déjà connaître le token original.

const crypto = require('crypto');

function generateToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

function generateEmailVerificationToken() {
  return generateToken(32);
}

function generatePasswordResetToken() {
  return generateToken(32);
}

module.exports = {
  generateToken,
  generateEmailVerificationToken,
  generatePasswordResetToken,
};
