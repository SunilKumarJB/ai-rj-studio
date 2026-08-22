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

    const fileInput = document.getElementById('audio-file');
    const fileNameDisplay = document.getElementById('file-name-display');
    const clearFileBtn = document.getElementById('clear-file-btn');
    const dropzoneBox = document.getElementById('dropzone-box');
    const gcsInput = document.getElementById('gcs-path');
    const ytInput = document.getElementById('youtube-link');

    const demoBtn1 = document.getElementById('demo-btn-1');
    const demoBtn2 = document.getElementById('demo-btn-2');

    function switchStage(stage) {
        idleStage.style.display = 'none';
        loadingStage.style.display = 'none';
        outputStage.style.display = 'none';
        stage.style.display = 'flex';
    }

    // Drag and Drop support on dropzone
    if (dropzoneBox && fileInput) {
        ['dragenter', 'dragover'].forEach(eventName => {
            dropzoneBox.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropzoneBox.classList.add('drag-over');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropzoneBox.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropzoneBox.classList.remove('drag-over');
            }, false);
        });

        dropzoneBox.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            if (files && files.length > 0) {
                fileInput.files = files;
                updateFileDisplay();
            }
        });
    }

    function updateFileDisplay() {
        if (fileInput.files.length > 0) {
            fileNameDisplay.textContent = `📁 ${fileInput.files[0].name}`;
            fileNameDisplay.style.color = '#ec4899';
            if (clearFileBtn) clearFileBtn.style.display = 'inline-flex';
        } else {
            fileNameDisplay.textContent = 'Drag & drop WAV / MP3 / M4A here';
            fileNameDisplay.style.color = '#e2e8f0';
            if (clearFileBtn) clearFileBtn.style.display = 'none';
        }
    }

    if (fileInput) {
        fileInput.addEventListener('change', updateFileDisplay);
    }

    if (clearFileBtn) {
        clearFileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            fileInput.value = '';
            updateFileDisplay();
        });
    }

    // Demo Quick Prefills
    if (demoBtn1 && ytInput) {
        demoBtn1.addEventListener('click', () => {
            ytInput.value = 'https://www.youtube.com/watch?v=kffacxfA7G4';
            if (gcsInput) gcsInput.value = '';
            fileInput.value = '';
            updateFileDisplay();
            analyticsForm.dispatchEvent(new Event('submit'));
        });
    }

    if (demoBtn2 && gcsInput) {
        demoBtn2.addEventListener('click', () => {
            gcsInput.value = 'gs://cloud-samples-data/generative-ai/audio/pixel.mp3';
            if (ytInput) ytInput.value = '';
            fileInput.value = '';
            updateFileDisplay();
            analyticsForm.dispatchEvent(new Event('submit'));
        });
    }

    // Form Submission
    analyticsForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const hasFile = fileInput.files && fileInput.files.length > 0;
        const gcsPath = gcsInput.value.trim();
        const youtubeLink = ytInput.value.trim();

        if (!hasFile && !gcsPath && !youtubeLink) {
            alert('Please provide at least one audio input: Upload a local file, specify a Google Cloud Storage URI, or paste a YouTube broadcast link.');
            return;
        }

        analyzeBtn.disabled = true;
        switchStage(loadingStage);

        const formData = new FormData();
        if (hasFile) {
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
                throw new Error('Analysis request failed');
            }

            const data = await response.json();

            // 1. Overview Info
            reportTitle.textContent = `Show Report: ${data.show_title || 'Ingested Media Stream'}`;
            reportSummary.textContent = data.show_summary || 'No executive summary available.';

            // 2. KPI Metrics
            const flowScore = data.metrics.flow_score || 88;
            metricFlowScore.textContent = flowScore;
            barFlowScore.style.width = `${flowScore}%`;
            metricPace.textContent = data.metrics.pace_wpm || 135;
            metricEnergy.textContent = data.metrics.energy_score || 82;
            metricSentiment.textContent = data.metrics.sentiment || 'Enthusiastic & Engaging';

            // 3. Topics Timeline Breakdown
            topicsList.innerHTML = '';
            (data.topics || []).forEach((topic) => {
                const li = document.createElement('li');
                li.className = 'topic-card';

                let badgeStyle = 'background: rgba(168, 85, 247, 0.15); border: 1px solid rgba(168, 85, 247, 0.4); color: #c084fc;';
                const s = (topic.sentiment || '').toLowerCase();
                if (s.includes('pos') || s.includes('high') || s.includes('enth')) {
                    badgeStyle = 'background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); color: #34d399;';
                } else if (s.includes('calm') || s.includes('sooth') || s.includes('mellow')) {
                    badgeStyle = 'background: rgba(6, 182, 212, 0.15); border: 1px solid rgba(6, 182, 212, 0.4); color: #38bdf8;';
                }

                li.innerHTML = `
                    <div class="topic-left">
                        <span class="topic-duration-badge">${topic.duration || '0:00 - 2:00'}</span>
                        <span class="topic-title">${topic.topic}</span>
                    </div>
                    <span class="topic-sentiment-pill" style="${badgeStyle}">
                        ${topic.sentiment || 'Positive'}
                    </span>
                `;
                topicsList.appendChild(li);
            });

            // 4. Playlist Alignment with YouTube Music Cards & Inline Players
            playlistList.innerHTML = '';
            (data.song_alignment || []).forEach((song) => {
                const li = document.createElement('li');
                li.className = 'song-card-yt';

                const title = song.song || 'Featured Track';
                const thumb = song.thumbnail_url || (song.video_id ? `https://i.ytimg.com/vi/${song.video_id}/hqdefault.jpg` : '');
                const ytUrl = song.youtube_url || (song.video_id ? `https://www.youtube.com/watch?v=${song.video_id}` : `https://www.youtube.com/results?search_query=${encodeURIComponent(title)}`);
                const ytmUrl = song.youtube_music_url || (song.video_id ? `https://music.youtube.com/watch?v=${song.video_id}` : `https://music.youtube.com/search?q=${encodeURIComponent(title)}`);
                const videoId = song.video_id;

                li.innerHTML = `
                    <div class="song-card-main-row">
                        <div class="song-left-section">
                            <div class="song-thumb-box" title="Play inline">
                                ${thumb ? `<img src="${thumb}" alt="${title.replace(/"/g, '&quot;')}" class="song-thumb-img" />` : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#1e293b;"><ion-icon name="musical-notes" style="color:#ef4444;font-size:1.3rem;"></ion-icon></div>`}
                                <div class="song-thumb-overlay"><ion-icon name="play-circle"></ion-icon></div>
                            </div>
                            <div class="song-info-box">
                                <div class="song-title-row">
                                    <span class="song-title-text">${title}</span>
                                </div>
                                <div class="song-meta-row">
                                    <span class="badge-ytm-pill"><ion-icon name="logo-youtube"></ion-icon> YouTube</span>
                                    ${song.duration ? `<span class="song-duration-pill"><ion-icon name="time-outline"></ion-icon> ${song.duration}</span>` : ''}
                                    <span style="color: #ef4444; font-weight: 800; font-size: 0.72rem; background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.3); padding: 0.1rem 0.45rem; border-radius: 50px;">${song.coherence_score || 90}% Fit</span>
                                </div>
                            </div>
                        </div>
                        <div class="song-right-actions">
                            ${videoId ? `<button type="button" class="btn-play-inline" title="Play track inline"><ion-icon name="play"></ion-icon> <span>Play</span></button>` : ''}
                            <a href="${ytUrl}" target="_blank" rel="noopener noreferrer" class="btn-yt-icon btn-yt-red" title="Watch on YouTube">
                                <ion-icon name="logo-youtube"></ion-icon>
                            </a>
                            <a href="${ytmUrl}" target="_blank" rel="noopener noreferrer" class="btn-yt-icon btn-ytm-link" title="Open on YouTube Music">
                                <ion-icon name="musical-notes"></ion-icon>
                            </a>
                        </div>
                    </div>
                    ${song.relevance_analysis ? `<div class="song-coherence-quote"><strong>Cultural Relevance:</strong> ${song.relevance_analysis}</div>` : ''}
                    <div class="song-inline-player-drawer" style="display: none;">
                        <div class="inline-player-header">
                            <div class="inline-now-playing-label"><span class="yt-dot"></span> <span>Now Playing</span></div>
                            <div style="display: flex; gap: 0.45rem; align-items: center;">
                                <a href="${ytUrl}" target="_blank" rel="noopener noreferrer" class="btn-drawer-yt" title="Open on YouTube in new tab">
                                    <ion-icon name="logo-youtube"></ion-icon>
                                    <span>Open YouTube</span>
                                </a>
                                <button type="button" class="btn-close-inline-player"><ion-icon name="close-circle-outline"></ion-icon> <span>Close</span></button>
                            </div>
                        </div>
                        <div class="inline-iframe-wrapper"></div>
                        <div class="inline-player-hint">
                            <span class="inline-player-hint-text"><ion-icon name="volume-medium-outline"></ion-icon> YouTube Audio & Video Stream</span>
                            <div style="display: flex; gap: 0.75rem; align-items: center;">
                                <a href="${ytUrl}" target="_blank" rel="noopener noreferrer" class="btn-yt-hint-link" style="color: #f87171; text-decoration: underline; font-size: 0.75rem; display: inline-flex; align-items: center; gap: 0.25rem;">
                                    <ion-icon name="logo-youtube"></ion-icon> YouTube
                                </a>
                                <a href="${ytmUrl}" target="_blank" rel="noopener noreferrer" class="btn-yt-hint-link" style="color: #c084fc; text-decoration: underline; font-size: 0.75rem; display: inline-flex; align-items: center; gap: 0.25rem;">
                                    <ion-icon name="musical-notes"></ion-icon> YT Music
                                </a>
                            </div>
                        </div>
                    </div>
                `;

                if (videoId) {
                    const playBtn = li.querySelector('.btn-play-inline');
                    const thumbBox = li.querySelector('.song-thumb-box');
                    const closeBtn = li.querySelector('.btn-close-inline-player');
                    const drawer = li.querySelector('.song-inline-player-drawer');
                    const iframeWrapper = li.querySelector('.inline-iframe-wrapper');

                    const togglePlay = () => {
                        const isPlaying = li.classList.contains('now-playing');
                        document.querySelectorAll('.song-card-yt').forEach(c => {
                            c.classList.remove('now-playing');
                            const d = c.querySelector('.song-inline-player-drawer');
                            if (d) { d.style.display = 'none'; const w = d.querySelector('.inline-iframe-wrapper'); if (w) w.innerHTML = ''; }
                            const b = c.querySelector('.btn-play-inline span');
                            const ic = c.querySelector('.btn-play-inline ion-icon');
                            if (b) b.textContent = 'Play';
                            if (ic) ic.setAttribute('name', 'play');
                        });

                        if (!isPlaying) {
                            drawer.style.display = 'flex';
                            iframeWrapper.innerHTML = `
                                <iframe 
                                    src="https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1&rel=0&playsinline=1" 
                                    title="${title.replace(/"/g, '&quot;')}"
                                    frameborder="0" 
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                                    allowfullscreen>
                                </iframe>
                            `;
                            li.classList.add('now-playing');
                            if (playBtn) {
                                playBtn.querySelector('span').textContent = 'Stop';
                                playBtn.querySelector('ion-icon').setAttribute('name', 'stop-circle');
                            }
                        }
                    };

                    if (playBtn) playBtn.addEventListener('click', togglePlay);
                    if (thumbBox) thumbBox.addEventListener('click', togglePlay);
                    if (closeBtn) closeBtn.addEventListener('click', () => {
                        drawer.style.display = 'none';
                        iframeWrapper.innerHTML = '';
                        li.classList.remove('now-playing');
                        if (playBtn) {
                            playBtn.querySelector('span').textContent = 'Play';
                            playBtn.querySelector('ion-icon').setAttribute('name', 'play');
                        }
                    });
                }

                playlistList.appendChild(li);
            });

            // 5. Executive Business Insights
            insightsList.innerHTML = '';
            (data.business_insights || []).forEach((insight) => {
                const li = document.createElement('li');
                li.className = 'insight-card';
                li.innerHTML = `
                    <div class="insight-icon-box">
                        <ion-icon name="bulb"></ion-icon>
                    </div>
                    <div class="insight-content">
                        <span class="insight-title">${insight.title}</span>
                        <p class="insight-detail">${insight.detail}</p>
                    </div>
                `;
                insightsList.appendChild(li);
            });

            switchStage(outputStage);

        } catch (error) {
            console.error('Analytics Error:', error);
            alert('Failed to analyze the requested audio stream. Please verify bucket permissions or file encoding.');
            switchStage(idleStage);
        } finally {
            analyzeBtn.disabled = false;
        }
    });
});
