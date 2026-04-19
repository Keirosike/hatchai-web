document.getElementById("loginForm").addEventListener("submit", function(e) {
    e.preventDefault();

    let user = document.getElementById("username").value.trim();
    let pass = document.getElementById("password").value.trim();
    let status = document.getElementById("status");

    // Basic validation
    if (!user || !pass) {
        status.textContent = "Please fill all fields";
        status.className = "status error";
        return;
    }

    // 🔥 TEMP demo login (remove when backend ready)
    if (user === "admin" && pass === "1234") {
        status.textContent = "Login successful!";
        status.className = "status success";

        // Redirect (optional)
        setTimeout(() => {
            window.location.href = "/dashboard";
        }, 1000);

    } else {
        status.textContent = "Invalid username or password";
        status.className = "status error";
    }
});