# Rouli — logo guidelines

## 1. The idea
**Grounded** — a wheel reduced to the moment it meets the road. The flat contact patch says *local*; the hub repeats in the `o` of the wordmark, so mark and name read as one system. The electric green is the charge; the Bricolage wordmark is warm, engineered and a little informal.

Use the logo as an identifier, not a diagram of the service. The app, photography and copy carry the rest.

## 2. Versions
| Version | Use | Files |
|---|---|---|
| Compact lockup | App header, auth, footer — symbol + wordmark | `public/apple-touch-icon.png` + `public/rouli-wordmark-brand.svg` / `-white.svg` |
| Horizontal | Website, print, signage, wide spaces | `brand/rouli-horizontal.svg` |
| Stacked | Square social, badges, totes, narrow layouts | `brand/rouli-stacked.svg` |
| Symbol | App icon, avatar, favicon | `brand/rouli-symbol.svg` |
| Wordmark | Tight text-only use | `brand/rouli-wordmark.svg` |

The compact lockup is **icon 28 px / wordmark 15 px at a 28 px icon**, with an 8 px gap. At 32 px and 40 px icons use 18 px and 22 px wordmarks; keep the 8 px gap. The icon tile radius is 22.5 %.

The full horizontal lockup is `brand/rouli-horizontal.svg` (677 × 256); the stacked is 340 × 340. Do not rebuild either lockup by eye — scale the master.

## 3. Clear space
Keep **1 × the gap between the wheel and the wordmark** clear on all sides. In the compact lockup that is 8 px; in the horizontal it is 30.5 units at master scale. The zone scales with the logo; never use a fixed distance.

## 4. Minimum size
| Version | Screen | Print |
|---|---|---|
| Compact lockup | 28 px icon (≈79 px wide) | 24 mm wide |
| Horizontal | 100 px wide | 25 mm wide |
| Stacked | 96 px wide | 25 mm wide |
| Wordmark | 70 px wide | 18 mm wide |
| Symbol (main) | 24 px | 6 mm |
| Symbol (small cut) | 16 px | — |

Below 24 px use the small cut (`rouli-symbol-small.svg` / the favicon set). It has a slightly thicker ring and a larger white gap; the flat patch is simplified.

## 5. Colour
| Name | HEX | RGB | CMYK (approx.) | Pantone (approx.) |
|---|---|---|---|---|
| Electric Green | `#00FF40` | 0 255 64 | 100 0 75 0 | 802 C (neon) |
| Brand Ink | `#00701C` | 0 112 28 | 100 0 75 56 | 356 C |
| Deep Green | `#04240C` | 4 36 12 | 89 0 67 86 | Black 6 C |
| Ink | `#1D1D1F` | 29 29 31 | 0 0 0 88 | Black 7 C |
| Surface | `#F5F5F7` | 245 245 247 | 0 0 1 3 | paper |
| White | `#FFFFFF` | 255 255 255 | 0 0 0 0 | paper |

**Approved logo / background pairs**
- Brand Ink on white, Surface or `neutral-50`.
- White on Deep Green, Brand Ink or Ink.
- Electric Green on Deep Green only (app icon, dark hero, social). **Never Electric Green on white** — it is a fill/accent, not a legible logo colour on light.
- Black (`#000000`) for one-colour print.

The neon green is outside the CMYK gamut. For print, use Pantone 802 C or proof a CMYK match; do not send the screen RGB file to a printer.

## 6. Typography
- **Logo wordmark**: Bricolage Grotesque 700, outlined; custom spacing; the `o` carries the hub. Never type the wordmark.
- **Display / headings**: Bricolage Grotesque 600–700.
- **Body / UI**: Hanken Grotesk 400–600.
- **Web fallback**: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`.
- Both families are SIL Open Font License (Google Fonts). The wordmark is outlined in the SVG, so the logo does not depend on the font file; keep the licences for the app's live type.

## 7. Do not
- Stretch, squash, rotate, skew or outline the logo.
- Recolour outside the palette; never put the electric green logo on white.
- Add shadows, glows, gradients, strokes or 3D effects.
- Crop the flat contact patch or the hub.
- Rearrange the compact lockup or change the 8 px gap.
- Use the main symbol below 24 px, or the horizontal below 100 px.
- Recreate the wordmark by typing “Rouli” in a font.
- Place the logo on a busy photo without a calm area or a Deep Green container.

## 8. Files and handover
- Masters: `brand/rouli-symbol.svg`, `-symbol-small.svg`, `-horizontal.svg`, `-stacked.svg`, `-wordmark.svg`.
- Colour and one-colour SVGs + PNGs: `brand/exports/{symbol,horizontal,stacked,wordmark}/`.
- Web/PWA set: `brand/exports/symbol/` — `favicon.ico`, `favicon.svg`, `favicon-16/32/48.png`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, `maskable-512.png`, `site.webmanifest`, `head-snippet.html`. The app's `public/` already carries the set.
- App integration: `src/components/Navbar.tsx`, `AuthShell.tsx` and `Footer.tsx` use the compact lockup; `index.html` and `public/site.webmanifest` carry the favicon/PWA set.
- Presentation: `brand/presentation/rouli-brand.html`; concept sheet: `brand/concepts/concepts.png`.

**Open items**
- Run a professional trademark search for “Rouli” in Tunisia and the classes you trade in; this kit does not guarantee clearance.
- Proof Pantone 802 C / the CMYK build before a print run.
- The white version uses the same geometry as the black; white on dark reads slightly heavier. For large print, thin the ring by ~2 % if the printer flags fill-in.
- The flat patch is a large-size detail; the 16 px favicon uses the small cut. Do not add a new “3D” or scooter illustration to the logo.

Questions: support@rouli.tn · Rouli, Monastir.
