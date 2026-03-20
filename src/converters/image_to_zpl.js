const { PNG } = require("pngjs");

function rgbaToLuma(r, g, b) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function pngToGFAHex(pngBuffer, { threshold = 200, invert = false } = {}) {
  const png = PNG.sync.read(pngBuffer);
  const { width, height, data } = png;

  const bytesPerRow = Math.ceil(width / 8);
  const totalBytes = bytesPerRow * height;

  const hex = [];
  for (let y = 0; y < height; y++) {
    let byte = 0,
      bits = 0;
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const r = data[i],
        g = data[i + 1],
        b = data[i + 2],
        a = data[i + 3];
      const luma = a === 0 ? 255 : rgbaToLuma(r, g, b);
      let bit = luma < threshold ? 1 : 0;
      if (invert) bit ^= 1;
      byte = (byte << 1) | bit;
      if (++bits === 8) {
        hex.push(byte.toString(16).toUpperCase().padStart(2, "0"));
        byte = 0;
        bits = 0;
      }
    }
    if (bits) {
      byte <<= 8 - bits;
      hex.push(byte.toString(16).toUpperCase().padStart(2, "0"));
    }
  }
  const hexData = hex.join("");
  return `^GFA,${totalBytes},${totalBytes},${bytesPerRow},${hexData}`;
}

module.exports = { pngToGFAHex };
