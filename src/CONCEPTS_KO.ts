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

export const CONCEPTS_KO: Record<string, Concept> = {
  ec2: {
    title: "Amazon EC2",
    subtitle: "탄력적 컴퓨팅 클라우드",
    easy: "EC2는 인터넷 위의 내 컴퓨터예요! 집에 있는 PC처럼 켜고 끌 수 있는데, AWS 데이터센터에 있어요. 쓴 만큼만 돈을 내요. 항상 써야 한다면 미리 예약해서 최대 72%까지 아낄 수 있어요.",
    points: [
      {
        label: "인스턴스 구매 옵션",
        text: "온디맨드(유연), 예약(1~3년 약정, 최대 72% 절감), 스팟(최대 90% 절감, 언제든 종료 가능), 전용 호스트(물리 서버 단독 사용)",
        easy: "렌터카 같아요! 온디맨드는 당일 렌트(비쌈), 예약은 1년 계약(저렴), 스팟은 초특가이지만 언제든 뺏길 수 있어요."
      },
      {
        label: "AMI",
        text: "Amazon Machine Image. 인스턴스 OS/소프트웨어 템플릿. 커스텀 AMI로 빠른 배포 가능. 리전 간 복사 가능",
        easy: "쿠키 커터예요! 커터(AMI)를 한 번 만들면 똑같은 쿠키(서버)를 원하는 만큼 빠르게 찍어낼 수 있어요."
      },
      {
        label: "배치 그룹",
        text: "클러스터(동일 AZ, 낮은 지연), 분산(다른 하드웨어, 장애 격리), 파티션(대규모 분산 시스템)",
        easy: "교실 자리 배치 같아요! 클러스터는 모여 앉기(빠른 통신), 분산은 멀리 앉기(한 명 결석해도 다른 팀에 영향 없음)."
      },
      {
        label: "스토리지",
        text: "EBS(영구 블록), 인스턴스 스토어(임시, 빠름), EFS(공유 파일 시스템)",
        easy: "EBS는 개인 사물함(꺼도 유지), 인스턴스 스토어는 책상 위 메모(꺼지면 사라짐), EFS는 공유 캐비닛(여러 명이 사용)."
      },
      {
        label: "시험 포인트",
        text: "스팟 인스턴스 종료: 2분 전 경고. 예약 인스턴스는 AZ 또는 리전 범위. 최대 절전 모드는 중지 중에도 RAM 유지",
        easy: "스팟은 빈 노래방 같아요 — 다른 사람이 예약하면 2분 안에 나가야 해요! 최대 절전 모드는 노트북 슬립 모드 — 다시 켜면 모든 게 그대로예요."
      }
    ]
  },
  lambda: {
    title: "AWS Lambda",
    subtitle: "서버리스 함수 실행",
    easy: "Lambda는 심부름꾼이에요! 파일이 업로드되면 달려와서 일을 처리하고 사라져요. 계속 켜둘 필요가 없으니 비용이 거의 없어요!",
    points: [
      {
        label: "실행 제한",
        text: "최대 실행 시간 15분, 메모리 128MB~10GB, /tmp 스토리지 512MB~10GB, 기본 동시 실행 1000",
        easy: "Lambda는 단거리 선수예요. 15분 안에 끝내야 해요. 긴 작업은 ECS를 쓰세요."
      },
      {
        label: "트리거",
        text: "API Gateway, S3, DynamoDB Streams, SQS, SNS, EventBridge, ALB, Cognito 등",
        easy: "알람이에요! '파일 업로드됨', '메시지 도착' 같은 신호가 오면 자동으로 깨어나서 일해요."
      },
      {
        label: "동시성",
        text: "예약 동시성(최대 동시 실행 제한), 프로비저닝된 동시성(콜드 스타트 방지, 사전 준비)",
        easy: "예약은 '최대 심부름꾼 10명' 같은 제한 설정, 프로비저닝은 미리 대기시켜 놓는 거예요."
      },
      {
        label: "배포",
        text: "Zip 파일 또는 컨테이너 이미지(최대 10GB). Lambda Layer로 공통 라이브러리 공유",
        easy: "Zip은 도시락 싸서 보내기, 컨테이너 이미지는 식당 통째로 배달. Layer는 공용 도구 창고예요."
      },
      {
        label: "시험 포인트",
        text: "VPC에 배포 시 ENI 생성 → 콜드 스타트 증가. 15분 초과 작업은 ECS/Fargate 사용. SQS로 배치 처리 가능",
        easy: "Lambda를 VPC 안에 넣으면 콜드 스타트가 길어져요. 15분 초과 작업은 ECS한테 맡기세요!"
      }
    ]
  },
  s3: {
    title: "Amazon S3",
    subtitle: "단순 스토리지 서비스",
    easy: "S3는 거대한 인터넷 창고예요! 사진, 동영상, 파일 뭐든 무제한으로 저장할 수 있어요. 자주 꺼내는 건 입구 근처(스탠다드), 거의 안 꺼내는 건 창고 깊숙이(Glacier) 두면 비용을 아낄 수 있어요.",
    points: [
      {
        label: "스토리지 클래스",
        text: "스탠다드 → 스탠다드-IA → 원존-IA → Glacier 즉시 → Glacier 유연 → 딥 아카이브 (비용 순서)",
        easy: "집 정리랑 같아요! 자주 쓰는 건 거실(스탠다드), 가끔 쓰는 건 창고(IA), 거의 안 쓰는 건 지하 냉동실(Glacier). 멀수록 불편하지만 더 저렴해요."
      },
      {
        label: "보안",
        text: "버킷 정책(리소스 기반), IAM 정책(사용자 기반), ACL(레거시), 프리사인드 URL(임시 접근), OAC",
        easy: "버킷 정책은 창고 문 규칙, IAM은 직원 사원증, 프리사인드 URL은 임시 방문증이에요."
      },
      {
        label: "기능",
        text: "버전 관리, MFA 삭제, 복제(CRR/SRR), 수명 주기(자동 전환/삭제)",
        easy: "구글 독스 버전 기록 같아요! 이전 버전이 보존되니 실수로 삭제해도 복구할 수 있어요."
      },
      {
        label: "성능",
        text: "프리픽스당 초당 3,500 PUT / 5,500 GET. 멀티파트 업로드(100MB 이상 권장, 5GB 이상 필수)",
        easy: "큰 택배를 조각내서 동시에 보내기(멀티파트). 여러 박스 = 더 빠름!"
      },
      {
        label: "시험 포인트",
        text: "S3 버킷은 글로벌이지만 데이터는 리전에 저장됨. CORS 설정. 정적 웹사이트 호스팅 가능",
        easy: "S3 버킷 이름은 전 세계에서 유일해야 해요. 데이터는 내가 선택한 리전에 저장돼요."
      }
    ]
  },
  rds: {
    title: "Amazon RDS",
    subtitle: "관계형 데이터베이스 서비스",
    easy: "RDS는 엑셀처럼 정리된 데이터 창고예요! AWS가 관리해주니 백업은 자동이에요. Multi-AZ는 같은 내용을 다른 창고에도 보관하고, 읽기 복제본은 읽기 전용 사본을 여러 개 만들어줘요.",
    points: [
      {
        label: "Multi-AZ",
        text: "동기 복제(대기). 장애 시 자동 페일오버 60~120초. 읽기 접근 불가(대기 중). DNS 레코드 변경",
        easy: "비상 백업 병원이에요! 메인 병원이 문 닫으면 1~2분 안에 백업 병원이 자동으로 열려요. 백업 병원은 평소엔 그냥 대기해요."
      },
      {
        label: "읽기 복제본",
        text: "비동기 복제. 읽기 분산용. 다른 리전도 가능. 독립 DB로 승격 가능. 최대 5개",
        easy: "교과서 복사본이에요! 원본이 바쁠 때 여러 사본으로 다 같이 읽을 수 있어요."
      },
      {
        label: "백업",
        text: "자동 백업(1~35일), 수동 스냅샷(무기한 보존)",
        easy: "자동 백업은 매일 자동으로 찍히는 사진, 스냅샷은 내가 직접 찍어서 영원히 보관하는 사진이에요."
      },
      {
        label: "암호화",
        text: "생성 시 KMS 암호화 설정. 이후 변경 불가(스냅샷 → 복사 → 암호화된 복원 필요)",
        easy: "금고 만들 때만 잠금 방식을 선택할 수 있어요. 나중에 바꾸려면 내용물을 꺼내서 새 금고에 넣어야 해요."
      },
      {
        label: "시험 포인트",
        text: "Multi-AZ ≠ 읽기 분산(그건 읽기 복제본). Lambda 연결 풀링엔 RDS Proxy. 스토리지 자동 스케일",
        easy: "Multi-AZ는 '안전'(백업), 읽기 복제본은 '속도'(분산). 시험에 꼭 나와요!"
      }
    ]
  },
  aurora: {
    title: "Amazon Aurora",
    subtitle: "AWS 최적화 관계형 데이터베이스",
    easy: "Aurora는 RDS 슈퍼 버전이에요! 3개 AZ에 걸쳐 6개 사본을 저장해요. MySQL보다 5배 빠르지만 비슷한 가격이에요!",
    points: [
      {
        label: "아키텍처",
        text: "스토리지 자동 10GB~128TB. 3개 AZ에 6개 사본. 2개 장애에도 쓰기 가능, 3개 장애에도 읽기 가능",
        easy: "같은 책을 도서관 3곳에 6권씩 두는 것처럼요. 도서관 2곳이 불타도 책은 안전해요."
      },
      {
        label: "성능",
        text: "MySQL보다 5배, PostgreSQL보다 3배 빠름. Aurora 병렬 쿼리",
        easy: "일반 RDS가 자전거라면 Aurora는 스포츠카예요. MySQL 코드가 5배 빠르게 돌아요!"
      },
      {
        label: "기능",
        text: "Aurora Serverless v2: 자동 스케일링. 글로벌 데이터베이스: 1초 미만 리전 간 복제",
        easy: "Serverless v2는 고객 수에 따라 자동으로 테이블을 조정해줘요. 글로벌 DB는 한국→미국을 1초 이내에 반영해요."
      },
      {
        label: "Aurora vs RDS",
        text: "Aurora: 고성능/고가용성이 필요할 때. RDS: Oracle, SQL Server 같은 특정 엔진이 필요할 때",
        easy: "Aurora는 AWS의 특별 고성능 엔진, RDS는 특정 회사 DB가 필요할 때 써요."
      },
      {
        label: "시험 포인트",
        text: "Aurora 복제본은 동일 스토리지 공유(복제 지연 없음). Backtrack으로 특정 시점으로 되감기 가능",
        easy: "Aurora 복제본은 같은 창고를 쓰니까 복사 시간이 0에 가까워요."
      }
    ]
  },
  vpc: {
    title: "Amazon VPC",
    subtitle: "가상 사설 클라우드",
    easy: "VPC는 AWS 안에 내가 울타리 친 동네예요! 퍼블릭 서브넷은 인터넷에서 접근 가능, 프라이빗 서브넷은 내부에서만 접근 가능해요.",
    points: [
      {
        label: "구성 요소",
        text: "서브넷(퍼블릭/프라이빗), 라우팅 테이블, IGW, NAT 게이트웨이, VPC 피어링",
        easy: "공용 구역은 외부인도 접근 가능, 사유지는 주민만 가능해요. IGW는 정문, NAT는 쪽문이에요."
      },
      {
        label: "보안",
        text: "보안 그룹: 스테이트풀, 허용만 가능. NACL: 스테이트리스, 허용+거부, 서브넷 레벨",
        easy: "SG는 집 현관문(자동 허용), NACL은 동네 경비원(양방향 확인). SG는 허용만, NACL은 거부도 해요."
      },
      {
        label: "연결",
        text: "VPN, 다이렉트 커넥트(전용선), 트랜짓 게이트웨이(여러 VPC 허브 연결)",
        easy: "VPN은 일반 도로, 다이렉트 커넥트는 전용 고속도로, 트랜짓 게이트웨이는 허브 교차로예요."
      },
      {
        label: "엔드포인트",
        text: "게이트웨이 엔드포인트: S3, DynamoDB(무료). 인터페이스 엔드포인트: 그 외(ENI, 비용 발생)",
        easy: "VPC 안에서 S3에 접근할 때 게이트웨이 엔드포인트는 무료 지점 사무소 같아요!"
      },
      {
        label: "시험 포인트",
        text: "SG는 스테이트풀, NACL은 스테이트리스. NAT 게이트웨이는 퍼블릭 서브넷에 위치",
        easy: "SG는 영리함(자동 허용), NACL은 까다로움(양방향 설정 필수). NAT는 공용 구역에 설치해야 해요!"
      }
    ]
  },
  iam: {
    title: "AWS IAM",
    subtitle: "신원 및 접근 관리",
    easy: "IAM은 회사 사원증 관리 시스템이에요! 직원마다 ID를 주고, 팀별로 권한을 묶어서 관리해요.",
    points: [
      {
        label: "구성 요소",
        text: "사용자(개인), 그룹(집합), 역할(임시 권한 위임), 정책(JSON 권한 문서)",
        easy: "사용자는 직원, 그룹은 팀, 역할은 임시 사원증, 정책은 규칙집이에요."
      },
      {
        label: "정책 유형",
        text: "자격 증명 기반, 리소스 기반, 권한 경계, SCP(Organizations)",
        easy: "자격 증명 기반은 직원 사원증 권한, 리소스 기반은 문 안내 표지판, SCP는 회사 최상위 규칙이에요."
      },
      {
        label: "STS",
        text: "AssumeRole로 임시 자격 증명 발급. 교차 계정 접근, EC2 인스턴스 프로파일, 웹 자격 증명 연동",
        easy: "STS는 임시 출입증 발급기예요! 다른 계정이나 외부인에게 시간 제한 임시 출입증을 발급해요."
      },
      {
        label: "모범 사례",
        text: "루트 계정 미사용, MFA, 최소 권한 원칙, 액세스 키 교체, CloudTrail로 감사",
        easy: "루트 계정은 CEO 도장 — 매일 쓰면 안 돼요. 최소한의 권한만 부여하세요!"
      },
      {
        label: "시험 포인트",
        text: "정책 평가: 명시적 거부 > SCP > 권한 경계 > 자격 증명 > 리소스 정책",
        easy: "명시적 거부가 있으면 무조건 차단돼요! 다른 허용이 있어도 거부 하나면 끝이에요."
      }
    ]
  },
  sqs: {
    title: "Amazon SQS",
    subtitle: "단순 대기열 서비스",
    easy: "SQS는 우편함이에요! 편지를 넣어두면 배달부가 꺼내서 나중에 처리해요. 바빠도 편지가 안전하게 보관돼요!",
    points: [
      {
        label: "유형",
        text: "스탠다드: 최소 1회 전달(중복 가능), 순서 보장 없음, 고처리량. FIFO: 정확히 1회, 순서 보장, 300~3000 TPS",
        easy: "스탠다드는 일반 우편(빠르지만 두 번 올 수도 있음), FIFO는 등기 우편(느리지만 정확히 1번, 순서 보장)."
      },
      {
        label: "주요 설정",
        text: "가시성 타임아웃(기본 30초), 메시지 보존 기간(1분~14일), 최대 크기: 256KB",
        easy: "가시성 타임아웃은 배달부가 편지를 집으면 다른 사람이 못 보게 잠시 숨기는 거예요."
      },
      {
        label: "DLQ",
        text: "데드 레터 큐. 실패한 메시지 격리. maxReceiveCount 초과 시 이동",
        easy: "배달 실패 전용 우편함이에요. 왜 배달에 실패했는지 나중에 확인할 수 있어요."
      },
      {
        label: "롱 폴링",
        text: "빈 큐 폴링을 줄여 비용 절감. WaitTimeSeconds 1~20초. 숏 폴링보다 권장",
        easy: "숏 폴링은 매초 확인, 롱 폴링은 '최대 20초까지 편지 오길 기다림'이에요."
      },
      {
        label: "시험 포인트",
        text: "SQS → Lambda 배치 처리. 팬아웃: SNS → 여러 SQS. FIFO는 .fifo 접미사 필요",
        easy: "팬아웃은 SNS가 방송하면 여러 SQS가 동시에 수신하는 거예요."
      }
    ]
  },
  cloudwatch: {
    title: "Amazon CloudWatch",
    subtitle: "모니터링 및 관찰 서비스",
    easy: "CloudWatch는 AWS의 CCTV + 경보 시스템이에요! 서버 상태를 지켜보다가 뭔가 잘못되면 알림을 보내줘요!",
    points: [
      {
        label: "지표",
        text: "기본 5분(무료), 상세 1분(유료). 커스텀 지표 가능",
        easy: "기본 CCTV는 5분마다 사진 찍기(무료), HD는 1분마다 찍기(유료)예요."
      },
      {
        label: "로그",
        text: "로그 그룹 → 로그 스트림. 로그 인사이트로 쿼리. 지표 필터로 로그→지표 변환",
        easy: "로그 그룹은 일기장, 로그 스트림은 날짜별 페이지예요. 인사이트는 구글처럼 검색할 수 있어요."
      },
      {
        label: "알람",
        text: "OK/알람/데이터_부족. 작업: SNS, EC2 중지/종료, ASG 스케일링",
        easy: "CPU가 90% 초과하면 문자 알림! 심각하면 서버를 자동 증설해요(ASG)."
      },
      {
        label: "이벤트/EventBridge",
        text: "AWS 이벤트 감지 → 자동화. Cron/Rate 일정 실행",
        easy: "'매일 밤 12시에 백업' 같은 자동화 규칙을 설정해요."
      },
      {
        label: "시험 포인트",
        text: "EC2 메모리/디스크는 기본 지표 아님 → CloudWatch 에이전트 필요. 교차 계정 수집 가능",
        easy: "EC2 메모리 모니터링은 에이전트 설치가 필요해요! 시험에 자주 나와요."
      }
    ]
  },
  elb: {
    title: "AWS Elastic Load Balancer",
    subtitle: "로드 밸런싱 서비스",
    easy: "ELB는 교통 정리원이에요! 고객 트래픽을 여러 서버에 분산시켜 하나의 서버가 과부하되지 않도록 해줘요.",
    points: [
      {
        label: "유형",
        text: "ALB(애플리케이션, 7계층), NLB(네트워크, 4계층), CLB(클래식, 4/7계층, 레거시)",
        easy: "ALB는 웹 앱용(스마트), NLB는 극한 속도(단순하지만 빠름), CLB는 구버전이에요."
      },
      {
        label: "헬스 체크",
        text: "서버를 정기적으로 테스트. 비정상 인스턴스 제거. 정상 인스턴스 재추가",
        easy: "서버에 계속 핑을 보내서 — 응답 없으면 트래픽 전송을 중단해요."
      },
      {
        label: "고정 세션",
        text: "쿠키 기반 고정 세션: 동일 고객은 같은 서버로. 세션 데이터에 유용",
        easy: "식당 단골처럼 — 단골 고객은 단골 자리로 안내해줘요."
      },
      {
        label: "교차 AZ 로드 밸런싱",
        text: "AZ 전반에 고르게 트래픽 분산. 소액 비용이지만 가용성 향상",
        easy: "여러 가용 영역에 고르게 분산하면 하나의 AZ 장애에도 영향이 적어요."
      },
      {
        label: "시험 포인트",
        text: "마이크로서비스에는 ALB(호스트명 라우팅). 극한 처리량에는 NLB. 대상 그룹 헬스",
        easy: "ALB는 스마트 라우팅, NLB는 엄청 빠름, CLB는 잊어버리세요!"
      }
    ]
  },
  dynamodb: {
    title: "Amazon DynamoDB",
    subtitle: "서버리스 NoSQL 데이터베이스",
    easy: "DynamoDB는 서랍장 같아요! 각 서랍(아이템)에 뭐든 자유롭게 넣을 수 있고, 초당 수백만 번 읽고 쓸 수 있어요!",
    points: [
      {
        label: "용량 모드",
        text: "온디맨드: 트래픽 자동 처리, 예측 불가 워크로드. 프로비저닝: RCU/WCU 설정, 저렴, 자동 스케일링",
        easy: "온디맨드는 고객이 몇 명이든 자동 처리(비쌈), 프로비저닝은 100명 분량 미리 계획(저렴하지만 초과 시 오류)."
      },
      {
        label: "키",
        text: "파티션 키(필수), 정렬 키(선택). 둘을 합쳐 고유 식별자 구성",
        easy: "파티션 키는 서랍장 서랍, 정렬 키는 서랍 안의 파일 순서예요."
      },
      {
        label: "인덱스",
        text: "GSI(글로벌 보조 인덱스): 다른 파티션/정렬 키. LSI(로컬): 같은 파티션, 다른 정렬",
        easy: "GSI는 완전히 새로운 파일 시스템, LSI는 같은 서랍의 재정렬이에요."
      },
      {
        label: "TTL",
        text: "Time To Live. 타임스탬프 이후 아이템 자동 삭제. 스토리지 비용 절감",
        easy: "유통기한 같아요 — 오래된 아이템을 자동으로 삭제해요."
      },
      {
        label: "시험 포인트",
        text: "DynamoDB Streams로 CDC(변경 데이터 캡처) → Lambda. 예측 불가 패턴엔 온디맨드",
        easy: "Streams는 변경을 감지해서 Lambda를 트리거해요. 패턴 모를 땐 온디맨드."
      }
    ]
  },
  kms: {
    title: "AWS Key Management Service",
    subtitle: "암호화 키 관리",
    easy: "KMS는 열쇠 제조 서비스예요! 암호화 키를 만들고 관리해요. 고객 관리형 키로 민감한 데이터를 암호화해요.",
    points: [
      {
        label: "키 유형",
        text: "AWS 관리형(무료), 고객 관리형(사용 시 과금), AWS 소유형(제어 불가)",
        easy: "AWS 관리형 = 무료 집 자물쇠, 고객 관리형 = 내가 자물쇠 제어, AWS 소유형 = AWS 자물쇠."
      },
      {
        label: "키 교체",
        text: "매년 자동 교체. 필요 시 수동 교체. 하위 호환 가능",
        easy: "사무실 자물쇠를 매년 교체하는 것처럼 — 이전 키도 여전히 작동해요(하위 호환)."
      },
      {
        label: "권한 부여",
        text: "키 접근을 임시로 위임. 교차 계정 접근에 유용",
        easy: "권한 변경 없이 일시적으로 다른 사람에게 열쇠를 빌려줘요."
      },
      {
        label: "암호화",
        text: "저장 중 데이터(S3, RDS, EBS) 및 전송 중 데이터(TLS/HTTPS) 암호화",
        easy: "저장 시 잠금, 전송 시도 잠금."
      },
      {
        label: "시험 포인트",
        text: "암호화엔 KMS. 제어엔 CMK(고객 마스터 키). 봉투 암호화",
        easy: "제어 = CMK. 봉투 = 마스터 키로 데이터 키를 암호화."
      }
    ]
  },
  cloudfront: {
    title: "Amazon CloudFront",
    subtitle: "콘텐츠 전송 네트워크",
    easy: "CloudFront는 전 세계에 배송 지점이 있는 것 같아요! 도쿄의 사용자는 미국 서버가 아닌 도쿄 서버에서 콘텐츠를 받아요. 훨씬 빠르죠!",
    points: [
      {
        label: "엣지 로케이션",
        text: "전 세계 450개 이상의 엣지 로케이션. 정적 콘텐츠 캐시. 오리진: S3, EC2, ALB, 커스텀",
        easy: "편의점처럼 어디에나 있어요 — 가장 가까운 매장에서 콘텐츠를 제공해요."
      },
      {
        label: "캐싱",
        text: "기본 24시간. TTL 구성 가능. 와일드카드/경로로 캐시 무효화",
        easy: "빠른 속도를 위해 콘텐츠를 로컬에 캐시해요. 콘텐츠가 바뀌면 새로고침해요."
      },
      {
        label: "보안",
        text: "HTTPS/TLS. WAF 통합. 오리진 접근 제어(OAC). 필드 레벨 암호화",
        easy: "전송 중 데이터 보호. 공격 방지. 민감한 필드 암호화."
      },
      {
        label: "가격 등급",
        text: "전체: 모든 엣지 로케이션. 100: 비싼 리전 제외. 200: 가장 비싼 리전 제외",
        easy: "전체 = 가장 비쌈, 100 = 중간, 200 = 가장 저렴. 속도와 비용의 트레이드오프."
      },
      {
        label: "시험 포인트",
        text: "CloudFront vs S3: CF는 엣지 캐싱, S3는 스토리지. CF 무효화 = 캐시 새로고침",
        easy: "전 세계 속도가 필요하다면? CloudFront. 저장이 필요하다면? S3. 둘 다 쓰면 어떨까요?"
      }
    ]
  },
  route53: {
    title: "Amazon Route 53",
    subtitle: "도메인 이름 시스템 및 트래픽 라우팅",
    easy: "Route 53은 인터넷 전화번호부예요! www.example.com을 실제 IP 주소로 즉시 변환해줘요.",
    points: [
      {
        label: "라우팅 정책",
        text: "단순, 가중치, 지연 기반, 장애 조치, 지리적 위치, 지리적 근접성, 다중 값",
        easy: "가중치는 A/B 테스트, 지연 기반은 가장 빠른 서버, 장애 조치는 백업 서버로."
      },
      {
        label: "헬스 체크",
        text: "엔드포인트 모니터링. 전 세계 15개 헬스 체커. 장애 조치에 필수",
        easy: "30초마다 서버에 '살아있니?' 물어봐요. 응답 없으면 백업으로 라우팅해요."
      },
      {
        label: "레코드 유형",
        text: "A(IPv4), AAAA(IPv6), CNAME(도메인→도메인), Alias(AWS 리소스, 존 정점 호환, 무료)",
        easy: "A = 이름→주소, CNAME = 이름→다른 이름, Alias = AWS 전용으로 무료예요."
      },
      {
        label: "도메인",
        text: "도메인 구매 가능. 퍼블릭 vs 프라이빗 호스팅 영역. DNSSEC 지원",
        easy: "Route 53에서 도메인을 구매할 수 있어요. 프라이빗은 VPC 전용 내부 전화번호부예요."
      },
      {
        label: "시험 포인트",
        text: "ELB, CloudFront, S3에는 Alias. 존 정점에서 CNAME 불가. 항상 Alias 선택!",
        easy: "루트 도메인에서는 CNAME 불가, Alias만 가능! AWS 서비스는 항상 Alias 사용!"
      }
    ]
  },
  sns: {
    title: "Amazon SNS",
    subtitle: "단순 알림 서비스",
    easy: "SNS는 방송 시스템이에요! 마이크(토픽)에 대고 '점심 준비됐어요!'라고 외치면 모든 학생(구독자)이 동시에 들어요. SQS, Lambda, 이메일로 동시에 보낼 수 있어요!",
    points: [
      {
        label: "개요",
        text: "게시/구독 메시징. 게시자 → 토픽 → 구독자. 구독자: SQS, Lambda, 이메일, SMS, HTTP, Kinesis Firehose",
        easy: "라디오 방송 같아요! 방송국(게시자)이 전파(토픽)에 방송하면 라디오(구독자)들이 동시에 수신해요. 구독자는 얼마든지 추가할 수 있어요."
      },
      {
        label: "메시지 필터링",
        text: "구독별 필터 정책. 각 구독자는 조건에 맞는 메시지만 수신",
        easy: "이메일 필터 같아요 — 구독자는 필터 규칙에 맞는 메시지만 받아요."
      },
      {
        label: "전달",
        text: "HTTP 엔드포인트로 푸시, SQS에서 풀, Lambda 트리거, 이메일/SMS 알림",
        easy: "SNS는 다양한 곳으로 동시에 메시지를 밀어 넣어요 — 우편물 분류 센터 같아요."
      },
      {
        label: "팬아웃 패턴",
        text: "SNS → 여러 SQS로 병렬 처리. 각 SQS는 전체 메시지 사본을 받음",
        easy: "SNS 메시지 하나가 10개의 SQS로 팬아웃 — 하나의 공지가 10개 그룹으로 전달되는 것처럼요."
      },
      {
        label: "시험 포인트",
        text: "SNS 푸시 ≠ SQS 풀. 내구성 있는 비동기 처리엔 SNS-SQS 팬아웃. FIFO SNS-SQS 지원",
        easy: "SNS는 외침(푸시), SQS는 저장(풀). 합치면 = 내구성 있는 방송!"
      }
    ]
  },
  kinesis: {
    title: "Amazon Kinesis",
    subtitle: "실시간 데이터 스트리밍",
    easy: "Kinesis는 데이터를 위한 컨베이어 벨트예요! 대규모 데이터를 실시간으로 스트리밍해요. 정보를 위한 조립 라인 — 쉬지 않고 계속 흘러요.",
    points: [
      {
        label: "Kinesis 데이터 스트림",
        text: "생산자 → 샤드 → 소비자. 24시간 보존(구성 가능). 샤드 라우팅을 위한 파티션 키",
        easy: "고속도로의 차선 같아요. 각 차선은 독립적으로 트래픽을 처리해요. 데이터는 자동으로 차선에 배분돼요."
      },
      {
        label: "Kinesis Firehose",
        text: "S3, Redshift, Splunk, DataDog에 데이터 전달. 완전 관리형. ETL 선택 가능",
        easy: "창고로 가는 자동 컨베이어예요. 필요하면 데이터를 변환해요. 용량 관리 불필요."
      },
      {
        label: "소비자",
        text: "애플리케이션, Lambda, Kinesis Analytics, DynamoDB. 샤드당 병렬 소비",
        easy: "여러 작업자가 같은 차선을 독립적으로 처리해요. 대규모 병렬 처리."
      },
      {
        label: "스케일링",
        text: "샤드 추가로 스케일링. 샤드 = 1MB/초 쓰기. TPS = RPS x 레코드 크기",
        easy: "트래픽 증가? 차선(샤드)을 추가하세요. 각 차선은 1MB/초를 처리해요."
      },
      {
        label: "시험 포인트",
        text: "Kinesis Streams는 실시간용, Firehose는 전달용. SQS는 배치, Kinesis는 스트리밍",
        easy: "SQS = 배치 처리, Kinesis = 실시간 스트리밍. 다른 도구, 다른 속도!"
      }
    ]
  },
  elasticache: {
    title: "Amazon ElastiCache",
    subtitle: "인메모리 캐시 서비스",
    easy: "ElastiCache는 초고속 메모리 저장소예요! 자주 쓰는 책을 도서관 대신 책상 위에 두는 것과 같아요. Redis 또는 Memcached.",
    points: [
      {
        label: "엔진",
        text: "Redis: 데이터 구조, 영속성, 게시/구독. Memcached: 단순 키-값, 가장 빠름",
        easy: "Redis는 스마트 캐시(꺼도 데이터 유지), Memcached는 단순 캐시(꺼지면 데이터 소실)."
      },
      {
        label: "사용 사례",
        text: "세션 저장, 실시간 리더보드, DB 쿼리 캐싱, 속도 제한",
        easy: "'로그인 여부 기억', 게임 순위, 자주 쓰는 검색 결과 같은 것들이에요."
      },
      {
        label: "퇴출 정책",
        text: "LRU(최근 미사용), LFU(최저 사용 빈도), TTL(생존 시간)",
        easy: "메모리가 꽉 차면 가장 덜 쓰거나 오래된 항목을 삭제해요."
      },
      {
        label: "고가용성",
        text: "자동 장애 조치를 포함한 Multi-AZ. 수평 스케일링을 위한 클러스터 모드",
        easy: "백업 인스턴스 대기 중, 수평 스케일링으로 더 빠르게."
      },
      {
        label: "시험 포인트",
        text: "ElastiCache vs RDS: 속도엔 캐시, 저장엔 DB. 대용량엔 Redis 클러스터",
        easy: "속도 필요? 캐시. 데이터 필요? 데이터베이스. 둘 다? 같이 써요!"
      }
    ]
  },
  ebs: {
    title: "Amazon EBS",
    subtitle: "탄력적 블록 스토리지",
    easy: "EBS는 EC2를 위한 하드 드라이브예요! 인스턴스에 연결하고, 데이터를 영구 저장하고, 스냅샷으로 백업할 수 있어요.",
    points: [
      {
        label: "볼륨 유형",
        text: "gp3(범용, GB당 3 IOPS), gp2(구버전), io1(고 IOPS), st1(처리량), sc1(콜드)",
        easy: "gp3는 좋은 올라운더(신버전이 더 빠름), io1은 데이터베이스용(매우 빠름), st1은 넓은 고속도로, sc1은 백업용이에요."
      },
      {
        label: "스냅샷",
        text: "블록 레벨 증분 백업. 리전 간 복사 가능. 스냅샷으로 AMI 생성 가능",
        easy: "하드 드라이브 백업 같아요. 새로운 부분만 저장해요(증분). 복원하거나 이미지를 만들 수 있어요."
      },
      {
        label: "암호화",
        text: "생성 시 KMS로 암호화. 암호화된 스냅샷 복사 가능. 복사로 재암호화",
        easy: "생성할 때 암호화를 선택해요. 변경하려면 암호화된 볼륨으로 복사해야 해요."
      },
      {
        label: "성능",
        text: "볼륨 유형별 IOPS 및 처리량 제한. gp3는 분리 없이 수정 가능",
        easy: "각 볼륨에는 속도 제한이 있어요. gp3는 중지 없이 속도를 조정할 수 있어요."
      },
      {
        label: "시험 포인트",
        text: "EBS vs 인스턴스 스토어: EBS는 영속, 인스턴스 스토어는 소멸. 고성능엔 io1",
        easy: "EBS = 사물함(영속), 인스턴스 스토어 = 메모(소멸). 필요에 따라 선택하세요!"
      }
    ]
  },
  efs: {
    title: "Amazon EFS",
    subtitle: "탄력적 파일 시스템",
    easy: "EFS는 공유 파일 캐비닛 같아요! 여러 EC2 인스턴스가 같은 파일에 동시에 접근할 수 있어요. 공유 스토리지에 완벽해요.",
    points: [
      {
        label: "접근",
        text: "NFS 프로토콜. 서브넷의 마운트 타겟으로 연결. 자동 스케일링, 사전 프로비저닝 불필요",
        easy: "회사 사무실의 네트워크 드라이브 같아요. 여러 컴퓨터가 같은 파일을 공유해요."
      },
      {
        label: "성능 모드",
        text: "범용(기본, 대부분의 용도), Max IO(고동시성, 엔터프라이즈 앱)",
        easy: "범용은 일반 사용, Max IO는 무거운 워크로드용이에요."
      },
      {
        label: "처리량 모드",
        text: "버스팅(기본, 파일 수에 따라 스케일), 프로비저닝(고정 처리량)",
        easy: "버스팅은 자동으로 성장하고, 프로비저닝은 고정 속도를 설정해요."
      },
      {
        label: "스토리지 클래스",
        text: "스탠다드, 스탠다드-IA(비정기 접근). 수명 주기 정책으로 자동 전환",
        easy: "스탠다드는 자주 접근, IA는 드문 접근 — 더 저렴해요!"
      },
      {
        label: "시험 포인트",
        text: "EFS vs EBS: EFS는 공유, EBS는 단일 인스턴스. EFS가 더 비싸고, EBS가 더 빠름",
        easy: "EFS는 공유, EBS는 속도. 공유 = EFS, 속도 = EBS."
      }
    ]
  },
  cognito: {
    title: "Amazon Cognito",
    subtitle: "사용자 인증 및 권한 부여",
    easy: "Cognito는 앱의 로그인 시스템이에요! 사용자 가입, 로그인, MFA, 소셜 로그인(Google/Facebook) 등이 모두 내장되어 있어요.",
    points: [
      {
        label: "사용자 풀",
        text: "앱의 사용자 디렉터리. 사용자명/이메일 비밀번호. MFA 지원. 커스텀 속성",
        easy: "사용자 데이터베이스 같아요. 소셜 로그인 통합. 비밀번호 재설정 이메일."
      },
      {
        label: "자격 증명 풀",
        text: "임시 AWS 자격 증명. S3, DynamoDB 같은 AWS 서비스 접근. 역할 기반",
        easy: "로그인 후 AWS 서비스를 쓸 수 있는 열쇠를 받아요. 역할마다 다른 권한이에요."
      },
      {
        label: "MFA",
        text: "TOTP(인증 앱), SMS, 이메일. 백업 코드",
        easy: "추가 보안. 폰의 코드 + 비밀번호."
      },
      {
        label: "커스텀 인증 흐름",
        text: "인증 로직을 위한 커스텀 Lambda. 챌린지/응답",
        easy: "커스텀 로그인 규칙. 예: '회사 IP에서만 로그인 가능'."
      },
      {
        label: "시험 포인트",
        text: "사용자 풀은 로그인용, 자격 증명 풀은 AWS 접근용. Cognito = 인증, IAM = 권한",
        easy: "사용자 풀 = '당신은 누구인가요?', 자격 증명 풀 = '무엇을 할 수 있나요?'"
      }
    ]
  },
  ecs: {
    title: "Amazon ECS",
    subtitle: "탄력적 컨테이너 서비스",
    easy: "ECS는 컨테이너 관리 서비스예요! EC2 또는 Fargate(서버리스)에서 Docker 컨테이너를 실행해요. 오케스트레이션, 스케일링, 자동 재시작이 돼요.",
    points: [
      {
        label: "시작 유형",
        text: "EC2: 인스턴스 직접 관리. Fargate: 서버리스 컨테이너, 태스크당 과금",
        easy: "EC2 = 아파트 렌트 + 직접 관리. Fargate = 호텔방 + 호텔이 관리."
      },
      {
        label: "태스크 정의",
        text: "컨테이너 블루프린트. Docker 이미지, 메모리, CPU, 환경 변수 지정",
        easy: "컨테이너 레시피예요. Docker 이미지, 재료(메모리/CPU), 지침."
      },
      {
        label: "서비스",
        text: "태스크 관리. 자동 스케일링, 로드 밸런싱, 자가 복구. 원하는 개수",
        easy: "특정 수의 컨테이너를 유지해요. 실패하면 자동으로 재시작해요."
      },
      {
        label: "클러스터",
        text: "리소스 그룹(EC2 인스턴스 또는 Fargate). 네트워크 및 보안",
        easy: "여러 아파트(태스크)가 있는 건물 단지 같아요."
      },
      {
        label: "시험 포인트",
        text: "간편함엔 ECS Fargate. 비용 최적화엔 EC2. CloudWatch로 자동 스케일링",
        easy: "쉽게? Fargate. 저렴하게? EC2. CloudWatch 지표로 스케일링!"
      }
    ]
  },
  asg: {
    title: "Auto Scaling Group",
    subtitle: "자동 인스턴스 스케일링",
    easy: "ASG는 자동 채용/해고 시스템이에요! 바쁘면 서버를 추가하고(스케일 업), 한가하면 줄여요(스케일 다운). 자동 탄력성이에요.",
    points: [
      {
        label: "정책",
        text: "대상 추적: 지표를 특정 수준으로 유지. 단계 스케일링: 증분 단위로 스케일링. 단순: 단일 임계값",
        easy: "대상 = CPU 70% 유지. 단계 = 70% 초과 20%마다 +1 인스턴스. 단순 = 80% 초과 시 1개 추가."
      },
      {
        label: "수명 주기 후크",
        text: "시작/종료 중 커스텀 스크립트 실행. 정상 종료에 완벽",
        easy: "인스턴스가 꺼질 때 작별 음악 먼저 재생. 새 인스턴스 태어날 때 방을 준비."
      },
      {
        label: "헬스 체크",
        text: "ELB 헬스 체크, EC2 상태 체크. 비정상 인스턴스 자동 교체",
        easy: "인스턴스가 건강한지 계속 확인해요. 아픈 인스턴스는 교체해요."
      },
      {
        label: "쿨다운",
        text: "다음 스케일링 액션 전 대기 시간. 스래싱 방지",
        easy: "스케일링 후 다시 확인하기 전에 잠시 기다려요. 켰다 껐다를 반복하지 않도록."
      },
      {
        label: "시험 포인트",
        text: "고가용성을 위해 ELB와 함께 ASG. 정상 종료를 위한 수명 주기 후크",
        easy: "ASG + ELB = 자동 스케일링 + 로드 밸런싱. 완벽한 조합!"
      }
    ]
  },
  beanstalk: {
    title: "AWS Elastic Beanstalk",
    subtitle: "서비스형 플랫폼(PaaS)",
    easy: "Beanstalk은 가구가 딸린 아파트를 빌리는 것 같아요! 코드만 제공하면 Beanstalk이 서버, 데이터베이스, 스케일링, 모니터링을 알아서 처리해줘요.",
    points: [
      {
        label: "환경",
        text: "개발: 단일 인스턴스(저렴). 프로덕션: 로드 밸런싱(비싸지만 확장 가능)",
        easy: "개발 = 원룸, 프로덕션 = 집사 있는 대저택."
      },
      {
        label: "지원 플랫폼",
        text: "Node.js, Python, Ruby, Java, Go, .NET, Docker, 커스텀 플랫폼",
        easy: "여러 언어를 지원해요. 또는 자신의 Docker를 가져올 수 있어요."
      },
      {
        label: "배포",
        text: "Git 푸시, CLI, 콘솔. 자동 블루/그린 배포. 실패 시 롤백",
        easy: "GitHub 푸시처럼 배포해요. 자동으로 새 버전 테스트하고, 이전 버전도 대기시켜요."
      },
      {
        label: "커스터마이징",
        text: "환경 변수, .ebextensions 설정, web.config, procfile",
        easy: "필요하면 모든 걸 커스터마이즈할 수 있어요. 설정 파일이 동작을 제어해요."
      },
      {
        label: "시험 포인트",
        text: "빠른 PaaS 배포엔 Beanstalk. 내부적으로 CloudFormation 사용. 헬스 모니터링",
        easy: "Beanstalk = PaaS, EC2 = IaaS. Beanstalk이 더 쉽고, EC2는 더 많은 제어권."
      }
    ]
  },
  glacier: {
    title: "Amazon S3 Glacier",
    subtitle: "콜드 스토리지 서비스",
    easy: "Glacier는 냉동 창고예요! 매우 저렴하지만 꺼내는 데 시간이 걸려요. 거의 접근하지 않지만 반드시 보관해야 하는 데이터에 사용해요.",
    points: [
      {
        label: "검색 시간",
        text: "즉시: 1~5분. 유연: 3~5시간. 딥: 12시간",
        easy: "즉시는 빠른 해동, 유연은 하룻밤 해동, 딥은 다음 날 해동이에요."
      },
      {
        label: "볼트 잠금",
        text: "WORM(한 번 쓰고 여러 번 읽기) 적용. 컴플라이언스 잠금 불변",
        easy: "잠글 수 있는 금고처럼 — 한 번 잠그면 원해도 삭제 불가. 규정 준수용이에요."
      },
      {
        label: "수명 주기 정책",
        text: "설정된 날 이후 S3 → Glacier로 자동 이동. 스토리지 비용 80%+ 절감",
        easy: "오래된 파일이 자동으로 콜드 스토리지로 이동 — 오래된 서류를 보관함에 넣는 것처럼요."
      },
      {
        label: "복원",
        text: "일시적으로 S3에 복원. DynamoDB Streams로 복원 자동화 트리거",
        easy: "파일이 필요할 때 일시적으로 S3에 복원했다가 다시 Glacier로 보내요."
      },
      {
        label: "시험 포인트",
        text: "Glacier 즉시 vs 유연: 검색 시간 트레이드오프. 컴플라이언스엔 볼트 잠금",
        easy: "빠르게 필요? 즉시. 기다릴 수 있음? 유연(훨씬 저렴). 컴플라이언스? 잠그세요!"
      }
    ]
  },
  redshift: {
    title: "Amazon Redshift",
    subtitle: "데이터 웨어하우스 서비스",
    easy: "Redshift는 빅데이터 분석을 위한 거대한 창고예요! 대용량 데이터를 저렴하게 저장하고 빠르게 분석해요. 분석에서 RDS보다 훨씬 뛰어나요.",
    points: [
      {
        label: "아키텍처",
        text: "리더 노드(쿼리 라우팅) + 컴퓨트 노드(데이터 저장/쿼리). 컬럼형 스토리지",
        easy: "리더가 트래픽을 지시하고, 컴퓨트 노드가 무거운 작업을 해요. 행이 아닌 열로 정리해요(분석이 더 빠름)."
      },
      {
        label: "데이터 로딩",
        text: "S3, DynamoDB, EC2에서 COPY. 병렬 수집. 대량 작업이 빠름",
        easy: "S3에서 수천 행을 동시에 로드해요. 소형차 vs 대형 트럭 같은 차이."
      },
      {
        label: "성능",
        text: "압축으로 크기 10배 감소. 최적화를 위한 정렬 키와 배포 키",
        easy: "압축 = 파일 압축. 정렬 키 = 데이터 미리 정렬. 배포 = 데이터를 현명하게 나누기."
      },
      {
        label: "백업 및 복원",
        text: "S3로 자동 스냅샷. 리전 간 복사. 새 클러스터로 복원",
        easy: "S3로 자동 백업. 재해 시 다른 리전으로 복원 가능."
      },
      {
        label: "시험 포인트",
        text: "Redshift는 OLAP(분석), RDS는 OLTP(트랜잭션). 대용량 데이터엔 Redshift가 훨씬 저렴",
        easy: "Redshift = 분석 창고, RDS = 운영 데이터베이스. 다른 도구, 다른 용도!"
      }
    ]
  },
  directconn: {
    title: "AWS Direct Connect",
    subtitle: "전용 네트워크 연결",
    easy: "Direct Connect는 AWS로의 전용 고속도로예요! 인터넷 대신 전용선을 사용해요. 더 안전하고, 빠르고, 일관성이 있어요.",
    points: [
      {
        label: "연결 유형",
        text: "전용 연결: AWS가 포트 할당. 호스팅 연결: 3rd 파티 제공자가 할당",
        easy: "전용 = 자체 고속도로 진출입구. 호스팅 = 다른 사람과 고속도로 공유."
      },
      {
        label: "가상 인터페이스",
        text: "프라이빗 VIF: VPC 접근. 퍼블릭 VIF: AWS 퍼블릭 서비스. 트랜짓 VIF: 트랜짓 게이트웨이",
        easy: "프라이빗 = VPC로, 퍼블릭 = S3/DynamoDB로, 트랜짓 = 여러 VPC로."
      },
      {
        label: "장점",
        text: "감소된 대역폭 비용, 일관된 네트워크, 프라이빗, 낮은 지연, 고가용성",
        easy: "붐비는 버스 대신 전용 기차처럼요. 더 빠르고, 안정적이고, 프라이빗해요."
      },
      {
        label: "설정",
        text: "AWS에 주문, 제공자와 조율, 라우터 구성, 4~8주 소요 시간",
        easy: "설정에 시간이 걸리지만 엔터프라이즈에는 가치가 있어요."
      },
      {
        label: "시험 포인트",
        text: "엔터프라이즈엔 Direct Connect. BGP 라우팅 프로토콜. VPN으로 백업",
        easy: "비싸지만 안전해요. 장애 조치를 위해 VPN 백업과 함께 사용하세요."
      }
    ]
  },
  waf: {
    title: "AWS WAF",
    subtitle: "웹 애플리케이션 방화벽",
    easy: "WAF는 나이트클럽의 경비원이에요! 앱에 도달하기 전에 나쁜 요청(SQL 인젝션, XSS)을 차단해요.",
    points: [
      {
        label: "규칙",
        text: "IP 평판, 지리적 차단, 속도 제한, 문자열 매칭, 정규식 패턴",
        easy: "나쁜 IP 차단, 국가 차단, 요청 제한, 공격 탐지."
      },
      {
        label: "통합",
        text: "CloudFront, ALB, API Gateway. 커스텀 오리진도 보호 가능",
        easy: "모든 웹 앱 진입점을 보호해요."
      },
      {
        label: "웹 ACL",
        text: "순서가 있는 규칙. 첫 번째 매칭 규칙이 적용됨. 기본 액션 허용/차단",
        easy: "보안 체크리스트 같아요 — 첫 번째 매칭이 적용돼요."
      },
      {
        label: "관리형 규칙",
        text: "OWASP Top 10, SQL 인젝션, XSS, 봇 제어를 위한 AWS 관리 규칙 세트",
        easy: "일반적인 공격을 위한 사전 설정 규칙이에요. 전문 보안 경비원을 쓰는 것처럼요."
      },
      {
        label: "시험 포인트",
        text: "WAF vs NACL: WAF는 앱 계층, NACL은 네트워크 계층. WAF는 논리적 공격 탐지",
        easy: "NACL은 트래픽 차단, WAF는 공격 차단. 둘 다 필요해요!"
      }
    ]
  },
  secrets: {
    title: "AWS Secrets Manager",
    subtitle: "시크릿 및 자격 증명 관리",
    easy: "Secrets Manager는 안전한 비밀번호 금고예요! API 키, DB 비밀번호, 시크릿을 저장해요. 자동 교체, 접근 감사가 돼요.",
    points: [
      {
        label: "저장",
        text: "저장 중 암호화(KMS). 전송 중 암호화(TLS). 로그에 표시 안 됨",
        easy: "이중 잠금 금고 같아요. 이중으로 잠겨서 절대 보이지 않아요."
      },
      {
        label: "교체",
        text: "X일마다 자동 교체. 교체 로직용 Lambda 함수. RDS 자동 교체",
        easy: "30일마다 비밀번호를 자동으로 바꿔줘요. 교도소 간수 교대처럼요."
      },
      {
        label: "접근 제어",
        text: "접근 가능한 사람을 위한 IAM 정책. 리소스 기반 정책. CloudTrail로 감사",
        easy: "특정 사람만 시크릿을 가져올 수 있어요. 언제 누가 접근했는지 추적해요."
      },
      {
        label: "애플리케이션 통합",
        text: "런타임에 가져오기 위한 SDK 지원. 코드/설정 파일에 없음",
        easy: "앱이 런타임에 '비밀번호 줘'라고 요청해요. 하드코딩 안 해요."
      },
      {
        label: "시험 포인트",
        text: "Secrets Manager vs 파라미터 스토어: Manager는 시크릿(교체), Store는 설정",
        easy: "시크릿 = 비밀번호(교체), 파라미터 = URL(교체 안 함)."
      }
    ]
  },
  eventbridge: {
    title: "Amazon EventBridge",
    subtitle: "이벤트 버스 및 라우팅 서비스",
    easy: "EventBridge는 이벤트 디스패처예요! X가 발생하면 Y를 트리거해요. AWS 이벤트를 Lambda, SNS, SQS 등으로 자동 라우팅해요.",
    points: [
      {
        label: "이벤트 소스",
        text: "AWS 서비스(EC2, RDS, CodeBuild), 파트너 이벤트(Datadog, PagerDuty), 커스텀 앱",
        easy: "모든 AWS 이벤트 또는 커스텀 이벤트를 수신해요. 모든 것을 위한 초인종이에요."
      },
      {
        label: "규칙",
        text: "이벤트 속성에 대한 패턴 매칭. 최대 5개 타겟(팬아웃)",
        easy: "eventType=주문완료 AND amount>100이면 이메일+Lambda+DB를 트리거해요."
      },
      {
        label: "타겟",
        text: "Lambda, SNS, SQS, Kinesis, Step Functions, API Gateway, EC2, Batch 등",
        easy: "많은 곳으로 라우팅할 수 있어요. 하나의 이벤트가 여러 액션을 트리거해요."
      },
      {
        label: "스케줄링",
        text: "Cron 표현식. Rate(5분). 예약 작업에 완벽",
        easy: "'매일 새벽 3시에' 또는 '매 5분마다' 작업을 실행해요."
      },
      {
        label: "시험 포인트",
        text: "이벤트 기반 아키텍처엔 EventBridge. SNS vs EB: EB가 더 유연",
        easy: "EventBridge = 이벤트 디스패처, SNS = 알림. EB가 더 강력해요!"
      }
    ]
  },
  cloudtrail: {
    title: "AWS CloudTrail",
    subtitle: "API 활동 로깅 및 감사",
    easy: "CloudTrail은 API 호출을 위한 보안 카메라예요! AWS에 대한 모든 API 호출을 기록해요 — 누가, 무엇을, 언제. 컴플라이언스에 필수예요.",
    points: [
      {
        label: "로그",
        text: "관리 이벤트(기본, 작업). 데이터 이벤트(S3, Lambda 상세). 인사이트 이벤트(비정상 활동)",
        easy: "관리 = '누가 DB를 삭제했나?'. 데이터 = '누가 이 파일에 접근했나?'. 인사이트 = '수상해!'."
      },
      {
        label: "스토리지",
        text: "CloudTrail 콘솔에서 기본 90일. 장기 보존엔 S3. Athena로 쿼리",
        easy: "콘솔은 90일 표시, S3는 영원히, Athena는 검색 가능해요."
      },
      {
        label: "조직 트레일",
        text: "전체 조직을 위한 단일 트레일. 모든 계정을 중앙에서 모니터링",
        easy: "모든 사무실을 동시에 지켜보는 카메라 하나."
      },
      {
        label: "보호",
        text: "CloudTrail 무결성. 로그 변조 방지. 다이제스트 파일 검증",
        easy: "삭제/수정 불가하도록 로그를 잠가요. 로그가 진짜라는 증거예요."
      },
      {
        label: "시험 포인트",
        text: "감사엔 CloudTrail 필수. 네트워크 트래픽엔 VPC 플로우 로그. API 호출엔 CloudTrail",
        easy: "CloudTrail = API 감사, VPC 플로우 = 네트워크 감사. 둘 다 필요해요!"
      }
    ]
  },
  apigw: {
    title: "Amazon API Gateway",
    subtitle: "API 관리 서비스",
    easy: "API Gateway는 프론트 데스크예요! 고객의 HTTP 요청을 받아서 백엔드 Lambda/EC2 등으로 라우팅해요.",
    points: [
      {
        label: "유형",
        text: "REST API: HTTP, 유연. HTTP API: 현대적, 저렴, 빠름. WebSocket: 실시간",
        easy: "REST는 믿음직한 구버전, HTTP는 더 빠르고 저렴, WebSocket은 채팅/게임용이에요."
      },
      {
        label: "통합",
        text: "Lambda, EC2, Kinesis, DynamoDB, SQS, SNS, Step Functions, 모의",
        easy: "무엇으로든 라우팅 가능. 고객을 주방으로 안내하는 식당처럼요."
      },
      {
        label: "스로틀링",
        text: "남용 방지. 토큰 버킷 알고리즘. 속도 제한 구성 가능",
        easy: "초당 요청 수를 제한해요. 매장 줄 서기 관리처럼요."
      },
      {
        label: "캐싱",
        text: "스테이지별 응답 캐시. TTL 구성 가능. 백엔드 부하 감소",
        easy: "자주 하는 요청을 캐시해요. Lambda 호출 감소 = 비용 절감."
      },
      {
        label: "시험 포인트",
        text: "API GW + Lambda = 서버리스 API. 브라우저 요청엔 CORS 필요. 측정엔 사용 플랜",
        easy: "API GW = 프론트엔드, Lambda = 로직. CORS = 브라우저 보안. 사용량 = 속도 제한."
      }
    ]
  },
  batch: {
    title: "AWS Batch",
    subtitle: "완전 관리형 배치 컴퓨팅",
    easy: "AWS Batch는 숙제를 자동으로 나눠주는 반장이에요! 작업 목록을 제출하면 컴퓨팅을 빌려서 모든 걸 처리하고 돌려줘요. 서버 관리가 필요 없어요!",
    points: [
      { label: "핵심 구성 요소", text: "Job Definition(작업 템플릿), Job Queue(우선순위 큐), Compute Environment(EC2/Fargate 자동 프로비저닝)", easy: "Job Definition = 레시피, Job Queue = 주문 줄서기, Compute Environment = 자동 프로비저닝 요리사." },
      { label: "컴퓨팅 환경", text: "관리형(AWS가 EC2/Fargate 자동 관리) vs 비관리형(직접 관리). 스팟 인스턴스로 최대 90% 절감", easy: "관리형 = AWS가 서버를 자동으로 준비. 비관리형 = 직접 관리. 스팟으로 90% 절감!" },
      { label: "워크플로우 통합", text: "배치 파이프라인을 위한 Step Functions. 예약 실행을 위한 EventBridge", easy: "전처리→배치→후처리 자동화 파이프라인을 위해 Step Functions에 연결하세요." },
      { label: "vs Lambda", text: "Lambda: 최대 15분, 단순 이벤트 처리. Batch: 수 시간~수 일, 대규모 병렬 처리", easy: "Lambda = 단거리 달리기, Batch = 마라톤! ML 훈련, 렌더링, 빅데이터 → Batch 사용." },
      { label: "시험 포인트", text: "Batch는 ECS에서 실행. 15분 초과 작업 → Batch 사용. 스팟 중단 시 자동 재시도", easy: "작업이 15분 초과 → AWS Batch! 스팟 중단? 자동 재시도!" }
    ]
  },
  fsx: {
    title: "Amazon FSx",
    subtitle: "관리형 파일 시스템",
    easy: "FSx는 AWS에서 다양한 파일 서버를 그대로 사용할 수 있게 해줘요! Windows 공유 폴더, HPC 파일 시스템 등을 완전 관리형 서비스로 제공해요.",
    points: [
      { label: "FSx for Windows File Server", text: "완전 관리형 Windows 파일 서버. SMB/NTFS. Active Directory 통합. Multi-AZ 지원", easy: "AWS에서 Windows 공유 폴더! 기존 AD 자격 증명을 그대로 사용해요." },
      { label: "FSx for Lustre", text: "HPC/ML용 고성능. S3 직접 통합. 수백 GB/s 처리량", easy: "슈퍼컴퓨터 속도의 파일 시스템! ML 훈련, 유전체학, 비디오 처리에 사용해요." },
      { label: "FSx for NetApp ONTAP", text: "완전 관리형 NetApp ONTAP. NFS/SMB/iSCSI. 자동 티어링. 중복 제거", easy: "엔터프라이즈 NetApp을 AWS로 리프트앤쉬프트. 온프레미스 호환!" },
      { label: "FSx for OpenZFS", text: "ZFS 기반. NFS 호환. 스냅샷 및 복제. Linux 워크로드 최적화", easy: "Linux용 고성능 파일 시스템. ZFS 기능(스냅샷, 압축)을 관리형 서비스로." },
      { label: "시험 포인트", text: "Windows 파일 공유 → FSx for Windows(EFS 아님!). HPC/ML → FSx for Lustre. EFS = Linux NFS 전용", easy: "Windows 공유 폴더 → FSx for Windows! Linux 공유 → EFS. HPC → Lustre!" }
    ]
  },
  storagegateway: {
    title: "AWS Storage Gateway",
    subtitle: "하이브리드 스토리지 브릿지",
    easy: "Storage Gateway는 온프레미스 서버와 AWS 클라우드 사이의 다리예요! 온프레미스 서버가 AWS S3를 로컬 드라이브처럼 사용할 수 있어요.",
    points: [
      { label: "파일 게이트웨이", text: "NFS/SMB를 통한 S3 접근. 낮은 지연을 위한 로컬 캐시. 온프레미스 앱 코드 변경 없이 S3 사용", easy: "회사 파일 서버를 S3에 연결! 직원들은 네트워크 드라이브처럼 사용해요." },
      { label: "볼륨 게이트웨이", text: "iSCSI 블록 스토리지. 캐시형(S3에 저장, 자주 쓰는 데이터는 로컬). 저장형(로컬 프라이머리, S3 백업)", easy: "캐시형 = 주로 S3, 저장형 = 로컬 프라이머리 + S3 백업. 재해 복구에 사용해요." },
      { label: "테이프 게이트웨이", text: "가상 테이프 라이브러리(VTL). 기존 백업 소프트웨어(Veeam 등) 그대로 사용. S3/Glacier에 저장", easy: "테이프 백업 시스템을 클라우드로 마이그레이션! 소프트웨어 변경 없이 S3에 저장해요." },
      { label: "사용 사례", text: "온프레미스→클라우드 백업, 재해 복구, 클라우드 마이그레이션 중간 단계", easy: "회사 데이터를 클라우드로 이동하는 전환 기간에 주로 사용해요." },
      { label: "시험 포인트", text: "온프레미스 S3 접근 → Storage Gateway. 테이프 백업→클라우드 → Tape Gateway. S3/Glacier 호환", easy: "온프레미스 + S3 연결 키워드 → Storage Gateway! 테이프 → Glacier!" }
    ]
  },
  datasync: {
    title: "AWS DataSync",
    subtitle: "온라인 데이터 전송 서비스",
    easy: "DataSync는 이삿짐센터예요! 기존 서버의 데이터를 AWS로 빠르고 안전하게 옮겨줘요. 자동으로 암호화하고 데이터가 올바르게 전송됐는지 검증해요!",
    points: [
      { label: "소스/목적지", text: "소스: NFS, SMB, HDFS, S3, EFS, FSx, 오브젝트 스토리지. 목적지: S3, EFS, FSx", easy: "NFS 서버, Hadoop, S3에서 AWS 스토리지로 전송해요." },
      { label: "성능", text: "네트워크 활용 최대화. 병렬 전송. DataSync 에이전트(온프레미스 설치). Direct Connect/VPN 지원", easy: "빠른 전송을 위해 네트워크를 자동으로 최대 활용해요. Direct Connect로는 더 빨라요." },
      { label: "자동화 및 검증", text: "예약 전송. 데이터 무결성 자동 검증. 전송 후 삭제 옵션. CloudWatch 모니터링", easy: "스케줄대로 자동 동기화하고 데이터가 손상 없이 전송됐는지 검증해요!" },
      { label: "vs Storage Gateway", text: "DataSync: 일회성 또는 주기적 대규모 마이그레이션. Storage Gateway: 지속적 온프레미스-클라우드 연결", easy: "DataSync = 이사(데이터 마이그레이션), Storage Gateway = 출퇴근(항상 연결)." },
      { label: "시험 포인트", text: "온프레미스→S3/EFS 대규모 마이그레이션 → DataSync. Snow Family = 오프라인, DataSync = 온라인", easy: "네트워크 기반 데이터 전송 → DataSync! 오지에 인터넷 없음 → Snow Family!" }
    ]
  },
  snow: {
    title: "AWS Snow Family",
    subtitle: "오프라인 대규모 데이터 마이그레이션",
    easy: "Snow Family는 AWS가 트럭으로 하드 드라이브를 배달하는 거예요! 인터넷이 느리거나 없을 때 수십~수백 페타바이트의 데이터를 물리적으로 옮기는 데 사용해요.",
    points: [
      { label: "Snowcone", text: "초소형(2.1kg). 8TB~14TB. 현장 데이터 수집 및 전송. DataSync 내장", easy: "가방에 들어가는 크기. 오지에서 데이터 수집용이에요." },
      { label: "Snowball Edge", text: "스토리지 최적화(80TB), 컴퓨팅 최적화(42TB+GPU). 엣지 컴퓨팅 가능. 클러스터링", easy: "여행 가방 크기의 장치예요. 전송뿐만 아니라 현장에서 컴퓨팅도 할 수 있어요." },
      { label: "Snowmobile", text: "40피트 컨테이너 트럭. 최대 100PB. 엑사바이트 규모 마이그레이션", easy: "데이터센터 전체를 마이그레이션할 때! AWS 트럭이 와서 직접 연결해요." },
      { label: "엣지 컴퓨팅", text: "인터넷 없는 현장에서 EC2/Lambda 실행. 수집→처리→나중에 AWS로 업로드", easy: "인터넷 없는 광산이나 배에서 데이터를 처리하고 나중에 AWS로 전송해요." },
      { label: "시험 포인트", text: "네트워크로 10년 이상 걸림 → Snow. 오프라인 전용. AWS가 전송 후 데이터 삭제", easy: "'수십 PB 마이그레이션' + '인터넷 제한' → Snow Family! 업로드 후 데이터 삭제." }
    ]
  },
  natgw: {
    title: "NAT 게이트웨이",
    subtitle: "프라이빗 서브넷 인터넷 아웃바운드",
    easy: "NAT 게이트웨이는 프라이빗 서브넷 주민들이 외출할 수 있게 하는 쪽문이에요! 아웃바운드는 허용되지만 외부에서 인바운드는 안 돼요.",
    points: [
      { label: "역할", text: "프라이빗 서브넷의 EC2/Lambda를 위한 아웃바운드 인터넷 트래픽 허용. 인바운드 없음(스테이트풀)", easy: "프라이빗 서브넷 인스턴스가 소프트웨어 업데이트, 외부 API 호출 가능. 외부에서 접근 불가." },
      { label: "배포", text: "퍼블릭 서브넷에 배치. 탄력적 IP 필요. AZ당 하나 권장(고가용성)", easy: "NAT 게이트웨이 자체는 퍼블릭 서브넷에 있어야 해요. 안전을 위해 가용 영역당 하나씩." },
      { label: "NAT 인스턴스", text: "EC2 기반(레거시). 수동 관리 및 패치 필요. 보안 그룹 적용 가능. 비용 낮음", easy: "NAT 게이트웨이 = AWS 관리, NAT 인스턴스 = 직접 EC2 관리. 시험 자주 나오는 함정!" },
      { label: "비용", text: "시간당 + 처리된 GB당. 교차 AZ 트래픽 요금. 같은 AZ NAT 게이트웨이 권장", easy: "보낸 데이터가 많을수록 비용 증가. AZ당 NAT 게이트웨이로 데이터 전송 비용 감소." },
      { label: "시험 포인트", text: "NAT 게이트웨이는 퍼블릭 서브넷에. 고가용성 = AZ당 NAT 게이트웨이. IPv6은 Egress-Only IGW 사용", easy: "IPv6 프라이빗 서브넷 → NAT 게이트웨이 아님, Egress-Only IGW 사용! 시험 함정!" }
    ]
  },
  vpcendpoint: {
    title: "VPC 엔드포인트",
    subtitle: "인터넷 없이 AWS 서비스 접근",
    easy: "VPC 엔드포인트는 AWS 서비스로 가는 비밀 터널이에요! S3, DynamoDB 등에 인터넷을 거치지 않고 AWS 내부 네트워크를 통해 접근해요.",
    points: [
      { label: "게이트웨이 엔드포인트", text: "S3와 DynamoDB만 지원. 무료. 라우팅 테이블에 경로 추가. 리전 접근", easy: "S3, DynamoDB → 게이트웨이 엔드포인트(무료)! 라우팅 테이블에 목적지만 추가하면 돼요." },
      { label: "인터페이스 엔드포인트(PrivateLink)", text: "다른 AWS 서비스(EC2, SQS 등). ENI 생성. 시간당 + 데이터 요금. DNS 해석 변경", easy: "대부분의 AWS 서비스 연결엔 인터페이스 엔드포인트를 써요. 통신용 ENI를 하나 만들어요." },
      { label: "게이트웨이 로드 밸런서 엔드포인트", text: "GWLB와 통합. 3rd파티 방화벽/IPS 트래픽의 투명한 삽입. 검사 후 원래 목적지로 전달", easy: "보안 어플라이언스를 통과시키는 특수 엔드포인트. 방화벽 검사를 투명하게 삽입해요." },
      { label: "보안 이점", text: "IGW/NAT 게이트웨이 없이 AWS 서비스 접근. 버킷 정책에 VPC 엔드포인트 조건 지정 가능", easy: "S3 데이터가 인터넷을 거치지 않아 더 안전해요! 특정 VPC에서만 버킷 접근 허용 가능." },
      { label: "시험 포인트", text: "S3/DynamoDB → 게이트웨이(무료). 그 외 → 인터페이스(유료). 온프레미스에서 사용 불가", easy: "S3 = 게이트웨이 엔드포인트(무료)! 다른 서비스 = 인터페이스 엔드포인트. 온프레미스→VPC 엔드포인트 불가!" }
    ]
  },
  transitgw: {
    title: "AWS 트랜짓 게이트웨이",
    subtitle: "네트워크 허브 라우터",
    easy: "트랜짓 게이트웨이는 여러 VPC와 온프레미스 네트워크를 한 곳에서 연결하는 중앙 허브예요! VPC가 많을수록 피어링에 비해 훨씬 단순해져요.",
    points: [
      { label: "허브 앤 스포크", text: "최대 5,000개 VPC/VPN 연결. VPC 피어링과 달리 전이적 라우팅 지원. 중앙화된 관리", easy: "10개 VPC라면 피어링은 45개 연결이 필요해요. TGW는 허브 1개에 10개 연결만 필요!" },
      { label: "멀티 계정", text: "Resource Access Manager(RAM)로 계정 간 공유. Organizations 통합", easy: "여러 AWS 계정의 VPC를 하나의 TGW에 연결해요. 멀티 계정 아키텍처에 필수." },
      { label: "라우팅 테이블", text: "트래픽 분리를 위한 여러 라우팅 테이블. VPC 격리 가능. 블랙홀 라우팅", easy: "VPC A↔B는 허용하고 A↔C는 차단 — 세밀한 라우팅 제어." },
      { label: "어태치먼트 유형", text: "VPC 어태치먼트, VPN 어태치먼트, Direct Connect 게이트웨이 어태치먼트, 피어링 어태치먼트(리전 간)", easy: "VPC, VPN, Direct Connect 모두 하나의 TGW를 통해 연결. 리전 간 TGW 피어링도 가능." },
      { label: "시험 포인트", text: "TGW: 전이적 라우팅 YES. VPC 피어링: 전이적 라우팅 NO. 100개 이상 VPC → TGW 권장", easy: "많은 VPC + 통신 필요 → 트랜짓 게이트웨이! 피어링 = 1:1만, TGW = 다대다!" }
    ]
  },
  globalaccel: {
    title: "AWS Global Accelerator",
    subtitle: "글로벌 네트워크 가속",
    easy: "Global Accelerator는 전 세계 사용자를 가장 가까운 AWS 엣지에 연결해서 서버에 빠르게 접근하게 해줘요! 인터넷 대신 AWS의 전용 고속도로를 사용해요.",
    points: [
      { label: "애니캐스트 IP", text: "2개의 정적 애니캐스트 IP 제공. 같은 IP로 전 세계 어디서든 가장 가까운 엣지에 연결", easy: "어디서 전화해도 항상 가장 가까운 지점으로 연결해주는 고정 전화번호예요." },
      { label: "성능", text: "인터넷 대신 AWS 글로벌 네트워크 사용. 패킷 손실/지연/지터 감소. 응답이 60% 빠름", easy: "공공 도로 대신 AWS 전용 고속도로! 훨씬 빠르고 안정적이에요." },
      { label: "헬스 체크 및 장애 조치", text: "엔드포인트 헬스 체크. 비정상이면 다른 리전/엔드포인트로 자동 전환. 30초 이내", easy: "서버 다운? 30초 이내에 자동으로 다른 서버로 전환!" },
      { label: "엔드포인트", text: "ALB, NLB, EC2, 탄력적 IP. 가중치 기반 트래픽 라우팅. 블루/그린 배포", easy: "여러 리전의 로드 밸런서에 가중치 배분. A/B 테스트, 무중단 배포." },
      { label: "시험 포인트", text: "CloudFront vs Global Accelerator: CloudFront = 캐싱(HTTP), GA = TCP/UDP 네트워크 가속", easy: "정적 콘텐츠 캐싱 필요 → CloudFront. 게임/실시간/캐시 없는 가속 → Global Accelerator!" }
    ]
  },
  sitevpn: {
    title: "AWS 사이트-투-사이트 VPN",
    subtitle: "온프레미스 VPN 연결",
    easy: "Site-to-Site VPN은 회사 네트워크를 AWS VPC에 인터넷을 통해 안전하게 연결하는 암호화 터널이에요! Direct Connect보다 훨씬 빠르게 설정할 수 있어요.",
    points: [
      { label: "구성 요소", text: "가상 프라이빗 게이트웨이(VGW) 또는 트랜짓 게이트웨이 + 고객 게이트웨이(온프레미스 라우터) + 2개 IPsec 터널", easy: "AWS 문(VGW)과 회사 문(CGW)을 2개의 암호화 터널로 연결해요." },
      { label: "이중화", text: "2개 터널 자동 생성(액티브/패시브). 고가용성. 다른 AZ 종료", easy: "자동으로 2개 터널 생성! 하나가 끊어지면 다른 터널로 통신 유지." },
      { label: "속도 및 제한", text: "터널당 최대 1.25Gbps. 인터넷을 통한 가변 지연. 몇 시간 안에 설정", easy: "Direct Connect보다 빠르게 설정. 하지만 속도는 Direct Connect가 앞서요." },
      { label: "VPN over Direct Connect", text: "DX는 암호화 없음. DX + Site-to-Site VPN으로 암호화 추가", easy: "Direct Connect는 암호화 없음 — 보안이 필요하면 VPN을 함께 설치하세요." },
      { label: "시험 포인트", text: "VPN: 빠른 설정, 인터넷 경유. DX: 수 주~수 개월 설정, 전용선. VPN은 DX 백업으로 권장", easy: "'빠르게 연결' → VPN. '안정적 대역폭' → Direct Connect. '암호화+DX' → VPN over DX!" }
    ]
  },
  vpcpeering: {
    title: "VPC 피어링",
    subtitle: "직접 VPC 간 프라이빗 연결",
    easy: "VPC 피어링은 두 VPC를 비밀 터널로 연결하는 거예요! 서로 다른 VPC의 서버들이 인터넷 없이 통신할 수 있어요.",
    points: [
      { label: "기능", text: "AWS 네트워크를 통한 프라이빗 연결. 동일 리전 또는 리전 간. 동일 계정 또는 교차 계정", easy: "두 VPC 사이의 전용 터널이에요. 인터넷 불필요. 다른 계정과 리전도 지원." },
      { label: "전이적 라우팅 없음", text: "A→B→C 전이적 라우팅 미지원. A↔C를 연결하려면 별도 피어링 필요", easy: "A-B-C가 연결되어 있어도 A는 C에 접근 불가. A-C 연결을 별도로 만들어야 해요!" },
      { label: "CIDR 제한", text: "겹치는 CIDR 블록으로는 피어링 불가. 양쪽 라우팅 테이블을 모두 업데이트해야 함", easy: "두 VPC의 IP 범위가 겹치면 연결 불가! CIDR를 신중하게 계획하세요." },
      { label: "vs 트랜짓 게이트웨이", text: "피어링: 1:1, 전이적 없음, 무료. TGW: 허브, 전이적, 비용 있음", easy: "2~3개 VPC → 피어링(무료). 복잡한 많은 VPC → 트랜짓 게이트웨이." },
      { label: "시험 포인트", text: "전이적 라우팅 없음. 겹치는 CIDR 없음. 양쪽 라우팅 테이블 업데이트 필수", easy: "피어링 후 양쪽 라우팅 테이블을 모두 업데이트해야 해요! 한쪽만 하면 안 돼요." }
    ]
  },
  scp: {
    title: "서비스 제어 정책(SCP)",
    subtitle: "Organizations 최대 권한 경계",
    easy: "SCP는 회사 전체를 위한 헌법이에요! 직원(계정)이 어떤 권한을 가지든, SCP가 금지하면 절대 할 수 없어요. IAM이 허용해도 SCP가 차단하면 끝이에요!",
    points: [
      { label: "개요", text: "AWS Organizations의 OU/계정에 적용. 허용 가능한 최대 권한 경계 정의. IAM에 대한 추가 조건", easy: "SCP는 계정당 권한의 천장이에요. IAM이 모든 걸 허용해도 SCP가 금지하면 차단." },
      { label: "허용 vs 거부", text: "허용 목록: 나열된 액션만 허용. 거부 목록: 나열된 액션만 거부(기본값)", easy: "거부 목록이 기본값이에요. 특정 서비스를 차단해요. 허용 목록 = 허용된 서비스만 사용 가능." },
      { label: "범위", text: "루트 계정에 SCP 적용 불가. 멤버 계정에만 적용. 관리 계정 영향 없음", easy: "SCP는 자식 계정만 제한해요. 마스터(관리) 계정은 SCP의 영향을 받지 않아요. 주의하세요!" },
      { label: "계층적", text: "OU → 자식 OU → 계정 상속. 부모 OU SCP와 계정 SCP를 모두 만족해야 함", easy: "규칙이 위에서 아래로 흘러요. 부모 OU에서 차단되면 자식이 재정의 불가." },
      { label: "시험 포인트", text: "SCP ≠ IAM 정책. 루트 사용자도 SCP 제한 대상. 관리 계정은 SCP 면제", easy: "심지어 루트 계정도 SCP가 금지한 건 할 수 없어요! 오직 관리 계정만 SCP 면제." }
    ]
  },
  networkfirewall: {
    title: "AWS 네트워크 방화벽",
    subtitle: "관리형 VPC 네트워크 방화벽",
    easy: "네트워크 방화벽은 VPC의 보안 경비원이에요! 스테이트풀 검사로 모든 인바운드/아웃바운드 트래픽을 검사해요. WAF는 앱 계층, 네트워크 방화벽은 네트워크 계층을 담당해요!",
    points: [
      { label: "개요", text: "완전 관리형 스테이트풀 방화벽. VPC 인바운드/아웃바운드/이스트-웨스트 트래픽 보호. 게이트웨이 로드 밸런서 불필요", easy: "VPC 레벨 방화벽이에요. 모든 트래픽 검사: 인터넷→VPC, VPC→인터넷, VPC→VPC." },
      { label: "규칙 유형", text: "스테이트리스(패킷별), 스테이트풀(연결 추적), 도메인 목록(도메인 차단), Suricata IPS(오픈소스 규칙)", easy: "단순 IP/포트 차단부터 도메인 기반 차단, IPS 규칙까지 — 매우 유연하게 설정 가능." },
      { label: "아키텍처", text: "전용 방화벽 서브넷에 배포. 트래픽 라우팅 조정 필요. 중앙화 또는 분산 배포", easy: "전용 방화벽 서브넷을 만들고 모든 트래픽이 그걸 통과하도록 라우팅해요." },
      { label: "vs WAF vs 보안 그룹", text: "SG: 인스턴스 레벨. WAF: L7 HTTP. 네트워크 방화벽: VPC 레벨 L3~L7 종합", easy: "SG = 초대 명단, WAF = 앱 보안, 네트워크 방화벽 = 동네 입구 종합 보안." },
      { label: "시험 포인트", text: "VPC 레벨 트래픽 검사/차단 → 네트워크 방화벽. IDS/IPS 기능 필요 → 네트워크 방화벽", easy: "모든 VPC 트래픽 필터링 + IPS 기능 → 네트워크 방화벽!" }
    ]
  },
  guardduty: {
    title: "Amazon GuardDuty",
    subtitle: "ML 기반 위협 탐지",
    easy: "GuardDuty는 AWS의 탐정이에요! 로그를 분석해서 '비정상 로그인', '암호화폐 채굴', '데이터 유출' 같은 위협을 자동으로 찾아내요. 설치 없이 즉시 켤 수 있어요!",
    points: [
      { label: "분석 소스", text: "CloudTrail(API 호출), VPC 플로우 로그(네트워크), DNS 로그(도메인), EKS 감사 로그, S3 이벤트", easy: "CloudTrail, VPC 플로우, DNS를 동시에 분석해요. 에이전트 불필요 — 30초 만에 활성화!" },
      { label: "탐지 유형", text: "비정상 API 호출, 악성 IP 접근, 암호화폐 채굴, 자격 증명 도용, 포트 스캔, S3 유출", easy: "해커 패턴(악성 IP), 내부 위협(비정상 API), 악성코드(채굴) 등을 탐지해요." },
      { label: "결과", text: "결과 → EventBridge → Lambda/SNS. 심각도(낮음/중간/높음). 자동 복구 가능", easy: "위협 발견 → EventBridge 알림 → Lambda 자동 차단! 완전 자동화 가능." },
      { label: "멀티 계정", text: "Organizations 통합. 관리자 계정에서 모든 멤버 계정을 중앙 관리", easy: "모든 계정의 위협을 한 곳에서 관리해요. Organizations 통합 필수." },
      { label: "시험 포인트", text: "30일 무료 평가판. VPC 플로우 로그 비활성화해도 GuardDuty는 독립적으로 수집. 에이전트 불필요", easy: "그냥 켜면 즉시 보호! 위협 탐지 → GuardDuty, 취약점 스캔 → Inspector" }
    ]
  },
  inspector: {
    title: "Amazon Inspector",
    subtitle: "자동화된 취약점 스캔",
    easy: "Inspector는 서버를 위한 보안 점검 로봇이에요! EC2, Lambda, 컨테이너의 알려진 취약점(CVE)을 자동으로 찾아서 위험 점수와 함께 보고해요.",
    points: [
      { label: "스캔 대상", text: "EC2(OS/소프트웨어 CVE), Lambda 함수(코드 의존성), ECR 컨테이너 이미지", easy: "EC2, Lambda, 컨테이너 이미지의 패키지와 라이브러리에서 취약점을 자동으로 스캔해요." },
      { label: "지속적 스캔", text: "초기 배포 + 새 CVE 게시 시 자동 재스캔. SSM 에이전트 사용. 거의 실시간", easy: "한 번만이 아니에요 — 새로운 취약점이 발견될 때마다 자동 재스캔! 항상 최신 상태." },
      { label: "위험 점수", text: "CVSSv3 + 네트워크 도달 가능성 조합. 실제 위험 기반 우선순위. Inspector 점수", easy: "CVE 점수만이 아니라 인터넷 노출도를 고려해서 실제 위험 수준을 계산해요." },
      { label: "통합", text: "결과 → Security Hub 통합. EventBridge → 자동화. ECR 이미지 스캔 통합", easy: "Security Hub에서 한 화면으로 관리. 새 취약점 발견 시 자동으로 티켓 생성." },
      { label: "시험 포인트", text: "GuardDuty: 위협 탐지(행동 분석). Inspector: 취약점 스캔(CVE). 목적이 달라요!", easy: "GuardDuty = 탐정(수상한 행동). Inspector = 의사(건강 검진). 완전히 달라요!" }
    ]
  },
  macie: {
    title: "Amazon Macie",
    subtitle: "S3 민감 데이터 자동 탐지",
    easy: "Macie는 S3 스토리지의 민감 데이터 탐지기예요! 신용카드 번호, 주민등록번호, 이메일 같은 민감 데이터가 어디에 저장되어 있는지 자동으로 찾아줘요. GDPR 컴플라이언스에 도움이 돼요!",
    points: [
      { label: "탐지 유형", text: "PII(개인 정보), 금융 정보(신용카드/계좌), 의료 정보(PHI), 자격 증명(API 키/비밀번호)", easy: "S3의 주민등록번호, 신용카드 번호, API 키 — 자동으로 찾아서 알려줘요!" },
      { label: "분류", text: "ML + 패턴 매칭. 100개 이상의 관리형 데이터 식별자. 커스텀 식별자 추가 가능", easy: "AWS가 만든 100개 이상의 패턴으로 자동 탐지. 회사 특화 패턴도 추가 가능." },
      { label: "S3 범위", text: "계정의 모든 S3 버킷 자동 탐지. 보안 상태 표시: 암호화, 퍼블릭 접근", easy: "모든 S3 버킷을 자동으로 스캔하고 알려줘요: '이 버킷에 민감 데이터 있음!'" },
      { label: "결과", text: "결과 → EventBridge → Lambda/SNS. Security Hub 통합. 30일 무료 평가판", easy: "민감 데이터 발견 → EventBridge → 자동 알림 또는 이동!" },
      { label: "시험 포인트", text: "S3 민감 데이터 탐지 → Macie. PII/컴플라이언스 → Macie. GuardDuty = 위협 탐지!", easy: "'S3의 PII가 어디에?' → Macie! '해킹 시도 탐지' → GuardDuty!" }
    ]
  },
  acm: {
    title: "AWS Certificate Manager",
    subtitle: "SSL/TLS 인증서 관리",
    easy: "ACM은 웹사이트에 HTTPS 인증서를 무료로 발급하고 자동 갱신해줘요! 인증서 만료 걱정 없이 항상 HTTPS를 유지해요!",
    points: [
      { label: "핵심 기능", text: "무료 SSL/TLS 인증서 발급. 자동 갱신. 퍼블릭 및 프라이빗 인증서. DNS/이메일 검증", easy: "AWS가 인증서 발급, 갱신, 배포를 알아서 해줘요. 갱신 잊으면 = 장애!" },
      { label: "통합 서비스", text: "ELB(ALB/NLB), CloudFront, API Gateway, Elastic Beanstalk. EC2에 직접 배포 불가", easy: "ALB, CloudFront에 인증서 연결 가능. EC2에 직접 배포 불가 — ELB 뒤에 있어야 해요!" },
      { label: "퍼블릭 vs 프라이빗", text: "퍼블릭: 무료, 인터넷 서비스용. 프라이빗(ACM Private CA): 유료, 내부 서비스용", easy: "인터넷용 인증서 → 무료! 내부 직원 시스템 → Private CA(유료)." },
      { label: "리전 제한", text: "CloudFront 인증서는 us-east-1(버지니아)에서 발급 필수. 리전은 독립적", easy: "CloudFront + HTTPS → us-east-1에서 인증서 발급! 다른 리전 인증서는 CloudFront에 안 돼요." },
      { label: "시험 포인트", text: "ACM은 EC2에 직접 배포 불가. CloudFront 인증서 → us-east-1 필수. 자동 갱신으로 만료 방지", easy: "CloudFront SSL → us-east-1 ACM! EC2에 직접 배포 불가 — ELB/CF를 거쳐야 해요!" }
    ]
  },
  s3objectlock: {
    title: "S3 Object Lock",
    subtitle: "WORM 데이터 보호",
    easy: "S3 Object Lock은 설정된 기간 동안 파일을 삭제하거나 수정할 수 없게 잠가줘요. 금융, 의료, 법률 분야의 법적으로 요구되는 데이터 보존에 사용해요!",
    points: [
      { label: "WORM", text: "한 번 쓰고 여러 번 읽기. 데이터 불변성 보장. 랜섬웨어 방어. 컴플라이언스 데이터 보존", easy: "한 번 쓰면 보존 기간 동안 읽기 전용! 삭제나 수정 불가. 랜섬웨어 방지." },
      { label: "거버넌스 모드", text: "특별 권한(s3:BypassGovernanceRetention)으로 잠금 해제/삭제 가능. 테스트, 유연한 보호", easy: "특별 권한이 있는 관리자는 잠금을 해제할 수 있어요. 테스트에 더 유연한 보호." },
      { label: "컴플라이언스 모드", text: "루트 포함 누구도 삭제/수정 불가. 보존 기간 변경 불가. 엄격한 컴플라이언스", easy: "루트도 삭제 불가! 법적으로 요구되는 데이터 보존에 사용. 한 번 설정하면 불변." },
      { label: "법적 보존", text: "보존 기간 없이 무기한 보호. s3:PutObjectLegalHold 권한으로 설정/해제", easy: "법적 조사가 끝날 때까지 무기한 보호해요. 소송에서 증거를 보존할 때 사용." },
      { label: "시험 포인트", text: "S3 Object Lock은 버전 관리 필요. 버킷 생성 시 활성화(나중에 변경 불가). Glacier는 Vault Lock 지원", easy: "WORM + 컴플라이언스 → S3 Object Lock! 컴플라이언스 모드 = 루트도 삭제 불가!" }
    ]
  },
  stepfunctions: {
    title: "AWS Step Functions",
    subtitle: "서버리스 워크플로우 오케스트레이션",
    easy: "Step Functions은 여러 Lambda를 순서대로 연결하는 지휘자예요! 성공하면 다음 단계, 실패하면 자동 재시도 또는 오류 처리를 해요.",
    points: [
      { label: "상태 머신", text: "JSON/YAML로 워크플로우 정의. 시각적 편집기. 태스크/선택/대기/병렬/맵 상태", easy: "순서도를 코드로 그려요! 분기, 병렬 실행, 대기, 반복 모두 표현 가능해요." },
      { label: "표준 vs 익스프레스", text: "표준: 최대 1년, 정확히 1회 실행, 감사 로그. 익스프레스: 최대 5분, 고처리량, 비동기", easy: "표준 = 장기 실행 중요 워크플로우, 익스프레스 = 빠른 고처리량(IoT, 스트리밍)." },
      { label: "통합", text: "Lambda, ECS, DynamoDB, SQS, SNS, Bedrock, SageMaker 등 AWS 서비스 직접 통합", easy: "Lambda만이 아니라 — ECS, DynamoDB, SageMaker를 코드 없이 직접 연결!" },
      { label: "오류 처리", text: "재시도, 캐치(폴백). 지수 백오프. 타임아웃. 하트비트", easy: "Lambda 실패 → 3번 재시도, 여전히 실패 → 자동으로 오류 처리 경로로." },
      { label: "시험 포인트", text: "복잡한 Lambda 체인 → Step Functions. 병렬 처리 → 맵/병렬 상태. 15분 초과 → 표준", easy: "여러 Lambda를 순서대로, 조건에 따라, 병렬로 실행 → Step Functions!" }
    ]
  },
  dynamostreams: {
    title: "DynamoDB Streams",
    subtitle: "DynamoDB 변경 이벤트 스트림",
    easy: "DynamoDB Streams는 테이블의 모든 변경 사항을 실시간으로 알려주는 시스템이에요! 아이템이 추가/수정/삭제되면 Lambda가 자동으로 실행돼요.",
    points: [
      { label: "개요", text: "DynamoDB 아이템 변경의 순서 있는 스트림(INSERT/MODIFY/REMOVE). 24시간 보존. 샤드 기반", easy: "테이블 변경 사항을 순서대로 녹화하는 테이프예요. 24시간 안에 처리해야 해요." },
      { label: "스트림 레코드 유형", text: "KEYS_ONLY, NEW_IMAGE, OLD_IMAGE, NEW_AND_OLD_IMAGES", easy: "키만, 또는 변경 전/후 데이터를 보내도록 선택 가능. 전후 비교 = NEW_AND_OLD_IMAGES." },
      { label: "Lambda 통합", text: "Lambda 이벤트 소스로 자동 폴링. 배치 처리. 실패 시 재시도. DLQ 구성 가능", easy: "새 변경 → Lambda 자동 트리거! 배치로 처리하고, 실패 항목은 DLQ로." },
      { label: "사용 사례", text: "리전 간 복제(글로벌 테이블의 기반), 이벤트 기반 캐시 무효화, 변경 감사 로그", easy: "주문 완료 → 재고 감소 + 배송 시작 + 알림 전송, 모두 동시에 처리!" },
      { label: "시험 포인트", text: "Streams가 Lambda 트리거의 기반. 글로벌 테이블 내부적으로 Streams 사용. Kinesis 데이터 스트림도 선택 가능", easy: "DynamoDB 변경 → Lambda 자동 트리거 → Streams! 글로벌 테이블도 Streams로 복제해요." }
    ]
  },
  dms: {
    title: "AWS Database Migration Service",
    subtitle: "데이터베이스 마이그레이션",
    easy: "DMS는 데이터베이스 이사 도우미예요! Oracle에서 Aurora로, MySQL에서 PostgreSQL로 다운타임 없이 데이터를 이동해요. 마이그레이션 중에도 서비스가 계속 돌아가요!",
    points: [
      { label: "마이그레이션 유형", text: "동종(MySQL→MySQL), 이기종(Oracle→Aurora). 전체 로드, CDC(지속적 복제), 전체 로드+CDC", easy: "같은 엔진 = 직접 마이그레이션. 다른 엔진 = 스키마 변환 도구(SCT) 먼저, 그 다음 DMS." },
      { label: "CDC(변경 데이터 캡처)", text: "마이그레이션 중 소스 DB 변경 사항의 실시간 복제. 다운타임 최소화", easy: "마이그레이션 중에 들어오는 새 데이터도 자동으로 이동! 서비스 중단 없이 마이그레이션." },
      { label: "복제 인스턴스", text: "처리를 위한 DMS 복제 인스턴스. EC2 기반. 크기 선택. Multi-AZ 옵션", easy: "중간에서 데이터를 읽고 쓰는 EC2 서버예요. 데이터 크기에 따라 크기를 선택해요." },
      { label: "지원 DB", text: "소스/대상: RDS, Aurora, Redshift, DynamoDB, S3, MongoDB, DocumentDB, Kafka 등", easy: "거의 모든 DB에서 거의 모든 DB로 마이그레이션 가능. 온프레미스 → 클라우드도 지원!" },
      { label: "시험 포인트", text: "이기종 DB 마이그레이션 → SCT + DMS. 동종 → DMS만. 최소 다운타임 → CDC 사용", easy: "Oracle→Aurora(이기종) → SCT로 스키마 변환, DMS로 데이터 마이그레이션!" }
    ]
  },
  transferfamily: {
    title: "AWS Transfer Family",
    subtitle: "관리형 파일 전송 서비스",
    easy: "Transfer Family를 사용하면 기존 SFTP 클라이언트로 S3에 파일을 업로드할 수 있어요! 레거시 시스템을 변경하지 않고 S3/EFS로 파일을 전송해요.",
    points: [
      { label: "지원 프로토콜", text: "SFTP(SSH FTP), FTPS(SSL 기반 FTP), FTP, AS2(B2B 표준). 완전 관리형 엔드포인트 제공", easy: "기존 SFTP/FTP 클라이언트를 그대로 사용! AWS가 엔드포인트를 관리해요." },
      { label: "스토리지 연결", text: "파일은 Amazon S3 또는 Amazon EFS에 저장. 기존 S3 버킷 활용", easy: "SFTP로 업로드한 파일이 자동으로 S3 또는 EFS에 저장!" },
      { label: "인증", text: "서비스 관리 사용자, Active Directory, LDAP, 커스텀 IdP(Lambda) 통합", easy: "기존 회사 AD 계정으로 SFTP 로그인! 별도 계정 관리 불필요." },
      { label: "VPC 배포", text: "인터넷 또는 VPC 내부(프라이빗). EIP로 고정 IP. SG로 접근 제어", easy: "공용 인터넷 또는 VPC 내부 전용 선택 가능. 고정 IP로 방화벽 규칙이 쉬워요." },
      { label: "시험 포인트", text: "레거시 SFTP→S3 마이그레이션 → Transfer Family. AS2 = B2B 파트너 파일 교환. EDI 표준", easy: "SFTP 그대로 S3로 → Transfer Family! B2B 파일 교환(AS2) → Transfer Family!" }
    ]
  },
  appflow: {
    title: "Amazon AppFlow",
    subtitle: "SaaS↔AWS 데이터 통합",
    easy: "AppFlow는 Salesforce, Slack 같은 SaaS 서비스의 데이터를 AWS로 자동으로 가져오는 커넥터예요! 코딩 없이 설정만으로 데이터 파이프라인을 만들어요.",
    points: [
      { label: "지원 커넥터", text: "Salesforce, Marketo, Slack, ServiceNow, SAP, Google Analytics → S3, Redshift, EventBridge", easy: "Salesforce CRM 데이터를 자동으로 S3에 저장! 매일, 특정 이벤트 시, 또는 실시간으로." },
      { label: "데이터 변환", text: "전송 중 데이터 마스킹, 필터링, 검증, 형식 변환. 민감 데이터 보호", easy: "SaaS 데이터 가져오는 동안 PII 마스킹, 필요한 필드만 선택 등을 해줘요." },
      { label: "보안", text: "전송 중 및 저장 중 암호화. 인터넷 없는 전송을 위한 PrivateLink. 감사 로그", easy: "인터넷 노출 없이 AWS 내부 네트워크로만 데이터가 이동해요 — 안전해요." },
      { label: "트리거", text: "온디맨드, 예약(분 단위), 이벤트 기반. 양방향(S3→Salesforce도 가능)", easy: "매일 밤 Salesforce → S3 자동 동기화! 또는 새 데이터 들어오면 즉시 트리거." },
      { label: "시험 포인트", text: "SaaS→AWS 코드 없는 통합 → AppFlow. vs EventBridge: AppFlow = 데이터 이동, EB = 이벤트 라우팅", easy: "Salesforce/Slack 데이터 → AWS S3/Redshift → AppFlow! 설정만으로, 코딩 불필요!" }
    ]
  },
  cloudformation: {
    title: "AWS CloudFormation",
    subtitle: "코드형 인프라(IaC)",
    easy: "CloudFormation은 청사진(코드)에서 AWS 인프라를 만들고 자동으로 구축해줘요! 클릭 대신 코드 파일 하나로 VPC, EC2, RDS 등을 자동 생성해요.",
    points: [
      { label: "템플릿", text: "JSON/YAML 형식. 리소스(필수), 파라미터, 매핑, 출력, 조건, 메타데이터 섹션", easy: "레고 조립 설명서예요! 리소스 = 무엇을 만들지, 파라미터 = 입력값, 출력 = 결과." },
      { label: "스택", text: "템플릿으로 생성된 AWS 리소스 모음. 스택 삭제 시 모든 리소스 제거(DeletionPolicy 제외)", easy: "스택 = 설명서로 완성된 레고 세트. 스택 삭제 = 레고 분해." },
      { label: "StackSets", text: "여러 계정과 리전에 동시 배포. Organizations 통합. 중앙화된 배포", easy: "여러 계정과 리전에 같은 청사진을 한 번에 구축! 표준화된 자동 배포." },
      { label: "드리프트 탐지", text: "실제 리소스 설정이 템플릿과 다른지 자동 감지", easy: "'누군가 콘솔에서 직접 수정했나요?' 코드와 실제 상태의 차이를 확인해요." },
      { label: "시험 포인트", text: "IaC = CloudFormation. 롤백: 실패 시 자동. 변경 세트로 변경 사항 미리 보기. 재사용엔 중첩 스택", easy: "인프라를 코드로 → CloudFormation. 변경 미리 보기 → Change Set. 모듈화 → 중첩 스택!" }
    ]
  },
  awsconfig: {
    title: "AWS Config",
    subtitle: "리소스 설정 이력 및 컴플라이언스",
    easy: "AWS Config는 AWS 리소스의 블랙박스예요! 보안 그룹이 언제 변경됐는지, S3 버킷이 퍼블릭이 됐는지 기록하고, 규칙 위반 시 자동으로 알려줘요!",
    points: [
      { label: "설정 기록", text: "모든 리소스 설정 변경 기록. 시간 기반 스냅샷. 누가 무엇을 언제 변경했는지 추적", easy: "VPC, SG, S3 설정이 변경될 때마다 사진을 찍어요. 타임라인으로 볼 수 있어요." },
      { label: "Config 규칙", text: "150개 이상의 AWS 관리형 규칙, 커스텀 규칙(Lambda). 지속적인 컴플라이언스 평가", easy: "'S3 버킷은 퍼블릭이면 안 됨!' 규칙 설정 → 위반 시 자동 알림!" },
      { label: "자동 복구", text: "복구 액션. SSM 자동화로 비준수 리소스 자동 수정", easy: "규칙 위반 → 자동 수정! SG 포트 열림 → 자동으로 닫기." },
      { label: "집계", text: "모든 Organizations 계정의 설정을 중앙에서 집계. Config 집계기. 멀티 리전", easy: "한 화면에서 모든 계정의 컴플라이언스 상태를 확인!" },
      { label: "시험 포인트", text: "CloudTrail(누가 했나) vs Config(무엇이 변경됐나). 컴플라이언스 평가 → Config 규칙. 비용: 기록당", easy: "CloudTrail = 액션 로그(누가). Config = 상태 로그(무엇). 컴플라이언스 자동화 → Config!" }
    ]
  },
  controltower: {
    title: "AWS Control Tower",
    subtitle: "멀티 계정 랜딩 존",
    easy: "Control Tower는 AWS 환경의 건물 관리자예요! 여러 AWS 계정을 안전하고 표준화된 방식으로 자동으로 생성하고 관리해줘요. 보안이 사전 설정된 계정을 자동으로 만들어줘요!",
    points: [
      { label: "랜딩 존", text: "멀티 계정 환경 자동 설정. 로그 아카이브 및 감사 계정 자동 생성. Organizations 통합", easy: "기초 공사! 시작할 때 로그 저장소, 감사 계정 등을 자동으로 만들어줘요." },
      { label: "가드레일", text: "예방적 가드레일(SCP 기반): 금지된 액션 차단. 탐지적 가드레일(Config 기반): 위반 탐지", easy: "예방적 = '차단'(SCP), 탐지적 = '잘못되면 알림'(Config 규칙)." },
      { label: "계정 팩토리", text: "새 계정 자동 프로비저닝. 표준 설정 적용. Service Catalog 통합", easy: "새 AWS 계정 요청 → 표준 설정으로 자동 생성!" },
      { label: "대시보드", text: "모든 계정의 가드레일 컴플라이언스 상태를 한눈에 확인. 위반 계정 식별. 드리프트 탐지", easy: "어떤 계정이 위반 상태인지 한 화면에서 관리!" },
      { label: "시험 포인트", text: "멀티 계정 거버넌스 자동화 → Control Tower. SCP + Config 규칙 조합. 계정 팩토리로 표준화", easy: "새 팀에게 AWS 계정 자동 발급 + 표준 보안 적용 → Control Tower!" }
    ]
  },
  trustedadvisor: {
    title: "AWS Trusted Advisor",
    subtitle: "모범 사례 자동 점검",
    easy: "Trusted Advisor는 AWS 계정의 건강 의사예요! 비용 낭비, 보안 허점, 성능 문제, 서비스 한도 위험을 자동으로 점검해줘요!",
    points: [
      { label: "5가지 점검 카테고리", text: "비용 최적화, 성능, 보안, 내결함성, 서비스 한도. 초록(정상)/노란(경고)/빨강(위험)", easy: "5가지 체크리스트! 비용 낭비, 보안 허점, 서비스 한도 초과를 자동 점검." },
      { label: "무료 vs 유료", text: "기본/개발자: 7가지 핵심 보안/한도 점검. 비즈니스/엔터프라이즈: 전체 점검 + API 접근", easy: "무료 = 기본 점검만. 비즈니스+ 구독 = 전체 점검 + 자동화 가능." },
      { label: "주요 점검 항목", text: "미사용 EBS/EIP, MFA 없는 루트, 개방 보안 그룹(0.0.0.0/0), 80% 서비스 한도", easy: "비용 낭비: 미사용 EBS. 보안: MFA 없는 루트. 한도: 90% 이상 사용 서비스." },
      { label: "자동화", text: "EventBridge + Lambda로 Trusted Advisor 권고에 자동 대응. 주간 이메일 알림", easy: "Trusted Advisor가 문제 발견 → Lambda 자동 수정! 예: 미사용 EIP 자동 해제." },
      { label: "시험 포인트", text: "서비스 한도 증가 요청 → 지원 센터. 비즈니스/엔터프라이즈 플랜에서 전체 점검. Compute Optimizer와의 차이점", easy: "서비스 한도 확인 → Trusted Advisor! 실제 한도 증가 → 지원 케이스!" }
    ]
  },
  organizations: {
    title: "AWS Organizations",
    subtitle: "멀티 계정 중앙 관리",
    easy: "AWS Organizations는 여러 AWS 계정을 하나의 회사처럼 관리해요! 팀별로 계정을 분리하면서 중앙에서 제어하고 하나의 통합 청구서를 받아요.",
    points: [
      { label: "구조", text: "관리 계정(루트) → 루트 → OU → 멤버 계정. 계층적 정책 상속", easy: "회사 조직도 같아요! 본사(관리) → 부서(OU) → 팀(멤버 계정)." },
      { label: "SCP", text: "서비스 제어 정책. OU/계정당 최대 허용 권한 설정. IAM 위에 적용됨", easy: "SCP는 각 계정의 헌법이에요! IAM이 모든 걸 허용해도 SCP가 금지하면 차단." },
      { label: "통합 청구", text: "모든 계정 청구 통합. 볼륨 할인. 예약/세이빙 플랜 공유. Cost Explorer 통합", easy: "10개 계정 → 청구서 하나! 계정 전체 사용량 합산으로 볼륨 할인 적용." },
      { label: "서비스 통합", text: "AWS SSO, Config, CloudTrail, GuardDuty, Security Hub, Macie 등 Organizations 레벨에서 활성화", easy: "모든 계정에 보안 서비스를 한 번에 적용! 새 계정에도 자동 적용." },
      { label: "시험 포인트", text: "통합 청구 → Organizations. 교차 계정 권한 제한 → SCP. 중앙 서비스 관리 → Organizations", easy: "멀티 계정 관리, 청구 통합, SCP 적용 → AWS Organizations!" }
    ]
  },
  backup: {
    title: "AWS Backup",
    subtitle: "중앙화된 백업 서비스",
    easy: "AWS Backup은 EC2, EBS, RDS, DynamoDB 등 많은 서비스의 백업을 한 곳에서 관리해줘요! 백업 정책을 만들면 모든 걸 자동으로 백업해요.",
    points: [
      { label: "지원 서비스", text: "EC2, EBS, RDS/Aurora, DynamoDB, EFS, FSx, S3, Storage Gateway, DocumentDB, Neptune", easy: "거의 모든 AWS 데이터 서비스를 한 번에 백업! 서비스별로 따로 설정할 필요 없어요." },
      { label: "백업 플랜", text: "백업 플랜: 스케줄(일/주/월), 보존 기간, 전환(콜드 스토리지), 리전 간 복사", easy: "'매일 자동 백업, 30일 보존, 오래된 건 Glacier로' — 규칙 한 번 설정하면 자동 실행." },
      { label: "백업 볼트", text: "백업 저장소. 암호화(KMS). 볼트 잠금(WORM): 삭제 방지. 교차 계정 공유", easy: "금고에 백업 보관! 볼트 잠금 = 관리자도 삭제 불가. 랜섬웨어 방어에 사용." },
      { label: "Organizations 통합", text: "전체 Organizations에 중앙 백업 정책 적용. 모든 계정 자동 백업. 컴플라이언스", easy: "같은 백업 정책이 모든 계정에 자동 적용! 직원이 수동 설정할 필요 없어요." },
      { label: "시험 포인트", text: "중앙화된 백업 → AWS Backup. 볼트 잠금 = WORM. 재해 복구를 위한 리전 간 백업", easy: "여러 서비스 중앙 백업 관리 → AWS Backup! 삭제 불가 백업 → 볼트 잠금!" }
    ]
  },
  iamidentitycenter: {
    title: "IAM Identity Center",
    subtitle: "Single Sign-On(SSO) 서비스",
    easy: "IAM Identity Center는 모든 AWS 계정과 앱을 위한 통합 로그인 서비스예요! 한 번 로그인하면 모든 AWS 계정과 Salesforce, Slack 등에 접근할 수 있어요.",
    points: [
      { label: "SSO", text: "Single Sign-On. 여러 AWS 계정과 앱에 한 번 로그인. 사용자 포털 제공", easy: "한 번 로그인 → 모든 AWS 계정 접근! 계정마다 반복 로그인 불필요." },
      { label: "자격 증명 소스", text: "IAM Identity Center 내장, Active Directory(AD 커넥터/AWS 관리형 AD), 외부 IdP(Okta, Azure AD)", easy: "회사 AD 계정으로 AWS에 로그인! Okta, Azure AD도 연결 가능." },
      { label: "권한 세트", text: "권한 세트: 계정에 할당된 역할 모음. OU 또는 계정별로 다른 권한. SCP와 독립적", easy: "개발팀은 개발 계정 관리자, 운영팀은 운영 계정 읽기 전용 — 별도로 할당." },
      { label: "SCIM 자동 프로비저닝", text: "IdP에서 사용자 추가/제거 시 자동 동기화. 수동 관리 불필요", easy: "HR이 직원 추가 → AWS 접근 자동 생성! 직원 퇴사 → 자동 제거." },
      { label: "시험 포인트", text: "멀티 계정 SSO → IAM Identity Center. Cognito = 앱 사용자 인증, IAM Identity Center = AWS 계정 접근", easy: "직원 AWS 통합 로그인 → IAM Identity Center! 앱 회원가입/로그인 → Cognito!" }
    ]
  },
  emr: {
    title: "Amazon EMR",
    subtitle: "관리형 빅데이터 처리",
    easy: "EMR은 AWS 클러스터에서 Hadoop과 Spark를 쉽게 실행해줘요! EC2를 직접 관리하는 대신 관리형 서비스로 빅데이터를 처리해요.",
    points: [
      { label: "지원 프레임워크", text: "Apache Spark, Hadoop, Hive, Presto, HBase, Flink, Hudi, Iceberg. JupyterHub 통합", easy: "수백 TB에는 Spark, 대규모 SQL에는 Hive, NoSQL에는 HBase — 모두 EMR에서!" },
      { label: "클러스터 구조", text: "기본 노드(조율), 코어 노드(처리+저장), 태스크 노드(처리만). 비용 절감을 위한 스팟", easy: "현장감독(기본) + 직원(코어) + 임시직(태스크). 태스크에 스팟을 사용하면 80% 절감!" },
      { label: "스토리지", text: "HDFS(임시), EMR 파일 시스템(EMRFS, S3 통합), 로컬. S3를 데이터 레이크로", easy: "S3 = 영구 저장소, HDFS = 임시 작업 공간. 클러스터 종료 후에도 S3 데이터 보존." },
      { label: "EMR 서버리스", text: "클러스터 관리 없이 Spark/Hive 작업 실행. 자동 스케일링. 초당 청구", easy: "클러스터 설정 없이 — 코드만! 서버를 자동으로 프로비저닝, 처리, 해제해요." },
      { label: "시험 포인트", text: "빅데이터 처리(Spark/Hadoop) → EMR. S3 데이터 레이크 + EMR 조합. 비용 절감엔 스팟", easy: "수백 TB 데이터 처리, ML 데이터 준비 → EMR! 스팟 인스턴스 = 최대 90% 비용 절감!" }
    ]
  },
  glue: {
    title: "AWS Glue",
    subtitle: "서버리스 ETL 서비스",
    easy: "Glue는 데이터 변환 공장이에요! 서버 없이 S3, RDS, DynamoDB에서 데이터를 자동으로 추출, 정제, 로드해요.",
    points: [
      { label: "ETL 작업", text: "서버리스 Apache Spark 기반. Python/Scala 스크립트 자동 생성. 스케줄 또는 이벤트 트리거", easy: "S3 원시 데이터 추출, 변환(정제), 분석 DB에 로드 — 자동화." },
      { label: "데이터 카탈로그", text: "중앙 메타데이터 저장소. Athena, Redshift Spectrum, EMR과 공유. Glue 크롤러로 자동 탐지", easy: "'S3의 어디에 어떤 데이터가 있는지' — 자동으로 조사하고 카탈로그 생성(크롤러)." },
      { label: "Glue DataBrew", text: "코드 없는 시각적 데이터 준비. 250개 이상의 변환 함수. 비개발자도 사용 가능", easy: "클릭으로 데이터 정제, 코딩 불필요! 엑셀처럼 데이터를 변환해요." },
      { label: "Glue Studio", text: "시각적 ETL 파이프라인 설계. 드래그 앤 드롭. 실시간 모니터링", easy: "그림 그리듯 ETL 파이프라인 연결! 코드 불필요." },
      { label: "시험 포인트", text: "서버리스 ETL → Glue. 데이터 카탈로그 → Glue 카탈로그. Athena 쿼리 전에 크롤러 실행", easy: "S3 데이터 변환/정제 → Glue ETL! Athena로 S3 쿼리는 Glue 카탈로그 필요!" }
    ]
  },
  lakeformation: {
    title: "AWS Lake Formation",
    subtitle: "데이터 레이크 구축 및 보안",
    easy: "Lake Formation은 데이터 레이크(S3 기반 대규모 데이터 저장소)를 쉽게 구축하고 '이 사람은 이 컬럼만 볼 수 있음' 같은 세분화된 접근 제어를 해줘요!",
    points: [
      { label: "데이터 레이크 구축", text: "S3 기반. 데이터 수집, 정제, 분류 자동화. Glue와 긴밀히 통합", easy: "S3에 원시 데이터를 수집하면 Lake Formation이 정제, 보안, 접근 제어를 처리해요." },
      { label: "세분화된 접근 제어", text: "열, 행, 셀 레벨 접근 제어. 데이터 마스킹. 태그 기반 제어(LF-Tags)", easy: "'마케팅 팀은 고객 이름 컬럼 못 봄', 'PII는 마스킹됨' — 세분화된 제어." },
      { label: "통합 서비스", text: "Athena, Redshift Spectrum, EMR, Glue, QuickSight 통합. 중앙화된 권한 관리", easy: "모든 분석 서비스에 일관된 접근 제어 적용. 한 곳에서 권한 관리." },
      { label: "블루프린트", text: "데이터 수집 자동화 템플릿. RDS/S3→데이터 레이크 파이프라인 자동 구축", easy: "클릭 몇 번으로 RDS 데이터를 S3 데이터 레이크에 로드하는 파이프라인 자동 생성." },
      { label: "시험 포인트", text: "데이터 레이크의 세분화된 권한 → Lake Formation. S3 IAM만으로는 행/열 레벨 제어 불가", easy: "S3 데이터 레이크 + 행/열 레벨 접근 제어 → Lake Formation! IAM/S3 정책만으로는 불가!" }
    ]
  },
  quicksight: {
    title: "Amazon QuickSight",
    subtitle: "서버리스 클라우드 BI",
    easy: "QuickSight는 데이터를 차트로 시각화하는 서버리스 BI 도구예요! S3, RDS, Redshift 데이터를 연결해서 즉시 대시보드와 차트를 만들어요.",
    points: [
      { label: "데이터 소스", text: "S3, Athena, RDS/Aurora, Redshift, DynamoDB, Salesforce, 외부 DB", easy: "거의 모든 AWS 데이터 소스에 연결. 클릭 몇 번으로 차트 만들기!" },
      { label: "SPICE", text: "초고속 병렬 인메모리 계산 엔진. 데이터 메모리 캐싱. 빠른 쿼리 응답", easy: "빠른 대시보드 로딩을 위해 데이터를 메모리에 미리 로드해요!" },
      { label: "ML 인사이트", text: "이상 탐지, 예측, 자동 내러티브(자동 생성 설명)", easy: "AI가 자동으로 '이번 달 매출이 비정상적으로 낮음'을 탐지해요! 트렌드 예측도 자동." },
      { label: "임베디드 분석", text: "외부 앱에 대시보드 임베드. SDK. Q(자연어 쿼리). 익명 접근 가능", easy: "'고객 앱에 분석 대시보드 추가'! QuickSight는 앱에 임베드 가능해요." },
      { label: "시험 포인트", text: "서버리스 BI 시각화 → QuickSight. Redshift와 짝꿍. 사용자당 청구(스탠다드/엔터프라이즈)", easy: "데이터 시각화/대시보드 → QuickSight! 다른 BI 도구 대신 AWS 네이티브 선택." }
    ]
  },
  sagemaker: {
    title: "Amazon SageMaker",
    subtitle: "완전 관리형 ML 플랫폼",
    easy: "SageMaker는 ML 모델의 전체 수명 주기 — 빌드, 훈련, 배포를 지원해줘요! 데이터 준비부터 모델 배포까지 하나의 플랫폼에서 모두 해결해요.",
    points: [
      { label: "SageMaker Studio", text: "통합 ML 개발 환경. JupyterLab 기반. 데이터 준비부터 훈련, 배포까지 전체 사이클", easy: "ML을 위한 통합 IDE! Jupyter 노트북 + 데이터 관리 + 실험 추적이 한 화면에." },
      { label: "훈련", text: "관리형 훈련 인스턴스(GPU). 분산 훈련. 스팟 인스턴스(최대 90% 절감). 실험 추적", easy: "GPU 서버 관리 없이 훈련 시작! 스팟으로 훈련 비용 90% 절감." },
      { label: "배포", text: "실시간 엔드포인트(낮은 지연), 서버리스(간헐적 트래픽), 배치 변환(대량 추론)", easy: "모델을 웹 서비스 API로 배포! 서버리스 옵션 = 트래픽 없을 때 비용 제로." },
      { label: "Autopilot & Canvas", text: "AutoML: 자동 피처 엔지니어링, 모델 선택, 하이퍼파라미터 튜닝. Canvas: 코드 없는 ML", easy: "Autopilot = 데이터 넣으면 최적 모델 자동 선택! Canvas = 코딩 없이 ML." },
      { label: "시험 포인트", text: "ML 모델 훈련 및 배포 → SageMaker. 피처 스토어, 모델 레지스트리, 파이프라인. Rekognition과의 차이점", easy: "직접 ML 모델 구축 → SageMaker. 사전 구축 AI API(이미지 인식 등) → Rekognition!" }
    ]
  }
};

export type ConceptKey = keyof typeof CONCEPTS_KO;