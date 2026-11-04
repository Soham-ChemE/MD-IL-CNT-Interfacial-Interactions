# Claims audit: MD ionic liquid / CNT README and live page

This repository documents a published study (R. Biswas, P. Banerjee, S. S. Kavathekar, *Structural Chemistry* 35, 1743–1753,
2024, doi 10.1007/s11224-024-02323-3). It does **not** contain the production trajectories behind the published numbers; it
contains the structures, one complete NAMD minimisation of the [BMIM][BF₄] + CNT system (input, log, trajectory, final
coordinates) and the figures prepared for the article. The audit therefore separates what the repository itself verifies
from what is quoted from the article.

## Verified from files in the repository (2026-11-04, `./reproduce.sh`)

| Claim | Where | Value | Status |
|---|---|---|---|
| (15,15) armchair SWCNT, 1,260 carbon atoms | `CNT.pdb` | 1,260 atoms | matches |
| Tube 50 Å long, about 20.5 Å in diameter | `CNT.pdb` coordinates (`docs/build_assets.py`) | length 50.3 Å, mean diameter 20.3 Å; in the minimised system 50.5 / 20.4 Å | matches to the stated precision; README now says 20 Å |
| 600 ion pairs per box | `IL219-Mixed_min.coor` residue count | 600 cations (25 atoms each = [BMIM]⁺) + 600 [BF₄]⁻ | matches |
| Periodic box | `IL219-Mixed_min.xsc`, NAMD log | 62.19 Å cube in the included run | README previously said 65 × 65 × 65 Å³; changed to the value in the file |
| 19,260 atoms in the minimised structure | `.coor` | 19,260 (1,260 CNT + 15,000 cation + 3,000 anion atoms) | matches |
| NAMD 2.14, 1 fs time step, PME, 12 Å cutoff | `IL219-Mixed_min.namd`, log header | NAMD 2.14 CUDA build; `timestep 1.0`; `PME yes`; `cutoff 12.0` | matches |
| Minimisation relaxes the packed configuration | `IL219-Mixed_min.log` | 10,000 conjugate-gradient steps, total energy 2,105,687 → −47,319 kcal/mol | matches |
| Ions enter the tube | `.coor` (`docs/build_assets.py`) | 659 atoms inside the tube radius after minimisation | new statement, computed |
| OPLS-AA with CL&P parameters, CHELPG charges, annealing 300 to 650 K, 5 + 5 ns NPT, 20 ns production | article methods; the parameter file (`../common/ILnWater.params`) and the heating / equilibration / production inputs are **not** in the repository | cannot be checked here | left as a description of the published protocol |

## Quoted from the article (not reproducible from this repository)

| Claim | Checked against | Status |
|---|---|---|
| [OMIM][BF₄] interaction energy with the CNT −8.75 kcal mol⁻¹ ion⁻¹ | public abstract at the DOI | confirmed |
| 1.01 hydrogen bonds per cation for [OMIM][BF₄] inside the tube | public abstract at the DOI | confirmed |
| Two cation orientations (parallel and perpendicular); parallel more stable through π-π stacking; diffusion much slower under confinement | public abstract at the DOI | confirmed qualitatively |
| Cation diffusion coefficients (bulk and confined) for all four liquids, the three- to four-fold reduction | `MSD_diffusion_plots.png` in the repository (figure prepared for the article); full text is paywalled | figure present; numbers not independently recomputed |
| Interaction energies ≈ −1.5 / −4.0 / −6.5 kcal mol⁻¹ ion⁻¹ for [EMIM] / [BMIM] / [HMIM] | `interaction_energy_plot.png` in the repository | figure present; read from the figure, marked "≈" |
| H-bonds per cation 0.78 / 0.81 / 0.89 | article full text | not checked here |
| Confined ionic conductivity of [EMIM][BF₄] 0.005 S m⁻¹ | article full text | not checked here |

## Changes made in this pass

| Old | New | Reason |
|---|---|---|
| "65 × 65 × 65 Å³ box" | "62.19 Å periodic cell (from the included NAMD run)" | the only box size in the repository is 62.19 Å |
| "20.5 Å diameter" | "20 Å diameter" | computed 20.3 Å from `CNT.pdb` |
| "a complete NAMD input chain for one system are in this repository" | states exactly what is included (minimisation input, log, DCD, final coordinates for the [BMIM][BF₄] system) and that the PSF and parameter files it references are not | the previous wording over-stated reproducibility |
| results tables unlabelled | every published value is labelled as reported in the article, with the two abstract-level values marked as checked | traceability |
| no LICENSE, .gitignore, requirements, reproduce script | added | repository hygiene |

## Not verifiable from the repository

- Everything in the "quoted from the article" table above beyond the two abstract-level values. The full text is behind the publisher's paywall, and the production trajectories are not in the repository.
- The NAMD input's header comment describes a different system (an ionic liquid in water with CsNO₃); the coordinate and log files it produced are unambiguously the CNT + [BMIM][BF₄] system described here. The comment is a leftover template line.

## Round 2 (2026-11-04): live-page fix and rebuild

No published or repository-derived number changed in this pass. What changed:

| Item | Detail |
|---|---|
| Two figures in section 03 of the live page did not render | They were referenced as `../MSD_diffusion_plots.png` and `../cation_orientation.png`. GitHub Pages serves the site from `/docs`, so those paths resolved above the site root and returned 404. `docs/build_assets.py` now copies the three article figures into `docs/assets/` (256-colour PNGs) and the page loads them from there. Proof: `docs/qa/2026-11-04-figure-fix-desktop-full.png`. |
| Page rebuilt | three.js 0.186.1 ES modules with `EffectComposer` (bloom, depth of field on desktop), Lenis 1.3.27 + GSAP 3.15.0 ScrollTrigger master timeline, pinned hero with a scroll-scrubbed camera path, count-ups, sticky ion figure. Rationale in `docs/DESIGN.md`. Every number shown on the page still comes from `docs/assets/data.js`, which `docs/build_assets.py` derives from the NAMD files, or from the article table above. |
| Animated README hero | `docs/assets/hero.svg` is generated by `docs/build_assets.py` from the same coordinates: the atoms within 8 Å of the tube's mid-plane (5,193 of 19,260), seen end-on and rotated by a CSS keyframe. The four statistics it cycles through (19,260 atoms; 600 ion pairs; 4 ionic liquids; −8.75 kcal/mol and 1.01 H-bonds per cation for [OMIM][BF₄]) are the ones audited above. |
| Hero fallback image | `docs/assets/hero.png` is now a frame of the rebuilt scene (looking down the tube axis), used only when WebGL is unavailable. |

## Round 3 (2026-11-04): framing, 3D body scenes, light mode

- The README and the page lead with the published result and with what the repository renders and verifies. The provenance notes stay here: the production trajectories behind the published numbers are not in the repository, the `.psf` and parameter files the NAMD input references are not either, so the NAMD run is not re-executable from the repository and the article's values are quoted, not recomputed; the three interaction energies marked ≈ are read from the article's figure; the density profile on the page is the minimised starting structure, not a production average.
- Every body figure on the page is a 3D scene (`docs/assets/body.js`): the density profile and the minimisation energies from `docs/assets/data.js`, the chain-length and diffusion bar fields from the article's reported values (`paper.rows`), the wall drawing from the coordinate files. The static fallbacks `docs/assets/viz_*_{dark,light}.png` are captures of the same scenes.
- None of the figures withdrawn in earlier rounds appears in the README, the page or this file.
