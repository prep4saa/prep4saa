#!/usr/bin/env python3
"""
Final massive update for remaining locale files
"""
import re
import os

# RES 한국어 (30개 시나리오)
res_ko = {
    1: [("Launch Template 생성", "Auto Scaling용 Launch Template을 web-server-template으로 생성하세요."), ("Auto Scaling 그룹 생성", "최소 2, 최대 10 인스턴스로 web-asg Auto Scaling 그룹을 생성하세요."), ("CPU 기반 스케일링 정책 추가", "CPU 70% 초과 시 인스턴스 1개를 추가하는 정책을 생성하세요."), ("ASG 상태 확인", "web-asg Auto Scaling 그룹이 정상적으로 2개 인스턴스로 시작됐는지 확인하세요.")],
    2: [("Target Group 생성", "EC2 인스턴스용 Target Group web-tg를 HTTP 80 포트로 생성하세요."), ("ALB 생성", "퍼블릭 ALB web-alb를 생성하세요."), ("리스너 추가", "web-alb에 HTTP 80 포트 리스너를 추가하세요."), ("인스턴스 Target Group 등록", "EC2 인스턴스 2대를 web-tg Target Group에 등록하세요."), ("타겟 헬스 확인", "web-tg의 등록된 인스턴스 헬스체크 상태가 Healthy인지 확인하세요.")],
    3: [("현재 RDS 설정 확인", "prod-mysql의 Multi-AZ 설정을 확인하세요."), ("Multi-AZ 활성화", "prod-mysql을 Multi-AZ로 변경하세요."), ("변경 완료 확인", "prod-mysql Multi-AZ 변경이 완료됐는지 확인하세요."), ("장애 조치 테스트", "prod-mysql 의 Failover를 강제로 실행해 Standby가 Primary로 전환되는지 테스트하세요.")],
    4: [("소스 버킷 버전 관리 활성화", "서울 리전의 source-bucket에 Versioning을 활성화하세요."), ("목적지 버킷 버전 관리 활성화", "도쿄 리전의 dest-bucket-tokyo에 Versioning을 활성화하세요."), ("CRR 복제 규칙 설정", "source-bucket에서 dest-bucket-tokyo로 자동 복제하는 규칙을 설정하세요."), ("복제 상태 확인", "source-bucket에 업로드한 파일이 dest-bucket-tokyo에 복제되는지 확인하세요.")],
    5: [("ElastiCache 캐시 클러스터 생성", "Redis 6.x 엔진으로 cache-prod 클러스터를 생성하세요."), ("캐시 노드 타입 설정", "캐시 노드 타입을 cache.t3.micro로 설정하세요."), ("보안 그룹 설정", "캐시 포트 6379를 애플리케이션 서버 보안 그룹에서만 허용하세요."), ("연결 테스트", "애플리케이션 서버에서 cache-prod.abc123.ng.0001.use1.cache.amazonaws.com:6379로 Redis 명령어를 테스트하세요.")],
    6: [("Kinesis Data Stream 생성", "partition-key로 user-id를 사용하는 log-stream을 생성하세요."), ("샤드 수 설정", "초기 샤드 수를 4로 설정하세요."), ("프로듀서 애플리케이션 배포", "Kinesis PutRecord API로 log-stream에 데이터를 전송하는 코드를 배포하세요."), ("데이터 수신 확인", "CloudWatch에서 log-stream의 수신 레코드 수가 증가하는지 확인하세요.")],
    7: [("DynamoDB 테이블 생성", "primary-key를 user-id(String)로 users 테이블을 생성하세요."), ("온디맨드 용량 설정", "Billing mode를 PAY_PER_REQUEST(온디맨드)로 설정하세요."), ("GSI 생성", "Partition key email-index를 가진 Global Secondary Index를 생성하세요."), ("테이블 상태 확인", "users 테이블이 ACTIVE 상태인지 확인하세요.")],
    8: [("VPC 엔드포인트 생성", "S3용 Gateway VPC Endpoint s3-endpoint를 생성하세요."), ("라우트 테이블 수정", "프라이빗 서브넷의 라우트 테이블에 s3-endpoint 경로를 추가하세요."), ("정책 설정", "모든 프린시패L의 S3:GetObject 액세스만 허용하는 정책을 설정하세요."), ("연결 테스트", "프라이빗 EC2에서 aws s3 ls를 실행해 인터넷 게이트웨이 없이 S3에 접근하는지 확인하세요.")],
    9: [("CloudFront 배포 생성", "Origin을 content-bucket S3로 하는 배포를 생성하세요."), ("기본 캐시 동작 설정", "Viewer Protocol Policy를 HTTPS only로 설정하세요."), ("TTL 설정", "최대 TTL을 31536000초(1년)로 설정하세요."), ("배포 상태 확인", "CloudFront 배포가 Deployed 상태가 되면 d12345.cloudfront.net로 콘텐츠 접근을 확인하세요.")],
    10: [("API Gateway REST API 생성", "users API Gateway를 생성하세요."), ("리소스 생성", "/api/users 리소스를 생성하세요."), ("메서드 통합", "GET 메서드를 Lambda 함수 get-user로 통합하세요."), ("배포", "users API를 prod 스테이지로 배포하세요."), ("엔드포인트 테스트", "https://abc123.execute-api.us-east-1.amazonaws.com/prod/api/users로 GET 요청을 테스트하세요.")],
    11: [("Lambda 함수 생성", "Python 3.9 런타임으로 process-data Lambda 함수를 생성하세요."), ("환경변수 설정", "BUCKET_NAME=data-bucket, TIMEOUT=300을 환경변수로 설정하세요."), ("임시 메모리 할당", "메모리를 512 MB로 설정하고 타임아웃을 5분으로 설정하세요."), ("테스트 실행", "Lambda 함수를 테스트 이벤트로 호출해 정상 작동을 확인하세요.")],
    12: [("Step Functions 상태 머신 생성", "data-pipeline이라는 상태 머신을 생성하세요."), ("작업 상태 정의", "Lambda process-data 함수를 호출하는 Task 상태를 정의하세요."), ("에러 처리 추가", "Catch 블록으로 States.ALL 에러를 처리하는 Fallback 상태를 추가하세요."), ("실행", "data-pipeline 상태 머신을 실행해 complete-data 이벤트 입력으로 완료되는지 확인하세요.")],
    13: [("SNS 토픽 생성", "이메일 알림을 받을 SNS 토픽 notifications-topic을 생성하세요."), ("이메일 구독 추가", "notifications-topic에 admin@company.com 구독을 추가하고 확인하세요."), ("메시지 게시", "test message를 notifications-topic에 게시하세요."), ("수신 확인", "구독자 이메일에서 SNS 알림을 받았는지 확인하세요.")],
    14: [("SQS 큐 생성", "standard-queue SQS 큐를 생성하세요."), ("메시지 속성 설정", "Default Visibility Timeout을 300초(5분)로 설정하세요."), ("메시지 전송", "test-message를 standard-queue에 전송하세요."), ("메시지 수신 확인", "ReceiveMessage API로 수신된 메시지를 확인하고 DeleteMessage로 삭제하세요.")],
    15: [("EventBridge 규칙 생성", "EC2에 cron으로 매일 10시에 실행되는 daily-scan 규칙을 생성하세요."), ("대상 설정", "daily-scan 규칙의 대상을 Lambda 함수 security-scan으로 설정하세요."), ("역할 정의", "EventBridge가 Lambda를 호출할 수 있는 IAM 역할을 생성하세요."), ("실행 확인", "CloudWatch Logs에서 security-scan Lambda 실행 로그를 확인하세요.")],
    16: [("CodePipeline 생성", "deploy-pipeline이라는 파이프라인을 생성하세요."), ("소스 스테이지 추가", "GitHub 리포지토리의 main 브랜치를 소스로 추가하세요."), ("빌드 스테이지 추가", "CodeBuild 프로젝트 app-build를 빌드 스테이지로 추가하세요."), ("배포 스테이지 추가", "CodeDeploy 애플리케이션 app-server를 배포 스테이지로 추가하세요."), ("파이프라인 실행", "deploy-pipeline을 실행해 GitHub 푸시부터 배포까지 자동화되는지 확인하세요.")],
    17: [("CodeBuild 프로젝트 생성", "docker-build라는 CodeBuild 프로젝트를 생성하세요."), ("빌드 스펙 작성", "buildspec.yml에 docker build -t myapp:latest . 명령을 포함하세요."), ("환경 설정", "Docker 이미지 aws/codebuild/standard:5.0을 선택하고 권한 설정을 하세요."), ("빌드 실행", "docker-build 프로젝트를 실행해 Docker 이미지가 성공적으로 빌드되는지 확인하세요.")],
    18: [("CodeDeploy 애플리케이션 생성", "my-app CodeDeploy 애플리케이션을 생성하세요."), ("배포 그룹 생성", "prod-deployment 배포 그룹을 생성하고 환경태그 env=prod인 2개 EC2 인스턴스를 등록하세요."), ("앱스펙 작성", "appspec.yml에 hooks/BeforeInstall, hooks/ApplicationStart 등을 정의하세요."), ("배포 생성", "CodeDeploy 콘솔에서 Revision으로 appspec.yml S3 경로를 지정해 배포를 시작하세요."), ("배포 상태 확인", "prod-deployment의 배포 상태가 Succeeded가 되는지 확인하세요.")],
    19: [("저장소 생성", "app-repo CodeCommit 리포지토리를 생성하세요."), ("로컬 저장소 클론", "git clone https://git-codecommit.us-east-1.amazonaws.com/v1/repos/app-repo 명령으로 클론하세요."), ("코드 푸시", "코드를 main 브랜치에 커밋하고 git push origin main으로 푸시하세요."), ("변경 사항 확인", "CodeCommit 콘솔에서 Commits에서 푸시된 변경 사항을 확인하세요.")],
    20: [("Aurora 클러스터 생성", "MySQL 호환 db-cluster를 생성하세요."), ("인스턴스 추가", "db-cluster에 db.r5.large 인스턴스 2개를 추가하세요."), ("Parameter Group 설정", "Aurora Parameter Group에서 max_connections=1000으로 설정하세요."), ("연결 테스트", "Aurora Endpoint(db-cluster.123abc.us-east-1.rds.amazonaws.com:3306)로 MySQL 클라이언트를 통해 연결을 확인하세요.")],
    21: [("마이그레이션 작업 생성", "mysql-to-aurora 마이그레이션 작업을 생성하세요."), ("소스 엔드포인트 설정", "소스 MySQL 데이터베이스 엔드포인트(source-db.123abc.us-east-1.rds.amazonaws.com)를 설정하세요."), ("대상 엔드포인트 설정", "대상 Aurora 엔드포인트(db-cluster.123abc.us-east-1.rds.amazonaws.com)를 설정하세요."), ("마이그레이션 시작", "mysql-to-aurora 작업을 시작해 데이터 복제가 성공적으로 완료되는지 모니터링하세요.")],
    22: [("성능 인사이트 활성화", "prod-db RDS 인스턴스에 Performance Insights를 활성화하세요."), ("DB 파라미터 조정", "slow_query_log=1, long_query_time=2로 설정해 느린 쿼리를 기록하세요."), ("Enhanced Monitoring 활성화", "Enhanced Monitoring 세분성을 60초로 설정하세요."), ("모니터링 대시보드 확인", "Performance Insights 대시보드에서 Database Activity 및 Load를 확인하세요.")],
    23: [("배치 변환 작업 생성", "s3-batch-transform 변환 작업을 생성하세요."), ("입력 데이터 지정", "s3://input-bucket/data/*.json 경로의 입력 데이터를 지정하세요."), ("모델 엔드포인트 지정", "추론용 SageMaker 엔드포인트 inference-endpoint를 지정하세요."), ("출력 경로 설정", "변환 결과를 s3://output-bucket/predictions/로 저장하도록 설정하세요."), ("작업 모니터링", "변환 작업이 Completed 상태가 되면 s3://output-bucket/predictions/에서 결과를 확인하세요.")],
    24: [("호스팅 모델 배포", "trained-model을 SageMaker Endpoint로 배포하세요."), ("엔드포인트명 설정", "엔드포인트를 my-ml-endpoint로 설정하세요."), ("초기 인스턴스 수", "초기 인스턴스 수를 1로 설정하세요."), ("인스턴스 타입 선택", "ml.m5.large 인스턴스 타입을 선택하세요."), ("엔드포인트 테스트", "my-ml-endpoint로 InvokeEndpoint API 호출을 테스트하세요.")],
    25: [("노트북 인스턴스 생성", "ml-notebook SageMaker 노트북 인스턴스를 생성하세요."), ("인스턴스 타입 설정", "인스턴스 타입을 ml.t3.medium으로 설정하세요."), ("IAM 역할 지정", "SageMaker 실행 IAM 역할을 지정하세요."), ("노트북 열기", "ml-notebook 노트북 인스턴스를 열고 Jupyter에 접근하세요."), ("데이터 탐색", "Jupyter 노트북에서 pandas를 사용해 input-bucket의 데이터를 탐색하세요.")],
    26: [("모니터링 대시보드 생성", "application-dashboard CloudWatch 대시보드를 생성하세요."), ("메트릭 위젯 추가", "EC2 CPU, RDS 평균 쓰기 지연 시간, DynamoDB 읽기 용량 소비율 위젯을 추가하세요."), ("로그 그룹 연결", "/aws/lambda/application 로그 그룹을 대시보드에 연결하세요."), ("대시보드 공유", "application-dashboard를 팀 IAM 역할과 공유하세요.")],
    27: [("알람 생성", "CPU 사용률 > 80% 시 알림을 보내는 alb-cpu-alarm 알람을 생성하세요."), ("알림 대상 설정", "alb-cpu-alarm의 알림 대상을 ops-alerts SNS 토픽으로 설정하세요."), ("통계 설정", "통계를 Average, Period를 300초로 설정하세요."), ("알람 테스트", "EC2에서 CPU 부하를 생성해 알람이 ALARM 상태가 되고 SNS 알림이 전송되는지 확인하세요.")],
    28: [("로그 그룹 생성", "/aws/application 로그 그룹을 생성하세요."), ("보존 기간 설정", "보존 기간을 30일로 설정하세요."), ("필터 정의", "ERROR, FATAL 키워드를 포함하는 로그를 필터링하세요."), ("쿼리 실행", "CloudWatch Logs Insights에서 fields @timestamp, @message | filter @message like /ERROR/ | stats count()로 ERROR 로그 수를 조회하세요.")],
    29: [("X-Ray 트레이싱 활성화", "Lambda 함수에서 X-Ray 트레이싱을 활성화하세요."), ("인스트루먼트 추가", "xray_recorder를 사용해 Lambda 함수 내 주요 작업을 추적하세요."), ("서비스 맵 생성", "Lambda, DynamoDB 간의 호출 관계가 X-Ray 서비스 맵에 나타나는지 확인하세요."), ("성능 분석", "X-Ray에서 Lambda 실행 시간 분포와 에러율을 분석하세요.")],
    30: [("비용 탐색기 열기", "Cost Explorer에서 일일 비용 추세를 조회하세요."), ("서비스별 분석", "서비스별로 EC2, RDS, Lambda 비용을 필터링해 확인하세요."), ("태그별 분석", "Cost Allocation Tags로 env:prod 태그의 비용을 추적하세요."), ("예산 조정", "월 예산을 $1000에서 $1500으로 조정하고 80% 사용 시 알림을 설정하세요.")],
}

# PERF 한국어 (최소 몇 개만 샘플로)
perf_ko = {
    1: [("Performance Insights 활성화", "prod-database RDS 인스턴스에 Performance Insights를 활성화하세요."), ("DB 로드 분석", "Performance Insights 대시보드에서 Database Activity(DB Load)를 확인하세요."), ("자주 사용하는 쿼리 확인", "Top SQL에서 CPU를 많이 사용하는 쿼리 TOP 5를 확인하세요."), ("쿼리 최적화", "느린 쿼리에 인덱스를 추가하거나 쿼리를 최적화하세요.")],
}

# COST 한국어 (최소 몇 개만 샘플로)
cost_ko = {
    1: [("Cost Explorer 열기", "Cost Explorer에서 일일 비용 추세를 조회하세요."), ("필터 적용", "필터에서 ec2, rds 등 주요 서비스를 선택하세요."), ("기간 설정", "지난 3개월의 비용 추세를 확인하세요."), ("그래프 분석", "비용 증가 추세를 분석하고 이유를 파악하세요.")],
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

# Update RES Korean
count = update_file('src/locales/res-ko.ts', res_ko)
if count > 0:
    print(f"Updated {count} descriptions in res-ko.ts")

# Update PERF Korean
count = update_file('src/locales/perf-ko.ts', perf_ko)
if count > 0:
    print(f"Updated {count} descriptions in perf-ko.ts")

# Update COST Korean
count = update_file('src/locales/cost-ko.ts', cost_ko)
if count > 0:
    print(f"Updated {count} descriptions in cost-ko.ts")

print("Sample update complete")
