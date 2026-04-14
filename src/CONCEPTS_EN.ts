export type Concept = {
  title: string;
  subtitle: string;
  easy: string;
  points: Array<{
    label: string;
    text: string;
    easy: string;
  }>;
};

export const CONCEPTS_EN: Record<string, Concept> = {
  ec2: {
    title: "Amazon EC2",
    subtitle: "Elastic Compute Cloud",
    easy: "EC2 is my computer on the internet! I can turn it on and off like a PC at home, but it's in an AWS data center. I pay only for what I use. If I use it always, I can reserve it in advance and save up to 72%.",
    points: [
      {
        label: "Instance Purchase Options",
        text: "On-Demand(flexible), Reserved(1-3 year commitment save up to 72%), Spot(save up to 90%, can terminate anytime), Dedicated Host(physical server exclusive)",
        easy: "It's like a rental car! On-Demand is same-day rental(expensive), Reserved is a 1-year contract(cheap), Spot is a super discount but can be taken away anytime."
      },
      {
        label: "AMI",
        text: "Amazon Machine Image. Instance OS/software template. Quick deployment with custom AMI. Can copy across regions",
        easy: "It's a cookie cutter! Once I make a cutter(AMI), I can quickly stamp out identical cookies(servers) as many as I want."
      },
      {
        label: "Placement Group",
        text: "Cluster(same AZ, low latency), Spread(different hardware, fault isolation), Partition(large-scale distributed systems)",
        easy: "It's like seating arrangement in a classroom! Cluster is sitting together(fast communication), Spread is sitting far apart(if one person is absent, other teams aren't affected)."
      },
      {
        label: "Storage",
        text: "EBS(permanent block), Instance Store(temporary, fast), EFS(shared file system)",
        easy: "EBS is a personal locker(persists when off), Instance Store is a memo on desk(disappears when off), EFS is a shared cabinet(multiple people use it)."
      },
      {
        label: "Exam Points",
        text: "Spot Instance termination: 2-minute warning. Reserved has AZ or Region scope. Hibernate maintains RAM while stopped",
        easy: "Spot is an empty karaoke room - if someone else books it, I have to leave in 2 minutes! Hibernate is laptop sleep mode - resume and everything is still there."
      }
    ]
  },
  lambda: {
    title: "AWS Lambda",
    subtitle: "Serverless Function Execution",
    easy: "Lambda is an errand boy! He only runs and handles the job when a file is uploaded, then disappears. No need to keep it running, so cost is almost zero!",
    points: [
      {
        label: "Execution Limits",
        text: "Max execution time 15 minutes, memory 128MB-10GB, /tmp storage 512MB-10GB, default concurrent execution 1000",
        easy: "Lambda is a sprinter. Must finish in 15 minutes. For long tasks, use ECS instead."
      },
      {
        label: "Triggers",
        text: "API Gateway, S3, DynamoDB Streams, SQS, SNS, EventBridge, ALB, Cognito, etc.",
        easy: "It's an alarm! When a signal like 'file uploaded' or 'message arrived' comes, it automatically wakes up and works."
      },
      {
        label: "Concurrency",
        text: "Reserved Concurrency(limit max concurrent execution), Provisioned Concurrency(prevent cold start, pre-warm)",
        easy: "Reserved is setting a limit like 'maximum 10 errand boys', Provisioned is keeping them on standby in advance."
      },
      {
        label: "Deployment",
        text: "Zip file or Container Image(max 10GB). Share common libraries with Lambda Layer",
        easy: "Zip is packing a bento box to send, Container Image is delivering an entire restaurant. Layer is a shared tool warehouse."
      },
      {
        label: "Exam Points",
        text: "Deploying in VPC creates ENI → cold start increases. Jobs over 15 minutes use ECS/Fargate. SQS enables batch processing",
        easy: "If you put Lambda inside VPC, cold start gets longer. Jobs over 15 minutes - let ECS handle them!"
      }
    ]
  },
  s3: {
    title: "Amazon S3",
    subtitle: "Simple Storage Service",
    easy: "S3 is a huge internet warehouse! Can store anything - photos, videos, files - unlimited capacity. Store frequently accessed items near the entrance(Standard), rarely accessed items deep in warehouse(Glacier) to save storage costs.",
    points: [
      {
        label: "Storage Classes",
        text: "Standard → Standard-IA → One Zone-IA → Glacier Instant → Glacier Flexible → Deep Archive (cost order)",
        easy: "Like organizing a house! Frequently used in living room(Standard), sometimes used in storage(IA), rarely used in frozen basement(Glacier). Farther away is less convenient but cheaper."
      },
      {
        label: "Security",
        text: "Bucket Policy(resource-based), IAM Policy(user-based), ACL(legacy), Presigned URL(temporary access), OAC",
        easy: "Bucket Policy is warehouse door rules, IAM is employee ID card, Presigned URL is temporary visitor pass."
      },
      {
        label: "Features",
        text: "Versioning, MFA Delete, Replication(CRR/SRR), Lifecycle(auto conversion/deletion)",
        easy: "Like Google Docs version history! Previous versions are kept, so you can recover from accidental deletion."
      },
      {
        label: "Performance",
        text: "3,500 PUT / 5,500 GET per second per prefix. Multipart upload(recommended for 100MB+, required for 5GB+)",
        easy: "Divide large package into pieces and send simultaneously(multipart). Multiple boxes = faster!"
      },
      {
        label: "Exam Points",
        text: "S3 bucket is global but data stored in region. CORS settings. Static website hosting possible",
        easy: "S3 bucket name must be unique worldwide. Data stored in the region you choose."
      }
    ]
  },
  rds: {
    title: "Amazon RDS",
    subtitle: "Relational Database Service",
    easy: "RDS is a data warehouse organized like Excel! AWS manages it, so backups are automatic. Multi-AZ stores the same content in another warehouse, Read Replica creates multiple read-only copies.",
    points: [
      {
        label: "Multi-AZ",
        text: "Synchronous replication(Standby). Auto failover 60-120 seconds on failure. No read access(standby is waiting). DNS record changes",
        easy: "It's an emergency backup hospital! If main hospital closes, backup hospital automatically opens in 1-2 minutes. Backup hospital just waits normally."
      },
      {
        label: "Read Replica",
        text: "Asynchronous replication. For read distribution. Can be in different region. Can promote to independent DB. Max 5",
        easy: "It's a textbook copy! When the original is busy, multiple copies let everyone read together."
      },
      {
        label: "Backups",
        text: "Automatic backup(1-35 days), manual snapshot(indefinite retention)",
        easy: "Automatic backup is a daily automatic photo, snapshot is a photo I take manually and keep forever."
      },
      {
        label: "Encryption",
        text: "Set KMS encryption at creation. Cannot change after(snapshot → copy → encrypted restore needed)",
        easy: "Can only choose lock when making safe. To change later, must take out contents and put in new safe."
      },
      {
        label: "Exam Points",
        text: "Multi-AZ ≠ read distribution(that's Read Replica). RDS Proxy for Lambda connection pooling. Storage auto-scales",
        easy: "Multi-AZ is 'safety'(backup), Read Replica is 'speed'(distribution). Definitely appears on exam!"
      }
    ]
  },
  aurora: {
    title: "Amazon Aurora",
    subtitle: "AWS Optimized Relational Database",
    easy: "Aurora is the super version of RDS! Stores 6 copies across 3 AZs. 5x faster than MySQL but similar price!",
    points: [
      {
        label: "Architecture",
        text: "Storage auto 10GB-128TB. 6 copies across 3 AZs. 2 failures still allow writes, 3 failures still allow reads",
        easy: "Like placing the same book in 3 libraries with 6 copies each. Even if 2 libraries burn down, the book is safe."
      },
      {
        label: "Performance",
        text: "5x faster than MySQL, 3x faster than PostgreSQL. Aurora Parallel Query",
        easy: "If regular RDS is a bicycle, Aurora is a sports car. MySQL code runs 5x faster!"
      },
      {
        label: "Features",
        text: "Aurora Serverless v2: auto-scaling. Global Database: <1 second cross-region replication",
        easy: "Serverless v2 automatically adjusts tables based on customer count. Global DB reflects Korea→US in under 1 second."
      },
      {
        label: "Aurora vs RDS",
        text: "Aurora: when high performance/high availability needed. RDS: when specific engine needed like Oracle, SQL Server",
        easy: "Aurora is AWS's special high-performance engine, RDS is for when you want a specific company's database."
      },
      {
        label: "Exam Points",
        text: "Aurora Replica shares identical storage(no replication lag). Backtrack to rewind to specific point in time",
        easy: "Aurora Replica shares same warehouse so copy time approaches zero."
      }
    ]
  },
  vpc: {
    title: "Amazon VPC",
    subtitle: "Virtual Private Cloud",
    easy: "VPC is my fenced neighborhood in AWS! Public Subnet is accessible from internet, Private Subnet is accessible from within only.",
    points: [
      {
        label: "Components",
        text: "Subnet(Public/Private), Route Table, IGW, NAT Gateway, VPC Peering",
        easy: "Public area is accessible to outsiders, Private area is residents only. IGW is main gate, NAT is side door."
      },
      {
        label: "Security",
        text: "Security Group: Stateful, allow-only. NACL: Stateless, allow+deny, subnet level",
        easy: "SG is front door of a house(auto allow), NACL is neighborhood guard(checks both). SG only allows, NACL also denies."
      },
      {
        label: "Connectivity",
        text: "VPN, Direct Connect(dedicated line), Transit Gateway(multiple VPC hub connection)",
        easy: "VPN is regular road, Direct Connect is dedicated highway, Transit Gateway is hub intersection."
      },
      {
        label: "Endpoints",
        text: "Gateway Endpoint: S3, DynamoDB(free). Interface Endpoint: others(ENI, costs)",
        easy: "When accessing S3 from within VPC, Gateway Endpoint is like a free branch office!"
      },
      {
        label: "Exam Points",
        text: "SG is Stateful, NACL is Stateless. NAT Gateway located in Public Subnet",
        easy: "SG is smart(auto allow), NACL is picky(must set both). NAT must be installed in public area!"
      }
    ]
  },
  iam: {
    title: "AWS IAM",
    subtitle: "Identity and Access Management",
    easy: "IAM is a company ID card management system! Give each employee an ID, group permissions by team.",
    points: [
      {
        label: "Components",
        text: "User(individual), Group(collection), Role(temporary permission delegation), Policy(JSON permission document)",
        easy: "User is employee, Group is team, Role is temporary ID, Policy is rule book."
      },
      {
        label: "Policy Types",
        text: "Identity-based, Resource-based, Permission Boundary, SCP(Organizations)",
        easy: "Identity-based is employee ID permissions, Resource-based is door guidance sign, SCP is company top-level rule."
      },
      {
        label: "STS",
        text: "AssumeRole for temporary credentials. Cross-account access, EC2 Instance Profile, Web Identity Federation",
        easy: "STS is temporary pass issuer! Issues time-limited temporary passes to other accounts or external people."
      },
      {
        label: "Best Practice",
        text: "Don't use root account, MFA, least privilege principle, rotate Access Keys, audit with CloudTrail",
        easy: "Root account is CEO's stamp - can't use daily. Grant only minimum permissions!"
      },
      {
        label: "Exam Points",
        text: "Policy evaluation: explicit Deny > SCP > Permission Boundary > Identity > Resource Policy",
        easy: "If there's an explicit Deny, it's blocked no matter what! Even if other allows exist, one Deny blocks everything."
      }
    ]
  },
  sqs: {
    title: "Amazon SQS",
    subtitle: "Simple Queue Service",
    easy: "SQS is a mailbox! Put letters in it, delivery person takes them out and processes later. Even if busy, letters are safely stored!",
    points: [
      {
        label: "Types",
        text: "Standard: minimum 1 delivery(duplicates possible), no order guarantee, high throughput. FIFO: exactly once, order guaranteed, 300-3000 TPS",
        easy: "Standard is regular mail(fast but may deliver twice), FIFO is registered mail(slow but exactly once, order guaranteed)."
      },
      {
        label: "Key Settings",
        text: "Visibility Timeout(default 30 seconds), Message Retention(1 minute-14 days), Max Size: 256KB",
        easy: "Visibility Timeout is hiding the message after delivery person picks it up so others can't see it."
      },
      {
        label: "DLQ",
        text: "Dead Letter Queue. Isolate failed messages. Move after maxReceiveCount exceeded",
        easy: "Special mailbox for failed deliveries. Can check later why delivery failed."
      },
      {
        label: "Long Polling",
        text: "Reduce empty queue polling to save costs. WaitTimeSeconds 1-20 seconds. Recommended over Short Polling",
        easy: "Short Polling checks every 1 second, Long Polling waits 'up to 20 seconds for letter to arrive'."
      },
      {
        label: "Exam Points",
        text: "SQS → Lambda batch processing. Fan-out: SNS → multiple SQS. FIFO requires .fifo suffix",
        easy: "Fan-out is when SNS broadcasts and multiple SQS receive simultaneously."
      }
    ]
  },
  cloudwatch: {
    title: "Amazon CloudWatch",
    subtitle: "Monitoring & Observation Service",
    easy: "CloudWatch is AWS's CCTV + alarm system! Watches server status and alerts when something goes wrong!",
    points: [
      {
        label: "Metrics",
        text: "Basic 5 minutes(free), detailed 1 minute(paid). Custom metrics possible",
        easy: "Basic CCTV takes photo every 5 minutes(free), HD takes every 1 minute(paid)."
      },
      {
        label: "Logs",
        text: "Log Group → Log Stream. Log Insights for queries. Metric Filter converts logs→metrics",
        easy: "Log Group is diary, Log Stream is dated pages. Insights lets you search like Google."
      },
      {
        label: "Alarms",
        text: "OK/ALARM/INSUFFICIENT_DATA. Actions: SNS, EC2 stop/terminate, ASG scaling",
        easy: "If CPU exceeds 90%, get text alert! If critical, auto-scale servers(ASG)."
      },
      {
        label: "Events/EventBridge",
        text: "Detect AWS events → automate. Cron/Rate schedule execution",
        easy: "Set automation rules like 'backup every night at 12am'."
      },
      {
        label: "Exam Points",
        text: "EC2 memory/disk are not basic metrics → CloudWatch Agent needed. Cross-account collection possible",
        easy: "EC2 memory monitoring requires Agent installation! Frequently on exam."
      }
    ]
  },
  elb: {
    title: "AWS Elastic Load Balancer",
    subtitle: "Load Balancing Service",
    easy: "ELB is a traffic dispatcher! Distributes customer traffic across multiple servers so no single server gets overloaded.",
    points: [
      {
        label: "Types",
        text: "ALB(Application, Layer 7), NLB(Network, Layer 4), CLB(Classic, Layer 4/7, legacy)",
        easy: "ALB for web apps(smart), NLB for extreme speed(dumb but fast), CLB is old version."
      },
      {
        label: "Health Checks",
        text: "Regularly test servers. Unhealthy instances removed. Healthy ones added back",
        easy: "Constantly ping servers - if no response, stop sending traffic."
      },
      {
        label: "Stickiness",
        text: "Cookie-based stickiness: same customer goes to same server. Useful for session data",
        easy: "Like restaurant loyalty - regular customer goes to favorite table."
      },
      {
        label: "Cross-Zone LB",
        text: "Distribute traffic evenly across AZs. Small cost but better availability",
        easy: "Balance traffic across multiple zones so one zone failure doesn't hurt."
      },
      {
        label: "Exam Points",
        text: "ALB for microservices(hostname routing). NLB for extreme throughput. Target Group health",
        easy: "ALB smart routing, NLB crazy fast, CLB forget about it!"
      }
    ]
  },
  dynamodb: {
    title: "Amazon DynamoDB",
    subtitle: "Serverless NoSQL Database",
    easy: "DynamoDB is like a drawer cabinet! Can store anything freely in each drawer(item), read/write millions per second!",
    points: [
      {
        label: "Capacity Modes",
        text: "On-Demand: auto-handle traffic, unpredictable workload. Provisioned: set RCU/WCU, cheaper, auto-scaling",
        easy: "On-Demand auto-handles any customer count(expensive), Provisioned pre-plan for 100 customers(cheap but errors if exceed)."
      },
      {
        label: "Keys",
        text: "Partition Key(must have), Sort Key(optional). Together form unique identifier",
        easy: "Partition Key is filing cabinet drawer, Sort Key is file order in drawer."
      },
      {
        label: "Indexes",
        text: "GSI(Global Secondary Index): different partition/sort keys. LSI(Local): same partition, different sort",
        easy: "GSI is entirely new filing system, LSI is reordering same drawer."
      },
      {
        label: "TTL",
        text: "Time To Live. Auto-delete items after timestamp. Reduces storage costs",
        easy: "Like expiration date - automatically delete old items."
      },
      {
        label: "Exam Points",
        text: "DynamoDB Streams for CDC(Change Data Capture) → Lambda. On-Demand for unpredictable",
        easy: "Streams catch changes, trigger Lambda. On-Demand for unknown patterns."
      }
    ]
  },
  kms: {
    title: "AWS Key Management Service",
    subtitle: "Encryption Key Management",
    easy: "KMS is a locksmith service! Create and manage encryption keys. Encrypt sensitive data with customer-managed keys.",
    points: [
      {
        label: "Key Types",
        text: "AWS managed(free), Customer managed(pay per use), AWS owned(no control)",
        easy: "AWS managed = free house lock, Customer managed = you control lock, AWS owned = AWS lock."
      },
      {
        label: "Key Rotation",
        text: "Automatic rotation every year. Manual rotation if needed. Backward compatible",
        easy: "Like changing office locks yearly - old keys still work(backward compatible)."
      },
      {
        label: "Grants",
        text: "Delegate key access temporarily. Useful for cross-account access",
        easy: "Temporarily let someone borrow your key without changing permissions."
      },
      {
        label: "Encryption",
        text: "Encrypt data at rest(S3, RDS, EBS) and in transit(TLS/HTTPS)",
        easy: "Data locked at rest, locked during transport."
      },
      {
        label: "Exam Points",
        text: "KMS for encryption. CMK(Customer Master Key) for control. Envelope encryption",
        easy: "Control = CMK. Envelope = encrypt data key with master key."
      }
    ]
  },
  cloudfront: {
    title: "Amazon CloudFront",
    subtitle: "Content Delivery Network",
    easy: "CloudFront is like having delivery branches worldwide! Users in Tokyo get content from Tokyo server, not America server. Way faster!",
    points: [
      {
        label: "Edge Locations",
        text: "450+ edge locations globally. Cache static content. Origin: S3, EC2, ALB, custom",
        easy: "Like convenience stores everywhere - serve content from nearest store."
      },
      {
        label: "Caching",
        text: "Default 24 hours. TTL configurable. Invalidate cache with wildcard/paths",
        easy: "Cache content locally for speed. Refresh when content changes."
      },
      {
        label: "Security",
        text: "HTTPS/TLS. WAF integration. Origin access control(OAC). Field-level encryption",
        easy: "Secure data in transit. Prevent attacks. Encrypt sensitive fields."
      },
      {
        label: "Price Classes",
        text: "All: all edge locations. 100: exclude expensive regions. 200: exclude most expensive",
        easy: "All = most expensive, 100 = medium, 200 = cheapest. Tradeoff speed vs cost."
      },
      {
        label: "Exam Points",
        text: "CloudFront vs S3: CF for edge caching, S3 for storage. CF invalidation = cache refresh",
        easy: "Need speed globally? CloudFront. Need storage? S3. Why not both?"
      }
    ]
  },
  route53: {
    title: "Amazon Route 53",
    subtitle: "Domain Name System & Traffic Routing",
    easy: "Route 53 is the internet phone directory! Converts www.example.com to actual IP address instantly.",
    points: [
      {
        label: "Routing Policies",
        text: "Simple, Weighted, Latency-based, Failover, Geolocation, Geoproximity, Multi-value",
        easy: "Weighted for A/B testing, Latency for fastest server, Failover for backup server."
      },
      {
        label: "Health Checks",
        text: "Monitor endpoints. 15 global health checkers. Essential with Failover",
        easy: "Every 30 seconds ask servers 'are you alive?'. No response = route to backup."
      },
      {
        label: "Record Types",
        text: "A(IPv4), AAAA(IPv6), CNAME(domain→domain), Alias(AWS resources, Zone Apex compatible, free)",
        easy: "A = name→address, CNAME = name→different name, Alias = AWS-only and free."
      },
      {
        label: "Domain",
        text: "Can purchase domains. Public vs Private Hosted Zone. DNSSEC support",
        easy: "Can buy domain from Route 53. Private is internal phone directory for VPC only."
      },
      {
        label: "Exam Points",
        text: "Alias for ELB, CloudFront, S3. CNAME not possible at Zone Apex. Always choose Alias!",
        easy: "Cannot use CNAME at root domain, Alias only! For AWS services, always use Alias!"
      }
    ]
  },
  sns: {
    title: "Amazon SNS",
    subtitle: "Simple Notification Service",
    easy: "SNS is a broadcast system! Shout into microphone(Topic) 'Lunch is ready!' and all students(subscribers) hear simultaneously. Can send to SQS, Lambda, email at same time!",
    points: [
      {
        label: "Overview",
        text: "Pub/Sub messaging. Publisher → Topic → Subscribers. Subscribers: SQS, Lambda, Email, SMS, HTTP, Kinesis Firehose",
        easy: "It's like radio broadcast! Broadcasting station(Publisher) broadcasts to airwaves(Topic), and radios(subscribers) receive simultaneously. Can add subscribers endlessly."
      },
      {
        label: "Message Filtering",
        text: "Filter policies per subscription. Each subscriber receives only matching messages",
        easy: "Like email filters - subscriber only gets messages matching their filter rule."
      },
      {
        label: "Delivery",
        text: "Push to HTTP endpoints, pull from SQS, trigger Lambda, notify email/SMS",
        easy: "SNS pushes messages to different places simultaneously - like a mail sorting center."
      },
      {
        label: "Fan-out Pattern",
        text: "SNS → multiple SQS for parallel processing. Each SQS gets full message copy",
        easy: "One SNS message fans out to 10 SQS - like one announcement to 10 different groups."
      },
      {
        label: "Exam Points",
        text: "SNS push ≠ SQS pull. SNS-SQS fan-out for durable async processing. FIFO SNS-SQS support",
        easy: "SNS shouts(push), SQS stores(pull). Together = durable broadcast!"
      }
    ]
  },
  kinesis: {
    title: "Amazon Kinesis",
    subtitle: "Real-Time Data Streaming",
    easy: "Kinesis is conveyor belt for data! Stream massive data in real-time. Like assembly line for information - continuous flow.",
    points: [
      {
        label: "Kinesis Data Streams",
        text: "Producers → Shards → Consumers. 24-hour retention(configurable). Partition key for shard routing",
        easy: "Like lanes on highway. Each lane handles traffic independently. Data automatically routed to lanes."
      },
      {
        label: "Kinesis Firehose",
        text: "Deliver data to S3, Redshift, Splunk, DataDog. Fully managed. ETL optional",
        easy: "Automatic conveyor to warehouse. Transform data if needed. No capacity management."
      },
      {
        label: "Consumers",
        text: "Application, Lambda, Kinesis Analytics, DynamoDB. Parallel consumption per shard",
        easy: "Multiple workers handle same lane independently. Massive parallelism."
      },
      {
        label: "Scaling",
        text: "Add shards to scale. Each shard = 1MB/sec write. Use TPS = RPS x record size",
        easy: "Traffic increasing? Add lanes(shards). Each lane handles 1MB/sec."
      },
      {
        label: "Exam Points",
        text: "Kinesis Streams for real-time, Firehose for delivery. SQS for batch, Kinesis for streaming",
        easy: "SQS = batch processing, Kinesis = real-time streaming. Different tools, different speed!"
      }
    ]
  },
  elasticache: {
    title: "Amazon ElastiCache",
    subtitle: "In-Memory Cache Service",
    easy: "ElastiCache is super-fast memory storage! Like keeping frequently used books on desk instead of in library. Redis or Memcached.",
    points: [
      {
        label: "Engines",
        text: "Redis: data structures, persistence, pub/sub. Memcached: simple key-value, fastest",
        easy: "Redis is smart cache(keeps data even if off), Memcached is simple cache(lose data if off)."
      },
      {
        label: "Use Cases",
        text: "Session storage, real-time leaderboards, caching DB queries, rate limiting",
        easy: "Like keeping 'did you log in' reminder, game rankings, frequently used search results."
      },
      {
        label: "Eviction Policies",
        text: "LRU(least recently used), LFU(least frequently used), TTL(time to live)",
        easy: "When memory full, delete least used or oldest items."
      },
      {
        label: "High Availability",
        text: "Multi-AZ with automatic failover. Cluster mode for horizontal scaling",
        easy: "Backup instance ready, horizontal scaling for more speed."
      },
      {
        label: "Exam Points",
        text: "ElastiCache vs RDS: cache for speed, DB for storage. Redis Cluster for large data",
        easy: "Need speed? Cache. Need data? Database. Both? Use together!"
      }
    ]
  },
  ebs: {
    title: "Amazon EBS",
    subtitle: "Elastic Block Storage",
    easy: "EBS is like a hard drive for EC2! Plugs into instance, stores data permanently, can take snapshot backup.",
    points: [
      {
        label: "Volume Types",
        text: "gp3(general, 3 IOPS per GB), gp2(older), io1(high IOPS), st1(throughput), sc1(cold)",
        easy: "gp3 is good all-rounder(new version faster), io1 is for databases(very fast), st1 is wide highway, sc1 is backup."
      },
      {
        label: "Snapshots",
        text: "Block-level incremental backup. Can copy across regions. Can create AMI from snapshot",
        easy: "Like backup of hard drive. Only new parts stored(incremental). Can restore or create image."
      },
      {
        label: "Encryption",
        text: "Encrypt at creation with KMS. Can copy encrypted snapshot. Re-encrypt by copy",
        easy: "Choose encryption when creating. To change, must copy to encrypted volume."
      },
      {
        label: "Performance",
        text: "IOPS and throughput limits per volume type. Can modify gp3 without detaching",
        easy: "Each volume has speed limit. gp3 can adjust speed without stopping."
      },
      {
        label: "Exam Points",
        text: "EBS vs Instance Store: EBS persists, Instance Store disappears. io1 for high performance",
        easy: "EBS = locker(persists), Instance Store = memo(disappears). Choose based on need!"
      }
    ]
  },
  efs: {
    title: "Amazon EFS",
    subtitle: "Elastic File System",
    easy: "EFS is like a shared file cabinet! Multiple EC2 instances can access same files simultaneously. Perfect for shared storage.",
    points: [
      {
        label: "Access",
        text: "NFS protocol. Mount via mount target in subnet. Auto-scales, no pre-provisioning",
        easy: "Like network drive on company office. Multiple computers share same files."
      },
      {
        label: "Performance Modes",
        text: "General Purpose(default, most uses), Max IO(high concurrency, enterprise apps)",
        easy: "General Purpose for normal use, Max IO for heavy workloads."
      },
      {
        label: "Throughput Modes",
        text: "Bursting(default, scales with file count), Provisioned(fixed throughput)",
        easy: "Bursting grows automatically, Provisioned sets fixed speed."
      },
      {
        label: "Storage Classes",
        text: "Standard, Standard-IA(infrequent access). Lifecycle policies automatic transition",
        easy: "Standard for frequent access, IA for rare access - cheaper!"
      },
      {
        label: "Exam Points",
        text: "EFS vs EBS: EFS shared, EBS single instance. EFS more expensive, EBS faster",
        easy: "EFS for sharing, EBS for speed. Share = EFS, Speed = EBS."
      }
    ]
  },
  cognito: {
    title: "Amazon Cognito",
    subtitle: "User Authentication & Authorization",
    easy: "Cognito is your app's login system! Handle user signup, login, MFA, social login(Google/Facebook), all built-in.",
    points: [
      {
        label: "User Pool",
        text: "User directory for app. Username/email password. MFA support. Custom attributes",
        easy: "Like user database. Social login integration. Password reset email."
      },
      {
        label: "Identity Pool",
        text: "Temporary AWS credentials. Access AWS services like S3, DynamoDB. Role-based",
        easy: "After login, get key to use AWS services. Different roles different permissions."
      },
      {
        label: "MFA",
        text: "TOTP(authenticator app), SMS, email. Backup codes",
        easy: "Extra security. Code from phone + password."
      },
      {
        label: "Custom Auth Flow",
        text: "Custom Lambda for authentication logic. Challenge/response",
        easy: "Custom login rules. Like 'must login from company IP'."
      },
      {
        label: "Exam Points",
        text: "User Pool for login, Identity Pool for AWS access. Cognito = auth, IAM = permissions",
        easy: "User Pool = 'who are you?', Identity Pool = 'what can you do?'"
      }
    ]
  },
  ecs: {
    title: "Amazon ECS",
    subtitle: "Elastic Container Service",
    easy: "ECS is container management! Run Docker containers on EC2 or Fargate(serverless). Orchestrate, scale, restart automatically.",
    points: [
      {
        label: "Launch Types",
        text: "EC2: manage instances yourself. Fargate: serverless containers, pay per task",
        easy: "EC2 = rent apartment + manage yourself. Fargate = hotel room + hotel manages."
      },
      {
        label: "Task Definition",
        text: "Blueprint for container. Specifies Docker image, memory, CPU, environment variables",
        easy: "Recipe for container. Docker image, ingredients(memory/CPU), instructions."
      },
      {
        label: "Service",
        text: "Manage tasks. Auto-scaling, load balancing, self-healing. Desired count",
        easy: "Keep certain number of containers running. Auto-restart if fail."
      },
      {
        label: "Cluster",
        text: "Group of resources(EC2 instances or Fargate). Network and security",
        easy: "Like building complex with multiple apartments(tasks)."
      },
      {
        label: "Exam Points",
        text: "ECS Fargate for simplicity. EC2 for cost optimization. CloudWatch auto-scaling",
        easy: "Want easy? Fargate. Want cheap? EC2. Scale with CloudWatch metrics!"
      }
    ]
  },
  asg: {
    title: "Auto Scaling Group",
    subtitle: "Automatic Instance Scaling",
    easy: "ASG is auto-hiring/firing! Add servers when busy(scale up), remove when quiet(scale down). Automatic elasticity.",
    points: [
      {
        label: "Policies",
        text: "Target tracking: maintain metric at level. Step scaling: scale by increment. Simple: single threshold",
        easy: "Target = keep 70% CPU. Step = +1 instance per 20% CPU over 70%. Simple = if > 80%, add one."
      },
      {
        label: "Lifecycle Hooks",
        text: "Execute custom scripts during launch/terminate. Perfect for graceful shutdown",
        easy: "When instance dying, play goodbye music first. When baby instance born, set up room."
      },
      {
        label: "Health Checks",
        text: "ELB health check, EC2 status check. Auto-replace unhealthy instances",
        easy: "Constantly check if instances healthy. Replace sick ones."
      },
      {
        label: "Cooldown",
        text: "Wait time before next scaling action. Prevent thrashing",
        easy: "After scaling, wait before checking again. Don't keep flipping on/off."
      },
      {
        label: "Exam Points",
        text: "ASG with ELB for high availability. Lifecycle hooks for graceful shutdown",
        easy: "ASG + ELB = auto-scale + load balance. Perfect combo!"
      }
    ]
  },
  beanstalk: {
    title: "AWS Elastic Beanstalk",
    subtitle: "Platform as a Service",
    easy: "Beanstalk is like renting furnished apartment! Just provide code, Beanstalk handles servers, databases, scaling, monitoring.",
    points: [
      {
        label: "Environments",
        text: "Dev: single instance(cheap). Prod: load balanced(expensive but scalable)",
        easy: "Dev = studio apartment, Prod = full house with servants."
      },
      {
        label: "Supported Platforms",
        text: "Node.js, Python, Ruby, Java, Go, .NET, Docker, custom platform",
        easy: "Many languages supported. Or bring own Docker."
      },
      {
        label: "Deployment",
        text: "Git push, CLI, console. Automatic blue/green deployment. Rollback if fail",
        easy: "Deploy like GitHub push. Automatic test new version, keep old version ready."
      },
      {
        label: "Customization",
        text: "Environment variables, .ebextensions config, web.config, procfile",
        easy: "Can customize everything if needed. Config files control behavior."
      },
      {
        label: "Exam Points",
        text: "Beanstalk for quick PaaS deployment. CloudFormation underneath. Health monitoring",
        easy: "Beanstalk = PaaS, EC2 = IaaS. Beanstalk easier, EC2 more control."
      }
    ]
  },
  glacier: {
    title: "Amazon S3 Glacier",
    subtitle: "Cold Storage Service",
    easy: "Glacier is deep freeze storage! Extremely cheap but retrieval takes time. For data you rarely access but must keep.",
    points: [
      {
        label: "Retrieval Times",
        text: "Instant: 1-5 minutes. Flexible: 3-5 hours. Deep: 12 hours",
        easy: "Instant is quick thaw, Flexible is overnight thaw, Deep is next day thaw."
      },
      {
        label: "Vault Lock",
        text: "WORM(Write Once Read Many) enforcement. Compliance locking immutable",
        easy: "Like lockable safe - once locked, can't delete even if want to. For regulations."
      },
      {
        label: "Lifecycle Policy",
        text: "Auto-move from S3 → Glacier after set days. Reduce storage costs 80%+",
        easy: "Old files automatically move to cold storage - like archiving old papers."
      },
      {
        label: "Restore",
        text: "Restore to S3 temporarily. DynamoDB Streams trigger restore automation",
        easy: "When needing file, temporarily restore to S3, then back to Glacier."
      },
      {
        label: "Exam Points",
        text: "Glacier Instant vs Flexible: retrieval time tradeoff. Vault Lock for compliance",
        easy: "Need quick? Instant. Can wait? Flexible (way cheaper). Compliance? Lock it!"
      }
    ]
  },
  redshift: {
    title: "Amazon Redshift",
    subtitle: "Data Warehouse Service",
    easy: "Redshift is a huge warehouse for analyzing big data! Stores massive amounts cheaply and analyzes fast. Better than RDS for analytics.",
    points: [
      {
        label: "Architecture",
        text: "Leader node(query routing) + Compute nodes(data storage/query). Columnar storage",
        easy: "Leader directs traffic, Compute nodes do heavy lifting. Organize by column not row(faster analysis)."
      },
      {
        label: "Data Loading",
        text: "COPY from S3, DynamoDB, or EC2. Parallel ingestion. Bulk operations fast",
        easy: "Load thousands of rows simultaneously from S3. Like bulk truck vs small car."
      },
      {
        label: "Performance",
        text: "Compression reduces size 10x. Sortkeys and distribution key for optimization",
        easy: "Compression = zip files. Sortkey = pre-organize data. Distribution = split data wisely."
      },
      {
        label: "Backup & Restore",
        text: "Auto-snapshots to S3. Cross-region copy. Restore to new cluster",
        easy: "Automatic backup to S3. Can restore to another region if disaster."
      },
      {
        label: "Exam Points",
        text: "Redshift for OLAP(analysis), RDS for OLTP(transaction). Redshift much cheaper for large data",
        easy: "Redshift = analytics warehouse, RDS = operational database. Different tools, different use!"
      }
    ]
  },
  directconn: {
    title: "AWS Direct Connect",
    subtitle: "Dedicated Network Connection",
    easy: "Direct Connect is private highway to AWS! Instead of internet, use dedicated line. More secure, faster, consistent.",
    points: [
      {
        label: "Connection Types",
        text: "Dedicated Connection: AWS allocates port. Hosted Connection: 3rd party provider allocates",
        easy: "Dedicated = own highway exit. Hosted = share highway with others."
      },
      {
        label: "Virtual Interfaces",
        text: "Private VIF: VPC access. Public VIF: AWS public services. Transit VIF: Transit Gateway",
        easy: "Private = to VPC, Public = to S3/DynamoDB, Transit = to multiple VPCs."
      },
      {
        label: "Advantages",
        text: "Reduced bandwidth cost, consistent network, private, low latency, high availability",
        easy: "Like exclusive train vs crowded bus. Faster, reliable, private."
      },
      {
        label: "Setup",
        text: "Order from AWS, coordinate with provider, configure routers, 4-8 week lead time",
        easy: "Takes time to set up but worth for enterprise."
      },
      {
        label: "Exam Points",
        text: "Direct Connect for enterprise. BGP routing protocol. Backup with VPN",
        easy: "Expensive but secure. Pair with VPN backup for failover."
      }
    ]
  },
  waf: {
    title: "AWS WAF",
    subtitle: "Web Application Firewall",
    easy: "WAF is bouncer at nightclub! Blocks bad requests(SQL injection, XSS) before reaching your app.",
    points: [
      {
        label: "Rules",
        text: "IP reputation, Geo-blocking, rate limiting, string matching, regex patterns",
        easy: "Block bad IPs, block countries, limit requests, detect attacks."
      },
      {
        label: "Integration",
        text: "CloudFront, ALB, API Gateway. Can also protect custom origins",
        easy: "Protect any web app entry point."
      },
      {
        label: "Web ACL",
        text: "Ordered rules. Match first rule wins. Default action allow/block",
        easy: "Like security checklist - first match gets applied."
      },
      {
        label: "Managed Rules",
        text: "AWS maintained rulesets for OWASP Top 10, SQL injection, XSS, bot control",
        easy: "Pre-built rules for common attacks. Like using expert security guards."
      },
      {
        label: "Exam Points",
        text: "WAF vs NACL: WAF for app layer, NACL for network layer. WAF catches logic attacks",
        easy: "NACL blocks traffic, WAF blocks attacks. Both needed!"
      }
    ]
  },
  secrets: {
    title: "AWS Secrets Manager",
    subtitle: "Secrets & Credentials Management",
    easy: "Secrets Manager is secure password safe! Store API keys, DB passwords, secrets. Auto-rotate, audit access.",
    points: [
      {
        label: "Storage",
        text: "Encrypted at rest(KMS). Encrypted in transit(TLS). Never shown in logs",
        easy: "Like super-secure safe. Double-locked, never seen."
      },
      {
        label: "Rotation",
        text: "Auto-rotate every X days. Lambda function for rotation logic. RDS auto-rotation",
        easy: "Automatically change password every 30 days. Like prison guard rotation."
      },
      {
        label: "Access Control",
        text: "IAM policy for who can access. Resource-based policy. Audit with CloudTrail",
        easy: "Only specific people can get secret. Track who accessed when."
      },
      {
        label: "Application Integration",
        text: "SDK support for retrieve at runtime. Not in code/config files",
        easy: "App asks 'give me password' at runtime, not hardcoded."
      },
      {
        label: "Exam Points",
        text: "Secrets Manager vs Parameter Store: Manager for secrets(rotate), Store for config",
        easy: "Secrets = passwords (rotate), Parameters = URLs(don't rotate)."
      }
    ]
  },
  eventbridge: {
    title: "Amazon EventBridge",
    subtitle: "Event Bus & Routing Service",
    easy: "EventBridge is event dispatcher! When X happens, trigger Y. Route AWS events to Lambda, SNS, SQS, etc. automatically.",
    points: [
      {
        label: "Event Sources",
        text: "AWS services(EC2, RDS, CodeBuild), Partner events(Datadog, PagerDuty), Custom apps",
        easy: "Listen to any AWS event or custom event. Like doorbell for everything."
      },
      {
        label: "Rules",
        text: "Pattern matching on event attributes. Target up to 5 targets(fan-out)",
        easy: "If eventType=OrderPlaced AND amount>100, trigger email+Lambda+database."
      },
      {
        label: "Targets",
        text: "Lambda, SNS, SQS, Kinesis, Step Functions, API Gateway, EC2, Batch, etc.",
        easy: "Can route to many places. One event triggers multiple actions."
      },
      {
        label: "Scheduling",
        text: "Cron expressions. Rate(5 minutes). Perfect for scheduled tasks",
        easy: "Run task 'every day at 3am' or 'every 5 minutes'."
      },
      {
        label: "Exam Points",
        text: "EventBridge for event-driven architecture. SNS vs EB: EB more flexible",
        easy: "EventBridge = event dispatcher, SNS = notification. EB more powerful!"
      }
    ]
  },
  cloudtrail: {
    title: "AWS CloudTrail",
    subtitle: "API Activity Logging & Auditing",
    easy: "CloudTrail is security camera for API calls! Records every API call to AWS - who did what when. Required for compliance.",
    points: [
      {
        label: "Logs",
        text: "Management events(default, operations). Data events(S3, Lambda details). Insight events(unusual activity)",
        easy: "Management = 'who deleted the database?'. Data = 'who accessed this file?'. Insight = 'suspicious!'."
      },
      {
        label: "Storage",
        text: "Default 90 days in CloudTrail console. Send to S3 for long-term. Use Athena to query",
        easy: "Console shows 90 days, S3 keeps forever, Athena lets you search."
      },
      {
        label: "Organization Trail",
        text: "Single trail for entire organization. Monitor all accounts centrally",
        easy: "One camera watching all offices simultaneously."
      },
      {
        label: "Protection",
        text: "CloudTrail Integrity. Prevent log tampering. Digest file verification",
        easy: "Lock logs so can't delete/modify. Proof logs authentic."
      },
      {
        label: "Exam Points",
        text: "CloudTrail required for audit. VPC Flow Logs for network traffic. CloudTrail for API calls",
        easy: "CloudTrail = API audit, VPC Flow = network audit. Both needed!"
      }
    ]
  },
  apigw: {
    title: "Amazon API Gateway",
    subtitle: "API Management Service",
    easy: "API Gateway is the front desk! Accepts HTTP requests from customers, routes to backend Lambda/EC2/etc.",
    points: [
      {
        label: "Types",
        text: "REST API: HTTP, flexible. HTTP API: modern, cheaper, faster. WebSocket: real-time",
        easy: "REST old reliable, HTTP faster cheaper, WebSocket for chat/games."
      },
      {
        label: "Integration",
        text: "Lambda, EC2, Kinesis, DynamoDB, SQS, SNS, step functions, mock",
        easy: "Can route to anything. Like restaurant directing customers to kitchen."
      },
      {
        label: "Throttling",
        text: "Prevent abuse. Token bucket algorithm. Rate limiting configurable",
        easy: "Limit requests per second. Like line control at store."
      },
      {
        label: "Caching",
        text: "Cache response by stage. TTL configurable. Reduce backend load",
        easy: "Cache frequent requests. Reduce Lambda calls = save money."
      },
      {
        label: "Exam Points",
        text: "API GW + Lambda = serverless API. CORS needed for browser requests. Usage Plans for metering",
        easy: "API GW = frontend, Lambda = logic. CORS = browser security. Usage = rate limit."
      }
    ]
  },
  batch: {
    title: "AWS Batch",
    subtitle: "Fully Managed Batch Computing",
    easy: "AWS Batch is the class monitor who hands out homework automatically! Submit a job list, it borrows compute, processes everything, then returns it. No server management needed!",
    points: [
      { label: "Core Components", text: "Job Definition(work template), Job Queue(priority queue), Compute Environment(EC2/Fargate auto-provisioned)", easy: "Job Definition = recipe, Job Queue = order line, Compute Environment = auto-provisioned chef." },
      { label: "Compute Environment", text: "Managed(AWS auto-manages EC2/Fargate) vs Unmanaged(you manage). Spot Instances save up to 90%", easy: "Managed = AWS prepares servers automatically. Unmanaged = you manage. Spot saves 90%!" },
      { label: "Workflow Integration", text: "Step Functions for batch pipelines. EventBridge for scheduled execution", easy: "Connect to Step Functions for pre-process→batch→post-process automated pipeline." },
      { label: "vs Lambda", text: "Lambda: max 15 min, simple event processing. Batch: hours-days, large-scale parallel processing", easy: "Lambda = short sprint, Batch = marathon! ML training, rendering, big data → use Batch." },
      { label: "Exam Points", text: "Batch runs on ECS. Jobs >15 min → use Batch. Spot interruptions auto-retried", easy: "Task over 15 min → AWS Batch! Spot interrupted? Auto-retry!" }
    ]
  },
  fsx: {
    title: "Amazon FSx",
    subtitle: "Managed File Systems",
    easy: "FSx lets you use various file servers in AWS as-is! Provides Windows shared folders, HPC file systems, and more as fully managed services.",
    points: [
      { label: "FSx for Windows File Server", text: "Fully managed Windows file server. SMB/NTFS. Active Directory integration. Multi-AZ support", easy: "Windows shared folders in AWS! Use existing AD credentials as-is." },
      { label: "FSx for Lustre", text: "High-performance for HPC/ML. Direct S3 integration. Hundreds of GB/s throughput", easy: "Supercomputer-speed file system! For ML training, genomics, video processing." },
      { label: "FSx for NetApp ONTAP", text: "Fully managed NetApp ONTAP. NFS/SMB/iSCSI. Auto-tiering. Deduplication", easy: "Lift-and-shift enterprise NetApp to AWS. On-premises compatible!" },
      { label: "FSx for OpenZFS", text: "ZFS-based. NFS compatible. Snapshots and replication. Linux workload optimized", easy: "High-performance file system for Linux. ZFS features (snapshots, compression) as managed service." },
      { label: "Exam Points", text: "Windows file share → FSx for Windows(not EFS!). HPC/ML → FSx for Lustre. EFS = Linux NFS only", easy: "Windows shared folder → FSx for Windows! Linux shared → EFS. HPC → Lustre!" }
    ]
  },
  storagegateway: {
    title: "AWS Storage Gateway",
    subtitle: "Hybrid Storage Bridge",
    easy: "Storage Gateway is the bridge between on-premises servers and AWS cloud! On-premises servers can use AWS S3 just like a local drive.",
    points: [
      { label: "File Gateway", text: "S3 access via NFS/SMB. Local cache for low latency. Use S3 without changing on-premises app code", easy: "Connect company file server to S3! Employees use it just like a network drive." },
      { label: "Volume Gateway", text: "iSCSI block storage. Cached(stored in S3, frequent data local). Stored(local primary, S3 backup)", easy: "Cached = mostly S3, Stored = local primary + S3 backup. Used for disaster recovery." },
      { label: "Tape Gateway", text: "Virtual Tape Library(VTL). Use existing backup software(Veeam etc.) unchanged. Store in S3/Glacier", easy: "Migrate tape backup system to cloud! Store in S3 without changing software." },
      { label: "Use Cases", text: "On-premises→cloud backup, disaster recovery, intermediate step in cloud migration", easy: "Commonly used during the transition period of moving company data to the cloud." },
      { label: "Exam Points", text: "On-premises S3 access → Storage Gateway. Tape backup→cloud → Tape Gateway. S3/Glacier compatible", easy: "On-premises + S3 connection keyword → Storage Gateway! Tape → Glacier!" }
    ]
  },
  datasync: {
    title: "AWS DataSync",
    subtitle: "Online Data Transfer Service",
    easy: "DataSync is a moving company! It transfers data from existing servers to AWS quickly and securely. Auto-encrypts and verifies the data was transferred correctly!",
    points: [
      { label: "Sources/Destinations", text: "Sources: NFS, SMB, HDFS, S3, EFS, FSx, object storage. Destinations: S3, EFS, FSx", easy: "Transfer from NFS servers, Hadoop, S3 to AWS storage." },
      { label: "Performance", text: "Maximizes network utilization. Parallel transfer. DataSync Agent(on-premises install). Direct Connect/VPN support", easy: "Automatically maximizes network for fast transfer. Even faster with Direct Connect." },
      { label: "Automation & Validation", text: "Scheduled transfers. Automatic data integrity verification. Delete-after-transfer option. CloudWatch monitoring", easy: "Auto-sync on schedule and verifies data transferred without corruption!" },
      { label: "vs Storage Gateway", text: "DataSync: one-time or periodic large-scale migration. Storage Gateway: continuous on-premises-cloud connection", easy: "DataSync = moving(data migration), Storage Gateway = commuting(always connected)." },
      { label: "Exam Points", text: "On-premises→S3/EFS large migration → DataSync. Snow Family = offline, DataSync = online", easy: "Network-based data transfer → DataSync! No internet in remote area → Snow Family!" }
    ]
  },
  snow: {
    title: "AWS Snow Family",
    subtitle: "Offline Large-Scale Data Migration",
    easy: "Snow Family is AWS delivering hard drives by truck! Used when internet is slow or unavailable to physically transfer tens to hundreds of petabytes of data.",
    points: [
      { label: "Snowcone", text: "Ultra-compact(2.1kg). 8TB~14TB. Field data collection and transfer. Built-in DataSync", easy: "Fits in a bag. For data collection at remote sites." },
      { label: "Snowball Edge", text: "Storage Optimized(80TB), Compute Optimized(42TB+GPU). Edge computing capable. Clustering", easy: "Luggage-sized device. Not just for transfer — can also compute at the site." },
      { label: "Snowmobile", text: "40-foot container truck. Up to 100PB. Exabyte-scale migration", easy: "For migrating an entire data center! AWS truck comes and connects directly." },
      { label: "Edge Computing", text: "Run EC2/Lambda at sites without internet. Collect→process→upload to AWS later", easy: "Process data in mines or ships without internet, then transfer to AWS later." },
      { label: "Exam Points", text: "Network would take 10+ years → Snow. Offline only. AWS wipes data after transfer", easy: "'Tens of PBs to migrate' + 'limited internet' → Snow Family! Data wiped after upload." }
    ]
  },
  natgw: {
    title: "NAT Gateway",
    subtitle: "Private Subnet Internet Outbound",
    easy: "NAT Gateway is the side door that lets private subnet residents go outside! Outbound is allowed but inbound from outside is not.",
    points: [
      { label: "Role", text: "Allows outbound internet traffic for EC2/Lambda in private subnet. No inbound(Stateful)", easy: "Private subnet instances can do software updates, call external APIs. Cannot be accessed from outside." },
      { label: "Deployment", text: "Placed in Public Subnet. Elastic IP required. One per AZ recommended(high availability)", easy: "NAT Gateway itself must be in Public Subnet. Create one per availability zone for safety." },
      { label: "NAT Instance", text: "EC2-based(legacy). Requires manual management and patching. Security Group applicable. Lower cost", easy: "NAT Gateway = AWS managed, NAT Instance = manage your own EC2. Common exam trap!" },
      { label: "Cost", text: "Hourly + per-GB processed. Cross-AZ traffic charges. Recommend same-AZ NAT Gateway", easy: "More data sent = higher cost. NAT Gateway per AZ reduces data transfer costs." },
      { label: "Exam Points", text: "NAT Gateway in Public Subnet. HA = NAT Gateway per AZ. IPv6 uses Egress-Only IGW", easy: "IPv6 private subnet → NOT NAT Gateway, use Egress-Only IGW! Exam trap!" }
    ]
  },
  vpcendpoint: {
    title: "VPC Endpoints",
    subtitle: "Access AWS Services Without Internet",
    easy: "VPC Endpoint is a secret tunnel to AWS services! Access S3, DynamoDB etc. through AWS internal network without touching the internet.",
    points: [
      { label: "Gateway Endpoint", text: "S3 and DynamoDB only. Free. Add route to Route Table. Regional access", easy: "S3, DynamoDB → Gateway Endpoint(free)! Just add destination to Route Table." },
      { label: "Interface Endpoint(PrivateLink)", text: "Other AWS services(EC2, SQS etc.). Creates ENI. Hourly + data charges. DNS resolution changes", easy: "Most AWS service connections use Interface Endpoint. Creates one ENI for communication." },
      { label: "Gateway Load Balancer Endpoint", text: "Integrates with GWLB. Transparent insertion of 3rd-party firewall/IPS traffic. Delivers to original destination after inspection", easy: "Special endpoint to pass through security appliances. Transparently inserts firewall inspection." },
      { label: "Security Benefits", text: "Access AWS services without Internet Gateway/NAT Gateway. Bucket Policy can specify VPC Endpoint condition", easy: "S3 data doesn't cross internet — more secure! Can allow bucket access only from specific VPC." },
      { label: "Exam Points", text: "S3/DynamoDB → Gateway(free). Others → Interface(paid). Cannot use from on-premises", easy: "S3 = Gateway Endpoint(free)! Other services = Interface Endpoint. On-premises→VPC Endpoint impossible!" }
    ]
  },
  transitgw: {
    title: "AWS Transit Gateway",
    subtitle: "Network Hub Router",
    easy: "Transit Gateway is the central hub connecting multiple VPCs and on-premises networks in one place! The more VPCs you have, the simpler it becomes compared to Peering.",
    points: [
      { label: "Hub and Spoke", text: "Up to 5,000 VPC/VPN connections. Supports transitive routing unlike VPC Peering. Centralized management", easy: "10 VPCs would need 45 Peering connections. TGW needs just 1 hub with 10 connections!" },
      { label: "Multi-Account", text: "Share across accounts via Resource Access Manager(RAM). Organizations integration", easy: "Connect VPCs from multiple AWS accounts to one TGW. Essential for multi-account architecture." },
      { label: "Route Tables", text: "Multiple route tables for traffic separation. VPC isolation possible. Blackhole routing", easy: "Allow VPC A↔B but block A↔C — fine-grained routing control." },
      { label: "Attachment Types", text: "VPC Attachment, VPN Attachment, Direct Connect Gateway Attachment, Peering Attachment(cross-region)", easy: "VPC, VPN, Direct Connect all connect through one TGW. Cross-region TGW Peering also possible." },
      { label: "Exam Points", text: "TGW: transitive routing YES. VPC Peering: transitive routing NO. 100+ VPCs → TGW recommended", easy: "Many VPCs + need to communicate → Transit Gateway! Peering = 1:1 only, TGW = many:many!" }
    ]
  },
  globalaccel: {
    title: "AWS Global Accelerator",
    subtitle: "Global Network Acceleration",
    easy: "Global Accelerator connects users worldwide to the nearest AWS edge for fast access to your servers! Instead of the internet, it uses AWS's internal highway.",
    points: [
      { label: "Anycast IP", text: "2 static Anycast IPs provided. Same IP connects to nearest edge from anywhere in the world", easy: "Fixed phone number that always connects you to the nearest branch wherever you call from." },
      { label: "Performance", text: "Uses AWS global network instead of internet. Reduced packet loss/latency/jitter. 60% faster responses", easy: "AWS dedicated highway instead of public internet roads! Much faster and more stable." },
      { label: "Health Check & Failover", text: "Endpoint health checks. Auto-switch to another region/endpoint if unhealthy. Within 30 seconds", easy: "Server goes down? Automatically switches to another server within 30 seconds!" },
      { label: "Endpoints", text: "ALB, NLB, EC2, Elastic IP. Weight-based traffic routing. Blue/Green deployment", easy: "Distribute weights to load balancers in multiple regions. A/B testing, zero-downtime deployment." },
      { label: "Exam Points", text: "CloudFront vs Global Accelerator: CloudFront = caching(HTTP), GA = TCP/UDP network acceleration", easy: "Caching needed for static content → CloudFront. Gaming/real-time/no-cache acceleration → Global Accelerator!" }
    ]
  },
  sitevpn: {
    title: "AWS Site-to-Site VPN",
    subtitle: "On-Premises VPN Connection",
    easy: "Site-to-Site VPN is an encrypted tunnel securely connecting your company network to AWS VPC over the internet! Faster to set up than Direct Connect.",
    points: [
      { label: "Components", text: "Virtual Private Gateway(VGW) or Transit Gateway + Customer Gateway(on-premises router) + 2 IPsec tunnels", easy: "AWS door(VGW) and company door(CGW) connected by 2 encrypted tunnels." },
      { label: "Redundancy", text: "2 tunnels auto-created(Active/Passive). High availability. Different AZ termination", easy: "Automatically 2 tunnels! If one breaks, communication continues through the other." },
      { label: "Speed & Limits", text: "Max 1.25Gbps/tunnel. Variable latency via internet. Setup in hours", easy: "Faster to set up than Direct Connect. But Direct Connect wins on speed." },
      { label: "VPN over Direct Connect", text: "DX has no encryption. DX + Site-to-Site VPN adds encryption", easy: "Direct Connect has no encryption — if security needed, install VPN alongside." },
      { label: "Exam Points", text: "VPN: fast setup, via internet. DX: weeks-months setup, dedicated line. VPN recommended as DX backup", easy: "'Connect quickly' → VPN. 'Stable bandwidth' → Direct Connect. 'Encrypted+DX' → VPN over DX!" }
    ]
  },
  vpcpeering: {
    title: "VPC Peering",
    subtitle: "Private Direct VPC-to-VPC Connection",
    easy: "VPC Peering is connecting two VPCs through a secret tunnel! Servers in different VPCs can communicate without the internet.",
    points: [
      { label: "Features", text: "Private connection via AWS network. Same region or cross-region. Same account or cross-account", easy: "Dedicated tunnel between two VPCs. No internet required. Other accounts and regions supported." },
      { label: "No Transitive Routing", text: "A→B→C transitive routing not supported. Need separate Peering to connect A↔C", easy: "Even if A-B-C connected, A can't reach C. Must create A-C connection separately!" },
      { label: "CIDR Restriction", text: "Cannot peer with overlapping CIDR blocks. Route tables on both sides must be updated", easy: "If two VPCs have overlapping IP ranges, they can't connect! Plan CIDR carefully." },
      { label: "vs Transit Gateway", text: "Peering: 1:1, no transitive, free. TGW: hub, transitive, has cost", easy: "2-3 VPCs → Peering(free). Many complex VPCs → Transit Gateway." },
      { label: "Exam Points", text: "No transitive routing. No overlapping CIDR. Both-side route table update required", easy: "After Peering, must update route tables on both sides! One-sided won't work." }
    ]
  },
  scp: {
    title: "Service Control Policies (SCP)",
    subtitle: "Organizations Maximum Permission Boundary",
    easy: "SCP is the constitution for the entire company! No matter what permissions an employee(account) has, if SCP forbids it, they absolutely cannot do it. Even if IAM allows it, SCP blocks it!",
    points: [
      { label: "Overview", text: "Applied to OU/accounts in AWS Organizations. Defines maximum allowed permission boundary. Additional condition on IAM", easy: "SCP is the ceiling of permissions per account. IAM can grant everything, but SCP blocks if forbidden." },
      { label: "Allow vs Deny", text: "Allow list: only listed actions allowed. Deny list: only listed actions denied(default)", easy: "Deny list is default. Block specific services. Allow list = only allowed services usable." },
      { label: "Scope", text: "Cannot apply SCP to root account. Applies to member accounts only. Management Account unaffected", easy: "SCP only restricts child accounts. Master(management) account is unaffected by SCP. Beware!" },
      { label: "Hierarchical", text: "OU → child OU → account inheritance. Must satisfy both parent OU SCP and account SCP", easy: "Rules flow top-down. If blocked at parent OU, child can't override." },
      { label: "Exam Points", text: "SCP ≠ IAM Policy. Root user also subject to SCP restrictions. Management Account exempt from SCP", easy: "Even root account can't do what SCP forbids! Only Management Account is SCP-exempt." }
    ]
  },
  networkfirewall: {
    title: "AWS Network Firewall",
    subtitle: "Managed VPC Network Firewall",
    easy: "Network Firewall is the VPC's security guard! Inspects all incoming and outgoing traffic with stateful inspection. WAF handles the app layer, Network Firewall handles the network layer!",
    points: [
      { label: "Overview", text: "Fully managed stateful firewall. Protects VPC inbound/outbound/east-west traffic. No Gateway Load Balancer needed", easy: "VPC-level firewall. Inspects all traffic: internet→VPC, VPC→internet, VPC→VPC." },
      { label: "Rule Types", text: "Stateless(per-packet), Stateful(connection tracking), Domain List(domain blocking), Suricata IPS(open-source rules)", easy: "From simple IP/port blocking to domain-based blocking and IPS rules — highly configurable." },
      { label: "Architecture", text: "Deployed in dedicated Firewall Subnet. Traffic routing adjustment needed. Centralized or distributed deployment", easy: "Create dedicated firewall subnet and route all traffic through it." },
      { label: "vs WAF vs Security Group", text: "SG: instance level. WAF: L7 HTTP. Network Firewall: VPC-level L3~L7 comprehensive", easy: "SG = guest list, WAF = app security, Network Firewall = neighborhood entrance comprehensive security." },
      { label: "Exam Points", text: "VPC-level traffic inspection/blocking → Network Firewall. IDS/IPS capability needed → Network Firewall", easy: "Filter all VPC traffic + IPS feature → Network Firewall!" }
    ]
  },
  guardduty: {
    title: "Amazon GuardDuty",
    subtitle: "ML-Based Threat Detection",
    easy: "GuardDuty is AWS's detective! Analyzes logs to automatically find threats like 'unusual logins', 'crypto mining', 'data exfiltration'. Turn it on instantly with no installation!",
    points: [
      { label: "Analysis Sources", text: "CloudTrail(API calls), VPC Flow Logs(network), DNS Logs(domains), EKS audit logs, S3 events", easy: "Analyzes CloudTrail, VPC Flow, DNS simultaneously. No agent needed — active in 30 seconds!" },
      { label: "Detection Types", text: "Abnormal API calls, malicious IP access, crypto mining, credential theft, port scans, S3 exfiltration", easy: "Detects hacker patterns(malicious IPs), insider threats(abnormal APIs), malware(mining) and more." },
      { label: "Findings", text: "Finding → EventBridge → Lambda/SNS. Severity(low/medium/high). Auto-remediation possible", easy: "Threat found → EventBridge alert → Lambda auto-blocks! Full automation possible." },
      { label: "Multi-Account", text: "Organizations integration. Centrally manage all member accounts from admin account", easy: "Manage threats across all accounts in one place. Organizations integration essential." },
      { label: "Exam Points", text: "30-day free trial. GuardDuty collects independently even if VPC Flow Logs disabled. No agent needed", easy: "Just turn on for instant protection! Threat detection → GuardDuty, vulnerability scan → Inspector" }
    ]
  },
  inspector: {
    title: "Amazon Inspector",
    subtitle: "Automated Vulnerability Scanning",
    easy: "Inspector is a security-check robot for your servers! Automatically finds known vulnerabilities(CVE) in EC2, Lambda, and containers, and reports them with a risk score.",
    points: [
      { label: "Scan Targets", text: "EC2(OS/software CVE), Lambda functions(code dependencies), ECR container images", easy: "Automatically scans packages and libraries in EC2, Lambda, container images for vulnerabilities." },
      { label: "Continuous Scanning", text: "Initial deployment + auto-rescan on new CVE publication. Uses SSM Agent. Near real-time", easy: "Not just once — auto-rescans whenever new vulnerabilities are discovered! Always up to date." },
      { label: "Risk Score", text: "CVSSv3 + network reachability combined. Priority based on actual risk. Inspector Score", easy: "Not just CVE score — considers internet exposure to calculate true risk level." },
      { label: "Integration", text: "Finding → Security Hub integration. EventBridge → automation. ECR image scan integration", easy: "Manage in one view from Security Hub. Auto-create tickets when new vulnerabilities found." },
      { label: "Exam Points", text: "GuardDuty: threat detection(behavior analysis). Inspector: vulnerability scanning(CVE). Different purposes!", easy: "GuardDuty = detective(suspicious behavior). Inspector = doctor(health checkup). Completely different!" }
    ]
  },
  macie: {
    title: "Amazon Macie",
    subtitle: "S3 Sensitive Data Auto-Detection",
    easy: "Macie is a sensitive data detector for your S3 storage! Automatically finds where credit card numbers, SSNs, emails and other sensitive data are stored. Helps with GDPR compliance!",
    points: [
      { label: "Detection Types", text: "PII(personal info), Financial info(credit card/account), Medical info(PHI), Credentials(API keys/passwords)", easy: "SSNs, credit card numbers, API keys in S3 — automatically finds and alerts!" },
      { label: "Classification", text: "ML + pattern matching. 100+ managed data identifiers. Custom identifiers addable", easy: "Auto-detects with 100+ AWS-created patterns. Can add company-specific patterns too." },
      { label: "S3 Coverage", text: "Auto-discovers all S3 buckets in account. Shows security status: encryption, public access", easy: "Automatically scans all S3 buckets and alerts: 'This bucket has sensitive data!'" },
      { label: "Findings", text: "Finding → EventBridge → Lambda/SNS. Security Hub integration. 30-day free trial", easy: "Sensitive data found → EventBridge → auto-notify or move!" },
      { label: "Exam Points", text: "S3 sensitive data detection → Macie. PII/compliance → Macie. GuardDuty = threat detection!", easy: "'Where is PII in S3?' → Macie! 'Detect hacking attempts' → GuardDuty!" }
    ]
  },
  acm: {
    title: "AWS Certificate Manager",
    subtitle: "SSL/TLS Certificate Management",
    easy: "ACM issues HTTPS certificates for websites for free and auto-renews them! No more worrying about certificate expiration — always stay on HTTPS!",
    points: [
      { label: "Core Features", text: "Free SSL/TLS certificate issuance. Auto-renewal. Public and private certificates. DNS/email validation", easy: "AWS handles certificate issuance, renewal, and deployment. Forgetting renewal = outage!" },
      { label: "Integrated Services", text: "ELB(ALB/NLB), CloudFront, API Gateway, Elastic Beanstalk. Cannot deploy directly to EC2", easy: "Can attach certificates to ALB, CloudFront. Cannot deploy directly to EC2 — must be behind ELB!" },
      { label: "Public vs Private", text: "Public: free, for internet services. Private(ACM Private CA): paid, for internal services", easy: "Internet-facing certificate → free! Internal employee system → Private CA(paid)." },
      { label: "Region Restriction", text: "CloudFront certificates must be issued in us-east-1(Virginia). Regions are independent", easy: "CloudFront + HTTPS → issue certificate in us-east-1! Other region certificates don't work with CloudFront." },
      { label: "Exam Points", text: "ACM cannot deploy directly to EC2. CloudFront certificate → us-east-1 required. Auto-renewal prevents expiration", easy: "CloudFront SSL → us-east-1 ACM! Can't deploy to EC2 directly — must go through ELB/CF!" }
    ]
  },
  s3objectlock: {
    title: "S3 Object Lock",
    subtitle: "WORM Data Protection",
    easy: "S3 Object Lock locks files so they cannot be deleted or modified for a set period. Used for legally required data retention in finance, healthcare, and legal sectors!",
    points: [
      { label: "WORM", text: "Write Once, Read Many. Guarantees data immutability. Ransomware defense. Compliance data retention", easy: "Write once, read-only for the retention period! Cannot delete or modify. Ransomware-proof." },
      { label: "Governance Mode", text: "Special permission(s3:BypassGovernanceRetention) can unlock/delete. Testing, flexible protection", easy: "Admins with special permissions can unlock. More flexible protection for testing." },
      { label: "Compliance Mode", text: "Nobody including root can delete/modify. Cannot change retention period. Strict compliance", easy: "Even root can't delete! Used for legally mandated data retention. Immutable once set." },
      { label: "Legal Hold", text: "Indefinite protection without retention period. Set/release with s3:PutObjectLegalHold permission", easy: "Protect indefinitely until legal investigation ends. Used to preserve evidence in lawsuits." },
      { label: "Exam Points", text: "S3 Object Lock requires Versioning. Enable at bucket creation(cannot change later). Glacier supports Vault Lock", easy: "WORM + compliance → S3 Object Lock! Compliance mode = even root cannot delete!" }
    ]
  },
  stepfunctions: {
    title: "AWS Step Functions",
    subtitle: "Serverless Workflow Orchestration",
    easy: "Step Functions is the conductor linking multiple Lambdas in sequence! On success go to next step, on failure auto-retry or error-handle.",
    points: [
      { label: "State Machine", text: "Workflow defined in JSON/YAML. Visual editor. Task/Choice/Wait/Parallel/Map states", easy: "Draw a flowchart as code! Branches, parallel execution, waiting, loops all expressible." },
      { label: "Standard vs Express", text: "Standard: up to 1 year, exactly-once execution, audit log. Express: up to 5 min, high-throughput, async", easy: "Standard = long-running critical workflows, Express = fast high-throughput(IoT, streaming)." },
      { label: "Integrations", text: "Lambda, ECS, DynamoDB, SQS, SNS, Bedrock, SageMaker and more AWS services directly integrated", easy: "Not just Lambda — directly connect ECS, DynamoDB, SageMaker without code!" },
      { label: "Error Handling", text: "Retry, Catch(fallback). Exponential backoff. Timeout. Heartbeat", easy: "Lambda fails → retry 3 times, still fails → auto-route to error handling path." },
      { label: "Exam Points", text: "Complex Lambda chain → Step Functions. Parallel processing → Map/Parallel state. >15 min → Standard", easy: "Run multiple Lambdas in sequence, conditionally, in parallel → Step Functions!" }
    ]
  },
  dynamostreams: {
    title: "DynamoDB Streams",
    subtitle: "DynamoDB Change Event Stream",
    easy: "DynamoDB Streams is a real-time notification system for all changes in a table! When items are added/modified/deleted, Lambda automatically fires.",
    points: [
      { label: "Overview", text: "Ordered stream of DynamoDB item changes(INSERT/MODIFY/REMOVE). Retained 24 hours. Shard-based", easy: "Tape recording table changes in order. Must process within 24 hours." },
      { label: "Stream Record Types", text: "KEYS_ONLY, NEW_IMAGE, OLD_IMAGE, NEW_AND_OLD_IMAGES", easy: "Choose to send only keys, or before/after data. Before/after comparison = NEW_AND_OLD_IMAGES." },
      { label: "Lambda Integration", text: "Auto-polling as Lambda event source. Batch processing. Retry on failure. DLQ configurable", easy: "New change → Lambda auto-triggers! Process in batch, failed items go to DLQ." },
      { label: "Use Cases", text: "Cross-region replication(basis for Global Tables), event-driven cache invalidation, change audit log", easy: "Order placed → inventory decrease + shipping start + notification all processed simultaneously!" },
      { label: "Exam Points", text: "Streams underpins Lambda triggers. Global Tables internally uses Streams. Kinesis Data Streams also selectable", easy: "DynamoDB change → Lambda auto-trigger → Streams! Global Tables also replicate via Streams." }
    ]
  },
  dms: {
    title: "AWS Database Migration Service",
    subtitle: "Database Migration",
    easy: "DMS is a database moving helper! Move data from Oracle to Aurora, MySQL to PostgreSQL without downtime. Service keeps running during migration!",
    points: [
      { label: "Migration Types", text: "Homogeneous(MySQL→MySQL), Heterogeneous(Oracle→Aurora). Full Load, CDC(continuous replication), Full Load+CDC", easy: "Same engine = migrate directly. Different engine = use Schema Conversion Tool(SCT) first, then DMS." },
      { label: "CDC(Change Data Capture)", text: "Real-time replication of source DB changes during migration. Minimizes downtime", easy: "New data arriving during migration is also automatically moved! Migrate with no service interruption." },
      { label: "Replication Instance", text: "DMS Replication Instance for processing. EC2-based. Choose size. Multi-AZ option", easy: "EC2 server reading and writing data in the middle. Choose size based on data volume." },
      { label: "Supported DBs", text: "Source/Target: RDS, Aurora, Redshift, DynamoDB, S3, MongoDB, DocumentDB, Kafka, etc.", easy: "Migrate from almost any DB to almost any DB. On-premises → cloud also supported!" },
      { label: "Exam Points", text: "Heterogeneous DB migration → SCT + DMS. Homogeneous → DMS only. Minimum downtime → use CDC", easy: "Oracle→Aurora(heterogeneous) → convert schema with SCT, then migrate data with DMS!" }
    ]
  },
  transferfamily: {
    title: "AWS Transfer Family",
    subtitle: "Managed File Transfer Service",
    easy: "Transfer Family lets you upload files to S3 using existing SFTP clients! Transfer files to S3/EFS without changing legacy systems.",
    points: [
      { label: "Supported Protocols", text: "SFTP(SSH FTP), FTPS(FTP over SSL), FTP, AS2(B2B standard). Fully managed endpoint provided", easy: "Use old-style SFTP/FTP clients unchanged! AWS manages the endpoint." },
      { label: "Storage Connection", text: "Files stored in Amazon S3 or Amazon EFS. Leverage existing S3 buckets", easy: "Files uploaded via SFTP automatically saved to S3 or EFS!" },
      { label: "Authentication", text: "Service-managed users, Active Directory, LDAP, custom IdP(Lambda) integration", easy: "SFTP login with existing company AD account! No separate account management needed." },
      { label: "VPC Deployment", text: "Internet or VPC internal(private). Fixed IP with EIP. Access control via SG", easy: "Choose public internet or VPC-internal only. Fixed IP makes firewall rules easy." },
      { label: "Exam Points", text: "Legacy SFTP→S3 migration → Transfer Family. AS2 = B2B partner file exchange. EDI standard", easy: "SFTP as-is to S3 → Transfer Family! B2B file exchange(AS2) → Transfer Family!" }
    ]
  },
  appflow: {
    title: "Amazon AppFlow",
    subtitle: "SaaS↔AWS Data Integration",
    easy: "AppFlow is a connector that automatically brings data from SaaS services like Salesforce and Slack to AWS! Build data pipelines with configuration only, no coding needed.",
    points: [
      { label: "Supported Connectors", text: "Salesforce, Marketo, Slack, ServiceNow, SAP, Google Analytics → S3, Redshift, EventBridge", easy: "Automatically save Salesforce CRM data to S3! Daily, on specific events, or real-time." },
      { label: "Data Transformation", text: "Data masking, filtering, validation, format conversion during transfer. Sensitive data protection", easy: "Mask PII, select only needed fields and more during SaaS data import." },
      { label: "Security", text: "Encryption in transit and at rest. PrivateLink for no-internet transfer. Audit logs", easy: "Data moves only through AWS internal network with no internet exposure — secure." },
      { label: "Triggers", text: "On-demand, scheduled(minute-level), event-based. Bidirectional(S3→Salesforce also possible)", easy: "Auto-sync Salesforce → S3 every night! Or trigger immediately when new data arrives." },
      { label: "Exam Points", text: "SaaS→AWS no-code integration → AppFlow. vs EventBridge: AppFlow = data movement, EB = event routing", easy: "Salesforce/Slack data → AWS S3/Redshift → AppFlow! Configuration only, no coding!" }
    ]
  },
  cloudformation: {
    title: "AWS CloudFormation",
    subtitle: "Infrastructure as Code",
    easy: "CloudFormation creates AWS infrastructure from blueprints(code) and builds it automatically! Instead of clicking, one code file auto-creates VPC, EC2, RDS, and more.",
    points: [
      { label: "Templates", text: "JSON/YAML format. Resources(required), Parameters, Mappings, Outputs, Conditions, Metadata sections", easy: "Lego instruction manual! Resources = what to build, Parameters = inputs, Outputs = results." },
      { label: "Stacks", text: "AWS resource collection created from a template. Stack deletion removes all resources(except DeletionPolicy)", easy: "Stack = finished lego set from the manual. Delete the stack = disassemble the lego." },
      { label: "StackSets", text: "Deploy to multiple accounts and regions simultaneously. Organizations integration. Centralized deployment", easy: "Build the same blueprint across multiple accounts and regions at once! Standardized auto-deployment." },
      { label: "Drift Detection", text: "Automatically detects if actual resource config differs from template", easy: "'Did someone modify this directly in the console?' Check differences between code and actual state." },
      { label: "Exam Points", text: "IaC = CloudFormation. Rollback: auto on failure. Change Set to preview changes. Nested Stack for reuse", easy: "Infrastructure as code → CloudFormation. Preview changes → Change Set. Modularize → Nested Stack!" }
    ]
  },
  awsconfig: {
    title: "AWS Config",
    subtitle: "Resource Configuration History & Compliance",
    easy: "AWS Config is the black box for AWS resources! Records who changed security groups when, whether S3 buckets became public, and auto-alerts on rule violations!",
    points: [
      { label: "Configuration Recording", text: "Records all resource configuration changes. Time-based snapshots. Tracks who changed what when", easy: "Takes a photo every time VPC, SG, S3 configs change. View as timeline." },
      { label: "Config Rules", text: "150+ AWS Managed Rules, Custom Rules(Lambda). Continuous compliance evaluation", easy: "'S3 buckets must not be public!' Set rule → auto-alert on violation!" },
      { label: "Auto Remediation", text: "Remediation Actions. Auto-fix non-compliant resources with SSM Automation", easy: "Rule violation → auto-fix! SG port open → automatically close." },
      { label: "Aggregation", text: "Centralized config aggregation across all Organizations accounts. Config Aggregator. Multi-region", easy: "View compliance status of all accounts on one screen!" },
      { label: "Exam Points", text: "CloudTrail(who did it) vs Config(what changed). Compliance evaluation → Config Rules. Cost: per recording", easy: "CloudTrail = action log(who). Config = state log(what). Compliance automation → Config!" }
    ]
  },
  controltower: {
    title: "AWS Control Tower",
    subtitle: "Multi-Account Landing Zone",
    easy: "Control Tower is the building manager for your AWS environment! Automatically creates and manages multiple AWS accounts in a secure, standardized way. Creates security-preconfigured accounts automatically!",
    points: [
      { label: "Landing Zone", text: "Auto-setup of multi-account environment. Auto-creates log archive and audit accounts. Organizations integration", easy: "Foundation construction! Automatically creates log storage, audit accounts etc. at the start." },
      { label: "Guardrails", text: "Preventive guardrails(SCP-based): block forbidden actions. Detective guardrails(Config-based): detect violations", easy: "Preventive = 'block it'(SCP), Detective = 'alert if wrong'(Config Rules)." },
      { label: "Account Factory", text: "Auto-provision new accounts. Apply standard settings. Service Catalog integration", easy: "Request a new AWS account → automatically creates account with standard settings!" },
      { label: "Dashboard", text: "View guardrail compliance status of all accounts at a glance. Identify violating accounts. Drift detection", easy: "Manage which accounts are in violation on one screen!" },
      { label: "Exam Points", text: "Automate multi-account governance → Control Tower. SCP + Config Rules combo. Standardize with Account Factory", easy: "Auto-issue AWS accounts to new teams + apply standard security → Control Tower!" }
    ]
  },
  trustedadvisor: {
    title: "AWS Trusted Advisor",
    subtitle: "Best Practice Automatic Checks",
    easy: "Trusted Advisor is your AWS account's health doctor! Automatically checks for cost waste, security holes, performance issues, and service limit risks!",
    points: [
      { label: "5 Check Categories", text: "Cost optimization, Performance, Security, Fault tolerance, Service limits. Green(OK)/Yellow(Warning)/Red(Alert)", easy: "5-category checklist! Cost waste, security holes, service limit overruns auto-checked." },
      { label: "Free vs Paid", text: "Basic/Developer: 7 core security/limit checks. Business/Enterprise: full checks + API access", easy: "Free = basic checks only. Business+ subscription = full checks + automation possible." },
      { label: "Key Check Items", text: "Unused EBS/EIP, MFA-less root, open security groups(0.0.0.0/0), service limits at 80%", easy: "Cost waste: unused EBS. Security: root without MFA. Limits: service at 90%+ usage." },
      { label: "Automation", text: "EventBridge + Lambda to auto-act on Trusted Advisor recommendations. Weekly email alerts", easy: "Trusted Advisor finds issue → Lambda auto-fixes! e.g., auto-release unused EIP." },
      { label: "Exam Points", text: "Service limit increase request → Support Center. Full checks in Business/Enterprise plan. Difference from Compute Optimizer", easy: "Check service limits → Trusted Advisor! Actual limit increase → Support case!" }
    ]
  },
  organizations: {
    title: "AWS Organizations",
    subtitle: "Multi-Account Central Management",
    easy: "AWS Organizations manages multiple AWS accounts like one company! Separate accounts per team while controlling centrally and receiving one consolidated bill.",
    points: [
      { label: "Structure", text: "Management Account(root) → Root → OU → Member Accounts. Hierarchical policy inheritance", easy: "Like a company org chart! HQ(Management) → Division(OU) → Team(Member Account)." },
      { label: "SCP", text: "Service Control Policies. Set max allowed permissions per OU/account. Applied on top of IAM", easy: "SCP is each account's constitution! Even if IAM grants everything, SCP blocks what it forbids." },
      { label: "Consolidated Billing", text: "All account billing consolidated. Volume discounts. Reserved/Savings Plans sharing. Cost Explorer integration", easy: "10 accounts → one bill! Volume discounts applied to combined usage across accounts." },
      { label: "Service Integration", text: "AWS SSO, Config, CloudTrail, GuardDuty, Security Hub, Macie etc. enabled at Organizations level", easy: "Apply security services to all accounts at once! Auto-applied to new accounts." },
      { label: "Exam Points", text: "Consolidated billing → Organizations. Cross-account permission restriction → SCP. Central service management → Organizations", easy: "Multi-account management, billing consolidation, SCP application → AWS Organizations!" }
    ]
  },
  backup: {
    title: "AWS Backup",
    subtitle: "Centralized Backup Service",
    easy: "AWS Backup manages backups for EC2, EBS, RDS, DynamoDB and many more services in one place! Create a backup policy and it auto-backs up everything.",
    points: [
      { label: "Supported Services", text: "EC2, EBS, RDS/Aurora, DynamoDB, EFS, FSx, S3, Storage Gateway, DocumentDB, Neptune", easy: "Backup almost all AWS data services at once! No separate setup per service needed." },
      { label: "Backup Plans", text: "Backup Plan: schedule(daily/weekly/monthly), retention period, transition(cold storage), cross-region copy", easy: "'Daily auto-backup, 30-day retention, old ones to Glacier' — set rule once, runs automatically." },
      { label: "Backup Vault", text: "Backup storage. Encryption(KMS). Vault Lock(WORM): deletion prevention. Cross-account sharing", easy: "Store backups in a safe! Vault Lock = even admins can't delete. Used against ransomware." },
      { label: "Organizations Integration", text: "Apply central backup policies across entire Organizations. Auto-backup all accounts. Compliance", easy: "Same backup policy auto-applied to all accounts! No manual setup by employees needed." },
      { label: "Exam Points", text: "Centralized backup → AWS Backup. Vault Lock = WORM. Cross-region backup for disaster recovery", easy: "Central backup management for multiple services → AWS Backup! Delete-proof backup → Vault Lock!" }
    ]
  },
  iamidentitycenter: {
    title: "IAM Identity Center",
    subtitle: "Single Sign-On(SSO) Service",
    easy: "IAM Identity Center is the unified login service for all AWS accounts and apps! Log in once and access all AWS accounts plus Salesforce, Slack and more.",
    points: [
      { label: "SSO", text: "Single Sign-On. One login for multiple AWS accounts and apps. User portal provided", easy: "Log in once → access all AWS accounts! No repeated login per account." },
      { label: "Identity Sources", text: "IAM Identity Center built-in, Active Directory(AD Connector/AWS Managed AD), External IdP(Okta, Azure AD)", easy: "Log in to AWS with company AD account! Okta, Azure AD also connectable." },
      { label: "Permission Sets", text: "Permission Set: role collection assigned to account. Different permissions per OU or account. Independent of SCP", easy: "Dev team gets dev account admin, ops team gets ops account read-only — assign separately." },
      { label: "SCIM Auto-Provisioning", text: "Auto-sync when IdP adds/removes users. No manual management", easy: "HR adds employee → AWS access auto-created! Employee leaves → auto-removed." },
      { label: "Exam Points", text: "Multi-account SSO → IAM Identity Center. Cognito = app user auth, IAM Identity Center = AWS account access", easy: "Unified employee AWS login → IAM Identity Center! App sign-up/login → Cognito!" }
    ]
  },
  emr: {
    title: "Amazon EMR",
    subtitle: "Managed Big Data Processing",
    easy: "EMR lets you easily run Hadoop and Spark on AWS clusters! Process big data as a managed service instead of managing EC2 yourself.",
    points: [
      { label: "Supported Frameworks", text: "Apache Spark, Hadoop, Hive, Presto, HBase, Flink, Hudi, Iceberg. JupyterHub integration", easy: "Spark for hundreds of TB, Hive for large-scale SQL, HBase for NoSQL — all on EMR!" },
      { label: "Cluster Structure", text: "Primary Node(coordination), Core Node(processing+storage), Task Node(processing only). Spot for cost savings", easy: "Foreman(Primary) + Workers(Core) + Temps(Task). Use Spot for Task to save 80%!" },
      { label: "Storage", text: "HDFS(temporary), EMR File System(EMRFS, S3 integration), Local. S3 as data lake", easy: "S3 = permanent storage, HDFS = temp workspace. S3 data preserved after cluster termination." },
      { label: "EMR Serverless", text: "Run Spark/Hive jobs without cluster management. Auto-scaling. Per-second billing", easy: "No cluster setup — just code! Automatically provisions, processes, and releases servers." },
      { label: "Exam Points", text: "Big data processing(Spark/Hadoop) → EMR. S3 data lake + EMR combo. Spot for cost savings", easy: "Hundreds of TB data processing, ML data prep → EMR! Spot Instance = up to 90% cost savings!" }
    ]
  },
  glue: {
    title: "AWS Glue",
    subtitle: "Serverless ETL Service",
    easy: "Glue is a data transformation factory! Automatically extracts, cleans, and loads data from S3, RDS, DynamoDB without servers.",
    points: [
      { label: "ETL Jobs", text: "Serverless Apache Spark-based. Auto-generates Python/Scala scripts. Schedule or event-triggered", easy: "Extract from S3 raw data, Transform(clean), Load into analytics DB — automated." },
      { label: "Data Catalog", text: "Central metadata repository. Shared with Athena, Redshift Spectrum, EMR. Glue Crawler auto-discovers", easy: "'What data exists where in S3' — auto-survey and create catalog(Crawler)." },
      { label: "Glue DataBrew", text: "No-code visual data preparation. 250+ transformation functions. Non-developers can use", easy: "Clean data with clicks, no coding! Transform data like Excel." },
      { label: "Glue Studio", text: "Visual ETL pipeline design. Drag and drop. Real-time monitoring", easy: "Connect ETL pipeline visually like drawing! No code needed." },
      { label: "Exam Points", text: "Serverless ETL → Glue. Data Catalog → Glue Catalog. Run Crawler before Athena query", easy: "S3 data transform/clean → Glue ETL! Athena querying S3 requires Glue Catalog!" }
    ]
  },
  lakeformation: {
    title: "AWS Lake Formation",
    subtitle: "Data Lake Construction & Security",
    easy: "Lake Formation makes it easy to build a data lake(S3-based large-scale data store) and control access at granular levels like 'this person can only see this column'!",
    points: [
      { label: "Data Lake Construction", text: "S3-based. Automates data ingestion, cleaning, classification. Tightly integrated with Glue", easy: "Collect raw data in S3, Lake Formation handles cleaning, security, and access control." },
      { label: "Fine-Grained Access Control", text: "Column, Row, Cell-level access control. Data masking. Tag-based control(LF-Tags)", easy: "'Marketing team can't see customer name column', 'PII is masked' — granular control." },
      { label: "Integrated Services", text: "Athena, Redshift Spectrum, EMR, Glue, QuickSight integration. Centralized permission management", easy: "Apply consistent access control across all analytics services. Manage permissions from one place." },
      { label: "Blueprints", text: "Data ingestion automation templates. Auto-build RDS/S3→data lake pipelines", easy: "A few clicks to auto-create pipeline that loads RDS data into S3 data lake." },
      { label: "Exam Points", text: "Fine-grained permissions for data lake → Lake Formation. S3 IAM alone cannot do row/column-level control", easy: "S3 data lake + row/column-level access control → Lake Formation! IAM/S3 policies alone can't do it!" }
    ]
  },
  quicksight: {
    title: "Amazon QuickSight",
    subtitle: "Serverless Cloud BI",
    easy: "QuickSight is a serverless BI tool that visualizes data as charts! Connect S3, RDS, Redshift data and immediately create dashboards and charts.",
    points: [
      { label: "Data Sources", text: "S3, Athena, RDS/Aurora, Redshift, DynamoDB, Salesforce, external DBs", easy: "Connect almost all AWS data sources. Create charts with just a few clicks!" },
      { label: "SPICE", text: "Super-fast Parallel In-memory Calculation Engine. Data memory caching. Fast query response", easy: "Pre-loads data into memory for fast dashboard loading!" },
      { label: "ML Insights", text: "Anomaly Detection, Forecasting, Auto-Narratives(auto-generated explanations)", easy: "AI auto-detects 'this month's revenue is abnormally low'! Trend forecasting also automatic." },
      { label: "Embedded Analytics", text: "Embed dashboards in external apps. SDK. Q(natural language queries). Anonymous access possible", easy: "'Add analytics dashboard to customer app'! QuickSight embeddable in apps." },
      { label: "Exam Points", text: "Serverless BI visualization → QuickSight. Pairs with Redshift. Per-user billing(Standard/Enterprise)", easy: "Data visualization/dashboards → QuickSight! Choose AWS-native instead of other BI tools." }
    ]
  },
  sagemaker: {
    title: "Amazon SageMaker",
    subtitle: "Fully Managed ML Platform",
    easy: "SageMaker supports the entire ML model lifecycle — build, train, and deploy! From data prep to model deployment, all in one platform.",
    points: [
      { label: "SageMaker Studio", text: "Integrated ML development environment. JupyterLab-based. Full cycle from data prep to training to deployment", easy: "Integrated IDE for ML! Jupyter notebooks + data management + experiment tracking in one screen." },
      { label: "Training", text: "Managed training instances(GPU). Distributed training. Spot Instance(up to 90% savings). Experiment tracking", easy: "Start training without GPU server management! Save 90% on training with Spot." },
      { label: "Deployment", text: "Real-time Endpoint(low latency), Serverless(intermittent traffic), Batch Transform(bulk inference)", easy: "Deploy model as web service API! Serverless option = zero cost when no traffic." },
      { label: "Autopilot & Canvas", text: "AutoML: auto feature engineering, model selection, hyperparameter tuning. Canvas: no-code ML", easy: "Autopilot = feed data, auto-selects best model! Canvas = ML without coding." },
      { label: "Exam Points", text: "ML model training and deployment → SageMaker. Feature Store, Model Registry, Pipelines. Difference from Rekognition", easy: "Build your own ML model → SageMaker. Pre-built AI APIs(image recognition etc.) → Rekognition!" }
    ]
  }
};

export type ConceptKey = keyof typeof CONCEPTS_EN;
