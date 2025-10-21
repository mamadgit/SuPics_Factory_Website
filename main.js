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