# CrustCraft - Project Folder Architecture

This document describes the design pattern and complete folder tree hierarchy for both the React client frontend and Express backend.

---

## Complete Directory Tree

```
CrustCraft (Root Directory)
├── client/                          # React Frontend Application (Vite Build)
│   ├── public/                      # Static public assets (Favicons, logos)
│   ├── src/                         # React Application Source Code
│   │   ├── components/              # Shared component directory
│   │   │   └── common/              # Global Navbar & ProtectedRoute guard
│   │   ├── features/                # Redux Slices, Action Thunks & Pages
│   │   │   ├── admin/               # Admin inventory slice
│   │   │   ├── auth/                # Login, Register, Verify Email views & authSlice
│   │   │   ├── cart/                # Cart checkout actions & cartSlice
│   │   │   └── pizza/               # Pizza builder dynamic slice
│   │   ├── hooks/                   # Store dispatch/selector bindings
│   │   ├── layouts/                 # Main page layout templates (MainLayout)
│   │   ├── pages/                   # General views (PizzaBuilder, Cart, OrderHistory, etc.)
│   │   ├── router/                  # React Router routes mapping (AppRouter)
│   │   ├── store/                   # Redux global store configurations (store.js)
│   │   ├── utils/                   # Axios API instances with interceptors (api.js)
│   │   ├── App.jsx                  # React Root layout mount
│   │   └── main.jsx                 # Vite application mount point
│   ├── index.html                   # HTML entry (Includes Razorpay script CDN)
│   ├── postcss.config.js            # PostCSS Tailwind config
│   ├── tailwind.config.js           # Tailwind theme color definitions (HSL Pizza themes)
│   ├── vite.config.js               # Vite compilation settings
│   └── package.json                 # Frontend dependencies (Redux toolkit, Lucide, tailwind)
│
├── server/                          # Node.js Express Backend API
│   ├── src/                         # Server Application Source Code
│   │   ├── config/                  # DB connection, Zod env validation, Socket configurations
│   │   ├── controllers/             # Express handlers (Intermediary layer parsing inputs)
│   │   ├── middleware/              # Auth protect, Zod validate, and error handlers
│   │   ├── models/                  # Mongoose Schemas (User, Order, InventoryItem, PizzaOption)
│   │   ├── routes/                  # Express REST routes definition (Index router mapping)
│   │   ├── services/                # CORE Business logic (Razorpay verifies, atomic stock deductions, emails)
│   │   ├── utils/                   # JWT signers, AppError subclasses
│   │   ├── app.js                   # Express application and CORS setup
│   │   └── server.js                # Server entry (Listens on port 5000, runs db & starts cron alert workers)
│   ├── tests/                       # Jest Integration Test suites
│   │   ├── auth.test.js             # User account registration/login limits tests
│   │   └── order.test.js            # Checkout inventory checks and transaction lock tests
│   ├── seed.js                      # Database provisioning seeding utility
│   ├── .env                         # Environment keys configuration (secrets, Razorpay mock settings)
│   ├── jest.config.js               # Jest execution configurations
│   └── package.json                 # Backend dependencies (Razorpay, Cron, Nodemailer, Express, mongoose)
│
├── DIAGRAMS.md                      # Use Case and ER Diagrams in Mermaid format
├── ARCHITECTURE.md                  # Project folder tree architecture layout (This File)
└── package.json                     # Monorepo root configuration
```

---

## Architecture Design Decisions

1.  **Strict Layered Backend (Controller -> Service -> Model)**:
    *   **Routes** define API endpoints and access controls.
    *   **Controllers** read request arguments, perform light Zod schema checks, and pass clean inputs to services.
    *   **Services** contain core business rules (Razorpay payments, atomic stock calculations, Mongoose transaction blocks).
    *   **Models** represent schema formats in MongoDB.
2.  **State Separation via Redux Toolkit**:
    *   Separate slices manage logical domain blocks on the client: `authSlice` for user profiles, `cartSlice` for persistence and payments, `pizzaSlice` for customization options, and `adminSlice` for stock dashboards.
3.  **Real-Time Live WebSockets**:
    *   WebSockets (Socket.io) operate as an event-driven layer initialized in the server startup, broadcasting status updates to connected order rooms without polluting the REST HTTP database endpoints.
