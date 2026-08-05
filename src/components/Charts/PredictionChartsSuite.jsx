import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  Activity,
  PieChart as PieIcon,
  Compass,
  Maximize2,
  Sparkles,
} from 'lucide-react';
import { convertTempToCelsius } from '../../utils/tempConverter';
import './PredictionChartsSuite.css';

const RADAR_METRICS = [
  { subject: 'Thermal Temp', max: 160 },
  { subject: 'Molar Ratio', max: 8 },
  { subject: 'Solvent/Solid', max: 30 },
  { subject: 'Kinetic Reach', max: 160 },
  { subject: 'Confidence', max: 100 },
  { subject: 'Yield Output', max: 100 },
];

export default function PredictionChartsSuite({
  result,
  formData = {},
  options = {},
}) {
  const [activeTab, setActiveTab] = useState('overview');

  // 1. Kinetic Dissolution Yield vs Reaction Time Series Data
  const yieldData = useMemo(() => {
    const rawCurve = result?.yieldCurve || result?.yield_curve;
    if (rawCurve && Array.isArray(rawCurve)) {
      return rawCurve.map((pt) => ({
        time: Number(pt.time),
        yield: Number(pt.yield ?? pt.yield_value ?? 0),
      }));
    }
    return [];
  }, [result]);

  // 2. Extraction Velocity Data (dYield / dt %/min calculated via differential kinetics)
  const rateData = useMemo(() => {
    if (!yieldData || yieldData.length < 2) return [];
    const rates = [];
    for (let i = 1; i < yieldData.length; i++) {
      const prev = yieldData[i - 1];
      const curr = yieldData[i];
      const dt = curr.time - prev.time;
      const dy = curr.yield - prev.yield;
      const rate = dt > 0 ? Number((dy / dt).toFixed(3)) : 0;
      rates.push({
        time: `${curr.time}m`,
        rate: Math.max(0, rate),
        yield: curr.yield,
      });
    }
    return rates;
  }, [yieldData]);

  // 3. Feedstock Biomass Structural Fraction Mass Balance
  const compositionData = useMemo(() => {
    const cellulose = Number(formData.cellulosePercent || 44.3);
    const hemicellulose = Number(formData.hemicellulosePercent || 20.0);
    const lignin = Number(formData.ligninPercent || 27.9);
    const ashExtractives = Math.max(0, Number((100 - (cellulose + hemicellulose + lignin)).toFixed(1)));

    return [
      { name: 'Cellulose', value: cellulose, color: '#2D6A4F' },
      { name: 'Structural Lignin', value: lignin, color: '#1B7A5C' },
      { name: 'Hemicellulose', value: hemicellulose, color: '#52B788' },
      { name: 'Ash / Extractives', value: ashExtractives, color: '#95D5B2' },
    ];
  }, [formData]);

  // 4. Process Optimization Radar Envelope Data (Real Normalized Reactor Conditions)
  const radarData = useMemo(() => {
    const rawTemp = formData.temperature || 100;
    const tempInC = rawTemp > 220 ? convertTempToCelsius(rawTemp, 'kelvin') : rawTemp;
    const tempNorm = Math.min(100, Math.round((tempInC / 160) * 100));
    const molarNorm = Math.min(100, Math.round(((formData.hbdHbaRatio || 6) / 8) * 100));
    const lsrNorm = Math.min(100, Math.round(((formData.liquidSolidRatio || 20) / 30) * 100));
    const timeNorm = Math.min(100, Math.round(((result?.recommendedTime || 90) / 160) * 100));
    const confNorm = Math.round(result?.confidence || 85);
    const yieldNorm = Math.min(100, Math.round(result?.ligninYield || 65));

    return [
      { subject: 'Thermal Temp', score: tempNorm, fullMark: 100 },
      { subject: 'Molar Ratio', score: molarNorm, fullMark: 100 },
      { subject: 'Solvent/Solid', score: lsrNorm, fullMark: 100 },
      { subject: 'Kinetic Reach', score: timeNorm, fullMark: 100 },
      { subject: 'Confidence', score: confNorm, fullMark: 100 },
      { subject: 'Yield Output', score: yieldNorm, fullMark: 100 },
    ];
  }, [formData, result]);

  const highlightTime = result?.recommendedTime;

  return (
    <div className="prediction-charts-suite">
      {/* Chart Navigation Tabs */}
      <div className="charts-suite-header">
        <div className="charts-suite-title-row">
          <div className="charts-title-icon">
            <Sparkles size={18} color="#2D6A4F" />
          </div>
          <div>
            <h3 className="charts-suite-title">AI Kinetic & Process Analytics Suite</h3>
            <p className="charts-suite-subtitle">
              Multi-dimensional chemical dissolution dynamics, differential kinetics, and feedstock mass balances.
            </p>
          </div>
        </div>

        <div className="charts-tab-pills">
          <button
            className={`chart-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <Maximize2 size={14} /> Comprehensive Dashboard
          </button>
          <button
            className={`chart-tab-btn ${activeTab === 'kinetic' ? 'active' : ''}`}
            onClick={() => setActiveTab('kinetic')}
          >
            <TrendingUp size={14} /> Kinetic Curve
          </button>
          <button
            className={`chart-tab-btn ${activeTab === 'rate' ? 'active' : ''}`}
            onClick={() => setActiveTab('rate')}
          >
            <Activity size={14} /> Extraction Velocity (dY/dt)
          </button>
          <button
            className={`chart-tab-btn ${activeTab === 'composition' ? 'active' : ''}`}
            onClick={() => setActiveTab('composition')}
          >
            <PieIcon size={14} /> Biomass Fractions
          </button>
          <button
            className={`chart-tab-btn ${activeTab === 'radar' ? 'active' : ''}`}
            onClick={() => setActiveTab('radar')}
          >
            <Compass size={14} /> Process Envelope
          </button>
        </div>
      </div>

      {/* ── Tab View 1: Comprehensive Dashboard (Grid of 4 Core Charts) ── */}
      {activeTab === 'overview' && (
        <div className="charts-overview-grid">
          {/* Main Kinetic Yield Curve */}
          <div className="chart-card-box full-width">
            <div className="chart-card-header">
              <div className="chart-badge-title">
                <TrendingUp size={15} color="#2D6A4F" />
                <span>Simulated Kinetic Yield Curve vs Reaction Time</span>
              </div>
              <span className="chart-tag-pill">Optimal Peak: {highlightTime} min</span>
            </div>
            <div className="chart-body-container" style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={yieldData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="suiteYieldGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2D6A4F" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#2D6A4F" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis
                    dataKey="time"
                    label={{ value: 'Reaction Time (min)', position: 'insideBottomRight', offset: -5, style: { fontSize: 11, fill: '#64748B' } }}
                    tick={{ fontSize: 11, fill: '#64748B' }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    label={{ value: 'Lignin Yield (%)', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 11, fill: '#64748B' } }}
                    tick={{ fontSize: 11, fill: '#64748B' }}
                  />
                  <Tooltip
                    formatter={(val) => [`${val}%`, 'Simulated Yield']}
                    labelFormatter={(label) => `Time: ${label} min`}
                    contentStyle={{ borderRadius: 8, borderColor: '#D8F3DC', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
                  />
                  {highlightTime && (
                    <ReferenceLine
                      x={Number(highlightTime)}
                      stroke="#1B4332"
                      strokeDasharray="4 4"
                      strokeWidth={2}
                      label={{ value: `Optimal ${highlightTime}m`, position: 'top', fill: '#1B4332', fontSize: 11, fontWeight: 'bold' }}
                    />
                  )}
                  <Area
                    type="monotone"
                    dataKey="yield"
                    stroke="#2D6A4F"
                    strokeWidth={2.5}
                    fill="url(#suiteYieldGrad)"
                    dot={{ r: 3.5, fill: '#2D6A4F', stroke: '#fff', strokeWidth: 1.5 }}
                    activeDot={{ r: 6, fill: '#1B4332', stroke: '#fff', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Dissolution Velocity (dY/dt) */}
          <div className="chart-card-box">
            <div className="chart-card-header">
              <div className="chart-badge-title">
                <Activity size={15} color="#1B7A5C" />
                <span>Extraction Velocity (dYield / dt)</span>
              </div>
              <span className="chart-tag-pill">Differential Kinetics</span>
            </div>
            <div className="chart-body-container" style={{ height: 230 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rateData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748B' }} />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#64748B' }}
                    label={{ value: '% / min', angle: -90, position: 'insideLeft', offset: 12, style: { fontSize: 10, fill: '#64748B' } }}
                  />
                  <Tooltip
                    formatter={(val) => [`${val} %/min`, 'Dissolution Velocity']}
                    contentStyle={{ borderRadius: 8, borderColor: '#D8F3DC' }}
                  />
                  <Bar dataKey="rate" fill="#52B788" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Biomass Composition Donut */}
          <div className="chart-card-box">
            <div className="chart-card-header">
              <div className="chart-badge-title">
                <PieIcon size={15} color="#2D6A4F" />
                <span>Biomass Composition Mass Balance</span>
              </div>
              <span className="chart-tag-pill">{formData.feedMaterial || 'Feedstock'}</span>
            </div>
            <div className="chart-body-container" style={{ height: 230 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={compositionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {compositionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val, name) => [`${val}%`, name]}
                    contentStyle={{ borderRadius: 8, borderColor: '#D8F3DC' }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 11, color: '#475569' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Process Envelope Radar */}
          <div className="chart-card-box full-width">
            <div className="chart-card-header">
              <div className="chart-badge-title">
                <Compass size={15} color="#2D6A4F" />
                <span>Process Optimization Radar Envelope</span>
              </div>
              <span className="chart-tag-pill">Multi-factor Operating Index</span>
            </div>
            <div className="chart-body-container" style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius={85} data={radarData}>
                  <PolarGrid stroke="#E2E8F0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: '#94A3B8' }} />
                  <Radar
                    name="Operational Index"
                    dataKey="score"
                    stroke="#2D6A4F"
                    fill="#52B788"
                    fillOpacity={0.4}
                  />
                  <Tooltip
                    formatter={(val) => [`${val} / 100`, 'Operating Index']}
                    contentStyle={{ borderRadius: 8, borderColor: '#D8F3DC' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab View 2: Detailed Kinetic Curve ──────────────────────────── */}
      {activeTab === 'kinetic' && (
        <div className="chart-single-detailed">
          <div className="detailed-chart-box">
            <div className="chart-card-header">
              <div>
                <h4 className="detailed-view-title">Kinetic Extraction Profile (0 – 180 min)</h4>
                <p className="detailed-view-desc">
                  Simulated dynamic yield trajectory showing rapid initial dissolution phase transitioning to equilibrium.
                </p>
              </div>
              <span className="chart-tag-pill highlight">Peak: {highlightTime} min</span>
            </div>
            <div style={{ height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={yieldData} margin={{ top: 15, right: 30, left: 10, bottom: 15 }}>
                  <defs>
                    <linearGradient id="bigYieldGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2D6A4F" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#2D6A4F" stopOpacity={0.03} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis
                    dataKey="time"
                    label={{ value: 'Extraction Time (min)', position: 'insideBottom', offset: -10, style: { fill: '#475569', fontSize: 12, fontWeight: 600 } }}
                    tick={{ fontSize: 12, fill: '#64748B' }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    label={{ value: 'Lignin Yield (%)', angle: -90, position: 'insideLeft', offset: 5, style: { fill: '#475569', fontSize: 12, fontWeight: 600 } }}
                    tick={{ fontSize: 12, fill: '#64748B' }}
                  />
                  <Tooltip
                    formatter={(val) => [`${val}%`, 'Simulated Yield']}
                    labelFormatter={(label) => `Reaction Time: ${label} min`}
                    contentStyle={{ borderRadius: 8, borderColor: '#52B788', boxShadow: '0 6px 16px rgba(0,0,0,0.08)' }}
                  />
                  {highlightTime && (
                    <ReferenceLine
                      x={Number(highlightTime)}
                      stroke="#1B4332"
                      strokeDasharray="5 5"
                      strokeWidth={2}
                      label={{ value: `Optimal Operating Peak: ${highlightTime} min`, position: 'top', fill: '#1B4332', fontSize: 12, fontWeight: 'bold' }}
                    />
                  )}
                  <Area
                    type="monotone"
                    dataKey="yield"
                    stroke="#2D6A4F"
                    strokeWidth={3}
                    fill="url(#bigYieldGrad)"
                    dot={{ r: 4.5, fill: '#2D6A4F', stroke: '#fff', strokeWidth: 2 }}
                    activeDot={{ r: 7, fill: '#1B4332', stroke: '#fff', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab View 3: Dissolution Velocity ─────────────────────────────── */}
      {activeTab === 'rate' && (
        <div className="chart-single-detailed">
          <div className="detailed-chart-box">
            <div className="chart-card-header">
              <div>
                <h4 className="detailed-view-title">Dissolution Velocity (dYield / dt)</h4>
                <p className="detailed-view-desc">
                  Rate of lignin extraction (% yield increase per minute). High initial rate indicates active solvent diffusion into the biomass cell wall.
                </p>
              </div>
              <span className="chart-tag-pill">Differential Kinetics</span>
            </div>
            <div style={{ height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rateData} margin={{ top: 15, right: 30, left: 10, bottom: 15 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis
                    dataKey="time"
                    label={{ value: 'Timeline Interval', position: 'insideBottom', offset: -10, style: { fill: '#475569', fontSize: 12, fontWeight: 600 } }}
                    tick={{ fontSize: 12, fill: '#64748B' }}
                  />
                  <YAxis
                    label={{ value: 'Extraction Rate (% / min)', angle: -90, position: 'insideLeft', offset: 5, style: { fill: '#475569', fontSize: 12, fontWeight: 600 } }}
                    tick={{ fontSize: 12, fill: '#64748B' }}
                  />
                  <Tooltip
                    formatter={(val) => [`${val} %/min`, 'Extraction Rate']}
                    contentStyle={{ borderRadius: 8, borderColor: '#52B788' }}
                  />
                  <Bar dataKey="rate" fill="#2D6A4F" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab View 4: Biomass Composition ─────────────────────────────── */}
      {activeTab === 'composition' && (
        <div className="chart-single-detailed">
          <div className="detailed-chart-box">
            <div className="chart-card-header">
              <div>
                <h4 className="detailed-view-title">Feedstock Mass Balance & Structural Lignin</h4>
                <p className="detailed-view-desc">
                  Relative chemical composition of <strong>{formData.feedMaterial || 'Feedstock'}</strong> showing natural biopolymer distribution.
                </p>
              </div>
              <span className="chart-tag-pill">Composition Analysis</span>
            </div>
            <div style={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={compositionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={120}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                  >
                    {compositionData.map((entry, index) => (
                      <Cell key={`det-cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val, name) => [`${val}%`, name]}
                    contentStyle={{ borderRadius: 8, borderColor: '#52B788' }}
                  />
                  <Legend wrapperStyle={{ fontSize: 13, paddingTop: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab View 5: Process Radar ─────────────────────────────────────── */}
      {activeTab === 'radar' && (
        <div className="chart-single-detailed">
          <div className="detailed-chart-box">
            <div className="chart-card-header">
              <div>
                <h4 className="detailed-view-title">Multi-Parameter Operating Envelope Radar</h4>
                <p className="detailed-view-desc">
                  Holistic evaluation of reaction conditions normalized across thermal intensity, solvent chemistry, and kinetic yield response.
                </p>
              </div>
              <span className="chart-tag-pill">Process Quality</span>
            </div>
            <div style={{ height: 360, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius={110} data={radarData}>
                  <PolarGrid stroke="#CBD5E1" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: '#334155', fontWeight: 600 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: '#94A3B8' }} />
                  <Radar
                    name="Operating Index (%)"
                    dataKey="score"
                    stroke="#2D6A4F"
                    fill="#52B788"
                    fillOpacity={0.45}
                  />
                  <Tooltip
                    formatter={(val) => [`${val}%`, 'Operational Efficiency']}
                    contentStyle={{ borderRadius: 8, borderColor: '#52B788' }}
                  />
                  <Legend wrapperStyle={{ fontSize: 13 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
