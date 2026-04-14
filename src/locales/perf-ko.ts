type ChalI18n = {
  title: string;
  scenario: string;
  steps: Array<{ title: string; desc: string }>;
  explanation: string;
};

export const PERF_CHALLENGES_I18N: Record<number, ChalI18n> = {
  1: {
    title: "ElastiCache Redis 캐싱 설정",
    scenario: "RDS에 직접 쿼리하는 API가 응답 시간이 500ms를 넘습니다. 자주 조회되는 데이터를 ElastiCache Redis에 캐싱해 응답 시간을 10ms 이하로 줄이세요.",
    steps: [
      { title: "ElastiCache 서브넷 그룹 생성", desc: "ElastiCache 클러스터를 배치할 서브넷 그룹을 생성하세요." },
      { title: "Redis 클러스터 생성", desc: "cache.r6g.large 타입으로 Redis 6.x 클러스터를 생성하세요." },
      { title: "클러스터 엔드포인트 확인", desc: "애플리케이션에서 사용할 Redis 엔드포인트를 확인하세요." },
      { title: "CloudWatch 캐시 히트율 확인", desc: "ElastiCache의 CacheHits / CacheMisses 메트릭을 조회해 캐싱 효율을 확인하세요." },
    ],
    explanation: "ElastiCache Redis는 인메모리 캐시로 RDS 부하를 줄이고 응답 시간을 대폭 단축합니다. CacheHits/CacheMisses 비율로 캐시 효율을 모니터링하세요. cache.r6g 계열은 Graviton2 기반으로 비용 대비 성능이 뛰어납니다.",
  },
  2: {
    title: "CloudFront 배포 및 TTL 최적화",
    scenario: "정적 파일(이미지, JS, CSS)을 S3에서 직접 서빙하고 있어 전 세계 사용자 응답이 느립니다. CloudFront를 앞에 배치하고 TTL을 최적화해 엣지 캐싱을 활용하세요.",
    steps: [
      { title: "Origin Access Control 생성", desc: "S3 버킷을 CloudFront에서만 접근할 수 있도록 OAC를 생성하세요." },
      { title: "CloudFront 배포 생성", desc: "S3 버킷을 오리진으로 하는 CloudFront 배포를 생성하세요." },
      { title: "캐시 정책 생성 (장기 TTL)", desc: "정적 자산에 24시간(86400초) TTL 캐시 정책을 생성하세요." },
      { title: "배포 상태 확인", desc: "CloudFront 배포가 배포 완료됐는지 확인하세요." },
      { title: "캐시 히트율 확인", desc: "CloudFront CacheHitRate 메트릭으로 캐싱 효율을 확인하세요." },
    ],
    explanation: "CloudFront는 전 세계 엣지 로케이션에서 정적 파일을 캐싱해 오리진 서버 부하를 줄이고 응답 시간을 단축합니다. 정적 자산은 긴 TTL(24시간+)을 설정하고 파일명에 해시를 포함시켜 캐시 무효화를 관리하세요.",
  },
  3: {
    title: "RDS Read Replica 읽기 분산",
    scenario: "운영 RDS 인스턴스에 읽기 쿼리가 과부하를 유발합니다. Read Replica를 생성해 SELECT 쿼리를 분산하고 마스터 DB의 CPU를 낮추세요.",
    steps: [
      { title: "현재 RDS 인스턴스 확인", desc: "마스터 DB의 스펙과 현재 읽기 부하를 확인하세요." },
      { title: "Read Replica 생성", desc: "같은 AZ에 읽기 전용 복제본을 생성하세요." },
      { title: "Replica 상태 확인", desc: "Read Replica가 available 상태가 됐는지 확인하세요." },
      { title: "CloudWatch 복제 지연 모니터링", desc: "ReplicaLag 메트릭으로 복제 지연을 모니터링하세요." },
    ],
    explanation: "RDS Read Replica는 마스터 DB의 읽기 부하를 분산합니다. 애플리케이션에서 SELECT는 Replica 엔드포인트, INSERT/UPDATE/DELETE는 마스터 엔드포인트로 라우팅하세요. ReplicaLag이 증가하면 Replica 스펙을 높이거나 쿼리를 최적화하세요.",
  },
  4: {
    title: "DynamoDB DAX 클러스터 설정",
    scenario: "DynamoDB 테이블 조회 응답이 단일 자릿수 ms이지만 고빈도 읽기로 RCU 비용이 급증합니다. DAX 클러스터를 앞에 두어 캐싱으로 응답 시간과 비용을 모두 줄이세요.",
    steps: [
      { title: "DAX 서브넷 그룹 생성", desc: "DAX 클러스터용 서브넷 그룹을 만드세요." },
      { title: "DAX 클러스터 생성", desc: "dax.r5.large 노드 3개로 DAX 클러스터를 생성하세요." },
      { title: "DAX 클러스터 상태 확인", desc: "DAX 클러스터가 available 상태인지 확인하세요." },
      { title: "DAX 캐시 히트율 확인", desc: "DAX ItemCacheHits 메트릭으로 캐시 효율을 확인하세요." },
    ],
    explanation: "DAX는 DynamoDB와 완전 호환되는 인메모리 캐시로 읽기 응답을 마이크로초 수준으로 단축합니다. DAX SDK로 교체하면 코드 변경이 최소화됩니다. 쓰기 작업은 DAX를 통해 DynamoDB에 직접 반영됩니다.",
  },
  5: {
    title: "Lambda 메모리 최적화",
    scenario: "Lambda 함수가 타임아웃(3초)에 자주 걸립니다. 현재 128MB로 설정돼 있는데 메모리를 늘리면 CPU도 비례해 증가합니다. 최적 메모리를 찾아 실행 시간과 비용을 동시에 줄이세요.",
    steps: [
      { title: "현재 Lambda 설정 확인", desc: "함수의 메모리, 타임아웃, 최근 실행 시간을 확인하세요." },
      { title: "Lambda 메모리 1024MB로 증설", desc: "메모리를 1024MB, 타임아웃을 10초로 업데이트하세요." },
      { title: "CloudWatch Duration 메트릭 확인", desc: "메모리 증설 후 평균 실행 시간 변화를 확인하세요." },
      { title: "Throttles 알람 생성", desc: "Lambda 스로틀링 발생 시 알람이 울리도록 설정하세요." },
      { title: "동시 실행 제한 설정", desc: "이 함수에 예약 동시성(Reserved Concurrency) 50을 설정하세요." },
    ],
    explanation: "Lambda는 메모리를 늘리면 CPU와 네트워크 대역폭도 비례해 증가합니다. 128MB → 1024MB로 8배 늘리면 실행 시간이 크게 줄어 오히려 총 비용이 감소하는 경우가 많습니다. AWS Lambda Power Tuning 도구로 최적 메모리를 자동으로 찾을 수 있습니다.",
  },
  6: {
    title: "S3 Transfer Acceleration",
    scenario: "해외 지사(유럽, 아시아)에서 S3 버킷(us-east-1)으로 대용량 파일을 업로드할 때 속도가 너무 느립니다. S3 Transfer Acceleration을 활성화해 CloudFront 엣지를 통한 빠른 업로드 경로를 제공하세요.",
    steps: [
      { title: "Transfer Acceleration 활성화", desc: "대상 S3 버킷에 Transfer Acceleration을 활성화하세요." },
      { title: "Acceleration 설정 확인", desc: "Transfer Acceleration이 활성화됐는지 확인하세요." },
      { title: "속도 비교 테스트", desc: "가속화 엔드포인트로 업로드 속도를 테스트하세요." },
      { title: "S3 버킷 메트릭 활성화", desc: "Upload 성능 추적을 위해 S3 요청 메트릭을 활성화하세요." },
    ],
    explanation: "S3 Transfer Acceleration은 CloudFront 엣지 네트워크를 통해 업로드를 최적화합니다. 가속화 엔드포인트는 [bucket].s3-accelerate.amazonaws.com 형식입니다. 해외에서 AWS 리전까지의 인터넷 구간을 AWS 글로벌 네트워크로 대체해 50-500% 속도 향상을 기대할 수 있습니다.",
  },
  7: {
    title: "EBS gp2 → gp3 볼륨 업그레이드",
    scenario: "프로덕션 EC2 서버의 디스크 I/O가 병목입니다. 현재 gp2 500GB 볼륨을 사용 중인데 gp3로 업그레이드하면 IOPS를 독립적으로 설정해 더 나은 성능을 더 저렴하게 얻을 수 있습니다.",
    steps: [
      { title: "현재 EBS 볼륨 확인", desc: "인스턴스에 연결된 EBS 볼륨의 현재 설정을 확인하세요." },
      { title: "gp2 → gp3 볼륨 변경", desc: "gp3로 변경하면서 IOPS 6000, 처리량 250MB/s로 설정하세요." },
      { title: "볼륨 수정 상태 확인", desc: "볼륨 수정이 완료됐는지 확인하세요." },
      { title: "VolumeReadOps / VolumeWriteOps 확인", desc: "CloudWatch로 IOPS 향상을 확인하세요." },
    ],
    explanation: "gp3는 gp2 대비 20% 저렴하면서 기본 3000 IOPS와 125MB/s 처리량을 제공합니다. gp2는 볼륨 크기에 IOPS가 연동(3 IOPS/GB)되지만 gp3는 독립적으로 설정 가능합니다. EC2 재시작 없이 온라인으로 변경됩니다.",
  },
  8: {
    title: "API Gateway 응답 캐싱",
    scenario: "API Gateway + Lambda 조합으로 운영 중인데 동일한 GET 요청이 반복되어 Lambda가 과도하게 호출됩니다. API Gateway 스테이지에 캐시를 활성화해 중복 Lambda 호출을 줄이세요.",
    steps: [
      { title: "API Gateway 캐시 활성화", desc: "스테이지에 캐시 용량 0.5GB, TTL 300초로 활성화하세요." },
      { title: "메서드 캐시 TTL 설정", desc: "GET /products 메서드에 캐시 TTL을 300초로 설정하세요." },
      { title: "캐시 히트율 메트릭 확인", desc: "API Gateway CacheHitCount 메트릭을 조회하세요." },
      { title: "캐시 무효화", desc: "데이터 변경 시 캐시를 즉시 무효화하세요." },
    ],
    explanation: "API Gateway 캐싱은 동일한 요청에 대해 Lambda를 재호출하지 않고 캐시된 응답을 반환합니다. GET 메서드의 경우 쿼리스트링/헤더를 캐시 키에 포함할 수 있습니다. 캐시 TTL은 최대 3600초(1시간)이며 데이터 변경 시 flush-stage-cache로 무효화하세요.",
  },
  9: {
    title: "RDS Proxy 연결 풀링",
    scenario: "Lambda 함수가 RDS에 직접 연결하는데 동시 실행이 증가하면 ",
    steps: [
      { title: "현재 DB 연결 수 확인", desc: "RDS DatabaseConnections 메트릭으로 현재 연결 수를 확인하세요." },
      { title: "RDS Proxy 생성", desc: "MySQL 프로토콜로 RDS Proxy를 생성하세요." },
      { title: "Proxy Target 등록", desc: "RDS 인스턴스를 Proxy 대상으로 등록하세요." },
      { title: "Proxy 엔드포인트 확인", desc: "Proxy 상태와 연결 엔드포인트를 확인하세요." },
      { title: "연결 수 감소 확인", desc: "Proxy 적용 후 RDS 직접 연결 수가 줄었는지 확인하세요." },
    ],
    explanation: "RDS Proxy는 Lambda나 컨테이너처럼 연결이 빈번히 생성/종료되는 환경에서 DB 연결을 풀링합니다. 수천 개의 Lambda 실행이 Proxy의 수십 개 연결을 공유합니다. IAM 인증과 Secrets Manager를 통해 보안도 강화됩니다.",
  },
  10: {
    title: "EC2 인스턴스 타입 최적화",
    scenario: "배치 처리 서버가 t3.medium인데 CPU 크레딧이 소진되면 처리 속도가 급락합니다. CPU 집약적인 워크로드에 적합한 c5 계열로 마이그레이션하고 성능을 비교하세요.",
    steps: [
      { title: "현재 인스턴스 타입 및 크레딧 확인", desc: "T3 인스턴스의 CPU 크레딧 잔액을 확인하세요." },
      { title: "인스턴스 중지", desc: "타입 변경을 위해 인스턴스를 중지하세요." },
      { title: "인스턴스 타입 변경", desc: "t3.medium에서 c5.xlarge로 인스턴스 타입을 변경하세요." },
      { title: "인스턴스 재시작", desc: "인스턴스를 다시 시작하세요." },
      { title: "CPU 사용률 비교", desc: "c5.xlarge에서 동일 워크로드의 CPU 사용률을 확인하세요." },
    ],
    explanation: "T 계열(t2, t3, t4g)은 버스트 가능 인스턴스로 크레딧이 소진되면 기준 성능(CPU의 20-40%)으로 제한됩니다. CPU 집약적 워크로드는 C 계열(c5, c6i, c6g), 메모리 집약적은 R 계열, 범용은 M 계열이 적합합니다. c5.xlarge는 4vCPU / 8GB 메모리로 t3.medium 대비 4배 많은 vCPU를 제공합니다.",
  },
  11: {
    title: "Global Accelerator 설정",
    scenario: "서울 리전에 있는 API 서버에 미국/유럽 사용자가 접근할 때 레이턴시가 200ms를 넘습니다. Global Accelerator를 통해 AWS 글로벌 네트워크를 활용해 레이턴시를 50ms 이하로 줄이세요.",
    steps: [
      { title: "Global Accelerator 생성", desc: "Accelerator를 생성하세요." },
      { title: "리스너 생성", desc: "TCP 443 포트 리스너를 추가하세요." },
      { title: "Endpoint Group 추가", desc: "ap-northeast-2 리전의 ALB를 엔드포인트 그룹으로 추가하세요." },
      { title: "레이턴시 개선 확인", desc: "Global Accelerator 엔드포인트로 레이턴시를 비교하세요." },
    ],
    explanation: "Global Accelerator는 사용자의 트래픽을 가장 가까운 AWS 엣지 로케이션에서 받아 AWS 글로벌 네트워크로 전달합니다. 퍼블릭 인터넷 경로를 줄여 레이턴시와 패킷 손실을 줄입니다. Anycast IP로 DDoS 공격에도 강합니다.",
  },
  12: {
    title: "DynamoDB GSI 생성 및 쿼리 최적화",
    scenario: "DynamoDB 테이블을 userId(PK)로 조회하는데, email로도 사용자를 찾아야 하는 요구가 생겼습니다. 풀 테이블 스캔 없이 email로 빠르게 조회할 GSI를 추가하세요.",
    steps: [
      { title: "현재 테이블 키 구조 확인", desc: "기존 테이블의 키 스키마와 인덱스를 확인하세요." },
      { title: "GSI 추가 (email-index)", desc: "email 속성을 파티션키로 하는 GSI를 추가하세요." },
      { title: "GSI 빌드 완료 확인", desc: "GSI 상태가 ACTIVE로 바뀔 때까지 확인하세요." },
      { title: "GSI로 email 쿼리", desc: "GSI를 사용해 email로 사용자를 조회하세요." },
    ],
    explanation: "DynamoDB GSI는 원래 테이블과 다른 파티션키/정렬키로 쿼리할 수 있게 해줍니다. Scan 대신 Query + GSI를 사용하면 비용과 성능이 크게 개선됩니다. GSI 생성 후 데이터 복제가 완료되기까지 시간이 걸립니다. ProjectionType은 쿼리 시 필요한 속성만 포함해 RCU를 줄이세요.",
  },
  13: {
    title: "SQS + Lambda 배치 처리 최적화",
    scenario: "SQS 메시지를 Lambda가 1건씩 처리하다보니 Lambda 호출 수가 너무 많고 처리 속도도 느립니다. 배치 크기를 늘리고 SQS 트리거 최적화로 처리량을 높이세요.",
    steps: [
      { title: "현재 이벤트 소스 매핑 확인", desc: "Lambda의 SQS 이벤트 소스 매핑을 확인하세요." },
      { title: "배치 크기 10으로 증가", desc: "한 번에 10개 메시지를 처리하도록 배치 크기를 수정하세요." },
      { title: "SQS 큐 속성 확인", desc: "큐의 가시성 타임아웃과 메시지 수를 확인하세요." },
      { title: "가시성 타임아웃 조정", desc: "Lambda 처리 시간보다 6배 긴 180초로 가시성 타임아웃을 설정하세요." },
      { title: "Lambda 호출 수 감소 확인", desc: "Invocations 메트릭으로 Lambda 호출 수가 줄었는지 확인하세요." },
    ],
    explanation: "SQS + Lambda 배치 처리 시 BatchSize를 늘리면 Lambda 호출 수가 줄어 비용이 감소합니다. MaximumBatchingWindowInSeconds로 메시지를 모아 더 큰 배치를 만들 수 있습니다. 가시성 타임아웃은 Lambda 최대 실행 시간의 6배로 설정하는 것이 AWS 권장 사항입니다.",
  },
  14: {
    title: "Kinesis Data Streams 샤드 확장",
    scenario: "실시간 로그 수집에 Kinesis Data Streams를 사용 중인데 WriteProvisionedThroughputExceeded 오류가 발생합니다. 현재 샤드 2개를 4개로 늘려 처리량을 확보하세요.",
    steps: [
      { title: "현재 스트림 상태 확인", desc: "스트림의 샤드 수와 상태를 확인하세요." },
      { title: "스트림 샤드 수 증가", desc: "샤드를 2개에서 4개로 확장하세요." },
      { title: "확장 완료 확인", desc: "샤드가 4개로 늘어났는지 확인하세요." },
      { title: "WriteProvisionedThroughputExceeded 알람", desc: "쓰기 병목 재발 감지 알람을 생성하세요." },
    ],
    explanation: "Kinesis 샤드 하나는 쓰기 1MB/s(1000 records/s), 읽기 2MB/s를 지원합니다. 샤드 확장은 UNIFORM_SCALING으로 2배 단위로만 가능합니다. 파티션 키를 다양하게 설계하면 샤드 간 균등 분산이 보장됩니다.",
  },
  15: {
    title: "AWS X-Ray 분산 추적 활성화",
    scenario: "MSA 환경에서 특정 API가 느린데 어느 서비스에서 병목이 생기는지 알 수 없습니다. X-Ray를 활성화해 요청 흐름과 각 구간별 레이턴시를 추적하세요.",
    steps: [
      { title: "Lambda X-Ray 활성 추적 활성화", desc: "Lambda 함수에 X-Ray 액티브 추적을 켜세요." },
      { title: "API Gateway X-Ray 추적 활성화", desc: "API Gateway 스테이지에 X-Ray 추적을 활성화하세요." },
      { title: "X-Ray 서비스 맵 확인", desc: "X-Ray 서비스 그래프를 조회해 서비스 간 호출 관계를 확인하세요." },
      { title: "느린 트레이스 조회", desc: "응답 시간 상위 5개 느린 트레이스를 조회하세요." },
    ],
    explanation: "X-Ray는 분산 요청을 추적해 서비스 간 레이턴시와 오류를 시각화합니다. Lambda와 API Gateway 모두 활성화해야 end-to-end 트레이스가 됩니다. filter-expression으로 느린 요청만 필터링해 병목을 빠르게 찾을 수 있습니다.",
  },
  16: {
    title: "RDS Performance Insights 활성화",
    scenario: "RDS 인스턴스의 CPU가 지속적으로 높은데 어떤 쿼리가 원인인지 모릅니다. Performance Insights를 활성화해 상위 SQL 쿼리를 찾고 DB 부하를 분석하세요.",
    steps: [
      { title: "Performance Insights 활성화", desc: "prod-database RDS 인스턴스에 Performance Insights를 활성화하세요." },
      { title: "상위 SQL 쿼리 조회", desc: "db.sql.statement 차원으로 가장 부하가 높은 쿼리를 조회하세요." },
      { title: "DB 로드 메트릭 확인", desc: "DBLoad 메트릭으로 DB 부하 추이를 확인하세요." },
      { title: "RDS Enhanced Monitoring 활성화", desc: "1초 간격 OS 레벨 모니터링을 활성화하세요." },
    ],
    explanation: "Performance Insights는 DB 엔진 레벨의 Wait 이벤트와 상위 SQL을 시각화합니다. db.load.avg가 vCPU 수를 초과하면 병목입니다. Enhanced Monitoring은 OS 레벨(CPU, 메모리, I/O)을 1초 단위로 측정해 Performance Insights와 함께 사용하면 완전한 DB 성능 분석이 가능합니다.",
  },
  17: {
    title: "Lambda Provisioned Concurrency",
    scenario: "Lambda 함수가 콜드 스타트로 인해 첫 요청 응답이 2~3초 걸립니다. 결제 API처럼 응답이 항상 빨라야 하는 함수에 Provisioned Concurrency를 설정해 콜드 스타트를 제거하세요.",
    steps: [
      { title: "현재 콜드 스타트 빈도 확인", desc: "InitDuration 메트릭으로 콜드 스타트 횟수를 확인하세요." },
      { title: "함수 버전 게시", desc: "Provisioned Concurrency 적용을 위해 함수 버전을 게시하세요." },
      { title: "Provisioned Concurrency 10개 설정", desc: "버전 5에 10개의 예약 동시성을 설정하세요." },
      { title: "Provisioned Concurrency 준비 완료 확인", desc: "설정이 준비됐는지 확인하세요." },
      { title: "콜드 스타트 제거 확인", desc: "InitDuration 메트릭이 0에 가까워졌는지 확인하세요." },
    ],
    explanation: "Provisioned Concurrency는 지정한 수만큼 Lambda 인스턴스를 항상 초기화된 상태로 유지합니다. 버전 또는 Alias에만 설정 가능하며 $LATEST에는 적용되지 않습니다. Application Auto Scaling으로 시간대별 프로비저닝 수를 자동 조정할 수 있습니다.",
  },
  18: {
    title: "S3 멀티파트 업로드 최적화",
    scenario: "10GB 이상의 대용량 파일을 S3에 단일 PUT으로 올리다가 네트워크 오류가 나면 처음부터 다시 시작해야 합니다. 멀티파트 업로드를 활용해 병렬 전송과 재시도 효율을 높이세요.",
    steps: [
      { title: "멀티파트 업로드 시작", desc: "멀티파트 업로드를 초기화해 UploadId를 받으세요." },
      { title: "Part 업로드", desc: "첫 번째 파트(100MB)를 업로드하세요." },
      { title: "멀티파트 업로드 완료", desc: "모든 파트 업로드 후 멀티파트를 완료하세요." },
      { title: "불완전 멀티파트 정리 규칙", desc: "중단된 업로드가 쌓이지 않도록 7일 후 자동 삭제 규칙을 설정하세요." },
    ],
    explanation: "멀티파트 업로드는 파일을 여러 파트로 나눠 병렬로 전송합니다. 5MB 이상 파트에 적용되며 최대 10,000 파트까지 가능합니다. 중단 시 해당 파트부터 재시작할 수 있어 대용량 파일에 필수입니다. AbortIncompleteMultipartUpload 라이프사이클 규칙으로 미완성 업로드의 과금을 방지하세요.",
  },
  19: {
    title: "EC2 Enhanced Networking (ENA) 확인",
    scenario: "대용량 데이터를 처리하는 EC2 인스턴스 간 네트워크 처리량이 느립니다. ENA(Elastic Network Adapter)가 활성화됐는지 확인하고 인스턴스 타입이 네트워크 최적화를 지원하는지 점검하세요.",
    steps: [
      { title: "ENA 지원 여부 확인", desc: "현재 인스턴스의 ENA 속성을 확인하세요." },
      { title: "네트워크 인터페이스 상세 확인", desc: "ENI의 네트워크 성능 설정을 확인하세요." },
      { title: "인스턴스 네트워크 처리량 메트릭", desc: "NetworkIn/NetworkOut 처리량을 확인하세요." },
      { title: "네트워크 최적화 인스턴스로 변경", desc: "인스턴스를 중지하고 c5n.4xlarge(25Gbps)로 변경하세요." },
    ],
    explanation: "ENA는 고성능 네트워킹을 위한 네트워크 인터페이스로 최대 100Gbps를 지원합니다. c5n, m5n, r5n 같은 네트워크 최적화 인스턴스 패밀리는 더 높은 네트워크 대역폭을 제공합니다. 인스턴스 간 대용량 데이터 전송에는 Placement Group(Cluster)과 함께 사용하면 더욱 효과적입니다.",
  },
  20: {
    title: "ECS Fargate CPU/메모리 튜닝",
    scenario: "Fargate 태스크가 512CPU / 1GB 메모리로 실행되는데 처리 지연이 발생합니다. CloudWatch 메트릭으로 리소스 사용량을 분석하고 태스크 정의를 최적화하세요.",
    steps: [
      { title: "현재 태스크 정의 확인", desc: "현재 태스크 정의의 CPU/메모리 설정을 확인하세요." },
      { title: "Fargate 리소스 사용률 확인", desc: "ECS 서비스의 CPU/메모리 사용률을 확인하세요." },
      { title: "새 태스크 정의 등록 (CPU 2배)", desc: "CPU 1024, 메모리 2048로 업그레이드된 태스크 정의를 등록하세요." },
      { title: "ECS 서비스 업데이트", desc: "새 태스크 정의로 서비스를 업데이트하세요." },
    ],
    explanation: "Fargate CPU는 256~16384vCPU 단위로 설정하며 메모리와 유효한 조합이 있습니다. CPUUtilization이 지속적으로 80% 이상이면 CPU 병목입니다. ECS Service Auto Scaling을 함께 설정해 부하에 따라 태스크 수를 자동으로 조정하세요.",
  },
  21: {
    title: "CloudFront 경로별 캐시 동작 설정",
    scenario: "CloudFront 배포에서 정적 파일(/static/*)은 TTL을 24시간, API 응답(/api/*)은 캐싱하지 않도록 경로별로 다른 캐시 동작을 설정하세요.",
    steps: [
      { title: "현재 배포 캐시 동작 확인", desc: "기존 CloudFront 배포의 캐시 동작을 확인하세요." },
      { title: "API 비캐시 정책 생성", desc: "/api/* 경로에 사용할 캐시 비활성화 정책을 생성하세요." },
      { title: "배포에 경로별 동작 추가", desc: "/api/* 경로에 비캐시, /static/* 경로에 장기 캐시를 설정하세요." },
      { title: "캐시 동작 적용 확인", desc: "배포가 완료됐는지 확인하세요." },
    ],
    explanation: "CloudFront 경로 패턴 우선순위는 특정 경로(/api/*)가 기본 동작(*)보다 먼저 평가됩니다. API 응답은 TTL=0으로 설정해 항상 오리진에서 가져오고 정적 자산은 긴 TTL로 캐싱합니다. CacheBehaviors 순서가 중요합니다: 더 구체적인 경로를 먼저 배치하세요.",
  },
  22: {
    title: "ElastiCache Redis 클러스터 모드 활성화",
    scenario: "단일 Redis 노드가 메모리 부족과 단일 장애점 문제를 가집니다. Redis 클러스터 모드를 활성화해 데이터를 여러 샤드로 분산하고 고가용성을 확보하세요.",
    steps: [
      { title: "클러스터 모드 활성화 복제 그룹 생성", desc: "3개 샤드, 각 1개 복제본으로 Redis 클러스터를 생성하세요." },
      { title: "클러스터 상태 확인", desc: "복제 그룹이 available 상태인지 확인하세요." },
      { title: "클러스터 구성 엔드포인트 확인", desc: "클러스터 모드에서는 Configuration Endpoint를 사용해야 합니다." },
      { title: "메모리 사용률 모니터링", desc: "각 샤드의 DatabaseMemoryUsagePercentage를 확인하세요." },
    ],
    explanation: "Redis 클러스터 모드는 데이터를 최대 500개 샤드에 분산합니다. 클라이언트는 Configuration Endpoint를 사용해야 합니다. automatic-failover-enabled를 설정하면 프라이머리 노드 장애 시 레플리카가 자동으로 프라이머리로 승격됩니다.",
  },
  23: {
    title: "Aurora Read Replica Auto Scaling",
    scenario: "Aurora 클러스터의 읽기 부하가 낮과 밤의 차이가 큽니다. 낮에는 Read Replica가 5개 필요하고 밤에는 1개면 됩니다. Aurora Auto Scaling을 설정해 자동으로 Replica 수를 조정하세요.",
    steps: [
      { title: "현재 Aurora 클러스터 확인", desc: "클러스터의 현재 멤버와 상태를 확인하세요." },
      { title: "Aurora Auto Scaling 정책 등록", desc: "Aurora 클러스터에 Auto Scaling 정책을 등록하세요." },
      { title: "CPU 기반 스케일링 정책 생성", desc: "CPU 70% 기준으로 Replica를 자동 조정하는 정책을 만드세요." },
      { title: "Auto Scaling 정책 확인", desc: "등록된 정책을 확인하세요." },
    ],
    explanation: "Aurora Auto Scaling은 Application Auto Scaling을 통해 Reader 인스턴스 수를 자동 조정합니다. ScaleIn/ScaleOut 쿨다운을 설정해 잦은 스케일링을 방지하세요. Aurora Serverless v2를 사용하면 개별 인스턴스 스케일링 대신 ACU(Aurora Capacity Unit) 단위로 더 세밀하게 자동 조정됩니다.",
  },
  24: {
    title: "DynamoDB 용량 모드 전환 (On-Demand)",
    scenario: "이벤트 기간에만 DynamoDB 트래픽이 폭발적으로 증가합니다. 평소에는 Provisioned 모드가 저렴하지만 이벤트 때는 항상 ProvisionedThroughputExceeded 오류가 납니다. On-Demand 모드로 전환해 자동 스케일링을 활용하세요.",
    steps: [
      { title: "현재 용량 모드 및 설정 확인", desc: "테이블의 현재 처리 용량 설정을 확인하세요." },
      { title: "On-Demand 모드로 전환", desc: "테이블을 PAY_PER_REQUEST 모드로 변경하세요." },
      { title: "전환 완료 확인", desc: "테이블 상태가 ACTIVE로 돌아왔는지 확인하세요." },
      { title: "ConsumedReadCapacityUnits 모니터링", desc: "이벤트 중 실제 소비된 RCU/WCU를 확인하세요." },
    ],
    explanation: "On-Demand 모드는 트래픽에 맞게 자동 스케일링되어 ProvisionedThroughputExceeded 오류가 없습니다. 단, 비용은 요청당 과금이라 예측 가능한 안정적 트래픽에는 Provisioned + Auto Scaling이 더 저렴합니다. 모드 전환은 24시간에 한 번만 가능합니다.",
  },
  25: {
    title: "EventBridge + Lambda 비동기 처리",
    scenario: "사용자 주문 완료 후 재고 업데이트, 이메일 발송, 통계 기록을 동기로 처리하다 보니 API 응답이 3초 이상 걸립니다. EventBridge로 이벤트를 발행하고 각 처리를 비동기로 분리하세요.",
    steps: [
      { title: "EventBridge 이벤트 버스 생성", desc: "커스텀 이벤트 버스를 생성하세요." },
      { title: "이벤트 규칙 생성", desc: "OrderCompleted 이벤트를 처리할 규칙을 만드세요." },
      { title: "Lambda 타겟 등록", desc: "재고 업데이트, 이메일 발송 Lambda를 타겟으로 등록하세요." },
      { title: "테스트 이벤트 발행", desc: "테스트 주문 완료 이벤트를 발행하세요." },
    ],
    explanation: "EventBridge를 통한 이벤트 기반 아키텍처는 서비스 간 결합도를 낮춥니다. 주문 API는 EventBridge에 이벤트만 발행하고 즉시 응답하므로 API 응답 시간이 50ms 이하로 줄어듭니다. 각 소비자(Lambda)는 독립적으로 실패하고 DLQ(Dead Letter Queue)로 실패 이벤트를 관리하세요.",
  },
  26: {
    title: "SQS 메시지 우선순위 처리",
    scenario: "하나의 SQS 큐에서 VIP 주문과 일반 주문이 섞여 처리됩니다. VIP 주문이 더 빨리 처리되어야 하는데 현재 구조로는 불가능합니다. 별도 큐 전략으로 우선순위 처리를 구현하세요.",
    steps: [
      { title: "VIP 전용 SQS 큐 생성", desc: "VIP 주문 전용 큐를 생성하세요." },
      { title: "일반 주문 큐 생성", desc: "일반 주문용 큐를 생성하세요." },
      { title: "Lambda에 VIP 큐 이벤트 소스 연결", desc: "VIP 큐 처리 Lambda를 배치 크기 1로 설정하세요." },
      { title: "VIP 큐 메시지 수 확인", desc: "VIP 큐의 메시지 수와 처리 상태를 확인하세요." },
    ],
    explanation: "SQS는 기본적으로 우선순위 큐를 지원하지 않습니다. 별도 큐를 만들고 VIP 처리 Lambda에 더 많은 동시성을 부여하거나 먼저 폴링하도록 구현합니다. FIFO 큐는 메시지 순서를 보장하며 중복 방지 기능도 제공합니다.",
  },
  27: {
    title: "Kinesis Enhanced Fan-Out 소비자",
    scenario: "Kinesis 스트림 소비자가 여러 개인데 모든 소비자가 초당 2MB 공유 읽기 처리량을 나눠 쓰다 보니 지연이 발생합니다. Enhanced Fan-Out으로 각 소비자에게 전용 2MB/s 대역폭을 제공하세요.",
    steps: [
      { title: "현재 스트림 소비자 확인", desc: "스트림에 등록된 소비자 목록을 확인하세요." },
      { title: "Enhanced Fan-Out 소비자 등록", desc: "알림 서비스용 소비자를 Enhanced Fan-Out으로 등록하세요." },
      { title: "소비자 활성화 확인", desc: "소비자 상태가 ACTIVE가 됐는지 확인하세요." },
      { title: "Lambda Kinesis 트리거에 소비자 ARN 연결", desc: "Lambda 이벤트 소스를 Enhanced Fan-Out 소비자로 설정하세요." },
    ],
    explanation: "Enhanced Fan-Out은 각 소비자에게 샤드당 2MB/s의 전용 읽기 처리량을 제공합니다. 기본 GetRecords 방식은 모든 소비자가 처리량을 공유하지만 Enhanced Fan-Out은 서버 측 Push 방식으로 레이턴시도 200ms에서 70ms로 줄어듭니다. 단, 소비자당 추가 비용이 발생합니다.",
  },
  28: {
    title: "EC2 Cluster Placement Group",
    scenario: "HPC(고성능 컴퓨팅) 워크로드에서 EC2 인스턴스 간 네트워크 지연이 문제입니다. Cluster Placement Group으로 인스턴스를 물리적으로 가까이 배치해 최저 레이턴시를 달성하세요.",
    steps: [
      { title: "Cluster Placement Group 생성", desc: "cluster 전략으로 Placement Group을 생성하세요." },
      { title: "Placement Group에 인스턴스 시작", desc: "c5n.xlarge 인스턴스 4대를 Placement Group 내에 시작하세요." },
      { title: "인스턴스 Placement 확인", desc: "Placement Group에 속한 인스턴스를 확인하세요." },
      { title: "네트워크 레이턴시 확인", desc: "Placement Group 내 인스턴스 간 NetworkIn 메트릭을 비교하세요." },
    ],
    explanation: "Cluster Placement Group은 인스턴스를 같은 AZ의 물리 서버 근처에 배치해 10Gbps 이상의 낮은 레이턴시 네트워크를 제공합니다. HPC, 빅데이터, ML 학습에 적합합니다. 단, 단일 AZ에 제한되므로 가용성이 낮고 인스턴스 시작 실패 가능성이 높습니다(insufficient capacity).",
  },
  29: {
    title: "Network Load Balancer 고처리량 설정",
    scenario: "TCP 연결이 초당 수만 개 발생하는 게임 서버에 ALB가 레이턴시를 유발합니다. NLB로 교체해 레이어 4 처리와 고정 IP를 제공하고 레이턴시를 최소화하세요.",
    steps: [
      { title: "NLB 생성", desc: "TCP 처리를 위한 Network Load Balancer를 생성하세요." },
      { title: "TCP Target Group 생성", desc: "TCP 7777 포트 Target Group을 생성하세요." },
      { title: "NLB 리스너 생성", desc: "TCP 7777 리스너를 추가하세요." },
      { title: "NLB 처리량 메트릭 확인", desc: "ActiveFlowCount와 ProcessedBytes 메트릭을 확인하세요." },
    ],
    explanation: "NLB는 Layer 4(TCP/UDP) 로드밸런서로 ALB보다 훨씬 낮은 레이턴시(100마이크로초 수준)를 제공합니다. 정적 IP와 Elastic IP를 지원하며 초당 수백만 요청을 처리합니다. 게임 서버, IoT, 금융 거래처럼 레이턴시가 중요하고 HTTP 헤더 처리가 불필요한 경우에 적합합니다.",
  },
  30: {
    title: "CloudWatch 성능 대시보드 구성",
    scenario: "여러 서비스의 성능 지표를 한눈에 볼 수 있는 대시보드가 없어 장애 시 원인 파악이 늦습니다. CloudWatch 대시보드를 만들어 ALB 지연, Lambda 오류, RDS CPU, ElastiCache 히트율을 한 화면에 표시하세요.",
    steps: [
      { title: "대시보드 생성", desc: "production-performance 대시보드를 생성하세요." },
      { title: "ALB 지연 알람 생성", desc: "ALB TargetResponseTime이 1초를 초과하면 알람이 울리도록 설정하세요." },
      { title: "Lambda 오류율 알람 생성", desc: "Lambda Errors가 10을 초과하면 알람 설정하세요." },
      { title: "Composite Alarm 생성", desc: "ALB 지연 OR Lambda 오류가 모두 알람 상태일 때만 울리는 복합 알람을 만드세요." },
      { title: "대시보드 조회", desc: "생성된 대시보드를 조회하세요." },
    ],
    explanation: "CloudWatch 대시보드는 여러 서비스 지표를 하나의 화면에서 모니터링합니다. Composite Alarm은 여러 알람을 조합해 알람 노이즈를 줄입니다. put-dashboard의 dashboard-body JSON에 metric 위젯, alarm 위젯, 텍스트 위젯 등을 포함할 수 있습니다. CloudWatch Container Insights, Lambda Insights도 함께 활용하세요.",
  },
};