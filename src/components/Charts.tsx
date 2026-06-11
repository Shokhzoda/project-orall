import { useState } from "react";

// =================================-------------------------
// 1. AREA CHART: Monthly Sales Trends
// =================================-------------------------
export function MonthlySalesChart({ data }: { data: { month: string; sales: number }[] }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const maxVal = Math.max(...data.map(d => d.sales), 1000);
  const width = 600;
  const height = 240;
  const paddingLeft = 60;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Convert points to SVG coordinates
  const points = data.map((d, idx) => {
    const x = paddingLeft + (idx / (data.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - (d.sales / maxVal) * chartHeight;
    return { x, y, sales: d.sales, month: d.month };
  });

  // Create path statement
  let pathStr = "";
  if (points.length > 0) {
    pathStr = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ");
  }

  // Create fill statement closed at bottom
  let fillPathStr = "";
  if (points.length > 0) {
    fillPathStr =
      `${pathStr} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`;
  }

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xs font-mono font-bold tracking-wider text-[#94A3B8] uppercase">Oylik Sotuv Hajmlari</h3>
          <p className="text-sm font-sans font-semibold text-[#0F172A]">Sotuv buyurtmalari oqimi</p>
        </div>
        {hoveredIndex !== null && (
          <div className="text-right">
            <span className="text-[10px] uppercase font-mono text-[#64748B]">{points[hoveredIndex].month}</span>
            <p className="text-xs font-mono font-bold text-[#2563EB]">${points[hoveredIndex].sales.toLocaleString()}</p>
          </div>
        )}
      </div>

      <div className="relative w-full overflow-hidden" style={{ aspectRatio: "5 / 2" }}>
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full font-mono text-[9px] fill-[#64748B]">
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563EB" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#2563EB" stopOpacity="0.00" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const h = paddingTop + ratio * chartHeight;
            const textVal = Math.round(maxVal * (1 - ratio));
            return (
              <g key={i}>
                <line x1={paddingLeft} y1={h} x2={width - paddingRight} y2={h} stroke="#F1F5F9" strokeWidth="1" />
                <text x={paddingLeft - 10} y={h + 3} textAnchor="end">{`$${textVal.toLocaleString()}`}</text>
              </g>
            );
          })}

          {/* Area under line */}
          {fillPathStr && <path d={fillPathStr} fill="url(#areaGradient)" />}

          {/* Main line series */}
          {pathStr && <path d={pathStr} fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" />}

          {/* Circles & Interaction guides */}
          {points.map((p, idx) => (
            <g key={idx}>
              {/* Vertical line pointer on hover */}
              {hoveredIndex === idx && (
                <line x1={p.x} y1={paddingTop} x2={p.x} y2={paddingTop + chartHeight} stroke="#2563EB" strokeDasharray="3,3" />
              )}

              {/* Data circle markers */}
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredIndex === idx ? 6 : 4}
                fill={hoveredIndex === idx ? "#2563EB" : "#FFFFFF"}
                stroke="#2563EB"
                strokeWidth={hoveredIndex === idx ? 2 : 1.5}
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              />

              {/* X Axis months labeling */}
              <text x={p.x} y={paddingTop + chartHeight + 20} textAnchor="middle" className="font-semibold text-[10px]">
                {p.month}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

// =================================-------------------------
// 2. COLUMN BAR CHART: Double Ledger Income vs. Expense
// =================================-------------------------
export function DoubleLedgerChart({
  income,
  expense,
}: {
  income: { label: string; value: number }[];
  expense: { label: string; value: number }[];
}) {
  const [hovered, setHovered] = useState<{ type: string; idx: number } | null>(null);

  const labels = income.map(i => i.label);
  const maxIncome = Math.max(...income.map(i => i.value), 0);
  const maxExpense = Math.max(...expense.map(e => e.value), 0);
  const maxVal = Math.max(maxIncome, maxExpense, 1000);

  const width = 600;
  const height = 240;
  const paddingLeft = 60;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const gap = 30; // space between index elements
  const barWidth = (chartWidth / labels.length - gap) / 2;

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xs font-mono font-bold tracking-wider text-[#94A3B8] uppercase">Moliyaviy Balans Hisoboti</h3>
          <p className="text-sm font-sans font-semibold text-[#0F172A]">Kirimlar va Operatsion xarajatlar tahlili</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-[#10B981] rounded-sm"></span>
            <span>Kirim qilingan tushumlar</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-[#EF4444] rounded-sm"></span>
            <span>Ishlab chiqarish xarajatlari</span>
          </div>
        </div>
      </div>

      <div className="relative w-full overflow-hidden" style={{ aspectRatio: "5 / 2" }}>
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full font-mono text-[9px] fill-[#64748B]">
          {/* Grid backgrounds */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const h = paddingTop + ratio * chartHeight;
            const textVal = Math.round(maxVal * (1 - ratio));
            return (
              <g key={i}>
                <line x1={paddingLeft} y1={h} x2={width - paddingRight} y2={h} stroke="#F1F5F9" strokeWidth="1" />
                <text x={paddingLeft - 10} y={h + 3} textAnchor="end">{`$${textVal.toLocaleString()}`}</text>
              </g>
            );
          })}

          {/* Draw bars */}
          {labels.map((lbl, idx) => {
            const baseIndexX = paddingLeft + idx * (chartWidth / labels.length) + gap / 2;

            // Income bar metrics
            const incVal = income[idx]?.value || 0;
            const incHeight = (incVal / maxVal) * chartHeight;
            const incX = baseIndexX;
            const incY = paddingTop + chartHeight - incHeight;

            // Expense bar metrics
            const expVal = expense[idx]?.value || 0;
            const expHeight = (expVal / maxVal) * chartHeight;
            const expX = baseIndexX + barWidth + 3;
            const expY = paddingTop + chartHeight - expHeight;

            return (
              <g key={idx}>
                {/* Income column */}
                <rect
                  x={incX}
                  y={incY}
                  width={barWidth}
                  height={incHeight}
                  fill="#10B981"
                  rx="3"
                  className="transition-all duration-200 cursor-pointer hover:opacity-85"
                  onMouseEnter={() => setHovered({ type: "Income", idx })}
                  onMouseLeave={() => setHovered(null)}
                />

                {/* Expense column */}
                <rect
                  x={expX}
                  y={expY}
                  width={barWidth}
                  height={expHeight}
                  fill="#EF4444"
                  rx="3"
                  className="transition-all duration-200 cursor-pointer hover:opacity-85"
                  onMouseEnter={() => setHovered({ type: "Expense", idx })}
                  onMouseLeave={() => setHovered(null)}
                />

                {/* Inline hover tooltip indicators */}
                {hovered?.idx === idx && hovered.type === "Income" && (
                  <text
                    x={incX + barWidth / 2}
                    y={Math.max(incY - 6, paddingTop)}
                    textAnchor="middle"
                    className="font-bold fill-[#10B981] font-mono"
                  >
                    {`$${incVal.toLocaleString()}`}
                  </text>
                )}
                {hovered?.idx === idx && hovered.type === "Expense" && (
                  <text
                    x={expX + barWidth / 2}
                    y={Math.max(expY - 6, paddingTop)}
                    textAnchor="middle"
                    className="font-bold fill-[#EF4444] font-mono"
                  >
                    {`$${expVal.toLocaleString()}`}
                  </text>
                )}

                {/* X labels */}
                <text
                  x={baseIndexX + barWidth + 1.5}
                  y={paddingTop + chartHeight + 20}
                  textAnchor="middle"
                  className="font-semibold text-[10px]"
                >
                  {lbl}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

// =================================-------------------------
// 3. DONUT CHART: Category Warehouse Concentration
// =================================-------------------------
export function CategoryDonutChart({ data }: { data: { name: string; value: number; color: string }[] }) {
  const total = data.reduce((sum, curr) => sum + curr.value, 0);
  const size = 200;
  const radius = 70;
  const strokeWidth = 18;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedAngle = -Math.PI / 2; // start from top (12 o'clock)

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm h-full flex flex-col justify-between">
      <div>
        <h3 className="text-xs font-mono font-bold tracking-wider text-[#94A3B8] uppercase">Mahsulot guruhlari</h3>
        <p className="text-sm font-sans font-semibold text-[#0F172A] mb-4">Kategoriyalar bo'yicha ombor balansi</p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
        {/* DONUT RING VECTOR */}
        <div className="relative w-40 h-40">
          <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full -rotate-90">
            {total === 0 ? (
              <circle cx={center} cy={center} r={radius} fill="none" stroke="#F1F5F9" strokeWidth={strokeWidth} />
            ) : (
              data.map((item, idx) => {
                const percentage = item.value / total;
                const strokeDashoffset = circumference - percentage * circumference;
                const rotation = (accumulatedAngle + Math.PI / 2) * (180 / Math.PI);
                accumulatedAngle += percentage * 2 * Math.PI;

                return (
                  <circle
                    key={idx}
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke={item.color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    transform={`rotate(${rotation} ${center} ${center})`}
                    className="transition-all duration-300 hover:opacity-85"
                  />
                );
              })
            )}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-xs font-semibold text-[#94A3B8]">ZAXIRA</span>
            <span className="font-sans font-bold text-lg text-[#0F172A]">{total.toLocaleString()}</span>
          </div>
        </div>

        {/* LEDGER LEGEND */}
        <div className="space-y-2 flex-1">
          {data.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                <span className="text-xs text-[#64748B] font-medium truncate max-w-28">{item.name}</span>
              </div>
              <span className="font-mono text-xs font-bold text-[#0F172A]">{item.value} dona</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// =================================-------------------------
// 4. PROGRESS BAR INDEXES (Supplier allocation metrics)
// =================================-------------------------
export function ProgressBarAllocations({ data }: { data: { label: string; value: number; total: number; color: string }[] }) {
  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm h-full flex flex-col justify-between">
      <div>
        <h3 className="text-xs font-mono font-bold tracking-wider text-[#94A3B8] uppercase">Xaridlar ulushi</h3>
        <p className="text-sm font-sans font-semibold text-[#0F172A] mb-4">Ta'minotchilar kesimida taqsimot</p>
      </div>

      <div className="space-y-4">
        {data.map((item, idx) => {
          const percentage = item.total > 0 ? (item.value / item.total) * 100 : 0;
          return (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-sans font-medium text-[#0F172A]">{item.label}</span>
                <span className="font-mono text-[#64748B] font-bold">
                  {item.value} dona ({Math.round(percentage)}%)
                </span>
              </div>
              <div className="w-full bg-[#F1F5F9] h-2 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%`, backgroundColor: item.color }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
