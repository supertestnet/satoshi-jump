export function visualize (stream) {
  const canvas       = document.querySelector('.visualizer')
  const canvasCtx    = canvas.getContext('2d')
  const ctx          = new AudioContext()
  const source       = ctx.createMediaStreamSource(stream)
  const analyser     = ctx.createAnalyser()
  analyser.fftSize   = 4096
  const bufferLength = analyser.frequencyBinCount
  const dataArray    = new Uint8Array(bufferLength)

  source.connect(analyser)

  draw()

  function draw() {
    const WIDTH = canvas.width
    const HEIGHT = canvas.height;

    requestAnimationFrame(draw);

    analyser.getByteTimeDomainData(dataArray);

    canvasCtx.fillStyle = 'rgb(200, 200, 200)';
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

    canvasCtx.beginPath();

    let sliceWidth = WIDTH * 1.0 / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i += 1) {

      let v = dataArray[i] / 128.0;
      let y = v * HEIGHT/2;

      if(i === 0) {
        canvasCtx.moveTo(x, y);
      } else {
        canvasCtx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    canvasCtx.lineTo(canvas.width, canvas.height / 2)
    canvasCtx.stroke()
  }
}
