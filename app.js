// Easy-to-customize cafe configuration (great for selling to clients!)
const CAFE_CONFIG = {
  name: "Roast & Hearth",
  whatsappNumber: "919876543210", // Client's WhatsApp number without '+'
  currency: "₹",
  gstRate: 0.05,
};

const MENU_ITEMS = [
  {
    id: 1,
    name: "Single-Origin Pour Over",
    category: "coffee",
    price: 220,
    veg: true,
    tag: "Bestseller",
    desc: "Chikmagalur estate beans brewed to order with notes of dark cocoa and roasted almond.",
    img: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: 2,
    name: "Iced Hazelnut Latte",
    category: "coffee",
    price: 260,
    veg: true,
    tag: "Popular",
    desc: "Double-shot espresso shaken with house-made roasted hazelnut praline and oat milk.",
    img: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: 3,
    name: "Avocado Sourdough Tartine",
    category: "breakfast",
    price: 380,
    veg: true,
    tag: "Chef's Pick",
    desc: "Smashed Hass avocado, whipped feta, chili crisp, and microgreens on toasted sourdough.",
    img: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: 4,
    name: "Truffle Scrambled Eggs & Brioche",
    category: "breakfast",
    price: 410,
    veg: false,
    tag: "Morning Favorite",
    desc: "Soft-folded free-range eggs, black truffle butter, and chives on warm brioche.",
    img: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: 5,
    name: "Wood-Fired Margherita Pizza",
    category: "mains",
    price: 490,
    veg: true,
    tag: "Bestseller",
    desc: "48-hour fermented dough, San Marzano tomato sauce, fresh buffalo mozzarella, and basil.",
    img: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: 6,
    name: "Herb-Grilled Chicken Bowl",
    category: "mains",
    price: 540,
    veg: false,
    tag: "High Protein",
    desc: "Charred rosemary chicken, herbed quinoa, roasted peppers, and lemon tahini dressing.",
    img: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: 7,
    name: "Burnt Basque Cheesecake",
    category: "desserts",
    price: 340,
    veg: true,
    tag: "Signature",
    desc: "Caramelized crust with a velvety, custard-like center served with berry compote.",
    img: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: 8,
    name: "Dark Chocolate Sea Salt Tart",
    category: "desserts",
    price: 310,
    veg: true,
    tag: "Vegan",
    desc: "70% Belgian dark chocolate ganache in a crisp almond-cocoa shell.",
    img: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=700&q=80",
  },
];

let activeCategory = "all";
let vegOnly = false;
let searchQuery = "";
let selectedTime = "10:00 AM";
const cart = new Map();

const menuGrid = document.getElementById("menuGrid");
const cartCount = document.getElementById("cartCount");
const cartItemsEl = document.getElementById("cartItems");
const cartSubtotalEl = document.getElementById("cartSubtotal");
const cartTaxEl = document.getElementById("cartTax");
const cartTotalEl = document.getElementById("cartTotal");
const cartDrawer = document.getElementById("cartDrawer");
const cartBackdrop = document.getElementById("cartBackdrop");
const toastEl = document.getElementById("toast");

function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add("show");
  setTimeout(() => toastEl.classList.remove("show"), 2600);
}

function renderMenu() {
  const filtered = MENU_ITEMS.filter((item) => {
    const matchCategory = activeCategory === "all" || item.category === activeCategory;
    const matchVeg = !vegOnly || item.veg;
    const matchSearch =
      item.name.toLowerCase().includes(searchQuery) ||
      item.desc.toLowerCase().includes(searchQuery);
    return matchCategory && matchVeg && matchSearch;
  });

  if (filtered.length === 0) {
    menuGrid.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:var(--muted);">No dishes match your filter. Try clearing the search.</p>`;
    return;
  }

  menuGrid.innerHTML = filtered
    .map(
      (item) => `
      <article class="menu-card">
        <img class="menu-img" src="${item.img}" alt="${item.name}" loading="lazy" />
        <div class="menu-body">
          <div class="menu-meta">
            <span class="diet-badge ${item.veg ? "" : "nonveg"}">${item.veg ? "● VEG" : "▲ NON-VEG"}</span>
            <span>${item.tag}</span>
          </div>
          <h3 class="menu-title">${item.name}</h3>
          <p class="menu-desc">${item.desc}</p>
          <div class="menu-footer">
            <span class="price">${CAFE_CONFIG.currency}${item.price}</span>
            <button class="btn btn-outline btn-sm" onclick="addToCart(${item.id})">+ Add</button>
          </div>
        </div>
      </article>
    `
    )
    .join("");
}

function addToCart(id) {
  const item = MENU_ITEMS.find((m) => m.id === id);
  if (!item) return;
  const existing = cart.get(id);
  cart.set(id, existing ? { ...existing, qty: existing.qty + 1 } : { ...item, qty: 1 });
  updateCartUI();
  showToast(`Added ${item.name} to your order`);
}

function changeQty(id, delta) {
  const existing = cart.get(id);
  if (!existing) return;
  const nextQty = existing.qty + delta;
  if (nextQty <= 0) {
    cart.delete(id);
  } else {
    cart.set(id, { ...existing, qty: nextQty });
  }
  updateCartUI();
}

function updateCartUI() {
  let totalItems = 0;
  let subtotal = 0;

  if (cart.size === 0) {
    cartItemsEl.innerHTML = `<p style="color:var(--muted);text-align:center;margin-top:40px;">Your order is empty. Add dishes from the menu!</p>`;
  } else {
    cartItemsEl.innerHTML = Array.from(cart.values())
      .map((item) => {
        totalItems += item.qty;
        subtotal += item.price * item.qty;
        return `
          <div class="cart-item">
            <div>
              <strong>${item.name}</strong>
              <div style="font-size:0.85rem;color:var(--muted);">${CAFE_CONFIG.currency}${item.price} × ${item.qty}</div>
            </div>
            <div class="qty-controls">
              <button class="qty-btn" onclick="changeQty(${item.id}, -1)">-</button>
              <span>${item.qty}</span>
              <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
            </div>
          </div>
        `;
      })
      .join("");
  }

  const tax = Math.round(subtotal * CAFE_CONFIG.gstRate);
  const total = subtotal + tax;

  cartCount.textContent = totalItems;
  cartSubtotalEl.textContent = `${CAFE_CONFIG.currency}${subtotal}`;
  cartTaxEl.textContent = `${CAFE_CONFIG.currency}${tax}`;
  cartTotalEl.textContent = `${CAFE_CONFIG.currency}${total}`;
}

function toggleCart(open) {
  cartDrawer.classList.toggle("open", open);
  cartBackdrop.classList.toggle("open", open);
}

// Event Listeners
document.getElementById("categoryTabs").addEventListener("click", (e) => {
  if (!e.target.classList.contains("tab-btn")) return;
  document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
  e.target.classList.add("active");
  activeCategory = e.target.dataset.category;
  renderMenu();
});

document.getElementById("vegOnlyToggle").addEventListener("change", (e) => {
  vegOnly = e.target.checked;
  renderMenu();
});

document.getElementById("menuSearch").addEventListener("input", (e) => {
  searchQuery = e.target.value.trim().toLowerCase();
  renderMenu();
});

document.getElementById("openCartBtn").addEventListener("click", () => toggleCart(true));
document.getElementById("closeCartBtn").addEventListener("click", () => toggleCart(false));
cartBackdrop.addEventListener("click", () => toggleCart(false));

document.getElementById("openReserveBtn").addEventListener("click", () => {
  document.getElementById("reserve").scrollIntoView({ behavior: "smooth" });
});
document.getElementById("heroReserveBtn").addEventListener("click", () => {
  document.getElementById("reserve").scrollIntoView({ behavior: "smooth" });
});

document.getElementById("menuToggle").addEventListener("click", () => {
  document.getElementById("navLinks").classList.toggle("open");
});

document.getElementById("timeSlots").addEventListener("click", (e) => {
  if (!e.target.classList.contains("slot-btn")) return;
  document.querySelectorAll(".slot-btn").forEach((b) => b.classList.remove("active"));
  e.target.classList.add("active");
  selectedTime = e.target.dataset.time;
});

document.getElementById("reserveForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("resName").value.trim();
  const guests = document.getElementById("resGuests").value;
  const date = document.getElementById("resDate").value;
  showToast(`Table confirmed for ${name} (${guests} guests) on ${date} at ${selectedTime}!`);
  e.target.reset();
});

document.getElementById("whatsappOrderBtn").addEventListener("click", () => {
  if (cart.size === 0) {
    showToast("Add at least one item before ordering!");
    return;
  }
  const lines = Array.from(cart.values()).map(
    (item) => `• ${item.name} x${item.qty} (${CAFE_CONFIG.currency}${item.price * item.qty})`
  );
  const total = cartTotalEl.textContent;
  const msg = encodeURIComponent(
    `Hi ${CAFE_CONFIG.name}! I'd like to place a pickup order:\n\n${lines.join("\n")}\n\nTotal (incl. GST): ${total}`
  );
  window.open(`https://wa.me/${CAFE_CONFIG.whatsappNumber}?text=${msg}`, "_blank");
});

// Set default reservation date to today
document.getElementById("resDate").valueAsDate = new Date();

renderMenu();
updateCartUI();
