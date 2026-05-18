"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="ko">
      <body>
        <main
          style={{
            alignItems: "center",
            background: "#f8fafc",
            color: "#0f172a",
            display: "flex",
            fontFamily: "Pretendard, Inter, system-ui, sans-serif",
            justifyContent: "center",
            minHeight: "100vh",
            padding: "24px",
          }}
        >
          <section
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
              maxWidth: "520px",
              padding: "24px",
              width: "100%",
            }}
          >
            <p style={{ color: "#0f766e", fontSize: "12px", fontWeight: 700, margin: 0 }}>
              POMR Coach
            </p>
            <h1 style={{ fontSize: "24px", margin: "12px 0 0" }}>앱을 다시 불러오지 못했습니다.</h1>
            <p style={{ color: "#475569", fontSize: "14px", lineHeight: 1.6, margin: "12px 0 0" }}>
              일시적인 오류일 수 있습니다. 다시 시도하거나 Case Library로 돌아가 주세요.
            </p>
            {error.digest ? (
              <p style={{ background: "#f1f5f9", borderRadius: "6px", color: "#475569", fontSize: "12px", margin: "16px 0 0", padding: "8px 10px" }}>
                Error digest: {error.digest}
              </p>
            ) : null}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "20px" }}>
              <button
                type="button"
                onClick={() => unstable_retry()}
                style={{
                  background: "#0f766e",
                  border: 0,
                  borderRadius: "8px",
                  color: "#ffffff",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 600,
                  padding: "10px 14px",
                }}
              >
                다시 시도
              </button>
              <button
                type="button"
                onClick={() => window.location.assign("/cases")}
                style={{
                  background: "#ccfbf1",
                  border: 0,
                  borderRadius: "8px",
                  color: "#0f766e",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 600,
                  padding: "10px 14px",
                }}
              >
                Case Library로 이동
              </button>
            </div>
          </section>
        </main>
      </body>
    </html>
  );
}
