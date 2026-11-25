import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "BudgetIQ — AI moliyaviy yordamchi";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "linear-gradient(135deg, #04120e 0%, #06251c 55%, #0b3a2c 100%)",
          color: "#ecfdf5",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 64,
              height: 64,
              borderRadius: 18,
              background: "linear-gradient(135deg, #34d399, #0d9488)",
            }}
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 15.5 9 10l3.4 3.4L20 5"
                stroke="#052e22"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M15.5 5H20v4.5"
                stroke="#052e22"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div style={{ display: "flex", fontSize: 34, fontWeight: 700, letterSpacing: -1 }}>
            Budget<span style={{ color: "#34d399" }}>IQ</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              display: "flex",
              fontSize: 66,
              fontWeight: 700,
              letterSpacing: -2.5,
              lineHeight: 1.1,
              maxWidth: 940,
            }}
          >
            Moliyangizni nazorat qiling — AI yordamida.
          </div>
          <div style={{ display: "flex", fontSize: 28, color: "#9fe8cd", maxWidth: 900 }}>
            Tranzaksiyalar · Byudjetlar · Analitika · AI maslahatchi · CSV eksport
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 24, color: "#6ee7b7" }}>
          <span>budgetiq.app</span>
          <span style={{ color: "#134e3a" }}>•</span>
          <span>{"O'zbek · Rus · Ingliz"}</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
