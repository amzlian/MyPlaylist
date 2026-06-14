/* ═══════════════════════════════════════════════════
   AMZ LIAN — Playlist  ·  script.js (NEXUS MUSIC ENGINE)
═══════════════════════════════════════════════════ */

'use strict';

// ── CONNECT TO FIREBASE DATABASE ──
const firebaseConfig = {
  apiKey: "AIzaSyAUrKFV1gKd92Pmhum6s8gqVC2hi91JbHo",
  authDomain: "myplaylist-2a387.firebaseapp.com",
  databaseURL: "https://myplaylist-2a387-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "myplaylist-2a387",
  storageBucket: "myplaylist-2a387.firebasestorage.app",
  messagingSenderId: "889161528054",
  appId: "1:889161528054:web:9a8e59fac0607b4f8732d7"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const LOCAL_STORAGE_KEY = 'amzLianPlaylist_LocalSongs';
const PINNED_OFFICIAL_KEY = 'amzLianPlaylist_PinnedOfficial';
const DEFAULT_DATA_URL = 'data/songs.json';
const COVER_PLACEHOLDER = 'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 100 100%27%3E%3Crect width=%27100%27 height=%27100%27 fill=%27%23181d2a%27/%3E%3Ctext x=%2750%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-size=%2240%22%3E%F0%9F%8E%B5%3C/text%3E%3C/svg%3E';

const ADMIN_PASSWORD = "amzlian"; 

let officialSongs = []; 
let cloudSongs = [];    
let localSongs = [];    
let pinnedOfficialIds = []; 
let songs = [];         
let externalSearchResults = []; 

// State Antrean Musik & Folder
let activeFolder = 'all'; 
let activeTag = '';       
let searchQuery = '';
let sortMode = 'newest';
let sortPanelOpen = false;
let searchTimeout = null;
let formAutofillTimeout = null;

// ── STATE PEMUTAR MUSIK MODEREN ──
let currentPlayingList = []; // Menyimpan urutan daftar lagu yang sedang aktif
let currentTrackIndex = -1;  // Posisi lagu sekarang dalam antrean
let isShuffle = false;
let isRepeat = false; // false = off, true = repeat current playlist

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
const fAutoSearch    = document.getElementById('fAutoSearch');
const fAutoSearchResults = document.getElementById('fAutoSearchResults');

// ── ELEMEN PEMUTAR BARU ──
const miniPlayer = document.getElementById('miniPlayer');
const playerTitle = document.getElementById('playerTitle');
const playerArtist = document.getElementById('playerArtist');
const closePlayer = document.getElementById('closePlayer');
const audioNode = document.getElementById('nexusAudioEngine');
const btnPlayPause = document.getElementById('btnPlayPause');
const btnNext = document.getElementById('btnNext');
const btnPrev = document.getElementById('btnPrev');
const btnShuffle = document.getElementById('btnShuffle');
const btnRepeat = document.getElementById('btnRepeat');
const playerProgress = document.getElementById('playerProgress');
const currentTimeLabel = document.getElementById('currentTime');
const durationTimeLabel = document.getElementById('durationTime');

// Buat wadah folder atas
const folderBar = document.createElement('div');
folderBar.style.cssText = "display: flex; gap: 10px; overflow-x: auto; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid var(--border); scrollbar-width: none;";
tagChips.parentNode.insertBefore(folderBar, tagChips);

const customFolderTitle = document.createElement('div');
customFolderTitle.style.cssText = "font-size:12px; color:var(--subtle); margin-bottom:8px; margin-top:10px; display:none;";
customFolderTitle.textContent = "📁 Folder Custom Kamu:";
tagChips.parentNode.insertBefore(customFolderTitle, tagChips);

const FOLDERS = [
  { id: 'all', label: '🏠 Beranda', color: '#fff' },
  { id: 'public', label: '👥 Publik', color: 'var(--accent)' },
  { id: 'private', label: '🔒 Pribadi', color: '#ccc' },
  { id: 'favorite', label: '⭐ Favorit', color: '#ffd700' }
];

function renderFolders() {
  folderBar.innerHTML = '';
  FOLDERS.forEach(f => {
    const btn = document.createElement('button'); const isActive = activeFolder === f.id;
    btn.style.cssText = `padding: 8px 16px; border-radius: 12px; font-size: 13px; border: 1px solid ${isActive ? f.color : 'var(--border)'}; background: ${isActive ? 'rgba(255,255,255,0.05)' : 'transparent'}; color: ${isActive ? f.color : 'var(--muted)'}; font-weight: ${isActive ? '600' : '400'}; white-space: nowrap; cursor: pointer; transition: 0.2s;`;
    btn.innerHTML = f.label; btn.onclick = () => { activeFolder = f.id; activeTag = ''; renderAll(); renderFolders(); }; folderBar.appendChild(btn);
  });
}
renderFolders();

const PLATFORMS_CONFIG = [
  { key: 'youtube', label: 'YouTube', icon: `<svg viewBox="0 0 24 24" fill="#FF0000" style="width:14px;height:14px;"><path d="M23.5 6.2a3 3 0 00-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 00.5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 002.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 002.1-2.1c.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8zM9.7 15.5V8.5l6.3 3.5-6.3 3.5z"/></svg>` },
  { key: 'youtubeMusic', label: 'YT Music', icon: `<svg viewBox="0 0 24 24" fill="#FF0000" style="width:14px;height:14px;"><circle cx="12" cy="12" r="11" fill="#FF0000"/><path d="M12 6.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zm-.5 2.5h1v4.5l3.5 2-.5.87-4-2.37V9z" fill="#fff"/></svg>` },
  { key: 'spotify', label: 'Spotify', icon: `<svg viewBox="0 0 24 24" fill="#1DB954" style="width:14px;height:14px;"><path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.5 17.3c-.2.3-.6.4-.9.2-2.6-1.6-5.8-1.9-9.6-1.1-.4.1-.7-.2-.8-.6-.1-.4.2-.7.6-.8 4.2-.9 7.7-.5 10.6 1.3.3.3.4.7.1 1zm1.5-3.3c-.3.4-.8.5-1.2.2-2.9-1.8-7.4-2.3-10.9-1.3-.4.1-.9-.1-1-.5-.1-.4.1-.9.5-1 4-.1 9 .5 12.3 2.5.4.1.5.7.3 1.1zm.1-3.4c-3.5-2.1-9.4-2.3-12.7-1.3-.5.2-1-.1-1.2-.6-.2-.5.1-1 .6-1.2 3.9-1.2 10.3-.9 14.4 1.5.5.3.6.9.4 1.4-.3.5-.9.6-1.5.2z"/></svg>` },
  { key: 'appleMusic', label: 'Apple Music', icon: `<svg viewBox="0 0 24 24" fill="#FC3C44" style="width:14px;height:14px;"><path d="M12 0C5.374 0 0 5.373 0 12s5.374 12 12 12 12-5.373 12-12S18.626 0 12 0zm5.5 17.5h-2.833v-3.667c0-2-.834-2.5-1.917-2.5-1.083 0-1.75.833-1.75 2.5V17.5H8.167V10.5H11v1.25c.333-.667 1.25-1.5 2.75-1.5 1.833 0 3.75 1.083 3.75 4.25V17.5zm-9.334 0H5.333V10.5h2.833V17.5zm-1.416-8.334a1.583 1.583 0 110-3.166 1.583 1.583 0 010 3.166z"/></svg>` },
  { key: 'soundcloud', label: 'SoundCloud', icon: `<svg viewBox="0 0 24 24" fill="#FF5500" style="width:14px;height:14px;"><path d="M1.18 17.36c0 .75.61 1.36 1.37 1.36a1.37 1.37 0 001.37-1.36v-5.94a1.37 1.37 0 00-1.37-1.36 1.37 1.37 0 00-1.37 1.36v5.94zm18.1-7.1a7.5 7.5 0 00-6.24-3.35c-.44 0-.88.04-1.3.12V4.76a1.37 1.37 0 00-2.74 0v12.6c0 .75.61 1.36 1.37 1.36h.02c.16 0 .32-.03.48-.08a7.5 7.5 0 003.41.82c4.14 0 7.5-3.35 7.5-7.5a7.5 7.5 0 00-2.5-5.7z"/></svg>` }
];

function sanitizeText(str) { const div = document.createElement('div'); div.textContent = str; return div.innerHTML; }
function showToast(msg) { clearTimeout(toastTimer); toast.textContent = msg; toast.hidden = false; toastTimer = setTimeout(() => { toast.hidden = true; }, 2500); }
function closeModalsUI() { detailOverlay.hidden = true; formOverlay.hidden = true; }
function closeModalsWithBack() { closeModalsUI(); if (window.history.state && window.history.state.modal) window.history.back(); }
window.addEventListener('popstate', (e) => { if (!e.state || !e.state.modal) closeModalsUI(); });

async function loadData() {
  try { pinnedOfficialIds = JSON.parse(localStorage.getItem(PINNED_OFFICIAL_KEY)) || []; } catch { pinnedOfficialIds = []; }
  try { localSongs = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || []; } catch { localSongs = []; }
  try {
    const res = await fetch(`${DEFAULT_DATA_URL}?t=${new Date().getTime()}`);
    if (res.ok) { const data = await res.json(); officialSongs = data.map(s => ({ ...s, isOfficial: true, pinned: pinnedOfficialIds.includes(s.id) })); }
  } catch (e) { console.warn(e); }

  db.ref('songs').on('value', (snapshot) => {
    const data = snapshot.val(); cloudSongs = [];
    if (data) { Object.keys(data).forEach(key => { cloudSongs.push({ id: key, isCloud: true, ...data[key], pinned: pinnedOfficialIds.includes(key) }); }); }
    combineAndRender();
  });
}

function combineAndRender() {
  const markedLocal = localSongs.map(s => ({ ...s, isLocal: true, pinned: pinnedOfficialIds.includes(s.id) }));
  songs = [...officialSongs, ...cloudSongs, ...markedLocal];
  renderAll();
}

function saveLocalData() { localStorage.setItem(PINNED_OFFICIAL_KEY, JSON.stringify(pinnedOfficialIds)); localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localSongs)); }

function getFilteredSorted() {
  let list = [...songs];
  if (activeFolder === 'public') list = list.filter(s => s.isCloud || s.isOfficial);
  else if (activeFolder === 'private') list = list.filter(s => s.isLocal);
  else if (activeFolder === 'favorite') list = list.filter(s => s.pinned);

  if (activeTag) list = list.filter(s => (s.tags || []).map(t => t.toLowerCase()).includes(activeTag.toLowerCase()));
  if (searchQuery) {
    const searchWords = searchQuery.toLowerCase().split(/\s+/).filter(Boolean);
    list = list.filter(s => {
      const title = (s.title || '').toLowerCase(); const artist = (s.artist || '').toLowerCase();
      return searchWords.every(word => title.includes(word) || artist.includes(word));
    });
  }
  if (sortMode === 'newest') list.sort((a, b) => new Date(b.addedAt || 0) - new Date(a.addedAt || 0));
  else if (sortMode === 'titleAZ') list.sort((a, b) => a.title.localeCompare(b.title));
  else if (sortMode === 'artistAZ') list.sort((a, b) => a.artist.localeCompare(b.artist));
  else if (sortMode === 'pinned') list.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
  return list;
}

function renderTagChips() {
  const visibleSongs = [...songs]; let folderFiltered = visibleSongs;
  if (activeFolder === 'public') folderFiltered = visibleSongs.filter(s => s.isCloud || s.isOfficial);
  else if (activeFolder === 'private') folderFiltered = visibleSongs.filter(s => s.isLocal);
  else if (activeFolder === 'favorite') folderFiltered = visibleSongs.filter(s => s.pinned);

  const allTags = [...new Set(folderFiltered.flatMap(s => s.tags || []))].sort(); tagChips.innerHTML = '';
  if (allTags.length > 0) {
    customFolderTitle.style.display = 'block';
    const allBtn = document.createElement('button'); allBtn.className = `chip${activeTag === '' ? ' active' : ''}`; allBtn.textContent = 'Semua di sini'; allBtn.onclick = () => { activeTag = ''; renderAll(); }; tagChips.appendChild(allBtn);
    allTags.forEach(tag => {
      const btn = document.createElement('button'); btn.className = `chip${activeTag === tag ? ' active' : ''}`; btn.textContent = `📁 ${tag}`; btn.onclick = () => { activeTag = tag; renderAll(); }; tagChips.appendChild(btn);
    });
  } else { customFolderTitle.style.display = 'none'; }
}

async function fetchFromExternalServer(query) {
  if (!query || query.trim().length < 2) { externalSearchResults = []; renderAll(); return; }
  try {
    const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=6`);
    if (!response.ok) return; const data = await response.json();
    externalSearchResults = data.results.map(item => {
      let highResCover = item.artworkUrl100 ? item.artworkUrl100.replace('100x100bb', '300x300bb') : '';
      const searchStr = encodeURIComponent(item.trackName + ' ' + item.artistName);
      return {
        id: `ext-${item.trackId}`, title: item.trackName, artist: item.artistName, cover: highResCover, isExternal: true, previewUrl: item.previewUrl,
        links: {
          ytMusicSearch: `https://music.youtube.com/search?q=${searchStr}`,
          spotifySearch: `https://open.spotify.com/search/${searchStr}`,
          appleMusicSearch: `https://music.apple.com/search?term=${searchStr}`,
          soundcloudSearch: `https://soundcloud.com/search?q=${searchStr}`
        }
      };
    });
    renderAll(); 
  } catch (error) { console.error(error); }
}

async function fetchForFormAutofill(query) {
  if (!query || query.trim().length < 2) { fAutoSearchResults.innerHTML = ''; return; }
  try {
    const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=5`);
    if (!response.ok) return; const data = await response.json(); fAutoSearchResults.innerHTML = '';
    if(data.results.length === 0) { fAutoSearchResults.innerHTML = `<p style="padding:10px; font-size:12px; color:var(--muted)">Lagu tidak ditemukan.</p>`; return; }
    data.results.forEach(item => {
      let highResCover = item.artworkUrl100 ? item.artworkUrl100.replace('100x100bb', '300x300bb') : '';
      const row = document.createElement('div'); row.style.cssText = "display:flex; align-items:center; gap:10px; padding:8px; border-bottom:1px solid var(--border); cursor:pointer; background:var(--card); transition:0.2s;";
      row.innerHTML = `<img src="${item.artworkUrl30 || COVER_PLACEHOLDER}" style="width:30px; height:30px; object-fit:cover; border-radius:4px;" /><div style="flex:1; min-width:0;"><p style="font-size:13px; font-weight:600; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${sanitizeText(item.trackName)}</p><p style="font-size:11px; color:var(--subtle); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${sanitizeText(item.artistName)}</p></div>`;
      row.onmouseenter = () => row.style.background = "var(--border)"; row.onmouseleave = () => row.style.background = "var(--card)";
      row.onclick = () => {
        fTitle.value = item.trackName; fArtist.value = item.artistName; fCover.value = highResCover; updateCoverPreview(highResCover);
        const searchStr = encodeURIComponent(item.trackName + ' ' + item.artistName);
        fYoutube.value = `https://www.youtube.com/results?search_query=${searchStr}`; fYoutubeMusic.value = `https://music.youtube.com/search?q=${searchStr}`; fSpotify.value = `https://open.spotify.com/search/${searchStr}`; fAppleMusic.value = item.trackViewUrl || `https://music.apple.com/search?term=${searchStr}`; fSoundcloud.value = `https://soundcloud.com/search?q=${searchStr}`;
        fAutoSearch.value = ''; fAutoSearchResults.innerHTML = ''; showToast("⚡ Data & Link Terisi Otomatis!");
      };
      fAutoSearchResults.appendChild(row);
    });
  } catch (e) { console.warn(e); }
}

function buildCard(song) {
  const card = document.createElement('article'); card.className = `song-card${song.pinned ? ' is-pinned' : ''}`; card.dataset.id = song.id;
  if (song.isExternal) { card.style.border = "1px solid rgba(124, 106, 247, 0.5)"; card.style.boxShadow = "0 8px 25px rgba(124, 106, 247, 0.15)"; }

  const hasCover = song.cover && song.cover.trim();
  let badgeHtml = `<span class="card-tag" style="background:rgba(255, 255, 255, 0.1); color:#ccc;">🔒 Pribadi</span>`;
  if (song.isOfficial) badgeHtml = `<span class="card-tag" style="background:rgba(61, 220, 172, 0.15); color:var(--accent-2);">🌐 AMZ LIAN</span>`;
  if (song.isCloud) badgeHtml = `<span class="card-tag" style="background:rgba(124, 106, 247, 0.15); color:var(--accent);">👥 Publik</span>`;
  if (song.isExternal) badgeHtml = `<span class="card-tag" style="background:rgba(255, 165, 0, 0.15); color:#ffa500;">🌍 INTERNET</span>`;

  card.innerHTML = `
    <div class="card-cover-wrap">
      ${hasCover ? `<img class="card-cover" src="${sanitizeText(song.cover)}" alt="${sanitizeText(song.title)}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" /><div class="card-cover-placeholder" style="display:none">🎵</div>` : `<div class="card-cover-placeholder">🎵</div>`}
      ${song.pinned ? `<span class="card-pin-badge">⭐ Favorit</span>` : ''}
    </div>
    <div class="card-body">
      <p class="card-title">${sanitizeText(song.title)}</p><p class="card-artist">${sanitizeText(song.artist)}</p>
      <div class="card-tags">${badgeHtml}${!song.isExternal && (song.tags || []).slice(0,1).map(t => `<span class="card-tag">📁 ${sanitizeText(t)}</span>`).join('') || ''}</div>
      <div class="card-actions" style="margin-top:auto; display:flex; gap:6px;">
        ${song.isExternal 
          ? `<button class="card-btn card-btn-play" data-action="toggle-ext-menu" style="flex:1; background:var(--accent); font-size:11px;">🔍 Cari Link...</button>
             <button class="card-btn" style="padding:0 8px; font-size:11px; border:1px solid var(--accent-2); color:var(--accent-2);" onclick="event.stopPropagation(); quickAddFromExternal('${sanitizeText(song.title).replace(/'/g, "\\'")}', '${sanitizeText(song.artist).replace(/'/g, "\\'")}', '${song.cover}', '${song.previewUrl}')">➕ Catat</button>`
          : `<button class="card-btn card-btn-play" data-action="play-now" style="width:100%;">▶ Putar Musik</button>`}
        <div class="player-dropdown" id="dropdown-${song.id}" hidden></div>
      </div>
    </div>
  `;

  if (song.isExternal) {
    const dropdown = card.querySelector(`#dropdown-${song.id}`);
    const searchLinks = [
      { label: 'YouTube Music', url: song.links.ytMusicSearch, icon: PLATFORMS_CONFIG.find(p=>p.key==='youtubeMusic').icon },
      { label: 'Spotify', url: song.links.spotifySearch, icon: PLATFORMS_CONFIG.find(p=>p.key==='spotify').icon },
      { label: 'Apple Music', url: song.links.appleMusicSearch, icon: PLATFORMS_CONFIG.find(p=>p.key==='appleMusic').icon },
      { label: 'SoundCloud', url: song.links.soundcloudSearch, icon: PLATFORMS_CONFIG.find(p=>p.key==='soundcloud').icon },
    ];
    searchLinks.forEach(sl => {
      const btnOpt = document.createElement('button'); btnOpt.className = 'dropdown-opt'; btnOpt.innerHTML = `${sl.icon} Cari di ${sl.label}`;
      btnOpt.onclick = (e) => { e.stopPropagation(); window.open(sl.url, '_blank'); dropdown.hidden = true; }; dropdown.appendChild(btnOpt);
    });
    const btnPreview = document.createElement('button'); btnPreview.className = 'dropdown-opt dropdown-opt-main'; btnPreview.innerHTML = `🎵 Preview Audio (30 dtk)`;
    btnPreview.onclick = (e) => { e.stopPropagation(); initTrackQueue(song, [song]); dropdown.hidden = true; }; dropdown.appendChild(btnPreview);

    card.addEventListener('click', (e) => {
      const btnExt = e.target.closest('[data-action="toggle-ext-menu"]');
      if (btnExt) { e.stopPropagation(); document.querySelectorAll('.player-dropdown').forEach(d => { if(d !== dropdown) d.hidden = true; }); dropdown.hidden = !dropdown.hidden; } else { dropdown.hidden = true; }
    });
  } else {
    card.addEventListener('click', (e) => {
      const playBtn = e.target.closest('[data-action="play-now"]');
      if (playBtn) {
        e.stopPropagation();
        // ── LIVE ANTREAN JALAN: Ambil daftar lagu yang sedang aktif di layar folder saat ini ──
        const currentFolderList = getFilteredSorted();
        initTrackQueue(song, currentFolderList);
      } else {
        openDetailModal(song.id);
      }
    });
  }
  return card;
}

function renderAll() {
  renderTagChips(); const list = getFilteredSorted(); playlistGrid.innerHTML = '';
  if (songs.length === 0 && externalSearchResults.length === 0 && !searchQuery) { emptyState.hidden = false; return; }
  emptyState.hidden = true;

  if (searchQuery) {
    const localHeader = document.createElement('div'); localHeader.style.cssText = "grid-column: 1 / -1; margin-bottom: -10px;";
    localHeader.innerHTML = `<h3 style="font-size:16px; color:var(--text-dim);">🎶 Tersedia di Playlist:</h3>`; playlistGrid.appendChild(localHeader);
  }

  if (list.length > 0) { list.forEach(song => playlistGrid.appendChild(buildCard(song))); } 
  else if (searchQuery) {
    const noLocal = document.createElement('div'); noLocal.style.cssText = "grid-column: 1 / -1; color: var(--muted); font-size: 14px; font-style: italic;";
    noLocal.innerText = "Belum ada di playlist ini."; playlistGrid.appendChild(noLocal);
  }

  if (searchQuery && externalSearchResults.length > 0 && (activeFolder === 'all' || activeFolder === 'public')) {
    const sectionDivider = document.createElement('div'); sectionDivider.style.cssText = "grid-column: 1 / -1; margin-top: 35px; border-top: 2px dashed var(--border); padding-top: 20px; text-align:center;";
    sectionDivider.innerHTML = `<span style="font-family:'Space Mono',monospace; font-size:12px; color:var(--accent); background:rgba(124,106,247,0.15); padding:6px 16px; border-radius:999px;">🌍 REKOMENDASI DARI INTERNET</span><p style="margin-top:10px; font-size:13px; color:var(--text-dim);">Klik <b>Catat</b> untuk menyimpan lagu ini ke dalam foldermu.</p>`;
    playlistGrid.appendChild(sectionDivider); externalSearchResults.forEach(extSong => playlistGrid.appendChild(buildCard(extSong)));
  }
}

// ── ⚡ SAKLAR LOGIKA ANTREAN LENGKAP ALA APP MUSIC (NEXUS TECHNOLOGY) ──
function initTrackQueue(selectedSong, trackList) {
  currentPlayingList = [...trackList];
  currentTrackIndex = currentPlayingList.findIndex(s => s.id === selectedSong.id);
  if (currentTrackIndex === -1) { currentPlayingList.push(selectedSong); currentTrackIndex = currentPlayingList.length - 1; }
  loadAndPlayTrack();
}

async function loadAndPlayTrack() {
  if (currentTrackIndex < 0 || currentTrackIndex >= currentPlayingList.length) return;
  const song = currentPlayingList[currentTrackIndex];

  playerTitle.textContent = song.title;
  playerArtist.textContent = song.artist;
  miniPlayer.hidden = false;
  
  // Set UI Loading awal
  currentTimeLabel.textContent = "0:00";
  durationTimeLabel.textContent = "...";
  playerProgress.value = 0;
  btnPlayPause.innerHTML = "⏳";

  audioNode.src = ""; // Matikan player lama

  // STRATEGI 1: Jika lagu eksternal / punya previewUrl dari Apple Music, putar langsung
  if (song.previewUrl) {
    audioNode.src = song.previewUrl; audioNode.play(); return;
  }

  // STRATEGI 2: Jika link Spotify resmi dipasang, buka player khusus
  const sLink = song.links?.spotify || ''; let sTrackId = '';
  if (sLink.includes('track/')) sTrackId = sLink.split('track/')[1].split('?')[0];
  if (sTrackId) {
    showToast("⚠️ Spotify dialihkan ke mode audio preview.");
  }

  // STRATEGI 3: NEXUS MUSIC ADLESS TECHNOLOGY (SEDOT AUDIO MENTAH YOUTUBE VIA PIPED API)
  const yLink = song.links?.youtube || song.links?.youtubeMusic || '';
  let videoId = '';
  if (yLink.includes('v=')) videoId = yLink.split('v=')[1].split('&')[0];
  else if (yLink.includes('youtu.be/')) videoId = yLink.split('youtu.be/')[1].split('?')[0];
  else if (yLink.includes('embed/')) videoId = yLink.split('embed/')[1].split('?')[0];

  // Jika tidak punya videoId (misal link hasil autofill), cari videoId-nya via server publik gratisan
  if (!videoId) {
    try {
      const q = encodeURIComponent(song.title + ' ' + song.artist);
      const res = await fetch(`https://itunes.apple.com/search?term=${q}&entity=song&limit=1`);
      const data = await res.json();
      if (data.results && data.results.length > 0 && data.results[0].previewUrl) {
        audioNode.src = data.results[0].previewUrl; audioNode.play(); return;
      }
    } catch { }
    playerFrameContainer.innerHTML = ""; // Jaga-jaga player lama
    btnPlayPause.innerHTML = "❌"; durationTimeLabel.textContent = "Error"; return;
  }

  // SEDOT FILE AUDIO MP3/M4A MERDEKA TANPA IKLAN DARI PIPED SERVER
  try {
    const pipeRes = await fetch(`https://pipedapi.kavin.rocks/streams/${videoId}`);
    if (!pipeRes.ok) throw new Error();
    const pipeData = await pipeRes.json();
    
    // Cari stream khusus audio mentah yang ukurannya ringan tapi jernih
    const audioStream = pipeData.audioStreams.find(s => s.mimeType.includes('audio/mp4')) || pipeData.audioStreams[0];
    if (audioStream && audioStream.url) {
      audioNode.src = audioStream.url;
      audioNode.play();
    } else { throw new Error(); }
  } catch {
    // Jalur Cadangan Terakhir jika Piped Down: Ambil Preview iTunes
    try {
      const q = encodeURIComponent(song.title + ' ' + song.artist);
      const r = await fetch(`https://itunes.apple.com/search?term=${q}&entity=song&limit=1`);
      const d = await r.json();
      if(d.results?.[0]?.previewUrl) { audioNode.src = d.results[0].previewUrl; audioNode.play(); } 
      else { btnPlayPause.innerHTML = "❌"; durationTimeLabel.textContent = "Error"; }
    } catch { btnPlayPause.innerHTML = "❌"; durationTimeLabel.textContent = "Error"; }
  }
}

// ── KONTROL TOMBOL PLAYER (NEXT, PREV, SHUFFLE, REPEAT) ──
function formatTime(secs) {
  if (isNaN(secs)) return "0:00";
  const m = Math.floor(secs / 60), s = Math.floor(secs % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

audioNode.onplay = () => btnPlayPause.innerHTML = "⏸";
audioNode.onpause = () => btnPlayPause.innerHTML = "▶";

audioNode.ontimeupdate = () => {
  if (!audioNode.duration) return;
  const progress = (audioNode.currentTime / audioNode.duration) * 100;
  playerProgress.value = progress;
  currentTimeLabel.textContent = formatTime(audioNode.currentTime);
  durationTimeLabel.textContent = formatTime(audioNode.duration);
};

playerProgress.oninput = () => {
  if (!audioNode.duration) return;
  audioNode.currentTime = (playerProgress.value / 100) * audioNode.duration;
};

btnPlayPause.onclick = () => {
  if (audioNode.paused) audioNode.play(); else audioNode.pause();
};

btnNext.onclick = () => {
  if (currentPlayingList.length === 0) return;
  if (isShuffle) {
    currentTrackIndex = Math.floor(Math.random() * currentPlayingList.length);
  } else {
    currentTrackIndex = (currentTrackIndex + 1) % currentPlayingList.length;
  }
  loadAndPlayTrack();
};

btnPrev.onclick = () => {
  if (currentPlayingList.length === 0) return;
  currentTrackIndex = currentTrackIndex - 1;
  if (currentTrackIndex < 0) currentTrackIndex = currentPlayingList.length - 1;
  loadAndPlayTrack();
};

btnShuffle.onclick = () => {
  isShuffle = !isShuffle;
  btnShuffle.style.color = isShuffle ? "var(--accent-2)" : "var(--muted)";
  showToast(isShuffle ? "🔀 Mode acak aktif" : "➡️ Mode urut aktif");
};

btnRepeat.onclick = () => {
  isRepeat = !isRepeat;
  btnRepeat.style.color = isRepeat ? "var(--accent-2)" : "var(--muted)";
  showToast(isRepeat ? "🔁 Ulangi antrean aktif" : "➡️ Mengulang mati");
};

// Saat Lagu Habis: Otomatis Pindah ke Lagu Berikutnya!
audioNode.onended = () => {
  if (isRepeat) {
    loadAndPlayTrack(); // Mengulang lagu yang sama
  } else {
    btnNext.click();    // Maju ke lagu selanjutnya
  }
};

closePlayer.onclick = () => { miniPlayer.hidden = true; audioNode.pause(); audioNode.src = ""; };

// ── SISA EVENT LAIN-LAIN TETAP TERJAGA AMAN ──
searchInput.oninput = (e) => { 
  searchQuery = e.target.value; clearSearch.hidden = !searchQuery; renderAll(); 
  clearTimeout(searchTimeout); if (searchQuery.trim().length >= 2) { searchTimeout = setTimeout(() => { fetchFromExternalServer(searchQuery); }, 700); } else { externalSearchResults = []; renderAll(); }
};
clearSearch.onclick = () => { searchQuery = ''; searchInput.value = ''; clearSearch.hidden = true; externalSearchResults = []; renderAll(); };

fAutoSearch.oninput = (e) => {
  const query = e.target.value; clearTimeout(formAutofillTimeout); if (query.trim().length >= 2) { formAutofillTimeout = setTimeout(() => { fetchForFormAutofill(query); }, 500); } else { fAutoSearchResults.innerHTML = ''; }
};

window.quickAddFromExternal = function(title, artist, coverUrl) {
  openFormModal(); fTitle.value = title; fArtist.value = artist; fCover.value = coverUrl; updateCoverPreview(coverUrl);
  const searchStr = encodeURIComponent(title + ' ' + artist); fYoutube.value = `https://www.youtube.com/results?search_query=${searchStr}`; fYoutubeMusic.value = `https://music.youtube.com/search?q=${searchStr}`; fSpotify.value = `https://open.spotify.com/search/${searchStr}`; fAppleMusic.value = `https://music.apple.com/search?term=${searchStr}`; fSoundcloud.value = `https://soundcloud.com/search?q=${searchStr}`; showToast("📋 Link terisi otomatis!");
};

function openDetailModal(id) {
  const song = songs.find(s => s.id === id); if (!song) return; currentSongId = id;
  detailCover.src = (song.cover && song.cover.trim()) ? song.cover : COVER_PLACEHOLDER; detailTitle.textContent = song.title; detailArtist.textContent = song.artist;
  if (song.isOfficial) detailTags.innerHTML = `<span class="detail-tag" style="background:var(--accent-2); color:#000;">🌐 Official AMZ LIAN</span>`; else if (song.isCloud) detailTags.innerHTML = `<span class="detail-tag" style="background:var(--accent); color:#fff;">👥 Playlist Publik (Cloud)</span>`; else detailTags.innerHTML = `<span class="detail-tag" style="background:#555; color:#fff;">🔒 Playlist Pribadi (Lokal)</span>`;
  detailPlatforms.innerHTML = '';
  const mainPlayBtn = document.createElement('button'); mainPlayBtn.className = 'platform-btn'; mainPlayBtn.style.cssText = "background:var(--accent); border-color:var(--accent); color:#fff; width:100%; margin-bottom:12px;"; mainPlayBtn.innerHTML = `⚡ <span>Putar Langsung di Web</span>`; 
  mainPlayBtn.onclick = () => { const lst = getFilteredSorted(); initTrackQueue(song, lst); closeModalsWithBack(); }; detailPlatforms.appendChild(mainPlayBtn);
  if (song.links) {
    PLATFORMS_CONFIG.forEach(p => { if (song.links[p.key]) { const btn = document.createElement('button'); btn.className = 'platform-btn'; btn.style.cssText = "width:100%; margin-bottom:6px;"; btn.innerHTML = `${p.icon} <span>Buka di ${p.label}</span>`; btn.onclick = () => window.open(song.links[p.key], '_blank'); detailPlatforms.appendChild(btn); } });
  }
  if (song.isOfficial) { detailEditBtn.hidden = true; detailDeleteBtn.hidden = true; } else { detailEditBtn.hidden = false; detailDeleteBtn.hidden = false; }
  detailPinBtn.textContent = song.pinned ? '⭐ Unpin' : '☆ Favorit'; detailOverlay.hidden = false; if (!window.history.state || window.history.state.modal !== 'detail') window.history.pushState({ modal: 'detail' }, "");
}

detailClose.onclick = () => closeModalsWithBack();
detailEditBtn.onclick = () => { detailOverlay.hidden = true; if (window.history.state && window.history.state.modal === 'detail') window.history.replaceState({ modal: 'form' }, ""); openFormModal(currentSongId); };
detailDeleteBtn.onclick = () => {
  const song = songs.find(s => s.id === currentSongId);
  if (song.isCloud) {
    const pass = prompt("Masukkan Password Pemilik untuk menghapus dari Publik:"); if (pass !== ADMIN_PASSWORD) { alert("❌ Password salah! Akses ditolak."); return; }
    db.ref('songs/' + currentSongId).remove().then(() => { showToast("🗑️ Lagu dihapus dari Cloud!"); closeModalsWithBack(); });
  } else { if(confirm("Hapus lagu ini dari playlist pribadi?")) { localSongs = localSongs.filter(s => s.id !== currentSongId); saveLocalData(); combineAndRender(); closeModalsWithBack(); } }
};
detailPinBtn.onclick = () => {
  const song = songs.find(s => s.id === currentSongId); song.pinned = !song.pinned; if (song.isOfficial) { if (song.pinned) pinnedOfficialIds.push(song.id); else pinnedOfficialIds = pinnedOfficialIds.filter(id => id !== song.id); } saveLocalData(); combineAndRender(); closeModalsWithBack();
};

function updateCoverPreview(url) { if(url) { coverPreview.src = url; coverPreview.hidden = false; } else { coverPreview.hidden = true; } }

function openFormModal(id = null) {
  formError.hidden = true; fAutoSearch.value = ''; fAutoSearchResults.innerHTML = ''; 
  if (id) {
    const song = songs.find(s => s.id === id); if (!song) return; editingSongId = id; formTitle.textContent = 'Edit Lagu'; fTitle.value = song.title; fArtist.value = song.artist; fCover.value = song.cover || ''; updateCoverPreview(song.cover); fTags.value = (song.tags || []).join(', '); fYoutube.value = song.links?.youtube || ''; fYoutubeMusic.value = song.links?.youtubeMusic || ''; fSpotify.value = song.links?.spotify || ''; fAppleMusic.value = song.links?.appleMusic || ''; fSoundcloud.value = song.links?.soundcloud || '';
  } else {
    editingSongId = null; formTitle.textContent = 'Tambah Lagu Baru'; [fTitle, fArtist, fCover, fTags, fYoutube, fYoutubeMusic, fSpotify, fAppleMusic, fSoundcloud].forEach(el => el.value = ''); updateCoverPreview('');
  }
  formOverlay.hidden = false; const fTagsLabel = fTags.previousElementSibling; if (fTagsLabel) fTagsLabel.innerHTML = '📁 Buat/Masukkan ke Folder Custom <span class="form-hint">(Opsional)</span>'; fTags.placeholder = "Contoh: Santai, Galau, Workout..."; if (!window.history.state || window.history.state.modal !== 'form') window.history.pushState({ modal: 'form' }, "");
}

fCover.oninput = () => updateCoverPreview(fCover.value);
formClose.onclick = () => closeModalsWithBack(); formCancelBtn.onclick = () => closeModalsWithBack();
formSaveBtn.onclick = () => {
  const title = fTitle.value.trim(), artist = fArtist.value.trim(); if(!title || !artist) { formError.textContent = "Judul dan Artis wajib diisi!"; formError.hidden = false; return; }
  const links = { youtube: fYoutube.value.trim(), youtubeMusic: fYoutubeMusic.value.trim(), spotify: fSpotify.value.trim(), appleMusic: fAppleMusic.value.trim(), soundcloud: fSoundcloud.value.trim() }; const tags = fTags.value.split(',').map(t => t.trim()).filter(Boolean); const tipeAkses = prompt("Pilih tipe akses:\nKetik '1' untuk Folder Pribadi\nKetik '2' untuk Folder Publik");
  if (tipeAkses === '2') {
    const pass = prompt("Masukkan Password Izin Pemilik Web:"); if (pass !== ADMIN_PASSWORD) { alert("❌ Password salah! Gagal di-upload."); return; }
    if (editingSongId) { db.ref('songs/' + editingSongId).update({ title, artist, cover: fCover.value.trim(), tags, links }).then(() => showToast("✅ Lagu publik diperbarui!")); } else { db.ref('songs').push({ title, artist, cover: fCover.value.trim(), tags, links, addedAt: new Date().toISOString() }).then(() => showToast("🚀 Sukses ditambahkan ke Publik!")); }
  } else if (tipeAkses === '1' || tipeAkses === null) {
    if (editingSongId) { const idx = localSongs.findIndex(s => s.id === editingSongId); if(idx !== -1) localSongs[idx] = { ...localSongs[idx], title, artist, cover: fCover.value.trim(), tags, links }; showToast("🔒 Lagu pribadi diperbarui!"); } else { localSongs.unshift({ id: 'local-' + Date.now(), title, artist, cover: fCover.value.trim(), tags, links, addedAt: new Date().toISOString() }); showToast("🔒 Tersimpan di folder pribadi!"); }
  } else { alert("Pilihan tidak valid!"); return; }
  saveLocalData(); combineAndRender(); closeModalsWithBack();
};

exportBtn.onclick = () => {
  if (localSongs.length === 0) { showToast("Folder pribadi kosong!"); return; }
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(localSongs)); const downloadAnchor = document.createElement('a'); downloadAnchor.setAttribute("href", dataStr); downloadAnchor.setAttribute("download", "playlist_pribadi.json"); document.body.appendChild(downloadAnchor); downloadAnchor.click(); downloadAnchor.remove();
};
importBtn.onclick = () => importFile.click();
importFile.onchange = (e) => {
  const file = e.target.files[0]; if (!file) return; const reader = new FileReader();
  reader.onload = (evt) => { try { const parsed = JSON.parse(evt.target.result); if (Array.isArray(parsed)) { localSongs = [...parsed, ...localSongs]; saveLocalData(); combineAndRender(); showToast("✅ Berhasil import!"); } } catch { showToast("❌ File JSON tidak valid!"); } }; reader.readAsText(file);
};

sortBtn.onclick = (e) => { e.stopPropagation(); sortPanelOpen = !sortPanelOpen; sortOptions.hidden = !sortPanelOpen; }; document.onclick = () => { if (sortPanelOpen) { sortPanelOpen = false; sortOptions.hidden = true; } };
sortOptions.querySelectorAll('.sort-opt').forEach(btn => { btn.onclick = (e) => { e.stopPropagation(); sortMode = btn.dataset.sort; sortOptions.querySelectorAll('.sort-opt').forEach(b => b.classList.remove('active')); btn.classList.add('active'); renderAll(); }; });

addBtn.onclick = () => openFormModal();

(async () => { await loadData(); })();
