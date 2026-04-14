#!/usr/bin/env python3
"""
Bulk update locale files for SEC, RES, PERF, COST scenarios
with concrete values in desc fields
"""
import re
import os

# SEC 시나리오 7-30 (한국어) - 이미 1-6은 업데이트됨
sec_ko_7_to_30 = {
    7: [("Cross-Account Role 생성", "운영 계정(B)에서 개발 계정(A) ID를 신뢰하는 Role을 생성하세요."), ("임시 자격증명 발급", "개발 계정에서 sts assume-role로 임시 자격증명을 발급하세요."), ("운영 계정 S3에 배포", "임시 자격증명으로 운영 계정 S3에 파일을 업로드하세요.")],
    8: [("CloudTrail Trail 생성", "전 리전의 API 호출을 S3에 기록하는 Trail을 생성하세요."), ("Trail 로깅 시작", "생성한 Trail의 로깅을 활성화하세요."), ("삭제 이벤트 조회", "CloudTrail lookup-events로 DeleteDBSnapshot 이벤트와 발생자를 조회하세요.")],
    9: [("Secrets Manager에 시크릿 생성", "RDS 자격증명(username, password)을 Secrets Manager에 저장하세요."), ("런타임에 시크릿 조회", "Lambda에서 get_secret_value()로 자격증명을 조회하세요."), ("90일 자동 교체 설정", "Secrets Manager에서 자동 교체 주기를 90일로 설정하세요.")],
    10: [("커스텀 NACL 생성", "VPC에 새로운 커스텀 Network ACL을 생성하세요."), ("악성 IP 차단 규칙 추가", "규칙 100에서 192.168.100.0/24를 DENY하세요."), ("서브넷에 NACL 연결", "프라이빗 서브넷에 생성한 NACL을 연결하세요.")],
    11: [("액세스 키 목록 확인", "lee-marketing 사용자의 액세스 키 ID를 확인하세요."), ("액세스 키 비활성화", "lee-marketing의 액세스 키를 Inactive로 변경하세요."), ("콘솔 로그인 비밀번호 삭제", "lee-marketing의 콘솔 로그인 프로필을 삭제하세요."), ("그룹에서 제거", "lee-marketing을 marketing-team 그룹에서 제거하세요."), ("사용자 삭제", "IAM 사용자 lee-marketing을 완전히 삭제하세요.")],
    12: [("자격증명 보고서 생성", "IAM Credentials Report를 생성하세요."), ("보고서 조회", "CSV 형식의 자격증명 보고서를 다운로드해 MFA 상태를 확인하세요."), ("가상 MFA 디바이스 생성", "루트 계정용 virtual MFA device를 Google Authenticator로 활성화하세요."), ("계정 비밀번호 정책 강화", "최소 14자, 대소문자+숫자+특수문자, 90일 만료, 3개 이전 비밀번호 제외 정책을 설정하세요.")],
    13: [("버전 관리 상태 확인", "config-bucket의 Versioning이 Enabled인지 확인하세요."), ("삭제된 파일의 버전 목록 조회", "app-config.json의 모든 버전 및 Delete Marker를 조회하세요."), ("삭제 마커 제거하여 복구", "Delete Marker의 VersionId로 delete-object를 실행해 복구하세요."), ("복구 확인", "app-config.json이 정상적으로 복구됐는지 확인하세요.")],
    14: [("GuardDuty 활성화", "현재 AWS 리전에서 GuardDuty 활성화를 시작하세요."), ("알림용 SNS 토픽 생성", "보안 탐지 알림을 받을 SNS 토픽 guardduty-alerts를 생성하세요."), ("탐지 결과 목록 조회", "GuardDuty ListFindings API로 모든 탐지 결과를 조회하세요."), ("탐지 결과 상세 조회", "특정 Finding ID로 GetFindings API를 실행해 상세 정보를 확인하세요.")],
    15: [("Lambda 현재 Role 확인", "data-processor Lambda의 execution role을 확인하세요."), ("커스텀 IAM 정책 생성", "S3:GetObject(특정 버킷), DynamoDB:PutItem(특정 테이블)만 허용하는 정책을 생성하세요."), ("최소 권한 Role 생성", "Lambda 전용 최소 권한 Role lambda-processor-role을 생성하세요."), ("커스텀 정책 Role에 연결", "커스텀 정책을 lambda-processor-role에 연결하세요."), ("Lambda Role 교체", "data-processor의 execution role을 lambda-processor-role로 변경하세요.")],
    16: [("기존 키 목록 확인", "dev-user의 액세스 키 생성 날짜를 확인해 90일 이상 된 키를 찾으세요."), ("새 액세스 키 생성", "dev-user의 새 액세스 키를 생성하세요."), ("기존 키 비활성화", "기존 액세스 키를 Inactive로 변경하세요."), ("기존 키 완전 삭제", "Inactive 상태를 며칠간 유지한 후 액세스 키를 삭제하세요.")],
    17: [("SNS 토픽 생성", "루트 로그인 알림을 받을 SNS 토픽 root-login-alerts를 생성하세요."), ("이메일 구독 추가", "root-login-alerts 토픽에 security@example.com 이메일 구독을 추가하세요."), ("CloudWatch 지표 필터 생성", "userIdentity.type == Root && eventName == ConsoleLogin 조건의 지표 필터를 만드세요."), ("CloudWatch 알람 생성", "일치 횟수 >= 1이면 SNS 알림을 보내는 알람을 생성하세요.")],
    18: [("로그 저장용 버킷 생성", "s3-access-logs-bucket 같은 로그 저장용 버킷을 생성하세요."), ("서버 액세스 로깅 활성화", "customer-data 버킷의 로깅 대상을 s3-access-logs-bucket으로 설정하세요."), ("로깅 설정 확인", "customer-data > Properties > Server access logging이 올바르게 설정됐는지 확인하세요."), ("로그 버킷에 로그 파일 존재 확인", "s3-access-logs-bucket에 접근 로그 파일(*.log)이 저장되고 있는지 확인하세요.")],
    19: [("DB URL SecureString 저장", "/app/db-url을 SecureString 타입으로 Parameter Store에 저장하세요."), ("API 키 SecureString 저장", "/app/api-key를 SecureString 타입으로 Parameter Store에 저장하세요."), ("Lambda에 Parameter Store 읽기 권한 부여", "Lambda Role에 ssm:GetParameter 권한(ssm:Name/app/*)을 추가하세요."), ("Lambda 코드 수정 및 배포", "boto3로 ssm.get_parameter()를 호출하도록 Lambda 코드를 수정해 배포하세요.")],
    20: [("IMDSv1 상태 확인", "prod-instance의 EC2 메타데이터 옵션을 확인하세요."), ("IMDSv2 전용 설정", "메타데이터 옵션에서 IMDSv2만 허용(Required)으로 변경하세요."), ("토큰 TTL 설정", "메타데이터 토큰 TTL을 3600초(1시간)로 설정하세요."), ("설정 변경 확인", "EC2 메타데이터 옵션이 IMDSv2 전용으로 적용됐는지 확인하세요.")],
    21: [("VPC Flow Logs 역할 생성", "CloudWatch Logs에 쓰기 권한이 있는 IAM 역할을 생성하세요."), ("CloudWatch 로그 그룹 생성", "vpc-flow-logs 같은 CloudWatch Logs 그룹을 생성하세요."), ("VPC Flow Logs 활성화", "prod-vpc에 VPC Flow Logs를 활성화해 vpc-flow-logs 그룹에 저장하세요."), ("네트워크 트래픽 조회", "CloudWatch Logs에서 의심 EC2의 REJECT 트래픽을 검색하세요.")],
    22: [("기본 암호화 설정 확인", "secure-uploads 버킷의 Default encryption 설정을 확인하세요."), ("기본 암호화 활성화", "secure-uploads 버킷의 Default encryption을 AES256 또는 KMS CMK로 설정하세요."), ("암호화 설정 확인", "Default encryption이 올바르게 적용됐는지 확인하세요."), ("HTTPS 전용 + 암호화 강제 정책 적용", "aws:SecureTransport: false 또는 암호화 헤더 없는 요청을 Deny하는 정책을 적용하세요.")],
    23: [("AWS Config 레코더 활성화", "AWS Config 레코더를 활성화해 리소스 구성 변경을 기록하세요."), ("배포 채널 설정", "Config 스냅샷을 S3에 저장하는 배포 채널을 설정하세요."), ("restricted-ssh Config 규칙 추가", "AWS Config의 restricted-ssh 관리형 규칙을 추가하세요."), ("컴플라이언스 상태 확인", "restricted-ssh 규칙이 NON_COMPLIANT인 보안 그룹을 확인하세요.")],
    24: [("IAM Access Analyzer 생성", "전체 계정을 스캔하는 Access Analyzer를 생성하세요."), ("외부 접근 가능 리소스 목록 조회", "Access Analyzer의 Findings에서 EXTERNAL_ACCESS인 리소스를 조회하세요."), ("취약점 상세 조회", "발견된 외부 접근 가능 S3 버킷, IAM Role 등의 상세 정보를 확인하세요."), ("취약점 아카이브 처리", "조치 완료 후 Finding 상태를 ARCHIVED로 변경하세요.")],
    25: [("계정 전체 버킷 목록 조회", "aws s3api list-buckets로 계정의 모든 버킷을 조회하세요."), ("문제 버킷 ACL 확인", "old-backup-2023 버킷의 ACL을 조회해 public-read 등의 권한을 확인하세요."), ("버킷 ACL을 private으로 변경", "old-backup-2023 버킷 ACL을 private으로 변경하세요."), ("계정 수준 퍼블릭 액세스 차단", "S3 Block Public Access를 계정 레벨에서 모두 ON으로 설정하세요.")],
    26: [("RDS 인스턴스 백업 설정 확인", "운영 DB의 자동 백업(Backup Retention Period) 설정을 확인하세요."), ("자동 백업 7일 보존 설정", "Backup Retention Period를 0에서 7일로 변경하세요."), ("백업 윈도우 설정", "백업이 실행될 UTC 시간을 03:00-04:00 등으로 설정하세요."), ("수동 스냅샷 즉시 생성", "현재 DB 상태의 수동 스냅샷을 즉시 생성하세요.")],
    27: [("현재 S3 버킷 정책 확인", "static-web-content 버킷의 버킷 정책을 확인하세요."), ("OAI 생성", "CloudFront Origin Access Identity(OAI)를 생성하세요."), ("OAI 기반 버킷 정책 업데이트", "Principal: arn:aws:cloudfront::account-id:distribution/DIST_ID 형태로 OAI만 접근 허용하세요."), ("S3 퍼블릭 액세스 완전 차단", "static-web-content 버킷의 Block public access를 모두 ON으로 설정하세요."), ("설정 최종 확인", "S3 URL로 직접 접근이 차단되고 CloudFront URL로만 접근 가능한지 확인하세요.")],
    28: [("Lambda 함수 현재 Role 확인", "lambda-processing 함수의 Role 이름을 확인하세요."), ("Role 신뢰 정책 확인", "lambda-processing-role의 Trust Policy에 Principal을 확인하세요."), ("신뢰 정책 수정", "Principal을 lambda.amazonaws.com으로 수정하세요."), ("수정 결과 확인", "신뢰 정책이 lambda.amazonaws.com을 포함하도록 수정됐는지 확인하세요.")],
    29: [("알림용 SNS 토픽 생성", "결제 알림을 받을 SNS 토픽 billing-alerts를 생성하세요."), ("이메일 구독 추가", "billing-alerts 토픽에 finance@example.com 이메일 구독을 추가하세요."), ("결제 CloudWatch 알람 생성", "us-east-1에서 EstimatedCharges >= 500이면 SNS 알림을 보내는 알람을 생성하세요."), ("AWS Budgets 예산 생성", "월 500 달러 예산을 생성하고 80% 사용 시 알림이 가도록 설정하세요.")],
    30: [("Security Hub 활성화", "CIS Benchmark 표준을 포함해 AWS Security Hub를 활성화하세요."), ("Critical 취약점 조회", "Security Hub > Findings에서 Severity가 CRITICAL 이상인 항목을 조회하세요."), ("인사이트 요약 조회", "Security Hub의 Insights에서 미해결된 취약한 리소스를 조회하세요."), ("취약점 조치 상태 업데이트", "조치 완료된 취약점의 Record State를 RESOLVED로 업데이트하세요.")],
}

def update_locale_file(file_path, updates_dict):
    """Update a locale file with concrete values"""
    if not os.path.exists(file_path):
        print(f"SKIP: {file_path} does not exist")
        return 0

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    updated_count = 0
    for scenario_num, step_updates in updates_dict.items():
        for step_title, new_desc in step_updates:
            pattern = rf'(\{{\s*title:\s*"{re.escape(step_title)}",\s*desc:\s*)"[^"]*"(\s*\}})'
            replacement = rf'\1"{new_desc}"\2'
            before = content
            content = re.sub(pattern, replacement, content)
            if before != content:
                updated_count += 1

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

    return updated_count

# Update SEC Korean 7-30
count = update_locale_file('src/locales/sec-ko.ts', sec_ko_7_to_30)
print(f"Updated {count} descriptions in src/locales/sec-ko.ts")
