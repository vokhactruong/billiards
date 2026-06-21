# Billiard Management System - Setup Guide

## Prerequisites
- Node.js >= 18
- PostgreSQL database
- npm or yarn

---

## Backend Setup

```bash
cd backend
npm install
```

Copy environment file and configure:
```bash
cp .env.example .env
```

Edit `.env`:
```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/billiard_db"
JWT_SECRET="your-secret-key"
PORT=3000
FRONTEND_URL="http://localhost:5173"
```

Run Prisma migrations and seed:
```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

Start development server:
```bash
npm run dev
```

---

## Frontend Setup

```bash
cd frontend
npm install
```

Copy environment file:
```bash
cp .env.example .env
```

Edit `.env`:
```
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

Start development server:
```bash
npm run dev
```

Open: http://localhost:5173

---

## Default Accounts

| Username | Password  | Role     |
|----------|-----------|----------|
| owner    | admin123  | Owner    |
| manager  | admin123  | Manager  |
| staff1   | admin123  | Staff    |

---

## API Endpoints

### Auth
- `POST /api/auth/login`
- `GET  /api/auth/me`

### Tables
- `GET  /api/tables`
- `POST /api/tables/:id/open`
- `POST /api/tables/:id/pause`
- `POST /api/tables/:id/resume`
- `POST /api/tables/:id/transfer`
- `PUT  /api/tables/:id/price`
- `GET  /api/tables/sessions/:sessionId`

### Orders
- `POST /api/orders/sessions/:sessionId`
- `GET  /api/orders/sessions/:sessionId`
- `PUT  /api/orders/:orderId/items`

### Products
- `GET    /api/products`
- `GET    /api/products/:id`
- `POST   /api/products`
- `PUT    /api/products/:id`
- `DELETE /api/products/:id`

### Inventory
- `POST /api/inventory/:id/import`
- `POST /api/inventory/:id/adjust`
- `GET  /api/inventory/history`
- `GET  /api/inventory/low-stock`

### Invoices
- `POST /api/invoices/checkout/:sessionId`
- `GET  /api/invoices`
- `GET  /api/invoices/:id`

### Reports
- `GET /api/reports/dashboard`
- `GET /api/reports/revenue?type=daily|weekly|monthly`
- `GET /api/reports/products`
- `GET /api/reports/inventory`

### Users (Owner only)
- `GET    /api/users`
- `POST   /api/users`
- `PUT    /api/users/:id`
- `DELETE /api/users/:id`

---

## Socket.IO Events

| Event              | Payload                          |
|--------------------|----------------------------------|
| table_opened       | { tableId, session }             |
| table_paused       | { tableId, session }             |
| table_resumed      | { tableId, session }             |
| table_closed       | { sessionId, tableId, invoice }  |
| table_transferred  | { fromTableId, toTableId }       |
| order_created      | { sessionId, order }             |
| inventory_updated  | { productId, product }           |
