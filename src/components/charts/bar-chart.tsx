'use client'

interface BarChartProps {
  data: { label: string; value: number }[]
  color?: string
  height?: number
}

export function BarChart({ data, color = '#3ecf8e', height = 120 }: BarChartProps) {
  const maxVal = Math.max(...data.map(d => d.value), 1)
  const barWidth = Math.min(32, Math.floor(280 / Math.max(data.length, 1)))
  const gap = Math.max(4, Math.floor((280 - barWidth * data.length) / Math.max(data.length - 1, 1)))
  const totalWidth = data.length * barWidth + (data.length - 1) * gap
  const chartHeight = height - 24

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${Math.max(totalWidth, 100)} ${height}`}
        className="w-full"
        style={{ maxWidth: '100%', height: `${height}px` }}
      >
        {data.map((item, i) => {
          const barHeight = maxVal > 0 ? (item.value / maxVal) * chartHeight : 0
          const x = i * (barWidth + gap)
          const y = chartHeight - barHeight

          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barHeight, 2)}
                rx={2}
                fill={color}
                opacity={0.85}
                className="transition-all duration-300"
              />
              <text
                x={x + barWidth / 2}
                y={chartHeight + 14}
                textAnchor="middle"
                className="fill-light"
                fontSize="9"
                fontFamily="Inter, sans-serif"
              >
                {item.label}
              </text>
              {item.value > 0 && (
                <text
                  x={x + barWidth / 2}
                  y={y - 4}
                  textAnchor="middle"
                  className="fill-foreground"
                  fontSize="10"
                  fontWeight="600"
                  fontFamily="Inter, sans-serif"
                >
                  {item.value}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
