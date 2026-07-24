# CrustCraft

CrustCraft is an inventory-aware pizza customization and real-time order tracking platform. The application dynamically links your visual canvas selections directly to live kitchen stock levels—ensuring out-of-stock crusts, sauces, cheeses, or veggie toppings disable automatically. 

The platform supports atomic reservation transactions, secure payment verification, a live admin Kanban dashboard, and simulated road-delivery telemetry mapping.

---

## Key Unique Selling Points (USPs)

*   **Inventory-Aware Customizer Canvas**: Layer-by-layer canvas studio. Built using SVG assets and Framer Motion spring physics. Ingredients are linked dynamically to live stock counts.
*   **Atomic Stock Deductions**: Built-in race-condition protection. Order placement and payment verification execute inside an atomic Mongoose database session, locking ingredient inventory dynamically to prevent double-booking.
*   **Simulated Road-Delivery Telemetry**: Traces route geometry dynamically between storefront coordinates and customer destinations using the public OSRM Routing API. When an order goes out for delivery, the server initiates an interpolation sequence, broadcasting driver coordinates in real time via Socket.io to an interactive Leaflet tracking map.
*   **Tab-Isolated Multi-Session Auth**: Session tokens, active carts, and customization presets are bound to browser `sessionStorage`. This isolates sessions by tab, allowing recruiters to test customer checkout flows and admin Kanban status changes concurrently in separate tabs of the same browser window.
*   **Real-Time Status Notifications**: Sliding toast notifications alert active customer sessions of order transitions (Received > Kitchen > Out for Delivery > Delivered) as they occur.

---

## Tech Stack

*   **Frontend**: React 19, Redux Toolkit (RTK), Framer Motion, Leaflet (`react-leaflet`), Socket.io-client, Tailwind CSS, Lucide React.
*   **Backend**: Node.js, Express, MongoDB (Mongoose), Socket.io, Zod (Request validation), Jest (Integration testing).
*   **Third-Party Integrations**: Razorpay (Mock Gateway fallback), OSRM public API.

---

## Project Architecture

```text
CrustCraft (Monorepo)
├── client/                          # React Frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/              # Global layout & ProtectedRoute route guards
│   │   │   └── pizza/               # DeliveryMap, IngredientChip, PizzaCanvas
│   │   ├── features/                # Domain-specific Redux slices & actions
│   │   ├── pages/                   # Main views (PizzaBuilder, Cart, OrderHistory, etc.)
│   │   └── utils/                   # Axios setup with interceptors (tab-session tokens)
│   └── package.json
│
├── server/                          # Express Node.js REST & WebSockets API
│   ├── src/
│   │   ├── config/                  # DB, Socket.io, and Zod env validations
│   │   ├── controllers/             # Request parsing & HTTP controllers
│   │   ├── middleware/              # Authorization, validations, and errors
│   │   ├── models/                  # Mongoose DB Schemas
│   │   ├── routes/                  # API endpoints routes definition
│   │   ├── services/                # Business logic, OSRM routes, & telemetry simulation
│   │   └── server.js                # Server entry point
│   ├── tests/                       # Jest Integration tests
│   ├── seed.js                      # Database provisioning seeder
│   └── package.json
└── package.json                     # Monorepo task runner
```

---

## Local Setup & Installation

### Prerequisites
*   Node.js (v18+)
*   MongoDB running locally or via MongoDB Atlas

### 1. Clone & Install Dependencies
Run the monorepo installation script at the root directory to provision dependencies for both client and server:
```bash
npm run install:all
```

### 2. Configure Environment variables
Create a `.env` file in the `server/` directory:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/crustcraft
JWT_ACCESS_SECRET=your_super_jwt_secret_token
JWT_REFRESH_SECRET=your_super_jwt_refresh_token
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=your_smtp_user
EMAIL_PASS=your_smtp_password
```

Create a `.env` file in the `client/` directory:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Seed Database
Provision mock ingredients, admins, and items:
```bash
npm run seed --prefix server
```

### 4. Run Development Servers
Start both backend API and client server concurrently:
```bash
npm run dev
```
The client application will mount at `http://localhost:5173`.

---

## Recruiter Testing Playbook

To thoroughly test the live integration:

1.  **Open two concurrent tabs** in the same browser window:
    *   **Tab A (Admin)**: Go to `http://localhost:5173/login` and authenticate using seeded admin credentials:
        *   **Email**: `admin@crustcraft.com`
        *   **Password**: `Admin@123`
        *   Navigate to the **Orders Panel** Kanban board.
    *   **Tab B (Customer)**: Go to `http://localhost:5173/login` and authenticate using seeded customer credentials:
        *   **Email**: `user@crustcraft.com`
        *   **Password**: `User@123`
2.  **On Tab B (Customer)**:
    *   Navigate to **Build Your Pizza** and customize a custom combo. Note how changing toppings updates the pricing ticker dynamically.
    *   Add the pizza to your cart and proceed to the Checkout pane.
    *   Input a delivery address (e.g. `Palace Road, Amreli`) and click **Place Reservation Order**.
    *   Confirm the mock payment gateway screen.
3.  **On Tab A (Admin)**:
    *   Observe that the new order card immediately displays in the **Received** column of the Kanban board without refreshing.
    *   Drag the order card into the **Preparing** column, then drag it into the **Out for Delivery** column.
4.  **On Tab B (Customer)**:
    *   Observe a sliding notification stating that the order is out for delivery.
    *   Go to **My Orders** and click **Track Active Delivery** on the card.
    *   Watch the Leaflet map animate the driver icon along actual street routes in real time.

---

## Verification and Tests
Execute the integration test suite (covering checkout validations, database session locks, and registration flow limits):
```bash
npm run test:server    
```
