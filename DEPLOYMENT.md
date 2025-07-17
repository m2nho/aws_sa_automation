# 배포 가이드

## Frontend (S3 + CloudFront)

### 1. 환경 변수 설정
```bash
# .env.local
NEXT_PUBLIC_API_URL=https://your-backend-api.com
```

### 2. 정적 사이트 빌드
```bash
npm run build
```

### 3. S3 배포 (수동)
```bash
# AWS CLI 설정 후
aws s3 sync out/ s3://your-bucket-name --delete
```

### 4. CDK로 자동 배포
```bash
cd infrastructure
npm install aws-cdk-lib @aws-cdk/aws-s3-deployment
cdk deploy FrontendStack
```

## Backend (EC2 또는 ECS)

### 1. Docker 이미지 빌드
```bash
cd backend
docker build -t trust-advisor-backend .
```

### 2. ECR에 푸시
```bash
aws ecr get-login-password --region ap-northeast-2 | docker login --username AWS --password-stdin 123456789012.dkr.ecr.ap-northeast-2.amazonaws.com
docker tag trust-advisor-backend:latest 123456789012.dkr.ecr.ap-northeast-2.amazonaws.com/trust-advisor-backend:latest
docker push 123456789012.dkr.ecr.ap-northeast-2.amazonaws.com/trust-advisor-backend:latest
```

### 3. ECS 서비스 배포
```bash
# ECS 클러스터 및 서비스 설정
aws ecs update-service --cluster trust-advisor --service backend --force-new-deployment
```

## 환경별 설정

### 개발 환경
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

### 프로덕션 환경
- Frontend: CloudFront URL
- Backend: ALB URL 또는 API Gateway

## 보안 설정

### CORS 설정
```javascript
// backend/src/server.ts
app.use(cors({
  origin: ['https://your-cloudfront-domain.com'],
  credentials: true
}));
```

### 환경 변수
```bash
# 프로덕션 환경 변수
FRONTEND_URL=https://your-cloudfront-domain.com
AWS_REGION=ap-northeast-2
COGNITO_USER_POOL_ID=ap-northeast-2_xxxxxxxxx
```

이제 Frontend는 S3에, Backend는 ECS나 EC2에 배포할 수 있습니다!