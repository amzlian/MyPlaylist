/* ═══════════════════════════════════════════════════
   AMZ LIAN — hub.js (MAIN UNIVERSE HUB & LOADING ENGINE)
═══════════════════════════════════════════════════ */

console.log("⚡ hub.js loaded! Universe Hub & Loading Screen Interceptor Active.");

// 1. ENGINE ANTI-BOCOR: Sembunyikan elemen utama web sedini mungkin agar tidak tampil saat loading
const hideMainUI = () => {
    const header = document.querySelector('.site-header');
    const main = document.querySelector('main') || document.querySelector('.main-content');
    const player = document.getElementById('miniPlayer');
    if(header) header.style.display = 'none';
    if(main) main.style.display = 'none';
    if(player && !player.hidden) player.style.display = 'none';
};

const showMainUI = () => {
    const header = document.querySelector('.site-header');
    const main = document.querySelector('main') || document.querySelector('.main-content');
    const player = document.getElementById('miniPlayer');
    if(header) header.style.display = '';
    if(main) main.style.display = '';
    if(player && !player.hidden) player.style.display = 'flex';
};

// Eksekusi kunci secepat mungkin saat HTML dibaca
document.addEventListener("DOMContentLoaded", hideMainUI);
hideMainUI(); // Panggilan instan cadangan

// 2. KITA BAJAK FUNGSI SPLASH SCREEN ASLI
const originalDismissSplash = window.dismissSplash;

window.dismissSplash = function() {
    const splash = document.getElementById('splashScreen');
    if(splash) {
        splash.style.opacity = '0';
        setTimeout(() => { 
            splash.style.display = 'none'; 
            showUniverseHub();
        }, 800);
    } else {
        showUniverseHub();
    }
};

// Fungsi global untuk dipakai tombol "Universe" di features.js
window.returnToHub = function() {
    hideMainUI();
    showUniverseHub();
};

// 3. FUNGSI UNTUK MENAMPILKAN HALAMAN PILIHAN (HUB SCREEN)
function showUniverseHub() {
    const oldHub = document.getElementById('amz-hub-screen');
    if(oldHub) oldHub.remove();

    const hubOverlay = document.createElement('div');
    hubOverlay.id = 'amz-hub-screen';
    hubOverlay.style.cssText = "position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: #0c0e14; z-index: 9999999; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; box-sizing: border-box; font-family: 'Space Grotesk', sans-serif; opacity: 0; transition: opacity 0.8s ease;";
    
    hubOverlay.innerHTML = `
        <div style="font-family: 'Space Mono', monospace; font-size: 28px; font-weight: 900; color: #fff; margin-bottom: 50px; letter-spacing: -1px; text-shadow: 0 0 15px rgba(255,255,255,0.2);">
            AMZ<span style="color:var(--accent-2, #00ffcc);">UNIVERSE</span>
        </div>
        
        <div style="display: flex; flex-direction: column; gap: 16px; width: 100%; max-width: 450px;">
            <button id="btnHubPlaylist" style="background: rgba(255,255,255,0.03); border: 1px solid var(--accent, #7c6af7); color: #fff; padding: 20px; border-radius: 12px; font-size: 15px; font-weight: 700; cursor: pointer; transition: all 0.3s ease; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 0 20px rgba(124, 106, 247, 0.2); position: relative; overflow: hidden;">
                Enter to see playlist music
            </button>
            <button style="background: rgba(255,255,255,0.01); border: 1px dashed rgba(255,255,255,0.15); color: #4d5675; padding: 20px; border-radius: 12px; font-size: 13px; font-weight: 600; cursor: not-allowed; text-transform: uppercase; letter-spacing: 1px;">
                Enter to see my favorite game.. soon
            </button>
            <button style="background: rgba(255,255,255,0.01); border: 1px dashed rgba(255,255,255,0.15); color: #4d5675; padding: 20px; border-radius: 12px; font-size: 13px; font-weight: 600; cursor: not-allowed; text-transform: uppercase; letter-spacing: 1px;">
                Enter to my life.. just kidding ✌🏻🙂‍↕️
            </button>
        </div>
        
        <style>
            #btnHubPlaylist:hover { background: rgba(255,255,255,0.08) !important; transform: translateY(-3px); box-shadow: 0 10px 30px rgba(124, 106, 247, 0.4) !important; }
            #btnHubPlaylist:active { transform: scale(0.97); }
        </style>
    `;
    
    document.body.appendChild(hubOverlay);
    setTimeout(() => { hubOverlay.style.opacity = '1'; }, 50);

    // Tandai History Hub agar Back Button tahu kita ada di sini
    history.pushState({ page: 'hub' }, '');

    document.getElementById('btnHubPlaylist').onclick = () => {
        hubOverlay.style.opacity = '0';
        setTimeout(() => {
            hubOverlay.remove();
            showPlaylistLoadingScreen();
        }, 800);
    };
}

// 4. FUNGSI UNTUK MENAMPILKAN LOADING SCREEN TRANSISI
function showPlaylistLoadingScreen() {
    const loadOverlay = document.createElement('div');
    loadOverlay.id = 'amz-loading-screen';
    loadOverlay.style.cssText = "position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: #0c0e14; z-index: 9999999; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; box-sizing: border-box; text-align: center; opacity: 0; transition: opacity 0.8s ease;";
    
    loadOverlay.innerHTML = `
        <div style="width: 45px; height: 45px; border: 3px solid rgba(255,255,255,0.05); border-top-color: var(--accent-2, #00ffcc); border-radius: 50%; animation: hubSpin 1s cubic-bezier(0.5, 0, 0.5, 1) infinite; margin-bottom: 35px;"></div>
        <p style="font-family: 'Space Mono', monospace; font-size: 15px; color: #8b93b4; max-width: 550px; line-height: 1.8; letter-spacing: 0.5px;">
            "This is just for fun, music is only a 30-second preview.<br>Enjoy and build your own playlist."
        </p>
        <style>
            @keyframes hubSpin { 
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    `;
    
    document.body.appendChild(loadOverlay);
    setTimeout(() => { loadOverlay.style.opacity = '1'; }, 50);

    // Timer Loading 4 detik sebelum melepas Web Utama
    setTimeout(() => {
        loadOverlay.style.opacity = '0';
        setTimeout(() => {
            loadOverlay.remove();
            
            // BUKA BLOKIR UI! Tampilkan Web Utama sekarang!
            showMainUI(); 
            if(typeof window.renderAll === 'function') window.renderAll();
            
            // Catat history masuk ke Home Playlist
            history.pushState({ page: 'playlist_home' }, '');
            
        }, 800);
    }, 4000); 
}
