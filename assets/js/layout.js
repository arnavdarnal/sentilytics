// Helper function to fetch and inject HTML partials into the DOM
async function loadPartial(selector, filePath) {
    const element = document.querySelector(selector);
    if (element) {
        try {
            const response = await fetch(filePath);
            if (response.ok) {
                element.innerHTML = await response.text();
            }
        } catch (error) {
            console.error(`Failed to load partial from ${filePath}:`, error);
        }
    }
}

// Initialize global navigation, layout structure, and theme toggling
export async function  initLayout() {
     // Load header and footer partials asynchronously
    await loadPartial('#header', '../..partials/header.html');
    await loadPartial('#footer', '../..partials/footer.html');
    
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
