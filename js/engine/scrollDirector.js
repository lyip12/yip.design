/**
 * Infinite Kinetic Vernier Role Headline Director
 *
 * Maps wheel, trackpad inertia, touch swipes, keyboard arrows, and direct jumps into:
 * - Endless circular translation of the discipline typography drum through the focal reticle
 * - Tactile mechanical detent snapping across all disciplines with zero top/bottom boundaries
 * - Crisp transitions of role bio, metadata, HUD rails, radar orbit, and active card stack
 */

export class ScrollDirector {
  constructor({ roles, onRoleChange, telemetry }) {
    this.roles = roles;
    this.onRoleChange = onRoleChange;
    this.telemetry = telemetry;

    this.drumViewport = document.getElementById('role-drum-viewport');
    this.drumTrack = document.getElementById('role-drum-track');
    this.focalBracketEl = this.drumViewport?.querySelector('.role-focal-bracket') || null;
    this.progressDotsEl = document.getElementById('hud-progress-dots');

    this.activeIndex = -1;
    this.targetProgress = 0; // Unbounded continuous float across infinite cycles
    this.currentProgress = 0;
    this.animTargetStep = 0;
    this.jumpTargetRoleIdx = null;
    this.drumItems = [];
    this.progressDots = [];
    this.snapPulseTimer = null;

    // Smooth detent animation state
    this.animRafId = null;
    this.isAnimating = false;

    // Wheel & macOS trackpad inertia state
    this.wheelAccum = 0;
    this.lastWheelTime = 0;
    this.lastAbsDelta = 0;
    this.gestureActive = false;
    this.gestureDir = 0;
    this.gestureCooldownUntil = 0;

    // Touch gesture state
    this.isTouching = false;
    this.touchLockedAxis = null;
    this.touchStartY = 0;
    this.touchStartX = 0;
    this.lastTouchY = 0;
    this.touchStartStep = 0;

    this.buildDrumUI();
    this.bindEvents();
    this.syncImmediate();
    this.startLoop();
  }

  wrapIndex(step) {
    const n = this.roles.length;
    if (!n) return 0;
    return ((step % n) + n) % n;
  }

  buildDrumUI() {
    if (this.drumTrack) {
      this.drumTrack.innerHTML = '';
      this.roles.forEach((role, i) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'role-drum-item';
        btn.dataset.roleIdx = String(i);
        btn.setAttribute('aria-label', `Jump to ${role.index} ${role.title}`);
        btn.innerHTML = `
          <span class="role-drum-num tabular">${role.index}</span>
          <span class="role-drum-title">${role.title}</span>
        `;
        btn.addEventListener('click', () => this.scrollToRole(i));
        this.drumTrack.appendChild(btn);
        this.drumItems.push(btn);
      });
    }

    if (this.progressDotsEl) {
      this.progressDotsEl.innerHTML = '';
      this.roles.forEach((role, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'hud-pdot';
        dot.title = `${role.index} ${role.title}`;
        dot.setAttribute('aria-label', `Jump to ${role.title}`);
        dot.addEventListener('click', () => this.scrollToRole(i));
        this.progressDotsEl.appendChild(dot);
        this.progressDots.push(dot);
      });
    }
  }

  hasOpenModal() {
    return Boolean(document.querySelector('.modal-backdrop.is-open'));
  }

  bindEvents() {
    window.addEventListener(
      'resize',
      () => {
        this.renderDrumPosition();
      },
      { passive: true }
    );

    // Infinite wheel & macOS trackpad detent snapping
    window.addEventListener('wheel', (e) => this.handleWheel(e), { passive: false });

    // Infinite vertical touch swipe snapping (ignores drags on cards/controls/modals)
    window.addEventListener(
      'touchstart',
      (e) => {
        if (this.hasOpenModal() || e.touches.length !== 1) return;
        if (e.target?.closest('.specimen-card, .deck-controls, .hud-interactive, .modal-backdrop')) {
          return;
        }
        this.cancelScrollAnimation();
        this.isTouching = true;
        this.touchLockedAxis = null;
        this.touchStartY = e.touches[0].clientY;
        this.touchStartX = e.touches[0].clientX;
        this.lastTouchY = this.touchStartY;
        this.touchStartStep = Math.round(this.targetProgress);
      },
      { passive: true }
    );

    window.addEventListener(
      'touchmove',
      (e) => {
        if (!this.isTouching || !e.touches.length) return;
        const curY = e.touches[0].clientY;
        const curX = e.touches[0].clientX;
        const dy = this.touchStartY - curY; // Positive = swiped up (advance forward)
        const dx = curX - this.touchStartX;

        if (!this.touchLockedAxis && (Math.abs(dy) > 6 || Math.abs(dx) > 6)) {
          this.touchLockedAxis = Math.abs(dy) >= Math.abs(dx) ? 'y' : 'x';
        }
        if (this.touchLockedAxis !== 'y') return;

        e.preventDefault();
        this.lastTouchY = curY;

        const stepPx = Math.max(140, window.innerHeight * 0.28);
        this.targetProgress = this.touchStartStep + dy / stepPx;
        this.jumpTargetRoleIdx = null;
        this.updateRoleFromProgress();
        this.updateTelemetryVector(this.targetProgress);
      },
      { passive: false }
    );

    const endTouch = () => {
      if (!this.isTouching) return;
      const wasVertical = this.touchLockedAxis === 'y';
      this.isTouching = false;
      this.touchLockedAxis = null;
      if (!wasVertical) return;

      const dy = this.touchStartY - this.lastTouchY;
      let targetStep = Math.round(this.targetProgress);
      if (targetStep === this.touchStartStep && Math.abs(dy) >= 28) {
        targetStep = this.touchStartStep + Math.sign(dy);
      }
      this.snapToStep(targetStep);
    };

    window.addEventListener('touchend', endTouch, { passive: true });
    window.addEventListener('touchcancel', endTouch, { passive: true });
  }

  handleWheel(e) {
    if (this.hasOpenModal()) return;
    if (e.ctrlKey || e.metaKey) return; // Allow browser pinch-zoom

    // Normalize line/page wheel units to pixels
    let dy = e.deltaY;
    let dx = e.deltaX;
    if (e.deltaMode === 1) {
      dy *= 32;
      dx *= 32;
    } else if (e.deltaMode === 2) {
      dy *= window.innerHeight;
      dx *= window.innerWidth;
    }

    if (Math.abs(dx) > Math.abs(dy) || Math.abs(dy) < 1) return;

    e.preventDefault();

    const dir = Math.sign(dy);
    const absDelta = Math.abs(dy);
    const now = performance.now();
    const dt = now - this.lastWheelTime;
    const prevAbsDelta = this.lastAbsDelta;
    this.lastWheelTime = now;
    this.lastAbsDelta = absDelta;

    // Immediate reversal unlocks gesture for responsive back-and-forth scrubbing
    if (this.gestureActive && dir !== this.gestureDir && absDelta >= 10) {
      this.gestureActive = false;
      this.wheelAccum = 0;
    }

    if (this.gestureActive) {
      // Unlock only after cooldown on a genuine pause, a fresh velocity spike, or a new mouse-wheel notch
      const pauseEnded = dt > 180 && now >= this.gestureCooldownUntil;
      const isFreshTrackpadImpulse =
        now >= this.gestureCooldownUntil &&
        absDelta >= 18 &&
        absDelta > prevAbsDelta * 1.45;
      const isDiscreteWheelTick =
        now >= this.gestureCooldownUntil - 160 &&
        absDelta >= 85 &&
        absDelta >= prevAbsDelta * 0.9 &&
        dt >= 90;

      if (!pauseEnded && !isFreshTrackpadImpulse && !isDiscreteWheelTick) {
        return;
      }
      this.gestureActive = false;
      this.wheelAccum = 0;
    } else if (dt > 140) {
      this.wheelAccum = 0;
    }

    if (this.wheelAccum !== 0 && Math.sign(this.wheelAccum) !== dir) {
      this.wheelAccum = 0;
    }
    this.wheelAccum += dy;

    if (Math.abs(this.wheelAccum) >= 24) {
      const baseStep = this.isAnimating ? this.animTargetStep : Math.round(this.targetProgress);
      this.wheelAccum = 0;
      this.gestureActive = true;
      this.gestureDir = dir;
      this.gestureCooldownUntil = now + 460;
      this.snapToStep(baseStep + dir);
    }
  }

  cancelScrollAnimation() {
    if (this.animRafId) {
      cancelAnimationFrame(this.animRafId);
      this.animRafId = null;
    }
    this.isAnimating = false;
  }

  snapToStep(targetStep, { directRoleIdx = null } = {}) {
    const startProgress = this.targetProgress;
    const dist = targetStep - startProgress;

    this.cancelScrollAnimation();
    this.animTargetStep = targetStep;
    this.jumpTargetRoleIdx = directRoleIdx;

    if (directRoleIdx !== null && directRoleIdx !== this.activeIndex) {
      this.activateRole(directRoleIdx);
    }

    if (Math.abs(dist) <= 0.001) {
      this.targetProgress = targetStep;
      this.jumpTargetRoleIdx = null;
      this.updateRoleFromProgress();
      this.updateTelemetryVector(this.targetProgress);
      return;
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      this.targetProgress = targetStep;
      this.currentProgress = targetStep;
      this.jumpTargetRoleIdx = null;
      this.updateRoleFromProgress();
      this.updateTelemetryVector(this.targetProgress);
      this.renderDrumPosition();
      return;
    }

    // Crisp mechanical easing: fast decisive departure, calm magnetic settle
    const duration = Math.round(Math.min(680, Math.max(400, 420 + (Math.abs(dist) - 1) * 52)));
    const startTime = performance.now();

    this.isAnimating = true;

    const animate = (now) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      // Ease-out quartic curve matching --ease-mechanical feel
      const eased = 1 - Math.pow(1 - t, 4);
      this.targetProgress = startProgress + dist * eased;

      this.updateRoleFromProgress();
      this.updateTelemetryVector(this.targetProgress);

      if (t < 1) {
        this.animRafId = requestAnimationFrame(animate);
      } else {
        this.targetProgress = targetStep;
        this.animRafId = null;
        this.isAnimating = false;
        this.jumpTargetRoleIdx = null;
        this.updateRoleFromProgress();
        this.updateTelemetryVector(this.targetProgress);
      }
    };

    this.animRafId = requestAnimationFrame(animate);
  }

  updateRoleFromProgress() {
    if (this.jumpTargetRoleIdx !== null) return;
    const nextIdx = this.wrapIndex(Math.round(this.targetProgress));
    if (nextIdx !== this.activeIndex) {
      this.activateRole(nextIdx);
    }
  }

  updateTelemetryVector(progress) {
    const n = Math.max(1, this.roles.length);
    const angle = (progress / n) * Math.PI * 2;
    const vecX = (Math.sin(angle) * 32).toFixed(1);
    const vecY = (-Math.cos(angle) * 50).toFixed(1);
    this.telemetry?.setVectorReadout(vecX, vecY);
  }

  syncImmediate() {
    this.currentProgress = this.targetProgress;
    this.activateRole(this.wrapIndex(Math.round(this.targetProgress)));
    this.updateTelemetryVector(this.currentProgress);
    this.renderDrumPosition();
  }

  activateRole(idx) {
    const isInitial = this.activeIndex === -1;
    this.activeIndex = idx;
    const role = this.roles[idx];
    if (!role) return;

    this.drumItems.forEach((el, i) => el.classList.toggle('is-active', i === idx));
    this.progressDots.forEach((el, i) => el.classList.toggle('is-active', i === idx));

    if (!isInitial && this.focalBracketEl) {
      this.focalBracketEl.classList.remove('is-snapped');
      void this.focalBracketEl.offsetWidth;
      this.focalBracketEl.classList.add('is-snapped');
      clearTimeout(this.snapPulseTimer);
      this.snapPulseTimer = setTimeout(() => {
        this.focalBracketEl?.classList.remove('is-snapped');
      }, 340);
    }

    this.onRoleChange?.(role, idx);
  }

  scrollToRole(idx) {
    const n = this.roles.length;
    if (!n) return;
    const baseStep = this.isAnimating ? this.animTargetStep : Math.round(this.targetProgress);
    const targetMod = this.wrapIndex(idx);
    const currentMod = this.wrapIndex(baseStep);

    // Take the shortest circular path around the infinite drum
    let delta = targetMod - currentMod;
    if (delta > n / 2) delta -= n;
    if (delta < -n / 2) delta += n;

    this.snapToStep(baseStep + delta, {
      directRoleIdx: Math.abs(delta) > 1 ? targetMod : null,
    });
  }

  stepRole(delta) {
    if (this.hasOpenModal()) return;
    const baseStep = this.isAnimating ? this.animTargetStep : Math.round(this.targetProgress);
    this.snapToStep(baseStep + delta);
  }

  renderDrumPosition() {
    if (!this.drumViewport || !this.drumItems.length) return;
    const n = this.drumItems.length;
    const halfN = n / 2;
    const vpH = this.drumViewport.offsetHeight;
    const itemH = this.drumItems[0].offsetHeight || 76;
    const centerOffset = (vpH - itemH) / 2;

    // Circular Vernier drum positioning: each discipline wraps seamlessly around the cylinder
    for (let i = 0; i < n; i++) {
      const raw = i - this.currentProgress;
      const delta = ((((raw + halfN) % n) + n) % n) - halfN;
      const absDist = Math.abs(delta);
      const y = centerOffset + delta * itemH;
      const opacity = absDist > 2.2 ? 0 : Math.max(0.16, 1 - absDist * 0.68);
      const scale = Math.max(0.9, 1 - absDist * 0.06);

      const el = this.drumItems[i];
      el.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0) scale(${scale.toFixed(3)})`;
      el.style.setProperty('--drum-opacity', opacity.toFixed(3));
      el.style.pointerEvents = absDist <= 1.6 ? 'auto' : 'none';
    }
  }

  startLoop() {
    let lastTime = performance.now();
    const tick = (now) => {
      const dt = Math.min(0.1, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;

      const diff = this.targetProgress - this.currentProgress;
      if (Math.abs(diff) < 0.0005) {
        this.currentProgress = this.targetProgress;
      } else {
        const factor = 1 - Math.exp(-18 * dt);
        this.currentProgress += diff * factor;
      }
      this.renderDrumPosition();
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
}
