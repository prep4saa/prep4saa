type ChalI18n = {
  title: string;
  scenario: string;
  steps: Array<{ title: string; desc: string }>;
  explanation: string;
};

export const RES_CHALLENGES_I18N: Record<number, ChalI18n> = {
  1: {
    title: "EC2 Auto Scaling 그룹 구성",
    scenario: "트래픽이 급증할 때마다 서버가 다운됩니다. EC2를 수동으로 추가하는 것은 너무 느립니다. Auto Scaling 그룹을 만들어 트래픽에 따라 자동으로 인스턴스가 늘고 줄게 하세요.",
    steps: [
      { title: "Launch Template 생성", desc: "Auto Scaling용 Launch Template을 web-server-template으로 생성하세요." },
      { title: "Auto Scaling 그룹 생성", desc: "최소 2, 최대 10 인스턴스로 web-asg Auto Scaling 그룹을 생성하세요." },
      { title: "CPU 기반 스케일링 정책 추가", desc: "CPU 70% 초과 시 인스턴스 1개를 추가하는 정책을 생성하세요." },
      { title: "ASG 상태 확인", desc: "web-asg Auto Scaling 그룹이 정상적으로 2개 인스턴스로 시작됐는지 확인하세요." },
    ],
    explanation: "Auto Scaling 그룹은 Launch Template을 기반으로 인스턴스를 자동 생성/종료합니다. TargetTrackingScaling 정책은 목표 CPU 사용률을 유지하도록 자동으로 조정합니다. 여러 AZ에 걸쳐 배포해야 고가용성이 보장됩니다.",
  },
  2: {
    title: "Application Load Balancer 구성",
    scenario: "웹 서버가 2대인데 트래픽 분산 없이 한 서버에만 요청이 몰립니다. ALB를 생성해 두 인스턴스에 고르게 분산하고 헬스체크로 장애 서버를 자동으로 제외하세요.",
    steps: [
      { title: "Target Group 생성", desc: "EC2 target group web-tg를 HTTP 80포트로 생성하세요." },
      { title: "ALB 생성", desc: "퍼블릭 ALB web-alb를 생성하세요." },
      { title: "리스너 추가", desc: "web-alb에 HTTP 80 포트 리스너를 추가하세요." },
      { title: "인스턴스 Target Group 등록", desc: "EC2 인스턴스 2대를 web-tg Target Group에 등록하세요." },
      { title: "타겟 헬스 확인", desc: "web-tg의 등록된 인스턴스 헬스체크 상태가 Healthy인지 확인하세요." },
    ],
    explanation: "ALB는 Layer 7(HTTP/HTTPS) 로드밸런서로 경로 기반, 호스트 기반 라우팅이 가능합니다. /health 헬스체크로 비정상 인스턴스를 자동 제외합니다. 반드시 2개 이상의 AZ 서브넷을 지정해야 합니다.",
  },
  3: {
    title: "RDS Multi-AZ 장애 조치",
    scenario: "운영 RDS 인스턴스가 단일 AZ입니다. 장애 조치 훈련을 위해 Multi-AZ로 전환하고, 실제 장애 조치(failover)를 테스트하세요.",
    steps: [
      { title: "현재 RDS 설정 확인", desc: "prod-mysql의 Multi-AZ 설정을 확인하세요." },
      { title: "Multi-AZ 활성화", desc: "prod-mysql을 Multi-AZ로 변경하세요." },
      { title: "변경 완료 확인", desc: "prod-mysql Multi-AZ 변경이 완료됐는지 확인하세요." },
      { title: "장애 조치 테스트", desc: "prod-mysql 의 Failover를 강제로 실행해 Standby가 Primary로 전환되는지 테스트하세요." },
    ],
    explanation: "RDS Multi-AZ는 다른 AZ에 Standby 복제본을 유지합니다. 장애 시 자동으로 Standby로 페일오버하며, 보통 1-2분 내에 완료됩니다. --force-failover 옵션으로 정기적인 장애 조치 훈련을 권장합니다.",
  },
  4: {
    title: "S3 교차 리전 복제(CRR)",
    scenario: "서울 리전의 S3 버킷이 장애가 나면 서비스가 완전히 중단됩니다. 중요 데이터를 도쿄 리전에 자동 복제해 재해 복구 체계를 만드세요.",
    steps: [
      { title: "소스 버킷 버전 관리 활성화", desc: "서울 리전 source-bucket에 Versioning을 활성화하세요." },
      { title: "목적지 버킷 버전 관리 활성화", desc: "도쿄 리전의 dest-bucket-tokyo에 Versioning을 활성화하세요." },
      { title: "CRR 복제 규칙 설정", desc: "source-bucket에서 dest-bucket-tokyo로 자동 복제하는 규칙을 설정하세요." },
      { title: "복제 설정 확인", desc: "복제 규칙이 올바르게 설정됐는지 확인하세요." },
    ],
    explanation: "S3 CRR(Cross-Region Replication)은 소스와 목적지 버킷 모두 버전 관리가 필요합니다. 복제는 설정 이후 업로드되는 객체에만 적용됩니다. 기존 객체는 S3 Batch Replication을 별도로 실행해야 합니다.",
  },
  5: {
    title: "Route 53 헬스체크 + Failover",
    scenario: "메인 서버가 다운되면 수동으로 DNS를 변경해야 해서 복구에 30분 이상 걸립니다. Route 53 헬스체크로 자동 페일오버를 구성해 다운타임을 최소화하세요.",
    steps: [
      { title: "Primary 헬스체크 생성", desc: "메인 서버에 대한 HTTP 헬스체크를 생성하세요." },
      { title: "Primary DNS 레코드 생성", desc: "Failover PRIMARY 레코드를 생성하세요." },
      { title: "Secondary(Failover) 레코드 생성", desc: "헬스체크 실패 시 대체할 Secondary 레코드를 생성하세요." },
      { title: "헬스체크 상태 확인", desc: "헬스체크가 정상적으로 작동하는지 확인하세요." },
    ],
    explanation: "Route 53 Failover 라우팅은 헬스체크가 UNHEALTHY가 되면 자동으로 Secondary 레코드로 전환합니다. TTL을 짧게(60초 이하) 설정하면 전환 시간을 최소화할 수 있습니다.",
  },
  6: {
    title: "RDS Read Replica로 읽기 부하 분산",
    scenario: "운영 RDS에 읽기 요청이 몰려 응답이 느려졌습니다. 리포트 쿼리와 분석 쿼리를 Read Replica로 분리해 부하를 줄이세요.",
    steps: [
      { title: "현재 DB 상태 확인", desc: "소스 DB의 현재 상태를 확인하세요." },
      { title: "Read Replica 생성", desc: "같은 리전에 Read Replica를 생성하세요." },
      { title: "Read Replica 상태 확인", desc: "Replica가 available 상태인지 확인하세요." },
      { title: "Replica 지연 시간 확인", desc: "Replica의 복제 지연 시간을 확인하세요." },
    ],
    explanation: "RDS Read Replica는 비동기 복제로 읽기 전용 엔드포인트를 제공합니다. 리포트, 분석, 검색 등 읽기 쿼리를 Replica 엔드포인트로 보내면 Primary 부하가 감소합니다. 지연 시간(Replica Lag)을 주기적으로 모니터링해야 합니다.",
  },
  7: {
    title: "EC2 AMI 백업 자동화",
    scenario: "매일 아침 EC2 인스턴스의 AMI 스냅샷을 수동으로 찍고 있습니다. 자동화를 통해 매일 새벽 2시에 AMI를 생성하고 오래된 AMI는 자동 삭제하세요.",
    steps: [
      { title: "현재 인스턴스 AMI 확인", desc: "백업할 EC2 인스턴스의 현재 AMI ID를 확인하세요." },
      { title: "AMI 수동 생성 (즉시 백업)", desc: "지금 당장 인스턴스의 AMI를 생성하세요." },
      { title: "DLM 수명 주기 정책 생성", desc: "매일 새벽 2시 AMI 생성 및 7일 후 삭제 정책을 만드세요." },
      { title: "수명 주기 정책 확인", desc: "생성된 DLM 정책이 활성화됐는지 확인하세요." },
    ],
    explanation: "AWS DLM(Data Lifecycle Manager)으로 EC2 AMI와 EBS 스냅샷 생성·보관·삭제를 자동화할 수 있습니다. --no-reboot 옵션은 인스턴스를 재시작하지 않고 AMI를 생성하지만, 파일시스템 일관성이 보장되지 않을 수 있습니다.",
  },
  8: {
    title: "SQS Dead Letter Queue로 실패 메시지 처리",
    scenario: "주문 처리 Lambda가 간헐적으로 실패합니다. 실패한 메시지가 SQS 큐에서 계속 재처리되어 다른 메시지를 막고 있습니다. Dead Letter Queue를 설정해 실패 메시지를 격리하세요.",
    steps: [
      { title: "Dead Letter Queue 생성", desc: "실패 메시지를 격리할 DLQ를 생성하세요." },
      { title: "DLQ ARN 조회", desc: "DLQ의 ARN을 조회하세요." },
      { title: "원본 큐에 DLQ 설정", desc: "3회 실패 시 DLQ로 이동하도록 원본 큐를 수정하세요." },
      { title: "DLQ 메시지 수 확인", desc: "DLQ에 격리된 실패 메시지 수를 확인하세요." },
    ],
    explanation: "DLQ는 maxReceiveCount 횟수만큼 처리에 실패한 메시지를 격리합니다. 격리된 메시지를 분석해 버그를 수정한 후, SQS 콘솔에서 ",
  },
  9: {
    title: "ElastiCache Redis 클러스터 구성",
    scenario: "RDS에 세션 데이터와 캐시 데이터가 섞여 있어 DB 부하가 높습니다. ElastiCache Redis 클러스터를 만들어 세션과 자주 읽는 데이터를 캐시하세요.",
    steps: [
      { title: "ElastiCache 서브넷 그룹 생성", desc: "Redis 클러스터용 서브넷 그룹을 생성하세요." },
      { title: "Redis 클러스터 생성", desc: "Multi-AZ Redis 클러스터를 생성하세요." },
      { title: "클러스터 상태 확인", desc: "Redis 클러스터가 available 상태인지 확인하세요." },
      { title: "연결 엔드포인트 확인", desc: "Redis Primary 엔드포인트 주소를 확인하세요." },
    ],
    explanation: "ElastiCache Redis는 In-Memory 데이터 스토어로 세션, 캐시, 실시간 순위표 등에 사용합니다. Multi-AZ + 자동 장애 조치를 설정하면 Primary 장애 시 자동으로 Replica가 승격됩니다.",
  },
  10: {
    title: "CloudWatch 알람 기반 Auto Scaling",
    scenario: "Auto Scaling 그룹이 있지만 스케일링 트리거가 없어서 자동으로 작동하지 않습니다. CPU와 메모리 기반 CloudWatch 알람으로 스케일 아웃/인 정책을 연결하세요.",
    steps: [
      { title: "스케일 아웃 정책 생성", desc: "CPU 70% 초과 시 인스턴스 2개를 추가하는 정책을 생성하세요." },
      { title: "스케일 인 정책 생성", desc: "CPU 30% 이하 시 인스턴스 1개를 제거하는 정책을 생성하세요." },
      { title: "High CPU 알람 생성", desc: "CPU 70% 초과 시 스케일 아웃 정책을 실행하는 알람을 생성하세요." },
      { title: "알람 상태 확인", desc: "HighCPU 알람이 정상적으로 생성됐는지 확인하세요." },
    ],
    explanation: "CloudWatch 알람이 ALARM 상태가 되면 연결된 Auto Scaling 정책을 트리거합니다. Cooldown 기간 동안은 추가 스케일링이 발생하지 않아 인스턴스가 과도하게 생성/삭제되는 것을 방지합니다.",
  },
  11: {
    title: "EC2 Spot Instance + On-Demand 혼합",
    scenario: "배치 처리 워크로드의 EC2 비용이 너무 높습니다. Spot Instance를 사용하되 중단 시에도 처리가 계속되도록 On-Demand와 혼합한 Mixed Instances Policy를 구성하세요.",
    steps: [
      { title: "Mixed Instances Policy ASG 생성", desc: "Spot 70% + On-Demand 30% 비율로 ASG를 생성하세요." },
      { title: "Spot 중단 알림 확인", desc: "Spot 인스턴스 중단 2분 전 알림을 모니터링하는 방법을 확인하세요." },
      { title: "Spot 가격 이력 확인", desc: "비용 최적화를 위해 최근 Spot 가격 이력을 확인하세요." },
      { title: "ASG 현재 인스턴스 구성 확인", desc: "ASG에서 실행 중인 Spot/On-Demand 인스턴스 비율을 확인하세요." },
    ],
    explanation: "Mixed Instances Policy로 Spot과 On-Demand를 혼합하면 비용을 70~90% 절감하면서도 가용성을 유지할 수 있습니다. Spot 중단 시 On-Demand가 자동으로 보완합니다. 배치 처리, CI/CD, 통계 분석에 특히 효과적입니다.",
  },
  12: {
    title: "Lambda 동시성 제한으로 DynamoDB 보호",
    scenario: "이벤트가 몰릴 때 Lambda가 DynamoDB를 과도하게 호출해 ThrottlingException이 발생합니다. Lambda 동시성을 제한해 DynamoDB 부하를 조절하세요.",
    steps: [
      { title: "Lambda 현재 동시성 확인", desc: "order-handler Lambda의 현재 동시성 설정을 확인하세요." },
      { title: "예약된 동시성 설정", desc: "동시 실행을 최대 50개로 제한하세요." },
      { title: "Provisioned Concurrency 설정", desc: "콜드 스타트를 없애기 위해 Provisioned Concurrency를 10으로 설정하세요." },
      { title: "DynamoDB 프로비저닝 용량 확인", desc: "DynamoDB 테이블의 현재 읽기/쓰기 용량을 확인하세요." },
    ],
    explanation: "Lambda 예약 동시성(Reserved Concurrency)은 최대 동시 실행 수를 제한합니다. 초과 요청은 Throttle 처리됩니다. Provisioned Concurrency는 미리 초기화된 실행 환경을 유지해 콜드 스타트를 방지합니다.",
  },
  13: {
    title: "DynamoDB 글로벌 테이블 (Multi-Region)",
    scenario: "글로벌 서비스 런칭으로 미국과 아시아 사용자 모두에게 낮은 레이턴시가 필요합니다. DynamoDB 글로벌 테이블로 여러 리전에 자동 동기화되는 테이블을 구성하세요.",
    steps: [
      { title: "기존 테이블 상태 확인", desc: "user-data 테이블의 현재 설정을 확인하세요." },
      { title: "글로벌 테이블 리전 추가 (도쿄)", desc: "user-data 테이블을 ap-northeast-1 리전에 복제하세요." },
      { title: "글로벌 테이블 상태 확인", desc: "글로벌 테이블 복제가 완료됐는지 확인하세요." },
      { title: "도쿄 리전 테이블 확인", desc: "도쿄 리전에서 복제된 테이블을 확인하세요." },
    ],
    explanation: "DynamoDB 글로벌 테이블은 여러 리전에 완전 관리형 멀티-마스터 복제를 제공합니다. 각 리전에서 쓰기/읽기가 가능하며 충돌은 ",
  },
  14: {
    title: "S3 Lifecycle 정책으로 비용 절감",
    scenario: "로그 데이터가 S3 Standard에 무기한 저장되어 비용이 계속 증가합니다. 30일 후 IA, 90일 후 Glacier로 자동 이동하는 수명 주기 정책을 설정하세요.",
    steps: [
      { title: "현재 버킷 수명 주기 정책 확인", desc: "logs-bucket의 현재 수명 주기 설정을 확인하세요." },
      { title: "Lifecycle 정책 설정", desc: "30일 후 IA, 90일 후 Glacier 전환 정책을 설정하세요." },
      { title: "정책 확인", desc: "설정된 수명 주기 정책을 확인하세요." },
      { title: "스토리지 클래스 분석 활성화", desc: "최적 전환 시점을 분석하기 위해 Storage Class Analysis를 활성화하세요." },
    ],
    explanation: "S3 스토리지 클래스별 비용: Standard > Intelligent-Tiering > Standard-IA > Glacier Instant > Glacier Flexible > Glacier Deep Archive. 접근 빈도에 맞게 자동 전환하면 비용을 70~95% 절감할 수 있습니다.",
  },
  15: {
    title: "EC2 장애 인스턴스 자동 교체",
    scenario: "EC2 인스턴스가 하드웨어 문제로 가끔 Status Check에 실패합니다. 팀원이 수동으로 재시작하고 있는데, CloudWatch 알람으로 자동 복구되게 설정하세요.",
    steps: [
      { title: "EC2 상태 체크 확인", desc: "현재 EC2 인스턴스의 상태 체크를 확인하세요." },
      { title: "자동 복구 알람 생성", desc: "StatusCheckFailed_System 시 자동 복구하는 알람을 생성하세요." },
      { title: "인스턴스 재시작 알람 추가", desc: "StatusCheckFailed_Instance 시 재시작하는 알람도 추가하세요." },
      { title: "알람 목록 확인", desc: "생성된 EC2 자동화 알람을 확인하세요." },
    ],
    explanation: "EC2 Auto Recovery는 StatusCheckFailed_System 시 같은 AZ의 다른 하드웨어로 인스턴스를 이동합니다. 인스턴스 ID, Elastic IP, EBS 볼륨은 유지됩니다. EC2 재시작(reboot)은 OS 레벨 문제에 대응합니다.",
  },
  16: {
    title: "ECS Fargate 서비스 배포",
    scenario: "EC2 관리가 부담됩니다. 컨테이너를 Fargate로 배포해 서버 관리 없이 애플리케이션을 운영하세요.",
    steps: [
      { title: "ECS 클러스터 생성", desc: "Fargate 전용 ECS 클러스터를 생성하세요." },
      { title: "Task Definition 등록", desc: "웹 애플리케이션 Task Definition을 등록하세요." },
      { title: "ECS 서비스 생성", desc: "2개의 Fargate 태스크를 실행하는 서비스를 생성하세요." },
      { title: "서비스 상태 확인", desc: "ECS 서비스의 실행 중인 태스크 수를 확인하세요." },
    ],
    explanation: "ECS Fargate는 서버리스 컨테이너 실행 환경으로 EC2 프로비저닝/패치/스케일링을 AWS가 관리합니다. FARGATE_SPOT을 혼합하면 비용을 최대 70% 절감할 수 있습니다.",
  },
  17: {
    title: "ELB 액세스 로그 활성화",
    scenario: "서비스 장애 발생 시 어떤 요청이 어느 서버로 갔는지 알 수 없습니다. ALB 액세스 로그를 S3에 저장해 요청 추적이 가능하게 하세요.",
    steps: [
      { title: "ALB 현재 속성 확인", desc: "web-alb의 현재 액세스 로그 설정을 확인하세요." },
      { title: "로그 저장 S3 버킷 생성", desc: "ALB 로그를 저장할 버킷을 생성하세요." },
      { title: "ALB 액세스 로그 활성화", desc: "로그를 S3에 저장하도록 ALB를 설정하세요." },
      { title: "로그 파일 확인", desc: "5분 후 S3에 로그 파일이 생성됐는지 확인하세요." },
    ],
    explanation: "ALB 액세스 로그에는 요청 시간, 클라이언트 IP, 요청 처리 시간, 대상 IP, HTTP 상태 코드 등이 포함됩니다. Athena로 쿼리하면 특정 IP의 요청, 5xx 오류, 느린 요청 등을 빠르게 분석할 수 있습니다.",
  },
  18: {
    title: "EventBridge 스케줄러로 작업 자동화",
    scenario: "매일 자정에 DB 집계 Lambda를 실행하고 매주 월요일 오전 9시에 리포트 생성 Lambda를 실행해야 합니다. cron 표현식으로 EventBridge 스케줄을 구성하세요.",
    steps: [
      { title: "일일 자정 스케줄 규칙 생성", desc: "매일 자정(UTC 15:00)에 db-aggregator Lambda를 실행하는 규칙을 생성하세요." },
      { title: "Lambda를 규칙 타겟으로 추가", desc: "db-aggregator Lambda를 규칙의 타겟으로 추가하세요." },
      { title: "주간 리포트 규칙 생성", desc: "매주 월요일 오전 9시(UTC 00:00)에 실행되는 규칙을 생성하세요." },
      { title: "규칙 목록 확인", desc: "생성된 EventBridge 규칙들을 확인하세요." },
    ],
    explanation: "EventBridge 스케줄러는 cron 또는 rate 표현식으로 Lambda, ECS 태스크, SQS 메시지 전송 등을 예약할 수 있습니다. AWS cron은 6개 필드(분 시 일 월 요일 연)를 사용하며, 일/요일 중 하나는 반드시 ?로 표시해야 합니다.",
  },
  19: {
    title: "SNS 팬아웃 패턴 구성",
    scenario: "주문이 생성될 때 재고 서비스, 배송 서비스, 이메일 서비스가 동시에 처리해야 합니다. SNS → 여러 SQS 큐로 메시지를 팬아웃하는 패턴을 구성하세요.",
    steps: [
      { title: "SNS 토픽 생성", desc: "이메일 알림을 받을 SNS 토픽 notifications-topic을 생성하세요." },
      { title: "SQS 큐 생성 (재고 서비스)", desc: "재고 처리용 SQS 큐를 생성하세요." },
      { title: "SQS 큐를 SNS 토픽에 구독", desc: "inventory-queue를 order-events 토픽에 구독시키세요." },
      { title: "SNS 메시지 발행 테스트", desc: "테스트 주문 이벤트를 SNS에 발행하세요." },
    ],
    explanation: "SNS 팬아웃 패턴은 하나의 메시지를 여러 구독자에게 동시에 전달합니다. SNS → SQS 조합은 각 소비자가 독립적으로 처리할 수 있어 느슨한 결합을 구현합니다. SQS에 DLQ를 추가하면 실패 메시지도 처리할 수 있습니다.",
  },
  20: {
    title: "CloudFront 캐시 무효화 및 배포",
    scenario: "웹사이트를 S3에 새 버전으로 배포했는데 사용자들에게 여전히 구 버전이 보입니다. CloudFront 캐시를 무효화하고 배포 상태를 확인하세요.",
    steps: [
      { title: "현재 CloudFront 배포 목록 확인", desc: "계정의 CloudFront 배포 목록을 확인하세요." },
      { title: "캐시 무효화 생성", desc: "모든 파일의 캐시를 무효화하세요." },
      { title: "무효화 상태 확인", desc: "무효화가 완료됐는지 확인하세요." },
      { title: "캐시 동작 설정 확인", desc: "배포의 기본 캐시 동작 TTL을 확인하세요." },
    ],
    explanation: "CloudFront 캐시 무효화는 엣지 로케이션에 캐시된 파일을 강제로 삭제합니다. /* 무효화는 모든 파일에 적용되지만, 구체적인 경로(/index.html)를 지정하면 비용이 절감됩니다. 무효화 완료까지 보통 1-2분이 소요됩니다.",
  },
  21: {
    title: "Kinesis Data Stream 처리량 확장",
    scenario: "실시간 로그 수집 Kinesis 스트림이 처리 용량을 초과해 데이터가 유실됩니다. 샤드 수를 늘려 처리량을 확장하세요.",
    steps: [
      { title: "현재 스트림 샤드 수 확인", desc: "log-stream의 현재 샤드 수를 확인하세요." },
      { title: "샤드 수 증가", desc: "처리량 확장을 위해 샤드를 2개에서 4개로 늘리세요." },
      { title: "스트림 상태 확인", desc: "샤드 확장이 완료됐는지 확인하세요." },
      { title: "Enhanced Fan-Out 소비자 등록", desc: "전용 처리량(2MB/s)을 위해 Enhanced Fan-Out 소비자를 등록하세요." },
    ],
    explanation: "Kinesis 스트림은 샤드 단위로 용량이 결정됩니다. 샤드 1개당 쓰기 1MB/s, 읽기 2MB/s를 처리합니다. Enhanced Fan-Out은 소비자별 전용 2MB/s 읽기 처리량을 제공해 여러 소비자가 있을 때 병목을 해소합니다.",
  },
  22: {
    title: "RDS 스냅샷으로 특정 시점 복원",
    scenario: "개발팀이 실수로 운영 DB 테이블을 삭제했습니다. 자동 백업을 이용해 삭제 직전 시점으로 DB를 복원하세요.",
    steps: [
      { title: "자동 백업 스냅샷 목록 확인", desc: "복원 가능한 자동 백업 스냅샷을 확인하세요." },
      { title: "특정 시점 복원(PITR)", desc: "삭제 직전인 오늘 오전 8:59으로 DB를 복원하세요." },
      { title: "복원 완료 확인", desc: "복원된 인스턴스가 available 상태인지 확인하세요." },
      { title: "복원된 DB 엔드포인트 확인", desc: "복원된 DB에 연결할 엔드포인트를 확인하세요." },
    ],
    explanation: "RDS PITR(Point-In-Time Recovery)은 자동 백업 보존 기간 내 임의의 시점으로 복원합니다. 복원은 새 인스턴스로 생성됩니다. 복원 후 데이터를 검증하고, 필요한 데이터를 원본 DB에 복사하는 방식으로 사용합니다.",
  },
  23: {
    title: "Lambda 에러 처리 및 재시도 설정",
    scenario: "Lambda 함수 실행 중 일시적인 외부 API 오류로 실패하는 경우가 있습니다. 최대 2회 재시도하고, 그래도 실패하면 SQS DLQ에 실패 이벤트를 저장하도록 설정하세요.",
    steps: [
      { title: "Lambda 현재 재시도 설정 확인", desc: "data-processor Lambda의 현재 이벤트 호출 설정을 확인하세요." },
      { title: "DLQ용 SQS 큐 생성", desc: "실패 이벤트를 저장할 SQS 큐를 생성하세요." },
      { title: "재시도 및 DLQ 설정", desc: "최대 2회 재시도, 실패 시 DLQ로 전송하도록 설정하세요." },
      { title: "설정 확인", desc: "재시도 설정이 올바르게 적용됐는지 확인하세요." },
    ],
    explanation: "Lambda 비동기 호출은 기본적으로 2회 재시도(총 3회 실행)합니다. MaximumRetryAttempts를 0으로 설정하면 재시도 없이 바로 DLQ로 전송됩니다. OnSuccess Destination도 설정하면 성공 이벤트도 추적할 수 있습니다.",
  },
  24: {
    title: "CodeDeploy Blue/Green 배포",
    scenario: "새 버전 배포 시 서비스가 잠깐 중단됩니다. CodeDeploy Blue/Green 배포로 무중단 배포를 구현하고, 문제 발생 시 즉시 롤백하세요.",
    steps: [
      { title: "CodeDeploy 애플리케이션 생성", desc: "my-app CodeDeploy 애플리케이션을 생성하세요." },
      { title: "배포 그룹 생성", desc: "prod-deployment 배포 그룹을 생성하고 환경태그 env=prod인 2개 EC2 인스턴스를 등록하세요." },
      { title: "새 버전 배포", desc: "새 컨테이너 이미지로 배포를 시작하세요." },
      { title: "배포 상태 확인", desc: "prod-deployment의 배포 상태가 Succeeded가 되는지 확인하세요." },
    ],
    explanation: "Blue/Green 배포는 새 버전(Green)을 별도로 배포한 후 트래픽을 전환합니다. 문제 발생 시 트래픽을 다시 기존 버전(Blue)으로 즉시 롤백할 수 있습니다. ECS + CodeDeploy 조합이 가장 일반적인 패턴입니다.",
  },
  25: {
    title: "API Gateway + Lambda 스로틀링 설정",
    scenario: "API Gateway로 노출된 Lambda API에 트래픽이 급증하면 Lambda가 throttle됩니다. API Gateway 사용량 계획과 스로틀링으로 과부하를 방지하세요.",
    steps: [
      { title: "API Gateway API 목록 확인", desc: "현재 배포된 API 목록을 확인하세요." },
      { title: "사용량 계획 생성", desc: "초당 100 요청, 버스트 200으로 제한하는 사용량 계획을 생성하세요." },
      { title: "API 스테이지를 사용량 계획에 추가", desc: "order-api의 prod 스테이지를 사용량 계획에 추가하세요." },
      { title: "API Gateway 메트릭 확인", desc: "API Gateway의 4xx/5xx 오류율을 확인하세요." },
    ],
    explanation: "API Gateway 스로틀링은 초당 요청 수(rateLimit)와 버스트 용량(burstLimit)을 제한합니다. 초과 요청은 429 Too Many Requests를 반환합니다. 사용량 계획과 API 키를 결합하면 고객별로 다른 제한을 적용할 수 있습니다.",
  },
  26: {
    title: "Aurora Serverless로 가변 트래픽 대응",
    scenario: "낮에는 트래픽이 많고 밤에는 거의 없는 서비스의 RDS 비용이 너무 높습니다. Aurora Serverless v2로 마이그레이션해 트래픽에 따라 자동으로 용량이 조절되게 하세요.",
    steps: [
      { title: "Aurora Serverless v2 클러스터 생성", desc: "ACU 0.5~16으로 설정된 Aurora MySQL Serverless v2 클러스터를 생성하세요." },
      { title: "Serverless 인스턴스 추가", desc: "클러스터에 db.serverless 인스턴스를 추가하세요." },
      { title: "클러스터 상태 확인", desc: "Aurora 클러스터가 available 상태인지 확인하세요." },
      { title: "ACU 사용량 확인", desc: "CloudWatch에서 Aurora의 ACU 사용량을 확인하세요." },
    ],
    explanation: "Aurora Serverless v2는 트래픽에 따라 0.5 ACU에서 최대 128 ACU까지 수 초 내에 자동 스케일링합니다. 기존 RDS 대비 트래픽이 없는 시간에는 최소 비용만 발생합니다. 프로덕션 워크로드에도 사용 가능합니다.",
  },
  27: {
    title: "CloudWatch 대시보드 구성",
    scenario: "서비스 상태를 한눈에 모니터링하는 대시보드가 없어서 장애 시 어디를 봐야 할지 모릅니다. 핵심 지표를 보여주는 CloudWatch 대시보드를 구성하세요.",
    steps: [
      { title: "대시보드 생성", desc: "서비스 모니터링용 CloudWatch 대시보드를 생성하세요." },
      { title: "대시보드 목록 확인", desc: "생성된 대시보드를 확인하세요." },
      { title: "ALB 응답 시간 지표 확인", desc: "ALB의 평균 응답 시간을 확인하세요." },
      { title: "알람 상태 일괄 확인", desc: "현재 ALARM 상태인 CloudWatch 알람을 확인하세요." },
    ],
    explanation: "CloudWatch 대시보드는 여러 리전의 지표를 한 화면에 통합합니다. 자동 새로 고침(10초~1시간)과 시간 범위 조정이 가능합니다. 핵심 지표(응답 시간, 오류율, CPU, 메모리)를 포함하면 장애 시 빠른 진단이 가능합니다.",
  },
  28: {
    title: "Systems Manager Session Manager로 안전한 접속",
    scenario: "EC2에 SSH 키를 배포하고 22번 포트를 열어두는 방식이 보안상 위험합니다. SSM Session Manager로 SSH 없이 인스턴스에 접속하고 22번 포트를 닫으세요.",
    steps: [
      { title: "SSM Agent 설치 확인", desc: "인스턴스에 SSM Agent가 실행 중인지 확인하세요." },
      { title: "Session Manager로 세션 시작", desc: "SSM Session Manager로 인스턴스에 접속하세요." },
      { title: "SSH 22번 포트 규칙 삭제", desc: "보안 그룹에서 SSH 인바운드 규칙을 삭제하세요." },
      { title: "세션 기록 확인", desc: "Session Manager를 통한 접속 기록을 확인하세요." },
    ],
    explanation: "SSM Session Manager는 SSH/RDP 없이 브라우저나 AWS CLI로 EC2에 안전하게 접속합니다. 22번 포트를 닫을 수 있고, 모든 세션이 CloudTrail과 S3에 기록됩니다. 키 분실/유출 위험도 없습니다.",
  },
  29: {
    title: "Elastic IP로 인스턴스 교체 시 IP 유지",
    scenario: "웹 서버 IP가 재시작할 때마다 바뀌어서 DNS 설정을 매번 변경해야 합니다. Elastic IP를 할당하고 인스턴스를 교체해도 IP가 유지되게 하세요.",
    steps: [
      { title: "Elastic IP 할당", desc: "새 Elastic IP를 할당하세요." },
      { title: "EC2 인스턴스에 Elastic IP 연결", desc: "할당된 Elastic IP를 EC2 인스턴스에 연결하세요." },
      { title: "Elastic IP 연결 확인", desc: "Elastic IP가 인스턴스에 연결됐는지 확인하세요." },
      { title: "인스턴스 교체 후 Elastic IP 재연결", desc: "새 인스턴스로 Elastic IP를 재연결하세요." },
    ],
    explanation: "Elastic IP는 계정에 고정 할당된 퍼블릭 IP입니다. --allow-reassociation 옵션으로 다른 인스턴스로 즉시 재연결할 수 있어, 인스턴스를 교체해도 IP 변경 없이 서비스를 유지할 수 있습니다. 미사용 Elastic IP는 요금이 발생합니다.",
  },
  30: {
    title: "재해 복구 시뮬레이션 — 리전 장애 대응",
    scenario: "서울 리전(ap-northeast-2) 장애 시나리오입니다. DR 계획에 따라 도쿄 리전(ap-northeast-1)으로 서비스를 전환하는 절차를 시뮬레이션하세요.",
    steps: [
      { title: "도쿄 리전 백업 상태 확인", desc: "도쿄 리전에 DR 인스턴스가 준비됐는지 확인하세요." },
      { title: "DR 인스턴스 시작", desc: "도쿄 리전의 DR 인스턴스를 시작하세요." },
      { title: "RDS 최신 스냅샷 도쿄에 복원", desc: "최신 RDS 스냅샷을 도쿄 리전에 복원하세요." },
      { title: "Route 53 DNS 도쿄로 절체", desc: "Route 53에서 도쿄 리전 엔드포인트로 DNS를 변경하세요." },
      { title: "DNS 전파 확인", desc: "DNS 변경이 완료됐는지 확인하세요." },
    ],
    explanation: "DR(Disaster Recovery) 절차: 백업 리전 리소스 확인 → 인스턴스/DB 시작 → DNS 절체 → 서비스 확인 순서입니다. RTO(복구 목표 시간)를 최소화하려면 DR 인스턴스를 warm standby로 유지하고 Route 53 자동 페일오버를 설정하는 것이 좋습니다.",
  },
};