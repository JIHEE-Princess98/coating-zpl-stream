function buildDeliveryHTML(row) {
  const { cnpt_nm, dwg_nm, dwg_no, cnt, logoDataUrl } = row;

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <title>제품 납품표</title>
  <style>
    html, body {
      margin: 0;
      padding: 0;
      font-family: Arial, "Malgun Gothic", sans-serif;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 32px;
      text-align: center;
    }
    td, th {
      border: 1px solid #000;
      padding: 30px;
      height: 30px;
    }
    .footer {
      display: flex;
      justify-content: center;
      margin-top: 20px;
    }
    .logo {
      height: 40px;
      object-fit: contain;
    }
  </style>
</head>
<body>
  <table>
    <tr>
      <td colspan="2" style="font-size:32px">제품 납품표</td>
    </tr>
    <tr>
      <td>업체명</td>
      <td>${cnpt_nm ?? ""}</td>
    </tr>
    <tr>
      <td>품명</td>
      <td>${dwg_nm ?? ""}</td>
    </tr>
    <tr>
      <td>품번</td>
      <td>${dwg_no ?? ""}</td>
    </tr>
    <tr>
      <td>수량</td>
      <td>${cnt ?? ""} EA</td>
    </tr>
    <tr>
      <td>납품일</td>
      <td></td>
    </tr>
    <tr>
      <td>기타</td>
      <td></td>
    </tr>
  </table>
  <div class="footer">
    ${
      logoDataUrl
        ? `<img class="logo" src="${logoDataUrl}" alt="BSI 로고" />`
        : ""
    }
  </div>
</body>
</html>`;
}

module.exports = { buildDeliveryHTML };
