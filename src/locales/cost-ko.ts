type ChalI18n = {
  title: string;
  scenario: string;
  steps: Array<{ title: string; desc: string }>;
  explanation: string;
};

export const COST_CHALLENGES_I18N: Record<number, ChalI18n> = {
  1: {
    title: "AWS Budgets 알람 설정",
    scenario: "월말마다 AWS 청구서를 받고 나서야 비용 초과를 알게 됩니다. AWS Budgets로 월 $500 예산을 설정하고 80% 도달 시 이메일 알람을 받으세요.",
    steps: [
      { title: "현재 월 비용 확인", desc: "Cost Explorer로 이번 달 현재까지 발생한 비용을 확인하세요." },
      { title: "월 예산 생성", desc: "월 $500 비용 예산을 생성하세요." },
      { title: "80% 알람 설정", desc: "예산의 80%($400) 도달 시 이메일 알람을 추가하세요." },
      { title: "예산 조회", desc: "생성된 예산과 현재 사용량을 확인하세요." },
    ],
    explanation: "AWS Budgets는 비용, 사용량, 예약 인스턴스, Savings Plans 예산을 설정할 수 있습니다. 실제 비용 외에 예측 비용 기준으로도 알람을 설정할 수 있습니다. SNS 토픽으로 연결하면 Slack 등 다양한 채널로 알림을 보낼 수 있습니다.",
  },
  2: {
    title: "EC2 Savings Plans 구매",
    scenario: "운영 EC2 인스턴스가 항상 켜져 있는데 On-Demand 요금을 내고 있습니다. 1년 Compute Savings Plans를 구매해 최대 66% 비용을 절감하세요.",
    steps: [
      { title: "Savings Plans 권고 확인", desc: "Cost Explorer에서 Savings Plans 구매 권고를 확인하세요." },
      { title: "현재 On-Demand 사용량 확인", desc: "EC2 On-Demand 비용을 서비스별로 조회하세요." },
      { title: "Savings Plans 구매", desc: "시간당 $0.50 Compute Savings Plans를 구매하세요." },
      { title: "Savings Plans 적용 현황 확인", desc: "구매한 Savings Plans의 활용률을 확인하세요." },
    ],
    explanation: "Compute Savings Plans는 EC2, Lambda, Fargate에 적용되는 가장 유연한 플랜입니다. 1년 No Upfront 기준 최대 66% 절감됩니다. 활용률이 낮으면 구매 금액이 낭비되므로 권고 금액의 80-90%로 시작해 점차 늘리는 전략이 좋습니다.",
  },
  3: {
    title: "EC2 Spot 인스턴스 활용",
    scenario: "배치 분석 워크로드가 하루 2시간 실행됩니다. On-Demand c5.2xlarge 대신 Spot 인스턴스로 교체하면 최대 90% 절감됩니다. Spot Fleet으로 중단에도 안전하게 배치를 실행하세요.",
    steps: [
      { title: "현재 Spot 가격 확인", desc: "c5.2xlarge의 현재 Spot 가격을 확인하세요." },
      { title: "Spot Fleet 요청 생성", desc: "목표 용량 4 vCPU로 Spot Fleet을 요청하세요." },
      { title: "Spot Fleet 상태 확인", desc: "Spot Fleet이 인스턴스를 확보했는지 확인하세요." },
      { title: "Spot 중단 알람 설정", desc: "Spot 인스턴스 중단 2분 전 알림을 위한 EventBridge 규칙을 만드세요." },
    ],
    explanation: "Spot 인스턴스는 On-Demand 대비 최대 90% 저렴합니다. 중단(2분 전 통보)에 대비해 작업 체크포인트를 저장하거나 SQS로 작업을 분산하세요. Spot Fleet의 다양한 인스턴스 타입과 AZ 조합으로 중단 가능성을 낮출 수 있습니다.",
  },
  4: {
    title: "S3 Lifecycle 정책으로 스토리지 비용 절감",
    scenario: "S3 버킷에 로그 파일이 쌓여 수백 GB가 됐습니다. 30일 이후 파일은 잘 안 보는데 Standard 요금을 내고 있습니다. Lifecycle 정책으로 자동으로 저렴한 스토리지 클래스로 전환하세요.",
    steps: [
      { title: "버킷 스토리지 사용량 확인", desc: "버킷의 총 크기와 객체 수를 확인하세요." },
      { title: "Lifecycle 규칙 추가", desc: "30일 후 S3-IA, 90일 후 Glacier로 전환하는 규칙을 설정하세요." },
      { title: "Lifecycle 규칙 확인", desc: "설정된 Lifecycle 규칙을 확인하세요." },
      { title: "S3 스토리지 클래스 분석 활성화", desc: "접근 패턴 분석을 위해 Storage Class Analysis를 켜세요." },
    ],
    explanation: "S3 Lifecycle 정책은 객체를 자동으로 더 저렴한 스토리지 클래스로 이동하거나 삭제합니다. Standard → Standard-IA: 58% 절감, Standard-IA → Glacier: 80% 절감. 단, Standard-IA는 128KB 최소 크기와 30일 최소 보관 요금이 있으므로 작은 파일이 많으면 오히려 비용이 늘 수 있습니다.",
  },
  5: {
    title: "EBS 미사용 볼륨 정리",
    scenario: "인스턴스 종료 후에도 EBS 볼륨이 남아 비용이 청구됩니다. 연결되지 않은(available) EBS 볼륨을 찾아 스냅샷을 찍고 삭제하세요.",
    steps: [
      { title: "미연결 EBS 볼륨 목록 조회", desc: "available 상태인 EBS 볼륨 목록을 확인하세요." },
      { title: "EBS 스냅샷 생성", desc: "삭제 전 볼륨 스냅샷을 생성하세요." },
      { title: "스냅샷 완료 대기", desc: "스냅샷이 completed 상태가 됐는지 확인하세요." },
      { title: "EBS 볼륨 삭제", desc: "스냅샷 완료 후 미사용 볼륨을 삭제하세요." },
    ],
    explanation: "EBS 볼륨은 인스턴스에 연결되지 않아도 provisioned 크기에 따라 비용이 청구됩니다. 정기적으로 available 상태 볼륨을 감사하세요. AWS Trusted Advisor와 Cost Explorer의 리소스 최적화 권고도 미사용 리소스를 찾는 데 도움이 됩니다.",
  },
  6: {
    title: "미사용 Elastic IP 해제",
    scenario: "EC2 인스턴스를 삭제했는데 Elastic IP가 연결되지 않은 채 남아 있습니다. 연결되지 않은 EIP는 시간당 요금이 부과됩니다. 미사용 EIP를 찾아 해제하세요.",
    steps: [
      { title: "미연결 Elastic IP 조회", desc: "InstanceId가 없는 Elastic IP를 찾으세요." },
      { title: "EIP 사용 여부 재확인", desc: "Route53 등 다른 서비스에서 참조하는지 확인 후 해제하세요." },
      { title: "EIP 해제", desc: "Elastic IP를 해제(release)하세요." },
      { title: "남은 EIP 확인", desc: "해제 후 남아있는 EIP 목록을 확인하세요." },
    ],
    explanation: "연결되지 않은 Elastic IP는 시간당 $0.005가 청구됩니다(월 약 $3.60). 작아 보이지만 수십 개가 쌓이면 의미 있는 비용입니다. 인스턴스 종료 시 자동으로 EIP도 해제되도록 IaC 코드(Terraform 등)를 업데이트하는 것이 좋습니다.",
  },
  7: {
    title: "CloudWatch Logs 보존 기간 설정",
    scenario: "CloudWatch Logs 그룹이 기본 ",
    steps: [
      { title: "로그 그룹 목록 및 보존 기간 확인", desc: "보존 기간이 설정되지 않은 로그 그룹을 찾으세요." },
      { title: "Lambda 로그 보존 30일로 설정", desc: "/aws/lambda/api-handler 로그 그룹 보존 기간을 30일로 설정하세요." },
      { title: "RDS 로그 보존 14일로 설정", desc: "/aws/rds/cluster/prod-aurora 로그 그룹 보존 기간을 14일로 설정하세요." },
      { title: "설정 확인", desc: "보존 기간이 올바르게 설정됐는지 확인하세요." },
    ],
    explanation: "CloudWatch Logs는 저장 용량에 따라 GB당 $0.03/월이 청구됩니다. 보존 기간을 설정하면 기간 초과 로그가 자동 삭제됩니다. 장기 보관이 필요한 로그는 S3로 내보내고 CloudWatch에서는 짧게 유지하세요. 규정 준수 요건에 따라 보존 기간을 결정하세요.",
  },
  8: {
    title: "NAT Gateway 비용 최적화",
    scenario: "여러 AZ에 각각 NAT Gateway가 있어 비용이 높습니다. 또한 S3로 가는 트래픽도 NAT Gateway를 경유하고 있습니다. VPC Endpoint를 추가해 S3 트래픽 비용을 없애세요.",
    steps: [
      { title: "NAT Gateway 비용 확인", desc: "현재 NAT Gateway 비용을 서비스별로 조회하세요." },
      { title: "S3 Gateway VPC Endpoint 생성", desc: "S3 트래픽이 NAT Gateway를 거치지 않도록 Gateway Endpoint를 생성하세요." },
      { title: "DynamoDB VPC Endpoint 추가", desc: "DynamoDB도 VPC Endpoint로 연결하세요." },
      { title: "VPC Endpoint 목록 확인", desc: "생성된 VPC Endpoint를 확인하세요." },
    ],
    explanation: "S3/DynamoDB Gateway Endpoint는 무료입니다. 프라이빗 서브넷에서 S3로 가는 트래픽이 NAT Gateway를 우회하므로 데이터 처리 비용($0.045/GB)이 절감됩니다. 대용량 S3 작업이 많은 환경에서는 월 수백 달러 절감도 가능합니다.",
  },
  9: {
    title: "RDS Reserved Instance 구매",
    scenario: "운영 RDS db.r5.large 인스턴스가 24/7 실행 중입니다. 1년 예약 인스턴스로 전환하면 On-Demand 대비 최대 42% 절감됩니다.",
    steps: [
      { title: "현재 RDS 인스턴스 확인", desc: "운영 중인 RDS 인스턴스 목록을 확인하세요." },
      { title: "RDS 예약 인스턴스 오퍼링 조회", desc: "db.r5.large MySQL 1년 No Upfront 예약 가격을 확인하세요." },
      { title: "RDS 예약 인스턴스 구매", desc: "db.r5.large MySQL 예약 인스턴스를 구매하세요." },
      { title: "예약 인스턴스 적용 확인", desc: "구매한 예약 인스턴스 상태를 확인하세요." },
    ],
    explanation: "RDS Reserved Instance는 1년 No Upfront 기준 약 42%, All Upfront 기준 약 43% 절감됩니다. 예약 인스턴스는 자동으로 같은 엔진/클래스/리전의 On-Demand 인스턴스에 적용됩니다. Multi-AZ 예약 인스턴스는 Multi-AZ 인스턴스에만 적용됩니다.",
  },
  10: {
    title: "Lambda ARM (Graviton2) 마이그레이션",
    scenario: "Lambda 함수가 x86_64 아키텍처로 실행 중입니다. arm64(Graviton2)로 전환하면 동일 성능에 20% 저렴합니다. 아키텍처를 변경하고 비용 절감을 확인하세요.",
    steps: [
      { title: "현재 Lambda 아키텍처 확인", desc: "함수의 아키텍처와 런타임을 확인하세요." },
      { title: "ARM64로 아키텍처 변경", desc: "함수를 arm64로 업데이트하세요." },
      { title: "함수 테스트 실행", desc: "ARM64로 변경 후 함수가 정상 동작하는지 테스트하세요." },
      { title: "비용 비교 확인", desc: "Lambda 비용 메트릭을 CloudWatch로 확인하세요." },
    ],
    explanation: "Lambda ARM64(Graviton2)는 x86_64 대비 20% 저렴하고 성능도 비슷하거나 더 빠릅니다. Python, Node.js, Java, Go 등 대부분의 런타임이 지원됩니다. 단, C 확장 라이브러리가 있는 경우 재컴파일이 필요합니다. Fargate ARM64도 동일하게 20% 저렴합니다.",
  },
  11: {
    title: "EC2 우측 크기 조정 (Right Sizing)",
    scenario: "EC2 인스턴스들의 CPU 사용률이 평균 5% 미만입니다. AWS Compute Optimizer 권고를 확인하고 과도하게 프로비저닝된 인스턴스를 적정 크기로 줄이세요.",
    steps: [
      { title: "Compute Optimizer 권고 확인", desc: "EC2 인스턴스에 대한 최적화 권고를 조회하세요." },
      { title: "CPU 사용률 확인", desc: "지난 30일간 평균 CPU 사용률을 확인하세요." },
      { title: "인스턴스 중지 및 타입 변경", desc: "인스턴스를 중지하고 t3.medium에서 t3.small로 변경하세요." },
      { title: "인스턴스 재시작 후 확인", desc: "인스턴스를 시작하고 변경된 타입을 확인하세요." },
    ],
    explanation: "AWS Compute Optimizer는 CloudWatch 메트릭을 분석해 최적 인스턴스 타입을 추천합니다. CPU 사용률 5% 미만은 명백한 과도 프로비저닝입니다. 단, 피크 시 트래픽도 고려해 최소 P95 사용률 기준으로 결정하세요.",
  },
  12: {
    title: "S3 Intelligent-Tiering 설정",
    scenario: "접근 패턴이 불규칙한 S3 버킷이 있습니다. 자주 쓸 때는 Standard가 필요하지만 몇 달씩 안 쓰는 파일도 있습니다. Intelligent-Tiering으로 자동으로 최적 스토리지 클래스를 선택하게 하세요.",
    steps: [
      { title: "버킷 스토리지 클래스 분포 확인", desc: "버킷 내 스토리지 클래스별 객체 수를 확인하세요." },
      { title: "Intelligent-Tiering 전환 Lifecycle 규칙 추가", desc: "모든 객체를 Intelligent-Tiering으로 전환하는 규칙을 설정하세요." },
      { title: "Intelligent-Tiering Archive 설정", desc: "90일 미접근 시 Archive 티어, 180일 시 Deep Archive 티어로 이동하도록 설정하세요." },
      { title: "Intelligent-Tiering 설정 확인", desc: "Intelligent-Tiering 구성을 확인하세요." },
    ],
    explanation: "Intelligent-Tiering은 접근 패턴에 따라 자동으로 Frequent/Infrequent/Archive 티어를 이동합니다. 관리 비용(객체당 $0.0025/1000)이 있으므로 128KB 이하 작은 파일이 많으면 오히려 비쌀 수 있습니다. 접근 패턴 예측이 어려운 대용량 객체에 적합합니다.",
  },
  13: {
    title: "AWS Cost Anomaly Detection",
    scenario: "갑자기 AWS 비용이 평소의 3배로 뛰었는데 원인을 뒤늦게 알았습니다. Cost Anomaly Detection을 설정해 비정상적인 비용 급증을 즉시 감지하세요.",
    steps: [
      { title: "비용 모니터 생성", desc: "EC2 서비스 비용을 모니터링하는 Cost Monitor를 생성하세요." },
      { title: "알람 구독 생성", desc: "비용이 $50 이상 급증 시 이메일 알람을 설정하세요." },
      { title: "이상 탐지 이력 조회", desc: "탐지된 비용 이상 목록을 확인하세요." },
      { title: "모니터 목록 확인", desc: "생성된 비용 모니터 목록을 확인하세요." },
    ],
    explanation: "Cost Anomaly Detection은 머신러닝으로 비용 패턴을 학습하고 이상 지출을 감지합니다. 서비스 전체, 연결된 계정, 비용 할당 태그, 비용 범주 기준으로 모니터를 만들 수 있습니다. 기존 알람보다 오탐이 적고 근본 원인(서비스/리전/사용 유형)도 제공합니다.",
  },
  14: {
    title: "비용 할당 태그 활성화",
    scenario: "개발팀, 운영팀, 데이터팀의 비용을 분리해서 봐야 하는데 현재는 전체 비용만 보입니다. Cost Allocation Tags로 팀별 비용을 분리하고 Cost Explorer에서 팀별 리포트를 만드세요.",
    steps: [
      { title: "사용자 정의 태그 활성화", desc: "team 태그를 비용 할당 태그로 활성화하세요." },
      { title: "EC2 인스턴스에 팀 태그 추가", desc: "운영팀 인스턴스에 team=ops 태그를 추가하세요." },
      { title: "S3 버킷에 팀 태그 추가", desc: "데이터팀 버킷에 team=data 태그를 추가하세요." },
      { title: "팀별 비용 조회", desc: "team 태그로 그룹화해 팀별 비용을 확인하세요." },
    ],
    explanation: "비용 할당 태그는 활성화 후 최대 24시간이 지나야 Cost Explorer에 반영됩니다. AWS 생성 태그와 사용자 정의 태그 모두 사용 가능합니다. 태그 정책을 AWS Organizations에서 강제하면 누락된 태그로 인한 비용 미분류를 방지할 수 있습니다.",
  },
  15: {
    title: "ECR 이미지 정리",
    scenario: "ECR 리포지토리에 수백 개의 오래된 Docker 이미지가 쌓여 스토리지 비용이 증가하고 있습니다. 최근 5개 이미지만 남기고 나머지를 자동으로 삭제하는 Lifecycle 정책을 설정하세요.",
    steps: [
      { title: "현재 ECR 이미지 수 확인", desc: "리포지토리의 이미지 수와 총 크기를 확인하세요." },
      { title: "ECR Lifecycle 정책 설정", desc: "태그 없는 이미지와 오래된 이미지를 자동 삭제하는 정책을 설정하세요." },
      { title: "Lifecycle 정책 미리보기", desc: "정책 적용 시 삭제될 이미지를 미리 확인하세요." },
      { title: "ECR 스토리지 비용 확인", desc: "ECR 스토리지 사용량 메트릭을 확인하세요." },
    ],
    explanation: "ECR 스토리지는 GB당 $0.10/월이 청구됩니다. Lifecycle 정책으로 오래된 이미지를 자동 정리하면 CI/CD 파이프라인에서 이미지가 매일 쌓여도 비용이 통제됩니다. 태그 없는 이미지는 항상 즉시 삭제하는 것이 좋습니다.",
  },
  16: {
    title: "Auto Scaling 스케줄 기반 절감",
    scenario: "개발/스테이징 환경의 EC2 Auto Scaling 그룹이 24시간 실행됩니다. 업무 시간(월-금 9-18시)에만 인스턴스를 유지하고 나머지 시간엔 0으로 줄여 비용을 60% 절감하세요.",
    steps: [
      { title: "현재 ASG 설정 확인", desc: "개발 환경 Auto Scaling 그룹의 현재 설정을 확인하세요." },
      { title: "업무 시간 시작 스케줄 추가", desc: "월~금 오전 9시(UTC 0시)에 인스턴스 2개로 늘리는 스케줄을 추가하세요." },
      { title: "업무 시간 종료 스케줄 추가", desc: "월~금 오후 9시(UTC 12시)에 인스턴스 0개로 줄이는 스케줄을 추가하세요." },
      { title: "스케줄 목록 확인", desc: "등록된 스케줄 액션을 확인하세요." },
    ],
    explanation: "개발/스테이징 환경은 업무 시간 외에 인스턴스가 불필요합니다. 스케줄 스케일링으로 주말 포함 약 76%의 시간 동안 비용을 절감할 수 있습니다. AWS Instance Scheduler 솔루션을 사용하면 더 복잡한 스케줄도 관리할 수 있습니다.",
  },
  17: {
    title: "S3 버킷 퍼블릭 액세스 비용 분석",
    scenario: "S3에서 외부로 나가는 데이터 전송 비용이 매월 수백 달러입니다. 어떤 버킷에서 얼마나 데이터가 나가는지 분석하고 CloudFront로 전환해 전송 비용을 줄이세요.",
    steps: [
      { title: "S3 데이터 전송 비용 조회", desc: "Cost Explorer로 S3 데이터 전송 비용을 조회하세요." },
      { title: "S3 버킷 요청 메트릭 활성화", desc: "가장 많이 요청되는 버킷의 메트릭을 활성화하세요." },
      { title: "CloudFront 오리진을 S3로 설정", desc: "S3 버킷 앞에 CloudFront를 배포해 전송 비용을 낮추세요." },
      { title: "S3 버킷 직접 접근 차단", desc: "CloudFront 외 직접 S3 접근을 차단하세요." },
    ],
    explanation: "S3에서 인터넷으로 나가는 데이터 전송은 GB당 $0.09가 청구됩니다. CloudFront를 통하면 오리진에서 CloudFront로의 전송은 무료이고 CloudFront 엣지에서 사용자로의 전송은 S3보다 저렴합니다($0.0085/GB). 캐시 히트율이 높을수록 절감 효과가 큽니다.",
  },
  18: {
    title: "DynamoDB 비용 최적화",
    scenario: "DynamoDB 테이블에 스캔 쿼리가 많아 RCU 비용이 높습니다. Provisioned 모드로 전환하고 Auto Scaling을 설정해 예측 가능한 비용을 만드세요.",
    steps: [
      { title: "DynamoDB 소비 비용 확인", desc: "DynamoDB RCU/WCU 소비량을 확인하세요." },
      { title: "Provisioned 모드로 전환", desc: "테이블을 PROVISIONED 모드로 전환하세요." },
      { title: "Auto Scaling 정책 등록 (읽기)", desc: "DynamoDB 읽기 용량 Auto Scaling을 설정하세요." },
      { title: "Target Tracking 정책 설정", desc: "목표 사용률 70%로 Auto Scaling 정책을 설정하세요." },
    ],
    explanation: "트래픽 패턴이 예측 가능하다면 Provisioned + Auto Scaling이 On-Demand보다 저렴합니다. Auto Scaling은 소비 용량이 설정 용량의 70%를 넘으면 Scale Out, 낮으면 Scale In합니다. 스캔 대신 쿼리와 GSI를 사용해 소비 RCU를 줄이는 것도 중요합니다.",
  },
  19: {
    title: "Trusted Advisor 비용 절감 권고 확인",
    scenario: "AWS 환경 전반에 걸쳐 낭비되는 리소스가 있는지 Trusted Advisor로 점검하세요. 미사용 로드밸런서, 유휴 RDS, 저사용 EC2를 찾아 정리하세요.",
    steps: [
      { title: "Trusted Advisor 비용 최적화 체크 조회", desc: "비용 최적화 카테고리 체크 목록을 확인하세요." },
      { title: "유휴 로드밸런서 확인", desc: "Idle Load Balancers 체크 결과를 확인하세요." },
      { title: "유휴 로드밸런서 삭제", desc: "유휴 로드밸런서를 삭제하세요." },
      { title: "Trusted Advisor 결과 새로고침", desc: "체크 결과를 새로고침하세요." },
    ],
    explanation: "Trusted Advisor는 비용 최적화, 성능, 보안, 내결함성 등 5개 카테고리의 200+ 체크를 제공합니다. Business/Enterprise Support 플랜에서 전체 체크를 사용할 수 있습니다. 월 1회 정기 점검으로 낭비되는 리소스를 꾸준히 제거하세요.",
  },
  20: {
    title: "RDS 스냅샷 오래된 것 정리",
    scenario: "RDS 수동 스냅샷이 수십 개 쌓여 스토리지 비용이 발생합니다. 90일 이상 된 스냅샷을 정리하고 자동 스냅샷 보존 기간을 조정하세요.",
    steps: [
      { title: "오래된 스냅샷 목록 조회", desc: "90일 이상 된 RDS 스냅샷을 조회하세요." },
      { title: "오래된 스냅샷 삭제", desc: "90일 이상 된 스냅샷을 삭제하세요." },
      { title: "자동 스냅샷 보존 기간 단축", desc: "자동 백업 보존 기간을 35일에서 7일로 줄이세요." },
      { title: "스냅샷 총 크기 확인", desc: "현재 남아있는 스냅샷 총 스토리지를 확인하세요." },
    ],
    explanation: "RDS 자동 스냅샷은 최대 35일 보존할 수 있으며 무료 스토리지(DB 크기의 100%)를 초과하면 비용이 청구됩니다. 수동 스냅샷은 삭제하기 전까지 계속 저장됩니다. 규정 준수 요건이 없다면 7일 보존이 충분합니다.",
  },
  21: {
    title: "CloudFront 비용 최적화 (Price Class)",
    scenario: "CloudFront 배포에서 모든 엣지 로케이션이 활성화돼 있는데 사용자가 미국/유럽에만 있습니다. Price Class 100으로 제한해 비용을 줄이세요.",
    steps: [
      { title: "현재 CloudFront 배포 설정 확인", desc: "배포의 현재 Price Class를 확인하세요." },
      { title: "Price Class 100으로 변경", desc: "미국/유럽 엣지만 사용하는 Price Class 100으로 변경하세요." },
      { title: "지역별 트래픽 확인", desc: "CloudWatch로 지역별 요청 수를 확인하세요." },
      { title: "배포 완료 확인", desc: "Price Class 변경이 모든 엣지에 적용됐는지 확인하세요." },
    ],
    explanation: "CloudFront Price Class는 어느 엣지 로케이션을 사용할지 결정합니다. PriceClass_All(모든 리전), PriceClass_200(북미+유럽+아시아 일부), PriceClass_100(북미+유럽)으로 나뉩니다. 사용자가 특정 지역에 집중된 경우 불필요한 엣지 비용을 줄일 수 있습니다.",
  },
  22: {
    title: "Lambda 동시 실행 제한으로 비용 제어",
    scenario: "개발 환경의 Lambda 함수가 버그로 무한 루프에 빠져 수천 번 호출되었습니다. 함수별 동시 실행 제한으로 비용 폭증을 방지하세요.",
    steps: [
      { title: "현재 Lambda 동시 실행 현황 확인", desc: "계정 전체 동시 실행 한도와 사용량을 확인하세요." },
      { title: "개발 환경 함수에 동시 실행 제한", desc: "개발 환경 Lambda에 동시 실행 10개 제한을 설정하세요." },
      { title: "동시 실행 스로틀 알람 설정", desc: "Lambda Throttles가 발생하면 알람이 울리도록 설정하세요." },
      { title: "Lambda 비용 조회", desc: "이번 달 Lambda 비용을 확인하세요." },
    ],
    explanation: "Reserved Concurrency를 설정하면 함수가 해당 수 이상 동시 실행되지 않습니다. 버그로 인한 폭주나 예산 초과를 방지합니다. 단, 운영 환경 함수에 너무 낮게 설정하면 정상 트래픽도 스로틀링될 수 있습니다.",
  },
  23: {
    title: "S3 Glacier 장기 보관",
    scenario: "감사 로그를 7년간 보관해야 하는 규정이 있습니다. 현재 S3 Standard에 저장 중인 오래된 로그를 S3 Glacier Deep Archive로 이전해 비용을 97% 절감하세요.",
    steps: [
      { title: "오래된 로그 객체 크기 확인", desc: "2023년 이전 로그 파일의 총 크기를 확인하세요." },
      { title: "Glacier Deep Archive 전환 규칙 설정", desc: "생성 후 365일이 지나면 Glacier Deep Archive로 이전하는 규칙을 설정하세요." },
      { title: "기존 객체 즉시 Glacier 이전", desc: "이미 있는 2022년 로그를 즉시 Glacier Deep Archive로 복사하세요." },
      { title: "스토리지 클래스 변경 확인", desc: "변경된 스토리지 클래스를 확인하세요." },
    ],
    explanation: "S3 Glacier Deep Archive는 GB당 $0.00099/월로 Standard($0.023)보다 97% 저렴합니다. 단, 복원 시 표준 12시간, 대용량 복원 시 48시간이 걸립니다. 7년 규정 준수 로그처럼 거의 꺼낼 일 없는 데이터에 최적입니다.",
  },
  24: {
    title: "Fargate Spot으로 배치 작업 비용 절감",
    scenario: "매일 새벽 실행하는 데이터 처리 ECS 태스크가 On-Demand Fargate를 사용합니다. 중단이 허용되는 배치 작업에 Fargate Spot을 사용해 최대 70% 절감하세요.",
    steps: [
      { title: "현재 ECS 서비스 시작 유형 확인", desc: "배치 처리 태스크의 현재 설정을 확인하세요." },
      { title: "Fargate Spot 용량 공급자 생성", desc: "FARGATE_SPOT 용량 공급자를 클러스터에 추가하세요." },
      { title: "Spot 사용 서비스로 업데이트", desc: "배치 서비스를 Fargate Spot으로 실행하도록 업데이트하세요." },
      { title: "Fargate 비용 확인", desc: "Fargate 비용이 줄었는지 Cost Explorer로 확인하세요." },
    ],
    explanation: "Fargate Spot은 AWS의 여유 Fargate 용량을 사용하며 On-Demand 대비 최대 70% 저렴합니다. 중단 2분 전 알림이 오므로 배치 작업은 체크포인트를 저장하거나 재시도 로직을 구현하세요. 24/7 서비스에는 Spot Fallback 전략으로 FARGATE_SPOT 실패 시 FARGATE로 전환하도록 설정하세요.",
  },
  25: {
    title: "미사용 로드밸런서 정리",
    scenario: "테스트 후 삭제하지 않은 ALB가 트래픽 없이 시간당 과금되고 있습니다. 연결된 타겟이 없거나 요청이 없는 로드밸런서를 찾아 정리하세요.",
    steps: [
      { title: "모든 로드밸런서 목록 조회", desc: "현재 생성된 로드밸런서 목록을 확인하세요." },
      { title: "유휴 LB 요청 수 확인", desc: "test-alb의 최근 요청 수를 확인하세요." },
      { title: "로드밸런서 리스너 확인", desc: "test-alb의 리스너와 타겟 그룹을 확인하세요." },
      { title: "유휴 로드밸런서 삭제", desc: "유휴 상태의 test-alb를 삭제하세요." },
    ],
    explanation: "ALB는 시간당 $0.008 + LCU(Load Balancer Capacity Unit) 과금이 있습니다. 타겟이 없거나 요청이 없어도 기본 시간 요금이 청구됩니다. 월 약 $6-$16이 낭비됩니다. 태그와 비용 할당으로 각 LB의 소유자를 명확히 하고 정기적으로 감사하세요.",
  },
  26: {
    title: "데이터 전송 비용 분석 및 최적화",
    scenario: "AZ 간 데이터 전송으로 인한 숨겨진 비용이 크게 발생하고 있습니다. 같은 AZ 내 통신으로 전환하거나 VPC Peering을 최적화해 전송 비용을 줄이세요.",
    steps: [
      { title: "AZ 간 데이터 전송 비용 확인", desc: "DataTransfer-Regional 비용을 조회하세요." },
      { title: "인스턴스 AZ 분포 확인", desc: "현재 인스턴스들의 AZ 분포를 확인하세요." },
      { title: "VPC Flow Logs 활성화", desc: "AZ 간 트래픽 패턴 분석을 위해 VPC Flow Logs를 활성화하세요." },
      { title: "Flow Logs 분석 Athena 쿼리 실행", desc: "S3에 저장된 Flow Logs를 Athena로 분석하세요." },
    ],
    explanation: "AZ 간 데이터 전송은 $0.01/GB, 리전 간 전송은 $0.02/GB가 청구됩니다. 웹-앱-DB 레이어를 같은 AZ에 배치하면 전송 비용이 0이 됩니다. VPC Flow Logs + Athena로 어떤 서버 쌍이 가장 많은 AZ 간 트래픽을 유발하는지 파악하세요.",
  },
  27: {
    title: "AWS Organizations 비용 통합 결제",
    scenario: "개발/스테이징/운영 계정이 별도로 있어 할인 혜택을 받지 못하고 있습니다. AWS Organizations 통합 결제로 전체 사용량을 합산해 볼륨 할인을 받으세요.",
    steps: [
      { title: "Organizations 현재 구성 확인", desc: "현재 조직 구조를 확인하세요." },
      { title: "계정 목록 조회", desc: "조직 내 모든 계정을 확인하세요." },
      { title: "통합 비용 조회", desc: "모든 계정을 합산한 이번 달 총 비용을 확인하세요." },
      { title: "SCP로 비용 제어 정책 적용", desc: "개발 계정에서 고비용 인스턴스 타입 생성을 금지하는 SCP를 적용하세요." },
    ],
    explanation: "AWS Organizations 통합 결제는 모든 계정의 S3, EC2 등 서비스 사용량을 합산해 볼륨 할인을 적용합니다. RI/Savings Plans도 조직 내 계정에 자동 공유됩니다. SCP로 개발 계정에서 비용이 높은 리소스 생성을 차단할 수 있습니다.",
  },
  28: {
    title: "EC2 비용 태그 기반 자동화",
    scenario: "태그 없이 생성된 EC2 인스턴스 때문에 비용 추적이 불가능합니다. AWS Config 규칙으로 태그 없는 인스턴스를 감지하고 자동 알림을 보내세요.",
    steps: [
      { title: "AWS Config 활성화 확인", desc: "AWS Config 레코더 상태를 확인하세요." },
      { title: "필수 태그 Config 규칙 생성", desc: "Name과 team 태그가 없는 EC2를 감지하는 규칙을 만드세요." },
      { title: "비준수 리소스 확인", desc: "required-tags 규칙을 위반하는 EC2 인스턴스를 조회하세요." },
      { title: "자동 태그 추가 SSM 실행", desc: "비준수 인스턴스에 기본 태그를 자동으로 추가하세요." },
    ],
    explanation: "AWS Config REQUIRED_TAGS 규칙은 지정한 태그가 없는 리소스를 NON_COMPLIANT로 표시합니다. Config Rules + Lambda Auto Remediation으로 태그 누락 시 자동으로 소유자에게 이메일을 보내거나 일정 기간 후 자동 중지할 수 있습니다.",
  },
  29: {
    title: "CloudWatch 메트릭 비용 최적화",
    scenario: "CloudWatch 커스텀 메트릭과 API 호출 비용이 예상보다 높습니다. 불필요한 고해상도 메트릭을 표준 해상도로 낮추고 보존 기간을 조정해 비용을 줄이세요.",
    steps: [
      { title: "CloudWatch 비용 확인", desc: "CloudWatch 관련 비용을 분석하세요." },
      { title: "커스텀 메트릭 목록 확인", desc: "현재 등록된 커스텀 메트릭 수를 확인하세요." },
      { title: "불필요한 알람 목록 확인", desc: "INSUFFICIENT_DATA 상태의 알람을 확인하세요." },
      { title: "오래된 알람 삭제", desc: "90일 이상 INSUFFICIENT_DATA인 알람을 삭제하세요." },
    ],
    explanation: "CloudWatch 고해상도 메트릭(1초)은 표준(1분)보다 비쌉니다. 필요하지 않은 고해상도 메트릭은 표준으로 낮추세요. INSUFFICIENT_DATA 알람은 연결된 리소스가 삭제됐음을 의미합니다. 미사용 대시보드, 로그 인사이트 쿼리 등도 비용을 유발합니다.",
  },
  30: {
    title: "월별 비용 리포트 자동화",
    scenario: "매월 AWS 비용 리포트를 수동으로 만들고 있습니다. Cost and Usage Report(CUR)를 S3에 자동 저장하고 Athena로 쿼리해 팀별, 서비스별 월간 비용 분석을 자동화하세요.",
    steps: [
      { title: "Cost and Usage Report 생성", desc: "S3에 자동 저장되는 CUR 리포트를 설정하세요." },
      { title: "CUR 리포트 확인", desc: "생성된 CUR 리포트 정의를 확인하세요." },
      { title: "Athena 테이블 생성", desc: "CUR 데이터 분석을 위한 Athena 테이블을 생성하세요." },
      { title: "팀별 비용 쿼리 실행", desc: "Athena로 팀별 월간 비용을 집계하세요." },
    ],
    explanation: "Cost and Usage Report(CUR)는 가장 상세한 AWS 비용 데이터입니다. Parquet 포맷으로 저장하면 Athena 쿼리 비용도 줄어듭니다. Lambda + EventBridge로 매월 1일 자동 리포트 생성 → SNS 이메일 발송 파이프라인을 구축할 수 있습니다. QuickSight와 연결하면 시각적 대시보드도 만들 수 있습니다.",
  },
};