/**
 * overlay-scale.config.js
 * ─────────────────────────────────────────────
 * Centralized scale config for all overlay layouts.
 *
 * PREVIEW  = scale saat ditampilkan di Operator Panel (in-app preview)
 * OVERLAY  = scale saat ditampilkan di OBS Browser Source (broadcast)
 *
 * Naikkan OVERLAY jika HUD terlalu kecil di layar siaran.
 * Naikkan PREVIEW jika preview di panel terlalu kecil.
 * ─────────────────────────────────────────────
 */

export const LAYOUT_SCALE = {
  A: { preview: '0.75', overlay: '1' }, // full-width football broadcast
  B: { preview: '1.0', overlay: '2.72' }, // full-width vertical card
  C: { preview: '1.0', overlay: '2' }, // full-width modern bar
  D: { preview: '1.6', overlay: '2.3' }, // VCT compact HUD (diperbesar)
  E: { preview: '1.6', overlay: '1.6' }, // VCT compact HUD (diperbesar)
}

/**
 * Helper: kembalikan scale yang tepat berdasarkan flag isPreview.
 * Usage: const scale = getScale('D', data.isPreview)
 */
export function getScale(layout, isPreview) {
  const cfg = LAYOUT_SCALE[layout] ?? LAYOUT_SCALE.A
  return isPreview ? cfg.preview : cfg.overlay
}
