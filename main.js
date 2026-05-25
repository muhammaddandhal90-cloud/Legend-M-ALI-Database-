const API_ENDPOINT_URL = "https://sim-info-api.wasif-ali.workers.dev/?search=";
let titleTapCounter = 0;
let tapResetTimer = null;

document.addEventListener('DOMContentLoaded', () => {
    initAppCore();
    setupSecretTrigger();
});

function initAppCore() {
    const searchForm = document.getElementById('searchForm');
    const clearResultsBtn = document.getElementById('clearResultsBtn');
    
    if (searchForm) searchForm.addEventListener('submit', handleDatabaseQuery);
    if (clearResultsBtn) clearResultsBtn.addEventListener('click', clearDisplayRecords);
    renderPublicBroadcastProjects();
}

export function showNotification(message, duration = 3500) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    if (!toast || !toastMessage) return;
    toastMessage.textContent = message;
    toast.classList.remove('translate-x-72');
    setTimeout(() => { toast.classList.add('translate-x-72'); }, duration);
}

function setupSecretTrigger() {
    const secretTitle = document.getElementById('secretTitleTrigger');
    if (!secretTitle) return;

    secretTitle.addEventListener('click', () => {
        titleTapCounter++;
        clearTimeout(tapResetTimer);
        tapResetTimer = setTimeout(() => { titleTapCounter = 0; }, 2000);

        if (titleTapCounter === 5) {
            titleTapCounter = 0;
            clearTimeout(tapResetTimer);
            launchSecureAdminGate();
        }
    });
}

function launchSecureAdminGate() {
    showNotification("Entering Encrypted Shell Layer...");
    document.getElementById('mainInterface').classList.add('hidden');
    document.getElementById('adminPanel').classList.remove('hidden');
    document.getElementById('adminAuthGate').classList.remove('hidden');
    document.getElementById('adminDashboardContent').classList.add('hidden');
    document.getElementById('adminPasswordInput').value = '';
    document.getElementById('adminPasswordInput').focus();
}

async function handleDatabaseQuery(event) {
    event.preventDefault();
    const queryInput = document.getElementById('cnicOrPhone').value.trim();
    const loader = document.getElementById('loader');
    const resultCard = document.getElementById('resultCard');
    const resultData = document.getElementById('resultData');
    const resultHeader = document.getElementById('resultHeader');

    if (!queryInput) return;

    resultCard.classList.add('hidden');
    loader.classList.remove('hidden');

    try {
        const response = await fetch(`${API_ENDPOINT_URL}${encodeURIComponent(queryInput)}`);
        if (!response.ok) throw new Error(`Status: ${response.status}`);
        const payload = await response.json();
        
        loader.classList.add('hidden');
        resultCard.classList.remove('hidden');
        resultData.innerHTML = '';

        let dataPayload = Array.isArray(payload) ? payload[0] : payload;

        if (dataPayload && Object.keys(dataPayload).length > 0 && !dataPayload.error) {
            resultHeader.className = "text-lg font-bold text-emerald-400 flex items-center gap-2";
            resultHeader.innerHTML = `<i class="fa-solid fa-shield-cat"></i> Centralized Records Found`;
            resultCard.style.borderColor = "rgba(16, 185, 129, 0.3)";

            for (const [key, val] of Object.entries(dataPayload)) {
                if (val === null || val === undefined || val === '') continue;
                const cleanKey = key.replace(/_/g, ' ').toUpperCase();
                resultData.innerHTML += `
                    <div class="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                        <span class="text-xs text-gray-500 block font-bold tracking-wider mb-0.5">${cleanKey}</span>
                        <span class="text-sm md:text-base text-gray-100 font-mono font-medium tracking-wide break-all">${val}</span>
                    </div>
                `;
            }
        } else {
            resultHeader.className = "text-lg font-bold text-amber-500 flex items-center gap-2";
            resultHeader.innerHTML = `<i class="fa-solid fa-circle-info"></i> Query Completed`;
            resultCard.style.borderColor = "rgba(245, 158, 11, 0.3)";
            resultData.innerHTML = `
                <div class="col-span-1 md:col-span-2 bg-amber-950/20 text-amber-300 p-5 rounded-xl border border-amber-900/40 text-center text-sm font-medium">
                    No structured rows matching data indexes were pulled.
                </div>
            `;
        }
    } catch (error) {
        loader.classList.add('hidden');
        resultCard.classList.remove('hidden');
        resultHeader.className = "text-lg font-bold text-red-400 flex items-center gap-2";
        resultHeader.innerHTML = `<i class="fa-solid fa-circle-radiation"></i> API Error`;
        resultData.innerHTML = `<div class="col-span-1 md:col-span-2 text-center text-red-400 p-4">${error.message}</div>`;
    }
}

function clearDisplayRecords() {
    document.getElementById('resultCard').classList.add('hidden');
    document.getElementById('searchForm').reset();
    showNotification("Workspace records wiped clean.");
}

// Global UI Rendering block for new project insertions
export function renderPublicBroadcastProjects() {
    const portfolioSection = document.getElementById('portfolioSection');
    const projectGrid = document.getElementById('projectGrid');
    if (!portfolioSection || !projectGrid) return;

    const savedItems = JSON.parse(localStorage.getItem('legend_projects') || '[]');
    if (savedItems.length === 0) {
        portfolioSection.classList.add('hidden');
        return;
    }

    portfolioSection.classList.remove('hidden');
    projectGrid.innerHTML = '';

    savedItems.forEach(item => {
        const targetAttr = item.link ? `href="${item.link}" target="_blank"` : 'href="javascript:void(0)"';
        projectGrid.innerHTML += `
            <div class="glass-card rounded-2xl overflow-hidden border-slate-800 flex flex-col transition-all duration-300">
                <div class="w-full h-44 bg-slate-950 relative overflow-hidden">
                    <img src="${item.image}" alt="Thumb" class="w-full h-full object-cover">
                    ${item.link ? `<span class="absolute top-3 right-3 bg-blue-600 text-white text-[10px] uppercase font-extrabold px-2 py-0.5 rounded"><i class="fa-solid fa-link"></i> External Node</span>` : ''}
                </div>
                <div class="p-5 flex-grow flex flex-col justify-between space-y-3">
                    <div>
                        <h3 class="text-base font-bold text-gray-100 tracking-wide">${item.title}</h3>
                        <p class="text-xs text-gray-400 mt-1">${item.desc}</p>
                    </div>
                    ${item.link ? `<a ${targetAttr} class="inline-flex items-center justify-center gap-1.5 bg-slate-800 text-xs font-bold text-blue-400 py-2 rounded-xl border border-slate-700 transition-colors w-full">Open Project Link <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i></a>` : ''}
                </div>
            </div>
        `;
    });
}
