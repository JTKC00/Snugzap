# SwiftLocal product introduction

The public introduction is `/swiftlocal/`. Both download CTAs use the stable
official release entry at `https://github.com/JTKC00/SwiftLocal/releases/latest`.
The homepage card and shared Projects menu use the internal introduction.

## Content baseline

Copy was checked against `JTKC00/SwiftLocal` commit
`c98b27fd01eac54710e291db205039e7ed41190d` on 2026-10-03:

- `README.md`: Windows x64 support; full installer with common local engines;
  PDF, OCR, Office, image and media workspaces; batch tasks, task centre,
  saved preferences and workflows.
- Traditional Chinese and English OCR, searchable PDFs and PDF-to-Word are
  described at the level supported by that README. Office layout preservation
  is best-effort. Experimental Office output formats are not advertised.
- Ordinary conversions run locally without uploading documents to a SwiftLocal
  cloud service. Online media URL features require network access; the page
  does not promise that every feature works offline.
- Windows is the only officially supported platform. macOS is experimental,
  Linux is not officially supported, and the current installer is unsigned.
  The install disclosure explains the Windows prompt and release checksums.
  No store availability, support for named media platforms, universal layout
  fidelity or download/customer metrics are claimed.

## Brand and screenshot

`frontend/assets/brand/README.md` identifies the selected flowing-S mark and
primary green `#1f7a68`, requiring intact proportions and no added shadow on
the mark. The SVG is copied byte-for-byte. The dedicated page stylesheet uses
that green identity on light surfaces and only loads on SwiftLocal.

The image comes from `docs/design/home-1280-light.png` in the same pinned
repository. It is an existing interface capture with the Traditional Chinese
home screen, not a newly executed Windows session or an invented product UI.
It contains no personal document contents or machine paths. The page captions
it as an interface view and links to the full-size image. The source decoded
as 1265 × 791; it was encoded to WebP at quality 90 without cropping or editing.
The Office capture was not used because it includes disconnected-engine and
sample-output states that could confuse a product introduction.

Source and installed asset hashes and screenshot dimensions are recorded in
`SWIFTLOCAL_ASSETS.json`. The 1200 × 630 JPEG social image is a browser capture
of the actual page hero. All raster files were fully decoded, and source/build
bytes match. Metadata and sitemap membership use the existing page registry.
