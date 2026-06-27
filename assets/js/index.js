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

// ── Sentiment Word Lists ──────────────────────────────────────────────────────
const POSITIVE_WORDS = new Set([
  'good','great','excellent','amazing','wonderful','fantastic','outstanding',
  'positive','love','like','happy','joy','pleased','satisfied','best','better',
  'perfect','awesome','superb','brilliant','helpful','useful','effective',
  'efficient','impressive','remarkable','exceptional','beautiful','enjoy',
  'success','successful','win','winning','achieve','achievement','fortunate',
  'blessed','grateful','appreciate','valuable','improve','improvement',
  'beneficial','advantage','gain','progress','hope','hopeful','nice',
  'delightful','pleasant','bright','strong','powerful','innovative','creative',
  'inspiring','motivated','confident','clear','easy','friendly','generous',
  'kind','caring','cheerful','enthusiastic','exciting','interesting','fun',
  'laugh','smile','celebrate','reward','support','trust','reliable','honest',
  'fair','clean','fresh','safe','secure','free','fast','smart','clever',
  'wise','talented','skilled','professional','quality','agree','approve',
  'advance','thrive','flourish','energetic','dynamic','robust','solid'
]);

const NEGATIVE_WORDS = new Set([
  'bad','terrible','horrible','awful','poor','worst','negative','hate',
  'dislike','sad','unhappy','disappointed','fail','failure','lose','loss',
  'problem','issue','difficult','hard','struggle','pain','suffer','damage',
  'harm','hurt','wrong','error','mistake','broken','useless','ineffective',
  'weak','boring','frustrating','frustrated','frustration','disappointment',
  'unfortunate','regret','fear','worried','anxious','angry','annoying',
  'annoyed','dull','inadequate','inferior','dangerous','harmful','risky',
  'toxic','ugly','offensive','disturbing','corrupt','fault','flawed',
  'defective','incomplete','delay','slow','confusing','complex','complicated',
  'impossible','worthless','waste','wasteful','careless','negligent','lazy',
  'unfair','unjust','dishonest','unreliable','untrustworthy','crash','bug',
  'severe','critical','disaster','catastrophe','crisis','trouble','conflict',
  'dispute','violence','threat','danger','abuse','neglect','decline','drop',
  'fall','collapse','break','destroy','reject','refuse','deny','abandon'
]);

const NEGATORS = new Set([
  'not','no','never','neither','nor','nothing','nobody','nowhere',
  'hardly','barely','scarcely','without','lack','lacking'
]);

const INTENSIFIERS = new Set([
  'very','really','extremely','absolutely','completely','totally',
  'highly','incredibly','remarkably','exceptionally','so','quite'
]);

const STOP_WORDS = new Set([
  'the','a','an','and','or','but','in','on','at','to','for','of','with',
  'by','from','is','are','was','were','be','been','being','have','has',
  'had','do','does','did','will','would','could','should','may','might',
  'shall','can','that','this','these','those','it','its','he','she',
  'they','we','you','i','me','him','her','them','us','as','if','then',
  'than','so','yet','both','also','just','about','into','over','after'
]);

// ── Sentiment Analysis ────────────────────────────────────────────────────────
function analyzeSentiment(text) {
  const words = text.toLowerCase().match(/\b[a-z']+\b/g) || [];
  let posScore = 0, negScore = 0;

  for (let i = 0; i < words.length; i++) {
    const word  = words[i];
    const prev  = words[i - 1] || '';
    const prev2 = words[i - 2] || '';
    const isNegated  = NEGATORS.has(prev) || NEGATORS.has(prev2);
    const multiplier = (INTENSIFIERS.has(prev) || INTENSIFIERS.has(prev2)) ? 1.5 : 1;

    if (POSITIVE_WORDS.has(word)) {
      if (isNegated) negScore += multiplier; else posScore += multiplier;
    } else if (NEGATIVE_WORDS.has(word)) {
      if (isNegated) posScore += multiplier; else negScore += multiplier;
    }
  }

  const total   = words.length || 1;
  const posRaw  = posScore / total;
  const negRaw  = negScore / total;
  const neutRaw = Math.max(0, 1 - posRaw - negRaw);
  const sum     = posRaw + negRaw + neutRaw || 1;

  const positive = Math.round((posRaw  / sum) * 100);
  const negative = Math.round((negRaw  / sum) * 100);
  const neutral  = 100 - positive - negative;

  let label, score;
  if (posScore > negScore * 1.2)      { label = 'Positive'; score = positive; }
  else if (negScore > posScore * 1.2) { label = 'Negative'; score = negative; }
  else                                { label = 'Neutral';  score = neutral;  }

  return { label, score, positive, negative, neutral };
}

// ── Extractive Summarization ──────────────────────────────────────────────────
function summarizeText(text, maxSentences = 6) {
  const sentences = (text.match(/[^.!?\n]+[.!?]*/g) || [])
    .map(s => s.trim())
    .filter(s => s.split(/\s+/).length >= 5);

  if (sentences.length === 0)
    return text.trim().slice(0, 600) + (text.length > 600 ? '...' : '');
  if (sentences.length <= maxSentences) return sentences.join(' ');

  const freq = {};
  (text.toLowerCase().match(/\b[a-z]{3,}\b/g) || []).forEach(w => {
    if (!STOP_WORDS.has(w)) freq[w] = (freq[w] || 0) + 1;
  });

  const scored = sentences.map((sentence, idx) => {
    const sWords   = sentence.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
    const rawScore = sWords.reduce((sum, w) => sum + (freq[w] || 0), 0) / Math.max(sWords.length, 1);
    const posBias  = idx === 0 ? 1.5 : idx === sentences.length - 1 ? 1.1 : 1;
    return { sentence, score: rawScore * posBias, idx };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, maxSentences)
    .sort((a, b) => a.idx - b.idx)
    .map(s => s.sentence)
    .join(' ');
}

// ── Key Topics ────────────────────────────────────────────────────────────────
function extractTopics(text, count = 8) {
  const freq = {};
  (text.toLowerCase().match(/\b[a-z]{4,}\b/g) || []).forEach(w => {
    if (!STOP_WORDS.has(w)) freq[w] = (freq[w] || 0) + 1;
  });
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([word]) => word);
}

// ── Text Statistics ───────────────────────────────────────────────────────────
function textStats(text) {
  const words     = (text.match(/\b\w+\b/g) || []).length;
  const sentences = (text.match(/[^.!?]+[.!?]+/g) || []).length;
  const readMins  = Math.ceil(words / 200);
  return { words, sentences, readMins };
}

// ── File Upload & Analysis ────────────────────────────────────────────────────
const uploadSection = document.querySelector('.upload');
if (uploadSection) {

  const MAX_FILES = 5;
  let uploadedFiles = [];

  const fileInput = document.getElementById('fileInput');
  const dropZone  = document.querySelector('.drop-zone');
  const uploadBtn = document.querySelector('.btn[type="submit"]');

  if (fileInput) fileInput.setAttribute('multiple', '');

  if (uploadBtn) {
    uploadBtn.type        = 'button';
    uploadBtn.textContent = 'Analyze';
    uploadBtn.style.display = 'none';
    uploadBtn.addEventListener('click', runAnalysis);
  }

  const statusEl  = document.createElement('p');
  statusEl.className = 'status-msg';
  const fileListEl = document.createElement('div');
  fileListEl.className = 'file-list';
  const resultsEl = document.createElement('section');
  resultsEl.className = 'results-section';

  uploadSection.appendChild(statusEl);
  uploadSection.appendChild(fileListEl);
  uploadSection.insertAdjacentElement('afterend', resultsEl);

  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      addFiles(e.target.files);
      fileInput.value = '';
    });
  }

  if (dropZone) {
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragging'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragging'));
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('dragging');
      addFiles(e.dataTransfer.files);
    });
  }

  function addFiles(fileList) {
    const txtFiles = Array.from(fileList).filter(f => f.name.toLowerCase().endsWith('.txt'));
    if (txtFiles.length === 0) { showStatus('Only .txt files are supported.', 'error'); return; }

    const remaining = MAX_FILES - uploadedFiles.length;
    if (remaining <= 0) { showStatus('Maximum ' + MAX_FILES + ' files already selected.', 'error'); return; }
    if (txtFiles.length > remaining)
      showStatus('Only ' + remaining + ' more file(s) allowed. Extra files were skipped.', 'warn');

    uploadedFiles = [...uploadedFiles, ...txtFiles.slice(0, remaining)];
    renderFileList();
    clearResults();
  }

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
    fileListEl.innerHTML = `<p class="file-count">${uploadedFiles.length} / ${MAX_FILES} file(s) selected</p>${items}`;
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

  function clearResults() { resultsEl.innerHTML = ''; }

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

  function displayResults(results) {
    resultsEl.innerHTML = '<h2 class="results-title">📊 Analysis Results</h2>';
    results.forEach(({ name, sentiment, summary, topics, stats }) => {
      const color = sentiment.label === 'Positive' ? '#22c55e'
                  : sentiment.label === 'Negative' ? '#ef4444' : '#f59e0b';
      const emoji = { Positive: '😊', Negative: '😟', Neutral: '😐' }[sentiment.label];
      const topicTags = topics.map(t => `<span class="topic-tag">${t}</span>`).join('');

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

}
