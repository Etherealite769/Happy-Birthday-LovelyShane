/**
 * Lovely Shane's 22nd Birthday - Purple Wonderland Photobook & Spotify Lyrics
 * Audio-Synchronized 3D Scrapbook Engine & Spotify-Style Lyric Video Player
 */

(function () {
  'use strict';

  // State Management
  const state = {
    data: null,
    stanzas: [],
    allPhotos: [],
    currentStanzaIdx: 0,
    isPlaying: false,
    currentMode: 'photobook', // 'photobook' | 'cinema' | 'gallery'
    particlesActive: true,
    isScrubbing: false,
    audioDuration: 201.10,
    isBookOpened: false,
    audioCtx: null,
    lastScrolledStanza: -1,
    lastActiveLineKey: null,
    weightedLineTimings: [],
    linePace: localStorage.getItem('shane_line_pace') || 'slower', // 'slower' | 'extra-slow' | 'normal'
    audioAllowed: true,
    hasManuallyPaused: false
  };

  // DOM Elements
  const elements = {
    audio: document.getElementById('audio-player'),
    bookCoverStage: document.getElementById('book-cover-stage'),
    openBookStage: document.getElementById('open-book-stage'),
    closedBook: document.getElementById('closed-book'),
    btnOpenBook: document.getElementById('btn-open-book'),

    // Book Pages
    leftPage: document.getElementById('left-page'),
    rightPage: document.getElementById('right-page'),
    photoMontageContainer: document.getElementById('photo-montage-container'),
    leftPageNumber: document.getElementById('left-page-number'),
    rightPageNumber: document.getElementById('right-page-number'),
    rightChapterNum: document.getElementById('right-chapter-num'),
    stanzaChapterTitle: document.getElementById('stanza-chapter-title'),
    guideBadgeText: document.getElementById('guide-badge-text'),
    stanzaLinesWrapper: document.getElementById('stanza-lines-wrapper'),
    scrapbookCaption: document.getElementById('scrapbook-caption'),
    stanzaMiniFill: document.getElementById('stanza-mini-fill'),
    turningPage: document.getElementById('turning-page'),
    turningFront: document.getElementById('turning-front'),
    turningBack: document.getElementById('turning-back'),
    bookPrevBtn: document.getElementById('book-prev-btn'),
    bookNextBtn: document.getElementById('book-next-btn'),

    // Player Controls
    btnPlayPause: document.getElementById('btn-play-pause'),
    playIcon: document.getElementById('play-icon'),
    pauseIcon: document.getElementById('pause-icon'),
    btnPrevStanza: document.getElementById('btn-prev-stanza'),
    btnNextStanza: document.getElementById('btn-next-stanza'),
    currentTimeLabel: document.getElementById('current-time-label'),
    totalTimeLabel: document.getElementById('total-time-label'),
    timelineSliderBox: document.getElementById('timeline-slider-box'),
    timelineFill: document.getElementById('timeline-fill'),
    timelineHandle: document.getElementById('timeline-handle'),
    chapterMarkers: document.getElementById('chapter-markers-container'),
    scrubTooltip: document.getElementById('scrub-tooltip'),
    trackVinylDisc: document.getElementById('track-vinyl-disc'),
    stanzaPillText: document.getElementById('stanza-pill-text'),
    headerChapterPill: document.getElementById('header-chapter-pill'),
    stanzaDropdown: document.getElementById('stanza-dropdown'),
    volumeSlider: document.getElementById('volume-slider'),
    volumeToggleBtn: document.getElementById('volume-toggle-btn'),
    volHighIcon: document.getElementById('vol-high-icon'),
    volMuteIcon: document.getElementById('vol-mute-icon'),

    // Modes & Overlays
    modePhotobookBtn: document.getElementById('mode-photobook-btn'),
    modeCinemaBtn: document.getElementById('mode-cinema-btn'),
    modeGalleryBtn: document.getElementById('mode-gallery-btn'),
    cinemaStage: document.getElementById('cinema-stage'),
    cinemaImg: document.getElementById('cinema-img'),
    cinemaPhotoBadge: document.getElementById('cinema-photo-badge'),
    cinemaChapterLabel: document.getElementById('cinema-chapter-label'),
    cinemaLyricLines: document.getElementById('cinema-lyric-lines'),
    cinemaBackdropPhoto: document.getElementById('cinema-backdrop-photo'),
    ambientBackdrop: document.getElementById('ambient-backdrop'),

    // Gallery & Lightbox
    galleryModal: document.getElementById('gallery-modal'),
    closeGalleryBtn: document.getElementById('close-gallery-btn'),
    galleryGrid: document.getElementById('gallery-grid'),
    galleryBackdrop: document.getElementById('gallery-backdrop'),
    lightboxModal: document.getElementById('lightbox-modal'),
    lightboxBackdrop: document.getElementById('lightbox-backdrop'),
    lightboxCloseBtn: document.getElementById('lightbox-close-btn'),
    lightboxImg: document.getElementById('lightbox-img'),
    lightboxCaption: document.getElementById('lightbox-caption'),

    // Sync Tool
    syncEditorModal: document.getElementById('sync-editor-modal'),
    syncEditorBackdrop: document.getElementById('sync-editor-backdrop'),
    openSyncBtn: document.getElementById('open-sync-btn'),
    closeSyncBtn: document.getElementById('close-sync-btn'),
    syncStanzasList: document.getElementById('sync-stanzas-list'),
    syncLiveTime: document.getElementById('sync-live-time'),
    syncPlayPauseBtn: document.getElementById('sync-play-pause-btn'),
    btnSaveTimings: document.getElementById('btn-save-timings'),
    saveBtnText: document.getElementById('save-btn-text'),
    btnResetTimings: document.getElementById('btn-reset-timings'),
    syncAddStanzaBtn: document.getElementById('sync-add-stanza-btn'),

    // Ambient, Audio & UI Actions
    particlesCanvas: document.getElementById('particle-canvas'),
    particlesToggleBtn: document.getElementById('particles-toggle-btn'),
    fullscreenBtn: document.getElementById('fullscreen-btn'),
    fsEnterIcon: document.getElementById('fs-enter-icon'),
    fsExitIcon: document.getElementById('fs-exit-icon'),
    linePaceSelect: document.getElementById('line-pace-select'),
    allowAudioBtn: document.getElementById('allow-audio-btn'),
    allowAudioText: document.getElementById('allow-audio-text'),
    audioUnlockBanner: document.getElementById('audio-unlock-banner'),
    bannerPlayBtn: document.getElementById('banner-play-btn'),

    // Finale
    finaleCelebration: document.getElementById('finale-celebration'),
    confettiCanvas: document.getElementById('confetti-canvas'),
    finaleReplayBtn: document.getElementById('finale-replay-btn'),
    finaleGalleryBtn: document.getElementById('finale-gallery-btn')
  };

  // Handwritten aesthetic captions for scrapbook
  const aestheticCaptions = [
    "“Pure sunshine in every single frame”",
    "“Radiant, resilient, and true”",
    "“A calm harbor in a rushing world”",
    "“Chapter 22: Blooming gracefully”",
    "“Gentle strength that outlasts the storm”",
    "“In a sea of flowers, you shine brightest”",
    "“Your smile lights up every room”",
    "“A soul deeply cherished & true”",
    "“Effortless laughter and enduring peace”",
    "“The truth of who you are: lovely”",
    "“Warmth that softens every worry”",
    "“Every passing year brings more grace”",
    "“A never-ending burn of happiness”",
    "“Unwavering courage, tender heart”",
    "“Gratitude for the gift of you”",
    "“Boundless grace & adored beyond words”",
    "“Always the loveliest soul of all”",
    "“Happy 22nd Birthday, Lovely Shane! ❦”"
  ];

  // =========================================================================
  // 1. INITIALIZATION & DATA LOADING
  // =========================================================================
  async function init() {
    try {
      const response = await fetch('/api/data');
      if (!response.ok) throw new Error('Failed to load data');
      const data = await response.json();
      state.data = data;
      state.stanzas = data.stanzas || [];
      state.allPhotos = data.all_photos || [];
      state.audioDuration = data.song?.duration || 201.10;

      // Populate UI
      setupChapterMarkers();
      setupStanzaDropdown();
      populateGallery();
      initParticles();
      attachEventListeners();

      // Setup All Stanzas for Spotify-style lyrics auto-scrolling
      renderAllSpotifyLyrics();

      // Render initial spread
      renderSpread(0, 'init');

      // Attempt automatic audio playback & unblock
      unlockAndPlayAudio();

      // Start 60 FPS millisecond-accurate sync engine
      startSyncLoop();

      console.log('Purple Wonderland Photobook initialized with', state.stanzas.length, 'stanzas.');
    } catch (err) {
      console.error('Initialization error:', err);
    }
  }

  // =========================================================================
  // 2. AUDIO PLAYBACK & SYNCHRONIZATION ENGINE (ALWAYS ALLOW AUDIO)
  // =========================================================================
  function unlockAndPlayAudio() {
    initAudioContext();
    if (elements.audio.paused) {
      elements.audio.play().then(() => {
        state.isPlaying = true;
        updatePlayIcons();
        hideAudioUnlockBanner();
        localStorage.setItem('shane_audio_allowed', 'true');
        if (elements.allowAudioText) {
          elements.allowAudioText.textContent = "Audio Playing";
        }
        startSyncLoop();
      }).catch(err => {
        // Browser autoplay policy requires user interaction first
        console.log('Audio autoplay prevented by browser policy, awaiting user gesture:', err);
        showAudioUnlockBanner();
      });
    }
  }

  function showAudioUnlockBanner() {
    if (elements.audioUnlockBanner && !state.isPlaying && !state.hasManuallyPaused) {
      elements.audioUnlockBanner.classList.remove('hidden');
    }
  }

  function hideAudioUnlockBanner() {
    if (elements.audioUnlockBanner) {
      elements.audioUnlockBanner.classList.add('hidden');
    }
  }

  function startExperience(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    openBook();
    hideAudioUnlockBanner();

    // Directly trigger playback on user gesture
    initAudioContext();
    elements.audio.play().then(() => {
      state.isPlaying = true;
      updatePlayIcons();
      if (elements.allowAudioText) {
        elements.allowAudioText.textContent = "Audio Playing";
      }
      startSyncLoop();
    }).catch(err => {
      console.warn('Audio play request:', err);
    });
  }

  function togglePlay() {
    initAudioContext();
    if (elements.audio.paused) {
      state.hasManuallyPaused = false;
      if (!state.isBookOpened) {
        openBook();
      }
      hideAudioUnlockBanner();
      elements.audio.play().then(() => {
        state.isPlaying = true;
        updatePlayIcons();
        if (elements.allowAudioText) {
          elements.allowAudioText.textContent = "Audio Playing";
        }
        startSyncLoop();
      }).catch(err => {
        console.warn('Playback error:', err);
      });
    } else {
      elements.audio.pause();
      state.isPlaying = false;
      state.hasManuallyPaused = true;
      updatePlayIcons();
      if (elements.allowAudioText) {
        elements.allowAudioText.textContent = "Audio Paused";
      }
    }
  }

  function updatePlayIcons() {
    if (state.isPlaying) {
      elements.playIcon.classList.add('hidden');
      elements.pauseIcon.classList.remove('hidden');
      elements.trackVinylDisc.classList.add('spinning');
      if (elements.allowAudioText) {
        elements.allowAudioText.textContent = "Audio Playing";
      }
    } else {
      elements.playIcon.classList.remove('hidden');
      elements.pauseIcon.classList.add('hidden');
      elements.trackVinylDisc.classList.remove('spinning');
      if (elements.allowAudioText) {
        elements.allowAudioText.textContent = "Audio Allowed";
      }
    }
  }

  function openBook() {
    if (state.isBookOpened) return;
    state.isBookOpened = true;
    playPageFlipSound();

    elements.bookCoverStage.classList.add('opening');
    setTimeout(() => {
      elements.bookCoverStage.classList.add('hidden');
      elements.openBookStage.classList.remove('hidden');
    }, 700);
  }

  /**
   * Main sync engine running at 60fps and on timeupdate for pinpoint millisecond sync
   */
  let syncRafId = null;

  function syncAudioEngine() {
    if (state.isScrubbing || !elements.audio) return;

    const currentTime = elements.audio.currentTime;
    const duration = elements.audio.duration || state.audioDuration;

    // Update time labels
    elements.currentTimeLabel.textContent = formatTime(currentTime);
    elements.totalTimeLabel.textContent = formatTime(duration);

    // Update progress bar
    const progressPercent = Math.min((currentTime / duration) * 100, 100);
    elements.timelineFill.style.width = `${progressPercent}%`;
    elements.timelineHandle.style.left = `${progressPercent}%`;

    // AUTO TRANSITION: Instant millisecond sync to the next chapter on the musical beat
    const activeIdx = findActiveStanzaIndex(currentTime);
    if (activeIdx !== -1 && activeIdx !== state.currentStanzaIdx) {
      const direction = activeIdx > state.currentStanzaIdx ? 'next' : 'prev';
      state.currentStanzaIdx = activeIdx;
      // Trigger automatic photobook transition IMMEDIATELY on the beat (0ms delay)
      renderSpread(activeIdx, direction);
    }

    // Update Spotify-style lyric highlighting
    updateSpotifyLyrics(currentTime);

    // Update chapter markers passed state
    updateChapterMarkersState(progressPercent);

    // If song reaches end, trigger finale
    if (currentTime >= duration - 0.3) {
      triggerFinale();
    }
  }

  function onAudioTimeUpdate() {
    syncAudioEngine();
  }

  function startSyncLoop() {
    if (syncRafId) cancelAnimationFrame(syncRafId);
    function tick() {
      if (state.isPlaying && elements.audio && !elements.audio.paused && !state.isScrubbing) {
        syncAudioEngine();
      }
      syncRafId = requestAnimationFrame(tick);
    }
    syncRafId = requestAnimationFrame(tick);
  }

  function findActiveStanzaIndex(time) {
    for (let i = 0; i < state.stanzas.length; i++) {
      const stanza = state.stanzas[i];
      if (time >= stanza.startTime && time < stanza.endTime) {
        return i;
      }
    }
    if (time >= state.stanzas[state.stanzas.length - 1]?.endTime) {
      return state.stanzas.length - 1;
    }
    return 0;
  }

  // =========================================================================
  // 3. SPOTIFY-STYLE LYRICS AUTO-SCROLL & LINE POP-OUT ENGINE (SLOWER & DREAMY)
  // =========================================================================

  /**
   * Calculates natural, word-weighted line timings so reading is calm,
   * unhurried, and comfortable with zero rushing.
   */
  function calculateWeightedLineTimings(stanza) {
    const lines = stanza.lines || [];
    if (lines.length === 0) return [];

    const stanzaDuration = Math.max(stanza.endTime - stanza.startTime, 1.0);
    const lineCount = lines.length;

    // Weight lines based on word count, syllable length, and punctuation pauses
    const weights = lines.map(line => {
      const words = line.trim().split(/\s+/).filter(w => w.length > 0);
      let weight = Math.max(words.length, 2.0);
      if (/[,.?!:;]$/.test(line.trim())) weight += 1.2;
      return weight;
    });

    const totalWeight = weights.reduce((sum, w) => sum + w, 0) || 1;
    let cursor = stanza.startTime;

    return lines.map((line, idx) => {
      const duration = (weights[idx] / totalWeight) * stanzaDuration;
      const start = cursor;
      const end = cursor + duration;
      cursor = end;
      return {
        lineIdx: idx,
        text: line,
        startTime: start,
        endTime: end
      };
    });
  }

  /**
   * Pre-renders current stanza lines into the parchment view
   */
  function renderAllSpotifyLyrics() {
    if (state.stanzas && state.stanzas.length > 0) {
      const activeIdx = state.currentStanzaIdx || 0;
      applySpreadContent(state.stanzas[activeIdx], activeIdx);
    }
  }

  /**
   * Updates stanza progress bar smoothly as the song plays through the active stanza
   */
  function updateSpotifyLyrics(currentTime) {
    const currentStanza = state.stanzas[state.currentStanzaIdx];
    if (!currentStanza) return;

    const stanzaStart = currentStanza.startTime;
    const stanzaEnd = currentStanza.endTime;
    const stanzaDuration = Math.max(stanzaEnd - stanzaStart, 1.0);
    const elapsedInStanza = Math.max(currentTime - stanzaStart, 0);

    // Mini progress bar on page footer smoothly tracks current stanza progress
    const stanzaProgress = Math.min((elapsedInStanza / stanzaDuration) * 100, 100);
    if (elements.stanzaMiniFill) {
      elements.stanzaMiniFill.style.width = `${stanzaProgress}%`;
    }
  }

  // =========================================================================
  // 4. 3D PHOTOBOOK SPREAD RENDERING & ZERO-DELAY CHAPTER SYNC
  // =========================================================================
  function renderSpread(stanzaIdx, direction = 'none') {
    const stanza = state.stanzas[stanzaIdx];
    if (!stanza) return;

    // 1. Apply new chapter content IMMEDIATELY with 0ms delay so visuals are 100% in sync with the song!
    applySpreadContent(stanza, stanzaIdx);

    // 2. Play snappy paper swoosh & 3D paper curl flourish
    if (direction === 'next' || direction === 'prev') {
      executePageFlipAnimation(direction);
    }

    // 3. Update bottom player badge & dropdown immediately
    const chapterNumStr = `Chapter ${stanzaIdx + 1}: ${stanza.title || 'Salutation'}`;
    elements.stanzaPillText.textContent = chapterNumStr;
    elements.headerChapterPill.textContent = `Chapter ${formatRoman(stanzaIdx + 1)}`;
    elements.stanzaDropdown.value = stanzaIdx;

    // 4. Update Cinema Mode backdrop & photo immediately
    updateCinemaMode(stanza, stanzaIdx);
  }

  function applySpreadContent(stanza, stanzaIdx) {
    // 1. Page Numbers & Headers
    const leftPageNo = (stanzaIdx * 2) + 1;
    const rightPageNo = leftPageNo + 1;
    elements.leftPageNumber.textContent = `P. ${String(leftPageNo).padStart(2, '0')}`;
    elements.rightPageNumber.textContent = `P. ${String(rightPageNo).padStart(2, '0')}`;
    elements.rightChapterNum.textContent = `CHAPTER ${String(stanzaIdx + 1).padStart(2, '0')}`;
    elements.stanzaChapterTitle.textContent = stanza.title || `Chapter ${stanzaIdx + 1}`;

    // 2. Scrapbook Caption
    elements.scrapbookCaption.textContent = aestheticCaptions[stanzaIdx % aestheticCaptions.length];

    // 3. Render Moving Photo Montage (Left Page)
    renderPhotoMontage(stanza.photos || []);

    // 4. Render All Lines of the Active Stanza Together (Right Page)
    if (elements.stanzaLinesWrapper) {
      elements.stanzaLinesWrapper.innerHTML = '';

      const card = document.createElement('div');
      card.className = 'current-stanza-card';
      if (stanza.lines && stanza.lines.length >= 5) {
        card.classList.add('dense-stanza');
      } else if (stanza.lines && stanza.lines.length <= 1) {
        card.classList.add('salutation-stanza');
      }
      card.id = `current-stanza-${stanzaIdx}`;

      (stanza.lines || []).forEach((lineText, idx) => {
        const lineEl = document.createElement('div');
        lineEl.className = 'stanza-line-text';
        lineEl.textContent = lineText;
        lineEl.dataset.lineIdx = idx;
        card.appendChild(lineEl);
      });

      elements.stanzaLinesWrapper.appendChild(card);
      elements.stanzaLinesWrapper.scrollTop = 0;
    }

    // 5. Render Cinema lines for current stanza (All lines together)
    if (elements.cinemaLyricLines) {
      elements.cinemaLyricLines.innerHTML = '';
      (stanza.lines || []).forEach((lineText, idx) => {
        const cinemaLineEl = document.createElement('div');
        cinemaLineEl.className = 'cinema-line-text';
        cinemaLineEl.textContent = lineText;
        cinemaLineEl.dataset.lineIdx = idx;
        elements.cinemaLyricLines.appendChild(cinemaLineEl);
      });
    }

    // 6. Update guide badge
    if (elements.guideBadgeText) {
      elements.guideBadgeText.textContent = `Chapter ${stanzaIdx + 1} of ${state.stanzas.length} • In Sync`;
    }
  }

  /**
   * Renders the moving Polaroid Scrapbook montage for the left page of the photobook
   */
  function renderPhotoMontage(photos) {
    if (!elements.photoMontageContainer) return;
    elements.photoMontageContainer.innerHTML = '';

    // Fallback if photos array is empty
    const displayPhotos = (photos && photos.length > 0)
      ? photos
      : (state.allPhotos && state.allPhotos.length > 0 ? [state.allPhotos[state.currentStanzaIdx % state.allPhotos.length]] : []);

    const photoCount = displayPhotos.length;
    let layoutClass = 'montage-single';
    if (photoCount === 2) layoutClass = 'montage-dual';
    else if (photoCount >= 3) layoutClass = 'montage-triple';

    elements.photoMontageContainer.className = `photo-montage-container ${layoutClass}`;

    displayPhotos.forEach((photoName, i) => {
      const card = document.createElement('div');
      card.className = 'polaroid-card';

      // Translucent Lavender Washi Tape
      const tape = document.createElement('div');
      tape.className = `washi-tape ${i === 0 ? 'tape-top-center' : (i === 1 ? 'tape-top-left' : 'tape-top-right')}`;
      card.appendChild(tape);

      const imgBox = document.createElement('div');
      imgBox.className = 'polaroid-img-box';

      // Moving image with Ken-Burns pan/zoom and reflection shimmer
      const img = document.createElement('img');
      img.src = `/media/photo/${encodeURIComponent(photoName)}`;
      img.alt = `Memory of Shane - ${photoName}`;
      img.loading = 'lazy';
      imgBox.appendChild(img);
      card.appendChild(imgBox);

      const caption = document.createElement('div');
      caption.className = 'polaroid-caption';
      caption.textContent = getPhotoFriendlyCaption(photoName, i);
      card.appendChild(caption);

      // Lightbox click
      card.addEventListener('click', () => {
        openLightbox(`/media/photo/${encodeURIComponent(photoName)}`, caption.textContent);
      });

      elements.photoMontageContainer.appendChild(card);
    });
  }

  function getPhotoFriendlyCaption(filename, idx) {
    if (!filename) return `Memory #${idx + 1}`;
    if (filename.includes('pic1')) return "Where Wonder Begins";
    if (filename.includes('pic2')) return "Effortless Radiance";
    if (filename.includes('pic3')) return "Isn't She Lovely";
    if (filename.includes('pic4')) return "Gentle Moments";
    if (filename.includes('pic5')) return "Happy 22nd Birthday!";
    if (filename.includes('pic6')) return "Looking Back";
    if (filename.includes('pic7')) return "Golden Sunshine";
    if (filename.includes('pic8')) return "Inspiring Grace";
    if (filename.includes('pic9')) return "Grounded & True";
    return `Shane's Memory #${idx + 1}`;
  }

  /**
   * Snappy 3D Paper Turn Animation with Web Audio swoosh (Quick & Responsive)
   */
  function executePageFlipAnimation(direction) {
    playPageFlipSound();

    elements.turningPage.classList.remove('hidden', 'flipping-next', 'flipping-prev');
    void elements.turningPage.offsetWidth; // trigger reflow

    const animClass = direction === 'next' ? 'flipping-next' : 'flipping-prev';
    elements.turningPage.classList.add(animClass);

    setTimeout(() => {
      elements.turningPage.classList.remove('hidden', 'flipping-next', 'flipping-prev');
      elements.turningPage.classList.add('hidden');
    }, 450);
  }

  function goToStanza(idx) {
    if (idx < 0 || idx >= state.stanzas.length) return;
    const targetStanza = state.stanzas[idx];
    if (!targetStanza) return;

    elements.audio.currentTime = targetStanza.startTime;
    const direction = idx > state.currentStanzaIdx ? 'next' : 'prev';
    state.currentStanzaIdx = idx;
    renderSpread(idx, direction);
  }

  // =========================================================================
  // 5. CINEMA LYRIC VIDEO MODE
  // =========================================================================
  function updateCinemaMode(stanza, stanzaIdx) {
    if (!stanza) return;
    const primaryPhoto = (stanza.photos && stanza.photos.length > 0)
      ? stanza.photos[0]
      : (state.allPhotos && state.allPhotos.length > 0 ? state.allPhotos[stanzaIdx % state.allPhotos.length] : '');

    if (primaryPhoto) {
      const photoUrl = `/media/photo/${encodeURIComponent(primaryPhoto)}`;
      if (elements.cinemaImg) elements.cinemaImg.src = photoUrl;
      if (elements.cinemaBackdropPhoto) elements.cinemaBackdropPhoto.style.backgroundImage = `url('${photoUrl}')`;
      if (elements.ambientBackdrop) {
        elements.ambientBackdrop.style.backgroundImage = `radial-gradient(circle at center, rgba(45, 12, 75, 0.65) 0%, rgba(10, 4, 20, 0.95) 100%), url('${photoUrl}')`;
        elements.ambientBackdrop.style.backgroundSize = 'cover';
        elements.ambientBackdrop.style.backgroundPosition = 'center';
      }
    }
    if (elements.cinemaChapterLabel) {
      elements.cinemaChapterLabel.textContent = `CHAPTER ${String(stanzaIdx + 1).padStart(2, '0')} • ${stanza.title || ''}`;
    }
    if (elements.cinemaPhotoBadge) {
      elements.cinemaPhotoBadge.textContent = `Memory ${stanzaIdx + 1} of ${state.stanzas.length}`;
    }
  }

  function setViewMode(mode) {
    state.currentMode = mode;
    document.body.className = `mode-${mode}`;

    elements.modePhotobookBtn.classList.toggle('active', mode === 'photobook');
    elements.modeCinemaBtn.classList.toggle('active', mode === 'cinema');
    elements.modeGalleryBtn.classList.toggle('active', mode === 'gallery');

    if (mode === 'photobook') {
      elements.cinemaStage.classList.add('hidden');
      elements.galleryModal.classList.add('hidden');
      if (state.isBookOpened) {
        elements.openBookStage.classList.remove('hidden');
      } else {
        elements.bookCoverStage.classList.remove('hidden');
      }
    } else if (mode === 'cinema') {
      elements.openBookStage.classList.add('hidden');
      elements.bookCoverStage.classList.add('hidden');
      elements.galleryModal.classList.add('hidden');
      elements.cinemaStage.classList.remove('hidden');
      updateCinemaMode(state.stanzas[state.currentStanzaIdx], state.currentStanzaIdx);
      if (elements.audio.paused && !state.isBookOpened) {
        togglePlay();
      }
    } else if (mode === 'gallery') {
      elements.galleryModal.classList.remove('hidden');
    }
  }

  // =========================================================================
  // 6. GALLERY & LIGHTBOX
  // =========================================================================
  function populateGallery() {
    elements.galleryGrid.innerHTML = '';
    state.allPhotos.forEach((photoName, i) => {
      const item = document.createElement('div');
      item.className = 'gallery-item';

      const box = document.createElement('div');
      box.className = 'gallery-item-img-box';

      const img = document.createElement('img');
      img.src = `/media/photo/${encodeURIComponent(photoName)}`;
      img.alt = photoName;
      img.loading = 'lazy';
      box.appendChild(img);
      item.appendChild(box);

      const label = document.createElement('div');
      label.className = 'gallery-item-label';
      label.textContent = `Memory #${i + 1}`;
      item.appendChild(label);

      item.addEventListener('click', () => {
        openLightbox(`/media/photo/${encodeURIComponent(photoName)}`, `Lovely Shane • Memory #${i + 1}`);
      });

      elements.galleryGrid.appendChild(item);
    });
  }

  function openLightbox(src, caption) {
    elements.lightboxImg.src = src;
    elements.lightboxCaption.textContent = caption || 'Lovely Shane';
    elements.lightboxModal.classList.remove('hidden');
  }

  function closeLightbox() {
    elements.lightboxModal.classList.add('hidden');
  }

  // =========================================================================
  // 7. INTERACTIVE SYNC TIMING & STANZA EDITOR (ALLOW YOU TO ADD & CUSTOMIZE)
  // =========================================================================
  function addNewStanzaPrompt() {
    const currentAudioTime = Math.round(elements.audio.currentTime * 10) / 10;
    const nextIdx = state.stanzas.length + 1;
    const prevEnd = state.stanzas.length > 0 ? state.stanzas[state.stanzas.length - 1].endTime : 0;
    const defaultStart = currentAudioTime > 0 ? currentAudioTime : prevEnd;
    const defaultEnd = Math.min(Math.round((defaultStart + 12.0) * 10) / 10, state.audioDuration);

    const newStanza = {
      id: nextIdx,
      title: `Chapter ${nextIdx}`,
      startTime: defaultStart,
      endTime: defaultEnd,
      lines: [
        "A cherished new thought for Lovely Shane..."
      ],
      text: "A cherished new thought for Lovely Shane...",
      photos: state.allPhotos.length > 0 ? [state.allPhotos[(nextIdx - 1) % state.allPhotos.length]] : []
    };

    state.stanzas.push(newStanza);
    populateSyncEditor();
    setupChapterMarkers();
    setupStanzaDropdown();
    renderAllSpotifyLyrics();

    setTimeout(() => {
      const lastRow = elements.syncStanzasList.lastElementChild;
      if (lastRow) {
        lastRow.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  }

  function populateSyncEditor() {
    elements.syncStanzasList.innerHTML = '';

    state.stanzas.forEach((stanza, i) => {
      const row = document.createElement('div');
      row.className = 'sync-row';
      row.style.flexDirection = 'column';
      row.style.alignItems = 'stretch';
      row.style.gap = '8px';

      // Top bar of stanza row: Chap badge, editable title, time controls & remove button
      const topBar = document.createElement('div');
      topBar.style.display = 'flex';
      topBar.style.alignItems = 'center';
      topBar.style.gap = '10px';
      topBar.style.flexWrap = 'wrap';

      const idSpan = document.createElement('span');
      idSpan.className = 'sync-row-id';
      idSpan.textContent = `Chap ${i + 1}`;
      topBar.appendChild(idSpan);

      const titleInput = document.createElement('input');
      titleInput.type = 'text';
      titleInput.className = 'sync-line-input';
      titleInput.style.flex = '1';
      titleInput.style.minWidth = '140px';
      titleInput.value = stanza.title || `Chapter ${i + 1}`;
      titleInput.placeholder = 'Chapter title...';
      titleInput.id = `sync-title-${i}`;
      titleInput.addEventListener('change', (e) => {
        stanza.title = e.target.value.trim() || `Chapter ${i + 1}`;
      });
      topBar.appendChild(titleInput);

      const inputsDiv = document.createElement('div');
      inputsDiv.className = 'sync-inputs';

      const startLabel = document.createElement('label');
      startLabel.textContent = 'Start:';
      const startInput = document.createElement('input');
      startInput.type = 'number';
      startInput.step = '0.1';
      startInput.className = 'sync-input-num';
      startInput.value = stanza.startTime;
      startInput.id = `sync-start-${i}`;

      const setStartBtn = document.createElement('button');
      setStartBtn.className = 'sync-btn-set';
      setStartBtn.textContent = '⏱ Here';
      setStartBtn.title = 'Set to current audio time';
      setStartBtn.addEventListener('click', () => {
        const t = Math.round(elements.audio.currentTime * 10) / 10;
        startInput.value = t;
        stanza.startTime = t;
      });

      const endLabel = document.createElement('label');
      endLabel.textContent = 'End:';
      const endInput = document.createElement('input');
      endInput.type = 'number';
      endInput.step = '0.1';
      endInput.className = 'sync-input-num';
      endInput.value = stanza.endTime;
      endInput.id = `sync-end-${i}`;

      const setEndBtn = document.createElement('button');
      setEndBtn.className = 'sync-btn-set';
      setEndBtn.textContent = '⏱ Here';
      setEndBtn.title = 'Set to current audio time';
      setEndBtn.addEventListener('click', () => {
        const t = Math.round(elements.audio.currentTime * 10) / 10;
        endInput.value = t;
        stanza.endTime = t;
      });

      startInput.addEventListener('change', () => {
        stanza.startTime = parseFloat(startInput.value) || 0;
      });
      endInput.addEventListener('change', () => {
        stanza.endTime = parseFloat(endInput.value) || 0;
      });

      inputsDiv.appendChild(startLabel);
      inputsDiv.appendChild(startInput);
      inputsDiv.appendChild(setStartBtn);
      inputsDiv.appendChild(endLabel);
      inputsDiv.appendChild(endInput);
      inputsDiv.appendChild(setEndBtn);
      topBar.appendChild(inputsDiv);

      // Stanza actions: Add Line, Delete Chapter
      const rowActions = document.createElement('div');
      rowActions.className = 'sync-row-actions';

      const addLineBtn = document.createElement('button');
      addLineBtn.className = 'sync-btn-line-add';
      addLineBtn.innerHTML = '➕ Add Line';
      addLineBtn.title = 'Add new line to this chapter';
      addLineBtn.addEventListener('click', () => {
        if (!stanza.lines) stanza.lines = [];
        stanza.lines.push('New line thought...');
        stanza.text = stanza.lines.join('\n');
        populateSyncEditor();
      });
      rowActions.appendChild(addLineBtn);

      const delStanzaBtn = document.createElement('button');
      delStanzaBtn.className = 'sync-btn-delete';
      delStanzaBtn.innerHTML = '🗑 Delete';
      delStanzaBtn.title = 'Remove this chapter';
      delStanzaBtn.addEventListener('click', () => {
        if (state.stanzas.length <= 1) {
          alert('Cannot delete the last remaining chapter.');
          return;
        }
        if (confirm(`Delete Chapter ${i + 1}: "${stanza.title}"?`)) {
          state.stanzas.splice(i, 1);
          state.stanzas.forEach((s, idx) => s.id = idx + 1);
          populateSyncEditor();
          setupChapterMarkers();
          setupStanzaDropdown();
          renderAllSpotifyLyrics();
        }
      });
      rowActions.appendChild(delStanzaBtn);

      topBar.appendChild(rowActions);
      row.appendChild(topBar);

      // Lines editor section for this stanza
      const linesSection = document.createElement('div');
      linesSection.className = 'sync-stanza-details';

      const linesList = document.createElement('div');
      linesList.className = 'sync-lines-edit-list';

      (stanza.lines || []).forEach((lineText, lIdx) => {
        const lineRow = document.createElement('div');
        lineRow.style.display = 'flex';
        lineRow.style.alignItems = 'center';
        lineRow.style.gap = '6px';

        const lineNumSpan = document.createElement('span');
        lineNumSpan.style.fontSize = '0.72rem';
        lineNumSpan.style.color = '#c084fc';
        lineNumSpan.style.width = '20px';
        lineNumSpan.textContent = `L${lIdx + 1}:`;
        lineRow.appendChild(lineNumSpan);

        const lineInput = document.createElement('input');
        lineInput.type = 'text';
        lineInput.className = 'sync-line-input';
        lineInput.value = lineText;
        lineInput.id = `sync-line-${i}-${lIdx}`;
        lineInput.placeholder = 'Type lyric / letter sentence...';
        lineInput.addEventListener('change', (e) => {
          stanza.lines[lIdx] = e.target.value;
          stanza.text = stanza.lines.join('\n');
        });
        lineRow.appendChild(lineInput);

        // Remove line button
        if (stanza.lines.length > 1) {
          const rmLineBtn = document.createElement('button');
          rmLineBtn.className = 'sync-btn-delete';
          rmLineBtn.style.padding = '2px 6px';
          rmLineBtn.textContent = '✕';
          rmLineBtn.title = 'Remove this line';
          rmLineBtn.addEventListener('click', () => {
            stanza.lines.splice(lIdx, 1);
            stanza.text = stanza.lines.join('\n');
            populateSyncEditor();
          });
          lineRow.appendChild(rmLineBtn);
        }

        linesList.appendChild(lineRow);
      });

      linesSection.appendChild(linesList);
      row.appendChild(linesSection);

      elements.syncStanzasList.appendChild(row);
    });
  }

  async function saveTimingsToServer() {
    elements.saveBtnText.textContent = 'Saving...';
    try {
      state.stanzas.forEach((stanza, i) => {
        const startVal = parseFloat(document.getElementById(`sync-start-${i}`)?.value);
        const endVal = parseFloat(document.getElementById(`sync-end-${i}`)?.value);
        const titleVal = document.getElementById(`sync-title-${i}`)?.value;

        if (!isNaN(startVal)) stanza.startTime = startVal;
        if (!isNaN(endVal)) stanza.endTime = endVal;
        if (titleVal) stanza.title = titleVal.trim();

        // Collect lines
        if (stanza.lines) {
          for (let lIdx = 0; lIdx < stanza.lines.length; lIdx++) {
            const lineInput = document.getElementById(`sync-line-${i}-${lIdx}`);
            if (lineInput && lineInput.value.trim()) {
              stanza.lines[lIdx] = lineInput.value.trim();
            }
          }
          stanza.text = stanza.lines.join('\n');
        }
      });

      const payload = {
        ...state.data,
        stanzas: state.stanzas
      };

      const res = await fetch('/api/save-timings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to save');
      elements.saveBtnText.textContent = '✓ Saved Successfully!';
      setupChapterMarkers();
      setupStanzaDropdown();
      renderAllSpotifyLyrics();
      renderSpread(state.currentStanzaIdx, 'none');

      setTimeout(() => {
        elements.saveBtnText.textContent = 'Save Changes to Server';
        elements.syncEditorModal.classList.add('hidden');
      }, 900);
    } catch (err) {
      console.error(err);
      elements.saveBtnText.textContent = 'Error saving';
      setTimeout(() => {
        elements.saveBtnText.textContent = 'Save Changes to Server';
      }, 1500);
    }
  }

  // =========================================================================
  // 8. WEB AUDIO REALISTIC PAPER SWOOSH SOUND EFFECT
  // =========================================================================
  function initAudioContext() {
    if (!state.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        state.audioCtx = new AudioContext();
      }
    }
    if (state.audioCtx && state.audioCtx.state === 'suspended') {
      state.audioCtx.resume();
    }
  }

  function playPageFlipSound() {
    try {
      initAudioContext();
      if (!state.audioCtx) return;

      const ctx = state.audioCtx;
      const bufferSize = ctx.sampleRate * 0.18; // 180ms
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Generate soft pinkish paper swoosh noise
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        data[i] = (b0 + b1 + b2) * 0.08;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      // Bandpass filter to emulate paper friction
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.18);
      filter.Q.setValueAtTime(2.2, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
    } catch (e) {
      // Silently proceed
    }
  }

  // =========================================================================
  // 9. PURPLE WONDERLAND AMBIENT PARTICLES
  // =========================================================================
  function initParticles() {
    const canvas = elements.particlesCanvas;
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const count = 40;

    for (let i = 0; i < count; i++) {
      const typeRand = Math.random();
      let type = 'firefly';
      if (typeRand > 0.65) type = 'butterfly';
      else if (typeRand > 0.35) type = 'petal';

      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        type: type,
        size: Math.random() * 8 + 6,
        speedX: (Math.random() - 0.5) * 1.4,
        speedY: type === 'firefly' ? (Math.random() - 0.5) * 0.8 : (Math.random() * 0.8 + 0.4),
        angle: Math.random() * Math.PI * 2,
        angleSpeed: (Math.random() - 0.5) * 0.03,
        opacity: Math.random() * 0.6 + 0.25,
        pulseSpeed: Math.random() * 0.04 + 0.02
      });
    }

    function render() {
      ctx.clearRect(0, 0, width, height);

      if (state.particlesActive) {
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.x += p.speedX;
          p.y += p.speedY;
          p.angle += p.angleSpeed;

          // Boundary wrap
          if (p.y > height + 20) { p.y = -20; p.x = Math.random() * width; }
          if (p.y < -20) { p.y = height + 20; p.x = Math.random() * width; }
          if (p.x > width + 20) p.x = -20;
          if (p.x < -20) p.x = width + 20;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.angle);
          ctx.globalAlpha = p.opacity;

          if (p.type === 'butterfly') {
            // Purple Wonderland Butterfly
            ctx.fillStyle = '#c084fc';
            ctx.beginPath();
            // Left wing
            ctx.ellipse(-p.size * 0.5, 0, p.size * 0.6, p.size * 0.35, Math.sin(p.angle * 2) * 0.4, 0, Math.PI * 2);
            // Right wing
            ctx.ellipse(p.size * 0.5, 0, p.size * 0.6, p.size * 0.35, -Math.sin(p.angle * 2) * 0.4, 0, Math.PI * 2);
            ctx.fill();
          } else if (p.type === 'petal') {
            // Soft lavender rose petal
            ctx.fillStyle = '#e9d5ff';
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(p.size, -p.size * 0.5, p.size * 0.5, p.size);
            ctx.quadraticCurveTo(0, p.size * 1.4, 0, 0);
            ctx.fill();
          } else {
            // Glowing Amethyst Firefly
            ctx.fillStyle = '#fef08a';
            ctx.shadowColor = '#c084fc';
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.arc(0, 0, p.size * 0.28, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }
      }

      requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
  }

  // =========================================================================
  // 10. CHAPTER MARKERS & TIMELINE CONTROLS
  // =========================================================================
  function setupChapterMarkers() {
    elements.chapterMarkers.innerHTML = '';
    const totalDuration = state.audioDuration;

    state.stanzas.forEach((stanza, idx) => {
      const percent = (stanza.startTime / totalDuration) * 100;
      const marker = document.createElement('div');
      marker.className = 'chapter-marker-node';
      marker.style.left = `${percent}%`;
      marker.title = `Chapter ${idx + 1}: ${stanza.title}`;
      elements.chapterMarkers.appendChild(marker);
    });
  }

  function updateChapterMarkersState(progressPercent) {
    const nodes = elements.chapterMarkers.querySelectorAll('.chapter-marker-node');
    nodes.forEach((node, i) => {
      const stanza = state.stanzas[i];
      if (stanza) {
        const markerPercent = (stanza.startTime / state.audioDuration) * 100;
        node.classList.toggle('passed', progressPercent >= markerPercent);
      }
    });
  }

  function setupStanzaDropdown() {
    elements.stanzaDropdown.innerHTML = '';
    state.stanzas.forEach((stanza, i) => {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = `Ch ${i + 1}: ${stanza.title || 'Salutation'}`;
      elements.stanzaDropdown.appendChild(opt);
    });

    elements.stanzaDropdown.addEventListener('change', (e) => {
      goToStanza(parseInt(e.target.value, 10));
    });
  }

  // =========================================================================
  // 11. FINALE CELEBRATION
  // =========================================================================
  function triggerFinale() {
    elements.finaleCelebration.classList.remove('hidden');
    startConfetti();
  }

  function startConfetti() {
    const canvas = elements.confettiCanvas;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const pieces = [];
    const colors = ['#c084fc', '#e9d5ff', '#ffd700', '#f472b6', '#a855f7'];

    for (let i = 0; i < 90; i++) {
      pieces.push({
        x: Math.random() * canvas.width,
        y: Math.random() * -canvas.height,
        size: Math.random() * 10 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedY: Math.random() * 3 + 2,
        speedX: (Math.random() - 0.5) * 2,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 6
      });
    }

    function loop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach(p => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.rotation += p.rotationSpeed;

        if (p.y > canvas.height) p.y = -20;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      });

      if (!elements.finaleCelebration.classList.contains('hidden')) {
        requestAnimationFrame(loop);
      }
    }

    requestAnimationFrame(loop);
  }

  // =========================================================================
  // 12. EVENT LISTENERS
  // =========================================================================
  function attachEventListeners() {
    // ALWAYS ALLOW AUDIO: Any tap or click anywhere on window unlocks audio immediately
    ['pointerdown', 'click', 'keydown', 'touchstart'].forEach(evtType => {
      window.addEventListener(evtType, () => {
        if (elements.audio.paused && !state.hasManuallyPaused) {
          unlockAndPlayAudio();
        }
      }, { passive: true });
    });

    // Line Pace Selector (Slow / Extra Slow / Normal)
    if (elements.linePaceSelect) {
      elements.linePaceSelect.value = state.linePace;
      elements.linePaceSelect.addEventListener('change', (e) => {
        state.linePace = e.target.value;
        localStorage.setItem('shane_line_pace', state.linePace);
        renderAllSpotifyLyrics();
      });
    }

    // Always Allow Audio Status Button in Top Nav
    if (elements.allowAudioBtn) {
      elements.allowAudioBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        togglePlay();
      });
    }

    // Always Allow Audio Floating Toast Banner
    if (elements.audioUnlockBanner) {
      elements.audioUnlockBanner.addEventListener('click', (e) => {
        e.stopPropagation();
        unlockAndPlayAudio();
        if (!state.isBookOpened) openBook();
      });
    }
    if (elements.bannerPlayBtn) {
      elements.bannerPlayBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        unlockAndPlayAudio();
        if (!state.isBookOpened) openBook();
      });
    }

    // Sync Editor Add Stanza Button
    if (elements.syncAddStanzaBtn) {
      elements.syncAddStanzaBtn.addEventListener('click', addNewStanzaPrompt);
    }

    // Open Book Hero Actions (fixed bubbling issue to guarantee immediate audio play)
    elements.btnOpenBook.addEventListener('click', (e) => {
      startExperience(e);
    });

    elements.closedBook.addEventListener('click', (e) => {
      if (e.target.closest('#btn-open-book')) return;
      startExperience(e);
    });

    // Audio Player State Listeners
    elements.audio.addEventListener('play', () => {
      state.isPlaying = true;
      updatePlayIcons();
      hideAudioUnlockBanner();
    });

    elements.audio.addEventListener('pause', () => {
      state.isPlaying = false;
      updatePlayIcons();
    });

    elements.audio.addEventListener('playing', () => {
      state.isPlaying = true;
      updatePlayIcons();
      hideAudioUnlockBanner();
    });

    elements.audio.addEventListener('timeupdate', onAudioTimeUpdate);
    elements.audio.addEventListener('ended', triggerFinale);

    // Playback Controls
    elements.btnPlayPause.addEventListener('click', (e) => {
      e.stopPropagation();
      togglePlay();
    });

    elements.btnPrevStanza.addEventListener('click', (e) => {
      e.stopPropagation();
      goToStanza(state.currentStanzaIdx - 1);
    });
    elements.btnNextStanza.addEventListener('click', (e) => {
      e.stopPropagation();
      goToStanza(state.currentStanzaIdx + 1);
    });
    elements.bookPrevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      goToStanza(state.currentStanzaIdx - 1);
    });
    elements.bookNextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      goToStanza(state.currentStanzaIdx + 1);
    });

    // Scrubber Interactions
    elements.timelineSliderBox.addEventListener('click', (e) => {
      const rect = elements.timelineSliderBox.getBoundingClientRect();
      const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const targetTime = pos * (elements.audio.duration || state.audioDuration);
      elements.audio.currentTime = targetTime;
    });

    elements.timelineSliderBox.addEventListener('mousemove', (e) => {
      const rect = elements.timelineSliderBox.getBoundingClientRect();
      const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const hoverTime = pos * (elements.audio.duration || state.audioDuration);
      elements.scrubTooltip.style.left = `${pos * 100}%`;
      elements.scrubTooltip.textContent = formatTime(hoverTime);
      elements.scrubTooltip.classList.remove('hidden');
    });

    elements.timelineSliderBox.addEventListener('mouseleave', () => {
      elements.scrubTooltip.classList.add('hidden');
    });

    // Volume Controls
    elements.volumeSlider.addEventListener('input', (e) => {
      elements.audio.volume = parseFloat(e.target.value);
      updateVolumeIcon();
    });

    elements.volumeToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      elements.audio.muted = !elements.audio.muted;
      updateVolumeIcon();
    });

    function updateVolumeIcon() {
      if (elements.audio.muted || elements.audio.volume === 0) {
        elements.volHighIcon.classList.add('hidden');
        elements.volMuteIcon.classList.remove('hidden');
      } else {
        elements.volHighIcon.classList.remove('hidden');
        elements.volMuteIcon.classList.add('hidden');
      }
    }

    // View Mode Toggles
    elements.modePhotobookBtn.addEventListener('click', () => setViewMode('photobook'));
    elements.modeCinemaBtn.addEventListener('click', () => setViewMode('cinema'));
    elements.modeGalleryBtn.addEventListener('click', () => setViewMode('gallery'));

    // Gallery & Lightbox Modals
    elements.closeGalleryBtn.addEventListener('click', () => {
      elements.galleryModal.classList.add('hidden');
      setViewMode('photobook');
    });
    elements.galleryBackdrop.addEventListener('click', () => {
      elements.galleryModal.classList.add('hidden');
      setViewMode('photobook');
    });

    elements.lightboxCloseBtn.addEventListener('click', closeLightbox);
    elements.lightboxBackdrop.addEventListener('click', closeLightbox);

    // Sync Editor Modal
    elements.openSyncBtn.addEventListener('click', () => {
      populateSyncEditor();
      elements.syncEditorModal.classList.remove('hidden');
    });
    elements.closeSyncBtn.addEventListener('click', () => {
      elements.syncEditorModal.classList.add('hidden');
    });
    elements.syncEditorBackdrop.addEventListener('click', () => {
      elements.syncEditorModal.classList.add('hidden');
    });
    elements.syncPlayPauseBtn.addEventListener('click', togglePlay);
    elements.btnSaveTimings.addEventListener('click', saveTimingsToServer);

    elements.btnResetTimings.addEventListener('click', async () => {
      if (confirm('Reset timings back to default template?')) {
        await init();
        populateSyncEditor();
      }
    });

    // Particle Toggle
    elements.particlesToggleBtn.addEventListener('click', () => {
      state.particlesActive = !state.particlesActive;
      elements.particlesToggleBtn.style.opacity = state.particlesActive ? '1' : '0.5';
    });

    // Fullscreen Toggle
    elements.fullscreenBtn.addEventListener('click', toggleFullscreen);

    // Finale Actions
    elements.finaleReplayBtn.addEventListener('click', () => {
      elements.finaleCelebration.classList.add('hidden');
      elements.audio.currentTime = 0;
      state.currentStanzaIdx = 0;
      renderSpread(0, 'init');
      elements.audio.play();
    });
    elements.finaleGalleryBtn.addEventListener('click', () => {
      elements.finaleCelebration.classList.add('hidden');
      setViewMode('gallery');
    });

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowRight' || e.code === 'KeyL') {
        goToStanza(state.currentStanzaIdx + 1);
      } else if (e.code === 'ArrowLeft' || e.code === 'KeyJ') {
        goToStanza(state.currentStanzaIdx - 1);
      } else if (e.code === 'KeyF') {
        toggleFullscreen();
      } else if (e.code === 'KeyM') {
        elements.audio.muted = !elements.audio.muted;
        updateVolumeIcon();
      } else if (e.code === 'Escape') {
        closeLightbox();
        elements.galleryModal.classList.add('hidden');
        elements.syncEditorModal.classList.add('hidden');
      }
    });

    // Sync editor real-time display timer
    setInterval(() => {
      if (!elements.syncEditorModal.classList.contains('hidden')) {
        elements.syncLiveTime.textContent = formatTime(elements.audio.currentTime);
      }
    }, 100);
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        elements.fsEnterIcon.classList.add('hidden');
        elements.fsExitIcon.classList.remove('hidden');
      }).catch(err => console.warn(err));
    } else {
      document.exitFullscreen().then(() => {
        elements.fsEnterIcon.classList.remove('hidden');
        elements.fsExitIcon.classList.add('hidden');
      }).catch(err => console.warn(err));
    }
  }

  // Utilities
  function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  function formatRoman(num) {
    const lookup = {
      18: 'XVIII', 17: 'XVII', 16: 'XVI', 15: 'XV', 14: 'XIV', 13: 'XIII',
      12: 'XII', 11: 'XI', 10: 'X', 9: 'IX', 8: 'VIII', 7: 'VII', 6: 'VI',
      5: 'V', 4: 'IV', 3: 'III', 2: 'II', 1: 'I'
    };
    return lookup[num] || String(num);
  }

  // Launch on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
