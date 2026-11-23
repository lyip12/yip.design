/**
 * YIP.DESIGN — Passcode Gate Engine
 * Two-scroller birthday combination lock (December 5).
 */

const MONTHS = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
];

const ITEM_HEIGHT = 36;
const TARGET_MONTH = 12;
const TARGET_DAY = 5;
const SESSION_KEY = 'yip_design_unlocked';

export class PasscodeGate {
  constructor({ onUnlock }) {
    this.onUnlock = onUnlock;
    this.gateEl = document.getElementById('passcode-gate');
    this.panelEl = document.getElementById('gate-panel');
    this.monthWheel = document.getElementById('gate-wheel-month');
    this.dayWheel = document.getElementById('gate-wheel-day');
    this.readoutEl = document.getElementById('gate-readout');
    this.feedbackEl = document.getElementById('gate-feedback');
    this.submitBtn = document.getElementById('gate-submit-btn');

    this.selectedMonth = 1;
    this.selectedDay = 1;

    this.init();
  }

  init() {
    if (!this.gateEl) {
      this.onUnlock?.();
      return;
    }

    if (sessionStorage.getItem(SESSION_KEY) === '1') {
      this.gateEl.classList.add('is-unlocked');
      this.gateEl.setAttribute('aria-hidden', 'true');
      document.documentElement.classList.remove('is-locked');
      this.onUnlock?.();
      return;
    }

    document.documentElement.classList.add('is-locked');
    this.populateWheels();
    this.bindEvents();
    this.updateSelectionVisuals(this.monthWheel, 0);
    this.updateSelectionVisuals(this.dayWheel, 0);
    this.updateReadout();
  }

  populateWheels() {
    if (this.monthWheel) {
      this.monthWheel.innerHTML = '';
      MONTHS.forEach((abbr, idx) => {
        const num = String(idx + 1).padStart(2, '0');
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'gate-wheel-item';
        btn.dataset.value = String(idx + 1);
        btn.innerHTML = `<span>${num}</span><span class="item-abbr">${abbr}</span>`;
        btn.addEventListener('click', () => this.scrollToIndex(this.monthWheel, idx));
        this.monthWheel.appendChild(btn);
      });
    }

    if (this.dayWheel) {
      this.dayWheel.innerHTML = '';
      for (let d = 1; d <= 31; d += 1) {
        const num = String(d).padStart(2, '0');
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'gate-wheel-item';
        btn.dataset.value = String(d);
        btn.textContent = num;
        btn.addEventListener('click', () => this.scrollToIndex(this.dayWheel, d - 1));
        this.dayWheel.appendChild(btn);
      }
    }
  }

  bindEvents() {
    this.attachWheelListener(this.monthWheel, 12, (val) => {
      this.selectedMonth = val;
      this.clearError();
      this.updateReadout();
    });

    this.attachWheelListener(this.dayWheel, 31, (val) => {
      this.selectedDay = val;
      this.clearError();
      this.updateReadout();
    });

    this.submitBtn?.addEventListener('click', () => this.attemptUnlock());

    this.gateEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.attemptUnlock();
      }
    });
  }

  attachWheelListener(wheel, maxCount, onChange) {
    if (!wheel) return;
    let rafId = null;

    wheel.addEventListener('scroll', () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const idx = Math.max(0, Math.min(maxCount - 1, Math.round(wheel.scrollTop / ITEM_HEIGHT)));
        this.updateSelectionVisuals(wheel, idx);
        onChange(idx + 1);
      });
    }, { passive: true });

    wheel.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const currentIdx = Math.round(wheel.scrollTop / ITEM_HEIGHT);
        const nextIdx = Math.max(0, Math.min(maxCount - 1, currentIdx + (e.key === 'ArrowDown' ? 1 : -1)));
        this.scrollToIndex(wheel, nextIdx);
      }
    });
  }

  scrollToIndex(wheel, idx) {
    if (!wheel) return;
    wheel.scrollTo({
      top: idx * ITEM_HEIGHT,
      behavior: 'smooth',
    });
  }

  updateSelectionVisuals(wheel, activeIdx) {
    if (!wheel) return;
    const items = wheel.querySelectorAll('.gate-wheel-item');
    items.forEach((item, idx) => {
      item.classList.toggle('is-selected', idx === activeIdx);
    });
  }

  updateReadout() {
    if (!this.readoutEl) return;
    const m = String(this.selectedMonth).padStart(2, '0');
    const d = String(this.selectedDay).padStart(2, '0');
    this.readoutEl.textContent = `INPUT // ${m} · ${d}`;
  }

  clearError() {
    if (!this.feedbackEl) return;
    this.feedbackEl.textContent = 'SCROLL MONTH & DAY TO UNLOCK';
    this.feedbackEl.classList.remove('is-error');
  }

  attemptUnlock() {
    if (this.selectedMonth === TARGET_MONTH && this.selectedDay === TARGET_DAY) {
      sessionStorage.setItem(SESSION_KEY, '1');
      document.documentElement.classList.remove('is-locked');
      this.gateEl.classList.add('is-unlocked');
      this.gateEl.setAttribute('aria-hidden', 'true');
      this.onUnlock?.();
      return;
    }

    if (this.panelEl) {
      this.panelEl.classList.remove('is-error');
      void this.panelEl.offsetWidth;
      this.panelEl.classList.add('is-error');
    }
    if (this.feedbackEl) {
      this.feedbackEl.textContent = 'INCORRECT DATE — TRY AGAIN';
      this.feedbackEl.classList.add('is-error');
    }
  }
}
