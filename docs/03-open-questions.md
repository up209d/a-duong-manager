# 03 - Open Questions

Questions not yet answered by Duc. Resolve before or during Phase 1 where noted.

## Resolved

- ~~Auth / multi-user~~ -> NO auth, single shop, single user (2026-09-14)
- ~~App name / branding~~ -> **+Manage** (2026-09-14). No logo assets yet

## Nice to have (can default, tell me if different)

3. **Currency:** VND, display as whole dong (no decimals), format
   `1.234.567 d` (Vietnamese thousand separators). OK?
4. **Overselling:** block a sale that exceeds current stock, or allow it and
   let stock go negative? (default: allow with warning - small shops often
   sell before restocking)
5. **Barcode scanning:** 1D barcodes + QR both? (default: both, via camera)
6. **Photo upload:** store on backend disk (SQLite path) - OK for MVP?
   (default: yes; move to object storage later if needed)
7. **Discount input:** reference UI shows BOTH % and amount fields visible -
   both active at once, or one-or-the-other? (default: one-or-the-other,
   entering one clears the other)
8. **"Ho so" (profile) tab:** what goes there? (default: shop name, language
   switch vi/en, about)
9. **Reports export:** need CSV/Excel or PDF export of P/L reports?
   (default: no for MVP, on-screen only)
10. **Data backup/restore:** needed? (default: no for MVP)

## Known gaps in requirement docs

- Formula images `images/image1-7.png` missing from `requirement/` folder -
  formulas were inferred and confirmed verbally (see 02-decisions.md).
  If Duc re-sends the images, cross-check.
- "Quan ly lo" tile in home screenshot is likely "Quan ly no" (debt
  management) - treated as such.
