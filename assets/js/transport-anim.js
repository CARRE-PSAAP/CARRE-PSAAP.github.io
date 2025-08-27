document.addEventListener('DOMContentLoaded', () => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('.transport-anim').forEach(container => {
    const cnv = container.querySelector('canvas');
    const ctx = cnv.getContext('2d');
    const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

    let lastTS = performance.now();
    let running = true; // start true; IO will flip it later

    const num = (v, d) => {
        const n = parseFloat(v);
        return Number.isFinite(n) ? n : d;
    };

    const particlesBase = +container.dataset.particles || 140;
    const speedBase = +container.dataset.speed || 1.0;
    const shape = (container.dataset.shape || 'chip').toLowerCase();

    const spawnMode = (container.dataset.spawn || 'left').toLowerCase();
    const chipShape = (container.dataset.chipshape || 'rect').toLowerCase();

    // Chip params
    const pinCount = +container.dataset.pins || 12;
    const pinLen   = +container.dataset.pinlen || 16;
    const pinW     = +container.dataset.pinwidth || 3;

    // Interaction model
    const mfp           = +container.dataset.mfp || 90;           // px
    const absorbProb    = +container.dataset.absorb || 0.35;
    const secondariesMu = +container.dataset.secondary || 1.6;     // ~avg children
    const secSpread     = +container.dataset.secspread || 0.55;    // radians
    const energyDecay   = +container.dataset.energydecay || 0.65;
    const widthDecay    = +container.dataset.widthdecay || 0.75;
    const MAXN          = +container.dataset.maxn || 420;

    const GEN_MAX         = +container.dataset.genmax || 2;
    const interactScatter = +container.dataset.interactscatter || 0.25;
    const speedLoss       = +container.dataset.speedloss || 0.88;

    // scatter: allow radians (back-compat) or degrees via scatterdeg
    const scatterDeg = +container.dataset.scatterdeg || 0;
    const scatterRad = scatterDeg
        ? (scatterDeg * Math.PI / 180)
        : (+container.dataset.scatter || 0.20);

    // how wide we randomize the target point inside the object (0..0.5 typical)
    const aimSpread   = +container.dataset.aimspread || 0.18;  // fraction of w/h


    // heat bloom
    const heatOn    = (container.dataset.heat ?? '1') !== '0';
    const heatColor = container.dataset.heatcolor || '#ff7a4f';
    const heatAlpha = num(container.dataset.heatalpha, 0.9);
    const heatMaxR  = num(container.dataset.heatmaxr, 22);
    const heatDecay = num(container.dataset.heatdecay, 0.92);
    const heatGrow  = num(container.dataset.heatgrow, 0.9);

    // storage for active heat blooms
    const HEAT = [];


    let W = 0, H = 0;

    const css = (v, fb) => (getComputedStyle(container).getPropertyValue(v).trim() || fb);
    const colors = {
      bg: css('--bg', '#0b1b2b'),
      object: css('--object', '#112436'),
      layer: css('--layer', '#1b3b57'),
      pin: css('--pin', '#9db1c1'),
      trail: css('--trail', '#e8552b'),
      glow: css('--glow', 'rgba(232,85,43,.35)')
    };

    function resize() {
      const r = container.getBoundingClientRect();
      W = Math.max(300, Math.floor(r.width));
      H = Math.max(180, Math.floor(r.height));
      cnv.width  = Math.floor(W * DPR);
      cnv.height = Math.floor(H * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    resize();                // set W/H & canvas backing store
    const P = [];
    for (let i = 0; i < ( +container.dataset.particles || 140 ); i++) {
        P.push(spawnPrimary()); // now uses fresh W/H and scatterRad
    }
    requestAnimationFrame(tick);
    window.addEventListener('resize', resize);

    // Is (x,y) inside a rounded-rect defined by g = {x,y,w,h,r} ?
    function insideRoundedRect(g, x, y){
        const rx = g.x, ry = g.y, w = g.w, h = g.h, r = Math.max(0, Math.min(g.r, Math.min(w,h)/2));
        // core rectangles (center strips)
        if (x >= rx + r && x <= rx + w - r && y >= ry && y <= ry + h) return true;
        if (x >= rx && x <= rx + w && y >= ry + r && y <= ry + h - r) return true;
        // corner circles
        const r2 = r*r;
        // top-left
        let dx = x - (rx + r), dy = y - (ry + r);
        if (dx*dx + dy*dy <= r2 && x >= rx && y >= ry) return true;
        // top-right
        dx = x - (rx + w - r); dy = y - (ry + r);
        if (dx*dx + dy*dy <= r2 && x <= rx + w && y >= ry) return true;
        // bottom-right
        dx = x - (rx + w - r); dy = y - (ry + h - r);
        if (dx*dx + dy*dy <= r2 && x <= rx + w && y <= ry + h) return true;
        // bottom-left
        dx = x - (rx + r); dy = y - (ry + h - r);
        if (dx*dx + dy*dy <= r2 && x >= rx && y <= ry + h) return true;

        return false;
    }

    // Convenience: same check for a segment midpoint
    const insideObj = (g, x, y) => insideRoundedRect(g, x, y);


    // Smaller, centered object; leave generous "space" around it
    function objectPath() {
        // Larger pads ⇒ smaller object (leaves visible “space” around it)
        const padX = Math.round(W * 0.28);
        const padY = Math.round(H * 0.24);

        // Leave room for pins if drawing a chip
        const extra = (shape === 'chip') ? (pinLen + 8) : 0;

        // Inner drawable area (body will be placed inside this)
        const innerW = W - (padX + extra) * 2;
        const innerH = H - (padY + extra) * 2;

        let rw, rh, x, y;

        if (shape === 'chip' && chipShape === 'square') {
            // Make the chip body a square and center it within the inner area
            const side = Math.min(innerW, innerH);
            rw = rh = side;
            x = padX + extra + Math.round((innerW - side) / 2);
            y = padY + extra + Math.round((innerH - side) / 2);
        } else {
            // Slab (or rectangular chip)
            rw = innerW;
            rh = innerH;
            x = padX + extra;
            y = padY + extra;
        }

        const r = Math.min(28, Math.min(rw, rh) * 0.08); // gentle rounding
        const p = new Path2D();
        p.moveTo(x + r, y);
        p.arcTo(x + rw, y, x + rw, y + rh, r);
        p.arcTo(x + rw, y + rh, x, y + rh, r);
        p.arcTo(x, y + rh, x, y, r);
        p.arcTo(x, y, x + rw, y, r);
        p.closePath();

        return { path: p, x, y, w: rw, h: rh, r, extra };
    }


    function drawObject(g) {
      // Body
      ctx.fillStyle = colors.object;
      ctx.fill(g.path);

      // Style: chip vs slab
      if (shape === 'chip') {
        // outline + orientation dot
        ctx.strokeStyle = colors.layer;
        ctx.lineWidth = 1.25;
        ctx.stroke(g.path);

        ctx.fillStyle = colors.layer;
        ctx.beginPath();
        ctx.arc(g.x + g.r * 0.6, g.y + g.r * 0.6, Math.max(2, g.r * 0.18), 0, Math.PI * 2);
        ctx.fill();

        // pins (decorative)
        ctx.strokeStyle = colors.pin; ctx.lineWidth = pinW;
        for (let i = 1; i <= pinCount; i++) {
          const yy = g.y + (g.h / (pinCount + 1)) * i;
          // left/right
          ctx.beginPath(); ctx.moveTo(g.x - pinLen, yy); ctx.lineTo(g.x, yy); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(g.x + g.w, yy); ctx.lineTo(g.x + g.w + pinLen, yy); ctx.stroke();
        }
        for (let i = 1; i <= pinCount; i++) {
          const xx = g.x + (g.w / (pinCount + 1)) * i;
          // top/bottom
          ctx.beginPath(); ctx.moveTo(xx, g.y - pinLen); ctx.lineTo(xx, g.y); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(xx, g.y + g.h); ctx.lineTo(xx, g.y + g.h + pinLen); ctx.stroke();
        }

        // subtle inner lines
        ctx.strokeStyle = colors.layer; ctx.lineWidth = 1;
        for (let i = 1; i <= 2; i++) {
          const yy = g.y + (g.h / (2 + 1)) * i;
          ctx.beginPath(); ctx.moveTo(g.x + 6, yy); ctx.lineTo(g.x + g.w - 6, yy); ctx.stroke();
        }
      } else {
        // slab guide lines
        ctx.strokeStyle = colors.layer; ctx.lineWidth = 1;
        for (let i = 1; i <= 3; i++) {
          const yy = g.y + (g.h / (3 + 1)) * i;
          ctx.beginPath(); ctx.moveTo(g.x + 1, yy); ctx.lineTo(g.x + g.w - 1, yy); ctx.stroke();
        }
      }
    }

    const MAX_HEAT = 64; // hard cap

    function addHeat(x, y, energy=1){
        if (!heatOn) return;
        if (HEAT.length >= MAX_HEAT) HEAT.shift(); // drop oldest
        HEAT.push({
            x, y,
            r: 2,
            maxR: heatMaxR * (0.85 + 0.3*energy),
            alpha: Math.min(1, heatAlpha * (0.8 + 0.4*energy))
        });
    }

    function withAlpha(color, a){
        if (typeof color !== 'string') return color;
        if (color.startsWith('#')) {
            const n = color.slice(1);
            const to = v => parseInt(v.length === 1 ? v+v : v, 16);
            const r = to(n.slice(0, n.length===3 ? 1 : 2));
            const g = to(n.slice(n.length===3 ? 1 : 2, n.length===3 ? 2 : 4));
            const b = to(n.slice(n.length===3 ? 2 : 4, n.length===3 ? 3 : 6));
            return `rgba(${r},${g},${b},${a})`;
        }
        const m = color.match(/rgba?\(([^)]+)\)/i);
        if (m) {
            const [r,g,b] = m[1].split(',').slice(0,3).map(s => s.trim());
            return `rgba(${r}, ${g}, ${b}, ${a})`;
        }
        return color;
    }

    function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

    function spawnPrimary() {
        const g = objectPath();

        // Choose a side
        let side = spawnMode;
        if (spawnMode === 'edges') side = pick(['left','right','top','bottom']);
        if (!['left','right','top','bottom'].includes(side)) side = 'left';

        // Start well off-canvas on that side
        const offX = W * (0.15 + Math.random()*0.25);
        const offY = H * (0.15 + Math.random()*0.25);
        let xStart, yStart;
        if (side === 'left')   { xStart = -offX;     yStart = Math.random()*H; }
        if (side === 'right')  { xStart = W + offX;  yStart = Math.random()*H; }
        if (side === 'top')    { xStart = Math.random()*W; yStart = -offY; }
        if (side === 'bottom') { xStart = Math.random()*W; yStart = H + offY; }

        // target: around the object's center, within aimSpread
        const cx = g.x + g.w * 0.5;
        const cy = g.y + g.h * 0.5;
        const targetX = cx + (Math.random()*2 - 1) * g.w * aimSpread;
        const targetY = cy + (Math.random()*2 - 1) * g.h * aimSpread;

        // base direction to target, then add jitter
        const baseAngle = Math.atan2(targetY - yStart, targetX - xStart);
        const angle = baseAngle + (Math.random() - 0.5) * 2 * scatterRad;


        const speed = (1.3 + Math.random() * 0.8) * speedBase;
        const vx = Math.cos(angle) * (speed * 1.7);
        const vy = Math.sin(angle) * (speed * 1.7);

        const w = 1.6 + Math.random() * 1.6;
        const life = 200 + Math.random() * 180;

        return {
            x: xStart, y: yStart, vx, vy,
            w, life, age: 0,
            energy: 1.0,
            gen: 0,
            angle
        };
    }


    function spawnChild(x, y, parent) {
      // Poisson-ish around secondariesMu
      const n = Math.max(1, Math.round(secondariesMu + (Math.random() - 0.5)));
      const kids = [];
      for (let i = 0; i < n; i++) {
        const a = parent.angle + (Math.random() - 0.5) * secSpread * 2;
        const e = parent.energy * energyDecay;
        const s = Math.hypot(parent.vx, parent.vy) * energyDecay;
        kids.push({
          x, y,
          vx: Math.cos(a) * s,
          vy: Math.sin(a) * s,
          w: Math.max(0.8, parent.w * widthDecay),
          life: 120 + Math.random() * 90,
          age: 0,
          energy: e,
          gen: parent.gen + 1,
          angle: a
        });
      }
      return kids;
    }

    // Seed
    for (let i = 0; i < particlesBase; i++) P.push(spawnPrimary());

    // Pause off-screen
    let observer;
    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver(entries => {
            entries.forEach(e => { running = e.isIntersecting && !prefersReduced; });
        }, { threshold: 0, rootMargin: '100px' }); // easier to “intersect”
        io.observe(container);
    }

    function drawTrails(g, fscale){
        const NEXT = [];
        const stepAlphaSpace  = 0.45;
        const stepAlphaInside = 0.9;
        const trailSegs = 12;

        // process a snapshot of P *without* mutating it mid-loop
        for (let i = 0, n = P.length; i < n; i++) {
            const p = P[i];

            // integrate (per-frame → time-scaled)
            p.age += fscale;                 // if you compare to life later
            p.x += p.vx * fscale;
            p.y += p.vy * fscale;

            const step = Math.hypot(p.vx, p.vy) * fscale;  // path length this frame
            const insideNow = insideObj(g, p.x, p.y);

            // in-object interaction?
            if (insideNow && Math.random() < (1 - Math.exp(-step / mfp))) {
                const canBranch = (p.gen < GEN_MAX) && (NEXT.length + (n - i) < MAXN);

                // 1) Absorb with configured probability
                if (Math.random() < absorbProb) {
                    addHeat(p.x, p.y, p.energy);
                    NEXT.push(spawnPrimary());
                    continue;
                }

                // 2) Otherwise, branch if allowed…
                if (canBranch) {
                    const kids = spawnChild(p.x, p.y, p);
                    for (let k = 0; k < kids.length && NEXT.length + (n - i) < MAXN; k++) {
                    NEXT.push(kids[k]);
                    }
                    continue;
                }

                // 3) …or just scatter (no branching) once gen cap is reached
                p.angle += (Math.random() - 0.5) * interactScatter * 2;
                const vmag = Math.hypot(p.vx, p.vy) * speedLoss;
                p.vx = Math.cos(p.angle) * vmag;
                p.vy = Math.sin(p.angle) * vmag;
                p.w = Math.max(0.8, p.w * widthDecay); // thin a bit
                NEXT.push(p);
                continue;
            }

            // recycle if old or way out of view
            if (p.x > W + 80 || p.y < -80 || p.y > H + 80 || p.age > p.life) {
                NEXT.push(spawnPrimary());
                continue;
            }

            // draw trail; scale the segment offsets so tail length is fps-stable
            const dxSeg = p.vx * fscale;
            const dySeg = p.vy * fscale;

            ctx.lineWidth = p.w;
            for (let k = 0; k < trailSegs; k++) {
                const f  = k / trailSegs;
                const x2 = p.x - dxSeg * k;
                const y2 = p.y - dySeg * k;
                const x1 = p.x - dxSeg * (k + 1);
                const y1 = p.y - dySeg * (k + 1);

                const mx = (x1 + x2) * 0.5, my = (y1 + y2) * 0.5;
                const inSeg = insideObj(g, mx, my);

                ctx.globalAlpha = (inSeg ? stepAlphaInside : stepAlphaSpace) * (1 - f);
                ctx.strokeStyle = colors.trail;
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
            }
            ctx.globalAlpha = 1;

            NEXT.push(p);
        }

        // keep population sane
        while (NEXT.length > MAXN) NEXT.pop();
        P.length = 0;
        Array.prototype.push.apply(P, NEXT);
    }

    function drawHeat(g, fscale){
        if (!HEAT.length) return;
        ctx.save();
        ctx.clip(g.path);                          // keep heat inside the object
        ctx.globalCompositeOperation = 'lighter';  // additive blend for a bright feel

        for (let i = HEAT.length - 1; i >= 0; i--){
            const h = HEAT[i];
            h.r = Math.min(h.maxR, h.r + heatGrow * fscale);   // expand a bit each frame
            h.alpha *= Math.pow(heatDecay, fscale);            // fade
            if (h.alpha < 0.02) { HEAT.splice(i,1); continue; }

            const grad = ctx.createRadialGradient(h.x, h.y, 0, h.x, h.y, h.r);
            grad.addColorStop(0.00, withAlpha(heatColor, Math.min(1, h.alpha)));
            grad.addColorStop(0.35, withAlpha(heatColor, Math.min(1, h.alpha*0.55)));
            grad.addColorStop(1.00, withAlpha(heatColor, 0));
            ctx.fillStyle = grad;
            ctx.beginPath(); 
            ctx.arc(h.x, h.y, h.r, 0, Math.PI*2); 
            ctx.fill();
        }

        ctx.restore();
        ctx.globalCompositeOperation = 'source-over';
    }


    function tick() {
        const now = performance.now();
        // dt in seconds; clamp so tab switches don’t explode motion
        let dt = (now - lastTS) / 1000;
        if (!isFinite(dt) || dt <= 0) dt = 1/60;
        dt = Math.min(dt, 0.05); // <= 50 ms
        lastTS = now;

        // 1.0 at 60fps; 0.5 at 120fps; freeze motion when not running
        const fscale = (running ? dt : 0) * 60;
      
        try {
            ctx.setTransform(DPR, 0, 0, DPR, 0, 0); // in case devicePixelRatio changed
            ctx.clearRect(0, 0, W, H);

            const g = objectPath();
            drawObject(g);
            drawTrails(g, fscale);// particles (inside + space)
            drawHeat(g, fscale);  // absorption blooms (on top)
        } catch (e) {
            console.error('[transport-anim] frame error:', e);
            // optional: pause on repeated errors
            // if (++errCount > 5) running = false;
        } finally {
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = 'source-over';
            requestAnimationFrame(tick);
        }
    }
  });
});
