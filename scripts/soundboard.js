import { ToneGenerator }  from './generator.js'

const startBtn = document.querySelector('#start')
const stopBtn  = document.querySelector('#stop')
const ackBtn   = document.querySelector('#ack')
const nackBtn  = document.querySelector('#nack')

const generator = new ToneGenerator()

startBtn.addEventListener('click', () => {
  generator.start()
})
stopBtn.addEventListener('click', () => {
  generator.stop()
})
ackBtn.addEventListener('click', () => {
  generator.ack()
})
nackBtn.addEventListener('click', () => {
  generator.nack()
})