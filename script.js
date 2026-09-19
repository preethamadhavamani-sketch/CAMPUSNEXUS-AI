const API_BASE = 'http://127.0.0.1:5000/api';

document.querySelectorAll('.menu a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();

        document.querySelectorAll('.menu a').forEach(l => l.classList.remove('active'));
        e.currentTarget.classList.add('active');

        document.querySelectorAll('.page-container').forEach(p => p.classList.add('hidden'));

        const targetPage = e.currentTarget.getAttribute('data-page');
        document.getElementById(`page-${targetPage}`).classList.remove('hidden');

        const titles = {
            'dashboard': 'Campus Intelligence Dashboard',
            'energy': 'Energy Consumption',
            'occupancy': 'Campus Occupancy',
            'waste': 'Waste Management',
            'alerts': 'System Alerts',
            'insights': 'Intelligent Insights',
            'whatif': 'What-If Simulator'
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

        if (targetPage === 'energy') loadEnergy();
        if (targetPage === 'occupancy') loadOccupancy();
        if (targetPage === 'waste') loadWaste();
        if (targetPage === 'alerts') loadAlerts();
        if (targetPage === 'insights') loadInsights();
    });
});

async function fetchData(endpoint, options = {}) {
    try {
        const res = await fetch(`${API_BASE}${endpoint}`, options);
        if (!res.ok) throw new Error('Network response was not ok');
        document.getElementById('error-banner').classList.add('hidden');
        return await res.json();
    } catch (error) {
        console.error('API Error:', error);
        document.getElementById('error-banner').classList.remove('hidden');
        return null;
    }
}

async function loadDashboard() {
    const data = await fetchData('/dashboard');
    if (!data) return;

    document.getElementById('dash-energy').innerText = `${data.total_energy.toLocaleString()} kWh`;
    document.getElementById('dash-occupancy').innerText = `${data.campus_occupancy}%`;
    document.getElementById('dash-waste').innerText = `${data.waste_level}%`;
    document.getElementById('dash-alerts').innerText = data.active_alerts;

    document.getElementById('dash-score').innerText = data.efficiency_score;
    document.getElementById('dash-score-expl').innerText = data.score_explanation;
   
    const bar = document.getElementById('dash-score-bar');
    bar.style.width = `${data.efficiency_score}%`;
    if (data.efficiency_score >= 80) bar.style.backgroundColor = 'var(--success)';
    else if (data.efficiency_score >= 60) bar.style.backgroundColor = 'var(--warning)';
    else bar.style.backgroundColor = 'var(--danger)';

    document.getElementById('dash-cost').innerText = `$ ${data.estimated_daily_cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const badge = document.getElementById('alert-badge');
    badge.innerText = data.active_alerts;
    if (data.active_alerts > 0) badge.classList.remove('hidden');
    else badge.classList.add('hidden');

    document.getElementById('last-updated').innerHTML = `Last updated<br><span>${new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>`;

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

async function loadEnergy() {
    const data = await fetchData('/energy');
    if (!data) return;
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

async function loadOccupancy() {
    const data = await fetchData('/occupancy');
    if (!data) return;
    const container = document.getElementById('occupancy-list');
    container.innerHTML = '';
    data.buildings.forEach(b => {
        const occ = b.occupancy_percent;
        let status = 'NORMAL';
        let statusClass = 'status-NORMAL';
        if (occ > 85) { status = 'HIGH'; statusClass = 'status-CRITICAL'; }
        else if (occ < 20) { status = 'LOW'; statusClass = 'status-WARNING'; }

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

async function loadWaste() {
    const data = await fetchData('/waste');
    if (!data) return;
    const container = document.getElementById('waste-list');
    container.innerHTML = '';
    data.buildings.forEach(b => {
        const w = b.waste_fill_percent;
        let status = 'NORMAL';
        let statusClass = 'status-NORMAL';
        if (w > 90) { status = 'CRITICAL'; statusClass = 'status-CRITICAL'; }
        else if (w > 75) { status = 'WARNING'; statusClass = 'status-WARNING'; }

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

let currentAlerts = [];
async function loadAlerts() {
    const data = await fetchData('/alerts');
    if (!data) return;
    currentAlerts = data.alerts;
    renderAlerts('All');
}

function renderAlerts(filter) {
    const container = document.getElementById('alerts-container');
    container.innerHTML = '';

    let filtered = currentAlerts;
    if (filter !== 'All') {
        filtered = currentAlerts.filter(a => a.severity === filter);
    }

    if (filtered.length === 0) {
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

document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        renderAlerts(e.currentTarget.getAttribute('data-filter'));
    });
});

async function loadInsights() {
    const data = await fetchData('/insights');
    if (!data) return;
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

    if (data) {
        document.getElementById('wi-res-current').innerText = `${data.current_energy.toLocaleString()} kWh`;
        document.getElementById('wi-res-scenario').innerText = `${data.estimated_energy.toLocaleString()} kWh`;
        document.getElementById('wi-res-saved').innerText = `${data.energy_saved.toLocaleString()} kWh`;
        document.getElementById('wi-res-cost').innerText = `$ ${data.estimated_cost_saved.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
});


document.getElementById('btn-simulate').addEventListener('click', async () => {
    const btn = document.getElementById('btn-simulate');
    const originalText = btn.innerText;
    btn.innerText = 'Simulating...';
    btn.disabled = true;
    btn.style.opacity = '0.7';

    const data = await fetchData('/simulate', { method: 'POST' });
    if (data) {
     
        loadDashboard();

        const activePage = document.querySelector('.menu a.active').getAttribute('data-page');
        if (activePage === 'energy') loadEnergy();
        if (activePage === 'occupancy') loadOccupancy();
        if (activePage === 'waste') loadWaste();
        if (activePage === 'alerts') loadAlerts();
        if (activePage === 'insights') loadInsights();
    }

    btn.innerText = originalText;
    btn.disabled = false;
    btn.style.opacity = '1';
});

loadDashboard();
