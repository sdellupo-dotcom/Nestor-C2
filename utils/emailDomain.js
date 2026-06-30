// Validation du domaine e-mail autorisé pour la création de compte.
// Reprend exactement la logique validée ensemble : comparaison stricte
// sur la partie après le @, insensible à la casse.

const ALLOWED_DOMAINS = (process.env.ALLOWED_EMAIL_DOMAIN || '')
  .split(',')
  .map((d) => d.trim().toLowerCase())
  .filter(Boolean);

function isAllowedDomain(email) {
  if (ALLOWED_DOMAINS.length === 0) {
    console.warn(
      "[avertissement] ALLOWED_EMAIL_DOMAIN n'est pas configuré — " +
      "la vérification de domaine est désactivée. À renseigner dans .env une fois " +
      "le domaine autorisé communiqué par le service informatique."
    );
    return true; // Par défaut, tout est autorisé (pour le développement)
  }

  const domain = email.split('@')[1];
  if (!domain) return false;

  return ALLOWED_DOMAINS.includes(domain.toLowerCase());
}

module.exports = { isAllowedDomain };
