// Scenario answers for SEC, RES, PERF, COST scenarios
// Each scenario has steps with corresponding valid command answers

type ScenarioAnswers = {
  [key: number]: {
    answers: string[][];  // answers[stepIndex] = array of valid commands for that step
  };
};

export const SEC_ANSWERS: ScenarioAnswers = {
  1: {
    answers: [
      ['aws iam create-user --user-name kim-dev'],
      ['aws iam attach-user-policy --user-name kim-dev --policy-arn arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess'],
      ['aws s3 rm s3://bucket-name/object --recursive', 'aws s3api delete-bucket --bucket bucket-name'],
    ],
  },
  2: {
    answers: [
      ['aws iam create-group --group-name dev-team'],
      ['aws iam attach-group-policy --group-name dev-team --policy-arn arn:aws:iam::aws:policy/AmazonEC2FullAccess'],
      ['aws iam add-user-to-group --group-name dev-team --user-name kim-dev'],
    ],
  },
  3: {
    answers: [
      ['aws iam create-role --role-name ec2-s3-role --assume-role-policy-document file://trust-policy.json'],
      ['aws iam attach-role-policy --role-name ec2-s3-role --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess'],
      ['aws ec2 associate-iam-instance-profile --instance-id i-xxxxx --iam-instance-profile Name=ec2-s3-profile'],
    ],
  },
  4: {
    answers: [
      ['aws s3api put-public-access-block --bucket orders-data-bucket --public-access-block-configuration "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"'],
      ['aws s3api put-bucket-policy --bucket orders-data-bucket --policy file://policy.json'],
      ['aws s3api get-public-access-block --bucket orders-data-bucket'],
    ],
  },
  5: {
    answers: [
      ['aws kms create-key --description "Financial data CMK"'],
      ['aws kms create-alias --alias-name alias/fintech-key --target-key-id key-id'],
      ['aws s3api put-bucket-encryption --bucket fintech-data-bucket --server-side-encryption-configuration "{...}"'],
    ],
  },
  6: {
    answers: [
      ['aws ec2 describe-security-groups --group-ids sg-xxxxx'],
      ['aws ec2 revoke-security-group-ingress --group-id sg-xxxxx --protocol tcp --port 1-65535 --cidr 0.0.0.0/0'],
      ['aws ec2 authorize-security-group-ingress --group-id sg-xxxxx --protocol tcp --port 443 --cidr 0.0.0.0/0', 'aws ec2 authorize-security-group-ingress --group-id sg-xxxxx --protocol tcp --port 22 --cidr office-ip/32'],
    ],
  },
  7: {
    answers: [
      ['aws iam create-role --role-name cross-account-deploy --assume-role-policy-document file://trust-policy.json'],
      ['aws sts assume-role --role-arn arn:aws:iam::account-b:role/cross-account-deploy --role-session-name deploy-session'],
      ['aws s3 cp build-artifact.zip s3://prod-bucket/ --region us-east-1'],
    ],
  },
  8: {
    answers: [
      ['aws cloudtrail create-trail --name api-audit-trail --s3-bucket-name audit-bucket', 'aws cloudtrail start-logging --trail-name api-audit-trail'],
      ['aws cloudtrail start-logging --trail-name api-audit-trail'],
      ['aws cloudtrail lookup-events --event-name DeleteDBSnapshot'],
    ],
  },
  9: {
    answers: [
      ['aws secretsmanager create-secret --name db-credentials --secret-string file://credentials.json'],
      ['aws secretsmanager get-secret-value --secret-id db-credentials'],
      ['aws secretsmanager rotate-secret --secret-id db-credentials --rotation-rules AutomaticallyAfterDays=90'],
    ],
  },
  10: {
    answers: [
      ['aws ec2 create-network-acl --vpc-id vpc-xxxxx'],
      ['aws ec2 create-network-acl-entry --network-acl-id acl-xxxxx --rule-number 100 --protocol tcp --port-range From=0,To=65535 --cidr 192.168.100.0/24 --egress false --rule-action deny'],
      ['aws ec2 associate-network-acl --network-acl-id acl-xxxxx --subnet-id subnet-xxxxx'],
    ],
  },
  11: {
    answers: [
      ['aws iam list-access-keys --user-name lee-marketing'],
      ['aws iam update-access-key --user-name lee-marketing --access-key-id AKIA... --status Inactive'],
      ['aws iam delete-login-profile --user-name lee-marketing'],
      ['aws iam remove-user-from-group --group-name marketing-team --user-name lee-marketing'],
      ['aws iam delete-user --user-name lee-marketing'],
    ],
  },
  12: {
    answers: [
      ['aws iam generate-credential-report'],
      ['aws iam get-credential-report'],
      ['aws iam enable-mfa-device --user-name root --serial-number arn:aws:iam::account:mfa/root-device --authentication-code1 123456 --authentication-code2 654321'],
      ['aws iam update-account-password-policy --minimum-password-length 14 --require-symbols --require-numbers --require-uppercase-characters --require-lowercase-characters --password-reuse-prevention 5 --max-password-age 90'],
    ],
  },
  13: {
    answers: [
      ['aws s3api get-bucket-versioning --bucket config-bucket'],
      ['aws s3api list-object-versions --bucket config-bucket --prefix app-config.json'],
      ['aws s3api delete-object --bucket config-bucket --key app-config.json --version-id VersionIdOfDeleteMarker'],
      ['aws s3api head-object --bucket config-bucket --key app-config.json'],
    ],
  },
  14: {
    answers: [
      ['aws guardduty create-detector --enable'],
      ['aws sns create-topic --name security-alerts'],
      ['aws guardduty list-findings --detector-id detector-id'],
      ['aws guardduty get-findings --detector-id detector-id --finding-ids finding-id'],
    ],
  },
  15: {
    answers: [
      ['aws lambda get-function --function-name data-processor'],
      ['aws iam create-policy --policy-name lambda-s3-dynodb-policy --policy-document file://policy.json'],
      ['aws iam create-role --role-name lambda-execution-role --assume-role-policy-document file://trust-policy.json'],
      ['aws iam attach-role-policy --role-name lambda-execution-role --policy-arn arn:aws:iam::account:policy/lambda-s3-dynodb-policy'],
      ['aws lambda update-function-configuration --function-name data-processor --role arn:aws:iam::account:role/lambda-execution-role'],
    ],
  },
  16: {
    answers: [
      ['aws iam list-access-keys --user-name dev-user'],
      ['aws iam create-access-key --user-name dev-user'],
      ['aws iam update-access-key --user-name dev-user --access-key-id AKIA... --status Inactive'],
      ['aws iam delete-access-key --user-name dev-user --access-key-id AKIA...'],
    ],
  },
  17: {
    answers: [
      ['aws sns create-topic --name security-alerts'],
      ['aws sns subscribe --topic-arn arn:aws:sns:region:account:security-alerts --protocol email --notification-endpoint admin@example.com'],
      ['aws logs create-metric-filter --log-group-name /aws/cloudtrail/logs --filter-pattern "{ ($.eventName = \"ConsoleLogin\") && ($.userIdentity.type = \"Root\") }"'],
      ['aws cloudwatch put-metric-alarm --alarm-name root-login --metric-name RootLoginEventCount --threshold 1 --comparison-operator GreaterThanOrEqualToThreshold --evaluation-periods 1'],
    ],
  },
  18: {
    answers: [
      ['aws s3api create-bucket --bucket log-bucket --region region'],
      ['aws s3api put-bucket-logging --bucket customer-data --bucket-logging-status file://logging.json'],
      ['aws s3api get-bucket-logging --bucket customer-data'],
      ['aws s3api list-objects-v2 --bucket log-bucket'],
    ],
  },
  19: {
    answers: [
      ['aws ssm put-parameter --name /lambda/db-url --value "jdbc:mysql://..." --type SecureString --key-id arn:aws:kms:region:account:key/key-id'],
      ['aws ssm put-parameter --name /lambda/api-key --value "sk-xxxxx" --type SecureString --key-id arn:aws:kms:region:account:key/key-id'],
      ['aws iam attach-role-policy --role-name lambda-execution-role --policy-arn arn:aws:iam::account:policy/ssm-parameter-access'],
      ['aws lambda update-function-configuration --function-name function-name --role arn:aws:iam::account:role/lambda-execution-role'],
    ],
  },
  20: {
    answers: [
      ['aws ec2 describe-instances --instance-ids i-xxxxx --query "Reservations[0].Instances[0].MetadataOptions"'],
      ['aws ec2 modify-instance-metadata-options --instance-id i-xxxxx --http-token required'],
      ['aws ec2 modify-instance-metadata-options --instance-id i-xxxxx --http-put-response-hop-limit 1'],
      ['aws ec2 describe-instances --instance-ids i-xxxxx --query "Reservations[0].Instances[0].MetadataOptions"'],
    ],
  },
  21: {
    answers: [
      ['aws iam create-role --role-name vpc-flow-logs-role --assume-role-policy-document file://trust-policy.json'],
      ['aws logs create-log-group --log-group-name /aws/vpc/flowlogs'],
      ['aws ec2 create-flow-logs --resource-type VPC --resource-ids vpc-xxxxx --traffic-type ALL --log-destination-type cloud-watch-logs --log-group-name /aws/vpc/flowlogs --deliver-logs-permission-iam-role-arn arn:aws:iam::account:role/vpc-flow-logs-role'],
      ['aws logs filter-log-events --log-group-name /aws/vpc/flowlogs --filter-pattern "[ version, account, interface_id, srcaddr, dstaddr, srcport, dstport=\"22\", protocol=\"6\", packets, bytes, windowstart, windowend, action=\"REJECT\", flow_log_status ]"'],
    ],
  },
  22: {
    answers: [
      ['aws s3api get-bucket-encryption --bucket secure-uploads'],
      ['aws s3api put-bucket-encryption --bucket secure-uploads --server-side-encryption-configuration file://encryption.json'],
      ['aws s3api get-bucket-encryption --bucket secure-uploads'],
      ['aws s3api put-bucket-policy --bucket secure-uploads --policy file://bucket-policy.json'],
    ],
  },
  23: {
    answers: [
      ['aws configservice put-config-recorder --config-recorder name=default,roleARN=arn:aws:iam::account:role/config-role'],
      ['aws configservice put-delivery-channel --delivery-channel name=default,s3BucketName=config-bucket'],
      ['aws configservice put-config-rule --config-rule file://restricted-ssh.json'],
      ['aws configservice describe-compliance-by-config-rule'],
    ],
  },
  24: {
    answers: [
      ['aws accessanalyzer create-analyzer --analyzer-name account-analyzer --type ACCOUNT'],
      ['aws accessanalyzer list-findings --analyzer-arn arn:aws:access-analyzer:region:account:analyzer/account-analyzer'],
      ['aws accessanalyzer get-finding --analyzer-arn arn:aws:access-analyzer:region:account:analyzer/account-analyzer --id finding-id'],
      ['aws accessanalyzer update-findings --analyzer-arn arn:aws:access-analyzer:region:account:analyzer/account-analyzer --ids finding-id --status ARCHIVED'],
    ],
  },
  25: {
    answers: [
      ['aws s3api list-buckets'],
      ['aws s3api get-bucket-acl --bucket old-backup-2023'],
      ['aws s3api put-bucket-acl --bucket old-backup-2023 --acl private'],
      ['aws s3api put-account-public-access-block --public-access-block-configuration "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"'],
    ],
  },
  26: {
    answers: [
      ['aws rds describe-db-instances --db-instance-identifier prod-db'],
      ['aws rds modify-db-instance --db-instance-identifier prod-db --backup-retention-period 7 --apply-immediately'],
      ['aws rds modify-db-instance --db-instance-identifier prod-db --preferred-backup-window "03:00-04:00" --apply-immediately'],
      ['aws rds create-db-snapshot --db-instance-identifier prod-db --db-snapshot-identifier prod-db-snapshot-$(date +%Y%m%d)'],
    ],
  },
  27: {
    answers: [
      ['aws s3api get-bucket-policy --bucket static-web-content'],
      ['aws cloudfront create-cloud-front-origin-access-identity --cloud-front-origin-access-identity-config CallerReference=oai-$(date +%s),Comment="CloudFront OAI"'],
      ['aws s3api put-bucket-policy --bucket static-web-content --policy file://oai-policy.json'],
      ['aws s3api put-public-access-block --bucket static-web-content --public-access-block-configuration "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"'],
      ['aws s3api get-public-access-block --bucket static-web-content'],
    ],
  },
  28: {
    answers: [
      ['aws lambda get-function --function-name lambda-processing'],
      ['aws iam get-role --role-name lambda-processing-role'],
      ['aws iam update-assume-role-policy --role-name lambda-processing-role --policy-document file://trust-policy.json'],
      ['aws iam get-role --role-name lambda-processing-role'],
    ],
  },
  29: {
    answers: [
      ['aws sns create-topic --name billing-alerts'],
      ['aws sns subscribe --topic-arn arn:aws:sns:us-east-1:account:billing-alerts --protocol email --notification-endpoint admin@example.com'],
      ['aws cloudwatch put-metric-alarm --alarm-name billing-alert-500 --metric-name EstimatedCharges --namespace AWS/Billing --statistic Maximum --period 86400 --threshold 500 --comparison-operator GreaterThanOrEqualToThreshold --evaluation-periods 1 --alarm-actions arn:aws:sns:us-east-1:account:billing-alerts'],
      ['aws budgets create-budget --account-id $(aws sts get-caller-identity --query Account --output text) --budget file://budget.json'],
    ],
  },
  30: {
    answers: [
      ['aws securityhub enable-security-hub --tags "Environment=Production"'],
      ['aws securityhub get-findings --filters "SeverityLabel={Value=CRITICAL,Comparison=EQUALS}"'],
      ['aws securityhub get-insights --names "CIS AWS Foundations Benchmark v1.2.0"'],
      ['aws securityhub batch-update-findings --findings-update-records "RecordState=RESOLVED,FindingIdentifiers={Id=arn:aws:securityhub:region:account:product/guardduty/finding-id}"'],
    ],
  },
};

export const RES_ANSWERS: ScenarioAnswers = {
  1: {
    answers: [
      ['aws ec2 describe-instances --instance-ids i-xxxxx --query "Reservations[0].Instances[0].InstanceType"'],
      ['aws ec2 modify-instance-attribute --instance-id i-xxxxx --instance-type "{value: t3.large}"'],
      ['aws ec2 describe-instances --instance-ids i-xxxxx --query "Reservations[0].Instances[0].InstanceType"'],
    ],
  },
  2: {
    answers: [
      ['aws autoscaling create-auto-scaling-group --auto-scaling-group-name asg-web --launch-template LaunchTemplateName=web-template --min-size 2 --max-size 6 --desired-capacity 3'],
      ['aws autoscaling set-desired-capacity --auto-scaling-group-name asg-web --desired-capacity 5'],
      ['aws autoscaling describe-auto-scaling-groups --auto-scaling-group-names asg-web'],
    ],
  },
  3: {
    answers: [
      ['aws rds create-db-instance --db-instance-identifier prod-db --db-instance-class db.t3.medium --engine mysql'],
      ['aws rds modify-db-instance --db-instance-identifier prod-db --allocated-storage 200 --apply-immediately'],
      ['aws rds describe-db-instances --db-instance-identifier prod-db'],
    ],
  },
  4: {
    answers: [
      ['aws elasticache create-cache-cluster --cache-cluster-id cache-cluster --cache-node-type cache.t3.micro --engine redis --num-cache-nodes 1'],
      ['aws elasticache create-cache-parameter-group --cache-parameter-group-name custom-params --cache-parameter-group-family redis6.x'],
      ['aws elasticache modify-cache-cluster --cache-cluster-id cache-cluster --cache-parameter-group-name custom-params --apply-immediately'],
    ],
  },
  5: { answers: [['aws rds create-db-instance --db-instance-identifier read-replica --db-instance-class db.t3.small --source-db-identifier prod-db --auto-minor-version-upgrade false'], ['aws rds promote-read-replica --db-instance-identifier read-replica'], ['aws rds describe-db-instances --db-instance-identifier read-replica']] },
  6: { answers: [['aws ec2 create-load-balancer --name app-lb --subnets subnet-xxxxx subnet-yyyyy --scheme internet-facing'], ['aws ec2 register-instances-with-load-balancer --load-balancer-name app-lb --instances i-xxxxx i-yyyyy'], ['aws ec2 describe-load-balancers --load-balancer-names app-lb']] },
  7: { answers: [['aws elasticloadbalancingv2 create-target-group --name app-targets --protocol HTTP --port 80 --vpc-id vpc-xxxxx'], ['aws elasticloadbalancingv2 register-targets --target-group-arn arn:aws:elasticloadbalancing:region:account:targetgroup/app-targets/xxx --targets Id=i-xxxxx Id=i-yyyyy'], ['aws elasticloadbalancingv2 describe-target-groups --names app-targets']] },
  8: { answers: [['aws autoscaling create-launch-configuration --launch-configuration-name lc-web --image-id ami-xxxxx --instance-type t3.micro --security-groups sg-xxxxx'], ['aws autoscaling create-auto-scaling-group --auto-scaling-group-name asg-web --launch-configuration-name lc-web --min-size 2 --max-size 10 --desired-capacity 3'], ['aws autoscaling describe-auto-scaling-groups --auto-scaling-group-names asg-web']] },
  9: { answers: [['aws ec2 create-snapshot --volume-id vol-xxxxx --description "Daily backup"'], ['aws ec2 describe-snapshots --owner-ids self --filters "Name=status,Values=completed"'], ['aws ec2 create-volume --snapshot-id snap-xxxxx --availability-zone az --size 100']] },
  10: { answers: [['aws efs create-file-system --performance-mode generalPurpose --throughput-mode bursting --tags Key=Name,Value=app-efs'], ['aws efs describe-file-systems'], ['aws ec2 create-mount-target --file-system-id fs-xxxxx --subnet-id subnet-xxxxx --security-groups sg-xxxxx']] },
  11: { answers: [['aws ec2 create-network-interface --subnet-id subnet-xxxxx --private-ip-address 10.0.1.100'], ['aws ec2 allocate-address --domain vpc'], ['aws ec2 associate-address --instance-id i-xxxxx --allocation-id eipalloc-xxxxx']] },
  12: { answers: [['aws rds create-db-subnet-group --db-subnet-group-name prod-subnet-group --db-subnet-group-description "Production subnets" --subnet-ids subnet-xxxxx subnet-yyyyy'], ['aws rds create-db-instance --db-instance-identifier prod-db --db-subnet-group-name prod-subnet-group --db-instance-class db.t3.small'], ['aws rds describe-db-instances --db-instance-identifier prod-db']] },
  13: { answers: [['aws ec2 describe-instances --filters "Name=instance-state-name,Values=running" --query "Reservations[*].Instances[*].{ID:InstanceId,Type:InstanceType,CPU:CpuOptions}"'], ['aws ec2 describe-reserved-instances'], ['aws ec2 purchase-reserved-instances-offering --reserved-instances-offering-id xxxxx --instance-count 1']] },
  14: { answers: [['aws ec2 describe-spot-price-history --instance-types m5.large --product-descriptions "Linux/UNIX"'], ['aws ec2 request-spot-instances --spot-price "0.05" --instance-count 1 --type "one-time" --launch-specification file://spec.json'], ['aws ec2 describe-spot-instance-requests']] },
  15: { answers: [['aws ec2 create-network-acl --vpc-id vpc-xxxxx'], ['aws ec2 create-network-acl-entry --network-acl-id acl-xxxxx --rule-number 100 --protocol tcp --port-range From=443,To=443 --cidr 0.0.0.0/0 --rule-action allow'], ['aws ec2 associate-network-acl --network-acl-id acl-xxxxx --subnet-id subnet-xxxxx']] },
  16: { answers: [['aws rds modify-db-instance --db-instance-identifier prod-db --enable-iam-database-authentication --apply-immediately'], ['aws rds describe-db-instances --db-instance-identifier prod-db --query "DBInstances[0].IAMDatabaseAuthenticationEnabled"'], ['aws iam create-policy --policy-name rds-iam-auth --policy-document file://rds-policy.json']] },
  17: { answers: [['aws ec2 create-vpc --cidr-block 10.0.0.0/16'], ['aws ec2 create-subnet --vpc-id vpc-xxxxx --cidr-block 10.0.1.0/24 --availability-zone az-a'], ['aws ec2 create-internet-gateway'], ['aws ec2 attach-internet-gateway --internet-gateway-id igw-xxxxx --vpc-id vpc-xxxxx']] },
  18: { answers: [['aws elasticloadbalancingv2 create-load-balancer --name app-nlb --type network --subnets subnet-xxxxx subnet-yyyyy'], ['aws elasticloadbalancingv2 create-target-group --name nlb-targets --protocol TCP --port 443 --vpc-id vpc-xxxxx'], ['aws elasticloadbalancingv2 register-targets --target-group-arn arn:xxx --targets Id=i-xxxxx']] },
  19: { answers: [['aws rds enable-iam-database-authentication --db-instance-identifier prod-db'], ['aws rds modify-db-instance --db-instance-identifier prod-db --apply-immediately'], ['aws rds describe-db-instances --db-instance-identifier prod-db']] },
  20: { answers: [['aws ec2 modify-instance-attribute --instance-id i-xxxxx --sriov-net-filter simple'], ['aws ec2 modify-instance-attribute --instance-id i-xxxxx --enaSupport'], ['aws ec2 describe-instances --instance-ids i-xxxxx']] },
  21: { answers: [['aws rds create-db-cluster --db-cluster-identifier aurora-cluster --engine aurora-mysql --master-username admin --master-user-password xxx'], ['aws rds create-db-instance --db-instance-class db.t3.small --db-instance-identifier aurora-instance-1 --db-cluster-identifier aurora-cluster --engine aurora-mysql'], ['aws rds describe-db-clusters --db-cluster-identifier aurora-cluster']] },
  22: { answers: [['aws autoscaling create-auto-scaling-group --auto-scaling-group-name asg-spot --launch-template LaunchTemplateName=template --min-size 1 --max-size 10 --mixed-instances-policy file://policy.json'], ['aws autoscaling describe-auto-scaling-groups --auto-scaling-group-names asg-spot'], ['aws autoscaling set-desired-capacity --auto-scaling-group-name asg-spot --desired-capacity 5']] },
  23: { answers: [['aws ec2 create-key-pair --key-name prod-key'], ['aws ec2 import-key-pair --key-name imported-key --public-key-material fileb://id_rsa.pub'], ['aws ec2 describe-key-pairs']] },
  24: { answers: [['aws ec2 allocate-address --domain vpc --tag-specifications "ResourceType=elastic-ip,Tags=[{Key=Name,Value=app-eip}]"'], ['aws ec2 associate-address --instance-id i-xxxxx --allocation-id eipalloc-xxxxx'], ['aws ec2 describe-addresses --allocation-ids eipalloc-xxxxx']] },
  25: { answers: [['aws ec2 create-image --instance-id i-xxxxx --name app-ami-$(date +%Y%m%d) --description "Application AMI"'], ['aws ec2 describe-images --owner-ids self --filters "Name=name,Values=app-ami*"'], ['aws ec2 run-instances --image-id ami-xxxxx --instance-type t3.micro --count 1']] },
  26: { answers: [['aws rds add-tags-to-resource --resource-name arn:aws:rds:region:account:db:prod-db --tags Key=Environment,Value=Production Key=Team,Value=DataEng'], ['aws rds list-tags-for-resource --resource-name arn:aws:rds:region:account:db:prod-db'], ['aws rds remove-tags-from-resource --resource-name arn:aws:rds:region:account:db:prod-db --tag-keys OldTag']] },
  27: { answers: [['aws ec2 create-security-group --group-name app-sg --description "Application SG" --vpc-id vpc-xxxxx'], ['aws ec2 authorize-security-group-ingress --group-id sg-xxxxx --protocol tcp --port 443 --cidr 0.0.0.0/0'], ['aws ec2 describe-security-groups --group-ids sg-xxxxx']] },
  28: { answers: [['aws rds create-option-group --option-group-name prod-og --engine-name mysql --major-engine-version 8.0 --option-group-description "Production"'], ['aws rds modify-db-instance --db-instance-identifier prod-db --option-group-name prod-og --apply-immediately'], ['aws rds describe-option-groups --option-group-name prod-og']] },
  29: { answers: [['aws autoscaling put-scaling-policy --auto-scaling-group-name asg-web --policy-name scale-up --policy-type TargetTrackingScaling --target-tracking-configuration file://target-tracking.json'], ['aws autoscaling describe-policies --auto-scaling-group-name asg-web'], ['aws autoscaling put-notification-configuration --auto-scaling-group-name asg-web --topic-arn arn:aws:sns:region:account:topic']] },
  30: { answers: [['aws ec2 describe-instances --query "Reservations[*].Instances[*].{ID:InstanceId,State:State.Name,Type:InstanceType}"'], ['aws rds describe-db-instances --query "DBInstances[*].{ID:DBInstanceIdentifier,Engine:Engine,Size:DBInstanceClass}"'], ['aws elasticache describe-cache-clusters --query "CacheClusters[*].{ID:CacheClusterId,Engine:Engine,NodeType:CacheNodeType}"']] },
};

export const PERF_ANSWERS: ScenarioAnswers = {
  1: {
    answers: [
      ['aws elasticache create-cache-cluster --cache-cluster-id redis-cache --cache-node-type cache.r6g.large --engine redis --num-cache-nodes 1'],
      ['aws cloudwatch get-metric-statistics --namespace AWS/ElastiCache --metric-name CacheHits --dimensions Name=CacheClusterId,Value=redis-cache'],
      ['aws elasticache describe-cache-clusters --cache-cluster-id redis-cache'],
    ],
  },
  2: {
    answers: [
      ['aws cloudfront create-distribution --distribution-config file://distribution-config.json'],
      ['aws cloudfront create-cache-policy --cache-policy-config TTL=86400'],
      ['aws cloudfront get-distribution --id distribution-id'],
    ],
  },
  3: { answers: [['aws rds modify-db-instance --db-instance-identifier prod-db --storage-type gp3 --allocated-storage 500 --apply-immediately'], ['aws rds describe-db-instances --db-instance-identifier prod-db --query "DBInstances[0].{StorageType:StorageType,Size:AllocatedStorage}"'], ['aws cloudwatch get-metric-statistics --namespace AWS/RDS --metric-name DatabaseConnections']] },
  4: { answers: [['aws lambda update-function-configuration --function-name processor --timeout 300 --memory-size 3008 --ephemeral-storage Size=10240'], ['aws lambda create-function-url-config --function-name processor --cors file://cors.json'], ['aws lambda get-function-url-config --function-name processor']] },
  5: { answers: [['aws s3 sync s3://source-bucket s3://dest-bucket --region region --sse AES256'], ['aws s3api head-bucket --bucket dest-bucket'], ['aws s3 ls s3://dest-bucket --recursive']] },
  6: { answers: [['aws ec2 modify-instance-attribute --instance-id i-xxxxx --enaSupport'], ['aws ec2 modify-instance-attribute --instance-id i-xxxxx --sriov-net-filter simple'], ['aws ec2 describe-instances --instance-ids i-xxxxx']] },
  7: { answers: [['aws elasticloadbalancingv2 create-load-balancer --name perf-alb --type application --scheme internet-facing --subnets subnet-xxxxx'], ['aws elasticloadbalancingv2 create-target-group --name targets --protocol HTTP --port 80 --vpc-id vpc-xxxxx --health-check-enabled'], ['aws elasticloadbalancingv2 describe-load-balancers --names perf-alb']] },
  8: { answers: [['aws cloudwatch put-metric-alarm --alarm-name cpu-high --metric-name CPUUtilization --namespace AWS/EC2 --statistic Average --period 300 --threshold 80'], ['aws autoscaling put-scaling-policy --auto-scaling-group-name asg-web --policy-name scale-up --adjustment-type PercentChangeInCapacity --adjustment-value 50'], ['aws autoscaling describe-policies --auto-scaling-group-name asg-web']] },
  9: { answers: [['aws ec2 create-launch-template --launch-template-name perf-template --version-description "Optimized" --launch-template-data file://template-data.json'], ['aws ec2 describe-launch-templates --launch-template-names perf-template'], ['aws ec2 describe-launch-template-versions --launch-template-name perf-template']] },
  10: { answers: [['aws rds create-read-replica --db-instance-identifier read-replica --source-db-instance-identifier prod-db --db-instance-class db.r6i.xlarge'], ['aws rds promote-read-replica --db-instance-identifier read-replica'], ['aws rds describe-db-instances --db-instance-identifier read-replica']] },
  11: { answers: [['aws elasticache create-cache-cluster --cache-cluster-id memcached-cache --engine memcached --cache-node-type cache.r6g.xlarge --num-cache-nodes 3'], ['aws elasticache describe-cache-clusters --cache-cluster-id memcached-cache'], ['aws cloudwatch get-metric-statistics --namespace AWS/ElastiCache --metric-name CPU']] },
  12: { answers: [['aws cloudfront create-origin-request-policy --origin-request-policy-config file://policy.json'], ['aws cloudfront update-distribution --distribution-config file://distribution.json --id distid'], ['aws cloudfront get-distribution-config --id distid']] },
  13: { answers: [['aws rds create-db-parameter-group --db-parameter-group-name prod-params --db-parameter-group-family mysql8.0 --description "Optimized"'], ['aws rds modify-db-instance --db-instance-identifier prod-db --db-parameter-group-name prod-params --apply-immediately'], ['aws rds describe-db-parameters --db-parameter-group-name prod-params']] },
  14: { answers: [['aws lambda update-function-configuration --function-name processor --reserved-concurrent-executions 100'], ['aws lambda put-function-concurrency --function-name processor --reserved-concurrent-executions 100'], ['aws lambda get-function-concurrency --function-name processor']] },
  15: { answers: [['aws s3api put-bucket-accelerate-configuration --bucket app-bucket --accelerate-configuration Status=Enabled'], ['aws s3api get-bucket-accelerate-configuration --bucket app-bucket'], ['aws s3 sync /local/path s3://app-bucket --region region']] },
  16: { answers: [['aws ec2 describe-instances --filters "Name=instance-state-name,Values=running" --query "Reservations[*].Instances[*].InstanceType"'], ['aws ec2 modify-instance-attribute --instance-id i-xxxxx --instance-type t3.xlarge'], ['aws ec2 reboot-instances --instance-ids i-xxxxx']] },
  17: { answers: [['aws cloudwatch describe-metric-statistics --namespace AWS/RDS --metric-name ReadLatency --start-time 2024-01-01T00:00:00Z --end-time 2024-01-02T00:00:00Z --period 300 --statistics Average'], ['aws cloudwatch list-metrics --namespace AWS/RDS --metric-name DiskQueueDepth'], ['aws rds describe-db-instances --query "DBInstances[*].DBInstanceIdentifier"']] },
  18: { answers: [['aws elasticloadbalancingv2 create-load-balancer --name perf-nlb --type network --scheme internet-facing --subnets subnet-xxxxx'], ['aws elasticloadbalancingv2 create-target-group --name nlb-targets --protocol TCP --port 443 --vpc-id vpc-xxxxx'], ['aws elasticloadbalancingv2 describe-load-balancers --names perf-nlb']] },
  19: { answers: [['aws ec2 create-placement-group --group-name perf-pg --strategy cluster'], ['aws ec2 run-instances --image-id ami-xxxxx --instance-type c6i.xlarge --placement GroupName=perf-pg --count 2'], ['aws ec2 describe-placement-groups --group-names perf-pg']] },
  20: { answers: [['aws rds modify-db-instance --db-instance-identifier prod-db --enable-performance-insights --apply-immediately'], ['aws pi describe-dimension-keys --service-type RDS --identifier db-resource-id --start-time 2024-01-01T00:00:00Z --period-in-seconds 60 --partition-by "{"Group":"USER"}"'], ['aws pi get-resource-metrics --service-type RDS --identifier db-id']] },
  21: { answers: [['aws autoscaling create-auto-scaling-group --auto-scaling-group-name asg-mixed --launch-template LaunchTemplateName=template --mixed-instances-policy file://policy.json --min-size 2 --max-size 10'], ['aws autoscaling set-desired-capacity --auto-scaling-group-name asg-mixed --desired-capacity 5'], ['aws autoscaling describe-auto-scaling-groups --auto-scaling-group-names asg-mixed']] },
  22: { answers: [['aws cloudwatch put-metric-alarm --alarm-name network-in-high --metric-name NetworkIn --namespace AWS/EC2 --statistic Sum --period 300 --threshold 1000000'], ['aws autoscaling attach-load-balancer-target-groups --auto-scaling-group-name asg-web --target-group-arns arn:aws:elasticloadbalancing:region:account:targetgroup/name'], ['aws elasticloadbalancingv2 describe-target-health --target-group-arn arn:xxx']] },
  23: { answers: [['aws lambda update-alias --function-name processor --name live --routing-config AdditionalVersionWeight=0.05,FunctionVersion=$LATEST'], ['aws lambda update-alias --function-name processor --name live --routing-config AdditionalVersionWeight=0'], ['aws lambda get-alias --function-name processor --name live']] },
  24: { answers: [['aws ec2 create-vpc-endpoint --vpc-id vpc-xxxxx --service-name com.amazonaws.region.s3 --route-table-ids rtb-xxxxx'], ['aws ec2 describe-vpc-endpoints --filters "Name=vpc-id,Values=vpc-xxxxx"'], ['aws s3 ls s3://bucket-name --region region']] },
  25: { answers: [['aws rds create-db-subnet-group --db-subnet-group-name prod-subnet --subnet-ids subnet-xxxxx subnet-yyyyy --db-subnet-group-description "Multi-AZ"'], ['aws rds modify-db-instance --db-instance-identifier prod-db --multi-az --apply-immediately'], ['aws rds describe-db-instances --db-instance-identifier prod-db']] },
  26: { answers: [['aws cloudfront create-function --name edge-function --auto-publish-alias LIVE --function-code file://index.js'], ['aws cloudfront publish-function --name edge-function'], ['aws cloudfront describe-function --name edge-function']] },
  27: { answers: [['aws rds create-aurora-cluster --db-cluster-identifier aurora-global --engine aurora-mysql --global-write-forwarding-enabled'], ['aws rds add-aurora-global-database --global-database-identifier global-db --aurora-database aurora-cluster'], ['aws rds describe-global-databases --global-database-identifier global-db']] },
  28: { answers: [['aws ec2 create-image --instance-id i-xxxxx --name perf-ami --no-reboot'], ['aws ec2 describe-images --owner-ids self --filters "Name=name,Values=perf-ami"'], ['aws ec2 run-instances --image-id ami-xxxxx --instance-type c6i.xlarge --count 1']] },
  29: { answers: [['aws cloudwatch get-metric-statistics --namespace AWS/Lambda --metric-name Duration --dimensions Name=FunctionName,Value=processor --start-time 2024-01-01T00:00:00Z --end-time 2024-01-02T00:00:00Z'], ['aws lambda list-functions'], ['aws lambda get-function-concurrency --function-name processor']] },
  30: { answers: [['aws ec2 describe-instances --query "Reservations[*].Instances[*].{InstanceType:InstanceType,State:State.Name}"'], ['aws rds describe-db-instances --query "DBInstances[*].{DBInstanceClass:DBInstanceClass,Engine:Engine}"'], ['aws elasticache describe-cache-clusters --query "CacheClusters[*].{NodeType:CacheNodeType,Nodes:NumCacheNodes}"']] },
};

export const COST_ANSWERS: ScenarioAnswers = {
  1: {
    answers: [
      ['aws budgets create-budget --account-id $(aws sts get-caller-identity --query Account --output text) --budget file://budget.json'],
      ['aws budgets create-notification --account-id $(aws sts get-caller-identity --query Account --output text) --budget-name monthly-budget --notification file://notification.json'],
      ['aws budgets describe-budgets --account-id $(aws sts get-caller-identity --query Account --output text)'],
    ],
  },
  2: {
    answers: [
      ['aws ce get-cost-and-usage --time-period Start=2024-01-01,End=2024-01-31 --granularity MONTHLY --metrics "UnblendedCost"'],
      ['aws savingsplans describe-savings-plans-offerings --max-results 10'],
      ['aws savingsplans create-savings-plan --offering-id sp-xxxxx --commitment-amount 500'],
    ],
  },
  3: { answers: [['aws ec2 describe-instances --filters "Name=instance-state-name,Values=stopped" --query "Reservations[*].Instances[*].InstanceId"'], ['aws ec2 terminate-instances --instance-ids i-xxxxx i-yyyyy'], ['aws ec2 describe-reserved-instances --filters "Name=state,Values=retired"']] },
  4: { answers: [['aws ce get-cost-and-usage --time-period Start=2024-01-01,End=2024-01-31 --granularity DAILY --metrics "UnblendedCost" --group-by Type=SERVICE'], ['aws ce get-cost-forecast --time-period Start=2024-02-01,End=2024-02-28 --metric UNBLENDED_COST --granularity MONTHLY --filter file://filter.json'], ['aws ce describe-cost-category-definitions']] },
  5: { answers: [['aws ce get-cost-and-usage --time-period Start=2024-01-01,End=2024-01-31 --metrics UnblendedCost --group-by Type=LINKED_ACCOUNT'], ['aws organizations list-accounts'], ['aws ce get-dimension-values --time-period Start=2024-01-01,End=2024-01-31 --dimension LINKED_ACCOUNT']] },
  6: { answers: [['aws rds describe-reserved-db-instances'], ['aws ec2 describe-reserved-instances'], ['aws elasticache describe-reserved-cache-nodes']] },
  7: { answers: [['aws ce get-cost-and-usage --time-period Start=2024-01-01,End=2024-01-31 --metrics BlendedCost --group-by Type=USAGE_TYPE'], ['aws ce get-reservation-utilization --time-period Start=2024-01-01,End=2024-01-31 --granularity MONTHLY'], ['aws ce get-reservation-purchase-recommendation --service "Amazon EC2" --lookback-period THIRTY_DAYS']] },
  8: { answers: [['aws ce list-cost-allocation-tags --status Untagged'], ['aws ec2 describe-instances --query "Reservations[*].Instances[*].{ID:InstanceId,Tags:Tags}"'], ['aws ec2 create-tags --resources i-xxxxx --tags Key=CostCenter,Value=Engineering']] },
  9: { answers: [['aws ce get-cost-and-usage --time-period Start=2024-01-01,End=2024-01-31 --metrics AmortizedCost --filter file://filter.json'], ['aws ce get-cost-and-usage --time-period Start=2024-01-01,End=2024-01-31 --metrics NetUnblendedCost'], ['aws savingsplans describe-savings-plans']] },
  10: { answers: [['aws elasticloadbalancingv2 describe-load-balancers'], ['aws cloudwatch describe-alarms --alarm-names "load-balancer-alarm"'], ['aws ec2 describe-instances --query "Reservations[*].Instances[*].NetworkInterfaces[0].PrivateIpAddresses[0]"']] },
  11: { answers: [['aws s3 list-buckets --query "Buckets[*].Name"'], ['aws s3 list-object-versions --bucket bucket-name --query "Versions[?StorageClass==`GLACIER`]"'], ['aws s3api get-bucket-lifecycle-configuration --bucket bucket-name']] },
  12: { answers: [['aws ce get-cost-and-usage --time-period Start=2024-01-01,End=2024-01-31 --metrics UnblendedCost --group-by Type=PURCHASE_TYPE'], ['aws ce describe-cost-category-definitions'], ['aws budgets describe-budgets --account-id account-id']] },
  13: { answers: [['aws elasticcache describe-cache-clusters --query "CacheClusters[?Nodes != `null`]"'], ['aws elasticache modify-cache-cluster --cache-cluster-id cluster-id --num-cache-nodes 2'], ['aws elasticache delete-cache-cluster --cache-cluster-id cluster-id']] },
  14: { answers: [['aws rds describe-db-instances --query "DBInstances[*].{ID:DBInstanceIdentifier,Class:DBInstanceClass}"'], ['aws rds modify-db-instance --db-instance-identifier db-id --db-instance-class db.t3.small --apply-immediately'], ['aws rds describe-db-instances --db-instance-identifier db-id']] },
  15: { answers: [['aws lambda list-functions'], ['aws lambda get-function-configuration --function-name function-id'], ['aws lambda update-function-configuration --function-name function-id --memory-size 512']] },
  16: { answers: [['aws ce get-cost-and-usage --time-period Start=2024-01-01,End=2024-01-31 --metrics UnblendedCost --filter file://on-demand-filter.json'], ['aws ce get-reservation-purchase-recommendation --service "Amazon EC2" --lookback-period THIRTY_DAYS'], ['aws ec2 purchase-reserved-instances-offering --reserved-instances-offering-id ri-offering-id']] },
  17: { answers: [['aws autoscaling describe-auto-scaling-groups'], ['aws autoscaling set-desired-capacity --auto-scaling-group-name asg-name --desired-capacity 0'], ['aws autoscaling describe-auto-scaling-groups --auto-scaling-group-names asg-name']] },
  18: { answers: [['aws s3 list-buckets'], ['aws s3api get-bucket-encryption --bucket bucket-name'], ['aws s3api list-objects-v2 --bucket bucket-name --query "Contents[*].[Key,Size]"']] },
  19: { answers: [['aws ce get-cost-and-usage --time-period Start=2024-01-01,End=2024-01-31 --metrics UnblendedCost --group-by Type=REGION'], ['aws ce get-dimension-values --time-period Start=2024-01-01,End=2024-01-31 --dimension REGION'], ['aws ec2 describe-regions']] },
  20: { answers: [['aws ce get-cost-anomaly-detectors'], ['aws ce create-cost-anomaly-detector --anomaly-detector file://anomaly-detector.json'], ['aws ce get-anomaly-subscriptions']] },
  21: { answers: [['aws ec2 describe-spot-price-history --instance-types m5.large --product-descriptions "Linux/UNIX"'], ['aws ec2 request-spot-instances --spot-price "0.05" --instance-count 1 --type "persistent"'], ['aws ec2 describe-spot-instance-requests']] },
  22: { answers: [['aws ce get-cost-and-usage --time-period Start=2024-01-01,End=2024-01-31 --metrics UnblendedCost'], ['aws ce get-cost-and-usage --time-period Start=2024-01-01,End=2024-01-31 --metrics BlendedCost'], ['aws ce get-cost-and-usage --time-period Start=2024-01-01,End=2024-01-31 --metrics NetUnblendedCost']] },
  23: { answers: [['aws lightsail get-instances'], ['aws lightsail get-bundles'], ['aws lightsail create-instances --instance-names instance-1 --availability-zone az --bundle-id bundle-id']] },
  24: { answers: [['aws organizations list-accounts'], ['aws organizations list-organizational-units-for-parent --parent-id root'], ['aws organizations create-organization']] },
  25: { answers: [['aws ce list-cost-allocation-tags --status Active'], ['aws ec2 describe-instances --query "Reservations[*].Instances[*].Tags"'], ['aws ce describe-cost-category-definitions']] },
  26: { answers: [['aws ce get-cost-and-usage --time-period Start=2024-01-01,End=2024-01-31 --metrics UnblendedCost --filter file://filter.json'], ['aws ce get-cost-and-usage --time-period Start=2024-01-01,End=2024-01-31 --group-by Type=SERVICE'], ['aws ce get-cost-forecast --time-period Start=2024-02-01,End=2024-02-28 --metric UNBLENDED_COST']] },
  27: { answers: [['aws autoscaling describe-auto-scaling-groups --auto-scaling-group-names asg-name'], ['aws autoscaling describe-scaling-activities --auto-scaling-group-name asg-name'], ['aws cloudwatch get-metric-statistics --namespace AWS/AutoScaling --metric-name GroupDesiredCapacity']] },
  28: { answers: [['aws s3api list-objects-v2 --bucket bucket-name --query "Contents[*].[Key,Size,LastModified]"'], ['aws s3api head-object --bucket bucket-name --key object-key'], ['aws s3api delete-object --bucket bucket-name --key object-key']] },
  29: { answers: [['aws ce get-cost-and-usage --time-period Start=2024-01-01,End=2024-01-31 --metrics UnblendedCost --granularity MONTHLY'], ['aws budgets create-budget --account-id account-id --budget file://budget.json'], ['aws budgets create-notification --account-id account-id --budget-name budget-name --notification file://notification.json']] },
  30: { answers: [['aws ce get-cost-and-usage --time-period Start=2024-01-01,End=2024-01-31 --metrics UnblendedCost'], ['aws ce get-cost-and-usage --time-period Start=2024-01-01,End=2024-01-31 --group-by Type=SERVICE --metrics UnblendedCost'], ['aws ce get-cost-forecast --time-period Start=2024-02-01,End=2024-02-28 --metric UNBLENDED_COST --granularity MONTHLY']] },
};

// Helper function to check if an answer is correct
export const isAnswerCorrect = (userInput: string, validAnswers: string[]): boolean => {
  const normalizedUser = userInput.trim().toLowerCase();
  return validAnswers.some(answer =>
    normalizedUser === answer.trim().toLowerCase() ||
    // Allow flexible whitespace and quotes
    normalizedUser.replace(/\s+/g, ' ').replace(/["']/g, '') ===
    answer.trim().toLowerCase().replace(/\s+/g, ' ').replace(/["']/g, '')
  );
};
