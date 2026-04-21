import { useChat } from "@ai-sdk/react";
import { useRef, useEffect, useState } from "react";
import ProjectCard from "./generative/ProjectCard";
import MetricsPanel from "./generative/MetricsPanel";
import TimelineView from "./generative/TimelineView";
import TechStack from "./generative/TechStack";
import ContactCard from "./generative/ContactCard";

type ToolName =
  | "show_project"
  | "show_metrics"
  | "show_timeline"
  | "show_tech_stack"
  | "show_contact";

const PRESETS = [
  { label: "WHAT HAVE YOU BUILT?", msg: "What have you built?" },
  { label: "SHOW METRICS", msg: "Show me your metrics and stats" },
  { label: "TECH STACK?", msg: "What is your tech stack?" },
  { label: "TELL ME ABOUT ARCHON", msg: "Tell me about Archon" },
  { label: "HOW TO CONTACT YOU?", msg: "How can I contact you?" },
];

function renderTool(name: string, args: Record<string, unknown>) {
  if (name === "show_project")
    return (
      <ProjectCard
        project={(args.project as "archon" | "aether" | "axon") ?? "archon"}
      />
    );
  if (name === "show_metrics") return <MetricsPanel />;
  if (name === "show_timeline") return <TimelineView />;
  if (name === "show_tech_stack") return <TechStack />;
  if (name === "show_contact") return <ContactCard />;
  return null;
}

export default function AIPanel() {
  const [open, setOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const [offline, setOffline] = useState(false);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    append,
    isLoading,
    setMessages,
  } = useChat({
    api: "/api/chat",
    onError: () => setOffline(true),
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendPreset = (msg: string) => {
    append({ role: "user", content: msg });
  };

  const isEmpty = messages.length === 0;

  return (
    <>
      {/* Floating trigger */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Open intelligence briefing"
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 9000,
          width: "48px",
          height: "48px",
          background: open ? "#00F0FF" : "#0e0e0e",
          border: "1px solid rgba(0,240,255,0.4)",
          cursor: "crosshair",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background 0.15s, box-shadow 0.15s",
          boxShadow: open
            ? "0 0 20px rgba(0,240,255,0.4)"
            : "0 0 8px rgba(0,240,255,0.15)",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          {open ? (
            <path
              d="M4 4L16 16M16 4L4 16"
              stroke={open ? "#0e0e0e" : "#00F0FF"}
              strokeWidth="1.5"
              strokeLinecap="square"
            />
          ) : (
            <>
              <circle cx="10" cy="10" r="3" fill="#00F0FF" />
              <path
                d="M10 2V5M10 15V18M2 10H5M15 10H18"
                stroke="#00F0FF"
                strokeWidth="1.5"
                strokeLinecap="square"
              />
              <path
                d="M4.93 4.93L6.96 6.96M13.04 13.04L15.07 15.07M15.07 4.93L13.04 6.96M6.96 13.04L4.93 15.07"
                stroke="rgba(0,240,255,0.4)"
                strokeWidth="1"
                strokeLinecap="square"
              />
            </>
          )}
        </svg>
      </button>

      {/* Drawer */}
      <div
        style={{
          position: "fixed",
          right: 0,
          top: 0,
          bottom: 0,
          width: "380px",
          maxWidth: "100vw",
          zIndex: 8999,
          background: "#0e0e0e",
          borderLeft: "1px solid rgba(0,240,255,0.15)",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px",
            borderBottom: "1px solid rgba(59,73,75,0.3)",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <span
                style={{
                  fontFamily: "'Space Grotesk', monospace",
                  fontSize: "9px",
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  color: "#00F0FF",
                  display: "block",
                }}
              >
                ARTIFACT // INTELLIGENCE BRIEFING
              </span>
              <span
                style={{
                  fontFamily: "'Space Grotesk', monospace",
                  fontSize: "7px",
                  letterSpacing: "0.15em",
                  color: "#849495",
                }}
              >
                SUBJECT: AHMED TAHA · CAIRO, EGYPT
              </span>
            </div>
            <button
              onClick={() => setMessages([])}
              title="Clear session"
              style={{
                background: "none",
                border: "none",
                cursor: "crosshair",
                color: "#3B494B",
                fontFamily: "'Space Grotesk', monospace",
                fontSize: "7px",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                padding: "4px 6px",
              }}
            >
              CLR
            </button>
          </div>
        </div>

        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "12px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            scrollbarWidth: "thin",
            scrollbarColor: "#00F0FF transparent",
          }}
        >
          {offline && (
            <div style={{ marginTop: "24px", textAlign: "center" }}>
              <span
                style={{
                  fontFamily: "'Space Grotesk', monospace",
                  fontSize: "9px",
                  letterSpacing: "0.2em",
                  color: "#3B494B",
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                [SIGNAL_LOST]
              </span>
              <span
                style={{
                  fontFamily: "'Space Grotesk', monospace",
                  fontSize: "8px",
                  letterSpacing: "0.15em",
                  color: "#849495",
                  display: "block",
                  marginBottom: "12px",
                }}
              >
                INTELLIGENCE BRIEFING OFFLINE
              </span>
              <button
                onClick={() => {
                  setOffline(false);
                  setMessages([]);
                }}
                style={{
                  background: "none",
                  border: "1px solid rgba(0,240,255,0.2)",
                  padding: "6px 14px",
                  cursor: "crosshair",
                  fontFamily: "'Space Grotesk', monospace",
                  fontSize: "8px",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "#00F0FF",
                }}
              >
                RETRY CONNECTION
              </button>
            </div>
          )}

          {isEmpty && !offline && (
            <div style={{ marginTop: "8px" }}>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "11px",
                  color: "#849495",
                  lineHeight: 1.6,
                  marginBottom: "16px",
                }}
              >
                Query the dossier. Ask about projects, metrics, stack, or
                contact.
              </p>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "4px" }}
              >
                {PRESETS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => sendPreset(p.msg)}
                    style={{
                      background: "transparent",
                      border: "1px solid rgba(59,73,75,0.3)",
                      padding: "8px 12px",
                      textAlign: "left",
                      cursor: "crosshair",
                      fontFamily: "'Space Grotesk', monospace",
                      fontSize: "8px",
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      color: "#849495",
                      transition: "color 0.1s, border-color 0.1s",
                    }}
                    onMouseEnter={(e) => {
                      (e.target as HTMLButtonElement).style.color = "#00F0FF";
                      (e.target as HTMLButtonElement).style.borderColor =
                        "rgba(0,240,255,0.3)";
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLButtonElement).style.color = "#849495";
                      (e.target as HTMLButtonElement).style.borderColor =
                        "rgba(59,73,75,0.3)";
                    }}
                  >
                    &gt; {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) => (
            <div key={m.id}>
              {m.role === "user" && (
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    alignItems: "flex-start",
                    justifyContent: "flex-end",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Space Grotesk', monospace",
                      fontSize: "10px",
                      color: "#E5E2E1",
                      background: "rgba(0,240,255,0.06)",
                      border: "1px solid rgba(0,240,255,0.1)",
                      padding: "8px 12px",
                      maxWidth: "80%",
                      lineHeight: 1.5,
                    }}
                  >
                    {m.content as string}
                  </span>
                </div>
              )}
              {m.role === "assistant" && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {m.content ? (
                    <span
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "11px",
                        color: "#849495",
                        lineHeight: 1.6,
                      }}
                    >
                      {m.content as string}
                    </span>
                  ) : null}
                  {m.parts
                    ?.filter((p) => p.type === "tool-invocation")
                    .map((p) => {
                      if (p.type !== "tool-invocation") return null;
                      const t = p.toolInvocation;
                      return (
                        <div key={t.toolCallId}>
                          {t.state === "result" &&
                            renderTool(
                              t.toolName,
                              t.args as Record<string, unknown>,
                            )}
                          {t.state !== "result" && (
                            <div
                              style={{
                                fontFamily: "'Space Grotesk', monospace",
                                fontSize: "8px",
                                letterSpacing: "0.15em",
                                color: "#3B494B",
                                padding: "8px 0",
                              }}
                            >
                              RETRIEVING{" "}
                              {t.toolName.replace("show_", "").toUpperCase()}...
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div
              style={{
                fontFamily: "'Space Grotesk', monospace",
                fontSize: "8px",
                letterSpacing: "0.2em",
                color: "#00F0FF",
                paddingLeft: "4px",
              }}
            >
              <span style={{ animation: "blink 1s step-end infinite" }}>
                PROCESSING_
              </span>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          style={{
            padding: "12px",
            borderTop: "1px solid rgba(59,73,75,0.3)",
            flexShrink: 0,
            display: "flex",
            gap: "8px",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontFamily: "'Space Grotesk', monospace",
              fontSize: "10px",
              color: "#00F0FF",
              flexShrink: 0,
            }}
          >
            &gt;_
          </span>
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="QUERY DOSSIER..."
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              fontFamily: "'Space Grotesk', monospace",
              fontSize: "10px",
              letterSpacing: "0.05em",
              color: "#E5E2E1",
              caretColor: "#00F0FF",
            }}
          />
          <button
            type="submit"
            disabled={isLoading || !input?.trim()}
            style={{
              background: "none",
              border: "1px solid rgba(0,240,255,0.2)",
              padding: "4px 10px",
              cursor: "crosshair",
              fontFamily: "'Space Grotesk', monospace",
              fontSize: "8px",
              letterSpacing: "0.15em",
              color: input?.trim() ? "#00F0FF" : "#3B494B",
              transition: "color 0.1s",
            }}
          >
            SEND
          </button>
        </form>
      </div>

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
      `}</style>
    </>
  );
}
