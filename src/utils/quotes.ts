// Quotes for the calendar app
// Extracted from QUOTES.md

export const QUOTES = [
  "The best time to plant a tree was 20 years ago. The second best time is now.",
  "Every day is a fresh start.",
  "Time you enjoy wasting is not wasted time.",
  "The future depends on what you do today.",
  "Make each day your masterpiece.",
  "Life is what happens when you're busy making other plans.",
  "The only way to do great work is to love what you do.",
  "Don't count the days, make the days count.",
  "Yesterday is history, tomorrow is a mystery, but today is a gift.",
  "Time flies over us, but leaves its shadow behind.",
  "The two most powerful warriors are patience and time.",
  "Lost time is never found again.",
  "An investment in knowledge pays the best interest.",
  "The secret of getting ahead is getting started.",
  "Do not dwell in the past, do not dream of the future, concentrate the mind on the present moment.",
  "Time is the most valuable thing a man can spend.",
  "The bad news is time flies. The good news is you're the pilot.",
  "Time is what we want most, but what we use worst.",
  "The key is in not spending time, but in investing it.",
  "Your time is limited, don't waste it living someone else's life.",
  "Time is a created thing. To say 'I don't have time' is to say 'I don't want to.'",
  "The trouble is, you think you have time.",
  "They always say time changes things, but you actually have to change them yourself.",
  "Time is the wisest counselor of all.",
  "Time and tide wait for no man.",
  "We must use time creatively.",
  "Better three hours too soon than a minute too late.",
  "Time stays long enough for anyone who will use it.",
  "The future starts today, not tomorrow.",
  "One day or day one. You decide.",
];

export const getRandomQuote = (): string => {
  const randomIndex = Math.floor(Math.random() * QUOTES.length);
  return QUOTES[randomIndex];
};
