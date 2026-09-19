// Configurable API Base URL
// If hosted on GitHub Pages, it will try to use a deployed backend if you change this URL.
// Since it's 'http://127.0.0.1:5000/api', it will fail on GitHub pages, triggering Demo Mode.
const API_BASE = 'http://127.0.0.1:5000/api';

let isDemoMode = false;

// ---------------------------------------------------------
// DEMO MODE ENGINE (Fallback Logic)
// ---------------------------------------------------------
const BUILDINGS = [
    {name: "Main Block", baseline_energy: 400, baseline_occupancy: 60, baseline_waste: 50},
    {name: "ECE Block", baseline_energy: 350, baseline_occupancy: 60, baseline_waste: 50},
    {name: "CSE Block", baseline_energy: 380, baseline_occupancy: 60, baseline_waste: 50},
    {name: "Library", baseline_energy: 250, baseline_occupancy: 50, baseline_waste: 40},
    {name: "Laboratory Block", baseline_energy: 450, baseline_occupancy: 40, baseline_waste: 60},
    {name: "Hostel", baseline_energy: 500, baseline_occupancy: 80, baseline_waste: 70}
];

let demoCampusData = null;

function runDemoSimulation() {
    const hour = new Date().getHours();
    const isOpHours = hour >= 8 && hour <= 18;
    
    demoCampusData = {
        timestamp: new Date().toISOString(),
        buildings: BUILDINGS.map(b => {
            let occ = b.baseline_occupancy + (Math.floor(Math.random() * 71) - 30);
            if (!isOpHours && b.name !== "Hostel") {
                occ = Math.floor(Math.random() * 16) + 5;
            }
            occ = Math.max(0, Math.min(100, occ));
            
            let eng = b.baseline_energy + ((occ - b.baseline_occupancy) * 2) + (Math.floor(Math.random() * 201) - 50);
            eng = Math.max(100, Math.floor(eng));
            
            let wst = b.baseline_waste + ((occ - b.baseline_occupancy) * 0.5) + (Math.floor(Math.random() * 51) - 20);
            wst = Math.max(0, Math.min(100, Math.floor(wst)));
            
            return {
                name: b.name,
                energy_kwh: eng,
                baseline_energy: b.baseline_energy,
                occupancy_percent: occ,
                baseline_occupancy: b.baseline_occupancy,
                waste_fill_percent: wst,
                baseline_waste: b.baseline_waste
            };
        })
    };
    return demoCampusData;
}

function getDemoAlerts() {
    if (!demoCampusData) runDemoSimulation();
    const alerts = [];
    
    demoCampusData.buildings.forEach(b => {
        // Energy Rule
        const diff = ((b.energy_kwh - b.baseline_energy) / b.baseline_energy) * 100;
        if (diff > 25) alerts.push({
            title: "High Energy Consumption", severity: "HIGH",
            reason: `${b.name} is consuming ${Math.round(diff)}% more energy than normal.`,
            evidence: `Current: ${b.energy_kwh} kWh | Base: ${b.baseline_energy} kWh`,
            impact: "Higher daily operating cost.", recommendation: "Check HVAC & lighting.",
            timestamp: new Date().toISOString()
        });
        
        // Occupancy Rule
        if (b.occupancy_percent > 85) alerts.push({
            title: "High Occupancy", severity: "HIGH",
            reason: `${b.name} crossed the 85% capacity threshold.`,
            evidence: `Current: ${b.occupancy_percent}% | Threshold: 85%`,
            impact: "Possible overcrowding.", recommendation: "Relocate classes/people.",
            timestamp: new Date().toISOString()
        });
        
        // Waste Rule
        if (b.waste_fill_percent > 90) alerts.push({
            title: "Waste Bin Critical", severity: "HIGH",
            reason: `${b.name} waste bin is critically full.`,
            evidence: `Fill level: ${b.waste_fill_percent}%`,
            impact: "Overflow imminent.", recommendation: "Immediate collection required.",
            timestamp: new Date().toISOString()
        });
        else if (b.waste_fill_percent > 80) alerts.push({
            title: "Waste Bin Nearly Full", severity: "MEDIUM",
            reason: `${b.name} crossed the 80% threshold.`,
            evidence: `Fill level: ${b.waste_fill_percent}%`,
            impact: "Possible overflow.", recommendation: "Schedule collection.",
            timestamp: new Date().toISOString()
        });
        
        // Relationship Rule
        if (b.occupancy_percent < 40 && b.energy_kwh > b.baseline_energy) alerts.push({
            title: "Low Occupancy, High Energy", severity: "MEDIUM",
            reason: `${b.name} has low occupancy but energy remains high.`,
            evidence: `Occ: ${b.occupancy_percent}% | Eng: ${b.energy_kwh} kWh`,
            impact: "Inefficient energy usage.", recommendation: "Reduce unnecessary HVAC.",
            timestamp: new Date().toISOString()
        });
    });
    return alerts;
}

function getDemoInsights(alerts) {
    if (!demoCampusData) runDemoSimulation();
    const insights = [];
    
    demoCampusData.buildings.forEach(b => {
        const diff = ((b.energy_kwh - b.baseline_energy) / b.baseline_energy) * 100;
        if (diff > 20) insights.push({
            category: "Energy Insights", problem: `${b.name} energy is ${Math.round(diff)}% above baseline.`,
            evidence: `${b.energy_kwh} kWh vs ${b.baseline_energy} kWh.`, action: "Investigate HVAC schedules.", benefit: "Lower carbon footprint."
        });
        
        if (b.occupancy_percent < 30 && b.energy_kwh > (b.baseline_energy * 0.8)) insights.push({
            category: "Occupancy Insights", problem: `${b.name} occupancy is low, but energy is high.`,
            evidence: `Occ: ${b.occupancy_percent}% | Eng: ${b.energy_kwh} kWh.`, action: "Automate lights in empty zones.", benefit: "Immediate energy savings."
        });
        
        if (b.waste_fill_percent > 75) insights.push({
            category: "Waste Insights", problem: `${b.name} bins approach collection threshold.`,
            evidence: `Bin is ${b.waste_fill_percent}% full.`, action: "Route maintenance staff soon.", benefit: "Maintain campus hygiene."
        });
    });
    
    if (insights.length === 0) insights.push({
        category: "Resource Recommendations", problem: "All systems normal.",
        evidence: "No significant deviations.", action: "Continue monitoring.", benefit: "Stable operations."
    });
    return insights;
}

// Simulated API Router
function handleDemoRoute(endpoint, options) {
    if (!demoCampusData) runDemoSimulation();
    const alerts = getDemoAlerts();
    
    let totalEng = 0; let totalOcc = 0; let totalWst = 0;
    demoCampusData.buildings.forEach(b => {
        totalEng += b.energy_kwh;
        totalOcc += b.occupancy_percent;
        totalWst += b.waste_fill_percent;
    });
    const avgOcc = Math.round(totalOcc / BUILDINGS.length);
    const avgWst = Math.round(totalWst / BUILDINGS.length);
    
    let score = 100;
    alerts.forEach(a => { score -= a.severity === 'HIGH' ? 10 : 5; });
    score = Math.max(0, Math.min(100, score));
    const expl = score < 60 ? "Multiple high-severity inefficiencies detected." : (score < 80 ? "Moderate inefficiencies. Attention recommended." : "Campus is operating efficiently.");

    if (endpoint === '/dashboard') return {
        timestamp: demoCampusData.timestamp, total_energy: totalEng, campus_occupancy: avgOcc,
        waste_level: avgWst, active_alerts: alerts.length, efficiency_score: score,
        score_explanation: expl, estimated_daily_cost: totalEng * 0.08, buildings: demoCampusData.buildings
    };
    if (endpoint === '/energy' || endpoint === '/occupancy' || endpoint === '/waste') return { buildings: demoCampusData.buildings };
    if (endpoint === '/alerts') return { alerts: alerts };
    if (endpoint === '/insights') return { insights: getDemoInsights(alerts) };
    
    if (endpoint === '/what-if' && options.body) {
        const payload = JSON.parse(options.body);
        const hvacRed = (payload.hvac_reduction || 0) / 100;
        const lightRed = (payload.lighting_reduction || 0) / 100;
        const occChange = (payload.occupancy_change || 0) / 100;
        
        const est = (totalEng * 0.5 * (1 - hvacRed)) + (totalEng * 0.3 * (1 - lightRed)) + (totalEng * 0.2 * (1 + (occChange * 0.5)));
        const saved = totalEng - est;
        return {
            current_energy: totalEng, estimated_energy: Math.round(est),
            energy_saved: Math.round(saved), estimated_cost_saved: saved * 0.08
        };
    }
    
    if (endpoint === '/simulate') {
        const data = runDemoSimulation();
        return { status: "success", timestamp: data.timestamp };
    }
    return null;
}

// ---------------------------------------------------------
// APP LOGIC
// ---------------------------------------------------------

// Navigation Logic
document.querySelectorAll('.menu a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        
        document.querySelectorAll('.menu a').forEach(l => l.classList.remove('active'));
        e.currentTarget.classList.add('active');
        
        document.querySelectorAll('.page-container').forEach(p => p.classList.add('hidden'));
        
        const targetPage = e.currentTarget.getAttribute('data-page');
        document.getElementById(`page-${targetPage}`).classList.remove('hidden');
        
        const titles = {
            'dashboard': 'Campus Intelligence Dashboard', 'energy': 'Energy Consumption',
            'occupancy': 'Campus Occupancy', 'waste': 'Waste Management',
            'alerts': 'System Alerts', 'insights': 'Intelligent Insights', 'whatif': 'What-If Simulator'
        };
        const subtitles = {
            'dashboard': 'Real-time campus resource monitoring and intelligent insights',
            'energy': 'Building-wise energy metrics and baseline comparisons',
            'occupancy': 'Real-time space utilization and crowding analysis',
            'waste': 'Bin fill levels and collection requirements',
            'alerts': 'Intelligent notifications based on rule-thresholds',
            'insights': 'Actionable recommendations to improve resource utilization',
            'whatif': 'Model potential resource and cost savings using current data'
        };
        
        document.getElementById('page-title').innerText = titles[targetPage] || 'Dashboard Overview';
        document.querySelector('.header-titles .subtitle').innerText = subtitles[targetPage] || '';
        
        if(targetPage === 'energy') loadEnergy();
        if(targetPage === 'occupancy') loadOccupancy();
        if(targetPage === 'waste') loadWaste();
        if(targetPage === 'alerts') loadAlerts();
        if(targetPage === 'insights') loadInsights();
    });
});

function enableDemoModeUI() {
    if(!isDemoMode) {
        isDemoMode = true;
        // Show Demo Mode indicator in header
        const titleContainer = document.querySelector('.header-titles h1');
        if(!titleContainer.innerHTML.includes('DEMO MODE')) {
            titleContainer.innerHTML += ` <span class="badge" style="background-color: var(--warning); margin-left:12px; vertical-align:middle; font-size:12px; padding:4px 8px;">DEMO MODE (Local Simulation)</span>`;
        }
        document.getElementById('error-banner').classList.add('hidden'); // Hide the generic error if we fall back successfully
    }
}

// Generic Fetch with Fallback
async function fetchData(endpoint, options = {}) {
    if (isDemoMode) {
        return new Promise((resolve) => {
            setTimeout(() => resolve(handleDemoRoute(endpoint, options)), 150); // Simulate network latency
        });
    }

    try {
        const res = await fetch(`${API_BASE}${endpoint}`, options);
        if(!res.ok) throw new Error('Network response was not ok');
        document.getElementById('error-banner').classList.add('hidden');
        return await res.json();
    } catch (error) {
        console.warn('API Connection failed. Falling back to Local Demo Mode...', error);
        enableDemoModeUI();
        return handleDemoRoute(endpoint, options);
    }
}

// Load Dashboard
async function loadDashboard() {
    const data = await fetchData('/dashboard');
    if(!data) return;
    
    document.getElementById('dash-energy').innerText = `${data.total_energy.toLocaleString()} kWh`;
    document.getElementById('dash-occupancy').innerText = `${data.campus_occupancy}%`;
    document.getElementById('dash-waste').innerText = `${data.waste_level}%`;
    document.getElementById('dash-alerts').innerText = data.active_alerts;
    
    // Efficiency Score updating
    document.getElementById('dash-score').innerText = data.efficiency_score;
    document.getElementById('dash-score-expl').innerText = data.score_explanation;
    // Update progress bar
    const bar = document.getElementById('dash-score-bar');
    bar.style.width = `${data.efficiency_score}%`;
    if(data.efficiency_score >= 80) bar.style.backgroundColor = 'var(--success)';
    else if(data.efficiency_score >= 60) bar.style.backgroundColor = 'var(--warning)';
    else bar.style.backgroundColor = 'var(--danger)';

    document.getElementById('dash-cost').innerText = `$ ${data.estimated_daily_cost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    
    // Update badge
    const badge = document.getElementById('alert-badge');
    badge.innerText = data.active_alerts;
    if(data.active_alerts > 0) badge.classList.remove('hidden');
    else badge.classList.add('hidden');
    
    // Update timestamp
    document.getElementById('last-updated').innerHTML = `Last updated<br><span>${new Date(data.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}</span>`;
    
    // Populate building cards
    const container = document.getElementById('dash-buildings');
    container.innerHTML = '';
    data.buildings.forEach(b => {
        const div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = `
            <h3 class="card-title">${b.name}</h3>
            <div class="b-card-row">
                <span class="b-card-label">Energy</span>
                <span class="b-card-value text-blue">${b.energy_kwh} <small class="text-muted fw-normal">kWh</small></span>
            </div>
            <div class="b-card-row">
                <span class="b-card-label">Occupancy</span>
                <span class="b-card-value text-blue">${b.occupancy_percent}%</span>
            </div>
            <div class="b-card-row">
                <span class="b-card-label">Waste</span>
                <span class="b-card-value text-orange">${b.waste_fill_percent}%</span>
            </div>
        `;
        container.appendChild(div);
    });
}

// Load Energy
async function loadEnergy() {
    const data = await fetchData('/energy');
    if(!data) return;
    const container = document.getElementById('energy-list');
    container.innerHTML = '';
    data.buildings.forEach(b => {
        const diff = ((b.energy_kwh - b.baseline_energy) / b.baseline_energy * 100).toFixed(1);
        const statusClass = diff > 20 ? 'status-CRITICAL' : (diff > 10 ? 'status-WARNING' : 'status-NORMAL');
        const diffSymbol = diff > 0 ? '+' : '';
        
        container.innerHTML += `
            <div class="card">
                <h3 class="card-title">${b.name}</h3>
                <div class="b-card-row">
                    <span class="b-card-label">Current Usage</span>
                    <span class="b-card-value text-main">${b.energy_kwh} kWh</span>
                </div>
                <div class="b-card-row">
                    <span class="b-card-label">Expected Baseline</span>
                    <span class="b-card-value text-muted">${b.baseline_energy} kWh</span>
                </div>
                <div class="b-card-row">
                    <span class="b-card-label">Difference</span>
                    <span class="${statusClass}">${diffSymbol}${diff}%</span>
                </div>
            </div>
        `;
    });
}

// Load Occupancy
async function loadOccupancy() {
    const data = await fetchData('/occupancy');
    if(!data) return;
    const container = document.getElementById('occupancy-list');
    container.innerHTML = '';
    data.buildings.forEach(b => {
        const occ = b.occupancy_percent;
        let status = 'NORMAL';
        let statusClass = 'status-NORMAL';
        if(occ > 85) { status = 'HIGH'; statusClass = 'status-CRITICAL'; }
        else if(occ < 20) { status = 'LOW'; statusClass = 'status-WARNING'; }
        
        container.innerHTML += `
            <div class="card">
                <h3 class="card-title">${b.name}</h3>
                <div class="b-card-row">
                    <span class="b-card-label">Current Occupancy</span>
                    <span class="b-card-value text-main">${occ}%</span>
                </div>
                <div class="b-card-row">
                    <span class="b-card-label">Expected Baseline</span>
                    <span class="b-card-value text-muted">${b.baseline_occupancy}%</span>
                </div>
                <div class="b-card-row">
                    <span class="b-card-label">Status</span>
                    <span class="${statusClass}">${status}</span>
                </div>
            </div>
        `;
    });
}

// Load Waste
async function loadWaste() {
    const data = await fetchData('/waste');
    if(!data) return;
    const container = document.getElementById('waste-list');
    container.innerHTML = '';
    data.buildings.forEach(b => {
        const w = b.waste_fill_percent;
        let status = 'NORMAL';
        let statusClass = 'status-NORMAL';
        if(w > 90) { status = 'CRITICAL'; statusClass = 'status-CRITICAL'; }
        else if(w > 75) { status = 'WARNING'; statusClass = 'status-WARNING'; }
        
        container.innerHTML += `
            <div class="card">
                <h3 class="card-title">${b.name}</h3>
                <div class="b-card-row">
                    <span class="b-card-label">Bin Fill Level</span>
                    <span class="b-card-value text-main">${w}%</span>
                </div>
                <div class="b-card-row">
                    <span class="b-card-label">Status</span>
                    <span class="${statusClass}">${status}</span>
                </div>
            </div>
        `;
    });
}

// Load Alerts
let currentAlerts = [];
async function loadAlerts() {
    const data = await fetchData('/alerts');
    if(!data) return;
    currentAlerts = data.alerts;
    renderAlerts('All');
}

function renderAlerts(filter) {
    const container = document.getElementById('alerts-container');
    container.innerHTML = '';
    
    let filtered = currentAlerts;
    if(filter !== 'All') {
        filtered = currentAlerts.filter(a => a.severity === filter);
    }
    
    if(filtered.length === 0) {
        container.innerHTML = '<div class="card"><p class="text-muted">No alerts found for this filter.</p></div>';
        return;
    }
    
    filtered.forEach(a => {
        container.innerHTML += `
            <div class="card alert-card severity-${a.severity}">
                <div class="alert-header">
                    <span class="alert-title">${a.title}</span>
                    <span class="alert-sev ${a.severity}">${a.severity}</span>
                </div>
                <div class="alert-body">
                    <p><span class="alert-label">Reason:</span> <span>${a.reason}</span></p>
                    <p><span class="alert-label">Evidence:</span> <span>${a.evidence}</span></p>
                    <p><span class="alert-label">Impact:</span> <span>${a.impact}</span></p>
                    <p><span class="alert-label">Recommendation:</span> <span class="fw-bold">${a.recommendation}</span></p>
                </div>
                <div class="alert-time">${new Date(a.timestamp).toLocaleString()}</div>
            </div>
        `;
    });
}

// Alert Filters
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        renderAlerts(e.currentTarget.getAttribute('data-filter'));
    });
});

// Load Insights
async function loadInsights() {
    const data = await fetchData('/insights');
    if(!data) return;
    const container = document.getElementById('insights-container');
    container.innerHTML = '';
    
    data.insights.forEach(i => {
        container.innerHTML += `
            <div class="card insight-card mb-4">
                <div class="insight-header">
                    <div class="insight-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                    </div>
                    <span class="insight-category">${i.category}</span>
                </div>
                <div class="insight-body">
                    <p><span class="insight-label">Problem:</span> <span>${i.problem}</span></p>
                    <p><span class="insight-label">Evidence:</span> <span>${i.evidence}</span></p>
                    <p><span class="insight-label insight-action">Suggested Action:</span> <span class="fw-bold text-main">${i.action}</span></p>
                    <p><span class="insight-label">Expected Benefit:</span> <span>${i.benefit}</span></p>
                </div>
            </div>
        `;
    });
}

// What-If Sliders
['hvac', 'lighting'].forEach(id => {
    const el = document.getElementById(`wi-${id}`);
    el.addEventListener('input', (e) => {
        document.getElementById(`wi-${id}-val`).innerText = `${e.target.value}%`;
    });
});
document.getElementById('wi-occupancy').addEventListener('input', (e) => {
    const val = e.target.value;
    document.getElementById('wi-occupancy-val').innerText = `${val > 0 ? '+' : ''}${val}%`;
});

// Calculate What-If
document.getElementById('btn-calc-whatif').addEventListener('click', async () => {
    const payload = {
        hvac_reduction: document.getElementById('wi-hvac').value,
        lighting_reduction: document.getElementById('wi-lighting').value,
        occupancy_change: document.getElementById('wi-occupancy').value
    };
    
    const data = await fetchData('/what-if', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    
    if(data) {
        document.getElementById('wi-res-current').innerText = `${data.current_energy.toLocaleString()} kWh`;
        document.getElementById('wi-res-scenario').innerText = `${data.estimated_energy.toLocaleString()} kWh`;
        document.getElementById('wi-res-saved').innerText = `${data.energy_saved.toLocaleString()} kWh`;
        document.getElementById('wi-res-cost').innerText = `$ ${data.estimated_cost_saved.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    }
});

// Run Simulation
document.getElementById('btn-simulate').addEventListener('click', async () => {
    const btn = document.getElementById('btn-simulate');
    const originalText = btn.innerText;
    btn.innerText = 'Simulating...';
    btn.disabled = true;
    btn.style.opacity = '0.7';
    
    const data = await fetchData('/simulate', { method: 'POST' });
    if(data) {
        // Reload current page view
        loadDashboard();
        
        // Also refresh the specific page we might be on
        const activePage = document.querySelector('.menu a.active').getAttribute('data-page');
        if(activePage === 'energy') loadEnergy();
        if(activePage === 'occupancy') loadOccupancy();
        if(activePage === 'waste') loadWaste();
        if(activePage === 'alerts') loadAlerts();
        if(activePage === 'insights') loadInsights();
    }
    
    btn.innerText = originalText;
    btn.disabled = false;
    btn.style.opacity = '1';
});

// Init
loadDashboard();
