# 정리된 프로젝트 구조

## Frontend (Next.js)
```
src/
├── app/
│   ├── dashboard/page.tsx    # 대시보드 페이지
│   ├── layout.tsx           # 레이아웃
│   ├── page.tsx            # 메인 페이지
│   └── globals.css         # 글로벌 스타일
└── components/
    ├── Header.tsx          # 헤더 컴포넌트
    ├── LoadingSpinner.tsx  # 로딩 스피너
    ├── LoginForm.tsx       # 로그인 폼
    └── SignupForm.tsx      # 회원가입 폼
```

## Backend (Express)
```
backend/src/
├── controllers/            # API 컨트롤러
├── services/              # 비즈니스 로직
│   ├── aws/              # AWS 클라이언트
│   └── checks/           # 검사 로직
├── routes/               # API 라우팅
├── middleware/           # 미들웨어
└── types/               # 타입 정의
```

## Infrastructure (CDK)
```
infrastructure/
├── cdk-stack.ts         # Cognito 스택
├── s3-frontend.ts       # S3 배포 스택
└── app.ts              # CDK 앱
```

## 제거된 파일들
- ❌ `src/app/api/` - Next.js API 라우트 (백엔드로 이동)
- ❌ `src/lib/` - 기존 라이브러리 (백엔드로 이동)
- ❌ `src/services/` - 서비스 로직 (백엔드로 이동)
- ❌ `src/types/` - 타입 정의 (백엔드로 이동)
- ❌ `src/utils/` - 유틸리티 (백엔드로 이동)
- ❌ AWS SDK 의존성 (프론트엔드에서 제거)

## 핵심 파일만 남김
✅ **Frontend**: UI 컴포넌트와 페이지만  
✅ **Backend**: 비즈니스 로직과 AWS 통합  
✅ **Infrastructure**: 배포 설정만  

이제 각 부분이 명확히 분리되어 유지보수가 용이합니다!