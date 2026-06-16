/* ═══════════════════════════════════════════════════
   AMZ LIAN — Playlist  ·  features.js (ALL-IN-ONE SWIPABLE HEADER)
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

// ── 4. ⚡ MASTERPIECE LEBUR FILTER UTAMA DAN CUSTOM FOLDER JADI 1 BARIS HORIZONTAL + TRIGGER INDICATOR ⚡ ──
window.renderTagChips = function() {
  // Sembunyikan judul teks bwaan agar space layar HP super maksimal
  if (customFolderTitle) customFolderTitle.style.display = 'none';
  if (folderBar) folderBar.style.display = 'none'; // Matikan bar menu lama bawaan html

  const header = document.querySelector('.site-header');
  if (header) {
    header.style.setProperty('height', 'auto', 'important');
    header.style.setProperty('position', 'sticky', 'important');
  }

  if (tagChips) {
    // 🎨 DESAIN PENAMPUNG NAVIGASI SATU BARIS + EFEK OVERLAP GRADASI DI KANAN SEBAGAI TRIGGER GESER
    const parent = tagChips.parentNode;
    if (parent && !document.getElementById('navScrollWrapper')) {
      const wrapper = document.createElement('div');
      wrapper.id = 'navScrollWrapper';
      wrapper.style.cssText = "position: relative; width: 100%; margin: 10px 0; display: block;";
      
      // Efek Fade Shadow di ujung kanan (Tanda/Trigger visual kalau list ini bisa di-swipe)
      const fadeIndicator = document.createElement('div');
      fadeIndicator.style.cssText = "position: absolute; right: 0; top: 0; height: 100%; width: 50px; background: linear-gradient(to right, transparent, rgba(10,12,18,0.9)); pointer-events: none; z-index: 10; border-right: 2px solid var(--accent-2);";
      
      parent.insertBefore(wrapper, tagChips);
      wrapper.appendChild(tagChips);
      wrapper.appendChild(fadeIndicator);
    }

    // Set style list agar lurus horizontal sempurna dan anti-melar ke bawah
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

    // A. SUNTIK LIST FILTER UTAMA (DARI KODINGAN HTML LAMA) KE DALAM BARISAN YANG SAMA
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
      btn.onclick = () => {
        activeFolder = f.id;
        activeTag = '';
        renderAll();
      };
      tagChips.appendChild(btn);
    });

    // Tambahkan Garis Pembatas Neon Kecil Antara Menu Utama dengan List Custom Folder
    const divider = document.createElement('div');
    divider.style.cssText = "width: 1px; min-width: 1px; background: rgba(255,255,255,0.15); margin: 6px 4px;";
    tagChips.appendChild(divider);

    // B. SUNTIK LIST CUSTOM FOLDER BUATAN USER
    const createdFolders = JSON.parse(localStorage.getItem('amz_custom_folders')) || [];
    const existingSongTags = [...new Set(songs.filter(s => s.isLocal).flatMap(s => s.tags || []))];
    const totalFolders = [...new Set([...createdFolders, ...existingSongTags])].sort();

    totalFolders.forEach(tag => {
      const btn = document.createElement('button');
      btn.className = `chip${activeTag === tag ? ' active' : ''}`;
      btn.style.setProperty('white-space', 'nowrap', 'important');
      btn.textContent = `📁 ${tag}`;
      btn.onclick = () => {
        activeTag = tag;
        renderAll();
      };
      tagChips.appendChild(btn);
    });

    // C. SUNTIK TOMBOL [+ FOLDER] INDEPENDEN DI UJUNG AKHIR BARISAN SCROLL
    const addFolderBtn = document.createElement('button');
    addFolderBtn.className = 'chip';
    addFolderBtn.style.cssText = "border: 1px dashed var(--accent-2) !important; color: var(--accent-2) !important; font-weight: 700 !important; white-space: nowrap !important;";
    addFolderBtn.innerHTML = `➕ Folder`;
    addFolderBtn.onclick = () => {
      const folderName = prompt("Enter new custom folder name:");
      if (!folderName || !folderName.trim()) return;
      
      let customCreatedFolders = JSON.parse(localStorage.getItem('amz_custom_folders')) || [];
      if (!customCreatedFolders.includes(folderName.trim())) {
        customCreatedFolders.push(folderName.trim());
        localStorage.setItem('amz_custom_folders', JSON.stringify(customCreatedFolders));
        showToast(`📁 Folder "${folderName.trim()}" created!`);
        combineAndRender();
      } else {
        alert("Folder already exists!");
      }
    };
    tagChips.appendChild(addFolderBtn);
  }
};

// ── 5. MANAGEMENT PINDAH FOLDER PADA DETAIL MODAL LAGU ──
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

setTimeout(() => { if(typeof renderTagChips === 'function') renderTagChips(); }, 400);
