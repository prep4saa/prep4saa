#!/usr/bin/env python3
import re

sec_updates = {
    7: [("Cross-Account Role 생성", "운영 계정(B)에서 개발 계정(A) ID를 신뢰하는 Role을 생성하세요.")],
    8: [("CloudTrail Trail 생성", "전 리전의 API 호출을 S3에 기록하는 Trail을 생성하세요.")],
    9: [("Secrets Manager에 시크릿 생성", "RDS 자격증명(username, password)을 Secrets Manager에 저장하세요.")],
    10: [("커스텀 NACL 생성", "VPC에 새로운 커스텀 Network ACL을 생성하세요.")],
}

file_path = "src/locales/sec-ko.ts"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

for scenario_num, step_updates in sec_updates.items():
    for step_title, new_desc in step_updates:
        pattern = rf'(\{{\s*title:\s*"{re.escape(step_title)}",\s*desc:\s*)"[^"]*"(\s*\}})'
        replacement = rf'\1"{new_desc}"\2'
        content = re.sub(pattern, replacement, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Update complete")
