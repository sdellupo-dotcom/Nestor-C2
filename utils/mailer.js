// Envoi d'e-mails via le serveur SMTP interne fourni par le service
// informatique. Toutes les valeurs de connexion viennent de .env —
// aucune information de connexion n'est codée en dur ici.

const nodemailer = require('nodemailer');

// Configuration du transporteur SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true', // true pour 465, false pour les autres ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  tls: {
    // Ne pas rejeter les certificats auto-signés (pour les environnements internes)
    rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED !== 'true',
  },
});

// Vérifie la connexion SMTP au démarrage
async function verifySmtpConnection() {
  try {
    await transporter.verify();
    console.log('[mailer] Connexion SMTP vérifiée avec succès.');
  } catch (err) {
    console.error('[mailer] Échec de la vérification SMTP :', err.message);
    console.error(
      'Vérifiez les variables SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD dans .env.'
    );
  }
}

// Envoie un e-mail de vérification
async function sendVerificationEmail(email, verificationUrl) {
  const subject = 'Vérifiez votre adresse e-mail — Portail Services Internes';
  const html = `
    <p>Bonjour,</p>
    <p>Pour activer votre compte sur le Portail Services Internes, cliquez sur le lien ci-dessous :</p>
    <p><a href="${verificationUrl}">${verificationUrl}</a></p>
    <p>Ce lien expirera dans 48 heures.</p>
    <p>Si vous n'avez pas demandé la création de ce compte, ignorez cet e-mail.</p>
  `;

  await transporter.sendMail({
    from: `"Portail Services Internes" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to: email,
    subject,
    html,
  });

  console.log(`[mailer] E-mail de vérification envoyé à ${email}`);
}

// Envoie un e-mail de réinitialisation de mot de passe
async function sendPasswordResetEmail(email, resetUrl) {
  const subject = 'Réinitialisez votre mot de passe — Portail Services Internes';
  const html = `
    <p>Bonjour,</p>
    <p>Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le lien ci-dessous pour définir un nouveau mot de passe :</p>
    <p><a href="${resetUrl}">${resetUrl}</a></p>
    <p>Ce lien expirera dans 2 heures.</p>
    <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet e-mail.</p>
  `;

  await transporter.sendMail({
    from: `"Portail Services Internes" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to: email,
    subject,
    html,
  });

  console.log(`[mailer] E-mail de réinitialisation envoyé à ${email}`);
}

// Envoie un e-mail de configuration de mot de passe (pour les valideurs créés par l'admin)
async function sendPasswordSetupEmail(email, setupUrl) {
  const subject = 'Configurez votre mot de passe — Portail Services Internes';
  const html = `
    <p>Bonjour,</p>
    <p>Un compte valideur a été créé pour vous. Cliquez sur le lien ci-dessous pour définir votre mot de passe :</p>
    <p><a href="${setupUrl}">${setupUrl}</a></p>
    <p>Ce lien expirera dans 72 heures.</p>
    <p>Si vous n'attendiez pas ce compte, contactez votre administrateur.</p>
  `;

  await transporter.sendMail({
    from: `"Portail Services Internes" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to: email,
    subject,
    html,
  });

  console.log(`[mailer] E-mail de configuration envoyé à ${email}`);
}

module.exports = {
  transporter,
  verifySmtpConnection,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendPasswordSetupEmail,
};
