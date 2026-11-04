#!/usr/bin/env bash
# Regenerates every asset of the live page (docs/assets/) from the NAMD files and PDB structures in this repository,
# and prints the system composition and minimisation energies quoted in README.md and docs/CLAIMS.md.
# Needs: pip install -r requirements.txt
# Note: the NAMD run itself cannot be re-executed from this repository (IL219-Mixed.psf and the parameter file are not included);
# the production trajectories behind the published results are not included either.
set -euo pipefail
cd "$(dirname "$0")"
python docs/build_assets.py
