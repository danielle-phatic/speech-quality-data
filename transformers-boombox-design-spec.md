# Transformers Boombox Static Site Design Specification

A design system inspired by Soundwave and Blaster from Transformers—characters who transform into boomboxes and deploy cassette tape minions that become animals.

---

## Table of Contents

1. [Retro-Tech Texture Layer](#1-retro-tech-texture-layer)
2. [Cassette Minion Interactions](#2-cassette-minion-interactions)
3. [Cassette Deck Navigation](#3-cassette-deck-navigation)
4. [Integration Points](#4-integration-points)

---

## 1. Retro-Tech Texture Layer

A persistent CRT/analog screen effect system that grounds the entire aesthetic.

### Architecture

Create a fixed-position overlay container with multiple layered effects. All layers must be non-interactive.

```html
<div class="crt-overlay">
  <div class="scanlines"></div>
  <div class="vignette"></div>
  <div class="flicker-layer"></div>
  <canvas class="noise-canvas"></canvas>
</div>
```

```css
.crt-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
}

.crt-overlay > * {
  position: absolute;
  inset: 0;
}
```

### Scanlines

Subtle horizontal bands simulating CRT phosphor rows.

```css
.scanlines {
  background: repeating-linear-gradient(
    to bottom,
    transparent 0px,
    transparent 2px,
    rgba(0, 0, 0, 0.15) 2px,
    rgba(0, 0, 0, 0.15) 4px
  );
  background-position: 0 var(--scanline-offset, 0);
}

/* Trigger roll on state changes */
.scanlines.rolling {
  animation: scanline-roll 150ms linear;
}

@keyframes scanline-roll {
  from { background-position: 0 0; }
  to { background-position: 0 100px; }
}
```

**Behavior:** Trigger the `rolling` class during page transitions, tape insertions, and section changes.

### Vignette

Darkened edges simulating CRT screen curvature.

```css
.vignette {
  background: radial-gradient(
    ellipse at center,
    transparent 0%,
    transparent 60%,
    rgba(0, 0, 0, 0.4) 100%
  );
}
```

### RGB Chromatic Aberration

Apply to headings and key interactive text on hover/focus states.

```css
.chromatic-text {
  position: relative;
}

.chromatic-text::before,
.chromatic-text::after {
  content: attr(data-text);
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.1s, transform 0.1s;
  pointer-events: none;
}

.chromatic-text::before {
  color: #ff0000;
  mix-blend-mode: screen;
}

.chromatic-text::after {
  color: #00ffff;
  mix-blend-mode: screen;
}

.chromatic-text:hover::before {
  opacity: 0.8;
  transform: translate(-2px, 0);
}

.chromatic-text:hover::after {
  opacity: 0.8;
  transform: translate(2px, 0);
}
```

**Requirement:** JavaScript must set `data-text` attribute to match the element's text content:

```javascript
document.querySelectorAll('.chromatic-text').forEach(el => {
  el.dataset.text = el.textContent;
});
```

### Canvas Noise Generator

Generates analog static bursts during transitions.

```javascript
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
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.imageRendering = 'pixelated';
  }

  burst(duration = 200, intensity = 0.3) {
    const startTime = performance.now();
    const fadeStart = duration * 0.7;

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      if (elapsed >= duration) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        return;
      }

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
    }
  }
}

// Usage
const noiseGen = new NoiseGenerator(document.querySelector('.noise-canvas'));
// Call during transitions:
noiseGen.burst(200, 0.4);
```

### Screen Flicker

Subtle randomized opacity dips for authentic CRT feel.

```css
.flicker-layer {
  background: transparent;
  animation: flicker 8s infinite;
}

@keyframes flicker {
  0%, 91%, 95%, 100% { opacity: 0; }
  92% { opacity: 0.08; }
  93% { opacity: 0.02; }
  94% { opacity: 0.06; }
}
```

### Phosphor Glow

For interactive elements—color varies by faction (Soundwave vs Blaster).

```css
:root {
  --glow-color-soundwave: rgb(147, 112, 219);
  --glow-color-blaster: rgb(255, 140, 0);
  --glow-color: var(--glow-color-soundwave);
}

.glow-element {
  box-shadow:
    0 0 2px var(--glow-color),
    0 0 8px color-mix(in srgb, var(--glow-color) 70%, transparent),
    0 0 20px color-mix(in srgb, var(--glow-color) 40%, transparent),
    0 0 40px color-mix(in srgb, var(--glow-color) 20%, transparent);
}

/* Pulsing variation for active states */
.glow-element.active {
  animation: glow-pulse 2s ease-in-out infinite;
}

@keyframes glow-pulse {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.2); }
}
```

### Barrel Distortion (Optional Advanced Effect)

SVG filter for subtle screen curvature. Add to HTML:

```html
<svg style="display: none;">
  <defs>
    <filter id="barrel-distort" x="-10%" y="-10%" width="120%" height="120%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="0" result="blur" />
      <!-- Subtle displacement for curvature effect -->
    </filter>
  </defs>
</svg>
```

Apply to main content: `filter: url(#barrel-distort);`

**Note:** This is computationally expensive. Consider applying only to hero sections or omitting on lower-end devices.

---

## 2. Cassette Minion Interactions

Animated characters based on the cassette-tape minions from the Transformers universe.

### Character Roster

| Soundwave Minions | Blaster Minions |
|-------------------|-----------------|
| Ravage (panther) — prowls, tracks cursor with eyes | Steeljaw (lion) — similar behaviors, warm palette |
| Laserbeak (condor) — flies, circles as loading indicator | Ramhorn (rhino) — charges across screen |
| Ratbat (bat) — erratic flight, 404 page star | Rewind (humanoid) — walks, waves |

### SVG Structure

Each minion should be an SVG with named groups for animatable parts:

```html
<svg id="ravage" class="minion" viewBox="0 0 120 60" aria-hidden="true">
  <g class="body"><!-- body path --></g>
  <g class="leg leg-front-left"><!-- leg path --></g>
  <g class="leg leg-front-right"><!-- leg path --></g>
  <g class="leg leg-back-left"><!-- leg path --></g>
  <g class="leg leg-back-right"><!-- leg path --></g>
  <g class="tail"><!-- tail path --></g>
  <g class="head">
    <g class="eye eye-left">
      <circle class="eye-socket" cx="0" cy="0" r="4" />
      <circle class="pupil" cx="0" cy="0" r="2" />
    </g>
    <g class="eye eye-right">
      <circle class="eye-socket" cx="0" cy="0" r="4" />
      <circle class="pupil" cx="0" cy="0" r="2" />
    </g>
  </g>
</svg>
```

### Base Minion CSS

```css
.minion {
  position: fixed;
  z-index: 9000;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.minion.visible {
  opacity: 1;
}

.minion.interactive {
  pointer-events: auto;
  cursor: pointer;
}

/* Minion sizes */
#ravage, #steeljaw { width: 80px; }
#laserbeak { width: 60px; }
#ratbat { width: 50px; }
```

### Behavior State Machine

```javascript
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
  }

  hide() {
    this.setState(Minion.STATES.EXITING);
    this.element.classList.remove('visible');
    setTimeout(() => this.setState(Minion.STATES.HIDDEN), 300);
  }
}
```

### Ravage: Eye Tracking

Eyes follow cursor position with constrained movement.

```javascript
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
  }

  trackEyes(event) {
    this.pupils.forEach((pupil, index) => {
      const eye = this.eyes[index];
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

      // Smooth transition for natural movement
      pupil.style.transition = 'transform 0.1s ease-out';
      pupil.style.transform = `translate(${pupilX}px, ${pupilY}px)`;
    });
  }
}
```

### Ravage: Prowl Animation

Walking animation when triggered by idle timeout.

```css
@keyframes prowl-body {
  0%, 100% { transform: translateY(0); }
  25%, 75% { transform: translateY(-3px); }
}

@keyframes prowl-leg-front {
  0%, 100% { transform: rotate(-20deg); }
  50% { transform: rotate(20deg); }
}

@keyframes prowl-leg-back {
  0%, 100% { transform: rotate(20deg); }
  50% { transform: rotate(-20deg); }
}

#ravage.prowling .body {
  animation: prowl-body 0.4s ease-in-out infinite;
}

#ravage.prowling .leg-front-left,
#ravage.prowling .leg-back-right {
  transform-origin: top center;
  animation: prowl-leg-front 0.4s ease-in-out infinite;
}

#ravage.prowling .leg-front-right,
#ravage.prowling .leg-back-left {
  transform-origin: top center;
  animation: prowl-leg-back 0.4s ease-in-out infinite;
}

#ravage.prowling .tail {
  transform-origin: left center;
  animation: tail-sway 0.8s ease-in-out infinite;
}

@keyframes tail-sway {
  0%, 100% { transform: rotate(-5deg); }
  50% { transform: rotate(5deg); }
}
```

```javascript
// Add to Ravage class
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
```

### Laserbeak: Loading Indicator

Circular flight pattern during async operations.

```javascript
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
    this.show();
    this.circle();
  }

  stopLoading() {
    this.isCircling = false;
    this.hide();
  }

  circle() {
    if (!this.isCircling) return;

    this.angle += 0.06;
    const x = this.centerX + Math.cos(this.angle) * this.radius;
    const y = this.centerY + Math.sin(this.angle) * this.radius;

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

// Usage with fetch:
async function loadWithLaserbeak(url, laserbeak) {
  const rect = document.querySelector('.loading-target').getBoundingClientRect();
  laserbeak.startLoading(rect.left + rect.width / 2, rect.top + rect.height / 2);

  try {
    const response = await fetch(url);
    return await response.json();
  } finally {
    laserbeak.stopLoading();
  }
}
```

### Peek Behavior

Minions peek from screen edges during user idle periods.

```javascript
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
      this.idleTimer = setTimeout(() => this.triggerPeek(), 15000);
    };

    ['mousemove', 'keydown', 'scroll', 'click'].forEach(event => {
      document.addEventListener(event, resetIdle, { passive: true });
    });

    resetIdle();
  }

  triggerPeek() {
    const positions = [
      { x: 'calc(100% - 60px)', y: 'calc(100% - 20px)', peekY: 'calc(100% - 50px)' },
      { x: '20px', y: 'calc(100% - 20px)', peekY: 'calc(100% - 50px)' },
      { x: 'calc(100% - 60px)', y: '20px', peekY: '50px' },
    ];

    const pos = positions[Math.floor(Math.random() * positions.length)];
    const minion = this.minions[Math.floor(Math.random() * this.minions.length)];

    minion.element.style.left = pos.x;
    minion.element.style.top = pos.y;
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
    this.minions.forEach(m => m.hide());
  }
}
```

### 404 Page: Ratbat Hunt

Interactive 404 where user must catch Ratbat to proceed.

```javascript
class RatbatHunt {
  constructor(element, onComplete) {
    this.element = element;
    this.onComplete = onComplete;
    this.catches = 0;
    this.catchesNeeded = 3;
    this.t = 0;
    this.speed = 0.015;
    this.isActive = true;

    // Simple noise function (or use a library)
    this.noise = this.createNoiseFunction();

    this.element.classList.add('interactive', 'visible');
    this.element.addEventListener('click', () => this.handleCatch());
    this.animate();
  }

  createNoiseFunction() {
    // Simplified Perlin-like noise using sine waves
    return (x, y) => {
      return (Math.sin(x * 1.5) + Math.sin(y * 1.7) + Math.sin((x + y) * 0.9)) / 3;
    };
  }

  animate() {
    if (!this.isActive) return;

    this.t += this.speed;

    const noiseX = this.noise(this.t, 0);
    const noiseY = this.noise(0, this.t * 1.3);

    const x = ((noiseX + 1) / 2) * (window.innerWidth - 80);
    const y = ((noiseY + 1) / 2) * (window.innerHeight - 60);

    // Erratic rotation based on movement direction
    const rotation = Math.sin(this.t * 3) * 30;

    this.element.style.transform = `translate(${x}px, ${y}px) rotate(${rotation}deg)`;

    requestAnimationFrame(() => this.animate());
  }

  handleCatch() {
    this.catches++;

    // Flash effect
    this.element.animate([
      { filter: 'brightness(3)' },
      { filter: 'brightness(1)' }
    ], { duration: 200 });

    if (this.catches >= this.catchesNeeded) {
      this.victory();
    } else {
      // Speed up after each catch
      this.speed += 0.008;
      this.showProgress();
    }
  }

  showProgress() {
    // Update UI to show catches remaining
    const remaining = this.catchesNeeded - this.catches;
    document.querySelector('.catch-counter').textContent = 
      `${remaining} more catch${remaining !== 1 ? 'es' : ''} to go!`;
  }

  victory() {
    this.isActive = false;
    this.element.classList.remove('interactive');

    // Victory animation - Ratbat flies away
    this.element.animate([
      { transform: this.element.style.transform },
      { transform: 'translate(50vw, -100px) rotate(720deg)', opacity: 0 }
    ], {
      duration: 800,
      easing: 'cubic-bezier(0.4, 0, 1, 1)'
    }).onfinish = () => {
      this.onComplete();
    };
  }
}

// Usage on 404 page:
const ratbat = document.getElementById('ratbat');
new RatbatHunt(ratbat, () => {
  document.querySelector('.error-content').classList.add('revealed');
});
```

```html
<!-- 404 page structure -->
<div class="page-404">
  <div class="hunt-instructions">
    <h1>404: Content Stolen!</h1>
    <p>Ratbat has taken this page. Catch him to continue!</p>
    <p class="catch-counter">3 catches to go!</p>
  </div>
  
  <svg id="ratbat" class="minion"><!-- Ratbat SVG --></svg>
  
  <div class="error-content hidden">
    <p>Page not found. <a href="/">Return home</a></p>
  </div>
</div>
```

---

## 3. Cassette Deck Navigation

The core navigation system where sections are cassette tapes loaded into a deck.

### HTML Structure

```html
<nav class="tape-navigation" aria-label="Main navigation">
  <div class="tape-rack">
    <button class="cassette" data-section="about" aria-label="About section">
      <div class="cassette-body">
        <div class="label-area">
          <span class="label-text">ABOUT</span>
        </div>
        <div class="tape-window">
          <div class="reel reel-left"></div>
          <div class="reel reel-right"></div>
        </div>
        <div class="screw screw-tl"></div>
        <div class="screw screw-tr"></div>
        <div class="screw screw-bl"></div>
        <div class="screw screw-br"></div>
      </div>
    </button>

    <button class="cassette" data-section="work" aria-label="Work section">
      <div class="cassette-body">
        <div class="label-area">
          <span class="label-text">WORK</span>
        </div>
        <div class="tape-window">
          <div class="reel reel-left"></div>
          <div class="reel reel-right"></div>
        </div>
        <div class="screw screw-tl"></div>
        <div class="screw screw-tr"></div>
        <div class="screw screw-bl"></div>
        <div class="screw screw-br"></div>
      </div>
    </button>

    <button class="cassette" data-section="contact" aria-label="Contact section">
      <div class="cassette-body">
        <div class="label-area">
          <span class="label-text">CONTACT</span>
        </div>
        <div class="tape-window">
          <div class="reel reel-left"></div>
          <div class="reel reel-right"></div>
        </div>
        <div class="screw screw-tl"></div>
        <div class="screw screw-tr"></div>
        <div class="screw screw-bl"></div>
        <div class="screw screw-br"></div>
      </div>
    </button>
  </div>

  <div class="tape-deck">
    <div class="deck-housing">
      <div class="deck-slot">
        <div class="slot-opening"></div>
        <div class="deck-mechanism">
          <div class="play-head"></div>
          <div class="capstan"></div>
          <div class="pinch-roller"></div>
        </div>
      </div>
      
      <div class="deck-controls">
        <button class="deck-btn eject-btn" aria-label="Eject tape">
          <span class="btn-icon">⏏</span>
        </button>
      </div>
      
      <div class="deck-display">
        <div class="counter">
          <span class="digit" data-value="0">0</span>
          <span class="digit" data-value="0">0</span>
          <span class="digit" data-value="0">0</span>
        </div>
        <div class="vu-meters">
          <div class="vu-meter vu-left"></div>
          <div class="vu-meter vu-right"></div>
        </div>
      </div>
    </div>
  </div>
</nav>

<main class="content-viewport">
  <section class="tape-content" data-section="about" hidden>
    <!-- About content -->
  </section>
  <section class="tape-content" data-section="work" hidden>
    <!-- Work content -->
  </section>
  <section class="tape-content" data-section="contact" hidden>
    <!-- Contact content -->
  </section>
</main>
```

### Cassette Styling

```css
:root {
  --cassette-width: 110px;
  --cassette-height: 70px;
  --cassette-depth: 12px;
  --cassette-color: #2a2a2a;
  --label-color: #e8e8e8;
  --faction-primary: rgb(147, 112, 219); /* Soundwave purple */
}

.tape-rack {
  display: flex;
  gap: 20px;
  padding: 20px;
  perspective: 1000px;
}

.cassette {
  background: none;
  border: none;
  cursor: pointer;
  perspective: 800px;
  transform-style: preserve-3d;
}

.cassette-body {
  position: relative;
  width: var(--cassette-width);
  height: var(--cassette-height);
  background: linear-gradient(
    145deg,
    color-mix(in srgb, var(--cassette-color) 70%, white) 0%,
    var(--cassette-color) 50%,
    color-mix(in srgb, var(--cassette-color) 70%, black) 100%
  );
  border-radius: 4px;
  transform: rotateX(15deg);
  transform-style: preserve-3d;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.2),
    inset 0 -1px 0 rgba(0, 0, 0, 0.3),
    0 var(--cassette-depth) 0 -2px color-mix(in srgb, var(--cassette-color) 60%, black),
    0 calc(var(--cassette-depth) + 4px) 12px rgba(0, 0, 0, 0.4);
}

.cassette:hover .cassette-body {
  transform: rotateX(5deg) translateY(-10px) scale(1.05);
}

.cassette:focus-visible .cassette-body {
  outline: 2px solid var(--faction-primary);
  outline-offset: 4px;
}

.cassette.loading {
  pointer-events: none;
}

.cassette.loaded .cassette-body {
  transform: translateZ(-50px) scale(0.9);
  opacity: 0.5;
}

/* Label area */
.label-area {
  position: absolute;
  top: 6px;
  left: 8px;
  right: 8px;
  height: 24px;
  background: var(--label-color);
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
}

.label-text {
  font-family: 'Courier New', monospace;
  font-size: 10px;
  font-weight: bold;
  letter-spacing: 1px;
  color: #333;
  text-transform: uppercase;
}

/* Tape window with reels */
.tape-window {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  width: 70px;
  height: 28px;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 3px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 8px;
}

.reel {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background:
    radial-gradient(circle at center,
      #444 0%,
      #444 25%,
      #222 26%,
      #222 40%,
      #333 41%,
      #333 100%
    );
  box-shadow:
    inset 0 0 3px rgba(0, 0, 0, 0.5),
    0 0 1px rgba(255, 255, 255, 0.1);
  animation: reel-idle 4s linear infinite;
}

.reel-left {
  animation-direction: normal;
}

.reel-right {
  animation-direction: reverse;
}

@keyframes reel-idle {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Screws */
.screw {
  position: absolute;
  width: 6px;
  height: 6px;
  background: radial-gradient(circle at 30% 30%, #666, #333);
  border-radius: 50%;
  box-shadow: inset 0 0 2px rgba(0, 0, 0, 0.5);
}

.screw::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 4px;
  height: 1px;
  background: #222;
  transform: translate(-50%, -50%);
}

.screw-tl { top: 4px; left: 4px; }
.screw-tr { top: 4px; right: 4px; }
.screw-bl { bottom: 4px; left: 4px; }
.screw-br { bottom: 4px; right: 4px; }
```

### Tape Deck Styling

```css
.tape-deck {
  margin-top: 40px;
}

.deck-housing {
  width: 300px;
  background: linear-gradient(
    180deg,
    #3a3a3a 0%,
    #2a2a2a 50%,
    #1a1a1a 100%
  );
  border-radius: 8px;
  padding: 20px;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    inset 0 -1px 0 rgba(0, 0, 0, 0.3),
    0 10px 30px rgba(0, 0, 0, 0.5);
}

.deck-slot {
  position: relative;
  height: 80px;
  background: #111;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.8);
}

.slot-opening {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 120px;
  height: 8px;
  background: linear-gradient(180deg, #000, #1a1a1a);
  border-radius: 0 0 4px 4px;
}

.deck-mechanism {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 30px;
  align-items: center;
}

.play-head {
  width: 8px;
  height: 20px;
  background: linear-gradient(90deg, #666, #888, #666);
  border-radius: 2px;
}

.capstan {
  width: 6px;
  height: 25px;
  background: linear-gradient(90deg, #888, #aaa, #888);
  border-radius: 3px;
}

.pinch-roller {
  width: 12px;
  height: 12px;
  background: #222;
  border-radius: 50%;
  box-shadow: inset 0 0 4px rgba(0, 0, 0, 0.5);
}

/* Controls */
.deck-controls {
  display: flex;
  justify-content: center;
  margin-top: 15px;
}

.deck-btn {
  width: 50px;
  height: 35px;
  background: linear-gradient(
    180deg,
    #555 0%,
    #444 50%,
    #333 100%
  );
  border: none;
  border-radius: 4px;
  cursor: pointer;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.2),
    0 3px 0 #222,
    0 5px 8px rgba(0, 0, 0, 0.3);
  transition: transform 0.1s, box-shadow 0.1s;
}

.deck-btn:hover {
  background: linear-gradient(
    180deg,
    #666 0%,
    #555 50%,
    #444 100%
  );
}

.deck-btn:active {
  transform: translateY(2px);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.2),
    0 1px 0 #222,
    0 2px 4px rgba(0, 0, 0, 0.3);
}

.btn-icon {
  font-size: 18px;
  color: #ddd;
}

/* Counter display */
.deck-display {
  margin-top: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.counter {
  display: flex;
  background: #111;
  padding: 4px 8px;
  border-radius: 3px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.5);
}

.digit {
  display: inline-block;
  width: 14px;
  height: 20px;
  background: #0a0a0a;
  color: #ff3333;
  font-family: 'Courier New', monospace;
  font-size: 16px;
  font-weight: bold;
  text-align: center;
  line-height: 20px;
  margin: 0 1px;
  text-shadow: 0 0 8px rgba(255, 50, 50, 0.5);
}

/* VU Meters */
.vu-meters {
  display: flex;
  gap: 8px;
}

.vu-meter {
  width: 60px;
  height: 8px;
  background: #111;
  border-radius: 2px;
  overflow: hidden;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.5);
}

.vu-meter::after {
  content: '';
  display: block;
  height: 100%;
  width: var(--level, 0%);
  background: linear-gradient(
    90deg,
    #00ff00 0%,
    #00ff00 60%,
    #ffff00 80%,
    #ff0000 100%
  );
  transition: width 0.1s ease-out;
}
```

### Tape Deck Controller

```javascript
class TapeDeck {
  constructor(options = {}) {
    this.rack = document.querySelector('.tape-rack');
    this.deck = document.querySelector('.tape-deck');
    this.deckSlot = document.querySelector('.deck-slot');
    this.viewport = document.querySelector('.content-viewport');
    this.counter = document.querySelector('.counter');
    this.vuMeters = document.querySelectorAll('.vu-meter');
    
    this.loadedCassette = null;
    this.loadedSection = null;
    this.isTransitioning = false;
    
    // External dependencies (injected)
    this.noiseGenerator = options.noiseGenerator;
    this.onLoadStart = options.onLoadStart || (() => {});
    this.onLoadComplete = options.onLoadComplete || (() => {});
    
    this.init();
  }

  init() {
    // Cassette click handlers
    this.rack.querySelectorAll('.cassette').forEach(cassette => {
      cassette.addEventListener('click', () => {
        const sectionId = cassette.dataset.section;
        this.loadTape(cassette, sectionId);
      });
    });

    // Eject button
    document.querySelector('.eject-btn').addEventListener('click', () => {
      this.ejectTape();
    });

    // Load initial section from URL hash
    const initialSection = window.location.hash.slice(1) || 'about';
    const initialCassette = this.rack.querySelector(`[data-section="${initialSection}"]`);
    if (initialCassette) {
      this.loadTape(initialCassette, initialSection);
    }
  }

  async loadTape(cassetteElement, sectionId) {
    if (this.isTransitioning) return;
    if (this.loadedSection === sectionId) return;

    this.isTransitioning = true;
    this.onLoadStart(sectionId);

    // Eject current tape if one is loaded
    if (this.loadedCassette) {
      await this.ejectTape(false); // silent eject
    }

    cassetteElement.classList.add('loading');

    // Phase 1: Lift cassette from rack
    await this.animateLift(cassetteElement);

    // Phase 2: Travel to deck
    await this.animateTravel(cassetteElement);

    // Phase 3: Insert into deck
    await this.animateInsert(cassetteElement);

    // Phase 4: Engage mechanism
    this.playEngageSound();
    await this.animateEngage();

    // Phase 5: Spin up reels
    await this.animateSpinup();

    // Phase 6: Reveal content
    await this.revealContent(sectionId);

    // Update state
    this.loadedCassette = cassetteElement;
    this.loadedSection = sectionId;
    cassetteElement.classList.remove('loading');
    cassetteElement.classList.add('loaded');
    
    // Update URL
    window.history.pushState(null, '', `#${sectionId}`);

    this.isTransitioning = false;
    this.onLoadComplete(sectionId);
  }

  async animateLift(cassette) {
    return cassette.animate([
      { transform: 'rotateX(15deg) translateY(0)' },
      { transform: 'rotateX(0deg) translateY(-30px)' }
    ], {
      duration: 250,
      easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      fill: 'forwards'
    }).finished;
  }

  async animateTravel(cassette) {
    const cassetteRect = cassette.getBoundingClientRect();
    const slotRect = this.deckSlot.getBoundingClientRect();

    const deltaX = (slotRect.left + slotRect.width / 2) - 
                   (cassetteRect.left + cassetteRect.width / 2);
    const deltaY = slotRect.top - cassetteRect.top;

    return cassette.animate([
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
      this.noiseGenerator.burst(150, 0.3);
    }

    // Trigger scanline roll
    document.querySelector('.scanlines')?.classList.add('rolling');
    setTimeout(() => {
      document.querySelector('.scanlines')?.classList.remove('rolling');
    }, 150);

    return cassette.animate([
      { transform: cassette.style.transform || 'translateY(0)', opacity: 1 },
      { transform: `${cassette.style.transform} translateY(40px) scale(0.85)`, opacity: 0 }
    ], {
      duration: 300,
      easing: 'cubic-bezier(0.4, 0, 1, 1)',
      fill: 'forwards'
    }).finished;
  }

  async animateEngage() {
    // Visual feedback that mechanism has grabbed tape
    this.deckSlot.classList.add('engaged');
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  async animateSpinup() {
    // Accelerate reel animation
    const reels = this.deckSlot.querySelectorAll('.reel, .mechanism-reel');
    reels.forEach(reel => {
      reel.style.animationDuration = '0.3s';
    });
    
    // Animate VU meters
    this.animateVUMeters();
    
    await new Promise(resolve => setTimeout(resolve, 400));
  }

  async revealContent(sectionId) {
    // Hide all sections
    this.viewport.querySelectorAll('.tape-content').forEach(section => {
      section.hidden = true;
      section.style.setProperty('--reveal-progress', '0%');
    });

    // Show target section
    const targetSection = this.viewport.querySelector(`[data-section="${sectionId}"]`);
    targetSection.hidden = false;

    // Animate reveal synchronized with counter
    return new Promise(resolve => {
      let progress = 0;
      const animate = () => {
        progress += 1.5;
        
        targetSection.style.setProperty('--reveal-progress', `${progress}%`);
        this.updateCounter(Math.floor(progress * 9.99)); // 0-999

        if (progress < 100) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
      requestAnimationFrame(animate);
    });
  }

  async ejectTape(triggerEffects = true) {
    if (!this.loadedCassette) return;

    this.isTransitioning = true;

    // Spindown
    const reels = this.deckSlot.querySelectorAll('.reel');
    reels.forEach(reel => {
      reel.style.animationDuration = '4s';
    });

    if (triggerEffects && this.noiseGenerator) {
      this.noiseGenerator.burst(150, 0.4);
    }

    // Hide content
    await this.hideContent();

    // Eject animation with spring physics
    const cassette = this.loadedCassette;
    
    // Reset cassette position
    cassette.style.transform = '';
    cassette.classList.remove('loaded');

    await cassette.animate([
      { opacity: 0, transform: 'translateY(20px) scale(0.85)' },
      { opacity: 1, transform: 'translateY(-20px) scale(1.05)' },
      { opacity: 1, transform: 'translateY(0) rotateX(15deg) scale(1)' }
    ], {
      duration: 500,
      easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      fill: 'forwards'
    }).finished;

    this.deckSlot.classList.remove('engaged');
    this.loadedCassette = null;
    this.loadedSection = null;
    this.isTransitioning = false;
  }

  async hideContent() {
    const currentSection = this.viewport.querySelector(`[data-section="${this.loadedSection}"]`);
    if (!currentSection) return;

    return new Promise(resolve => {
      let progress = 100;
      const animate = () => {
        progress -= 2;
        currentSection.style.setProperty('--reveal-progress', `${progress}%`);
        this.updateCounter(Math.floor(progress * 9.99));

        if (progress > 0) {
          requestAnimationFrame(animate);
        } else {
          currentSection.hidden = true;
          resolve();
        }
      };
      requestAnimationFrame(animate);
    });
  }

  updateCounter(value) {
    const digits = this.counter.querySelectorAll('.digit');
    const str = String(value).padStart(3, '0');
    
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
      if (!this.loadedCassette) return;
      
      this.vuMeters.forEach(meter => {
        // Randomized levels for visual interest
        const level = 40 + Math.random() * 50;
        meter.style.setProperty('--level', `${level}%`);
      });
      
      setTimeout(() => requestAnimationFrame(animate), 100);
    };
    animate();
  }

  playEngageSound() {
    // Optional: play actual audio
    // const audio = new Audio('/sounds/tape-engage.mp3');
    // audio.play();
  }
}
```

### Content Reveal CSS

```css
.tape-content {
  position: relative;
  padding: 40px;
  
  /* Clip-path reveal effect */
  clip-path: inset(0 calc(100% - var(--reveal-progress, 0%)) 0 0);
  
  /* Alternative: gradient mask */
  /* mask-image: linear-gradient(
    to right,
    black var(--reveal-progress, 0%),
    transparent var(--reveal-progress, 0%)
  ); */
}

.tape-content[hidden] {
  display: none;
}

/* Digit flip animation */
.digit.flipping {
  animation: digit-flip 0.15s ease-out;
}

@keyframes digit-flip {
  0% {
    transform: translateY(-100%);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Deck engaged state */
.deck-slot.engaged .deck-mechanism {
  animation: mechanism-pulse 0.5s ease;
}

@keyframes mechanism-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
```

---

## 4. Integration Points

### Connecting the Systems

```javascript
// Main initialization
document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize CRT overlay
  const noiseCanvas = document.querySelector('.noise-canvas');
  const noiseGenerator = new NoiseGenerator(noiseCanvas);

  // 2. Initialize minions
  const ravage = new Ravage(document.getElementById('ravage'));
  const laserbeak = new Laserbeak(document.getElementById('laserbeak'));
  
  const minionController = new MinionController([ravage, laserbeak]);

  // 3. Initialize tape deck with integrations
  const tapeDeck = new TapeDeck({
    noiseGenerator,
    
    onLoadStart: (sectionId) => {
      // Laserbeak loading indicator
      const slot = document.querySelector('.deck-slot');
      const rect = slot.getBoundingClientRect();
      laserbeak.startLoading(rect.left + rect.width / 2, rect.top + rect.height / 2);
    },
    
    onLoadComplete: (sectionId) => {
      laserbeak.stopLoading();
      
      // Random chance for Ravage reaction
      if (Math.random() > 0.7) {
        setTimeout(() => ravage.prowl(), 1000);
      }
    }
  });

  // 4. Setup chromatic text
  document.querySelectorAll('.chromatic-text').forEach(el => {
    el.dataset.text = el.textContent;
  });

  // 5. Ravage eye tracking on hover over deck
  document.querySelector('.tape-deck').addEventListener('mouseenter', () => {
    ravage.startTracking();
    ravage.element.style.left = 'calc(100% - 100px)';
    ravage.element.style.top = 'calc(100% - 80px)';
    ravage.show();
  });

  document.querySelector('.tape-deck').addEventListener('mouseleave', () => {
    ravage.stopTracking();
    ravage.hide();
  });
});
```

### CSS Custom Properties for Faction Theming

```css
:root {
  /* Soundwave (default) */
  --faction-primary: rgb(147, 112, 219);
  --faction-secondary: rgb(75, 0, 130);
  --faction-accent: rgb(200, 180, 255);
  --faction-glow: rgba(147, 112, 219, 0.6);
}

[data-faction="blaster"] {
  --faction-primary: rgb(255, 140, 0);
  --faction-secondary: rgb(178, 34, 34);
  --faction-accent: rgb(255, 215, 0);
  --faction-glow: rgba(255, 140, 0, 0.6);
}
```

### Performance Considerations

1. **Throttle eye tracking** to 30fps max
2. **Use `will-change`** on animated elements sparingly
3. **Pause animations** when tab is not visible:

```javascript
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Pause reel animations, minion movements, etc.
    document.body.classList.add('animations-paused');
  } else {
    document.body.classList.remove('animations-paused');
  }
});
```

```css
.animations-paused .reel,
.animations-paused .minion {
  animation-play-state: paused;
}
```

4. **Reduce motion** for accessibility:

```css
@media (prefers-reduced-motion: reduce) {
  .reel,
  .minion,
  .scanlines,
  .flicker-layer {
    animation: none;
  }
  
  .tape-content {
    clip-path: none;
  }
  
  .cassette-body {
    transition: none;
  }
}
```

---

## File Structure Recommendation

```
/
├── index.html
├── 404.html
├── css/
│   ├── main.css
│   ├── crt-overlay.css
│   ├── cassettes.css
│   ├── tape-deck.css
│   └── minions.css
├── js/
│   ├── main.js
│   ├── noise-generator.js
│   ├── minion.js
│   ├── ravage.js
│   ├── laserbeak.js
│   ├── ratbat-hunt.js
│   └── tape-deck.js
├── svg/
│   ├── ravage.svg
│   ├── laserbeak.svg
│   ├── ratbat.svg
│   ├── steeljaw.svg
│   └── ramhorn.svg
└── sounds/ (optional)
    ├── tape-engage.mp3
    └── eject.mp3
```
