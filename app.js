const fallbackMenu = [
  { _id:"pizza", name:"Truffle Mushroom Pizza", category:"Pizza", description:"Roasted mushrooms, mozzarella, herbs and truffle oil.", price:349, image:"https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=900&q=85", rating:4.9, popular:true },
  { _id:"burger", name:"Classic Smash Burger", category:"Burgers", description:"Juicy double patty, cheddar, house sauce and crisp lettuce.", price:279, image:"https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=85", rating:4.8, popular:true },
  { _id:"pasta", name:"Creamy Alfredo Pasta", category:"Pasta", description:"Silky parmesan cream sauce with fresh herbs.", price:299, image:"https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=900&q=85", rating:4.7, popular:true },
  { _id:"salad", name:"Garden Fresh Bowl", category:"Healthy", description:"Seasonal greens, avocado, grains and citrus dressing.", price:249, image:"https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=85", rating:4.8, popular:false },
  { _id:"chicken", name:"Crispy Chicken Tenders", category:"Snacks", description:"Golden, crunchy tenders served with smoky dip.", price:229, image:"https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=900&q=85", rating:4.6, popular:false },
  { _id:"cake", name:"Chocolate Lava Cake", category:"Desserts", description:"Warm chocolate cake with a rich molten centre.", price:159, image:"https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=900&q=85", rating:4.9, popular:true }
];
const $ = (selector) => document.querySelector(selector);
const foodGrid = $("#foodGrid");
let menu = [];
let activeCategory = "All";
let cart = JSON.parse(localStorage.getItem("cravecart-cart") || "[]");
let toastTimer;

const money = value => new Intl.NumberFormat("en-IN", { style:"currency", currency:"INR", maximumFractionDigits:0 }).format(value);
function showToast(message) {
  const toast = $("#toast"); toast.textContent = message; toast.classList.add("show");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}
function saveCart() { localStorage.setItem("cravecart-cart", JSON.stringify(cart)); renderCart(); }
function renderMenu() {
  const query = $("#searchInput").value.trim().toLowerCase();
  const items = menu.filter(item => (activeCategory === "All" || item.category === activeCategory) &&
    `${item.name} ${item.category} ${item.description}`.toLowerCase().includes(query));
  foodGrid.innerHTML = items.length ? items.map(item => `
    <article class="food-card">
      <div class="food-photo"><img src="${item.image}" alt="${item.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1546549032-9571cd6b27df?auto=format&fit=crop&w=900&q=80'">
      ${item.popular ? '<span class="tag">✦ Crowd favourite</span>' : `<span class="tag">${item.category}</span>`}</div>
      <div class="food-details"><div class="food-title-row"><h3>${item.name}</h3><span class="food-rating">★ ${item.rating || "4.8"}</span></div>
      <p>${item.description || "Freshly made with ingredients we love."}</p>
      <div class="food-card-bottom"><strong class="food-price">${money(item.price)}</strong><button class="add-button" data-add="${item._id}">+ Add</button></div></div>
    </article>`).join("") : '<div class="no-results">No dishes found. Try another search or category.</div>';
}
async function loadMenu() {
  try {
    const response = await fetch("/api/menu");
    if (!response.ok) throw new Error("Menu API unavailable");
    menu = await response.json();
    if (!Array.isArray(menu) || !menu.length) menu = fallbackMenu;
  } catch (_) { menu = fallbackMenu; }
  renderMenu();
}
function renderCart() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  $("#cartCount").textContent = count; $("#drawerCount").textContent = `(${count})`; $("#subtotal").textContent = money(total); $("#checkoutTotal").textContent = money(total);
  if (!cart.length) {
    $("#cartItems").innerHTML = '<div class="empty-cart"><span>🛍</span><h4>Your cart is feeling lonely.</h4><p>Add something delicious to get started.</p><button class="btn btn-primary" id="browseMenu">Browse menu</button></div>';
    $("#browseMenu").addEventListener("click", () => { closeCart(); $("#menu").scrollIntoView({ behavior:"smooth" }); });
    $("#checkoutBtn").disabled = true; $("#checkoutBtn").style.opacity = ".55";
    return;
  }
  $("#checkoutBtn").disabled = false; $("#checkoutBtn").style.opacity = "1";
  $("#cartItems").innerHTML = cart.map(item => `<div class="cart-row"><img src="${item.image}" alt=""><div><strong>${item.name}</strong><small>${money(item.price)} each</small><div class="quantity"><button data-qty="${item.id}" data-change="-1" aria-label="Decrease quantity">−</button><span>${item.quantity}</span><button data-qty="${item.id}" data-change="1" aria-label="Increase quantity">+</button></div></div><div><strong>${money(item.price * item.quantity)}</strong><button class="remove" data-remove="${item.id}">Remove</button></div></div>`).join("");
}
function addToCart(id) {
  const item = menu.find(product => String(product._id) === String(id));
  if (!item) return;
  const existing = cart.find(row => row.id === String(id));
  if (existing) existing.quantity += 1;
  else cart.push({ id:String(id), name:item.name, price:Number(item.price), image:item.image, quantity:1 });
  saveCart(); showToast(`${item.name} added to your cart`);
}
function openCart() { $("#overlay").classList.add("show"); $("#cartDrawer").classList.add("open"); $("#cartDrawer").setAttribute("aria-hidden","false"); document.body.style.overflow="hidden"; }
function closeCart() { $("#overlay").classList.remove("show"); $("#cartDrawer").classList.remove("open"); $("#cartDrawer").setAttribute("aria-hidden","true"); document.body.style.overflow=""; }
$("#foodGrid").addEventListener("click", event => { const button = event.target.closest("[data-add]"); if (button) addToCart(button.dataset.add); });
$("#filters").addEventListener("click", event => {
  const button = event.target.closest("[data-category]"); if (!button) return;
  activeCategory = button.dataset.category;
  document.querySelectorAll(".filter").forEach(filter => filter.classList.toggle("active", filter === button));
  renderMenu();
});
$("#searchInput").addEventListener("input", renderMenu);
$("#showAll").addEventListener("click", () => { activeCategory="All"; $("#searchInput").value=""; document.querySelectorAll(".filter").forEach(f=>f.classList.toggle("active",f.dataset.category==="All")); renderMenu(); });
$("#openCart").addEventListener("click", openCart); $("#closeCart").addEventListener("click", closeCart); $("#overlay").addEventListener("click", closeCart);
$("#cartItems").addEventListener("click", event => {
  const qty = event.target.closest("[data-qty]"), remove = event.target.closest("[data-remove]");
  if (qty) { const row = cart.find(item => item.id === qty.dataset.qty); if (row) { row.quantity += Number(qty.dataset.change); if (row.quantity <= 0) cart = cart.filter(item => item.id !== row.id); saveCart(); } }
  if (remove) { cart = cart.filter(item => item.id !== remove.dataset.remove); saveCart(); }
});
$("#checkoutBtn").addEventListener("click", () => {
  if (!cart.length) return;
  $("#checkoutTotal").textContent = money(cart.reduce((sum,item)=>sum+item.price*item.quantity,0));
  $("#checkoutDialog").showModal();
});
$("#closeCheckout").addEventListener("click", () => $("#checkoutDialog").close());
$("#checkoutForm").addEventListener("submit", async event => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const payload = {
    customer:form.get("customer"), phone:form.get("phone"), address:form.get("address"),
    items:cart.map(({name,price,quantity})=>({name,price,quantity})),
    total:cart.reduce((sum,item)=>sum+item.price*item.quantity,0)
  };
  const submit = event.currentTarget.querySelector('button[type="submit"]');
  submit.disabled = true; submit.textContent = "Placing your order…";
  try {
    const response = await fetch("/api/orders", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Order failed");
    $("#checkoutDialog").close(); closeCart(); cart=[]; saveCart(); event.currentTarget.reset();
    showToast(`${result.message} Order ID: ${result.orderId}`);
  } catch (error) { showToast(error.message || "Could not place order. Please try again."); }
  finally { submit.disabled=false; submit.innerHTML='Place my order <span>→</span>'; }
});
$("#newsletterForm").addEventListener("submit", event => {
  event.preventDefault(); const email = $("#emailInput").value;
  $("#newsletterMessage").textContent = `Thanks! ${email} is on the list (demo).`;
  event.currentTarget.reset();
});
$("#menuToggle").addEventListener("click", () => $("#mainNav").classList.toggle("show"));
document.querySelectorAll("#mainNav a").forEach(link => link.addEventListener("click", () => $("#mainNav").classList.remove("show")));
renderCart(); loadMenu();