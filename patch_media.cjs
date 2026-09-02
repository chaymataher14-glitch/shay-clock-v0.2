const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

// Replace media-input
const oldMediaInput = `<div class="media-input" style="flex-direction: column;">
          <div style="display: flex; gap: 8px; width: 100%; flex-wrap: wrap;">
            <input type="text" id="m-url" style="flex:1;" placeholder="Paste YouTube link..." onkeydown="if(event.key==='Enter') loadMedia()">
            <button class="btn" onclick="loadMedia()" style="padding: 4px 12px; font-weight: bold;">Load Link</button>
            <button class="btn" onclick="saveMainUrl()" style="padding: 4px 12px; font-weight: bold; background: var(--card); color: var(--text); border: 2px solid var(--accent);">Save Link</button>
            <button class="btn" onclick="openSavedMediaPopup()" style="padding: 4px 12px; font-weight: bold;">Manage Saved Links</button>
            <input type="file" id="m-file" accept="audio/*,video/*" multiple style="display:none;" onchange="handleFileUpload(event)">
            <button class="btn" onclick="document.getElementById('m-file').click()" style="padding: 4px 12px; font-weight: bold; background: var(--accent); color: white;">Upload Files</button>
          </div>
        </div>`;

const newMediaInput = `<div class="media-input" style="flex-direction: column; background: var(--card); padding: 16px; border-radius: 1.5rem; gap: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.05); margin-bottom: 0.5rem;">
          <!-- Top Row: Input & Load -->
          <div style="display: flex; gap: 10px; width: 100%; align-items: center; flex-wrap: wrap;">
            <div style="flex: 1; position: relative; display: flex; align-items: center; min-width: 200px;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="position: absolute; left: 16px; opacity: 0.4; pointer-events: none;"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
              <input type="text" id="m-url" style="width: 100%; text-align: left; padding: 12px 16px 12px 48px; border: none; background: var(--bg); color: var(--text); border-radius: 1rem; outline: none; transition: box-shadow 0.2s;" placeholder="Paste YouTube or media URL..." onfocus="this.style.boxShadow='0 0 0 2px var(--accent)'" onblur="this.style.boxShadow='none'" onkeydown="if(event.key==='Enter') loadMedia()">
            </div>
            <button class="btn" onclick="loadMedia()" style="padding: 12px 24px; font-weight: 700; border-radius: 1rem; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">Load & Save</button>
          </div>
          <!-- Bottom Row: Library & Local Files -->
          <div style="display: flex; gap: 10px; width: 100%; flex-wrap: wrap; justify-content: space-between; align-items: center;">
            <div style="display: flex; gap: 10px;">
              <input type="file" id="m-file" accept="audio/*,video/*" multiple style="display:none;" onchange="handleFileUpload(event)">
              <button class="btn" onclick="document.getElementById('m-file').click()" style="padding: 8px 16px; font-weight: 600; font-size: 0.85rem; background: var(--bg); color: var(--text); border: 1px solid rgba(128,128,128,0.2); border-radius: 1rem; transition: background 0.2s; box-shadow: none;" onmouseover="this.style.background='var(--card)'" onmouseout="this.style.background='var(--bg)'">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px; vertical-align: text-bottom;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                Upload Local Files
              </button>
            </div>
            <button class="btn" onclick="openSavedMediaPopup()" style="padding: 8px 16px; font-weight: 600; font-size: 0.85rem; background: var(--bg); color: var(--text); border: 1px solid rgba(128,128,128,0.2); border-radius: 1rem; transition: background 0.2s; box-shadow: none;" onmouseover="this.style.background='var(--card)'" onmouseout="this.style.background='var(--bg)'">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px; vertical-align: text-bottom;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
              Manage Library
            </button>
          </div>
        </div>`;

code = code.replace(oldMediaInput, newMediaInput);

// Replace renderPlaylist function completely
const renderPlaylistRegex = /function renderPlaylist\(\) \{[\s\S]*?container\.appendChild\(btn\);\n    \}\);\n  \}/;

const newRenderPlaylist = `function renderPlaylist() {
    const container = document.getElementById('playlist-container');
    container.innerHTML = '';
    
    savedPlaylists.forEach((item, index) => {
      const btn = document.createElement('button');
      const isActive = (document.getElementById('m-url').value === item.url || index === currentPlaylistIndex);
      btn.className = 'btn ' + (isActive ? 'active' : '');
      btn.style.cssText = "padding: 8px 16px; font-size: 0.85rem; font-weight: 600; white-space: nowrap; max-width: 180px; overflow: hidden; text-overflow: ellipsis; border-radius: 20px; flex-shrink: 0; display: flex; align-items: center; gap: 6px; transition: all 0.2s ease; border: 1px solid transparent; box-shadow: none;";
      
      let iconSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>';
      if (item.url.includes('youtube.com') || item.url.includes('youtu.be')) {
        iconSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>';
      }
      
      if (isActive) {
         btn.style.background = 'var(--accent)';
         btn.style.color = 'var(--accent-text)';
         btn.style.boxShadow = '0 4px 10px rgba(0,0,0,0.15)';
      } else {
         btn.style.background = 'var(--card)';
         btn.style.color = 'var(--text)';
         btn.style.border = '1px solid rgba(128,128,128,0.2)';
         btn.style.opacity = '0.7';
         btn.onmouseover = () => { btn.style.opacity = '1'; btn.style.borderColor = 'var(--accent)'; };
         btn.onmouseout = () => { btn.style.opacity = '0.7'; btn.style.borderColor = 'rgba(128,128,128,0.2)'; };
      }
      
      btn.innerHTML = \`\${iconSvg} <span>\${item.name || 'Link '+(index+1)}</span>\`;
      btn.onclick = () => {
         currentPlaylistIndex = index;
         document.getElementById('m-url').value = item.url;
         loadMedia();
      };
      container.appendChild(btn);
    });
    
    mediaFiles.forEach((file, index) => {
      const btn = document.createElement('button');
      btn.className = \`btn \${index === currentMediaIndex ? 'active' : ''}\`;
      btn.style.cssText = "padding: 8px 16px; font-size: 0.85rem; font-weight: 600; white-space: nowrap; max-width: 180px; overflow: hidden; text-overflow: ellipsis; border-radius: 20px; flex-shrink: 0; display: flex; align-items: center; gap: 6px; transition: all 0.2s ease; border: 1px solid transparent; box-shadow: none;";
      
      let iconSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><circle cx="10" cy="13" r="2"></circle><line x1="10" y1="13" x2="10" y2="18"></line><line x1="10" y1="18" x2="14" y2="15"></line></svg>';
      
      if (index === currentMediaIndex) {
         btn.style.background = 'var(--accent)';
         btn.style.color = 'var(--accent-text)';
         btn.style.boxShadow = '0 4px 10px rgba(0,0,0,0.15)';
      } else {
         btn.style.background = 'var(--card)';
         btn.style.color = 'var(--text)';
         btn.style.border = '1px solid rgba(128,128,128,0.2)';
         btn.style.opacity = '0.7';
         btn.onmouseover = () => { btn.style.opacity = '1'; btn.style.borderColor = 'var(--accent)'; };
         btn.onmouseout = () => { btn.style.opacity = '0.7'; btn.style.borderColor = 'rgba(128,128,128,0.2)'; };
      }
      btn.innerHTML = \`\${iconSvg} <span>\${file.name}</span>\`;
      btn.onclick = () => playLocalMedia(index);
      container.appendChild(btn);
    });
  }`;

code = code.replace(renderPlaylistRegex, newRenderPlaylist);

// Also change the playlist-container styling to have padding & margin
code = code.replace(
  'id="playlist-container" style="display:flex; gap: 8px; overflow-x: auto; overflow-y: hidden; padding: 10px 4px; margin-top: 0.5rem; align-items: center;"',
  'id="playlist-container" style="display:flex; gap: 10px; overflow-x: auto; overflow-y: hidden; padding: 12px 4px; margin-top: 0.5rem; align-items: center;"'
);

fs.writeFileSync('index.html', code);
