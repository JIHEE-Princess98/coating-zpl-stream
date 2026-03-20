# Coating-ZPL-Print-Server

Coating-ZPL-Print-Server는 **원자재 라벨 인쇄 시스템**으로, DB에 적재된 인쇄 대기 데이터를 주기적으로 확인하고  
라벨 HTML → 이미지 → ZPL 변환 과정을 거쳐 네트워크 프린터로 출력합니다.

---

## 📂 프로젝트 구조

```
BSI-PRINT/
├─ node_modules/
├─ src/
│ ├─ config/ # 환경설정/DB 연결
│ │ ├─ constants.js # 인쇄 상태, 공통 상수 정의
│ │ └─ db.js # PostgreSQL 연결 Pool
│ │
│ ├─ converters/ # HTML/이미지 ↔ ZPL 변환 로직
│ │ ├─ html.js # 라벨 HTML 템플릿 빌더
│ │ ├─ image_to_zpl.js # 이미지 → ZPL 변환
│ │ ├─ label_html_image.js # HTML 라벨 → 이미지 변환
│ │ ├─ rasterize.js # HTML/CANVAS → 비트맵 rasterize
│ │ └─ index.js # 변환기 모듈 집합 진입점
│ │
│ ├─ core/ # 핵심 인쇄 로직
│ │ ├─ poller.js # DB에서 대기 작업 조회/처리 루프
│ │ └─ printer.js # 프린터 전송 (ZPL over TCP)
│ │
│ ├─ images/
│ │ └─ logo.png
│ │
│ └─ utils/ # 유틸리티/코드 관리
│ └─ codes.js
│
├─ .env # 환경 변수 (DB, 프린터 IP/PORT 등)
├─ html.html # 기본 라벨 디자인 HTML
├─ package.json
├─ package-lock.json
└─ yarn.lock
```

---

## 실행 방법

```
# 설치
npm install

#실행
npm start
```

> ## 동작흐름
>
> ### DB Polling (poller.js)
>
> > status_yn IS NULL 인 레코드 조회 (인쇄 대기) \
> > advisory lock으로 중복 처리 방지 \
>
> ### HTML 생성 (html.js) \
>
> > DB row → HTML 라벨 코드 생성 \
>
> ### HTML → 이미지 (label_html_image.js, rasterize.js) \
>
> > Puppeteer/canvas 등을 이용해 PNG 변환
>
> ### 이미지 → ZPL (image_to_zpl.js)
>
> > 프린터 호환 비트맵 명령어 생성
>
> ### 프린터 전송 (printer.js)
>
> > TCP 소켓으로 ZPL 전송
> > 성공시 status_yn = 'Y', 실패시 'N' 업데이트
