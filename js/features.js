/* ═══════════════════════════════════════════════════
   AMZ LIAN — Playlist  ·  features.js (PERFECT SORTING & LAYERING)
═══════════════════════════════════════════════════ */

console.log("⚡ features.js loaded! All-in-One Navigation, Newest First & Dark Modal Active.");

// ── 1. TIMPA FUNGSI UTAMA PLAY ──
window.runLivePlayer = function(song) {
  const trackList = getFilteredSorted();
  currentQueue = [...trackList];
  currentQueueIndex = currentQueue.findIndex(s => s.id === song.id);
  if(currentQueueIndex === -1) { currentQueue.push(song); currentQueueIndex = currentQueue.length - 1; }
  playCurrentQueueIndex(); 
};

// ── 2. TIMPA FUNGSI ANTREAN UTK HANDLING STICKY PLAYER ──
window.playCurrentQueueIndex = function() {
  if(currentQueueIndex < 0 || currentQueueIndex >= currentQueue.length) return;
  const song = currentQueue[currentQueueIndex];
  
  if(miniPlayer) {
    miniPlayer.style.cssText = `
      position: fixed !important;
      bottom: 0 !important;
      left: 0 !important;
      width: 100% !important;
      z-index: 999 !important; 
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
          <button id="nxShuffle" title="Shuffle" style="background:none; border:none; color:${isShuffle ? 'var(--accent)' : '#4d5675'}; font-size:13px; font-weight:700; letter-spacing:-1px; cursor:pointer; transition:0.2s;">[SHF]</button>
          <button id="nxPrev" title="Previous" style="background:none; border:none; color:#fff; font-size:14px; font-weight:700; cursor:pointer; transition:0.2s; letter-spacing:-2px;">&lt;&lt;|</button>
          <button id="nxPlay" title="Play/Stop" style="background:#fff; border:none; color:#000; width:38px; height:38px; border-radius:50%; font-size:11px; font-weight:900; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:0 0 15px rgba(255,255,255,0.3); transition:0.2s;">⏳</button>
          <button id="nxNext" title="Next" style="background:none; border:none; color:#fff; font-size:14px; font-weight:700; cursor:pointer; transition:0.2s; letter-spacing:-2px;">|&gt;&gt;</button>
          <button id="nxRepeat" title="Repeat" style="background:none; border:none; color:${isRepeat ? 'var(--accent)' : '#4d5675'}; font-size:13px; font-weight:700; letter-spacing:-1px; cursor:pointer; transition:0.2s;">[RPT]</button>
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
    }).catch(e => {
      if(nPlay) nPlay.innerHTML = "ERR";
    });
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
        youtubeMusic: fYoutubeMusic ? fYoutubeMusic.value.trim() : '',
        spotify: fSpotify ? fSpotify.value.trim() : '',
        appleMusic: fAppleMusic ? fAppleMusic.value.trim() : '',
        soundcloud: fSoundcloud ? fSoundcloud.value.trim() : ''
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

// ── 4. SISTEM POP-UP MODAL CUSTOM (DARK MODE PREMIUM) - ANTI PROMPT JADUL ──
function showCustomFolderModal(callback) {
  const oldModal = document.getElementById('customFolderModal');
  if(oldModal) oldModal.remove();

  const overlay = document.createElement('div');
  overlay.id = 'customFolderModal';
  overlay.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
    background: rgba(5, 7, 10, 0.85); backdrop-filter: blur(15px);
    z-index: 99999; display: flex; align-items: center; justify-content: center;
    padding: 20px; box-sizing: border-box; font-family: 'Space Mono', monospace;
  `;

  const box = document.createElement('div');
  box.style.cssText = `
    background: rgba(16, 20, 30, 0.98); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px; padding: 24px; width: 100%; max-width: 360px;
    box-shadow: 0 20px 50px rgba(0,0,0,0.6); display: flex; flex-direction: column; gap: 16px;
  `;

  const title = document.createElement('h4');
  title.style.cssText = "margin: 0; font-size: 15px; color: #fff; font-weight: 700; display: flex; align-items: center; gap: 8px;";
  title.innerHTML = `📁 Create Custom Folder`;

  const sub = document.createElement('p');
  sub.style.cssText = "margin: 0; font-size: 11px; color: #8b93b4; line-height: 1.4;";
  sub.textContent = "Enter a name for your private categorizing playlist folder:";

  const input = document.createElement('input');
  input.type = "text";
  input.placeholder = "e.g. Chill, Lofi, Slow, Night...";
  input.style.cssText = `
    width: 100%; background: #0c0f16; border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px; padding: 12px; color: #fff; font-size: 13px;
    outline: none; font-family: inherit; box-sizing: border-box;
  `;
  
  const actionWrap = document.createElement('div');
  actionWrap.style.cssText = "display: flex; gap: 10px; justify-content: flex-end; margin-top: 4px;";

  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = "Cancel";
  cancelBtn.style.cssText = "background: transparent; border: none; color: #8b93b4; font-size: 12px; cursor: pointer; padding: 8px 12px;";
  cancelBtn.onclick = () => overlay.remove();

  const confirmBtn = document.createElement('button');
  confirmBtn.textContent = "Create";
  confirmBtn.style.cssText = "background: var(--accent-2); border: none; color: #000; font-weight: 700; font-size: 12px; border-radius: 8px; padding: 8px 16px; cursor: pointer; box-shadow: 0 4px 12px rgba(0,255,200,0.15);";
  
  confirmBtn.onclick = () => {
    const val = input.value.trim();
    overlay.remove();
    if(val) callback(val);
  };

  actionWrap.appendChild(cancelBtn);
  actionWrap.appendChild(confirmBtn);
  box.appendChild(title);
  box.appendChild(sub);
  box.appendChild(input);
  box.appendChild(actionWrap);
  overlay.appendChild(box);
  document.body.appendChild(overlay);

  setTimeout(() => input.focus(), 100);
}

// ── 5. LEBUR FILTER UTAMA DAN CUSTOM FOLDER JADI 1 BARIS HORIZONTAL ──
window.renderTagChips = function() {
  if (customFolderTitle) customFolderTitle.style.display = 'none';
  if (folderBar) folderBar.style.display = 'none'; 

  const header = document.querySelector('.site-header');
  if (header) {
    header.style.setProperty('height', 'auto', 'important');
    header.style.setProperty('position', 'sticky', 'important');
  }

  if (tagChips) {
    const parent = tagChips.parentNode;
    if (parent && !document.getElementById('navScrollWrapper')) {
      const wrapper = document.createElement('div');
      wrapper.id = 'navScrollWrapper';
      wrapper.style.cssText = "position: relative; width: 100%; margin: 10px 0; display: block;";
      
      const fadeIndicator = document.createElement('div');
      fadeIndicator.style.cssText = "position: absolute; right: 0; top: 0; height: 100%; width: 50px; background: linear-gradient(to right, transparent, rgba(10,12,18,0.9)); pointer-events: none; z-index: 10; border-right: 2px solid var(--accent-2);";
      
      parent.insertBefore(wrapper, tagChips);
      wrapper.appendChild(tagChips);
      wrapper.appendChild(fadeIndicator);
    }

    tagChips.style.cssText = `
      display: flex !important;
      gap: 8px !important;
      overflow-x: auto !important;
      scrollbar-width: none !important;
      padding: 6px 40px 6px 4px !important;
      width: 100% !important;
      flex-wrap: nowrap !important;
      -webkit-overflow-scrolling: touch !important;
    `;
    tagChips.innerHTML = '';

    const mainFilters = [
      { id: 'all', label: '🏠 Home', active: activeFolder === 'all' && activeTag === '' },
      { id: 'public', label: '👥 Public', active: activeFolder === 'public' && activeTag === '' },
      { id: 'private', label: '🔒 Private', active: activeFolder === 'private' && activeTag === '' },
      { id: 'favorite', label: '⭐ Favorites', active: activeFolder === 'favorite' && activeTag === '' }
    ];

    mainFilters.forEach(f => {
      const btn = document.createElement('button');
      btn.className = `chip${f.active ? ' active' : ''}`;
      btn.style.setProperty('white-space', 'nowrap', 'important');
      btn.innerHTML = f.label;
      btn.onclick = () => { activeFolder = f.id; activeTag = ''; renderAll(); };
      tagChips.appendChild(btn);
    });

    const divider = document.createElement('div');
    divider.style.cssText = "width: 1px; min-width: 1px; background: rgba(255,255,255,0.15); margin: 6px 4px;";
    tagChips.appendChild(divider);

    const createdFolders = JSON.parse(localStorage.getItem('amz_custom_folders')) || [];
    const existingSongTags = [...new Set(songs.filter(s => s.isLocal).flatMap(s => s.tags || []))];
    const totalFolders = [...new Set([...createdFolders, ...existingSongTags])].sort();

    totalFolders.forEach(tag => {
      const btn = document.createElement('button');
      btn.className = `chip${activeTag === tag ? ' active' : ''}`;
      btn.style.setProperty('white-space', 'nowrap', 'important');
      btn.textContent = `📁 ${tag}`;
      btn.onclick = () => { activeTag = tag; renderAll(); };
      tagChips.appendChild(btn);
    });

    const addFolderBtn = document.createElement('button');
    addFolderBtn.className = 'chip';
    addFolderBtn.style.cssText = "border: 1px dashed var(--accent-2) !important; color: var(--accent-2) !important; font-weight: 700 !important; white-space: nowrap !important;";
    addFolderBtn.innerHTML = `➕ Folder`;
    
    addFolderBtn.onclick = () => {
      showCustomFolderModal((folderName) => {
        let customCreatedFolders = JSON.parse(localStorage.getItem('amz_custom_folders')) || [];
        if (!customCreatedFolders.includes(folderName)) {
          customCreatedFolders.push(folderName);
          localStorage.setItem('amz_custom_folders', JSON.stringify(customCreatedFolders));
          showToast(`📁 Folder "${folderName}" created!`);
          combineAndRender();
        } else {
          alert("Folder already exists!");
        }
      });
    };
    tagChips.appendChild(addFolderBtn);
  }
};

// ── 6. MANAGEMENT PINDAH FOLDER PADA DETAIL MODAL LAGU ──
const originalOpenDetailModal = window.openDetailModal;
window.openDetailModal = function(id) {
  if (typeof originalOpenDetailModal === 'function') originalOpenDetailModal(id);
  
  const song = songs.find(s => s.id === id);
  if (!song || !song.isLocal || !detailPlatforms) return;
  
  const createdFolders = JSON.parse(localStorage.getItem('amz_custom_folders')) || [];
  const existingSongTags = [...new Set(songs.filter(s => s.isLocal).flatMap(s => s.tags || []))];
  const totalFolders = [...new Set([...createdFolders, ...existingSongTags])].sort();

  const moveFolderContainer = document.createElement('div');
  moveFolderContainer.style.cssText = "margin-top: 15px; padding-top: 15px; border-top: 1px dashed var(--border); display: flex; flex-direction: column; gap: 8px;";
  
  const label = document.createElement('label');
  label.style.cssText = "font-size: 12px; color: var(--accent-2); font-weight: 600;";
  label.textContent = "⚙️ Move Track to Folder:";
  
  const select = document.createElement('select');
  select.style.cssText = "width: 100%; background: var(--surface); border: 1px solid var(--border); padding: 10px; border-radius: 8px; color: #fff; font-size: 13px; outline: none; cursor: pointer;";
  
  const defOpt = document.createElement('option');
  defOpt.value = "";
  defOpt.textContent = `-- Select Target Folder (Current: ${song.tags && song.tags[0] ? song.tags[0] : 'None'}) --`;
  select.appendChild(defOpt);
  
  totalFolders.forEach(folder => {
    const opt = document.createElement('option');
    opt.value = folder;
    opt.textContent = `📁 ${folder}`;
    if (song.tags && song.tags.includes(folder)) opt.selected = true;
    select.appendChild(opt);
  });

  select.onchange = (e) => {
    const targetFolder = e.target.value;
    if (!targetFolder) return;
    
    const localIdx = localSongs.findIndex(s => s.id === song.id);
    if (localIdx !== -1) {
      localSongs[localIdx].tags = [targetFolder];
      saveLocalData();
      combineAndRender();
      closeModalsWithBack();
      showToast(`📦 Moved "${song.title}" to folder ${targetFolder}!`);
    }
  };

  moveFolderContainer.appendChild(label);
  moveFolderContainer.appendChild(select);
  detailPlatforms.appendChild(moveFolderContainer);
};

// ── 7. ⚡ FIX UTAMA: TIMPA FUNGSI COMBINE DATA SUPAYA LAGU BARU COLO-COLO PALING ATAS GRID ⚡ ──
window.combineAndRender = function() {
  const markedLocal = localSongs.map(s => ({ ...s, isLocal: true, pinned: pinnedOfficialIds.includes(s.id) }));
  
  // Kita paksa susun ulang: Urutkan array lagu local & cloud yang paling baru ditambahkan (addedAt tertinggi) 
  // ditaruh mutlak di paling atas sebelum lagu-lagu official statis bawaan json dibaca.
  const sortedLocalAndCloud = [...cloudSongs, ...markedLocal].sort((a, b) => {
    return new Date(b.addedAt || 0) - new Date(a.addedAt || 0);
  });

  // Gabungkan hasil sorting terbaru di barisan paling atas grid
  songs = [...sortedLocalAndCloud, ...officialSongs];
  renderAll();
};

setTimeout(() => { if(typeof renderTagChips === 'function') renderTagChips(); }, 400);
