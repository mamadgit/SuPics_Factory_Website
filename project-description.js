window.addEventListener("load", () => {
  if (typeof gsap === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

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
      duration: 1,
      ease: "power3.out",
      clearProps: "y,transform", // Only clear transform, keep opacity:1 (CSS has opacity:0)
      onComplete: () => {
        // Set opacity directly on the element to override CSS
        document.getElementById("content").style.opacity = "1";
      }
    }
  );
  let smoother = ScrollSmoother.create({
    wrapper: '#scroll-wrapper',
    content: '#scroll-content',
    smooth: 1.7,
    // effects: true
  });

// Smooth scroll for ALL anchor links to work with ScrollSmoother
document.querySelectorAll('a[href^="../index.html#"]').forEach((anchor) => {
  anchor.addEventListener('click', (e) => {
    e.preventDefault();
    const href = anchor.getAttribute('href'); // e.g. "index.html#Projects"
    const hash = href.split('#')[1];          // "Projects"

    if (hash) sessionStorage.setItem('scrollTarget', `#${hash}`);
    // go to index without hash
    window.location.assign('../index.html');
  });
});

  // Theme toggle for Logo and site
  (function () {
    const toggle = document.getElementById('theme-toggle');
    const logoHeaderImg = document.querySelector('.brand .logo-header-image img');
    const heroLogoImg = document.querySelector('.hero-image img');
    const SolidHeading = document.querySelector('.animated-text .heading--solid');
    const TransparentHeading = document.querySelector('.animated-text .heading--transparent');
    const header = document.querySelector('.site-header');
    const headerH = document.querySelector(".site-header")?.offsetHeight || 0;
    const headerEL = document.querySelector(".offcanvas-header");
    const PiP = document.getElementById('pipTarget');
    const playerEl = document.getElementById("Plyr");
    const DARK_HEADER_LOGO = 'SU-LOGO-web.svg';
    const LIGHT_HEADER_LOGO = 'SU-LOGO-web-W.svg';

    // Pin the header at the top once it reaches there (replaces CSS sticky)
    // ScrollTrigger.create({
    //   trigger: ".site-header", 
    //   start: "top top",
    //   end: "max",
    //   pin: true,
    //   pinSpacing: false,
    //   // markers: true
    // });
    if(headerEL){
      //header starts hidden
      headerEL.classList.remove("is-visible");
      ScrollTrigger.create({
      trigger: ".project-fullscreen",
      start: "top top",
      scroller: smoother?.wrapper() || window,
      onEnter: ()=> headerEL.classList.add("is-visible"),
      onLeaveBack: () => headerEL.classList.remove("is-visible"),
      });
    }
    function setTheme(isLight, animate = false) {
      // Only toggle 'light-mode' - dark is the default via :root
      document.documentElement.classList.toggle('light-mode', isLight);

      //Animated Text Color Switching
      if (SolidHeading && TransparentHeading) {
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
        if (headerEL) {
          headerEL.classList.toggle('white', isLight);
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
    // Safety checks
    let player = null;
    if (playerEl && typeof Plyr !== "undefined") {
      player = new Plyr(playerEl, {
        muted: true,
      });
    // Force muted at start (autoplay policies can be picky)
    player.muted = true;
    // When PiP turns on, scroll using ScrollSmoother (GSAP)
    player.on("enterpictureinpicture", () => {
      // If the page is in fullscreen, exit it (PiP and fullscreen conflict)
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      if (!PiP) return;
      if (typeof smoother !== "undefined" && smoother) {
        smoother.scrollTo(PiP, true); // smooth scroll to the element
      } else {
        // fallback if ScrollSmoother isn't available for some reason
        PiP.scrollIntoView({ behavior: "smooth" });
      }
    });
    player.on("leavepictureinpicture", () => {
      const full = document.querySelector(".project-fullscreen");
      if (!full) return;
      if (smoother) {
        smoother.scrollTo(full, true, -headerH);
      } else {
        full.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }
  })();

  // Mobile menu (placeholder)
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');
  if (toggle) {
    toggle.addEventListener('click', () => {
      nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
    });
  }

  // ...existing code...
});
