// ── Dark / Light Mode ────────────────────────────────────────────────────────
document.querySelectorAll('.light').forEach(btn =>
  btn.addEventListener('click', () => document.body.classList.remove('dark-mode'))
);
document.querySelectorAll('.dark').forEach(btn =>
  btn.addEventListener('click', () => document.body.classList.add('dark-mode'))
);

// ── Hamburger Menu (mobile) ──────────────────────────────────────────────────
const hamburger = document.getElementById('menuBtn');
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

// ── Feedback Form Submission ──────────────────────────────────────────────────
const feedbackForm = document.querySelector('.feedback-card form');
if (feedbackForm) {
  feedbackForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const inputs   = feedbackForm.querySelectorAll('input');
    const textarea = feedbackForm.querySelector('textarea');

    const name  = inputs[0].value.trim();
    const email = inputs[1].value.trim();

    if (!name) { alert('Please enter your name.'); return; }
    if (!email.includes('@')) { alert('Please enter a valid email address.'); return; }

    alert('Thank you for your feedback, ' + name + '! We appreciate it.');
    feedbackForm.reset();
  });
}
