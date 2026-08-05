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
  confetti: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l3 7 3-3-2-7z"/><circle cx="17" cy="6" r="1.2" fill="currentColor" stroke="none"/><circle cx="20" cy="11" r="1" fill="currentColor" stroke="none"/><path d="M13 8l4-4M16 13l3-1"/></svg>',
  palette: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a9 7 0 100 14c1 0 1.5-.7 1.5-1.5S13 14 13 13a2 2 0 012-2h2a3 3 0 003-3c0-3-3.5-5-8-5z"/><circle cx="8" cy="10" r="1" fill="currentColor" stroke="none"/><circle cx="8" cy="14" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="8" r="1" fill="currentColor" stroke="none"/></svg>',
  doorEnter: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3h4v18h-4"/><path d="M3 12h11M11 8l3 4-3 4"/></svg>',
  doorExit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3H6v18h4"/><path d="M21 12H10M13 8l-4 4 4 4"/></svg>',
  tag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l8-8h5v5l-8 8z"/><circle cx="13" cy="6" r="1" fill="currentColor" stroke="none"/><path d="M3 11l7 7"/></svg>',
  box: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="7" width="16" height="13" rx="1"/><path d="M4 7l8-4 8 4M12 11v9"/></svg>',
  folder: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h6l2 2h10v11H3z"/></svg>',
  pencil: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4l4 4-9 9H5v-4z"/></svg>',
  droplet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3s6 6.5 6 11a6 6 0 11-12 0c0-4.5 6-11 6-11z"/></svg>',
  stars: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4l1.5 4.5L18 10l-4.5 1.5L12 16l-1.5-4.5L6 10l4.5-1.5z"/></svg>',
  stamp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3h6v6H9z"/><path d="M7 9h10l2 5H5z"/><path d="M3 19h18"/></svg>',
  files: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3h8l4 4v13H7z"/><path d="M5 7v14h12"/></svg>',
  notebook: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3" width="14" height="18" rx="1"/><path d="M9 3v18M5 8h2M5 14h2"/></svg>',
  cut: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="2"/><circle cx="6" cy="18" r="2"/><path d="M8 7.5L20 18M8 16.5L20 6"/></svg>',
  stairs: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20v-4h4v-4h4v-4h4V4h4"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  badgeOff: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 9l6 6M15 9l-6 6"/></svg>',
  key: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="3.5"/><path d="M11 11l9 9M17 14l3-3M14 17l2.5-2.5"/></svg>',
  userPlus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.5"/><path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6"/><path d="M18 8v5M15.5 10.5h5"/></svg>',
  shieldLock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v6c0 5-3 7.5-7 9-4-1.5-7-4-7-9V6z"/><rect x="9.5" y="11" width="5" height="4" rx="0.5"/><path d="M12 11V9.5"/></svg>',
  truckDelivery: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="9" width="10" height="7" rx="1"/><path d="M12 12h4l3 2v2h-7z"/><circle cx="6" cy="18" r="1.3"/><circle cx="16" cy="18" r="1.3"/></svg>',
  mailForward: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="14" height="11" rx="1"/><path d="M3 6l7 5 7-5"/><path d="M18 14l3 2-3 2"/></svg>',
  forklift: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="13" width="6" height="4"/><path d="M9 15h4l3-8M16 7h3l1 4v4h-2"/><circle cx="6" cy="19" r="1.3"/><circle cx="17" cy="19" r="1.3"/></svg>',
  truckLoading: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="9" width="10" height="7" rx="1"/><path d="M12 12h4l3 2v2h-7z"/><path d="M5 6v3M9 6v3"/></svg>',
  armchair: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 12V7a2 2 0 014 0v5M14 12V7a2 2 0 014 0v5"/><path d="M4 12h16v4a2 2 0 01-2 2H6a2 2 0 01-2-2z"/><path d="M6 18v2M18 18v2"/></svg>',
  coffee: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 9h12v5a4 4 0 01-4 4H9a4 4 0 01-4-4z"/><path d="M17 10h2a2 2 0 010 4h-2"/><path d="M8 4c0 1-1 1-1 2M12 4c0 1-1 1-1 2"/></svg>',
  ticket: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9a2 2 0 010 4v3h18v-3a2 2 0 010-4V6H3z"/><path d="M13 6v12"/></svg>',
  presentation: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="11" rx="1"/><path d="M12 15v5M8 20h8M8 8l3 3 2-2 3 3"/></svg>',
  fileText: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3h7l4 4v14H7z"/><path d="M9 12h6M9 16h6"/></svg>',
  filePencil: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3h7l4 4v14H7z"/><path d="M9.5 16.5l1-3 4-4 2 2-4 4z"/></svg>',
  archive: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v11h14V8"/><path d="M10 13h4"/></svg>',
  mailOpened: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-5 9 5v9H3z"/><path d="M3 9l9 5 9-5"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5 9-10"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="1"/><path d="M3 6l9 7 9-7"/></svg>',
  lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="9" rx="1"/><path d="M8 11V7a4 4 0 018 0v4"/></svg>',
  arrowLeft: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>',
  balanceSheet: '<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 94.16 122.88"><defs><style>.cls-1{fill-rule:evenodd;}</style></defs><title>financial-statement</title><path class="cls-1" d="M35,108l-.35,0H6.1a6.12,6.12,0,0,1-4.3-1.8,6,6,0,0,1-1.8-4.3V6.1A6,6,0,0,1,1.8,1.8,6,6,0,0,1,6.1,0H80.57a6.12,6.12,0,0,1,4.29,1.8,6,6,0,0,1,1.81,4.3V63.76L82.33,58.6a5.86,5.86,0,0,0-.82-.83V42.24H5.24v59.85a.81.81,0,0,0,.26.6.77.77,0,0,0,.6.25l26.71-.08a6.17,6.17,0,0,0,1.45,4.21L35,108Zm58.91-16.4L55.63,122.88,39,103.09l2.27-2.48L53.48,115l.15.19a3.24,3.24,0,0,0,4.57.35l1.25-1.08,0,0,5.91-5.16,26-20.72,2.51,3Zm.22-9.3-38.31,31.3L39.21,93.8,77.52,62.51,94.16,82.29ZM71.82,87.14a5.88,5.88,0,1,1-7-4.44,5.88,5.88,0,0,1,7,4.44Zm13.44-2.5L59.71,105.19a3.85,3.85,0,0,0-5.39-.46l-6.58-7.82a3.81,3.81,0,0,0,.46-5.37L73.76,71a3.83,3.83,0,0,0,5.38.46l6.59,7.82a3.83,3.83,0,0,0-.47,5.39ZM70.61,50.8v3.71a.27.27,0,0,1-.28.29H49a.27.27,0,0,1-.28-.29V50.8a.27.27,0,0,1,.28-.29H70.33a.27.27,0,0,1,.28.29Zm-8,9.49V64a.27.27,0,0,1-.29.28H49.05a.27.27,0,0,1-.29-.28V60.29a.27.27,0,0,1,.29-.28h13.3a.31.31,0,0,1,.29.28Zm-34.54-46h5.48a.33.33,0,0,1,.35.35V33.78a.33.33,0,0,1-.35.34H28.1a.32.32,0,0,1-.34-.34V14.64a.32.32,0,0,1,.34-.35Zm12.49,7.28h5.48a.32.32,0,0,1,.35.34v11.8a.33.33,0,0,1-.35.34H40.59a.33.33,0,0,1-.34-.34V21.91a.36.36,0,0,1,.34-.34Zm25,0h5.48a.32.32,0,0,1,.34.34v11.8a.33.33,0,0,1-.34.34H65.59a.33.33,0,0,1-.35-.34V21.91a.37.37,0,0,1,.35-.34Zm-12.5-7.28h5.48a.33.33,0,0,1,.35.35V33.78a.33.33,0,0,1-.35.34H53.09a.33.33,0,0,1-.35-.34V14.64a.33.33,0,0,1,.35-.35ZM15.62,16.92h5.47a.33.33,0,0,1,.35.35V33.78a.33.33,0,0,1-.35.34H15.62a.33.33,0,0,1-.35-.34V17.27c-.07-.21.14-.35.35-.35ZM28.3,66.26l11.63.21a12.42,12.42,0,0,1-5.47,10.32L28.3,66.26Zm-.64-3.56-.14-13.54v-.89l.9.07h0a16.32,16.32,0,0,1,3.21.55,15.36,15.36,0,0,1,2.94,1.16,15.57,15.57,0,0,1,8.28,13l.07.89H42l-13.48-.41H27.8l-.14-.82Zm1.65-.82,11.83.34a14,14,0,0,0-7.32-10.8,14.92,14.92,0,0,0-3.94-1.34c-.24,0-.47-.08-.71-.1l.14,11.9Zm24.4,65.05,31,76.54a13.43,13.43,0,0,1-6.64,1.78,13.28,13.28,0,0,1-.55-26.54l.55,13.27Zm57.11-27.2V6.1a.77.77,0,0,0-.25-.6.81.81,0,0,0-.6-.26H6.1a.78.78,0,0,0-.6.26.66.66,0,0,0-.26.6V37.85Z"/></svg>',
  building: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3" width="14" height="18"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2"/></svg>',
  userCheck: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.5"/><path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6"/><path d="M16 11l2 2 3-3"/></svg>',
  chevronDown: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>',
  chevronRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>',
  send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l18-8-8 18-2-8z"/></svg>',
  infoCircle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v.5M12 11v5"/></svg>'
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
  { key: 'evenementiel', icon: 'confetti', bg: '#ED93B1', fg: '#4B1528' },
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

// Exemple de données pour les formulaires
const categoryForms = {
  'arrivee-depart': {
    title: 'Arrivée/Départ',
    forms: {
      arrivee: {
        title: "Arrivée d'un nouvel agent",
        ref: "ARR",
        icon: 'doorEnter',
        steps: [
          {
            label: "Pré-requis à la demande d'installation",
            title: "Pré-requis à la demande d'installation",
            desc: "Avant de commencer, confirmez les éléments suivants",
            type: 'checklist',
            items: [
              "La date d'arrivée de l'agent est confirmée par le service RH",
              "Le poste de travail (bureau) est identifié et disponible",
              "Le responsable hiérarchique de l'agent est informé"
            ]
          },
          {
            label: "Informations sur l'agent concerné",
            title: "Informations sur l'agent concerné",
            desc: "Renseignez l'identité du nouvel agent",
            type: 'fields',
            fields: [
              { label: "Prénom", req: true },
              { label: "Nom", req: true },
              { label: "E-mail", req: true, type: 'email' },
              { label: "Date d'arrivée", req: true, type: 'date' },
              { label: "Service / direction", req: true },
              { label: "Fonction" }
            ]
          },
          {
            label: "Validation",
            title: "Validation",
            desc: "Vérifiez le récapitulatif avant envoi",
            type: 'summary'
          }
        ]
      }
    }
  }
};

// Fonction pour simuler le bypass d'authentification
function bypassAuth() {
  currentUser = {
    email: "test@culture.gouv.fr",
    firstName: "Test",
    lastName: "Utilisateur",
    role: "admin"
  };
  showScreen('accueil');
  updateUIForAuthState();
}

// Fonction pour afficher un écran
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });
  document.getElementById(`screen-${screenId}`).classList.add('active');
}

// Fonction pour mettre à jour l'UI en fonction de l'état d'authentification
function updateUIForAuthState() {
  if (currentUser) {
    document.getElementById('tab-suivi').style.display = 'block';
  } else {
    document.getElementById('tab-suivi').style.display = 'none';
  }
}

// Initialisation
showScreen('accueil');
