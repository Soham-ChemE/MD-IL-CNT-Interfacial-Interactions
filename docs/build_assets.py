"""Build every asset used by docs/index.html and the README hero from the files in this repository.

Reads:
  IL219-Mixed_min.coor   NAMD final coordinates of the minimised (15,15) CNT + 600 [BMIM][BF4] system (19,260 atoms, PDB format)
  IL219-Mixed_min.xsc    periodic cell of that run
  IL219-Mixed_min.log    NAMD energy log of the 10,000-step minimisation
  CNT.pdb, EMIM_BF4.pdb, [BMIM][BF4].pdb, HMIM_BF4.pdb, OMIM_BF4.pdb   structures of the tube and the four ion pairs
Writes:
  docs/assets/data.js                  window.MD = {...} (classic script, works from file://)
  docs/assets/fig_*_{dark,light}.svg   minimisation energy and radial distribution figures
  docs/assets/social-preview.png       1280x640
Run from the repository root:  python docs/build_assets.py
Nothing here reproduces the production results of the paper (those trajectories are not in the repository); the figures
describe the minimised structure that is.
"""
import json, os, collections
import numpy as np
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); OUT = os.path.join(ROOT, "docs", "assets"); os.makedirs(OUT, exist_ok=True)

def read_pdb(path):
    atoms = []
    for l in open(path, encoding="latin-1"):
        if l.startswith(("ATOM", "HETATM")):
            el = l[76:78].strip() or l[12:16].strip()[0]
            atoms.append((l[17:20].strip(), l[22:26].strip(), l[12:16].strip(), el[0] if el else "C", float(l[30:38]), float(l[38:46]), float(l[46:54])))
    return atoms

# ---------------- minimised system ----------------
A = read_pdb(os.path.join(ROOT, "IL219-Mixed_min.coor"))
cell = float(open(os.path.join(ROOT, "IL219-Mixed_min.xsc")).read().strip().splitlines()[-1].split()[1])
res_counts = collections.Counter(a[0] for a in A); n_res = {k: len({(a[1]) for a in A if a[0] == k}) for k in res_counts}
xyz = np.array([a[4:7] for a in A]); el = [a[3] for a in A]; rn = [a[0] for a in A]
cnt = xyz[[i for i, r in enumerate(rn) if r == "CNT"]]
# tube axis by PCA, centre at the tube centroid
c0 = cnt.mean(0); u, s, vt = np.linalg.svd(cnt - c0, full_matrices=False); axis = vt[0]
R = np.array([vt[1], vt[2], vt[0]])  # rotate so the tube axis becomes z
P = (xyz - c0) @ R.T
# re-wrap each ion whole into the cell around the tube (wrapAll wrapped atoms individually)
P = ((P + cell / 2) % cell) - cell / 2
rad = np.hypot(P[:, 0], P[:, 1]); zext = cnt_r = np.hypot(*((cnt - c0) @ R.T)[:, :2].T)
cnt_radius = float(cnt_r.mean()); cnt_len = float(np.ptp(((cnt - c0) @ R.T)[:, 2]))
types = {"CNT": 0, "C": 1, "N": 2, "H": 3, "B": 4, "F": 5}
t = [0 if r == "CNT" else types[e] for r, e in zip(rn, el)]
atoms_out = {"x": [round(float(v), 2) for v in P[:, 0]], "y": [round(float(v), 2) for v in P[:, 1]], "z": [round(float(v), 2) for v in P[:, 2]], "t": t}
n_cation = n_res["HIS"]; n_anion = n_res["IMI"]; atoms_per_cation = res_counts["HIS"] // n_cation
cation_name = {19: "[EMIM]+", 25: "[BMIM]+", 31: "[HMIM]+", 37: "[OMIM]+"}.get(atoms_per_cation, f"{atoms_per_cation}-atom cation")
inside = ((rad < cnt_radius - 1.0) & (np.abs(P[:, 2]) < cnt_len / 2)).sum()

# radial distribution of cation ring nitrogens and anion borons from the tube axis (minimised structure, |z| within the tube)
sel = np.abs(P[:, 2]) < cnt_len / 2
rN = rad[sel & np.array([e == "N" for e in el])]; rB = rad[sel & np.array([e == "B" for e in el])]
edges = np.linspace(0, 30, 61); hN, _ = np.histogram(rN, edges); hB, _ = np.histogram(rB, edges)
shell = np.pi * (edges[1:] ** 2 - edges[:-1] ** 2) * cnt_len
rdf = {"r": [round(float(v), 2) for v in (edges[:-1] + edges[1:]) / 2], "N_per_A3": [round(float(v), 6) for v in hN / shell], "B_per_A3": [round(float(v), 6) for v in hB / shell]}

# ---------------- minimisation energy ----------------
E = [l.split() for l in open(os.path.join(ROOT, "IL219-Mixed_min.log")) if l.startswith("ENERGY:")]
steps = np.array([int(e[1]) for e in E]); tot = np.array([float(e[11]) for e in E]); elec = np.array([float(e[6]) for e in E]); vdw = np.array([float(e[7]) for e in E])
idx = np.unique(np.r_[0, 1, 2, 3, 5, 8, 12, 20, 30, 50, 75, np.linspace(100, len(E) - 1, 150).astype(int)])
energy = {"step": [int(steps[i]) for i in idx], "total": [round(float(tot[i]), 1) for i in idx], "elect": [round(float(elec[i]), 1) for i in idx], "vdw": [round(float(vdw[i]), 1) for i in idx]}

# ---------------- the four ion pairs ----------------
pairs = {}
for name, f in [("EMIM", "EMIM_BF4.pdb"), ("BMIM", "[BMIM][BF4].pdb"), ("HMIM", "HMIM_BF4.pdb"), ("OMIM", "OMIM_BF4.pdb")]:
    at = read_pdb(os.path.join(ROOT, f)); X = np.array([a[4:7] for a in at]); X -= X.mean(0)
    pairs[name] = {"file": f, "n_atoms": len(at), "el": [a[3] for a in at], "xyz": [[round(float(v), 3) for v in p] for p in X],
                   "n_cation": sum(1 for a in at if a[3] not in ("B", "F")), "chain": {"EMIM": "C2", "BMIM": "C4", "HMIM": "C6", "OMIM": "C8"}[name]}
cnt_pdb = read_pdb(os.path.join(ROOT, "CNT.pdb")); Xc = np.array([a[4:7] for a in cnt_pdb]); rc = np.hypot(Xc[:, 0], Xc[:, 1])

# ---------------- published results (from the article; not reproducible from this repository) ----------------
paper = {"doi": "10.1007/s11224-024-02323-3", "journal": "Structural Chemistry 35, 1743-1753 (2024)",
         "rows": [{"il": "[EMIM][BF4]", "chain": "C2", "D_bulk": "1.50e-10", "D_cnt": "0.44e-10", "hb": 0.78, "E": -1.5, "E_approx": True},
                  {"il": "[BMIM][BF4]", "chain": "C4", "D_bulk": "1.47e-12", "D_cnt": "0.36e-12", "hb": 0.81, "E": -4.0, "E_approx": True},
                  {"il": "[HMIM][BF4]", "chain": "C6", "D_bulk": "1.41e-12", "D_cnt": "0.33e-12", "hb": 0.89, "E": -6.5, "E_approx": True},
                  {"il": "[OMIM][BF4]", "chain": "C8", "D_bulk": "1.20e-12", "D_cnt": "0.28e-12", "hb": 1.01, "E": -8.75, "E_approx": False}],
         "conductivity_emim_S_m": 0.005}

stats = {"n_atoms": len(A), "n_cnt": int(res_counts["CNT"]), "n_cation": n_cation, "n_anion": n_anion, "atoms_per_cation": atoms_per_cation, "cation": cation_name,
         "cell_A": cell, "cnt_radius_A": round(cnt_radius, 2), "cnt_diameter_A": round(2 * cnt_radius, 1), "cnt_length_A": round(cnt_len, 1),
         "cnt_pdb_atoms": len(cnt_pdb), "cnt_pdb_diameter_A": round(2 * float(rc.mean()), 1), "cnt_pdb_length_A": round(float(np.ptp(Xc[:, 2])), 1),
         "atoms_inside_tube": int(inside), "min_steps": int(steps[-1]), "E_start": round(float(tot[0])), "E_end": round(float(tot[-1])), "n_energy_lines": len(E)}
data = {"atoms": atoms_out, "rdf": rdf, "energy": energy, "pairs": pairs, "stats": stats, "paper": paper}
with open(os.path.join(OUT, "data.js"), "w") as f:
    f.write("// Generated by docs/build_assets.py from the NAMD files and PDB structures in this repository. Do not edit by hand.\n")
    f.write("window.MD = " + json.dumps(data, separators=(",", ":")) + ";\n")
print("data.js:", stats)

# ---------------- figures ----------------
THEMES = {"dark": ("#e6edf3", "#8b98a9"), "light": ("#0b1220", "#5b6676")}; DARK = "#0b1220"
def style(ax, INK, MUTED):
    ax.set_facecolor("none")
    for s in ax.spines.values(): s.set_color(MUTED); s.set_linewidth(0.8)
    ax.tick_params(colors=INK, labelsize=9); ax.xaxis.label.set_color(INK); ax.yaxis.label.set_color(INK); ax.title.set_color(INK); ax.grid(True, color=MUTED, alpha=0.2, lw=0.6)
for THEME, (INK, MUTED) in THEMES.items():
    save = lambda fig, name: (fig.savefig(os.path.join(OUT, f"{name}_{THEME}.svg"), transparent=True, bbox_inches="tight"), plt.close(fig), print("wrote", name, THEME))
    fig, ax = plt.subplots(figsize=(6.4, 3.6)); style(ax, INK, MUTED)
    ax.plot(steps[1:], tot[1:], color="#a78bfa", lw=2, label="total potential energy"); ax.plot(steps[1:], vdw[1:], color="#22d3ee", lw=1.4, label="van der Waals"); ax.plot(steps[1:], elec[1:], color="#f59e0b", lw=1.4, label="electrostatic")
    ax.set_xscale("log"); ax.set_yscale("symlog", linthresh=1e3); ax.set_xlabel("Minimisation step (NAMD conjugate gradient)"); ax.set_ylabel("Energy (kcal/mol)"); ax.legend(fontsize=8, frameon=False, labelcolor=INK)
    ax.set_title(f"Packed configuration relaxes from {tot[0]:,.0f} to {tot[-1]:,.0f} kcal/mol in {steps[-1]:,} steps", fontsize=9); save(fig, "fig_energy")
    fig, ax = plt.subplots(figsize=(6.4, 3.6)); style(ax, INK, MUTED)
    ax.plot(rdf["r"], rdf["N_per_A3"], color="#a78bfa", lw=2, label="cation ring N"); ax.plot(rdf["r"], rdf["B_per_A3"], color="#34d399", lw=2, label="anion B")
    ax.axvline(cnt_radius, color=MUTED, ls="--", lw=1); ax.text(cnt_radius + .4, ax.get_ylim()[1] * .9, "tube wall", color=MUTED, fontsize=8)
    ax.set_xlabel("Distance from tube axis (Å)"); ax.set_ylabel("Number density (Å⁻³)"); ax.legend(fontsize=8, frameon=False, labelcolor=INK); ax.set_title("Ion positions around the (15,15) tube in the minimised structure (not a production average)", fontsize=8.5); save(fig, "fig_rdf")

fig = plt.figure(figsize=(12.8, 6.4), dpi=100); fig.patch.set_facecolor(DARK)
ax = fig.add_axes([0.52, 0.08, 0.46, 0.86]); ax.set_facecolor(DARK); ax.set_aspect("equal"); ax.axis("off")
cols = {0: "#8b98a9", 1: "#a78bfa", 2: "#60a5fa", 3: "#334155", 4: "#34d399", 5: "#34d399"}
order = np.argsort(P[:, 1]); m = np.abs(P[:, 2]) < 32
for ti, sz in [(3, 2), (1, 7), (2, 9), (5, 9), (4, 12), (0, 10)]:
    k = (np.array(t) == ti) & m; ax.scatter(P[k, 0], P[k, 2], s=sz, c=cols[ti], alpha=.9 if ti else 1, lw=0)
ax.set_xlim(-31, 31); ax.set_ylim(-31, 31)
fig.text(0.05, 0.74, "Ionic liquids at CNT walls", color="#e6edf3", fontsize=36, fontweight="bold")
fig.text(0.05, 0.62, "All-atom MD of four imidazolium [BF₄] ionic liquids\nconfined in a (15,15) carbon nanotube (NAMD, OPLS-AA)", color="#e6edf3", fontsize=17, va="top")
fig.text(0.05, 0.38, f"Structural Chemistry 35, 1743–1753 (2024)\n{len(A):,}-atom minimised structure in the repository\n{n_cation} ion pairs, {res_counts['CNT']}-atom tube", color="#22d3ee", fontsize=14, va="top")
fig.text(0.05, 0.10, "R. Biswas, P. Banerjee, S. S. Kavathekar  |  github.com/Soham-ChemE", color="#8b98a9", fontsize=12)
fig.savefig(os.path.join(OUT, "social-preview.png"), dpi=100, facecolor=DARK); plt.close(fig); print("wrote social-preview.png")
