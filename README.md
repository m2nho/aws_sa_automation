# AWS Trust Advisor Service

AWS Trust Advisor 기능을 서비스별로 검사하는 웹 서비스입니다.

## 주요 기능

- **Cognito 인증**: 사용자 인증 및 권한 관리
- **Assume Role**: 안전한 크로스 계정 리소스 접근
- **Trust Advisor 검사**: AWS 리소스 상태 및 권장사항 확인
- **확장 가능한 구조**: 새로운 검사 항목 추가 용이

## 프로젝트 구조

```
src/
├── app/
│   ├── api/
│   │   ├── auth/signin/     # Cognito 인증 API
│   │   └── trust-advisor/   # Trust Advisor 검사 API
│   ├── dashboard/           # 대시보드 페이지
│   └── page.tsx            # 메인 페이지
├── components/
│   └── LoginForm.tsx       # 로그인 폼
├── lib/
│   ├── aws-client.ts       # AWS 클라이언트 관리
│   └── cognito-auth.ts     # Cognito 인증 로직
└── types/
    └── aws.ts              # AWS 관련 타입 정의

infrastructure/
├── cdk-stack.ts            # CDK 스택 정의
├── app.ts                  # CDK 앱 엔트리포인트
└── cdk.json               # CDK 설정
```

## 설치 및 실행

1. 의존성 설치:
```bash
npm install
```

2. 환경 변수 설정:
```bash
cp .env.local.example .env.local
# .env.local 파일을 편집하여 실제 값 입력
```

3. 개발 서버 실행:
```bash
npm run dev
```

## AWS 인프라 배포

1. CDK 설치:
```bash
npm install -g aws-cdk
```

2. 인프라 배포:
```bash
cd infrastructure
cdk bootstrap
cdk deploy
```

## 사용 방법

1. Cognito에서 사용자 생성
2. 웹 애플리케이션에 로그인
3. 대상 AWS 계정의 Role ARN 입력
4. Trust Advisor 검사 실행

## 확장 방법

새로운 검사 항목 추가:
1. `src/types/aws.ts`에 새 타입 정의
2. `src/lib/aws-client.ts`에 검사 로직 추가
3. `src/app/api/trust-advisor/route.ts`에 API 엔드포인트 확장
4. 대시보드 UI 업데이트