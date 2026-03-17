export function speak(word: string) {
  if (typeof window === "undefined") return;
  if (!("speechSynthesis" in window)) return;

  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(word);
  u.rate = 0.8;
  u.pitch = 1.1;
  window.speechSynthesis.speak(u);
}

