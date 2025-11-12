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
        alert(data.message);

        if (data.message === "Login successful") {
            // ✅ Store login session info
            localStorage.setItem("loggedIn", "true");
            localStorage.setItem("uh_id", uh_id);

            // ✅ Redirect to dashboard
            window.location.href = "index.html";
        }
    } catch (err) {
        console.error("❌ Error during login:", err);
        alert("Login failed. Please try again.");
    }
}
