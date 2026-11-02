## Rouli

Application Vite + React + TypeScript pour la réservation de vélos et trottinettes électriques à Monastir.

Le backend Django + API REST est spécifié dans [`PRD.md`](./PRD.md) (schéma de base de données, contrat d'API, plan de livraison).

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev`
3. Type-check:
   `npm run lint`
4. Production build:
   `npm run build`

### Routes

- `/` — page d'accueil (recherche, solution, FAQ, CTA)
- `/vehicules` — catalogue, vélos et trottinettes. Tout l'état de la liste vit dans l'URL :

  | param           | valeurs                                                     | rôle                                  |
  | --------------- | ----------------------------------------------------------- | ------------------------------------- |
  | `type`          | `bike` \| `scooter`                                         | périmètre de la liste (absent = tous) |
  | `cat`           | id de catégorie                                             | filtre catégorie                      |
  | `agency`        | id d'agence                                                 | filtre agence                         |
  | `price`         | 15–45                                                       | prix maximum par jour                 |
  | `q`             | texte                                                       | recherche                             |
  | `sort`          | `popularity` \| `price-asc` \| `price-desc` \| `range-desc` | tri                                   |
  | `stock`         | `0`                                                         | inclure les véhicules en rupture      |
  | `start` / `end` | `YYYY-MM-DD`                                                | dates de location                     |

  Exemple : `/vehicules?type=bike&agency=marina&sort=price-asc`

- `/vehicules/:bikeId` — fiche véhicule et réservation (URL canonique pour les vélos et les trottinettes)
- `/agences`, `/agences/:agencyId` — réseau d'agences
- `/a-propos`, `/contact`, `/profil`
- `/login` et `/signup` — écrans de démonstration (aucune authentification serveur)

`/velos` et `/trottinettes` n'existent plus : le catalogue est une seule route, le type
de véhicule est un paramètre (`?type=bike`, `?type=scooter`).

The catalogue data lives in `src/data/mockData.ts` and drives pricing, stock, agency counts, marketing figures and the vehicle analytics charts (`getVehicleRadarData`, `getVehicleBookingTrend`).

Charts come from the [Bklit UI](https://bklit.com) shadcn registry (installed under `src/components/charts`), lazily loaded on vehicle pages so the rest of the app stays light. Chart colors and radii are defined as tokens in `src/index.css`. Add more with `npx shadcn@latest add @bklit/<chart>`.
