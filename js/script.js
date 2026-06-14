/* ═══════════════════════════════════════════════════
   AMZ LIAN — Playlist  ·  script.js (REAL-TIME EXTERNAL SEARCH)
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

const ADMIN_PASSWORD = "amzlianrahasia"; // Ganti dengan password pilihanmu!

let officialSongs = []; 
let cloudSongs = [];    
let localSongs = [];    
let pinnedOfficialIds = []; 
let songs = [];         
let externalSearchResults = []; // Menyimpan hasil pencarian dari luar luar web

let currentSongId = null;
let editingSongId = null;
let activeTag = '';
let searchQuery = '';
let sortMode = 'newest';
let sortPanelOpen = false;
let searchTimeout = null;

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
  { key: 'youtube', label: 'YouTube', icon: `<svg viewBox="0 0 24 24" fill="#FF0000" style="width:14px;height:14px;"><path d="M23.5 6.2a3 3 0 00-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 00.5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 002.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 002.1-2.1c.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8zM9.7 15.5V8.5l6.3 3.5-6.3 3.5z"/></svg>` },
  { key: 'youtubeMusic', label: 'YT Music', icon: `<svg viewBox="0 0 24 24" fill="#FF0000" style="width:14px;height:14px;"><circle cx="12" cy="12" r="11" fill="#FF0000"/><path d="M12 6.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zm-.5 2.5h1v4.5l3.5 2-.5.87-4-2.37V9z" fill="#fff"/></svg>` },
  { key: 'spotify', label: 'Spotify', icon: `<svg viewBox="0 0 24 24" fill="#1DB954" style="width:14px;height:14px;"><path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.5 17.3c-.2.3-.6.4-.9.2-2.6-1.6-5.8-1.9-9.6-1.1-.4.1-.7-.2-.8-.6-.1-.4.2-.7.6-.8 4.2-.9 7.7-.5 10.6 1.3.3.3.4.7.1 1zm1.5-3.3c-.3.4-.8.5-1.2.2-2.9-1.8-7.4-2.3-10.9-1.3-.4.1-.9-.1-1-.5-.1-.4.1-.9.5-1 4-.1 9 .5 12.3 2.5.4.1.5.7.3 1.1zm.1-3.4c-3.5-2.1-9.4-2.3-12.7-1.3-.5.2-1-.1-1.2-.6-.2-.5.1-1 .6-1.2 3.9-1.2 10.3-.9 14.4 1.5.5.3.6.9.4 1.4-.3.5-.9.6-1.5.2z"/></svg>` }
];

function sanitizeText(str) { const div = document.createElement('div'); div.textContent = str; return div.innerHTML; }
function showToast(msg) {
  clearTimeout(toastTimer); toast.textContent = msg; toast.hidden = false;
  toastTimer = setTimeout(() => { toast.hidden = true; }, 2500);
}

async function loadData() {
  try { pinnedOfficialIds = JSON.parse(localStorage.getItem(PINNED_OFFICIAL_KEY)) || []; } catch { pinnedOfficialIds = []; }
  try { localSongs = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || []; } catch { localSongs = []; }

  try {
    const res = await fetch(`${DEFAULT_DATA_URL}?t=${new Date().getTime()}`);
    if (res.ok) {
      const data = await res.json();
      officialSongs = data.map(s => ({ ...s, isOfficial: true, pinned: pinnedOfficialIds.includes(s.id) }));
    }
  } catch (e) { console.warn("Gagal mengambil playlist resmi.", e); }

  db.ref('songs').on('value', (snapshot) => {
    const data = snapshot.val();
    cloudSongs = [];
    if (data) {
      Object.keys(data).forEach(key => {
        cloudSongs.push({ id: key, isCloud: true, ...data[key], pinned: pinnedOfficialIds.includes(key) });
      });
    }
    combineAndRender();
  });
}

function combineAndRender() {
  const markedLocal = localSongs.map(s => ({ ...s, isLocal: true, pinned: pinnedOfficialIds.includes(s.id) }));
  songs = [...officialSongs, ...cloudSongs, ...markedLocal];
  renderAll();
}

function saveLocalData() {
  localStorage.setItem(PINNED_OFFICIAL_KEY, JSON.stringify(pinnedOfficialIds));
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localSongs));
}

function getFilteredSorted() {
  let list = [...songs];
  if (activeTag) {
    list = list.filter(s => (s.tags || []).map(t => t.toLowerCase()).includes(activeTag.toLowerCase()));
  }
  if (searchQuery) {
    const searchWords = searchQuery.toLowerCase().split(/\s+/).filter(Boolean);
    list = list.filter(s => {
      const title = (s.title || '').toLowerCase();
      const artist = (s.artist || '').toLowerCase();
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

// ── FUNGSI REVOLUSIONER: FETCH DATA LANGSUNG DARI LUAR WEB (API) ──
async function fetchFromExternalServer(query) {
  if (!query || query.trim().length < 2) { externalSearchResults = []; return; }
  
  try {
    // Menembak server cermin Invidious API publik untuk mencari lagu/video musik teratas
    const response = await fetch(`https://invidious.v0id.org/api/v1/search?q=${encodeURIComponent(query)}&type=video`);
    if (!response.ok) return;
    const data = await response.json();
    
    // Ambil maksimal 4 hasil teratas, lalu konversi formatnya menjadi kartu lagu biasa
    externalSearchResults = data.slice(0, 4).map(item => {
      return {
        id: `ext-${item.videoId}`,
        title: item.title,
        artist: item.author || "YouTube Artist",
        cover: item.videoThumbnails ? item.videoThumbnails.find(t => t.quality === "medium")?.url : "",
        isExternal: true, // Tanda bahwa lagu berasal dari luar database web
        links: {
          youtube: `https://www.youtube.com/watch?v=${item.videoId}`
        }
      };
    });
    renderAll(); // Gambar ulang halaman setelah data luar berhasil dimuat
  } catch (error) {
    console.error("Gagal menarik data dari luar web:", error);
  }
}

function buildCard(song) {
  const card = document.createElement('article');
  card.className = `song-card${song.pinned ? ' is-pinned' : ''}`;
  card.dataset.id = song.id;

  // Berikan warna border atau style khusus jika kartu ditarik dari server luar web
  if (song.isExternal) {
    card.style.border = "1px solid rgba(124, 106, 247, 0.4)";
    card.style.boxShadow = "0 4px 20px rgba(124, 106, 247, 0.1)";
  }

  const hasCover = song.cover && song.cover.trim();
  let badgeHtml = `<span class="card-tag" style="background:rgba(255, 255, 255, 0.1); color:#ccc;">🔒 Pribadi</span>`;
  if (song.isOfficial) badgeHtml = `<span class="card-tag" style="background:rgba(61, 220, 172, 0.15); color:var(--accent-2);">🌐 AMZ LIAN</span>`;
  if (song.isCloud) badgeHtml = `<span class="card-tag" style="background:rgba(124, 106, 247, 0.15); color:var(--accent);">👥 Publik</span>`;
  if (song.isExternal) badgeHtml = `<span class="card-tag" style="background:rgba(255, 165, 0, 0.15); color:#ffa500;">🌍 Server Luar</span>`;

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
        ${!song.isExternal && (song.tags || []).slice(0,1).map(t => `<span class="card-tag">${sanitizeText(t)}</span>`).join('') || ''}
      </div>
      <div class="card-actions" style="margin-top:auto; display:flex; gap:6px;">
        ${song.isExternal 
          ? `<button class="card-btn card-btn-play style-main" style="flex:1; background:var(--accent);" onclick="event.stopPropagation(); playExternalDirect('${song.links.youtube}', '${sanitizeText(song.title)}')">▶ Putar</button>
             <button class="card-btn" style="padding:0 8px; font-size:11px; border-color:var(--accent-2); color:var(--accent-2);" onclick="event.stopPropagation(); quickAddFromExternal('${sanitizeText(song.title)}', '${sanitizeText(song.artist)}', '${song.links.youtube}')">➕ Catat</button>`
          : `<button class="card-btn card-btn-play" data-action="toggle-menu" style="width:100%;">▶ Putar Musik</button>`
        }
        <div class="player-dropdown" id="dropdown-${song.id}" hidden></div>
      </div>
    </div>
  `;

  if (!song.isExternal) {
    const dropdown = card.querySelector(`#dropdown-${song.id}`);
    const optDirect = document.createElement('button');
    optDirect.className = 'dropdown-opt dropdown-opt-main';
    optDirect.innerHTML = `⚡ Putar Langsung`;
    optDirect.onclick = (e) => { e.stopPropagation(); runLivePlayer(song); dropdown.hidden = true; };
    dropdown.appendChild(optDirect);

    if (song.links) {
      PLATFORMS_CONFIG.forEach(p => {
        if (song.links[p.key]) {
          const btnOpt = document.createElement('button');
          btnOpt.className = 'dropdown-opt';
          btnOpt.innerHTML = `${p.icon} Ke ${p.label}`;
          btnOpt.onclick = (e) => { e.stopPropagation(); window.open(song.links[p.key], '_blank'); dropdown.hidden = true; };
          dropdown.appendChild(btnOpt);
        }
      });
    }

    card.addEventListener('click', (e) => {
      const btnPlay = e.target.closest('[data-action="toggle-menu"]');
      if (btnPlay) {
        e.stopPropagation();
        document.querySelectorAll('.player-dropdown').forEach(d => { if(d !== dropdown) d.hidden = true; });
        dropdown.hidden = !dropdown.hidden;
      } else {
        dropdown.hidden = true;
        openDetailModal(song.id);
      }
    });
  }

  return card;
}

document.addEventListener('click', () => {
  document.querySelectorAll('.player-dropdown').forEach(d => d.hidden = true);
});

// ── ENGINE DRAWING DENGAN HASIL INTEGRASI DATABASE & SERVER LUAR ──
function renderAll() {
  renderTagChips();
  const list = getFilteredSorted();
  playlistGrid.innerHTML = '';

  if (songs.length === 0 && externalSearchResults.length === 0 && !searchQuery) { emptyState.hidden = false; return; }
  emptyState.hidden = true;

  // 1. Gambar kartu lagu yang bersumber dari database internal kamu
  list.forEach(song => playlistGrid.appendChild(buildCard(song)));

  // 2. Jika sedang mencari, gambarkan langsung hasil pencarian langsung dari Server Luar Web
  if (searchQuery && externalSearchResults.length > 0) {
    const sectionDivider = document.createElement('div');
    sectionDivider.style.cssText = "grid-column: 1 / -1; margin-top: 25px; border-top: 1px dashed var(--border); padding-top: 20px; text-align:center;";
    sectionDivider.innerHTML = `<span style="font-family:'Space Mono',monospace; font-size:11px; color:var(--accent); background:rgba(124,106,247,0.1); padding:4px 14px; border-radius:999px;">🌍 HASIL PENCARIAN REAL-TIME DARI LUAR WEB</span>`;
    playlistGrid.appendChild(sectionDivider);

    // Render kartu hasil scrapping luar web secara mulus
    externalSearchResults.forEach(extSong => {
      playlistGrid.appendChild(buildCard(extSong));
    });
  }
}

// Fungsi putar langsung musik eksternal luar web
window.playExternalDirect = function(youtubeUrl, title) {
  playerTitle.textContent = title;
  playerArtist.textContent = "External Server Source";
  miniPlayer.hidden = false;
  let videoId = youtubeUrl.split('v=')[1];
  playerFrameContainer.innerHTML = `<iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
};

// Fungsi mencatat instan lagu luar web ke formulir pendaftaran
window.quickAddFromExternal = function(title, artist, youtubeUrl) {
  openFormModal();
  fTitle.value = title;
  fArtist.value = artist;
  fYoutube.value = youtubeUrl;
  showToast("📋 Lagu luar berhasil disalin ke Form Tambah!");
};

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
  playerFrameContainer.innerHTML = `<p style="color:var(--danger); font-size:12px; text-align:center; padding-top:30px;">Platform tidak didukung pemutar langsung.</p>`;
}

closePlayer.onclick = () => { miniPlayer.hidden = true; playerFrameContainer.innerHTML = ''; };

function openDetailModal(id) {
  const song = songs.find(s => s.id === id);
  if (!song) return;
  currentSongId = id;

  detailCover.src = (song.cover && song.cover.trim()) ? song.cover : COVER_PLACEHOLDER;
  detailTitle.textContent = song.title;
  detailArtist.textContent = song.artist;

  if (song.isOfficial) detailTags.innerHTML = `<span class="detail-tag" style="background:var(--accent-2); color:#000;">🌐 Official AMZ LIAN</span>`;
  else if (song.isCloud) detailTags.innerHTML = `<span class="detail-tag" style="background:var(--accent); color:#fff;">👥 Playlist Publik (Cloud)</span>`;
  else detailTags.innerHTML = `<span class="detail-tag" style="background:#555; color:#fff;">🔒 Playlist Pribadi (Lokal)</span>`;

  detailPlatforms.innerHTML = '';
  const mainPlayBtn = document.createElement('button');
  mainPlayBtn.className = 'platform-btn';
  mainPlayBtn.style.background = 'var(--accent)';
  mainPlayBtn.style.borderColor = 'var(--accent)';
  mainPlayBtn.style.color = '#fff';
  mainPlayBtn.style.width = '100%';
  mainPlayBtn.style.marginBottom = '12px';
  mainPlayBtn.innerHTML = `⚡ <span>Putar Langsung di Web</span>`;
  mainPlayBtn.onclick = () => { runLivePlayer(song); detailOverlay.hidden = true; };
  detailPlatforms.appendChild(mainPlayBtn);

  if (song.links) {
    PLATFORMS_CONFIG.forEach(p => {
      if (song.links[p.key]) {
        const btn = document.createElement('button');
        btn.className = 'platform-btn';
        btn.style.width = '100%';
        btn.style.marginBottom = '6px';
        btn.innerHTML = `${p.icon} <span>Buka di ${p.label}</span>`;
        btn.onclick = () => window.open(song.links[p.key], '_blank');
        detailPlatforms.appendChild(btn);
      }
    });
  }

  if (song.isOfficial) { detailEditBtn.hidden = true; detailDeleteBtn.hidden = true; } 
  else { detailEditBtn.hidden = false; detailDeleteBtn.hidden = false; }

  detailPinBtn.textContent = song.pinned ? '⭐ Unpin' : '☆ Favorit';
  detailOverlay.hidden = false;
}

detailClose.onclick = () => detailOverlay.hidden = true;
detailEditBtn.onclick = () => { detailOverlay.hidden = true; openFormModal(currentSongId); };
detailDeleteBtn.onclick = () => { 
  const song = songs.find(s => s.id === currentSongId);
  if (song.isCloud) {
    const pass = prompt("Masukkan Password Pemilik untuk menghapus dari Publik:");
    if (pass !== ADMIN_PASSWORD) { alert("❌ Password salah! Akses ditolak."); return; }
    db.ref('songs/' + currentSongId).remove().then(() => { showToast("🗑️ Lagu dihapus dari Cloud!"); detailOverlay.hidden = true; });
  } else {
    if(confirm("Hapus lagu ini dari playlist pribadi?")) {
      localSongs = localSongs.filter(s => s.id !== currentSongId);
      saveLocalData(); combineAndRender(); detailOverlay.hidden = true;
    }
  }
};

detailPinBtn.onclick = () => {
  const song = songs.find(s => s.id === currentSongId);
  song.pinned = !song.pinned;
  if (song.isOfficial) {
    if (song.pinned) pinnedOfficialIds.push(song.id);
    else pinnedOfficialIds = pinnedOfficialIds.filter(id => id !== song.id);
  }
  saveLocalData(); combineAndRender(); detailOverlay.hidden = true;
};

function openFormModal(id = null) {
  formError.hidden = true;
  if (id) {
    const song = songs.find(s => s.id === id);
    if (!song) return;
    editingSongId = id;
    formTitle.textContent = 'Edit Lagu';
    fTitle.value = song.title; fArtist.value = song.artist; fCover.value = song.cover || '';
    fTags.value = (song.tags || []).join(', ');
    fYoutube.value = song.links?.youtube || ''; fYoutubeMusic.value = song.links?.youtubeMusic || ''; fSpotify.value = song.links?.spotify || '';
    fAppleMusic.value = song.links?.appleMusic || ''; fSoundcloud.value = song.links?.soundcloud || '';
  } else {
    editingSongId = null;
    formTitle.textContent = 'Tambah Lagu Baru';
    [fTitle, fArtist, fCover, fTags, fYoutube, fYoutubeMusic, fSpotify, fAppleMusic, fSoundcloud].forEach(el => el.value = '');
  }
  formOverlay.hidden = false;
}

formClose.onclick = () => formOverlay.hidden = true;
formCancelBtn.onclick = () => formOverlay.hidden = true;
formSaveBtn.onclick = () => {
  const title = fTitle.value.trim(), artist = fArtist.value.trim();
  if(!title || !artist) { formError.textContent = "Judul dan Artis wajib diisi!"; formError.hidden = false; return; }

  const links = { youtube: fYoutube.value.trim(), youtubeMusic: fYoutubeMusic.value.trim(), spotify: fSpotify.value.trim(), appleMusic: fAppleMusic.value.trim(), soundcloud: fSoundcloud.value.trim() };
  const tags = fTags.value.split(',').map(t => t.trim()).filter(Boolean);

  const tipeAkses = prompt("Pilih tipe akses upload:\nKetik '1' untuk Pribadi (Hanya di HP-mu)\nKetik '2' untuk Publik (Dilihat semua orang)");

  if (tipeAkses === '2') {
    const pass = prompt("Masukkan Password Izin Pemilik Web:");
    if (pass !== ADMIN_PASSWORD) { alert("❌ Password salah! Gagal di-upload."); return; }

    if (editingSongId) {
      db.ref('songs/' + editingSongId).update({ title, artist, cover: fCover.value.trim(), tags, links })
        .then(() => showToast("✅ Lagu publik diperbarui!"));
    } else {
      db.ref('songs').push({ title, artist, cover: fCover.value.trim(), tags, links, addedAt: new Date().toISOString() })
        .then(() => showToast("🚀 Sukses ditambahkan ke Cloud Publik!"));
    }
  } else if (tipeAkses === '1' || tipeAkses === null) {
    if (editingSongId) {
      const idx = localSongs.findIndex(s => s.id === editingSongId);
      if(idx !== -1) localSongs[idx] = { ...localSongs[idx], title, artist, cover: fCover.value.trim(), tags, links };
      showToast("🔒 Lagu pribadi diperbarui!");
    } else {
      localSongs.unshift({ id: 'local-' + Date.now(), title, artist, cover: fCover.value.trim(), tags, links, addedAt: new Date().toISOString() });
      showToast("🔒 Tersimpan di playlist pribadi!");
    }
  } else {
    alert("Pilihan tidak valid!"); return;
  }

  saveLocalData(); combineAndRender(); formOverlay.hidden = true;
};

exportBtn.onclick = () => {
  if (localSongs.length === 0) { showToast("Playlist pribadi kosong!"); return; }
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(localSongs));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", "playlist_pribadi.json");
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
        saveLocalData(); combineAndRender(); showToast("✅ Berhasil import!");
      }
    } catch { showToast("❌ File JSON tidak valid!"); }
  };
  reader.readAsText(file);
};

// ── SISTEM DETEKSI DAN TIMEOUT KETIKAN BIAR TIDAK LAG ──
searchInput.oninput = (e) => { 
  searchQuery = e.target.value; 
  clearSearch.hidden = !searchQuery; 
  renderAll(); 

  // Menambahkan sistem "Debounce" agar web tidak lag saat mengetik cepat
  clearTimeout(searchTimeout);
  if (searchQuery.trim().length >= 2) {
    searchTimeout = setTimeout(() => {
      fetchFromExternalServer(searchQuery);
    }, 600); // Menunggu 0.6 detik setelah selesai mengetik, baru server luar ditembak
  } else {
    externalSearchResults = [];
    renderAll();
  }
};

clearSearch.onclick = () => { searchQuery = ''; searchInput.value = ''; clearSearch.hidden = true; externalSearchResults = []; renderAll(); };
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

(async () => { await loadData(); })();
