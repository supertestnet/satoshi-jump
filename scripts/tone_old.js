const tone_map = {
  2500 : 212,
  2000 : 171
}

export class ToneListener {

  constructor (stream, tones, config = {}) {
    
    this.ctx      = new AudioContext()
    this.source   = this.ctx.createMediaStreamSource(stream)
    this.analyser = this.ctx.createAnalyser()

    this.analyser.fftSize = config.fftSize || 4096
    this.thold    = config.thold           || 200
    this.buffer   = new Uint8Array(this.buffSize)
    this.tones    = tones

    this.source.connect(this.analyser)
  }

  get buffSize () {
    return this.analyser.frequencyBinCount
  }

  get fftSize () {
    return this.analyser.fftSize
  }

  get freqmap () {
    return Object.fromEntries(this.entries)
  }

  get entries () {
    return this.tones.map(e => [e, false])
  }

  get sample () {
    this.analyser.getByteFrequencyData(this.buffer)
    const freqmap = this.freqmap
    for (const t of this.tones) {
      const idx = tone_map[t]
      freqmap[t] = (this.buffer[idx] > this.thold)
    }
    return freqmap
  }

  get max () {
    this.analyser.getByteFrequencyData(this.buffer)
    let idx = 0, max = 0
    for (let i = 0; i < this.buffSize; i++) {
      const curr = this.buffer[i]
      if (curr > max) {
        idx = i
        max = curr
      }
    }
    return [ idx, max ]
  }

  getFrame({
    frame_duration = 100,
    sample_period  = 10,
    hit_threshold  = 0.5,
  }) {
    // Initialize our samples object.
    const samples = {}
    // Setup our sampler.
    const sampler = setInterval(() => {
      // Grab the current sample.
      const sample = this.sample
      // Iterate through the records in the sample.
      for (const [ k, v ] of Object.entries(sample)) {
        // If key in samples is not an array, create it.
        if (!Array.isArray(samples[k])) {
          samples[k] = []
        }
        // Push sample to the matching key in samples array.
        samples[k].push(sample[k])
      }
    }, sample_period)
    // Clear the sampler after the duration has passed.
    
    // console.log('samples:', samples)
    
    return new Promise((res, rej) => {
      setTimeout(() => {
        clearInterval(sampler)
        const map = this.freqmap
        const thold = (frame_duration / sample_period) * hit_threshold
        for (const key of Object.keys(samples)) {
          // console.log('key:', key)
          // console.log('sample:', samples[key])
          const hits = samples[key].filter(e => e === true).length
          map[key] = (hits >= thold)
        }
        res(map)
      }, frame_duration)
    })
  }
}
