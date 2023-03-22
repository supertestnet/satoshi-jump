const tone_map = {
  '1': [ 697, 1209 ],
  '2': [ 697, 1336 ],
  '3': [ 697, 1477 ],
  'A': [ 697, 1633 ],
  'start': [ 697, 1776 ],
  'ack' : [ 697, 1913 ],
  '4': [ 770, 1209 ],
  '5': [ 770, 1336 ],
  '6': [ 770, 1477 ],
  'B': [ 770, 1633 ],
  'nack': [ 770, 1776 ],
  'stop': [ 770, 1913 ],
  '7': [ 852, 1209 ],
  '8': [ 852, 1336 ],
  '9': [ 852, 1477 ],
  'C': [ 852, 1633 ],
  'E': [ 941, 1209 ],
  '0': [ 941, 1336 ],
  'F': [ 941, 1477 ],
  'D': [ 941, 1633 ]
}

export class ToneGenerator {
  constructor(length = 100) {
    this.length = length
    this.ctx    = new AudioContext()
    this.osc    = this.ctx.createOscillator()
    this.gain   = this.ctx.createGain()
    this.osc.connect(this.gain)
    this.gain.connect(this.ctx.destination)

    this.osc.type='sine'
  }

  play(hertz, ms) {
    this.osc.frequency.value = hertz
    this.osc.start()
    setTimeout(()=>{
      this.osc.stop()
    }, ms)
  }

  tone(key) {
    const tones = tone_map[key]
    for (const t of tones) {
      this.play(t, this.length)
    }
  }

  start() {
    this.play(697, this.length)
    this.play(1776, this.length)
  }

  stop() {
    this.play(770, this.length)
    this.play(1913, this.length)
  }

  ack() {
    this.play(697, this.length)
    this.play(1913, this.length)
  }

  nack() {
    this.play(770, this.length)
    this.play(1776, this.length)
  }
}