import examAnalysis from "../constants/saa-c03-exam-analysis.json";

export function resolveBackendUrl(): string {
  const hostname =
    typeof window !== "undefined" && window.location?.hostname
      ? window.location.hostname
      : "";

  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "http://localhost:5000";
  }

  // 보안: 특정 env 값만 정적 참조 (전체 env destructure 금지)
  return import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
}

/**
 * 분석 데이터를 기반으로 AWS 서비스를 선택
 *
 * - 빈 배열 감지 시 medium 난이도로 고정 (단일 서비스 1개 기본)
 * - usedSets 전달 시 중복 방지: 단일 서비스 모두 소진되면 2개 조합으로 fallback
 *   ([EC2] 이미 사용 → [EC2, S3] 같은 조합은 허용)
 */
export function selectServicesFromAnalysis(usedSets?: Set<string>): string[] {
  const weights = examAnalysis.generationStrategy.serviceSelectionWeights as any;
  const serviceList = Object.keys(weights).filter(s => s !== "Others");

  const pickWeighted = (): string => {
    const rand = Math.random();
    let cumulative = 0;
    for (const service of serviceList) {
      cumulative += weights[service];
      if (rand <= cumulative) return service;
    }
    return serviceList[0];
  };

  const MAX_TRIES = 50;

  // 1단계: 단일 서비스 시도 (medium 고정 → 1개)
  for (let i = 0; i < MAX_TRIES; i++) {
    const single = [pickWeighted()];
    const key = single.join("|");
    if (!usedSets || !usedSets.has(key)) {
      usedSets?.add(key);
      return single;
    }
  }

  // 2단계: 단일 서비스 모두 사용됨 → 2개 조합 fallback
  for (let i = 0; i < MAX_TRIES; i++) {
    const a = pickWeighted();
    let b = pickWeighted();
    while (b === a) b = pickWeighted();
    const combo = [a, b].sort();
    const key = combo.join("|");
    if (!usedSets || !usedSets.has(key)) {
      usedSets?.add(key);
      return combo;
    }
  }

  // 마지막 fallback
  return ["EC2"];
}

// ✅ Gemini API 호출 함수 (서버 프록시 사용 - 보안)
async function callGeminiAPI(
  prompt: string,
  maxTokens: number,
  _locale: "ko" | "ja" | "en" = "ko",
  retries: number = 3
): Promise<string> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      // ✅ 서버 프록시로 호출 (API 키는 서버에만 있음)
      const backendUrl = resolveBackendUrl();
      const response = await fetch(`${backendUrl}/api/gemini`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          maxTokens,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = `Gemini API Error: ${errorData.error?.message || "Unknown error"}`;
        lastError = new Error(errorMessage);

        // 5xx 에러 또는 429(너무 많은 요청)만 재시도
        if (response.status >= 500 || response.status === 429) {
          if (attempt < retries - 1) {
            // Exponential backoff: 1초, 2초, 4초
            const delayMs = Math.pow(2, attempt) * 1000;
            await new Promise(resolve => setTimeout(resolve, delayMs));
            continue;
          }
        } else {
          // 4xx 에러는 재시도 불가
          throw lastError;
        }
      }

      const data = await response.json();
      const content = data.candidates[0].content.parts[0].text;
      return content;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // 마지막 시도가 아니면 재시도
      if (attempt < retries - 1) {
        // 네트워크 에러인 경우만 재시도
        if (error instanceof TypeError || error instanceof Error) {
          const delayMs = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, delayMs));
          continue;
        }
      }
    }
  }

  // 모든 재시도 실패
  throw lastError || new Error("Gemini API call failed after retries");
}

export interface Concept {
  title: string;
  subtitle: string;
  easy: string;
  points: Array<{
    label: string;
    text: string;
    easy: string;
  }>;
}

export interface Problem {
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  answer: string;
  keywords: string[];  // 핵심 키워드 (bold 처리용)
  goal: string;        // 핵심 목표
  easyMode: {          // 초등학교 5학년 수준 설명
    explanation: string;
    A: string;
    B: string;
    C: string;
    D: string;
  };
  explanation: {
    correct: string;        // 정답인 이유
    trap_A: string;
    trap_B?: string;
    trap_C: string;
    trap_D: string;
  };
  patterns: string[];
}

export async function generateSAAProblem(
  serviceNames: string[],
  difficulty: string,
  locale: "ko" | "ja" | "en" = "ko",
  domain?: "security" | "resilience" | "performance" | "cost-optimization",
  theme?: string
): Promise<Problem> {
  // 📊 모의시험 모드: 빈 배열이면 분석 데이터 기반으로 서비스 선택 (medium 고정)
  let selectedServices = serviceNames;
  if (serviceNames.length === 0) {
    selectedServices = selectServicesFromAnalysis();
  }

  // 🔒 프롬프트는 서버에서 생성 (클라이언트 노출 방지)
  // 서버가 Gemini/Claude 폴백까지 담당
  const backendUrl = resolveBackendUrl();
  let content: string;

  try {
    const response = await fetch(`${backendUrl}/api/generateSAAProblem`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        services: selectedServices,
        difficulty,
        locale,
        domain,
        theme,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Server returned ${response.status}`);
    }

    const data = await response.json();
    content = data.content || "";
    if (!content) {
      throw new Error("Empty response from server");
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(
      locale === "en" ? `Problem generation failed: ${msg}` :
      locale === "ja" ? `問題生成に失敗しました: ${msg}` :
      `문제 생성 실패: ${msg}`
    );
  }

  try {

    // JSON 추출 (마크다운 코드 블록 처리)
    // 마크다운 코드 블록부터 시도
    let jsonStr = content.match(/```json\s*([\s\S]*?)\s*```/)?.[1];

    // 마크다운이 없으면 가장 첫 { 부터 마지막 } 까지
    if (!jsonStr) {
      const startIdx = content.indexOf('{');
      const lastIdx = content.lastIndexOf('}');

      if (startIdx !== -1 && lastIdx !== -1 && lastIdx > startIdx) {
        jsonStr = content.substring(startIdx, lastIdx + 1);
      }
    }

    if (!jsonStr) {
      throw new Error("Failed to extract JSON from response");
    }

    // JSON 내 문자열 값의 줄바꿈을 공백으로 치환
    // 더 강력한 정규화 로직
    jsonStr = jsonStr.replace(/\\n/g, ' '); // 이스케이프된 \n을 공백으로

    // 문자열 내 실제 줄바꿈을 공백으로 치환 (JSON 객체 내에서만)
    // "key": "value with
    // newline" → "key": "value with newline"
    jsonStr = jsonStr.replace(/"([^"]*)\n([^"]*)"/g, (_match: string, before: string, after: string) => {
      return `"${before.trim()} ${after.trim()}"`;
    });

    // 배열 내 줄바꿈 정리
    jsonStr = jsonStr.replace(/\[\n\s*/g, '[');
    jsonStr = jsonStr.replace(/\n\s*\]/g, ']');
    jsonStr = jsonStr.replace(/,\n\s*/g, ', ');

    // 마지막 정리: 여러 줄 남은 것들
    jsonStr = jsonStr.replace(/\n/g, '');

    try {
      const problem = JSON.parse(jsonStr) as Problem;
      // 키워드 최대 4개 제한
      if (problem.keywords && problem.keywords.length > 4) {
        problem.keywords = problem.keywords.slice(0, 4);
      }
      return problem;
    } catch (parseError) {
      // 파싱 실패 시 더 공격적으로 정리
      // 모든 종류의 이스케이프 문자 처리
      let cleaned = jsonStr;

      // 탭과 다중 공백을 단일 공백으로
      cleaned = cleaned.replace(/\t/g, ' ');
      cleaned = cleaned.replace(/\s+/g, ' ');

      // 따옴표 안의 특수 문자 처리
      // "key": "value" 패턴만 추출
      cleaned = cleaned.replace(/: "/g, ':"').replace(/", /g, '",');
      cleaned = cleaned.replace(/": \{/g, '":{').replace(/": \[/g, '":');

      // 마지막 시도
      try {
        const problem = JSON.parse(cleaned) as Problem;
        return problem;
      } catch (secondError) {
        throw parseError;
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Problem generation failed: ${error.message}`);
    }
    throw error;
  }
}

export async function translateConcept(
  concept: Concept,
  locale: "ja" | "en"
): Promise<Concept> {
  const targetLang = locale === "ja" ? "Japanese" : "English";
  const prompt = `You are a technical translator. Translate the following AWS concept from Korean to ${targetLang}.
Keep all AWS service names (EC2, S3, Lambda, etc.) in English.
Return ONLY valid JSON in the exact same structure.

Input:
${JSON.stringify(concept)}

Output (JSON only):`;

  let content: string;

  // ⚠️ 테스트 모드: Gemini API로 먼저 시도 (테스트용)
  try {
    // 2단계: Gemini API로 번역 시도 (테스트 모드)
    content = await callGeminiAPI(prompt, 2500, locale);

  } catch (geminiError) {
    // 폴백: 실패 시 Claude API 시도
    try {
      // 1단계: Claude API 시도 (폴백)
      const backendUrl = resolveBackendUrl();
      const response = await fetch(`${backendUrl}/api/claudeProxy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 2500,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Claude API Error: ${response.status}`);
      }

      const data = await response.json();
      content = data.content[0].text;

    } catch (claudeError) {
      // 에러 알림 로직 제거 (admin 이메일은 번들에 담지 않음)

      throw new Error(`Both Gemini and Claude APIs failed for translation. Gemini: ${geminiError}, Claude: ${claudeError}`);
    }
  }

  try {

    // JSON 추출
    const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) ||
                      content.match(/(\{[\s\S]*\})/);

    if (!jsonMatch) {
      throw new Error("Failed to extract JSON from translation response");
    }

    const translatedConcept = JSON.parse(jsonMatch[1]) as Concept;
    return translatedConcept;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Concept translation failed: ${error.message}`);
    }
    throw error;
  }
}

/**
 * 모의고사 50문제를 한번의 API 호출로 생성 (병렬 처리)
 *
 * - difficulty 파라미터 무시하고 전체 medium 고정
 * - 50문제 전반에 걸쳐 서비스 세트 중복 금지
 *   (예: [EC2] 단일이 한 번 사용되면 더 이상 [EC2] 단일로 출제 안 됨,
 *    하지만 [EC2, S3] 같은 조합은 별개로 허용)
 */
export async function generateMockExamBatch(
  difficulties: Array<"medium" | "hard" | "challenge">,
  locale: "ko" | "ja" | "en" = "ko"
): Promise<Problem[]> {
  // 1) 50개 서비스 세트 사전 할당 — 중복 없는 조합 보장
  const usedSets = new Set<string>();
  const serviceSets = difficulties.map(() => selectServicesFromAnalysis(usedSets));

  // 2) 사전 할당된 서비스로 병렬 API 호출 — 모두 medium 고정
  const problemPromises = serviceSets.map((services) =>
    generateSAAProblem(services, "medium", locale)
  );

  try {
    const problems = await Promise.all(problemPromises);
    return problems;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Mock exam batch generation failed: ${error.message}`);
    }
    throw error;
  }
}
