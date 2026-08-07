/**
 * The network that runs behind the entire site.
 *
 * Nodes are deliberately NOT limited to physical regions: edge POPs sit
 * alongside systems, technologies and shipped projects, because the honest shape
 * of this engineer's work is a dependency graph, not a map. Nothing here
 * pretends to be geography — POPs use airport-style codes because that's how
 * infrastructure actually names them, which reads as "the internet" rather than
 * "the Earth".
 */

export type NodeKind = 'edge' | 'system' | 'tech' | 'project';

export type NetNode = {
  id: string;
  label: string;
  kind: NodeKind;
  /** Which stack layer this belongs to — drives the clustered layout. */
  group: 'Edge' | 'Platform' | 'Data' | 'Observability' | 'Surface';
  /**
   * One plain line, shown on hover. Deliberately no latency/cache/throughput
   * figures: they were invented, they required knowing what a cache hit ratio
   * is to mean anything, and a readout of numbers is the opposite of the feeling
   * this is meant to create. A name and a human sentence is the whole idea.
   */
  role: string;
};

export type NetEdge = [string, string];

export const NODES: NetNode[] = [
  // ---- Edge POPs ----
  { id: 'iad', label: 'iad', kind: 'edge', group: 'Edge', role: 'An edge, close to whoever is asking' },
  { id: 'sfo', label: 'sfo', kind: 'edge', group: 'Edge', role: 'An edge, close to whoever is asking' },
  { id: 'fra', label: 'fra', kind: 'edge', group: 'Edge', role: 'An edge, close to whoever is asking' },
  { id: 'cdg', label: 'cdg', kind: 'edge', group: 'Edge', role: 'An edge, close to whoever is asking' },
  { id: 'bom', label: 'bom', kind: 'edge', group: 'Edge', role: 'An edge, close to whoever is asking' },
  { id: 'sin', label: 'sin', kind: 'edge', group: 'Edge', role: 'An edge, close to whoever is asking' },
  { id: 'nrt', label: 'nrt', kind: 'edge', group: 'Edge', role: 'An edge, close to whoever is asking' },
  { id: 'syd', label: 'syd', kind: 'edge', group: 'Edge', role: 'An edge, close to whoever is asking' },

  // ---- Systems he builds ----
  { id: 'launch', label: 'Launch', kind: 'system', group: 'Platform', role: 'The hosting platform I build' },
  { id: 'priming', label: 'Cache Priming', kind: 'system', group: 'Platform', role: 'Warms content up before anyone asks for it' },
  { id: 'pipeline', label: 'Build Pipeline', kind: 'system', group: 'Platform', role: 'Ships new versions without anyone noticing' },
  { id: 'k8s', label: 'Kubernetes', kind: 'system', group: 'Platform', role: 'Keeps the fleet running' },
  { id: 'cdn', label: 'Multi-CDN', kind: 'system', group: 'Edge', role: 'Chooses the fastest way to reach you' },
  { id: 'origin', label: 'Origin', kind: 'system', group: 'Data', role: 'Where everything is kept' },

  // ---- Technologies ----
  { id: 'cloudflare', label: 'Cloudflare', kind: 'tech', group: 'Edge', role: 'One of the roads in' },
  { id: 'fastly', label: 'Fastly', kind: 'tech', group: 'Edge', role: 'One of the roads in' },
  { id: 'nginx', label: 'Nginx', kind: 'tech', group: 'Edge', role: 'The doorway' },
  { id: 'redis', label: 'Redis', kind: 'tech', group: 'Data', role: 'Remembers, so nothing is fetched twice' },
  { id: 'golang', label: 'Go', kind: 'tech', group: 'Platform', role: 'What most of it is written in' },
  { id: 'otel', label: 'OpenTelemetry', kind: 'system', group: 'Observability', role: 'How we see what is happening' },
  { id: 'elastic', label: 'Elasticsearch', kind: 'tech', group: 'Observability', role: 'Where the story of every request is kept' },
  { id: 'nextjs', label: 'Next.js', kind: 'tech', group: 'Surface', role: 'What the sites are built with' },

  // ---- Things he shipped ----
  { id: 'foliobulls', label: 'FolioBulls', kind: 'project', group: 'Surface', role: 'A site I designed and shipped' },
  { id: 'guengg', label: 'Global Unique', kind: 'project', group: 'Surface', role: 'A site I designed and shipped' },
  { id: 'portfolio', label: 'This site', kind: 'project', group: 'Surface', role: 'This one' },
];

/**
 * Edges encode real relationships, which is what makes the graph worth looking
 * at closely: requests flow origin → platform → CDN → POPs → surfaces, and the
 * observability plane taps the platform rather than sitting on the request path.
 */
export const EDGES: NetEdge[] = [
  ['origin', 'launch'],
  ['origin', 'redis'],
  ['redis', 'priming'],
  ['priming', 'cdn'],
  ['launch', 'priming'],
  ['launch', 'pipeline'],
  ['launch', 'k8s'],
  ['launch', 'golang'],
  ['launch', 'cdn'],
  ['pipeline', 'cdn'],
  ['cdn', 'cloudflare'],
  ['cdn', 'fastly'],
  ['cdn', 'nginx'],
  ['cloudflare', 'iad'],
  ['cloudflare', 'fra'],
  ['cloudflare', 'sin'],
  ['fastly', 'sfo'],
  ['fastly', 'cdg'],
  ['fastly', 'nrt'],
  ['nginx', 'bom'],
  ['nginx', 'syd'],
  ['iad', 'sfo'],
  ['fra', 'cdg'],
  ['sin', 'nrt'],
  ['bom', 'sin'],
  ['syd', 'nrt'],
  ['iad', 'fra'],
  ['otel', 'launch'],
  ['otel', 'cdn'],
  ['otel', 'elastic'],
  ['otel', 'k8s'],
  ['nextjs', 'foliobulls'],
  ['nextjs', 'guengg'],
  ['nextjs', 'portfolio'],
  ['iad', 'portfolio'],
  ['bom', 'foliobulls'],
  ['fra', 'guengg'],
];

/** Adjacency, built once. */
export function buildAdjacency(): Map<string, string[]> {
  const adj = new Map<string, string[]>();
  for (const n of NODES) adj.set(n.id, []);
  for (const [a, b] of EDGES) {
    adj.get(a)?.push(b);
    adj.get(b)?.push(a);
  }
  return adj;
}

export type Vec3 = { x: number; y: number; z: number };

/**
 * Scenes.
 *
 * The whole point of the architecture: one persistent graph, several truthful
 * arrangements of it. Scrolling doesn't swap visuals, it re-poses the same
 * object — so the constellation in the hero is literally the same set of nodes
 * that later forms the trace waterfall and then clusters by stack layer.
 */
export type Scene = 'hero' | 'work' | 'trace' | 'origin' | 'status';

/**
 * The stack behind each shipped thing.
 *
 * Scrolling through the work re-poses the network around whichever project is in
 * front of you, so the world visibly changes per project instead of four cards
 * sharing one backdrop. These are the real dependencies — the graph is telling
 * the truth about what built and serves each site.
 */
export const PROJECT_FOCUS: Record<string, string[]> = {
  FolioBulls: ['foliobulls', 'nextjs', 'cdn', 'cloudflare', 'bom', 'iad'],
  'Global Unique Engineering': ['guengg', 'nextjs', 'launch', 'cdn', 'fra', 'cdg'],
  // A purely client-side utility: it touches the surface layer and nothing else.
  'QR Code Generator': ['nextjs'],
  'This portfolio': ['portfolio', 'nextjs', 'cdn', 'iad', 'priming'],
};

/**
 * Which parts of the system each role actually touched. Hovering a span in the
 * history lights them up, so the career and the architecture explain each other
 * without a sentence being written about either.
 */
export const SPAN_FOCUS: Record<string, string[]> = {
  'software-engineer-II': ['launch', 'priming', 'otel', 'elastic', 'cdn'],
  'software-engineer-I': ['launch', 'k8s', 'pipeline', 'golang'],
  'senior-software-engineer': ['nextjs'],
  'software-engineer': ['nextjs'],
  'fellowship-engineer': ['nextjs'],
};

/** Focus ring layout: the named nodes come forward, everything else recedes. */
export function focusLayout(ids: string[]): Map<string, Vec3> {
  const map = new Map<string, Vec3>();
  const ring = Math.max(1, ids.length);
  NODES.forEach((n) => {
    const idx = ids.indexOf(n.id);
    if (idx >= 0) {
      const a = (idx / ring) * Math.PI * 2 - Math.PI / 2;
      map.set(n.id, {
        x: Math.cos(a) * 0.42,
        y: Math.sin(a) * 0.4,
        z: 0.5,
      });
    } else {
      // Still present, pushed back — the rest of the system carries on behind.
      const base = GRAPH_LAYOUT.get(n.id)!;
      map.set(n.id, { x: base.x * 1.5, y: base.y * 1.35, z: base.z - 1.1 });
    }
  });
  return map;
}

/** Evenly distributed directions on a sphere — no clumping, no visible grid. */
function fibonacciSphere(count: number): Vec3[] {
  const out: Vec3[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / Math.max(1, count - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    out.push({ x: Math.cos(theta) * r, y, z: Math.sin(theta) * r });
  }
  return out;
}

/**
 * A deterministic force-directed layout, solved once at module load.
 *
 * This is what separates a dependency graph from a scatter of dots with lines
 * through it: connected nodes attract, everything repels, and the structure that
 * emerges is the real shape of the system — edge POPs gather around the CDN they
 * hang off, the observability plane forms its own lobe, the surfaces cluster
 * together. An arbitrary sphere placement produces long crossing edges and reads
 * as a tangle no matter how well it's drawn.
 *
 * Seeded and iterated a fixed number of times, so the result is identical on
 * every load and the composition can be art-directed rather than gambled on.
 */
function solveGraphLayout(): Map<string, Vec3> {
  const idx = new Map<string, number>();
  NODES.forEach((n, i) => idx.set(n.id, i));

  const start = fibonacciSphere(NODES.length);
  const pos = start.map((d) => ({ x: d.x, y: d.y * 0.85, z: d.z }));

  const links = EDGES.map(([a, b]) => [idx.get(a)!, idx.get(b)!] as const);

  const ITER = 260;
  for (let step = 0; step < ITER; step++) {
    // Cooling schedule: big rearrangements first, fine settling later.
    const cool = 1 - step / ITER;

    // Repulsion — every pair pushes apart, keeping the graph open and readable.
    for (let i = 0; i < pos.length; i++) {
      for (let j = i + 1; j < pos.length; j++) {
        const dx = pos[i].x - pos[j].x;
        const dy = pos[i].y - pos[j].y;
        const dz = pos[i].z - pos[j].z;
        const d2 = dx * dx + dy * dy + dz * dz + 0.02;
        const f = (0.055 * cool) / d2;
        const d = Math.sqrt(d2);
        pos[i].x += (dx / d) * f;
        pos[i].y += (dy / d) * f;
        pos[i].z += (dz / d) * f;
        pos[j].x -= (dx / d) * f;
        pos[j].y -= (dy / d) * f;
        pos[j].z -= (dz / d) * f;
      }
    }

    // Attraction along real edges — related things end up near each other.
    for (const [a, b] of links) {
      const dx = pos[b].x - pos[a].x;
      const dy = pos[b].y - pos[a].y;
      const dz = pos[b].z - pos[a].z;
      const d = Math.sqrt(dx * dx + dy * dy + dz * dz) + 1e-6;
      const f = (d - 0.5) * 0.035 * cool;
      pos[a].x += (dx / d) * f;
      pos[a].y += (dy / d) * f;
      pos[a].z += (dz / d) * f;
      pos[b].x -= (dx / d) * f;
      pos[b].y -= (dy / d) * f;
      pos[b].z -= (dz / d) * f;
    }

    // Weak pull to origin so the graph can't drift apart indefinitely.
    for (const p of pos) {
      p.x *= 0.995;
      p.y *= 0.995;
      p.z *= 0.995;
    }
  }

  // Normalise into the renderer's -1..1 space, flattened slightly on Y so it
  // sits as a wide constellation rather than a ball.
  let max = 0;
  for (const p of pos) {
    max = Math.max(max, Math.hypot(p.x, p.y, p.z));
  }
  const k = max > 0 ? 1 / max : 1;

  const out = new Map<string, Vec3>();
  NODES.forEach((n, i) => {
    out.set(n.id, {
      x: pos[i].x * k,
      y: pos[i].y * k * 0.78,
      z: pos[i].z * k,
    });
  });
  return out;
}

const GRAPH_LAYOUT = solveGraphLayout();

const GROUP_ORDER: NetNode['group'][] = [
  'Edge',
  'Platform',
  'Data',
  'Observability',
  'Surface',
];

/**
 * Target position for a node in a given scene, in normalised space
 * (-1..1 on each axis). The renderer interpolates toward these.
 */
export function layoutFor(scene: Scene): Map<string, Vec3> {
  const map = new Map<string, Vec3>();

  if (scene === 'hero') {
    // The solved dependency graph, suspended in space.
    NODES.forEach((n) => map.set(n.id, { ...GRAPH_LAYOUT.get(n.id)! }));
    return map;
  }

  if (scene === 'work') {
    // Surfaces and the delivery path that serves them come forward; the deep
    // platform internals recede. The graph answers "what actually ships a site".
    const featured = [
      'portfolio',
      'foliobulls',
      'guengg',
      'nextjs',
      'cdn',
      'cloudflare',
      'fastly',
      'iad',
      'bom',
      'fra',
    ];
    const ring = featured.length;
    NODES.forEach((n, i) => {
      const idx = featured.indexOf(n.id);
      if (idx >= 0) {
        const a = (idx / ring) * Math.PI * 2;
        map.set(n.id, {
          x: Math.cos(a) * 0.55,
          y: Math.sin(a) * 0.5,
          z: 0.35,
        });
      } else {
        // Pushed back and outward: still present, clearly secondary.
        const a = (i / NODES.length) * Math.PI * 2;
        map.set(n.id, {
          x: Math.cos(a) * 1.25,
          y: Math.sin(a) * 1.05,
          z: -0.85,
        });
      }
    });
    return map;
  }

  if (scene === 'trace') {
    // The constellation flattens into stacked rows — the skeleton of a span
    // waterfall, echoing the section it sits behind.
    const rows = 7;
    NODES.forEach((n, i) => {
      const row = i % rows;
      const col = Math.floor(i / rows);
      const perRow = Math.ceil(NODES.length / rows);
      map.set(n.id, {
        x: -0.85 + (col / Math.max(1, perRow - 1)) * 1.6,
        y: 0.72 - (row / (rows - 1)) * 1.44,
        z: 0,
      });
    });
    return map;
  }

  if (scene === 'origin') {
    // Clustered by stack layer: the same grouping the copy uses, made spatial.
    const counts = new Map<string, number>();
    NODES.forEach((n) => {
      const gi = GROUP_ORDER.indexOf(n.group);
      const seen = counts.get(n.group) ?? 0;
      counts.set(n.group, seen + 1);
      const cx = -0.8 + (gi / (GROUP_ORDER.length - 1)) * 1.6;
      // Small deterministic spiral inside each cluster.
      const a = seen * 2.399;
      const r = 0.08 + seen * 0.045;
      map.set(n.id, {
        x: cx + Math.cos(a) * r,
        y: Math.sin(a) * r * 1.5,
        z: Math.cos(a * 1.7) * 0.3,
      });
    });
    return map;
  }

  // status: everything draws together into one calm, breathing cluster.
  const dirs = fibonacciSphere(NODES.length);
  NODES.forEach((n, i) => {
    const d = dirs[i];
    map.set(n.id, { x: d.x * 0.3, y: d.y * 0.26, z: d.z * 0.3 });
  });
  return map;
}
