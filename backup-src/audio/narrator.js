export class Narrator {
  constructor() {
    this.enabled = true;
    this.activeTitle = '';
    this.button = document.getElementById('btn-mute');
    this.progressBar = document.getElementById('read-progress');
    this.button.addEventListener('click', () => this.toggle());
  }

  toggle() {
    this.enabled = !this.enabled;
    this.button.innerText = this.enabled ? '🔊 Matikan Narator' : '🔈 Nyalakan Narator';
    if (!this.enabled) window.speechSynthesis.cancel();
  }

  speak(title, text) {
    if (!this.enabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const fullText = `${title}. ${text}`;
    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.lang = 'id-ID';
    utterance.rate = 0.95;
    utterance.pitch = 1;

    if (this.progressBar) {
      this.progressBar.style.transition = 'none';
      this.progressBar.style.width = '0%';
      utterance.onstart = () => {
        const estTime = (fullText.length / 15) * 1000;
        this.progressBar.style.transition = `width ${estTime}ms linear`;
        this.progressBar.style.width = '100%';
      };
      utterance.onend = () => { this.progressBar.style.width = '0%'; };
    }

    window.speechSynthesis.speak(utterance);
  }

  stop() {
    this.activeTitle = '';
    window.speechSynthesis.cancel();
  }
}
