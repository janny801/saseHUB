// ---------------------------------------------------------
// LOGIN FUNCTION
// ---------------------------------------------------------
async function handleLogin(event) {
    event.preventDefault();

    const uh_id = document.getElementById("login-uhid").value.trim();

    try {
        const res = await fetch("/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ uh_id })
        });

        const data = await res.json();
        
        if (data.message !== "Login successful") {
            alert(data.message);
            return;
        }

        const user = data.user;

        localStorage.setItem("loggedIn", "true");
        localStorage.setItem("loginTime", Date.now().toString());
        localStorage.setItem("uh_id", user.uh_id);
        localStorage.setItem("admin", user.admin);  // 0 or 1

        localStorage.setItem("first_name", user.first_name || "");
        localStorage.setItem("last_name", user.last_name || "");
        localStorage.setItem("email", user.email || "");
        localStorage.setItem("linkedin", user.linkedin || "");

        window.location.href = "index.html";
        
    } catch (err) {
        console.error("Login error:", err);
        alert("Login failed.");
    }
}

// ---------------------------------------------------------
// SHOW ADMIN BUTTON ON INDEX.HTML
// ---------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    const isAdmin = localStorage.getItem("admin");
    const adminBtn = document.getElementById("adminBtn");

    if (adminBtn) {
        // Updated to 'flex' to match the new sidebar layout styling
        if (isAdmin === "1") {
            adminBtn.style.display = "flex";
        } else {
            adminBtn.style.display = "none";
        }
    }
});

// ---------------------------------------------------------
// LOGOUT FUNCTION
// ---------------------------------------------------------
function logout() {
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("loginTime");
    localStorage.removeItem("admin");
    localStorage.removeItem("uh_id");
    localStorage.removeItem("first_name");
    localStorage.removeItem("last_name");
    localStorage.removeItem("email");
    localStorage.removeItem("linkedin");
    window.location.href = "/login.html";
}

// ---------------------------------------------------------
// LOAD PROFILE DATA (profile.html)
// ---------------------------------------------------------
async function loadProfile() {
    const uh_id = localStorage.getItem("uh_id");
    if (!uh_id) return;

    try {
        const res = await fetch(`/get-profile?uh_id=${uh_id}`);
        const data = await res.json();

        if (data.user) {
            const fName = document.getElementById("profile-first");
            const lName = document.getElementById("profile-last");
            const email = document.getElementById("profile-email");
            const lkd = document.getElementById("profile-linkedin");

            if(fName) fName.value = data.user.first_name || "";
            if(lName) lName.value = data.user.last_name || "";
            if(email) email.value = data.user.email || "";
            if(lkd) lkd.value = data.user.linkedin || "";
        }

    } catch (err) {
        console.error("❌ Error loading profile:", err);
    }
}

// ---------------------------------------------------------
// UPDATE PROFILE (profile.html)
// ---------------------------------------------------------
async function updateProfile(event) {
    event.preventDefault();

    const uh_id = localStorage.getItem("uh_id");

    const first_name = document.getElementById("profile-first").value.trim();
    const last_name = document.getElementById("profile-last").value.trim();
    const email = document.getElementById("profile-email").value.trim();
    const linkedin = document.getElementById("profile-linkedin").value.trim();

    try {
        const res = await fetch("/update-profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                uh_id,
                first_name,
                last_name,
                email,
                linkedin,
            })
        });

        const data = await res.json();
        alert(data.message);

    } catch (err) {
        console.error("❌ Error updating profile:", err);
        alert("Profile update failed.");
    }
}