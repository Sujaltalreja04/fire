// Marine Safety Operations OS - Core Simulation Engine

// 1. Initial State & Asset Database
const assetsDatabase = [
    {
        id: "FE-102",
        type: "Fire Extinguisher",
        name: "Portable CO2 Fire Extinguisher",
        manufacturer: "Kidde Marine OS",
        model: "CO2-5kg-Premium",
        installDate: "2024-01-12",
        lastInspected: "2025-06-18",
        status: "Pending",
        location: "Bridge Starboard Side",
        expiry: "2029-01-12",
        history: [
            { date: "2024-01-12", title: "Asset Initial Installation", desc: "Certified and installed on Bridge Starboard.", type: "pass", marker: "check" },
            { date: "2025-01-15", title: "Annual Service Checklist", desc: "Hydrostatic test completed successfully.", type: "pass", marker: "check" },
            { date: "2025-06-18", title: "Scheduled Inspection", desc: "Inspection flagged pending for current voyage.", type: "warn", marker: "alert" }
        ]
    },
    {
        id: "LR-204",
        type: "Liferaft",
        name: "15-Person Inflatable Liferaft",
        manufacturer: "RFD Toyo Marine",
        model: "ISO-9650-Lifesaver",
        installDate: "2023-09-04",
        lastInspected: "2026-05-12",
        status: "Passed",
        location: "Aft Deck Rack A",
        expiry: "2028-09-04",
        history: [
            { date: "2023-09-04", title: "Initial Safety Deployment", desc: "Deck mounting and secure strap test passed.", type: "pass", marker: "check" },
            { date: "2024-09-10", title: "Annual Hydrostatic Release Test", desc: "HRU replaced and verified active.", type: "pass", marker: "check" },
            { date: "2025-09-15", title: "Annual Recertification", desc: "Approved station inspection, buoyancy check normal.", type: "pass", marker: "check" },
            { date: "2026-05-12", title: "Routine Survey Checklist", desc: "Visual inspection and lashings verified by technician.", type: "pass", marker: "check" }
        ]
    },
    {
        id: "SC-908",
        type: "SCBA",
        name: "Self-Contained Breathing Apparatus",
        manufacturer: "Draeger Marine Safety",
        model: "PSS-4000-Dual",
        installDate: "2024-11-20",
        lastInspected: "2025-12-02",
        status: "Pending",
        location: "Engine Control Room Cabinet",
        expiry: "2029-11-20",
        history: [
            { date: "2024-11-20", title: "Asset Initial Installation", desc: "Air cylinder filled to 300 Bar and cabinet secured.", type: "pass", marker: "check" },
            { date: "2025-12-02", title: "Annual Cylinder Certification", desc: "Hydrostatic test approved, valve seal renewed.", type: "pass", marker: "check" }
        ]
    }
];

// Current operational state
let appState = {
    currentTab: 'dashboard',
    selectedEquipmentId: 'FE-102',
    scannedQrAssetId: null,
    selectedPhotos: [], // 'gauge', 'corrosion', 'seal'
    inspectionFindings: [],
    complianceVerdict: 'PENDING',
    activeNotifications: [],
    simulationStep: 0,
    themeMode: 'dark', // dark, light
    selectedTechnician: 'sujal',
    cctvSafetyBreach: false,
    toastCount: 0
};

// 2. Tab Navigation
function switchTab(tabId) {
    appState.currentTab = tabId;
    
    // Toggle active tab buttons
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    const navItem = document.getElementById(`nav-${tabId}`);
    if (navItem) navItem.classList.add('active');

    // Toggle active viewport panes
    document.querySelectorAll('.viewport-tab').forEach(tab => {
        tab.classList.remove('active-tab');
    });
    const activeTabPanel = document.getElementById(`tab-${tabId}`);
    if (activeTabPanel) activeTabPanel.classList.add('active-tab');

    // Update Header title
    const headerTitles = {
        'dashboard': 'Operations Control Center',
        'inspection': 'AI Inspection Assistant',
        'reports': 'Automated Compliance Certificates',
        'assets': 'Fleet Safety Asset Registry',
        'chat': 'Compliance Intelligence AI',
        'customer': 'Customer Self-Service Portal',
        'telemetry': 'IoT Live Sensors Telemetry',
        'dispatch': 'Technician Dispatch Deck Map',
        'cctv': 'CCTV Safety Video Analytics',
        'analytics': 'Predictive Health Forecasting'
    };
    document.getElementById('current-view-title').innerText = headerTitles[tabId] || 'Overview';

    // Trigger visual canvas refresh on CCTV switch
    if (tabId === 'cctv') {
        initCctvLoop();
    }
}

// 3. Light / Dark Mode Toggle
function toggleThemeMode() {
    const body = document.body;
    const themeBtn = document.getElementById('theme-toggle-btn');
    
    if (appState.themeMode === 'dark') {
        appState.themeMode = 'light';
        body.classList.add('light-mode');
        themeBtn.innerHTML = `<i data-lucide="moon"></i>`;
        showToast("Theme Updated", "Switched to Light Contrast view.", "info");
    } else {
        appState.themeMode = 'dark';
        body.classList.remove('light-mode');
        themeBtn.innerHTML = `<i data-lucide="sun"></i>`;
        showToast("Theme Updated", "Switched to Dark Console view.", "info");
    }
    lucide.createIcons();
}

// 4. Notification Toast System
function showToast(title, message, type = 'info') {
    const toastContainer = document.getElementById('toast-container-div');
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast`;
    
    let iconName = 'info';
    let iconClass = 'info';
    if (type === 'pass') { iconName = 'check-circle2'; iconClass = 'pass'; }
    else if (type === 'fail') { iconName = 'x-circle'; iconClass = 'fail'; }
    else if (type === 'warn') { iconName = 'alert-triangle'; iconClass = 'warn'; }

    toast.innerHTML = `
        <div class="toast-icon ${iconClass}">
            <i data-lucide="${iconName}"></i>
        </div>
        <div class="toast-body">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    lucide.createIcons();

    setTimeout(() => {
        toast.classList.add('removing');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 4500);

    pushToDashboardFeed(title, message, type);
}

function pushToDashboardFeed(title, message, type) {
    const feed = document.getElementById('dashboard-alerts-feed');
    if (!feed) return;

    if (feed.children.length >= 6) {
        feed.removeChild(feed.lastElementChild);
    }

    const feedItem = document.createElement('div');
    feedItem.className = 'feed-item';
    
    let iconName = 'bell';
    if (type === 'pass') iconName = 'check-circle2';
    else if (type === 'fail') iconName = 'alert-octagon';
    else if (type === 'warn') iconName = 'alert-triangle';

    feedItem.innerHTML = `
        <div class="feed-icon ${type}">
            <i data-lucide="${iconName}"></i>
        </div>
        <div class="feed-details">
            <span class="feed-text"><strong>${title}</strong>: ${message}</span>
            <div class="feed-meta">
                <span>Just Now</span>
                <span>OS Engine</span>
            </div>
        </div>
    `;
    
    feed.insertBefore(feedItem, feed.firstChild);
    lucide.createIcons();

    const counter = document.getElementById('header-notif-count');
    if (counter) {
        appState.toastCount++;
        counter.innerText = appState.toastCount;
    }
}

function toggleNotificationsMenu() {
    showToast("System Logs", "All background compliance monitoring metrics running normal.", "pass");
}

// 5. Fleet Asset Registry
function populateAssetsTable() {
    const tableBody = document.getElementById('assets-table-body');
    if (!tableBody) return;

    tableBody.innerHTML = '';
    assetsDatabase.forEach(asset => {
        let statusBadge = 'badge-pending';
        if (asset.status === 'Passed') statusBadge = 'badge-passed';
        if (asset.status === 'Failed') statusBadge = 'badge-failed';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong style="color: var(--primary);">${asset.id}</strong></td>
            <td>${asset.type}</td>
            <td>${asset.manufacturer}</td>
            <td>${asset.model}</td>
            <td>${asset.installDate}</td>
            <td>${asset.lastInspected}</td>
            <td><span class="equipment-status-badge ${statusBadge}">${asset.status}</span></td>
        `;
        row.onclick = () => openAssetFlyout(asset.id);
        tableBody.appendChild(row);
    });

    const customerTableBody = document.getElementById('customer-table-body');
    if (customerTableBody) {
        customerTableBody.innerHTML = '';
        assetsDatabase.forEach(asset => {
            let statusBadge = 'badge-passed';
            let certText = `<a href="#" onclick="viewComplianceReport(); event.stopPropagation();" style="color: var(--primary); text-decoration: underline;">CERT-${asset.id}</a>`;
            if (asset.status === 'Failed') {
                statusBadge = 'badge-failed';
                certText = `<span style="color: var(--color-fail); font-weight:600;">SUSPENDED</span>`;
            } else if (asset.status === 'Pending') {
                statusBadge = 'badge-pending';
                certText = `<span style="color: var(--color-warn); font-weight:600;">INSPECTION REQ.</span>`;
            }

            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${asset.id}</strong></td>
                <td>${asset.type}</td>
                <td>${asset.location}</td>
                <td>${asset.lastInspected}</td>
                <td>${asset.expiry}</td>
                <td>${certText}</td>
                <td><span class="equipment-status-badge ${statusBadge}">${asset.status}</span></td>
            `;
            customerTableBody.appendChild(row);
        });
    }

    const totalCountBadge = document.getElementById('registry-count-badge');
    if (totalCountBadge) {
        totalCountBadge.innerText = `Total Assets: ${assetsDatabase.length}`;
    }
}

function filterAssetsTable() {
    const query = document.getElementById('asset-search-input').value.toLowerCase();
    const typeFilter = document.getElementById('asset-type-filter').value;
    const tableBody = document.getElementById('assets-table-body');
    if (!tableBody) return;

    tableBody.innerHTML = '';
    assetsDatabase.forEach(asset => {
        const matchesSearch = asset.id.toLowerCase().includes(query) || 
                              asset.manufacturer.toLowerCase().includes(query) || 
                              asset.model.toLowerCase().includes(query) || 
                              asset.status.toLowerCase().includes(query);
        const matchesType = typeFilter === 'all' || asset.type === typeFilter;

        if (matchesSearch && matchesType) {
            let statusBadge = 'badge-pending';
            if (asset.status === 'Passed') statusBadge = 'badge-passed';
            if (asset.status === 'Failed') statusBadge = 'badge-failed';

            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong style="color: var(--primary);">${asset.id}</strong></td>
                <td>${asset.type}</td>
                <td>${asset.manufacturer}</td>
                <td>${asset.model}</td>
                <td>${asset.installDate}</td>
                <td>${asset.lastInspected}</td>
                <td><span class="equipment-status-badge ${statusBadge}">${asset.status}</span></td>
            `;
            row.onclick = () => openAssetFlyout(asset.id);
            tableBody.appendChild(row);
        }
    });
}

// 6. Timeline & Asset Flyout Drawer
function openAssetFlyout(assetId) {
    const asset = assetsDatabase.find(a => a.id === assetId);
    if (!asset) return;

    document.getElementById('flyout-asset-id').innerText = asset.id;
    document.getElementById('flyout-asset-type').innerText = asset.type;
    document.getElementById('flyout-manufacturer').innerText = `${asset.manufacturer} (${asset.model})`;
    document.getElementById('flyout-install-date').innerText = asset.installDate;
    
    const statusBox = document.getElementById('flyout-status-verdict');
    statusBox.innerText = asset.status;
    statusBox.className = 'equipment-status-badge';
    if (asset.status === 'Passed') statusBox.classList.add('badge-passed');
    else if (asset.status === 'Failed') statusBox.classList.add('badge-failed');
    else statusBox.classList.add('badge-pending');

    const timelineContainer = document.getElementById('flyout-timeline');
    timelineContainer.innerHTML = '';
    asset.history.forEach(evt => {
        const item = document.createElement('div');
        item.className = `timeline-item ${evt.type}-event`;
        item.innerHTML = `
            <div class="timeline-marker"></div>
            <div class="timeline-date">${evt.date}</div>
            <div class="timeline-title">${evt.title}</div>
            <div class="timeline-content">${evt.desc}</div>
        `;
        timelineContainer.appendChild(item);
    });

    document.getElementById('asset-flyout-panel').classList.add('active');
}

function closeAssetFlyout() {
    document.getElementById('asset-flyout-panel').classList.remove('active');
}

// 7. QR Scanner Simulator
function triggerQrScan() {
    const scanner = document.getElementById('scanner-box');
    const laser = document.getElementById('scanner-laser');
    const instructions = document.getElementById('scanner-instructions');
    
    if (appState.scannedQrAssetId) {
        showToast("Scan Log", "Asset FE-102 identification already active.", "pass");
        return;
    }

    scanner.classList.add('scanning');
    laser.style.display = 'block';
    instructions.innerText = "Analyzing Barcode/QR Code...";
    
    setTimeout(() => {
        laser.style.display = 'none';
        scanner.classList.remove('scanning');
        appState.scannedQrAssetId = 'FE-102';
        instructions.innerHTML = `<span style="color: var(--color-pass); font-weight:700;"><i data-lucide="check" style="display:inline-block; vertical-align:middle; width:14px;"></i> FE-102 VERIFIED ONBOARD</span>`;
        showToast("QR Scan Success", "Extinguisher #FE-102 synchronized. Local checklist activated.", "pass");
        
        selectEquipment('fire-ext');
        
        if (appState.simulationStep === 1) {
            nextSimStep();
        }
        lucide.createIcons();
    }, 1500);
}

function selectEquipment(equipType) {
    document.querySelectorAll('.equipment-card').forEach(card => card.classList.remove('selected'));
    
    let assetId = '';
    if (equipType === 'fire-ext') {
        document.getElementById('equip-fire-ext').classList.add('selected');
        assetId = 'FE-102';
    } else if (equipType === 'liferaft') {
        document.getElementById('equip-liferaft').classList.add('selected');
        assetId = 'LR-204';
    } else if (equipType === 'scba') {
        document.getElementById('equip-scba').classList.add('selected');
        assetId = 'SC-908';
    }
    appState.selectedEquipmentId = assetId;
    
    renderAiOverlayCanvas();

    if (assetId !== 'FE-102') {
        document.getElementById('start-analysis-btn').disabled = true;
    } else {
        document.getElementById('start-analysis-btn').disabled = appState.selectedPhotos.length === 0;
    }
}

// 8. AI Bounding Box Rendering
function togglePhotoSelection(photoType) {
    if (appState.selectedEquipmentId !== 'FE-102') {
        showToast("Selection Locked", "Mock images are configured for Extinguisher FE-102 only.", "warn");
        return;
    }

    const card = document.getElementById(`photo-${photoType}`);
    if (card.classList.contains('selected')) {
        card.classList.remove('selected');
        appState.selectedPhotos = appState.selectedPhotos.filter(p => p !== photoType);
    } else {
        card.classList.add('selected');
        appState.selectedPhotos.push(photoType);
    }

    renderAiOverlayCanvas();

    const btn = document.getElementById('start-analysis-btn');
    btn.disabled = appState.selectedPhotos.length === 0;

    if (appState.simulationStep === 2 && appState.selectedPhotos.includes('gauge') && appState.selectedPhotos.includes('corrosion') && appState.selectedPhotos.includes('seal')) {
        setTimeout(() => {
            nextSimStep();
        }, 800);
    }
}

function renderAiOverlayCanvas() {
    const container = document.getElementById('ai-photo-overlay-container');
    if (!container) return;

    if (appState.selectedEquipmentId !== 'FE-102' || appState.selectedPhotos.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; color: var(--text-muted); font-size: 0.8rem; padding: 20px;">
                <i data-lucide="image" style="width: 36px; height: 36px; stroke-width: 1.5; margin-bottom: 8px;"></i>
                <div>AI Computer Vision Bounding Box Canvas</div>
            </div>
        `;
        lucide.createIcons();
        return;
    }

    const hasBeenAnalyzed = (document.getElementById('compliance-verdict-box').style.display === 'flex');

    container.innerHTML = `
        <svg viewBox="0 0 320 180" style="width:100%; height:100%; fill:none; stroke-linecap:round; stroke-linejoin:round;">
            <!-- Fire Extinguisher Body Cylinder -->
            <path d="M120 70 L180 70 L180 150 A30 30 0 0 1 120 150 Z" fill="#b91c1c" stroke="#f8fafc" stroke-width="2" />
            <!-- Neck & Handle -->
            <path d="M140 70 L140 45 L130 45 A10 10 0 0 1 140 35 L170 35" stroke="#f8fafc" stroke-width="2"/>
            <path d="M150 45 L150 30" stroke="#f8fafc" stroke-width="3" />
            <!-- Hose -->
            <path d="M150 45 Q190 50 190 120" stroke="#000" stroke-width="3.5" />
            
            <!-- Visual highlight areas -->
            ${appState.selectedPhotos.includes('gauge') ? `<circle cx="80" cy="55" r="15" fill="none" stroke="var(--primary)" stroke-width="1.5" stroke-dasharray="3,3" />` : ''}
            ${appState.selectedPhotos.includes('seal') ? `<circle cx="210" cy="40" r="15" fill="none" stroke="var(--primary)" stroke-width="1.5" stroke-dasharray="3,3" />` : ''}
            ${appState.selectedPhotos.includes('corrosion') ? `<circle cx="150" cy="80" r="15" fill="none" stroke="var(--primary)" stroke-width="1.5" stroke-dasharray="3,3" />` : ''}

            <!-- Target points labels -->
            <circle cx="150" cy="50" r="3" fill="#f8fafc"/>
        </svg>

        <!-- Dynamic Absolute Bounding Boxes -->
        ${(hasBeenAnalyzed && appState.selectedPhotos.includes('gauge')) ? `
            <div class="ai-bounding-box" style="top: 25px; left: 35px; width: 65px; height: 65px;">
                <span class="ai-box-label">Low PSI [94%]</span>
            </div>
        ` : ''}
        
        ${(hasBeenAnalyzed && appState.selectedPhotos.includes('corrosion')) ? `
            <div class="ai-bounding-box warn-box" style="top: 65px; left: 125px; width: 50px; height: 50px;">
                <span class="ai-box-label">Corrosion [88%]</span>
            </div>
        ` : ''}
        
        ${(hasBeenAnalyzed && appState.selectedPhotos.includes('seal')) ? `
            <div class="ai-bounding-box" style="top: 15px; left: 185px; width: 55px; height: 55px;">
                <span class="ai-box-label">No Seal [99%]</span>
            </div>
        ` : ''}
    `;
}

function startAiAnalysis() {
    const progressArea = document.getElementById('scan-progress-area');
    const progressBar = document.getElementById('scan-progress-fill');
    const label = document.getElementById('scan-progress-label');
    const percent = document.getElementById('scan-progress-percent');
    const startBtn = document.getElementById('start-analysis-btn');
    
    startBtn.disabled = true;
    progressArea.style.display = 'block';
    let progressVal = 0;
    
    const interval = setInterval(() => {
        progressVal += 10;
        if (progressVal > 100) progressVal = 100;
        
        progressBar.style.width = `${progressVal}%`;
        percent.innerText = `${progressVal}%`;
        
        if (progressVal === 30) label.innerText = "Analyzing pressure gauge scaling...";
        if (progressVal === 60) label.innerText = "Verifying surface rust depth on neck...";
        if (progressVal === 90) label.innerText = "Running tamper seal validation...";

        if (progressVal >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                progressArea.style.display = 'none';
                evaluateAiFindings();
            }, 600);
        }
    }, 120);
}

function evaluateAiFindings() {
    const findingsList = document.getElementById('ai-findings-list');
    findingsList.innerHTML = '';
    
    let hasFailures = false;
    appState.inspectionFindings = [];

    if (appState.selectedPhotos.includes('gauge')) {
        appState.inspectionFindings.push({
            title: "Pressure Gauge Abnormality",
            desc: "Gauge dial reading at 95 PSI (Standard range: 115 - 145 PSI). Low discharge capability.",
            severity: "danger",
            verdict: "fail"
        });
        hasFailures = true;
    }
    if (appState.selectedPhotos.includes('corrosion')) {
        appState.inspectionFindings.push({
            title: "Corrosion Detected",
            desc: "Mild thread surface oxidation near handle neck. Cleaning recommended.",
            severity: "warning",
            verdict: "warn"
        });
    }
    if (appState.selectedPhotos.includes('seal')) {
        appState.inspectionFindings.push({
            title: "Missing Safety Seal & Pin",
            desc: "Safety wire lock is missing. Risk of accidental deployment.",
            severity: "danger",
            verdict: "fail"
        });
        hasFailures = true;
    }

    if (appState.inspectionFindings.length === 0) {
        appState.inspectionFindings.push({
            title: "Equipment Clean Pass",
            desc: "All visual checkpoints normal. Safety valves secured.",
            severity: "normal",
            verdict: "pass"
        });
        appState.complianceVerdict = 'PASS';
    } else {
        appState.complianceVerdict = hasFailures ? 'FAIL' : 'WARN';
    }

    appState.inspectionFindings.forEach(finding => {
        const item = document.createElement('div');
        item.className = 'finding-item';
        item.innerHTML = `
            <div class="finding-info">
                <div class="finding-severity severity-${finding.severity}"></div>
                <div>
                    <div class="finding-title">${finding.title}</div>
                    <div class="finding-desc">${finding.desc}</div>
                </div>
            </div>
            <div class="finding-status-text ${finding.verdict}">${finding.verdict}</div>
        `;
        findingsList.appendChild(item);
    });

    const verdictBox = document.getElementById('compliance-verdict-box');
    const verdictText = document.getElementById('compliance-verdict-text');
    
    verdictBox.style.display = 'flex';
    verdictText.innerText = appState.complianceVerdict;
    
    if (appState.complianceVerdict === 'FAIL') {
        verdictText.style.color = 'var(--color-fail)';
        document.getElementById('equip-badge-fire-ext').innerText = 'Failed';
        document.getElementById('equip-badge-fire-ext').className = 'equipment-status-badge badge-failed';
        
        const feIndex = assetsDatabase.findIndex(a => a.id === 'FE-102');
        assetsDatabase[feIndex].status = 'Failed';
        assetsDatabase[feIndex].lastInspected = '2026-06-18';
        assetsDatabase[feIndex].history.unshift({
            date: "2026-06-18",
            title: "AI Inspection Failed",
            desc: "Safety seal missing & low pressure (95 PSI) flagged by AI model.",
            type: "fail",
            marker: "close"
        });
    } else {
        verdictText.style.color = 'var(--color-pass)';
        document.getElementById('equip-badge-fire-ext').innerText = 'Passed';
        document.getElementById('equip-badge-fire-ext').className = 'equipment-status-badge badge-passed';
        
        const feIndex = assetsDatabase.findIndex(a => a.id === 'FE-102');
        assetsDatabase[feIndex].status = 'Passed';
        assetsDatabase[feIndex].lastInspected = '2026-06-18';
        assetsDatabase[feIndex].history.unshift({
            date: "2026-06-18",
            title: "AI Inspection Passed",
            desc: "Approved with full integrity. Ready for operation.",
            type: "pass",
            marker: "check"
        });
    }

    renderAiOverlayCanvas(); // Refresh to draw bounding boxes
    populateAssetsTable();
    generateAutomatedReport();

    showToast(
        `Audit Complete: FE-102`, 
        `Audit processed. Result: ${appState.complianceVerdict} (Logged to SOLAS Ledger).`, 
        appState.complianceVerdict === 'FAIL' ? 'fail' : 'pass'
    );

    if (appState.simulationStep === 3) {
        nextSimStep();
    }
}

// 9. Automated Report Builder
function generateAutomatedReport() {
    const asset = assetsDatabase.find(a => a.id === 'FE-102');
    if (!asset) return;

    document.getElementById('report-asset-name').innerText = asset.name;
    document.getElementById('report-asset-id').innerText = asset.id;
    document.getElementById('report-inspection-date').innerText = "June 18, 2026";
    
    const badge = document.getElementById('report-verdict-badge');
    const decisionTitle = document.getElementById('report-decision-title');
    const decisionDesc = document.getElementById('report-decision-desc');
    
    if (asset.status === 'Failed') {
        badge.innerText = 'FAIL';
        badge.className = 'badge-report-fail';
        decisionTitle.innerText = "COMPLIANCE DECISION: REGULATORY FAIL";
        decisionTitle.style.color = '#b91c1c';
        decisionDesc.innerText = "Defects represent non-conformity to SOLAS Chapter II-2. Equipment must be service-flagged or replaced.";
    } else {
        badge.innerText = 'PASS';
        badge.className = 'badge-report-pass';
        decisionTitle.innerText = "COMPLIANCE DECISION: PASSED & VALIDATED";
        decisionTitle.style.color = '#047857';
        decisionDesc.innerText = "All testing metrics satisfy SOLAS Standards. Vessel Fire Certificate extension approved.";
    }

    const tbody = document.getElementById('report-table-body');
    tbody.innerHTML = '';
    
    const checkPressure = appState.selectedPhotos.includes('gauge');
    const checkCorrosion = appState.selectedPhotos.includes('corrosion');
    const checkSeal = appState.selectedPhotos.includes('seal');

    tbody.innerHTML += `
        <tr>
            <td><strong>Pressure Gauge Verification</strong></td>
            <td>${checkPressure ? 'Pressure gauge reading is 95 PSI. Insufficient charge (requires 110-150 PSI).' : 'Pressure gauge verified at 120 PSI. Within compliance standards.'}</td>
            <td><span class="${checkPressure ? 'badge-report-fail' : 'badge-report-pass'}">${checkPressure ? 'FAIL' : 'PASS'}</span></td>
        </tr>
        <tr>
            <td><strong>Surface Corrosion & Neck Integrity</strong></td>
            <td>${checkCorrosion ? 'Mild surface rust detected around thread area. Cosmetic warning issued.' : 'No surface oxidation or valve thread breakdown detected.'}</td>
            <td><span class="${checkCorrosion ? 'badge-report-fail' : 'badge-report-pass'}">${checkCorrosion ? 'WARN' : 'PASS'}</span></td>
        </tr>
        <tr>
            <td><strong>Safety Seal & Securing Pin</strong></td>
            <td>${checkSeal ? 'Safety wire lock is missing. Valve is considered unsecured.' : 'Safety ring pin secured and lead tamper seal fully intact.'}</td>
            <td><span class="${checkSeal ? 'badge-report-fail' : 'badge-report-pass'}">${checkSeal ? 'FAIL' : 'PASS'}</span></td>
        </tr>
    `;

    const imagesAnnex = document.getElementById('report-images-annex');
    imagesAnnex.innerHTML = '';
    
    if (appState.selectedPhotos.length === 0) {
        imagesAnnex.innerHTML = `<div class="report-img-wrapper" style="background:#e2e8f0; display:flex; align-items:center; justify-content:center;"><i data-lucide="image" style="color:#64748b;"></i></div>`;
    } else {
        appState.selectedPhotos.forEach(p => {
            let svgContent = '';
            if (p === 'gauge') {
                svgContent = `<svg viewBox="0 0 100 100" style="stroke: #b91c1c; fill:none; width:100%; height:100%; stroke-width:5;"><circle cx="50" cy="50" r="40"/><line x1="50" y1="50" x2="20" y2="35" stroke-width="6"/><circle cx="50" cy="50" r="5" fill="#f8fafc"/></svg>`;
            } else if (p === 'corrosion') {
                svgContent = `<svg viewBox="0 0 100 100" style="stroke: #b45309; fill:none; width:100%; height:100%; stroke-width:4;"><circle cx="48" cy="28" r="7" fill="#b45309" fill-opacity="0.7"/><circle cx="53" cy="38" r="9" fill="#b45309" fill-opacity="0.8"/></svg>`;
            } else if (p === 'seal') {
                svgContent = `<svg viewBox="0 0 100 100" style="stroke: #94a3b8; fill:none; width:100%; height:100%; stroke-width:4;"><circle cx="50" cy="40" r="14" stroke-dasharray="4, 4"/><line x1="50" y1="54" x2="50" y2="80" stroke-dasharray="4, 4"/><path d="M35 70 L65 70" stroke="#b91c1c" stroke-width="6" /></svg>`;
            }
            imagesAnnex.innerHTML += `
                <div class="report-img-wrapper" style="background:#0f172a; padding:10px; display:flex; align-items:center; justify-content:center;">
                    ${svgContent}
                </div>
            `;
        });
    }
    lucide.createIcons();
}

function viewComplianceReport() {
    switchTab('reports');
}

// 10. Compliance Chatbot
function askPresetQuestion(questionText) {
    const input = document.getElementById('chat-user-input');
    input.value = questionText;
    sendChatMessage();
}

function sendChatMessage() {
    const input = document.getElementById('chat-user-input');
    const query = input.value.trim();
    if (!query) return;

    appendChatMessage(query, 'user');
    input.value = '';

    setTimeout(() => {
        const reply = formulateChatbotResponse(query);
        appendChatMessage(reply, 'assistant');
    }, 800);
}

function appendChatMessage(text, sender) {
    const history = document.getElementById('chat-history-log');
    if (!history) return;

    const msg = document.createElement('div');
    msg.className = `chat-msg ${sender}`;
    const avatarName = sender === 'user' ? 'ST' : 'AI';
    
    let formattedText = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/- (.*?)\n/g, '<li>$1</li>')
        .replace(/\n\n/g, '<br><br>');
        
    if (formattedText.includes('<li>')) {
        formattedText = formattedText.replace(/(<li>.*?<\/li>)/s, '<ul>$1</ul>');
    }

    msg.innerHTML = `
        <div class="chat-avatar">${avatarName}</div>
        <div class="chat-bubble">
            ${formattedText}
        </div>
    `;

    history.appendChild(msg);
    history.scrollTop = history.scrollHeight;
    
    if (appState.simulationStep === 4 && (text.toLowerCase().includes('fail') || text.toLowerCase().includes('fe-102'))) {
        setTimeout(() => {
            nextSimStep();
        }, 1500);
    }
}

function formulateChatbotResponse(query) {
    const q = query.toLowerCase();

    if (q.includes('interval') || q.includes('how often')) {
        return `Under **SOLAS Chapter II-2 Regulation 14**, inspection intervals are:
- **Crew Monthly**: Visual seals checks and pressure reviews.
- **Annual Service**: Complete hydrostatic tests, weight, and valve certifications.
- **5-Year Test**: Internal release valve pressure test.`;
    }
    
    if (q.includes('lifeboat') || q.includes('raft')) {
        return `Under **SOLAS Chapter III**:
- **Liferafts**: Serviced every **12 months** at an approved station.
- **Lifeboats**: Crew launching maneuvers performed every **3 months**.`;
    }

    if (q.includes('fe-102') || q.includes('fail')) {
        return `Asset **FE-102 failed compliance** because:
1. **Unsecured Valve**: Tamper lock wire/seal is missing (99% confidence).
2. **Defect**: Valve pressure holds only **95 PSI** (under the 110 PSI threshold).
3. **Rust**: Neck thread oxidation detected.

*Action*: Clean neck, recharge tank, replace tamper seal, and request Surveyor sign-off.`;
    }

    return `I apologize, I could not find a direct citation in the active database. For standard operations:
*   Reference **SOLAS Chapter III** for LSA guidelines.
*   Ask: *"Why did inspection FE-102 fail compliance?"* for details on our active scenario.`;
}

// 11. IoT Live Telemetry Simulator
function updateScbaTelemetry(val) {
    const valEl = document.getElementById('telemetry-scba-val');
    const labelEl = document.getElementById('slider-scba-label');
    const indicator = document.getElementById('gauge-scba');
    const status = document.getElementById('telemetry-scba-status');
    const card = document.getElementById('telemetry-scba-card');
    
    valEl.innerText = val;
    labelEl.innerText = `${val} Bar`;
    
    const maxVal = 350;
    const offset = 251.2 - (val / maxVal) * 251.2;
    indicator.style.strokeDashoffset = offset;

    if (val < 200) {
        status.innerText = "CRITICAL LOW CHARGE";
        status.style.color = "var(--color-fail)";
        card.classList.add('danger-alert');
        if (val % 20 === 0) {
            showToast("SCBA Alert", `Air Cylinder pressure dropped below safety levels: ${val} Bar!`, "fail");
        }
    } else {
        status.innerText = "Normal Charge";
        status.style.color = "var(--color-pass)";
        card.classList.remove('danger-alert');
    }
}

function updateGasTelemetry(val) {
    const valEl = document.getElementById('telemetry-gas-val');
    const labelEl = document.getElementById('slider-gas-label');
    const indicator = document.getElementById('gauge-gas');
    const status = document.getElementById('telemetry-gas-status');
    const card = document.getElementById('telemetry-gas-card');
    
    valEl.innerText = val;
    labelEl.innerText = `${val} PPM`;
    
    const maxVal = 100;
    const offset = 251.2 - (val / maxVal) * 251.2;
    indicator.style.strokeDashoffset = offset;

    if (val > 10) {
        status.innerText = "TOXIC ATMOSPHERE WARNING";
        status.style.color = "var(--color-fail)";
        card.classList.add('danger-alert');
        indicator.style.stroke = "var(--color-fail)";
        if (val % 15 === 0) {
            showToast("Gas Release Alarm", `Toxic H2S Leak detected: ${val} PPM! Evacuate Zone immediately.`, "fail");
        }
    } else {
        status.innerText = "Safe atmosphere";
        status.style.color = "var(--color-pass)";
        card.classList.remove('danger-alert');
        indicator.style.stroke = "var(--primary)";
    }
}

function updateLiferaftTelemetry(val) {
    const valEl = document.getElementById('telemetry-liferaft-val');
    const labelEl = document.getElementById('slider-liferaft-label');
    const indicator = document.getElementById('gauge-liferaft');
    const status = document.getElementById('telemetry-liferaft-status');
    const card = document.getElementById('telemetry-liferaft-card');
    
    valEl.innerText = val;
    labelEl.innerText = `${val} PSI`;
    
    const maxVal = 5.0;
    const offset = 251.2 - (val / maxVal) * 251.2;
    indicator.style.strokeDashoffset = offset;

    if (val < 2.2) {
        status.innerText = "UNDER-INFLATION WARNING";
        status.style.color = "var(--color-warn)";
        card.classList.add('danger-alert');
        indicator.style.stroke = "var(--color-warn)";
    } else if (val > 4.2) {
        status.innerText = "OVER-PRESSURE RISK";
        status.style.color = "var(--color-fail)";
        card.classList.add('danger-alert');
        indicator.style.stroke = "var(--color-fail)";
    } else {
        status.innerText = "Buoyancy Nominal";
        status.style.color = "var(--color-pass)";
        card.classList.remove('danger-alert');
        indicator.style.stroke = "var(--primary)";
    }
}

// 12. Dispatch Map Surveyor Nodes
function selectMapTechnician(techId) {
    appState.selectedTechnician = techId;
    
    document.querySelectorAll('.dispatch-tech-card').forEach(card => card.classList.remove('active'));
    document.getElementById(`tech-card-${techId}`).classList.add('active');

    const route = document.getElementById('dispatch-route-path');
    
    if (techId === 'sujal') {
        route.setAttribute('d', 'M 100 80 Q 150 120 200 80');
        route.style.display = 'block';
        route.style.stroke = 'var(--primary)';
        showToast("Technician Focus", "Sujal Surveyor route: Bridge to Cargo Deck 2 active.", "info");
    } else if (techId === 'david') {
        route.setAttribute('d', 'M 200 80 Q 210 120 210 145');
        route.style.display = 'block';
        route.style.stroke = 'var(--secondary)';
        showToast("Technician Focus", "David Surveyor route: Cargo to Engine Room ladder active.", "info");
    } else if (techId === 'emma') {
        route.setAttribute('d', 'M 320 80 Q 260 60 200 80');
        route.style.display = 'block';
        route.style.stroke = 'var(--color-warn)';
        showToast("Technician Focus", "Emma Inspector route: Aft Deck transit to Cargo Deck active.", "info");
    }
}

function clickDeckZone(zoneName) {
    showToast("Deck Sensors Sync", `Zone: ${zoneName} - All safety inventory online. Signal strength 98%.`, "pass");
}

// 13. CCTV PPE Monitoring Canvas Loop
let cctvCanvas = null;
let cctvCtx = null;
let cctvAnimationId = null;
let worker1X = 120;
let worker1Dir = 1;
let worker2X = 350;
let worker2Dir = -1;

function initCctvLoop() {
    cctvCanvas = document.getElementById('cctv-canvas');
    if (!cctvCanvas) return;
    cctvCtx = cctvCanvas.getContext('2d');
    
    if (cctvAnimationId) {
        cancelAnimationFrame(cctvAnimationId);
    }
    
    drawCctvFrame();
}

function drawCctvFrame() {
    if (!cctvCtx || appState.currentTab !== 'cctv') return;

    cctvCtx.fillStyle = '#090d16';
    cctvCtx.fillRect(0, 0, 640, 360);
    
    cctvCtx.strokeStyle = '#334155';
    cctvCtx.lineWidth = 2;
    cctvCtx.beginPath();
    cctvCtx.moveTo(40, 240);
    cctvCtx.lineTo(600, 240);
    cctvCtx.moveTo(40, 260);
    cctvCtx.lineTo(600, 260);
    cctvCtx.stroke();

    cctvCtx.fillStyle = '#1e293b';
    cctvCtx.fillRect(40, 120, 20, 240);
    cctvCtx.fillRect(580, 120, 20, 240);

    cctvCtx.fillStyle = '#b45309';
    if (appState.cctvSafetyBreach) {
        cctvCtx.fillStyle = (Math.floor(Date.now() / 400) % 2 === 0) ? '#ef4444' : '#7f1d1d';
    }
    cctvCtx.fillRect(440, 260, 140, 100);
    cctvCtx.fillStyle = '#0f172a';
    cctvCtx.font = 'bold 8px monospace';
    cctvCtx.fillText("HAZARD BOUNDARY RACK", 450, 280);

    worker1X += 0.8 * worker1Dir;
    if (worker1X > 300) worker1Dir = -1;
    if (worker1X < 80) worker1Dir = 1;

    drawWorkerNode(worker1X, 210, "ST Surveyor", true, true);

    worker2X += 1.2 * worker2Dir;
    if (worker2X > 520) worker2Dir = -1;
    if (worker2X < 260) worker2Dir = 1;

    if (appState.cctvSafetyBreach) {
        worker2X = 490; 
        drawWorkerNode(worker2X, 220, "Crew Member", true, false); 
    } else {
        drawWorkerNode(worker2X, 220, "David Surveyor", true, true);
    }

    const timeEl = document.getElementById('cctv-timestamp');
    if (timeEl) {
        const dateStr = new Date().toISOString().slice(0, 19).replace('T', ' ');
        timeEl.innerText = `${dateStr} UTC`;
    }

    cctvAnimationId = requestAnimationFrame(drawCctvFrame);
}

function drawWorkerNode(x, y, name, hasHelmet, hasHarness) {
    cctvCtx.fillStyle = '#e2e8f0';
    cctvCtx.beginPath();
    cctvCtx.arc(x, y, 6, 0, Math.PI * 2);
    cctvCtx.fill();
    
    cctvCtx.fillStyle = '#0369a1';
    cctvCtx.fillRect(x - 8, y + 6, 16, 26);

    if (hasHelmet) {
        cctvCtx.fillStyle = '#eab308'; 
        cctvCtx.beginPath();
        cctvCtx.arc(x, y - 2, 7, Math.PI, 0);
        cctvCtx.fill();
        cctvCtx.fillRect(x - 9, y - 2, 18, 2);
    }

    if (hasHarness) {
        cctvCtx.strokeStyle = '#22c55e'; 
        cctvCtx.lineWidth = 2.5;
        cctvCtx.strokeRect(x - 6, y + 8, 12, 16);
    }

    const boxHeight = 46;
    const boxWidth = 26;
    const boxTop = y - 10;
    const boxLeft = x - 13;

    if (hasHelmet && hasHarness) {
        cctvCtx.strokeStyle = '#22c55e';
        cctvCtx.lineWidth = 1.5;
        cctvCtx.strokeRect(boxLeft, boxTop, boxWidth, boxHeight);
        
        cctvCtx.fillStyle = '#22c55e';
        cctvCtx.font = '8px Arial';
        cctvCtx.fillText("PPE: COMPLIANT [96%]", boxLeft, boxTop - 4);
    } else {
        const flashColor = (Math.floor(Date.now() / 250) % 2 === 0) ? '#ef4444' : 'rgba(239, 68, 68, 0.2)';
        cctvCtx.strokeStyle = flashColor;
        cctvCtx.lineWidth = 2;
        cctvCtx.strokeRect(boxLeft, boxTop, boxWidth, boxHeight);
        
        cctvCtx.fillStyle = '#ef4444';
        cctvCtx.font = 'bold 8px Arial';
        cctvCtx.fillText("HAZARD: NO HARNESS", boxLeft, boxTop - 4);
    }

    cctvCtx.fillStyle = '#94a3b8';
    cctvCtx.font = '8px monospace';
    cctvCtx.fillText(name, x - 25, y + 42);
}

function simulateCctvBreach() {
    if (appState.cctvSafetyBreach) {
        appState.cctvSafetyBreach = false;
        showToast("Safety Restored", "Crew member exited hazard rack. Bounding box cleared.", "pass");
        
        const log = document.getElementById('cctv-warnings-log');
        log.innerHTML = `
            <div class="feed-item" style="padding: 8px 0;">
                <div class="feed-icon pass" style="width:28px; height:28px;"><i data-lucide="check" style="width:14px;"></i></div>
                <div class="feed-details">
                    <span style="font-size:0.75rem;">Worker #1 PPE checks passed (Helmet, Vest).</span>
                </div>
            </div>
        `;
        lucide.createIcons();
    } else {
        appState.cctvSafetyBreach = true;
        showToast("CRITICAL SAFETY BREACH", "CCTV AI detected worker entering Aft Hazard rack without securing safety harness!", "fail");
        
        const log = document.getElementById('cctv-warnings-log');
        const warningItem = document.createElement('div');
        warningItem.className = 'feed-item';
        warningItem.style.padding = '8px 0';
        warningItem.innerHTML = `
            <div class="feed-icon fail" style="width:28px; height:28px;"><i data-lucide="shield-alert" style="width:14px;"></i></div>
            <div class="feed-details">
                <span style="font-size:0.75rem; color: var(--color-fail);"><strong>Harness Breach</strong> on Aft Deck: Worker unsecured near boundary.</span>
            </div>
        `;
        log.insertBefore(warningItem, log.firstChild);
        lucide.createIcons();
    }
}

// 14. Predictive Analytics Detail click
function showChartValue(percentageVal) {
    showToast("Telemetry Analysis", `Forecasted cylinder wall pressure integrity: ${percentageVal}%`, "info");
}

function triggerProactiveService() {
    showToast("Service Dispatch", "Proactive SCBA-908 micro-seal replacement order logged in dispatcher ledger.", "pass");
    document.getElementById('forecast-date').innerText = "Servicing Scheduled";
    document.getElementById('forecast-date').style.color = "var(--color-pass)";
}

// 15. Guided Scenario Steps Progress Control
const scenarioSteps = [
    {
        step: 0,
        desc: "<strong>Step 1: Init Simulation</strong><br>We will simulate a technician performing a fire extinguisher inspection onboard the cargo vessel. The extinguisher has several flaws that the AI needs to detect. Click <strong>Start Scenario</strong> to scan the QR code.",
        actionBtnText: "Start Scenario",
        setup: () => {
            switchTab('dashboard');
            appState.scannedQrAssetId = null;
            appState.selectedPhotos = [];
            appState.complianceVerdict = 'PENDING';
            
            const feIndex = assetsDatabase.findIndex(a => a.id === 'FE-102');
            assetsDatabase[feIndex].status = 'Pending';
            assetsDatabase[feIndex].lastInspected = '2025-06-18';
            assetsDatabase[feIndex].history = assetsDatabase[feIndex].history.filter(h => !h.title.includes("2026"));
            
            populateAssetsTable();
            
            const scannerBox = document.getElementById('scanner-box');
            scannerBox.classList.remove('scanning');
            document.getElementById('scanner-laser').style.display = 'none';
            document.getElementById('scanner-instructions').innerHTML = `Click QR Code to Simulate Scanning`;
            
            document.getElementById('photo-gauge').classList.remove('selected');
            document.getElementById('photo-corrosion').classList.remove('selected');
            document.getElementById('photo-seal').classList.remove('selected');
            document.getElementById('start-analysis-btn').disabled = true;
            document.getElementById('ai-findings-list').innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: var(--text-muted); text-align: center; gap: 8px;">
                    <i data-lucide="info" style="width: 32px; height: 32px;"></i>
                    <span style="font-size: 0.85rem;">Select inspection photos above and click <strong>Run AI Analysis</strong>.</span>
                </div>
            `;
            document.getElementById('compliance-verdict-box').style.display = 'none';
            
            renderAiOverlayCanvas();
            lucide.createIcons();
        }
    },
    {
        step: 1,
        desc: "<strong>Step 2: Scan Equipment QR Code</strong><br>The technician arrives at the Bridge Starboard side and scans the QR code on Fire Extinguisher <strong>FE-102</strong> to sync records. Click the <strong>QR Code</strong> on the left page or click the action button to simulate QR identification.",
        actionBtnText: "Auto Scan QR",
        setup: () => {
            switchTab('inspection');
            selectEquipment('fire-ext');
            const container = document.getElementById('scanner-box');
            container.style.boxShadow = "0 0 25px var(--primary-glow)";
            setTimeout(() => { container.style.boxShadow = "none"; }, 1500);
        },
        action: () => {
            triggerQrScan();
        }
    },
    {
        step: 2,
        desc: "<strong>Step 3: Capture & Select Inspection Photos</strong><br>The technician captures detailed photos of the extinguisher showing pressure gauge, body corrosion, and safety seal. Click the <strong>three photo cards</strong> in the center column to stage them for AI analysis.",
        actionBtnText: "Select Photos",
        setup: () => {
            const photosGrid = document.querySelector('.photo-cards-grid');
            photosGrid.style.border = "1px solid var(--primary)";
            setTimeout(() => { photosGrid.style.border = "none"; }, 1500);
        },
        action: () => {
            if (!appState.selectedPhotos.includes('gauge')) togglePhotoSelection('gauge');
            if (!appState.selectedPhotos.includes('corrosion')) togglePhotoSelection('corrosion');
            if (!appState.selectedPhotos.includes('seal')) togglePhotoSelection('seal');
        }
    },
    {
        step: 3,
        desc: "<strong>Step 4: Execute AI Diagnostic Analysis</strong><br>Now, run the AI model to automatically examine the selected photographs. The neural network will locate structural anomalies. Click the <strong>Run AI Analysis</strong> button.",
        actionBtnText: "Run AI Analysis",
        setup: () => {
            const btn = document.getElementById('start-analysis-btn');
            btn.style.boxShadow = "0 0 20px var(--primary)";
            setTimeout(() => { btn.style.boxShadow = "none"; }, 1500);
        },
        action: () => {
            startAiAnalysis();
        }
    },
    {
        step: 4,
        desc: "<strong>Step 5: Compliance Verification Result</strong><br>The compliance engine processes the AI diagnostic findings. Due to the missing tamper seal and drop in gauge pressure, the extinguisher receives a regulatory <strong>FAIL</strong>. Click the action button to check regulation details via <strong>Compliance AI Chat</strong>.",
        actionBtnText: "Verify with AI Chat",
        setup: () => {
            const verdictText = document.getElementById('compliance-verdict-text');
            verdictText.style.animation = "pulse 1s infinite";
        },
        action: () => {
            switchTab('chat');
            askPresetQuestion('Why did inspection FE-102 fail compliance?');
        }
    },
    {
        step: 5,
        desc: "<strong>Step 6: Report Generation & Customer Dispatch</strong><br>The system compiles the official certificate showing all details, photos, and compliance verdicts. Meanwhile, the client is automatically alerted via the Customer Portal. Click action button to review client status.",
        actionBtnText: "Open Customer Portal",
        setup: () => {
            switchTab('reports');
            showToast("Customer Portal", "Notification sent to Atlantic Marine Owner. New certificate available.", "pass");
        },
        action: () => {
            switchTab('customer');
            showToast("Client Portal Active", "Showing compliance inventory for Atlantic Marine Fleet.", "info");
            
            setTimeout(() => {
                document.getElementById('sim-step-description').innerHTML = `
                    <div style="color: var(--color-pass); font-weight:700;"><i data-lucide="award" style="display:inline-block; vertical-align:middle; width:18px;"></i> SCENARIO COMPLETE!</div>
                    The simulation has demonstrated the end-to-end flow: QR scan, photo-assisted AI inspection, automated report build, and client notification. Press <strong>Restart</strong> to run again.
                `;
                document.getElementById('sim-next-btn').innerText = "Restart Simulation";
                lucide.createIcons();
            }, 500);
        }
    }
];

function jumpToSimStep(stepIdx) {
    appState.simulationStep = stepIdx;
    updateSimulatorUi();
}

function nextSimStep() {
    const currentStepConfig = scenarioSteps[appState.simulationStep];
    
    if (currentStepConfig && currentStepConfig.action) {
        currentStepConfig.action();
    }
    
    if (appState.simulationStep === scenarioSteps.length - 1) {
        appState.simulationStep = 0;
        updateSimulatorUi();
        return;
    }

    appState.simulationStep++;
    updateSimulatorUi();
}

function prevSimStep() {
    if (appState.simulationStep > 0) {
        appState.simulationStep--;
        updateSimulatorUi();
    }
}

function updateSimulatorUi() {
    const config = scenarioSteps[appState.simulationStep];
    if (!config) return;

    if (config.setup) {
        config.setup();
    }

    document.getElementById('sim-step-description').innerHTML = config.desc;
    document.getElementById('sim-next-btn').innerText = config.actionBtnText;
    document.getElementById('sim-prev-btn').disabled = appState.simulationStep === 0;

    document.querySelectorAll('.sim-step-dot').forEach((dot, idx) => {
        dot.className = 'sim-step-dot';
        if (idx === appState.simulationStep) {
            dot.classList.add('active');
        } else if (idx < appState.simulationStep) {
            dot.classList.add('completed');
        }
    });
}

// 16. App Bootstrap
window.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    
    populateAssetsTable();
    generateAutomatedReport();
    renderAiOverlayCanvas();
    
    const chatInput = document.getElementById('chat-user-input');
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendChatMessage();
        });
    }

    // Initialize circular telemetry dial values on load
    updateScbaTelemetry(300);
    updateGasTelemetry(0);
    updateLiferaftTelemetry(3.0);

    // Pre-draw dispatch map route
    selectMapTechnician('sujal');

    setTimeout(() => {
        showToast("System Online", "MarineSafety OS AI models loaded. Telemetry active.", "pass");
    }, 1000);
});
