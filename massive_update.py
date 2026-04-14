#!/usr/bin/env python3
"""
Massive update for all 12 locale files
"""
import re
import os
import json

# 데이터 정의: 각 파일과 해당 업데이트 내용
updates_data = {
    'src/locales/sec-ko.ts': {
        7: [("Cross-Account Role 생성", "운영 계정(B)에서 개발 계정(A) ID를 신뢰하는 Role을 생성하세요.")],
        11: [("액세스 키 비활성화", "lee-marketing의 액세스 키를 Inactive로 변경하세요."), ("콘솔 로그인 비밀번호 삭제", "lee-marketing의 콘솔 로그인 프로필을 삭제하세요."), ("그룹에서 제거", "lee-marketing을 marketing-team 그룹에서 제거하세요.")],
    },
    'src/locales/sec-en.ts': {
        7: [("Create Cross-Account Role", "Create Role in Account B trusting Account A ID.")],
        11: [("Deactivate Keys", "Set lee-marketing access keys to Inactive."), ("Delete Console Password", "Delete console login profile for lee-marketing."), ("Remove from Group", "Remove lee-marketing from marketing-team group.")],
    },
    'src/locales/sec-ja.ts': {
        7: [("クロスアカウント Role 作成", "Account B で Account A ID を信頼する Role を作成してください。")],
        11: [("アクセスキーを無効化", "lee-marketing のアクセスキーを Inactive に変更してください。"), ("コンソールログインパスワードを削除", "lee-marketing のコンソールログインプロファイルを削除してください。"), ("グループから削除", "lee-marketing を marketing-team グループから削除してください。")],
    },
}

def update_file(file_path, updates_dict):
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

# 모든 파일 업데이트
for file_path, updates_dict in updates_data.items():
    count = update_file(file_path, updates_dict)
    if count > 0:
        print(f"Updated {count} descriptions in {file_path}")
    else:
        print(f"No changes for {file_path}")

print("Partial update complete. Remaining files will be handled by separate scripts...")
