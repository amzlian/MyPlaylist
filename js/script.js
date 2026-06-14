/* ═══════════════════════════════════════════════════
   AMZ LIAN — Playlist  ·  script.js (HYBRID MODE)
═══════════════════════════════════════════════════ */

'use strict';

// ── Constants ──────────────────────────────────────
const LOCAL_STORAGE_KEY = 'amzLianPlaylist_LocalSongs';
const PINNED_OFFICIAL_KEY = 'amzLianPlaylist_PinnedOfficial';
const DEFAULT_DATA_URL = 'data/songs.json';
const COVER_PLACEHOLDER = 'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 100 100%27%3E%3Crect width=%27100%27 height=%27100%27 fill=%27%23181d2a%27/%3E%3Ctext x=%2750%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-size=%2240%22%3E%F0%9F%8E%B5%3C/text%3E%3C/svg%3E';

// ── State ──────────────────────────────────────────
let officialSongs = []; // Lagu dari GitHub (Tidak bisa diedit orang)
let localSongs = [];    // Lagu dari pengunjung (Tersimpan di HP mereka)
let pinnedOfficialIds = []; // Daftar ID lagu official yang di-pin pengunjung
let songs = [];         // Gabungan keduanya untuk ditampilkan

let currentSongId = null;
let editingSongId = null;
let activeTag = '';
let searchQuery = '';
let sortMode = 'newest';
let sortPanelOpen = false;

// ── DOM ────────────────────────────────────────────
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

// ── Platform Config ────────────────────────────────
const PLATFORMS = [
  { key: 'youtubeMusic', label: 'YouTube Music', icon: `<svg viewBox="0 0 24 24" fill="#FF0000" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="11" fill="#FF0000"/><path d="M12 6.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zm-.5 2.5h1v4.5l3.5 2-.5.87-4-2.37V9z" fill="#fff"/></svg>` },
  { key: 'spotify', label: 'Spotify', icon: `<svg viewBox="0 0 24 24" fill="#1DB954" xmlns="http://www.w3.org/2000/svg"><path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.5 17.3c-.2.3-.6.4-.9.2-2.6-1.6-5.8-1.9-9.6-1.1-.4.1-.7-.2-.8-.6-.1-.4.2-.7.6-.8 4.2-.9 7.7-.5 10.6 1.3.3.3.4.7.1 1zm1.5-3.3c-.3.4-.8.5-1.2.2-2.9-1.8-7.4-2.3-10.9-1.3-.4.1-.9-.1-1-.5-.1-.4.1-.9.5-1 4-.1 9 .5 12.3 2.5.4.1.5.7.3 1.1zm.1-3.4c-3.5-2.1-9.4-2.3-12.7-1.3-.5.2-1-.1-1.2-.6-.2-.5.1-1 .6-1.2 3.9-1.2 10.3-.9 14.4 1.5.5.3.6.9.4 1.4-.3.5-.9.6-1.5.2z"/></svg>` },
  { key: 'youtube', label: 'YouTube', icon: `<svg viewBox="0 0 24 24" fill="#FF0000" xmlns="http://www.w3.org/2000/svg"><path d="M23.5 6.2a3 3 0 00-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 00.5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 002.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 002.1-2.1c.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8zM9.7 15.5V8.5l6.3 3.5-6.3 3.5z"/></svg>` },
  { key: 'appleMusic', label: 'Apple Music', icon: `<svg viewBox="0 0 24 24" fill="#FC3C44" xmlns="http://www.w3.org/2000/svg"><path d="M12 0C5.374 0 0 5.373 0 12s5.374 12 12 12 12-5.373 12-12S18.626 0 12 0zm5.5 17.5h-2.833v-3.667c0-2-.834-2.5-1.917-2.5-1.083 0-1.75.833-1.75 2.5V17.5H8.167V10.5H11v1.25c.333-.667 1.25-1.5 2.75-1.5 1.833 0 3.75 1.083 3.75 4.25V17.5zm-9.334 0H5.333V10.5h2.833V17.5zm-1.416-8.334a1.583 1.583 0 110-3.166 1.583 1.583 0 010 3.166z"/></svg>` },
  { key: 'soundcloud', label: 'SoundCloud', icon: `<svg viewBox="0 0 24 24" fill="#FF5500" xmlns="http://www.w3.org/2000/svg"><path d="M1.18 17.36c0 .75.61 1.36 1.37 1.36a1.37 1.37 0 001.37-1.36v-5.94a1.37 1.37 0 00-1.37-1.36 1.37 1.37 0 00-1.37 1.36v5.94zm18.1-7.1a7.5 7.5 0 00-6.24-3.35c-.44 0-.88.04-1.3.12V4.76a1.37 1.37 0 00-2.74 0v12.6c0 .75.61 1.36 1.37 1.36h.02c.16 0 .32-.03.48-.08a7.5 7.5 0 003.41.82c4.14 0 7.5-3.35 7.5-7.5a7.5 7.5 0 00-2.5-5.7z"/></svg>` }
];

// ── Utils ──────────────────────────────────────────
function genId() { return `local-${Date.now()}-${Math.random().toString(36).slice(2,7)}`; }
function sanitizeText(str) { const div = document.createElement('div'); div.textContent = str; return div.innerHTML; }
function showToast(msg, duration = 2500) {
  clearTimeout(toastTimer); toast.textContent = msg; toast.hidden = false;
  toastTimer = setTimeout(() => { toast.hidden = true; }, duration);
}

// ── Data & Storage ─────────────────────────────────
async function loadData() {
  // 1. Load lagu pengunjung (Lokal)
  try { localSongs = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || []; } catch { localSongs = []; }
  try { pinnedOfficialIds = JSON.parse(localStorage.getItem(PINNED_OFFICIAL_KEY)) || []; } catch { pinnedOfficialIds = []; }

  // 2. Load lagu AMZ LIAN (Official dari JSON)
  try {
    const res = await fetch(`${DEFAULT_DATA_URL}?t=${new Date().getTime()}`); // Mencegah cache
    if (res.ok) {
      const data = await res.json();
      officialSongs = data.map(s => ({ 
        ...s, 
        isOfficial: true, 
        pinned: pinnedOfficialIds.includes(s.id) // Cek apakah pengunjung mem-pin lagu official ini
      }));
    }
  } catch (e) {
    console.warn("Gagal mengambil lagu official.", e);
  }

  // Gabungkan
  songs = [...officialSongs, ...localSongs];
}

function saveLocalData() {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localSongs));
  localStorage.setItem(PINNED_OFFICIAL_KEY, JSON.stringify(pinnedOfficialIds));
  songs = [...officialSongs, ...localSongs];
}

// ── Render ─────────────────────────────────────────
function getFilteredSorted() {
  let list = [...songs];
  if (activeTag) list = list.filter(s => (s.tags || []).map(t => t.toLowerCase()).includes(activeTag.toLowerCase()));
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    list = list.filter(s => s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q) || (s.tags || []).some(t => t.toLowerCase().includes(q)));
  }
  if (sortMode === 'newest') list.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
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
        ${(song.tags || []).slice(0,2).map(t => `<span class="card-tag">${sanitizeText(t)}</span>`).join('')}
      </div>
      <div class="card-actions">
        <button class="card-btn card-btn-play" data-action="play">▶ Play</button>
      </div>
    </div>
    <div class="card-edit-bar">
      <button class="card-edit-btn" data-action="edit">✏️ Edit</button>
      <button class="card-edit-btn card-delete-btn" data-action="delete">🗑 Hapus</button>
    </div>
  `;

  card.addEventListener('click', (e) => {
    const action = e.target.closest('[data-action]')?.dataset.action;
    if (action === 'play') { e.stopPropagation(); openDetailModal(song.id); }
    else if (action === 'edit') { e.stopPropagation(); openFormModal(song.id); }
    else if (action === 'delete') { e.stopPropagation(); deleteSong(song.id); }
    else { openDetailModal(song.id); }
  });

  return card;
}

function renderAll() {
  renderTagChips();
  const list = getFilteredSorted();
  playlistGrid.innerHTML = '';

  if (songs.length === 0) {
    emptyState.hidden = false;
    return;
  }
  emptyState.hidden = true;

  if (list.length === 0) {
    playlistGrid.innerHTML = `<div class="no-results"><strong>Tidak ada hasil</strong>Coba kata kunci atau filter lain.</div>`;
    return;
  }

  list.forEach(song => playlistGrid.appendChild(buildCard(song)));
}

// ── Detail & Actions ───────────────────────────────
function openDetailModal(id) {
  const song = songs.find(s => s.id === id);
  if (!song) return;
  currentSongId = id;

  detailCover.src = (song.cover && song.cover.trim()) ? song.cover : COVER_PLACEHOLDER;
  detailCover.onerror = () => { detailCover.src = COVER_PLACEHOLDER; };
  detailTitle.textContent = song.title;
  detailArtist.textContent = song.artist;

  let tagsHtml = song.isOfficial 
    ? `<span class="detail-tag" style="background:var(--accent-2); color:#000;">🌐 Official AMZ LIAN</span>`
    : `<span class="detail-tag" style="background:#555; color:#fff;">👤 Lokal (Milikmu)</span>`;
  detailTags.innerHTML = tagsHtml + (song.tags || []).map(t => `<span class="detail-tag">${sanitizeText(t)}</span>`).join('');

  detailPlatforms.innerHTML = '';
  PLATFORMS.forEach(p => {
    const url = song.links?.[p.key];
    if (url) {
      const btn = document.createElement('button');
      btn.className = 'platform-btn';
      btn.innerHTML = `${p.icon}<span>${sanitizeText(p.label)}</span>`;
      btn.onclick = () => window.open(url, '_blank', 'noopener');
      detailPlatforms.appendChild(btn);
    }
  });

  updatePinBtn(song);
  detailOverlay.hidden = false;
  document.body.style.overflow = 'hidden';
}

function updatePinBtn(song) {
  detailPinBtn.textContent = song.pinned ? '⭐ Unpin' : '☆ Favorit';
  detailPinBtn.className = `btn-pin${song.pinned ? ' pinned' : ''}`;
}

function closeDetailModal() { detailOverlay.hidden = true; currentSongId = null; document.body.style.overflow = ''; }
detailClose.onclick = closeDetailModal;
detailOverlay.onclick = (e) => { if (e.target === detailOverlay) closeDetailModal(); };

detailEditBtn.onclick = () => { closeDetailModal(); openFormModal(currentSongId); };
detailDeleteBtn.onclick = () => { deleteSong(currentSongId); closeDetailModal(); };

detailPinBtn.onclick = () => {
  const song = songs.find(s => s.id === currentSongId);
  song.pinned = !song.pinned;
  
  if (song.isOfficial) {
    if (song.pinned) pinnedOfficialIds.push(song.id);
    else pinnedOfficialIds = pinnedOfficialIds.filter(id => id !== song.id);
  }
  
  saveLocalData();
  updatePinBtn(song);
  renderAll();
};

// ── Form Modal (Edit/Tambah) ───────────────────────
function openFormModal(id = null) {
  formError.hidden = true;

  if (id) {
    const song = songs.find(s => s.id === id);
    if (song.isOfficial) {
      showToast('⚠️ Lagu Official AMZ LIAN tidak bisa diedit!');
      return;
    }
    editingSongId = id;
    formTitle.textContent = 'Edit Lagu Lokal';
    fTitle.value = song.title; fArtist.value = song.artist; fCover.value = song.cover || '';
    fTags.value = (song.tags || []).join(', ');
    fYoutube.value = song.links?.youtube || ''; fYoutubeMusic.value = song.links?.youtubeMusic || '';
    fSpotify.value = song.links?.spotify || ''; fAppleMusic.value = song.links?.appleMusic || ''; fSoundcloud.value = song.links?.soundcloud || '';
    updateCoverPreview(song.cover);
  } else {
    editingSongId = null;
    formTitle.textContent = 'Tambah Lagu Baru (Lokal)';
    [fTitle, fArtist, fCover, fTags, fYoutube, fYoutubeMusic, fSpotify, fAppleMusic, fSoundcloud].forEach(el => el.value = '');
    coverPreview.hidden = true;
  }

  formOverlay.hidden = false; document.body.style.overflow = 'hidden'; fTitle.focus();
}

function closeFormModal() { formOverlay.hidden = true; editingSongId = null; document.body.style.overflow = ''; }
function updateCoverPreview(url) { if(url) { coverPreview.src = url; coverPreview.hidden = false; } else { coverPreview.hidden = true; } }

addBtn.onclick = () => openFormModal();
formClose.onclick = closeFormModal;
formCancelBtn.onclick = closeFormModal;
formOverlay.onclick = (e) => { if (e.target === formOverlay) closeFormModal(); };

fCover.oninput = () => updateCoverPreview(fCover.value);
fCoverFile.onchange = (e) => {
  const file = e.target.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => { fCover.value = ev.target.result; updateCoverPreview(ev.target.result); };
  reader.readAsDataURL(file);
};

formSaveBtn.onclick = () => {
  formError.hidden = true;
  const title = fTitle.value.trim(), artist = fArtist.value.trim(), cover = fCover.value.trim();
  const links = { youtube: fYoutube.value.trim(), youtubeMusic: fYoutubeMusic.value.trim(), spotify: fSpotify.value.trim(), appleMusic: fAppleMusic.value.trim(), soundcloud: fSoundcloud.value.trim() };
  if (!title || !artist || !Object.values(links).some(v => v.length > 0)) {
    formError.textContent = 'Judul, Artis, dan min. 1 Link wajib diisi!'; formError.hidden = false; return;
  }

  const tags = fTags.value.split(',').map(t => t.trim()).filter(Boolean);

  if (editingSongId) {
    const idx = localSongs.findIndex(s => s.id === editingSongId);
    if (idx !== -1) localSongs[idx] = { ...localSongs[idx], title, artist, cover, tags, links };
    showToast('✅ Lagu lokal diperbarui!');
  } else {
    localSongs.unshift({ id: genId(), title, artist, cover, links, tags, pinned: false, addedAt: new Date().toISOString() });
    showToast('👤 Lagu lokal ditambahkan!');
  }

  saveLocalData(); renderAll(); closeFormModal();
};

function deleteSong(id) {
  const song = songs.find(s => s.id === id);
  if (song.isOfficial) { showToast('⚠️ Lagu Official AMZ LIAN tidak bisa dihapus!'); return; }
  if (!confirm(`Hapus "${song.title}"?`)) return;
  localSongs = localSongs.filter(s => s.id !== id);
  saveLocalData(); renderAll(); showToast('🗑 Lagu dihapus.');
}

// ── Search & Sort ──────────────────────────────────
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

// ── Init ───────────────────────────────────────────
(async () => { await loadData(); renderAll(); })();
