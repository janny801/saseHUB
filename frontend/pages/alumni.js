let allAlumni = [];
let filteredAlumni = [];
let savedAlumni = [];
let majorsLookup = [];
let selectedMajors = [];
let currentAlumniId = null;

async function init() {
    const uh_id = localStorage.getItem("uh_id");
    
    // Fetch Data from your existing API routes
    const [alumniRes, savedRes, majorRes] = await Promise.all([
        fetch("/alumni/all"),
        fetch(`/saved-alumni/${uh_id}`),
        fetch("/majors/all")
    ]);

    allAlumni = await alumniRes.json();
    filteredAlumni = [...allAlumni];
    savedAlumni = await savedRes.json();
    majorsLookup = await majorRes.json();

    setupFilterMenus();
    renderTable(filteredAlumni);
}

function setupFilterMenus() {
    const majorMenu = document.getElementById("majorMenu");

    // Setup Major Menu only - mapping from your majors table
    const majorNames = majorsLookup.map(m => m.major_name).sort();
    majorMenu.innerHTML = majorNames.map(m => `
        <div class="filter-option" onclick="toggleSelection('major', '${m}', event)">${m}</div>
    `).join('');
}

function renderTable(list) {
    const tbody = document.getElementById("alumniTableBody");
    tbody.innerHTML = list.map(a => `
        <tr id="row-${a.id}" onclick="viewAlumni(${a.id}, event)">
            <td>${a.full_name}</td>
            <td>${a.company || 'N/A'}</td>
            <td>${a.role_title || 'N/A'}</td>
            <td>${a.majors || 'N/A'}</td>
        </tr>
    `).join('');
}

function viewAlumni(id, event) {
    const a = allAlumni.find(alum => alum.id === id);
    if (!a) return;

    currentAlumniId = id;
    const sidebar = document.getElementById("alumniSidebar");
    sidebar.classList.add("active");

    // Update Sidebar Content
    document.getElementById("sideName").innerText = a.full_name;
    document.getElementById("sideRole").innerText = `${a.role_title || ''} @ ${a.company || 'Unknown'}`;
    document.getElementById("sideImg").src = a.profile_pic || "../images/saselogo.webp";
    document.getElementById("sideDesc").innerText = a.description || "No biography provided.";
    document.getElementById("sideIndustries").innerText = a.industries || "N/A";
    
    // Social / Contact Links
    document.getElementById("sideEmail").href = `mailto:${a.email}`;
    document.getElementById("sideLinkedin").href = a.linkedin || "#";
    document.getElementById("sideOther").href = a.other_link || "#";

    // Handle Save State using alumni_id
    const saveBtn = document.getElementById("sidebarSaveBtn");
    const isSaved = savedAlumni.some(sa => sa.id === a.id);
    saveBtn.innerHTML = isSaved ? '<i class="fa-solid fa-bookmark"></i>' : '<i class="fa-regular fa-bookmark"></i>';
    saveBtn.onclick = (e) => {
        e.stopPropagation(); 
        toggleSaveAlumni(a.id);
    };

    // Highlight selected row Green
    const rows = document.querySelectorAll("#alumniTableBody tr");
    rows.forEach(row => row.classList.remove("selected-prof"));
    
    const selectedRow = event ? event.currentTarget : document.getElementById(`row-${id}`);
    if (selectedRow) selectedRow.classList.add("selected-prof");
}

function navAlumni(direction) {
    const currentIndex = filteredAlumni.findIndex(a => a.id === currentAlumniId);
    let nextIndex = currentIndex + direction;

    if (nextIndex >= 0 && nextIndex < filteredAlumni.length) {
        const nextAlum = filteredAlumni[nextIndex];
        viewAlumni(nextAlum.id, null);
        const nextRow = document.getElementById(`row-${nextAlum.id}`);
        if (nextRow) nextRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

function closeSidebar() {
    document.getElementById("alumniSidebar").classList.remove("active");
    document.querySelectorAll("#alumniTableBody tr").forEach(row => row.classList.remove("selected-prof"));
    currentAlumniId = null;
}

function toggleFilter(event, type) {
    event.stopPropagation();
    const menu = document.getElementById(`${type}Menu`);
    // Close other menus if any
    document.querySelectorAll('.filter-dropdown').forEach(m => {
        if(m !== menu) m.classList.remove("show");
    });
    menu.classList.toggle("show");
}

function toggleSelection(type, value, event) {
    event.stopPropagation();
    const list = selectedMajors; // Strictly major logic
    const index = list.indexOf(value);

    if (index > -1) {
        list.splice(index, 1);
        event.target.classList.remove("selected");
    } else {
        list.push(value);
        event.target.classList.add("selected");
    }
    applyFilters();
}

function applyFilters() {
    const q = document.getElementById("alumniSearch").value.toLowerCase();
    
    filteredAlumni = allAlumni.filter(a => {
        const matchesSearch = a.full_name.toLowerCase().includes(q) || 
                             (a.company && a.company.toLowerCase().includes(q)) ||
                             (a.role_title && a.role_title.toLowerCase().includes(q)) ||
                             (a.majors && a.majors.toLowerCase().includes(q));
        
        const matchesMajor = selectedMajors.length === 0 || 
                             (a.majors && selectedMajors.some(m => a.majors.toLowerCase().includes(m.toLowerCase())));

        return matchesSearch && matchesMajor;
    });
    
    renderTable(filteredAlumni);
    
    // Close sidebar if the currently viewed alumni is filtered out
    if (currentAlumniId && !filteredAlumni.some(a => a.id === currentAlumniId)) {
        closeSidebar();
    }
}

async function toggleSaveAlumni(alumniId) {
    const uh_id = localStorage.getItem("uh_id");
    const isSaved = savedAlumni.some(sa => sa.id === alumniId);
    const url = isSaved ? "/saved-alumni/remove" : "/saved-alumni/save";
    const method = isSaved ? "DELETE" : "POST";

    await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uh_id, alumni_id: alumniId })
    });

    // Refresh saved list from server
    const res = await fetch(`/saved-alumni/${uh_id}`);
    savedAlumni = await res.json();
    
    // Update the icon status
    const saveBtn = document.getElementById("sidebarSaveBtn");
    const stillSaved = savedAlumni.some(sa => sa.id === alumniId);
    saveBtn.innerHTML = stillSaved ? '<i class="fa-solid fa-bookmark"></i>' : '<i class="fa-regular fa-bookmark"></i>';
}

// Global click listener to close dropdowns when clicking away
window.addEventListener('click', () => {
    document.querySelectorAll('.filter-dropdown').forEach(m => m.classList.remove('show'));
});

function logout() {
    localStorage.clear();
    window.location.href = "../login.html";
}

init();