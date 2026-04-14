type ChalI18n = {
  title: string;
  scenario: string;
  steps: Array<{ title: string; desc: string }>;
  explanation: string;
};

export const PERF_CHALLENGES_I18N: Record<number, ChalI18n> = {
  1: {
    title: "ElastiCache Redis Caching Setup",
    scenario: "An API that queries RDS directly has response times exceeding 500ms. Cache frequently accessed data in ElastiCache Redis to reduce response time to under 10ms.",
    steps: [
      { title: "Create ElastiCache Subnet Group", desc: "Create a subnet group to place your ElastiCache cluster in." },
      { title: "Create Redis Cluster", desc: "Create a Redis 6.x cluster using the cache.r6g.large instance type." },
      { title: "Verify Cluster Endpoint", desc: "Confirm the Redis endpoint your application will connect to." },
      { title: "Check Cache Hit Rate in CloudWatch", desc: "Query the CacheHits / CacheMisses metrics in ElastiCache to verify caching efficiency." },
    ],
    explanation: "ElastiCache Redis is an in-memory cache that reduces RDS load and dramatically cuts response times. Monitor cache efficiency using the CacheHits/CacheMisses ratio. The cache.r6g family is Graviton2-based and offers excellent price-to-performance.",
  },
  2: {
    title: "CloudFront Distribution and TTL Optimization",
    scenario: "Static files (images, JS, CSS) are being served directly from S3, causing slow responses for global users. Place CloudFront in front and optimize TTL to leverage edge caching.",
    steps: [
      { title: "Create Origin Access Control", desc: "Create an OAC to ensure the S3 bucket is only accessible through CloudFront." },
      { title: "Create CloudFront Distribution", desc: "Create a CloudFront distribution with the S3 bucket as the origin." },
      { title: "Create Cache Policy (Long TTL)", desc: "Create a cache policy with a 24-hour (86400 second) TTL for static assets." },
      { title: "Verify Distribution Status", desc: "Confirm the CloudFront distribution has finished deploying." },
      { title: "Check Cache Hit Rate", desc: "Verify caching efficiency using the CloudFront CacheHitRate metric." },
    ],
    explanation: "CloudFront caches static files at edge locations worldwide, reducing origin server load and response times. Set long TTLs (24h+) for static assets and include a hash in filenames to manage cache invalidation.",
  },
  3: {
    title: "RDS Read Replica for Read Distribution",
    scenario: "Read queries are overloading the production RDS instance. Create a Read Replica to distribute SELECT queries and reduce CPU usage on the primary DB.",
    steps: [
      { title: "Check Current RDS Instance", desc: "Review the primary DB's specifications and current read load." },
      { title: "Create Read Replica", desc: "Create a read-only replica in the same AZ." },
      { title: "Verify Replica Status", desc: "Confirm the Read Replica has reached the available state." },
      { title: "Monitor Replication Lag in CloudWatch", desc: "Monitor replication delay using the ReplicaLag metric." },
    ],
    explanation: "RDS Read Replicas distribute read load away from the primary DB. Route SELECT queries to the Replica endpoint and INSERT/UPDATE/DELETE to the primary endpoint in your application. If ReplicaLag increases, upgrade the Replica instance type or optimize queries.",
  },
  4: {
    title: "DynamoDB DAX Cluster Setup",
    scenario: "DynamoDB table query responses are in single-digit milliseconds, but high-frequency reads are causing RCU costs to spike. Place a DAX cluster in front to reduce both response time and cost through caching.",
    steps: [
      { title: "Create DAX Subnet Group", desc: "Create a subnet group for the DAX cluster." },
      { title: "Create DAX Cluster", desc: "Create a DAX cluster with 3 dax.r5.large nodes." },
      { title: "Verify DAX Cluster Status", desc: "Confirm the DAX cluster is in the available state." },
      { title: "Check DAX Cache Hit Rate", desc: "Verify cache efficiency using the DAX ItemCacheHits metric." },
    ],
    explanation: "DAX is a fully DynamoDB-compatible in-memory cache that reduces read response times to microseconds. Switching to the DAX SDK minimizes code changes. Write operations pass through DAX directly to DynamoDB.",
  },
  5: {
    title: "Lambda Memory Optimization",
    scenario: "A Lambda function frequently hits its timeout (3 seconds). Currently set to 128MB — increasing memory also proportionally increases CPU. Find the optimal memory size to simultaneously reduce execution time and cost.",
    steps: [
      { title: "Check Current Lambda Configuration", desc: "Review the function's memory, timeout, and recent execution durations." },
      { title: "Increase Lambda Memory to 1024MB", desc: "Update the memory to 1024MB and timeout to 10 seconds." },
      { title: "Check CloudWatch Duration Metric", desc: "Verify the change in average execution time after the memory increase." },
      { title: "Create Throttles Alarm", desc: "Set up an alarm to trigger when Lambda throttling occurs." },
      { title: "Set Reserved Concurrency", desc: "Set a Reserved Concurrency of 50 for this function." },
    ],
    explanation: "Increasing Lambda memory proportionally increases CPU and network bandwidth. Scaling from 128MB to 1024MB (8x) often reduces execution time enough that total cost actually decreases. Use the AWS Lambda Power Tuning tool to automatically find the optimal memory setting.",
  },
  6: {
    title: "S3 Transfer Acceleration",
    scenario: "Overseas offices (Europe, Asia) are experiencing very slow upload speeds when transferring large files to an S3 bucket in us-east-1. Enable S3 Transfer Acceleration to provide a faster upload path through CloudFront edges.",
    steps: [
      { title: "Enable Transfer Acceleration", desc: "Enable Transfer Acceleration on the target S3 bucket." },
      { title: "Verify Acceleration Configuration", desc: "Confirm Transfer Acceleration has been enabled." },
      { title: "Run Speed Comparison Test", desc: "Test upload speed using the accelerated endpoint." },
      { title: "Enable S3 Bucket Metrics", desc: "Enable S3 request metrics to track upload performance." },
    ],
    explanation: "S3 Transfer Acceleration optimizes uploads via the CloudFront edge network. The accelerated endpoint format is [bucket].s3-accelerate.amazonaws.com. By replacing the internet path from overseas to an AWS region with the AWS global network, you can expect 50–500% speed improvements.",
  },
  7: {
    title: "EBS gp2 → gp3 Volume Upgrade",
    scenario: "Disk I/O is a bottleneck on a production EC2 server. It's currently using a 500GB gp2 volume — upgrading to gp3 allows independent IOPS configuration for better performance at a lower cost.",
    steps: [
      { title: "Check Current EBS Volume", desc: "Review the current configuration of the EBS volume attached to the instance." },
      { title: "Modify Volume: gp2 → gp3", desc: "Change to gp3 and configure 6000 IOPS and 250MB/s throughput." },
      { title: "Verify Volume Modification Status", desc: "Confirm the volume modification has completed." },
      { title: "Check VolumeReadOps / VolumeWriteOps", desc: "Use CloudWatch to verify the IOPS improvement." },
    ],
    explanation: "gp3 is 20% cheaper than gp2 while providing a baseline of 3000 IOPS and 125MB/s throughput. Unlike gp2, where IOPS is tied to volume size (3 IOPS/GB), gp3 allows independent configuration. The change can be made online without restarting the EC2 instance.",
  },
  8: {
    title: "API Gateway Response Caching",
    scenario: "An API Gateway + Lambda setup is receiving repeated identical GET requests, causing excessive Lambda invocations. Enable caching on the API Gateway stage to reduce redundant Lambda calls.",
    steps: [
      { title: "Enable API Gateway Cache", desc: "Enable caching on the stage with 0.5GB capacity and a 300-second TTL." },
      { title: "Set Method Cache TTL", desc: "Set the cache TTL to 300 seconds for the GET /products method." },
      { title: "Check Cache Hit Rate Metric", desc: "Query the API Gateway CacheHitCount metric." },
      { title: "Invalidate Cache", desc: "Immediately invalidate the cache when data changes." },
    ],
    explanation: "API Gateway caching returns cached responses for identical requests without re-invoking Lambda. For GET methods, query strings and headers can be included in the cache key. The maximum cache TTL is 3600 seconds (1 hour); use flush-stage-cache to invalidate when data changes.",
  },
  9: {
    title: "RDS Proxy Connection Pooling",
    scenario: "Lambda functions connect directly to RDS, and as concurrent executions increase,",
    steps: [
      { title: "Check Current DB Connection Count", desc: "Use the RDS DatabaseConnections metric to check the current number of connections." },
      { title: "Create RDS Proxy", desc: "Create an RDS Proxy using the MySQL protocol." },
      { title: "Register Proxy Target", desc: "Register the RDS instance as the proxy target." },
      { title: "Verify Proxy Endpoint", desc: "Check the proxy status and connection endpoint." },
      { title: "Verify Connection Count Reduction", desc: "Confirm that direct RDS connection counts have decreased after applying the proxy." },
    ],
    explanation: "RDS Proxy pools DB connections for environments like Lambda or containers where connections are frequently created and destroyed. Thousands of Lambda executions share just a few dozen Proxy connections. Security is also enhanced through IAM authentication and Secrets Manager.",
  },
  10: {
    title: "EC2 Instance Type Optimization",
    scenario: "A batch processing server is running on t3.medium, but when CPU credits are exhausted, processing speed drops sharply. Migrate to the c5 family, which is suited for CPU-intensive workloads, and compare performance.",
    steps: [
      { title: "Check Current Instance Type and CPU Credits", desc: "Review the T3 instance's CPU credit balance." },
      { title: "Stop the Instance", desc: "Stop the instance to change its type." },
      { title: "Change Instance Type", desc: "Change the instance type from t3.medium to c5.xlarge." },
      { title: "Restart the Instance", desc: "Start the instance again." },
      { title: "Compare CPU Utilization", desc: "Check CPU utilization for the same workload on c5.xlarge." },
    ],
    explanation: "T-family instances (t2, t3, t4g) are burstable — once credits are exhausted, performance is capped at the baseline (20–40% CPU). CPU-intensive workloads suit the C family (c5, c6i, c6g), memory-intensive workloads suit the R family, and general-purpose suits the M family. c5.xlarge provides 4 vCPU / 8GB memory — 4x more vCPUs than t3.medium.",
  },
  11: {
    title: "Global Accelerator Setup",
    scenario: "Users in the US and Europe experience latency over 200ms when accessing an API server in the Seoul region. Use Global Accelerator to leverage the AWS global network and reduce latency to under 50ms.",
    steps: [
      { title: "Create Global Accelerator", desc: "Create the Accelerator." },
      { title: "Create Listener", desc: "Add a TCP 443 port listener." },
      { title: "Add Endpoint Group", desc: "Add an ALB in the ap-northeast-2 region as an endpoint group." },
      { title: "Verify Latency Improvement", desc: "Compare latency using the Global Accelerator endpoint." },
    ],
    explanation: "Global Accelerator receives user traffic at the nearest AWS edge location and routes it over the AWS global network. It reduces public internet hops, lowering latency and packet loss. Anycast IPs also provide resilience against DDoS attacks.",
  },
  12: {
    title: "DynamoDB GSI Creation and Query Optimization",
    scenario: "A DynamoDB table is queried by userId (PK), but there's now a requirement to look up users by email as well. Add a GSI to enable fast email lookups without full table scans.",
    steps: [
      { title: "Check Current Table Key Structure", desc: "Review the existing table's key schema and indexes." },
      { title: "Add GSI (email-index)", desc: "Add a GSI with email as the partition key." },
      { title: "Verify GSI Build Completion", desc: "Wait for the GSI status to become ACTIVE." },
      { title: "Query by Email Using GSI", desc: "Use the GSI to look up a user by email." },
    ],
    explanation: "DynamoDB GSIs allow querying with a different partition key / sort key than the base table. Using Query + GSI instead of Scan significantly improves both cost and performance. Allow time for data replication after GSI creation. Set ProjectionType to include only the attributes needed at query time to reduce RCU consumption.",
  },
  13: {
    title: "SQS + Lambda Batch Processing Optimization",
    scenario: "Lambda is processing SQS messages one at a time, resulting in too many Lambda invocations and slow throughput. Increase batch size and optimize the SQS trigger to improve processing throughput.",
    steps: [
      { title: "Check Current Event Source Mapping", desc: "Review the Lambda SQS event source mapping." },
      { title: "Increase Batch Size to 10", desc: "Update the batch size to process 10 messages at a time." },
      { title: "Check SQS Queue Attributes", desc: "Review the queue's visibility timeout and message count." },
      { title: "Adjust Visibility Timeout", desc: "Set visibility timeout to 180 seconds — 6x the Lambda processing time." },
      { title: "Verify Reduction in Lambda Invocations", desc: "Check the Invocations metric to confirm Lambda invocations have decreased." },
    ],
    explanation: "Increasing BatchSize in SQS + Lambda batch processing reduces Lambda invocations and lowers cost. Use MaximumBatchingWindowInSeconds to accumulate messages into larger batches. Setting visibility timeout to 6x the maximum Lambda execution time is an AWS best practice.",
  },
  14: {
    title: "Kinesis Data Streams Shard Scaling",
    scenario: "A Kinesis Data Streams stream used for real-time log ingestion is throwing WriteProvisionedThroughputExceeded errors. Scale from 2 shards to 4 to increase throughput capacity.",
    steps: [
      { title: "Check Current Stream Status", desc: "Review the stream's current shard count and status." },
      { title: "Increase Shard Count", desc: "Scale the stream from 2 to 4 shards." },
      { title: "Verify Scaling Completion", desc: "Confirm the shard count has increased to 4." },
      { title: "Create WriteProvisionedThroughputExceeded Alarm", desc: "Create an alarm to detect write bottlenecks if they recur." },
    ],
    explanation: "A single Kinesis shard supports 1MB/s writes (1,000 records/s) and 2MB/s reads. Shard scaling via UNIFORM_SCALING only works in powers of 2. Designing diverse partition keys ensures even distribution across shards.",
  },
  15: {
    title: "AWS X-Ray Distributed Tracing Activation",
    scenario: "In an MSA environment, a specific API is slow but it's impossible to tell which service is causing the bottleneck. Enable X-Ray to trace the request flow and measure latency at each stage.",
    steps: [
      { title: "Enable X-Ray Active Tracing on Lambda", desc: "Enable X-Ray active tracing on the Lambda function." },
      { title: "Enable X-Ray Tracing on API Gateway", desc: "Enable X-Ray tracing on the API Gateway stage." },
      { title: "View X-Ray Service Map", desc: "Query the X-Ray service graph to visualize call relationships between services." },
      { title: "Query Slow Traces", desc: "Retrieve the top 5 slowest traces by response time." },
    ],
    explanation: "X-Ray traces distributed requests and visualizes inter-service latency and errors. Both Lambda and API Gateway must be enabled for end-to-end tracing. Use filter expressions to isolate slow requests and quickly identify bottlenecks.",
  },
  16: {
    title: "RDS Performance Insights Activation",
    scenario: "RDS instance CPU is consistently high, but it's unclear which queries are responsible. Enable Performance Insights to identify the top SQL queries and analyze DB load.",
    steps: [
      { title: "Enable Performance Insights", desc: "Turn on Performance Insights for the production RDS instance." },
      { title: "Query Top SQL Statements", desc: "Use the db.sql.statement dimension to find the highest-load queries." },
      { title: "Check DB Load Metric", desc: "Review the DBLoad metric trend." },
      { title: "Enable RDS Enhanced Monitoring", desc: "Enable OS-level monitoring at 1-second intervals." },
    ],
    explanation: "Performance Insights visualizes DB engine-level wait events and top SQL queries. If db.load.avg exceeds the number of vCPUs, there is a bottleneck. Enhanced Monitoring measures OS-level metrics (CPU, memory, I/O) at 1-second intervals — combined with Performance Insights, it enables comprehensive DB performance analysis.",
  },
  17: {
    title: "Lambda Provisioned Concurrency",
    scenario: "Lambda cold starts cause first-request response times of 2–3 seconds. Configure Provisioned Concurrency on latency-sensitive functions like payment APIs to eliminate cold starts.",
    steps: [
      { title: "Check Current Cold Start Frequency", desc: "Use the InitDuration metric to check how often cold starts occur." },
      { title: "Publish Function Version", desc: "Publish a function version to apply Provisioned Concurrency." },
      { title: "Set Provisioned Concurrency to 10", desc: "Configure 10 provisioned concurrency units on version 5." },
      { title: "Verify Provisioned Concurrency is Ready", desc: "Confirm the configuration is in a ready state." },
      { title: "Verify Cold Starts Eliminated", desc: "Check that the InitDuration metric approaches zero." },
    ],
    explanation: "Provisioned Concurrency keeps a specified number of Lambda instances in an initialized state at all times. It can only be set on a version or alias — not on $LATEST. Use Application Auto Scaling to automatically adjust provisioned concurrency by time of day.",
  },
  18: {
    title: "S3 Multipart Upload Optimization",
    scenario: "Uploading files over 10GB to S3 as a single PUT means any network error requires starting over from scratch. Use multipart upload to enable parallel transfer and more efficient retries.",
    steps: [
      { title: "Initiate Multipart Upload", desc: "Initialize the multipart upload to obtain an UploadId." },
      { title: "Upload Part", desc: "Upload the first part (100MB)." },
      { title: "Complete Multipart Upload", desc: "Complete the multipart upload after all parts are uploaded." },
      { title: "Set Incomplete Multipart Cleanup Rule", desc: "Configure a lifecycle rule to automatically delete incomplete uploads after 7 days." },
    ],
    explanation: "Multipart upload splits a file into multiple parts and transfers them in parallel. It applies to parts of 5MB or larger and supports up to 10,000 parts. If interrupted, you can resume from the failed part, making it essential for large files. Use the AbortIncompleteMultipartUpload lifecycle rule to prevent charges from incomplete uploads.",
  },
  19: {
    title: "EC2 Enhanced Networking (ENA) Verification",
    scenario: "Network throughput between EC2 instances processing large volumes of data is slow. Verify that ENA (Elastic Network Adapter) is enabled and check whether the instance type supports network optimization.",
    steps: [
      { title: "Check ENA Support", desc: "Verify the ENA attribute of the current instance." },
      { title: "Check Network Interface Details", desc: "Review the network performance settings of the ENI." },
      { title: "Check Instance Network Throughput Metrics", desc: "Review NetworkIn/NetworkOut throughput." },
      { title: "Switch to Network-Optimized Instance", desc: "Stop the instance and change to c5n.4xlarge (25Gbps)." },
    ],
    explanation: "ENA is a high-performance network interface supporting up to 100Gbps. Network-optimized instance families like c5n, m5n, and r5n provide higher network bandwidth. For large data transfers between instances, pairing with a Cluster Placement Group is even more effective.",
  },
  20: {
    title: "ECS Fargate CPU/Memory Tuning",
    scenario: "A Fargate task running at 512 CPU / 1GB memory is experiencing processing delays. Analyze resource utilization with CloudWatch metrics and optimize the task definition.",
    steps: [
      { title: "Check Current Task Definition", desc: "Review the CPU/memory configuration in the current task definition." },
      { title: "Check Fargate Resource Utilization", desc: "Review CPU/memory utilization for the ECS service." },
      { title: "Register New Task Definition (2x CPU)", desc: "Register an upgraded task definition with CPU 1024 and memory 2048." },
      { title: "Update ECS Service", desc: "Update the service to use the new task definition." },
    ],
    explanation: "Fargate CPU is configured in units from 256 to 16384, with valid memory combinations for each. If CPUUtilization is consistently above 80%, there is a CPU bottleneck. Also configure ECS Service Auto Scaling to automatically adjust task count based on load.",
  },
  21: {
    title: "CloudFront Path-Based Cache Behavior Configuration",
    scenario: "Configure different cache behaviors per path in a CloudFront distribution: 24-hour TTL for static files (/static/*) and no caching for API responses (/api/*).",
    steps: [
      { title: "Check Current Distribution Cache Behavior", desc: "Review the existing CloudFront distribution's cache behaviors." },
      { title: "Create API No-Cache Policy", desc: "Create a cache-disabled policy for the /api/* path." },
      { title: "Add Path-Based Behaviors to Distribution", desc: "Apply no-cache to /api/* and long TTL caching to /static/*." },
      { title: "Verify Cache Behavior Application", desc: "Confirm the distribution has finished deploying." },
    ],
    explanation: "CloudFront path pattern priority means specific paths (/api/*) are evaluated before the default behavior (*). Set TTL=0 for API responses to always fetch from origin, and use long TTLs for static assets. CacheBehaviors order matters: place more specific paths first.",
  },
  22: {
    title: "ElastiCache Redis Cluster Mode Activation",
    scenario: "A single Redis node has memory limitations and is a single point of failure. Enable Redis cluster mode to distribute data across multiple shards and achieve high availability.",
    steps: [
      { title: "Create Cluster-Mode Replication Group", desc: "Create a Redis cluster with 3 shards and 1 replica each." },
      { title: "Verify Cluster Status", desc: "Confirm the replication group is in the available state." },
      { title: "Confirm Configuration Endpoint", desc: "In cluster mode, you must use the Configuration Endpoint." },
      { title: "Monitor Memory Utilization", desc: "Check DatabaseMemoryUsagePercentage for each shard." },
    ],
    explanation: "Redis cluster mode distributes data across up to 500 shards. Clients must use the Configuration Endpoint. With automatic-failover-enabled, a replica is automatically promoted to primary if the primary node fails.",
  },
  23: {
    title: "Aurora Read Replica Auto Scaling",
    scenario: "Read load on the Aurora cluster varies greatly between day and night — 5 Read Replicas are needed during the day, but only 1 at night. Configure Aurora Auto Scaling to automatically adjust the number of Replicas.",
    steps: [
      { title: "Check Current Aurora Cluster", desc: "Review the cluster's current members and status." },
      { title: "Register Aurora Auto Scaling Policy", desc: "Register an Auto Scaling policy for the Aurora cluster." },
      { title: "Create CPU-Based Scaling Policy", desc: "Create a policy to automatically adjust Replicas based on 70% CPU utilization." },
      { title: "Verify Auto Scaling Policy", desc: "Confirm the registered policy." },
    ],
    explanation: "Aurora Auto Scaling uses Application Auto Scaling to automatically adjust the number of reader instances. Configure ScaleIn/ScaleOut cooldown periods to prevent excessive scaling. Aurora Serverless v2 allows finer-grained auto-scaling in ACU (Aurora Capacity Unit) increments instead of individual instance scaling.",
  },
  24: {
    title: "DynamoDB Capacity Mode Switch (On-Demand)",
    scenario: "DynamoDB traffic spikes explosively only during events. Provisioned mode is cheaper normally, but during events ProvisionedThroughputExceeded errors always occur. Switch to On-Demand mode to leverage automatic scaling.",
    steps: [
      { title: "Check Current Capacity Mode and Settings", desc: "Review the table's current throughput capacity settings." },
      { title: "Switch to On-Demand Mode", desc: "Change the table to PAY_PER_REQUEST mode." },
      { title: "Verify Switch Completion", desc: "Confirm the table status has returned to ACTIVE." },
      { title: "Monitor ConsumedReadCapacityUnits", desc: "Check actual RCU/WCU consumed during the event." },
    ],
    explanation: "On-Demand mode auto-scales to match traffic, eliminating ProvisionedThroughputExceeded errors. However, since billing is per-request, Provisioned + Auto Scaling is more cost-effective for predictable, stable traffic. Mode switches can only occur once every 24 hours.",
  },
  25: {
    title: "EventBridge + Lambda Async Processing",
    scenario: "After a user completes an order, inventory updates, email sends, and analytics recording are processed synchronously, causing API response times over 3 seconds. Publish events to EventBridge and decouple each process into async handlers.",
    steps: [
      { title: "Create EventBridge Event Bus", desc: "Create a custom event bus." },
      { title: "Create Event Rule", desc: "Create a rule to handle the OrderCompleted event." },
      { title: "Register Lambda Targets", desc: "Register inventory update and email-send Lambda functions as targets." },
      { title: "Publish Test Event", desc: "Publish a test order-completed event." },
    ],
    explanation: "An event-driven architecture via EventBridge reduces coupling between services. The order API only publishes an event to EventBridge and responds immediately, reducing API response time to under 50ms. Each consumer (Lambda) fails independently — manage failed events with a DLQ (Dead Letter Queue).",
  },
  26: {
    title: "SQS Message Priority Processing",
    scenario: "VIP orders and regular orders are mixed in a single SQS queue. VIP orders must be processed faster, but the current architecture makes this impossible. Implement priority processing using a separate queue strategy.",
    steps: [
      { title: "Create VIP-Dedicated SQS Queue", desc: "Create a queue exclusively for VIP orders." },
      { title: "Create Regular Order Queue", desc: "Create a queue for regular orders." },
      { title: "Attach VIP Queue Event Source to Lambda", desc: "Configure the VIP queue processing Lambda with a batch size of 1." },
      { title: "Check VIP Queue Message Count", desc: "Verify the message count and processing status of the VIP queue." },
    ],
    explanation: "SQS does not natively support priority queues. Create separate queues and grant the VIP processing Lambda higher concurrency or configure it to poll first. FIFO queues guarantee message ordering and also provide deduplication.",
  },
  27: {
    title: "Kinesis Enhanced Fan-Out Consumer",
    scenario: "Multiple Kinesis stream consumers are sharing the 2MB/s shared read throughput, causing processing delays. Use Enhanced Fan-Out to provide each consumer with dedicated 2MB/s bandwidth.",
    steps: [
      { title: "Check Current Stream Consumers", desc: "Review the list of consumers registered to the stream." },
      { title: "Register Enhanced Fan-Out Consumer", desc: "Register the notification service consumer with Enhanced Fan-Out." },
      { title: "Verify Consumer Activation", desc: "Confirm the consumer status has become ACTIVE." },
      { title: "Link Consumer ARN to Lambda Kinesis Trigger", desc: "Set the Lambda event source to the Enhanced Fan-Out consumer." },
    ],
    explanation: "Enhanced Fan-Out provides each consumer with dedicated read throughput of 2MB/s per shard. The standard GetRecords approach shares throughput across all consumers, but Enhanced Fan-Out uses a server-side push model that also reduces latency from ~200ms to ~70ms. Note that there is an additional cost per consumer.",
  },
  28: {
    title: "EC2 Cluster Placement Group",
    scenario: "Network latency between EC2 instances in an HPC (High Performance Computing) workload is problematic. Use a Cluster Placement Group to physically co-locate instances and achieve minimum latency.",
    steps: [
      { title: "Create Cluster Placement Group", desc: "Create a Placement Group with the cluster strategy." },
      { title: "Launch Instances in Placement Group", desc: "Launch 4 c5n.xlarge instances within the Placement Group." },
      { title: "Verify Instance Placement", desc: "Confirm which instances belong to the Placement Group." },
      { title: "Check Network Latency", desc: "Compare NetworkIn metrics between instances within the Placement Group." },
    ],
    explanation: "A Cluster Placement Group places instances close together on physical servers in the same AZ, providing low-latency networking at 10Gbps or higher. Ideal for HPC, big data, and ML training workloads. Note that it is limited to a single AZ, which reduces availability, and instances have a higher chance of launch failure (insufficient capacity).",
  },
  29: {
    title: "Network Load Balancer High-Throughput Configuration",
    scenario: "A game server experiencing tens of thousands of TCP connections per second is suffering from ALB-induced latency. Replace it with an NLB to provide Layer 4 processing, static IPs, and minimize latency.",
    steps: [
      { title: "Create NLB", desc: "Create a Network Load Balancer for TCP processing." },
      { title: "Create TCP Target Group", desc: "Create a Target Group on TCP port 7777." },
      { title: "Create NLB Listener", desc: "Add a TCP 7777 listener." },
      { title: "Check NLB Throughput Metrics", desc: "Review ActiveFlowCount and ProcessedBytes metrics." },
    ],
    explanation: "NLB is a Layer 4 (TCP/UDP) load balancer that provides far lower latency than ALB (~100 microseconds). It supports static and Elastic IPs and handles millions of requests per second. It's ideal for game servers, IoT, and financial transactions where latency is critical and HTTP header processing is unnecessary.",
  },
  30: {
    title: "CloudWatch Performance Dashboard Configuration",
    scenario: "Without a centralized dashboard for performance metrics across multiple services, identifying the cause of incidents takes too long. Create a CloudWatch dashboard showing ALB latency, Lambda errors, RDS CPU, and ElastiCache hit rate on a single screen.",
    steps: [
      { title: "Create Dashboard", desc: "Create a dashboard named production-performance." },
      { title: "Create ALB Latency Alarm", desc: "Set up an alarm to trigger when ALB TargetResponseTime exceeds 1 second." },
      { title: "Create Lambda Error Rate Alarm", desc: "Set up an alarm when Lambda Errors exceed 10." },
      { title: "Create Composite Alarm", desc: "Create a composite alarm that triggers only when both ALB latency AND Lambda errors are in an alarm state." },
      { title: "View Dashboard", desc: "View the created dashboard." },
    ],
    explanation: "CloudWatch dashboards let you monitor metrics from multiple services on a single screen. Composite Alarms combine multiple alarms to reduce alarm noise. The put-dashboard dashboard-body JSON can include metric widgets, alarm widgets, and text widgets. Consider also using CloudWatch Container Insights and Lambda Insights together.",
  }
};