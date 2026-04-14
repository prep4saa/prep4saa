# -*- coding: utf-8 -*-
"""Replaces ConsolePanel with an interactive AWS CLI challenge console."""

NEW_CONSOLE = r'''
const CAT_COLORS: Record<string, string> = {
  SEC: '#f85149', RES: '#58a6ff', PERF: '#3fb950', COST: '#e3b341',
};

interface ChalStep {
  title: string; desc: string; hint: string;
  answers: string[]; successOutput: string[];
}
interface ChalScenario {
  id: string; title: string; scenario: string;
  steps: ChalStep[]; explanation: string;
}
type ChalStatus = 'idle' | 'animating' | 'transitioning' | 'solved';
type ChalLine =
  | { kind: 'cmd'; text: string; ok: boolean }
  | { kind: 'out'; text: string }
  | { kind: 'err'; text: string }
  | { kind: 'step'; num: number; title: string; total: number };

function normCmd(s: string) { return s.trim().replace(/\s+/g, ' ').toLowerCase(); }
function outColor(line: string) {
  const l = line.toLowerCase();
  if (l.includes('error') || l.includes('denied') || l.includes('failed')) return '#f85149';
  if (l.includes('true') || l.includes('"enabled"') || l.includes('"available"')) return '#3fb950';
  if (l.includes('"arn"') || l.includes('"userid"') || l.includes('"keyid"')) return '#e3b341';
  return '#e6edf3';
}

const SEC_CHALLENGES: Record<number, ChalScenario> = {
  1: {
    id: 'SEC-01', title: 'SEC-01 신입 개발자 온보딩',
    scenario: '스타트업 AWS 관리자인 당신에게 오늘 신입 백엔드 개발자 김개발이 입사했습니다. S3와 EC2를 읽기 전용으로만 접근 가능해야 하며, 수정·삭제는 절대 불가해야 합니다.',
    steps: [
      { title: 'IAM 사용자 생성', desc: 'kim-dev 사용자를 IAM에 생성하세요.',
        hint: 'aws iam create-user --user-name kim-dev',
        answers: ['aws iam create-user --user-name kim-dev'],
        successOutput: ['{"User": {"UserName": "kim-dev", "UserId": "AIDIODR4TAW7CSEXAMPLE", "Arn": "arn:aws:iam::123456789012:user/kim-dev", "CreateDate": "2026-04-13T09:00:00Z"}}'] },
      { title: 'S3 ReadOnly 정책 연결', desc: 'AmazonS3ReadOnlyAccess 정책을 kim-dev에 연결하세요.',
        hint: 'aws iam attach-user-policy --user-name kim-dev --policy-arn arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess',
        answers: ['aws iam attach-user-policy --user-name kim-dev --policy-arn arn:aws:iam::aws:policy/amazons3readonlyaccess'],
        successOutput: [''] },
      { title: 'AccessDenied 확인', desc: '버킷 삭제 명령어를 실행해 권한 차단을 확인하세요.',
        hint: 'aws s3 rb s3://prod-data-bucket --force',
        answers: ['aws s3 rb s3://prod-data-bucket --force'],
        successOutput: ['An error occurred (AccessDenied) when calling the DeleteBucket operation: Access Denied'] },
    ],
    explanation: 'IAM 사용자에게 Managed Policy를 직접 연결하는 기본 패턴입니다. ReadOnly 정책은 List/Get/Describe만 허용하므로 삭제·수정 명령어는 AccessDenied를 반환합니다.',
  },
  2: {
    id: 'SEC-02', title: 'SEC-02 팀별 권한 분리',
    scenario: '회사가 성장해 개발팀 5명, 운영팀 3명이 됐습니다. 개발팀은 EC2만, 운영팀은 RDS만 관리합니다. 매번 개인별로 정책을 붙이는 게 번거로워 그룹 기반 관리 체계를 도입하기로 했습니다.',
    steps: [
      { title: 'dev-team 그룹 생성', desc: '개발팀 IAM 그룹을 생성하세요.',
        hint: 'aws iam create-group --group-name dev-team',
        answers: ['aws iam create-group --group-name dev-team'],
        successOutput: ['{"Group": {"GroupName": "dev-team", "GroupId": "AGPAI3OEXAMPLEGROUP", "Arn": "arn:aws:iam::123456789012:group/dev-team", "CreateDate": "2026-04-13T09:00:00Z"}}'] },
      { title: 'EC2 정책 연결', desc: 'dev-team에 AmazonEC2FullAccess를 연결하세요.',
        hint: 'aws iam attach-group-policy --group-name dev-team --policy-arn arn:aws:iam::aws:policy/AmazonEC2FullAccess',
        answers: ['aws iam attach-group-policy --group-name dev-team --policy-arn arn:aws:iam::aws:policy/amazonec2fullaccess'],
        successOutput: [''] },
      { title: '사용자를 그룹에 추가', desc: 'kim-dev를 dev-team 그룹에 추가하세요.',
        hint: 'aws iam add-user-to-group --group-name dev-team --user-name kim-dev',
        answers: ['aws iam add-user-to-group --group-name dev-team --user-name kim-dev'],
        successOutput: [''] },
    ],
    explanation: 'IAM 그룹을 사용하면 사용자 추가/제거만으로 권한이 자동으로 부여·회수됩니다. 개인별 정책 관리 대비 운영 오류가 크게 줄어듭니다.',
  },
  3: {
    id: 'SEC-03', title: 'SEC-03 EC2가 S3에 접근해야 할 때',
    scenario: '운영 중인 EC2 서버가 매일 밤 로그 파일을 S3에 자동 업로드해야 합니다. 개발자가 "액세스 키를 EC2에 하드코딩하면 안 되나요?"라고 물어봤습니다. 보안 원칙에 맞는 방법으로 설정하세요.',
    steps: [
      { title: 'IAM Role 생성', desc: 'EC2가 사용할 IAM Role을 생성하세요.',
        hint: 'aws iam create-role --role-name ec2-s3-upload-role --assume-role-policy-document file://trust-policy.json',
        answers: ['aws iam create-role --role-name ec2-s3-upload-role --assume-role-policy-document file://trust-policy.json'],
        successOutput: ['{"Role": {"RoleName": "ec2-s3-upload-role", "RoleId": "AROAI3OEXAMPLEROLE", "Arn": "arn:aws:iam::123456789012:role/ec2-s3-upload-role", "CreateDate": "2026-04-13T09:00:00Z"}}'] },
      { title: 'S3 권한 연결', desc: 'Role에 AmazonS3FullAccess 정책을 연결하세요.',
        hint: 'aws iam attach-role-policy --role-name ec2-s3-upload-role --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess',
        answers: ['aws iam attach-role-policy --role-name ec2-s3-upload-role --policy-arn arn:aws:iam::aws:policy/amazons3fullaccess'],
        successOutput: [''] },
      { title: 'EC2에 Role 연결', desc: 'EC2 인스턴스에 IAM Role을 연결하세요.',
        hint: 'aws ec2 associate-iam-instance-profile --instance-id i-0abcdef1234567890 --iam-instance-profile Name=ec2-s3-upload-role',
        answers: ['aws ec2 associate-iam-instance-profile --instance-id i-0abcdef1234567890 --iam-instance-profile name=ec2-s3-upload-role'],
        successOutput: ['{"IamInstanceProfileAssociation": {"AssociationId": "iip-assoc-0e7736169e6a2a8e3", "InstanceId": "i-0abcdef1234567890", "IamInstanceProfile": {"Arn": "arn:aws:iam::123456789012:instance-profile/ec2-s3-upload-role"}, "State": "associating"}}'] },
    ],
    explanation: 'EC2에 IAM Role을 연결하면 인스턴스 메타데이터 서비스(IMDS)가 임시 자격증명을 자동 갱신합니다. 액세스 키 하드코딩은 키 유출 위험이 있어 Role 사용이 모범 사례입니다.',
  },
  4: {
    id: 'SEC-04', title: 'SEC-04 고객 데이터 버킷 보호',
    scenario: '쇼핑몰 고객 주문 데이터가 S3에 저장됩니다. 보안 감사에서 "버킷이 퍼블릭에 노출될 위험이 있다"는 지적을 받았습니다. 특정 Lambda 함수만 접근 가능하도록 버킷을 잠그세요.',
    steps: [
      { title: '퍼블릭 액세스 전면 차단', desc: 'orders-data-bucket의 퍼블릭 액세스를 모두 차단하세요.',
        hint: 'aws s3api put-public-access-block --bucket orders-data-bucket --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true',
        answers: ['aws s3api put-public-access-block --bucket orders-data-bucket --public-access-block-configuration blockpublicacls=true,ignorepublicacls=true,blockpublicpolicy=true,restrictpublicbuckets=true'],
        successOutput: [''] },
      { title: '버킷 정책 적용', desc: '특정 Lambda ARN만 허용하는 버킷 정책을 적용하세요.',
        hint: 'aws s3api put-bucket-policy --bucket orders-data-bucket --policy file://lambda-only-policy.json',
        answers: ['aws s3api put-bucket-policy --bucket orders-data-bucket --policy file://lambda-only-policy.json'],
        successOutput: [''] },
      { title: '설정 확인', desc: '퍼블릭 액세스 차단 설정이 올바른지 확인하세요.',
        hint: 'aws s3api get-public-access-block --bucket orders-data-bucket',
        answers: ['aws s3api get-public-access-block --bucket orders-data-bucket'],
        successOutput: ['{"PublicAccessBlockConfiguration": {"BlockPublicAcls": true, "IgnorePublicAcls": true, "BlockPublicPolicy": true, "RestrictPublicBuckets": true}}'] },
    ],
    explanation: 'S3 버킷 보호는 두 계층으로 구성됩니다. Block Public Access는 계정/버킷 전체를 보호하는 안전망이고, 버킷 정책은 특정 Principal(예: Lambda ARN)만 허용하는 세밀한 제어입니다.',
  },
  5: {
    id: 'SEC-05', title: 'SEC-05 규정 준수를 위한 데이터 암호화',
    scenario: '핀테크 스타트업에서 금융 데이터를 S3에 저장합니다. 금융당국 규정상 "고객 데이터는 반드시 고객사가 관리하는 키로 암호화"해야 한다는 요구사항이 생겼습니다.',
    steps: [
      { title: 'KMS CMK 생성', desc: '금융 데이터 암호화용 CMK를 생성하세요.',
        hint: 'aws kms create-key --description "finance-data-key" --key-usage ENCRYPT_DECRYPT',
        answers: ['aws kms create-key --description "finance-data-key" --key-usage encrypt_decrypt', 'aws kms create-key --description finance-data-key --key-usage encrypt_decrypt'],
        successOutput: ['{"KeyMetadata": {"KeyId": "1234abcd-12ab-34cd-56ef-1234567890ab", "Arn": "arn:aws:kms:us-east-1:123456789012:key/1234abcd-12ab-34cd-56ef-1234567890ab", "KeyState": "Enabled", "Description": "finance-data-key"}}'] },
      { title: 'KMS Alias 생성', desc: 'Key ID 대신 사용할 alias를 만드세요.',
        hint: 'aws kms create-alias --alias-name alias/finance-data-key --target-key-id 1234abcd-12ab-34cd-56ef-1234567890ab',
        answers: ['aws kms create-alias --alias-name alias/finance-data-key --target-key-id 1234abcd-12ab-34cd-56ef-1234567890ab'],
        successOutput: [''] },
      { title: 'S3 SSE-KMS 설정', desc: 'fintech-data-bucket에 SSE-KMS 암호화를 기본값으로 설정하세요.',
        hint: 'aws s3api put-bucket-encryption --bucket fintech-data-bucket --server-side-encryption-configuration file://kms-encryption.json',
        answers: ['aws s3api put-bucket-encryption --bucket fintech-data-bucket --server-side-encryption-configuration file://kms-encryption.json'],
        successOutput: [''] },
    ],
    explanation: 'SSE-KMS는 S3가 KMS API를 호출해 암호화/복호화합니다. CMK(Customer Managed Key)를 사용하면 키 정책으로 접근을 세밀하게 제어하고, 키 사용 내역을 CloudTrail로 감사할 수 있습니다.',
  },
  6: {
    id: 'SEC-06', title: 'SEC-06 웹서버 최소 권한 네트워크 설정',
    scenario: 'EC2 웹서버가 해킹 시도를 받고 있습니다. 현재 보안 그룹이 0.0.0.0/0 전체 개방 상태입니다. 웹 트래픽만 허용하고 SSH는 사무실 IP에서만 가능하도록 즉시 조치하세요.',
    steps: [
      { title: '현재 SG 규칙 확인', desc: '보안 그룹의 현재 인바운드 규칙을 확인하세요.',
        hint: 'aws ec2 describe-security-groups --group-ids sg-0abc123def456789 --query "SecurityGroups[0].IpPermissions"',
        answers: ['aws ec2 describe-security-groups --group-ids sg-0abc123def456789 --query "securitygroups[0].ippermissions"', 'aws ec2 describe-security-groups --group-ids sg-0abc123def456789'],
        successOutput: ['[{"IpProtocol": "-1", "IpRanges": [{"CidrIp": "0.0.0.0/0", "Description": "All traffic - INSECURE"}]}]'] },
      { title: '전체 허용 규칙 삭제', desc: '0.0.0.0/0 전체 개방 규칙을 즉시 삭제하세요.',
        hint: 'aws ec2 revoke-security-group-ingress --group-id sg-0abc123def456789 --protocol all --cidr 0.0.0.0/0',
        answers: ['aws ec2 revoke-security-group-ingress --group-id sg-0abc123def456789 --protocol all --cidr 0.0.0.0/0'],
        successOutput: ['{"Return": true}'] },
      { title: 'HTTPS 허용 규칙 추가', desc: 'HTTPS(443)를 전체에게, SSH(22)는 사무실 IP에만 허용하세요.',
        hint: 'aws ec2 authorize-security-group-ingress --group-id sg-0abc123def456789 --protocol tcp --port 443 --cidr 0.0.0.0/0',
        answers: ['aws ec2 authorize-security-group-ingress --group-id sg-0abc123def456789 --protocol tcp --port 443 --cidr 0.0.0.0/0'],
        successOutput: ['{"Return": true, "SecurityGroupRules": [{"SecurityGroupRuleId": "sgr-0abc12345", "IpProtocol": "tcp", "FromPort": 443, "ToPort": 443, "CidrIpv4": "0.0.0.0/0"}]}'] },
    ],
    explanation: '보안 그룹은 Stateful 방화벽으로 허용 규칙만 존재합니다. 최소 권한 원칙에 따라 필요한 포트만 열고, 관리용 SSH는 반드시 특정 IP로 제한해야 합니다.',
  },
  7: {
    id: 'SEC-07', title: 'SEC-07 타 계정 배포 파이프라인 구성',
    scenario: '개발 계정(Account A)의 CI/CD 파이프라인이 운영 계정(Account B)의 S3에 빌드 산출물을 배포해야 합니다. 운영 계정 액세스 키를 개발팀에 주는 건 보안상 절대 안 됩니다.',
    steps: [
      { title: 'Cross-Account Role 생성', desc: '운영 계정에 개발 계정을 신뢰하는 Role을 생성하세요.',
        hint: 'aws iam create-role --role-name cross-account-deploy-role --assume-role-policy-document file://trust-policy.json',
        answers: ['aws iam create-role --role-name cross-account-deploy-role --assume-role-policy-document file://trust-policy.json'],
        successOutput: ['{"Role": {"RoleName": "cross-account-deploy-role", "Arn": "arn:aws:iam::999999999999:role/cross-account-deploy-role", "CreateDate": "2026-04-13T09:00:00Z"}}'] },
      { title: '임시 자격증명 발급', desc: '개발 계정에서 STS assume-role로 임시 자격증명을 발급하세요.',
        hint: 'aws sts assume-role --role-arn arn:aws:iam::999999999999:role/cross-account-deploy-role --role-session-name deploy-session',
        answers: ['aws sts assume-role --role-arn arn:aws:iam::999999999999:role/cross-account-deploy-role --role-session-name deploy-session'],
        successOutput: ['{"Credentials": {"AccessKeyId": "ASIATEMP1234567890", "SecretAccessKey": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLE", "SessionToken": "FwoGZXIvYXdzEJr...", "Expiration": "2026-04-13T13:00:00Z"}}'] },
      { title: '운영 계정 S3에 배포', desc: '임시 자격증명으로 운영 계정 S3에 파일을 업로드하세요.',
        hint: 'aws s3 cp build/app.zip s3://prod-artifacts-bucket/',
        answers: ['aws s3 cp build/app.zip s3://prod-artifacts-bucket/'],
        successOutput: ['upload: build/app.zip to s3://prod-artifacts-bucket/app.zip'] },
    ],
    explanation: 'STS AssumeRole은 임시 자격증명(최대 12시간)을 발급합니다. Cross-Account Role의 신뢰 정책(Trust Policy)에 개발 계정 ID를 명시해야 하며, 이 방식은 영구 액세스 키 공유보다 훨씬 안전합니다.',
  },
  8: {
    id: 'SEC-08', title: 'SEC-08 보안 사고 — 누가 삭제했나?',
    scenario: '어느 날 아침 운영 DB 스냅샷이 삭제되어 있었습니다. 팀원 누구도 삭제한 적 없다고 합니다. CTO가 "모든 AWS API 호출 기록을 남기고 범인을 찾아라"고 지시했습니다.',
    steps: [
      { title: 'CloudTrail Trail 생성', desc: '전 리전 API 호출을 S3에 기록하는 Trail을 생성하세요.',
        hint: 'aws cloudtrail create-trail --name main-trail --s3-bucket-name audit-logs-bucket --is-multi-region-trail',
        answers: ['aws cloudtrail create-trail --name main-trail --s3-bucket-name audit-logs-bucket --is-multi-region-trail'],
        successOutput: ['{"Name": "main-trail", "S3BucketName": "audit-logs-bucket", "IsMultiRegionTrail": true, "TrailARN": "arn:aws:cloudtrail:us-east-1:123456789012:trail/main-trail"}'] },
      { title: 'Trail 로깅 시작', desc: 'Trail의 로그 기록을 활성화하세요.',
        hint: 'aws cloudtrail start-logging --name main-trail',
        answers: ['aws cloudtrail start-logging --name main-trail'],
        successOutput: [''] },
      { title: '삭제 이벤트 조회', desc: 'DeleteDBSnapshot 이벤트를 발생시킨 사용자를 조회하세요.',
        hint: 'aws cloudtrail lookup-events --lookup-attributes AttributeKey=EventName,AttributeValue=DeleteDBSnapshot',
        answers: ['aws cloudtrail lookup-events --lookup-attributes attributekey=eventname,attributevalue=deletedbsnapshot'],
        successOutput: ['{"Events": [{"EventTime": "2026-04-12T03:47:00Z", "EventName": "DeleteDBSnapshot", "Username": "dev-user-03", "Resources": [{"ResourceType": "AWS::RDS::DBSnapshot", "ResourceName": "prod-db-snapshot-20260412"}]}]}'] },
    ],
    explanation: 'CloudTrail은 AWS 계정의 모든 API 호출을 기록합니다. lookup-events 명령어로 특정 이벤트 이름이나 사용자명으로 빠르게 검색할 수 있어 보안 사고 조사에 필수입니다.',
  },
  9: {
    id: 'SEC-09', title: 'SEC-09 DB 비밀번호 코드에서 제거하기',
    scenario: '코드 리뷰 중 RDS 비밀번호가 GitHub 코드에 하드코딩된 것이 발견됐습니다. 보안팀이 즉각 시정을 요구했습니다. 비밀번호를 런타임에 안전하게 가져오도록 바꾸세요.',
    steps: [
      { title: 'Secrets Manager에 시크릿 생성', desc: 'DB 자격증명을 Secrets Manager에 저장하세요.',
        hint: "aws secretsmanager create-secret --name prod/rds/password --secret-string '{\"username\":\"admin\",\"password\":\"MySecretP@ss123\"}'",
        answers: ["aws secretsmanager create-secret --name prod/rds/password --secret-string '{\"username\":\"admin\",\"password\":\"mysqretp@ss123\"}'"],
        successOutput: ['{"ARN": "arn:aws:secretsmanager:us-east-1:123456789012:secret:prod/rds/password-AbCdEf", "Name": "prod/rds/password", "VersionId": "a1b2c3d4-1234-5678-90ab-cdef01234567"}'] },
      { title: '런타임에 시크릿 조회', desc: '애플리케이션이 런타임에 자격증명을 가져오는지 확인하세요.',
        hint: 'aws secretsmanager get-secret-value --secret-id prod/rds/password',
        answers: ['aws secretsmanager get-secret-value --secret-id prod/rds/password'],
        successOutput: ['{"Name": "prod/rds/password", "SecretString": "{\"username\":\"admin\",\"password\":\"MySecretP@ss123\"}", "CreatedDate": "2026-04-13T09:00:00Z"}'] },
      { title: '90일 자동 교체 설정', desc: '비밀번호가 90일마다 자동 교체되도록 설정하세요.',
        hint: 'aws secretsmanager rotate-secret --secret-id prod/rds/password --rotation-rules AutomaticallyAfterDays=90',
        answers: ['aws secretsmanager rotate-secret --secret-id prod/rds/password --rotation-rules automaticallyafterdays=90'],
        successOutput: ['{"ARN": "arn:aws:secretsmanager:us-east-1:123456789012:secret:prod/rds/password-AbCdEf", "Name": "prod/rds/password", "RotationEnabled": true, "RotationRules": {"AutomaticallyAfterDays": 90}}'] },
    ],
    explanation: 'Secrets Manager는 자격증명을 안전하게 저장하고 애플리케이션이 SDK/CLI로 런타임에 조회합니다. 자동 교체 기능으로 비밀번호가 주기적으로 갱신되어 유출 피해를 최소화합니다.',
  },
  10: {
    id: 'SEC-10', title: 'SEC-10 서브넷 단위 트래픽 차단',
    scenario: '보안 감사 결과 "보안 그룹만으로는 부족하다. 서브넷 레벨에서도 특정 IP를 차단하는 이중 방어선이 필요하다"는 권고를 받았습니다. 알려진 악성 IP 대역을 NACL로 차단하세요.',
    steps: [
      { title: '커스텀 NACL 생성', desc: 'VPC에 새로운 커스텀 NACL을 생성하세요.',
        hint: 'aws ec2 create-network-acl --vpc-id vpc-0abc123def456789',
        answers: ['aws ec2 create-network-acl --vpc-id vpc-0abc123def456789'],
        successOutput: ['{"NetworkAcl": {"NetworkAclId": "acl-0abc123def456789", "VpcId": "vpc-0abc123def456789", "IsDefault": false, "Entries": []}}'] },
      { title: '악성 IP 차단 규칙 추가', desc: '192.168.100.0/24 대역을 인바운드 DENY하는 규칙을 추가하세요.',
        hint: 'aws ec2 create-network-acl-entry --network-acl-id acl-0abc123def456789 --rule-number 100 --protocol -1 --cidr-block 192.168.100.0/24 --rule-action deny --ingress',
        answers: ['aws ec2 create-network-acl-entry --network-acl-id acl-0abc123def456789 --rule-number 100 --protocol -1 --cidr-block 192.168.100.0/24 --rule-action deny --ingress'],
        successOutput: [''] },
      { title: '서브넷에 NACL 연결', desc: '프라이빗 서브넷에 새 NACL을 연결하세요.',
        hint: 'aws ec2 replace-network-acl-association --association-id aclassoc-0abc123def456789 --network-acl-id acl-0abc123def456789',
        answers: ['aws ec2 replace-network-acl-association --association-id aclassoc-0abc123def456789 --network-acl-id acl-0abc123def456789'],
        successOutput: ['{"NewAssociationId": "aclassoc-1abc234def567890"}'] },
    ],
    explanation: 'NACL(Network ACL)은 서브넷 레벨의 Stateless 방화벽입니다. 규칙 번호 순서대로 평가되며, DENY 규칙이 먼저 매칭되면 차단됩니다. 보안 그룹(인스턴스 레벨)과 함께 사용하면 이중 방어가 됩니다.',
  },
};

const CHALLENGE_SCENARIOS: Record<string, Record<number, ChalScenario>> = {
  SEC: SEC_CHALLENGES, RES: {}, PERF: {}, COST: {},
};

function ConsolePanel({ backendUrl: _backendUrl, userEmail: _userEmail }: { backendUrl: string; userEmail: string }) {
  const [activeCategory, setActiveCategory] = useState<'SEC' | 'RES' | 'PERF' | 'COST'>('SEC');
  const [activeSubIdx, setActiveSubIdx] = useState<number | null>(null);
  const [stepIdx, setStepIdx] = useState(0);
  const [history, setHistory] = useState<ChalLine[]>([]);
  const [status, setStatus] = useState<ChalStatus>('idle');
  const [pendingOutput, setPendingOutput] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [cmdHistIdx, setCmdHistIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scenario = activeSubIdx !== null ? (CHALLENGE_SCENARIOS[activeCategory]?.[activeSubIdx] ?? null) : null;
  const currentStep = scenario ? scenario.steps[stepIdx] : null;
  const challengeSolved = status === 'solved';
  const showHint = attempts >= 2 && status === 'idle' && !challengeSolved;

  // Reset on challenge change
  useEffect(() => {
    if (!scenario) return;
    setStepIdx(0);
    setHistory([{ kind: 'step', num: 1, title: scenario.steps[0].title, total: scenario.steps.length }]);
    setStatus('idle');
    setInput('');
    setAttempts(0);
    setPendingOutput([]);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [activeCategory, activeSubIdx]);

  // Animate output lines
  useEffect(() => {
    if (status !== 'animating' || pendingOutput.length === 0) return;
    const timer = setTimeout(() => {
      setHistory(h => [...h, { kind: 'out', text: pendingOutput[0] }]);
      const rest = pendingOutput.slice(1);
      setPendingOutput(rest);
      if (rest.length === 0) {
        const isLast = stepIdx === (scenario?.steps.length ?? 0) - 1;
        setStatus(isLast ? 'solved' : 'transitioning');
      }
    }, 70);
    return () => clearTimeout(timer);
  }, [status, pendingOutput, stepIdx, scenario]);

  // Transition between steps
  useEffect(() => {
    if (status !== 'transitioning' || !scenario) return;
    const timer = setTimeout(() => {
      const nextIdx = stepIdx + 1;
      setHistory(h => [...h, { kind: 'step', num: nextIdx + 1, title: scenario.steps[nextIdx].title, total: scenario.steps.length }]);
      setStepIdx(nextIdx);
      setAttempts(0);
      setStatus('idle');
      setTimeout(() => inputRef.current?.focus(), 50);
    }, 700);
    return () => clearTimeout(timer);
  }, [status, stepIdx, scenario]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, status]);

  const handleSubmit = () => {
    const cmd = input.trim();
    if (!cmd || status !== 'idle' || !currentStep) return;
    setCmdHistory(prev => [cmd, ...prev.slice(0, 49)]);
    setCmdHistIdx(-1);
    const correct = currentStep.answers.some(a => normCmd(cmd) === normCmd(a));
    setHistory(h => [...h, { kind: 'cmd', text: cmd, ok: correct }]);
    setInput('');
    if (correct) {
      const out = currentStep.successOutput.length > 0 ? currentStep.successOutput : [''];
      setPendingOutput(out);
      setStatus('animating');
    } else {
      setHistory(h => [...h, { kind: 'err', text: `command not found or incorrect. hint: ${currentStep.hint}` }]);
      setAttempts(a => a + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { handleSubmit(); return; }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const i = Math.min(cmdHistIdx + 1, cmdHistory.length - 1);
      setCmdHistIdx(i);
      setInput(cmdHistory[i] || '');
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const i = Math.max(cmdHistIdx - 1, -1);
      setCmdHistIdx(i);
      setInput(i === -1 ? '' : cmdHistory[i]);
    }
  };

  const handleSelectChallenge = (n: number) => {
    if (challengeSolved && scenario) setCompleted(prev => new Set([...prev, scenario.id]));
    setActiveSubIdx(n);
  };

  const catColor = CAT_COLORS[activeCategory];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0d1117', fontFamily: 'monospace', overflow: 'hidden' }}>

      {/* Category tabs */}
      <div style={{ background: '#161b22', borderBottom: '1px solid #30363d', padding: '10px 16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
        {(['SEC', 'RES', 'PERF', 'COST'] as const).map(cat => (
          <button key={cat} type="button"
            onClick={() => { setActiveCategory(cat); setActiveSubIdx(null); }}
            style={{
              padding: '5px 16px', borderRadius: '6px',
              border: `1.5px solid ${activeCategory === cat ? CAT_COLORS[cat] : '#30363d'}`,
              background: activeCategory === cat ? CAT_COLORS[cat] + '22' : 'transparent',
              color: activeCategory === cat ? CAT_COLORS[cat] : '#8b949e',
              fontSize: '13px', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.5px',
            }}>
            {cat}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', color: '#484f58', fontSize: '11px' }}>
          {completed.size} solved
        </span>
      </div>

      {/* Sub-challenge buttons 1-30 */}
      <div style={{ background: '#0d1117', borderBottom: '1px solid #30363d', padding: '8px 16px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
        {Array.from({ length: 30 }, (_, i) => i + 1).map(n => {
          const id = `${activeCategory}-${n}`;
          const isDone = completed.has(id);
          const isActive = activeSubIdx === n;
          const hasContent = !!CHALLENGE_SCENARIOS[activeCategory]?.[n];
          return (
            <button key={n} type="button"
              onClick={() => handleSelectChallenge(n)}
              style={{
                width: '30px', height: '30px', borderRadius: '4px', border: 'none',
                background: isDone ? catColor + '33' : isActive ? catColor : '#21262d',
                color: isDone ? catColor : isActive ? '#fff' : hasContent ? '#8b949e' : '#3d444d',
                fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                outline: isDone ? `1px solid ${catColor}55` : 'none',
              }}>
              {isDone ? '✓' : n}
            </button>
          );
        })}
      </div>

      {/* No challenge selected */}
      {!scenario && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#484f58', fontSize: '13px' }}>
          번호를 선택하면 시나리오가 시작됩니다
        </div>
      )}

      {/* Challenge area */}
      {scenario && (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>

          {/* Scenario info card */}
          <div style={{ background: '#161b22', borderBottom: '1px solid #30363d', padding: '12px 16px', flexShrink: 0 }}>
            <div style={{ color: catColor, fontWeight: 700, fontSize: '13px', marginBottom: '4px' }}>
              {challengeSolved ? '✅ ' : ''}{scenario.title}
            </div>
            <div style={{ color: '#8b949e', fontSize: '12px', lineHeight: 1.6, marginBottom: '6px' }}>
              {scenario.scenario}
            </div>
            {!challengeSolved && currentStep && (
              <div style={{ background: '#0d1117', border: `1px solid ${catColor}44`, borderRadius: '6px', padding: '8px 12px' }}>
                <span style={{ color: catColor, fontSize: '11px', fontWeight: 700 }}>
                  Step {stepIdx + 1} / {scenario.steps.length} — {currentStep.title}
                </span>
                <div style={{ color: '#e6edf3', fontSize: '12px', marginTop: '2px' }}>{currentStep.desc}</div>
                {showHint && (
                  <div style={{ marginTop: '6px', color: '#8b949e', fontSize: '12px' }}>
                    hint: <code style={{ color: '#e3b341' }}>{currentStep.hint}</code>
                  </div>
                )}
              </div>
            )}
            {challengeSolved && (
              <div style={{ background: '#1a2a1a', border: '1px solid #3fb95044', borderRadius: '6px', padding: '8px 12px' }}>
                <div style={{ color: '#3fb950', fontSize: '11px', fontWeight: 700, marginBottom: '4px' }}>해설</div>
                <div style={{ color: '#8b949e', fontSize: '12px', lineHeight: 1.6 }}>{scenario.explanation}</div>
                {activeSubIdx !== null && activeSubIdx < 30 && (
                  <button type="button"
                    onClick={() => { setCompleted(prev => new Set([...prev, scenario.id])); handleSelectChallenge(activeSubIdx + 1); }}
                    style={{ marginTop: '8px', background: catColor, border: 'none', color: '#fff', padding: '4px 12px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', fontWeight: 700 }}>
                    다음 →
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Terminal output */}
          <div onClick={() => !challengeSolved && inputRef.current?.focus()}
            style={{ flex: 1, overflowY: 'auto', padding: '10px 16px', fontSize: '13px', lineHeight: 1.6, cursor: challengeSolved ? 'default' : 'text' }}>
            {history.map((line, i) => {
              if (line.kind === 'step') return (
                <div key={i} style={{ color: '#484f58', fontSize: '11px', margin: '8px 0 4px' }}>
                  ── Step {line.num}/{line.total}: {line.title} ──
                </div>
              );
              if (line.kind === 'cmd') return (
                <div key={i} style={{ marginBottom: '2px' }}>
                  <span style={{ color: '#3fb950' }}>$ </span>
                  <span style={{ color: line.ok ? '#e6edf3' : '#f85149' }}>{line.text}</span>
                </div>
              );
              if (line.kind === 'out') return (
                <div key={i} style={{ color: outColor(line.text), whiteSpace: 'pre-wrap', wordBreak: 'break-all', marginBottom: '1px' }}>
                  {line.text}
                </div>
              );
              if (line.kind === 'err') return (
                <div key={i} style={{ color: '#f85149', fontSize: '12px', marginBottom: '2px' }}>{line.text}</div>
              );
              return null;
            })}
            {status === 'transitioning' && (
              <div style={{ color: '#484f58', fontSize: '12px', marginTop: '4px' }}>다음 스텝으로 이동 중...</div>
            )}
            {status === 'animating' && pendingOutput.length > 0 && (
              <div style={{ color: '#484f58', fontSize: '12px' }}>...</div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          {!challengeSolved && (
            <div style={{ borderTop: '1px solid #30363d', padding: '10px 16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ color: '#3fb950', flexShrink: 0 }}>$</span>
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={status !== 'idle'}
                placeholder="AWS CLI 명령어 입력..."
                autoFocus
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#e6edf3', fontSize: '13px', fontFamily: 'monospace' }}
              />
              <button type="button" onClick={handleSubmit}
                disabled={status !== 'idle' || !input.trim()}
                style={{ background: catColor, border: 'none', color: '#fff', padding: '4px 14px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', opacity: status !== 'idle' || !input.trim() ? 0.4 : 1, fontWeight: 700 }}>
                실행
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
'''

with open('src/web-app.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find start: `\nconst CAT_COLORS`
# Find end: closing brace of ConsolePanel function
start_marker = '\nconst CAT_COLORS'
start = content.find(start_marker)
if start == -1:
    print('ERROR: start marker not found')
    exit(1)

# Find end of ConsolePanel function — look for the closing } of the function
# after "function ConsolePanel"
func_marker = 'function ConsolePanel('
func_pos = content.find(func_marker, start)
if func_pos == -1:
    print('ERROR: function ConsolePanel not found')
    exit(1)

# Find matching closing brace
depth = 0
i = content.find('{', func_pos)
while i < len(content):
    if content[i] == '{':
        depth += 1
    elif content[i] == '}':
        depth -= 1
        if depth == 0:
            end = i + 1
            break
    i += 1
else:
    print('ERROR: could not find end of ConsolePanel')
    exit(1)

print(f'Replacing content[{start}:{end}]')
new_content = content[:start] + NEW_CONSOLE + content[end:]

with open('src/web-app.tsx', 'w', encoding='utf-8') as f:
    f.write(new_content)

print(f'Done. File size: {len(new_content)} chars')
