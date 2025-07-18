#!/bin/bash

# 기존 정책 삭제 (있다면)
aws iam detach-user-policy --user-name project-automation --policy-arn arn:aws:iam::713881821833:policy/BedrockAgentInvokePolicy 2>/dev/null
aws iam delete-policy --policy-arn arn:aws:iam::713881821833:policy/BedrockAgentInvokePolicy 2>/dev/null

# 확장된 Bedrock 권한 정책 생성
aws iam create-policy \
  --policy-name BedrockFullAccessPolicy \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "bedrock:InvokeAgent",
                "bedrock:InvokeModel",
                "bedrock:GetAgent",
                "bedrock:GetAgentAlias",
                "bedrock:ListAgents",
                "bedrock:ListAgentAliases"
            ],
            "Resource": "*"
        }
    ]
}'

# 사용자에게 정책 연결
aws iam attach-user-policy \
  --user-name project-automation \
  --policy-arn arn:aws:iam::713881821833:policy/BedrockFullAccessPolicy

echo "Bedrock 권한 설정 완료!"