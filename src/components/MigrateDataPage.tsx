// 일회성 Firebase → PostgreSQL 데이터 마이그레이션 페이지
// -----------------------------------------------------------------
// 접근: http://localhost:3000/#migrate-data
// 흐름:
//   1) Firestore Security Rules 임시 변경 (public read 허용)
//   2) 이 페이지에서 "Migrate" 클릭
//   3) Firebase 에서 pastExams_ko/en/ja 모두 읽음
//   4) backend /api/migrate-firebase-to-pg 로 전송 → PostgreSQL INSERT
//   5) 끝나면 Rules 원복

import React, { useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";

const styles: Record<string, React.CSSProperties> = {
  container: {
    fontFamily: "-apple-system, sans-serif",
    maxWidth: 800,
    margin: "40px auto",
    padding: 24,
    background: "#0F1629",
    color: "#e8e8e8",
    minHeight: "100vh",
  },
  button: {
    background: "#FF9900",
    color: "#000",
    border: "none",
    padding: "12px 24px",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: 14,
    marginRight: 8,
    marginBottom: 8,
  },
  log: {
    background: "#000",
    padding: 12,
    borderRadius: 6,
    fontFamily: "Consolas, monospace",
    fontSize: 12,
    whiteSpace: "pre-wrap",
    maxHeight: 400,
    overflow: "auto",
    marginTop: 16,
  },
};

export function MigrateDataPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [running, setRunning] = useState(false);

  const log = (msg: string) => {
    const ts = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${ts}] ${msg}`]);
  };

  const migratePastExams = async (locale: "ko" | "en" | "ja") => {
    setRunning(true);
    log(`▶ pastExams_${locale} 마이그레이션 시작...`);

    try {
      // 1. Firebase 에서 모두 읽기
      const collectionName = `pastExams_${locale}`;
      const q = query(collection(db, collectionName), orderBy("order"));
      const snap = await getDocs(q);
      log(`  📥 Firebase 에서 ${snap.size} 문서 가져옴`);

      if (snap.empty) {
        log(`  (no documents to migrate)`);
        setRunning(false);
        return;
      }

      const items = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));

      // 2. backend 로 전송
      const backendUrl = "http://localhost:5000";
      const res = await fetch(`${backendUrl}/api/migrate-firebase-to-pg`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "pastExams", locale, items }),
      });

      if (!res.ok) {
        const err = await res.json();
        log(`  ❌ Backend error: ${JSON.stringify(err)}`);
      } else {
        const data = await res.json();
        log(`  ✅ ${locale}: ${data.migrated} 건 PostgreSQL 에 INSERT 완료`);
      }
    } catch (err: any) {
      log(`  ❌ Error: ${err?.message || err}`);
    } finally {
      setRunning(false);
    }
  };

  const migrateAll = async () => {
    await migratePastExams("ko");
    await migratePastExams("en");
    await migratePastExams("ja");
    log("===== 모든 마이그레이션 완료 =====");
  };

  return (
    <div style={styles.container}>
      <h1 style={{ color: "#FF9900" }}>🔄 Firebase → PostgreSQL Migration</h1>

      <p style={{ color: "#D1D5DB", fontSize: 13, lineHeight: 1.6 }}>
        <strong>사전 조건:</strong>
        <br />
        Firebase 콘솔에서 <code>pastExams_*</code> 컬렉션을 public read 허용으로 임시 변경.
        <br />
        마이그레이션 끝나면 Rules 원복하세요.
      </p>

      <div style={{ marginTop: 24 }}>
        <button
          style={styles.button}
          disabled={running}
          onClick={() => migratePastExams("ko")}
        >
          pastExams_ko 마이그레이션
        </button>
        <button
          style={styles.button}
          disabled={running}
          onClick={() => migratePastExams("en")}
        >
          pastExams_en 마이그레이션
        </button>
        <button
          style={styles.button}
          disabled={running}
          onClick={() => migratePastExams("ja")}
        >
          pastExams_ja 마이그레이션
        </button>
        <button
          style={{ ...styles.button, background: "#22c55e" }}
          disabled={running}
          onClick={migrateAll}
        >
          ▶ 전부 실행
        </button>
      </div>

      <div style={styles.log}>
        {logs.length === 0 ? "(no logs yet)" : logs.join("\n")}
      </div>
    </div>
  );
}
