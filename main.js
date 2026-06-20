// ===============================================
//#region   PRE-LOAD THEME INITIALIZATION
// ===============================================

// const { Touchscreen } = require("puppeteer");

// const { ScrollToPlugin } = require("gsap/all");

// Run ASAP so the correct preloader shows immediately
(() => {
  let saved = null;
  try { saved = localStorage.getItem("siteTheme"); } catch (e) { }
  const prefersLight =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: light)").matches;

  const isLight = saved ? saved === "light" : prefersLight;
  document.documentElement.classList.toggle("light-mode", isLight);
})();
//#endregion


window.addEventListener("load", () => {
  if (typeof gsap === "undefined") return;

  // ===============================================
  //#region   PRELOADER & INTRO ANIMATIONS
  // ===============================================
  const isLight = document.documentElement.classList.contains("light-mode");
  const p1 = document.getElementById("preloader");
  const p2 = document.getElementById("preloader-light");

  // Select the appropriate preloader, falling back to whichever is in the DOM
  const activePreloader = isLight ? (p2 || p1) : (p1 || p2);

  gsap.registerPlugin(ScrollTrigger, Observer, ScrollSmoother, ScrollToPlugin);
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
  //#endregion

  // =========================================
  //#region     SCROLLSMOOTHER SETUP
  // =========================================
  const headerH = document.querySelector(".site-header")?.offsetHeight || 0;

  //Disable native browser scroll restoration
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";

  // Only create smoother if the screen is wider than a tablet (e.g., 1024px)
  let smoother;
  if (window.innerWidth > 1024) {
    smoother = ScrollSmoother.create({
      wrapper: "#scroll-wrapper",
      content: "#scroll-content",
      smooth: 1.7,
      // normalizeScroll: true
    });
  }
  //For desktop use smoother but for mobile use native scroll with GSAP animation
  function SmoothScrollTo(targetElement, offset = 0){
    if(smoother){
      //Desktop version
      smoother.scrollTo(targetElement, true, `top ${offset}px`);
    }
    else{
      //MOBILE: Use native window scrolling via GSAP ScrollToPlugin
      gsap.to(window, {
        duration: 1,
        scrollTo: {y:targetElement, offsetY: offset},
        ease: "power2.inOut"
      });
    }
  }
  //#endregion

  // ==============================================
  //#region         SCROLL RESTORATION
  // ==============================================
  // Save/restore using smoother's scrollTop
  const KEY = "smootherScrollTop";
  // Function to toggle smoother state (defined once and only here)
  const toggleSmoother = (state) => {
    if (typeof smoother !== "undefined" && smoother) {
      smoother.paused(state);
    }
    else if (!smoother){
      document.body.style.overflow = state ? "hidden": "";
    }
  };
  
  // Save on refresh / navigate away
  window.addEventListener("pagehide", () => {
    try {
      sessionStorage.setItem(KEY, String(smoother.scrollTop()));
    } catch (e) { }
  });
  
  function navType() {
    // Modern API
    const nav = performance.getEntriesByType?.("navigation")?.[0];
    if (nav && nav.type) return nav.type; // "navigate" | "reload" | "back_forward" | "prerender"
    // Fallback (older)
    const legacy = performance.navigation?.type;
    if (legacy === 1) return "reload";
    if (legacy === 2) return "back_forward";
    return "navigate";
  }
  
  // Only restore on a real reload (refresh button / Ctrl+R)
  const shouldRestore = navType() === "reload";
  requestAnimationFrame(() => {
    ScrollTrigger.refresh();
    if (!shouldRestore) {
      // URL enter / fresh navigation: start at top
      try {
        sessionStorage.removeItem(KEY);
      } catch (e) { }
      ScrollTrigger.update();
      return;
    }
    // Reload: restore
    const saved = sessionStorage.getItem(KEY);
    if (saved != null) {
      const y = parseFloat(saved);
      if (!Number.isNaN(y)) {
        // Check if smoother is currently paused due to your ScrollTrigger setup
        // We'll temporarily unpause it if it is, apply scroll, then re-apply the pause if needed.
        const wasSmootherPaused = smoother.paused();
        if (wasSmootherPaused) {
          toggleSmoother(false); // Temporarily unpause to allow scrolling
        }
        smoother.scrollTo(y, false);
        ScrollTrigger.update();
        if (wasSmootherPaused) {
          // If it was paused before, re-pause it after restoring scroll
          toggleSmoother(true);
        }
      }
    }
  });
  //#endregion

  // ===============================================
  //#region   URL HASH & SESSION NAVIGATION
  // ===============================================
  // The first one should handle all initial ScrollTrigger refreshes and scroll restorations.
  requestAnimationFrame(() => {
    scrollToStoredTargetIfAny();
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
    } 
    else 
      {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    // Remove the hash from the URL (keeps the page position)
    if (window.location.hash) {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
    
  }
  //#endregion

  // ===============================================
  //#region   HEADER PINNING & HERO SCROLL BUTTON
  // ===============================================
  // Pin the header at the top once it reaches there (replaces CSS sticky)
  ScrollTrigger.create({
    trigger: ".site-header",
    start: "top top",
    end: "max",
    pin: true,
    pinSpacing: false,
    // markers: true
  });

document.querySelectorAll('.hero-scroll-btn').forEach(button => {
  button.addEventListener('click', () => {

    const target = button.dataset.scrollTarget; //Avoid hard coding target element. Determine it in HTML repsectively for each target

    if (smoother) {
      smoother.scrollTo(target, true, "top top");
    } 
    else {
      document.body.style.overflow = "hidden";

      gsap.to(window, {
        duration: 0.6,
        scrollTo: {
          y: target,
          autoKill: false
        },
        ease: "power1.out",
        onComplete: () => {
          document.body.style.overflow = "";
        }
      });
    }
  });
});
  //#endregion

  // ==================================================
  //#region   HASH NAVIGATION FOR DESKTOP & MOBILE
  // ==================================================
  const MobileBreakPoint = 768; 
  const BrandLogo = document.querySelector('a.brand')
  const navMenu = document.querySelector('.nav');
  const navLinks = document.querySelectorAll ('.nav a');
  const AllHashLinks = document.querySelectorAll('a[href^="#"]');
  const ThemeToggle = document.getElementById('theme-toggle');
  let isHashNavigation = false;
  
  function ToggleMobileMenu(){
    navMenu.classList.toggle('active');
    //Prevent body from scrolling when menu is open
    if(navMenu.classList.contains('active')){
      document.body.style.overflow = 'hidden';
    } 
    else{
      document.body.style.overflow = '';
    }
  }
  function CloseMobileMenu(){
    if(navMenu.classList.contains('active')){
      navMenu.classList.remove('active');
      document.body.style.overflow = '';
    }
  }
    /**
   * Handles smooth scrolling to a target element.
   * @param {string} TaregtID - The ID of the element to scroll to (e.g., "#Projects").
   */
  function SmoothScrollTo (TargetID){
    if (!TargetID) return;
  
  if(TargetID === '#'){
    if(smoother){
      smoother.scrollTo(0, false)
    } else{
      window.scrollTo({top: 0, behavior: "auto"})
    }
    return
  }
    const TargetElement = document.querySelector(TargetID);
    if(TargetElement){
      isHashNavigation = true;

      if(smoother){
        smoother.scrollTo(TargetElement, false, "top 80px");
      }else{
        const offset = 100;
        const TargetPosition =
          TargetElement.getBoundingClientRect().top +
          window.scrollY -
          offset;

        window.scrollTo({
          top: TargetPosition,
        });
      }
      
      setTimeout(() => {
        isHashNavigation = false;
      }, 1000);
    }
  }

  //1. The single listener to decide what to do on logo/ click
  BrandLogo.addEventListener('click', (e) => {
    e.preventDefault(); //prevent default jump in both cases

    if(window.innerWidth < MobileBreakPoint){
      //On Mobile its a Menu
      ToggleMobileMenu();
    }
    else{
      //On Desktop it scrolls to the top
      SmoothScrollTo('#');
    }
  });
  
  //2. Listener for all other hash links (e.g., Projects, Services, etc)
  AllHashLinks.forEach(anchor => {
    //We skip the BrandLogo because we gave it its own listener
    if(anchor === BrandLogo){
      return;
    }
    anchor.addEventListener('click', function(e){
      e.preventDefault();
      const TargetID = this.getAttribute('href');
      //Close the mobile menu if a link is clicked
      CloseMobileMenu();
      //Scroll to the section
      SmoothScrollTo(TargetID);
    });
  });
  //#endregion

  // ===============================================
  //#region   HERO AUTO-SNAP
  // ===============================================
  let heroSnapped = false;
  let pageReady = false; // Prevent snap on page load/refresh
  // Wait 1.5 seconds after page load before enabling snap
  setTimeout(() => {
    pageReady = true;
  }, 1500);
  
  function scrollAutoSnap(trigger, target, start, end = null) {
  let snapped = false; // local flag per trigger instance

  ScrollTrigger.create({
    trigger: trigger,
    start: start,
    ...(end && { end: end }),

    ...(end
      ? {
          onLeave: () => {
            if (isHashNavigation) return;
            if (snapped || !pageReady) return;
            snapped = true;
            handleSnap(target);
          }
        }
      : {
          onEnter: () => {
            if (isHashNavigation) return;
            if (snapped || !pageReady) return;
            snapped = true;
            handleSnap(target);
          }
        }),
    onEnterBack: () => {
      snapped = false;
    }
  });
}

function handleSnap(target, offset = headerH) {
  if (smoother) {
    smoother.paused(true);
    smoother.scrollTo(target, true, `top ${offset}px`);
    gsap.delayedCall(0.2, () => smoother.paused(false));
  } 
  else 
    {
    document.body.style.overflow = "hidden";
    gsap.to(window, {
      duration: 0.6,
      scrollTo: { y: target, autoKill: false, offsetY: offset},
      ease: "power1.out",
      onComplete: () => {
        document.body.style.overflow = "";
      }
    });
  }
  
}
  // range-based trigger → fires after scrolling through hero
  scrollAutoSnap(".hero-fullscreen", ".hero", "bottom 90%");

  // point trigger → fires exactly when hero exits
  scrollAutoSnap(".hero", ".carousel-track", "top top", "bottom 45%");
  //#endregion

  // ===============================================
  //#region   THEME TOGGLE FOR LOGO AND MAIN IMAGE
  // ===============================================
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

          //Mobile Navigation for toggle is written here (rather than mobile nav section)
          if(window.innerWidth < MobileBreakPoint){
            // Wait 40ms to allow the 400ms GSAP animations to finish before closing
            setTimeout(() => {
              CloseMobileMenu();
            }, 40); 
          }
        });
      }
    })();
    
  //#endregion

  // ==========================================
  //#region   CHRACTER SPLIT ANIMATION
  // ==========================================
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
  //#endregion

  // ==========================================
  //#region   HORIZONTAL CAROUSEL SCROLL
  // ==========================================
  const horizontalSection = document.querySelector('.carousel-inner');
  const horizontalTrack = document.querySelector('.carousel-track');

  if (horizontalSection && horizontalTrack) {
    const Offset = 500;
    let isOverCarousel = false;
    let currentX = 0;
    let targetX = 0;
    let rafId = null;
    //Function for determining the extra scroll width for screen
    const getMaxScroll = () => {
      const trackWidth = horizontalTrack.scrollWidth;
      const viewWidth = window.innerWidth;
      let extra = Offset;
      if (viewWidth < 768) extra = 100;
      else if (viewWidth < 1024) extra = 300;
      return trackWidth - viewWidth + extra;
    };

    // Smooth lerp animation loop
    const ease = 0.1;
    function animate() {
      currentX += (targetX - currentX) * ease;

      // Stop the loop when close enough
      if (Math.abs(targetX - currentX) < 0.5) {
        currentX = targetX;
        gsap.set(horizontalTrack, { x: -currentX });
        rafId = null;
        return;
      }

      gsap.set(horizontalTrack, { x: -currentX });
      //Recursive call to animate to allow currentX updated and the carousel move forward
      rafId = requestAnimationFrame(animate);
    }
    //Initialise the animate function
    function startAnimate() {
      //use rafId as guard check to only start animation if one isn't running already
      if (!rafId) rafId = requestAnimationFrame(animate);
    }

    // Pin the section manually when cursor enters
    horizontalSection.addEventListener('mouseenter', () => {
      isOverCarousel = true;
    });

    horizontalSection.addEventListener('mouseleave', () => {
      isOverCarousel = false;
    });

    // Intercept wheel event
    horizontalSection.addEventListener('wheel', (e) => {
      if (!isOverCarousel) return; // let it scroll the page

      const maxScroll = getMaxScroll();
      // If we've hit the end or the start, let the page scroll
      const atStart = targetX <= 0 && e.deltaY < 0;
      const atEnd = targetX >= maxScroll && e.deltaY > 0;

      if (atStart || atEnd) return;
      // Consume the scroll event — drive the carousel instead
      e.preventDefault();
      targetX += e.deltaY;
      targetX = Math.max(0, Math.min(targetX, maxScroll));
      startAnimate();
    }, { passive: false });

    // Handle resize
    window.addEventListener('resize', () => {
      const maxScroll = getMaxScroll();
      targetX = Math.min(targetX, maxScroll);
      currentX = Math.min(currentX, maxScroll);
      gsap.set(horizontalTrack, { x: -currentX });
    });
    
    // Touch support
    let touchStartX = 0;
    let touchStartY = 0;
    let touchLocked = null; // 'horizontal' or 'vertical'

    //With the "touchstart" listener remember where the finger first touched the screen
    horizontalSection.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchLocked = null;
    }, { passive: true });

    horizontalSection.addEventListener('touchmove', (e) => {
      const dx = touchStartX - e.touches[0].clientX;
      const dy = touchStartY - e.touches[0].clientY;

      // Lock direction on first significant move
      if (!touchLocked) {
        if (Math.abs(dx) < 5 && Math.abs(dy) < 5) return;
        touchLocked = Math.abs(dx) >= Math.abs(dy) ? 'horizontal' : 'vertical';
      }
      // Vertical swipe — let the page scroll normally
      if (touchLocked === 'vertical') return;

      //If at the beginning or end don't block vertical scrolling
      const maxScroll = getMaxScroll();
      const atStart = targetX <= 0 && dx < 0;
      const atEnd = targetX >= maxScroll && dx > 0;
      if (atStart || atEnd) return;

      // Horizontal swipe — drive the carousel
      e.preventDefault();
      targetX += dx;
      targetX = Math.max(0, Math.min(targetX, maxScroll));
      startAnimate();

      // Reset so next move is a delta, not cumulative
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: false });

    horizontalSection.addEventListener('touchend', () => {
      touchLocked = null;
    }, { passive: true });
  }
  //#endregion

  // ==========================================
  //#region   WE EVOKE FEELINGS SECTION
  // ==========================================
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
          trigger: section,// pins .typography (the 100vh wrapper)
          start: "top 10%",
          end: "+=1500",
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          //  markers: true,
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
  //#endregion

  // ==========================================
  //#region    "OUR SERVICES" ANIMATION
  // ==========================================
  let targetX = 0; 
    const animationTimelines = []; // Store timelines for diagonal carousel to access
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
      animationTimelines.push(tl); // Store for diagonal carousel access
      // Resume smoother when animation finishes

      tl.eventCallback("onComplete", () => toggleSmoother(false));
      // One ScrollTrigger controls the whole sequence

      ScrollTrigger.create({
        trigger: container,      // trigger when the block enters view
        start: 'top 10%',
        end: 'bottom',
        onEnter: () => {
          if (targetX > 0) return; //Guard variable to have onEnter only fire at the beginning of the carousel (and not mid entry)

          toggleSmoother(true);//Toggle smoother if it matches desktop screens
          tl.restart();
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
  //#endregion

  // ==========================================
  //#region    DIAGONAL CAROUSEL SCROLL
// ==========================================
const diagonalSection = document.querySelector('.diagonal-carousel');

if (diagonalSection) {
  const diagonalTrack = diagonalSection.querySelector('.carousel-track');
  const cards = diagonalSection.querySelectorAll('.case-card'); //Define outside checkOverlap() to avoid multiple querying cards in function
  const ANGLE_DEG = 8;
  const ANGLE = ANGLE_DEG * (Math.PI / 180);
  const getStartBackX = () => window.innerWidth <= 768 ? 50 : 400;  //different values for start back and is function to update on resize

  // const getStartBackX = 150;
  const END_BEFORE_X = 1000;

  let isOverCarousel = false;
  let currentX = 0;
  let rafId = null;
  let hasScrolledFromStart = false; // Track if we've scrolled away from start
  const ease = 0.1;

//Function for checking WHEN the carousel overlaps the continue button
function checkOverlap() {  
  const button = diagonalSection.querySelector('.hero-scroll-btn');
  if (!button || cards.length === 0) return;

  const buttonRect = button.getBoundingClientRect();

  // Sample a few points inside the button (center + corners for better accuracy)
  const points = [
    [buttonRect.left + buttonRect.width / 2, buttonRect.top + buttonRect.height / 2], // center
    [buttonRect.left + 5, buttonRect.top + 5], // top-left
    [buttonRect.right - 5, buttonRect.top + 5], // top-right
    [buttonRect.left + 5, buttonRect.bottom - 5], // bottom-left
    [buttonRect.right - 5, buttonRect.bottom - 5], // bottom-right
  ];

  let overlapping = false;

  for (const [x, y] of points) {
    const el = document.elementFromPoint(x, y);
      button.style.pointerEvents = '';

    if (el && [...cards].some(card => card.contains(el))) {
      overlapping = true;
      break;
    }
  }

  button.classList.toggle('track-overlap', overlapping);
}
  // Initial position
  gsap.set(diagonalTrack, {
    x: getStartBackX(),
    y: 0
  });

  const getTrackWidth = () => diagonalTrack.scrollWidth;
  const getMaxScroll = () => {
    return getTrackWidth() - window.innerWidth + getStartBackX();
  };

  function animate() {
    currentX += (targetX - currentX) * ease;
    
    const x = getStartBackX() - currentX;
    const y = -currentX * Math.tan(ANGLE);
    
    if (Math.abs(targetX - currentX) < 0.5) {
      currentX = targetX;

      gsap.set(diagonalTrack, {
        x: getStartBackX() - currentX,
        y: -currentX * Math.tan(ANGLE)
      });

      checkOverlap();

      rafId = null;
      return;
    }
    gsap.set(diagonalTrack, {
      x,
      y
    });

    rafId = requestAnimationFrame(animate);
  }

  function startAnimate() {
    if (!rafId) {
      rafId = requestAnimationFrame(animate);
    }
  }
  diagonalSection.addEventListener('mousemove', (e) => {
    const trackRect = diagonalTrack.getBoundingClientRect();

     isOverCarousel = 
      e.clientX >= trackRect.left  &&
      e.clientX <= trackRect.right &&
      e.clientY >= trackRect.top  &&
      e.clientY <= trackRect.bottom;
      
      diagonalSection.style.cursor = isOverCarousel ? 'grab' : 'default';
  });

  diagonalSection.addEventListener('mouseleave', () => {
    isOverCarousel = false;
  });

  diagonalSection.addEventListener('wheel', (e) => {
      if (!isOverCarousel) return;

      const maxScroll = getMaxScroll();
      const atStart = targetX <= 0 && e.deltaY < 0;
      const atEnd = targetX >= maxScroll && e.deltaY > 0;

      if (atStart || atEnd) return;
      
      // Trigger reverse animation when diagonal carousel scrolling starts

      if (!hasScrolledFromStart && targetX === 0 && e.deltaY > 0) {
        hasScrolledFromStart = true;
        // Reverse all active animation timelines
        animationTimelines.forEach(tl => tl.reverse());
      }
      // Scrolling back to start — only restart when carousel actually hits 0
      if (hasScrolledFromStart && e.deltaY < 0) {
        const nextTargetX = Math.max(0, targetX + e.deltaY);

        if (nextTargetX === 0) {
          hasScrolledFromStart = false;
          
          animationTimelines.forEach(tl => {
            toggleSmoother(true);
            tl.restart();
          });
        }
      }
      
      e.preventDefault();
      targetX += e.deltaY;
      targetX = Math.max(0, Math.min(targetX, maxScroll - END_BEFORE_X));
      startAnimate();
    },
    { passive: false }
  );

  window.addEventListener('resize', () => {
    const maxScroll = getMaxScroll();

    targetX = Math.min(targetX, maxScroll);
    currentX = Math.min(currentX, maxScroll);
    gsap.set(diagonalTrack, {
      x: getStartBackX() - currentX,
      y: -currentX * Math.tan(ANGLE)
    });
  });

  //Touch support
  let touchStartX = 0;
  let touchStartY = 0;
  let touchLocked = null;

  //With the "touchstart" listener remember where the finger first touched the screen
  diagonalSection.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchLocked = null;
  }, {passive: true});

  diagonalSection.addEventListener('touchmove', (e) => {
    const dx = touchStartX - e.touches[0].clientX;
    const dy = touchStartY - e.touches[0].clientY;

    //Lock direction on first significant move
    if(!touchLocked){
      if(Math.abs(dx) < 5 && Math.abs(dy) < 5) return;
      touchLocked = Math.abs(dx) >= Math.abs(dy) ? 'horizontal' : 'vertical';
    }
    //Vertical swipe - let the page scroll normally
    if(touchLocked === 'vertical') return;
    
    //If at the beginning or end don't block vertical scrolling
    const maxScroll = getMaxScroll();
    const atStart = targetX <= 0 && dx < 0;
    const atEnd = targetX >= maxScroll && dx > 0;
    if (atStart || atEnd) return;

    //Horizontal swipe -drive the carousel
    e.preventDefault();
    targetX +=dx;
    targetX = Math.max(0 , Math.min(targetX, maxScroll));
    startAnimate();

    //Reset so next move is a delta, not cumulative
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, {passive: false});
  
  diagonalSection.addEventListener('touchend', () =>{
    touchLocked =null;
  }, {passive: true});
}
//#endregion


//Requesting animation frame for fitty to load
  // document.fonts.ready.then(function () {
  //     // Give the browser a frame to finish layout
  //     requestAnimationFrame(function() {
  //         fitty('.case-card .card-text .h3-wrapper h3', {
  //             minSize: 10,
  //             maxSize: 29,
  //             multiLine: false
  //         });
  //     });
  // });
});
