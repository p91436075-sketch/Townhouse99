/* Очікує глобальний масив `photos` (список URL) визначений на сторінці */
(function(){
  if (typeof photos === 'undefined') return;

  const overlay = document.getElementById('lightbox');
  const imgEl = document.getElementById('lightboxImg');
  let current = 0;

  function show(i){
    current = (i + photos.length) % photos.length;
    imgEl.src = photos[current];
  }

  function open(i){
    show(i);
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function close(){
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.gallery a').forEach((a, i) => {
    a.addEventListener('click', e => {
      e.preventDefault();
      open(i);
    });
  });

  document.getElementById('lightboxClose').addEventListener('click', close);
  document.getElementById('lightboxPrev').addEventListener('click', () => show(current - 1));
  document.getElementById('lightboxNext').addEventListener('click', () => show(current + 1));
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', e => {
    if (!overlay.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
  });
})();
