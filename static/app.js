document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Core Form & Stage Elements ---
    const rjForm = document.getElementById('rj-form');
    const idleStage = document.getElementById('idle-stage');
    const loadingStage = document.getElementById('loading-stage');
    const outputStage = document.getElementById('output-stage');
    const submitBtn = document.getElementById('submit-btn');

    // --- 2. Segment Tabs & Content Panels ---
    const tabSegment1 = document.getElementById('tab-segment1');
    const tabSegment2 = document.getElementById('tab-segment2');
    const contentSegment1 = document.getElementById('content-segment1');
    const contentSegment2 = document.getElementById('content-segment2');

    // --- 3. Segment 1 Elements ---
    const displayTitle = document.getElementById('display-title');
    const scriptContent1 = document.getElementById('script-content-1');
    const songsList1 = document.getElementById('songs-list-1');
    const ttsAudioPlayer1 = document.getElementById('tts-audio-player-1');
    const audioStatusTitle1 = document.getElementById('audio-status-title-1');
    const audioLoadingPlaceholder1 = document.getElementById('audio-loading-placeholder-1');
    const tabTitleSegment1 = document.getElementById('tab-title-segment1');
    const titleSegment1 = document.getElementById('title-segment1');
    const btnCopyScript1 = document.getElementById('btn-copy-script-1');
    const btnDownloadAudio1 = document.getElementById('btn-download-audio-1');
    const btnFontDec1 = document.getElementById('btn-font-dec-1');
    const btnFontInc1 = document.getElementById('btn-font-inc-1');

    // --- 4. Segment 2 Elements ---
    const scriptContent2 = document.getElementById('script-content-2');
    const songsList2 = document.getElementById('songs-list-2');
    const ttsAudioPlayer2 = document.getElementById('tts-audio-player-2');
    const audioStatusTitle2 = document.getElementById('audio-status-title-2');
    const audioLoadingPlaceholder2 = document.getElementById('audio-loading-placeholder-2');
    const tabTitleSegment2 = document.getElementById('tab-title-segment2');
    const titleSegment2 = document.getElementById('title-segment2');
    const btnCopyScript2 = document.getElementById('btn-copy-script-2');
    const btnDownloadAudio2 = document.getElementById('btn-download-audio-2');
    const btnFontDec2 = document.getElementById('btn-font-dec-2');
    const btnFontInc2 = document.getElementById('btn-font-inc-2');

    // --- 5. FM Telemetry, Clock & Aspect Ratio Controls ---
    const fmDigitalClock = document.getElementById('fm-digital-clock');
    const fmBroadcastTimer = document.getElementById('fm-broadcast-timer');
    const fmCurrentFreq = document.getElementById('fm-current-freq');
    const billboardFreqBadge = document.getElementById('billboard-freq-badge');
    const tunerScaleContainer = document.getElementById('tuner-scale-container');
    const tunerNeedle = document.getElementById('tuner-needle');
    const fmPresetBtns = document.querySelectorAll('.fm-preset-btn');
    const btnAspect169 = document.getElementById('btn-aspect-16-9');
    const btnAspect43 = document.getElementById('btn-aspect-4-3');
    const btnFullscreenToggle = document.getElementById('btn-fullscreen-toggle');
    const masterOnAirSign = document.getElementById('master-on-air-sign');

    // --- 6. VU Meters & Audio State ---
    const vuSegmentsLeft = document.querySelectorAll('#vu-ladder-left .vu-seg');
    const vuSegmentsRight = document.querySelectorAll('#vu-ladder-right .vu-seg');

    // --- 7. Form Controls & Custom Containers ---
    const additionalInfoSample = document.getElementById('additional_info_sample');
    const additionalInfoCustomContainer = document.getElementById('additional-info-custom-container');
    const includeAd = document.getElementById('include_ad');
    const adDetailsContainer = document.getElementById('ad-details-container');
    const adProductSample = document.getElementById('ad_product_sample');
    const adCustomInputContainer = document.getElementById('ad-custom-input-container');

    // --- 8. YouTube Music Explorer Elements ---
    const ytSearchInput = document.getElementById('yt-search-input');
    const ytSearchBtn = document.getElementById('yt-search-btn');
    const ytSearchLoader = document.getElementById('yt-search-loader');
    const ytSearchResults = document.getElementById('yt-search-results');
    const ytQuickChips = document.querySelectorAll('.yt-chip');

    // --- 8.5 Favorite Channel Cache & GCS Storage Elements ---
    const btnToggleFavorite = document.getElementById('btn-toggle-favorite');
    const favBtnLabel = document.getElementById('fav-btn-label');
    const btnQuickFavorite = document.getElementById('btn-quick-favorite');
    const favPresetLabel = document.getElementById('fav-preset-label');

    let currentFavoriteChannel = null;
    let currentBroadcastData = null;

    let currentActiveSongCard = null;
    let isBroadcasting = false;
    let broadcastSeconds = 0;
    let broadcastTimerInterval = null;
    let currentScriptFontSize1 = 1.0;
    let currentScriptFontSize2 = 1.0;
    let isProgrammaticTuning = false;

    // --- 9. Real-time Digital Studio Clock & On-Air Session Timer ---
    function updateClock() {
        const now = new Date();
        const hrs = String(now.getHours()).padStart(2, '0');
        const mins = String(now.getMinutes()).padStart(2, '0');
        const secs = String(now.getSeconds()).padStart(2, '0');
        if (fmDigitalClock) {
            fmDigitalClock.textContent = `${hrs}:${mins}:${secs}`;
        }
    }
    setInterval(updateClock, 1000);
    updateClock();

    function startBroadcastTimer() {
        if (broadcastTimerInterval) clearInterval(broadcastTimerInterval);
        broadcastSeconds = 0;
        isBroadcasting = true;
        if (masterOnAirSign) masterOnAirSign.classList.add('live');
        
        broadcastTimerInterval = setInterval(() => {
            broadcastSeconds++;
            const h = String(Math.floor(broadcastSeconds / 3600)).padStart(2, '0');
            const m = String(Math.floor((broadcastSeconds % 3600) / 60)).padStart(2, '0');
            const s = String(broadcastSeconds % 60).padStart(2, '0');
            if (fmBroadcastTimer) {
                fmBroadcastTimer.textContent = `${h}:${m}:${s}`;
            }
        }, 1000);
    }

    // --- 10. Stereo Hardware VU Level Meters Functions ---
    function updateVUMeterLevels(leftCount, rightCount) {
        if (vuSegmentsLeft && vuSegmentsLeft.length > 0) {
            vuSegmentsLeft.forEach((seg, idx) => {
                if (idx < leftCount) seg.classList.add('active');
                else seg.classList.remove('active');
            });
        }
        if (vuSegmentsRight && vuSegmentsRight.length > 0) {
            vuSegmentsRight.forEach((seg, idx) => {
                if (idx < rightCount) seg.classList.add('active');
                else seg.classList.remove('active');
            });
        }
    }

    function triggerVUMeterSpike() {
        updateVUMeterLevels(9, 10);
        setTimeout(() => updateVUMeterLevels(3, 4), 180);
    }

    setInterval(() => {
        const isAudioActive = (!ttsAudioPlayer1.paused && !ttsAudioPlayer1.ended) || 
                              (!ttsAudioPlayer2.paused && !ttsAudioPlayer2.ended) ||
                              (currentActiveSongCard !== null);

        if (isAudioActive) {
            const l = Math.floor(Math.random() * 5) + 5;
            const r = Math.floor(Math.random() * 5) + 5;
            updateVUMeterLevels(l, r);
        } else {
            const l = Math.floor(Math.random() * 3) + 1;
            const r = Math.floor(Math.random() * 3) + 1;
            updateVUMeterLevels(l, r);
        }
    }, 120);

    // --- 11. Form Container Toggle Listeners ---
    if (additionalInfoSample && additionalInfoCustomContainer) {
        additionalInfoSample.addEventListener('change', () => {
            additionalInfoCustomContainer.style.display = additionalInfoSample.value === 'custom' ? 'flex' : 'none';
        });
    }

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

    // --- 12. Aspect Ratio & Display Mode Switcher (16:9 / 4:3 / Fullscreen) ---
    if (btnAspect169 && btnAspect43) {
        btnAspect169.addEventListener('click', () => {
            btnAspect43.classList.remove('active');
            btnAspect169.classList.add('active');
            document.body.classList.remove('aspect-4-3');
            document.body.classList.add('aspect-16-9');
            resizeVisualizerCanvases();
        });

        btnAspect43.addEventListener('click', () => {
            btnAspect169.classList.remove('active');
            btnAspect43.classList.add('active');
            document.body.classList.remove('aspect-16-9');
            document.body.classList.add('aspect-4-3');
            resizeVisualizerCanvases();
        });
    }

    if (btnFullscreenToggle) {
        btnFullscreenToggle.addEventListener('click', () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(err => {
                    console.log('Fullscreen request error:', err);
                });
                btnFullscreenToggle.innerHTML = '<ion-icon name="contract-outline"></ion-icon> Exit Full';
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                }
                btnFullscreenToggle.innerHTML = '<ion-icon name="expand-outline"></ion-icon> Fullscreen';
            }
        });
    }

    // --- 13. Interactive Clickable & Draggable FM Band Tuner ---
    function tuneToStation(freq, persona, theme, tone, sampleKey, adKey, includeAdFlag) {
        isProgrammaticTuning = true;
        try {
            const minFreq = 88.0;
            const maxFreq = 108.0;
            const percent = Math.min(100, Math.max(0, ((freq - minFreq) / (maxFreq - minFreq)) * 100));

            if (tunerNeedle) {
                tunerNeedle.style.left = `${percent}%`;
            }
            if (fmCurrentFreq) {
                fmCurrentFreq.innerHTML = `${freq} <small>MHz</small>`;
            }
            if (billboardFreqBadge) {
                billboardFreqBadge.textContent = `${freq} MHz FM`;
            }

            triggerVUMeterSpike();

            if (persona) {
                const personaSelect = document.getElementById('persona');
                if (personaSelect) {
                    personaSelect.value = persona;
                    personaSelect.dispatchEvent(new Event('change'));
                }
            }
            if (theme) {
                const themeSelect = document.getElementById('theme');
                if (themeSelect) {
                    themeSelect.value = theme;
                    themeSelect.dispatchEvent(new Event('change'));
                }
            }
            if (tone) {
                const personalitySelect = document.getElementById('personality');
                if (personalitySelect) {
                    personalitySelect.value = tone;
                    personalitySelect.dispatchEvent(new Event('change'));
                }
            }
            if (sampleKey) {
                if (additionalInfoSample) {
                    additionalInfoSample.value = sampleKey;
                    additionalInfoSample.dispatchEvent(new Event('change'));
                }
                if (additionalInfoCustomContainer) {
                    additionalInfoCustomContainer.style.display = sampleKey === 'custom' ? 'flex' : 'none';
                }
            }
            if (adKey) {
                if (adProductSample) {
                    adProductSample.value = adKey;
                    adProductSample.dispatchEvent(new Event('change'));
                }
                if (adCustomInputContainer) {
                    adCustomInputContainer.style.display = adKey === 'custom' ? 'flex' : 'none';
                }
            }
            if (includeAdFlag !== undefined) {
                const isChecked = (includeAdFlag === true || includeAdFlag === 'true' || includeAdFlag === '1');
                if (includeAd) {
                    includeAd.checked = isChecked;
                    includeAd.dispatchEvent(new Event('change'));
                }
                if (adDetailsContainer) {
                    adDetailsContainer.style.display = isChecked ? 'flex' : 'none';
                }
            }
        } finally {
            setTimeout(() => {
                isProgrammaticTuning = false;
            }, 150);
        }
    }

    if (tunerScaleContainer) {
        let isDraggingTuner = false;

        function handleTunerEvent(e) {
            const rect = tunerScaleContainer.getBoundingClientRect();
            const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : rect.left);
            const relativeX = Math.min(rect.width, Math.max(0, clientX - rect.left));
            const percent = (relativeX / rect.width);
            const freq = parseFloat((88.0 + percent * 20.0).toFixed(1));

            let persona, theme, tone, sampleKey, adKey;
            if (freq < 95.0) {
                persona = "Retro Nostalgia Master";
                theme = "Bollywood Retro Classics Special";
                tone = "Witty, sarcastic, and highly engaging";
                sampleKey = "retro";
                adKey = "glowskin";
            } else if (freq < 100.0) {
                persona = "Sci-Fi Tech Geek";
                theme = "EDM Club Mix & Dance Party Cues";
                tone = "High-Energy, cheerful, and extremely enthusiastic";
                sampleKey = "tech";
                adKey = "bytesize";
            } else if (freq < 103.0) {
                persona = "Energetic Hype MC";
                theme = "EDM Club Mix & Dance Party Cues";
                tone = "High-Energy, cheerful, and extremely enthusiastic";
                sampleKey = "food";
                adKey = "aerofit";
            } else if (freq < 105.5) {
                persona = "Cosmic Night Host";
                theme = "Starlight Meditations & Nostalgia";
                tone = "Seductive, mysterious, deep and calming";
                sampleKey = "cosmic";
                adKey = "ecobrew";
            } else {
                persona = "Late Night Calm Guru";
                theme = "Midnight Melancholy & Acoustic Lounge";
                tone = "Soothing, conversational, warm, and friendly";
                sampleKey = "rain";
                adKey = "solarcharge";
            }

            tuneToStation(freq, persona, theme, tone, sampleKey, adKey, true);
        }

        tunerScaleContainer.addEventListener('mousedown', (e) => {
            isDraggingTuner = true;
            handleTunerEvent(e);
        });

        window.addEventListener('mousemove', (e) => {
            if (isDraggingTuner) handleTunerEvent(e);
        });

        window.addEventListener('mouseup', () => {
            isDraggingTuner = false;
        });

        tunerScaleContainer.addEventListener('touchstart', (e) => {
            handleTunerEvent(e);
        }, { passive: true });

        tunerScaleContainer.addEventListener('touchmove', (e) => {
            handleTunerEvent(e);
        }, { passive: true });
    }

    if (fmPresetBtns) {
        fmPresetBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                fmPresetBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // If Favorite Channel preset is clicked, strictly fetch from cache database & GCS - NEVER regenerate!
                if (btn.id === 'btn-quick-favorite' || btn.classList.contains('btn-fav-preset')) {
                    e.stopPropagation();
                    loadFavoriteChannelIntoStudio();
                    return;
                }

                const isCustom = btn.getAttribute('data-preset') === 'custom';
                if (isCustom) {
                    // Custom Studio switches right screen to clean, empty idle stage and stops active playback
                    switchStage(idleStage);
                    stopAllInlinePlayers();
                    [ttsAudioPlayer1, ttsAudioPlayer2].forEach(p => {
                        if (p) {
                            p.pause();
                            p.currentTime = 0;
                        }
                    });
                    if (masterOnAirSign) masterOnAirSign.classList.remove('live');
                    return;
                }

                const freq = parseFloat(btn.getAttribute('data-freq') || '104.5');
                const persona = btn.getAttribute('data-persona');
                const theme = btn.getAttribute('data-theme');
                const tone = btn.getAttribute('data-tone');
                const sampleKey = btn.getAttribute('data-sample');
                const adKey = btn.getAttribute('data-ad');
                const includeAdFlag = btn.getAttribute('data-include-ad');

                tuneToStation(freq, persona, theme, tone, sampleKey, adKey, includeAdFlag);

                // Instantly trigger show generation for quick channel presets
                setTimeout(() => {
                    if (!submitBtn.disabled) {
                        rjForm.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                    }
                }, 80);
            });
        });
    }

    // Auto-mark Custom Studio as active whenever user manually edits any form control
    const formInputs = document.querySelectorAll('#rj-form select, #rj-form input, #rj-form textarea');
    formInputs.forEach(inputEl => {
        inputEl.addEventListener('change', () => {
            if (isProgrammaticTuning) return;
            const customBtn = document.getElementById('btn-preset-custom');
            if (customBtn && !customBtn.classList.contains('active')) {
                fmPresetBtns.forEach(b => b.classList.remove('active'));
                customBtn.classList.add('active');
            }
        });
    });

    // --- 14. Rich Custom FM Radio Dropdown Component with Instant Keyword Filtering ---
    const OPTION_ICONS = {
        // Personas
        'Cosmic Night Host': { icon: '🌌', sub: 'Mysterious & Chill' },
        'Energetic Hype MC': { icon: '⚡', sub: 'Club & Pop Beats' },
        'Late Night Calm Guru': { icon: '🌙', sub: 'Soothing & Warm' },
        'Retro Nostalgia Master': { icon: '📻', sub: 'Classic Hits' },
        'Indie Music Explorer': { icon: '🎸', sub: 'Undiscovered Tracks' },
        'Sports Fanatic RJ': { icon: '⚽', sub: 'High Passion & Action' },
        'Local Street Foodie': { icon: '🍜', sub: 'Flavor & Enthusiasm' },
        'Sci-Fi Tech Geek': { icon: '🤖', sub: 'Smart Futurist' },
        'Eco-Warrior Planet Guide': { icon: '🌿', sub: 'Inspiring & Green' },
        'Mystery & True Crime Narrator': { icon: '🕵️', sub: 'Suspenseful Drama' },
        'Romantic Love Guru': { icon: '💖', sub: 'Warm & Affectionate' },

        // Broadcast Modes
        'single': { icon: '🎙️', sub: 'Solo Host Monologue' },
        'multi': { icon: '👥', sub: 'Host & Guest Interview' },

        // Languages
        'en-IN': { icon: '🇮🇳', sub: 'Bollywood FM Mix' },
        'hi-IN': { icon: '🇮🇳', sub: 'Classic Bollywood' },
        'kn-IN': { icon: '🇮🇳', sub: 'Sandalwood FM' },
        'ta-IN': { icon: '🇮🇳', sub: 'Chennai FM Style' },
        'te-IN': { icon: '🇮🇳', sub: 'Tollywood Radio' },
        'ml-IN': { icon: '🇮🇳', sub: 'Kerala FM Style' },
        'mr-IN': { icon: '🇮🇳', sub: 'Mumbai FM Style' },
        'en-US': { icon: '🇺🇸', sub: 'US Radio Style' },
        'en-GB': { icon: '🇬🇧', sub: 'Classy BBC Style' },
        'es-ES': { icon: '🇪🇸', sub: 'Madrid FM Style' },
        'fr-FR': { icon: '🇫🇷', sub: 'Parisian FM Style' },
        'ja-JP': { icon: '🇯🇵', sub: 'Tokyo FM Style' },

        // Personality
        'Seductive, mysterious, deep and calming': { icon: '🌌', sub: 'Deep & Calming Tone' },
        'High-Energy, cheerful, and extremely enthusiastic': { icon: '🔥', sub: 'High Energy & Fast' },
        'Witty, sarcastic, and highly engaging': { icon: '🎭', sub: 'Witty & Engaging Banter' },
        'Soothing, conversational, warm, and friendly': { icon: '🍃', sub: 'Warm & Conversational' },
        'Informative, intellectual, and professional': { icon: '🎙️', sub: 'Professional Host' },

        // Theme
        'Starlight Meditations & Nostalgia': { icon: '✨', sub: 'Ambient & Meditative' },
        'Morning Traffic Energizer & Top Hits': { icon: '🚗', sub: 'Top 40 Energetic Beats' },
        'Midnight Melancholy & Acoustic Lounge': { icon: '☕', sub: 'Acoustic & Melodic' },
        'Bollywood Retro Classics Special': { icon: '🪕', sub: '70s-90s Golden Hits' },
        'EDM Club Mix & Dance Party Cues': { icon: '🎛️', sub: 'Mainstage Dance Drops' },

        // Samples
        'cosmic': { icon: '🌌', sub: 'Late Night Cosmic Workers' },
        'rain': { icon: '🌧️', sub: 'Heavy Monsoon Warning' },
        'food': { icon: '🥘', sub: 'Street Food Festival' },
        'retro': { icon: '💿', sub: '90s Golden Vinyl Trivia' },
        'tech': { icon: '🤖', sub: 'AI Transformation Talk' },
        'custom': { icon: '✍️', sub: 'Write Custom Info...' },

        // Ads
        'ecobrew': { icon: '☕', sub: 'Organic Coffee (20% Off)' },
        'aerofit': { icon: '👟', sub: 'Lightweight Shoes (BOGO)' },
        'bytesize': { icon: '💻', sub: 'Productivity Tool' },
        'solarcharge': { icon: '🔋', sub: 'Eco Battery (15% Off)' },
        'glowskin': { icon: '🧼', sub: 'Organic Soap Care' },
        'custom': { icon: '✍️', sub: 'Write Custom Ad...' }
    };

    function enhanceSelectElement(selectEl) {
        if (!selectEl || selectEl._enhanced) return;
        selectEl._enhanced = true;

        const parentWrapper = selectEl.closest('.input-wrapper');
        if (!parentWrapper) return;

        // Visually hide native select
        selectEl.style.position = 'absolute';
        selectEl.style.opacity = '0';
        selectEl.style.pointerEvents = 'none';
        selectEl.style.width = '0';
        selectEl.style.height = '0';

        const customContainer = document.createElement('div');
        customContainer.className = 'fm-custom-select-container';

        const trigger = document.createElement('div');
        trigger.className = 'fm-select-trigger';
        trigger.tabIndex = 0;

        function getOptionMeta(val, text) {
            const meta = OPTION_ICONS[val] || OPTION_ICONS[text] || { icon: '📻', sub: '' };
            return {
                icon: meta.icon,
                sub: meta.sub || (text.includes('(') ? text.split('(')[1].replace(')', '') : '')
            };
        }

        function updateTrigger() {
            const selectedOpt = selectEl.options[selectEl.selectedIndex] || selectEl.options[0];
            if (!selectedOpt) return;
            const text = selectedOpt.textContent.trim();
            const val = selectedOpt.value;
            const meta = getOptionMeta(val, text);

            const cleanTitle = text.includes('(') ? text.split('(')[0].trim() : text;

            trigger.innerHTML = `
                <span class="fm-select-left-icon">${meta.icon}</span>
                <div class="fm-select-text-block">
                    <span class="fm-select-main-title">${cleanTitle}</span>
                    ${meta.sub ? `<span class="fm-select-sub-pill">${meta.sub}</span>` : ''}
                </div>
                <ion-icon name="chevron-down-outline" class="fm-select-chevron"></ion-icon>
            `;
        }

        const dropdown = document.createElement('div');
        dropdown.className = 'fm-select-dropdown';

        function buildDropdown() {
            dropdown.innerHTML = '';
            const allOptions = Array.from(selectEl.querySelectorAll('option'));

            // If more than 6 options, insert a fast search input filter
            if (allOptions.length > 6) {
                const searchBox = document.createElement('div');
                searchBox.className = 'fm-dropdown-search-box';
                const searchInput = document.createElement('input');
                searchInput.type = 'text';
                searchInput.className = 'fm-dropdown-search-input';
                searchInput.placeholder = 'Search styles...';
                searchInput.addEventListener('click', (e) => e.stopPropagation());
                searchInput.addEventListener('input', (e) => {
                    const query = e.target.value.toLowerCase().trim();
                    dropdown.querySelectorAll('.fm-select-option').forEach(optEl => {
                        const title = optEl.querySelector('.option-main-text')?.textContent.toLowerCase() || '';
                        const sub = optEl.querySelector('.option-sub-text')?.textContent.toLowerCase() || '';
                        optEl.style.display = (title.includes(query) || sub.includes(query)) ? 'flex' : 'none';
                    });
                });
                searchBox.appendChild(searchInput);
                dropdown.appendChild(searchBox);
                setTimeout(() => searchInput.focus(), 50);
            }

            const children = Array.from(selectEl.children);

            children.forEach(child => {
                if (child.tagName === 'OPTGROUP') {
                    const header = document.createElement('div');
                    header.className = 'fm-select-group-header';
                    header.textContent = child.label;
                    dropdown.appendChild(header);

                    Array.from(child.children).forEach(opt => {
                        createOptionItem(opt);
                    });
                } else if (child.tagName === 'OPTION') {
                    createOptionItem(child);
                }
            });
        }

        function createOptionItem(opt) {
            const item = document.createElement('div');
            item.className = 'fm-select-option';
            if (opt.value === selectEl.value) item.classList.add('selected');

            const text = opt.textContent.trim();
            const val = opt.value;
            const meta = getOptionMeta(val, text);
            const cleanTitle = text.includes('(') ? text.split('(')[0].trim() : text;

            item.innerHTML = `
                <div class="option-left-content">
                    <span class="option-icon-badge">${meta.icon}</span>
                    <div class="option-text-stack">
                        <span class="option-main-text">${cleanTitle}</span>
                        ${meta.sub ? `<span class="option-sub-text">${meta.sub}</span>` : ''}
                    </div>
                </div>
                <ion-icon name="checkmark-circle" class="option-check-icon"></ion-icon>
            `;

            item.addEventListener('click', (e) => {
                e.stopPropagation();
                selectEl.value = opt.value;
                selectEl.dispatchEvent(new Event('change'));
                updateTrigger();
                dropdown.querySelectorAll('.fm-select-option').forEach(o => o.classList.remove('selected'));
                item.classList.add('selected');
                customContainer.classList.remove('open', 'dropup');
            });

            dropdown.appendChild(item);
        }

        updateTrigger();
        buildDropdown();

        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = customContainer.classList.contains('open');
            document.querySelectorAll('.fm-custom-select-container').forEach(c => c.classList.remove('open', 'dropup'));
            if (!isOpen) {
                buildDropdown();
                
                // Smart Dropup calculation: Check available space below vs above
                const rect = trigger.getBoundingClientRect();
                const spaceBelow = window.innerHeight - rect.bottom;
                const spaceAbove = rect.top;
                const dropdownHeight = 260;

                if (spaceBelow < dropdownHeight && spaceAbove > 180) {
                    customContainer.classList.add('dropup');
                } else {
                    customContainer.classList.remove('dropup');
                }

                customContainer.classList.add('open');
            }
        });

        selectEl.addEventListener('change', () => {
            updateTrigger();
            dropdown.querySelectorAll('.fm-select-option').forEach(o => {
                o.classList.toggle('selected', o.querySelector('.option-main-text')?.textContent.trim() === (selectEl.options[selectEl.selectedIndex]?.textContent.split('(')[0].trim()));
            });
        });

        customContainer.appendChild(trigger);
        customContainer.appendChild(dropdown);
        parentWrapper.appendChild(customContainer);
    }

    document.querySelectorAll('.custom-select-wrap select').forEach(enhanceSelectElement);

    document.addEventListener('click', () => {
        document.querySelectorAll('.fm-custom-select-container').forEach(c => c.classList.remove('open', 'dropup'));
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.fm-custom-select-container').forEach(c => c.classList.remove('open', 'dropup'));
        }
    });

    // --- 15. Initial Station Setup ---
    const activePresetBtn = document.querySelector('.fm-preset-btn.active');
    if (activePresetBtn && activePresetBtn.getAttribute('data-preset') !== 'custom') {
        const freq = parseFloat(activePresetBtn.getAttribute('data-freq') || '104.5');
        const persona = activePresetBtn.getAttribute('data-persona');
        const theme = activePresetBtn.getAttribute('data-theme');
        const tone = activePresetBtn.getAttribute('data-tone');
        const sampleKey = activePresetBtn.getAttribute('data-sample');
        const adKey = activePresetBtn.getAttribute('data-ad');
        const includeAdFlag = activePresetBtn.getAttribute('data-include-ad');
        tuneToStation(freq, persona, theme, tone, sampleKey, adKey, includeAdFlag);
    }

    // --- 16. Live Canvas Audio Spectrum Visualizer (Auto-Fit & Responsive) ---
    function initCanvasVisualizer(canvasId, audioEl) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const numBars = 42;

        function resize() {
            if (canvas.parentElement) {
                canvas.width = canvas.parentElement.clientWidth;
                canvas.height = canvas.parentElement.clientHeight || 65;
            }
        }
        resize();
        window.addEventListener('resize', resize);

        function draw() {
            requestAnimationFrame(draw);
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const isPlaying = audioEl && !audioEl.paused && !audioEl.ended;
            const barWidth = canvas.width / numBars - 2.5;

            for (let i = 0; i < numBars; i++) {
                let barHeight;
                if (isPlaying) {
                    const t = Date.now() / 180 + i * 0.3;
                    const val = Math.sin(t) * 0.5 + 0.5;
                    barHeight = Math.max(6, val * (canvas.height - 8) * (0.5 + Math.random() * 0.5));
                } else {
                    barHeight = 4 + Math.sin(Date.now() / 600 + i * 0.2) * 3;
                }

                const x = i * (barWidth + 2.5);
                const y = canvas.height - barHeight;

                const grad = ctx.createLinearGradient(0, y, 0, canvas.height);
                grad.addColorStop(0, '#f59e0b');
                grad.addColorStop(0.5, '#ec4899');
                grad.addColorStop(1, '#a855f7');

                ctx.fillStyle = grad;
                ctx.fillRect(x, y, barWidth, barHeight);
            }
        }
        draw();
    }

    function resizeVisualizerCanvases() {
        ['visualizer-canvas-1', 'visualizer-canvas-2'].forEach(id => {
            const canvas = document.getElementById(id);
            if (canvas && canvas.parentElement) {
                canvas.width = canvas.parentElement.clientWidth;
            }
        });
    }

    initCanvasVisualizer('visualizer-canvas-1', ttsAudioPlayer1);
    initCanvasVisualizer('visualizer-canvas-2', ttsAudioPlayer2);

    // --- 17. Stage Switching Helper ---
    function switchStage(stage) {
        idleStage.classList.remove('active');
        loadingStage.classList.remove('active');
        outputStage.classList.remove('active');
        stage.classList.add('active');
        setTimeout(resizeVisualizerCanvases, 100);
    }

    // --- 18. Stop all active inline YouTube Music players ---
    function stopAllInlinePlayers() {
        document.querySelectorAll('.song-card-yt').forEach(c => {
            c.classList.remove('now-playing');
            const drawer = c.querySelector('.song-inline-player-drawer');
            if (drawer) {
                drawer.style.display = 'none';
                const iframeWrapper = drawer.querySelector('.inline-iframe-wrapper');
                if (iframeWrapper) iframeWrapper.innerHTML = '';
            }
            const btn = c.querySelector('.btn-play-inline span, .btn-play-studio span');
            const icon = c.querySelector('.btn-play-inline ion-icon, .btn-play-studio ion-icon');
            if (btn) btn.textContent = 'Play';
            if (icon) icon.setAttribute('name', 'play');
        });
        currentActiveSongCard = null;
    }

    // --- 19. YouTube Music Inline Player Operations with Candidate Failover ---
    function playYouTubeTrackInline(track, cardElement) {
        if (!track || !cardElement) return;

        const isCurrentlyPlaying = cardElement.classList.contains('now-playing');
        if (isCurrentlyPlaying) {
            stopAllInlinePlayers();
            return;
        }

        stopAllInlinePlayers();

        [ttsAudioPlayer1, ttsAudioPlayer2].forEach(player => {
            if (player && !player.paused) {
                player.pause();
            }
        });

        const title = track.title || track.query || 'Featured Track';
        const artist = track.artist || '';

        const candidateIds = [];
        if (track.video_id) candidateIds.push(track.video_id);
        if (Array.isArray(track.backup_video_ids)) {
            track.backup_video_ids.forEach(bid => {
                if (bid && !candidateIds.includes(bid)) candidateIds.push(bid);
            });
        }

        const ytUrl = track.youtube_url || (track.video_id ? `https://www.youtube.com/watch?v=${track.video_id}` : `https://www.youtube.com/results?search_query=${encodeURIComponent(title + ' ' + artist)}`);
        const ytmUrl = track.youtube_music_url || (track.video_id ? `https://music.youtube.com/watch?v=${track.video_id}` : `https://music.youtube.com/search?q=${encodeURIComponent(title + ' ' + artist)}`);

        const drawer = cardElement.querySelector('.song-inline-player-drawer');
        const iframeWrapper = cardElement.querySelector('.inline-iframe-wrapper');
        const hintText = cardElement.querySelector('.inline-player-hint-text');
        const candidateBtn = cardElement.querySelector('.btn-switch-candidate');

        if (!drawer || !iframeWrapper) return;

        drawer.style.display = 'flex';
        cardElement.classList.add('now-playing');
        const btn = cardElement.querySelector('.btn-play-inline span, .btn-play-studio span');
        const icon = cardElement.querySelector('.btn-play-inline ion-icon, .btn-play-studio ion-icon');
        if (btn) btn.textContent = 'Stop';
        if (icon) icon.setAttribute('name', 'stop-circle');
        currentActiveSongCard = cardElement;

        let candidateIndex = 0;

        function updateCandidateButton() {
            if (!candidateBtn) return;
            if (candidateIds.length > 1) {
                candidateBtn.style.display = 'inline-flex';
                candidateBtn.innerHTML = `<ion-icon name="sync-outline"></ion-icon> <span>Stream ${candidateIndex + 1}/${candidateIds.length}</span>`;
            } else {
                candidateBtn.style.display = 'none';
            }
        }

        function renderFallbackNotice() {
            iframeWrapper.innerHTML = `
                <div class="inline-player-embed-notice">
                    <div class="notice-icon-box">
                        <ion-icon name="logo-youtube"></ion-icon>
                    </div>
                    <div class="notice-body">
                        <h4 class="notice-title">Direct Stream Ready</h4>
                        <p class="notice-desc">Embedded streaming for <strong>${title}</strong> is restricted on external players by the publisher. Open direct streams with full audio:</p>
                        <div class="notice-actions">
                            <a href="${ytUrl}" target="_blank" rel="noopener noreferrer" class="btn-notice-action btn-notice-yt">
                                <ion-icon name="logo-youtube"></ion-icon>
                                <span>Watch / Listen on YouTube</span>
                            </a>
                            <a href="${ytmUrl}" target="_blank" rel="noopener noreferrer" class="btn-notice-action btn-notice-ytm">
                                <ion-icon name="musical-notes"></ion-icon>
                                <span>Open on YouTube Music</span>
                            </a>
                        </div>
                    </div>
                </div>
            `;
            if (hintText) {
                hintText.innerHTML = '<ion-icon name="open-outline"></ion-icon> Direct stream link verified';
            }
        }

        function renderIframeForId(vid) {
            updateCandidateButton();
            if (!vid) {
                renderFallbackNotice();
                return;
            }

            // High-compatibility YouTube embed without invalid local origin parameter
            iframeWrapper.innerHTML = `
                <iframe 
                    src="https://www.youtube.com/embed/${vid}?autoplay=1&enablejsapi=1&rel=0&playsinline=1" 
                    title="${title.replace(/"/g, '&quot;')}"
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    allowfullscreen>
                </iframe>
            `;
            if (hintText) {
                hintText.innerHTML = candidateIndex > 0 
                    ? `<ion-icon name="checkmark-done-circle-outline"></ion-icon> Alternate stream candidate #${candidateIndex + 1}`
                    : '<ion-icon name="volume-medium-outline"></ion-icon> YouTube Audio & Video Stream';
            }
        }

        cardElement._handleVideoError = function() {
            if (candidateIndex + 1 < candidateIds.length) {
                candidateIndex++;
                console.log(`Video candidate restricted, trying backup #${candidateIndex + 1} (${candidateIds[candidateIndex]})...`);
                renderIframeForId(candidateIds[candidateIndex]);
            } else {
                console.log(`All candidates restricted for ${title}, displaying direct play notice...`);
                renderFallbackNotice();
            }
        };

        if (candidateIds.length > 0) {
            renderIframeForId(candidateIds[0]);
        } else {
            renderFallbackNotice();
        }

        cardElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    if (!window._ytMessageListenerAttached) {
        window.addEventListener('message', (event) => {
            try {
                let data = event.data;
                if (typeof data === 'string') {
                    try {
                        data = JSON.parse(data);
                    } catch (err) {
                        data = null;
                    }
                }
                if (data && (data.event === 'onError' || data.info === 150 || data.info === 101 || data.info === 100 || data.info === 2 || data.info === 5)) {
                    if (currentActiveSongCard && typeof currentActiveSongCard._handleVideoError === 'function') {
                        currentActiveSongCard._handleVideoError();
                    }
                }
            } catch (e) {}
        });
        window._ytMessageListenerAttached = true;
    }

    [ttsAudioPlayer1, ttsAudioPlayer2].forEach(player => {
        if (player) {
            player.addEventListener('play', () => {
                stopAllInlinePlayers();
                triggerVUMeterSpike();
            });
        }
    });

    // --- 20. Helper to Render Playable YouTube Music Cards ---
    function renderSongCard(track, container) {
        const li = document.createElement('li');
        li.className = 'song-card-yt';

        const title = track.title || track.query || 'Selected Track';
        const artist = track.artist || 'Featured Artist';
        const duration = track.duration || '';
        const thumb = track.thumbnail_url || (track.video_id ? `https://i.ytimg.com/vi/${track.video_id}/hqdefault.jpg` : '');
        const ytUrl = track.youtube_url || (track.video_id ? `https://www.youtube.com/watch?v=${track.video_id}` : `https://www.youtube.com/results?search_query=${encodeURIComponent(title + ' ' + artist)}`);
        const ytmUrl = track.youtube_music_url || (track.video_id ? `https://music.youtube.com/watch?v=${track.video_id}` : `https://music.youtube.com/search?q=${encodeURIComponent(title + ' ' + artist)}`);

        li.innerHTML = `
            <div class="song-card-main-row">
                <div class="song-left-section">
                    <div class="song-thumb-box" title="Play inline">
                        ${thumb ? `<img src="${thumb}" alt="${title.replace(/"/g, '&quot;')}" class="song-thumb-img" loading="lazy" onerror="this.src='https://i.ytimg.com/vi/${track.video_id}/hqdefault.jpg'" />` : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#1e293b;"><ion-icon name="musical-notes" style="color:#ef4444;font-size:1.4rem;"></ion-icon></div>`}
                        <div class="song-thumb-overlay">
                            <ion-icon name="play-circle"></ion-icon>
                        </div>
                    </div>
                    <div class="song-info-box">
                        <div class="song-title-row">
                            <span class="song-title-text" title="${title.replace(/"/g, '&quot;')}">${title}</span>
                            <div class="card-sound-equalizer">
                                <div class="eq-bar"></div>
                                <div class="eq-bar"></div>
                                <div class="eq-bar"></div>
                            </div>
                        </div>
                        <div class="song-meta-row">
                            <span class="song-artist-text">${artist}</span>
                            <span class="badge-ytm-pill">
                                <ion-icon name="logo-youtube"></ion-icon>
                                YouTube
                            </span>
                            ${duration ? `<span class="song-duration-pill"><ion-icon name="time-outline"></ion-icon> ${duration}</span>` : ''}
                        </div>
                    </div>
                </div>
                <div class="song-right-actions">
                    <button type="button" class="btn-play-inline" title="Play track inline">
                        <ion-icon name="play"></ion-icon>
                        <span>Play</span>
                    </button>
                    <a href="${ytUrl}" target="_blank" rel="noopener noreferrer" class="btn-yt-icon btn-yt-red" title="Watch on YouTube">
                        <ion-icon name="logo-youtube"></ion-icon>
                    </a>
                    <a href="${ytmUrl}" target="_blank" rel="noopener noreferrer" class="btn-yt-icon btn-ytm-link" title="Open on YouTube Music">
                        <ion-icon name="musical-notes"></ion-icon>
                    </a>
                </div>
            </div>
            <!-- Inline Player Drawer -->
            <div class="song-inline-player-drawer" style="display: none;">
                <div class="inline-player-header">
                    <div class="inline-now-playing-label">
                        <span class="yt-dot"></span>
                        <span>Now Playing Inline</span>
                    </div>
                    <div class="inline-player-actions" style="display: flex; gap: 0.45rem; align-items: center;">
                        <button type="button" class="btn-switch-candidate" title="Switch to backup audio candidate stream" style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); color: #cbd5e1; font-size: 0.72rem; padding: 0.2rem 0.55rem; border-radius: 6px; cursor: pointer; display: inline-flex; align-items: center; gap: 0.3rem;">
                            <ion-icon name="sync-outline"></ion-icon> <span>Alternate Stream</span>
                        </button>
                        <a href="${ytUrl}" target="_blank" rel="noopener noreferrer" class="btn-drawer-yt" title="Open on YouTube in new tab">
                            <ion-icon name="logo-youtube"></ion-icon>
                            <span>Open YouTube</span>
                        </a>
                        <button type="button" class="btn-close-inline-player" title="Close inline player">
                            <ion-icon name="close-circle-outline"></ion-icon>
                            <span>Close</span>
                        </button>
                    </div>
                </div>
                <div class="inline-iframe-wrapper"></div>
                <div class="inline-player-hint">
                    <span class="inline-player-hint-text"><ion-icon name="volume-medium-outline"></ion-icon> YouTube Audio Stream</span>
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

        const playBtn = li.querySelector('.btn-play-inline');
        const thumbBox = li.querySelector('.song-thumb-box');
        const closeBtn = li.querySelector('.btn-close-inline-player');
        const switchBtn = li.querySelector('.btn-switch-candidate');

        const triggerPlay = (e) => {
            e.stopPropagation();
            playYouTubeTrackInline(track, li);
        };

        if (playBtn) playBtn.addEventListener('click', triggerPlay);
        if (thumbBox) thumbBox.addEventListener('click', triggerPlay);
        if (switchBtn) switchBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (typeof li._handleVideoError === 'function') {
                li._handleVideoError();
            }
        });
        if (closeBtn) closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            stopAllInlinePlayers();
        });

        container.appendChild(li);
    }

    // --- 20.5 Favorite Channel Cache & GCS Storage Synchronization ---
    function showStudioToast(message, type = 'success') {
        let container = document.getElementById('studio-toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'studio-toast-container';
            document.body.appendChild(container);
        }
        const toast = document.createElement('div');
        toast.className = `studio-toast toast-${type}`;
        let iconName = 'checkmark-circle';
        if (type === 'error') iconName = 'alert-circle';
        if (type === 'info') iconName = 'information-circle';
        if (type === 'warning') iconName = 'warning';
        if (message.includes('★') || message.includes('Favorite')) iconName = 'heart';

        toast.innerHTML = `<ion-icon name="${iconName}"></ion-icon> <span>${message}</span>`;
        container.appendChild(toast);
        setTimeout(() => {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 4200);
    }

    function updateFavoriteButtonUI() {
        if (!btnToggleFavorite) return;
        const isFav = currentFavoriteChannel && currentBroadcastData && 
            (currentFavoriteChannel.show_title === currentBroadcastData.show_title);
        
        if (isFav) {
            btnToggleFavorite.classList.add('is-fav');
            btnToggleFavorite.innerHTML = '<ion-icon name="heart"></ion-icon> <span>Favorite Saved ★</span>';
            btnToggleFavorite.title = 'Saved in local cache & Google Cloud Storage. Click to manage.';
        } else {
            btnToggleFavorite.classList.remove('is-fav');
            btnToggleFavorite.innerHTML = '<ion-icon name="heart-outline"></ion-icon> <span>Save as Favorite</span>';
            btnToggleFavorite.title = 'Save this broadcast as your single Favorite in persistent storage';
        }
    }

    function updateQuickFavoritePresetUI() {
        if (!btnQuickFavorite) return;
        if (currentFavoriteChannel) {
            btnQuickFavorite.classList.add('has-favorite');
            if (favPresetLabel) {
                const title = currentFavoriteChannel.show_title || 'Favorite Channel';
                const shortTitle = title.length > 20 ? title.substring(0, 18) + '...' : title;
                favPresetLabel.textContent = `★ ${shortTitle}`;
            }
            btnQuickFavorite.title = `Tuned Favorite: "${currentFavoriteChannel.show_title}" • Click to stream`;
        } else {
            btnQuickFavorite.classList.remove('has-favorite');
            if (favPresetLabel) favPresetLabel.textContent = '★ Favorite Channel';
            btnQuickFavorite.title = 'No Favorite Channel saved yet. Save any broadcast as favorite!';
        }
    }

    async function handleToggleFavorite() {
        if (!currentBroadcastData) {
            showStudioToast("No active broadcast to save as favorite", "warning");
            return;
        }

        const isFav = btnToggleFavorite && btnToggleFavorite.classList.contains('is-fav');
        if (isFav) {
            const confirmRemove = confirm(`"${currentBroadcastData.show_title}" is currently your saved Favorite Channel. Remove from favorites?`);
            if (confirmRemove) {
                try {
                    await fetch('/favorite', { method: 'DELETE' });
                    currentFavoriteChannel = null;
                    updateFavoriteButtonUI();
                    updateQuickFavoritePresetUI();
                    showStudioToast("Favorite channel removed from cache database & GCS.", "info");
                } catch (e) {
                    console.error("Delete favorite error:", e);
                }
            }
            return;
        }

        // Save favorite
        try {
            if (btnToggleFavorite) {
                btnToggleFavorite.disabled = true;
                btnToggleFavorite.innerHTML = '<ion-icon name="sync-outline" class="spin-icon"></ion-icon> <span>Saving to GCS...</span>';
            }

            const res = await fetch('/favorite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentBroadcastData)
            });

            if (!res.ok) throw new Error("Failed to persist favorite channel");
            const data = await res.json();
            currentFavoriteChannel = data.favorite;
            updateFavoriteButtonUI();
            updateQuickFavoritePresetUI();
            showStudioToast("★ Saved as Favorite! Synced to local cache & Google Cloud Storage.", "success");
        } catch (err) {
            console.error("Save favorite error:", err);
            showStudioToast("Failed to save favorite channel. Please check backend logs.", "error");
            updateFavoriteButtonUI();
        } finally {
            if (btnToggleFavorite) btnToggleFavorite.disabled = false;
        }
    }

    async function loadFavoriteChannelIntoStudio() {
        try {
            let fav = currentFavoriteChannel;
            if (!fav) {
                const res = await fetch('/favorite');
                if (res.ok) {
                    const d = await res.json();
                    fav = d.favorite;
                    currentFavoriteChannel = fav;
                }
            }

            if (!fav) {
                showStudioToast("No saved favorite channel found yet. Generate a show and click 'Save as Favorite'!", "info");
                return;
            }

            currentBroadcastData = fav;

            // Fill form fields
            if (fav.persona) {
                const personaEl = document.getElementById('persona');
                if (personaEl) personaEl.value = fav.persona;
            }
            if (fav.personality) {
                const persEl = document.getElementById('personality');
                if (persEl) persEl.value = fav.personality;
            }
            if (fav.theme) {
                const themeEl = document.getElementById('theme');
                if (themeEl) themeEl.value = fav.theme;
            }
            if (fav.additional_info) {
                const customInfoEl = document.getElementById('additional_info');
                if (customInfoEl) customInfoEl.value = fav.additional_info;
            }
            if (fav.language_region) {
                const langEl = document.getElementById('language_region');
                if (langEl) langEl.value = fav.language_region;
            }
            if (fav.broadcast_mode) {
                const modeEl = document.getElementById('broadcast_mode');
                if (modeEl) modeEl.value = fav.broadcast_mode;
            }

            // Switch to Output Stage
            switchStage(outputStage);
            startBroadcastTimer();
            updatePipelineStep(3);

            // Populate Billboard
            displayTitle.textContent = fav.show_title || 'Favorite Radio Broadcast';

            // Populate Segment 1
            const seg1 = fav.segment1 || {};
            if (tabTitleSegment1) tabTitleSegment1.textContent = seg1.title || "Deck A: The Opener";
            if (titleSegment1) titleSegment1.textContent = seg1.title || "Segment 1 Script";
            if (scriptContent1) scriptContent1.textContent = seg1.script || "";

            songsList1.innerHTML = '';
            (seg1.song_tracks || []).forEach(track => {
                renderSongCard(track, songsList1);
            });

            if (seg1.audio_base64) {
                const audioUrl = `data:audio/wav;base64,${seg1.audio_base64}`;
                ttsAudioPlayer1.src = audioUrl;
                ttsAudioPlayer1.style.display = 'block';
                if (audioLoadingPlaceholder1) audioLoadingPlaceholder1.style.display = 'none';
                if (audioStatusTitle1) audioStatusTitle1.textContent = 'Favorite Stream Transmitting';
                if (btnDownloadAudio1) {
                    btnDownloadAudio1.href = audioUrl;
                    btnDownloadAudio1.style.display = 'inline-flex';
                }
            } else if (seg1.audio_url) {
                ttsAudioPlayer1.src = seg1.audio_url;
                ttsAudioPlayer1.style.display = 'block';
                if (audioLoadingPlaceholder1) audioLoadingPlaceholder1.style.display = 'none';
                if (audioStatusTitle1) audioStatusTitle1.textContent = 'Favorite Stream Transmitting';
            }

            // Populate Segment 2
            const seg2 = fav.segment2 || {};
            if (tabTitleSegment2) tabTitleSegment2.textContent = seg2.title || "Deck B: The Follow-up";
            if (titleSegment2) titleSegment2.textContent = seg2.title || "Segment 2 Script";
            if (scriptContent2) scriptContent2.textContent = seg2.script || "";

            songsList2.innerHTML = '';
            (seg2.song_tracks || []).forEach(track => {
                renderSongCard(track, songsList2);
            });

            if (seg2.audio_base64) {
                const audioUrl = `data:audio/wav;base64,${seg2.audio_base64}`;
                ttsAudioPlayer2.src = audioUrl;
                ttsAudioPlayer2.style.display = 'block';
                if (audioLoadingPlaceholder2) audioLoadingPlaceholder2.style.display = 'none';
                if (audioStatusTitle2) audioStatusTitle2.textContent = 'Favorite Stream Transmitting';
                if (btnDownloadAudio2) {
                    btnDownloadAudio2.href = audioUrl;
                    btnDownloadAudio2.style.display = 'inline-flex';
                }
            } else if (seg2.audio_url) {
                ttsAudioPlayer2.src = seg2.audio_url;
                ttsAudioPlayer2.style.display = 'block';
                if (audioLoadingPlaceholder2) audioLoadingPlaceholder2.style.display = 'none';
                if (audioStatusTitle2) audioStatusTitle2.textContent = 'Favorite Stream Transmitting';
            }

            // Select Segment 1 by default
            if (tabSegment1 && contentSegment1 && tabSegment2 && contentSegment2) {
                tabSegment2.classList.remove('active');
                tabSegment1.classList.add('active');
                contentSegment2.style.display = 'none';
                contentSegment1.style.display = 'flex';
            }

            // Trigger spectrum spike
            triggerVUMeterSpike();

            updateFavoriteButtonUI();
            updateQuickFavoritePresetUI();
            showStudioToast(`★ Loaded Favorite Channel: "${fav.show_title}"`, "success");
        } catch (err) {
            console.error("Load favorite error:", err);
            showStudioToast("Could not load favorite channel.", "error");
        }
    }

    async function initFavoriteState() {
        try {
            const res = await fetch('/favorite');
            if (res.ok) {
                const d = await res.json();
                if (d && d.favorite) {
                    currentFavoriteChannel = d.favorite;
                    updateQuickFavoritePresetUI();
                }
            }
        } catch (e) {
            console.log("Favorite initial check notice:", e);
        }
    }

    if (btnToggleFavorite) {
        btnToggleFavorite.addEventListener('click', handleToggleFavorite);
    }

    // Explicitly set Custom Studio as default active selection and start on empty idle stage
    const customStudioBtn = document.getElementById('btn-preset-custom');
    if (customStudioBtn && fmPresetBtns) {
        fmPresetBtns.forEach(b => b.classList.remove('active'));
        customStudioBtn.classList.add('active');
    }
    switchStage(idleStage);

    // Initialize favorite status on load (updates preset badge only, leaves screen on Custom Studio empty state)
    initFavoriteState();

    // --- 21. Script Copy & Font Zoom Tools ---
    function setupCopyScriptButton(btn, contentEl) {
        if (!btn || !contentEl) return;
        btn.addEventListener('click', () => {
            const text = contentEl.textContent;
            navigator.clipboard.writeText(text).then(() => {
                const originalHtml = btn.innerHTML;
                btn.innerHTML = '<ion-icon name="checkmark-done-outline"></ion-icon> <span>Copied!</span>';
                setTimeout(() => {
                    btn.innerHTML = originalHtml;
                }, 2000);
            }).catch(err => {
                console.error('Clipboard copy failed:', err);
            });
        });
    }
    setupCopyScriptButton(btnCopyScript1, scriptContent1);
    setupCopyScriptButton(btnCopyScript2, scriptContent2);

    // Font Zoom Handlers
    if (btnFontDec1 && scriptContent1) {
        btnFontDec1.addEventListener('click', () => {
            currentScriptFontSize1 = Math.max(0.8, currentScriptFontSize1 - 0.1);
            scriptContent1.style.fontSize = `${currentScriptFontSize1}rem`;
        });
    }
    if (btnFontInc1 && scriptContent1) {
        btnFontInc1.addEventListener('click', () => {
            currentScriptFontSize1 = Math.min(1.5, currentScriptFontSize1 + 0.1);
            scriptContent1.style.fontSize = `${currentScriptFontSize1}rem`;
        });
    }
    if (btnFontDec2 && scriptContent2) {
        btnFontDec2.addEventListener('click', () => {
            currentScriptFontSize2 = Math.max(0.8, currentScriptFontSize2 - 0.1);
            scriptContent2.style.fontSize = `${currentScriptFontSize2}rem`;
        });
    }
    if (btnFontInc2 && scriptContent2) {
        btnFontInc2.addEventListener('click', () => {
            currentScriptFontSize2 = Math.min(1.5, currentScriptFontSize2 + 0.1);
            scriptContent2.style.fontSize = `${currentScriptFontSize2}rem`;
        });
    }

    // --- 22. YouTube Music Explorer Live Search ---
    async function searchYouTubeMusic(query) {
        if (!query || !query.trim()) return;
        const cleanQ = query.trim();

        if (ytSearchLoader) ytSearchLoader.style.display = 'flex';
        if (ytSearchResults) {
            ytSearchResults.style.display = 'none';
            ytSearchResults.innerHTML = '';
        }

        try {
            const res = await fetch(`/search-music?q=${encodeURIComponent(cleanQ)}&limit=8`);
            if (!res.ok) throw new Error('Search failed');
            const data = await res.json();

            if (ytSearchResults) {
                ytSearchResults.innerHTML = '';
                if (data.tracks && data.tracks.length > 0) {
                    data.tracks.forEach(track => {
                        renderSongCard(track, ytSearchResults);
                    });
                } else {
                    ytSearchResults.innerHTML = `<li style="color: var(--text-sub); padding: 1rem; text-align: center;">No YouTube Music tracks found for "${cleanQ}".</li>`;
                }
                ytSearchResults.style.display = 'grid';
            }
        } catch (error) {
            console.error('YouTube Music Search Error:', error);
            if (ytSearchResults) {
                ytSearchResults.innerHTML = `<li style="color: #ef4444; padding: 1rem; text-align: center;">Failed to search YouTube Music. Please retry.</li>`;
                ytSearchResults.style.display = 'grid';
            }
        } finally {
            if (ytSearchLoader) ytSearchLoader.style.display = 'none';
        }
    }

    if (ytSearchBtn && ytSearchInput) {
        ytSearchBtn.addEventListener('click', () => {
            searchYouTubeMusic(ytSearchInput.value);
        });

        ytSearchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                searchYouTubeMusic(ytSearchInput.value);
            }
        });
    }

    if (ytQuickChips) {
        ytQuickChips.forEach(chip => {
            chip.addEventListener('click', () => {
                const query = chip.getAttribute('data-query');
                if (ytSearchInput) ytSearchInput.value = query;
                searchYouTubeMusic(query);
            });
        });
    }

    // --- 23. Dual Deck Segment Switcher (Deck A / Deck B) ---
    if (tabSegment1 && tabSegment2 && contentSegment1 && contentSegment2) {
        tabSegment1.addEventListener('click', () => {
            tabSegment2.classList.remove('active');
            tabSegment1.classList.add('active');
            contentSegment2.style.display = 'none';
            contentSegment1.style.display = 'flex';
            triggerVUMeterSpike();
            resizeVisualizerCanvases();
        });

        tabSegment2.addEventListener('click', () => {
            tabSegment1.classList.remove('active');
            tabSegment2.classList.add('active');
            contentSegment1.style.display = 'none';
            contentSegment2.style.display = 'flex';
            triggerVUMeterSpike();
            resizeVisualizerCanvases();
        });
    }

    // --- 24. DJ Keyboard Shortcuts ---
    document.addEventListener('keydown', (e) => {
        const activeEl = document.activeElement;
        const isInput = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA');

        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            if (!submitBtn.disabled) {
                rjForm.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
            }
            return;
        }

        if (!isInput) {
            if (e.key === '1' && tabSegment1) {
                tabSegment1.click();
            } else if (e.key === '2' && tabSegment2) {
                tabSegment2.click();
            } else if (e.code === 'Space') {
                e.preventDefault();
                const isDeck1Active = tabSegment1 && tabSegment1.classList.contains('active');
                const player = isDeck1Active ? ttsAudioPlayer1 : ttsAudioPlayer2;
                if (player && player.src) {
                    if (player.paused) player.play();
                    else player.pause();
                }
            }
        }
    });

    // --- 25. Sample Form Data & Context ---
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

    // --- 26. Pipeline Stepper Helper ---
    function updatePipelineStep(step) {
        const s1 = document.getElementById('pipeline-step-1');
        const s2 = document.getElementById('pipeline-step-2');
        const s3 = document.getElementById('pipeline-step-3');
        const heading = document.getElementById('loading-status-heading');

        if (step === 1) {
            if (s1) s1.className = 'pipeline-step active';
            if (s2) s2.className = 'pipeline-step';
            if (s3) s3.className = 'pipeline-step';
            if (heading) heading.textContent = 'Composing Broadcast Scripts...';
        } else if (step === 2) {
            if (s1) s1.className = 'pipeline-step done';
            if (s2) s2.className = 'pipeline-step active';
            if (s3) s3.className = 'pipeline-step';
            if (heading) heading.textContent = 'Curating YouTube Music Festival Tracks...';
        } else if (step === 3) {
            if (s1) s1.className = 'pipeline-step done';
            if (s2) s2.className = 'pipeline-step done';
            if (s3) s3.className = 'pipeline-step active';
            if (heading) heading.textContent = 'Synthesizing Studio Flash Voice Audio...';
        }
    }

    // --- 27. Master Broadcast Form Submission (Script + Dual TTS Synthesis) ---
    rjForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        [ttsAudioPlayer1, ttsAudioPlayer2].forEach(p => {
            if (p) {
                p.style.display = 'none';
                p.src = '';
                p.load();
            }
        });

        [audioLoadingPlaceholder1, audioLoadingPlaceholder2].forEach(h => { if (h) h.style.display = 'flex'; });
        [audioStatusTitle1, audioStatusTitle2].forEach(t => { if (t) t.textContent = 'Generating Audio...'; });
        if (btnDownloadAudio1) btnDownloadAudio1.style.display = 'none';
        if (btnDownloadAudio2) btnDownloadAudio2.style.display = 'none';

        if (tabSegment1 && contentSegment1 && tabSegment2 && contentSegment2) {
            tabSegment2.classList.remove('active');
            tabSegment1.classList.add('active');
            contentSegment2.style.display = 'none';
            contentSegment1.style.display = 'flex';
        }

        let additionalInfo = '';
        const selectedSample = additionalInfoSample ? additionalInfoSample.value : 'cosmic';
        if (selectedSample === 'custom') {
            const customInfoEl = document.getElementById('additional_info');
            additionalInfo = customInfoEl ? customInfoEl.value.trim() : '';
        } else {
            additionalInfo = additionalInfoSamples[selectedSample] || '';
        }

        let adProduct = '';
        const isAdChecked = includeAd ? includeAd.checked : false;
        if (isAdChecked) {
            const selectedAdSample = adProductSample ? adProductSample.value : 'ecobrew';
            if (selectedAdSample === 'custom') {
                const customAdEl = document.getElementById('ad_product');
                adProduct = customAdEl ? customAdEl.value.trim() : '';
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
            include_ad: isAdChecked,
            ad_product: adProduct
        };

        submitBtn.disabled = true;
        switchStage(loadingStage);
        startBroadcastTimer();
        updatePipelineStep(1);

        try {
            // 1. Generate RJ Script & YouTube Music Tracks
            const scriptRes = await fetch('/generate-script', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!scriptRes.ok) throw new Error('Failed to generate script');
            const scriptData = await scriptRes.json();

            updatePipelineStep(2);
            displayTitle.textContent = scriptData.show_title || 'The Universal Sounds Broadcast';

            // Populate Segment 1 Data
            if (tabTitleSegment1) tabTitleSegment1.textContent = scriptData.segment1.title;
            if (titleSegment1) titleSegment1.textContent = scriptData.segment1.title;
            if (scriptContent1) scriptContent1.textContent = scriptData.segment1.script;

            songsList1.innerHTML = '';
            const tracks1 = scriptData.segment1.song_tracks && scriptData.segment1.song_tracks.length > 0
                ? scriptData.segment1.song_tracks
                : (scriptData.segment1.songs || []).map(s => ({ 
                    title: s, 
                    artist: '', 
                    video_id: '', 
                    duration: '', 
                    youtube_url: `https://www.youtube.com/results?search_query=${encodeURIComponent(s)}`,
                    youtube_music_url: `https://music.youtube.com/search?q=${encodeURIComponent(s)}` 
                }));

            tracks1.forEach(track => {
                renderSongCard(track, songsList1);
            });

            // Populate Segment 2 Data
            if (tabTitleSegment2) tabTitleSegment2.textContent = scriptData.segment2.title;
            if (titleSegment2) titleSegment2.textContent = scriptData.segment2.title;
            if (scriptContent2) scriptContent2.textContent = scriptData.segment2.script;

            songsList2.innerHTML = '';
            const tracks2 = scriptData.segment2.song_tracks && scriptData.segment2.song_tracks.length > 0
                ? scriptData.segment2.song_tracks
                : (scriptData.segment2.songs || []).map(s => ({ 
                    title: s, 
                    artist: '', 
                    video_id: '', 
                    duration: '', 
                    youtube_url: `https://www.youtube.com/results?search_query=${encodeURIComponent(s)}`,
                    youtube_music_url: `https://music.youtube.com/search?q=${encodeURIComponent(s)}` 
                }));

            tracks2.forEach(track => {
                renderSongCard(track, songsList2);
            });

            // Store active broadcast payload for single favorite mapping
            currentBroadcastData = {
                show_title: scriptData.show_title || 'The Universal Sounds Broadcast',
                persona: formData.persona,
                personality: formData.personality,
                theme: formData.theme,
                additional_info: formData.additional_info,
                language_region: formData.language_region,
                broadcast_mode: formData.broadcast_mode,
                segment1: {
                    title: scriptData.segment1.title,
                    script: scriptData.segment1.script,
                    songs: scriptData.segment1.songs || [],
                    song_tracks: tracks1,
                    audio_base64: ""
                },
                segment2: {
                    title: scriptData.segment2.title,
                    script: scriptData.segment2.script,
                    songs: scriptData.segment2.songs || [],
                    song_tracks: tracks2,
                    audio_base64: ""
                }
            };
            updateFavoriteButtonUI();

            switchStage(outputStage);
            updatePipelineStep(3);

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

            if (res1.ok) {
                const speechData1 = await res1.json();
                if (speechData1.audio_base64) {
                    const audioUrl = `data:audio/wav;base64,${speechData1.audio_base64}`;
                    ttsAudioPlayer1.src = audioUrl;
                    ttsAudioPlayer1.style.display = 'block';
                    if (audioLoadingPlaceholder1) audioLoadingPlaceholder1.style.display = 'none';
                    if (audioStatusTitle1) audioStatusTitle1.textContent = 'Now Transmitting';
                    if (btnDownloadAudio1) {
                        btnDownloadAudio1.href = audioUrl;
                        btnDownloadAudio1.style.display = 'inline-flex';
                    }
                    if (currentBroadcastData && currentBroadcastData.segment1) {
                        currentBroadcastData.segment1.audio_base64 = speechData1.audio_base64;
                    }
                }
            } else {
                console.error("Speech 1 failed");
                if (audioStatusTitle1) audioStatusTitle1.textContent = 'Transmission Failed';
            }

            if (res2.ok) {
                const speechData2 = await res2.json();
                if (speechData2.audio_base64) {
                    const audioUrl = `data:audio/wav;base64,${speechData2.audio_base64}`;
                    ttsAudioPlayer2.src = audioUrl;
                    ttsAudioPlayer2.style.display = 'block';
                    if (audioLoadingPlaceholder2) audioLoadingPlaceholder2.style.display = 'none';
                    if (audioStatusTitle2) audioStatusTitle2.textContent = 'Now Transmitting';
                    if (btnDownloadAudio2) {
                        btnDownloadAudio2.href = audioUrl;
                        btnDownloadAudio2.style.display = 'inline-flex';
                    }
                    if (currentBroadcastData && currentBroadcastData.segment2) {
                        currentBroadcastData.segment2.audio_base64 = speechData2.audio_base64;
                    }
                }
            } else {
                console.error("Speech 2 failed");
                if (audioStatusTitle2) audioStatusTitle2.textContent = 'Transmission Failed';
            }

        } catch (error) {
            console.error('Error during generation:', error);
            alert('Encountered an issue synthesizing show broadcast. Please check backend API logs.');
            switchStage(idleStage);
        } finally {
            submitBtn.disabled = false;
        }
    });
});
