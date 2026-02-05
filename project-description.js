window.addEventListener("load", () => {
  if (typeof gsap === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

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
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
  let smoother = ScrollSmoother.create({
    wrapper: '#scroll-wrapper',
    content: '#scroll-content',
    smooth: 1.7,
    // effects: true
  });

// Smooth scroll for ALL anchor links to work with ScrollSmoother
document.querySelectorAll('a[href="index.html#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault(); // This stops the "#" from appearing in the URL

    const targetId = this.getAttribute('href'); 

    if (targetId === '#' || targetId === '') {
      // If it's the logo/top link, scroll to the very top
      smoother.scrollTo(0, true); 
    } else {
      // For other sections like #Home or #Projects
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        
        smoother.scrollTo(targetElement, false, "top 80px");
      }
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
