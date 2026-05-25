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

export { CONCEPTS_KO } from './CONCEPTS_KO';

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

