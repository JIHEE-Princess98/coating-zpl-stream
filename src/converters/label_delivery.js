const { buildDeliveryHTML } = require("./html_delivery");
const { attachCodes } = require("../utils/codes");
const { htmlToPngBuffer } = require("./rasterize");
const { pngToGFAHex } = require("./image_to_zpl");

async function buildZPLFromDelivery(row, opts = {}) {
  const {
    x = 0,
    y = 0,
    width = 780,
    height = 780,
    threshold = 160,
    darkness = 15,
    debugBox = false,
  } = opts;

  const withCodes = await attachCodes(row);
  const html = buildDeliveryHTML(withCodes);
  const png = await htmlToPngBuffer(html, {
    width,
    height,
    deviceScaleFactor: 1,
  });
  const gf = pngToGFAHex(png, { threshold });

  const head = [
    "^XA",
    `^PW${Math.round(width)}`,
    `^LL${Math.round(height)}`,
    "^LH0,0",
    darkness != null ? `^MD${darkness}` : "",
  ].join("");

  const box = debugBox
    ? `^FO0,0^GB${Math.round(width)},${Math.round(height)},2^FS`
    : "";

  return [head, box, `^FO${x},${y}`, gf, "^FS", "^XZ"].join("");
}

module.exports = { buildZPLFromDelivery };
