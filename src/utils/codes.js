const fs = require("fs");
const path = require("path");
const QR = require("qrcode");

function hasText(v) {
  return v != null && String(v).trim().length > 0;
}

function loadLogoDataUrl() {
  try {
    const logoPath = path.join(__dirname, "..", "images", "logo.png");
    if (!fs.existsSync(logoPath)) return null;
    const buf = fs.readFileSync(logoPath);
    return `data:image/png;base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

async function attachCodes(row, opts = {}) {
  const { wantQR = true, buildQRText } = opts;
  const out = { ...row };

  if (!out.logoDataUrl) {
    out.logoDataUrl = loadLogoDataUrl();
  }

  if (!wantQR) {
    out.qrcodeDataUrl = null;
    return out;
  }

  let qrText;
  if (typeof buildQRText === "function") {
    qrText = buildQRText(row);
  } else {
    qrText = String(row.raw_mt_serial_no ?? "").trim();
  }

  if (!hasText(qrText)) {
    out.qrcodeDataUrl = null;
    return out;
  }

  try {
    out.qrcodeDataUrl = await QR.toDataURL(qrText, {
      errorCorrectionLevel: "M",
      margin: 0,
      color: { dark: "#000000", light: "#FFFFFF" },
    });
  } catch (e) {
    console.warn("[QR WARN]", e?.message || e);
    out.qrcodeDataUrl = null;
  }

  return out;
}

module.exports = { attachCodes };
