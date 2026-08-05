import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  getUserTempUnit,
  getTempSymbol,
  convertTempFromCelsius,
  formatTemperature,
} from './tempConverter';

/**
 * Utilities for exporting Lignin Prediction Reports as CSV and publication-grade PDF dossiers.
 */

export function formatModelName(modelKey) {
  if (!modelKey) return 'NODE Augmented';
  const map = {
    'node_augmented': 'NODE Augmented',
    'dnn': 'Deep Neural Net (DNN)',
    'tabnet': 'TabNet Attention',
    'rf': 'Random Forest',
    'xgboost': 'XGBoost',
    'physics_node': 'Physics-Informed NODE',
  };
  return map[modelKey] || modelKey.replace(/_/g, ' ').toUpperCase();
}

/**
 * Download a CSV representation of a prediction or array of predictions
 */
export function exportToCSV(predictionOrList, filename = 'lignin_prediction_report.csv', unitOverride = null) {
  const items = Array.isArray(predictionOrList) ? predictionOrList : [predictionOrList];
  if (!items.length) return;

  const unit = unitOverride || getUserTempUnit();
  const symbol = getTempSymbol(unit);

  const headers = [
    'ID',
    'Date',
    'Model',
    'Feedstock Plant',
    'DES Solvent System',
    `Temperature (${symbol})`,
    'Reaction Time Range',
    'Optimal Time (min)',
    'Predicted Yield (%)',
    'Performance',
    'Confidence (%)',
  ];

  const rows = items.map((p) => [
    p.id || '',
    p.created_at || p.date || new Date().toISOString(),
    p.model || 'N/A',
    p.plant || '',
    p.chemical || '',
    p.temperature != null ? convertTempFromCelsius(p.temperature, unit) : '',
    p.time_range || p.timeRange || '',
    p.recommended_time ?? p.recommendedTime ?? '',
    p.lignin_yield ?? p.ligninYield ?? '',
    p.performance || '',
    p.confidence ? `${p.confidence}%` : '',
  ]);

  let csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');

  // If single item and has yield curve, append kinetic curve table
  const curve = predictionOrList.yield_curve || predictionOrList.yieldCurve;
  if (!Array.isArray(predictionOrList) && curve?.length) {
    csvContent += '\n\nKinetic Yield Curve Simulation Points\nTime (min),Simulated Yield (%)\n';
    curve.forEach((pt) => {
      csvContent += `${pt.time},${pt.yield_value ?? pt.yield ?? pt.yieldValue}\n`;
    });
  }

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ─────────────────────────────────────────────────────────────────────────────
// High-Resolution 2X Offscreen Canvas Chart Renderers for PDF Embeds
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 1. Kinetic Yield Curve (Simulated Yield % vs Reaction Time in min)
 */
function renderKineticCurveCanvas(curve, optTime, width = 800, height = 270) {
  const canvas = document.createElement('canvas');
  const dpr = 2;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  // Card Background with light border
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1;
  ctx.strokeRect(0.5, 0.5, width - 1, height - 1);

  const mLeft = 75; // Generous left margin to avoid Y-axis label collision
  const mRight = 40;
  const mTop = 32;
  const mBottom = 42;
  const plotW = width - mLeft - mRight;
  const plotH = height - mTop - mBottom;

  const pts = (curve && curve.length > 0) ? curve.map(p => ({
    time: Number(p.time),
    yield: Number(p.yield_value ?? p.yield ?? p.yieldValue ?? 0),
  })) : [
    { time: 10, yield: 20 }, { time: 30, yield: 45 }, { time: 60, yield: 68 },
    { time: 90, yield: 78 }, { time: 120, yield: 82 }, { time: 160, yield: 84 },
  ];

  const minT = 0;
  const maxT = Math.max(180, ...pts.map(p => p.time));
  const minY = 0;
  const maxY = 100;

  const getX = (t) => mLeft + ((t - minT) / (maxT - minT)) * plotW;
  const getY = (y) => mTop + plotH - ((y - minY) / (maxY - minY)) * plotH;

  // Grid & Y-Axis ticks
  ctx.strokeStyle = '#F1F5F9';
  ctx.lineWidth = 1;
  ctx.fillStyle = '#64748B';
  ctx.font = '11px sans-serif';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';

  for (let yVal = 0; yVal <= 100; yVal += 20) {
    const yPos = getY(yVal);
    ctx.beginPath();
    ctx.moveTo(mLeft, yPos);
    ctx.lineTo(mLeft + plotW, yPos);
    ctx.stroke();
    ctx.fillText(`${yVal}%`, mLeft - 10, yPos);
  }

  // X-Axis ticks
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  for (let tVal = 0; tVal <= maxT; tVal += 30) {
    const xPos = getX(tVal);
    ctx.beginPath();
    ctx.moveTo(xPos, mTop);
    ctx.lineTo(xPos, mTop + plotH);
    ctx.stroke();
    ctx.fillText(`${tVal}m`, xPos, mTop + plotH + 8);
  }

  // Y-Axis Title (Rotated with safe offset from tick numbers)
  ctx.save();
  ctx.translate(22, mTop + plotH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#334155';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText('Lignin Extraction Yield (%)', 0, 0);
  ctx.restore();

  // X-Axis Title
  ctx.fillStyle = '#334155';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Reaction Extraction Time (minutes)', mLeft + plotW / 2, mTop + plotH + 26);

  // Gradient under curve
  if (pts.length > 0) {
    const grad = ctx.createLinearGradient(0, mTop, 0, mTop + plotH);
    grad.addColorStop(0, 'rgba(45, 106, 79, 0.28)');
    grad.addColorStop(1, 'rgba(45, 106, 79, 0.02)');

    ctx.beginPath();
    ctx.moveTo(getX(pts[0].time), getY(0));
    ctx.lineTo(getX(pts[0].time), getY(pts[0].yield));
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(getX(pts[i].time), getY(pts[i].yield));
    }
    ctx.lineTo(getX(pts[pts.length - 1].time), getY(0));
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Line stroke
    ctx.beginPath();
    ctx.moveTo(getX(pts[0].time), getY(pts[0].yield));
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(getX(pts[i].time), getY(pts[i].yield));
    }
    ctx.strokeStyle = '#2D6A4F';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Data dots
    pts.forEach((p) => {
      ctx.beginPath();
      ctx.arc(getX(p.time), getY(p.yield), 4, 0, Math.PI * 2);
      ctx.fillStyle = '#2D6A4F';
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
  }

  // Optimal Peak Reference Line & Badge
  if (optTime) {
    const optX = getX(Number(optTime));
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = '#1B4332';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(optX, mTop);
    ctx.lineTo(optX, mTop + plotH);
    ctx.stroke();
    ctx.setLineDash([]);

    // Safe clamped badge position
    const badgeW = 96;
    const badgeH = 18;
    const badgeX = Math.min(optX - badgeW / 2, width - mRight - badgeW);
    const badgeY = mTop - 22;

    ctx.fillStyle = '#1B4332';
    ctx.fillRect(badgeX, badgeY, badgeW, badgeH);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 9.5px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`Optimal: ${optTime} min`, badgeX + badgeW / 2, badgeY + badgeH / 2);
  }

  return canvas.toDataURL('image/png');
}

/**
 * 2. Dissolution Velocity (dYield / dt %/min)
 */
function renderVelocityChartCanvas(curve, width = 800, height = 240) {
  const canvas = document.createElement('canvas');
  const dpr = 2;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1;
  ctx.strokeRect(0.5, 0.5, width - 1, height - 1);

  const mLeft = 75; // Generous left margin to avoid collision with decimals
  const mRight = 40;
  const mTop = 28;
  const mBottom = 42;
  const plotW = width - mLeft - mRight;
  const plotH = height - mTop - mBottom;

  const pts = (curve && curve.length > 0) ? curve.map(p => ({
    time: Number(p.time),
    yield: Number(p.yield_value ?? p.yield ?? p.yieldValue ?? 0),
  })) : [];

  const rates = [];
  for (let i = 1; i < pts.length; i++) {
    const dt = pts[i].time - pts[i - 1].time;
    const dy = pts[i].yield - pts[i - 1].yield;
    const rate = dt > 0 ? Math.max(0, Number((dy / dt).toFixed(2))) : 0;
    rates.push({ time: `${pts[i].time}m`, rate });
  }

  if (rates.length === 0) {
    rates.push({ time: '30m', rate: 1.5 }, { time: '60m', rate: 0.8 }, { time: '90m', rate: 0.35 }, { time: '120m', rate: 0.1 });
  }

  const maxRate = Math.max(0.2, ...rates.map(r => r.rate)) * 1.35;

  // Grid & Y Ticks
  ctx.strokeStyle = '#F1F5F9';
  ctx.lineWidth = 1;
  ctx.fillStyle = '#64748B';
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';

  for (let i = 0; i <= 4; i++) {
    const val = Number(((maxRate / 4) * i).toFixed(2));
    const yPos = mTop + plotH - (val / maxRate) * plotH;
    ctx.beginPath();
    ctx.moveTo(mLeft, yPos);
    ctx.lineTo(mLeft + plotW, yPos);
    ctx.stroke();
    ctx.fillText(`${val}`, mLeft - 10, yPos);
  }

  // Y-Axis Title (Rotated with safe offset)
  ctx.save();
  ctx.translate(22, mTop + plotH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#334155';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText('Velocity (% / min)', 0, 0);
  ctx.restore();

  // X-Axis Title
  ctx.fillStyle = '#334155';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Reaction Timeline Interval', mLeft + plotW / 2, mTop + plotH + 26);

  // Bars
  const barWidth = Math.min(28, (plotW / rates.length) * 0.65);
  const step = plotW / rates.length;

  rates.forEach((r, idx) => {
    const cx = mLeft + idx * step + step / 2;
    const barH = (r.rate / maxRate) * plotH;
    const barY = mTop + plotH - barH;

    ctx.fillStyle = '#52B788';
    ctx.beginPath();
    ctx.roundRect(cx - barWidth / 2, barY, barWidth, barH, [3, 3, 0, 0]);
    ctx.fill();

    // Value text above bar
    ctx.fillStyle = '#1B4332';
    ctx.font = 'bold 8.5px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(`${r.rate}`, cx, barY - 2);

    // X-axis interval tick
    ctx.fillStyle = '#64748B';
    ctx.font = '9.5px sans-serif';
    ctx.textBaseline = 'top';
    ctx.fillText(r.time, cx, mTop + plotH + 6);
  });

  return canvas.toDataURL('image/png');
}

/**
 * 3. Process Optimization Radar Envelope (Self-contained panel)
 */
function renderRadarEnvelopeCanvas(radarData, width = 450, height = 360) {
  const canvas = document.createElement('canvas');
  const dpr = 2;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1;
  ctx.strokeRect(0.5, 0.5, width - 1, height - 1);

  // Title inside card
  ctx.fillStyle = '#1B4332';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('Operating Envelope Radar', width / 2, 14);

  const cx = width / 2;
  const cy = 175;
  const radius = 95;
  const items = radarData || [
    { subject: 'Thermal Temp', score: 62 },
    { subject: 'Molar Ratio', score: 75 },
    { subject: 'Solvent/Solid', score: 60 },
    { subject: 'Kinetic Reach', score: 56 },
    { subject: 'Confidence', score: 85 },
    { subject: 'Yield Output', score: 78 },
  ];
  const count = items.length;

  // Polar Rings
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1;
  for (let rLevel = 1; rLevel <= 5; rLevel++) {
    const r = (radius / 5) * rLevel;
    ctx.beginPath();
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i - Math.PI / 2;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  }

  // Spokes & Labels
  ctx.fillStyle = '#334155';
  ctx.font = 'bold 9.5px sans-serif';
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 / count) * i - Math.PI / 2;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;

    ctx.strokeStyle = '#CBD5E1';
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(x, y);
    ctx.stroke();

    const labelX = cx + Math.cos(angle) * (radius + 20);
    const labelY = cy + Math.sin(angle) * (radius + 16);
    ctx.textAlign = Math.abs(Math.cos(angle)) < 0.3 ? 'center' : Math.cos(angle) > 0 ? 'left' : 'right';
    ctx.textBaseline = Math.abs(Math.sin(angle)) < 0.3 ? 'middle' : Math.sin(angle) > 0 ? 'top' : 'bottom';
    ctx.fillText(items[i].subject, labelX, labelY);
  }

  // Polygon
  ctx.beginPath();
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 / count) * i - Math.PI / 2;
    const r = (items[i].score / 100) * radius;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = 'rgba(82, 183, 136, 0.45)';
  ctx.fill();
  ctx.strokeStyle = '#2D6A4F';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Dots
  items.forEach((it, i) => {
    const angle = (Math.PI * 2 / count) * i - Math.PI / 2;
    const r = (it.score / 100) * radius;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;

    ctx.beginPath();
    ctx.arc(x, y, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#2D6A4F';
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  });

  // Footer note inside card
  ctx.fillStyle = '#64748B';
  ctx.font = '9px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Multi-Parameter Normalized Operating Index (0 – 100)', width / 2, height - 14);

  return canvas.toDataURL('image/png');
}

/**
 * 4. Biomass Mass Balance Donut (Self-contained panel with integrated compact legend)
 */
function renderBiomassDonutCanvas(composition, plantName = 'Biomass', width = 450, height = 360) {
  const canvas = document.createElement('canvas');
  const dpr = 2;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1;
  ctx.strokeRect(0.5, 0.5, width - 1, height - 1);

  // Title inside card
  ctx.fillStyle = '#1B4332';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('Biomass Feedstock Mass Balance', width / 2, 14);

  const cx = width / 2;
  const cy = 135;
  const outerR = 76;
  const innerR = 46;

  const slices = composition || [
    { name: 'Cellulose', value: 44.3, color: '#2D6A4F' },
    { name: 'Lignin Content', value: 27.9, color: '#1B7A5C' },
    { name: 'Hemicellulose', value: 20.0, color: '#52B788' },
    { name: 'Ash / Extractives', value: 7.8, color: '#95D5B2' },
  ];

  const total = slices.reduce((sum, s) => sum + s.value, 0) || 100;
  let startAngle = -Math.PI / 2;

  slices.forEach((s) => {
    const sliceAngle = (s.value / total) * (Math.PI * 2);
    const endAngle = startAngle + sliceAngle;

    ctx.beginPath();
    ctx.arc(cx, cy, outerR, startAngle, endAngle);
    ctx.arc(cx, cy, innerR, endAngle, startAngle, true);
    ctx.closePath();
    ctx.fillStyle = s.color;
    ctx.fill();

    startAngle = endAngle;
  });

  // Center Donut text
  ctx.fillStyle = '#1B4332';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(plantName.toUpperCase(), cx, cy - 6);
  ctx.fillStyle = '#64748B';
  ctx.font = '9px sans-serif';
  ctx.fillText('Mass Balance', cx, cy + 8);

  // Compact 2-column Legend centered directly inside this card box
  const legY = 248;
  slices.forEach((s, idx) => {
    const row = Math.floor(idx / 2);
    const col = idx % 2;
    const lx = 45 + col * 200;
    const ly = legY + row * 24;

    ctx.fillStyle = s.color;
    ctx.beginPath();
    ctx.roundRect(lx, ly, 12, 12, [2, 2, 2, 2]);
    ctx.fill();

    ctx.fillStyle = '#334155';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${s.name}: ${s.value}%`, lx + 18, ly + 6);
  });

  return canvas.toDataURL('image/png');
}

/**
 * 5. Multi-Run Kinetic Yield Overlay Chart (Overlays all predictions in the report)
 */
function renderMultiKineticOverlayCanvas(predictionsList, width = 800, height = 280) {
  const canvas = document.createElement('canvas');
  const dpr = 2;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1;
  ctx.strokeRect(0.5, 0.5, width - 1, height - 1);

  const colors = ['#2D6A4F', '#2563EB', '#D97706', '#7C3AED', '#0D9488', '#E11D48', '#059669', '#4F46E5'];
  const mLeft = 75;
  const mRight = 30;
  const mTop = 46;
  const mBottom = 42;
  const plotW = width - mLeft - mRight;
  const plotH = height - mTop - mBottom;

  const minT = 0;
  let maxT = 180;
  predictionsList.forEach((p) => {
    const curve = p.yield_curve || p.yieldCurve || [];
    curve.forEach((pt) => {
      if (Number(pt.time) > maxT) maxT = Number(pt.time);
    });
  });

  const minY = 0;
  const maxY = 100;
  const getX = (t) => mLeft + ((t - minT) / (maxT - minT)) * plotW;
  const getY = (y) => mTop + plotH - ((y - minY) / (maxY - minY)) * plotH;

  // Grid
  ctx.strokeStyle = '#F1F5F9';
  ctx.lineWidth = 1;
  ctx.fillStyle = '#64748B';
  ctx.font = '11px sans-serif';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';

  for (let yVal = 0; yVal <= 100; yVal += 20) {
    const yPos = getY(yVal);
    ctx.beginPath();
    ctx.moveTo(mLeft, yPos);
    ctx.lineTo(mLeft + plotW, yPos);
    ctx.stroke();
    ctx.fillText(`${yVal}%`, mLeft - 10, yPos);
  }

  // X-Axis
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  for (let tVal = 0; tVal <= maxT; tVal += 30) {
    const xPos = getX(tVal);
    ctx.beginPath();
    ctx.moveTo(xPos, mTop);
    ctx.lineTo(xPos, mTop + plotH);
    ctx.stroke();
    ctx.fillText(`${tVal}m`, xPos, mTop + plotH + 8);
  }

  // Y-Axis Title
  ctx.save();
  ctx.translate(22, mTop + plotH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#334155';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText('Lignin Extraction Yield (%)', 0, 0);
  ctx.restore();

  // X-Axis Title
  ctx.fillStyle = '#334155';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Reaction Extraction Time (minutes)', mLeft + plotW / 2, mTop + plotH + 26);

  // Draw curves
  predictionsList.forEach((p, idx) => {
    const col = colors[idx % colors.length];
    const curve = (p.yield_curve || p.yieldCurve || []).map((pt) => ({
      time: Number(pt.time),
      yield: Number(pt.yield_value ?? pt.yield ?? pt.yieldValue ?? 0),
    }));

    if (curve.length > 0) {
      ctx.beginPath();
      ctx.moveTo(getX(curve[0].time), getY(curve[0].yield));
      for (let i = 1; i < curve.length; i++) {
        ctx.lineTo(getX(curve[i].time), getY(curve[i].yield));
      }
      ctx.strokeStyle = col;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      curve.forEach((pt) => {
        ctx.beginPath();
        ctx.arc(getX(pt.time), getY(pt.yield), 3.5, 0, Math.PI * 2);
        ctx.fillStyle = col;
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    }
  });

  // Top Legend
  const legXStart = mLeft;
  const legY = 16;
  const maxLegends = Math.min(predictionsList.length, 5);
  const legSpacing = plotW / maxLegends;

  for (let idx = 0; idx < maxLegends; idx++) {
    const p = predictionsList[idx];
    const col = colors[idx % colors.length];
    const lx = legXStart + idx * legSpacing;
    const label = `#${idx + 1} ${(p.plant || 'Feedstock').toUpperCase()}`;

    ctx.fillStyle = col;
    ctx.fillRect(lx, legY, 14, 4);
    ctx.beginPath();
    ctx.arc(lx + 7, legY + 2, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#334155';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(label.length > 20 ? label.substring(0, 18) + '…' : label, lx + 18, legY + 2);
  }

  return canvas.toDataURL('image/png');
}

/**
 * 6. Multi-Run Yield & Velocity Comparison Bar Chart
 */
function renderMultiYieldComparisonCanvas(predictionsList, width = 800, height = 240) {
  const canvas = document.createElement('canvas');
  const dpr = 2;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1;
  ctx.strokeRect(0.5, 0.5, width - 1, height - 1);

  const colors = ['#2D6A4F', '#2563EB', '#D97706', '#7C3AED', '#0D9488', '#E11D48', '#059669', '#4F46E5'];
  const mLeft = 75;
  const mRight = 30;
  const mTop = 35;
  const mBottom = 45;
  const plotW = width - mLeft - mRight;
  const plotH = height - mTop - mBottom;

  const count = predictionsList.length;
  const slotW = plotW / count;
  const barW = Math.min(48, slotW * 0.55);

  // Y-axis grid
  ctx.strokeStyle = '#F1F5F9';
  ctx.lineWidth = 1;
  ctx.fillStyle = '#64748B';
  ctx.font = '11px sans-serif';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';

  for (let yVal = 0; yVal <= 100; yVal += 20) {
    const yPos = mTop + plotH - (yVal / 100) * plotH;
    ctx.beginPath();
    ctx.moveTo(mLeft, yPos);
    ctx.lineTo(mLeft + plotW, yPos);
    ctx.stroke();
    ctx.fillText(`${yVal}%`, mLeft - 10, yPos);
  }

  // Y-Axis Title
  ctx.save();
  ctx.translate(22, mTop + plotH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#334155';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText('Peak Extraction Yield (%)', 0, 0);
  ctx.restore();

  // Draw Bars
  predictionsList.forEach((p, idx) => {
    const col = colors[idx % colors.length];
    const yieldVal = Number(p.lignin_yield ?? p.ligninYield ?? 0);
    const optTime = p.recommended_time ?? p.recommendedTime ?? '—';
    const barH = (Math.min(100, Math.max(0, yieldVal)) / 100) * plotH;
    const cx = mLeft + idx * slotW + slotW / 2;
    const bx = cx - barW / 2;
    const by = mTop + plotH - barH;

    // Bar
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.roundRect(bx, by, barW, barH, [4, 4, 0, 0]);
    ctx.fill();

    // Value label on top
    ctx.fillStyle = col;
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(`${yieldVal}%`, cx, by - 4);

    // Label below X-axis
    ctx.fillStyle = '#1E293B';
    ctx.font = 'bold 10px sans-serif';
    ctx.textBaseline = 'top';
    const label = `#${idx + 1} ${(p.plant || 'Biomass').toUpperCase()}`;
    ctx.fillText(label.length > 15 ? label.substring(0, 13) + '…' : label, cx, mTop + plotH + 8);

    ctx.fillStyle = '#64748B';
    ctx.font = '9px sans-serif';
    const unit = getUserTempUnit();
    const formattedTemp = formatTemperature(p.temperature ?? 100, unit);
    ctx.fillText(`${formattedTemp} • ${optTime}m`, cx, mTop + plotH + 23);
  });

  return canvas.toDataURL('image/png');
}

/**
 * Render 2-page detailed analytics dossier for an individual prediction run
 */
function renderPredictionDossierPages(doc, prediction, index = 0, totalRuns = 1, isFirstPage = false) {
  const yieldVal = prediction.lignin_yield ?? prediction.ligninYield ?? '65.1';
  const optTime = prediction.recommended_time ?? prediction.recommendedTime ?? '160';
  const perf = prediction.performance ?? 'Good';
  const conf = prediction.confidence ?? '85.0';
  const rawPlant = prediction.plant || 'Bamboo';
  const plant = rawPlant.replace(/_/g, ' ').toUpperCase();
  const chem = (prediction.chemical || 'DES System').replace(/_/g, ' + ').toUpperCase();
  const temp = prediction.temperature ?? 100;
  const timeRange = prediction.time_range ?? prediction.timeRange ?? '10 – 160 min';
  const curve = prediction.yield_curve || prediction.yieldCurve || [];
  const cellulose = prediction.cellulose_percent ?? prediction.cellulosePercent ?? 44.3;
  const hemicellulose = prediction.hemicellulose_percent ?? prediction.hemicellulosePercent ?? 20.0;
  const lignin = prediction.lignin_percent ?? prediction.ligninPercent ?? 27.9;
  const sizeMm = prediction.size_mm ?? prediction.sizeMm ?? 0.54;
  const hbdHbaRatio = prediction.hbd_hba_ratio ?? prediction.hbdHbaRatio ?? 6.0;
  const lsr = prediction.liquid_solid_ratio ?? prediction.liquidSolidRatio ?? 18;
  const modelTitle = formatModelName(prediction.model);

  const ashExtractives = Math.max(0, Number((100 - (Number(cellulose) + Number(hemicellulose) + Number(lignin))).toFixed(1)));
  const compositionData = [
    { name: 'Cellulose', value: Number(cellulose), color: '#2D6A4F' },
    { name: 'Lignin Content', value: Number(lignin), color: '#1B7A5C' },
    { name: 'Hemicellulose', value: Number(hemicellulose), color: '#52B788' },
    { name: 'Ash / Extractives', value: ashExtractives, color: '#95D5B2' },
  ];

  const radarData = [
    { subject: 'Thermal Temp', score: Math.min(100, Math.round((Number(temp) / 160) * 100)) },
    { subject: 'Molar Ratio', score: Math.min(100, Math.round((Number(hbdHbaRatio) / 8) * 100)) },
    { subject: 'Solvent/Solid', score: Math.min(100, Math.round((Number(lsr) / 30) * 100)) },
    { subject: 'Kinetic Reach', score: Math.min(100, Math.round((Number(optTime) / 160) * 100)) },
    { subject: 'Confidence', score: Math.round(Number(conf)) },
    { subject: 'Yield Output', score: Math.min(100, Math.round(Number(yieldVal))) },
  ];

  // ── Page A: Parameters + Kinetic Curve + Velocity ───────────────────────────
  if (!isFirstPage) {
    doc.addPage();
  }
  doc.setFillColor(27, 67, 50); // #1B4332
  doc.rect(0, 0, 210, 26, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  const pageTitle = totalRuns > 1
    ? `RUN #${index + 1} DOSSIER: ${plant}`
    : 'LIGNIN EXTRACTION PREDICTION DOSSIER';
  doc.text(pageTitle, 14, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(216, 243, 220);
  doc.text(`Biorefinery AI Optimization  |  Model: ${modelTitle}  |  Solvent: ${chem}`, 14, 17);
  doc.text(`Generated: ${new Date().toLocaleString()}  |  Confidential Research Analytics`, 14, 22);

  const cardY = 30;
  const cardWidth = 43;
  const cardHeight = 18;
  const gap = 3;
  const startX = 14;

  const kpis = [
    { label: 'PREDICTED YIELD', val: `${yieldVal}%`, color: [45, 106, 79] },
    { label: 'OPTIMAL TIME', val: `${optTime} min`, color: [30, 41, 59] },
    { label: 'CONFIDENCE', val: `${conf}%`, color: [45, 106, 79] },
    { label: 'PERFORMANCE', val: String(perf), color: [16, 185, 129] },
  ];

  kpis.forEach((kpi, idx) => {
    const x = startX + idx * (cardWidth + gap);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, cardY, cardWidth, cardHeight, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.label, x + cardWidth / 2, cardY + 6, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...kpi.color);
    doc.text(kpi.val, x + cardWidth / 2, cardY + 14, { align: 'center' });
  });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text('1. Experimental Reaction Parameters', 14, 53);

  const unit = getUserTempUnit();
  const formattedTemp = formatTemperature(temp, unit);

  autoTable(doc, {
    startY: 56,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2, textColor: [30, 41, 59] },
    headStyles: { fillColor: [45, 106, 79], textColor: [255, 255, 255], fontStyle: 'bold' },
    head: [['Parameter Category', 'Specified Value', 'Parameter Category', 'Specified Value']],
    body: [
      ['Feedstock Biomass', plant, 'Particle Size', `${sizeMm} mm`],
      ['DES Solvent System', chem, 'HBD : HBA Molar Ratio', `${hbdHbaRatio}`],
      ['Reaction Temperature', formattedTemp, 'Solid-to-Liquid Ratio', `1:${lsr}`],
      ['Cellulose / Hemicellulose', `${cellulose}% / ${hemicellulose}%`, 'Feedstock Lignin Content', `${lignin}%`],
      ['AI Prediction Model', modelTitle, 'Reaction Time Window', `${timeRange} min`],
    ],
    margin: { left: 14, right: 14 },
  });

  const graph1Y = doc.lastAutoTable.finalY + 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text(`2. Simulated Kinetic Yield Trajectory (${plant})`, 14, graph1Y);

  const kineticImg = renderKineticCurveCanvas(curve, optTime, 800, 270);
  doc.addImage(kineticImg, 'PNG', 14, graph1Y + 3, 182, 58);

  const graph2Y = graph1Y + 65;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text('3. Extraction Velocity & Differential Rate (dYield / dt)', 14, graph2Y);

  const velocityImg = renderVelocityChartCanvas(curve, 800, 240);
  doc.addImage(velocityImg, 'PNG', 14, graph2Y + 3, 182, 52);

  // ── Page B: Radar + Donut + Time-series Table ───────────────────────────────
  doc.addPage();
  doc.setFillColor(27, 67, 50);
  doc.rect(0, 0, 210, 16, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  const pageBTitle = totalRuns > 1
    ? `RUN #${index + 1} PROCESS OPTIMIZATION & TIME-SERIES DYNAMICS`
    : 'ANALYTICS & COMPREHENSIVE KINETIC TRAJECTORY';
  doc.text(pageBTitle, 14, 11);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text(`4. Process Optimization Radar & Feedstock Mass Balance (${plant})`, 14, 23);

  const radarImg = renderRadarEnvelopeCanvas(radarData, 450, 360);
  doc.addImage(radarImg, 'PNG', 14, 27, 88, 70);

  const donutImg = renderBiomassDonutCanvas(compositionData, rawPlant, 450, 360);
  doc.addImage(donutImg, 'PNG', 108, 27, 88, 70);

  const tableY = 103;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text('5. Full Reaction Time-Series Data Points', 14, tableY);

  const curveRows = (curve.length > 0 ? curve : [
    { time: 10, yield_value: yieldVal },
    { time: 30, yield_value: yieldVal },
    { time: 60, yield_value: yieldVal },
    { time: 90, yield_value: yieldVal },
    { time: 120, yield_value: yieldVal },
    { time: 160, yield_value: yieldVal },
  ]).map((pt) => {
    const isPeak = Number(pt.time) === Number(optTime);
    const isExtraction = Number(pt.time) < Number(optTime);
    return [
      `${pt.time} min`,
      `${pt.yield_value ?? pt.yield ?? pt.yieldValue}%`,
      isPeak ? 'OPTIMAL OPERATING PEAK' : isExtraction ? 'Rapid Extraction Phase' : 'Equilibrium Phase',
    ];
  });

  autoTable(doc, {
    startY: tableY + 3,
    theme: 'striped',
    styles: { fontSize: 7.5, cellPadding: 1.8, textColor: [51, 65, 85] },
    headStyles: { fillColor: [45, 106, 79], textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    head: [['Reaction Time (min)', 'Simulated Lignin Yield (%)', 'Process Dynamics Stage']],
    body: curveRows,
    margin: { left: 14, right: 14 },
    didParseCell: (data) => {
      if (data.row.raw && data.row.raw[2] === 'OPTIMAL OPERATING PEAK') {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.textColor = [45, 106, 79];
        data.cell.styles.fillColor = [216, 243, 220];
      }
    },
  });
}

/**
 * Generate and trigger direct download of a professional vector + chart-embedded PDF report.
 * Supports both single prediction objects and arrays of predictions for multi-run reports.
 */
export function exportToPrintablePDF(predictionOrList, modelName = 'ML Architecture') {
  if (!predictionOrList) return;

  const isArray = Array.isArray(predictionOrList);
  const list = isArray ? predictionOrList : [predictionOrList];
  if (!list.length) return;

  const activeModelName = modelName || list[0]?.model || 'NODE Augmented';

  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    if (list.length > 1) {
      // ═════════════════════════════════════════════════════════════════════════
      // MULTI-RUN DOSSIER REPORT
      // Page 1: Multi-Condition Matrix + Multi-Curve Kinetic Overlay + Comparison Bar
      // ═════════════════════════════════════════════════════════════════════════
      doc.setFillColor(27, 67, 50); // #1B4332
      doc.rect(0, 0, 210, 26, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      doc.text('LIGNIN EXTRACTION MULTI-RUN DOSSIER', 14, 11);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(216, 243, 220);
      doc.text(`Biorefinery Research Analytics  |  Batch Report: ${activeModelName}`, 14, 17);
      doc.text(`Generated: ${new Date().toLocaleString()}  |  Total Predictions: ${list.length}`, 14, 22);

      // Comparison Table
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(30, 41, 59);
      doc.text('1. Multi-Condition Extraction Matrix', 14, 34);

      const unit = getUserTempUnit();
      const symbol = getTempSymbol(unit);

      const tableRows = list.map((p, idx) => [
        `#${idx + 1}`,
        (p.plant || 'Biomass').replace(/_/g, ' ').toUpperCase(),
        (p.chemical || 'DES').replace(/_/g, ' + ').toUpperCase(),
        formatTemperature(p.temperature ?? 100, unit),
        `${p.lignin_yield ?? p.ligninYield ?? '—'}%`,
        `${p.recommended_time ?? p.recommendedTime ?? '—'} min`,
        formatModelName(p.model),
        `${p.confidence ?? 85}%`,
      ]);

      autoTable(doc, {
        startY: 37,
        theme: 'grid',
        styles: { fontSize: 7.5, cellPadding: 2, textColor: [30, 41, 59] },
        headStyles: { fillColor: [45, 106, 79], textColor: [255, 255, 255], fontStyle: 'bold' },
        head: [['#', 'Biomass', 'DES Solvent', `Temp (${symbol})`, 'Yield', 'Optimal Time', 'Model Architecture', 'Confidence']],
        body: tableRows,
        margin: { left: 14, right: 14 },
      });

      // Comparative Multi-Kinetic Overlay (Plots ALL runs)
      const graph1Y = doc.lastAutoTable.finalY + 5;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(30, 41, 59);
      doc.text('2. Comparative Kinetic Trajectory Overlay (All Runs)', 14, graph1Y);

      const multiOverlayImg = renderMultiKineticOverlayCanvas(list, 800, 260);
      doc.addImage(multiOverlayImg, 'PNG', 14, graph1Y + 3, 182, 58);

      // Comparative Peak Yield & Dynamic Rates (Compares ALL runs)
      const graph2Y = graph1Y + 65;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(30, 41, 59);
      doc.text('3. Comparative Peak Yield & Reaction Dynamics', 14, graph2Y);

      const multiBarImg = renderMultiYieldComparisonCanvas(list, 800, 230);
      doc.addImage(multiBarImg, 'PNG', 14, graph2Y + 3, 182, 52);

      // ═════════════════════════════════════════════════════════════════════════
      // Render Individual Full 2-Page Dossiers for EVERY prediction in the report
      // ═════════════════════════════════════════════════════════════════════════
      list.forEach((p, idx) => {
        renderPredictionDossierPages(doc, p, idx, list.length);
      });
    } else {
      // ═════════════════════════════════════════════════════════════════════════
      // SINGLE PREDICTION DOSSIER (2 Pages with all 4 charts)
      // ═════════════════════════════════════════════════════════════════════════
      renderPredictionDossierPages(doc, list[0], 0, 1, true);
    }

    // Footers across all generated pages
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Central Lignin Biorefinery Portal  •  Page ${i} of ${pageCount}  •  Publication-Grade Research Dossier`,
        105,
        290,
        { align: 'center' }
      );
    }

    const cleanTitle = (list.length > 1 ? `batch_${list.length}_runs` : `${list[0]?.plant || 'prediction'}`).toLowerCase().replace(/\s+/g, '_');
    doc.save(`lignin_dossier_${cleanTitle}.pdf`);
  } catch (error) {
    console.error('PDF generation error:', error);
  }
}

