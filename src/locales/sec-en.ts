type ChalI18n = {
  title: string;
  scenario: string;
  steps: Array<{ title: string; desc: string }>;
  explanation: string;
};

export const SEC_CHALLENGES_I18N: Record<number, ChalI18n> = {
  1: {
    title: "New Developer Onboarding",
    scenario: "A new backend developer, Kim Dev, joined your startup AWS team today. They need read-only access to S3 and EC2 and must never be able to modify or delete resources.",
    steps: [
      { title: "Create IAM User", desc: "Create the kim-dev IAM user." },
      { title: "Attach S3 ReadOnly Policy", desc: "Attach AmazonS3ReadOnlyAccess policy to kim-dev." },
      { title: "Verify AccessDenied", desc: "Run S3 DeleteBucket command and verify AccessDenied error." },
    ],
    explanation: "Directly attaching a managed policy to an IAM user is the basic pattern. ReadOnly policies allow only List, Get, and Describe actions, so delete and modify commands return AccessDenied.",
  },
  2: {
    title: "Team-Based Permission Separation",
    scenario: "Your company grew to 5 developers and 3 operations engineers. The dev team manages EC2 only, while operations manages RDS only. Per-user policy management is getting cumbersome, so you want a group-based model.",
    steps: [
      { title: "Create dev-team Group", desc: "Create IAM group dev-team." },
      { title: "Attach EC2 Policy", desc: "Attach AmazonEC2FullAccess policy to dev-team." },
      { title: "Add User to Group", desc: "Add kim-dev to dev-team group." },
    ],
    explanation: "Using IAM groups lets you grant and revoke permissions by adding or removing users from the group. It reduces operational mistakes compared with managing policies per person.",
  },
  3: {
    title: "EC2 Needs S3 Access",
    scenario: "A production EC2 server must upload log files to S3 every night. A developer asked whether it is acceptable to hard-code access keys into EC2. Set it up in a secure way instead.",
    steps: [
      { title: "Create IAM Role", desc: "Create an IAM Role for EC2 service." },
      { title: "Attach S3 Permission", desc: "Attach AmazonS3FullAccess policy to the Role." },
      { title: "Attach Role to EC2", desc: "Attach the created IAM Role to EC2 instance." },
    ],
    explanation: "When EC2 uses an IAM role, the instance metadata service issues temporary credentials automatically. Hard-coding access keys is risky because keys can leak, so using a role is the recommended practice.",
  },
  4: {
    title: "Protect the Customer Data Bucket",
    scenario: "Customer order data is stored in S3. A security audit warned that the bucket could be exposed publicly. Lock the bucket so that only a specific Lambda function can access it.",
    steps: [
      { title: "Block All Public Access", desc: "Block every public access path for the orders-data-bucket." },
      { title: "Apply Bucket Policy", desc: "Apply policy allowing arn:aws:lambda:*:*:function:* Lambda ARN." },
      { title: "Verify Settings", desc: "Confirm that public access blocking is configured correctly." },
    ],
    explanation: "S3 protection has two layers. Block Public Access protects the account or bucket as a safety net, while bucket policy provides fine-grained control for a specific principal such as a Lambda ARN.",
  },
  5: {
    title: "Compliance Encryption Requirement",
    scenario: "A fintech startup stores financial data in S3. Regulators now require that customer data be encrypted with a key managed by the customer company.",
    steps: [
      { title: "Create KMS CMK", desc: "Create Customer Master Key for financial data encryption." },
      { title: "Create KMS Alias", desc: "Create alias like alias/fintech-key for CMK." },
      { title: "Set S3 SSE-KMS", desc: "Set SSE-KMS as the default encryption for fintech-data-bucket." },
    ],
    explanation: "SSE-KMS means S3 calls the KMS API to encrypt and decrypt data. A customer-managed key lets you control access through key policy and audit key usage through CloudTrail.",
  },
  6: {
    title: "Least-Privilege Network Setup for a Web Server",
    scenario: "An EC2 web server is under attack. Its security group is wide open at 0.0.0.0/0. Allow only web traffic, and allow SSH only from the office IP range.",
    steps: [
      { title: "Check Current SG Rules", desc: "Find 0.0.0.0/0 inbound rule in security group." },
      { title: "Remove Wide-Open Rule", desc: "Delete the 0.0.0.0/0 allow rule immediately." },
      { title: "Add HTTPS Rule", desc: "Allow HTTPS for everyone, and restrict SSH to the office IP only." },
    ],
    explanation: "A security group is a stateful firewall with only allow rules. Apply the least-privilege principle by opening only the ports you need, and always restrict management SSH to specific IP addresses.",
  },
  7: {
    title: "Cross-Account Deployment Pipeline",
    scenario: "A CI/CD pipeline in development account A must deploy build artifacts to an S3 bucket in production account B. Giving the production access key to the dev team is not acceptable.",
    steps: [
      { title: "Create Cross-Account Role", desc: "Create Role in Account B trusting Account A ID." },
      { title: "Issue Temporary Credentials", desc: "Run sts assume-role from Account A for temp credentials." },
      { title: "Deploy to Production S3", desc: "Upload the file to the production S3 bucket with the temporary credentials." },
    ],
    explanation: "STS AssumeRole issues temporary credentials, usually for up to 12 hours. The trust policy on the cross-account role must explicitly name the development account. This is much safer than sharing permanent access keys.",
  },
  8: {
    title: "Security Incident - Who Deleted It?",
    scenario: "One morning, a production DB snapshot was gone. Nobody claims to have deleted it. The CTO asked for a full AWS API call history so the culprit can be found.",
    steps: [
      { title: "Create CloudTrail Trail", desc: "Create Trail recording all API calls to S3 in all regions." },
      { title: "Start Trail Logging", desc: "Enable logging for the trail." },
      { title: "Query Delete Event", desc: "Look up the user who triggered the DeleteDBSnapshot event." },
    ],
    explanation: "CloudTrail records every API call in an AWS account. The lookup-events command lets you search quickly by event name or user name, which makes it essential for security incident investigations.",
  },
  9: {
    title: "Remove the DB Password from Code",
    scenario: "During code review, you find an RDS password hard-coded in GitHub code. Security demands an immediate fix. Move the password retrieval to runtime in a safe way.",
    steps: [
      { title: "Store Secret in Secrets Manager", desc: "Store RDS credentials (username, password) in Secrets Manager." },
      { title: "Read Secret at Runtime", desc: "Confirm that the application fetches credentials at runtime." },
      { title: "Set Automatic Rotation", desc: "Configure the password to rotate every 90 days." },
    ],
    explanation: "Secrets Manager stores credentials securely and lets applications fetch them at runtime with the SDK or CLI. Automatic rotation refreshes passwords periodically and reduces the impact of leaks.",
  },
  10: {
    title: "Block Traffic at the Subnet Level",
    scenario: "A security audit concluded that security groups alone are not enough. A second line of defense is needed at the subnet layer to block specific IP ranges. Block a known malicious CIDR with a NACL.",
    steps: [
      { title: "Create Custom NACL", desc: "Create custom Network ACL in VPC." },
      { title: "Add Malicious IP Block Rule", desc: "Add an inbound DENY rule for the 192.168.100.0/24 range." },
      { title: "Attach NACL to Subnet", desc: "Attach the new NACL to the private subnet." },
    ],
    explanation: "A network ACL is a stateless firewall at the subnet layer. Rules are evaluated in order, and a matching DENY rule blocks traffic immediately. Using it with security groups provides layered defense.",
  },
  11: {
    title: "Immediate Deactivation of Departing Employee",
    scenario: "A marketing team member unexpectedly resigned today. HR urgently requested immediate AWS access revocation. Completely clean up the account.",
    steps: [
      { title: "List Access Keys", desc: "Check the current access keys for the lee-marketing user." },
      { title: "Deactivate Access Keys", desc: "Immediately deactivate lee-marketing's access keys." },
      { title: "Delete Console Login", desc: "Delete lee-marketing's console login profile." },
      { title: "Remove from Groups", desc: "Remove lee-marketing from the marketing-team group." },
      { title: "Delete User", desc: "Delete IAM user lee-marketing completely." },
    ],
    explanation: "Departure procedures: List keys → Deactivate → Delete console login → Remove from groups → Delete user. Do not delete immediately; deactivate first to preserve audit logs and allow recovery from mistakes.",
  },
  12: {
    title: "Strengthen IAM Account Security",
    scenario: "A security audit found a critical vulnerability: the root account has no MFA and the password policy is too weak. Check the credential report and strengthen the password policy.",
    steps: [
      { title: "Generate Credential Report", desc: "Generate an IAM credential report." },
      { title: "Review Report", desc: "Download CSV credentials report and check MFA status." },
      { title: "Create Virtual MFA", desc: "Create a virtual MFA device for the root account." },
      { title: "Enforce Strong Password Policy", desc: "Set a policy requiring minimum 14 characters, upper/lower case, numbers, and special characters, with 90-day expiration." },
    ],
    explanation: "The IAM credential report (CSV) shows MFA status, last password use, and access key status for all users at a glance. CIS Benchmarks recommend minimum 14 characters, 90-day rotation, and mandatory MFA.",
  },
  13: {
    title: "Recover Accidentally Deleted Files",
    scenario: "A deployment script bug accidentally deleted configuration files in the production S3 bucket. Check version control status and recover the files, then enable MFA Delete to prevent this in the future.",
    steps: [
      { title: "Check Versioning Status", desc: "Verify config-bucket has Versioning enabled." },
      { title: "List Deleted Versions", desc: "List all versions and delete markers for app-config.json." },
      { title: "Remove Delete Marker to Recover", desc: "Remove the DeleteMarker to recover the file." },
      { title: "Verify Recovery", desc: "Confirm app-config.json is restored and accessible." },
    ],
    explanation: "S3 versioned delete actually adds a 'delete marker'. You can delete the marker by VersionId to recover. Enabling MFA Delete requires MFA to add delete markers, preventing accidental deletion.",
  },
  14: {
    title: "GuardDuty Threat Detection and Real-time Alerts",
    scenario: "You received a late notification that EC2 instances were unexpectedly created in a suspicious region. Enable GuardDuty and configure real-time SNS notifications for threat detections.",
    steps: [
      { title: "Enable GuardDuty", desc: "Activate GuardDuty in current AWS region." },
      { title: "Create SNS Topic", desc: "Create SNS topic billing-alerts for cost notifications." },
      { title: "List Findings", desc: "Use ListFindings API to query all GuardDuty findings." },
      { title: "View Finding Details", desc: "View detailed information about a detected finding." },
    ],
    explanation: "GuardDuty uses machine learning to analyze CloudTrail, VPC Flow Logs, and DNS queries to automatically detect TOR access, abnormal region activity, credential compromise, and more. EventBridge + SNS enables instant email/Slack notifications.",
  },
  15: {
    title: "Narrow Lambda Privileges to Minimum",
    scenario: "A Lambda function reading S3 and writing to DynamoDB has AdministratorAccess as its execution role. Replace it with a custom policy allowing only the required S3 read and DynamoDB write permissions.",
    steps: [
      { title: "Check Current Lambda Role", desc: "Check the current execution role of the data-processor Lambda." },
      { title: "Create Custom Policy", desc: "Create policy allowing S3:GetObject(specific bucket), DynamoDB:PutItem(specific table)." },
      { title: "Create Minimum Privilege Role", desc: "Create a Lambda-specific role with minimum privileges." },
      { title: "Attach Custom Policy", desc: "Attach custom policy to lambda-processor-role." },
      { title: "Update Lambda Role", desc: "Change data-processor execution role to lambda-processor-role." },
    ],
    explanation: "Never use AdministratorAccess for Lambda. A custom policy should specify only the actual APIs (S3:GetObject, DynamoDB:PutItem) and limit resources to specific bucket/table ARNs for true least-privilege.",
  },
  16: {
    title: "Access Key Rotation - Keys Over 90 Days",
    scenario: "Security policy requires rotating IAM access keys every 90 days. The dev-user's keys are now 120 days old. Safely rotate the keys and clean up the old ones.",
    steps: [
      { title: "List Current Keys", desc: "Check the current access keys and creation dates for dev-user." },
      { title: "Create New Key", desc: "Generate new access key for dev-user." },
      { title: "Deactivate Old Key", desc: "Set old access key to Inactive status." },
      { title: "Delete Old Key", desc: "Delete old key after verifying Inactive for several days." },
    ],
    explanation: "Rotation sequence: Create new key → Test with new key → Deactivate old key (Inactive) → Verify for days → Delete. Do not delete immediately; keep it inactive for recovery if needed.",
  },
  17: {
    title: "Real-time Alert for Root Account Login",
    scenario: "The security team wants real-time notifications whenever the root account logs in. Set up a CloudTrail → CloudWatch Logs → SNS notification chain.",
    steps: [
      { title: "Create SNS Topic", desc: "Create SNS topic billing-alerts for cost notifications." },
      { title: "Add Email Subscription", desc: "Subscribe security@example.com to root-login-alerts topic." },
      { title: "Create Metric Filter", desc: "Create filter: userIdentity.type == Root && eventName == ConsoleLogin." },
      { title: "Create CloudWatch Alarm", desc: "Create an alarm to send SNS notifications on root login." },
    ],
    explanation: "The chain is CloudTrail → CloudWatch Logs → metric filter → CloudWatch alarm → SNS. Root login monitoring is a required item in CIS AWS Foundations Benchmark.",
  },
  18: {
    title: "Enable S3 Bucket Access Logging",
    scenario: "A privacy audit found that S3 buckets have no access logs showing who accessed which files when. Create a logging bucket and enable server access logging.",
    steps: [
      { title: "Create Log Bucket", desc: "Create a separate bucket for access logs." },
      { title: "Enable Server Access Logging", desc: "Enable access logging on customer-data bucket to the log bucket." },
      { title: "Verify Logging Settings", desc: "Confirm that logging is properly configured." },
      { title: "Check Log Files", desc: "Verify that log files are being stored." },
    ],
    explanation: "S3 server access logging records all requests to a bucket. Log and source buckets must be in the same region. There is a slight delay (minutes) in log delivery. Logs can be queried with Athena.",
  },
  19: {
    title: "Use Parameter Store Instead of Environment Variables",
    scenario: "A Lambda function stores API keys and DB connection strings in plaintext environment variables. Move them to SSM Parameter Store and remove them from environment variables.",
    steps: [
      { title: "Store DB URL as SecureString", desc: "Save the DB connection string as an encrypted parameter." },
      { title: "Store API Key as SecureString", desc: "Save the API key as an encrypted parameter." },
      { title: "Grant Lambda Parameter Store Access", desc: "Add ssm:GetParameter permission to the Lambda role." },
      { title: "Update Lambda Code", desc: "Modify Lambda code to call boto3 ssm.get_parameter() and redeploy." },
    ],
    explanation: "Parameter Store SecureString uses KMS encryption. Plaintext is not exposed in error logs or memory dumps. Parameter updates do not require Lambda redeployment.",
  },
  20: {
    title: "Enforce IMDSv2 to Block SSRF",
    scenario: "A production EC2 instance has an SSRF vulnerability. IMDSv1 is vulnerable, so change the instance to IMDSv2 only.",
    steps: [
      { title: "Check IMDSv1 Status", desc: "Verify EC2 metadata options for prod-instance." },
      { title: "Enforce IMDSv2", desc: "Require metadata tokens for all requests." },
      { title: "Set Token TTL", desc: "Set metadata token TTL to 3600 seconds (1 hour)." },
      { title: "Verify Changes", desc: "Confirm that IMDSv2-only is enforced." },
    ],
    explanation: "IMDSv2 requires a PUT request to obtain a token first, then a GET request with that token. SSRF attackers must first obtain the token to access metadata, greatly improving security.",
  },
  21: {
    title: "Audit Network Traffic with VPC Flow Logs",
    scenario: "A late-night alert indicated that a specific EC2 instance is exfiltrating massive amounts of data. Enable VPC Flow Logs to record network traffic.",
    steps: [
      { title: "Create IAM Role", desc: "Create an IAM Role for EC2 service." },
      { title: "Create CloudWatch Log Group", desc: "Create CloudWatch Logs group vpc-flow-logs." },
      { title: "Enable VPC Flow Logs", desc: "Activate VPC Flow Logs for prod-vpc to vpc-flow-logs group." },
      { title: "Query Network Traffic", desc: "Search CloudWatch Logs for REJECT traffic from suspected EC2." },
    ],
    explanation: "VPC Flow Logs record 5-tuple data (source IP, dest IP, port, protocol, accept/reject) at VPC, subnet, or ENI level. They detect data exfiltration, port scans, and DDoS attacks.",
  },
  22: {
    title: "Enforce Encryption on All S3 Uploads",
    scenario: "S3 audit found files uploaded without encryption. Enforce encryption at both the default and bucket policy levels.",
    steps: [
      { title: "Check Default Encryption", desc: "Verify secure-uploads bucket Default encryption setting." },
      { title: "Enable Default Encryption", desc: "Set the bucket's default encryption to AES256 or KMS." },
      { title: "Verify Encryption Setting", desc: "Confirm that default encryption is properly set." },
      { title: "Apply HTTPS and Encryption Policy", desc: "Apply a bucket policy to deny non-encrypted uploads and HTTP access." },
    ],
    explanation: "Default encryption auto-encrypts uploads without headers, but cannot prevent explicit 'no encryption' requests. Bucket policy must DENY non-HTTPS and non-encrypted requests for complete enforcement.",
  },
  23: {
    title: "Auto-detect Open SSH in Security Groups",
    scenario: "A developer opened SSH to 0.0.0.0/0 for debugging. Use AWS Config to auto-detect such violations and auto-remediate them.",
    steps: [
      { title: "Enable AWS Config", desc: "Enable the Config recorder to track security group changes." },
      { title: "Configure Delivery Channel", desc: "Set delivery channel to store Config snapshots to S3." },
      { title: "Add restricted-ssh Rule", desc: "Add AWS Config managed rule restricted-ssh." },
      { title: "Check Compliance", desc: "Check the compliance status of the restricted-ssh rule." },
    ],
    explanation: "AWS Config continuously records resource changes and evaluates them against managed rules. The restricted-ssh rule detects 0.0.0.0/0 on port 22 and can auto-remediate via Systems Manager Automation.",
  },
  24: {
    title: "IAM Access Analyzer - Detect External Access",
    scenario: "You need to find all resources in the account accessible from outside. Use Access Analyzer to auto-detect and remediate such findings.",
    steps: [
      { title: "Create Analyzer", desc: "Create an Analyzer to scan the entire account." },
      { title: "List Externally Accessible Resources", desc: "List all resources accessible from outside." },
      { title: "Review Finding Details", desc: "Examine details of public S3 buckets, IAM Roles, etc." },
      { title: "Archive Finding", desc: "Change Finding status to ARCHIVED after remediation." },
    ],
    explanation: "Access Analyzer analyzes S3 bucket policies, IAM role trust policies, and KMS key policies to find external access. After remediation, mark findings as ARCHIVED.",
  },
  25: {
    title: "Audit All S3 Buckets for Public ACL",
    scenario: "Legacy buckets might have public ACLs. Audit all buckets, fix problematic ones, and block public access at the account level.",
    steps: [
      { title: "List All Buckets", desc: "Run aws s3api list-buckets to list account buckets." },
      { title: "Check Problem Bucket ACL", desc: "Query old-backup-2023 bucket ACL for public-read permissions." },
      { title: "Change ACL to Private", desc: "Set old-backup-2023 bucket ACL to private." },
      { title: "Block Public Access at Account Level", desc: "Apply account-level S3 Block Public Access." },
    ],
    explanation: "Account-level S3 Block Public Access applies to all buckets. Setting IgnorePublicAcls=true overrides existing public ACLs. AWS recommends enabling this on new accounts by default.",
  },
  26: {
    title: "RDS Automated Backup and Snapshot Management",
    scenario: "A disaster recovery drill revealed that RDS automated backups are disabled and no recent snapshots exist. Immediately configure backup policies and create a manual snapshot.",
    steps: [
      { title: "Check Backup Settings", desc: "Check the current backup configuration for the production DB." },
      { title: "Enable 7-Day Backup Retention", desc: "Enable automated backups with 7-day retention." },
      { title: "Set Backup Window", desc: "Set backup execution time to 03:00-04:00 UTC." },
      { title: "Create Manual Snapshot", desc: "Create manual snapshot of current database state." },
    ],
    explanation: "RDS backup retention of 0 disables backups. Production environments need at least 7 days retention. Choose a backup window during low traffic and avoid overlapping with maintenance windows.",
  },
  27: {
    title: "CloudFront + S3 OAI to Block Direct Access",
    scenario: "A static website hosted on S3 and distributed via CloudFront is still directly accessible via S3 URL. Configure OAI to allow access only through CloudFront.",
    steps: [
      { title: "Check Current Bucket Policy", desc: "Check the policy on static-web-content bucket." },
      { title: "Create OAI", desc: "Create CloudFront Origin Access Identity." },
      { title: "Update Bucket Policy", desc: "Apply policy allowing Principal: arn:aws:cloudfront::account-id:distribution/DIST_ID." },
      { title: "Block S3 Public Access", desc: "Completely block public access to S3." },
      { title: "Verify Configuration", desc: "Confirm EC2 metadata options are IMDSv2 only." },
    ],
    explanation: "OAI is a special ID used by CloudFront to access S3. With OAI in the bucket policy and public access blocked, direct S3 URLs become inaccessible, forcing users through CloudFront.",
  },
  28: {
    title: "Fix Lambda Role Trust Policy Error",
    scenario: "A Lambda function is failing with 'AccessDenied: sts:AssumeRole'. The trust policy has an incorrect Principal. Identify and fix the issue.",
    steps: [
      { title: "Check Lambda Role", desc: "Verify execution role name of lambda-processing function." },
      { title: "Review Trust Policy", desc: "Check Trust Policy Principal in lambda-processing-role." },
      { title: "Fix Principal", desc: "Correct the Principal to lambda.amazonaws.com." },
      { title: "Verify Changes", desc: "Confirm the trust policy is corrected." },
    ],
    explanation: "The trust policy defines who can assume the role. A Lambda role must trust lambda.amazonaws.com. If it incorrectly trusts ec2.amazonaws.com, Lambda cannot use the role.",
  },
  29: {
    title: "Billing Alerts and Budget Enforcement",
    scenario: "Last month's bill was unexpectedly $5,000 due to unauthorized GPU instances. Set up alerts for $500+ monthly spending and use AWS Budgets to prevent overspending.",
    steps: [
      { title: "Create SNS Topic", desc: "Create SNS topic billing-alerts for cost notifications." },
      { title: "Add Email Subscription", desc: "Subscribe security@example.com to root-login-alerts topic." },
      { title: "Create Billing Alarm", desc: "Create a CloudWatch alarm for $500+ estimated monthly cost." },
      { title: "Create Budget", desc: "Create a $500 monthly budget with 80% notification threshold." },
    ],
    explanation: "CloudWatch billing alarms can only be created in us-east-1. AWS Budgets provides finer-grained cost control with service/tag/region-specific budgets. Use both together.",
  },
  30: {
    title: "Full Security Posture Assessment with Security Hub",
    scenario: "The new CTO requested a full AWS security report by afternoon. Use Security Hub to assess the account's security score and vulnerabilities, then update remediation status.",
    steps: [
      { title: "Enable Security Hub", desc: "Activate Security Hub with CIS Benchmark standard." },
      { title: "Query Critical Findings", desc: "List security findings with Critical severity or higher." },
      { title: "Review Insight Summary", desc: "Check Security Hub insights for vulnerable resources." },
      { title: "Update Remediation Status", desc: "Update remediated findings to RESOLVED status." },
    ],
    explanation: "AWS Security Hub aggregates findings from GuardDuty, Inspector, Macie, and other services. It continuously evaluates CIS AWS Foundations Benchmark and FSBP controls. Regularly check your score and update findings as RESOLVED.",
  },
};
