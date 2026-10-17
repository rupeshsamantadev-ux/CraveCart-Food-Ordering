require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  image: String,
  rating: { type: Number, default: 4.8 },
  popular: { type: Boolean, default: false }
});

const orderSchema = new mongoose.Schema({
  customer: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  items: [{ name: String, price: Number, quantity: Number }],
  total: { type: Number, required: true },
  status: { type: String, default: "Received" },
  createdAt: { type: Date, default: Date.now }
});

const MenuItem = mongoose.models.MenuItem || mongoose.model("MenuItem", menuItemSchema);
const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

const starterMenu = [
  { name: "Truffle Mushroom Pizza", category: "Pizza", description: "Roasted mushrooms, mozzarella, herbs and truffle oil.", price: 349, image: "https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=900&q=85", rating: 4.9, popular: true },
  { name: "Classic Smash Burger", category: "Burgers", description: "Juicy double patty, cheddar, house sauce and crisp lettuce.", price: 279, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=85", rating: 4.8, popular: true },
  { name: "Creamy Alfredo Pasta", category: "Pasta", description: "Silky parmesan cream sauce with fresh herbs.", price: 299, image: "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=900&q=85", rating: 4.7, popular: true },
  { name: "Garden Fresh Bowl", category: "Healthy", description: "Seasonal greens, avocado, grains and citrus dressing.", price: 249, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=85", rating: 4.8, popular: false },
  { name: "Crispy Chicken Tenders", category: "Snacks", description: "Golden, crunchy tenders served with smoky dip.", price: 229, image: "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=900&q=85", rating: 4.6, popular: false },
  { name: "Chocolate Lava Cake", category: "Desserts", description: "Warm chocolate cake with a rich molten centre.", price: 159, image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=900&q=85", rating: 4.9, popular: true }
];

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", database: mongoose.connection.readyState === 1 ? "connected" : "demo mode" });
});

app.get("/api/menu", async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      let items = await MenuItem.find().lean();
      if (!items.length) {
        items = await MenuItem.insertMany(starterMenu);
      }
      const category = req.query.category;
      return res.json(category && category !== "All" ? items.filter(i => i.category === category) : items);
    }
  } catch (error) {
    console.error("Menu database error:", error.message);
  }
  const category = req.query.category;
  res.json(category && category !== "All" ? starterMenu.filter(i => i.category === category) : starterMenu);
});

app.post("/api/orders", async (req, res) => {
  const { customer, phone, address, items, total } = req.body;
  if (!customer || !phone || !address || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Please complete all details and add at least one item." });
  }
  const order = {
    customer: String(customer).trim(),
    phone: String(phone).trim(),
    address: String(address).trim(),
    items,
    total: Number(total)
  };
  try {
    if (mongoose.connection.readyState === 1) {
      const saved = await Order.create(order);
      return res.status(201).json({ message: "Order placed successfully!", orderId: saved._id, status: saved.status });
    }
    return res.status(201).json({ message: "Demo order received! Connect MongoDB to save orders permanently.", orderId: `DEMO-${Date.now()}`, status: "Received" });
  } catch (error) {
    console.error("Order error:", error.message);
    res.status(500).json({ message: "Could not place order. Please try again." });
  }
});

app.get("/api/orders", async (_req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: "Connect MongoDB to view saved orders." });
  }
  const orders = await Order.find().sort({ createdAt: -1 }).limit(100);
  res.json(orders);
});

app.get("*", (_req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

async function start() {
  if (process.env.MONGODB_URI) {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log("MongoDB connected");
    } catch (error) {
      console.warn("MongoDB unavailable; starting in demo mode:", error.message);
    }
  } else {
    console.warn("MONGODB_URI not set; starting in demo mode.");
  }
  app.listen(PORT, () => console.log(`CraveCart running at http://localhost:${PORT}`));
}
start();