# Rouli — Product Requirements Document

> **Version** 1.0 · **Date** 2026-10-21 · **Status** Approved for backend build
> **Scope** Backend + REST API (Django) for the existing Rouli frontend
> **Owner** Rouli academic project

---

## Part 0 — How to read this document

### 0.1 What this document is

This PRD is the complete specification for the **backend and API** of Rouli, a bike and
electric-scooter rental service in Monastir, Tunisia.

The frontend is already built and working — a Vite + React 19 + TypeScript single-page
application with 11 routes, a full vehicle catalogue, an agency network, a booking
flow, an account area and a set of data-driven charts. What does **not** exist is the
server. Every piece of data the interface displays currently comes from a hard-coded
TypeScript file.

This document tells you:

1. **What the product is** and what each feature must do (Parts 1–2).
2. **How Django works**, written for someone who has never used it (Part 3).
3. **What the database looks like**, model by model, with runnable code (Part 4).
4. **What the API looks like**, endpoint by endpoint, with request/response examples
   (Part 5).
5. **How to build it**, in phases, with time estimates (Parts 6–9).

### 0.2 Who this is for

Someone who knows JavaScript/TypeScript and the general shape of HTTP, and who is about
to write their first Django application. It assumes **zero** prior Django knowledge and
**zero** prior SQL-relational-modelling knowledge beyond "a table has rows and columns".

### 0.3 What you need to know already

| You need                             | Why                                                            |
| ------------------------------------ | -------------------------------------------------------------- |
| JavaScript / TypeScript basics       | The API contract is JSON; the frontend you are wiring to is JS |
| HTTP verbs: GET, POST, PATCH, DELETE | Every endpoint is one of these                                 |
| JSON                                 | The wire format                                                |
| How to run a terminal command        | `python manage.py …` is the whole workflow                     |
| How to read an error traceback       | Django errors are verbose and helpful once you know the shape  |

**You do not need:** Django, Python frameworks, SQL, Docker, MongoDB, or any prior
backend experience.

### 0.4 Conventions used in this document

| Convention             | Meaning                                                                                                                                                                                                                                                                        |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `DT`                   | Tunisian Dinar. All prices are integers in DT — no cents. The frontend formats them with `Intl.NumberFormat('fr-FR')`                                                                                                                                                          |
| `YYYY-MM-DD`           | Date format everywhere in the API, matching what the frontend already parses (`ReservationModal.tsx:28-31`)                                                                                                                                                                    |
| `YYYY-MM-DDTHH:MM:SSZ` | Timestamp format (ISO 8601, UTC) for `created_at` / `updated_at`                                                                                                                                                                                                               |
| **UUID**               | Every model's primary key is a UUID v4 string, e.g. `8f14e45f-ceea-4a67-9d2b-4b0f1d6f3a21`. These are the public identifiers. There are no slugs. The frontend treats `id` as an opaque string — `getVehiclePath()` returns `/vehicules/${vehicle.id}` (`mockData.ts:862-864`) |
| **username**           | The customer's unique display handle: 3–30 ASCII letters or digits, no spaces, case-insensitive unique. It is **not** the login identifier; login stays email                                                                                                                  |
| **camelCase**          | Every JSON key. The frontend's TypeScript types use camelCase (`pricePerDayDT`, `agencyId`, `stockAvailable`) and you will not be renaming anything                                                                                                                            |
| `fr-FR`                | The locale for all user-facing text and number formatting. The codebase is 100% French (`index.html:2` sets `lang="fr"`)                                                                                                                                                       |
| **P0 / P1 / P2**       | Priority. P0 = must exist in the MVP. P1 = should exist. P2 = nice to have, cut if time is short                                                                                                                                                                               |

**On file references.** Statements about the current frontend cite `file:line` so you can
verify them yourself, e.g. `BikesCatalogPage.tsx:100-103`. All paths are relative to
`src/`.

### 0.5 The three things that will confuse you

**1. Django is not "the backend". Django is a toolbox you assemble into a backend.**
Django ships a web server, a router, an ORM, a templating system, an admin site, an
authentication system and a migration system. For a JSON API you will use maybe half of
it and ignore the rest. The half you ignore is the templating system — your API returns
JSON, never HTML.

**2. The ORM is not a database. It is a Python layer that writes SQL for you.**
`Vehicle.objects.filter(price_per_day_dt__lte=45)` becomes a `SELECT` statement. You
never write SQL in this project. But you must think in tables and relationships, because
that is what the ORM is modelling.

**3. A "view" is not a "view" in the React sense.**
In Django, a _view_ is a Python function or class that takes an HTTP request and returns
an HTTP response. It is the route handler. The React component that renders the result
is a different thing entirely.

---

## Part 1 — The product

### 1.1 What Rouli is

Rouli is a **shared electric mobility service** for Monastir, Tunisia. Customers browse
a catalogue of electric bikes and electric scooters, pick one available at a given agency
for a given date range, and reserve it online. They receive a **digital coupon** and
pay **nothing in advance** — they show the coupon at the agency, pick the vehicle up
ready to ride (checked, inflated, battery full), and pay in cash or by card on site.

Five agencies operate across the city: Marina, Zone Skanes, Ribat & Médina, Zone
Hôtelière (Dkhila) and Monastir Gare. Rental durations run from 1 to 7 days.

The commercial differentiators, all of which the backend must make true:

- **No online payment.** The reservation is free and the money moves at the counter.
- **No deposit.** "0 DT de caution" appears on the home page, the catalogue and the
  vehicle page. It is a legal and reputational claim, not a slogan.
- **No paper contract.** The coupon _is_ the contract.
- **Free cancellation** until the vehicle is handed over.

### 1.2 The problem it solves

From `ProblemSection.tsx`, with the marketing figures the backend must be able to
substantiate:

| Pain                                    | Figure                                                                                            | Source                     |
| --------------------------------------- | ------------------------------------------------------------------------------------------------- | -------------------------- |
| Time lost in traffic every day          | **45 minutes**                                                                                    | `ProblemSection.tsx:36`    |
| Annual fuel + parking cost for a driver | **1 850 DT / an**                                                                                 | `ProblemSection.tsx:57`    |
| Heat and dependency on taxis            | **35 °C**, crowded shared taxis                                                                   | `ProblemSection.tsx:78-84` |
| Named hotspots                          | Avenue Habib Bourguiba, Marina, rond-point des dauphins, entrée de Skanes, centre-ville, Facultés | `ProblemSection.tsx:42-46` |

The affected corridors are called out explicitly: _Axe Skanes • Centre-Ville •
Facultés_.

### 1.3 The solution

From `SolutionSection.tsx`, the six promised product capabilities. Each one is a
backend obligation, not a marketing line:

| #   | Promise                                                                      | What the backend must actually do                                                                           |
| --- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| 01  | **Disponibilité en direct** — see live availability for the dates you choose | Per-day stock per vehicle; the catalogue filters by the requested date range                                |
| 02  | **Réservation sans avance** — block a vehicle without touching a card        | No payment fields anywhere in the booking request or model                                                  |
| 03  | **Coupon digital immédiat** — instant confirmation with a scannable coupon   | Server-generated unique coupon code returned by the booking endpoint                                        |
| 04  | **Véhicule prêt & rechargé** — battery at 100 %, checked, on arrival         | Fleet state per vehicle; the agency handoff flow is out of MVP scope but the _claim_ must be backed by data |
| 05  | **Annulation 100% gratuite** — cancel in one click until handover            | A `PATCH` endpoint that cancels a reservation and returns the stock to the pool                             |
| 06  | **Réseau d'agences locales** — pick up at the agency of your choice          | The agency model, and per-agency vehicle lists                                                              |

### 1.4 How it works

The four steps shown to customers in `HowItWorks.tsx` are the product's canonical
journey. They are the skeleton of the feature set:

| Step | Title                      | Description                                                                                                     | Backend feature |
| ---- | -------------------------- | --------------------------------------------------------------------------------------------------------------- | --------------- |
| 01   | Choisissez votre véhicule  | "Sélectionnez un vélo ou une trottinette, une agence et vos dates (de 1 à 7 jours)."                            | F1, F2, F3      |
| 02   | Obtenez votre coupon       | "Votre réservation est confirmée instantanément avec un coupon digital sécurisé, sans payer d'avance en ligne." | F4              |
| 03   | Passez en agence           | "Votre deux-roues électrique vous attend contrôlé, gonflé et batterie pleine à l'agence de votre choix."        | F4, F10         |
| 04   | Retirez et payez sur place | "Présentez votre coupon, récupérez votre véhicule et payez sur place. Rapportez-le à la fin de votre location." | F4, F6          |

Note the date range constraint: **1 to 7 days**, stated in the product copy, the FAQ
(`FaqSection.tsx:22-23`), and the duration button group
(`ReservationModal.tsx:228`). The backend must enforce it.

### 1.5 Personas

**P1 — Mehdi, medical student** (from `SocialProof.tsx:11-19`)
Commutes between the university campus, the faculty and the CHU Fattouma Bourguiba
hospital. 54 trips. Values speed and cost; "24 DT la journée" matters. Books same-day,
picks up at the Ribat agency closest to campus.

**P2 — Yasmine, pharmacist** (from `SocialProof.tsx:21-26`)
41 trips. Books from her phone, wants the pickup to take two minutes. Uses the Zone
Skanes agency. Low tolerance for friction; the coupon flow is the product for her.

**P3 — Karim, shop owner at the Marina** (from `SocialProof.tsx:28-36`)
68 trips. Does round trips between the hotel zone and the port. Cares that the vehicle
is charged and checked every time. Books by phone.

**P4 — Agency employee** (not represented in the frontend today)
Works the counter at Marina. Needs to see today's pickups, validate a coupon code, and
mark a vehicle returned. This persona drives feature **F10** (staff operations) and is
the reason the admin panel matters.

**P5 — Platform admin** (not represented in the frontend today)
Manages the fleet, the agencies, the categories and the content. Uses Django Admin
directly. This persona drives the requirement that the data model be admin-manageable
without custom code.

### 1.6 Non-goals

Explicitly **out of scope** for the MVP. Saying so now prevents scope creep later:

- **Online payment.** No PSP integration, no card capture. Payment happens at the counter.
- **Mobile applications.** Web only.
- **Arabic / i18n.** The app is French-only. Adding `django-i18n` now would be premature.
- **Real-time tracking.** The "disponibilité en direct" promise means _current_ stock at
  request time, not push updates over a websocket.
- **Multi-tenant / franchise.** One operator, five agencies. No tenant isolation.
- **Vehicle handoff / return flow.** Marking a vehicle picked up or returned is staff
  work done in Django Admin, not a customer-facing flow.
- **A CMS for marketing copy.** Home and About page copy stays in the React components.
  Only genuinely tabular, database-shaped content moves to the server: FAQ, testimonials
  and platform statistics.
- **Email delivery.** No SMTP, no notification system. Coupons are shown on screen and
  listed in the profile. (The contact form stores the message; sending it is manual.)
- **Reviews with text.** Ratings only, in the MVP. A rating is attached to a completed
  reservation.

### 1.7 Success criteria for the MVP

The MVP is done when all of these are true:

1. The catalogue loads from the API, and **every filter, sort and price bound works
   server-side** with results identical to the current client-side implementation.
2. A customer can register, log in, reserve a vehicle for a date range, receive a unique
   coupon code, and see that coupon in their profile.
3. The stock system is honest: two people trying to book the last unit of a vehicle for
   the same dates cannot both succeed. The loser gets a clear `409`.
4. The vehicle and agency charts display **real availability, weekday demand and
   occupancy data** from the database, not the synthetic generators currently in
   `mockData.ts`.
5. A staff member can manage agencies, vehicles, stock and reservations from Django
   Admin without writing code.
6. The frontend and backend run side by side locally with a documented one-command
   startup, and the whole thing is covered by automated tests.

---

## Part 2 — Current state and feature specification

### 2.1 What the frontend is today

The frontend is complete and production-quality as a UI. It is a **static demo with no
server**. Concretely:

- **11 routes** (`App.tsx:136-148`): `/`, `/vehicules`, `/vehicules/:bikeId`, `/agences`,
  `/agences/:agencyId`, `/a-propos`, `/contact`, `/login`, `/signup`, `/profil`, plus a
  catch-all 404.
- **One data file.** `src/data/mockData.ts` (1152 lines) contains the entire domain:
  5 agencies, 11 vehicles, 1 user profile, 4 coupons, 6 reservations, platform stats,
  and the three synthetic chart generators.
- **Zero network calls.** A repository-wide search for `fetch(`, `axios`,
  `XMLHttpRequest`, `/api/`, `useQuery`, `useSWR` in `src/` returns **no matches**.
  There is no API client, no base URL, no environment variable, no service layer.
- **One `localStorage` key in the whole app:** `rouli-theme` (`ThemeToggle.tsx:23`).
  No token, no session, no cart, no draft.
- **The catalogue is filtered client-side** over the full in-memory array in a single
  `useMemo` (`BikesCatalogPage.tsx:133-173`). Search writes to the URL on every
  keystroke (`BikesCatalogPage.tsx:257`).

So: every field, filter, price, chart and piece of French copy the backend must serve
**already exists, in a fixed shape, in `mockData.ts`**. That file is the specification.
Your job is to reproduce it behind an API, and to fix the places where it is wrong.

### 2.2 Inventory: what is real and what is faked

| Area                                        | Reality                                           | Evidence                                                                                                                                                                      |
| ------------------------------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Routing, layout, navigation                 | **Real**                                          | `App.tsx`, `Navbar.tsx`, `Footer.tsx`                                                                                                                                         |
| Catalogue UI, filters, sorting              | **Real UI, fake data**                            | `BikesCatalogPage.tsx`                                                                                                                                                        |
| Vehicle detail page                         | **Real UI, fake data**                            | `BikeDetailPage.tsx`                                                                                                                                                          |
| Agency list + detail                        | **Real UI, fake data**                            | `AgenciesPage.tsx`, `AgencyDetailPage.tsx`                                                                                                                                    |
| Booking flow                                | **Completely faked**                              | `ReservationModal.tsx:53-67` — `handleConfirm` calls `e.preventDefault()` and sets local state. No request is ever made                                                       |
| Coupon code                                 | **Generated in the browser**                      | `ReservationModal.tsx:62` — `` `RL-MNS-${Math.floor(1000 + Math.random() * 9000)}` ``                                                                                         |
| Date selection                              | **Does not exist**                                | No `<input type="date">` anywhere in `src/`. `?start`/`?end` are read (`BikesCatalogPage.tsx:111-112`) but never written by any UI, so the modal's date branch is unreachable |
| Login / Signup                              | **Faked**                                         | `LoginPage.tsx:19-21` and `SignupPage.tsx:22-23` set a demo notice string and call no API                                                                                     |
| Profile save                                | **Faked**                                         | `ProfilePage.tsx:126-130` — `saveProfile` sets `editing=false` and a success notice. State is lost on navigation                                                              |
| Profile stats, coupons, history             | **Faked**                                         | Sourced from `USER_PROFILE` / `USER_COUPONS` / `USER_RESERVATIONS` constants                                                                                                  |
| Contact form                                | **Faked**                                         | `ContactPage.tsx:61-64` — `setSubmitted(true)` and nothing else. The "Message envoyé" panel is a fiction; no message is stored                                                |
| Vehicle radar chart                         | **Synthetic, deterministic — removed in the MVP** | `mockData.ts:909-953` — normalises real specs against fixed bounds, plus a catalogue average. Replaced by availability and weekday-demand charts                              |
| Vehicle booking-trend chart                 | **Synthetic, deterministic — removed in the MVP** | `mockData.ts:963-984` — a sine wave times a weekend multiplier, seeded off `reviewsCount`. Replaced by real availability data                                                 |
| Vehicle availability chart                  | **Does not exist today**                          | New: free units per day for the next 14 days, from `VehicleAvailability`                                                                                                      |
| Vehicle weekday-demand chart                | **Does not exist today**                          | New: real reservations for this vehicle grouped by weekday over the last 90 days                                                                                              |
| Agency load chart                           | **Synthetic, deterministic**                      | `mockData.ts:1009-1040` — two gaussians and a lunch dip, seeded off a hash of the agency id. Replaced by real reservation aggregation                                         |
| Reviews                                     | **Aggregate only**                                | `rating: number` and `reviewsCount: number` on the vehicle. No review objects, no text, despite the "avis vérifiés" label at `BikeDetailPage.tsx:138`                         |
| Legal pages (CGV, confidentialité, cookies) | **Do not exist**                                  | `mailto:` links to `support@rouli.tn` in `Footer.tsx:97-120`                                                                                                                  |
| Password reset                              | **Does not exist**                                | "Mot de passe oublié ?" links to `/contact` (`LoginPage.tsx:68-73`)                                                                                                           |

### 2.3 Frontend defects the backend must not inherit

These are **real bugs in the current code**. The backend implements the _correct_
behaviour, and each one becomes a small frontend fix. They are listed here so the
mismatch is planned, not discovered later.

| #   | Defect                                                                                                                                 | Where                                               | Correct behaviour                                                           | Impact if inherited                                                                                                                                         |
| --- | -------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | `price` defaults to **18**, not 45. `Number(null) === 0`, and `0` is finite, so the `45` fallback is unreachable                       | `BikesCatalogPage.tsx:100-103`                      | Absent `price` means "no maximum" = 45                                      | Bare `/vehicules` shows **1 of 11 vehicles**. The "Réinitialiser" button is permanently visible because `hasActiveFilters` tests `maxPrice !== 45` (`:189`) |
| D2  | `popularity` sorts on `rating` only; `reviewsCount` is ignored despite the label "Popularité & Avis"                                   | `BikesCatalogPage.tsx:167-172`                      | Sort by rating, then by review count as a tiebreaker                        | Ranking does not match the label                                                                                                                            |
| D3  | Search `q` is **not trimmed** and does **not** fold accents                                                                            | `BikesCatalogPage.tsx:156-165`                      | Trim the query; fold accents so `"electrique"` matches `"Électrique"`       | `?q=%20cowboy` returns nothing. Users typing accented characters get zero results                                                                           |
| D4  | Search matches only 4 fields: `name`, `agencyName`, `description`, `categoryLabel`. Not `features`, not `tag`, not `agency.localities` | `BikesCatalogPage.tsx:156-165`                      | Server searches a defined, documented field set                             | Users searching "casque" or "Corniche" find nothing                                                                                                         |
| D5  | Two different category label vocabularies coexist: filter pills say `"VTC & Balade"`, vehicles say `"VTC Confort & Balade"`            | `BikesCatalogPage.tsx:35-54` vs `mockData.ts:185`   | One `Category` table, one canonical label                                   | Every label must be changed in two places                                                                                                                   |
| D6  | `?zone=` is linked from the footer for 4 postal codes but never read by `AgenciesPage`                                                 | `Footer.tsx:57-66` vs `AgenciesPage.tsx:31`         | The agency list reads `zone`                                                | The footer's "Secteurs à Monastir" column does nothing                                                                                                      |
| D7  | Chart axis dates format with `en-US` in a fully French app                                                                             | `charts/chart-formatters.ts:1-4`                    | `fr-FR`                                                                     | Axis reads "Oct 8" instead of "8 oct"                                                                                                                       |
| D8  | Agency hours are hardcoded twice: `"08h00 – 20h00, 7j/7"` on the vehicle page vs `"Lun – Dim : 08h00 – 20h00"` in the data             | `BikeDetailPage.tsx:306` vs `mockData.ts:54`        | One source: the `Agency` record                                             | The two can drift apart                                                                                                                                     |
| D9  | "Vehicle count" means two different things: catalogue **rows** on the agencies page, but **sum of stock** on the home page             | `AgenciesPage.tsx:11-12` vs `SocialProof.tsx:8`     | Two explicit fields: `vehicle_count` (models) and `available_count` (units) | Two pages quote incompatible numbers for "véhicules"                                                                                                        |
| D10 | The `all` pseudo-agency is a real row in the data, rendered as a filter option, but 404s on its own detail page                        | `mockData.ts:38-44`, `AgencyDetailPage.tsx:32`      | Not a database row. The frontend synthesises it                             | A "ghost" record in the database                                                                                                                            |
| D11 | The "Fermer et conserver mon coupon" button stores nothing                                                                             | `ReservationModal.tsx:156-161`                      | The coupon is persisted server-side and listed in the profile               | A false promise to the customer                                                                                                                             |
| D12 | The mobile filter drawer omits the stock toggle (desktop-only)                                                                         | `BikesCatalogPage.tsx:462-478` vs drawer `:713-796` | Drawer exposes every filter                                                 | Mobile users cannot see out-of-stock vehicles                                                                                                               |

### 2.4 Feature specifications

Each feature below states the user story, the behaviour, the API dependency, its
priority and its acceptance criteria. **Acceptance criteria are written so they can
become automated tests.** They are the contract between the frontend and the backend.

---

#### F1 — Catalogue, filtering, sorting · **P0**

**Story.** As a visitor on the home page, I want to see every vehicle available in
Monastir, narrow the list by type, category, agency, price and free text, and sort the
results, so that I can find the right vehicle quickly.

**Behaviour.**

- The catalogue is one route (`/vehicules`). The vehicle type is a scope, not a filter:
  `?type=bike` or `?type=scooter`; absent means both. This is already the case and must
  not be changed (`README.md:39-40`).
- Filters: category, agency, maximum daily price, free-text search, and an
  "include out-of-stock vehicles" toggle.
- Sorting: popularity (rating desc, then review count desc), price ascending, price
  descending, range descending.
- The results count is displayed in a polite live region
  (`BikesCatalogPage.tsx:495-504`).
- **No pagination exists today.** The MVP adds it, because a server-side filter is
  worthless without a limit. `?page=1` joins the existing URL parameters.

**API dependency.** `GET /api/v1/vehicles` with query parameters; `GET
/api/v1/vehicles/facets` for the per-agency counts.

**Acceptance criteria.**

1. `GET /api/v1/vehicles` with no parameters returns all 11 seeded vehicles.
2. `?type=scooter` returns exactly the 3 scooters.
3. `?type=bike&cat=<vtc-category-id>` returns exactly the 2 VTC bikes.
4. `?agency=<marina-agency-id>` returns only vehicles whose agency is Marina.
5. `?price=20` returns only vehicles with `price_per_day_dt <= 20`.
6. `?price` absent returns **all** vehicles (D1 fixed: the server default is 45, and the
   frontend is corrected to match).
7. `?q=cowboy` returns the Cowboy 4 ST. `?q=COWBOY` returns it too (case-insensitive).
8. `?q=electrique` returns the same as `?q=électrique` (accent folding, D3 fixed).
9. `?q=  cowboy  ` returns the Cowboy 4 ST (trimmed, D3 fixed).
10. `?sort=price-asc` returns results in non-decreasing `price_per_day_dt` order.
11. `?sort=popularity` returns results in non-increasing `rating` order.
12. `?stock=0` includes vehicles with zero available units; omitting `stock` excludes
    them.
13. `?start=2026-11-01&end=2026-11-03` excludes any vehicle that is not available for
    **every** day in the range (inclusive of both endpoints — see §5.5).
14. The response body contains `items`, `total`, `page`, `page_size`, `total_pages`.
15. `?page=2` returns a different set of items and `total` stays the same.

---

#### F2 — Vehicle detail page · **P0**

**Story.** As a visitor, I want to see everything about one vehicle — its specs, its
accessories, where I can pick it up and what it costs — so that I can decide to book
it.

**Behaviour.** The detail page renders, in order: breadcrumb; hero image with the
category badge and the marketing tag; rating and review count; pickup strip (agency name,
postal code, "disponibles aujourd'hui"); a 4-tile spec grid (range, max speed, motor
torque, charge time); the title, description and price block; the features checklist;
the CTA; the agency card; an 8-row technical spec table; the accessories panel; two
charts; and three related vehicles.

**API dependency.** `GET /api/v1/vehicles/{id}` returns the full vehicle including
the fields the catalogue does not show. `GET /api/v1/vehicles/{id}/related` returns
the three similar vehicles.

**Acceptance criteria.**

1. `GET /api/v1/vehicles/{id}` for the seeded Cowboy 4 ST returns a body containing
   every field the detail page renders (see Appendix B for the full list).
2. The response contains `pricePerDayDT: 24` and `pricePerHourDT: 4.8` for that
   vehicle.
3. `features` and `includedAccessories` are arrays of strings, in the order the
   frontend displays them.
4. `GET /api/v1/vehicles/00000000-0000-0000-0000-000000000000` returns `404` with the
   standard error envelope.
5. `GET /api/v1/vehicles/{id}/related` for the Cowboy returns 3 vehicles, none of them
   the Cowboy itself, and every one of them is ranked with the same rule the frontend
   uses (same `vehicle_type` scores +2, same `category` scores +1,
   `mockData.ts:1070-1075`).
6. The `available_units` field reflects real stock for the requested date range, or
   today's stock when no range is given.

---

#### F3 — Agency network · **P0**

**Story.** As a visitor, I want to see the five agencies, where they are, when they
open and what I can pick up there, so that I choose the one closest to me.

**Behaviour.** The list page (`/agences`) supports a text search across
`name`, `short_name`, `address`, `postal_code`, `description`, `landmarks` and
`localities`; a zone filter on `postal_code`; and three sorts (relevance, name A–Z,
most vehicles). The detail page (`/agences/:agencyId`) shows the full record, the
agency's vehicle list, and an occupancy chart.

**API dependency.** `GET /api/v1/agencies`, `GET /api/v1/agencies/{id}`,
`GET /api/v1/agencies/{id}/vehicles`, `GET /api/v1/agencies/{id}/load`.

**Acceptance criteria.**

1. `GET /api/v1/agencies` returns exactly 5 agencies. There is **no** `all` agency in
   the database (D10 fixed).
2. Each agency carries `id`, `name`, `short_name`, `postal_code`, `address`,
   `description`, `phone`, `hours`, `image`, `latitude`, `longitude`, `landmarks[]`,
   `localities[]`.
3. `?q=skanes` returns the Zone Skanes agency, because `"Skanes"` appears in its name,
   its description, its landmarks and its localities.
4. `?zone=5065` returns only the Zone Hôtelière agency.
5. `?sort=vehicles` orders by `vehicle_count` descending.
6. Each agency in the list response includes `vehicle_count` (number of distinct models)
   and `available_count` (sum of units) — two distinct numbers, so D9 cannot recur.
7. `GET /api/v1/agencies/{id}/load?granularity=hour` for the Marina agency returns
   exactly 13 points, one per opening hour from `08h` to `20h`.
8. `GET /api/v1/agencies/{id}/load?granularity=day` returns exactly 7 points, labelled
   `Lun` … `Dim`.
9. `GET /api/v1/agencies/all` returns `404` — `all` is a frontend sentinel, not an id.

---

#### F4 — Booking and the digital coupon · **P0**

**Story.** As a logged-in customer, I want to reserve a vehicle for a specific date
range and receive a coupon code immediately, so that I can go to the agency and pick it
up.

**Behaviour.**

- **A logged-in account is required.** (This is a deliberate decision: it removes
  orphaned reservations and makes the coupon recoverable if the browser is closed. The
  current frontend copy — "La réservation reste accessible sans compte" — will be
  updated.)
- The request carries: vehicle, pickup agency, start date, end date.
- The server **recomputes** the duration and the total. It never trusts a client-sent
  price or day count.
- Duration must be between 1 and 7 days. The end date is **exclusive**: `start ==
end` means 1 day, `start` to `start + 3` means 3 days. This matches
  `daysBetween()` in `ReservationModal.tsx:33-38` exactly.
- The server mints a unique coupon code in the existing format `RL-MNS-####`
  (`mockData.ts:697`).
- Stock is decremented for every day in the range. If any day does not have enough
  units, the whole booking fails with `409` and nothing is decremented.
- The response returns the coupon code, the total, the period, the pickup agency and the
  reservation id.
- The customer can cancel for free until the vehicle is handed over, which restores the
  stock.

**API dependency.** `POST /api/v1/reservations`, `PATCH
/api/v1/reservations/{id}/cancel`, `GET /api/v1/reservations/{id}`.

**Acceptance criteria.**

1. `POST /api/v1/reservations` with a valid payload returns `201` and a body with
   `code`, `id`, `vehicle`, `agency`, `start_date`, `end_date`, `days`, `total_dt` and
   `status`.
2. The returned `total_dt` equals `price_per_day_dt × days`, computed by the server.
3. A request that tries to send `total_dt: 0` is ignored — the server's value is used.
4. A request for a 0-day range (`start == end`) succeeds with `days == 1`.
5. A request for a 8-day range returns `400` with a field error on `end_date`.
6. A request whose `start_date` is in the past returns `400`.
7. Booking the last available unit of a vehicle for a date range succeeds; a second
   identical booking from a different user returns `409` with a clear message.
8. A failed booking for any reason leaves availability **unchanged** for every day.
9. The coupon code is unique across all reservations. `RL-MNS-` + 4 digits is not
   enough entropy for a real system, so the server format is `RL-MNS-` + 6
   uppercase-alphanumeric characters, and the frontend pattern is updated to match.
   (Documented as a deliberate change in §9.)
10. The reservation appears in `GET /api/v1/me/reservations` immediately.
11. `PATCH /api/v1/reservations/{id}/cancel` succeeds, sets the status to `cancelled`
    and restores availability. Cancelling twice returns `409`.
12. A user cannot cancel another user's reservation: returns `404` (not `403`, to avoid
    confirming the id exists).

---

#### F5 — Accounts and authentication · **P0**

**Story.** As a customer, I want to create an account and log in, so that my
reservations and coupons are saved.

**Behaviour.**

- Registration collects: username, email, phone, password, and acceptance of the
  terms (`SignupPage.tsx:42-174`). The username is the display handle: 3–30 ASCII
  letters or digits, no spaces, unique without regard to case. Email remains the login
  identifier.
- The password rule is a minimum of 8 characters (`SignupPage.tsx:122`). The MVP keeps
  exactly this rule and does not invent stronger ones.
- Authentication returns a JWT access token and a refresh token. The access token is
  short-lived; the refresh token renews it.
- "Se souvenir de moi" (`LoginPage.tsx:120`) controls the **refresh** token lifetime:
  long-lived when checked, session-scoped when not.

**API dependency.** `POST /api/v1/auth/register`, `POST /api/v1/auth/login`,
`POST /api/v1/auth/refresh`, `POST /api/v1/auth/logout`, `GET /api/v1/me`,
`PATCH /api/v1/me`.

**Acceptance criteria.**

1. Registration with a valid payload returns `201` with the user and a token pair.
2. Registering an email that already exists returns `400` with a field error on
   `email`.
3. Registering a username that already exists, in any letter case, returns `400` with a
   field error on `username`.
4. A username shorter than 3 characters, longer than 30, or containing a space or any
   non-alphanumeric character returns `400` with a field error on `username`.
5. The stored user has a `username` and no `first_name`, `last_name` or `full_name`
   column.
6. Registration with a 7-character password returns `400` with a field error on
   `password`.
7. Logging in with correct credentials returns `200` with `access` and `refresh` tokens.
8. Logging in with a wrong password returns `401` with the same generic message as an
   unknown email (no user enumeration).
9. `GET /api/v1/me` without a token returns `401`.
10. `GET /api/v1/me` with a valid access token returns the profile.
11. An expired or malformed token returns `401`.
12. `POST /api/v1/auth/logout` blacklists the refresh token. Using it afterwards
    returns `401`.
13. The password is never present in any response body, in any form.

---

#### F6 — Profile: stats, coupons, history, loyalty · **P0**

**Story.** As a customer, I want to see my current rental, my active coupons, my
history and my loyalty progress, so that I can manage my account.

**Behaviour.** The profile page (`/profil`) renders seven panels: a header with avatar,
name, tier badge and contact details; four stat tiles; the current reservation; active
coupons; reservation history; the loyalty programme; and the editable personal
information form. A separate "Paramètres du compte" block is read-only in the MVP.

**The four stat tiles** (`ProfilePage.tsx:199-210`) are computed from **completed
reservations only** (`mockData.ts:820-830`):

| Tile              | Rule                                          |
| ----------------- | --------------------------------------------- |
| Trajets réalisés  | count of completed reservations               |
| Jours de location | sum of `days` over completed reservations     |
| Total dépensé     | sum of `total_dt` over completed reservations |
| CO₂ économisé     | `round(total_days × 4.6)` kg                  |

**The loyalty programme** shows `loyalty_points` against a 1500-point threshold
(`ProfilePage.tsx:93`). The tier badge "Membre Gold" is hardcoded today
(`ProfilePage.tsx:153`); the MVP derives the tier from the point balance and displays
the French tier label (Bronze, Argent, Or, Platine).

**Earning rule.** A reservation credits:

```
points = days × 10 + floor(total_dt / 5)
```

Longer rentals and more expensive (premium) vehicles earn more. The points are
credited when the reservation is created, in the same transaction as the stock
decrement, and reversed when it becomes `cancelled` or `expired`. The balance never
goes below 0. The awarded amount is stored on the reservation
(`loyalty_points_awarded`) so a cancellation reverses exactly what was earned, and a
second cancellation cannot reverse it twice. The 1500-point free-day reward remains a
display threshold in the MVP; redeeming it is out of scope.

**API dependency.** `GET /api/v1/me`, `GET /api/v1/me/stats`, `GET /api/v1/me/coupons`,
`GET /api/v1/me/reservations`, `PATCH /api/v1/me`.

**Acceptance criteria.**

1. `GET /api/v1/me/stats` returns exactly the four keys `rides`, `total_days`,
   `total_dt` and `co2_saved_kg`.
2. The stats count only reservations with status `completed`. A `cancelled` reservation
   contributes nothing.
3. `co2_saved_kg` equals `round(total_days × 4.6)`.
4. `GET /api/v1/me/coupons` returns only reservations whose coupon is still usable
   (status `pending` or `active`) — matching the frontend's `status === "active"`
   filter (`ProfilePage.tsx:91`).
5. `GET /api/v1/me/reservations` returns the customer's reservations, most recent first.
6. The `loyalty_tier` returned by `GET /api/v1/me` is derived from the point balance, not
   hardcoded: Bronze below 500, Argent 500–999, Or 1000–1499, Platine 1500 and above.
7. Creating a 3-day reservation with a `total_dt` of 72 credits exactly 44 points
   (`3 × 10 + floor(72 / 5)`).
8. Cancelling that reservation subtracts exactly 44 points. Cancelling twice returns
   `409` and does not subtract a second time.
9. Marking a reservation `expired` also reverses its points, and the balance is floored
   at 0 rather than going negative.
10. `PATCH /api/v1/me` updates `username`, `phone`, `city` and `address`, and returns
    the updated record. Changing the username to one already in use returns `400`.
11. `PATCH /api/v1/me` containing `email` returns `400` with a field error on `email`,
    and the stored email and login identifier are unchanged.
12. `loyalty_points` is read-only: sending it in `PATCH /api/v1/me` cannot change it.

---

#### F7 — Contact form · **P1**

**Story.** As a visitor with a question, I want to send a message and get a
confirmation, so that I know it was received.

**Behaviour.** The form collects name, email, subject and message. The subject is one of
five fixed values (`ContactPage.tsx:42-48`):

1. `Question sur une réservation`
2. `Assistance pendant une location`
3. `Devenir agence partenaire`
4. `Presse & médias`
5. `Autre demande`

The message is capped at 2000 characters (`ContactPage.tsx:254`).

**API dependency.** `POST /api/v1/contact`.

**Acceptance criteria.**

1. A valid submission returns `201` and stores the message.
2. The stored message is visible in Django Admin with a `handled` boolean, default
   `False`.
3. A message longer than 2000 characters returns `400`.
4. A missing name, email or message returns `400` with a field error for each.
5. The `subject` value must be one of the five; anything else returns `400`.

---

#### F8 — Content: FAQ, testimonials, platform statistics · **P1**

**Story.** As a visitor, I want the FAQ and the social proof to be accurate and
editable without a code change, so that the marketing content stays current.

**Behaviour.** Three small content sets are served from the API instead of being
hardcoded:

- **FAQ** — 7 question/answer pairs, currently inline in `FaqSection.tsx:8-37`.
- **Testimonials** — 3 entries with name, city, role, quote and ride count, currently
  inline in `SocialProof.tsx:11-36`.
- **Platform statistics** — `active_users` (8500), `reviews` (3200), `platform_rating`
  (4.9) and `fleet_size`, currently in `mockData.ts:847-850` and hardcoded in three
  components.

**API dependency.** `GET /api/v1/faq`, `GET /api/v1/testimonials`, `GET /api/v1/stats`.

**Acceptance criteria.**

1. `GET /api/v1/faq` returns exactly 7 entries, in display order, each with `question`
   and `answer`.
2. The FAQ answers are byte-identical to the current French text, including the
   typographic apostrophe `d’office` in entry 5 (`FaqSection.tsx:27`).
3. `GET /api/v1/testimonials` returns exactly 3 entries.
4. `GET /api/v1/stats` returns the 4 statistic keys. `active_users` and `reviews` are
   the stored values; `fleet_size` is computed live from the sum of available units, so
   it can never contradict the catalogue.
5. Adding a FAQ row in Django Admin makes it appear in the API response without a code
   change.

---

#### F9 — Availability and demand charts · **P1**

**Story.** As a visitor, I want to know which days the vehicle is free and which
weekdays it is most in demand, so that I can pick a date when I am likely to get it
and avoid the busiest days.

**Behaviour.** Two charts on the vehicle page, one on the agency page.

| Chart                                        | Data                                                                                        | Source today                 |
| -------------------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------- |
| Disponibilité (bar, 14 days)                 | Free units per day for this vehicle, with its total units                                   | `VehicleAvailability` (real) |
| Demande par jour de la semaine (bar, 7 days) | Reservations for this vehicle grouped by the weekday of `start_date`, over the last 90 days | Real reservations            |
| Affluence de l'agence (bar)                  | Occupancy % per opening hour and per weekday                                                | Real reservations            |

The old radar and 14-day booking-trend charts are **removed**. The radar's normalised
0–100 scores are arbitrary relative numbers that a customer cannot act on; daily
reservations are business analytics rather than a booking aid. Availability and
weekday demand answer the two questions a customer actually has: _can I get it?_ and
_when is it calm?_

**API dependency.** `GET /api/v1/vehicles/{id}/availability?days=14`,
`GET /api/v1/vehicles/{id}/demand-by-weekday?window=90`,
`GET /api/v1/agencies/{id}/load`.

**Acceptance criteria.**

1. The availability response returns exactly 14 points, one per day, starting today.
2. Each point has `date`, `availableUnits` and `totalUnits`. `availableUnits` is the
   real row for that vehicle and day, never negative and never greater than
   `totalUnits`.
3. Booking the last unit makes the corresponding availability point `0` on the next
   request; cancelling the reservation restores it.
4. The weekday-demand response returns exactly 7 points labelled `Lun` … `Dim`.
5. The weekday counts sum to the number of reservations for that vehicle whose
   `start_date` falls inside the 90-day window and whose status is `pending`, `active`
   or `completed`. Cancelled and expired reservations do not count.
6. The agency load response returns 13 hourly points labelled `08h`…`20h` and 7
   weekday points labelled `Lun`…`Dim`.
7. Every occupancy value is between 0 and 100 inclusive.

---

#### F10 — Staff and admin operations · **P1**

**Story.** As an agency employee, I want to see today's pickups and validate a coupon
code, so that the counter runs smoothly.

**Behaviour.** Mostly fulfilled by **Django Admin**, which is free once the models
exist. Three staff capabilities need API support:

- **Look up a reservation by coupon code.** The counter clerk types `RL-MNS-XXXXXX`.
- **Mark a vehicle picked up or returned**, which drives the reservation status and the
  stock.
- **See today's pickups for an agency.**

**API dependency.** `GET /api/v1/staff/reservations?code=…`,
`GET /api/v1/staff/agencies/{id}/pickups?date=…`, and Django Admin for the rest.

**Acceptance criteria.**

1. Staff endpoints require authentication **and** the `staff` role. A customer token
   returns `403`.
2. `GET /api/v1/staff/reservations?code=RL-MNS-XXXXXX` returns the matching reservation,
   or `404` if the code is unknown or does not belong to that agency.
3. A staff member can change a reservation's status through the Django Admin actions,
   and the change is reflected in the customer's profile view on the next request.
   Cancelling or expiring through admin also reverses the reservation's loyalty points.
4. Marking a reservation `active` (picked up) removes the reserved units from the
   available pool for the days already elapsed, and restores them for the days still
   ahead.

---

### 2.5 Priority summary

| Feature             | Priority | Depends on                       |
| ------------------- | -------- | -------------------------------- |
| F1 Catalogue        | **P0**   | —                                |
| F2 Vehicle detail   | **P0**   | —                                |
| F3 Agency network   | **P0**   | —                                |
| F5 Accounts & auth  | **P0**   | —                                |
| F4 Booking & coupon | **P0**   | F1, F2, F3, F5                   |
| F6 Profile          | **P0**   | F4, F5                           |
| F7 Contact          | P1       | —                                |
| F8 Content          | P1       | —                                |
| F9 Analytics        | P1       | F4 (needs reservations to exist) |
| F10 Staff ops       | P1       | F4, F5                           |

**The critical path is F1 → F5 → F4.** Everything else can be added around it. F9 is
interesting but it is the first thing to cut if you are short on time, because it is
visual polish over a working core. Do **not** cut F4 — a booking system that cannot
book is not an MVP.

---

## Part 3 — Django concepts, from zero

This part is the textbook you would otherwise have to read. It is ordered the way you
will meet the concepts. **Read it before writing any code.** Every example uses Rouli's
real domain, so you can picture what it does.

---

### 3.1 What Django actually is

Django is a **Python web framework**: a set of conventions and tools for building web
applications. It was created at the newspaper company Django (the "journaliste" in its
name) to build news sites, and it is now the most common Python web framework.

Django's core idea is **"batteries included"**: instead of assembling your own
routing, database layer, auth and admin from scratch, Django provides all of them and
expects you to follow its conventions so they work together.

**Django's layered architecture (MVT).**

```
Browser (React SPA)
      │  HTTP request  GET /api/v1/vehicles?type=bike
      ▼
┌──────────────────────────────────────────────┐
│  URL dispatcher        (urls.py)             │  "which function handles /api/v1/vehicles?"
│  ↓                                           │
│  View                   (views.py)           │  "read the request, call the model, return data"
│  ↓                                           │
│  Serializer             (serializers.py)     │  "convert model instances to JSON, validate input"
│  ↓                                           │
│  Model / ORM            (models.py)          │  "read and write the database"
└──────────────────────────────────────────────┘
      ▼
   SQLite file  (db.sqlite3)
```

The **Template** layer (HTML rendering) exists in Django but this project will not use
it — the React frontend renders everything. Your view returns JSON, not HTML.

Django ships with **Django REST Framework (DRF)** as an add-on, and this project uses
it for everything. DRF is not a different framework; it is a layer that plugs into
Django and gives you serializers, viewsets, permissions, authentication and a browsable
web interface for free.

---

### 3.2 The project layout

Creating a project produces this:

```
rouli-backend/
├── manage.py            # the command-line entry point
├── rouli/               # the project package (settings, root urls)
│   ├── __init__.py
│   ├── settings.py      # ALL configuration
│   ├── urls.py          # the root URL map
│   ├── asgi.py          # ASGI entry point (async servers)
│   └── wsgi.py          # WSGI entry point (classic servers)
├── vehicles/            # an app
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   ├── urls.py
│   ├── admin.py
│   ├── tests.py
│   └── migrations/      # generated, and COMMITTED to git
├── accounts/
├── agencies/
├── bookings/
└── content/
```

**`manage.py`** is a tiny script whose only job is to find `settings.py` and run a
command. You will use it dozens of times a day:

```bash
python manage.py runserver          # start the dev server on :8000
python manage.py makemigrations     # generate migration files from your models
python manage.py migrate            # apply migrations to the database
python manage.py createsuperuser    # create an admin user
python manage.py shell              # interactive Python with your models loaded
python manage.py test               # run the test suite
```

**`settings.py`** holds every knob: the database, installed apps, middleware, static
files, CORS, REST Framework configuration, and your secret key. It reads environment
variables so that secrets never live in the file (see §3.13).

**`urls.py`** is the router. It maps a URL path to a view. A project's root `urls.py`
usually just includes each app's `urls.py`:

```python
# rouli/urls.py
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/", include("vehicles.urls")),
    path("api/v1/", include("bookings.urls")),
]
```

`include()` means "hand everything starting with this prefix to that app's own url
map". The app's `urls.py` then maps the remainder:

```python
# vehicles/urls.py
router = DefaultRouter()
router.register("vehicles", VehicleViewSet)

urlpatterns = [path("", include(router.urls))]
```

**A very important Django convention:** in a view, `request` is the incoming HTTP
request and `response` is what you send back. A Django view is just a function
`def my_view(request) -> HttpResponse`.

---

### 3.3 Apps

An **app** is a Python package with a specific name that owns a slice of the domain.
`vehicles` owns vehicles, `bookings` owns reservations. Django's docs call them
"reusable Python packages" — that is the ideal; in practice you split by feature.

Create one with:

```bash
python manage.py startapp vehicles
```

Then add it to `INSTALLED_APPS` in `settings.py`:

```python
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "rest_framework_simplejwt",
    "corsheaders",
    # your apps
    "accounts",
    "vehicles",
    "agencies",
    "bookings",
    "content",
]
```

**Why it matters.** Adding an app to `INSTALLED_APPS` tells Django three things: where
to find its models (so the ORM can create its table), where to find its migrations, and
where to find its templates. If you forget this line, your models will not have tables
and `migrate` will not create them.

**Which apps this project uses** (5, one per domain area):

| App        | Owns                                                 |
| ---------- | ---------------------------------------------------- |
| `accounts` | `User`, `Profile`, auth endpoints                    |
| `agencies` | `Agency`                                             |
| `vehicles` | `Category`, `Vehicle`, `VehicleAvailability`, charts |
| `bookings` | `Reservation`, `Review`, booking endpoints           |
| `content`  | `Faq`, `Testimonial`, `SiteStat`, `ContactMessage`   |

---

### 3.4 Models and the ORM

A **model** is a Python class that describes one table in the database. Subclassing
`models.Model` tells Django's ORM to manage it.

```python
# vehicles/models.py
from django.db import models


class Vehicle(models.Model):
    name = models.CharField(max_length=120)
    price_per_day_dt = models.PositiveIntegerField()

    def __str__(self) -> str:
        return self.name
```

That class _is_ the table definition, the query interface, and the validation rules.
There is no separate schema file.

**The field types you will use:**

| Field                                       | Stores                     | Notes                                                                                         |
| ------------------------------------------- | -------------------------- | --------------------------------------------------------------------------------------------- |
| `CharField(max_length=N)`                   | Short text                 | `max_length` is **required**. `blank=False` (default) means the form cannot be empty          |
| `TextField()`                               | Long text                  | No `max_length` needed                                                                        |
| `IntegerField()` / `PositiveIntegerField()` | Whole numbers              | Use `PositiveIntegerField` for counts and prices — it rejects negatives at the database level |
| `DecimalField(max_digits, decimal_places)`  | Exact decimals             | We do **not** use it: prices are whole DT, so `PositiveIntegerField` is correct and simpler   |
| `FloatField()`                              | Approximate decimals       | Avoid for money                                                                               |
| `BooleanField(default=…)`                   | True/False                 | Always give it a `default`                                                                    |
| `DateField()`                               | A calendar date            | Stores `2026-11-01`                                                                           |
| `DateTimeField(auto_now_add=True)`          | A timestamp                | `auto_now_add` sets it on insert and never changes it again                                   |
| `JSONField(default=list)`                   | Arbitrary JSON             | Perfect for a list of strings like `landmarks`                                                |
| `ForeignKey(Other, on_delete=…)`            | A reference to another row | See §3.7                                                                                      |
| `SlugField(unique=True)`                    | A URL-safe string id       | Perfect for `bike-cowboy-4`                                                                   |
| `UUIDField(default=uuid.uuid4)`             | A random id                | Use if you do not want guessable ids                                                          |

**`null` vs `blank` — the distinction that confuses everyone.**

- `null=True` → the column may be `NULL` in the database (no value at all).
- `blank=True` → the **form** may be submitted empty (e.g. an empty string `""`).

These are different things, and Django's full_clean() will complain if they
disagree. The rule of thumb: `null=True` only for genuinely optional columns, and
prefer `null=False, blank=True` for optional text fields. For this project, most
optional fields are `blank=True, null=True`.

**`__str__`** is what Django shows when you print an object or look at it in the
admin. Always define it — it turns `print(vehicle)` from
`<Vehicle: Vehicle object (1)>` into `Cowboy 4 ST`.

**`Meta` options.** A nested class on the model controls table-level behaviour:

```python
class Vehicle(models.Model):
    ...
    class Meta:
        ordering = ["name"]        # default sort order for every queryset
        verbose_name_plural = "véhicules"
        indexes = [
            models.Index(fields=["agency", "price_per_day_dt"]),
        ]
        constraints = [
            models.CheckConstraint(
                check=models.Q(price_per_day_dt__gte=0),
                name="vehicle_price_non_negative",
            ),
        ]
```

`ordering` matters: it is the default sort for every query that does not specify one.
`indexes` and `constraints` are enforced **by the database**, not by Python — which
means they hold even if another tool writes to the table.

---

### 3.5 Migrations

A **migration** is a file describing a change to the database schema. Django compares
your models to the database, and migrations are how you tell it what to actually do.

Two commands, and you will run them in this order, every time:

```bash
python manage.py makemigrations     # 1. READ the models, WRITE a migration file
python manage.py migrate            # 2. READ the migration file, APPLY it
```

`makemigrations` creates a numbered file in `vehicles/migrations/0001_initial.py`:

```python
class Migration(migrations.Migration):
    initial = True
    dependencies = []
    operations = [
        migrations.CreateModel(
            name="Vehicle",
            fields=[
                ("id", models.BigAutoField(primary_key=True, serialize=False)),
                ("name", models.CharField(max_length=120)),
                ("price_per_day_dt", models.PositiveIntegerField()),
            ],
        ),
    ]
```

**Rules you must not break:**

1. **Commit migration files to git.** They are the schema history. Without them nobody
   else can build your database.
2. **Never edit an applied migration by hand.** Write a new one instead. Django tracks
   which migrations have run in a table called `django_migrations`.
3. **Always run `makemigrations` after changing a model**, and always run `migrate`
   after that. A model change without a migration means the database and the code
   disagree, and Django will crash at runtime.
4. `makemigrations` prints "No changes detected" when the models match the migrations.
   That is a good sign, not a failure.

---

### 3.6 The QuerySet API

Every model has a **manager**, accessed as `Model.objects`. It gives you a
**QuerySet**: a lazy, chainable, immutable description of a database query.

```python
from vehicles.models import Vehicle

# All vehicles
Vehicle.objects.all()

# Filter
Vehicle.objects.filter(vehicle_type="bike")
Vehicle.objects.filter(price_per_day_dt__gte=30, price_per_day_dt__lte=45)
Vehicle.objects.exclude(stock_available=0)

# One row, or an exception
Vehicle.objects.get(pk=vehicle_id)            # raises DoesNotExist if missing
Vehicle.objects.filter(pk=vehicle_id).first() # returns None if missing
Vehicle.objects.filter(pk=vehicle_id).first() or raise ...

# Ordering
Vehicle.objects.order_by("-rating", "-reviews_count", "name")

# Limiting
Vehicle.objects.order_by("name")[:5]

# Slicing and counting
Vehicle.objects.count()
Vehicle.objects.filter(agency__name__icontains="Marina").exists()

# Turning rows into plain dicts (great for API responses)
Vehicle.objects.filter(vehicle_type="scooter").values(
    "id", "name", "price_per_day_dt"
)
```

**The lookup syntax.** `field__lookup=value`. The lookups you will use constantly:

| Lookup                     | Meaning                     | Example                            |
| -------------------------- | --------------------------- | ---------------------------------- |
| `exact` (default)          | equals                      | `category__exact="vtc"`            |
| `iexact`                   | equals, case-insensitive    | `name__iexact="cowboy 4 st"`       |
| `contains`                 | substring, case-sensitive   | `description__contains="corniche"` |
| `icontains`                | substring, case-insensitive | `name__icontains="cowboy"`         |
| `in`                       | in a list                   | `agency__in=["marina", "gare"]`    |
| `gt` `gte` `lt` `lte`      | comparisons                 | `price_per_day_dt__lte=45`         |
| `range`                    | between                     | `price_per_day_dt__range=(18, 45)` |
| `startswith` `istartswith` | prefix                      | `name__istartswith="segway"`       |
| `isnull`                   | is it empty                 | `rating__isnull=True`              |

**Laziness.** A QuerySet does not hit the database until you _evaluate_ it. Evaluating
means iterating it, calling `len()` on it, calling `.get()`, `.first()`, `.count()`,
`.exists()`, or converting it to a list. This is why this is efficient:

```python
qs = Vehicle.objects.filter(vehicle_type="bike")   # no query yet
qs = qs.filter(price_per_day_dt__lte=30)           # still no query
qs = qs.order_by("name")                           # still no query
for v in qs:                                       # ONE query runs here
    print(v.name)
```

**`values()` vs `values_list()` vs a full model.**

```python
Vehicle.objects.all()                      # full model instances
Vehicle.objects.values("name", "rating")    # list of dicts
Vehicle.objects.values_list("name", flat=True)  # list of strings
```

**`annotate()`** adds a computed column to the results, using the database to do the
work. This is how you compute aggregates:

```python
from django.db.models import Avg, Count, Sum

# Vehicles per agency, with a count
Vehicle.objects.values("agency").annotate(
    vehicle_count=Count("id"),
    avg_price=Avg("price_per_day_dt"),
)
```

**`select_related()` and `prefetch_related()`** avoid the N+1 query problem. When you
loop over reservations and access `reservation.vehicle.name`, Django runs one query
per reservation. `select_related` joins them into one query:

```python
Reservation.objects.select_related("vehicle", "agency", "user")
```

Use `select_related` for ForeignKey (one-to-one / many-to-one) and `prefetch_related`
for ManyToMany and reverse ForeignKey. This matters: an unoptimised agency detail
page can issue 6 queries instead of 1. You will notice this in the Django Debug
Toolbar.

---

### 3.7 Relationships

**`ForeignKey`** — a many-to-one link. Many reservations point to one vehicle.

```python
class Reservation(models.Model):
    vehicle = models.ForeignKey(
        "vehicles.Vehicle",
        on_delete=models.CASCADE,
        related_name="reservations",
    )
```

Read it as: "each Reservation has exactly one Vehicle; each Vehicle has many
Reservations."

**`on_delete`** decides what happens to the reservations when the vehicle is deleted:

| Option        | Behaviour                    | Use when                                        |
| ------------- | ---------------------------- | ----------------------------------------------- |
| `CASCADE`     | Delete the children too      | The children have no meaning without the parent |
| `PROTECT`     | Refuse to delete the parent  | You do not want to lose history                 |
| `SET_NULL`    | Set the child's FK to `NULL` | The child should survive (needs `null=True`)    |
| `SET_DEFAULT` | Set to the field's default   | Rare                                            |
| `DO_NOTHING`  | Do nothing                   | You handle it yourself (rare, advanced)         |

**For this project:** `Reservation.vehicle` → `PROTECT` (never silently delete a
customer's booking history), `Reservation.agency` → `PROTECT`,
`Reservation.user` → `CASCADE` (delete the account, delete the reservations).
`Vehicle.agency` → `PROTECT` (a vehicle cannot vanish while reservations reference
it).

**`related_name`** sets the name of the **reverse** accessor. Without it, Django
generates `vehicle_set`, which is ugly and collides easily. With
`related_name="reservations"`, you write:

```python
vehicle.reservations.all()      # all reservations for this vehicle
```

**`on_delete` on a `OneToOneField`** is always `CASCADE` in practice — the child
cannot exist without the parent.

**`ManyToManyField`** — a many-to-many link.

```python
class Vehicle(models.Model):
    features = models.ManyToManyField("Feature", related_name="vehicles")
```

Django automatically creates the join table. You can add data through it:

```python
vehicle.features.set([f1, f2])
vehicle.features.add(f3)
```

**We deliberately do not use `ManyToMany` for `features` and
`included_accessors`.** Those are static, read-only lists of short strings attached to
one vehicle. A `JSONField(default=list)` is simpler, avoids a join table, and matches
how the frontend already consumes them (an array of strings). This is a deliberate
simplification, listed in §9.

**`through` models** let you put extra data on a many-to-many relationship (for
example, a join table with a date and a quantity). We use one of these for
`VehicleAvailability` — see §4.

---

### 3.8 Serializers

A **serializer** converts between Python objects and JSON, and validates incoming
data. It is the boundary layer: everything that enters the API arrives through a
serializer, and everything that leaves goes through one.

```python
# vehicles/serializers.py
from rest_framework import serializers
from .models import Vehicle


class VehicleListSerializer(serializers.ModelSerializer):
    agency_name = serializers.CharField(source="agency.name", read_only=True)
    agency_postal_code = serializers.CharField(
        source="agency.postal_code", read_only=True
    )
    category_label = serializers.CharField(
        source="category.label", read_only=True
    )

    class Meta:
        model = Vehicle
        fields = [
            "id", "name", "vehicle_type", "category", "category_label",
            "agency", "agency_name", "agency_postal_code",
            "price_per_day_dt", "price_per_hour_dt", "range_km",
            "max_speed_km_h", "weight_kg", "available_units",
            "rating", "reviews_count", "description", "features",
            "tag", "image", "fallback_image",
        ]
```

**`ModelSerializer` writes the boilerplate for you.** It inspects the model and
generates the field list automatically. The `fields` list controls what appears.

**The field mapping.** When a model field becomes a serializer field:

| Model field                             | Serializer field                                   | Notes                           |
| --------------------------------------- | -------------------------------------------------- | ------------------------------- |
| `CharField`                             | `CharField`                                        | `max_length` carried over       |
| `TextField`                             | `CharField`                                        |                                 |
| `IntegerField` / `PositiveIntegerField` | `IntegerField`                                     |                                 |
| `BooleanField`                          | `BooleanField`                                     |                                 |
| `DateField`                             | `DateField`                                        | Serialises as `"2026-11-01"`    |
| `DateTimeField`                         | `DateTimeField`                                    | Serialises as ISO-8601 with `Z` |
| `JSONField`                             | `JSONField`                                        | Passes through as-is            |
| `ForeignKey`                            | `PrimaryKeyRelatedField` (writes) / nested (reads) | See below                       |
| `ManyToManyField`                       | `PrimaryKeyRelatedField(many=True)`                |                                 |

**`read_only=True`** means the field is never accepted from the client. Always use it
for computed or server-owned fields. If you omit it, a client can `POST
{"price_per_day_dt": 0}` and change your catalogue.

```python
total_dt = serializers.IntegerField(read_only=True)
available_units = serializers.IntegerField(read_only=True)
```

**Nested serializers** embed a related object in the response:

```python
class AgencySerializer(serializers.ModelSerializer):
    class Meta:
        model = Agency
        fields = ["id", "name", "short_name", "postal_code", "address", "phone"]


class VehicleDetailSerializer(serializers.ModelSerializer):
    agency = AgencySerializer(read_only=True)

    class Meta:
        model = Vehicle
        fields = ["id", "name", "agency", "price_per_day_dt", ...]
```

This produces `"agency": {"id": "marina", "name": "…"}` instead of
`"agency": "marina"`. **The frontend's current shape is flat** — it expects
`agencyId`, `agencyName` and `agencyPostalCode` as three separate top-level fields
(`src/types.ts:11-13`). Appendix B maps this precisely. Pick one and change the
frontend; do not ship both.

**Validation.** DRF validates automatically and returns `400` with a field-keyed error
object. You add custom rules with `validate_<field>` and `validate`:

```python
def validate_end_date(self, value):
    start = self.initial_data.get("start_date")
    if start and (value - start).days > 6:
        raise serializers.ValidationError(
            "La durée maximale est de 7 jours."
        )
    return value
```

**Write serializers and read serializers are usually different.** The list view does
not need 30 fields, and sending them all is wasteful. Define `VehicleListSerializer`
and `VehicleDetailSerializer` separately.

---

### 3.9 Views, ViewSets and routers

A **view** handles one or more HTTP methods. DRF gives you three levels:

**1. Function-based view — the simplest.**

```python
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(["GET"])
def vehicle_list(request):
    vehicles = Vehicle.objects.all()
    return Response(VehicleListSerializer(vehicles, many=True).data)
```

**2. `APIView` — a class, for when you need custom behaviour per method.**

```python
from rest_framework.views import APIView
from rest_framework.response import Response

class VehicleList(APIView):
    def get(self, request):
        vehicles = Vehicle.objects.all()
        return Response(VehicleListSerializer(vehients, many=True).data)
```

**3. `ViewSet` / `ModelViewSet` — the one you will use most.**

A viewset bundles all the standard operations into one class, and the router wires up
the URLs for you.

```python
# vehicles/views.py
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

class VehicleViewSet(viewsets.ModelViewSet):
    queryset = Vehicle.objects.all()
    serializer_class = VehicleListSerializer

    @action(detail=True, methods=["get"])
    def related(self, request, pk=None):
        vehicle = self.get_object()
        related = get_similar_vehicles(vehicle, limit=3)
        return Response(VehicleListSerializer(related, many=True).data)
```

`ModelViewSet` gives you, for free:

| Method          | URL               | Name                    |
| --------------- | ----------------- | ----------------------- |
| `GET`           | `/vehicles/`      | list                    |
| `POST`          | `/vehicles/`      | create                  |
| `GET`           | `/vehicles/{id}/` | retrieve                |
| `PUT` / `PATCH` | `/vehicles/{id}/` | update / partial update |
| `DELETE`        | `/vehicles/{id}/` | destroy                 |

Registering it with a router generates all of those URLs:

```python
# vehicles/urls.py
from rest_framework.routers import DefaultRouter
from .views import VehicleViewSet

router = DefaultRouter()
router.register("vehicles", VehicleViewSet, basename="vehicle")
urlpatterns = router.urls
```

**`@action`** adds a custom endpoint to a viewset. `detail=True` means the URL includes
the id (`/vehicles/{id}/related/`); `detail=False` means it does not
(`/vehicles/facets/`). This is how the non-CRUD endpoints — `related`, `profile`,
`booking-trend`, `load`, `cancel` — get built.

**One important DRF detail:** a `ModelViewSet` exposes **all** of `list`, `create`,
`update` and `destroy` by default. For a read-only public catalogue you should restrict
it:

```python
class VehicleViewSet(viewsets.ReadOnlyModelViewSet):   # no create/update/destroy
    ...
```

or override the permission class per action. Exposing `POST /api/v1/vehicles/` on a
public catalogue would let anyone add vehicles. This is a security issue, not a style
preference.

---

### 3.10 Permissions

A **permission class** decides whether a request is allowed. It returns `True`,
`False`, or raises `PermissionDenied`.

```python
from rest_framework.permissions import BasePermission, IsAuthenticated, AllowAny

class IsAgencyStaff(BasePermission):
    message = "Réservé au personnel d'agence."

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated
                    and request.user.is_staff)

    def has_object_permission(self, request, view, obj):
        return obj.agency == request.user.agency
```

Two levels:

- **`has_permission`** — checked before the view runs. "Are you allowed to do
  anything like this?"
- **`has_object_permission`** — checked for a specific row. "Are you allowed to touch
  _this_ reservation?" This is how you stop a customer editing someone else's booking.

The default set you will use:

| Class                       | Allows                                              |
| --------------------------- | --------------------------------------------------- |
| `AllowAny`                  | Everyone, authenticated or not                      |
| `IsAuthenticated`           | Only logged-in users                                |
| `IsAdminUser`               | Only `is_staff=True` users                          |
| `IsAuthenticatedOrReadOnly` | Anyone can read; only authenticated users can write |

**Set the default globally**, then override per view:

```python
# settings.py
REST_FRAMEWORK = {
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticatedOrReadOnly",
    ],
    ...
}
```

**Object-level permissions are NOT applied by default.** If you write a
`has_object_permission` method, you must also declare the class on the view:

```python
class ReservationViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]
```

Forgetting this line is the single most common DRF security bug: the method is defined
but never called.

---

### 3.11 JWT authentication

**What a JWT is.** A JSON Web Token is a signed, self-contained string that carries
claims. The server signs it with a secret key; the client sends it back on every
request; the server verifies the signature. The server does **not** need to store
anything.

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJleHAiOjE3NjAwMDAwMDB9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
└──────── header ────────┘└────────── payload ──────────┘└──────── signature ───────┘
```

**The access / refresh pair.**

| Token       | Lifetime (proposed)                     | Purpose                                                               |
| ----------- | --------------------------------------- | --------------------------------------------------------------------- |
| **access**  | 30 minutes                              | Sent on every API request. Short-lived so a leaked token dies quickly |
| **refresh** | 7 days (or 1 day without "remember me") | Exchanged for a new access token. The client sends it rarely          |

**The flow.**

```
1. POST /api/v1/auth/login  {email, password}
        → 200 { "access": "eyJ...", "refresh": "eyJ..." }

2. GET /api/v1/me
   Authorization: Bearer eyJhbGciOi...

3. access expired → 401
        → POST /api/v1/auth/refresh  { "refresh": "eyJ..." }
        → 200 { "access": "new eyJ..." }     (and often a new refresh too)

4. POST /api/v1/auth/logout
        → blacklists the refresh token
```

**Django REST Framework Simple JWT** (`djangorestframework-simplejwt`) implements all
of this. Configuration:

```python
# settings.py
from datetime import timedelta

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticatedOrReadOnly",
    ),
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 12,
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=30),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
}
```

```python
# rouli/urls.py
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenBlacklistView,
)

urlpatterns = [
    path("api/v1/auth/login", TokenObtainPairView.as_view()),
    path("api/v1/auth/refresh", TokenRefreshView.as_view()),
    path("api/v1/auth/logout", TokenBlacklistView.as_view()),
]
```

**Blacklisting** requires adding the app:

```python
INSTALLED_APPS = [
    ...,
    "rest_framework_simplejwt.token_blacklist",
]
```

and running `migrate`. The blacklist is a database table of revoked refresh tokens.

**Where the frontend stores the tokens.** The token lives in `localStorage` under a
Rouli-specific key. `localStorage` is readable by any JavaScript on the page, so an XSS
bug becomes a token leak — that is the accepted trade-off for a simple SPA, and it is
why the frontend's `AGENTS.md` rules about sanitising content matter. `localStorage`
is used rather than a cookie because cookies need CSRF protection with a separate
frontend, and the CORS setup in §3.14 is already non-trivial.

**The frontend has no token storage at all today.** The only `localStorage` key in the
app is `rouli-theme` (`ThemeToggle.tsx:23`). You will add one, e.g. `rouli-auth`, and
a small API client that attaches the header.

**Why JWT over Django's built-in sessions.** Django's session auth stores a session id
in a cookie and keeps the data server-side. It works, but it needs CSRF tokens (an
extra header the frontend must fetch and send), and it is awkward when the frontend
and backend are on different origins. For a React SPA + separate API, JWT is the
conventional choice and it is trivially testable with `curl`.

---

### 3.12 Django Admin

Django ships a complete admin interface, generated from your models, for free. It is
your staff panel (persona P5) and your data-maintenance tool.

```python
# vehicles/admin.py
from django.contrib import admin
from .models import Vehicle, Category


@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ("name", "vehicle_type", "category", "agency",
                    "price_per_day_dt", "available_units", "rating")
    list_filter = ("vehicle_type", "category", "agency", "available_units")
    search_fields = ("name", "description")
    list_editable = ("price_per_day_dt",)
    ordering = ("name",)
```

`list_display` = the table columns. `list_filter` = the sidebar filters. `search_fields`
= the search box. `list_editable` = inline-editable cells. `ordering` = the default
sort.

Create a login with:

```bash
python manage.py createsuperuser
```

Then open `http://localhost:8000/admin/`.

**The admin is only useful if the models are admin-shaped.** This is why `related_name`
matters, why `__str__` matters, and why `help_text` on fields pays off. Django will
not create a table for a model that is not in `INSTALLED_APPS`, and it will not show a
model that is not registered.

**For nested data, use `inlines`** so you can edit a vehicle and its availability rows
on one page:

```python
class VehicleAvailabilityInline(admin.TabularInline):
    model = VehicleAvailability
    extra = 0

@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    inlines = [VehicleAvailabilityInline]
```

---

### 3.13 Settings and environment variables

**Never put a secret in `settings.py`.** Read it from the environment:

```python
# rouli/settings.py
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "dev-only-insecure-key")
DEBUG = os.environ.get("DJANGO_DEBUG", "1") == "1"
ALLOWED_HOSTS = os.environ.get("DJANGO_ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")
```

And a `.env` file that is **git-ignored**:

```
DJANGO_SECRET_KEY=change-me-in-production
DJANGO_DEBUG=1
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=db.sqlite3
```

Read it with `python-decouple` or `django-environ`, or parse it yourself. The point is
that `settings.py` is committed and contains no secret.

**Settings that matter for this project:**

```python
# The database
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
        "OPTIONS": {
            # SQLite locks the whole file for writes. This makes concurrent
            # writers wait up to 20s instead of raising "database is locked".
            "timeout": 20,
        },
    }
}

# Internationalisation — the API is French-only
LANGUAGE_CODE = "fr-fr"
TIME_ZONE = "Africa/Tunis"
USE_I18N = True
USE_TZ = True

# Static files
STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
```

`TIME_ZONE = "Africa/Tunis"` matters: the booking windows are calendar days in local
time, and a booking that starts "today" must mean today in Tunis, not in UTC.

**Django's password hashing** is built in and automatic. `User.objects.create_user()`
hashes the password with PBKDF2 (or Argon2 if you install `argon2-cffi`). Never store
or compare raw passwords yourself, and never log them.

---

### 3.14 CORS — why the browser blocks you

Your frontend runs on `http://localhost:3000`. Your API runs on
`http://localhost:8000`. **These are different origins.** When the browser sends a
request from one to the other, it first performs a **preflight** `OPTIONS` request. The
browser refuses the real request unless the API's response to the preflight says
"yes, this origin is allowed".

This is the same-origin policy, and it is a browser feature, not a server bug. Without
CORS headers you get a console error and a failed request, and no amount of Django
code will fix it.

The fix is `django-cors-headers`:

```bash
pip install django-cors-headers
```

```python
INSTALLED_APPS = [
    ...,
    "corsheaders",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",   # must be FIRST
    "django.middleware.security.SecurityMiddleware",
    ...
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = [
    "accept", "authorization", "content-type", "origin", "user-agent",
    "x-csrftoken", "x-requested-with",
]
```

**`CorsMiddleware` must be the first entry in `MIDDLEWARE`.** If it is not, the
browser's preflight hits the URL resolver first and the headers are never added.

In production, `CORS_ALLOWED_ORIGINS` must list your real domain and nothing else. A
wildcard `*` combined with credentials is rejected by browsers and is a security hole.

---

### 3.15 Filtering, searching and sorting

For the catalogue you need filtering by several fields at once, plus a text search.
Two tools:

**`django-filter`** — declarative, composable filters.

```python
# vehicles/filters.py
import django_filters
from .models import Vehicle


class VehicleFilter(django_filters.FilterSet):
    q = django_filters.CharFilter(method="filter_search")
    max_price = django_filters.NumberFilter(field_name="price_per_day_dt",
                                            lookup_expr="lte")
    agency = django_filters.UUIDFilter(field_name="agency_id")
    category = django_filters.UUIDFilter(field_name="category_id")
    start_date = django_filters.DateFilter(field_name="availability__date",
                                           lookup_expr="gte")
    end_date = django_filters.DateFilter(field_name="availability__date",
                                         lookup_expr="lte")

    class Meta:
        model = Vehicle
        fields = ["vehicle_type", "max_price", "agency", "category"]

    def filter_search(self, queryset, name, value):
        value = (value or "").strip()
        if not value:
            return queryset
        return queryset.filter(
            models.Q(name__icontains=value)
            | models.Q(description__icontains=value)
            | models.Q(category__label__icontains=value)
            | models.Q(agency__name__icontains=value)
        )
```

```python
# vehicles/views.py
class VehicleViewSet(viewsets.ReadOnlyModelViewSet):
    filter_backends = [DjangoFilterBackend, OrderingFilter, SearchFilter]
    filterset_class = VehicleFilter
    ordering_fields = ["price_per_day_dt", "rating", "range_km"]
```

**Accent folding.** SQLite's `icontains` does not fold accents, so `"électrique"`
will not match `"Electrique"`. DRF 3.18 added an `unaccent` option to its own
`SearchFilter`. For `django-filter`, the standard fix is to register a custom
database function:

```python
# vehicles/lookups.py
from django.db.models import Func
from django.db.models.functions import Lower


class Unaccent(register=True):
    function = "UNACCENT"
    template = "%(function)s(%(expressions)s)"


class UnaccentIcontains(BuiltinLookup):
    lookup_name = "iunaccent"
```

Registering the `UNACCENT` SQL function requires the SQLite extension to be loaded.
A simpler and portable alternative that needs no extension: **store a normalised
search column**.

```python
# In the model
search_blob = models.TextField(blank=True, editable=False)
```

```python
# In a save() override or a signal
def build_search_blob(self):
    parts = [
        self.name, self.description, self.tag or "",
        self.category.label, self.agency.name,
        " ".join(self.landmarks), " ".join(self.localities),
    ]
    text = " ".join(p for p in parts if p).lower()
    # strip accents: é -> e, è -> e, à -> a, ç -> c ...
    text = unicodedata.normalize("NFKD", text)
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    return text
```

Then the filter is a plain `search_blob__icontains=value` on the normalised text, and
it works identically on SQLite and Postgres. **This is the recommended approach for
this project** — one extra column, no extension, deterministic.

**Sorting.** `OrderingFilter` reads `?ordering=price_per_day_dt` from the query string.
The frontend's sort values (`popularity`, `price-asc`, `price-desc`, `range-desc`) are
not field names, so you need a **custom ordering** translation — map the frontend's
values onto ORM orderings in the view:

```python
SORT_MAP = {
    "popularity": ["-rating", "-reviews_count"],
    "price-asc": ["price_per_day_dt"],
    "price-desc": ["-price_per_day_dt"],
    "range-desc": ["-range_km"],
}

sort = request.query_params.get("sort", "popularity")
ordering = SORT_MAP.get(sort, SORT_MAP["popularity"])
vehicles = vehicles.order_by(*ordering)
```

Keep the frontend's sort strings unchanged. They are already in the URL, in the
README, and in the select options (`BikesCatalogPage.tsx:287-290`).

---

### 3.16 Pagination

Server-side filtering without pagination is a trap: the filter runs on the database
(cheap) but you still ship every matching row to the browser (expensive).

```python
REST_FRAMEWORK = {
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 12,
}
```

The response becomes:

```json
{
  "count": 11,
  "next": "http://localhost:8000/api/v1/vehicles?page=2",
  "previous": null,
  "results": [ ... ]
}
```

**`results` vs `items`.** DRF's default key is `results`. This PRD specifies `items`
instead, because the frontend already talks about "items" and `total` is clearer than
`count` for a catalogue. To change it, subclass:

```python
# core/pagination.py
from rest_framework.pagination import PageNumberPagination


class RouliPagination(PageNumberPagination):
    page_size = 12
    page_size_query_param = "page_size"
    max_page_size = 50

    def get_paginated_response(self, data):
        return Response({
            "items": data,
            "total": self.page.paginator.count,
            "page": self.page.number,
            "page_size": self.get_page_size(self.request),
            "total_pages": self.page.paginator.num_pages,
        })
```

The frontend's `?page=` parameter then maps to DRF's `?page=` with no change. DRF
also accepts `?page_size=` and caps it at `max_page_size` so a client cannot ask for
10 000 rows.

---

### 3.17 Testing

Django has a test framework built in. `manage.py test` discovers tests, creates a
**separate test database**, runs them, and rolls everything back afterwards. Your
development data is never touched.

```python
# vehicles/tests.py
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from django.test import TestCase

from .models import Vehicle, Agency


class VehicleListTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.agency = Agency.objects.create(name="Agence Marina")
        self.bike = Vehicle.objects.create(
            name="Cowboy 4 ST",
            vehicle_type="bike", agency=self.agency, price_per_day_dt=24,
        )

    def test_list_returns_created_vehicle(self):
        response = self.client.get("/api/v1/vehicles")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["total"], 1)

    def test_max_price_filter_excludes_expensive_vehicles(self):
        response = self.client.get("/api/v1/vehicles?max_price=20")
        self.assertEqual(response.data["total"], 0)

    def test_detail_of_unknown_vehicle_is_404(self):
        response = self.client.get("/api/v1/vehicles/nope")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
```

The `APIClient` is `requests` with test conveniences: `client.post(url, data, format="json")`
sends JSON, and `client.force_authenticate(user=user)` attaches a user without needing
a token.

**Test naming:** the method name is the description. `test_max_price_filter_excludes_expensive_vehicles`
is self-documenting. Use `assertEqual`, not bare `assert`, so failures show both
values.

**`django-nose` / `pytest-django` are optional.** The built-in runner is fine for
this project. If you prefer pytest, `pytest-django` is a small addition.

---

### 3.18 Fixtures, seeds and management commands

**A fixture is a JSON file containing data to load into the database.** You can dump
the current database:

```bash
python manage.py dumpdata vehicles --indent 2 > vehicles/fixtures/seed.json
```

and load it back:

```bash
python manage.py loaddata vehicles/fixtures/seed.json
```

**But for this project, write a custom management command instead.** A fixture is a
dump — it does not explain the data, and it cannot compute the synthetic reservation
history or the derived availability rows.

A **management command** is a Python class in `app/management/commands/`:

```
content/
└── management/
    └── commands/
        └── seed_demo.py
```

```python
# content/management/commands/seed_demo.py
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta


class Command(BaseCommand):
    help = "Seed the database with the Rouli demo dataset."

    def add_arguments(self, parser):
        parser.add_argument("--flush", action="store_true",
                            help="Delete existing data first.")

    def handle(self, *args, **options):
        if options["flush"]:
            Vehicle.objects.all().delete()
            Reservation.objects.all().delete()
        # ... create the records ...
        self.stdout.write(self.style.SUCCESS("Seed complete: 11 vehicles, 5 agencies."))
```

Run it with:

```bash
python manage.py seed_demo --flush
```

This command is the single source of truth for the demo dataset. It must reproduce
`src/data/mockData.ts` exactly — the 5 agencies, the 11 vehicles with their exact
prices and specs, the categories, the FAQ, the testimonials, the statistics, plus ~600
synthetic reservations spread over the last 90 days so the charts have real data.

---

### 3.19 The Django shell

`python manage.py shell` opens an interactive Python prompt with your models loaded.
It is where you debug data problems.

```python
>>> from vehicles.models import Vehicle
>>> Vehicle.objects.count()
11
>>> v = Vehicle.objects.get(name="Cowboy 4 ST")
>>> v.id
UUID('8f14e45f-ceea-4a67-9d2b-4b0f1d6f3a21')
>>> v.name
'Cowboy 4 ST'
>>> v.price_per_day_dt
24
>>> Vehicle.objects.filter(price_per_day_dt__lte=20).values_list("name", flat=True)
<QuerySet ['Segway Ninebot KickScooter Max G2']>
>>> v.reservations.count()
3
```

Two useful notes:

- `python manage.py shell --plain` gives you plain Python without the IPython banner.
- To print the actual SQL, set `DEBUG = True` in settings and look at the "SQL
  queries" panel that Django prints on error — or install `django-debug-toolbar` for a
  floating panel listing every query with its duration.

**Use the shell to verify your seed data matches the frontend** before you wire
anything up:

```python
>>> Vehicle.objects.count() == 11
True
>>> sorted(Vehicle.objects.values_list("price_per_day_dt", flat=True))
[18, 21, 22, 24, 24, 27, 28, 29, 32, 34, 45]
```

---

### 3.20 Command cheat sheet

| Command                                                 | What it does                                                       |
| ------------------------------------------------------- | ------------------------------------------------------------------ |
| `python manage.py runserver`                            | Dev server on `http://localhost:8000`                              |
| `python manage.py runserver 0.0.0.0:8000`               | Dev server reachable from other devices                            |
| `python manage.py makemigrations`                       | Generate migration files from your models                          |
| `python manage.py migrate`                              | Apply migrations to the database                                   |
| `python manage.py makemigrations --check`               | Exit non-zero if models changed without a migration (use it in CI) |
| `python manage.py createsuperuser`                      | Create an admin user                                               |
| `python manage.py shell`                                | Interactive Python with your models loaded                         |
| `python manage.py test`                                 | Run the whole test suite                                           |
| `python manage.py test vehicles`                        | Run only the `vehicles` app's tests                                |
| `python manage.py test vehicles.tests.VehicleListTests` | Run one test class                                                 |
| `python manage.py showmigrations`                       | See which migrations have been applied                             |
| `python manage.py sqlmigrate vehicles 0001`             | Print the SQL for a migration without running it                   |
| `python manage.py seed_demo --flush`                    | Run your custom seed command                                       |
| `python manage.py collectstatic`                        | Gather static files for production                                 |
| `python manage.py check --deploy`                       | Run Django's production-readiness checks                           |

---

---

## Part 4 — Database schema

The database is **SQLite** (Django's default, zero setup, one file). The schema is
designed so that moving to PostgreSQL later is a `DATABASES` change and nothing else:
no SQLite-specific types, no reliance on SQLite-only features, and every concurrency
assumption expressed in a portable way (see §6.5).

---

### 4.1 Entity relationship diagram

```
                          ┌────────────────────┐
                          │       User         │
                          │  (auth.User)       │
                          │  pk  (UUID)        │
                          │  username (unique) │
                          │  email  (unique)   │
                          │  phone / city      │
                          │  address           │
                          │  loyalty_points    │
                          │  is_staff          │
                          └─────────┬──────────┘
                                    │ 1
                                    │
                                    │ N
                          ┌─────────▼──────────┐
                          │    Reservation     │
                          │  pk  (UUID)        │
                          │  coupon_code (uniq)│
                          │  status            │
                          │  start_date        │
                          │  end_date          │
                          │  days              │
                          │  total_dt          │
                          │  loyalty_pts_award │
                          │  rating?           │
                          └────┬──────────┬────┘
                               │ N        │ N
                               │          │
                               │ 1        │ 1
                    ┌──────────▼──┐  ┌────▼──────────────┐
                    │   Vehicle   │  │      Agency       │
                    │ pk  (UUID)  │  │  pk  (UUID)       │
                    │ name        │  │  name             │
                    │ vehicle_type│  │  short_name       │
                    │ category ───┼──┤  postal_code      │
                    │ agency   ───┼──┤  address          │
                    │ price_per_  │  │  description      │
                    │   day_dt    │  │  phone / hours    │
                    │ total_units │  │  opens_at/closes  │
                    │ rating      │  │  image            │
                    │ reviews_cnt │  │  lat / lng        │
                    └──────┬──────┘  │  landmarks (JSON) │
                           │         │  localities (JSON)│
                           │ 1       └───────────────────┘
                           │
                           │ N
                    ┌──────▼─────────────────┐
                    │   VehicleAvailability  │
                    │  pk  (UUID)            │
                    │  vehicle ──────────────┤
                    │  date                  │
                    │  available_units       │
                    │  UNIQUE(vehicle, date)  │
                    └────────────────────────┘

   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌─────────────┐
   │     Faq      │   │ Testimonial  │   │  SiteStat    │   │ContactMessage│
   │ id (UUID)    │   │ id (UUID)    │   │ id (UUID)    │   │ id (UUID)   │
   │ question     │   │ name, city   │   │ key (unique) │   │ name, email  │
   │ answer       │   │ role, quote  │   │ value        │   │ subject      │
   │ order        │   │ rides_count  │   │ label        │   │ message      │
   └──────────────┘   └──────────────┘   └──────────────┘   │ handled     │
                                                           └─────────────┘

   ┌──────────────────┐
   │     Category     │◄──── Vehicle.category
   │ pk  (UUID)       │
   │ label            │
   │ vehicle_type     │
   │ order            │
   └──────────────────┘
```

Mermaid, for rendering in a Markdown viewer:

```mermaid
erDiagram
    User ||--o{ Reservation : makes
    Vehicle ||--o{ Reservation : "is booked in"
    Agency ||--o{ Reservation : "is pickup point for"
    Agency ||--o{ Vehicle : stocks
    Category ||--o{ Vehicle : classifies
    Vehicle ||--o{ VehicleAvailability : "has daily stock"
```

---

### 4.2 Schema conventions

| Rule                                                                    | Reason                                                                                                                                                                  |
| ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Every model uses a UUID primary key**                                 | The frontend treats every id as an opaque string, so a UUID is enough. It avoids enumerable ids and makes it impossible to leak a sequence. There are no slugs anywhere |
| **UUIDs are generated by the database layer, not derived from content** | `uuid.uuid4` at insert time. Changing a name, category or agency never changes an id. Seed data and tests look records up by name, not by a hardcoded id                |
| **`SiteStat.key` is a unique string, not the PK**                       | The key (`active_users`, `reviews`) is a stable machine name, but the row identity is still a UUID like every other model                                               |
| **Money is an integer number of DT**                                    | Tunisia has no subunit in practice. The frontend already displays whole DT and uses `Intl.NumberFormat('fr-FR')`. Never use `FloatField` for money                      |
| **Dates are `DateField`, not `DateTimeField`**                          | A rental runs from a calendar day to a calendar day. A time of day would create timezone bugs for no benefit                                                            |
| **`created_at` / `updated_at` on every business model**                 | `auto_now_add` and `auto_now`. Standard, and you will want them for debugging                                                                                           |
| **`related_name` on every ForeignKey**                                  | Avoids Django's generated `xxx_set` and prevents collisions                                                                                                             |
| **`on_delete=PROTECT` for anything referenced by a reservation**        | A vehicle or agency referenced by a booking must never be silently deleted                                                                                              |
| **Snake_case columns, camelCase JSON**                                  | The ORM uses snake_case; the serializer renames to camelCase to match the frontend                                                                                      |
| **Every model has `__str__`**                                           | It shows up in the admin and in every error message                                                                                                                     |

---

### 4.3 The models

Ten models. Here is each one, with the reasoning.

---

##### `accounts.User` — the customer and the staff member

**Purpose.** One table for accounts. Extends Django's built-in `AbstractUser`, so you
get password hashing, permissions, `is_staff`, `is_superuser`, `last_login` and
`date_joined` for free.

**Why a custom User and not the default?** The default `User` has `username` as the
login identifier and splits the display name into `first_name` / `last_name`. Rouli
logs in with **email** — the frontend's login form has `name="email"` and
`type="email"` (`LoginPage.tsx:49-52`) — and uses `username` as a single display
handle. So `USERNAME_FIELD = "email"` and the inherited name fields are removed.

```python
# accounts/models.py
import uuid

from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator
from django.db import models
from django.db.models.functions import Lower

USERNAME_VALIDATOR = RegexValidator(
    r"^[A-Za-z0-9]{3,30}$",
    "Le nom d'utilisateur doit contenir entre 3 et 30 lettres ou chiffres, sans espaces.",
)


class User(AbstractUser):
    """Customer or staff account. Email logs in; username is the display handle."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    username = models.CharField(
        max_length=30, unique=True, validators=[USERNAME_VALIDATOR]
    )
    first_name = None
    last_name = None
    phone = models.CharField(max_length=32, blank=True)
    city = models.CharField(max_length=80, blank=True)
    address = models.CharField(max_length=255, blank=True)
    loyalty_points = models.PositiveIntegerField(default=0)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    class Meta(AbstractUser.Meta):
        ordering = ["username"]
        constraints = [
            models.UniqueConstraint(Lower("username"), name="unique_username_ci"),
        ]

    def __str__(self) -> str:
        return self.username

    def get_full_name(self) -> str:
        return self.username

    def get_short_name(self) -> str:
        return self.username
```

| Field                     | Type                              | Notes                                                                                                       |
| ------------------------- | --------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `id`                      | `UUIDField` (PK)                  | Random UUID, never displayed as a number                                                                    |
| `email`                   | `EmailField(unique=True)`         | The **login identifier**. Unique is enforced by the database                                                |
| `username`                | `CharField(30, unique=True)`      | The display handle. 3–30 ASCII letters/digits, no spaces. Unique case-insensitively via `Lower("username")` |
| `first_name`, `last_name` | —                                 | **Removed** with `first_name = None` / `last_name = None`. There is no `full_name`                          |
| `phone`                   | `CharField(max_length=32)`        | Format `+216 92 840 380` — stored as a string because phone numbers are not numbers                         |
| `city`                    | `CharField(max_length=80)`        | `Monastir` for most users                                                                                   |
| `address`                 | `CharField(max_length=255)`       | `12 Rue Marroc, Monastir 5000`                                                                              |
| `loyalty_points`          | `PositiveIntegerField(default=0)` | The counter shown on the profile. Updated only by the reservation service, never by `PATCH /me`             |
| `is_staff`                | inherited                         | True for agency employees and admins. Drives the staff endpoints                                            |

**Username, not a legal name.** The username is what the profile header, navbar and
staff views display. It is editable through `PATCH /me`, with the same validation and
uniqueness check. It is not the login identifier and it is not a legal identity; if
staff ever need a real name at pickup, that is a separate field, not a rename of this
one.

**Not stored:** the loyalty **tier** ("Membre Or"). It is derived from
`loyalty_points` at response time, so the badge and the points can never disagree.

---

##### `agencies.Agency` — one of the five pickup points

```python
# agencies/models.py
import uuid

from django.db import models


class Agency(models.Model):
    """A Rouli pickup / return point in Monastir."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=120)
    short_name = models.CharField(max_length=60)
    postal_code = models.CharField(max_length=10)
    address = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    phone = models.CharField(max_length=32, blank=True)
    hours = models.CharField(max_length=80, blank=True)
    opens_at = models.TimeField(default="08:00")
    closes_at = models.TimeField(default="20:00")
    image = models.CharField(max_length=255, blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    landmarks = models.JSONField(default=list, blank=True)
    localities = models.JSONField(default=list, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name
```

| Field                    | Type                | Source in the frontend                                                                                                        |
| ------------------------ | ------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `id`                     | `UUIDField` (PK)    | Generated at seed time. The frontend receives it as `agencyId` / `id`                                                         |
| `name`                   | `CharField(120)`    | `"Agence Marina (Port de Plaisance)"`                                                                                         |
| `short_name`             | `CharField(60)`     | `"Marina"` — used in the catalogue sidebar                                                                                    |
| `postal_code`            | `CharField(10)`     | `"5000"`, `"5060"`, `"5065"`, `"5079"` — a string, not an int, because Tunisian codes are 4 digits and `zone` filters on them |
| `address`                | `CharField(255)`    | `"Quai Nord du Port de Plaisance, Marina"`                                                                                    |
| `description`            | `TextField`         | The marketing paragraph                                                                                                       |
| `phone`                  | `CharField(32)`     | `"+216 73 500 101"`                                                                                                           |
| `hours`                  | `CharField(80)`     | `"Lun – Dim : 08h00 – 20h00"` — the **display** string                                                                        |
| `opens_at` / `closes_at` | `TimeField`         | `08:00` / `20:00` — the **structured** window the load chart needs (13 hourly buckets)                                        |
| `image`                  | `CharField(255)`    | `"/agencies/agence-marina.webp"`                                                                                              |
| `latitude` / `longitude` | `DecimalField(9,6)` | `35.7644`, `10.8` — `Decimal`, not `Float`, so 35.7644 survives a round-trip exactly                                          |
| `landmarks`              | `JSONField(list)`   | `["Port de Plaisance", "Marina de Monastir", "Corniche"]`                                                                     |
| `localities`             | `JSONField(list)`   | `["Monastir Centre (5000)", "Monastir Republique (5060)"]`                                                                    |
| `is_active`              | `BooleanField`      | New. Lets you close an agency without deleting its history                                                                    |

**Two open-time representations, on purpose.** `hours` is a human-readable string the
UI prints verbatim; `opens_at`/`closes_at` are the machine-readable window the
occupancy chart buckets over. Storing only the string would force the chart to parse
French text. Storing only the times would force the UI to format them. Both are
cheap. This resolves **D8**.

**`landmarks` and `localities` are `JSONField`, not models.** They are
display-only string lists that are always read and written whole, never queried
individually and never joined to. A separate table for each would be three extra
models, two extra migrations and an extra join, for zero benefit. Documented in §9.

**There is no `all` agency.** The frontend's `"all"` entry
(`mockData.ts:38-44`) is a UI convenience, not a place. The backend has five rows.
**D10 fixed.**

---

##### `vehicles.Category` — the vehicle taxonomy

```python
# vehicles/models.py
import uuid

from django.db import models


class Category(models.Model):
    """Vehicle category. One canonical label per category (fixes D5)."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    label = models.CharField(max_length=60)
    vehicle_type = models.CharField(
        max_length=10,
        choices=[("bike", "Vélo"), ("scooter", "Trottinette")],
    )
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "label"]

    def __str__(self) -> str:
        return self.label
```

| label               | vehicle_type | order | frontend pill label today | frontend vehicle chip today |
| ------------------- | ------------ | ----- | ------------------------- | --------------------------- |
| Urbain & Ville      | bike         | 1     | `Urbain & Ville`          | `Urbain & Ville`            |
| VTC & Balade        | bike         | 2     | `VTC & Balade`            | `VTC Confort & Balade`      |
| VTT & Sport         | bike         | 3     | `VTT & Sport`             | `VTT & Sport`               |
| Cargo & Famille     | bike         | 4     | `Cargo & Famille`         | `Cargo & Famille`           |
| Pliant Compact      | bike         | 5     | `Pliant Compact`          | `Pliant Électrique`         |
| Trottinette Urbaine | scooter      | 6     | `Trottinettes urbaines`   | `Trottinette Urbaine`       |

**IDs are generated, labels are the contract.** The seed creates the six categories and
stores their UUIDs in the vehicles' foreign keys. The frontend receives the category
`id` from `/vehicles/categories` and sends it back in `?cat=`; it never hardcodes a
category id. The display order comes from `order`, not from the UUID.

**This table exists to fix D5.** The frontend currently hardcodes the same six
categories twice with two different vocabularies, and every vehicle also carries its
own `categoryLabel` string. That is three copies of the same fact. With a `Category`
table there is one copy: the frontend renders `category.label` in both the filter
pills and the card chip, and the hardcoded arrays in `BikesCatalogPage.tsx:35-54` are
deleted.

**Consequence for the card chip:** the chip text changes from `"VTC Confort & Balade"`
to `"VTC & Balade"`. This is a visible copy change and is accepted — consistency
beats two near-synonyms, and the alternative is a permanently duplicated taxonomy.

**Scope-dependent category lists.** The frontend shows a different category list
depending on `?type=` (`BikesCatalogPage.tsx:83-88`): bikes see the 5 bike
categories, scooters see 1, and "all" sees 6. That is exactly what
`Category.vehicle_type` encodes, and it becomes a `GET /api/v1/vehicles/categories`
endpoint returning the list filtered by type.

---

##### `vehicles.Vehicle` — the catalogue item

```python
# vehicles/models.py
class Vehicle(models.Model):
    """One rentable model, stationed at one agency."""

    VEHICLE_TYPES = [("bike", "Vélo"), ("scooter", "Trottinette")]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=120)
    vehicle_type = models.CharField(max_length=10, choices=VEHICLE_TYPES)
    category = models.ForeignKey(
        Category, on_delete=models.PROTECT, related_name="vehicles"
    )
    agency = models.ForeignKey(
        Agency, on_delete=models.PROTECT, related_name="vehicles"
    )

    # Commercial
    price_per_day_dt = models.PositiveIntegerField()
    price_per_hour_dt = models.DecimalField(max_digits=6, decimal_places=2)
    total_units = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    # Presentation
    description = models.TextField()
    tag = models.CharField(max_length=60, blank=True)
    image = models.CharField(max_length=255)
    features = models.JSONField(default=list, blank=True)
    included_accessories = models.JSONField(default=list, blank=True)

    # Technical specification
    range_km = models.PositiveIntegerField()
    battery_capacity = models.CharField(max_length=60, blank=True)
    max_speed_km_h = models.PositiveIntegerField()
    weight_kg = models.DecimalField(max_digits=6, decimal_places=2)
    motor_type = models.CharField(max_length=120, blank=True)
    motor_torque_nm = models.PositiveIntegerField(default=0)
    transmission = models.CharField(max_length=120, blank=True)
    brakes = models.CharField(max_length=120, blank=True)
    charging_time_hours = models.DecimalField(max_digits=5, decimal_places=1)
    frame_material = models.CharField(max_length=120, blank=True)
    wheel_size = models.CharField(max_length=60, blank=True)
    connectivity = models.TextField(blank=True)

    # Reputation (denormalised, see note)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    reviews_count = models.PositiveIntegerField(default=0)

    # Search
    search_blob = models.TextField(blank=True, editable=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name", "id"]
        indexes = [
            models.Index(fields=["vehicle_type", "category"]),
            models.Index(fields=["agency", "price_per_day_dt"]),
            models.Index(fields=["-rating"]),
        ]

    def __str__(self) -> str:
        return self.name
```

**Field-by-field mapping to the frontend's `CatalogBike`** (`src/types.ts:5-38`):

| `CatalogBike` field                 | Model field                           | Type change                  | Note                                                                                                          |
| ----------------------------------- | ------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `id`                                | `id`                                  | UUID → string                | Generated by the database; the frontend treats it as opaque                                                   |
| `name`                              | `name`                                | —                            |                                                                                                               |
| `vehicleType`                       | `vehicle_type`                        | str                          |                                                                                                               |
| `category`                          | `category` → FK                       | FK                           | The FK's UUID is returned as `category`                                                                       |
| `categoryLabel`                     | `category.label`                      | derived                      | **D5** — no longer stored on the vehicle                                                                      |
| `agencyId`                          | `agency` → FK                         | FK                           |                                                                                                               |
| `agencyName`                        | `agency.name`                         | derived                      |                                                                                                               |
| `agencyPostalCode`                  | `agency.postal_code`                  | derived                      |                                                                                                               |
| `pricePerDayDT`                     | `price_per_day_dt`                    | int                          | Same                                                                                                          |
| `pricePerHourDT`                    | `price_per_hour_dt`                   | int → Decimal                | `4.8` is not an integer. `DecimalField(6,2)` stores it exactly. The serializer returns a number, not a string |
| `rangeKm`                           | `range_km`                            | int                          |                                                                                                               |
| `batteryCapacity`                   | `battery_capacity`                    | str                          | `"360 Wh amovible"` — free text with a unit                                                                   |
| `maxSpeedKmH`                       | `max_speed_km_h`                      | int                          |                                                                                                               |
| `weightKg`                          | `weight_kg`                           | int → Decimal                | `18.9` needs a decimal                                                                                        |
| `stockAvailable`                    | `total_units` + `VehicleAvailability` | int                          | **Split.** `total_units` is the fleet size; availability is per-day. See below                                |
| `tag`                               | `tag`                                 | str, now non-null-with-blank | Optional in the frontend, empty string here                                                                   |
| `image`                             | `image`                               | str                          |                                                                                                               |
| `fallbackImage`                     | —                                     | —                            | **Not served.** It is a constant SVG data URI; the frontend keeps it in `ASSETS.placeholder`                  |
| `rating`                            | `rating`                              | float → Decimal(3,2)         | `4.9`, `4.95` — a `DecimalField` avoids float rounding                                                        |
| `reviewsCount`                      | `reviews_count`                       | int                          |                                                                                                               |
| `description`                       | `description`                         | str                          |                                                                                                               |
| `features`                          | `features`                            | `string[]` → JSON            |                                                                                                               |
| `motorType` … `includedAccessories` | same names, snake_case                | —                            | 10 technical fields, see the table in §5.3                                                                    |

**Why `price_per_hour_dt` and `weight_kg` are `DecimalField` and not integers.**
`4.8` and `18.9` are not whole numbers. Storing them as integers would round them
and change what the customer sees. Storing them as `FloatField` would introduce
binary floating-point artifacts (`4.8` becoming `4.7999999999999998` in a JSON
response). `DecimalField` is exact. `price_per_day_dt` stays an integer because every
daily rate in the catalogue is a whole number (18, 21, 22, 24, 27, 28, 29, 32, 34, 45).

**`rating` and `reviews_count` are denormalised.** They are aggregates of the ratings
left on completed reservations, but they are also **sort keys** — the `popularity`
sort needs `ORDER BY rating DESC` without a subquery on every request. They are
recomputed whenever a reservation is rated. The alternative (computing them with an
`annotate()` on every list request) is correct but slower and makes the sort
ambiguous. Documented in §9.

**`search_blob` is a pre-computed, accent-folded, lowercased concatenation** of every
searchable field. It exists so the free-text search is one indexed `icontains` on one
column, and so accents are folded consistently. See §3.15 for how it is built.

```python
def save(self, *args, **kwargs):
    self.search_blob = build_search_blob(self)
    super().save(*args, **kwargs)
```

---

##### `vehicles.VehicleAvailability` — daily stock

```python
class VehicleAvailability(models.Model):
    """How many units of one vehicle model are free on one calendar day."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    vehicle = models.ForeignKey(
        Vehicle, on_delete=models.CASCADE, related_name="availability"
    )
    date = models.DateField()
    available_units = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["vehicle", "date"]
        constraints = [
            models.UniqueConstraint(
                fields=["vehicle", "date"], name="unique_vehicle_day"
            )
        ]
        indexes = [models.Index(fields=["date", "available_units"])]

    def __str__(self) -> str:
        return f"{self.vehicle.name} — {self.date} ({self.available_units})"
```

**This model is the heart of the product.** The frontend's flat `stockAvailable` is a
lie: it is one integer for the whole fleet, with no notion of dates. But the product
promise is explicit — _"Voyez en direct où votre vélo ou votre trottinette est
disponible, aux dates de votre choix"_ (`SolutionSection.tsx:36`) — and the FAQ
answers _"Que se passe-t-il si je ne viens pas récupérer mon véhicule ? … le véhicule
est remis à disposition"_ (`FaqSection.tsx:18-19`), which implies a per-day pool that
is released.

**How it works.**

1. The seed command creates one `VehicleAvailability` row per vehicle per day, for
   **today through today + 90 days**, with `available_units = vehicle.total_units`.
2. A booking for `[start, end)` decrements `available_units` by 1 on every day in the
   range.
3. A cancellation increments them back.
4. The catalogue's `available_units` for a requested range is the **minimum** across
   the days in the range — a vehicle is bookable only if it is free on every day.

**Why a row per day rather than a counter on the vehicle?** Because availability is a
property of a _date_, not of a vehicle. A single counter cannot answer "is it free on
the 14th?", which is the question the product actually asks.

**Why `available_units` only, and not `total` + `reserved`?** Two columns would make
the state auditable, but every read would have to compute `total - reserved` and
every write would have to know which one to touch. One column with a clear invariant
("this is how many are free on this day") is simpler and has fewer ways to be wrong.
The total fleet size lives on `Vehicle.total_units`. Documented in §9.

**The 90-day horizon.** Beyond 90 days there are no rows, so the catalogue returns
"unavailable" for dates further out. This is a deliberate scope limit, documented in
§9. It is also a natural place to add a "rolling horizon" management command later.

**An alternative worth knowing about but not using:** a `Reservation` with
`start_date <= D < end_date` can be counted to derive availability on the fly, with
no `VehicleAvailability` table at all. That is correct but requires a correlated
subquery per vehicle per day — 11 vehicles × 90 days is a lot of work for every
catalogue request. Materialising the availability table turns that into one indexed
lookup.

---

##### `bookings.Reservation` — the booking and the coupon

```python
# bookings/models.py
import uuid
from django.db import models


class Reservation(models.Model):
    """A booking. It is also the digital coupon the customer presents at the agency."""

    class Status(models.TextChoices):
        PENDING = "pending", "En attente de retrait"
        ACTIVE = "active", "En cours"
        COMPLETED = "completed", "Terminée"
        CANCELLED = "cancelled", "Annulée"
        EXPIRED = "expired", "Expirée"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    coupon_code = models.CharField(max_length=20, unique=True)
    user = models.ForeignKey(
        "accounts.User", on_delete=models.CASCADE, related_name="reservations"
    )
    vehicle = models.ForeignKey(
        "vehicles.Vehicle", on_delete=models.PROTECT, related_name="reservations"
    )
    agency = models.ForeignKey(
        "agencies.Agency", on_delete=models.PROTECT, related_name="reservations"
    )

    start_date = models.DateField()
    end_date = models.DateField()
    days = models.PositiveSmallIntegerField()
    total_dt = models.PositiveIntegerField()
    loyalty_points_awarded = models.PositiveIntegerField(default=0, editable=False)

    status = models.CharField(
        max_length=10, choices=Status.choices, default=Status.PENDING
    )
    rating = models.PositiveSmallIntegerField(null=True, blank=True)

    picked_up_at = models.DateTimeField(null=True, blank=True)
    returned_at = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "-created_at"]),
            models.Index(fields=["coupon_code"]),
            models.Index(fields=["vehicle", "start_date"]),
        ]
        constraints = [
            models.CheckConstraint(
                check=models.Q(days__gte=1, days__lte=7),
                name="reservation_days_between_1_and_7",
            ),
            models.CheckConstraint(
                check=models.Q(end_date__gt=models.F("start_date")),
                name="reservation_end_after_start",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.coupon_code} — {self.vehicle.name}"
```

**One model, two jobs — this is the most important simplification in the schema.**

The frontend has **two** nearly identical models today (`mockData.ts:648-671`):

```typescript
export interface UserCoupon {
  id;
  code;
  vehicleId;
  agencyId;
  status;
  startDate;
  endDate;
  days;
  totalDT;
  createdAt;
}
export interface UserReservation {
  id;
  vehicleId;
  agencyId;
  startDate;
  endDate;
  days;
  totalDT;
  status;
  rating?;
}
```

They have the same fields, the same statuses in different vocabularies
(`active|used|expired` vs `active|completed|cancelled`), and in the mock data the
coupons and reservations are **the same bookings viewed two ways**. Creating two
tables would mean two sets of endpoints, two serializers, and a synchronisation
problem where a coupon and its reservation disagree.

So: **one `Reservation` table, and the coupon is a view over it.** The API returns the
same rows from two endpoints with different filters and a different status vocabulary:

| Frontend concept                 | API endpoint                  | Filter                        | Status mapping                                                                      |
| -------------------------------- | ----------------------------- | ----------------------------- | ----------------------------------------------------------------------------------- |
| `UserCoupon` ("Mes coupons")     | `GET /api/v1/me/coupons`      | `status IN (pending, active)` | `pending`/`active` → `active`; `completed` → `used`; `expired` → `expired`          |
| `UserReservation` ("Historique") | `GET /api/v1/me/reservations` | all                           | `pending`/`active` → `active`; `completed` → `completed`; `cancelled` → `cancelled` |

The frontend keeps its two vocabularies; the API translates. Zero user-visible change,
one table.

**`coupon_code` format.** The mock data uses `RL-MNS-2410` — 4 digits
(`mockData.ts:697`). `Math.floor(1000 + Math.random() * 9000)` gives 8000 possible
codes for a city-wide service. That is not enough, and `Math.random()` is not a
secure source. The server generates **6 uppercase alphanumeric characters** after the
prefix: `RL-MNS-` + `[A-Z0-9]{6}`, e.g. `RL-MNS-K7QP2M`. Uniqueness is enforced by a
database constraint, and the generator retries on collision. The frontend's
`RL-MNS-####` display pattern is a regular expression somewhere and is updated to
match. Documented in §9.

**`days` and `total_dt` are stored, not derived.** Storing them is deliberate: the
price of a vehicle can change, and a customer's coupon must keep the price they were
quoted. The server computes them at booking time and never accepts them from the
client. They are also the inputs to the loyalty formula, so points are stable even if
the vehicle's price changes later.

**`loyalty_points_awarded` makes reversal idempotent.** When the reservation is
created, the service computes `days × 10 + floor(total_dt / 5)`, stores it here, and
adds it to the user's balance. When the reservation becomes `cancelled` or `expired`,
the service subtracts that exact amount, floored at 0, and sets this field to 0. A
second cancellation therefore cannot reverse the points twice. The field is internal
and is not exposed by the API.

**`end_date__gt=start_date` as a constraint.** This permits `start == end` (1 day) but
rejects `end < start`. The `days` check constraint enforces 1–7. Both are enforced by
the database, so a bug in application code cannot write an invalid reservation.

**`on_delete=CASCADE` on `user`:** deleting an account deletes its reservations. This
is the one place where deletion cascades, and it is a GDPR-friendly default. The
alternative — anonymising — is a Phase 2 concern.

**`on_delete=PROTECT` on `vehicle` and `agency`:** a vehicle or agency with
reservations cannot be deleted. Set `is_active = False` instead.

---

##### `content.ContactMessage` — the contact form

```python
import uuid

from django.db import models


class ContactMessage(models.Model):
    """A message sent from the contact form. Read and answered by staff in admin."""

    class Subject(models.TextChoices):
        RESERVATION = "Question sur une réservation", "Question sur une réservation"
        ASSISTANCE = "Assistance pendant une location", "Assistance pendant une location"
        PARTNER = "Devenir agence partenaire", "Devenir agence partenaire"
        PRESS = "Presse & médias", "Presse & médias"
        OTHER = "Autre demande", "Autre demande"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=120)
    email = models.EmailField()
    subject = models.CharField(max_length=60, choices=Subject.choices)
    message = models.TextField(max_length=2000)
    handled = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.subject} — {self.name}"
```

The five subjects are stored **verbatim from the frontend**
(`ContactPage.tsx:42-48`), including the accented `é` in "Presse & médias". A
`TextChoices` enum means the API rejects any other subject with a `400`, and the
admin can filter by it.

**`handled`** is the only workflow field. No email is sent (non-goal), so staff read
and reply manually from their own mailbox.

---

##### `content.Faq`, `content.Testimonial`, `content.SiteStat` — the small content tables

Three tiny tables, one pattern each.

```python
class Faq(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    question = models.CharField(max_length=255)
    answer = models.TextField()
    order = models.PositiveIntegerField(default=0)
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self) -> str:
        return self.question


class Testimonial(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=80)
    city = models.CharField(max_length=80)
    role = models.CharField(max_length=120, blank=True)
    quote = models.TextField()
    rides_count = models.PositiveIntegerField(default=0)
    order = models.PositiveIntegerField(default=0)
    is_published = models.BooleanField(default=True)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self) -> str:
        return f"{self.name} — {self.city}"


class SiteStat(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    key = models.CharField(max_length=40, unique=True)
    value = models.CharField(max_length=40)
    label = models.CharField(max_length=80)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "key"]

    def __str__(self) -> str:
        return f"{self.key} = {self.value}"
```

**Seeded values.**

| `Faq`         | 7 rows, verbatim from `FaqSection.tsx:8-37`, including the typographic apostrophe `d’office` in entry 5 |
| ------------- | ------------------------------------------------------------------------------------------------------- |
| `Testimonial` | 3 rows, verbatim from `SocialProof.tsx:11-36`                                                           |
| `SiteStat`    | `active_users` = 8500, `reviews` = 3200, `platform_rating` = 4.9                                        |

**`SiteStat.value` is a `CharField`, not an integer.** The values are `8500`, `3200`
and `4.9` — three different types in one table. A string column with the API
serialising it as a number (`"8500"` → `8500`) keeps the table uniform. The
`fleet_size` statistic is **not** stored: it is computed live from the sum of
available units, so it can never contradict the catalogue. **D9 partially fixed.**

**`is_published`** lets you hide a FAQ entry or a testimonial without deleting it.
Both are boolean flags rather than a `deleted_at` timestamp, because nothing in the
product needs to know _when_ it was unpublished.

---

### 4.4 Indexes and constraints, at a glance

| Table                                                    | Indexes                                                                                     | Constraints                                                           |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `accounts_user`                                          | PK on `id`; unique on `email`; unique on `username`; functional unique on `Lower(username)` | unique `email`, unique `username` (case-insensitive)                  |
| `agencies_agency`                                        | PK on `id`                                                                                  | —                                                                     |
| `vehicles_category`                                      | PK on `id`; `(order, label)`                                                                | —                                                                     |
| `vehicles_vehicle`                                       | PK on `id`; `(vehicle_type, category)`; `(agency, price_per_day_dt)`; `(-rating)`           | —                                                                     |
| `vehicles_vehicleavailability`                           | PK on `id`; `(date, available_units)`; unique `(vehicle, date)`                             | unique `(vehicle, date)`                                              |
| `bookings_reservation`                                   | PK on `id`; unique on `coupon_code`; `(user, -created_at)`; `(vehicle, start_date)`         | `days` in 1–7; `end_date > start_date`; `loyalty_points_awarded >= 0` |
| `content_contactmessage`                                 | PK on `id`                                                                                  | —                                                                     |
| `content_faq`, `content_testimonial`, `content_sitestat` | PK on `id` / ordering                                                                       | unique `SiteStat.key`                                                 |

**The `search_blob` column should also be indexed** for the free-text search. Django
does not create a full-text index for SQLite; add
`models.Index(fields=["search_blob"])` if the search becomes slow. With 11 vehicles
it will never be slow, so it is optional — add it when the catalogue grows.

---

### 4.5 The seed plan

A single management command, `python manage.py seed_demo --flush`, must produce a
database that is indistinguishable from `src/data/mockData.ts` from the API's point of
view.

**What it creates, in order:**

1. **5 agencies** — verbatim from `AGENCIES_LIST` (`mockData.ts:37-128`), including
   descriptions, phones, hours, images, coordinates, landmarks and localities. Each gets
   a generated UUID. The `all` pseudo-agency is **not** created.
2. **6 categories** — the table above, each with a generated UUID.
3. **11 vehicles** — verbatim from `CATALOG_BIKES` (`mockData.ts:134-626`): every
   field, in the same order, with `total_units` = the mock's `stockAvailable`
   (6, 4, 5, 3, 2, 5, 4, 3, 5, 4, 3 — total 44, which matches the "44+ véhicules
   disponibles" figure on the home page, `SocialProof.tsx:66`). Vehicles reference the
   agency and category objects, never a hardcoded string id.
4. **Availability rows** — for each vehicle, one row per day from today to today + 90
   days, with `available_units = total_units`. That is 11 × 90 = **990 rows**.
5. **1 demo customer** — matching `USER_PROFILE` (`mockData.ts:681-692`):
   username `rayensalhi`, `rayen.rsalhi9@gmail.com`, `+216 92 840 380`, `Monastir`,
   `12 Rue Marroc, Monastir 5000`, `loyalty_points = 1240`, preferred agency Marina.
   The 1240 is an **opening balance**; it represents activity before the seeded
   history and is not recomputed from the 6 reservations below. The password is a
   known demo value (e.g. `rouli-demo-2026`) so a reviewer can log in. The email is
   the real one in the mock data, so it must be changed before any public deployment.
6. **7 FAQ entries**, **3 testimonials**, **3 site statistics** — verbatim. The fourth
   statistic, `fleet_size`, is computed live.
7. **~600 synthetic reservations** — spread over the **last 90 days** across the 11
   vehicles and the 5 agencies, with realistic status distribution:
   - ~70 % `completed` (in the past, with a rating),
   - ~15 % `cancelled`,
   - ~10 % `expired` (past, never picked up),
   - ~5 % `pending` (future start dates, active coupons).

   These are what make the charts real: the weekday-demand chart, the agency occupancy
   chart and the profile's "Historique" all read from the same rows. Without them the
   charts would be empty and the profile would be blank.

   The 6 reservations in `USER_RESERVATIONS` (`mockData.ts:745-810`) are created
   first, for the demo customer, so the profile matches the current demo exactly.

   **Availability must agree with the seed.** For every seeded reservation whose date
   range touches today or a future day, decrement the corresponding
   `VehicleAvailability` rows. Otherwise the availability chart shows full stock while
   the catalogue says the vehicle is booked. Historical reservations need no
   availability rows.

**A verification step in the seed command.** At the end, the command asserts the
invariants the frontend's dev-time checks enforce (`mockData.ts:1078-1151`):

```python
assert Vehicle.objects.count() == 11
assert Agency.objects.count() == 5
assert Category.objects.count() == 6
assert User.objects.filter(username="rayensalhi").exists()
assert Vehicle.objects.filter(vehicle_type="bike").exists()
assert Vehicle.objects.filter(vehicle_type="scooter").exists()
assert all(v.available_units >= 0 for v in VehicleAvailability.objects.all())
assert len({r.coupon_code for r in Reservation.objects.all()}) == Reservation.objects.count()
assert sum(v.total_units for v in Vehicle.objects.all()) == 44
```

If any of these fail, the seed aborts with a clear error. A seed that produces
inconsistent data is worse than no seed.

---

### 4.6 Deliberate simplifications in the schema

Each of these is a conscious trade, with the ceiling named.

| Simplification                                                  | What it costs                                                                                                                                    | When to lift it                                                                                                                                             |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **One `User` table, no separate `Profile`**                     | User and profile fields are mixed; a future "agency staff profile" would need a new model                                                        | If a second user type needs different fields, add a `Profile` model with a `OneToOneField`                                                                  |
| **`username` is a display handle, not a legal name**            | No first/last name to print on a contract or check at pickup                                                                                     | Add `legal_first_name` / `legal_last_name` if staff need identity verification; do not overload `username`                                                  |
| **All ids are opaque UUIDs**                                    | URLs and logs are less readable than slugs                                                                                                       | Never for public URLs; add a separate human-readable `slug` only if SEO needs it                                                                            |
| **One `Reservation` table serves as coupon and reservation**    | The API must translate between two status vocabularies                                                                                           | Never — unless coupons gain fields reservations lack (e.g. a scanned-at timestamp, which would be a `Coupon` table with a `OneToOneField` to `Reservation`) |
| **`features` and `included_accessories` are `JSONField` lists** | Cannot query "all vehicles with the 'casque' accessory", cannot attach a price to an accessory                                                   | If accessories become individually orderable or filterable, promote them to a model with a `through` table                                                  |
| **`landmarks` and `localities` are `JSONField` lists**          | Same limitation                                                                                                                                  | If agencies start sharing landmarks, promote to a `Landmark` model                                                                                          |
| **`rating` / `reviews_count` are denormalised on `Vehicle`**    | They can drift from the reservations that produced them                                                                                          | Never, as long as one code path recomputes them. Add a management command `recompute_ratings` to fix drift                                                  |
| **No `Review` model**                                           | Ratings have no comment text, no author display, no moderation                                                                                   | If text reviews are added, add a `Review` model with a `OneToOneField` to `Reservation`                                                                     |
| **Availability is a materialised daily table**                  | Rows must be created ahead of the horizon; 90 days of stale rows must be refreshed                                                               | A rolling-horizon management command, or a switch to computing availability from reservations on the fly                                                    |
| **No `LoyaltyTransaction` ledger**                              | `loyalty_points` is a counter; you cannot see how it was earned. `Reservation.loyalty_points_awarded` only makes the booking reversal idempotent | If points become auditable, add a ledger table and treat the counter as a cached sum                                                                        |
| **No soft delete**                                              | `is_active` covers vehicles and agencies; users are hard-deleted                                                                                 | Add `deleted_at` if you need to preserve deleted user history                                                                                               |

---

---

## Part 5 — REST API specification

### 5.1 Conventions

**Base URL.** Everything lives under `/api/v1/`. The version prefix means a future
breaking change becomes `/api/v2/` and the old one keeps working.

**Transport.** JSON in, JSON out. `Content-Type: application/json; charset=utf-8`.
The frontend sends `Accept: application/json`; DRF's browsable API is available at
`/api/v1/` during development if you omit the `Accept` header.

**Authentication.** `Authorization: Bearer <access_token>` on every protected
endpoint. Public endpoints work without a header.

**Naming.** **The API's JSON keys are exactly the frontend's current TypeScript field
names.** `pricePerDayDT`, `agencyId`, `stockAvailable`, `categoryLabel` — all
unchanged. The Django models use `snake_case`, and the serializers bridge the two
with `source=`:

```python
price_per_day_dt = serializers.IntegerField(
    source="price_per_day_dt", read_only=True
)
agency_name = serializers.CharField(source="agency.name", read_only=True)
```

**Why this matters:** it means wiring the frontend to the API requires **no renaming
of any displayed field**. The only frontend changes are the ones this PRD explicitly
lists (§5.6). Every other field arrives under the name the frontend already expects.

| Type            | Format        | Example                                  |
| --------------- | ------------- | ---------------------------------------- |
| Date            | `YYYY-MM-DD`  | `"2026-11-01"`                           |
| Timestamp       | ISO 8601, UTC | `"2026-10-21T14:32:11Z"`                 |
| Money           | Integer, DT   | `24`                                     |
| Identifier      | UUID string   | `"9b2f4c1e-7a3d-4e8f-9c1b-2d5a6e7f8a9b"` |
| Rate (per hour) | Number, 2 dp  | `4.8`                                    |
| Coordinates     | Number, 6 dp  | `35.7644`                                |

**List envelope.** Every collection response uses the same shape:

```json
{
  "items": [ ... ],
  "total": 11,
  "page": 1,
  "page_size": 12,
  "total_pages": 1
}
```

**Single-object responses** are returned bare — the object itself, no wrapper. A
wrapper around a single object buys nothing.

**Error envelope.** Every non-2xx response has the same shape:

```json
{
  "error": {
    "code": "validation_error",
    "message": "La requête contient des champs invalides.",
    "details": {
      "end_date": ["La durée maximale est de 7 jours."]
    }
  }
}
```

`code` is a stable machine-readable string. `message` is a human-readable French
sentence, safe to display to a customer. `details` maps field names to a list of
messages; it is `{}` or absent for non-validation errors.

---

### 5.2 Endpoint list

| #   | Method | Path                                                | Auth    | Purpose                                  | Consumed by                                        |
| --- | ------ | --------------------------------------------------- | ------- | ---------------------------------------- | -------------------------------------------------- |
| 1   | GET    | `/api/v1/health`                                    | —       | Liveness probe                           | deployment                                         |
| 2   | GET    | `/api/v1/vehicles`                                  | —       | Catalogue, filtered + sorted + paginated | `BikesCatalogPage.tsx`                             |
| 3   | GET    | `/api/v1/vehicles/categories`                       | —       | Category list, scoped by vehicle type    | `BikesCatalogPage.tsx:35-54`                       |
| 4   | GET    | `/api/v1/vehicles/facets`                           | —       | Per-agency vehicle counts                | `BikesCatalogPage.tsx:418-422`                     |
| 5   | GET    | `/api/v1/vehicles/{id}`                             | —       | Full vehicle detail                      | `BikeDetailPage.tsx`                               |
| 6   | GET    | `/api/v1/vehicles/{id}/related`                     | —       | 3 similar vehicles                       | `BikeDetailPage.tsx:416-500`                       |
| 7   | GET    | `/api/v1/vehicles/{id}/availability?days=14`        | —       | 14-day available-units series            | `VehicleCharts.tsx`                                |
| 8   | GET    | `/api/v1/vehicles/{id}/demand-by-weekday?window=90` | —       | Bookings by weekday, last 90 days        | `VehicleCharts.tsx`                                |
| 9   | GET    | `/api/v1/agencies`                                  | —       | Agency list, filtered + sorted           | `AgenciesPage.tsx`                                 |
| 10  | GET    | `/api/v1/agencies/{id}`                             | —       | One agency                               | `AgencyDetailPage.tsx`                             |
| 11  | GET    | `/api/v1/agencies/{id}/vehicles`                    | —       | Vehicles at one agency                   | `AgencyDetailPage.tsx:54`                          |
| 12  | GET    | `/api/v1/agencies/{id}/load`                        | —       | Occupancy by hour or weekday             | `AgencyLoadChart.tsx`                              |
| 13  | GET    | `/api/v1/faq`                                       | —       | FAQ entries                              | `FaqSection.tsx`                                   |
| 14  | GET    | `/api/v1/testimonials`                              | —       | Social proof entries                     | `SocialProof.tsx`                                  |
| 15  | GET    | `/api/v1/stats`                                     | —       | Platform statistics                      | `SocialProof.tsx`, `AboutPage.tsx`, `FinalCta.tsx` |
| 16  | POST   | `/api/v1/contact`                                   | —       | Submit a contact message                 | `ContactPage.tsx`                                  |
| 17  | POST   | `/api/v1/auth/register`                             | —       | Create an account                        | `SignupPage.tsx`                                   |
| 18  | POST   | `/api/v1/auth/login`                                | —       | Get tokens                               | `LoginPage.tsx`                                    |
| 19  | POST   | `/api/v1/auth/refresh`                              | —       | Renew the access token                   | API client                                         |
| 20  | POST   | `/api/v1/auth/logout`                               | refresh | Revoke a refresh token                   | API client                                         |
| 21  | GET    | `/api/v1/me`                                        | access  | Current user profile                     | `ProfilePage.tsx`                                  |
| 22  | PATCH  | `/api/v1/me`                                        | access  | Update the profile                       | `ProfilePage.tsx:501-549`                          |
| 23  | GET    | `/api/v1/me/stats`                                  | access  | The 4 profile stat tiles                 | `ProfilePage.tsx:199-210`                          |
| 24  | GET    | `/api/v1/me/coupons`                                | access  | Active coupons                           | `ProfilePage.tsx:267-355`                          |
| 25  | GET    | `/api/v1/me/reservations`                           | access  | Reservation history                      | `ProfilePage.tsx:358-440`                          |
| 26  | GET    | `/api/v1/reservations/{id}`                         | access  | One reservation                          | detail view                                        |
| 27  | POST   | `/api/v1/reservations`                              | access  | **Create a booking**                     | `ReservationModal.tsx:53-67`                       |
| 28  | PATCH  | `/api/v1/reservations/{id}/cancel`                  | access  | Free cancellation                        | not built yet                                      |
| 29  | POST   | `/api/v1/reservations/{id}/rating`                  | access  | Rate a completed rental                  | `ProfilePage.tsx:408`                              |
| 30  | GET    | `/api/v1/staff/reservations`                        | staff   | Look up by coupon code                   | counter                                            |
| 31  | GET    | `/api/v1/staff/agencies/{id}/pickups`               | staff   | Today's pickups at an agency             | counter                                            |
| 32  | GET    | `/api/v1/admin/stats`                               | staff   | Platform counters for the admin          | Django Admin mostly                                |

---

### 5.3 Endpoint detail

---

#### 1 · `GET /api/v1/health`

```json
{ "status": "ok", "database": "ok", "time": "2026-10-21T14:32:11Z" }
```

Returns `200` if the process is alive and the database answers. Used by the
deployment platform and by you, to check the server is up.

---

#### 2 · `GET /api/v1/vehicles`

The catalogue. **The most important endpoint in the project.**

**Query parameters.**

| Param       | Type                                                        | Default           | Meaning                                                                                 |
| ----------- | ----------------------------------------------------------- | ----------------- | --------------------------------------------------------------------------------------- |
| `type`      | `bike` \| `scooter`                                         | _(both)_          | Scope of the listing                                                                    |
| `cat`       | category UUID                                               | _(all)_           | Category filter. Ignored if incompatible with `type`. The literal `all` means no filter |
| `agency`    | agency UUID                                                 | _(all)_           | Agency filter. The literal `all` means no filter                                        |
| `price`     | integer DT                                                  | `45`              | **Maximum** daily price, inclusive. Clamped to `[18, 45]`                               |
| `q`         | string                                                      | _(none)_          | Free-text search, trimmed and accent-folded                                             |
| `sort`      | `popularity` \| `price-asc` \| `price-desc` \| `range-desc` | `popularity`      | Sort order                                                                              |
| `stock`     | `0`                                                         | _(absent)_        | `0` includes vehicles with no availability. Any other value behaves as absent           |
| `start`     | `YYYY-MM-DD`                                                | _(today)_         | First day of the requested window                                                       |
| `end`       | `YYYY-MM-DD`                                                | _(start + 1 day)_ | Exclusive end of the requested window                                                   |
| `page`      | integer ≥ 1                                                 | `1`               | Page number                                                                             |
| `page_size` | integer 1–50                                                | `12`              | Items per page                                                                          |

**Response.**

```json
{
  "items": [
    {
      "id": "bike-cowboy-4",
      "name": "Cowboy 4 ST",
      "vehicleType": "bike",
      "category": "urbain",
      "categoryLabel": "Urbain & Ville",
      "agencyId": "ribat",
      "agencyName": "Agence Ribat & Médina",
      "agencyPostalCode": "5000",
      "pricePerDayDT": 24,
      "pricePerHourDT": 4.8,
      "rangeKm": 70,
      "maxSpeedKmH": 25,
      "weightKg": 18.9,
      "stockAvailable": 6,
      "totalUnits": 6,
      "tag": "Bestseller",
      "image": "/bikes/cowboy-4-st.webp",
      "rating": 4.9,
      "reviewsCount": 124,
      "description": "Vélo électrique urbain connecté au design minimaliste…",
      "features": [
        "Détection automatique de la puissance",
        "Batterie amovible",
        "Application Cowboy avec GPS et antivol",
        "Cadre bas très accessible"
      ]
    }
  ],
  "total": 11,
  "page": 1,
  "page_size": 12,
  "total_pages": 1
}
```

**Notes.**

- `stockAvailable` is **not** the fleet size. It is the number of units free on
  **every** day of the requested window — the minimum across those days. With no
  `start`/`end`, it is today's availability. `totalUnits` is the fleet size of the
  model at that agency. The frontend currently shows `stockAvailable` as
  "N disponibles aujourd'hui" on the detail page (`BikeDetailPage.tsx:178`), which
  remains correct when no date range is given.
- `fallbackImage` is **not** returned. The frontend keeps its inline SVG placeholder
  (`ASSETS.placeholder`).
- `features` is the full list. The card shows only the first two
  (`BikesCatalogPage.tsx:645`); the detail page shows all four. Sending all of them
  costs a few bytes and saves a second endpoint.

**Error cases.** None. Every parameter combination returns `200` with an empty
`items` array if nothing matches. An unknown `cat` or `agency` value is treated as
"no filter" rather than an error, because these come from URLs a human might edit.

---

#### 3 · `GET /api/v1/vehicles/categories`

Returns the categories, optionally scoped.

| Param  | Values              | Default |
| ------ | ------------------- | ------- |
| `type` | `bike` \| `scooter` | _(all)_ |

```json
{
  "items": [
    { "id": "urbain", "label": "Urbain & Ville", "vehicleType": "bike" },
    { "id": "vtc", "label": "VTC & Balade", "vehicleType": "bike" },
    {
      "id": "trottinette",
      "label": "Trottinette Urbaine",
      "vehicleType": "scooter"
    }
  ],
  "total": 6
}
```

The frontend uses this to build the filter pills, replacing the hardcoded
`BIKE_CATEGORIES` / `SCOOTER_CATEGORIES` / `ALL_CATEGORIES` arrays
(`BikesCatalogPage.tsx:35-54`). The "Tous" / "Tous les vélos" / "Toutes les
trottinettes" / "Tous les véhicules" pill labels stay in the frontend, because they
depend on the current scope, not on a category.

---

#### 4 · `GET /api/v1/vehicles/facets`

Per-agency vehicle counts, for the catalogue sidebar and the mobile drawer.

| Param  | Values              | Default  |
| ------ | ------------------- | -------- |
| `type` | `bike` \| `scooter` | _(both)_ |

```json
{
  "items": [
    {
      "id": "marina",
      "name": "Agence Marina (Port de Plaisance)",
      "shortName": "Marina",
      "postalCode": "5000",
      "vehicleCount": 2,
      "availableCount": 8
    },
    {
      "id": "skanes",
      "name": "Agence Zone Skanes (Corniche)",
      "shortName": "Zone Skanes",
      "postalCode": "5060",
      "vehicleCount": 3,
      "availableCount": 12
    }
  ],
  "total": 5
}
```

**`vehicleCount` vs `availableCount` — two different numbers, on purpose.** This is
the fix for **D9**:

- `vehicleCount` = number of distinct **models** offered at the agency. This is what
  the current frontend shows as "N véhicules disponibles" on the agencies page
  (`AgenciesPage.tsx:258-261`) and what the catalogue sidebar badge shows
  (`BikesCatalogPage.tsx:420-422`).
- `availableCount` = sum of **units** available today. This is what the home page
  means by "véhicules disponibles" (`SocialProof.tsx:66`, currently `44+`).

Both are returned so each page can use the one it means. The frontend picks the right
one per page; it does not have to guess.

**The counts ignore the other active filters.** This matches the current behaviour
(`getVehicleCount` at `mockData.ts:836-845` only filters on agency and type). Keep it
that way — the sidebar badges are a navigation aid, not a live preview of the result
count. Documented in §9.

---

#### 5 · `GET /api/v1/vehicles/{id}`

The full vehicle. Same fields as the list, plus the ten technical specification
fields and the accessories.

```json
{
  "id": "8f14e45f-ceea-4a67-9d2b-4b0f1d6f3a21",
  "name": "Cowboy 4 ST",
  "vehicleType": "bike",
  "category": "2c7e1f0a-4b3d-4c6e-8f1a-9d2b4b0f1d63",
  "categoryLabel": "Urbain & Ville",
  "agencyId": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
  "agencyName": "Agence Ribat & Médina",
  "agencyPostalCode": "5000",
  "pricePerDayDT": 24,
  "pricePerHourDT": 4.8,
  "rangeKm": 70,
  "batteryCapacity": "360 Wh amovible",
  "maxSpeedKmH": 25,
  "weightKg": 18.9,
  "stockAvailable": 6,
  "totalUnits": 6,
  "tag": "Bestseller",
  "image": "/bikes/cowboy-4-st.webp",
  "rating": 4.9,
  "reviewsCount": 124,
  "description": "Vélo électrique urbain connecté au design minimaliste…",
  "features": ["…", "…", "…", "…"],
  "motorType": "Moteur roue arrière Cowboy 250W",
  "motorTorqueNm": 45,
  "transmission": "Transmission par courroie carbone mono-vitesse",
  "brakes": "Freins à disques hydrauliques",
  "chargingTimeHours": 3.5,
  "frameMaterial": "Aluminium léger, cadre ouvert",
  "wheelSize": "700c / 28\" pneus urbains",
  "connectivity": "GPS, déverrouillage par smartphone, alertes antivol…",
  "includedAccessories": [
    "Casque urbain certifié CE",
    "Antivol pliable haute sécurité",
    "Garde-boues avant et arrière",
    "Éclairage LED avant et arrière"
  ]
}
```

**Errors.** `404` with code `not_found` for an unknown or malformed UUID. The frontend
already renders a "Véhicule introuvable" state for this (`BikeDetailPage.tsx:49-69`).

---

#### 6 · `GET /api/v1/vehicles/{id}/related`

```json
{
  "items": [{ "id": "…", "name": "…", "…": "…" }],
  "total": 3
}
```

Exactly 3 items, ranked by the same rule the frontend uses
(`mockData.ts:1070-1075`): **+2** for the same `vehicle_type`, **+1** for the same
`category`, sorted descending, ties broken by the catalogue's default order (name
ascending). The vehicle itself is excluded.

---

#### 7 · `GET /api/v1/vehicles/{id}/availability`

The 14-day availability chart.

| Param  | Default | Notes               |
| ------ | ------- | ------------------- |
| `days` | `14`    | Window length, 1–90 |

```json
{
  "items": [
    { "date": "2026-10-22", "availableUnits": 6, "totalUnits": 6 },
    { "date": "2026-10-23", "availableUnits": 4, "totalUnits": 6 }
  ],
  "total": 14
}
```

- Exactly `days` points, one per calendar day, **starting today**.
- `availableUnits` is `VehicleAvailability.available_units` for that vehicle and day,
  clamped to `[0, total_units]`.
- `totalUnits` is the vehicle's `total_units`, repeated on every point so the chart can
  draw the bar against its capacity without a second request.
- If a day has no availability row, the endpoint returns `totalUnits` (no booking
  recorded). The seed and the rolling-horizon command are responsible for keeping rows
  ahead of today.

**Errors.** `404` for an unknown vehicle UUID; `400` for `days` outside 1–90.

---

#### 8 · `GET /api/v1/vehicles/{id}/demand-by-weekday`

Bookings for this vehicle grouped by the weekday of their start date.

| Param    | Default | Notes                                |
| -------- | ------- | ------------------------------------ |
| `window` | `90`    | Days of history, 1–365, ending today |

```json
{
  "items": [
    { "label": "Lun", "reservations": 12 },
    { "label": "Mar", "reservations": 9 },
    { "label": "Mer", "reservations": 14 },
    { "label": "Jeu", "reservations": 11 },
    { "label": "Ven", "reservations": 18 },
    { "label": "Sam", "reservations": 22 },
    { "label": "Dim", "reservations": 16 }
  ],
  "total": 102,
  "window": 90
}
```

- Exactly 7 points, labelled `Lun` … `Dim`, always in that order, even when a weekday
  has zero reservations.
- Counts reservations whose `start_date` is in `[today − window + 1, today]` and whose
  status is `pending`, `active` or `completed`. Cancelled and expired reservations are
  excluded.
- `total` is the sum of the seven points and is shown in the chart badge.

**Errors.** `404` for an unknown vehicle UUID; `400` for `window` outside 1–365.

---

#### 9 · `GET /api/v1/agencies`

| Param               | Default     | Meaning                                                                                  |
| ------------------- | ----------- | ---------------------------------------------------------------------------------------- |
| `q`                 | _(none)_    | Search across name, short name, address, postal code, description, landmarks, localities |
| `zone`              | _(all)_     | Exact `postal_code` match                                                                |
| `sort`              | `relevance` | `relevance` \| `name` \| `vehicles`                                                      |
| `page`, `page_size` | `1`, `12`   | Pagination                                                                               |

```json
{
  "items": [
    {
      "id": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
      "name": "Agence Marina (Port de Plaisance)",
      "shortName": "Marina",
      "postalCode": "5000",
      "address": "Quai Nord du Port de Plaisance, Marina",
      "description": "Notre agence phare, au cœur de la Marina de Monastir…",
      "phone": "+216 73 500 101",
      "hours": "Lun – Dim : 08h00 – 20h00",
      "opensAt": "08:00:00",
      "closesAt": "20:00:00",
      "image": "/agencies/agence-marina.webp",
      "latitude": 35.7644,
      "longitude": 10.8,
      "landmarks": ["Port de Plaisance", "Marina de Monastir", "Corniche"],
      "localities": ["Monastir Centre (5000)", "Monastir Republique (5060)"],
      "vehicleCount": 2,
      "availableCount": 8
    }
  ],
  "total": 5,
  "page": 1,
  "page_size": 12,
  "total_pages": 1
}
```

`sort=vehicles` orders by `vehicleCount` descending — the "Tri : plus de véhicules"
option (`AgenciesPage.tsx:59`). `sort=name` orders with French locale collation
(`localeCompare(…, 'fr')`, `AgenciesPage.tsx:58`), which on SQLite means sorting in
Python, not SQL — acceptable for 5 rows.

---

#### 10 · `GET /api/v1/agencies/{id}`

One agency, same shape as an item above, plus:

```json
{
  "…": "…",
  "vehicleCount": 2,
  "availableCount": 8,
  "calmHours": "11h & 16h",
  "calmDay": "Mar"
}
```

`calmHours` and `calmDay` are the two least-occupied hour labels and the
least-occupied weekday, computed from the same load data as endpoint 12. The frontend
displays them as "Créneaux les plus calmes : … · jour le plus calme : …"
(`AgencyLoadChart.tsx:79-85`).

**Errors.** `404` for an unknown or malformed UUID **and for `all`** — the `all`
pseudo-agency does not exist in the database, so it 404s naturally. **D10 fixed.**

---

#### 11 · `GET /api/v1/agencies/{id}/vehicles`

The vehicles at one agency, using the same list item shape as endpoint 2, plus the
optional `start` / `end` window.

---

#### 12 · `GET /api/v1/agencies/{id}/load`

| Param         | Default | Notes                                                            |
| ------------- | ------- | ---------------------------------------------------------------- |
| `granularity` | `hour`  | `hour` (13 points, `08h`–`20h`) or `day` (7 points, `Lun`–`Dim`) |
| `window`      | `30`    | Days of history to aggregate over                                |

```json
{
  "items": [
    { "label": "08h", "occupancy": 31 },
    { "label": "09h", "occupancy": 58 }
  ],
  "total": 13,
  "granularity": "hour"
}
```

`occupancy` is a percentage, integer, 0–100.

**How it is computed from real data.** Occupancy = the share of the fleet that is
reserved on a given hour or weekday, over the requested window:

```python
reserved = Reservation.objects.filter(
    status__in=[Status.PENDING, Status.ACTIVE, Status.COMPLETED],
    start_date__lte=day,
    end_date__gt=day,
    agency=agency,
).count()
total = agency.vehicles.aggregate(t=Sum("total_units"))["t"] or 1
occupancy = round(100 * reserved / total)
```

For the **hour** granularity, reservations are attributed to their **start hour**;
the fleet is considered "open" 08:00–20:00, matching `opens_at`/`closes_at`. For the
**weekday** granularity, reservations are attributed to the weekday of their start
date.

**Cold start.** With a fresh database and no reservations, every value is `0` and the
chart is flat. The seed command's ~600 synthetic reservations prevent this. If you
skip the seed, expect an empty chart — that is correct behaviour, not a bug.

**Why this is not `getAgencyLoadByHour` from the frontend.** That function
(`mockData.ts:1009-1025`) is two gaussians plus a lunch dip, seeded from a hash of
the agency id. It produces a plausible-looking curve for an agency that has never
existed. Replacing it with real numbers is one of the PRD's explicit goals
(§1.7, criterion 4).

---

#### 13–15 · `GET /api/v1/faq`, `GET /api/v1/testimonials`, `GET /api/v1/stats`

```json
// /faq
{
  "items": [
    {
      "id": 1,
      "question": "Dois-je payer en ligne pour réserver mon véhicule ?",
      "answer": "Non. Vous réservez gratuitement en ligne et vous réglez à l'agence au retrait du véhicule."
    }
  ],
  "total": 7
}
```

```json
// /testimonials
{
  "items": [
    {
      "id": 1,
      "name": "Mehdi K.",
      "city": "Monastir (Faculté de Médecine)",
      "role": "Étudiant en 5e année",
      "quote": "Entre la cité universitaire, la fac et mes stages au CHU…",
      "ridesCount": 54
    }
  ],
  "total": 3
}
```

```json
// /stats
{
  "activeUsers": 8500,
  "reviews": 3200,
  "platformRating": 4.9,
  "fleetSize": 44,
  "agencyCount": 5
}
```

`fleetSize` and `agencyCount` are computed live, never stored. `activeUsers`,
`reviews` and `platformRating` come from the `SiteStat` table.

**Note on the FAQ answer text.** Entry 5 contains a typographic apostrophe:
`"…est incluse d'office sans surcoût caché."` (`FaqSection.tsx:27`). It must be
seeded byte-identically, and the frontend must not re-encode it. A stray `'` versus
`’` is a visible diff in the UI.

---

#### 16 · `POST /api/v1/contact`

**Request.**

```json
{
  "name": "Yasmine B.",
  "email": "yasmine@example.tn",
  "subject": "Question sur une réservation",
  "message": "Bonjour, je voudrais réserver une trottinette pour samedi."
}
```

**Response `201`.**

```json
{
  "id": 42,
  "name": "Yasmine B.",
  "email": "yasmine@example.tn",
  "subject": "Question sur une réservation",
  "message": "…",
  "handled": false,
  "createdAt": "2026-10-21T14:32:11Z"
}
```

**Validation.** `name`, `email` and `message` are required. `message` is capped at
2000 characters. `subject` must be one of the five values. Errors return `400` with
`details` keyed by field.

**The response is the stored message**, so the frontend can render the confirmation
with the real content instead of the local state it uses today
(`ContactPage.tsx:147-174`).

---

#### 17 · `POST /api/v1/auth/register`

**Request.**

```json
{
  "username": "jeandupont",
  "email": "jean.dupont@exemple.com",
  "phone": "+216 98 123 456",
  "password": "unmotdepasse",
  "acceptTerms": true
}
```

**Response `201`.**

```json
{
  "user": {
    "id": "…",
    "username": "jeandupont",
    "email": "jean.dupont@exemple.com",
    "phone": "+216 98 123 456",
    "city": "",
    "address": "",
    "loyaltyPoints": 0,
    "loyaltyTier": "Bronze",
    "memberSince": "2026-10-21",
    "preferredAgencyId": null,
    "isStaff": false
  },
  "access": "eyJhbGciOiJIUzI1NiIs…",
  "refresh": "eyJhbGciOiJIUzI1NiIs…"
}
```

**Validation.**

- `username` is required, 3–30 ASCII letters/digits, no spaces, and unique
  case-insensitively → `400` with `details.username`.
- `email` must be unique → `400` with `details.email`.
- `password` must be at least **8 characters** → `400` with `details.password`. This
  matches the frontend exactly (`SignupPage.tsx:122`). The MVP does not add complexity
  rules.
- `acceptTerms` must be `true` → `400` with `details.acceptTerms`.
- `phone` is required by the frontend (`SignupPage.tsx:100`) → required here too.

**The `preferredAgencyId` field.** The mock profile has one
(`mockData.ts:689`), and the "Paramètres du compte" panel links to the preferred
agency (`ProfilePage.tsx:600`). It is stored as a nullable FK to `Agency`, defaulting
to `null`. It is **not** part of the registration form in the MVP — the customer
sets it later, or staff set it. Documented in §9.

---

#### 18–20 · `POST /api/v1/auth/login`, `/refresh`, `/logout`

**Login request.**

```json
{ "email": "rayen.rsalhi9@gmail.com", "password": "…" }
```

**Response `200`.**

```json
{
  "access": "eyJhbGciOiJIUzI1NiIs…",
  "refresh": "eyJhbGciOiJIUzI1NiIs…",
  "user": { "…": "…" }
}
```

**The `remember` flag.** The login form has a "Se souvenir de moi" checkbox, default
checked (`LoginPage.tsx:120`). It maps to the **refresh token lifetime**:

| `remember` | Refresh lifetime |
| ---------- | ---------------- |
| `true`     | 7 days           |
| `false`    | 1 day            |

**Request:**

```json
{ "email": "…", "password": "…", "remember": true }
```

This is implemented with two token-issuing paths, because SimpleJWT's lifetime is a
global setting. The cleanest approach is a custom view that overrides the token
lifetime per request:

```python
class RouliTokenObtainPairView(TokenObtainPairView):
    def obtain(self, request, *args, **kwargs):
        remember = request.data.get("remember", True)
        lifetime = (settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"]
                    if remember else timedelta(days=1))
        self.token_class.lifetime = timedelta(minutes=30)
        response = super().obtain(request, *args, **kwargs)
        refresh = self.token_class(user=response.data["user"], lifetime=lifetime)
        response.data["refresh"] = str(refresh)
        return response
```

**Errors.** Wrong password and unknown email both return `401` with the **same**
message — `"Identifiants invalides."` — so the endpoint cannot be used to discover
which emails have accounts.

**Logout.** `POST /api/v1/auth/logout` with the refresh token in the body blacklists
it. A subsequent use of that refresh token returns `401`.

---

#### 21–22 · `GET /api/v1/me`, `PATCH /api/v1/me`

**Response.** The same `user` object as registration, plus `isVerified`.

**`PATCH` request.**

```json
{
  "username": "rayensalhi",
  "phone": "+216 92 840 380",
  "city": "Monastir",
  "address": "12 Rue Marroc, Monastir 5000"
}
```

All four fields are optional in a PATCH; only the ones you send are changed. The
frontend's edit form (`ProfilePage.tsx:501-549`) sends them all.

`username` is validated with the same 3–30 alphanumeric rule and the same
case-insensitive uniqueness check as registration. A collision returns `400` with
`details.username`.

**`email` is read-only for customers.** Sending `email` in `PATCH /me` is a `400`
with `details.email` — not a silent ignore, so a client cannot believe the change
succeeded. Staff can correct an email in Django Admin; a customer who needs a new
login address contacts support. The frontend renders the email field as read-only.
This removes the old "email is editable but does not change login" ambiguity.

---

#### 23 · `GET /api/v1/me/stats`

```json
{
  "rides": 4,
  "totalDays": 8,
  "totalDT": 196,
  "co2SavedKg": 37
}
```

Computed from **completed reservations only**, exactly as `getUserStats()` does
(`mockData.ts:820-830`):

```python
done = Reservation.objects.filter(user=request.user, status=Status.COMPLETED)
days = sum(r.days for r in done)
{
    "rides": done.count(),
    "totalDays": days,
    "totalDT": sum(r.total_dt for r in done),
    "co2SavedKg": round(days * 4.6),
}
```

**The 4.6 kg/day constant is a placeholder.** It is the frontend's flat estimate
("vs an average car"), flagged with a `ponytail:` comment at `mockData.ts:827`. It
lives in `settings.py` as `CO2_KG_PER_RENTAL_DAY = 4.6` so it can be replaced with a
real model later. **The number is a business claim shown to customers** — either
replace it with a sourced figure or label it as an estimate. Flagged in §9.

---

#### 24 · `GET /api/v1/me/coupons`

The customer's usable coupons.

```json
{
  "items": [
    {
      "id": "…",
      "code": "RL-MNS-K7QP2M",
      "vehicleId": "bike-cowboy-4",
      "vehicleName": "Cowboy 4 ST",
      "vehicleImage": "/bikes/cowboy-4-st.webp",
      "vehicleFallbackImage": null,
      "agencyId": "ribat",
      "agencyName": "Agence Ribat & Médina",
      "status": "active",
      "startDate": "2026-10-21",
      "endDate": "2026-10-24",
      "days": 3,
      "totalDT": 72,
      "createdAt": "2026-10-19T09:00:00Z"
    }
  ],
  "total": 2
}
```

**The status vocabulary is translated.** The API returns `active` / `used` /
`expired` — the exact strings the frontend already expects
(`CouponStatus` in `mockData.ts:632`) — while the underlying `Reservation.status` is
`pending` / `active` / `completed` / `cancelled` / `expired`.

| `Reservation.status` | `coupon.status` |
| -------------------- | --------------- |
| `pending`            | `active`        |
| `active`             | `active`        |
| `completed`          | `used`          |
| `cancelled`          | `expired`       |
| `expired`            | `expired`       |

Only `pending` and `active` coupons are **returned** by this endpoint (the frontend
filters on `status === "active"` itself at `ProfilePage.tsx:91`).

---

#### 25 · `GET /api/v1/me/reservations`

The full history, most recent first. Same item shape as above, but with the
reservation status vocabulary instead of the coupon one.

```json
{
  "items": [
    {
      "id": "…",
      "code": "RL-MNS-K7QP2M",
      "vehicleId": "bike-cowboy-4",
      "vehicleName": "Cowboy 4 ST",
      "agencyId": "ribat",
      "agencyName": "Agence Ribat & Médina",
      "startDate": "2026-10-08",
      "endDate": "2026-10-10",
      "days": 2,
      "totalDT": 48,
      "status": "completed",
      "rating": 5
    }
  ],
  "total": 6
}
```

`status` uses the **reservation** vocabulary: `active` / `completed` / `cancelled`
(the frontend's `ReservationStatus` in `mockData.ts:633`). `pending` and `expired`
map to `active` and `cancelled` respectively for display.

**The frontend's status badge map** (`ProfilePage.tsx:67-74`) needs one new entry:
`pending` → "En cours" and `expired` → "Annulée". Two extra lines in the map.

---

#### 26 · `GET /api/v1/reservations/{id}`

One reservation, same item shape. **Ownership is enforced**: a reservation belonging
to another user returns `404`, not `403` — a `403` would confirm the id exists.

---

#### 27 · `POST /api/v1/reservations` — **the booking endpoint**

**Request.**

```json
{
  "vehicleId": "bike-cowboy-4",
  "agencyId": "ribat",
  "startDate": "2026-11-01",
  "endDate": "2026-11-04"
}
```

**Response `201`.**

```json
{
  "id": "6f1e…",
  "code": "RL-MNS-K7QP2M",
  "vehicleId": "bike-cowboy-4",
  "vehicleName": "Cowboy 4 ST",
  "vehicleImage": "/bikes/cowboy-4-st.webp",
  "agencyId": "ribat",
  "agencyName": "Agence Ribat & Médina",
  "startDate": "2026-11-01",
  "endDate": "2026-11-04",
  "days": 3,
  "totalDT": 72,
  "status": "active",
  "createdAt": "2026-10-21T14:32:11Z"
}
```

**The server's validation order matters.** Perform them in this order, so the customer
gets the most useful error first:

1. **Authentication.** No token → `401`.
2. **Payload shape.** `vehicleId`, `agencyId`, `startDate`, `endDate` are all
   required → `400` with `details`.
3. **Vehicle exists.** Unknown → `404`.
4. **Agency exists and stocks that vehicle.** Unknown agency, or a vehicle not offered
   at that agency → `400` on `agencyId`. (The frontend never lets you pick a
   mismatched pair — the agency is derived from the vehicle — but the API must check,
   because the client is not trusted.)
5. **Date sanity.** `startDate` must be today or later → `400` on `startDate`.
   `endDate` must be strictly after `startDate` → `400` on `endDate`.
6. **Duration.** `days = (endDate - startDate).days` must be 1–7 → `400` on
   `endDate` with the message "La durée maximale est de 7 jours.".
7. **Availability.** Every day in `[startDate, endDate)` must have
   `available_units >= 1` → `409` with the message "Ce véhicule n'est plus disponible
   sur une ou plusieurs de ces dates.".
8. **Price.** `total_dt = vehicle.price_per_day_dt * days`, computed server-side. A
   client-sent `totalDT` is ignored.
9. **Create.** Generate a unique `coupon_code`, create the reservation, decrement
   availability for each day in the range.

**The decrement must be atomic.** Two customers booking the last unit at the same
moment must not both succeed. On SQLite, `select_for_update()` is a **silent no-op**,
so row locking is not available. The portable pattern is a **guarded conditional
update**:

```python
from django.db import transaction
from django.db.models import F

@transaction.atomic
def book(user, vehicle, agency, start_date, end_date, days):
    for day in date_range(start_date, end_date):
        updated = VehicleAvailability.objects.filter(
            vehicle=vehicle,
            date=day,
            available_units__gte=1,
        ).update(available_units=F("available_units") - 1)

        if updated == 0:
            raise Conflict("Ce véhicule n'est plus disponible sur une ou plusieurs de ces dates.")

    return Reservation.objects.create(
        user=user, vehicle=vehicle, agency=agency,
        start_date=start_date, end_date=end_date,
        days=days, total_dt=vehicle.price_per_day_dt * days,
        coupon_code=generate_coupon_code(),
        status=Reservation.Status.PENDING,
    )
```

`UPDATE … WHERE available_units >= 1` is a single atomic statement at the database
level. If it affects 0 rows, the unit was taken. The loop is inside a transaction, so
a failure on day 3 rolls back days 1 and 2. **This works identically on SQLite and
PostgreSQL** — which is exactly why it is the right choice here. See §6.5.

**`generate_coupon_code()`** must not use `random` for the security-relevant part.
Use `secrets.choice` over an unambiguous alphabet:

```python
import secrets

ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"   # no I, O, 0, 1

def generate_coupon_code() -> str:
    while True:
        code = "RL-MNS-" + "".join(secrets.choice(ALPHABET) for _ in range(6))
        if not Reservation.objects.filter(coupon_code=code).exists():
            return code
```

32 characters of entropy minus the ambiguous ones. The `while` loop handles the
astronomically unlikely collision, and the `unique=True` constraint is the ultimate
guarantee.

---

#### 28 · `PATCH /api/v1/reservations/{id}/cancel`

**Request.** No body, or `{}`.

**Response `200`.** The reservation, with `status: "cancelled"` and `cancelledAt` set.

**Rules.**

- Only the owner can cancel → `404` for someone else's reservation.
- Only `pending` reservations can be cancelled → `409` for an already-cancelled or
  already-completed one.
- Cancelling restores `available_units` for every day in the range.
- This is the "Annulation 100% gratuite" promise (`SolutionSection.tsx:99-114`).

---

#### 29 · `POST /api/v1/reservations/{id}/rating`

**Request.**

```json
{ "rating": 5 }
```

**Response `200`.** The updated reservation, plus the recomputed vehicle rating.

**Rules.**

- Only `completed` reservations can be rated → `409` otherwise.
- `rating` is an integer 1–5 → `400` otherwise.
- Rating recomputes `Vehicle.rating` and `Vehicle.reviews_count` from all rated
  completed reservations:

```python
agg = Reservation.objects.filter(
    vehicle=vehicle, rating__isnull=False
).aggregate(avg=Avg("rating"), n=Count("id"))
vehicle.rating = round(agg["avg"], 2)
vehicle.reviews_count = agg["n"]
vehicle.save(update_fields=["rating", "reviews_count"])
```

**The seeded `rating` and `reviews_count` values (4.9, 124 reviews) are the starting
point.** When the first real rating is added, the recomputation would replace them
with the average of the _real_ ratings only, wiping the seeded reputation. Two
options: (a) seed the demo ratings as real completed reservations, so the average is
genuine, or (b) treat the seeded values as a baseline constant. **Recommendation:**
(a) — seed ~120 rated reservations per vehicle. That is ~1300 rows, which is fine, and
it makes the whole reputation system real. Documented in §9.

---

#### 30 · `GET /api/v1/staff/reservations`

| Param    | Meaning                                                                |
| -------- | ---------------------------------------------------------------------- |
| `code`   | Coupon code to look up                                                 |
| `date`   | ISO date, to list one day's pickups                                    |
| `agency` | Agency UUID, to scope to one agency. The literal `all` means no filter |

Requires a staff token → `403` for a customer.

**Response.**

```json
{
  "items": [
    {
      "id": "…",
      "code": "RL-MNS-K7QP2M",
      "vehicleName": "Cowboy 4 ST",
      "…": "…"
    }
  ],
  "total": 1
}
```

A `404` for an unknown code, or a code belonging to another agency.

---

#### 31 · `GET /api/v1/staff/agencies/{id}/pickups`

The reservations starting on a given date at a given agency, with the customer's
username and phone so the counter can call them.

```json
{
  "items": [
    {
      "id": "…",
      "code": "RL-MNS-K7QP2M",
      "customerUsername": "mehdi_k",
      "customerPhone": "+216 …",
      "vehicleName": "Cowboy 4 ST",
      "startDate": "2026-11-01",
      "days": 3,
      "status": "active"
    }
  ],
  "total": 4
}
```

**A privacy note.** This endpoint exposes customer usernames and phone numbers. It
must require `is_staff`, and it must never be exposed to a customer token. This is the
only endpoint in the system that crosses the customer/staff boundary, so it gets an
explicit permission class and an explicit test.

---

### 5.4 Error catalogue

| Status | `code`                | When                                                                          |
| ------ | --------------------- | ----------------------------------------------------------------------------- |
| `400`  | `validation_error`    | A field is missing or invalid. `details` maps fields to messages              |
| `401`  | `unauthenticated`     | No token, an expired token, or a revoked refresh token                        |
| `401`  | `invalid_credentials` | Wrong email or password on login                                              |
| `403`  | `permission_denied`   | Authenticated but not allowed — a customer calling a staff endpoint           |
| `404`  | `not_found`           | No such vehicle, agency, reservation, or route                                |
| `405`  | `method_not_allowed`  | Wrong HTTP verb for a known path                                              |
| `409`  | `conflict`            | A state conflict: no longer available, already cancelled, already rated       |
| `429`  | `throttled`           | Rate limit exceeded                                                           |
| `500`  | `server_error`        | Unhandled exception. The message is generic; the details go to the server log |

**Two rules.**

1. **The `message` is safe to show a customer.** It is French, plain, and says what
   to do next. No stack traces, no SQL, no internal ids.
2. **A `404` never confirms the existence of something you may not see.** Another
   user's reservation returns `404`, not `403`.

**DRF's default error format is different.** DRF returns
`{"detail": "…", "field": ["…"]}` for errors. To use the envelope above, write a
custom exception handler:

```python
# core/exception_handler.py
from rest_framework.views import exception_handler
from rest_framework import status


def rouli_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is None:
        return None

    code = getattr(exc, "default_code", "error")
    if isinstance(response.data, dict) and "detail" in response.data:
        message = str(response.data["detail"])
        details = {}
    else:
        message = _default_message(code)
        details = response.data

    response.data = {
        "error": {
            "code": code,
            "message": message,
            "details": details,
        }
    }
    return response
```

```python
# settings.py
REST_FRAMEWORK = {
    "EXCEPTION_HANDLER": "core.exception_handler.rouli_exception_handler",
    ...
}
```

---

### 5.5 Filtering, sorting and pagination, precisely

**The catalogue filter, in order.** This is the single most important piece of
logic in the backend, because it must reproduce the frontend's behaviour exactly.

```python
def filter_vehicles(queryset, params):
    vehicle_type = params.get("type")
    if vehicle_type in ("bike", "scooter"):
        queryset = queryset.filter(vehicle_type=vehicle_type)

    category = params.get("cat")
    if category and category != "all":
        queryset = queryset.filter(category_id=category)

    agency = params.get("agency")
    if agency and agency != "all":
        queryset = queryset.filter(agency_id=agency)

    max_price = params.get("price")
    if max_price is not None:
        # D1: absent means "no maximum". 45 is the top of the slider range.
        max_price = max(18, min(45, int(max_price)))
        queryset = queryset.filter(price_per_day_dt__lte=max_price)

    query = (params.get("q") or "").strip()
    if query:
        queryset = queryset.filter(search_blob__icontains=query.lower())

    if params.get("stock") != "0":
        queryset = queryset.filter(availability__available_units__gt=0)
    # else: include vehicles with no availability

    return queryset
```

**`all` is a UI sentinel, not an id.** The frontend's `AgencyFilter` and `BikeCategory`
types include the literal `"all"`, but it is never a database value. The API treats
`cat=all` and `agency=all` as “no filter”. Any other value must be a valid UUID; a
malformed one returns `400 validation_error`.

**The `stock` filter is subtly different from the frontend's.** The frontend filters
on the flat `stockAvailable` (`mockData.ts:152-154`). The backend filters on the
**availability rows for the requested window**. With no `start`/`end`, that means
today. So `?stock=0` (include out-of-stock) and the absence of `start`/`end` behave
identically to the frontend. With a date range, the filter becomes date-aware — which
is the improvement, not a regression.

**The `q` search.** The frontend searches 4 fields with a case-insensitive substring
(`BikesCatalogPage.tsx:156-165`). The backend searches `search_blob`, a
pre-computed concatenation of **name, description, tag, category label, agency name,
agency landmarks, agency localities, features and accessories**, lowercased and
accent-folded. This is a **superset** of the frontend's behaviour, which fixes **D4**
(users searching "casque" now find vehicles that include a helmet).

**Accent folding is done at write time, not query time.** `search_blob` is built when
the vehicle is saved, with `unicodedata.normalize("NFKD", …)` and the combining marks
stripped. The query then lowercases the user's input and does a plain `icontains`.
No SQLite extension, no `unaccent` dependency, identical behaviour on PostgreSQL.

**The date window and availability.**

| Rule                             | Value                                                                          |
| -------------------------------- | ------------------------------------------------------------------------------ |
| `start` default                  | today (local, Africa/Tunis)                                                    |
| `end` default                    | `start + 1 day`                                                                |
| Window semantics                 | **Half-open**: `[start, end)`. The end date is the day the vehicle is returned |
| A vehicle matches the window     | it has `available_units >= 1` on **every** day in `[start, end)`               |
| `stockAvailable` in the response | the **minimum** `available_units` across those days                            |

**Half-open is not a guess.** It matches `daysBetween()` in the frontend exactly
(`ReservationModal.tsx:33-38`): `days = round((end - start) / 86400000)`, floored at 1.
`start=2026-11-01, end=2026-11-04` → 3 days. `start == end` → 1 day. The API
reproduces this with `(end_date - start_date).days` and a `max(1, …)` floor, and the
database constraint `end_date > start_date` guarantees `end > start`.

**Sorting.**

| `sort`                 | ORM ordering                              |
| ---------------------- | ----------------------------------------- |
| `popularity` (default) | `-rating`, `-reviews_count`, `name`, `id` |
| `price-asc`            | `price_per_day_dt`, `name`, `id`          |
| `price-desc`           | `-price_per_day_dt`, `name`, `id`         |
| `range-desc`           | `-range_km`, `name`, `id`                 |

Ties break on `name`, then `id`, so the order is **stable and deterministic** across
requests. The frontend's `Array.prototype.sort` is stable and preserves the
catalogue's original array order for ties; the API must not be allowed to shuffle
between two identical requests, or the catalogue flickers. UUIDs have no meaningful
order, so `id` is only the final uniqueness guarantee.

**Pagination.** `page` ≥ 1, `page_size` between 1 and 50, default 12.

---

### 5.6 Frontend integration map

What changes in the React app once the API exists. **This is the complete list.** Any
other difference between the frontend and the API is a bug.

| #   | Frontend change                                                                                                      | Where                                 | Why                                                                                                                            |
| --- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Add an API client (a `fetch` wrapper that attaches the bearer token, and refreshes it on a `401`)                    | new `src/api/`                        | Nothing exists today                                                                                                           |
| 2   | Replace `CATALOG_BIKES` with the `GET /vehicles` response in the catalogue                                           | `BikesCatalogPage.tsx:24`             | The catalogue becomes server-driven                                                                                            |
| 3   | **Fix the `price` default** to 45                                                                                    | `BikesCatalogPage.tsx:100-103`        | **D1.** The server default is 45; the client must match                                                                        |
| 4   | Add `page` to the URL parameter set, and to `resetFilters`                                                           | `BikesCatalogPage.tsx:68-75, 176-184` | New pagination                                                                                                                 |
| 5   | Debounce the search input by 300 ms before writing to the URL                                                        | `BikesCatalogPage.tsx:257`            | Currently one URL write per keystroke; with a server that is one request per keystroke                                         |
| 6   | Add a `?start`/`?end` date picker to the catalogue, and forward the values                                           | new component                         | The dates are read but never written, so the modal's date branch is unreachable                                                |
| 7   | POST to `/api/v1/reservations` in `handleConfirm`, and handle the response                                           | `ReservationModal.tsx:53-67`          | The booking must reach the server                                                                                              |
| 8   | Add loading, error and disabled states to the booking submit button                                                  | `ReservationModal.tsx:270-276`        | A network call can fail and take time. The AGENTS.md rule "loading buttons show a spinner and keep the original label" applies |
| 9   | Show the server's error message inline when the booking fails with `409`                                             | `ReservationModal.tsx`                | The user must learn the vehicle was taken                                                                                      |
| 10  | Use the server-returned `code` instead of `Math.random()`                                                            | `ReservationModal.tsx:62`             | The server owns the coupon                                                                                                     |
| 11  | Update the coupon code display pattern to `RL-MNS-[A-Z0-9]{6}`                                                       | `ReservationModal.tsx`                | New format                                                                                                                     |
| 12  | Fetch the categories from `/vehicles/categories` instead of the hardcoded arrays                                     | `BikesCatalogPage.tsx:35-54`          | One source of truth. **The chip label changes** from "VTC Confort & Balade" to "VTC & Balade"                                  |
| 13  | Fetch the per-agency counts from `/vehicles/facets`                                                                  | `BikesCatalogPage.tsx:418-422`        | Server-side counts                                                                                                             |
| 14  | Replace `AGENCIES_LIST` with `/agencies`                                                                             | `AgenciesPage.tsx:15`                 | —                                                                                                                              |
| 15  | Make `AgenciesPage` read `?zone=`                                                                                    | `AgenciesPage.tsx:31-36`              | **D6.** The footer already links to it                                                                                         |
| 16  | Replace `USER_PROFILE` with `/me`                                                                                    | `ProfilePage.tsx`                     | The profile now carries `username`, not `fullName`                                                                             |
| 17  | Replace `USER_COUPONS` with `/me/coupons`                                                                            | `ProfilePage.tsx`                     | —                                                                                                                              |
| 18  | Replace `USER_RESERVATIONS` with `/me/reservations`                                                                  | `ProfilePage.tsx`                     | —                                                                                                                              |
| 19  | Replace `getUserStats()` with `/me/stats`                                                                            | `ProfilePage.tsx:96-101`              | —                                                                                                                              |
| 20  | Make the profile save a real `PATCH /me`, editing `username` only                                                    | `ProfilePage.tsx:126-130`             | `email` is read-only for customers                                                                                             |
| 21  | Make the login form a real `POST /auth/login`, and store the tokens                                                  | `LoginPage.tsx:17-22`                 | Currently a demo notice                                                                                                        |
| 22  | Make the signup form a real `POST /auth/register` with one `username` field                                          | `SignupPage.tsx:20-23`                | Remove the first/last name inputs                                                                                              |
| 23  | Add a route guard on `/profil` that redirects to `/login`                                                            | new                                   | The page is currently reachable anonymously                                                                                    |
| 24  | Require login before the booking modal opens                                                                         | `BikeDetailPage.tsx:45-47`            | **Login is now required to book.** The copy "La réservation reste accessible sans compte" is removed                           |
| 25  | Make the contact form a real `POST /contact`                                                                         | `ContactPage.tsx:61-64`               | Currently a no-op                                                                                                              |
| 26  | Fetch the FAQ from `/faq`                                                                                            | `FaqSection.tsx:8-37`                 | —                                                                                                                              |
| 27  | Fetch the testimonials and stats from `/testimonials` and `/stats`                                                   | `SocialProof.tsx`                     | —                                                                                                                              |
| 28  | Replace `getVehicleRadarData` with `/vehicles/{id}/availability`                                                     | `VehicleCharts.tsx:26`                | The radar is gone; render 14 availability bars                                                                                 |
| 29  | Replace `getVehicleBookingTrend` with `/vehicles/{id}/demand-by-weekday`                                             | `VehicleCharts.tsx:25`                | Render 7 weekday-demand bars                                                                                                   |
| 30  | Replace `getAgencyLoadByHour`/`ByWeekday` with `/agencies/{id}/load`                                                 | `AgencyLoadChart.tsx:8-11`            | —                                                                                                                              |
| 31  | Fix the chart axis locale from `en-US` to `fr-FR`                                                                    | `charts/chart-formatters.ts:1-4`      | **D7**                                                                                                                         |
| 32  | Read the agency hours from the record instead of the hardcoded string                                                | `BikeDetailPage.tsx:306`              | **D8**                                                                                                                         |
| 33  | Handle `404` from `/vehicles/{id}` and render the existing not-found state                                           | `BikeDetailPage.tsx:49-69`            | The state already exists                                                                                                       |
| 34  | Add a loading skeleton to the catalogue grid                                                                         | `BikesCatalogPage.tsx`                | AGENTS.md: "Skeletons mirror final content to avoid layout shift"                                                              |
| 35  | Widen `AgencyFilter`, `BikeCategory`, `CatalogBike.category`, `CatalogBike.agencyId` and `AgencyItem.id` to `string` | `src/types.ts`                        | UUIDs are opaque strings; the `"all"` sentinel stays a separate UI value                                                       |

**35 changes.** Twenty-one of them are mechanical (replace a constant with a fetch). The
substantive ones are 7, 8, 9, 10, 21, 22, 23 and 24 — the booking and auth flow.

**What does not change.** Every route, every French string, every chart type, every
animation, the URL scheme, and the visual design. The frontend is not being
redesigned. It is being connected.

---

---

## Part 6 — Architecture and technical decisions

### 6.1 The stack

| Component        | Choice                                | Version              | Why                                                                                                                                                                               |
| ---------------- | ------------------------------------- | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Language         | Python                                | 3.12+                | Django 5.2 supports 3.10–3.14                                                                                                                                                     |
| Framework        | Django                                | **5.2 LTS** (5.2.18) | Long-term support until **April 2028**. The most-documented version, so tutorials and Stack Overflow answers match it. Django 6.1 is newer but its ecosystem is still catching up |
| REST layer       | Django REST Framework                 | **3.18.x**           | The standard. 3.18 requires Django ≥ 5.2 and adds a built-in `unaccent` option to `SearchFilter`                                                                                  |
| Authentication   | djangorestframework-simplejwt         | **5.5.1**            | JWT access/refresh with a built-in blacklist. Note: 5.5.0 caps `PyJWT < 2.10.0`                                                                                                   |
| Database         | SQLite                                | 3.37+                | Zero setup, one file, perfect for a demo and an academic project. Django's default. See §6.5 for the concurrency caveats and the PostgreSQL path                                  |
| CORS             | django-cors-headers                   | latest               | The frontend and API are on different ports                                                                                                                                       |
| Password hashing | Django's built-in PBKDF2              | —                    | Argon2 via `argon2-cffi` is faster and stronger, but PBKDF2 is built in and secure. Switch with two settings lines if you want it                                                 |
| Environment      | `django-environ` or `python-decouple` | latest               | Read secrets from the environment, not from `settings.py`                                                                                                                         |
| API docs         | drf-spectacular                       | latest               | Generates OpenAPI and Swagger UI at `/api/docs/`. Optional but it makes the API self-documenting — worth it for a project you will demo                                           |

**`requirements.txt`:**

```
Django==5.2.18
djangorestframework==3.18.3
djangorestframework-simplejwt==5.5.1
django-cors-headers==4.7.0
django-environ==0.12.0
drf-spectacular==0.28.0
```

```
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

> The local machine already has Django 4.2.11 installed globally. **Create a
> virtual environment** and do not rely on the global install — mixing a global
> Django 4.2 with a `requirements.txt` pinning 5.2 produces confusing import errors.

### 6.2 Project layout

```
rouli-backend/
├── manage.py
├── requirements.txt
├── .env.example              # committed, no secrets
├── .env                      # git-ignored
├── db.sqlite3                # git-ignored
├── config/                   # the project package
│   ├── settings.py
│   ├── urls.py
│   ├── wsgi.py
│   └── asgi.py
├── core/                     # shared, app-agnostic pieces
│   ├── pagination.py
│   ├── exception_handler.py
│   ├── permissions.py
│   └── constants.py          # loyalty rates, CO2 factor, sort map
├── accounts/
│   ├── models.py             # User
│   ├── serializers.py
│   ├── views.py
│   ├── urls.py
│   ├── admin.py
│   ├── tests/
│   └── migrations/
├── agencies/
│   ├── models.py             # Agency
│   └── ...
├── vehicles/
│   ├── models.py             # Category, Vehicle, VehicleAvailability
│   ├── filters.py
│   ├── serializers.py
│   ├── services.py           # availability and weekday-demand aggregation
│   ├── views.py
│   └── ...
├── bookings/
│   ├── models.py             # Reservation
│   ├── services.py           # book(), cancel(), coupon generation
│   ├── views.py
│   └── ...
├── content/
│   ├── models.py             # Faq, Testimonial, SiteStat, ContactMessage
│   ├── management/
│   │   └── commands/
│   │       ├── seed_demo.py
│   │       └── extend_availability.py
│   └── ...
```

**`core/` is not an app in the domain sense** — it holds code that does not belong to
any single app: the pagination class, the exception handler, the permission classes
and the constants. Django will not create a table for it and you should not register
it in `INSTALLED_APPS` unless it holds models. It is a normal Python package.

**`services.py` is where the business logic lives.** Views should be thin: parse the
request, call a service, serialise the result. The booking rules (§5.3, endpoint 27)
are 40 lines of logic; they belong in `bookings/services.py`, not in a view function.
This is what makes them unit-testable without going through HTTP.

### 6.3 Settings

```python
# config/settings.py
import os
from datetime import timedelta
from pathlib import Path

import environ

BASE_DIR = Path(__file__).resolve().parent.parent
env = environ.Env(DEBUG=(bool, True))
environ.Env.read_env(BASE_DIR / ".env")

SECRET_KEY = env("DJANGO_SECRET_KEY")
DEBUG = env("DJANGO_DEBUG")
ALLOWED_HOSTS = env.list("DJANGO_ALLOWED_HOSTS", default=["localhost", "127.0.0.1"])

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # third party
    "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    "corsheaders",
    "drf_spectacular",
    # local
    "core",
    "accounts",
    "agencies",
    "vehicles",
    "bookings",
    "content",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",   # MUST be first
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
        "OPTIONS": {
            # SQLite serialises writers. Without a timeout, a concurrent write
            # raises "database is locked" immediately. 20s makes it wait.
            "timeout": 20,
        },
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
     "OPTIONS": {"min_length": 8}},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "fr-fr"
TIME_ZONE = "Africa/Tunis"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# --- CORS -----------------------------------------------------------------
CORS_ALLOWED_ORIGINS = env.list(
    "CORS_ALLOWED_ORIGINS", default=["http://localhost:3000", "http://127.0.0.1:3000"]
)
CORS_ALLOW_CREDENTIALS = True

# --- Django REST Framework ------------------------------------------------
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticatedOrReadOnly",
    ),
    "DEFAULT_PAGINATION_CLASS": "core.pagination.RouliPagination",
    "PAGE_SIZE": 12,
    "DEFAULT_FILTER_BACKENDS": (
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.OrderingFilter",
    ),
    "EXCEPTION_HANDLER": "core.exception_handler.rouli_exception_handler",
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "DEFAULT_THROTTLE_CLASSES": (
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ),
    "DEFAULT_THROTTLE_RATES": {
        "anon": "300/hour",
        "user": "1200/hour",
        "login": "10/hour",
    },
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=30),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
}

SPECTACULAR_SETTINGS = {
    "TITLE": "Rouli API",
    "DESCRIPTION": "API de réservation de vélos et trottinettes électriques à Monastir.",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
}

# --- Rouli business constants ---------------------------------------------
# CO2 saved per rented day, versus an average car. An ESTIMATE, not a
# measurement. Replace with a sourced model before making a public claim.
CO2_KG_PER_RENTAL_DAY = 4.6

# Loyalty: 10 points per rental day + 1 point per 5 DT spent.
LOYALTY_POINTS_PER_DAY = 10
LOYALTY_DT_PER_POINT = 5

# Loyalty thresholds, in points.
LOYALTY_TIERS = [
    (0, "Bronze"),
    (500, "Argent"),
    (1000, "Or"),
    (1500, "Platine"),
]
LOYALTY_NEXT_REWARD_AT = 1500

# Booking rules
MAX_RENTAL_DAYS = 7
MIN_RENTAL_DAYS = 1
COUPON_PREFIX = "RL-MNS-"
COUPON_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"   # no I, O, 0, 1
AVAILABILITY_HORIZON_DAYS = 90
```

### 6.4 Security

| Concern                        | Measure                                                                                                                                                                                  |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Password storage**           | PBKDF2 with a per-user salt, via `User.objects.create_user()`. Never call `save()` with a raw password. The password is never returned by any serializer                                 |
| **Password policy**            | Minimum 8 characters (`MinimumLengthValidator`), plus Django's common-password and numeric-password checks. The frontend's rule is a floor, not a ceiling                                |
| **Token secrets**              | `SECRET_KEY` from the environment. Never committed. A leaked key means anyone can forge tokens                                                                                           |
| **Token lifetime**             | Access 30 min, refresh 7 days. Short access tokens limit the damage from a leak                                                                                                          |
| **Token storage (frontend)**   | `localStorage`. Convenient and XSS-exposed. The alternative (httpOnly cookies) needs CSRF handling. Accepted for this project; see §9                                                    |
| **CORS**                       | An explicit allowlist of origins. Never `*` with credentials. `CorsMiddleware` first in the stack                                                                                        |
| **CSRF**                       | Not needed for token-authenticated endpoints. The `CsrfViewMiddleware` stays for the Django Admin                                                                                        |
| **Object-level authorisation** | Every reservation endpoint checks `obj.user == request.user` and returns `404` for other users' rows. Never rely on the frontend to hide a button                                        |
| **Rate limiting**              | 10 attempts/hour on login (brute-force protection), 300/hour anonymous, 1200/hour authenticated                                                                                          |
| **Input validation**           | Every write goes through a serializer. `max_length` on every `CharField`, `max_length` on the contact message, `PositiveIntegerField` for counts and prices, `CheckConstraint` on `days` |
| **SQL injection**              | Impossible through the ORM. The ORM parameterises everything. Never use `raw()` or `extra()` with user input                                                                             |
| **Mass assignment**            | The booking serializer accepts only 4 fields. `total_dt`, `days`, `status` and `coupon_code` are `read_only`. The client cannot set its own price                                        |
| **Secret leakage**             | `DEBUG = False` in production. `ALLOWED_HOSTS` set. Django's `check --deploy` catches the rest                                                                                           |
| **Admin**                      | Staff-only. Every staff account needs a strong unique password. No `is_superuser` accounts in production                                                                                 |

### 6.5 Concurrency, and the SQLite caveat

**SQLite serialises all writes.** One writer at a time, for the whole database. This
is the single biggest difference from PostgreSQL and it must shape your design.

**`select_for_update()` is a silent no-op on SQLite.** Django's documentation says so
explicitly. It does not raise an error — it just does nothing, so a row-locking
strategy that works on PostgreSQL will **overcommit stock** on SQLite without any
error. Do not use it here.

**The pattern that works everywhere: a guarded conditional update.**

```python
updated = VehicleAvailability.objects.filter(
    vehicle=vehicle, date=day, available_units__gte=1
).update(available_units=F("available_units") - 1)

if updated == 0:
    raise Conflict("...")
```

`UPDATE … WHERE available_units >= 1` is one atomic statement. The database either
applies the decrement or it does not. There is no read-then-write window for another
request to slip into, because the check and the write are the same statement. This
is **correct on SQLite and on PostgreSQL**, with no code change.

**Wrap the multi-step booking in a transaction.** The booking touches N availability
rows plus the reservation insert. If day 3 fails, days 1 and 2 must be rolled back:

```python
from django.db import transaction

with transaction.atomic():
    for day in days_range:
        ...
    reservation = Reservation.objects.create(...)
```

**SQLite's write lock.** Two concurrent writers hit `OperationalError: database is
locked`. Two mitigations, both applied above:

1. `OPTIONS: {"timeout": 20}` — the second writer waits up to 20 seconds for the
   lock instead of failing instantly.
2. Keep transactions short. Never make an external call (an email, an HTTP request)
   inside a transaction.

**What SQLite is genuinely fine for.** The MVP has ~11 vehicles, ~990 availability
rows, ~1300 reservations and 5 users. SQLite handles that with a huge margin. The
concurrency limit is not the bottleneck; the feature set is.

**The PostgreSQL path, when you need it.** Change one block in `settings.py`:

```python
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": env("POSTGRES_DB"),
        "USER": env("POSTGRES_USER"),
        "PASSWORD": env("POSTGRES_PASSWORD"),
        "HOST": env("POSTGRES_HOST", default="localhost"),
        "PORT": env("POSTGRES_PORT", default="5432"),
    }
}
```

Then `pip install psycopg[binary]`, run `migrate`, and everything works. The schema
uses no SQLite-specific features. The guarded `UPDATE` is portable. The one thing
you would _add_ on PostgreSQL is `select_for_update()` for stricter isolation, but
the guarded update makes it unnecessary.

**The one thing to change when you move:** SQLite's `DecimalField` and date handling
are fine, but `JSONField` queries behave slightly differently. For this schema,
nothing queries a JSON field.

---

## Part 7 — Delivery plan

Seven phases. Each has a goal, tasks, a "done" definition and an estimate. **The
order matters**: each phase produces something you can run and show.

| Phase | Goal                                 | Estimate |
| ----- | ------------------------------------ | -------- |
| 0     | Environment + Django foundations     | 2–3 h    |
| 1     | Read-only catalogue API              | 4–5 h    |
| 2     | Authentication                       | 3–4 h    |
| 3     | Booking engine                       | 5–6 h    |
| 4     | Profile, contact, content, analytics | 4–5 h    |
| 5     | Frontend wiring                      | 6–8 h    |
| 6     | Admin, deployment, polish            | 3–4 h    |

**Total: 27–35 hours.** For a full-time student, roughly one week.

---

### Phase 0 — Environment and foundations · 2–3 h

**Goal.** A running Django project with a test that passes.

1. Create the virtual environment and install the pinned dependencies.
2. `django-admin startproject config .` and `python manage.py startapp` for each of
   the 5 apps.
3. Write `settings.py` from §6.3. `DEBUG=True`, SQLite, `TIME_ZONE="Africa/Tunis"`.
4. Wire `config/urls.py` to include each app's `urls.py`.
5. Add `CORS_ALLOWED_ORIGINS` and confirm `CorsMiddleware` is first in the stack.
6. Create a `core/tests.py` with one trivial passing test, and run `python manage.py
test` to confirm the harness works.

**Done when** `python manage.py test` prints "OK" and `python manage.py runserver`
starts without warnings.

---

### Phase 1 — Read-only catalogue API · 4–5 h

**Goal.** The catalogue served from the database, matching the frontend's behaviour
exactly.

1. Write the `Agency`, `Category` and `Vehicle` models (§4.3). `makemigrations` and
   `migrate`.
2. Write the seed command with the 5 agencies, 6 categories and 11 vehicles,
   **verbatim** from `mockData.ts`. Include the invariant assertions from §4.5.
3. Write `VehicleListSerializer` and `VehicleDetailSerializer` with the camelCase
   field names from §5.3. Use `source=` to map from the snake_case models.
4. Write the `VehicleFilter` (django-filter) and the availability window logic.
5. Write `VehicleViewSet` as a **`ReadOnlyModelViewSet`**. Register the router.
6. Implement `GET /vehicles`, `/vehicles/{id}`, `/vehicles/categories`,
   `/vehicles/facets`, `/vehicles/{id}/related`.
7. Write the `RouliPagination` class and the custom exception handler.

**Done when** `curl "http://localhost:8000/api/v1/vehicles?type=scooter&price=25&sort=price-asc"`
returns the expected 3 scooters sorted by price, and the test suite covers the 15
acceptance criteria from F1.

**Watch out for:** the `price` default. The server default is **45**. Write a test
that asserts `GET /vehicles` with no `price` returns all 11 vehicles.

---

### Phase 2 — Authentication · 3–4 h

**Goal.** Users can register, log in, refresh and log out.

1. Write the custom `User` model. `makemigrations`, `migrate`.
2. `SIMPLE_JWT` settings. Add `token_blacklist` to `INSTALLED_APPS` and migrate.
3. Write the register serializer with the validation rules from F5, including the
   `acceptTerms` check and the 8-character password minimum.
4. Write the login view with the `remember` flag controlling the refresh lifetime
   (§5.3, endpoint 18).
5. Add `GET /me` and `PATCH /me`, with the username rule and the read-only email.
6. Add the `IsOwnerOrReadOnly` permission class and use it on reservation endpoints.
7. Set the rate limits.

**Done when** a user can register, log in, call `/me` with the token, refresh it,
and log out. The refresh token is dead after logout.

**Watch out for:** `USERNAME_FIELD = "email"` means `createsuperuser` asks for an
email and also for a `username` (`REQUIRED_FIELDS = ["username"]`). There are no
`first_name` / `last_name` fields to fill in.

---

### Phase 3 — The booking engine · 5–6 h

**Goal.** A customer can book a vehicle, get a coupon, and cancel for free. **This
is the heart of the project.**

1. Write the `Reservation` model and its constraints (§4.3).
2. Write the `VehicleAvailability` model and extend the seed command to create
   90 days of rows per vehicle.
3. Write `bookings/services.py`:
   - `generate_coupon_code()` using `secrets`
   - `quote(vehicle, start, end)` → `(days, total_dt)`, with all the validation
   - `book(user, vehicle, agency, start, end)` → the guarded-decrement transaction,
     then award loyalty and store `loyalty_points_awarded`
   - `cancel(reservation)` → restore the availability and reverse the exact loyalty
     amount, floored at 0
   - `transition_status(reservation, new_status)` → the single status path used by
     both the API and Django Admin, so cancellation/expiry reverses points once
4. Write the `ReservationSerializer` (read-only fields: `days`, `totalDT`, `status`,
   `code`) and the `ReservationViewSet` with the `cancel` action.
5. Write `GET /me/coupons` and `GET /me/reservations`, with the status translation.
6. Write the 12 acceptance-criteria tests from F4, **including the double-booking
   test** (§8).

**Done when** two concurrent requests for the last unit produce one `201` and one
`409`, and the availability rows are unchanged after the failure.

**Watch out for:** `end_date` is exclusive. `start == end` is 1 day, not 0.

---

### Phase 4 — Profile, contact, content, analytics · 4–5 h

**Goal.** The remaining P1 endpoints.

1. `GET /me/stats`, with the `CO2_KG_PER_RENTAL_DAY` constant.
2. `POST /contact` and the `ContactMessage` model.
3. The `Faq`, `Testimonial` and `SiteStat` models, their seed data, and their three
   endpoints.
4. The availability endpoint — read `VehicleAvailability` for the next 14 days,
   clamp to `[0, total_units]`.
5. `GET /vehicles/{id}/availability` and `GET /vehicles/{id}/demand-by-weekday`,
   the latter grouping real reservations by weekday over 90 days.
6. `GET /agencies`, `/agencies/{id}`, `/agencies/{id}/vehicles`,
   `/agencies/{id}/load`, with the occupancy computation from real reservations.
7. The staff endpoints, with the `IsAgencyStaff` permission.

**Done when** the charts display real aggregates, and booking/cancelling a unit
changes the availability chart on the next request.

**Watch out for:** the weekday bucket is derived from `start_date`, and only
`pending`, `active` and `completed` reservations count. A future `pending` reservation
outside the 90-day history window is not in the chart.

---

### Phase 5 — Frontend wiring · 6–8 h

**Goal.** The React app talks to the API. This is the 35-item list in §5.6.

**Suggested order**, so the app is never broken for long:

1. The API client with token attachment and automatic refresh (§5.6 items 1, 21, 22).
2. The catalogue (§5.6 items 2–5, 12, 13). The app is fully working again here.
3. The agencies (§5.6 items 14, 15).
4. The vehicle detail page and the charts (§5.6 items 28–33, 35).
5. The content: FAQ, testimonials, stats (§5.6 items 26, 27).
6. The booking flow (§5.6 items 6–11, 24). The most delicate part.
7. The profile (§5.6 items 16–20, 23).
8. The contact form (§5.6 item 25).

**Done when** the app behaves identically to the demo, except that the data comes
from the server and a booking survives a page reload.

**Watch out for:** the search input writes to the URL on every keystroke. Add a
300 ms debounce **before** pointing it at the API, or you will send a request per
keystroke.

---

### Phase 6 — Admin, deployment, polish · 3–4 h

**Goal.** A demo you can hand to a marker.

1. Register every model in Django Admin, with useful `list_display`, `list_filter`
   and `search_fields`. Add an inline for `VehicleAvailability`.
2. The `extend_availability` management command, to roll the 90-day window forward.
3. The `recompute_ratings` management command, to fix any rating drift.
4. `DEBUG=False`, a real `SECRET_KEY`, `ALLOWED_HOSTS` set, `check --deploy` clean.
5. Deploy. The simplest options that work with SQLite:
   - **Render** or **Railway** with a persistent disk and a start command of
     `gunicorn config.wsgi:application`
   - Or a **VPS** with `systemd` + `nginx`
   - Or, for a purely academic demo, a local network server with `runserver
0.0.0.0:8000`
6. Seed the production database, create a superuser, and walk the whole flow once.
7. `python manage.py test` — all green.
8. Write the project README: how to run it, how to seed it, how to log in.

**Done when** a person who has never seen the project can clone it, run two
commands, and see the app working.

---

## Part 8 — Testing strategy

### 8.1 The rule

**A feature is not done until its acceptance criteria from §2.4 are automated
tests.** The criteria in this PRD were written as test cases on purpose. The count
across F1–F10 is **83 criteria**, and most map one-to-one onto a test function.

### 8.2 The eight tests that matter most

If you only have time for eight, write these.

| #   | Test                                                                                                                                                 | Why it matters                                                          |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| 1   | **Double booking.** Two users book the last unit for the same dates. One gets `201`, the other `409`, and the availability row is `0` afterwards     | The core business rule. A silent overcommit means giving away a vehicle |
| 2   | **Failed booking leaves no trace.** A booking that fails on day 3 restores days 1 and 2                                                              | A rollback bug silently corrupts availability                           |
| 3   | **The server ignores a client-sent price.** `POST /reservations` with `totalDT: 0` returns the real total                                            | Mass assignment. The most common API vulnerability                      |
| 4   | **Date and duration rules.** `start == end` → 1 day; 8 days → `400`; a past start → `400`                                                            | The booking window is the product's main constraint                     |
| 5   | **Ownership.** User A cannot read, cancel or rate user B's reservation — all `404`                                                                   | Authorisation                                                           |
| 6   | **Catalogue parity.** The server's filtered + sorted result matches the frontend's client-side result, item for item                                 | Proves the migration did not change what the customer sees              |
| 7   | **Availability truth.** Booking the last unit sets that day's availability to `0`; cancelling restores it; no day is negative or above `total_units` | The availability chart is only useful if it matches the booking engine  |
| 8   | **Token lifecycle.** Expired access → `401`; blacklisted refresh → `401`; the password is in no response body                                        | Auth correctness and no secret leakage                                  |

### 8.3 What to test where

| Layer           | Tool                                  | Covers                                                                                                                                                                                      |
| --------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Unit**        | `django.test.TestCase`                | `quote()`, `generate_coupon_code()`, the loyalty formula and reversal, the availability and weekday aggregation, the occupancy computation, the status translation. Pure functions, no HTTP |
| **API**         | `APIClient`                           | Every endpoint's status code, response shape, and authorisation. This is where most of the 83 criteria live                                                                                 |
| **Integration** | `APIClient`                           | The booking flow end to end: register → login → book → list coupons → cancel → the availability is restored                                                                                 |
| **Parity**      | `APIClient` + a hardcoded expectation | The catalogue order, against the values the current frontend produces                                                                                                                       |

### 8.4 A note on the parity tests

**Write the expected values by hand from the current frontend, not by running the
frontend.** If you compute the expectation with the same code you are testing, the
test only proves the code is consistent with itself.

There is **no chart parity test** anymore. The radar and booking-trend generators are
deleted, and the replacement charts read real rows; the test to write is the
availability/weekday invariant test from §8.2, not a numeric comparison against
`mockData.ts`.

The catalogue order still has a parity test. Record the exact order of the 11 vehicles
under each of the 4 sort options, and assert the API returns that order.

**The catalogue order to assert**, for the parity test of endpoint 2:

| `sort`       | Expected order                                                                                                                                                                                                                                                     |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `popularity` | Trek Verve+ 3 (4.95) → Michael Blast Soda (4.93) → Tern GSD S10 (4.92) → Cowboy 4 ST (4.90) → Segway E3 Pro (4.90) → Cube Touring (4.88) → Gazelle C8 (4.87) → Xiaomi 5 Max (4.86) → Cannondale Trail Neo 4 (4.85) → Segway Max G2 (4.80) → Brompton C Line (4.79) |
| `price-asc`  | Segway Max G2 (18) → Xiaomi 5 Max (21) → Brompton (22) → Cowboy 4 ST (24) → Segway E3 Pro (24) → Trek Verve+ 3 (27) → Gazelle C8 (28) → Michael Blast (29) → Cube Touring (32) → Cannondale (34) → Tern GSD (45)                                                   |
| `price-desc` | The reverse of `price-asc`                                                                                                                                                                                                                                         |
| `range-desc` | Cube Touring (120) → Tern GSD (110) → Gazelle (100) → Trek Verve+ 3 (95) → Cannondale (90) → Michael Blast (80) → Cowboy 4 ST (70) → Segway Max G2 (70) → Xiaomi 5 Max (60) → Segway E3 Pro (55) → Brompton (45)                                                   |

**Ties are broken by name, then id.** Cowboy 4 ST and Segway E3 Pro both cost 24 DT;
Cowboy 4 ST and Segway Max G2 both have 70 km of range. In both cases the frontend's
stable sort keeps Cowboy first, and `name` ordering does the same. The final `id`
tiebreaker is only there to make the order deterministic when two vehicles have the
same name — it is not a display order.

The API's order is deliberate: it is **deterministic across requests**, which the
frontend's is not guaranteed to be (a stable sort is stable, but the input array
order changes if the catalogue is re-seeded in a different order). A customer should
not see the grid reshuffle between two identical requests.

### 8.5 Coverage

Aim for **80 % line coverage** on the `services.py` files and **70 %** overall, and
check it with `coverage`:

```bash
pip install pytest-cov
coverage run manage.py test
coverage report --show-missing
```

Do not chase 100 %. The business logic should be well covered; the serializers and
the boilerplate do not need to be.

---

## Part 9 — Risks, open questions and deliberate simplifications

### 9.1 Decisions I made for you

These were judgement calls. Each one is listed with the reasoning so you can
override it. None of them is expensive to change later.

| #    | Decision                                                                      | Reasoning                                                                                                                                                                                  | Reversible?                          |
| ---- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------ |
| D-1  | The API's JSON keys are the frontend's existing camelCase names               | Zero renaming work in the frontend. The serializers absorb the snake_case                                                                                                                  | Yes, but it touches every serializer |
| D-2  | `price` defaults to **45** server-side                                        | The slider's maximum. The current value of 18 is a bug (**D1**)                                                                                                                            | Yes, one line                        |
| D-3  | Every model uses a UUID primary key; there are no slugs                       | The frontend treats ids as opaque strings, so the change is mechanical. It avoids enumerable ids                                                                                           | Yes, but it touches the URLs         |
| D-4  | One `Reservation` table, not two                                              | The frontend's `UserCoupon` and `UserReservation` are the same rows                                                                                                                        | Yes, add a `Coupon` model later      |
| D-5  | Login is required to book                                                     | Simplifies the schema and makes the coupon recoverable. You chose this                                                                                                                     | Yes — make `user` nullable           |
| D-6  | SQLite, not MongoDB                                                           | You chose MongoDB, then chose SQLite. Django's ORM is SQL-native; `django-mongodb-backend` exists but its DRF support is only "partially supported" and `select_for_update` is unavailable | Yes, one `DATABASES` block           |
| D-7  | JWT, not sessions                                                             | You chose this. Standard for a React SPA                                                                                                                                                   | Yes, but the frontend changes        |
| D-8  | Availability is a materialised daily table                                    | Makes the availability check one indexed lookup instead of a correlated subquery                                                                                                           | Yes, at a performance cost           |
| D-9  | The coupon format becomes `RL-MNS-` + 6 characters                            | 4 digits is 8000 combinations and `Math.random()` is not secure                                                                                                                            | Yes, one function                    |
| D-10 | The PRD is in English, with French strings verbatim                           | The README is in English; the code and the UI are French                                                                                                                                   | Yes, it is a document                |
| D-11 | The category chip label changes from "VTC Confort & Balade" to "VTC & Balade" | One vocabulary instead of two (**D5**)                                                                                                                                                     | Yes, seed the old labels             |
| D-12 | 90-day availability horizon                                                   | Scopes the problem                                                                                                                                                                         | Yes, change the constant             |
| D-13 | Loyalty tiers are thresholds in `settings.py`, not a table                    | Four tiers, unlikely to change                                                                                                                                                             | Yes                                  |

### 9.2 Deliberate simplifications, and their ceilings

| Simplification                                                                           | The ceiling                                                                                             | Upgrade path                                                                    |
| ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `features` / `included_accessories` are JSON lists                                       | Cannot query "vehicles that include a helmet" or price an accessory                                     | Promote to a model with a `through` table                                       |
| `landmarks` / `localities` are JSON lists                                                | Cannot share a landmark between two agencies                                                            | Promote to a `Landmark` model                                                   |
| `rating` / `reviews_count` are denormalised on `Vehicle`                                 | Can drift from the reservations                                                                         | A `recompute_ratings` management command                                        |
| No text reviews                                                                          | Customers cannot leave a comment                                                                        | A `Review` model with a `OneToOneField` to `Reservation`                        |
| `loyalty_points` is a counter, not a ledger                                              | Cannot audit how points were earned; `Reservation.loyalty_points_awarded` only prevents double reversal | A `LoyaltyTransaction` table                                                    |
| The loyalty formula is `days × 10 + floor(total_dt / 5)`                                 | A long cheap rental can earn fewer points than a short expensive one; the rates are arbitrary           | Change the two `settings.py` constants if the business rules change             |
| A customer's email is read-only                                                          | Changing it requires staff intervention                                                                 | Add an email-verification flow and allow self-service change                    |
| No email or push notifications                                                           | A customer who closes the browser loses the coupon                                                      | Django `send_mail` with a console backend in dev                                |
| No soft delete on `User`                                                                 | A deleted account's reservations go too                                                                 | Add `deleted_at` and anonymise                                                  |
| No availability beyond 90 days                                                           | The catalogue shows nothing for later dates                                                             | A rolling-horizon command                                                       |
| The CO₂ factor is a flat 4.6 kg/day                                                      | It is an estimate presented to customers as a number                                                    | Source a real figure, or label it as an estimate                                |
| The seeded marketing figures (`8500` users, `3200` reviews) are stored constants         | They are not real and cannot grow on their own                                                          | Compute from the data, or label them as projections                             |
| The testimonial names are fictional but realistic (`Mehdi K.`, `Yasmine B.`, `Karim T.`) | Publishing fictional testimonials as real is a legal problem in Tunisia and the EU                      | Replace with real, consented testimonials, or clearly mark them as illustrative |
| The demo customer uses a real email address from the mock data                           | It must be changed before any deployment                                                                | Use a `rouli.demo@example.tn` address in the seed                               |

### 9.3 Risks

| Risk                                                                       | Likelihood | Impact | Mitigation                                                                                                                                                      |
| -------------------------------------------------------------------------- | ---------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Scope creep.** The frontend is beautiful and everything is "nearly done" | High       | High   | The phase plan in Part 7 is the scope. F9 (charts) is the designated cut                                                                                        |
| **SQLite locking under concurrent bookings**                               | Medium     | Medium | The guarded `UPDATE` + `timeout: 20` + short transactions (§6.5). Move to PostgreSQL if it appears                                                              |
| **The seed diverges from `mockData.ts`**                                   | Medium     | Medium | The parity tests (§8.4). The seed asserts its own invariants (§4.5)                                                                                             |
| **JWT in `localStorage` is stolen by an XSS**                              | Low        | High   | The frontend's `AGENTS.md` rules on content handling. Never render user content as HTML. `httpOnly` cookies if you have time                                    |
| **Forgetting `CorsMiddleware` first in `MIDDLEWARE`**                      | Medium     | Medium | The CORS preflight fails with a confusing error. Check the order first when the browser complains                                                               |
| **Forgetting `select_related` and the N+1 problem**                        | Medium     | Low    | The Django Debug Toolbar, and `assertNumQueries` in a test                                                                                                      |
| **`makemigrations` forgotten after a model change**                        | High       | Medium | `python manage.py makemigrations --check` in CI and in a pre-commit hook                                                                                        |
| **The frontend's `price` bug (D1) is never fixed**                         | Medium     | High   | The backend returns 45; the frontend clamps to 18. The catalogue would show 1 vehicle. Fix it in Phase 5, and the test in Phase 1 will fail loudly until you do |
| **Timezone confusion around "today"**                                      | Medium     | Medium | `TIME_ZONE = "Africa/Tunis"`, `USE_TZ = True`, and dates as `DateField` (no time component). A booking for "today" means today in Tunis                         |
| **The scope of the academic project is judged on the backend**             | —          | —      | The PRD, the ER diagram, the OpenAPI schema and the test suite are all artefacts you can show. Generate the OpenAPI schema with drf-spectacular and include it  |

### 9.4 Open questions for your supervisor or your future self

1. **Should the demo customer be a real person?** The seed uses the name and email
   from `mockData.ts`. For a public deployment, use a clearly synthetic account.
2. **Is `4.6 kg CO₂ / day` defensible?** It is a customer-facing number with a
   `ponytail:` comment on it in the frontend. Either source it or soften the wording.
3. **Do the marketing figures need to be real?** `8500` users and `3200` reviews for a
   project that has been running for a week. Consider labelling them as projections.
4. **Is a 90-day booking horizon enough?** The FAQ says 1–7 days per rental, but
   nothing limits how far ahead a customer books.
5. **Should the "Zones à Monastir" footer links work?** They currently point at
   `?zone=5000` and similar. **D6** says yes.
6. **Does the MVP need a real "return the vehicle" flow?** Currently staff change the
   status in Django Admin. A customer-facing return flow is a natural Phase 2.

---

## Appendices

### Appendix A — Glossary

**Django and web concepts.**

| Term                       | Meaning                                                                                    |
| -------------------------- | ------------------------------------------------------------------------------------------ |
| **App**                    | A Python package owning a slice of the domain. Registered in `INSTALLED_APPS`              |
| **Model**                  | A Python class describing a database table                                                 |
| **ORM**                    | Object-Relational Mapper. Turns Python into SQL so you never write SQL                     |
| **Migration**              | A file describing a schema change. Committed to git                                        |
| **QuerySet**               | A lazy, chainable description of a database query                                          |
| **Manager**                | The entry point to a model's queries: `Model.objects`                                      |
| **`__str__`**              | The method that defines how an object prints itself                                        |
| **Serializer**             | Converts between model instances and JSON; validates input                                 |
| **View / ViewSet**         | The request handler. A viewset bundles list/create/retrieve/update/delete                  |
| **Router**                 | Generates the URL patterns for a viewset                                                   |
| **`@action`**              | Adds a custom endpoint to a viewset                                                        |
| **Permission class**       | Decides whether a request is allowed                                                       |
| **Middleware**             | Code that runs on every request, before and after the view                                 |
| **Admin site**             | The auto-generated data management interface at `/admin/`                                  |
| **Settings**               | All configuration, in `settings.py`                                                        |
| **`manage.py`**            | The command-line entry point                                                               |
| **JWT**                    | A signed, self-contained token carrying claims                                             |
| **Access / refresh token** | A short-lived token for requests; a long-lived one for renewing it                         |
| **CORS**                   | The browser rule that blocks cross-origin requests unless the server allows it             |
| **Preflight**              | The `OPTIONS` request a browser sends before a cross-origin request                        |
| **`select_related`**       | Joins a ForeignKey into the same query. Prevents the N+1 problem                           |
| **`annotate`**             | Adds a computed column, usually an aggregate, to a queryset                                |
| **DRF**                    | Django REST Framework. The layer that provides serializers, viewsets, permissions and auth |
| **OpenAPI / Swagger**      | A machine-readable description of an API. drf-spectacular generates it                     |

**Rouli business concepts.**

| Term               | Meaning                                                                                                                                        |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **Vehicle**        | A rentable _model_ (a "Cowboy 4 ST"), stationed at one agency                                                                                  |
| **Unit**           | One physical bike or scooter of that model at that agency                                                                                      |
| **Agency**         | A pickup and return point. Five of them                                                                                                        |
| **Availability**   | How many units of a model are free on a given day                                                                                              |
| **Window**         | The `[start, end)` date range of a rental. The end date is exclusive                                                                           |
| **Reservation**    | A booking. It carries the coupon code, the price and the status                                                                                |
| **Coupon**         | The digital voucher the customer shows at the counter. It is a reservation viewed differently                                                  |
| **Status**         | `pending` → `active` → `completed`, or `cancelled` / `expired`                                                                                 |
| **Pickup agency**  | Where the customer collects and returns the vehicle. Always the vehicle's own agency                                                           |
| **Loyalty points** | The counter on the customer profile. Earned at booking: 10 per day + 1 per 5 DT; reversed on cancellation/expiry. 1500 points earns a free day |
| **Facet**          | A count shown next to a filter option, e.g. "Marina — 2"                                                                                       |

---

### Appendix B — Frontend field to API field mapping

**`CatalogBike` (`src/types.ts:5-38`) → the `Vehicle` API resource.**

| Frontend              | API                   | Notes                                                                                                         |
| --------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------- |
| `id`                  | `id`                  | The UUID, as an opaque string                                                                                 |
| `name`                | `name`                |                                                                                                               |
| `vehicleType`         | `vehicleType`         | `bike` \| `scooter`                                                                                           |
| `category`            | `category`            | The category's UUID. Now a FK                                                                                 |
| `categoryLabel`       | `categoryLabel`       | **Derived** from the category. Value changes for 2 categories (**D5**)                                        |
| `agencyId`            | `agencyId`            | The agency's UUID                                                                                             |
| `agencyName`          | `agencyName`          | Derived from the agency                                                                                       |
| `agencyPostalCode`    | `agencyPostalCode`    | Derived from the agency                                                                                       |
| `pricePerDayDT`       | `pricePerDayDT`       |                                                                                                               |
| `pricePerHourDT`      | `pricePerHourDT`      |                                                                                                               |
| `rangeKm`             | `rangeKm`             |                                                                                                               |
| `batteryCapacity`     | `batteryCapacity`     |                                                                                                               |
| `maxSpeedKmH`         | `maxSpeedKmH`         |                                                                                                               |
| `weightKg`            | `weightKg`            |                                                                                                               |
| `stockAvailable`      | `stockAvailable`      | **Now date-aware.** The minimum availability over the requested window. Today's value when no window is given |
| —                     | `totalUnits`          | **New.** The fleet size of the model at the agency                                                            |
| `tag`                 | `tag`                 |                                                                                                               |
| `image`               | `image`               |                                                                                                               |
| `fallbackImage`       | —                     | **Not served.** The frontend keeps `ASSETS.placeholder`                                                       |
| `rating`              | `rating`              |                                                                                                               |
| `reviewsCount`        | `reviewsCount`        |                                                                                                               |
| `description`         | `description`         |                                                                                                               |
| `features`            | `features`            |                                                                                                               |
| `motorType`           | `motorType`           | Detail only                                                                                                   |
| `motorTorqueNm`       | `motorTorqueNm`       | Detail only                                                                                                   |
| `transmission`        | `transmission`        | Detail only                                                                                                   |
| `brakes`              | `brakes`              | Detail only                                                                                                   |
| `chargingTimeHours`   | `chargingTimeHours`   | Detail only                                                                                                   |
| `frameMaterial`       | `frameMaterial`       | Detail only                                                                                                   |
| `wheelSize`           | `wheelSize`           | Detail only                                                                                                   |
| `connectivity`        | `connectivity`        | Detail only                                                                                                   |
| `includedAccessories` | `includedAccessories` | Detail only                                                                                                   |

**`AgencyItem` (`src/data/mockData.ts:22-35`) → the `Agency` API resource.**

| Frontend          | API                              | Notes                                                           |
| ----------------- | -------------------------------- | --------------------------------------------------------------- |
| `id`              | `id`                             | The slug. The `all` pseudo-agency does not exist (**D10**)      |
| `name`            | `name`                           |                                                                 |
| `shortName`       | `shortName`                      |                                                                 |
| `postalCode`      | `postalCode`                     |                                                                 |
| `address`         | `address`                        |                                                                 |
| `description`     | `description`                    |                                                                 |
| `phone`           | `phone`                          |                                                                 |
| `hours`           | `hours`                          | The display string                                              |
| —                 | `opensAt`, `closesAt`            | **New.** The structured window the occupancy chart buckets over |
| `image`           | `image`                          |                                                                 |
| `coordinates.lat` | `latitude`                       | **Renamed.** Flattened from the nested object                   |
| `coordinates.lng` | `longitude`                      | **Renamed**                                                     |
| `landmarks`       | `landmarks`                      |                                                                 |
| `localities`      | `localities`                     |                                                                 |
| —                 | `vehicleCount`, `availableCount` | **New.** Two distinct counts (**D9**)                           |

**`UserProfile` (`src/data/mockData.ts:635-646`) → the `User` API resource.**

| Frontend            | API                     | Notes                                                                                                     |
| ------------------- | ----------------------- | --------------------------------------------------------------------------------------------------------- |
| `id`                | `id`                    | A UUID in the API, not `"usr-salhirayen-69"`                                                              |
| `fullName`          | `fullName`              | **Writable.** Split into `firstName` / `lastName` on write                                                |
| —                   | `firstName`, `lastName` | **New.** The signup form collects them separately                                                         |
| `email`             | `email`                 | The login identifier. Editable, but the login email does not change (**D-14**)                            |
| `phone`             | `phone`                 |                                                                                                           |
| `city`              | `city`                  |                                                                                                           |
| `address`           | `address`               |                                                                                                           |
| `memberSince`       | `memberSince`           |                                                                                                           |
| `preferredAgencyId` | `preferredAgencyId`     | Nullable. Not settable at registration                                                                    |
| `loyaltyPoints`     | `loyaltyPoints`         |                                                                                                           |
| `avatarSeed`        | —                       | **Not served.** The frontend generates the avatar from the name with `@blobatar/react` (`Navbar.tsx:179`) |
| —                   | `loyaltyTier`           | **New.** Derived from the points                                                                          |
| —                   | `isStaff`, `isVerified` | **New**                                                                                                   |

**`UserCoupon` / `UserReservation` (`src/data/mockData.ts:648-671`) → the
`Reservation` API resource.**

| Frontend    | API                           | Notes                                                                                                                                               |
| ----------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`        | `id`                          | A UUID                                                                                                                                              |
| `code`      | `code`                        | New format: `RL-MNS-` + 6 characters (**D-9**)                                                                                                      |
| `vehicleId` | `vehicleId`                   |                                                                                                                                                     |
| —           | `vehicleName`, `vehicleImage` | **New.** Saves the frontend a second request per row                                                                                                |
| `agencyId`  | `agencyId`                    |                                                                                                                                                     |
| —           | `agencyName`                  | **New**                                                                                                                                             |
| `startDate` | `startDate`                   |                                                                                                                                                     |
| `endDate`   | `endDate`                     |                                                                                                                                                     |
| `days`      | `days`                        |                                                                                                                                                     |
| `totalDT`   | `totalDT`                     |                                                                                                                                                     |
| `status`    | `status`                      | **Translated.** `pending`/`active`/`completed`/`cancelled`/`expired` → the frontend's `active`/`used`/`expired` or `active`/`completed`/`cancelled` |
| `rating`    | `rating`                      | Nullable                                                                                                                                            |
| `createdAt` | `createdAt`                   |                                                                                                                                                     |

**`UserStats` (`src/data/mockData.ts:812-817`) → `GET /me/stats`.**

| Frontend     | API          |
| ------------ | ------------ |
| `rides`      | `rides`      |
| `totalDays`  | `totalDays`  |
| `totalDT`    | `totalDT`    |
| `co2SavedKg` | `co2SavedKg` |

**`GET /vehicles/facets` — the per-agency counts the catalogue sidebar renders.**

| Frontend                          | API                                     | Notes                                         |
| --------------------------------- | --------------------------------------- | --------------------------------------------- |
| `getVehicleCount(agencyId, type)` | `vehicleCount`                          | The same number. Now server-side              |
| —                                 | `availableCount`                        | **New.** The sum of units                     |
| —                                 | `id`, `name`, `shortName`, `postalCode` | The four fields the catalogue sidebar renders |

---

### Appendix C — The French strings the API owns

These are the exact strings the backend must reproduce. They are the seed data, and
they are the copy the customer reads.

**The 7 FAQ entries** (`FaqSection.tsx:8-37`):

1. _Dois-je payer en ligne pour réserver mon véhicule ?_ → Non. Vous réservez
   gratuitement en ligne et vous réglez à l'agence au retrait du véhicule.
2. _Puis-je annuler ou modifier ma réservation ?_ → Oui, gratuitement, tant que le
   véhicule ne vous a pas été remis.
3. _Que se passe-t-il si je ne viens pas récupérer mon véhicule ?_ → Si vous ne venez
   pas, votre coupon expire à la fermeture de l'agence le jour du début de la
   location, et le véhicule est remis à disposition.
4. _Combien de temps puis-je louer un véhicule ?_ → De 1 à 7 jours, à la journée.
5. _Une assurance est-elle incluse lors de ma location ?_ → Oui, une assurance
   complète tous risques et responsabilité civile est incluse d'office sans surcoût
   caché. _(note: `d'office` uses a typographic apostrophe `’`)_
6. _Où dois-je rendre mon véhicule ?_ → Dans l'agence où vous l'avez retiré. Le
   véhicule est affecté à cette agence et doit y être rapporté.
7. _Y a-t-il un âge minimum, ou un équipement obligatoire (casque) ?_ → Le service est
   accessible dès 16 ans. Le port du casque est vivement recommandé pour votre
   sécurité, et des casques sont mis à disposition en agence sur demande.

**The 5 contact subjects** (`ContactPage.tsx:42-48`): `Question sur une réservation` ·
`Assistance pendant une location` · `Devenir agence partenaire` · `Presse & médias` ·
`Autre demande`.

**The 6 category labels**: `Urbain & Ville` · `VTC & Balade` · `VTT & Sport` ·
`Cargo & Famille` · `Pliant Compact` · `Trottinette Urbaine`.

**The 5 agency names**: `Agence Marina (Port de Plaisance)` · `Agence Zone Skanes
(Corniche)` · `Agence Ribat & Médina` · `Agence Zone Hôtelière (Dkhila)` · `Agence
Monastir Gare`.

**The 3 testimonials** (`SocialProof.tsx:11-36`): `Mehdi K.` (Monastir (Faculté de
Médecine), Étudiant en 5e année, 54 trajets) · `Yasmine B.` (Zone Skanes,
Pharmacienne, 41 trajets) · `Karim T.` (Ribat & Port de Plaisance, Commerçant à la
Marina, 68 trajets).

**The company constants**: `support@rouli.tn` · `+216 73 500 000` · `Av. Habib
Bourguiba, Monastir 5000` · `Tous les jours, 8h – 20h`.

**The 4 site statistics**: `active_users` = 8500 · `reviews` = 3200 ·
`platform_rating` = 4.9 · `fleet_size` = computed.

**The error messages the API returns** (French, customer-facing):

| Situation                      | Message                                                                |
| ------------------------------ | ---------------------------------------------------------------------- |
| Login failed                   | `Identifiants invalides.`                                              |
| Missing or expired token       | `Authentification requise.`                                            |
| Not a staff member             | `Réservé au personnel d'agence.`                                       |
| Unknown resource               | `Ressource introuvable.`                                               |
| Not the owner                  | `Réservation introuvable.`                                             |
| Duration too long              | `La durée maximale est de 7 jours.`                                    |
| Date in the past               | `La date de début ne peut pas être dans le passé.`                     |
| End before start               | `La date de fin doit être postérieure à la date de début.`             |
| Already cancelled              | `Cette réservation est déjà annulée.`                                  |
| Not yet completed, cannot rate | `Seule une réservation terminée peut être notée.`                      |
| Not available                  | `Ce véhicule n'est plus disponible sur une ou plusieurs de ces dates.` |
| Mismatched agency              | `Ce véhicule n'est pas disponible dans cette agence.`                  |
| Email already used             | `Un compte existe déjà avec cette adresse email.`                      |
| Password too short             | `Le mot de passe doit contenir au moins 8 caractères.`                 |
| Terms not accepted             | `Vous devez accepter les Conditions Générales de Vente.`               |
| Generic validation             | `La requête contient des champs invalides.`                            |

**The French copy that changes** because of this PRD:

| Where                                | Current                                                                                           | New                                            |
| ------------------------------------ | ------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `LoginPage.tsx:19-21`                | `Démo : la connexion sera disponible prochainement. La réservation reste accessible sans compte.` | Removed. The form now works                    |
| `SignupPage.tsx:22-23`               | `Démo : la création de compte sera disponible prochainement. Vous pouvez réserver sans compte.`   | Removed. The form now works                    |
| `BikeDetailPage.tsx` (booking CTA)   | Implicitly allows guest booking                                                                   | `Connectez-vous pour réserver` when logged out |
| `BikesCatalogPage.tsx` (card chip)   | `VTC Confort & Balade`                                                                            | `VTC & Balade`                                 |
| `BikesCatalogPage.tsx` (empty state) | `Essayez d'élargir votre recherche…`                                                              | Unchanged                                      |

---

### Appendix D — Running the whole thing locally

**Backend.**

```bash
cd rouli-backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env            # then edit .env
python manage.py migrate
python manage.py seed_demo --flush
python manage.py createsuperuser
python manage.py runserver 8000
```

**Frontend.**

```bash
cd ..                            # the existing React app
npm install
npm run dev                      # http://localhost:3000
```

**Verify.**

```bash
curl http://localhost:8000/api/v1/health
curl "http://localhost:8000/api/v1/vehicles?type=scooter"
curl "http://localhost:8000/api/v1/agencies/marina/load?granularity=hour"
```

**Tests.**

```bash
cd rouli-backend
python manage.py test
```

**A note on the frontend and backend living side by side.** The React app is in
`/home/rayen-salhi/Desktop/rouli-project` and the Django project will be a
sibling — `/home/rayen-salhi/Desktop/rouli-backend` — or a `backend/` subfolder of
the same repo. A subfolder is simpler for a single git repository; a sibling is
cleaner if you want to deploy them separately. Either works, because the frontend
talks to the API over HTTP and nothing is shared but the JSON contract.

**What the frontend needs to know about the API's location.** One environment
variable, read by Vite:

```
# .env.local in the React project
VITE_API_URL=http://localhost:8000/api/v1
```

Vite only exposes variables prefixed with `VITE_` to the client, and only from
`.env.local` (which is git-ignored). Never put a secret in a `VITE_` variable —
anything the browser can read is public.

---

## Document summary

|                         |                                                                                                                                       |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Product**             | Rouli — electric bike and scooter rental in Monastir, Tunisia                                                                         |
| **Frontend**            | Vite + React 19 + TypeScript, 11 routes, complete and static (no server calls)                                                        |
| **Backend**             | Django 5.2 LTS + DRF 3.18 + SimpleJWT, SQLite                                                                                         |
| **Models**              | 10: `User`, `Agency`, `Category`, `Vehicle`, `VehicleAvailability`, `Reservation`, `ContactMessage`, `Faq`, `Testimonial`, `SiteStat` |
| **Endpoints**           | 32                                                                                                                                    |
| **Acceptance criteria** | 83, across 10 features                                                                                                                |
| **Delivery**            | 7 phases, 27–35 hours                                                                                                                 |
| **Out of scope**        | Payments, mobile apps, i18n, real-time tracking, email, CMS, multi-tenant                                                             |

**Read the document in this order if you are starting from zero:** Part 0 → Part 1 →
Part 3 (the Django primer) → Part 4 (the schema) → Part 5 (the API) → Part 7 (the
plan). Part 2 is the reference you will come back to while implementing, and Parts 6,
8 and 9 are for when something goes wrong.

---

_End of document._
