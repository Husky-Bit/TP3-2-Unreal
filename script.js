/* script.js — Trabajo Práctico
    Año en el footer
    Lightbox con zoom (rueda) y arrastre
*/

document.addEventListener('DOMContentLoaded', () => {

  // ── Año en el footer ───────────────────────────
  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ── Referencias del lightbox ───────────────────
  const lightbox = document.getElementById('lightbox');
  const lbImg    = document.getElementById('lightbox-img');
  const lbClose  = document.getElementById('lightbox-close');
  if (!lightbox || !lbImg) return;

  // ── Estado zoom/drag ───────────────────────────
  let scale = 1, ox = 0, oy = 0;
  let dragging = false, sx = 0, sy = 0;

  // ── Click en cualquier img-frame ──────────────
  // Usa delegación desde document para que funcione
  // sin importar cuándo se cargó la imagen o si cambió el DOM.
  document.addEventListener('click', (e) => {
    const frame = e.target.closest('.img-frame');
    if (!frame) return;

    // Buscar la imagen dentro del frame
    const img = frame.querySelector('.img-frame__img');

    // Verificar que la imagen existe y cargó correctamente
    // naturalWidth === 0 significa que no cargó (rota o ausente)
    if (!img || img.naturalWidth === 0) return;

    lbImg.src = img.src;
    lbImg.alt = img.alt || '';
    resetZoom();
    lightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  });

  // ── Cerrar ─────────────────────────────────────
  function closeLightbox() {
    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
    resetZoom();
  }

  lbClose.addEventListener('click', (e) => {
    e.stopPropagation();
    closeLightbox();
  });

  lightbox.addEventListener('click', (e) => {
    // Solo cierra si el click fue en el fondo, no en la imagen
    if (e.target === lightbox || e.target === lightbox.querySelector('.lightbox__inner')) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });

  // ── Zoom con rueda ─────────────────────────────
  lbImg.addEventListener('wheel', (e) => {
    e.preventDefault();
    const step = e.deltaY < 0 ? 0.2 : -0.2;
    scale = Math.min(Math.max(0.5, scale + step), 8);
    applyTransform();
  }, { passive: false });

  // Doble click: toggle zoom
  lbImg.addEventListener('dblclick', () => {
    if (scale > 1) { resetZoom(); } else { scale = 2.5; applyTransform(); }
  });

  // ── Arrastre con mouse ─────────────────────────
  lbImg.addEventListener('mousedown', (e) => {
    if (scale <= 1) return;
    dragging = true;
    sx = e.clientX - ox;
    sy = e.clientY - oy;
    lbImg.classList.add('is-grabbing');
    e.preventDefault();
  });

  window.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    ox = e.clientX - sx;
    oy = e.clientY - sy;
    applyTransform();
  });

  window.addEventListener('mouseup', () => {
    dragging = false;
    lbImg.classList.remove('is-grabbing');
  });

  // ── Pinch zoom en celular ────────────────────────
  let lastDist = null;

  lightbox.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) lastDist = pinchDist(e);
    else if (e.touches.length === 1 && scale > 1) {
      dragging = true;
      sx = e.touches[0].clientX - ox;
      sy = e.touches[0].clientY - oy;
    }
  }, { passive: true });

  lightbox.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2 && lastDist) {
      const d = pinchDist(e);
      scale = Math.min(Math.max(0.5, scale + (d - lastDist) * 0.012), 8);
      lastDist = d;
      applyTransform();
    } else if (e.touches.length === 1 && dragging) {
      ox = e.touches[0].clientX - sx;
      oy = e.touches[0].clientY - sy;
      applyTransform();
    }
  }, { passive: true });

  lightbox.addEventListener('touchend', () => { lastDist = null; dragging = false; });

  // ── Helpers ────────────────────────────────────
  function applyTransform() {
    lbImg.style.transform = `translate(${ox}px, ${oy}px) scale(${scale})`;
  }

  function resetZoom() {
    scale = 1; ox = 0; oy = 0;
    applyTransform();
  }

  function pinchDist(e) {
    return Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    );
  }

});
