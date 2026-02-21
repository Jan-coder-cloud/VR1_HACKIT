export function speakText(text: string, lang : string) {
  if (typeof window === "undefined") return;

  const utterance = new SpeechSynthesisUtterance(text);

  utterance.lang = lang;
  utterance.rate = 0.1;
  utterance.pitch = 1;

  // Select best matching voice
  const voices = window.speechSynthesis.getVoices();

  const selectedVoice = voices.find(
    (voice) => voice.lang === lang
  );

  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

