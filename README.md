# Food Delivery Order Management System

A full-stack food delivery application with real-time order tracking built using Node.js, Express, TypeScript, Socket.io, and React.

## 🏗️ Architecture

### Backend (Node.js + Express + TypeScript)

The backend follows a **layered architecture pattern** with clear separation of concerns:

```
backend/
├── src/
│   ├── controllers/     # Request/Response handling only
│   ├── services/        # Business logic layer
│   ├── routes/          # API route definitions
│   ├── validations/     # Zod schema validations
│   ├── middleware/      # Error handling, validation middleware
│   ├── socket/          # Socket.io real-time handlers
│   ├── models/          # Types & in-memory data store
│   ├── app.ts           # Express app configuration
│   └── server.ts        # Server entry point
└── tests/               # Jest + Supertest tests
```

### Frontend (React + TypeScript)

```
frontend/
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/           # Page components (Menu, Cart, Checkout, OrderTracking)
│   ├── context/         # React Context for cart state
│   ├── services/        # API and Socket.io services
│   └── components/ui/   # Shadcn UI components
```

## 🧩 High Level System Design

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  React Frontend │────▶│  Express API    │────▶│  In-Memory      │
│  (Port 3000)    │◀────│  (Port 8001)    │◀────│  Data Store     │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │
        │                       │
        ▼                       ▼
   ┌─────────────────────────────────────┐
   │         Socket.io (WebSocket)       │
   │    Real-time Order Status Updates   │
   └─────────────────────────────────────┘
```

### Request Flow

```
User Places Order
      │
      ▼
POST /api/orders
      │
      ▼
Validation (Zod) ──── ❌ Invalid → 400 Error Response
      │
      ✅ Valid
      │
      ▼
Order Service (Create Order)
      │
      ▼
Store in Memory (Map)
      │
      ▼
Start Status Simulation (Socket.io)
      │
      ▼
Emit order-status-updated every 10s
      │
      ▼
Client receives real-time update → UI updates
```

## 🎯 Design Decisions

### 1. **Layered Architecture**
- **Controllers** handle HTTP request/response only
- **Services** contain all business logic (order creation, status transitions)
- **Validation** is decoupled using Zod schemas
- **Middleware** provides centralized error handling

### 2. **In-Memory Data Storage**
- Uses JavaScript Map for orders (O(1) lookup)
- Array for menu items (seeded data)
- Easy to swap for database in production

### 3. **Status Transition Validation**
- Enforces valid order status progression
- Prevents invalid state transitions
- Order Received → Preparing → Out for Delivery

### 4. **Real-Time Updates with Socket.io**
- Order-specific rooms for targeted updates
- Automatic status progression simulation (10s intervals)
- Client subscribes to their order's room

### 5. **Cart State Management**
- React Context API for global cart state
- localStorage persistence for cart data
- Optimistic UI updates

## 🚀 Running Locally

### Prerequisites
- Node.js 18+
- Yarn

### Backend

```bash
cd backend
yarn install
yarn dev        # Development mode with hot reload
yarn test       # Run tests with coverage
yarn build      # Build for production
```

### Frontend

```bash
cd frontend
yarn install
yarn start      # Development server on port 3000
yarn test       # Run React tests
```

## 🧪 Running Tests

### Backend Tests (Jest + Supertest)

```bash
cd backend
yarn test
```

Tests cover:
- ✅ Menu API (GET all items, GET single item, 404 handling)
- ✅ Order creation (validation, empty cart, invalid phone, invalid quantity)
- ✅ Order retrieval (success, 404 not found)
- ✅ Status transitions (valid/invalid transitions, final state handling)

### Frontend Tests

```bash
cd frontend
yarn test
```

## 🔌 API Endpoints

### Menu
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/menu` | Get all menu items |
| GET | `/api/menu/:id` | Get single menu item |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Create new order |
| GET | `/api/orders/:id` | Get order by ID |
| PATCH | `/api/orders/:id/status` | Update order status |

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |

## ⚡ Real-Time Updates

### How It Works

1. **Order Creation**: When an order is created, the server starts a status simulation
2. **Socket Connection**: Frontend connects to Socket.io on page load
3. **Room Subscription**: Client subscribes to order-specific room using `subscribe-order` event
4. **Status Updates**: Server emits `order-status-updated` events every 10 seconds
5. **UI Update**: React state updates in real-time when events are received

### Socket Events

| Event | Direction | Payload |
|-------|-----------|---------|
| `subscribe-order` | Client → Server | `orderId: string` |
| `unsubscribe-order` | Client → Server | `orderId: string` |
| `order-status-updated` | Server → Client | `{ orderId, status, timestamp }` |

### Status Progression Timeline

```
Order Created
    ↓ (10 seconds)
"Order Received" → "Preparing"
    ↓ (10 seconds)
"Preparing" → "Out for Delivery"
```

## 🔒 Validation

Using **Zod** for runtime validation:

```typescript
// Order validation schema
{
  customerName: string (min 1, max 100),
  address: string (min 1, max 500),
  phone: string (regex: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/),
  items: [
    {
      menuId: string,
      quantity: number (positive integer)
    }
  ] (min 1 item)
}
```

## 📁 Environment Variables

### Backend (.env)
```
PORT=8001
CORS_ORIGINS=*
NODE_ENV=development
```

### Frontend (.env)
```
REACT_APP_BACKEND_URL=http://localhost:8001
```

## 🛡️ Error Handling

Centralized error handling with consistent response format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    { "field": "phone", "message": "Invalid phone number format" }
  ]
}
```

## 📦 Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express
- **Language**: TypeScript
- **Validation**: Zod
- **Real-time**: Socket.io
- **Testing**: Jest + Supertest

### Frontend
- **Framework**: React 18
- **State**: Context API
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/UI
- **HTTP Client**: Axios
- **Real-time**: Socket.io Client