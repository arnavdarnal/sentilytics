import {pipeline} from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.3.0/dist/transformers.min.js';

// Global variables to cache pipeline promises
let sentimentPromise = null;
let summarizerPromise = null;

// Retrieve or initialize the sentiment analysis pipeline
async function getSentimentPipeline(onProgress) {
    // Initialize the sentiment analysis pipeline if it hasn't been created yet
    if (!sentimentPromise) {
        let maxProgress = 0;
        sentimentPromise = pipeline('sentiment-analysis', 'Xenova/distilbert-base-uncased-finetuned-sst-2-english', {
            // Callback function to track progress of the pipeline loading
            progress_callback: (data) => {
                if (data.status === 'progress' && typeof onProgress === 'function') {
                    maxProgress = Math.max(maxProgress, data.progress);
                    onProgress(Math.round(maxProgress));
                }
            }
        });
    }
    return sentimentPromise;
}

// Retrieve or initialize the text summarization pipeline
async function getSummarizerPipeline(onProgress) {
    // Initialize the text summarization pipeline if it hasn't been created yet
    if (!summarizerPromise) {
        let maxProgress = 0;
        summarizerPromise = pipeline('summarization', 'Xenova/distilbart-cnn-6-6', {
            // Callback function to track progress of the pipeline loading
            progress_callback: (data) => {
                if (data.status === 'progress' && typeof onProgress === 'function') {
                    maxProgress = Math.max(maxProgress, data.progress);
                    onProgress(Math.round(maxProgress));
                }
            }
        });
    }
    return summarizerPromise;
}

// Analyze the emotional sentiment of the provided text
export async function analyzeSentiment(text, onProgress) {
    // Validate that input text exists and is a string
    if (!text || typeof text !== 'string') {
        return {label: 'Error', score: 0, positive: 0, negative: 0};
    }

    try {
        // Await the sentiment pipeline and run analysis on the text
        const pipe = await getSentimentPipeline(onProgress);
        const result = await pipe(text);

        const rawLabel = result[0].label;
        const rawScore = result[0].score;

        // Normalize label casing (e.g., 'POSITIVE' or 'positive' to 'Positive')
        const label = rawLabel.charAt(0).toUpperCase() + rawLabel.slice(1).toLowerCase();
        // Convert confidence score to a percentage and round it
        const displayScore = Math.round(rawScore * 100);

        // Format and return the sentiment analysis result with positive and negative scores
        return {
            label: label,
            score: displayScore,
            positive: label === 'Positive' ? displayScore : 100 - displayScore,
            negative: label === 'Negative' ? displayScore : 100 - displayScore,
        };
    } catch (error) {
        console.error("Sentiment Pipeline Error:", error);
        // Fall back to a default error response if the pipeline fails
        return {label: 'Error', score: 0, positive: 0, negative: 0};
    }
}

// Split large blocks of text into smaller word-count chunks for processing
function chunkText(text, maxWords = 700) {
    // Split the text into an array of words based on whitespace
    const words = text.split(/\s+/).filter(Boolean);
    const chunks = [];
    // Loop through words and slice them into chunks of the specified maximum length
    for (let i = 0; i < words.length; i += maxWords) {
        chunks.push(words.slice(i, i + maxWords).join(' '));
    }
    return chunks;
}

// Generate a condensed summary of the provided text
export async function summarizeText(text, onProgress, onStatus) {
    // Validate that input text exists and is a string
    if (!text || typeof text !== 'string') {
        return "No text provided for summarization.";
    }

    // Ensure text is long enough to warrant a summary
    if (text.split(/\s+/).filter(Boolean).length < 50) {
        return "The text is too short to generate a meaningful summary.";
    }
 
    try {
        // Load the summarization pipeline and split the input text into chunks
        const pipe = await getSummarizerPipeline(onProgress);
        const chunks = chunkText(text);
 
        // Iterate through each chunk to generate individual summaries
        const chunkSummaries = [];
        for (let i = 0; i < chunks.length; i++) {
            // Report current status update if the callback function is provided
            if (typeof onStatus === 'function') {
                onStatus(`Summarizing part ${i + 1} of ${chunks.length}...`);
            }
            // Summarize the current chunk with a token limit
            const chunkResult = await pipe(chunks[i], { max_new_tokens: 150 });
            chunkSummaries.push(chunkResult[0].summary_text);
        }
 
        // Return the single chunk summary directly if only one chunk exists
        if (chunkSummaries.length === 1) {
            return chunkSummaries[0];
        }
 
        // Combine multiple chunk summaries into a single string
        const combinedSummaries = chunkSummaries.join(' ');
 
        // Return combined summaries directly if they remain under the minimum length threshold
        if (combinedSummaries.split(/\s+/).filter(Boolean).length < 50) {
            return combinedSummaries;
        }
 
        // Report status update before running a final meta-summary pass
        if (typeof onStatus === 'function') {
            onStatus('Combining summaries...');
        }
 
        // Generate and return the final concise summary from the combined chunk summaries
        const finalResult = await pipe(combinedSummaries, { max_new_tokens: 200 });
        return finalResult[0].summary_text;
    } catch (error) {
        console.error("Summarizer Pipeline Error:", error);
        // Fall back to a default error message if summarization fails
        return "Failed to generate summary.";
    }
}
