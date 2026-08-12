// Validation du domaine e-mail autorisé pour la création de compte.
// Reprend exactement la logique validée ensemble : comparaison stricte
// sur la partie après le @, insensible à la casse.

const ALLOWED_DOMAINS = (process.env.ALLOWED_EMAIL_DOMAIN || 'culture.gouv.fr')
  .split(',')
  .map((d) => d.trim().toLowerCase())
  .filter(Boolean);

function isAllowedDomain(email) {
  if (process.env.ALLOWED_EMAIL_DOMAIN === undefined) {
    console.warn(
      "[avertissement] ALLOWED_EMAIL_DOMAIN non défini dans l'environnement — " +
      "utilisation du domaine par défaut culture.gouv.fr."
    );
  }

  const domain = email.split('@')[1];
  if (!domain) return false;

  return ALLOWED_DOMAINS.includes(domain.toLowerCase());
}

module.exports = { isAllowedDomain };
