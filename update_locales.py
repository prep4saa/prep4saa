#!/usr/bin/env python3
import re

sec_updates_ko = {
    1: [
        ("IAM 사용자 생성", "kim-dev 사용자를 IAM에 생성하세요."),
        ("S3 ReadOnly 정책 연결", "kim-dev에 AmazonS3ReadOnlyAccess 정책을 연결하세요."),
        ("AccessDenied 확인", "S3 DeleteBucket 명령어를 실행해 AccessDenied 오류를 확인하세요."),
    ],
    2: [
        ("dev-team 그룹 생성", "IAM 그룹 dev-team을 생성하세요."),
        ("EC2 정책 연결", "dev-team에 AmazonEC2FullAccess 정책을 연결하세요."),
        ("사용자를 그룹에 추가", "kim-dev를 dev-team 그룹에 추가하세요."),
    ],
    3: [
        ("IAM Role 생성", "EC2 서비스용 IAM Role을 생성하세요."),
        ("S3 권한 연결", "Role에 AmazonS3FullAccess 정책을 연결하세요."),
        ("EC2에 Role 연결", "EC2 인스턴스에 생성한 IAM Role을 연결하세요."),
    ],
}

file_path = "src/locales/sec-ko.ts"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

for scenario_num, step_updates in sec_updates_ko.items():
    for step_title, new_desc in step_updates:
        pattern = rf'(\{{\s*title:\s*"{re.escape(step_title)}",\s*desc:\s*)"[^"]*"(\s*\}})'
        replacement = rf'\1"{new_desc}"\2'
        content = re.sub(pattern, replacement, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated successfully")
