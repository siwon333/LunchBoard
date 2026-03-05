# RoomSync 🏠

룸메이트 생활 캘린더 앱 — 오늘의 귀가/일정/조용모드를 한눈에

## 기술 스택

- **Expo (Expo Router)** — 파일 기반 라우팅
- **NativeWind v4** — Tailwind CSS for React Native
- **Firebase** — Firestore(실시간 DB) + Authentication
- **Zustand** — 전역 상태관리
- **TypeScript**

---

## 프로젝트 구조

```
roomsync/
├── app/
│   ├── _layout.tsx          # 루트 레이아웃 (Auth 분기)
│   ├── auth/
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── onboarding.tsx   # 룸 생성/참여
│   └── main/
│       ├── _layout.tsx      # 하단 탭 네비게이션
│       ├── home.tsx         # 오늘 대시보드
│       ├── calendar.tsx     # 주간 캘린더
│       ├── event-form.tsx   # 이벤트 생성/수정 (모달)
│       ├── notifications.tsx
│       └── settings.tsx
├── components/
│   ├── common/              # Button, Input, Card 등
│   ├── home/                # PresenceBar, EventItems
│   └── calendar/            # WeeklyCalendar
├── hooks/
│   ├── useAuth.ts
│   └── useRoom.ts           # 실시간 구독 훅
├── lib/
│   ├── firebase.ts
│   ├── utils.ts
│   └── firestore/
│       ├── rooms.ts
│       ├── events.ts
│       ├── presence.ts
│       └── audit.ts
├── store/                   # Zustand 스토어
├── types/                   # TypeScript 타입 정의
├── constants/               # 상수 (PRESENCE_CONFIG 등)
├── firestore.rules          # Firestore 보안 규칙
└── global.css               # NativeWind 진입점
```

---

## 시작하기

### 1. 패키지 설치

```bash
npm install
```

### 2. Firebase 설정

1. [Firebase Console](https://console.firebase.google.com)에서 새 프로젝트 생성
2. Authentication > 이메일/비밀번호 로그인 활성화
3. Firestore Database 생성 (프로덕션 모드)
4. `firestore.rules` 내용을 Firestore 보안 규칙에 붙여넣기
5. 프로젝트 설정 > 앱 추가(Web) > 설정값 복사

### 3. 환경변수 설정

```bash
cp .env.example .env.local
# .env.local 에 Firebase 설정값 입력
```

### 4. Firestore 인덱스 설정

Firebase Console > Firestore > 인덱스 탭에서 복합 인덱스 추가:

| 컬렉션 | 필드 1 | 필드 2 | 필드 3 |
|--------|--------|--------|--------|
| events | roomId ASC | startAt ASC | — |
| events | roomId ASC | startAt ASC | deletedAt ASC |

### 5. 실행

```bash
npx expo start
```

---

## 주요 기능 (MVP)

- ✅ 이메일 회원가입/로그인
- ✅ 룸 생성 (초대코드 발급) / 초대코드로 참여
- ✅ 오늘 대시보드 — Presence 상태 + 일정 타임라인
- ✅ 조용모드 배너 (진행 중이면 상단 고정)
- ✅ 주간 캘린더 (리스트형)
- ✅ 이벤트 CRUD (주요일정 / 귀가 / 조용모드)
- ✅ 실시간 동기화 (Firestore onSnapshot)
- ✅ 인앱 알림함
- ✅ 감사로그 자동 기록
- ✅ Firestore 보안 규칙

## 추후 확장 예정

- [ ] 반복 일정 (rrule.js 연동)
- [ ] 푸시 알림 (FCM)
- [ ] Google Calendar 연동
- [ ] 정산/더치페이
- [ ] 당번/청소 로테이션
