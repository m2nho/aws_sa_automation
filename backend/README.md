# AWS Trust Advisor Backend

Express.js 기반 백엔드 서비스

## 실행 방법

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정
```bash
cp .env.example .env
# .env 파일을 편집하여 실제 값 입력
```

### 3. 개발 서버 실행
```bash
npm run dev
```

서버가 포트 3001에서 실행됩니다.

## API 엔드포인트

### 인증
- `POST /api/auth/signin` - 로그인
- `POST /api/auth/signup` - 회원가입  
- `POST /api/auth/confirm` - 이메일 확인

### 검사
- `POST /api/checks/ec2` - EC2 보안 검사
- `GET /api/checks/account-info` - 계정 정보

## 환경 변수

```bash
PORT=3001
FRONTEND_URL=http://localhost:3000
COGNITO_USER_POOL_ID=ap-northeast-2_xxxxxxxxx
COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
AWS_REGION=ap-northeast-2
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_SERVICE_ACCOUNT_ID=123456789012
```