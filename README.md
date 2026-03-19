# 🍱 LunchBoard

급식 메뉴를 확인하고 평가할 수 있는 웹앱.
GitHub Pages로 배포되며, Firebase Firestore를 백엔드로 사용합니다.

## 기능

- **급식 메뉴 조회** — 날짜 화살표 또는 달력으로 날짜 이동
- **형광펜 즐겨찾기** — ♡ 눌러 내 즐겨찾기 등록, 같은 메뉴 나올 때 자동 강조
- **게시판** — 자유 게시판 (이미지 포함), 좋아요 · 댓글 지원
- **관리자** — CSV 붙여넣기로 월간 급식표 일괄 등록

## 구조

```
web/index.html        # 앱 본체 (단일 HTML 파일)
firestore.rules       # Firestore 보안 규칙
.github/workflows/    # GitHub Pages 자동 배포
```

## 배포

`master` 브랜치에 push하면 GitHub Actions가 자동으로 GitHub Pages에 배포합니다.
Firebase 설정값은 GitHub Secrets에서 주입됩니다.

| Secret 이름 | 설명 |
|---|---|
| `EXPO_PUBLIC_FIREBASE_API_KEY` | Firebase API Key |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID` | Firebase Project ID |
| `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket |
| `EXPO_PUBLIC_FIREBASE_APP_ID` | Firebase App ID |

## 로컬 개발

Firebase 설정을 직접 `web/index.html`의 `firebaseConfig`에 입력하고 브라우저로 열면 됩니다.

```js
const firebaseConfig = {
  apiKey: '...',
  authDomain: '....firebaseapp.com',
  projectId: '...',
  storageBucket: '...',
  appId: '...',
};
```
