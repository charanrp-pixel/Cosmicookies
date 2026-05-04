// ============================================================
//   COSMICUPCAKES BRACELETS – script.js
// ============================================================

// ---------- Navbar scroll effect ----------
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});

// ---------- Hamburger / Mobile Menu ----------
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
const closeMenu  = document.getElementById('close-menu');

hamburger.addEventListener('click', () => {
  mobileMenu.classList.add('open');
  document.body.style.overflow = 'hidden';
});
closeMenu.addEventListener('click', closeMobile);
mobileMenu.querySelectorAll('.mobile-nav-link').forEach(link => {
  link.addEventListener('click', closeMobile);
});
function closeMobile() {
  mobileMenu.classList.remove('open');
  document.body.style.overflow = '';
}

// ---------- Global Cart System ----------
let cart = JSON.parse(localStorage.getItem('cartItems') || '[]');
const cartBadge = document.getElementById('cart-count');

// Inject Cart HTML into every page
const cartHTML = `
  <div class="cart-overlay-bg" id="cart-overlay"></div>
  <div class="cart-sidebar" id="cart-sidebar">
    <div class="cart-sidebar-header">
      <h2>Your Cart</h2>
      <button class="cart-close-btn" id="cart-close">✕</button>
    </div>
    <div class="cart-sidebar-items" id="cart-items-container">
      <!-- Items render here -->
    </div>
    <div class="cart-sidebar-footer">
      <div class="cart-total-row">
        <span class="cart-total-label">Total:</span>
        <span class="cart-total-value" id="cart-total-price">₹0</span>
      </div>
      <button class="btn-primary full-width" onclick="alert('Checkout coming soon!')">PROCEED TO CHECKOUT</button>
    </div>
  </div>
`;
document.body.insertAdjacentHTML('beforeend', cartHTML);

const cartSidebar = document.getElementById('cart-sidebar');
const cartOverlay = document.getElementById('cart-overlay');
const cartItemsContainer = document.getElementById('cart-items-container');
const cartTotalPrice = document.getElementById('cart-total-price');

// Open / Close Cart
function openCart() {
  renderCart();
  cartSidebar.classList.add('open');
  cartOverlay.classList.add('show');
  document.body.style.overflow = 'hidden';
}
function closeCart() {
  cartSidebar.classList.remove('open');
  cartOverlay.classList.remove('show');
  document.body.style.overflow = '';
}

document.querySelectorAll('.cart-btn').forEach(btn => btn.addEventListener('click', openCart));
document.getElementById('cart-close').addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

// Update Badge
function updateCartBadge() {
  const count = cart.length;
  if(cartBadge) {
    cartBadge.textContent = count;
    cartBadge.style.transform = 'scale(1.6)';
    setTimeout(() => { cartBadge.style.transform = 'scale(1)'; }, 220);
  }
}

// Render Cart Items
function renderCart() {
  cartItemsContainer.innerHTML = '';
  let total = 0;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<p class="cart-empty-msg">Your cart is empty.</p>';
  } else {
    cart.forEach((item, index) => {
      // price string like "₹69" -> integer
      const priceNum = parseInt(item.price.replace(/[^0-9]/g, '')) || 0;
      total += priceNum;

      const div = document.createElement('div');
      div.className = 'cart-item';
      div.innerHTML = `
        <img src="${item.img}" alt="${item.name}" class="cart-item-img"/>
        <div class="cart-item-info">
          <p class="cart-item-title">${item.name}</p>
          <p class="cart-item-meta">Size: ${item.size} <br/>Color: ${item.color || 'Standard'}</p>
          <p class="cart-item-price">${item.price}</p>
        </div>
        <button class="cart-item-remove" onclick="removeFromCart(${index})">✕</button>
      `;
      cartItemsContainer.appendChild(div);
    });
  }

  cartTotalPrice.textContent = '₹' + total.toLocaleString('en-IN');
  updateCartBadge();
}

// Add to Cart
window.addToCart = function(item) {
  cart.push(item);
  localStorage.setItem('cartItems', JSON.stringify(cart));
  updateCartBadge();
  openCart(); // Show cart when item added
}

// Remove from Cart
window.removeFromCart = function(index) {
  cart.splice(index, 1);
  localStorage.setItem('cartItems', JSON.stringify(cart));
  renderCart();
}

// Init badge on load
updateCartBadge();

// ---------- Contact Form ----------
function handleSubmit(e) {
  e.preventDefault();
  const btn     = document.getElementById('submit-btn');
  const success = document.getElementById('form-success');

  btn.textContent = 'Sending...';
  btn.disabled    = true;
  btn.style.opacity = '0.75';

  setTimeout(() => {
    btn.innerHTML = '✓ &nbsp;Request Sent!';
    btn.style.background = '#7a9e7e';
    success.classList.add('show');
    e.target.reset();

    setTimeout(() => {
      btn.innerHTML = `SEND ORDER REQUEST <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`;
      btn.disabled       = false;
      btn.style.opacity  = '1';
      btn.style.background = '';
      success.classList.remove('show');
    }, 4500);
  }, 1600);
}

// ---------- Scroll-reveal animations ----------
document.addEventListener('DOMContentLoaded', () => {


  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity   = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.10, rootMargin: '0px 0px -40px 0px' });

  const revealEls = document.querySelectorAll(
    '.product-card, .pricing-card, .badge-item, .contact-form'
  );
  revealEls.forEach((el, i) => {
    el.style.opacity    = '0';
    el.style.transform  = 'translateY(28px)';
    el.style.transition = `opacity 0.65s ease ${i * 0.07}s, transform 0.65s ease ${i * 0.07}s, box-shadow 0.35s ease, transform 0.35s ease`;
    observer.observe(el);
  });
});

// ---------- Active nav on scroll ----------
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 130) current = sec.getAttribute('id');
  });
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) link.classList.add('active');
  });
});
