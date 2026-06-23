// FireSafe OS - Offline Scanning & Certification Platform Add-on

// Offline State Manager
let offlineState = {
    isOfflineMode: true,
    selectedAsset: null,
    selectedPhotos: [],
    extractedOcrData: null,
    currentVerdict: 'PENDING',
    offlineQueue: JSON.parse(localStorage.getItem('offline_inspections') || '[]'),
    ocrInProgress: false,
    aiDiagnosticsInProgress: false,
    uploadedImageDataUrl: null
};

// Toggle network status
function toggleOfflineMode() {
    offlineState.isOfflineMode = !offlineState.isOfflineMode;
    
    const indicator = document.getElementById('offline-network-indicator');
    const dot = document.getElementById('network-pulse-dot');
    const statusText = document.getElementById('network-status-text');
    const toggleBtn = document.getElementById('offline-toggle-btn');
    const syncButton = document.getElementById('sync-now-btn');

    if (offlineState.isOfflineMode) {
        indicator.className = 'sync-state-indicator';
        dot.className = 'pulse-dot-amber';
        statusText.innerText = 'OFFLINE STATE (Local Cache)';
        toggleBtn.innerText = 'Go Online';
        toggleBtn.className = 'btn btn-secondary btn-sm';
        showToast("Network Status", "Disconnected. Safety inspection engine falling back to offline Edge AI models.", "warn");
        if (syncButton) syncButton.disabled = true;
    } else {
        indicator.className = 'sync-state-indicator online';
        dot.className = 'pulse-dot-emerald';
        statusText.innerText = 'ONLINE (Cloud Connected)';
        toggleBtn.innerText = 'Go Offline';
        toggleBtn.className = 'btn btn-primary btn-sm';
        showToast("Network Status", "Connected. Cloud synchronization pipeline is ready.", "pass");
        if (syncButton) syncButton.disabled = false;
    }
    
    updateQueueUi();
}

// Populate the local asset registry database
function initOfflineAssetRegistry() {
    const searchInput = document.getElementById('offline-asset-search');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        searchOfflineAssets(e.target.value);
    });

    searchOfflineAssets('');
}

function searchOfflineAssets(query) {
    const list = document.getElementById('offline-asset-list');
    if (!list) return;

    list.innerHTML = '';
    const queryLower = query.toLowerCase();

    // Use assets from app.js assetsDatabase
    const assets = assetsDatabase || [];
    const filtered = assets.filter(asset => {
        return asset.id.toLowerCase().includes(queryLower) ||
               asset.name.toLowerCase().includes(queryLower) ||
               asset.type.toLowerCase().includes(queryLower) ||
               asset.location.toLowerCase().includes(queryLower);
    });

    if (filtered.length === 0) {
        list.innerHTML = `<div style="text-align:center; padding:12px; font-size:0.8rem; color:var(--text-muted);">No assets match search query</div>`;
        return;
    }

    filtered.forEach(asset => {
        const row = document.createElement('div');
        row.className = `offline-asset-row ${offlineState.selectedAsset && offlineState.selectedAsset.id === asset.id ? 'selected' : ''}`;
        row.innerHTML = `
            <div>
                <strong>${asset.id}</strong> - ${asset.name}
                <div style="font-size:0.7rem; color:var(--text-muted); margin-top:2px;">Location: ${asset.location} &bull; Type: ${asset.type}</div>
            </div>
            <span class="equipment-status-badge ${asset.status === 'Passed' ? 'badge-passed' : (asset.status === 'Failed' ? 'badge-failed' : 'badge-pending')}">${asset.status}</span>
        `;
        row.onclick = () => selectOfflineAsset(asset);
        list.appendChild(row);
    });
}

function selectOfflineAsset(asset) {
    offlineState.selectedAsset = asset;
    
    // Highlight the selected row
    document.querySelectorAll('.offline-asset-row').forEach(row => {
        row.classList.remove('selected');
    });
    searchOfflineAssets(document.getElementById('offline-asset-search').value);

    showToast("Asset Selected", `Loaded details for ${asset.id}`, "info");

    // Populate lookup inputs
    document.getElementById('offline-asset-id-display').innerText = asset.id;
    document.getElementById('offline-asset-name-display').innerText = asset.name;
    document.getElementById('offline-asset-site-display').innerText = sitesDatabase[asset.siteId]?.name || asset.siteId;

    // Reset photos and diagnostics
    offlineState.selectedPhotos = [];
    offlineState.extractedOcrData = null;
    offlineState.currentVerdict = 'PENDING';
    offlineState.uploadedImageDataUrl = null;
    
    document.querySelectorAll('.photo-card-offline').forEach(card => card.classList.remove('selected'));
    document.getElementById('ocr-run-btn').disabled = true;
    document.getElementById('ai-run-offline-btn').disabled = true;
    document.getElementById('save-offline-btn').disabled = true;
    document.getElementById('ocr-serial-val').value = '';
    document.getElementById('ocr-mfg-val').value = '';
    document.getElementById('ocr-pressure-val').value = '';
    document.getElementById('ocr-expiry-val').value = '';
    document.getElementById('offline-voice-text').value = '';
    document.getElementById('offline-cert-box').style.display = 'none';

    renderOfflineCanvas();
}

function simulateOfflineQrScan() {
    const list = assetsDatabase || [];
    if (list.length === 0) return;

    // Select a random pending asset or first asset
    const pendingAsset = list.find(a => a.status === 'Pending') || list[0];
    
    showToast("Scanner Initiated", "Scanning barcode / QR code...", "info");
    
    setTimeout(() => {
        selectOfflineAsset(pendingAsset);
        showToast("QR Verified", `Found asset: ${pendingAsset.id} (QR synchronized)`, "pass");
    }, 1200);
}

// Photo Selection Toggle
function toggleOfflinePhoto(photoId) {
    if (!offlineState.selectedAsset) {
        showToast("Lookup Required", "Please select or scan an asset first.", "warn");
        return;
    }

    const idx = offlineState.selectedPhotos.indexOf(photoId);
    const card = document.getElementById(`offline-photo-${photoId}`);

    if (idx === -1) {
        offlineState.selectedPhotos.push(photoId);
        if (card) card.classList.add('selected');
    } else {
        offlineState.selectedPhotos.splice(idx, 1);
        if (card) card.classList.remove('selected');
    }

    // Toggle OCR button
    document.getElementById('ocr-run-btn').disabled = (offlineState.selectedPhotos.length === 0);
    
    renderOfflineCanvas();
}

// Custom file input upload handler
function handleOfflineImageUpload(input) {
    if (!offlineState.selectedAsset) {
        showToast("Lookup Required", "Please select or scan an asset first.", "warn");
        input.value = '';
        return;
    }

    const file = input.files[0];
    if (!file) return;

    showToast("Processing Image", `Loading ${file.name}...`, "info");

    const reader = new FileReader();
    reader.onload = function(e) {
        offlineState.uploadedImageDataUrl = e.target.result;
        
        // Auto select a checkpoint for illustration when uploading custom images
        if (offlineState.selectedPhotos.length === 0) {
            toggleOfflinePhoto('gauge');
        }
        
        showToast("Image Uploaded", "Custom inspection photo loaded. Ready for Edge AI analysis.", "pass");
        renderOfflineCanvas();
    };
    reader.readAsDataURL(file);
}

// OCR Parsing
function runOcrExtraction() {
    if (offlineState.selectedPhotos.length === 0) return;

    offlineState.ocrInProgress = true;
    const btn = document.getElementById('ocr-run-btn');
    btn.disabled = true;
    btn.innerText = "Extracting OCR...";

    showToast("OCR Engine", "Running neural text extraction from image data...", "info");

    setTimeout(() => {
        const asset = offlineState.selectedAsset;
        
        // Mock extracted metadata
        const serial = asset.id + "-OCR";
        const mfg = asset.manufacturer || "Amerex";
        const pressure = offlineState.selectedPhotos.includes('gauge') ? "95 PSI" : "125 PSI";
        const expiry = asset.expiry || "2029-06-12";

        document.getElementById('ocr-serial-val').value = serial;
        document.getElementById('ocr-mfg-val').value = mfg;
        document.getElementById('ocr-pressure-val').value = pressure;
        document.getElementById('ocr-expiry-val').value = expiry;

        offlineState.extractedOcrData = { serial, mfg, pressure, expiry };
        
        btn.innerText = "OCR Extracted";
        showToast("OCR Success", "Extracted serial code, manufacturer profile, and pressure dial value.", "pass");
        
        document.getElementById('ai-run-offline-btn').disabled = false;
        
        offlineState.ocrInProgress = false;
    }, 1500);
}

// Voice note observations processing
function inputVoicePreset(text) {
    const textfield = document.getElementById('offline-voice-text');
    textfield.value = text;
    processVoiceObservations();
}

function processVoiceObservations() {
    const query = document.getElementById('offline-voice-text').value.trim().toLowerCase();
    if (!query) {
        showToast("Voice Processing", "Please select or write a note.", "warn");
        return;
    }

    showToast("Speech Processing", "Parsing speech voice tokens into structured checks...", "info");

    setTimeout(() => {
        let matched = 0;
        
        if (query.includes("low") || query.includes("pressure") || query.includes("psi")) {
            if (!offlineState.selectedPhotos.includes('gauge')) {
                toggleOfflinePhoto('gauge');
            }
            matched++;
        }
        if (query.includes("seal") || query.includes("pin") || query.includes("missing")) {
            if (!offlineState.selectedPhotos.includes('seal')) {
                toggleOfflinePhoto('seal');
            }
            matched++;
        }
        if (query.includes("rust") || query.includes("corrosion")) {
            if (!offlineState.selectedPhotos.includes('corrosion')) {
                toggleOfflinePhoto('corrosion');
            }
            matched++;
        }

        if (matched > 0) {
            showToast("Speech Parsed", `Auto-configured ${matched} checkpoints from speech transcription.`, "pass");
        } else {
            showToast("Speech Parsed", "Note saved as inspection remarks. No checkpoints affected.", "info");
        }
    }, 800);
}

// Edge AI Diagnostics Bounding box renderer
function renderOfflineCanvas() {
    const container = document.getElementById('offline-overlay-container');
    if (!container) return;

    if (!offlineState.selectedAsset || (offlineState.selectedPhotos.length === 0 && !offlineState.uploadedImageDataUrl)) {
        container.innerHTML = `
            <div style="text-align: center; color: var(--text-muted); font-size: 0.8rem; padding: 20px;">
                <i data-lucide="image" style="width: 36px; height: 36px; stroke-width: 1.5; margin-bottom: 8px;"></i>
                <div>Edge AI Neural Bounding Box Workspace</div>
            </div>
        `;
        lucide.createIcons();
        return;
    }

    const analyzed = (offlineState.currentVerdict !== 'PENDING');

    // Renders the uploaded custom safety photo as background, or falls back to standard SVG cylinder schematic
    let canvasContent = '';
    if (offlineState.uploadedImageDataUrl) {
        canvasContent = `
            <div style="position:relative; width:100%; height:100%; display:flex; align-items:center; justify-content:center; overflow:hidden; border-radius:8px; background:#090d16;">
                <img src="${offlineState.uploadedImageDataUrl}" style="max-width:100%; max-height:100%; object-fit:contain;" />
            </div>
        `;
    } else {
        canvasContent = `
            <svg viewBox="0 0 320 180" style="width:100%; height:100%; fill:none; stroke-linecap:round; stroke-linejoin:round;">
                <path d="M120 70 L180 70 L180 150 A30 30 0 0 1 120 150 Z" fill="#b91c1c" stroke="#f8fafc" stroke-width="2" />
                <path d="M140 70 L140 45 L130 45 A10 10 0 0 1 140 35 L170 35" stroke="#f8fafc" stroke-width="2"/>
                <path d="M150 45 L150 30" stroke="#f8fafc" stroke-width="3" />
                <path d="M150 45 Q190 50 190 120" stroke="#000" stroke-width="3.5" />
                
                ${offlineState.selectedPhotos.includes('gauge') ? `<circle cx="80" cy="55" r="15" fill="none" stroke="var(--primary)" stroke-width="1.5" stroke-dasharray="3,3" />` : ''}
                ${offlineState.selectedPhotos.includes('seal') ? `<circle cx="210" cy="40" r="15" fill="none" stroke="var(--primary)" stroke-width="1.5" stroke-dasharray="3,3" />` : ''}
                ${offlineState.selectedPhotos.includes('corrosion') ? `<circle cx="150" cy="80" r="15" fill="none" stroke="var(--primary)" stroke-width="1.5" stroke-dasharray="3,3" />` : ''}
                <circle cx="150" cy="50" r="3" fill="#f8fafc"/>
            </svg>
        `;
    }

    container.innerHTML = `
        ${canvasContent}

        ${(analyzed && offlineState.selectedPhotos.includes('gauge')) ? `
            <div class="ai-bounding-box" style="top: 25px; left: 35px; width: 65px; height: 65px;">
                <span class="ai-box-label">Low Pressure [96%]</span>
            </div>
        ` : ''}
        
        ${(analyzed && offlineState.selectedPhotos.includes('corrosion')) ? `
            <div class="ai-bounding-box warn-box" style="top: 65px; left: 125px; width: 50px; height: 50px;">
                <span class="ai-box-label">Oxidation [91%]</span>
            </div>
        ` : ''}
        
        ${(analyzed && offlineState.selectedPhotos.includes('seal')) ? `
            <div class="ai-bounding-box" style="top: 15px; left: 185px; width: 55px; height: 55px;">
                <span class="ai-box-label">No Pin [98%]</span>
            </div>
        ` : ''}
    `;
    lucide.createIcons();
}

function runOfflineDiagnostics() {
    if (!offlineState.selectedAsset) return;

    offlineState.aiDiagnosticsInProgress = true;
    const btn = document.getElementById('ai-run-offline-btn');
    btn.disabled = true;
    btn.innerText = "Running Edge AI...";

    showToast("Edge AI Engine", "Processing image structures and sensor metrics offline...", "info");

    setTimeout(() => {
        let isFailed = false;
        
        if (offlineState.selectedPhotos.includes('gauge') || offlineState.selectedPhotos.includes('seal')) {
            isFailed = true;
        }

        offlineState.currentVerdict = isFailed ? 'FAIL' : 'PASS';
        
        btn.innerText = "Diagnostics Done";
        showToast("Diagnostics Completed", `Inspection Verdict calculated: ${offlineState.currentVerdict}`, isFailed ? "fail" : "pass");

        // Show certificate preview
        renderOfflineCertificate();

        document.getElementById('save-offline-btn').disabled = false;
        offlineState.aiDiagnosticsInProgress = false;
        
        renderOfflineCanvas();
    }, 1500);
}

// Certificate & document preview
function renderOfflineCertificate() {
    const container = document.getElementById('offline-cert-box');
    if (!container) return;

    container.style.display = 'block';

    const asset = offlineState.selectedAsset;
    const verdict = offlineState.currentVerdict;
    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    const validityDate = new Date();
    validityDate.setFullYear(validityDate.getFullYear() + 1);
    const validStr = validityDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    
    const randomCertNum = "FOS-" + new Date().getFullYear() + "-" + Math.floor(100000 + Math.random() * 900000);

    container.innerHTML = `
        <div class="offline-certificate-preview">
            <div class="cert-preview-header">
                <div class="cert-preview-title">🔥 FIRE OS COMPLIANCE CERTIFICATE</div>
                <span class="equipment-status-badge ${verdict === 'PASS' ? 'badge-passed' : 'badge-failed'}">${verdict}</span>
            </div>
            
            <div class="cert-preview-grid">
                <div><label>Certificate No</label><span id="c-num">${randomCertNum}</span></div>
                <div><label>Equipment Type</label><span>${asset.type}</span></div>
                <div><label>Asset Serial ID</label><span>${asset.id}</span></div>
                <div><label>Inspection Date</label><span>${dateStr}</span></div>
                <div><label>Valid Until</label><span>${verdict === 'PASS' ? validStr : 'SUSPENDED'}</span></div>
                <div><label>Auditor Signature</label><span style="font-family:'Outfit'; font-style:italic;">Sujal Technician (Edge Verified)</span></div>
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:16px;">
                <div style="font-size:0.7rem; color:#64748b;">
                    <strong>NFPA Safety Standards Checked:</strong> 
                    ${offlineState.selectedPhotos.includes('gauge') ? 'PSI verification (Failed)' : 'PSI normal'} | 
                    ${offlineState.selectedPhotos.includes('seal') ? 'Security lock pin (Failed)' : 'Lock pin secured'}
                </div>
                <button class="btn btn-secondary btn-sm" onclick="exportOfflineDocument('${randomCertNum}')">
                    <i data-lucide="download"></i> Export Certificate HTML
                </button>
            </div>
        </div>
    `;
    lucide.createIcons();
}

// Export Certificate HTML
function exportOfflineDocument(certNum) {
    const asset = offlineState.selectedAsset;
    const verdict = offlineState.currentVerdict;
    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    
    showToast("Exporting", "Preparing printable compliance document...", "info");

    let certContent = `<!DOCTYPE html>
<html>
<head>
    <title>Fire OS Offline Certificate - ${asset.id}</title>
    <style>
        body { font-family: sans-serif; padding: 40px; background: #f8fafc; }
        .cert { background: white; border: 2px solid #e2e8f0; padding: 30px; border-radius: 8px; max-width: 600px; margin: auto; }
        .heading { text-align: center; font-size: 1.4rem; font-weight: bold; margin-bottom: 20px; color: #ef4444; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; font-size: 0.9rem; }
        .badge { display: inline-block; padding: 6px 12px; border-radius: 12px; font-weight: bold; }
        .pass { background: #d1fae5; color: #065f46; }
        .fail { background: #fee2e2; color: #991b1b; }
    </style>
</head>
<body>
    <div class="cert">
        <div class="heading">FIRE SAFETY INSPECTION COMPLIANCE CERTIFICATE</div>
        <div class="grid">
            <div><strong>Cert ID:</strong> ${certNum}</div>
            <div><strong>Asset Serial:</strong> ${asset.id}</div>
            <div><strong>Manufacturer:</strong> ${asset.manufacturer}</div>
            <div><strong>Inspection Verdict:</strong> <span class="badge ${verdict === 'PASS' ? 'pass' : 'fail'}">${verdict}</span></div>
            <div><strong>Inspection Date:</strong> ${dateStr}</div>
            <div><strong>Generated By:</strong> Fire OS Edge Offline System</div>
        </div>
        <hr style="border:0; border-top:1px solid #e2e8f0; margin:20px 0;">
        <div style="font-size:0.8rem; color:#64748b; text-align:center;">
            Verified and Digitally Signed in Offline Mode by Surveyor: Sujal Technician
        </div>
    </div>
</body>
</html>`;

    const blob = new Blob([certContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Fire_OS_Cert_${asset.id}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Save inspection to Offline SQLite cache
function saveOfflineInspection() {
    if (!offlineState.selectedAsset || offlineState.currentVerdict === 'PENDING') return;

    const certNum = document.getElementById('c-num')?.innerText || "FOS-" + Math.floor(100000 + Math.random() * 900000);
    const record = {
        id: offlineState.selectedAsset.id,
        name: offlineState.selectedAsset.name,
        verdict: offlineState.currentVerdict,
        date: new Date().toISOString().slice(0, 10),
        certNumber: certNum,
        synced: false
    };

    offlineState.offlineQueue.push(record);
    localStorage.setItem('offline_inspections', JSON.stringify(offlineState.offlineQueue));

    showToast("Offline Save Success", `Inspection saved to local SQLite cache database.`, "pass");
    updateQueueUi();
    
    // Disable save to avoid double posting
    document.getElementById('save-offline-btn').disabled = true;
}

// Update the Queue list in sidebar or manager
function updateQueueUi() {
    const list = document.getElementById('offline-queue-rows');
    const badge = document.getElementById('offline-queue-badge');
    
    if (!list) return;
    list.innerHTML = '';

    const count = offlineState.offlineQueue.filter(r => !r.synced).length;
    if (badge) {
        badge.innerText = `Pending Sync: ${count}`;
        badge.className = count > 0 ? "badge-pending" : "badge-passed";
    }

    if (offlineState.offlineQueue.length === 0) {
        list.innerHTML = `<div style="text-align:center; padding:20px; font-size:0.8rem; color:var(--text-muted);">Local SQLite cache is empty</div>`;
        return;
    }

    offlineState.offlineQueue.forEach((rec, idx) => {
        const item = document.createElement('div');
        item.className = 'offline-queue-item';
        item.innerHTML = `
            <div class="offline-queue-info">
                <strong>${rec.id}</strong> - ${rec.name}
                <div style="font-size:0.7rem; color:var(--text-muted); margin-top:2px;">
                    Date: ${rec.date} &bull; Cert: ${rec.certNumber} &bull; 
                    <span style="color:${rec.synced ? 'var(--color-pass)' : 'var(--color-warn)'}">${rec.synced ? 'Synced' : 'Cached Local'}</span>
                </div>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
                <span class="equipment-status-badge ${rec.verdict === 'PASS' ? 'badge-passed' : 'badge-failed'}">${rec.verdict}</span>
                ${rec.synced ? '<i data-lucide="cloud-check" style="color:var(--color-pass); width:16px;"></i>' : '<i data-lucide="cloud-off" style="color:var(--color-warn); width:16px;"></i>'}
            </div>
        `;
        list.appendChild(item);
    });
    lucide.createIcons();
}

// Synchronize offline cached inspection database with Cloud Server
function runCloudSynchronization() {
    const unsynced = offlineState.offlineQueue.filter(r => !r.synced);
    if (unsynced.length === 0) {
        showToast("Sync Manager", "Local database is already in sync with cloud. No action needed.", "info");
        return;
    }

    const progressBg = document.getElementById('sync-prog-fill');
    const percentText = document.getElementById('sync-percent-text');
    const syncBtn = document.getElementById('sync-now-btn');

    syncBtn.disabled = true;
    percentText.style.display = 'inline';
    
    let progressVal = 0;
    showToast("Sync Initiated", `Uploading ${unsynced.length} offline records to central database...`, "info");

    const syncInterval = setInterval(() => {
        progressVal += 20;
        if (progressVal > 100) progressVal = 100;

        if (progressBg) progressBg.style.width = `${progressVal}%`;
        if (percentText) percentText.innerText = `${progressVal}%`;

        if (progressVal >= 100) {
            clearInterval(syncInterval);
            
            // Mark all items as synced
            offlineState.offlineQueue.forEach(rec => {
                rec.synced = true;
                
                // Update master database assets in app.js
                const masterIdx = assetsDatabase.findIndex(a => a.id === rec.id);
                if (masterIdx > -1) {
                    assetsDatabase[masterIdx].status = rec.verdict === 'PASS' ? 'Passed' : 'Failed';
                    assetsDatabase[masterIdx].lastInspected = rec.date;
                    
                    // Prepend history log
                    assetsDatabase[masterIdx].history.unshift({
                        date: rec.date,
                        title: `Sync Check: ${rec.verdict}`,
                        desc: `Offline audit synchronized from local Edge DB. Certificate No: ${rec.certNumber}`,
                        type: rec.verdict === 'PASS' ? 'pass' : 'fail',
                        marker: rec.verdict === 'PASS' ? 'check' : 'close'
                    });
                }
            });

            localStorage.setItem('offline_inspections', JSON.stringify(offlineState.offlineQueue));
            
            setTimeout(() => {
                syncBtn.disabled = false;
                percentText.innerText = '';
                if (progressBg) progressBg.style.width = '0%';
                
                showToast("Sync Completed", "All cached inspections have been merged with the central Cloud registry.", "pass");
                
                // Update layouts
                populateLedgers();
                updateQueueUi();
            }, 600);
        }
    }, 200);
}

// Clear local storage queue
function clearOfflineCache() {
    offlineState.offlineQueue = [];
    localStorage.removeItem('offline_inspections');
    showToast("Cache Cleared", "Local SQLite cache database cleared.", "info");
    updateQueueUi();
}

// Bootstrap Hook for Offline Scanning
window.addEventListener('DOMContentLoaded', () => {
    // Inject initialization hooks once elements are rendered
    setTimeout(() => {
        initOfflineAssetRegistry();
        updateQueueUi();
    }, 200);
});
