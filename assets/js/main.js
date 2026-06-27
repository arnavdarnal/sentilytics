// ── Dark / Light Mode ────────────────────────────────────────────────────────
document.querySelectorAll('.light').forEach(btn =>
  btn.addEventListener('click', () => document.body.classList.remove('dark-mode'))
);
document.querySelectorAll('.dark').forEach(btn =>
  btn.addEventListener('click', () => document.body.classList.add('dark-mode'))
);

// ── Hamburger Menu (mobile) ──────────────────────────────────────────────────
const hamburger = document.getElementById('hamburgerBtn') || document.getElementById('menuBtn');
const sidebar   = document.querySelector('.sidebar');

if (hamburger && sidebar) {
  hamburger.addEventListener('click', () => {
    // Toggle inline display so it overrides the CSS display:none on mobile
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

// ── File Upload ──────────────────────────────────────────────────────────────
// Only runs on the Dashboard page (upload section must exist)
const uploadSection = document.querySelector('.upload');
if (uploadSection) {

  const MAX_FILES = 5;
  let uploadedFiles = [];

  // Grab elements from the friends' HTML
  const fileInput  = document.getElementById('fileInput'); // browser picks first of the two
  const dropZone   = document.querySelector('.drop-zone');
  const uploadBtn  = document.querySelector('.btn[type="submit"]'); // "Upload" button

  // Enable picking multiple files at once
  if (fileInput) fileInput.setAttribute('multiple', '');

  // Repurpose the "Upload" button as the "Analyze" trigger
  if (uploadBtn) {
    uploadBtn.type        = 'button';
    uploadBtn.textContent = 'Analyze';
    uploadBtn.style.display = 'none'; // hidden until files are selected
    uploadBtn.addEventListener('click', runAnalysis);
  }

  // ── Dynamically inject status, file list, and results elements ──
  const statusEl = document.createElement('p');
  statusEl.className = 'status-msg';

  const fileListEl = document.createElement('div');
  fileListEl.className = 'file-list';

  const resultsEl = document.createElement('section');
  resultsEl.className = 'results-section';

  // Append status + file list inside the upload section, results after it
  uploadSection.appendChild(statusEl);
  uploadSection.appendChild(fileListEl);
  uploadSection.insertAdjacentElement('afterend', resultsEl);

  // ── File input change (handles both click-to-browse buttons) ──
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      addFiles(e.target.files);
      fileInput.value = ''; // allow re-selecting the same file after removal
    });
  }

  // ── Drag & drop ──
  if (dropZone) {
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('dragging');
    });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragging'));
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('dragging');
      addFiles(e.dataTransfer.files);
    });
  }

  // ── File management ──
  function addFiles(fileList) {
    const txtFiles = Array.from(fileList).filter(f => f.name.toLowerCase().endsWith('.txt'));

    if (txtFiles.length === 0) {
      showStatus('Only .txt files are supported.', 'error');
      return;
    }

    const remaining = MAX_FILES - uploadedFiles.length;
    if (remaining <= 0) {
      showStatus('Maximum ' + MAX_FILES + ' files already selected.', 'error');
      return;
    }
    if (txtFiles.length > remaining) {
      showStatus('Only ' + remaining + ' more file(s) allowed. Extra files were skipped.', 'warn');
    }

    uploadedFiles = [...uploadedFiles, ...txtFiles.slice(0, remaining)];
    renderFileList();
    clearResults();
  }

  // Exposed globally so inline onclick="removeFile(i)" in injected HTML works
  window.removeFile = function(index) {
    uploadedFiles.splice(index, 1);
    renderFileList();
    clearResults();
  };

  function renderFileList() {
    if (uploadedFiles.length === 0) {
      fileListEl.innerHTML = '';
      if (uploadBtn) uploadBtn.style.display = 'none';
      return;
    }

    const items = uploadedFiles.map((f, i) => `
      <div class="file-item">
        <span class="file-name">📄 ${f.name}</span>
        <span class="file-size">${formatSize(f.size)}</span>
        <button class="remove-btn" onclick="removeFile(${i})" title="Remove">✕</button>
      </div>`).join('');

    fileListEl.innerHTML =
      `<p class="file-count">${uploadedFiles.length} / ${MAX_FILES} file(s) selected</p>${items}`;

    if (uploadBtn) uploadBtn.style.display = 'inline-block';
  }

  function formatSize(bytes) {
    return bytes < 1024 ? bytes + ' B' : (bytes / 1024).toFixed(1) + ' KB';
  }

  function showStatus(msg, type) {
    statusEl.textContent = msg;
    statusEl.className   = 'status-msg ' + type;
    setTimeout(() => { statusEl.textContent = ''; statusEl.className = 'status-msg'; }, 4000);
  }

  function clearResults() {
    resultsEl.innerHTML = '';
  }

  // ── Analysis ──────────────────────────────────────────────────────────────
  async function runAnalysis() {
    if (uploadedFiles.length === 0) return;

    if (uploadBtn) { uploadBtn.textContent = 'Analyzing…'; uploadBtn.disabled = true; }

    const results = [];
    for (const file of uploadedFiles) {
      const text      = await readFile(file);
      const sentiment = analyzeSentiment(text);
      const summary   = summarizeText(text, 6);
      const topics    = extractTopics(text, 8);
      const stats     = textStats(text);
      results.push({ name: file.name, sentiment, summary, topics, stats });
    }

    displayResults(results);
    if (uploadBtn) { uploadBtn.textContent = 'Analyze'; uploadBtn.disabled = false; }
  }

  function readFile(file) {
    return new Promise((resolve, reject) => {
      const reader   = new FileReader();
      reader.onload  = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  // ── Results Display ────────────────────────────────────────────────────────
  function displayResults(results) {
    resultsEl.innerHTML = '<h2 class="results-title">📊 Analysis Results</h2>';

    results.forEach(({ name, sentiment, summary, topics, stats }) => {
      const color = sentiment.label === 'Positive' ? '#22c55e'
                  : sentiment.label === 'Negative' ? '#ef4444' : '#f59e0b';
      const emoji = { Positive: '😊', Negative: '😟', Neutral: '😐' }[sentiment.label];

      const topicTags = topics.map(t =>
        `<span class="topic-tag">${t}</span>`).join('');

      const card = document.createElement('div');
      card.className = 'result-card';
      card.innerHTML = `
        <div class="result-header">
          <span class="result-filename">📄 ${name}</span>
          <span class="sentiment-badge" style="background:${color}">${emoji} ${sentiment.label} ${sentiment.score}%</span>
        </div>

        <div class="stats-row">
          <span>📝 ${stats.words} words</span>
          <span>🔤 ${stats.sentences} sentences</span>
          <span>⏱ ~${stats.readMins} min read</span>
        </div>

        <div class="sentiment-bars">
          ${bar('Positive', sentiment.positive, '#22c55e')}
          ${bar('Negative', sentiment.negative, '#ef4444')}
          ${bar('Neutral',  sentiment.neutral,  '#f59e0b')}
        </div>

        <div class="summary-box">
          <h4>📝 Summary</h4>
          <p>${summary}</p>
        </div>

        <div class="topics-box">
          <h4>🔑 Key Topics</h4>
          <div class="topics-list">${topicTags}</div>
        </div>`;
      resultsEl.appendChild(card);
    });

    resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function bar(label, pct, color) {
    return `<div class="bar-row">
      <span class="bar-label">${label}</span>
      <div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:${color}"></div></div>
      <span class="bar-pct">${pct}%</span>
    </div>`;
  }

} // end uploadSection guard
