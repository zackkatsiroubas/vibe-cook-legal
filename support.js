// Tabs for the three question groups. Without JavaScript every group simply shows.
const tabs = [...document.querySelectorAll('.tab')];
function pick(tab, byUser) {
  tabs.forEach(t => {
    const on = t === tab;
    t.setAttribute('aria-selected', on);
    t.tabIndex = on ? 0 : -1;
    document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
  });
  if (!byUser) return;
  tab.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  history.replaceState(null, '', '#' + tab.getAttribute('aria-controls'));
}
tabs.forEach((t, i) => {
  t.addEventListener('click', () => pick(t, true));
  t.addEventListener('keydown', e => {
    const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    const next = tabs[(i + step + tabs.length) % tabs.length];
    pick(next, true); next.focus();
  });
});
// Open the group named in the link (support.html#account), or the first one.
pick(tabs.find(t => '#' + t.getAttribute('aria-controls') === location.hash) || tabs[0]);
if (location.hash === '#contact') document.getElementById('contact').scrollIntoView();
