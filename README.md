## Responsive Front-End Website

Built a responsive front-end website from the ground up using HTML, CSS (SASS), and vanilla JavaScript.

### Key Features

1. **Custom Scroll Position Restoration**
   - Engineered a custom scroll restoration system to resolve conflicts introduced by GSAP's ScrollSmoother.
   - Leveraged the Navigation Timing API with legacy fallbacks to distinguish between reload and fresh navigation events.

2. **Decoupled Navigation State**
   - Designed a navigation state system using `sessionStorage` and the History API.
   - Ensured clean, hash-free URLs while maintaining navigational state.

3. **Theme Flash Prevention**
   - Prevented “flash of wrong theme” using a boot-time IIFE.
   - Implemented `localStorage` persistence and system preference detection via `matchMedia`.

4. **Scroll-Driven Interactions**
   - Implemented advanced scroll behaviors including:
     - Hero section snap
     - Pinned header
     - Smooth anchor navigation
   - Built using GSAP ScrollTrigger and ScrollSmoother.

5. **Custom Text Splitting Utility**
   - Developed a lightweight, per-character text splitting utility as an alternative to GSAP's SplitText.
   - Enabled scroll-triggered staggered character reveal animations across the site.
