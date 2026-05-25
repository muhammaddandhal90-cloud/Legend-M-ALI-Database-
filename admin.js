import { showNotification, renderPublicBroadcastProjects } from './main.js';

const SYSTEM_PHRASE_TOKEN = "adminlegend12345";
let base64ProjectImageStr = "";

document.addEventListener('DOMContentLoaded', () => {
    initAdminControlModules();
});

function initAdminControlModules() {
    document.getElementById('adminLoginForm').addEventListener('submit', verifyAdminCredentials);
    document.getElementById('exitAdminBtn').addEventListener('click', closeAdminShellTerminal);
    document.getElementById('projectForm').addEventListener('submit', saveNewProjectNode);
    document.getElementById('wipeAllNodes').addEventListener('click', resetAllProjectNodes);
    document.getElementById('customUploadBtn').addEventListener('click', () => document.getElementById('projectImageInput').click());
    document.getElementById('projectImageInput').addEventListener('change', processUploadedImageFile);
    document.getElementById('removePreviewBtn').addEventListener('click', resetImageUploadPreviews);
}

function verifyAdminCredentials(event) {
    event.preventDefault();
    const tokenInput = document.getElementById('adminPasswordInput').value;

    if (tokenInput === SYSTEM_PHRASE_TOKEN) {
        showNotification("Security handshake verified.");
        document.getElementById('adminAuthGate').classList.add('hidden');
        document.getElementById('adminDashboardContent').classList.remove('hidden');
        syncAdminInventoryList();
    } else {
        showNotification("ACCESS DENIED: Mismatch.");
        document.getElementById('adminPasswordInput').value = '';
    }
}

function closeAdminShellTerminal() {
    document.getElementById('adminPanel').classList.add('hidden');
    document.getElementById('mainInterface').classList.remove('hidden');
    renderPublicBroadcastProjects();
}

function processUploadedImageFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        base64ProjectImageStr = e.target.result;
        document.getElementById('customUploadBtn').classList.add('hidden');
        document.getElementById('imagePreviewContainer').classList.remove('hidden');
        document.getElementById('imagePreview').src = base64ProjectImageStr;
    };
    reader.readAsDataURL(file);
}

function resetImageUploadPreviews() {
    base64ProjectImageStr = "";
    document.getElementById('projectImageInput').value = "";
    document.getElementById('imagePreviewContainer').classList.add('hidden');
    document.getElementById('customUploadBtn').classList.remove('hidden');
}

function saveNewProjectNode(event) {
    event.preventDefault();
    const title = document.getElementById('projectTitle').value.trim();
    const desc = document.getElementById('projectDesc').value.trim();
    const link = document.getElementById('projectLink').value.trim();

    if (!base64ProjectImageStr) {
        showNotification("Please upload an image first.");
        return;
    }

    const newNode = {
        id: 'node_' + Date.now(),
        title: title,
        desc: desc,
        image: base64ProjectImageStr,
        link: link || null
    };

    const currentInventory = JSON.parse(localStorage.getItem('legend_projects') || '[]');
    currentInventory.unshift(newNode);
    localStorage.setItem('legend_projects', JSON.stringify(currentInventory));

    document.getElementById('projectForm').reset();
    resetImageUploadPreviews();
    showNotification("Project node deployed!");
    syncAdminInventoryList();
}

function syncAdminInventoryList() {
    const listWrapper = document.getElementById('adminProjectList');
    const countBadge = document.getElementById('nodeCount');
    const inventory = JSON.parse(localStorage.getItem('legend_projects') || '[]');
    countBadge.textContent = inventory.length;

    if (inventory.length === 0) {
        listWrapper.innerHTML = `<div class="text-center py-6 text-slate-500 text-xs">No active nodes.</div>`;
        return;
    }

    listWrapper.innerHTML = '';
    inventory.forEach(node => {
        listWrapper.innerHTML += `
            <div class="bg-slate-950/80 border border-slate-800 p-4 rounded-xl flex items-center justify-between gap-4">
                <div class="flex items-center gap-3 overflow-hidden">
                    <img src="${node.image}" class="w-12 h-12 rounded-lg object-cover flex-shrink-0">
                    <div class="overflow-hidden">
                        <h4 class="text-sm font-bold text-gray-200 truncate">${node.title}</h4>
                        <p class="text-xs text-gray-500 truncate mt-0.5">${node.desc}</p>
                    </div>
                </div>
                <button type="button" data-id="${node.id}" class="delete-node-btn h-8 w-8 bg-red-950/20 text-red-400 border border-red-900 rounded-lg flex items-center justify-center text-xs hover:bg-red-600 hover:text-white transition-all">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        `;
    });

    document.querySelectorAll('.delete-node-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const targetId = this.getAttribute('data-id');
            let inv = JSON.parse(localStorage.getItem('legend_projects') || '[]');
            inv = inv.filter(item => item.id !== targetId);
            localStorage.setItem('legend_projects', JSON.stringify(inv));
            showNotification("Node deleted.");
            syncAdminInventoryList();
        });
    });
}

function resetAllProjectNodes() {
    if (confirm("Wipe all projects?")) {
        localStorage.removeItem('legend_projects');
        showNotification("Wiped successfully.");
        syncAdminInventoryList();
    }
}
