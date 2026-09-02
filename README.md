# Hoofdpijndagboek

Offline-werkende PWA om hoofdpijn per dag bij te houden voor de fysio. Data blijft lokaal op je telefoon.

## Functies

- **Kalender**: tik op een dag om snel in te voeren
- **Invoer**: opgestaan met hoofdpijn, score 0–10, overgegaan?, activiteiten, triggers, locatie, medicatie, slaap, nekklachten, notitie
- **Log**: chronologisch overzicht met periodefilter
- **Export**: print/PDF voor de fysio, CSV, JSON-backup + import

## Lokaal starten

```bash
npm install
npm run dev
```

Open de URL in de browser (bij voorkeur Chrome/Edge). Voor iPhone-installatie is **HTTPS** nodig.

## Build

```bash
npm run build
npm run preview
```

## Op iPhone zetten (beginscherm)

1. Deploy de `dist/`-map naar een HTTPS-host (bijv. [Netlify Drop](https://app.netlify.com/drop), Cloudflare Pages, of GitHub Pages).
2. Open de site in **Safari** op je iPhone.
3. Tik op **Delen** → **Zet op beginscherm**.
4. Open de app vanaf het beginscherm (werkt daarna ook offline).

## Belangrijk: backup

Data staat alleen in Safari/`localStorage`. Maak regelmatig een **JSON-backup** via het Export-tabblad (vooral vóór iOS-updates of als je Safari-gegevens wist). Importeer die backup weer als je van telefoon wisselt.

## Tech

Vite + React + TypeScript + `vite-plugin-pwa`
