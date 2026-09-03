'use client';

import {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  buildAdjacency,
  EDGES,
  focusLayout,
  layoutFor,
  NetNode,
  NODES,
  PROJECT_FOCUS,
  Scene,
  Vec3,
} from '../lib/network';

/**
 * One network, running behind the whole page.
 *
 * This is a single fixed canvas that lives for the life of the document. As you
 * scroll, it does not swap out for a different visual — it re-poses. The same
 * nodes that drift as a constellation in the hero flatten into the waterfall
 * behind the trace, then draw together into stack-layer clusters behind the
 * origin copy. Continuity was the hard requirement, and interpolating one
 * persistent graph between truthful layouts is the only way to get it that
 * doesn't cheat.
 *
 * The primary event is a production rollout, staged the way a real one is:
 * a single canary first, a health-check pause, then progressive waves. Each node
 * drains before it updates — traffic reroutes to its neighbours, it takes the new
 * version, then it rejoins. Draining is the part that actually makes a deploy
 * zero-downtime, and it's almost never shown; it's also what keeps the animation
 * calm, because nothing ever fails, it just steps aside.
 *
 * No 3D library, no models, no textures: perspective projection over ~25 nodes.
 */

const FOCAL = 2.6;
const VERSION_OLD = 'v2.4.0';
const VERSION_NEW = 'v2.4.1';

type NodeState = 'stable' | 'draining' | 'updating' | 'updated';

type Live = {
  node: NetNode;
  /** Current interpolated position. */
  pos: Vec3;
  /** Where the active scene wants it. */
  target: Vec3;
  /** Idle drift phases, so nothing moves in lockstep. */
  px: number;
  py: number;
  pz: number;
  /** Cursor-influence offset, spring-damped. */
  ox: number;
  oy: number;
  vox: number;
  voy: number;
  state: NodeState;
  version: string;
  /** 0–1 glow used for rollout pulses and hover emphasis. */
  heat: number;
  /** Screen-space cache, filled each frame. */
  sx: number;
  sy: number;
  depth: number;
  scale: number;
};

type Packet = {
  from: number;
  to: number;
  t: number;
  speed: number;
};

const SCENE_ALPHA: Record<Scene, number> = {
  // The hero is the only place the network is the subject. Everywhere else it is
  // foundation, and must never compete with the words on top of it. From there
  // the curve is deliberate, not a flat plateau: present for the product work,
  // receding through the two quieter, more reflective chapters, then rising
  // again as the network gathers for the close — so presence itself traces an
  // arc instead of holding one steady background level for the whole page.
  //
  // Status was tuned to 0.46 to sell that "return" — until seeing it rendered
  // against the actual paragraph showed bright nodes sitting on the words. The
  // arc still rises at the close, just not far enough to fight the sentence
  // that closes the site.
  //
  // Work was tuned high (0.32) back when the section was four large image
  // tiles — the alpha only ever showed through the slivers between them. Now
  // that it's a text list, that same number is fully exposed behind every
  // row's title and body copy instead of hiding under a photo. Brought down
  // near Trace's level, since it's carrying the same kind of content now.
  hero: 1,
  work: 0.22,
  trace: 0.2,
  origin: 0.18,
  status: 0.3,
};

/**
 * Mobile gets its own curve, not a scaled-down copy of the desktop one.
 *
 * A phone has no spare width to put the graph beside the text the way the
 * hero does, and every section here stacks into one long reading column — so
 * the network has far less room to be present in without sitting on top of
 * something a visitor is trying to read. Work keeps most of its presence
 * (screenshots tolerate it); the three reading-heavy chapters — Trace's row
 * list, Origin's tech stack, and especially Status's message and checklist —
 * go quieter than their desktop counterparts, not uniformly dimmer than them.
 *
 * Work has since joined that list: it's a text row-list now, not four image
 * tiles, so it's tuned down alongside Trace instead of sitting near the top.
 */
const SCENE_ALPHA_MOBILE: Record<Scene, number> = {
  hero: 0.92,
  work: 0.16,
  trace: 0.16,
  origin: 0.1,
  status: 0.2,
};

export default function NetworkField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hover, setHover] = useState<{
    node: NetNode;
    x: number;
    y: number;
  } | null>(null);
  const sceneRef = useRef<Scene>('hero');

  /*
   * There is deliberately no scene observer here any more.
   *
   * Scene used to be chosen by an IntersectionObserver, which meant the graph's
   * framing changed on a section boundary while its nodes eased on their own
   * clock — two rates the eye reads as a cut. The scroll position is now the
   * only clock, sampled per frame inside the render loop.
   */

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    const finePointer = window.matchMedia(
      '(hover: hover) and (pointer: fine)'
    ).matches;
    // Matches the Tailwind `md:` breakpoint used throughout the page, so the
    // network's own idea of "mobile" agrees with the layout's.
    const initialMobile = window.innerWidth < 768;

    // Deterministic RNG: the composition is art-directed, not random per load.
    let seed = 20260806;
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };

    const indexOf = new Map<string, number>();
    NODES.forEach((n, i) => indexOf.set(n.id, i));

    const initial = layoutFor('hero');
    const live: Live[] = NODES.map((node) => {
      const t = initial.get(node.id)!;
      return {
        node,
        // Start AT the composed position, not gathered at the centre. An
        // assemble-from-nothing intro looks good but depends on the frame loop
        // to finish, and requestAnimationFrame is throttled in background tabs —
        // so anyone opening this in a new tab would come back to a network stuck
        // part-way through assembling. The composition must be correct on frame
        // one; the life comes from drift, packets and the rollout instead.
        pos: { ...t },
        target: { ...t },
        px: rand() * Math.PI * 2,
        py: rand() * Math.PI * 2,
        pz: rand() * Math.PI * 2,
        ox: 0,
        oy: 0,
        vox: 0,
        voy: 0,
        state: 'stable',
        version: VERSION_OLD,
        heat: 0,
        sx: 0,
        sy: 0,
        depth: 0,
        scale: 1,
      };
    });

    const adj = buildAdjacency();
    const edgePairs: Array<[number, number]> = EDGES.map(([a, b]) => [
      indexOf.get(a)!,
      indexOf.get(b)!,
    ]);

    // ---- Packets travel node to node, choosing a live neighbour on arrival, so
    // flow reads as routing rather than decorative dots on fixed rails. ----
    const packets: Packet[] = [];
    const neighboursOf = (i: number) =>
      (adj.get(NODES[i].id) ?? []).map((id) => indexOf.get(id)!);

    const pickNext = (from: number, avoid: number) => {
      const ns = neighboursOf(from).filter(
        (n) => n !== avoid && live[n].state === 'stable'
      );
      const pool = ns.length ? ns : neighboursOf(from);
      return pool[Math.floor(rand() * pool.length)] ?? from;
    };

    const seedPackets = (count: number) => {
      for (let i = 0; i < count; i++) {
        const from = Math.floor(rand() * live.length);
        const to = pickNext(from, -1);
        packets.push({
          from,
          to,
          t: rand(),
          speed: 0.0045 + rand() * 0.005,
        });
      }
    };
    if (!reduceMotion) seedPackets(initialMobile ? 10 : 20);

    // ---- Rollout state machine ----
    type Phase = 'idle' | 'canary' | 'verify' | 'wave' | 'settled';
    let phase: Phase = 'idle';
    let phaseClock = 0;
    let waveQueue: number[][] = [];
    let armedAt = 0;
    const beginRollout = () => {
      if (reduceMotion) return;
      live.forEach((l) => {
        l.state = 'stable';
        l.version = VERSION_OLD;
      });
      // Canary is an edge POP: the blast radius you'd actually choose first.
      const canary = indexOf.get('iad')!;
      const rest = live
        .map((_, i) => i)
        .filter((i) => i !== canary)
        .sort(() => rand() - 0.5);
      const third = Math.ceil(rest.length / 3);
      waveQueue = [
        [canary],
        rest.slice(0, third),
        rest.slice(third, third * 2),
        rest.slice(third * 2),
      ];
      phase = 'canary';
      phaseClock = 0;
      startWave(waveQueue.shift()!);
    };

    const startWave = (batch: number[]) => {
      // Drain first. The node stops taking traffic before it changes.
      batch.forEach((i) => {
        live[i].state = 'draining';
        live[i].heat = 1;
      });
      // Stagger the actual version flip so a wave ripples instead of blinking.
      batch.forEach((i, k) => {
        window.setTimeout(() => {
          if (live[i].state === 'draining') live[i].state = 'updating';
        }, 260 + k * 70);
        window.setTimeout(() => {
          if (live[i].state === 'updating') {
            live[i].state = 'updated';
            live[i].version = VERSION_NEW;
            live[i].heat = 1;
          }
        }, 620 + k * 70);
        window.setTimeout(() => {
          if (live[i].state === 'updated') live[i].state = 'stable';
        }, 1500 + k * 70);
      });
    };

    // ---- Canvas sizing ----
    let w = 0;
    let h = 0;
    // Re-checked on every resize, not just at mount, so rotating a device or
    // resizing across the breakpoint updates the framing live.
    let isMobile = initialMobile;
    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      isMobile = w < 768;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    // ---- Theme ----
    let ink = '245,245,244';
    let accent = '249,115,22';
    let good = '16,185,129';
    const readTheme = () => {
      const light = document.documentElement.classList.contains('light');
      ink = light ? '28,25,23' : '245,245,244';
      accent = light ? '194,65,12' : '249,115,22';
      good = light ? '4,120,87' : '16,185,129';
    };
    readTheme();
    const themeObserver = new MutationObserver(readTheme);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    // ---- Camera + pointer ----
    let yaw = 0;
    let tiltX = 0;
    let tiltY = 0;
    let targetTiltX = 0;
    let targetTiltY = 0;
    let pointerX = -9999;
    let pointerY = -9999;
    let hoveredIdx = -1;
    let publishedHover = -1;

    // Which project is currently in front of the reader, if any. WorkSection
    // announces this; the field answers by re-posing around that project's real
    // stack, so scrolling the work visibly rearranges the world behind it.
    /**
     * Discovery.
     *
     * The graph arrives anonymous — shapes and connections, no names. Names are
     * earned by reaching for them: hover a node and it identifies itself, its
     * real connections light, and the things it touches name themselves too.
     *
     * Anything uncovered stays faintly marked afterwards, so the parts of the
     * system you went looking through are visibly yours. Nothing announces this
     * and nothing counts it — it's a reward for curiosity, not a progress bar.
     */
    const discovered = new Set<string>();

    // Nodes highlighted from the page itself: hovering a technology in the
    // stack list, or a project, reaches into the background and lights up that
    // part of the system. Text controlling the ambient graph is the single most
    // surprising interaction here, so it's wired everywhere it makes sense.
    let highlightIds: string[] | null = null;
    const onHighlight = (e: Event) => {
      const ids = (e as CustomEvent<string[] | null>).detail;
      highlightIds = ids && ids.length ? ids : null;
    };
    window.addEventListener('network:highlight', onHighlight as EventListener);

    let focusProject: string | null = null;
    // Eased 0→1 so a project's architecture is drawn in and released rather than
    // snapped to.
    let focusMix = 0;
    let focusCacheKey: string | null = null;
    let focusCache: Map<string, Vec3> | null = null;
    const onFocusProject = (e: Event) => {
      focusProject = (e as CustomEvent<string | null>).detail ?? null;
    };
    window.addEventListener('network:focus', onFocusProject as EventListener);

    /**
     * The visitor's own node.
     *
     * It exists from the first frame, drifting loosely near the cursor, dim
     * enough that nobody consciously registers it. That's intentional: the
     * closing moment only works if it was already there the whole time, so that
     * recognising it feels like remembering rather than being told.
     */
    const visitor = { x: 0, y: 0, tx: 0, ty: 0, glow: 0, seen: false };

    /**
     * Hero wake. The connections draw themselves in on arrival so the first
     * seconds contain an event rather than a finished picture.
     *
     * Starts at 1 (fully drawn) and is only rewound to 0 when the document is
     * actually visible — so a page opened in a background tab, where the frame
     * loop is throttled, is composed correctly instead of frozen half-drawn.
     */
    let intro = 1;
    if (!reduceMotion && !document.hidden) intro = 0;
    // Last published readout position, tracked here rather than read back out of
    // React state, so the frame loop never depends on render timing.
    let hoverX = 0;
    let hoverY = 0;

    const onPointerMove = (e: PointerEvent) => {
      pointerX = e.clientX;
      pointerY = e.clientY;
      // Parallax only — deliberately tiny. A hero that swings with the mouse
      // feels like a toy; this should feel like something suspended and heavy.
      targetTiltY = (e.clientX / window.innerWidth - 0.5) * 0.34;
      targetTiltX = (e.clientY / window.innerHeight - 0.5) * -0.2;
    };
    const onPointerLeave = () => {
      pointerX = -9999;
      pointerY = -9999;
      targetTiltX = 0;
      targetTiltY = 0;
    };

    if (finePointer) {
      window.addEventListener('pointermove', onPointerMove, { passive: true });
      document.addEventListener('pointerleave', onPointerLeave);
    }

    /**
     * How the graph is framed in each part of the page. These are blended
     * continuously rather than switched — see `sampleScroll` below.
     *
     * cx/cy are fractions of the viewport; spread is a fraction of its smaller
     * dimension. In the hero the copy owns the left, so the network sits to its
     * right; in the reading sections it centres and recedes behind the text.
     */
    const CAMERA: Record<Scene, { cx: number; cy: number; spread: number }> = {
      // Spread the drift evenly across every boundary. An earlier set moved the
      // camera 0.02 between the first two sections and 0.16 between the next
      // pair, so one transition did almost all the travelling — continuous in
      // the maths, but eight times faster there than anywhere else, which is
      // precisely what reads as the graph "re-centring". Even deltas mean the
      // framing drifts at one steady rate for the whole page.
      hero: { cx: 0.66, cy: 0.5, spread: 0.54 },
      // Work, Trace, Origin and Status all originally centred at cy: 0.5 —
      // which, seen against the actual rendered page, put the densest part
      // of the graph squarely on the row list, the waterfall rows, the
      // tech-stack list and the closing paragraph respectively. Each is now
      // biased toward whichever part of its own content can carry the
      // graph's weight — a short heading, a wide text column's far edge —
      // and pulled in enough to clear the reading-heavy part before it gets
      // there. Work's own cy: 0.5 dated from when the section was four large
      // image tiles rather than text rows; it gets the same treatment now
      // that the tiles are gone.
      //
      // Work's spread also isn't directly comparable to the other three: its
      // own layoutFor('work') pushes secondary nodes out to ~1.25/1.05 on the
      // normalised axes (deliberately, so the ten "featured" delivery-path
      // nodes read as a tight ring against a looser field) versus Trace's
      // ~0.85 max. The same spread number covers close to twice the screen
      // area here, so it's tuned down further to compensate, not matched to
      // Trace's raw value.
      work: { cx: 0.6, cy: 0.34, spread: 0.24 },
      trace: { cx: 0.58, cy: 0.32, spread: 0.42 },
      origin: { cx: 0.72, cy: 0.42, spread: 0.42 },
      status: { cx: 0.5, cy: 0.3, spread: 0.36 },
    };

    /**
     * On a phone the graph can't sit beside the text — there is no "beside."
     * Every section is one narrow reading column, so the only lever left is
     * where in that column the network sits, and how much of it there is.
     * Each row is a deliberate choice about that section's actual content
     * shape, not the desktop numbers scaled down:
     *  - hero: pushed low, under the headline and description, so the words
     *    a first-time visitor reads first sit in the clearest air on the page.
     *  - work / trace / origin / status: pulled small and high, clear of the
     *    row list, the waterfall, the stack list, and — most deliberately —
     *    the message and checklist that close the site, which should read
     *    first and calmest. Work used to get a pass here on the strength of
     *    its image tiles; now it's a text list like the rest, so it earns no
     *    more room than they do.
     */
    const CAMERA_MOBILE: Record<Scene, { cx: number; cy: number; spread: number }> = {
      hero: { cx: 0.58, cy: 0.72, spread: 0.3 },
      // Same layout-width correction as the desktop table — spread here is
      // tuned to Work's own wider-flung layout, not Trace's spread value.
      work: { cx: 0.5, cy: 0.22, spread: 0.15 },
      trace: { cx: 0.5, cy: 0.26, spread: 0.3 },
      // Origin's four paragraphs run back to back with no gap between them,
      // unlike Trace (a short description, then a gap, then the list) or
      // Status (a short subheading, then a real gap, then the checklist) —
      // there is no clean pocket of whitespace to dodge into here, so this
      // one leans harder on being small and quiet than on being well-placed.
      origin: { cx: 0.5, cy: 0.16, spread: 0.18 },
      status: { cx: 0.5, cy: 0.22, spread: 0.24 },
    };

    // Single source of truth for "which table is live right now" — read by
    // the initial camera values below and by every frame in step().
    const cameraFor = () => (isMobile ? CAMERA_MOBILE : CAMERA);
    const alphaFor = () => (isMobile ? SCENE_ALPHA_MOBILE : SCENE_ALPHA);

    const ORDER: Scene[] = ['hero', 'work', 'trace', 'origin', 'status'];

    // Layouts are pure and deterministic, so solve them once instead of
    // rebuilding Maps sixty times a second.
    const LAYOUTS: Record<Scene, Map<string, Vec3>> = {
      hero: layoutFor('hero'),
      work: layoutFor('work'),
      trace: layoutFor('trace'),
      origin: layoutFor('origin'),
      status: layoutFor('status'),
    };

    // Anchor each scene to the vertical centre of its section, measured from the
    // document. Re-measured whenever layout can change.
    let anchors: Array<{ scene: Scene; center: number }> = [];
    const measureAnchors = () => {
      anchors = ORDER.map((scene) => {
        const el = document.getElementById(scene);
        if (!el) return { scene, center: 0 };
        const r = el.getBoundingClientRect();
        return { scene, center: r.top + window.scrollY + r.height / 2 };
      }).filter((a) => a.center > 0);
    };
    measureAnchors();

    // Smoothstep: removes the linear-ramp feel at the ends of each blend, which
    // is what makes an interpolation read as "animated" rather than organic.
    const smooth = (x: number) => {
      const c = Math.max(0, Math.min(1, x));
      return c * c * (3 - 2 * c);
    };

    /**
     * Where the page currently sits, expressed as a blend between two scenes.
     *
     * This is the fix for the graph appearing to jump: previously the scene was
     * chosen by an IntersectionObserver and the camera read straight off it, so
     * framing snapped the instant a section took over while the nodes eased —
     * two different clocks, which the eye reads as a cut. Now the scroll position
     * itself is the clock. Nothing switches; everything is continuously between.
     */
    const sampleScroll = () => {
      const focal = window.scrollY + h / 2;
      if (anchors.length === 0) return { a: 'hero' as Scene, b: 'hero' as Scene, k: 0 };
      if (focal <= anchors[0].center) {
        return { a: anchors[0].scene, b: anchors[0].scene, k: 0 };
      }
      const last = anchors[anchors.length - 1];
      if (focal >= last.center) return { a: last.scene, b: last.scene, k: 0 };
      for (let i = 0; i < anchors.length - 1; i++) {
        const lo = anchors[i];
        const hi = anchors[i + 1];
        if (focal >= lo.center && focal <= hi.center) {
          const span = Math.max(1, hi.center - lo.center);
          return { a: lo.scene, b: hi.scene, k: smooth((focal - lo.center) / span) };
        }
      }
      return { a: last.scene, b: last.scene, k: 0 };
    };

    // Live camera values, blended every frame.
    let camCx = w * cameraFor().hero.cx;
    let camCy = h * cameraFor().hero.cy;
    let camSpread = Math.min(w, h) * cameraFor().hero.spread;

    const sceneCenter = () => ({ cx: camCx, cy: camCy });
    const spread = () => camSpread;

    let t = 0;
    let raf = 0;
    let running = false;
    let currentAlpha = alphaFor().hero;

    const project = (p: Vec3) => {
      const cy_ = Math.cos(yaw);
      const sy_ = Math.sin(yaw);
      const x1 = p.x * cy_ - p.z * sy_;
      const z1 = p.x * sy_ + p.z * cy_;
      const cx_ = Math.cos(tiltX);
      const sx_ = Math.sin(tiltX);
      const y2 = p.y * cx_ - z1 * sx_;
      const z2 = p.y * sx_ + z1 * cx_;
      const cz_ = Math.cos(tiltY);
      const sz_ = Math.sin(tiltY);
      const x3 = x1 * cz_ - z2 * sz_;
      const z3 = x1 * sz_ + z2 * cz_;
      const scale = FOCAL / (FOCAL + z3);
      const { cx, cy } = sceneCenter();
      const s = spread();
      return { sx: cx + x3 * s * scale, sy: cy + y2 * s * scale, depth: z3, scale };
    };

    /** True when a node is the hovered one, a neighbour of it, or page-highlighted. */
    const isLit = (i: number) => {
      if (highlightIds?.includes(NODES[i].id)) return true;
      if (hoveredIdx < 0) return false;
      if (i === hoveredIdx) return true;
      return neighboursOf(hoveredIdx).includes(i);
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const A = currentAlpha;

      // ---- Connections ----
      for (const [ia, ib] of edgePairs) {
        const a = live[ia];
        const b = live[ib];
        const mid = (a.scale + b.scale) / 2;
        // Breathing: a slow shimmer along each connection so the network feels
        // like it's carrying something even between packets.
        const breathe =
          reduceMotion ? 0 : (Math.sin(t * 0.8 + (ia + ib) * 0.7) + 1) * 0.5 * 0.05;
        const dim =
          a.state !== 'stable' || b.state !== 'stable' ? 0.35 : 1;

        // A connection is "live" when either end is what the reader is
        // currently interested in — whether that came from the cursor or from
        // hovering a word elsewhere on the page.
        const aLit = isLit(ia);
        const bLit = isLit(ib);
        const linked = aLit || bLit;
        const anyFocus = hoveredIdx >= 0 || highlightIds !== null;

        let alpha = (0.085 + (mid - 0.6) * 0.16 + breathe) * dim * A;
        if (anyFocus) alpha *= linked ? 3.4 : 0.32;

        ctx.strokeStyle = linked
          ? `rgba(${accent},${Math.min(0.75, alpha)})`
          : `rgba(${ink},${Math.max(0, alpha)})`;
        ctx.lineWidth = linked ? 1.15 : 1;

        // Each connection reaches out from its own start as the field wakes,
        // staggered so the network assembles in a wave rather than a flash.
        const stagger = ((ia * 7 + ib * 13) % 100) / 100;
        const grow = Math.max(0, Math.min(1, (intro - stagger * 0.55) / 0.45));
        if (grow <= 0) continue;

        ctx.beginPath();
        ctx.moveTo(a.sx, a.sy);
        ctx.lineTo(a.sx + (b.sx - a.sx) * grow, a.sy + (b.sy - a.sy) * grow);
        ctx.stroke();
      }

      // ---- Packets ----
      if (!reduceMotion) {
        for (const p of packets) {
          const a = live[p.from];
          const b = live[p.to];
          // Ease within the hop so packets accelerate away and settle in.
          const e = p.t < 0.5 ? 2 * p.t * p.t : 1 - 2 * (1 - p.t) ** 2;
          let x = a.sx + (b.sx - a.sx) * e;
          let y = a.sy + (b.sy - a.sy) * e;

          // A packet passing near the pointer leans toward it, then carries on.
          // Small enough to be deniable, consistent enough to be felt.
          if (finePointer && pointerX > -9000) {
            const dx = pointerX - x;
            const dy = pointerY - y;
            const d = Math.hypot(dx, dy);
            if (d < 170 && d > 1) {
              const lean = (1 - d / 170) ** 2 * 14;
              x += (dx / d) * lean;
              y += (dy / d) * lean;
            }
          }
          const near =
            hoveredIdx >= 0 && (p.from === hoveredIdx || p.to === hoveredIdx);
          const life = Math.sin(p.t * Math.PI);
          const s = (a.scale + b.scale) / 2;
          const alpha = (near ? 1 : 0.7) * life * A;

          const g = ctx.createRadialGradient(x, y, 0, x, y, 6 * s);
          g.addColorStop(0, `rgba(${accent},${0.7 * alpha})`);
          g.addColorStop(1, `rgba(${accent},0)`);
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(x, y, 6 * s, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = `rgba(255,255,255,${0.8 * alpha})`;
          ctx.beginPath();
          ctx.arc(x, y, 1.35 * s, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // ---- Nodes, far to near ----
      const order = live
        .map((_, i) => i)
        .sort((i, j) => live[j].depth - live[i].depth);

      const anyFocus = hoveredIdx >= 0 || highlightIds !== null;

      for (const i of order) {
        const l = live[i];
        const isHover = i === hoveredIdx;
        const lit = isLit(i);
        const known = discovered.has(l.node.id);
        const fade = Math.max(0.42, Math.min(1, l.scale - 0.3)) * A;
        const isSystem = l.node.kind === 'system' || l.node.kind === 'project';
        const r = (isSystem ? 3.6 : 2.3) * l.scale;

        const updated = l.version === VERSION_NEW;
        const tone = l.state === 'draining' || l.state === 'updating'
          ? accent
          : updated
            ? good
            : ink;

        if (l.heat > 0.01 || lit || isSystem) {
          const strength = Math.max(
            l.heat,
            isHover ? 1 : lit ? 0.6 : isSystem ? 0.3 : 0
          );
          const g = ctx.createRadialGradient(l.sx, l.sy, 0, l.sx, l.sy, r * 8);
          g.addColorStop(0, `rgba(${tone},${0.34 * strength * fade})`);
          g.addColorStop(1, `rgba(${tone},0)`);
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(l.sx, l.sy, r * 8, 0, Math.PI * 2);
          ctx.fill();
        }

        // A node mid-update wears a thin ring: visibly working, not broken.
        if (l.state === 'updating') {
          ctx.strokeStyle = `rgba(${accent},${0.7 * fade})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(l.sx, l.sy, r + 5 + Math.sin(t * 6) * 1.5, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Already-found nodes keep a little more presence than untouched ones:
        // a quiet record of where the reader has been.
        const seenLift = known ? 0.16 : 0;
        const dimmed = anyFocus && !lit ? 0.4 : 1;

        ctx.beginPath();
        ctx.arc(l.sx, l.sy, isHover ? r * 1.55 : lit ? r * 1.2 : r, 0, Math.PI * 2);
        ctx.fillStyle =
          l.state !== 'stable' || updated || lit
            ? `rgba(${tone},${Math.min(1, fade + 0.3)})`
            : `rgba(${ink},${(fade * 0.85 + seenLift) * dimmed})`;
        ctx.fill();

        // Names are revealed, never listed. The hovered node is named by the
        // DOM readout; everything it touches names itself here, which is the
        // moment the graph stops being decoration and becomes a system. Text
        // painted onto the canvas competes directly with real DOM text on a
        // narrow column, so labels stay a desktop-only reward for hovering.
        if (!isMobile && lit && !isHover && l.scale > 0.7) {
          discovered.add(l.node.id);
          ctx.font =
            '500 10px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
          ctx.textAlign = 'left';
          ctx.fillStyle = `rgba(${ink},${0.62 * fade})`;
          ctx.fillText(l.node.label, l.sx + r + 8, l.sy + 3.5);
        }
        if (isHover) discovered.add(l.node.id);

      }
    };

    const drawVisitor = () => {
      if (visitor.glow <= 0.01) return;
      const g = visitor.glow;
      const r = 3 + g * 2.5;

      const halo = ctx.createRadialGradient(
        visitor.x, visitor.y, 0, visitor.x, visitor.y, r * 9
      );
      halo.addColorStop(0, `rgba(${accent},${0.32 * g})`);
      halo.addColorStop(1, `rgba(${accent},0)`);
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(visitor.x, visitor.y, r * 9, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(visitor.x, visitor.y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${accent},${Math.min(1, 0.5 + g * 0.5)})`;
      ctx.fill();

      // Deliberately never labelled. Naming it turned a quiet acknowledgement
      // into a caption explaining itself — the visitor should sense they've
      // been noticed, not be told so.
    };

    const step = () => {
      t += 0.016;

      // Wake-in, once, on arrival.
      if (intro < 1) intro = Math.min(1, intro + 0.012);

      if (!reduceMotion) yaw += 0.0009;
      tiltX += (targetTiltX - tiltX) * 0.045;
      tiltY += (targetTiltY - tiltY) * 0.045;

      // ---- Continuous framing ----
      const { a, b, k } = sampleScroll();
      sceneRef.current = k < 0.5 ? a : b;

      const ca = cameraFor()[a];
      const cb = cameraFor()[b];
      const wantCx = w * (ca.cx + (cb.cx - ca.cx) * k);
      const wantCy = h * (ca.cy + (cb.cy - ca.cy) * k);
      const wantSpread =
        Math.min(w, h) * (ca.spread + (cb.spread - ca.spread) * k);

      // Still eased, but now easing toward an already-continuous target — so
      // there is no step for the easing to chase.
      camCx += (wantCx - camCx) * 0.08;
      camCy += (wantCy - camCy) * 0.08;
      camSpread += (wantSpread - camSpread) * 0.08;

      const alphaTable = alphaFor();
      const wantAlpha = alphaTable[a] + (alphaTable[b] - alphaTable[a]) * k;
      currentAlpha += (wantAlpha - currentAlpha) * 0.06;

      // ---- Continuous posing ----
      // A chosen project pulls the graph toward its own architecture. That pull
      // fades in and out rather than switching, so it layers over the scroll
      // blend instead of fighting it.
      const wantFocus = focusProject ? 1 : 0;
      focusMix += (wantFocus - focusMix) * 0.045;
      if (focusProject && focusProject !== focusCacheKey) {
        focusCacheKey = focusProject;
        focusCache = PROJECT_FOCUS[focusProject]
          ? focusLayout(PROJECT_FOCUS[focusProject])
          : null;
      }

      const la = LAYOUTS[a];
      const lb = LAYOUTS[b];
      for (const l of live) {
        const pa = la.get(l.node.id)!;
        const pb = lb.get(l.node.id)!;
        let tx = pa.x + (pb.x - pa.x) * k;
        let ty = pa.y + (pb.y - pa.y) * k;
        let tz = pa.z + (pb.z - pa.z) * k;

        if (focusCache && focusMix > 0.005) {
          const f = focusCache.get(l.node.id);
          if (f) {
            tx += (f.x - tx) * focusMix;
            ty += (f.y - ty) * focusMix;
            tz += (f.z - tz) * focusMix;
          }
        }

        l.target.x = tx;
        l.target.y = ty;
        l.target.z = tz;
      }

      let nearest = -1;
      let nearestDist = 26;

      for (let i = 0; i < live.length; i++) {
        const l = live[i];

        // Drift: suspended, never still, never busy.
        const drift = reduceMotion ? 0 : 1;
        const dx = Math.sin(t * 0.24 + l.px) * 0.035 * drift;
        const dy = Math.cos(t * 0.21 + l.py) * 0.035 * drift;
        const dz = Math.sin(t * 0.19 + l.pz) * 0.035 * drift;

        // Ease toward the scene target — this is the transition between scenes.
        l.pos.x += (l.target.x + dx - l.pos.x) * 0.045;
        l.pos.y += (l.target.y + dy - l.pos.y) * 0.045;
        l.pos.z += (l.target.z + dz - l.pos.z) * 0.045;

        const pr = project(l.pos);
        l.depth = pr.depth;
        l.scale = pr.scale;

        // Cursor influence: a gentle lean toward the pointer, spring-damped and
        // capped. Enough to feel responsive; far too small to feel like control.
        let fx = 0;
        let fy = 0;
        if (finePointer && pointerX > -9000 && !reduceMotion) {
          const ddx = pr.sx - pointerX;
          const ddy = pr.sy - pointerY;
          const d = Math.hypot(ddx, ddy);
          const R = 190;
          if (d < R && d > 0.001) {
            const pull = (1 - d / R) ** 2 * 9;
            fx = (-ddx / d) * pull;
            fy = (-ddy / d) * pull;
          }
          if (d < nearestDist) {
            nearestDist = d;
            nearest = i;
          }
        }
        l.vox = (l.vox + (fx - l.ox) * 0.06) * 0.86;
        l.voy = (l.voy + (fy - l.oy) * 0.06) * 0.86;
        l.ox += l.vox;
        l.oy += l.voy;

        l.sx = pr.sx + l.ox;
        l.sy = pr.sy + l.oy;

        if (l.heat > 0) l.heat *= 0.955;
      }

      // Direct cursor-proximity discovery — the tooltip readout, a node
      // lighting up because the pointer is simply near it — stays a hero-only
      // privilege. Work used to share it from back when hovering a tile and
      // hovering the graph were the same gesture; now the row list has its
      // own, calmer way to light the graph (network:highlight/:focus, fired
      // from WorkSection), so direct hover here would be a second, redundant
      // interaction that trace, origin and status never had either.
      hoveredIdx = sceneRef.current === 'hero' ? nearest : -1;

      /**
       * Publish hover state.
       *
       * Everything read from `live` is resolved HERE, synchronously, and only
       * plain values are handed to React. An earlier version indexed
       * `live[hoveredIdx]` inside a setState updater — but React runs updaters
       * later, by which point `hoveredIdx` (reassigned every frame) could be -1,
       * so it dereferenced `undefined` and crashed the page. Never read a value
       * that mutates per frame from inside a deferred callback.
       */
      const hoveredNode = hoveredIdx >= 0 ? live[hoveredIdx] : undefined;

      if (hoveredIdx !== publishedHover) {
        publishedHover = hoveredIdx;
        if (hoveredNode) {
          hoverX = hoveredNode.sx;
          hoverY = hoveredNode.sy;
          setHover({ node: hoveredNode.node, x: hoverX, y: hoverY });
        } else {
          setHover(null);
        }
      } else if (hoveredNode) {
        // Keep the readout pinned to a drifting node, but only re-render once it
        // has actually moved a perceptible amount.
        if (
          Math.abs(hoveredNode.sx - hoverX) >= 2 ||
          Math.abs(hoveredNode.sy - hoverY) >= 2
        ) {
          hoverX = hoveredNode.sx;
          hoverY = hoveredNode.sy;
          setHover({ node: hoveredNode.node, x: hoverX, y: hoverY });
        }
      }

      // ---- Rollout progression ----
      if (!reduceMotion) {
        phaseClock += 1;
        const updatedCount = live.filter(
          (l) => l.version === VERSION_NEW
        ).length;

        if (phase === 'idle') {
          armedAt += 1;
          // A beat after arrival, so the first thing you see is the network
          // itself rather than an event.
          if (armedAt > 150) beginRollout();
        } else if (phase === 'canary') {
          if (updatedCount >= 1 && phaseClock > 110) {
            phase = 'verify';
            phaseClock = 0;
          }
        } else if (phase === 'verify') {
          if (phaseClock > 70) {
            phase = 'wave';
            phaseClock = 0;
            const next = waveQueue.shift();
            if (next) startWave(next);
          }
        } else if (phase === 'wave') {
          if (phaseClock > 95) {
            phaseClock = 0;
            const next = waveQueue.shift();
            if (next) startWave(next);
            else phase = 'settled';
          }
        } else if (phase === 'settled') {
          if (phaseClock > 900) {
            // Re-arm quietly so a long visit sees it again without nagging.
            phase = 'idle';
            armedAt = 0;
          }
        }

        // Packets
        for (const p of packets) {
          p.t += p.speed;
          if (p.t >= 1) {
            p.t = 0;
            // Capture where it came FROM before reassigning, so `avoid` is the
            // previous hop. Reading p.from after the assignment made a packet
            // avoid the node it was standing on — which is never its own
            // neighbour — so they ping-ponged between two nodes instead of
            // routing onward through the graph.
            const cameFrom = p.from;
            p.from = p.to;
            p.to = pickNext(p.from, cameFrom);
          }
        }
      }

      /**
       * Visitor node. It shadows the cursor at a distance for most of the page,
       * then at the close it stops following and settles into the gathered
       * network — the visitor joining the thing they've been reading about.
       */
      const atClose = sceneRef.current === 'status';
      if (atClose) {
        const { cx, cy } = sceneCenter();
        visitor.tx = cx;
        visitor.ty = cy + spread() * 0.62;
        // A companion arriving, not a headline: on a phone this moment shares
        // the screen with the message it should be quiet next to.
        visitor.glow = Math.min(isMobile ? 0.68 : 1, visitor.glow + 0.012);
      } else if (finePointer && pointerX > -9000) {
        // Trails well behind the pointer so it reads as its own thing rather
        // than a cursor decoration.
        visitor.tx = pointerX;
        visitor.ty = pointerY + 58;
        visitor.glow = Math.min(0.42, visitor.glow + 0.01);
      } else {
        visitor.glow = Math.max(0, visitor.glow - 0.01);
      }
      if (!visitor.seen) {
        visitor.x = visitor.tx;
        visitor.y = visitor.ty;
        visitor.seen = true;
      }
      const ease = atClose ? 0.035 : 0.055;
      visitor.x += (visitor.tx - visitor.x) * ease;
      visitor.y += (visitor.ty - visitor.y) * ease;

      draw();
      drawVisitor();
      raf = requestAnimationFrame(step);
    };

    const start = () => {
      if (running) return;
      running = true;
      step();
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('resize', resize);
    // Section offsets move as images load and fonts settle.
    window.addEventListener('load', measureAnchors);
    const anchorTimer = window.setInterval(measureAnchors, 2000);

    if (reduceMotion) {
      // Settle immediately into the composed layout and hold it. No drift, no
      // packets, no rollout — but the graph is still there, and still legible.
      for (let k = 0; k < 200; k++) {
        for (const l of live) {
          l.pos.x += (l.target.x - l.pos.x) * 0.2;
          l.pos.y += (l.target.y - l.pos.y) * 0.2;
          l.pos.z += (l.target.z - l.pos.z) * 0.2;
          const pr = project(l.pos);
          l.sx = pr.sx;
          l.sy = pr.sy;
          l.depth = pr.depth;
          l.scale = pr.scale;
        }
      }
      currentAlpha = alphaFor().hero;
      draw();
      drawVisitor();
    } else {
      start();
    }

    return () => {
      stop();
      themeObserver.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('resize', resize);
      window.removeEventListener('load', measureAnchors);
      window.clearInterval(anchorTimer);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('network:focus', onFocusProject as EventListener);
      window.removeEventListener('network:highlight', onHighlight as EventListener);
      document.removeEventListener('pointerleave', onPointerLeave);
    };
  }, []);

  return (
    <>
      {/*
        Fixed and behind everything. Presentational: every claim it makes is also
        written in the copy, so nothing is only available to people who can see
        and hover it.
      */}
      <div
        className='pointer-events-none fixed inset-0 z-0'
        aria-hidden='true'
        role='presentation'
      >
        <canvas ref={canvasRef} className='block h-full w-full' />
      </div>

      {/* Node readout. DOM rather than canvas text so it stays crisp. */}
      {hover && (
        <div
          className='pointer-events-none fixed z-[5] max-w-[14rem] -translate-y-1/2 rounded-lg border border-border bg-background/90 px-3.5 py-2.5 backdrop-blur'
          style={{
            left: Math.min(hover.x + 20, window.innerWidth - 260),
            top: hover.y,
          }}
          aria-hidden='true'
        >
          <p className='font-mono text-xs text-foreground'>{hover.node.label}</p>
          <p className='mt-1 font-mono text-[10px] leading-snug text-foreground-muted'>
            {hover.node.role}
          </p>
        </div>
      )}

    </>
  );
}

