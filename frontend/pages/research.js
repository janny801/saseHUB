let allProfessors = [];
let filteredProfessors = [];
let savedProfessors = [];
let selectedColleges = [];
let selectedMajors = [];
let currentProfId = null;
let majorsLookup = [];

async function init() {
    const uh_id = localStorage.getItem("uh_id");
    
    // Fetch Data
    const [profRes, savedRes, majorRes] = await Promise.all([
        fetch("/professors/all"),
        fetch(`/saved-professors/${uh_id}`),
        fetch("/majors/all")
    ]);

    allProfessors = await profRes.json();
    filteredProfessors = [...allProfessors];
    savedProfessors = await savedRes.json();
    majorsLookup = await majorRes.json();

    setupFilterMenus();
    renderTable(filteredProfessors);
}

function setupFilterMenus() {
    const collegeMenu = document.getElementById("collegeMenu");
    const majorMenu = document.getElementById("majorMenu");

    // Get unique colleges from lookup
    const colleges = [...new Set(majorsLookup.map(m => m.college_name))].sort();
    collegeMenu.innerHTML = colleges.map(c => `
        <div class="filter-option" onclick="toggleSelection('college', '${c}', event)">${c}</div>
    `).join('');

    // Map all majors
    const majorNames = majorsLookup.map(m => m.major_name).sort();
    majorMenu.innerHTML = majorNames.map(m => `
        <div class="filter-option" onclick="toggleSelection('major', '${m}', event)">${m}</div>
    `).join('');
}

function toggleFilter(event, type) {
    event.stopPropagation();
    const menu = document.getElementById(`${type}Menu`);
    const otherMenu = document.getElementById(type === 'college' ? 'majorMenu' : 'collegeMenu');
    
    otherMenu.classList.remove("show");
    menu.classList.toggle("show");
}

function toggleSelection(type, value, event) {
    event.stopPropagation();
    const list = type === 'college' ? selectedColleges : selectedMajors;
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

function renderTable(list) {
    const tbody = document.getElementById("profTableBody");
    tbody.innerHTML = list.map(p => `
        <tr id="row-${p.id}" onclick="viewProfessor(${p.id}, event)">
            <td>${p.professor_name}</td>
            <td>${p.university || 'University of Houston'}</td>
            <td>${p.majors || 'N/A'}</td>
            <td>${p.email}</td>
        </tr>
    `).join('');
}

function viewProfessor(id, event) {
    const p = allProfessors.find(prof => prof.id === id);
    if (!p) return;

    currentProfId = id;
    const sidebar = document.getElementById("profSidebar");
    sidebar.classList.add("active");

    document.getElementById("sideName").innerText = p.professor_name;
    document.getElementById("sideMajor").innerText = p.majors || "General Research";
    document.getElementById("sideImg").src = p.profile_pic_url || "../images/saselogo.webp";
    document.getElementById("sideDesc").innerText = p.description || "No description provided.";
    
    const saveBtn = document.getElementById("sidebarSaveBtn");
    const isSaved = savedProfessors.some(sp => sp.id === p.id);
    saveBtn.innerHTML = isSaved ? '<i class="fa-solid fa-bookmark"></i>' : '<i class="fa-regular fa-bookmark"></i>';
    saveBtn.onclick = (e) => {
        e.stopPropagation(); 
        toggleSave(p.id);
    };

    const rows = document.querySelectorAll("#profTableBody tr");
    rows.forEach(row => row.classList.remove("selected-prof"));
    
    // Ensure we highlight correctly whether triggered by click or nav
    const targetRow = event ? event.currentTarget : document.getElementById(`row-${id}`);
    if (targetRow) targetRow.classList.add("selected-prof");
}

function navProfessor(direction) {
    const currentIndex = filteredProfessors.findIndex(p => p.id === currentProfId);
    let nextIndex = currentIndex + direction;

    if (nextIndex >= 0 && nextIndex < filteredProfessors.length) {
        const nextProf = filteredProfessors[nextIndex];
        viewProfessor(nextProf.id, null);
        const nextRow = document.getElementById(`row-${nextProf.id}`);
        if (nextRow) nextRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

function closeSidebar() {
    document.getElementById("profSidebar").classList.remove("active");
    document.querySelectorAll("#profTableBody tr").forEach(row => row.classList.remove("selected-prof"));
    currentProfId = null;
}

async function toggleSave(professorId) {
    const uh_id = localStorage.getItem("uh_id");
    const isSaved = savedProfessors.some(sp => sp.id === professorId);
    const url = isSaved ? "/saved-professors/remove" : "/saved-professors/save";
    const method = isSaved ? "DELETE" : "POST";

    await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uh_id, professor_id: professorId })
    });

    const res = await fetch(`/saved-professors/${uh_id}`);
    savedProfessors = await res.json();
    
    const saveBtn = document.getElementById("sidebarSaveBtn");
    const stillSaved = savedProfessors.some(sp => sp.id === professorId);
    saveBtn.innerHTML = stillSaved ? '<i class="fa-solid fa-bookmark"></i>' : '<i class="fa-regular fa-bookmark"></i>';
}

function applyFilters() {
    const q = document.getElementById("profSearch").value.toLowerCase();
    
    filteredProfessors = allProfessors.filter(p => {
        // 1. Search Query Match
        const matchesSearch = p.professor_name.toLowerCase().includes(q) || 
                             (p.majors && p.majors.toLowerCase().includes(q)) ||
                             (p.university && p.university.toLowerCase().includes(q));
        
        // 2. Major Filter Match
        const matchesMajor = selectedMajors.length === 0 || 
                             (p.majors && selectedMajors.some(m => p.majors.toLowerCase().includes(m.toLowerCase())));

        // 3. College Filter Match
        const matchesCollege = selectedColleges.length === 0 || (p.majors && p.majors.split(',').some(profMaj => {
            const majorInfo = majorsLookup.find(m => m.major_name.trim().toLowerCase() === profMaj.trim().toLowerCase());
            return majorInfo && selectedColleges.includes(majorInfo.college_name);
        }));

        return matchesSearch && matchesMajor && matchesCollege;
    });
    
    renderTable(filteredProfessors);
    
    if (currentProfId && !filteredProfessors.some(p => p.id === currentProfId)) {
        closeSidebar();
    }
}

// Close dropdowns when clicking anywhere else
window.addEventListener('click', () => {
    document.querySelectorAll('.filter-dropdown').forEach(menu => menu.classList.remove('show'));
});

function logout() {
    localStorage.clear();
    window.location.href = "../login.html";
}

init();