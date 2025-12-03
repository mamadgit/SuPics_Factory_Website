window.addEventListener("load", () => {
  const tl = gsap.timeline();
  // logo fade in
  tl.to("#loader-logo", {
    opacity: 1,
    scale: 1,
    duration: 1.2,
    ease: "power2.out"
  });
  // fade out preloader
  tl.to("#preloader", {
    opacity: 0,
    duration: 1,
    ease: "power1.out",
    onComplete: () => {
      document.getElementById("preloader").style.display = "none";
      document.getElementById("content").style.display = "block"; // Show the content after preloader
    }
  }, "+=2.5");
// ROLL UP CONTENT
tl.fromTo("#content",
  {
    opacity: 0,
    y: 100 // Start 100 pixels below its final position
  },
  {
    opacity: 1,
    y: 0, // End at its original position
    duration: 1.4,
    ease: "power3.out",
    onComplete: () => {
      ScrollTrigger.refresh();
    }
  }
);

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

  if (typeof gsap === 'undefined' || !document.querySelector('.carousel-track')) return;
    // ...existing code...
    gsap.registerPlugin(ScrollTrigger);
    // Global extra offset for carousels (adjust px as needed)
    const extraOffset = 1000;
    // Horizontal Scroll Case Carousel
    const horizontalTrack = document.querySelector('.horizontal-carousel .carousel-track');
    if (horizontalTrack) {
      //To add animations to cards if needed
    const horizontalCards = gsap.utils.toArray('.horizontal-carousel .case-card');
    // Helper functions to recalculate values on resize
    const getHorizontalTrackWidth = () => horizontalTrack.scrollWidth;
    const getHorizontalScrollDistance = () => getHorizontalTrackWidth() - window.innerWidth;

    gsap.to(horizontalTrack, {
      x: () => -getHorizontalScrollDistance() + window.innerWidth * 0.05,
      ease: "none",
      scrollTrigger: {
        trigger: ".horizontal-carousel",
        start: "top top",
        end: () => `+=${getHorizontalScrollDistance()}`, // Dynamic scroll distance
        scrub: 1,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        markers: false
      }
    });
  }
  // Diagonal Scroll Case Carousel
  const diagonalSection = document.querySelector('.diagonal-carousel');
  if (diagonalSection) {
    const diagonalTrack = diagonalSection.querySelector('.carousel-track');

    // Helper functions to recalculate values on resize
    const getTrackWidth = () => diagonalTrack.scrollWidth;
    const getXMove = () => -(getTrackWidth() - window.innerWidth);
    const getYRise = () => {
      const angleInRadians = 5 * (Math.PI / 180);
      return getTrackWidth() * Math.sin(angleInRadians);
    };

    gsap.to(diagonalTrack, {
      x: getXMove, // Dynamic value
      y: () => -getYRise(), // Dynamic value
      ease: "none",
      scrollTrigger: {
        trigger: diagonalSection,
        start: "top top",
        end: () => "+=" + getTrackWidth(),
        scrub: 1,
        pin: true,
        invalidateOnRefresh: true, // Recalculate on window resize
      }
    });
  }
  // ...existing code...
});
