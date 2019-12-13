const ctx = display.getContext("2d");
const W = (display.width = innerWidth);
const H = (display.height = innerHeight);

class Visualizer {
  constructor(track) {
    this.track = track;
    this.frameIndex = 0;
    this.destW = W / 2;
    this.destH = H / 6;
    this.destWShift = W / 2;
    this.destHShift = H / 3;
    this.zoom = 1.02;
    this.initAudio();
    this.initAudioContext();
    this.initAnalyzer();
  }

  initAudio() {
    this.audio = new Audio(this.track);
    this.audio.autoplay = true;
    this.audio.loop = true;
  }

  initAudioContext() {
    this.ac = new AudioContext();
    this.source = this.ac.createMediaElementSource(this.audio);
    this.source.connect(this.ac.destination);
  }

  initAnalyzer() {
    this.analyser = this.ac.createAnalyser();
    this.analyser.fftSize = 256;
    this.source.connect(this.analyser);
  }

  renderFrame(ms) {
    requestAnimationFrame(this.renderFrame.bind(this));
    this.frameIndex++;

    // get audio data
    this.audioData = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(this.audioData);

    // prepare canvas
    ctx.fillStyle = "rgba(0,0,0,.02)";
    ctx.fillRect(0, 0, W, H);
    ctx.save();

    // define destination image
    ctx.translate(this.destWShift, this.destHShift);
    ctx.lineWidth = 4;

    // draw destination image
    // See https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
    ctx.drawImage(
      display,
      0, // The X coordinate in the destination canvas at which to place the top-left corner of the source image.
      0, // The Y coordinate in the destination canvas at which to place the top-left corner of the source image.
      W, // The width to draw the image in the destination canvas. This allows scaling of the drawn image. If not specified, the image is not scaled in width when drawn.
      H, // The height to draw the image in the destination canvas. This allows scaling of the drawn image. If not specified, the image is not scaled in height when drawn.
      -this.destWShift * this.zoom, // The X coordinate of the top left corner of the sub-rectangle of the source image to draw into the destination context.
      -this.destHShift * this.zoom, // The Y coordinate of the top left corner of the sub-rectangle of the source image to draw into the destination context.
      W * this.zoom, // The width of the sub-rectangle of the source image to draw into the destination context. If not specified, the entire rectangle from the coordinates specified by sx and sy to the bottom-right corner of the image is used.
      H * this.zoom // The height of the sub-rectangle of the source image to draw into the destination context.
    );

    // define stroke style
    ctx.globalCompositeOperation = "lighter";
    ctx.strokeStyle = `hsl(${ms / 300}, 50%, 50%)`;

    // draw line
    if (this.frameIndex % 2 === 0) {
      ctx.beginPath();
      let len = this.audioData.length;
      for (let i = 0; i < len; i += 2) {
        let index = i < len / 2 ? i : len - 1 - i;
        let v = 1 - this.audioData[index] / 256;
        ctx.lineTo((i / len - 0.5) * this.destW, v * this.destH);
      }
      ctx.stroke();
    }

    // restore context after drawing
    ctx.globalCompositeOperation = "source-over";
    ctx.restore();
  }
}

document.querySelector("canvas").addEventListener("click", () => {
  new Visualizer("Goodnight_Goodnight.mp3").renderFrame(0);
});
