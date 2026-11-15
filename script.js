/**
 * 💰 Smart Budget Shopper Kenya - Vanilla JS Logic
 * ---------------------------------------------
 * Fully functional logic for budget, cart, and recommendations.
 */

// 1. Data Definitions
const DATA = [
    { id: 1, name: "Jogoo Maize Flour", price: 145, category: "Food & Groceries", emoji: "🌾" },
    { id: 2, name: "KCC Fresh Milk 500ml", price: 75, category: "Food & Groceries", emoji: "🥛" },
    { id: 3, name: "Super Loaf Bread", price: 65, category: "Food & Groceries", emoji: "🍞" },
    { id: 4, name: "Kabras Sugar 1kg", price: 185, category: "Food & Groceries", emoji: "🍚" },
    { id: 5, name: "Rina Vegetable Oil 1L", price: 345, category: "Food & Groceries", emoji: "🛢️" },
    { id: 6, name: "Daawat Basmati Rice 1kg", price: 290, category: "Food & Groceries", emoji: "🍚" },
    { id: 7, name: "Sunlight Detergent 500g", price: 195, category: "Household Items", emoji: "🧼" },
    { id: 8, name: "Hanibi Toilet Paper", price: 220, category: "Household Items", emoji: "🧻" },
    { id: 9, name: "Steel Wool", price: 45, category: "Household Items", emoji: "🧶" },
    { id: 10, name: "Dettol Soap 175g", price: 110, category: "Personal Care", emoji: "🧼" },
    { id: 11, name: "Colgate Toothpaste", price: 165, category: "Personal Care", emoji: "🪥" },
    { id: 12, name: "Coca-Cola 500ml", price: 65, category: "Snacks & Drinks", emoji: "🥤" },
    { id: 13, name: "Tropical Heat Crisps", price: 120, category: "Snacks & Drinks", emoji: "🍟" },
    { id: 14, name: "Pampers Baby-Dry", price: 1450, category: "Baby Products", emoji: "👶" },
    { id: 15, name: "Baby Wipes", price: 250, category: "Baby Products", emoji: "🧻" },
    { id: 16, name: "Cerelac Wheat", price: 420, category: "Baby Products", emoji: "🥣" }
];

const RETAILERS = [
    { name: "Naivas Online", url: "https://naivas.online/", color: "#008148" },
    { name: "Quickmart Online", url: "https://quickmart.co.ke/", color: "#ea580c" },
    { name: "Carrefour Kenya", url: "https://www.carrefour.ke/", color: "#2563eb" }
];

// 2. Application State
let budget = 0;
let cart = [];
let selectedCategories = [];

// 3. Selectors
const budgetInput = document.getElementById('budgetInput');
const categoryCheckboxes = document.querySelectorAll('.category-check');
const generateBtn = document.getElementById('generateBtn');
const productGrid = document.getElementById('productGrid');
const cartToggle = document.getElementById('cartToggle');
const cartBadge = document.getElementById('cartBadge');
const cartModal = document.getElementById('cartModal');
const closeModal = document.getElementById('closeModal');
const cartItemsList = document.getElementById('cartItemsList');
const buyNowBtn = document.getElementById('buyNowBtn');
const checkoutModal = document.getElementById('checkoutModal');
const closeCheckout = document.getElementById('closeCheckout');
const retailersGrid = document.getElementById('retailersGrid');

// UI Budget Display
const displayBudget = document.getElementById('displayBudget');
const displayTotal = document.getElementById('displayTotal');
const displayRemaining = document.getElementById('displayRemaining');
const locationText = document.getElementById('locationText');

// 4. Initial Load
document.addEventListener('DOMContentLoaded', () => {
    loadPersistence();
    renderProducts();
    updateUI();
    detectLocation();
});

// 5. Core Functions

function loadPersistence() {
    const savedCart = localStorage.getItem('ke_shopper_cart');
    const savedBudget = localStorage.getItem('ke_shopper_budget');
    
    if (savedCart) cart = JSON.parse(savedCart);
    if (savedBudget) {
        budget = parseFloat(savedBudget);
        budgetInput.value = budget;
    }
}

function savePersistence() {
    localStorage.setItem('ke_shopper_cart', JSON.stringify(cart));
    localStorage.setItem('ke_shopper_budget', budget.toString());
}

function updateUI() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const balance = budget - total;
    
    displayBudget.textContent = budget.toLocaleString();
    displayTotal.textContent = total.toLocaleString();
    displayRemaining.textContent = balance.toLocaleString();
    
    cartBadge.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);

    // Color balance
    if (balance < 0) {
        displayRemaining.parentElement.style.color = '#ef4444';
    } else {
        displayRemaining.parentElement.style.color = 'white';
    }

    savePersistence();
}

function renderProducts() {
    productGrid.innerHTML = '';
    
    const filtered = DATA.filter(p => {
        const catMatch = selectedCategories.length === 0 || selectedCategories.includes(p.category);
        const priceMatch = p.price <= budget || budget === 0;
        return catMatch && priceMatch;
    });

    if (filtered.length === 0) {
        productGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 3rem;">No products found matching your budget and categories.</p>';
        return;
    }

    filtered.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-img">${product.emoji}</div>
            <div>
                <div class="product-name">${product.name}</div>
                <div class="product-cat">${product.category}</div>
            </div>
            <div class="product-footer">
                <div class="price">KES ${product.price}</div>
                <button class="btn btn-add" onclick="addToCart(${product.id})">Add +</button>
            </div>
        `;
        productGrid.appendChild(card);
    });
}

function addToCart(productId) {
    const product = DATA.find(p => p.id === productId);
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (total + product.price > budget && budget > 0) {
        alert("🚨 Budget Exceeded! You cannot add this item.");
        return;
    }

    const existing = cart.find(item => item.id === productId);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    updateUI();
    renderCart();
}

window.addToCart = addToCart; // Make global for onclick

function renderCart() {
    cartItemsList.innerHTML = '';
    
    if (cart.length === 0) {
        cartItemsList.innerHTML = '<p style="text-align: center; color: var(--text-muted); margin-top: 2rem;">Basket is empty.</p>';
        return;
    }

    cart.forEach(item => {
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>KES ${item.price} each</p>
            </div>
            <div class="cart-controls">
                <button class="ctrl-btn" onclick="updateQty(${item.id}, -1)">-</button>
                <span>${item.quantity}</span>
                <button class="ctrl-btn" onclick="updateQty(${item.id}, 1)">+</button>
            </div>
            <div class="cart-item-total">KES ${item.price * item.quantity}</div>
        `;
        cartItemsList.appendChild(div);
    });
}

function updateQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (item) {
        const currentTotal = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
        
        if (delta > 0 && currentTotal + item.price > budget && budget > 0) {
            alert("🚨 Budget Exceeded!");
            return;
        }

        item.quantity += delta;
        if (item.quantity <= 0) {
            cart = cart.filter(i => i.id !== id);
        }
    }
    updateUI();
    renderCart();
}
window.updateQty = updateQty;

// 6. Interaction Handlers

generateBtn.addEventListener('click', () => {
    const val = parseFloat(budgetInput.value);
    if (isNaN(val) || val < 0) {
        alert("Please enter a valid budget.");
        return;
    }
    budget = val;
    
    selectedCategories = [];
    categoryCheckboxes.forEach(cb => {
        if (cb.checked) selectedCategories.push(cb.value);
    });

    updateUI();
    renderProducts();
});

cartToggle.addEventListener('click', () => {
    renderCart();
    cartModal.style.display = 'flex';
});

closeModal.addEventListener('click', () => {
    cartModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === cartModal) cartModal.style.display = 'none';
    if (e.target === checkoutModal) checkoutModal.style.display = 'none';
});

buyNowBtn.addEventListener('click', () => {
    if (cart.length === 0) return;
    
    cartModal.style.display = 'none';
    checkoutModal.style.display = 'flex';
    
    retailersGrid.innerHTML = '';
    RETAILERS.forEach(market => {
        const btn = document.createElement('button');
        btn.className = 'market-btn';
        btn.innerHTML = `
            <div>
                <div class="market-name">${market.name}</div>
                <div class="market-url">${market.url}</div>
            </div>
            <div style="width: 10px; height: 10px; border-radius: 50%; background: ${market.color};"></div>
        `;
        btn.onclick = () => {
            window.open(market.url, '_blank');
        };
        retailersGrid.appendChild(btn);
    });
});

closeCheckout.addEventListener('click', () => {
    checkoutModal.style.display = 'none';
});

// 7. Location Detection
function detectLocation() {
    if ("geolocation" in navigator) {
        locationText.textContent = "Detecting your location...";
        navigator.geolocation.getCurrentPosition((pos) => {
            locationText.textContent = "📍 You are shopping from Kenya";
            // Mock suggestion
            const stores = ["Naivas Westlands", "Quickmart Kilimani", "Carrefour Junction"];
            const random = stores[Math.floor(Math.random() * stores.length)];
            locationText.textContent += ` • Nearest: ${random}`;
        }, () => {
            locationText.textContent = "📍 You are shopping from Kenya";
        });
    } else {
        locationText.textContent = "📍 You are shopping from Kenya";
    }
}
