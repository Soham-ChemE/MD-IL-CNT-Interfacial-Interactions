#!/usr/bin/env bash
# Regenerates every asset of the live page (docs/assets/) from the NAMD files and PDB structures in this repository,
# and prints the system composition and minimisation energies quoted in README.md and docs/CLAIMS.md.
# Needs: pip install -r requirements.txt
set -euo pipefail
cd "$(dirname "$0")"
python docs/build_assets.py --no-page
# python docs/build_assets.py --snap --qa --lighthouse   # static fallbacks for the 3D body scenes, both-theme screenshots, Lighthouse (needs playwright + lighthouse)
