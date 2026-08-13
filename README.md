# Order Panipat — Sparsh CCTV Food Selection App (Frontend Only)

A frontend-only React prototype: employees scan a QR code, log in with just
a 4-5 digit Employee ID (no password), customize their daily thali, and
submit an order. Admins get a dashboard to approve orders, export them to
Excel, manage employee IDs, and edit the weekly menu — all persisted to
**LocalStorage only**. There is no backend, no database, no real
authentication.

## Setup

```bash
npm install
npm run dev
```

Open the printed local URL (usually `http://localhost:5173`).

### Getting the QR code to actually open on a phone

A QR code that encodes `localhost` will **never** open on another device —
`localhost` always means "this computer," even to the phone that scanned
it. The login screen shows a warning banner and the exact URL it's
encoding whenever this is the case. Two ways to fix it:

**Option A — same office Wi-Fi (quick, for testing):**
```bash
npm run dev -- --host
```
Vite will print two URLs; copy the `Network:` one (looks like
`http://192.168.1.42:5173`). Create a `.env` file (copy `.env.example`)
and set:
```
VITE_APP_URL=http://192.168.1.42:5173
```
Restart `npm run dev`. Your phone must be on the **same Wi-Fi network**
as the computer for this to work.

**Option B — deploy it (recommended for real office use):**
Push this project to GitHub and deploy to Vercel or Netlify (free tier is
enough for a static frontend app). Set `VITE_APP_URL` to the deployed
`https://...` link, rebuild, and print that QR — it'll work from any
phone, on any network, permanently.

```bash
npm run build     # production build in dist/
npm run preview   # preview the production build locally
```

## Try it

Sample IDs seeded in `src/data/seedData.js`:

- `1137`, `1306` → Employee Portal
- `925` → Admin Dashboard

Any other ID shows an animated "Access denied" toast — there's no real
authentication, it's just a lookup against the local employee list.

## Project structure

```
src/
  components/         Reusable UI: cards, cart, toast, theme toggle, QR panel, thali ring
  components/admin/   Admin-only tab views (summary, employees, menu settings)
  context/            AppContext — all state + LocalStorage persistence
  data/seedData.js    Default weekly menu + default employee list
  pages/              Login, EmployeePortal, AdminDashboard
  utils/              ID validation, Excel export (SheetJS)
```

## Notes

- All data (employee list, weekly menu, submitted orders, theme) lives in
  `localStorage` under `op_employees`, `op_menu`, `op_orders`, `op_theme`.
  Clear those keys (or use your browser's site-data reset) to go back to
  the seed data.
- The 4-5 digit ID format rule is centralized in `src/utils/validation.js`.
- Excel export uses SheetJS (`xlsx`) client-side and downloads
  `Order_Panipat_[date].xlsx`.
