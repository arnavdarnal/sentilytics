# Sentilytics

![Status](https://img.shields.io/badge/Status-Archived-red?style=flat-square)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![Deployment](https://img.shields.io/badge/Deployment-GitHub%20Pages-blue?style=flat-square)](https://arnavdarnal.github.io/sentilytics/)
![Transformers.js](https://img.shields.io/badge/Transformers.js-Enabled-yellow?style=flat-square)
![Linter](https://img.shields.io/badge/Linter-ESLint-4B32C3?style=flat-square)
![Formatter](https://img.shields.io/badge/Formatter-Prettier-F7B93E?style=flat-square)

**Sentilytics** is a serverless web application for sentiment analysis and abstractive summarization. Users upload up to five `.txt` files and get instantaneous text insights generated entirely in the browser without page refreshes.

## 🎯 Key Features

- **Client-side sentiment analysis:** Classifies uploaded text as positive or negative using a pretrained DistilBERT model running locally in the browser.
- **Automatic summarization:** Generates a combined summary across all uploaded files using a pretrained DistilBART model, with long text automatically chunked and summarized in two passes for coherence.
- **Drag-and-drop file upload:** Supports up to five `.txt` files simultaneously, complete with validation and a live file list.
- **Sortable results:** Allows sentiment scores to be sorted in ascending or descending order by clicking the column header.
- **Completely client-side:** All processing happens on-device; uploaded text never leaves the user's browser.
- **Persistent theme toggle:** Automatically remembers user preference across sessions.

## 💻 Running Locally

This project is deployed and can be used without any local setup by visiting the live link via the badge above.

If you prefer to run it locally from a clone, please note that the application uses ES modules (`<script type="module">`), which modern browsers block from loading over the `file://` protocol. You must serve the folder using a local server instead of opening `index.html` directly.

```bash
npx serve docs
```

Alternatively, you can use any equivalent tool, such as the Live Server extension in VS Code.

## 📁 Repository Structure

- [`LICENSE`](LICENSE)
- [`README.md`](README.md)
- [`.gitignore`](.gitignore)
- [`.prettierignore`](.prettierignore)
- [`package.json`](package.json)
- [`package-lock.json`](package-lock.json)
- `.github/`
  - `workflows/`
    - [`lint.yaml`](.github/workflows/lint.yaml)
- `docs/`
  - [`index.html`](docs/index.html)
  - [`registration.html`](docs/registration.html)
  - [`team.html`](docs/team.html)
  - [`feedback.html`](docs/feedback.html)
  - [`404.html`](docs/404.html)
  - `partials/`
    - [`header.html`](docs/partials/header.html)
    - [`footer.html`](docs/partials/footer.html)
  - `assets/`
    - `css/`
      - [`styles.css`](docs/assets/css/styles.css)
    - `data/`
      - [`team.json`](docs/assets/data/team.json)
    - `img/`
    - `js/`
      - [`main.js`](docs/assets/js/main.js)
      - [`layout.js`](docs/assets/js/layout.js)
      - [`slider.js`](docs/assets/js/slider.js)
      - [`dashboard.js`](docs/assets/js/dashboard.js)
      - [`inference.js`](docs/assets/js/inference.js)
      - [`forms.js`](docs/assets/js/forms.js)
      - [`team.js`](docs/assets/js/team.js)

## 🏗️ System Architecture

- **Single entry point:** `main.js` serves as the central orchestration module that runs on every page, detects which page-specific elements are present in the DOM, and initializes only the relevant modules for that page.
- **Shared layout via partials:** `layout.js` fetches `header.html` and `footer.html` at runtime and injects them into every page, avoiding duplicated markup across the site.
- **Lazy-loaded AI pipeline:** `inference.js`, which loads the sentiment analysis and abstractive summarization models, is dynamically imported only when the user clicks `Analyze`, preventing unnecessary overhead on initial page load.
- **No backend integration:** All application state lives entirely in-memory for the duration of the session, with nothing being sent to or stored on a server.

## 🛠️ Tech Stack

### Core Libraries

- **[Transformers.js](https://huggingface.co/docs/transformers.js/index):** Runs Hugging Face machine learning models directly in the browser.
- **[jQuery](https://api.jquery.com/):** Simplifies DOM traversal, event handling, and AJAX.
- **[jQuery UI](https://api.jqueryui.com/):** Used exclusively for the datepicker widget.
- **[Font Awesome](https://docs.fontawesome.com/):** Provides scalable vector icons.

### Development Tooling

- **[ESLint](https://eslint.org/docs/latest/):** Finds and fixes errors, bugs, and bad practices in JavaScript.
- **[Prettier](https://prettier.io/docs/index.html):** Enforces consistent styling across the project.

## 📚 Academic Context

- **University:** [Pokhara University](https://pu.edu.np/)
- **Program:** [Bachelor of Computer System and Information Technology](https://pu.edu.np/blog/program/bachelor-of-computer-system-and-information-technology-bcsit/) (BCSIT)
- **Course:** PRJ 181

## 👥 Authors

- **[Abhilasha Ghimire](https://github.com/ghimireabhi16)** – Built the central orchestration module (`main.js`), the theme toggle (`layout.js`), the file upload and dashboard logic (`dashboard.js`), and the form validation logic (`forms.js`).
- **[Arnav Darnal](https://github.com/arnavdarnal)** – Built the sentiment analysis and summarization pipeline (`inference.js`), configured ESLint and Prettier, and curated team data (`team.json`).
- **[Arya Poudel](https://github.com/aryayayaya1234-rgb)** – Built the HTML structure and CSS styling across the site.
- **[Shristi Rimal](https://github.com/shristi-rimal)** – Built the HTML partial loading system (`layout.js`), the hero slider (`slider.js`), the analysis flow and the sortable results table (`dashboard.js`), the team grid (`team.js`), and the jQuery UI datepicker (`forms.js`).
