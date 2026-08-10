// Fetch and inject HTML partials into the DOM
async function loadPartial(selector, filePath) {
  const element = document.querySelector(selector);
  if (!element) return;

  try {
    const response = await fetch(filePath);
    if (response.ok) {
      element.innerHTML = await response.text();
    } else {
      console.error(`Failed to load ${filePath}: ${response.status}`);
    }
  } catch (error) {
    console.error(`Error loading ${filePath}:`, error);
  }
}

// Helper function to update theme button visibility
function updateThemeButtons(isDark) {
  const lightBtns = document.querySelectorAll(".light");
  const darkBtns = document.querySelectorAll(".dark");

  lightBtns.forEach(
    (btn) => (btn.style.display = isDark ? "inline-block" : "none")
  );
  darkBtns.forEach(
    (btn) => (btn.style.display = isDark ? "none" : "inline-block")
  );
}

// Initialize layout components, theme, and toggles
export async function initLayout() {
  // Load partials first so buttons exist in DOM
  await loadPartial("#header", "partials/header.html");
  await loadPartial("#footer", "partials/footer.html");

  // Check initial theme state
  const isDark = localStorage.getItem("theme") === "dark";
  if (isDark) {
    document.body.classList.add("dark-mode");
  }
  updateThemeButtons(isDark);

  // Switch to Light Mode
  document.querySelectorAll(".light").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.body.classList.remove("dark-mode");
      localStorage.setItem("theme", "light");
      updateThemeButtons(false);
    });
  });

  // Switch to Dark Mode
  document.querySelectorAll(".dark").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.body.classList.add("dark-mode");
      localStorage.setItem("theme", "dark");
      updateThemeButtons(true);
    });
  });
}
