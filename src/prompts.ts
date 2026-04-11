// SAA-C03 시험 문제 생성을 위한 Few-shot 프롬프트
// Examtopics 수준의 현실감 높은 문제 생성
// 난이도별로 다른 프롬프트 사용

/**
 * 난이도: 보통 (기본 개념 이해)
 * - 단일 AWS 서비스의 기본 사용 방법
 * - 1개 명백한 함정답 (다른 서비스 선택)
 * - 2개 어느 정도 가능한 선택지
 */
export const SAA_PROBLEM_PROMPT_MEDIUM = `⚠️ **CRITICAL: 응답은 2000~3500 토큰 사이로 작성하세요.**

당신은 AWS SAA-C03 시험의 출제 전문가입니다.
다음 2가지 예시 문제의 스타일, 난이도, 함정답 구조를 정확히 분석하고,
새로운 문제를 **동일한 수준**으로 만들어주세요.

## 📋 생성 시 필수 규칙:
1. **options (선택지)**: 매우 중요! 각 선택지는 **서비스명 + 핵심 특징, 1-2줄 이내**로 작성
   - 실제 AWS 시험 덤프 스타일로 간결하게
   - 예: "자동 교체 기능이 있는 AWS KMS 키(SSE-KMS)를 사용한 서버 측 암호화를 활성화합니다."
   - 예: "S3 버킷에 대한 S3 객체 잠금을 거버넌스 모드로 활성화합니다."
   - 서비스 이름을 명확히 쓰고, 불필요한 흐름 설명은 생략
   - **[보통 난이도 함정답 원칙]**: 함정답은 완전히 다른 서비스 → 틀린 이유가 명확함
     예) 정답: S3 객체 잠금 / 함정: CloudTrail 활성화, RDS 백업, CloudWatch 경보
2. **goal (핵심 목표)**: 이 문제가 테스트하는 핵심 목표를 한 문장으로 명확히
3. **keywords (핵심 키워드)**: 문제에서 가장 중요한 AWS 개념 최대 4개 (4개 이하로 제한)
4. **easyMode 설명**: 초등학교 5학년도 이해하는 비유법 사용
   - 각 선택지를 어린이 수준으로 설명
   - 함정답이 왜 틀렸는지 쉽게 설명
5. **explanation.correct**: 정답이 왜 맞는지 기술적으로 명확하게
6. **explanation.trap_***: 각 함정답이 정확히 어느 부분에서 실패하는지 구체적으로
7. **SAA 시험용 요점**: 시험에서 자주 출제되는 핵심 개념 정리

## 예시 1 (Q73) - 보안 그룹 설정 (Bastion Host + Application)

**시나리오**: 한 회사는 최근 프라이빗 서브넷의 Amazon EC2에서 Linux 기반 애플리케이션 인스턴스를 시작했고, VPC의 퍼블릭 서브넷에 있는 Amazon EC2 인스턴스에서 Linux 기반 배스천 호스트를 시작했습니다. 솔루션 설계자는 **사내 네트워크에서 회사의 인터넷 연결을 통해 배스천 호스트와 애플리케이션 서버 모두에 접속**해야 합니다. 모든 EC2 인스턴스의 보안 그룹이 이러한 액세스를 허용하는지 확인해야 합니다.

**제약조건**:
1. 사내 네트워크 → 배스천 호스트 (퍼블릭 서브넷)로 접속 가능
2. 배스천 호스트 → 애플리케이션 서버 (프라이빗 서브넷)로 SSH 접속 가능
3. 최소 권한 원칙 준수 (불필요한 포트 개방 금지)

**문제**: 솔루션 설계자가 취해야 할 보안 그룹 구성 단계는? (2개 선택)

A. 배스천 호스트의 보안 그룹을 애플리케이션 인스턴스의 인바운드 액세스만 허용하도록 교체합니다.
B. 배스천 호스트의 보안 그룹을 회사의 내부 IP 범위에서만 인바운드 액세스를 허용하도록 교체합니다.
C. 배스천 호스트의 보안 그룹을 회사의 외부 IP 범위(인터넷 외부 IP)에서만 인바운드 액세스를 허용하도록 교체합니다.
D. 애플리케이션 인스턴스의 보안 그룹을 배스천 호스트의 개인 IP 주소에서만 인바운드 SSH 액세스를 허용하도록 교체합니다.
E. 애플리케이션 인스턴스의 보안 그룹을 배스천 호스트의 공용 IP 주소에서만 인바운드 SSH 액세스를 허용하도록 교체합니다.

**정답**: C, D

**핵심 설명**:
- **아키텍처**: 사내네트워크(내부IP) → 인터넷 게이트웨이(외부IP로 변환) → Bastion Host(퍼블릭) → Application(프라이빗, 내부IP 통신)
- **Bastion Host 역할**: 프라이빗 서브넷의 애플리케이션으로 접속하는 유일한 진입점. SSH 터널 역할
- **정답 C (배스천 호스트 보안 그룹)**:
  * 사내에서 인터넷으로 나오는 트래픽은 회사의 외부 IP 범위(External IP)
  * 공용 인터넷을 통해 배스천 호스트에 도달하므로 외부 IP 범위에서의 인바운드 허용 필요
  * 내부 IP 범위(B)는 온프레미스 사내 네트워크의 IP → 인터넷을 거쳐 외부IP가 되므로 오답
- **정답 D (애플리케이션 보안 그룹)**:
  * 배스천 호스트에서 애플리케이션으로 SSH 접속할 때는 배스천의 프라이빗 IP 사용
  * 프라이빗 서브넷 내에서는 배스천의 프라이빗 IP로 통신
  * 공용 IP(E)는 프라이빗 서브넷 내에서 불필요 (라우팅 불가)
- **함정답 분석**:
  * A: "애플리케이션의 인바운드만" → 쌍방향 통신 불가능
  * B: "내부 IP" → 인터넷을 거친 외부 IP가 아님 (NAT 후 외부 IP로 변환됨)
  * E: 공용 IP 사용 → 프라이빗 서브넷에 프라이빗 IP로만 도달 가능
- **Stateful SG 개념**: 보안 그룹은 인바운드 규칙 생성 시 해당 요청에 대한 아웃바운드 자동 허용 (명시적 아웃바운드 규칙 불필요)

## 예시 2 (Q77) - 실시간 데이터 수집 (운영 오버헤드 최소화)

**시나리오**: 회사는 애플리케이션에 대한 실시간 데이터 수집 아키텍처를 구성해야 합니다. 여러 소스에서 초당 수천 개의 이벤트가 발생합니다. 회사는 데이터가 스트리밍될 때 변환하는 프로세스와 데이터를 위한 스토리지 솔루션이 필요합니다. 대부분의 팀이 기존 기술에만 익숙하므로 **최소한의 운영 오버헤드**가 중요합니다.

**제약조건**: 실시간 스트리밍 처리, 최소 운영 오버헤드, 데이터 변환 + 자동 저장

**문제**: 솔루션 아키텍트의 추천은 무엇입니까?

A. Amazon EC2 인스턴스를 배포하여 Amazon Kinesis Data Streams로 데이터를 전송하는 API를 호스팅합니다. Kinesis Data Streams를 Kinesis Data Firehose와 연결합니다. AWS Lambda 함수를 사용하여 데이터를 변환합니다. Firehose에서 Amazon S3로 자동 전달합니다.
B. Amazon EC2 인스턴스를 배포하여 API를 호스팅하고 AWS Glue로 데이터를 전송합니다. EC2에서 직접 변환 작업을 수행합니다. 변환된 데이터를 Amazon S3로 저장합니다.
C. Amazon API Gateway API를 구성하여 Amazon Kinesis Data Streams로 데이터를 직접 전송합니다. Kinesis Data Streams를 Kinesis Data Firehose와 연결합니다. AWS Lambda 함수로 데이터를 변환합니다. Firehose에서 데이터를 Amazon S3로 자동으로 전달합니다.
D. Amazon API Gateway API를 구성하여 데이터를 AWS Glue로 보냅니다. AWS Lambda 함수로 데이터를 변환합니다. AWS Glue에서 Amazon S3로 보냅니다.

**정답**: C

**핵심 설명**:
- **아키텍처**: 여러 소스 → API → Kinesis Streams → Firehose → S3 (with Lambda 변환)
- **API Gateway 특징**: 완전관리형 API 서비스, 서버 관리 불필요 (운영 오버헤드 최소)
- **Kinesis Data Streams**: 실시간 스트리밍 데이터 수집, 초당 수천 이벤트 처리 가능
- **Kinesis Data Firehose**: 스트림 → S3 자동 전달, Lambda 변환 지원, 배치 처리 자동화
- **Lambda**: 서버리스 변환 (자동 스케일링)
- **AWS Glue 특징**: ETL 배치 처리 서비스 (실시간 스트리밍에 부적합, 지연 발생) → D 오답
- **함정답 분석**:
  * A: EC2 관리 필요 (운영 오버헤드 증가)
  * B: EC2 관리 + Glue 부적합 (배치 처리, 실시간 부적합)
  * D: Glue의 특성 오류 (실시간 스트리밍에 부적합)

---

## 이제 새로운 문제를 생성해주세요.

**새로운 문제의 생성 원칙:**

### 1. 시나리오 (1-2문장, 간결)
- 매 문제마다 다른 업종 사용 (제조업체, 금융사, SaaS, 의료기관, 이커머스, 미디어, 게임사, 공공기관, 보험사, 물류, 스타트업, 교육 등)
- 핵심 요구사항만 1-2문장으로 명시 — 제약조건은 별도 나열하지 않고 시나리오 안에 자연스럽게 포함
- 수치는 꼭 필요한 경우만 포함 (매번 다르게: 보관기간 1년/3년/7년, 비용 절감 30% 등, 가용성 수치 표현 금지)

### 2. 선택지 A~D (덤프 스타일, 2-3줄 이내)
- **서비스명 + 핵심 특징** 위주로 간결하게 작성
- 아키텍처 흐름 설명은 최소화, 서비스 선택의 핵심 이유만 포함
- 수치는 생략, 불필요한 문장 연결 제거
- 1개 정답: 모든 제약조건 완벽 충족
- 3개 함정답:
  * 1개: 거의 맞지만 1가지 제약만 미충족 (가장 실수하기 쉬운 오답)
  * 1개: 거의 맞지만 다른 1가지 제약 미충족
  * 1개: 기술적으로 동작하지만 요구사항 불일치

### 4. 정답 및 상세 설명 (Examtopics Q73-Q77 수준)
**architecture**: 전체 데이터/요청 흐름을 명확히 (예: "사내IP → 인터넷 → 외부IP → AWS → 프라이빗 서브넷")
**correct**: 모든 제약조건이 어떻게 만족되는지 + AWS 서비스별 핵심 특징 설명
**service_features**: 정답에 사용된 각 AWS 서비스의 특징 + 한계 설명
**trap_A, B, C**:
  - 각 함정답이 어느 제약조건을 놓쳤는지 명시
  - 그 서비스/옵션의 기술적 특징과 제한사항 설명
  - 왜 그것이 미흡한지에 대한 기술적 근거 제시

### 5. 핵심 패턴 (3개)
- 이 문제에서 테스트하는 핵심 개념
- SAA 시험에서 자주 나오는 함정
- 이 문제로부터 배울 수 있는 AWS 아키텍처 원칙

**주어진 서비스:** \${SERVICE_NAMES}
**난이도:** \${DIFFICULTY}

JSON 형식으로 응답해주세요 (마크다운 없이 순수 JSON만, 모든 값은 한 줄):
{
  "question": "1-2문장의 간결한 시나리오 (핵심 요구사항과 제약조건이 자연스럽게 포함)",
  "options": {
    "A": "Amazon RDS Multi-AZ 배포를 사용하여 자동 장애 조치를 구성합니다.",
    "B": "AWS KMS 관리형 키(SSE-KMS)를 사용하여 S3 버킷의 서버 측 암호화를 활성화합니다.",
    "C": "Amazon S3 객체 잠금을 컴플라이언스 모드로 활성화하고 보존 기간을 설정합니다.",
    "D": "AWS Backup을 사용하여 중앙 집중식 백업 정책을 생성하고 보존 기간을 구성합니다."
  },
  "answer": "B",
  "keywords": ["핵심 개념1", "핵심 개념2", "핵심 개념3"],
  "goal": "이 문제가 테스트하는 핵심 목표 한 문장 (예: 데이터 삭제 방지의 가장 강력한 보안 방법)",
  "easyMode": {
    "explanation": "정답을 어린이 수준으로 1-2문장. 비유법 1개 포함",
    "A": "A가 왜 맞는지/틀린지 1문장",
    "B": "B가 왜 맞는지/틀린지 1문장",
    "C": "C가 왜 맞는지/틀린지 1문장",
    "D": "D가 왜 맞는지/틀린지 1문장"
  },
  "explanation": {
    "goal": "다중 리전에서 글로벌 읽기 성능을 최소 지연으로 달성하면서 관리형 서비스로 운영 복잡도를 제거하고 비용 효율성을 실현하는 것.",
    "correct": "정답은 다중 리전 읽기 복제(DynamoDB 글로벌 테이블)로 읽기 지연을 최소화하고, CloudFront 캐싱으로 콘텐츠 전달을 가속화합니다. Lambda + DynamoDB 조합은 관리형 서비스로 운영 오버헤드를 제거하고, 자동 스케일링으로 비용 효율성을 실현합니다.",
    "trap_A": "선택지 A는 RDS 읽기 복제본이 단일 리전 내에만 제한되어 글로벌 읽기 성능 요구사항을 충족하지 못합니다.",
    "trap_B": "선택지 B는 온프레미스 시스템을 유지하기 위해 VPN 오버헤드로 인한 지연이 발생하며, 클라우드 인프라의 확장성 이점을 활용하지 못합니다.",
    "trap_C": "선택지 C는 S3 + Glacier 구성이 빈번한 데이터 액세스 시 Glacier 검색 비용이 높아져 비용 최적화 요구사항을 충족하지 못합니다."
  },
  "patterns": ["패턴1: 다중 리전 아키텍처에서 글로벌 테이블의 중요성", "패턴2: CloudFront와 관리형 DB의 조합으로 성능 최적화", "패턴3: 온프레미스 vs 클라우드 네이티브 아키텍처 선택 기준"]
}

⚠️ 필수사항:
1. 모든 값은 반드시 한 줄로 작성 (줄바꿈 금지)
2. easyMode 설명은 각 필드 1문장으로 간결하게 작성
3. 함정답(trap_*)은 "정책적 한계", "기술적 불가능", "다른 용도" 등으로 분류해서 설명`;

/**
 * 난이도: 어려움 (복합 조건 분석)
 * - 2~3개 AWS 서비스 조합
 * - 2개의 정교한 함정답 (각각 1가지 제약 미충족)
 * - 실무 수준의 아키텍처 이해 필요
 */
export const SAA_PROBLEM_PROMPT_HARD = `⚠️ **CRITICAL: 응답은 2000~3500 토큰 사이로 작성하세요.**

당신은 AWS SAA-C03 시험 출제 전문가입니다.
다음은 "어려움" 난이도의 예시 문제입니다. 복합적인 제약조건과 정교한 함정답 구조를 분석하세요.

## 예시: 복합 조건 문제 (어려움)

**특징**:
- 2~3개 AWS 서비스를 조합하여 해결
- 제약조건 2~3개가 서로 연관됨
- 함정답: 거의 맞지만 비용, 성능, 운영 측면 중 하나 미충족
- 실무 시나리오 (구체적 수치 + 비즈니스 맥락)

**시나리오 예**: "월 500GB 데이터, 초당 2000 요청, 높은 가용성 요구"
**제약조건**:
1. 성능: 레이턴시 < 100ms
2. 비용: 예산 이내
3. 가용성: 다중 AZ 구성

**함정답 구조**:
- A: 비용은 맞지만 성능 미흡 (단일 AZ)
- B: 성능 + 가용성 OK 하지만 비용 초과
- C: 모든 조건 만족 ✅
- D: 성능은 최고이지만 비용 2배 + 불필요한 기능

**새로운 문제 조건**:
- 시나리오: 1-2문장으로 간결하게, 핵심 요구사항을 시나리오 안에 자연스럽게 포함
- 선택지: 서비스명 + 핵심 특징, **1-2줄 이내** 덤프 스타일
- **[어려움 함정답 원칙]**: 함정답은 비슷한 서비스지만 용도/설정이 다름
  예) 정답: SSE-KMS / 함정A: SSE-S3(키 관리 불가), 함정B: 클라이언트 측 암호화(운영 복잡), 함정C: Macie(탐지만 됨, 암호화 아님)
  → 서비스 카테고리는 같지만 요구사항의 한 측면에서 실패
- 정답: 모든 요구사항 완벽 충족
- 함정: 각각 다른 1개 요구사항 미충족

**주어진 서비스:** \${SERVICE_NAMES}
**난이도:** \${DIFFICULTY}

JSON 형식으로 응답 (마크다운 없이 순수 JSON, 모든 값은 한 줄):
{
  "question": "1-2문장 간결한 시나리오 (핵심 요구사항이 문장 안에 자연스럽게 포함)",
  "options": {
    "A": "서비스명 + 핵심 설정/특징 (1-2줄, 덤프 스타일)",
    "B": "서비스명 + 핵심 설정/특징 (1-2줄, 덤프 스타일)",
    "C": "서비스명 + 핵심 설정/특징 (1-2줄, 덤프 스타일)",
    "D": "서비스명 + 핵심 설정/특징 (1-2줄, 덤프 스타일)"
  },
  "answer": "C",
  "keywords": ["키워드1", "키워드2", "키워드3"],
  "goal": "이 문제가 테스트하는 핵심 목표",
  "easyMode": {
    "explanation": "정답을 어린이 수준으로 1-2문장. 비유법 1개 포함",
    "A": "A가 왜 맞는지/틀린지 1문장",
    "B": "B가 왜 맞는지/틀린지 1문장",
    "C": "C가 왜 맞는지/틀린지 1문장",
    "D": "D가 왜 맞는지/틀린지 1문장"
  },
  "explanation": {
    "goal": "문제의 핵심 목표를 한 문장으로 명확히",
    "correct": "정답이 왜 모든 제약을 만족하는지 기술적으로 상세히",
    "trap_A": "선택지 A가 정확히 어느 제약을 미충족하는지 + 기술적 이유",
    "trap_B": "선택지 B가 정확히 어느 제약을 미충족하는지 + 기술적 이유",
    "trap_C": "선택지 C가 정확히 어느 제약을 미충족하는지 + 기술적 이유"
  },
  "patterns": ["패턴1: 시험에 자주 출제되는 개념", "패턴2: 유사 서비스와의 차이점"]
}`;

/**
 * 난이도: 챌린지 (실무 수준)
 * - 3~4개 AWS 서비스 복합 조합
 * - 3개의 매우 정교한 함정답 (각각 서로 다른 미충족 요소)
 * - 실제 Examtopics 최고 난이도 수준
 */
export const SAA_PROBLEM_PROMPT_CHALLENGE = `⚠️ **CRITICAL: 응답은 2000~3500 토큰 사이로 작성하세요.**

당신은 AWS SAA-C03 시험 출제 전문가입니다.
다음은 "챌린지" 난이도의 예시 입니다. 매우 정교하고 현실감 높은 아키텍처 문제를 분석하세요.

## 예시: 최고 난이도 문제 (챌린지)

**특징**:
- 3~4개 AWS 서비스 조합 (예: VPC + Auto Scaling + RDS + CloudFront)
- 제약조건 3개 이상, 상호 연관성 높음
- 함정답: 매우 정교함 (거의 모든 조건을 만족하지만 1개 세부 사항 놓침)
- 실무 상황: "온프레미스 ↔ AWS 하이브리드", "멀티 리전", "규제 준수" 등

**시나리오 예**:
"은행이 온프레미스 레거시 시스템에서 AWS로 마이그레이션.
월 10TB 거래 데이터, 고가용성 보장, HIPAA 준수"

**제약조건**:
1. 기술: Direct Connect + Multi-AZ + 암호화
2. 비즈니스: 예산 이내, 데이터 완전성 보장
3. 운영: 기존 인력(AWS 미경험) 으로 관리 가능
4. 규제: HIPAA 준수, 데이터 거주지 미국 내

**함정답 구조**:
- A: Direct Connect + RDS Multi-AZ 하지만 HIPAA 감사 기능 미흡
- B: 모든 기술 + HIPAA 하지만 기존 인력으로 운영 어려움 (복잡함)
- C: 모든 조건 완벽 충족 ✅
- D: 기술은 최고 (Global Table) 하지만 비용 초과 + 불필요한 복잡성

**새로운 문제 조건**:
- 시나리오: 온프레미스 ↔ AWS, 멀티 리전, 규제/컴플라이언스, 마이그레이션 등 실무 시나리오, 1-2문장
- 선택지: 서비스명 + 핵심 특징, **1-2줄 이내** 덤프 스타일
- **[챌린지 함정답 원칙]**: 함정답은 정답과 거의 동일한 서비스를 쓰지만 세부 옵션·모드·설정이 다름
  예) 정답: S3 객체 잠금 컴플라이언스 모드 / 함정A: S3 객체 잠금 거버넌스 모드(관리자가 삭제 가능), 함정B: S3 버전 관리만 활성화(잠금 없음), 함정C: Glacier Vault Lock(S3가 아님)
  → 보기만 봐서는 거의 구별 불가 수준, 서비스 세부 동작 차이를 알아야 정답 가능
- 정답: 모든 요구사항 완벽 충족
- 함정: A/B/D 각각 세부 설정/모드/동작 방식이 달라 1개 요구사항 미충족

**주어진 서비스:** \${SERVICE_NAMES}
**난이도:** \${DIFFICULTY}

JSON 형식으로 응답 (마크다운 없이 순수 JSON, 모든 값은 한 줄):
{
  "question": "1-2문장 간결한 시나리오 (핵심 요구사항이 문장 안에 자연스럽게 포함)",
  "options": {
    "A": "서비스명 + 핵심 설정/모드/특징 (1-2줄, 덤프 스타일, 정답과 미묘하게 다름)",
    "B": "서비스명 + 핵심 설정/모드/특징 (1-2줄, 덤프 스타일)",
    "C": "서비스명 + 핵심 설정/모드/특징 (1-2줄, 덤프 스타일, 정답)",
    "D": "서비스명 + 핵심 설정/모드/특징 (1-2줄, 덤프 스타일, 정답과 미묘하게 다름)"
  },
  "answer": "C",
  "keywords": ["키워드1", "키워드2", "키워드3"],
  "goal": "이 문제가 테스트하는 핵심 목표",
  "easyMode": {
    "explanation": "정답을 어린이 수준으로 1-2문장. 비유법 1개 포함",
    "A": "A가 왜 맞는지/틀린지 1문장",
    "B": "B가 왜 맞는지/틀린지 1문장",
    "C": "C가 왜 맞는지/틀린지 1문장",
    "D": "D가 왜 맞는지/틀린지 1문장"
  },
  "explanation": {
    "goal": "온프레미스와 클라우드를 안전하게 통합하면서 성능, 비용, 규제 준수를 동시에 달성하는 것",
    "correct": "모든 4개 제약을 어떻게 동시에 만족하는지 상세히 + 기술적 근거",
    "trap_A": "선택지 A가 정확히 어느 제약(기술/비즈니스/운영/규제)을 미충족하는지 명시 + 기술적 이유",
    "trap_B": "선택지 B가 정확히 어느 제약을 미충족하는지 명시 + 실제 부작용",
    "trap_C": "선택지 C가 정확히 어느 제약을 미충족하는지 명시 + 비용/복잡성 영향"
  },
  "patterns": ["패턴1: 하이브리드 아키텍처의 핵심", "패턴2: 규제 준수와 기술의 충돌", "패턴3: 비용 vs 기술의 트레이드오프"]
}`;

export const SAA_PROBLEM_PROMPT_EN = `⚠️ **CRITICAL: Response should be 2000-3500 tokens.**

You are an AWS SAA-C03 exam expert.
Analyze the style, difficulty level, and trick answer structure of the following 2 example questions,
and create a new problem at **the same level**.

## Example 1 (Q76) - On-premises Data Transfer
Scenario: A company receives 10TB of measurement data daily from multiple machines in a single factory. The data is stored as JSON files in a SAN (Storage Area Network) in an on-premises data center. The company wants to transfer this data to Amazon S3 for real-time analysis by multiple systems. **Secure transmission is critical because the data is considered sensitive.**

What is the most reliable data transfer solution?

A. Use AWS DataSync over public internet. Enable encryption for data transfer.
B. Use AWS DataSync over AWS Direct Connect. DataSync includes automatic encryption and data integrity validation.
C. Use AWS Database Migration Service (AWS DMS) over public internet. Encrypt data via SSL/TLS.
D. Use AWS Database Migration Service (AWS DMS) over AWS Direct Connect. Enable encryption for data transfer.

Answer: B
Key Points:
- DataSync: Automates secure data movement between on-premises and AWS storage services
- DMS: Database migration service (not suitable for file transfer) → C, D incorrect
- Public Internet: Security risk for sensitive data → A incorrect
- Direct Connect: Dedicated network connection (enhanced security)
- Trick answers: A/C lack security with public internet, D uses wrong service entirely

## Example 2 (Q77) - Real-time Data Collection (Minimize Operational Overhead)
Scenario: A company must configure a real-time data collection architecture for an application. Thousands of events occur per second from multiple sources. The company needs a process that transforms data as it streams and a storage solution. **Minimal operational overhead is critical** because most teams are familiar only with legacy technology.

What is the solutions architect's recommendation?

A. Deploy Amazon EC2 instances to host an API that sends data to Amazon Kinesis Data Streams. Connect Kinesis Data Streams to Kinesis Data Firehose. Use AWS Lambda functions to transform data. Firehose automatically delivers to Amazon S3.
B. Deploy Amazon EC2 instances to host an API and send data to AWS Glue. Perform transformation directly on EC2. Store transformed data in Amazon S3.
C. Configure an Amazon API Gateway API to send data directly to Amazon Kinesis Data Streams. Connect Kinesis Data Streams to Kinesis Data Firehose. Use AWS Lambda functions to transform data. Firehose automatically delivers data to Amazon S3.
D. Configure an Amazon API Gateway API to send data to AWS Glue. Use AWS Lambda functions to transform data. Send data from AWS Glue to Amazon S3.

Answer: C
Key Points:
- API Gateway: Fully managed API service (no EC2 management needed) → A, B increase operational overhead
- Kinesis Data Streams: Real-time streaming data ingestion
- Kinesis Data Firehose: Automatic stream to S3 delivery with transformation capability
- Lambda: Serverless transformation
- Glue: Batch ETL service (not suitable for real-time streaming) → D incorrect
- Trick answers: A (EC2 overhead), B (EC2 + Glue unsuitable), D (Glue not for real-time streaming)

---

## Now generate a new problem.

**New Problem Conditions:**
1. Scenario: 1-2 sentences, concise — use a different industry each time (manufacturer, bank, SaaS, healthcare, e-commerce, media, gaming, government, insurance, logistics, startup, edtech, etc.). Key requirements included naturally in the scenario, NOT listed separately as constraints.
2. Options A-D (exam dump style):
   - Each option: service name + key characteristic, **1-2 lines max**
   - No architecture flow descriptions — brief and direct like real exam dumps
   - Example: "Enable server-side encryption using AWS KMS managed keys (SSE-KMS) with automatic key rotation."
   - **[Medium trick answer rule]**: Trick answers use completely different services — the wrong reason is obvious
   - 1 correct answer: meets all requirements
   - 3 trick answers: each missing 1 different requirement
3. Answer and detailed explanation:
   - Why the correct answer meets all requirements
   - Which requirement each trick answer fails to meet

**Given services:** \${SERVICE_NAMES}
**Difficulty:** \${DIFFICULTY}

Respond in JSON format (pure JSON, all values on single line, no markdown):
{
  "question": "1-2 sentence concise scenario (key requirements naturally embedded in the sentence)",
  "options": {
    "A": "Service name + key characteristic, concise dump style",
    "B": "Service name + key characteristic, concise dump style",
    "C": "Service name + key characteristic, concise dump style",
    "D": "Service name + key characteristic, concise dump style"
  },
  "answer": "B",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "goal": "Core objective this problem tests",
  "easyMode": {
    "explanation": "Explain correct answer in 1-2 sentences for a child. Include 1 analogy",
    "A": "1 sentence: why A is correct or wrong",
    "B": "1 sentence: why B is correct or wrong",
    "C": "1 sentence: why C is correct or wrong",
    "D": "1 sentence: why D is correct or wrong"
  },
  "explanation": {
    "architecture": "Overall architecture flow and role of each component",
    "goal": "Core objective of the problem in one sentence",
    "correct": "Why answer meets all constraints with technical detail",
    "trap_A": "Which constraint option A fails to meet + technical reason",
    "trap_B": "Which constraint option B fails to meet + technical reason",
    "trap_C": "Which constraint option C fails to meet + technical reason"
  },
  "patterns": ["Pattern 1: Frequently tested concept", "Pattern 2: Comparison between similar services"]
}`;

export const SAA_PROBLEM_PROMPT_JA = `⚠️ **重要：レスポンスは正確に2000トークン以内である必要があります。超過しないでください。**

あなたはAWS SAA-C03試験の専門家です。
以下の2つの例題のスタイル、難易度レベル、トリック選択肢の構造を分析し、
**同じレベルで**新しい問題を作成してください。

## 例1 (Q76) - オンプレミスデータ転送
シナリオ: 会社は単一工場の複数の機械から毎日10TBの測定データを受信します。データはオンプレミスデータセンターのSAN(Storage Area Network)にJSON ファイルとして保存されています。会社はこのデータをAmazon S3に転送して、複数のシステムによるリアルタイム分析に利用できるようにしたいと考えています。**データは機密であるため、安全な転送が重要です。**

最も信頼性の高いデータ転送ソリューションは何ですか?

A. パブリックインターネット経由でAWS DataSyncを使用します。データ転送の暗号化を有効にします。
B. AWS Direct Connect経由でAWS DataSyncを使用します。DataSyncは自動暗号化とデータ整合性検証を含みます。
C. パブリックインターネット経由でAWS Database Migration Service(AWS DMS)を使用します。SSL/TLSを介してデータを暗号化します。
D. AWS Direct Connect経由でAWS Database Migration Service(AWS DMS)を使用します。データ転送の暗号化を有効にします。

答え: B
重要なポイント:
- DataSync: オンプレミスとAWSストレージサービス間の安全なデータ移動を自動化
- DMS: データベース移行サービス(ファイル転送に不適切) → C、D不正解
- パブリックインターネット: 機密データのセキュリティリスク → A不正解
- Direct Connect: 専用ネットワーク接続(セキュリティ強化)
- トリック選択肢: A/Cはパブリックインターネットでセキュリティ不足、Dは完全に異なるサービス

## 例2 (Q77) - リアルタイムデータ収集(運用オーバーヘッドの最小化)
シナリオ: 会社はアプリケーション用のリアルタイムデータ収集アーキテクチャを構成する必要があります。複数のソースから毎秒数千のイベントが発生します。会社はデータを流れるときに変換するプロセスとストレージソリューションが必要です。**運用オーバーヘッドの最小化が重要です**。ほとんどのチームはレガシー技術にのみ精通しています。

ソリューションアーキテクトの推奨事項は何ですか?

A. Amazon EC2インスタンスをデプロイしてAmazon Kinesis Data Streamsにデータを送信するAPIをホストします。Kinesis Data StreamsをKinesis Data Firehoseに接続します。AWS Lambda関数を使用してデータを変換します。FirehoseはAmazon S3に自動配信します。
B. Amazon EC2インスタンスをデプロイしてAPIをホストし、AWS Glueにデータを送信します。EC2で直接変換作業を実行します。変換されたデータをAmazon S3に保存します。
C. Amazon API Gateway APIを構成して、Amazon Kinesis Data Streamsに直接データを送信します。Kinesis Data StreamsをKinesis Data Firehoseに接続します。AWS Lambda関数を使用してデータを変換します。Firehoseはデータを自動的にAmazon S3に配信します。
D. Amazon API Gateway APIを構成してAWS Glueにデータを送信します。AWS Lambda関数を使用してデータを変換します。AWS GlueからAmazon S3に送信します。

答え: C
重要なポイント:
- API Gateway: フルマネージドAPIサービス(EC2管理不要) → A、Bは運用オーバーヘッド増加
- Kinesis Data Streams: リアルタイムストリーミングデータの取り込み
- Kinesis Data Firehose: ストリームからS3への自動配信、変換可能
- Lambda: サーバーレス変換
- Glue: バッチETLサービス(リアルタイムストリーミング不適切) → D不正解
- トリック選択肢: A(EC2オーバーヘッド)、B(EC2 + Glue不適切)、D(Glueはリアルタイムストリーミングに不適切)

---

## 新しい問題を生成してください。

**新しい問題の条件:**
1. シナリオ: 1~2文で簡潔に — 毎回異なる業種(製造業、金融、SaaS、医療、Eコマース、メディア、ゲーム、公共機関、保険、物流、スタートアップ、教育など)。制約条件は別途列挙せず、シナリオ文の中に自然に含める。
2. 選択肢A~D (試験ダンプスタイル):
   - サービス名 + 核心的な特徴、**1~2行以内**
   - アーキテクチャフローの説明は最小限、実際の試験ダンプのように簡潔に
   - 例: 「自動キーローテーション機能付きのAWS KMS管理キー(SSE-KMS)を使用したサーバー側暗号化を有効にします。」
   - **[普通のトリック選択肢原則]**: トリック選択肢は全く異なるサービス → 間違いの理由が明確
   - 1つの正解: すべての要件を満たす
   - 3つのトリック選択肢: それぞれ異なる1つの要件を満たさない
3. 答えと詳細説明:
   - なぜ正解がすべての要件を満たすのか
   - 各トリック選択肢がどの要件を満たさないか明示

**与えられたサービス:** \${SERVICE_NAMES}
**難易度:** \${DIFFICULTY}

JSON形式で応答してください:
{
  "question": "1~2文の簡潔なシナリオ (核心要件が文の中に自然に含まれる)",
  "options": {
    "A": "サービス名 + 核心的な特徴、簡潔なダンプスタイル",
    "B": "サービス名 + 核心的な特徴、簡潔なダンプスタイル",
    "C": "サービス名 + 核心的な特徴、簡潔なダンプスタイル",
    "D": "サービス名 + 核心的な特徴、簡潔なダンプスタイル"
  },
  "answer": "B",
  "explanation": {
    "correct": "正解の理由 + AWSサービスの特徴",
    "trap_A": "トリック選択肢 A - どの制約を満たさないか",
    "trap_C": "トリック選択肢 C - どの制約を満たさないか",
    "trap_D": "トリック選択肢 D - どの制約を満たさないか"
  },
  "patterns": ["この問題の重要なパターン 1", "重要なパターン 2"]
}`;

export const SAA_PROBLEM_PROMPT_EN_HARD = `⚠️ **CRITICAL: Response should be 2000-3500 tokens.**

You are an AWS SAA-C03 exam expert.
The following shows a "Hard" difficulty-level example. Analyze complex constraints and sophisticated trap answer structures.

## Example: Complex Multi-Service Problem (Hard Difficulty)

**Characteristics:**
- Combines 2-3 AWS services to solve
- 2-3 interconnected constraints
- Trick answers: Almost correct but missing one aspect (cost, performance, or operational efficiency)
- Real-world scenarios with specific numbers and business context

**Example Scenario:** "500GB monthly data, 2000 requests/sec, high availability required"
**Constraints:**
1. Performance: Latency < 100ms
2. Cost: Within budget
3. Availability: Multi-AZ configuration

**Trap Answer Structure:**
- A: Meets cost but lacks performance (single AZ)
- B: Performance + availability OK but exceeds budget
- C: All constraints satisfied ✅
- D: Highest performance but 2x cost + unnecessary features

**New Problem Requirements:**
- Scenario: 1-2 sentences, concise — key requirements naturally embedded in the scenario text
- Options: Exam dump style — service name + key characteristic, **1-2 lines max**
- **[Hard trick answer rule]**: Trick answers use similar services but wrong configuration/purpose
  e.g., Correct: SSE-KMS / Trap A: SSE-S3 (no key control), Trap B: client-side encryption (operational overhead), Trap C: Macie (detection only, not encryption)
  → Same category of service, but fails on one specific requirement
- Correct answer: Satisfies all requirements perfectly
- Trap answers: Each fails 1 different requirement

**Given Services:** \${SERVICE_NAMES}
**Difficulty:** \${DIFFICULTY}

Response in JSON format (pure JSON, all values on single line, no markdown):
{
  "question": "1-2 sentence concise scenario (key requirements naturally embedded)",
  "options": {
    "A": "Service name + key setting/characteristic (1-2 lines, dump style)",
    "B": "Service name + key setting/characteristic (1-2 lines, dump style)",
    "C": "Service name + key setting/characteristic (1-2 lines, dump style)",
    "D": "Service name + key characteristic, concise dump style"
  },
  "answer": "C",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "goal": "Core objective this problem tests",
  "easyMode": {
    "explanation": "Explain correct answer in 1-2 sentences for a child. Include 1 analogy",
    "A": "1 sentence: why A is correct or wrong",
    "B": "1 sentence: why B is correct or wrong",
    "C": "1 sentence: why C is correct or wrong",
    "D": "1 sentence: why D is correct or wrong"
  },
  "explanation": {
    "goal": "Core objective that integrates multiple constraints (reliability + cost + performance)",
    "correct": "How each constraint is satisfied + technical reasoning + cost/performance calculation",
    "trap_A": "Which constraint is missed + why this choice fails + technical reason",
    "trap_B": "Which constraint is missed + specific cost/performance impact",
    "trap_C": "Which constraint is missed + alternative solution or budget overage"
  },
  "patterns": ["Core pattern 1: Frequently tested concept", "Core pattern 2: Service comparison and tradeoffs"]
}`;

export const SAA_PROBLEM_PROMPT_EN_CHALLENGE = `⚠️ **CRITICAL: Response should be 2000-3500 tokens.**

You are an AWS SAA-C03 exam expert.
The following shows a "Challenge" difficulty-level example. Analyze highly sophisticated and realistic architecture problems.

## Example: Highest Difficulty Problem (Challenge)

**Characteristics:**
- 3-4 AWS services combined (e.g., VPC + Auto Scaling + RDS + CloudFront)
- 3+ interconnected constraints with high correlation
- Trick answers: Extremely sophisticated (satisfies almost all conditions but misses 1 critical detail)
- Real-world situations: "On-premises ↔ AWS hybrid", "Multi-region", "Compliance requirements"

**Example Scenario:**
"Bank migrating legacy on-premises system to AWS.
Monthly 10TB transaction data, high availability required, HIPAA compliance"

**Constraints:**
1. Technical: Direct Connect + Multi-AZ + Encryption
2. Business: Within budget, data integrity guaranteed
3. Operational: Manageable by existing staff (AWS-inexperienced)
4. Regulatory: HIPAA compliance, data residency within US

**Trap Answer Structure:**
- A: Direct Connect + RDS Multi-AZ but HIPAA audit functions insufficient
- B: All technical + HIPAA but hard for existing staff to operate (too complex)
- C: All constraints perfectly satisfied ✅
- D: Highest tech (Global Table) but cost exceeds budget + unnecessary complexity

**New Problem Requirements:**
- Scenario: 1-2 sentences, concise — key requirements (compliance, cost, operational constraints) naturally embedded
- Options: Exam dump style — service name + key characteristic, **1-2 lines max**
- **[Challenge trick answer rule]**: Trick answers use the SAME services as the correct answer but with subtle differences in mode/option/behavior — nearly indistinguishable without deep knowledge
  e.g., Correct: S3 Object Lock in Compliance mode / Trap A: S3 Object Lock in Governance mode (admin can delete), Trap B: S3 Versioning only (no lock), Trap C: Glacier Vault Lock (not S3)
  → Must know exact service behavior differences to identify the correct answer
- Correct answer: All requirements satisfied + persuasive
- Trap answers: A/B/D each uses nearly correct service/config but fails due to subtle mode/setting difference

**Given Services:** \${SERVICE_NAMES}
**Difficulty:** \${DIFFICULTY}

Response in JSON format (pure JSON, all values on single line, no markdown):
{
  "question": "1-2 sentence concise scenario (compliance, cost, and operational requirements naturally embedded)",
  "options": {
    "A": "Service name + key mode/setting/characteristic (1-2 lines, subtly different from correct answer)",
    "B": "Service name + key mode/setting/characteristic (1-2 lines, dump style)",
    "C": "Service name + key mode/setting/characteristic (1-2 lines, correct answer)",
    "D": "Service name + key mode/setting/characteristic (1-2 lines, subtly different from correct answer)"
  },
  "answer": "C",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "goal": "Core objective this problem tests (e.g., designing compliant hybrid architecture within budget)",
  "easyMode": {
    "explanation": "Explain correct answer in 1-2 sentences for a child. Include 1 analogy",
    "A": "1 sentence: why A is correct or wrong",
    "B": "1 sentence: why B is correct or wrong",
    "C": "1 sentence: why C is correct or wrong",
    "D": "1 sentence: why D is correct or wrong"
  },
  "explanation": {
    "goal": "Successfully integrate on-premises and cloud while satisfying compliance, cost, performance, and operational requirements",
    "correct": "Detailed proof of how all 4 constraints are satisfied + why this is optimal + cost/compliance/performance calculations",
    "trap_A": "Which constraint(s) missed (e.g., regulatory/audit requirement, operational complexity, cost, availability) + specific technical reason + real-world impact",
    "trap_B": "Which constraint(s) missed + why existing team cannot effectively manage + hidden operational costs",
    "trap_C": "Which constraint(s) missed (e.g., budget exceeded, over-engineered) + specific cost overage + unnecessary features"
  },
  "patterns": ["Core pattern 1: Hybrid architecture design principles", "Core pattern 2: Compliance and security tradeoffs", "Core pattern 3: Cost optimization vs technical sophistication"]
}`;

export const SAA_PROBLEM_PROMPT_JA_HARD = `⚠️ **重要：レスポンスは2000〜3500トークンの間で作成してください。**

あなたはAWS SAA-C03試験の専門家です。
以下の「難しい」難易度の例題を分析してください。複雑な制約条件と洗練されたトリック選択肢の構造を理解します。

## 例: 複合マルチサービス問題 (難しい難易度)

**特徴:**
- 2~3個のAWSサービスを組み合わせて解決
- 2~3個の相互に関連する制約条件
- トリック選択肢: ほぼ正しいが、コスト、パフォーマンス、運用効率のいずれかが欠落
- 実世界シナリオ(具体的な数値とビジネスコンテキスト含む)

**シナリオ例:** 「月間500GBデータ、毎秒2000リクエスト、99.9%可用性要件」
**制約条件:**
1. パフォーマンス: レイテンシ < 100ms
2. コスト: 予算以内
3. 可用性: 99.9% (マルチAZ)

**トリック選択肢構造:**
- A: コストは満たすがパフォーマンス不足 (シングルAZ)
- B: パフォーマンス + 可用性OK だが予算超過
- C: すべての制約を満たす ✅
- D: 最高パフォーマンスだが2倍コスト + 不必要な機能

**新しい問題の要件:**
- シナリオ: 1~2文で簡潔に、核心要件をシナリオ文の中に自然に含める
- 選択肢: 試験ダンプスタイル — サービス名 + 核心的な特徴、**1~2行以内**
- **[難しいトリック選択肢原則]**: トリック選択肢は似たサービスだが設定/用途が異なる
  例) 正解: SSE-KMS / トリックA: SSE-S3(キー管理不可)、トリックB: クライアント側暗号化(運用複雑)、トリックC: Macie(検出のみ、暗号化ではない)
  → 同じカテゴリのサービスだが、1つの要件で失敗する
- 正解: すべての制約を完璧に満たす
- トリック選択肢: 各々異なる1つの制約を欠落

**与えられたサービス:** \${SERVICE_NAMES}
**難易度:** \${DIFFICULTY}

JSON形式で応答 (マークダウンなし、純粋なJSON、すべての値は1行):
{
  "question": "1~2文の簡潔なシナリオ (核心要件が自然に含まれる)",
  "options": {
    "A": "サービス名 + 核心的な設定/特徴 (1~2行、ダンプスタイル)",
    "B": "サービス名 + 核心的な設定/特徴 (1~2行、ダンプスタイル)",
    "C": "サービス名 + 核心的な設定/特徴 (1~2行、ダンプスタイル)",
    "D": "サービス名 + 核心的な設定/特徴 (1~2行、ダンプスタイル)"
  },
  "answer": "C",
  "keywords": ["キーワード1", "キーワード2", "キーワード3"],
  "goal": "この問題の核心的な目標",
  "easyMode": {
    "explanation": "正解を子どもレベルで1~2文。比喩1つ含む",
    "A": "A が正解/不正解の理由を1文",
    "B": "B が正解/不正解の理由を1文",
    "C": "C が正解/不正解の理由を1文",
    "D": "D が正解/不正解の理由を1文"
  },
  "explanation": {
    "goal": "複数の制約条件（信頼性 + コスト + パフォーマンス）を統合する核心目標",
    "correct": "各制約がどのように満たされるか + コスト/パフォーマンス計算 + 技術的詳細",
    "trap_A": "どの制約が欠落 + なぜこの選択肢がダメか",
    "trap_B": "どの制約が欠落 + 具体的なコスト/パフォーマンス数値",
    "trap_C": "どの制約が欠落 + 代替案提示"
  },
  "patterns": ["コアパターン 1", "コアパターン 2"]
}`;

export const SAA_PROBLEM_PROMPT_JA_CHALLENGE = `⚠️ **重要：レスポンスは2000〜3500トークンの間で作成してください。**

あなたはAWS SAA-C03試験の専門家です。
以下は「チャレンジ」難易度の例題です。非常に高度で現実的なアーキテクチャ問題を分析してください。

## 例: 最高難易度問題 (チャレンジ)

**特徴:**
- 3~4個のAWSサービス組み合わせ (例: VPC + Auto Scaling + RDS + CloudFront)
- 3個以上の相互に関連する制約条件(相関性高い)
- トリック選択肢: 非常に高度 (ほぼすべての条件を満たすが1つの重要な詳細を見落とし)
- 実務状況: 「オンプレミス ↔ AWS ハイブリッド」「マルチリージョン」「コンプライアンス要件」

**シナリオ例:**
「銀行がオンプレミスのレガシーシステムをAWSに移行。
月間10TBトランザクションデータ、高可用性確保、HIPAA準拠」

**制約条件:**
1. 技術: Direct Connect + マルチAZ + 暗号化
2. ビジネス: 予算以内、データ完全性保証
3. 運用: 既存スタッフ(AWS未経験)で管理可能
4. 規制: HIPAA準拠、データレジデンシ米国内

**トリック選択肢構造:**
- A: Direct Connect + RDS マルチAZ だがHIPAA監査機能不足
- B: すべての技術 + HIPAA だが既存スタッフの運用困難 (複雑)
- C: すべての制約を完璧に満たす ✅
- D: 最高技術 (グローバルテーブル) だが予算超過 + 不必要な複雑性

**新しい問題の要件:**
- シナリオ: 1~2文で簡潔に、核心要件(コンプライアンス、コスト、運用制約)をシナリオ文の中に自然に含める
- 選択肢: 試験ダンプスタイル — サービス名 + 核心的な特徴、**1~2行以内**
- **[チャレンジのトリック選択肢原則]**: トリック選択肢は正解と同じサービスを使うが、モード/オプション/動作が微妙に異なる — 深い知識なしには区別不可能なレベル
  例) 正解: S3オブジェクトロック コンプライアンスモード / トリックA: S3オブジェクトロック ガバナンスモード(管理者が削除可能)、トリックB: S3バージョニングのみ(ロックなし)、トリックC: Glacier Vault Lock(S3ではない)
  → サービスの正確な動作の違いを知らなければ正解を選べないレベル
- 正解: すべての要件を満たす + 説得力高い
- トリック選択肢: A/B/D 各々同じサービスだが微妙なモード/設定の違いで要件を満たさない

**与えられたサービス:** \${SERVICE_NAMES}
**難易度:** \${DIFFICULTY}

JSON形式で応答 (マークダウンなし、純粋なJSON、すべての値は1行):
{
  "question": "1~2文の簡潔なシナリオ (核心要件が文の中に自然に含まれる)",
  "options": {
    "A": "サービス名 + 核心的なモード/設定/特徴 (1~2行、正解と微妙に異なる)",
    "B": "サービス名 + 核心的なモード/設定/特徴 (1~2行、ダンプスタイル)",
    "C": "サービス名 + 核心的なモード/設定/特徴 (1~2行、正解)",
    "D": "サービス名 + 核心的なモード/設定/特徴 (1~2行、正解と微妙に異なる)"
  },
  "answer": "C",
  "keywords": ["キーワード1", "キーワード2", "キーワード3"],
  "goal": "この問題が試験する核心的な目標",
  "easyMode": {
    "explanation": "正解を子どもレベルで1~2文。比喩1つ含む",
    "A": "A が正解/不正解の理由を1文",
    "B": "B が正解/不正解の理由を1文",
    "C": "C が正解/不正解の理由を1文",
    "D": "D が正解/不正解の理由を1文"
  },
  "explanation": {
    "goal": "オンプレミスとクラウドを安全に統合し、コンプライアンス、コスト、パフォーマンス、運用要件を同時に実現すること",
    "correct": "4個すべての制約をどのように同時に満たすか詳細に + 技術的根拠 + コスト/規制/パフォーマンス計算",
    "trap_A": "どの制約が欠落 (規制/監査要件、運用複雑性、コスト、可用性等) + 具体的な技術的理由 + 実務への影響",
    "trap_B": "どの制約が欠落 + なぜ既存チームでは効果的に管理できないか + 隠れた運用コスト",
    "trap_C": "どの制約が欠落 (予算超過、過度設計等) + 具体的な超過額 + 不必要な機能"
  },
  "patterns": ["コアパターン 1: ハイブリッドアーキテクチャ設計原則", "コアパターン 2: コンプライアンスとセキュリティのトレードオフ", "コアパターン 3: コスト最適化 vs 技術的洗練度"]
}`;

export const DIFFICULTY_LABELS = {
  ko: { medium: "보통", hard: "어려움", challenge: "챌린지" },
  ja: { medium: "普通", hard: "難しい", challenge: "チャレンジ" },
  en: { medium: "Medium", hard: "Hard", challenge: "Challenge" },
} as const;

export function generatePrompt(
  serviceNames: string[],
  difficulty: string,
  locale: "ko" | "ja" | "en" = "ko",
  domain?: "security" | "resilience" | "performance" | "cost-optimization"
): string {
  // 난이도별로 다른 프롬프트 선택
  let prompt: string;

  if (locale === "ko") {
    if (difficulty === "hard") {
      prompt = SAA_PROBLEM_PROMPT_HARD;
    } else if (difficulty === "challenge") {
      prompt = SAA_PROBLEM_PROMPT_CHALLENGE;
    } else {
      prompt = SAA_PROBLEM_PROMPT_MEDIUM;
    }
  } else if (locale === "ja") {
    if (difficulty === "hard") {
      prompt = SAA_PROBLEM_PROMPT_JA_HARD;
    } else if (difficulty === "challenge") {
      prompt = SAA_PROBLEM_PROMPT_JA_CHALLENGE;
    } else {
      prompt = SAA_PROBLEM_PROMPT_JA;
    }
  } else {
    if (difficulty === "hard") {
      prompt = SAA_PROBLEM_PROMPT_EN_HARD;
    } else if (difficulty === "challenge") {
      prompt = SAA_PROBLEM_PROMPT_EN_CHALLENGE;
    } else {
      prompt = SAA_PROBLEM_PROMPT_EN;
    }
  }

  const diffLabel = DIFFICULTY_LABELS[locale][difficulty as "medium" | "hard" | "challenge"] || difficulty;

  // 📊 도메인별 가이드 추가
  const domainGuide = domain
    ? (locale === "ko"
      ? `\n\n## 📚 출제 도메인 (SAA-C03 시험 비율):\n${
          domain === "security" ? "**보안 아키텍처 설계 (Secure Architectures) - 30%**: IAM, KMS, 암호화, VPC 보안그룹, Shield, WAF, 접근 제어 등을 포함한 문제를 생성하세요." :
          domain === "resilience" ? "**복원력 있는 아키텍처 설계 (Resilient Architectures) - 26%**: Multi-AZ, Auto Scaling, ELB, 재해복구(DR), RTO/RPO, 고가용성 등을 포함한 문제를 생성하세요." :
          domain === "performance" ? "**고성능 아키텍처 설계 (High-Performing Architectures) - 24%**: 네트워크 설계, CloudFront, ElastiCache, 스토리지 최적화, 성능 모니터링 등을 포함한 문제를 생성하세요." :
          "**비용 최적화 아키텍처 설계 (Cost-Optimized Architectures) - 20%**: Reserved/Spot 인스턴스, S3 스토리지 클래스, 비용 모니터링, 리소스 적정화 등을 포함한 문제를 생성하세요."
        }`
      : locale === "ja"
      ? `\n\n## 📚 出題ドメイン (SAA-C03 試験の割合):\n${
          domain === "security" ? "**セキュアアーキテクチャー設計 (Secure Architectures) - 30%**: IAM、KMS、暗号化、VPCセキュリティグループ、Shield、WAFなどを含む問題を生成してください。" :
          domain === "resilience" ? "**回復力のあるアーキテクチャー設計 (Resilient Architectures) - 26%**: マルチAZ、オートスケーリング、ELB、ディザスタリカバリー、RTO/RPOなどを含む問題を生成してください。" :
          domain === "performance" ? "**高性能アーキテクチャー設計 (High-Performing Architectures) - 24%**: ネットワーク設計、CloudFront、ElastiCache、ストレージ最適化などを含む問題を生成してください。" :
          "**コスト最適化アーキテクチャー設計 (Cost-Optimized Architectures) - 20%**: 予約インスタンス、スポットインスタンス、S3ストレージクラス、コスト監視などを含む問題を生成してください。"
        }`
      : `\n\n## 📚 Exam Domain (SAA-C03 Exam Proportion):\n${
          domain === "security" ? "**Secure Architectures Design - 30%**: Create questions including IAM, KMS, encryption, VPC security groups, Shield, WAF, and access control." :
          domain === "resilience" ? "**Resilient Architectures Design - 26%**: Create questions including Multi-AZ, Auto Scaling, ELB, disaster recovery, RTO/RPO, and high availability." :
          domain === "performance" ? "**High-Performing Architectures Design - 24%**: Create questions including network design, CloudFront, ElastiCache, storage optimization, and performance monitoring." :
          "**Cost-Optimized Architectures Design - 20%**: Create questions including Reserved/Spot instances, S3 storage classes, cost monitoring, and resource optimization."
        }`)
    : "";

  const tokenConstraint = locale === "ko"
    ? `\n\n⚠️ **필수 제약사항 (반드시 지켜야 함)**:\n- 응답은 2000~3500 토큰 사이로 작성하세요.\n- JSON 외에 다른 설명이나 마크다운은 절대 금지입니다.\n- 선택지(options): 각 선택지는 1-3줄의 구체적인 아키텍처 설명.\n- 정답 설명(explanation): 각 필드는 전문적이고 상세하게 (2-4줄).\n- goal: 문제의 핵심 목표를 한 문장으로 명확히.\n- correct: 정답이 모든 제약을 만족하는 이유를 기술적으로 상세히 (2-3줄).\n- trap_A, B, C: 각각 미충족 제약과 기술적 근거 (2줄).\n- JSON 구조는 빠짐없이 완전해야 합니다.`
    : locale === "ja"
    ? `\n\n⚠️ **必須の制約（必ず守る必要があります）**:\n- レスポンスは2000〜3500トークンの間で作成してください。\n- JSON以外の説明やマークダウンは絶対に禁止です。\n- オプション(options): 各選択肢は1-3行の具体的なアーキテクチャ説明。\n- 正答説明(explanation): 各フィールドは専門的で詳細に（2-4行）。\n- goal: 問題の核心的な目標を一文で明確に。\n- correct: 正答がすべての制約を満たす理由を技術的に詳細に（2-3行）。\n- trap_A, B, C: 各々の未充足制約と技術的根拠（2行）。\n- JSON構造は完全である必要があります。`
    : `\n\n⚠️ **Mandatory Constraint (Must Follow)**:\n- Response should be 2000-3500 tokens.\n- NO explanations or markdown outside JSON.\n- options: Each option must be 1-3 lines of detailed architecture description.\n- explanation: Each field must be professional and detailed (2-4 lines).\n- goal: Clearly state the core objective of the problem in one sentence.\n- correct: Explain why answer satisfies all constraints technically (2-3 lines).\n- trap_A, B, C: Each unsatisfied constraint and technical reasoning (2 lines).\n- JSON structure MUST be complete.`;

  return (prompt
    .replace("${SERVICE_NAMES}", serviceNames.join(", "))
    .replace("${DIFFICULTY}", diffLabel) + domainGuide + tokenConstraint);
}
