#!/usr/bin/env python3
import re
import os

# SEC 영어 (1-30)
sec_en = {
    1: [("IAM User Creation", "Create user kim-dev in IAM."), ("Attach S3 ReadOnly Policy", "Attach AmazonS3ReadOnlyAccess policy to kim-dev."), ("Verify AccessDenied", "Run S3 DeleteBucket command and verify AccessDenied error.")],
    2: [("Create dev-team Group", "Create IAM group dev-team."), ("Attach EC2 Policy", "Attach AmazonEC2FullAccess policy to dev-team."), ("Add User to Group", "Add kim-dev to dev-team group.")],
    3: [("Create IAM Role", "Create an IAM Role for EC2 service."), ("Attach S3 Permission", "Attach AmazonS3FullAccess policy to the Role."), ("Attach Role to EC2", "Attach the created IAM Role to EC2 instance.")],
    4: [("Block Public Access", "Block all public access to orders-data-bucket."), ("Apply Bucket Policy", "Apply policy allowing arn:aws:lambda:*:*:function:* Lambda ARN."), ("Verify Configuration", "Verify Block public access is all ON.")],
    5: [("Create KMS CMK", "Create Customer Master Key for financial data encryption."), ("Create KMS Alias", "Create alias like alias/fintech-key for CMK."), ("Enable S3 SSE-KMS", "Set fintech-data-bucket default encryption to KMS CMK.")],
    6: [("Check Current SG Rules", "Find 0.0.0.0/0 inbound rule in security group."), ("Delete Open Rule", "Delete 0.0.0.0/0 open inbound rule immediately."), ("Add HTTPS/SSH Rules", "Add HTTPS(443) to 0.0.0.0/0 and SSH(22) to 192.168.1.0/24.")],
    7: [("Create Cross-Account Role", "Create Role in Account B trusting Account A ID."), ("Issue Temporary Credentials", "Run sts assume-role from Account A for temp credentials."), ("Deploy to Prod Account S3", "Upload files to Account B S3 using temp credentials.")],
    8: [("Create CloudTrail Trail", "Create Trail recording all API calls to S3 in all regions."), ("Enable Trail Logging", "Enable logging for the created Trail."), ("Find Delete Event", "Query CloudTrail lookup-events for DeleteDBSnapshot event and user.")],
    9: [("Store Secret in Secrets Manager", "Store RDS credentials (username, password) in Secrets Manager."), ("Query Secret at Runtime", "Call get_secret_value() in Lambda to retrieve credentials."), ("Enable Auto-Rotation", "Set auto-rotation period to 90 days in Secrets Manager.")],
    10: [("Create Custom NACL", "Create custom Network ACL in VPC."), ("Add IP Block Rule", "Add rule 100 to DENY 192.168.100.0/24 inbound."), ("Attach to Subnet", "Attach custom NACL to private subnet.")],
    11: [("Check Access Keys", "View access keys for lee-marketing user."), ("Deactivate Keys", "Set lee-marketing access keys to Inactive."), ("Delete Console Password", "Delete console login profile for lee-marketing."), ("Remove from Group", "Remove lee-marketing from marketing-team group."), ("Delete User", "Delete IAM user lee-marketing completely.")],
    12: [("Generate Credentials Report", "Generate IAM Credentials Report."), ("Review Report", "Download CSV credentials report and check MFA status."), ("Enable Virtual MFA", "Activate virtual MFA device (Google Authenticator) for root account."), ("Enforce Password Policy", "Set 14+ chars, upper+lower+number+special, 90-day expiration, exclude 3 previous.")],
    13: [("Check Versioning Status", "Verify config-bucket has Versioning enabled."), ("List File Versions", "List all versions and delete markers for app-config.json."), ("Remove Delete Marker", "Execute delete-object on Delete Marker VersionId to restore file."), ("Verify Recovery", "Confirm app-config.json is restored and accessible.")],
    14: [("Enable GuardDuty", "Activate GuardDuty in current AWS region."), ("Create SNS Topic", "Create SNS topic guardduty-alerts for security alerts."), ("List Findings", "Use ListFindings API to query all GuardDuty findings."), ("Get Finding Details", "Use GetFindings API to view detailed finding information.")],
    15: [("Check Lambda Role", "Verify execution role of data-processor Lambda."), ("Create Custom Policy", "Create policy allowing S3:GetObject(specific bucket), DynamoDB:PutItem(specific table)."), ("Create Minimal Role", "Create Lambda execution role lambda-processor-role."), ("Attach Custom Policy", "Attach custom policy to lambda-processor-role."), ("Update Lambda Role", "Change data-processor execution role to lambda-processor-role.")],
    16: [("Check Existing Keys", "Find access keys for dev-user created over 90 days ago."), ("Create New Key", "Generate new access key for dev-user."), ("Deactivate Old Key", "Set old access key to Inactive status."), ("Delete Old Key", "Delete old key after verifying Inactive for several days.")],
    17: [("Create SNS Topic", "Create SNS topic root-login-alerts for root login notifications."), ("Add Email Subscription", "Subscribe security@example.com to root-login-alerts topic."), ("Create Metric Filter", "Create filter: userIdentity.type == Root && eventName == ConsoleLogin."), ("Create Alarm", "Create alarm triggering SNS when filter matches >= 1 time.")],
    18: [("Create Logging Bucket", "Create bucket s3-access-logs-bucket for server access logs."), ("Enable Access Logging", "Set customer-data bucket logging destination to s3-access-logs-bucket."), ("Verify Logging Config", "Confirm customer-data > Properties > Server access logging is correct."), ("Verify Log Files", "Confirm log files (*.log) are saved to s3-access-logs-bucket.")],
    19: [("Store DB URL", "Save /app/db-url as SecureString in Parameter Store."), ("Store API Key", "Save /app/api-key as SecureString in Parameter Store."), ("Grant Lambda Permission", "Add ssm:GetParameter permission (ssm:Name/app/*) to Lambda Role."), ("Update Lambda Code", "Modify Lambda code to call boto3 ssm.get_parameter() and redeploy.")],
    20: [("Check IMDSv1 Status", "Verify EC2 metadata options for prod-instance."), ("Enable IMDSv2 Only", "Set metadata options to IMDSv2 Required."), ("Set Token TTL", "Set metadata token TTL to 3600 seconds (1 hour)."), ("Verify Configuration", "Confirm EC2 metadata options are IMDSv2 only.")],
    21: [("Create VPC Flow Logs Role", "Create IAM role with CloudWatch Logs write permissions."), ("Create CloudWatch Log Group", "Create CloudWatch Logs group vpc-flow-logs."), ("Enable VPC Flow Logs", "Activate VPC Flow Logs for prod-vpc to vpc-flow-logs group."), ("Query Network Traffic", "Search CloudWatch Logs for REJECT traffic from suspected EC2.")],
    22: [("Check Default Encryption", "Verify secure-uploads bucket Default encryption setting."), ("Enable Encryption", "Set Default encryption to AES256 or KMS CMK."), ("Verify Encryption", "Confirm Default encryption is applied correctly."), ("Apply Encryption Policy", "Apply policy denying aws:SecureTransport: false or no-encryption requests.")],
    23: [("Enable Config Recorder", "Activate AWS Config recorder to track resource changes."), ("Configure Delivery Channel", "Set delivery channel to store Config snapshots to S3."), ("Add restricted-ssh Rule", "Add AWS Config managed rule restricted-ssh."), ("Check Compliance Status", "Review restricted-ssh compliance and identify NON_COMPLIANT security groups.")],
    24: [("Create Access Analyzer", "Create Access Analyzer to scan entire account."), ("List External Access Findings", "Query Findings where access == EXTERNAL_ACCESS."), ("Review Finding Details", "Examine details of public S3 buckets, IAM Roles, etc."), ("Archive Finding", "Change Finding status to ARCHIVED after remediation.")],
    25: [("List All Buckets", "Run aws s3api list-buckets to list account buckets."), ("Check Problem Bucket ACL", "Query old-backup-2023 bucket ACL for public-read permissions."), ("Change ACL to Private", "Set old-backup-2023 bucket ACL to private."), ("Enable Account-Level Block", "Enable S3 Block Public Access for entire account.")],
    26: [("Check Backup Config", "Verify RDS Backup Retention Period setting."), ("Set 7-Day Retention", "Change Backup Retention Period from 0 to 7 days."), ("Set Backup Window", "Set backup execution time to 03:00-04:00 UTC."), ("Create Manual Snapshot", "Create manual snapshot of current database state.")],
    27: [("Review Bucket Policy", "Check static-web-content bucket policy."), ("Create OAI", "Create CloudFront Origin Access Identity."), ("Update Bucket Policy", "Apply policy allowing Principal: arn:aws:cloudfront::account-id:distribution/DIST_ID."), ("Block Direct Access", "Enable Block public access for static-web-content bucket."), ("Verify Setup", "Confirm S3 direct access blocked and CloudFront URL works.")],
    28: [("Check Lambda Role", "Verify execution role name of lambda-processing function."), ("Review Trust Policy", "Check Trust Policy Principal in lambda-processing-role."), ("Fix Trust Policy", "Change Principal to lambda.amazonaws.com."), ("Verify Fix", "Confirm Trust Policy includes lambda.amazonaws.com.")],
    29: [("Create SNS Topic", "Create SNS topic billing-alerts for cost notifications."), ("Add Email", "Subscribe finance@example.com to billing-alerts topic."), ("Create Cost Alarm", "Create CloudWatch alarm for us-east-1 EstimatedCharges >= 500 to trigger SNS."), ("Create AWS Budget", "Create monthly $500 budget with 80% notification threshold.")],
    30: [("Enable Security Hub", "Activate Security Hub with CIS Benchmark standard."), ("Find Critical Issues", "Query Findings with Severity >= CRITICAL."), ("Review Insights", "Check Security Hub Insights for unresolved vulnerabilities."), ("Update Status", "Change resolved findings Record State to RESOLVED.")],
}

def update_file(file_path, updates_dict):
    if not os.path.exists(file_path):
        print(f"SKIP: {file_path} does not exist")
        return 0

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    updated_count = 0
    for scenario_num, step_updates in updates_dict.items():
        for step_title, new_desc in step_updates:
            pattern = rf'(\{{\s*title:\s*"{re.escape(step_title)}",\s*desc:\s*)"[^"]*"(\s*\}})'
            replacement = rf'\1"{new_desc}"\2'
            before = content
            content = re.sub(pattern, replacement, content)
            if before != content:
                updated_count += 1

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

    return updated_count

# Update SEC English
count = update_file('src/locales/sec-en.ts', sec_en)
print(f"Updated {count} descriptions in sec-en.ts")
