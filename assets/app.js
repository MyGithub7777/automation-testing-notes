// Standalone browser JavaScript. No Astro, React, npm packages, or build step.
(() => {
  const basePath = new URL('../', document.currentScript.src).pathname;
  const siteUrl = url => url.startsWith('/') && !url.startsWith('//') && !url.startsWith(basePath) ? basePath + url.slice(1) : url;
  window.documentationUrl = siteUrl;
  const site = { ...window.DOC_SITE, pages: window.DOC_SITE.pages.map(page => ({ ...page, url: siteUrl(page.url) })) };
  const normalized = (url) => new URL(url, location.origin).pathname.replace(/\/$/, '') || '/';
  const current = normalized(location.pathname);
  const pageIsHome = current === normalized(basePath);

  // Shared subject navigation: site-data.js is the only registry to maintain.
  const topList = document.querySelector('.sidebar-content ul.top-level') || document.querySelector('.sidebar-content ul');
  if (topList) {
    const groupTemplate = topList.querySelector('li:has(details)')?.cloneNode(true);
    const home = topList.querySelector('li')?.cloneNode(true);
    if (groupTemplate && home) {
      const homeLink = home.querySelector('a');
      homeLink.setAttribute('href', basePath);
      if (pageIsHome) homeLink.setAttribute('aria-current', 'page'); else homeLink.removeAttribute('aria-current');
      topList.replaceChildren(home);
      for (const subject of site.subjects) {
        const item = groupTemplate.cloneNode(true);
        const details = item.querySelector('details');
        const summary = item.querySelector('summary');
        const label = summary.querySelector('.large') || summary.querySelector('span');
        if (label) label.textContent = subject.title;
        else { const text = [...summary.childNodes].find(n => n.nodeType === Node.TEXT_NODE); if (text) text.textContent = subject.title; }
        const list = details.querySelector('ul');
        const linkTemplate = list.querySelector('li').cloneNode(true);
        list.replaceChildren();
        const pages = site.pages.filter(p => p.subject === subject.id).sort((a, b) => (a.order || 0) - (b.order || 0));
        for (const entry of pages.length ? pages : [{ title: 'Notes coming soon', url: `/#learning-path-${subject.id}` }]) {
          const row = linkTemplate.cloneNode(true);
          const link = row.querySelector('a');
          link.replaceChildren(document.createTextNode(entry.title));
          link.href = siteUrl(entry.url);
          if (normalized(entry.url) === current && !entry.url.includes('#')) link.setAttribute('aria-current', 'page');
          else link.removeAttribute('aria-current');
          list.append(row);
        }
        details.open = pages.some(p => normalized(p.url) === current);
        topList.append(item);
      }
    }
  }
  // The mobile menu uses the native HTML popover API.
  document.querySelectorAll('#starlight__sidebar a').forEach(link => link.addEventListener('click', () => {
    const sidebar = document.getElementById('starlight__sidebar');
    if (sidebar?.matches(':popover-open')) sidebar.hidePopover();
  }));

  let preference = 'auto';
  try { preference = localStorage.getItem('documentation-theme') || localStorage.getItem('starlight-theme') || 'auto'; } catch {}
  const scheme = matchMedia('(prefers-color-scheme: dark)');
  const setTheme = (theme) => {
    preference = ['dark', 'light'].includes(theme) ? theme : 'auto';
    document.documentElement.dataset.theme = preference === 'auto' ? (scheme.matches ? 'dark' : 'light') : preference;
    document.querySelectorAll('starlight-theme-select select').forEach(select => { select.value = preference; });
    try { localStorage.setItem('documentation-theme', preference); } catch {}
  };
  document.querySelectorAll('starlight-theme-select select').forEach(select => select.addEventListener('change', () => setTheme(select.value)));
  scheme.addEventListener('change', () => { if (preference === 'auto') setTheme('auto'); });
  setTheme(preference);

  // Restore the source note's unique title anchor; the host title is hidden.
  if (document.querySelector('.shared-snapshot')) document.querySelector('main > .content-panel:first-child h1')?.removeAttribute('id');

  // Build the table of contents from the editable HTML itself.
  const content = document.querySelector('.shared-snapshot') || document.querySelector('.sl-markdown-content');
  const headings = content ? [...content.querySelectorAll('h2[id]')] : [];
  const hostTitle = document.querySelector('main h1#_top');
  const firstTitle = document.querySelector('.shared-snapshot h1#_top') || hostTitle;
  const tocItems = [...(firstTitle ? [{ id: '_top', text: 'Overview', element: firstTitle }] : []), ...headings.map(el => ({ id: el.id, text: el.textContent, element: el }))];
  for (const toc of document.querySelectorAll('starlight-toc, mobile-starlight-toc')) {
    const list = toc.querySelector('ul');
    const sample = list?.querySelector('li');
    if (!list || !sample) continue;
    const template = sample.cloneNode(true);
    list.replaceChildren();
    for (const item of tocItems) {
      const row = template.cloneNode(true);
      const link = row.querySelector('a');
      link.href = '#' + item.id;
      link.removeAttribute('aria-current');
      const span = link.querySelector('span');
      if (span) span.textContent = item.text; else link.textContent = item.text;
      list.append(row);
      link.addEventListener('click', () => document.getElementById('starlight__mobile-toc')?.removeAttribute('open'));
    }
  }
  let scheduled = false;
  const updateToc = () => {
    scheduled = false;
    let active = tocItems[0];
    for (const item of tocItems) if (item.element.getBoundingClientRect().top <= 150) active = item;
    if (!active) return;
    document.querySelectorAll('starlight-toc a, mobile-starlight-toc a').forEach(link => {
      if (decodeURIComponent(link.hash.slice(1)) === active.id) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
    const label = document.querySelector('mobile-starlight-toc .display-current');
    if (label) label.textContent = active.text;
  };
  addEventListener('scroll', () => { if (!scheduled) { scheduled = true; requestAnimationFrame(updateToc); } }, { passive: true });
  updateToc();

  // Search reads the current HTML files. Manual text edits need no reindex/build.
  const dialog = document.querySelector('site-search dialog');
  const trigger = document.querySelector('[data-open-modal]');
  if (dialog && trigger) {
    trigger.disabled = false;
    const shortcut = trigger.querySelector('kbd');
    if (shortcut) shortcut.style.removeProperty('display');
    dialog.innerHTML = '<div class="plain-search"><div class="plain-search-bar"><label class="sr-only" for="plain-search-input">Search notes</label><input id="plain-search-input" type="search" placeholder="Search notes…" autocomplete="off"><button type="button" aria-label="Close search">Close</button></div><p class="plain-search-status" role="status">Search all published notes.</p><ul class="plain-search-results"></ul></div>';
    const input = dialog.querySelector('input');
    const status = dialog.querySelector('[role="status"]');
    const results = dialog.querySelector('ul');
    let indexed;
    let latestRequest = 0;
    const loadIndex = () => indexed ||= Promise.all(site.pages.map(async page => {
      try {
        const response = await fetch(page.url);
        if (!response.ok) return null;
        const document = new DOMParser().parseFromString(await response.text(), 'text/html');
        const main = document.querySelector('.shared-snapshot') || document.querySelector('main');
        return { ...page, text: main?.textContent || '' };
      } catch { return null; }
    }));
    const search = async () => {
      const request = ++latestRequest;
      const terms = input.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
      results.replaceChildren();
      if (!terms.length) { status.textContent = 'Search all published notes.'; return; }
      status.textContent = 'Searching…';
      const pages = await loadIndex();
      if (request !== latestRequest) return;
      const matches = pages.filter(page => page && terms.every(term => `${page.title} ${page.text}`.toLowerCase().includes(term)));
      status.textContent = matches.length ? `${matches.length} matching ${matches.length === 1 ? 'page' : 'pages'}` : 'No matching notes. Try another keyword.';
      for (const page of matches) {
        const li = document.createElement('li');
        const link = document.createElement('a');
        link.href = page.url;
        link.textContent = page.title;
        li.append(link);
        results.append(li);
      }
    };
    const openSearch = () => { if (!dialog.open) dialog.showModal(); input.focus(); };
    trigger.addEventListener('click', openSearch);
    dialog.querySelector('button').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
    input.addEventListener('input', search);
    input.addEventListener('keydown', event => {
      if (event.key === 'ArrowDown') { event.preventDefault(); results.querySelector('a')?.focus(); }
      if (event.key === 'Enter') results.querySelector('a')?.click();
    });
    results.addEventListener('keydown', event => {
      const links = [...results.querySelectorAll('a')];
      const index = links.indexOf(document.activeElement);
      if (event.key === 'ArrowDown') { event.preventDefault(); links[Math.min(index + 1, links.length - 1)]?.focus(); }
      if (event.key === 'ArrowUp') { event.preventDefault(); if (index <= 0) input.focus(); else links[index - 1]?.focus(); }
    });
    document.addEventListener('keydown', event => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); if (dialog.open) dialog.close(); else openSearch(); }
    });
  }
})();
