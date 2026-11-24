// Runs before paint. Works without a framework or build step.
(() => {
  let theme = 'auto';
  try { theme = localStorage.getItem('documentation-theme') || localStorage.getItem('starlight-theme') || 'auto'; } catch {}
  document.documentElement.dataset.theme = theme === 'auto' ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : theme;
})();
