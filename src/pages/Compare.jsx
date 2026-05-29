import { useState, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Download } from 'lucide-react';
import { sampleHistory, generateYieldCurve } from '../data/mockData';
import './Compare.css';

const COLORS = ['#2D6A4F', '#E9A820', '#DC3545'];

export default function Compare() {
  const [selected] = useState(sampleHistory.slice(0, 3));

  // Merge yield curves for overlay chart
  const chartData = useMemo(() => {
    const curves = selected.map((item, idx) =>
      generateYieldCurve(item.ligninYield, 0.035 + idx * 0.005, item.recommendedTime)
    );
    // merge into single array keyed by time
    const merged = [];
    for (let t = 0; t <= 180; t += 10) {
      const point = { time: t };
      curves.forEach((curve, idx) => {
        const match = curve.find((c) => c.time === t);
        point[`yield${idx}`] = match ? match.yield : 0;
      });
      merged.push(point);
    }
    return merged;
  }, [selected]);

  return (
    <div className="compare-page animate-fade-in">
      <div className="compare-header">
        <h1>Compare Predictions</h1>
        <p>Side-by-side comparison of prediction results</p>
      </div>

      <div className="compare-cards">
        {selected.map((item, idx) => (
          <div key={item.id} className="compare-card">
            <div className="compare-card-header" style={{
              background: `linear-gradient(135deg, ${COLORS[idx]}, ${COLORS[idx]}dd)`
            }}>
              {item.plant}
            </div>
            <div className="compare-card-body">
              <div className="compare-row">
                <span className="compare-row-label">Chemical</span>
                <span className="compare-row-value">{item.chemical}</span>
              </div>
              <div className="compare-row">
                <span className="compare-row-label">Temperature</span>
                <span className="compare-row-value">{item.temperature}°C</span>
              </div>
              <div className="compare-row">
                <span className="compare-row-label">pH</span>
                <span className="compare-row-value">{item.ph}</span>
              </div>
              <div className="compare-row">
                <span className="compare-row-label">Lignin Yield</span>
                <span className="compare-row-value highlight">{item.ligninYield}%</span>
              </div>
              <div className="compare-row">
                <span className="compare-row-label">Rec. Time</span>
                <span className="compare-row-value">{item.recommendedTime} min</span>
              </div>
              <div className="compare-row">
                <span className="compare-row-label">Performance</span>
                <span className={`badge badge-${item.performance.toLowerCase()}`}>
                  {item.performance}
                </span>
              </div>
              <div className="compare-row">
                <span className="compare-row-label">Confidence</span>
                <span className="compare-row-value">{item.confidence}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="compare-chart-section">
        <div className="compare-chart-title">Yield Curve Comparison</div>
        <div className="compare-chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 12, fill: '#718096' }}
                label={{ value: 'Time (min)', position: 'insideBottomRight', offset: -5, style: { fontSize: 12, fill: '#718096' } }}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 12, fill: '#718096' }}
                label={{ value: 'Lignin Yield (%)', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 12, fill: '#718096' } }}
              />
              <Tooltip />
              <Legend />
              {selected.map((item, idx) => (
                <Area
                  key={item.id}
                  type="monotone"
                  dataKey={`yield${idx}`}
                  name={item.plant}
                  stroke={COLORS[idx]}
                  fill={COLORS[idx]}
                  fillOpacity={0.08}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="compare-footer">
        <button className="btn btn-primary">
          <Download size={16} /> Export Comparison
        </button>
      </div>
    </div>
  );
}
