"use client";

import { useEffect, useState } from "react";

interface Task {
  id: number;
  start: number;
  end: number;
  title: string;
  detail: string;
}

interface TooltipState {
  x: number;
  y: number;
  text: string;
}

const size = 420;
const center = size / 2;
const radius = 170;
const pastelColors = [
  "#FFB3BA",
  "#FFDFBA",
  "#FFFFBA",
  "#BAFFC9",
  "#BAE1FF",
  "#E3BAFF",
  "#FFD6E0",
  "#D5FFBA",
];

const hourToAngle = (hour: number) =>
  (hour / 24) * 2 * Math.PI - Math.PI / 2;

const polar = (angle: number, r: number) => {
  const x = center + r * Math.cos(angle);
  const y = center + r * Math.sin(angle);

  return {
    x: Number(x.toFixed(2)),
    y: Number(y.toFixed(2)),
  };
};

const formatTime = (date: Date) =>
  date.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedHours, setSelectedHours] = useState<number[]>([]);
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setNow(new Date());
    });

    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearInterval(timer);
    };
  }, []);

  const currentHour = now
    ? now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600
    : 0;
  const currentHandEnd = polar(hourToAngle(currentHour), radius * 0.88);
  const activeTasks = now
    ? tasks.filter((task) => currentHour >= task.start && currentHour < task.end)
    : [];

  const measureTextWidth = (text: string, fontSize = 14) => {
    if (typeof window === "undefined") return 0;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return 0;

    ctx.font = `bold ${fontSize}px Nanum Gothic`;
    return ctx.measureText(text).width;
  };

  const createArc = (start: number, end: number) => {
    const startAngle = hourToAngle(start);
    const endAngle = hourToAngle(end);
    const startOuter = polar(startAngle, radius);
    const endOuter = polar(endAngle, radius);
    const largeArc = end - start > 12 ? 1 : 0;

    return `
      M ${center} ${center}
      L ${startOuter.x} ${startOuter.y}
      A ${radius} ${radius} 0 ${largeArc} 1 ${endOuter.x} ${endOuter.y}
      Z
    `;
  };

  const toggleHour = (hour: number) => {
    if (selectedHours.length === 0) {
      setSelectedHours([hour]);
      return;
    }

    const min = Math.min(...selectedHours);
    const max = Math.max(...selectedHours);

    if (hour >= min && hour <= max) {
      setSelectedHours([]);
      return;
    }

    const nextStart = Math.min(min, hour);
    const nextEnd = Math.max(max, hour);
    const nextSelection = [];

    for (let value = nextStart; value <= nextEnd; value += 1) {
      nextSelection.push(value);
    }

    setSelectedHours(nextSelection);
  };

  const getMergedRange = () => {
    if (selectedHours.length === 0) return null;

    const sorted = [...selectedHours].sort((a, b) => a - b);
    return {
      start: sorted[0],
      end: sorted[sorted.length - 1] + 1,
    };
  };

  const addTask = () => {
    const range = getMergedRange();
    if (!range || !title.trim()) return;

    const newTask: Task = {
      id: Date.now(),
      start: range.start,
      end: range.end,
      title: title.trim(),
      detail: detail.trim(),
    };

    setTasks([...tasks, newTask]);
    setSelectedHours([]);
    setTitle("");
    setDetail("");
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const sortedTasks = [...tasks].sort(
    (a, b) => a.start - b.start || a.end - b.end,
  );

  const formatHour = (hour: number) => `${String(hour).padStart(2, "0")}:00`;

  const getTaskColor = (index: number) =>
    pastelColors[index % pastelColors.length];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#fafafa",
        display: "flex",
        justifyContent: "center",
        padding: "40px",
        fontFamily: "Nanum Gothic, sans-serif",
      }}
    >
      <div style={{ display: "flex", gap: "40px", alignItems: "flex-start" }}>
        <div
          style={{
            background: "white",
            padding: "30px",
            borderRadius: "20px",
            boxShadow: "0 6px 30px rgba(0,0,0,0.08)",
            position: "relative",
          }}
        >
          <h2 style={{ textAlign: "center", marginTop: 0 }}>시간별 업무 스케줄러</h2>
          <p
            style={{
              textAlign: "center",
              marginTop: "-8px",
              marginBottom: "20px",
              color: "#4b5563",
            }}
          >
            현재 시간 {now ? formatTime(now) : "--:--:--"}
          </p>

          <svg width={size} height={size}>
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="black"
              strokeWidth="2"
            />

            {Array.from({ length: 24 }).map((_, i) => {
              const end = polar(hourToAngle(i), radius);
              return (
                <line
                  key={`grid-${i}`}
                  x1={center}
                  y1={center}
                  x2={end.x}
                  y2={end.y}
                  stroke="black"
                  strokeWidth="1"
                />
              );
            })}

            {Array.from({ length: 24 }).map((_, i) => {
              const isSelected = selectedHours.includes(i);
              return (
                <path
                  key={`slot-${i}`}
                  d={createArc(i, i + 1)}
                  fill={isSelected ? "rgba(24,119,242,0.35)" : "transparent"}
                  onClick={() => toggleHour(i)}
                  style={{ cursor: "pointer" }}
                />
              );
            })}

            {tasks.map((task, index) => {
              const startAngle = hourToAngle(task.start);
              const endAngle = hourToAngle(task.end);
              const angleSize = endAngle - startAngle;
              const midHour = (task.start + task.end) / 2;
              const midAngle = hourToAngle(midHour);
              const textRadius = radius * 0.6;
              const textPos = polar(midAngle, textRadius);
              const textWidth = measureTextWidth(task.title, 14);
              const arcLength = textRadius * angleSize;
              const canFitInside = textWidth < arcLength * 0.8;

              return (
                <g key={task.id}>
                  <path
                    d={createArc(task.start, task.end)}
                    fill={getTaskColor(index)}
                    stroke="black"
                    strokeWidth="2"
                    onMouseEnter={(e) => {
                      if (!canFitInside) {
                        setTooltip({
                          x: e.clientX,
                          y: e.clientY,
                          text: `${task.title} (${task.start}:00 - ${task.end}:00)`,
                        });
                      }
                    }}
                    onMouseMove={(e) => {
                      if (!canFitInside) {
                        setTooltip((prev) =>
                          prev
                            ? {
                                ...prev,
                                x: e.clientX,
                                y: e.clientY,
                              }
                            : null,
                        );
                      }
                    }}
                    onMouseLeave={() => setTooltip(null)}
                    style={{ cursor: "pointer" }}
                  />

                  {canFitInside && (
                    <text
                      x={textPos.x}
                      y={textPos.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="14"
                      fontWeight="bold"
                      fill="black"
                      style={{ pointerEvents: "none" }}
                    >
                      {task.title}
                    </text>
                  )}
                </g>
              );
            })}

            <line
              x1={center}
              y1={center}
              x2={currentHandEnd.x}
              y2={currentHandEnd.y}
              stroke="#dc2626"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <circle cx={center} cy={center} r={7} fill="#dc2626" />

            {Array.from({ length: 24 }).map((_, i) => {
              const pos = polar(hourToAngle(i), radius + 18);
              return (
                <text
                  key={`label-${i}`}
                  x={pos.x}
                  y={pos.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="12"
                >
                  {i}
                </text>
              );
            })}
          </svg>

          {tooltip && (
            <div
              style={{
                position: "fixed",
                top: tooltip.y + 12,
                left: tooltip.x + 12,
                background: "rgba(0,0,0,0.85)",
                color: "white",
                padding: "6px 10px",
                borderRadius: "8px",
                fontSize: "12px",
                pointerEvents: "none",
                whiteSpace: "nowrap",
                zIndex: 9999,
              }}
            >
              {tooltip.text}
            </div>
          )}

          <div
            style={{
              marginTop: "20px",
              padding: "14px 16px",
              borderRadius: "12px",
              background: activeTasks.length > 0 ? "#fef3c7" : "#f3f4f6",
              color: "#111827",
            }}
          >
            {activeTasks.length > 0
              ? `지금은 ${activeTasks.map((task) => task.title).join(", ")} 시간입니다.`
              : "현재 진행 중인 일정이 없습니다."}
          </div>

          <div style={{ marginTop: "20px" }}>
            <input
              placeholder="업무 제목"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={inputStyle}
            />
            <textarea
              placeholder="상세 내용"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              style={{
                ...inputStyle,
                height: "80px",
              }}
            />
            <button onClick={addTask} style={buttonStyle}>
              등록
            </button>
          </div>
        </div>

        <div
          style={{
            width: "320px",
            background: "white",
            padding: "24px",
            borderRadius: "20px",
            boxShadow: "0 6px 30px rgba(0,0,0,0.08)",
            alignSelf: "flex-start",
            maxHeight: "calc(100vh - 80px)",
            overflowY: "auto",
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: "14px" }}>시간대별 일정</h3>

          {sortedTasks.length === 0 ? (
            <p style={{ margin: 0, color: "#666" }}>등록된 일정이 없습니다.</p>
          ) : (
            <div style={{ display: "grid", gap: "10px" }}>
              {sortedTasks.map((task) => (
                <div
                  key={task.id}
                  style={{
                    border: "1px solid #e8e8e8",
                    borderRadius: "12px",
                    padding: "12px",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: "13px",
                      marginBottom: "6px",
                    }}
                  >
                    {formatHour(task.start)} - {formatHour(task.end)}
                  </div>
                  <div
                    style={{
                      fontWeight: 600,
                      marginBottom: task.detail ? "4px" : "10px",
                    }}
                  >
                    {task.title}
                  </div>
                  {task.detail && (
                    <div
                      style={{
                        fontSize: "13px",
                        color: "#555",
                        marginBottom: "10px",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {task.detail}
                    </div>
                  )}
                  <button onClick={() => deleteTask(task.id)} style={deleteButtonStyle}>
                    삭제
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginBottom: "10px",
  borderRadius: "8px",
  border: "1px solid #ddd",
} as const;

const buttonStyle = {
  width: "100%",
  padding: "10px",
  borderRadius: "8px",
  border: "none",
  background: "#1877F2",
  color: "white",
  fontWeight: "bold",
  cursor: "pointer",
} as const;

const deleteButtonStyle = {
  width: "100%",
  padding: "8px",
  borderRadius: "8px",
  border: "1px solid #e0e0e0",
  background: "#f4f4f4",
  color: "#222",
  fontWeight: "bold",
  cursor: "pointer",
} as const;
