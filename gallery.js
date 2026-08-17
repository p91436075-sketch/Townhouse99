/* Лайтбокс для кожного блоку фото окремо (наприклад, "Фото апартаменту" і
   "Вигляд з вулиці" не змішуються — стрілки гортають лише в межах свого блоку).
   Кожен контейнер .gallery може мати data-photos-var="назваМасиву" — тоді
   лайтбокс гортає весь цей масив (навіть фото, яких немає серед мініатюр,
   як-от "+N фото"). Якщо атрибут не заданий — використовуються лише видимі
   мініатюри контейнера. */
(function(){
  const overlay = document.getElementById('lightbox');
  const imgEl = document.getElementById('lightboxImg');
  if (!overlay || !imgEl) return;

  let activePhotos = [];
  let current = 0;

  function show(i){
    if (!activePhotos.length) return;
    current = (i + activePhotos.length) % activePhotos.length;
    imgEl.src = activePhotos[current];
  }

  function open(list, i){
    activePhotos = list;
    show(i);
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function close(){
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.gallery').forEach(gallery => {
    const varName = gallery.dataset.photosVar;
    const list = (varName && Array.isArray(window[varName]) && window[varName].length)
      ? window[varName]
      : Array.from(gallery.querySelectorAll('img')).map(img => img.getAttribute('src'));

    gallery.querySelectorAll('a').forEach((a, i) => {
      a.addEventListener('click', e => {
        e.preventDefault();
        open(list, i);
      });
    });
  });

  const closeBtn = document.getElementById('lightboxClose');
  const prevBtn = document.getElementById('lightboxPrev');
  const nextBtn = document.getElementById('lightboxNext');
  if (closeBtn) closeBtn.addEventListener('click', close);
  if (prevBtn) prevBtn.addEventListener('click', () => show(current - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => show(current + 1));
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', e => {
    if (!overlay.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
  });
})();
