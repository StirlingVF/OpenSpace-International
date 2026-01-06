// Data Storage
const conjunctionEvents = [
  {
    id: 'CDM-001',
    satellite: 'STARLINK-1234',
    debris: 'COSMOS 2251 DEB',
    tca: '2025-11-20T14:32:00Z',
    miss_distance_km: 0.485,
    collision_probability: 0.00012,
    risk_level: 'HIGH',
    relative_velocity_km_s: 14.2
  },
  {
    id: 'CDM-002',
    satellite: 'SENTINEL-3A',
    debris: 'CZ-2D DEB',
    tca: '2025-11-18T09:15:00Z',
    miss_distance_km: 1.2,
    collision_probability: 0.000032,
    risk_level: 'MEDIUM',
    relative_velocity_km_s: 12.8
  },
  {
    id: 'CDM-003',
    satellite: 'STARLINK-5678',
    debris: 'IRIDIUM 33 DEB',
    tca: '2025-11-22T18:45:00Z',
    miss_distance_km: 0.15,
    collision_probability: 0.00089,
    risk_level: 'CRITICAL',
    relative_velocity_km_s: 15.1
  },
  {
    id: 'CDM-004',
    satellite: 'ONEWEB-234',
    debris: 'FENGYUN-1C DEB',
    tca: '2025-11-19T11:20:00Z',
    miss_distance_km: 2.5,
    collision_probability: 0.0000089,
    risk_level: 'LOW',
    relative_velocity_km_s: 13.5
  },
  {
    id: 'CDM-005',
    satellite: 'CRYOSAT-2',
    debris: 'COSMOS 1408 DEB',
    tca: '2025-11-21T16:30:00Z',
    miss_distance_km: 0.92,
    collision_probability: 0.000056,
    risk_level: 'MEDIUM',
    relative_velocity_km_s: 11.9
  }
];

const debrisObjects = [
  {
    name: 'COSMOS 2251 DEB',
    norad_id: '33443',
    size_cm: 45,
    altitude_km: 790,
    inclination_deg: 74.0,
    annual_conjunctions: 2850,
    threatened_satellites: 450,
    economic_risk_score: 92,
    estimated_annual_impact_million: 125.4
  },
  {
    name: 'IRIDIUM 33 DEB',
    norad_id: '33443-A',
    size_cm: 38,
    altitude_km: 780,
    inclination_deg: 86.4,
    annual_conjunctions: 2240,
    threatened_satellites: 380,
    economic_risk_score: 87,
    estimated_annual_impact_million: 98.7
  },
  {
    name: 'FENGYUN-1C DEB',
    norad_id: '29939',
    size_cm: 52,
    altitude_km: 850,
    inclination_deg: 98.8,
    annual_conjunctions: 3420,
    threatened_satellites: 520,
    economic_risk_score: 95,
    estimated_annual_impact_million: 156.8
  },
  {
    name: 'CZ-2D DEB',
    norad_id: '48730',
    size_cm: 28,
    altitude_km: 735,
    inclination_deg: 98.2,
    annual_conjunctions: 1850,
    threatened_satellites: 290,
    economic_risk_score: 73,
    estimated_annual_impact_million: 71.2
  },
  {
    name: 'COSMOS 1408 DEB',
    norad_id: '49863',
    size_cm: 41,
    altitude_km: 485,
    inclination_deg: 82.3,
    annual_conjunctions: 1620,
    threatened_satellites: 340,
    economic_risk_score: 79,
    estimated_annual_impact_million: 85.3
  }
];

const economicDefaults = {
  maneuver_cost_min: 10000,
  maneuver_cost_max: 20000,
  typical_satellite_value_million: 150,
  insurance_premium_rate: 0.08,
  daily_operational_revenue: 50000,
  fuel_mass_per_maneuver_kg: 0.5,
  avg_mission_lifetime_years: 7,
  collision_consequence_multiplier: 200
};

let charts = {};

// Navigation
function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const viewId = item.dataset.view;
      switchView(viewId);
      
      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');
    });
  });
}

function switchView(viewId) {
  const views = document.querySelectorAll('.view');
  views.forEach(view => view.classList.remove('active'));
  
  const targetView = document.getElementById(viewId);
  if (targetView) {
    targetView.classList.add('active');
    
    // Initialize view-specific content
    if (viewId === 'analytics') {
      initializeAnalytics();
    } else if (viewId === 'prioritization') {
      initializePrioritization();
    }
  }
}

// Dashboard
function initializeDashboard() {
  // Update stats
  document.getElementById('stat-conjunctions').textContent = conjunctionEvents.length;
  
  const totalImpact = debrisObjects.reduce((sum, obj) => sum + obj.estimated_annual_impact_million, 0);
  document.getElementById('stat-impact').textContent = `$${totalImpact.toFixed(1)}M`;
  
  document.getElementById('stat-debris').textContent = debrisObjects.length;
  
  const avgRisk = debrisObjects.reduce((sum, obj) => sum + obj.economic_risk_score, 0) / debrisObjects.length;
  document.getElementById('stat-risk').textContent = avgRisk.toFixed(1);
  
  // Display critical conjunctions
  const dashboardConjunctions = document.getElementById('dashboard-conjunctions');
  const criticalEvents = conjunctionEvents.filter(e => e.risk_level === 'CRITICAL' || e.risk_level === 'HIGH').slice(0, 3);
  dashboardConjunctions.innerHTML = criticalEvents.map(event => createConjunctionCard(event)).join('');
  
  // Display top debris
  const dashboardDebris = document.getElementById('dashboard-debris');
  const topDebris = [...debrisObjects].sort((a, b) => b.economic_risk_score - a.economic_risk_score).slice(0, 3);
  dashboardDebris.innerHTML = topDebris.map(debris => createDebrisCard(debris)).join('');
}

// Conjunction Analysis
function initializeConjunctions() {
  renderConjunctions();
  
  document.getElementById('risk-filter').addEventListener('change', (e) => {
    renderConjunctions(e.target.value);
  });
}

function renderConjunctions(filter = 'all') {
  const list = document.getElementById('conjunctions-list');
  let events = conjunctionEvents;
  
  if (filter !== 'all') {
    events = conjunctionEvents.filter(e => e.risk_level === filter);
  }
  
  list.innerHTML = events.map(event => createConjunctionCard(event, true)).join('');
}

function createConjunctionCard(event, detailed = false) {
  const tcaDate = new Date(event.tca);
  const formattedDate = tcaDate.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC'
  });
  
  return `
    <div class="conjunction-card">
      <div class="conjunction-risk-badge ${event.risk_level}">${event.risk_level}</div>
      <div class="conjunction-info">
        <div class="conjunction-header">
          <span class="conjunction-title">${event.satellite}</span>
          <span class="conjunction-id">${event.id}</span>
        </div>
        <div class="conjunction-details">
          <div class="detail-item">
            <span class="detail-label">Debris Object</span>
            <span class="detail-value">${event.debris}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">TCA</span>
            <span class="detail-value">${formattedDate} UTC</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Miss Distance</span>
            <span class="detail-value">${event.miss_distance_km.toFixed(2)} km</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Collision Probability</span>
            <span class="detail-value">${(event.collision_probability * 100).toFixed(4)}%</span>
          </div>
          ${detailed ? `
          <div class="detail-item">
            <span class="detail-label">Relative Velocity</span>
            <span class="detail-value">${event.relative_velocity_km_s.toFixed(1)} km/s</span>
          </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}

// Risk Scoring
function initializeRiskScoring() {
  renderDebrisList();
  
  document.getElementById('sort-debris').addEventListener('change', (e) => {
    renderDebrisList(e.target.value);
  });
}

function renderDebrisList(sortBy = 'score') {
  const list = document.getElementById('debris-list');
  let sorted = [...debrisObjects];
  
  switch (sortBy) {
    case 'score':
      sorted.sort((a, b) => b.economic_risk_score - a.economic_risk_score);
      break;
    case 'impact':
      sorted.sort((a, b) => b.estimated_annual_impact_million - a.estimated_annual_impact_million);
      break;
    case 'conjunctions':
      sorted.sort((a, b) => b.annual_conjunctions - a.annual_conjunctions);
      break;
    case 'satellites':
      sorted.sort((a, b) => b.threatened_satellites - a.threatened_satellites);
      break;
  }
  
  list.innerHTML = sorted.map(debris => createDebrisCard(debris, true)).join('');
}

function createDebrisCard(debris, detailed = false) {
  const riskClass = debris.economic_risk_score >= 90 ? 'high' : debris.economic_risk_score >= 75 ? 'medium' : 'low';
  
  return `
    <div class="debris-card">
      <div class="debris-risk-score ${riskClass}">${debris.economic_risk_score}</div>
      <div class="debris-info">
        <div class="debris-name">${debris.name}</div>
        <div class="debris-norad">NORAD ID: ${debris.norad_id}</div>
        <div class="debris-stats">
          <div class="detail-item">
            <span class="detail-label">Size</span>
            <span class="detail-value">${debris.size_cm} cm</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Altitude</span>
            <span class="detail-value">${debris.altitude_km} km</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Annual Conjunctions</span>
            <span class="detail-value">${debris.annual_conjunctions.toLocaleString()}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Threatened Satellites</span>
            <span class="detail-value">${debris.threatened_satellites}</span>
          </div>
          ${detailed ? `
          <div class="detail-item">
            <span class="detail-label">Inclination</span>
            <span class="detail-value">${debris.inclination_deg.toFixed(1)}°</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Annual Impact</span>
            <span class="detail-value">$${debris.estimated_annual_impact_million.toFixed(1)}M</span>
          </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}

// Economic Calculator
function calculateEconomicImpact() {
  const satelliteName = document.getElementById('calc-satellite-name').value || 'Unnamed Satellite';
  const satelliteValue = parseFloat(document.getElementById('calc-satellite-value').value) || 150;
  const insuranceRate = parseFloat(document.getElementById('calc-insurance-rate').value) / 100 || 0.08;
  const dailyRevenue = parseFloat(document.getElementById('calc-daily-revenue').value) || 50000;
  const fuelCost = parseFloat(document.getElementById('calc-fuel-cost').value) || 15000;
  const missionLifetime = parseFloat(document.getElementById('calc-mission-lifetime').value) || 7;
  const maneuversPerYear = parseFloat(document.getElementById('calc-maneuvers-per-year').value) || 12;
  
  // Calculations
  const annualManeuverCost = fuelCost * maneuversPerYear;
  const annualInsuranceCost = satelliteValue * 1000000 * insuranceRate;
  const downTimePerManeuver = 2; // 2 days
  const annualDowntime = downTimePerManeuver * maneuversPerYear;
  const annualDowntimeCost = dailyRevenue * annualDowntime;
  const lifetimeManeuverCost = annualManeuverCost * missionLifetime;
  const lifetimeInsuranceCost = annualInsuranceCost * missionLifetime;
  const lifetimeDowntimeCost = annualDowntimeCost * missionLifetime;
  const totalLifetimeCost = lifetimeManeuverCost + lifetimeInsuranceCost + lifetimeDowntimeCost;
  
  const resultsDiv = document.getElementById('calculator-results');
  resultsDiv.innerHTML = `
    <div style="margin-bottom: var(--space-24);">
      <h4 style="color: var(--color-text-secondary); margin-bottom: var(--space-16);">Satellite: ${satelliteName}</h4>
    </div>
    
    <div class="result-item">
      <div class="result-label">Annual Maneuver Costs</div>
      <div class="result-value">$${annualManeuverCost.toLocaleString()}</div>
      <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary); margin-top: var(--space-4);">
        ${maneuversPerYear} maneuvers × $${fuelCost.toLocaleString()}
      </div>
    </div>
    
    <div class="result-item">
      <div class="result-label">Annual Insurance Premiums</div>
      <div class="result-value">$${annualInsuranceCost.toLocaleString()}</div>
      <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary); margin-top: var(--space-4);">
        ${(insuranceRate * 100).toFixed(1)}% of $${satelliteValue}M value
      </div>
    </div>
    
    <div class="result-item">
      <div class="result-label">Annual Downtime Costs</div>
      <div class="result-value">$${annualDowntimeCost.toLocaleString()}</div>
      <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary); margin-top: var(--space-4);">
        ${annualDowntime} days at $${dailyRevenue.toLocaleString()}/day
      </div>
    </div>
    
    <div style="margin: var(--space-24) 0;">
      <h4 style="color: var(--color-text-secondary); margin-bottom: var(--space-16);">Lifetime Costs (${missionLifetime} years)</h4>
    </div>
    
    <div class="result-item">
      <div class="result-label">Total Maneuver Costs</div>
      <div class="result-value">$${lifetimeManeuverCost.toLocaleString()}</div>
    </div>
    
    <div class="result-item">
      <div class="result-label">Total Insurance Costs</div>
      <div class="result-value">$${lifetimeInsuranceCost.toLocaleString()}</div>
    </div>
    
    <div class="result-item">
      <div class="result-label">Total Downtime Costs</div>
      <div class="result-value">$${lifetimeDowntimeCost.toLocaleString()}</div>
    </div>
    
    <div class="result-total" style="margin-top: var(--space-20);">
      <div class="result-label">Total Lifetime Economic Impact</div>
      <div class="result-value">$${totalLifetimeCost.toLocaleString()}</div>
    </div>
  `;
}

// Decision Support
function initializeDecisionSupport() {
  const select = document.getElementById('decision-conjunction');
  select.innerHTML = conjunctionEvents.map(event => 
    `<option value="${event.id}">${event.id} - ${event.satellite} vs ${event.debris}</option>`
  ).join('');
  
  const slider = document.getElementById('decision-risk-tolerance');
  const display = document.getElementById('risk-tolerance-display');
  slider.addEventListener('input', (e) => {
    display.textContent = e.target.value;
  });
}

function analyzeDecision() {
  const conjunctionId = document.getElementById('decision-conjunction').value;
  const satelliteValue = parseFloat(document.getElementById('decision-satellite-value').value) * 1000000;
  const maneuverCost = parseFloat(document.getElementById('decision-maneuver-cost').value);
  const riskTolerance = parseFloat(document.getElementById('decision-risk-tolerance').value) / 100;
  
  const event = conjunctionEvents.find(e => e.id === conjunctionId);
  if (!event) return;
  
  // Option 1: Perform Maneuver
  const maneuverOption = {
    cost: maneuverCost,
    description: 'Guaranteed avoidance of collision'
  };
  
  // Option 2: Accept Risk
  const expectedLoss = event.collision_probability * satelliteValue;
  const riskOption = {
    cost: expectedLoss,
    description: 'Expected loss based on collision probability'
  };
  
  // Recommendation
  const threshold = riskTolerance * satelliteValue;
  const shouldManeuver = expectedLoss > maneuverCost || event.collision_probability > riskTolerance;
  
  const resultsDiv = document.getElementById('decision-results');
  resultsDiv.innerHTML = `
    <div style="margin-bottom: var(--space-24);">
      <h4 style="margin-bottom: var(--space-8);">${event.id}: ${event.satellite}</h4>
      <div style="color: var(--color-text-secondary); font-size: var(--font-size-sm);">
        Debris: ${event.debris}<br>
        Collision Probability: ${(event.collision_probability * 100).toFixed(4)}%<br>
        Miss Distance: ${event.miss_distance_km} km
      </div>
    </div>
    
    <div class="option-card ${shouldManeuver ? 'recommended' : ''}">
      <div class="option-title">Option 1: Perform Maneuver</div>
      <div class="option-cost">$${maneuverCost.toLocaleString()}</div>
      <div style="color: var(--color-text-secondary);">${maneuverOption.description}</div>
      ${shouldManeuver ? '<div class="recommendation-badge">RECOMMENDED</div>' : ''}
    </div>
    
    <div class="option-card ${!shouldManeuver ? 'recommended' : ''}">
      <div class="option-title">Option 2: Accept Risk</div>
      <div class="option-cost">$${expectedLoss.toLocaleString()}</div>
      <div style="color: var(--color-text-secondary);">${riskOption.description}</div>
      ${!shouldManeuver ? '<div class="recommendation-badge">RECOMMENDED</div>' : ''}
    </div>
    
    <div style="margin-top: var(--space-24); padding: var(--space-20); background-color: var(--color-background); border-radius: var(--radius-lg);">
      <h4 style="margin-bottom: var(--space-12);">Analysis Summary</h4>
      <p style="margin-bottom: var(--space-8);">
        <strong>Cost Difference:</strong> $${Math.abs(maneuverCost - expectedLoss).toLocaleString()}
      </p>
      <p style="margin-bottom: var(--space-8);">
        <strong>Risk Tolerance Threshold:</strong> ${(riskTolerance * 100).toFixed(1)}%
      </p>
      <p style="margin-bottom: var(--space-8);">
        <strong>Actual Risk:</strong> ${(event.collision_probability * 100).toFixed(4)}%
      </p>
      <p style="color: var(--color-text-secondary); margin-top: var(--space-16);">
        ${shouldManeuver 
          ? 'The expected loss from accepting the risk exceeds the maneuver cost. A collision avoidance maneuver is recommended.'
          : 'The cost of a maneuver exceeds the expected loss. Accepting the risk may be economically justified, though other factors should be considered.'}
      </p>
    </div>
  `;
}

// Prioritization
function initializePrioritization() {
  if (!charts.debrisImpact) {
    createDebrisImpactChart();
  }
  renderPrioritizationList();
}

function createDebrisImpactChart() {
  const ctx = document.getElementById('debris-impact-chart');
  if (!ctx) return;
  
  const sortedDebris = [...debrisObjects].sort((a, b) => b.estimated_annual_impact_million - a.estimated_annual_impact_million);
  
  charts.debrisImpact = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: sortedDebris.map(d => d.name),
      datasets: [{
        label: 'Annual Economic Impact ($M)',
        data: sortedDebris.map(d => d.estimated_annual_impact_million),
        backgroundColor: ['#2FA36B', '#7CB342', '#E6A700', '#D94B4B', '#0B1E3C'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Annual Impact (Million USD)'
          }
        }
      }
    }
  });
}

function renderPrioritizationList() {
  const list = document.getElementById('prioritization-list');
  const sorted = [...debrisObjects].sort((a, b) => b.estimated_annual_impact_million - a.estimated_annual_impact_million);
  
  list.innerHTML = sorted.map((debris, index) => `
    <div class="prioritization-card">
      <div class="priority-rank">${index + 1}</div>
      <div class="debris-info">
        <div class="debris-name">${debris.name}</div>
        <div class="debris-norad">NORAD ID: ${debris.norad_id}</div>
        <div class="debris-stats">
          <div class="detail-item">
            <span class="detail-label">Risk Score</span>
            <span class="detail-value">${debris.economic_risk_score}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Annual Conjunctions</span>
            <span class="detail-value">${debris.annual_conjunctions.toLocaleString()}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Threatened Satellites</span>
            <span class="detail-value">${debris.threatened_satellites}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Altitude</span>
            <span class="detail-value">${debris.altitude_km} km</span>
          </div>
        </div>
      </div>
      <div class="business-case">
        <div class="business-case-label">Annual Impact</div>
        <div class="business-case-value">$${debris.estimated_annual_impact_million.toFixed(1)}M</div>
        <div style="margin-top: var(--space-12); font-size: var(--font-size-sm); color: var(--color-text-secondary);">
          Business case: Removal mission cost should be less than $${(debris.estimated_annual_impact_million * 5).toFixed(1)}M for 5-year ROI
        </div>
      </div>
    </div>
  `).join('');
}

// Analytics
function initializeAnalytics() {
  if (!charts.costBreakdown) {
    createCostBreakdownChart();
  }
  if (!charts.maneuversTime) {
    createManeuversTimeChart();
  }
  if (!charts.orbitalImpact) {
    createOrbitalImpactChart();
  }
}

function createCostBreakdownChart() {
  const ctx = document.getElementById('cost-breakdown-chart');
  if (!ctx) return;
  
  charts.costBreakdown = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: [
        'Collision Avoidance Maneuvers',
        'Insurance Premiums',
        'Mission Downtime',
        'Replacement Costs',
        'Operational Disruption',
        'Regulatory Compliance'
      ],
      datasets: [{
        data: [180, 150, 95, 65, 32, 15],
        backgroundColor: ['#2FA36B', '#7CB342', '#E6A700', '#D94B4B', '#0B1E3C', '#6B7A90'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}

function createManeuversTimeChart() {
  const ctx = document.getElementById('maneuvers-time-chart');
  if (!ctx) return;
  
  charts.maneuversTime = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [{
        label: 'Maneuvers Required',
        data: [85, 92, 78, 105, 98, 112, 95, 88, 102, 118, 125, 132],
        borderColor: '#2FA36B',
        backgroundColor: 'rgba(47, 163, 107, 0.1)',
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Number of Maneuvers'
          }
        }
      }
    }
  });
}

function createOrbitalImpactChart() {
  const ctx = document.getElementById('orbital-impact-chart');
  if (!ctx) return;
  
  charts.orbitalImpact = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['400-500 km', '500-600 km', '600-700 km', '700-800 km', '800-900 km', '900-1000 km'],
      datasets: [{
        label: 'Economic Impact ($M)',
        data: [45, 85, 125, 156, 98, 28],
        backgroundColor: ['#2FA36B', '#7CB342', '#E6A700', '#D94B4B', '#0B1E3C', '#6B7A90'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Annual Impact (Million USD)'
          }
        },
        x: {
          title: {
            display: true,
            text: 'LEO Altitude Range'
          }
        }
      }
    }
  });
}

function exportReport() {
  alert('Export functionality would generate a comprehensive PDF report including:\n\n• Executive Summary\n• Conjunction Analysis\n• Economic Impact Assessment\n• Risk Scores and Prioritization\n• Debris Removal Recommendations\n• Detailed Analytics and Charts\n\nIn a production system, this would download a formatted PDF document.');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  initializeDashboard();
  initializeConjunctions();
  initializeRiskScoring();
  initializeDecisionSupport();
});