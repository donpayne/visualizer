const ctx = display.getContext("2d");
const W = (display.width = innerWidth);
const H = (display.height = innerHeight);
const ctx_fill_r = 0;
const ctx_fill_g = 0;
const ctx_fill_b = 0;
const ctx_fill_a = .10;
const ctx_lineWidth = 4;
const ctx_strokeRes = 300;
const analyser_fftSize = 256;

class Visualizer {
  constructor(track) {
    this.track = track;
    this.frameIndex = 0;
    this.destW = W * .75;
    this.destH = H * .25;
    this.destWShift = W * .5;
    this.destHShift = H * .5;
    this.zoom = 1;
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
    this.analyser.fftSize = analyser_fftSize;
    this.source.connect(this.analyser);
  }

  renderFrame(ms) {
    requestAnimationFrame(this.renderFrame.bind(this));
    this.frameIndex++;

    // get audio data
    this.audioData = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(this.audioData);

    // prepare canvas
    ctx.fillStyle = `rgba(${ctx_fill_r},${ctx_fill_g},${ctx_fill_b},${ctx_fill_a})`;
    ctx.fillRect(0, 0, W, H);
    ctx.save();

    // define destination image
    ctx.translate(this.destWShift, this.destHShift);
    ctx.lineWidth = ctx_lineWidth;

    // draw destination image
    // See https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
    ctx.drawImage(
      display,
      0, // The X coordinate in the destination canvas at which to place the top-left corner of the source image.
      0, // The Y coordinate in the destination canvas at which to place the top-left corner of the source image.
      W, // The width to draw the image in the destination canvas. This allows scaling of the drawn image. 
         // If not specified, the image is not scaled in width when drawn.
      H, // The height to draw the image in the destination canvas. This allows scaling of the drawn image. 
         // If not specified, the image is not scaled in height when drawn.
      -this.destWShift * this.zoom, // The X coordinate of the top left corner of the sub-rectangle of the source image to draw into the destination context.
      -this.destHShift * this.zoom, // The Y coordinate of the top left corner of the sub-rectangle of the source image to draw into the destination context.
      W * this.zoom, // The width of the sub-rectangle of the source image to draw into the destination context. 
         //If not specified, the entire rectangle from the coordinates specified by sx and sy to the bottom-right corner of the image is used.
      H * this.zoom // The height of the sub-rectangle of the source image to draw into the destination context.
    );

    // define stroke style
    ctx.globalCompositeOperation = "lighter";
    ctx.strokeStyle = `hsl(${ms / ctx_strokeRes}, 50%, 50%)`;

    // draw line
    if (this.frameIndex % 2 === 0) {
      ctx.beginPath();
      let len = this.audioData.length;
      for (let i = 0; i < len; i += 2) {
        let index = i < len / 2 ? i : len - 1 - i;
        let v = 1 - this.audioData[index] / analyser_fftSize;
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
