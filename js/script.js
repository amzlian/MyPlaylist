/* ═══════════════════════════════════════════════════
   AMZ LIAN — Playlist  ·  script.js (COMPLETE HYBRID)
═══════════════════════════════════════════════════ */

'use strict';

const LOCAL_STORAGE_KEY = 'amzLianPlaylist_LocalSongs';
const PINNED_OFFICIAL_KEY = 'amzLianPlaylist_PinnedOfficial';
const DEFAULT_DATA_URL = 'data/songs.json';
const COVER_PLACEHOLDER = 'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 100 100%27%3E%3Crect width=%27100%27 height=%27100%27 fill=%27%23181d2a%27/%3E%3Ctext x=%2750%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-size=%2240%22%3E%F0%9F%8E%B5%3C/text%3E%3C/svg%3E';

let officialSongs = []; 
let localSongs = [];    
let pinnedOfficialIds = []; 
let songs = [];         

let currentSongId = null;
let editingSongId = null;
let activeTag = '';
let searchQuery = '';
let sortMode = 'newest';
let sortPanelOpen = false;

const playlistGrid   = document.getElementById('playlistGrid');
const emptyState     = document.getElementById('emptyState');
const searchInput    = document.getElementById('searchInput');
const clearSearch    = document.getElementById('clearSearch');
const addBtn         = document.getElementById('addBtn');
const exportBtn      = document.getElementById('exportBtn');
const importBtn      = document.getElementById('importBtn');
const importFile     = document.getElementById('importFile');
const sortBtn        = document.getElementById('sortBtn');
const sortOptions    = document.getElementById('sortOptions');
const tagChips       = document.getElementById('tagChips');
const toast          = document.getElementById('toast');
let toastTimer;

// Modal Elements
const detailOverlay  = document.getElementById('detailOverlay');
const detailClose    = document.getElementById('detailClose');
const detailCover    = document.getElementById('detailCover');
const detailTitle    = document.getElementById('detailTitle');
const detailArtist   = document.getElementById('detailArtist');
const detailTags     = document.getElementById('detailTags');
const detailPlatforms= document.getElementById('detailPlatforms');
const detailEditBtn  = document.getElementById('detailEditBtn');
const detailDeleteBtn= document.getElementById('detailDeleteBtn');
const detailPinBtn   = document.getElementById('detailPinBtn');

const formOverlay    = document.getElementById('formOverlay');
const formClose      = document.getElementById('formClose');
const formTitle      = document.getElementById('formTitle');
const formCancelBtn  = document.getElementById('formCancelBtn');
const formSaveBtn    = document.getElementById('formSaveBtn');
const formError      = document.getElementById('formError');
const fTitle         = document.getElementById('fTitle');
const fArtist        = document.getElementById('fArtist');
const fCover         = document.getElementById('fCover');
const fCoverFile     = document.getElementById('fCoverFile');
const coverPreview   = document.getElementById('coverPreview');
const fTags          = document.getElementById('fTags');
const fYoutube       = document.getElementById('fYoutube');
const fYoutubeMusic  = document.getElementById('fYoutubeMusic');
const fSpotify       = document.getElementById('fSpotify');

// Mini Player Elements
const miniPlayer = document.getElementById('miniPlayer');
const playerTitle = document.getElementById('playerTitle');
const playerArtist = document.getElementById('playerArtist');
const playerFrameContainer = document.getElementById('playerFrameContainer');
const closePlayer = document.getElementById('closePlayer');

function sanitizeText(str) { const div = document.createElement('div'); div.textContent = str; return div.innerHTML; }
function showToast(msg) {
  clearTimeout(toastTimer); toast.textContent = msg; toast.hidden = false;
  toastTimer = setTimeout(() => { toast.hidden = true; }, 2500);
}

async function loadData() {
  try { localSongs = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || []; } catch { localSongs = []; }
  try { pinnedOfficialIds = JSON.parse(localStorage.getItem(PINNED_OFFICIAL_KEY)) || []; } catch { pinnedOfficialIds = []; }

  try {
    const res = await fetch(`${DEFAULT_DATA_URL}?t=${new Date().getTime()}`);
    if (res.ok) {
      const data = await res.json();
      officialSongs = data.map(s => ({ 
        ...s, 
        isOfficial: true, 
        pinned: pinnedOfficialIds.includes(s.id) 
      }));
    }
  } catch (e) { console.warn("Gagal mengambil playlist resmi.", e); }

  songs = [...officialSongs, ...localSongs];
}

function saveLocalData() {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localSongs));
  localStorage.setItem(PINNED_OFFICIAL_KEY, JSON.stringify(pinnedOfficialIds));
  songs = [...officialSongs, ...localSongs];
}

function getFilteredSorted() {
  let list = [...songs];
  if (activeTag) list = list.filter(s => (s.tags || []).map(t => t.toLowerCase()).includes(activeTag.toLowerCase()));
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    list = list.filter(s => s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q));
  }
  if (sortMode === 'newest') list.sort((a, b) => new Date(b.addedAt || 0) - new Date(a.addedAt || 0));
  else if (sortMode === 'titleAZ') list.sort((a, b) => a.title.localeCompare(b.title));
  else if (sortMode === 'artistAZ') list.sort((a, b) => a.artist.localeCompare(b.artist));
  else if (sortMode === 'pinned') list.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
  return list;
}

function renderTagChips() {
  const allTags = [...new Set(songs.flatMap(s => s.tags || []))].sort();
  tagChips.innerHTML = '';
  const allBtn = document.createElement('button');
  allBtn.className = `chip${activeTag === '' ? ' active' : ''}`;
  allBtn.textContent = 'Semua';
  allBtn.onclick = () => { activeTag = ''; renderAll(); };
  tagChips.appendChild(allBtn);
  allTags.forEach(tag => {
    const btn = document.createElement('button');
    btn.className = `chip${activeTag === tag ? ' active' : ''}`;
    btn.textContent = tag;
    btn.onclick = () => { activeTag = tag; renderAll(); };
    tagChips.appendChild(btn);
  });
}

function buildCard(song) {
  const card = document.createElement('article');
  card.className = `song-card${song.pinned ? ' is-pinned' : ''}`;
  card.dataset.id = song.id;

  const hasCover = song.cover && song.cover.trim();
  const badgeHtml = song.isOfficial 
    ? `<span class="card-tag" style="background:rgba(61, 220, 172, 0.15); color:var(--accent-2);">🌐 AMZ LIAN</span>`
    : `<span class="card-tag" style="background:rgba(255, 255, 255, 0.1); color:#ccc;">👤 Lokal</span>`;

  card.innerHTML = `
    <div class="card-cover-wrap">
      ${hasCover
        ? `<img class="card-cover" src="${sanitizeText(song.cover)}" alt="${sanitizeText(song.title)}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" /><div class="card-cover-placeholder" style="display:none">🎵</div>`
        : `<div class="card-cover-placeholder">🎵</div>`
      }
      ${song.pinned ? `<span class="card-pin-badge">⭐ Favorit</span>` : ''}
    </div>
    <div class="card-body">
      <p class="card-title">${sanitizeText(song.title)}</p>
      <p class="card-artist">${sanitizeText(song.artist)}</p>
      <div class="card-tags">
        ${badgeHtml}
        ${(song.tags || []).slice(0,1).map(t => `<span class="card-tag">${sanitizeText(t)}</span>`).join('')}
      </div>
      <div class="card-actions" style="margin-top:auto;">
        <button class="card-btn card-btn-play" data-action="play">▶ Putar Musik</button>
      </div>
    </div>
  `;

  card.addEventListener('click', (e) => {
    const action = e.target.closest('[data-action]')?.dataset.action;
    if (action === 'play') { e.stopPropagation(); runLivePlayer(song); } 
    else { openDetailModal(song.id); }
  });

  return card;
}

function renderAll() {
  renderTagChips();
  const list = getFilteredSorted();
  playlistGrid.innerHTML = '';

  if (songs.length === 0) { emptyState.hidden = false; return; }
  emptyState.hidden = true;

  if (list.length === 0) {
    playlistGrid.innerHTML = `<div class="no-results"><strong>Tidak ada hasil</strong>Coba kata kunci lain.</div>`;
    return;
  }
  list.forEach(song => playlistGrid.appendChild(buildCard(song)));
}

// ── Sistem Live Mini Player Otomatis ──
function runLivePlayer(song) {
  playerTitle.textContent = song.title;
  playerArtist.textContent = song.artist;
  miniPlayer.hidden = false;
  playerFrameContainer.innerHTML = '';

  const sLink = song.links?.spotify || '';
  const yLink = song.links?.youtube || song.links?.youtubeMusic || '';

  if (sLink && sLink.includes('spotify.com')) {
    const trackId = sLink.split('track/')[1]?.split('?')[0];
    if (trackId) {
      playerFrameContainer.innerHTML = `<iframe src="https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0" allow="encrypted-media; autoplay"></iframe>`;
      return;
    }
  }

  if (yLink) {
    let videoId = '';
    if (yLink.includes('v=')) videoId = yLink.split('v=')[1]?.split('&')[0];
    else videoId = yLink.split('/').pop()?.split('?')[0];
    
    if (videoId) {
      playerFrameContainer.innerHTML = `<iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
      return;
    }
  }

  playerFrameContainer.innerHTML = `<p style="color:var(--danger); font-size:12px; text-align:center; padding-top:30px;">Link tidak didukung pemutar langsung.</p>`;
}

closePlayer.onclick = () => {
  miniPlayer.hidden = true;
  playerFrameContainer.innerHTML = '';
};

// ── Modals & Actions ──
function openDetailModal(id) {
  const song = songs.find(s => s.id === id);
  if (!song) return;
  currentSongId = id;

  detailCover.src = (song.cover && song.cover.trim()) ? song.cover : COVER_PLACEHOLDER;
  detailTitle.textContent = song.title;
  detailArtist.textContent = song.artist;

  detailTags.innerHTML = song.isOfficial 
    ? `<span class="detail-tag" style="background:var(--accent-2); color:#000;">🌐 Official AMZ LIAN</span>`
    : `<span class="detail-tag" style="background:#555; color:#fff;">👤 Lokal</span>`;

  detailPlatforms.innerHTML = '';
  if (song.links) {
    Object.keys(song.links).forEach(key => {
      if (song.links[key]) {
        const btn = document.createElement('button');
        btn.className = 'platform-btn';
        btn.textContent = key.toUpperCase();
        btn.onclick = () => window.open(song.links[key], '_blank');
        detailPlatforms.appendChild(btn);
      }
    });
  }

  if (song.isOfficial) {
    detailEditBtn.hidden = true; detailDeleteBtn.hidden = true;
  } else {
    detailEditBtn.hidden = false; detailDeleteBtn.hidden = false;
  }

  detailPinBtn.textContent = song.pinned ? '⭐ Unpin' : '☆ Favorit';
  detailOverlay.hidden = false;
}

detailClose.onclick = () => detailOverlay.hidden = true;
detailEditBtn.onclick = () => { detailOverlay.hidden = true; openFormModal(currentSongId); };
detailDeleteBtn.onclick = () => { if(confirm("Hapus lagu ini?")) { localSongs = localSongs.filter(s => s.id !== currentSongId); saveLocalData(); renderAll(); detailOverlay.hidden = true; } };
detailPinBtn.onclick = () => {
  const song = songs.find(s => s.id === currentSongId);
  song.pinned = !song.pinned;
  if (song.isOfficial) {
    if (song.pinned) pinnedOfficialIds.push(song.id);
    else pinnedOfficialIds = pinnedOfficialIds.filter(id => id !== song.id);
  }
  saveLocalData(); renderAll(); detailOverlay.hidden = true;
};

function openFormModal(id = null) {
  formError.hidden = true;
  if (id) {
    const song = localSongs.find(s => s.id === id);
    if (!song) return;
    editingSongId = id;
    formTitle.textContent = 'Edit Lagu';
    fTitle.value = song.title; fArtist.value = song.artist; fCover.value = song.cover || '';
    fTags.value = (song.tags || []).join(', ');
    fYoutube.value = song.links?.youtube || ''; fYoutubeMusic.value = song.links?.youtubeMusic || ''; fSpotify.value = song.links?.spotify || '';
  } else {
    editingSongId = null;
    formTitle.textContent = 'Tambah Lagu';
    [fTitle, fArtist, fCover, fTags, fYoutube, fYoutubeMusic, fSpotify].forEach(el => el.value = '');
  }
  formOverlay.hidden = false;
}

formClose.onclick = () => formOverlay.hidden = true;
formCancelBtn.onclick = () => formOverlay.hidden = true;
formSaveBtn.onclick = () => {
  const title = fTitle.value.trim(), artist = fArtist.value.trim();
  if(!title || !artist) { formError.textContent = "Judul dan Artis wajib diisi!"; formError.hidden = false; return; }

  const links = { youtube: fYoutube.value.trim(), youtubeMusic: fYoutubeMusic.value.trim(), spotify: fSpotify.value.trim() };
  const tags = fTags.value.split(',').map(t => t.trim()).filter(Boolean);

  if (editingSongId) {
    const idx = localSongs.findIndex(s => s.id === editingSongId);
    if(idx !== -1) localSongs[idx] = { ...localSongs[idx], title, artist, cover: fCover.value.trim(), tags, links };
  } else {
    localSongs.unshift({ id: 'local-' + Date.now(), title, artist, cover: fCover.value.trim(), tags, links, addedAt: new Date().toISOString() });
  }
  saveLocalData(); renderAll(); formOverlay.hidden = true;
};

// ── Impor / Ekspor Playlist ──
exportBtn.onclick = () => {
  if (localSongs.length === 0) { showToast("Playlist lokal kosong!"); return; }
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(localSongs));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", "my_playlist.json");
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};
importBtn.onclick = () => importFile.click();
importFile.onchange = (e) => {
  const file = e.target.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = (evt) => {
    try {
      const parsed = JSON.parse(evt.target.result);
      if (Array.isArray(parsed)) {
        localSongs = [...parsed, ...localSongs];
        saveLocalData(); renderAll(); showToast("✅ Playlist Berhasil Diimport!");
      }
    } catch { showToast("❌ File JSON tidak valid!"); }
  };
  reader.readAsText(file);
};

searchInput.oninput = (e) => { searchQuery = e.target.value; clearSearch.hidden = !searchQuery; renderAll(); };
clearSearch.onclick = () => { searchQuery = ''; searchInput.value = ''; clearSearch.hidden = true; renderAll(); };
sortBtn.onclick = (e) => { e.stopPropagation(); sortPanelOpen = !sortPanelOpen; sortOptions.hidden = !sortPanelOpen; };
document.onclick = () => { if (sortPanelOpen) { sortPanelOpen = false; sortOptions.hidden = true; } };
sortOptions.querySelectorAll('.sort-opt').forEach(btn => {
  btn.onclick = (e) => {
    e.stopPropagation(); sortMode = btn.dataset.sort;
    sortOptions.querySelectorAll('.sort-opt').forEach(b => b.classList.remove('active'));
    btn.classList.add('active'); renderAll();
  };
});

addBtn.onclick = () => openFormModal();

(async () => { await loadData(); renderAll(); })();
