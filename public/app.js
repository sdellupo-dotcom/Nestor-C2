// =============================================================================
// Portail Services Internes - Logique Frontend
// Version nettoyée et adaptée pour le backend Node.js
// =============================================================================

// -----------------------------------------------------------------------------
// État global
// -----------------------------------------------------------------------------
console.log("APP.JS EXECUTE");
let currentUser = null;
let currentCategoryKey = null;
let currentFormKey = null;
let currentStep = 1;
let formData = {};
let submittedRequests = [];

// -----------------------------------------------------------------------------
// Données statiques (icônes, catégories, formulaires)
// -----------------------------------------------------------------------------

// Icônes SVG
const svgIcons = {
  walk: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13" cy="4" r="1.5" fill="currentColor" stroke="none"/><path d="M10.5 21l1.5-5.5-2-1.5.5-4.5 4 1 2 3.5"/><path d="M11 10l-3 1.5L6 14"/><path d="M14 11l2 2 3-1"/></svg>',
  package: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8l9-5 9 5-9 5-9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/></svg>',
  printer: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="9" width="12" height="7" rx="1"/><path d="M6 9V4h12v5"/><path d="M8 16v4h8v-4"/></svg>',
  spray: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3h2l1 3H8l1-3z"/><rect x="7" y="6" width="6" height="15" rx="1.5"/><path d="M16 9l2-1M17 12h2.5M16 15l2 1"/></svg>',
  tool: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a4 4 0 105 5l-3-3-2-2z"/><path d="M9.3 17.7a4 4 0 11-5-5l3 3 2 2z"/><path d="M9.3 9.3l5.4 5.4"/></svg>',
  badge: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3" width="14" height="18" rx="2"/><circle cx="12" cy="10" r="2.5"/><path d="M8 17c.7-1.8 2.2-3 4-3s3.3 1.2 4 3"/></svg>',
  truck: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="8" width="11" height="9" rx="1"/><path d="M13 11h4l3 3v3h-7z"/><circle cx="6" cy="19" r="1.5"/><circle cx="17" cy="19" r="1.5"/></svg>',
  desk: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8h18v3H3z"/><path d="M5 11v9M19 11v9M9 8V5h6v3"/></svg>',
  car: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 16V12l2-4h12l2 4v4"/><path d="M4 16h16"/><circle cx="7.5" cy="16.5" r="1.5"/><circle cx="16.5" cy="16.5" r="1.5"/></svg>',
  confetti: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l3 7 3-3-2-7z"/><circle cx="17" cy="6" r="1.2" fill="currentColor" stroke="none"/><circle cx="20" cy="11" r="1" fill="currentColor" stroke="none"/><path d="M13 8l4-4M16 13l3-1"/></svg>'
};

// Génère le markup d'une icône SVG
function icon(name, extraStyle) {
  const svg = svgIcons[name] || svgIcons.fileText;
  return `<span class="svg-icon" style="${extraStyle || ''}">${svg}</span>`;
}

// Métadonnées des catégories
const categoryMeta = [
  { key: 'arrivee-depart', icon: 'walk', bg: '#9FE1CB', fg: '#085041' },
  { key: 'fournitures', icon: 'package', bg: '#F5C4B3', fg: '#712B13' },
  { key: 'budget', icon: 'balanceSheet', bg: '#B5D4F4', fg: '#0C447C' },
  { key: 'menage', icon: 'spray', bg: '#F4C0D1', fg: '#72243E' },
  { key: 'intervention-technique', icon: 'tool', bg: '#FAC775', fg: '#633806' },
  { key: 'acces-sites', icon: 'badge', bg: '#85B7EB', fg: '#042C53' },
  { key: 'livraison-envoi', icon: 'truck', bg: '#F0997B', fg: '#4A1B0C' },
  { key: 'equipements-bureau', icon: 'desk', bg: '#5DCAA5', fg: '#04342C' },
  { key: 'vehicule', icon: 'car', bg: '#AFA9EC', fg: '#26215C' },
  { key: 'evenementiel', icon: 'confetti', bg: '#ED93B1', fg: '#4B1528' }
];

// Fonction pour vérifier le domaine de l'email
function checkDomain() {
  const email = document.getElementById('su-email').value.trim().toLowerCase();
  const domain = email.split('@')[1];
  const feedback = document.getElementById('domain-feedback');

  if (domain === 'culture.gouv.fr') {
    feedback.innerHTML = '<span class="domain-badge domain-ok">✓ Domaine valide</span>';
  } else if (email.includes('@')) {
    feedback.innerHTML = '<span class="domain-badge domain-bad">✗ Seules les adresses @culture.gouv.fr sont autorisées</span>';
  } else {
    feedback.innerHTML = '';
  }
}

// Fonction pour vérifier la force du mot de passe
function checkStrength() {
  const password = document.getElementById('su-pass').value;
  const seg1 = document.getElementById('seg-1');
  const seg2 = document.getElementById('seg-2');
  const seg3 = document.getElementById('seg-3');

  // Réinitialiser les segments
  seg1.className = 'strength-seg';
  seg2.className = 'strength-seg';
  seg3.className = 'strength-seg';

  if (password.length === 0) return;

  // Appliquer les classes en fonction de la force
  if (password.length >= 8) {
    seg1.classList.add('on-strong');
    if (password.length >= 10 || /[A-Z]/.test(password) || /[0-9]/.test(password)) {
      seg2.classList.add('on-strong');
      if (password.length >= 12 || /[^A-Za-z0-9]/.test(password)) {
        seg3.classList.add('on-strong');
      } else {
        seg2.classList.add('on-mid');
      }
    } else {
      seg1.classList.add('on-weak');
    }
  } else if (password.length >= 4) {
    seg1.classList.add('on-weak');
  }
}

// Fonction pour afficher un écran
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });
  document.getElementById(`screen-${screenId}`).classList.add('active');
}

// Fonction pour afficher un onglet
function showTab(tabId) {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.remove('active');
  });
  document.getElementById(`tab-${tabId}`).classList.add('active');

  document.querySelectorAll('.body-area').forEach(area => {
    area.style.display = 'none';
  });
  document.getElementById(`${tabId}-tab-view`).style.display = 'block';
}

// Fonction pour afficher une vue de connexion
function showLoginView(viewId) {
  document.querySelectorAll('.login-view').forEach(view => {
    view.classList.remove('active');
  });
  document.getElementById(`view-${viewId}`).classList.add('active');
}

// Fonction pour afficher une vue de connexion (version réelle)
function showLoginViewReal(viewId) {
  showLoginView(viewId);
}

// Fonction pour simuler le bypass d'authentification
async function bypassAuth() {
  try {
    const response = await fetch('/api/auth/bypass', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('[bypassAuth] Erreur :', error);
      alert(error.error || "Impossible d'activer le bypass.");
      return;
    }

    const { user } = await response.json();
    currentUser = user;
    showScreen('accueil');
    updateUIForAuthState();
    alert("Bypass activé ! Vous êtes connecté en mode test.");
  } catch (err) {
    console.error('[bypassAuth] Erreur réseau :', err);
    alert("Erreur réseau. Vérifiez que le serveur est en ligne.");
  }
}

// Fonction pour mettre à jour l'UI en fonction de l'état d'authentification
function updateUIForAuthState() {
  if (currentUser) {
    document.getElementById('tab-suivi').style.display = 'block';
  } else {
    document.getElementById('tab-suivi').style.display = 'none';
  }
}

// Fonction pour vérifier l'état de connexion
async function checkAuth() {
  try {
    const response = await fetch('/api/auth/me', {
      credentials: 'include',
    });

    if (response.ok) {
      const { authenticated, email, role } = await response.json();
      if (authenticated) {
        currentUser = { email, role };
        updateUIForAuthState();
      }
    }
  } catch (err) {
    console.error('[checkAuth] Erreur :', err);
  }
}

// Fonction pour charger les catégories
function loadCategories() {
  const catGrid = document.getElementById('cat-grid');
  catGrid.innerHTML = '';

  categoryMeta.forEach(category => {
    const card = document.createElement('div');
    card.className = 'cat-card';
    card.innerHTML = `
      <div class="cat-header" data-category="${category.key}">
        <div class="cat-header-left">
          <div class="cat-icon" style="background: ${category.bg}; color: ${category.fg};">
            ${icon(category.icon)}
          </div>
          <div class="cat-name">${category.title}</div>
        </div>
        <span class="chevron">▼</span>
      </div>
      <div class="cat-body"></div>
    `;
    catGrid.appendChild(card);

    // Ajouter les écouteurs pour ouvrir/fermer les catégories
    card.querySelector('.cat-header').addEventListener('click', () => {
      card.classList.toggle('open');
    });
  });

  // Charger les formulaires pour chaque catégorie
  loadForms();
}

// Fonction pour charger les formulaires
function loadForms() {
  // Exemple simplifié : à adapter avec tes données réelles
  const formMenuGrid = document.getElementById('form-menu-grid');
  if (formMenuGrid) {
    formMenuGrid.innerHTML = '';
    // Logique pour charger les formulaires...
  }
}

// Fonction pour filtrer les catégories
function filterCategories() {
  const searchTerm = document.getElementById('search-input').value.toLowerCase();
  const categories = document.querySelectorAll('.cat-card');

  categories.forEach(card => {
    const categoryName = card.querySelector('.cat-name').textContent.toLowerCase();
    if (categoryName.includes(searchTerm)) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });

  // Afficher/masquer le message "Aucun résultat"
  const noResults = document.getElementById('no-results');
  const visibleCategories = Array.from(categories).filter(card => card.style.display !== 'none');
  noResults.style.display = visibleCategories.length === 0 ? 'block' : 'none';
}

// Fonction pour filtrer les catégories (appelée depuis le bouton Rechercher)
function filterCategoriesReal() {
  filterCategories();
}

// Fonction pour revenir au menu des formulaires
function backToMenu() {
  showScreen('accueil');
}

// Fonction pour passer à l'étape précédente
function prevStep() {
  if (currentStep > 1) {
    currentStep--;
    updateWizardUI();
  }
}

// Fonction pour passer à l'étape suivante
function nextStep() {
  if (currentStep < totalSteps) {
    currentStep++;
    updateWizardUI();
  }
}

// Fonction pour mettre à jour l'UI du wizard
function updateWizardUI() {
  document.getElementById('step-num').textContent = currentStep;
}

// Initialisation
showScreen('accueil');
checkAuth();

// =============================================================================
// Écouteurs d'événements (pour éviter les inline handlers bloqués par CSP)
// =============================================================================
document.addEventListener('DOMContentLoaded', () => {
  // --- Authentification ---
  // Bypass
  const bypassBtn = document.getElementById('bypass-auth-btn');
  if (bypassBtn) bypassBtn.addEventListener('click', bypassAuth);

  // Connexion
  const loginBtn = document.getElementById('login-btn');
  if (loginBtn) loginBtn.addEventListener('click', trySubmitLogin);

  // Inscription
  const signupBtn = document.getElementById('signup-btn');
  if (signupBtn) signupBtn.addEventListener('click', () => showLoginViewReal('signup'));

  // Mot de passe oublié
  const forgotPasswordBtn = document.getElementById('forgot-password-btn');
  if (forgotPasswordBtn) forgotPasswordBtn.addEventListener('click', () => showLoginViewReal('forgot'));

  // Envoyer lien de réinitialisation
  const sendResetBtn = document.getElementById('send-reset-btn');
  if (sendResetBtn) sendResetBtn.addEventListener('click', trySubmitForgot);

  // Retour à la connexion (depuis "Mot de passe oublié")
  const backToLoginFromForgot = document.getElementById('back-to-login-from-forgot');
  if (backToLoginFromForgot) backToLoginFromForgot.addEventListener('click', () => showLoginViewReal('login'));

  // Retour à la connexion (depuis "E-mail envoyé")
  const backToLoginFromSuccess = document.getElementById('back-to-login-from-success');
  if (backToLoginFromSuccess) backToLoginFromSuccess.addEventListener('click', () => showLoginViewReal('login'));

  // Retour à l'inscription (depuis "Domaine rejeté")
  const backToSignupBtn = document.getElementById('back-to-signup-btn');
  if (backToSignupBtn) backToSignupBtn.addEventListener('click', () => showLoginViewReal('signup'));

  // Modifier l'e-mail (depuis "Vérifiez votre boîte mail")
  const modifyEmailBtn = document.getElementById('modify-email-btn');
  if (modifyEmailBtn) modifyEmailBtn.addEventListener('click', () => showLoginViewReal('signup'));

  // Simuler le clic sur le lien (depuis "Vérifiez votre boîte mail")
  const simulateVerificationBtn = document.getElementById('simulate-verification-btn');
  if (simulateVerificationBtn) simulateVerificationBtn.addEventListener('click', () => showLoginViewReal('activated'));

  // Aller à la connexion (depuis "Compte activé")
  const goToLoginBtn = document.getElementById('go-to-login-btn');
  if (goToLoginBtn) goToLoginBtn.addEventListener('click', () => showLoginViewReal('login'));

  // Créer un compte (depuis la vue signup)
  const createAccountBtn = document.getElementById('create-account-btn');
  if (createAccountBtn) createAccountBtn.addEventListener('click', trySubmitSignup);

  // Retour à la connexion (depuis la vue signup)
  const backToLoginFromSignup = document.getElementById('back-to-login-from-signup');
  if (backToLoginFromSignup) backToLoginFromSignup.addEventListener('click', () => showLoginViewReal('login'));

  // --- Vérification en temps réel ---
  // Vérification du domaine (email)
  const suEmail = document.getElementById('su-email');
  if (suEmail) suEmail.addEventListener('input', checkDomain);

  // Vérification de la force du mot de passe
  const suPass = document.getElementById('su-pass');
  if (suPass) suPass.addEventListener('input', checkStrength);

  // --- Recherche ---
  // Bouton de recherche
  const searchBtn = document.getElementById('search-btn');
  if (searchBtn) searchBtn.addEventListener('click', filterCategoriesReal);

  // Champ de recherche
  const searchInput = document.getElementById('search-input');
  if (searchInput) searchInput.addEventListener('input', filterCategories);

  // --- Onglets ---
  const tabAccueil = document.getElementById('tab-accueil');
  if (tabAccueil) tabAccueil.addEventListener('click', () => showTab('accueil'));

  const tabSuivi = document.getElementById('tab-suivi');
  if (tabSuivi) tabSuivi.addEventListener('click', () => showTab('suivi'));

  // --- Wizard (formulaires) ---
  // Bouton "Précédent"
  const btnPrev = document.getElementById('btn-prev');
  if (btnPrev) btnPrev.addEventListener('click', prevStep);

  // Bouton "Suivant"
  const btnNext = document.getElementById('btn-next');
  if (btnNext) btnNext.addEventListener('click', nextStep);

  // Retour aux formulaires (depuis le wizard)
  const heroBack = document.getElementById('hero-back');
  if (heroBack) heroBack.addEventListener('click', backToMenu);

  // Charger les catégories au démarrage
  loadCategories();
});
