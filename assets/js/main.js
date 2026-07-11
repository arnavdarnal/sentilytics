import {analyzeSentiment, summarizeText} from './inference.js';

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.light').forEach(btn =>
        btn.addEventListener('click', () => document.body.classList.remove('dark-mode'))
    );
    document.querySelectorAll('.dark').forEach(btn =>
        btn.addEventListener('click', () => document.body.classList.add('dark-mode'))
    );

    const hamburger = document.getElementById('hamburgerBtn');
    const sidebar = document.querySelector('.sidebar');

    if (hamburger && sidebar) {
        hambuger.addEventListener('click', () => {
            sidebar.style.display = sidebar.style.display === 'block' ? '' : 'block';
        });
        document.addEventListener('click', (e) => {
            if (sidebar.style.display === 'block' && !sidebar.contains(e.target) && e.target !== hamburger) {
                sidebar.style.display = '';
            }
        });
    }

    const uploadSection = document.querySelector('.upload');
    if (uploadSection) {
        initDashboard(uploadSection);
    }

    const registrationForm = document.querySelector('.form-box form');
    if (registrationForm) {
        initRegistrationForm(registrationForm);
    }

    const feedbackForm = document.querySelector('.feedback-card form');
    if (feedbackForm) {
        initFeedbackForm(feedbackForm);
    }
});

function initDashboard(uploadSection) {
    const MAX_FILES = 5;
    let uploadedFiles = [];

    const fileInput = document.getElementById('fileInput');
    const dropZone = document.querySelector('.drop-zone');
    const uploadBtn = document.querySelector('.btn[type="submit"]');

    if (dropZone && fileInput) {
        dropZone.addEventListener('click', () => fileInput.click());
    }

    const chooseBtn = document.querySelector('.btn[onclick]');
    if (chooseBtn && fileInput) {
        chooseBtn.removeAttribute('onclick');
        chooseBtn.addEventListener('click', () => fileInput.click());
    }

    if (fileInput) {
        fileInput.setAttribute('multiple', '');
    }

    if (uploadBtn) {
        uploadBtn.type = 'button';
        uploadBtn.textContent = 'Analyze';
        uploadBtn.style.display = 'none';
        uploadBtn.addEventListener('click', runAnalysis);
    }

    const statusEl = document.createElement('p');
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

    async function runAnalysis() {
        resultsEl.innerHTML = 'Processing files...';

        const updateProgress = (p) => {
            statusEl.textContent = `AI model loading: ${p}%`;
        };

        let combinedText = [];
        let results = [];

        for (const file of uploadedFiles) {
            const text = await file.text();
            combinedText.push(text);

            try {
                const sentiment = await analyzeSentiment(text, (p) => statusEl.textContent = `Analyzing: ${p}%`);
                results.push({ name: file.name, score: sentiment.score });
            } catch (err) {
                console.error(err);
                resultsEl.innerHTML = '<p>Failed to analyze sentiment for ${file.name}</p>';
            }
        }

        resultsEl.innerHTML = `
            <table id="sentimentTable" border="1">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>File</th>
                        <th id="sortScore" style="cursor:pointer;">Sentiment Score (Click to Sort)</th>
                    </tr>
                </thead>
                <tbody>
                    ${results.map((res, i) => `
                        <tr>
                            <td>${i + 1}</td>
                            <td>${res.name}</td>
                            <td class="score-val">${res.score}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>`;

        resultsEl.innerHTML += 'Generating collective summary...';

        try {
            const summary = await summarizeText(combinedText.join('\n\n'), (p) => statusEl.textContent = `Summarizing: ${p}%`);

            const summaryItem = document.createElement('div');
            summaryItem.className = 'result-item';
            summaryItem.innerHTML = `
                <h3>Combined Summary</h3>
                <p>${collectiveSummary}</p>
            `;
            resultsEl.appendChild(summaryItem);
        } catch (err) {
            console.error(err);
            resultsEl.innerHTML += `<p>Failed to generate collective summary.</p>`;
        }

        statusEl.textContent = 'Analysis complete.';
    }
    
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

        window.removeFile = function(index) {
            uploadedFiles.splice(index, 1);
            renderFileList();
            clearResults();
        }; 

        function renderFileList() {
            if (uploadedFiles.length === 0) {
                fileListEl.innerHTML = '';
                if (uploadBtn) {
                    uploadBtn.style.display = 'none';
                }
                return;
            }

            const items = uploadedFiles.map((f, i) => `
                <div class="file-item">
                    <span class="file-name">📄 ${f.name}</span>
                    <span class="file-size">${formatSize(f.size)}</span>
                    <button class="remove-btn" onclick="removeFile(${i})" title="Remove">✕</button>
                </div>`).join('');
            fileListEl.innerHTML = `<p class="file-count">${uploadedFiles.length} / ${MAX_FILES} file(s) selected</p>${items}`;
            if (uploadBtn) {
                uploadBtn.style.display = 'inline-block';
            }
        }

        function formatSize(bytes) {
            return bytes < 1024 ? bytes + ' B' : (bytes / 1024).toFixed(2) + ' KB';
        }

        function showStatus(msg, type) {
            statusEl.textContent = msg;
            statusEl.className = 'status-msg ' + type;
            setTimeout(() => { statusEl.textContent = ''; statusEl.className = 'status-msg'; }, 4000);
        }

        function clearResults() {
            resultsEl.innerHTML = '';
        }
    }
}

function initRegistrationForm(form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const [usernameInput, passwordInput, emailInput, dateInput] = form.querySelectorAll('input');

        if (usernameInput.value.trim().length < 3) {
            alert('Username must be at least 3 characters long.');
            return;
        }

        if (passwordInput.value.trim().length < 6) {
            alert('Password must be at least 6 characters long.');
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

function initFeedbackForm(form) {
    feedbackForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const inputs = feedbackForm.querySelectorAll('input, textarea');
        const name = inputs[0].value.trim();
        const email = inputs[1].value.trim();

        if (!name) {
            alert('Please enter your name.');
            return;
        }

        if (!email || !email.includes('@')) {
            alert('Please enter a valid email address.');
            return;
        }

        alert('Thank you for your feedback, ' + name + '!');
        feedbackForm.reset();
    });
}

