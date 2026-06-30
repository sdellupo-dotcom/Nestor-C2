// Génération et vérification des tokens à usage unique (vérification
// d'e-mail, réinitialisation de mot de passe).
//
// Principe : on génère un token aléatoire, on l'envoie en clair par e-mail,
// mais on ne stocke en base QUE son empreinte (hash SHA-256). Ainsi, même
// en cas de fuite de la base de données, les tokens ne sont pas exploitables
// directement — il faudrait déjà connaître le token original.

const crypto = require('crypto');

const TOKEN_BYTES = 32; // 256 bits, largement suffisant
const EMAIL_VERIFICATION_TTL_HOURS = 48;
const PASSWORD_RESET_TTL_HOURS = 2; // plus court : action sensible
const PASSWORD_SETUP_TTL_HOURS = 72; // un peu plus long : le valideur peut ne pas consulter ses mails tout de suite

function generateToken() {
  return crypto.randomBytes(TOKEN_BYTES).toString('hex');
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function getExpiryDate(hoursFromNow) {
  return new Date(Date.now() + hoursFromNow * 60 * 60 * 1000);
}

module.exports = {
  generateToken,
  hashToken,
  getExpiryDate,
  EMAIL_VERIFICATION_TTL_HOURS,
  PASSWORD_RESET_TTL_HOURS,
  PASSWORD_SETUP_TTL_HOURS,
};
