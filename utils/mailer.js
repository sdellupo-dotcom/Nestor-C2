// Envoi d'e-mails via le serveur SMTP interne fourni par le service informatique.
// Toutes les valeurs de connexion viennent de .env — aucune information de connexion n'est codée en dur ici.

const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

// Charger les templates depuis le dossier templates/
const templatesDir = path.join(__dirname, '../templates');
const templates = {
  verifyEmail: handlebars.compile(fs.readFileSync(path.join(templatesDir, 'verify-email.html'), 'utf8')),
  resetPassword: handlebars.compile(fs.readFileSync(path.join(templatesDir, 'reset-password.html'), 'utf8')),
  requestSubmitted: handlebars.compile(fs.readFileSync(path.join(templatesDir, 'request-submitted.html'), 'utf8')),
  requestStatus: handlebars.compile(fs.readFileSync(path.join(templatesDir, 'request-status.html'), 'utf8')),
};

// Configurer le transporteur SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Fonction pour vérifier la configuration SMTP
function checkSMTPConfig() {
  const requiredVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASSWORD'];
  return requiredVars.every(varName => process.env[varName]);
}

// Fonction générique pour envoyer un email avec un template
async function sendEmail(to, subject, templateName, data) {
  if (!checkSMTPConfig()) {
    console.log(`[MAILER] SMTP non configuré. Destinataire: ${to}, Sujet: ${subject}`);
    return false;
  }

  const template = templates[templateName];
  if (!template) {
    console.error(`[MAILER] Template ${templateName} non trouvé.`);
    return false;
  }

  try {
    const html = template(data);
    const text = stripHtmlTags(html); // Version texte pour l'accessibilité

    await transporter.sendMail({
      from: `"Portail Services Internes" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      text,
    });

    console.log(`[MAILER] Email envoyé à ${to} avec le template ${templateName}.`);
    return true;
  } catch (err) {
    console.error(`[MAILER] Erreur lors de l'envoi à ${to}:`, err.message);
    return false;
  }
}

// Fonction pour extraire le texte d'un HTML (supprime les balises)
function stripHtmlTags(html) {
  return html
    .replace(/<script.*?>.*?<\/script>/gi, '')
    .replace(/<style.*?>.*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Fonction pour envoyer un email de vérification de compte
async function sendVerificationEmail(email, firstName, lastName, verificationUrl) {
  return sendEmail(
    email,
    'Vérifiez votre adresse email @culture.gouv.fr',
    'verifyEmail',
    { firstName, lastName, verificationUrl }
  );
}

// Fonction pour envoyer un email de réinitialisation de mot de passe
async function sendPasswordResetEmail(email, resetUrl) {
  return sendEmail(
    email,
    'Réinitialisez votre mot de passe',
    'resetPassword',
    { email, resetUrl }
  );
}

// Fonction pour envoyer un email de confirmation de soumission de demande
async function sendRequestSubmittedEmail(email, firstName, lastName, request, portalUrl) {
  return sendEmail(
    email,
    `Votre demande [Réf: ${request.reference}] a été envoyée`,
    'requestSubmitted',
    { firstName, lastName, portalUrl, ...request }
  );
}

// Fonction pour envoyer un email de notification de statut de demande
async function sendRequestStatusEmail(email, firstName, lastName, request, status, reason = null) {
  const statusText = status === 'validated' ? 'Validée' : 'Rejetée';
  return sendEmail(
    email,
    `Votre demande [Réf: ${request.reference}] a été ${statusText.toLowerCase()}`,
    'requestStatus',
    { firstName, lastName, status, statusText, reason, ...request }
  );
}

// Exporter les fonctions
module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendRequestSubmittedEmail,
  sendRequestStatusEmail,
  checkSMTPConfig,
  verifySmtpConnection: async () => {
    try {
      await transporter.verify();
      console.log('[MAILER] ✅ Connexion SMTP vérifiée avec succès.');
      return true;
    } catch (err) {
      console.error('[MAILER] ❌ Erreur de connexion SMTP :', err.message);
      return false;
    }
  },
};
