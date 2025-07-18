#!/bin/bash

# IAM 정책 생성
aws iam create-policy \
  --policy-name BedrockAgentInvokePolicy \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "bedrock:InvokeAgent"
            ],
            "Resource": [
                "arn:aws:bedrock:ap-northeast-2:713881821833:agent/*",
                "arn:aws:bedrock:ap-northeast-2:713881821833:agent-alias/*/*"
            ]
        }
    ]
}'

# 사용자에게 정책 연결
aws iam attach-user-policy \
  --user-name project-automation \
  --policy-arn arn:aws:iam::713881821833:policy/BedrockAgentInvokePolicy

echo "IAM 권한 설정 완료!"