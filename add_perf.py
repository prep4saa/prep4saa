# -*- coding: utf-8 -*-
"""Adds PERF challenges 1-10 to CHALLENGE_SCENARIOS."""

PERF_BLOCK = r"""const PERF_CHALLENGES: Record<number, ChalScenario> = {
  1: {
    id: 'PERF-01', title: 'PERF-01 ElastiCache Redis 캐싱 설정',
    scenario: 'RDS에 직접 쿼리하는 API가 응답 시간이 500ms를 넘습니다. 자주 조회되는 데이터를 ElastiCache Redis에 캐싱해 응답 시간을 10ms 이하로 줄이세요.',
    steps: [
      { title: 'ElastiCache 서브넷 그룹 생성', desc: 'ElastiCache 클러스터를 배치할 서브넷 그룹을 생성하세요.',
        hint: 'aws elasticache create-cache-subnet-group --cache-subnet-group-name redis-subnet-group --cache-subnet-group-description "Redis subnet group" --subnet-ids subnet-0abc123 subnet-0def456',
        answers: ['aws elasticache create-cache-subnet-group --cache-subnet-group-name redis-subnet-group --cache-subnet-group-description "redis subnet group" --subnet-ids subnet-0abc123 subnet-0def456'],
        successOutput: ['{"CacheSubnetGroup": {"CacheSubnetGroupName": "redis-subnet-group", "VpcId": "vpc-0abc123def456789", "Subnets": [{"SubnetIdentifier": "subnet-0abc123"}, {"SubnetIdentifier": "subnet-0def456"}]}}'] },
      { title: 'Redis 클러스터 생성', desc: 'cache.r6g.large 타입으로 Redis 6.x 클러스터를 생성하세요.',
        hint: 'aws elasticache create-cache-cluster --cache-cluster-id api-cache --cache-node-type cache.r6g.large --engine redis --engine-version 6.2.6 --num-cache-nodes 1 --cache-subnet-group-name redis-subnet-group --security-group-ids sg-0abc123def456789',
        answers: ['aws elasticache create-cache-cluster --cache-cluster-id api-cache --cache-node-type cache.r6g.large --engine redis --engine-version 6.2.6 --num-cache-nodes 1 --cache-subnet-group-name redis-subnet-group --security-group-ids sg-0abc123def456789'],
        successOutput: ['{"CacheCluster": {"CacheClusterId": "api-cache", "CacheClusterStatus": "creating", "CacheNodeType": "cache.r6g.large", "Engine": "redis", "EngineVersion": "6.2.6", "NumCacheNodes": 1}}'] },
      { title: '클러스터 엔드포인트 확인', desc: '애플리케이션에서 사용할 Redis 엔드포인트를 확인하세요.',
        hint: 'aws elasticache describe-cache-clusters --cache-cluster-id api-cache --show-cache-node-info',
        answers: ['aws elasticache describe-cache-clusters --cache-cluster-id api-cache --show-cache-node-info'],
        successOutput: ['{"CacheClusters": [{"CacheClusterId": "api-cache", "CacheClusterStatus": "available", "CacheNodes": [{"CacheNodeId": "0001", "CacheNodeStatus": "available", "Endpoint": {"Address": "api-cache.abc123.0001.use1.cache.amazonaws.com", "Port": 6379}}]}]}'] },
      { title: 'CloudWatch 캐시 히트율 확인', desc: 'ElastiCache의 CacheHits / CacheMisses 메트릭을 조회해 캐싱 효율을 확인하세요.',
        hint: 'aws cloudwatch get-metric-statistics --namespace AWS/ElastiCache --metric-name CacheHits --dimensions Name=CacheClusterId,Value=api-cache --start-time 2024-01-01T00:00:00Z --end-time 2024-01-01T01:00:00Z --period 300 --statistics Sum',
        answers: ['aws cloudwatch get-metric-statistics --namespace aws/elasticache --metric-name cachehits --dimensions name=cacheclusterid,value=api-cache --start-time 2024-01-01t00:00:00z --end-time 2024-01-01t01:00:00z --period 300 --statistics sum'],
        successOutput: ['{"Datapoints": [{"Timestamp": "2024-01-01T00:05:00Z", "Sum": 8420.0, "Unit": "Count"}, {"Timestamp": "2024-01-01T00:10:00Z", "Sum": 9150.0, "Unit": "Count"}], "Label": "CacheHits"}'] },
    ],
    explanation: 'ElastiCache Redis는 인메모리 캐시로 RDS 부하를 줄이고 응답 시간을 대폭 단축합니다. CacheHits/CacheMisses 비율로 캐시 효율을 모니터링하세요. cache.r6g 계열은 Graviton2 기반으로 비용 대비 성능이 뛰어납니다.',
  },
  2: {
    id: 'PERF-02', title: 'PERF-02 CloudFront 배포 및 TTL 최적화',
    scenario: '정적 파일(이미지, JS, CSS)을 S3에서 직접 서빙하고 있어 전 세계 사용자 응답이 느립니다. CloudFront를 앞에 배치하고 TTL을 최적화해 엣지 캐싱을 활용하세요.',
    steps: [
      { title: 'Origin Access Control 생성', desc: 'S3 버킷을 CloudFront에서만 접근할 수 있도록 OAC를 생성하세요.',
        hint: 'aws cloudfront create-origin-access-control --origin-access-control-config Name=s3-oac,Description="OAC for S3",SigningProtocol=sigv4,SigningBehavior=always,OriginAccessControlOriginType=s3',
        answers: ['aws cloudfront create-origin-access-control --origin-access-control-config name=s3-oac,description="oac for s3",signingprotocol=sigv4,signingbehavior=always,originaccesscontrolorigintype=s3'],
        successOutput: ['{"OriginAccessControl": {"Id": "EABCDEF123456", "OriginAccessControlConfig": {"Name": "s3-oac", "SigningProtocol": "sigv4", "SigningBehavior": "always", "OriginAccessControlOriginType": "s3"}}}'] },
      { title: 'CloudFront 배포 생성', desc: 'S3 버킷을 오리진으로 하는 CloudFront 배포를 생성하세요.',
        hint: 'aws cloudfront create-distribution --distribution-config file://cf-config.json',
        answers: ['aws cloudfront create-distribution --distribution-config file://cf-config.json'],
        successOutput: ['{"Distribution": {"Id": "E2QWRTZXMP65OJ", "DomainName": "d1abc123def456.cloudfront.net", "Status": "InProgress", "DistributionConfig": {"Origins": {"Items": [{"DomainName": "my-static-bucket.s3.amazonaws.com"}]}, "DefaultCacheBehavior": {"ViewerProtocolPolicy": "redirect-to-https"}}}}'] },
      { title: '캐시 정책 생성 (장기 TTL)', desc: '정적 자산에 24시간(86400초) TTL 캐시 정책을 생성하세요.',
        hint: 'aws cloudfront create-cache-policy --cache-policy-config Name=static-assets-policy,DefaultTTL=86400,MaxTTL=31536000,MinTTL=3600,ParametersInCacheKeyAndForwardedToOrigin={EnableAcceptEncodingGzip=true,HeadersConfig={HeaderBehavior=none},CookiesConfig={CookieBehavior=none},QueryStringsConfig={QueryStringBehavior=none}}',
        answers: ['aws cloudfront create-cache-policy --cache-policy-config name=static-assets-policy,defaultttl=86400,maxttl=31536000,minttl=3600,parametersincachekeyandforwardedtoorigin={enableacceptencodinggzip=true,headersconfig={headerbehavior=none},cookiesconfig={cookiebehavior=none},querystringsconfig={querystringbehavior=none}}'],
        successOutput: ['{"CachePolicy": {"Id": "abc123def-4567-890a-bcde-f0123456789a", "LastModifiedTime": "2024-01-01T00:00:00.000Z", "CachePolicyConfig": {"Name": "static-assets-policy", "DefaultTTL": 86400, "MaxTTL": 31536000}}}'] },
      { title: '배포 상태 확인', desc: 'CloudFront 배포가 배포 완료됐는지 확인하세요.',
        hint: 'aws cloudfront get-distribution --id E2QWRTZXMP65OJ --query "Distribution.Status"',
        answers: ['aws cloudfront get-distribution --id e2qwrtzxmp65oj --query "distribution.status"'],
        successOutput: ['"Deployed"'] },
      { title: '캐시 히트율 확인', desc: 'CloudFront CacheHitRate 메트릭으로 캐싱 효율을 확인하세요.',
        hint: 'aws cloudwatch get-metric-statistics --namespace AWS/CloudFront --metric-name CacheHitRate --dimensions Name=DistributionId,Value=E2QWRTZXMP65OJ Name=Region,Value=Global --start-time 2024-01-01T00:00:00Z --end-time 2024-01-01T01:00:00Z --period 300 --statistics Average',
        answers: ['aws cloudwatch get-metric-statistics --namespace aws/cloudfront --metric-name cachehitrate --dimensions name=distributionid,value=e2qwrtzxmp65oj name=region,value=global --start-time 2024-01-01t00:00:00z --end-time 2024-01-01t01:00:00z --period 300 --statistics average'],
        successOutput: ['{"Datapoints": [{"Timestamp": "2024-01-01T00:05:00Z", "Average": 94.5, "Unit": "Percent"}], "Label": "CacheHitRate"}'] },
    ],
    explanation: 'CloudFront는 전 세계 엣지 로케이션에서 정적 파일을 캐싱해 오리진 서버 부하를 줄이고 응답 시간을 단축합니다. 정적 자산은 긴 TTL(24시간+)을 설정하고 파일명에 해시를 포함시켜 캐시 무효화를 관리하세요.',
  },
  3: {
    id: 'PERF-03', title: 'PERF-03 RDS Read Replica 읽기 분산',
    scenario: '운영 RDS 인스턴스에 읽기 쿼리가 과부하를 유발합니다. Read Replica를 생성해 SELECT 쿼리를 분산하고 마스터 DB의 CPU를 낮추세요.',
    steps: [
      { title: '현재 RDS 인스턴스 확인', desc: '마스터 DB의 스펙과 현재 읽기 부하를 확인하세요.',
        hint: 'aws rds describe-db-instances --db-instance-identifier prod-mysql --query "DBInstances[0].{Class:DBInstanceClass,Storage:AllocatedStorage,MultiAZ:MultiAZ,ReadReplicaDBInstanceIdentifiers:ReadReplicaDBInstanceIdentifiers}"',
        answers: ['aws rds describe-db-instances --db-instance-identifier prod-mysql --query "dbinstances[0].{class:dbinstanceclass,storage:allocatedstorage,multiaz:multiaz,readreplicadbinstanceidentifiers:readreplicadbinstanceidentifiers}"'],
        successOutput: ['{"Class": "db.r5.large", "Storage": 100, "MultiAZ": true, "ReadReplicaDBInstanceIdentifiers": []}'] },
      { title: 'Read Replica 생성', desc: '같은 AZ에 읽기 전용 복제본을 생성하세요.',
        hint: 'aws rds create-db-instance-read-replica --db-instance-identifier prod-mysql-replica --source-db-instance-identifier prod-mysql --db-instance-class db.r5.large --publicly-accessible false',
        answers: ['aws rds create-db-instance-read-replica --db-instance-identifier prod-mysql-replica --source-db-instance-identifier prod-mysql --db-instance-class db.r5.large --publicly-accessible false'],
        successOutput: ['{"DBInstance": {"DBInstanceIdentifier": "prod-mysql-replica", "DBInstanceStatus": "creating", "DBInstanceClass": "db.r5.large", "ReadReplicaSourceDBInstanceIdentifier": "prod-mysql"}}'] },
      { title: 'Replica 상태 확인', desc: 'Read Replica가 available 상태가 됐는지 확인하세요.',
        hint: 'aws rds describe-db-instances --db-instance-identifier prod-mysql-replica --query "DBInstances[0].{Status:DBInstanceStatus,Endpoint:Endpoint.Address,ReplicationLag:StatusInfos}"',
        answers: ['aws rds describe-db-instances --db-instance-identifier prod-mysql-replica --query "dbinstances[0].{status:dbinstancestatus,endpoint:endpoint.address,replicationlag:statusinfos}"'],
        successOutput: ['{"Status": "available", "Endpoint": "prod-mysql-replica.abc123.us-east-1.rds.amazonaws.com", "ReplicationLag": [{"StatusType": "read replication", "Status": "replicating", "Message": "Replication lag: 0.00 seconds"}]}'] },
      { title: 'CloudWatch 복제 지연 모니터링', desc: 'ReplicaLag 메트릭으로 복제 지연을 모니터링하세요.',
        hint: 'aws cloudwatch get-metric-statistics --namespace AWS/RDS --metric-name ReplicaLag --dimensions Name=DBInstanceIdentifier,Value=prod-mysql-replica --start-time 2024-01-01T00:00:00Z --end-time 2024-01-01T01:00:00Z --period 60 --statistics Average',
        answers: ['aws cloudwatch get-metric-statistics --namespace aws/rds --metric-name replicalag --dimensions name=dbinstanceidentifier,value=prod-mysql-replica --start-time 2024-01-01t00:00:00z --end-time 2024-01-01t01:00:00z --period 60 --statistics average'],
        successOutput: ['{"Datapoints": [{"Timestamp": "2024-01-01T00:01:00Z", "Average": 0.12, "Unit": "Seconds"}], "Label": "ReplicaLag"}'] },
    ],
    explanation: 'RDS Read Replica는 마스터 DB의 읽기 부하를 분산합니다. 애플리케이션에서 SELECT는 Replica 엔드포인트, INSERT/UPDATE/DELETE는 마스터 엔드포인트로 라우팅하세요. ReplicaLag이 증가하면 Replica 스펙을 높이거나 쿼리를 최적화하세요.',
  },
  4: {
    id: 'PERF-04', title: 'PERF-04 DynamoDB DAX 클러스터 설정',
    scenario: 'DynamoDB 테이블 조회 응답이 단일 자릿수 ms이지만 고빈도 읽기로 RCU 비용이 급증합니다. DAX 클러스터를 앞에 두어 캐싱으로 응답 시간과 비용을 모두 줄이세요.',
    steps: [
      { title: 'DAX 서브넷 그룹 생성', desc: 'DAX 클러스터용 서브넷 그룹을 만드세요.',
        hint: 'aws dax create-subnet-group --subnet-group-name dax-subnet-group --description "DAX subnet group" --subnet-ids subnet-0abc123 subnet-0def456',
        answers: ['aws dax create-subnet-group --subnet-group-name dax-subnet-group --description "dax subnet group" --subnet-ids subnet-0abc123 subnet-0def456'],
        successOutput: ['{"SubnetGroup": {"SubnetGroupName": "dax-subnet-group", "VpcId": "vpc-0abc123def456789", "Subnets": [{"SubnetIdentifier": "subnet-0abc123", "SubnetAvailabilityZone": {"Name": "us-east-1a"}}, {"SubnetIdentifier": "subnet-0def456", "SubnetAvailabilityZone": {"Name": "us-east-1b"}}]}}'] },
      { title: 'DAX 클러스터 생성', desc: 'dax.r5.large 노드 3개로 DAX 클러스터를 생성하세요.',
        hint: 'aws dax create-cluster --cluster-name product-cache --node-type dax.r5.large --replication-factor 3 --iam-role-arn arn:aws:iam::123456789012:role/DAXRole --subnet-group-name dax-subnet-group --security-group-ids sg-0abc123def456789',
        answers: ['aws dax create-cluster --cluster-name product-cache --node-type dax.r5.large --replication-factor 3 --iam-role-arn arn:aws:iam::123456789012:role/daxrole --subnet-group-name dax-subnet-group --security-group-ids sg-0abc123def456789'],
        successOutput: ['{"Cluster": {"ClusterName": "product-cache", "Status": "creating", "NodeType": "dax.r5.large", "TotalNodes": 3, "ActiveNodes": 0, "ClusterEndpoint": {"URL": "daxs://product-cache.abc123.dax-clusters.us-east-1.amazonaws.com"}}}'] },
      { title: 'DAX 클러스터 상태 확인', desc: 'DAX 클러스터가 available 상태인지 확인하세요.',
        hint: 'aws dax describe-clusters --cluster-names product-cache --query "Clusters[0].{Status:Status,Endpoint:ClusterEndpoint.URL,ActiveNodes:ActiveNodes}"',
        answers: ['aws dax describe-clusters --cluster-names product-cache --query "clusters[0].{status:status,endpoint:clusterendpoint.url,activenodes:activenodes}"'],
        successOutput: ['{"Status": "available", "Endpoint": "daxs://product-cache.abc123.dax-clusters.us-east-1.amazonaws.com", "ActiveNodes": 3}'] },
      { title: 'DAX 캐시 히트율 확인', desc: 'DAX ItemCacheHits 메트릭으로 캐시 효율을 확인하세요.',
        hint: 'aws cloudwatch get-metric-statistics --namespace AWS/DAX --metric-name ItemCacheHits --dimensions Name=ClusterName,Value=product-cache --start-time 2024-01-01T00:00:00Z --end-time 2024-01-01T01:00:00Z --period 300 --statistics Sum',
        answers: ['aws cloudwatch get-metric-statistics --namespace aws/dax --metric-name itemcachehits --dimensions name=clustername,value=product-cache --start-time 2024-01-01t00:00:00z --end-time 2024-01-01t01:00:00z --period 300 --statistics sum'],
        successOutput: ['{"Datapoints": [{"Timestamp": "2024-01-01T00:05:00Z", "Sum": 45230.0, "Unit": "Count"}], "Label": "ItemCacheHits"}'] },
    ],
    explanation: 'DAX는 DynamoDB와 완전 호환되는 인메모리 캐시로 읽기 응답을 마이크로초 수준으로 단축합니다. DAX SDK로 교체하면 코드 변경이 최소화됩니다. 쓰기 작업은 DAX를 통해 DynamoDB에 직접 반영됩니다.',
  },
  5: {
    id: 'PERF-05', title: 'PERF-05 Lambda 메모리 최적화',
    scenario: 'Lambda 함수가 타임아웃(3초)에 자주 걸립니다. 현재 128MB로 설정돼 있는데 메모리를 늘리면 CPU도 비례해 증가합니다. 최적 메모리를 찾아 실행 시간과 비용을 동시에 줄이세요.',
    steps: [
      { title: '현재 Lambda 설정 확인', desc: '함수의 메모리, 타임아웃, 최근 실행 시간을 확인하세요.',
        hint: 'aws lambda get-function-configuration --function-name image-processor --query "{Memory:MemorySize,Timeout:Timeout,Runtime:Runtime,LastModified:LastModified}"',
        answers: ['aws lambda get-function-configuration --function-name image-processor --query "{memory:memorysize,timeout:timeout,runtime:runtime,lastmodified:lastmodified}"'],
        successOutput: ['{"Memory": 128, "Timeout": 3, "Runtime": "python3.12", "LastModified": "2024-01-01T00:00:00.000+0000"}'] },
      { title: 'Lambda 메모리 1024MB로 증설', desc: '메모리를 1024MB, 타임아웃을 10초로 업데이트하세요.',
        hint: 'aws lambda update-function-configuration --function-name image-processor --memory-size 1024 --timeout 10',
        answers: ['aws lambda update-function-configuration --function-name image-processor --memory-size 1024 --timeout 10'],
        successOutput: ['{"FunctionName": "image-processor", "MemorySize": 1024, "Timeout": 10, "LastUpdateStatus": "Successful"}'] },
      { title: 'CloudWatch Duration 메트릭 확인', desc: '메모리 증설 후 평균 실행 시간 변화를 확인하세요.',
        hint: 'aws cloudwatch get-metric-statistics --namespace AWS/Lambda --metric-name Duration --dimensions Name=FunctionName,Value=image-processor --start-time 2024-01-01T00:00:00Z --end-time 2024-01-01T01:00:00Z --period 300 --statistics Average Maximum',
        answers: ['aws cloudwatch get-metric-statistics --namespace aws/lambda --metric-name duration --dimensions name=functionname,value=image-processor --start-time 2024-01-01t00:00:00z --end-time 2024-01-01t01:00:00z --period 300 --statistics average maximum'],
        successOutput: ['{"Datapoints": [{"Timestamp": "2024-01-01T00:05:00Z", "Average": 820.5, "Maximum": 1240.0, "Unit": "Milliseconds"}], "Label": "Duration"}'] },
      { title: 'Throttles 알람 생성', desc: 'Lambda 스로틀링 발생 시 알람이 울리도록 설정하세요.',
        hint: 'aws cloudwatch put-metric-alarm --alarm-name lambda-throttle-alarm --metric-name Throttles --namespace AWS/Lambda --dimensions Name=FunctionName,Value=image-processor --statistic Sum --period 60 --threshold 10 --comparison-operator GreaterThanOrEqualToThreshold --evaluation-periods 1 --alarm-actions arn:aws:sns:us-east-1:123456789012:ops-alert',
        answers: ['aws cloudwatch put-metric-alarm --alarm-name lambda-throttle-alarm --metric-name throttles --namespace aws/lambda --dimensions name=functionname,value=image-processor --statistic sum --period 60 --threshold 10 --comparison-operator greaterthanorequaltothreshold --evaluation-periods 1 --alarm-actions arn:aws:sns:us-east-1:123456789012:ops-alert'],
        successOutput: [''] },
      { title: '동시 실행 제한 설정', desc: '이 함수에 예약 동시성(Reserved Concurrency) 50을 설정하세요.',
        hint: 'aws lambda put-function-concurrency --function-name image-processor --reserved-concurrent-executions 50',
        answers: ['aws lambda put-function-concurrency --function-name image-processor --reserved-concurrent-executions 50'],
        successOutput: ['{"ReservedConcurrentExecutions": 50}'] },
    ],
    explanation: 'Lambda는 메모리를 늘리면 CPU와 네트워크 대역폭도 비례해 증가합니다. 128MB → 1024MB로 8배 늘리면 실행 시간이 크게 줄어 오히려 총 비용이 감소하는 경우가 많습니다. AWS Lambda Power Tuning 도구로 최적 메모리를 자동으로 찾을 수 있습니다.',
  },
  6: {
    id: 'PERF-06', title: 'PERF-06 S3 Transfer Acceleration',
    scenario: '해외 지사(유럽, 아시아)에서 S3 버킷(us-east-1)으로 대용량 파일을 업로드할 때 속도가 너무 느립니다. S3 Transfer Acceleration을 활성화해 CloudFront 엣지를 통한 빠른 업로드 경로를 제공하세요.',
    steps: [
      { title: 'Transfer Acceleration 활성화', desc: '대상 S3 버킷에 Transfer Acceleration을 활성화하세요.',
        hint: 'aws s3api put-bucket-accelerate-configuration --bucket global-uploads-bucket --accelerate-configuration Status=Enabled',
        answers: ['aws s3api put-bucket-accelerate-configuration --bucket global-uploads-bucket --accelerate-configuration status=enabled'],
        successOutput: [''] },
      { title: 'Acceleration 설정 확인', desc: 'Transfer Acceleration이 활성화됐는지 확인하세요.',
        hint: 'aws s3api get-bucket-accelerate-configuration --bucket global-uploads-bucket',
        answers: ['aws s3api get-bucket-accelerate-configuration --bucket global-uploads-bucket'],
        successOutput: ['{"Status": "Enabled"}'] },
      { title: '속도 비교 테스트', desc: '가속화 엔드포인트로 업로드 속도를 테스트하세요.',
        hint: 'aws s3 cp large-file.zip s3://global-uploads-bucket/ --endpoint-url https://global-uploads-bucket.s3-accelerate.amazonaws.com',
        answers: ['aws s3 cp large-file.zip s3://global-uploads-bucket/ --endpoint-url https://global-uploads-bucket.s3-accelerate.amazonaws.com'],
        successOutput: ['upload: ./large-file.zip to s3://global-uploads-bucket/large-file.zip', 'Completed 500.0 MiB/500.0 MiB (45.2 MiB/s) with 1 file(s) remaining'] },
      { title: 'S3 버킷 메트릭 활성화', desc: 'Upload 성능 추적을 위해 S3 요청 메트릭을 활성화하세요.',
        hint: 'aws s3api put-bucket-metrics-configuration --bucket global-uploads-bucket --id all-objects --metrics-configuration Id=all-objects',
        answers: ['aws s3api put-bucket-metrics-configuration --bucket global-uploads-bucket --id all-objects --metrics-configuration id=all-objects'],
        successOutput: [''] },
    ],
    explanation: 'S3 Transfer Acceleration은 CloudFront 엣지 네트워크를 통해 업로드를 최적화합니다. 가속화 엔드포인트는 [bucket].s3-accelerate.amazonaws.com 형식입니다. 해외에서 AWS 리전까지의 인터넷 구간을 AWS 글로벌 네트워크로 대체해 50-500% 속도 향상을 기대할 수 있습니다.',
  },
  7: {
    id: 'PERF-07', title: 'PERF-07 EBS gp2 → gp3 볼륨 업그레이드',
    scenario: '프로덕션 EC2 서버의 디스크 I/O가 병목입니다. 현재 gp2 500GB 볼륨을 사용 중인데 gp3로 업그레이드하면 IOPS를 독립적으로 설정해 더 나은 성능을 더 저렴하게 얻을 수 있습니다.',
    steps: [
      { title: '현재 EBS 볼륨 확인', desc: '인스턴스에 연결된 EBS 볼륨의 현재 설정을 확인하세요.',
        hint: 'aws ec2 describe-volumes --filters Name=attachment.instance-id,Values=i-0abc1234567890abc --query "Volumes[*].{Id:VolumeId,Type:VolumeType,Size:Size,IOPS:Iops,Throughput:Throughput}"',
        answers: ['aws ec2 describe-volumes --filters name=attachment.instance-id,values=i-0abc1234567890abc --query "volumes[*].{id:volumeid,type:volumetype,size:size,iops:iops,throughput:throughput}"'],
        successOutput: ['[{"Id": "vol-0abc1234567890abc", "Type": "gp2", "Size": 500, "IOPS": 1500, "Throughput": null}]'] },
      { title: 'gp2 → gp3 볼륨 변경', desc: 'gp3로 변경하면서 IOPS 6000, 처리량 250MB/s로 설정하세요.',
        hint: 'aws ec2 modify-volume --volume-id vol-0abc1234567890abc --volume-type gp3 --iops 6000 --throughput 250',
        answers: ['aws ec2 modify-volume --volume-id vol-0abc1234567890abc --volume-type gp3 --iops 6000 --throughput 250'],
        successOutput: ['{"VolumeModification": {"VolumeId": "vol-0abc1234567890abc", "ModificationState": "modifying", "TargetVolumeType": "gp3", "TargetIops": 6000, "TargetThroughput": 250, "OriginalVolumeType": "gp2", "OriginalIops": 1500}}'] },
      { title: '볼륨 수정 상태 확인', desc: '볼륨 수정이 완료됐는지 확인하세요.',
        hint: 'aws ec2 describe-volumes-modifications --volume-ids vol-0abc1234567890abc --query "VolumesModifications[0].{State:ModificationState,Progress:Progress}"',
        answers: ['aws ec2 describe-volumes-modifications --volume-ids vol-0abc1234567890abc --query "volumesmodifications[0].{state:modificationstate,progress:progress}"'],
        successOutput: ['{"State": "completed", "Progress": 100}'] },
      { title: 'VolumeReadOps / VolumeWriteOps 확인', desc: 'CloudWatch로 IOPS 향상을 확인하세요.',
        hint: 'aws cloudwatch get-metric-statistics --namespace AWS/EBS --metric-name VolumeWriteOps --dimensions Name=VolumeId,Value=vol-0abc1234567890abc --start-time 2024-01-01T00:00:00Z --end-time 2024-01-01T01:00:00Z --period 300 --statistics Sum',
        answers: ['aws cloudwatch get-metric-statistics --namespace aws/ebs --metric-name volumewriteops --dimensions name=volumeid,value=vol-0abc1234567890abc --start-time 2024-01-01t00:00:00z --end-time 2024-01-01t01:00:00z --period 300 --statistics sum'],
        successOutput: ['{"Datapoints": [{"Timestamp": "2024-01-01T00:05:00Z", "Sum": 1823400.0, "Unit": "Count"}], "Label": "VolumeWriteOps"}'] },
    ],
    explanation: 'gp3는 gp2 대비 20% 저렴하면서 기본 3000 IOPS와 125MB/s 처리량을 제공합니다. gp2는 볼륨 크기에 IOPS가 연동(3 IOPS/GB)되지만 gp3는 독립적으로 설정 가능합니다. EC2 재시작 없이 온라인으로 변경됩니다.',
  },
  8: {
    id: 'PERF-08', title: 'PERF-08 API Gateway 응답 캐싱',
    scenario: 'API Gateway + Lambda 조합으로 운영 중인데 동일한 GET 요청이 반복되어 Lambda가 과도하게 호출됩니다. API Gateway 스테이지에 캐시를 활성화해 중복 Lambda 호출을 줄이세요.',
    steps: [
      { title: 'API Gateway 캐시 활성화', desc: '스테이지에 캐시 용량 0.5GB, TTL 300초로 활성화하세요.',
        hint: 'aws apigateway update-stage --rest-api-id abc123def4 --stage-name prod --patch-operations op=replace,path=/cacheClusterEnabled,value=true op=replace,path=/cacheClusterSize,value=0.5',
        answers: ['aws apigateway update-stage --rest-api-id abc123def4 --stage-name prod --patch-operations op=replace,path=/cacheclusterenabled,value=true op=replace,path=/cacheclustersize,value=0.5'],
        successOutput: ['{"stageName": "prod", "cacheClusterEnabled": true, "cacheClusterSize": "0.5", "cacheClusterStatus": "CREATE_IN_PROGRESS"}'] },
      { title: '메서드 캐시 TTL 설정', desc: 'GET /products 메서드에 캐시 TTL을 300초로 설정하세요.',
        hint: 'aws apigateway update-stage --rest-api-id abc123def4 --stage-name prod --patch-operations op=replace,path=/~1products/GET/caching/ttlInSeconds,value=300 op=replace,path=/~1products/GET/caching/cachingEnabled,value=true',
        answers: ['aws apigateway update-stage --rest-api-id abc123def4 --stage-name prod --patch-operations op=replace,path=/~1products/get/caching/ttlinseconds,value=300 op=replace,path=/~1products/get/caching/cachingenabled,value=true'],
        successOutput: ['{"stageName": "prod", "cacheClusterEnabled": true, "cacheClusterStatus": "AVAILABLE"}'] },
      { title: '캐시 히트율 메트릭 확인', desc: 'API Gateway CacheHitCount 메트릭을 조회하세요.',
        hint: 'aws cloudwatch get-metric-statistics --namespace AWS/ApiGateway --metric-name CacheHitCount --dimensions Name=ApiName,Value=product-api Name=Stage,Value=prod --start-time 2024-01-01T00:00:00Z --end-time 2024-01-01T01:00:00Z --period 300 --statistics Sum',
        answers: ['aws cloudwatch get-metric-statistics --namespace aws/apigateway --metric-name cachehitcount --dimensions name=apiname,value=product-api name=stage,value=prod --start-time 2024-01-01t00:00:00z --end-time 2024-01-01t01:00:00z --period 300 --statistics sum'],
        successOutput: ['{"Datapoints": [{"Timestamp": "2024-01-01T00:05:00Z", "Sum": 3420.0, "Unit": "Count"}], "Label": "CacheHitCount"}'] },
      { title: '캐시 무효화', desc: '데이터 변경 시 캐시를 즉시 무효화하세요.',
        hint: 'aws apigateway flush-stage-cache --rest-api-id abc123def4 --stage-name prod',
        answers: ['aws apigateway flush-stage-cache --rest-api-id abc123def4 --stage-name prod'],
        successOutput: [''] },
    ],
    explanation: 'API Gateway 캐싱은 동일한 요청에 대해 Lambda를 재호출하지 않고 캐시된 응답을 반환합니다. GET 메서드의 경우 쿼리스트링/헤더를 캐시 키에 포함할 수 있습니다. 캐시 TTL은 최대 3600초(1시간)이며 데이터 변경 시 flush-stage-cache로 무효화하세요.',
  },
  9: {
    id: 'PERF-09', title: 'PERF-09 RDS Proxy 연결 풀링',
    scenario: 'Lambda 함수가 RDS에 직접 연결하는데 동시 실행이 증가하면 "too many connections" 오류가 발생합니다. RDS Proxy를 도입해 연결을 풀링하고 DB 연결 수를 관리하세요.',
    steps: [
      { title: '현재 DB 연결 수 확인', desc: 'RDS DatabaseConnections 메트릭으로 현재 연결 수를 확인하세요.',
        hint: 'aws cloudwatch get-metric-statistics --namespace AWS/RDS --metric-name DatabaseConnections --dimensions Name=DBInstanceIdentifier,Value=prod-mysql --start-time 2024-01-01T00:00:00Z --end-time 2024-01-01T01:00:00Z --period 60 --statistics Maximum',
        answers: ['aws cloudwatch get-metric-statistics --namespace aws/rds --metric-name databaseconnections --dimensions name=dbinstanceidentifier,value=prod-mysql --start-time 2024-01-01t00:00:00z --end-time 2024-01-01t01:00:00z --period 60 --statistics maximum'],
        successOutput: ['{"Datapoints": [{"Timestamp": "2024-01-01T00:01:00Z", "Maximum": 498.0, "Unit": "Count"}], "Label": "DatabaseConnections"}'] },
      { title: 'RDS Proxy 생성', desc: 'MySQL 프로토콜로 RDS Proxy를 생성하세요.',
        hint: 'aws rds create-db-proxy --db-proxy-name prod-mysql-proxy --engine-family MYSQL --auth Description="prod mysql auth",AuthScheme=SECRETS,SecretArn=arn:aws:secretsmanager:us-east-1:123456789012:secret:rds/prod-mysql --role-arn arn:aws:iam::123456789012:role/RDSProxyRole --vpc-subnet-ids subnet-0abc123 subnet-0def456 --vpc-security-group-ids sg-0abc123def456789',
        answers: ['aws rds create-db-proxy --db-proxy-name prod-mysql-proxy --engine-family mysql --auth description="prod mysql auth",authscheme=secrets,secretarn=arn:aws:secretsmanager:us-east-1:123456789012:secret:rds/prod-mysql --role-arn arn:aws:iam::123456789012:role/rdsproxyrole --vpc-subnet-ids subnet-0abc123 subnet-0def456 --vpc-security-group-ids sg-0abc123def456789'],
        successOutput: ['{"DBProxy": {"DBProxyName": "prod-mysql-proxy", "Status": "creating", "Endpoint": "prod-mysql-proxy.proxy-abc123.us-east-1.rds.amazonaws.com", "EngineFamily": "MYSQL"}}'] },
      { title: 'Proxy Target 등록', desc: 'RDS 인스턴스를 Proxy 대상으로 등록하세요.',
        hint: 'aws rds register-db-proxy-targets --db-proxy-name prod-mysql-proxy --db-instance-identifiers prod-mysql',
        answers: ['aws rds register-db-proxy-targets --db-proxy-name prod-mysql-proxy --db-instance-identifiers prod-mysql'],
        successOutput: ['{"DBProxyTargets": [{"RdsResourceId": "prod-mysql", "Endpoint": "prod-mysql.abc123.us-east-1.rds.amazonaws.com", "Port": 3306, "Type": "RDS_INSTANCE", "TargetHealth": {"State": "REGISTERING"}}]}'] },
      { title: 'Proxy 엔드포인트 확인', desc: 'Proxy 상태와 연결 엔드포인트를 확인하세요.',
        hint: 'aws rds describe-db-proxies --db-proxy-name prod-mysql-proxy --query "DBProxies[0].{Status:Status,Endpoint:Endpoint}"',
        answers: ['aws rds describe-db-proxies --db-proxy-name prod-mysql-proxy --query "dbproxies[0].{status:status,endpoint:endpoint}"'],
        successOutput: ['{"Status": "available", "Endpoint": "prod-mysql-proxy.proxy-abc123.us-east-1.rds.amazonaws.com"}'] },
      { title: '연결 수 감소 확인', desc: 'Proxy 적용 후 RDS 직접 연결 수가 줄었는지 확인하세요.',
        hint: 'aws cloudwatch get-metric-statistics --namespace AWS/RDS --metric-name DatabaseConnections --dimensions Name=DBInstanceIdentifier,Value=prod-mysql --start-time 2024-01-01T02:00:00Z --end-time 2024-01-01T03:00:00Z --period 60 --statistics Maximum',
        answers: ['aws cloudwatch get-metric-statistics --namespace aws/rds --metric-name databaseconnections --dimensions name=dbinstanceidentifier,value=prod-mysql --start-time 2024-01-01t02:00:00z --end-time 2024-01-01t03:00:00z --period 60 --statistics maximum'],
        successOutput: ['{"Datapoints": [{"Timestamp": "2024-01-01T02:01:00Z", "Maximum": 12.0, "Unit": "Count"}], "Label": "DatabaseConnections"}'] },
    ],
    explanation: 'RDS Proxy는 Lambda나 컨테이너처럼 연결이 빈번히 생성/종료되는 환경에서 DB 연결을 풀링합니다. 수천 개의 Lambda 실행이 Proxy의 수십 개 연결을 공유합니다. IAM 인증과 Secrets Manager를 통해 보안도 강화됩니다.',
  },
  10: {
    id: 'PERF-10', title: 'PERF-10 EC2 인스턴스 타입 최적화',
    scenario: '배치 처리 서버가 t3.medium인데 CPU 크레딧이 소진되면 처리 속도가 급락합니다. CPU 집약적인 워크로드에 적합한 c5 계열로 마이그레이션하고 성능을 비교하세요.',
    steps: [
      { title: '현재 인스턴스 타입 및 크레딧 확인', desc: 'T3 인스턴스의 CPU 크레딧 잔액을 확인하세요.',
        hint: 'aws cloudwatch get-metric-statistics --namespace AWS/EC2 --metric-name CPUCreditBalance --dimensions Name=InstanceId,Value=i-0abc1234567890abc --start-time 2024-01-01T00:00:00Z --end-time 2024-01-01T01:00:00Z --period 300 --statistics Minimum',
        answers: ['aws cloudwatch get-metric-statistics --namespace aws/ec2 --metric-name cpucreditbalance --dimensions name=instanceid,value=i-0abc1234567890abc --start-time 2024-01-01t00:00:00z --end-time 2024-01-01t01:00:00z --period 300 --statistics minimum'],
        successOutput: ['{"Datapoints": [{"Timestamp": "2024-01-01T00:05:00Z", "Minimum": 2.3, "Unit": "Count"}], "Label": "CPUCreditBalance"}'] },
      { title: '인스턴스 중지', desc: '타입 변경을 위해 인스턴스를 중지하세요.',
        hint: 'aws ec2 stop-instances --instance-ids i-0abc1234567890abc',
        answers: ['aws ec2 stop-instances --instance-ids i-0abc1234567890abc'],
        successOutput: ['{"StoppingInstances": [{"InstanceId": "i-0abc1234567890abc", "CurrentState": {"Code": 64, "Name": "stopping"}, "PreviousState": {"Code": 16, "Name": "running"}}]}'] },
      { title: '인스턴스 타입 변경', desc: 't3.medium에서 c5.xlarge로 인스턴스 타입을 변경하세요.',
        hint: 'aws ec2 modify-instance-attribute --instance-id i-0abc1234567890abc --instance-type Value=c5.xlarge',
        answers: ['aws ec2 modify-instance-attribute --instance-id i-0abc1234567890abc --instance-type value=c5.xlarge'],
        successOutput: [''] },
      { title: '인스턴스 재시작', desc: '인스턴스를 다시 시작하세요.',
        hint: 'aws ec2 start-instances --instance-ids i-0abc1234567890abc',
        answers: ['aws ec2 start-instances --instance-ids i-0abc1234567890abc'],
        successOutput: ['{"StartingInstances": [{"InstanceId": "i-0abc1234567890abc", "CurrentState": {"Code": 0, "Name": "pending"}, "PreviousState": {"Code": 80, "Name": "stopped"}}]}'] },
      { title: 'CPU 사용률 비교', desc: 'c5.xlarge에서 동일 워크로드의 CPU 사용률을 확인하세요.',
        hint: 'aws cloudwatch get-metric-statistics --namespace AWS/EC2 --metric-name CPUUtilization --dimensions Name=InstanceId,Value=i-0abc1234567890abc --start-time 2024-01-01T02:00:00Z --end-time 2024-01-01T03:00:00Z --period 300 --statistics Average',
        answers: ['aws cloudwatch get-metric-statistics --namespace aws/ec2 --metric-name cpuutilization --dimensions name=instanceid,value=i-0abc1234567890abc --start-time 2024-01-01t02:00:00z --end-time 2024-01-01t03:00:00z --period 300 --statistics average'],
        successOutput: ['{"Datapoints": [{"Timestamp": "2024-01-01T02:05:00Z", "Average": 45.2, "Unit": "Percent"}], "Label": "CPUUtilization"}'] },
    ],
    explanation: 'T 계열(t2, t3, t4g)은 버스트 가능 인스턴스로 크레딧이 소진되면 기준 성능(CPU의 20-40%)으로 제한됩니다. CPU 집약적 워크로드는 C 계열(c5, c6i, c6g), 메모리 집약적은 R 계열, 범용은 M 계열이 적합합니다. c5.xlarge는 4vCPU / 8GB 메모리로 t3.medium 대비 4배 많은 vCPU를 제공합니다.',
  },
};

"""

import re

TARGET = 'src/web-app.tsx'
ANCHOR = 'const CHALLENGE_SCENARIOS: Record<string, Record<number, ChalScenario>>'
OLD_PERF = 'PERF: {}'
NEW_PERF = 'PERF: PERF_CHALLENGES'

with open(TARGET, 'r', encoding='utf-8') as f:
    src = f.read()

if 'PERF_CHALLENGES' in src:
    print('PERF_CHALLENGES already present - skipping insertion')
else:
    idx = src.find(ANCHOR)
    if idx == -1:
        raise RuntimeError(f'Anchor not found: {ANCHOR}')
    src = src[:idx] + PERF_BLOCK + src[idx:]
    print('Inserted PERF_CHALLENGES block')

if OLD_PERF in src:
    src = src.replace(OLD_PERF, NEW_PERF, 1)
    print(f'Replaced "{OLD_PERF}" with "{NEW_PERF}"')
else:
    print(f'WARNING: "{OLD_PERF}" not found - CHALLENGE_SCENARIOS may already reference PERF_CHALLENGES')

with open(TARGET, 'w', encoding='utf-8') as f:
    f.write(src)

print('Done.')
