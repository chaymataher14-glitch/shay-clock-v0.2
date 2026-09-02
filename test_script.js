  // UI Sync Trigger - Initialization
  window.__pipWindow = null;
  let savedPlaylists = [
    { url: "https://www.youtube.com/watch?v=jfKfPfyJRdk", name: "Lofi Girl" },
    { url: "https://www.youtube.com/watch?v=4xDzrXgR73I", name: "Synthwave" },
    { url: "https://www.youtube.com/watch?v=lTRiuFIWV54", name: "Chillhop" },
    { url: "https://www.youtube.com/watch?v=tfBVp0Zi2iE", name: "Classical" },
    { url: "https://www.youtube.com/watch?v=qH3fOUNDhOU", name: "Nature Sounds" },
    { url: "https://www.youtube.com/watch?v=MVPTGNGiI-4", name: "Rain sounds" }
  ];
  let currentPlaylistIndex = 0;
  let isYtPlaying = false;
  window.ytPlaylistIndex = -1;
  window.ytPlaylistLength = 0;
  let isYtMuted = false;
  
  window.addEventListener('message', (event) => {
    if (event.origin !== 'https://www.youtube.com') return;
    try {
        const data = JSON.parse(event.data);
        if (data.event === 'infoDelivery' && data.info) {
            if (data.info.playlistIndex !== undefined) window.ytPlaylistIndex = data.info.playlistIndex;
            if (data.info.playlist !== undefined) {
                window.ytPlaylistLength = data.info.playlist.length;
                if (window.playLastYtTrackOnLoad && window.ytPlaylistLength > 1) {
                    window.playLastYtTrackOnLoad = false;
                    let target = window.ytPlaylistLength - 1;
                    if (window.ytPlaylistIndex !== target) {
                        event.source.postMessage(JSON.stringify({event: 'command', func: 'playVideoAt', args: [target]}), '*');
                    }
                }
            }
            
            if (data.info.playerState !== undefined) {
                isYtPlaying = (data.info.playerState === 1 || data.info.playerState === 3);
                if (data.info.muted !== undefined) isYtMuted = data.info.muted;
                if (data.info.playerState === 0) {
                    // Video ended
                    if (window.ytPlaylistLength > 1) {
                        if (window.ytPlaylistIndex >= window.ytPlaylistLength - 1) {
                            nextPlaylist(); // Reached end of YT playlist, spill over to next Macro item
                        }
                    } else {
                        nextPlaylist(); // Single video ended, spill over
                    }
                }
            }
        }
        if (data.event === 'initialDelivery') {
            if (data.info.muted !== undefined) isYtMuted = data.info.muted;
        }
    } catch (e) {}
  });

  
  const _getElementById = document.getElementById.bind(document);
  document.getElementById = function(id) {
    let el = _getElementById(id);
    if (!el && window.__pipWindow) el = window.__pipWindow.document.getElementById(id);
    return el;
  };
  
  const _querySelector = document.querySelector.bind(document);
  document.querySelector = function(sel) {
    let el = _querySelector(sel);
    if (!el && window.__pipWindow) el = window.__pipWindow.document.querySelector(sel);
    return el;
  };
  
  const _querySelectorAll = document.querySelectorAll.bind(document);
  document.querySelectorAll = function(sel) {
    let els = _querySelectorAll(sel);
    if (els.length === 0 && window.__pipWindow) els = window.__pipWindow.document.querySelectorAll(sel);
    return els;
  };

    const _raf = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = function(cb) {
    if (window.__pipWindow) return window.__pipWindow.requestAnimationFrame(cb);
    return _raf(cb);
  };
  const _caf = window.cancelAnimationFrame.bind(window);
  window.cancelAnimationFrame = function(id) {
    if (window.__pipWindow) return window.__pipWindow.cancelAnimationFrame(id);
    return _caf(id);
  };

  window.__docListeners = [];
  const _addEventListener = document.addEventListener.bind(document);
  document.addEventListener = function(type, listener, options) {
    window.__docListeners.push({type, listener, options});
    return _addEventListener(type, listener, options);
  };

  async function openPip() {
    let isIframe = false;
    try {
      isIframe = window.self !== window.top;
    } catch(e) {
      isIframe = true;
    }
    
    if (isIframe) {
        showToast('Opening in a new window (PiP requires top-level window)...');
        window.open(window.location.href, '_blank', 'width=450,height=600');
        return;
    }
    
    if (!('documentPictureInPicture' in window)) {
      showToast('Picture-in-Picture is not supported in this browser. Try Chrome/Edge.');
      return;
    }
    try {
      const widget = document.getElementById('mainWidget');
      const pipWindow = await documentPictureInPicture.requestWindow({ disallowReturnToOpener: true,
        width: 450,
        height: 600,
      });

      window.__pipWindow = pipWindow;
      // Move widget to pip
      const player = document.getElementById('player');
      const playerContainer = player ? player.parentElement : null;
      const playerSrc = player ? player.src : '';
      if (player) player.remove();
      
      pipWindow.document.body.appendChild(widget);
      
      if (playerSrc && playerContainer) {
         setTimeout(() => {
             const newPlayer = pipWindow.document.createElement('iframe');
             newPlayer.id = 'player';
             newPlayer.title = 'YouTube player';
             newPlayer.allow = 'autoplay; encrypted-media; picture-in-picture';
             newPlayer.allowFullscreen = true;
             newPlayer.style.position = 'absolute';
             newPlayer.style.width = '100%';
             newPlayer.style.height = '100%';
             newPlayer.style.border = 'none';
             newPlayer.src = playerSrc;
             playerContainer.appendChild(newPlayer);
         }, 50);
      }
      
      // Copy event listeners
      window.__docListeners.forEach(({type, listener, options}) => {
        pipWindow.document.addEventListener(type, listener, options);
      });
      
      pipWindow.addEventListener('resize', () => {
         if (window.schedule) window.schedule();
      });

      // Copy styles
      [...document.styleSheets].forEach((styleSheet) => {
        try {
          const cssRules = [...styleSheet.cssRules].map((rule) => rule.cssText).join('');
          const style = document.createElement('style');
          style.textContent = cssRules;
          pipWindow.document.head.appendChild(style);
        } catch (e) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.type = styleSheet.type;
          link.media = styleSheet.media;
          link.href = styleSheet.href;
          pipWindow.document.head.appendChild(link);
        }
      });
      
      const pipStyle = pipWindow.document.createElement('style');
      pipStyle.textContent = `
        body { margin: 0; padding: 0; width: 100vw; height: 100vh; overflow: hidden; background: var(--bg, #FDF9F3); color: var(--text, #7A6F68); }
        .widget { width: 100% !important; height: 100% !important; max-width: none !important; border-radius: 0 !important; box-shadow: none !important; }
      `;
      pipWindow.document.head.appendChild(pipStyle);
      
      const meta = pipWindow.document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = widget.style.getPropertyValue('--bg') || '#FDF9F3';
      pipWindow.document.head.appendChild(meta);
      pipWindow.document.title = "Widget";

      // Copy CSS variables from widget to pip window body
      pipWindow.document.body.style.cssText = widget.style.cssText;

      
      const side = pipWindow.document.getElementById('sidebar');
      if (side && side.classList.contains('open')) {
        side.classList.remove('open');
      }

      pipWindow.addEventListener("pagehide", (event) => {
        // bring it back
        const p = pipWindow.document.getElementById('player');
        const pContainer = p ? p.parentElement : null;
        const pSrc = p ? p.src : '';
        if (p) p.remove();

        window.__pipWindow = null;
        document.body.appendChild(widget);

        if (pSrc && pContainer) {
           setTimeout(() => {
             const newPlayer = document.createElement('iframe');
             newPlayer.id = 'player';
             newPlayer.title = 'YouTube player';
             newPlayer.allow = 'autoplay; encrypted-media; picture-in-picture';
             newPlayer.allowFullscreen = true;
             newPlayer.style.position = 'absolute';
             newPlayer.style.width = '100%';
             newPlayer.style.height = '100%';
             newPlayer.style.border = 'none';
             newPlayer.src = pSrc;
             pContainer.appendChild(newPlayer);
           }, 50);
        }
      });
    } catch (e) {
      console.error(e);
      showToast('Failed to open PiP window. It must be triggered by a user action.');
    }
  }

  // Per-instance scoping so multiple embeds of this URL don't clobber each other,
  // and each iframe reloads into the exact state it was left in.
  //
  // Resolution order (first non-empty wins):
  //   1. ?id=<name> / ?instance=<name> on the iframe src (explicit override)
  //   2. window.name — persists across reloads of THIS iframe and is unique
  //      per frame (unlike sessionStorage, which is shared by same-origin
  //      frames in the same tab). If empty we mint one and write it back so
  //      the same iframe keeps the same id forever.
  //   3. "default" when opened as a top-level page with no id.
  const widget = document.getElementById('mainWidget');
  const INSTANCE_ID = (() => {
    const clean = s => (s || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40);
    try {
      const q = new URLSearchParams(location.search);
      const fromQuery = clean(q.get('id') || q.get('instance') || q.get('name'));
      if (fromQuery) return fromQuery;
    } catch {}
    
    // Check if the embedder provided a useful window.name
    try {
      const fromName = clean(window.name);
      if (fromName && fromName !== 'iframe' && fromName !== 'default') return fromName;
    } catch {}

    const inIframe = (() => { try { return window.self !== window.top; } catch { return true; } })();
    if (!inIframe) return 'default';

    // We are in an iframe. Use a robust slot claiming system!
    try {
      const slotKey = 'pf_slots_registry';
      
      // We block synchronously here, but JS is single threaded.
      // However, iframes in different processes might race.
      // A unique ID is safer for independence but breaks reloads without ?id.
      // We'll stick to slots but use a random ID if it fails.
      let registry = JSON.parse(localStorage.getItem(slotKey) || '[]');
      const now = Date.now();
      
      registry = registry.filter(s => now - s.time < 3000);
      
      let mySlot = 1;
      while (registry.some(s => s.id === mySlot)) {
        mySlot++;
      }
      
      const myEntry = { id: mySlot, time: Date.now() };
      registry.push(myEntry);
      localStorage.setItem(slotKey, JSON.stringify(registry));
      
      // heartbeat
      setInterval(() => {
        try {
          let reg = JSON.parse(localStorage.getItem(slotKey) || '[]');
          const me = reg.find(s => s.id === mySlot);
          if (me) {
            me.time = Date.now();
          } else {
            reg.push({ id: mySlot, time: Date.now() });
          }
          localStorage.setItem(slotKey, JSON.stringify(reg));
        } catch {}
      }, 1000);

      window.addEventListener('beforeunload', () => {
        try {
          let reg = JSON.parse(localStorage.getItem(slotKey) || '[]');
          reg = reg.filter(s => s.id !== mySlot);
          localStorage.setItem(slotKey, JSON.stringify(reg));
        } catch {}
      });

      const slotName = 'pf_frame_' + mySlot;
      try { window.name = slotName; } catch {}
      return slotName;
    } catch(e) {}

    return 'default';
  })();

  const STORAGE_KEY = 'pastelFocusSettingsV4:' + INSTANCE_ID;
  const LEGACY_KEYS = ['pastelFocusSettingsV4', 'pastelFocusSettingsV3', 'pastelFocusSettings'];

  try {
    const urlState = new URLSearchParams(location.search).get('state');
    if (urlState) {
       if (!localStorage.getItem(STORAGE_KEY + '_seeded')) {
           const decoded = decodeURIComponent(atob(urlState));
           localStorage.setItem(STORAGE_KEY, decoded);
           localStorage.setItem(STORAGE_KEY + '_seeded', 'true');
       }
    }
  } catch(e) {}

  // Route CSS variable writes to the widget root, not <html>, so themes stay local.
  const cssRoot = { style: { setProperty: (k, v) => widget.style.setProperty(k, v) } };
  // --- CLOCK AND POMODORO CORE RE-INJECTED ---
  let pMode = 'work';
  let pTimeLeft = 25 * 60;
  let pPhaseDuration = 25 * 60;
  let sessionsCompleted = 0;
  let pIsRunning = false;
  let pomoTimer = null;
  let pomoFlipMode = false;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  let sharedAudioCtx = null;
  function getAudioContext() {
    if (!sharedAudioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      sharedAudioCtx = new AudioContext();
    }
    if (sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume();
    }
    return sharedAudioCtx;
  }
  
  function playChime() {
    const volEl = document.getElementById('volume');
    const vol = volEl ? volEl.value / 100 : 0.5;
    if (vol <= 0) return;
    try {
      const ctx = getAudioContext();
      
      const playBeep = (startTime, freq, duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        
        const osc2 = ctx.createOscillator();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(freq * 1.01, startTime); // slight detune
        osc2.connect(gain);
        
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(vol, startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        
        osc.start(startTime);
        osc.stop(startTime + duration);
        osc2.start(startTime);
        osc2.stop(startTime + duration);
      };

      const now = ctx.currentTime;
      // Play a clear, bright attention sequence lasting ~2.5 seconds
      playBeep(now, 880, 0.5);      // A5
      playBeep(now + 0.3, 880, 0.5); 
      playBeep(now + 0.6, 1108.73, 0.5); // C#6
      playBeep(now + 0.9, 1108.73, 0.5);
      playBeep(now + 1.2, 1318.51, 1.5); // E6 long
    } catch (e) {
      console.error('Audio playback failed', e);
    }
  }

  function createFlip(id) {
    const el = document.getElementById(id);
    if (!el) return null;
    el.innerHTML = '';
    const bgTop = document.createElement('div');
    bgTop.className = 'leaf-bg leaf-bg-top';
    const bgBottom = document.createElement('div');
    bgBottom.className = 'leaf-bg leaf-bg-bottom';
    const glyphTop = document.createElement('div');
    glyphTop.className = 'glyph glyph-top';
    const glyphBottom = document.createElement('div');
    glyphBottom.className = 'glyph glyph-bottom';
    const flapTop = document.createElement('div');
    flapTop.className = 'flap flap-top';
    const flapBottom = document.createElement('div');
    flapBottom.className = 'flap flap-bottom';
    const hinge = document.createElement('div');
    hinge.className = 'hinge';
    el.appendChild(bgTop);
    el.appendChild(bgBottom);
    el.appendChild(glyphTop);
    el.appendChild(glyphBottom);
    el.appendChild(flapTop);
    el.appendChild(flapBottom);
    el.appendChild(hinge);

    let current = '';
    let queue = [];
    let busy = false;
    
    function paintAll(val) {
      glyphTop.textContent = val;
      glyphBottom.textContent = val;
      flapTop.textContent = val;
      flapBottom.textContent = val;
      flapTop.style.opacity = '0';
      flapBottom.style.opacity = '0';
    }
    
    function resetFlaps() {
      flapTop.style.opacity = '0';
      flapBottom.style.opacity = '0';
      flapTop.style.transform = 'rotateX(0deg)';
      flapBottom.style.transform = 'rotateX(90deg)';
    }

    function runFlip(val) {
      return new Promise(resolve => {
        const oldVal = current;
        if (prefersReducedMotion || !enableFlipAnim) {
          current = val;
          paintAll(val);
          glyphBottom.animate([{opacity: 0.3}, {opacity: 1}], {duration: 300, easing: 'ease-out'});
          resolve();
          return;
        }
        glyphTop.textContent = val;
        flapTop.textContent = oldVal;
        flapTop.style.opacity = '1';
        flapTop.style.transform = 'rotateX(0deg)';
        
        const drop = flapTop.animate(
          [{ transform: 'rotateX(0deg)' }, { transform: 'rotateX(-90deg)' }],
          { duration: 150, easing: 'ease-in', fill: 'forwards' }
        );
        drop.onfinish = () => {
          drop.cancel();
          flapTop.style.opacity = '0';
          flapBottom.textContent = val;
          flapBottom.style.opacity = '1';
          flapBottom.style.transform = 'rotateX(90deg)';
          
          const rise = flapBottom.animate(
            [{ transform: 'rotateX(90deg)' }, { transform: 'rotateX(0deg)' }],
            { duration: 150, easing: 'ease-out', fill: 'forwards' }
          );
          rise.onfinish = () => {
            rise.cancel();
            flapBottom.style.opacity = '0';
            glyphBottom.textContent = val;
            current = val;
            resolve();
          };
        };
      });
    }

    async function drainQueue() {
      busy = true;
      while (queue.length) {
        const next = queue.shift();
        if (next === current) continue;
        if (queue.length > 0) {
          current = next;
          paintAll(next);
          resetFlaps();
        } else {
          await runFlip(next);
        }
      }
      busy = false;
    }
    
    return {
      setValue(val) {
        if (val === current && !queue.length) return;
        queue.push(val);
        if (!busy) drainQueue();
      }
    };
  }

  const flipHH = createFlip('hh');
  const flipMM = createFlip('mm');
  const flipSS = createFlip('ss');
  const flipAMPM = createFlip('ampm');
  const flipPM = createFlip('pm');
  const flipPS = createFlip('ps');

  let clockInterval;
  function updateClock(force = false) {
    const now = new Date();
    let h = now.getHours();
    const m = now.getMinutes();
    const s = now.getSeconds();
    
    if (typeof is12Hour !== 'undefined' && is12Hour) {
      const ampm = h >= 12 ? 'PM' : 'AM';
      if (flipAMPM) flipAMPM.setValue(ampm);
      h = h % 12;
      if (h === 0) h = 12;
      const ampmEl = document.getElementById('ampm');
      if (ampmEl) ampmEl.style.display = 'block';
    } else {
      const ampmEl = document.getElementById('ampm');
      if (ampmEl) ampmEl.style.display = 'none';
    }
    
    const pad = (n) => String(n).padStart(2, '0');
    if (flipHH) flipHH.setValue(pad(h));
    if (flipMM) flipMM.setValue(pad(m));
    if (flipSS) flipSS.setValue(pad(s));
    
    const dLabel = document.getElementById('date-label');
    if (dLabel && (force || (h === 0 && m === 0 && s === 0))) {
      dLabel.textContent = now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
    }
  }

  clockInterval = setInterval(() => updateClock(), 1000);

  function getPomoSettings() {
    return {
      w: parseInt(document.getElementById('w-len').value) || 25,
      b: parseInt(document.getElementById('b-len').value) || 5,
      lbLen: parseInt(document.getElementById('long-break-len').value) || 15,
      pCount: parseInt(document.getElementById('p-count').value) || 4,
      lbEvery: parseInt(document.getElementById('long-break-every').value) || 4,
    };
  }

  function setPhaseLabel(mode) {
    const labels = {
      'work': 'Focus',
      'break': 'Break',
      'long-break': 'Long Break'
    };
    const lbl = labels[mode] || 'Focus';
    document.getElementById('p-label').textContent = lbl;
    document.getElementById('p-label-flip').textContent = lbl;
  }

  function updatePomoUI() {
    const m = Math.floor(pTimeLeft / 60);
    const s = pTimeLeft % 60;
    const pad = n => String(n).padStart(2, '0');
    
    document.getElementById('p-time').textContent = `${pad(m)}:${pad(s)}`;
    if (flipPM) flipPM.setValue(pad(m));
    if (flipPS) flipPS.setValue(pad(s));
    
    const pct = Math.max(0, Math.min(100, ((pPhaseDuration - pTimeLeft) / pPhaseDuration) * 100));
    widget.style.setProperty('--pomo-progress', pct + '%');

    if (pIsRunning && document.getElementById('title-timer-toggle').checked) {
      document.title = `(${pad(m)}:${pad(s)}) ${document.getElementById('p-label').textContent}`;
    } else {
      document.title = "shay's clock";
    }

    const dotsContainer = document.getElementById('session-dots');
    if (dotsContainer) {
      const sets = getPomoSettings();
      const total = parseInt(sets.pCount) || 4;
      dotsContainer.innerHTML = '';
      for (let i = 0; i < total; i++) {
        const dot = document.createElement('div');
        dot.className = 'dot';
        if (i < sessionsCompleted) {
          dot.classList.add('done');
        } else if (i === sessionsCompleted && pMode === 'work') {
          dot.classList.add('current');
        }
        dotsContainer.appendChild(dot);
      }
    }
  }

  function togglePomoFlipStyle(on) {
    pomoFlipMode = on;
    document.getElementById('pomo-plain').style.display = on ? 'none' : 'flex';
    document.getElementById('pomo-flip-view').style.display = on ? 'flex' : 'none';
    saveSettings();
  }

  
  function showToast(msg) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = msg;
    container.appendChild(toast);
    
    // Trigger reflow for animation
    void toast.offsetWidth;
    toast.classList.add('show');
    
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  function resetPomo() {
    const sets = getPomoSettings();
    pMode = 'work';
    sessionsCompleted = 0;
    pPhaseDuration = sets.w * 60;
    pTimeLeft = pPhaseDuration;
    pIsRunning = false;
    clearInterval(pomoTimer);
    document.getElementById('p-start').textContent = 'Start';
    setPhaseLabel(pMode);
    updatePomoUI();
    saveRuntimeState();
  }

  function skipPhase() {
    const sets = getPomoSettings();
    if (pMode === 'work') {
      sessionsCompleted++;
      if (sessionsCompleted > 0 && sessionsCompleted % sets.lbEvery === 0) {
        pMode = 'long-break';
        pPhaseDuration = sets.lbLen * 60;
      } else {
        pMode = 'break';
        pPhaseDuration = sets.b * 60;
      }
    } else {
      if (sessionsCompleted >= sets.pCount) {
        resetPomo();
        return false;
      }
      pMode = 'work';
      pPhaseDuration = sets.w * 60;
    }
    pTimeLeft = pPhaseDuration;
    setPhaseLabel(pMode);
    updatePomoUI();
    saveRuntimeState();
    return true;
  }

  let lastPomoTick = 0;
  function startPomoTimer() {
    getAudioContext(); // Initialize or resume AudioContext on user gesture
    const btn = document.getElementById('p-start');
    if (pIsRunning) {
      clearInterval(pomoTimer);
      pIsRunning = false;
      btn.textContent = 'Start';
    } else {
      pIsRunning = true;
      btn.textContent = 'Pause';
      lastPomoTick = Date.now();
      pomoTimer = setInterval(() => {
        const now = Date.now();
        const delta = Math.floor((now - lastPomoTick) / 1000);
        
        if (delta >= 1) {
            pTimeLeft -= delta;
            lastPomoTick += delta * 1000;
        } else if (delta < 0) {
            lastPomoTick = now; // Hibernation recovery
        } else {
            return; // Wait for full second
        }

        if (pTimeLeft > 0) {
          updatePomoUI();
        } else {
          pTimeLeft = 0;
          playChime();
          const prevMode = pMode;
          const continued = skipPhase();
          
          if (continued) {
            if (document.getElementById('notify-toggle').checked) {
              showToast('Time is up! Moving to: ' + document.getElementById('p-label').textContent);
              if (Notification.permission === 'granted') {
                try {
                  new Notification('Time is up!', { body: 'Moving to: ' + document.getElementById('p-label').textContent, icon: '/icon.png?v=4' });
                } catch(e) { console.error("Notification failed", e); }
              }
            }
            
            // Stop automatically if autostart is off, OR if a full set is over (transitioning to long break, or finishing a long break)
            if (!document.getElementById('autostart-toggle').checked || pMode === 'long-break' || prevMode === 'long-break') {
              clearInterval(pomoTimer);
              pIsRunning = false;
              document.getElementById('p-start').textContent = 'Start';
            }
          } else {
            if (document.getElementById('notify-toggle').checked) {
              showToast('All sessions completed! Great job!');
              if (Notification.permission === 'granted') {
                try {
                  new Notification('All done!', { body: 'All Pomodoro sessions completed.', icon: '/icon.png?v=4' });
                } catch(e) { console.error("Notification failed", e); }
              }
            }
          }
        }
        saveRuntimeState();
      }, 1000);
    }
    saveRuntimeState();
  }



  // Tab Switching
  function tab(id, evt) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.side-tab').forEach(b => b.classList.remove('active'));
    document.getElementById('view-' + id).classList.add('active');
    const btn = (evt && evt.currentTarget) || document.querySelector('.side-tab[data-tab="' + id + '"]');
    if (btn) btn.classList.add('active');
    try { saveRuntimeState(); } catch {}

    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menu-toggle');
    if (sidebar && sidebar.classList.contains('open')) {
      sidebar.classList.remove('open');
      sidebar.setAttribute('aria-hidden', 'true');
      if (menuToggle) {
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.focus();
      }
    }
  }

  
  function initUniqueUrlBox() {
    const box = document.getElementById('unique-url-box');
    if (!box) return;
    const url = new URL(window.location.href);
    
    // Check if running as PWA or standalone
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone || window.matchMedia('(display-mode: window-controls-overlay)').matches || window.matchMedia('(display-mode: fullscreen)').matches || window.matchMedia('(display-mode: minimal-ui)').matches || !window.location.href.startsWith('http');
    
    // Show warning if on dev URL and not standalone
    if (url.hostname.includes('ais-dev-') && !isStandalone) {
      document.getElementById('dev-warning').style.display = 'block';
      // Automatically convert dev url to pre url for convenience
      url.hostname = url.hostname.replace('ais-dev-', 'ais-pre-');
    } else {
      document.getElementById('dev-warning').style.display = 'none';
    }
    


    if (!url.searchParams.has('id')) {
        url.searchParams.set('id', Math.random().toString(36).slice(2, 9));
    }
    
    try {
      const settings = localStorage.getItem('pastelFocusSettingsV4:' + INSTANCE_ID) || localStorage.getItem('pastelFocusSettingsV4:default');
      if (settings) {
         const encoded = btoa(encodeURIComponent(settings));
         url.searchParams.set('state', encoded);
      }
    } catch(e) {}
    
    box.value = url.toString();
  }

  function copyUniqueUrl(btn) {
    const box = document.getElementById('unique-url-box');
    if (!box) return;
    const finalUrl = box.value;
    
    function showCopied() {
      const old = btn.innerText;
      btn.innerText = 'Copied!';
      setTimeout(() => btn.innerText = old, 2000);
      
      setTimeout(() => {
        const currentUrl = new URL(box.value);
        currentUrl.searchParams.set('id', Math.random().toString(36).slice(2, 9));
        
        try {
          const settings = localStorage.getItem('pastelFocusSettingsV4:' + INSTANCE_ID) || localStorage.getItem('pastelFocusSettingsV4:default');
          if (settings) {
             const encoded = btoa(encodeURIComponent(settings));
             currentUrl.searchParams.set('state', encoded);
          }
        } catch(e) {}
        
        box.value = currentUrl.toString();
      }, 500);
    }

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(finalUrl).then(showCopied).catch(() => {
        box.select();
        document.execCommand('copy');
        showCopied();
      });
    } else {
      box.select();
      try {
        document.execCommand('copy');
        showCopied();
      } catch (err) {
        prompt('Press Ctrl+C / Cmd+C to copy your unique URL:', finalUrl);
      }
    }
  }

  // --- RUNTIME STATE (per-instance) so a reload restores exactly ---
  const STATE_KEY = 'pastelFocusStateV1:' + INSTANCE_ID;
  let stateSaveTimeout;
  function saveRuntimeState() {
    clearTimeout(stateSaveTimeout);
    stateSaveTimeout = setTimeout(() => {
      try {
        const activeTab = document.querySelector('.side-tab.active')?.dataset.tab || 'clock';
        const player = document.getElementById('player');
        const mUrl = player ? player.src : '';
        const mInput = document.getElementById('m-url') ? document.getElementById('m-url').value : '';
        const state = {
          activeTab,
          pMode, pTimeLeft, pPhaseDuration,
          sessionsCompleted,
          pIsRunning,
          mUrl, mInput, currentPlaylistIndex,
          savedAt: Date.now()
        };
        localStorage.setItem(STATE_KEY, JSON.stringify(state));
      } catch {}
    }, 200);
  }
  function loadRuntimeState() {
    try {
      const raw = localStorage.getItem(STATE_KEY);
      if (!raw) return;
      const s = JSON.parse(raw);
      if (s.activeTab && INSTANCE_ID !== 'default') {
        tab(s.activeTab);
      } else if (INSTANCE_ID === 'default') {
        tab('clock');
      } else if (s.activeTab) {
        tab(s.activeTab);
      }
      if (typeof s.pPhaseDuration === 'number') pPhaseDuration = s.pPhaseDuration;
      if (typeof s.pTimeLeft === 'number') pTimeLeft = s.pTimeLeft;
      if (typeof s.sessionsCompleted === 'number') sessionsCompleted = s.sessionsCompleted;
      if (typeof s.pMode === 'string') pMode = s.pMode;
      
      if (s.mInput) {
        document.getElementById('m-url').value = s.mInput;
      }
      if (s.mUrl && s.mUrl !== 'about:blank' && !s.mUrl.includes('about:blank')) {
        // Strip autoplay when reloading state so it doesn't blast audio on page load
        let safeUrl = s.mUrl.replace('autoplay=1', 'autoplay=0').replace('auto_play=true', 'auto_play=false');
        const player = document.getElementById('player');
        player.src = safeUrl;
        player.style.pointerEvents = 'auto';
        if (typeof s.currentPlaylistIndex === 'number') currentPlaylistIndex = s.currentPlaylistIndex;
        renderPlaylists();
    renderPlaylist();
      }

      setPhaseLabel(pMode);
      // If it was running, subtract wall-clock time elapsed since last save.
      if (s.pIsRunning && s.savedAt) {
        const elapsed = Math.floor((Date.now() - s.savedAt) / 1000);
        pTimeLeft = Math.max(0, pTimeLeft - elapsed);
      }
      updatePomoUI();
      if (s.pIsRunning && pTimeLeft > 0) {
        pIsRunning = false; // reset before start
        startPomoTimer();
      } else if (s.pIsRunning && pTimeLeft === 0) {
        playChime();
        const prevMode = pMode;
        skipPhase();
        
        if (document.getElementById('notify-toggle').checked) {
          showToast('Time is up! Moving to: ' + document.getElementById('p-label').textContent);
          if (Notification.permission === 'granted') {
             try {
               new Notification('Time is up!', { body: 'Moving to: ' + document.getElementById('p-label').textContent, icon: '/icon.png?v=4' });
             } catch(e) { console.error("Notification failed", e); }
          }
        }
        
        pIsRunning = false;
        if (document.getElementById('autostart-toggle').checked && pMode !== 'long-break' && prevMode !== 'long-break') {
          startPomoTimer();
        } else {
          document.getElementById('p-start').textContent = 'Start';
        }
      }
    } catch (e) { console.error('Failed to load runtime state', e); }
  }

  // --- LOCAL STORAGE PERSISTENCE ENGINE ---
  let saveTimeout;
  function saveSettings() {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      const settings = {
        theme: {
          accent: document.getElementById('accent-picker').value,
          card: document.getElementById('card-picker').value,
          bg: document.getElementById('bg-picker').value,
          text: document.getElementById('text-picker').value,
          cardText: document.getElementById('card-text-picker').value
        },
        customThemes: customThemes,
        outlineWidth: document.getElementById('outline-width').value,
        shadowOpacity: document.getElementById('shadow-opacity').value,
        date: document.getElementById('date-toggle').checked,
        format12: document.getElementById('format-toggle').checked,
        flipAnim: document.getElementById('flip-anim-toggle').checked,
        quotes: document.getElementById('quotes-toggle').checked,
        quoteCategory: document.getElementById('quote-category').value,
        flipScale: document.getElementById('flip-scale').value,
        digitScale: document.getElementById('digit-scale').value,
        flipRadius: document.getElementById('flip-radius').value,
        ringScale: document.getElementById('ring-scale').value,
        pomoFlipMode: document.getElementById('pomo-flip-toggle').checked,
        pomo: {
          w: document.getElementById('w-len').value,
          b: document.getElementById('b-len').value,
          pCount: document.getElementById('p-count').value,
          lbEvery: document.getElementById('long-break-every').value,
          lbLen: document.getElementById('long-break-len').value
        },
        autoStart: document.getElementById('autostart-toggle').checked,
        notify: document.getElementById('notify-toggle').checked,
        titleTimer: document.getElementById('title-timer-toggle').checked,
        font: document.getElementById('font-select').value,
        playlists: savedPlaylists,
        currentPlaylistIndex: currentPlaylistIndex
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }, 300);
  }

  
  function setAsGlobalDefault() {
    try {
      const currentSettings = localStorage.getItem(STORAGE_KEY);
      if (currentSettings) {
        localStorage.setItem('pastelFocusSettingsV4:default', currentSettings);
        console.log('Saved as default settings');
      }
    } catch(e) {
      console.error('Failed to save default settings.');
    }
  }
  let resetGlobalCount = 0;
  function resetToGlobalDefault(btn) {
    if (resetGlobalCount === 0) {
      resetGlobalCount = 1;
      const oldTxt = btn.innerText;
      btn.innerText = 'Confirm Reset?';
      btn.style.color = 'red';
      btn.style.borderColor = 'red';
      setTimeout(() => {
        resetGlobalCount = 0;
        btn.innerText = oldTxt;
        btn.style.color = '';
        btn.style.borderColor = 'transparent';
      }, 3000);
    } else {
      try {
        localStorage.removeItem(STORAGE_KEY);
        location.reload();
      } catch(e) {}
    }
  }

  function loadSettings() {
    // Check for V4 config, fallback to older formats if necessary
    // Prefer the instance-scoped key, then fall back to legacy shared keys (only for the default instance).
    let saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      saved = localStorage.getItem('pastelFocusSettingsV4:default');
    }
    if (!saved && INSTANCE_ID === 'default') {
      for (const k of LEGACY_KEYS) { saved = saved || localStorage.getItem(k); }
    }

    if (!saved) return;
    try {
      const settings = JSON.parse(saved);

      if (settings.theme) {
        widget.style.setProperty('--accent', settings.theme.accent);
        widget.style.setProperty('--card', settings.theme.card);
        widget.style.setProperty('--bg', settings.theme.bg);
        widget.style.setProperty('--text', settings.theme.text);
        widget.style.setProperty('--card-text', settings.theme.cardText);
        
        document.getElementById('accent-picker').value = settings.theme.accent;
        document.getElementById('card-picker').value = settings.theme.card;
        document.getElementById('bg-picker').value = settings.theme.bg;
        document.getElementById('text-picker').value = settings.theme.text;
        document.getElementById('card-text-picker').value = settings.theme.cardText;
      }

      if (settings.customThemes && Array.isArray(settings.customThemes)) {
        customThemes = settings.customThemes;
        renderCustomThemes();
      } else {
        customThemes = [];
      }

      // Handle transition from boolean outline to pixel width
      if (settings.outlineWidth !== undefined) {
        document.getElementById('outline-width').value = settings.outlineWidth;
        widget.style.setProperty('--outline-width', settings.outlineWidth + 'px');
      } else if (settings.outline !== undefined) {
        let mapped = settings.outline ? 8 : 0;
        document.getElementById('outline-width').value = mapped;
        widget.style.setProperty('--outline-width', mapped + 'px');
      }

      if (settings.shadowOpacity !== undefined) {
        document.getElementById('shadow-opacity').value = settings.shadowOpacity;
        widget.style.setProperty('--shadow-opacity', settings.shadowOpacity);
      }

      if (settings.date !== undefined) document.getElementById('date-toggle').checked = settings.date;
      if (settings.format12 !== undefined) document.getElementById('format-toggle').checked = settings.format12;
      if (settings.digitScale) {
        document.getElementById('digit-scale').value = settings.digitScale;
        widget.style.setProperty('--digit-scale', settings.digitScale);
      }
      if (settings.ringScale) {
        document.getElementById('ring-scale').value = settings.ringScale;
        widget.style.setProperty('--ring-scale', settings.ringScale);
      }
      if (settings.flipRadius) {
        document.getElementById('flip-radius').value = settings.flipRadius;
        widget.style.setProperty('--flip-radius', settings.flipRadius + 'rem');
      }

      if (settings.pomoFlipMode !== undefined) document.getElementById('pomo-flip-toggle').checked = settings.pomoFlipMode;
      
      if (settings.quotes !== undefined) document.getElementById('quotes-toggle').checked = settings.quotes;
      if (settings.quoteCategory !== undefined) document.getElementById('quote-category').value = settings.quoteCategory;
      if (settings.flipAnim !== undefined) document.getElementById('flip-anim-toggle').checked = settings.flipAnim;
      
      if (settings.pomo) {
        document.getElementById('w-len').value = settings.pomo.w;
        document.getElementById('b-len').value = settings.pomo.b;
        document.getElementById('p-count').value = settings.pomo.pCount;
        document.getElementById('long-break-every').value = settings.pomo.lbEvery;
        document.getElementById('long-break-len').value = settings.pomo.lbLen;
      }

      if (settings.autoStart !== undefined) document.getElementById('autostart-toggle').checked = settings.autoStart;
      if (settings.notify !== undefined) {
        if (settings.notify && ("Notification" in window) && Notification.permission !== 'granted') {
          document.getElementById('notify-toggle').checked = false;
        } else {
          document.getElementById('notify-toggle').checked = settings.notify;
        }
      }
      if (settings.titleTimer !== undefined) document.getElementById('title-timer-toggle').checked = settings.titleTimer;

      if (settings.font) {
        document.getElementById('font-select').value = settings.font;
        widget.style.setProperty('--font', settings.font);
      }
      if (settings.playlists) {
        savedPlaylists = settings.playlists.map(item => {
          if (typeof item === 'string') return { url: item, name: "Saved Link" };
          return item;
        });
        if (settings.currentPlaylistIndex !== undefined) {
           currentPlaylistIndex = settings.currentPlaylistIndex;
        }
        renderPlaylists();
    renderPlaylist();
      }

    } catch (e) {
      console.error("Failed to load settings", e);
    }
  }

  let resetClickCount = 0;
    function toggleNotifications(on) {
    if (on) {
      if (!("Notification" in window)) {
        showToast("This browser does not support desktop notifications.");
        document.getElementById('notify-toggle').checked = false;
        saveSettings();
        return;
      }
      if (Notification.permission === "granted") {
        showToast("Desktop notifications enabled.");
        saveSettings();
      } else if (Notification.permission !== "denied") {
        try {
          Notification.requestPermission().then((permission) => {
            if (permission === "granted") {
              showToast("Desktop notifications enabled.");
              saveSettings();
            } else {
              showToast("Notification permission denied.");
              document.getElementById('notify-toggle').checked = false;
              saveSettings();
            }
          }).catch(err => {
            showToast("Notifications blocked. Try opening widget in a new tab.");
            document.getElementById('notify-toggle').checked = false;
            saveSettings();
          });
        } catch(e) {
          showToast("Notifications blocked. Try opening widget in a new tab.");
          document.getElementById('notify-toggle').checked = false;
          saveSettings();
        }
      } else {
        showToast("Notifications are blocked in your browser settings.");
        document.getElementById('notify-toggle').checked = false;
        saveSettings();
      }
    } else {
      showToast("Desktop notifications disabled.");
      saveSettings();
    }
  }

  function resetAllSettings(btn) {
    if (resetClickCount === 0) {
      resetClickCount = 1;
      const oldTxt = btn.innerText;
      btn.innerText = 'Click again to confirm reset';
      btn.style.color = 'red';
      setTimeout(() => {
        resetClickCount = 0;
        btn.innerText = oldTxt;
        btn.style.color = '';
      }, 3000);
    } else {
      localStorage.removeItem(STORAGE_KEY);
      if (INSTANCE_ID === 'default') LEGACY_KEYS.forEach(k => localStorage.removeItem(k));
      location.reload();
    }
  }
  // ------------------------------------------

  // Visual Controls Engine
  function updatePipVars() {
    if (window.__pipWindow) {
      window.__pipWindow.document.body.style.cssText = widget.style.cssText;
      const meta = window.__pipWindow.document.querySelector('meta[name="theme-color"]');
      if (meta) {
         meta.content = widget.style.getPropertyValue('--bg') || '#FDF9F3';
      }
    }
  }

  function setTheme(prop, val) {
    widget.style.setProperty(prop, val);
    updatePipVars();
    saveSettings();
  }
  function setFont(val) {
    widget.style.setProperty('--font', val);
    updatePipVars();
    saveSettings();
  }
  function setRingScale(val) {
    widget.style.setProperty('--ring-scale', val);
    updatePipVars();
    saveSettings();
  }
  function setOutlineWidth(val) {
    widget.style.setProperty('--outline-width', val + 'px');
    updatePipVars();
    saveSettings();
  }
  function setShadowOpacity(val) {
    widget.style.setProperty('--shadow-opacity', val);
    saveSettings();
  }
  function setDigitScale(val) {
    widget.style.setProperty('--digit-scale', val);
    saveSettings();
  }
  function setFlipVar(prop, val) {
    if(prop === '--flip-radius') val += 'rem';
    widget.style.setProperty(prop, val);
    saveSettings();
  }

  // Expanded Theme Collection (Including elegant darker modes & distinct palettes)
  const PRESET_THEMES = [
    { name: 'Peach Bloom',   accent: '#FFD5C2', card: '#E8F3F1', bg: '#FDF9F3', text: '#7A6F68', cardText: '#7A6F68' },
    { name: 'Lavender Mist', accent: '#D9C9F0', card: '#F3EFFB', bg: '#FAF8FE', text: '#6E6580', cardText: '#6E6580' },
    { name: 'Sage Garden',   accent: '#C3D8C1', card: '#EEF4EC', bg: '#F8FBF7', text: '#5F6E5B', cardText: '#5F6E5B' },
    { name: 'Sky Blue',      accent: '#C6E2F5', card: '#EAF5FC', bg: '#F7FBFE', text: '#4F6A7A', cardText: '#4F6A7A' },
    { name: 'Buttercream',   accent: '#F5E1A4', card: '#FBF5E3', bg: '#FFFCF3', text: '#7A6A3F', cardText: '#7A6A3F' },
    { name: 'Seafoam',       accent: '#B7E4D8', card: '#E6F6F1', bg: '#F5FCFA', text: '#4E7A6C', cardText: '#4E7A6C' },
    { name: 'Midnight Pastel', accent: '#6F7B9C', card: '#1D2230', bg: '#131620', text: '#A2ADCC', cardText: '#A2ADCC' }, /* Dark mode pastel! */
    { name: 'Matcha Latte',  accent: '#AECB9E', card: '#F2F6ED', bg: '#FAFCF8', text: '#5D7350', cardText: '#5D7350' },
    { name: 'Sunset Glow',   accent: '#F9B4AB', card: '#FDF1ED', bg: '#FFF9F7', text: '#8C564F', cardText: '#8C564F' },
    { name: 'Winter Frost',  accent: '#B4D2E7', card: '#EDF5FA', bg: '#F6FAFD', text: '#557286', cardText: '#557286' },
    { name: 'Vanilla Bean',  accent: '#E8D5B5', card: '#FDF8F0', bg: '#FFFCF8', text: '#7A6B53', cardText: '#7A6B53' },
    { name: 'Cherry Blossom',accent: '#F4BEDA', card: '#FDF3F8', bg: '#FFFAFC', text: '#8A5D74', cardText: '#8A5D74' },
    { name: 'Coffee House',  accent: '#B28E75', card: '#F4EEE9', bg: '#FAF6F2', text: '#594436', cardText: '#594436' },
    { name: 'Lemonade',      accent: '#F4E07B', card: '#FDFBF0', bg: '#FFFEFA', text: '#8A7D3C', cardText: '#8A7D3C' },
    { name: 'Taro Milk',     accent: '#C4B7D6', card: '#F4F1F8', bg: '#FBFAFD', text: '#6A5E7A', cardText: '#6A5E7A' },
    { name: 'Peachy Keen',   accent: '#FFB8A1', card: '#FEF3F0', bg: '#FFF9F7', text: '#8E5A4B', cardText: '#8E5A4B' },
    { name: 'Powder Blue',   accent: '#BFD7EA', card: '#E8F1F8', bg: '#F6FAFD', text: '#4C6478', cardText: '#4C6478' },
    { name: 'Rosewood',      accent: '#BC7783', card: '#F8E9EB', bg: '#E4C4C9', text: '#5A2F35', cardText: '#5A2F35' },
  ];
  let customThemes = [];

  function applyThemePreset(theme) {
    setTheme('--accent', theme.accent);
    setTheme('--card', theme.card);
    setTheme('--bg', theme.bg);
    setTheme('--text', theme.text);
    setTheme('--card-text', theme.cardText);
    document.getElementById('accent-picker').value = theme.accent;
    document.getElementById('card-picker').value = theme.card;
    document.getElementById('bg-picker').value = theme.bg;
    document.getElementById('text-picker').value = theme.text;
    document.getElementById('card-text-picker').value = theme.cardText;
  }

  function renderThemeSwatch(container, theme, isCustom = false) {
    const wrap = document.createElement('div');
    wrap.style.position = 'relative';
    wrap.style.display = 'inline-block';
    
    const btn = document.createElement('button');
    btn.className = 'theme-swatch';
    btn.type = 'button';
    btn.title = theme.name;
    btn.setAttribute('aria-label', theme.name);
    btn.style.background = `linear-gradient(135deg, ${theme.accent} 50%, ${theme.card} 50%)`;
    btn.onclick = () => applyThemePreset(theme);
    wrap.appendChild(btn);
    
    if (isCustom) {
      const del = document.createElement('div');
      del.innerHTML = '×';
      del.style.position = 'absolute';
      del.style.top = '-4px';
      del.style.right = '-4px';
      del.style.background = 'var(--text)';
      del.style.color = 'var(--bg)';
      del.style.width = '14px';
      del.style.height = '14px';
      del.style.borderRadius = '50%';
      del.style.fontSize = '12px';
      del.style.lineHeight = '14px';
      del.style.textAlign = 'center';
      del.style.cursor = 'pointer';
      del.title = 'Delete theme';
      del.onclick = (e) => {
        e.stopPropagation();
        customThemes = customThemes.filter(t => t.name !== theme.name || t.accent !== theme.accent);
        saveSettings();
        renderCustomThemes();
      };
      wrap.appendChild(del);
    }
    container.appendChild(wrap);
  }

  function renderPresetThemes() {
    const row = document.getElementById('preset-themes-row');
    PRESET_THEMES.forEach(t => renderThemeSwatch(row, t));
  }

  function renderCustomThemes() {
    const row = document.getElementById('custom-themes-row');
    const wrap = document.getElementById('custom-themes-wrap');
    row.innerHTML = '';
    customThemes.forEach(t => renderThemeSwatch(row, t, true));
    wrap.style.display = customThemes.length ? 'block' : 'none';
  }

  function saveCurrentTheme() {
    const name = 'Custom ' + (customThemes.length + 1);
    customThemes.push({
      name: name,
      accent: document.getElementById('accent-picker').value,
      card: document.getElementById('card-picker').value,
      bg: document.getElementById('bg-picker').value,
      text: document.getElementById('text-picker').value,
      cardText: document.getElementById('card-text-picker').value
    });
    renderCustomThemes();
    saveSettings();
  }

  function toggleDate(on) {
    document.getElementById('date-label').style.display = on ? 'block' : 'none';
    saveSettings();
  }

  let is12Hour = true;
  function toggleFormat(on) {
    is12Hour = on;
    document.getElementById('ampm').style.display = on ? 'block' : 'none';
    updateClock(true);
    saveSettings();
  }

  let enableFlipAnim = true;
  
  const QUOTES = {
    motivation: [
      "Don't stop when you're tired. Stop when you're done.",
      "The hard days are what make you stronger.",
      "If you want something you never had, you have to do something you've never done."
    ],
    inspiration: [
      "Every moment is a fresh beginning.",
      "Believe you can and you're halfway there.",
      "Your limitation—it's only your imagination."
    ],
    stoic: [
      "We suffer more often in imagination than in reality. – Seneca",
      "Waste no more time arguing what a good man should be. Be one. – Marcus Aurelius",
      "He who fears death will never do anything worth of a man who is alive. – Seneca"
    ],
    islamic: [
      "Indeed, with hardship [will be] ease. (Quran 94:6)",
      "And He found you lost and guided [you]. (Quran 93:7)",
      "So be patient. Indeed, the promise of Allah is truth. (Quran 30:60)"
    ],
    mindfulness: [
      "Wherever you are, be there totally.",
      "Breath is the bridge which connects life to consciousness.",
      "The present moment is the only time over which we have dominion."
    ],
    productivity: [
      "Focus on being productive instead of busy.",
      "Action is the foundational key to all success.",
      "Amateurs sit and wait for inspiration, the rest of us just get up and go to work."
    ]
  };

  let currentQuoteInterval = null;

  function getRandomQuote(category) {
    if (category === 'mix' || !QUOTES[category]) {
      const keys = Object.keys(QUOTES);
      const randomCategory = keys[Math.floor(Math.random() * keys.length)];
      const quotes = QUOTES[randomCategory];
      return quotes[Math.floor(Math.random() * quotes.length)];
    }
    const quotes = QUOTES[category];
    return quotes[Math.floor(Math.random() * quotes.length)];
  }

  function rotateQuote() {
    const qb = document.getElementById('quote-box');
    const toggle = document.getElementById('quotes-toggle');
    if (!toggle || !toggle.checked || !qb) return;
    
    const cat = document.getElementById('quote-category').value || 'mix';
    qb.innerText = getRandomQuote(cat);
    
    // Add a simple fade effect
    qb.style.opacity = 0;
    setTimeout(() => {
      qb.style.opacity = 0.85;
    }, 500);
  }

  function toggleQuotes(on) {
    const qb = document.getElementById('quote-box');
    const catRow = document.getElementById('quote-category-row');
    if (qb) qb.style.display = on ? 'block' : 'none';
    if (catRow) catRow.style.display = on ? 'flex' : 'none';
    if (on) {
      rotateQuote();
      if (!currentQuoteInterval) {
        currentQuoteInterval = setInterval(rotateQuote, 30000); // 30 seconds
      }
    } else {
      if (currentQuoteInterval) {
        clearInterval(currentQuoteInterval);
        currentQuoteInterval = null;
      }
    }
    saveSettings();
  }

  function setQuoteCategory(cat) {
    rotateQuote();
    saveSettings();
  }

  function toggleFlipAnim(on) {
    enableFlipAnim = on;
    saveSettings();
  }

  // Sidebar toggle behavior
  const sidebar = document.getElementById('sidebar');
  const menuToggle = document.getElementById('menu-toggle');

  function toggleFS() {
    const w = document.getElementById('mainWidget');
    if (w) w.classList.toggle('force-fullscreen');
  }

  function toggleMenu(evt) {
    evt.stopPropagation();
    const willOpen = !sidebar.classList.contains('open');
    sidebar.classList.toggle('open', willOpen);
    sidebar.setAttribute('aria-hidden', String(!willOpen));
    menuToggle.setAttribute('aria-expanded', String(willOpen));
    if (willOpen) {
      const tabs = Array.from(sidebar.querySelectorAll('.side-tab'));
      const activeTab = tabs.find(t => t.classList.contains('active'));
      if (activeTab) activeTab.focus();
      else if (tabs.length) tabs[0].focus();
    } else {
      menuToggle.focus();
    }
  }

  document.addEventListener('click', (e) => {
    if (!sidebar.classList.contains('open')) return;
    if (sidebar.contains(e.target) || menuToggle.contains(e.target)) return;
    sidebar.classList.remove('open');
    sidebar.setAttribute('aria-hidden', 'true');
    menuToggle.setAttribute('aria-expanded', 'false');
  });

  document.addEventListener('keydown', (e) => {
    const t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;

    if (t && (t.tagName === 'BUTTON' || t.tagName === 'A' || t.getAttribute('role') === 'button') && (e.key === 'Enter' || e.key === ' ')) {
      return; // Let native click happen
    }

    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      const sidebar = document.getElementById('sidebar');
      const t = e.target;
      if (sidebar && sidebar.classList.contains('open')) {
        e.preventDefault();
        const tabs = Array.from(sidebar.querySelectorAll('.side-tab'));
        let activeIdx = tabs.findIndex(tab => tab === document.activeElement);
        if (activeIdx === -1) activeIdx = tabs.findIndex(tab => tab.classList.contains('active'));
        let nextIdx = e.key === 'ArrowDown' ? activeIdx + 1 : activeIdx - 1;
        if (nextIdx < 0) nextIdx = tabs.length - 1;
        if (nextIdx >= tabs.length) nextIdx = 0;
        tabs[nextIdx].focus();
        return;
      } else if (t && (t.id === 'menu-toggle' || t.classList.contains('side-tab'))) {
        e.preventDefault();
        const tabs = Array.from(sidebar.querySelectorAll('.side-tab'));
        let activeIdx = tabs.findIndex(tab => tab.classList.contains('active'));
        let nextIdx = e.key === 'ArrowDown' ? activeIdx + 1 : activeIdx - 1;
        if (nextIdx < 0) nextIdx = tabs.length - 1;
        if (nextIdx >= tabs.length) nextIdx = 0;
        tabs[nextIdx].click();
        return;
      }
    }

    if (e.key === 'Shift') {
      const sidebar = document.getElementById('sidebar');
      const menuToggle = document.getElementById('menu-toggle');
      if (sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
        sidebar.setAttribute('aria-hidden', 'true');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
      return;
    }

    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (document.getElementById('view-pomo').classList.contains('active')) {
        const pStartBtn = document.getElementById('p-start');
        if (pStartBtn) pStartBtn.click();
      } else {
        togglePlayMedia();
      }
    } else if (e.key === 'r' || e.key === 'R') {
      if (document.getElementById('view-pomo').classList.contains('active')) {
        resetPomo();
      }
    } else if (e.key === 's' || e.key === 'S') {
      if (document.getElementById('view-pomo').classList.contains('active')) {
        skipPhase();
      }
    } else if (e.key === 'f' || e.key === 'F') {
      toggleFS();
    } else if (e.key === 'm' || e.key === 'M') {
      toggleMenu({ stopPropagation: function(){} });
    } else if (e.key === 'v' || e.key === 'V') {
      toggleMuteMedia();
    } else if (e.key === 'x' || e.key === 'X') {
      togglePlayMedia();
    } else if (e.key === 'l' || e.key === 'L') {
      startMedia();
    } else if (e.key === 'c' || e.key === 'C') {
      stopMedia();
    } else if (e.key === 'p' || e.key === 'P') {
      goToPreviousMedia();
    } else if (e.key === 'n' || e.key === 'N') {
      goToNextMedia();
    } else if (e.key === 'j' || e.key === 'J') {
      goToPreviousItem();
    } else if (e.key === 'k' || e.key === 'K') {
      goToNextItem();
    }
  });
  
  if ('mediaSession' in navigator) {
    navigator.mediaSession.setActionHandler('previoustrack', prevTrack);
    navigator.mediaSession.setActionHandler('nexttrack', nextTrack);
    navigator.mediaSession.setActionHandler('play', togglePlayMedia);
    navigator.mediaSession.setActionHandler('pause', togglePlayMedia);
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const w = document.getElementById('mainWidget');
      if (w && w.classList.contains('force-fullscreen')) {
        w.classList.remove('force-fullscreen');
      }
      const sidebar = document.getElementById('sidebar');
      if (sidebar && sidebar.classList.contains('open')) {
        toggleMenu({ stopPropagation: () => {} });
      }
    }
  });
  
  // Ensure the iframe has focus for keyboard shortcuts when clicked anywhere
  document.addEventListener('click', (e) => {
    const t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.tagName === 'OPTION' || t.tagName === 'LABEL')) return;
    if (!document.hasFocus()) window.focus();
  });
  
  let mediaFiles = [];
  let currentMediaIndex = 0;
  let localPlayer = null;
  // --- INITIALIZATION ORDER ---
  initUniqueUrlBox();
  renderPresetThemes();
  loadSettings(); 
  
  // Apply visual behaviors based on the loaded (or default) DOM values
  setOutlineWidth(document.getElementById('outline-width').value);
  setShadowOpacity(document.getElementById('shadow-opacity').value);
  toggleDate(document.getElementById('date-toggle').checked);
  toggleFormat(document.getElementById('format-toggle').checked);
  toggleFlipAnim(document.getElementById('flip-anim-toggle').checked);
  toggleQuotes(document.getElementById('quotes-toggle').checked);
  setQuoteCategory(document.getElementById('quote-category').value);
  togglePomoFlipStyle(document.getElementById('pomo-flip-toggle').checked);
  
  updateClock(true);
  resetPomo();
  loadRuntimeState();

  // --- Resize-aware auto-fit ---
  (function setupAutoFit() {
    let scale = 1;
    let raf = 0;
    function activeView() {
      return widget.querySelector('.view.active') || widget.querySelector('.view');
    }
    function fit() {
      raf = 0;
      const rect = widget.getBoundingClientRect();
      const scaleFit = document.getElementById('scale-fit-toggle') ? document.getElementById('scale-fit-toggle').checked : true;            
      const view = activeView();
      if (!view) return;
      if (view.id === 'view-media' || view.id === 'view-style') {
        widget.style.setProperty('--auto-scale', '1');
        return;
      }
      const viewStyles = window.getComputedStyle(view);
      const padT = parseFloat(viewStyles.paddingTop) || 0;
      const padB = parseFloat(viewStyles.paddingBottom) || 0;
      const padL = parseFloat(viewStyles.paddingLeft) || 0;
      const padR = parseFloat(viewStyles.paddingRight) || 0;
      
      const availW = rect.width - padL - padR;
      const availH = rect.height - padT - padB;
      const inner = view.querySelector('.view-inner');
      if (!inner) return;
      
      // Reset scale to measure natural size
      const oldScale = widget.style.getPropertyValue('--auto-scale');
      widget.style.setProperty('--auto-scale', '1');
      const measureW = inner.scrollWidth;
      const measureH = inner.scrollHeight;
      
      let s = 1;
      if (scaleFit && measureH > availH) s = Math.min(s, availH / measureH);
      if (measureW > availW) s = Math.min(s, availW / measureW);
      
      // Additional safety margin
      s = s * 0.95;
      
      s = Math.max(0.1, Math.min(1, s));
      
      widget.style.setProperty('--auto-scale', s);
    }
    
    window.addEventListener('resize', () => {
      if (!raf) raf = requestAnimationFrame(fit);
    });
    
    // observe changes to views
    const observer = new MutationObserver((mutations) => {
      for (let m of mutations) {
        if (m.attributeName === 'class' && m.target.classList.contains('active')) {
          fit();
        }
      }
    });
    document.querySelectorAll('.view').forEach(v => observer.observe(v, { attributes: true }));
    
    // trigger initial
    fit();
    setTimeout(fit, 100);
  })();

  // --- MEDIA SYSTEM ---

  
  function addCurrentUrlToPlaylist() {
    let urlInput = document.getElementById('new-saved-url');
    let url = (urlInput && urlInput.value.trim()) ? urlInput.value.trim() : document.getElementById('m-url').value.trim();
    if (url && !savedPlaylists.some(p => p.url === url)) {
      let title = "Saved Link";
      if (url.includes('youtube.com') || url.includes('youtu.be')) title = "YouTube";
      savedPlaylists.push({ url, name: title });
      currentPlaylistIndex = savedPlaylists.length - 1;
      saveSettings();
      renderPlaylists();
    renderPlaylist();
      if (document.getElementById('new-saved-url')) document.getElementById('new-saved-url').value = '';
      showToast('URL saved to your Web Playlist!');
    }
  }

  function saveMainUrl() {
    let url = document.getElementById('m-url').value.trim();
    if (url && !savedPlaylists.some(p => p.url === url)) {
      let title = "Saved Link";
      if (url.includes('youtube.com') || url.includes('youtu.be')) title = "YouTube";
      savedPlaylists.push({ url, name: title });
      currentPlaylistIndex = savedPlaylists.length - 1;
      saveSettings();
      renderPlaylists();
      renderPlaylist();
      showToast('URL saved to your Web Playlist!');
    } else if (url) {
      showToast('URL is already saved!');
    } else {
      showToast('Please enter a URL first');
    }
  }

  function openSavedMediaPopup() {
    document.getElementById('saved-media-modal').style.display = 'flex';
    renderPlaylists();
    renderPlaylist();
  }

  function closeSavedMediaPopup() {
    document.getElementById('saved-media-modal').style.display = 'none';
  }

  function getMacroQueue() {
    let q = [];
    if (mediaFiles && mediaFiles.length > 0) {
      q.push({ type: 'local', items: mediaFiles });
    }
    savedPlaylists.forEach((list, idx) => {
      if (list.autoplay !== false) {
        q.push({ type: 'web', index: idx, url: list.url, name: list.name });
      }
    });
    return q;
  }

  function playMacroItem(mIndex, q, direction = 1) {
    if (!q) q = getMacroQueue();
    if (q.length === 0) return;
    
    // Bounds clamping, do NOT wrap around.
    if (mIndex >= q.length) return;
    if (mIndex < 0) return;

    let item = q[mIndex];
    let currentIdx = getCurrentMacroIndex(q);
    
    // Check if we are already playing this exact macro piece
    if (mIndex === currentIdx) {
      if (item.type === 'local') {
        let trackIdx = (direction === -1) ? mediaFiles.length - 1 : 0;
        playLocalMedia(trackIdx);
      } else {
        const iframe = document.getElementById('player');
        if (iframe && (iframe.src.includes('youtube.com') || iframe.src.includes('youtu.be'))) {
          if (window.ytPlaylistLength > 1) {
             let targetIdx = (direction === -1) ? window.ytPlaylistLength - 1 : 0;
             iframe.contentWindow.postMessage(JSON.stringify({event: 'command', func: 'playVideoAt', args: [targetIdx]}), '*');
          } else {
             let oldSrc = iframe.src;
             iframe.src = '';
             setTimeout(() => { iframe.src = oldSrc; }, 50);
          }
        }
      }
      return;
    }

    if (item.type === 'local') {
      let trackIdx = (direction === -1) ? mediaFiles.length - 1 : 0;
      playLocalMedia(trackIdx);
    } else {
      currentPlaylistIndex = item.index;
      document.getElementById('m-url').value = item.url;
      
      // Tell loadMedia we want to play the last track if going backwards
      if (direction === -1) {
          window.playLastYtTrackOnLoad = true;
      } else {
          window.playLastYtTrackOnLoad = false;
      }
      
      loadMedia();
      renderPlaylists();
      renderPlaylist();
    }
  }

  function getCurrentMacroIndex(q) {
    if (!q) q = getMacroQueue();
    if (localPlayer && localPlayer.style.display !== 'none') {
      let idx = q.findIndex(i => i.type === 'local');
      return idx !== -1 ? idx : 0;
    } else {
      let idx = q.findIndex(i => i.type === 'web' && i.index === currentPlaylistIndex);
      return idx !== -1 ? idx : 0;
    }
  }

  function playAllSaved() {
    let q = getMacroQueue();
    if (q.length === 0) {
      showToast("No items selected for playback.");
      return;
    }
    closeSavedMediaPopup();
    playMacroItem(0, q, 1);
    showToast("Playing media lists in sequence...");
  }

  function loadMedia() {
    window.ytPlaylistIndex = -1;
    window.ytPlaylistLength = 0;

    const url = document.getElementById('m-url').value.trim();

    if (!url) return;

    let existingIndex = savedPlaylists.findIndex(p => p.url === url);
    if (existingIndex === -1) {
      let title = "Saved Link";
      if (url.includes('youtube.com') || url.includes('youtu.be')) title = "YouTube";
      savedPlaylists.push({ url, name: title });
      currentPlaylistIndex = savedPlaylists.length - 1;
      saveSettings();
      renderPlaylists();
    } else {
      currentPlaylistIndex = existingIndex;
    }
    // Always render playlist so active state updates
    renderPlaylist();

    const iframe = document.getElementById('player');
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let videoId = '';
      let listId = '';
      
      if (url.includes('youtu.be/')) videoId = url.split('youtu.be/')[1].split('?')[0];
      else if (url.includes('v=')) videoId = url.split('v=')[1].split('&')[0];
      
      if (url.includes('list=')) listId = url.split('list=')[1].split('&')[0];
      
      let finalSrc = '';
      // If we have both, prefer the playlist URL so it doesn't get hard-locked to one specific video index
      if (listId) {
        finalSrc = `https://www.youtube.com/embed/videoseries?list=${listId}&autoplay=1&enablejsapi=1`;
      } else if (videoId) {
        finalSrc = `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1`;
      }
      
      if (finalSrc) {
        iframe.src = finalSrc;
        if (localPlayer) { localPlayer.pause(); localPlayer.style.display = 'none'; }
        iframe.style.display = 'block';
      } else {
        iframe.src = url;
        if (localPlayer) { localPlayer.pause(); localPlayer.style.display = 'none'; }
        iframe.style.display = 'block';
      }
    } else {
      iframe.src = url;
      if (localPlayer) { localPlayer.pause(); localPlayer.style.display = 'none'; }
      iframe.style.display = 'block';
    }
  }

  function handleFileUpload(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const newFiles = files.map(file => ({
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type
    }));
    const wasEmpty = mediaFiles.length === 0;
    mediaFiles = mediaFiles.concat(newFiles);
    
    renderPlaylist();
    showToast(newFiles.length + " file(s) added to temporary playlist.");
    if (wasEmpty) {
      playLocalMedia(0);
    }
    e.target.value = '';
  }

  function renderPlaylist() {
    const container = document.getElementById('playlist-container');
    container.innerHTML = '';
    
    savedPlaylists.forEach((item, index) => {
      const btn = document.createElement('button');
      const isActive = (!localPlayer || localPlayer.style.display === 'none') && (document.getElementById('m-url').value === item.url || index === currentPlaylistIndex);
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
      
      btn.innerHTML = `${iconSvg} <span>${item.name || 'Link '+(index+1)}</span>`;
      btn.onclick = () => {
         currentPlaylistIndex = index;
         document.getElementById('m-url').value = item.url;
         loadMedia();
      };
      container.appendChild(btn);
    });
    
    mediaFiles.forEach((file, index) => {
      const btn = document.createElement('button');
      const isLocalActive = (localPlayer && localPlayer.style.display !== 'none' && index === currentMediaIndex);
      btn.className = `btn ${isLocalActive ? 'active' : ''}`;
      btn.style.cssText = "padding: 8px 16px; font-size: 0.85rem; font-weight: 600; white-space: nowrap; max-width: 180px; overflow: hidden; text-overflow: ellipsis; border-radius: 20px; flex-shrink: 0; display: flex; align-items: center; gap: 6px; transition: all 0.2s ease; border: 1px solid transparent; box-shadow: none;";
      
      let iconSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><circle cx="10" cy="13" r="2"></circle><line x1="10" y1="13" x2="10" y2="18"></line><line x1="10" y1="18" x2="14" y2="15"></line></svg>';
      
      if (isLocalActive) {
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
      btn.innerHTML = `${iconSvg} <span>${file.name}</span>`;
      btn.onclick = () => playLocalMedia(index);
      container.appendChild(btn);
    });
  }

  function renderPlaylists() {
    const container = document.getElementById('modal-playlist-list');
    if (!container) return;
    container.innerHTML = '';
    
    if (savedPlaylists.length === 0) {
      container.innerHTML = '<span style="opacity:0.5; font-size:0.85rem; font-weight:700; text-align:center;">No saved web playlists.</span>';
      return;
    }
    
    savedPlaylists.forEach((item, index) => {
      const row = document.createElement('div');
      row.style.cssText = "display:flex; gap:10px; align-items:center; background:var(--card); padding:10px 12px; border-radius:12px; transition: all 0.2s; border: 2px solid transparent;";
      
      row.draggable = true;
      row.style.cursor = 'grab';
      row.ondragstart = (e) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', index);
        row.style.opacity = '0.4';
        row.style.transform = 'scale(0.98)';
      };
      row.ondragend = (e) => {
        row.style.opacity = '1';
        row.style.transform = 'none';
        renderPlaylists();
    renderPlaylist();
      };
      row.ondragover = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        row.style.border = "2px dashed var(--accent)";
      };
      row.ondragleave = (e) => {
        row.style.border = "2px solid transparent";
      };
      row.ondrop = (e) => {

        e.preventDefault();
        row.style.border = "2px solid transparent";
        const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
        if (isNaN(fromIndex) || fromIndex === index) return;
        const movedItem = savedPlaylists.splice(fromIndex, 1)[0];
        savedPlaylists.splice(index, 0, movedItem);
        if (currentPlaylistIndex === fromIndex) currentPlaylistIndex = index;
        else if (fromIndex < currentPlaylistIndex && index >= currentPlaylistIndex) currentPlaylistIndex--;
        else if (fromIndex > currentPlaylistIndex && index <= currentPlaylistIndex) currentPlaylistIndex++;
        saveSettings();
        renderPlaylists();
    renderPlaylist();
      };

      const dragHandle = document.createElement('span');
      dragHandle.innerText = '⣿';
      dragHandle.style.cssText = "cursor:grab; opacity:0.3; padding:0 4px;";
      
      const autoCheckbox = document.createElement('input');
      autoCheckbox.type = 'checkbox';
      autoCheckbox.title = 'Include in Auto-Play';
      autoCheckbox.checked = item.autoplay !== false;
      autoCheckbox.style.cursor = 'pointer';
      autoCheckbox.onchange = (e) => {
        savedPlaylists[index].autoplay = e.target.checked;
        saveSettings();
      };
      
      const playBtn = document.createElement('button');
      playBtn.className = `btn btn-ghost ${index === currentPlaylistIndex ? 'active' : ''}`;
      playBtn.style.cssText = "padding:4px 8px; font-weight:bold;";
      if (index === currentPlaylistIndex) playBtn.style.background = 'var(--accent)';
      playBtn.innerText = '▶';
      playBtn.title = "Play";
      playBtn.onclick = () => {

        currentPlaylistIndex = index;
        document.getElementById('m-url').value = savedPlaylists[currentPlaylistIndex].url;
        loadMedia();
        renderPlaylists();
    renderPlaylist();
      };
      
      const nameInput = document.createElement('input');
      nameInput.type = 'text';
      nameInput.value = item.name;
      nameInput.style.cssText = "flex:1; border:none; background:transparent; font-size:0.9rem; font-family:inherit; color:inherit; outline:none; font-weight:600;";
      nameInput.onchange = (e) => {
        savedPlaylists[index].name = e.target.value;
        saveSettings();
        renderPlaylist();
      };
      
      const delBtn = document.createElement('button');
      delBtn.className = 'btn btn-ghost';
      delBtn.style.cssText = "padding:4px; color:var(--accent-text);";
      delBtn.innerText = '×';
      delBtn.onclick = () => {

        savedPlaylists.splice(index, 1);
        if (currentPlaylistIndex >= savedPlaylists.length) currentPlaylistIndex = Math.max(0, savedPlaylists.length - 1);
        saveSettings();
        renderPlaylists();
    renderPlaylist();
      };
      
      row.appendChild(dragHandle);
      row.appendChild(autoCheckbox);
      row.appendChild(playBtn);
      row.appendChild(nameInput);
      row.appendChild(delBtn);
      
      container.appendChild(row);
    });
  }

  function playLocalMedia(index) {
    if (!mediaFiles.length || index < 0 || index >= mediaFiles.length) return;
    currentMediaIndex = index;
    renderPlaylist();
    
    let iframe = document.getElementById('player');
    iframe.style.display = 'none';
    iframe.src = 'about:blank'; // stop iframe

    if (!localPlayer) {
      localPlayer = document.createElement('video'); // use video to support both audio and video
      localPlayer.style.width = '100%';
      localPlayer.style.height = '100%';
      localPlayer.style.position = 'absolute';
      localPlayer.style.top = '0';
      localPlayer.style.left = '0';
      localPlayer.style.borderRadius = '1.5rem';
      localPlayer.style.outline = 'none';
      localPlayer.controls = true;
      localPlayer.autoplay = true;
      localPlayer.onended = nextTrack;
      document.querySelector('.iframe-area').appendChild(localPlayer);
    }
    
    

  function togglePlayMedia() {
    if (localPlayer && localPlayer.style.display !== 'none') {
      if (localPlayer.paused) localPlayer.play();
      else localPlayer.pause();
    } else {
      const iframe = document.getElementById('player');
      if (iframe && (iframe.src.includes('youtube.com') || iframe.src.includes('youtu.be'))) {
        isYtPlaying = !isYtPlaying;
        const cmd = isYtPlaying ? 'playVideo' : 'pauseVideo';
        iframe.contentWindow.postMessage(JSON.stringify({event: 'command', func: cmd, args: []}), '*');
      }
    }
  }

  function startMedia() {
    loadMedia();
    togglePlayMedia();
  }

  function stopMedia() {
    const iframe = document.getElementById('player');
    iframe.src = 'about:blank';
    if (localPlayer) {
      localPlayer.pause();
      localPlayer.src = '';
      localPlayer.style.display = 'none';
    }
    mediaFiles = [];
    renderPlaylist();
  }

  function toggleMuteMedia() {
    if (localPlayer && localPlayer.style.display !== 'none') {
      localPlayer.muted = !localPlayer.muted;
    } else {
      const iframe = document.getElementById('player');
      if (iframe && (iframe.src.includes('youtube.com') || iframe.src.includes('youtu.be'))) {
        isYtMuted = !isYtMuted;
        const cmd = isYtMuted ? 'mute' : 'unMute';
        iframe.contentWindow.postMessage(JSON.stringify({event: 'command', func: cmd, args: []}), '*');
      }
    }
  }


  function autoNextMedia() { nextTrack(); }
  function autoPrevMedia() { prevTrack(); }

  
  // --- UNIFIED NAVIGATION SYSTEM ---
  function goToNextMedia() {
    let q = getMacroQueue();
    if (q.length === 0) return;
    let curr = getCurrentMacroIndex(q);
    let next = curr + 1;
    if (next >= q.length) return; // Rule 5: boundary limit
    playMacroItem(next, q, 1);
  }

  function goToPreviousMedia() {
    let q = getMacroQueue();
    if (q.length === 0) return;
    let curr = getCurrentMacroIndex(q);
    let prev = curr - 1;
    if (prev < 0) return; // Rule 5: boundary limit
    playMacroItem(prev, q, -1);
  }

  function goToNextItem() {
    let q = getMacroQueue();
    if (q.length === 0) return;
    let curr = getCurrentMacroIndex(q);
    let item = q[curr];

    if (item.type === 'local') {
       if (currentMediaIndex < item.items.length - 1) {
           playLocalMedia(currentMediaIndex + 1);
       } else {
           goToNextMedia();
       }
    } else {
       const iframe = document.getElementById('player');
       if (iframe && (iframe.src.includes('youtube.com') || iframe.src.includes('youtu.be'))) {
           let ytLen = window.ytPlaylistLength || 1;
           let ytIdx = window.ytPlaylistIndex || 0;
           if (ytLen > 1 && ytIdx < ytLen - 1) {
               window.ytPlaylistIndex++; // Optimistically update index
               iframe.contentWindow.postMessage(JSON.stringify({event: 'command', func: 'nextVideo', args: []}), '*');
           } else {
               goToNextMedia();
           }
       } else {
           goToNextMedia();
       }
    }
  }

  function goToPreviousItem() {
    let q = getMacroQueue();
    if (q.length === 0) return;
    let curr = getCurrentMacroIndex(q);
    let item = q[curr];

    if (item.type === 'local') {
       if (currentMediaIndex > 0) {
           playLocalMedia(currentMediaIndex - 1);
       } else {
           goToPreviousMedia();
       }
    } else {
       const iframe = document.getElementById('player');
       if (iframe && (iframe.src.includes('youtube.com') || iframe.src.includes('youtu.be'))) {
           let ytIdx = window.ytPlaylistIndex || 0;
           if (ytIdx > 0) {
               window.ytPlaylistIndex--; // Optimistically update index
               iframe.contentWindow.postMessage(JSON.stringify({event: 'command', func: 'previousVideo', args: []}), '*');
           } else {
               goToPreviousMedia();
           }
       } else {
           goToPreviousMedia();
       }
    }
  }

  // ALIASES for UI buttons (which were calling nextTrack, nextPlaylist etc)
  function nextPlaylist() { goToNextMedia(); }
  function prevPlaylist() { goToPreviousMedia(); }
  function nextTrack() { goToNextItem(); }
  function prevTrack() { goToPreviousItem(); }

    
    localPlayer.style.display = 'block';
    localPlayer.src = mediaFiles[index].url;
    localPlayer.play().catch(e => { console.log('Auto-play prevented', e); showToast('Auto-play blocked. Please click play.'); });
  }

  function togglePlayMedia() {
    if (localPlayer && localPlayer.style.display !== 'none') {
      if (localPlayer.paused) localPlayer.play();
      else localPlayer.pause();
    } else {
      const iframe = document.getElementById('player');
      if (iframe && (iframe.src.includes('youtube.com') || iframe.src.includes('youtu.be'))) {
        isYtPlaying = !isYtPlaying;
        const cmd = isYtPlaying ? 'playVideo' : 'pauseVideo';
        iframe.contentWindow.postMessage(JSON.stringify({event: 'command', func: cmd, args: []}), '*');
      }
    }
  }

  function startMedia() {
    loadMedia();
    togglePlayMedia();
  }

  function stopMedia() {
    const iframe = document.getElementById('player');
    iframe.src = 'about:blank';
    if (localPlayer) {
      localPlayer.pause();
      localPlayer.src = '';
      localPlayer.style.display = 'none';
    }
    mediaFiles = [];
    renderPlaylist();
  }

  function toggleMuteMedia() {
    if (localPlayer && localPlayer.style.display !== 'none') {
      localPlayer.muted = !localPlayer.muted;
    } else {
      const iframe = document.getElementById('player');
      if (iframe && (iframe.src.includes('youtube.com') || iframe.src.includes('youtu.be'))) {
        isYtMuted = !isYtMuted;
        const cmd = isYtMuted ? 'mute' : 'unMute';
        iframe.contentWindow.postMessage(JSON.stringify({event: 'command', func: cmd, args: []}), '*');
      }
    }
  }


  function autoNextMedia() { nextTrack(); }
  function autoPrevMedia() { prevTrack(); }

  function nextPlaylist() {
    let q = getMacroQueue();
    if (q.length === 0) return;
    playMacroItem(getCurrentMacroIndex(q) + 1, q, 1);
  }

  function prevPlaylist() {
    let q = getMacroQueue();
    if (q.length === 0) return;
    playMacroItem(getCurrentMacroIndex(q) - 1, q, -1);
  }

      function nextTrack() {
    if (localPlayer && localPlayer.style.display !== 'none' && mediaFiles.length > 0) {
      if (currentMediaIndex >= mediaFiles.length - 1) {
        nextPlaylist();
      } else {
        playLocalMedia(currentMediaIndex + 1);
      }
    } else {
      const iframe = document.getElementById('player');
      if (iframe && (iframe.src.includes('youtube.com') || iframe.src.includes('youtu.be'))) {
        if (iframe.src.includes('list=') || window.ytPlaylistLength > 1) {
          if (window.ytPlaylistLength > 1 && window.ytPlaylistIndex >= window.ytPlaylistLength - 1) {
            nextPlaylist();
          } else {
            iframe.contentWindow.postMessage(JSON.stringify({event: 'command', func: 'nextVideo', args: []}), '*');
          }
        } else {
          nextPlaylist();
        }
      } else {
        nextPlaylist();
      }
    }
  }

  function prevTrack() {
    if (localPlayer && localPlayer.style.display !== 'none' && mediaFiles.length > 0) {
      if (currentMediaIndex <= 0) {
        prevPlaylist();
      } else {
        playLocalMedia(currentMediaIndex - 1);
      }
    } else {
      const iframe = document.getElementById('player');
      if (iframe && (iframe.src.includes('youtube.com') || iframe.src.includes('youtu.be'))) {
        if (iframe.src.includes('list=') || window.ytPlaylistLength > 1) {
          if (window.ytPlaylistIndex === 0) {
            prevPlaylist();
          } else {
            iframe.contentWindow.postMessage(JSON.stringify({event: 'command', func: 'previousVideo', args: []}), '*');
          }
        } else {
          prevPlaylist();
        }
      } else {
        prevPlaylist();
      }
    }
  }

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
    }
  });
}
