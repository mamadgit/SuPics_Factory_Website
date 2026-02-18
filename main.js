// Run ASAP so the correct preloader shows immediately
(() => {
  let saved = null;
  try { saved = localStorage.getItem("siteTheme"); } catch (e) {}

  const prefersLight =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: light)").matches;

  const isLight = saved ? saved === "light" : prefersLight;
  document.documentElement.classList.toggle("light-mode", isLight);
})();

window.addEventListener("load", () => {
  if (typeof gsap === "undefined") return;

  const activePreloaderId = document.documentElement.classList.contains("light-mode")
    ? "preloader-light"
    : "preloader";

  const activePreloader = document.getElementById(activePreloaderId);

  gsap.registerPlugin(ScrollTrigger, Observer, ScrollSmoother);

  const tl = gsap.timeline();

  tl.to("#loader-logo", {
    opacity: 1,
    scale: 1,
    duration: 1.2,
    ease: "power2.out"
  });

  tl.to(activePreloader, {
    opacity: 0,
    duration: 1,
    ease: "power1.out",
    onComplete: () => {
      // hide BOTH (in case)
      const p1 = document.getElementById("preloader");
      const p2 = document.getElementById("preloader-light");
      if (p1) p1.style.display = "none";
      if (p2) p2.style.display = "none";

      document.getElementById("content").style.display = "block";
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
    smooth: 1.7
    // effects: true
  });
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      ScrollTrigger.refresh(true);
        scrollToStoredTargetIfAny();
    });
  });
  
function scrollToStoredTargetIfAny() {
  // 1) Prefer sessionStorage (your custom navigation)
  let targetId = sessionStorage.getItem("scrollTarget");

  // 2) If none, fall back to the URL hash (new tab / direct link)
  if (!targetId && window.location.hash) {
    targetId = window.location.hash; // includes the leading #
  }

  if (!targetId) return;

  // Clean sessionStorage (only if it came from there)
  sessionStorage.removeItem("scrollTarget"); //This allows refreshing from URL to land back on the hash

  const el = document.querySelector(targetId);
  if (!el) return;

  // Scroll (ScrollSmoother if available, otherwise native)
  if (typeof smoother !== "undefined" && smoother) {
    smoother.scrollTo(el, false, "top 80px");
  } else {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // Remove the hash from the URL (keeps the page position)
  if (window.location.hash) {
    history.replaceState(null, "", window.location.pathname + window.location.search);
  }
}

  // Pin the header at the top once it reaches there (replaces CSS sticky)
  ScrollTrigger.create({
    trigger: ".site-header",
    start: "top top",
    end: "max",
    pin: true,
    pinSpacing: false,
    // markers: true
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
    const SolidHeadings = Array.from(document.querySelectorAll('.animated-text .heading--solid'));
    const TransparentHeadings = Array.from(document.querySelectorAll('.animated-text .heading--transparent'));
    const header = document.querySelector('.site-header');
    const DARK_HEADER_LOGO = 'SU-LOGO-web.svg';
    const LIGHT_HEADER_LOGO = 'SU-LOGO-web-W.svg';
    const DARK_HERO_LOGO = 'SU-EN-LOGO-typo.png';
    const LIGHT_HERO_LOGO = 'SU-EN-LOGO-typo-BLACK.png';

    function setTheme(isLight, animate = false) {
      // Only toggle 'light-mode' - dark is the default via :root
      document.documentElement.classList.toggle('light-mode', isLight);

      // Animated Text Color Switching (apply to all matching headings)
      if (SolidHeadings.length || TransparentHeadings.length) {
        if (animate && typeof gsap !== "undefined") {
          gsap.to(SolidHeadings, {
            opacity: 0,
            duration: 0.2,
            ease: "power1.inOut",
            onComplete: () => {
              SolidHeadings.forEach(el => el.classList.toggle("heading--solid-black", isLight));
              TransparentHeadings.forEach(el => el.classList.toggle("heading--transparent-black", isLight));
              gsap.to(SolidHeadings, {
                opacity: 1,
                duration: 0.2,
                ease: "power1.inOut",
              });
            },
          });
        } else {
          SolidHeadings.forEach(el => el.classList.toggle("heading--solid-black", isLight));
          TransparentHeadings.forEach(el => el.classList.toggle("heading--transparent-black", isLight));
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
  // const toggle = document.querySelector('.menu-toggle');
  // const nav = document.querySelector('.nav');
  // if (toggle) {
  //   toggle.addEventListener('click', () => {
  //     nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
  //   });
  // }

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
  const toggleSmoother = (state) => {
  if (typeof smoother !== "undefined" && smoother) {
    smoother.paused(state);
  }
};
// Resume smoother when animation finishes
tl.eventCallback("onComplete", () => toggleSmoother(false));
  // One ScrollTrigger controls the whole sequence
  ScrollTrigger.create({
    trigger: container,      // trigger when the block enters view
    start: 'top 10%',
    end: 'bottom',
  onEnter: () => {
    toggleSmoother(true);
    tl.restart(true); 
  },

  onEnterBack: () => {
    toggleSmoother(true);
    tl.restart(true); 
  },

  onLeave: () => {
    toggleSmoother(false);
    tl.reverse(); // optional: reset so it never sits completed
  },

  onLeaveBack: () => {
    toggleSmoother(false);
    tl.reverse();
  },
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
  
// const section = document.querySelector(".typography");
// if (!section) return;
// const wrap = section.querySelector(".animated-text");
// const our = section.querySelector(".word-our");
// const services = section.querySelector(".word-services");

// if (!wrap || !our || !services) return;
// // Initial off-screen state
// gsap.set([our, services], { opacity: 0 });
// gsap.set(our, { x: -200 });
// gsap.set(services, { x: 200 });
// // Timeline (paused by default)
// const typeTl = gsap.timeline({ paused: true });
// typeTl
//   .to(our, {
//     x: 0,
//     opacity: 1,
//     duration: 0.9,
//     ease: "power1.out"
//   })
//   .to(services, {
//     x: 0,
//     opacity: 1,
//     duration: 0.9,
//     ease: "power1.out"
//   });
// // Helper to safely pause/resume ScrollSmoother
// const toggleSmoother = (state) => {
//   if (typeof smoother !== "undefined" && smoother) {
//     smoother.paused(state);
//   }
// };
// // Resume smoother when animation finishes
// typeTl.eventCallback("onComplete", () => toggleSmoother(false));
// typeTl.eventCallback("onReverseComplete", () => toggleSmoother(false));

// ScrollTrigger.create({
//   trigger: section,
//   start: "top 50%",// when the top of section hits half of viewport
//   end: "bottom 50%",// when the bottom of section hits half of viewport 
//   onEnter: () => {
//     toggleSmoother(true);
//     typeTl.timeScale(1).restart(true); 
//   },

//   onEnterBack: () => {
//     toggleSmoother(true);
//     typeTl.timeScale(1).restart(true); 
//   },

//   onLeave: () => {
//     toggleSmoother(false);
//     typeTl.timeScale(3).reverse(); // optional: reset so it never sits completed
//   },

//   onLeaveBack: () => {
//     toggleSmoother(false);
//     typeTl.timeScale(3).reverse();
//   },

//    markers: true
// });

const section = document.querySelector(".hero-fullscreen.slogan");
const wrap = section?.querySelector(".animated-text");
const our = section?.querySelector(".word-our");
const services = section?.querySelector(".word-services");
const feelings = section?.querySelector(".word-feelings");

if (section && wrap && our && services) {
  gsap.set(our, { x: -200, opacity: 0 });
  gsap.set(services, { x: 200, opacity: 0 });
  gsap.set(feelings, { y: 200, opacity: 0 });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,        // pins .typography (the 100vh wrapper)
      start: "top top",
      end: "+=1500",
      scrub: 1,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      // markers: true,
    }
  });

  tl.to(our, { x: 0, opacity: 1, ease: "none", duration: 3 });
  tl.to(services, { x: 0, opacity: 1, ease: "none", duration: 3 });
  tl.to(feelings, { y: 0, opacity: 1, ease: "none", duration: 3 });
  tl.to({}, { duration: 2 });
  tl.addLabel("exit");
  tl.to(our, { x: -200, opacity: 0, ease: "none", duration: 3 }, "exit");
  tl.to(services, { x: 200, opacity: 0, ease: "none", duration: 3 }, "exit");
  tl.to(feelings, { y: 200, opacity: 0, ease: "none", duration: 3 }, "exit");
}
  // Diagonal Scroll Case Carousel
const diagonalSection = document.querySelector('.diagonal-carousel');
if (diagonalSection) {
  const diagonalTrack = diagonalSection.querySelector('.carousel-track');
  const ANGLE_DEG = 8;
  const ANGLE = ANGLE_DEG * (Math.PI / 180);
  const START_BACK_X = 150; // your start offset
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
      // markers: true,
    }
  });
}
  // }
  // Expose the function so it can be called after preloader
  // window.initCarouselAnimations = initCarouselAnimations;
  // ...existing code...
});
