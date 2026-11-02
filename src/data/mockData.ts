import { CatalogBike, VehicleType } from "../types";

/**
 * Neutral stand-in shown if a catalogue photo fails to load.
 *
 * It is an inline data URI rather than a file so the app ships no binary
 * placeholder asset, and it is deliberately a generic "no photo" glyph: a
 * stock render of a different vehicle would be as misleading as a missing
 * image, since every card is captioned with a specific product name.
 */
const PLACEHOLDER_IMAGE = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#9aa196" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="m4 17 5-4 3.5 3 3-2.5L20 17"/></svg>',
)}`;

export const ASSETS = {
  /** Landing-page hero background — a Monastir scene, not a product shot. */
  hero: "/hero-bg.webp",
  /** Neutral stand-in, shown only if a catalogue photo fails to load. */
  placeholder: PLACEHOLDER_IMAGE,
};

export interface AgencyItem {
  id: "all" | "marina" | "skanes" | "ribat" | "zone_hotel" | "gare";
  name: string;
  shortName: string;
  postalCode: string;
  address: string;
  description?: string;
  phone?: string;
  hours?: string;
  image?: string;
  coordinates?: { lat: number; lng: number };
  landmarks?: string[];
  localities?: string[];
}

export const AGENCIES_LIST: AgencyItem[] = [
  {
    id: "all",
    name: "Toutes les agences de Monastir",
    shortName: "Toutes les agences",
    postalCode: "5000",
    address: "Grand Monastir",
  },
  {
    id: "marina",
    name: "Agence Marina (Port de Plaisance)",
    shortName: "Marina",
    postalCode: "5000",
    address: "Quai Nord du Port de Plaisance, Marina",
    description:
      "Notre agence phare, au cœur de la Marina de Monastir, à deux pas des terrasses et du port de plaisance. Idéale pour combiner balade en bord de mer et trajets en ville.",
    phone: "+216 73 500 101",
    hours: "Lun – Dim : 08h00 – 20h00",
    image: "/agencies/agence-marina.webp",
    coordinates: { lat: 35.7644, lng: 10.8 },
    landmarks: ["Port de Plaisance", "Marina de Monastir", "Corniche"],
    localities: ["Monastir Centre (5000)", "Monastir Republique (5060)"],
  },
  {
    id: "skanes",
    name: "Agence Zone Skanes (Corniche)",
    shortName: "Zone Skanes",
    postalCode: "5060",
    address: "Avenue de la Corniche, Skanes",
    description:
      "Le long de la corniche de Skanes, à quelques minutes des plages et de l'aéroport. Le point de départ parfait pour les séjours en zone touristique.",
    phone: "+216 73 500 103",
    hours: "Lun – Dim : 08h00 – 20h00",
    image: "/agencies/agence-skanes.webp",
    coordinates: { lat: 35.7644, lng: 10.8 },
    landmarks: ["Corniche de Skanes", "Plages de Skanes", "Zone touristique"],
    localities: [
      "Zone Skanes (5060)",
      "Cite El Amel (5060)",
      "Cite Cheraka (5060)",
    ],
  },
  {
    id: "ribat",
    name: "Agence Ribat & Médina",
    shortName: "Ribat & Centre",
    postalCode: "5000",
    address: "Esplanade du Ribat, Centre Historique",
    description:
      "Idéalement située sur l'esplanade du Ribat, entre la médina et le bord de mer. La plus centrale de nos agences, au cœur du Monastir historique.",
    phone: "+216 73 500 102",
    hours: "Lun – Dim : 08h00 – 20h00",
    image: "/agencies/agence-ribat.webp",
    coordinates: { lat: 35.7644, lng: 10.8 },
    landmarks: ["Ribat de Monastir", "Médina", "Centre historique"],
    localities: ["Monastir (5000)", "Cite Bir Hlou (5060)"],
  },
  {
    id: "zone_hotel",
    name: "Agence Zone Hôtelière (Dkhila)",
    shortName: "Zone Hôtelière",
    postalCode: "5065",
    address: "Route Touristique, Zone Dkhila",
    description:
      "Au cœur de la zone hôtelière de Dkhila, desservie par la route touristique. À proximité immédiate de l'aéroport international de Monastir.",
    phone: "+216 73 500 104",
    hours: "Lun – Dim : 08h00 – 20h00",
    image: "/agencies/agence-zone-hoteliere.webp",
    coordinates: { lat: 35.7581, lng: 10.7547 },
    landmarks: [
      "Zone Hôtelière Dkhila",
      "Route Touristique",
      "Aéroport de Monastir",
    ],
    localities: ["Zone Hoteliere (5065)", "Monastir Aeroport (5065)"],
  },
  {
    id: "gare",
    name: "Agence Monastir Gare",
    shortName: "Gare Centrale",
    postalCode: "5079",
    address: "Avenue Habib Bourguiba, Parvis de la Gare",
    description:
      "À la sortie de la gare centrale, sur l'avenue Habib Bourguiba. Pratique pour récupérer un véhicule dès votre arrivée en train.",
    phone: "+216 73 500 105",
    hours: "Lun – Dim : 08h00 – 20h00",
    image: "/agencies/agence-gare.webp",
    coordinates: { lat: 35.7644, lng: 10.8 },
    landmarks: ["Gare de Monastir", "Avenue Habib Bourguiba", "Centre-ville"],
    localities: ["Monastir Gare (5079)", "Monastir (5000)"],
  },
];

export function getAgencyById(agencyId: string): AgencyItem | undefined {
  return AGENCIES_LIST.find((a) => a.id === agencyId);
}

export const CATALOG_BIKES: CatalogBike[] = [
  {
    id: "bike-cowboy-4",
    name: "Cowboy 4 ST",
    vehicleType: "bike",
    category: "urbain",
    categoryLabel: "Urbain & Ville",
    agencyId: "ribat",
    agencyName: "Agence Ribat & Médina",
    agencyPostalCode: "5000",
    pricePerDayDT: 24,
    pricePerHourDT: 4.8,
    rangeKm: 70,
    batteryCapacity: "360 Wh amovible",
    maxSpeedKmH: 25,
    weightKg: 18.9,
    stockAvailable: 6,
    tag: "Bestseller",
    image: "/bikes/cowboy-4-st.webp",
    fallbackImage: ASSETS.placeholder,
    rating: 4.9,
    reviewsCount: 124,
    description:
      "Vélo électrique urbain connecté au design minimaliste, parfait pour les trajets quotidiens à Monastir : assistance automatique, cadre bas et application intégrée.",
    features: [
      "Détection automatique de la puissance",
      "Batterie amovible",
      "Application Cowboy avec GPS et antivol",
      "Cadre bas très accessible",
    ],
    motorType: "Moteur roue arrière Cowboy 250W",
    motorTorqueNm: 45,
    transmission: "Transmission par courroie carbone mono-vitesse",
    brakes: "Freins à disques hydrauliques",
    chargingTimeHours: 3.5,
    frameMaterial: "Aluminium léger, cadre ouvert",
    wheelSize: '700c / 28" pneus urbains',
    connectivity:
      "GPS, déverrouillage par smartphone, alertes antivol et diagnostic à distance",
    includedAccessories: [
      "Casque urbain certifié CE",
      "Antivol pliable haute sécurité",
      "Garde-boues avant et arrière",
      "Éclairage LED avant et arrière",
    ],
  },
  {
    id: "bike-trek-verve-plus-3",
    name: "Trek Verve+ 3 Lowstep",
    vehicleType: "bike",
    category: "vtc",
    categoryLabel: "VTC Confort & Balade",
    agencyId: "marina",
    agencyName: "Agence Marina (Port de Plaisance)",
    agencyPostalCode: "5000",
    pricePerDayDT: 27,
    pricePerHourDT: 5.4,
    rangeKm: 95,
    batteryCapacity: "525 Wh",
    maxSpeedKmH: 25,
    weightKg: 24.1,
    stockAvailable: 4,
    tag: "Idéal Corniche",
    image: "/bikes/trek-verve+-3-lowstep.webp",
    fallbackImage: ASSETS.placeholder,
    rating: 4.95,
    reviewsCount: 88,
    description:
      "VTC électrique confortable avec position redressée, suspensions avant et équipement complet : idéal pour la Marina, la corniche et les balades familiales.",
    features: [
      "Fourche suspendue confort",
      "Position de conduite relevée",
      "Garde-boues, porte-bagages et éclairage intégrés",
      "Assistance Bosch fluide",
    ],
    motorType: "Bosch Active Line Plus 250W",
    motorTorqueNm: 50,
    transmission: "Shimano Altus 8 vitesses",
    brakes: "Freins à disques hydrauliques",
    chargingTimeHours: 4.5,
    frameMaterial: "Aluminium Alpha Gold, cadre bas Lowstep",
    wheelSize: '700c / 28" pneus hybrides',
    connectivity:
      "Display Bosch Purion, port USB et compatibilité application eBike Flow",
    includedAccessories: [
      "Casque urbain avec visière",
      "Antivol à clé renforcé",
      "Porte-bidon",
      "Sacoche de cadre 8L",
    ],
  },
  {
    id: "bike-cube-touring-hybrid-one-625",
    name: "Cube Touring Hybrid ONE 625",
    vehicleType: "bike",
    category: "vtc",
    categoryLabel: "VTC Confort & Balade",
    agencyId: "skanes",
    agencyName: "Agence Zone Skanes (Corniche)",
    agencyPostalCode: "5060",
    pricePerDayDT: 32,
    pricePerHourDT: 6.4,
    rangeKm: 120,
    batteryCapacity: "625 Wh",
    maxSpeedKmH: 25,
    weightKg: 25.4,
    stockAvailable: 5,
    tag: "Longue Autonomie",
    image: "/bikes/cube-touring-hybrid-one-625.webp",
    fallbackImage: ASSETS.placeholder,
    rating: 4.88,
    reviewsCount: 96,
    description:
      "VTC électrique polyvalent à grande autonomie, pensé pour les longues sorties côtières, les pistes stabilisées et les trajets entre Monastir, Skanes et la zone hôtelière.",
    features: [
      "Batterie Bosch 625 Wh",
      "Moteur central puissant",
      "Équipement trekking complet",
      "Pneus polyvalents route et chemin",
    ],
    motorType: "Bosch Performance Line CX 250W",
    motorTorqueNm: 85,
    transmission: "Shimano Deore 10 vitesses",
    brakes: "Freins à disques hydrauliques Shimano",
    chargingTimeHours: 4.5,
    frameMaterial: "Aluminium Superlite, géométrie trekking",
    wheelSize: '28" pneus Schwalbe Marathon',
    connectivity:
      "Bosch Smart System, application eBike Flow, navigation et suivi",
    includedAccessories: [
      "Double sacoche arrière étanche",
      "Casque trekking avec LED arrière",
      "Antivol certifié Sold Secure",
      "Chargeur Bosch rapide",
    ],
  },
  {
    id: "bike-cannondale-trail-neo-4",
    name: "Cannondale Trail Neo 4",
    vehicleType: "bike",
    category: "vtt",
    categoryLabel: "VTT & Sport",
    agencyId: "zone_hotel",
    agencyName: "Agence Zone Hôtelière (Dkhila)",
    agencyPostalCode: "5065",
    pricePerDayDT: 34,
    pricePerHourDT: 6.8,
    rangeKm: 90,
    batteryCapacity: "625 Wh",
    maxSpeedKmH: 25,
    weightKg: 24.9,
    stockAvailable: 3,
    tag: "Sport & Tout-Chemin",
    image: "/bikes/cannondale-trail-neo-4.webp",
    fallbackImage: ASSETS.placeholder,
    rating: 4.85,
    reviewsCount: 64,
    description:
      "VTT électrique rigide, léger et nerveux pour les pistes côtières, chemins sablonneux et sorties sportives autour de Dkhila.",
    features: [
      "Cadre VTT aluminium léger",
      "Transmission 1x10 large plage",
      "Pneus tubeless ready",
      "Moteur central réactif",
    ],
    motorType: "Bosch Performance Line 250W",
    motorTorqueNm: 75,
    transmission: "Shimano Deore 10 vitesses",
    brakes: "Freins à disques hydrauliques Shimano MT200",
    chargingTimeHours: 4.2,
    frameMaterial: "Aluminium SmartForm C3",
    wheelSize: '29" pneus WTB Ranger 2.25"',
    connectivity: "Bosch Purion LCD, assistance réglable et diagnostic",
    includedAccessories: [
      "Casque VTT All-Mountain",
      "Mini-pompe et kit de réparation",
      "Antivol articulé renforcé",
      "Garde-boues VTT amovibles",
    ],
  },
  {
    id: "bike-tern-gsd-s10",
    name: "Tern GSD S10",
    vehicleType: "bike",
    category: "cargo",
    categoryLabel: "Cargo & Famille",
    agencyId: "ribat",
    agencyName: "Agence Ribat & Médina",
    agencyPostalCode: "5000",
    pricePerDayDT: 45,
    pricePerHourDT: 8.5,
    rangeKm: 110,
    batteryCapacity: "725 Wh",
    maxSpeedKmH: 25,
    weightKg: 33.8,
    stockAvailable: 2,
    tag: "Capacité 100 kg",
    image: "/bikes/tern-gsd-s10.webp",
    fallbackImage: ASSETS.placeholder,
    rating: 4.92,
    reviewsCount: 41,
    description:
      "Cargo longue-taille capable de transporter deux enfants, des courses ou du matériel professionnel. Châssis compact, très stable et motorisation Bosch Cargo Line de 85 Nm.",
    features: [
      "Charge utile arrière jusqu’à 100 kg",
      "Compatible deux sièges enfants",
      "Béquille centrale double ultra-stable",
      "Moteur cargo Bosch 85 Nm",
    ],
    motorType: "Bosch Cargo Line 250W, 85 Nm",
    motorTorqueNm: 85,
    transmission: "Shimano Deore 10 vitesses",
    brakes: "Freins à disques hydrauliques Magura MT4",
    chargingTimeHours: 4.8,
    frameMaterial: "Aluminium 6061 renforcé, format longtail",
    wheelSize: '20" roues renforcées, pneus cargo',
    connectivity:
      "Bosch Smart System, application eBike Flow et suivi du véhicule",
    includedAccessories: [
      "Deux casques enfant homologués",
      "Barres latérales et plateformes passagers",
      "Bâche pluie amovible",
      "Antivol chaîne haute sécurité",
    ],
  },
  {
    id: "bike-brompton-electric-c-line",
    name: "Brompton Electric C Line",
    vehicleType: "bike",
    category: "pliant",
    categoryLabel: "Pliant Électrique",
    agencyId: "gare",
    agencyName: "Agence Monastir Gare",
    agencyPostalCode: "5079",
    pricePerDayDT: 22,
    pricePerHourDT: 4.4,
    rangeKm: 45,
    batteryCapacity: "300 Wh amovible",
    maxSpeedKmH: 25,
    weightKg: 17.4,
    stockAvailable: 5,
    tag: "Ultra-Compact",
    image: "/bikes/brompton-electric-c-line.webp",
    fallbackImage: ASSETS.placeholder,
    rating: 4.79,
    reviewsCount: 52,
    description:
      "Vélo pliant électrique britannique iconique, parfait pour combiner train, médina et petits espaces. Pliage très compact et batterie amovible dans le sac avant.",
    features: [
      "Pliage ultra-compact",
      "Batterie dans le sac avant",
      "Transmission Brompton 2 vitesses",
      "Idéal train et appartement",
    ],
    motorType: "Moteur roue avant Brompton Electric 250W",
    motorTorqueNm: 45,
    transmission: "Brompton 2 vitesses + assistance électronique",
    brakes: "Freins à tirage Brompton, patins haute performance",
    chargingTimeHours: 3.0,
    frameMaterial: "Acier forgé Brompton, finition laquée",
    wheelSize: '16" roues Brompton',
    connectivity: "Batterie avec indicateur LED et mode d’assistance réglable",
    includedAccessories: [
      "Sac avant Brompton avec batterie",
      "Casque pliable certifié CE",
      "Antivol compact",
      "Housse de transport",
    ],
  },
  {
    id: "bike-gazelle-ultimate-c8",
    name: "Gazelle Ultimate C8 HMB",
    vehicleType: "bike",
    category: "urbain",
    categoryLabel: "Urbain & Ville",
    agencyId: "skanes",
    agencyName: "Agence Zone Skanes (Corniche)",
    agencyPostalCode: "5060",
    pricePerDayDT: 28,
    pricePerHourDT: 5.6,
    rangeKm: 100,
    batteryCapacity: "500 Wh",
    maxSpeedKmH: 25,
    weightKg: 24.6,
    stockAvailable: 4,
    tag: "Dynamique",
    image: "/bikes/gazelle-ultimate-c8-hmb.webp",
    fallbackImage: ASSETS.placeholder,
    rating: 4.87,
    reviewsCount: 73,
    description:
      "Vélo de ville néerlandais haut de gamme : confort, fiabilité et équipement complet pour les trajets université, centre-ville et corniche.",
    features: [
      "Cadre bas très confortable",
      "Moyeu Shimano Nexus 8 vitesses",
      "Éclairage intégré",
      "Assistance Bosch naturelle",
    ],
    motorType: "Bosch Active Line Plus 250W",
    motorTorqueNm: 50,
    transmission: "Shimano Nexus 8 vitesses au moyeu",
    brakes: "Freins à disques hydrauliques Shimano",
    chargingTimeHours: 4.0,
    frameMaterial: "Aluminium stable et léger, cadre bas",
    wheelSize: '28" pneus urbains anti-crevaison',
    connectivity:
      "Console Bosch Intuvia, port USB et compatibilité application",
    includedAccessories: [
      "Casque urbain aéré",
      "Antivol en U",
      "Garde-boues et porte-bagages",
      "Éclairage LED avant/arrière",
    ],
  },
  {
    id: "bike-michael-blast-soda",
    name: "Michael Blast Soda",
    vehicleType: "bike",
    category: "urbain",
    categoryLabel: "Urbain & Ville",
    agencyId: "marina",
    agencyName: "Agence Marina (Port de Plaisance)",
    agencyPostalCode: "5000",
    pricePerDayDT: 29,
    pricePerHourDT: 5.8,
    rangeKm: 80,
    batteryCapacity: "481 Wh",
    maxSpeedKmH: 25,
    weightKg: 26.0,
    stockAvailable: 3,
    tag: "Élégance",
    image: "/bikes/michael-blast-soda.webp",
    fallbackImage: ASSETS.placeholder,
    rating: 4.93,
    reviewsCount: 61,
    description:
      "Café racer électrique au style rétro très photogénique : selle large, guidon large et finitions vintage, parfait pour une balade élégante autour de la Marina.",
    features: [
      "Design café racer néo-rétro",
      "Selle large confort",
      "Pneus larges style cruiser",
      "Assistance douce et silencieuse",
    ],
    motorType: "Moteur roue arrière 250W",
    motorTorqueNm: 55,
    transmission: "Transmission par courroie, mono-vitesse",
    brakes: "Freins à disques hydrauliques",
    chargingTimeHours: 4.0,
    frameMaterial: "Acier rétro renforcé",
    wheelSize: '26" pneus cruiser larges',
    connectivity: "Écran LCD rétro, indicateurs de batterie et assistance",
    includedAccessories: [
      "Casque vintage avec lanières cuir",
      "Antivol de cadre",
      "Rétroviseurs ronds chromés",
      "Porte-bidon cuir",
    ],
  },
  {
    id: "scooter-segway-ninebot-max-g2",
    name: "Segway Ninebot KickScooter Max G2",
    vehicleType: "scooter",
    category: "trottinette",
    categoryLabel: "Trottinette Urbaine",
    agencyId: "marina",
    agencyName: "Agence Marina (Port de Plaisance)",
    agencyPostalCode: "5000",
    pricePerDayDT: 18,
    pricePerHourDT: 3.8,
    rangeKm: 70,
    batteryCapacity: "551 Wh",
    maxSpeedKmH: 25,
    weightKg: 24.3,
    stockAvailable: 5,
    tag: "Best-Seller Trot",
    image: "/scooters/segway-ninebot-max-g2.webp",
    fallbackImage: ASSETS.placeholder,
    rating: 4.8,
    reviewsCount: 97,
    description:
      "Trottinette robuste à grande autonomie, avec suspension double et pneus tubeless auto-réparants : idéale pour la corniche, la Marina et les trajets urbains quotidiens.",
    features: [
      "Autonomie jusqu’à 70 km",
      "Double suspension",
      'Pneus 10" tubeless auto-réparants',
      "Clignotants et éclairage intégrés",
    ],
    motorType: "Moteur roue arrière 900W crête / 450W nominal",
    motorTorqueNm: 40,
    transmission: "Transmission directe",
    brakes: "Frein avant à tambour, frein arrière électronique et EBS",
    chargingTimeHours: 6.0,
    frameMaterial: "Aluminium aéronautique",
    wheelSize: 'Pneus 10" tubeless auto-réparants',
    connectivity:
      "Application Segway-Ninebot, Bluetooth, NFC et suivi du véhicule",
    includedAccessories: [
      "Casque pliable certifié CE",
      "Antivol à code",
      "Chargeur officiel",
      "Sacoche de guidon étanche",
    ],
  },
  {
    id: "scooter-xiaomi-electric-scooter-5-max",
    name: "Xiaomi Electric Scooter 5 Max",
    vehicleType: "scooter",
    category: "trottinette",
    categoryLabel: "Trottinette Urbaine",
    agencyId: "zone_hotel",
    agencyName: "Agence Zone Hôtelière (Dkhila)",
    agencyPostalCode: "5065",
    pricePerDayDT: 21,
    pricePerHourDT: 4.4,
    rangeKm: 60,
    batteryCapacity: "477 Wh",
    maxSpeedKmH: 25,
    weightKg: 20.3,
    stockAvailable: 4,
    tag: "Longue Autonomie",
    image: "/scooters/xiaomi-electric-scooter-5-max.webp",
    fallbackImage: ASSETS.placeholder,
    rating: 4.86,
    reviewsCount: 58,
    description:
      "Trottinette Xiaomi polyvalente, légère et bien équipée, avec clignotants intégrés et pneus tubeless : parfaite pour les déplacements entre Dkhila, Skanes et le centre.",
    features: [
      "Autonomie jusqu’à 60 km",
      'Pneus 10" tubeless',
      "Clignotants intégrés",
      "Pliable et transportable",
    ],
    motorType: "Moteur roue arrière 400W",
    motorTorqueNm: 38,
    transmission: "Transmission directe",
    brakes: "Frein avant à tambour et frein arrière électronique",
    chargingTimeHours: 5.5,
    frameMaterial: "Aluminium aéronautique",
    wheelSize: 'Pneus 10" tubeless',
    connectivity:
      "Application Xiaomi Home, Bluetooth, verrouillage et diagnostics",
    includedAccessories: [
      "Casque pliable certifié CE",
      "Antivol U compact",
      "Chargeur rapide",
      "Support smartphone",
    ],
  },
  {
    id: "scooter-segway-ninebot-e3-pro",
    name: "Segway Ninebot E3 Pro E",
    vehicleType: "scooter",
    category: "trottinette",
    categoryLabel: "Trottinette Urbaine",
    agencyId: "skanes",
    agencyName: "Agence Zone Skanes (Corniche)",
    agencyPostalCode: "5060",
    pricePerDayDT: 24,
    pricePerHourDT: 5.0,
    rangeKm: 55,
    batteryCapacity: "368 Wh",
    maxSpeedKmH: 25,
    weightKg: 21.5,
    stockAvailable: 3,
    tag: "Confort Premium",
    image: "/scooters/segway-ninebot-e3-pro-e.webp",
    fallbackImage: ASSETS.placeholder,
    rating: 4.9,
    reviewsCount: 46,
    description:
      "Trottinette premium à double suspension et moteur puissant, conçue pour un confort supérieur sur les revêtements irréguliers et les longues balades côtières.",
    features: [
      "Double suspension avant et arrière",
      "Autonomie jusqu’à 55 km",
      "Moteur 800W",
      "Confort haut de gamme",
    ],
    motorType: "Moteur 800W",
    motorTorqueNm: 42,
    transmission: "Transmission directe",
    brakes: "Frein avant à tambour, frein arrière électronique et EBS",
    chargingTimeHours: 5.0,
    frameMaterial: "Aluminium renforcé",
    wheelSize: 'Pneus 10" tubeless',
    connectivity: "Application Segway-Ninebot, Bluetooth, NFC et suivi",
    includedAccessories: [
      "Casque premium avec LED arrière",
      "Antivol haute sécurité",
      "Chargeur rapide",
      "Sac de transport",
    ],
  },
];

/* -------------------------------------------------------------------------- */
/* Compte utilisateur (profil, coupons, historique)                           */
/* -------------------------------------------------------------------------- */

export type CouponStatus = "active" | "used" | "expired";
export type ReservationStatus = "active" | "completed" | "cancelled";

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  memberSince: string;
  preferredAgencyId: AgencyItem["id"];
  loyaltyPoints: number;
  avatarSeed: string;
}

export interface UserCoupon {
  id: string;
  code: string;
  vehicleId: string;
  agencyId: AgencyItem["id"];
  status: CouponStatus;
  startDate: string;
  endDate: string;
  days: number;
  totalDT: number;
  createdAt: string;
}

export interface UserReservation {
  id: string;
  vehicleId: string;
  agencyId: AgencyItem["id"];
  startDate: string;
  endDate: string;
  days: number;
  totalDT: number;
  status: ReservationStatus;
  rating?: number;
}

/** ISO date (yyyy-mm-dd) offset from today, so the demo stays realistic over time. */
const isoDaysFromNow = (days: number): string => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

export const USER_PROFILE: UserProfile = {
  id: "usr-salhirayen-69",
  fullName: "Rayen Salhi",
  email: "rayen.rsalhi9@gmail.com",
  phone: "+216 92 840 380",
  city: "Monastir",
  address: "12 Rue Marroc, Monastir 5000",
  memberSince: "2024-03-12",
  preferredAgencyId: "marina",
  loyaltyPoints: 1240,
  avatarSeed: "salhirayen69",
};

export const USER_COUPONS: UserCoupon[] = [
  {
    id: "cpn-2410",
    code: "RL-MNS-2410",
    vehicleId: "bike-cowboy-4",
    agencyId: "ribat",
    status: "active",
    startDate: isoDaysFromNow(0),
    endDate: isoDaysFromNow(3),
    days: 3,
    totalDT: 72,
    createdAt: isoDaysFromNow(-2),
  },
  {
    id: "cpn-2388",
    code: "RL-MNS-2388",
    vehicleId: "scooter-xiaomi-electric-scooter-5-max",
    agencyId: "zone_hotel",
    status: "active",
    startDate: isoDaysFromNow(2),
    endDate: isoDaysFromNow(2),
    days: 1,
    totalDT: 21,
    createdAt: isoDaysFromNow(-1),
  },
  {
    id: "cpn-1902",
    code: "RL-MNS-1902",
    vehicleId: "bike-trek-verve-plus-3",
    agencyId: "marina",
    status: "used",
    startDate: isoDaysFromNow(-24),
    endDate: isoDaysFromNow(-22),
    days: 2,
    totalDT: 54,
    createdAt: isoDaysFromNow(-27),
  },
  {
    id: "cpn-1784",
    code: "RL-MNS-1784",
    vehicleId: "bike-gazelle-ultimate-c8",
    agencyId: "skanes",
    status: "expired",
    startDate: isoDaysFromNow(-40),
    endDate: isoDaysFromNow(-38),
    days: 2,
    totalDT: 56,
    createdAt: isoDaysFromNow(-44),
  },
];

export const USER_RESERVATIONS: UserReservation[] = [
  {
    id: "res-3391",
    vehicleId: "bike-cannondale-trail-neo-4",
    agencyId: "zone_hotel",
    startDate: isoDaysFromNow(0),
    endDate: isoDaysFromNow(3),
    days: 3,
    totalDT: 102,
    status: "active",
  },
  {
    id: "res-3120",
    vehicleId: "bike-trek-verve-plus-3",
    agencyId: "marina",
    startDate: isoDaysFromNow(-24),
    endDate: isoDaysFromNow(-22),
    days: 2,
    totalDT: 54,
    status: "completed",
    rating: 5,
  },
  {
    id: "res-2987",
    vehicleId: "scooter-segway-ninebot-max-g2",
    agencyId: "marina",
    startDate: isoDaysFromNow(-19),
    endDate: isoDaysFromNow(-16),
    days: 3,
    totalDT: 54,
    status: "completed",
    rating: 5,
  },
  {
    id: "res-2711",
    vehicleId: "bike-cube-touring-hybrid-one-625",
    agencyId: "skanes",
    startDate: isoDaysFromNow(-33),
    endDate: isoDaysFromNow(-31),
    days: 2,
    totalDT: 64,
    status: "completed",
    rating: 4,
  },
  {
    id: "res-2504",
    vehicleId: "scooter-segway-ninebot-e3-pro",
    agencyId: "skanes",
    startDate: isoDaysFromNow(-38),
    endDate: isoDaysFromNow(-37),
    days: 1,
    totalDT: 24,
    status: "completed",
    rating: 5,
  },
  {
    id: "res-2233",
    vehicleId: "bike-brompton-electric-c-line",
    agencyId: "gare",
    startDate: isoDaysFromNow(-46),
    endDate: isoDaysFromNow(-46),
    days: 1,
    totalDT: 22,
    status: "cancelled",
  },
];

export interface UserStats {
  rides: number;
  totalDays: number;
  totalDT: number;
  co2SavedKg: number;
}

/** Lifetime figures derived from completed reservations only. */
export function getUserStats(): UserStats {
  const done = USER_RESERVATIONS.filter((r) => r.status === "completed");
  const days = done.reduce((sum, r) => sum + r.days, 0);
  return {
    rides: done.length,
    totalDays: days,
    totalDT: done.reduce((sum, r) => sum + r.totalDT, 0),
    // ponytail: flat 4.6 kg/day vs an average car; swap for real CO2 model if it matters.
    co2SavedKg: Math.round(days * 4.6),
  };
}

export function getBikeById(bikeId: string): CatalogBike | undefined {
  return CATALOG_BIKES.find((b) => b.id === bikeId);
}

export function getVehicleCount(
  agencyId: string = "all",
  vehicleType?: VehicleType,
): number {
  return CATALOG_BIKES.filter(
    (v) =>
      (agencyId === "all" || v.agencyId === agencyId) &&
      (!vehicleType || v.vehicleType === vehicleType),
  ).length;
}

export const STATS = {
  activeUsers: 8500,
  reviews: 3200,
  avgBookingMinutes: 2,
};

/**
 * The catalogue is a single route; the vehicle type is a query param.
 * `?type=bike` / `?type=scooter` scope the listing, no `type` means all.
 */
export const VEHICLE_CATALOG_URL: Record<VehicleType, string> = {
  bike: "/vehicules?type=bike",
  scooter: "/vehicules?type=scooter",
};

/** Canonical detail path — one URL per vehicle, whatever its type. */
export function getVehiclePath(vehicle: CatalogBike): string {
  return `/vehicules/${vehicle.id}`;
}

/* -------------------------------------------------------------------------- */
/* Charts                                                                     */
/* -------------------------------------------------------------------------- */

function vehicleSeed(vehicleId: string): number {
  let hash = 0;
  for (let i = 0; i < vehicleId.length; i += 1) {
    hash = (hash * 31 + vehicleId.charCodeAt(i)) % 997;
  }
  return hash;
}

const availabilityDateFmt = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
});

export interface VehicleAvailabilityPoint {
  date: Date;
  label: string;
  availableUnits: number;
  bookedUnits: number;
  totalUnits: number;
  [key: string]: unknown;
}

/**
 * Deterministic 14-day availability, shaped like
 * `GET /api/v1/vehicles/{id}/availability` (date, availableUnits, totalUnits)
 * plus the booked split the chart stacks on top.
 *
 * Today is always the full stock so this never contradicts the "X disponibles
 * aujourd'hui" figure in the booking card.
 */
export function getVehicleAvailability(
  vehicleId: string,
  days = 14,
): VehicleAvailabilityPoint[] {
  const vehicle = getBikeById(vehicleId);
  if (!vehicle) return [];

  const totalUnits = Math.max(1, vehicle.stockAvailable + 1);
  const seed = vehicleSeed(vehicle.id);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index);

    const isWeekend = [0, 6].includes(date.getDay());
    const wave = (Math.sin((index + seed) / 3.1) + 1) / 2;
    const pressure = 0.15 + wave * 0.5 + (isWeekend ? 0.22 : 0);
    const bookedUnits =
      index === 0
        ? 1
        : Math.min(totalUnits, Math.round(pressure * totalUnits));

    return {
      date,
      label: availabilityDateFmt.format(date),
      availableUnits: totalUnits - bookedUnits,
      bookedUnits,
      totalUnits,
    };
  });
}

const VEHICLE_WEEKDAY_LABELS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

/** Relative rental demand per weekday — weekends are busiest. */
const VEHICLE_WEEKDAY_FACTORS = [0.82, 0.74, 0.8, 0.92, 1.06, 1.32, 1.14];

export interface VehicleWeekdayDemandPoint {
  label: string;
  reservations: number;
  [key: string]: unknown;
}

/**
 * Deterministic weekday demand for the last `window` days, shaped like
 * `GET /api/v1/vehicles/{id}/demand-by-weekday`.
 */
export function getVehicleDemandByWeekday(
  vehicleId: string,
  window = 90,
): VehicleWeekdayDemandPoint[] {
  const vehicle = getBikeById(vehicleId);
  if (!vehicle) return [];

  const seed = vehicleSeed(vehicle.id);
  const total = Math.max(
    7,
    Math.round(vehicle.reviewsCount * (0.6 + (seed % 25) / 100) * (window / 90)),
  );

  const weights = VEHICLE_WEEKDAY_FACTORS.map(
    (factor, index) => factor * (0.9 + ((seed + index * 7) % 11) / 55),
  );
  const weightSum = weights.reduce((sum, weight) => sum + weight, 0);
  const counts = weights.map((weight) =>
    Math.max(0, Math.round((total * weight) / weightSum)),
  );

  const drift = total - counts.reduce((sum, count) => sum + count, 0);
  if (drift !== 0) {
    const busiestIndex = counts.indexOf(Math.max(...counts));
    counts[busiestIndex] = Math.max(0, counts[busiestIndex] + drift);
  }

  return VEHICLE_WEEKDAY_LABELS.map((label, index) => ({
    label,
    reservations: counts[index],
  }));
}

export interface VehicleDemandSummary {
  total: number;
  busiestDay: string;
  busiestCount: number;
  calmDay: string;
}

export function getVehicleDemandSummary(
  vehicleId: string,
  window = 90,
): VehicleDemandSummary {
  const points = getVehicleDemandByWeekday(vehicleId, window);
  const total = points.reduce((sum, point) => sum + point.reservations, 0);
  const busiest = points.reduce(
    (best, point) =>
      point.reservations > best.reservations ? point : best,
    points[0],
  );
  const calm = points.reduce(
    (best, point) => (point.reservations < best.reservations ? point : best),
    points[0],
  );

  return {
    total,
    busiestDay: busiest?.label ?? "—",
    busiestCount: busiest?.reservations ?? 0,
    calmDay: calm?.label ?? "—",
  };
}

/* -------------------------------------------------------------------------- */
/* Agency load profile                                                        */
/* -------------------------------------------------------------------------- */

export interface AgencyLoadPoint {
  label: string;
  occupancy: number;
  [key: string]: unknown;
}

/** Weekday demand multipliers (Lun → Dim): weekends are busiest. */
const AGENCY_WEEKDAY_FACTORS = [0.82, 0.7, 0.74, 0.88, 1.02, 1.28, 1.16];
const AGENCY_DAY_LABELS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function agencySeed(agencyId: string): number {
  let hash = 0;
  for (let i = 0; i < agencyId.length; i += 1) {
    hash = (hash * 31 + agencyId.charCodeAt(i)) % 997;
  }
  return hash;
}

/** Deterministic occupancy rate (0–100 %) per opening hour (08h → 20h). */
export function getAgencyLoadByHour(agencyId: string): AgencyLoadPoint[] {
  const seed = agencySeed(agencyId);
  const peak = 0.55 + (seed % 30) / 100;
  return Array.from({ length: 13 }, (_, i) => {
    const hour = 8 + i;
    const morning = Math.exp(-((hour - 9.5) ** 2) / 6);
    const evening = Math.exp(-((hour - 18) ** 2) / 6);
    const lunchDip = 0.35 * Math.exp(-((hour - 13) ** 2) / 3);
    const occupancy = Math.round(
      Math.max(
        4,
        Math.min(96, (morning + evening - lunchDip) * peak * 100 + 18),
      ),
    );
    return { label: `${String(hour).padStart(2, "0")}h`, occupancy };
  });
}

/** Deterministic occupancy rate (0–100 %) per weekday (Lun → Dim). */
export function getAgencyLoadByWeekday(agencyId: string): AgencyLoadPoint[] {
  const seed = agencySeed(agencyId);
  const base = 0.45 + (seed % 25) / 100;
  return AGENCY_DAY_LABELS.map((label, i) => ({
    label,
    occupancy: Math.round(
      Math.max(
        10,
        Math.min(96, (base * AGENCY_WEEKDAY_FACTORS[i] + 0.15) * 100),
      ),
    ),
  }));
}

export interface AgencyCalmSummary {
  calmHours: string;
  calmDay: string;
}

/** Least-charged hours and weekday, for the "réservez au calme" hint. */
export function getAgencyCalmSummary(agencyId: string): AgencyCalmSummary {
  const hours = [...getAgencyLoadByHour(agencyId)].sort(
    (a, b) => a.occupancy - b.occupancy,
  );
  const days = [...getAgencyLoadByWeekday(agencyId)].sort(
    (a, b) => a.occupancy - b.occupancy,
  );
  return {
    calmHours: hours
      .slice(0, 2)
      .map((p) => p.label)
      .join(" & "),
    calmDay: days[0].label,
  };
}

export function getSimilarBikes(
  bikeId: string,
  limit: number = 3,
): CatalogBike[] {
  const current = getBikeById(bikeId);
  if (!current) return CATALOG_BIKES.slice(0, limit);
  const score = (v: CatalogBike) =>
    (v.vehicleType === current.vehicleType ? 2 : 0) +
    (v.category === current.category ? 1 : 0);
  return CATALOG_BIKES.filter((b) => b.id !== bikeId)
    .sort((a, b) => score(b) - score(a))
    .slice(0, limit);
}

if (import.meta.env.DEV) {
  const seenIds = new Set<string>();
  CATALOG_BIKES.forEach((v) => {
    if (seenIds.has(v.id)) throw new Error(`Identifiant dupliqué: ${v.id}`);
    seenIds.add(v.id);
    if (v.stockAvailable < 0) throw new Error(`Stock négatif pour ${v.id}`);
    if (!AGENCIES_LIST.some((a) => a.id === v.agencyId))
      throw new Error(`Agence inconnue pour ${v.id}`);
    (
      [
        "pricePerDayDT",
        "pricePerHourDT",
        "rangeKm",
        "maxSpeedKmH",
        "weightKg",
        "rating",
        "reviewsCount",
        "stockAvailable",
      ] as const
    ).forEach((key) => {
      if (!Number.isFinite(v[key]) || v[key] < 0)
        throw new Error(`Champ ${key} invalide pour ${v.id}`);
    });
    if (!v.pricePerDayDT || !v.weightKg || !v.rating)
      throw new Error(`Valeurs manquantes pour ${v.id}`);
  });
  if (
    !CATALOG_BIKES.some((v) => v.vehicleType === "bike") ||
    !CATALOG_BIKES.some((v) => v.vehicleType === "scooter")
  ) {
    throw new Error(
      "Le catalogue doit contenir au moins un vélo et une trottinette",
    );
  }
  AGENCIES_LIST.filter((a) => a.id !== "all").forEach((a) => {
    if (
      !a.description ||
      !a.phone ||
      !a.hours ||
      !a.coordinates ||
      !a.landmarks?.length ||
      !a.localities?.length
    ) {
      throw new Error(`Fiche agence incomplète: ${a.id}`);
    }
    if (
      getAgencyLoadByHour(a.id).length !== 13 ||
      getAgencyLoadByWeekday(a.id).length !== 7
    ) {
      throw new Error(`Profil de charge invalide pour ${a.id}`);
    }
    [...getAgencyLoadByHour(a.id), ...getAgencyLoadByWeekday(a.id)].forEach(
      (p) => {
        if (p.occupancy < 0 || p.occupancy > 100) {
          throw new Error(
            `Taux d'occupation invalide pour ${a.id}: ${p.label}`,
          );
        }
      },
    );
  });
  CATALOG_BIKES.forEach((vehicle) => {
    const availability = getVehicleAvailability(vehicle.id);
    if (availability.length !== 14) {
      throw new Error(`Disponibilité invalide pour ${vehicle.id}`);
    }
    availability.forEach((point) => {
      if (
        point.availableUnits < 0 ||
        point.availableUnits > point.totalUnits ||
        point.bookedUnits < 0 ||
        point.availableUnits + point.bookedUnits !== point.totalUnits
      ) {
        throw new Error(
          `Unités incohérentes pour ${vehicle.id}: ${point.label}`,
        );
      }
    });

    const demand = getVehicleDemandByWeekday(vehicle.id);
    if (
      demand.length !== 7 ||
      demand.some((point) => point.reservations < 0)
    ) {
      throw new Error(`Demande hebdomadaire invalide pour ${vehicle.id}`);
    }
  });
}
