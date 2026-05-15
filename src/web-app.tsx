import html2pdf from "html2pdf.js/dist/html2pdf.js";
import { useEffect, useRef, useState } from "react";
import { getDailyVisitorsForMonth, getMonthlyVisitors, getTodayPurchaseCount, getTotalVisitorCount, getWeeklyVisitorsForMonth, trackVisitor } from "./analytics";
import { Concept, generateSAAProblem, Problem, resolveBackendUrl, resolveJavaBackendUrl, selectServicesFromAnalysis } from "./api";
import CookieConsent from "./components/organisms/CookieConsent";
import Footer from "./components/organisms/Footer";
import LandingPage from "./components/pages/LandingPage";
import Navigator from "./components/organisms/Navigator";
import PremiumBanner from "./components/organisms/PremiumBanner";
import QuizStatsCards from "./components/molecules/QuizStatsCards";
import AdminStatsGrid from "./components/molecules/AdminStatsGrid";
import PaymentModal from "./components/Modals/PaymentModal";
import ExamDateModal from "./components/Modals/ExamDateModal";
import EmailVerificationModal from "./components/Modals/EmailVerificationModal";
import QuotaModal from "./components/Modals/QuotaModal";
import PostFormModal from "./components/Modals/PostFormModal";
import { CognitoTestPage } from "./components/CognitoTestPage";
import { CognitoSignupModal } from "./components/Modals/CognitoSignupModal";
import { CognitoLoginModal } from "./components/Modals/CognitoLoginModal";
import { CAT, CONCEPTS_KO, LINKS, NODES } from "./data";
import { CONCEPTS_EN } from "./CONCEPTS_EN";
import { CONCEPTS_JA } from "./concepts_ja";
import { auth, deleteExpiredResults, deleteOldMockExamProblems, deletePost, getAdminStatsSecure, getAllUsersForAdminSecure, getCurrentUser, getExamStartDate, getPostById, getPosts, getTodayMockExamProblems, getUserPaidStatus, getUserProblemSessions, getUserProblemSessionsSecure, getUserQuizStats, isPasswordLinked, isSubscriptionCancelled, onAuthStateChange, saveTodayMockExamProblems, saveUserInfoToFirebase, signIn, signInWithGoogle, signOut, signUp, updateMockExamProblemsProgressively, updateStreakInFirebase, updateUserPaidStatus, uploadPDFToStorage, refreshUserData, resendEmailVerification, uploadCurrentMockExamToPastExams, fetchPastExamPage, getPastExamTotalCount } from "./firebase";
import { useLocale } from "./LocaleContext";
import { useTheme } from "./ThemeContext";
// SEC Challenges
import { SEC_CHALLENGES_I18N as SEC_KO } from "./locales/sec-ko";
import { SEC_CHALLENGES_I18N as SEC_EN } from "./locales/sec-en";
import { SEC_CHALLENGES_I18N as SEC_JA } from "./locales/sec-ja";
// RES Challenges
import { RES_CHALLENGES_I18N as RES_KO } from "./locales/res-ko";
import { RES_CHALLENGES_I18N as RES_EN } from "./locales/res-en";
import { RES_CHALLENGES_I18N as RES_JA } from "./locales/res-ja";
// PERF Challenges
import { PERF_CHALLENGES_I18N as PERF_KO } from "./locales/perf-ko";
import { PERF_CHALLENGES_I18N as PERF_EN } from "./locales/perf-en";
import { PERF_CHALLENGES_I18N as PERF_JA } from "./locales/perf-ja";
// COST Challenges
import { COST_CHALLENGES_I18N as COST_KO } from "./locales/cost-ko";
import { COST_CHALLENGES_I18N as COST_EN } from "./locales/cost-en";
import { COST_CHALLENGES_I18N as COST_JA } from "./locales/cost-ja";
import { SEC_ANSWERS, RES_ANSWERS, PERF_ANSWERS, COST_ANSWERS, isAnswerCorrect } from "./scenario-answers";
import { canGenerateProblemToday, getUserMockExamDate, recordMockExamDate } from "./firebase";
import "./styles.css";
import { validateEmail, validatePassword, sanitizeInput } from "./utils/validation";
import { UserStatus, setUserStatus, getTodayProblemCount, incrementProblemCount, getDailyLimit } from "./utils/userStatus";
import { checkRateLimit, isAdminUser, maskEmail } from "./utils/security";
import { updateStreak, getExamDday } from "./utils/streak";

// ===== 분리된 유틸 =====
// checkRateLimit, isAdminUser, maskEmail → ./utils/security
// updateStreak, getExamDday → ./utils/streak
// UserStatus, getUserStatus, setUserStatus, getTodayProblemCount,
// incrementProblemCount, getDailyLimit → ./utils/userStatus

/**
 * Firebase를 통해 사용자의 실제 결제 상태 검증
 * 이 함수는 localStorage 조작을 방지하기 위해 각 API 호출 전에 호출됨
 */
async function verifyUserPaidStatusFromFirebase(userId: string): Promise<boolean> {
  if (!userId) return false;
  try {
 return await getUserPaidStatus(userId);
  } catch (error) {
 // Firebase 오류 시 sessionStorage에 캐시된 값 사용 (폴백)
 const cached = sessionStorage.getItem("userStatus");
 return cached?.startsWith("PAID_TOKEN_") || false;
  }
}

// ===== 세션 타임아웃 =====
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30분
let sessionTimeoutId: ReturnType<typeof setTimeout> | null = null;

function resetSessionTimeout(callback: () => void) {
  if (sessionTimeoutId) {
 clearTimeout(sessionTimeoutId);
  }

  sessionTimeoutId = setTimeout(() => {
 callback(); // 로그아웃 실행
  }, SESSION_TIMEOUT);
}

// CW/CH = total canvas, VW/VH = visible viewport
const CW = 1800, CH = 1100, VW = 900, VH = 580;
// Legacy alias used by background dots
const W = CW, H = CH;

function initPos() {
  // Category center positions across the large canvas
  const centers: Record<string, {x:number;y:number}> = {
    compute:   {x:185,  y:155},   // 6 nodes
    network:   {x:580,  y:130},   // 12 nodes
    storage:   {x:1080, y:130},   // 8 nodes
    analytics: {x:1560, y:185},   // 5 nodes
    security:  {x:185,  y:570},   // 12 nodes
    messaging: {x:660,  y:570},   // 6 nodes
    database:  {x:1110, y:510},   // 5 nodes
    monitor:   {x:1560, y:510},   // 2 nodes
    migration: {x:390,  y:910},   // 3 nodes
    ops:       {x:960,  y:890},   // 7 nodes
  };

  // First pass: count per category for grid sizing
  const catCounts: Record<string, number> = {};
  NODES.forEach(n => { catCounts[n.cat] = (catCounts[n.cat] || 0) + 1; });

  const cnt: Record<string, number> = {};
  const pos: Record<string, {x:number;y:number;vx:number;vy:number}> = {};

  NODES.forEach(n => {
    const c = centers[n.cat] ?? {x: 900, y: 550};
    const i = cnt[n.cat] || 0;
    cnt[n.cat] = i + 1;
    const total = catCounts[n.cat];
    const cols = Math.ceil(Math.sqrt(total));
    const rows = Math.ceil(total / cols);
    const col = i % cols;
    const row = Math.floor(i / cols);
    const spacing = 88;
    pos[n.id] = {
      x: c.x + (col - (cols - 1) / 2) * spacing,
      y: c.y + (row - (rows - 1) / 2) * spacing,
      vx: 0, vy: 0,
    };
  });
  return pos;
}

function useForce() {
  const [pos, setPos] = useState(initPos);
  const posRef = useRef(pos);
  const dragRef = useRef<string | null>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  posRef.current = pos;
  return { pos, setPos, posRef, dragRef, pan, setPan, zoom, setZoom };
}

function GraphSVG({ pos, setPos, posRef: _posRef, dragRef, pan, setPan, zoom, setZoom, selected, slots, onNodeClick, catFilter, theme }: {
  pos: Record<string, any>;
  setPos: any;
  posRef: any;
  dragRef: any;
  pan: {x:number;y:number};
  setPan: any;
  zoom: number;
  setZoom: any;
  selected: string | null;
  slots: string[];
  onNodeClick: (id: string | null) => void;
  catFilter: string | null;
  theme: "dark" | "light";
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const panStartRef = useRef<{mx:number;my:number;px:number;py:number} | null>(null);
  const pinchStartRef = useRef<{dist:number;zoom:number;midX:number;midY:number} | null>(null);
  const didPanRef = useRef(false);

  const getPinchDist = (e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };
  const connectedIds = selected
 ? new Set([selected, ...LINKS.filter(l => l.s === selected || l.t === selected).flatMap(l => [l.s, l.t])])
 : null;

  const vw = VW / zoom;
  const vh = VH / zoom;

  const getSvgXY = (cx: number, cy: number) => {
    const r = svgRef.current?.getBoundingClientRect();
    if (!r) return { x: pan.x, y: pan.y };
    return {
      x: pan.x + ((cx - r.left) / r.width) * vw,
      y: pan.y + ((cy - r.top) / r.height) * vh,
    };
  };

  const clampPan = (x: number, y: number, z = zoom) => ({
    x: Math.max(0, Math.min(CW - VW / z, x)),
    y: Math.max(0, Math.min(CH - VH / z, y)),
  });

  // 네이티브 wheel 리스너 (passive: false) — 패널 내 줌이 페이지 스크롤로 새지 않도록
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
      const newZoom = Math.max(0.3, Math.min(4, zoom * factor));
      const r = svg.getBoundingClientRect();
      const mx = (e.clientX - r.left) / r.width;
      const my = (e.clientY - r.top) / r.height;
      const canvasX = pan.x + mx * vw;
      const canvasY = pan.y + my * vh;
      const newVW = VW / newZoom;
      const newVH = VH / newZoom;
      setZoom(newZoom);
      setPan(clampPan(canvasX - mx * newVW, canvasY - my * newVH, newZoom));
    };
    svg.addEventListener('wheel', handler, { passive: false });
    return () => svg.removeEventListener('wheel', handler);
  }, [zoom, pan.x, pan.y, vw, vh]);

  const R = 28;

  return (
 <svg ref={svgRef} viewBox={`${pan.x} ${pan.y} ${vw} ${vh}`}
 style={{ display: "block", width: "100%", height: "100%", background: "var(--bg-graph)", touchAction: "none", cursor: "grab" }}
 onMouseDown={e => {
   didPanRef.current = false;
   if (!(e.target as Element).closest('g')) {
     panStartRef.current = { mx: e.clientX, my: e.clientY, px: pan.x, py: pan.y };
   }
 }}
 onMouseMove={e => {
   if (dragRef.current) {
     const { x, y } = getSvgXY(e.clientX, e.clientY);
     setPos((p: any) => ({ ...p, [dragRef.current!]: { ...p[dragRef.current!], x, y, vx: 0, vy: 0 } }));
   } else if (panStartRef.current) {
     const r = svgRef.current?.getBoundingClientRect();
     if (!r) return;
     const dx = (e.clientX - panStartRef.current.mx) / r.width * vw;
     const dy = (e.clientY - panStartRef.current.my) / r.height * vh;
     if (Math.abs(dx) > 2 || Math.abs(dy) > 2) didPanRef.current = true;
     setPan(clampPan(panStartRef.current.px - dx, panStartRef.current.py - dy));
   }
 }}
 onMouseUp={e => {
   dragRef.current = null;
   if (!didPanRef.current && !(e.target as Element).closest('g')) {
     onNodeClick(null);
   }
   panStartRef.current = null;
   didPanRef.current = false;
 }}
 onMouseLeave={() => { dragRef.current = null; panStartRef.current = null; didPanRef.current = false; }}
 onTouchStart={e => {
   didPanRef.current = false;
   if (e.touches.length === 2) {
     const dist = getPinchDist(e);
     const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
     const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
     pinchStartRef.current = { dist, zoom, midX, midY };
     panStartRef.current = null;
   } else if (e.touches.length === 1 && !(e.target as Element).closest('g')) {
     const t = e.touches[0];
     panStartRef.current = { mx: t.clientX, my: t.clientY, px: pan.x, py: pan.y };
   }
 }}
 onTouchMove={e => {
 e.preventDefault();
 if (e.touches.length === 2 && pinchStartRef.current) {
   const dist = getPinchDist(e);
   const scale = dist / pinchStartRef.current.dist;
   const newZoom = Math.max(0.3, Math.min(4, pinchStartRef.current.zoom * scale));
   const r = svgRef.current?.getBoundingClientRect();
   if (!r) { setZoom(newZoom); return; }
   const mx = (pinchStartRef.current.midX - r.left) / r.width;
   const my = (pinchStartRef.current.midY - r.top) / r.height;
   const canvasX = pan.x + mx * vw;
   const canvasY = pan.y + my * vh;
   const newVW = VW / newZoom;
   const newVH = VH / newZoom;
   setZoom(newZoom);
   setPan(clampPan(canvasX - mx * newVW, canvasY - my * newVH, newZoom));
 } else if (dragRef.current) {
   const t = e.touches[0];
   const { x, y } = getSvgXY(t.clientX, t.clientY);
   setPos((p: any) => ({ ...p, [dragRef.current!]: { ...p[dragRef.current!], x, y, vx: 0, vy: 0 } }));
 } else if (panStartRef.current) {
   const r = svgRef.current?.getBoundingClientRect();
   if (!r) return;
   const t = e.touches[0];
   const dx = (t.clientX - panStartRef.current.mx) / r.width * vw;
   const dy = (t.clientY - panStartRef.current.my) / r.height * vh;
   didPanRef.current = true;
   setPan(clampPan(panStartRef.current.px - dx, panStartRef.current.py - dy));
 }
 }}
 onTouchEnd={e => {
   if (e.touches.length < 2) pinchStartRef.current = null;
   dragRef.current = null;
   if (!didPanRef.current && !(e.target as Element).closest('g')) {
     onNodeClick(null);
   }
   panStartRef.current = null;
   didPanRef.current = false;
 }}
 >
 <defs>
 <filter id="glow1" x="-60%" y="-60%" width="220%" height="220%">
 <feGaussianBlur stdDeviation="5" result="b" />
 <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
 </filter>
 </defs>

 {/* Background dots */}
 {Array.from({ length: 70 }, (_, i) => (
 <circle key={i} cx={(i * 179 + 53) % W} cy={(i * 113 + 41) % H}
 r={i % 6 === 0 ? 1.3 : 0.5} fill={theme === "dark" ? "white" : "#151E32"} opacity={0.06 + (i % 4) * 0.03} />
 ))}

 {/* Links - 선택 시에만 강조 (스파게티 방지) */}
 {LINKS.map((link, i) => {
 const sp = pos[link.s], tp = pos[link.t];
 if (!sp || !tp) return null;
 const highlighted = selected && connectedIds?.has(link.s) && connectedIds?.has(link.t);
 const srcNode = NODES.find(n => n.id === link.s);
 const faintColor = theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.08)";
 return (
 <line key={i} x1={sp.x} y1={sp.y} x2={tp.x} y2={tp.y}
 stroke={highlighted ? (srcNode ? CAT[srcNode.cat].color : "#fff") : faintColor}
 strokeWidth={highlighted ? 2 : 1}
 opacity={highlighted ? 0.7 : (selected ? 0.03 : 0.08)}
 pointerEvents="none"
 />
 );
 })}

 {/* Nodes */}
 {NODES.map(n => {
 const p = pos[n.id];
 if (!p) return null;
 const cat = CAT[n.cat];
 const isSelected = n.id === selected;
 const isSlotted = slots.includes(n.id);
 const isConnected = connectedIds?.has(n.id);
 const dimmed = (selected && !isConnected) || (catFilter && n.cat !== catFilter);
 const r = isSelected ? 32 : isSlotted ? 30 : R;

 return (
 <g key={n.id}
 style={{ cursor: "pointer" }}
 onMouseDown={e => { e.stopPropagation(); dragRef.current = n.id; }}
 onTouchStart={e => { e.stopPropagation(); dragRef.current = n.id; }}
 onClick={e => { e.stopPropagation(); onNodeClick(n.id); }}
 >
 {/* Glow ring */}
 {(isSelected || isSlotted) && (
 <circle cx={p.x} cy={p.y} r={r + 6} fill="none"
 stroke={cat.glow} strokeWidth={2} opacity={0.5} filter="url(#glow1)" />
 )}
 {/* Main circle */}
 <circle cx={p.x} cy={p.y} r={r} fill={cat.color}
 opacity={dimmed ? 0.2 : (isSelected ? 1 : 0.8)}
 filter={isSelected ? "url(#glow1)" : undefined}
 />
 {/* Emoji */}
 <text x={p.x} y={p.y - 2} textAnchor="middle" dominantBaseline="middle"
 fontSize={isSelected ? 18 : 15} fill="white" pointerEvents="none">
 {n.emoji}
 </text>
 {/* Label */}
 <text x={p.x} y={p.y + r + 14} textAnchor="middle" fontSize={10}
 fill={dimmed ? (theme === "dark" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)") : "var(--text-mid)"} pointerEvents="none" fontWeight={isSelected ? 700 : 400}>
 {n.name}
 </text>
 </g>
 );
 })}
 </svg>
  );
}

function App() {
  // === Cognito 테스트 페이지 분기 (개발용) ===
  // URL hash 가 #cognito-test 이면 테스트 페이지만 보여줌
  // 기존 앱에 영향 없음 (조건부 early return)
  if (typeof window !== "undefined" && window.location.hash === "#cognito-test") {
    return <CognitoTestPage />;
  }
  if (typeof window !== "undefined" && window.location.hash === "#migrate-data") {
    return <MigrateDataPage />;
  }

  const { locale, setLocale, t } = useLocale();
  const { theme } = useTheme();
  // Fixed node positions for instant page load and immediate footer interactivity
  const { pos, setPos, posRef, dragRef, pan, setPan, zoom, setZoom } = useForce();

  //  Google 로그인 에러 메시지를 다국어로 처리
  const translateAuthError = (errorMessage: string): string => {
 if (errorMessage.includes("Google 로그인 창이 닫혔") || errorMessage.includes("popup closed")) {
 return t("errorPopupClosedByUser");
 }
 if (errorMessage.includes("브라우저가 Google 로그인 창을 차단") || errorMessage.includes("popup blocked")) {
 return t("errorPopupBlocked");
 }
 return errorMessage;
  };

  //  보안: admin 이메일은 번들에 담지 않음 (서버 /api/checkAdmin 사용)
  //  테스트용 paid 이메일도 번들 제거 (프로덕션에서 사용 안 함)
  const TEST_PAID_EMAILS: string[] = [];
  const [tab, setTab] = useState<"quiz" | "concept" | "status" | "mockExam" | "pastExam" | "posts" | "admin" | "users" | "console">("quiz");
  const [showQuizIntroModal, setShowQuizIntroModal] = useState(false);
  const [quizIntroStep, setQuizIntroStep] = useState(0);
  const [quizIntroDontShowToday, setQuizIntroDontShowToday] = useState(false);

  // 기출문제 (Past Exams) 상태
  const [pastExamPage, setPastExamPage] = useState(1);
  const [pastExamPageInput, setPastExamPageInput] = useState("1");
  const [pastExamCache, setPastExamCache] = useState<Map<number, any[]>>(new Map());
  const [pastExamTotalCount, setPastExamTotalCount] = useState(0);
  const [pastExamLoading, setPastExamLoading] = useState(false);
  const [revealedAnswers, setRevealedAnswers] = useState<Set<string>>(new Set());
  const [uploadingPastExam, setUploadingPastExam] = useState(false);
  const [pastExamError, setPastExamError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [catFilter, setCatFilter] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<"medium" | "hard" | "challenge">("medium");
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showEasyMode, setShowEasyMode] = useState(false);
  const [showOriginalMap, setShowOriginalMap] = useState<Record<number, boolean>>({});
  const [visitorCount, setVisitorCount] = useState(0);
  const [totalVisitorCount, setTotalVisitorCount] = useState(0);
  const [graphPanelWidth, setGraphPanelWidth] = useState(50); // 비율 (%)
  const [isResizing, setIsResizing] = useState(false);
  const resizeStartPosRef = useRef<{ startX: number; startWidth: number } | null>(null);
  const [, setPurchaseCount] = useState(0);
  const [paidUsers, setPaidUsers] = useState(0);
  const [freeUsers, setFreeUsers] = useState(0);
  const [allUsers, setAllUsers] = useState<Array<{ userId: string; email: string; userStatus: string; createdAt: string }>>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedUserSessions, setSelectedUserSessions] = useState<any[]>([]);
  const [graphPeriod, setGraphPeriod] = useState<"daily" | "weekly" | "monthly">("monthly");
  const [graphMonthOffset, setGraphMonthOffset] = useState(0);
  const [graphWeekIndex, setGraphWeekIndex] = useState(0);
  const [graphData, setGraphData] = useState<Array<{ label: string; count: number }>>([]);
  const [graphZoom, setGraphZoom] = useState(1);
  const [conceptTranslating] = useState(false);

  // 모의시험
  const [mockExamRunning, setMockExamRunning] = useState(false);
  const [mockExamProblems, setMockExamProblems] = useState<Problem[]>([]);
  const [mockExamStartTime, setMockExamStartTime] = useState<number | null>(null);
  const [mockExamCurrentIndex, setMockExamCurrentIndex] = useState(0);
  const [mockExamAnswers, setMockExamAnswers] = useState<(string | null)[]>([]);
  const [mockExamResults, setMockExamResults] = useState<{
 totalScore: number;
 correct: number;
 wrong: number;
 correctRate: number;
 passed: boolean;
 timeSpent: number;
  } | null>(null);
  const [mockExamTimeRemaining, setMockExamTimeRemaining] = useState(130 * 60); // 130분 (초)
  const [mockExamIsLoading, setMockExamIsLoading] = useState(false); // 문제 로딩 중 표시
  const [mockExamAlreadyTaken, setMockExamAlreadyTaken] = useState(false); // 오늘 이미 본 여부
  const [mockExamDateChecking, setMockExamDateChecking] = useState(true); // Firebase 날짜 확인 중
  const [, setMockExamNextAvailableTime] = useState<string>(""); // 다시 볼 수 있는 시간
  const [mockExamPdfCreatedAt, setMockExamPdfCreatedAt] = useState<number | null>(null); // PDF 생성 시간
  const [currentUtcTime, setCurrentUtcTime] = useState<string>(""); // 현재 UTC 시간 (실시간)
  const [nextUtcDate, setNextUtcDate] = useState<string>(""); // 내일 UTC 날짜

  // 퀴즈 통계
  const [quizStats, setQuizStats] = useState<{
 totalAttempts: number;
 correctCount: number;
 accuracy: number;
 byService: { [service: string]: { total: number; correct: number; accuracy: number } };
  } | null>(null);

  // 사용자 상태 및 일일 제한
  //  보안: sessionStorage만 사용 (localStorage 해킹 방지)
  const initialUserStatus: UserStatus = typeof window !== "undefined"
 ? (sessionStorage.getItem("userStatus") as UserStatus) || "guest"
 : "guest";
  const [userStatus, setUserStatusLocal] = useState<UserStatus>(initialUserStatus);
  const [dailyCount, setDailyCount] = useState(0);
  const [showLanding, setShowLanding] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showCognitoSignup, setShowCognitoSignup] = useState(false);
  const [showCognitoLogin, setShowCognitoLogin] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Scenario Console State
  const [scenarioType, setScenarioType] = useState<'sec' | 'res' | 'perf' | 'cost' | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<number | null>(null);
  const [scenarioStepIdx, setScenarioStepIdx] = useState(0);
  const [consoleInput, setConsoleInput] = useState('');
  const [consoleHistory, setConsoleHistory] = useState<Array<{type: 'cmd' | 'output' | 'error' | 'hint'; text: string; isCorrect?: boolean}>>([]);
  const [, setScenarioAttempts] = useState(0);
  const [showScenarioAnswer, setShowScenarioAnswer] = useState(false);
  const [scenarioSubmitFeedback, setScenarioSubmitFeedback] = useState<string | null>(null);

  // Helper function to get challenges by type and locale
  const getChallengesForLocale = (type: 'sec' | 'res' | 'perf' | 'cost', loc: string) => {
    const maps: Record<string, Record<string, Record<number, any>>> = {
      sec: { ko: SEC_KO, en: SEC_EN, ja: SEC_JA },
      res: { ko: RES_KO, en: RES_EN, ja: RES_JA },
      perf: { ko: PERF_KO, en: PERF_EN, ja: PERF_JA },
      cost: { ko: COST_KO, en: COST_EN, ja: COST_JA },
    };
    return maps[type]?.[loc] || maps[type]?.['ko']; // Fallback to Korean
  };
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [subscriptionCancelled, setSubscriptionCancelled] = useState(false);
  const [dday, setDday] = useState("-");
  const [showExamDateModal, setShowExamDateModal] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [, setIsPasswordLoginLinked] = useState(false);
  const [showEmailVerificationModal, setShowEmailVerificationModal] = useState(false);
  const [emailVerificationMessage, setEmailVerificationMessage] = useState<string | null>(null);
  const [emailVerificationUserEmail, setEmailVerificationUserEmail] = useState<string | null>(null);
  const [emailVerificationResending, setEmailVerificationResending] = useState(false);
  const [, setIsWaitingEmailVerification] = useState(false);
  const [streak, setStreak] = useState(0);
  const [sessionId] = useState<string>(`${Date.now()}`); // 현재 세션 ID
  const [pdfGeneratingId, setPdfGeneratingId] = useState<string | number | null>(null); // PDF 생성 중인 세션

  // 문제 세션 (PDF 다운로드용)
  const [problemSessions, setProblemSessions] = useState<Array<{
 date: string;
 time: string;
 problemCount: number;
 difficulty: string;
 problems: Problem[];
 sessionTimestamp: number;
  }> | null>(null);

  // 게시글 탭 상태
  const [posts, setPosts] = useState<any[]>([]);
  const [postsPage, setPostsPage] = useState(1);
  const [postsTotalCount, setPostsTotalCount] = useState(0);
  const [postsSearch, setPostsSearch] = useState("");
  const [postsFilterMine, setPostsFilterMine] = useState(false);
  const [showPostForm, setShowPostForm] = useState(false);

  // 앱 초기화: 만료된 PDF만 삭제 & 날짜 변경 시 플래그 초기화 (한 번만 실행)
  useEffect(() => {
 // ✅ 만료된 PDF만 삭제 (24시간 이상 지난 경우)
 const pdfCreatedAtStr = localStorage.getItem("mockExamPdfCreatedAt");
 if (pdfCreatedAtStr) {
 const pdfCreatedAt = parseInt(pdfCreatedAtStr);
 const now = Date.now();
 const hoursElapsed = (now - pdfCreatedAt) / (1000 * 60 * 60);

 if (hoursElapsed >= 24) {
 localStorage.removeItem("mockExamPdfCreatedAt");
 }
 }

 // ✅ 자정이 지나면 모의시험 하루 제한 플래그 초기화
 const today = new Date().toISOString().split('T')[0];
 const mockExamStartedDate = localStorage.getItem("mockExamStartedToday");

 if (mockExamStartedDate && mockExamStartedDate !== today) {
 localStorage.removeItem("mockExamStartedToday");
 }
  }, []);

  // 동적 메타데이터 업데이트 (다국어 SEO)
  useEffect(() => {
 const updateMetaTags = () => {
 const pageTitle = t("pageTitle");
 const pageDesc = t("pageDescription");
 const pageKeywords = t("pageKeywords");
 const ogTitle = t("ogTitle");
 const ogDesc = t("ogDescription");
 const twitterTitle = t("twitterTitle");
 const twitterDesc = t("twitterDescription");

 // 페이지 언어 업데이트
 const html = document.documentElement;
 const langMap: { [key: string]: string } = { ko: "ko", en: "en", ja: "ja" };
 html.lang = langMap[locale] || "ko";

 // title 업데이트
 document.title = pageTitle;

 // meta description 업데이트
 let metaDesc = document.querySelector('meta[name="description"]');
 if (!metaDesc) {
 metaDesc = document.createElement("meta");
 metaDesc.setAttribute("name", "description");
 document.head.appendChild(metaDesc);
 }
 metaDesc.setAttribute("content", pageDesc);

 // meta keywords 업데이트
 let metaKeywords = document.querySelector('meta[name="keywords"]');
 if (!metaKeywords) {
 metaKeywords = document.createElement("meta");
 metaKeywords.setAttribute("name", "keywords");
 document.head.appendChild(metaKeywords);
 }
 metaKeywords.setAttribute("content", pageKeywords);

 // Open Graph 업데이트
 const updateOGTag = (property: string, content: string) => {
 let tag = document.querySelector(`meta[property="${property}"]`);
 if (!tag) {
 tag = document.createElement("meta");
 tag.setAttribute("property", property);
 document.head.appendChild(tag);
 }
 tag.setAttribute("content", content);
 };

 updateOGTag("og:title", ogTitle);
 updateOGTag("og:description", ogDesc);
 updateOGTag("og:locale", locale === "ja" ? "ja_JP" : locale === "en" ? "en_US" : "ko_KR");

 // Twitter Card 업데이트
 const updateTwitterTag = (name: string, content: string) => {
 let tag = document.querySelector(`meta[name="${name}"]`);
 if (!tag) {
 tag = document.createElement("meta");
 tag.setAttribute("name", name);
 document.head.appendChild(tag);
 }
 tag.setAttribute("content", content);
 };

 updateTwitterTag("twitter:title", twitterTitle);
 updateTwitterTag("twitter:description", twitterDesc);
 };

 updateMetaTags();
  }, [locale, t]);

  // 새로고침 후 이메일 검증 대기 상태 복구
  useEffect(() => {
 const pendingEmail = localStorage.getItem("pendingVerificationEmail");
 if (pendingEmail && !userEmail && !showEmailVerificationModal) {
 setEmailVerificationUserEmail(pendingEmail);
 setEmailVerificationMessage(t("emailVerificationMessage").replace("{email}", pendingEmail));
 setShowEmailVerificationModal(true);
 setShowCognitoLogin(true);
 setIsWaitingEmailVerification(true);
 }
  }, [isAuthChecked]);

  // Restore auth state on mount
  useEffect(() => {
 const unsubscribe = onAuthStateChange(async (user) => {
 if (user?.email) {
 // ✅ 사용자 정보를 먼저 Firestore에 저장 (emailVerified 상관없이)
 try {
 await saveUserInfoToFirebase(user.uid, user.email);
 } catch (error) {
 // Error saving user info
 }

 // ✅ 이메일 검증 상태 업데이트
 setEmailVerified(user.emailVerified);

 // ✅ 이메일 검증 상태 확인 - 검증되지 않으면 로그인 불가
 if (!user.emailVerified) {
 setUserEmail(null);
 setUserStatusLocal("guest");
 setIsPasswordLoginLinked(false);
 localStorage.removeItem("userStatus");
 setShowLanding(true);
 return;
 }

 setUserEmail(user.email);
 setEmailVerified(true);
 setShowLanding(false);
 setIsPasswordLoginLinked(isPasswordLinked(user));

 // Firestore에서 결제 상태 로드
 try {
 let isPaid = await getUserPaidStatus(user.uid);
 const cancelled = await isSubscriptionCancelled(user.uid);
 setSubscriptionCancelled(cancelled);

 // ✅ 테스트 사용자: 환경변수에서 읽은 이메일은 자동으로 paid 처리
 if (user.email && TEST_PAID_EMAILS.includes(user.email)) {
 isPaid = true;
 await updateUserPaidStatus(user.uid, true); // Firebase에도 저장
 }

 const status: UserStatus = isPaid ? "paid" : "loggedIn";
 setUserStatusLocal(status);
 //  보안: paid 상태는 특정 토큰으로만 인식 (수정 방지)
 if (isPaid) {
 const paidToken = `PAID_TOKEN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
 sessionStorage.setItem("userStatus", paidToken);
 } else {
 sessionStorage.setItem("userStatus", status);
 }
 } catch (error) {
 //  보안: sessionStorage 사용, 특정 토큰 형식만 인식
 const statusValue = sessionStorage.getItem("userStatus");
 let status: UserStatus = "loggedIn";
 if (statusValue?.startsWith("PAID_TOKEN_")) {
 status = "paid";
 }
 setUserStatusLocal(status);
 }
 } else {
 // Firebase 사용자가 없을 때 → Cognito 세션 확인 (마이그레이션 기간)
 try {
   const { getCurrentSession, getCurrentUserEmail } = await import("./auth/cognito");
   const session = await getCurrentSession();
   if (session && session.isValid()) {
     const cognitoEmail = await getCurrentUserEmail();
     if (cognitoEmail) {
       setUserEmail(cognitoEmail);
       setEmailVerified(true);
       setUserStatusLocal("loggedIn");
       setIsPasswordLoginLinked(true);
       setShowLanding(false);
       localStorage.setItem("userEmail", cognitoEmail);
       localStorage.setItem("userStatus", "loggedIn");
       setIsAuthChecked(true);
       return;
     }
   }
 } catch (err) {
   // Cognito 미설정 환경 → Firebase 흐름 그대로
 }
 setUserEmail(null);
 setUserStatusLocal("guest");
 setIsPasswordLoginLinked(false);
 localStorage.removeItem("userStatus");
 }
 setIsAuthChecked(true);
 });

 return () => unsubscribe();
  }, []);

  // 앱 시작 시 오래된 모의시험 문제 자동 정리
  useEffect(() => {
 (async () => {
 try {
 await deleteOldMockExamProblems();
 // 오래된 문제 정리 완료
 } catch (error) {
 // Error cleaning up old problems
 }
 })();
  }, []);

  // Track visitors and load purchase count on mount
  useEffect(() => {
 (async () => {
 try {
 const count = await trackVisitor();
 setVisitorCount(count);
 const totalCount = await getTotalVisitorCount();
 setTotalVisitorCount(totalCount);
 const purchaseCount = await getTodayPurchaseCount();
 setPurchaseCount(purchaseCount);
 } catch (error) {
 // 에러 처리만 수행 (로깅 제거)
 }
 })();

 // 일일 카운트 초기화 (로그인 시 Firebase에서 덮어씀)
 setDailyCount(getTodayProblemCount());

 // 로그인 사용자의 Firebase 데이터 로드
 const user = getCurrentUser();
 if (user) {
 (async () => {
 try {
 await getUserQuizStats(user.uid);
 // 일일 문제 생성 횟수는 Firebase dailyStats에서 정확히 읽어옴
 const { count: todayCount } = await canGenerateProblemToday(user.uid, userStatus);
 setDailyCount(todayCount);
 } catch (error) {
 // 에러 처리 생략
 }
 })();
 }

 // D-day 초기화
 setDday(getExamDday());

 // 1초마다 D-day 업데이트
 const interval = setInterval(() => {
 setDday(getExamDday());
 }, 1000);

 // 화면 업데이트 강제 (날짜 변경 감지)
 const dateCheckInterval = setInterval(() => {
 const newDday = getExamDday();
 if (newDday !== dday) {
 setDday(newDday);
 }
 }, 60000); // 1분마다 확인

 return () => {
 clearInterval(interval);
 clearInterval(dateCheckInterval);
 };
  }, []);

  // Check if user is admin (server verification)
  useEffect(() => {
 if (userEmail) {
 isAdminUser(userEmail).then(result => {
 setIsAdmin(result);
 });
 } else {
 setIsAdmin(false);
 }
  }, [userEmail]);

  // Close account menu when clicking outside
  useEffect(() => {
 const handleClickOutside = (e: MouseEvent) => {
 const accountMenu = document.querySelector('[data-account-menu]');
 if (accountMenu && !accountMenu.contains(e.target as Node)) {
 setShowAccountMenu(false);
 }
 };

 if (showAccountMenu) {
 document.addEventListener('mousedown', handleClickOutside);
 }

 return () => {
 document.removeEventListener('mousedown', handleClickOutside);
 };
  }, [showAccountMenu]);

  // UTC 시간 실시간 업데이트 (분 단위)
  useEffect(() => {
 const updateUtcTime = () => {
 const now = new Date();
 const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
 const currentUtcStr = now.toLocaleString('en-US', { timeZone: 'UTC', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
 const nextUtcStr = tomorrow.toLocaleString('en-US', { timeZone: 'UTC', year: 'numeric', month: '2-digit', day: '2-digit' });
 setCurrentUtcTime(currentUtcStr);
 setNextUtcDate(nextUtcStr);
 };

 updateUtcTime();
 const interval = setInterval(updateUtcTime, 60000); // 분 단위 업데이트
 return () => clearInterval(interval);
  }, []);

  // 로그인 후 streak 업데이트 + 시험 시작일 불러오기
  useEffect(() => {
 if (userEmail) {
 // Admin/테스트 사용자 자동 프리미엄 설정 (환경변수에서 읽음)
 if (isAdmin || TEST_PAID_EMAILS.includes(userEmail)) {
 setUserStatusLocal("paid");
 localStorage.setItem("userStatus", "paid");
 // 테스트 이메일 자동 paid 처리 (콘솔 로그 제거)
 }

 (async () => {
 try {
 // Firebase Auth의 실제 uid를 사용하여 업데이트
 const firebaseStreak = await updateStreakInFirebase(userStatus);
 setStreak(firebaseStreak);
 // 로컬 저장소에도 백업
 localStorage.setItem("streak", firebaseStreak.toString());

 // Firebase에서 시험 시작일 불러오기
 const user = getCurrentUser();
 if (user) {
 const examStartDate = await getExamStartDate(user.uid);
 if (examStartDate) {
 localStorage.setItem("examStartDate", examStartDate);
 setDday(getExamDday());
 }
 }
 } catch (error) {
 // Firebase 실패 시 로컬 함수 사용
 setStreak(updateStreak());
 }
 })();
 }
  }, [userEmail]);

  // Admin 탭 통계 로드 (서버 검증 포함)
  useEffect(() => {
 if (tab === "admin" && isAdmin && userEmail) {
 (async () => {
 try {
 const stats = await getAdminStatsSecure(userEmail);
 setPaidUsers(stats.paidUsers);
 setFreeUsers(stats.freeUsers);
 } catch (error) {
 // 에러 처리만 수행 (로깅 제거)
 }
 })();
 }
  }, [tab, isAdmin, userEmail]);

  // Users 탭 사용자 목록 로드 (서버 검증 포함)
  useEffect(() => {
 if (tab === "users" && isAdmin && userEmail) {
 (async () => {
 try {
 const users = await getAllUsersForAdminSecure(userEmail);
 setAllUsers(users);
 setSelectedUser(null);
 setSelectedUserSessions([]);
 } catch (error) {
 // 에러 처리만 수행 (로깅 제거)
 }
 })();
 }
  }, [tab, isAdmin, userEmail]);

  // 그래프 데이터 업데이트
  useEffect(() => {
 (async () => {
 try {
 if (graphPeriod === "daily") {
 const data = await getDailyVisitorsForMonth(graphMonthOffset);
 setGraphData(data.map(d => ({ label: d.date, count: d.count })));
 } else if (graphPeriod === "weekly") {
 const data = await getWeeklyVisitorsForMonth(graphMonthOffset);
 setGraphData(data.map(d => ({ label: d.week, count: d.count })));
 } else if (graphPeriod === "monthly") {
 const data = await getMonthlyVisitors();
 setGraphData(data.map(d => ({ label: d.month, count: d.count })));
 }
 setGraphZoom(1);
 } catch (error) {
 // 에러 처리만 수행 (로깅 제거)
 }
 })();
  }, [graphPeriod, graphMonthOffset, graphWeekIndex]);

  const onNodeClick = (id: string | null) => {
 if (!id) { setSelected(null); return; }
 setSelected(id);
 // Add to slots
 if (!slots.includes(id) && slots.length < 4) {
 setSlots(s => [...s, id]);
 }
  };

  const removeSlot = (id: string) => {
 setSlots(s => s.filter(x => x !== id));
 if (selected === id) setSelected(null);
  };

  const resetSlots = () => {
 setSlots([]);
 setSelected(null);
 setDifficulty("medium");
 setProblem(null);
 setSelectedAnswer(null);
 setError(null);
  };

  // 탭 변경 시 에러 상태 초기화
  useEffect(() => {
 setError(null);
  }, [tab]);

  // 그래프 패널 리사이징
  useEffect(() => {
 const handleMouseMove = (e: MouseEvent) => {
 if (!isResizing || !resizeStartPosRef.current) return;

 const mainArea = document.querySelector('.main-area') as HTMLElement;
 if (!mainArea) return;

 const rect = mainArea.getBoundingClientRect();
 const deltaX = e.clientX - resizeStartPosRef.current.startX;
 const deltaPercent = (deltaX / rect.width) * 100;
 const newWidth = resizeStartPosRef.current.startWidth - deltaPercent;

 // 최소 25%, 최대 75% 제약
 if (newWidth >= 25 && newWidth <= 75) {
 setGraphPanelWidth(newWidth);
 }
 };

 const handleMouseUp = () => {
 setIsResizing(false);
 resizeStartPosRef.current = null;
 };

 if (isResizing) {
 document.addEventListener('mousemove', handleMouseMove);
 document.addEventListener('mouseup', handleMouseUp);
 document.body.style.cursor = 'col-resize';
 document.body.style.userSelect = 'none';
 }

 return () => {
 document.removeEventListener('mousemove', handleMouseMove);
 document.removeEventListener('mouseup', handleMouseUp);
 document.body.style.cursor = 'default';
 document.body.style.userSelect = 'auto';
 };
  }, [isResizing]);

  const handleGenerateProblem = async () => {
 // 로그인 확인
 if (!userEmail) {
 setShowCognitoLogin(true);
 return;
 }

 if (slots.length === 0) {
 return;
 }

 // 일일 제한 확인 (운영자는 제한 없음)
 if (!isAdmin) {
 // ✅ Firebase를 통해 실제 결제 상태 검증 (보안 강화)
 const user = getCurrentUser();
 if (user) {
 const actualPaidStatus = await verifyUserPaidStatusFromFirebase(user.uid);

 // localStorage와 실제 상태가 다르면 업데이트
 if (actualPaidStatus && userStatus !== "paid") {
 setUserStatus("paid");
 setUserStatus("paid");
 } else if (!actualPaidStatus && userStatus === "paid") {
 // 결제 상태가 거짓이면 로그인 상태로 다운그레이드
 setUserStatus("loggedIn");
 }
 }

 const limit = getDailyLimit();
 if (dailyCount >= limit) {
 setError(getQuotaMessage(userStatus, limit, dailyCount));
 setShowAuthModal(true);
 return;
 }
 }

 // Rate Limiting 확인
 if (!checkRateLimit(userEmail)) {
 setError(t("errorTooManyRequests"));
 return;
 }

 setLoading(true);
 setError(null);
 setSelectedAnswer(null);
 setIsSubmitted(false);
 setShowEasyMode(false);

 try {
 //  보안: Firebase 서버에서 권한 확인 (sessionStorage 우회 방지, 운영자는 제한 없음)
 if (userEmail && auth.currentUser?.uid) {
 if (!isAdmin) {
 const { canGenerate, count, limit } = await canGenerateProblemToday(
 auth.currentUser.uid,
 userStatus
 );

 if (!canGenerate) {
 setError(getQuotaMessage(userStatus, limit, count));
 return;
 }
 }

 // 문제 생성 후 Firebase에 기록
 const serviceNames = slots.map(id => {
 const node = NODES.find(n => n.id === id);
 return node?.name || id;
 });

 const generatedProblem = await generateSAAProblem(serviceNames, difficulty, locale);

 // 서버 API로 문제 생성 기록 저장 (보안: 서버에서 검증)
 try {
 const backendUrl = resolveBackendUrl();
 await fetch(`${backendUrl}/api/recordProblemGeneration`, {
 method: "POST",
 headers: {
 "Content-Type": "application/json",
 },
 body: JSON.stringify({
 userId: auth.currentUser.uid,
 problem: generatedProblem
 })
 });
 } catch (error) {
 console.error("❌ Failed to record problem generation:", error);
 }

 setProblem(generatedProblem);

 //  보안: Firebase에서 최신 카운트를 다시 읽어옴 (localStorage 우회 방지)
 // 서버에서 저장한 후 약간의 지연을 두어 읽기 일관성 확보
 await new Promise(resolve => setTimeout(resolve, 300));

 const { count: updatedCount } = await canGenerateProblemToday(
 auth.currentUser.uid,
 userStatus
 );
 // 클라이언트 카운트 업데이트 (Firebase 기반)
 sessionStorage.setItem("problemCountDate", new Date().toISOString().split("T")[0]);
 sessionStorage.setItem(`COUNT_${new Date().toISOString().split("T")[0]}`, `COUNT_${updatedCount}`);
 setDailyCount(updatedCount);
 } else {
 // 비로그인 상태
 const serviceNames = slots.map(id => {
 const node = NODES.find(n => n.id === id);
 return node?.name || id;
 });

 const generatedProblem = await generateSAAProblem(serviceNames, difficulty, locale);
 setProblem(generatedProblem);

 incrementProblemCount();
 setDailyCount(getTodayProblemCount());
 }
 } catch (err) {
 setError(err instanceof Error ? err.message : t("errorGenerate"));
 // 에러 처리만 수행 (로깅 제거)
 } finally {
 setLoading(false);
 }
  };

  // 할당량 메시지 생성
  function getQuotaMessage(status: UserStatus, limit: number, current: number): string {
 if (status === "guest") {
 return t("quotaFullGuest");
 }
 if (status === "loggedIn") {
 return t("quotaFullLoggedIn");
 }
 return `Limit reached (${current}/${limit}).`;
  }

  // Get concept for current locale
  const getConceptForLocale = async () => {
 if (!selected) return null;

 const conceptsByLocale = {
 ko: CONCEPTS_KO,
 en: CONCEPTS_EN,
 ja: CONCEPTS_JA,
 };

 return conceptsByLocale[locale][selected] || null;
  };

  const [concept, setConcept] = useState<Concept | null>(null);

  // 현황 탭과 Quiz 탭에서 퀴즈 통계 로드
  useEffect(() => {
 if (tab === "status" || tab === "quiz") {
 (async () => {
 const user = getCurrentUser();
 if (user) {
 // 만료된 결과 자동 삭제 (백그라운드, 실패해도 무관)
 if (tab === "status") {
 deleteExpiredResults(user.uid).catch(() => {});
 }

 // 통계 로드
 try {
 const stats = await getUserQuizStats(user.uid);
 setQuizStats(stats);
 } catch (error) {
 // 통계 로드 실패 무시
 }

 // Quiz 탭: 일일 횟수
 if (tab === "quiz") {
 try {
 const { count: todayCount } = await canGenerateProblemToday(user.uid, userStatus);
 setDailyCount(todayCount);
 } catch (error) {}
 }

 // 현황 탭: 세션 로드 (독립적으로 실행)
 if (tab === "status") {
 try {
 const sessions = await getUserProblemSessions(user.uid);
 setProblemSessions(sessions);
 } catch (error) {
 setProblemSessions([]);
 }
 }
 } else {
 setQuizStats(null);
 setProblemSessions(null);
 }
 })();
 }
  }, [tab, userEmail]);

  // 퀴즈 탭 최초 진입 시 소개 모달 표시
  // - "오늘 하루 안보기" 체크 시: 24시간 후 다시 노출
  // - 체크 안 하고 닫음: 영구 숨김 (기존 동작)
  useEffect(() => {
    if (tab === "quiz") {
      const seen = localStorage.getItem("quizIntroModalSeen");
      if (seen) return; // 영구 숨김
      const hideUntilStr = localStorage.getItem("quizIntroHideUntil");
      if (hideUntilStr) {
        const hideUntil = parseInt(hideUntilStr, 10);
        if (Number.isFinite(hideUntil) && hideUntil > Date.now()) {
          return; // 아직 24시간 안 지남
        }
        // 만료됨 → 키 정리
        localStorage.removeItem("quizIntroHideUntil");
      }
      setShowQuizIntroModal(true);
    }
  }, [tab]);

  // 기출문제 탭 진입 시 총 개수 조회
  useEffect(() => {
    if (tab !== "pastExam" || !userEmail) return;
    (async () => {
      try {
        const total = await getPastExamTotalCount(locale as any);
        setPastExamTotalCount(total);
      } catch (err) {
        // meta 문서 없음 등 - 조용히 0 유지
      }
    })();
  }, [tab, userEmail, locale]);

  // 유휴 자동 로그아웃 — 30분간 사용자 활동이 없으면 로그아웃
  useEffect(() => {
    if (!userEmail) return;

    const IDLE_LIMIT_MS = 30 * 60 * 1000;
    let timer: ReturnType<typeof setTimeout>;

    const doIdleLogout = async () => {
      await signOut();
      setUserEmail(null);
      setUserStatusLocal("guest");
      localStorage.removeItem("userStatus");
      setShowLanding(true);
      alert(t("msgSessionTimeout"));
    };

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(doIdleLogout, IDLE_LIMIT_MS);
    };

    const activityEvents = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    activityEvents.forEach(e => window.addEventListener(e, resetTimer, { passive: true }));
    resetTimer();

    return () => {
      clearTimeout(timer);
      activityEvents.forEach(e => window.removeEventListener(e, resetTimer));
    };
  }, [userEmail]);

  // 기출문제 페이지 변경 시 로드 (캐시 우선)
  useEffect(() => {
    if (tab !== "pastExam" || !userEmail) return;
    // 이미 캐시에 있으면 스킵
    if (pastExamCache.has(pastExamPage)) return;
    // 무료 유저가 페이지 2+ 접근 시 서버 호출 스킵 (UI에서도 막지만 네트워크 낭비 방지)
    const isPaidOrAdmin = userStatus === "paid" || isAdmin;
    if (pastExamPage > 1 && !isPaidOrAdmin) return;

    (async () => {
      setPastExamLoading(true);
      setPastExamError(null);
      try {
        const { problems } = await fetchPastExamPage(locale as any, pastExamPage, 10);
        setPastExamCache(prev => {
          const next = new Map(prev);
          next.set(pastExamPage, problems);
          return next;
        });
      } catch (err: any) {
        // Firestore 권한 거부 → 결제 모달 트리거 (admin/paid 는 제외)
        const msg = String(err?.message || "");
        const code = String(err?.code || "");
        const isPermissionError =
          code === "permission-denied" ||
          msg.toLowerCase().includes("permission") ||
          msg.toLowerCase().includes("insufficient");

        if (isPermissionError && !isPaidOrAdmin) {
          setShowPaymentModal(true);
          setPastExamPage(1);
          setPastExamPageInput("1");
          setPastExamError(null);
        } else {
          // admin/paid 또는 다른 에러 → 단순 메시지만 표시 (결제 팝업 X)
          setPastExamError(msg || "Failed to load");
        }
      } finally {
        setPastExamLoading(false);
      }
    })();
  }, [tab, pastExamPage, userEmail, userStatus, isAdmin, locale, pastExamCache]);

  // 언어 바뀌면 기출문제 캐시 초기화
  useEffect(() => {
    setPastExamCache(new Map());
    setRevealedAnswers(new Set());
    setPastExamPage(1);
    setPastExamPageInput("1");
  }, [locale]);

  // 모의시험 일일 제한 체크 및 PDF 초기화 (Firebase 기반)
  useEffect(() => {
 if (tab !== "mockExam") return;
 if (!isAuthChecked) return; // Firebase 인증 준비 전에는 실행하지 않음

 // PDF 24시간 자동 삭제 로직
 const pdfCreatedAtStr = localStorage.getItem("mockExamPdfCreatedAt");
 if (pdfCreatedAtStr) {
   const pdfCreatedAt = parseInt(pdfCreatedAtStr, 10);
   if ((Date.now() - pdfCreatedAt) / (1000 * 60 * 60) >= 24) {
     localStorage.removeItem("mockExamPdfCreatedAt");
     setMockExamPdfCreatedAt(null);
   } else {
     setMockExamPdfCreatedAt(pdfCreatedAt);
   }
 }

 // Firebase에서 유저별 모의시험 날짜 확인
 (async () => {
   setMockExamDateChecking(true);
   try {
     const today = new Date().toISOString().split("T")[0];
     const user = auth.currentUser;
     let lastMockExamDate: string | null = null;

     if (user && !isAdmin) {
       lastMockExamDate = await getUserMockExamDate(user.uid);
     }

     if (lastMockExamDate === today) {
       setMockExamAlreadyTaken(true);
       const tomorrow = new Date(today);
       tomorrow.setDate(tomorrow.getDate() + 1);
       const remainingMs = tomorrow.getTime() - Date.now();
       const hours = Math.floor(remainingMs / (1000 * 60 * 60));
       const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
       setMockExamNextAvailableTime(`${hours}시간 ${minutes}분`);
     } else {
       setMockExamAlreadyTaken(false);
       setMockExamNextAvailableTime("");
     }
   } finally {
     setMockExamDateChecking(false);
   }
 })();
  }, [tab, userEmail, isAdmin, isAuthChecked]);

  // 모의시험 타이머
  useEffect(() => {
 if (!mockExamRunning) return;

 const timer = setInterval(() => {
 setMockExamTimeRemaining(prev => {
 if (prev <= 1) {
 // 시간 종료 - 자동 채점
 let correct = 0;
 mockExamProblems.forEach((problem, idx) => {
 if (mockExamAnswers[idx] === problem.answer) correct++;
 });
 const score = Math.round((correct / mockExamProblems.length) * 1000);
 const timeSpent = mockExamStartTime ? Math.floor((Date.now() - mockExamStartTime) / 1000) : 0;

 const results = {
 totalScore: score,
 correct: correct,
 wrong: mockExamProblems.length - correct,
 correctRate: Math.round((correct / mockExamProblems.length) * 100),
 passed: score >= 720,
 timeSpent: timeSpent
 };
 setMockExamResults(results);
 setMockExamRunning(false);
 // ✅ 시험 종료: 고정된 언어 정보 제거
 localStorage.removeItem("mockExamStartedLocale");

 // Admin은 일일 제한 없음
 if (!isAdmin && auth.currentUser) {
   recordMockExamDate(auth.currentUser.uid); // async, fire-and-forget
   setMockExamAlreadyTaken(true);
 }

 return 0;
 }
 return prev - 1;
 });
 }, 1000);

 return () => clearInterval(timer);
  }, [mockExamRunning, mockExamProblems, mockExamAnswers, mockExamStartTime]);

  //  모의시험 백그라운드 점진적 로딩 (1 → 4 → 9 → 19 → 50)
  // UTC 기준으로 생성된 문제 사용 (모든 사용자 공유)
  useEffect(() => {
 if (!mockExamRunning || mockExamProblems.length >= 50) {
   setMockExamIsLoading(false);
   return;
 }

 setMockExamIsLoading(true);

 (async () => {
 try {
 const storedDifficulties = localStorage.getItem("mockExamDifficulties");
 const storedDomains = localStorage.getItem("mockExamDomains");
 const storedAllProblems = localStorage.getItem("mockExamAllProblems");
 const storedConceptServices = localStorage.getItem("mockExamConceptServices");
 const storedThemes = localStorage.getItem("mockExamThemes");
 // ✅ 시험 시작 시 고정된 언어 사용 (시험 중 언어 변경 방지)
 const mockExamLocale = (localStorage.getItem("mockExamStartedLocale") || "ko") as "ko" | "en" | "ja";

 if (!storedDifficulties || !storedDomains || !storedAllProblems) return;

 const difficulties = JSON.parse(storedDifficulties);
 const domains = JSON.parse(storedDomains);
 const allProblems = JSON.parse(storedAllProblems);
 const themes: string[] = storedThemes ? JSON.parse(storedThemes) : new Array(50).fill("concept");
 // 신규 형식: (string[] | null)[]. 구버전 형식 (string | null)[]도 호환.
 const rawConceptServices: any[] = storedConceptServices ? JSON.parse(storedConceptServices) : new Array(50).fill(null);
 const conceptServices: (string[] | null)[] = rawConceptServices.map((v: any) =>
   v === null ? null : (Array.isArray(v) ? v : [v])
 );
 let newProblems = [...mockExamProblems];

 // 점진적 로딩 패턴: 1 → 4 → 9 → 19 → 50
 const loadBatches = [
 { count: 3, target: 4, delay: 1000 }, // 1초 후 3개 추가 (총 4개)
 { count: 5, target: 9, delay: 1000 }, // 2초 후 5개 추가 (총 9개)
 { count: 10, target: 19, delay: 1000 }, // 3초 후 10개 추가 (총 19개)
 { count: 31, target: 50, delay: 1000 } // 4초 후 31개 추가 (총 50개)
 ];

 for (const batch of loadBatches) {
 if (mockExamRunning && newProblems.length < batch.target) {
 // 대기
 await new Promise(resolve => setTimeout(resolve, batch.delay));

 if (!mockExamRunning) break;

 // 배치만큼 문제 추가 (캐시된 문제 또는 생성) - 배치 내 병렬 처리
 const startIdx = newProblems.length;
 const batchPromises: Promise<any>[] = [];
 for (let i = 0; i < batch.count && startIdx + i < 50; i++) {
 if (startIdx + i < allProblems.length) {
 batchPromises.push(Promise.resolve(allProblems[startIdx + i]));
 } else {
 const difficulty = difficulties[startIdx + i] as "medium" | "hard" | "challenge";
 const domain = domains[startIdx + i] as "security" | "resilience" | "performance" | "cost-optimization";
 const serviceList = conceptServices[startIdx + i] ?? [];
 const theme = themes[startIdx + i] || "concept";
 batchPromises.push(generateSAAProblem(serviceList, difficulty, mockExamLocale, domain, theme));
 }
 }
 const batchResults = await Promise.all(batchPromises);
 newProblems.push(...batchResults);

 // 상태 업데이트
 setMockExamProblems(newProblems);
 setMockExamAnswers(new Array(50).fill(null));
 localStorage.setItem("mockExamProblemsCount", newProblems.length.toString());

 // ✅ 점진적 Firebase 저장 (배치마다, 고정된 언어 사용)
 await updateMockExamProblemsProgressively(newProblems, mockExamLocale);
 }
 }

 // 모든 문제 로드 완료 후 정리
 if (newProblems.length === 50 && allProblems.length < 50) {
 localStorage.removeItem("mockExamDifficulties");
 localStorage.removeItem("mockExamDomains");
 localStorage.removeItem("mockExamProblemsCount");
 localStorage.removeItem("mockExamAllProblems");
 localStorage.removeItem("mockExamConceptServices");
 }

 // 로딩 완료
 setMockExamIsLoading(false);
 } catch (error) {
 // 백그라운드 로딩 에러는 무시
 setMockExamIsLoading(false);
 }
 })();
  }, [mockExamRunning]); // ✅ locale 제거: 시험 중 언어 변경 방지 (고정된 mockExamStartedLocale 사용)

  // 게시글 탭에서 게시글 목록 로드
  useEffect(() => {
 if (tab === "posts") {
 (async () => {
 try {
 const result = await getPosts(
 postsPage,
 20,
 postsSearch,
 postsFilterMine && userEmail ? getCurrentUser()?.uid : "",
 userEmail ? getCurrentUser()?.uid : ""
 );
 setPosts(result.posts);
 setPostsTotalCount(result.totalCount);
 } catch (error) {
 // 에러 처리
 }
 })();
 }
  }, [tab, postsPage, postsSearch, postsFilterMine, userEmail]);

  useEffect(() => {
 if (tab === "concept" && selected) {
 getConceptForLocale().then(c => setConcept(c));
 }
  }, [tab, selected, locale]);

  const selectedNode = selected ? NODES.find(n => n.id === selected) : null;

  // PDF 생성 및 업로드 함수 (html2pdf로 한글 지원)
  const generatePDF = async (session: any) => {
 if (!session || !session.problems || session.problems.length === 0) return;

 // undefined/null 문제 필터링
 const validProblems = session.problems.filter((p: any) => p != null);
 if (validProblems.length === 0) return;

 // 로딩 상태 시작
 setPdfGeneratingId(session.sessionTimestamp);

 // HTML 요소 생성 (offscreen DOM에 부착 — html2canvas가 layout/CJK 폰트를 정상 렌더링하려면 필수)
 const element = document.createElement('div');
 element.style.cssText = 'position: absolute; left: -9999px; top: 0; width: 190mm; padding: 20px; background: #fff; color: #000; font-family: "Malgun Gothic", "NanumGothic", "Apple SD Gothic Neo", "Hiragino Sans", "Yu Gothic", "Meiryo", Arial, sans-serif;';

 try {
 element.innerHTML = `
 <h1 style="text-align: center; margin-bottom: 10px; color: black;">AWS SAA-C03 Quiz Problems</h1>
 <p style="text-align: center; color: black; margin-bottom: 20px; font-size: 12px;">
 Date: ${session.date} ${session.time}
 </p>
 <hr style="border: 1px solid #ddd; margin-bottom: 20px;">
 ${validProblems.map((problem: any, index: number) => `
 <div style="margin-bottom: 30px;">
 <!-- 문제 번호 및 제목 -->
 <h3 class="no-break" style="margin-bottom: 12px; color: black; border-bottom: 2px solid #333; padding-bottom: 8px; break-inside: avoid; page-break-inside: avoid;">Q${index + 1}. ${problem.question}</h3>

 <!-- 보기 -->
 <div class="no-break" style="margin-left: 20px; margin-bottom: 15px; break-inside: avoid; page-break-inside: avoid;">
 ${["A", "B", "C", "D"].map(opt => `
 <div style="margin-bottom: 8px; color: black;">
 <strong>${opt}.</strong> ${problem.options[opt as keyof typeof problem.options]}
 </div>
 `).join('')}
 </div>

 <!-- 정답 -->
 <div class="no-break" style="margin-left: 20px; color: black; font-weight: bold; margin-bottom: 15px; background: #f5f5f5; padding: 10px; border-radius: 4px; break-inside: avoid; page-break-inside: avoid;">
 Answer: ${problem.answer}
 </div>

 <!-- 핵심 키워드 -->
 <div class="no-break" style="margin-left: 20px; margin-bottom: 12px; break-inside: avoid; page-break-inside: avoid;">
 <strong style="color: #333; font-size: 13px;">Keywords:</strong>
 <div style="color: black; font-size: 12px; margin-top: 4px; line-height: 1.6;">
 ${problem.keywords?.join(', ') || 'N/A'}
 </div>
 </div>

 <!-- 핵심 목표 -->
 <div class="no-break" style="margin-left: 20px; margin-bottom: 12px; break-inside: avoid; page-break-inside: avoid;">
 <strong style="color: #333; font-size: 13px;">Problem Goal:</strong>
 <div style="color: black; font-size: 12px; margin-top: 6px; line-height: 1.6;">
 ${problem.goal || 'N/A'}
 </div>
 </div>

 <!-- 정답 설명: 각 항목을 개별 no-break 블록으로 -->
 <div style="margin-left: 20px; margin-bottom: 12px;">
 <strong style="color: #333; font-size: 13px;">Answer Explanation:</strong>
 <div class="no-break" style="color: black; font-size: 12px; margin-top: 6px; line-height: 1.8; break-inside: avoid; page-break-inside: avoid;">
 <div style="margin-bottom: 8px;"><strong>Why Correct:</strong> ${problem.explanation?.correct || 'N/A'}</div>
 </div>
 <div class="no-break" style="color: black; font-size: 12px; line-height: 1.8; break-inside: avoid; page-break-inside: avoid;">
 <div style="margin-bottom: 6px;"><strong>Trap A:</strong> ${problem.explanation?.trap_A || 'N/A'}</div>
 </div>
 <div class="no-break" style="color: black; font-size: 12px; line-height: 1.8; break-inside: avoid; page-break-inside: avoid;">
 <div style="margin-bottom: 6px;"><strong>Trap B:</strong> ${problem.explanation?.trap_B || 'N/A'}</div>
 </div>
 <div class="no-break" style="color: black; font-size: 12px; line-height: 1.8; break-inside: avoid; page-break-inside: avoid;">
 <div style="margin-bottom: 0;"><strong>Trap C:</strong> ${problem.explanation?.trap_C || 'N/A'}</div>
 </div>
 </div>

 <!-- 이지 모드 (쉬운 설명) -->
 <div style="margin-left: 20px; margin-bottom: 0;">
 <strong style="color: #333; font-size: 13px;">Easy Mode (Simplified Explanation):</strong>
 <div class="no-break" style="color: black; font-size: 12px; margin-top: 6px; line-height: 1.8; background: #fafafa; padding: 8px 10px; border-radius: 4px; break-inside: avoid; page-break-inside: avoid;">
 <strong>Simple Explanation:</strong> ${problem.easyMode?.explanation || 'N/A'}
 </div>
 <div class="no-break" style="color: black; font-size: 12px; line-height: 1.8; background: #fafafa; padding: 6px 10px; break-inside: avoid; page-break-inside: avoid;">
 <strong>Option A (Easy):</strong> ${problem.easyMode?.A || 'N/A'}
 </div>
 <div class="no-break" style="color: black; font-size: 12px; line-height: 1.8; background: #fafafa; padding: 6px 10px; break-inside: avoid; page-break-inside: avoid;">
 <strong>Option B (Easy):</strong> ${problem.easyMode?.B || 'N/A'}
 </div>
 <div class="no-break" style="color: black; font-size: 12px; line-height: 1.8; background: #fafafa; padding: 6px 10px; break-inside: avoid; page-break-inside: avoid;">
 <strong>Option C (Easy):</strong> ${problem.easyMode?.C || 'N/A'}
 </div>
 <div class="no-break" style="color: black; font-size: 12px; line-height: 1.8; background: #fafafa; padding: 6px 10px 8px 10px; border-radius: 0 0 4px 4px; break-inside: avoid; page-break-inside: avoid;">
 <strong>Option D (Easy):</strong> ${problem.easyMode?.D || 'N/A'}
 </div>
 </div>

 <hr style="border: 1px solid #ddd; margin-top: 20px;">
 </div>
 `).join('')}
 `;

 const fileName = `SAA-Problems_${session.date.replace(/\//g, '-')}_${session.time.replace(/:/g, '-')}.pdf`;

 // DOM에 부착 (html2canvas가 layout/폰트 계산하려면 필수)
 document.body.appendChild(element);

 // html2pdf 옵션
 const options = {
 margin: [15, 12, 15, 12],
 filename: fileName,
 image: { type: 'jpeg', quality: 0.98 },
 html2canvas: { scale: 2, useCORS: true, logging: false, letterRendering: true },
 jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' },
 pagebreak: { mode: ['avoid-all', 'css', 'legacy'], avoid: '.no-break' }
 };

 // PDF Blob 생성 (native Promise 래핑 - html2pdf Worker의 await 호환 문제 해결)
 const pdfBlob = await new Promise<Blob>((resolve, reject) => {
 (html2pdf() as any)
   .set(options)
   .from(element)
   .toPdf()
   .get('pdf', (pdf: any) => {
     try {
       resolve(pdf.output('blob'));
     } catch (e) {
       reject(e);
     }
   });
 });

 // Cloud Storage에 업로드
 const user = getCurrentUser();
 if (user) {
 try {
 await uploadPDFToStorage(user.uid, pdfBlob, session.date, session.time);
 } catch (error) {
 // 업로드 실패는 무시 (다운로드는 계속 진행)
 }
 }

 // 로컬 다운로드
 const url = URL.createObjectURL(pdfBlob);
 const link = document.createElement('a');
 link.href = url;
 link.download = fileName;
 document.body.appendChild(link);
 link.click();
 document.body.removeChild(link);
 URL.revokeObjectURL(url);
 } catch (error) {
 alert(locale === 'en' ? 'PDF generation failed. Please try again.' : locale === 'ja' ? 'PDF生成に失敗しました。' : 'PDF 생성에 실패했습니다. 다시 시도해주세요.');
 } finally {
 // 부착했던 element 제거
 if (element.parentNode) {
 element.parentNode.removeChild(element);
 }
 // 로딩 상태 종료
 setPdfGeneratingId(null);
 }
  };

  // 이메일 인증 모달 닫기 + 부수 정리
  const closeEmailVerificationModal = () => {
    setShowEmailVerificationModal(false);
    setIsWaitingEmailVerification(false);
    localStorage.removeItem("pendingVerificationEmail");
  };

  // 이메일 인증 메일 재발송 핸들러
  const handleResendEmailVerification = async () => {
    setEmailVerificationResending(true);
    try {
      await resendEmailVerification();
      setEmailVerificationMessage(t("emailVerificationResendSuccess"));
    } catch (error: any) {
      if (error.message === "email-verification-too-many-requests" || error.code === "email-verification-too-many-requests") {
        setEmailVerificationMessage(t("emailVerificationTooManyRequests"));
      } else {
        setEmailVerificationMessage(t("emailVerificationResendError"));
      }
    } finally {
      setEmailVerificationResending(false);
    }
  };

  const renderEmailVerificationModal = () => (
    <EmailVerificationModal
      open={showEmailVerificationModal}
      email={emailVerificationUserEmail || ""}
      message={emailVerificationMessage}
      resending={emailVerificationResending}
      onResendClick={handleResendEmailVerification}
      onClose={closeEmailVerificationModal}
    />
  );

  const renderPaymentModal = () => {
    const currentUser = getCurrentUser();
    return !showPaymentModal ? null : (
      <PaymentModal
        onClose={() => setShowPaymentModal(false)}
        onSuccess={async () => {
          setUserStatusLocal("paid");
          setDailyCount(0);
          localStorage.setItem("userStatus", "paid");
          localStorage.setItem("problemCountDate", new Date().toISOString().split("T")[0]);
          localStorage.setItem("problemCount", "0");
          const user = getCurrentUser();
          if (user) {
            try { await updateUserPaidStatus(user.uid, true); } catch (error) { /* 에러 무시 */ }
          }
          setTimeout(() => setShowPaymentModal(false), 1000);
        }}
        userEmail={currentUser?.email || userEmail || ""}
        userId={currentUser?.uid || ""}
      />
    );
  };

  const renderLoginModal = () => !showLoginModal ? null : (
 <div className="login-modal-overlay" style={{
 position: "fixed", top: "5rem", left: 0, right: 0, bottom: 0,
 background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "flex-start", justifyContent: "center",
 zIndex: 1001, padding: "16px", overflowY: "auto"
 }}>
 <style>{`
   @media(max-width:480px){
     .login-modal-overlay{top:4rem!important;}
     .login-modal-box{padding:24px 20px!important;max-height:calc(100vh - 4rem - 32px);overflow-y:auto;}
   }
 `}</style>
 <div className="login-modal-box" style={{
 background: "#0F1629", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px",
 padding: "48px 40px", maxWidth: "500px", width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.5)"
 }} onClick={e => e.stopPropagation()}>
 <h2 style={{ color: "#fff", marginBottom: "12px", fontSize: "24px", fontWeight: "bold", textAlign: "center" }}>
 {isSignUp ? " " + t("btnSignUp") : " " + t("btnLogIn")}
 </h2>
 <p style={{ color: "#D1D5DB", fontSize: "13px", textAlign: "center", marginBottom: "24px" }}>
 {t("verifyEmailDesc")}
 </p>

 {/* Google 로그인 버튼 */}
 <button
 onClick={async () => {
 setLoginError(null);
 setLoginLoading(true);
 try {
 const user = await signInWithGoogle();
 setUserEmail(user.email);
 setIsPasswordLoginLinked(isPasswordLinked(user));

 // 사용자 정보 저장 및 결제 상태 로드
 await saveUserInfoToFirebase(user.uid, user.email || "");
 let isPaid = await getUserPaidStatus(user.uid);

 // ✅ 임시 테스트: 특정 이메일은 자동으로 paid 처리
 // 환경변수에서 읽은 테스트 이메일 목록 사용
 if (user.email && TEST_PAID_EMAILS.includes(user.email)) {
 isPaid = true;
 await updateUserPaidStatus(user.uid, true); // ✅ Firebase에도 저장
 }

 const status: UserStatus = isPaid ? "paid" : "loggedIn";
 setUserStatusLocal(status);
 localStorage.setItem("userStatus", status);

 //  Firebase에서 실제 일일 생성 수 조회
 const { count } = await canGenerateProblemToday(user.uid, status);
 setDailyCount(count);
 localStorage.setItem("problemCountDate", new Date().toISOString().split("T")[0]);
 sessionStorage.setItem(`COUNT_${new Date().toISOString().split("T")[0]}`, `COUNT_${count}`);
 setShowLoginModal(false);

 // Firebase에서 시험 시작일 확인
 const examStartDate = await getExamStartDate(user.uid);
 if (examStartDate) {
 localStorage.setItem("examStartDate", examStartDate);
 setDday(getExamDday());
 } else {
 // 시험일정이 설정되지 않았을 때만 팝업 띄우기
 setTimeout(() => setShowExamDateModal(true), 300);
 }
 } catch (err: any) {
 setLoginError(translateAuthError(err.message));
 } finally {
 setLoginLoading(false);
 }
 }}
 disabled={loginLoading}
 style={{
 width: "100%", padding: "12px", background: "#fff", color: "#000",
 border: "1px solid #e5e7eb", borderRadius: "8px", cursor: loginLoading ? "not-allowed" : "pointer",
 fontSize: "14px", fontWeight: "bold", marginTop: "16px", display: "flex",
 alignItems: "center", justifyContent: "center", gap: "8px", opacity: loginLoading ? 0.6 : 1
 }}
 >
 <svg width="18" height="18" viewBox="0 0 24 24">
 <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
 <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
 <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC04"/>
 <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
 </svg>
 {t("continueWithGoogle")}
 </button>

 {/* 또는 구분선 */}
 <div style={{ display: "flex", alignItems: "center", margin: "20px 0", gap: "12px" }}>
 <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.2)" }}></div>
 <span style={{ color: "#D1D5DB", fontSize: "12px" }}>또는</span>
 <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.2)" }}></div>
 </div>

 {/* 에러 메시지 */}
 {loginError && (
 <div style={{
 marginBottom: "16px", padding: "12px", background: "rgba(239,68,68,0.1)",
 border: "1px solid rgba(239,68,68,0.3)", borderRadius: "6px", color: "#fca5a5",
 fontSize: "12px", textAlign: "center"
 }}>
 {loginError}
 </div>
 )}

 {/* 이메일/비밀번호 입력 */}
 <form onSubmit={async (e) => {
 e.preventDefault();
 setLoginError(null);
 setLoginLoading(true);

 const email = sanitizeInput((document.getElementById("loginEmail") as HTMLInputElement).value);
 const password = (document.getElementById("loginPassword") as HTMLInputElement).value;
 const displayName = "";

 // 입력값 검증
 if (!validateEmail(email)) {
 setLoginError(t("errorInvalidEmail"));
 setLoginLoading(false);
 return;
 }

 const passwordValidation = validatePassword(password);
 if (!passwordValidation.valid) {
 setLoginError(passwordValidation.error || t("errorPasswordInvalid"));
 setLoginLoading(false);
 return;
 }

 // Rate Limiting 확인
 if (!checkRateLimit(email)) {
 setLoginError(t("errorTooManyRequests"));
 setLoginLoading(false);
 return;
 }

 try {
 if (isSignUp) {
 try {
 await signUp(email, password, displayName);
 } catch (signupError: any) {
 // 이미 가입된 이메일인 경우 - 입력한 비밀번호로 로그인 시도
 if (signupError.code === 'auth/email-already-in-use') {
 try {
 // 입력한 비밀번호로 로그인 시도
 await signIn(email, password);
 // 로그인 성공했으므로 평소대로 진행 (아래 코드 실행)
 } catch (loginError: any) {
 // 비밀번호가 틀렸거나 다른 오류 → 인증 메일 재발송 모달
 setEmailVerificationUserEmail(email);
 setEmailVerificationMessage(t("emailVerificationMessage").replace("{email}", email));
 setIsWaitingEmailVerification(true);
 setShowEmailVerificationModal(true);
 setLoginError(null);
 setShowLoginModal(false);
 setLoginLoading(false);
 return;
 }
 // 로그인 성공 시 - 이메일 검증 상태 확인
 await refreshUserData();
 const currentUser = getCurrentUser();
 if (currentUser && !currentUser.emailVerified) {
 setEmailVerificationUserEmail(email);
 setEmailVerificationMessage(t("emailVerificationMessage").replace("{email}", email));
 setIsWaitingEmailVerification(true);
 setShowEmailVerificationModal(true);
 setShowLoginModal(false);
 setLoginLoading(false);
 return;
 }
 } else {
 throw signupError;
 }
 }

 // ✅ 회원가입 완료 - 이메일 검증 모달 표시
 setIsWaitingEmailVerification(true);
 setEmailVerificationMessage(t("emailVerificationMessage").replace("{email}", email));
 setEmailVerificationUserEmail(email);
 setShowEmailVerificationModal(true);
 localStorage.setItem("pendingVerificationEmail", email);
 setLoginError(null);
 return;
 }  else if (!isSignUp) {
 await signIn(email, password);
 // ✅ 로그인 성공 후 이메일 검증 상태 확인
 await refreshUserData(); // 최신 상태 새로고침
 const currentUser = getCurrentUser();
 if (currentUser && !currentUser.emailVerified) {
 // 이메일이 아직 검증되지 않음 - 로컬 상태는 로그아웃 처리
 localStorage.setItem("pendingVerificationEmail", email);
 // UI 상태 초기화
 setUserEmail(null);
 setUserStatusLocal("guest");
 localStorage.removeItem("userStatus");
 localStorage.removeItem("userName");
 localStorage.removeItem("problemCountDate");
 localStorage.removeItem("examStartDate");

 // 🔹 인증 메일 자동 재발송 (rate limit 시 모달에서 수동 재발송 가능)
 try {
 await resendEmailVerification();
 } catch (err) {
 // 자동 재발송 실패 → 사용자가 모달의 재발송 버튼으로 수동 재시도 가능
 }

 // 로그인 모달은 유지, 인증 모달을 위에 겹쳐 띄움
 setLoginError(null);
 setEmailVerificationUserEmail(email);
 setEmailVerificationMessage(t("emailVerificationMessage").replace("{email}", email));
 setIsWaitingEmailVerification(true);
 setShowEmailVerificationModal(true);
 setLoginLoading(false);
 return;
 }
 }
 setIsPasswordLoginLinked(true);

 // 성공 시 상태 업데이트
 setUserEmail(email);
 const userName = isSignUp ? displayName : (localStorage.getItem("userName") || email.split("@")[0]);

 // 사용자 정보 저장 및 결제 상태 로드
 const user = getCurrentUser();
 if (user) {
 await saveUserInfoToFirebase(user.uid, email);
 let isPaid = await getUserPaidStatus(user.uid);

 // ✅ 임시 테스트: 특정 이메일은 자동으로 paid 처리
 // 환경변수에서 읽은 테스트 이메일 목록 사용
 if (TEST_PAID_EMAILS.includes(email)) {
 isPaid = true;
 await updateUserPaidStatus(user.uid, true); // ✅ Firebase에도 저장
 }

 const status: UserStatus = isPaid ? "paid" : "loggedIn";
 setUserStatusLocal(status);
 localStorage.setItem("userStatus", status);
 } else {
 setUserStatusLocal("loggedIn");
 localStorage.setItem("userStatus", "loggedIn");
 }

 localStorage.setItem("userName", userName);

 //  Firebase에서 실제 일일 생성 수 조회
 const currentUser = getCurrentUser();
 if (currentUser) {
 const status: UserStatus = localStorage.getItem("userStatus") as UserStatus || "loggedIn";
 const { count } = await canGenerateProblemToday(currentUser.uid, status);
 setDailyCount(count);
 sessionStorage.setItem(`COUNT_${new Date().toISOString().split("T")[0]}`, `COUNT_${count}`);
 } else {
 setDailyCount(0);
 }
 localStorage.setItem("problemCountDate", new Date().toISOString().split("T")[0]);
 setShowLoginModal(false);

 // 세션 타임아웃 설정 (30분 비활동 시 자동 로그아웃)
 resetSessionTimeout(() => {
 setUserEmail(null);
 setUserStatusLocal("guest");
 localStorage.removeItem("userStatus");
 });

 // Firebase에서 시험 시작일 확인
 if (currentUser) {
 const examStartDate = await getExamStartDate(currentUser.uid);
 if (examStartDate) {
 localStorage.setItem("examStartDate", examStartDate);
 setDday(getExamDday());
 } else {
 // 시험일정이 설정되지 않았을 때만 팝업 띄우기
 setTimeout(() => setShowExamDateModal(true), 300);
 }
 } else {
 // user가 없으면 localStorage에서 확인
 const examDate = localStorage.getItem("examStartDate");
 if (!examDate) {
 setTimeout(() => setShowExamDateModal(true), 300);
 }
 }
 } catch (err: any) {
 // Google 로그인 전용 계정인 경우
 if (err.message.includes("Google 로그인으로만")) {
 setLoginError("❌ 이 이메일은 Google 로그인으로만 가입되었습니다.\n\n'Google로 계속' 버튼으로 로그인하세요.\n\n또는 다른 이메일로 회원가입해주세요.");
 setIsSignUp(false); // 로그인 폼으로 전환
 } else {
 setLoginError(translateAuthError(err.message));
 }
 } finally {
 setLoginLoading(false);
 }
 }} style={{ marginBottom: "24px" }}>
 <input type="email"
 id="loginEmail"
 placeholder={t("verifyEmailPlaceholder")}
 required
 style={{
 width: "100%", padding: "12px 16px", background: "rgba(255,255,255,0.05)",
 border: "1px solid #2A344A", borderRadius: "8px",
 color: "#D1D5DB", fontSize: "14px", boxSizing: "border-box",
 marginBottom: "12px"
 }} />

 <input type="password"
 id="loginPassword"
 placeholder={t("passwordPlaceholder")}
 required
 minLength={6}
 style={{
 width: "100%", padding: "12px 16px", background: "rgba(255,255,255,0.05)",
 border: "1px solid #2A344A", borderRadius: "8px",
 color: "#D1D5DB", fontSize: "14px", boxSizing: "border-box",
 marginBottom: "12px"
 }} />

 <button type="submit"
 disabled={loginLoading}
 style={{
 width: "100%", padding: "12px", background: "#FF9900", color: "#0F1629",
 border: "none", borderRadius: "8px", cursor: loginLoading ? "not-allowed" : "pointer",
 fontSize: "14px", fontWeight: "bold", opacity: loginLoading ? 0.6 : 1
 }}>
 {loginLoading ? t("btnGenerating") : (isSignUp ? t("btnSignUp") : t("btnLogIn"))}
 </button>
 </form>

 {/* 로그인/회원가입 토글 */}
 <div style={{ textAlign: "center", marginBottom: "24px" }}>
 <span style={{ color: "#D1D5DB", fontSize: "13px" }}>
 {isSignUp ? t("alreadyHaveAccount") + " " : t("dontHaveAccount") + " "}
 <button onClick={() => {
   if (isSignUp) {
     // 가입 → 로그인 토글
     setIsSignUp(false);
     setLoginError(null);
   } else {
     // 회원가입 클릭 → Cognito 모달로 전환 (Firebase 모달 닫기)
     setShowLoginModal(false);
     setLoginError(null);
     setShowCognitoSignup(true);
   }
 }}
 style={{
 background: "none", border: "none", color: "#FF9900",
 cursor: "pointer", textDecoration: "underline", fontSize: "13px"
 }}>
 {isSignUp ? t("btnLogIn") : t("btnSignUp")}
 </button>
 </span>
 </div>

 {/* 정보 박스 */}
 <div style={{
 textAlign: "center", color: "#D1D5DB", fontSize: "12px",
 padding: "16px", background: "rgba(255,153,0,0.1)", borderRadius: "8px",
 border: "1px solid rgba(255,153,0,0.3)", lineHeight: "1.6"
 }}>
 <p style={{ marginBottom: "8px" }}><strong>{t("loginGetTitle")}</strong></p>
 <p style={{ marginBottom: "12px", color: "#a8d5ff", fontWeight: 500 }}>{t("aiFeature")}</p>
 <p>{t("loginFreeAttempts")}</p>
 <p style={{ marginTop: "12px", color: "#FF9900", fontWeight: "bold" }}>{t("loginUpgradeOffer")}</p>
 <p style={{ marginTop: "8px", color: "#a8d5ff", fontWeight: 500 }}>{t("loginMockExamFeature")}</p>
 </div>

 <button onClick={() => { setShowLoginModal(false); setLoginError(null); }} style={{
 width: "100%", padding: "12px", background: "transparent", color: "#D1D5DB",
 border: "none", cursor: "pointer", fontSize: "14px", marginTop: "20px"
 }}>
 {t("cancelBtn")}
 </button>
 </div>
 </div>
  );

  // 랜딩 페이지 표시 (초기 상태, 비로그인, 또는 로고 클릭 시)
  if (showLanding) {
    return <>
      <LandingPage
        onGetStarted={() => setShowLanding(false)}
        onTabChange={(newTab) => {
          setTab(newTab);
          setShowLanding(false);
        }}
        onLoginClick={() => setShowCognitoLogin(true)}
        onProClick={() => setShowPaymentModal(true)}
        currentLocale={locale}
        onLocaleChange={setLocale}
        userEmail={userEmail}
        isAuthChecked={isAuthChecked}
        emailVerified={emailVerified}
        dday={dday}
        streak={streak}
        onDdayClick={() => setShowExamDateModal(true)}
        userStatus={userStatus}
        subscriptionCancelled={subscriptionCancelled}
        onLogout={async () => {
          await signOut();
          setUserEmail(null);
          setUserStatusLocal("guest");
          localStorage.removeItem("userStatus");
          setShowLanding(true);
        }}
        isAdmin={isAdmin}
      />
      {/* 시험 시작일 설정 모달 (랜딩페이지에서도 사용) */}
      <ExamDateModal
        open={showExamDateModal}
        onClose={() => setShowExamDateModal(false)}
        onSaved={() => setDday(getExamDday())}
      />
      {renderLoginModal()}
      {renderPaymentModal()}

      {/* 이메일 검증 모달 - 랜딩 페이지에서도 표시 */}
      {renderEmailVerificationModal()}

      {/* Cognito 회원가입 모달 (디자인은 기존 톤) */}
      <CognitoSignupModal
        isOpen={showCognitoSignup}
        onClose={() => setShowCognitoSignup(false)}
        onSuccess={(email) => {
          setShowCognitoSignup(false);
          setUserEmail(email);
          setEmailVerified(true);
          setUserStatusLocal("loggedIn");
          localStorage.setItem("userEmail", email);
          localStorage.setItem("userStatus", "loggedIn");
        }}
      />

      {/* Cognito 로그인 모달 */}
      <CognitoLoginModal
        isOpen={showCognitoLogin}
        onClose={() => setShowCognitoLogin(false)}
        onSuccess={(email) => {
          setShowCognitoLogin(false);
          setUserEmail(email);
          setEmailVerified(true);
          setUserStatusLocal("loggedIn");
          localStorage.setItem("userEmail", email);
          localStorage.setItem("userStatus", "loggedIn");
        }}
        onSwitchToSignup={() => {
          setShowCognitoLogin(false);
          setShowCognitoSignup(true);
        }}
      />

      <CookieConsent />
    </>;
  }

  return (
 <div className="app">
 <Navigator
   onTabChange={(newTab) => { setTab(newTab); setShowLanding(false); }}
   currentLocale={locale}
   onLocaleChange={setLocale}
   onLoginClick={() => setShowCognitoLogin(true)}
   showLoginButton={!userEmail}
   onLogoClick={() => setShowLanding(true)}
   userEmail={userEmail}
   dday={dday}
   streak={streak}
   onDdayClick={() => setShowExamDateModal(true)}
   userStatus={userStatus}
   subscriptionCancelled={subscriptionCancelled}
   onLogout={async () => {
     await signOut();
     setUserEmail(null);
     setUserStatusLocal("guest");
     localStorage.removeItem("userStatus");
     localStorage.removeItem("userName");
     localStorage.removeItem("examStartDate");
     setShowLanding(true);
   }}
   onCancelSubscription={async () => {
     const currentUser = getCurrentUser();
     if (currentUser) {
       try {
         const backendBaseUrl = resolveBackendUrl();
         const response = await fetch(`${backendBaseUrl}/api/lemonsqueezy/cancel-subscription`, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({
             userId: currentUser.uid,
             email: currentUser.email || userEmail || ''
           })
         });

         if (!response.ok) {
           const errorData = await response.json().catch(() => ({}));
           throw new Error(errorData.error || 'Failed to cancel subscription');
         }

         setUserStatusLocal("paid");
         localStorage.setItem("userStatus", "paid");
         setSubscriptionCancelled(true);
         alert(
           locale === 'ko'
             ? '구독이 취소되었습니다. 현재 결제 기간 종료일까지는 이용하실 수 있습니다.'
             : locale === 'ja'
               ? '購読がキャンセルされました。現在の請求期間が終わるまではご利用いただけます。'
               : 'Subscription cancelled. You can keep using it until the current billing period ends.'
         );
       } catch (error) {
         alert(locale === 'ko' ? '구독 취소에 실패했습니다.' : locale === 'ja' ? '購読のキャンセルに失敗しました。' : 'Failed to cancel subscription.');
       }
     }
   }}
   isAdmin={isAdmin}
 />




 <div className="main-area" style={{ cursor: isResizing ? 'col-resize' : 'default' }}>
 {/* Left: Controls */}
 <div className="controls-panel" style={{ flex: `0 0 ${(tab === "posts" || tab === "console" || tab === "pastExam") ? "100%" : (100 - graphPanelWidth) + "%"}`, display: (tab === "posts" || tab === "console" || tab === "pastExam") ? "flex" : "flex" }}>
 {tab === "quiz" && (
 <>
 {/* Category filter */}
 <div className="filter-section">
 <button className={`filter-pill ${!catFilter ? "active" : ""}`} onClick={() => setCatFilter(null)}>{t("filterAll")}</button>
 {Object.entries(CAT).map(([key, val]) => (
 <button key={key} className={`filter-pill ${catFilter === key ? "active" : ""}`}
 onClick={() => setCatFilter(catFilter === key ? null : key)}>
 <span className="filter-dot" style={{ background: val.color }} />
 {val.label}
 </button>
 ))}
 </div>

 {/* Slots */}
 <div className="slots-section">
 <div className="slots-header">
 <span className="slots-title">{t("slotsTitle")} ({slots.length}/4)</span>
 <div className="difficulty-buttons">
 <button className="diff-btn reset" onClick={resetSlots}>{t("btnReset")}</button>
 </div>
 </div>
 <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '-2px', marginBottom: '8px' }}>
   {t("slotsRecommendation")}
 </div>

 <div className="slots-grid">
 {[0, 1, 2, 3].map(i => {
 const sid = slots[i];
 const node = sid ? NODES.find(n => n.id === sid) : null;
 return (
 <div key={i} className={`slot-card ${node ? "filled" : ""}`}
 onClick={() => !node && setTab("quiz")}>
 {node ? (
 <>
 <span className="slot-emoji">{node.emoji}</span>
 <span className="slot-name">{node.name}</span>
 <span className="slot-cat">{CAT[node.cat].label}</span>
 <button className="slot-remove" onClick={e => { e.stopPropagation(); removeSlot(sid); }}>&#215;</button>
 </>
 ) : (
 <span className="slot-empty">{t("slotClickToAdd")}</span>
 )}
 </div>
 );
 })}
 </div>

 {/* 예시 프리셋 (빈 상태일 때만) */}
 {slots.length === 0 && (
   <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px', alignItems: 'center' }}>
     <span style={{ fontSize: '12px', color: '#9CA3AF', whiteSpace: 'nowrap' }}>{t("quizPresetLabel")}</span>
     {[
       { label: 'S3 + CloudFront + Route 53', ids: ['s3', 'cloudfront', 'route53'] },
       { label: 'Lambda + API Gateway + DynamoDB', ids: ['lambda', 'apigw', 'dynamodb'] },
       { label: 'EC2 + RDS + ELB', ids: ['ec2', 'rds', 'elb'] },
     ].map(preset => (
       <button
         key={preset.label}
         onClick={() => setSlots(preset.ids)}
         style={{
           padding: '6px 12px',
           background: 'rgba(255, 153, 0, 0.08)',
           border: '1px solid rgba(255, 153, 0, 0.3)',
           borderRadius: '6px',
           fontSize: '12px',
           color: '#FF9900',
           cursor: 'pointer',
           fontFamily: 'inherit',
           transition: 'all 0.15s'
         }}
         onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255, 153, 0, 0.15)'; }}
         onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255, 153, 0, 0.08)'; }}
       >
         {preset.label}
       </button>
     ))}
   </div>
 )}

 <button className="generate-btn"
 disabled={slots.length === 0 || loading || (!userEmail || !emailVerified) || (!isAdmin && dailyCount >= getDailyLimit())}
 onClick={handleGenerateProblem}
 title={!userEmail ? t("loginRequired") : !emailVerified ? "Please verify your email to generate problems" : !isAdmin && dailyCount >= getDailyLimit() ? getQuotaMessage(userStatus, getDailyLimit(), dailyCount) : ""}>
 {loading && <span className="loading-icon">⏳</span>}
 {loading ? t("btnGenerating") : t("btnGenerate")}
 <br />
 <span style={{ fontSize: "11px", opacity: 0.7, display: "block", marginTop: "4px" }}>
 {isAdmin ? t("adminLabel") : `${t("dailyRemainingPrefix")} ${Math.max(0, getDailyLimit() - dailyCount)}${t("dailyRemainingText")}`}
 </span>
 </button>

 {error && (
 <div className="error-message" style={{ color: "#ff6b6b", marginTop: "12px", padding: "10px", background: "rgba(255,107,107,0.1)", borderRadius: "6px" }}>
 {error}
 </div>
 )}

 {problem && (
 <div className="problem-container" style={{ marginTop: "20px", borderTop: "1px solid #2A344A", paddingTop: "20px" }}>
 <h3 style={{ fontSize: "14px", color: "#D1D5DB", marginBottom: "12px" }}></h3>
 <div className="problem-content">
 <div className="problem-section" style={{ marginBottom: "16px" }}>
 <p style={{ color: "#D1D5DB", lineHeight: "1.6", marginBottom: "8px" }}>{problem.question}</p>
 </div>

 <div className="options" style={{ marginBottom: "16px" }}>
 {(["A", "B", "C", "D"] as const).map(opt => (
 <button
 key={opt}
 onClick={() => setSelectedAnswer(opt)}
 disabled={isSubmitted}
 style={{
 display: "block",
 width: "100%",
 padding: "12px",
 marginBottom: "8px",
 background: selectedAnswer === opt
 ? (isSubmitted && opt === problem.answer ? "#10b981" : isSubmitted && opt !== problem.answer ? "#ef4444" : "rgba(255,153,0,0.2)")
 : isSubmitted && opt === problem.answer ? "rgba(16,185,129,0.15)"
 : "rgba(255,255,255,0.05)",
 border: `1px solid ${selectedAnswer === opt
 ? (isSubmitted && opt === problem.answer ? "#10b981" : isSubmitted && opt !== problem.answer ? "#ef4444" : "rgba(255,153,0,0.4)")
 : isSubmitted && opt === problem.answer ? "rgba(16,185,129,0.4)"
 : "rgba(255,255,255,0.1)"}`,
 borderRadius: "6px",
 color: "#D1D5DB",
 textAlign: "left",
 cursor: isSubmitted ? "default" : "pointer",
 fontSize: "13px",
 transition: "all 0.2s",
 opacity: isSubmitted && opt !== problem.answer && selectedAnswer !== opt ? 0.5 : 1,
 }}
 >
 <strong>{opt}.</strong> {problem.options[opt]}
 </button>
 ))}
 </div>

 {!isSubmitted && selectedAnswer && (
 <button
 onClick={async () => {
 setIsSubmitted(true);
 // 로그인된 사용자면 결과 저장
 const user = getCurrentUser();

 if (user && problem) {
 try {
 const backendUrl = resolveBackendUrl();
 const response = await fetch(`${backendUrl}/api/recordQuizResult`, {
 method: "POST",
 headers: {
 "Content-Type": "application/json",
 },
 body: JSON.stringify({
 userId: user.uid,
 problem: problem,
 selectedAnswer: selectedAnswer,
 difficulty: difficulty as "medium" | "hard" | "challenge",
 sessionId: sessionId,
 selectedServices: slots // 선택된 서비스 목록 전달
 })
 });

 if (!response.ok) {
 throw new Error(`Server returned ${response.status}`);
 }

 // 세션 목록 즉시 갱신 (현황 탭 PDF 다운로드 반영)
 const sessions = await getUserProblemSessions(user.uid);
 setProblemSessions(sessions);
 } catch (error) {
 console.error(`❌ Error in recordQuizResult:`, error);
 }
 } else {
 }
 }}
 style={{
 width: "100%",
 padding: "12px",
 marginBottom: "16px",
 background: "linear-gradient(135deg, rgba(255,153,0,0.2) 0%, rgba(255,153,0,0.15) 100%)",
 border: "1px solid rgba(255,153,0,0.4)",
 borderRadius: "6px",
 color: "var(--accent)",
 fontWeight: "600",
 cursor: "pointer",
 fontSize: "13px",
 transition: "all 0.2s",
 }}
 onMouseEnter={(e) => {
 e.currentTarget.style.background = "linear-gradient(135deg, rgba(255,153,0,0.3) 0%, rgba(255,153,0,0.25) 100%)";
 e.currentTarget.style.borderColor = "rgba(255,153,0,0.6)";
 }}
 onMouseLeave={(e) => {
 e.currentTarget.style.background = "linear-gradient(135deg, rgba(255,153,0,0.2) 0%, rgba(255,153,0,0.15) 100%)";
 e.currentTarget.style.borderColor = "rgba(255,153,0,0.4)";
 }}
 >
 {t("btnSubmit")}
 </button>
 )}

 {isSubmitted && (
 <div className="explanation" style={{ background: "rgba(255,255,255,0.03)", padding: "12px", borderRadius: "6px", marginTop: "12px" }}>
 {/* 정답 표시 */}
 <div style={{ fontSize: "12px", color: selectedAnswer === problem.answer ? "#10b981" : "#ef4444", marginBottom: "8px", fontWeight: "bold" }}>
 {selectedAnswer === problem.answer ? t("quizCorrect") : t("quizIncorrect")}
 </div>

 {/* 핵심 목표 */}
 {(problem as any).goal && (
 <div style={{ fontSize: "12px", color: "#a78bfa", marginBottom: "8px", padding: "8px", background: "rgba(167,139,250,0.1)", borderRadius: "4px" }}>
 <strong>{t("quizKeyGoal")}</strong> {(problem as any).goal}
 </div>
 )}

 {/* 정답과 설명 */}
 <div style={{ fontSize: "12px", color: "#D1D5DB", lineHeight: "1.6", marginBottom: "8px" }}>
 <strong>{t("quizAnswer")} {problem.answer}</strong>
 </div>
 <div style={{ fontSize: "12px", color: "#D1D5DB", lineHeight: "1.6", marginBottom: "8px" }}>
 <strong>{t("quizExplanation")}</strong>
 <p style={{ marginTop: "6px" }}>{problem.explanation.correct}</p>
 {selectedAnswer !== problem.answer && problem.explanation[`trap_${selectedAnswer}` as keyof typeof problem.explanation] && (
 <p style={{ marginTop: "6px", color: "#ef4444" }}>
 <strong>{t("quizTrap")}</strong> {problem.explanation[`trap_${selectedAnswer}` as keyof typeof problem.explanation]}
 </p>
 )}
 </div>

 {/* easyMode 버튼 */}
 {(problem as any).easyMode && (
 <button
 onClick={() => setShowEasyMode(!showEasyMode)}
 style={{
 width: "100%",
 padding: "10px",
 marginBottom: "12px",
 marginTop: "8px",
 background: showEasyMode ? "rgba(34,197,94,0.2)" : "rgba(245,158,11,0.2)",
 border: `1px solid ${showEasyMode ? "rgba(34,197,94,0.4)" : "rgba(245,158,11,0.4)"}`,
 borderRadius: "6px",
 color: showEasyMode ? "#4ade80" : "#fbbf24",
 fontWeight: "600",
 cursor: "pointer",
 fontSize: "12px",
 transition: "all 0.2s",
 }}
 onMouseEnter={(e) => {
 e.currentTarget.style.background = showEasyMode ? "rgba(34,197,94,0.3)" : "rgba(245,158,11,0.3)";
 }}
 onMouseLeave={(e) => {
 e.currentTarget.style.background = showEasyMode ? "rgba(34,197,94,0.2)" : "rgba(245,158,11,0.2)";
 }}
 >
 {showEasyMode ? t("quizEasyModeClose") : t("quizEasyMode")}
 </button>
 )}

 {/* easyMode 설명 */}
 {showEasyMode && (problem as any).easyMode && (
 <div style={{ fontSize: "12px", color: "#D1D5DB", padding: "12px", background: "rgba(245,158,11,0.1)", borderRadius: "6px", marginBottom: "12px" }}>
 <strong style={{ color: "#fbbf24" }}>{t("quizEasyModeExplanation")}</strong>
 <p style={{ marginTop: "6px", lineHeight: "1.6" }}>{(problem as any).easyMode.explanation}</p>
 <div style={{ marginTop: "8px", paddingTop: "8px", borderTop: "1px solid rgba(245,158,11,0.2)" }}>
 <strong style={{ color: "#fbbf24" }}>{t("quizEachOptionExplanation")}</strong>
 {(["A", "B", "C", "D"] as const).map(opt => (
 <div key={opt} style={{ marginTop: "6px", color: opt === problem.answer ? "#4ade80" : "#D1D5DB" }}>
 <strong>{opt}.</strong> {(problem as any).easyMode[opt]}
 </div>
 ))}
 </div>
 </div>
 )}

 </div>
 )}

 <button
 onClick={() => setProblem(null)}
 style={{
 marginTop: "12px",
 width: "100%",
 padding: "10px",
 background: "rgba(255,255,255,0.05)",
 border: "1px solid #2A344A",
 borderRadius: "6px",
 color: "#D1D5DB",
 cursor: "pointer",
 fontSize: "13px",
 }}
 >
 {t("btnNextProblem")}
 </button>
 </div>
 </div>
 )}
 </div>

 {/* 프리미엄 배너 - 퀴즈 탭 최하단 (공부 플로우 방해 최소화) */}
 <PremiumBanner
 userStatus={userStatus}
 userEmail={userEmail}
 onLoginClick={() => setShowCognitoLogin(true)}
 onUpgradeClick={() => setShowPaymentModal(true)}
 />
 </>
 )}

 {/* PastExam Tab - 기출문제 */}
 {tab === "pastExam" && (() => {
   const isPaidOrAdmin = userStatus === "paid" || isAdmin;
   const pageSize = 10;
   const totalPages = Math.max(1, Math.ceil(pastExamTotalCount / pageSize));
   const startOrder = (pastExamPage - 1) * pageSize + 1;
   const endOrder = Math.min(pastExamPage * pageSize, pastExamTotalCount);
   const currentProblems = pastExamCache.get(pastExamPage) || [];
   const locked = pastExamPage > 1 && !isPaidOrAdmin;

   const jumpToPage = () => {
     const n = parseInt(pastExamPageInput, 10);
     if (!Number.isFinite(n) || n < 1) return;
     const capped = Math.min(Math.max(1, n), totalPages);
     // 무료 유저가 2페이지 이상 이동 시도 → 결제 모달
     if (capped > 1 && !isPaidOrAdmin) {
       setShowPaymentModal(true);
       return;
     }
     setPastExamPage(capped);
     setPastExamPageInput(String(capped));
   };

   // 무료 유저가 다음 페이지 버튼 클릭 시 → 결제 모달
   const goToNextPage = () => {
     if (!isPaidOrAdmin && pastExamPage >= 1) {
       setShowPaymentModal(true);
       return;
     }
     const p = Math.min(totalPages, pastExamPage + 1);
     setPastExamPage(p);
     setPastExamPageInput(String(p));
   };

   const toggleAnswer = (id: string) => {
     setRevealedAnswers(prev => {
       const next = new Set(prev);
       if (next.has(id)) next.delete(id); else next.add(id);
       return next;
     });
   };

   return (
     <div style={{ padding: "20px 24px 60px", overflowY: "auto", height: "100%" }}>
       <div style={{ maxWidth: "900px", margin: "0 auto" }}>

         {/* 로그인 필요 */}
         {!userEmail ? (
           <div style={{
             padding: "60px 20px",
             textAlign: "center",
             background: "rgba(59, 130, 246, 0.08)",
             border: "1px solid rgba(59, 130, 246, 0.25)",
             borderRadius: "12px"
           }}>
             <h2 style={{ fontSize: "20px", color: "#F9FAFB", marginBottom: "12px", fontWeight: 700 }}>{t("pastExamTitle")}</h2>
             <p style={{ fontSize: "14px", color: "#D1D5DB", marginBottom: "20px" }}>{t("pastExamLoginRequired")}</p>
             <button
               onClick={() => setShowCognitoLogin(true)}
               style={{
                 padding: "10px 20px",
                 background: "#FF9900",
                 color: "#0F1629",
                 border: "none",
                 borderRadius: "8px",
                 fontSize: "14px",
                 fontWeight: 700,
                 cursor: "pointer"
               }}
             >{t("loginButton")}</button>
           </div>
         ) : (
           <>
             {/* 상단: 타이틀 + 페이지 정보 */}
             <div style={{
               display: "flex",
               justifyContent: "space-between",
               alignItems: "center",
               marginBottom: "20px",
               flexWrap: "wrap",
               gap: "12px"
             }}>
               <h2 style={{ fontSize: "20px", color: "#F9FAFB", fontWeight: 700, margin: 0 }}>
                 {t("pastExamTitle")}
               </h2>
               {pastExamTotalCount > 0 && (
                 <span style={{ fontSize: "13px", color: "#9CA3AF", fontFamily: "ui-monospace, monospace" }}>
                   {t("pastExamPageRange")
                     .replace("{start}", String(startOrder))
                     .replace("{end}", String(endOrder))
                     .replace("{total}", String(pastExamTotalCount))}
                 </span>
               )}
             </div>

             {/* 페이지 점프 + 이전/다음 */}
             {pastExamTotalCount > 0 && (
               <div style={{
                 display: "flex",
                 gap: "8px",
                 alignItems: "center",
                 marginBottom: "24px",
                 flexWrap: "wrap"
               }}>
                 <button
                   onClick={() => { const p = Math.max(1, pastExamPage - 1); setPastExamPage(p); setPastExamPageInput(String(p)); }}
                   disabled={pastExamPage <= 1}
                   style={{
                     padding: "8px 14px",
                     background: "rgba(255,255,255,0.05)",
                     border: "1px solid #2A344A",
                     borderRadius: "6px",
                     color: pastExamPage <= 1 ? "#4B5563" : "#D1D5DB",
                     fontSize: "13px",
                     cursor: pastExamPage <= 1 ? "not-allowed" : "pointer",
                     fontFamily: "inherit"
                   }}
                 >{t("pastExamPrevPage")}</button>

                 <button
                   onClick={goToNextPage}
                   disabled={pastExamPage >= totalPages}
                   title={!isPaidOrAdmin && pastExamPage >= 1 ? t("pastExamPaidLockDesc") : ""}
                   style={{
                     padding: "8px 14px",
                     background: (!isPaidOrAdmin && pastExamPage >= 1) ? "rgba(255,153,0,0.08)" : "rgba(255,153,0,0.15)",
                     border: `1px solid rgba(255,153,0,0.4)`,
                     borderRadius: "6px",
                     color: pastExamPage >= totalPages ? "#4B5563" : "#FF9900",
                     fontSize: "13px",
                     cursor: pastExamPage >= totalPages ? "not-allowed" : "pointer",
                     fontFamily: "inherit"
                   }}
                 >{t("pastExamNextPage")}</button>

                 <div style={{ flex: 1 }} />

                 <span style={{ fontSize: "12px", color: "#9CA3AF" }}>{t("pastExamJumpLabel")}:</span>
                 <input
                   type="number"
                   min={1}
                   max={totalPages}
                   value={pastExamPageInput}
                   onChange={(e) => setPastExamPageInput(e.target.value)}
                   onKeyDown={(e) => { if (e.key === "Enter") jumpToPage(); }}
                   style={{
                     width: "72px",
                     padding: "6px 10px",
                     background: "#151E32",
                     border: "1px solid #2A344A",
                     borderRadius: "6px",
                     color: "#D1D5DB",
                     fontSize: "13px",
                     fontFamily: "inherit"
                   }}
                 />
                 <button
                   onClick={jumpToPage}
                   style={{
                     padding: "6px 14px",
                     background: "#FF9900",
                     color: "#0F1629",
                     border: "none",
                     borderRadius: "6px",
                     fontSize: "13px",
                     fontWeight: 700,
                     cursor: "pointer",
                     fontFamily: "inherit"
                   }}
                 >{t("pastExamJumpBtn")}</button>
               </div>
             )}

             {/* 컨텐츠 영역 */}
             {pastExamTotalCount === 0 ? (
               /* 빈 상태 */
               <div style={{
                 padding: "60px 20px",
                 textAlign: "center",
                 background: "#1A253D",
                 border: "1px solid #2A344A",
                 borderRadius: "12px"
               }}>
                 <p style={{ fontSize: "14px", color: "#9CA3AF" }}>{t("pastExamEmpty")}</p>
               </div>
             ) : locked ? (
               /* 무료 유저 잠금 UI */
               <div style={{
                 padding: "60px 20px",
                 textAlign: "center",
                 background: "linear-gradient(135deg, rgba(255,153,0,0.1), rgba(255,153,0,0.04))",
                 border: "1px solid rgba(255,153,0,0.3)",
                 borderRadius: "12px"
               }}>
                 <h3 style={{ fontSize: "20px", color: "#F9FAFB", fontWeight: 700, marginBottom: "12px" }}>
                   {t("pastExamPaidLockTitle")}
                 </h3>
                 <p style={{ fontSize: "14px", color: "#D1D5DB", marginBottom: "20px", lineHeight: 1.6 }}>
                   {t("pastExamPaidLockDesc")}
                 </p>
                 <button
                   disabled
                   style={{
                     padding: "12px 24px",
                     background: "#4B5563",
                     color: "#9CA3AF",
                     border: "none",
                     borderRadius: "8px",
                     fontSize: "14px",
                     fontWeight: 700,
                     cursor: "not-allowed",
                     opacity: 0.7
                   }}
                 >{t("btnComingSoon")}</button>
               </div>
             ) : pastExamLoading ? (
               /* 로딩 스피너 */
               <div style={{
                 padding: "80px 20px",
                 textAlign: "center",
                 color: "#9CA3AF"
               }}>
                 <div style={{
                   display: "inline-block",
                   width: "32px",
                   height: "32px",
                   border: "3px solid #2A344A",
                   borderTopColor: "#FF9900",
                   borderRadius: "50%",
                   animation: "spin 0.8s linear infinite",
                   marginBottom: "12px"
                 }} />
                 <div style={{ fontSize: "13px" }}>{t("pastExamLoading")}</div>
               </div>
             ) : pastExamError ? (
               <div style={{
                 padding: "20px",
                 background: "rgba(239,68,68,0.1)",
                 border: "1px solid rgba(239,68,68,0.3)",
                 borderRadius: "8px",
                 color: "#fca5a5",
                 fontSize: "13px"
               }}>{pastExamError}</div>
             ) : (
               /* 문제 리스트 (10개) */
               <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                 {currentProblems.map((p: any) => {
                   const isRevealed = revealedAnswers.has(p.id);
                   return (
                     <div key={p.id} style={{
                       background: "#151E32",
                       border: "1px solid #2A344A",
                       borderRadius: "10px",
                       padding: "20px"
                     }}>
                       {/* 문제 헤더 */}
                       <div style={{
                         display: "flex",
                         justifyContent: "space-between",
                         alignItems: "center",
                         marginBottom: "12px"
                       }}>
                         <span style={{
                           fontSize: "12px",
                           color: "#FF9900",
                           fontWeight: 700,
                           fontFamily: "ui-monospace, monospace"
                         }}>Q{p.order}</span>
                       </div>

                       {/* 질문 */}
                       <p style={{
                         fontSize: "14px",
                         color: "#F9FAFB",
                         lineHeight: 1.6,
                         marginBottom: "16px"
                       }}>{p.question}</p>

                       {/* 선택지 A/B/C/D */}
                       <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
                         {(["A", "B", "C", "D"] as const).map(opt => {
                           const isCorrect = isRevealed && p.answer === opt;
                           return (
                             <div key={opt} style={{
                               padding: "10px 14px",
                               background: isCorrect ? "rgba(16,185,129,0.12)" : "rgba(255,255,255,0.03)",
                               border: `1px solid ${isCorrect ? "rgba(16,185,129,0.4)" : "#2A344A"}`,
                               borderRadius: "6px",
                               fontSize: "13px",
                               color: isCorrect ? "#4ade80" : "#D1D5DB",
                               display: "flex",
                               gap: "10px"
                             }}>
                               <strong style={{ minWidth: "20px" }}>{opt}.</strong>
                               <span>{p.options?.[opt]}</span>
                             </div>
                           );
                         })}
                       </div>

                       {/* 답 보기 버튼 */}
                       <button
                         onClick={() => toggleAnswer(p.id)}
                         style={{
                           padding: "8px 16px",
                           background: isRevealed ? "rgba(255,255,255,0.05)" : "rgba(255,153,0,0.15)",
                           border: `1px solid ${isRevealed ? "#2A344A" : "rgba(255,153,0,0.4)"}`,
                           borderRadius: "6px",
                           color: isRevealed ? "#9CA3AF" : "#FF9900",
                           fontSize: "13px",
                           fontWeight: 600,
                           cursor: "pointer",
                           fontFamily: "inherit"
                         }}
                       >{isRevealed ? t("pastExamHideAnswer") : t("pastExamRevealAnswer")}</button>

                       {/* 해설 (답 본 후) */}
                       {isRevealed && (
                         <div style={{
                           marginTop: "16px",
                           padding: "14px",
                           background: "#0F1629",
                           border: "1px solid #2A344A",
                           borderRadius: "6px"
                         }}>
                           <div style={{ fontSize: "12px", color: "#4ade80", fontWeight: 700, marginBottom: "8px" }}>
                             {t("pastExamCorrectAnswer")}: {p.answer}
                           </div>
                           {p.explanation?.correct && (
                             <div style={{ marginBottom: "8px" }}>
                               <strong style={{ fontSize: "11px", color: "#9CA3AF" }}>{t("pastExamExplanationCorrect")}</strong>
                               <p style={{ fontSize: "13px", color: "#D1D5DB", lineHeight: 1.6, marginTop: "4px" }}>
                                 {p.explanation.correct}
                               </p>
                             </div>
                           )}
                           {p.keywords && p.keywords.length > 0 && (
                             <div style={{ marginTop: "10px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
                               {p.keywords.map((kw: string, i: number) => (
                                 <span key={i} style={{
                                   fontSize: "11px",
                                   padding: "3px 8px",
                                   background: "rgba(255,153,0,0.15)",
                                   color: "#FF9900",
                                   borderRadius: "4px",
                                   fontWeight: 600
                                 }}>{kw}</span>
                               ))}
                             </div>
                           )}
                         </div>
                       )}
                     </div>
                   );
                 })}
               </div>
             )}
           </>
         )}

       </div>
     </div>
   );
 })()}

 {/* Console Tab - CLI 실습 (ConsoleChallenge) */}
 {tab === "console" && (
   <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", height: "100%", padding: "20px", overflowY: "auto" }}>
     <div style={{ display: "flex", flexDirection: "column", maxWidth: "900px", width: "100%", gap: "16px" }}>
     {/* Challenge Selector */}
     <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
       {(['sec', 'res', 'perf', 'cost'] as const).map((type) => {
         const colors: Record<string, string> = { sec: '#f85149', res: '#58a6ff', perf: '#3fb950', cost: '#e3b341' };
         const labels: Record<string, string> = { sec: 'SEC', res: 'RES', perf: 'PERF', cost: 'COST' };
         return (
           <button
             key={type}
             onClick={() => {
               setScenarioType(type);
               setSelectedScenario(1);
             }}
             style={{
               padding: "8px 16px",
               background: scenarioType === type ? colors[type] : "#2a344a",
               color: scenarioType === type ? "#000" : "#e6edf3",
               border: `2px solid ${colors[type]}`,
               borderRadius: "6px",
               cursor: "pointer",
               fontWeight: 700,
               fontSize: "13px",
               transition: "all 0.2s"
             }}
           >
             {labels[type]}
           </button>
         );
       })}
     </div>

     {/* Challenge Content */}
     {scenarioType && selectedScenario && (() => {
       const challenges = getChallengesForLocale(scenarioType, locale);
       const scenario = challenges?.[selectedScenario];
       if (!scenario) return <div style={{ color: "#8b949e" }}>로드 중...</div>;

       const currentStep = scenario.steps?.[scenarioStepIdx];
       const isScenarioComplete = scenarioStepIdx >= (scenario.steps?.length || 0);

       // Get answer data for current step
       const getScenarioAnswers = () => {
         const answerMap = {
           sec: SEC_ANSWERS,
           res: RES_ANSWERS,
           perf: PERF_ANSWERS,
           cost: COST_ANSWERS,
         };
         const answers = answerMap[scenarioType];
         return answers?.[selectedScenario]?.answers?.[scenarioStepIdx] || [];
       };

       const stepAnswers = getScenarioAnswers();

       const handleScenarioSubmit = () => {
         if (!consoleInput.trim() || !currentStep) return;

         const isCorrect = isAnswerCorrect(consoleInput, stepAnswers);

         setConsoleHistory(prev => [
           ...prev,
           { type: 'cmd', text: consoleInput, isCorrect }
         ]);

         if (isCorrect) {
           setScenarioSubmitFeedback(t("cliLabSuccessMsg"));
           setConsoleHistory(prev => [
             ...prev,
             { type: 'output', text: t("cliLabSuccessMsg") }
           ]);

           // Auto-move to next step
           setTimeout(() => {
             setConsoleInput('');
             setScenarioAttempts(0);
             setShowScenarioAnswer(false);
             setScenarioSubmitFeedback(null);

             if (!isScenarioComplete) {
               setScenarioStepIdx(prev => prev + 1);
             }
           }, 1500);
         } else {
           setScenarioSubmitFeedback(t("cliLabErrorMsg"));
           setConsoleHistory(prev => [
             ...prev,
             { type: 'error', text: t("cliLabErrorMsg") }
           ]);
           setScenarioAttempts(prev => prev + 1);
         }
       };

       return (
         <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "16px" }}>
           {/* Title & Scenario */}
           <div style={{ background: "#161b22", padding: "16px", borderRadius: "8px", border: "1px solid #30363d" }}>
             <h3 style={{ marginTop: 0, color: "#f0f6fc", fontSize: "16px", marginBottom: "8px" }}>
               {scenarioType.toUpperCase()}-{String(selectedScenario).padStart(2, '0')}: {scenario.title}
             </h3>
             <p style={{ color: "#c9d1d9", fontSize: "13px", lineHeight: "1.6", margin: 0 }}>
               {scenario.scenario}
             </p>
           </div>

           {/* Steps & Console */}
           <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "12px", minHeight: 0 }}>
             {/* Step Info */}
             {!isScenarioComplete ? (
               <div style={{ background: "#1A253D", padding: "12px", borderRadius: "8px", border: "1px solid #2A344A" }}>
                 <p style={{ color: "#58a6ff", fontSize: "12px", fontWeight: 600, margin: "0 0 8px 0" }}>
                   {t("cliLabStepLabel")} {scenarioStepIdx + 1} / {scenario.steps?.length || 0}: {currentStep?.title || ""}
                 </p>
                 <p style={{ color: "#D1D5DB", fontSize: "12px", margin: 0 }}>
                   {currentStep?.desc || ""}
                 </p>
               </div>
             ) : (
               <div style={{ background: "#1a3d2c", padding: "12px", borderRadius: "8px", border: "1px solid #2a5a47" }}>
                 <p style={{ color: "#3fb950", fontSize: "12px", fontWeight: 600, margin: 0 }}>
                   {t("cliLabCompleteMsg")}
                 </p>
               </div>
             )}

             {/* Console Output */}
             <div style={{
               flex: 1,
               background: "#0d1117",
               border: "1px solid #30363d",
               borderRadius: "8px",
               padding: "12px",
               fontFamily: "monospace",
               fontSize: "12px",
               color: "#e6edf3",
               overflowY: "auto",
               minHeight: "150px"
             }}>
               {consoleHistory.length === 0 ? (
                 <div style={{ color: "#8b949e" }}>{t("cliLabInputHint")}</div>
               ) : (
                 consoleHistory.map((line, idx) => (
                   <div key={idx} style={{
                     color: line.type === 'cmd' ? (line.isCorrect ? '#3fb950' : '#f85149') : line.type === 'output' ? '#3fb950' : line.type === 'error' ? '#f85149' : '#8b949e',
                     marginBottom: '4px'
                   }}>
                     {line.type === 'cmd' ? '$ ' : ''}{line.text}
                   </div>
                 ))
               )}
             </div>

             {/* Input Area */}
             {!isScenarioComplete && currentStep && (
               <div style={{ display: "flex", gap: "8px", flexDirection: "column" }}>
                 <input
                   type="text"
                   placeholder={t("cliLabInputPlaceholder")}
                   value={consoleInput}
                   onChange={(e) => setConsoleInput(e.target.value)}
                   onKeyDown={(e) => {
                     if (e.key === "Enter" && consoleInput.trim()) {
                       handleScenarioSubmit();
                     }
                   }}
                   style={{
                     padding: "10px 12px",
                     background: "#161b22",
                     border: "1px solid #30363d",
                     borderRadius: "6px",
                     color: "#e6edf3",
                     fontSize: "12px"
                   }}
                 />

                 {/* Feedback Message */}
                 {scenarioSubmitFeedback && (
                   <div style={{
                     padding: "8px 12px",
                     borderRadius: "6px",
                     fontSize: "12px",
                     fontWeight: 600,
                     background: scenarioSubmitFeedback.includes(t("cliLabSuccessMsg").substring(2)) ? 'rgba(63,185,80,0.2)' : 'rgba(248,81,73,0.2)',
                     color: scenarioSubmitFeedback.includes(t("cliLabSuccessMsg").substring(2)) ? '#3fb950' : '#f85149',
                     border: `1px solid ${scenarioSubmitFeedback.includes(t("cliLabSuccessMsg").substring(2)) ? '#3fb950' : '#f85149'}`
                   }}>
                     {scenarioSubmitFeedback}
                   </div>
                 )}

                 {/* Buttons */}
                 <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                   <button
                     onClick={handleScenarioSubmit}
                     disabled={!consoleInput.trim() || (userStatus !== "paid" && !isAdmin)}
                     style={{
                       padding: "10px 16px",
                       background: consoleInput.trim() && (userStatus === "paid" || isAdmin) ? "#3fb950" : "#1a3a2a",
                       color: consoleInput.trim() && (userStatus === "paid" || isAdmin) ? "#000" : "#666",
                       border: "none",
                       borderRadius: "6px",
                       cursor: consoleInput.trim() && (userStatus === "paid" || isAdmin) ? "pointer" : "not-allowed",
                       fontSize: "12px",
                       fontWeight: 600,
                       opacity: consoleInput.trim() && (userStatus === "paid" || isAdmin) ? 1 : 0.5
                     }}
                   >
                     {t("cliLabSubmitBtn")}
                   </button>

                   <button
                     onClick={() => setShowScenarioAnswer(!showScenarioAnswer)}
                     disabled={userStatus !== "paid" && !isAdmin}
                     style={{
                       padding: "10px 16px",
                       background: (userStatus === "paid" || isAdmin) ? (showScenarioAnswer ? "#ff9900" : "#2a344a") : "#1a3a2a",
                       color: (userStatus === "paid" || isAdmin) ? (showScenarioAnswer ? "#000" : "#e6edf3") : "#666",
                       border: (userStatus === "paid" || isAdmin) ? "1px solid #ff9900" : "1px solid #444",
                       borderRadius: "6px",
                       cursor: (userStatus === "paid" || isAdmin) ? "pointer" : "not-allowed",
                       fontSize: "12px",
                       fontWeight: 600,
                       opacity: (userStatus === "paid" || isAdmin) ? 1 : 0.5
                     }}
                   >
                     {showScenarioAnswer ? t("cliLabHideAnswerBtn") : t("cliLabShowAnswerBtn")}
                   </button>
                 </div>

                 {showScenarioAnswer && stepAnswers.length > 0 && (
                   <div style={{
                     background: "#1a253d",
                     border: "1px solid #ff9900",
                     borderRadius: "6px",
                     padding: "10px 12px",
                     fontSize: "12px",
                     color: "#e6edf3"
                   }}>
                     <div style={{ color: "#ff9900", fontWeight: 600, marginBottom: "8px" }}>{t("cliLabAnswerLabel")}</div>
                     {stepAnswers.map((answer, idx) => (
                       <div key={idx} style={{ color: "#58a6ff", marginBottom: idx < stepAnswers.length - 1 ? "6px" : 0 }}>
                         $ {answer}
                       </div>
                     ))}
                   </div>
                 )}
               </div>
             )}
           </div>

           {/* Explanation */}
           {isScenarioComplete && (
             <div style={{ background: "#161b22", padding: "12px", borderRadius: "8px", border: "1px solid #30363d" }}>
               <p style={{ color: "#c9d1d9", fontSize: "12px", lineHeight: "1.6", margin: 0 }}>
                 {scenario.explanation}
               </p>
             </div>
           )}

           {/* Navigation */}
           <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
             {Array.from({ length: 30 }).map((_, i) => (
               <button
                 key={i + 1}
                 onClick={() => {
                   setSelectedScenario(i + 1);
                   setScenarioStepIdx(0);
                   setConsoleInput('');
                   setConsoleHistory([]);
                   setScenarioAttempts(0);
                   setShowScenarioAnswer(false);
                   setScenarioSubmitFeedback(null);
                 }}
                 style={{
                   padding: "6px 10px",
                   background: selectedScenario === i + 1 ? "#ff9900" : "#2a344a",
                   color: selectedScenario === i + 1 ? "#000" : "#D1D5DB",
                   border: "1px solid #30363d",
                   borderRadius: "4px",
                   cursor: "pointer",
                   fontSize: "11px",
                   fontWeight: selectedScenario === i + 1 ? 600 : 500
                 }}
               >
                 {i + 1}
               </button>
             ))}
           </div>
         </div>
       );
     })()}

     {!scenarioType && (
       <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#8b949e" }}>
         {t("cliLabSelectTypeMsg")}
       </div>
     )}
     </div>
   </div>
 )}

 {tab === "concept" && (
 <div className="concept-panel">
 {concept && selectedNode ? (
 <>
 <div className="concept-header">
 <span className="concept-emoji">{selectedNode.emoji}</span>
 <h2>{concept.title}</h2>
 <p className="concept-subtitle">{concept.subtitle}</p>
 </div>
 <div className="concept-section">
 <h3>{t("sectionEasy")}</h3>
 <p className="easy-text">{conceptTranslating ? t("conceptTranslating") : concept.easy}</p>
 </div>
 <div className="concept-section">
 <h3>{t("sectionPoints")}</h3>
 {concept.points.map((pt, i) => (
 <div key={i} className="point-card">
 <h4>{pt.label}</h4>
 <p className="point-text">{pt.text}</p>
 <p className="point-easy">{pt.easy}</p>
 </div>
 ))}
 </div>
 {/* Related services */}
 <div className="concept-section">
 <h3>{t("sectionRelated")}</h3>
 <div className="related-grid">
 {LINKS.filter(l => l.s === selected || l.t === selected).map((l, i) => {
 const rid = l.s === selected ? l.t : l.s;
 const rn = NODES.find(n => n.id === rid);
 return rn ? (
 <button key={i} className="related-btn" onClick={() => { setSelected(rid); }}>
 {rn.emoji} {rn.name}
 </button>
 ) : null;
 })}
 </div>
 </div>
 </>
 ) : (
 <div className="empty-state">{t("emptyConceptHint")}</div>
 )}
 </div>
 )}

 {tab === "mockExam" && (
 <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "20px", height: "100%", overflowY: "auto" }}>
 {userStatus === "paid" || isAdmin ? (
 mockExamRunning ? (
 // 모의시험 진행 중
 <div style={{
 display: "flex",
 flexDirection: "column",
 gap: "12px"
 }}>
 <div style={{
 background: "rgba(59, 130, 246, 0.1)",
 padding: "16px",
 borderRadius: "8px",
 border: "1px solid rgba(59, 130, 246, 0.3)"
 }}>
 <div style={{ fontSize: "13px", color: "#D1D5DB", marginBottom: "8px" }}>진행 상황</div>
 <div style={{ fontSize: "24px", color: "var(--accent)", fontWeight: "bold", marginBottom: "8px" }}>
 {mockExamCurrentIndex + 1} / {mockExamProblems.length}
 </div>
 <div style={{
 width: "100%",
 height: "6px",
 background: "rgba(100, 116, 139, 0.3)",
 borderRadius: "3px",
 overflow: "hidden"
 }}>
 <div style={{
 width: `${((mockExamCurrentIndex + 1) / mockExamProblems.length) * 100}%`,
 height: "100%",
 background: "rgba(59, 130, 246, 0.6)",
 transition: "width 0.3s"
 }} />
 </div>
 </div>

 <div style={{
 background: "rgba(249, 115, 22, 0.1)",
 padding: "16px",
 borderRadius: "8px",
 border: "1px solid rgba(249, 115, 22, 0.3)",
 textAlign: "center"
 }}>
 <div style={{ fontSize: "13px", color: "#D1D5DB", marginBottom: "8px" }}>남은 시간</div>
 <div style={{
 fontSize: "28px",
 color: mockExamTimeRemaining < 300 ? "#ef4444" : "#f59e0b",
 fontWeight: "bold"
 }}>
 {Math.floor(mockExamTimeRemaining / 60)}:{String(mockExamTimeRemaining % 60).padStart(2, '0')}
 </div>
 </div>
 </div>
 ) : mockExamResults ? (
 // 결과 화면
 <>
 <div style={{
 textAlign: "center",
 padding: "20px",
 background: mockExamResults.passed ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
 border: `1px solid ${mockExamResults.passed ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
 borderRadius: "8px"
 }}>
 <h2 style={{
 fontSize: "36px",
 color: mockExamResults.passed ? "#10b981" : "#ef4444",
 margin: "0 0 8px 0"
 }}>
 {mockExamResults.totalScore}
 </h2>
 <p style={{
 color: "#D1D5DB",
 margin: "0",
 fontSize: "14px"
 }}>
 {mockExamResults.passed ? t("mockExamPass") : t("mockExamRetry")}
 </p>
 </div>

 <div style={{
 display: "grid",
 gridTemplateColumns: "1fr 1fr",
 gap: "12px"
 }}>
 <div style={{
 background: "rgba(59, 130, 246, 0.1)",
 border: "1px solid rgba(59, 130, 246, 0.3)",
 borderRadius: "8px",
 padding: "16px",
 textAlign: "center"
 }}>
 <div style={{ fontSize: "20px", color: "#10b981", fontWeight: "bold" }}>
 {mockExamResults.correct}/{mockExamProblems.length}
 </div>
 </div>
 <div style={{
 background: "rgba(239, 68, 68, 0.1)",
 border: "1px solid rgba(239, 68, 68, 0.3)",
 borderRadius: "8px",
 padding: "16px",
 textAlign: "center"
 }}>
 <div style={{ fontSize: "20px", color: "#ef4444", fontWeight: "bold" }}>
 {mockExamResults.wrong}/{mockExamProblems.length}
 </div>
 </div>
 </div>

 <div style={{
 background: "rgba(100, 116, 139, 0.2)",
 border: "1px solid rgba(100, 116, 139, 0.3)",
 borderRadius: "8px",
 padding: "16px",
 display: "grid",
 gridTemplateColumns: "1fr 1fr",
 gap: "12px"
 }}>
 <div style={{ textAlign: "center" }}>
 <div style={{ fontSize: "18px", color: "var(--accent)", fontWeight: "bold" }}>
 {mockExamResults.correctRate}%
 </div>
 </div>
 <div style={{ textAlign: "center" }}>
 <div style={{ fontSize: "18px", color: "var(--accent)", fontWeight: "bold" }}>
 {Math.floor(mockExamResults.timeSpent / 60)}분
 </div>
 </div>
 </div>

 {/* PDF 다운로드 */}
 {(() => {
 const pdfExpiresAt = mockExamPdfCreatedAt ? mockExamPdfCreatedAt + 24 * 60 * 60 * 1000 : null;
 const now = Date.now();
 const isPdfExpired: boolean = !!(pdfExpiresAt && now > pdfExpiresAt);
 const hoursRemaining = pdfExpiresAt ? Math.floor((pdfExpiresAt - now) / (60 * 60 * 1000)) : 0;

 return (
 <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
 <button
 onClick={() => {
 if (!mockExamResults) return;

 // mockExamProblems가 없으면 localStorage에서 복구
 let problems = mockExamProblems;
 if (!problems || problems.length === 0) {
   const savedProblems = localStorage.getItem("mockExamProblems");
   if (savedProblems) {
     try {
       problems = JSON.parse(savedProblems);
     } catch (e) {
       console.error('Failed to parse mock exam problems:', e);
       alert(locale === 'en' ? 'Failed to load problems. Please try again.' : locale === 'ja' ? '問題の読み込みに失敗しました。もう一度お試しください。' : '문제 불러오기에 실패했습니다. 다시 시도해주세요.');
       return;
     }
   } else {
     alert(locale === 'en' ? 'No problems found. Please take the mock exam again.' : locale === 'ja' ? '問題が見つかりません。もう一度模擬試験を受けてください。' : '문제를 찾을 수 없습니다. 모의시험을 다시 진행해주세요.');
     return;
   }
 }

 // 화면 밖에 element 추가 (html2pdf가 layout을 계산하려면 DOM에 있어야 함)
 const element = document.createElement("div");
 element.style.cssText = 'position: absolute; left: -9999px; top: 0; width: 190mm; background: #fff; color: #000; font-family: "Malgun Gothic", "NanumGothic", "Apple SD Gothic Neo", "Hiragino Sans", "Yu Gothic", "Meiryo", Arial, sans-serif;';

 // PDF 번역 문자열 준비
 const pdfLabels = {
 options: t("pdfOptions"),
 goal: t("pdfGoal"),
 answer: t("pdfAnswer"),
 explanation: t("pdfExplanation"),
 trap: t("pdfTrap"),
 keywords: t("pdfKeywords"),
 easyMode: t("pdfEasyMode"),
 optionExplanations: t("pdfOptionExplanations"),
 userAnswer: t("pdfUserAnswer"),
 correct: t("quizCorrect"),
 incorrect: t("quizIncorrect"),
 };

 // 문제별 분석 HTML 생성
 const problemsHTML = problems.map((problem, idx) => {
 const userAnswer = mockExamAnswers[idx];
 const isCorrect = userAnswer === problem.answer;
 return `
 <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 8px; page-break-inside: avoid;">
 <h3 style="margin: 0 0 10px 0; color: #333;">Q${idx + 1}. ${problem.question}</h3>

 <!-- 보기 -->
 <div style="margin: 10px 0; padding: 8px; background: #f5f5f5; border-radius: 4px; page-break-inside: avoid; font-size: 13px; line-height: 1.6;">
 <strong>${pdfLabels.options}:</strong><br/>
 <div style="margin-left: 10px;">
 <div style="margin: 3px 0;">A) ${problem.options.A}</div>
 <div style="margin: 3px 0;">B) ${problem.options.B}</div>
 <div style="margin: 3px 0;">C) ${problem.options.C}</div>
 <div style="margin: 3px 0;">D) ${problem.options.D}</div>
 </div>
 </div>

 <!-- 정답/오답 표시 -->
 <div style="margin: 10px 0; padding: 8px; background: ${isCorrect ? '#e8f5e9' : '#ffebee'}; border-radius: 4px;">
 <strong style="color: ${isCorrect ? '#2e7d32' : '#c62828'};">
 ${isCorrect ? pdfLabels.correct : pdfLabels.incorrect}
 </strong>
 ${userAnswer ? `<br/>${pdfLabels.userAnswer}: <strong>${userAnswer}</strong>` : ''}
 </div>

 <!-- 핵심 목표 -->
 ${problem.goal ? `
 <div style="margin: 8px 0; padding: 6px; background: #f3e5f5; border-radius: 4px; page-break-inside: avoid; font-size: 13px; line-height: 1.5;">
 <strong>${pdfLabels.goal}</strong><br/>
 ${problem.goal}
 </div>
 ` : ''}

 <!-- 정답과 설명 -->
 <div style="margin: 8px 0; page-break-inside: avoid;">
 <strong>${pdfLabels.answer} ${problem.answer}</strong><br/>
 <strong style="font-size: 13px;">${pdfLabels.explanation}:</strong>
 <p style="margin: 4px 0; padding: 6px; background: #e3f2fd; border-radius: 4px; font-size: 13px; line-height: 1.5;">${problem.explanation.correct}</p>
 </div>

 <!-- 함정 설명 -->
 ${userAnswer && userAnswer !== problem.answer && (problem.explanation as any)[`trap_${userAnswer}`] ? `
 <div style="margin: 8px 0; padding: 6px; background: #fff3e0; border-radius: 4px; page-break-inside: avoid; font-size: 13px; line-height: 1.5;">
 <strong>${pdfLabels.trap}</strong> ${(problem.explanation as any)[`trap_${userAnswer}`]}
 </div>
 ` : ''}

 <!-- 핵심 키워드 -->
 ${problem.keywords && problem.keywords.length > 0 ? `
 <div style="margin: 8px 0; page-break-inside: avoid; font-size: 13px;">
 <strong>${pdfLabels.keywords}</strong><br/>
 ${problem.keywords.map(kw => `<span style="display: inline-block; margin: 2px 4px 2px 0; padding: 3px 6px; background: #bbdefb; border-radius: 12px; font-size: 12px;"><strong>${kw}</strong></span>`).join('')}
 </div>
 ` : ''}

 <!-- 쉽게설명 -->
 ${problem.easyMode ? `
 <div style="margin: 8px 0; padding: 8px; background: #fff9c4; border-radius: 4px; page-break-inside: avoid; font-size: 13px; line-height: 1.5;">
 <strong style="color: #f57f17;">${pdfLabels.easyMode}</strong><br/>
 <p style="margin: 4px 0;">${problem.easyMode.explanation}</p>
 <strong style="font-size: 12px;">${pdfLabels.optionExplanations}:</strong>
 <div style="margin-left: 10px; font-size: 12px;">
 <div style="margin: 2px 0;"><strong style="color: ${problem.answer === 'A' ? '#4caf50' : '#666'};">A.</strong> ${problem.easyMode.A}</div>
 <div style="margin: 2px 0;"><strong style="color: ${problem.answer === 'B' ? '#4caf50' : '#666'};">B.</strong> ${problem.easyMode.B}</div>
 <div style="margin: 2px 0;"><strong style="color: ${problem.answer === 'C' ? '#4caf50' : '#666'};">C.</strong> ${problem.easyMode.C}</div>
 <div style="margin: 2px 0;"><strong style="color: ${problem.answer === 'D' ? '#4caf50' : '#666'};">D.</strong> ${problem.easyMode.D}</div>
 </div>
 </div>
 ` : ''}
 </div>
 `;
 }).join('');

 // PDF 헤더용 번역 문자열
 const pdfHeaderLabels = {
 title: t("pdfMockExamResults"),
 status: t("pdfStatus"),
 correct: t("pdfCorrect"),
 wrong: t("pdfWrong"),
 correctRate: t("pdfCorrectRate"),
 timeSpent: t("pdfTimeTaken"),
 minutes: t("pdfMinutes"),
 seconds: t("pdfSeconds"),
 pass: t("mockExamPass"),
 retry: t("mockExamRetry"),
 analysis: t("pdfDetailedAnalysis"),
 };

 element.innerHTML = `
 <div style="padding: 20px; color: #000; background: #fff; font-family: Arial, sans-serif;">
 <h1 style="text-align: center; margin-bottom: 20px;">SAA-C03 ${pdfHeaderLabels.title}</h1>
 <div style="margin-bottom: 20px; padding: 15px; background: #f0f0f0; border-radius: 8px;">
 <h2 style="font-size: 32px; text-align: center; margin: 10px 0;">${t("pdfTotalScore")}: ${mockExamResults.totalScore}</h2>
 <p style="text-align: center; font-size: 16px; margin: 10px 0;">${pdfHeaderLabels.status}: ${mockExamResults.passed ? pdfHeaderLabels.pass : pdfHeaderLabels.retry}</p>
 <div style="text-align: center; font-size: 14px; line-height: 1.8;">
 <p><strong>${pdfHeaderLabels.correct}: ${mockExamResults.correct}/${mockExamProblems.length}</strong></p>
 <p><strong>${pdfHeaderLabels.wrong}: ${mockExamResults.wrong}/${mockExamProblems.length}</strong></p>
 <p><strong>${pdfHeaderLabels.correctRate}: ${mockExamResults.correctRate}%</strong></p>
 <p><strong>${pdfHeaderLabels.timeSpent}: ${Math.floor(mockExamResults.timeSpent / 60)}${pdfHeaderLabels.minutes} ${mockExamResults.timeSpent % 60}${pdfHeaderLabels.seconds}</strong></p>
 </div>
 </div>

 <h2 style="margin-top: 30px; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px;">${pdfHeaderLabels.analysis}</h2>
 ${problemsHTML}
 </div>
 `;

 const options = {
 margin: 10,
 filename: 'SAA-C03_mock_exam_results.pdf',
 image: { type: 'jpeg', quality: 0.98 },
 html2canvas: { scale: 2, useCORS: true, logging: false },
 jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' },
 pagebreak: { mode: ['css', 'legacy'] }
 };

 // DOM에 추가 후 PDF 생성, 완료 후 제거
 document.body.appendChild(element);
 (html2pdf() as any).set(options).from(element).save().then(() => {
 if (element.parentNode) document.body.removeChild(element);
 }).catch((err: any) => {
 console.error('PDF generation failed:', err);
 if (element.parentNode) document.body.removeChild(element);
 });
 const now = Date.now();
 setMockExamPdfCreatedAt(now);
 localStorage.setItem("mockExamPdfCreatedAt", now.toString());
 }}
 disabled={isPdfExpired}
 style={{
 padding: "12px 16px",
 background: isPdfExpired ? "rgba(100, 116, 139, 0.5)" : "rgba(59, 130, 246, 0.3)",
 border: `1px solid ${isPdfExpired ? "rgba(100, 116, 139, 0.3)" : "rgba(59, 130, 246, 0.6)"}`,
 borderRadius: "6px",
 color: isPdfExpired ? "#64748b" : "var(--accent)",
 cursor: isPdfExpired ? "not-allowed" : "pointer",
 fontSize: "14px",
 fontWeight: "500"
 }}
 >
 {isPdfExpired ? t("mockExamPdfExpired") : t("mockExamPdfDownload")}
 </button>

 {mockExamPdfCreatedAt && !isPdfExpired && (
 <div style={{
 background: "rgba(59, 130, 246, 0.1)",
 border: "1px solid rgba(59, 130, 246, 0.3)",
 borderRadius: "6px",
 padding: "8px 12px",
 fontSize: "12px",
 color: "var(--accent)",
 textAlign: "center"
 }}>
 {t("mockExamPdfInfo")} ({hoursRemaining}시간 남음)
 </div>
 )}
 </div>
 );
 })()}
 </>
 ) : mockExamAlreadyTaken ? (
 // 오늘 이미 본 경우 - PDF가 있으면 보여주기
 mockExamPdfCreatedAt ? (
 (() => {
 const pdfExpiresAt = mockExamPdfCreatedAt + 24 * 60 * 60 * 1000;
 const now = Date.now();
 const isPdfExpired = now > pdfExpiresAt;
 const hoursRemaining = Math.floor((pdfExpiresAt - now) / (60 * 60 * 1000));

 return (
 <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
 <button
 onClick={() => {
 if (!mockExamResults) return;

 // mockExamProblems가 없으면 localStorage에서 복구
 let problems = mockExamProblems;
 if (!problems || problems.length === 0) {
   const savedProblems = localStorage.getItem("mockExamProblems");
   if (savedProblems) {
     try {
       problems = JSON.parse(savedProblems);
     } catch (e) {
       console.error('Failed to parse mock exam problems:', e);
       alert(locale === 'en' ? 'Failed to load problems. Please try again.' : locale === 'ja' ? '問題の読み込みに失敗しました。もう一度お試しください。' : '문제 불러오기에 실패했습니다. 다시 시도해주세요.');
       return;
     }
   } else {
     alert(locale === 'en' ? 'No problems found. Please take the mock exam again.' : locale === 'ja' ? '問題が見つかりません。もう一度模擬試験を受けてください。' : '문제를 찾을 수 없습니다. 모의시험을 다시 진행해주세요.');
     return;
   }
 }

 // 화면 밖에 element 추가 (html2pdf가 layout을 계산하려면 DOM에 있어야 함)
 const element = document.createElement("div");
 element.style.cssText = 'position: absolute; left: -9999px; top: 0; width: 190mm; background: #fff; color: #000; font-family: "Malgun Gothic", "NanumGothic", "Apple SD Gothic Neo", "Hiragino Sans", "Yu Gothic", "Meiryo", Arial, sans-serif;';

 // PDF 번역 문자열 준비
 const pdfLabels = {
 options: t("pdfOptions"),
 goal: t("pdfGoal"),
 answer: t("pdfAnswer"),
 explanation: t("pdfExplanation"),
 trap: t("pdfTrap"),
 keywords: t("pdfKeywords"),
 easyMode: t("pdfEasyMode"),
 optionExplanations: t("pdfOptionExplanations"),
 userAnswer: t("pdfUserAnswer"),
 correct: t("quizCorrect"),
 incorrect: t("quizIncorrect"),
 };

 // 문제별 분석 HTML 생성
 const problemsHTML = problems.map((problem, idx) => {
 const userAnswer = mockExamAnswers[idx];
 const isCorrect = userAnswer === problem.answer;
 return `
 <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 8px; page-break-inside: avoid;">
 <h3 style="margin: 0 0 10px 0; color: #333;">Q${idx + 1}. ${problem.question}</h3>

 <!-- 보기 -->
 <div style="margin: 10px 0; padding: 8px; background: #f5f5f5; border-radius: 4px; font-size: 13px; line-height: 1.6;">
 <strong>${pdfLabels.options}:</strong><br/>
 <div style="margin-left: 10px;">
 <div style="margin: 3px 0;">A) ${problem.options.A}</div>
 <div style="margin: 3px 0;">B) ${problem.options.B}</div>
 <div style="margin: 3px 0;">C) ${problem.options.C}</div>
 <div style="margin: 3px 0;">D) ${problem.options.D}</div>
 </div>
 </div>

 <!-- 정답/오답 표시 -->
 <div style="margin: 10px 0; padding: 8px; background: ${isCorrect ? '#e8f5e9' : '#ffebee'}; border-radius: 4px;">
 <strong style="color: ${isCorrect ? '#2e7d32' : '#c62828'};">
 ${isCorrect ? pdfLabels.correct : pdfLabels.incorrect}
 </strong>
 ${userAnswer ? `<br/>${pdfLabels.userAnswer}: <strong>${userAnswer}</strong>` : ''}
 </div>

 <!-- 정답과 설명 -->
 <div style="margin: 8px 0;">
 <strong>${pdfLabels.answer} ${problem.answer}</strong><br/>
 <strong style="font-size: 13px;">${pdfLabels.explanation}:</strong>
 <p style="margin: 4px 0; padding: 6px; background: #e3f2fd; border-radius: 4px; font-size: 13px; line-height: 1.5;">${problem.explanation.correct}</p>
 </div>
 </div>
 `;
 }).join('');

 // PDF 헤더용 번역 문자열
 const pdfHeaderLabels = {
 title: t("pdfMockExamResults"),
 analysis: t("pdfDetailedAnalysis"),
 status: t("pdfStatus"),
 pass: t("mockExamPass"),
 retry: t("mockExamRetry"),
 };

 element.innerHTML = `
 <div style="padding: 20px; color: #000; background: #fff; font-family: Arial, sans-serif;">
 <h1 style="text-align: center; margin-bottom: 20px;">SAA-C03 ${pdfHeaderLabels.title}</h1>
 <div style="margin-bottom: 20px; padding: 15px; background: #f0f0f0; border-radius: 8px;">
 <h2 style="font-size: 32px; text-align: center; margin: 10px 0;">${t("pdfTotalScore")}: ${(mockExamResults as any)?.totalScore || 0}</h2>
 <p style="text-align: center; font-size: 16px; margin: 10px 0;">${pdfHeaderLabels.status}: ${(mockExamResults as any)?.passed ? pdfHeaderLabels.pass : pdfHeaderLabels.retry}</p>
 </div>

 <h2 style="margin-top: 30px; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px;">${pdfHeaderLabels.analysis}</h2>
 ${problemsHTML}
 </div>
 `;

 const options = {
 margin: 10,
 filename: 'SAA-C03_mock_exam_results.pdf',
 image: { type: 'jpeg', quality: 0.98 },
 html2canvas: { scale: 2, useCORS: true, logging: false },
 jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' },
 pagebreak: { mode: ['css', 'legacy'] }
 };

 // DOM에 추가 후 PDF 생성, 완료 후 제거
 document.body.appendChild(element);
 (html2pdf() as any).set(options).from(element).save().then(() => {
 if (element.parentNode) document.body.removeChild(element);
 }).catch((err: any) => {
 console.error('PDF generation failed:', err);
 if (element.parentNode) document.body.removeChild(element);
 });
 }}
 disabled={isPdfExpired}
 style={{
 padding: "12px 16px",
 background: isPdfExpired ? "rgba(100, 116, 139, 0.5)" : "rgba(59, 130, 246, 0.3)",
 border: `1px solid ${isPdfExpired ? "rgba(100, 116, 139, 0.3)" : "rgba(59, 130, 246, 0.6)"}`,
 borderRadius: "6px",
 color: isPdfExpired ? "#64748b" : "var(--accent)",
 cursor: isPdfExpired ? "not-allowed" : "pointer",
 fontSize: "14px",
 fontWeight: "500"
 }}
 >
 {isPdfExpired ? t("mockExamPdfExpired") : t("mockExamPdfDownload")}
 </button>

 {!isPdfExpired && (
 <div style={{
 background: "rgba(59, 130, 246, 0.1)",
 border: "1px solid rgba(59, 130, 246, 0.3)",
 borderRadius: "6px",
 padding: "8px 12px",
 fontSize: "12px",
 color: "var(--accent)",
 textAlign: "center"
 }}>
 {t("mockExamPdfInfo")} ({hoursRemaining}시간 남음)
 </div>
 )}
 </div>
 );
 })()
 ) : null
 ) : null
 ) : (
 // 프리미엄이 아닌 사용자
 <>
 <div style={{
 textAlign: "center",
 background: "linear-gradient(135deg, rgba(249, 115, 22, 0.1), rgba(59, 130, 246, 0.1))",
 border: "2px solid rgba(249, 115, 22, 0.4)",
 borderRadius: "12px",
 padding: "32px",
 maxWidth: "450px"
 }}>
 <h2 style={{ fontSize: "24px", margin: "0 0 12px 0", color: "#fb923c" }}>
 {t("mockExamPremiumTitle")}
 </h2>
 <p style={{ fontSize: "14px", color: "#D1D5DB", margin: "0 0 20px 0", lineHeight: "1.6" }}>
 {t("mockExamPremiumDesc")}
 </p>

 <div style={{
 background: "rgba(16, 185, 129, 0.1)",
 border: "1px solid rgba(16, 185, 129, 0.3)",
 borderRadius: "8px",
 padding: "16px",
 marginBottom: "20px",
 textAlign: "left"
 }}>
 <p style={{ fontSize: "12px", color: "#10b981", fontWeight: "bold", margin: "0 0 8px 0" }}>
 {t("mockExamPremiumSubscription")}
 </p>
 <ul style={{
 fontSize: "12px",
 color: "#D1D5DB",
 margin: "0",
 paddingLeft: "20px",
 lineHeight: "1.8"
 }}>
 <li>{t("premiumFeatureList1")}</li>
 <li>{t("premiumFeatureList2")}</li>
 <li>{t("premiumFeatureList3")}</li>
 <li>{t("premiumFeatureList4")}</li>
 </ul>
 </div>

 <button
 disabled
 style={{
 width: "100%",
 padding: "12px 16px",
 background: "#4B5563",
 border: "2px solid #6B7280",
 borderRadius: "8px",
 color: "#9CA3AF",
 cursor: "not-allowed",
 fontSize: "14px",
 fontWeight: "bold",
 marginBottom: "12px",
 opacity: 0.7
 }}
 >
 {t("btnComingSoon")}
 </button>

 {userStatus === "guest" && (
 <button
 onClick={() => setShowCognitoLogin(true)}
 style={{
 width: "100%",
 padding: "12px 16px",
 background: "rgba(59, 130, 246, 0.2)",
 border: "1px solid rgba(59, 130, 246, 0.5)",
 borderRadius: "8px",
 color: "var(--accent)",
 cursor: "pointer",
 fontSize: "12px"
 }}
 >
 {t("mockExamPremiumLoginBtn")}
 </button>
 )}

 <p style={{
 fontSize: "11px",
 color: "#64748b",
 margin: "12px 0 0 0"
 }}>
 {t("mockExamPremiumNote")}
 </p>
 </div>

 {/* 운영자 시험 생성 버튼 */}
 {isAdmin && (
 <button
 onClick={async () => {
 try {
 // 캐시 삭제 - 항상 새로 생성
 localStorage.removeItem("mockExamProblems");
 localStorage.removeItem("mockExamProblemsLoaded");
 localStorage.removeItem("mockExamDifficulties");

 const problems: Problem[] = [];

 // 테스트: API 2번 호출, 문제 2개 생성
 for (let i = 0; i < 2; i++) {
 const problem = await generateSAAProblem([], "medium", locale);
 problems.push(problem);
 }

 setMockExamProblems(problems);
 setMockExamCurrentIndex(0);
 setMockExamAnswers(new Array(problems.length).fill(null));
 setMockExamStartTime(Date.now());
 setMockExamRunning(true);
 } catch (error) {
 alert(t("errorProblemGeneration") + ": " + (error instanceof Error ? error.message : String(error)));
 setMockExamRunning(false);
 // ✅ 에러 발생 시 시험 정보 정리
 localStorage.removeItem("mockExamStartedLocale");
 }
 }}
 style={{
 width: "100%",
 padding: "12px 16px",
 background: "linear-gradient(135deg, rgba(249, 115, 22, 0.3), rgba(59, 130, 246, 0.3))",
 border: "1px solid rgba(249, 115, 22, 0.5)",
 borderRadius: "8px",
 color: "#fb923c",
 cursor: "pointer",
 fontSize: "14px",
 fontWeight: 600,
 transition: "all 0.2s"
 }}
 onMouseEnter={(e) => {
 e.currentTarget.style.background = "linear-gradient(135deg, rgba(249, 115, 22, 0.4), rgba(59, 130, 246, 0.4))";
 }}
 onMouseLeave={(e) => {
 e.currentTarget.style.background = "linear-gradient(135deg, rgba(249, 115, 22, 0.3), rgba(59, 130, 246, 0.3))";
 }}
 >
 시험 생성하기
 </button>
 )}
 </>
 )}
 </div>
 )}

 {tab === "status" && (
 <div className="status-panel">
 <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "20px" }}>
 <h2 style={{ fontSize: "18px", color: "#e2e8f0", marginBottom: "12px" }}>
 {t("dashboardTitle")}
 </h2>

 {/* Login prompt if not logged in */}
 {!userEmail ? (
 <div style={{
 background: "rgba(59, 130, 246, 0.1)",
 border: "1px solid rgba(59, 130, 246, 0.3)",
 borderRadius: "8px",
 padding: "16px",
 textAlign: "center"
 }}>
 <p style={{ fontSize: "13px", color: "#D1D5DB", marginBottom: "12px" }}>
 {t("loginPrompt")}
 </p>
 <button onClick={() => setShowCognitoLogin(true)} style={{
 padding: "8px 16px",
 background: "rgba(59, 130, 246, 0.2)",
 border: "1px solid rgba(59, 130, 246, 0.5)",
 borderRadius: "6px",
 color: "var(--accent)",
 cursor: "pointer",
 fontSize: "12px",
 fontWeight: 600
 }}>
 {t("loginButton")}
 </button>
 </div>
 ) : (
 <>
 {/* Stats cards or Onboarding card */}
 {(!quizStats || (quizStats.totalAttempts ?? 0) === 0) ? (
 <div style={{
 background: "#1A253D",
 border: "1px solid #2A344A",
 borderRadius: "12px",
 padding: "28px 24px",
 textAlign: "center"
 }}>
 <h3 style={{
 fontSize: "16px",
 color: "#F9FAFB",
 fontWeight: 700,
 marginBottom: "10px",
 lineHeight: 1.4
 }}>
 {t("statusEmptyTitle")}
 </h3>
 <p style={{
 fontSize: "13px",
 color: "#9CA3AF",
 lineHeight: 1.6,
 marginBottom: "20px"
 }}>
 {t("statusEmptyDesc")}
 </p>
 <button
 onClick={() => setTab("quiz")}
 style={{
 padding: "10px 20px",
 background: "#FF9900",
 color: "#0F1629",
 border: "none",
 borderRadius: "8px",
 fontSize: "13px",
 fontWeight: 700,
 cursor: "pointer",
 fontFamily: "inherit",
 transition: "all 0.15s"
 }}
 onMouseEnter={(e) => { e.currentTarget.style.background = "#FFB347"; }}
 onMouseLeave={(e) => { e.currentTarget.style.background = "#FF9900"; }}
 >
 {t("statusEmptyCta")}
 </button>
 </div>
 ) : (
 <QuizStatsCards stats={quizStats} />
 )}

 {/* Problem Sessions */}
 {problemSessions && problemSessions.length > 0 && (
 <div>
 <h3 style={{ fontSize: "13px", color: "#D1D5DB", marginBottom: "12px" }}>
 {t("generatedSessionsTitle")}
 </h3>
 {/* 자동 삭제 안내 */}
 <div style={{
 fontSize: "12px",
 color: "#f59e0b",
 background: "rgba(245,158,11,0.1)",
 border: "1px solid rgba(245,158,11,0.3)",
 padding: "8px 12px",
 borderRadius: "6px",
 marginBottom: "8px"
 }}>
 {t("sessionAutoDeleteNotice")}
 </div>
 {/* PDF 설명 */}
 <div style={{
 fontSize: "12px",
 color: "#D1D5DB",
 background: "rgba(100,116,139,0.15)",
 border: "1px solid rgba(100,116,139,0.3)",
 padding: "8px 12px",
 borderRadius: "6px",
 marginBottom: "12px"
 }}>
 {t("sessionPdfDescription")}
 </div>
 <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
 {problemSessions.map((session, idx) => (
 <div
 key={idx}
 style={{
 background: "#1A253D",
 borderRadius: "8px",
 padding: "12px",
 border: "1px solid #2A344A",
 display: "flex",
 justifyContent: "space-between",
 alignItems: "center",
 gap: "12px"
 }}
 >
 <div style={{ flex: 1 }}>
 <div style={{ fontSize: "12px", color: "#e2e8f0", fontWeight: 600 }}>
 {session.date} {session.time}
 </div>
 <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>
 {t("sessionProblemsCount").replace("{n}", String(session.problemCount))}
 </div>
 </div>
 <button
 onClick={() => generatePDF(session)}
 disabled={pdfGeneratingId !== null}
 style={{
 padding: "6px 14px",
 fontSize: "11px",
 fontWeight: 600,
 background: pdfGeneratingId === session.sessionTimestamp
 ? "rgba(245,158,11,0.4)"
 : "rgba(245,158,11,0.2)",
 border: "1px solid rgba(245,158,11,0.4)",
 borderRadius: "6px",
 color: "#f59e0b",
 cursor: pdfGeneratingId !== null ? "not-allowed" : "pointer",
 transition: "all 0.2s",
 whiteSpace: "nowrap",
 opacity: pdfGeneratingId !== null ? 0.6 : 1
 }}
 onMouseEnter={(e) => {
 if (pdfGeneratingId === null) {
 e.currentTarget.style.background = "rgba(245,158,11,0.3)";
 e.currentTarget.style.borderColor = "rgba(245,158,11,0.6)";
 }
 }}
 onMouseLeave={(e) => {
 if (pdfGeneratingId === null) {
 e.currentTarget.style.background = "rgba(245,158,11,0.2)";
 e.currentTarget.style.borderColor = "rgba(245,158,11,0.4)";
 }
 }}
 >
 {pdfGeneratingId === session.sessionTimestamp ? (
 <>
 <span style={{ display: "inline-block", animation: "spin 1s linear infinite", marginRight: "4px" }}>
 ⏳
 </span>
 {t("sessionPdfGenerating")}
 </>
 ) : (
 ` ${t("sessionPdfDownload")}`
 )}
 </button>
 </div>
 ))}
 </div>
 </div>
 )}
 </>
 )}
 </div>
 </div>
 )} {/* End of Status tab */}

 {/* Admin Panel - 관리자만 접근 가능 (서버 검증 필수) */}
 {tab === "admin" && isAdmin && userEmail && (
 //  주의: 실제 데이터는 getAdminStatsSecure에서 서버 검증됨
 // localStorage 수정해도 데이터 로드 실패
 <div style={{
 display: "flex",
 flexDirection: "column",
 gap: "20px",
 height: "100%",
 color: "#e2e8f0"
 }}>
 <div style={{ fontSize: "14px", color: "#D1D5DB" }}>
 Admin Dashboard
 </div>

 {/* Admin Stats */}
 <AdminStatsGrid
 todayVisitors={visitorCount}
 totalVisitors={totalVisitorCount}
 paidUsers={paidUsers}
 freeUsers={freeUsers}
 />

 {/* 기출문제 업로드 버튼 (언어별 3개 동시 노출) */}
 <div style={{
   padding: "16px",
   background: "#1A253D",
   borderRadius: "8px",
   border: "1px solid #2A344A"
 }}>
   <div style={{ fontSize: "13px", color: "#D1D5DB", marginBottom: "10px", fontWeight: 600 }}>
     기출문제 관리
   </div>
   <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
     {(["ko", "en", "ja"] as const).map(loc => (
       <button
         key={loc}
         onClick={async () => {
           if (uploadingPastExam) return;
           setUploadingPastExam(true);
           try {
             const result = await uploadCurrentMockExamToPastExams(loc);
             alert(`[${loc}] ` + t("pastExamUploadSuccess")
               .replace("{added}", String(result.added))
               .replace("{skipped}", String(result.skipped))
               .replace("{deleted}", String(result.deleted))
               .replace("{total}", String(result.totalCount)));
             // 현재 보고 있는 로케일만 캐시 무효화
             if (loc === locale) {
               setPastExamTotalCount(result.totalCount);
               setPastExamCache(new Map());
             }
           } catch (err: any) {
             alert(`[${loc}] ` + (err?.message || "Upload failed"));
           } finally {
             setUploadingPastExam(false);
           }
         }}
         disabled={uploadingPastExam}
         style={{
           padding: "10px 16px",
           background: uploadingPastExam ? "rgba(255,153,0,0.4)" : "#FF9900",
           color: "#0F1629",
           border: "none",
           borderRadius: "6px",
           fontSize: "13px",
           fontWeight: 700,
           cursor: uploadingPastExam ? "not-allowed" : "pointer",
           fontFamily: "inherit",
           whiteSpace: "nowrap"
         }}
       >
         {t("pastExamAdminUpload")} ({loc})
       </button>
     ))}
   </div>
 </div>

 {/* Admin Info */}
 <div style={{
 marginTop: "auto",
 padding: "12px",
 background: "#1A253D",
 borderRadius: "6px",
 fontSize: "11px",
 color: "#64748b",
 lineHeight: "1.6"
 }}>
 <strong>Development Mode</strong><br/>
 Visitor and purchase tracking active.<br/>
 Production will require authentication.
 </div>
 </div>
 )}


 {/* Users Panel - 관리자만 접근 가능 */}
 {tab === "users" && isAdmin && userEmail && (
 <div style={{
 display: "flex",
 flexDirection: "column",
 gap: "16px",
 height: "100%",
 color: "#e2e8f0",
 overflow: "auto"
 }}>
 <div style={{ fontSize: "14px", color: "#D1D5DB" }}>
 {t("usersPanelTitle")}
 </div>

 {/* Users List */}
 <div style={{
 flex: 1,
 overflow: "auto",
 border: "1px solid rgba(255,255,255,0.1)",
 borderRadius: "8px",
 background: "#151E32"
 }}>
 {allUsers.length === 0 ? (
 <div style={{
 padding: "20px",
 textAlign: "center",
 color: "#64748b",
 fontSize: "12px"
 }}>
 {t("usersPanelEmpty")}
 </div>
 ) : (
 <div style={{
 display: "flex",
 flexDirection: "column"
 }}>
 {allUsers.map((user) => (
 <div
 key={user.userId}
 onClick={async () => {
 setSelectedUser(user.userId);
 try {
 // 서버 검증 포함된 함수로 호출
 const sessions = await getUserProblemSessionsSecure(userEmail, user.userId);
 setSelectedUserSessions(sessions);
 } catch (error) {
 // 에러 처리만 수행 (로깅 제거)
 setSelectedUserSessions([]);
 }
 }}
 style={{
 padding: "12px",
 borderBottom: "1px solid rgba(255,255,255,0.05)",
 cursor: "pointer",
 background: selectedUser === user.userId ? "rgba(255,153,0,0.15)" : "transparent",
 borderLeft: selectedUser === user.userId ? "3px solid rgba(255,153,0,0.6)" : "3px solid transparent",
 transition: "all 0.2s"
 }}
 onMouseEnter={(e) => {
 if (selectedUser !== user.userId) {
 e.currentTarget.style.background = "#2A344A";
 }
 }}
 onMouseLeave={(e) => {
 if (selectedUser !== user.userId) {
 e.currentTarget.style.background = "transparent";
 }
 }}
 >
 <div style={{ fontSize: "12px", fontWeight: 600, marginBottom: "4px", display: "flex", alignItems: "center", gap: "8px" }}>
 {maskEmail(user.email)}
 {(user.email === userEmail && isAdmin) && (
 <span style={{ fontSize: "10px", background: "rgba(249,115,22,0.3)", color: "#fb923c", padding: "2px 6px", borderRadius: "4px" }}>
 {t("usersPanelAdminBadge")}
 </span>
 )}
 </div>
 <div style={{ fontSize: "10px", color: "#D1D5DB" }}>
 {user.userStatus === "paid" ? ` ${t("userStatusPaid")}` : user.userStatus === "loggedIn" ? ` ${t("userStatusLoggedIn")}` : ` ${t("userStatusGuest")}`}
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>
 )}
 </div>

 {/* Resizer Handle */}
 {tab !== "console" && (
 <div
 onMouseDown={(e) => {
 resizeStartPosRef.current = { startX: e.clientX, startWidth: graphPanelWidth };
 setIsResizing(true);
 }}
 style={{
 width: '6px',
 background: isResizing ? '#FF9900' : 'rgba(255,255,255,0.15)',
 cursor: 'col-resize',
 transition: isResizing ? 'none' : 'all 0.2s',
 userSelect: 'none',
 flexShrink: 0
 }}
 onMouseEnter={(e) => {
 if (!isResizing) {
 (e.currentTarget as HTMLElement).style.background = 'rgba(255,153,0,0.3)';
 }
 }}
 onMouseLeave={(e) => {
 if (!isResizing) {
 (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.15)';
 }
 }}
 title={t("panelResizeHint")}
 />
 )}

 {/* Right: Graph or Admin Chart */}
 {tab !== "console" && (
 <div className="graph-panel" style={{ flex: `0 0 ${tab === "posts" ? "100%" : (tab === "pastExam" || tab === "console") ? "0%" : graphPanelWidth + "%"}`, position: 'relative', display: (tab === "pastExam") ? "none" : undefined }}>
 {tab === "admin" ? (
 <>
 {/* Admin Bar Graph */}
 <div className="graph-label"> Visitor Analytics</div>
 <div style={{
 display: "flex",
 flexDirection: "column",
 height: "100%",
 gap: "12px",
 padding: "16px"
 }}>
 {/* Period Switching Buttons */}
 <div style={{
 display: "flex",
 gap: "8px"
 }}>
 {["daily", "weekly", "monthly"].map((period) => (
 <button
 key={period}
 onClick={() => setGraphPeriod(period as "daily" | "weekly" | "monthly")}
 style={{
 flex: 1,
 padding: "8px 12px",
 fontSize: "11px",
 background: graphPeriod === period ? "rgba(255,153,0,0.2)" : "#2A344A",
 border: `1px solid ${graphPeriod === period ? "rgba(255,153,0,0.5)" : "#2A344A"}`,
 borderRadius: "6px",
 color: graphPeriod === period ? "var(--accent)" : "#D1D5DB",
 cursor: "pointer",
 fontWeight: graphPeriod === period ? 600 : 500,
 transition: "all 0.2s"
 }}
 >
 {period === "daily" && t("graphPeriodDaily")}
 {period === "weekly" && t("graphPeriodWeekly")}
 {period === "monthly" && t("graphPeriodMonthly")}
 </button>
 ))}
 </div>

 {/* Bar Graph */}
 <div style={{
 flex: 1,
 background: "#1A253D",
 borderRadius: "8px",
 padding: "16px",
 border: "1px solid #2A344A",
 display: "flex",
 flexDirection: "column",
 overflow: "hidden"
 }}>
 {/* Graph Header with Navigation */}
 <div style={{
 display: "flex",
 justifyContent: "space-between",
 alignItems: "center",
 marginBottom: "12px",
 fontSize: "12px",
 color: "rgba(255,255,255,0.6)"
 }}>
 <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
 <span style={{ fontWeight: "500" }}>
 {graphPeriod === "monthly"
 ? t("graphTitleMonthlyOverview")
 : graphPeriod === "weekly"
 ? t("graphPeriodWeekly")
 : t("graphPeriodDaily")}
 </span>
 {graphPeriod !== "monthly" && (
 <select
 value={graphMonthOffset}
 onChange={(e) => {
 setGraphMonthOffset(parseInt(e.target.value));
 setGraphZoom(1);
 setGraphWeekIndex(0);
 }}
 style={{
 padding: "6px 10px",
 background: "rgba(255,255,255,0.05)",
 border: "1px solid #2A344A",
 borderRadius: "6px",
 color: "#D1D5DB",
 cursor: "pointer",
 fontSize: "12px",
 fontWeight: "bold"
 }}>
 {Array.from({ length: new Date().getMonth() + 1 }, (_, i) => {
 const date = new Date();
 date.setMonth(date.getMonth() - i);
 const monthName = date.toLocaleDateString(
 locale === "ja" ? "ja-JP" : locale === "en" ? "en-US" : "ko-KR",
 { month: "long", year: "numeric" }
 );
 return (
 <option key={i} value={i}>
 {monthName}
 </option>
 );
 })}
 </select>
 )}
 {graphPeriod !== "monthly" && (
 <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>
 {new Date(new Date().getFullYear(), new Date().getMonth() - graphMonthOffset, 1).toLocaleDateString(
 locale === "ja" ? "ja-JP" : locale === "en" ? "en-US" : "ko-KR",
 { month: "long", year: "numeric" }
 )}
 </span>
 )}
 </div>
 <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)" }}>
 {graphPeriod === "monthly"
 ? t("graphHintClickToZoom")
 : t("graphHintScrollClickBar")}
 </span>
 </div>
 {graphData && graphData.length > 0 ? (
 <div style={{
 flex: 1,
 overflow: "hidden",
 cursor: "default"
 }}
 onWheel={(e) => {
 e.preventDefault();
 const delta = e.deltaY > 0 ? 1.2 : 0.9;
 setGraphZoom(Math.max(0.5, Math.min(60, graphZoom * delta)));
 }}
 >
 {(() => {
 const maxScale = Math.max(30000 / graphZoom, 200); // Y축 최대값이 200 이상

 // Calculate appropriate gridStep based on maxScale
 let gridStep = 1;
 const steps = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000];
 for (const step of steps) {
 if (maxScale / step <= 6) {
 gridStep = step;
 break;
 }
 }

 const gridValues = [];
 for (let i = 0; i <= maxScale; i += gridStep) {
 gridValues.push(i);
 }

 return (
 <svg viewBox="0 0 500 250" style={{ width: "100%", height: "100%" }}>
 {/* X-axis */}
 <line x1="40" y1="200" x2="480" y2="200" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
 {/* Y-axis */}
 <line x1="40" y1="20" x2="40" y2="200" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

 {/* Grid lines and labels (dynamic range) */}
 {gridValues.map((value) => (
 <g key={`grid-${value}`}>
 <line x1="35" y1={200 - (value / maxScale) * 180} x2="480" y2={200 - (value / maxScale) * 180} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
 <text x="25" y={205 - (value / maxScale) * 180} fontSize="10" fill="rgba(255,255,255,0.4)" textAnchor="end">
 {value}
 </text>
 </g>
 ))}

 {/* Bars */}
 {graphData.map((item, idx) => {
 const barHeight = (item.count / maxScale) * 180;
 const barWidth = 430 / graphData.length;
 const x = 45 + idx * barWidth + barWidth * 0.1;
 const y = 200 - barHeight;

 return (
 <g key={`bar-${idx}`} style={{ cursor: graphPeriod !== "daily" ? "pointer" : "default" }}>
 <rect x={x} y={y} width={barWidth * 0.8} height={barHeight}
 fill="rgba(255,153,0,0.4)" rx="3"
 onClick={() => {
 if (graphPeriod === "monthly") {
 // 월 클릭 → Weekly로 변경
 setGraphMonthOffset(idx);
 setGraphPeriod("weekly");
 } else if (graphPeriod === "weekly") {
 // 주 클릭 → Daily로 변경
 setGraphWeekIndex(idx);
 setGraphPeriod("daily");
 }
 }} />
 <text x={x + barWidth * 0.4} y="215" fontSize="9" fill="rgba(255,255,255,0.5)"
 textAnchor="middle"
 onClick={() => {
 if (graphPeriod === "monthly") {
 setGraphMonthOffset(idx);
 setGraphPeriod("weekly");
 } else if (graphPeriod === "weekly") {
 setGraphWeekIndex(idx);
 setGraphPeriod("daily");
 }
 }}
 style={{ cursor: graphPeriod !== "daily" ? "pointer" : "default" }}>
 {item.label}
 </text>
 </g>
 );
 })}
 </svg>
 );
 })()}
 </div>
 ) : (
 <div style={{
 flex: 1,
 display: "flex",
 alignItems: "center",
 justifyContent: "center",
 color: "#64748b",
 fontSize: "12px"
 }}>
 {t("noData")}
 </div>
 )}
 </div>

 {/* Zoom Info */}
 {graphData && graphData.length > 0 && (
 <div style={{
 fontSize: "10px",
 color: "#64748b",
 marginTop: "8px",
 textAlign: "center"
 }}>
 {t("graphHintScrollDragPan")}
 </div>
 )}
 </div>
 </>
 ) : tab === "status" ? (
 <>
 <div className="graph-label">{t("statisticsLabel")}</div>
 <div style={{
 padding: "20px",
 overflowY: "auto",
 height: "100%"
 }}>
 {!userEmail ? (
 <div style={{
 display: "flex",
 alignItems: "center",
 justifyContent: "center",
 height: "100%",
 color: "#64748b",
 fontSize: "13px",
 textAlign: "center"
 }}>
 {t("loginPrompt")}
 </div>
 ) : (
 <>
 <h3 style={{ fontSize: "13px", color: "#D1D5DB", marginBottom: "12px" }}>
 {t("weakServices")} {t("weakServicesDesc")}
 </h3>
 {quizStats && Object.entries(quizStats.byService || {}).some(([s]) => NODES.some(n => n.id === s || n.name.toLowerCase() === String(s).toLowerCase())) ? (
 <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
 {/* 정답률 낮은 순서대로 정렬.
     과거 locale 별 한국어 키워드로 저장된 stale 데이터는 NODE 매칭 실패로 자동 제외. */}
 {Object.entries(quizStats.byService || {})
 .filter(([service]) => NODES.some(n => n.id === service || n.name.toLowerCase() === String(service).toLowerCase()))
 .map(([service, stats]: any) => ({
 service,
 accuracy: stats.accuracy,
 total: stats.total,
 correct: stats.correct
 }))
 .sort((a, b) => a.accuracy - b.accuracy) // 낮은 정답률부터
 .map(({ service, accuracy, total, correct }) => {
 const nodeData = NODES.find(n => n.id === service || n.name.toLowerCase() === String(service).toLowerCase());
 return (
 <div
 key={service}
 style={{
 background: "#1A253D",
 borderRadius: "8px",
 padding: "12px",
 display: "flex",
 alignItems: "center",
 gap: "12px",
 border: "1px solid #2A344A"
 }}
 >
 <div style={{ fontSize: "24px" }}>{nodeData?.emoji}</div>
 <div style={{ flex: 1 }}>
 <div style={{ fontSize: "13px", color: "#e2e8f0", fontWeight: 600 }}>
 {nodeData?.name || service}
 </div>
 <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>
 {correct}/{total} ({accuracy}%)
 </div>
 </div>
 <div
 style={{
 width: "40px",
 height: "40px",
 borderRadius: "6px",
 background: accuracy < 50 ? "rgba(239,68,68,0.2)" : accuracy < 75 ? "rgba(245,158,11,0.2)" : "rgba(34,197,94,0.2)",
 border: accuracy < 50 ? "1px solid rgba(239,68,68,0.4)" : accuracy < 75 ? "1px solid rgba(245,158,11,0.4)" : "1px solid rgba(34,197,94,0.4)",
 display: "flex",
 alignItems: "center",
 justifyContent: "center",
 fontSize: "14px",
 fontWeight: 600,
 color: accuracy < 50 ? "#ef4444" : accuracy < 75 ? "#f59e0b" : "#4ade80"
 }}
 >
 {accuracy}%
 </div>
 </div>
 );
 })}
 </div>
 ) : (
 <div style={{ color: "#64748b", fontSize: "12px", textAlign: "center", padding: "20px" }}>
 {t("noData")}
 </div>
 )}
 </>
 )}
 </div>
 </>
 ) : tab === "mockExam" ? (
 <>
 <div className="graph-label">{t("mockExamTitle")}</div>
 <div style={{
 padding: "20px",
 overflowY: "auto",
 height: "100%",
 display: "flex",
 flexDirection: "column",
 gap: "20px"
 }}>
 {mockExamRunning ? (
 // 모의시험 진행 중
 <div style={{
 display: "flex",
 flexDirection: "column",
 gap: "20px",
 height: "100%"
 }}>
 {/* 진행 상황 헤더 */}
 <div style={{
 display: "flex",
 justifyContent: "space-between",
 alignItems: "center",
 background: "rgba(59, 130, 246, 0.1)",
 padding: "16px",
 borderRadius: "8px",
 border: "1px solid rgba(59, 130, 246, 0.3)"
 }}>
 <div style={{ fontSize: "14px", color: "#e2e8f0", display: "flex", alignItems: "center", gap: "8px" }}>
 문제 {mockExamCurrentIndex + 1} / {mockExamProblems.length}
 {mockExamIsLoading && (
   <>
     <span className="loading-icon" style={{ fontSize: "18px" }}>⏳</span>
     <span style={{ color: "#FF9900", fontSize: "12px", fontWeight: "600" }}>로딩 중...</span>
   </>
 )}
 </div>
 <div style={{
 fontSize: "14px",
 fontWeight: "bold",
 color: mockExamTimeRemaining < 300 ? "#ef4444" : "var(--accent)"
 }}>
 ⏱️ {Math.floor(mockExamTimeRemaining / 60)}분 {mockExamTimeRemaining % 60}초
 </div>
 </div>

 {/* 문제 표시 영역 (status 탭과 동일한 스타일) */}
 {mockExamProblems[mockExamCurrentIndex] && (
 <div style={{
 background: "rgba(30, 41, 59, 0.8)",
 border: "1px solid rgba(100, 116, 139, 0.3)",
 borderRadius: "8px",
 padding: "16px",
 flex: 1,
 overflowY: "auto"
 }}>
 <div style={{ color: "#D1D5DB", lineHeight: "1.6", fontSize: "14px" }}>
 <h3 style={{ color: "#e2e8f0", marginTop: 0 }}>
 {mockExamProblems[mockExamCurrentIndex].question}
 </h3>

 {/* 보기 */}
 <div style={{ display: "flex", flexDirection: "column", gap: "8px", margin: "16px 0" }}>
 {(["A", "B", "C", "D"] as const).map((key) => {
 const value = mockExamProblems[mockExamCurrentIndex].options[key];
 return (
 <label key={key} style={{
 display: "flex",
 alignItems: "center",
 gap: "10px",
 padding: "12px",
 background: mockExamAnswers[mockExamCurrentIndex] === key ? "rgba(59, 130, 246, 0.2)" : "rgba(71, 85, 105, 0.3)",
 border: mockExamAnswers[mockExamCurrentIndex] === key ? "1px solid rgba(59, 130, 246, 0.5)" : "1px solid rgba(100, 116, 139, 0.3)",
 borderRadius: "6px",
 cursor: "pointer",
 transition: "all 0.2s"
 }}>
 <input
 type="radio"
 name="mock-answer"
 value={key}
 checked={mockExamAnswers[mockExamCurrentIndex] === key}
 onChange={() => {
 const newAnswers = [...mockExamAnswers];
 newAnswers[mockExamCurrentIndex] = key;
 setMockExamAnswers(newAnswers);
 }}
 style={{ cursor: "pointer" }}
 />
 <span style={{ fontWeight: "bold", marginRight: "8px" }}>{key})</span>
 <span>{value}</span>
 </label>
 );
 })}
 </div>
 </div>
 </div>
 )}

 {/* 네비게이션 버튼 */}
 <div style={{
 display: "flex",
 gap: "8px",
 justifyContent: "center"
 }}>
 <button
 onClick={() => setMockExamCurrentIndex(Math.max(0, mockExamCurrentIndex - 1))}
 disabled={mockExamCurrentIndex === 0}
 style={{
 padding: "8px 16px",
 background: mockExamCurrentIndex === 0 ? "rgba(100, 116, 139, 0.3)" : "rgba(59, 130, 246, 0.2)",
 border: "1px solid rgba(59, 130, 246, 0.3)",
 borderRadius: "6px",
 color: mockExamCurrentIndex === 0 ? "#64748b" : "var(--accent)",
 cursor: mockExamCurrentIndex === 0 ? "not-allowed" : "pointer",
 fontSize: "12px"
 }}
 >
 ← 이전
 </button>
 <button
 onClick={() => setMockExamCurrentIndex(Math.min(mockExamProblems.length - 1, mockExamCurrentIndex + 1))}
 disabled={mockExamCurrentIndex >= mockExamProblems.length - 1}
 style={{
 padding: "8px 16px",
 background: mockExamCurrentIndex >= mockExamProblems.length - 1 ? "rgba(100, 116, 139, 0.3)" : "rgba(59, 130, 246, 0.2)",
 border: "1px solid rgba(59, 130, 246, 0.3)",
 borderRadius: "6px",
 color: mockExamCurrentIndex >= mockExamProblems.length - 1 ? "#64748b" : "var(--accent)",
 cursor: mockExamCurrentIndex >= mockExamProblems.length - 1 ? "not-allowed" : "pointer",
 fontSize: "12px"
 }}
 >
 다음 →
 </button>
 <button
 onClick={() => {
 // 답변하지 않은 문제 개수 확인
 const unanswered = mockExamAnswers.filter(answer => answer === null).length;

 // 답변하지 않은 문제가 있으면 확인
 if (unanswered > 0) {
 const message = unanswered === mockExamProblems.length
 ? t("mockExamNoAnswersGrading")
 : t("mockExamPartialAnswersGrading").replace("{n}", unanswered.toString());

 if (!window.confirm(message)) {
 return; // 취소 클릭
 }
 }

 // 채점 로직
 let correct = 0;
 mockExamProblems.forEach((problem, idx) => {
 if (mockExamAnswers[idx] === problem.answer) correct++;
 });
 const score = Math.round((correct / mockExamProblems.length) * 1000);
 const timeSpent = mockExamStartTime ? Math.floor((Date.now() - mockExamStartTime) / 1000) : 0;

 const results = {
 totalScore: score,
 correct: correct,
 wrong: mockExamProblems.length - correct,
 correctRate: Math.round((correct / mockExamProblems.length) * 100),
 passed: score >= 720,
 timeSpent: timeSpent
 };
 setMockExamResults(results);
 setMockExamRunning(false);
 // ✅ 시험 종료: 고정된 언어 정보 제거
 localStorage.removeItem("mockExamStartedLocale");

 // 오늘 날짜 저장 (일일 제한)
 const today = new Date().toISOString().split("T")[0];
 localStorage.setItem("lastMockExamDate", today);
 setMockExamAlreadyTaken(true);
 }}
 style={{
 padding: "8px 16px",
 background: "rgba(16, 185, 129, 0.2)",
 border: "1px solid rgba(16, 185, 129, 0.5)",
 borderRadius: "6px",
 color: "#10b981",
 cursor: "pointer",
 fontSize: "12px",
 marginLeft: "auto"
 }}
 >
 채점하기
 </button>
 </div>
 </div>
 ) : mockExamResults ? (
 // 모의시험 결과 - 문제별 분석
 <>
 <div style={{
 padding: "20px",
 display: "flex",
 flexDirection: "column",
 gap: "12px",
 overflowY: "auto",
 height: "100%"
 }}>
 <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
 {mockExamProblems.map((problem, idx) => {
 const userAnswer = mockExamAnswers[idx];
 const isCorrect = userAnswer === problem.answer;

 return (
 <div key={idx} style={{
 background: "rgba(30, 41, 59, 0.8)",
 border: "1px solid rgba(100, 116, 139, 0.3)",
 borderRadius: "8px",
 padding: "16px"
 }}>
 {/* 문제 제목 */}
 <h4 style={{ color: "#e2e8f0", marginTop: 0, marginBottom: "12px", fontSize: "13px" }}>
 Q{idx + 1}. {problem.question}
 </h4>

 {/* 원본 보기 버튼 */}
 <button
   onClick={() => setShowOriginalMap(prev => ({ ...prev, [idx]: !prev[idx] }))}
   style={{
     padding: "4px 10px",
     marginBottom: "12px",
     background: showOriginalMap[idx] ? "rgba(99,102,241,0.3)" : "rgba(99,102,241,0.1)",
     border: "1px solid rgba(99,102,241,0.4)",
     borderRadius: "4px",
     color: "#a5b4fc",
     cursor: "pointer",
     fontSize: "11px",
   }}
 >
   {showOriginalMap[idx] ? "▲ 원본 닫기" : "▼ 원본 보기"}
 </button>

 {/* 원본 선택지 표시 */}
 {showOriginalMap[idx] && (
   <div style={{ marginBottom: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
     {(["A", "B", "C", "D"] as const).map(opt => (
       <div key={opt} style={{
         padding: "8px 12px",
         borderRadius: "6px",
         fontSize: "12px",
         background: opt === problem.answer ? "rgba(16,185,129,0.15)" : opt === mockExamAnswers[idx] && opt !== problem.answer ? "rgba(239,68,68,0.1)" : "rgba(71,85,105,0.2)",
         border: `1px solid ${opt === problem.answer ? "rgba(16,185,129,0.4)" : opt === mockExamAnswers[idx] && opt !== problem.answer ? "rgba(239,68,68,0.3)" : "rgba(100,116,139,0.2)"}`,
         color: opt === problem.answer ? "#4ade80" : opt === mockExamAnswers[idx] && opt !== problem.answer ? "#f87171" : "#D1D5DB",
       }}>
         <strong>{opt}.</strong> {problem.options[opt]}
         {opt === problem.answer && <span style={{ marginLeft: "8px", fontSize: "10px", color: "#4ade80" }}>✓ 정답</span>}
         {opt === mockExamAnswers[idx] && opt !== problem.answer && <span style={{ marginLeft: "8px", fontSize: "10px", color: "#f87171" }}>← 내 선택</span>}
       </div>
     ))}
   </div>
 )}

 {/* 정답/오답 표시 */}
 <div style={{ fontSize: "12px", color: isCorrect ? "#10b981" : "#ef4444", marginBottom: "12px", fontWeight: "bold" }}>
 {isCorrect ? t("quizCorrect") : t("quizIncorrect")}
 </div>

 {/* 핵심 목표 */}
 {(problem as any).goal && (
 <div style={{ fontSize: "12px", color: "#a78bfa", marginBottom: "12px", padding: "8px", background: "rgba(167,139,250,0.1)", borderRadius: "4px" }}>
 <strong>{t("quizKeyGoal")}</strong> {(problem as any).goal}
 </div>
 )}

 {/* 정답과 설명 */}
 <div style={{ fontSize: "12px", color: "#D1D5DB", lineHeight: "1.6", marginBottom: "12px" }}>
 <strong>{t("quizAnswer")} {problem.answer}</strong>
 </div>
 <div style={{ fontSize: "12px", color: "#D1D5DB", lineHeight: "1.6", marginBottom: "12px" }}>
 <strong>{t("quizExplanation")}</strong>
 <p style={{ marginTop: "6px" }}>{problem.explanation.correct}</p>
 {userAnswer !== problem.answer && problem.explanation[`trap_${userAnswer}` as keyof typeof problem.explanation] && (
 <p style={{ marginTop: "6px", color: "#ef4444" }}>
 <strong>{t("quizTrap")}</strong> {problem.explanation[`trap_${userAnswer}` as keyof typeof problem.explanation]}
 </p>
 )}
 </div>

 {/* 이지모드 */}
 {(problem as any).easyMode && (
 <div style={{ fontSize: "12px", color: "#D1D5DB", padding: "12px", background: "rgba(245,158,11,0.1)", borderRadius: "6px" }}>
 <strong style={{ color: "#fbbf24" }}>{t("quizEasyModeExplanation")}</strong>
 <p style={{ marginTop: "6px", lineHeight: "1.6" }}>{(problem as any).easyMode.explanation}</p>
 <div style={{ marginTop: "8px", paddingTop: "8px", borderTop: "1px solid rgba(245,158,11,0.2)" }}>
 <strong style={{ color: "#fbbf24" }}>{t("quizEachOptionExplanation")}</strong>
 {(["A", "B", "C", "D"] as const).map(opt => (
 <div key={opt} style={{ marginTop: "6px", color: opt === problem.answer ? "#4ade80" : "#D1D5DB" }}>
 <strong>{opt}.</strong> {(problem as any).easyMode[opt]}
 </div>
 ))}
 </div>
 </div>
 )}
 </div>
 );
 })}
 </div>
 {/* 다시 보기 버튼 (결과 화면 하단) */}
 <div style={{ padding: "12px 20px", borderTop: "1px solid rgba(100,116,139,0.2)" }}>
   <button
     onClick={() => {
       // 결과 화면: state에 이미 문제가 있으므로 바로 재시작
       if (mockExamProblems.length > 0) {
         setMockExamAnswers(new Array(mockExamProblems.length).fill(null));
         setMockExamStartTime(Date.now());
         setMockExamTimeRemaining(130 * 60);
         setMockExamCurrentIndex(0);
         setMockExamResults(null);
         setShowOriginalMap({});
         setMockExamRunning(true);
       }
     }}
     style={{
       width: "100%",
       padding: "10px",
       background: "rgba(59, 130, 246, 0.2)",
       border: "1px solid rgba(59, 130, 246, 0.4)",
       borderRadius: "6px",
       color: "var(--accent)",
       cursor: "pointer",
       fontSize: "13px",
       fontWeight: "600",
     }}
   >
     {t("mockExamRestart")}
   </button>
 </div>
 </div>
 </>
 ) : mockExamDateChecking ? (
 // Firebase 날짜 확인 중 - 로딩
 <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
   <div style={{
     fontSize: "32px",
     animation: "spin 1s linear infinite",
     display: "inline-block",
   }}>⏳</div>
   <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
 </div>
 ) : mockExamAlreadyTaken ? (
 // 오늘 이미 본 경우
 <div style={{
 display: "flex",
 flexDirection: "column",
 gap: "20px",
 justifyContent: "center",
 alignItems: "center",
 height: "100%"
 }}>
 <div style={{
 textAlign: "center",
 background: "rgba(249, 115, 22, 0.1)",
 border: "2px solid rgba(249, 115, 22, 0.4)",
 borderRadius: "12px",
 padding: "24px",
 maxWidth: "400px"
 }}>
 <p style={{ fontSize: "14px", color: "#D1D5DB", margin: "0 0 12px 0", lineHeight: "1.6" }}>
 {t("mockExamCurrentUTC")}: {currentUtcTime}
 </p>
 <p style={{ fontSize: "14px", color: "#D1D5DB", margin: "0", lineHeight: "1.6" }}>
 {nextUtcDate} {t("mockExamRetryAtMidnight")}
 </p>
 </div>
 {/* 다시 보기 버튼 */}
 <button
   onClick={async () => {
     setLoading(true);
     try {
       // 1순위: localStorage 캐시 (시험 당시 locale로 저장된 것)
       const examLocale = localStorage.getItem("mockExamStartedLocale") || locale;
       let savedProblems = await getTodayMockExamProblems(examLocale);

       // 2순위: 현재 locale로 재시도
       if (!savedProblems || savedProblems.length === 0) {
         savedProblems = await getTodayMockExamProblems(locale);
       }

       // 3순위: localStorage의 mockExamAllProblems
       if (!savedProblems || savedProblems.length === 0) {
         const stored = localStorage.getItem("mockExamAllProblems");
         if (stored) savedProblems = JSON.parse(stored);
       }

       if (!savedProblems || savedProblems.length === 0) {
         alert("저장된 문제가 없습니다.");
         return;
       }
       setMockExamProblems(savedProblems);
       setMockExamAnswers(new Array(savedProblems.length).fill(null));
       setMockExamStartTime(Date.now());
       setMockExamTimeRemaining(130 * 60);
       setMockExamCurrentIndex(0);
       setMockExamResults(null);
       setShowOriginalMap({});
       localStorage.setItem("mockExamStartedLocale", examLocale);
       localStorage.setItem("mockExamAllProblems", JSON.stringify(savedProblems));
       localStorage.setItem("mockExamProblemsCount", savedProblems.length.toString());
       setMockExamRunning(true);
     } catch (err) {
       alert("문제 불러오기 실패");
     } finally {
       setLoading(false);
     }
   }}
   disabled={loading}
   style={{
     padding: "12px 24px",
     background: "rgba(59, 130, 246, 0.3)",
     border: "2px solid rgba(59, 130, 246, 0.5)",
     borderRadius: "8px",
     color: "var(--accent)",
     cursor: loading ? "not-allowed" : "pointer",
     fontSize: "14px",
     fontWeight: "600",
   }}
 >
   {loading ? t("mockExamLoading") : t("mockExamRestart")}
 </button>
 </div>
 ) : (
 // 모의시험 시작 전
 <div style={{
 display: "flex",
 flexDirection: "column",
 gap: "20px",
 justifyContent: "center",
 alignItems: "center",
 height: "100%"
 }}>
 <div style={{
 textAlign: "center"
 }}>
 <h2 style={{ fontSize: "20px", color: "#e2e8f0", margin: "0 0 12px 0" }}>
 {t("mockExamTitle")}
 </h2>
 <p style={{ fontSize: "14px", color: "#D1D5DB", margin: "0 0 16px 0" }}>
 {t("mockExamDescription")}
 </p>
 <p style={{
 fontSize: "12px",
 color: "#64748b",
 background: "rgba(100, 116, 139, 0.2)",
 padding: "12px",
 borderRadius: "6px",
 margin: "0 0 8px 0"
 }}>
 {t("mockExamInfo")}
 </p>
 <p style={{
 fontSize: "11px",
 color: "#D1D5DB",
 background: "rgba(100, 116, 139, 0.15)",
 padding: "8px",
 borderRadius: "6px",
 margin: "0"
 }}>
 {t("mockExamLanguageNote")}
 </p>
 </div>

 {isAdmin && (
 <button
 onClick={async () => {
 setLoading(true);
 try {
 // 서버에서 admin 재검증 (동적 backend URL)
 const adminCheck = await fetch(`${resolveJavaBackendUrl()}/api/checkAdmin`, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ email: userEmail })
 });
 const adminData = await adminCheck.json();

 if (!adminData.isAdmin) {
 setError(t("errorAdminOnly"));
 return;
 }

 // 🔥 강제 재생성: 기존 캐시 모두 삭제
 const today = new Date().toISOString().split("T")[0];
 const cacheKey = `mockExamProblems_${today}_${locale}`;
 localStorage.removeItem(cacheKey);
 localStorage.removeItem("mockExamThemes");
 localStorage.removeItem("mockExamConceptServices");
 localStorage.removeItem("mockExamDifficulties");
 localStorage.removeItem("mockExamDomains");
 localStorage.removeItem("mockExamAllProblems");

 // 50문제 분배: 36 시나리오 + 4 컨셉 비교 + 10 컨셉 탭 노드
 const THEMES_36 = [
   "cdn", "cdn", "cdn",
   "streaming", "streaming", "streaming",
   "autoscaling", "autoscaling", "autoscaling",
   "cost", "cost", "cost",
   "dr", "dr", "dr",
   "dbperf", "dbperf", "dbperf",
   "serverless", "serverless", "serverless",
   "network", "network", "network",
   "container", "container", "container",
   "analytics", "analytics", "analytics",
   "security", "security", "security",
   "compliance", "compliance", "compliance",
 ];
 const CONCEPT_POOL = [
   "concept_sqs", "concept_sns_sqs", "concept_storage", "concept_db",
   "concept_dynamodb", "concept_cache", "concept_compute", "concept_cdn",
   "concept_s3class", "concept_network", "concept_secg_nacl", "concept_iam",
   "concept_monitor", "concept_kinesis",
 ];
 const FOUR_C = [...CONCEPT_POOL].sort(() => Math.random() - 0.5).slice(0, 4);
 const TEN_TAB = Array(10).fill("concept_tab_node");
 const themes = [...THEMES_36, ...FOUR_C, ...TEN_TAB];
 for (let i = themes.length - 1; i > 0; i--) {
   const j = Math.floor(Math.random() * (i + 1));
   [themes[i], themes[j]] = [themes[j], themes[i]];
 }

 // 도메인 분배
 const domains = [
   ...Array(15).fill("security"),
   ...Array(13).fill("resilience"),
   ...Array(12).fill("performance"),
   ...Array(10).fill("cost-optimization"),
 ];
 for (let i = domains.length - 1; i > 0; i--) {
   const j = Math.floor(Math.random() * (i + 1));
   [domains[i], domains[j]] = [domains[j], domains[i]];
 }

 // 시나리오 슬롯(36개) 분배: 3슬롯×5서비스 + 10슬롯×2서비스 + 23슬롯×1서비스
 const scenarioIndices: number[] = [];
 for (let i = 0; i < 50; i++) {
   const t = themes[i];
   if (t && !t.startsWith("concept_")) scenarioIndices.push(i);
 }
 for (let i = scenarioIndices.length - 1; i > 0; i--) {
   const j = Math.floor(Math.random() * (i + 1));
   [scenarioIndices[i], scenarioIndices[j]] = [scenarioIndices[j], scenarioIndices[i]];
 }
 const slotCounts = new Map<number, number>();
 scenarioIndices.forEach((slotIdx, idx) => {
   slotCounts.set(slotIdx, idx < 3 ? 5 : idx < 13 ? 2 : 1);
 });

 // 50문제 생성 (theme + service 사전 할당)
 const problems: any[] = [];
 const usedSets = new Set<string>();
 for (let i = 0; i < 50; i++) {
   const t = themes[i];
   let serviceList: string[] = [];
   if (t && t.startsWith("concept_") && t !== "concept_tab_node") {
     serviceList = []; // 비교 문제는 서비스 없음
   } else if (t === "concept_tab_node") {
     serviceList = selectServicesFromAnalysis(usedSets, 1);
   } else {
     serviceList = selectServicesFromAnalysis(usedSets, slotCounts.get(i) || 1);
   }
   const domain = domains[i] as "security" | "resilience" | "performance" | "cost-optimization";
   const problem = await generateSAAProblem(serviceList, "medium", locale, domain, t);
   problems.push(problem);
 }
 await saveTodayMockExamProblems(problems, locale);
 setMockExamProblems(problems);
 } catch (err) {
 setError(t("errorProblemGeneration"));
 } finally {
 setLoading(false);
 }
 }}
 disabled={loading}
 style={{
 padding: "16px 32px",
 background: "rgba(147, 112, 219, 0.3)",
 border: "2px solid rgba(147, 112, 219, 0.6)",
 borderRadius: "8px",
 color: "#d8b4fe",
 cursor: loading ? "not-allowed" : "pointer",
 fontSize: "16px",
 fontWeight: "bold",
 opacity: loading ? 0.6 : 1
 }}
 >
 {loading && <span className="loading-icon">⏳</span>}
 {loading ? t("btnGenerating") : t("mockExamAdminForceCreate")}
 </button>
 )}

 {(userStatus === "paid" || isAdmin) && (
 <button
 onClick={async () => {
 // ✅ 오늘 시험을 이미 시작했는지 확인 (테스트 사용자 & 운영자 제외)
 // ✅ Firebase를 통해 실제 결제 상태 검증 (보안 강화)
 let isPaidUser = TEST_PAID_EMAILS.includes(userEmail || '');
 if (!isPaidUser && userStatus === "paid") {
 const user = getCurrentUser();
 if (user) {
 isPaidUser = await verifyUserPaidStatusFromFirebase(user.uid);
 }
 }

 // 환경변수에서 읽은 이메일 목록 사용 + Firebase 검증
 const isUnlimitedUser = isPaidUser || isAdmin;

 const today = new Date().toISOString().split('T')[0];
 const mockExamStartedDate = localStorage.getItem("mockExamStartedToday");

 // 테스트 사용자 & 운영자는 무제한 응시 가능
 if (!isUnlimitedUser && mockExamStartedDate === today) {
 const message = `${t("mockExamAlreadyStartedToday")}\n\n${t("mockExamNextAttempt")}`;
 alert(message);
 return;
 }

 setLoading(true);
 setMockExamIsLoading(true);
 try {
 // 1단계: Firestore에서 오늘의 UTC 기준 문제 조회 (언어별)
 const existingProblems = await getTodayMockExamProblems(locale);
 let allProblems = existingProblems;
 let difficulties: string[] = [];
 let domains: string[] = [];

 if (existingProblems && existingProblems.length > 0) {
 // 이미 생성된 문제 존재 - 공유 사용
 allProblems = existingProblems;
 // 모든 문제 medium 고정 (난이도 추출 불필요)
 difficulties = Array(existingProblems.length).fill("medium");
 // 50개가 안되면 남은 자리도 모두 medium으로 추가
 const remainingCount = 50 - difficulties.length;
 if (remainingCount > 0) {
 difficulties = [...difficulties, ...Array(remainingCount).fill("medium")];
 }
 // 기존 문제의 도메인은 알 수 없으므로 균등 분배
 domains = [
 ...Array(15).fill("security"),
 ...Array(13).fill("resilience"),
 ...Array(12).fill("performance"),
 ...Array(10).fill("cost-optimization")
 ];
 for (let i = domains.length - 1; i > 0; i--) {
 const j = Math.floor(Math.random() * (i + 1));
 [domains[i], domains[j]] = [domains[j], domains[i]];
 }
 } else {
 // 새 문제 생성
 //  SAA-C03 도메인별 출제 비율
 // - 보안 (Secure Architectures): 30% → 15문제
 // - 복현력 (Resilient Architectures): 26% → 13문제
 // - 고성능 (High-Performing Architectures): 24% → 12문제
 // - 비용 최적화 (Cost-Optimized Architectures): 20% → 10문제
 domains = [
 ...Array(15).fill("security"),
 ...Array(13).fill("resilience"),
 ...Array(12).fill("performance"),
 ...Array(10).fill("cost-optimization")
 ];

 // 모의시험은 모두 medium 난이도로 고정
 difficulties = Array(50).fill("medium");

 // 도메인만 순서 섞기 (난이도는 모두 medium이라 섞을 필요 없음)
 for (let i = domains.length - 1; i > 0; i--) {
 const j = Math.floor(Math.random() * (i + 1));
 [domains[i], domains[j]] = [domains[j], domains[i]];
 }
 }

 // 🎯 50문제 분배: 36 시나리오 + 4 컨셉 비교 + 10 컨셉 탭 노드
 const THEMES_36 = [
   "cdn", "cdn", "cdn",
   "streaming", "streaming", "streaming",
   "autoscaling", "autoscaling", "autoscaling",
   "cost", "cost", "cost",
   "dr", "dr", "dr",
   "dbperf", "dbperf", "dbperf",
   "serverless", "serverless", "serverless",
   "network", "network", "network",
   "container", "container", "container",
   "analytics", "analytics", "analytics",
   "security", "security", "security",
   "compliance", "compliance", "compliance",
 ];
 // 14개 컨셉 비교 풀 → 매 시험마다 4개 랜덤 선택
 const CONCEPT_COMPARISON_POOL = [
   "concept_sqs", "concept_sns_sqs", "concept_storage", "concept_db",
   "concept_dynamodb", "concept_cache", "concept_compute", "concept_cdn",
   "concept_s3class", "concept_network", "concept_secg_nacl", "concept_iam",
   "concept_monitor", "concept_kinesis",
 ];
 const FOUR_CONCEPTS = [...CONCEPT_COMPARISON_POOL].sort(() => Math.random() - 0.5).slice(0, 4);
 // 10 concept_tab_node — concept tab 서비스 중심 문제 (시나리오 주제 강제 X)
 const TEN_CONCEPT_TAB_NODES = Array(10).fill("concept_tab_node");
 const THEMES_50 = [...THEMES_36, ...FOUR_CONCEPTS, ...TEN_CONCEPT_TAB_NODES];
 // shuffle
 for (let i = THEMES_50.length - 1; i > 0; i--) {
   const j = Math.floor(Math.random() * (i + 1));
   [THEMES_50[i], THEMES_50[j]] = [THEMES_50[j], THEMES_50[i]];
 }
 localStorage.setItem("mockExamThemes", JSON.stringify(THEMES_50));

 // 50개 서비스 세트 사전 할당 — Firebase에 9개 있으면 41개 새로, 0개면 50개 새로
 // 중복 방지를 위해 모든 새 슬롯이 usedSets 공유
 const CONCEPT_TAB_SERVICES = [
   "SCP", "GuardDuty", "Amazon Inspector", "Amazon Macie", "AWS Network Firewall",
   "AWS Certificate Manager", "S3 Object Lock",
   "Amazon EMR", "AWS Glue", "Amazon QuickSight", "Amazon SageMaker",
   "AWS CloudFormation", "AWS Config", "AWS Organizations", "AWS Backup",
   "AWS Trusted Advisor", "IAM Identity Center",
   "AWS DMS", "AWS Transfer Family", "AWS AppFlow",
   "NAT Gateway", "VPC Endpoints", "Transit Gateway", "AWS Global Accelerator",
   "Site-to-Site VPN", "VPC Peering",
   "AWS Snowcone", "AWS Snowball Edge Storage Optimized", "AWS Snowball Edge Compute Optimized",
   "AWS DataSync", "AWS Storage Gateway",
   "Public Subnet", "Private Subnet", "Internet Gateway", "Route Tables",
   "Security Groups", "Network ACLs", "VPC Flow Logs", "Bastion Host"
 ];
 const shuffledConcepts = [...CONCEPT_TAB_SERVICES].sort(() => Math.random() - 0.5);
 const conceptServices: (string[] | null)[] = new Array(50).fill(null);
 const usedSets = new Set<string>();
 const startSlot = existingProblems ? existingProblems.length : 0;
 const availableSlots = 50 - startSlot;

 if (availableSlots > 0) {
   let tabIdx = 0;

   // 1) 컨셉 비교 (concept_xxx) 슬롯 → 서비스 없음 (비교 문제는 시나리오/서비스 불필요)
   for (let i = startSlot; i < 50; i++) {
     const t = THEMES_50[i];
     if (t && t.startsWith("concept_") && t !== "concept_tab_node") {
       conceptServices[i] = []; // 서비스 미할당 — AI가 비교 주제만으로 문제 생성
     }
   }

   // 2) concept_tab_node 슬롯 (10개) → unique concept tab 서비스 우선 할당
   for (let i = startSlot; i < 50; i++) {
     if (THEMES_50[i] === "concept_tab_node" && tabIdx < shuffledConcepts.length) {
       const service = shuffledConcepts[tabIdx++];
       conceptServices[i] = [service];
       usedSets.add(service);
     }
   }

   // 3) 시나리오 (12 주제) 슬롯 36개 분배: 3개 슬롯 × 5서비스 + 10개 × 2서비스 + 23개 × 1서비스
   const scenarioSlots: number[] = [];
   for (let i = startSlot; i < 50; i++) {
     if (conceptServices[i] === null) scenarioSlots.push(i);
   }
   for (let i = scenarioSlots.length - 1; i > 0; i--) {
     const j = Math.floor(Math.random() * (i + 1));
     [scenarioSlots[i], scenarioSlots[j]] = [scenarioSlots[j], scenarioSlots[i]];
   }
   for (let idx = 0; idx < scenarioSlots.length; idx++) {
     const slotIdx = scenarioSlots[idx];
     const count = idx < 3 ? 5 : idx < 13 ? 2 : 1;
     if (count === 1 && tabIdx < shuffledConcepts.length) {
       const service = shuffledConcepts[tabIdx++];
       conceptServices[slotIdx] = [service];
       usedSets.add(service);
     } else {
       conceptServices[slotIdx] = selectServicesFromAnalysis(usedSets, count);
     }
   }
 }
 localStorage.setItem("mockExamConceptServices", JSON.stringify(conceptServices));

 // 2단계: 첫 1문제만 로드
 let problems = [];
 if (allProblems && allProblems.length > 0) {
 problems.push(allProblems[0]);
 } else {
 const difficulty = difficulties[0] as "medium" | "hard" | "challenge";
 const domain = domains[0] as "security" | "resilience" | "performance" | "cost-optimization";
 // 사전 할당된 unique 서비스 세트 사용 (중복 방지)
 const storedSets = localStorage.getItem("mockExamConceptServices");
 const firstSlot: any = storedSets ? JSON.parse(storedSets)[0] : null;
 const firstServices: string[] = firstSlot === null ? [] : (Array.isArray(firstSlot) ? firstSlot : [firstSlot]);
 // 사전 할당된 시나리오 주제 사용
 const storedThemes = localStorage.getItem("mockExamThemes");
 const firstTheme: string = storedThemes ? (JSON.parse(storedThemes)[0] || "concept") : "concept";
 const problem = await generateSAAProblem(firstServices, difficulty, locale, domain, firstTheme);
 problems.push(problem);
 allProblems = [problem];
 }

 setMockExamProblems(problems);
 setMockExamAnswers(new Array(50).fill(null));
 setMockExamStartTime(Date.now());
 setMockExamTimeRemaining(130 * 60);
 setMockExamCurrentIndex(0);
 setMockExamRunning(true);

 // localStorage에 저장 (백그라운드 로딩용)
 localStorage.setItem("mockExamDifficulties", JSON.stringify(difficulties));
 localStorage.setItem("mockExamDomains", JSON.stringify(domains));
 localStorage.setItem("mockExamProblemsCount", "1");
 localStorage.setItem("mockExamAllProblems", JSON.stringify(allProblems));
 // ✅ 시험 시작 시 언어 고정 (시험 중 언어 변경 방지)
 localStorage.setItem("mockExamStartedLocale", locale);

 // ✅ 오늘 시험 시작했음을 Firebase에 기록 (관리자 제외)
 if (auth.currentUser && !isAdmin) {
   await recordMockExamDate(auth.currentUser.uid);
   setMockExamAlreadyTaken(true);
 }

 } catch (err) {
 setError("모의시험 생성 실패");
 } finally {
 setLoading(false);
 }
 }}
 disabled={loading}
 style={{
 padding: "16px 32px",
 background: "rgba(59, 130, 246, 0.3)",
 border: "2px solid rgba(59, 130, 246, 0.6)",
 borderRadius: "8px",
 color: "var(--accent)",
 cursor: loading ? "not-allowed" : "pointer",
 fontSize: "16px",
 fontWeight: "bold",
 opacity: loading ? 0.6 : 1
 }}
 >
 {loading && <span className="loading-icon">⏳</span>}
 {loading ? t("btnGenerating") : t("mockExamStart")}
 </button>
 )}
 </div>
 )}
 </div>
 </>
 ) : tab === "posts" ? (
 <>
 <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px", height: "100%", overflowY: "auto" }}>
 {/* Header */}
 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
 <h2 style={{ fontSize: "18px", color: "#e2e8f0", margin: 0 }}>
 {t("tabPosts")} ({postsTotalCount})
 </h2>
 <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
 {/* Search */}
 <input
 type="text"
 placeholder={t("postsSearch")}
 value={postsSearch}
 onChange={(e) => {
 setPostsSearch(e.target.value);
 setPostsPage(1);
 }}
 style={{
 padding: "6px 12px",
 background: "#2A344A",
 border: "1px solid #2A344A",
 borderRadius: "6px",
 color: "#D1D5DB",
 fontSize: "12px",
 width: "150px"
 }}
 />
 {/* My Posts Toggle */}
 <button
 onClick={() => {
 setPostsFilterMine(!postsFilterMine);
 setPostsPage(1);
 }}
 style={{
 padding: "6px 12px",
 background: postsFilterMine ? "rgba(245,158,11,0.2)" : "#2A344A",
 border: postsFilterMine ? "1px solid rgba(245,158,11,0.4)" : "1px solid rgba(255,255,255,0.2)",
 borderRadius: "6px",
 color: postsFilterMine ? "#f59e0b" : "#D1D5DB",
 cursor: "pointer",
 fontSize: "12px",
 fontWeight: 600,
 whiteSpace: "nowrap"
 }}
 >
 {t("postsMine")}
 </button>
 {/* Write Button */}
 {userEmail && (
 <button
 onClick={() => setShowPostForm(true)}
 style={{
 padding: "6px 12px",
 background: "rgba(255,153,0,0.15)",
 border: "1px solid rgba(255,153,0,0.3)",
 borderRadius: "6px",
 color: "#a78bfa",
 cursor: "pointer",
 fontSize: "12px",
 fontWeight: 600,
 whiteSpace: "nowrap"
 }}
 >
 {t("postsWrite")}
 </button>
 )}
 </div>
 </div>

 {/* Posts List */}
 <div style={{ display: "flex", flexDirection: "column", gap: "12px", flex: 1 }}>
 {posts.length === 0 ? (
 <div style={{
 display: "flex",
 alignItems: "center",
 justifyContent: "center",
 height: "200px",
 color: "#64748b",
 fontSize: "14px"
 }}>
 {t("postsEmpty")}
 </div>
 ) : (
 posts.map((post) => (
 <div
 key={post.id}
 style={{
 background: "#151E32",
 border: "1px solid #2A344A",
 borderRadius: "8px",
 padding: "16px",
 display: "flex",
 gap: "12px",
 alignItems: "flex-start"
 }}
 >
 {/* Avatar */}
 <div style={{
 width: "40px",
 height: "40px",
 minWidth: "40px",
 borderRadius: "50%",
 background: "rgba(255,153,0,0.3)",
 display: "flex",
 alignItems: "center",
 justifyContent: "center",
 color: "#a78bfa",
 fontSize: "18px",
 fontWeight: 600
 }}>
 {post.authorName.charAt(0).toUpperCase()}
 </div>

 {/* Content */}
 <div style={{ flex: 1, minWidth: 0 }}>
 <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
 <span style={{
 fontSize: "11px",
 color: post.isPublic ? "#10b981" : "#ef4444",
 fontWeight: 600
 }}>
 {post.isPublic ? t("postsPublic") : t("postsSecret")}
 </span>
 </div>
 <div
 onClick={async () => {
 try {
 const user = getCurrentUser();
 await getPostById(post.id, user?.uid || "");
 } catch (error: any) {
 alert(error.message);
 }
 }}
 style={{
 fontSize: "14px",
 color: "#e2e8f0",
 fontWeight: 600,
 marginBottom: "6px",
 wordBreak: "break-word",
 cursor: "pointer"
 }}
 >
 {post.title}
 </div>
 <div
 style={{
 fontSize: "12px",
 color: "#D1D5DB",
 marginBottom: "8px",
 wordBreak: "break-word",
 lineHeight: "1.4"
 }}
 >
 {post.content && (post.content.length > 100 ? post.content.substring(0, 100) + "..." : post.content)}
 </div>
 <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "8px" }}>
 {t("postsAuthor")}: {post.authorName}
 </div>
 <div style={{ fontSize: "11px", color: "#64748b" }}>
 {new Date(post.createdAt).toLocaleDateString(locale === "en" ? "en-US" : locale === "ja" ? "ja-JP" : "ko-KR", {
 year: "numeric",
 month: "short",
 day: "numeric",
 hour: "2-digit",
 minute: "2-digit"
 })}
 </div>
 </div>

 {/* Menu */}
 {userEmail && getCurrentUser()?.uid === post.authorId && (
 <div style={{ position: "relative" }}>
 <button
 onClick={() => {
 if (confirm(t("postsDeleteConfirm"))) {
 (async () => {
 try {
 await deletePost(post.id, getCurrentUser()!.uid);
 setPostsPage(1);
 const result = await getPosts(1, 20, postsSearch, postsFilterMine ? getCurrentUser()?.uid : "", getCurrentUser()?.uid || "");
 setPosts(result.posts);
 setPostsTotalCount(result.totalCount);
 } catch (error: any) {
 alert(error.message);
 }
 })();
 }
 }}
 style={{
 background: "transparent",
 border: "none",
 color: "#D1D5DB",
 cursor: "pointer",
 fontSize: "18px",
 padding: "4px"
 }}
 >
 ⋮
 </button>
 </div>
 )}
 </div>
 ))
 )}
 </div>

 {/* Pagination */}
 {postsTotalCount > 20 && (
 <div style={{
 display: "flex",
 justifyContent: "center",
 alignItems: "center",
 gap: "8px",
 paddingTop: "12px",
 borderTop: "1px solid #2A344A"
 }}>
 <button
 onClick={() => setPostsPage(p => Math.max(1, p - 1))}
 disabled={postsPage === 1}
 style={{
 padding: "4px 8px",
 background: postsPage === 1 ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.1)",
 border: "1px solid #2A344A",
 borderRadius: "4px",
 color: postsPage === 1 ? "#475569" : "#D1D5DB",
 cursor: postsPage === 1 ? "not-allowed" : "pointer",
 fontSize: "12px"
 }}
 >
 ← {locale === "en" ? "Prev" : locale === "ja" ? "前へ" : "이전"}
 </button>
 <span style={{ fontSize: "12px", color: "#D1D5DB" }}>
 {postsPage} / {Math.ceil(postsTotalCount / 20)}
 </span>
 <button
 onClick={() => setPostsPage(p => p + 1)}
 disabled={postsPage >= Math.ceil(postsTotalCount / 20)}
 style={{
 padding: "4px 8px",
 background: postsPage >= Math.ceil(postsTotalCount / 20) ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.1)",
 border: "1px solid #2A344A",
 borderRadius: "4px",
 color: postsPage >= Math.ceil(postsTotalCount / 20) ? "#475569" : "#D1D5DB",
 cursor: postsPage >= Math.ceil(postsTotalCount / 20) ? "not-allowed" : "pointer",
 fontSize: "12px"
 }}
 >
 {locale === "en" ? "Next" : locale === "ja" ? "次へ" : "다음"} →
 </button>
 </div>
 )}
 </div>
 </>
 ) : tab === "users" ? (
 <>
 {/* Users Sessions Panel */}
 <div className="graph-label"> PDF 파일</div>
 <div style={{
 display: "flex",
 flexDirection: "column",
 height: "100%",
 gap: "12px",
 padding: "16px",
 overflow: "auto"
 }}>
 {!selectedUser ? (
 <div style={{
 display: "flex",
 alignItems: "center",
 justifyContent: "center",
 height: "100%",
 color: "#64748b",
 fontSize: "13px",
 textAlign: "center"
 }}>
 왼쪽에서 사용자를 선택하면<br/>PDF 파일이 표시됩니다
 </div>
 ) : selectedUserSessions.length === 0 ? (
 <div style={{
 display: "flex",
 alignItems: "center",
 justifyContent: "center",
 height: "100%",
 color: "#64748b",
 fontSize: "13px"
 }}>
 생성된 PDF가 없습니다
 </div>
 ) : (
 <div style={{
 display: "flex",
 flexDirection: "column",
 gap: "12px",
 height: "100%"
 }}>
 {/* 일괄 다운로드 버튼 */}
 {selectedUserSessions.length > 0 && (
 <button
 onClick={async () => {
 for (let i = 0; i < selectedUserSessions.length; i++) {
 await generatePDF(selectedUserSessions[i]);
 // 다음 다운로드 전 0.5초 딜레이
 await new Promise(resolve => setTimeout(resolve, 500));
 }
 }}
 style={{
 padding: "10px 16px",
 background: "rgba(255,153,0,0.15)",
 border: "1px solid rgba(255,153,0,0.3)",
 borderRadius: "6px",
 color: "var(--accent)",
 cursor: "pointer",
 fontSize: "12px",
 fontWeight: 600,
 transition: "all 0.2s"
 }}
 onMouseEnter={(e) => {
 e.currentTarget.style.background = "rgba(255,153,0,0.2)";
 e.currentTarget.style.borderColor = "rgba(255,153,0,0.5)";
 }}
 onMouseLeave={(e) => {
 e.currentTarget.style.background = "rgba(255,153,0,0.15)";
 e.currentTarget.style.borderColor = "rgba(255,153,0,0.3)";
 }}
 >
 전체 PDF 다운로드 ({selectedUserSessions.length}개)
 </button>
 )}

 {/* 세션 목록 */}
 <div style={{
 display: "flex",
 flexDirection: "column",
 gap: "8px",
 overflow: "auto",
 flex: 1
 }}>
 {selectedUserSessions.map((session, idx) => (
 <div
 key={idx}
 style={{
 background: "#2A344A",
 border: "1px solid rgba(255,255,255,0.1)",
 borderRadius: "6px",
 padding: "12px",
 cursor: "pointer",
 transition: "all 0.2s"
 }}
 onMouseEnter={(e) => {
 e.currentTarget.style.background = "rgba(255,255,255,0.12)";
 }}
 onMouseLeave={(e) => {
 e.currentTarget.style.background = "#2A344A";
 }}
 >
 <div style={{
 display: "flex",
 justifyContent: "space-between",
 alignItems: "start",
 marginBottom: "8px"
 }}>
 <div>
 <div style={{
 fontSize: "12px",
 fontWeight: 600,
 color: "#D1D5DB"
 }}>
 {session.date} {session.time}
 </div>
 <div style={{
 fontSize: "11px",
 color: "#D1D5DB",
 marginTop: "4px"
 }}>
 문제 수: {session.problemCount}개
 </div>
 </div>
 <div style={{
 fontSize: "10px",
 background: session.difficulty === "medium"
 ? "rgba(249,115,22,0.2)"
 : session.difficulty === "hard"
 ? "rgba(239,68,68,0.2)"
 : "rgba(168,85,247,0.2)",
 color: session.difficulty === "medium"
 ? "#fb923c"
 : session.difficulty === "hard"
 ? "#ef4444"
 : "#d8b4fe",
 padding: "4px 8px",
 borderRadius: "4px",
 fontWeight: 600
 }}>
 {session.difficulty === "medium" ? t("diffMediumLabel") : session.difficulty === "hard" ? t("diffHardLabel") : t("diffChallengeLabel")}
 </div>
 </div>
 <div style={{
 fontSize: "10px",
 color: "#64748b"
 }}>
 {t("sessionDetailsView").replace("{n}", session.problemCount.toString())}
 </div>
 </div>
 ))}
 </div>
 </div>
 )}
 </div>
 </>
 ) : (
 <>
 <div className="graph-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
 <span>{t("graphLabel")}</span>
 {!selected && (
 <span style={{
 fontSize: '11px',
 color: 'var(--accent)',
 fontFamily: 'ui-monospace, monospace',
 letterSpacing: '0.05em',
 padding: '4px 10px',
 background: 'rgba(255, 153, 0, 0.1)',
 border: '1px solid rgba(255, 153, 0, 0.25)',
 borderRadius: '6px',
 whiteSpace: 'nowrap'
 }}>{t("graphHintClickNode")}</span>
 )}
 </div>
 <div className="graph-box">
 <GraphSVG pos={pos} setPos={setPos} posRef={posRef} dragRef={dragRef} pan={pan} setPan={setPan} zoom={zoom} setZoom={setZoom}
 selected={selected} slots={slots} onNodeClick={onNodeClick} catFilter={catFilter} theme={theme} />
 </div>
 </>
 )}
 </div>
 )}

 {/* 시험 시작일 설정 모달 */}
 <ExamDateModal
 open={showExamDateModal}
 onClose={() => setShowExamDateModal(false)}
 onSaved={() => setDday(getExamDday())}
 />

 {/* Firebase 로그인/회원가입 모달 */}
 {renderLoginModal()}

 {/* Cognito 회원가입 모달 (디자인은 기존 톤) */}
 <CognitoSignupModal
   isOpen={showCognitoSignup}
   onClose={() => setShowCognitoSignup(false)}
   onSuccess={(email) => {
     setShowCognitoSignup(false);
     setUserEmail(email);
     setEmailVerified(true);
     setUserStatusLocal("loggedIn");
     localStorage.setItem("userEmail", email);
     localStorage.setItem("userStatus", "loggedIn");
   }}
 />

 {/* Cognito 로그인 모달 */}
 <CognitoLoginModal
   isOpen={showCognitoLogin}
   onClose={() => setShowCognitoLogin(false)}
   onSuccess={(email) => {
     setShowCognitoLogin(false);
     setUserEmail(email);
     setEmailVerified(true);
     setUserStatusLocal("loggedIn");
     localStorage.setItem("userEmail", email);
     localStorage.setItem("userStatus", "loggedIn");
   }}
   onSwitchToSignup={() => {
     setShowCognitoLogin(false);
     setShowCognitoSignup(true);
   }}
 />

 {/* 이메일 검증 모달 */}
 {renderEmailVerificationModal()}

 {/* 할당량 초과 알림 모달 */}
 <QuotaModal
 open={showAuthModal}
 userStatus={userStatus}
 onClose={() => setShowAuthModal(false)}
 onLoginAsLoggedIn={() => {
 setUserStatus("loggedIn");
 setUserStatusLocal("loggedIn");
 setDailyCount(0);
 localStorage.setItem("problemCountDate", new Date().toISOString().split("T")[0]);
 localStorage.setItem("problemCount", "0");
 setShowAuthModal(false);
 }}
 onCheckout={async () => {
 try {
 const backendBaseUrl = resolveBackendUrl();
 const response = await fetch(`${backendBaseUrl}/api/lemonsqueezy/checkout`, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 email: userEmail,
 returnUrl: window.location.href
 })
 });
 const data = await response.json();
 if (data.checkoutUrl) {
 window.location.href = data.checkoutUrl;
 }
 } catch (error) {
 console.error('Checkout error:', error);
 alert('결제 페이지를 열 수 없습니다.');
 }
 }}
 />

 {/* Payment Modal */}
 {renderPaymentModal()}

 {/* Write Post Modal */}
 <PostFormModal
 open={showPostForm}
 onClose={() => setShowPostForm(false)}
 userEmail={userEmail}
 onSubmitted={async () => {
 setPostsPage(1);
 const user = getCurrentUser();
 const result = await getPosts(1, 20, postsSearch, postsFilterMine ? user?.uid : "", user?.uid || "");
 setPosts(result.posts);
 setPostsTotalCount(result.totalCount);
 }}
 />
 </div>

 {/* Footer */}
 <Footer />

 {/* Cookie Consent */}
 <CookieConsent />

 {/* Quiz Intro Modal - 퀴즈 탭 최초 진입 시 표시 (3단계) */}
 {showQuizIntroModal && (() => {
   const steps = [
     {
       title: "서비스를 조합하면 문제가 나와요",
       desc: "공부하고 싶은 AWS 서비스 2~4개를 골라보세요. 그 서비스들이 실제 아키텍처에서 어떻게 쓰이는지 시나리오 문제로 만들어 드려요.",
     },
     {
       title: "관계도로 서비스 연결을 배우세요",
       desc: "노드를 탭하면 관련 서비스만 밝아져요. \"VPC를 탭하면 EC2·RDS·Lambda가 하이라이트되는\" 방식으로 전체 그림을 잡을 수 있어요.",
     },
     {
       title: "매일 조금씩, 꾸준히 합격까지",
       desc: "매일 꾸준히 하면 약점이 자동으로 분석되고, 합격까지 갈 길이 보입니다. 지금 바로 시작해보세요.",
     },
   ];
   const current = steps[quizIntroStep];
   const isLast = quizIntroStep === steps.length - 1;
   const close = () => {
     setShowQuizIntroModal(false);
     setQuizIntroStep(0);
     if (quizIntroDontShowToday) {
       // 체크됨 → 24시간 후 다시 노출
       localStorage.setItem("quizIntroHideUntil", String(Date.now() + 24 * 60 * 60 * 1000));
       localStorage.removeItem("quizIntroModalSeen");
     } else {
       // 기본 → 영구 숨김
       localStorage.setItem("quizIntroModalSeen", "true");
     }
     setQuizIntroDontShowToday(false);
   };
   const next = () => {
     if (isLast) close();
     else setQuizIntroStep(quizIntroStep + 1);
   };

   return (
     <div
       onClick={close}
       style={{
         position: 'fixed',
         inset: 0,
         background: 'rgba(10, 14, 26, 0.85)',
         backdropFilter: 'blur(8px)',
         WebkitBackdropFilter: 'blur(8px)',
         zIndex: 10000,
         display: 'flex',
         alignItems: 'center',
         justifyContent: 'center',
         padding: '20px',
         animation: 'fadeIn 0.25s ease'
       }}
     >
       <div
         onClick={(e) => e.stopPropagation()}
         style={{
           background: '#151c30',
           border: '1px solid rgba(255, 255, 255, 0.14)',
           borderRadius: '20px',
           padding: '32px 28px',
           width: '100%',
           maxWidth: '480px',
           boxShadow: '0 20px 60px -20px rgba(0, 0, 0, 0.5)'
         }}
       >
         {/* Step Dots */}
         <div style={{
           display: 'flex',
           justifyContent: 'center',
           gap: '6px',
           marginBottom: '20px'
         }}>
           {steps.map((_, i) => (
             <span key={i} style={{
               width: i === quizIntroStep ? '20px' : '6px',
               height: '6px',
               borderRadius: i === quizIntroStep ? '3px' : '50%',
               background: i === quizIntroStep ? '#ff9900' : 'rgba(255, 255, 255, 0.14)',
               transition: 'all 0.2s'
             }} />
           ))}
         </div>

         {/* Visual - 스텝별 */}
         <div style={{
           background: '#0a0e1a',
           border: '1px solid rgba(255, 255, 255, 0.08)',
           borderRadius: '12px',
           padding: '28px 24px',
           marginBottom: '24px',
           minHeight: '140px',
           display: 'grid',
           placeItems: 'center'
         }}>
           {quizIntroStep === 0 && (
             <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
               <div style={{
                 width: '44px', height: '44px',
                 background: '#ff9900',
                 borderRadius: '8px',
                 display: 'grid', placeItems: 'center',
                 fontFamily: 'ui-monospace, monospace',
                 fontSize: '11px', fontWeight: 700,
                 color: 'white'
               }}>EC2</div>
               <span style={{ color: '#6b7389', fontSize: '20px' }}>+</span>
               <div style={{
                 width: '44px', height: '44px',
                 background: '#3b82f6',
                 borderRadius: '8px',
                 display: 'grid', placeItems: 'center',
                 fontFamily: 'ui-monospace, monospace',
                 fontSize: '11px', fontWeight: 700,
                 color: 'white'
               }}>S3</div>
               <span style={{ color: '#ff9900', fontSize: '22px' }}>→</span>
               <div style={{
                 width: '44px', height: '44px',
                 background: '#ff9900',
                 color: '#0a0e1a',
                 borderRadius: '8px',
                 display: 'grid', placeItems: 'center',
                 fontWeight: 700,
                 fontSize: '22px'
               }}>?</div>
             </div>
           )}
           {quizIntroStep === 1 && (
             <div style={{ textAlign: 'center' }}>
               <div style={{ fontSize: '32px', marginBottom: '8px' }}>✦</div>
               <div style={{
                 fontSize: '12px',
                 color: '#6b7389',
                 fontFamily: 'ui-monospace, monospace',
                 letterSpacing: '0.1em'
               }}>TAP · HIGHLIGHT · LEARN</div>
             </div>
           )}
           {quizIntroStep === 2 && (
             <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
               <div style={{
                 width: '44px', height: '44px',
                 background: '#ff9900',
                 color: '#0a0e1a',
                 borderRadius: '8px',
                 display: 'grid', placeItems: 'center',
                 fontWeight: 700,
                 fontSize: '22px'
               }}>✓</div>
               <span style={{ color: '#ff9900', fontSize: '22px' }}>→</span>
               <div style={{
                 padding: '10px 16px',
                 background: '#34d399',
                 color: '#0a0e1a',
                 borderRadius: '8px',
                 fontFamily: 'ui-monospace, monospace',
                 fontSize: '14px',
                 fontWeight: 700
               }}>PASS</div>
             </div>
           )}
         </div>

         {/* Title */}
         <h3 style={{
           fontSize: '22px',
           fontWeight: 700,
           color: '#f4f6fb',
           margin: 0,
           marginBottom: '10px',
           letterSpacing: '-0.01em',
           lineHeight: 1.3
         }}>{current.title}</h3>

         {/* Description */}
         <p style={{
           fontSize: '14px',
           color: '#a8b0c2',
           lineHeight: 1.6,
           margin: 0,
           marginBottom: '24px'
         }}>{current.desc}</p>

         {/* "오늘 하루 안보기" 체크박스 */}
         <label style={{
           display: 'flex',
           alignItems: 'center',
           gap: '8px',
           marginBottom: '16px',
           fontSize: '13px',
           color: '#a8b0c2',
           cursor: 'pointer',
           userSelect: 'none'
         }}>
           <input
             type="checkbox"
             checked={quizIntroDontShowToday}
             onChange={(e) => setQuizIntroDontShowToday(e.target.checked)}
             style={{
               width: '16px',
               height: '16px',
               cursor: 'pointer',
               accentColor: '#ff9900'
             }}
           />
           <span>오늘 하루 안보기</span>
         </label>

         {/* Buttons */}
         <div style={{ display: 'flex', gap: '10px' }}>
           <button
             onClick={close}
             style={{
               flex: 1,
               padding: '14px',
               borderRadius: '10px',
               background: 'transparent',
               color: '#a8b0c2',
               border: '1px solid rgba(255, 255, 255, 0.12)',
               fontSize: '14px',
               fontWeight: 600,
               cursor: 'pointer',
               fontFamily: 'inherit',
               transition: 'all 0.15s'
             }}
           >건너뛰기</button>
           <button
             onClick={next}
             style={{
               flex: 1,
               padding: '14px',
               borderRadius: '10px',
               background: '#ff9900',
               color: '#0a0e1a',
               border: 'none',
               fontSize: '14px',
               fontWeight: 700,
               cursor: 'pointer',
               fontFamily: 'inherit',
               transition: 'all 0.15s'
             }}
           >{isLast ? '시작하기' : '다음'}</button>
         </div>
       </div>
     </div>
   );
 })()}
 </div>
  );
}

export default App;
