# 아키텍처 구조

## 전체 구조

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   AWS Services  │
│   (Next.js)     │◄──►│   (Express)     │◄──►│   (EC2, etc.)   │
│   Port: 3000    │    │   Port: 3001    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Frontend (Next.js)
- **포트**: 3000
- **역할**: UI/UX, 사용자 인터페이스
- **기술**: React, TypeScript, Tailwind CSS
- **구조**:
  ```
  src/
  ├── app/              # Next.js App Router
  ├── components/       # UI 컴포넌트
  └── types/           # 타입 정의
  ```

## Backend (Express)
- **포트**: 3001
- **역할**: 비즈니스 로직, AWS 통합, API 제공
- **기술**: Express, TypeScript, AWS SDK
- **구조**:
  ```
  backend/src/
  ├── controllers/     # API 컨트롤러
  ├── services/        # 비즈니스 로직
  │   ├── aws/        # AWS 클라이언트
  │   └── checks/     # 검사 로직
  ├── routes/         # API 라우팅
  ├── middleware/     # 미들웨어
  └── types/          # 타입 정의
  ```

## 장점

### 1. **관심사 분리**
- Frontend: UI/UX에만 집중
- Backend: 비즈니스 로직과 AWS 통합에 집중

### 2. **확장성**
- Backend API는 다른 클라이언트(모바일 앱 등)에서도 사용 가능
- 마이크로서비스로 분리 가능

### 3. **보안**
- AWS 자격 증명이 백엔드에만 존재
- 프론트엔드에서 민감한 정보 노출 방지

### 4. **성능**
- 백엔드에서 AWS API 호출 최적화
- 캐싱 및 배치 처리 가능

### 5. **배포 독립성**
- Frontend와 Backend 독립적 배포
- 각각 다른 환경에 최적화 가능

## API 엔드포인트

### 인증 API
- `POST /api/auth/signin` - 로그인
- `POST /api/auth/signup` - 회원가입
- `POST /api/auth/confirm` - 이메일 확인

### 검사 API
- `POST /api/checks/ec2` - EC2 보안 검사
- `GET /api/checks/account-info` - 계정 정보

## 실행 방법

### Backend 실행
```bash
cd backend
npm install
npm run dev
```

### Frontend 실행
```bash
npm run dev
```

이제 Frontend(3000)와 Backend(3001)가 분리되어 각각의 역할에 집중할 수 있습니다!