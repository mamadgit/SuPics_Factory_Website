// Run ASAP so the correct preloader shows immediately
// ===============================================
//#region   PRE-LOAD THEME INITIALIZATION
// ===============================================
(() => {
  let saved = null;
  try { saved = localStorage.getItem("siteTheme"); } catch (e) {}
  const prefersLight =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: light)").matches;

  const isLight = saved ? saved === "light" : prefersLight;
  document.documentElement.classList.toggle("light-mode", isLight);
})();
//#endregion


document.addEventListener("DOMContentLoaded", () => {
  if (typeof gsap === "undefined") return;

  // Dynamically grabs whichever video has the class on the current page
  const mainVideo = document.querySelector('.main-video');
  
  function startIntro() {
    // Your GSAP preloader animations go here
  }

  if (mainVideo) {
    if (mainVideo.readyState >= 4) {
      startIntro();
    } else {
      mainVideo.addEventListener("canplaythrough", startIntro, { once: true });
    }
    // Fail-safe timeout
    setTimeout(startIntro, 5000);
  } else {
    // If a specific HTML page doesn't have a hero video at all, load instantly
    startIntro();
  }
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
  //#endregion

  // ======================================================
  //#region   MENU HASH NAVIGATION FOR DESKTOP & MOBILE
  // ======================================================
  // Smooth scroll for ALL anchor links to work with ScrollSmoother
  let hashNav = false;
  const MobileBreakPoint = 768;
  const BrandLogo = document.querySelector('a.brand');
  const navMenu = document.querySelector('.nav');
  const navLinks = document.querySelectorAll('.nav a');
  const AllHashLinks = document.querySelectorAll('a[href^="#"]');
  const ThemeToggle = document.getElementById('.theme-toggle');

  function ToggleMobileMenu (){
    navMenu.classList.toggle('active');
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
  function SmoothScrollTo (TargetID) {
    if(!TargetID) return;

    if(TargetID === '#'){
      if(smoother){
        smoother.scrollTo(0, false);
      }
      else{
        window.scrollTo({top: 0, behavior: "auto"});
      }
      return;
    }
    const targetElement = document.querySelector(TargetID);
    if(targetElement){
      hashNav = true;

      if(smoother){
        smoother.scrollTo(targetElement, false, "top 80px");
      }
      else{
        const offset = window.innerWidth < MobileBreakPoint ? 10 : 100;
        const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - offset;

        window.scrollTo({
          top: targetPosition
        });
      }
      setTimeout(() => {
        hashNav = false;
      }, 1000);
    }
  }
  BrandLogo.addEventListener('click', (e) => {
    e.preventDefault(); //Prevent default jump in both cases
    if (window.innerWidth < MobileBreakPoint){
      ToggleMobileMenu();
    }
    else{
      SmoothScrollTo('#');
    }
  });

  AllHashLinks.forEach(anchor => {
    //We skip the BrandLogo because we gave it its own listener
    if(anchor === BrandLogo){
      return;
    }
    anchor.addEventListener('click', function(e){

      e.preventDefault(); //Prevent default behviour of hash clicks
      const TargetID = this.getAttribute('href');
      //Close the mobile menu if a link is clicked
      CloseMobileMenu();
      //Scroll to the section
      SmoothScrollTo(TargetID);
    });
  });

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
  //#endregion

// ==========================================
  //#region   HERO AUTO-SNAP
  // ========================================
  const ProjDesHeader = document.querySelector(".offcanvas-header");

  let pageReady = false;
  setTimeout(() =>{
    pageReady = true;
  }, 1500);

  function ScrollToSnap(trigger, target, start, end = null, snapOffset = 0){
    let heroSnapped = false; // This handles our local snap lock

    ScrollTrigger.create({
      trigger: trigger,
      start: start,
      ...(end && { end: end }),

      // Use the correct internal 'heroSnapped' variable state
      ...(end
        ? {
            onLeave: () => {
              if (heroSnapped || !pageReady) return;
              heroSnapped = true;
              handleSnap(target, snapOffset);
            }
          }
        : {
            onEnter: () => {
              if (heroSnapped || !pageReady) return;
              heroSnapped = true;
              handleSnap(target, snapOffset);
            }
          }),
      onEnterBack: () =>{
        heroSnapped = false;
      },
      onLeaveBack: () =>{
        heroSnapped = false;
      }
    });
  }

  function handleSnap(target, offset) {
    if(smoother){
      smoother.paused(true);
      // Ensure we explicitly target the bottom positioning with standard syntax
      smoother.scrollTo(target, true, `bottom ${offset}px`);
      gsap.delayedCall(0.2, () =>{
        smoother.paused(false);
      });
    }
    else{
      document.body.style.overflow = "hidden"; //The equivelant of smoother.paused
      gsap.to(window, {
        duration: 0.6,
        scrollTo: {y: target, autoKill: false, offsetY: offset},
        ease: "power1.out",
        onComplete: () =>{
          document.body.style.overflow = ""; //Unpausing scroller
        }
      });
    }
  }

  // Pass '99' explicitly as your offset parameter to keep your original alignment!
  if(window.innerWidth > MobileBreakPoint){
    ScrollToSnap(".project-fullscreen", ".project-fullscreen", "top+=15% top", null, 99);
  }
  else{
    ScrollToSnap(".typography", ".typography", "top 90%", null, 100);
  }

  if(ProjDesHeader){
    //header starts hidden
    ProjDesHeader.classList.remove("is-visible");
    ScrollTrigger.create({
    trigger: ".project-fullscreen",
    start: "bottom 35%",
    scroller: smoother?.wrapper() || window,
    onEnter: ()=> ProjDesHeader.classList.add("is-visible"),
    onLeaveBack: () => ProjDesHeader.classList.remove("is-visible"),
    });
  }
  //#endregion

  // ===============================================
  //#region   THEME TOGGLE FOR LOGO AND MAIN IMAGE
  // ===============================================
  // Theme toggle for Logo and site
  (function () {
    const toggle = document.getElementById('theme-toggle');
    const logoHeaderImg = document.querySelector('.brand .logo-header-image img');
    const heroLogoImg = document.querySelector('.hero-image img');
    const SolidHeadings = Array.from(document.querySelectorAll('.animated-text .heading--solid'));
    const TransparentHeadings = Array.from(document.querySelectorAll('.animated-text .heading--transparent'));
    const header = document.querySelector('.site-header');
    const headerH = document.querySelector(".site-header")?.offsetHeight || 0;
    const PiP = document.getElementById('pipTarget');
    const playerEl = document.getElementById("Plyr");
    const DARK_HEADER_LOGO = 'SU-LOGO-web.svg';
    const LIGHT_HEADER_LOGO = 'SU-LOGO-web-W.svg';


    function setTheme(isLight, animate = false) {
      // Only toggle 'light-mode' - dark is the default via :root
      document.documentElement.classList.toggle('light-mode', isLight);
      //Animated Text Color Switching
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
        if (ProjDesHeader) {
          ProjDesHeader.classList.toggle('white', isLight);
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

        //Mobile Navigation for toggle is written here (rather than mobile nav section)
        if(window.innerWidth < MobileBreakPoint){
          // Wait 40ms to allow the 400ms GSAP animations to finish before closing
          setTimeout(() => {
            CloseMobileMenu();
          }, 40); 
        }
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
  //#endregion

});

