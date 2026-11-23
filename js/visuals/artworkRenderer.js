/**
 * Bespoke Swiss Editorial / Ambient Sci-Fi Telemetry Artwork Renderer
 * Generates museum-grade vector diagrams, generative data plots, UI schematics,
 * film contact sheets, and editorial essay cards for every specimen variant.
 */

const PALETTE = {
  paper: '#F4F0E8',
  paperWarm: '#EDE8DF',
  ink: '#1A1A1A',
  inkSoft: 'rgba(26,26,26,0.42)',
  inkHair: 'rgba(26,26,26,0.16)',
  prussian: '#0F385A',
  prussianMid: '#1D5B8A',
  sage: '#6F9190',
  sageDeep: '#3E6263',
  peach: '#F4A28C',
  peachSoft: '#F8C6B6',
};

/**
 * Renders HTML string for a card's visual area (photo, essay, or procedural SVG)
 */
export function renderVisualHTML(visual, cardTitle = '') {
  if (!visual) return '';

  if (visual.type === 'image') {
    const pos = visual.pos || 'center center';
    return `
      <img
        src="${visual.src}"
        alt="${escapeAttr(cardTitle)}"
        loading="lazy"
        decoding="async"
        style="object-position: ${pos};"
      />
      ${visual.badge ? `<span class="card-media-tag">${visual.badge}</span>` : ''}
    `;
  }

  if (visual.type === 'essay') {
    return `
      <div class="card-essay-surface">
        <div class="card-essay-kicker">${visual.kicker}</div>
        <p class="card-essay-quote">${visual.quote}</p>
        <div class="card-essay-meta">
          <span>${visual.date}</span>
          <span>${visual.readTime}</span>
        </div>
      </div>
    `;
  }

  if (visual.type === 'svg') {
    return buildVariantSVG(visual.variant);
  }

  return '';
}

function escapeAttr(str) {
  return String(str).replace(/"/g, '&quot;');
}

function svgWrap(inner, bg = PALETTE.paper) {
  return `
    <svg viewBox="0 0 320 340" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <rect width="320" height="340" fill="${bg}"/>
      ${inner}
    </svg>
  `;
}

function dotGrid(x0, y0, cols, rows, step, r = 1.15, fill = 'rgba(26,26,26,0.22)') {
  let out = '';
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      out += `<circle cx="${x0 + i * step}" cy="${y0 + j * step}" r="${r}" fill="${fill}"/>`;
    }
  }
  return out;
}

function buildVariantSVG(variant) {
  switch (variant) {
    /* ------------------------------------------------------------------
       UX DESIGNER (Google: AI, YouTube, CTV, Ads)
       ------------------------------------------------------------------ */
    case 'ux-ai-canvas': {
      return svgWrap(`
        <defs>
          <radialGradient id="aiG" cx="54%" cy="46%" r="48%">
            <stop offset="0%" stop-color="${PALETTE.peach}" stop-opacity="0.55"/>
            <stop offset="45%" stop-color="${PALETTE.sage}" stop-opacity="0.28"/>
            <stop offset="100%" stop-color="${PALETTE.prussian}" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <circle cx="176" cy="158" r="130" fill="url(#aiG)"/>
        ${dotGrid(28, 28, 17, 18, 16, 1, 'rgba(26,26,26,0.12)')}
        <!-- Spatial prompt frame -->
        <rect x="34" y="48" width="252" height="148" rx="3" fill="rgba(250,248,244,0.82)" stroke="${PALETTE.ink}" stroke-width="0.9"/>
        <line x1="34" y1="74" x2="286" y2="74" stroke="${PALETTE.inkHair}" stroke-width="0.9"/>
        <circle cx="48" cy="61" r="3" fill="${PALETTE.prussian}"/>
        <text x="58" y="64" font-family="JetBrains Mono, monospace" font-size="7.5" letter-spacing="1.2" fill="${PALETTE.ink}">GEMINI // SPATIAL CONTEXT</text>
        <!-- Reasoning nodes & citation arcs -->
        <circle cx="104" cy="134" r="24" fill="none" stroke="${PALETTE.prussian}" stroke-width="0.9" stroke-dasharray="2 3"/>
        <circle cx="104" cy="134" r="6" fill="${PALETTE.peach}"/>
        <circle cx="104" cy="134" r="2.2" fill="#FFF"/>
        <path d="M128 134 C156 134, 152 108, 186 108" fill="none" stroke="${PALETTE.ink}" stroke-width="0.9"/>
        <path d="M128 134 C156 134, 154 156, 186 156" fill="none" stroke="${PALETTE.prussian}" stroke-width="0.9"/>
        <rect x="186" y="96" width="80" height="24" rx="2" fill="${PALETTE.paper}" stroke="${PALETTE.ink}" stroke-width="0.8"/>
        <rect x="186" y="144" width="80" height="24" rx="2" fill="${PALETTE.prussian}" fill-opacity="0.1" stroke="${PALETTE.prussian}" stroke-width="0.8"/>
        <line x1="194" y1="106" x2="250" y2="106" stroke="${PALETTE.ink}" stroke-width="1.2"/>
        <line x1="194" y1="112" x2="232" y2="112" stroke="${PALETTE.inkSoft}" stroke-width="1"/>
        <line x1="194" y1="154" x2="254" y2="154" stroke="${PALETTE.prussian}" stroke-width="1.2"/>
        <line x1="194" y1="160" x2="228" y2="160" stroke="${PALETTE.sageDeep}" stroke-width="1"/>
        <!-- Confidence bar bottom -->
        <rect x="34" y="216" width="252" height="74" rx="2" fill="rgba(250,248,244,0.72)" stroke="${PALETTE.inkHair}" stroke-width="0.9"/>
        <text x="46" y="236" font-family="JetBrains Mono, monospace" font-size="7" letter-spacing="1.4" fill="${PALETTE.inkSoft}">CONFIDENCE &amp; GROUNDING TELEMETRY</text>
        <rect x="46" y="248" width="228" height="7" fill="${PALETTE.inkHair}"/>
        <rect x="46" y="248" width="186" height="7" fill="${PALETTE.prussian}"/>
        <rect x="232" y="248" width="22" height="7" fill="${PALETTE.peach}"/>
        <text x="46" y="274" font-family="JetBrains Mono, monospace" font-size="7.5" fill="${PALETTE.ink}">0.94 SOURCE LOCK</text>
        <text x="218" y="274" font-family="JetBrains Mono, monospace" font-size="7.5" fill="${PALETTE.prussian}">140ms</text>
      `);
    }

    case 'ux-ctv-grid': {
      return svgWrap(`
        <defs>
          <radialGradient id="ctvAmbient" cx="50%" cy="38%" r="54%">
            <stop offset="0%" stop-color="${PALETTE.prussian}" stop-opacity="0.34"/>
            <stop offset="55%" stop-color="${PALETTE.sage}" stop-opacity="0.18"/>
            <stop offset="100%" stop-color="transparent"/>
          </radialGradient>
        </defs>
        <rect width="320" height="340" fill="#EAE6DF"/>
        <ellipse cx="160" cy="140" rx="145" ry="110" fill="url(#ctvAmbient)"/>
        <!-- 10-foot TV screen wireframe -->
        <rect x="26" y="54" width="268" height="156" rx="4" fill="#18222B" stroke="${PALETTE.ink}" stroke-width="1"/>
        <!-- Ambient edge lighting inside TV -->
        <rect x="34" y="62" width="252" height="140" rx="2" fill="url(#ctvAmbient)"/>
        <!-- Left rail -->
        <circle cx="48" cy="84" r="3" fill="${PALETTE.peach}"/>
        <circle cx="48" cy="102" r="2.2" fill="rgba(255,255,255,0.4)"/>
        <circle cx="48" cy="118" r="2.2" fill="rgba(255,255,255,0.4)"/>
        <circle cx="48" cy="134" r="2.2" fill="rgba(255,255,255,0.4)"/>
        <!-- Active focused hero tile -->
        <rect x="66" y="74" width="128" height="72" rx="2" fill="${PALETTE.prussianMid}" stroke="#FFFBF5" stroke-width="1.4"/>
        <circle cx="130" cy="110" r="14" fill="none" stroke="rgba(255,255,255,0.75)" stroke-width="0.9"/>
        <polygon points="127,104 137,110 127,116" fill="#FFFBF5"/>
        <!-- Secondary shelf tiles -->
        <rect x="204" y="74" width="74" height="72" rx="2" fill="rgba(255,255,255,0.09)" stroke="rgba(255,255,255,0.22)" stroke-width="0.8"/>
        <rect x="66" y="156" width="64" height="36" rx="2" fill="rgba(255,255,255,0.08)"/>
        <rect x="138" y="156" width="64" height="36" rx="2" fill="rgba(255,255,255,0.08)"/>
        <rect x="210" y="156" width="68" height="36" rx="2" fill="rgba(255,255,255,0.08)"/>
        <!-- 10-foot viewing cone & D-pad diagram below -->
        <line x1="160" y1="218" x2="160" y2="294" stroke="${PALETTE.inkHair}" stroke-dasharray="3 3"/>
        <circle cx="160" cy="264" r="28" fill="none" stroke="${PALETTE.ink}" stroke-width="0.9"/>
        <circle cx="160" cy="264" r="10" fill="${PALETTE.peach}" fill-opacity="0.65" stroke="${PALETTE.ink}" stroke-width="0.9"/>
        <path d="M160 242 L164 248 L156 248 Z M160 286 L164 280 L156 280 Z M138 264 L144 260 L144 268 Z M182 264 L176 260 L176 268 Z" fill="${PALETTE.ink}"/>
        <text x="32" y="294" font-family="JetBrains Mono, monospace" font-size="7.5" letter-spacing="1.2" fill="${PALETTE.inkSoft}">10-FT FOCUS MODEL</text>
        <text x="220" y="294" font-family="JetBrains Mono, monospace" font-size="7.5" letter-spacing="1.2" fill="${PALETTE.prussian}">60FPS D-PAD</text>
      `);
    }

    case 'ux-ads-signal': {
      return svgWrap(`
        <defs>
          <radialGradient id="adPeach" cx="72%" cy="35%" r="48%">
            <stop offset="0%" stop-color="${PALETTE.peach}" stop-opacity="0.58"/>
            <stop offset="100%" stop-color="transparent"/>
          </radialGradient>
        </defs>
        <rect width="320" height="340" fill="${PALETTE.paper}"/>
        <circle cx="230" cy="118" r="118" fill="url(#adPeach)"/>
        <!-- Split pause-screen composition -->
        <rect x="28" y="64" width="162" height="122" rx="2" fill="${PALETTE.prussian}" stroke="${PALETTE.ink}" stroke-width="0.9"/>
        <rect x="198" y="64" width="94" height="122" rx="2" fill="${PALETTE.paperWarm}" stroke="${PALETTE.ink}" stroke-width="0.9"/>
        <!-- Pause icon centered -->
        <rect x="99" y="112" width="6" height="24" fill="#FFFBF5"/>
        <rect x="112" y="112" width="6" height="24" fill="#FFFBF5"/>
        <!-- Editorial brand card on right -->
        <circle cx="245" cy="108" r="20" fill="${PALETTE.sage}" fill-opacity="0.55"/>
        <circle cx="255" cy="118" r="12" fill="${PALETTE.peach}" fill-opacity="0.8"/>
        <line x1="210" y1="146" x2="278" y2="146" stroke="${PALETTE.ink}" stroke-width="1.2"/>
        <line x1="210" y1="156" x2="262" y2="156" stroke="${PALETTE.inkSoft}" stroke-width="1"/>
        <rect x="210" y="166" width="46" height="10" rx="1" fill="${PALETTE.ink}"/>
        <!-- Playback timeline scrub bar -->
        <line x1="28" y1="226" x2="292" y2="226" stroke="${PALETTE.inkHair}" stroke-width="2"/>
        <line x1="28" y1="226" x2="174" y2="226" stroke="${PALETTE.prussian}" stroke-width="2.5"/>
        <circle cx="174" cy="226" r="5" fill="${PALETTE.peach}" stroke="${PALETTE.ink}" stroke-width="1"/>
        <text x="28" y="254" font-family="JetBrains Mono, monospace" font-size="7.5" letter-spacing="1.2" fill="${PALETTE.ink}">STATE: PAUSED // NON-INTRUSIVE FRAME</text>
        <text x="28" y="274" font-family="JetBrains Mono, monospace" font-size="7.5" letter-spacing="1.2" fill="${PALETTE.inkSoft}">INSTANT RESUME LATENCY &lt; 16MS</text>
        ${dotGrid(28, 294, 18, 2, 15, 1.1, 'rgba(15,56,90,0.28)')}
      `);
    }

    case 'ux-yt-wave': {
      let bars = '';
      const heights = [22, 34, 48, 42, 66, 84, 72, 92, 108, 96, 80, 62, 74, 88, 104, 118, 94, 76, 58, 66, 52, 44, 38, 28];
      heights.forEach((h, i) => {
        const x = 32 + i * 11;
        const color = i >= 13 && i <= 16 ? PALETTE.peach : i >= 5 && i <= 10 ? PALETTE.prussian : PALETTE.sage;
        bars += `<rect x="${x}" y="${208 - h}" width="5.5" height="${h}" rx="1" fill="${color}" fill-opacity="0.86"/>`;
      });
      return svgWrap(`
        ${dotGrid(26, 36, 17, 14, 16, 0.95, 'rgba(26,26,26,0.12)')}
        <line x1="28" y1="208" x2="294" y2="208" stroke="${PALETTE.ink}" stroke-width="0.9"/>
        ${bars}
        <!-- Peak reticle -->
        <line x1="199" y1="54" x2="199" y2="220" stroke="${PALETTE.ink}" stroke-width="0.8" stroke-dasharray="2 3"/>
        <circle cx="199" cy="90" r="14" fill="none" stroke="${PALETTE.ink}" stroke-width="0.8"/>
        <circle cx="199" cy="90" r="3" fill="${PALETTE.ink}"/>
        <text x="32" y="54" font-family="JetBrains Mono, monospace" font-size="7.5" letter-spacing="1.2" fill="${PALETTE.ink}">RETENTION WAVEFORM // CH.04</text>
        <text x="32" y="246" font-family="JetBrains Mono, monospace" font-size="7.5" fill="${PALETTE.prussian}">PEAK CHAPTER: +14.2% REPLAY</text>
        <text x="32" y="264" font-family="JetBrains Mono, monospace" font-size="7.5" fill="${PALETTE.inkSoft}">00:00 ─────── 08:42 ─────── 16:10</text>
      `);
    }

    case 'ux-lens-hud': {
      return svgWrap(`
        <defs>
          <radialGradient id="lensFlare" cx="50%" cy="48%" r="42%">
            <stop offset="0%" stop-color="#FFFBF5" stop-opacity="0.95"/>
            <stop offset="28%" stop-color="${PALETTE.peach}" stop-opacity="0.55"/>
            <stop offset="70%" stop-color="${PALETTE.prussian}" stop-opacity="0.24"/>
            <stop offset="100%" stop-color="transparent"/>
          </radialGradient>
        </defs>
        <circle cx="160" cy="160" r="126" fill="url(#lensFlare)"/>
        <circle cx="160" cy="160" r="96" fill="none" stroke="${PALETTE.inkHair}" stroke-width="1"/>
        <circle cx="160" cy="160" r="68" fill="none" stroke="${PALETTE.prussian}" stroke-width="1" stroke-dasharray="3 5"/>
        <circle cx="160" cy="160" r="38" fill="none" stroke="${PALETTE.ink}" stroke-width="0.9"/>
        <!-- Corner viewfinder brackets -->
        <path d="M54 80 L54 58 L76 58 M266 80 L266 58 L244 58 M54 240 L54 262 L76 262 M266 240 L266 262 L244 262" fill="none" stroke="${PALETTE.ink}" stroke-width="1.3"/>
        <line x1="36" y1="160" x2="284" y2="160" stroke="${PALETTE.inkHair}"/>
        <line x1="160" y1="42" x2="160" y2="278" stroke="${PALETTE.inkHair}"/>
        <circle cx="160" cy="160" r="5" fill="${PALETTE.ink}"/>
        <circle cx="160" cy="160" r="2" fill="#FFF"/>
        <text x="56" y="294" font-family="JetBrains Mono, monospace" font-size="7.5" letter-spacing="1.3" fill="${PALETTE.ink}">AUDIO + VISION LOCK</text>
        <text x="208" y="294" font-family="JetBrains Mono, monospace" font-size="7.5" letter-spacing="1.2" fill="${PALETTE.prussian}">LIVE 30HZ</text>
      `);
    }

    case 'ux-motion-curve': {
      return svgWrap(`
        ${dotGrid(36, 48, 16, 14, 16, 0.9, 'rgba(26,26,26,0.12)')}
        <line x1="40" y1="256" x2="280" y2="256" stroke="${PALETTE.ink}" stroke-width="1"/>
        <line x1="40" y1="64" x2="40" y2="256" stroke="${PALETTE.ink}" stroke-width="1"/>
        <!-- Bezier mechanical curve (0.16, 1, 0.3, 1) -->
        <path d="M40 256 C78 64, 112 64, 280 64" fill="none" stroke="${PALETTE.prussian}" stroke-width="2.4"/>
        <!-- Spring curve comparison -->
        <path d="M40 256 C86 80, 124 44, 162 70 C192 86, 214 58, 280 64" fill="none" stroke="${PALETTE.peach}" stroke-width="1.6" stroke-dasharray="4 3"/>
        <!-- Control handles -->
        <line x1="40" y1="256" x2="78" y2="64" stroke="${PALETTE.inkSoft}" stroke-width="0.9"/>
        <circle cx="78" cy="64" r="4" fill="${PALETTE.paper}" stroke="${PALETTE.ink}" stroke-width="1.2"/>
        <circle cx="112" cy="64" r="4" fill="${PALETTE.prussian}"/>
        <circle cx="40" cy="256" r="3.5" fill="${PALETTE.ink}"/>
        <circle cx="280" cy="64" r="3.5" fill="${PALETTE.ink}"/>
        <text x="40" y="42" font-family="JetBrains Mono, monospace" font-size="7.5" letter-spacing="1.2" fill="${PALETTE.ink}">CUBIC-BEZIER(0.16, 1, 0.3, 1)</text>
        <text x="40" y="286" font-family="JetBrains Mono, monospace" font-size="7.5" fill="${PALETTE.prussian}">■ MECHANICAL EASE</text>
        <text x="172" y="286" font-family="JetBrains Mono, monospace" font-size="7.5" fill="${PALETTE.peach}">-- SPRING DAMP</text>
      `);
    }

    /* ------------------------------------------------------------------
       PHOTOGRAPHER (Contact Sheet & Light Meter)
       ------------------------------------------------------------------ */
    case 'photo-contact-sheet': {
      let frames = '';
      const tones = [PALETTE.prussian, PALETTE.sage, PALETTE.peach, '#40535E', '#8F7B6C', '#244A68', '#C89B87', '#597473', '#1C354A'];
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const idx = r * 3 + c;
          const x = 34 + c * 88;
          const y = 54 + r * 78;
          frames += `
            <rect x="${x}" y="${y}" width="76" height="58" fill="${tones[idx]}" fill-opacity="0.82"/>
            <circle cx="${x + 28 + (idx % 3) * 10}" cy="${y + 26}" r="${10 + (idx % 2) * 5}" fill="#FFFBF5" fill-opacity="0.22"/>
            <text x="${x}" y="${y - 4}" font-family="JetBrains Mono, monospace" font-size="6.5" fill="#EAE6DF">35A // 0${idx + 1}</text>
          `;
          if (idx === 1 || idx === 4 || idx === 7) {
            frames += `<rect x="${x - 3}" y="${y - 3}" width="82" height="64" fill="none" stroke="${PALETTE.peach}" stroke-width="1.3"/>`;
          }
        }
      }
      return svgWrap(`
        <rect x="16" y="18" width="288" height="304" rx="2" fill="#1C1C1B"/>
        ${frames}
        <text x="34" y="302" font-family="JetBrains Mono, monospace" font-size="7.5" letter-spacing="1.4" fill="#EAE6DF">ROLL #042 · KODAK PORTRA 400 · SELECTS MARKED</text>
      `, '#EAE6DF');
    }

    case 'photo-exposure-meter': {
      let ticks = '';
      for (let i = 0; i <= 24; i++) {
        const ang = (-130 + i * (260 / 24)) * (Math.PI / 180);
        const r1 = i % 4 === 0 ? 74 : 82;
        const r2 = 90;
        ticks += `<line x1="${160 + Math.cos(ang) * r1}" y1="${162 + Math.sin(ang) * r1}" x2="${160 + Math.cos(ang) * r2}" y2="${162 + Math.sin(ang) * r2}" stroke="${PALETTE.ink}" stroke-width="${i % 4 === 0 ? 1.3 : 0.7}"/>`;
      }
      return svgWrap(`
        <circle cx="160" cy="162" r="102" fill="none" stroke="${PALETTE.inkHair}"/>
        <circle cx="160" cy="162" r="64" fill="${PALETTE.sage}" fill-opacity="0.16" stroke="${PALETTE.ink}" stroke-width="0.9"/>
        ${ticks}
        <line x1="160" y1="162" x2="218" y2="112" stroke="${PALETTE.peach}" stroke-width="2.2"/>
        <circle cx="160" cy="162" r="7" fill="${PALETTE.ink}"/>
        <text x="128" y="196" font-family="JetBrains Mono, monospace" font-size="11" font-weight="600" fill="${PALETTE.prussian}">EV 11.4</text>
        <text x="34" y="42" font-family="JetBrains Mono, monospace" font-size="7.5" letter-spacing="1.2" fill="${PALETTE.ink}">INCIDENT METER // GOLDEN HOUR</text>
        <text x="34" y="294" font-family="JetBrains Mono, monospace" font-size="7.5" fill="${PALETTE.inkSoft}">ISO 400 · f/2.0 · 1/500s</text>
      `);
    }

    /* ------------------------------------------------------------------
       FLORIST (Botanical Blueprint & Seasonal Wheel)
       ------------------------------------------------------------------ */
    case 'florist-blueprint': {
      return svgWrap(`
        <defs>
          <radialGradient id="flGlow" cx="52%" cy="48%" r="48%">
            <stop offset="0%" stop-color="${PALETTE.peach}" stop-opacity="0.45"/>
            <stop offset="55%" stop-color="${PALETTE.sage}" stop-opacity="0.28"/>
            <stop offset="100%" stop-color="transparent"/>
          </radialGradient>
        </defs>
        <circle cx="164" cy="158" r="126" fill="url(#flGlow)"/>
        <!-- Spiral stem architecture -->
        <line x1="160" y1="274" x2="160" y2="66" stroke="${PALETTE.sageDeep}" stroke-width="1.2"/>
        <path d="M160 264 Q146 184 96 108" fill="none" stroke="${PALETTE.sageDeep}" stroke-width="1.1"/>
        <path d="M160 264 Q176 180 232 102" fill="none" stroke="${PALETTE.sageDeep}" stroke-width="1.1"/>
        <path d="M160 264 Q124 202 74 156" fill="none" stroke="${PALETTE.sage}" stroke-width="1"/>
        <path d="M160 264 Q198 196 248 158" fill="none" stroke="${PALETTE.sage}" stroke-width="1"/>
        <!-- Ribbon tie point -->
        <rect x="142" y="214" width="36" height="10" rx="2" fill="${PALETTE.paper}" stroke="${PALETTE.ink}" stroke-width="1"/>
        <!-- Bloom nodes -->
        <circle cx="160" cy="112" r="22" fill="${PALETTE.peach}" fill-opacity="0.65" stroke="${PALETTE.ink}" stroke-width="0.8"/>
        <circle cx="122" cy="134" r="16" fill="#FFFBF5" fill-opacity="0.85" stroke="${PALETTE.ink}" stroke-width="0.8"/>
        <circle cx="198" cy="130" r="14" fill="${PALETTE.sage}" fill-opacity="0.6" stroke="${PALETTE.ink}" stroke-width="0.8"/>
        <circle cx="96" cy="108" r="7" fill="${PALETTE.prussian}"/>
        <circle cx="232" cy="102" r="8" fill="${PALETTE.peach}"/>
        <text x="28" y="40" font-family="JetBrains Mono, monospace" font-size="7.5" letter-spacing="1.2" fill="${PALETTE.ink}">SPIRAL STEM RATIO // NO FOAM</text>
        <text x="28" y="302" font-family="JetBrains Mono, monospace" font-size="7.5" fill="${PALETTE.inkSoft}">35% FOCAL · 40% AIRY · 25% FOLIAGE</text>
      `);
    }

    case 'florist-wheel': {
      let spokes = '';
      const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
      months.forEach((m, i) => {
        const a = (i * 30 - 90) * (Math.PI / 180);
        const len = 46 + ((i * 19) % 44);
        spokes += `
          <line x1="160" y1="164" x2="${160 + Math.cos(a) * 98}" y2="${164 + Math.sin(a) * 98}" stroke="${PALETTE.inkHair}"/>
          <circle cx="${160 + Math.cos(a) * len}" cy="${164 + Math.sin(a) * len}" r="${i % 3 === 0 ? 7 : 4.5}" fill="${i % 3 === 0 ? PALETTE.peach : i % 2 === 0 ? PALETTE.sage : PALETTE.prussian}" fill-opacity="0.82"/>
          <text x="${160 + Math.cos(a) * 112 - 9}" y="${164 + Math.sin(a) * 112 + 3}" font-family="JetBrains Mono, monospace" font-size="6.5" fill="${PALETTE.inkSoft}">${m}</text>
        `;
      });
      return svgWrap(`
        <circle cx="160" cy="164" r="98" fill="none" stroke="${PALETTE.ink}" stroke-width="0.8" stroke-dasharray="2 4"/>
        <circle cx="160" cy="164" r="56" fill="none" stroke="${PALETTE.inkHair}"/>
        ${spokes}
        <circle cx="160" cy="164" r="10" fill="${PALETTE.paper}" stroke="${PALETTE.ink}" stroke-width="1"/>
        <text x="28" y="34" font-family="JetBrains Mono, monospace" font-size="7.5" letter-spacing="1.2" fill="${PALETTE.ink}">NORCAL PHENOLOGY WHEEL</text>
      `);
    }

    /* ------------------------------------------------------------------
       ENGINEER (Shaders, Compiler, CRDT, WebHID, Spring Physics, CLI, Edge)
       ------------------------------------------------------------------ */
    case 'eng-shader-grid': {
      let dots = '';
      for (let r = 0; r < 15; r++) {
        for (let c = 0; c < 14; c++) {
          const x = 34 + c * 19;
          const y = 42 + r * 18;
          const dx = x - 175;
          const dy = y - 160;
          const dist = Math.hypot(dx, dy);
          const rad = Math.max(1, 6.2 - dist / 26);
          const col = dist < 56 ? PALETTE.peach : dist < 115 ? PALETTE.prussian : PALETTE.sage;
          dots += `<circle cx="${x}" cy="${y}" r="${rad.toFixed(2)}" fill="${col}" fill-opacity="${Math.max(0.18, 0.92 - dist / 190).toFixed(2)}"/>`;
        }
      }
      return svgWrap(`
        ${dots}
        <text x="30" y="316" font-family="JetBrains Mono, monospace" font-size="7.5" letter-spacing="1.2" fill="${PALETTE.ink}">FRAG_HALFTONE.GLSL // 120FPS</text>
      `);
    }

    case 'eng-compiler-tree': {
      return svgWrap(`
        ${dotGrid(28, 34, 17, 16, 16, 0.9, 'rgba(26,26,26,0.1)')}
        <!-- AST nodes -->
        <line x1="160" y1="84" x2="92" y2="152" stroke="${PALETTE.ink}" stroke-width="1"/>
        <line x1="160" y1="84" x2="228" y2="152" stroke="${PALETTE.ink}" stroke-width="1"/>
        <line x1="92" y1="152" x2="64" y2="224" stroke="${PALETTE.prussian}" stroke-width="1"/>
        <line x1="92" y1="152" x2="128" y2="224" stroke="${PALETTE.prussian}" stroke-width="1"/>
        <line x1="228" y1="152" x2="196" y2="224" stroke="${PALETTE.sageDeep}" stroke-width="1"/>
        <line x1="228" y1="152" x2="258" y2="224" stroke="${PALETTE.sageDeep}" stroke-width="1"/>
        <rect x="116" y="66" width="88" height="28" rx="2" fill="${PALETTE.prussian}"/>
        <text x="131" y="83" font-family="JetBrains Mono, monospace" font-size="8" fill="#FFF">INTENT AST</text>
        <rect x="56" y="138" width="72" height="26" rx="2" fill="${PALETTE.paper}" stroke="${PALETTE.ink}"/>
        <text x="72" y="154" font-family="JetBrains Mono, monospace" font-size="7.5" fill="${PALETTE.ink}">LAYOUT</text>
        <rect x="192" y="138" width="72" height="26" rx="2" fill="${PALETTE.paper}" stroke="${PALETTE.ink}"/>
        <text x="208" y="154" font-family="JetBrains Mono, monospace" font-size="7.5" fill="${PALETTE.ink}">TOKENS</text>
        <circle cx="64" cy="224" r="14" fill="${PALETTE.peach}" fill-opacity="0.8"/>
        <circle cx="128" cy="224" r="14" fill="${PALETTE.sage}" fill-opacity="0.7"/>
        <circle cx="196" cy="224" r="14" fill="${PALETTE.prussian}" fill-opacity="0.75"/>
        <circle cx="258" cy="224" r="14" fill="${PALETTE.peach}" fill-opacity="0.5"/>
        <text x="32" y="294" font-family="JetBrains Mono, monospace" font-size="7.5" letter-spacing="1.2" fill="${PALETTE.ink}">STREAMING SPEC → LIVE DOM</text>
      `);
    }

    case 'eng-crdt-nodes': {
      return svgWrap(`
        <circle cx="102" cy="112" r="36" fill="${PALETTE.sage}" fill-opacity="0.28" stroke="${PALETTE.ink}" stroke-width="0.9"/>
        <circle cx="222" cy="128" r="42" fill="${PALETTE.prussian}" fill-opacity="0.22" stroke="${PALETTE.ink}" stroke-width="0.9"/>
        <circle cx="152" cy="220" r="34" fill="${PALETTE.peach}" fill-opacity="0.38" stroke="${PALETTE.ink}" stroke-width="0.9"/>
        <line x1="102" y1="112" x2="222" y2="128" stroke="${PALETTE.ink}" stroke-dasharray="3 3"/>
        <line x1="222" y1="128" x2="152" y2="220" stroke="${PALETTE.ink}" stroke-dasharray="3 3"/>
        <line x1="102" y1="112" x2="152" y2="220" stroke="${PALETTE.ink}" stroke-dasharray="3 3"/>
        <circle cx="102" cy="112" r="4.5" fill="${PALETTE.ink}"/>
        <circle cx="222" cy="128" r="4.5" fill="${PALETTE.prussian}"/>
        <circle cx="152" cy="220" r="4.5" fill="${PALETTE.peach}"/>
        <text x="32" y="42" font-family="JetBrains Mono, monospace" font-size="7.5" letter-spacing="1.2" fill="${PALETTE.ink}">CRDT MESH // ZERO-CONFLICT SYNC</text>
        <text x="32" y="296" font-family="JetBrains Mono, monospace" font-size="7.5" fill="${PALETTE.prussian}">RTT 24MS · 3 PEERS ACTIVE</text>
      `);
    }

    case 'eng-rotary-dial': {
      let notches = '';
      for (let i = 0; i < 36; i++) {
        const a = (i * 10) * (Math.PI / 180);
        notches += `<line x1="${160 + Math.cos(a) * 68}" y1="${164 + Math.sin(a) * 68}" x2="${160 + Math.cos(a) * 76}" y2="${164 + Math.sin(a) * 76}" stroke="${PALETTE.ink}" stroke-width="${i % 3 === 0 ? 1.3 : 0.6}"/>`;
      }
      return svgWrap(`
        <rect x="44" y="54" width="232" height="220" rx="8" fill="#E4DFD6" stroke="${PALETTE.ink}" stroke-width="1"/>
        <circle cx="62" cy="72" r="3" fill="${PALETTE.peach}"/>
        <circle cx="74" cy="72" r="3" fill="${PALETTE.inkHair}"/>
        <circle cx="160" cy="164" r="84" fill="none" stroke="${PALETTE.inkHair}"/>
        ${notches}
        <circle cx="160" cy="164" r="56" fill="${PALETTE.paper}" stroke="${PALETTE.ink}" stroke-width="1.4"/>
        <circle cx="188" cy="138" r="7" fill="${PALETTE.prussian}"/>
        <text x="58" y="256" font-family="JetBrains Mono, monospace" font-size="7.5" letter-spacing="1.2" fill="${PALETTE.ink}">WEBHID // ENCODER 01</text>
      `);
    }

    case 'eng-spring-graph': {
      let path = 'M 32 180 ';
      for (let i = 0; i <= 250; i += 4) {
        const t = i / 250;
        const y = 160 - Math.exp(-4.2 * t) * Math.cos(t * 22) * 92;
        path += `L ${32 + i} ${y.toFixed(1)} `;
      }
      return svgWrap(`
        <line x1="32" y1="160" x2="288" y2="160" stroke="${PALETTE.inkHair}" stroke-dasharray="3 3"/>
        <path d="${path}" fill="none" stroke="${PALETTE.prussian}" stroke-width="2"/>
        <circle cx="32" cy="68" r="4.5" fill="${PALETTE.peach}" stroke="${PALETTE.ink}"/>
        <circle cx="282" cy="160" r="3.5" fill="${PALETTE.ink}"/>
        <text x="32" y="42" font-family="JetBrains Mono, monospace" font-size="7.5" letter-spacing="1.2" fill="${PALETTE.ink}">DAMPED HARMONIC SPRING ENGINE</text>
        <text x="32" y="294" font-family="JetBrains Mono, monospace" font-size="7.5" fill="${PALETTE.inkSoft}">K=220 · DAMPING=24 · MASS=1.0</text>
      `);
    }

    case 'eng-pipeline': {
      return svgWrap(`
        ${dotGrid(30, 38, 16, 15, 16, 0.9, 'rgba(26,26,26,0.1)')}
        <rect x="34" y="72" width="252" height="36" rx="2" fill="${PALETTE.paper}" stroke="${PALETTE.ink}"/>
        <rect x="34" y="138" width="252" height="36" rx="2" fill="${PALETTE.sage}" fill-opacity="0.22" stroke="${PALETTE.ink}"/>
        <rect x="34" y="204" width="252" height="36" rx="2" fill="${PALETTE.prussian}" fill-opacity="0.14" stroke="${PALETTE.prussian}"/>
        <line x1="160" y1="108" x2="160" y2="138" stroke="${PALETTE.ink}" stroke-width="1"/>
        <line x1="160" y1="174" x2="160" y2="204" stroke="${PALETTE.ink}" stroke-width="1"/>
        <text x="48" y="94" font-family="JetBrains Mono, monospace" font-size="8" fill="${PALETTE.ink}">01 INGEST · 18,420 RAW SCANS</text>
        <text x="48" y="160" font-family="JetBrains Mono, monospace" font-size="8" fill="${PALETTE.ink}">02 EXTRACT · PALETTE + EXIF + GPS</text>
        <text x="48" y="226" font-family="JetBrains Mono, monospace" font-size="8" fill="${PALETTE.prussian}">03 INDEX · SQLITE FTS5 &lt; 4MS</text>
      `);
    }

    case 'eng-telemetry-bus': {
      return svgWrap(`
        <path d="M30 220 C85 215, 105 90, 160 120 C215 150, 235 80, 290 92" fill="none" stroke="${PALETTE.prussian}" stroke-width="1.8"/>
        <path d="M30 245 C95 235, 130 175, 180 185 C230 195, 250 135, 290 148" fill="none" stroke="${PALETTE.peach}" stroke-width="1.6"/>
        <path d="M30 264 C110 250, 145 218, 200 224 C245 228, 260 198, 290 206" fill="none" stroke="${PALETTE.sage}" stroke-width="1.4"/>
        <line x1="30" y1="274" x2="290" y2="274" stroke="${PALETTE.ink}"/>
        <text x="30" y="42" font-family="JetBrains Mono, monospace" font-size="7.5" letter-spacing="1.2" fill="${PALETTE.ink}">EDGE EVENT TELEMETRY BUS</text>
        <text x="30" y="296" font-family="JetBrains Mono, monospace" font-size="7.5" fill="${PALETTE.inkSoft}">P99 LATENCY 11.4MS // ZERO PII</text>
      `);
    }

    /* ------------------------------------------------------------------
       DATA ARTIST (Sleep Spiral, Chroma DNA, Orbit Echo, Tempo, Contour, Phyllotaxis)
       ------------------------------------------------------------------ */
    case 'data-sleep-spiral': {
      let rings = '';
      for (let i = 0; i < 12; i++) {
        const r = 22 + i * 8.5;
        const dashA = 35 + ((i * 23) % 90);
        const dashB = 12 + ((i * 11) % 24);
        rings += `<circle cx="160" cy="166" r="${r}" fill="none" stroke="${i % 4 === 0 ? PALETTE.peach : i % 2 === 0 ? PALETTE.prussian : PALETTE.sage}" stroke-width="3.2" stroke-dasharray="${dashA} ${dashB}" transform="rotate(${i * 27} 160 166)"/>`;
      }
      return svgWrap(`
        ${rings}
        <circle cx="160" cy="166" r="10" fill="${PALETTE.paper}" stroke="${PALETTE.ink}" stroke-width="0.9"/>
        <line x1="160" y1="36" x2="160" y2="296" stroke="${PALETTE.inkHair}"/>
        <line x1="30" y1="166" x2="290" y2="166" stroke="${PALETTE.inkHair}"/>
        <text x="26" y="32" font-family="JetBrains Mono, monospace" font-size="7.5" letter-spacing="1.2" fill="${PALETTE.ink}">CIRCADIAN LOG // 8,760 HRS</text>
        <text x="26" y="316" font-family="JetBrains Mono, monospace" font-size="7.2" fill="${PALETTE.prussian}">■ DEEP SLEEP</text>
        <text x="128" y="316" font-family="JetBrains Mono, monospace" font-size="7.2" fill="${PALETTE.peach}">■ 3AM WAKE-UPS</text>
      `);
    }

    case 'data-chroma-matrix': {
      const palette = ['#0F385A', '#1B4F78', '#336B88', '#52808A', '#6F9190', '#96ADA8', '#C6C5B9', '#DFCFC2', '#F0BFA9', '#F4A28C', '#D68A74', '#8A675C'];
      let cells = '';
      for (let r = 0; r < 10; r++) {
        for (let c = 0; c < 12; c++) {
          const idx = (c + Math.floor(r * 0.7)) % palette.length;
          cells += `<rect x="${28 + c * 22}" y="${54 + r * 22}" width="18" height="18" rx="1" fill="${palette[idx]}" fill-opacity="${0.72 + ((r + c) % 3) * 0.09}"/>`;
        }
      }
      return svgWrap(`
        ${cells}
        <text x="28" y="38" font-family="JetBrains Mono, monospace" font-size="7.5" letter-spacing="1.2" fill="${PALETTE.ink}">CHROMATIC DNA // 400 FILM FRAMES</text>
        <text x="28" y="298" font-family="JetBrains Mono, monospace" font-size="7.5" fill="${PALETTE.inkSoft}">SORTED BY LUMINANCE × WARMTH</text>
      `);
    }

    case 'data-orbit-echo': {
      return svgWrap(`
        <defs>
          <radialGradient id="echoD" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#FFFBF5"/>
            <stop offset="22%" stop-color="${PALETTE.peach}" stop-opacity="0.72"/>
            <stop offset="65%" stop-color="${PALETTE.prussian}" stop-opacity="0.32"/>
            <stop offset="100%" stop-color="transparent"/>
          </radialGradient>
        </defs>
        <circle cx="160" cy="166" r="118" fill="url(#echoD)"/>
        <circle cx="160" cy="166" r="106" fill="none" stroke="${PALETTE.inkHair}"/>
        <circle cx="160" cy="166" r="82" fill="none" stroke="${PALETTE.ink}" stroke-width="0.8" stroke-dasharray="2 4"/>
        <circle cx="160" cy="166" r="56" fill="none" stroke="${PALETTE.prussian}" stroke-width="1"/>
        <circle cx="160" cy="166" r="30" fill="none" stroke="#FFFBF5" stroke-width="1"/>
        <path d="M160 60 A106 106 0 0 1 262 198" fill="none" stroke="${PALETTE.ink}" stroke-width="1.2"/>
        <circle cx="160" cy="60" r="3" fill="${PALETTE.ink}"/>
        <circle cx="262" cy="198" r="3" fill="${PALETTE.ink}"/>
        <circle cx="160" cy="166" r="4" fill="#FFFBF5"/>
        <text x="26" y="34" font-family="JetBrains Mono, monospace" font-size="7.5" letter-spacing="1.2" fill="${PALETTE.ink}">ACOUSTIC COMMUTE ORBITALS</text>
        <text x="26" y="314" font-family="JetBrains Mono, monospace" font-size="7.5" fill="${PALETTE.inkSoft}">10,000 TRIPS · CALTRAIN + BIKE</text>
      `);
    }

    case 'data-tempo-scatter': {
      let pts = '';
      for (let i = 0; i < 64; i++) {
        const x = 38 + ((i * 41) % 246);
        const trend = 250 - (x - 38) * 0.52 + Math.sin(i * 1.9) * 34;
        const y = Math.max(58, Math.min(264, trend));
        const r = 2 + (i % 4) * 1.1;
        const col = y < 140 ? PALETTE.peach : x > 170 ? PALETTE.prussian : PALETTE.sage;
        pts += `<circle cx="${x}" cy="${y.toFixed(1)}" r="${r}" fill="${col}" fill-opacity="0.78"/>`;
      }
      return svgWrap(`
        <line x1="36" y1="270" x2="288" y2="270" stroke="${PALETTE.ink}"/>
        <line x1="36" y1="54" x2="36" y2="270" stroke="${PALETTE.ink}"/>
        <line x1="38" y1="246" x2="282" y2="118" stroke="${PALETTE.inkHair}" stroke-dasharray="4 4"/>
        ${pts}
        <text x="36" y="38" font-family="JetBrains Mono, monospace" font-size="7.5" letter-spacing="1.2" fill="${PALETTE.ink}">SOLAR ELEVATION VS. BPM</text>
        <text x="36" y="294" font-family="JetBrains Mono, monospace" font-size="7.5" fill="${PALETTE.inkSoft}">N = 9,200 TRACKS · R = +0.68</text>
      `);
    }

    case 'data-contour-field': {
      return svgWrap(`
        <path d="M52 248 C48 164, 96 76, 178 72 C252 68, 282 146, 266 222 C250 284, 114 294, 52 248 Z" fill="${PALETTE.sage}" fill-opacity="0.18" stroke="${PALETTE.sageDeep}" stroke-width="1"/>
        <path d="M78 232 C76 172, 114 102, 178 98 C236 96, 256 154, 242 212 C228 258, 126 268, 78 232 Z" fill="${PALETTE.prussian}" fill-opacity="0.14" stroke="${PALETTE.prussian}" stroke-width="1"/>
        <path d="M108 214 C108 172, 134 128, 178 126 C214 124, 228 162, 218 198 C208 230, 140 238, 108 214 Z" fill="${PALETTE.peach}" fill-opacity="0.34" stroke="${PALETTE.ink}" stroke-width="0.9"/>
        <ellipse cx="172" cy="176" rx="22" ry="18" fill="${PALETTE.peach}" fill-opacity="0.72"/>
        <text x="156" y="179" font-family="JetBrains Mono, monospace" font-size="8" fill="${PALETTE.ink}">25.4°C</text>
        <text x="28" y="38" font-family="JetBrains Mono, monospace" font-size="7.5" letter-spacing="1.2" fill="${PALETTE.ink}">LEVAIN FERMENTATION ISOLINES</text>
        <text x="28" y="308" font-family="JetBrains Mono, monospace" font-size="7.5" fill="${PALETTE.inkSoft}">PEAK RISE WINDOW: 4H 20M</text>
      `);
    }

    case 'data-phyllotaxis': {
      let seeds = '';
      const goldenAngle = 137.508 * (Math.PI / 180);
      for (let i = 1; i <= 145; i++) {
        const r = 8.4 * Math.sqrt(i);
        const a = i * goldenAngle;
        const x = 160 + r * Math.cos(a);
        const y = 168 + r * Math.sin(a);
        const col = i < 40 ? PALETTE.peach : i < 95 ? PALETTE.sage : PALETTE.prussian;
        seeds += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(1.5 + (i / 145) * 2.4).toFixed(1)}" fill="${col}" fill-opacity="0.86"/>`;
      }
      return svgWrap(`
        ${seeds}
        <text x="26" y="34" font-family="JetBrains Mono, monospace" font-size="7.5" letter-spacing="1.2" fill="${PALETTE.ink}">GOLDEN ANGLE // 137.508°</text>
        <text x="26" y="316" font-family="JetBrains Mono, monospace" font-size="7.5" fill="${PALETTE.inkSoft}">24 BOTANICAL SPECIMENS</text>
      `);
    }

    /* ------------------------------------------------------------------
       BABY SITTER (Timeline & Backyard Expedition)
       ------------------------------------------------------------------ */
    case 'babysitter-timeline': {
      return svgWrap(`
        <text x="28" y="40" font-family="JetBrains Mono, monospace" font-size="7.5" letter-spacing="1.2" fill="${PALETTE.ink}">CARE OPS // PACING SCHEDULE</text>
        <line x1="62" y1="68" x2="62" y2="282" stroke="${PALETTE.ink}" stroke-width="1"/>
        <!-- Event markers -->
        <circle cx="62" cy="84" r="5" fill="${PALETTE.sage}"/>
        <text x="80" y="82" font-family="JetBrains Mono, monospace" font-size="8" fill="${PALETTE.ink}">09:30 // PARK SPRINT</text>
        <text x="80" y="96" font-family="Plus Jakarta Sans, sans-serif" font-size="9.5" fill="${PALETTE.inkSoft}">Energy burn + leaf collection</text>

        <circle cx="62" cy="140" r="5" fill="${PALETTE.peach}"/>
        <text x="80" y="138" font-family="JetBrains Mono, monospace" font-size="8" fill="${PALETTE.ink}">11:15 // BENTO SNACK OPS</text>
        <text x="80" y="152" font-family="Plus Jakarta Sans, sans-serif" font-size="9.5" fill="${PALETTE.inkSoft}">Zero foods touching · Apple stars</text>

        <circle cx="62" cy="196" r="5" fill="${PALETTE.prussian}"/>
        <text x="80" y="194" font-family="JetBrains Mono, monospace" font-size="8" fill="${PALETTE.ink}">13:00 // QUIET STORY &amp; NAP</text>
        <text x="80" y="208" font-family="Plus Jakarta Sans, sans-serif" font-size="9.5" fill="${PALETTE.inkSoft}">3 picture books · Dimmed room</text>

        <circle cx="62" cy="252" r="5" fill="${PALETTE.sageDeep}"/>
        <text x="80" y="250" font-family="JetBrains Mono, monospace" font-size="8" fill="${PALETTE.ink}">16:30 // BLOCK CITY + RESET</text>
        <text x="80" y="264" font-family="Plus Jakarta Sans, sans-serif" font-size="9.5" fill="${PALETTE.inkSoft}">Tidy-up song · Happy handoff</text>
      `);
    }

    case 'babysitter-expedition': {
      return svgWrap(`
        <rect x="24" y="34" width="272" height="272" rx="2" fill="#FAF7F1" stroke="${PALETTE.ink}" stroke-width="0.9" stroke-dasharray="4 3"/>
        <text x="40" y="60" font-family="JetBrains Mono, monospace" font-size="8" letter-spacing="1.2" fill="${PALETTE.prussian}">FIELD CARD // BACKYARD SAFARI</text>
        <!-- 4 illustrated checkboxes -->
        <rect x="42" y="84" width="16" height="16" fill="none" stroke="${PALETTE.ink}" stroke-width="1.2"/>
        <path d="M45 92 L50 97 L57 86" fill="none" stroke="${PALETTE.prussian}" stroke-width="1.8"/>
        <text x="70" y="96" font-family="Plus Jakarta Sans, sans-serif" font-size="11" fill="${PALETTE.ink}">01 · One smooth skipping pebble</text>

        <rect x="42" y="132" width="16" height="16" fill="none" stroke="${PALETTE.ink}" stroke-width="1.2"/>
        <path d="M45 140 L50 145 L57 134" fill="none" stroke="${PALETTE.sageDeep}" stroke-width="1.8"/>
        <text x="70" y="144" font-family="Plus Jakarta Sans, sans-serif" font-size="11" fill="${PALETTE.ink}">02 · A leaf bigger than your hand</text>

        <rect x="42" y="180" width="16" height="16" fill="none" stroke="${PALETTE.ink}" stroke-width="1.2"/>
        <path d="M45 188 L50 193 L57 182" fill="none" stroke="${PALETTE.peach}" stroke-width="1.8"/>
        <text x="70" y="192" font-family="Plus Jakarta Sans, sans-serif" font-size="11" fill="${PALETTE.ink}">03 · Shiny silver snail trail</text>

        <rect x="42" y="228" width="16" height="16" fill="none" stroke="${PALETTE.ink}" stroke-width="1.2"/>
        <text x="70" y="240" font-family="Plus Jakarta Sans, sans-serif" font-size="11" fill="${PALETTE.ink}">04 · Cloud shaped like a puppy</text>

        <text x="42" y="286" font-family="JetBrains Mono, monospace" font-size="7.5" fill="${PALETTE.inkSoft}">MAGNIFYING GLASS INCLUDED</text>
      `);
    }

    /* ------------------------------------------------------------------
       BAKER (Ratios & Lamination)
       ------------------------------------------------------------------ */
    case 'baker-ratios': {
      const items = [
        { label: 'CROISSANT', fl: 100, fat: 54, liq: 56 },
        { label: 'CARDAMOM KNOT', fl: 100, fat: 22, liq: 60 },
        { label: 'MISO COOKIE', fl: 100, fat: 68, liq: 26 },
        { label: 'DOG BISCUIT', fl: 100, fat: 38, liq: 44 },
      ];
      let rows = '';
      items.forEach((it, idx) => {
        const y = 74 + idx * 54;
        rows += `
          <text x="30" y="${y}" font-family="JetBrains Mono, monospace" font-size="7.5" letter-spacing="1" fill="${PALETTE.ink}">${it.label}</text>
          <rect x="30" y="${y + 8}" width="${it.fl * 1.15}" height="12" fill="${PALETTE.prussian}"/>
          <rect x="${30 + it.fl * 1.15 + 2}" y="${y + 8}" width="${it.fat * 1.15}" height="12" fill="${PALETTE.peach}"/>
          <rect x="${30 + (it.fl + it.fat) * 1.15 + 4}" y="${y + 8}" width="${it.liq * 1.15}" height="12" fill="${PALETTE.sage}"/>
        `;
      });
      return svgWrap(`
        <text x="30" y="40" font-family="JetBrains Mono, monospace" font-size="7.5" letter-spacing="1.2" fill="${PALETTE.ink}">BAKER'S % // PEOPLE &amp; PUPS</text>
        ${rows}
        <text x="30" y="302" font-family="JetBrains Mono, monospace" font-size="7" fill="${PALETTE.prussian}">■ FLOUR</text>
        <text x="108" y="302" font-family="JetBrains Mono, monospace" font-size="7" fill="${PALETTE.peach}">■ BUTTER / PB</text>
        <text x="212" y="302" font-family="JetBrains Mono, monospace" font-size="7" fill="${PALETTE.sageDeep}">■ HYDRATION</text>
      `);
    }

    case 'baker-lamination': {
      let layers = '';
      for (let i = 0; i < 9; i++) {
        layers += `<rect x="44" y="${96 + i * 14}" width="232" height="5.5" fill="${i % 2 === 0 ? PALETTE.peach : PALETTE.paperWarm}" stroke="${PALETTE.ink}" stroke-width="0.6"/>`;
      }
      return svgWrap(`
        <text x="32" y="42" font-family="JetBrains Mono, monospace" font-size="7.5" letter-spacing="1.2" fill="${PALETTE.ink}">LAMINATION // 27 BUTTER LAYERS</text>
        ${layers}
        <text x="44" y="256" font-family="JetBrains Mono, monospace" font-size="7.5" fill="${PALETTE.prussian}">TARGET BUTTER TEMP: 14°C</text>
        <text x="44" y="276" font-family="JetBrains Mono, monospace" font-size="7.5" fill="${PALETTE.inkSoft}">1× BOOK FOLD · 1× LETTER FOLD · 72H CHILL</text>
      `);
    }

    /* ------------------------------------------------------------------
       PAINTER (5-Tube Pigment Chart)
       ------------------------------------------------------------------ */
    case 'painter-swatches': {
      const swatches = [
        { name: 'PRUSSIAN BLUE', hex: '#0F385A', sub: 'PB27 · TRANSPARENT' },
        { name: 'VIRIDIAN SAGE', hex: '#6F9190', sub: 'PG18 · SEMI-OPAQUE' },
        { name: 'WARM PEACH CORAL', hex: '#F4A28C', sub: 'PR108 · OPAQUE' },
        { name: 'RAW OCHRE', hex: '#C69E6B', sub: 'PY43 · EARTH' },
        { name: 'TITANIUM WARM', hex: '#EFECE5', sub: 'PW6 · BASE' },
      ];
      let out = '';
      swatches.forEach((s, i) => {
        const y = 58 + i * 48;
        out += `
          <rect x="30" y="${y}" width="64" height="34" rx="1.5" fill="${s.hex}" stroke="${PALETTE.ink}" stroke-width="0.7"/>
          <text x="108" y="${y + 14}" font-family="JetBrains Mono, monospace" font-size="8" fill="${PALETTE.ink}">${s.name}</text>
          <text x="108" y="${y + 28}" font-family="JetBrains Mono, monospace" font-size="7" fill="${PALETTE.inkSoft}">${s.sub}</text>
        `;
      });
      return svgWrap(`
        <text x="30" y="38" font-family="JetBrains Mono, monospace" font-size="7.5" letter-spacing="1.2" fill="${PALETTE.ink}">LIMITED 5-TUBE STUDIO PALETTE</text>
        ${out}
      `);
    }

    /* ------------------------------------------------------------------
       GLASS BLOWER (14-Hour Annealing Thermal Curve)
       ------------------------------------------------------------------ */
    case 'glass-annealing': {
      return svgWrap(`
        <defs>
          <linearGradient id="kilnHeat" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="${PALETTE.peach}" stop-opacity="0.52"/>
            <stop offset="55%" stop-color="${PALETTE.sage}" stop-opacity="0.22"/>
            <stop offset="100%" stop-color="${PALETTE.prussian}" stop-opacity="0.28"/>
          </linearGradient>
        </defs>
        ${dotGrid(36, 54, 15, 13, 16, 0.9, 'rgba(26,26,26,0.12)')}
        <path d="M38 110 L118 110 L184 186 L282 254 L282 262 L38 262 Z" fill="url(#kilnHeat)"/>
        <polyline points="38,110 118,110 184,186 282,254" fill="none" stroke="${PALETTE.ink}" stroke-width="2"/>
        <circle cx="38" cy="110" r="4" fill="${PALETTE.peach}" stroke="${PALETTE.ink}"/>
        <circle cx="118" cy="110" r="4" fill="${PALETTE.peach}" stroke="${PALETTE.ink}"/>
        <circle cx="184" cy="186" r="4" fill="${PALETTE.sage}" stroke="${PALETTE.ink}"/>
        <circle cx="282" cy="254" r="4" fill="${PALETTE.prussian}" stroke="${PALETTE.ink}"/>
        <line x1="38" y1="54" x2="38" y2="262" stroke="${PALETTE.ink}"/>
        <line x1="38" y1="262" x2="288" y2="262" stroke="${PALETTE.ink}"/>
        <text x="38" y="38" font-family="JetBrains Mono, monospace" font-size="7.5" letter-spacing="1.2" fill="${PALETTE.ink}">ANNEALING KILN // 516°C → 24°C</text>
        <text x="46" y="100" font-family="JetBrains Mono, monospace" font-size="7" fill="${PALETTE.ink}">SOAK 960°F (2H)</text>
        <text x="192" y="182" font-family="JetBrains Mono, monospace" font-size="7" fill="${PALETTE.prussian}">STRAIN PT</text>
        <text x="38" y="294" font-family="JetBrains Mono, monospace" font-size="7.5" fill="${PALETTE.inkSoft}">0H ───── 4H ───── 9H ───── 14H</text>
      `);
    }

    default:
      return svgWrap(`
        <circle cx="160" cy="170" r="64" fill="none" stroke="${PALETTE.ink}" stroke-dasharray="3 4"/>
        <circle cx="160" cy="170" r="6" fill="${PALETTE.peach}"/>
      `);
  }
}
