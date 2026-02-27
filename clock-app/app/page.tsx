"use client";

import { useState } from "react";

interface Task {
  id: number;
  start: number;
  end: number;
  title: string;
  detail: string;
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedHours, setSelectedHours] = useState<number[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");

  // 🔥 커스텀 툴팁 state
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    text: string;
  } | null>(null);

  const size = 420;
  const center = size / 2;
  const radius = 170;

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

  const measureTextWidth = (text: string, fontSize = 14) => {
    if (typeof window === "undefined") return 0;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return 0;
    ctx.font = `bold ${fontSize}px NanumGothic`;
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
    setSelectedTask(null);

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

    const newMin = Math.min(min, hour);
    const newMax = Math.max(max, hour);

    const newSelection = [];
    for (let i = newMin; i <= newMax; i++) {
      newSelection.push(i);
    }

    setSelectedHours(newSelection);
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
    if (!range || !title) return;

    const newTask: Task = {
      id: Date.now(),
      start: range.start,
      end: range.end,
      title,
      detail,
    };

    setTasks([...tasks, newTask]);
    setSelectedHours([]);
    setTitle("");
    setDetail("");
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter((t) => t.id !== id));
    setSelectedTask(null);
  };

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
      <div style={{ display: "flex", gap: "40px" }}>
        <div
          style={{
            background: "white",
            padding: "30px",
            borderRadius: "20px",
            boxShadow: "0 6px 30px rgba(0,0,0,0.08)",
            position: "relative",
          }}
        >
          <h2 style={{ textAlign: "center" }}>
            시간별 업무 스케줄러
          </h2>

          <svg width={size} height={size}>
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="black"
              strokeWidth="2"
            />
            <circle cx={center} cy={center} r={4} fill="black" />

            {Array.from({ length: 24 }).map((_, i) => {
              const end = polar(hourToAngle(i), radius);
              return (
                <line
                  key={i}
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
                  key={i}
                  d={createArc(i, i + 1)}
                  fill={
                    isSelected
                      ? "rgba(24,119,242,0.35)"
                      : "transparent"
                  }
                  onClick={() => toggleHour(i)}
                  style={{ cursor: "pointer" }}
                />
              );
            })}

            {tasks.map((task, index) => {
              const startAngle = hourToAngle(task.start);
              const endAngle = hourToAngle(task.end);
              const angleSize = endAngle - startAngle;

              const midHour =
                (task.start + task.end) / 2;
              const midAngle = hourToAngle(midHour);

              const textRadius = radius * 0.6;
              const textPos = polar(midAngle, textRadius);

              const textWidth =
                measureTextWidth(task.title, 14);
              const arcLength =
                textRadius * angleSize;

              const canFitInside =
                textWidth < arcLength * 0.8;

              return (
                <g key={task.id}>
                  <path
                    d={createArc(
                      task.start,
                      task.end
                    )}
                    fill={getTaskColor(index)}
                    stroke="black"
                    strokeWidth="2"
                    onClick={() =>
                      setSelectedTask(task)
                    }
                    onMouseEnter={(e) => {
                      if (!canFitInside) {
                        setTooltip({
                          x: e.clientX,
                          y: e.clientY,
                          text: `${task.title} (${task.start}시 ~ ${task.end}시)`,
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
                            : null
                        );
                      }
                    }}
                    onMouseLeave={() =>
                      setTooltip(null)
                    }
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
                      style={{
                        pointerEvents: "none",
                      }}
                    >
                      {task.title}
                    </text>
                  )}
                </g>
              );
            })}

            {Array.from({ length: 24 }).map((_, i) => {
              const pos = polar(
                hourToAngle(i),
                radius + 18
              );
              return (
                <text
                  key={i}
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

          {/* 🔥 즉시 표시 커스텀 툴팁 */}
          {tooltip && (
            <div
              style={{
                position: "fixed",
                top: tooltip.y + 12,
                left: tooltip.x + 12,
                background:
                  "rgba(0,0,0,0.85)",
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

          <div style={{ marginTop: "20px" }}>
            <input
              placeholder="업무 제목"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              style={inputStyle}
            />
            <textarea
              placeholder="상세 내용"
              value={detail}
              onChange={(e) =>
                setDetail(e.target.value)
              }
              style={{
                ...inputStyle,
                height: "80px",
              }}
            />
            <button
              onClick={addTask}
              style={buttonStyle}
            >
              등록
            </button>
          </div>
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
};

const buttonStyle = {
  width: "100%",
  padding: "10px",
  borderRadius: "8px",
  border: "none",
  background: "#1877F2",
  color: "white",
  fontWeight: "bold",
  cursor: "pointer",
};