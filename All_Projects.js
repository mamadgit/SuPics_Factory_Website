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
    // if (window.location.hash) {
  //   history.replaceState(null, null, window.location.pathname);
  // }
  if (typeof gsap === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger, Observer, ScrollSmoother, ScrollToPlugin);

  // ===============================================
  //#region   PRELOADER & INTRO ANIMATIONS
  // ===============================================
  const isLight = document.documentElement.classList.contains("light-mode");
  const p1 = document.getElementById("preloader");
  const p2 = document.getElementById("preloader-light");

  // Select the appropriate preloader, falling back to whichever is in the DOM
  const activePreloader = isLight ? (p2 || p1) : (p1 || p2);
  
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
  const SiteHeader = document.querySelector('.site-header');
  const ThemeToggle = document.getElementById('.theme-toggle');
  const CategorySiteHeader = document.querySelector(".category-site-header");
  

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

    document.querySelectorAll('a[href^="index.html#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const href = anchor.getAttribute('href'); // e.g. "index.html#Projects"
      const hash = href.split('#')[1];          // "Projects"

      if (hash) sessionStorage.setItem('scrollTarget', `#${hash}`);
      // go to index without hash
      window.location.assign('index.html');
    });
  });
  //#endregion

  // ==============================================
  //#region   HEADER PINNING
  // ===============================================
  // Pin the header at the top once it reaches there (replaces CSS sticky)
  if(window.innerWidth > 786){//Pining only for desktop version, mobile version has sticky to keep it pinned
    // Main header: always pinned at the very top
    ScrollTrigger.create({
      trigger: SiteHeader,
      start: "top top",
      end: "max",
      pin: true,
      pinSpacing: false,
      // markers: true
    });

    if(CategorySiteHeader){
      // Category header: pinned flush beneath the main header. Function form so the
      // offset is recalculated on every ScrollTrigger.refresh() (resize/layout shifts).
      ScrollTrigger.create({
        trigger: CategorySiteHeader,
        start: () => "top top+=" + SiteHeader.offsetHeight,
        end: "max",
        pin: true,
        pinSpacing: false,
      });

      // Slide the category header out of view while scrolling down, bring it back while
      // scrolling up, so it doesn't permanently eat vertical space. self.direction is
      // 1 (down) / -1 (up). Using a ScrollTrigger (not a native scroll listener) so it
      // works with ScrollSmoother. Small buffer keeps both headers visible at the top.
      // The slide itself lives on .category-site-header__inner (see _header.scss) -
      // GSAP owns the transform on the outer <header> for pinning.
      const hideThreshold = SiteHeader.offsetHeight;
      ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => {
          if(self.direction === 1 && self.scroll() > hideThreshold){
            CategorySiteHeader.classList.add('is-invisible');
          }
          else if(self.direction === -1){
            CategorySiteHeader.classList.remove('is-invisible');
          }
        },
      });
    }
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
    const AnimText = document.querySelector('.animated-text .heading');
    const header = document.querySelector('.site-header');
    const DARK_HEADER_LOGO = 'SU-LOGO-web.svg';
    const LIGHT_HEADER_LOGO = 'SU-LOGO-web-W.svg';
    const DARK_HERO_LOGO = 'SU-EN-LOGO-typo.png';
    const LIGHT_HERO_LOGO = 'SU-EN-LOGO-typo-BLACK.png';

    function setTheme(isLight, animate = false) {
      // Only toggle 'light-mode' - dark is the default via :root
      document.documentElement.classList.toggle('light-mode', isLight);

      //Animated Text Color Switching
      if(AnimText){
        AnimText.classList.toggle('heading--solid-black', isLight);
      }
      if (animate && typeof gsap !== 'undefined') {
          // Fade out, swap image, fade in
          gsap.to(AnimText, {
            opacity: 0,
            duration: 0.2,
            ease: 'power1.inOut',
            onComplete: () => {
              gsap.to(AnimText, {
                opacity: 1,
                duration: 0.2,
              });
            }
          });
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

  // ...existing code...
});
