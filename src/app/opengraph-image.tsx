import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt =
  "Tidote Atelier — the anTIDOTE to mediocrity. Made-to-measure streetstyle.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Brand tokens, mirrored from globals.css. Satori resolves no CSS variables,
// so the values are inlined here rather than referenced.
const CREAM = "#f7f4ef";
const INK = "#221e19";
const INK_SOFT = "#655c4e";
const LINE = "#c9bfae";

export default async function Image() {
  const dir = join(process.cwd(), "src", "app", "_og");
  const [playfair, logo] = await Promise.all([
    readFile(join(dir, "playfair-700.ttf")),
    readFile(join(dir, "logo.png")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: CREAM,
          fontFamily: "Playfair Display",
        }}
      >
        {/* Inset keyline, echoing the framed media on the site itself. */}
        <div
          style={{
            position: "absolute",
            top: 40,
            left: 40,
            right: 40,
            bottom: 40,
            border: `2px solid ${LINE}`,
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 56 }}>
          <img
            width={220}
            height={220}
            src={`data:image/png;base64,${logo.toString("base64")}`}
            style={{ objectFit: "contain" }}
          />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 92, color: INK, lineHeight: 1.1 }}>
              TIDOTE
            </div>
            <div
              style={{
                fontSize: 30,
                color: INK_SOFT,
                letterSpacing: 14,
                marginTop: 4,
              }}
            >
              ATELIER
            </div>
            <div
              style={{
                marginTop: 28,
                paddingTop: 24,
                borderTop: `2px solid ${LINE}`,
                fontSize: 26,
                color: INK_SOFT,
                maxWidth: 520,
                lineHeight: 1.4,
              }}
            >
              The anTIDOTE to mediocrity — made-to-measure streetstyle.
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Playfair Display", data: playfair, weight: 700, style: "normal" },
      ],
    },
  );
}
