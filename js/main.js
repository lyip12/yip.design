/**
 * YIP.DESIGN — Application Orchestrator
 * Connects ScrollDirector, CardDeckEngine, TelemetryEngine, Specimen Dossier,
 * Full Archive Index Matrix, and About/Contact Dossier.
 */

import { ROLES, TOTAL_SPECIMENS } from './data/portfolio.js';
import { renderVisualHTML } from './visuals/artworkRenderer.js';
import { TelemetryEngine } from './engine/telemetry.js';
import { CardDeckEngine } from './engine/cardDeck.js';
import { ScrollDirector } from './engine/scrollDirector.js';
import { PasscodeGate } from './engine/passcodeGate.js';

class PortfolioApp {
  constructor() {
    // HUD elements
    this.hudRoleIndexEl = document.getElementById('hud-role-index');
    this.hudSpecimenNumEl = document.getElementById('hud-specimen-num');
    this.hudSpecimenTotalEl = document.getElementById('hud-specimen-total');
    this.hudRailLeftEl = document.getElementById('hud-rail-left');
    this.hudRailRightEl = document.getElementById('hud-rail-right');
    this.hudModuleCodeEl = document.getElementById('hud-module-code');
    this.hudModuleSubEl = document.getElementById('hud-module-sub');

    // Role info panel elements
    this.roleEyebrowText = document.getElementById('role-eyebrow-text');
    this.roleDescEl = document.getElementById('role-description');

    // Deck controls
    this.arenaEl = document.getElementById('card-arena');
    this.deckStatusEl = document.getElementById('deck-status');
    this.btnPrev = document.getElementById('btn-deck-prev');
    this.btnNext = document.getElementById('btn-deck-next');
    this.btnFan = document.getElementById('btn-deck-fan');
    this.deckHintEl = document.getElementById('deck-hint');

    // Modals
    this.dossierModal = document.getElementById('dossier-modal');
    this.indexModal = document.getElementById('index-modal');
    this.aboutModal = document.getElementById('about-modal');

    this.activeDossierRole = null;
    this.activeDossierCardIdx = 0;

    this.init();
  }

  init() {
    if (this.hudSpecimenTotalEl) {
      this.hudSpecimenTotalEl.textContent = `SPECIMEN / ${TOTAL_SPECIMENS}`;
    }

    this.telemetry = new TelemetryEngine();

    this.deck = new CardDeckEngine({
      arenaEl: this.arenaEl,
      statusEl: this.deckStatusEl,
      fanBtn: this.btnFan,
      hintEl: this.deckHintEl,
      telemetry: this.telemetry,
      onInspectCard: (role, cardIdx) => this.openDossier(role, cardIdx),
      onActiveSpecimenChange: (specimenNo) => {
        if (this.hudSpecimenNumEl && specimenNo) {
          this.hudSpecimenNumEl.textContent = specimenNo;
        }
      },
    });

    this.scrollDirector = new ScrollDirector({
      roles: ROLES,
      telemetry: this.telemetry,
      onRoleChange: (role) => this.handleRoleChange(role),
    });

    this.bindControls();
    this.populateArchiveIndex();
  }

  handleRoleChange(role) {
    // Update fixed Swiss HUD chrome
    if (this.hudRoleIndexEl) this.hudRoleIndexEl.textContent = role.index;
    if (this.hudRailLeftEl) this.hudRailLeftEl.textContent = role.railLeft;
    if (this.hudRailRightEl) this.hudRailRightEl.textContent = role.railRight;
    if (this.hudModuleCodeEl) this.hudModuleCodeEl.textContent = `MODULE ${role.index}`;
    if (this.hudModuleSubEl) this.hudModuleSubEl.textContent = `${role.title.toUpperCase()} // FIELD SAMPLE`;

    // Update ambient field & radar orbital arc angle
    this.telemetry.setRoleAtmosphere(role.tone, role.orbitAngle);

    // Update role editorial metadata with crisp transition
    if (this.roleEyebrowText) {
      this.roleEyebrowText.textContent = `DISCIPLINE // ${role.index} OF ${String(ROLES.length).padStart(2, '0')}`;
    }

    if (this.roleDescEl) {
      this.roleDescEl.classList.add('is-switching');
      clearTimeout(this.descTimer);
      this.descTimer = setTimeout(() => {
        this.roleDescEl.textContent = role.description;
        this.roleDescEl.classList.remove('is-switching');
      }, 120);
    }

    // Deal this role's draggable card stack
    this.deck.setRole(role);
  }

  bindControls() {
    this.btnPrev?.addEventListener('click', () => this.deck.cyclePrev());
    this.btnNext?.addEventListener('click', () => this.deck.cycleNext());
    this.btnFan?.addEventListener('click', () => this.deck.toggleFan());

    // Header navigation trigger
    document.getElementById('btn-open-about')?.addEventListener('click', () => this.openModal(this.aboutModal));
    document.querySelector('.brand-mark')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.scrollDirector.scrollToRole(0);
    });

    // Gracefully revert to placeholder frame if an about portrait src fails to load
    const aboutPortraitImg = document.getElementById('about-portrait-img');
    aboutPortraitImg?.addEventListener('error', () => {
      aboutPortraitImg.removeAttribute('src');
    });

    // Close modals on backdrop click or close buttons
    [this.dossierModal, this.indexModal, this.aboutModal].forEach((modal) => {
      if (!modal) return;
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.closeAllModals();
      });
      modal.querySelectorAll('[data-close-modal]').forEach((btn) => {
        btn.addEventListener('click', () => this.closeAllModals());
      });
    });

    // Dossier Prev/Next navigation
    document.getElementById('btn-dossier-prev')?.addEventListener('click', () => this.stepDossier(-1));
    document.getElementById('btn-dossier-next')?.addEventListener('click', () => this.stepDossier(1));

    // Global keyboard shortcuts
    window.addEventListener('keydown', (e) => {
      const anyModalOpen =
        this.dossierModal?.classList.contains('is-open') ||
        this.indexModal?.classList.contains('is-open') ||
        this.aboutModal?.classList.contains('is-open');

      if (e.key === 'Escape') {
        this.closeAllModals();
        return;
      }

      if (this.dossierModal?.classList.contains('is-open')) {
        if (e.key === 'ArrowLeft') this.stepDossier(-1);
        if (e.key === 'ArrowRight') this.stepDossier(1);
        return;
      }

      if (anyModalOpen) return;
      if (e.target && ['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        this.scrollDirector.stepRole(1);
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        this.scrollDirector.stepRole(-1);
      } else if (e.key === 'ArrowLeft') {
        this.deck.cyclePrev();
      } else if (e.key === 'ArrowRight') {
        this.deck.cycleNext();
      } else if (e.key.toLowerCase() === 'f') {
        this.deck.toggleFan();
      } else if (e.key.toLowerCase() === 'r') {
        this.deck.restack();
      } else if (e.key.toLowerCase() === 'i') {
        this.openModal(this.indexModal);
      }
    });
  }

  /* ========================================================================
     Modals: Specimen Dossier, Archive Index & About
     ======================================================================== */

  openDossier(role, cardIdx) {
    this.activeDossierRole = role;
    this.activeDossierCardIdx = cardIdx;
    this.renderDossierContent();
    this.openModal(this.dossierModal);
  }

  stepDossier(delta) {
    if (!this.activeDossierRole) return;
    const len = this.activeDossierRole.cards.length;
    this.activeDossierCardIdx = (this.activeDossierCardIdx + delta + len) % len;
    this.renderDossierContent();
  }

  renderDossierContent() {
    const role = this.activeDossierRole;
    const card = role.cards[this.activeDossierCardIdx];
    if (!card) return;

    document.getElementById('dossier-code').textContent =
      `SPECIMEN ${card.specimenNo} / ${TOTAL_SPECIMENS} · ${card.code}`;
    document.getElementById('dossier-role-tag').textContent =
      `MODULE ${role.index} // ${role.title.toUpperCase()}`;
    document.getElementById('dossier-title').textContent = card.title;
    document.getElementById('dossier-notes').textContent = card.notes;
    document.getElementById('dossier-medium').textContent = card.medium;
    document.getElementById('dossier-year').textContent = card.year;
    document.getElementById('dossier-location').textContent = card.location;
    document.getElementById('dossier-coords').textContent = card.coords;
    document.getElementById('dossier-counter').textContent =
      `${String(this.activeDossierCardIdx + 1).padStart(2, '0')} / ${String(role.cards.length).padStart(2, '0')}`;

    const visualFrame = document.getElementById('dossier-visual-frame');
    if (visualFrame) {
      visualFrame.innerHTML = renderVisualHTML(card.visual, card.title);
    }
  }

  populateArchiveIndex() {
    const container = document.getElementById('index-list');
    const summaryEl = document.getElementById('index-summary');
    if (summaryEl) {
      summaryEl.textContent = `${ROLES.length} DISCIPLINES · ${TOTAL_SPECIMENS} ARCHIVED SPECIMENS`;
    }
    if (!container) return;

    container.innerHTML = '';
    ROLES.forEach((role, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'index-row';
      btn.innerHTML = `
        <span class="index-row-num tabular">${role.index}</span>
        <span class="index-row-role">${role.title}</span>
        <span class="index-row-desc">${role.description}</span>
        <span class="index-row-count tabular">${String(role.cards.length).padStart(2, '0')} CARDS</span>
      `;
      btn.addEventListener('click', () => {
        this.closeAllModals();
        this.scrollDirector.scrollToRole(i);
      });
      container.appendChild(btn);
    });
  }

  openModal(modalEl) {
    this.closeAllModals();
    modalEl?.classList.add('is-open');
    modalEl?.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('has-modal-open');
  }

  closeAllModals() {
    [this.dossierModal, this.indexModal, this.aboutModal].forEach((m) => {
      m?.classList.remove('is-open');
      m?.setAttribute('aria-hidden', 'true');
    });
    document.documentElement.classList.remove('has-modal-open');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  let appInitialized = false;
  new PasscodeGate({
    onUnlock: () => {
      if (appInitialized) return;
      appInitialized = true;
      new PortfolioApp();
    },
  });
});
