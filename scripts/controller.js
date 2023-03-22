import EventEmitter from './emitter.js'
import { ToneGenerator } from './generator.js'

const { Buff } = window.buffUtils

export class ToneController extends EventEmitter {
  constructor(toneEmitter, config = {}) {
    super()
    this.config  = config
    this.source  = toneEmitter
    this.sounds  = new ToneGenerator()
    this.stage   = null
    this.state   = null
    this.msgSize = null
    this.winSize = null
    this.chkSize = 6
    this.buffer  = []
    this.chunks  = []
    this.reset()

    this.source.on('ctrl', (value) => {
      switch (value) {
        case 'start':
          return this.start()
        case 'stop':
          return this.stop()
        case 'ack':
          return this.ack()
        case 'nack':
          return this.nack()
        default:
          console.log('ctrl:', value)
          return 
      }
    })

    this.source.on('data', (value) => {
      // If state is null, ignore data.
      if (this.stage === null) return
      if (this.state === null) return
      // If state is init, continue.
      if (this.stage === 'recvParams') {
        if (this.state === 'ready') {
          this.setMsgParams(value)
        }
      }
      if (this.stage === 'recvFrame') {
        if (this.state === 'ready') {
          this.setFrameData(value)
        }
      }
    })
  }

  get buffSize () {
    return this.winSize + this.chkSize
  }

  get totalFrames () {
    return Math.ceil(this.msgSize / this.winSize)
  }

  get windowCount () {
    return this.chunks.length
  }

  reset() {
    this.buffer  = []
    this.frames  = []
    this.msgSize = null
    this.winSize = null
  }

  start() {
    if (this.stage === null) {
      this.stage = 'recvParams'
    }
    if (this.stage === 'recvParams') {
      this.reset()
      this.state = 'ready'
    }
    if (this.stage === 'recvFrame') {
      if (!this.checkMsgState()) {
        console.log('Resetting to stage: recvParams')
        this.stage = 'recvParams'
      }
      this.buffer = []
      this.state  = 'ready'
    }
  }

  stop() {
    // If no stage is set, ignore.
    if (this.stage === null) return
    // If at params stage, start flow.
    if (this.stage === 'recvParams') {
      if (this.state === 'confirm') {
        if (!this.checkMsgState()) {
          console.log('Failed to set message params!')
          this.reset()
          this.sounds.nack()
        } else {
          this.stage = 'recvFrame'
          this.state = 'ready'
          this.sounds.ack()
          console.log(this)
          return
        }
      }
    }
    if (this.stage === 'recvFrame') {
      if (this.state === 'confirm') {
        if (this.checkBuffer()) {
          this.state = 'ready'
          this.sounds.ack()
        } else {
          this.sounds.nack()
          this.state  = 'ready'
        }
      }
    }
  }

  ack() {
    if (this.state === 'confirm') {
      this.state === 'accepted'
    }
  }

  nack() {
    if (this.state === 'confirm') {
      this.state === 'rejected'
    }
  }

  parseInt (value) {
    const len = this.buffer.length
    if (len === 0) {
      this.buffer.push(value)
      console.log(this.buffer, this.buffer.length)
      return null
    } else if (len === 1) {
      const num = Buff.of(this.buffer[0], value).num
      console.log('Parsed value:', num)
      this.buffer = []
      return num
    } else {
      console.log('buffer overflow:', this.buffer)
    }
  }

  setMsgParams (value) {
    const val = this.parseInt(value)
    if (val === null) return
    if (this.msgSize === null) {
      this.msgSize = val
      return
    }
    if (this.winSize === null) {
      this.winSize = val
      this.buffer  = []
      this.state   = 'confirm'
    }
  }

  get windowSize () {
    const current = this.chunks.length
    const isFinal = current + 1 === this.totalFrames
    // return (isFinal) 
    //   ? 
    //   : this.winSize
  }

  setFrameData (value) {
    this.buffer.push(value)
    const len   = this.buffer.length
    if (len === this.buffSize) {
      const payload = Buff.of(...this.buffer)
      const data    = payload.slice(this.checkSize).hex
      const chksum  = payload.slice(0, this.chkSize).hex
      const calcsum = Buff.hex(data).digest.slice(0, 3).hex
      if (chksum !== calcsum) {
        console.log('checksum failed!')
        console.log(payload, chksum, calcsum)
        this.state = 'error'
      } else {
        this.chunks.push([...this.buffer])
        this.state = 'confirm'
      }
      this.buffer = []
    }
    console.log('current buffer:', this.buffer, this.chunks)
  }

  checkMsgState () {
    if (
      this.msgSize === null ||
      this.winSize === null
    ) {
      console.log('Failed to set message paramaters!')
      return false
    } else { return true }
  }

  checkBuffer () {
    return true
  }

}


