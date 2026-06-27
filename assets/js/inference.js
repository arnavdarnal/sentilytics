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
    if (!summarizerPromise) {
        let maxProgress = 0;
        summarizerPromise = pipeline('summarization', 'Xenova/distilbart-cnn-6-6', {
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
    if (!text || typeof text !== 'string') {
        return {label: 'Error', score: 0, positive: 0, negative: 0};
    }

    try {
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

// Generate a condensed summary of the provided text
export async function summarizeText(text, onProgress) {
    if (!text || typeof text !== 'string') {
        return "No text provided for summarization.";
    }

    // Skip processing if the text is too short to summarize
    if (text.split(/\s+/).length < 50) {
        return "The text is too short to generate a meaningful summary.";
    }

    try {
        const pipe = await getSummarizerPipeline(onProgress);

        const result = await pipe(text, {
            // Restrict the summary to roughly 150 words
            max_new_tokens: 200,
            // Break the text into chunks of 512 tokens for processing
            chunk_length: 512,
            // Overlap between chunks to maintain context
            stride: 64
        });

        return result[0].summary_text;
    } catch (error) {
        console.error("Summarizer Pipeline Error:", error);
        return "Failed to generate summary."
    }
}
