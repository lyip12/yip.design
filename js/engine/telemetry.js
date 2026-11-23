/**
 * Live Telemetry & Spring Parallax Controller
 * - Tracks live cursor ( X , Y ) coordinates into top-left HUD
 * - Drives smooth spring parallax on ambient blobs, halftone matrices & radar SVG
 * - Intensifies halftone ambient glow when hovering or dragging specimen cards
 */

export class TelemetryEngine {
  constructor() {
    this.ambientEl = document.getElementById('ambient-field');
    this.radarEl = document.getElementById('radar-layer');
    this.stageEl = document.querySelector('.editorial-stage');
    this.cardArenaEl = document.getElementById('card-arena');
    this.cursorCoordEl = document.getElementById('hud-cursor-coords');
    this.vectorCoordEl = document.getElementById('hud-vector-coords');

    // Normalized cursor (-1 .. +1)
    this.targetNx = 0;
    this.targetNy = 0;
    this.curNx = 0;
    this.curNy = 0;

    // Glow intensity (0 .. 1)
    this.targetGlow = 0;
    this.curGlow = 0;

    // Continuous orbital rotation angle (unbounded so 315deg -> 0deg rotates +45deg)
    this.currentOrbitDeg = null;

    this.rafId = null;
    this.boundMove = this.onPointerMove.bind(this);
    this.boundLeave = this.onPointerLeave.bind(this);
    this.boundSyncDecor = this.syncDecorAnchor.bind(this);

    this.init();
  }

  init() {
    window.addEventListener('pointermove', this.boundMove, { passive: true });
    document.addEventListener('pointerleave', this.boundLeave, { passive: true });
    window.addEventListener('resize', this.boundSyncDecor, { passive: true });
    this.syncDecorAnchor();
    requestAnimationFrame(this.boundSyncDecor);
    this.loop();
  }

  syncDecorAnchor() {
    if (!this.stageEl || !this.cardArenaEl) return;
    const stageRect = this.stageEl.getBoundingClientRect();
    const arenaRect = this.cardArenaEl.getBoundingClientRect();
    if (!stageRect.width || !stageRect.height) return;

    const dx = arenaRect.left + arenaRect.width / 2 - (stageRect.left + stageRect.width / 2);
    const dy = arenaRect.top + arenaRect.height / 2 - (stageRect.top + stageRect.height / 2);

    document.documentElement.style.setProperty('--decor-offset-x', `${dx.toFixed(1)}px`);
    document.documentElement.style.setProperty('--decor-offset-y', `${dy.toFixed(1)}px`);
  }

  onPointerMove(e) {
    const w = window.innerWidth || 1;
    const h = window.innerHeight || 1;
    const nx = (e.clientX / w) * 2 - 1;
    const ny = (e.clientY / h) * 2 - 1;

    this.targetNx = Math.max(-1, Math.min(1, nx));
    this.targetNy = Math.max(-1, Math.min(1, ny));

    if (this.cursorCoordEl) {
      // Scale to mid-century field telemetry range (-50.0 .. +50.0)
      const cx = (nx * 50).toFixed(1);
      const cy = (-ny * 50).toFixed(1);
      this.cursorCoordEl.textContent = `( ${cx} , ${cy} )`;
    }
  }

  onPointerLeave() {
    this.targetNx = 0;
    this.targetNy = 0;
  }

  setGlowBoost(val) {
    this.targetGlow = Math.max(0, Math.min(1, val));
  }

  setRoleAtmosphere(tone, orbitAngle) {
    if (this.ambientEl) {
      this.ambientEl.dataset.roleTone = tone;
    }
    if (this.radarEl) {
      if (this.currentOrbitDeg === null) {
        this.currentOrbitDeg = orbitAngle;
      } else {
        const delta = ((((orbitAngle - this.currentOrbitDeg) % 360) + 540) % 360) - 180;
        this.currentOrbitDeg += delta;
      }
      this.radarEl.style.setProperty('--orbit-deg', `${this.currentOrbitDeg}deg`);
    }
  }

  setVectorReadout(x, y) {
    if (!this.vectorCoordEl) return;
    const fx = Number(x).toFixed(1);
    const fy = Number(y).toFixed(1);
    this.vectorCoordEl.textContent = `( ${fx} , ${fy} )`;
  }

  loop() {
    // Calm, spring-damped interpolation
    const ease = 0.085;
    this.curNx += (this.targetNx - this.curNx) * ease;
    this.curNy += (this.targetNy - this.curNy) * ease;
    this.curGlow += (this.targetGlow - this.curGlow) * 0.12;

    if (this.ambientEl) {
      const px = (-this.curNx * 22).toFixed(2);
      const py = (-this.curNy * 18).toFixed(2);
      this.ambientEl.style.setProperty('--px', `${px}px`);
      this.ambientEl.style.setProperty('--py', `${py}px`);
      this.ambientEl.style.setProperty('--glow-boost', this.curGlow.toFixed(3));
    }

    if (this.radarEl) {
      const rx = (this.curNx * 11).toFixed(2);
      const ry = (this.curNy * 9).toFixed(2);
      this.radarEl.style.setProperty('--rx', `${rx}px`);
      this.radarEl.style.setProperty('--ry', `${ry}px`);
    }

    this.rafId = requestAnimationFrame(() => this.loop());
  }
}
