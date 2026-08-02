// Initialize global navigation, layout structure, and theme toggling
export function initLayout() {
    // Add event listeners to switch between light and dark modes
    document.querySelectorAll('.light').forEach(btn =>
        btn.addEventListener('click', () => document.body.classList.remove('dark-mode'))
    );
    document.querySelectorAll('.dark').forEach(btn =>
        btn.addEventListener('click', () => document.body.classList.add('dark-mode'))
    );

    // Set up hamburger menu toggle for mobile view
    const hamburger = document.getElementById('hamburgerBtn');
    const sidebar = document.querySelector('.sidebar');

    if (hamburger && sidebar) {
        hamburger.addEventListener('click', () => {
            sidebar.style.display = sidebar.style.display === 'block' ? '' : 'block';
        });
        document.addEventListener('click', (e) => {
            if (sidebar.style.display === 'block' && !sidebar.contains(e.target) && e.target !== hamburger) {
                sidebar.style.display = '';
            }
        });
    }
}
