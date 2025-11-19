// Text rotator in hero
const items = Array.from(document.querySelectorAll('.rotator-item'));
const inner = document.querySelector('.rotator-inner');
let idx = 0;

// Set initial width
inner.style.width = `${items[idx].offsetWidth}px`;

setInterval(() => {
  items[idx].classList.remove('is-active'); 
  idx = (idx + 1) % items.length;
  items[idx].classList.add('is-active');

  // Adjust width smoothly to match the new word
  inner.style.width = `${items[idx].offsetWidth}px`;
}, 2200);


// Fake search interaction
const input = document.getElementById('search');
const btn = document.getElementById('searchBtn'); 
if (btn && input) {
  btn.addEventListener('click', () => {
    btn.textContent = 'Searching…';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = 'Search';
      btn.disabled = false;
      input.placeholder = 'Found: warm serif moodboards, type another query';
    }, 900);
  });
}

// theme-toggle.js
const toggleBtn = document.getElementById('theme-toggle');
const body = document.body;

// Load saved theme
if (localStorage.getItem('theme') === 'light') {
  body.classList.add('light-mode');
}

// Toggle theme
toggleBtn.addEventListener('click', () => {
  const isLight = body.classList.toggle('light-mode');
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
});

// Mobile menu (placeholder)
const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
if (toggle) {
  toggle.addEventListener('click', () => {
    nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
  });
}

window.addEventListener('load', () => {
  if (typeof gsap === 'undefined' || !document.querySelector('.carousel-track')) return;

// ...existing code...
  gsap.registerPlugin(ScrollTrigger);

  // Global extra offset for carousels (adjust px as needed)
   const extraOffset = 1000;

// Horizontal Scroll Case Carousel
  const horizontalTrack = document.querySelector('.horizontal-carousel .carousel-track');
    //To add animations to cards if needed
  const horizontalCards = gsap.utils.toArray('.horizontal-carousel .case-card');

  // total horizontal distance to scroll
  const totalHorizontalScroll = horizontalTrack.scrollWidth - window.innerWidth;

  
  gsap.to(horizontalTrack, {
   x: () => -totalHorizontalScroll + window.innerWidth * 0.05,
    ease: "none",
    scrollTrigger: {
      trigger: ".horizontal-carousel",
      start: "top top",
      end: () => `+=${totalHorizontalScroll}`, // scroll distance matches horizontal width + extra
      scrub: 1,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      markers: false
    }
  });
// Diagonal Scroll Case Carousel
const diagonalSection = document.querySelector('.diagonal-carousel');
const diagonalTrack = document.querySelector('.diagonal-carousel .carousel-track');

// 1. Calculate the full horizontal width of the track
const trackWidth = diagonalTrack.scrollWidth;
// 2. Calculate how much we need to move horizontally
const xMove = -(trackWidth - window.innerWidth);

// 3. Calculate the Vertical Rise needed
// We need to lift the track up so the end of it doesn't sink below the screen.
// The angle is roughly 15 degrees based on your CSS (adjust 0.26 if your angle is different).
// Math: tan(15 degrees) ≈ 0.268
const angleInRadians = 5 * (Math.PI / 180);
const yRise = (trackWidth * Math.sin(angleInRadians)); 

gsap.to(diagonalTrack, {
  x: xMove, // Move Left
  y: -yRise, // Move UP simultaneously
  ease: "none",
  scrollTrigger: {
    trigger: diagonalSection,
    start: "top top",
    end: () => "+=" + trackWidth, // Scroll distance matches track length
    scrub: 1,
    pin: true,
    invalidateOnRefresh: true, // Recalculate on window resize
  }
});
// ...existing code...
});

