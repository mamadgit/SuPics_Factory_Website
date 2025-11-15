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

  gsap.registerPlugin(ScrollTrigger);

// Horizontal Scroll Case Carousel
  const horizontalTrack = document.querySelector('.horizontal-carousel .carousel-track');
    //To add animations to cards if needed
  const horizontalCards = gsap.utils.toArray('.horizontal-carousel .case-card');

  // total horizontal distance to scroll
  const totalHorizontalScroll = horizontalTrack.scrollWidth - window.innerWidth;

  gsap.to(horizontalTrack, {
   x: () => -totalHorizontalScroll,
    ease: "none",
    scrollTrigger: {
      trigger: ".horizontal-carousel",
      start: "top top",
      end: () => `+=${totalHorizontalScroll}`, // scroll distance matches horizontal width
      scrub: 1,                      // smooth scrubbing
      pin: true,                     // pins section during animation
      anticipatePin: 1,
      invalidateOnRefresh: true,     // recalculates on resize
      markers: false                 // set to true for debugging
    }
  });
// ...existing code...

// Diagonal Scroll Case Carousel
const diagonalTrack = document.querySelector('.diagonal-carousel .carousel-track');
// To add animations to cards if needed
const diagonalCards = gsap.utils.toArray('.diagonal-carousel .case-card');

// Total diagonal distance to scroll
const totalDiagonalScroll = diagonalTrack.scrollWidth - window.innerWidth;

// Extra offset for the last card (adjust as needed)
const extraOffset = 200; // px

gsap.to(diagonalTrack, {
  x: () => -totalDiagonalScroll + window.innerWidth * 0.05 - extraOffset,
  ease: "none",
  scrollTrigger: {
    trigger: ".diagonal-carousel",
    start: "top top",
    end: () => `+=${totalDiagonalScroll + extraOffset}`, // extend scroll distance
    scrub: 1,
    pin: true,
    anticipatePin: 1,
    invalidateOnRefresh: true,
    markers: false
  }
});
// ...existing code...
});

