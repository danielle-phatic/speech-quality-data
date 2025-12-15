/**
 * Transformers Boombox Design System
 * Interactive JavaScript for CRT effects, minions, and cassette deck navigation
 */

// ============================================
// Noise Generator - Canvas-based static bursts
// ============================================
class NoiseGenerator {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.animationId = null;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    // Lower resolution for coarse, analog-looking noise
    this.canvas.width = Math.ceil(window.innerWidth / 3);
    this.canvas.height = Math.ceil(window.innerHeight / 3);
  }

  burst(duration = 200, intensity = 0.3) {
    const startTime = performance.now();
    const fadeStart = duration * 0.7;

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      if (elapsed >= duration) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.canvas.classList.remove('active');
        return;
      }

      this.canvas.classList.add('active');

      // Calculate opacity with fade-out
      let opacity = intensity;
      if (elapsed > fadeStart) {
        opacity = intensity * (1 - (elapsed - fadeStart) / (duration - fadeStart));
      }

      // Generate coarse noise
      const imageData = this.ctx.createImageData(this.canvas.width, this.canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const gray = Math.random() * 255;
        data[i] = gray;
        data[i + 1] = gray;
        data[i + 2] = gray;
        data[i + 3] = opacity * 255;
      }

      this.ctx.putImageData(imageData, 0, 0);
      this.animationId = requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }

  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.canvas.classList.remove('active');
    }
  }
}

// ============================================
// Minion Base Class
// ============================================
class Minion {
  static STATES = {
    HIDDEN: 'hidden',
    ENTERING: 'entering',
    IDLE: 'idle',
    TRACKING: 'tracking',
    ACTING: 'acting',
    EXITING: 'exiting'
  };

  static TRIGGERS = {
    IDLE_TIMEOUT: 15000,
    SCROLL_PAUSE: 3000,
  };

  constructor(element) {
    this.element = element;
    this.state = Minion.STATES.HIDDEN;
    this.idleTimer = null;
  }

  setState(newState) {
    this.element.dataset.state = newState;
    this.state = newState;
  }

  show() {
    this.element.classList.add('visible');
    this.setState(Minion.STATES.ENTERING);
    setTimeout(() => {
      if (this.state === Minion.STATES.ENTERING) {
        this.setState(Minion.STATES.IDLE);
      }
    }, 300);
  }

  hide() {
    this.setState(Minion.STATES.EXITING);
    this.element.classList.remove('visible');
    setTimeout(() => this.setState(Minion.STATES.HIDDEN), 300);
  }
}

// ============================================
// Ravage - Panther with eye tracking and prowl
// ============================================
class Ravage extends Minion {
  constructor(element) {
    super(element);
    this.eyes = element.querySelectorAll('.eye');
    this.pupils = element.querySelectorAll('.pupil');
    this.boundTrack = this.trackEyes.bind(this);
  }

  startTracking() {
    document.addEventListener('mousemove', this.boundTrack);
    this.setState(Minion.STATES.TRACKING);
  }

  stopTracking() {
    document.removeEventListener('mousemove', this.boundTrack);
    // Reset pupils
    this.pupils.forEach(pupil => {
      pupil.style.transform = 'translate(0, 0)';
    });
  }

  trackEyes(event) {
    this.pupils.forEach((pupil, index) => {
      const eye = this.eyes[index];
      if (!eye) return;

      const eyeRect = eye.getBoundingClientRect();
      const eyeCenterX = eyeRect.left + eyeRect.width / 2;
      const eyeCenterY = eyeRect.top + eyeRect.height / 2;

      const angle = Math.atan2(
        event.clientY - eyeCenterY,
        event.clientX - eyeCenterX
      );

      const maxOffset = eyeRect.width * 0.25;
      const pupilX = Math.cos(angle) * maxOffset;
      const pupilY = Math.sin(angle) * maxOffset;

      pupil.style.transform = `translate(${pupilX}px, ${pupilY}px)`;
    });
  }

  prowl(direction = 'right') {
    this.setState(Minion.STATES.ACTING);
    this.element.classList.add('prowling');

    const startX = direction === 'right' ? -100 : window.innerWidth + 100;
    const endX = direction === 'right' ? window.innerWidth + 100 : -100;
    const y = window.innerHeight - 80;

    this.element.style.left = `${startX}px`;
    this.element.style.top = `${y}px`;
    this.element.style.transform = direction === 'left' ? 'scaleX(-1)' : '';

    this.show();

    const animation = this.element.animate([
      { left: `${startX}px` },
      { left: `${endX}px` }
    ], {
      duration: 8000,
      easing: 'linear'
    });

    animation.onfinish = () => {
      this.element.classList.remove('prowling');
      this.hide();
    };
  }
}

// ============================================
// Laserbeak - Condor loading indicator
// ============================================
class Laserbeak extends Minion {
  constructor(element) {
    super(element);
    this.isCircling = false;
    this.angle = 0;
  }

  startLoading(centerX, centerY, radius = 40) {
    this.centerX = centerX;
    this.centerY = centerY;
    this.radius = radius;
    this.isCircling = true;
    this.element.classList.add('flying', 'circling');
    this.show();
    this.circle();
  }

  stopLoading() {
    this.isCircling = false;
    this.element.classList.remove('flying', 'circling');
    this.hide();
  }

  circle() {
    if (!this.isCircling) return;

    this.angle += 0.06;
    const x = this.centerX + Math.cos(this.angle) * this.radius - 30;
    const y = this.centerY + Math.sin(this.angle) * this.radius - 20;

    // Bank into turns for realistic flight
    const bankAngle = Math.cos(this.angle) * 25;
    // Point in direction of travel
    const headingAngle = (this.angle * 180 / Math.PI) + 90;

    this.element.style.left = `${x}px`;
    this.element.style.top = `${y}px`;
    this.element.style.transform = `rotate(${headingAngle + bankAngle}deg)`;

    requestAnimationFrame(() => this.circle());
  }
}

// ============================================
// Ratbat Hunt - 404 page game
// ============================================
class RatbatHunt {
  constructor(element, onComplete) {
    this.element = element;
    this.onComplete = onComplete;
    this.catches = 0;
    this.catchesNeeded = 3;
    this.t = 0;
    this.speed = 0.015;
    this.isActive = true;

    this.element.classList.add('interactive', 'visible', 'flying', 'hunting');
    this.element.addEventListener('click', () => this.handleCatch());
    this.animate();
  }

  // Simplified Perlin-like noise using sine waves
  noise(x, y) {
    return (Math.sin(x * 1.5) + Math.sin(y * 1.7) + Math.sin((x + y) * 0.9)) / 3;
  }

  animate() {
    if (!this.isActive) return;

    this.t += this.speed;

    const noiseX = this.noise(this.t, 0);
    const noiseY = this.noise(0, this.t * 1.3);

    const x = ((noiseX + 1) / 2) * (window.innerWidth - 80);
    const y = ((noiseY + 1) / 2) * (window.innerHeight - 100) + 50;

    // Erratic rotation based on movement direction
    const rotation = Math.sin(this.t * 3) * 30;

    this.element.style.left = `${x}px`;
    this.element.style.top = `${y}px`;
    this.element.style.transform = `rotate(${rotation}deg)`;

    requestAnimationFrame(() => this.animate());
  }

  handleCatch() {
    this.catches++;
    this.element.classList.add('caught');
    setTimeout(() => this.element.classList.remove('caught'), 200);

    if (this.catches >= this.catchesNeeded) {
      this.victory();
    } else {
      // Speed up after each catch
      this.speed += 0.008;
      this.showProgress();
    }
  }

  showProgress() {
    const remaining = this.catchesNeeded - this.catches;
    const counter = document.querySelector('.catch-counter');
    if (counter) {
      counter.textContent = `${remaining} more catch${remaining !== 1 ? 'es' : ''} to go!`;
    }
  }

  victory() {
    this.isActive = false;
    this.element.classList.remove('interactive', 'hunting');
    this.element.classList.add('escaping');

    setTimeout(() => {
      this.element.classList.remove('visible');
      if (this.onComplete) this.onComplete();
    }, 800);
  }
}

// ============================================
// Minion Controller - Manages idle behaviors
// ============================================
class MinionController {
  constructor(minions) {
    this.minions = minions;
    this.idleTimer = null;
    this.setupIdleDetection();
  }

  setupIdleDetection() {
    const resetIdle = () => {
      clearTimeout(this.idleTimer);
      this.hideAllMinions();
      this.idleTimer = setTimeout(() => this.triggerPeek(), Minion.TRIGGERS.IDLE_TIMEOUT);
    };

    ['mousemove', 'keydown', 'scroll', 'click'].forEach(event => {
      document.addEventListener(event, resetIdle, { passive: true });
    });

    resetIdle();
  }

  triggerPeek() {
    const positions = [
      { x: 'calc(100% - 100px)', y: 'calc(100% - 20px)', peekY: 'calc(100% - 80px)' },
      { x: '20px', y: 'calc(100% - 20px)', peekY: 'calc(100% - 80px)' },
      { x: 'calc(100% - 100px)', y: '20px', peekY: '60px' },
    ];

    const pos = positions[Math.floor(Math.random() * positions.length)];
    const minion = this.minions[Math.floor(Math.random() * this.minions.length)];

    if (!minion) return;

    minion.element.style.left = pos.x;
    minion.element.style.top = pos.y;
    minion.element.classList.add('peeking');
    minion.show();

    minion.element.animate([
      { top: pos.y, opacity: 0 },
      { top: pos.peekY, opacity: 1 }
    ], {
      duration: 600,
      easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      fill: 'forwards'
    });
  }

  hideAllMinions() {
    this.minions.forEach(m => {
      m.element.classList.remove('peeking');
      m.hide();
    });
  }
}

// ============================================
// Tape Deck Navigation Controller
// For multi-page static sites - intercepts navigation for animation
// ============================================
class TapeDeck {
  constructor(options = {}) {
    this.rack = document.querySelector('.tape-rack');
    this.deck = document.querySelector('.tape-deck');
    this.deckSlot = document.querySelector('.deck-slot');
    this.viewport = document.querySelector('.content-viewport');
    this.counter = document.querySelector('.counter');
    this.vuMeters = document.querySelectorAll('.vu-meter');

    this.currentSection = null;
    this.isTransitioning = false;

    // External dependencies (injected)
    this.noiseGenerator = options.noiseGenerator;
    this.onLoadStart = options.onLoadStart || (() => { });
    this.onLoadComplete = options.onLoadComplete || (() => { });

    if (this.rack) {
      this.init();
    }
  }

  init() {
    // Detect current section from URL path
    this.detectCurrentSection();

    // Mark current cassette as loaded
    this.markCurrentLoaded();

    // Engage deck and start VU meters for current page
    if (this.deckSlot) {
      this.deckSlot.classList.add('engaged');
    }
    this.updateCounter(999);
    this.animateVUMeters();

    // Cassette click handlers - intercept for animation
    this.rack.querySelectorAll('.cassette').forEach(cassette => {
      cassette.addEventListener('click', (e) => {
        const href = cassette.getAttribute('href');
        const section = cassette.dataset.section;

        // If already on this section, do nothing
        if (section === this.currentSection) {
          e.preventDefault();
          return;
        }

        // If not transitioning, play animation then navigate
        if (!this.isTransitioning) {
          e.preventDefault();
          this.navigateWithAnimation(cassette, href, section);
        }
      });
    });

    // Eject button - returns to home
    const ejectBtn = document.querySelector('.eject-btn');
    if (ejectBtn) {
      ejectBtn.addEventListener('click', () => {
        const homeUrl = this.rack.querySelector('[data-section="home"]')?.getAttribute('href') || '/';
        if (this.currentSection !== 'home') {
          this.ejectAndNavigate(homeUrl);
        }
      });
    }
  }

  detectCurrentSection() {
    const path = window.location.pathname;
    if (path === '/' || path === '/index.html' || path.endsWith('/index.html') && !path.includes('/about') && !path.includes('/blog') && !path.includes('/devlog')) {
      // Check if it's a root page or a subpage
      if (path === '/' || path === '/index.html') {
        this.currentSection = 'home';
      } else if (path.includes('/about')) {
        this.currentSection = 'motivation';
      } else if (path.includes('/blog')) {
        this.currentSection = 'blog';
      } else if (path.includes('/devlog')) {
        this.currentSection = 'devlog';
      } else {
        this.currentSection = 'home';
      }
    } else if (path.includes('/about')) {
      this.currentSection = 'motivation';
    } else if (path.includes('/blog')) {
      this.currentSection = 'blog';
    } else if (path.includes('/devlog')) {
      this.currentSection = 'devlog';
    } else {
      this.currentSection = 'home';
    }
  }

  markCurrentLoaded() {
    const currentCassette = this.rack.querySelector(`[data-section="${this.currentSection}"]`);
    if (currentCassette) {
      currentCassette.classList.add('loaded');
    }

    // Update the "Now Playing" label in the deck
    this.updateNowPlayingLabel();
  }

  updateNowPlayingLabel() {
    const label = document.querySelector('.deck-mechanism .capstan');
    if (label && this.currentSection) {
      const sectionName = this.currentSection.charAt(0).toUpperCase() + this.currentSection.slice(1);
      label.textContent = `Now Playing: ${sectionName}`;
    }
  }

  async navigateWithAnimation(cassetteElement, href, sectionId) {
    this.isTransitioning = true;
    this.onLoadStart(sectionId);

    cassetteElement.classList.add('loading');

    // Phase 1: Lift cassette from rack
    await this.animateLift(cassetteElement);

    // Phase 2: Travel to deck
    await this.animateTravel(cassetteElement);

    // Phase 3: Insert into deck (with noise burst)
    await this.animateInsert(cassetteElement);

    // Navigate to the new page
    window.location.href = href;
  }

  async ejectAndNavigate(href) {
    this.isTransitioning = true;

    // Trigger noise
    if (this.noiseGenerator) {
      this.noiseGenerator.burst(150, 0.4);
    }

    // Quick spindown animation
    const reels = document.querySelectorAll('.reel');
    reels.forEach(reel => {
      reel.style.animationDuration = '4s';
    });

    // Counter rewind
    await this.animateCounterRewind();

    // Navigate
    window.location.href = href;
  }

  async animateLift(cassette) {
    const cassetteBody = cassette.querySelector('.cassette-body');
    if (!cassetteBody) return;

    return cassetteBody.animate([
      { transform: 'rotateX(15deg) translateY(0)' },
      { transform: 'rotateX(0deg) translateY(-30px)' }
    ], {
      duration: 250,
      easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      fill: 'forwards'
    }).finished;
  }

  async animateTravel(cassette) {
    if (!this.deckSlot) return;

    const cassetteBody = cassette.querySelector('.cassette-body');
    if (!cassetteBody) return;

    const cassetteRect = cassette.getBoundingClientRect();
    const slotRect = this.deckSlot.getBoundingClientRect();

    const deltaX = (slotRect.left + slotRect.width / 2) -
      (cassetteRect.left + cassetteRect.width / 2);
    const deltaY = slotRect.top - cassetteRect.top + 20;

    return cassetteBody.animate([
      { transform: 'rotateX(0deg) translateY(-30px)' },
      { transform: `rotateX(0deg) translate(${deltaX}px, ${deltaY}px)` }
    ], {
      duration: 400,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      fill: 'forwards'
    }).finished;
  }

  async animateInsert(cassette) {
    // Trigger CRT noise burst
    if (this.noiseGenerator) {
      this.noiseGenerator.burst(200, 0.4);
    }

    // Trigger scanline roll
    const scanlines = document.querySelector('.scanlines');
    if (scanlines) {
      scanlines.classList.add('rolling');
    }

    const cassetteBody = cassette.querySelector('.cassette-body');
    if (!cassetteBody) return;

    await cassetteBody.animate([
      { opacity: 1, transform: cassetteBody.style.transform || 'translateY(0)' },
      { opacity: 0, transform: 'translateY(60px) scale(0.8)' }
    ], {
      duration: 300,
      easing: 'cubic-bezier(0.4, 0, 1, 1)',
      fill: 'forwards'
    }).finished;

    // Brief pause for effect
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  async animateCounterRewind() {
    return new Promise(resolve => {
      let value = 999;
      const animate = () => {
        value -= 20;
        this.updateCounter(Math.max(0, value));

        if (value > 0) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
      requestAnimationFrame(animate);
    });
  }

  updateCounter(value) {
    if (!this.counter) return;

    const digits = this.counter.querySelectorAll('.digit');
    const str = String(Math.min(999, Math.max(0, value))).padStart(3, '0');

    digits.forEach((digit, i) => {
      const newValue = str[i];
      if (digit.dataset.value !== newValue) {
        digit.classList.add('flipping');
        digit.dataset.value = newValue;
        digit.textContent = newValue;
        setTimeout(() => digit.classList.remove('flipping'), 150);
      }
    });
  }

  animateVUMeters() {
    const animate = () => {
      this.vuMeters.forEach(meter => {
        // Randomized levels for visual interest
        const level = 40 + Math.random() * 50;
        meter.style.setProperty('--level', `${level}%`);
      });

      setTimeout(() => requestAnimationFrame(animate), 100);
    };
    animate();
  }
}

// ============================================
// Faction Toggle Controller
// ============================================
class FactionToggle {
  constructor(noiseGenerator) {
    this.noiseGenerator = noiseGenerator;
    this.buttons = document.querySelectorAll('.faction-btn');
    this.currentFaction = localStorage.getItem('faction') || 'soundwave';

    this.init();
  }

  init() {
    // Apply saved faction
    this.setFaction(this.currentFaction, false);

    // Button click handlers
    this.buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const faction = btn.dataset.faction;
        if (faction !== this.currentFaction) {
          this.setFaction(faction, true);
        }
      });
    });
  }

  setFaction(faction, animate = true) {
    this.currentFaction = faction;
    document.documentElement.dataset.faction = faction;
    localStorage.setItem('faction', faction);

    // Update button states
    this.buttons.forEach(btn => {
      btn.setAttribute('aria-pressed', btn.dataset.faction === faction);
    });

    // Visual feedback
    if (animate && this.noiseGenerator) {
      this.noiseGenerator.burst(150, 0.3);
    }
  }
}

// ============================================
// Chromatic Text Setup
// ============================================
function setupChromaticText() {
  document.querySelectorAll('.chromatic-text').forEach(el => {
    if (!el.dataset.text) {
      el.dataset.text = el.textContent;
    }
  });
}

// ============================================
// Visibility Change Handler
// ============================================
function setupVisibilityHandler() {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      document.body.classList.add('animations-paused');
    } else {
      document.body.classList.remove('animations-paused');
    }
  });
}

// ============================================
// Main Initialization
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize CRT overlay
  const noiseCanvas = document.querySelector('.noise-canvas');
  const noiseGenerator = noiseCanvas ? new NoiseGenerator(noiseCanvas) : null;

  // 2. Initialize minions (if present)
  const ravageEl = document.getElementById('ravage');
  const laserbeakEl = document.getElementById('laserbeak');

  let ravage = null;
  let laserbeak = null;
  let minionController = null;

  if (ravageEl) {
    ravage = new Ravage(ravageEl);
  }

  if (laserbeakEl) {
    laserbeak = new Laserbeak(laserbeakEl);
  }

  if (ravage || laserbeak) {
    const minions = [ravage, laserbeak].filter(Boolean);
    minionController = new MinionController(minions);
  }

  // 3. Initialize tape deck with integrations
  const tapeDeck = new TapeDeck({
    noiseGenerator,

    onLoadStart: (sectionId) => {
      // Laserbeak loading indicator
      if (laserbeak) {
        const slot = document.querySelector('.deck-slot');
        if (slot) {
          const rect = slot.getBoundingClientRect();
          laserbeak.startLoading(rect.left + rect.width / 2, rect.top + rect.height / 2);
        }
      }
    },

    onLoadComplete: (sectionId) => {
      if (laserbeak) {
        laserbeak.stopLoading();
      }

      // Random chance for Ravage reaction
      if (ravage && Math.random() > 0.7) {
        setTimeout(() => ravage.prowl(), 1000);
      }
    }
  });

  // 4. Initialize faction toggle
  const factionToggle = new FactionToggle(noiseGenerator);

  // 5. Setup chromatic text
  setupChromaticText();

  // 6. Setup visibility handler
  setupVisibilityHandler();

  // 7. Ravage eye tracking on hover over deck (if present)
  const deckElement = document.querySelector('.tape-deck');
  if (deckElement && ravage) {
    deckElement.addEventListener('mouseenter', () => {
      ravage.startTracking();
      ravage.element.style.left = 'calc(100% - 100px)';
      ravage.element.style.top = 'calc(100% - 80px)';
      ravage.show();
    });

    deckElement.addEventListener('mouseleave', () => {
      ravage.stopTracking();
      ravage.hide();
    });
  }

  // 8. Initialize 404 Ratbat hunt (if on 404 page)
  const ratbatEl = document.getElementById('ratbat');
  const page404 = document.querySelector('.page-404');

  if (ratbatEl && page404) {
    new RatbatHunt(ratbatEl, () => {
      const errorContent = document.querySelector('.error-content');
      if (errorContent) {
        errorContent.classList.remove('hidden');
      }
      const instructions = document.querySelector('.hunt-instructions');
      if (instructions) {
        instructions.classList.add('hidden');
      }
    });
  }

  // Expose for debugging
  window.boombox = {
    noiseGenerator,
    tapeDeck,
    factionToggle,
    ravage,
    laserbeak,
    minionController
  };
});
