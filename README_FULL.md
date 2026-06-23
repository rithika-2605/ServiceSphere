## Basic Information
- **Group ID:** 31  
- **Project Title:** ServiceSphere  
- **SPOC**  
  - **Name:** PATNAM JAHNAVI  
  - **Email:** jahnavi.p23@iiits.in  
  - **Roll No:** S20230010181  
- **Team Members & Roles:**  
  *(To be added later — list names, roll numbers, and responsibilities such as Frontend, Backend, Validation, Database, etc.)*

## How to Run the Project (Local Setup)

### Prerequisites
- Node.js (v16 or higher recommended)
- npm (Node Package Manager)
- mongoDB (local) 

### Steps
1. Clone or download the repository.  
2. Open the project folder in your terminal or IDE.  
3. Run `npm install` to install all dependencies.  
4. Start the application using `npm start`.  
5. The application runs on **http://localhost:3000**

## Key Files and Functions

| File / Folder | Description | Evaluation Component |
|----------------|--------------|----------------------|
| `/views/signup-helper.ejs` | Handles frontend DOM-based validation for signup/login forms. | Form Validation (3 Marks) |
| `/views/*.ejs` | Dynamic EJS templates rendering role-based dashboards and profile pages. | Dynamic HTML Implementation (3 Marks) |
| `/routes/index.js` | Express backend routes handling CRUD operations, async DB access, and fetch responses. | Frontend + Backend Integration (6 Marks), Async Handling (5 Marks) |
| `/database.js` | Initializes and manages SQLite database connections and schema setup. | Backend (Database) |
| `/views/helperDashboard/schedule.ejs` | Renders helper schedule dynamically using FullCalendar with async service request data. | Dynamic + Async |
| `/network_evidence/` | Contains screenshots of fetch/AJAX network requests in browser dev tools. | Evidence for Async Calls |

| File / Folder | Description | Evaluation Component |
|----------------|--------------|----------------------|
| `/views/signup-seeker.ejs` | Implements client-side (DOM-based) form validation for seeker registration. Uses JavaScript regex checks and real-time validation feedback (error messages and red borders) for all input fields. Includes dynamic EJS templating to conditionally render error messages and maintain form state. | **Form Validation (3 Marks)**, **Dynamic HTML Implementation (3 Marks)** |
| `/views/signup-helper.ejs` | Implements detailed DOM-based client-side validation for helper registration. Validates multiple fields (name, gender, mobile, Aadhar, email, password, confirm password) using regex and event listeners for real-time feedback. Uses EJS templating to dynamically show server-side errors and preserve input state. | **Form Validation (3 Marks)**, **Dynamic HTML Implementation (3 Marks)** |
| `/views/payment.ejs` | Implements a dynamic payment interface with real-time client-side validation for card, PayPal, and UPI payment methods. Includes JavaScript-based form validation (regex, expiry auto-formatting, and inline error rendering). Uses `fetch()` for asynchronous payment submission and EJS to render dynamic booking and service details. | **Form Validation (3 Marks)**, **Dynamic HTML Implementation (3 Marks)**, **Async Handling (5 Marks)** |
| `/views/search.ejs` | Dynamically renders helper profiles and integrates client-side filtering and search using JavaScript. Uses `fetch()` calls to asynchronously retrieve filtered helper data from the backend based on category, rating, or location, then updates the DOM without page reload. Implements dynamic HTML updates for live search results and user interactivity. | **Dynamic HTML Implementation (3 Marks)**, **Async Handling (5 Marks)** |
| `/views/adminDashboard.ejs` | Displays registered user data with dynamic role-based filtering and asynchronous fetch calls to retrieve individual user contact details on demand. Updates contact information sections in real time without reloading the page, ensuring smooth admin interaction. | **Dynamic HTML Implementation (3 Marks)**, **Async Handling (5 Marks)** |
---

## 🎥 Demo Link
- **Video URL:** *(To be added)*  
- **Timestamps:**  
  - Login/Signup  
  - Service Booking  
  - Admin Approval  
  - Helper Schedule View  
  - Payment & Review Flow  

---

## 🧾 Evidence & Supporting Files
- **Async Validation Evidence:** `network_evidence/` folder  
- **Git Commit Logs:** `git-logs.txt`  
- **Database Schema/Dump:** `schema.sql`  
- **Test Results:** `test_plan.md`  
- **Video Demo Link:** `demo_link.txt`  
- **Team Task Division:** `task_assignment.md` or `.csv`


## 🧩 Notes
- Ensure `package.json` contains all necessary dependencies before running `npm install`.  
- All async fetch calls and validation scripts are implemented using vanilla JavaScript and EJS templates.  
- SQLite database (`database.js`) stores persistent data for helpers, seekers, services, and bookings.  
- Project is fully compatible with local execution via Node.js and Express.

---
