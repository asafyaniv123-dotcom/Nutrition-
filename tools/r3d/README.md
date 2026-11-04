# Exercise demos rendered in code (started 3 Nov 2026)

The alternative to Higgsfield clips: a rigged human model posed joint by joint from
the form research (reports/), in the approved look rebuilt in code - an amber figure
with a fresnel rim and soft inner glow (stage.html, figMat), equipment as dim amber
outlines (equip()), a warm dark ground with a pool of golden light, and bloom.
drive.mjs opens the stage in headless Chrome, loads an exercise script that defines
setup() and pose(t), and writes PNG frames; ffmpeg (npm ffmpeg-static) makes the mp4.

Setup: `npm i three@0.160.0` next to these files; put a model .glb beside stage.html.
`node drive.mjs probe.js out 1` renders one still.

Where it stands: the look works; the free models tried (three.js Xbot, Michelle) are a
jointed mannequin and a clothed dancer, nothing like the approved figure. Asaf rejected
the $18 3DDisco muscular mesh as anatomically wrong and too bulky. Next: a realistic,
athletic rigged male in shorts - candidates: VTR3D "Realistic Human Male Body Rigged
Game Ready" (RenderHub, free), CGTrader "Realistic Male Character Rigged" (free),
MakeHuman (CC0 export). Asaf puts the file in models/; then squat, bench press and lat
pulldown, shown beside the AI clips.
