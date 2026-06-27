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

// ── Registration Form Validation ──────────────────────────────────────────────
const form = document.querySelector('.form-box form');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const [usernameInput, passwordInput, emailInput, dateInput] = form.querySelectorAll('input');

    if (usernameInput.value.trim().length < 3) {
      alert('Username must be at least 3 characters.');
      return;
    }
    if (passwordInput.value.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }
    if (!emailInput.value.includes('@')) {
      alert('Please enter a valid email address.');
      return;
    }
    if (!dateInput.value) {
      alert('Please enter your date of birth.');
      return;
    }

    alert('Registration successful! Welcome to Sentilytics.');
    form.reset();
  });
}
