type ChalI18n = {
  title: string;
  scenario: string;
  steps: Array<{ title: string; desc: string }>;
  explanation: string;
};

type LocaleKey = "en" | "ja" | "ko";

export const SEC_CHALLENGES_I18N: Record<LocaleKey, Record<number, ChalI18n>> = {
  ko: {
    1: {
      title: "SEC-01 신입 개발자 온보딩",
      scenario: "새로운 백엔드 개발자 김 개발자가 오늘 스타트업 AWS 팀에 입사했습니다. S3와 EC2에 읽기 전용 액세스가 필요하며 자원 수정이나 삭제는 할 수 없어야 합니다.",
      steps: [
        { title: "IAM 사용자 생성", desc: "kim-dev IAM 사용자를 생성하세요." },
        { title: "S3 읽기 전용 정책 연결", desc: "AmazonS3ReadOnlyAccess를 kim-dev에 연결하세요." },
        { title: "AccessDenied 확인", desc: "버킷 삭제 명령을 실행하여 권한 거부를 확인하세요." },
      ],
      explanation: "IAM 사용자에게 관리형 정책을 직접 연결하는 것은 기본 패턴입니다. ReadOnly 정책은 List, Get, Describe 작업만 허용하므로 삭제 및 수정 명령은 AccessDenied를 반환합니다.",
    },
    2: {
      title: "SEC-02 팀 기반 권한 분리",
      scenario: "회사 규모가 개발자 5명, 운영 엔지니어 3명으로 증가했습니다. 개발팀은 EC2만 관리하고 운영팀은 RDS만 관리합니다. 사용자별 정책 관리가 번거로워서 그룹 기반 모델로 전환하고 싶습니다.",
      steps: [
        { title: "dev-team 그룹 생성", desc: "개발팀용 IAM 그룹을 생성하세요." },
        { title: "EC2 정책 연결", desc: "dev-team에 AmazonEC2FullAccess를 연결하세요." },
        { title: "사용자를 그룹에 추가", desc: "kim-dev를 dev-team 그룹에 추가하세요." },
      ],
      explanation: "IAM 그룹을 사용하면 그룹에 사용자를 추가하거나 제거하여 권한을 부여하거나 회수할 수 있습니다. 개별 정책 관리와 비교해 운영 오류를 크게 줄일 수 있습니다.",
    },
    3: {
      title: "SEC-03 EC2가 S3에 액세스해야 하는 경우",
      scenario: "프로덕션 EC2 서버는 매일 밤 로그 파일을 S3으로 자동 업로드해야 합니다. 개발자가 'EC2에 액세스 키를 하드코딩해도 괜찮을까요?'라고 물었습니다. 안전한 방법으로 설정하세요.",
      steps: [
        { title: "IAM 역할 생성", desc: "EC2용 IAM 역할을 생성하세요." },
        { title: "S3 권한 연결", desc: "역할에 AmazonS3FullAccess를 연결하세요." },
        { title: "EC2에 역할 연결", desc: "EC2 인스턴스에 IAM 역할을 관련지으세요." },
      ],
      explanation: "EC2가 IAM 역할을 사용하면 인스턴스 메타데이터 서비스가 임시 자격증명을 자동으로 발급합니다. 액세스 키 하드코딩은 누출 위험이 높으므로 역할 사용이 권장됩니다.",
    },
    4: {
      title: "SEC-04 고객 데이터 버킷 보호",
      scenario: "고객 주문 데이터가 S3에 저장되어 있습니다. 보안 감사에서 버킷이 공개될 수 있다고 지적했습니다. 특정 Lambda 함수만 액세스할 수 있도록 잠그세요.",
      steps: [
        { title: "모든 퍼블릭 액세스 차단", desc: "orders-data-bucket에 대한 모든 퍼블릭 액세스를 차단하세요." },
        { title: "버킷 정책 적용", desc: "특정 Lambda ARN만 허용하는 버킷 정책을 적용하세요." },
        { title: "설정 확인", desc: "퍼블릭 액세스 차단이 올바르게 구성되었는지 확인하세요." },
      ],
      explanation: "S3 보호는 두 가지 계층이 있습니다. 퍼블릭 액세스 차단은 계정이나 버킷 전체를 보호하는 안전망이고 버킷 정책은 Lambda ARN 같은 특정 주체만 허용하는 세밀한 제어입니다.",
    },
    5: {
      title: "SEC-05 규정 준수 데이터 암호화",
      scenario: "핀테크 스타트업이 금융 데이터를 S3에 저장합니다. 규제당국에서 고객 데이터를 고객 회사가 관리하는 키로 암호화해야 한다는 요구사항이 나왔습니다.",
      steps: [
        { title: "KMS CMK 생성", desc: "금융 데이터 암호화용 CMK를 생성하세요." },
        { title: "KMS 별칭 생성", desc: "키 ID 대신 사용할 별칭을 생성하세요." },
        { title: "S3 SSE-KMS 설정", desc: "fintech-data-bucket의 기본 암호화를 SSE-KMS로 설정하세요." },
      ],
      explanation: "SSE-KMS는 S3가 KMS API를 호출하여 암호화 및 복호화를 수행함을 의미합니다. 고객 관리 키를 사용하면 키 정책을 통해 액세스를 제어하고 CloudTrail을 통해 키 사용을 감사할 수 있습니다.",
    },
    6: {
      title: "SEC-06 웹 서버를 위한 최소 권한 네트워크 설정",
      scenario: "EC2 웹 서버가 공격을 받고 있습니다. 보안 그룹이 0.0.0.0/0에 완전히 열려 있습니다. 웹 트래픽만 허용하고 SSH는 사무실 IP 범위에서만 허용하세요.",
      steps: [
        { title: "현재 보안 그룹 규칙 확인", desc: "보안 그룹의 현재 인바운드 규칙을 점검하세요." },
        { title: "완전히 열린 규칙 제거", desc: "0.0.0.0/0 허용 규칙을 즉시 삭제하세요." },
        { title: "HTTPS 규칙 추가", desc: "모두에게 HTTPS 허용하고 SSH는 사무실 IP만 제한하세요." },
      ],
      explanation: "보안 그룹은 상태 유지 방화벽이고 허용 규칙만 있습니다. 필요한 포트만 열어 최소 권한 원칙을 적용하고 관리 SSH는 항상 특정 IP로 제한하세요.",
    },
    7: {
      title: "SEC-07 크로스 계정 배포 파이프라인",
      scenario: "개발 계정 A의 CI/CD 파이프라인이 프로덕션 계정 B의 S3 버킷에 빌드 결과물을 배포해야 합니다. 프로덕션 액세스 키를 개발팀에 주는 것은 불가능합니다.",
      steps: [
        { title: "크로스 계정 역할 생성", desc: "개발 계정을 신뢰하는 프로덕션 계정에 역할을 생성하세요." },
        { title: "임시 자격증명 발급", desc: "개발 계정에서 STS assume-role을 사용하여 임시 자격증명을 받으세요." },
        { title: "프로덕션 S3에 배포", desc: "임시 자격증명으로 파일을 프로덕션 S3 버킷에 업로드하세요." },
      ],
      explanation: "STS AssumeRole은 임시 자격증명을 발급하며 일반적으로 최대 12시간 유효합니다. 크로스 계정 역할의 신뢰 정책은 명시적으로 개발 계정을 지정해야 합니다. 이는 영구 액세스 키를 공유하는 것보다 훨씬 안전합니다.",
    },
    8: {
      title: "SEC-08 보안 인시던트 - 누가 삭제했나?",
      scenario: "어느 날 아침 프로덕션 DB 스냅샷이 사라졌습니다. 아무도 삭제했다고 하지 않습니다. CTO가 범인을 찾기 위해 전체 AWS API 호출 기록을 요청했습니다.",
      steps: [
        { title: "CloudTrail 추적 생성", desc: "모든 리전의 API 호출을 S3에 기록하는 추적을 생성하세요." },
        { title: "추적 로깅 시작", desc: "추적에 대한 로깅을 활성화하세요." },
        { title: "삭제 이벤트 쿼리", desc: "DeleteDBSnapshot 이벤트를 트리거한 사용자를 조회하세요." },
      ],
      explanation: "CloudTrail은 AWS 계정의 모든 API 호출을 기록합니다. lookup-events 명령을 사용하면 이벤트 이름이나 사용자 이름으로 빠르게 검색할 수 있어 보안 인시던트 조사에 필수적입니다.",
    },
    9: {
      title: "SEC-09 코드에서 DB 암호 제거",
      scenario: "코드 검토 중 GitHub 코드에 RDS 암호가 하드코딩되어 있는 것을 발견했습니다. 보안팀에서 즉시 수정을 요구했습니다. 암호 조회를 안전한 방식의 런타임으로 이동하세요.",
      steps: [
        { title: "Secrets Manager에 보안 암호 저장", desc: "DB 자격증명을 Secrets Manager에 저장하세요." },
        { title: "런타임에 보안 암호 읽기", desc: "애플리케이션이 런타임에 자격증명을 가져오는지 확인하세요." },
        { title: "자동 로테이션 설정", desc: "암호가 90일마다 로테이션되도록 구성하세요." },
      ],
      explanation: "Secrets Manager는 자격증명을 안전하게 저장하고 애플리케이션이 SDK나 CLI를 사용하여 런타임에 가져올 수 있게 합니다. 자동 로테이션은 정기적으로 암호를 갱신하여 누출의 영향을 줄입니다.",
    },
    10: {
      title: "SEC-10 서브넷 수준에서 트래픽 차단",
      scenario: "보안 감사에서 보안 그룹만으로는 부족하다고 결론지었습니다. 서브넷 계층에서 두 번째 방어선이 필요합니다. NACL로 알려진 악성 CIDR을 차단하세요.",
      steps: [
        { title: "사용자 정의 NACL 생성", desc: "VPC에 새 사용자 정의 NACL을 생성하세요." },
        { title: "악성 IP 차단 규칙 추가", desc: "192.168.100.0/24 범위에 대한 인바운드 거부 규칙을 추가하세요." },
        { title: "NACL을 서브넷에 연결", desc: "새 NACL을 개인 서브넷에 연결하세요." },
      ],
      explanation: "네트워크 ACL은 서브넷 계층의 상태 비저장 방화벽입니다. 규칙은 순서대로 평가되며 일치하는 거부 규칙은 트래픽을 즉시 차단합니다. 보안 그룹과 함께 사용하면 계층화된 방어를 제공합니다.",
    },
    11: {
      title: "SEC-11 퇴사자 즉시 오프보딩",
      scenario: "마케팅팀 직원이 예상 외로 사직했습니다. HR에서 이 사람의 AWS 액세스를 즉시 차단해달고 요청했습니다. 계정을 완전히 정리하세요.",
      steps: [
        { title: "액세스 키 목록 확인", desc: "사용자의 현재 액세스 키를 점검하세요." },
        { title: "액세스 키 비활성화", desc: "사용자의 액세스 키를 즉시 비활성화하세요." },
        { title: "콘솔 암호 삭제", desc: "사용자의 콘솔 로그인 프로필을 삭제하세요." },
        { title: "그룹에서 제거", desc: "marketing-team 그룹에서 사용자를 제거하세요." },
        { title: "사용자 삭제", desc: "모든 액세스가 차단된 후 IAM 사용자를 삭제하세요." },
      ],
      explanation: "올바른 오프보딩 순서는 키 확인, 비활성화, 콘솔 로그인 삭제, 그룹 제거, 사용자 삭제입니다. 먼저 비활성화하면 감사 로그가 보존되고 실수가 발생한 경우 복구 여지가 있습니다.",
    },
    12: {
      title: "SEC-12 IAM 계정 보안 강화",
      scenario: "보안 감사에서 중대한 문제를 발견했습니다: 루트 계정에 MFA가 없고 암호 정책이 너무 약합니다. 자격증명 보고서를 검토하고 암호 정책을 강화하세요.",
      steps: [
        { title: "자격증명 보고서 생성", desc: "IAM 자격증명 보고서를 생성하세요." },
        { title: "보고서 보기", desc: "생성된 자격증명 보고서를 여세요." },
        { title: "가상 MFA 디바이스 생성", desc: "루트 계정용 가상 MFA 디바이스를 생성하세요." },
        { title: "암호 정책 강화", desc: "최소 14자, 대소문자, 숫자, 특수 문자, 90일 만료를 설정하세요." },
      ],
      explanation: "IAM 자격증명 보고서 CSV는 계정의 모든 사용자에 대한 MFA 상태, 마지막 암호 사용, 액세스 키 상태를 한 곳에 보여줍니다. CIS 벤치마크는 최소 14자, 90일 로테이션, MFA를 권장합니다.",
    },
    13: {
      title: "SEC-13 삭제된 파일 복구",
      scenario: "배포 스크립트 버그가 프로덕션 S3 버킷의 구성 파일을 실수로 삭제했습니다. 버전 관리 상태를 확인하고 파일을 복구하며 MFA Delete를 활성화하여 향후 이런 일이 발생하지 않도록 하세요.",
      steps: [
        { title: "버전 관리 상태 확인", desc: "config-bucket의 버전 관리 상태를 확인하세요." },
        { title: "삭제된 파일 버전 목록", desc: "app-config.json의 모든 버전과 삭제 마커를 나열하세요." },
        { title: "삭제 마커를 제거하여 복구", desc: "삭제 마커를 삭제하여 파일을 복구하세요." },
        { title: "복구 확인", desc: "파일이 성공적으로 복구되었는지 확인하세요." },
      ],
      explanation: "S3 버전 관리에서 삭제하면 데이터를 즉시 제거하는 대신 삭제 마커를 추가합니다. 마커를 VersionId로 삭제하면 파일이 복구됩니다. MFA Delete는 MFA를 요구하여 삭제 마커 추가를 방지하고 실수 삭제를 방지합니다.",
    },
    14: {
      title: "SEC-14 GuardDuty 위협 감지 및 경고",
      scenario: "사실 후에 EC2 인스턴스가 비정상 리전에서 갑자기 생성되었다는 경고를 받았습니다. GuardDuty를 활성화하고 감지에 대한 실시간 SNS 경고를 구성하세요.",
      steps: [
        { title: "GuardDuty 활성화", desc: "현재 리전에서 GuardDuty를 활성화하세요." },
        { title: "경고 SNS 주제 생성", desc: "보안 경고용 SNS 주제를 생성하세요." },
        { title: "조사 결과 나열", desc: "GuardDuty에서 보고한 조사 결과를 검토하세요." },
        { title: "조사 결과 세부 정보 보기", desc: "선택한 조사 결과의 세부 정보를 검사하세요." },
      ],
      explanation: "GuardDuty는 머신러닝을 사용하여 CloudTrail, VPC Flow Logs, DNS 쿼리를 분석하여 TOR 액세스, 비정상 리전 활동, 자격증명 유출 패턴을 감지합니다. EventBridge 및 SNS를 연결하면 실시간 이메일 또는 Slack 경고를 사용할 수 있습니다.",
    },
    15: {
      title: "SEC-15 Lambda를 최소 권한으로 축소",
      scenario: "S3에서 읽고 DynamoDB에 쓰는 Lambda 함수가 AdministratorAccess로 실행되고 있습니다. 실제로 필요한 권한만 허용하는 사용자 정의 정책으로 바꾸세요.",
      steps: [
        { title: "현재 Lambda 역할 확인", desc: "data-processor Lambda의 현재 실행 역할을 검사하세요." },
        { title: "사용자 정의 IAM 정책 생성", desc: "S3 읽기 및 DynamoDB 쓰기만 허용하는 사용자 정의 정책을 생성하세요." },
        { title: "최소 권한 역할 생성", desc: "Lambda용 최소 권한 역할을 생성하세요." },
        { title: "정책을 역할에 연결", desc: "사용자 정의 정책을 새 역할에 연결하세요." },
        { title: "Lambda 역할 바꾸기", desc: "Lambda 함수를 최소 권한 역할로 전환하세요." },
      ],
      explanation: "Lambda의 AdministratorAccess는 절대 허용되지 않습니다. 실제 최소 권한 정책은 S3:GetObject, DynamoDB:PutItem 같은 실제로 사용되는 API 작업만 허용하고 리소스 ARN도 좁혀야 합니다.",
    },
    16: {
      title: "SEC-16 90일 이상된 액세스 키 로테이션",
      scenario: "보안 정책에 따라 IAM 액세스 키를 90일마다 로테이션해야 합니다. dev-user 키가 120일 됐습니다. 새 키를 안전하게 로테이션하고 기존 키를 정리하세요.",
      steps: [
        { title: "현재 키 확인", desc: "dev-user의 현재 액세스 키 및 생성 날짜를 검토하세요." },
        { title: "새 액세스 키 생성", desc: "dev-user용 새 액세스 키를 생성하세요." },
        { title: "기존 키 비활성화", desc: "새 키가 사용 중인 후 기존 키를 비활성화하세요." },
        { title: "기존 키 삭제", desc: "새 키가 작동함을 확인한 후 기존 키를 삭제하세요." },
      ],
      explanation: "안전한 로테이션 순서는 새 키 생성, 테스트, 기존 키 비활성화, 정상 작동 확인(시간), 기존 키 삭제입니다. 먼저 비활성화하면 문제가 발생한 경우 복구 옵션이 보존됩니다.",
    },
    17: {
      title: "SEC-17 루트 로그인을 위한 실시간 경고",
      scenario: "보안팀은 루트 계정이 로그인할 때마다 실시간으로 알고 싶어 합니다. CloudTrail에서 CloudWatch Logs로 SNS 경고 체인을 구축하세요.",
      steps: [
        { title: "SNS 주제 생성", desc: "보안 경고용 SNS 주제를 생성하세요." },
        { title: "이메일 구독 추가", desc: "security-alerts 주제에 이메일 구독을 추가하세요." },
        { title: "메트릭 필터 생성", desc: "CloudTrail 로그의 루트 로그인 이벤트를 감지하는 메트릭 필터를 생성하세요." },
        { title: "CloudWatch 경보 생성", desc: "루트 계정이 로그인할 때 SNS 알림을 보내는 경보를 생성하세요." },
      ],
      explanation: "CloudTrail, CloudWatch Logs, 메트릭 필터, CloudWatch 경보, SNS 알림의 체인으로 실시간 보안 모니터링을 구축합니다. 루트 로그인 모니터링은 CIS AWS Foundations 벤치마크의 필수 항목입니다.",
    },
    18: {
      title: "SEC-18 S3 액세스 로깅 활성화",
      scenario: "개인정보 감사에서 S3 버킷의 누가 어떤 파일을 언제 읽었는지 기록이 없다고 지적했습니다. 로그 버킷을 생성하고 액세스 기록을 유지하세요.",
      steps: [
        { title: "로그 버킷 생성", desc: "액세스 로그용 별도 버킷을 생성하세요." },
        { title: "서버 액세스 로깅 활성화", desc: "고객 데이터 액세스 로그를 로그 버킷으로 보내세요." },
        { title: "로깅 설정 확인", desc: "로깅이 올바르게 구성되었는지 확인하세요." },
        { title: "로그 파일 존재 확인", desc: "로그 파일이 로그 버킷에 저장되고 있는지 확인하세요." },
      ],
      explanation: "S3 서버 액세스 로깅은 버킷에 대한 모든 요청을 기록합니다. 원본 및 로그 버킷이 같은 리전에 있어야 하고 로그 전달은 몇 분 정도 지연될 수 있습니다. Athena로 로그를 쿼리할 수 있습니다.",
    },
    19: {
      title: "SEC-19 환경 변수 대신 Parameter Store 사용",
      scenario: "API 키 및 DB 연결 문자열이 Lambda 환경 변수에 평문으로 저장되어 있습니다. SSM Parameter Store로 이동하고 Lambda 환경 변수에서 제거하세요.",
      steps: [
        { title: "DB URL을 SecureString으로 저장", desc: "DB 연결 문자열을 암호화된 파라미터로 저장하세요." },
        { title: "API 키를 SecureString으로 저장", desc: "외부 API 키도 SecureString으로 저장하세요." },
        { title: "복호화된 조회 확인", desc: "런타임 코드가 파라미터를 가져와 복호화할 수 있는지 확인하세요." },
        { title: "Lambda 환경 변수 제거", desc: "Lambda 환경 변수에서 민감한 값을 제거하세요." },
      ],
      explanation: "SSM Parameter Store SecureString 값은 KMS로 암호화됩니다. Lambda는 SDK를 통해 런타임에 가져올 수 있어 평문 환경 변수에 보안 암호를 저장하는 것보다 훨씬 안전합니다. --with-decryption 없으면 암호화된 값이 반환됩니다.",
    },
    20: {
      title: "SEC-20 SSRF를 차단하기 위해 IMDSv2 강제",
      scenario: "EC2에서 실행 중인 웹 앱에 SSRF 취약점이 있습니다. 공격자가 인스턴스 메타데이터 서비스에 도달하여 IAM 자격증명을 탈취할 수 있습니다. IMDSv2를 강제하고 새 인스턴스에 대해서도 계정 기본값을 설정하세요.",
      steps: [
        { title: "IMDSv1 사용 확인", desc: "EC2 인스턴스의 현재 메타데이터 옵션을 검사하세요." },
        { title: "IMDSv2 강제", desc: "HttpTokens를 required로 설정하여 IMDSv2만 허용하세요." },
        { title: "변경 확인", desc: "IMDSv2 적용이 활성화되었는지 확인하세요." },
        { title: "새 인스턴스의 기본값 설정", desc: "모든 새로 시작되는 인스턴스에 IMDSv2를 기본값으로 설정하세요." },
      ],
      explanation: "IMDSv1은 간단한 HTTP GET으로 자격증명을 가져올 수 있어 SSRF가 악용할 수 있습니다. IMDSv2는 먼저 세션 토큰이 필요하므로 단순한 SSRF는 자격증명에 도달할 수 없습니다. 계정 기본값을 설정하면 향후 인스턴스도 보호됩니다.",
    },
    21: {
      title: "SEC-21 VPC Flow Logs로 트래픽 감사",
      scenario: "보고서에서 특정 EC2 인스턴스가 외부 IP와 통신하는 것으로 보이지만 VPC 트래픽 로그가 없어서 확인할 수 없다고 합니다. Flow Logs를 활성화하고 의심스러운 트래픽을 조사하세요.",
      steps: [
        { title: "로그 그룹 생성", desc: "VPC Flow Logs용 CloudWatch 로그 그룹을 생성하세요." },
        { title: "VPC Flow Logs 활성화", desc: "VPC에서 Flow Logs를 활성화하여 모든 트래픽을 기록하세요." },
        { title: "Flow Logs 상태 확인", desc: "Flow Logs가 ACTIVE인지 확인하세요." },
        { title: "로그 스트림 쿼리", desc: "로그 그룹에서 생성된 스트림을 검사하세요." },
      ],
      explanation: "VPC Flow Logs는 ENI의 IP 트래픽을 캡처합니다. ACCEPT 또는 REJECT와 함께 원본 및 대상 IP와 포트를 기록하므로 보안 조사에 필수적입니다. CloudWatch Logs Insights는 특정 IP 및 포트를 쿼리할 수 있습니다.",
    },
    22: {
      title: "SEC-22 모든 S3 업로드에 암호화 강제",
      scenario: "팀원이 암호화 헤더 없이 실수로 고객 PII를 S3으로 업로드했습니다. 기본 암호화를 설정하고 버킷 정책을 사용하여 암호화되지 않은 업로드와 HTTP 액세스를 모두 차단하세요.",
      steps: [
        { title: "현재 암호화 확인", desc: "secure-uploads의 현재 암호화 설정을 검사하세요." },
        { title: "기본 SSE-S3 설정", desc: "기본 SSE-S3 암호화를 활성화하세요." },
        { title: "암호화 확인", desc: "기본 암호화가 활성화되었는지 확인하세요." },
        { title: "HTTPS 전용 정책 적용", desc: "암호화되지 않은 업로드와 HTTP 액세스를 거부하는 버킷 정책을 적용하세요." },
      ],
      explanation: "기본 암호화는 암호화 헤더를 포함하지 않는 업로드를 보호하지만 명시적으로 암호화 없음을 요청하는 것은 차단하지 않습니다. 완전히 적용하려면 aws:SecureTransport가 false인 요청 및 암호화 조건을 만족하지 않는 요청을 거부하세요.",
    },
    23: {
      title: "SEC-23 보안 그룹의 개방 SSH 자동 감지",
      scenario: "개발자가 디버깅을 위해 SSH 포트 22를 0.0.0.0/0으로 열었습니다. AWS Config를 사용하여 실수를 자동으로 감지하고 위반에 대한 자동 수정을 구성하세요.",
      steps: [
        { title: "AWS Config Recorder 활성화", desc: "AWS Config를 사용하여 보안 그룹 변경 기록을 시작하세요." },
        { title: "전달 채널 설정", desc: "S3에 Config 결과를 저장하는 전달 채널을 구성하세요." },
        { title: "restricted-ssh 규칙 추가", desc: "SSH가 전 세계에 열려 있는 것을 감지하는 관리형 Config 규칙을 추가하세요." },
        { title: "준수 상태 확인", desc: "restricted-ssh 규칙의 준수 상태를 검토하세요." },
      ],
      explanation: "AWS Config는 리소스 구성 변경을 지속적으로 기록하고 관리형 규칙을 통해 준수 상태를 평가합니다. restricted-ssh 규칙은 포트 22가 0.0.0.0/0으로 열려 있는 것을 NON_COMPLIANT로 표시하고 Systems Manager 자동화와 쌍을 이루어 자동 수정할 수 있습니다.",
    },
    24: {
      title: "SEC-24 IAM Access Analyzer로 공개된 리소스 찾기",
      scenario: "외부에서 액세스할 수 있는 계정의 모든 리소스를 찾아야 합니다. Access Analyzer로 자동 감지하고 조사 결과를 처리하세요.",
      steps: [
        { title: "IAM Access Analyzer 생성", desc: "전체 계정을 스캔하는 분석기를 생성하세요." },
        { title: "공개 액세스 가능 리소스 나열", desc: "Access Analyzer가 외부에서 액세스 가능한 것으로 발견한 리소스를 나열하세요." },
        { title: "조사 결과 세부 정보 보기", desc: "조사 결과의 세부 정보를 검사하세요." },
        { title: "조사 결과 보관", desc: "수정 후 조사 결과를 보관하세요." },
      ],
      explanation: "IAM Access Analyzer는 S3 버킷 정책, IAM 역할 신뢰 정책, KMS 키 정책을 검사하여 외부에서 액세스 가능한 리소스를 찾습니다. 문제를 수정한 후 조사 결과를 ARCHIVED로 표시하면 활성 주의에서 제거됩니다.",
    },
    25: {
      title: "SEC-25 S3 버킷 공개 ACL 대량 확인",
      scenario: "일부 레거시 버킷이 여전히 공개 ACL을 가질 수 있다는 우려가 있습니다. ACL을 확인하고 문제 버킷을 수정한 후 계정 수준에서 퍼블릭 액세스를 차단하세요.",
      steps: [
        { title: "모든 버킷 나열", desc: "현재 계정의 모든 S3 버킷을 나열하세요." },
        { title: "문제 버킷 ACL 확인", desc: "old-backup-2023 버킷의 ACL을 검사하세요." },
        { title: "버킷 ACL을 개인으로 설정", desc: "old-backup-2023 버킷 ACL을 개인으로 변경하세요." },
        { title: "계정 수준에서 퍼블릭 액세스 차단", desc: "전체 계정에 S3 퍼블릭 액세스 차단을 적용하세요." },
      ],
      explanation: "계정 수준 S3 퍼블릭 액세스 차단은 모든 버킷에 동시에 적용됩니다. IgnorePublicAcls=true는 기존 공개 ACL을 중립화합니다. AWS는 새 계정에서 기본적으로 활성화할 것을 권장합니다.",
    },
    26: {
      title: "SEC-26 RDS 백업 및 스냅샷 관리 자동화",
      scenario: "재해 복구 훈련 중에 중대한 문제를 발견했습니다: RDS 자동 백업이 꺼져 있고 최근 스냅샷이 없습니다. 백업 정책을 즉시 설정하고 수동 스냅샷을 생성하세요.",
      steps: [
        { title: "RDS 백업 설정 확인", desc: "프로덕션 데이터베이스의 현재 백업 설정을 검사하세요." },
        { title: "7일 백업 보존 활성화", desc: "7일 보존으로 자동 백업을 켜세요." },
        { title: "백업 윈도 설정", desc: "트래픽이 적은 오전 3시에 백업을 예약하세요." },
        { title: "수동 스냅샷 생성", desc: "구성을 변경하기 전에 즉시 스냅샷을 생성하세요." },
      ],
      explanation: "RDS 자동 백업 보존 기간이 0이면 백업이 비활성화됨을 의미합니다. 프로덕션에서는 최소 7일의 백업을 유지해야 합니다. 트래픽이 적은 시간을 선택하고 유지 관리 윈도와 겹치지 않게 하세요.",
    },
    27: {
      title: "SEC-27 CloudFront + S3 OAI로 직접 액세스 차단",
      scenario: "정적 웹사이트가 S3에서 호스팅되고 CloudFront를 통해 배포되지만 S3 URL은 여전히 직접 액세스 가능합니다. OAI를 구성하여 CloudFront를 통해서만 액세스하도록 하세요.",
      steps: [
        { title: "현재 S3 버킷 정책 확인", desc: "static-web-content 버킷의 현재 정책을 검사하세요." },
        { title: "OAI 생성", desc: "CloudFront Origin Access Identity를 생성하세요." },
        { title: "OAI용 버킷 정책 업데이트", desc: "OAI만 허용하도록 버킷 정책을 바꾸세요." },
        { title: "S3 퍼블릭 액세스 완전히 차단", desc: "S3 버킷에 대한 모든 직접 퍼블릭 액세스를 차단하세요." },
        { title: "최종 설정 확인", desc: "퍼블릭 액세스 차단이 적용되었는지 확인하세요." },
      ],
      explanation: "OAI는 CloudFront가 S3에 도달하기 위해 사용하는 특별한 신원입니다. 버킷 정책에서 OAI만 허용하고 퍼블릭 액세스를 차단하면 S3 URL을 통한 직접 액세스는 불가능해지고 콘텐츠는 CloudFront를 통해서만 제공됩니다.",
    },
    28: {
      title: "SEC-28 Lambda 역할 신뢰 정책 오류 수정",
      scenario: "Lambda 함수가 AccessDenied: sts:AssumeRole 오류로 실패합니다. 신뢰 정책이 잘못된 Principal을 가집니다. 원인을 찾고 수정하세요.",
      steps: [
        { title: "Lambda 현재 역할 확인", desc: "lambda-processing의 현재 실행 역할을 검사하세요." },
        { title: "역할 신뢰 정책 확인", desc: "lambda-processing-role의 신뢰 정책을 검토하세요." },
        { title: "신뢰 정책 수정", desc: "Principal을 lambda.amazonaws.com으로 변경하세요." },
        { title: "수정 확인", desc: "신뢰 정책이 올바르게 업데이트되었는지 확인하세요." },
      ],
      explanation: "IAM 역할의 신뢰 정책은 누가 역할을 가정할 수 있는지 정의합니다. Lambda 역할은 lambda.amazonaws.com을 신뢰해야 합니다. 실수로 ec2.amazonaws.com으로 설정하면 Lambda는 역할을 사용할 수 없습니다.",
    },
    29: {
      title: "SEC-29 청구 경보 및 예산 제어",
      scenario: "지난달 청구서가 갑자기 5000달러로 뛰었습니다. 원인은 승인되지 않은 GPU 인스턴스 시작이었습니다. 월 500달러 이상 지출에 대한 경보를 설정하고 AWS Budgets를 구성하여 초과 지출을 방지하세요.",
      steps: [
        { title: "경고 SNS 주제 생성", desc: "청구 경고용 SNS 주제를 생성하세요." },
        { title: "이메일 구독 추가", desc: "billing-alerts 주제에 이메일 주소를 구독하세요." },
        { title: "청구 경보 생성", desc: "월간 예상이 500달러를 초과할 때 실행되는 CloudWatch 경보를 생성하세요." },
        { title: "AWS Budget 생성", desc: "500달러 월별 예산을 생성하고 80% 사용에 경고하세요." },
      ],
      explanation: "CloudWatch 청구 경보는 us-east-1 에서만 생성할 수 있습니다. AWS Budgets는 경보보다 더 자세한 비용 제어를 제공하고 서비스, 태그 또는 리전별로 설정할 수 있습니다. 함께 사용하는 것이 좋은 관행입니다.",
    },
    30: {
      title: "SEC-30 Security Hub를 사용한 완전한 보안 검토",
      scenario: "새 CTO가 오늘 오후까지 AWS 보안 상태 보고서를 요청했습니다. Security Hub로 계정 전체 보안 점수와 조사 결과를 평가한 후 주요 문제에 대해 수정 상태를 업데이트하세요.",
      steps: [
        { title: "Security Hub 활성화", desc: "CIS 벤치마크 표준으로 Security Hub를 활성화하세요." },
        { title: "중대 조사 결과 나열", desc: "심각도가 중대 이상인 보안 조사 결과를 쿼리하세요." },
        { title: "인사이트 요약 검토", desc: "가장 취약한 리소스에 대한 Security Hub 인사이트를 확인하세요." },
        { title: "수정 상태 업데이트", desc: "수정된 조사 결과를 RESOLVED로 표시하세요." },
      ],
      explanation: "AWS Security Hub는 GuardDuty, Inspector, Macie 및 기타 보안 서비스의 조사 결과를 집계합니다. CIS AWS Foundations 벤치마크 및 FSBP 제어를 지속적으로 확인합니다. 점수를 정기적으로 검토하고 조사 결과를 RESOLVED로 업데이트하는 것이 중요합니다.",
    },
  },
  en: {
    1: {
      title: "SEC-01 New Developer Onboarding",
      scenario: "A new backend developer, Kim Dev, joined your startup AWS team today. They need read-only access to S3 and EC2 and must never be able to modify or delete resources.",
      steps: [
        { title: "Create IAM User", desc: "Create the kim-dev IAM user." },
        { title: "Attach S3 ReadOnly Policy", desc: "Attach AmazonS3ReadOnlyAccess to kim-dev." },
        { title: "Verify AccessDenied", desc: "Run a bucket delete command and confirm the permission block." },
      ],
      explanation: "Directly attaching a managed policy to an IAM user is the basic pattern. ReadOnly policies allow only List, Get, and Describe actions, so delete and modify commands return AccessDenied.",
    },
    2: {
      title: "SEC-02 Team-Based Permission Separation",
      scenario: "Your company grew to 5 developers and 3 operations engineers. The dev team manages EC2 only, while operations manages RDS only. Per-user policy management is getting cumbersome, so you want a group-based model.",
      steps: [
        { title: "Create dev-team Group", desc: "Create an IAM group for the development team." },
        { title: "Attach EC2 Policy", desc: "Attach AmazonEC2FullAccess to dev-team." },
        { title: "Add User to Group", desc: "Add kim-dev to the dev-team group." },
      ],
      explanation: "Using IAM groups lets you grant and revoke permissions by adding or removing users from the group. It reduces operational mistakes compared with managing policies per person.",
    },
    3: {
      title: "SEC-03 EC2 Needs S3 Access",
      scenario: "A production EC2 server must upload log files to S3 every night. A developer asked whether it is acceptable to hard-code access keys into EC2. Set it up in a secure way instead.",
      steps: [
        { title: "Create IAM Role", desc: "Create an IAM role for EC2." },
        { title: "Attach S3 Permission", desc: "Attach AmazonS3FullAccess to the role." },
        { title: "Attach Role to EC2", desc: "Associate the role with the EC2 instance." },
      ],
      explanation: "When EC2 uses an IAM role, the instance metadata service issues temporary credentials automatically. Hard-coding access keys is risky because keys can leak, so using a role is the recommended practice.",
    },
    4: {
      title: "SEC-04 Protect the Customer Data Bucket",
      scenario: "Customer order data is stored in S3. A security audit warned that the bucket could be exposed publicly. Lock the bucket so that only a specific Lambda function can access it.",
      steps: [
        { title: "Block All Public Access", desc: "Block every public access path for the orders-data-bucket." },
        { title: "Apply Bucket Policy", desc: "Apply a bucket policy that allows only a specific Lambda ARN." },
        { title: "Verify Settings", desc: "Confirm that public access blocking is configured correctly." },
      ],
      explanation: "S3 protection has two layers. Block Public Access protects the account or bucket as a safety net, while bucket policy provides fine-grained control for a specific principal such as a Lambda ARN.",
    },
    5: {
      title: "SEC-05 Compliance Encryption Requirement",
      scenario: "A fintech startup stores financial data in S3. Regulators now require that customer data be encrypted with a key managed by the customer company.",
      steps: [
        { title: "Create KMS CMK", desc: "Create a CMK for encrypting financial data." },
        { title: "Create KMS Alias", desc: "Create an alias to use instead of the key ID." },
        { title: "Set S3 SSE-KMS", desc: "Set SSE-KMS as the default encryption for fintech-data-bucket." },
      ],
      explanation: "SSE-KMS means S3 calls the KMS API to encrypt and decrypt data. A customer-managed key lets you control access through key policy and audit key usage through CloudTrail.",
    },
  },
  ja: {
    1: {
      title: "SEC-01 新人開発者のオンボーディング",
      scenario: "スタートアップのAWS管理者であるあなたのチームに、バックエンド開発者のキムが入社しました。S3とEC2には読み取り専用でのみアクセスでき、変更や削除はできてはいけません。",
      steps: [
        { title: "IAMユーザーを作成", desc: "kim-dev のIAMユーザーを作成してください。" },
        { title: "S3 ReadOnlyポリシーを付与", desc: "AmazonS3ReadOnlyAccess を kim-dev に付与してください。" },
        { title: "AccessDeniedを確認", desc: "バケット削除コマンドを実行して権限制限を確認してください。" },
      ],
      explanation: "IAMユーザーにマネージドポリシーを直接付与するのは基本パターンです。ReadOnlyポリシーは List、Get、Describe のみ許可するため、削除や変更コマンドは AccessDenied になります。",
    },
    2: {
      title: "SEC-02 チーム別の権限分離",
      scenario: "会社の規模が拡大し、開発チーム5人と運用チーム3人になりました。開発チームはEC2のみ、運用チームはRDSのみを管理します。個別ユーザーごとのポリシー管理は面倒なので、グループベースに切り替えます。",
      steps: [
        { title: "dev-teamグループを作成", desc: "開発チーム用のIAMグループを作成してください。" },
        { title: "EC2ポリシーを付与", desc: "dev-team に AmazonEC2FullAccess を付与してください。" },
        { title: "ユーザーをグループへ追加", desc: "kim-dev を dev-team グループに追加してください。" },
      ],
      explanation: "IAMグループを使うと、ユーザーの追加と削除だけで権限を付与・回収できます。個別ポリシー管理より運用ミスを大きく減らせます。",
    },
    3: {
      title: "SEC-03 EC2がS3へアクセスする必要がある場合",
      scenario: "稼働中のEC2サーバーは、毎晩ログファイルをS3へ自動アップロードしなければなりません。開発者が「アクセスキーをEC2へハードコードしてもいいですか」と聞いてきました。安全な方法で設定してください。",
      steps: [
        { title: "IAM Roleを作成", desc: "EC2用のIAM Roleを作成してください。" },
        { title: "S3権限を付与", desc: "Roleに AmazonS3FullAccess を付与してください。" },
        { title: "EC2へRoleを関連付け", desc: "EC2インスタンスにIAM Roleを関連付けてください。" },
      ],
      explanation: "EC2がIAM Roleを使うと、インスタンスメタデータサービスが一時クレデンシャルを自動発行します。アクセスキーのハードコードは漏えいリスクが高いため、Roleの利用が推奨です。",
    },
    4: {
      title: "SEC-04 顧客データバケットの保護",
      scenario: "S3には顧客注文データが保存されています。セキュリティ監査で、バケットが公開される可能性があると指摘されました。特定のLambda関数だけがアクセスできるようにロックしてください。",
      steps: [
        { title: "パブリックアクセスを全面遮断", desc: "orders-data-bucket の公開アクセスをすべて遮断してください。" },
        { title: "バケットポリシーを適用", desc: "特定のLambda ARNだけを許可するバケットポリシーを適用してください。" },
        { title: "設定を確認", desc: "パブリックアクセス遮断が正しく設定されているか確認してください。" },
      ],
      explanation: "S3保護には2つの層があります。Block Public Access はアカウントやバケット全体を守る安全網で、バケットポリシーは Lambda ARN など特定のPrincipalだけを許可する細かな制御です。",
    },
    5: {
      title: "SEC-05 コンプライアンス向けデータ暗号化",
      scenario: "フィンテックのスタートアップが金融データをS3に保存しています。規制当局から、顧客データは顧客企業が管理するキーで暗号化しなければならないという要件が出ました。",
      steps: [
        { title: "KMS CMKを作成", desc: "金融データ暗号化用のCMKを作成してください。" },
        { title: "KMS Aliasを作成", desc: "キーIDの代わりに使う alias を作成してください。" },
        { title: "S3 SSE-KMSを設定", desc: "fintech-data-bucket の既定暗号化を SSE-KMS にしてください。" },
      ],
      explanation: "SSE-KMS では S3 が KMS API を呼び出して暗号化と復号を行います。顧客管理キーを使うと、キー ポリシーでアクセスを細かく制御し、CloudTrail で利用履歴を監査できます。",
    },
    6: {
      title: "SEC-06 Least-Privilege Network Setup for a Web Server",
      scenario: "An EC2 web server is under attack. Its security group is wide open at 0.0.0.0/0. Allow only web traffic, and allow SSH only from the office IP range.",
      steps: [
        { title: "Check Current SG Rules", desc: "Inspect the current inbound rules on the security group." },
        { title: "Remove Wide-Open Rule", desc: "Delete the 0.0.0.0/0 allow rule immediately." },
        { title: "Add HTTPS Rule", desc: "Allow HTTPS for everyone, and restrict SSH to the office IP only." },
      ],
      explanation: "A security group is a stateful firewall with only allow rules. Apply the least-privilege principle by opening only the ports you need, and always restrict management SSH to specific IP addresses.",
    },
    7: {
      title: "SEC-07 Cross-Account Deployment Pipeline",
      scenario: "A CI/CD pipeline in development account A must deploy build artifacts to an S3 bucket in production account B. Giving the production access key to the dev team is not acceptable.",
      steps: [
        { title: "Create Cross-Account Role", desc: "Create a role in the production account that trusts the development account." },
        { title: "Issue Temporary Credentials", desc: "Use STS assume-role in the development account to get temporary credentials." },
        { title: "Deploy to Production S3", desc: "Upload the file to the production S3 bucket with the temporary credentials." },
      ],
      explanation: "STS AssumeRole issues temporary credentials, usually for up to 12 hours. The trust policy on the cross-account role must explicitly name the development account. This is much safer than sharing permanent access keys.",
    },
    8: {
      title: "SEC-08 Security Incident - Who Deleted It?",
      scenario: "One morning, a production DB snapshot was gone. Nobody claims to have deleted it. The CTO asked for a full AWS API call history so the culprit can be found.",
      steps: [
        { title: "Create CloudTrail Trail", desc: "Create a trail that records API calls from all regions into S3." },
        { title: "Start Trail Logging", desc: "Enable logging for the trail." },
        { title: "Query Delete Event", desc: "Look up the user who triggered the DeleteDBSnapshot event." },
      ],
      explanation: "CloudTrail records every API call in an AWS account. The lookup-events command lets you search quickly by event name or user name, which makes it essential for security incident investigations.",
    },
    9: {
      title: "SEC-09 Remove the DB Password from Code",
      scenario: "During code review, you find an RDS password hard-coded in GitHub code. Security demands an immediate fix. Move the password retrieval to runtime in a safe way.",
      steps: [
        { title: "Store Secret in Secrets Manager", desc: "Save the DB credentials in Secrets Manager." },
        { title: "Read Secret at Runtime", desc: "Confirm that the application fetches credentials at runtime." },
        { title: "Set Automatic Rotation", desc: "Configure the password to rotate every 90 days." },
      ],
      explanation: "Secrets Manager stores credentials securely and lets applications fetch them at runtime with the SDK or CLI. Automatic rotation refreshes passwords periodically and reduces the impact of leaks.",
    },
    10: {
      title: "SEC-10 Block Traffic at the Subnet Level",
      scenario: "A security audit concluded that security groups alone are not enough. A second line of defense is needed at the subnet layer to block specific IP ranges. Block a known malicious CIDR with a NACL.",
      steps: [
        { title: "Create Custom NACL", desc: "Create a new custom NACL for the VPC." },
        { title: "Add Malicious IP Block Rule", desc: "Add an inbound DENY rule for the 192.168.100.0/24 range." },
        { title: "Attach NACL to Subnet", desc: "Attach the new NACL to the private subnet." },
      ],
      explanation: "A network ACL is a stateless firewall at the subnet layer. Rules are evaluated in order, and a matching DENY rule blocks traffic immediately. Using it with security groups provides layered defense.",
    },
    11: {
      title: "SEC-11 Immediate Offboarding for a Leaver",
      scenario: "A marketing team employee resigned unexpectedly today. HR urgently asked to block this person from AWS right away. Clean up the account completely.",
      steps: [
        { title: "Check Access Key List", desc: "Inspect the user’s current access keys." },
        { title: "Disable Access Keys", desc: "Disable the user’s access keys immediately." },
        { title: "Delete Console Password", desc: "Delete the user’s console login profile." },
        { title: "Remove from Group", desc: "Remove the user from the marketing-team group." },
        { title: "Delete the User", desc: "Delete the IAM user after all access is blocked." },
      ],
      explanation: "The correct offboarding sequence is key check, disable, console login deletion, group removal, then user deletion. Disabling first preserves audit logs and leaves room for recovery if a mistake was made.",
    },
    12: {
      title: "SEC-12 Strengthen IAM Account Security",
      scenario: "A security audit found a critical issue: the root account has no MFA and the password policy is too weak. Review the credential report and harden the password policy.",
      steps: [
        { title: "Create Credential Report", desc: "Generate the IAM credential report." },
        { title: "View Report", desc: "Open the generated credential report." },
        { title: "Create Virtual MFA Device", desc: "Create a virtual MFA device for the root account." },
        { title: "Harden Password Policy", desc: "Set a minimum of 14 characters, upper and lower case letters, numbers, special characters, and 90-day expiration." },
      ],
      explanation: "The IAM credential report CSV shows MFA status, last password use, and access key status for every user in one place. CIS Benchmark recommends a minimum of 14 characters, 90-day rotation, and MFA.",
    },
    13: {
      title: "SEC-13 Restore a Deleted File",
      scenario: "A deployment script bug accidentally deleted a config file from a production S3 bucket. Check the versioning state, restore the file, and enable MFA Delete so this does not happen again.",
      steps: [
        { title: "Check Versioning State", desc: "Check the versioning state of config-bucket." },
        { title: "List Deleted File Versions", desc: "List all versions and delete markers for app-config.json." },
        { title: "Remove Delete Marker to Restore", desc: "Delete the delete marker and restore the file." },
        { title: "Verify Recovery", desc: "Confirm that the file was restored successfully." },
      ],
      explanation: "Deleting in S3 versioning adds a delete marker instead of removing the data immediately. Deleting the marker by its VersionId restores the file. MFA Delete requires MFA to add delete markers and helps prevent accidental deletion.",
    },
    14: {
      title: "SEC-14 GuardDuty Threat Detection and Alerts",
      scenario: "You received an alert only after the fact that an EC2 instance was suddenly created in an unusual region. Enable GuardDuty and configure real-time SNS alerts for detections.",
      steps: [
        { title: "Enable GuardDuty", desc: "Enable GuardDuty in the current region." },
        { title: "Create Alert SNS Topic", desc: "Create an SNS topic for security alerts." },
        { title: "List Findings", desc: "Review the findings reported by GuardDuty." },
        { title: "View Finding Details", desc: "Inspect the details of the selected finding." },
      ],
      explanation: "GuardDuty uses machine learning to analyze CloudTrail, VPC Flow Logs, and DNS queries to detect TOR access, unusual region activity, and credential exfiltration patterns. Connecting EventBridge and SNS enables real-time email or Slack alerts.",
    },
    15: {
      title: "SEC-15 Narrow Lambda Down to Least Privilege",
      scenario: "A Lambda function that reads from S3 and writes to DynamoDB is running with AdministratorAccess. Replace it with a custom policy that allows only the permissions it actually needs.",
      steps: [
        { title: "Check Current Lambda Role", desc: "Inspect the current execution role for the data-processor Lambda." },
        { title: "Create Custom IAM Policy", desc: "Create a custom policy that allows only S3 read and DynamoDB write." },
        { title: "Create Least-Privilege Role", desc: "Create a least-privilege role for Lambda." },
        { title: "Attach Policy to Role", desc: "Attach the custom policy to the new role." },
        { title: "Replace Lambda Role", desc: "Switch the Lambda function to the least-privilege role." },
      ],
      explanation: "AdministratorAccess on Lambda is never acceptable. A real least-privilege policy should allow only the API actions that are used, such as S3:GetObject and DynamoDB:PutItem, and it should narrow the resource ARN as well.",
    },
    16: {
      title: "SEC-16 Rotate an Access Key Older Than 90 Days",
      scenario: "Your security policy requires IAM access keys to be rotated every 90 days. The dev-user key is 120 days old. Rotate the key safely and clean up the old one.",
      steps: [
        { title: "Check Existing Keys", desc: "Review the current access keys and creation date for dev-user." },
        { title: "Create New Access Key", desc: "Create a new access key for dev-user." },
        { title: "Disable Old Key", desc: "Disable the old key after the new key is in use." },
        { title: "Delete Old Key", desc: "Delete the old key after confirming the new one works." },
      ],
      explanation: "The safe rotation sequence is create a new key, test it, disable the old key, verify normal operation for a while, then delete the old key. Disabling first preserves recovery options if something goes wrong.",
    },
    17: {
      title: "SEC-17 Real-Time Alerts for Root Logins",
      scenario: "The security team wants to know in real time whenever the root account signs in. Build a CloudTrail to CloudWatch Logs to SNS alert chain.",
      steps: [
        { title: "Create SNS Topic", desc: "Create an SNS topic for security alerts." },
        { title: "Add Email Subscription", desc: "Add an email subscription to the security-alerts topic." },
        { title: "Create Metric Filter", desc: "Create a metric filter that detects root login events in CloudTrail logs." },
        { title: "Create CloudWatch Alarm", desc: "Create an alarm that sends SNS notifications when the root account logs in." },
      ],
      explanation: "Build real-time security monitoring with the chain CloudTrail, CloudWatch Logs, metric filter, CloudWatch alarm, and SNS notifications. Root login monitoring is also a required item in the CIS AWS Foundations Benchmark.",
    },
    18: {
      title: "SEC-18 Enable S3 Access Logging",
      scenario: "A privacy audit said there is no record of who read which file and when in the S3 bucket. Create a log bucket and keep access records.",
      steps: [
        { title: "Create Log Bucket", desc: "Create a separate bucket for access logs." },
        { title: "Enable Server Access Logging", desc: "Send customer-data access logs to the log bucket." },
        { title: "Verify Logging Settings", desc: "Confirm that logging is configured correctly." },
        { title: "Confirm Log Files Exist", desc: "Check that log files are being stored in the log bucket." },
      ],
      explanation: "S3 server access logging records every request made to the bucket. The source and log bucket must be in the same region, and log delivery can lag by a few minutes. You can query the logs with Athena.",
    },
    19: {
      title: "SEC-19 Use Parameter Store Instead of Environment Variables",
      scenario: "API keys and DB connection strings are stored in plain text in Lambda environment variables. Move them to SSM Parameter Store and remove them from Lambda environment variables.",
      steps: [
        { title: "Store DB URL as SecureString", desc: "Store the DB connection string as an encrypted parameter." },
        { title: "Store API Key as SecureString", desc: "Store the external API key as a SecureString as well." },
        { title: "Verify Decrypted Lookup", desc: "Confirm that runtime code can fetch and decrypt the parameter." },
        { title: "Remove Lambda Environment Variables", desc: "Remove the sensitive values from the Lambda environment variables." },
      ],
      explanation: "SSM Parameter Store SecureString values are encrypted with KMS. Lambda can fetch them at runtime through the SDK, which is much safer than storing secrets in plain text environment variables. Without --with-decryption, the encrypted value is returned.",
    },
    20: {
      title: "SEC-20 Force IMDSv2 to Block SSRF",
      scenario: "A web app running on EC2 has an SSRF vulnerability. An attacker could reach the instance metadata service and steal IAM credentials. Force IMDSv2 and set the account default for new instances too.",
      steps: [
        { title: "Check IMDSv1 Usage", desc: "Inspect the current metadata options for the EC2 instance." },
        { title: "Force IMDSv2", desc: "Set HttpTokens to required so only IMDSv2 is allowed." },
        { title: "Verify the Change", desc: "Confirm that IMDSv2 enforcement is active." },
        { title: "Set Default for New Instances", desc: "Make IMDSv2 the default for all newly launched instances." },
      ],
      explanation: "IMDSv1 is vulnerable because credentials can be fetched with a simple HTTP GET, which SSRF can abuse. IMDSv2 requires a session token first, so simple SSRF cannot reach credentials. Setting the account default protects future instances as well.",
    },
    21: {
      title: "SEC-21 Audit Traffic with VPC Flow Logs",
      scenario: "A report says a specific EC2 instance seems to be talking to an external IP, but there are no VPC traffic logs to confirm it. Enable Flow Logs and investigate the suspicious traffic.",
      steps: [
        { title: "Create Log Group", desc: "Create a CloudWatch log group for VPC Flow Logs." },
        { title: "Enable VPC Flow Logs", desc: "Enable Flow Logs on the VPC so all traffic is recorded." },
        { title: "Check Flow Log Status", desc: "Verify that Flow Logs are ACTIVE." },
        { title: "Query Log Stream", desc: "Inspect the streams created in the log group." },
      ],
      explanation: "VPC Flow Logs capture IP traffic on ENIs. They record ACCEPT or REJECT along with source and destination IPs and ports, which makes them essential for security investigations. CloudWatch Logs Insights can query specific IPs and ports.",
    },
    22: {
      title: "SEC-22 Force Encryption on All S3 Uploads",
      scenario: "A teammate accidentally uploaded customer PII to S3 without an encryption header. Set default encryption and use a bucket policy to block both unencrypted uploads and HTTP access.",
      steps: [
        { title: "Check Current Encryption", desc: "Inspect the current encryption settings for secure-uploads." },
        { title: "Set Default SSE-S3", desc: "Enable default SSE-S3 encryption." },
        { title: "Verify Encryption", desc: "Confirm that the default encryption is active." },
        { title: "Apply HTTPS-Only Policy", desc: "Apply a bucket policy that denies unencrypted uploads and HTTP access." },
      ],
      explanation: "Default encryption protects uploads that do not include an encryption header, but it does not block requests that explicitly ask for no encryption. To fully enforce it, deny requests with aws:SecureTransport set to false and requests that do not satisfy the encryption condition.",
    },
    23: {
      title: "SEC-23 Automatically Detect Open SSH on Security Groups",
      scenario: "A developer opened SSH port 22 to 0.0.0.0/0 for debugging. Use AWS Config to detect the mistake automatically and configure auto-remediation for violations.",
      steps: [
        { title: "Enable AWS Config Recorder", desc: "Start recording security group changes with AWS Config." },
        { title: "Set Delivery Channel", desc: "Configure the delivery channel that stores Config results in S3." },
        { title: "Add restricted-ssh Rule", desc: "Add the managed Config rule that detects SSH open to the world." },
        { title: "Check Compliance State", desc: "Review the compliance state of the restricted-ssh rule." },
      ],
      explanation: "AWS Config continuously records resource configuration changes and evaluates compliance with managed rules. The restricted-ssh rule flags port 22 open to 0.0.0.0/0 as NON_COMPLIANT and can be paired with Systems Manager Automation for auto-remediation.",
    },
    24: {
      title: "SEC-24 Find Publicly Exposed Resources with IAM Access Analyzer",
      scenario: "The request is to find every resource in your account that can be accessed from outside. Use Access Analyzer for automatic detection and handle the findings.",
      steps: [
        { title: "Create IAM Access Analyzer", desc: "Create an analyzer that scans the entire account." },
        { title: "List Publicly Accessible Resources", desc: "List the resources that Access Analyzer found to be externally accessible." },
        { title: "View Finding Details", desc: "Inspect the details of the finding." },
        { title: "Archive the Finding", desc: "Archive the finding after remediation." },
      ],
      explanation: "IAM Access Analyzer inspects S3 bucket policies, IAM role trust policies, and KMS key policies to find resources that are externally accessible. Once you remediate the issue, marking the finding as ARCHIVED removes it from active attention.",
    },
    25: {
      title: "SEC-25 Bulk Check S3 Buckets for Public ACLs",
      scenario: "There is concern that some legacy buckets may still have public ACLs. Check the ACLs, fix the problem bucket, and then block public access at the account level.",
      steps: [
        { title: "List All Buckets", desc: "List every S3 bucket in the current account." },
        { title: "Check Problem Bucket ACL", desc: "Inspect the ACL of the old-backup-2023 bucket." },
        { title: "Set Bucket ACL to Private", desc: "Change the old-backup-2023 bucket ACL to private." },
        { title: "Block Public Access at Account Level", desc: "Apply S3 public access blocking to the entire account." },
      ],
      explanation: "Account-level S3 Block Public Access applies to every bucket at once. IgnorePublicAcls=true neutralizes existing public ACLs as well. AWS recommends enabling it by default in new accounts.",
    },
    26: {
      title: "SEC-26 Automate RDS Backups and Snapshot Management",
      scenario: "During a disaster recovery drill, you discover a critical issue: RDS automatic backups are off and there is no recent snapshot. Set the backup policy immediately and create a manual snapshot.",
      steps: [
        { title: "Check RDS Backup Settings", desc: "Inspect the current backup settings for the production database." },
        { title: "Enable 7-Day Backup Retention", desc: "Turn on automated backups with seven days of retention." },
        { title: "Set Backup Window", desc: "Schedule backups for 3 AM when traffic is low." },
        { title: "Create Manual Snapshot", desc: "Create an immediate snapshot before changing the configuration." },
      ],
      explanation: "An RDS automated backup retention period of 0 means backups are disabled. In production, you should keep at least seven days of backups. Choose a low-traffic window and avoid overlapping it with maintenance windows.",
    },
    27: {
      title: "SEC-27 Block Direct Access with CloudFront + S3 OAI",
      scenario: "A static website is hosted from S3 and distributed through CloudFront, but the S3 URL is still directly accessible. Configure OAI so access works only through CloudFront.",
      steps: [
        { title: "Check Current S3 Bucket Policy", desc: "Inspect the current policy of the static-web-content bucket." },
        { title: "Create OAI", desc: "Create a CloudFront Origin Access Identity." },
        { title: "Update Bucket Policy for OAI", desc: "Replace the bucket policy so that only the OAI is allowed." },
        { title: "Fully Block S3 Public Access", desc: "Block all direct public access to the S3 bucket." },
        { title: "Verify Final Settings", desc: "Confirm that public access blocking has been applied." },
      ],
      explanation: "An OAI is the special identity CloudFront uses to reach S3. If you allow only that OAI in the bucket policy and block public access, direct access through the S3 URL is no longer possible and content is served only through CloudFront.",
    },
    28: {
      title: "SEC-28 Fix a Lambda Role Trust Policy Error",
      scenario: "A Lambda function is failing with AccessDenied: sts:AssumeRole. The trust policy has the wrong Principal. Find the cause and fix it.",
      steps: [
        { title: "Check Lambda Current Role", desc: "Inspect the current execution role for lambda-processing." },
        { title: "Check Role Trust Policy", desc: "Review the trust policy on lambda-processing-role." },
        { title: "Fix Trust Policy", desc: "Change the Principal to lambda.amazonaws.com." },
        { title: "Verify the Fix", desc: "Confirm that the trust policy was updated correctly." },
      ],
      explanation: "The trust policy on an IAM role defines who can assume it. A Lambda role must trust lambda.amazonaws.com. If it is set to ec2.amazonaws.com by mistake, Lambda cannot use the role.",
    },
    29: {
      title: "SEC-29 Billing Alerts and Budget Controls",
      scenario: "Last month the bill suddenly jumped to 5,000 dollars. The cause was an unauthorized GPU instance launch. Set alerts for spending over 500 dollars a month and configure AWS Budgets to prevent overruns.",
      steps: [
        { title: "Create Alert SNS Topic", desc: "Create an SNS topic for billing alerts." },
        { title: "Add Email Subscription", desc: "Subscribe an email address to the billing-alerts topic." },
        { title: "Create Billing Alarm", desc: "Create a CloudWatch alarm that fires when the monthly forecast exceeds 500 dollars." },
        { title: "Create AWS Budget", desc: "Create a 500 dollar monthly budget and alert at 80 percent usage." },
      ],
      explanation: "CloudWatch billing alarms can only be created in us-east-1. AWS Budgets provides more detailed cost control than alarms and can be set by service, tag, or region. Using both together is a good practice.",
    },
    30: {
      title: "SEC-30 Full Security Review with Security Hub",
      scenario: "A new CTO asked for a report on the AWS security posture by this afternoon. Use Security Hub to assess the account-wide security score and findings, then update the remediation state for the major issues.",
      steps: [
        { title: "Enable Security Hub", desc: "Enable Security Hub with the CIS Benchmark standard." },
        { title: "List Critical Findings", desc: "Query security findings with severity Critical or higher." },
        { title: "Review Insights Summary", desc: "Check Security Hub insights for the most vulnerable resources." },
        { title: "Update Remediation Status", desc: "Mark remediated findings as RESOLVED." },
      ],
      explanation: "AWS Security Hub aggregates findings from GuardDuty, Inspector, Macie, and other security services. It continuously checks CIS AWS Foundations Benchmark and FSBP controls. Regularly reviewing the score and updating findings to RESOLVED is important for tracking.",
    },
  },
};
