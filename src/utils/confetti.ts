import confetti from 'canvas-confetti';

export function fireAchievementConfetti() {
  if (typeof window === 'undefined') return;
  try {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#fa9549', '#facc15', '#38bdf8', '#4ade80', '#fbbf24'],
    });
  } catch (_) {
    // Graceful fallback if canvas is not supported
  }
}
