/* ═══════════════════════════════════════════════════
   AMZ LIAN — Playlist  ·  features.js (FIXED PERMANENT UI)
═══════════════════════════════════════════════════ */

console.log("⚡ features.js loaded! Premium Control Player Fixed Active.");

// ── 1. TIMPA FUNGSI UTAMA PLAY ──
window.runLivePlayer = function(song) {
  const trackList = getFilteredSorted();
  currentQueue = [...trackList];
  currentQueueIndex = currentQueue.findIndex(s => s.id === song.id);
  if(currentQueueIndex === -1) { currentQueue.push(song); currentQueueIndex = currentQueue.length - 1; }
  playCurrentQueueIndex(); // Memanggil fungsi antrean yang sudah kita amankan di bawah
};

// ── 2. ⚡ FIX UTAMA: TIMPA FUNGSI ANTREAN BIAR PAS NEXT GAK BALIK KE EMOT ⚡ ──
window.playCurrentQueueIndex = function() {
  if(currentQueueIndex < 0 || currentQueueIndex >= currentQueue.length) return;
  const song = currentQueue[currentQueueIndex];
  
  // Atur Posisi Sticky Player di Layar Terbawah
  if(miniPlayer) {
    miniPlayer.style.cssText = `
      position: fixed !important;
      bottom: 0 !important;
      left: 0 !important;
      width: 100% !important;
      z-index: 9999 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      background: rgba(10, 12, 18, 0.95) !important;
      backdrop-filter: blur(30px) !important;
      border-top: 1px solid rgba(255, 255, 255, 0.05) !important;
      padding: 14px 28px !important;
      box-shadow: 0 -10px 40px rgba(0,0,0,0.6) !important;
    `;
    miniPlayer.hidden = false;
  }

  if(playerTitle) playerTitle.textContent = song.title;
  if(playerArtist) playerArtist.textContent = song.artist;
  
  const pCoverUI = document.getElementById('playerCoverUI');
  if(pCoverUI) pCoverUI.src = song.cover || COVER_PLACEHOLDER;
  
  const glow = document.getElementById('bgGlow');
  if(glow) { glow.style.backgroundImage = `url('${song.cover}')`; glow.style.opacity = 0.5; }
  
  // Suntik Template Unik secara Permanen (Gak akan keganti pas pindah lagu)
  if(playerFrameContainer) {
    playerFrameContainer.innerHTML = `
      <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; width:100%; padding:0 15px; font-family:'Space Mono', monospace;">
        
        <div class="custom-controls" style="display:flex; align-items:center; gap:24px; margin-bottom:10px;">
          <button id="nxShuffle" title="Shuffle" style="background:none; border:none; color:${isShuffle ? 'var(--accent)' : '#4d5675'}; font-size:13px; font-weight:700; letter-spacing:-1px; cursor:pointer; transition:0.2s;">
            [SHF]
          </button>
          <button id="nxPrev" title="Previous" style="background:none; border:none; color:#fff; font-size:14px; font-weight:700; cursor:pointer; transition:0.2s; letter-spacing:-2px;">
            &lt;&lt;|
          </button>
          <button id="nxPlay" title="Play/Stop" style="background:#fff; border:none; color:#000; width:38px; height:38px; border-radius:50%; font-size:11px; font-weight:900; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:0 0 15px rgba(255,255,255,0.3); transition:0.2s;">
            ⏳
          </button>
          <button id="nxNext" title="Next" style="background:none; border:none; color:#fff; font-size:14px; font-weight:700; cursor:pointer; transition:0.2s; letter-spacing:-2px;">
            |&gt;&gt;
          </button>
          <button id="nxRepeat" title="Repeat" style="background:none; border:none; color:${isRepeat ? 'var(--accent)' : '#4d5675'}; font-size:13px; font-weight:700; letter-spacing:-1px; cursor:pointer; transition:0.2s;">
            [RPT]
          </button>
        </div>

        <div class="player-progress-container" style="display:flex; align-items:center; gap:12px; width:100%;">
          <span id="nxCurr" style="font-size:11px; color:#6b7394; min-width:35px; text-align:right;">0:00</span>
          <input id="nxProg" type="range" value="0" min="0" max="100" class="progress-bar" style="flex:1; accent-color:var(--accent); height:4px; background:rgba(255,255,255,0.1); border-radius:4px; cursor:pointer;" />
          <span id="nxDur" style="font-size:11px; color:#6b7394; min-width:35px;">0:00</span>
        </div>

      </div>
    `;

    const nPlay = document.getElementById('nxPlay');
    const nNext = document.getElementById('nxNext');
    const nPrev = document.getElementById('nxPrev');
    const nShuffle = document.getElementById('nxShuffle');
    const nRepeat = document.getElementById('nxRepeat');
    const nProg = document.getElementById('nxProg');
    
    nexusAudio.pause();
    nexusAudio.src = "";
    
    // Sinkronisasi status teks STP / EXE
    nexusAudio.onplay = () => { if(nPlay) { nPlay.innerHTML = "STP"; nPlay.style.background = "var(--danger)"; nPlay.style.color = "#fff"; nPlay.style.boxShadow = "0 0 15px var(--danger)"; } };
    nexusAudio.onpause = () => { if(nPlay) { nPlay.innerHTML = "EXE"; nPlay.style.background = "#fff"; nPlay.style.color = "#000"; nPlay.style.boxShadow = "0 0 15px rgba(255,255,255,0.3)"; } };

    nPlay.onclick = () => { if(nexusAudio.paused) nexusAudio.play(); else nexusAudio.pause(); };
    
    nNext.onclick = () => {
      if(isShuffle) currentQueueIndex = Math.floor(Math.random() * currentQueue.length);
      else currentQueueIndex = (currentQueueIndex + 1) % currentQueue.length;
      playCurrentQueueIndex(); // Memanggil diri sendiri (looping aman)
    };
    
    nPrev.onclick = () => {
      currentQueueIndex--;
      if(currentQueueIndex < 0) currentQueueIndex = currentQueue.length - 1;
      playCurrentQueueIndex();
    };
    
    nShuffle.onclick = () => { 
      isShuffle = !isShuffle; 
      nShuffle.style.color = isShuffle ? 'var(--accent)' : '#4d5675'; 
    };
    
    nRepeat.onclick = () => { 
      isRepeat = !isRepeat; 
      nRepeat.style.color = isRepeat ? 'var(--accent)' : '#4d5675'; 
    };
    
    if(nProg) {
      nProg.oninput = () => { 
        if(nexusAudio.duration) nexusAudio.currentTime = (nProg.value / 100) * nexusAudio.duration; 
      };
    }
    
    // Main_kan audio preview lewat engine stabil Apple
    fetchPreviewAudioUrl(song.title, song.artist).then(url => {
      nexusAudio.src = url;
      nexusAudio.play().catch(err => console.warn("Auto-play blocked:", err));
    }).catch(e => {
      if(nPlay) nPlay.innerHTML = "ERR";
      const nDur = document.getElementById('nxDur');
      if(nDur) nDur.textContent = "0:00";
      showToast("⚠️ Preview link not found.");
    });
  }
};
