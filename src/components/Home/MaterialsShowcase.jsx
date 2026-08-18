import { Leaf, Droplet, Sparkles, TestTube2, FlaskConical, Dna } from 'lucide-react';
import './MaterialsShowcase.css';

const BIOMASS = [
  'Wheat Straw', 'Corn Stover', 'Rice Husk', 
  'Sugarcane Bagasse', 'Switchgrass', 
  'Pine Wood', 'Poplar Wood', 'Bamboo'
];

const HBA = ['Choline Chloride', 'Betaine', 'Proline', 'TBAC'];
const HBD = ['Lactic Acid', 'Urea', 'Glycerol', 'Ethylene Glycol'];

export default function MaterialsShowcase() {
  return (
    <div className="materials-showcase">
      {/* Background ambient glow */}
      <div className="showcase-ambient-glow" />

      <div className="showcase-card biomass-card">
        <div className="showcase-header">
          <div className="showcase-icon biomass-icon">
            <Leaf size={24} />
          </div>
          <div className="showcase-title">
            <h3>Biomass Feedstocks</h3>
            <p>8+ Lignocellulosic Sources</p>
          </div>
        </div>
        
        <div className="chip-grid">
          {BIOMASS.map((item, idx) => (
            <div className="interactive-chip chip-green" style={{ animationDelay: `${idx * 0.05}s` }} key={item}>
              <Leaf size={14} className="chip-icon" />
              <span>{item}</span>
            </div>
          ))}
        </div>
        
        <div className="showcase-illustration">
          <Dna size={120} strokeWidth={1} className="floating-illustration" />
        </div>
      </div>

      {/* Center connector */}
      <div className="showcase-connector">
        <Sparkles size={24} className="sparkle-icon" />
      </div>

      <div className="showcase-card solvent-card">
        <div className="showcase-header">
          <div className="showcase-icon solvent-icon">
            <Droplet size={24} />
          </div>
          <div className="showcase-title">
            <h3>Deep Eutectic Solvents</h3>
            <p>Configurable HBA/HBD Ratios</p>
          </div>
        </div>

        <div className="solvent-split">
          <div className="solvent-group">
            <span className="solvent-label">Acceptors (HBA)</span>
            <div className="chip-grid small">
              {HBA.map((item, idx) => (
                <div className="interactive-chip chip-blue" style={{ animationDelay: `${idx * 0.1}s` }} key={item}>
                  <TestTube2 size={14} className="chip-icon" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="solvent-group">
            <span className="solvent-label">Donors (HBD)</span>
            <div className="chip-grid small">
              {HBD.map((item, idx) => (
                <div className="interactive-chip chip-amber" style={{ animationDelay: `${idx * 0.1 + 0.2}s` }} key={item}>
                  <FlaskConical size={14} className="chip-icon" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="showcase-illustration">
          <Droplet size={120} strokeWidth={1} className="floating-illustration alt" />
        </div>
      </div>
    </div>
  );
}
