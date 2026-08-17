# 🍱 LunchBox Panipat — Office Lunch Ordering System

A modern, responsive **office lunch ordering web application** built for **Sparsh CCTV, Panipat**.

Employees can log in, customize their daily thali, use available surplus food, submit their lunch order, and request order edits. Admin/Owner users can manage employees, menus, approvals, access requests, and send the final approved lunch summary to the food owner through WhatsApp.

---

## ✨ Project Highlights

- 👨‍💼 Employee lunch ordering portal
- 🛡️ Admin / HR dashboard
- 👑 Owner access
- 🍛 Daily thali menu
- ➕ Quantity selection with normal food limits
- 🔄 Same vegetable in both bowls
- ♻️ Shared surplus-food system
- 📝 Employee order-edit requests
- ✅ Admin approval / rejection workflow
- 📱 Responsive mobile-friendly UI
- 🌙 Light / dark mode
- ✨ Framer Motion animations
- 📊 Today's lunch summary
- 📲 WhatsApp order sending
- 🔒 Anonymous P1, P2, P3... formatting in WhatsApp
- 🗃️ Supabase shared database and synchronization
- 🚀 Vercel deployment
- 🌐 QR-code based access for office phones
- 🔖 Custom emerald + golden lunch/thali favicon

---

## 🧭 Project Flow

**Employee / Admin opens website**

↓

**Login**

↓

**Employee**
→ View today's menu  
→ Select food quantities  
→ Use surplus food if available  
→ Submit lunch order  
→ Edit submitted order if required  

**OR**

**Admin / Owner**
→ Open Admin Dashboard  
→ View today's orders  
→ Manage employees  
→ Manage access requests  
→ Manage menu  
→ Approve orders  
→ Book own lunch  
→ Send approved order to food owner on WhatsApp

↓

**Supabase**

Stores and synchronizes shared application data.

↓

**Vercel**

Hosts the production application.

---

# 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| ⚛️ React | Frontend UI |
| ⚡ Vite | Development server and build tool |
| 🎨 Tailwind CSS | Styling and responsive design |
| 🎞️ Framer Motion | Animations and transitions |
| 🧩 Lucide React | Icons |
| 🗃️ Supabase | Shared database and synchronization |
| ☁️ Vercel | Production hosting |
| 📱 WhatsApp | Food-owner order communication |
| 🔗 QR Code | Quick mobile access |
| 🐙 GitHub | Source-code repository |

---

# 📁 Main Project Structure

The important project structure is:

    src/
    ├── components/
    │   ├── admin/
    │   ├── Cart.jsx
    │   ├── ItemCard.jsx
    │   ├── SurplusPanel.jsx
    │   ├── ThemeToggle.jsx
    │   ├── ThaliRing.jsx
    │   └── Toast.jsx
    │
    ├── context/
    │   └── AppContext.jsx
    │
    ├── pages/
    │   ├── AdminDashboard.jsx
    │   ├── EmployeePortal.jsx
    │   └── Login.jsx
    │
    ├── App.jsx
    └── main.jsx

Additional project files include:

    package.json
    vite.config.js
    tailwind.config.js
    index.html
    .env
    .env.example
    README.md

---

# 👤 Login System

The application uses an approved employee-name based login system.

Employees do not need a password for the current office workflow.

Approved employees can enter their name and access the employee portal.

The Owner/Admin account can access the Admin Dashboard.

### Unknown employee

If someone enters a name that is not currently approved:

1. Login is rejected.
2. The employee is informed that access is not approved.
3. An access request can be sent to Admin.
4. Admin can review the request.
5. Admin can decide whether to add the employee temporarily or permanently.

---

# 🍛 Employee Lunch Ordering Flow

After login, the employee sees today's available thali.

The employee can select quantities for:

- 🥣 Veg Bowl 1
- 🌶️ Veg Bowl 2
- 🫓 Roti
- 🍚 Rice
- 🍮 Extra item such as Kheer/Dessert
- 🥗 Salad

The interface also displays an animated thali/ring summary.

Typical normal limits include:

- Veg Bowl 1 → 1
- Veg Bowl 2 → 1
- Roti → 4
- Rice → 1
- Extra → 1
- Salad → 1

The exact Roti quantity can be controlled through the menu configuration.

---

# 🔄 Same Vegetable in Both Bowls

Employees can enable:

**Same vegetable in both bowls**

They can then choose whether to double:

- Dry Sabzi
- Gravy Sabzi

This is treated as a special lunch requirement because the normal two-bowl combination has been changed.

---

# ♻️ Surplus Food System

The surplus system allows unused food portions to be offered to other employees.

### Example

Suppose the normal allowance is:

    Mix Veg = 1

An employee chooses:

    Mix Veg = 0

The unused portion becomes:

    1 surplus Mix Veg available

Another employee can then claim it.

For example:

    Normal Mix Veg = 1
    Employee claims surplus = +1

The employee can now receive:

    Mix Veg = 2

The surplus portion is consumed when claimed.

If the employee later removes that additional surplus portion, the surplus becomes available again.

---

# 🌐 Why Supabase Is Needed

The application originally used browser LocalStorage for storing data.

LocalStorage is useful for simple local testing, but it has an important limitation:

**LocalStorage is local to each browser/device.**

For example:

    Employee Phone A
        ↓
    LocalStorage A

    Employee Phone B
        ↓
    LocalStorage B

These two devices do not automatically share the same data.

That creates problems for a real office environment.

---

# ❌ Problems Without Supabase

Without a shared database:

### 1. Surplus cannot reliably be shared between phones

If Employee A creates surplus on their phone, Employee B on another phone cannot automatically see it.

### 2. Orders are not globally shared

An order submitted on one device cannot reliably appear on another device.

### 3. Admin cannot reliably see every employee's order

The Admin Dashboard needs one shared source of truth.

### 4. Access requests cannot reliably reach Admin

If an unknown employee sends an access request from their phone, the Admin's phone/computer needs to receive that request.

### 5. Approval status is not shared

When Admin approves an order, other devices need to see the updated state.

### 6. Menu changes are not shared

If Admin changes the menu, employees need to receive the same updated menu.

---

# ✅ What Supabase Solves

Supabase provides a shared backend/database layer.

The application can use Supabase to synchronize:

- 👥 Employees
- 🍛 Menu
- 🧾 Orders
- ♻️ Surplus claims
- 🔔 Access requests
- 📝 Edit requests
- 👑 Admin/Owner related application state

The important difference is:

    Employee Phone
          ↓
       Supabase
          ↑
    Admin Computer
          ↑
    Other Employee Phones

Everyone can work with the same shared data.

---

# 📝 Edit Order Flow

After submitting an order, an employee can request an edit.

### Normal employee

    Employee
       ↓
    Edit Order
       ↓
    Edit Request
       ↓
    Admin Dashboard
       ↓
    Approve / Reject

If Admin approves the request, the employee's order is updated.

### Admin / Owner

Admin/Owner changes can be applied directly because the Admin/Owner is the approving authority.

---

# 📊 Admin Dashboard

The Admin Dashboard contains the main management areas.

## Today's Summary

Admin can:

- View today's submitted orders
- See approval status
- Approve orders
- Approve all orders
- Review lunch activity
- Send approved orders to the food owner

## 👥 Employees & Admins

Admin can manage approved employees and administrators.

## 🔔 Access Requests

Unknown employee login requests can appear here for Admin review.

## 🍽️ Menu Settings

Admin can manage the lunch menu for the available weekdays.

Menu settings can include:

- Dry sabzi
- Gravy sabzi
- Roti
- Rice
- Extra item
- Salad

---

# 📲 WhatsApp Food Order

After lunch orders are approved, Admin can click:

**Send for Order**

The application generates a short WhatsApp message for the food owner.

The food sender number is configured inside:

    src/pages/AdminDashboard.jsx

The application converts a normal 10-digit Indian number into the WhatsApp country-code format automatically.

For example:

    9876543210

becomes:

    919876543210

The WhatsApp message is opened through a WhatsApp deeplink.

---

# 🔐 Anonymous WhatsApp Format

Employee names are intentionally **not exposed** in the food-order WhatsApp message.

Instead, anonymous placeholders are used:

    P1
    P2
    P3
    P4

This keeps the message short and avoids exposing employee names.

---

# 📱 WhatsApp Message Example

A typical generated message looks like:

    🍱 OFFICE LUNCH ORDER Sparsh Panipat
    Date: 14 Aug 2026
    Total approved orders: 3

    Regular: 1
    Special: 2

    P1 : Regular + 1 Kheer extra
    P2 : Only Rice
    P3 : Only Rice, Roti × 2, Salad

    Please prepare the above approved lunch orders.

The exact contents depend on the approved orders for that day.

---

# 🍮 Regular + Surplus

An important distinction is made between:

### Regular order

The employee has the normal lunch quantity.

### Regular + surplus

The employee has the normal lunch plus one or more surplus portions.

For example:

    Normal lunch + 1 Kheer

This can be represented compactly as:

    P1 : Regular + 1 Kheer extra

This prevents a normal lunch that simply consumes surplus food from being incorrectly described as a completely modified/special lunch.

---

# 🍚 Only Item Orders

When an employee removes all normal food except one item, the WhatsApp message uses a compact format.

For example:

    P1 : Only Rice

Instead of displaying every excluded item such as:

    -1 Sabzi
    -4 Roti
    -1 Salad
    -1 Kheer

This keeps the food-owner WhatsApp message short and easy to understand.

---

# 🫓 Roti Naming

The application intentionally displays:

**Roti**

instead of the internal category name:

**Bread**

For example:

    Roti × 2

---

# 📱 Mobile Support

The application is designed to work on:

- 💻 Desktop
- 💻 Laptop
- 📱 Android phones
- 📱 Mobile browsers
- 📱 Office devices connected to the same network during local testing

The UI is responsive and adapts to smaller screens.

---

# 🔗 QR Code

The login page can provide a QR code for quick access.

Employees can scan the QR code using their phone.

For local development, the application can be accessed through the computer's LAN IP when both devices are connected to the same Wi-Fi network.

For permanent office use, the deployed Vercel URL can be used.

---

# 🚀 Running the Project Locally

Install dependencies:

    npm install

Start the development server:

    npm run dev

For phone testing on the same Wi-Fi network:

    npm run dev -- --host

Vite will provide a local network URL that can be opened from another device connected to the same network.

---

# 🏗️ Production Build

To create a production build:

    npm run build

To preview the production build locally:

    npm run preview

Always check that the build completes successfully before deploying a new version.

---

# 🔐 Environment Variables

The project uses environment variables for configuration.

Typical Vite variables include:

    VITE_APP_URL
    VITE_SUPABASE_URL
    VITE_SUPABASE_PUBLISHABLE_KEY

The actual configuration values should remain inside the local `.env` file and should not be committed if the project is configured to ignore `.env`.

A `.env.example` file can be used to show required variable names without exposing real credentials.

---

# ☁️ Vercel Deployment

The project is deployed using Vercel.

Typical deployment flow:

    VS Code
       ↓
    Git
       ↓
    GitHub
       ↓
    Vercel
       ↓
    Live Website

After pushing changes to the connected GitHub repository, Vercel can automatically create a new deployment.

Environment variables must also be configured inside the Vercel project.

---

# 🐙 GitHub Workflow

After making changes locally:

    git status

Then:

    git add .

Create a commit:

    git commit -m "Update lunch ordering application"

Push:

    git push origin main

If the repository uses another branch, replace `main` with that branch name.

---

# 🔄 Typical Update Flow

For future changes:

    1. Edit the project in VS Code
    2. Test locally
    3. Run npm run build
    4. Check git status
    5. git add .
    6. git commit -m "Describe the update"
    7. git push origin main
    8. Vercel deploys the updated version

---

# 🧪 Testing Checklist

## Employee

- [ ] Employee can log in
- [ ] Today's menu appears
- [ ] Quantity buttons work
- [ ] Normal limits work
- [ ] Same-sabzi option works
- [ ] Surplus appears when another employee creates it
- [ ] Surplus can be claimed
- [ ] Claimed surplus disappears
- [ ] Releasing surplus makes it available again
- [ ] Order can be submitted
- [ ] Submitted order is visible to Admin

## Edit Order

- [ ] Employee can request an edit
- [ ] Admin sees the edit request
- [ ] Admin can approve
- [ ] Admin can reject
- [ ] Approved edit updates the order
- [ ] Admin/Owner direct edit works

## Admin

- [ ] Admin login works
- [ ] Today's Summary loads
- [ ] Employees/Admins section works
- [ ] Access Requests works
- [ ] Menu Settings works
- [ ] Orders can be approved
- [ ] Approve All works
- [ ] Book My Lunch works
- [ ] Back button returns to Admin Dashboard
- [ ] Send for Order opens WhatsApp

## WhatsApp

- [ ] Employee names are not exposed
- [ ] P1/P2/P3 placeholders are used
- [ ] Regular count is correct
- [ ] Special count is correct
- [ ] Regular + surplus is represented correctly
- [ ] Only-item orders use compact wording
- [ ] Roti is displayed instead of Bread
- [ ] Food owner number is correct

## Mobile

- [ ] Login works on phone
- [ ] Menu is readable
- [ ] Quantity controls work
- [ ] Surplus works
- [ ] WhatsApp opens correctly

---

# 🔒 Important Security Note

The current login workflow is designed for the office's practical internal use.

It should not be considered a high-security authentication system because the employee login flow does not use passwords or full identity verification.

For a future production-grade system, authentication could be strengthened with:

- Supabase Auth
- OTP
- Email/password
- Employee accounts
- Role-based access control
- Row Level Security policies

---

# 🧠 Why the Architecture Uses Supabase

The application has many actions that need to be shared between different devices.

For example:

    Employee A removes Kheer
             ↓
    1 Kheer surplus created
             ↓
         Supabase
             ↓
    Employee B sees surplus
             ↓
    Employee B claims Kheer
             ↓
         Supabase
             ↓
    Surplus decreases

The same shared-data concept applies to:

    Orders
    Approvals
    Employees
    Menu
    Access Requests
    Edit Requests

This is why Supabase is important for the multi-device office version.

---

# 🎨 Design

The UI follows a modern food-ordering design language using:

- 💚 Emerald green
- 🟡 Golden / amber accents
- 🥣 Thali-inspired visuals
- 🧊 Glassmorphism cards
- ✨ Smooth animations
- 🌙 Dark mode
- 📱 Responsive layouts
- 🔖 Custom lunch/thali favicon

The visual design is intended to feel professional while still being friendly and easy for employees to use.

---

# 📌 Current Project Purpose

This project is designed as an internal office lunch-management system.

It replaces informal manual lunch collection with a centralized digital workflow.

Instead of employees communicating their lunch requirements individually, the application provides:

    Employee
       ↓
    Select lunch
       ↓
    Submit order
       ↓
    Admin reviews
       ↓
    Approve
       ↓
    Generate compact WhatsApp order
       ↓
    Food Owner prepares lunch

---

# 🌟 Final Result

LunchBox Panipat provides one complete workflow for:

**Employee → Lunch Selection → Surplus → Order → Admin Approval → WhatsApp → Food Owner**

The combination of React, Supabase, and Vercel provides a responsive user interface, shared office data, and a publicly accessible deployed application.

---

## 👨‍💻 Project

**LunchBox Panipat**

**Organization:** Sparsh CCTV, Panipat

**Purpose:** Internal Office Lunch Ordering & Management

**Frontend:** React + Vite

**Database:** Supabase

**Hosting:** Vercel

**Source Control:** GitHub

---

## ❤️ Built for Simpler Office Lunch Management

🍱 **Select → Share → Approve → Send → Serve**
