function playSound(hertz, ms) {
  const a = new AudioContext();
  const oscillator = a.createOscillator();
  oscillator.type="sine";
  const gainNode = a.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(a.destination);
  oscillator.frequency.value=hertz;
  oscillator.start();
  setTimeout(()=>{
    oscillator.stop();
  }, ms);
}

export class ToneGenerator {
  constructor(length = 100) {
    this.length = length
  }

  start() {
    playSound(697, this.length)
    playSound(1776, this.length)
  }

  stop() {
    playSound(770, this.length)
    playSound(1913, this.length)
  }

  ack() {
    playSound(697, this.length)
    playSound(1913, this.length)
  }

  nack() {
    playSound(770, this.length)
    playSound(1776, this.length)
  }
}