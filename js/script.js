const LOCAL_STORAGE_KEY = 'amzLianPlaylist_LocalSongs';
const DEFAULT_DATA_URL = 'data/songs.json';

let officialSongs = []; 
let localSongs = [];    
let songs = [];         
let searchQuery = '';

const playlistGrid = document.getElementById('playlistGrid');
const searchInput = document.getElementById('searchInput');
const addBtn = document.getElementById('addBtn');

// DOM Mini Player
const miniPlayer = document.getElementById('miniPlayer');
const playerCover = document.getElementById('playerCover');
const playerTitle = document.getElementById('playerTitle');
const playerArtist = document.getElementById('playerArtist');
const playerFrameContainer = document.getElementById('playerFrameContainer');
const closePlayer = document.getElementById('closePlayer');

// DOM Form
const formOverlay = document.getElementById('formOverlay');
const formClose = document.getElementById('formClose');
const formSaveBtn = document.getElementById('formSaveBtn');

// ── Load Data ──
async function loadData() {
  try { localSongs = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || []; } catch { localSongs = []; }
  try {
    // Tambahkan '?t=' agar file selalu mengambil yang terbaru dari GitHub
    const res = await fetch(`${DEFAULT_DATA_URL}?t=${new Date().getTime()}`);
    if (res.ok) {
      const data = await res.json();
      officialSongs = data.map(s => ({ ...s, isOfficial: true }));
    }
  } catch (e) { console.warn("Gagal mengambil lagu official.", e); }
  songs = [...officialSongs, ...localSongs];
}

// ── Render Web ──
function renderAll() {
  let list = [...songs];
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    list = list.filter(s => s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q));
  }
  
  playlistGrid.innerHTML = '';
  if (list.length === 0) { document.getElementById('emptyState').hidden = false; return; }
  document.getElementById('emptyState').hidden = true;

  list.forEach(song => {
    const card = document.createElement('article');
    const badgeHtml = song.isOfficial 
      ? `<span style="background:rgba(61, 220, 172, 0.15); color:#3ddcac; padding:2px 6px; border-radius:4px; font-size:10px;">🌐 AMZ LIAN</span>`
      : `<span style="background:rgba(255, 255, 255, 0.1); color:#ccc; padding:2px 6px; border-radius:4px; font-size:10px;">👤 LOKAL (Milikmu)</span>`;

    card.className = 'song-card';
    card.innerHTML = `
      <div class="card-cover-wrap" style="background:#000;">
        <img class="card-cover" src="${song.cover || 'https://via.placeholder.com/150'}" style="object-fit:contain;" />
      </div>
      <div class="card-body">
        <p class="card-title">${song.title}</p>
        <p class="card-artist">${song.artist}</p>
        <div style="margin-bottom: 10px;">${badgeHtml}</div>
        <button class="btn-primary" style="width:100%" onclick="playDirect('${song.id}')">▶ Putar Langsung</button>
      </div>
    `;
    playlistGrid.appendChild(card);
  });
}

// ── Fitur Direct Play (Iframe) ──
window.playDirect = function(id) {
  const song = songs.find(s => s.id === id);
  if (!song) return;

  playerTitle.textContent = song.title;
  playerArtist.textContent = song.artist;
  playerCover.src = song.cover || 'https://via.placeholder.com/150';

  let ytLink = song.links?.youtube || song.links?.youtubeMusic;
  let spotifyLink = song.links?.spotify;
  let embedHtml = `<p style="color:var(--danger)">Link tidak didukung untuk diputar langsung.</p>`;

  // Prioritaskan Spotify karena tampilan barisnya (widget) lebih rapi
  if (spotifyLink && spotifyLink.includes('track/')) {
    const trackId = spotifyLink.split('track/')[1].split('?')[0];
    embedHtml = `<iframe src="https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>`;
  } 
  // Alternatif pakai YouTube (Bisa ambil video ID)
  else if (ytLink) {
    let videoId = "";
    if(ytLink.includes("v=")) videoId = ytLink.split("v=")[1].substring(0,11);
    else if(ytLink.includes("youtu.be/")) videoId = ytLink.split("youtu.be/")[1].substring(0,11);
    
    if(videoId) {
      embedHtml = `<iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
    }
  }

  playerFrameContainer.innerHTML = embedHtml;
  miniPlayer.hidden = false;
};

// Tutup Player
closePlayer.onclick = () => {
  miniPlayer.hidden = true;
  playerFrameContainer.innerHTML = ''; // Hentikan audio
};

// ── Search & Form Modal ──
searchInput.oninput = (e) => { searchQuery = e.target.value; renderAll(); };

addBtn.onclick = () => { formOverlay.hidden = false; };
formClose.onclick = () => { formOverlay.hidden = true; };

formSaveBtn.onclick = () => {
  const title = document.getElementById('fTitle').value;
  const artist = document.getElementById('fArtist').value;
  const cover = document.getElementById('fCover').value;
  const youtube = document.getElementById('fYoutube').value;
  const spotify = document.getElementById('fSpotify').value;

  if (!title || !artist || (!youtube && !spotify)) { alert("Judul, Artis, dan minimal 1 Link wajib diisi!"); return; }

  const newSong = {
    id: `local-${Date.now()}`,
    title, artist, cover,
    links: { youtube, spotify }
  };

  localSongs.unshift(newSong);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localSongs));
  songs = [...officialSongs, ...localSongs];
  
  formOverlay.hidden = true;
  document.querySelectorAll('.form-input').forEach(i => i.value = ''); // Reset form
  renderAll();
};

// ── Inisialisasi ──
loadData().then(renderAll);
