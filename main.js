window.addEventListener("load", () => {

  if (typeof gsap === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger, Observer, ScrollSmoother);
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
  // gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
  let smoother = ScrollSmoother.create({
    wrapper: '#scroll-wrapper',
    content: '#scroll-content',
    smooth: 1.7,
    // effects: true
  });

function scrollToStoredTargetIfAny() {
  const targetId = sessionStorage.getItem('scrollTarget');
  if (!targetId) return;
  sessionStorage.removeItem('scrollTarget');

  const el = document.querySelector(targetId);
  if (el) smoother.scrollTo(el, false, "top 80px");
}
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      ScrollTrigger.refresh(true);
        scrollToStoredTargetIfAny();
    });
  });

  const button = document.querySelector('.hero-scroll-btn');
  if (button) {
    button.addEventListener("click", () => {
      smoother.scrollTo(".site-header", true, "top top");
    });
  }
  // Smooth scroll for ALL anchor links to work with ScrollSmoother
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (!targetId) return;
      e.preventDefault();

      if (targetId === '#') {
        // history.pushState(null, "", "#");
        smoother.scrollTo(0, true);
        return;
      }
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        // Use smoother for transform-based scrolling
        smoother.scrollTo(targetElement, false, "top 80px");
      }
    });
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
  // Auto-scroll past hero video when user starts scrolling
  // This makes a small scroll jump to the header (like clicking Explore)
  let heroSnapped = false;
  let pageReady = false; // Prevent snap on page load/refresh
  // Wait 1.5 seconds after page load before enabling snap
  setTimeout(() => {
    pageReady = true;
  }, 1500);

  ScrollTrigger.create({
    trigger: ".hero-fullscreen",
    start: "top top",
    end: "bottom 90%",
    onLeave: () => {
      if (heroSnapped || !pageReady) return;
      heroSnapped = true;
      // stop smooth momentum from carrying past your target
      smoother.paused(true);
      // do the snap (instant jump within paused state)
      smoother.scrollTo(".site-header", true, "top top");
      // resume after it lands
      gsap.delayedCall(0.2, () => smoother.paused(false));
    },
    onEnterBack: () => {
      heroSnapped = false;
    }
  });

  // Theme toggle for Logo and site
  (function () {
    const toggle = document.getElementById('theme-toggle');
    const logoHeaderImg = document.querySelector('.brand .logo-header-image img');
    const heroLogoImg = document.querySelector('.hero-image img');
    const SolidHeading = document.querySelector('.animated-text .heading--solid');
    const TransparentHeading = document.querySelector('.animated-text .heading--transparent');
    const header = document.querySelector('.site-header');
    const DARK_HEADER_LOGO = 'SU-LOGO-web.svg';
    const LIGHT_HEADER_LOGO = 'SU-LOGO-web-W.svg';
    const DARK_HERO_LOGO = 'SU-EN-LOGO-typo.png';
    const LIGHT_HERO_LOGO = 'SU-EN-LOGO-typo-BLACK.png';

    function setTheme(isLight, animate = false) {
      // Only toggle 'light-mode' - dark is the default via :root
      document.documentElement.classList.toggle('light-mode', isLight);

      //Animated Text Color Switching
      if (SolidHeading) {
        if (animate && typeof gsap !== "undefined") {
          gsap.to(SolidHeading, {
            opacity: 0,
            duration: 0.2,
            ease: "power1.inOut",
            onComplete: () => {
              // swap while invisible
              SolidHeading.classList.toggle("heading--solid-black", isLight);
              TransparentHeading.classList.toggle("heading--transparent-black", isLight);
              gsap.to(SolidHeading, {
                opacity: 1,
                duration: 0.2,
                ease: "power1.inOut",
              });
            },
          });
        } else {
          // no animation on load
          SolidHeading.classList.toggle("heading--solid-black", isLight);
        }
      }
      
      // Header logo switching
      if (logoHeaderImg) {
        const newSrc = isLight ? DARK_HEADER_LOGO : LIGHT_HEADER_LOGO;
        const newAlt = isLight ? 'Dark-Image-header-Logo' : 'Light-Image-header-Logo';
        // Toggle header light mode
        if (header) {
          header.classList.toggle('white', isLight);
        }
        if (animate && typeof gsap !== 'undefined') {
          // Fade out, swap image, fade in
          gsap.to(logoHeaderImg, {
            opacity: 0,
            duration: 0.2,
            ease: 'power1.inOut',
            onComplete: () => {
              logoHeaderImg.src = newSrc;
              logoHeaderImg.alt = newAlt;
              gsap.to(logoHeaderImg, {
                opacity: 1,
                duration: 0.2,
                ease: 'power1.inOut'
              });
            }
          });
        } else {
          // No animation on initial load
          logoHeaderImg.src = newSrc;
          logoHeaderImg.alt = newAlt;
        }
      }

      // Hero logo switching
      if (heroLogoImg) {
        const newHeroSrc = isLight ? LIGHT_HERO_LOGO : DARK_HERO_LOGO;
        const newHeroAlt = isLight ? 'SU Logo Black' : 'SU Logo White';
        if (animate && typeof gsap !== 'undefined') {
          gsap.to(heroLogoImg, {
            opacity: 0,
            duration: 0.2,
            ease: 'power1.inOut',
            onComplete: () => {
              heroLogoImg.src = newHeroSrc;
              heroLogoImg.alt = newHeroAlt;
              gsap.to(heroLogoImg, {
                opacity: 1,
                duration: 0.2,
                ease: 'power1.inOut'
              });
            }
          });
        } else {
          heroLogoImg.src = newHeroSrc;
          heroLogoImg.alt = newHeroAlt;
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

  // // Text rotator in hero
  // const items = Array.from(document.querySelectorAll('.rotator-item'));
  // const inner = document.querySelector('.rotator-inner');

  // if (inner && items.length) {
  //   let idx = 0;

  //   // Set initial width
  //   inner.style.width = `${items[idx].offsetWidth}px`;

  //   setInterval(() => {
  //     items[idx].classList.remove('is-active');
  //     idx = (idx + 1) % items.length;
  //     items[idx].classList.add('is-active');
  //     inner.style.width = `${items[idx].offsetWidth}px`;
  //   }, 2200);
  // }


  // Fake search interaction
  // const input = document.getElementById('search');
  // const btn = document.getElementById('searchBtn');
  // if (btn && input) {
  //   btn.addEventListener('click', () => {
  //     btn.textContent = 'Searching…';
  //     btn.disabled = true;
  //     setTimeout(() => {
  //       btn.textContent = 'Search';
  //       btn.disabled = false;
  //       input.placeholder = 'Found: warm serif moodboards, type another query';
  //     }, 900);
  //   });
  // }

  // Mobile menu (placeholder)
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');
  if (toggle) {
    toggle.addEventListener('click', () => {
      nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
    });
  }
  // Function to split text content of an element into spans for each character
  function splitTextToSpans(el) {
    const text = el.textContent;//Only take the text content (no HTML)
    el.textContent = '';//Remove text nodes making them splittable

    const chars = [];

    [...text].forEach(char => {
      const span = document.createElement('span');//Turn the characters into spans (elements) for individual animation
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.style.display = 'inline-block';//To allow transform animations
      el.appendChild(span);//Insert spans back into the element in the DOM
      chars.push(span);//Keep track of all spans in an array
    });

    return chars;
  }

  //Text reveal animation - applies to ALL .reveal-text elements
  document.querySelectorAll('.reveal-text').forEach(el => {
    const chars = splitTextToSpans(el);

    // GSAP animation with ScrollTrigger - animates when scrolling to the element
    const t2 = gsap.timeline({ paused: true });

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
  });
// Animate "Our" then "Services" as one sequence (no extra scroll)
document.querySelectorAll('.animated-text').forEach(container => {
  const parts = container.querySelectorAll('.reveal-text-diagonal');
  if (!parts.length) return;

  // Build one timeline for the whole block
  const tl = gsap.timeline({ paused: true });

  parts.forEach((el) => {
    const chars = splitTextToSpans(el);

    // each word animates, then the next word starts right after
    tl.fromTo(
      chars,
      { y: '1em', opacity: 0 },
      {
        y: '0em',
        opacity: 1,
        stagger: 0.05,
        duration: 0.75,
        ease: 'power3.out'
      },
      '-=0.65' // start immediately after previous segment ends
    );
  });
  // One ScrollTrigger controls the whole sequence
  ScrollTrigger.create({
    trigger: container,      // trigger when the block enters view
    start: 'top 30%',
    end: 'bottom -30%',
    onEnter: () => tl.play(),
    onEnterBack: () => tl.play(),
    onLeave: () => tl.reverse(),
    onLeaveBack: () => tl.reverse()
  });
});

  // Function to initialize the carousel animations
  // Must be called AFTER content is visible (display: block)
  // function initCarouselAnimations() {
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
  const ANGLE_DEG = 8;
  const ANGLE = ANGLE_DEG * (Math.PI / 180);
  const START_BACK_X = 500; // your start offset
  const getTrackWidth = () => diagonalTrack.scrollWidth;
  const getXEnd = () => -(getTrackWidth() - window.innerWidth);
  const getXTravel = () => Math.abs(getXEnd() - START_BACK_X);
  // y = x * tan(theta)
  const getYEnd = () => -getXTravel() * Math.tan(ANGLE);

  gsap.set(diagonalTrack, { x: START_BACK_X, y: 0 });
  gsap.to(diagonalTrack, {
    x: () => getXEnd(),
    y: () => getYEnd(),
    ease: "none",
    scrollTrigger: {
      trigger: diagonalSection,
      start: "top top",
      end: () => "+=" + getXTravel(),   // match scroll distance to actual travel
      scrub: 1,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    }
  });
}
  // }
  // Expose the function so it can be called after preloader
  // window.initCarouselAnimations = initCarouselAnimations;
  // ...existing code...
});
