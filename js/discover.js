/* ═══════════════════════════════════════════════════
   AMZ LIAN — Playlist  ·  discover.js (ADVANCED DISCOVER ENGINE WITH LIVE REFRESH)
═══════════════════════════════════════════════════ */

console.log("⚡ discover.js loaded! Mood Recommendations with Dynamic 4-Grid Collage Engine Active.");

// 1. Kumpulan Kategori Mood / Genre Lengkap dengan Variasi Query Acak
const MOOD_CATEGORIES = [
    { id: 'sleep', label: 'Sleep', queries: ['sleep ambient lo-fi', 'deep sleep rain lofi', 'ambient sleeping music', 'calm sleeping lofi'], color: '#5b73e8' },
    { id: 'sad', label: 'Sad', queries: ['sad acoustic emotional', 'broken heart piano', 'sad indie pop chill', 'crying aesthetic aesthetic'], color: '#5c8099' },
    { id: 'relax', label: 'Relax', queries: ['chill relax acoustic', 'lofi cafe jazz', 'sunset chill pop', 'relaxing guitar acoustic'], color: '#7cb382' },
    { id: 'feelgood', label: 'Feel Good', queries: ['feel good happy pop', 'summer vibes pop', 'upbeat indie dance', 'good mood organic pop'], color: '#e8b85b' },
    { id: 'workout', label: 'Workout', queries: ['workout edm gym', 'running electronic dance', 'fitness techno hardstyle', 'gym motivation electro'], color: '#e85b5b' }
];

window.activeMood = ''; 
window.moodResults = []; 

// 🚀 ENGINE UTAMA: Membuat Gambar Kolase 4 Grid ala YT Music secara Otomatis dari Array Gambar
window.generateCollageUrl = function(covers, callback) {
  // Filter cover yang valid dan buang duplikat/kosong
  const validCovers = [...new Set(covers.filter(c => c && c.trim() !== ''))].slice(0, 4);
  
  if (validCovers.length === 0) {
    callback(typeof COVER_PLACEHOLDER !== 'undefined' ? COVER_PLACEHOLDER : 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=300&auto=format&fit=crop');
    return;
  }
  
  // Jika gambar kurang dari 4, pakai gambar pertama secara utuh full-frame
  if (validCovers.length < 4) {
    callback(validCovers[0]);
    return;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 300;
  canvas.height = 300;
  const ctx = canvas.getContext('2d');
  
  let loadedCount = 0;
  const positions = [
    { x: 0, y: 0 },   // Kiri Atas
    { x: 150, y: 0 }, // Kanan Atas
    { x: 0, y: 150 }, // Kiri Bawah
    { x: 150, y: 150 }// Kanan Bawah
  ];

  validCovers.forEach((src, idx) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = src;
    img.onload = function() {
      ctx.drawImage(img, positions[idx].x, positions[idx].y, 150, 150);
      loadedCount++;
      if (loadedCount === 4) {
        callback(canvas.toDataURL('image/jpeg', 0.8));
      }
    };
    img.onerror = function() {
      // Fallback warna flat jika gambar gagal di-load internet agar grid tidak berlubang bolong
      ctx.fillStyle = '#181d2a';
      ctx.fillRect(positions[idx].x, positions[idx].y, 150, 150);
      loadedCount++;
      if (loadedCount === 4) {
        callback(canvas.toDataURL('image/jpeg', 0.8));
      }
    };
  });
};

// 2. Fungsi Ambil Data Lagu Rekomendasi dari Internet (iTunes API) dengan Sistem Random Query
window.fetchMoodSongs = async function(moodId) {
    const grid = document.querySelector('.songs-grid') || document.getElementById('playlistGrid');
    if(grid) grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:40px; color:var(--accent); font-family:'Space Mono', monospace;">FETCHING FRESH RECOMMENDATIONS...</div>`;

    const moodObj = MOOD_CATEGORIES.find(m => m.id === moodId);
    if (!moodObj) return;

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

    const actionsWrapper = document.createElement('div');
    actionsWrapper.style.cssText = "grid-column: 1 / -1; display: flex; gap: 12px; margin-bottom: 10px; width: 100%; box-sizing: border-box;";

    const backBtn = document.createElement('div');
    backBtn.className = "big-action-card";
    backBtn.style.cssText = "flex: 1; min-height: 90px; border-color: rgba(255,255,255,0.1); margin-bottom: 0;";
    backBtn.innerHTML = `<div class="big-action-title" style="font-size:14px;">Back to Categories</div>`;
    backBtn.onclick = () => { window.activeMood = ''; window.renderAll(); };

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

        item.onclick = (e) => {
            if(e.target.tagName !== 'BUTTON') {
                if(typeof runLivePlayer === 'function') runLivePlayer(song);
            }
        };

        const saveBtn = item.querySelector('.add-mood-btn');
        saveBtn.onclick = (e) => {
            e.stopPropagation();
            if(typeof window.quickAddFromExternal === 'function') {
                window.quickAddFromExternal(song.title, song.artist, song.cover); 
                const tagsInput = document.getElementById('fTags');
                if (tagsInput) { tagsInput.value = ''; }
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

        if (window.activeMood !== '') return;

        grid.innerHTML = ''; 

        const header = document.createElement('div');
        header.style.cssText = "grid-column: 1 / -1; margin-bottom: 5px; margin-top: 5px;";
        header.innerHTML = `<h3 style="font-size: 18px; color: #fff; font-weight:700;">Discover Music Sanctuary</h3><p style="font-size:12px; color:var(--text-dim);">Select an emotional sanctuary to stream instant live track previews.</p>`;
        grid.appendChild(header);

        // Render Kartu Mood Mewah dengan Kolase Gambar Khas YT Music (Mengambil contoh lagu dummy itunes secara instan)
        MOOD_CATEGORIES.forEach(mood => {
            const card = document.createElement('div');
            card.className = "grid-folder-item";
            card.style.cssText = `padding: 14px; display: flex; align-items: center; gap: 16px; cursor: pointer; background: rgba(16, 20, 30, 0.6); border: 1px solid rgba(255,255,255,0.05); border-radius: 14px; width: 100%; box-sizing: border-box; transition: 0.2s;`;
            
            // Set cover loader default kontainer lingkaran murni
            card.innerHTML = `
                <div class="folder-collage-cover" id="collage-${mood.id}" style="width: 65px; height: 65px; border-radius: 8px; overflow: hidden; background: #131720; display:flex; flex-wrap:wrap; flex-shrink: 0; box-shadow: 0 4px 15px rgba(0,0,0,0.4);">
                  <div style="width:100%; height:100%; background:rgba(255,255,255,0.02); display:flex; align-items:center; justify-content:center; color:${mood.color}; font-weight:bold; font-size:12px;">LOAD</div>
                </div>
                <div style="flex:1; min-width:0;">
                    <div style="font-size:15px; color:#fff; font-weight:800; letter-spacing:0.3px;">${mood.label}</div>
                    <div style="font-size:11px; color:#4d5675; margin-top:2px; font-family:'Space Mono',monospace;">Sanctuary Room</div>
                </div>
            `;
            
            card.onclick = () => {
                window.activeMood = mood.id;
                window.fetchMoodSongs(mood.id);
            };
            grid.appendChild(card);

            // Trigger kolase asinkronus mengambil 4 lagu preview teratas di internet agar gambar tidak polos
            fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(mood.queries[0])}&entity=song&limit=4`)
              .then(r => r.json())
              .then(d => {
                 if(d.results && d.results.length >= 4) {
                   const covers = d.results.map(i => i.artworkUrl100.replace('100x100bb', '150x150bb'));
                   window.generateCollageUrl(covers, (imgDataUrl) => {
                     const boxCover = document.getElementById(`collage-${mood.id}`);
                     if(boxCover) boxCover.innerHTML = `<img src="${imgDataUrl}" style="width:100%; height:100%; object-fit:cover;" />`;
                   });
                 } else {
                   // Fallback jika internet lambat, pasang cover placeholder default bawaan web
                   const boxCover = document.getElementById(`collage-${mood.id}`);
                   if(boxCover) boxCover.innerHTML = `<div style="width:100%; height:100%; background:${mood.color}; opacity:0.15; display:flex; align-items:center; justify-content:center; font-weight:900; color:#fff;">AMZ</div>`;
                 }
              }).catch(() => {});
        });
        return; 
    }

    window.activeMood = ''; 
    if (typeof featuresRenderAll === 'function') {
        featuresRenderAll();
    }
};
