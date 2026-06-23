// FireSafe OS - Safety Compliance & Inspection Engine

// 1. Initial Database Setup
const sitesDatabase = {
    'site-port': {
        name: "Terminal 1 - Cargo Port Facility",
        assets: ["FE-102", "SC-908"]
    },
    'site-hq': {
        name: "Corporate Headquarters - Office Tower A",
        assets: ["FA-301", "FE-108"]
    },
    'site-depot': {
        name: "Main Engine & Logistics Depot",
        assets: ["GD-402", "FS-504"]
    }
};

const assetsDatabase = [
    {
        id: "FE-102",
        type: "Fire Extinguisher",
        name: "Portable CO2 Fire Extinguisher",
        siteId: "site-port",
        manufacturer: "Kidde Safety Co",
        model: "CO2-5kg-Premium",
        installDate: "2024-01-12",
        lastInspected: "2025-06-18",
        status: "Pending",
        location: "Bridge Cabin East",
        expiry: "2029-01-12",
        history: [
            { date: "2024-01-12", title: "Asset Initial Installation", desc: "Installed at Bridge Cabin East.", type: "pass", marker: "check" },
            { date: "2025-01-15", title: "Annual Service Checklist", desc: "Hydrostatic test completed successfully.", type: "pass", marker: "check" },
            { date: "2025-06-18", title: "Scheduled Inspection", desc: "Inspection flagged pending for current cycle.", type: "warn", marker: "alert" }
        ]
    },
    {
        id: "SC-908",
        type: "SCBA",
        name: "Self-Contained Breathing Apparatus",
        siteId: "site-port",
        manufacturer: "Draeger Safety",
        model: "PSS-4000-Dual",
        installDate: "2024-11-20",
        lastInspected: "2025-12-02",
        status: "Pending",
        location: "Control Center Emergency Cabinet",
        expiry: "2029-11-20",
        history: [
            { date: "2024-11-20", title: "Asset Initial Installation", desc: "Air cylinder filled to 300 Bar and cabinet secured.", type: "pass", marker: "check" },
            { date: "2025-12-02", title: "Annual Cylinder Certification", desc: "Valve seal renewed.", type: "pass", marker: "check" }
        ]
    },
    {
        id: "FA-301",
        type: "Fire Alarm System",
        name: "Main Fire Alarm Control Panel",
        siteId: "site-hq",
        manufacturer: "Honeywell Fire",
        model: "NFS2-640-Intelligent",
        installDate: "2023-05-10",
        lastInspected: "2026-04-10",
        status: "Passed",
        location: "Ground Floor Security Room",
        expiry: "2033-05-10",
        history: [
            { date: "2023-05-10", title: "Panel Commissioning", desc: "Main panel online, 4 loop lines active.", type: "pass", marker: "check" },
            { date: "2026-04-10", title: "Bi-Annual Smoke Sensor Test", desc: "Tested all loop sensors, signal transmission normal.", type: "pass", marker: "check" }
        ]
    },
    {
        id: "FE-108",
        type: "Fire Extinguisher",
        name: "Dry Chemical Fire Extinguisher",
        siteId: "site-hq",
        manufacturer: "Amerex Safety",
        model: "DryChem-10lb",
        installDate: "2023-06-14",
        lastInspected: "2026-05-10",
        status: "Passed",
        location: "Floor 4 Elevator Lobby",
        expiry: "2029-06-14",
        history: [
            { date: "2023-06-14", title: "Asset Installation", desc: "Wall mounting bracket secured.", type: "pass", marker: "check" },
            { date: "2026-05-10", title: "Visual Inspections Log", desc: "Gauge pressure verified normal.", type: "pass", marker: "check" }
        ]
    },
    {
        id: "GD-402",
        type: "Gas Detection System",
        name: "Hydrogen Sulfide Detector Loop",
        siteId: "site-depot",
        manufacturer: "Crowcon Gas detection",
        model: "TXgard-IS-H2S",
        installDate: "2024-03-24",
        lastInspected: "2025-11-20",
        status: "Passed",
        location: "Battery Storage Room A",
        expiry: "2028-03-24",
        history: [
            { date: "2024-03-24", title: "Sensor Commissioning", desc: "Calibrated to H2S alarm threshold 10 PPM.", type: "pass", marker: "check" },
            { date: "2025-11-20", title: "Sensor Calibration Check", desc: "Passed span-gas drift verification.", type: "pass", marker: "check" }
        ]
    },
    {
        id: "FS-504",
        type: "Fire Suppression System",
        name: "FM200 Gas Suppression Bottle",
        siteId: "site-depot",
        manufacturer: "Fike Corporation",
        model: "FM200-80L",
        installDate: "2022-09-15",
        lastInspected: "2025-09-10",
        status: "Passed",
        location: "Server Server Rack Zone",
        expiry: "2032-09-15",
        history: [
            { date: "2022-09-15", title: "System Pressurization", desc: " Suppression cylinders loaded and armed.", type: "pass", marker: "check" },
            { date: "2025-09-10", title: "Weight & Pressure Test", desc: "Gas weight normal, actuator cylinder checks OK.", type: "pass", marker: "check" }
        ]
    }
];

const amcDatabase = [
    { id: "AMC-2026-PORT", client: "Port Logistics Ltd", site: "Terminal 1 - Cargo Port Facility", value: "$2,500/mo", service: "2026-07-12", renewal: "2027-01-01", tech: "Sujal Technician", status: "Active" },
    { id: "AMC-2026-HQ", client: "General Corporate Corp", site: "Corporate Headquarters - Office Tower A", value: "$5,200/mo", service: "2026-08-04", renewal: "2027-02-15", tech: "David Surveyor", status: "Active" },
    { id: "AMC-2026-DEPOT", client: "Engine Transport Hub", site: "Main Engine & Logistics Depot", value: "$3,800/mo", service: "2026-06-28", renewal: "2026-12-20", tech: "Emma Inspector", status: "Active" }
];

// Current State Machine
let appState = {
    currentTab: 'dashboard',
    selectedSiteId: 'site-port',
    selectedEquipmentId: 'FE-102',
    scannedQrAssetId: null,
    selectedPhotos: [], // 'gauge', 'corrosion', 'seal'
    inspectionFindings: [],
    complianceVerdict: 'PENDING',
    activeNotifications: [],
    simulationStep: 0,
    themeMode: 'dark',
    selectedTechnician: 'sujal',
    cctvSafetyBreach: false,
    toastCount: 0
};

// 2. Tab Router
function switchTab(tabId) {
    appState.currentTab = tabId;
    
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    const navItem = document.getElementById(`nav-${tabId}`);
    if (navItem) navItem.classList.add('active');

    document.querySelectorAll('.viewport-tab').forEach(tab => {
        tab.classList.remove('active-tab');
    });
    const activeTabPanel = document.getElementById(`tab-${tabId}`);
    if (activeTabPanel) activeTabPanel.classList.add('active-tab');

    const headerTitles = {
        'dashboard': 'Executive Control Dashboard',
        'inspection': 'Smart Inspection Workflow',
        'reports': 'Automated Reports & Certificates',
        'assets': 'Safety Asset Registry',
        'amc': 'AMC & Service Management Ledger',
        'chat': 'Compliance AI Knowledge Hub',
        'customer': 'Customer Portal',
        'telemetry': 'IoT Live Telemetry',
        'dispatch': 'Technician Dispatch Map',
        'cctv': 'CCTV Safety Video Analytics',
        'analytics': 'Predictive Health Forecasting'
    };
    document.getElementById('current-view-title').innerText = headerTitles[tabId] || 'Overview';

    if (tabId === 'cctv') {
        initCctvLoop();
    } else {
        if (typeof cctvAudioInterval !== 'undefined' && cctvAudioInterval) {
            clearInterval(cctvAudioInterval);
            cctvAudioInterval = null;
        }
    }
}

// 3. Theme mode
function toggleThemeMode() {
    const body = document.body;
    const themeBtn = document.getElementById('theme-toggle-btn');
    
    if (appState.themeMode === 'dark') {
        appState.themeMode = 'light';
        body.classList.add('light-mode');
        themeBtn.innerHTML = `<i data-lucide="moon"></i>`;
        showToast("Theme Switch", "High-contrast Light Theme applied.", "info");
    } else {
        appState.themeMode = 'dark';
        body.classList.remove('light-mode');
        themeBtn.innerHTML = `<i data-lucide="sun"></i>`;
        showToast("Theme Switch", "Console Dark Theme applied.", "info");
    }
    lucide.createIcons();
}

// 4. Toast Alerts
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

    if (feed.children.length >= 5) {
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
                <span>FireSafe OS</span>
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
    showToast("System Diagnostics", "Active sensor loops and CCTV safety threads are verified.", "pass");
}

// 5. Site Selection & Equipment Filter
function changeCustomerSite(siteId) {
    appState.selectedSiteId = siteId;
    appState.scannedQrAssetId = null; // Reset QR verification on site switch
    
    const site = sitesDatabase[siteId];
    showToast("Site Selected", `Loaded local inventory for: ${site.name}`, "info");

    populateSiteEquipmentList();
    
    // Automatically select the first asset of the new site
    if (site.assets.length > 0) {
        const firstAsset = assetsDatabase.find(a => a.id === site.assets[0]);
        if (firstAsset) {
            selectEquipment(firstAsset.type === 'Fire Extinguisher' ? 'fire-ext' : (firstAsset.type === 'SCBA' ? 'scba' : 'liferaft'));
        }
    }

    // Advance simulator step 1 if site is changed during Guided Walkthrough
    if (appState.simulationStep === 1) {
        setTimeout(() => {
            if (appState.simulationStep === 1) {
                nextSimStep();
            }
        }, 50);
    }
}

function selectEquipment(type) {
    let assetId = null;
    if (type === 'fire-ext') {
        const siteAssets = sitesDatabase[appState.selectedSiteId].assets;
        const asset = assetsDatabase.find(a => siteAssets.includes(a.id) && a.type === 'Fire Extinguisher');
        if (asset) assetId = asset.id;
    } else if (type === 'scba') {
        const siteAssets = sitesDatabase[appState.selectedSiteId].assets;
        const asset = assetsDatabase.find(a => siteAssets.includes(a.id) && a.type === 'SCBA');
        if (asset) assetId = asset.id;
    } else {
        const siteAssets = sitesDatabase[appState.selectedSiteId].assets;
        if (siteAssets && siteAssets.length > 0) assetId = siteAssets[0];
    }
    
    if (assetId) {
        appState.selectedEquipmentId = assetId;
        populateSiteEquipmentList();
        renderAiOverlayCanvas();
        
        const startBtn = document.getElementById('start-analysis-btn');
        if (startBtn) {
            if (assetId === 'FE-102') {
                startBtn.disabled = appState.selectedPhotos.length === 0;
            } else {
                startBtn.disabled = true;
            }
        }
    }
}

function togglePhotoSelection(photoId) {
    const idx = appState.selectedPhotos.indexOf(photoId);
    const card = document.getElementById(`photo-${photoId}`);
    
    if (idx > -1) {
        appState.selectedPhotos.splice(idx, 1);
        if (card) card.classList.remove('selected');
    } else {
        appState.selectedPhotos.push(photoId);
        if (card) card.classList.add('selected');
    }
    
    const startBtn = document.getElementById('start-analysis-btn');
    if (startBtn) {
        if (appState.selectedEquipmentId === 'FE-102' && appState.selectedPhotos.length > 0) {
            startBtn.disabled = false;
        } else {
            startBtn.disabled = true;
        }
    }
    
    renderAiOverlayCanvas();
}

function populateSiteEquipmentList() {
    const listContainer = document.getElementById('site-equipment-list');
    if (!listContainer) return;

    listContainer.innerHTML = '';
    const siteAssets = sitesDatabase[appState.selectedSiteId].assets;

    assetsDatabase.forEach(asset => {
        if (siteAssets.includes(asset.id)) {
            let statusBadge = 'badge-pending';
            if (asset.status === 'Passed') statusBadge = 'badge-passed';
            if (asset.status === 'Failed') statusBadge = 'badge-failed';

            let iconName = 'flame';
            let clickParam = 'fire-ext';
            if (asset.type === 'SCBA') { iconName = 'wind'; clickParam = 'scba'; }
            else if (asset.type === 'Fire Alarm System') { iconName = 'bell'; clickParam = 'liferaft'; }
            else if (asset.type === 'Gas Detection System') { iconName = 'activity'; clickParam = 'liferaft'; }
            else if (asset.type === 'Fire Suppression System') { iconName = 'container'; clickParam = 'liferaft'; }

            const card = document.createElement('div');
            card.className = `equipment-card ${appState.selectedEquipmentId === asset.id ? 'selected' : ''}`;
            card.id = `equip-card-${asset.id}`;
            card.innerHTML = `
                <div class="equipment-info">
                    <div class="equipment-icon-box">
                        <i data-lucide="${iconName}"></i>
                    </div>
                    <div class="equipment-name-desc">
                        <span class="equipment-name">${asset.name}</span>
                        <span class="equipment-id">Asset ID: ${asset.id} &bull; ${asset.location}</span>
                    </div>
                </div>
                <span class="equipment-status-badge ${statusBadge}" id="equip-badge-${asset.id}">${asset.status}</span>
            `;
            card.onclick = () => {
                appState.selectedEquipmentId = asset.id;
                document.querySelectorAll('.equipment-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                renderAiOverlayCanvas();
                
                // Toggle Run analysis button disable if switching
                if (asset.id === 'FE-102') {
                    document.getElementById('start-analysis-btn').disabled = appState.selectedPhotos.length === 0;
                } else {
                    document.getElementById('start-analysis-btn').disabled = true;
                }
            };
            listContainer.appendChild(card);
        }
    });
    lucide.createIcons();
}

// 6. Ledgers rendering
function populateLedgers() {
    // Assets Registry
    const assetTable = document.getElementById('assets-table-body');
    if (assetTable) {
        assetTable.innerHTML = '';
        assetsDatabase.forEach(asset => {
            let statusBadge = 'badge-pending';
            if (asset.status === 'Passed') statusBadge = 'badge-passed';
            if (asset.status === 'Failed') statusBadge = 'badge-failed';

            const siteName = sitesDatabase[asset.siteId].name;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong style="color: var(--primary);">${asset.id}</strong></td>
                <td>${asset.type}</td>
                <td>${siteName}</td>
                <td>${asset.manufacturer}</td>
                <td>${asset.model}</td>
                <td>${asset.lastInspected}</td>
                <td><span class="equipment-status-badge ${statusBadge}">${asset.status}</span></td>
            `;
            row.onclick = () => openAssetFlyout(asset.id);
            assetTable.appendChild(row);
        });
    }

    // AMC Contracts Ledger
    const amcTable = document.getElementById('amc-table-body');
    if (amcTable) {
        amcTable.innerHTML = '';
        amcDatabase.forEach(c => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong style="color: var(--primary);">${c.id}</strong></td>
                <td>${c.client}</td>
                <td>${c.site}</td>
                <td>${c.value}</td>
                <td>${c.service}</td>
                <td>${c.renewal}</td>
                <td>${c.tech}</td>
                <td><span class="equipment-status-badge badge-passed">${c.status}</span></td>
            `;
            amcTable.appendChild(row);
        });
    }

    // Customer Portal
    const customerTable = document.getElementById('customer-table-body');
    if (customerTable) {
        customerTable.innerHTML = '';
        assetsDatabase.forEach(asset => {
            if (asset.siteId === 'site-port') {
                let statusBadge = 'badge-passed';
                let certText = `<a href="#" onclick="downloadCertificate('${asset.id}'); event.stopPropagation();" style="color: var(--primary); text-decoration: underline;">FS-CERT-${asset.id}</a>`;
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
                customerTable.appendChild(row);
            }
        });
    }
}

// 7. Timeline & Flyout Details
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

// 8. QR scanner simulator
function triggerQrScan() {
    if (appState.selectedSiteId !== 'site-port') {
        showToast("Scan Error", "FE-102 belongs to the Terminal 1 Site inventory. Select Terminal 1 Cargo Port first.", "warn");
        return;
    }

    const scanner = document.getElementById('scanner-box');
    const laser = document.getElementById('scanner-laser');
    const instructions = document.getElementById('scanner-instructions');
    
    if (appState.scannedQrAssetId) {
        showToast("Scanner", "Extinguisher FE-102 serial code already synchronized.", "pass");
        return;
    }

    scanner.classList.add('scanning');
    laser.style.display = 'block';
    instructions.innerText = "Scanning asset barcode QR...";
    
    setTimeout(() => {
        laser.style.display = 'none';
        scanner.classList.remove('scanning');
        appState.scannedQrAssetId = 'FE-102';
        instructions.innerHTML = `<span style="color: var(--color-pass); font-weight:700;"><i data-lucide="check" style="display:inline-block; vertical-align:middle; width:14px;"></i> FE-102 SYNCED ON SITE</span>`;
        showToast("QR Verified", "Identified Kidde CO2 Fire Extinguisher (FE-102).", "pass");
        
        selectEquipment('fire-ext');
        
        if (appState.simulationStep === 2) {
            nextSimStep();
        }
        lucide.createIcons();
    }, 1500);
}

// 9. AI Visual Bounding box rendering
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
            <path d="M120 70 L180 70 L180 150 A30 30 0 0 1 120 150 Z" fill="#b91c1c" stroke="#f8fafc" stroke-width="2" />
            <path d="M140 70 L140 45 L130 45 A10 10 0 0 1 140 35 L170 35" stroke="#f8fafc" stroke-width="2"/>
            <path d="M150 45 L150 30" stroke="#f8fafc" stroke-width="3" />
            <path d="M150 45 Q190 50 190 120" stroke="#000" stroke-width="3.5" />
            
            ${appState.selectedPhotos.includes('gauge') ? `<circle cx="80" cy="55" r="15" fill="none" stroke="var(--primary)" stroke-width="1.5" stroke-dasharray="3,3" />` : ''}
            ${appState.selectedPhotos.includes('seal') ? `<circle cx="210" cy="40" r="15" fill="none" stroke="var(--primary)" stroke-width="1.5" stroke-dasharray="3,3" />` : ''}
            ${appState.selectedPhotos.includes('corrosion') ? `<circle cx="150" cy="80" r="15" fill="none" stroke="var(--primary)" stroke-width="1.5" stroke-dasharray="3,3" />` : ''}
            <circle cx="150" cy="50" r="3" fill="#f8fafc"/>
        </svg>

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
            desc: "Gauge needle points below safe bounds (95 PSI detected). High risk of non-discharge.",
            severity: "danger",
            verdict: "fail"
        });
        hasFailures = true;
    }
    if (appState.selectedPhotos.includes('corrosion')) {
        appState.inspectionFindings.push({
            title: "Corrosion Near Nozzle Neck",
            desc: "Oxidation on outer metallic casing thread. Cylinder body structurally safe, but requires clean-up.",
            severity: "warning",
            verdict: "warn"
        });
    }
    if (appState.selectedPhotos.includes('seal')) {
        appState.inspectionFindings.push({
            title: "Missing Safety Seal Pin",
            desc: "Safety wire lock and plastic tamper seal is missing. Equipment is vulnerable to discharge.",
            severity: "danger",
            verdict: "fail"
        });
        hasFailures = true;
    }

    if (appState.inspectionFindings.length === 0) {
        appState.inspectionFindings.push({
            title: "Inspection Passed",
            desc: "All physical inspection parameters compliant. No leakages detected.",
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
    
    // Update local database & sidebar badge
    const feIndex = assetsDatabase.findIndex(a => a.id === 'FE-102');
    
    if (appState.complianceVerdict === 'FAIL') {
        verdictText.style.color = 'var(--color-fail)';
        document.getElementById('equip-badge-FE-102').innerText = 'Failed';
        document.getElementById('equip-badge-FE-102').className = 'equipment-status-badge badge-failed';
        
        assetsDatabase[feIndex].status = 'Failed';
        assetsDatabase[feIndex].lastInspected = '2026-06-18';
        assetsDatabase[feIndex].history.unshift({
            date: "2026-06-18",
            title: "AI Inspection Failed",
            desc: "Regulatory fail: safety seal missing & low pressure (95 PSI) flagged by AI model.",
            type: "fail",
            marker: "close"
        });
        
        // Increment dashboard failed counts
        document.getElementById('metric-failed-count').innerText = 5;
    } else {
        verdictText.style.color = 'var(--color-pass)';
        document.getElementById('equip-badge-FE-102').innerText = 'Passed';
        document.getElementById('equip-badge-FE-102').className = 'equipment-status-badge badge-passed';
        
        assetsDatabase[feIndex].status = 'Passed';
        assetsDatabase[feIndex].lastInspected = '2026-06-18';
        assetsDatabase[feIndex].history.unshift({
            date: "2026-06-18",
            title: "AI Inspection Passed",
            desc: "Asset verified fully compliant with NFPA 10 parameters.",
            type: "pass",
            marker: "check"
        });
        document.getElementById('metric-failed-count').innerText = 4;
    }

    renderAiOverlayCanvas(); // Refresh bounding boxes
    populateLedgers();
    generateAutomatedReport();

    showToast(
        `Audit Evaluated: FE-102`, 
        `Compliance evaluation complete. Result: ${appState.complianceVerdict}. Dispatch ledger updated.`, 
        appState.complianceVerdict === 'FAIL' ? 'fail' : 'pass'
    );

    if (appState.simulationStep === 4) {
        nextSimStep();
    }
}

// 10. Report Generator
function generateAutomatedReport() {
    const asset = assetsDatabase.find(a => a.id === 'FE-102');
    if (!asset) return;

    document.getElementById('report-asset-name').innerText = asset.name;
    document.getElementById('report-asset-id').innerText = asset.id;
    document.getElementById('report-inspection-date').innerText = "June 18, 2026";
    
    const badge = document.getElementById('report-verdict-badge');
    const decisionTitle = document.getElementById('report-decision-title');
    const decisionDesc = document.getElementById('report-decision-desc');
    const recommendBox = document.getElementById('report-recommendation-box');
    
    if (asset.status === 'Failed') {
        badge.innerText = 'FAIL';
        badge.className = 'badge-report-fail';
        decisionTitle.innerText = "COMPLIANCE DECISION: REGULATORY FAILURE";
        decisionTitle.style.color = '#b91c1c';
        decisionDesc.innerText = "Equipment does not satisfy NFPA 10 regulations. Proactive Service recommendation issued for immediate correction.";
        
        // Show service recommendations
        recommendBox.style.display = 'flex';
    } else {
        badge.innerText = 'PASS';
        badge.className = 'badge-report-pass';
        decisionTitle.innerText = "COMPLIANCE DECISION: PASSED & CERTIFIED";
        decisionTitle.style.color = '#047857';
        decisionDesc.innerText = "Equipment complies with all local and international fire safety regulations.";
        
        recommendBox.style.display = 'none';
    }

    const tbody = document.getElementById('report-table-body');
    tbody.innerHTML = '';
    
    const checkPressure = appState.selectedPhotos.includes('gauge');
    const checkCorrosion = appState.selectedPhotos.includes('corrosion');
    const checkSeal = appState.selectedPhotos.includes('seal');

    tbody.innerHTML += `
        <tr>
            <td><strong>Cylinder Pressure Verification</strong></td>
            <td>${checkPressure ? 'Pressure gauge needle points to 95 PSI. Below safe operating standards (110 - 150 PSI).' : 'Pressure verified at 120 PSI. Within compliance standards.'}</td>
            <td><span class="${checkPressure ? 'badge-report-fail' : 'badge-report-pass'}">${checkPressure ? 'FAIL' : 'PASS'}</span></td>
        </tr>
        <tr>
            <td><strong>Nozzle Casing & Corrosion Check</strong></td>
            <td>${checkCorrosion ? 'Cosmetic surface rust on outer thread. Cylinder structurally intact.' : 'No surface oxidation or valve thread breakdown detected.'}</td>
            <td><span class="${checkCorrosion ? 'badge-report-fail' : 'badge-report-pass'}">${checkCorrosion ? 'WARN' : 'PASS'}</span></td>
        </tr>
        <tr>
            <td><strong>Tamper Seal & Securing Ring Pin</strong></td>
            <td>${checkSeal ? 'Safety ring pin wire tamper seal is missing or broken. Unsecured valve hazard.' : 'Safety safety ring pin secured and tamper seal fully intact.'}</td>
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

// 11. Compliance AI chatbot
let cachedApiKey = null;
async function getApiKey() {
    if (cachedApiKey) return cachedApiKey;

    try {
        const res = await fetch('.env');
        if (res.ok) {
            const text = await res.text();
            const match = text.match(/VITE_GROQ_API_KEY\s*=\s*([^\r\n]+)/) || text.match(/GROQ_API_KEY\s*=\s*([^\r\n]+)/);
            if (match && match[1]) {
                cachedApiKey = match[1].trim();
                return cachedApiKey;
            }
        }
    } catch (e) {
        console.warn("Could not read .env file dynamically");
    }

    const storedKey = localStorage.getItem('groq_api_key');
    if (storedKey) {
        cachedApiKey = storedKey;
        return cachedApiKey;
    }

    return "";
}

async function getGroqChatResponse(query, onChunk) {
    try {
        const apiKey = await getApiKey();
        if (!apiKey) {
            throw new Error("No API key available");
        }
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    {
                        role: "system",
                        content: `You are the FireSafe Compliance Assistant. You are helpfully auditing and checking fire safety assets.
Keep your answers professional and concise.
You have context on:
- Customer Sites: Terminal 1 - Cargo Port Facility (assets: FE-102, SC-908), Corporate Headquarters (assets: FA-301, FE-108), Main Logistics Depot (assets: GD-402, FS-504).
- Asset FE-102: Portable CO2 Fire Extinguisher, Bridge Cabin East. Expiry: 2029-01-12. Status is Failed because cylinder pressure read 95 PSI (below 110 PSI limit) and safety seal pin was missing.
- Asset SC-908: SCBA Breathing Apparatus, Control Center. Status is Pending.
- active AMCs due in June 2026: FE-102 routine monthly check, SC-908 monthly cylinder level check (overdue), GD-402 H2S Detector span calibration.
If asked about other assets or questions outside fire safety, be helpful but bring it back to safety compliance.`
                    },
                    {
                        role: "user",
                        content: query
                    }
                ],
                temperature: 0.7,
                max_tokens: 1024,
                stream: true
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let done = false;
        let buffer = "";

        while (!done) {
            const { value, done: readerDone } = await reader.read();
            done = readerDone;
            buffer += decoder.decode(value, { stream: !done });

            const lines = buffer.split("\n");
            buffer = lines.pop(); // keep last incomplete line in buffer

            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed) continue;
                if (trimmed === "data: [DONE]") continue;
                if (trimmed.startsWith("data: ")) {
                    try {
                        const json = JSON.parse(trimmed.slice(6));
                        const content = json.choices[0]?.delta?.content || "";
                        if (content) {
                            onChunk(content);
                        }
                    } catch (e) {
                        // Ignore parsing errors of partial JSON
                    }
                }
            }
        }
    } catch (error) {
        console.error("Groq API Call failed:", error);
        onChunk("\n\n*(Error connecting to Llama 3.3 model. Falling back to offline responder)*\n\n" + formulateChatbotResponse(query));
    }
}

function askPresetQuestion(questionText) {
    const input = document.getElementById('chat-user-input');
    input.value = questionText;
    sendChatMessage();
}

async function sendChatMessage() {
    const input = document.getElementById('chat-user-input');
    const query = input.value.trim();
    if (!query) return;

    appendChatMessage(query, 'user');
    input.value = '';

    const history = document.getElementById('chat-history-log');
    if (!history) return;

    const msg = document.createElement('div');
    msg.className = 'chat-msg assistant';
    msg.innerHTML = `
        <div class="chat-avatar">AI</div>
        <div class="chat-bubble">
            <span class="chat-typing-dots"><span></span><span></span><span></span></span>
        </div>
    `;
    history.appendChild(msg);
    history.scrollTop = history.scrollHeight;

    const bubble = msg.querySelector('.chat-bubble');
    let fullText = "";

    await getGroqChatResponse(query, (chunk) => {
        const typing = bubble.querySelector('.chat-typing-dots');
        if (typing) typing.remove();

        fullText += chunk;
        
        let formattedText = fullText
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/- (.*?)\n/g, '<li>$1</li>')
            .replace(/\n\n/g, '<br><br>');
            
        if (formattedText.includes('<li>')) {
            formattedText = formattedText.replace(/(<li>.*?<\/li>)/s, '<ul>$1</ul>');
        }
        
        bubble.innerHTML = formattedText;
        history.scrollTop = history.scrollHeight;
    });

    if (appState.simulationStep === 4 && (query.toLowerCase().includes('fail') || query.toLowerCase().includes('fe-102') || query.toLowerCase().includes('why did'))) {
        setTimeout(() => {
            nextSimStep();
        }, 1500);
    }
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
}

function formulateChatbotResponse(query) {
    const q = query.toLowerCase();

    if (q.includes('due this month') || q.includes('due') || q.includes('month')) {
        return `Here are the active AMC inspection schedules due in **June 2026**:
- **Asset FE-102 (CO2 Extinguisher)**: Routine monthly check (Terminal 1 Cargo Port Site). *Update: Evaluated as failed.*
- **Asset SC-908 (SCBA Breathing Pack)**: Monthly cylinder level check (Terminal 1 Cargo Port Site). *Overdue.*
- **Asset GD-402 (H2S Detector)**: Span gas span calibration check (Main Logistics Depot).`;
    }

    if (q.includes('why did') || q.includes('fail') || q.includes('fe-102')) {
        return `Asset **FE-102 failed compliance** on June 18, 2026 because the AI Computer Vision engine verified:
1. **Low Operating Pressure**: Dial needle read **95 PSI** (under the safe regulatory minimum of **110 PSI**).
2. **Missing Tamper Seal**: Safety wire pin seal is broken or missing.
3. **Rust Concern**: Minor neck thread corrosion observed.

*Maintenance Dispatch Order*: Technician is scheduled to recharge the CO2 cylinder, clean neck threads, and re-fit a certified wire seal.`;
    }

    if (q.includes('history') || q.includes('previous')) {
        return `Service History Log for **FE-102**:
- **2024-01-12**: Initial commissioning and installation (Passed).
- **2025-01-15**: Hydrostatic pressure test (Passed).
- **2026-06-18**: Routine Service Check (Failed - low pressure & missing safety lock).`;
    }

    if (q.includes('expired') || q.includes('certificate')) {
        return `The following assets have **Expired or Suspended Certificates**:
- **FE-102**: Compliance Certificate suspended due to inspection failure today.
- **SC-908 (SCBA)**: Monthly pressure gauge verification is overdue since June 12, 2026.`;
    }

    return `I am sorry, I couldn't locate that specific operational record. You can ask:
*   *"What inspections are due this month?"*
*   *"Why did asset FE-102 fail?"*
*   *"Show previous service history for FE-102."*
*   *"Which assets have expired certificates?"*`;
}

// 12. IoT Live Telemetry Slider Hooks
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
            showToast("SCBA Alarm", `Air tank pressure below operating levels: ${val} Bar!`, "fail");
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
            showToast("H2S Leak Alert", `Toxic Hydrogen Sulfide leak: ${val} PPM! Evacuate Battery Room.`, "fail");
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
        status.innerText = "Pressure Nominal";
        status.style.color = "var(--color-pass)";
        card.classList.remove('danger-alert');
        indicator.style.stroke = "var(--primary)";
    }
}

// 13. Dispatch Map Surveyor Nodes
function selectMapTechnician(techId) {
    appState.selectedTechnician = techId;
    
    document.querySelectorAll('.dispatch-tech-card').forEach(card => card.classList.remove('active'));
    document.getElementById(`tech-card-${techId}`).classList.add('active');

    const route = document.getElementById('dispatch-route-path');
    
    if (techId === 'sujal') {
        route.setAttribute('d', 'M 100 80 Q 150 120 200 80');
        route.style.display = 'block';
        route.style.stroke = 'var(--primary)';
        showToast("Crew Dispatch", "Sujal Surveyor route: Control Room to Cargo Dock active.", "info");
    } else if (techId === 'david') {
        route.setAttribute('d', 'M 200 80 Q 210 120 210 145');
        route.style.display = 'block';
        route.style.stroke = 'var(--secondary)';
        showToast("Crew Dispatch", "David Surveyor route: Cargo Dock to Generator Room active.", "info");
    } else if (techId === 'emma') {
        route.setAttribute('d', 'M 320 80 Q 260 60 200 80');
        route.style.display = 'block';
        route.style.stroke = 'var(--color-warn)';
        showToast("Crew Dispatch", "Emma Inspector route: Maintenance Yard to Cargo Dock active.", "info");
    }
}

function clickDeckZone(zoneName) {
    showToast("Zone Sensor Sync", `Zone: ${zoneName} - All local suppression sensors connected.`, "pass");
}

// 14. CCTV PPE Monitoring Canvas Loop
let cctvCanvas = null;
let cctvCtx = null;
let cctvAnimationId = null;
let worker1X = 120;
let worker1Dir = 1;
let worker2X = 350;
let worker2Dir = -1;
let cctvAudioInterval = null;
let audioCtx = null;

function playAlarmBeep() {
    try {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
    } catch (e) {
        console.error("Audio failed:", e);
    }
}

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
        
        // Strobe lighting flashing effect on canvas
        const strobe = 0.05 + 0.12 * ((Math.sin(Date.now() / 150) + 1) / 2);
        cctvCtx.fillStyle = `rgba(239, 68, 68, ${strobe})`;
        cctvCtx.fillRect(0, 0, 640, 360);

        // Active Threat Alarm Banner inside canvas
        if (Math.floor(Date.now() / 300) % 2 === 0) {
            cctvCtx.fillStyle = '#ef4444';
            cctvCtx.fillRect(0, 0, 640, 24);
            cctvCtx.fillStyle = '#ffffff';
            cctvCtx.font = 'bold 10px Arial';
            cctvCtx.textAlign = 'center';
            cctvCtx.fillText("🚨 WARNING: HAZARD BOUNDARY BREACH - NO HARNESS 🚨", 320, 16);
            cctvCtx.textAlign = 'left';
        }
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

        // Scanning laser sweep lines
        const sweepY = boxTop + 2 + ((Math.sin(Date.now() / 150) + 1) / 2) * (boxHeight - 4);
        cctvCtx.strokeStyle = 'rgba(34, 197, 94, 0.4)';
        cctvCtx.lineWidth = 1.5;
        cctvCtx.beginPath();
        cctvCtx.moveTo(boxLeft + 1, sweepY);
        cctvCtx.lineTo(boxLeft + boxWidth - 1, sweepY);
        cctvCtx.stroke();
    } else {
        const flashColor = (Math.floor(Date.now() / 250) % 2 === 0) ? '#ef4444' : 'rgba(239, 68, 68, 0.2)';
        cctvCtx.strokeStyle = flashColor;
        cctvCtx.lineWidth = 2;
        cctvCtx.strokeRect(boxLeft, boxTop, boxWidth, boxHeight);
        
        cctvCtx.fillStyle = '#ef4444';
        cctvCtx.font = 'bold 8px Arial';
        cctvCtx.fillText("HAZARD: NO HARNESS", boxLeft, boxTop - 4);

        // Faster scanning laser warning sweep lines
        const sweepY = boxTop + 2 + ((Math.sin(Date.now() / 80) + 1) / 2) * (boxHeight - 4);
        cctvCtx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
        cctvCtx.lineWidth = 1.5;
        cctvCtx.beginPath();
        cctvCtx.moveTo(boxLeft + 1, sweepY);
        cctvCtx.lineTo(boxLeft + boxWidth - 1, sweepY);
        cctvCtx.stroke();
    }

    cctvCtx.fillStyle = '#94a3b8';
    cctvCtx.font = '8px monospace';
    cctvCtx.fillText(name, x - 25, y + 42);
}

function simulateCctvBreach() {
    if (appState.cctvSafetyBreach) {
        appState.cctvSafetyBreach = false;
        showToast("Safety Restored", "Crew member exited hazard rack. Bounding box cleared.", "pass");
        
        if (cctvAudioInterval) {
            clearInterval(cctvAudioInterval);
            cctvAudioInterval = null;
        }

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
        showToast("SAFETY BREACH WARNING", "Worker entered Aft boundary without securing safety harness!", "fail");
        
        playAlarmBeep();
        if (!cctvAudioInterval) {
            cctvAudioInterval = setInterval(playAlarmBeep, 1500);
        }

        const log = document.getElementById('cctv-warnings-log');
        const warningItem = document.createElement('div');
        warningItem.className = 'feed-item';
        warningItem.style.padding = '8px 0';
        warningItem.innerHTML = `
            <div class="feed-icon fail" style="width:28px; height:28px;"><i data-lucide="shield-alert" style="width:14px;"></i></div>
            <div class="feed-details">
                <span style="font-size:0.75rem; color: var(--color-fail);"><strong>Unsecured Area</strong>: Aft Deck worker without safety harness.</span>
            </div>
        `;
        log.insertBefore(warningItem, log.firstChild);
        lucide.createIcons();
    }
}

// 15. Predictive Analytics & Proactive schedules
function showChartValue(percentageVal) {
    showToast("Model Analysis", `SCBA valve pressure wall rating: ${percentageVal}%`, "info");
}

function triggerProactiveService() {
    showToast("Service Ticket", "Proactive repair ticket generated. Scheduled for next technician visit.", "pass");
    document.getElementById('forecast-date').innerText = "Ticket Scheduled";
    document.getElementById('forecast-date').style.color = "var(--color-pass)";
}

// 16. Redesigned Guided Simulator Scenario Engine
const scenarioSteps = [
    {
        step: 0,
        desc: "<strong>Step 1: Init Walkthrough</strong><br>We will walk through an AI-assisted fire extinguisher inspection. The extinguisher FE-102 contains defects that need to be audited and reported. Click <strong>Start Walkthrough</strong> to select the customer site.",
        actionBtnText: "Start Walkthrough",
        setup: () => {
            switchTab('dashboard');
            appState.selectedSiteId = 'site-port';
            document.getElementById('customer-site-select').value = 'site-port';
            
            appState.scannedQrAssetId = null;
            appState.selectedPhotos = [];
            appState.complianceVerdict = 'PENDING';
            
            const feIndex = assetsDatabase.findIndex(a => a.id === 'FE-102');
            assetsDatabase[feIndex].status = 'Pending';
            assetsDatabase[feIndex].lastInspected = '2025-06-18';
            assetsDatabase[feIndex].history = assetsDatabase[feIndex].history.filter(h => !h.title.includes("2026"));
            
            populateLedgers();
            populateSiteEquipmentList();
            
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
        desc: "<strong>Step 2: Select Customer Site</strong><br>The surveyor arrives at the facility and selects the customer site from the selector box. Click the <strong>Site Selector</strong> or click the action button to confirm <strong>Terminal 1 - Cargo Port Facility</strong>.",
        actionBtnText: "Confirm Site Selection",
        setup: () => {
            switchTab('inspection');
            const panel = document.getElementById('site-selector-panel');
            panel.style.boxShadow = "0 0 25px var(--primary-glow)";
            setTimeout(() => { panel.style.boxShadow = "none"; }, 1500);
        },
        action: () => {
            changeCustomerSite('site-port');
        }
    },
    {
        step: 2,
        desc: "<strong>Step 3: Scan Equipment QR Code</strong><br>The surveyor locates the extinguisher <strong>FE-102</strong> and scans the QR code. Click the <strong>QR Code Box</strong> on the left page or click the action button to simulate scanning.",
        actionBtnText: "Simulate QR Scan",
        setup: () => {
            const container = document.getElementById('scanner-box');
            container.style.boxShadow = "0 0 25px var(--primary-glow)";
            setTimeout(() => { container.style.boxShadow = "none"; }, 1500);
        },
        action: () => {
            triggerQrScan();
        }
    },
    {
        step: 3,
        desc: "<strong>Step 4: Select Inspection Photos</strong><br>The surveyor takes photos of the pressure dial, handle corrosion, and the missing pin loop. Click the <strong>three photo cards</strong> in the center column to prepare the AI diagnosis.",
        actionBtnText: "Stage Photos",
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
        step: 4,
        desc: "<strong>Step 5: Run AI Diagnostics & Compliance Check</strong><br>Run the computer-vision model. The AI will draw bounding boxes over the low pressure gauge, rust threads, and missing pin. Click the <strong>Run AI Analysis</strong> button.",
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
        step: 5,
        desc: "<strong>Step 6: Generate Certificate & Update Portal</strong><br>The compliance engine fails the asset, issues proactive repair recommendations, and compiles the report. Click the action button to check the customer's portal warnings.",
        actionBtnText: "Inspect Customer Portal",
        setup: () => {
            switchTab('reports');
            showToast("Customer Portal", "Compliance warnings and repair recommendations dispatched to client portal.", "pass");
        },
        action: () => {
            switchTab('customer');
            
            setTimeout(() => {
                document.getElementById('sim-step-description').innerHTML = `
                    <div style="color: var(--color-pass); font-weight:700;"><i data-lucide="check-square" style="display:inline-block; vertical-align:middle; width:18px;"></i> DEMO WALKTHROUGH COMPLETED!</div>
                    You have demonstrated the full FireSafe OS lifecycle: Site selection, QR scan, AI bounding boxes, compliance failure recommendations, and customer portal updates.
                `;
                document.getElementById('sim-next-btn').innerText = "Restart Walkthrough";
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

function viewComplianceReport() {
    switchTab('reports');
}

function filterAssetsTable() {
    const searchVal = document.getElementById('asset-search-input').value.toLowerCase();
    const typeVal = document.getElementById('asset-type-filter').value;
    const tableBody = document.getElementById('assets-table-body');
    if (!tableBody) return;
    
    const rows = tableBody.getElementsByTagName('tr');
    for (let row of rows) {
        if (row.cells.length < 5) continue;
        const id = row.cells[0].textContent.toLowerCase();
        const type = row.cells[1].textContent;
        const site = row.cells[2].textContent.toLowerCase();
        const mfg = row.cells[3].textContent.toLowerCase();
        const model = row.cells[4].textContent.toLowerCase();
        
        const matchesSearch = id.includes(searchVal) || site.includes(searchVal) || mfg.includes(searchVal) || model.includes(searchVal) || type.toLowerCase().includes(searchVal);
        const matchesType = typeVal === 'all' || type === typeVal;
        
        if (matchesSearch && matchesType) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    }
}

function downloadCertificate(assetId) {
    const asset = assetsDatabase.find(a => a.id === assetId);
    if (!asset) return;
    
    showToast('Customer Portal', `Downloading certificate for ${assetId}...`, 'info');
    
    const statusClass = asset.status === 'Passed' ? 'status-pass' : (asset.status === 'Failed' ? 'status-fail' : 'status-pending');
    
    let htmlContent = `<!DOCTYPE html>
<html>
<head>
    <title>FireSafe OS - Certificate ${assetId}</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f8fafc; color: #1e293b; padding: 40px; }
        .cert-container { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); max-width: 800px; margin: 0 auto; }
        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 20px; }
        .logo { font-size: 1.3rem; font-weight: bold; color: #0f172a; }
        .title { text-align: right; }
        .title h2 { margin: 0; font-size: 1.2rem; color: #0f172a; margin-bottom: 4px; }
        .title p { margin: 0; font-size: 0.75rem; color: #64748b; }
        .meta-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; background: #f8fafc; padding: 12px; border-radius: 6px; margin-bottom: 20px; border: 1px solid #e2e8f0; }
        .meta-item { display: flex; flex-direction: column; gap: 4px; }
        .meta-item label { font-size: 0.7rem; color: #64748b; font-weight: bold; text-transform: uppercase; }
        .meta-item span { font-size: 0.85rem; font-weight: 600; color: #334155; }
        .status-badge { display: inline-block; padding: 4px 10px; border-radius: 12px; font-size: 0.7rem; font-weight: bold; text-transform: uppercase; }
        .status-pass { background: #def7ec; color: #03543f; }
        .status-fail { background: #fde8e8; color: #9b1c1c; }
        .status-pending { background: #fef3c7; color: #92400e; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { padding: 8px 10px; text-align: left; border-bottom: 1px solid #edf2f7; font-size: 0.8rem; }
        th { background: #f7fafc; color: #4a5568; text-transform: uppercase; font-size: 0.7rem; }
    </style>
</head>
<body>
    <div class="cert-container">
        <div class="header">
            <div class="logo">🔥 FireSafe OS</div>
            <div class="title">
                <h2>COMPLIANCE CERTIFICATE</h2>
                <p>Document ID: FS-CERT-${asset.id} &bull; Standards: NFPA 10</p>
            </div>
        </div>
        <div class="meta-grid">
            <div class="meta-item"><label>Asset ID</label><span>${asset.id}</span></div>
            <div class="meta-item"><label>Equipment Type</label><span>${asset.type}</span></div>
            <div class="meta-item"><label>Specific Location</label><span>${asset.location}</span></div>
            <div class="meta-item"><label>Last Inspected</label><span>${asset.lastInspected}</span></div>
            <div class="meta-item"><label>Status Verdict</label><span><span class="status-badge ${statusClass}">${asset.status}</span></span></div>
            <div class="meta-item"><label>Expiry Date</label><span>${asset.expiry}</span></div>
        </div>
        <table>
            <thead>
                <tr>
                    <th>Checkpoint</th>
                    <th>Description</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Cylinder Pressure Verification</td>
                    <td>${asset.status === 'Failed' ? 'Pressure needle reads 95 PSI (Below regulatory 110 PSI limit).' : 'Pressure within nominal safety limits (120 - 150 PSI).'}</td>
                    <td>${asset.status === 'Failed' ? 'FAIL' : 'PASS'}</td>
                </tr>
                <tr>
                    <td>Nozzle Casing & Corrosion Check</td>
                    <td>${asset.status === 'Failed' ? 'Surface oxidation detected on valve casing thread.' : 'No surface oxidation or valve thread breakdown detected.'}</td>
                    <td>${asset.status === 'Failed' ? 'WARN' : 'PASS'}</td>
                </tr>
                <tr>
                    <td>Tamper Seal & Safety Pin</td>
                    <td>${asset.status === 'Failed' ? 'Safety pin wire lock and plastic tamper seal is missing.' : 'Safety safety ring pin secured and tamper seal fully intact.'}</td>
                    <td>${asset.status === 'Failed' ? 'FAIL' : 'PASS'}</td>
                </tr>
            </tbody>
        </table>
    </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FireSafe_Certificate_${assetId}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function downloadAllCertificates() {
    showToast('Customer Portal', 'Generating compliance archive...', 'info');
    
    let htmlContent = `<!DOCTYPE html>
<html>
<head>
    <title>FireSafe OS - Compliance Certificates Archive</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f8fafc; color: #1e293b; padding: 40px; }
        .cert-container { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); max-width: 800px; margin: 0 auto 30px auto; }
        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 20px; }
        .logo { font-size: 1.3rem; font-weight: bold; color: #0f172a; }
        .title { text-align: right; }
        .title h2 { margin: 0; font-size: 1.2rem; color: #0f172a; margin-bottom: 4px; }
        .title p { margin: 0; font-size: 0.75rem; color: #64748b; }
        .meta-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; background: #f8fafc; padding: 12px; border-radius: 6px; margin-bottom: 20px; border: 1px solid #e2e8f0; }
        .meta-item { display: flex; flex-direction: column; gap: 4px; }
        .meta-item label { font-size: 0.7rem; color: #64748b; font-weight: bold; text-transform: uppercase; }
        .meta-item span { font-size: 0.85rem; font-weight: 600; color: #334155; }
        .status-badge { display: inline-block; padding: 4px 10px; border-radius: 12px; font-size: 0.7rem; font-weight: bold; text-transform: uppercase; }
        .status-pass { background: #def7ec; color: #03543f; }
        .status-fail { background: #fde8e8; color: #9b1c1c; }
        .status-pending { background: #fef3c7; color: #92400e; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { padding: 8px 10px; text-align: left; border-bottom: 1px solid #edf2f7; font-size: 0.8rem; }
        th { background: #f7fafc; color: #4a5568; text-transform: uppercase; font-size: 0.7rem; }
    </style>
</head>
<body>
    <h1 style="text-align: center; font-size: 1.6rem; color: #0f172a; margin-bottom: 30px;">FireSafe OS Certified Inspection Archive</h1>
`;

    const siteAssets = sitesDatabase['site-port'].assets;
    assetsDatabase.forEach(asset => {
        if (siteAssets.includes(asset.id)) {
            const statusClass = asset.status === 'Passed' ? 'status-pass' : (asset.status === 'Failed' ? 'status-fail' : 'status-pending');
            htmlContent += `
            <div class="cert-container">
                <div class="header">
                    <div class="logo">🔥 FireSafe OS</div>
                    <div class="title">
                        <h2>COMPLIANCE CERTIFICATE</h2>
                        <p>Document ID: FS-CERT-${asset.id} &bull; Standards: NFPA 10</p>
                    </div>
                </div>
                <div class="meta-grid">
                    <div class="meta-item"><label>Asset ID</label><span>${asset.id}</span></div>
                    <div class="meta-item"><label>Equipment Type</label><span>${asset.type}</span></div>
                    <div class="meta-item"><label>Specific Location</label><span>${asset.location}</span></div>
                    <div class="meta-item"><label>Last Inspected</label><span>${asset.lastInspected}</span></div>
                    <div class="meta-item"><label>Status Verdict</label><span><span class="status-badge ${statusClass}">${asset.status}</span></span></div>
                    <div class="meta-item"><label>Expiry Date</label><span>${asset.expiry}</span></div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Checkpoint</th>
                            <th>Description</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Cylinder Pressure Verification</td>
                            <td>${asset.status === 'Failed' ? 'Pressure needle reads 95 PSI (Below regulatory 110 PSI limit).' : 'Pressure within nominal safety limits (120 - 150 PSI).'}</td>
                            <td>${asset.status === 'Failed' ? 'FAIL' : 'PASS'}</td>
                        </tr>
                        <tr>
                            <td>Nozzle Casing & Corrosion Check</td>
                            <td>${asset.status === 'Failed' ? 'Surface oxidation detected on valve casing thread.' : 'No surface oxidation or valve thread breakdown detected.'}</td>
                            <td>${asset.status === 'Failed' ? 'WARN' : 'PASS'}</td>
                        </tr>
                        <tr>
                            <td>Tamper Seal & Safety Pin</td>
                            <td>${asset.status === 'Failed' ? 'Safety pin wire lock and plastic tamper seal is missing.' : 'Safety safety ring pin secured and tamper seal fully intact.'}</td>
                            <td>${asset.status === 'Failed' ? 'FAIL' : 'PASS'}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            `;
        }
    });

    htmlContent += `
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FireSafe_Compliance_Certificates.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// 17. App Bootstrap
window.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    
    populateSiteEquipmentList();
    populateLedgers();
    renderAiOverlayCanvas();
    
    // Bind chat enter key
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
        showToast("System Synced", "FireSafe OS databases, active AMCs, and local site lists loaded.", "pass");
    }, 1000);
});
