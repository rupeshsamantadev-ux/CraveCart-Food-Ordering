# CraveCart — Food Ordering Website

A responsive, modern food ordering website created as a full-stack training project using **HTML, CSS, JavaScript, Node.js, Express and MongoDB**.

## Features
- Premium, responsive food ordering UI
- Menu cards with category filters and live search
- Add to cart, quantity controls, remove items and saved cart (localStorage)
- Checkout form with client-side validation
- Node.js/Express REST API for menu and order submission
- MongoDB models for menu items and orders
- Demo mode works without MongoDB; orders are not permanently saved in demo mode
- Newsletter interaction, toast notifications and mobile navigation

## Project structure
```text
CraveCart-Food-Ordering/
├── public/
│   ├── index.html
│   ├── style.css
│   └── app.js
├── server.js
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

## Run locally
1. Install [Node.js](https://nodejs.org/) (LTS recommended).
2. Extract the ZIP and open this folder in VS Code.
3. Open a terminal in the project folder and run:
   ```bash
   npm install
   ```
4. Optional: copy `.env.example` to `.env` and set your MongoDB connection string:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://127.0.0.1:27017/cravecart
   ```
   You can use a local MongoDB installation or a MongoDB Atlas connection string.
5. Start the server:
   ```bash
   npm start
   ```
6. Visit `http://localhost:3000`.

## API endpoints
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Server/database status |
| GET | `/api/menu` | Get all menu items |
| GET | `/api/menu?category=Pizza` | Filter menu items |
| POST | `/api/orders` | Submit an order |
| GET | `/api/orders` | List recent orders (MongoDB required) |

### Example order request
```json
{
  "customer": "Demo User",
  "phone": "9876543210",
  "address": "Kolkata, West Bengal",
  "items": [{ "name": "Classic Smash Burger", "price": 279, "quantity": 1 }],
  "total": 279
}
```

## Important notes
- If MongoDB is not configured or unavailable, the site starts in demo mode and uses sample menu data. Demo orders are acknowledged but are not saved permanently.
- Product photos are loaded from Unsplash and require an internet connection.
- This is a learning/demo project. It does not process real payments or include authentication, stock management or production-grade order security.
- Before public deployment, add input sanitization, authentication/authorization for order administration, rate limiting, and proper payment integration.

## Technologies
HTML5 · CSS3 · Vanilla JavaScript · Node.js · Express · MongoDB · Mongoose
