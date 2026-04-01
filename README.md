# Molecular Dynamics Study of Imidazolium-Based Ionic Liquids and Carbon Nanotubes

**Published in:** *Structural Chemistry*, Springer Nature (2024)  
**DOI:** [10.1007/s11224-024-02323-3](https://doi.org/10.1007/s11224-024-02323-3)  
**Authors:** Rima Biswas, Prateek Banerjee, Kavathekar Soham Sudesh  
**Affiliation:** Process Simulation Research Group, School of Chemical Engineering, Vellore Institute of Technology

---

## Why This Research Matters

Carbon nanotubes (CNTs) have exceptional potential in energy storage, sensors, and electronics — but their strong van der Waals interactions cause them to bundle and aggregate in most solvents, severely limiting practical use.

Ionic liquids (ILs) are a promising solution: they can disperse CNTs into stable, fine bundles without altering their molecular structure. But the molecular-level mechanism behind this stabilization was not fully understood.

**This study uses molecular dynamics (MD) simulations to uncover exactly how imidazolium-based ionic liquids interact with CNTs at the atomic scale** — specifically how the cation alkyl chain length controls ion orientation, diffusion, hydrogen bonding, and interaction energy at the IL-CNT interface.

Understanding this mechanism is critical for designing better CNT-based electrolytes, supercapacitors, and energy storage devices.

---

## System Overview

Four imidazolium-based ionic liquids with a common [BF4]⁻ anion were studied, varying only in cation alkyl chain length:

| Ionic Liquid | Cation | Alkyl Chain |
|---|---|---|
| [EMIM][BF4] | 1-ethyl-3-methylimidazolium | C2 (shortest) |
| [BMIM][BF4] | 1-butyl-3-methylimidazolium | C4 |
| [HMIM][BF4] | 1-hexyl-3-methylimidazolium | C6 |
| [OMIM][BF4] | 1-octyl-3-methylimidazolium | C8 (longest) |

Each IL was simulated with a (15,15) armchair single-walled CNT:
- **Length:** 50 Å
- **Diameter:** 20.5 Å
- **Carbon atoms:** 1260

---

## Simulation Protocol

All simulations were performed using **NAMD 2.14** with the **OPLS-AA force field**.

| Stage | Ensemble | Duration | Purpose |
|---|---|---|---|
| Minimization | — | — | Relax initial geometry |
| Heating | NVT | 100 ps (5 annealing cycles, 300–650 K) | Equilibrate ion distribution |
| Equilibration | NPT | 5 ns + 5 ns at 300 K, 1 atm | Confirm CNT filling |
| Production | NPT | 20 ns at 300 K, 1 atm | Collect trajectory data |

**Key simulation parameters:**
- Force field: OPLS-AA with CL&P parameters for IL ions
- Partial charges: CHELPG method
- Electrostatics: Particle-Mesh Ewald (PME)
- Timestep: 1.0 fs
- Trajectory output: every 1 ps
- Box size: 65 × 65 × 65 Å³ with 600 IL ion pairs

**Software used:**
- [NAMD 2.14](https://www.ks.uiuc.edu/Research/namd/) — MD engine
- [VMD](https://www.ks.uiuc.edu/Research/vmd/) — visualization and CNT coordinate generation
- [Packmol](http://leandro.iqm.unicamp.br/m3g/packmol/home.shtml) — initial configuration builder

---

## Key Results

### 1. Ion Orientation at the CNT Interface
All four ILs show cations adopting **two distinct orientations**: parallel and perpendicular to the CNT surface. Cations with shorter chains ([EMIM]⁺, [BMIM]⁺) position their imidazolium rings near the CNT sidewall, while longer-chain cations ([HMIM]⁺, [OMIM]⁺) have their rings concentrated at the CNT center due to the alkyl tail lying along the surface.

### 2. Diffusion Coefficients — Confinement Drastically Slows Ion Mobility

| System | D_cation (bulk) | D_cation (CNT) | Reduction |
|---|---|---|---|
| [EMIM][BF4] | 1.50 × 10⁻¹⁰ m²/s | 0.44 × 10⁻¹⁰ m²/s | ~3× |
| [BMIM][BF4] | 1.47 × 10⁻¹² m²/s | 0.36 × 10⁻¹² m²/s | ~4× |
| [HMIM][BF4] | 1.41 × 10⁻¹² m²/s | 0.33 × 10⁻¹² m²/s | ~4× |
| [OMIM][BF4] | 1.20 × 10⁻¹² m²/s | 0.28 × 10⁻¹² m²/s | ~4× |

Ion mobility inside CNTs is significantly suppressed relative to bulk, consistent with experimental observations of viscous behavior in IL-CNT composites.

### 3. Hydrogen Bonding — Longer Chains Favor More H-Bonds in Confinement

| System | Avg. H-bonds per cation (CNT) |
|---|---|
| [EMIM][BF4] | 0.78 |
| [BMIM][BF4] | 0.81 |
| [HMIM][BF4] | 0.89 |
| [OMIM][BF4] | 1.01 |

Longer alkyl chains force imidazolium rings toward the CNT center, increasing hydrogen bond probability with [BF4]⁻ anions.

### 4. Interaction Energy — [OMIM][BF4] Binds Most Strongly to CNT

| System | Interaction Energy (kcal·mol⁻¹·ion⁻¹) |
|---|---|
| [EMIM][BF4] | ~ −1.5 |
| [BMIM][BF4] | ~ −4.0 |
| [HMIM][BF4] | ~ −6.5 |
| [OMIM][BF4] | −8.75 |

The longer the alkyl chain, the stronger the π-π stacking interaction with the CNT surface, and the more thermodynamically stable the parallel cation orientation.

### 5. Ion Conductivity
[EMIM][BF4] showed the highest confined ion conductivity (0.005 S·m⁻¹), attributed to its higher self-diffusion coefficient and lower hydrogen bond count inside the CNT.

---

## How to Reproduce

1. Install [NAMD 2.14](https://www.ks.uiuc.edu/Research/namd/) and [VMD](https://www.ks.uiuc.edu/Research/vmd/)
2. Clone this repository
3. For each IL system, run stages in order:
```bash
namd2 Minimization/IL_min.namd > Minimization/IL_min.log
namd2 Heating/IL_heat.namd > Heating/IL_heat.log
namd2 Equilibration/IL_equil.namd > Equilibration/IL_equil.log
namd2 Production/IL_prod.namd > Production/IL_prod.log
```
4. Visualize trajectories using VMD:
```bash
vmd structures/CNT.pdb Production/IL_prod.dcd
```

---

## Citation

If you use this data or methodology, please cite:

> Biswas, R., Banerjee, P., & Kavathekar, S. S. (2024). Molecular dynamics studies on interfacial interactions between imidazolium-based ionic liquids and carbon nanotubes. *Structural Chemistry*. https://doi.org/10.1007/s11224-024-02323-3

---

## Contact

**Kavathekar Soham Sudesh**  
MS Chemical & Biomolecular Engineering, University of Pennsylvania  
📧 stg3719@seas.upenn.edu  
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Soham%20Kavathekar-blue)](https://www.linkedin.com/in/soham-kavathekar-72a22b246)
