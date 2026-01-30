"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

export interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: Date;
  type?: "user" | "system" | "assistant";
  isStreaming?: boolean;
}

interface RetroChatroomProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RetroChatroom({ isOpen, onClose }: RetroChatroomProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      username: "PeteBot",
      message: "has joined the chatroom",
      timestamp: new Date(),
      type: "system",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [username, setUsername] = useState("Trainer");
  const [mounted, setMounted] = useState(false);
  const [runId, setRunId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
    // Debug: Log when chatroom opens/closes
    if (isOpen) {
      console.log("Chatroom opened");
    }
  }, [isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue("");
    setIsLoading(true);

    // Add user message
    const userMessageId = Date.now().toString();
    const newUserMessage: ChatMessage = {
      id: userMessageId,
      username,
      message: userMessage,
      timestamp: new Date(),
      type: "user",
    };

    setMessages((prev) => [...prev, newUserMessage]);

    // Create assistant message placeholder
    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: ChatMessage = {
      id: assistantMessageId,
      username: "PeteBot",
      message: "",
      timestamp: new Date(),
      type: "assistant",
      isStreaming: true,
    };

    setMessages((prev) => [...prev, assistantMessage]);

    // Cancel any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      const url = runId
        ? `https://agents.toolhouse.ai/04170d98-f085-4577-8433-85af773afb33/${runId}`
        : `https://agents.toolhouse.ai/04170d98-f085-4577-8433-85af773afb33`;

      const method = runId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage }),
        signal: abortControllerRef.current.signal,
      });

      // Get runId from header if it's the first request
      if (!runId && response.headers.has("X-Toolhouse-Run-ID")) {
        const newRunId = response.headers.get("X-Toolhouse-Run-ID");
        if (newRunId) {
          setRunId(newRunId);
        }
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedMessage = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulatedMessage += chunk;

        // Update the assistant message with accumulated content
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, message: accumulatedMessage, isStreaming: true }
              : msg
          )
        );

        scrollToBottom();
      }

      // Mark streaming as complete
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId ? { ...msg, isStreaming: false } : msg
        )
      );
    } catch (error: any) {
      if (error.name === "AbortError") {
        return;
      }
      console.error("Error sending message:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                message: "Error: Failed to get response. Please try again.",
                isStreaming: false,
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
      // Auto-focus input after sending
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isOpen || !mounted) return null;

  const chatroomContent = (
    <div 
      className="fixed inset-0 flex items-center justify-center"
      onClick={onClose}
      style={{ 
        display: "flex",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        pointerEvents: "auto"
      }}
    >
      <div
        className="window system7"
        style={{ 
          width: "600px", 
          maxWidth: "90vw", 
          height: "500px",
          position: "relative",
          zIndex: 100000,
          backgroundColor: "#c0c0c0",
          border: "2px outset #c0c0c0",
          boxShadow: "inset -1px -1px 0px 0px #000000, inset 1px 1px 0px 0px #ffffff, inset -2px -2px 0px 0px #808080",
          fontFamily: "Fixedsys, 'Fixedsys Excelsior', 'Courier New', Courier, monospace",
          fontSize: "16px",
          fontWeight: "bold",
          WebkitFontSmoothing: "none" as any,
          MozOsxFontSmoothing: "unset" as any,
          display: "block",
          visibility: "visible",
          opacity: 1,
          pointerEvents: "auto"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="title-bar" style={{
          backgroundColor: "#000080",
          color: "#fff",
          padding: "2px 4px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "16px",
          fontWeight: "bold",
          height: "24px",
          WebkitFontSmoothing: "none" as any,
          MozOsxFontSmoothing: "unset" as any
        }}>
          <div className="title-bar-text" style={{ flex: 1 }}>Pete's Chatroom</div>
          <div className="title-bar-controls" style={{ display: "flex", gap: "2px" }}>
            <button 
              aria-label="Close" 
              onClick={onClose}
              style={{
                width: "16px",
                height: "14px",
                border: "1px outset #c0c0c0",
                backgroundColor: "#c0c0c0",
                cursor: "pointer",
                fontSize: "9px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.border = "1px inset #c0c0c0";
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.border = "1px outset #c0c0c0";
              }}
            >
              ✕
            </button>
          </div>
        </div>
        <div className="window-body" style={{ 
          display: "flex", 
          flexDirection: "column", 
          height: "calc(100% - 24px)",
          padding: "4px",
          backgroundColor: "#c0c0c0"
        }}>
          {/* Chat Messages Area */}
          <div className="inset-panel" style={{ 
            flex: 1, 
            overflowY: "auto", 
            padding: "8px", 
            marginBottom: "8px",
            backgroundColor: "#fff",
            border: "2px inset #c0c0c0",
            boxShadow: "inset 1px 1px 0px 0px #808080, inset -1px -1px 0px 0px #ffffff"
          }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {messages.map((msg) => {
                const timeStr = formatTime(msg.timestamp);
                const isSystem = msg.type === "system";
                const isAssistant = msg.type === "assistant";
                
                return (
                  <div
                    key={msg.id}
                    style={{
                      padding: "2px 4px",
                      fontSize: "11px",
                      fontFamily: "Fixedsys, 'Fixedsys Excelsior', 'Courier New', Courier, monospace",
                      WebkitFontSmoothing: "none" as any,
                      MozOsxFontSmoothing: "unset" as any,
                      color: "#000",
                      lineHeight: "1.4",
                      fontWeight: "bold",
                    }}
                  >
                    {isSystem ? (
                      <span>
                        <span style={{ color: "#666" }}>[{timeStr}]</span>{" "}
                        <span style={{ color: "#666" }}>===</span>{" "}
                        <span style={{ color: "#000" }}>{msg.username}</span>{" "}
                        <span style={{ color: "#666" }}>{msg.message}</span>
                      </span>
                    ) : isAssistant ? (
                      <span>
                        <span style={{ color: "#666" }}>[{timeStr}]</span>{" "}
                        <span style={{ color: "#000080" }}>&lt;{msg.username}&gt;</span>{" "}
                        <span style={{ color: "#000" }}>
                          {msg.isStreaming && <span style={{ color: "#666" }}>...</span>}
                          <MessageContent message={msg.message} />
                        </span>
                      </span>
                    ) : (
                      <span>
                        <span style={{ color: "#666" }}>[{timeStr}]</span>{" "}
                        <span style={{ color: "#000", fontWeight: "bold" }}>&lt;{msg.username}&gt;</span>{" "}
                        <span style={{ color: "#000" }}>{msg.message}</span>
                      </span>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <form className="retro-chatroom" onSubmit={handleSendMessage} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <label htmlFor="username" style={{ fontSize: "11px", fontFamily: "Fixedsys, 'Fixedsys Excelsior', 'Courier New', Courier, monospace", fontWeight: "bold", WebkitFontSmoothing: "none" as any, MozOsxFontSmoothing: "unset" as any, color: "#000" }}>
                Name:
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{
                  width: "100px",
                  padding: "2px 4px",
                  fontSize: "11px",
                  fontFamily: "Fixedsys, 'Fixedsys Excelsior', 'Courier New', Courier, monospace",
                  fontWeight: "bold",
                  WebkitFontSmoothing: "none" as any,
                  MozOsxFontSmoothing: "unset" as any,
                  border: "1px inset #ccc",
                  background: "#fff",
                  color: "#000",
                }}
                maxLength={20}
              />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type a message..."
              style={{
                flex: 1,
                padding: "2px 4px",
                fontSize: "11px",
                fontFamily: "Fixedsys, 'Fixedsys Excelsior', 'Courier New', Courier, monospace",
                fontWeight: "bold",
                WebkitFontSmoothing: "none" as any,
                MozOsxFontSmoothing: "unset" as any,
                border: "1px inset #ccc",
                background: "#fff",
                color: "#000",
              }}
              maxLength={200}
            />
            <button
              type="submit"
              disabled={isLoading}
              style={{
                padding: "4px 12px",
                fontSize: "11px",
                fontFamily: "Fixedsys, 'Fixedsys Excelsior', 'Courier New', Courier, monospace",
                fontWeight: "bold",
                WebkitFontSmoothing: "none" as any,
                MozOsxFontSmoothing: "unset" as any,
                border: "1px outset #ccc",
                background: isLoading ? "#ccc" : "#fff",
                color: "#000",
                cursor: isLoading ? "not-allowed" : "pointer",
                opacity: isLoading ? 0.6 : 1,
              }}
              onMouseDown={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.border = "1px inset #999";
                }
              }}
              onMouseUp={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.border = "1px outset #ccc";
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.border = "1px outset #ccc";
                }
              }}
            >
              {isLoading ? "Sending..." : "Send"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  return createPortal(chatroomContent, document.body);
}

// Component to render markdown content
function MessageContent({ message }: { message: string }) {
  if (!message) return null;

  // Simple markdown rendering for retro style
  const renderMarkdown = (text: string) => {
    // Split by lines and process markdown
    const lines = text.split("\n");
    const elements: JSX.Element[] = [];
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];

    lines.forEach((line, index) => {
      // Code blocks
      if (line.startsWith("```")) {
        if (inCodeBlock) {
          // End code block
          elements.push(
            <pre
              key={`code-${index}`}
              style={{
                backgroundColor: "#f0f0f0",
                padding: "4px",
                margin: "4px 0",
                border: "1px inset #c0c0c0",
                fontSize: "11px",
                fontFamily: "Fixedsys, 'Fixedsys Excelsior', 'Courier New', Courier, monospace",
                fontWeight: "bold",
                WebkitFontSmoothing: "none" as any,
                MozOsxFontSmoothing: "unset" as any,
                color: "#000",
                whiteSpace: "pre-wrap",
                overflowX: "auto",
              }}
            >
              {codeBlockContent.join("\n")}
            </pre>
          );
          codeBlockContent = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeBlockContent.push(line);
        return;
      }

      // Headers
      if (line.startsWith("# ")) {
        elements.push(
          <div key={index} style={{ fontWeight: "bold", fontSize: "11px", marginTop: "4px", marginBottom: "2px", color: "#000", WebkitFontSmoothing: "none" as any, MozOsxFontSmoothing: "unset" as any }}>
            {line.substring(2)}
          </div>
        );
        return;
      }

      if (line.startsWith("## ")) {
        elements.push(
          <div key={index} style={{ fontWeight: "bold", fontSize: "11px", marginTop: "4px", marginBottom: "2px", color: "#000" }}>
            {line.substring(3)}
          </div>
        );
        return;
      }

      // Bold text
      let processedLine = line;
      processedLine = processedLine.replace(/\*\*(.+?)\*\*/g, '<strong style="color: #000;">$1</strong>');
      processedLine = processedLine.replace(/\*(.+?)\*/g, '<em style="color: #666;">$1</em>');
      processedLine = processedLine.replace(/`(.+?)`/g, '<code style="background-color: #f0f0f0; padding: 1px 2px; border: 1px inset #c0c0c0; font-family: monospace; font-size: 11px; font-weight: bold; color: #000;">$1</code>');

      // Links
      processedLine = processedLine.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color: #0000ff; text-decoration: underline;" target="_blank" rel="noopener noreferrer">$1</a>');

      if (processedLine.trim()) {
        elements.push(
          <div
            key={index}
            style={{ marginTop: "2px", wordWrap: "break-word", lineHeight: "1.4", color: "#000" }}
            dangerouslySetInnerHTML={{ __html: processedLine }}
          />
        );
      } else {
        elements.push(<br key={index} />);
      }
    });

    // Handle remaining code block
    if (inCodeBlock && codeBlockContent.length > 0) {
      elements.push(
        <pre
          key="code-final"
          style={{
            backgroundColor: "#f0f0f0",
            padding: "4px",
            margin: "4px 0",
            border: "1px inset #c0c0c0",
            fontSize: "16px",
            fontFamily: "Fixedsys, 'Fixedsys Excelsior', 'Courier New', Courier, monospace",
            WebkitFontSmoothing: "none" as any,
            MozOsxFontSmoothing: "unset" as any,
            whiteSpace: "pre-wrap",
            overflowX: "auto",
          }}
        >
          {codeBlockContent.join("\n")}
        </pre>
      );
    }

    return <>{elements}</>;
  };

  return <div style={{ marginTop: "2px", color: "#000", fontWeight: "bold" }}>{renderMarkdown(message)}</div>;
}
