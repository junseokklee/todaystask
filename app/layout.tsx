import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "시간별 업무 스케줄러",
  description: "원형 시간표 업무 관리 앱",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="ko">
      <body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: "#f3f4f6",
          color: "#111827", // 🔥 글자색 강제 지정 (거의 검정)
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          minHeight: "100vh",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "900px",
            padding: "40px 20px",
          }}
        >
          {children}
        </div>
      </body>
    </html>
  );
}