/* Body scenes for the IL / CNT page, drawn by the shared Viz renderer (assets/viz.js) from window.MD (assets/data.js):
   1. rdf: ion number density against distance from the tube axis in the minimised structure, as two ribbons with the wall marked;
   2. wall: the nanotube with a cation lying parallel to the wall and one standing perpendicular, assembled from the real
      coordinates (CNT.pdb ring, [OMIM] and [EMIM] pair files), the mechanism drawing of the article's orientation figure;
   3. chain: the published interaction energies and hydrogen-bond counts against chain length as a bar field;
   4. mobility: the published cation diffusion coefficients, bulk and confined, on a log axis as a bar field;
   5. minimisation: total, electrostatic and van der Waals energy against conjugate-gradient step as ribbons on a log axis. */
import { Viz } from './viz.js';
import { THREE } from './three-kit.js';
const D = window.MD; const f = (v, d = 0) => (+v).toLocaleString('en-US', { maximumFractionDigits: d, minimumFractionDigits: d });
const ILS = ['EMIM', 'BMIM', 'HMIM', 'OMIM'], ILCOL = ['cyan', 'green', 'warm', 'rose'];
const ELCOL = { C: 'violet', N: 'blue', H: 'white', B: 'green', F: 'cyan' }, ELRAD = { C: .5, N: .52, H: .28, B: .55, F: .45 };

/* ---------- 1. ion density against distance from the axis ---------- */
Viz.view('[data-viz="rdf"]', v => {
  const R = D.rdf; const ymax = Math.max(...R.N_per_A3, ...R.B_per_A3) * 1.15;
  const A = Viz.axes(v, { size: [4.4, 2.0, 1.4], x: { lo: 0, hi: 30, ticks: [0, 10, 20, 30], label: 'distance from the tube axis, Å' }, y: { lo: 0, hi: ymax, ticks: [], label: 'number density' }, z: { lo: -.5, hi: 1.5, ticks: [] } });
  const rN = Viz.ribbon(v, A, R.r, R.N_per_A3, { color: 'blue', width: .3, z: 0, name: 'cation ring N', unit: 'per Å³' });
  const rB = Viz.ribbon(v, A, R.r, R.B_per_A3, { color: 'green', width: .3, z: 1, name: 'anion B', unit: 'per Å³' });
  const wx = A.map(D.stats.cnt_radius_A, 0, 0).x; const wall = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 1.4), Viz.mat('steel', { opacity: .22, side: THREE.DoubleSide, depthWrite: false })); wall.rotation.y = Math.PI / 2; wall.position.set(wx, A.map(0, ymax / 2).y, 0); v.rig.add(wall);
  Viz.label(v, `tube wall, r = ${D.stats.cnt_radius_A} Å`, [wx, A.map(0, ymax).y + .25, 0], { px: 20, scale: .09, color: 'ink', weight: 700 });
  Viz.label(v, 'cation ring N', [A.map(31, 0, 0).x + .4, A.map(0, 0).y + .3, A.map(0, 0, 0).z], { px: 20, scale: .09, color: 'blue', weight: 700 }); Viz.label(v, 'anion B', [A.map(31, 0, 1).x + .4, A.map(0, 0).y + .3, A.map(0, 0, 1).z], { px: 20, scale: .09, color: 'green', weight: 700 });
  v.update = vv => { rN.draw(vv.p); rB.draw(Math.max(0, vv.p * 1.15 - .15)); return false; };
  v.hover = hit => { const u = hit.object.userData; if (!u.xs) return null; const i = Viz.ribbonIndex(hit, A); return `<b>${u.series} at ${u.xs[i]} Å</b>${u.ys[i].toExponential(2)} atoms per Å³ in the minimised structure`; };
  v.rot = -.3; v.tilt = .12;
}, { camera: [0, 1.8, 6.8], target: [0, -.1, 0], fov: 32 });

/* ---------- 2. the wall: tube ring with a parallel and a perpendicular cation ---------- */
Viz.view('[data-viz="wall"]', v => {
  const SC = .13; const A = D.atoms; const ring = []; for (let i = 0; i < A.t.length; i++) if (A.t[i] === 0 && Math.abs(A.z[i]) < 12) ring.push(i);
  const sph = new THREE.SphereGeometry(1, 10, 8); const cnt = new THREE.InstancedMesh(sph, Viz.mat('steel', { metalness: .4, roughness: .45 }), ring.length); const m4 = new THREE.Matrix4();
  ring.forEach((i, k) => { m4.makeScale(.4 * SC * 1.6, .4 * SC * 1.6, .4 * SC * 1.6).setPosition(A.x[i] * SC, A.y[i] * SC, A.z[i] * SC); cnt.setMatrixAt(k, m4); }); const tube = new THREE.Group(); tube.add(cnt); tube.rotation.y = Math.PI / 2;
  const pair = (k, pos, rotX, rotY) => { const P = D.pairs[k]; const g = new THREE.Group(); const c = P.xyz.reduce((a, p) => [a[0] + p[0], a[1] + p[1], a[2] + p[2]], [0, 0, 0]).map(x => x / P.xyz.length); const byEl = {}; P.el.forEach((e, i) => { if (i >= P.n_cation) return; (byEl[e] = byEl[e] || []).push(i); }); for (const e in byEl) { const im = new THREE.InstancedMesh(sph, Viz.mat(ELCOL[e] || 'violet', { roughness: .4, opacity: e === 'H' ? .5 : 1 }), byEl[e].length); byEl[e].forEach((i, n) => { const r = ELRAD[e] * SC * 1.5; m4.makeScale(r, r, r).setPosition((P.xyz[i][0] - c[0]) * SC * 1.5, (P.xyz[i][1] - c[1]) * SC * 1.5, (P.xyz[i][2] - c[2]) * SC * 1.5); im.setMatrixAt(n, m4); }); g.add(im); } g.position.set(...pos); g.rotation.set(rotX, rotY, 0); return g; };
  const par = pair('OMIM', [1.1, -1.08, 0], 0, 0), per = pair('EMIM', [-1.1, 1.02, .3], Math.PI / 2, .4);
  const ex = Viz.exploded(v, [{ mesh: tube, from: [0, -2.4, 0], delay: 0, span: .35, fade: false }, { mesh: par, from: [2.6, 0, 0], delay: .3, span: .3, fade: false }, { mesh: per, from: [-2.6, 0, 0], delay: .45, span: .3, fade: false }]);
  const l1 = Viz.label(v, '[OMIM]⁺: tail lies along the wall,\nring pushed toward the axis', [1.2, -1.75, 1.0], { px: 20, scale: .085 }); const l2 = Viz.label(v, '[EMIM]⁺: ring parks flat\nagainst the sidewall', [-1.2, 1.75, 1.0], { px: 20, scale: .085 }); const l3 = Viz.label(v, '(15,15) tube wall, 20 Å across', [0, -.1, 1.85], { px: 20, scale: .085, bg: false });
  v.update = (vv, t) => { ex.draw(vv.p); [l1, l2, l3].forEach((l, i) => l.material.opacity = Math.max(0, (vv.p - .55 - i * .1) * 4)); return false; };
  v.spin = .12; v.tilt = .2;
}, { camera: [0, 1.6, 7.0], target: [0, 0, 0], fov: 34 });

/* ---------- 3. interaction energy and hydrogen bonds against chain length ---------- */
Viz.view('[data-viz="chain"]', v => {
  const rows = D.paper.rows; const A = Viz.axes(v, { size: [3.8, 2.2, 2.2], x: { lo: -.5, hi: 3.5, ticks: [] }, y: { lo: 0, hi: 1, ticks: [], label: '' }, z: { lo: -.5, hi: 1.5, ticks: [] } });
  const items = []; rows.forEach((r, i) => { items.push({ x: i, z: 0, y: Math.abs(r.E) / 10, color: ILCOL[i], text: `${r.E_approx ? '≈ ' : ''}${r.E.toFixed(2)}`, name: `${r.il}: interaction energy with the CNT`, raw: `${r.E_approx ? 'about ' : ''}${r.E} kcal/mol per ion` }); items.push({ x: i, z: 1, y: r.hb / 1.2, color: ILCOL[i], text: r.hb.toFixed(2), name: `${r.il}: hydrogen bonds per cation in the tube`, raw: `${r.hb} per cation` }); });
  const B = Viz.bars(v, A, items, { width: .5, depth: .5 });
  items.forEach(it => { const p = A.map(it.x, it.y, it.z); it.lab = Viz.label(v, it.text, [p.x, p.y + .18, p.z], { px: 19, scale: .085 }); });
  rows.forEach((r, i) => Viz.label(v, `${r.il}\n${r.chain}`, [A.map(i, 0, 0).x, A.map(0, 0).y - .3, A.map(0, 0, -.6).z], { px: 19, scale: .085, bg: false, color: ILCOL[i], weight: 700 }));
  Viz.label(v, '−E_int with the CNT, kcal/mol per ion', [A.map(3.6, 0, 0).x + .3, A.map(0, 0).y + .05, A.map(0, 0, 0).z], { px: 19, scale: .085, bg: false }); Viz.label(v, 'H-bonds per cation in the tube', [A.map(3.6, 0, 1).x + .3, A.map(0, 0).y + .05, A.map(0, 0, 1).z], { px: 19, scale: .085, bg: false });
  v.update = vv => { B.draw(vv.p); items.forEach(it => it.lab.material.opacity = Math.max(0, vv.p * 2 - 1)); return false; };
  v.hover = hit => { const it = items[hit.instanceId]; return it ? `<b>${it.name}</b>${it.raw} (reported in the article)` : null; };
  v.rot = -.45; v.tilt = .12;
}, { camera: [0, 2.4, 7.2], target: [0, -.2, 0], fov: 32 });

/* ---------- 4. diffusion, bulk and confined ---------- */
Viz.view('[data-viz="mobility"]', v => {
  const rows = D.paper.rows; const lg = s => Math.log10(parseFloat(s)); const lo = -13, hi = -9;
  const A = Viz.axes(v, { size: [3.8, 2.2, 2.2], x: { lo: -.5, hi: 3.5, ticks: [] }, y: { lo, hi, ticks: [-12, -11, -10], fmt: t => `10${String(t).replace(/-?\d/g, c => '⁰¹²³⁴⁵⁶⁷⁸⁹'[c] || '⁻')}`, label: 'D, m²/s' }, z: { lo: -.5, hi: 1.5, ticks: [] } });
  const items = []; rows.forEach((r, i) => { items.push({ x: i, z: 0, y: lg(r.D_bulk), color: ILCOL[i], name: `${r.il}, bulk`, raw: r.D_bulk }); items.push({ x: i, z: 1, y: lg(r.D_cnt), color: ILCOL[i], name: `${r.il}, inside the CNT`, raw: r.D_cnt }); });
  const B = Viz.bars(v, A, items, { width: .5, depth: .5 });
  items.forEach(it => { const p = A.map(it.x, it.y, it.z); it.lab = Viz.label(v, it.raw.replace('e-', '×10⁻').replace(/⁻(\d+)/, (m, d) => '⁻' + d.replace(/\d/g, c => '⁰¹²³⁴⁵⁶⁷⁸⁹'[c])), [p.x, p.y + .18, p.z], { px: 18, scale: .08 }); });
  rows.forEach((r, i) => Viz.label(v, `${r.il}`, [A.map(i, lo, 0).x, A.map(0, lo).y - .3, A.map(0, 0, -.6).z], { px: 19, scale: .085, bg: false, color: ILCOL[i], weight: 700 }));
  Viz.label(v, 'bulk', [A.map(3.6, lo, 0).x + .3, A.map(0, lo).y + .05, A.map(0, 0, 0).z], { px: 19, scale: .085, bg: false }); Viz.label(v, 'inside the tube', [A.map(3.6, lo, 1).x + .3, A.map(0, lo).y + .05, A.map(0, 0, 1).z], { px: 19, scale: .085, bg: false });
  v.update = vv => { B.draw(vv.p); items.forEach(it => it.lab.material.opacity = Math.max(0, vv.p * 2 - 1)); return false; };
  v.hover = hit => { const it = items[hit.instanceId]; return it ? `<b>${it.name}</b>D = ${it.raw} m²/s (reported in the article)` : null; };
  v.rot = -.45; v.tilt = .12;
}, { camera: [0, 2.4, 7.2], target: [0, -.2, 0], fov: 32 });

/* ---------- 5. minimisation energies ---------- */
Viz.view('[data-viz="minimisation"]', v => {
  const E = D.energy; const xs = E.step.map(s => Math.log10(1 + s)); const sgn = a => a.map(x => Math.sign(x) * Math.log10(1 + Math.abs(x)));
  const A = Viz.axes(v, { size: [4.4, 2.2, 1.8], x: { lo: 0, hi: 4.05, ticks: [0, 1, 2, 3, 4], fmt: t => t === 0 ? '0' : `10${'⁰¹²³⁴⁵⁶⁷⁸⁹'[t]}`, label: 'conjugate-gradient step' }, y: { lo: -5.2, hi: 6.6, ticks: [-4, 0, 4, 6], fmt: t => t === 0 ? '0' : `${t < 0 ? '−' : ''}10${'⁰¹²³⁴⁵⁶⁷⁸⁹'[Math.abs(t)]}`, label: 'kcal/mol (signed log)' }, z: { lo: -.5, hi: 2.5, ticks: [] } });
  const sets = [['total', 'total', 'hot'], ['vdw', 'van der Waals', 'violet'], ['elect', 'electrostatic', 'cyan']].map(([k, name, col], i) => { const rb = Viz.ribbon(v, A, xs, sgn(E[k]), { color: col, width: .22, z: i, name, skirt: false }); rb.mesh.userData.k = k; const lab = Viz.label(v, name, [A.map(4.15, 0, i).x + .3, A.map(0, sgn([E[k][E[k].length - 1]])[0]).y, A.map(0, 0, i).z], { px: 20, scale: .09, color: col, weight: 700 }); return { rb, lab }; });
  const zero = Viz.line(v, [[A.map(0, 0, -.5).x, A.map(0, 0).y, A.map(0, 0, -.5).z], [A.map(4.05, 0, -.5).x, A.map(0, 0).y, A.map(0, 0, -.5).z]], 'muted');
  v.update = vv => { sets.forEach((s, i) => { const p = Math.max(0, Math.min(1, vv.p * 1.2 - i * .08)); s.rb.draw(p); s.lab.material.opacity = p > .95 ? 1 : 0; }); return false; };
  v.hover = hit => { const k = hit.object.userData.k; if (!k) return null; const i = Viz.ribbonIndex(hit, A); return `<b>${hit.object.userData.series}, step ${f(E.step[i])}</b>${f(E[k][i])} kcal/mol`; };
  v.rot = -.3; v.tilt = .1;
}, { camera: [0, 1.8, 7.2], target: [0, -.1, 0], fov: 32 });
