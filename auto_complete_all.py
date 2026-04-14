#!/usr/bin/env python3
import re, os

def update_file(f, updates):
    if not os.path.exists(f): return 0
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    cnt = 0
    for s, updates_list in updates.items():
        for title, desc in updates_list:
            p = rf'(\{{\s*title:\s*"{re.escape(title)}",\s*desc:\s*)"[^"]*"(\s*\}})'
            before = content
            content = re.sub(p, rf'\1"{desc}"\2', content)
            if before != content: cnt += 1
    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)
    return cnt

# RES영어와 res일본어용 기본 업데이트
res_updates = {
    2: [("Target Group 생성", "EC2 target group web-tg를 HTTP 80포트로 생성하세요.")],
    4: [("소스 버킷 버전 관리 활성화", "서울 리전 source-bucket에 Versioning을 활성화하세요.")],
}

# 파일 업데이트
files_to_update = ['src/locales/res-ko.ts', 'src/locales/res-en.ts', 'src/locales/res-ja.ts', 'src/locales/perf-ko.ts', 'src/locales/perf-en.ts', 'src/locales/perf-ja.ts', 'src/locales/cost-ko.ts', 'src/locales/cost-en.ts', 'src/locales/cost-ja.ts']

for f in files_to_update:
    cnt = update_file(f, res_updates)
    if cnt > 0:
        print(f"Updated {cnt} in {f}")
    else:
        print(f"Checked {f}")

print("Completed")
