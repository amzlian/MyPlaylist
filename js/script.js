/* ═══════════════════════════════════════════════════
   AMZ LIAN — Playlist  ·  script.js (ALL PLATFORMS FIX)
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
const fAppleMusic    = document.getElementById('fAppleMusic');
const fSoundcloud    = document.getElementById('fSoundcloud');

// Mini Player Elements
const miniPlayer = document.getElementById('miniPlayer');
const playerTitle = document.getElementById('playerTitle');
const playerArtist = document.getElementById('playerArtist');
const playerFrameContainer = document.getElementById('playerFrameContainer');
const closePlayer = document.getElementById('closePlayer');

const PLATFORMS_CONFIG = [
  { key: 'youtube', label: 'YouTube', icon: `<svg viewBox="0 0 24 24" fill="#FF0000" style="width:16px;height:16px;"><path d="M23.5 6.2a3 3 0 00-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 00.5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 002.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 002.1-2.1c.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8zM9.7 15.5V8.5l6.3 3.5-6.3 3.5z"/></svg>` },
  { key: 'youtubeMusic', label: 'YouTube Music', icon: `<svg viewBox="0 0 24 24" fill="#FF0000" style="width:16px;height:16px;"><circle cx="12" cy="12" r="11" fill="#FF0000"/><path d="M12 6.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zm-.5 2.5h1v4.5l3.5 2-.5.87-4-2.37V9z" fill="#fff"/></svg>` },
  { key: 'spotify', label: 'Spotify', icon: `<svg viewBox="0 0 24 24" fill="#1DB954" style="width:16px;height:16px;"><path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.5 17.3c-.2.3-.6.4-.9.2-2.6-1.6-5.8-1.9-9.6-1.1-.4.1-.7-.2-.8-.6-.1-.4.2-.7.6-.8 4.2-.9 7.7-.5 10.6 1.3.3.3.4.7.1 1zm1.5-3.3c-.3.4-.8.5-1.2.2-2.9-1.8-7.4-2.3-10.9-1.3-.4.1-.9-.1-1-.5-.1-.4.1-.9.5-1 4-.1 9 .5 12.3 2.5.4.1.5.7.3 1.1zm.1-3.4c-3.5-2.1-9.4-2.3-12.7-1.3-.5.2-1-.1-1.2-.6-.2-.5.1-1 .6-1.2 3.9-1.2 10.3-.9 14.4 1.5.5.3.6.9.4 1.4-.3.5-.9.6-1.5.2z"/></svg>` },
  { key: 'appleMusic', label: 'Apple Music', icon: `<svg viewBox="0 0 24 24" fill="#FC3C44" style="width:16px;height:16px;"><path d="M12 0C5.374 0 0 5.373 0 12s5.374 12 12 12 12-5.373 12-12S18.626 0 12 0zm5.5 17.5h-2.833v-3.667c0-2-.834-2.5-1.917-2.5-1.083 0-1.75.833-1.75 2.5V17.5H8.167V10.5H11v1.25c.333-.667 1.25-1.5 2.75-1.5 1.833 0 3.75 1.083 3.75 4.25V17.5zm-9.334 0H5.333V10.5h2.833V17.5zm-1.416-8.334a1.583 1.583 0 110-3.166 1.583 1.583 0 010 3.166z"/></svg>` },
  { key: 'soundcloud', label: 'SoundCloud', icon: `<svg viewBox="0 0 24 24" fill="#FF5500" style="width:16px;height:16px;"><path d="M1.18 17.36c0 .75.61 1.36 1.37 1.36a1.37 1.37 0 001.37-1.36v-5.94a1.37 1.37 0 00-1.37-1.36 1.37 1.37 0 00-1.37 1.36v5.94zm18.1-7.1a7.5 7.5 0 00-6.24-3.35c-.44 0-.88.04-1.3.12V4.76a1.37 1.37 0 00-2.74 0v12.6c0 .75.61 1.36 1.37 1.36h.02c.16 0 .32-.03.48-.08a7.5 7.5 0 003.41.82c4.14 0 7.5-3.35 7.5-7.5a7.5 7.5 0 00-2.5-5.7z"/></svg>` }
];

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
    PLATFORMS_CONFIG.forEach(p => {
      if (song.links[p.key]) {
        const btn = document.createElement('button');
        btn.className = 'platform-btn';
        btn.innerHTML = `${p.icon} <span>${p.label}</span>`;
        btn.onclick = () => window.open(song.links[p.key], '_blank');
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
    fAppleMusic.value = song.links?.appleMusic || ''; fSoundcloud.value = song.links?.soundcloud || '';
  } else {
    editingSongId = null;
    formTitle.textContent = 'Tambah Lagu';
    [fTitle, fArtist, fCover, fTags, fYoutube, fYoutubeMusic, fSpotify, fAppleMusic, fSoundcloud].forEach(el => el.value = '');
  }
  formOverlay.hidden = false;
}

formClose.onclick = () => formOverlay.hidden = true;
formCancelBtn.onclick = () => formOverlay.hidden = true;
formSaveBtn.onclick = () => {
  const title = fTitle.value.trim(), artist = fArtist.value.trim();
  if(!title || !artist) { formError.textContent = "Judul dan Artis wajib diisi!"; formError.hidden = false; return; }

  const links = { 
    youtube: fYoutube.value.trim(), 
    youtubeMusic: fYoutubeMusic.value.trim(), 
    spotify: fSpotify.value.trim(),
    appleMusic: fAppleMusic.value.trim(),
    soundcloud: fSoundcloud.value.trim()
  };
  const tags = fTags.value.split(',').map(t => t.trim()).filter(Boolean);

  if (editingSongId) {
    const idx = localSongs.findIndex(s => s.id === editingSongId);
    if(idx !== -1) localSongs[idx] = { ...localSongs[idx], title, artist, cover: fCover.value.trim(), tags, links };
  } else {
    localSongs.unshift({ id: 'local-' + Date.now(), title, artist, cover: fCover.value.trim(), tags, links, addedAt: new Date().toISOString() });
  }
  saveLocalData(); renderAll(); formOverlay.hidden = true;
};

// Impor / Ekspor Playlist
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
