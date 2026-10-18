# u2netp.onnx

The model behind the closet's "remove background" (see `bgSmartLoad` in
`dev/index.html`).

- **U²-Net (the small "u2netp" variant)** — Xuebin Qin, Zichen Zhang, Chenyang
  Huang, Masood Dehghan, Osmar R. Zaiane and Martin Jagersand, *U²-Net: Going
  Deeper with Nested U-Structure for Salient Object Detection*, Pattern
  Recognition 106, 2020. https://github.com/xuebinqin/U-2-Net —
  Apache License 2.0, a copy of which is in `LICENSE-U2NET.txt`.
- The ONNX export is the one published by **rembg**
  (https://github.com/danielgatis/rembg, MIT), downloaded unmodified from its
  `v0.0.0` release: 4,574,861 bytes.

It is fetched only when the button is first pressed, never at boot, and the
release copies it to `stable/assets/models/` like any other asset.
