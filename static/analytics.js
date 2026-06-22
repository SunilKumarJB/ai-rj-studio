document.addEventListener('DOMContentLoaded', () => {
    const analyticsForm = document.getElementById('analytics-form');
    const idleStage = document.getElementById('idle-stage');
    const loadingStage = document.getElementById('loading-stage');
    const outputStage = document.getElementById('output-stage');
    
    const reportTitle = document.getElementById('show-report-title');
    const reportSummary = document.getElementById('report-summary');
    const metricFlowScore = document.getElementById('metric-flow-score');
    const barFlowScore = document.getElementById('bar-flow-score');
    const metricPace = document.getElementById('metric-pace');
    const metricEnergy = document.getElementById('metric-energy');
    const metricSentiment = document.getElementById('metric-sentiment');
    
    const topicsList = document.getElementById('report-topics-list');
    const playlistList = document.getElementById('report-playlist-list');
    const insightsList = document.getElementById('report-insights-list');
    const analyzeBtn = document.getElementById('analyze-btn');

    function switchStage(stage) {
        idleStage.style.display = 'none';
        loadingStage.style.display = 'none';
        outputStage.style.display = 'none';
        
        if (stage === outputStage) {
            stage.style.display = 'flex';
        } else {
            stage.style.display = 'flex';
        }
    }

    analyticsForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const fileInput = document.getElementById('audio-file');
        const gcsPath = document.getElementById('gcs-path').value.trim();
        const youtubeLink = document.getElementById('youtube-link').value.trim();

        // Validate that at least one input option is provided
        if (fileInput.files.length === 0 && !gcsPath && !youtubeLink) {
            alert('Please provide at least one input: Upload a local file, specify a Google Cloud Storage (GCS) bucket path, or paste a YouTube stream URL.');
            return;
        }

        // Disable button and transition to loading spinner
        analyzeBtn.disabled = true;
        switchStage(loadingStage);

        // Build Multipart Form Data
        const formData = new FormData();
        if (fileInput.files.length > 0) {
            formData.append('file', fileInput.files[0]);
        }
        formData.append('gcs_path', gcsPath);
        formData.append('youtube_link', youtubeLink);

        try {
            const response = await fetch('/analyze-audio', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Ingestion/Analysis failed');
            }

            const data = await response.json();

            // 1. Populate Overview Info
            reportTitle.textContent = `Show Report: ${data.show_title || 'Ingested Stream Analysis'}`;
            reportSummary.textContent = data.show_summary || 'No executive summary generated.';

            // 2. Populate KPI Metric scores
            const flowScore = data.metrics.flow_score || 85;
            metricFlowScore.textContent = flowScore;
            barFlowScore.style.width = `${flowScore}%`;
            metricPace.textContent = `${data.metrics.pace_wpm || 130} WPM`;
            metricEnergy.textContent = `${data.metrics.energy_score || 80}%`;
            metricSentiment.textContent = data.metrics.sentiment || 'Balanced / Conversational';

            // 3. Populate Segments / Topics Timeline
            topicsList.innerHTML = '';
            data.topics.forEach((topic) => {
                const li = document.createElement('li');
                li.className = 'song-card';
                li.style.justifyContent = 'space-between';
                li.style.alignItems = 'center';

                let badgeColor = '#a855f7'; // Purple standard
                if (topic.sentiment.toLowerCase().includes('pos') || topic.sentiment.toLowerCase().includes('high')) {
                    badgeColor = '#10b981'; // Green positive
                } else if (topic.sentiment.toLowerCase().includes('calm') || topic.sentiment.toLowerCase().includes('sooth')) {
                    badgeColor = '#3b82f6'; // Blue calm
                }

                li.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 0.8rem;">
                        <ion-icon name="time-outline" style="color: var(--primary-color); font-size: 1.3rem;"></ion-icon>
                        <div style="display: flex; flex-direction: column; gap: 0.2rem;">
                            <h5 style="color: #fff; font-size: 0.95rem; font-weight: 600;">${topic.topic}</h5>
                            <span style="color: var(--text-sub); font-size: 0.8rem;">Duration: ${topic.duration}</span>
                        </div>
                    </div>
                    <span style="background: rgba(255, 255, 255, 0.05); color: ${badgeColor}; font-size: 0.75rem; font-weight: 600; padding: 0.3rem 0.6rem; border-radius: 50px; border: 1px solid ${badgeColor}44;">
                        ${topic.sentiment}
                    </span>
                `;
                topicsList.appendChild(li);
            });

            // 4. Populate Playlist Coherence list
            playlistList.innerHTML = '';
            data.song_alignment.forEach((song) => {
                const li = document.createElement('li');
                li.className = 'song-card';
                li.style.flexDirection = 'column';
                li.style.alignItems = 'stretch';
                li.style.gap = '0.5rem';

                li.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="display: flex; align-items: center; gap: 0.8rem;">
                            <ion-icon name="musical-note-outline" style="color: #ec4899; font-size: 1.3rem;"></ion-icon>
                            <span style="font-weight: 600; color: #fff; font-size: 0.95rem;">${song.song}</span>
                        </div>
                        <span style="color: #ec4899; font-weight: 700; font-size: 0.9rem;">${song.coherence_score}% Fit</span>
                    </div>
                    <div style="font-size: 0.82rem; color: var(--text-sub); line-height: 1.5; margin-left: 2.1rem;">
                        <strong>Cultural Context Relevance:</strong> ${song.relevance_analysis}
                    </div>
                `;
                playlistList.appendChild(li);
            });

            // 5. Populate Executive Business Insights
            insightsList.innerHTML = '';
            data.business_insights.forEach((insight) => {
                const li = document.createElement('li');
                li.className = 'song-card';
                li.style.alignItems = 'flex-start';
                li.style.gap = '0.8rem';

                li.innerHTML = `
                    <ion-icon name="bulb-outline" style="color: #eab308; font-size: 1.4rem; margin-top: 0.1rem;"></ion-icon>
                    <div style="display: flex; flex-direction: column; gap: 0.2rem;">
                        <h5 style="color: #fff; font-weight: 600; font-size: 0.95rem;">${insight.title}</h5>
                        <p style="color: var(--text-sub); font-size: 0.85rem; line-height: 1.6;">${insight.detail}</p>
                    </div>
                `;
                insightsList.appendChild(li);
            });

            // Show the results dashboard
            switchStage(outputStage);

        } catch (error) {
            console.error('Ingestion Analysis Error:', error);
            alert('Failed to process the requested audio asset. Please verify GCS bucket permissions, media encoding format, or Google Cloud TTS limits.');
            switchStage(idleStage);
        } finally {
            analyzeBtn.disabled = false;
        }
    });

    // File Input Staging Feedback Listener
    const fileInput = document.getElementById('audio-file');
    const fileNameDisplay = document.getElementById('file-name-display');
    const clearFileBtn = document.getElementById('clear-file-btn');

    if (fileInput && fileNameDisplay) {
        fileInput.addEventListener('change', () => {
            if (fileInput.files.length > 0) {
                fileNameDisplay.textContent = fileInput.files[0].name;
                fileNameDisplay.style.color = '#ec4899'; // Stage in glowing neon pink!
                if (clearFileBtn) clearFileBtn.style.display = 'inline-flex';
            } else {
                fileNameDisplay.textContent = 'No file selected';
                fileNameDisplay.style.color = '#fff';
                if (clearFileBtn) clearFileBtn.style.display = 'none';
            }
        });
    }

    // Clear File Click Action Handler
    if (clearFileBtn && fileInput && fileNameDisplay) {
        clearFileBtn.addEventListener('click', () => {
            fileInput.value = ''; // Reset input staging
            fileNameDisplay.textContent = 'No file selected';
            fileNameDisplay.style.color = '#fff';
            clearFileBtn.style.display = 'none';
        });
    }
});
