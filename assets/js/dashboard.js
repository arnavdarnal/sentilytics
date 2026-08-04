
// Initialize the dashboard interface and set up event listeners for file handling and analysis
export function initDashboard(uploadSection) {
    const MAX_FILES = 5;
    let uploadedFiles = [];

    // Cache DOM elements for file input, drop zone, upload button, and choose button
    const fileInput = document.getElementById('fileInput');
    const dropZone = document.querySelector('.drop-zone');
    const uploadBtn = document.querySelector('.btn[type="submit"]');
    const chooseBtn = document.querySelector('.choose-btn');

    // Create and configure dynamic elements for status, file lists, and results
    const statusEl = document.createElement('p');
    statusEl.className = 'status-msg';
    const fileListEl = document.createElement('div');
    fileListEl.className = 'file-list';
    const resultsEl = document.createElement('section');
    resultsEl.className = 'results-section';

    // Append the dynamic elements to their respective parent containers
    uploadSection.appendChild(statusEl);
    uploadSection.appendChild(fileListEl);

    const resultsContainer = document.querySelector('.result-container');
    if (resultsContainer) resultsContainer.appendChild(resultsEl);

    // Trigger file input click when drop zone or choose button is clicked
    if (dropZone && fileInput) {
        dropZone.addEventListener('click', () => fileInput.click());
    }

    // Rebind existing choose buttons to handle file input click events
    const chooseBtn = document.querySelector('.btn[onclick]');
    if (chooseBtn && fileInput) {
        chooseBtn.removeAttribute('onclick');
        chooseBtn.addEventListener('click', () => fileInput.click());
    }

    // Enable multiple file selection on the file input
    if (fileInput) {
        fileInput.setAttribute('multiple', '');
        fileInput.addEventListener('change', (e) => {
            addFiles(e.target.files);
            fileInput.value = '';
        });
    }

    // Configure the upload button to trigger analysis and hide it initially
    if (uploadBtn) {
        uploadBtn.type = 'button';
        uploadBtn.textContent = 'Analyze';
        uploadBtn.style.display = 'none';
        uploadBtn.addEventListener('click', runAnalysis);
    }

    // Set up drag-and-drop event listeners for the drop zone to handle file uploads
    if (dropZone) {
        dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragging'); });
        dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragging'));
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragging');
            addFiles(e.dataTransfer.files);
        });
    }

    // Validate and process newly added files, enforcing the maximum file limit and file type restrictions
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

        // Render the list of currently selected files in the UI
        function renderFileList() {
            if (uploadedFiles.length === 0) {
                fileListEl.innerHTML = '';
                if (uploadBtn) uploadBtn.style.display = 'none';
                return;
            }
        
            fileListEl.innerHTML = `<p>${uploadedFiles.length} / ${MAX_FILES} file(s) selected</p>`;
            
            uploadedFiles.forEach((f, i) => {
                const item = document.createElement('div');
                item.className = 'file-item';
                item.innerHTML = `<span>📄 ${f.name}</span>`;
        
                const btn = document.createElement('button');
                btn.textContent = '✕';
                btn.type = 'button';
                
                btn.addEventListener('click', () => {
                    uploadedFiles.splice(i, 1);
                    renderFileList();
                    resultsEl.innerHTML = '';
                });
                
                item.appendChild(btn);
                fileListEl.appendChild(item);
            });
            
            if (uploadBtn) uploadBtn.style.display = 'inline-block';
        }

        // Display status messages with appropriate styling and auto-clear after a timeout
        function showStatus(msg, type) {
            statusEl.textContent = msg;
            statusEl.className = 'status-msg ' + type;
            setTimeout(() => { statusEl.textContent = ''; statusEl.className = 'status-msg'; }, 4000);
        }

        // Clear the results section to prepare for new analysis output
        function clearResults() {
            resultsEl.innerHTML = '';
        }
    }
}

