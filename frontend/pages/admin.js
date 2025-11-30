

  const isAdmin = localStorage.getItem("admin");
  if (isAdmin !== "1") {
    alert("Access denied. Admins only.");
    window.location.href = "../index.html";
  }



  /* ========================= */
  /*       MENU / LOGOUT       */
  /* ========================= */

  let editProfID = null;
  let deleteProfID = null;
  let editAlumniID = null;
  let deleteAlumniID = null;

  function toggleMenu() {
    document.getElementById("dropdownMenu").classList.toggle("show");
  }

  window.onclick = function(event) {
    if (!event.target.matches('.hamburger')) {
      const menu = document.getElementById("dropdownMenu");
      if (menu) {
        menu.classList.remove("show");
      }
    }
  };

  function logout() {
    localStorage.clear();
    window.location.href = "../login.html";
  }

  function openModal(id) {
    document.getElementById(id).style.display = "flex";
    if (id === "alumniModal") {
      loadAlumniMajors();
      loadAlumniGoals();
    }
    if (id === "profModal") loadMajors();
  }

  function closeModal(id) {
    document.getElementById(id).style.display = "none";
  }

  /* ========================= */
  /*        LOAD ALUMNI        */
  /* ========================= */

  async function loadAlumni() {
    const res = await fetch("/alumni/all");
    const data = await res.json();

    let html = `
      <h2 style="color:#70c041; text-align:center;">All Alumni</h2>
      <table>
      <tr>
        <th>ID</th>
        <th>Name</th>
        <th>Company</th>
        <th>Role</th>
        <th>Email</th>
        <th>LinkedIn</th>
        <th>Other Link</th>
        <th>Industries</th>
        <th>Description</th>
        <th>Majors</th>
        <th>Goals</th>
        <th>Profile Pic</th>
        <th>Company Img</th>
        <th>Actions</th>
      </tr>
    `;

    data.forEach(a => {
      html += `
        <tr>
          <td>${a.id}</td>
          <td>${a.full_name}</td>
          <td>${a.company}</td>
          <td>${a.role_title}</td>
          <td>${a.email}</td>
          <td>${a.linkedin}</td>
          <td>${a.other_link}</td>
          <td>${a.industries}</td>
          <td>${a.description || a.alumni_description || a.desc || ""}</td>
          <td>${a.majors || "None"}</td>
          <td>${a.goals || "None"}</td>
          <td>${a.profile_pic ? `<img src="${a.profile_pic}" style="width:60px;height:60px;object-fit:cover;border-radius:6px;">` : "None"}</td>
          <td>${a.company_img ? `<img src="${a.company_img}" style="width:60px;height:60px;object-fit:cover;border-radius:6px;">` : "None"}</td>
          <td style="position:relative;">
            <button class="kebab-btn" onclick="toggleKebabMenu(event, 'al-${a.id}')">⋮</button>
            <div id="kebab-al-${a.id}" class="kebab-menu">
                <div onclick="openEditAlumni(${a.id}, \`${a.full_name}\`, \`${a.company}\`, \`${a.role_title}\`, \`${a.email}\`, \`${a.linkedin}\`, \`${a.other_link}\`, \`${a.industries}\`, \`${a.description || ""}\`, \`${a.majors || ""}\`, \`${a.goals || ""}\`)">                Edit
              </div>
              <div onclick="openDeleteAlumni(${a.id})">Delete</div>
            </div>
          </td>
        </tr>
      `;
    });

    html += "</table>";
    document.getElementById("dataSection").innerHTML = html;
  }

  /* ========================= */
  /*     ADD ALUMNI (POST)     */
  /* ========================= */

  async function saveAlumni() {
    const formData = new FormData();

    formData.append("full_name", document.getElementById("alumni_fullname").value);
    formData.append("company", document.getElementById("alumni_company").value);
    formData.append("role_title", document.getElementById("alumni_role").value);
    formData.append("email", document.getElementById("alumni_email").value);
    formData.append("linkedin", document.getElementById("alumni_linkedin").value);
    formData.append("other_link", document.getElementById("alumni_other").value);
    formData.append("industries", document.getElementById("alumni_tags").value);
    formData.append("description", document.getElementById("alumni_description").value);
    formData.append("major_ids", document.getElementById("alumni_selected_major_ids").value);
    formData.append("goal_ids", document.getElementById("alumni_selected_goal_ids").value);

    if (document.getElementById("alumni_profile_pic").files[0]) {
      formData.append("profile_pic", document.getElementById("alumni_profile_pic").files[0]);
    }

    if (document.getElementById("alumni_company_img").files[0]) {
      formData.append("company_img", document.getElementById("alumni_company_img").files[0]);
    }

    const res = await fetch("/alumni/add", {
      method: "POST",
      body: formData
    });

    const data = await res.json();
    alert(data.message);
    closeModal("alumniModal");
    loadAlumni();
  }

  /* ========================= */
  /*     EDIT ALUMNI (OPEN)    */
  /* ========================= */

  function openEditAlumni(id, name, company, role, email, linkedin, other, tags, description, majors, goals) {
    editAlumniID = id;

    document.getElementById("edit_alumni_fullname").value = name;
    document.getElementById("edit_alumni_company").value = company;
    document.getElementById("edit_alumni_role").value = role;
    document.getElementById("edit_alumni_email").value = email;
    document.getElementById("edit_alumni_linkedin").value = linkedin;
    document.getElementById("edit_alumni_other").value = other;
    document.getElementById("edit_alumni_tags").value = tags;
    document.getElementById("edit_alumni_description").value = description;
    document.getElementById("edit_alumni_major_search").value = majors;
    document.getElementById("edit_alumni_goal_search").value = goals;

    document.getElementById("edit_alumni_company_img").value = "";
    document.getElementById("edit_alumni_profile_pic").value = "";

    loadAlumniMajorsEdit(majors);
    loadAlumniGoalsEdit(goals);
    openModal("editAlumniModal");
  }

  /* ========================= */
  /*   UPDATE ALUMNI (POST)    */
  /* ========================= */

  async function saveAlumniUpdate() {
    const formData = new FormData();

    formData.append("id", editAlumniID);
    formData.append("full_name", document.getElementById("edit_alumni_fullname").value);
    formData.append("company", document.getElementById("edit_alumni_company").value);
    formData.append("role_title", document.getElementById("edit_alumni_role").value);
    formData.append("email", document.getElementById("edit_alumni_email").value);
    formData.append("linkedin", document.getElementById("edit_alumni_linkedin").value);
    formData.append("other_link", document.getElementById("edit_alumni_other").value);
    formData.append("industries", document.getElementById("edit_alumni_tags").value);
    formData.append("description", document.getElementById("edit_alumni_description").value);
    formData.append("major_ids", document.getElementById("edit_alumni_selected_major_ids").value);
    formData.append("goal_ids", document.getElementById("edit_alumni_selected_goal_ids").value);

    if (document.getElementById("edit_alumni_profile_pic").files[0]) {
      formData.append("profile_pic", document.getElementById("edit_alumni_profile_pic").files[0]);
    }

    if (document.getElementById("edit_alumni_company_img").files[0]) {
      formData.append("company_img", document.getElementById("edit_alumni_company_img").files[0]);
    }

    const res = await fetch("/alumni/update", {
      method: "POST",
      body: formData
    });

    const data = await res.json();
    alert(data.message);
    closeModal("editAlumniModal");
    loadAlumni();
  }

  /* ========================= */
  /*   DELETE ALUMNI (MODAL)   */
  /* ========================= */

  function openDeleteAlumni(id) {
    deleteAlumniID = id;
    openModal("deleteAlumniModal");
  }

  async function confirmDeleteAlumni() {
    const res = await fetch("/alumni/delete/" + deleteAlumniID, {
      method: "DELETE"
    });

    const data = await res.json();
    alert(data.message);
    closeModal("deleteAlumniModal");
    loadAlumni();
  }

  /* ========================= */
  /*   LOAD PROFESSORS         */
  /* ========================= */

  async function loadProfessors() {
    const res = await fetch("/professors/all");
    const data = await res.json();

    let html = `
      <h2 style="color:#70c041; text-align:center;">All Professors</h2>
      <table>
      <tr>
        <th>ID</th>
        <th>Name</th>
        <th>Major(s)</th>
        <th>Email</th>
        <th>University</th>
        <th>Description</th>
        <th>Profile Pic</th>
        <th>Actions</th>
      </tr>
    `;

    data.forEach(p => {
      const descriptionSafe = p.description || "";
      const majorsSafe = p.majors || "";
      const nameSafe = p.professor_name || "";
      const emailSafe = p.email || "";
      const universitySafe = p.university || "";

      html += `
        <tr>
          <td>${p.id}</td>
          <td>${p.professor_name}</td>
          <td>${p.majors || "None"}</td>
          <td>${p.email}</td>
          <td>${p.university}</td>
          <td>${p.description}</td>
          <td>
            ${p.profile_pic_url
              ? `<img src="${p.profile_pic_url}" style="width:60px; height:60px; object-fit:cover; border-radius:6px;">`
              : "No Image"}
          </td>
          <td style="position:relative;">
            <button class="kebab-btn" onclick="toggleKebabMenu(event, ${p.id})">⋮</button>
            <div id="kebab-${p.id}" class="kebab-menu">
              <div onclick="openEditProfessor(${p.id}, \`${nameSafe}\`, \`${majorsSafe}\`, \`${emailSafe}\`, \`${universitySafe}\`, \`${descriptionSafe}\`)">
                Edit
              </div>
              <div onclick="openDeleteProfessor(${p.id})">Delete</div>
            </div>
          </td>
        </tr>
      `;
    });

    html += "</table>";
    document.getElementById("dataSection").innerHTML = html;
  }

  function toggleKebabMenu(event, id) {
    event.stopPropagation();

    document.querySelectorAll(".kebab-menu").forEach(m => {
      m.style.display = "none";
    });

    const menu = document.getElementById("kebab-" + id);
    if (menu) {
      menu.style.display = "block";
    }
  }

  document.body.addEventListener("click", () => {
    document.querySelectorAll(".kebab-menu").forEach(m => {
      m.style.display = "none";
    });
  });

  /* ========================= */
  /*   MAJORS FOR PROFESSORS   */
  /* ========================= */

  let majorsCache = [];
  let selectedMajors = [];

  async function loadMajors() {
    const res = await fetch("/majors/all");
    majorsCache = await res.json();
    renderMajorDropdown(majorsCache);
  }

  function toggleMajorDropdown() {
    const list = document.getElementById("major_list");
    list.style.display = list.style.display === "block" ? "none" : "block";
  }

  function filterMajors() {
    const query = document.getElementById("major_search").value.toLowerCase();
    const filtered = majorsCache.filter(m =>
      m.major_name.toLowerCase().includes(query)
    );
    renderMajorDropdown(filtered);
  }

  function renderMajorDropdown(list) {
    const container = document.getElementById("major_list");
    container.innerHTML = "";
    container.style.display = "block";

    list.forEach(m => {
      const item = document.createElement("div");
      item.className = "dropdown-item";

      if (selectedMajors.find(x => x.id === m.id)) {
        item.classList.add("selected");
      }

      const nameSpan = document.createElement("span");
      nameSpan.textContent = m.major_name.trim();

      item.onclick = function() {
        toggleMajorSelection(m);
      };

      item.appendChild(nameSpan);
      container.appendChild(item);
    });
  }

  function toggleMajorSelection(major) {
    const exists = selectedMajors.find(m => m.id === major.id);

    if (exists) {
      selectedMajors = selectedMajors.filter(m => m.id !== major.id);
    } else {
      selectedMajors.push(major);
    }

    updateMajorTags();
    renderMajorDropdown(majorsCache);
  }

  function updateMajorTags() {
    const tagContainer = document.getElementById("major_tags");
    tagContainer.innerHTML = "";

    selectedMajors.forEach(m => {
      const tag = document.createElement("div");
      tag.className = "major-tag";
      tag.innerHTML = `${m.major_name} <span onclick="removeMajor(${m.id})">×</span>`;
      tagContainer.appendChild(tag);
    });

    document.getElementById("selected_major_ids").value =
      selectedMajors.map(m => m.id).join(",");
  }

  function removeMajor(id) {
    selectedMajors = selectedMajors.filter(m => m.id !== id);
    updateMajorTags();
    renderMajorDropdown(majorsCache);
  }

  /* ========================= */
  /*     SAVE PROFESSOR        */
  /* ========================= */

  async function saveProfessor() {
    const name = document.getElementById("prof_name").value;
    const email = document.getElementById("prof_email").value;
    const university = document.getElementById("prof_university").value;
    const description = document.getElementById("prof_desc").value;
    const major_ids = selectedMajors.map(m => m.id).join(",");
    const picFile = document.getElementById("prof_pic").files[0];

    const formData = new FormData();
    formData.append("professor_name", name);
    formData.append("email", email);
    formData.append("university", university);
    formData.append("description", description);
    formData.append("major_ids", major_ids);

    if (picFile) {
      formData.append("profile_pic", picFile);
    }

    const res = await fetch("/professors/add", {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    alert(data.message);
    closeModal("profModal");
    loadProfessors();
  }

  /* ========================= */
  /*       EDIT PROFESSOR      */
  /* ========================= */

  let editMajorsCache = [];
  let editSelectedMajors = [];

  function toggleMajorDropdownEdit() {
    const list = document.getElementById("edit_major_list");
    list.style.display = list.style.display === "block" ? "none" : "block";
  }

  async function loadMajorsEdit(initialMajorNames) {
    const res = await fetch("/majors/all");
    editMajorsCache = await res.json();

    editSelectedMajors = [];

    if (initialMajorNames) {
      const names = initialMajorNames
        .split(",")
        .map(s => s.trim())
        .filter(s => s.length > 0);

      names.forEach(n => {
        const match = editMajorsCache.find(
          m => m.major_name.trim().toLowerCase() === n.toLowerCase()
        );
        if (match && !editSelectedMajors.find(x => x.id === match.id)) {
          editSelectedMajors.push(match);
        }
      });
    }

    renderMajorDropdownEdit(editMajorsCache);
    updateEditMajorTags();
  }

  function filterMajorsEdit() {
    const query = document.getElementById("edit_major_search").value.toLowerCase();
    const filtered = editMajorsCache.filter(m =>
      m.major_name.toLowerCase().includes(query)
    );
    renderMajorDropdownEdit(filtered);
  }

  function renderMajorDropdownEdit(list) {
    const container = document.getElementById("edit_major_list");
    container.innerHTML = "";
    container.style.display = "block";

    list.forEach(m => {
      const item = document.createElement("div");
      item.className = "dropdown-item";

      if (editSelectedMajors.find(x => x.id === m.id)) {
        item.classList.add("selected");
      }

      const nameSpan = document.createElement("span");
      nameSpan.textContent = m.major_name.trim();

      item.onclick = function() {
        toggleEditMajor(m);
      };

      item.appendChild(nameSpan);
      container.appendChild(item);
    });
  }

  function toggleEditMajor(major) {
    const exists = editSelectedMajors.find(m => m.id === major.id);

    if (exists) {
      editSelectedMajors = editSelectedMajors.filter(m => m.id !== major.id);
    } else {
      editSelectedMajors.push(major);
    }

    updateEditMajorTags();
    renderMajorDropdownEdit(editMajorsCache);
  }

  function updateEditMajorTags() {
    const tagContainer = document.getElementById("edit_major_tags");
    tagContainer.innerHTML = "";

    editSelectedMajors.forEach(m => {
      const tag = document.createElement("div");
      tag.className = "major-tag";
      tag.innerHTML = `${m.major_name} <span onclick="removeEditMajor(${m.id})">×</span>`;
      tagContainer.appendChild(tag);
    });

    document.getElementById("edit_selected_major_ids").value =
      editSelectedMajors.map(m => m.id).join(",");
  }

  function removeEditMajor(id) {
    editSelectedMajors = editSelectedMajors.filter(m => m.id !== id);
    updateEditMajorTags();
    renderMajorDropdownEdit(editMajorsCache);
  }

  /* ========================= */
  /*   OPEN EDIT PROFESSOR     */
  /* ========================= */

  async function openEditProfessor(id, name, majorNames, email, university, description) {
    editProfID = id;

    document.getElementById("edit_prof_name").value = name;
    document.getElementById("edit_prof_email").value = email;
    document.getElementById("edit_prof_university").value = university;
    document.getElementById("edit_prof_desc").value = description;

    await loadMajorsEdit(majorNames);

    document.getElementById("edit_prof_pic").value = "";
    openModal("editProfModal");
  }

  /* ========================= */
  /*   SAVE PROFESSOR UPDATE   */
  /* ========================= */

  async function saveProfessorUpdate() {
    const name = document.getElementById("edit_prof_name").value;
    const email = document.getElementById("edit_prof_email").value;
    const university = document.getElementById("edit_prof_university").value;
    const description = document.getElementById("edit_prof_desc").value;
    const major_ids = editSelectedMajors.map(m => m.id).join(",");
    const picFile = document.getElementById("edit_prof_pic").files[0];

    const formData = new FormData();
    formData.append("id", editProfID);
    formData.append("professor_name", name);
    formData.append("email", email);
    formData.append("university", university);
    formData.append("description", description);
    formData.append("major_ids", major_ids);

    if (picFile) {
      formData.append("profile_pic", picFile);
    }

    const res = await fetch("/professors/update", {
      method: "POST",
      body: formData
    });

    const data = await res.json();
    alert(data.message);

    closeModal("editProfModal");
    loadProfessors();
  }

  /* ========================= */
  /*   DELETE PROFESSOR MODAL  */
  /* ========================= */

  function openDeleteProfessor(id) {
    deleteProfID = id;
    openModal("deleteProfModal");
  }

  async function confirmDeleteProfessor() {
    const res = await fetch("/professors/delete/" + deleteProfID, {
      method: "DELETE"
    });

    const data = await res.json();

    alert(data.message);
    closeModal("deleteProfModal");
    loadProfessors();
  }



  /* ============================
        ALUMNI MAJOR SELECT
     ============================ */

  let alumniMajorsCache = [];
  let alumniSelectedMajors = [];

  async function loadAlumniMajors() {
    const res = await fetch("/majors/all");
    alumniMajorsCache = await res.json();
    renderAlumniMajorDropdown(alumniMajorsCache);
  }

  function toggleAlumniMajorDropdown() {
    const list = document.getElementById("alumni_major_list");
    list.style.display = list.style.display === "block" ? "none" : "block";
  }

  function filterAlumniMajors() {
    const query = document.getElementById("alumni_major_search").value.toLowerCase();
    const filtered = alumniMajorsCache.filter(m =>
      m.major_name.toLowerCase().includes(query)
    );
    renderAlumniMajorDropdown(filtered);
  }

  function renderAlumniMajorDropdown(list) {
    const container = document.getElementById("alumni_major_list");
    container.innerHTML = "";
    container.style.display = "block";

    list.forEach(m => {
      const item = document.createElement("div");
      item.className = "dropdown-item";

      if (alumniSelectedMajors.find(x => x.id === m.id)) {
        item.classList.add("selected");
      }

      const span = document.createElement("span");
      span.textContent = m.major_name;

      item.onclick = () => toggleAlumniMajor(m);

      item.appendChild(span);
      container.appendChild(item);
    });
  }

  function toggleAlumniMajor(major) {
    const exists = alumniSelectedMajors.find(m => m.id === major.id);

    if (exists) {
      alumniSelectedMajors = alumniSelectedMajors.filter(m => m.id !== major.id);
    } else {
      alumniSelectedMajors.push(major);
    }

    updateAlumniMajorTags();
    renderAlumniMajorDropdown(alumniMajorsCache);
  }

  function updateAlumniMajorTags() {
    const box = document.getElementById("alumni_major_tags");
    box.innerHTML = "";

    alumniSelectedMajors.forEach(m => {
      const tag = document.createElement("div");
      tag.className = "major-tag";
      tag.innerHTML = `${m.major_name} <span onclick="removeAlumniMajor(${m.id})">×</span>`;
      box.appendChild(tag);
    });

    document.getElementById("alumni_selected_major_ids").value =
      alumniSelectedMajors.map(m => m.id).join(",");
  }

  function removeAlumniMajor(id) {
    alumniSelectedMajors = alumniSelectedMajors.filter(m => m.id !== id);
    updateAlumniMajorTags();
    renderAlumniMajorDropdown(alumniMajorsCache);
  }

  /* ====== EDIT VERSION ====== */

  // ===== ALUMNI GOAL SELECT =====

  let alumniGoalsCache = [];
  let alumniSelectedGoals = [];

  async function loadAlumniGoals() {
    const res = await fetch("/goals/all");
    alumniGoalsCache = await res.json();
    renderAlumniGoalDropdown(alumniGoalsCache);
  }

  function toggleAlumniGoalDropdown() {
    const list = document.getElementById("alumni_goal_list");
    list.style.display = list.style.display === "block" ? "none" : "block";
  }

  function filterAlumniGoals() {
    const q = document.getElementById("alumni_goal_search").value.toLowerCase();
    const filtered = alumniGoalsCache.filter(g =>
      g.goal_name.toLowerCase().includes(q)
    );
    renderAlumniGoalDropdown(filtered);
  }

  function renderAlumniGoalDropdown(list) {
    const container = document.getElementById("alumni_goal_list");
    container.innerHTML = "";
    container.style.display = "block";

    list.forEach(g => {
      const item = document.createElement("div");
      item.className = "dropdown-item";

      if (alumniSelectedGoals.find(x => x.id === g.id)) {
        item.classList.add("selected");
      }

      item.onclick = () => toggleAlumniGoal(g);
      item.textContent = g.goal_name;

      container.appendChild(item);
    });
  }

  function toggleAlumniGoal(goal) {
    const exists = alumniSelectedGoals.find(g => g.id === goal.id);

    if (exists) {
      alumniSelectedGoals = alumniSelectedGoals.filter(g => g.id !== goal.id);
    } else {
      alumniSelectedGoals.push(goal);
    }

    updateAlumniGoalTags();
    renderAlumniGoalDropdown(alumniGoalsCache);
  }

  function updateAlumniGoalTags() {
    const box = document.getElementById("alumni_goal_tags");
    box.innerHTML = "";

    alumniSelectedGoals.forEach(g => {
      const tag = document.createElement("div");
      tag.className = "major-tag";
      tag.innerHTML = `${g.goal_name} <span onclick="removeAlumniGoal(${g.id})">×</span>`;
      box.appendChild(tag);
    });

    document.getElementById("alumni_selected_goal_ids").value =
      alumniSelectedGoals.map(g => g.id).join(",");
  }

  function removeAlumniGoal(id) {
    alumniSelectedGoals = alumniSelectedGoals.filter(g => g.id !== id);
    updateAlumniGoalTags();
    renderAlumniGoalDropdown(alumniGoalsCache);
  }

  // ===== EDIT VERSION =====

  let editAlumniGoalsCache = [];
  let editAlumniSelectedGoals = [];

  async function loadAlumniGoalsEdit(initialGoals) {
    const res = await fetch("/goals/all");
    editAlumniGoalsCache = await res.json();

    editAlumniSelectedGoals = [];

    if (initialGoals) {
      const names = initialGoals.split(",").map(s => s.trim());
      names.forEach(n => {
        const match = editAlumniGoalsCache.find(
          g => g.goal_name.trim().toLowerCase() === n.toLowerCase()
        );
        if (match && !editAlumniSelectedGoals.find(x => x.id === match.id)) {
          editAlumniSelectedGoals.push(match);
        }
      });
    }
      document.getElementById("edit_alumni_goal_search").value =
      editAlumniSelectedGoals.map(g => g.goal_name).join(", ");


    renderAlumniGoalDropdownEdit(editAlumniGoalsCache);
    updateAlumniGoalTagsEdit();
  }

  function toggleAlumniGoalDropdownEdit() {
    const list = document.getElementById("edit_alumni_goal_list");
    list.style.display = list.style.display === "block" ? "none" : "block";
  }

  function filterAlumniGoalsEdit() {
    const q = document.getElementById("edit_alumni_goal_search").value.toLowerCase();
    const filtered = editAlumniGoalsCache.filter(g =>
      g.goal_name.toLowerCase().includes(q)
    );
    renderAlumniGoalDropdownEdit(filtered);
  }

  function renderAlumniGoalDropdownEdit(list) {
    const container = document.getElementById("edit_alumni_goal_list");
    container.innerHTML = "";
    container.style.display = "block";

    list.forEach(g => {
      const item = document.createElement("div");
      item.className = "dropdown-item";

      if (editAlumniSelectedGoals.find(x => x.id === g.id)) {
        item.classList.add("selected");
      }

      item.onclick = () => toggleEditAlumniGoal(g);
      item.textContent = g.goal_name;

      container.appendChild(item);
    });
  }

  function toggleEditAlumniGoal(goal) {
    const exists = editAlumniSelectedGoals.find(g => g.id === goal.id);

    if (exists) {
      editAlumniSelectedGoals = editAlumniSelectedGoals.filter(g => g.id !== goal.id);
    } else {
      editAlumniSelectedGoals.push(goal);
    }

    updateAlumniGoalTagsEdit();
    renderAlumniGoalDropdownEdit(editAlumniGoalsCache);
  }

  function updateAlumniGoalTagsEdit() {
    const box = document.getElementById("edit_alumni_goal_tags");
    box.innerHTML = "";

     document.getElementById("edit_alumni_goal_search").value =
    editAlumniSelectedGoals.map(g => g.goal_name).join(", ");


    editAlumniSelectedGoals.forEach(g => {
      const tag = document.createElement("div");
      tag.className = "major-tag";
      tag.innerHTML = `${g.goal_name} <span onclick="removeEditAlumniGoal(${g.id})">×</span>`;
      box.appendChild(tag);
    });

    document.getElementById("edit_alumni_selected_goal_ids").value =
      editAlumniSelectedGoals.map(g => g.id).join(",");
  }

  function removeEditAlumniGoal(id) {
    editAlumniSelectedGoals = editAlumniSelectedGoals.filter(g => g.id !== id);
    updateAlumniGoalTagsEdit();
    renderAlumniGoalDropdownEdit(editAlumniGoalsCache);
  }

  let editAlumniMajorsCache = [];
  let editAlumniSelectedMajors = [];

  async function loadAlumniMajorsEdit(initialMajors) {
      const res = await fetch("/majors/all");
      editAlumniMajorsCache = await res.json();

      editAlumniSelectedMajors = [];

      if (initialMajors) {
          const names = initialMajors.split(",").map(s => s.trim());
          names.forEach(n => {
              const match = editAlumniMajorsCache.find(
                  m => m.major_name.trim().toLowerCase() === n.toLowerCase()
              );
              if (match) editAlumniSelectedMajors.push(match);
          });
      }

      document.getElementById("edit_alumni_major_search").value =
          editAlumniSelectedMajors.map(m => m.major_name).join(", ");

      renderAlumniMajorDropdownEdit(editAlumniMajorsCache);
      updateAlumniMajorTagsEdit();
  }


  function toggleAlumniMajorDropdownEdit() {
    const list = document.getElementById("edit_alumni_major_list");
    list.style.display = list.style.display === "block" ? "none" : "block";
  }

  function filterAlumniMajorsEdit() {
    const q = document.getElementById("edit_alumni_major_search").value.toLowerCase();
    const filtered = editAlumniMajorsCache.filter(m =>
      m.major_name.toLowerCase().includes(q)
    );
    renderAlumniMajorDropdownEdit(filtered);
  }

  function renderAlumniMajorDropdownEdit(list) {
    const container = document.getElementById("edit_alumni_major_list");
    container.innerHTML = "";
    container.style.display = "block";

    list.forEach(m => {
      const item = document.createElement("div");
      item.className = "dropdown-item";

      if (editAlumniSelectedMajors.find(x => x.id === m.id)) {
        item.classList.add("selected");
      }

      const span = document.createElement("span");
      span.textContent = m.major_name;

      item.onclick = () => toggleEditAlumniMajor(m);

      item.appendChild(span);
      container.appendChild(item);
    });
  }

  function toggleEditAlumniMajor(major) {
    const exists = editAlumniSelectedMajors.find(m => m.id === major.id);

    if (exists) {
      editAlumniSelectedMajors = editAlumniSelectedMajors.filter(m => m.id !== major.id);
    } else {
      editAlumniSelectedMajors.push(major);
    }

    updateAlumniMajorTagsEdit();
    renderAlumniMajorDropdownEdit(editAlumniMajorsCache);
  }

  function updateAlumniMajorTagsEdit() {
    const container = document.getElementById("edit_alumni_major_tags");
    container.innerHTML = "";
    document.getElementById("edit_alumni_major_search").value =
        editAlumniSelectedMajors.map(m => m.major_name).join(", ");

    editAlumniSelectedMajors.forEach(m => {
      const tag = document.createElement("div");
      tag.className = "major-tag";
      tag.innerHTML = `${m.major_name} <span onclick="removeEditAlumniMajor(${m.id})">×</span>`;
      container.appendChild(tag);
    });

    document.getElementById("edit_alumni_selected_major_ids").value =
      editAlumniSelectedMajors.map(m => m.id).join(",");
  }

  function removeEditAlumniMajor(id) {
    editAlumniSelectedMajors = editAlumniSelectedMajors.filter(m => m.id !== id);
    updateAlumniMajorTagsEdit();
    renderAlumniMajorDropdownEdit(editAlumniMajorsCache);
  }

