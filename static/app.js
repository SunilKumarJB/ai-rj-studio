document.addEventListener('DOMContentLoaded', () => {
    const rjForm = document.getElementById('rj-form');
    const idleStage = document.getElementById('idle-stage');
    const loadingStage = document.getElementById('loading-stage');
    const outputStage = document.getElementById('output-stage');
    const submitBtn = document.getElementById('submit-btn');

    // Segment tab elements
    const tabSegment1 = document.getElementById('tab-segment1');
    const tabSegment2 = document.getElementById('tab-segment2');
    const contentSegment1 = document.getElementById('content-segment1');
    const contentSegment2 = document.getElementById('content-segment2');

    // Segment 1 elements
    const displayTitle = document.getElementById('display-title');
    const scriptContent1 = document.getElementById('script-content-1');
    const songsList1 = document.getElementById('songs-list-1');
    const ttsAudioPlayer1 = document.getElementById('tts-audio-player-1');
    const audioStatusTitle1 = document.getElementById('audio-status-title-1');
    const audioLoadingPlaceholder1 = document.getElementById('audio-loading-placeholder-1');
    const tabTitleSegment1 = document.getElementById('tab-title-segment1');
    const titleSegment1 = document.getElementById('title-segment1');

    // Segment 2 elements
    const scriptContent2 = document.getElementById('script-content-2');
    const songsList2 = document.getElementById('songs-list-2');
    const ttsAudioPlayer2 = document.getElementById('tts-audio-player-2');
    const audioStatusTitle2 = document.getElementById('audio-status-title-2');
    const audioLoadingPlaceholder2 = document.getElementById('audio-loading-placeholder-2');
    const tabTitleSegment2 = document.getElementById('tab-title-segment2');
    const titleSegment2 = document.getElementById('title-segment2');

    function switchStage(stage) {
        idleStage.classList.remove('active');
        loadingStage.classList.remove('active');
        outputStage.classList.remove('active');
        stage.classList.add('active');
    }

    // Segment Switcher tab click handlers
    if (tabSegment1 && tabSegment2 && contentSegment1 && contentSegment2) {
        tabSegment1.addEventListener('click', () => {
            tabSegment2.classList.remove('active');
            tabSegment1.classList.add('active');
            contentSegment2.style.display = 'none';
            contentSegment1.style.display = 'flex';
        });

        tabSegment2.addEventListener('click', () => {
            tabSegment1.classList.remove('active');
            tabSegment2.classList.add('active');
            contentSegment1.style.display = 'none';
            contentSegment2.style.display = 'flex';
        });
    }

    const additionalInfoSamples = {
        cosmic: "Reflecting on cosmic events this month, shouting out all night workers listening across the continent.",
        rain: "Heavy monsoon rains leading to waterlogging in downtown, warning listeners to stay safe and check traffic routes.",
        food: "Shouting out the upcoming regional street food festival this weekend, asking listeners to share their favorite spots.",
        retro: "Sharing trivia about the golden era of 90s music and dedicating the next segment to retro vinyl collectors.",
        tech: "Discussing how AI is transforming everyday life, asking listeners if they are excited or nervous about the future."
    };

    const adProductSamples = {
        ecobrew: "EcoBrew organic coffee - rich taste, 20% off code BREW20",
        aerofit: "AeroFit running shoes - ultra lightweight, buy one get one free with code AEROFIT",
        bytesize: "ByteSize AI - productivity tool for developers, free trial at bytesize.ai",
        solarcharge: "SolarCharge pocket power banks - eco-friendly charging, 15% off at checkout with code SOLAR15",
        glowskin: "GlowSkin organic herbal soaps - gentle skin care, code GLOWUP for free shipping"
    };

    const additionalInfoSample = document.getElementById('additional_info_sample');
    const additionalInfoCustomContainer = document.getElementById('additional-info-custom-container');
    if (additionalInfoSample && additionalInfoCustomContainer) {
        additionalInfoSample.addEventListener('change', () => {
            additionalInfoCustomContainer.style.display = additionalInfoSample.value === 'custom' ? 'flex' : 'none';
        });
    }

    const includeAd = document.getElementById('include_ad');
    const adDetailsContainer = document.getElementById('ad-details-container');
    const adProductSample = document.getElementById('ad_product_sample');
    const adCustomInputContainer = document.getElementById('ad-custom-input-container');

    if (includeAd && adDetailsContainer) {
        includeAd.addEventListener('change', () => {
            adDetailsContainer.style.display = includeAd.checked ? 'flex' : 'none';
        });
    }

    if (adProductSample && adCustomInputContainer) {
        adProductSample.addEventListener('change', () => {
            adCustomInputContainer.style.display = adProductSample.value === 'custom' ? 'flex' : 'none';
        });
    }

    rjForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Reset Segment 1 and Segment 2 Audio Elements
        [ttsAudioPlayer1, ttsAudioPlayer2].forEach(p => {
            if (p) {
                p.style.display = 'none';
                p.src = '';
                p.load();
            }
        });

        // Set Loading Indicators for both audio segments
        [audioLoadingPlaceholder1, audioLoadingPlaceholder2].forEach(h => { if (h) h.style.display = 'flex'; });
        [audioStatusTitle1, audioStatusTitle2].forEach(t => { if (t) t.textContent = 'Generating Audio...'; });

        // Default to Part 1 Tab view when beginning synthesis
        if (tabSegment1 && contentSegment1 && tabSegment2 && contentSegment2) {
            tabSegment2.classList.remove('active');
            tabSegment1.classList.add('active');
            contentSegment2.style.display = 'none';
            contentSegment1.style.display = 'flex';
        }

        let additionalInfo = '';
        const selectedSample = document.getElementById('additional_info_sample').value;
        if (selectedSample === 'custom') {
            additionalInfo = document.getElementById('additional_info').value.trim();
        } else {
            additionalInfo = additionalInfoSamples[selectedSample] || '';
        }

        let adProduct = '';
        if (includeAd.checked) {
            const selectedAdSample = document.getElementById('ad_product_sample').value;
            if (selectedAdSample === 'custom') {
                adProduct = document.getElementById('ad_product').value.trim();
            } else {
                adProduct = adProductSamples[selectedAdSample] || '';
            }
        }

        const formData = {
            broadcast_mode: document.getElementById('broadcast_mode').value,
            persona: document.getElementById('persona').value.trim(),
            personality: document.getElementById('personality').value.trim(),
            theme: document.getElementById('theme').value.trim(),
            additional_info: additionalInfo,
            language_region: document.getElementById('language_region').value,
            include_ad: includeAd.checked,
            ad_product: adProduct
        };

        // Disable button & switch to loading view
        submitBtn.disabled = true;
        switchStage(loadingStage);

        try {
            // 1. Generate RJ Script & Playlist for both parts
            const scriptRes = await fetch('/generate-script', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!scriptRes.ok) throw new Error('Failed to generate script');
            const scriptData = await scriptRes.json();

            // Populate show title
            displayTitle.textContent = scriptData.show_title || 'The Universal Sounds Broadcast';

            // Populate Segment 1 Data
            if (tabTitleSegment1) tabTitleSegment1.textContent = scriptData.segment1.title;
            if (titleSegment1) titleSegment1.textContent = scriptData.segment1.title;
            if (scriptContent1) scriptContent1.textContent = scriptData.segment1.script;

            songsList1.innerHTML = '';
            scriptData.segment1.songs.forEach((song) => {
                const li = document.createElement('li');
                li.className = 'song-card';
                li.innerHTML = `
                    <ion-icon name="musical-notes" class="song-icon"></ion-icon>
                    <div class="song-details">
                        <h5>${song}</h5>
                    </div>
                `;
                songsList1.appendChild(li);
            });

            // Populate Segment 2 Data
            if (tabTitleSegment2) tabTitleSegment2.textContent = scriptData.segment2.title;
            if (titleSegment2) titleSegment2.textContent = scriptData.segment2.title;
            if (scriptContent2) scriptContent2.textContent = scriptData.segment2.script;

            songsList2.innerHTML = '';
            scriptData.segment2.songs.forEach((song) => {
                const li = document.createElement('li');
                li.className = 'song-card';
                li.innerHTML = `
                    <ion-icon name="musical-notes" class="song-icon"></ion-icon>
                    <div class="song-details">
                        <h5>${song}</h5>
                    </div>
                `;
                songsList2.appendChild(li);
            });

            // Display Output immediately so user sees the script as soon as it is generated
            switchStage(outputStage);

            // 2. Generate Flash Speech for both parts concurrently
            const speech1Promise = fetch('/generate-speech', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    script: scriptData.segment1.script,
                    language_region: formData.language_region,
                    broadcast_mode: formData.broadcast_mode,
                    persona: formData.persona,
                    personality: formData.personality
                })
            });

            const speech2Promise = fetch('/generate-speech', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    script: scriptData.segment2.script,
                    language_region: formData.language_region,
                    broadcast_mode: formData.broadcast_mode,
                    persona: formData.persona,
                    personality: formData.personality
                })
            });

            const [res1, res2] = await Promise.all([speech1Promise, speech2Promise]);

            // Handle Speech 1 audio loading
            if (res1.ok) {
                const speechData1 = await res1.json();
                if (speechData1.audio_base64) {
                    ttsAudioPlayer1.src = `data:audio/wav;base64,${speechData1.audio_base64}`;
                    ttsAudioPlayer1.style.display = 'block';
                    if (audioLoadingPlaceholder1) audioLoadingPlaceholder1.style.display = 'none';
                    if (audioStatusTitle1) audioStatusTitle1.textContent = 'Now Transmitting';
                }
            } else {
                console.error("Speech 1 failed");
                if (audioStatusTitle1) audioStatusTitle1.textContent = 'Transmission Failed';
            }

            // Handle Speech 2 audio loading
            if (res2.ok) {
                const speechData2 = await res2.json();
                if (speechData2.audio_base64) {
                    ttsAudioPlayer2.src = `data:audio/wav;base64,${speechData2.audio_base64}`;
                    ttsAudioPlayer2.style.display = 'block';
                    if (audioLoadingPlaceholder2) audioLoadingPlaceholder2.style.display = 'none';
                    if (audioStatusTitle2) audioStatusTitle2.textContent = 'Now Transmitting';
                }
            } else {
                console.error("Speech 2 failed");
                if (audioStatusTitle2) audioStatusTitle2.textContent = 'Transmission Failed';
            }

        } catch (error) {
            console.error('Error during generation:', error);
            alert('Encountered an issue synthesizing show broadcast. Please check backend API logs and verify GCP project settings in .env');
            switchStage(idleStage);
        } finally {
            submitBtn.disabled = false;
        }
    });
});
