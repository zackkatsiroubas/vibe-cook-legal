// The Help menu closes when you click outside it, pick a link, or press Escape.
document.querySelectorAll('.help').forEach(help => {
  document.addEventListener('click', e => { if (!help.contains(e.target)) help.open = false; });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && help.open) { help.open = false; help.querySelector('summary').focus(); }
  });
  help.querySelectorAll('.menu a').forEach(a => a.addEventListener('click', () => { help.open = false; }));
});
