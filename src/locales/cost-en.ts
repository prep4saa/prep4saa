type ChalI18n = {
  title: string;
  scenario: string;
  steps: Array<{ title: string; desc: string }>;
  explanation: string;
};

export const COST_CHALLENGES_I18N: Record<number, ChalI18n> = {
  1: {
    title: "Set Up AWS Budgets Alert",
    scenario: "You only find out about cost overruns after receiving your AWS bill at the end of each month. Set a $500 monthly budget with AWS Budgets and receive an email alert when you reach 80%.",
    steps: [
      { title: "Check Current Monthly Costs", desc: "Use Cost Explorer to review costs incurred so far this month." },
      { title: "Create a Monthly Budget", desc: "Create a monthly cost budget of $500." },
      { title: "Set 80% Alert", desc: "Add an email alert to trigger when 80% of the budget ($400) is reached." },
      { title: "Review Budget", desc: "Verify the created budget and current usage." },
    ],
    explanation: "AWS Budgets lets you set budgets for cost, usage, Reserved Instances, and Savings Plans. You can configure alerts based on forecasted costs as well as actual costs. Connecting to an SNS topic allows notifications to be sent to various channels such as Slack.",
  },
  2: {
    title: "Purchase EC2 Savings Plans",
    scenario: "Your production EC2 instances are always running but you're paying On-Demand rates. Purchase a 1-year Compute Savings Plan to save up to 66% on costs.",
    steps: [
      { title: "Review Savings Plans Recommendations", desc: "Check the Savings Plans purchase recommendations in Cost Explorer." },
      { title: "Check Current On-Demand Usage", desc: "View EC2 On-Demand costs broken down by service." },
      { title: "Purchase Savings Plans", desc: "Purchase a Compute Savings Plan at $0.50 per hour." },
      { title: "Check Savings Plans Utilization", desc: "Verify the utilization rate of your purchased Savings Plans." },
    ],
    explanation: "Compute Savings Plans are the most flexible plan, applying to EC2, Lambda, and Fargate. They offer up to 66% savings on a 1-year No Upfront basis. Since low utilization means wasted spend, it's best to start at 80–90% of the recommended amount and gradually increase.",
  },
  3: {
    title: "Use EC2 Spot Instances",
    scenario: "A batch analytics workload runs for 2 hours a day. Replacing On-Demand c5.2xlarge with Spot Instances can save up to 90%. Use a Spot Fleet to run your batch jobs safely even with interruptions.",
    steps: [
      { title: "Check Current Spot Pricing", desc: "View the current Spot price for c5.2xlarge." },
      { title: "Create a Spot Fleet Request", desc: "Request a Spot Fleet with a target capacity of 4 vCPUs." },
      { title: "Verify Spot Fleet Status", desc: "Confirm that the Spot Fleet has provisioned instances." },
      { title: "Set Up Spot Interruption Alert", desc: "Create an EventBridge rule to notify you 2 minutes before a Spot Instance is interrupted." },
    ],
    explanation: "Spot Instances are up to 90% cheaper than On-Demand. To handle interruptions (2-minute notice), save job checkpoints or distribute work via SQS. Using a variety of instance types and AZ combinations in a Spot Fleet reduces the likelihood of interruption.",
  },
  4: {
    title: "Reduce Storage Costs with S3 Lifecycle Policies",
    scenario: "Log files have accumulated to hundreds of GB in your S3 bucket. Files older than 30 days are rarely accessed but you're still paying Standard rates. Use Lifecycle policies to automatically transition to cheaper storage classes.",
    steps: [
      { title: "Check Bucket Storage Usage", desc: "View the total size and object count of your bucket." },
      { title: "Add a Lifecycle Rule", desc: "Set up a rule to transition to S3-IA after 30 days and to Glacier after 90 days." },
      { title: "Verify Lifecycle Rules", desc: "Confirm the configured Lifecycle rules." },
      { title: "Enable S3 Storage Class Analysis", desc: "Turn on Storage Class Analysis to analyze access patterns." },
    ],
    explanation: "S3 Lifecycle policies automatically move or delete objects to cheaper storage classes. Standard → Standard-IA saves 58%; Standard-IA → Glacier saves 80%. Note that Standard-IA has a 128KB minimum object size and a 30-day minimum storage charge, so costs may actually increase if you have many small files.",
  },
  5: {
    title: "Clean Up Unused EBS Volumes",
    scenario: "EBS volumes remain and continue to incur charges even after instances are terminated. Find unattached (available) EBS volumes, take snapshots, and delete them.",
    steps: [
      { title: "List Unattached EBS Volumes", desc: "View the list of EBS volumes in the 'available' state." },
      { title: "Create EBS Snapshots", desc: "Create a snapshot of each volume before deleting it." },
      { title: "Wait for Snapshot Completion", desc: "Verify that snapshots have reached the 'completed' state." },
      { title: "Delete EBS Volumes", desc: "Once snapshots are complete, delete the unused volumes." },
    ],
    explanation: "EBS volumes are charged based on provisioned size even when not attached to an instance. Regularly audit volumes in the 'available' state. AWS Trusted Advisor and Cost Explorer's resource optimization recommendations also help identify unused resources.",
  },
  6: {
    title: "Release Unused Elastic IPs",
    scenario: "After deleting an EC2 instance, Elastic IPs remain unassociated. Unattached EIPs are charged on an hourly basis. Find and release unused EIPs.",
    steps: [
      { title: "Find Unassociated Elastic IPs", desc: "Identify Elastic IPs with no InstanceId." },
      { title: "Confirm EIP Usage", desc: "Verify whether they are referenced by other services such as Route53 before releasing." },
      { title: "Release the EIP", desc: "Release the Elastic IP." },
      { title: "Confirm Remaining EIPs", desc: "Check the list of remaining EIPs after release." },
    ],
    explanation: "Unassociated Elastic IPs are charged at $0.005 per hour (approximately $3.60/month). While this seems small, it adds up to a meaningful cost if dozens accumulate. It's good practice to update your IaC code (e.g., Terraform) so EIPs are automatically released when instances are terminated.",
  },
  7: {
    title: "Set CloudWatch Logs Retention Periods",
    scenario: "CloudWatch Log Groups are set to the default (never expire), continuously accumulating storage costs. Set appropriate retention periods by log type.",
    steps: [
      { title: "List Log Groups and Check Retention", desc: "Find log groups that have no retention period configured." },
      { title: "Set Lambda Log Retention to 30 Days", desc: "Set the retention period of the /aws/lambda/api-handler log group to 30 days." },
      { title: "Set RDS Log Retention to 14 Days", desc: "Set the retention period of the /aws/rds/cluster/prod-aurora log group to 14 days." },
      { title: "Verify Configuration", desc: "Confirm that the retention periods are set correctly." },
    ],
    explanation: "CloudWatch Logs charges $0.03/GB per month for storage. Setting a retention period automatically deletes logs that exceed it. For logs that need long-term retention, export them to S3 and keep a short retention window in CloudWatch. Determine retention periods based on compliance requirements.",
  },
  8: {
    title: "Optimize NAT Gateway Costs",
    scenario: "Having a NAT Gateway in each AZ is increasing costs. Additionally, S3-bound traffic is also routed through the NAT Gateway. Add a VPC Endpoint to eliminate S3 traffic costs.",
    steps: [
      { title: "Check NAT Gateway Costs", desc: "Review current NAT Gateway costs broken down by service." },
      { title: "Create an S3 Gateway VPC Endpoint", desc: "Create a Gateway Endpoint so S3 traffic bypasses the NAT Gateway." },
      { title: "Add a DynamoDB VPC Endpoint", desc: "Also connect DynamoDB via a VPC Endpoint." },
      { title: "Verify VPC Endpoints", desc: "Confirm the created VPC Endpoints." },
    ],
    explanation: "S3/DynamoDB Gateway Endpoints are free. Since traffic from private subnets to S3 bypasses the NAT Gateway, data processing costs ($0.045/GB) are eliminated. In environments with heavy S3 usage, savings of hundreds of dollars per month are possible.",
  },
  9: {
    title: "Purchase RDS Reserved Instances",
    scenario: "Your production RDS db.r5.large instance is running 24/7. Switching to a 1-year Reserved Instance saves up to 42% compared to On-Demand.",
    steps: [
      { title: "Check Current RDS Instances", desc: "Review the list of running RDS instances." },
      { title: "View RDS Reserved Instance Offerings", desc: "Check the 1-year No Upfront reserved pricing for db.r5.large MySQL." },
      { title: "Purchase RDS Reserved Instance", desc: "Purchase a db.r5.large MySQL Reserved Instance." },
      { title: "Confirm Reserved Instance Application", desc: "Verify the status of the purchased Reserved Instance." },
    ],
    explanation: "RDS Reserved Instances save approximately 42% on a 1-year No Upfront basis, and about 43% with All Upfront. Reserved Instances are automatically applied to On-Demand instances with the same engine, class, and region. Multi-AZ Reserved Instances only apply to Multi-AZ instances.",
  },
  10: {
    title: "Migrate Lambda to ARM (Graviton2)",
    scenario: "Your Lambda functions are running on the x86_64 architecture. Switching to arm64 (Graviton2) delivers the same performance at 20% lower cost. Change the architecture and verify the cost savings.",
    steps: [
      { title: "Check Current Lambda Architecture", desc: "Review the architecture and runtime of your functions." },
      { title: "Change Architecture to ARM64", desc: "Update the function to use arm64." },
      { title: "Run a Function Test", desc: "Test that the function works correctly after switching to ARM64." },
      { title: "Verify Cost Comparison", desc: "Check Lambda cost metrics via CloudWatch." },
    ],
    explanation: "Lambda ARM64 (Graviton2) is 20% cheaper than x86_64 and offers similar or better performance. Most runtimes including Python, Node.js, Java, and Go are supported. However, if you use C extension libraries, recompilation is required. Fargate ARM64 is also 20% cheaper.",
  },
  11: {
    title: "EC2 Right Sizing",
    scenario: "Average CPU utilization across your EC2 instances is below 5%. Review AWS Compute Optimizer recommendations and downsize over-provisioned instances.",
    steps: [
      { title: "Review Compute Optimizer Recommendations", desc: "Query optimization recommendations for your EC2 instances." },
      { title: "Check CPU Utilization", desc: "Review average CPU utilization over the past 30 days." },
      { title: "Stop Instance and Change Type", desc: "Stop the instance and change the type from t3.medium to t3.small." },
      { title: "Restart and Verify", desc: "Start the instance and confirm the new instance type." },
    ],
    explanation: "AWS Compute Optimizer analyzes CloudWatch metrics to recommend optimal instance types. Below 5% CPU utilization is a clear sign of over-provisioning. That said, consider peak traffic as well — make decisions based on at least the P95 utilization.",
  },
  12: {
    title: "Configure S3 Intelligent-Tiering",
    scenario: "You have an S3 bucket with irregular access patterns. Some files need Standard access when frequently used, while others go untouched for months. Let Intelligent-Tiering automatically select the optimal storage class.",
    steps: [
      { title: "Check Storage Class Distribution", desc: "View the number of objects per storage class in the bucket." },
      { title: "Add a Lifecycle Rule to Transition to Intelligent-Tiering", desc: "Set up a rule to transition all objects to Intelligent-Tiering." },
      { title: "Configure Intelligent-Tiering Archive", desc: "Set objects to move to the Archive tier after 90 days without access, and to Deep Archive after 180 days." },
      { title: "Verify Intelligent-Tiering Configuration", desc: "Confirm the Intelligent-Tiering setup." },
    ],
    explanation: "Intelligent-Tiering automatically moves objects between Frequent, Infrequent, and Archive tiers based on access patterns. There is a monitoring cost ($0.0025 per 1,000 objects), so it may actually be more expensive if you have many small objects under 128KB. It's best suited for large objects with unpredictable access patterns.",
  },
  13: {
    title: "AWS Cost Anomaly Detection",
    scenario: "AWS costs suddenly tripled but you found out too late. Set up Cost Anomaly Detection to immediately catch abnormal cost spikes.",
    steps: [
      { title: "Create a Cost Monitor", desc: "Create a Cost Monitor to track EC2 service costs." },
      { title: "Create an Alert Subscription", desc: "Set up an email alert for cost spikes over $50." },
      { title: "View Anomaly History", desc: "Review the list of detected cost anomalies." },
      { title: "Verify Monitor List", desc: "Confirm the list of created cost monitors." },
    ],
    explanation: "Cost Anomaly Detection uses machine learning to learn cost patterns and detect unusual spending. Monitors can be created based on service, linked account, cost allocation tag, or cost category. It produces fewer false positives than traditional alerts and also provides root cause information (service/region/usage type).",
  },
  14: {
    title: "Activate Cost Allocation Tags",
    scenario: "You need to view costs separately for the dev, ops, and data teams, but currently only see total costs. Use Cost Allocation Tags to separate costs by team and build per-team reports in Cost Explorer.",
    steps: [
      { title: "Activate User-Defined Tag", desc: "Activate the 'team' tag as a cost allocation tag." },
      { title: "Add Team Tag to EC2 Instances", desc: "Add the tag team=ops to the operations team instances." },
      { title: "Add Team Tag to S3 Buckets", desc: "Add the tag team=data to the data team buckets." },
      { title: "Query Costs by Team", desc: "Group by the 'team' tag to view costs per team." },
    ],
    explanation: "Cost allocation tags can take up to 24 hours to appear in Cost Explorer after activation. Both AWS-generated and user-defined tags are supported. Enforcing tag policies through AWS Organizations prevents cost misclassification due to missing tags.",
  },
  15: {
    title: "Clean Up ECR Images",
    scenario: "Hundreds of old Docker images have piled up in ECR repositories, increasing storage costs. Set a Lifecycle policy to keep only the 5 most recent images and automatically delete the rest.",
    steps: [
      { title: "Check Current ECR Image Count", desc: "View the number of images and total size of the repository." },
      { title: "Set ECR Lifecycle Policy", desc: "Set a policy to automatically delete untagged images and old images." },
      { title: "Preview Lifecycle Policy", desc: "Preview which images would be deleted when the policy is applied." },
      { title: "Check ECR Storage Costs", desc: "Review ECR storage usage metrics." },
    ],
    explanation: "ECR storage is charged at $0.10/GB per month. Automatically cleaning up old images with a Lifecycle policy keeps costs under control even as images accumulate daily from CI/CD pipelines. Untagged images should always be deleted immediately.",
  },
  16: {
    title: "Save Costs with Schedule-Based Auto Scaling",
    scenario: "EC2 Auto Scaling groups in dev/staging environments run 24 hours a day. Keep instances running only during business hours (Mon–Fri 9–18) and scale down to 0 at all other times to cut costs by 60%.",
    steps: [
      { title: "Check Current ASG Settings", desc: "Review the current configuration of the development environment Auto Scaling group." },
      { title: "Add a Business Hours Start Schedule", desc: "Add a schedule to scale up to 2 instances at 9 AM (UTC 0:00) Mon–Fri." },
      { title: "Add a Business Hours End Schedule", desc: "Add a schedule to scale down to 0 instances at 9 PM (UTC 12:00) Mon–Fri." },
      { title: "Verify Schedule List", desc: "Confirm the registered scheduled actions." },
    ],
    explanation: "Dev/staging environments don't need instances outside of business hours. Scheduled scaling can reduce costs during approximately 76% of the time, including weekends. The AWS Instance Scheduler solution can handle more complex schedules.",
  },
  17: {
    title: "Analyze and Optimize S3 Data Transfer Costs",
    scenario: "Data transfer costs from S3 to the internet are running hundreds of dollars per month. Analyze which buckets are transferring how much data and reduce transfer costs by switching to CloudFront.",
    steps: [
      { title: "Query S3 Data Transfer Costs", desc: "Use Cost Explorer to query S3 data transfer costs." },
      { title: "Enable S3 Bucket Request Metrics", desc: "Activate metrics for the most frequently requested buckets." },
      { title: "Set S3 as CloudFront Origin", desc: "Deploy CloudFront in front of the S3 bucket to reduce transfer costs." },
      { title: "Block Direct S3 Access", desc: "Block direct S3 access from sources other than CloudFront." },
    ],
    explanation: "Data transfer from S3 to the internet costs $0.09/GB. With CloudFront, transfer from origin to CloudFront is free, and transfer from CloudFront edge to users is cheaper than direct S3 ($0.0085/GB). The higher the cache hit ratio, the greater the savings.",
  },
  18: {
    title: "Optimize DynamoDB Costs",
    scenario: "Frequent scan queries on a DynamoDB table are driving up RCU costs. Switch to Provisioned mode and set up Auto Scaling to achieve predictable costs.",
    steps: [
      { title: "Check DynamoDB Consumption Costs", desc: "Review DynamoDB RCU/WCU consumption." },
      { title: "Switch to Provisioned Mode", desc: "Switch the table to PROVISIONED billing mode." },
      { title: "Register Auto Scaling Policy (Read)", desc: "Configure Auto Scaling for DynamoDB read capacity." },
      { title: "Set Target Tracking Policy", desc: "Set up an Auto Scaling policy with a target utilization of 70%." },
    ],
    explanation: "If traffic patterns are predictable, Provisioned + Auto Scaling is cheaper than On-Demand. Auto Scaling scales out when consumed capacity exceeds 70% of provisioned capacity and scales in when it falls below. Using queries and GSIs instead of scans is also important for reducing RCU consumption.",
  },
  19: {
    title: "Review Trusted Advisor Cost Optimization Recommendations",
    scenario: "Use Trusted Advisor to check for wasted resources across your entire AWS environment. Find and clean up unused load balancers, idle RDS instances, and underutilized EC2.",
    steps: [
      { title: "Query Trusted Advisor Cost Optimization Checks", desc: "Review the list of checks in the cost optimization category." },
      { title: "Check for Idle Load Balancers", desc: "View the results of the Idle Load Balancers check." },
      { title: "Delete Idle Load Balancers", desc: "Delete any idle load balancers." },
      { title: "Refresh Trusted Advisor Results", desc: "Refresh the check results." },
    ],
    explanation: "Trusted Advisor provides 200+ checks across 5 categories: cost optimization, performance, security, fault tolerance, and service limits. Full checks are available with the Business/Enterprise Support plan. Conduct regular monthly reviews to consistently eliminate wasted resources.",
  },
  20: {
    title: "Clean Up Old RDS Snapshots",
    scenario: "Dozens of RDS manual snapshots have piled up and are generating storage costs. Clean up snapshots older than 90 days and adjust the automated snapshot retention period.",
    steps: [
      { title: "List Old Snapshots", desc: "Query RDS snapshots older than 90 days." },
      { title: "Delete Old Snapshots", desc: "Delete snapshots that are more than 90 days old." },
      { title: "Reduce Automated Snapshot Retention", desc: "Lower the automated backup retention period from 35 days to 7 days." },
      { title: "Check Total Snapshot Size", desc: "Review the total storage of remaining snapshots." },
    ],
    explanation: "RDS automated snapshots can be retained for up to 35 days, and costs are incurred if storage exceeds the free tier (100% of DB size). Manual snapshots persist until explicitly deleted. Unless you have compliance requirements, a 7-day retention period is usually sufficient.",
  },
  21: {
    title: "Optimize CloudFront Costs (Price Class)",
    scenario: "All edge locations are active in your CloudFront distribution, but your users are only in the US and Europe. Restrict to Price Class 100 to reduce costs.",
    steps: [
      { title: "Check Current CloudFront Distribution Settings", desc: "View the current Price Class of the distribution." },
      { title: "Change to Price Class 100", desc: "Switch to Price Class 100, which uses only US and Europe edges." },
      { title: "Check Traffic by Region", desc: "Use CloudWatch to view request counts by region." },
      { title: "Confirm Distribution Deployment", desc: "Verify that the Price Class change has been applied to all edges." },
    ],
    explanation: "CloudFront Price Class determines which edge locations are used. It is divided into PriceClass_All (all regions), PriceClass_200 (North America + Europe + some Asia), and PriceClass_100 (North America + Europe). If your users are concentrated in a specific region, you can eliminate costs from unnecessary edge locations.",
  },
  22: {
    title: "Control Costs with Lambda Concurrency Limits",
    scenario: "A Lambda function in the dev environment got caught in an infinite loop due to a bug and was invoked thousands of times. Set per-function concurrency limits to prevent runaway cost spikes.",
    steps: [
      { title: "Check Current Lambda Concurrency", desc: "Review the account-wide concurrency limit and current usage." },
      { title: "Set Concurrency Limit on Dev Functions", desc: "Set a reserved concurrency of 10 on dev environment Lambda functions." },
      { title: "Set Up Throttle Alert", desc: "Configure an alarm to trigger when Lambda Throttles occur." },
      { title: "Query Lambda Costs", desc: "Check Lambda costs for the current month." },
    ],
    explanation: "Setting Reserved Concurrency prevents a function from running more than that number concurrently, protecting against runaway invocations or budget overruns due to bugs. However, setting it too low on production functions can throttle legitimate traffic.",
  },
  23: {
    title: "Long-Term Archival with S3 Glacier",
    scenario: "Regulations require audit logs to be retained for 7 years. Move old logs currently stored in S3 Standard to S3 Glacier Deep Archive to cut costs by 97%.",
    steps: [
      { title: "Check Size of Old Log Objects", desc: "View the total size of log files from before 2023." },
      { title: "Set a Glacier Deep Archive Transition Rule", desc: "Configure a rule to move objects to Glacier Deep Archive after 365 days." },
      { title: "Immediately Move Existing Objects to Glacier", desc: "Copy existing 2022 logs directly to Glacier Deep Archive now." },
      { title: "Verify Storage Class Change", desc: "Confirm the updated storage class." },
    ],
    explanation: "S3 Glacier Deep Archive costs $0.00099/GB per month — 97% cheaper than Standard ($0.023). However, retrieval takes 12 hours standard, or up to 48 hours for bulk retrieval. It's ideal for data like 7-year compliance logs that are almost never retrieved.",
  },
  24: {
    title: "Reduce Batch Job Costs with Fargate Spot",
    scenario: "A data processing ECS task that runs every night uses On-Demand Fargate. Use Fargate Spot for this interruption-tolerant batch job to save up to 70%.",
    steps: [
      { title: "Check Current ECS Service Launch Type", desc: "Review the current settings of the batch processing task." },
      { title: "Create a Fargate Spot Capacity Provider", desc: "Add the FARGATE_SPOT capacity provider to the cluster." },
      { title: "Update Service to Use Spot", desc: "Update the batch service to run on Fargate Spot." },
      { title: "Check Fargate Costs", desc: "Use Cost Explorer to verify that Fargate costs have decreased." },
    ],
    explanation: "Fargate Spot uses AWS's spare Fargate capacity and is up to 70% cheaper than On-Demand. Since you receive a 2-minute interruption notice, batch jobs should save checkpoints or implement retry logic. For 24/7 services, configure a Spot Fallback strategy to switch from FARGATE_SPOT to FARGATE if Spot capacity is unavailable.",
  },
  25: {
    title: "Clean Up Unused Load Balancers",
    scenario: "ALBs left over from testing are being charged hourly with no traffic. Find load balancers with no attached targets or zero requests and clean them up.",
    steps: [
      { title: "List All Load Balancers", desc: "View the list of currently provisioned load balancers." },
      { title: "Check Request Count on Idle LBs", desc: "Review the recent request count for test-alb." },
      { title: "Check Load Balancer Listeners", desc: "Review the listeners and target groups for test-alb." },
      { title: "Delete Idle Load Balancer", desc: "Delete the idle test-alb." },
    ],
    explanation: "ALBs are charged at $0.008/hour + LCU (Load Balancer Capacity Unit) fees. The base hourly rate is charged even with no targets or requests, wasting approximately $6–$16 per month. Use tags and cost allocation to clearly identify each LB's owner and conduct regular audits.",
  },
  26: {
    title: "Analyze and Optimize Data Transfer Costs",
    scenario: "Hidden costs from inter-AZ data transfer are adding up significantly. Reduce transfer costs by switching to intra-AZ communication or optimizing VPC Peering.",
    steps: [
      { title: "Check Inter-AZ Data Transfer Costs", desc: "Query DataTransfer-Regional costs." },
      { title: "Check Instance AZ Distribution", desc: "Review the AZ distribution of current instances." },
      { title: "Enable VPC Flow Logs", desc: "Enable VPC Flow Logs to analyze inter-AZ traffic patterns." },
      { title: "Run Athena Query to Analyze Flow Logs", desc: "Use Athena to analyze Flow Logs stored in S3." },
    ],
    explanation: "Inter-AZ data transfer costs $0.01/GB, and inter-region transfer costs $0.02/GB. Placing the web, app, and DB layers in the same AZ reduces transfer costs to zero. Use VPC Flow Logs + Athena to identify which server pairs generate the most inter-AZ traffic.",
  },
  27: {
    title: "Consolidated Billing with AWS Organizations",
    scenario: "Dev, staging, and production accounts are separate and missing out on volume discounts. Use AWS Organizations consolidated billing to aggregate total usage and unlock volume discounts.",
    steps: [
      { title: "Check Current Organizations Structure", desc: "Review the current organizational structure." },
      { title: "List Accounts", desc: "View all accounts within the organization." },
      { title: "View Consolidated Costs", desc: "Check this month's total cost aggregated across all accounts." },
      { title: "Apply Cost Control Policy with SCP", desc: "Apply an SCP to the dev account to prevent creation of high-cost instance types." },
    ],
    explanation: "AWS Organizations consolidated billing aggregates usage across all accounts for services like S3 and EC2, applying volume discounts. RIs and Savings Plans are also automatically shared across accounts in the organization. SCPs can block the creation of expensive resources in dev accounts.",
  },
  28: {
    title: "Automate EC2 Cost Tagging",
    scenario: "EC2 instances created without tags make cost tracking impossible. Use AWS Config rules to detect untagged instances and send automatic notifications.",
    steps: [
      { title: "Verify AWS Config is Enabled", desc: "Check the AWS Config recorder status." },
      { title: "Create a Required Tags Config Rule", desc: "Create a rule to detect EC2 instances missing the 'Name' and 'team' tags." },
      { title: "Check Non-Compliant Resources", desc: "Query EC2 instances that violate the required-tags rule." },
      { title: "Run SSM to Auto-Add Tags", desc: "Automatically add default tags to non-compliant instances." },
    ],
    explanation: "The AWS Config REQUIRED_TAGS rule marks resources missing specified tags as NON_COMPLIANT. Using Config Rules + Lambda Auto Remediation, you can automatically email the resource owner when a tag is missing, or auto-stop the resource after a certain period.",
  },
  29: {
    title: "Optimize CloudWatch Metrics Costs",
    scenario: "CloudWatch custom metric and API call costs are higher than expected. Lower unnecessary high-resolution metrics to standard resolution and adjust retention periods to reduce costs.",
    steps: [
      { title: "Check CloudWatch Costs", desc: "Analyze CloudWatch-related costs." },
      { title: "List Custom Metrics", desc: "View the number of currently registered custom metrics." },
      { title: "List Unnecessary Alarms", desc: "Identify alarms in the INSUFFICIENT_DATA state." },
      { title: "Delete Old Alarms", desc: "Delete alarms that have been in the INSUFFICIENT_DATA state for 90 days or more." },
    ],
    explanation: "High-resolution CloudWatch metrics (1 second) cost more than standard (1 minute). Downgrade high-resolution metrics you don't need to standard. Alarms in INSUFFICIENT_DATA state indicate that the associated resource has been deleted. Unused dashboards and Log Insights queries also incur costs.",
  },
  30: {
    title: "Automate Monthly Cost Reports",
    scenario: "You're manually creating AWS cost reports every month. Set up the Cost and Usage Report (CUR) to automatically save to S3 and query it with Athena to automate monthly cost analysis by team and service.",
    steps: [
      { title: "Create Cost and Usage Report", desc: "Configure a CUR report to automatically save to S3." },
      { title: "Verify CUR Report", desc: "Confirm the created CUR report definition." },
      { title: "Create Athena Table", desc: "Create an Athena table to analyze CUR data." },
      { title: "Run Per-Team Cost Query", desc: "Use Athena to aggregate monthly costs by team." },
    ],
    explanation: "The Cost and Usage Report (CUR) provides the most detailed AWS cost data. Storing in Parquet format also reduces Athena query costs. You can build a pipeline using Lambda + EventBridge to auto-generate a monthly report on the 1st of each month and send it via SNS email. Connecting to QuickSight allows you to create visual dashboards as well.",
  }
};