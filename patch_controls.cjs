const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const oldControls = `<div class="media-controls" style="display: flex; gap: 6px; align-items: center; justify-content: center; margin-top: -4px; flex-wrap: wrap;">
          <button class="btn" onclick="prevPlaylist()" title="Previous Playlist (P)" style="padding: 6px 10px; font-size: 0.75rem; border-radius: 50px; font-weight: bold;">[P] Prev Playlist</button>
          <button class="btn" onclick="prevTrack()" title="Previous Track (J)" style="padding: 6px 10px; font-size: 0.75rem; border-radius: 50px; font-weight: bold;">[J] Prev Track</button>
          <button class="btn" onclick="togglePlayMedia()" title="Play / Pause (X)" style="padding: 6px 10px; font-weight: bold; border-radius: 50px; font-size: 0.75rem;">[X] Play/Pause</button>
          <button class="btn" onclick="startMedia()" title="Start Media (L)" style="padding: 6px 10px; font-weight: bold; border-radius: 50px; font-size: 0.75rem;">[L] Load Link</button>
          <button class="btn" onclick="stopMedia()" title="Close Media (C)" style="padding: 6px 10px; font-weight: bold; border-radius: 50px; font-size: 0.75rem;">[C] Close</button>
          <button class="btn" onclick="toggleMuteMedia()" title="Mute / Unmute (V)" style="padding: 6px 10px; font-weight: bold; border-radius: 50px; font-size: 0.75rem;">[V] Mute</button>
          <button class="btn" onclick="nextTrack()" title="Next Track (K)" style="padding: 6px 10px; font-size: 0.75rem; border-radius: 50px; font-weight: bold;">[K] Next Track</button>
          <button class="btn" onclick="nextPlaylist()" title="Next Playlist (N)" style="padding: 6px 10px; font-size: 0.75rem; border-radius: 50px; font-weight: bold;">[N] Next Playlist</button>
        </div>`;

const newControls = `<div class="media-controls" style="display: flex; gap: 8px; align-items: center; justify-content: center; margin-top: 12px; flex-wrap: wrap; background: var(--card); padding: 8px 16px; border-radius: 100px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); margin-left: auto; margin-right: auto; max-width: fit-content; border: 1px solid rgba(128,128,128,0.1);">
  <button class="btn" onclick="prevPlaylist()" title="Previous Playlist (P)" style="padding: 8px; border-radius: 50%; background: transparent; color: var(--text); opacity: 0.7; box-shadow: none;" onmouseover="this.style.opacity='1'; this.style.background='rgba(128,128,128,0.1)'" onmouseout="this.style.opacity='0.7'; this.style.background='transparent'"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="11 17 6 12 11 7"></polyline><polyline points="18 17 13 12 18 7"></polyline></svg></button>
  
  <button class="btn" onclick="prevTrack()" title="Previous Track (J)" style="padding: 8px; border-radius: 50%; background: transparent; color: var(--text); opacity: 0.7; box-shadow: none;" onmouseover="this.style.opacity='1'; this.style.background='rgba(128,128,128,0.1)'" onmouseout="this.style.opacity='0.7'; this.style.background='transparent'"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="19 20 9 12 19 4 19 20"></polygon><line x1="5" y1="19" x2="5" y2="5"></line></svg></button>
  
  <button class="btn" onclick="togglePlayMedia()" title="Play / Pause (X)" style="padding: 10px 24px; border-radius: 100px; background: var(--accent); color: var(--accent-text); font-weight: 700; display: flex; align-items: center; gap: 6px;">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
    Play / Pause
  </button>
  
  <button class="btn" onclick="toggleMuteMedia()" title="Mute / Unmute (V)" style="padding: 8px; border-radius: 50%; background: transparent; color: var(--text); opacity: 0.7; box-shadow: none;" onmouseover="this.style.opacity='1'; this.style.background='rgba(128,128,128,0.1)'" onmouseout="this.style.opacity='0.7'; this.style.background='transparent'"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg></button>
  
  <button class="btn" onclick="nextTrack()" title="Next Track (K)" style="padding: 8px; border-radius: 50%; background: transparent; color: var(--text); opacity: 0.7; box-shadow: none;" onmouseover="this.style.opacity='1'; this.style.background='rgba(128,128,128,0.1)'" onmouseout="this.style.opacity='0.7'; this.style.background='transparent'"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" y1="5" x2="19" y2="19"></line></svg></button>
  
  <button class="btn" onclick="nextPlaylist()" title="Next Playlist (N)" style="padding: 8px; border-radius: 50%; background: transparent; color: var(--text); opacity: 0.7; box-shadow: none;" onmouseover="this.style.opacity='1'; this.style.background='rgba(128,128,128,0.1)'" onmouseout="this.style.opacity='0.7'; this.style.background='transparent'"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="13 17 18 12 13 7"></polyline><polyline points="6 17 11 12 6 7"></polyline></svg></button>
  
  <div style="width: 1px; height: 24px; background: rgba(128,128,128,0.2); margin: 0 4px;"></div>
  
  <button class="btn" onclick="stopMedia()" title="Close Media (C)" style="padding: 8px; border-radius: 50%; background: transparent; color: #ff4444; opacity: 0.8; box-shadow: none;" onmouseover="this.style.opacity='1'; this.style.background='rgba(255,68,68,0.1)'" onmouseout="this.style.opacity='0.8'; this.style.background='transparent'"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg></button>
</div>`;

code = code.replace(oldControls, newControls);

fs.writeFileSync('index.html', code);
