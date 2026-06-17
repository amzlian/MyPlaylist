/* ═══════════════════════════════════════════════════
   AMZ LIAN — Playlist  ·  discover.js (ADVANCED DISCOVER ENGINE WITH REFRESH)
═══════════════════════════════════════════════════ */

console.log("⚡ discover.js loaded! Mood Recommendations with Live Refresh Engine Active.");

// 1. Kumpulan Kategori Mood / Genre Lengkap dengan Variasi Query Acak
const MOOD_CATEGORIES = [
    { id: 'sleep', label: '😴 Sleep', queries: ['sleep ambient lo-fi', 'deep sleep rain lofi', 'ambient sleeping music', 'calm sleeping lofi'], color: '#5b73e8' },
    { id: 'sad', label: '🌧️ Sad', queries: ['sad acoustic emotional', 'broken heart piano', 'sad indie pop chill', 'crying aesthetic aesthetic'], color: '#5c8099' },
    { id: 'relax', label: '☕ Relax', queries: ['chill relax acoustic', 'lofi cafe jazz', 'sunset chill pop', 'relaxing guitar acoustic'], color: '#7cb382' },
    { id: 'feelgood', label: '✨ Feel Good', queries: ['feel good happy pop', 'summer vibes pop', 'upbeat indie dance', 'good mood organic pop'], color: '#e8b85b' },
    { id: 'workout', label: '🔥 Workout', queries: ['workout edm gym', 'running electronic dance', 'fitness techno hardstyle', 'gym motivation electro'], color: '#e85b5b' }
];

window.activeMood = ''; 
window.moodResults = []; 

// 2. Fungsi Ambil Data Lagu Rekomendasi dari Internet (iTunes API) dengan Sistem Random Query
window.fetchMoodSongs = async function(moodId) {
    const grid = document.querySelector('.songs-grid') || document.getElementById('playlistGrid');
    if(grid) grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:40px; color:var(--accent); font-family:'Space Mono', monospace;">FETCHING FRESH RECOMMENDATIONS...</div>`;

    const moodObj = MOOD_CATEGORIES.find(m => m.id === moodId);
    if (!moodObj) return;

    // Ambil query secara acak dari list variasi biar lagu yang ditarik selalu berganti-ganti (Refresh Engine)
    const randomQuery = moodObj.queries[Math.floor(Math.random() * moodObj.queries.length)];

    try {
        const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(randomQuery)}&entity=song&limit=16`);
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
        if(grid) grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:40px; color:var(--danger); font-family:'Space Mono', monospace;">FAILED TO INTERNET FETCH. CHECK CONNECTION.</div>`;
    }
};

// 3. Render Hasil Lagu Rekomendasi + Tombol Refresh & Save Target Lock
window.renderMoodResults = function() {
    const grid = document.querySelector('.songs-grid') || document.getElementById('playlistGrid');
    if(!grid) return;
    grid.innerHTML = '';

    const currentMoodObj = MOOD_CATEGORIES.find(m => m.id === window.activeMood);
    const moodColor = currentMoodObj ? currentMoodObj.color : 'var(--accent)';

    // Container Header Aksi di dalam Konten Grid
    const actionsWrapper = document.createElement('div');
    actionsWrapper.style.cssText = "grid-column: 1 / -1; display: flex; gap: 12px; margin-bottom: 10px; width: 100%; box-sizing: border-box;";

    // A. Tombol Kembali ke Kategori
    const backBtn = document.createElement('div');
    backBtn.className = "big-action-card";
    backBtn.style.cssText = "flex: 1; min-height: 90px; border-color: rgba(255,255,255,0.1); margin-bottom: 0;";
    backBtn.innerHTML = `<div class="big-action-title" style="font-size:14px;">Back to Categories</div>`;
    backBtn.onclick = () => { window.activeMood = ''; window.renderAll(); };

    // B. Tombol REFRESH MUSIK (Ganti Lagu Baru Tanpa Monoton)
    const refreshBtn = document.createElement('div');
    refreshBtn.className = "big-action-card";
    refreshBtn.style.cssText = `flex: 1; min-height: 90px; border-color: ${moodColor}; background: rgba(255,255,255,0.01); margin-bottom: 0;`;
    refreshBtn.innerHTML = `<div class="big-action-title" style="font-size:14px; color:${moodColor};">🔄 Refresh Tracks</div>`;
    refreshBtn.onclick = () => { window.fetchMoodSongs(window.activeMood); };

    actionsWrapper.appendChild(backBtn);
    actionsWrapper.appendChild(refreshBtn);
    grid.appendChild(actionsWrapper);

    if (window.moodResults.length === 0) {
        const noData = document.createElement('div');
        noData.style.cssText = "grid-column:1/-1; text-align:center; padding:30px; color:var(--text-dim); font-style:italic;";
        noData.textContent = "No data found for this query.";
        grid.appendChild(noData);
        return;
    }

    // Tampilkan List Lagu Preview Hasil Acakan Refresh Engine
    window.moodResults.forEach(song => {
        const item = document.createElement('div');
        item.className = "song-item";
        item.style.cssText = "background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); padding: 12px; border-radius: 10px; display: flex; align-items: center; gap: 12px; cursor: pointer; transition: 0.2s; width: 100%; box-sizing: border-box;";
        item.innerHTML = `
            <img src="${song.cover || COVER_PLACEHOLDER}" style="width: 50px; height: 50px; border-radius: 6px; object-fit: cover;" />
            <div style="flex:1; min-width:0;">
                <div style="font-size:13px; color:#fff; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${song.title}</div>
                <div style="font-size:11px; color:#8b93b4; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${song.artist}</div>
            </div>
            <button class="add-mood-btn" style="background:var(--accent); color:#fff; border:none; padding:8px 14px; border-radius:6px; font-size:11px; font-weight:bold; cursor:pointer; font-family:'Space Grotesk',sans-serif; text-transform:uppercase;">Save</button>
        `;

        // Klik area baris untuk memutar preview lagu resmi
        item.onclick = (e) => {
            if(e.target.tagName !== 'BUTTON') {
                if(typeof runLivePlayer === 'function') runLivePlayer(song);
            }
        };

        // 🎯 TARGET LOCK JALUR AMAN: Klik tombol Save langsung melempar data ke Random Music
        const saveBtn = item.querySelector('.add-mood-btn');
        saveBtn.onclick = (e) => {
            e.stopPropagation();
            if(typeof window.quickAddFromExternal === 'function') {
                window.quickAddFromExternal(song.title, song.artist, song.cover); 
                
                // FORCE OVERRIDE: Paksa kosongkan kolom tag agar lagu otomatis tersimpan ke barisan utama Random Music!
                const tagsInput = document.getElementById('fTags');
                if (tagsInput) {
                    tagsInput.value = ''; // Kosong tanpa tag folder, otomatis masuk Random Music terdepan!
                }
            }
        };

        grid.appendChild(item);
    });
};

// 4. Integrasi Aman: Menumpang di fungsi renderAll tanpa merusak file features.js lu
const featuresRenderAll = window.renderAll;
window.renderAll = function() {
    if(activeFolder === 'discover') {
        const grid = document.getElementById('playlistGrid');
        if(!grid) return;

        // Jika user sedang membuka detail isi mood, serahkan kendali penuh ke renderMoodResults
        if (window.activeMood !== '') return;

        grid.innerHTML = ''; // Sapu bersih layar utama

        const header = document.createElement('div');
        header.style.cssText = "grid-column: 1 / -1; margin-bottom: 5px; margin-top: 5px;";
        header.innerHTML = `<h3 style="font-size: 18px; color: #fff; font-weight:700;">Discover Music Sanctuary</h3><p style="font-size:12px; color:var(--text-dim);">Select an emotional sanctuary to stream instant live track previews.</p>`;
        grid.appendChild(header);

        // Render Kartu Mood Besar Mewah Bersih Tanpa Emoticon
        MOOD_CATEGORIES.forEach(mood => {
            const card = document.createElement('div');
            card.className = "big-action-card";
            card.style.cssText = `border-color: ${mood.color}; background: rgba(255,255,255,0.01); min-height: 130px;`;
            card.innerHTML = `
                <div class="big-action-title" style="color:${mood.color}; font-size:16px; font-weight:800; letter-spacing:0.5px;">${mood.label.substring(2)}</div>
                <div style="font-size:11px; color:#4d5675; margin-top:4px; text-transform:lowercase; font-family:'Space Mono',monospace;">mood selection theme</div>
            `;
            card.onclick = () => {
                window.activeMood = mood.id;
                window.fetchMoodSongs(mood.id);
            };
            grid.appendChild(card);
        });
        return; // Hentikan render bawaan script.js biar lagu lama dilarang bocor keluar
    }

    window.activeMood = ''; 
    if (typeof featuresRenderAll === 'function') {
        featuresRenderAll();
    }
};
