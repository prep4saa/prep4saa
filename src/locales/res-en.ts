type ChalI18n = {
  title: string;
  scenario: string;
  steps: Array<{ title: string; desc: string }>;
  explanation: string;
};

export const RES_CHALLENGES_I18N: Record<number, ChalI18n> = {
  1: {
    title: "Configure EC2 Auto Scaling Group",
    scenario: "Your server crashes every time traffic spikes. Adding EC2 instances manually is too slow. Create an Auto Scaling Group to automatically scale instances based on traffic.",
    steps: [
      { title: "Create Launch Template", desc: "Create a Launch Template to use for Auto Scaling." },
      { title: "Create Auto Scaling Group", desc: "Create an ASG with min 2, max 10 instances." },
      { title: "Add CPU-based Scaling Policy", desc: "Create a policy to add instances when CPU exceeds 70%." },
      { title: "Check ASG Status", desc: "Verify the Auto Scaling Group was created successfully." },
    ],
    explanation: "An Auto Scaling Group automatically creates/terminates instances based on the Launch Template. TargetTrackingScaling maintains the target CPU utilization automatically. Deploy across multiple AZs to ensure high availability.",
  },
  2: {
    title: "Configure Application Load Balancer",
    scenario: "You have 2 web servers but traffic is being sent to only one without any load balancing. Create an ALB to distribute traffic evenly and automatically exclude failed servers via health checks.",
    steps: [
      { title: "Create Target Group", desc: "Create a Target Group to register EC2 instances." },
      { title: "Create ALB", desc: "Create a public-facing Application Load Balancer." },
      { title: "Add Listener", desc: "Add an HTTP port 80 listener to the ALB." },
      { title: "Register Instances", desc: "Register 2 EC2 instances to the Target Group." },
      { title: "Check Target Health", desc: "Verify the health check status of registered instances." },
    ],
    explanation: "ALB is a Layer 7 (HTTP/HTTPS) load balancer supporting path-based and host-based routing. The /health check automatically removes unhealthy instances. You must specify subnets in at least 2 AZs.",
  },
  3: {
    title: "RDS Multi-AZ Failover",
    scenario: "Your production RDS instance is in a single AZ. Switch to Multi-AZ for a failover drill and test an actual failover.",
    steps: [
      { title: "Check Current RDS Settings", desc: "Verify the Multi-AZ configuration of the production DB." },
      { title: "Enable Multi-AZ", desc: "Modify the instance to enable Multi-AZ." },
      { title: "Confirm Multi-AZ Status", desc: "Confirm Multi-AZ is enabled." },
      { title: "Trigger Manual Failover", desc: "Trigger a manual failover to test the process." },
    ],
    explanation: "RDS Multi-AZ maintains a synchronous standby replica in a different AZ. During failover the CNAME switches to the standby (typically 60–120 s). Multi-AZ improves availability but does not improve read performance — use Read Replicas for that.",
  },
  4: {
    title: "S3 Cross-Region Replication (CRR)",
    scenario: "Your S3 bucket exists only in us-east-1. To prepare for a regional disaster, set up Cross-Region Replication (CRR) to automatically copy new objects to ap-northeast-2.",
    steps: [
      { title: "Enable Versioning on Source Bucket", desc: "Enable versioning on the source bucket (required for CRR)." },
      { title: "Enable Versioning on Destination Bucket", desc: "Enable versioning on the destination bucket as well." },
      { title: "Create CRR Replication Rule", desc: "Set up a replication rule to copy all objects to the destination bucket." },
      { title: "Verify Replication Status", desc: "Confirm that the replication rule is active." },
    ],
    explanation: "CRR automatically replicates new objects across regions. Both source and destination buckets must have versioning enabled. Existing objects are not replicated — use S3 Batch Operations for that. Replication is asynchronous and best-effort.",
  },
  5: {
    title: "Route 53 Health Check + Failover",
    scenario: "Your primary server in us-east-1 is down and all traffic should automatically failover to the secondary server in us-west-2. Configure Route 53 health checks and failover routing.",
    steps: [
      { title: "Create Health Check", desc: "Create a health check for the primary server endpoint." },
      { title: "Create Primary Failover Record", desc: "Create a PRIMARY failover DNS record." },
      { title: "Create Secondary Failover Record", desc: "Create a SECONDARY failover DNS record for us-west-2." },
      { title: "Verify Failover", desc: "Confirm the health check status and failover configuration." },
    ],
    explanation: "Route 53 failover routing sends traffic to the secondary endpoint when the primary health check fails. Health checks run every 30 seconds by default. Combine with CloudWatch alarms for more complex failover conditions.",
  },
  6: {
    title: "Distribute Read Load with RDS Read Replica",
    scenario: "Read queries are overloading the production RDS master. Create a Read Replica and route SELECT queries to it to reduce CPU on the master.",
    steps: [
      { title: "Check Master DB Status", desc: "Check the current CPU and connection count of the master DB." },
      { title: "Create Read Replica", desc: "Create a read-only replica of the master instance." },
      { title: "Verify Replica Status", desc: "Confirm the replica is available and replicating." },
      { title: "Monitor Replication Lag", desc: "Check the ReplicaLag metric to monitor replication delay." },
    ],
    explanation: "RDS Read Replicas distribute read load from the master DB. Route SELECT queries to the replica endpoint, and INSERT/UPDATE/DELETE to the master. If ReplicaLag increases, upgrade the replica spec or optimize queries.",
  },
  7: {
    title: "Automate EC2 AMI Backups",
    scenario: "You are creating AMI backups manually once a week, but if a failure occurs mid-week your restore point is too old. Automate daily AMI backups using AWS Backup.",
    steps: [
      { title: "Create Backup Vault", desc: "Create an AWS Backup vault to store backups." },
      { title: "Create Backup Plan", desc: "Create a backup plan with daily AMI snapshots." },
      { title: "Assign Backup Resources", desc: "Select EC2 instances to include in the backup plan." },
      { title: "Verify Backup Jobs", desc: "Confirm that backup jobs are running." },
    ],
    explanation: "AWS Backup centrally manages backups across EC2, RDS, EFS, DynamoDB, and more. Retention policies and cross-region copy rules can be configured per vault. Tag-based selection makes it easy to manage backups for all instances sharing the same tag.",
  },
  8: {
    title: "Handle Failed Messages with SQS Dead Letter Queue",
    scenario: "Some SQS messages fail to process and keep being retried, blocking the queue. Configure a Dead Letter Queue (DLQ) to move failed messages and enable separate investigation.",
    steps: [
      { title: "Create DLQ", desc: "Create a standard SQS queue to serve as the Dead Letter Queue." },
      { title: "Configure DLQ on Main Queue", desc: "Set the DLQ on the main queue with maxReceiveCount=3." },
      { title: "Verify DLQ Configuration", desc: "Confirm the DLQ is attached to the main queue." },
      { title: "Monitor DLQ Depth", desc: "Set a CloudWatch alarm for DLQ message count." },
    ],
    explanation: "A DLQ receives messages that exceed the maxReceiveCount retry limit. Set maxReceiveCount to 3–5 to distinguish genuine failures from transient errors. Monitor DLQ depth with CloudWatch and investigate root causes when messages accumulate.",
  },
  9: {
    title: "Set Up ElastiCache Redis Cluster",
    scenario: "Session data is stored directly in RDS, adding unnecessary DB load. Move session storage to ElastiCache Redis to reduce latency and free up DB connections.",
    steps: [
      { title: "Create ElastiCache Subnet Group", desc: "Create a subnet group for the ElastiCache cluster." },
      { title: "Create Redis Replication Group", desc: "Create a Redis replication group with automatic failover." },
      { title: "Verify Cluster Status", desc: "Confirm the cluster is available." },
      { title: "Check Redis Connection", desc: "Verify the endpoint and port of the Redis cluster." },
    ],
    explanation: "ElastiCache Redis provides in-memory storage to reduce DB load and lower response times. Automatic failover in a replication group ensures high availability. Use Redis cluster mode for large datasets requiring horizontal sharding.",
  },
  10: {
    title: "CloudWatch Alarm-based Auto Scaling",
    scenario: "CPU spikes above 80% but there is no alarm and no automatic response. Create CloudWatch alarms and connect them to Auto Scaling policies for automatic scale-out.",
    steps: [
      { title: "Create Scale-Out CloudWatch Alarm", desc: "Create an alarm that triggers when CPU exceeds 80%." },
      { title: "Create Scale-Out Scaling Policy", desc: "Create a step scaling policy to add 2 instances." },
      { title: "Create Scale-In Alarm", desc: "Create an alarm for when CPU drops below 30%." },
      { title: "Link Alarms to Policies", desc: "Connect the alarms to the scaling policies." },
    ],
    explanation: "Step Scaling policies add/remove a fixed number of instances when a CloudWatch alarm fires. Set scale-out and scale-in cooldown periods (e.g., 300 s) to avoid oscillation. Target Tracking Scaling is simpler and generally preferred.",
  },
  11: {
    title: "Mix EC2 Spot and On-Demand Instances",
    scenario: "Batch processing only uses On-Demand instances, which is costly. Mix Spot Instances for cheaper compute while keeping On-Demand as a fallback.",
    steps: [
      { title: "Check Current ASG Configuration", desc: "Verify the current instance purchase options." },
      { title: "Add Spot Instance Mix Policy", desc: "Configure a mixed instance policy with 70% Spot / 30% On-Demand." },
      { title: "Verify Mixed Fleet", desc: "Confirm both Spot and On-Demand instances are running." },
      { title: "Monitor Spot Interruptions", desc: "Set up an EventBridge rule to detect Spot interruption warnings." },
    ],
    explanation: "Mixed instance policies allow you to combine Spot and On-Demand instances in an ASG. Spot instances can reduce costs by up to 90% but may be interrupted. Setting a base On-Demand count ensures minimum capacity. SpotAllocationStrategy=lowest-price or capacity-optimized controls placement.",
  },
  12: {
    title: "Protect DynamoDB with Lambda Concurrency Limit",
    scenario: "A traffic surge causes thousands of Lambda functions to run simultaneously and overwhelm DynamoDB with connections. Set Reserved Concurrency on Lambda to cap the connection rate.",
    steps: [
      { title: "Check Current Lambda Concurrency", desc: "Check the current concurrent execution count." },
      { title: "Set Reserved Concurrency to 100", desc: "Limit Lambda to 100 concurrent executions." },
      { title: "Set DynamoDB Provisioned Throughput", desc: "Align DynamoDB capacity with the concurrency limit." },
      { title: "Set Provisioned Concurrency", desc: "Pre-warm 10 Lambda instances to eliminate cold starts." },
    ],
    explanation: "Lambda Reserved Concurrency prevents a function from exceeding a set number of simultaneous executions. This protects downstream services (DynamoDB, RDS) from connection storms. Provisioned Concurrency keeps instances initialized to eliminate cold starts.",
  },
  13: {
    title: "DynamoDB Global Tables (Multi-Region)",
    scenario: "DynamoDB is only in us-east-1 and a region outage would cause a total service disruption. Set up Global Tables to replicate data to ap-northeast-2 automatically.",
    steps: [
      { title: "Enable DynamoDB Streams", desc: "Enable Streams on the table (required for Global Tables)." },
      { title: "Create Global Table Replica", desc: "Add ap-northeast-2 as a replica region." },
      { title: "Verify Replica Status", desc: "Confirm the replica table is active." },
      { title: "Test Cross-Region Write", desc: "Write from ap-northeast-2 and verify replication to us-east-1." },
    ],
    explanation: "DynamoDB Global Tables provides multi-region active-active replication. Any region can accept writes and changes propagate within seconds. Concurrent writes in different regions use last-writer-wins semantics. Requires DynamoDB Streams.",
  },
  14: {
    title: "Reduce S3 Costs with Lifecycle Policy",
    scenario: "Log files are piling up in S3 Standard. Files older than 30 days are rarely accessed. Set a Lifecycle policy to automatically transition to cheaper storage classes.",
    steps: [
      { title: "Check Current Storage Usage", desc: "Check the total size and object count of the bucket." },
      { title: "Add Lifecycle Rule", desc: "Set transitions to S3-IA at 30 days, Glacier at 90 days." },
      { title: "Verify Lifecycle Rule", desc: "Confirm the lifecycle rule is enabled." },
      { title: "Enable Storage Class Analysis", desc: "Enable access-pattern analysis for data-driven decisions." },
    ],
    explanation: "S3 Lifecycle policies automatically move objects to cheaper storage classes or delete them. S3-IA saves ~58% vs Standard; Glacier saves ~80% vs S3-IA. Note S3-IA has a 128 KB minimum object size and 30-day minimum storage charge.",
  },
  15: {
    title: "Auto-Replace Failed EC2 Instances",
    scenario: "When an EC2 instance fails its system status check it must be restarted manually. Set up a CloudWatch alarm to trigger an automatic reboot or recover action.",
    steps: [
      { title: "Create System Status Check Alarm", desc: "Create an alarm for EC2 StatusCheckFailed_System." },
      { title: "Add Auto-Recover Action", desc: "Add an automatic recover action to the alarm." },
      { title: "Test Recovery", desc: "Verify the alarm triggers an EC2 recover action." },
      { title: "Check Recovery History", desc: "Review CloudWatch alarm history for past recovery events." },
    ],
    explanation: "EC2 Recover migrates the instance to new hardware while preserving the instance ID, IP, and EBS volumes. It works for StatusCheckFailed_System (hardware failures) but not StatusCheckFailed_Instance. For ASG-managed instances, health checks handle termination and replacement automatically.",
  },
  16: {
    title: "Deploy ECS Fargate Service",
    scenario: "Container deployments currently require managing EC2 instances. Move to ECS Fargate to run containers without server management, and configure an ALB for traffic distribution.",
    steps: [
      { title: "Create ECS Cluster", desc: "Create an ECS cluster for Fargate workloads." },
      { title: "Register Task Definition", desc: "Define the container image, CPU, and memory in a task definition." },
      { title: "Create ECS Service", desc: "Deploy the task as a service with ALB integration." },
      { title: "Verify Service Status", desc: "Confirm the desired and running task counts match." },
    ],
    explanation: "Fargate eliminates the need to manage EC2 infrastructure. Task definitions specify CPU and memory; Fargate allocates the right size automatically. ECS Service integrates with ALB and CloudWatch for load distribution and monitoring.",
  },
  17: {
    title: "Enable ELB Access Logs",
    scenario: "There is an ongoing intermittent 5xx error but no request logs to diagnose it. Enable ALB access logs stored in S3 to analyze request patterns and identify problem sources.",
    steps: [
      { title: "Create Log S3 Bucket", desc: "Create an S3 bucket to store ALB access logs." },
      { title: "Set Bucket Policy", desc: "Grant the ALB service account permission to write logs." },
      { title: "Enable Access Logs", desc: "Enable access logs on the ALB pointing to the S3 bucket." },
      { title: "Verify Log Files", desc: "Confirm log files are being created in S3." },
    ],
    explanation: "ALB access logs capture every request including client IP, latency, response code, and target response. Log delivery is best-effort (not guaranteed). Query logs with Athena for efficient analysis. Enable S3 lifecycle to manage log retention costs.",
  },
  18: {
    title: "Automate Tasks with EventBridge Scheduler",
    scenario: "A nightly DB cleanup job runs on a cron expression in a Lambda function, but the function needs to be triggered somehow. Use EventBridge Scheduler to trigger it automatically every day at midnight.",
    steps: [
      { title: "Create EventBridge Schedule", desc: "Create a cron schedule that triggers Lambda at midnight daily." },
      { title: "Grant Lambda Invoke Permission", desc: "Grant EventBridge permission to invoke the Lambda function." },
      { title: "Verify Schedule", desc: "Confirm the schedule is enabled and connected to Lambda." },
      { title: "Check CloudWatch Logs", desc: "Verify the Lambda function executed at the scheduled time." },
    ],
    explanation: "EventBridge Scheduler supports cron and rate expressions for scheduled invocations. Unlike CloudWatch Events (now part of EventBridge), the Scheduler is dedicated to scheduling with finer granularity. Set a DLQ on the schedule for retry and failure handling.",
  },
  19: {
    title: "SNS Fan-Out Pattern",
    scenario: "When an order is placed, inventory update, email notification, and analytics recording must all happen simultaneously. Use SNS fan-out to publish once and trigger multiple SQS queues in parallel.",
    steps: [
      { title: "Create SNS Topic", desc: "Create an SNS topic for order events." },
      { title: "Create Processing Queues", desc: "Create SQS queues for inventory, email, and analytics." },
      { title: "Subscribe Queues to Topic", desc: "Subscribe all three SQS queues to the SNS topic." },
      { title: "Test Fan-Out with Test Message", desc: "Publish a test message and verify delivery to all queues." },
    ],
    explanation: "The SNS fan-out pattern decouples publishers from subscribers. A single SNS publish triggers all subscribers simultaneously. Each SQS queue processes independently and can fail without affecting others. This pattern improves scalability and resilience.",
  },
  20: {
    title: "CloudFront Cache Invalidation and Deployment",
    scenario: "After deploying a new version of the website, users still see the old cached content. Invalidate the CloudFront cache to force all edge locations to fetch the latest version.",
    steps: [
      { title: "Check Current Distribution", desc: "Check the current CloudFront distribution ID and status." },
      { title: "Create Cache Invalidation", desc: "Invalidate all cached objects (/*)." },
      { title: "Monitor Invalidation Progress", desc: "Track the invalidation status until it completes." },
      { title: "Verify New Content", desc: "Confirm the updated content is served from edge locations." },
    ],
    explanation: "CloudFront cache invalidation removes objects from all edge caches so the next request fetches a fresh copy from origin. Wildcard invalidations (/*) count as one request. For frequent deployments, use versioned file names instead to avoid invalidation costs.",
  },
  21: {
    title: "Scale Kinesis Data Stream Throughput",
    scenario: "WriteProvisionedThroughputExceeded errors are occurring on the Kinesis stream. Increase shards from 2 to 4 to double the write throughput.",
    steps: [
      { title: "Check Current Stream Status", desc: "Verify the current shard count and stream status." },
      { title: "Increase Shard Count", desc: "Scale the stream from 2 to 4 shards." },
      { title: "Verify Scale Completion", desc: "Confirm the new shard count is active." },
      { title: "Set Write Throttle Alarm", desc: "Create a CloudWatch alarm for write throttling recurrence." },
    ],
    explanation: "Each Kinesis shard supports 1 MB/s write (1000 records/s) and 2 MB/s read. Shard scaling via UNIFORM_SCALING only supports doubling. Design partition keys for even distribution across shards to avoid hot shards.",
  },
  22: {
    title: "Point-in-Time Restore with RDS Snapshot",
    scenario: "A developer accidentally deleted important data. Restore the RDS instance to the point just before the deletion using an automated snapshot.",
    steps: [
      { title: "List Available Snapshots", desc: "Find automated snapshots from before the data deletion." },
      { title: "Restore to New Instance", desc: "Restore a snapshot to a new RDS instance." },
      { title: "Verify Restored Data", desc: "Confirm the restored instance contains the data." },
      { title: "Update Application Endpoint", desc: "Update the app configuration to point to the restored DB." },
    ],
    explanation: "RDS automated snapshots enable point-in-time recovery up to 5 minutes before the current time (with transaction logs). Restore always creates a NEW instance — the original is unaffected. After verifying data, update the connection string or rename the instance.",
  },
  23: {
    title: "Lambda Error Handling and Retry Configuration",
    scenario: "Lambda processes messages from SQS but temporary errors cause retry storms. Configure a DLQ, set retry limits, and add error monitoring.",
    steps: [
      { title: "Configure Lambda DLQ", desc: "Set a DLQ on the Lambda function for failed invocations." },
      { title: "Set Max Retry Attempts", desc: "Set maximum retry attempts to 2 for the Lambda function." },
      { title: "Add Error Rate Alarm", desc: "Create a CloudWatch alarm for Lambda error rate." },
      { title: "Verify DLQ Delivery", desc: "Confirm failed events are routed to the DLQ." },
    ],
    explanation: "Lambda has built-in retry with exponential backoff for asynchronous invocations. Setting a DLQ (or Dead-Letter destination) captures events that exceed the retry limit. Monitor Error / Invocations ratio with CloudWatch and alert when above 5%.",
  },
  24: {
    title: "CodeDeploy Blue/Green Deployment",
    scenario: "Deployments currently cause downtime. Use CodeDeploy blue/green deployment to switch traffic instantly with zero downtime and enable instant rollback.",
    steps: [
      { title: "Create CodeDeploy Application", desc: "Create a CodeDeploy application for EC2/On-premises." },
      { title: "Create Deployment Group", desc: "Set up a blue/green deployment group with ALB." },
      { title: "Create Deployment", desc: "Deploy the new version using a blue/green deployment." },
      { title: "Verify Traffic Switch", desc: "Confirm traffic has switched to the new (green) fleet." },
    ],
    explanation: "Blue/Green deployment spins up a new fleet (green) and switches ALB traffic instantly. If issues are detected the ALB routes back to the original fleet (blue) within seconds. The blue fleet is kept for a retention period before termination.",
  },
  25: {
    title: "API Gateway + Lambda Throttling",
    scenario: "A sudden API burst causes Lambda concurrency exhaustion and downstream DB overload. Configure API Gateway throttling and Lambda reserved concurrency to protect the system.",
    steps: [
      { title: "Check Current API Usage", desc: "Check recent request rates and error rates." },
      { title: "Set Stage-Level Throttle", desc: "Set rate=1000/s and burst=2000 on the prod stage." },
      { title: "Set Lambda Reserved Concurrency", desc: "Limit the API Lambda to 200 concurrent executions." },
      { title: "Verify Throttle with Usage Plan", desc: "Check that 429 responses are returned when limits are hit." },
    ],
    explanation: "API Gateway throttling rate limits requests at the stage or method level. Rate is the steady-state requests per second; burst is the maximum spike requests. Lambda Reserved Concurrency acts as a second layer of protection. Clients should implement exponential backoff on 429 responses.",
  },
  26: {
    title: "Aurora Serverless for Variable Traffic",
    scenario: "Database load varies wildly — near zero at night and very high during the day. Migrate to Aurora Serverless v2 to automatically scale capacity without manual intervention.",
    steps: [
      { title: "Check Current Aurora Config", desc: "Check the current Aurora instance class and capacity." },
      { title: "Create Aurora Serverless v2 Cluster", desc: "Create a new Aurora cluster with Serverless v2 capacity." },
      { title: "Set Scaling Configuration", desc: "Set min=0.5 ACU, max=16 ACU for auto-scaling." },
      { title: "Verify Auto-Scaling", desc: "Monitor ACU consumption to confirm auto-scaling." },
    ],
    explanation: "Aurora Serverless v2 scales in fine-grained increments (0.5 ACU) within seconds. It is cost-effective for variable traffic — you pay only for what you use. It integrates with Multi-AZ and read replicas for high availability.",
  },
  27: {
    title: "Configure CloudWatch Dashboard",
    scenario: "There is no single view of service health — teams check different consoles during incidents. Build a CloudWatch dashboard showing ALB latency, Lambda errors, RDS CPU, and cache hit rate.",
    steps: [
      { title: "Create Dashboard", desc: "Create a new CloudWatch dashboard." },
      { title: "Add ALB Latency Widget", desc: "Add a metric widget for ALB TargetResponseTime." },
      { title: "Add Lambda Error Rate Widget", desc: "Add a widget for Lambda Errors and Invocations." },
      { title: "Verify Dashboard", desc: "Confirm all widgets are displaying data." },
    ],
    explanation: "CloudWatch dashboards aggregate metrics from multiple services into one view. Use metric math to calculate rates (Errors/Invocations). Share dashboards with teams or embed in wikis using snapshot URLs. Automatic refresh intervals keep data current during incidents.",
  },
  28: {
    title: "Secure Access with Systems Manager Session Manager",
    scenario: "SSH access uses a shared key pair and a bastion host that must be managed. Replace with SSM Session Manager for keyless, auditable, and VPN-free shell access.",
    steps: [
      { title: "Attach SSM IAM Role to EC2", desc: "Attach the AmazonSSMManagedInstanceCore policy to the instance role." },
      { title: "Verify SSM Agent Status", desc: "Confirm the SSM agent is online for the instance." },
      { title: "Start Session Manager Session", desc: "Open a shell session using Session Manager." },
      { title: "Check Session Logs in CloudWatch", desc: "Verify session activity is logged to CloudWatch Logs." },
    ],
    explanation: "Session Manager provides browser-based and CLI shell access without open inbound ports, bastion hosts, or SSH keys. All sessions are logged to CloudWatch Logs or S3 for audit. Requires SSM Agent (pre-installed on Amazon Linux 2023 / Ubuntu) and internet or VPC endpoint access to SSM.",
  },
  29: {
    title: "Maintain IP During EC2 Replacement with Elastic IP",
    scenario: "When an EC2 instance is replaced the public IP changes and DNS must be updated. Assign an Elastic IP to the new instance to keep the same public IP address.",
    steps: [
      { title: "Allocate Elastic IP", desc: "Allocate a new Elastic IP address." },
      { title: "Associate EIP with Instance", desc: "Attach the EIP to the EC2 instance." },
      { title: "Verify EIP Association", desc: "Confirm the EIP is attached and reachable." },
      { title: "Test Reassociation on Replacement", desc: "Detach from the old instance and attach to the new one." },
    ],
    explanation: "Elastic IPs are static IPv4 addresses that can be instantly remapped to any instance in the same region. This enables blue/green-style instance replacement without DNS TTL delays. Unattached EIPs incur hourly charges — always release unused ones.",
  },
  30: {
    title: "Disaster Recovery Simulation — Regional Failure Response",
    scenario: "A simulated us-east-1 regional failure has occurred. Execute the DR runbook: verify backup region resources, start standby instances, switch DNS, and confirm service recovery.",
    steps: [
      { title: "Check Backup Region Resources", desc: "Verify EC2, RDS, and networking in ap-northeast-2." },
      { title: "Start Standby RDS Instance", desc: "Start the standby DB in the backup region." },
      { title: "Update Route 53 DNS", desc: "Switch the DNS record to the backup region endpoint." },
      { title: "Verify Service Recovery", desc: "Confirm the service is healthy in the backup region." },
    ],
    explanation: "DR procedures: verify backup region resources → start instances/DB → switch DNS → verify service. To minimize RTO, keep DR instances as warm standby and configure Route 53 automatic failover. RTO is the target recovery time; RPO is the acceptable data loss window.",
  }
};