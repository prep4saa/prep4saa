type ChalI18n = {
  title: string;
  scenario: string;
  steps: Array<{ title: string; desc: string }>;
  explanation: string;
};

export const SEC_CHALLENGES_I18N: Record<number, ChalI18n> = {
  1: {
    title: "신입 개발자 온보딩",
    scenario: "스타트업 AWS 관리자인 당신에게 오늘 신입 백엔드 개발자 김개발이 입사했습니다. S3와 EC2를 읽기 전용으로만 접근 가능해야 하며, 수정·삭제는 절대 불가해야 합니다.",
    steps: [
      { title: "IAM 사용자 생성", desc: "kim-dev 사용자를 IAM에 생성하세요." },
      { title: "S3 ReadOnly 정책 연결", desc: "kim-dev에 AmazonS3ReadOnlyAccess 정책을 연결하세요." },
      { title: "AccessDenied 확인", desc: "S3 DeleteBucket 명령어를 실행해 AccessDenied 오류를 확인하세요." },
    ],
    explanation: "IAM 사용자에게 Managed Policy를 직접 연결하는 기본 패턴입니다. ReadOnly 정책은 List/Get/Describe만 허용하므로 삭제·수정 명령어는 AccessDenied를 반환합니다.",
  },
  2: {
    title: "팀별 권한 분리",
    scenario: "회사가 성장해 개발팀 5명, 운영팀 3명이 됐습니다. 개발팀은 EC2만, 운영팀은 RDS만 관리합니다. 매번 개인별로 정책을 붙이는 게 번거로워 그룹 기반 관리 체계를 도입하기로 했습니다.",
    steps: [
      { title: "dev-team 그룹 생성", desc: "IAM 그룹 dev-team을 생성하세요." },
      { title: "EC2 정책 연결", desc: "dev-team에 AmazonEC2FullAccess 정책을 연결하세요." },
      { title: "사용자를 그룹에 추가", desc: "kim-dev를 dev-team 그룹에 추가하세요." },
    ],
    explanation: "IAM 그룹을 사용하면 사용자 추가/제거만으로 권한이 자동으로 부여·회수됩니다. 개인별 정책 관리 대비 운영 오류가 크게 줄어듭니다.",
  },
  3: {
    title: "EC2가 S3에 접근해야 할 때",
    scenario: "운영 중인 EC2 서버가 매일 밤 로그 파일을 S3에 자동 업로드해야 합니다. 개발자가 \"액세스 키를 EC2에 하드코딩하면 안 되나요?\"라고 물어봤습니다. 보안 원칙에 맞는 방법으로 설정하세요.",
    steps: [
      { title: "IAM Role 생성", desc: "EC2 서비스용 IAM Role을 생성하세요." },
      { title: "S3 권한 연결", desc: "Role에 AmazonS3FullAccess 정책을 연결하세요." },
      { title: "EC2에 Role 연결", desc: "EC2 인스턴스에 생성한 IAM Role을 연결하세요." },
    ],
    explanation: "EC2에 IAM Role을 연결하면 인스턴스 메타데이터 서비스(IMDS)가 임시 자격증명을 자동 갱신합니다. 액세스 키 하드코딩은 키 유출 위험이 있어 Role 사용이 모범 사례입니다.",
  },
  4: {
    title: "고객 데이터 버킷 보호",
    scenario: "쇼핑몰 고객 주문 데이터가 S3에 저장됩니다. 보안 감사에서 \"버킷이 퍼블릭에 노출될 위험이 있다\"는 지적을 받았습니다. 특정 Lambda 함수만 접근 가능하도록 버킷을 잠그세요.",
    steps: [
      { title: "퍼블릭 액세스 전면 차단", desc: "orders-data-bucket의 모든 퍼블릭 액세스를 차단하세요." },
      { title: "버킷 정책 적용", desc: "arn:aws:lambda:*:*:function:* Lambda ARN만 허용하는 정책을 적용하세요." },
      { title: "설정 확인", desc: "Block public access가 모두 ON으로 설정됐는지 확인하세요." },
    ],
    explanation: "S3 버킷 보호는 두 계층으로 구성됩니다. Block Public Access는 계정/버킷 전체를 보호하는 안전망이고, 버킷 정책은 특정 Principal(예: Lambda ARN)만 허용하는 세밀한 제어입니다.",
  },
  5: {
    title: "규정 준수를 위한 데이터 암호화",
    scenario: "핀테크 스타트업에서 금융 데이터를 S3에 저장합니다. 금융당국 규정상 \"고객 데이터는 반드시 고객사가 관리하는 키로 암호화\"해야 한다는 요구사항이 생겼습니다.",
    steps: [
      { title: "KMS CMK 생성", desc: "금융 데이터 암호화용 Customer Master Key를 생성하세요." },
      { title: "KMS Alias 생성", desc: "생성한 CMK에 alias/fintech-key 같은 alias를 만드세요." },
      { title: "S3 SSE-KMS 설정", desc: "fintech-data-bucket에 KMS CMK를 기본 암호화로 설정하세요." },
    ],
    explanation: "SSE-KMS는 S3가 KMS API를 호출해 암호화/복호화합니다. CMK(Customer Managed Key)를 사용하면 키 정책으로 접근을 세밀하게 제어하고, 키 사용 내역을 CloudTrail로 감사할 수 있습니다.",
  },
  6: {
    title: "웹서버 최소 권한 네트워크 설정",
    scenario: "EC2 웹서버가 해킹 시도를 받고 있습니다. 현재 보안 그룹이 0.0.0.0/0 전체 개방 상태입니다. 웹 트래픽만 허용하고 SSH는 사무실 IP에서만 가능하도록 즉시 조치하세요.",
    steps: [
      { title: "현재 SG 규칙 확인", desc: "보안 그룹에서 0.0.0.0/0 인바운드 규칙을 찾아 확인하세요." },
      { title: "전체 허용 규칙 삭제", desc: "0.0.0.0/0 전체 개방 인바운드 규칙을 즉시 삭제하세요." },
      { title: "HTTPS 허용 규칙 추가", desc: "HTTPS(443)를 0.0.0.0/0으로, SSH(22)를 192.168.1.0/24로 허용하세요." },
    ],
    explanation: "보안 그룹은 Stateful 방화벽으로 허용 규칙만 존재합니다. 최소 권한 원칙에 따라 필요한 포트만 열고, 관리용 SSH는 반드시 특정 IP로 제한해야 합니다.",
  },
  7: {
    title: "타 계정 배포 파이프라인 구성",
    scenario: "개발 계정(Account A)의 CI/CD 파이프라인이 운영 계정(Account B)의 S3에 빌드 산출물을 배포해야 합니다. 운영 계정 액세스 키를 개발팀에 주는 건 보안상 절대 안 됩니다.",
    steps: [
      { title: "Cross-Account Role 생성", desc: "운영 계정(B)에서 개발 계정(A) ID를 신뢰하는 Role을 생성하세요." },
      { title: "임시 자격증명 발급", desc: "개발 계정에서 sts assume-role로 임시 자격증명을 발급하세요." },
      { title: "운영 계정 S3에 배포", desc: "임시 자격증명으로 운영 계정 S3에 파일을 업로드하세요." },
    ],
    explanation: "STS AssumeRole은 임시 자격증명(최대 12시간)을 발급합니다. Cross-Account Role의 신뢰 정책(Trust Policy)에 개발 계정 ID를 명시해야 하며, 이 방식은 영구 액세스 키 공유보다 훨씬 안전합니다.",
  },
  8: {
    title: "보안 사고 — 누가 삭제했나?",
    scenario: "어느 날 아침 운영 DB 스냅샷이 삭제되어 있었습니다. 팀원 누구도 삭제한 적 없다고 합니다. CTO가 \"모든 AWS API 호출 기록을 남기고 범인을 찾아라\"고 지시했습니다.",
    steps: [
      { title: "CloudTrail Trail 생성", desc: "전 리전의 API 호출을 S3에 기록하는 Trail을 생성하세요." },
      { title: "Trail 로깅 시작", desc: "생성한 Trail의 로깅을 활성화하세요." },
      { title: "삭제 이벤트 조회", desc: "CloudTrail lookup-events로 DeleteDBSnapshot 이벤트와 발생자를 조회하세요." },
    ],
    explanation: "CloudTrail은 AWS 계정의 모든 API 호출을 기록합니다. lookup-events 명령어로 특정 이벤트 이름이나 사용자명으로 빠르게 검색할 수 있어 보안 사고 조사에 필수입니다.",
  },
  9: {
    title: "DB 비밀번호 코드에서 제거하기",
    scenario: "코드 리뷰 중 RDS 비밀번호가 GitHub 코드에 하드코딩된 것이 발견됐습니다. 보안팀이 즉각 시정을 요구했습니다. 비밀번호를 런타임에 안전하게 가져오도록 바꾸세요.",
    steps: [
      { title: "Secrets Manager에 시크릿 생성", desc: "RDS 자격증명(username, password)을 Secrets Manager에 저장하세요." },
      { title: "런타임에 시크릿 조회", desc: "Lambda에서 get_secret_value()로 자격증명을 조회하세요." },
      { title: "90일 자동 교체 설정", desc: "Secrets Manager에서 자동 교체 주기를 90일로 설정하세요." },
    ],
    explanation: "Secrets Manager는 자격증명을 안전하게 저장하고 애플리케이션이 SDK/CLI로 런타임에 조회합니다. 자동 교체 기능으로 비밀번호가 주기적으로 갱신되어 유출 피해를 최소화합니다.",
  },
  10: {
    title: "서브넷 단위 트래픽 차단",
    scenario: "보안 감사 결과 \"보안 그룹만으로는 부족하다. 서브넷 레벨에서도 특정 IP를 차단하는 이중 방어선이 필요하다\"는 권고를 받았습니다. 알려진 악성 IP 대역을 NACL로 차단하세요.",
    steps: [
      { title: "커스텀 NACL 생성", desc: "VPC에 새로운 커스텀 Network ACL을 생성하세요." },
      { title: "악성 IP 차단 규칙 추가", desc: "규칙 100에서 192.168.100.0/24를 DENY하세요." },
      { title: "서브넷에 NACL 연결", desc: "프라이빗 서브넷에 생성한 NACL을 연결하세요." },
    ],
    explanation: "NACL(Network ACL)은 서브넷 레벨의 Stateless 방화벽입니다. 규칙 번호 순서대로 평가되며, DENY 규칙이 먼저 매칭되면 차단됩니다. 보안 그룹(인스턴스 레벨)과 함께 사용하면 이중 방어가 됩니다.",
  },
  11: {
    title: "퇴사자 계정 즉시 비활성화",
    scenario: "오늘 마케팅팀 직원이 갑자기 퇴사했습니다. HR에서 \"이 사람 AWS 접근을 지금 당장 막아달라\"고 긴급 요청했습니다. 계정을 완전히 정리하세요.",
    steps: [
      { title: "액세스 키 목록 확인", desc: "lee-marketing 사용자의 액세스 키 ID를 확인하세요." },
      { title: "액세스 키 비활성화", desc: "lee-marketing의 액세스 키를 Inactive로 변경하세요." },
      { title: "콘솔 로그인 비밀번호 삭제", desc: "lee-marketing의 콘솔 로그인 프로필을 삭제하세요." },
      { title: "그룹에서 제거", desc: "lee-marketing을 marketing-team 그룹에서 제거하세요." },
      { title: "사용자 삭제", desc: "IAM 사용자 lee-marketing을 완전히 삭제하세요." },
    ],
    explanation: "퇴사자 처리 순서: 키 확인 → 비활성화 → 콘솔 로그인 삭제 → 그룹 제거 → 사용자 삭제. 바로 삭제하지 않고 비활성화를 먼저 하는 이유는 감사 로그 보존과 실수 복구를 위해서입니다.",
  },
  12: {
    title: "IAM 계정 보안 강화",
    scenario: "보안 감사팀이 \"루트 계정에 MFA가 없고, 비밀번호 정책도 너무 약하다\"는 Critical 취약점을 발견했습니다. 자격증명 보고서를 확인하고 비밀번호 정책을 강화하세요.",
    steps: [
      { title: "자격증명 보고서 생성", desc: "IAM Credentials Report를 생성하세요." },
      { title: "보고서 조회", desc: "CSV 형식의 자격증명 보고서를 다운로드해 MFA 상태를 확인하세요." },
      { title: "가상 MFA 디바이스 생성", desc: "루트 계정용 virtual MFA device를 Google Authenticator로 활성화하세요." },
      { title: "계정 비밀번호 정책 강화", desc: "최소 14자, 대소문자+숫자+특수문자, 90일 만료, 3개 이전 비밀번호 제외 정책을 설정하세요." },
    ],
    explanation: "IAM 자격증명 보고서(CSV)는 모든 사용자의 MFA 활성화 여부, 비밀번호 마지막 사용일, 액세스 키 상태를 한 번에 확인할 수 있습니다. CIS Benchmark는 최소 14자, 90일 교체, MFA 필수를 권장합니다.",
  },
  13: {
    title: "실수로 삭제된 파일 복구",
    scenario: "배포 스크립트 버그로 S3 프로덕션 버킷의 설정 파일이 실수로 삭제됐습니다. 버전 관리 상태를 확인하고 파일을 복구한 뒤, 앞으로 이런 일이 없도록 MFA Delete를 활성화하세요.",
    steps: [
      { title: "버전 관리 상태 확인", desc: "config-bucket의 Versioning이 Enabled인지 확인하세요." },
      { title: "삭제된 파일의 버전 목록 조회", desc: "app-config.json의 모든 버전 및 Delete Marker를 조회하세요." },
      { title: "삭제 마커 제거하여 복구", desc: "Delete Marker의 VersionId로 delete-object를 실행해 복구하세요." },
      { title: "복구 확인", desc: "app-config.json이 정상적으로 복구됐는지 확인하세요." },
    ],
    explanation: "S3 버전 관리 삭제는 실제로 \"삭제 마커\"를 추가합니다. 마커의 VersionId로 delete-object를 실행하면 복구됩니다. MFA Delete를 활성화하면 삭제 마커 추가 자체에 MFA가 필요해 실수 삭제를 방지합니다.",
  },
  14: {
    title: "GuardDuty 침해 탐지 및 알림",
    scenario: "\"AWS 계정에서 이상한 리전에서 EC2가 갑자기 생성됐다\"는 알림을 사후에야 받았습니다. GuardDuty를 활성화하고 탐지 결과를 SNS로 실시간 알림 받도록 설정하세요.",
    steps: [
      { title: "GuardDuty 활성화", desc: "현재 AWS 리전에서 GuardDuty 활성화를 시작하세요." },
      { title: "알림용 SNS 토픽 생성", desc: "결제 알림을 받을 SNS 토픽 billing-alerts를 생성하세요." },
      { title: "탐지 결과 목록 조회", desc: "GuardDuty ListFindings API로 모든 탐지 결과를 조회하세요." },
      { title: "탐지 결과 상세 조회", desc: "특정 Finding ID로 GetFindings API를 실행해 상세 정보를 확인하세요." },
    ],
    explanation: "GuardDuty는 CloudTrail, VPC Flow Logs, DNS 쿼리를 ML로 분석해 TOR 접근, 비정상 리전 활동, 크리덴셜 유출 징후 등을 자동 탐지합니다. EventBridge + SNS를 연결하면 탐지 즉시 이메일/Slack 알림이 가능합니다.",
  },
  15: {
    title: "Lambda 최소 권한으로 좁히기",
    scenario: "S3 파일을 읽어 DynamoDB에 저장하는 Lambda 함수의 실행 Role이 AdministratorAccess입니다. 실제 필요한 권한(S3 읽기 + DynamoDB 쓰기)만 허용하는 커스텀 정책으로 교체하세요.",
    steps: [
      { title: "Lambda 현재 Role 확인", desc: "data-processor Lambda의 execution role을 확인하세요." },
      { title: "커스텀 IAM 정책 생성", desc: "S3:GetObject(특정 버킷), DynamoDB:PutItem(특정 테이블)만 허용하는 정책을 생성하세요." },
      { title: "최소 권한 Role 생성", desc: "Lambda 전용 최소 권한 Role lambda-processor-role을 생성하세요." },
      { title: "커스텀 정책 Role에 연결", desc: "커스텀 정책을 lambda-processor-role에 연결하세요." },
      { title: "Lambda Role 교체", desc: "data-processor의 execution role을 lambda-processor-role로 변경하세요." },
    ],
    explanation: "Lambda에 AdministratorAccess는 절대 금지입니다. 커스텀 정책에 S3:GetObject, DynamoDB:PutItem 등 실제 사용 API만 지정하고, 리소스도 특정 버킷/테이블 ARN으로 좁혀야 진정한 최소 권한입니다.",
  },
  16: {
    title: "액세스 키 교체 — 90일 초과 키",
    scenario: "보안 정책상 IAM 액세스 키는 90일마다 교체해야 합니다. dev-user 계정 키가 생성된 지 120일이 지났습니다. 안전하게 키를 교체하고 기존 키를 정리하세요.",
    steps: [
      { title: "기존 키 목록 확인", desc: "dev-user의 액세스 키 생성 날짜를 확인해 90일 이상 된 키를 찾으세요." },
      { title: "새 액세스 키 생성", desc: "dev-user의 새 액세스 키를 생성하세요." },
      { title: "기존 키 비활성화", desc: "기존 액세스 키를 Inactive로 변경하세요." },
      { title: "기존 키 완전 삭제", desc: "Inactive 상태를 며칠간 유지한 후 액세스 키를 삭제하세요." },
    ],
    explanation: "키 교체 순서: 새 키 생성 → 새 키로 테스트 → 기존 키 비활성화(Inactive) → 정상 작동 확인(며칠간) → 삭제. 바로 삭제하면 실수 복구가 불가능하므로, Inactive로 유지하다가 문제 없으면 삭제합니다.",
  },
  17: {
    title: "루트 계정 로그인 실시간 알람",
    scenario: "보안 팀에서 \"루트 계정이 언제 로그인하는지 실시간으로 알고 싶다\"고 했습니다. CloudTrail → CloudWatch Logs → SNS 알림 체인을 구성하세요.",
    steps: [
      { title: "SNS 토픽 생성", desc: "루트 로그인 알림을 받을 SNS 토픽 root-login-alerts를 생성하세요." },
      { title: "이메일 구독 추가", desc: "billing-alerts 토픽에 finance@example.com 이메일 구독을 추가하세요." },
      { title: "CloudWatch 지표 필터 생성", desc: "userIdentity.type == Root && eventName == ConsoleLogin 조건의 지표 필터를 만드세요." },
      { title: "CloudWatch 알람 생성", desc: "일치 횟수 >= 1이면 SNS 알림을 보내는 알람을 생성하세요." },
    ],
    explanation: "CloudTrail → CloudWatch Logs → 지표 필터 → CloudWatch 알람 → SNS 알림 체인으로 실시간 보안 모니터링을 구성합니다. 루트 로그인은 CIS AWS Foundations Benchmark에서도 모니터링 필수 항목입니다.",
  },
  18: {
    title: "S3 버킷 접근 로그 활성화",
    scenario: "개인정보보호법 감사에서 \"S3 버킷에 누가 언제 어떤 파일을 읽었는지 기록이 없다\"는 지적을 받았습니다. 로그 버킷을 생성하고 접근 기록을 남기세요.",
    steps: [
      { title: "로그 저장용 버킷 생성", desc: "s3-access-logs-bucket 같은 로그 저장용 버킷을 생성하세요." },
      { title: "서버 액세스 로깅 활성화", desc: "customer-data 버킷의 로깅 대상을 s3-access-logs-bucket으로 설정하세요." },
      { title: "로깅 설정 확인", desc: "customer-data > Properties > Server access logging이 올바르게 설정됐는지 확인하세요." },
      { title: "로그 버킷에 로그 파일 존재 확인", desc: "s3-access-logs-bucket에 접근 로그 파일(*.log)이 저장되고 있는지 확인하세요." },
    ],
    explanation: "S3 서버 액세스 로깅은 버킷에 대한 모든 요청을 기록합니다. 로그 버킷과 원본 버킷은 같은 리전에 있어야 하며, 로그 전달에 약간의 지연(수 분)이 있습니다. 로그는 Athena로 쿼리할 수 있습니다.",
  },
  19: {
    title: "환경변수 대신 Parameter Store 사용",
    scenario: "Lambda 함수의 환경변수에 API 키, DB 연결문자열이 평문으로 저장되어 있습니다. SSM Parameter Store로 이전하고 Lambda 환경변수에서 제거하세요.",
    steps: [
      { title: "DB URL SecureString 저장", desc: "/app/db-url을 SecureString 타입으로 Parameter Store에 저장하세요." },
      { title: "API 키 SecureString 저장", desc: "/app/api-key를 SecureString 타입으로 Parameter Store에 저장하세요." },
      { title: "Lambda에 Parameter Store 읽기 권한 부여", desc: "Lambda Role에 ssm:GetParameter 권한(ssm:Name/app/*)을 추가하세요." },
      { title: "Lambda 코드 수정 및 배포", desc: "boto3로 ssm.get_parameter()를 호출하도록 Lambda 코드를 수정해 배포하세요." },
    ],
    explanation: "Parameter Store의 SecureString은 KMS로 암호화됩니다. Lambda 실행 시 에러 로그나 메모리 덤프에 평문이 노출되지 않으며, 변경 시 Lambda를 재배포할 필요 없이 파라미터 값만 업데이트합니다.",
  },
  20: {
    title: "IMDSv2 강제로 SSRF 차단",
    scenario: "운영 EC2에서 SSRF(Server-Side Request Forgery) 취약점이 발견됐습니다. IMDSv1은 공격에 취약하므로, EC2를 IMDSv2 전용으로 변경하세요.",
    steps: [
      { title: "IMDSv1 상태 확인", desc: "prod-instance의 EC2 메타데이터 옵션을 확인하세요." },
      { title: "IMDSv2 전용 설정", desc: "메타데이터 옵션에서 IMDSv2만 허용(Required)으로 변경하세요." },
      { title: "토큰 TTL 설정", desc: "메타데이터 토큰 TTL을 3600초(1시간)로 설정하세요." },
      { title: "설정 변경 확인", desc: "EC2 메타데이터 옵션이 IMDSv2 전용으로 적용됐는지 확인하세요." },
    ],
    explanation: "IMDSv2는 PUT 요청으로 먼저 토큰을 얻은 후 그 토큰으로 GET 요청하는 2단계 방식입니다. SSRF 공격자도 토큰을 먼저 확보해야 메타데이터에 접근할 수 있어 보안이 크게 향상됩니다.",
  },
  21: {
    title: "VPC Flow Logs로 트래픽 감사",
    scenario: "야간에 \"특정 EC2 인스턴스에서 외부로 대량의 데이터가 빠져나가고 있다\"는 알림이 왔습니다. VPC Flow Logs를 활성화해 네트워크 트래픽을 기록하세요.",
    steps: [
      { title: "VPC Flow Logs 역할 생성", desc: "CloudWatch Logs에 쓰기 권한이 있는 IAM 역할을 생성하세요." },
      { title: "CloudWatch 로그 그룹 생성", desc: "vpc-flow-logs 같은 CloudWatch Logs 그룹을 생성하세요." },
      { title: "VPC Flow Logs 활성화", desc: "prod-vpc에 VPC Flow Logs를 활성화해 vpc-flow-logs 그룹에 저장하세요." },
      { title: "네트워크 트래픽 조회", desc: "CloudWatch Logs에서 의심 EC2의 REJECT 트래픽을 검색하세요." },
    ],
    explanation: "VPC Flow Logs는 VPC, 서브넷, ENI 레벨에서 5튜플(Source IP, Destination IP, Port, Protocol, Accept/Reject)을 기록합니다. 데이터 유출, 포트 스캔, DDoS 공격 등 네트워크 이상을 감지할 수 있습니다.",
  },
  22: {
    title: "S3 모든 업로드에 암호화 강제",
    scenario: "S3 정책에서 \"암호화 없이 업로드된 파일\"이 발견됐습니다. 헤더와 정책 수준에서 암호화를 강제하세요.",
    steps: [
      { title: "기본 암호화 설정 확인", desc: "secure-uploads 버킷의 Default encryption 설정을 확인하세요." },
      { title: "기본 암호화 활성화", desc: "secure-uploads 버킷의 Default encryption을 AES256 또는 KMS CMK로 설정하세요." },
      { title: "암호화 설정 확인", desc: "Default encryption이 올바르게 적용됐는지 확인하세요." },
      { title: "HTTPS 전용 + 암호화 강제 정책 적용", desc: "aws:SecureTransport: false 또는 암호화 헤더 없는 요청을 Deny하는 정책을 적용하세요." },
    ],
    explanation: "기본 암호화 설정은 헤더 없이 업로드할 때 자동 암호화하지만, 명시적으로 \"암호화 안 함\"으로 요청하면 막지 못합니다. 버킷 정책에서 aws:SecureTransport: false(HTTP) 요청과 암호화 조건 없는 요청을 Deny해야 완전히 강제됩니다.",
  },
  23: {
    title: "보안 그룹 SSH 개방 자동 감지",
    scenario: "개발자가 디버깅 목적으로 SSH(22번 포트)를 0.0.0.0/0으로 열었습니다. AWS Config로 이런 실수를 자동 감지하고, 규칙 위반 시 자동 수정(Auto Remediation)까지 설정하세요.",
    steps: [
      { title: "AWS Config 레코더 활성화", desc: "AWS Config 레코더를 활성화해 리소스 구성 변경을 기록하세요." },
      { title: "배포 채널 설정", desc: "Config 스냅샷을 S3에 저장하는 배포 채널을 설정하세요." },
      { title: "restricted-ssh Config 규칙 추가", desc: "AWS Config의 restricted-ssh 관리형 규칙을 추가하세요." },
      { title: "컴플라이언스 상태 확인", desc: "restricted-ssh 규칙이 NON_COMPLIANT인 보안 그룹을 확인하세요." },
    ],
    explanation: "AWS Config는 리소스 구성 변경을 지속적으로 기록하고 관리형 규칙으로 컴플라이언스를 자동 평가합니다. restricted-ssh 규칙은 0.0.0.0/0 22번 포트 개방 시 NON_COMPLIANT 표시 후 Systems Manager Automation으로 자동 교정도 가능합니다.",
  },
  24: {
    title: "IAM Access Analyzer — 외부 공개 리소스 탐지",
    scenario: "\"우리 계정에서 외부에 접근 가능한 리소스가 있는지 모두 찾아라\"고 했습니다. Access Analyzer로 자동 탐지하고, 발견된 취약점을 처리하세요.",
    steps: [
      { title: "IAM Access Analyzer 생성", desc: "전체 계정을 스캔하는 Access Analyzer를 생성하세요." },
      { title: "외부 접근 가능 리소스 목록 조회", desc: "Access Analyzer의 Findings에서 EXTERNAL_ACCESS인 리소스를 조회하세요." },
      { title: "취약점 상세 조회", desc: "발견된 외부 접근 가능 S3 버킷, IAM Role 등의 상세 정보를 확인하세요." },
      { title: "취약점 아카이브 처리", desc: "조치 완료 후 Finding 상태를 ARCHIVED로 변경하세요." },
    ],
    explanation: "IAM Access Analyzer는 S3 버킷 정책, IAM Role Trust Policy, KMS 키 정책 등을 분석해 외부 접근 가능한 리소스를 자동으로 찾아냅니다. 조치 완료 후 ARCHIVED로 표시하면 해당 finding은 더 이상 표시되지 않습니다.",
  },
  25: {
    title: "S3 버킷 퍼블릭 ACL 일괄 점검",
    scenario: "\"레거시 버킷 중 퍼블릭 ACL로 된 게 있을 수 있다\"는 우려가 나왔습니다. 버킷 ACL을 점검하고, 문제 버킷을 수정한 뒤 계정 수준으로 퍼블릭 액세스를 차단하세요.",
    steps: [
      { title: "계정 전체 버킷 목록 조회", desc: "aws s3api list-buckets로 계정의 모든 버킷을 조회하세요." },
      { title: "문제 버킷 ACL 확인", desc: "old-backup-2023 버킷의 ACL을 조회해 public-read 등의 권한을 확인하세요." },
      { title: "버킷 ACL을 private으로 변경", desc: "old-backup-2023 버킷 ACL을 private으로 변경하세요." },
      { title: "계정 수준 퍼블릭 액세스 차단", desc: "S3 Block Public Access를 계정 레벨에서 모두 ON으로 설정하세요." },
    ],
    explanation: "계정 레벨 S3 Block Public Access는 모든 버킷에 일괄 적용됩니다. IgnorePublicAcls=true는 기존 퍼블릭 ACL도 무력화합니다. 새 계정에서는 기본 활성화가 AWS 권장 사항입니다.",
  },
  26: {
    title: "RDS 자동 백업 및 스냅샷 관리",
    scenario: "서비스 장애 복구 훈련 중 \"RDS 자동 백업이 꺼져 있고 마지막 스냅샷도 없다\"는 치명적인 문제를 발견했습니다. 즉시 백업 정책을 설정하고 수동 스냅샷을 생성하세요.",
    steps: [
      { title: "RDS 인스턴스 백업 설정 확인", desc: "운영 DB의 자동 백업(Backup Retention Period) 설정을 확인하세요." },
      { title: "자동 백업 7일 보존 설정", desc: "Backup Retention Period를 0에서 7일로 변경하세요." },
      { title: "백업 윈도우 설정", desc: "백업이 실행될 UTC 시간을 03:00-04:00 등으로 설정하세요." },
      { title: "수동 스냅샷 즉시 생성", desc: "현재 DB 상태의 수동 스냅샷을 즉시 생성하세요." },
    ],
    explanation: "RDS 자동 백업 보존 기간 0은 백업 비활성화입니다. 운영 환경에서는 최소 7일 이상 보존해야 합니다. 백업 윈도우는 트래픽이 적은 시간대를 선택하고, 유지보수 윈도우와 겹치지 않도록 주의하세요.",
  },
  27: {
    title: "CloudFront + S3 OAI로 직접 접근 차단",
    scenario: "정적 웹사이트를 S3로 호스팅하고 CloudFront로 배포 중인데 S3 URL로 직접 접근도 됩니다. CloudFront를 통해서만 접근 가능하도록 OAI를 설정하세요.",
    steps: [
      { title: "현재 S3 버킷 정책 확인", desc: "static-web-content 버킷의 버킷 정책을 확인하세요." },
      { title: "OAI 생성", desc: "CloudFront Origin Access Identity(OAI)를 생성하세요." },
      { title: "OAI 기반 버킷 정책 업데이트", desc: "Principal: arn:aws:cloudfront::account-id:distribution/DIST_ID 형태로 OAI만 접근 허용하세요." },
      { title: "S3 퍼블릭 액세스 완전 차단", desc: "static-web-content 버킷의 Block public access를 모두 ON으로 설정하세요." },
      { title: "설정 최종 확인", desc: "S3 URL로 직접 접근이 차단되고 CloudFront URL로만 접근 가능한지 확인하세요." },
    ],
    explanation: "OAI는 CloudFront가 S3에 접근할 때 사용하는 특수 ID입니다. 버킷 정책에서 이 OAI만 허용하고 퍼블릭 액세스를 차단하면, S3 URL 직접 접근이 불가능해지고 CloudFront URL로만 콘텐츠를 서비스할 수 있습니다.",
  },
  28: {
    title: "Lambda Role 신뢰 정책 오류 수정",
    scenario: "Lambda 함수가 \"AccessDenied: sts:AssumeRole\"로 실패하고 있습니다. 신뢰 정책(Trust Policy)에 Principal이 잘못 설정되어 있습니다. 원인을 파악하고 수정하세요.",
    steps: [
      { title: "Lambda 함수 현재 Role 확인", desc: "lambda-processing 함수의 Role 이름을 확인하세요." },
      { title: "Role 신뢰 정책 확인", desc: "lambda-processing-role의 Trust Policy에 Principal을 확인하세요." },
      { title: "신뢰 정책 수정", desc: "Principal을 lambda.amazonaws.com으로 수정하세요." },
      { title: "수정 결과 확인", desc: "신뢰 정책이 lambda.amazonaws.com을 포함하도록 수정됐는지 확인하세요." },
    ],
    explanation: "IAM Role의 신뢰 정책(Trust Policy)은 누가 이 Role을 Assume할 수 있는지 정의합니다. Lambda Role은 반드시 lambda.amazonaws.com을 신뢰해야 하는데, ec2.amazonaws.com으로 잘못 설정하면 Lambda가 Role을 사용할 수 없습니다.",
  },
  29: {
    title: "결제 알람 및 예산 설정",
    scenario: "지난달 갑자기 청구서가 $5,000이 나왔습니다. 무단 GPU 인스턴스 생성이 원인이었습니다. 월 $500 초과 시 알림과 AWS Budgets로 예산 초과 방지를 설정하세요.",
    steps: [
      { title: "알림용 SNS 토픽 생성", desc: "결제 알림을 받을 SNS 토픽 billing-alerts를 생성하세요." },
      { title: "이메일 구독 추가", desc: "billing-alerts 토픽에 finance@example.com 이메일 구독을 추가하세요." },
      { title: "결제 CloudWatch 알람 생성", desc: "us-east-1에서 EstimatedCharges >= 500이면 SNS 알림을 보내는 알람을 생성하세요." },
      { title: "AWS Budgets 예산 생성", desc: "월 500 달러 예산을 생성하고 80% 사용 시 알림이 가도록 설정하세요." },
    ],
    explanation: "CloudWatch 결제 알람은 us-east-1에서만 생성 가능합니다. AWS Budgets는 알람보다 세밀한 비용 제어가 가능하며, 서비스별·태그별·리전별 예산을 따로 설정할 수 있습니다. 두 가지를 함께 사용하는 것이 좋습니다.",
  },
  30: {
    title: "전체 보안 현황 점검 — Security Hub",
    scenario: "신규 CTO가 \"AWS 보안 현황을 오늘 오후까지 보고하라\"고 했습니다. Security Hub로 계정 전체 보안 점수와 취약점을 파악하고, 주요 취약점에 대한 조치 상태를 업데이트하세요.",
    steps: [
      { title: "Security Hub 활성화", desc: "CIS Benchmark 표준을 포함해 AWS Security Hub를 활성화하세요." },
      { title: "Critical 취약점 조회", desc: "Security Hub > Findings에서 Severity가 CRITICAL 이상인 항목을 조회하세요." },
      { title: "인사이트 요약 조회", desc: "Security Hub의 Insights에서 미해결된 취약한 리소스를 조회하세요." },
      { title: "취약점 조치 상태 업데이트", desc: "조치 완료된 취약점의 Record State를 RESOLVED로 업데이트하세요." },
    ],
    explanation: "AWS Security Hub는 GuardDuty, Inspector, Macie 등 여러 보안 서비스의 결과를 통합합니다. CIS AWS Foundations Benchmark·FSBP를 자동 점검하며, 보안 점수를 정기적으로 확인하고 RESOLVED로 업데이트해 추적 관리하는 것이 중요합니다.",
  },
};
