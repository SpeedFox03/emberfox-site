export interface Project {
  id: string;
  category: string;
  title: string;
  desc: string;
  stack: string[];
  year: string;
  url: string;
  brief: string;
  approach: string;
  delivered: string[];
  photos: string[];
  photoDescriptions: string[];
}

export const projects: Project[] = [{
  id: 'moment-d-art',
  category: 'Sites Web',
  title: 'Moment D. Art',
  desc: 'Un site vitrine pour Arno Momin, artisan peintre : présentation des prestations, galerie de réalisations et formulaire de devis.',
  stack: ['Astro', 'CSS', 'Netlify'],
  year: '2025',
  url: 'https://www.momentdart.be',
  brief: 'Présenter le travail d’un artisan peintre et permettre aux visiteurs de découvrir ses prestations avant de prendre contact pour leur chantier.',
  approach: 'Une structure organisée autour des services de peinture et de décoration, avec une place importante donnée aux réalisations et un accès au formulaire de devis.',
  delivered: ['Présentation de l’activité et des prestations', 'Pages consacrées à la peinture, aux enduits décoratifs et aux revêtements', 'Galerie de réalisations', 'Formulaire de demande de devis', 'Présentation adaptée au mobile et à l’ordinateur'],
  photos: Array.from({ length: 8 }, (_, i) => `/images/projects/moment-d-art/${String(i + 1).padStart(2, '0')}.png`),
  photoDescriptions: Array.from({ length: 8 }, () => 'Capture du site Moment D. Art, artisan peintre : présentation des prestations et des réalisations'),
}];
