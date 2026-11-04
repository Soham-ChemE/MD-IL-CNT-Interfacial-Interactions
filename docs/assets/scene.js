/* Hero and sticky scenes for the IL / CNT page. Data: window.MD from assets/data.js (built from the NAMD files). */
import { THREE, createStage, cameraPath } from './three-kit.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
const D = window.MD, S = window.SITE, reduced = S.reduced, phone = S.phone;
// atom colours per theme: dark pages get the pastel set, light pages a deeper set so the cloud does not wash out
const COLS = { dark: { 0: 0x8b98a9, 1: 0xa78bfa, 2: 0x60a5fa, 3: 0x94a3b8, 4: 0x34d399, 5: 0x6ee7b7 }, light: { 0: 0x64748b, 1: 0x7c3aed, 2: 0x2563eb, 3: 0xcbd5e1, 4: 0x059669, 5: 0x10b981 } };
let COL = COLS[S.isDark() ? 'dark' : 'light']; const RAD = { 0: .42, 1: .44, 2: .46, 3: .2, 4: .5, 5: .4 };

// ---------- hero: the minimised 19,260-atom box, camera scrubbed by scroll from a side view to a look down the tube ----------
(function () {
  const canvas = document.getElementById('heroCanvas'); if (!canvas) return;
  const st = createStage(canvas, { fov: 40, bloom: { strength: .35, radius: .4, threshold: .9 }, dof: { aperture: .0004, maxblur: .0035, focus: 12 }, exposure: 1.0 });
  if (st.failed) return;
  const { scene, camera } = st;
  const ctr = new OrbitControls(camera, canvas); ctr.enableDamping = true; ctr.dampingFactor = .08; ctr.enableZoom = false; ctr.enablePan = false; ctr.autoRotate = !reduced; ctr.autoRotateSpeed = .4;
  scene.add(new THREE.HemisphereLight(0xffffff, 0x223355, .9)); const dl = new THREE.DirectionalLight(0xffffff, 1.6); dl.position.set(30, 50, 40); scene.add(dl);
  const A = D.atoms, N = A.t.length, SC = .1; // 1 scene unit = 10 Å
  const g = new THREE.Group(); scene.add(g); g.rotation.y = Math.PI / 2; // tube axis (data z) along screen x
  const sph = new THREE.SphereGeometry(1, phone ? 6 : 8, phone ? 4 : 6); const byT = {}; for (let i = 0; i < N; i++) (byT[A.t[i]] = byT[A.t[i]] || []).push(i);
  const meshes = {}, m4 = new THREE.Matrix4(), mats = {};
  for (const t in byT) {
    if (phone && t == 3) continue; // hydrogens dropped on phones
    const idx = byT[t];
    const mat = mats[t] = new THREE.MeshStandardMaterial({ color: COL[t], roughness: t == 0 ? .45 : .55, metalness: t == 0 ? .35 : .0, transparent: t == 3, opacity: t == 3 ? .16 : 1, depthWrite: t != 3, emissive: (t == 4 || t == 5) ? 0x34d399 : 0x000000, emissiveIntensity: 0 });
    const mesh = new THREE.InstancedMesh(sph, mat, idx.length); mesh.userData.idx = idx;
    idx.forEach((i, k) => { const r = RAD[t] * SC; m4.makeScale(r, r, r).setPosition(A.x[i] * SC, A.y[i] * SC, A.z[i] * SC); mesh.setMatrixAt(k, m4); });
    meshes[t] = mesh; g.add(mesh);
  }
  function setView(v) { for (const t in meshes) { const mesh = meshes[t], idx = mesh.userData.idx; let n = 0; idx.forEach(i => { const show = v === 'all' || (v === 'noH' && t != 3) || (v === 'slab' && t != 3 && A.z[i] > -6 && A.z[i] < 6); if (show) { const r = RAD[t] * SC; m4.makeScale(r, r, r).setPosition(A.x[i] * SC, A.y[i] * SC, A.z[i] * SC); mesh.setMatrixAt(n++, m4); } }); mesh.count = n; mesh.instanceMatrix.needsUpdate = true; } st.dirty = true; }
  const btns = [...document.querySelectorAll('.ctrls button')]; btns.forEach(b => b.addEventListener('click', () => { btns.forEach(x => x.classList.toggle('on', x === b)); setView(b.dataset.view); }));
  if (phone) { btns.forEach(x => x.classList.toggle('on', x.dataset.view === 'noH')); }
  // camera path: outside the cell, sweep along the tube, end looking down the axis at the ions inside
  const wide = () => st.wide !== false;
  const pathWide = cameraPath([[5.5, 3.6, 14.5], [11, 2.2, 9.5], [13.2, .9, 3.2], [13.4, .5, .2]], [[2.2, -.3, 0], [2.2, 0, 0], [1.6, 0, 0], [1.2, 0, 0]]);
  const pathNarrow = cameraPath([[0, 3.6, 17], [7, 2.4, 11], [10.5, 1, 3], [10.8, .6, .2]], [[0, 1.2, 0], [0, .6, 0], [0, 0, 0], [0, 0, 0]]);
  const pos = new THREE.Vector3(), tgt = new THREE.Vector3(); let lastT = -1, dragging = false, since = 0;
  g.position.x = (st.wide !== false) ? 2.6 : 0; (st.wide !== false ? pathWide : pathNarrow).at(reduced ? 1 : 0, pos, tgt); camera.position.copy(pos); ctr.target.copy(tgt); ctr.update(); // start on the path
  canvas.addEventListener('pointerdown', () => { dragging = true; since = performance.now(); }); addEventListener('pointerup', () => setTimeout(() => dragging = false, 2500));
  ctr.addEventListener('change', () => st.dirty = true);
  st.loop((t, dt) => {
    const T = S.hero.t, glow = S.hero.glow; let changed = false;
    (wide() ? pathWide : pathNarrow).at(reduced ? 1 : T, pos, tgt);
    g.position.x = wide() ? 2.6 : 0;
    if (!dragging) { if (camera.position.distanceToSquared(pos) > 1e-6) { camera.position.lerp(pos, reduced ? 1 : .1); changed = true; } }
    ctr.target.lerp(tgt, .1); ctr.autoRotate = !reduced && T < .25 && !dragging;
    if (ctr.autoRotate || dragging) changed = true;
    ctr.update();
    const ei = .25 + .75 * glow; for (const k of [4, 5]) if (mats[k] && Math.abs(mats[k].emissiveIntensity - ei) > 1e-3) { mats[k].emissiveIntensity = ei; changed = true; }
    if (st.bloom) st.bloom.strength = .25 + .3 * glow;
    if (st.bokeh) { st.bokeh.uniforms.focus.value = camera.position.distanceTo(ctr.target); }
    if (Math.abs(T - lastT) > 1e-4) { lastT = T; changed = true; }
    return changed;
  });
  st.onTheme = dark => { COL = COLS[dark ? 'dark' : 'light']; for (const t in mats) mats[t].color.setHex(COL[t]); st.dirty = true; };
})();

// ---------- sticky: the four ion pairs ----------
(function () {
  const canvas = document.getElementById('ionCanvas'); if (!canvas) return;
  const st = createStage(canvas, { fov: 36, env: true, envIntensity: .8, alpha: false }); if (st.failed) return;
  const { scene, camera } = st; camera.position.set(0, 6, 16);
  const ctr = new OrbitControls(camera, canvas); ctr.enableDamping = true; ctr.enableZoom = false; ctr.enablePan = false; ctr.autoRotate = !reduced; ctr.autoRotateSpeed = 1.2;
  scene.add(new THREE.HemisphereLight(0xffffff, 0x223355, .9)); const dl = new THREE.DirectionalLight(0xffffff, 1.5); dl.position.set(5, 8, 6); scene.add(dl);
  const EL = { C: [0xa78bfa, .55], N: [0x60a5fa, .58], H: [0xe2e8f0, .3], B: [0x34d399, .6], F: [0x6ee7b7, .5] }; const sph = new THREE.SphereGeometry(1, 20, 14); let grp = null, cur = .001;
  function build(k) {
    const P = D.pairs[k]; if (!P) return; if (grp) { scene.remove(grp); grp.traverse(o => { if (o.geometry && o.geometry !== sph) o.geometry.dispose(); if (o.material) o.material.dispose(); }); }
    grp = new THREE.Group(); const m4 = new THREE.Matrix4(); const byEl = {}; P.el.forEach((e, i) => (byEl[e] = byEl[e] || []).push(i));
    for (const e in byEl) { const im = new THREE.InstancedMesh(sph, new THREE.MeshStandardMaterial({ color: EL[e][0], roughness: .35, metalness: .05 }), byEl[e].length); byEl[e].forEach((i, n) => { const r = EL[e][1]; m4.makeScale(r, r, r).setPosition(...P.xyz[i]); im.setMatrixAt(n, m4); }); grp.add(im); }
    const segs = []; for (let i = 0; i < P.xyz.length; i++) for (let j = i + 1; j < P.xyz.length; j++) { const a = P.xyz[i], b = P.xyz[j]; const d = Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]); const cut = (P.el[i] === 'H' || P.el[j] === 'H') ? 1.25 : (P.el[i] === 'B' || P.el[j] === 'B') ? 1.6 : 1.75; if (d < cut) segs.push(...a, ...b); }
    grp.add(new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(segs, 3)), new THREE.LineBasicMaterial({ color: 0x8b98a9, transparent: true, opacity: .8 })));
    cur = reduced ? 1 : .001; grp.scale.setScalar(cur); scene.add(grp); st.dirty = true;
  }
  build('EMIM'); document.addEventListener('ion', e => build(e.detail));
  ctr.addEventListener('change', () => st.dirty = true);
  st.loop(() => { ctr.update(); let ch = ctr.autoRotate; if (grp && Math.abs(1 - cur) > 1e-3) { cur += (1 - cur) * .1; grp.scale.setScalar(cur); ch = true; } return ch; });
})();
