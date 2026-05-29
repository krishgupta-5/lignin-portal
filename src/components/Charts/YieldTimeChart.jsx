import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import './YieldTimeChart.css';

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="yield-tooltip">
        <div className="yield-tooltip-label">Time: {label} min</div>
        <div className="yield-tooltip-value">
          Yield: {payload[0].value}%
        </div>
      </div>
    );
  }
  return null;
}

export default function YieldTimeChart({ data = [], highlightTime }) {
  return (
    <div className="yield-chart-wrapper">
      <h4 className="yield-chart-title">Yield vs Time (Predicted)</h4>
      <div className="yield-chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="yieldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2D6A4F" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#2D6A4F" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis
              dataKey="time"
              label={{ value: 'Time (min)', position: 'insideBottomRight', offset: -5, style: { fontSize: 12, fill: '#718096' } }}
              tick={{ fontSize: 12, fill: '#718096' }}
            />
            <YAxis
              domain={[0, 100]}
              label={{ value: 'Lignin Yield (%)', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 12, fill: '#718096' } }}
              tick={{ fontSize: 12, fill: '#718096' }}
            />
            <Tooltip content={<CustomTooltip />} />
            {highlightTime && (
              <ReferenceLine
                x={highlightTime}
                stroke="#1B4332"
                strokeDasharray="5 5"
                strokeWidth={1.5}
                label={{ value: `${highlightTime} min`, position: 'top', fill: '#1B4332', fontSize: 11 }}
              />
            )}
            <Area
              type="monotone"
              dataKey="yield"
              stroke="#2D6A4F"
              strokeWidth={2.5}
              fill="url(#yieldGradient)"
              dot={{ r: 4, fill: '#2D6A4F', stroke: '#fff', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: '#1B4332', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
