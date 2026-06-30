// Routes d'administration : gestion des comptes valideurs et de leurs
// affectations aux catégories de formulaires. Toutes ces routes sont
// réservées au rôle 'admin' (équipe informatique).

const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../db/pool');
const { requireAuth } = require('../middleware/requireAuth');
const { requireRole } = require('../middleware/requireRole');
const { generateToken, hashToken, getExpiryDate, PASSWORD_SETUP_TTL_HOURS } = require('../utils/tokens');
const { sendPasswordSetupEmail } = require('../utils/mailer');

const router = express.Router();

// Tous les endpoints de ce router nécessitent un utilisateur connecté avec le rôle 'admin'
router.use(requireAuth, requireRole('admin'));

// ---------------------------------------------------------------
// GET /api/admin/validators — Liste des valideurs
// ---------------------------------------------------------------
router.get('/validators', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.status, u.role, u.created_at
       FROM users u WHERE u.role = 'valideur' ORDER BY u.created_at DESC`
    );

    return res.json({ validators: result.rows });
  } catch (err) {
    console.error('[admin/validators] Erreur :', err);
    return res.status(500).json({ error: 'Une erreur est survenue, veuillez réessayer.' });
  }
});

// ---------------------------------------------------------------
// POST /api/admin/validators — Créer un nouveau valideur
// ---------------------------------------------------------------
router.post(
  '/validators',
  [
    body('firstName').trim().notEmpty().withMessage('Le prénom est requis.'),
    body('lastName').trim().notEmpty().withMessage('Le nom est requis.'),
    body('email').trim().isEmail().withMessage('Adresse e-mail invalide.'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { firstName, lastName, email } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    try {
      // Vérifier que l'e-mail n'existe pas déjà
      const existing = await pool.query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
      if (existing.rows.length > 0) {
        return res.status(409).json({ error: 'Un compte existe déjà avec cette adresse e-mail.' });
      }

      // Créer le compte valideur (sans mot de passe, un token sera envoyé)
      const userResult = await pool.query(
        `INSERT INTO users (first_name, last_name, email, password_hash, status, role)
         VALUES ($1, $2, $3, '', 'active', 'valideur') RETURNING id`,
        [firstName.trim(), lastName.trim(), normalizedEmail]
      );

      const userId = userResult.rows[0].id;

      // Générer un token pour la configuration du mot de passe
      const token = generateToken();
      const tokenHash = hashToken(token);
      const expiresAt = getExpiryDate(PASSWORD_SETUP_TTL_HOURS);

      await pool.query(
        `INSERT INTO password_setup_tokens (user_id, token_hash, expires_at)
         VALUES ($1, $2, $3)`,
        [userId, tokenHash, expiresAt]
      );

      // Envoyer l'e-mail avec le lien de configuration
      const setupUrl = `${process.env.PUBLIC_BASE_URL}/setup-password?token=${token}`;
      await sendPasswordSetupEmail(normalizedEmail, setupUrl);

      return res.status(201).json({
        message: 'Valideur créé avec succès. Un e-mail de configuration a été envoyé.',
        validator: { id: userId, firstName, lastName, email: normalizedEmail },
      });
    } catch (err) {
      console.error('[admin/create-validator] Erreur :', err);
      return res.status(500).json({ error: 'Une erreur est survenue, veuillez réessayer.' });
    }
  }
);

// ---------------------------------------------------------------
// POST /api/admin/validators/:userId/categories — Associer un valideur à une catégorie
// ---------------------------------------------------------------
router.post(
  '/validators/:userId/categories',
  [body('categoryKey').trim().notEmpty().withMessage('La clé de catégorie est requise.')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { categoryKey } = req.body;
    const { userId } = req.params;

    try {
      // Vérifier que l'utilisateur est un valideur
      const userResult = await pool.query('SELECT id FROM users WHERE id = $1 AND role = $2', [
        userId,
        'valideur',
      ]);
      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: 'Valideur non trouvé.' });
      }

      // Vérifier que l'association n'existe pas déjà
      const existing = await pool.query(
        'SELECT id FROM validator_categories WHERE user_id = $1 AND category_key = $2',
        [userId, categoryKey]
      );
      if (existing.rows.length > 0) {
        return res.status(409).json({ error: 'Cette association existe déjà.' });
      }

      await pool.query(
        `INSERT INTO validator_categories (user_id, category_key)
         VALUES ($1, $2)`,
        [userId, categoryKey]
      );

      return res.status(201).json({
        message: 'Catégorie associée avec succès.',
        association: { userId, categoryKey },
      });
    } catch (err) {
      console.error('[admin/assign-category] Erreur :', err);
      return res.status(500).json({ error: 'Une erreur est survenue, veuillez réessayer.' });
    }
  }
);

// ---------------------------------------------------------------
// GET /api/admin/validators/:userId/categories — Liste des catégories d'un valideur
// ---------------------------------------------------------------
router.get('/validators/:userId/categories', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT category_key FROM validator_categories WHERE user_id = $1`,
      [req.params.userId]
    );

    return res.json({ categories: result.rows.map((row) => row.category_key) });
  } catch (err) {
    console.error('[admin/validator-categories] Erreur :', err);
    return res.status(500).json({ error: 'Une erreur est survenue, veuillez réessayer.' });
  }
});

// ---------------------------------------------------------------
// DELETE /api/admin/validators/:userId/categories/:categoryKey — Retirer une catégorie
// ---------------------------------------------------------------
router.delete('/validators/:userId/categories/:categoryKey', async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM validator_categories WHERE user_id = $1 AND category_key = $2 RETURNING *`,
      [req.params.userId, req.params.categoryKey]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Association non trouvée.' });
    }

    return res.json({ message: 'Catégorie retirée avec succès.' });
  } catch (err) {
    console.error('[admin/remove-category] Erreur :', err);
    return res.status(500).json({ error: 'Une erreur est survenue, veuillez réessayer.' });
  }
});

// ---------------------------------------------------------------
// GET /api/admin/requests — Liste de toutes les demandes (pour les stats)
// ---------------------------------------------------------------
router.get('/requests', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.id, r.reference, r.category_key, r.form_key, r.title, r.status, r.created_at,
              u.first_name, u.last_name, u.email as user_email
       FROM requests r
       JOIN users u ON r.user_id = u.id
       ORDER BY r.created_at DESC`
    );

    return res.json({ requests: result.rows });
  } catch (err) {
    console.error('[admin/all-requests] Erreur :', err);
    return res.status(500).json({ error: 'Une erreur est survenue, veuillez réessayer.' });
  }
});

module.exports = router;
