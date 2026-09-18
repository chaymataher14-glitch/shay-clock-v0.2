const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');

const newQuotes = `const QUOTES = {
    motivation: [
      "Don't stop when you're tired. Stop when you're done.",
      "The hard days are what make you stronger.",
      "If you want something you never had, you have to do something you've never done.",
      "Push yourself, because no one else is going to do it for you.",
      "Great things never come from comfort zones.",
      "Dream it. Wish it. Do it.",
      "Success doesn’t just find you. You have to go out and get it.",
      "The harder you work for something, the greater you’ll feel when you achieve it.",
      "Dream bigger. Do bigger.",
      "Don’t stop until you’re proud.",
      "Wake up with determination. Go to bed with satisfaction.",
      "Do something today that your future self will thank you for.",
      "Little things make big days.",
      "It’s going to be hard, but hard does not mean impossible.",
      "Don’t wait for opportunity. Create it.",
      "Sometimes we’re tested not to show our weaknesses, but to discover our strengths.",
      "The key to success is to focus on goals, not obstacles.",
      "Prove them wrong."
    ],
    inspiration: [
      "Every moment is a fresh beginning.",
      "Believe you can and you're halfway there.",
      "Your limitation—it's only your imagination.",
      "Sometimes later becomes never. Do it now.",
      "Great things are done by a series of small things brought together.",
      "The secret of getting ahead is getting started.",
      "If you can dream it, you can do it.",
      "Everything you can imagine is real.",
      "Whatever you are, be a good one.",
      "Do what you can, with what you have, where you are.",
      "It always seems impossible until it is done.",
      "Keep your face always toward the sunshine—and shadows will fall behind you.",
      "What defines us is how well we rise after falling.",
      "Turn your wounds into wisdom.",
      "You are never too old to set another goal or to dream a new dream.",
      "Be the change that you wish to see in the world."
    ],
    stoic: [
      "We suffer more often in imagination than in reality. – Seneca",
      "Waste no more time arguing what a good man should be. Be one. – Marcus Aurelius",
      "He who fears death will never do anything worth of a man who is alive. – Seneca",
      "You have power over your mind - not outside events. Realize this, and you will find strength. – Marcus Aurelius",
      "It is not death that a man should fear, but he should fear never beginning to live. – Marcus Aurelius",
      "First say to yourself what you would be; and then do what you have to do. – Epictetus",
      "No man is free who is not master of himself. – Epictetus",
      "If it is not right do not do it; if it is not true do not say it. – Marcus Aurelius",
      "The best revenge is not to be like your enemy. – Marcus Aurelius",
      "Wealth consists not in having great possessions, but in having few wants. – Epictetus",
      "Man is not worried by real problems so much as by his imagined anxieties about real problems. – Epictetus",
      "Difficulties strengthen the mind, as labor does the body. – Seneca",
      "Fate leads the willing, and drags along the reluctant. – Cleanthes"
    ],
    islamic: [
      "Indeed, with hardship [will be] ease. (Quran 94:6)",
      "And He found you lost and guided [you]. (Quran 93:7)",
      "So be patient. Indeed, the promise of Allah is truth. (Quran 30:60)",
      "Do not lose hope, nor be sad. (Quran 3:139)",
      "Allah does not burden a soul beyond that it can bear. (Quran 2:286)",
      "And whoever relies upon Allah - then He is sufficient for him. (Quran 65:3)",
      "My mercy encompasses all things. (Quran 7:156)",
      "Call upon Me; I will respond to you. (Quran 40:60)",
      "And He is with you wherever you are. (Quran 57:4)",
      "The best of people are those that bring most benefit to the rest of mankind. (Hadith)",
      "Patience is a pillar of faith. (Hadith)",
      "Take advantage of five before five: your youth before your old age, your health before your illness, your riches before your poverty, your free time before your work, and your life before your death. (Hadith)",
      "A good word is charity. (Hadith)",
      "The strongest among you is the one who controls his anger. (Hadith)"
    ],
    mindfulness: [
      "Wherever you are, be there totally.",
      "Breath is the bridge which connects life to consciousness.",
      "The present moment is the only time over which we have dominion.",
      "Walk as if you are kissing the Earth with your feet.",
      "Feelings come and go like clouds in a windy sky. Conscious breathing is my anchor.",
      "Quiet the mind, and the soul will speak.",
      "Mindfulness is a way of befriending ourselves and our experience.",
      "Do not ruin today with mourning tomorrow.",
      "To understand the immeasurable, the mind must be extraordinarily quiet, still.",
      "Breathe. Let go. And remind yourself that this very moment is the only one you know you have for sure.",
      "Nothing ever goes away until it has taught us what we need to know.",
      "Tension is who you think you should be. Relaxation is who you are.",
      "Respond; don’t react. Listen; don’t talk. Think; don’t assume."
    ],
    productivity: [
      "Focus on being productive instead of busy.",
      "Action is the foundational key to all success.",
      "Amateurs sit and wait for inspiration, the rest of us just get up and go to work.",
      "Your mind is for having ideas, not holding them.",
      "You don’t need a new plan for next year. You need a commitment.",
      "Until we can manage time, we can manage nothing else.",
      "Starve your distractions, feed your focus.",
      "Don't major in minor things.",
      "A year from now you may wish you had started today.",
      "Strive not to be a success, but rather to be of value.",
      "The way to get started is to quit talking and begin doing.",
      "One of the great challenges of our age, in which the tools of our productivity are also the tools of our distraction, is to decide how to direct our attention.",
      "Nothing is less productive than to make more efficient what should not be done at all.",
      "Someday is not a day of the week."
    ]
  };`;

const startIndex = content.indexOf('const QUOTES = {');
const endIndex = content.indexOf('  };', startIndex) + 4;

if (startIndex === -1 || endIndex < startIndex) {
  console.log("Could not find QUOTES block");
  process.exit(1);
}

const before = content.substring(0, startIndex);
const after = content.substring(endIndex);

fs.writeFileSync('index.html', before + newQuotes + after);
console.log("Replaced quotes.");
