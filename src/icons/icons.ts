/**
 * EmberFox — Bibliothèque d'icônes
 * Package : phosphor-astro (npm install phosphor-astro)
 * Poids utilisé : "light" — trait fin, cohérent avec la DA
 *
 * Usage dans un fichier .astro :
 *   import { Globe } from 'phosphor-astro/GlobeLight.astro';
 *   <Globe width={24} height={24} />
 *
 * Toutes les icônes sont en poids "Light" sauf mention contraire.
 * Pour changer le poids : remplacer "Light" par "Thin", "Regular", "Bold", "Fill" ou "Duotone"
 */

// ─────────────────────────────────────────────
// NAVIGATION & UI
// ─────────────────────────────────────────────
export const icons_nav = {
  /** Flèche droite — boutons CTA, liens */
  ArrowRight:       'phosphor-astro/ArrowRightLight.astro',
  /** Flèche haut-droite — lien externe */
  ArrowUpRight:     'phosphor-astro/ArrowUpRightLight.astro',
  /** Chevron bas — dropdowns, accordéons */
  CaretDown:        'phosphor-astro/CaretDownLight.astro',
  /** Chevron droite — breadcrumbs */
  CaretRight:       'phosphor-astro/CaretRightLight.astro',
  /** Menu hamburger — nav mobile */
  List:             'phosphor-astro/ListLight.astro',
  /** Croix fermeture — nav mobile ouverte */
  X:                'phosphor-astro/XLight.astro',
  /** Maison — lien accueil */
  House:            'phosphor-astro/HouseLight.astro',
} as const;

// ─────────────────────────────────────────────
// SERVICES
// ─────────────────────────────────────────────
export const icons_services = {
  /** Globe / web — Sites Web */
  Globe:            'phosphor-astro/GlobeLight.astro',
  /** Éclair — Applications / rapidité */
  Lightning:        'phosphor-astro/LightningLight.astro',
  /** Écran desktop — Montage PC */
  Desktop:          'phosphor-astro/DesktopLight.astro',
  /** Clé à molette — Dépannage */
  Wrench:           'phosphor-astro/WrenchLight.astro',
  /** Terminal — Développement */
  Terminal:         'phosphor-astro/TerminalLight.astro',
  /** Appareil mobile — App mobile */
  DeviceMobile:     'phosphor-astro/DeviceMobileLight.astro',
  /** Puce CPU — Hardware / composants */
  Cpu:              'phosphor-astro/CpuLight.astro',
  /** Circuit — Tech / électronique */
  CircuitBoard:     'phosphor-astro/CircuitBoardLight.astro',
  /** Cloud — Services cloud / hébergement */
  Cloud:            'phosphor-astro/CloudLight.astro',
  /** Code — Développement web */
  Code:             'phosphor-astro/CodeLight.astro',
  /** Palette — Design / UI */
  PaintBrush:       'phosphor-astro/PaintBrushLight.astro',
  /** Boutique — E-commerce */
  Storefront:       'phosphor-astro/StorefrontLight.astro',
} as const;

// ─────────────────────────────────────────────
// CONTACT & COMMUNICATION
// ─────────────────────────────────────────────
export const icons_contact = {
  /** Enveloppe — Email */
  Envelope:         'phosphor-astro/EnvelopeLight.astro',
  /** Téléphone — Appel */
  Phone:            'phosphor-astro/PhoneLight.astro',
  /** Téléphone sonnant — Appel direct urgence */
  PhoneCall:        'phosphor-astro/PhoneCallLight.astro',
  /** Chat bulle — Message / contact */
  ChatText:         'phosphor-astro/ChatTextLight.astro',
  /** Épingle carte — Zone d'intervention */
  MapPin:           'phosphor-astro/MapPinLight.astro',
  /** Horloge — Horaires / délai */
  Clock:            'phosphor-astro/ClockLight.astro',
  /** Calendrier — Prise de RDV */
  Calendar:         'phosphor-astro/CalendarLight.astro',
  /** Papier avion — Envoyer formulaire */
  PaperPlaneTilt:   'phosphor-astro/PaperPlaneTiltLight.astro',
} as const;

// ─────────────────────────────────────────────
// ARGUMENTS / WHY SECTION
// ─────────────────────────────────────────────
export const icons_why = {
  /** Bouclier check — Fiabilité / garantie */
  ShieldCheck:      'phosphor-astro/ShieldCheckLight.astro',
  /** Cible — Précision / sur mesure */
  Target:           'phosphor-astro/TargetLight.astro',
  /** Cœur — Passion */
  Heart:            'phosphor-astro/HeartLight.astro',
  /** Médaille — Qualité / expérience */
  Medal:            'phosphor-astro/MedalLight.astro',
  /** Main poignée — Transparence / confiance */
  Handshake:        'phosphor-astro/HandshakeLight.astro',
  /** Éclair cercle — Réactivité */
  LightningSlash:   'phosphor-astro/LightningSlashLight.astro',
  /** Loupe — Diagnostic */
  MagnifyingGlass:  'phosphor-astro/MagnifyingGlassLight.astro',
  /** Étoile — Qualité premium */
  Star:             'phosphor-astro/StarLight.astro',
} as const;

// ─────────────────────────────────────────────
// MONTAGE PC / HARDWARE
// ─────────────────────────────────────────────
export const icons_hardware = {
  /** Puce — Processeur */
  Cpu:              'phosphor-astro/CpuLight.astro',
  /** Disque dur — Stockage */
  HardDrive:        'phosphor-astro/HardDriveLight.astro',
  /** Clavier — Périphérique */
  Keyboard:         'phosphor-astro/KeyboardLight.astro',
  /** Souris — Périphérique */
  Mouse:            'phosphor-astro/MouseLight.astro',
  /** Moniteur — Écran */
  Monitor:          'phosphor-astro/MonitorLight.astro',
  /** Thermomètre — Température / refroidissement */
  Thermometer:      'phosphor-astro/ThermometerLight.astro',
  /** Batterie — Alimentation */
  BatteryFull:      'phosphor-astro/BatteryFullLight.astro',
  /** Prise — Alimentation / câblage */
  PlugsConnected:   'phosphor-astro/PlugsConnectedLight.astro',
} as const;

// ─────────────────────────────────────────────
// DÉPANNAGE / DIAGNOSTIC
// ─────────────────────────────────────────────
export const icons_depannage = {
  /** Bug — Virus / malware */
  Bug:              'phosphor-astro/BugLight.astro',
  /** Avertissement — Panne / erreur */
  Warning:          'phosphor-astro/WarningLight.astro',
  /** Bouclier bug — Sécurité */
  ShieldWarning:    'phosphor-astro/ShieldWarningLight.astro',
  /** Wifi interdit — Réseau */
  WifiSlash:        'phosphor-astro/WifiSlashLight.astro',
  /** Wifi — Réseau OK */
  Wifi:             'phosphor-astro/WifiLight.astro',
  /** Disque dur panne — Récupération données */
  HardDrives:       'phosphor-astro/HardDrivesLight.astro',
  /** Imprimante — Périphérique */
  Printer:          'phosphor-astro/PrinterLight.astro',
  /** Windows — OS */
  WindowsLogo:      'phosphor-astro/WindowsLogoLight.astro',
  /** Apple — macOS */
  AppleLogo:        'phosphor-astro/AppleLogoLight.astro',
  /** Flèche recycle — Réinstallation */
  ArrowsClockwise:  'phosphor-astro/ArrowsClockwiseLight.astro',
} as const;

// ─────────────────────────────────────────────
// PROCESS / ÉTAPES
// ─────────────────────────────────────────────
export const icons_process = {
  /** Ampoule — Brief / idée */
  Lightbulb:        'phosphor-astro/LightbulbLight.astro',
  /** Fichier crayon — Maquette / design */
  FileDashed:       'phosphor-astro/FileDashedLight.astro',
  /** Marteau — Construction / dev */
  Hammer:           'phosphor-astro/HammerLight.astro',
  /** Rocket — Mise en ligne / lancement */
  Rocket:           'phosphor-astro/RocketLight.astro',
  /** Check cercle — Validation */
  CheckCircle:      'phosphor-astro/CheckCircleLight.astro',
  /** Loupe liste — Tests */
  ListMagnifyingGlass: 'phosphor-astro/ListMagnifyingGlassLight.astro',
} as const;

// ─────────────────────────────────────────────
// SOCIAL & LIENS
// ─────────────────────────────────────────────
export const icons_social = {
  /** LinkedIn */
  LinkedinLogo:     'phosphor-astro/LinkedinLogoLight.astro',
  /** GitHub */
  GithubLogo:       'phosphor-astro/GithubLogoLight.astro',
  /** Instagram */
  InstagramLogo:    'phosphor-astro/InstagramLogoLight.astro',
  /** Facebook */
  FacebookLogo:     'phosphor-astro/FacebookLogoLight.astro',
} as const;

// ─────────────────────────────────────────────
// TYPES UTILITAIRES
// ─────────────────────────────────────────────
export type IconCategory =
  | typeof icons_nav
  | typeof icons_services
  | typeof icons_contact
  | typeof icons_why
  | typeof icons_hardware
  | typeof icons_depannage
  | typeof icons_process
  | typeof icons_social;

/**
 * Toutes les icônes regroupées — pratique pour une recherche globale
 */
export const icons_all = {
  ...icons_nav,
  ...icons_services,
  ...icons_contact,
  ...icons_why,
  ...icons_hardware,
  ...icons_depannage,
  ...icons_process,
  ...icons_social,
} as const;

export type IconName = keyof typeof icons_all;