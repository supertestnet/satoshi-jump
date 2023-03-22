import { visualize }      from './visualizer.js'
import { ToneEmitter }    from './tone.js'
import { ToneController } from './controller.js'

const { Buff } = window.buffUtils

globalThis.globalStream = null

const msgbox   = document.querySelector('#msgBox')
const feedbox  = document.querySelector('#feed')

const testMsg = 'god'
const hex = Buff.str(testMsg).hex
console.log('test:', testMsg)
console.log('length:', hex.length)
console.log('hex:', hex)
console.log('chksum:', Buff.hex(hex).digest.slice(-3).hex)


if (navigator.mediaDevices.getUserMedia) {
  console.log('getUserMedia supported.');

  const constraints = { audio: true };

  const onSuccess = (stream) => {
    globalThis.globalStream = stream
    visualize(stream)

    const emitter = new ToneEmitter(stream)

    let add_to_buffer = false
    let messageBuffer = ''
    let message       = ''
    let feedbuffer = []

    emitter.on('*', (eventName, value) => {
      feedbuffer.push(`${eventName}: ${value}`)
      feedbox.innerText = feedbuffer.join('\n')
      // console.log(eventName, value)
      if (feedbuffer.length > 2) feedbuffer.shift()
    })

    emitter.on('data', (value) => {
      if ( add_to_buffer ) {
        messageBuffer += value;
        feedbox.innerText = messageBuffer
      }

      console.log('emit:', value)
    })

    emitter.on('ctrl', (value) => {
      if (value === 'start') {
        add_to_buffer = true;
        messageBuffer = "";
        console.log('emit: start')
      }
      if (value === 'stop') {
        
        add_to_buffer = false;
        console.log('emit: stop')
        console.log( 'message buffer:', messageBuffer );
        message = Buff.hex( messageBuffer ).str
        console.log( 'message:', message );
        msgbox.innerText = message
      }
    })

    // const controller = new ToneController(emitter)

    emitter.listen()
  }

  const onError = (err) => {
    console.log('The following error occured: ' + err);
  }

  navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);

} else {
   console.log('getUserMedia not supported on your browser!');
}

