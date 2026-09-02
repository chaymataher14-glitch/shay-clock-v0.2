const fs = require('fs');

let code = fs.readFileSync('index.html', 'utf8');

// 1. Quotes logic
const quotesLogic = `
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
`;

// Replace the stubs with full logic
code = code.replace(/function toggleQuotes[\s\S]*?function setQuoteCategory[^{]*{[^}]*}[\s]*function toggleFlipAnim/m, quotesLogic + '\n  function toggleFlipAnim');

// 2. Playlists logic
const playlistsLogic = `
  let savedPlaylists = [
    "https://www.youtube.com/watch?v=jfKfPfyJRdk", // Lofi Girl 
    "https://www.youtube.com/watch?v=4xDzrXgR73I", // Synthwave
    "https://www.youtube.com/watch?v=lTRiuFIWV54", // Chillhop
    "https://www.youtube.com/watch?v=tfBVp0Zi2iE", // Classical
    "https://www.youtube.com/watch?v=qH3fOUNDhOU", // Nature Sounds
    "https://www.youtube.com/watch?v=MVPTGNGiI-4"  // Rain sounds
  ];

  function nextPlaylist() {
    if (savedPlaylists.length === 0) return;
    currentPlaylistIndex = (currentPlaylistIndex + 1) % savedPlaylists.length;
    document.getElementById('m-url').value = savedPlaylists[currentPlaylistIndex];
    loadMedia();
  }

  function prevPlaylist() {
    if (savedPlaylists.length === 0) return;
    currentPlaylistIndex = (currentPlaylistIndex - 1 + savedPlaylists.length) % savedPlaylists.length;
    document.getElementById('m-url').value = savedPlaylists[currentPlaylistIndex];
    loadMedia();
  }
`;

code = code.replace(/function nextPlaylist[^{]*{[^}]*}[\s]*function prevPlaylist[^{]*{[^}]*}/m, playlistsLogic);

// Wait, replace the empty 'let savedPlaylists = [];' to avoid duplicate definitions
code = code.replace(/let savedPlaylists = \[\];/, '/* savedPlaylists moved */');

fs.writeFileSync('index.html', code);
console.log('Patched features');
