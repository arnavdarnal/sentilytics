// Initialize the dashboard interface and set up event listeners for file handling and analysis
export function initDashboard(uploadSection) {
  const MAX_FILES = 5;
  let uploadedFiles = [];

  // Cache DOM elements for file input, drop zone, upload button, and choose button
  const fileInput = document.getElementById("fileInput");
  const dropZone = document.querySelector(".drop-zone");
  const uploadBtn = document.querySelector('.btn[type="submit"]');

  const $resultsSection = $("#resultSection");
  const $uploadSection = $("#uploadSection");

  // Hide the results section initially
  $resultsSection.hide();

  // Create and configure dynamic elements for status, file lists, and results
  const statusEl = document.createElement("p");
  statusEl.className = "status-msg";
  const fileListEl = document.createElement("div");
  fileListEl.className = "file-list";
  const resultsEl = document.createElement("section");
  resultsEl.className = "results-section";

  // Append the dynamic elements to their respective parent containers
  document.querySelector(".container").appendChild(statusEl);
  uploadSection.appendChild(fileListEl);

  $resultsSection.append(resultsEl);

  // Handle reset functionality when the user clicks the "Analyze More" button
  $resultsSection.on("click", "#analyzeMoreBtn", function (e) {
    uploadedFiles = [];
    fileListEl.innerHTML = "";
    if (fileInput) fileInput.value = "";
    if (uploadBtn) uploadBtn.style.display = "none";
    statusEl.textContent = "";
    resultsEl.innerHTML = "";

    $resultsSection.hide();
    $uploadSection.show();
  });

  // Trigger file input click when drop zone or choose button is clicked
  if (dropZone && fileInput) {
    dropZone.addEventListener("click", () => fileInput.click());
  }

  // Rebind existing choose buttons to handle file input click events
  const chooseBtn = document.querySelector(".btn[onclick]");
  if (chooseBtn && fileInput) {
    chooseBtn.removeAttribute("onclick");
    chooseBtn.addEventListener("click", () => fileInput.click());
  }

  // Enable multiple file selection on the file input
  if (fileInput) {
    fileInput.setAttribute("multiple", "");
    fileInput.addEventListener("change", (e) => {
      addFiles(e.target.files);
      fileInput.value = "";
    });
  }

  // Configure the upload button to trigger analysis and hide it initially
  if (uploadBtn) {
    uploadBtn.type = "button";
    uploadBtn.textContent = "Analyze";
    uploadBtn.style.display = "none";
    uploadBtn.addEventListener("click", runAnalysis);
  }

  // Ensure the results section has a placeholder if no children exist
  if ($resultsSection.children().length === 0) {
    $resultsSection.append("");
  }

  // Set up drag-and-drop event listeners for the drop zone to handle file uploads
  if (dropZone) {
    dropZone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropZone.classList.add("dragging");
    });
    dropZone.addEventListener("dragleave", () =>
      dropZone.classList.remove("dragging")
    );
    dropZone.addEventListener("drop", (e) => {
      e.preventDefault();
      dropZone.classList.remove("dragging");
      addFiles(e.dataTransfer.files);
    });
  }

  // Execute the analysis pipeline for all uploaded files concurrently
  async function runAnalysis() {
    $uploadSection.hide();
    $resultsSection.show();

    resultsEl.innerHTML = '<p class="status-msg" id="analysisStatus"></p>';
    const analysisStatusEl = document.getElementById("analysisStatus");

    analysisStatusEl.textContent = "Loading AI model...";
    const { analyzeSentiment, summarizeText } = await import("./inference.js");

    // Update progress status during analysis
    const updateProgress = (p) => {
      analysisStatusEl.textContent = `AI model loading: ${p}%`;
    };

    const updateSummaryStatus = (msg) => {
      analysisStatusEl.textContent = msg;
    };

    let combinedText = [];
    let sentimentResults = [];
    let sentimentFailures = [];

    // Map each file to an asynchronous sentiment analysis task
    const analysisPromises = uploadedFiles.map(async (file) => {
      let text;
      try {
        text = await file.text();
      } catch (readErr) {
        console.error(`Could not read file text for ${file.name}`);
        sentimentFailures.push(file.name);
        return;
      }

      combinedText.push(text);

      try {
        const sentiment = await analyzeSentiment(text, updateProgress);

        if (sentiment.label === "error") {
          sentimentFailures.push(file.name);
        } else {
          sentimentResults.push({
            name: file.name,
            positive: sentiment.positive,
            negative: sentiment.negative,
          });
        }
      } catch (err) {
        console.error(`Sentiment analysis failed for ${file.name}:`, err);
        sentimentFailures.push(file.name);
      }
    });

    // Wait for all sentiment analysis tasks to complete before proceeding
    await Promise.all(analysisPromises);

    let collectiveSummary = null;
    let summaryFailed = false;

    // Generate a collective summary if there is any text to summarize
    if (combinedText.length > 0) {
      try {
        analysisStatusEl.textContent = "Generating summary...";
        collectiveSummary = await summarizeText(
          combinedText.join("\n\n"),
          updateProgress,
          updateSummaryStatus
        );
        if (
          !collectiveSummary ||
          collectiveSummary.startsWith("Failed") ||
          collectiveSummary.startsWith("No text")
        ) {
          summaryFailed = true;
        }
      } catch (err) {
        console.error("Summary generation failed:", err);
        summaryFailed = true;
      }
    } else {
      summaryFailed = true;
    }

    // Handle total failure case where neither sentiment scores nor summary could be generated
    if (sentimentResults.length === 0 && summaryFailed) {
      resultsEl.innerHTML = `
                <div class="error-message">
                    <p>The analysis pipeline failed. Neither sentiment scores nor the summary could be generated.</p>
                </div>
            `;
      return;
    }

    let htmlContent = "";

    // Display sentiment scores in a sortable table if any results were generated
    if (sentimentResults.length > 0) {
      htmlContent += `
                <div class="result-item">
                    <h3>Sentiment Scores</h3>
                    <table id="sentimentTable">
                        <thead>
                            <tr>
                                <th>SN</th>
                                <th>File</th>
                                    <th id="sortScore">Positive ▲</th>
                                <th>Negative</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${sentimentResults
                              .map(
                                (res, i) => `
                                <tr>
                                    <td>${i + 1}</td>
                                    <td>${res.name}</td>
                                    <td class="score-val">${res.positive}</td>
                                    <td>${res.negative}</td>
                                </tr>
                            `
                              )
                              .join("")}
                        </tbody>
                    </table>
                </div>
            `;
    }

    // Append an error note for any files that failed to generate sentiment scores
    if (sentimentFailures.length > 0) {
      htmlContent += `
                <div class="error-note">
                    <p><strong>Note:</strong> Could not generate sentiment scores for the following file(s): ${sentimentFailures.join(", ")}</p>
                </div>
            `;
    }

    // Append the collective summary to the results if it was successfully generated, otherwise display an error note
    if (!summaryFailed && collectiveSummary) {
      htmlContent += `
                <div class="result-item">
                    <h3>Combined Summary</h3>
                    <p>${collectiveSummary}</p>
                </div>
            `;
    } else {
      htmlContent += `
                <div class="error-note">
                    <p><strong>Note:</strong> Failed to generate collective summary.</p>
                </div>
            `;
    }

    htmlContent += `
            <button id="analyzeMoreBtn" class="btn">Analyze More Files</button>
        `;

    resultsEl.innerHTML = htmlContent;

    // Set up sorting functionality for the sentiment score table
    let sortAscending = true;
    $("#sortScore")
      .off("click")
      .on("click", function () {
        const $tbody = $("#sentimentTable tbody");
        const $rows = $tbody.find("tr").toArray();

        $rows.sort((a, b) => {
          const scoreA = parseFloat($(a).find(".score-val").text());
          const scoreB = parseFloat($(b).find(".score-val").text());

          return sortAscending ? scoreA - scoreB : scoreB - scoreA;
        });

        sortAscending = !sortAscending;
        $(this).text(`Positive ${sortAscending ? "▲" : "▼"}`);

        $tbody.empty();
        $rows.forEach((row, index) => {
          $(row)
            .find("td")
            .first()
            .text(index + 1);
          $tbody.append(row);
        });
      });
  }

  // Validate and process newly added files, enforcing the maximum file limit and file type restrictions
  function addFiles(fileList) {
    const txtFiles = Array.from(fileList).filter((f) =>
      f.name.toLowerCase().endsWith(".txt")
    );
    if (txtFiles.length === 0) {
      showStatus("Only .txt files are supported.", "error");
      return;
    }

    const remaining = MAX_FILES - uploadedFiles.length;
    if (remaining <= 0) {
      showStatus("Maximum " + MAX_FILES + " files already selected.", "error");
      return;
    }

    if (txtFiles.length > remaining) {
      showStatus(
        "Only " +
          remaining +
          " more file(s) allowed. Extra files were skipped.",
        "warn"
      );
    }

    uploadedFiles = [...uploadedFiles, ...txtFiles.slice(0, remaining)];
    renderFileList();
    clearResults();

    // Render the list of currently selected files in the UI
    function renderFileList() {
      if (uploadedFiles.length === 0) {
        fileListEl.innerHTML = "";
        if (uploadBtn) uploadBtn.style.display = "none";
        return;
      }

      fileListEl.innerHTML = `<p>${uploadedFiles.length} / ${MAX_FILES} file(s) selected</p>`;

      uploadedFiles.forEach((f, i) => {
        const item = document.createElement("div");
        item.className = "file-item";
        item.innerHTML = `<span>📄 ${f.name}</span>`;

        const btn = document.createElement("button");
        btn.textContent = "✕";
        btn.type = "button";

        btn.addEventListener("click", () => {
          uploadedFiles.splice(i, 1);
          renderFileList();
          resultsEl.innerHTML = "";
        });

        item.appendChild(btn);
        fileListEl.appendChild(item);
      });

      if (uploadBtn) uploadBtn.style.display = "inline-block";
    }

    // Display status messages with appropriate styling and auto-clear after a timeout
    function showStatus(msg, type) {
      statusEl.textContent = msg;
      statusEl.className = "status-msg " + type;
      setTimeout(() => {
        statusEl.textContent = "";
        statusEl.className = "status-msg";
      }, 4000);
    }

    // Clear the results section to prepare for new analysis output
    function clearResults() {
      resultsEl.innerHTML = "";
    }
  }
}
