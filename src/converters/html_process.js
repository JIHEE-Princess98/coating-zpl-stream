function buildProcessHTML(row) {
  const {
    opr_label_nm, // 상단 제목
    opr_desc, // 품번
    pre_premier_coat_raw_mt_info, // 전처리 하도
    primier_coat_raw_mt_info, // 하도
    top_coat_raw_mt_info, // 상도
    opr_cd, // 생산 No
    qrcodeDataUrl, // QR Data URL
  } = row;

  const formatMultiLine = (val = "") =>
    val
      .split("/")
      .map((v) => v.trim())
      .filter(Boolean)
      .join("<br/>");

  const coatPre = formatMultiLine(pre_premier_coat_raw_mt_info || "");
  const coatPrim = formatMultiLine(primier_coat_raw_mt_info || "");
  const coatTop = formatMultiLine(top_coat_raw_mt_info || "");

  // 행 조건부 생성
  const coatPreRow = coatPre
    ? `<tr><td>전처리 하도</td><td colspan="2">${coatPre}</td></tr>`
    : "";
  const coatPrimRow = coatPrim
    ? `<tr><td>하도</td><td colspan="2">${coatPrim}</td></tr>`
    : "";
  const coatTopRow = coatTop
    ? `<tr><td>상도</td><td colspan="2">${coatTop}</td></tr>`
    : "";

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <title>공정 이동표</title>
  <style>
    .w-full { width: 780px; }
    .text-center { text-align: center; }
    .w-35p { width: 35%; }
    .w-100px { width: 100px; }
    .h-50px { height: 50px; }
    .mx-20 { margin-left: 20px; margin-right: 20px; }
    .text-start { text-align: left; }
    table { border-collapse: collapse; width: 100%; }
    td { border: 1px solid #000; height: 70px; font-weight: 600; vertical-align: middle; font-size: 28px; }
    .qr-wrap { display:flex; align-items:center; justify-content:center; width:100%; height:100%; }
    .qr-box { width: 170px; height: 170px; padding: 20px; display:flex; align-items:center; justify-content:center; box-sizing: border-box; }
    .qr-img { width: 170px; height: 170px; object-fit: contain; }
    .checks { display:flex; justify-content:center; gap:10px; padding: 10px; font-size: 24px;}
  </style>
</head>
<body>
  <div>
    <table class="w-full text-center">
      <colgroup>
        <col class="w-35p" />
      </colgroup>
      <tbody>
        <tr>
          <td colspan="2" class="font-semibold">${opr_label_nm ?? ""}</td>
          <td rowspan="2" class="w-100px" style="padding: 10px;">
            <div class="qr-wrap">
              <div class="qr-box">
                ${
                  qrcodeDataUrl
                    ? `<img class="qr-img" src="${qrcodeDataUrl}" alt="QR" />`
                    : ""
                }
              </div>
            </div>
          </td>
        </tr>
        <tr>
          <td>품번</td>
          <td>${opr_desc ?? ""}</td>
        </tr>
        ${coatPreRow}
        ${coatPrimRow}
        ${coatTopRow}
        <tr>
          <td>생산 No</td>
          <td colspan="2">${opr_cd ?? ""}</td>
        </tr>
        <tr>
          <td>입고 일시</td>
          <td colspan="2"></td>
        </tr>
        <tr>
          <td colspan="3">
            <div class="checks">
              <span>□ 수입검사</span>
              <span>□ 마스킹</span>
              <span>□ 도장</span>
              <span>□ 검사</span>
              <span>□ 마스킹제거 및 포장</span>
            </div>
          </td>
        </tr>
        <tr>
          <td colspan="3">
            <p class="text-start mx-20">수입검사자: </p>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</body>
</html>`;
}

module.exports = { buildProcessHTML };
