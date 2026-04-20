import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Webhook Replay Toolkit";
export const size = {
  width: 1200,
  height: 630
};
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px",
          background:
            "radial-gradient(circle at 80% 20%, rgba(34, 211, 238, 0.45), transparent 45%), linear-gradient(145deg, #0d1117 0%, #12263a 40%, #0d1117 100%)",
          color: "#e6edf3"
        }}
      >
        <div
          style={{
            fontSize: 24,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#7dd3fc"
          }}
        >
          Webhook Replay Toolkit
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.06 }}>
            Capture once.
            <br />
            Replay forever.
          </div>
          <div style={{ fontSize: 30, color: "#cbd5e1", maxWidth: "85%" }}>
            Preserve real Stripe, Shopify, and GitHub webhook requests and replay
            them against localhost or staging on demand.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 24,
            color: "#94a3b8"
          }}
        >
          <span>webhook-replay-toolkit</span>
          <span>$15/mo</span>
        </div>
      </div>
    ),
    {
      ...size
    }
  );
}
