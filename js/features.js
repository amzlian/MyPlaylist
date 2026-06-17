/* ═══════════════════════════════════════════════════
   AMZ LIAN — Playlist  ·  features.js (STRICT HIERARCHY, NAV-FIX & PERFECT BACK ENGINE)
═══════════════════════════════════════════════════ */

console.log("⚡ features.js loaded! Browser Back Button Interceptor, Universe Hub & YT Blur Active.");

// Flag internal untuk mengunci interseptor popstate agar tidak memicu returnToHub saat menghapus lagu
window.isDeletingSong = false;

// ── 0. BROWSER BACK BUTTON INTERCEPTOR (ANTI-KELUAR WEB & FIX MODAL) ──
window.addEventListener('popstate', (e) => {
    // 🛡️ JIKA SEDANG PROSES HAPUS LAGU, BLOKIR TOTAL AGAR TIDAK DILEMPAR KE HUB UUTAMA
    if (window.isDeletingSong) {
        window.isDeletingSong = false;
        return;
    }

    let modalClosed = false;

    // 1. Cek dan Tutup Custom Modal Kembangan
    ['customConfirmModal', 'quickAddModal', 'customFolderModal'].forEach(id => {
        const m = document.getElementById(id);
        if(m) { m.remove(); modalClosed = true; }
    });

    // 2. Cek dan Tutup Modal Form & Detail Bawaan Script.js
    const formOvl = document.getElementById('formOverlay');
    if(formOvl && !formOvl.hidden) { formOvl.hidden = true; modalClosed = true; }
    
    const detailOvl = document.getElementById('detailOverlay');
    if(detailOvl && !detailOvl.hidden) { detailOvl.hidden = true; modalClosed = true; }

    if(modalClosed) return; // ✅ Jika berhasil nutup modal, stop di sini! Jangan banting halaman.

    // 3. Jika sedang masuk ke dalam Sub-Folder, mundurkan ke halaman Grid Utama
    if (typeof activeTag !== 'undefined' && activeTag !== '') {
        activeTag = ''; 
        if(typeof combineAndRender === 'function') combineAndRender();
        return;
    }

    // 4. Jika sedang di Grid Utama dan menekan Back, balikan ke Universe Hub
    if (typeof returnToHub === 'function') {
        returnToHub();
    }
});

// ── PERBAIKAN TOMBOL CLOSE X BAWAAN AGAR TUNDUK PADA HISTORY ──
const origFormClose = document.getElementById('formClose');
if(origFormClose) origFormClose.onclick = (e) => { e.preventDefault(); history.back(); };

const origDetailClose = document.getElementById('detailClose');
if(origDetailClose) origDetailClose.onclick = (e) => { e.preventDefault(); history.back(); };


// ── 1. TIMPA FUNGSI UTAMA PLAY (DENGAN ENGINE ADAPTIVE BLUR YT MUSIC) ──
window.runLivePlayer = function(song) {
  const trackList = getFilteredSorted();
  currentQueue = [...trackList];
  currentQueueIndex = currentQueue.findIndex(s => s.id === song.id);
  if(currentQueueIndex === -1) { currentQueue.push(song); currentQueueIndex = currentQueue.length - 1; }
  
  applyYTMusicBlur(song.cover || COVER_PLACEHOLDER);
  playCurrentQueueIndex(); 
};

// Fungsi Pembuat Background Blur Pekat Dinamis (YouTube Music Style)
function applyYTMusicBlur(imgUrl) {
  let bgOverlay = document.getElementById('yt-adaptive-blur-bg');
  if (!bgOverlay) {
    bgOverlay = document.createElement('div');
    bgOverlay.id = 'yt-adaptive-blur-bg';
    bgOverlay.style.cssText = "position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: -2; transition: background 1.5s ease; filter: blur(80px); opacity: 0.5; pointer-events: none;";
    document.body.prepend(bgOverlay);
  }
  
  const img = new Image();
  img.crossOrigin = "Anonymous";
  img.src = imgUrl;
  img.onload = function() {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 10; canvas.height = 10;
      ctx.drawImage(img, 0, 0, 10, 10);
      const rgba = ctx.getImageData(0, 0, 1, 1).data;
      
      const r = rgba[0], g = rgba[1], b = rgba[2];
      bgOverlay.style.background = `rgb(${r}, ${g}, ${b})`;
      
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      
      if (brightness > 180) {
        document.querySelectorAll('.chip').forEach(el => {
          if(!el.classList.contains('active')) {
            el.style.setProperty('color', '#000000', 'important');
            el.style.setProperty('background', 'rgba(0, 0, 0, 0.08)', 'important');
            el.style.setProperty('border-color', 'rgba(0, 0, 0, 0.2)', 'important');
          }
        });
        document.documentElement.style.setProperty('--accent', `rgb(${Math.max(0, r - 60)}, ${Math.max(0, g - 60)}, ${Math.max(0, b - 60)})`);
      } else {
        document.querySelectorAll('.chip').forEach(el => {
          if(!el.classList.contains('active')) {
            el.style.removeProperty('color');
            el.style.removeProperty('background');
            el.style.removeProperty('border-color');
          }
        });
        document.documentElement.style.setProperty('--accent', `rgb(${r}, ${g}, ${b})`);
      }
      
      const darkBg = `rgba(${Math.max(0, r - 50)}, ${Math.max(0, g - 50)}, ${Math.max(0, b - 50)}, 0.98)`;
      document.documentElement.style.setProperty('--background', darkBg);
    } catch (e) {
      console.log("Gagal memproses warna blur cover.");
    }
  };
}

// ── 2. TIMPA FUNGSI ANTREAN UTK HANDLING STICKY PLAYER ──
window.playCurrentQueueIndex = function() {
  if(currentQueueIndex < 0 || currentQueueIndex >= currentQueue.length) return;
  const song = currentQueue[currentQueueIndex];
  
  if(miniPlayer) {
    miniPlayer.style.cssText = `
      position: fixed !important; bottom: 0 !important; left: 0 !important; width: 100% !important; z-index: 9999 !important; 
      display: flex !important; align-items: center !important; justify-content: space-between !important;
      background: rgba(10, 12, 18, 0.96) !important; backdrop-filter: blur(30px) !important;
      border-top: 1px solid rgba(255, 255, 255, 0.05) !important; padding: 14px 28px !important; box-shadow: 0 -10px 40px rgba(0,0,0,0.6) !important;
    `;
    miniPlayer.hidden = false;
  }

  const formOvl = document.getElementById('formOverlay'); if(formOvl) formOvl.style.zIndex = '10000';
  const detailOvl = document.getElementById('detailOverlay'); if(detailOvl) detailOvl.style.zIndex = '10000';

  const playerInfoBox = document.querySelector('.player-info');
  if(playerInfoBox) {
    playerInfoBox.style.cssText = "display: flex !important; align-items: center !important; gap: 14px !important; width: 30% !important; min-width: 220px !important; overflow: hidden !important;";
    playerInfoBox.innerHTML = `
      <img src="${song.cover || COVER_PLACEHOLDER}" style="width: 50px !important; height: 50px !important; border-radius: 8px !important; object-fit: cover !important; box-shadow: 0 4px 15px rgba(0,0,0,0.5) !important; flex-shrink: 0 !important;" />
      <div style="display: flex !important; flex-direction: column !important; overflow: hidden !important;">
        <div id="playerTitle" style="font-weight: 700 !important; font-size: 14px !important; color: #fff !important; white-space: nowrap !important; overflow: hidden !important; text-overflow: ellipsis !important;">${song.title}</div>
        <div id="playerArtist" style="font-size: 12px !important; color: #8b93b4 !important; white-space: nowrap !important; overflow: hidden !important; text-overflow: ellipsis !important; margin-top: 2px !important;">${song.artist}</div>
      </div>
    `;
  } else {
    if(playerTitle) playerTitle.textContent = song.title;
    if(playerArtist) playerArtist.textContent = song.artist;
  }
  
  const glow = document.getElementById('bgGlow');
  if(glow) { glow.style.backgroundImage = `url('${song.cover}')`; glow.style.opacity = 0.5; }
  
  if(playerFrameContainer) {
    playerFrameContainer.innerHTML = `
      <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; width:100%; padding:0 15px; font-family:'Space Mono', monospace;">
        <div class="custom-controls" style="display:flex; align-items:center; gap:24px; margin-bottom:10px;">
          <button id="nxShuffle" style="background:none; border:none; color:${isShuffle ? 'var(--accent)' : '#4d5675'}; font-size:13px; font-weight:700; cursor:pointer;">[SHF]</button>
          <button id="nxPrev" style="background:none; border:none; color:#fff; font-size:14px; font-weight:700; cursor:pointer;">&lt;&lt;|</button>
          <button id="nxPlay" style="background:#fff; border:none; color:#000; width:38px; height:38px; border-radius:50%; font-size:11px; font-weight:900; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:0 0 15px rgba(255,255,255,0.3); transition:0.2s;">⏳</button>
          <button id="nxNext" style="background:none; border:none; color:#fff; font-size:14px; font-weight:700; cursor:pointer;">|&gt;&gt;</button>
          <button id="nxRepeat" style="background:none; border:none; color:${isRepeat ? 'var(--accent)' : '#4d5675'}; font-size:13px; font-weight:700; cursor:pointer;">[RPT]</button>
        </div>
        <div class="player-progress-container" style="display:flex; align-items:center; gap:12px; width:100%;">
          <span id="nxCurr" style="font-size:11px; color:#6b7394; min-width:35px; text-align:right;">0:00</span>
          <input id="nxProg" type="range" value="0" min="0" max="100" class="progress-bar" style="flex:1; accent-color:var(--accent); height:4px; background:rgba(255,255,255,0.1); border-radius:4px; cursor:pointer;" />
          <span id="nxDur" style="font-size:11px; color:#6b7394; min-width:35px;">0:00</span>
        </div>
      </div>
    `;

    const nPlay = document.getElementById('nxPlay'); const nNext = document.getElementById('nxNext'); const nPrev = document.getElementById('nxPrev');
    const nShuffle = document.getElementById('nxShuffle'); const nRepeat = document.getElementById('nxRepeat'); const nProg = document.getElementById('nxProg');
    
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
      <button class="btn-primary" id="btnSavePrivate" style="background: var(--muted); color: #fff; border: 1px solid var(--border);">Save Private</button>
      <button class="btn-primary" id="btnSavePublic" style="background: var(--accent); color: #fff;">Save Public</button>
    `;
    
    const newCancel = document.getElementById('formCancelBtn'); 
    if (newCancel) newCancel.onclick = (e) => { e.preventDefault(); history.back(); };
    
    const btnPrivate = document.getElementById('btnSavePrivate'); const btnPublic = document.getElementById('btnSavePublic');

    const validateInputs = () => {
      const title = fTitle ? fTitle.value.trim() : ''; const artist = fArtist ? fArtist.value.trim() : '';
      if (!title || !artist) { if (formError) { formError.textContent = "Title and Artist are required!"; formError.hidden = false; } return null; }
      const links = { youtubeMusic: fYoutubeMusic ? fYoutubeMusic.value.trim() : '', spotify: fSpotify ? fSpotify.value.trim() : '', appleMusic: fAppleMusic ? fAppleMusic.value.trim() : '', soundcloud: fSoundcloud ? fSoundcloud.value.trim() : '' };
      const tags = fTags ? fTags.value.split(',').map(t => t.trim()).filter(Boolean) : [];
      return { title, artist, links, tags };
    };

    if (btnPrivate) {
      btnPrivate.onclick = () => {
        const data = validateInputs(); if (!data) return;
        if (editingSongId) {
          const idx = localSongs.findIndex(s => s.id === editingSongId);
          if (idx !== -1) localSongs[idx] = { ...localSongs[idx], title: data.title, artist: data.artist, cover: fCover ? fCover.value.trim() : '', tags: data.tags, links: data.links };
          showToast("Private song updated!");
        } else {
          localSongs.unshift({ id: 'local-' + Date.now(), title: data.title, artist: data.artist, cover: fCover ? fCover.value.trim() : '', tags: data.tags, links: data.links, addedAt: new Date().toISOString() });
          showToast("Saved to custom private folder!");
        }
        saveLocalData(); 
        
        const currentOvl = document.getElementById('formOverlay');
        if(currentOvl && !currentOvl.hidden) { currentOvl.hidden = true; history.back(); }
        setTimeout(() => { combineAndRender(); }, 50);
      };
    }
    if (btnPublic) {
      btnPublic.onclick = () => {
        const data = validateInputs(); if (!data) return;
        if (!db) { alert("Database Firebase tidak terhubung!"); return; }
        if (editingSongId) {
          db.ref('songs/' + editingSongId).update({ title: data.title, artist: data.artist, cover: fCover ? fCover.value.trim() : '', tags: data.tags, links: data.links }).then(() => {
             showToast("Public song updated!");
             const currentOvl = document.getElementById('formOverlay');
             if(currentOvl && !currentOvl.hidden) { currentOvl.hidden = true; history.back(); }
             setTimeout(() => { combineAndRender(); }, 50);
          });
        } else {
          db.ref('songs').push({ title: data.title, artist: data.artist, cover: fCover ? fCover.value.trim() : '', tags: data.tags, links: data.links, addedAt: new Date().toISOString() }).then(() => {
             showToast("Added to Public Playlist!");
             const currentOvl = document.getElementById('formOverlay');
             if(currentOvl && !currentOvl.hidden) { currentOvl.hidden = true; history.back(); }
             setTimeout(() => { combineAndRender(); }, 50);
          });
        }
      };
    }
  }
}

// ── 4. POP-UP MODAL BIKIN FOLDER BARU ──
function showCustomFolderModal(callback) {
  history.pushState({ modal: 'customFolderModal' }, '');

  const oldModal = document.getElementById('customFolderModal'); if(oldModal) oldModal.remove();
  const overlay = document.createElement('div'); overlay.id = 'customFolderModal';
  overlay.style.cssText = "position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(5, 7, 10, 0.85); backdrop-filter: blur(15px); z-index: 99999; display: flex; align-items: center; justify-content: center; padding: 20px; box-sizing: border-box; font-family: 'Space Mono', monospace;";
  const box = document.createElement('div');
  box.style.cssText = "background: rgba(16, 20, 30, 0.98); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 24px; width: 100%; max-width: 360px; box-shadow: 0 20px 50px rgba(0,0,0,0.6); display: flex; flex-direction: column; gap: 16px;";
  const title = document.createElement('h4'); title.style.cssText = "margin: 0; font-size: 15px; color: #fff; font-weight: 700;"; title.innerHTML = `Create New Folder`;
  const input = document.createElement('input'); input.type = "text"; input.placeholder = "Folder Name...";
  input.style.cssText = "width: 100%; background: #0c0f16; border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 12px; color: #fff; font-size: 13px; outline: none; box-sizing: border-box;";
  const accessLabel = document.createElement('label'); accessLabel.style.cssText = "font-size: 11px; color: var(--accent-2); font-weight:600;"; accessLabel.textContent = "Folder Access Status:";
  const selectAccess = document.createElement('select');
  selectAccess.style.cssText = "width: 100%; background: #0c0f16; border: 1px solid rgba(255,255,255,0.1); padding: 10px; border-radius: 8px; color: #fff; font-size: 13px; outline: none; cursor: pointer;";
  selectAccess.innerHTML = `<option value="private">Private (Local Save)</option><option value="public">Public (Cloud Global)</option>`;
  const actionWrap = document.createElement('div'); actionWrap.style.cssText = "display: flex; gap: 10px; justify-content: flex-end; margin-top: 4px;";
  const cancelBtn = document.createElement('button'); cancelBtn.textContent = "Cancel"; cancelBtn.style.cssText = "background: transparent; border: none; color: #8b93b4; font-size: 12px; cursor: pointer; padding: 8px 12px;";
  
  cancelBtn.onclick = (e) => { e.preventDefault(); history.back(); };
  
  const confirmBtn = document.createElement('button'); confirmBtn.textContent = "Create"; confirmBtn.style.cssText = "background: var(--accent-2); border: none; color: #000; font-weight: 700; font-size: 12px; border-radius: 8px; padding: 8px 16px; cursor: pointer;";
  
  confirmBtn.onclick = (e) => { 
      e.preventDefault();
      const val = input.value.trim(); const access = selectAccess.value; 
      history.back(); 
      setTimeout(() => { if(val) callback(val, access); }, 50); 
  };
  
  actionWrap.appendChild(cancelBtn); actionWrap.appendChild(confirmBtn); box.appendChild(title); box.appendChild(input); box.appendChild(accessLabel); box.appendChild(selectAccess); box.appendChild(actionWrap); overlay.appendChild(box); document.body.appendChild(overlay);
  setTimeout(() => input.focus(), 100);
}

// ── 5. POP-UP MODAL KELOLA MUSIK (ADD / REMOVE JALUR CEPAT) ──
function showQuickAddTracksModal(folderName, isRefresh = false) {
  if(!isRefresh) history.pushState({ modal: 'quickAddModal' }, '');

  const old = document.getElementById('quickAddModal'); if(old) old.remove();
  const overlay = document.createElement('div'); overlay.id = 'quickAddModal';
  overlay.style.cssText = "position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(5,7,10,0.85); backdrop-filter:blur(15px); z-index:99999; display:flex; align-items:center; justify-content:center; padding:20px; font-family:'Space Mono', monospace;";
  const box = document.createElement('div');
  box.style.cssText = "background:rgba(16,20,30,0.98); border:1px solid rgba(255,255,255,0.08); border-radius:16px; padding:24px; width:100%; max-width:400px; max-height:75vh; box-shadow:0 20px 50px rgba(0,0,0,0.6); display:flex; flex-direction:column; gap:14px;";
  const title = document.createElement('h4'); title.style.cssText = "margin:0; font-size:14px; color:#fff; font-weight:700;"; title.textContent = `⚙️ Manage Songs: Folder ${folderName}`;
  const listWrap = document.createElement('div'); listWrap.style.cssText = "flex:1; overflow-y:auto; display:flex; flex-direction:column; gap:6px; padding-right:4px; max-height:45vh;";

  songs.forEach(song => {
    const inFolder = song.tags && song.tags.includes(folderName);
    const row = document.createElement('div'); row.style.cssText = "display:flex; align-items:center; justify-content:space-between; background:#0c0f16; border:1px solid rgba(255,255,255,0.03); padding:10px; border-radius:10px;";
    row.innerHTML = `
      <div style="flex:1; min-width:0; padding-right:10px;">
        <div style="font-size:12px; color:#fff; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${song.title}</div>
        <div style="font-size:11px; color:${inFolder ? 'var(--accent)' : '#6b7394'}; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${song.artist}</div>
      </div>
      <button style="background:${inFolder ? 'var(--danger)' : 'var(--accent)'}; border:none; color:${inFolder ? '#fff' : '#000'}; font-size:10px; font-weight:800; border-radius:6px; padding:6px 10px; cursor:pointer; min-width:75px;">${inFolder ? 'REMOVE' : 'ADD'}</button>
    `;
    
    row.querySelector('button').onclick = (e) => {
      e.stopPropagation();
      if (inFolder) {
        if (!song.isLocal && db) { const remTags = (song.tags || []).filter(t => t !== folderName); db.ref('songs/' + song.id).update({ tags: remTags }); } 
        else { const idx = localSongs.findIndex(ls => ls.id === song.id); if (idx !== -1 && localSongs[idx].tags) { localSongs[idx].tags = localSongs[idx].tags.filter(t => t !== folderName); saveLocalData(); } }
        showToast(`Removed "${song.title}"`);
      } else {
        if (!song.isLocal && db) { db.ref('songs/' + song.id).update({ tags: [...(song.tags || []), folderName] }); } 
        else { const idx = localSongs.findIndex(ls => ls.id === song.id); if (idx !== -1) { if(!localSongs[idx].tags) localSongs[idx].tags = []; localSongs[idx].tags.push(folderName); saveLocalData(); } }
        showToast(`Added "${song.title}"!`);
      }
      combineAndRender();
      showQuickAddTracksModal(folderName, true); 
    };
    listWrap.appendChild(row);
  });
  
  const closeBtn = document.createElement('button'); closeBtn.textContent = "Close Panel"; closeBtn.style.cssText = "width:100%; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.05); color:#fff; border-radius:8px; padding:10px; font-size:12px; font-weight:600; cursor:pointer;";
  
  closeBtn.onclick = (e) => { e.preventDefault(); history.back(); }; 
  
  box.appendChild(title); box.appendChild(listWrap); box.appendChild(closeBtn); overlay.appendChild(box); document.body.appendChild(overlay);
}

// Override openFormModal bawaan script.js untuk mendaftarkan state modal
const origOpenForm = window.openFormModal;
if(origOpenForm) {
  window.openFormModal = function(isEdit, id) {
    history.pushState({ modal: 'formOverlay' }, '');
    origOpenForm(isEdit, id);
  };
}

// ── ⚡ TIMPA FUNGSI DELETE MUSIK ASLI (ANTI-BANTING KE HUB UTAMA) ──
const origDeleteSong = window.deleteSong;
if(origDeleteSong) {
  window.deleteSong = function(id) {
    if (confirm("Delete this song permanently?")) {
      // Aktifkan flag pengunci sebelum DOM berubah / render ulang agar popstate mendiamkan halaman
      window.isDeletingSong = true;
      
      const isCloudId = !String(id).startsWith('local-');
      if (isCloudId && db) {
        db.ref('songs/' + id).remove().then(() => {
          showToast("Deleted from Public!");
          combineAndRender();
          // Matikan flag pengunci setelah render ulang selesai dilakukan
          setTimeout(() => { window.isDeletingSong = false; }, 100);
        }).catch(() => { window.isDeletingSong = false; });
      } else {
        localSongs = localSongs.filter(s => s.id !== id);
        saveLocalData();
        showToast("Deleted from Private!");
        combineAndRender();
        setTimeout(() => { window.isDeletingSong = false; }, 100);
      }
    }
  };
}

// ── 6. ENGINE CORE: PREMIUM HEADER NAVIGATION ──
window.renderTagChips = function() {
  if (customFolderTitle) customFolderTitle.style.display = 'none';
  if (folderBar) folderBar.style.display = 'none'; 

  const logoBrand = document.querySelector('.logo') || document.querySelector('.brand-logo') || document.querySelector('.brand');
  if (logoBrand) {
    logoBrand.style.cssText = `
      font-family: 'Space Mono', monospace; font-size: 20px; font-weight: 900;
      background: linear-gradient(135deg, #00ffcc, #aa00ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      text-shadow: 0 0 12px rgba(0,255,200,0.4); letter-spacing: -1px; cursor: pointer;
    `;
    logoBrand.innerHTML = "AMZ PLAY";
  }

  const header = document.querySelector('.site-header');
  if (header) { header.style.setProperty('height', 'auto', 'important'); header.style.setProperty('position', 'sticky', 'important'); }

  if (tagChips) {
    const parent = tagChips.parentNode;
    if (parent && !document.getElementById('navScrollWrapper')) {
      const wrapper = document.createElement('div'); wrapper.id = 'navScrollWrapper'; 
      wrapper.style.cssText = "position: relative; width: 100%; margin: 10px 0; display: block; touch-action: pan-x !important; overflow: visible !important;";
      
      const fadeIndicator = document.createElement('div'); fadeIndicator.style.cssText = "position: absolute; right: 0; top: 0; height: 100%; width: 50px; background: linear-gradient(to right, transparent, rgba(10,12,18,0.95)); pointer-events: none; z-index: 10; display: flex; align-items: center; justify-content: flex-end; padding-right: 8px; color: var(--accent); font-size: 16px; font-weight:900; border-right: 2px solid var(--accent); animation: pulseGlow 1.5s infinite;";
      fadeIndicator.innerHTML = "➜";
      
      const styleAnim = document.createElement('style'); 
      styleAnim.innerHTML = `
        @keyframes pulseGlow { 0%, 100% { opacity:0.4; transform:translateX(0); } 50% { opacity:1; transform:translateX(3px); } } 
        .chip { transition: transform 0.15s, background 0.2s !important; scroll-snap-align: center; position: relative; font-weight: 700 !important; } 
        .chip:active { transform: scale(0.92) !important; }
        
        .big-action-card {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.03); border: 2px dashed rgba(255,255,255,0.15);
          border-radius: 12px; padding: 20px; text-align: center; cursor: pointer;
          transition: all 0.25s ease; min-height: 160px; box-sizing: border-box; width: 100%;
        }
        .big-action-card:hover {
          background: rgba(255,255,255,0.06); border-color: var(--accent);
          transform: translateY(-2px); box-shadow: 0 10px 20px rgba(0,0,0,0.3);
        }
        .big-action-title { font-size: 15px; font-weight: 800; color: #fff; margin-top: 8px; text-transform: uppercase; }
        
        .grid-folder-item { background: rgba(16, 20, 30, 0.6); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 18px; display: flex; align-items: center; gap: 16px; cursor: pointer; transition: 0.2s; width: 100%; box-sizing: border-box; }
        .grid-folder-item:hover { background: rgba(255,255,255,0.05); border-color: var(--accent); }
        .folder-icon-box { background: rgba(0,255,200,0.1); width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #00ffcc; font-weight: bold; font-size: 13px; font-family: 'Space Mono', monospace; }
        
        .folder-collage-box { width: 60px; height: 65px; border-radius: 8px; overflow: hidden; background: #131720; display: flex; flex-wrap: wrap; flex-shrink: 0; box-shadow: 0 4px 12px rgba(0,0,0,0.5); }
      `; 
      document.head.appendChild(styleAnim);
      parent.insertBefore(wrapper, tagChips); wrapper.appendChild(tagChips); wrapper.appendChild(fadeIndicator);
    }

    tagChips.style.cssText = "display: flex !important; gap: 8px !important; overflow-x: auto !important; scrollbar-width: none !important; padding: 6px 55px 6px 4px !important; width: 100% !important; flex-wrap: nowrap !important; -webkit-overflow-scrolling: touch !important; scroll-behavior: smooth !important; touch-action: pan-x !important; position: relative; overflow-y: visible !important;";
    tagChips.innerHTML = '';

    const majorFolders = [
      { id: 'hub', label: '🌌 Universe' },
      { id: 'discover', label: 'Discover Home' },
      { id: 'random', label: 'Random Music' },
      { id: 'public', label: 'WePlaylist' },
      { id: 'private', label: 'MyPlaylist' },
      { id: 'favorite', label: 'MyFavorite' }
    ];

    majorFolders.forEach(folder => {
      const fBtn = document.createElement('button');
      const isFolderActive = activeFolder === folder.id && activeTag === '';
      fBtn.className = `chip${isFolderActive ? ' active' : ''}`;
      
      if (folder.id === 'hub') {
          fBtn.style.cssText = "font-size: 14px !important; padding: 10px 18px !important; text-transform: uppercase; letter-spacing: 0.5px; background: rgba(124, 106, 247, 0.2) !important; border: 1px solid var(--accent) !important; color: #fff !important;";
      } else {
          fBtn.style.cssText = "font-size: 14px !important; padding: 10px 18px !important; text-transform: uppercase; letter-spacing: 0.5px;";
      }
      fBtn.innerHTML = folder.label;
      
      fBtn.onclick = () => {
        if(folder.id === 'hub') {
            if(typeof returnToHub === 'function') returnToHub();
            return;
        }

        activeFolder = folder.id; 
        activeTag = ''; 
        if(typeof window.activeMood !== 'undefined') window.activeMood = '';
        document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        fBtn.classList.add('active');
        combineAndRender();
        fBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      };
      tagChips.appendChild(fBtn);
    });
  }
};

// ── 7. REKAYASA TOTAL AREA KONTEN GRID ──
const originalRenderAll = window.renderAll;
window.renderAll = function() {
  if (typeof originalRenderAll === 'function') originalRenderAll();

  const songsGrid = document.getElementById('playlistGrid');
  if (!songsGrid) return;

  // 🛠️ CASE A: MENU RANDOM MUSIC ACTIVE (MENAMPILKAN SEMUA MUSIK YANG SUDAH DI-ADD)
  if (activeFolder === 'random' && activeTag === '') {
    songsGrid.innerHTML = '';
    
    const bigAddSongCard = document.createElement('div');
    bigAddSongCard.className = "big-action-card";
    bigAddSongCard.innerHTML = `
      <div style="font-size: 32px; color: var(--accent);">+</div>
      <div class="big-action-title">Add Song</div>
    `;
    bigAddSongCard.onclick = () => { if (typeof openFormModal === 'function') openFormModal(); };
    songsGrid.appendChild(bigAddSongCard);

    if (songs && songs.length > 0) {
      songs.forEach(song => {
        if (typeof buildCard === 'function') { songsGrid.appendChild(buildCard(song)); }
      });
    }
    return;
  }

  // 🛠️ CASE B: USER MEMBUKA "WEPLAYLIST" ATAU "MYPLAYLIST"
  if ((activeFolder === 'public' || activeFolder === 'private') && activeTag === '') {
    songsGrid.innerHTML = ''; 

    const bigAddFolderCard = document.createElement('div');
    bigAddFolderCard.className = "big-action-card";
    bigAddFolderCard.innerHTML = `
      <div style="font-size: 32px; color: var(--accent-2);">+</div>
      <div class="big-action-title">Add Folder</div>
    `;
    bigAddFolderCard.onclick = () => {
      showCustomFolderModal((folderName, access) => {
        let customFoldersMeta = JSON.parse(localStorage.getItem('amz_folders_meta')) || {};
        if (!customFoldersMeta[folderName]) {
          const targetAccess = activeFolder === 'public' ? 'public' : 'private';
          customFoldersMeta[folderName] = { access: targetAccess, createdAt: new Date().toISOString() };
          localStorage.setItem('amz_folders_meta', JSON.stringify(customFoldersMeta));
          showToast(`Folder "${folderName}" created!`);
          combineAndRender();
        } else { alert("Folder name already exists!"); }
      });
    };
    songsGrid.appendChild(bigAddFolderCard);

    const createdFoldersData = JSON.parse(localStorage.getItem('amz_folders_meta')) || {};
    const existingSongTags = [...new Set(songs.flatMap(s => s.tags || []))].filter(Boolean);
    const totalFolders = [...new Set([...Object.keys(createdFoldersData), ...existingSongTags])].sort();

    const currentType = activeFolder === 'public' ? 'public' : 'private';
    totalFolders.forEach(tag => {
      const meta = createdFoldersData[tag] || { access: 'private' };
      if (meta.access === currentType) {
        
        const subFolderTracks = songs.filter(s => s.tags && s.tags.includes(tag));
        
        const folderBox = document.createElement('div');
        folderBox.className = "grid-folder-item";
        
        folderBox.innerHTML = `
          <div class="folder-collage-box" id="grid-collage-${btoa(tag).replace(/=/g, '')}">
            <div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; font-weight:bold; color:var(--accent-2); font-size:11px;">EMPTY</div>
          </div>
          <div style="flex:1; min-width:0;">
            <div style="font-size:14px; color:#fff; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${tag}</div>
            <div style="font-size:11px; color:#6b7394;">${subFolderTracks.length} tracks inside</div>
          </div>
        `;
        
        folderBox.onclick = () => { 
            history.pushState({ folder: tag }, ''); 
            activeTag = tag; 
            combineAndRender(); 
        };
        songsGrid.appendChild(folderBox);

        if(subFolderTracks.length > 0 && typeof window.generateCollageUrl === 'function') {
          const trackCovers = subFolderTracks.map(s => s.cover);
          window.generateCollageUrl(trackCovers, (imgUrl) => {
            const collageTarget = document.getElementById(`grid-collage-${btoa(tag).replace(/=/g, '')}`);
            if(collageTarget) collageTarget.innerHTML = `<img src="${imgUrl}" style="width:100%; height:100%; object-fit:cover;" />`;
          });
        }
      }
    });
    return;
  }

  // 🛠️ CASE C: USER SUDAH MASUK KE DALAM SUB-FOLDER KUSTOM
  if (activeTag !== '') {
    const folderTracks = songs.filter(s => s.tags && s.tags.includes(activeTag));
    songsGrid.innerHTML = '';

    const bigAddTrackCard = document.createElement('div');
    bigAddTrackCard.className = "big-action-card";
    bigAddTrackCard.innerHTML = `
      <div style="font-size: 32px; color: var(--accent);">+</div>
      <div class="big-action-title">Add Song to ${activeTag}</div>
    `;
    
    bigAddTrackCard.onclick = () => {
      if (typeof openFormModal === 'function') {
        openFormModal(); 
        if (fTags) fTags.value = activeTag;
        if (fAutoSearch) { setTimeout(() => fAutoSearch.focus(), 150); }
      }
    };
    songsGrid.appendChild(bigAddTrackCard);

    if (folderTracks.length > 0) {
      folderTracks.forEach(song => {
        if (typeof buildCard === 'function') { songsGrid.appendChild(buildCard(song)); }
      });
    }

    // 💎 CUSTOM MODAL CONFIRMATION UTK MENGHAPUS FOLDER 
    const remFolderCard = document.createElement('div');
    remFolderCard.className = "big-action-card";
    remFolderCard.style.cssText = "border-color: rgba(255, 75, 75, 0.2); background: rgba(255, 75, 75, 0.02); min-height: 80px; margin-top: 25px; grid-column: 1 / -1;";
    remFolderCard.innerHTML = `<div class="big-action-title" style="color:var(--danger)">Delete Entire Folder</div>`;
    
    remFolderCard.onclick = () => {
      history.pushState({ modal: 'customConfirmModal' }, '');

      const oldConfirm = document.getElementById('customConfirmModal'); if(oldConfirm) oldConfirm.remove();

      const confOverlay = document.createElement('div'); confOverlay.id = 'customConfirmModal';
      confOverlay.style.cssText = "position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(5, 7, 10, 0.85); backdrop-filter: blur(15px); z-index: 999999; display: flex; align-items: center; justify-content: center; padding: 20px; box-sizing: border-box; font-family: 'Space Mono', monospace;";

      const confBox = document.createElement('div');
      confBox.style.cssText = "background: #10141e; border: 1px solid rgba(255,75,75,0.2); border-radius: 16px; padding: 24px; width: 100%; max-width: 360px; box-shadow: 0 20px 50px rgba(0,0,0,0.7); display: flex; flex-direction: column; gap: 14px; text-align: center;";

      confBox.innerHTML = `
        <div style="font-size: 24px;">🗑️</div>
        <h4 style="margin: 0; font-size: 16px; color: #fff; font-weight: 700; text-transform: uppercase;">Delete Folder</h4>
        <p style="margin: 0; font-size: 12px; color: #8b93b4; line-height: 1.6;">Are you sure you want to delete "${activeTag}" permanently?<br><span style="color:var(--accent-2)">Lagu di dalamnya tidak akan terhapus.</span></p>
        <div style="display: flex; gap: 10px; justify-content: center; margin-top: 10px;">
          <button id="cancelConfBtn" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 10px 20px; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer;">Cancel</button>
          <button id="actionConfBtn" style="background: var(--danger); color: #fff; border: none; padding: 10px 20px; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 15px rgba(247,95,124,0.3);">Delete</button>
        </div>
      `;

      confOverlay.appendChild(confBox); document.body.appendChild(confOverlay);

      document.getElementById('cancelConfBtn').onclick = (e) => { e.preventDefault(); history.back(); };

      document.getElementById('actionConfBtn').onclick = (e) => {
        e.preventDefault();
        
        localSongs.forEach((s, idx) => {
          if(s.tags && s.tags.includes(activeTag)) { localSongs[idx].tags = s.tags.filter(t => t !== activeTag); }
        });
        
        if (db) {
          songs.forEach(s => {
            if(s.isCloud && s.tags && s.tags.includes(activeTag)) {
              const cleanedCloudTags = s.tags.filter(t => t !== activeTag);
              db.ref('songs/' + s.id).update({ tags: cleanedCloudTags });
            }
          });
        }

        let customFoldersMeta = JSON.parse(localStorage.getItem('amz_folders_meta')) || {};
        if(customFoldersMeta[activeTag]) { 
          delete customFoldersMeta[activeTag]; 
          localStorage.setItem('amz_folders_meta', JSON.stringify(customFoldersMeta)); 
        }
        
        showToast(`Folder deleted.`); 
        const fallbackFolder = activeFolder;
        activeTag = ''; activeFolder = fallbackFolder;
        
        saveLocalData(); 
        
        const targetModal = document.getElementById('customConfirmModal');
        if(targetModal) targetModal.remove();
        history.back();
        
        setTimeout(() => { combineAndRender(); }, 50);
      };
    };
    songsGrid.appendChild(remFolderCard);
  }
};

// ── 8. MANAGEMENT PINDAH FOLDER PADA DETAIL MODAL LAGU ──
const origOpenDetail = window.openDetailModal;
if(origOpenDetail) {
  window.openDetailModal = function(id) {
    history.pushState({ modal: 'detailOverlay' }, '');
    origOpenDetail(id);
    
    const song = songs.find(s => s.id === id); if (!song || !detailPlatforms) return;
    
    const createdFoldersData = JSON.parse(localStorage.getItem('amz_folders_meta')) || {};
    const existingSongTags = [...new Set(songs.flatMap(s => s.tags || []))].filter(Boolean);
    const totalFolders = [...new Set([...Object.keys(createdFoldersData), ...existingSongTags])].sort();

    const moveFolderContainer = document.createElement('div'); moveFolderContainer.style.cssText = "margin-top: 15px; padding-top: 15px; border-top: 1px dashed var(--border); display: flex; flex-direction: column; gap: 8px;";
    const label = document.createElement('label'); label.style.cssText = "font-size: 12px; color: var(--accent-2); font-weight: 600;"; label.textContent = "Move Track to Folder:";
    
    const select = document.createElement('select'); select.style.cssText = "width: 100%; background: var(--surface); border: 1px solid var(--border); padding: 10px; border-radius: 8px; color: #fff; font-size: 13px; outline: none; cursor: pointer;";
    const defOpt = document.createElement('option'); defOpt.value = ""; defOpt.textContent = `-- Select Target Folder --`; select.appendChild(defOpt);
    
    totalFolders.forEach(folder => {
      const opt = document.createElement('option'); opt.value = folder; opt.textContent = `Folder: ${folder}`;
      if (song.tags && song.tags.includes(folder)) opt.selected = true; select.appendChild(opt);
    });

    select.onchange = (e) => {
      const targetFolder = e.target.value; if (!targetFolder) return;
      if (!song.isLocal && db) { db.ref('songs/' + song.id).update({ tags: [targetFolder] }); } 
      else { const localIdx = localSongs.findIndex(s => s.id === song.id); if (localIdx !== -1) { localSongs[localIdx].tags = [targetFolder]; saveLocalData(); } }
      combineAndRender(); history.back(); showToast(`Moved to ${targetFolder}!`);
    };
    moveFolderContainer.appendChild(label); moveFolderContainer.appendChild(select); detailPlatforms.appendChild(moveFolderContainer);
  };
}

// ── 9. TIMPA ENGINE FILTER UTAMA (SUNTIK PATCH DISCOVER HOME BIAR NYALA 100%) ──
const originalGetFilteredSorted = window.getFilteredSorted;
window.getFilteredSorted = function() {
  if (activeFolder === 'discover') {
    return [];
  }
  if (typeof originalGetFilteredSorted === 'function') {
    return originalGetFilteredSorted();
  }
  return [];
};

// ── 10. TIMPA FUNGSI COMBINE DATA ──
window.combineAndRender = function() {
  const markedLocal = localSongs.map(s => ({ ...s, isLocal: true, pinned: pinnedOfficialIds.includes(s.id) }));
  const sortedLocalAndCloud = [...cloudSongs, ...markedLocal].sort((a, b) => new Date(b.addedAt || 0) - new Date(a.addedAt || 0));
  songs = [...sortedLocalAndCloud, ...officialSongs];
  renderAll();
};

if (typeof activeFolder !== 'undefined' && activeFolder === 'all') {
  activeFolder = 'discover';
}

setTimeout(() => { if(typeof renderTagChips === 'function') renderTagChips(); }, 400);
