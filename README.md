# 🍱 Sparsh Panipat — Office Lunch Management System


A modern, responsive **Office Lunch Management Web App** designed to simplify daily lunch selection, employee ordering, surplus food management, admin approval, and food-order communication through WhatsApp.


The application provides two main experiences:


- 👨‍💼 **Employee Lunch Portal**
- 🛡️ **Admin / Owner Dashboard**


The project is built with **React + Vite**, uses **Supabase** for shared cloud data synchronization, and is deployed using **Vercel**.


---


## ✨ Project Overview


Managing daily office lunch manually can become difficult when multiple employees need to select their meals, modify quantities, request extra food, or change their orders.


This application provides a centralized system where employees can:


- Login using their employee ID
- View today's menu
- Select their lunch quantities
- Choose the same sabzi for both bowls
- Claim available surplus food
- Submit their lunch order
- Request an edit after submitting an order


Administrators can:


- Manage employees and admins
- Manage daily menus
- Approve employee access requests
- View today's lunch orders
- Manage order approvals
- Book their own lunch
- Approve/edit orders
- Send a short anonymous lunch summary to the food owner through WhatsApp


---


# 🚀 Main Features


## 👨‍🍳 Employee Portal


Employees can access a simple and mobile-friendly lunch ordering interface.


### 🍛 Daily Menu


Employees can see the current day's:


- Veg Bowl 1
- Veg Bowl 2
- Roti
- Rice
- Extra item such as Kheer/Dessert
- Salad


The menu changes according to the configured day.


---


### 🔢 Quantity Selection


The system provides predefined daily limits for normal lunch orders.


Example:


```text
Veg Bowl 1 : 1
Veg Bowl 2 : 1
Roti       : 4
Rice       : 1
Extra      : 1
Salad      : 1

Employees cannot increase normal quantities beyond the standard limit using the normal quantity controls.

🔄 Same Sabzi in Both Bowls

Employees can enable:

Same vegetable in both bowls

They can then choose whether they want:

Double Dry Sabzi
Double Gravy Sabzi

This is treated as a Special Order because the normal two-bowl combination has been changed.

♻️ Surplus Food System

One of the important features of the application is the surplus system.

If an employee reduces an item from their normal lunch, that unused quantity can become available as surplus.

For example:

Normal Roti = 4


Employee orders = 2


Surplus created = 2

Another employee can then claim the available surplus.

The surplus is shared across employees through the application.

Important rules
Normal quantity controls cannot consume surplus.
Surplus portions must be claimed using the surplus system.
Once claimed, the surplus quantity decreases.
If an employee removes a previously claimed surplus portion, it can be released back into the surplus pool.

This prevents employees from taking unlimited extra food.

📝 Order Editing

After submitting an order, an employee can request an edit.

Employee

The employee selects:

Edit Order

The requested change is sent to Admin for approval.

Admin

The administrator can review the edit request and:

✅ Approve
❌ Reject

Admin/Owner orders can be edited directly because the Admin/Owner is the approving authority.

🛡️ Admin Dashboard

The Admin Dashboard provides centralized control over the lunch system.

The dashboard contains sections such as:

📊 Today's Summary

Shows today's lunch-order information.

👥 Employees & Admins

Used to manage employees and administrative users.

🔔 Access Requests

Used to review employee access/login requests.

📅 Menu Settings

Used to configure the daily lunch menu.

🍱 Book My Lunch

Admins and Owners can also book their own lunch directly from the Admin Dashboard.

The Admin Dashboard opens the Employee Lunch Portal for the administrator.

After submitting the order, the administrator can return to the Admin Dashboard using the:

← Back to Dashboard

button.

📱 WhatsApp Food Order System

The Admin Dashboard includes:

Send for Order

This creates a short WhatsApp message containing the approved lunch summary.

The system intentionally does not expose employee names to the food owner.

Instead, Special Orders use anonymous identifiers:

P1
P2
P3
...

This keeps the WhatsApp message short and avoids exposing employee names.

📩 Example WhatsApp Message

Example:

🍱 OFFICE LUNCH ORDER
Sparsh Panipat


Date: 14 Aug 2026
Total approved orders: 3


Regular: 1


Special: 2


P1 : Only Rice + 2 Roti + 1 Salad
P2 : Regular + 1 Kheer extra


Please prepare the above approved lunch orders.
Anonymous Special Orders

Employees are never identified by name.

Instead:

P1
P2
P3

are used.

🔎 Regular vs Special Orders

The application automatically determines whether an approved order is Regular or Special.

✅ Regular

An order is Regular when the employee follows the configured standard lunch quantity and bowl combination.

Example:

1 Bowl 1
1 Bowl 2
4 Roti
1 Rice
1 Extra
1 Salad
⭐ Special

An order becomes Special when the employee changes the normal lunch.

Examples:

Extra Kheer
Less Roti
Extra Rice
Only Rice
Only Rice + Roti + Salad
Same Sabzi in both bowls

The WhatsApp summary focuses on what the food owner actually needs to prepare.

🔐 Why Supabase Is Used

The project originally started as a frontend-only application.

A frontend-only application can use browser storage such as:

localStorage

However, this creates an important limitation.

❌ Problems Without Supabase

If the application relied only on localStorage:

1. Data is stored on one device

An employee submitting an order from their phone would not automatically update the administrator's laptop.

For example:

Employee Phone
      ↓
localStorage
      ↓
Employee's Browser

The Admin's browser has its own separate localStorage.

2. Multiple employees cannot share the same live data

If 10 employees submit orders from 10 different phones, each device would maintain its own local data.

There would be no reliable central database.

3. Surplus cannot be shared reliably

If Employee A creates surplus on one phone, Employee B may not see it on another device.

This makes the surplus system impractical.

4. Admin cannot reliably see everyone's orders

The Admin Dashboard would not have a centralized source containing all employee orders.

5. Changes are not synchronized

Menu changes, employee changes, orders, approvals and edit requests would remain device-specific.

☁️ What Supabase Solves

Supabase provides a centralized cloud database.

The application can therefore work like this:

Employee Phone
       │
       │
       ▼
   Supabase
       ▲
       │
       │
Admin Laptop

All connected devices communicate with the same backend database.

✅ Benefits After Adding Supabase
Centralized Orders

All employee orders are stored centrally.

Multi-device Synchronization

An employee can submit an order from their phone while Admin can view it from another device.

Shared Surplus

Surplus availability can be shared across employees.

Centralized Menu

Admins can manage menu information centrally.

Employee Management

Employee and admin information can be synchronized.

Access Requests

Employee access requests can be managed centrally.

Edit Requests

Employee edit requests can be stored and reviewed by Admin.

Persistent Data

Refreshing or changing devices does not depend entirely on browser localStorage.

🔄 Overall Application Flow

The overall system can be understood as:

                    🍱 SPARSH PANIPAT
                           │
                           ▼
                    Employee Login
                           │
             ┌─────────────┴─────────────┐
             │                           │
             ▼                           ▼
       Employee Portal              Admin Login
             │                           │
             │                           ▼
             │                   Admin Dashboard
             │                           │
             │             ┌─────────────┼─────────────┐
             │             │             │             │
             │             ▼             ▼             ▼
             │        Employees       Menu        Requests
             │
             ▼
       Today's Menu
             │
             ▼
       Select Quantities
             │
             ├──────────────► Surplus
             │
             ▼
        Submit Order
             │
             ▼
       Order Approved
             │
             ▼
        Admin Summary
             │
             ▼
       Send for Order
             │
             ▼
          WhatsApp
             │
             ▼
        🍱 Food Owner
♻️ Surplus Flow
Employee A
    │
    │ Reduces quantity
    ▼
Surplus Created
    │
    ▼
Supabase
    │
    ▼
Employee B
    │
    │ Claims surplus
    ▼
Extra Portion Added
✏️ Edit Request Flow
Employee
   │
   ▼
Submit Order
   │
   ▼
Edit Order
   │
   ▼
Edit Request
   │
   ▼
Supabase
   │
   ▼
Admin Dashboard
   │
   ├──── Approve ────► Updated Order
   │
   └──── Reject ─────► Original Order Remains
📲 WhatsApp Order Flow
Employee Orders
       │
       ▼
Admin Approval
       │
       ▼
Today's Summary
       │
       ▼
Send for Order
       │
       ▼
Generate Anonymous Message
       │
       ▼
WhatsApp
       │
       ▼
Food Owner

The WhatsApp message does not expose employee names.

🧩 Technology Stack
Frontend
⚛️ React
⚡ Vite
🎨 Tailwind CSS
🎞️ Framer Motion
🧩 Lucide React Icons
Backend / Database
☁️ Supabase
🗄️ PostgreSQL database
🔄 Supabase data synchronization
Deployment
🐙 GitHub
▲ Vercel
Communication
📱 WhatsApp wa.me deep link
📁 Project Structure

The project follows a component-based React architecture.

src/
│
├── components/
│   ├── admin/
│   │   ├── AccessRequests.jsx
│   │   ├── EmployeeManagement.jsx
│   │   ├── MenuSettings.jsx
│   │   └── TodaySummary.jsx
│   │
│   ├── Cart.jsx
│   ├── ItemCard.jsx
│   ├── SurplusPanel.jsx
│   ├── ThaliRing.jsx
│   ├── ThemeToggle.jsx
│   └── Toast.jsx
│
├── context/
│   └── AppContext.jsx
│
├── pages/
│   ├── AdminDashboard.jsx
│   └── EmployeePortal.jsx
│
├── App.jsx
│
└── ...
🧠 Application Architecture

The main application flow is managed through React components and the shared application context.

App.jsx
   │
   ├── Login
   │
   ├── EmployeePortal
   │
   └── AdminDashboard
           │
           ├── TodaySummary
           ├── EmployeeManagement
           ├── AccessRequests
           └── MenuSettings

The shared application state is handled through:

AppContext.jsx

This keeps important application data and actions centralized.

💾 Data Management

The application manages information such as:

Employees
Admins
Menu
Orders
Surplus claims
Login/access requests
Edit requests
Current user
Current application page
Theme preferences

Supabase acts as the centralized source for shared application data.

🔒 Privacy Design

The WhatsApp food-order message intentionally avoids employee names.

Instead of:

Rajeev - Extra Kheer
Shiv - Only Rice

the application sends:

P1 : Regular + 1 Kheer extra
P2 : Only Rice

This keeps the food-order message focused on preparation requirements rather than employee identity.

📱 Responsive Design

The application is designed for both:

💻 Desktop

Admins can use the dashboard comfortably from a laptop or desktop.

📱 Mobile

Employees can place their lunch orders from their phones.

The UI adapts to different screen sizes using responsive layouts.

🎨 UI / UX

The application follows a modern food-themed design using:

Emerald green
Golden/amber accents
Glass-style cards
Rounded components
Smooth animations
Dark mode
Responsive layouts
Interactive quantity controls
Visual thali ring
Toast notifications

The design is intended to feel modern while remaining simple enough for daily office use.

🌗 Dark Mode

The application supports:

☀️ Light Mode
🌙 Dark Mode

Users can switch the theme using the theme toggle.

🔑 Authentication

The application currently uses an employee/admin ID-based login flow.

Employee access can be controlled through the application's employee and access-request management system.

This project is designed primarily as an internal office lunch-management application rather than a public banking/security-critical application.

🚀 Deployment

The application is deployed using Vercel.

The general deployment flow is:

Local Development
       │
       ▼
VS Code
       │
       ▼
Git
       │
       ▼
GitHub
       │
       ▼
Vercel
       │
       ▼
Live Website
🛠️ Local Development

Clone the repository:

git clone YOUR_GITHUB_REPOSITORY_URL

Move into the project:

cd YOUR_PROJECT_FOLDER

Install dependencies:

npm install

Start the development server:

npm run dev

The Vite development server will provide the local application URL.

🔐 Environment Variables

Supabase configuration is stored using environment variables rather than hard-coding credentials into the source code.

Typical Vite environment variables include:

VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
VITE_APP_URL=your_application_url

The actual secret values should never be committed to GitHub.

🌐 Production Deployment

The project can be connected to GitHub and deployed through Vercel.

After deployment, the Vercel project should contain the required environment variables.

Example:

GitHub
   │
   ▼
Vercel
   │
   ├── VITE_SUPABASE_URL
   ├── VITE_SUPABASE_PUBLISHABLE_KEY
   └── VITE_APP_URL
📊 Scalability

The application is suitable for a small-to-medium office environment.

The frontend is deployed on Vercel while shared application data is stored in Supabase.

Actual capacity depends on:

Supabase plan
Database design
Query frequency
Realtime usage
Vercel limits
Application traffic

For a normal office lunch system with a relatively small number of employees, this architecture is more than sufficient.

🧪 Testing

The application has been tested across multiple devices, including:

💻 Laptop
📱 Mobile phone

The multi-device setup allows employees to place orders while the Admin Dashboard receives the shared order data through Supabase.

Testing includes:

Employee login
Admin login
Lunch ordering
Quantity modification
Surplus claiming
Surplus release
Same-sabzi selection
Order approval
Edit requests
Admin direct editing
WhatsApp order generation
Responsive mobile layout
Dark mode
Admin Book My Lunch flow
Back to Dashboard navigation
🏆 Project Goals

The main goals of the project are:

Simplify daily office lunch selection.
Reduce manual lunch-order management.
Give employees control over their lunch quantities.
Manage surplus food efficiently.
Allow administrators to approve and manage orders.
Provide a centralized multi-device system.
Generate a concise WhatsApp order for the food owner.
Avoid exposing employee names in the food-order message.
Provide a modern and mobile-friendly user experience.
🔮 Future Improvements

Possible future improvements include:

📈 Monthly lunch analytics
📊 Employee lunch statistics
📅 Historical order reports
📥 Export orders to Excel/CSV
🔔 Push notifications
📧 Email notifications
🔐 Stronger authentication
👤 Role-based permissions
🧾 Printable food-order reports
📱 Progressive Web App (PWA)
📊 Food consumption analytics
🗓️ Previous-day order history
👨‍💻 Developer

Built as a practical full-stack-style web application using modern frontend technologies and Supabase.

Project

🍱 Sparsh Panipat — Office Lunch Management System

Core Technologies
React
Vite
Tailwind CSS
Framer Motion
Supabase
PostgreSQL
Vercel
GitHub
WhatsApp
❤️ Project Summary

Sparsh Panipat transforms the traditional manual office lunch-ordering process into a centralized digital workflow.

Instead of collecting lunch requirements manually:

Employee → Manual Message → Admin → Food Owner

the application provides:

Employee
    ↓
Digital Lunch Selection
    ↓
Supabase
    ↓
Admin Approval
    ↓
Order Summary
    ↓
Anonymous WhatsApp Message
    ↓
Food Owner

The result is a cleaner, faster and more organized lunch-management process for the office.

🍱 Built for Simpler Office Lunch Management

Select → Approve → Summarize → Send



### Where should you edit it?


Since your project is already working, I recommend:


**VS Code → `README.md` → replace the old content → Save → Git push.**


Don't edit the README directly on GitHub unless you specifically need to make a quick documentation-only change. Since you're already developing locally, keeping the README in your local project is cleaner.


Then your final Git commands will simply be:


```bash
git status
git add README.md
git commit -m "Update project documentation"
git push

If you've also made other code changes that haven't been pushed yet, use:

git add .
git commit -m "Update project and documentation"
git push