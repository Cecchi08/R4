// Aplica el tema antes de montar React para evitar un destello de color inicial.
(function () {
  let stored = null;
  try { stored = localStorage.getItem('portfolio-theme'); }
  catch { /* El tema sigue funcionando si el navegador restringe almacenamiento. */ }
  const theme = stored === 'light' || stored === 'dark' ? stored : window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', theme);
})();
