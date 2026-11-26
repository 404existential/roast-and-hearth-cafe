const CAFE_CONFIG = {
  name: "KŌBŌ",
  whatsappNumber: "919876543210",
  currency: "₹",
  gstRate: 0.05,
};

const MENU_ITEMS = [
  {
    id: 1,
    name: "V60 Pour Over — Ratnagiri Estate",
    category: "coffee",
    price: 240,
    veg: true,
    note: "Washed • Bergamot, Dark Cocoa",
    img: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: 2,
    name: "Iced Hazelnut Cortado",
    category: "coffee",
    price: 260,
    veg: true,
    note: "Double Ristretto • House Praline",
    img: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: 3,
    name: "Avocado & Whipped Feta Tartine",
    category: "breakfast",
    price: 390,
    veg: true,
    note: "48h Sourdough • Chili Crisp",
    img: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: 4,
    name: "Truffle Folded Eggs on Brioche",
    category: "breakfast",
    price: 420,
    veg: false,
    note: "Free-Range Eggs • Chives",
    img: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: 5,
    name: "Wood-Fired Margherita",
    category: "mains",
    price: 510,
    veg: true,
    note: "San Marzano • Buffalo Mozzarella",
    img: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: 6,
    name: "Charred Rosemary Chicken Bowl",
    category: "mains",
    price: 560,
    veg: false,
    note: "Herbed Quinoa • Lemon Tahini",
    img: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: 7,
    name: "Burnt Basque Cheesecake",
    category: "desserts",
    price: 350,
    veg: true,
    note: "Madagascar Vanilla • Berry Compote",
    img: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: 8,
    name: "70% Dark Chocolate Sea Salt Tart",
    category: "desserts",
    price: 320,
    veg: true,
    note: "Vegan • Almond Cocoa Shell",
    img: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=500&q=80",
  },
];

let activeCategory = "all";
let vegOnly = false;
let searchQuery = "";
let selectedTime = "09:30";
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

function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  setTimeout(() => toastEl.classList.remove("show"), 2400);
}

function renderMenu() {
  const filtered = MENU_ITEMS.filter((item) => {
    const matchCategory = activeCategory === "all" || item.category === activeCategory;
    const matchVeg = !vegOnly || item.veg;
    const matchSearch =
      item.name.toLowerCase().includes(searchQuery) ||
      item.note.toLowerCase().includes(searchQuery);
    return matchCategory && matchVeg && matchSearch;
  });

  if (filtered.length === 0) {
    menuGrid.innerHTML = `<div style="grid-column:1/-1;padding:48px;text-align:center;color:var(--muted);">No items match your filter.</div>`;
    return;
  }

  menuGrid.innerHTML = filtered
    .map(
      (item) => `
      <article class="menu-row">
        <img class="menu-thumb" src="${item.img}" alt="${item.name}" loading="lazy" />
        <div class="menu-info">
          <div>
            <div class="menu-head">
              <h3>${item.name}</h3>
              <span class="menu-price">${CAFE_CONFIG.currency}${item.price}</span>
            </div>
            <p class="menu-desc">${item.note}</p>
          </div>
          <div class="menu-foot">
            <span class="diet-tag ${item.veg ? "" : "nonveg"}">${item.veg ? "VEG" : "NON-VEG"}</span>
            <button class="add-btn" onclick="addToCart(${item.id})">Add to Bag</button>
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
  showToast(`Added ${item.name}`);
}

function changeQty(id, delta) {
  const existing = cart.get(id);
  if (!existing) return;
  const nextQty = existing.qty + delta;
  if (nextQty <= 0) cart.delete(id);
  else cart.set(id, { ...existing, qty: nextQty });
  updateCartUI();
}

function updateCartUI() {
  let totalItems = 0;
  let subtotal = 0;

  if (cart.size === 0) {
    cartItemsEl.innerHTML = `<p style="color:var(--muted);margin-top:24px;">Your bag is empty.</p>`;
  } else {
    cartItemsEl.innerHTML = Array.from(cart.values())
      .map((item) => {
        totalItems += item.qty;
        subtotal += item.price * item.qty;
        return `
          <div class="bag-item">
            <div>
              <div style="font-weight:500;">${item.name}</div>
              <div class="mono-label">${CAFE_CONFIG.currency}${item.price} × ${item.qty}</div>
            </div>
            <div class="qty-wrap">
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

document.getElementById("categoryTabs").addEventListener("click", (e) => {
  if (!e.target.classList.contains("tab")) return;
  document.querySelectorAll(".tab").forEach((b) => b.classList.remove("active"));
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
  if (!e.target.classList.contains("slot")) return;
  document.querySelectorAll(".slot").forEach((b) => b.classList.remove("active"));
  e.target.classList.add("active");
  selectedTime = e.target.dataset.time;
});

document.getElementById("reserveForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("resName").value.trim();
  const guests = document.getElementById("resGuests").value;
  const date = document.getElementById("resDate").value;
  showToast(`Confirmed: ${name} (${guests} guests) • ${date} at ${selectedTime}`);
  e.target.reset();
});

document.getElementById("whatsappOrderBtn").addEventListener("click", () => {
  if (cart.size === 0) {
    showToast("Add items to your bag first.");
    return;
  }
  const lines = Array.from(cart.values()).map(
    (item) => `• ${item.name} x${item.qty} (${CAFE_CONFIG.currency}${item.price * item.qty})`
  );
  const msg = encodeURIComponent(
    `Hi ${CAFE_CONFIG.name}, pickup order:\n\n${lines.join("\n")}\n\nTotal (incl. GST): ${cartTotalEl.textContent}`
  );
  window.open(`https://wa.me/${CAFE_CONFIG.whatsappNumber}?text=${msg}`, "_blank");
});

// Scroll reveal
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("visible");
    });
  },
  { threshold: 0.12 }
);
document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

document.getElementById("resDate").valueAsDate = new Date();
renderMenu();
updateCartUI();
