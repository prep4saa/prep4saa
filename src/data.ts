export interface AWSNode {
  id: string;
  name: string;
  cat: 'compute' | 'storage' | 'database' | 'network' | 'security' | 'messaging' | 'monitor' | 'migration' | 'ops' | 'analytics';
  emoji: string;
  desc: string;
}

export interface Link {
  s: string;
  t: string;
}

export interface ConceptPoint {
  label: string;
  text: string;
  easy: string;
}

export interface Concept {
  title: string;
  subtitle: string;
  easy: string;
  points: ConceptPoint[];
}

export const NODES: AWSNode[] = [
  { id:"ec2",        name:"EC2",             cat:"compute",   emoji:"\u{1F5A5}\uFE0F", desc:"가상 서버 · AMI · Spot/Reserved · Placement Group" },
  { id:"lambda",     name:"Lambda",          cat:"compute",   emoji:"λ",  desc:"서버리스 함수 · 최대 15분 · 이벤트 트리거 · Concurrency" },
  { id:"ecs",        name:"ECS/EKS",         cat:"compute",   emoji:"\u{1F433}", desc:"컨테이너 · Fargate(서버리스) vs EC2 런치타입" },
  { id:"asg",        name:"Auto Scaling",    cat:"compute",   emoji:"\u{1F4C8}", desc:"자동 스케일링 · Target Tracking / Step / Scheduled" },
  { id:"beanstalk",  name:"Beanstalk",       cat:"compute",   emoji:"\u{1FAD8}", desc:"PaaS · 코드만 올리면 인프라 자동 관리" },
  { id:"s3",         name:"S3",              cat:"storage",   emoji:"\u{1FAA3}", desc:"객체 스토리지 · Storage Class · Lifecycle · Versioning" },
  { id:"ebs",        name:"EBS",             cat:"storage",   emoji:"\u{1F4BE}", desc:"블록 스토리지 · EC2 attach · gp3/io2/st1/sc1 · 단일 AZ" },
  { id:"efs",        name:"EFS",             cat:"storage",   emoji:"\u{1F4C1}", desc:"네트워크 파일시스템 · 여러 EC2 동시 마운트 · Multi-AZ" },
  { id:"glacier",    name:"S3 Glacier",      cat:"storage",   emoji:"\u{1F9CA}", desc:"장기 아카이빙 · Instant/Flexible/Deep Archive" },
  { id:"rds",        name:"RDS",             cat:"database",  emoji:"\u{1F5C4}\uFE0F", desc:"관리형 RDBMS · Multi-AZ · Read Replica · 자동 백업" },
  { id:"aurora",     name:"Aurora",          cat:"database",  emoji:"\u2728", desc:"AWS 최적화 DB · MySQL/PostgreSQL 호환 · 6개 복제본" },
  { id:"dynamodb",   name:"DynamoDB",        cat:"database",  emoji:"\u26A1", desc:"서버리스 NoSQL · DAX 캐시 · Global Tables" },
  { id:"elasticache",name:"ElastiCache",     cat:"database",  emoji:"\u{1F680}", desc:"인메모리 캐시 · Redis(영속성) vs Memcached(단순)" },
  { id:"redshift",   name:"Redshift",        cat:"database",  emoji:"\u{1F4CA}", desc:"데이터 웨어하우스 · OLAP · Spectrum으로 S3 쿼리" },
  { id:"vpc",        name:"VPC",             cat:"network",   emoji:"\u{1F310}", desc:"가상 네트워크 · Subnet · IGW · NAT Gateway · SG" },
  { id:"elb",        name:"ELB",             cat:"network",   emoji:"\u2696\uFE0F", desc:"로드밸런서 · ALB(L7) · NLB(L4) · GWLB" },
  { id:"cloudfront", name:"CloudFront",      cat:"network",   emoji:"\u2601\uFE0F", desc:"CDN · 엣지 캐싱 · OAC로 S3 보호 · Lambda@Edge" },
  { id:"route53",    name:"Route 53",        cat:"network",   emoji:"\u{1F500}", desc:"DNS · Weighted/Latency/Failover/Geolocation" },
  { id:"apigw",      name:"API Gateway",     cat:"network",   emoji:"\u{1F6AA}", desc:"API 관리 · REST/WebSocket · Lambda 통합 · Throttling" },
  { id:"directconn", name:"Direct Connect",  cat:"network",   emoji:"\u{1F50C}", desc:"전용선 연결 · 안정적 대역폭 · VPN보다 일관된 성능" },
  { id:"iam",        name:"IAM",             cat:"security",  emoji:"\u{1F510}", desc:"권한 관리 · Role/Policy · STS AssumeRole" },
  { id:"kms",        name:"KMS",             cat:"security",  emoji:"\u{1F511}", desc:"키 관리 · CMK · S3/EBS/RDS 암호화 · Envelope Encryption" },
  { id:"waf",        name:"WAF & Shield",    cat:"security",  emoji:"\u{1F6E1}\uFE0F", desc:"WAF: L7 방화벽 · Shield Standard/Advanced: DDoS 방어" },
  { id:"cognito",    name:"Cognito",         cat:"security",  emoji:"\u{1F464}", desc:"사용자 인증 · User Pool(인증) + Identity Pool" },
  { id:"secrets",    name:"Secrets Manager", cat:"security",  emoji:"\u{1F5DD}\uFE0F", desc:"비밀값 관리 · DB 비번 자동 로테이션" },
  { id:"sqs",        name:"SQS",             cat:"messaging", emoji:"\u{1F4EC}", desc:"메시지 큐 · Standard vs FIFO · DLQ · Visibility Timeout" },
  { id:"sns",        name:"SNS",             cat:"messaging", emoji:"\u{1F4E3}", desc:"Pub/Sub · Topic → 여러 구독자 · Fan-out 패턴" },
  { id:"eventbridge",name:"EventBridge",     cat:"messaging", emoji:"\u{1F309}", desc:"이벤트 버스 · 이벤트 기반 아키텍처 · 스케줄러" },
  { id:"kinesis",    name:"Kinesis",         cat:"messaging", emoji:"\u{1F30A}", desc:"실시간 스트리밍 · Data Streams/Firehose/Analytics" },
  { id:"cloudwatch", name:"CloudWatch",      cat:"monitor",   emoji:"\u{1F441}\uFE0F", desc:"모니터링 · Metrics/Logs/Alarms/Dashboards" },
  { id:"cloudtrail", name:"CloudTrail",      cat:"monitor",   emoji:"\u{1F4DD}", desc:"API 감사 로그 · 누가 뭘 언제 · S3 저장" },
  // Compute additions
  { id:"batch",          name:"AWS Batch",          cat:"compute",   emoji:"\u{1F4E6}", desc:"완전관리형 배치 컴퓨팅 · 동적 프로비저닝 · Job Queue/Definition" },
  // Storage additions
  { id:"fsx",            name:"Amazon FSx",          cat:"storage",   emoji:"\u{1F5C3}\uFE0F", desc:"관리형 파일시스템 · Windows(SMB) · Lustre(HPC) · NetApp ONTAP" },
  { id:"storagegateway", name:"Storage Gateway",     cat:"storage",   emoji:"\u{1F4F1}", desc:"온프레미스↔AWS 하이브리드 스토리지 · File/Volume/Tape Gateway" },
  { id:"datasync",       name:"AWS DataSync",        cat:"storage",   emoji:"\u{1F504}", desc:"자동화 온라인 데이터 이전 · NFS/SMB→S3/EFS/FSx · 암호화·검증" },
  { id:"snow",           name:"AWS Snow Family",     cat:"storage",   emoji:"\u2744\uFE0F", desc:"오프라인 대용량 데이터 이전 · Snowcone/Snowball/Snowmobile" },
  // Network additions
  { id:"natgw",          name:"NAT Gateway",         cat:"network",   emoji:"\u{1F6AA}", desc:"Private 서브넷 아웃바운드 전용 · 관리형 · AZ별 배포 · Elastic IP" },
  { id:"vpcendpoint",    name:"VPC Endpoints",       cat:"network",   emoji:"\u{1F517}", desc:"Gateway(S3/DynamoDB 무료) · Interface(PrivateLink) · 인터넷 없이 AWS 접근" },
  { id:"transitgw",      name:"Transit Gateway",     cat:"network",   emoji:"\u{1F6E3}\uFE0F", desc:"VPC/VPN/DX 허브 · 멀티계정·리전 · 전이적 라우팅 지원" },
  { id:"globalaccel",    name:"Global Accelerator",  cat:"network",   emoji:"\u{1F680}", desc:"Anycast IP · AWS 글로벌 네트워크 경유 · 자동 헬스체크 장애조치" },
  { id:"sitevpn",        name:"Site-to-Site VPN",    cat:"network",   emoji:"\u{1F512}", desc:"IPsec VPN · VGW/TGW 연결 · 빠른 설정 · 인터넷 경유" },
  { id:"vpcpeering",     name:"VPC Peering",         cat:"network",   emoji:"\u{1F91D}", desc:"VPC 간 프라이빗 직접 연결 · 전이적 라우팅 불가 · 크로스 리전 가능" },
  // Security additions
  { id:"scp",            name:"SCP",                 cat:"security",  emoji:"\u{1F6AB}", desc:"Organizations 최상위 권한 경계 · 허용/거부 목록 · 멤버 계정 전체 적용" },
  { id:"networkfirewall",name:"Network Firewall",    cat:"security",  emoji:"\u{1F9F1}", desc:"VPC 상태 기반 방화벽 · IPS · 인바운드/아웃바운드 트래픽 보호" },
  { id:"guardduty",      name:"GuardDuty",           cat:"security",  emoji:"\u{1F50E}", desc:"ML 기반 위협 탐지 · CloudTrail/VPC Flow Logs/DNS 분석 · 30일 무료" },
  { id:"inspector",      name:"Amazon Inspector",    cat:"security",  emoji:"\u{1F9EA}", desc:"EC2/Lambda/ECR 취약점 자동 지속 스캔 · CVE · 리스크 점수" },
  { id:"macie",          name:"Amazon Macie",        cat:"security",  emoji:"\u{1F575}\uFE0F", desc:"S3 내 PII 등 민감 데이터 자동 탐지·분류 · ML 기반" },
  { id:"acm",            name:"AWS Certificate Mgr", cat:"security",  emoji:"\u{1F4DC}", desc:"SSL/TLS 인증서 무료 발급·자동갱신 · ELB/CloudFront/API GW 통합" },
  { id:"s3objectlock",   name:"S3 Object Lock",      cat:"security",  emoji:"\u{1F510}", desc:"WORM 보호 · Governance/Compliance 모드 · 법적 데이터 보존" },
  // Messaging additions
  { id:"stepfunctions",  name:"Step Functions",      cat:"messaging", emoji:"\u{1F9E9}", desc:"서버리스 워크플로 오케스트레이션 · State Machine · Express/Standard" },
  { id:"dynamostreams",  name:"DynamoDB Streams",    cat:"messaging", emoji:"\u{1F30A}", desc:"항목 변경 이벤트 순서 보장 스트림 · Lambda 트리거 · 24시간 보관" },
  // Migration (new)
  { id:"dms",            name:"AWS DMS",             cat:"migration", emoji:"\u{1F69A}", desc:"이기종/동기종 DB 마이그레이션 · 운영 중 지속 복제 · CDC 지원" },
  { id:"transferfamily", name:"Transfer Family",     cat:"migration", emoji:"\u{1F4E4}", desc:"SFTP/FTPS/FTP/AS2 완전관리형 · S3·EFS 연결 · 기존 클라이언트 호환" },
  { id:"appflow",        name:"Amazon AppFlow",      cat:"migration", emoji:"\u{1F500}", desc:"SaaS↔AWS 양방향 데이터 통합 · Salesforce/Slack/SAP → S3/Redshift" },
  // Ops (new)
  { id:"cloudformation", name:"CloudFormation",      cat:"ops",       emoji:"\u{1F4CB}", desc:"IaC · JSON/YAML 템플릿 · 스택/스택셋 · 드리프트 감지" },
  { id:"awsconfig",      name:"AWS Config",          cat:"ops",       emoji:"\u{1F4CA}", desc:"리소스 설정 변경 기록 · 규정 준수 평가 · Config Rules · 자동 교정" },
  { id:"controltower",   name:"Control Tower",       cat:"ops",       emoji:"\u{1F3D7}\uFE0F", desc:"멀티 계정 Landing Zone · 가드레일(SCP+Config Rules) · Account Factory" },
  { id:"trustedadvisor", name:"Trusted Advisor",     cat:"ops",       emoji:"\u{1F4A1}", desc:"비용/성능/보안/내결함성/서비스한도 점검 · 모범 사례 권고" },
  { id:"organizations",  name:"AWS Organizations",   cat:"ops",       emoji:"\u{1F3E2}", desc:"멀티 계정 중앙 관리 · OU · SCP · 통합 결제" },
  { id:"backup",         name:"AWS Backup",          cat:"ops",       emoji:"\u{1F4BE}", desc:"중앙 집중 백업 · EC2/EBS/RDS/DynamoDB 등 · 백업 볼트·정책" },
  { id:"iamidentitycenter", name:"IAM Identity Center", cat:"ops",   emoji:"\u{1F194}", desc:"싱글 사인온(SSO) · 다중 계정·앱 통합 접근 · SAML 2.0/SCIM" },
  // Analytics (new)
  { id:"emr",            name:"Amazon EMR",          cat:"analytics", emoji:"\u{1F4A5}", desc:"관리형 Hadoop/Spark/Hive · 빅데이터 처리 · S3 데이터 레이크 연동" },
  { id:"glue",           name:"AWS Glue",            cat:"analytics", emoji:"\u{1F9F5}", desc:"서버리스 ETL · 데이터 카탈로그 · Glue DataBrew(노코드 변환)" },
  { id:"lakeformation",  name:"Lake Formation",      cat:"analytics", emoji:"\u{1F3DE}\uFE0F", desc:"데이터 레이크 구축·보안 · 열/행 수준 세밀한 접근 제어 · S3 기반" },
  { id:"quicksight",     name:"Amazon QuickSight",   cat:"analytics", emoji:"\u{1F4C8}", desc:"서버리스 BI · ML Insights · 대화형 대시보드 · 임베디드 분석" },
  { id:"sagemaker",      name:"Amazon SageMaker",    cat:"analytics", emoji:"\u{1F916}", desc:"완전관리형 ML 플랫폼 · 빌드/학습/배포 · SageMaker Studio · Autopilot" },
];

export const LINKS: Link[] = [
  {s:"ec2",t:"ebs"},{s:"ec2",t:"asg"},{s:"ec2",t:"elb"},{s:"ec2",t:"vpc"},{s:"ec2",t:"iam"},{s:"ec2",t:"cloudwatch"},
  {s:"lambda",t:"apigw"},{s:"lambda",t:"sqs"},{s:"lambda",t:"sns"},{s:"lambda",t:"dynamodb"},{s:"lambda",t:"s3"},{s:"lambda",t:"iam"},{s:"lambda",t:"eventbridge"},
  {s:"s3",t:"cloudfront"},{s:"s3",t:"glacier"},{s:"s3",t:"kms"},{s:"s3",t:"cloudtrail"},{s:"s3",t:"redshift"},
  {s:"rds",t:"aurora"},{s:"rds",t:"elasticache"},{s:"rds",t:"kms"},{s:"rds",t:"secrets"},{s:"rds",t:"vpc"},
  {s:"aurora",t:"elasticache"},{s:"dynamodb",t:"lambda"},
  {s:"vpc",t:"directconn"},{s:"vpc",t:"route53"},
  {s:"elb",t:"asg"},{s:"elb",t:"waf"},{s:"cloudfront",t:"waf"},{s:"cloudfront",t:"route53"},
  {s:"apigw",t:"lambda"},{s:"apigw",t:"cognito"},
  {s:"sns",t:"sqs"},{s:"sns",t:"lambda"},{s:"kinesis",t:"lambda"},{s:"kinesis",t:"redshift"},{s:"kinesis",t:"s3"},
  {s:"eventbridge",t:"lambda"},{s:"eventbridge",t:"sqs"},
  {s:"iam",t:"kms"},{s:"cognito",t:"iam"},{s:"waf",t:"cloudfront"},
  {s:"cloudwatch",t:"asg"},{s:"cloudwatch",t:"lambda"},{s:"cloudtrail",t:"s3"},
];

export const CAT: Record<string, {color: string; glow: string; label: string}> = {
  compute:  {color:"#e67e22",glow:"#f39c12",label:"Compute"},
  storage:  {color:"#2980b9",glow:"#74b9ff",label:"Storage"},
  database: {color:"#8e44ad",glow:"#a29bfe",label:"Database"},
  network:  {color:"#27ae60",glow:"#55efc4",label:"Network"},
  security: {color:"#c0392b",glow:"#ff6b6b",label:"Security"},
  messaging:{color:"#16a085",glow:"#1abc9c",label:"Messaging"},
  monitor:   {color:"#7f8c8d",glow:"#bdc3c7",label:"Monitor"},
  migration: {color:"#00897b",glow:"#4db6ac",label:"Migration"},
  ops:       {color:"#6d4c41",glow:"#a1887f",label:"Ops"},
  analytics: {color:"#e65100",glow:"#ff8f00",label:"Analytics"},
};

export const CONCEPTS_KO: Record<string, Concept> = {
  ec2: {
    title:"Amazon EC2", subtitle:"Elastic Compute Cloud",
    easy:"EC2는 인터넷에 있는 내 컴퓨터야! 필요할 때만 빌려 쓰고 돈을 내는 구조야. 항상 쓸 거면 미리 예약하면 최대 72% 싸게 쓸 수 있어.",
    points:[
      {label:"인스턴스 구매 옵션", text:"On-Demand(유연), Reserved(1~3년 약정 최대 72% 절감), Spot(최대 90% 절감, 언제든 종료 가능), Dedicated Host(물리 서버 전용)", easy:"On-Demand는 당일 빌리기(비쌈), Reserved는 1년 장기 계약(싸짐), Spot은 빈 차 초특가인데 언제든 뺏길 수 있어."},
      {label:"AMI", text:"Amazon Machine Image. 인스턴스 OS·소프트웨어 템플릿. 커스텀 AMI로 빠른 배포 가능. 리전간 복사 가능", easy:"쿠키 틀이야! 틀(AMI) 하나 만들어두면 같은 모양 쿠키(서버)를 몇 개든 빠르게 찍어낼 수 있어."},
      {label:"Placement Group", text:"Cluster(같은 AZ, 낮은 레이턴시), Spread(다른 하드웨어, 장애 격리), Partition(대규모 분산 시스템)", easy:"교실 자리 배치야! Cluster는 팀원 붙어 앉기(빠른 소통), Spread는 일부러 멀리 앉기(한 명 결석해도 다른 팀 영향 없음)."},
      {label:"스토리지", text:"EBS(영구 블록), Instance Store(임시·빠름), EFS(공유 파일시스템)", easy:"EBS는 개인 사물함(꺼도 유지), Instance Store는 책상 위 메모지(꺼지면 사라짐), EFS는 공용 캐비닛(여러 명이 함께 씀)."},
      {label:"시험 포인트", text:"Spot Instance 중단 시 2분 알림. Reserved는 AZ or Region 스코프. Hibernate로 RAM 유지 중지 가능", easy:"Spot은 노래방 빈 방 — 다른 손님이 예약하면 2분 안에 나가야 해! Hibernate는 노트북 절전모드 — 껐다 켜도 작업이 그대로야."},
    ]
  },
  lambda: {
    title:"AWS Lambda", subtitle:"서버리스 함수 실행",
    easy:"Lambda는 심부름꾼이야! 파일 올렸을 때만 달려와서 일을 처리하고 사라져. 항상 켜놓을 필요가 없어서 비용이 거의 안 들어!",
    points:[
      {label:"실행 제한", text:"최대 실행시간 15분, 메모리 128MB~10GB, /tmp 저장소 512MB~10GB, 동시 실행 기본 1000개", easy:"Lambda는 단거리 달리기 선수야. 15분 안에 끝내야 해. 오래 걸리면 ECS 사용."},
      {label:"트리거", text:"API Gateway, S3, DynamoDB Streams, SQS, SNS, EventBridge, ALB, Cognito 등", easy:"알람이야! '파일 올라왔다', '메시지 왔다' 같은 신호가 오면 자동으로 깨어나서 일해."},
      {label:"Concurrency", text:"Reserved Concurrency(최대 동시 실행 제한), Provisioned Concurrency(콜드스타트 방지·미리 워밍)", easy:"Reserved는 '심부름꾼 최대 10명까지만' 상한선 설정, Provisioned는 미리 대기시켜두기."},
      {label:"배포", text:"Zip 파일 or Container Image(최대 10GB). Lambda Layer로 공통 라이브러리 공유", easy:"Zip은 도시락 싸서 보내기, Container Image는 식당 통째로 배달. Layer는 공용 도구 창고."},
      {label:"시험 포인트", text:"VPC 내 배포 시 ENI 생성 → 콜드스타트 증가. 15분 초과 작업은 ECS/Fargate 사용. SQS는 배치 처리 가능", easy:"Lambda를 VPC 안에 넣으면 콜드스타트가 길어져. 15분 넘는 일은 ECS에 맡겨!"},
    ]
  },
  s3: {
    title:"Amazon S3", subtitle:"Simple Storage Service",
    easy:"S3는 인터넷 거대 창고야! 용량이 무한대고 자주 꺼내는 건 Standard, 가끔 꺼내는 건 Glacier에 넣으면 싸.",
    points:[
      {label:"스토리지 클래스", text:"Standard → Standard-IA → One Zone-IA → Glacier Instant → Glacier Flexible → Deep Archive", easy:"자주 쓰는 건 거실(Standard), 가끔 쓰는 건 창고(IA), 거의 안 쓰는 건 냉동창고(Glacier)."},
      {label:"보안", text:"Bucket Policy(리소스 기반), IAM Policy(사용자 기반), ACL(레거시), Presigned URL(임시 접근), OAC", easy:"Bucket Policy는 창고 문 규칙, IAM은 직원 출입증, Presigned URL은 임시 방문증."},
      {label:"기능", text:"Versioning, MFA Delete, Replication(CRR/SRR), Lifecycle(자동 전환·삭제)", easy:"구글 문서 버전 기록이랑 같아! 수정할 때마다 이전 버전이 남아서 실수로 지워도 복구 가능."},
      {label:"성능", text:"접두사당 초당 3,500 PUT / 5,500 GET. 멀티파트 업로드(100MB 이상 권장, 5GB 이상 필수)", easy:"큰 짐을 여러 조각으로 나눠서 동시에 보내는 거야(멀티파트). 여러 상자로 나눠 보내면 더 빨라!"},
      {label:"시험 포인트", text:"S3 버킷은 글로벌이지만 데이터는 리전에 저장. CORS 설정. 정적 웹사이트 호스팅 가능", easy:"S3 버킷 이름은 전 세계에서 하나뿐이어야 해. 데이터는 내가 선택한 리전에 저장돼."},
    ]
  },
  rds: {
    title:"Amazon RDS", subtitle:"Relational Database Service",
    easy:"RDS는 엑셀처럼 정리된 DB 창고야. AWS가 관리해줘서 백업도 자동이야.",
    points:[
      {label:"Multi-AZ", text:"동기 복제(Standby). 장애 시 자동 페일오버 60~120초. 읽기 불가(대기용). DNS 레코드 전환", easy:"응급 대기 병원이야! 주 병원이 닫히면 1~2분 안에 백업 병원이 자동으로 열려."},
      {label:"Read Replica", text:"비동기 복제. 읽기 분산용. 다른 리전 가능. 독립 DB로 승격 가능. 최대 5개", easy:"교과서 복사본이야! 원본이 바쁠 때 복사본을 여러 명이 나눠 읽을 수 있어."},
      {label:"백업", text:"자동 백업(1~35일), 수동 스냅샷(무기한 보관)", easy:"자동 백업은 매일 자동으로 찍히는 사진, 스냅샷은 직접 찍어서 영원히 보관."},
      {label:"암호화", text:"생성 시 KMS 암호화 설정. 이후 변경 불가(스냅샷 → 복사 → 암호화 복원 필요)", easy:"금고 만들 때만 자물쇠 선택 가능. 나중에 바꾸려면 내용물 꺼내서 새 금고에 넣어야 해."},
      {label:"시험 포인트", text:"Multi-AZ ≠ 읽기 분산(그건 Read Replica). RDS Proxy로 Lambda 연결 풀링. 스토리지 자동 확장", easy:"Multi-AZ는 '안전'(백업), Read Replica는 '속도'(분산). 시험에 무조건 나와!"},
    ]
  },
  aurora: {
    title:"Amazon Aurora", subtitle:"AWS 최적화 관계형 DB",
    easy:"Aurora는 RDS의 슈퍼 버전! 3개 AZ에 6개 복사본으로 저장해. MySQL보다 5배 빠른데 가격은 비슷해!",
    points:[
      {label:"아키텍처", text:"스토리지 자동 10GB~128TB. 3개 AZ에 6개 복본. 2개 실패해도 쓰기, 3개 실패해도 읽기 가능", easy:"같은 책을 3개 도서관에 6권씩 나눠 놓는 거야. 도서관 2개가 불타도 책은 안전해."},
      {label:"성능", text:"MySQL 대비 5배, PostgreSQL 대비 3배 빠름. Aurora Parallel Query", easy:"일반 RDS가 자전거라면 Aurora는 스포츠카야. MySQL 코드 그대로 5배 빠른 성능!"},
      {label:"기능", text:"Aurora Serverless v2: 자동 스케일링. Global Database: 리전간 1초 미만 복제", easy:"Serverless v2는 손님 수에 따라 테이블 자동 조절. Global DB는 한국→미국 1초 안에 반영."},
      {label:"Aurora vs RDS", text:"Aurora: 고성능·고가용성 필요 시. RDS: Oracle, SQL Server 등 특정 엔진 필요 시", easy:"Aurora는 AWS 특별 고성능 엔진, RDS는 특정 회사 DB를 쓰고 싶을 때."},
      {label:"시험 포인트", text:"Aurora Replica는 동일 스토리지 공유(복제 지연 없음). Backtrack으로 시점 되돌리기", easy:"Aurora Replica는 같은 창고를 공유해서 복사 시간이 0에 가까워."},
    ]
  },
  vpc: {
    title:"Amazon VPC", subtitle:"Virtual Private Cloud",
    easy:"VPC는 AWS 안에 울타리 쳐진 내 동네야! Public은 인터넷 접근 가능, Private은 내부만.",
    points:[
      {label:"구성 요소", text:"Subnet(Public/Private), Route Table, IGW, NAT Gateway, VPC Peering", easy:"공개 구역(Public)은 외부인 출입 가능, 비공개 구역(Private)은 주민만. NAT는 쪽문."},
      {label:"보안", text:"Security Group: Stateful, 허용만. NACL: Stateless, 허용+거부, 서브넷 레벨", easy:"SG는 집 현관문(자동 허용), NACL은 동네 경비원(둘 다 확인). SG는 허용만, NACL은 거부도."},
      {label:"연결", text:"VPN, Direct Connect(전용선), Transit Gateway(여러 VPC 허브 연결)", easy:"VPN은 일반 도로, Direct Connect는 전용 고속도로, Transit Gateway는 허브 교차로."},
      {label:"엔드포인트", text:"Gateway Endpoint: S3, DynamoDB(무료). Interface Endpoint: 나머지(ENI, 비용 발생)", easy:"VPC 안에서 S3 접근 시 Gateway Endpoint는 무료 출장소 설치!"},
      {label:"시험 포인트", text:"SG는 Stateful, NACL은 Stateless. NAT Gateway는 Public Subnet에 위치", easy:"SG는 스마트(자동 허용), NACL은 깐깐(둘 다 설정). NAT는 공개구역에 설치해야 해!"},
    ]
  },
  iam: {
    title:"AWS IAM", subtitle:"Identity and Access Management",
    easy:"IAM은 회사 출입증 관리 시스템이야! 직원마다 출입증을 주고, 팀별로 권한을 묶어줘.",
    points:[
      {label:"구성 요소", text:"User(개인), Group(집합), Role(임시 권한 위임), Policy(JSON 권한 문서)", easy:"User는 직원, Group은 팀, Role은 임시 출입증, Policy는 규칙서."},
      {label:"Policy 종류", text:"Identity-based, Resource-based, Permission Boundary, SCP(Organizations)", easy:"Identity-based는 직원 출입증 권한, Resource-based는 방 문 안내판, SCP는 회사 최상위 규정."},
      {label:"STS", text:"AssumeRole로 임시 자격증명. 크로스 계정 접근, EC2 Instance Profile, Web Identity Federation", easy:"STS는 임시 입장권 발급소! 다른 계정이나 외부 사람에게 시간제한 임시 출입증 발급."},
      {label:"Best Practice", text:"루트 계정 미사용, MFA, 최소 권한 원칙, Access Key 교체, CloudTrail 감사", easy:"루트 계정은 대표이사 도장 — 일상적으로 쓰면 안 돼. 최소 권한만 주는 게 최고!"},
      {label:"시험 포인트", text:"Policy 평가: 명시적 Deny > SCP > Permission Boundary > Identity > Resource Policy", easy:"명시적 거부(Deny)가 있으면 무조건 차단! 다른 허용이 있어도 Deny 하나면 끝."},
    ]
  },
  sqs: {
    title:"Amazon SQS", subtitle:"Simple Queue Service",
    easy:"SQS는 우체통이야! 편지를 넣어두면 배달부가 나중에 꺼내서 처리해. 바빠도 편지는 안전하게 보관돼!",
    points:[
      {label:"타입", text:"Standard: 최소 1회(중복 가능), 순서 미보장, 높은 처리량. FIFO: 정확히 1회, 순서 보장, 300~3000 TPS", easy:"Standard는 일반 우편(빠르지만 중복 가능), FIFO는 등기우편(느리지만 정확히 한 번)."},
      {label:"주요 설정", text:"Visibility Timeout(기본 30초), Message Retention(1분~14일), Max Size: 256KB", easy:"Visibility Timeout은 배달부가 꺼낸 후 다른 배달부가 못 보게 숨기는 시간."},
      {label:"DLQ", text:"Dead Letter Queue. 처리 실패 메시지 격리. maxReceiveCount 초과 시 이동", easy:"배달 실패한 편지 모아두는 특별 우체통. 왜 실패했는지 나중에 확인 가능."},
      {label:"Long Polling", text:"빈 큐 폴링 줄여 비용 절감. WaitTimeSeconds 1~20초. Short Polling보다 권장", easy:"Short Polling은 1초마다 확인, Long Polling은 '편지 올 때까지 최대 20초 기다려'."},
      {label:"시험 포인트", text:"SQS → Lambda 배치 처리. Fan-out: SNS → 여러 SQS. FIFO는 .fifo 접미사 필수", easy:"Fan-out은 SNS가 방송하면 여러 SQS가 동시에 받는 구조."},
    ]
  },
  cloudwatch: {
    title:"Amazon CloudWatch", subtitle:"모니터링 & 관찰 서비스",
    easy:"CloudWatch는 AWS의 CCTV + 알람이야! 서버 상태를 지켜보다가 이상하면 알려줘!",
    points:[
      {label:"Metrics", text:"기본 5분(무료), 세부 1분(유료). 커스텀 메트릭 가능", easy:"기본 CCTV는 5분마다 사진(무료), 고화질은 1분마다(유료)."},
      {label:"Logs", text:"Log Group → Log Stream. Log Insights로 쿼리. Metric Filter로 로그→메트릭 변환", easy:"Log Group은 일기장, Log Stream은 날짜별 페이지. Insights로 검색처럼 찾을 수 있어."},
      {label:"Alarms", text:"OK/ALARM/INSUFFICIENT_DATA. 액션: SNS, EC2 중지/종료, ASG 스케일링", easy:"CPU 90% 넘으면 문자 알림! 심각하면 자동으로 서버 늘리기(ASG)."},
      {label:"Events/EventBridge", text:"AWS 이벤트 감지 → 자동화. Cron/Rate 스케줄 실행", easy:"'매일 밤 12시에 백업 실행' 같은 자동화 규칙 설정."},
      {label:"시험 포인트", text:"EC2 메모리/디스크는 기본 메트릭 없음 → CloudWatch Agent 필요. 크로스 계정 수집 가능", easy:"EC2 메모리 모니터링은 Agent 설치해야 해! 시험에 자주 나와."},
    ]
  },
  elb: {
    title:"Elastic Load Balancer", subtitle:"트래픽 분산 서비스",
    easy:"ELB는 놀이공원 안내원이야! 사람이 몰리면 골고루 나눠줘!",
    points:[
      {label:"ALB (L7)", text:"HTTP/HTTPS. 경로/헤더/쿼리 라우팅. Lambda·컨테이너 대상. WebSocket. WAF 통합", easy:"URL 보고 안내하는 스마트 안내원. '/api'는 API 서버로, '/images'는 이미지 서버로."},
      {label:"NLB (L4)", text:"TCP/UDP/TLS. 초고성능(수백만 RPS). Static IP. 극단적 저지연", easy:"내용 안 보고 빠르게 전달하는 배달부. 고정 IP를 줄 수 있어. 게임 서버용."},
      {label:"GWLB (L3)", text:"IP 패킷. 방화벽/IDS/IPS 앞에 배치. GENEVE 프로토콜", easy:"모든 트래픽을 보안 검사대 통과시키는 특수 안내원."},
      {label:"공통 기능", text:"Cross-Zone, Sticky Session, Connection Draining, Health Check", easy:"Cross-Zone은 여러 건물 직원한테 골고루 분배. Sticky Session은 같은 직원 배정."},
      {label:"시험 포인트", text:"ALB는 고정 IP 없음(DNS). NLB는 고정 IP. SSL/TLS 종료 가능", easy:"'고정 IP 필요' → NLB! ALB는 DNS 이름으로만 접근."},
    ]
  },
  dynamodb: {
    title:"Amazon DynamoDB", subtitle:"서버리스 NoSQL DB",
    easy:"DynamoDB는 서랍장이야! 뭐든 넣을 수 있고 1초에 수백만 번 꺼내고 넣을 수 있어!",
    points:[
      {label:"용량 모드", text:"On-Demand: 자동 대응. Provisioned: RCU/WCU 직접 설정, 더 저렴, Auto Scaling", easy:"On-Demand는 알아서 처리(비쌈), Provisioned는 미리 준비(저렴하지만 넘치면 오류)."},
      {label:"인덱스", text:"GSI: 다른 파티션+정렬 키, 별도 용량. LSI: 같은 파티션 키, 다른 정렬 키", easy:"GSI는 완전히 새 주소록, LSI는 같은 주소록에 다른 정렬 기준 추가."},
      {label:"DAX", text:"인메모리 캐시. 마이크로초 응답. API 호환. 읽기 10배 향상", easy:"서랍 앞 메모지! 자주 꺼내는 건 메모지에서 바로 꺼내면 10배 빨라."},
      {label:"고급 기능", text:"DynamoDB Streams → Lambda. Global Tables: 멀티 리전 액티브-액티브. TTL: 자동 삭제", easy:"Global Tables는 한국→미국 자동 복사. TTL은 유통기한 설정."},
      {label:"시험 포인트", text:"파티션 키 설계 핵심(균등 분산). RCU=4KB/초, WCU=1KB/초. Transactions ACID 지원", easy:"파티션 키가 한쪽으로 치우치면 Hot Partition 발생. 다양한 값을 파티션 키로!"},
    ]
  },
  kms: {
    title:"AWS KMS", subtitle:"Key Management Service",
    easy:"KMS는 금고 열쇠 관리소야! 암호화 열쇠를 만들고 보관해줘. 누가 썼는지 기록도 남아!",
    points:[
      {label:"키 종류", text:"AWS Managed Key(무료), Customer Managed Key($1/월), CloudHSM(전용 하드웨어)", easy:"AWS 관리 마스터키(무료), 직접 만든 열쇠(월 $1), CloudHSM은 금고 하드웨어 통째로 빌리기."},
      {label:"Envelope Encryption", text:"DEK로 데이터 암호화 → DEK를 CMK로 암호화. 대용량 데이터 표준 방식", easy:"봉투 안에 봉투! 데이터는 임시 열쇠로 잠그고, 그 열쇠를 다시 마스터키로 잠가."},
      {label:"통합 서비스", text:"S3(SSE-KMS), EBS, RDS, Secrets Manager, SSM Parameter Store", easy:"거의 모든 AWS 서비스와 연결돼 있어. KMS 키 선택하면 자동 암호화."},
      {label:"키 정책", text:"KMS는 리소스 기반 정책 필수. IAM Policy만으론 접근 불가. Cross-account 시 키 정책 명시 필요", easy:"KMS 열쇠는 특별 — IAM 권한만으로 쓸 수 없어. 열쇠 정책에 직접 써줘야 해."},
      {label:"시험 포인트", text:"암호화된 EBS 스냅샷 공유 시 CMK도 공유. 키 삭제 최소 7일 대기", easy:"암호화 스냅샷 공유할 때 열쇠도 같이 줘야 해! 키 삭제는 7일 유예기간."},
    ]
  },
  cloudfront: {
    title:"Amazon CloudFront", subtitle:"글로벌 CDN",
    easy:"CloudFront는 전 세계에 미리 물건을 갖다 놓는 배달 시스템이야! 가까운 창고에서 가져와서 빠르게!",
    points:[
      {label:"오리진", text:"S3, ALB, EC2, HTTP 서버. OAC로 S3를 CloudFront 전용 제한", easy:"원본 창고에서 전 세계 엣지 창고에 복사해둬. OAC는 CloudFront 전용 자물쇠."},
      {label:"캐싱", text:"TTL(기본 24시간). Cache Policy. Invalidation으로 즉시 무효화", easy:"한 번 로드하면 캐시에 저장. TTL 동안 저장해두다가 시간 지나면 새로 가져와."},
      {label:"보안", text:"HTTPS 강제. WAF 통합. Geo Restriction. Field Level Encryption", easy:"WAF로 해킹 방어. Geo Restriction으로 특정 나라 접근 차단."},
      {label:"엣지 컴퓨팅", text:"Lambda@Edge: CloudFront 이벤트에서 Lambda 실행. CloudFront Functions: 경량 JS", easy:"엣지에서 직접 코드 실행! 언어 자동 번역, 로그인 확인 등을 서버까지 안 가고 처리."},
      {label:"시험 포인트", text:"글로벌 서비스(us-east-1에서만 인증서). 동적 콘텐츠도 가속. Signed URL/Cookie로 유료 콘텐츠 보호", easy:"CloudFront용 SSL 인증서는 꼭 us-east-1에서! Signed URL은 유료 콘텐츠 보호."},
    ]
  },
  route53: {
    title:"Amazon Route 53", subtitle:"DNS 및 트래픽 라우팅",
    easy:"Route53은 인터넷 전화번호부! www.naver.com을 실제 IP 주소로 바꿔줘.",
    points:[
      {label:"라우팅 정책", text:"Simple, Weighted, Latency, Failover, Geolocation, Geoproximity, Multi-Value", easy:"Weighted는 A/B 테스트, Latency는 제일 빠른 서버, Failover는 백업 서버."},
      {label:"헬스체크", text:"엔드포인트 모니터링. 15개 글로벌 헬스체커. Failover 필수 조합", easy:"30초마다 서버에 '살아있어?' 확인. 응답 없으면 다른 서버로 돌려줘."},
      {label:"레코드 타입", text:"A(IPv4), AAAA(IPv6), CNAME(도메인→도메인), Alias(AWS 리소스, Zone Apex 가능, 무료)", easy:"A는 이름→주소, CNAME은 이름→다른 이름, Alias는 AWS 전용이고 무료."},
      {label:"도메인", text:"도메인 구매 가능. Public vs Private Hosted Zone. DNSSEC 지원", easy:"Route53에서 도메인도 살 수 있어. Private은 VPC 안에서만 쓰는 내부 전화번호부."},
      {label:"시험 포인트", text:"Alias는 ELB, CloudFront, S3에 사용. CNAME은 Zone Apex 불가. Alias 무조건 선택!", easy:"루트 도메인에는 CNAME 못 써, Alias만! AWS 서비스 연결은 무조건 Alias!"},
    ]
  },
  sns: {
    title:"Amazon SNS", subtitle:"Simple Notification Service",
    easy:"SNS는 방송 시스템이야! 마이크에 외치면 구독자 모두가 동시에 들어!",
    points:[
      {label:"개요", text:"Pub/Sub. Publisher → Topic → Subscribers (SQS, Lambda, Email, SMS, HTTP)", easy:"라디오 방송! 방송국이 외치면 라디오들이 동시에 수신해."},
      {label:"Fan-out 패턴", text:"SNS Topic → 여러 SQS Queue. 병렬 처리. 느슨한 결합", easy:"주문 완료 하나로 재고 차감, 영수증 발송, 포인트 적립 동시 처리!"},
      {label:"FIFO Topic", text:"SQS FIFO와 조합. 순서 보장 + 중복 제거. 금융·재고 시스템", easy:"은행 순번표! 순서대로 처리하고 같은 번호 두 번 발급 안 해."},
      {label:"메시지 필터링", text:"Subscription Filter Policy. JSON 속성 기반. 비용 절감·효율화", easy:"'빨간 봉투만 받을게' 처럼 원하는 조건의 메시지만 골라 받기."},
      {label:"시험 포인트", text:"SNS는 푸시(SQS는 폴링). 메시지 영속성 없음. DLQ는 SQS에 설정", easy:"SNS는 방송이라 저장 안 해. 저장 필요하면 SQS에 받아둬야 해."},
    ]
  },
  kinesis: {
    title:"Amazon Kinesis", subtitle:"실시간 데이터 스트리밍",
    easy:"Kinesis는 강물 같은 데이터 파이프! 계속 흘러나오는 데이터를 받아서 처리해줘.",
    points:[
      {label:"Data Streams", text:"실시간. 샤드 단위(1MB입력/2MB출력). 보관 24시간~365일. 직접 소비자 관리", easy:"파이프! 샤드가 많을수록 더 많은 데이터 흘릴 수 있어."},
      {label:"Firehose", text:"완전 관리형. S3/Redshift/OpenSearch에 자동 전달. 버퍼링. Near Real-time", easy:"자동으로 탱크에 채워주는 시스템. 관리 안 해도 돼."},
      {label:"Data Analytics", text:"SQL로 실시간 분석. 이상 감지·집계", easy:"흘러가는 데이터를 보면서 실시간 SQL 분석."},
      {label:"vs SQS", text:"Kinesis: 대용량 스트리밍, 다중 소비자, 순서 보장. SQS: 메시지 큐, 단일 소비자, 처리 후 삭제", easy:"Kinesis는 여러 명이 같은 강물을 볼 수 있어. SQS는 한 사람이 꺼내면 사라져."},
      {label:"시험 포인트", text:"샤드 수 = 처리량. Hot Partition 방지. Firehose는 Lambda로 변환 가능", easy:"특정 샤드에 데이터 몰리면 병목! 파티션 키 분산이 중요해."},
    ]
  },
  elasticache: {
    title:"Amazon ElastiCache", subtitle:"인메모리 캐시",
    easy:"ElastiCache는 책상 위 메모지! 자주 보는 내용을 DB에서 매번 꺼내면 느리니까 메모리에 적어두면 빨라!",
    points:[
      {label:"Redis vs Memcached", text:"Redis: 영속성, 복제, Multi-AZ, 자료구조, Pub/Sub. Memcached: 단순, 멀티스레드, 샤딩", easy:"Redis는 전원 있는 고급 메모지(안 지워짐), Memcached는 일반 메모지(사라짐)."},
      {label:"캐싱 전략", text:"Lazy Loading(캐시 미스 시 저장), Write Through(쓰기 시 캐시 업데이트), TTL 만료", easy:"Lazy Loading은 '없으면 가져와서 메모', Write Through는 '쓸 때마다 메모도 업데이트'."},
      {label:"사용 사례", text:"DB 캐싱, 세션 저장소, 실시간 리더보드, Rate Limiting", easy:"게임 순위표, 쇼핑몰 장바구니, API 호출 제한 등에 사용."},
      {label:"Redis Cluster", text:"데이터 샤딩 수평 확장. 최대 500노드. Multi-AZ + 자동 페일오버", easy:"메모지가 많아지면 여러 책상에 나눠 적어. 더 많이, 더 빠르게!"},
      {label:"시험 포인트", text:"RDS 앞에 ElastiCache → 읽기 부하 감소. 세션 관리 → Redis. Memcached는 영속성 없음", easy:"RDS 느리다 → ElastiCache 캐싱! 세션 저장 → Redis!"},
    ]
  },
  ebs: {
    title:"Amazon EBS", subtitle:"Elastic Block Store",
    easy:"EBS는 EC2에 꽂는 USB 하드디스크! 컴퓨터 꺼도 USB는 사라지지 않아. 같은 AZ에서만 쓸 수 있어!",
    points:[
      {label:"볼륨 타입", text:"gp3(범용, 3000 IOPS), io2(프로비저닝 IOPS, DB용), st1(처리량 HDD), sc1(콜드 HDD, 최저가)", easy:"gp3는 일반 SSD, io2는 고급 SSD(DB용), st1은 대용량 HDD, sc1은 제일 싼 HDD."},
      {label:"특성", text:"단일 AZ. 1:1 연결(io1/io2는 Multi-Attach). 네트워크 드라이브. 독립 수명", easy:"네트워크로 연결된 USB. EC2 꺼도 살아있어. 같은 AZ에서만 연결 가능."},
      {label:"스냅샷", text:"증분 백업. S3 저장. 다른 AZ/리전 복사. Snapshot Archive(75% 저렴)", easy:"USB 사진 찍기! 처음엔 전체, 그다음엔 바뀐 부분만 찍어 저장."},
      {label:"암호화", text:"KMS 사용. 미암호화 → 스냅샷 → 암호화 복사 → 복원으로 변환", easy:"USB에 자물쇠! 처음 만들 때만 설정. 나중에 바꾸려면 3단계 필요."},
      {label:"시험 포인트", text:"루트 볼륨 기본 삭제(종료 시). gp3가 gp2보다 저렴+IOPS 독립. RAID 0 성능 향상", easy:"EC2 종료하면 루트 EBS 기본 삭제! 중요 데이터는 스냅샷 필수. gp3가 gp2보다 좋아."},
    ]
  },
  efs: {
    title:"Amazon EFS", subtitle:"Elastic File System",
    easy:"EFS는 여러 컴퓨터가 동시에 쓸 수 있는 공유 폴더! EBS가 혼자 쓰는 USB라면 EFS는 공용 파일서버!",
    points:[
      {label:"특성", text:"완전 관리형 NFS. 다중 EC2 마운트. Multi-AZ. 자동 확장/축소. Linux 전용", easy:"여러 EC2가 동시에 같은 폴더 열어서 파일 읽고 쓸 수 있어. Linux만!"},
      {label:"성능 모드", text:"General Purpose(기본, 저지연). Max I/O(높은 처리량, 빅데이터용)", easy:"General Purpose는 일반 도로(빠른 반응), Max I/O는 고속도로(많은 양)."},
      {label:"처리량 모드", text:"Bursting, Provisioned(고정), Elastic(자동 조절)", easy:"Bursting은 가끔 터뜨리기, Provisioned는 고정 속도, Elastic은 알아서 조절."},
      {label:"스토리지 클래스", text:"Standard, EFS-IA(비자주 접근), Archive. Lifecycle Policy 자동 이동", easy:"자주 쓰는 건 빠른 선반, 가끔 쓰는 건 창고. 자동으로 옮겨줘."},
      {label:"시험 포인트", text:"다중 EC2 공유 → EFS. Windows → FSx. EFS는 EBS보다 비싸지만 공유 가능", easy:"여러 EC2가 같은 파일 → EFS! Windows → FSx! EBS는 혼자, EFS는 함께!"},
    ]
  },
  cognito: {
    title:"Amazon Cognito", subtitle:"사용자 인증",
    easy:"Cognito는 앱의 회원가입/로그인 담당자! 구글/페이스북 로그인도 지원!",
    points:[
      {label:"User Pool", text:"회원 디렉토리. JWT 토큰 발급. 소셜 로그인. MFA. Lambda Trigger", easy:"회원 명단! 로그인 성공하면 출입증(JWT) 발급. 구글 계정 로그인도 가능!"},
      {label:"Identity Pool", text:"AWS 리소스 접근 임시 자격증명(STS). Unauthenticated 접근도 가능", easy:"AWS 서비스 쓸 수 있는 임시 열쇠 발급. S3 직접 업로드 가능."},
      {label:"플로우", text:"User Pool 인증 → JWT → Identity Pool → STS → S3/DynamoDB 접근", easy:"로그인 → 토큰 → AWS 임시열쇠 교환 → S3 직접 업로드. 중간서버 불필요!"},
      {label:"통합", text:"API Gateway: Cognito Authorizer. ALB: 인증 오프로드", easy:"API Gateway에서 토큰 진짜인지 Cognito가 확인해줘."},
      {label:"시험 포인트", text:"User Pool = 인증(AuthN), Identity Pool = 권한 부여(AuthZ). 모바일 앱 AWS 직접 접근 패턴", easy:"User Pool은 '너 누구?', Identity Pool은 '뭐 할 수 있어?'. 둘 합쳐야 모바일 앱에서 S3 접근!"},
    ]
  },
  ecs: {
    title:"Amazon ECS/EKS", subtitle:"컨테이너 오케스트레이션",
    easy:"ECS는 컨테이너 박스를 관리하는 반장! Fargate 쓰면 서버 관리를 AWS가 다 해줘!",
    points:[
      {label:"ECS vs EKS", text:"ECS: AWS 자체. EKS: 관리형 Kubernetes(오픈소스, 이식성 높음)", easy:"ECS는 AWS만의 방식, EKS는 쿠버네티스. 다른 클라우드 이사 가능하면 EKS."},
      {label:"런치 타입", text:"EC2: 직접 관리, 비용 절감. Fargate: 서버리스, 편리, 더 비쌈", easy:"EC2는 직접 관리(싸지만 일 많음), Fargate는 AWS가 관리(비싸지만 편함)."},
      {label:"Task & Service", text:"Task Definition: 컨테이너 설정. Service: Task 수 유지·ELB 연동·Auto Scaling", easy:"Task Definition은 레시피, Task는 요리 하나, Service는 '항상 3개 유지' 관리자."},
      {label:"스토리지", text:"EFS 마운트로 컨테이너 간 공유. S3는 앱 코드로 접근", easy:"컨테이너 껐다 켜면 파일 사라짐. 중요한 건 EFS에 저장!"},
      {label:"시험 포인트", text:"Fargate는 VPC/서브넷 필수. Task Role로 AWS 권한. ECS Anywhere로 온프레미스 실행", easy:"Fargate는 VPC 필수! AWS 권한은 Task Role에 — EC2 Instance Profile과 헷갈리지 마!"},
    ]
  },
  asg: {
    title:"Auto Scaling Group", subtitle:"자동 스케일링",
    easy:"ASG는 바쁠 때 직원 더 뽑고 한가할 때 줄이는 인사팀! 돈도 아껴줘!",
    points:[
      {label:"스케일링 정책", text:"Target Tracking(목표값 유지), Step(단계별), Scheduled(시간 기반), Predictive(ML 예측)", easy:"Target Tracking은 에어컨처럼 'CPU 50% 유지'. Scheduled는 시간표대로."},
      {label:"주요 설정", text:"Min/Max/Desired 인스턴스 수. Health Check(EC2/ELB). Cooldown(기본 300초)", easy:"'최소 2대, 최대 10대, 평소 3대'. Cooldown은 안정화 시간."},
      {label:"Launch Template", text:"AMI, 인스턴스 타입, SG, 키페어 등 설정", easy:"새 직원 채용 기준표. OS, 컴퓨터 사양, 보안 설정 미리 정해두기."},
      {label:"Lifecycle Hook", text:"인스턴스 시작/종료 시 커스텀 작업 실행", easy:"서버 켜질 때 '소프트웨어 설치 완료될 때까지 기다려' 설정."},
      {label:"시험 포인트", text:"ELB 연동 시 Health Check는 ELB 기준 권장. Spot 혼합으로 비용 절감", easy:"ELB 기준 Health Check가 정확해. Spot 섞으면 최대 90% 절감!"},
    ]
  },
  beanstalk: {
    title:"AWS Elastic Beanstalk", subtitle:"PaaS 플랫폼",
    easy:"Beanstalk은 코드만 갖다 주면 서버 세팅을 알아서 해주는 식당 주인!",
    points:[
      {label:"지원 환경", text:"Node.js, Python, Java, .NET, PHP, Ruby, Go, Docker", easy:"어떤 언어든 코드만 올리면 맞는 환경에서 실행!"},
      {label:"배포 방식", text:"All at once, Rolling, Rolling with batch, Immutable, Blue/Green", easy:"All at once는 동시 교체, Rolling은 순차, Blue/Green은 새로 만든 후 전환."},
      {label:"구성 요소", text:"Application → Environment(Web/Worker) → Application Version", easy:"Application은 회사, Environment는 개발팀/운영팀, Version은 배포 패키지."},
      {label:"설정", text:".ebextensions로 커스텀. CloudFormation 사용. RDS는 외부 권장", easy:".ebextensions로 세팅 커스텀. RDS는 따로 만들어야 안전해."},
      {label:"시험 포인트", text:"Beanstalk 자체 무료(리소스만 과금). Blue/Green 무중단 배포. Worker는 SQS 연동", easy:"Beanstalk 자체는 무료! Blue/Green으로 무중단 배포 가능!"},
    ]
  },
  glacier: {
    title:"S3 Glacier", subtitle:"장기 아카이빙",
    easy:"Glacier는 냉동창고! 자주 안 쓰는 서류를 싸게 보관. 꺼내는 데 시간이 걸려!",
    points:[
      {label:"세 가지 티어", text:"Instant(밀리초), Flexible(1~12시간), Deep Archive(12~48시간, 최저가)", easy:"Instant는 냉장고, Flexible는 냉동실, Deep Archive는 지하 얼음창고(가장 싸)."},
      {label:"비용", text:"S3 Standard 대비 최대 95% 저렴. 검색 비용 별도", easy:"Standard 대비 최대 95% 싸! 꺼낼 때만 요금 발생."},
      {label:"S3 Lifecycle", text:"Standard → IA → Glacier → Deep Archive 자동 전환", easy:"파일이 오래될수록 자동으로 더 싼 창고로 이사가게 설정."},
      {label:"Vault Lock", text:"WORM 정책. 규정 준수. 변경 불가", easy:"한번 저장하면 삭제 불가능. 법적 보관 의무에 사용."},
      {label:"시험 포인트", text:"Flexible 최소 90일, Deep Archive 최소 180일. 이전 삭제 시 잔여 요금 부과", easy:"Glacier는 최소 보관 기간 있어! 일찍 삭제하면 남은 요금 내야 해."},
    ]
  },
  redshift: {
    title:"Amazon Redshift", subtitle:"데이터 웨어하우스",
    easy:"Redshift는 분석용 도서관! '지난 3년간 가장 잘 팔린 상품은?' 같은 복잡한 분석에 빠르게 답해줘!",
    points:[
      {label:"아키텍처", text:"Leader Node(계획) + Compute Nodes(처리). 컬럼형 스토리지. 병렬 처리", easy:"Leader는 공장장, Compute는 직원. 여러 직원이 동시에 일해서 분석이 빨라."},
      {label:"Spectrum", text:"S3 데이터를 직접 쿼리. 데이터 이동 불필요", easy:"S3 파일을 Redshift로 직접 SQL 조회! 데이터 이동 안 해도 돼."},
      {label:"로딩", text:"COPY 명령으로 S3/DynamoDB에서 대량 로드. Kinesis Firehose로 실시간 적재", easy:"S3에서 COPY로 대량 가져오기. Firehose로 실시간 자동 적재."},
      {label:"클러스터", text:"RA3: 스토리지 분리(S3). DC2: 고성능 SSD. 서버리스 옵션", easy:"RA3는 컴퓨팅+저장 분리. 서버리스는 클러스터 관리 없이 쿼리만."},
      {label:"시험 포인트", text:"OLAP 전용. OLTP → RDS/Aurora. Multi-AZ 제한적(RA3만)", easy:"Redshift는 분석(OLAP)용! 실시간 처리(OLTP) → RDS/Aurora!"},
    ]
  },
  directconn: {
    title:"AWS Direct Connect", subtitle:"전용선 연결",
    easy:"Direct Connect는 전용 고속도로! 인터넷(VPN)은 일반 도로라 막힐 수 있지만 전용선은 항상 빠르고 안정적!",
    points:[
      {label:"특징", text:"물리 전용선. 일관된 성능. 1Gbps~100Gbps. 인터넷 경유 안 함", easy:"AWS까지 광케이블 직접 연결. 다른 트래픽 영향 안 받아."},
      {label:"연결 방식", text:"Dedicated: AWS에서 직접 포트 할당. Hosted: APN 파트너 통해 제공", easy:"Dedicated는 직접 케이블, Hosted는 중간 업체 통해 연결(더 빨리 설치)."},
      {label:"Virtual Interface", text:"Public VIF: S3 등 퍼블릭 접근. Private VIF: VPC 내부. Transit VIF: Transit GW", easy:"Public VIF는 공개 서비스용, Private VIF는 VPC 내부 접근용 차선."},
      {label:"고가용성", text:"2개 이상 이중화. VPN 백업 병행 권장. Direct Connect Gateway로 여러 리전", easy:"전용도로 하나 공사 중이면 곤란! 2개 이상 깔거나 VPN 백업 필요."},
      {label:"시험 포인트", text:"VPN보다 비싸지만 안정적. 설치 수주~수개월. 암호화 기본 없음(VPN over DX로 해결)", easy:"Direct Connect는 암호화 없어! 보안 필요하면 VPN도 같이 써야 해."},
    ]
  },
  waf: {
    title:"WAF & Shield", subtitle:"웹 방화벽 & DDoS 방어",
    easy:"WAF는 앱 앞의 경비원, Shield는 DDoS 방패!",
    points:[
      {label:"WAF", text:"L7 방화벽. SQL Injection, XSS 방어. IP/지역 차단. Rate Limiting. CloudFront, ALB, API GW 연결", easy:"이상한 요청(해킹 시도) 오면 막아라 규칙 설정. 나라나 IP 차단도 가능."},
      {label:"Web ACL & Rules", text:"규칙 그룹. AWS Managed Rules. 허용/차단/카운트 액션", easy:"AWS가 만들어둔 해킹 패턴 DB를 그대로 쓸 수도, 직접 규칙 추가도 가능."},
      {label:"Shield Standard", text:"무료. L3/L4 DDoS 자동 방어. SYN Flood, UDP Reflection 방어", easy:"무료 자동 방어막! 별도 설정 없이 항상 켜져 있어."},
      {label:"Shield Advanced", text:"$3,000/월. L7 DDoS. DRT 24/7 지원. 공격 비용 크레딧", easy:"월 $3,000 고급 방어! DDoS로 비용 폭증하면 AWS가 크레딧으로 돌려줘."},
      {label:"시험 포인트", text:"WAF는 CloudFront(글로벌) or ALB/API GW(리전). Shield Advanced는 Route53, CF, ELB, EC2 EIP", easy:"웹 해킹 방어 → WAF, DDoS 방어 → Shield!"},
    ]
  },
  secrets: {
    title:"AWS Secrets Manager", subtitle:"비밀값 관리",
    easy:"Secrets Manager는 비밀 금고! DB 비밀번호를 안전하게 저장하고 자동 교체!",
    points:[
      {label:"핵심 기능", text:"비밀값 저장·검색·교체 자동화. RDS 자격증명 자동 로테이션. KMS 암호화", easy:"비밀번호를 금고에 넣고 30일마다 자동 교체. 코드 변경 없이 최신 값 사용."},
      {label:"자동 로테이션", text:"Lambda로 주기적 교체. RDS 지원 DB는 기본 Lambda 제공", easy:"Lambda 로봇이 주기적으로 새 비밀번호 만들고 DB에 업데이트해줘."},
      {label:"vs Parameter Store", text:"Secrets Manager: 자동 로테이션, $0.40/월. Parameter Store: 무료, 로테이션 직접 구현", easy:"자동 교체 필요 → Secrets Manager! 무료 원하면 Parameter Store."},
      {label:"접근 제어", text:"IAM + Resource-based Policy. VPC Endpoint로 인터넷 없이 접근", easy:"개발팀은 개발 DB 비번만, 운영팀은 운영 DB 비번만 볼 수 있게 제어."},
      {label:"시험 포인트", text:"RDS 비밀번호 → Secrets Manager. Lambda 환경변수 하드코딩 금지", easy:"DB 비밀번호 어디에? → Secrets Manager! Lambda에 직접 적으면 절대 안 돼!"},
    ]
  },
  eventbridge: {
    title:"Amazon EventBridge", subtitle:"이벤트 버스",
    easy:"EventBridge는 이벤트 중계소! 어떤 일이 생기면 자동으로 다른 서비스에 연결!",
    points:[
      {label:"이벤트 버스", text:"Default(AWS), Custom(앱), Partner(SaaS: Zendesk, Shopify). 계정 간 전송 가능", easy:"AWS 서비스, 내 앱, 외부 서비스 이벤트를 각각 다른 채널로 받아."},
      {label:"Rules", text:"패턴 매칭으로 타겟 실행. Cron/Rate 스케줄. 최대 5개 타겟. 입력 변환", easy:"'이런 이벤트 오면 실행' 규칙. Cron으로 스케줄러도 가능."},
      {label:"타겟", text:"Lambda, SQS, SNS, ECS, Step Functions, API Gateway, Kinesis 등 20+", easy:"Lambda 실행, SQS 메시지, SNS 알림 등 20가지 이상 서비스와 연결."},
      {label:"Archive & Replay", text:"이벤트 아카이빙 후 재처리. 디버깅·재시도·테스트 활용", easy:"과거 이벤트를 다시 재생! 버그 수정 후 그 시점부터 다시 실행 가능."},
      {label:"시험 포인트", text:"CloudWatch Events의 업그레이드. SaaS 파트너 연동은 EventBridge만. Pipe 파이프라인", easy:"외부 서비스 이벤트를 AWS로 받으려면 EventBridge만 가능!"},
    ]
  },
  cloudtrail: {
    title:"AWS CloudTrail", subtitle:"API 감사 로그",
    easy:"CloudTrail은 AWS 블랙박스! 누가 언제 어떤 서버를 만들었는지 다 기록!",
    points:[
      {label:"이벤트 유형", text:"Management Events(API 호출, 기본 활성화), Data Events(S3/Lambda, 별도 설정), Insight Events(비정상 감지)", easy:"Management는 '누가 EC2 만들었다', Data는 'S3 파일 열었다' 같은 세부 기록."},
      {label:"저장", text:"기본 90일(콘솔). S3 저장 시 무기한. CloudWatch Logs 실시간. Athena 분석", easy:"콘솔에서 90일만 보여. S3에 저장하면 영원히. Athena로 SQL 분석도 가능."},
      {label:"Trail", text:"단일 리전 or 모든 리전. 조직 Trail: Organizations 전체 중앙 수집. 무결성 검증", easy:"전 세계 모든 지역 기록을 한 곳에 모을 수 있어."},
      {label:"보안", text:"SSE-KMS 암호화. S3 접근 제어. MFA Delete 삭제 방지", easy:"로그 파일은 KMS로 암호화. MFA 있어야만 삭제 가능 — 증거 인멸 방지!"},
      {label:"시험 포인트", text:"CloudTrail ≠ CloudWatch. '누가 삭제?' → CloudTrail. '서버 왜 느려?' → CloudWatch", easy:"CloudTrail은 감사일지(누가 뭘 했나), CloudWatch는 성능 모니터링. 다른 목적!"},
    ]
  },
  apigw: {
    title:"Amazon API Gateway", subtitle:"API 관리",
    easy:"API Gateway는 앱의 현관문! 요청을 받아서 Lambda, EC2에 전달하고 Throttling, Caching도 해줘!",
    points:[
      {label:"API 타입", text:"REST(풀기능·캐싱), HTTP(70% 저렴·빠름), WebSocket(실시간 양방향)", easy:"REST는 풀옵션 자동문, HTTP는 기본 문(저렴), WebSocket은 채팅·게임용."},
      {label:"통합", text:"Lambda Proxy, AWS 서비스 직접(S3, DynamoDB), HTTP 백엔드, Mock", easy:"Lambda Proxy는 전화 연결, 직접 통합은 DynamoDB 바로 조회, Mock은 테스트용 더미."},
      {label:"보안", text:"IAM, Cognito Authorizer, Lambda Authorizer, Resource Policy(IP/VPC 제한)", easy:"IAM은 사원증, Cognito는 회원 토큰, Lambda Authorizer는 커스텀 확인."},
      {label:"성능", text:"Throttling: 기본 10,000 RPS. 캐싱: TTL 300초. Stage별 배포(dev/prod)", easy:"요청 폭주 시 번호표 대기. 자주 묻는 건 캐시. dev/prod 분리 관리."},
      {label:"시험 포인트", text:"Edge-Optimized(글로벌), Regional(한 리전), Private(VPC). WebSocket → 실시간 채팅", easy:"전 세계 → Edge, 한 리전 → Regional, 내부망 → Private. 실시간 채팅 → WebSocket!"},
    ]
  },
  batch: {
    title:"AWS Batch", subtitle:"완전관리형 배치 컴퓨팅",
    easy:"AWS Batch는 숙제를 자동으로 나눠주는 반장이야! 할 일 목록(Job)을 넣으면 알아서 컴퓨터를 빌려서 처리하고 끝나면 반납해. 직접 서버 관리 안 해도 돼!",
    points:[
      {label:"핵심 구성", text:"Job Definition(작업 템플릿), Job Queue(우선순위 큐), Compute Environment(EC2/Fargate 자동 프로비저닝)", easy:"Job Definition은 레시피, Job Queue는 주문 대기줄, Compute Environment는 자동으로 뜨는 요리사."},
      {label:"컴퓨팅 환경", text:"Managed(AWS가 EC2/Fargate 자동 관리) vs Unmanaged(직접 관리). Spot 인스턴스 활용으로 최대 90% 절감", easy:"Managed는 AWS가 알아서 서버 준비, Unmanaged는 직접 관리. Spot 쓰면 비용 90% 절감!"},
      {label:"워크플로 통합", text:"Step Functions과 연동해 배치 파이프라인 구성. EventBridge로 스케줄 실행 가능", easy:"Step Functions와 연결하면 '전처리→배치→후처리' 자동화 파이프라인 구성 가능."},
      {label:"vs Lambda", text:"Lambda: 최대 15분, 단순 이벤트 처리. Batch: 수시간~수일, 대용량 병렬 처리", easy:"Lambda는 단거리, Batch는 장거리! ML 학습, 렌더링, 대용량 분석은 Batch 사용."},
      {label:"시험 포인트", text:"Batch는 ECS 기반으로 실행. 15분 이상 작업 → Batch. Spot 가격 중단 자동 재시도", easy:"15분 넘는 작업 → AWS Batch! Lambda 대신 써야 해. Spot 중단돼도 자동 재시도!"},
    ]
  },
  fsx: {
    title:"Amazon FSx", subtitle:"관리형 파일시스템",
    easy:"FSx는 다양한 파일 서버를 AWS에서 그대로 쓸 수 있게 해주는 서비스야! Windows 공유 폴더, 슈퍼컴퓨터 파일시스템 등을 관리형으로 제공해.",
    points:[
      {label:"FSx for Windows File Server", text:"완전관리형 Windows 파일서버. SMB/NTFS. Active Directory 통합. Multi-AZ 지원", easy:"회사 Windows 공유 폴더를 AWS에 그대로! AD 로그인 그대로 쓸 수 있어."},
      {label:"FSx for Lustre", text:"HPC/ML용 고성능 파일시스템. S3와 직접 통합. 초당 수백 GB 처리량", easy:"슈퍼컴퓨터용 초고속 파일시스템! ML 학습, 게놈 분석, 영상 처리에 사용."},
      {label:"FSx for NetApp ONTAP", text:"NetApp ONTAP 완전관리형. NFS/SMB/iSCSI. 자동 계층화. 데이터 중복 제거", easy:"기업 NetApp 스토리지를 AWS로 이전 시 그대로 쓸 수 있어. 온프레미스 호환!"},
      {label:"FSx for OpenZFS", text:"ZFS 기반. NFS 호환. 스냅샷·복제. Linux 워크로드 최적화", easy:"Linux 서버용 고성능 파일시스템. ZFS 기능(스냅샷, 압축)을 관리형으로."},
      {label:"시험 포인트", text:"Windows 파일 공유 → FSx for Windows(EFS 대신!). HPC/ML → FSx for Lustre. EFS는 Linux NFS 전용", easy:"Windows 공유 폴더 필요 → FSx for Windows! Linux 공유 → EFS. HPC → Lustre!"},
    ]
  },
  storagegateway: {
    title:"AWS Storage Gateway", subtitle:"하이브리드 스토리지 연결",
    easy:"Storage Gateway는 회사 서버와 AWS 클라우드를 연결하는 다리야! 기존 온프레미스 서버에서 AWS S3를 마치 로컬 드라이브처럼 쓸 수 있어.",
    points:[
      {label:"File Gateway", text:"NFS/SMB로 S3 접근. 로컬 캐시로 저지연. 온프레미스 앱 코드 변경 없이 S3 사용", easy:"회사 파일 서버를 S3로 연결! 직원들은 그냥 네트워크 드라이브처럼 써."},
      {label:"Volume Gateway", text:"iSCSI 블록 스토리지. Cached(S3에 저장, 자주 쓰는 건 로컬). Stored(로컬에 저장, S3에 백업)", easy:"Cached는 S3에 주로 저장, Stored는 로컬에 저장+S3 백업. 재해 복구용."},
      {label:"Tape Gateway", text:"가상 테이프 라이브러리(VTL). 기존 백업 소프트웨어(Veeam 등) 그대로 사용. S3/Glacier에 저장", easy:"기존 테이프 백업 시스템을 클라우드로! 소프트웨어 변경 없이 S3에 저장."},
      {label:"사용 사례", text:"온프레미스→클라우드 백업, 재해 복구, 클라우드 마이그레이션 중간 단계", easy:"회사 데이터를 클라우드로 옮기는 과도기에 많이 사용해."},
      {label:"시험 포인트", text:"온프레미스에서 S3 접근 → Storage Gateway. 테이프 백업→클라우드 → Tape Gateway. S3/Glacier 연결 가능", easy:"온프레미스+S3 연결 키워드 → Storage Gateway! 테이프 → Glacier!"},
    ]
  },
  datasync: {
    title:"AWS DataSync", subtitle:"온라인 데이터 이전 서비스",
    easy:"DataSync는 이삿짐 센터야! 기존 서버의 데이터를 AWS로 빠르고 안전하게 옮겨줘. 자동으로 암호화하고 데이터가 제대로 옮겨졌는지도 확인해줘!",
    points:[
      {label:"지원 소스/목적지", text:"소스: NFS, SMB, HDFS, S3, EFS, FSx, 오브젝트 스토리지. 목적지: S3, EFS, FSx", easy:"NFS 서버, Hadoop, S3 등 다양한 소스에서 AWS 스토리지로 이전."},
      {label:"전송 성능", text:"네트워크 최대 활용. 병렬 전송. DataSync Agent(온프레미스 설치). Direct Connect/VPN 경유 가능", easy:"자동으로 네트워크를 최대한 활용해서 빠르게 전송. Direct Connect랑 같이 쓰면 더 빨라."},
      {label:"자동화·검증", text:"스케줄 전송. 데이터 무결성 자동 검증. 전송 후 삭제 옵션. CloudWatch 모니터링", easy:"정기적으로 자동 동기화하고, 데이터가 손상 없이 옮겨졌는지 자동 확인!"},
      {label:"vs Storage Gateway", text:"DataSync: 일회성 또는 주기적 대용량 이전. Storage Gateway: 지속적 온프레미스-클라우드 연결", easy:"DataSync는 이사(데이터 이전), Storage Gateway는 출퇴근(상시 연결)."},
      {label:"시험 포인트", text:"온프레미스→S3/EFS 대용량 이전 → DataSync. Snow Family는 오프라인, DataSync는 온라인", easy:"네트워크로 데이터 이전 → DataSync! 인터넷 없는 오지 → Snow Family!"},
    ]
  },
  snow: {
    title:"AWS Snow Family", subtitle:"오프라인 대용량 데이터 이전",
    easy:"Snow Family는 AWS가 트럭으로 하드디스크를 배달해주는 서비스야! 인터넷이 느리거나 없을 때 수십~수백 PB 데이터를 물리적으로 이전할 때 써.",
    points:[
      {label:"Snowcone", text:"초소형(2.1kg). 8TB~14TB. 현장 데이터 수집·이전. DataSync 내장", easy:"가방에 들어가는 초미니 버전. 원격지 현장에서 데이터 수집."},
      {label:"Snowball Edge", text:"Storage Optimized(80TB), Compute Optimized(42TB+GPU). 엣지 컴퓨팅 가능. 클러스터링", easy:"여행 가방 크기 장치. 단순 이전뿐 아니라 현장에서 컴퓨팅도 가능."},
      {label:"Snowmobile", text:"40피트 컨테이너 트럭. 최대 100PB. 엑사바이트급 이전", easy:"데이터센터 전체 이전할 때! AWS 트럭이 직접 와서 연결해줘."},
      {label:"엣지 컴퓨팅", text:"인터넷 없는 오지에서 EC2/Lambda 실행. 수집→처리→AWS 업로드", easy:"인터넷 없는 광산, 선박 등에서 데이터 처리하다가 나중에 AWS로 전송."},
      {label:"시험 포인트", text:"네트워크로 10년 이상 걸리면 Snow. 오프라인 전용. 전송 후 AWS가 데이터 삭제", easy:"'수십 PB 이전' + '인터넷 제한' → Snow Family! 업로드 후 장치 데이터 완전 삭제."},
    ]
  },
  natgw: {
    title:"NAT Gateway", subtitle:"Private 서브넷 인터넷 아웃바운드",
    easy:"NAT Gateway는 Private 동네 주민이 바깥에 나갈 수 있게 해주는 쪽문이야! 나가는 건 되지만 밖에서 들어오는 건 안 돼.",
    points:[
      {label:"역할", text:"Private Subnet의 EC2/Lambda가 인터넷으로 아웃바운드 트래픽 허용. 인바운드 불가(Stateful)", easy:"Private 서브넷 인스턴스가 소프트웨어 업데이트, 외부 API 호출 등 가능. 외부에서 접속 불가."},
      {label:"배포", text:"Public Subnet에 배치. Elastic IP 할당 필수. AZ별로 하나씩 배포 권장(고가용성)", easy:"NAT Gateway 자체는 Public Subnet에 있어야 해. 가용영역마다 하나씩 만들어야 안전."},
      {label:"NAT Instance", text:"EC2 기반(구형). 직접 관리·패치 필요. Security Group 적용 가능. 비용 저렴", easy:"NAT Gateway는 AWS 관리형, NAT Instance는 EC2 직접 관리. 시험에 트랩으로 자주 등장!"},
      {label:"비용", text:"시간당 + 처리한 GB당 과금. AZ 간 트래픽 비용 발생. 같은 AZ NAT Gateway 권장", easy:"데이터 많이 보내면 비용 증가. 각 AZ에 NAT Gateway 두면 데이터 전송 비용 절감."},
      {label:"시험 포인트", text:"NAT Gateway는 Public Subnet에 위치. HA는 AZ별 NAT Gateway. IPv6는 Egress-Only IGW 사용", easy:"IPv6 Private 서브넷 → NAT Gateway 아님, Egress-Only IGW 사용! 시험 트랩!"},
    ]
  },
  vpcendpoint: {
    title:"VPC Endpoints", subtitle:"인터넷 없이 AWS 서비스 접근",
    easy:"VPC Endpoint는 AWS 서비스로 가는 비밀 통로야! 인터넷 없이 AWS 내부 네트워크로만 S3, DynamoDB 등에 접근할 수 있어.",
    points:[
      {label:"Gateway Endpoint", text:"S3, DynamoDB만 지원. 무료. Route Table에 경로 추가. 리전 내 접근", easy:"S3, DynamoDB → Gateway Endpoint(무료)! Route Table에 목적지 추가하면 됨."},
      {label:"Interface Endpoint(PrivateLink)", text:"나머지 AWS 서비스(EC2, SQS 등). ENI 생성. 시간당 + 데이터 과금. DNS 해석 변경", easy:"대부분의 AWS 서비스 연결은 Interface Endpoint. ENI 하나 만들어서 통신."},
      {label:"Gateway Load Balancer Endpoint", text:"GWLB와 연동. 3rd파티 방화벽/IPS 트래픽 투명 삽입. 검사 후 원본 목적지로 전달", easy:"보안 장비를 통과시키는 특수 엔드포인트. 방화벽 검사 투명하게 삽입."},
      {label:"보안 이점", text:"인터넷 게이트웨이/NAT Gateway 없이 AWS 서비스 접근. Bucket Policy에서 VPC Endpoint 조건 지정 가능", easy:"S3 데이터가 인터넷을 거치지 않아 더 안전! 특정 VPC에서만 버킷 접근 허용 가능."},
      {label:"시험 포인트", text:"S3/DynamoDB → Gateway(무료). 나머지 → Interface(유료). 온프레미스에서는 사용 불가", easy:"S3 = Gateway Endpoint(무료)! 다른 서비스 = Interface Endpoint. 온프레미스→VPC Endpoint 불가!"},
    ]
  },
  transitgw: {
    title:"AWS Transit Gateway", subtitle:"네트워크 허브 라우터",
    easy:"Transit Gateway는 여러 VPC와 온프레미스를 하나의 허브로 연결하는 중앙 교차로야! VPC가 많을수록 Peering보다 훨씬 간단해져.",
    points:[
      {label:"허브 앤 스포크", text:"최대 5,000 VPC/VPN 연결. VPC Peering과 달리 전이적 라우팅 지원. 중앙 집중 관리", easy:"VPC가 10개면 Peering은 45개 연결 필요. TGW는 허브 1개에 10개 연결만 하면 끝!"},
      {label:"멀티 계정", text:"Resource Access Manager(RAM)로 다른 계정 간 공유. Organizations 통합", easy:"여러 AWS 계정의 VPC를 하나의 TGW로 연결. 멀티 계정 아키텍처 필수 요소."},
      {label:"라우팅 테이블", text:"여러 라우팅 테이블로 트래픽 분리. VPC간 격리 가능. 블랙홀 라우팅", easy:"VPC A↔B는 허용, A↔C는 차단 같은 세밀한 라우팅 제어 가능."},
      {label:"연결 유형", text:"VPC Attachment, VPN Attachment, Direct Connect Gateway Attachment, Peering Attachment(리전 간)", easy:"VPC, VPN, Direct Connect 모두 TGW 하나로 연결. 리전 간 TGW Peering도 가능."},
      {label:"시험 포인트", text:"TGW: 전이적 라우팅 O. VPC Peering: 전이적 라우팅 X. 100+ VPC → TGW 권장", easy:"VPC 많다 + 상호 통신 필요 → Transit Gateway! Peering은 1:1만, TGW는 다:다!"},
    ]
  },
  globalaccel: {
    title:"AWS Global Accelerator", subtitle:"글로벌 네트워크 가속",
    easy:"Global Accelerator는 전 세계 사용자가 가장 가까운 AWS 엣지에서 바로 연결해서 빠르게 서버에 도달하게 해줘! 인터넷 대신 AWS 내부 고속도로를 타는 거야.",
    points:[
      {label:"Anycast IP", text:"2개의 정적 Anycast IP 제공. 전 세계 어디서나 동일 IP로 가장 가까운 엣지 연결", easy:"전화번호가 고정되어 있는데, 어디서 전화해도 가장 가까운 지점으로 연결되는 것."},
      {label:"성능 향상", text:"인터넷 대신 AWS 글로벌 네트워크 사용. 패킷 손실/지연/지터 감소. 60% 빠른 응답", easy:"인터넷 도로 대신 AWS 전용 고속도로! 막히지 않아서 훨씬 빠르고 안정적."},
      {label:"헬스체크·장애조치", text:"엔드포인트 헬스체크. 비정상 시 자동으로 다른 리전·엔드포인트로 전환. 30초 이내", easy:"서버 문제 생기면 30초 안에 자동으로 다른 서버로 연결 전환!"},
      {label:"엔드포인트", text:"ALB, NLB, EC2, Elastic IP. 가중치 기반 트래픽 조절. Blue/Green 배포", easy:"여러 리전의 로드밸런서에 가중치 배분. A/B 테스트, 무중단 배포 가능."},
      {label:"시험 포인트", text:"CloudFront vs Global Accelerator: CloudFront는 캐싱(HTTP), GA는 TCP/UDP 네트워크 가속", easy:"캐싱이 필요한 정적 콘텐츠 → CloudFront. 게임/실시간/캐싱 없는 가속 → Global Accelerator!"},
    ]
  },
  sitevpn: {
    title:"AWS Site-to-Site VPN", subtitle:"온프레미스 VPN 연결",
    easy:"Site-to-Site VPN은 회사 네트워크와 AWS VPC를 인터넷으로 안전하게 연결하는 암호화 터널이야! Direct Connect보다 빨리 설치할 수 있어.",
    points:[
      {label:"구성 요소", text:"Virtual Private Gateway(VGW) or Transit Gateway + Customer Gateway(온프레미스 라우터) + IPsec 터널 2개", easy:"AWS 쪽 문(VGW)과 회사 쪽 문(CGW)을 암호화 터널 2개로 연결."},
      {label:"이중화", text:"터널 2개 자동 생성(Active/Passive). 고가용성. 다른 AZ 종단", easy:"자동으로 터널 2개! 하나가 끊겨도 다른 터널로 계속 통신 가능."},
      {label:"속도 및 한계", text:"최대 1.25Gbps/터널. 인터넷 경유 → 지연 가변적. 설치 수시간", easy:"Direct Connect보다 빠르게 설치 가능. 하지만 속도는 Direct Connect가 우세."},
      {label:"VPN over Direct Connect", text:"DX는 암호화 없음. DX + Site-to-Site VPN으로 암호화 추가", easy:"Direct Connect는 암호화 없어서 보안 필요하면 VPN도 같이 설치해야 해."},
      {label:"시험 포인트", text:"VPN: 빠른 설치, 인터넷 경유. DX: 수주~수개월 설치, 전용선. DX 백업으로 VPN 병행 권장", easy:"'빠르게 연결' → VPN. '안정적 대역폭' → Direct Connect. '암호화+DX' → VPN over DX!"},
    ]
  },
  vpcpeering: {
    title:"VPC Peering", subtitle:"VPC 간 프라이빗 직접 연결",
    easy:"VPC Peering은 두 VPC를 비밀 통로로 직접 연결하는 거야! 인터넷 없이 서로 다른 VPC의 서버끼리 통신할 수 있어.",
    points:[
      {label:"특징", text:"AWS 네트워크를 통한 프라이빗 연결. 같은 리전 or 크로스 리전. 같은 계정 or 크로스 계정", easy:"두 VPC 사이에 전용 통로 개설. 인터넷 경유 없음. 다른 계정, 다른 리전도 가능."},
      {label:"전이적 라우팅 불가", text:"A→B→C 전이적 라우팅 불가. A↔C도 연결하려면 별도 Peering 필요", easy:"A-B-C 연결해도 A에서 C로 못 가. A-C도 따로 연결해야 해!"},
      {label:"CIDR 제한", text:"겹치는 CIDR 블록 사용 시 Peering 불가. 라우팅 테이블 양쪽 모두 수정 필요", easy:"두 VPC의 IP 대역이 겹치면 연결 불가! 설계 시 CIDR 겹치지 않게 주의."},
      {label:"Transit Gateway와 비교", text:"Peering: 1:1 연결, 전이 불가, 무료. TGW: 허브, 전이 가능, 비용 발생", easy:"VPC 2~3개 → Peering(무료). VPC 많고 복잡 → Transit Gateway."},
      {label:"시험 포인트", text:"전이적 라우팅 불가. CIDR 겹침 불가. 양방향 라우팅 테이블 수정 필수", easy:"Peering 설정 후 라우팅 테이블 양쪽 다 수정해야 통신돼! 한쪽만 하면 안 됨."},
    ]
  },
  scp: {
    title:"Service Control Policies (SCP)", subtitle:"Organizations 최상위 권한 경계",
    easy:"SCP는 회사 전체에 적용되는 헌법이야! 어떤 직원(계정)이 무슨 권한을 가졌든 SCP가 금지하면 절대로 못 해. IAM이 허용해도 SCP가 막으면 차단!",
    points:[
      {label:"개요", text:"AWS Organizations의 OU/계정에 적용. 최대 허용 권한 경계 정의. IAM 권한에 추가 조건", easy:"SCP는 각 계정의 최대 권한 상한선. IAM이 모든 권한을 줘도 SCP가 막으면 불가능."},
      {label:"Allow vs Deny", text:"허용 목록(Allow list): 명시한 것만 허용. 거부 목록(Deny list): 명시한 것만 거부(기본값)", easy:"Deny list가 기본. 특정 서비스만 못 쓰게 막기. Allow list는 허용한 것만 사용 가능."},
      {label:"적용 범위", text:"루트 계정에 SCP 적용 불가. 멤버 계정에만 적용. Management Account는 영향 없음", easy:"SCP는 자식 계정만 제한. 마스터(관리) 계정은 SCP 영향 없어. 주의!"},
      {label:"계층적 적용", text:"OU → 하위 OU → 계정 순서로 상속. 상위 OU SCP + 계정 SCP 모두 충족해야 허용", easy:"위에서 아래로 내려오는 규칙. 상위 OU에서 막히면 하위에서 열어줄 수 없어."},
      {label:"시험 포인트", text:"SCP ≠ IAM Policy. 루트 사용자도 SCP 제한 적용. Management Account는 SCP 영향 없음", easy:"루트 계정이라도 SCP 금지하면 못 해! Management Account만 SCP 영향 없어."},
    ]
  },
  networkfirewall: {
    title:"AWS Network Firewall", subtitle:"VPC 관리형 네트워크 방화벽",
    easy:"Network Firewall은 VPC의 경비대야! 들어오고 나가는 모든 트래픽을 상태 기반으로 검사해. WAF가 앱 레이어라면 Network Firewall은 네트워크 레이어!",
    points:[
      {label:"개요", text:"완전관리형 상태 기반 방화벽. VPC 인바운드/아웃바운드/동서 트래픽 보호. Gateway Load Balancer 불필요", easy:"VPC 레벨 방화벽. 인터넷→VPC, VPC→인터넷, VPC→VPC 모든 트래픽 검사."},
      {label:"규칙 유형", text:"Stateless(패킷 단위), Stateful(연결 추적), Domain List(도메인 차단), Suricata IPS(오픈소스 규칙)", easy:"단순 IP/포트 차단부터 도메인 기반 차단, IPS 규칙까지 다양하게 설정 가능."},
      {label:"아키텍처", text:"전용 Firewall Subnet에 배치. 트래픽 라우팅 조정 필요. 중앙 집중 or 분산 배포", easy:"방화벽 전용 서브넷을 만들고, 모든 트래픽이 거기를 거치도록 라우팅 설정."},
      {label:"vs WAF vs Security Group", text:"SG: 인스턴스 레벨. WAF: L7 HTTP. Network Firewall: VPC 레벨 L3~L7 종합", easy:"SG는 방문객 명단, WAF는 앱 보안, Network Firewall은 동네 입구 종합 경비."},
      {label:"시험 포인트", text:"VPC 레벨 트래픽 검사·차단 → Network Firewall. IDS/IPS 기능 필요 → Network Firewall", easy:"VPC 전체 트래픽 필터링 + IPS 기능 → Network Firewall!"},
    ]
  },
  guardduty: {
    title:"Amazon GuardDuty", subtitle:"ML 기반 위협 탐지",
    easy:"GuardDuty는 AWS의 탐정이야! 로그를 분석해서 '이상한 로그인', '암호화폐 채굴', '데이터 유출' 같은 위협을 자동으로 찾아내. 설치 없이 바로 켤 수 있어!",
    points:[
      {label:"분석 소스", text:"CloudTrail(API 호출), VPC Flow Logs(네트워크), DNS Logs(도메인), EKS 감사 로그, S3 이벤트", easy:"CloudTrail, VPC Flow, DNS를 동시에 분석. 에이전트 설치 없이 30초면 활성화!"},
      {label:"탐지 유형", text:"비정상 API 호출, 악성 IP 접근, 암호화폐 채굴, 자격증명 탈취, 포트 스캔, S3 유출", easy:"해커 패턴(악성 IP), 내부 위협(비정상 API), 맬웨어(채굴) 등 다양한 위협 감지."},
      {label:"결과 처리", text:"Finding → EventBridge → Lambda/SNS. 심각도(낮음/중간/높음). 자동 교정 가능", easy:"위협 발견 → EventBridge로 알림 → Lambda로 자동 차단! 완전 자동화 가능."},
      {label:"멀티 계정", text:"Organizations와 통합. 관리자 계정에서 전체 멤버 계정 중앙 관리", easy:"여러 계정의 위협을 한 곳에서 관리. Organizations 연동 필수."},
      {label:"시험 포인트", text:"30일 무료 체험. VPC Flow Logs 비활성화해도 GuardDuty는 독립적으로 수집. 에이전트 불필요", easy:"에이전트 없이 켜기만 하면 바로 보호! 위협 감지 → GuardDuty, 취약점 스캔 → Inspector"},
    ]
  },
  inspector: {
    title:"Amazon Inspector", subtitle:"취약점 자동 스캔",
    easy:"Inspector는 서버의 보안 점검 로봇이야! EC2, Lambda, 컨테이너에서 알려진 취약점(CVE)을 자동으로 찾아서 위험도 점수와 함께 알려줘.",
    points:[
      {label:"스캔 대상", text:"EC2(OS/소프트웨어 CVE), Lambda 함수(코드 의존성), ECR 컨테이너 이미지", easy:"EC2, Lambda, 컨테이너 이미지의 패키지/라이브러리 취약점을 자동으로 검사."},
      {label:"지속적 스캔", text:"초기 배포 + 새 CVE 발표 시 자동 재스캔. 에이전트(SSM Agent 활용). Near Real-time", easy:"처음 한 번이 아니라 새 취약점이 발견될 때마다 자동 재검사! 항상 최신 상태."},
      {label:"리스크 점수", text:"CVSSv3 + 네트워크 접근성 결합. 실제 위험도 기반 우선순위. Inspector Score", easy:"단순 CVE 점수가 아니라 인터넷에 노출됐는지도 고려해서 진짜 위험도 계산."},
      {label:"통합", text:"Finding → Security Hub 통합. EventBridge → 자동화. ECR 이미지 스캔 통합", easy:"Security Hub에서 한 화면으로 관리. 새 취약점 발견 시 자동으로 티켓 생성 가능."},
      {label:"시험 포인트", text:"GuardDuty: 위협 감지(행동 분석). Inspector: 취약점 스캔(CVE). 다른 목적!", easy:"GuardDuty = 탐정(이상한 행동 감시). Inspector = 의사(건강 검진). 완전히 달라!"},
    ]
  },
  macie: {
    title:"Amazon Macie", subtitle:"S3 민감 데이터 자동 탐지",
    easy:"Macie는 S3 창고 속 개인정보 탐지기야! 신용카드 번호, 주민등록번호, 이메일 등 민감한 데이터가 어디에 있는지 자동으로 찾아줘. GDPR 준수에 도움!",
    points:[
      {label:"탐지 유형", text:"PII(개인정보), 금융 정보(신용카드·계좌), 의료 정보(PHI), 자격증명(API 키·비밀번호)", easy:"주민번호, 신용카드 번호, API 키 등이 S3에 있으면 자동으로 찾아서 경고!"},
      {label:"분류 방법", text:"ML + 패턴 매칭. 관리형 데이터 식별자(100+). 커스텀 식별자 추가 가능", easy:"AWS가 만든 100가지 이상 패턴으로 자동 탐지. 회사 고유 패턴도 추가 가능."},
      {label:"S3 커버리지", text:"계정 내 모든 S3 버킷 자동 검색. 암호화 상태, 퍼블릭 접근 여부 등 보안 상태 표시", easy:"S3 버킷 전체를 자동으로 조사해서 '이 버킷에 민감 데이터 있어요!' 알림."},
      {label:"결과 처리", text:"Finding → EventBridge → Lambda/SNS. Security Hub 통합. 30일 무료", easy:"민감 데이터 발견 → EventBridge → 자동 알림 또는 이동!"},
      {label:"시험 포인트", text:"S3 민감 데이터 탐지 → Macie. PII/규정 준수 → Macie. GuardDuty는 위협 탐지!", easy:"'S3 개인정보 어디 있어?' → Macie! '해킹 시도 탐지' → GuardDuty!"},
    ]
  },
  acm: {
    title:"AWS Certificate Manager", subtitle:"SSL/TLS 인증서 관리",
    easy:"ACM은 웹사이트의 자물쇠(HTTPS) 인증서를 무료로 발급하고 자동으로 갱신해주는 서비스야! 인증서 만료 걱정 없이 항상 HTTPS 유지!",
    points:[
      {label:"핵심 기능", text:"SSL/TLS 인증서 무료 발급. 자동 갱신. 퍼블릭·프라이빗 인증서. DNS/이메일 검증", easy:"인증서 발급, 갱신, 배포를 AWS가 다 해줘. 직접 관리하면 갱신 잊어버려 장애 발생!"},
      {label:"통합 서비스", text:"ELB(ALB/NLB), CloudFront, API Gateway, Elastic Beanstalk. EC2 직접 배포 불가", easy:"ALB, CloudFront에 인증서 연결 가능. EC2 자체엔 직접 배포 못 함 — ELB 앞에 달아야!"},
      {label:"퍼블릭 vs 프라이빗", text:"퍼블릭: 무료, 인터넷 서비스용. 프라이빗(ACM Private CA): 유료, 내부 서비스용", easy:"인터넷용 인증서 → 무료! 내부 직원 시스템용 → Private CA(유료)."},
      {label:"리전 제약", text:"CloudFront용 인증서는 반드시 us-east-1(버지니아)에서 발급. 리전별 독립", easy:"CloudFront + HTTPS → us-east-1에서 인증서 발급! 다른 리전 인증서는 CloudFront에 못 씀."},
      {label:"시험 포인트", text:"ACM은 EC2 직접 배포 불가. CloudFront 인증서 → us-east-1 필수. 자동 갱신으로 만료 방지", easy:"CloudFront SSL → us-east-1 ACM! EC2 직접 배포 불가, 반드시 ELB/CF를 거쳐야!"},
    ]
  },
  s3objectlock: {
    title:"S3 Object Lock", subtitle:"WORM 데이터 보호",
    easy:"S3 Object Lock은 파일에 자물쇠를 채워서 정해진 기간 동안 절대 삭제하거나 수정할 수 없게 해줘. 금융·의료·법무 법률상 보관 의무에 사용해!",
    points:[
      {label:"WORM", text:"Write Once, Read Many. 데이터 불변성 보장. 랜섬웨어 방어. 규정 준수 데이터 보존", easy:"한번 쓰면 정해진 기간 동안 읽기만 가능! 삭제·수정 불가. 랜섬웨어도 못 건드려."},
      {label:"Governance 모드", text:"특별 권한(s3:BypassGovernanceRetention) 있으면 잠금 해제·삭제 가능. 테스트·유연한 보호", easy:"관리자는 특별 권한으로 잠금 해제 가능. 규정보다 유연한 보호."},
      {label:"Compliance 모드", text:"루트 계정 포함 누구도 삭제/수정 불가. 보존 기간 변경 불가. 엄격한 규정 준수", easy:"루트도 못 지워! 법적 의무 데이터 보관에 사용. 한번 설정하면 변경 불가."},
      {label:"Legal Hold", text:"보존 기간 없이 무기한 보호. s3:PutObjectLegalHold 권한으로 설정/해제", easy:"기간 없이 법적 조사가 끝날 때까지 보호. 소송 중 증거 보전에 활용."},
      {label:"시험 포인트", text:"S3 Object Lock은 Versioning 필수. 버킷 생성 시 활성화(이후 변경 불가). Glacier도 Vault Lock 가능", easy:"WORM + 규정 준수 → S3 Object Lock! Compliance 모드는 루트도 삭제 불가!"},
    ]
  },
  stepfunctions: {
    title:"AWS Step Functions", subtitle:"서버리스 워크플로 오케스트레이션",
    easy:"Step Functions는 여러 Lambda를 순서대로 연결하는 지휘자야! 성공하면 다음 단계, 실패하면 재시도 또는 에러 처리를 자동으로 해줘.",
    points:[
      {label:"State Machine", text:"JSON/YAML로 워크플로 정의. 시각적 편집기. Task/Choice/Wait/Parallel/Map 상태", easy:"흐름도를 코드로 그리는 거야! 조건 분기, 병렬 실행, 대기, 반복 모두 표현 가능."},
      {label:"Standard vs Express", text:"Standard: 최대 1년, 정확히 1회 실행, 감사 로그. Express: 최대 5분, 고처리량, 비동기", easy:"Standard는 장시간 중요 워크플로, Express는 빠른 고처리량(IoT, 스트리밍) 용."},
      {label:"통합", text:"Lambda, ECS, DynamoDB, SQS, SNS, Bedrock, SageMaker 등 AWS 서비스 직접 통합", easy:"Lambda 뿐 아니라 ECS, DynamoDB, SageMaker 등을 직접 코드 없이 연결!"},
      {label:"오류 처리", text:"재시도(Retry), 폴백(Catch). 지수 백오프. 타임아웃. 하트비트", easy:"Lambda 실패하면 3번 재시도, 그래도 실패하면 에러 처리 경로로 자동 분기."},
      {label:"시험 포인트", text:"복잡한 Lambda 체인 → Step Functions. 병렬 처리 → Map/Parallel 상태. 15분 이상 → Standard", easy:"여러 Lambda를 순서대로, 조건부로, 병렬로 실행해야 하면 → Step Functions!"},
    ]
  },
  dynamostreams: {
    title:"DynamoDB Streams", subtitle:"DynamoDB 변경 이벤트 스트림",
    easy:"DynamoDB Streams는 테이블에서 일어나는 모든 변화를 실시간으로 전달하는 알림 시스템이야! 항목이 추가/수정/삭제되면 Lambda가 자동으로 실행돼.",
    points:[
      {label:"개요", text:"DynamoDB 항목 변경(INSERT/MODIFY/REMOVE) 순서 보장 스트림. 24시간 보관. 샤드 기반", easy:"테이블 변경 사항을 순서대로 기록하는 테이프. 24시간 안에 처리해야 해."},
      {label:"스트림 레코드 타입", text:"KEYS_ONLY, NEW_IMAGE, OLD_IMAGE, NEW_AND_OLD_IMAGES 중 선택", easy:"키만 보낼지, 변경 전/후 데이터를 보낼지 선택. 전후 비교는 NEW_AND_OLD_IMAGES."},
      {label:"Lambda 통합", text:"Lambda 이벤트 소스로 자동 폴링. 배치 처리. 실패 시 재시도. DLQ 설정 가능", easy:"새 변경 오면 Lambda 자동 실행! 배치로 처리하고 실패하면 DLQ로."},
      {label:"사용 사례", text:"크로스 리전 복제(Global Tables 기반), 이벤트 기반 캐시 무효화, 변경 감사 로그", easy:"주문 완료 시 → 재고 감소·배송 시작·알림 동시 처리! 이벤트 기반 아키텍처."},
      {label:"시험 포인트", text:"Streams는 Lambda 트리거의 기반. Global Tables는 내부적으로 Streams 사용. Kinesis Data Streams도 선택 가능", easy:"DynamoDB 변경 → Lambda 자동 실행 → Streams! Global Tables도 Streams 기반으로 복제."},
    ]
  },
  dms: {
    title:"AWS Database Migration Service", subtitle:"데이터베이스 마이그레이션",
    easy:"DMS는 데이터베이스 이사 도우미야! Oracle에서 Aurora로, MySQL에서 PostgreSQL로 운영 중단 없이 데이터를 옮겨줘. 이사 중에도 서비스는 계속 운영돼!",
    points:[
      {label:"마이그레이션 유형", text:"동기종(MySQL→MySQL), 이기종(Oracle→Aurora). Full Load, CDC(지속 복제), Full Load+CDC", easy:"같은 DB엔진이면 바로 이전, 다른 엔진이면 Schema Conversion Tool(SCT)로 변환 후 이전."},
      {label:"CDC(Change Data Capture)", text:"이전 중에도 소스 DB 변경사항 실시간 복제. 다운타임 최소화", easy:"이사 중에 새로 들어온 물건도 자동으로 이사! 서비스 중단 없이 마이그레이션."},
      {label:"복제 인스턴스", text:"DMS Replication Instance로 처리. EC2 기반. 크기 선택 가능. Multi-AZ 옵션", easy:"중간에서 데이터를 읽고 쓰는 EC2 서버. 데이터 양에 따라 크기 선택."},
      {label:"지원 DB", text:"소스/목적지: RDS, Aurora, Redshift, DynamoDB, S3, MongoDB, DocumentDB, Kafka 등", easy:"거의 모든 DB에서 거의 모든 DB로 이전 가능. 온프레미스 → 클라우드도!"},
      {label:"시험 포인트", text:"이기종 DB 이전 → SCT + DMS. 동기종 → DMS만. 최소 다운타임 → CDC 사용", easy:"Oracle→Aurora(이기종) → SCT로 스키마 변환 후 DMS로 데이터 이전!"},
    ]
  },
  transferfamily: {
    title:"AWS Transfer Family", subtitle:"관리형 파일 전송 서비스",
    easy:"Transfer Family는 기존 SFTP 클라이언트로 S3에 파일을 올릴 수 있게 해주는 서비스야! 레거시 시스템을 변경하지 않고도 파일을 S3/EFS로 전송할 수 있어.",
    points:[
      {label:"지원 프로토콜", text:"SFTP(SSH FTP), FTPS(FTP over SSL), FTP, AS2(B2B 표준). 완전관리형 엔드포인트 제공", easy:"옛날 방식 SFTP/FTP 클라이언트 그대로 사용! AWS가 엔드포인트 관리."},
      {label:"스토리지 연결", text:"Amazon S3 또는 Amazon EFS에 파일 저장. 기존 S3 버킷 활용", easy:"SFTP로 올린 파일이 자동으로 S3나 EFS에 저장돼!"},
      {label:"인증", text:"서비스 관리형 사용자, Active Directory, LDAP, 커스텀 IdP(Lambda) 연동", easy:"회사 AD 계정 그대로 SFTP 로그인! 별도 계정 관리 불필요."},
      {label:"VPC 배포", text:"인터넷 또는 VPC 내부(프라이빗). EIP로 고정 IP. SG로 접근 제어", easy:"인터넷 공개 or VPC 내부 전용 선택. 고정 IP로 방화벽 설정 편리."},
      {label:"시험 포인트", text:"레거시 SFTP→S3 이전 → Transfer Family. AS2는 B2B 파트너 파일 교환. EDI 표준", easy:"SFTP 그대로 S3 사용 → Transfer Family! B2B 파일 교환(AS2) → Transfer Family!"},
    ]
  },
  appflow: {
    title:"Amazon AppFlow", subtitle:"SaaS↔AWS 데이터 통합",
    easy:"AppFlow는 Salesforce, Slack 같은 SaaS 서비스의 데이터를 AWS로 자동으로 가져오는 커넥터야! 코딩 없이 설정만으로 데이터 파이프라인을 만들 수 있어.",
    points:[
      {label:"지원 커넥터", text:"Salesforce, Marketo, Slack, ServiceNow, SAP, Google Analytics → S3, Redshift, EventBridge", easy:"Salesforce CRM 데이터를 S3로 자동 저장! 매일, 특정 이벤트 발생 시, 실시간으로."},
      {label:"데이터 변환", text:"이전 중 데이터 마스킹, 필터링, 검증, 포맷 변환. 민감 데이터 보호", easy:"SaaS에서 가져올 때 개인정보 마스킹, 필요한 필드만 선택 등 변환 가능."},
      {label:"보안", text:"전송 중·저장 중 암호화. PrivateLink로 인터넷 없이 전송. 감사 로그", easy:"데이터가 인터넷 노출 없이 AWS 내부 네트워크로만 이동해서 안전."},
      {label:"트리거", text:"온디맨드, 스케줄(분 단위), 이벤트 기반. 양방향(S3→Salesforce도 가능)", easy:"매일 밤 Salesforce → S3 자동 동기화! 또는 새 데이터 생기면 바로 이전."},
      {label:"시험 포인트", text:"SaaS→AWS 노코드 통합 → AppFlow. vs EventBridge: AppFlow는 데이터 이동, EB는 이벤트 라우팅", easy:"Salesforce/Slack 데이터 → AWS S3/Redshift → AppFlow! 코딩 없이 설정만으로!"},
    ]
  },
  cloudformation: {
    title:"AWS CloudFormation", subtitle:"Infrastructure as Code",
    easy:"CloudFormation은 AWS 인프라를 설계도(코드)로 만들고 자동으로 구축하는 서비스야! 클릭 대신 코드 한 장으로 VPC, EC2, RDS 등을 모두 자동 생성해줘.",
    points:[
      {label:"템플릿", text:"JSON/YAML 형식. Resources(필수), Parameters, Mappings, Outputs, Conditions, Metadata 섹션", easy:"레고 설명서야! Resources는 무엇을 만들지, Parameters는 입력값, Outputs는 결과 출력."},
      {label:"스택", text:"템플릿으로 생성된 AWS 리소스 집합. 스택 삭제 시 리소스 전체 삭제(DeletionPolicy 제외)", easy:"스택은 설명서로 만든 레고 완성품. 스택 삭제하면 레고 해체."},
      {label:"스택셋", text:"여러 계정·리전에 동시 배포. Organizations 통합. 중앙 집중 배포", easy:"같은 설계도로 여러 계정·리전에 동시에 구축! 표준화된 인프라 자동 배포."},
      {label:"드리프트 감지", text:"실제 리소스 설정이 템플릿과 달라졌는지 자동 감지", easy:"'누군가 콘솔에서 직접 수정했나?' 확인! 코드와 실제 상태 차이 감지."},
      {label:"시험 포인트", text:"IaC = CloudFormation. 롤백: 실패 시 자동. Change Set으로 변경 미리 확인. Nested Stack 재사용", easy:"인프라 코드화 → CloudFormation. 변경 전 검토 → Change Set. 모듈화 → Nested Stack!"},
    ]
  },
  awsconfig: {
    title:"AWS Config", subtitle:"리소스 설정 변경 기록 및 규정 준수",
    easy:"AWS Config는 AWS 리소스의 블랙박스야! 언제 누가 보안그룹을 바꿨는지, S3 버킷이 퍼블릭으로 바뀌었는지 모두 기록하고 규칙 위반 시 자동 알림!",
    points:[
      {label:"설정 기록", text:"모든 리소스의 설정 변경 기록. 시간대별 스냅샷. 누가 언제 무엇을 바꿨는지 추적", easy:"VPC, SG, S3 등 설정이 바뀔 때마다 사진 찍어 저장. 타임라인으로 조회 가능."},
      {label:"Config Rules", text:"AWS Managed Rules(150+), 커스텀 Rules(Lambda). 규정 준수 지속 평가", easy:"'S3 버킷이 퍼블릭이면 안 돼!' 규칙 설정 → 위반 시 자동 알림!"},
      {label:"자동 교정", text:"Remediation Actions. SSM Automation으로 비준수 리소스 자동 수정", easy:"규칙 위반 → 자동으로 수정! SG 포트 열렸으면 자동으로 닫기."},
      {label:"집계", text:"Organizations 전체 계정 설정 중앙 집계. Config Aggregator. 다중 리전", easy:"모든 계정의 규정 준수 상태를 한 화면에서 확인!"},
      {label:"시험 포인트", text:"CloudTrail(누가 했나) vs Config(무엇이 바뀌었나). 규정 준수 평가 → Config Rules. 비용: 기록당 과금", easy:"CloudTrail = 행동 기록(누가). Config = 상태 기록(무엇). 규정 준수 자동화 → Config!"},
    ]
  },
  controltower: {
    title:"AWS Control Tower", subtitle:"멀티 계정 Landing Zone",
    easy:"Control Tower는 AWS 환경의 건물 관리인이야! 여러 AWS 계정을 안전하고 표준화된 방식으로 자동 생성하고 관리해. 처음부터 보안이 잘 설정된 계정을 자동으로 만들어줘!",
    points:[
      {label:"Landing Zone", text:"멀티 계정 환경 자동 설정. 로그 아카이브 계정, 감사 계정 자동 생성. Organizations 통합", easy:"건물 기초 공사! 처음에 로그 저장소, 감사 계정 등을 자동으로 만들어줘."},
      {label:"가드레일", text:"예방 가드레일(SCP 기반): 금지된 작업 차단. 탐지 가드레일(Config 기반): 위반 감지", easy:"예방은 '못 하게 막기'(SCP), 탐지는 '잘못됐으면 알림'(Config Rules)."},
      {label:"Account Factory", text:"새 계정 자동 프로비저닝. 표준 설정 적용. Service Catalog 통합", easy:"새 AWS 계정 신청하면 자동으로 표준 설정이 완료된 계정 생성!"},
      {label:"대시보드", text:"모든 계정의 가드레일 준수 현황 한 눈에. 위반 계정 식별. 드리프트 감지", easy:"어느 계정이 규정 위반인지 한 화면에서 관리!"},
      {label:"시험 포인트", text:"멀티 계정 거버넌스 자동화 → Control Tower. SCP + Config Rules 조합. Account Factory로 표준화", easy:"새 팀에 AWS 계정 자동 발급 + 표준 보안 적용 → Control Tower!"},
    ]
  },
  trustedadvisor: {
    title:"AWS Trusted Advisor", subtitle:"모범 사례 자동 점검",
    easy:"Trusted Advisor는 AWS 계정의 건강검진 의사야! 비용 낭비, 보안 구멍, 성능 문제, 서비스 한도 초과 위험을 자동으로 점검해서 알려줘!",
    points:[
      {label:"5가지 점검 영역", text:"비용 최적화, 성능, 보안, 내결함성, 서비스 한도. 초록(정상)/노랑(주의)/빨강(위험)", easy:"체크리스트 5가지! 비용 낭비, 보안 구멍, 서비스 한도 초과 등을 자동 점검."},
      {label:"무료 vs 유료", text:"Basic/Developer: 7가지 핵심 보안/한도 점검. Business/Enterprise: 전체 점검 + API 접근", easy:"무료는 기본 점검만. Business 이상 구독하면 전체 점검 + 자동화 가능."},
      {label:"주요 점검 항목", text:"사용 안 하는 EBS/EIP, MFA 미설정 루트, 열린 보안그룹(0.0.0.0/0), 서비스 한도 80%", easy:"돈 낭비: 미사용 EBS. 보안: MFA 없는 루트. 한도: 90% 이상 사용 중인 서비스."},
      {label:"자동화", text:"EventBridge + Lambda로 Trusted Advisor 권고사항 자동 조치. 주간 이메일 알림", easy:"Trusted Advisor가 문제 발견 → Lambda가 자동 수정! 예: 미사용 EIP 자동 해제."},
      {label:"시험 포인트", text:"서비스 한도 증가 요청 → Support Center. Business/Enterprise 플랜에서 전체 점검. Compute Optimizer와 차이", easy:"서비스 한도 확인 → Trusted Advisor! 실제 한도 증가 → Support 케이스!"},
    ]
  },
  organizations: {
    title:"AWS Organizations", subtitle:"멀티 계정 중앙 관리",
    easy:"AWS Organizations는 여러 AWS 계정을 하나의 회사처럼 관리하는 시스템이야! 팀별로 계정을 분리하면서도 중앙에서 통제하고 청구서는 하나로 받을 수 있어.",
    points:[
      {label:"구조", text:"Management Account(루트) → Root → OU → Member Accounts. 계층적 정책 상속", easy:"회사 조직도처럼! 본사(Management) → 사업부(OU) → 팀(Member Account)."},
      {label:"SCP", text:"Service Control Policies. OU/계정별 최대 허용 권한 설정. IAM에 추가로 적용", easy:"SCP는 각 계정의 헌법! IAM이 모든 걸 허용해도 SCP에서 막으면 불가."},
      {label:"통합 결제", text:"모든 계정 청구서 통합. 볼륨 할인. 리저브드/세이빙플랜 공유. Cost Explorer 통합", easy:"계정이 10개여도 청구서 하나! 여러 계정 합산 사용량으로 볼륨 할인 적용."},
      {label:"서비스 통합", text:"AWS SSO, Config, CloudTrail, GuardDuty, Security Hub, Macie 등 Organizations 수준 활성화", easy:"보안 서비스를 모든 계정에 한 번에 적용! 새 계정 만들면 자동 적용."},
      {label:"시험 포인트", text:"통합 결제 → Organizations. 계정 간 권한 제한 → SCP. 서비스 중앙 관리 → Organizations", easy:"멀티 계정 관리, 청구서 통합, SCP 적용 모두 → AWS Organizations!"},
    ]
  },
  backup: {
    title:"AWS Backup", subtitle:"중앙 집중 백업 서비스",
    easy:"AWS Backup은 EC2, EBS, RDS, DynamoDB 등 여러 서비스의 백업을 한 곳에서 관리하는 서비스야! 백업 정책을 만들면 자동으로 모두 백업해줘.",
    points:[
      {label:"지원 서비스", text:"EC2, EBS, RDS/Aurora, DynamoDB, EFS, FSx, S3, Storage Gateway, DocumentDB, Neptune", easy:"거의 모든 AWS 데이터 서비스를 한 번에 백업! 각 서비스별로 따로 설정 불필요."},
      {label:"백업 정책(계획)", text:"Backup Plan: 스케줄(일/주/월), 보존 기간, 전환(콜드 스토리지), 리전 간 복사", easy:"'매일 자동 백업, 30일 보관, 오래된 건 Glacier로' 규칙 한 번 설정하면 자동 실행."},
      {label:"백업 볼트", text:"백업 저장소. 암호화(KMS). Vault Lock(WORM): 삭제 방지. 크로스 계정 공유", easy:"금고에 백업 보관! Vault Lock 걸면 관리자도 삭제 불가. 랜섬웨어 방어에 활용."},
      {label:"Organizations 통합", text:"중앙 백업 정책을 Organizations 전체에 적용. 모든 계정 자동 백업. 규정 준수", easy:"모든 계정에 동일한 백업 정책 자동 적용! 직원이 직접 설정 안 해도 됨."},
      {label:"시험 포인트", text:"중앙 집중 백업 → AWS Backup. Vault Lock = WORM. 크로스 리전 백업으로 재해 복구", easy:"여러 서비스 백업 중앙 관리 → AWS Backup! 삭제 방지 백업 → Vault Lock!"},
    ]
  },
  iamidentitycenter: {
    title:"IAM Identity Center", subtitle:"싱글 사인온(SSO) 서비스",
    easy:"IAM Identity Center는 AWS 계정과 앱 전체에 대한 통합 로그인 서비스야! 한 번 로그인하면 모든 AWS 계정과 Salesforce, Slack 등 앱에 접근할 수 있어.",
    points:[
      {label:"SSO", text:"Single Sign-On. 하나의 로그인으로 여러 AWS 계정·앱 접근. 유저 포털 제공", easy:"한 번 로그인 → 모든 AWS 계정 접근! 계정별로 로그인 반복 불필요."},
      {label:"ID 소스", text:"IAM Identity Center 자체, Active Directory(AD Connector/AWS Managed AD), 외부 IdP(Okta, Azure AD)", easy:"회사 AD 계정으로 AWS 로그인! Okta, Azure AD도 연결 가능."},
      {label:"권한 셋", text:"Permission Set: 역할 집합을 계정에 할당. OU 또는 계정별 다른 권한. SCP와 독립적", easy:"개발팀에는 개발 계정 관리자, 운영팀에는 운영 계정 읽기 권한 각각 할당."},
      {label:"SCIM 자동 프로비저닝", text:"IdP에서 사용자 추가/삭제 시 자동 동기화. 수동 관리 불필요", easy:"HR에서 직원 추가하면 자동으로 AWS 접근 권한 생성! 퇴직 시 자동 삭제."},
      {label:"시험 포인트", text:"멀티 계정 SSO → IAM Identity Center. Cognito는 앱 사용자 인증, IAM Identity Center는 AWS 계정 접근", easy:"직원 AWS 로그인 통합 관리 → IAM Identity Center! 앱 회원가입/로그인 → Cognito!"},
    ]
  },
  emr: {
    title:"Amazon EMR", subtitle:"관리형 빅데이터 처리",
    easy:"EMR은 Hadoop, Spark를 AWS 클러스터에서 쉽게 실행하게 해주는 서비스야! 빅데이터를 분석하고 처리하는 작업을 EC2 대신 관리형으로 쓸 수 있어.",
    points:[
      {label:"지원 프레임워크", text:"Apache Spark, Hadoop, Hive, Presto, HBase, Flink, Hudi, Iceberg. JupyterHub 통합", easy:"Spark로 수백 TB 데이터 처리, Hive로 대용량 SQL, HBase는 NoSQL — 모두 EMR에서!"},
      {label:"클러스터 구성", text:"Primary Node(조율), Core Node(처리+저장), Task Node(처리만). Spot Instance로 비용 절감", easy:"공장장(Primary) + 생산직(Core) + 임시직(Task). Task를 Spot으로 쓰면 80% 절감!"},
      {label:"스토리지", text:"HDFS(임시), EMR File System(EMRFS, S3 연동), Local. S3를 데이터 레이크로", easy:"S3를 영구 저장소로, HDFS는 임시 작업 공간. 클러스터 종료해도 S3 데이터 유지."},
      {label:"EMR Serverless", text:"클러스터 관리 없이 Spark/Hive 잡 실행. 자동 스케일링. 초 단위 과금", easy:"클러스터 설정 없이 코드만! 알아서 서버 준비하고 처리하고 반납."},
      {label:"시험 포인트", text:"빅데이터 처리(Spark/Hadoop) → EMR. S3 데이터 레이크 + EMR 조합. Spot으로 비용 절감", easy:"수백 TB 데이터 처리, ML 학습 데이터 준비 → EMR! Spot Instance로 비용 90% 절감 가능!"},
    ]
  },
  glue: {
    title:"AWS Glue", subtitle:"서버리스 ETL 서비스",
    easy:"Glue는 데이터 변환 공장이야! S3, RDS, DynamoDB 등에서 데이터를 꺼내서 깨끗하게 정리하고 다른 곳에 넣는 작업을 서버 없이 자동으로 해줘.",
    points:[
      {label:"ETL 작업", text:"서버리스 Apache Spark 기반. Python/Scala 스크립트 자동 생성. 스케줄 또는 이벤트 실행", easy:"S3 원본 데이터를 꺼내서(Extract), 정리하고(Transform), 분석DB에 넣는(Load) 자동화."},
      {label:"데이터 카탈로그", text:"중앙 메타데이터 저장소. Athena, Redshift Spectrum, EMR과 공유. Glue Crawler로 자동 수집", easy:"'S3 어디에 어떤 데이터가 있는지' 자동으로 조사해서 목록 만들기(Crawler)."},
      {label:"Glue DataBrew", text:"노코드 시각적 데이터 준비·정리. 250+ 변환 함수. 비개발자도 사용", easy:"코딩 없이 클릭으로 데이터 정리! 엑셀처럼 데이터 변환 작업 가능."},
      {label:"Glue Studio", text:"시각적 ETL 파이프라인 설계. 드래그 앤 드롭. 실시간 모니터링", easy:"그림 그리듯 ETL 파이프라인 연결! 코드 안 짜도 시각적으로 구성."},
      {label:"시험 포인트", text:"서버리스 ETL → Glue. 데이터 카탈로그 → Glue Catalog. Athena 쿼리 전 Crawler 실행", easy:"S3 데이터 변환/정리 → Glue ETL! Athena가 S3 쿼리하려면 Glue Catalog 필요!"},
    ]
  },
  lakeformation: {
    title:"AWS Lake Formation", subtitle:"데이터 레이크 구축 및 보안",
    easy:"Lake Formation은 데이터 레이크(S3 기반 대용량 데이터 저장소)를 쉽게 만들고 '이 사람은 이 컬럼만 볼 수 있어'처럼 세밀하게 접근을 제어하는 서비스야!",
    points:[
      {label:"데이터 레이크 구축", text:"S3 기반. 데이터 가져오기·정리·분류 자동화. Glue와 긴밀 통합", easy:"원시 데이터를 S3에 모아두고 Lake Formation이 정리·보안·접근 제어 담당."},
      {label:"세밀한 접근 제어", text:"열(Column), 행(Row), 셀(Cell) 레벨 접근 제어. 데이터 마스킹. 태그 기반 제어(LF-Tags)", easy:"'마케팅팀은 고객 이름 컬럼 못 봐', '개인 정보는 마스킹' 같은 세밀한 통제."},
      {label:"통합 서비스", text:"Athena, Redshift Spectrum, EMR, Glue, QuickSight와 통합. 중앙 권한 관리", easy:"모든 분석 서비스에 일관된 접근 제어 적용. Lake Formation 한 곳에서 권한 관리."},
      {label:"블루프린트", text:"데이터 수집 자동화 템플릿. RDS/S3→데이터 레이크 파이프라인 자동 구축", easy:"클릭 몇 번으로 RDS 데이터를 S3 데이터 레이크로 자동 적재하는 파이프라인 생성."},
      {label:"시험 포인트", text:"데이터 레이크 세밀한 권한 → Lake Formation. S3 IAM만으론 행/열 수준 제어 불가", easy:"S3 데이터 레이크 + 행·열 수준 접근 제어 → Lake Formation! IAM/S3 정책만으론 불가!"},
    ]
  },
  quicksight: {
    title:"Amazon QuickSight", subtitle:"서버리스 클라우드 BI",
    easy:"QuickSight는 데이터를 시각적 그래프로 보여주는 서버리스 BI 도구야! S3, RDS, Redshift 등 데이터를 연결하면 바로 대시보드와 차트를 만들 수 있어.",
    points:[
      {label:"데이터 소스", text:"S3, Athena, RDS/Aurora, Redshift, DynamoDB, Salesforce, 외부 DB 연결", easy:"거의 모든 AWS 데이터 소스 연결 가능. 클릭 몇 번으로 바로 차트 생성!"},
      {label:"SPICE", text:"Super-fast Parallel In-memory Calculation Engine. 데이터 메모리 캐싱. 빠른 쿼리 응답", easy:"데이터를 메모리에 미리 올려둬서 대시보드가 빠르게 로딩!"},
      {label:"ML Insights", text:"Anomaly Detection(이상 탐지), Forecasting(예측), Auto-Narratives(자동 설명 생성)", easy:"AI가 '이번 달 매출이 비정상적으로 낮아요' 자동 탐지! 추세 예측도 자동으로."},
      {label:"임베디드 분석", text:"외부 앱에 대시보드 임베딩. SDK. Q(자연어 쿼리). 익명 접근 가능", easy:"'고객 앱에 분석 대시보드 넣기'! QuickSight를 앱에 내장 가능."},
      {label:"시험 포인트", text:"서버리스 BI 시각화 → QuickSight. Redshift와 조합. 사용자당 과금(Standard/Enterprise)", easy:"데이터 시각화·대시보드 → QuickSight! 다른 BI 툴 대신 AWS 네이티브 선택."},
    ]
  },
  sagemaker: {
    title:"Amazon SageMaker", subtitle:"완전관리형 ML 플랫폼",
    easy:"SageMaker는 ML 모델을 만들고 학습시키고 배포하는 모든 과정을 지원하는 서비스야! 데이터 준비부터 모델 배포까지 한 플랫폼에서 가능해.",
    points:[
      {label:"SageMaker Studio", text:"통합 ML 개발 환경. JupyterLab 기반. 데이터 준비→학습→배포 전 과정", easy:"ML을 위한 통합 IDE! 주피터 노트북 + 데이터 관리 + 실험 추적을 한 화면에서."},
      {label:"학습", text:"관리형 학습 인스턴스(GPU). 분산 학습. Spot Instance 활용(최대 90% 절감). 실험 추적", easy:"GPU 서버 관리 없이 학습 시작! Spot으로 학습 비용 90% 절감 가능."},
      {label:"배포", text:"Real-time Endpoint(낮은 지연), Serverless(간헐적 트래픽), Batch Transform(대량 추론)", easy:"웹서비스 API 형태로 모델 배포! 트래픽 없을 때 비용 0인 서버리스 옵션도."},
      {label:"Autopilot & Canvas", text:"AutoML: 자동 피처 엔지니어링·모델 선택·하이퍼파라미터 튜닝. Canvas: 노코드 ML", easy:"Autopilot은 데이터 넣으면 최적 모델 자동 선택! Canvas는 코딩 없이 ML 가능."},
      {label:"시험 포인트", text:"ML 모델 학습·배포 → SageMaker. Feature Store, Model Registry, Pipelines. Rekognition과 차이", easy:"ML 모델 직접 만들기 → SageMaker. 기성 AI API(이미지 인식 등) → Rekognition!"},
    ]
  },
};

export const CONCEPTS_JA: Record<string, Concept> = {
  ec2: {
    title:"Amazon EC2", subtitle:"Elastic Compute Cloud",
    easy:"EC2はインターネット上の自分のコンピューター! 必要な時だけ借りて料金を払う仕組み。常に使うなら事前に予約すると最大72%安く使える。",
    points:[
      {label:"インスタンス購入オプション", text:"On-Demand(柔軟), Reserved(1~3年契約 最大72%割引), Spot(最大90%割引、いつでも終了可能), Dedicated Host(物理サーバー専用)", easy:"On-Demandは当日レンタル(高い), Reservedは1年長期契約(安い), Spotは空き車の超特価でいつでも返却可能。"},
      {label:"AMI", text:"Amazon Machine Image. インスタンスのOS・ソフトウェアテンプレート。カスタムAMIで高速デプロイ可能。リージョン間でコピー可能", easy:"クッキー型のようなもの! 1つの型(AMI)を作ったら、同じ形のクッキー(サーバー)をいくつでも素早く量産できる。"},
      {label:"Placement Group", text:"Cluster(同じAZ、低レイテンシ), Spread(異なるハードウェア、障害の分離), Partition(大規模分散システム)", easy:"教室の座席配置のようなもの! Clusterはチームメンバー固まって座る(素早い通信), Spreadはわざと離れて座る(一人が欠席しても他のチーム影響なし)。"},
      {label:"ストレージ", text:"EBS(永続ブロック), Instance Store(一時的・高速), EFS(共有ファイルシステム)", easy:"EBSは個人ロッカー(オフでも保持), Instance Storeは机の上のメモ(オフで消える), EFSは共用キャビネット(みんなで使える)。"},
      {label:"試験ポイント", text:"Spot Instance中断時に2分警告。Reservedはスコープを選択可(AZまたはリージョン)。HibernateでRAM保持状態で停止可能", easy:"Spotはカラオケの空き部屋 — 他の客が予約したら2分以内に出ないといけない! HibernateはノートPC省電力モード — オフにして再度オンにしても作業が同じままだ。"},
    ]
  },
};

