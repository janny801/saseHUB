const uh_id = localStorage.getItem("uh_id");

// Redirect if not logged in
if (!localStorage.getItem("loggedIn") || !uh_id) {
    window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", () => {
    loadProfile();
    loadSavedProfessors();
    loadSavedInternships();
    loadSavedAlumni();
});

/* ============================
   LOAD PROFILE DATA
============================ */
async function loadProfile() {
    try {
        const res = await fetch(`/get-profile?uh_id=${uh_id}`);
        const data = await res.json();

        if (data.user) {
            document.getElementById("firstName").value = data.user.first_name || "";
            document.getElementById("lastName").value = data.user.last_name || "";
            document.getElementById("email").value = data.user.email || "";
            document.getElementById("linkedin").value = data.user.linkedin || "";

            const points = data.user.memberPoints ?? 0;
            document.getElementById("pointsDisplay").innerHTML = 
                `<i class="fa-solid fa-star"></i> SASE Points: ${points}`;
        }
    } catch (err) {
        console.error("❌ Error loading profile:", err);
    }
}

async function saveProfile() {
    const profileData = {
        uh_id,
        first_name: document.getElementById("firstName").value.trim(),
        last_name: document.getElementById("lastName").value.trim(),
        email: document.getElementById("email").value.trim(),
        linkedin: document.getElementById("linkedin").value.trim()
    };

    try {
        const res = await fetch("/update-profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(profileData)
        });

        const data = await res.json();
        alert(data.message || "Profile updated successfully!");
    } catch (err) {
        console.error("❌ Error saving profile:", err);
    }
}

/* ============================
   LOAD SAVED RESOURCES
============================ */
async function loadSavedInternships() {
    const list = document.getElementById("savedInternships");
    try {
        const res = await fetch(`/saved-internships/${uh_id}`);
        const internships = await res.json();

        if (!internships.length) {
            list.innerHTML = "<li class='empty-msg'>No internships saved yet.</li>";
            return;
        }

        list.innerHTML = internships.map(i => `
            <li class="resource-item">
                <img src="${i.company_img || 'images/saselogo.webp'}" class="item-avatar" alt="Company Logo">
                <div class="item-info">
                    <strong>${i.internship_title || i.title}</strong><br>
                    <p>${i.company}</p>
                    <span class="status-badge">${i.status || 'Saved'}</span>
                </div>
                <button class="bookmark-unsave-btn" onclick="unsaveInternship(${i.id})">
                    <i class="fa-solid fa-bookmark"></i>
                </button>
            </li>
        `).join("");
    } catch (err) {
        console.error("❌ Error loading internships:", err);
    }
}

async function loadSavedProfessors() {
    const list = document.getElementById("savedProfessors");
    try {
        const res = await fetch(`/saved-professors/${uh_id}`);
        const profs = await res.json();

        if (!profs.length) {
            list.innerHTML = "<li class='empty-msg'>No professors saved yet.</li>";
            return;
        }

        list.innerHTML = profs.map(p => `
            <li class="resource-item">
                <img src="${p.profile_pic_url || 'images/saselogo.webp'}" class="item-avatar" alt="Professor">
                <div class="item-info">
                    <strong>${p.professor_name}</strong><br>
                    <p>${p.email || 'No email listed'}</p>
                    <div class="item-detail">
                        <span class="item-detail-label">Bio:</span> ${p.description || "No description provided."}
                    </div>
                </div>
                <button class="bookmark-unsave-btn" onclick="unsaveProfessor(${p.id})">
                    <i class="fa-solid fa-bookmark"></i>
                </button>
            </li>
        `).join("");
    } catch (err) {
        console.error("❌ Error loading professors:", err);
    }
}

async function loadSavedAlumni() {
    const list = document.getElementById("savedAlumni");
    try {
        const res = await fetch(`/saved-alumni/${uh_id}`);
        const alumni = await res.json();

        if (!alumni.length) {
            list.innerHTML = "<li class='empty-msg'>No alumni saved yet.</li>";
            return;
        }

        list.innerHTML = alumni.map(a => `
            <li class="resource-item">
                <img src="${a.profile_pic || 'images/saselogo.webp'}" class="item-avatar" alt="Alumni">
                <div class="item-info">
                    <strong>${a.full_name}</strong><br>
                    <p>${a.role_title || ''} @ ${a.company || 'Unknown Company'}</p>
                    <div class="item-detail">
                        <span class="item-detail-label">Industries:</span> ${a.industries || "None listed"}
                    </div>
                </div>
                <button class="bookmark-unsave-btn" onclick="unsaveAlumni(${a.id})">
                    <i class="fa-solid fa-bookmark"></i>
                </button>
            </li>
        `).join("");
    } catch (err) {
        console.error("❌ Error loading alumni:", err);
    }
}

/* ============================
   UNSAVE ACTIONS
============================ */
async function unsaveInternship(id) {
    if (!confirm("Are you sure you want to unsave this internship?")) return;
    try {
        await fetch("/saved-internships/remove", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ uh_id, internship_id: id })
        });
        loadSavedInternships();
    } catch (err) {
        console.error("❌ Error unsaving internship:", err);
    }
}

async function unsaveProfessor(id) {
    if (!confirm("Are you sure you want to unsave this professor?")) return;
    try {
        await fetch("/saved-professors/remove", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ uh_id, professor_id: id })
        });
        loadSavedProfessors();
    } catch (err) {
        console.error("❌ Error unsaving professor:", err);
    }
}

async function unsaveAlumni(id) {
    if (!confirm("Unsave this alumni?")) return;
    try {
        await fetch("/saved-alumni/remove", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ uh_id, alumni_id: id })
        });
        loadSavedAlumni();
    } catch (err) {
        console.error("❌ Error unsaving alumni:", err);
    }
}

/* ============================
   GLOBAL UTILITIES
============================ */
function logout() {
    localStorage.clear();
    window.location.href = "login.html";
}