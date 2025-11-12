async function handleLogin(event) {
    event.preventDefault();

    const uh_id = document.getElementById("login-uhid").value;

    try {
        const res = await fetch("/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ uh_id })
        });

        const data = await res.json();
        alert(data.message);

        if (data.message === "Login successful") {
            window.location.href = "index.html";
        }
    } catch (err) {
        console.error(err);
        alert("Login failed. Please try again.");
    }
}
