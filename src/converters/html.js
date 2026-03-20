function formatDate(val) {
  if (!val) return "";
  try {
    const d = new Date(val);
    if (isNaN(d)) return val;
    return d.toISOString().slice(0, 10);
  } catch {
    return val;
  }
}

function formatDotDate(val) {
  const d = val ? new Date(val) : new Date();
  if (isNaN(d)) return "";
  const z = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}. ${z(d.getMonth() + 1)}. ${z(d.getDate())}`;
}

function buildHTML(row) {
  const {
    maker_nm,
    paint_cd,
    color_nm,
    raw_mt_crt_dt,
    raw_mt_expire_dt,
    raw_mt_lot_no,
    created_at,
    created_by,
    logoDataUrl,
    qrcodeDataUrl,
  } = row;

  const paintText = [paint_cd, color_nm].filter(Boolean).join(", ");
  const footerDateDot = formatDotDate(created_at);

  return `<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="utf-8" />
    <title>원자재 라벨</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      /* ============ 기본 폰트/레이아웃 ============ */
      html, body {
        margin: 0;
        padding: 20;
        font-family: Arial, "Malgun Gothic", sans-serif;
        color: #000;
      }
      .page {
        display: flex;
        justify-content: center;
        align-items: flex-start;
        min-height: 100vh;
        background: #f6f7f9;
        padding: 24px;
      }

      /* ============ 라벨 박스 ============ */
      .label {
        width: 910px;
        height: 680px;
        background: #fff;
        position: relative;
        box-sizing: border-box;
        border: 1px dashed #ccc;
      }
      .inner {
        position: absolute;
        left: 12px;
        right: 12px;
        top: 8px;
      }

      /* ============ 테이블 스타일 ============ */
      table {
        width: 100%;
        border-collapse: collapse;
        text-align: center;
        font-size: 32px;
      }
      td, th {
        border: 1px solid #000;
        height: 60px;
      }
      .w35 { width: 35%; }
      .qrw { width: 100px; }
      .mb-20 { margin-bottom: 20px; }
      .right {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 6px;
      }
      .footer {
        display: flex;
        justify-content: flex-end;
        margin-top: 20px;
        margin-right: 50px;
        font-weight: 600;
      }

      /* ============ 마지막 행 내부 레이아웃 ============ */
      .last-row {
        display: flex;
        gap: 70px;
        margin: 0 30px;
        align-items: center;
        justify-content: center;
      }
      .dots {
        display: flex;
        justify-content: center;
        gap: 30px;
      }
      .logo {
        height: 30px;
        object-fit: contain;
      }

      @media print {
        .controls { display: none; }
        .label { border: none; }
      }
    </style>
  </head>
  <body>
    <div class="page">
      <div class="label">
        <div class="inner" id="printArea">
          <table>
            <colgroup>
              <col class="w35" />
              <col />
              <col class="qrw" />
            </colgroup>
            <tbody>
              <tr>
                <td colspan="2">원자재 식별표</td>
               <td rowspan="2" style="padding:10px;">
                  ${
                    qrcodeDataUrl
                      ? `<img src="${qrcodeDataUrl}" alt="QR" style="width:170px;height:170px;object-fit:contain;" />`
                      : ``
                  }
                </td>
              </tr>
              <tr>
                <td>제조사</td>
                <td>${maker_nm ?? ""}</td>
              </tr>
              <tr>
                <td>규격명 / 색상</td>
                <td colspan="2">${paintText}</td>
              </tr>
              <tr>
                <td>제조 일자</td>
                <td colspan="2">${formatDate(raw_mt_crt_dt)}</td>
              </tr>
              <tr>
                <td>시효 만료 일자</td>
                <td colspan="2">${formatDate(raw_mt_expire_dt)}</td>
              </tr>
              <tr>
                <td>LOT</td>
                <td colspan="2">${raw_mt_lot_no ?? ""}</td>
              </tr>
              <tr>
                <td>개봉일</td>
                <td colspan="2">
                  <div class="dots"><span>.</span><span>.</span><span>.</span></div>
                </td>
              </tr>
              <tr>
                <td colspan="3">
                  <div class="last-row">
                    ${
                      logoDataUrl
                        ? `<img class="logo" src="${logoDataUrl}" alt="BSI 로고" />`
                        : ``
                    }
                    <p>개봉일로부터 90일 후 남은 도료 폐기</p>
                  </div>

                  <div class="footer">
                    <span>${footerDateDot}</span>&nbsp;-&nbsp;검수자&nbsp;${
    created_by ?? ""
  }
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          
        </div>
      </div>
    </div>
  </body>
</html>`;
}

module.exports = { buildHTML, formatDate };
