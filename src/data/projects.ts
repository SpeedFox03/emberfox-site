export interface Project {
  id: string;
  category: string;
  title: string;
  desc: string;
  stack: string[];
  year: string;
  photos: string[];
}

export const projects: Project[] = [
  {
    category: 'Applications',
    title: 'Event Flow',
    desc: "Application de billetterie en ligne - creation d'evenements, vente de billets, QR codes de validation et gestion des participants.",
    stack: ['React', 'Node.js', 'Stripe', 'PostgreSQL'],
    year: '2025',
    id: 'event-flow',
    photos: [],
  },
  {
    category: 'Sites Web',
    title: 'Moment D. Art',
    desc: 'Site vitrine haut de gamme pour Arno Momin, artisan peintre. Peinture interieure/exterieure, enduits decoratifs, revetement de sol - galerie de realisations, 6 pages de services, formulaire de devis.',
    stack: ['Astro', 'CSS', 'Netlify'],
    year: '2025',
    id: 'moment-d-art',
    photos: [
      '/images/projects/moment-d-art/01.png',
      '/images/projects/moment-d-art/02.png',
      '/images/projects/moment-d-art/03.png',
      '/images/projects/moment-d-art/04.png',
      '/images/projects/moment-d-art/05.png',
      '/images/projects/moment-d-art/06.png',
      '/images/projects/moment-d-art/07.png',
      '/images/projects/moment-d-art/08.png',
    ],
  },
  {
    category: 'Applications',
    title: 'Roue de fortune Twitch',
    desc: 'Mini roue de fortune interactive pour un streamer Twitch - segments personnalisables en direct, animations fluides, prete pour overlay OBS.',
    stack: ['JavaScript', 'Canvas API', 'CSS'],
    year: '2025',
    id: 'roue-fortune',
    photos: [],
  },
  {
    category: 'Montage PC',
    title: 'Build Gaming Full Corsair',
    desc: 'Montage PC gaming haut de gamme - RTX 5080, Ryzen 7 7800X3D, full Corsair. Cablage soigne, eclairage ARGB synchronise via iCUE.',
    stack: ['RTX 5080', 'Ryzen 7 7800X3D', 'Corsair', 'Windows 11'],
    year: '2025',
    id: 'build-gaming',
    photos: [],
  },
  {
    category: 'Applications',
    title: 'Devis & More',
    desc: 'Application de creation et gestion de devis pour les professionnels du batiment - multi-corps de metier, calcul automatique, export PDF.',
    stack: ['React', 'Node.js', 'PDFKit', 'PostgreSQL'],
    year: '2026',
    id: 'devis-more',
    photos: [],
  },
  {
    category: 'Depannage',
    title: 'Migration PC a domicile',
    desc: "Accompagnement complet au changement de PC - migration des donnees, profils utilisateur, logiciels et preferences d'un ordinateur a l'autre.",
    stack: ['Windows', 'Backup & Restore', 'Migration'],
    year: '2025',
    id: 'migration-pc',
    photos: [],
  },
];
