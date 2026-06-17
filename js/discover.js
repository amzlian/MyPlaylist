/* ═══════════════════════════════════════════════════
   AMZ LIAN — Playlist  ·  discover.js (MOOD RECOMMENDATIONS)
═══════════════════════════════════════════════════ */

console.log("⚡ discover.js loaded! Mood Recommendations Active.");

// 1. Kumpulan Kategori Mood / Genre
const MOOD_CATEGORIES = [
    { id: 'sleep', label: '😴 Sleep', query: 'sleep ambient lo-fi', color: '#5b73e8' },
    { id: 'sad', label: '🌧️ Sad', query: 'sad acoustic emotional', color: '#5c8099' },
    { id: 'relax', label: '☕ Relax', query: 'chill relax acoustic', color: '#7cb382' },
    { id: 'feelgood', label: '✨ Feel Good', query: 'feel good happy pop', color: '#e8b85b' },
    { id: 'workout', label: '🔥 Workout', query: 'workout edm gym', color: '#e85b5b' }
];

window.activeMood = ''; 
window.moodResults = []; 

// 2. Fungsi Ambil Data Lagu Rekomendasi dari Internet (iTunes API)
window.fetchMoodSongs = async function(query) {
    const grid = document.querySelector('.songs-grid') || document.getElementById('playlistGrid');
    if(grid) grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:40px; color:var(--accent);">Memuat rekomendasi musik...</div>`;

    try {
        const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=15`);
        const data = await res.json();
        
        window.moodResults = data.results.map(item => ({
            id: `mood-${item.trackId}`,
            title: item.trackName,
            artist: item.artistName,
            cover: item.artworkUrl100 ? item.artworkUrl100.replace('100x100bb', '300x300bb') : '',
            previewUrl: item.previewUrl,
            isExternal: true,
            links: {}
        }));
        renderMoodResults();
    } catch (e) {
        if(grid) grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:40px; color:var(--danger);">Gagal mengambil data. Cek koneksi internet.</div>`;
    }
};

// 3. Render Hasil Lagu Rekomendasi + Tombol Save
window.renderMoodResults = function() {
    const grid = document.querySelector('.songs-grid') || document.getElementById('playlistGrid');
    if(!grid) return;
    grid.innerHTML = '';

    // Tombol Kembali ke Kategori
    const backBtn = document.createElement('div');
    backBtn.className = "big-action-card";
    backBtn.style.cssText = "min-height: 80px; border-color: var(--accent); margin-bottom: 20px; grid-column: 1 / -1;";
    backBtn.innerHTML = `<div class="big-action-title">🔙 Back to Categories</div>`;
    backBtn.onclick = () => { window.activeMood = ''; window.renderAll(); };
    grid.appendChild(backBtn);

    if (window.moodResults.length === 0) {
        grid.innerHTML += `<div style="grid-column:1/-1; text-align:center; padding:20px;">Tidak ada musik ditemukan.</div>`;
        return;
    }

    // Tampilkan List Lagu Preview
    window.moodResults.forEach(song => {
        const item = document.createElement('div');
        item.className = "song-item";
        item.style.cssText = "background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 12px; border-radius: 10px; display: flex; align-items: center; gap: 12px; cursor: pointer; transition: 0.2s;";
        item.innerHTML = `
            <img src="${song.cover}" style="width: 50px; height: 50px; border-radius: 6px; object-fit: cover;" />
            <div style="flex:1; min-width:0;">
                <div style="font-size:13px; color:#fff; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${song.title}</div>
                <div style="font-size:11px; color:#8b93b4; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${song.artist}</div>
            </div>
            <button class="add-mood-btn" style="background:var(--accent); color:#fff; border:none; padding:8px 12px; border-radius:6px; font-size:11px; font-weight:bold; cursor:pointer;">+ SAVE</button>
        `;

        item.onclick = (e) => {
            if(e.target.tagName !== 'BUTTON') {
                runLivePlayer(song); // Mainkan preview lagunya
            }
        };

        const saveBtn = item.querySelector('.add-mood-btn');
        saveBtn.onclick = (e) => {
            e.stopPropagation();
            if(typeof window.quickAddFromExternal === 'function') {
                window.quickAddFromExternal(song.title, song.artist, song.cover); // Panggil modal save form lu
            } else {
                alert("Sistem Save sedang dimuat.");
            }
        };

        grid.appendChild(item);
    });
};

// 4. Integrasi Aman: Menumpang di fungsi renderAll tanpa merusaknya
const featuresRenderAll = window.renderAll;
window.renderAll = function() {
    // ⚡ Jika user klik menu Discover Home, kita bajak tampilannya ke rekomendasi
    if(activeFolder === 'discover') {
        const grid = document.querySelector('.songs-grid') || document.getElementById('playlistGrid');
        if(!grid) return;

        // Jika ada mood yang sedang dibuka, jangan bersihkan grid (biarkan renderMoodResults yang urus)
        if (window.activeMood !== '') return;

        grid.innerHTML = ''; // Bersihkan layar utama

        const header = document.createElement('div');
        header.style.cssText = "grid-column: 1 / -1; margin-bottom: 10px;";
        header.innerHTML = `<h3 style="font-size: 20px; color: #fff;">🌍 Discover Music</h3><p style="font-size:13px; color:var(--text-dim);">Preview tracks and add them to your collection</p>`;
        grid.appendChild(header);

        // Render Kartu Mood
        MOOD_CATEGORIES.forEach(mood => {
            const card = document.createElement('div');
            card.className = "big-action-card";
            card.style.cssText = `border-color: ${mood.color}; background: rgba(255,255,255,0.02); min-height: 140px;`;
            card.innerHTML = `
                <div style="font-size: 32px; margin-bottom: 8px;">${mood.label.split(' ')[0]}</div>
                <div class="big-action-title" style="color:${mood.color};">${mood.label.substring(2)}</div>
            `;
            card.onclick = () => {
                window.activeMood = mood.id;
                window.fetchMoodSongs(mood.query);
            };
            grid.appendChild(card);
        });
        return; // Hentikan render normal disini
    }

    // Jika buka folder lain, matikan mode mood dan jalankan render normal lu
    window.activeMood = ''; 
    if (typeof featuresRenderAll === 'function') {
        featuresRenderAll();
    }
};
