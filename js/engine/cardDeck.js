/**
 * Tactile Draggable Specimen Card Stack Engine
 *
 * Physics & Interactions:
 * - Free-form drag & drop anywhere on the studio table to reveal cards underneath
 * - Velocity-coupled tilt, momentum settle, and generous viewport clamping
 * - Animated corner crosshair reticles + ambient halftone glow intensification
 * - Click (pointer move < 6px) opens the Specimen Dossier modal
 * - Quick actions: NEXT (cycle top card to bottom), FAN OUT, and magnetic RESTACK
 * - Remembers arranged card layouts per role while navigating in the same session
 */

import { renderVisualHTML } from '../visuals/artworkRenderer.js';

export class CardDeckEngine {
  constructor({
    arenaEl,
    statusEl,
    fanBtn,
    hintEl,
    telemetry,
    onInspectCard,
    onActiveSpecimenChange,
  }) {
    this.arenaEl = arenaEl;
    this.statusEl = statusEl;
    this.fanBtn = fanBtn;
    this.hintEl = hintEl;
    this.telemetry = telemetry;
    this.onInspectCard = onInspectCard;
    this.onActiveSpecimenChange = onActiveSpecimenChange;

    this.currentRole = null;
    this.cards = []; // Array of runtime card state objects
    this.hoveredCards = new Set(); // Track cards directly under pointer for #deck-hint visibility
    this.hintHideTimer = null;
    this.roleLayouts = new Map(); // Preserve per-role card positions when scrolling back
    this.isFanned = false;
    this.topZ = 20;
    this.hasInteracted = false;
    this.cycleTimer = null;
    this.pendingCycleFinish = null;

    this.rafId = null;
    this.startPhysicsLoop();
  }

  /**
   * Shows the drag/inspect hint only while hovering directly over a card or dragging one.
   * Uses a brief hide debounce so moving between overlapping or spread cards never flickers.
   */
  syncHintVisibility(immediate = false) {
    if (!this.hintEl) return;
    const isActive =
      this.hoveredCards.size > 0 || this.cards.some((c) => c.dragging);

    clearTimeout(this.hintHideTimer);
    if (isActive) {
      this.hintEl.classList.add('is-visible');
    } else if (immediate) {
      this.hintEl.classList.remove('is-visible');
    } else {
      this.hintHideTimer = setTimeout(() => {
        if (this.hoveredCards.size === 0 && !this.cards.some((c) => c.dragging)) {
          this.hintEl?.classList.remove('is-visible');
        }
      }, 90);
    }
  }

  /**
   * Loads and deals the card stack for a given role
   */
  setRole(role) {
    if (this.currentRole && this.currentRole.id === role.id) return;

    clearTimeout(this.cycleTimer);
    this.pendingCycleFinish = null;

    // Save current layout before switching roles
    if (this.currentRole && this.cards.length) {
      this.roleLayouts.set(
        this.currentRole.id,
        this.cards.map((c) => ({
          code: c.data.code,
          tx: c.tx,
          ty: c.ty,
          trot: c.trot,
          z: c.z,
          moved: c.moved,
        }))
      );
    }

    this.currentRole = role;
    this.isFanned = false;

    // Clear existing cards (keep base-plate element intact)
    const oldCards = this.arenaEl.querySelectorAll('.specimen-card');
    oldCards.forEach((el) => el.remove());
    this.cards = [];
    this.hoveredCards.clear();
    this.syncHintVisibility(true);
    this.topZ = 20;

    const saved = this.roleLayouts.get(role.id);
    const total = role.cards.length;

    // Build cards: index 0 is topmost card initially, index total-1 is bottommost
    role.cards.forEach((cardData, i) => {
      const stackOrderFromBottom = total - 1 - i;
      const home = this.computeHomePose(i, total);
      const savedCard = saved ? saved.find((s) => s.code === cardData.code) : null;

      const el = this.createCardElement(cardData, i, total);
      this.arenaEl.appendChild(el);

      const startX = home.x;
      const startY = home.y + 34 + i * 7;
      const startRot = home.rot * 1.4;

      const state = {
        index: i,
        data: cardData,
        el,
        homeX: home.x,
        homeY: home.y,
        homeRot: home.rot,
        // Current interpolated values (start offset below for crisp spring deal-in)
        x: startX,
        y: startY,
        rot: startRot,
        scale: 0.94,
        // Target values
        tx: savedCard ? savedCard.tx : home.x,
        ty: savedCard ? savedCard.ty : home.y,
        trot: savedCard ? savedCard.trot : home.rot,
        tscale: 1,
        z: savedCard ? savedCard.z : 10 + stackOrderFromBottom,
        moved: savedCard ? savedCard.moved : false,
        dragging: false,
        vx: 0,
        vy: 0,
        lastClientX: 0,
        lastClientY: 0,
        downClientX: 0,
        downClientY: 0,
        startCardX: 0,
        startCardY: 0,
        travelDist: 0,
        delayFrames: i * 2,
      };

      if (state.z >= this.topZ) this.topZ = state.z + 1;

      el.style.zIndex = String(state.z);
      el.style.transform = `translate3d(${state.x}px, ${state.y}px, 0) rotate(${state.rot}deg) scale(${state.scale})`;

      this.bindCardEvents(state);
      this.cards.push(state);
    });

    this.updateFanButton();
    this.updateDeckReadouts();

    // If the pointer is already resting over the newly dealt cards, reveal the hint cleanly
    requestAnimationFrame(() => {
      const hovered = this.cards.find((c) => c.el.matches(':hover'));
      if (hovered) {
        this.hoveredCards.add(hovered);
        this.syncHintVisibility();
      }
    });
  }

  /**
   * Computes deterministic, organically stacked resting pose so the stack depth reveals
   * edges of the frosted glass, crisp white, and matte obsidian layers underneath
   */
  computeHomePose(index, total) {
    if (index === 0) {
      return { x: 0, y: 0, rot: -0.5 };
    }
    const seed = Math.sin(index * 2.37 + total * 0.7);
    const angleSign = index % 2 === 0 ? 1 : -1;
    const rot = angleSign * Math.min(5.8, 1.7 + index * 0.58 + seed * 0.6);
    const x = angleSign * Math.min(22, 5 + index * 2.2) + seed * 3.2;
    const y = (index % 2 === 0 ? -1 : 1) * Math.min(6, 1.2 + index * 0.65) + seed * 1.5;
    return { x, y, rot };
  }

  /**
   * Renders the signature liquid-bridged pill + arrow circle CTA (metaball silhouette)
   */
  renderMetaballCTA(variant = 'pill', label = 'Inspect') {
    if (variant === 'compact') {
      return `
        <span class="card-metaball card-metaball--compact" aria-hidden="true">
          <svg class="metaball-compact-svg" viewBox="0 0 54 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="10" width="17" height="12" rx="6" fill="currentColor" />
            <circle cx="38" cy="16" r="13" fill="currentColor" />
            <path
              d="M15 10.6L18.5 10.6C22.4 11.4 25.6 9.6 29.5 6.16L34 6.16L34 25.84L29.5 25.84C25.6 22.4 22.4 20.6 18.5 21.4L15 21.4Z"
              fill="currentColor"
            />
            <path
              class="metaball-chevron"
              d="M36.5 12.6L40 16L36.5 19.4"
              stroke="#FFFFFF"
              stroke-width="1.65"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </span>
      `;
    }

    return `
      <span class="card-metaball card-metaball--labeled" aria-hidden="true">
        <span class="metaball-pill">${label}</span>
        <svg class="metaball-bridge" viewBox="0 0 24 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0 3.72L5.5 3.72C9.5 7.42 14.5 7.42 18.5 3.72L24 3.72L24 24.28L18.5 24.28C14.5 20.58 9.5 20.58 5.5 24.28L0 24.28Z"
            fill="currentColor"
          />
        </svg>
        <span class="metaball-orb">
          <svg class="metaball-chevron" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4.5 2.75L7.75 6L4.5 9.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </span>
      </span>
    `;
  }

  createCardElement(card, index, total) {
    const surfaces = ['glass', 'white', 'obsidian'];
    const surface = surfaces[index % surfaces.length];
    const visualType = card.visual?.type || 'svg';

    const el = document.createElement('article');
    el.className = `specimen-card specimen-card--${surface} specimen-card--media-${visualType}`;
    el.dataset.surface = surface;
    el.setAttribute('tabindex', '0');
    el.setAttribute('role', 'button');
    el.setAttribute('aria-label', `${card.title} — drag to move or click to inspect`);

    const numStr = String(index + 1).padStart(2, '0');
    const totStr = String(total).padStart(2, '0');
    const roleName = this.currentRole?.title || 'Archive';
    const mediaHTML = renderVisualHTML(card.visual, card.title);

    if (surface === 'glass') {
      el.innerHTML = `
        <div class="card-specular" aria-hidden="true"></div>

        <header class="glass-topbar">
          <span class="glass-whisper tabular">Specimen ${numStr} / ${totStr}</span>
          <span class="glass-year tabular">${card.year}</span>
        </header>

        <div class="glass-title-row">
          <h3 class="card-title">${card.title}</h3>
          <span class="glass-outline-pill">
            <span class="pill-dot-badge" aria-hidden="true"></span>
            <span>${card.code}</span>
          </span>
        </div>

        <div class="card-media">
          ${mediaHTML}
        </div>

        <div class="glass-field-pill">
          <span class="glass-field-icon" aria-hidden="true">
            <svg viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="7" cy="7" r="4.5" stroke="currentColor" stroke-width="1.15" />
              <circle cx="7" cy="7" r="1.4" fill="currentColor" />
            </svg>
          </span>
          <p class="card-subtitle">${card.subtitle}</p>
        </div>

        <footer class="glass-footer">
          <div class="glass-micro-meta">
            <span class="glass-meta-primary">${card.medium}</span>
            <span class="glass-meta-secondary">${card.location}</span>
          </div>
          ${this.renderMetaballCTA('compact')}
        </footer>
      `;
    } else if (surface === 'white') {
      el.innerHTML = `
        <div class="white-orb-glow" aria-hidden="true"></div>
        <div class="white-frost-pane" aria-hidden="true"></div>
        <div class="card-specular" aria-hidden="true"></div>

        <header class="white-header">
          <div class="white-index-stack">
            <span class="white-big-num tabular">${numStr}</span>
            <span class="white-big-year tabular">${card.year}</span>
          </div>
          <div class="white-corner-caption">
            <span>${roleName}</span>
            <span>${card.code}</span>
          </div>
        </header>

        <div class="card-media">
          ${mediaHTML}
        </div>

        <div class="white-copy-block">
          <h3 class="card-title">${card.title}</h3>
          <p class="card-subtitle">${card.subtitle}</p>
        </div>

        <footer class="white-footer">
          <div class="white-brand-mark">
            <span class="white-emblem" aria-hidden="true">
              <svg viewBox="0 0 22 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 11.5C3.5 5.2 7.2 2.5 11 2.5C14.8 2.5 18.5 5.2 20 11.5" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" />
                <circle cx="11" cy="9.2" r="2.2" fill="currentColor" />
              </svg>
            </span>
            <span class="white-mark-label">${card.location}</span>
          </div>
          ${this.renderMetaballCTA('pill', 'Inspect')}
        </footer>
      `;
    } else {
      el.innerHTML = `
        <div class="card-specular" aria-hidden="true"></div>

        <header class="obsidian-header">
          <div class="obsidian-heading">
            <h3 class="card-title">${card.title}</h3>
            <p class="card-subtitle">${card.subtitle}</p>
          </div>
          <span class="obsidian-pill tabular">${numStr}</span>
        </header>

        <div class="card-media">
          ${mediaHTML}
        </div>

        <footer class="obsidian-footer">
          <div class="obsidian-meta">
            <span class="obsidian-meta-code">${card.code}</span>
            <span class="obsidian-meta-loc">${card.year} · ${card.location}</span>
          </div>
          <span class="obsidian-discover" aria-hidden="true">
            <span>Discover</span>
            <svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4.5 2.75L7.75 6L4.5 9.25" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
        </footer>
      `;
    }

    return el;
  }

  bindCardEvents(card) {
    const el = card.el;

    el.addEventListener('pointerenter', () => {
      this.hoveredCards.add(card);
      this.syncHintVisibility();
      this.telemetry?.setGlowBoost(0.7);
      this.onActiveSpecimenChange?.(card.data.specimenNo);
    });

    el.addEventListener('pointerleave', () => {
      this.hoveredCards.delete(card);
      this.syncHintVisibility();
      if (!card.dragging) {
        this.telemetry?.setGlowBoost(0);
      }
    });

    el.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      e.preventDefault();

      card.dragging = true;
      this.syncHintVisibility();
      card.delayFrames = 0;
      card.downClientX = e.clientX;
      card.downClientY = e.clientY;
      card.lastClientX = e.clientX;
      card.lastClientY = e.clientY;
      card.startCardX = card.x;
      card.startCardY = card.y;
      card.vx = 0;
      card.vy = 0;
      card.travelDist = 0;

      // Lift to top of deck
      this.topZ += 1;
      card.z = this.topZ;
      el.style.zIndex = String(card.z);
      el.classList.add('is-dragging');
      card.tscale = 1.035;

      try {
        el.setPointerCapture(e.pointerId);
      } catch (_) {}

      this.telemetry?.setGlowBoost(1);
      this.onActiveSpecimenChange?.(card.data.specimenNo);
      this.updateDeckReadouts();
    });

    el.addEventListener('pointermove', (e) => {
      if (!card.dragging) return;

      const dx = e.clientX - card.downClientX;
      const dy = e.clientY - card.downClientY;
      const stepX = e.clientX - card.lastClientX;
      const stepY = e.clientY - card.lastClientY;

      card.vx = card.vx * 0.6 + stepX * 0.4;
      card.vy = card.vy * 0.6 + stepY * 0.4;
      card.lastClientX = e.clientX;
      card.lastClientY = e.clientY;
      card.travelDist = Math.hypot(dx, dy);

      card.tx = card.startCardX + dx;
      card.ty = card.startCardY + dy;

      // Tactile velocity-coupled tilt while dragging
      const tilt = Math.max(-16, Math.min(16, card.homeRot + card.vx * 0.45));
      card.trot = tilt;

      // Broadcast displacement telemetry to bottom-right HUD
      this.telemetry?.setVectorReadout(card.tx / 8, -card.ty / 8);

      if (card.travelDist > 12 && !this.hasInteracted) {
        this.hasInteracted = true;
        this.hintEl?.classList.add('is-subtle');
      }
    });

    const endDrag = (e) => {
      if (!card.dragging) return;
      card.dragging = false;
      el.classList.remove('is-dragging');
      card.tscale = 1;

      if (e.pointerType !== 'mouse') {
        this.hoveredCards.delete(card);
      }
      this.syncHintVisibility();

      try {
        if (el.hasPointerCapture(e.pointerId)) {
          el.releasePointerCapture(e.pointerId);
        }
      } catch (_) {}

      this.telemetry?.setGlowBoost(0);

      // Distinguish crisp click (inspect dossier) vs drag (move & place)
      if (card.travelDist < 6) {
        this.hoveredCards.clear();
        this.syncHintVisibility(true);
        this.onInspectCard?.(this.currentRole, card.index);
        return;
      }

      // Momentum inertia settle + generous viewport clamping so cards stay reachable
      const projectedX = card.tx + card.vx * 4.2;
      const projectedY = card.ty + card.vy * 4.2;
      const clamped = this.clampToWorkspace(projectedX, projectedY);

      card.tx = clamped.x;
      card.ty = clamped.y;

      // Organic resting angle where dropped
      const restingRot = Math.max(-13, Math.min(13, card.homeRot + card.vx * 0.28 + (Math.random() - 0.5) * 2.2));
      card.trot = restingRot;
      card.moved = Math.hypot(card.tx - card.homeX, card.ty - card.homeY) > 22;

      this.isFanned = false;
      this.updateFanButton();
      this.updateDeckReadouts();
    };

    el.addEventListener('pointerup', endDrag);
    el.addEventListener('pointercancel', endDrag);

    // Keyboard accessibility: Enter/Space inspects the focused card
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.onInspectCard?.(this.currentRole, card.index);
      }
    });
  }

  /**
   * Generous desk boundary accounting for card half-dimensions so dragged or fanned cards
   * can roam widely without ever clipping off the viewport or covering the top brand HUD.
   */
  clampToWorkspace(tx, ty) {
    const rect = this.arenaEl.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const sampleCard = this.cards[0]?.el;
    const halfW = sampleCard ? sampleCard.offsetWidth / 2 : 165;
    const halfH = sampleCard ? sampleCard.offsetHeight / 2 : 210;

    const padSide = vw < 768 ? 16 : 64;
    const padTop = vw < 768 ? 82 : 88;
    const padBottom = vw < 768 ? 44 : 56;

    const minX = padSide + halfW - cx;
    const maxX = vw - padSide - halfW - cx;
    const minY = padTop + halfH - cy;
    const maxY = vh - padBottom - halfH - cy;

    return {
      x: minX <= maxX ? Math.max(minX, Math.min(maxX, tx)) : 0,
      y: minY <= maxY ? Math.max(minY, Math.min(maxY, ty)) : 0,
    };
  }

  finishPendingCycle() {
    if (!this.pendingCycleFinish) return;
    clearTimeout(this.cycleTimer);
    const finish = this.pendingCycleFinish;
    this.pendingCycleFinish = null;
    finish();
  }

  /**
   * Cycles the topmost card smoothly to the back of the stack
   */
  cycleNext() {
    if (this.cards.length <= 1) return;
    if (this.isFanned) {
      this.restack();
      return;
    }

    this.finishPendingCycle();

    // Find current highest z-index card
    const sorted = [...this.cards].sort((a, b) => b.z - a.z);
    const topCard = sorted[0];
    const minZ = sorted[sorted.length - 1].z;

    // Brief sideways deal flick, then settle neatly at bottom of pile
    topCard.tx = topCard.homeX + 125;
    topCard.ty = topCard.homeY - 14;
    topCard.trot = 9;
    topCard.moved = false;

    const finish = () => {
      this.pendingCycleFinish = null;
      if (!this.cards.includes(topCard)) return;
      topCard.z = Math.max(1, minZ - 1);
      // Normalize z-indices so they stay positive
      if (topCard.z <= 2) {
        this.cards.forEach((c) => {
          c.z += 12;
          c.el.style.zIndex = String(c.z);
        });
        this.topZ += 12;
      } else {
        topCard.el.style.zIndex = String(topCard.z);
      }
      topCard.tx = topCard.homeX;
      topCard.ty = topCard.homeY;
      topCard.trot = topCard.homeRot;

      // Bring new top card cleanly centered
      const nextTop = [...this.cards].sort((a, b) => b.z - a.z)[0];
      if (nextTop && !nextTop.moved) {
        nextTop.tx = 0;
        nextTop.ty = 0;
        nextTop.trot = -0.5;
      }
      this.updateFanButton();
      this.updateDeckReadouts();
    };

    this.pendingCycleFinish = finish;
    this.cycleTimer = setTimeout(finish, 170);
  }

  /**
   * Pulls the bottommost card smoothly from the back onto the top of the stack
   */
  cyclePrev() {
    if (this.cards.length <= 1) return;
    if (this.isFanned) {
      this.restack();
      return;
    }

    this.finishPendingCycle();

    const sorted = [...this.cards].sort((a, b) => b.z - a.z);
    const prevTop = sorted[0];
    const bottomCard = sorted[sorted.length - 1];

    // Pull bottom card smoothly out to the left, then swing onto the top of the stack
    bottomCard.tx = bottomCard.homeX - 125;
    bottomCard.ty = bottomCard.homeY - 12;
    bottomCard.trot = -9;
    bottomCard.moved = false;

    if (prevTop && !prevTop.moved) {
      prevTop.tx = prevTop.homeX;
      prevTop.ty = prevTop.homeY;
      prevTop.trot = prevTop.homeRot;
    }

    const finish = () => {
      this.pendingCycleFinish = null;
      if (!this.cards.includes(bottomCard)) return;
      this.topZ += 1;
      bottomCard.z = this.topZ;
      bottomCard.el.style.zIndex = String(bottomCard.z);
      bottomCard.tx = 0;
      bottomCard.ty = 0;
      bottomCard.trot = -0.5;
      this.updateFanButton();
      this.updateDeckReadouts();
    };

    this.pendingCycleFinish = finish;
    this.cycleTimer = setTimeout(finish, 170);
  }

  /**
   * Spreads all cards gracefully across the studio table, or gathers them back when fanned/moved
   */
  toggleFan() {
    if (!this.cards.length) return;

    if (this.isFanned || this.cards.some((c) => c.moved)) {
      this.restack();
      return;
    }

    this.finishPendingCycle();
    this.isFanned = true;
    const total = this.cards.length;
    const vw = window.innerWidth;
    const isCompact = vw < 1024;

    // Arrange in an artful loose studio arch / staggered spread within safe bounds
    const spreadX = isCompact ? Math.min(96, vw * 0.22) : Math.min(220, vw * 0.16);
    const spreadY = isCompact ? 42 : 76;

    this.cards.forEach((card, i) => {
      const t = total === 1 ? 0 : i / (total - 1) - 0.5; // -0.5 .. +0.5
      let fx, fy, frot;

      if (total <= 5) {
        // Sweeping tactile fan arc
        fx = t * spreadX * 1.85 - (isCompact ? 0 : 40);
        fy = Math.abs(t) * spreadY * 0.85 - 8;
        frot = t * 22;
      } else {
        // Two-tier editorial light-table scatter (ideal for 6–9 cards)
        const topRowCount = Math.ceil(total / 2);
        const isTopRow = i < topRowCount;
        const rowLen = isTopRow ? topRowCount : total - topRowCount;
        const colIdx = isTopRow ? i : i - topRowCount;
        const rt = rowLen === 1 ? 0 : colIdx / (rowLen - 1) - 0.5;

        fx = rt * spreadX * 2.1 - (isCompact ? 0 : 54) + (isTopRow ? -10 : 14);
        fy = (isTopRow ? -0.68 : 0.68) * spreadY + Math.sin(i * 1.9) * 10;
        frot = rt * 14 + (isTopRow ? -3 : 3);
      }

      const clamped = this.clampToWorkspace(fx, fy);
      card.tx = clamped.x;
      card.ty = clamped.y;
      card.trot = frot;
      card.moved = true;
      card.delayFrames = i * 2;
    });

    this.updateFanButton();
    this.updateDeckReadouts();
  }

  /**
   * Magnetically sweeps all scattered/moved cards back into the neat physical stack
   */
  restack() {
    if (!this.cards.length) return;
    clearTimeout(this.cycleTimer);
    this.pendingCycleFinish = null;
    this.isFanned = false;
    const total = this.cards.length;
    this.topZ = 20 + total;

    this.cards.forEach((card, i) => {
      card.tx = card.homeX;
      card.ty = card.homeY;
      card.trot = card.homeRot;
      card.tscale = 1;
      card.moved = false;
      card.z = 10 + (total - 1 - i);
      card.el.style.zIndex = String(card.z);
      card.delayFrames = i * 2;
    });

    this.telemetry?.setVectorReadout(0, 0);
    this.updateFanButton();
    this.updateDeckReadouts();
  }

  updateFanButton() {
    if (!this.fanBtn) return;
    const canGather = this.isFanned || this.cards.some((c) => c.moved);
    this.fanBtn.classList.toggle('is-active', canGather);
    this.fanBtn.textContent = canGather ? 'GATHER' : 'SPREAD';
    this.fanBtn.title = canGather ? 'Gather all cards back into stack (F / R)' : 'Spread out all cards (F)';
  }

  updateDeckReadouts() {
    if (!this.cards.length) return;

    const sorted = [...this.cards].sort((a, b) => b.z - a.z);
    const topCard = sorted[0];

    if (this.statusEl && topCard) {
      const idx = String(topCard.index + 1).padStart(2, '0');
      const tot = String(this.cards.length).padStart(2, '0');
      this.statusEl.textContent = `${idx} / ${tot}`;
    }

    if (topCard) {
      this.onActiveSpecimenChange?.(topCard.data.specimenNo);
    }
  }

  /**
   * 60/120fps smooth critically-damped transform loop
   */
  startPhysicsLoop() {
    const tick = () => {
      for (let i = 0; i < this.cards.length; i++) {
        const c = this.cards[i];
        if (c.delayFrames > 0) {
          c.delayFrames -= 1;
          continue;
        }

        // Snappier follow while dragging, silky mechanical ease when settling/restacking
        const k = c.dragging ? 0.36 : 0.14;
        const kr = c.dragging ? 0.24 : 0.12;

        c.x += (c.tx - c.x) * k;
        c.y += (c.ty - c.y) * k;
        c.rot += (c.trot - c.rot) * kr;
        c.scale += (c.tscale - c.scale) * 0.2;

        c.el.style.transform = `translate3d(${c.x.toFixed(2)}px, ${c.y.toFixed(2)}px, 0) rotate(${c.rot.toFixed(2)}deg) scale(${c.scale.toFixed(3)})`;
      }

      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }
}
