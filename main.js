// window.addEventListener("load", () => {
//   const tl = gsap.timeline();

//   // logo fade in
//   tl.to("#loader-logo", {
//     opacity: 1,
//     scale: 1,
//     duration: 1.2,
//     ease: "power2.out"
//   });
//   roll up preloader
//   tl.to("#preloader", {
//     y: '-100%', // Move the preloader up off the screen
//     duration: 1,
//     ease: "power1.out",
//     onComplete: () => {
//       document.getElementById("preloader").style.display = "none";
//       document.getElementById("content").style.display = "block"; // Show the content after preloader
//       ScrollTrigger.refresh();
//   }}, "+=2.5");

//   Show content normally (or add a rolling effect you desire)
//   tl.fromTo("#content",
//     {
//       y: 100, // Start below its final position
//       opacity: 1 // Keep it visible instantly or adjust as needed
//     },
//     {
//       y: 0, // End at its original position
//       duration: 1.4,
//       ease: "power3.out",
//       clearProps: "filter",
//       });
// });

window.addEventListener("load", () => {
  if (typeof gsap === 'undefined' || !document.querySelector('.carousel-track')) return;
  gsap.registerPlugin(ScrollTrigger);
  //   ScrollTrigger.addEventListener("refreshInit", () => {
  //   console.log("🔄 ScrollTrigger refreshInit");
  // });

  // ScrollTrigger.addEventListener("refresh", () => {
  //   console.log("✅ ScrollTrigger refresh");
  // });
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
  requestAnimationFrame(() => {//Giving appropiate time for the content with animation (carousels) to be visible
    requestAnimationFrame(() => {
      ScrollTrigger.refresh(true); // Force a full refresh
      // Initialize carousel animations AFTER content is visible and measurements are correct
      if (typeof initCarouselAnimations === 'function') {
        initCarouselAnimations();
      }
    });
  });
  // ROLL UP CONTENT
  tl.fromTo("#content",
    {
      opacity: 0,
      // y: 100 // Start 100 pixels below its final position
    },
    {
      opacity: 1,
      // y: 0, // End at its original position
      duration: 3,
      ease: "power3.out",
      clearProps: "y,transform", // Only clear transform, keep opacity:1 (CSS has opacity:0)
      onComplete: () => {
        // Set opacity directly on the element to override CSS
        document.getElementById("content").style.opacity = "1";
      }
    }
  );
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
  let smoother = ScrollSmoother.create({
    wrapper: '#scroll-wrapper',
    content: '#scroll-content',
    smooth: 1.7,
    // effects: true
  });
  let button = document.querySelector('.hero-scroll-btn');
  button.addEventListener("click", (e) => {
    smoother.scrollTo(".site-header", true, "top top");
  });
  // Pin the header at the top once it reaches there (replaces CSS sticky)
  ScrollTrigger.create({
    trigger: ".site-header",
    start: "top top",
    end: "max",
    pin: true,
    pinSpacing: false,
    // markers: true
  });
  // Theme toggle for Logo and site
  (function () {
    const toggle = document.getElementById('theme-toggle');
    const logoImg = document.querySelector('.brand .logo-image img');
    const DARK_LOGO = 'SU-LOGO-web.svg';
    const LIGHT_LOGO = 'SU-LOGO-web-W.svg';
    const header = document.querySelector('.site-header');

    function setTheme(isLight, animate = false) {
      // Only toggle 'light-mode' - dark is the default via :root
      document.documentElement.classList.toggle('light-mode', isLight);

      if (logoImg) {
        const newSrc = isLight ? DARK_LOGO : LIGHT_LOGO;
        const newAlt = isLight ? 'Dark-Image-Logo' : 'Light-Image-Logo';
        // Toggle header light mode
        if (header) {
          header.classList.toggle('white', isLight);

        }
        if (animate && typeof gsap !== 'undefined') {
          // Fade out, swap image, fade in
          gsap.to(logoImg, {
            opacity: 0,
            duration: 0.2,
            ease: 'power1.inOut',
            onComplete: () => {
              logoImg.src = newSrc;
              logoImg.alt = newAlt;
              gsap.to(logoImg, {
                opacity: 1,
                duration: 0.2,
                ease: 'power1.inOut'
              });
            }
          });
        } else {
          // No animation on initial load
          logoImg.src = newSrc;
          logoImg.alt = newAlt;
        }
      }

      try { localStorage.setItem('siteTheme', isLight ? 'light' : 'dark'); } catch (e) { }
    }

    // initialize from saved preference or system preference
    const saved = localStorage.getItem('siteTheme');
    const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
    setTheme(saved ? saved === 'light' : prefersLight);

    if (toggle) {
      toggle.addEventListener('click', () => {
        const nowLight = !document.documentElement.classList.contains('light-mode');
        setTheme(nowLight, true); // animate on user click
      });
    }
  })();

  // Text rotator in hero
  const items = Array.from(document.querySelectorAll('.rotator-item'));
  const inner = document.querySelector('.rotator-inner');

  if (inner && items.length) {
    let idx = 0;

    // Set initial width
    inner.style.width = `${items[idx].offsetWidth}px`;

    setInterval(() => {
      items[idx].classList.remove('is-active');
      idx = (idx + 1) % items.length;
      items[idx].classList.add('is-active');
      inner.style.width = `${items[idx].offsetWidth}px`;
    }, 2200);
  }


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

  // Mobile menu (placeholder)
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');
  if (toggle) {
    toggle.addEventListener('click', () => {
      nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
    });
  }


  const el = document.querySelector('.reveal-text'); //Retreat text element from HTML
  const text = el.textContent; //Only take the text content (no HTML)
  el.textContent = ''; //Remove text nodes making them splittable

  const chars = [];

  [...text].forEach(char => {
    const span = document.createElement('span');
    span.textContent = char === ' ' ? '\u00A0' : char;
    span.style.display = 'inline-block';
    el.appendChild(span);
    chars.push(span);
  });

  // GSAP animation with ScrollTrigger - animates when scrolling to the element
  const t2 = gsap.timeline({ paused: false });

  t2.fromTo(
    chars,
    { y: '1em', opacity: 0 },
    {
      y: '0em',
      opacity: 1,
      stagger: 0.05,
      duration: 0.6,
      ease: 'power3.out'
    }
  );
  ScrollTrigger.create({
    trigger: el,
    start: 'top 100%',
    end: 'bottom 10%',

    onEnter: () => {
      t2.restart();
    },

    onEnterBack: () => {
      t2.restart();
    },

    onLeave: () => {
      t2.pause(0); // reset to start (hidden)
    },

    onLeaveBack: () => {
      t2.pause(0); // reset to start (hidden)
    }
  });



  // Function to initialize the carousel animations
  // Must be called AFTER content is visible (display: block)
  function initCarouselAnimations() {
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
          // markers: true
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
          anticipatePin: 1,
          invalidateOnRefresh: true, // Recalculate on window resize
          // markers: true
        }
      });
    }
  }

  // Expose the function so it can be called after preloader
  window.initCarouselAnimations = initCarouselAnimations;
  // ...existing code...
});
