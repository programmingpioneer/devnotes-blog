import { ImageResponse } from "next/og";
import { siteConfig } from "@/content/config";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") ?? siteConfig.title;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background: "#0d0d0d",
          color: "#f7f7f7",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 28,
            color: "#8a8a8a",
            letterSpacing: "0.05em",
          }}
        >
          {siteConfig.title.toUpperCase()}
        </div>

        <div
          style={{
            fontSize: 72,
            fontWeight: 600,
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            display: "flex",
          }}
        >
          {title.length > 90 ? `${title.slice(0, 90)}…` : title}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 22,
            color: "#8a8a8a",
          }}
        >
          <span>{siteConfig.author.name}</span>
          <span>{siteConfig.url.replace(/^https?:\/\//, "")}</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}