/* ═══════════════════════════════════════════════════
   AMZ LIAN — Playlist  ·  features.js (FINAL PERFECT SWIPABLE ENGINE)
═══════════════════════════════════════════════════ */

console.log("⚡ features.js loaded! All-in-One Swipable Navigation Active.");

// ── 1. TIMPA FUNGSI UTAMA PLAY ──
window.runLivePlayer = function(song) {
  const trackList = getFilteredSorted();
  currentQueue = [...trackList];
  currentQueueIndex = currentQueue.findIndex(s => s.id === song.id);
  if(currentQueueIndex === -1) { currentQueue.push(song); currentQueueIndex = currentQueue.length - 1; }
  playCurrentQueueIndex(); 
};

// ── 2. TIMPA FUNGSI ANTREAN UTK HANDLING STICKY PLAYER & TOMBOL EXE/STP ──
window.playCurrentQueueIndex = function() {
  if(currentQueueIndex < 0 || currentQueueIndex >= currentQueue.length) return;
  const song = currentQueue[currentQueueIndex];
  
  if(miniPlayer) {
    miniPlayer.style.cssText = `
      position: fixed !important; bottom: 0 !important; left: 0 !important; width: 100% !important; z-index: 999 !important; 
      display: flex !important; align-items: center !important; justify-content: space-between !important;
      background: rgba(10, 12, 18, 0.95) !important; backdrop-filter: blur(30px) !important;
      border-top: 1px solid rgba(255, 255, 255, 0.05) !important; padding: 14px 28px !important; box-shadow: 0 -10px 40px rgba(0,0,0,0.6) !important;
    `;
    miniPlayer.hidden = false;
  }

  const formOvl = document.getElementById('formOverlay');
  if(formOvl) formOvl.style.zIndex = '10000';
  
  const detailOvl = document.getElementById('detailOverlay');
  if(detailOvl) detailOvl.style.zIndex = '10000';

  if(playerTitle) playerTitle.textContent = song.title;
  if(playerArtist) playerArtist.textContent = song.artist;
  
  const pCoverUI = document.getElementById('playerCoverUI');
  if(pCoverUI) pCoverUI.src = song.cover || COVER_PLACEHOLDER;
  
  const glow = document.getElementById('bgGlow');
  if(glow) { glow.style.backgroundImage = `url('${song.cover}')`; glow.style.opacity = 0.5; }
  
  if(playerFrameContainer) {
    playerFrameContainer.innerHTML = `
      <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; width:100%; padding:0 15px; font-family:'Space Mono', monospace;">
        <div class="custom-controls" style="display:flex; align-items:center; gap:24px; margin-bottom:10px;">
          <button id="nxShuffle" title="Shuffle" style="background:none; border:none; color:${isShuffle ? 'var(--accent)' : '#4d5675'}; font-size:13px; font-weight:700; cursor:pointer;">[SHF]</button>
          <button id="nxPrev" title="Previous" style="background:none; border:none; color:#fff; font-size:14px; font-weight:700; cursor:pointer;">&lt;&lt;|</button>
          <button id="nxPlay" title="Play/Stop" style="background:#fff; border:none; color:#000; width:38px; height:38px; border-radius:50%; font-size:11px; font-weight:900; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:0 0 15px rgba(255,255,255,0.3); transition:0.2s;">⏳</button>
          <button id="nxNext" title="Next" style="background:none; border:none; color:#fff; font-size:14px; font-weight:700; cursor:pointer;">|&gt;&gt;</button>
          <button id="nxRepeat" title="Repeat" style="background:none; border:none; color:${isRepeat ? 'var(--accent)' : '#4d5675'}; font-size:13px; font-weight:700; cursor:pointer;">[RPT]</button>
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
    
    nexusAudio.pause(); nexusAudio.src = "";
    
    nexusAudio.onplay = () => { if(nPlay) { nPlay.innerHTML = "STP"; nPlay.style.background = "var(--danger)"; nPlay.style.color = "#fff"; nPlay.style.boxShadow = "0 0 15px var(--danger)"; } };
    nexusAudio.onpause = () => { if(nPlay) { nPlay.innerHTML = "EXE"; nPlay.style.background = "#fff"; nPlay.style.color = "#000"; nPlay.style.boxShadow = "0 0 15px rgba(255,255,255,0.3)"; } };

    nPlay.onclick = () => { if(nexusAudio.paused) nexusAudio.play(); else nexusAudio.pause(); };
    nNext.onclick = () => { if(isShuffle) currentQueueIndex = Math.floor(Math.random() * currentQueue.length); else currentQueueIndex = (currentQueueIndex + 1) % currentQueue.length; playCurrentQueueIndex(); };
    nPrev.onclick = () => { currentQueueIndex--; if(currentQueueIndex < 0) currentQueueIndex = currentQueue.length - 1; playCurrentQueueIndex(); };
    nShuffle.onclick = () => { isShuffle = !isShuffle; nShuffle.style.color = isShuffle ? 'var(--accent)' : '#4d5675'; };
    nRepeat.onclick = () => { isRepeat = !isRepeat; nRepeat.style.color = isRepeat ? 'var(--accent)' : '#4d5675'; };
    
    if(nProg) { nProg.oninput = () => { if(nexusAudio.duration) nexusAudio.currentTime = (nProg.value / 100) * nexusAudio.duration; }; }
    
    fetchPreviewAudioUrl(song.title, song.artist).then(url => {
      nexusAudio.src = url; nexusAudio.play().catch(() => {});
    }).catch(e => { if(nPlay) nPlay.innerHTML = "ERR"; });
  }
};

// ── 3. TIMPA PROSES DAN TOMBOL SAVE PADA FORM PENGISI ──
if (formSaveBtn) {
  const formFooter = formSaveBtn.parentNode;
  if (formFooter) {
    formFooter.innerHTML = `
      <button class="btn-ghost" id="formCancelBtn" style="margin-right:auto;">Cancel</button>
      <button class="btn-primary" id="btnSavePrivate" style="background: var(--muted); color: #fff; border: 1px solid var(--border);">🔒 Save Private</button>
      <button class="btn-primary" id="btnSavePublic" style="background: var(--accent); color: #fff;">👥 Save Public</button>
    `;

    const newCancel = document.getElementById('formCancelBtn');
    if (newCancel) newCancel.onclick = () => closeModalsWithBack();

    const btnPrivate = document.getElementById('btnSavePrivate');
    const btnPublic = document.getElementById('btnSavePublic');

    const validateInputs = () => {
      const title = fTitle ? fTitle.value.trim() : '';
      const artist = fArtist ? fArtist.value.trim() : '';
      if (!title || !artist) {
        if (formError) { formError.textContent = "Title and Artist are required!"; formError.hidden = false; }
        return null;
      }
      const links = {
        youtubeMusic: fYoutubeMusic ? fYoutubeMusic.value.trim() : '', spotify: fSpotify ? fSpotify.value.trim() : '',
        appleMusic: fAppleMusic ? fAppleMusic.value.trim() : '', soundcloud: fSoundcloud ? fSoundcloud.value.trim() : ''
      };
      const tags = fTags ? fTags.value.split(',').map(t => t.trim()).filter(Boolean) : [];
      return { title, artist, links, tags };
    };

    if (btnPrivate) {
      btnPrivate.onclick = () => {
        const data = validateInputs(); if (!data) return;
        if (editingSongId) {
          const idx = localSongs.findIndex(s => s.id === editingSongId);
          if (idx !== -1) localSongs[idx] = { ...localSongs[idx], title: data.title, artist: data.artist, cover: fCover ? fCover.value.trim() : '', tags: data.tags, links: data.links };
          showToast("🔒 Private song updated!");
        } else {
          localSongs.unshift({ id: 'local-' + Date.now(), title: data.title, artist: data.artist, cover: fCover ? fCover.value.trim() : '', tags: data.tags, links: data.links, addedAt: new Date().toISOString() });
          showToast("🔒 Saved to custom private folder!");
        }
        saveLocalData(); combineAndRender(); closeModalsWithBack();
      };
    }

    if (btnPublic) {
      btnPublic.onclick = () => {
        const data = validateInputs(); if (!data) return;
        if (!db) { alert("❌ Database Firebase tidak terhubung!"); return; }
        if (editingSongId) {
          db.ref('songs/' + editingSongId).update({ title: data.title, artist: data.artist, cover: fCover ? fCover.value.trim() : '', tags: data.tags, links: data.links })
            .then(() => showToast("✅ Public song updated!"));
        } else {
          db.ref('songs').push({ title: data.title, artist: data.artist, cover: fCover ? fCover.value.trim() : '', tags: data.tags, links: data.links, addedAt: new Date().toISOString() })
            .then(() => showToast("🚀 Added to Public Playlist!"));
        }
        saveLocalData(); combineAndRender(); closeModalsWithBack();
      };
    }
  }
}

// ── 4. POP-UP MODAL BIKIN FOLDER BARU (FULL DARK MODE PREMIUM - ANTI PROMPT JADUL) ──
function showCustomFolderModal(callback) {
  const oldModal = document.getElementById('customFolderModal'); if(oldModal) oldModal.remove();

  const overlay = document.createElement('div'); overlay.id = 'customFolderModal';
  overlay.style.cssText = "position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(5, 7, 10, 0.85); backdrop-filter: blur(15px); z-index: 99999; display: flex; align-items: center; justify-content: center; padding: 20px; box-sizing: border-box; font-family: 'Space Mono', monospace;";

  const box = document.createElement('div');
  box.style.cssText = "background: rgba(16, 20, 30, 0.98); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 24px; width: 100%; max-width: 360px; box-shadow: 0 20px 50px rgba(0,0,0,0.6); display: flex; flex-direction: column; gap: 16px;";

  const title = document.createElement('h4'); title.style.cssText = "margin: 0; font-size: 15px; color: #fff; font-weight: 700;"; title.innerHTML = `📁 Create New Folder`;

  const input = document.createElement('input'); input.type = "text"; input.placeholder = "Folder Name (e.g. Lofi, Chill)...";
  input.style.cssText = "width: 100%; background: #0c0f16; border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 12px; color: #fff; font-size: 13px; outline: none; box-sizing: border-box;";
  
  const accessLabel = document.createElement('label'); accessLabel.style.cssText = "font-size: 11px; color: var(--accent-2); font-weight:600;"; accessLabel.textContent = "🗺️ Folder Access Status:";

  const selectAccess = document.createElement('select');
  selectAccess.style.cssText = "width: 100%; background: #0c0f16; border: 1px solid rgba(255,255,255,0.1); padding: 10px; border-radius: 8px; color: #fff; font-size: 13px; outline: none; cursor: pointer;";
  selectAccess.innerHTML = `<option value="private">🔒 Private (Local Save Only)</option><option value="public">👥 Public (Global Cloud Folder)</option>`;

  const actionWrap = document.createElement('div'); actionWrap.style.cssText = "display: flex; gap: 10px; justify-content: flex-end; margin-top: 4px;";

  const cancelBtn = document.createElement('button'); cancelBtn.textContent = "Cancel"; cancelBtn.style.cssText = "background: transparent; border: none; color: #8b93b4; font-size: 12px; cursor: pointer; padding: 8px 12px;";
  cancelBtn.onclick = () => overlay.remove();

  const confirmBtn = document.createElement('button'); confirmBtn.textContent = "Create"; confirmBtn.style.cssText = "background: var(--accent-2); border: none; color: #000; font-weight: 700; font-size: 12px; border-radius: 8px; padding: 8px 16px; cursor: pointer;";
  
  confirmBtn.onclick = () => {
    const val = input.value.trim(); const access = selectAccess.value; overlay.remove();
    if(val) callback(val, access);
  };

  actionWrap.appendChild(cancelBtn); actionWrap.appendChild(confirmBtn);
  box.appendChild(title); box.appendChild(input); box.appendChild(accessLabel); box.appendChild(selectAccess); box.appendChild(actionWrap);
  overlay.appendChild(box); document.body.appendChild(overlay);
  setTimeout(() => input.focus(), 100);
}

// ── 5. POP-UP MODAL KELOLA MUSIK (ADD / REMOVE JALUR CEPAT) ──
function showQuickAddTracksModal(folderName) {
  const old = document.getElementById('quickAddModal'); if(old) old.remove();

  const overlay = document.createElement('div'); overlay.id = 'quickAddModal';
  overlay.style.cssText = "position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(5,7,10,0.85); backdrop-filter:blur(15px); z-index:99999; display:flex; align-items:center; justify-content:center; padding:20px; font-family:'Space Mono', monospace;";

  const box = document.createElement('div');
  box.style.cssText = "background:rgba(16,20,30,0.98); border:1px solid rgba(255,255,255,0.08); border-radius:16px; padding:24px; width:100%; max-width:400px; max-height:75vh; box-shadow:0 20px 50px rgba(0,0,0,0.6); display:flex; flex-direction:column; gap:14px;";

  const title = document.createElement('h4'); title.style.cssText = "margin:0; font-size:14px; color:#fff; font-weight:700;"; title.textContent = `⚙️ Manage Songs: 📁 ${folderName}`;

  const listWrap = document.createElement('div'); listWrap.style.cssText = "flex:1; overflow-y:auto; display:flex; flex-direction:column; gap:6px; padding-right:4px; max-height:45vh;";

  songs.forEach(song => {
    const inFolder = song.tags && song.tags.includes(folderName);
    const row = document.createElement('div'); row.style.cssText = "display:flex; align-items:center; justify-content:space-between; background:#0c0f16; border:1px solid rgba(255,255,255,0.03); padding:10px; border-radius:10px;";
    
    row.innerHTML = `
      <div style="flex:1; min-width:0; padding-right:10px;">
        <div style="font-size:12px; color:#fff; font-weight:700; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${song.title}</div>
        <div style="font-size:11px; color:${inFolder ? 'var(--accent)' : '#6b7394'}; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${song.artist} ${inFolder ? '• [Inside]' : ''}</div>
      </div>
      <button style="background:${inFolder ? 'var(--danger)' : 'var(--accent)'}; border:none; color:${inFolder ? '#fff' : '#000'}; font-size:10px; font-weight:800; border-radius:6px; padding:6px 10px; cursor:pointer; min-width:75px;">
        ${inFolder ? '❌ REMOVE' : '➕ ADD'}
      </button>
    `;

    row.querySelector('button').onclick = (e) => {
      e.stopPropagation();
      if (inFolder) {
        if (!song.isLocal && db) {
          const remTags = (song.tags || []).filter(t => t !== folderName); db.ref('songs/' + song.id).update({ tags: remTags });
        } else {
          const idx = localSongs.findIndex(ls => ls.id === song.id);
          if (idx !== -1 && localSongs[idx].tags) { localSongs[idx].tags = localSongs[idx].tags.filter(t => t !== folderName); saveLocalData(); }
        }
        showToast(`🗑️ Removed "${song.title}"`);
      } else {
        if (!song.isLocal && db) { db.ref('songs/' + song.id).update({ tags: [...(song.tags || []), folderName] }); } 
        else {
          const idx = localSongs.findIndex(ls => ls.id === song.id);
          if (idx !== -1) { if(!localSongs[idx].tags) localSongs[idx].tags = []; localSongs[idx].tags.push(folderName); saveLocalData(); }
        }
        showToast(`✅ Added "${song.title}"!`);
      }
      overlay.remove(); combineAndRender();
      setTimeout(() => showQuickAddTracksModal(folderName), 150); 
    };
    listWrap.appendChild(row);
  });

  const closeBtn = document.createElement('button'); closeBtn.textContent = "Close Panel"; closeBtn.style.cssText = "width:100%; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.05); color:#fff; border-radius:8px; padding:10px; font-size:12px; font-weight:600; cursor:pointer;";
  closeBtn.onclick = () => overlay.remove();

  box.appendChild(title); box.appendChild(listWrap); box.appendChild(closeBtn); overlay.appendChild(box); document.body.appendChild(overlay);
}

// ── 6. RENDER BAR NAVIGASI HORIZONTAL (FIXED SCROLL & AUTO-SLIDE FOCUS) ──
window.renderTagChips = function() {
  if (customFolderTitle) customFolderTitle.style.display = 'none';
  if (folderBar) folderBar.style.display = 'none'; 

  const header = document.querySelector('.site-header');
  if (header) { header.style.setProperty('height', 'auto', 'important'); header.style.setProperty('position', 'sticky', 'important'); }

  if (tagChips) {
    const parent = tagChips.parentNode;
    if (parent && !document.getElementById('navScrollWrapper')) {
      const wrapper = document.createElement('div'); wrapper.id = 'navScrollWrapper'; 
      // KUNCI UTAMA: Paksa touch-action pan-x biar browser HP ngijinin geser horizontal mutlak tanpa macet
      wrapper.style.cssText = "position: relative; width: 100%; margin: 10px 0; display: block; touch-action: pan-x !important; overflow: hidden;";
      
      const fadeIndicator = document.createElement('div'); fadeIndicator.style.cssText = "position: absolute; right: 0; top: 0; height: 100%; width: 50px; background: linear-gradient(to right, transparent, rgba(10,12,18,0.95)); pointer-events: none; z-index: 10; display: flex; align-items: center; justify-content: flex-end; padding-right: 8px; color: var(--accent); font-size: 16px; font-weight:900; border-right: 2px solid var(--accent); animation: pulseGlow 1.5s infinite;";
      fadeIndicator.innerHTML = "➜";
      
      const styleAnim = document.createElement('style'); 
      styleAnim.innerHTML = `
        @keyframes pulseGlow { 0%, 100% { opacity:0.4; transform:translateX(0); } 50% { opacity:1; transform:translateX(3px); } } 
        .chip { transition: transform 0.15s, background 0.2s !important; scroll-snap-align: center; } 
        .chip:active { transform: scale(0.92) !important; }
      `; 
      document.head.appendChild(styleAnim);

      parent.insertBefore(wrapper, tagChips); wrapper.appendChild(tagChips); wrapper.appendChild(fadeIndicator);
    }

    // PAKSA OVERFLOW JALAN DI HP MANAPUN
    tagChips.style.cssText = "display: flex !important; gap: 8px !important; overflow-x: auto !important; scrollbar-width: none !important; padding: 6px 55px 6px 4px !important; width: 100% !important; flex-wrap: nowrap !important; -webkit-overflow-scrolling: touch !important; scroll-behavior: smooth !important; touch-action: pan-x !important;";
    tagChips.innerHTML = '';

    // Mencegah interupsi vertical scroll bawaan HP
    tagChips.addEventListener('touchstart', (e) => { e.stopPropagation(); }, {passive: true});

    // EFEK BOUNCE INDIKATOR: Menghentak otomatis ke kanan dikit pas refresh biar user langsung tau bisa di-swipe
    if (!window.hasBouncedOnce) {
      window.hasBouncedOnce = true;
      setTimeout(() => { tagChips.scrollTo({ left: 60, behavior: 'smooth' }); setTimeout(() => tagChips.scrollTo({ left: 0, behavior: 'smooth' }), 500); }, 400);
    }

    // A. ISI MENU UTAMA (KLIK -> AUTOMATIC SLIDE TO CENTER FOCUS)
    const mainFilters = [
      { id: 'all', label: '🏠 Home', active: activeFolder === 'all' && activeTag === '' },
      { id: 'public', label: '👥 Public', active: activeFolder === 'public' && activeTag === '' },
      { id: 'private', label: '🔒 Private', active: activeFolder === 'private' && activeTag === '' },
      { id: 'favorite', label: '⭐ Favorites', active: activeFolder === 'favorite' && activeTag === '' }
    ];

    mainFilters.forEach(f => {
      const btn = document.createElement('button'); btn.className = `chip${f.active ? ' active' : ''}`;
      btn.style.setProperty('white-space', 'nowrap', 'important'); btn.innerHTML = f.label;
      btn.onclick = () => { 
        activeFolder = f.id; activeTag = ''; 
        renderAll();
        // SAKTI: Klik langsung nge-slide halus ke tengah pandangan skrin
        btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }; 
      tagChips.appendChild(btn);
    });

    const divider = document.createElement('div'); divider.style.cssText = "width: 1px; min-width: 1px; background: rgba(255,255,255,0.15); margin: 6px 4px;"; tagChips.appendChild(divider);

    // B. ISI DAFTAR CUSTOM FOLDER
    const createdFoldersData = JSON.parse(localStorage.getItem('amz_folders_meta')) || {};
    const existingSongTags = [...new Set(songs.flatMap(s => s.tags || []))].filter(Boolean);
    const totalFolders = [...new Set([...Object.keys(createdFoldersData), ...existingSongTags])].sort();

    totalFolders.forEach(tag => {
      const meta = createdFoldersData[tag] || { access: 'private' };
      const prefix = meta.access === 'public' ? '👥' : '📁';
      const btn = document.createElement('button'); btn.className = `chip${activeTag === tag ? ' active' : ''}`;
      btn.style.setProperty('white-space', 'nowrap', 'important'); btn.textContent = `${prefix} ${tag}`;
      btn.onclick = () => { 
        activeTag = tag; renderAll(); 
        // SAKTI: Klik folder langsung bergeser fokus ke tengah skrin
        btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }; 
      tagChips.appendChild(btn);
    });

    // C. AKSES MANAGEMENT TOMBOL INSIDE FOLDER
    if (activeTag !== '') {
      const quickAddBtn = document.createElement('button'); quickAddBtn.className = 'chip';
      quickAddBtn.style.cssText = "background: var(--surface) !important; border: 1px solid var(--accent) !important; color: var(--accent) !important; font-weight:800 !important; white-space:nowrap !important;";
      quickAddBtn.innerHTML = `[+] Manage Songs`; quickAddBtn.onclick = () => showQuickAddTracksModal(activeTag); tagChips.appendChild(quickAddBtn);

      const deleteFolderBtn = document.createElement('button'); deleteFolderBtn.className = 'chip';
      deleteFolderBtn.style.cssText = "background: rgba(255, 75, 75, 0.1) !important; border: 1px solid var(--danger) !important; color: var(--danger) !important; font-weight:800 !important; white-space:nowrap !important;";
      deleteFolderBtn.innerHTML = `🗑️ Delete Folder`;
      deleteFolderBtn.onclick = () => {
        if(confirm(`Delete folder "${activeTag}"?\n(Songs will not be lost).`)) {
          localSongs.forEach((s, idx) => { if(s.tags && s.tags.includes(activeTag)) localSongs[idx].tags = s.tags.filter(t => t !== activeTag); }); saveLocalData();
          let customFoldersMeta = JSON.parse(localStorage.getItem('amz_folders_meta')) || {};
          if(customFoldersMeta[activeTag]) { delete customFoldersMeta[activeTag]; localStorage.setItem('amz_folders_meta', JSON.stringify(customFoldersMeta)); }
          showToast(`🗑️ Folder deleted.`); activeTag = ''; activeFolder = 'all'; combineAndRender();
        }
      };
      tagChips.appendChild(deleteFolderBtn);
    }

    // D. TOMBOL +FOLDER UTAMA
    const addFolderBtn = document.createElement('button'); addFolderBtn.className = 'chip';
    addFolderBtn.style.cssText = "border: 1px dashed var(--accent-2) !important; color: var(--accent-2) !important; font-weight: 700 !important; white-space: nowrap !important;";
    addFolderBtn.innerHTML = `➕ Folder`;
    
    addFolderBtn.onclick = () => {
      showCustomFolderModal((folderName, access) => {
        let customFoldersMeta = JSON.parse(localStorage.getItem('amz_folders_meta')) || {};
        if (!customFoldersMeta[folderName]) {
          customFoldersMeta[folderName] = { access: access, createdAt: new Date().toISOString() };
          localStorage.setItem('amz_folders_meta', JSON.stringify(customFoldersMeta));
          showToast(`📁 Folder "${folderName}" created!`); combineAndRender();
        } else { alert("Folder name already exists!"); }
      });
    };
    tagChips.appendChild(addFolderBtn);
  }
};

// ── 7. MANAGEMENT PINDAH FOLDER PADA DETAIL MODAL LAGU ──
const originalOpenDetailModal = window.openDetailModal;
window.openDetailModal = function(id) {
  if (typeof originalOpenDetailModal === 'function') originalOpenDetailModal(id);
  const song = songs.find(s => s.id === id); if (!song || !detailPlatforms) return;
  
  const createdFoldersData = JSON.parse(localStorage.getItem('amz_folders_meta')) || {};
  const existingSongTags = [...new Set(songs.flatMap(s => s.tags || []))].filter(Boolean);
  const totalFolders = [...new Set([...Object.keys(createdFoldersData), ...existingSongTags])].sort();

  const moveFolderContainer = document.createElement('div'); moveFolderContainer.style.cssText = "margin-top: 15px; padding-top: 15px; border-top: 1px dashed var(--border); display: flex; flex-direction: column; gap: 8px;";
  const label = document.createElement('label'); label.style.cssText = "font-size: 12px; color: var(--accent-2); font-weight: 600;"; label.textContent = "⚙️ Move Track to Folder:";
  
  const select = document.createElement('select'); select.style.cssText = "width: 100%; background: var(--surface); border: 1px solid var(--border); padding: 10px; border-radius: 8px; color: #fff; font-size: 13px; outline: none; cursor: pointer;";
  const defOpt = document.createElement('option'); defOpt.value = ""; defOpt.textContent = `-- Select Target Folder --`; select.appendChild(defOpt);
  
  totalFolders.forEach(folder => {
    const opt = document.createElement('option'); opt.value = folder; opt.textContent = `📁 ${folder}`;
    if (song.tags && song.tags.includes(folder)) opt.selected = true; select.appendChild(opt);
  });

  select.onchange = (e) => {
    const targetFolder = e.target.value; if (!targetFolder) return;
    if (!song.isLocal && db) { db.ref('songs/' + song.id).update({ tags: [targetFolder] }); } 
    else {
      const localIdx = localSongs.findIndex(s => s.id === song.id);
      if (localIdx !== -1) { localSongs[localIdx].tags = [targetFolder]; saveLocalData(); }
    }
    combineAndRender(); closeModalsWithBack(); showToast(`📦 Moved to ${targetFolder}!`);
  };
  moveFolderContainer.appendChild(label); moveFolderContainer.appendChild(select); detailPlatforms.appendChild(moveFolderContainer);
};

// ── 8. TIMPA FUNGSI COMBINE DATA SUPAYA LAGU BARU KESIMPAN PALING ATAS GRID ──
window.combineAndRender = function() {
  const markedLocal = localSongs.map(s => ({ ...s, isLocal: true, pinned: pinnedOfficialIds.includes(s.id) }));
  const sortedLocalAndCloud = [...cloudSongs, ...markedLocal].sort((a, b) => new Date(b.addedAt || 0) - new Date(a.addedAt || 0));
  songs = [...sortedLocalAndCloud, ...officialSongs];
  renderAll();
};

setTimeout(() => { if(typeof renderTagChips === 'function') renderTagChips(); }, 400);
