// ── Dark / Light Mode ────────────────────────────────────────────────────────
document.querySelectorAll('.light').forEach(btn =>
  btn.addEventListener('click', () => document.body.classList.remove('dark-mode'))
);
document.querySelectorAll('.dark').forEach(btn =>
  btn.addEventListener('click', () => document.body.classList.add('dark-mode'))
);

// ── Hamburger Menu (mobile) ──────────────────────────────────────────────────
const hamburger = document.getElementById('hamburgerBtn');
const sidebar   = document.querySelector('.sidebar');

if (hamburger && sidebar) {
  hamburger.addEventListener('click', () => {
    sidebar.style.display = sidebar.style.display === 'block' ? '' : 'block';
  });
  document.addEventListener('click', (e) => {
    if (sidebar.style.display === 'block'
        && !sidebar.contains(e.target)
        && e.target !== hamburger) {
      sidebar.style.display = '';
    }
  });
}
