export function speakText(text: string) {
  if (typeof window === "undefined") return;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 1;
  utterance.pitch = 1;

  window.speechSynthesis.cancel(); // stop previous speech
  window.speechSynthesis.speak(utterance);
}