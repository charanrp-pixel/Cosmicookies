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

// ---------- Cart ----------
let cartCount = 0;
const cartBadge = document.getElementById('cart-count');
const cartToast = document.getElementById('cart-toast');
let toastTimer;

function addToCart(name, price) {
  cartCount++;
  cartBadge.textContent = cartCount;

  // Pulse animation on badge
  cartBadge.style.transform = 'scale(1.6)';
  setTimeout(() => { cartBadge.style.transform = 'scale(1)'; }, 220);

  // Show toast
  clearTimeout(toastTimer);
  cartToast.innerHTML = `<strong>${name}</strong> added to cart &nbsp;✦&nbsp; ₹${price.toLocaleString('en-IN')}`;
  cartToast.classList.add('show');
  toastTimer = setTimeout(() => cartToast.classList.remove('show'), 3200);
}

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
