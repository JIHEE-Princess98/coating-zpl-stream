const QR = require("qrcode");
const { buildProcessHTML } = require("./html_process");
const { htmlToPngBuffer } = require("./rasterize");
const { pngToGFAHex } = require("./image_to_zpl");

async function buildZPLFromProcess(
  row,
  {
    x = 0,
    y = 0,
    width = 700,
    height = 700,
    threshold = 160,
    darkness = 15,
    debugBox = false,
  } = {}
) {
  // QR 내용: 생산번호 + 품번을 기본으로
  const qrText = String(row.opr_cd ?? "");
  const qrcodeDataUrl = await QR.toDataURL(qrText, {
    errorCorrectionLevel: "M",
    margin: 0,
    color: { dark: "#000000", light: "#FFFFFF" },
  });

  const html = buildProcessHTML({ ...row, qrcodeDataUrl });

  const png = await htmlToPngBuffer(html, {
    width: Math.round(width),
    height: Math.round(height),
    deviceScaleFactor: 1,
    omitBackground: false,
  });

  const gf = pngToGFAHex(png, { threshold, invert: false });

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

module.exports = { buildZPLFromProcess };
