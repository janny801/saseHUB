let allProfessors = [];
let filteredProfessors = [];
let savedProfessors = [];
let currentProfId = null;

async function init() {
    const uh_id = localStorage.getItem("uh_id");
    
    const [profRes, savedRes] = await Promise.all([
        fetch("/professors/all"),
        fetch(`/saved-professors/${uh_id}`)
    ]);

    allProfessors = await profRes.json();
    filteredProfessors = [...allProfessors];
    savedProfessors = await savedRes.json();

    renderTable(filteredProfessors);
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
    
    const selectedRow = document.getElementById(`row-${id}`);
    if (selectedRow) selectedRow.classList.add("selected-prof");
}

function navProfessor(direction) {
    const currentIndex = filteredProfessors.findIndex(p => p.id === currentProfId);
    let nextIndex = currentIndex + direction;

    if (nextIndex >= 0 && nextIndex < filteredProfessors.length) {
        const nextProf = filteredProfessors[nextIndex];
        viewProfessor(nextProf.id);
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
    filteredProfessors = allProfessors.filter(p => 
        p.professor_name.toLowerCase().includes(q) || 
        (p.majors && p.majors.toLowerCase().includes(q)) ||
        (p.university && p.university.toLowerCase().includes(q))
    );
    renderTable(filteredProfessors);
    
    if (currentProfId && !filteredProfessors.some(p => p.id === currentProfId)) {
        closeSidebar();
    }
}

function logout() {
    localStorage.clear();
    window.location.href = "../login.html";
}

init();