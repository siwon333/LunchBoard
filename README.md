# LunchBoard

Expo + Firebase 기반의 점심 일정 관리 앱입니다.

---

## Firebase 설정 가이드

### 1단계: Firebase 프로젝트 생성

1. [Firebase Console](https://console.firebase.google.com) 접속
2. **프로젝트 추가** 클릭 → 프로젝트 이름 입력 (예: `lunchboard`)
3. Google 애널리틱스는 선택사항 (사용 안 해도 됨)

---

### 2단계: 앱 등록 (웹 앱)

1. 프로젝트 홈 → **`</>`** (웹 앱) 버튼 클릭
2. 앱 닉네임 입력 후 **앱 등록**
3. 아래와 같은 `firebaseConfig` 객체가 표시됨:

```js
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

---

### 3단계: 환경변수 파일 만들기

프로젝트 루트에 `.env.local` 파일을 생성하고 위 값을 채워 넣으세요:

```bash
# .env.example 파일을 복사해서 사용하세요
cp .env.example .env.local
```

`.env.local` 파일 내용:

```
EXPO_PUBLIC_FIREBASE_API_KEY=AIza...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

> ⚠️ `.env.local` 파일은 절대 git에 커밋하지 마세요. `.gitignore`에 포함되어 있는지 확인하세요.

---

### 4단계: Firebase 서비스 활성화

Firebase Console에서 아래 서비스를 활성화해야 합니다.

#### Authentication
1. 좌측 메뉴 → **Authentication** → **시작하기**
2. **Sign-in method** 탭 → **이메일/비밀번호** 활성화
3. 필요시 Google 로그인도 추가 가능

#### Firestore Database
1. 좌측 메뉴 → **Firestore Database** → **데이터베이스 만들기**
2. **프로덕션 모드**로 시작 (보안 규칙 직접 설정)
3. 리전 선택: `asia-northeast3` (서울) 권장
4. 데이터베이스 생성 후 **규칙** 탭으로 이동
5. 프로젝트 루트의 `firestore.rules` 파일 내용을 복붙 후 **게시**

#### Storage (파일 업로드 필요 시)
1. 좌측 메뉴 → **Storage** → **시작하기**
2. 보안 규칙 기본값으로 시작 후 필요에 따라 수정
3. 리전은 Firestore와 동일하게 설정

---

### 5단계: 앱 실행

```bash
# 의존성 설치
npm install

# 개발 서버 시작
npm start

# 플랫폼별 실행
npm run android
npm run ios
npm run web
```

---

## 프로젝트 구조

```
LunchBoard/
├── lib/
│   ├── firebase.ts        # Firebase 초기화 (auth, db, storage export)
│   └── utils.ts           # 날짜/시간 유틸리티
├── firestore.rules        # Firestore 보안 규칙
├── .env.example           # 환경변수 템플릿
└── app/                   # Expo Router 페이지
```

## Firebase 코드 사용 예시

```ts
import { auth, db, storage } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword } from 'firebase/auth';

// 로그인
await signInWithEmailAndPassword(auth, email, password);

// Firestore 데이터 추가
await addDoc(collection(db, 'rooms'), { name: '우리 팀' });
```
