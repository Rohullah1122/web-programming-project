let activeRecoveryUser = null; // keep this for now for your local recovery logic

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const loginSubmitBtn = document.getElementById('loginSubmitBtn');
    const loginMsgDiv = document.getElementById('loginResponseMsg');
    
    loginSubmitBtn.disabled = true;
    loginSubmitBtn.innerText = "Authenticating...";
    
    const emailInput = document.getElementById('loginEmail').value.trim();
    const passwordInput = document.getElementById('loginPassword').value;
    
    loginMsgDiv.style.display = "block";

    try {
        const res = await fetch("http://localhost:4000/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: emailInput,
                password: passwordInput
            })
        });

        const data = await res.json();

        if (!res.ok) {
            loginMsgDiv.style.backgroundColor = "rgba(211, 47, 47, 0.08)";
            loginMsgDiv.style.color = "#d32f2f"; 
            loginMsgDiv.innerText = data.message || "Invalid email address or incorrect password.";
            loginSubmitBtn.disabled = false;
            loginSubmitBtn.innerText = "Log In";
            return;
        }

        // Save token + user in sessionStorage
        sessionStorage.setItem("authToken", data.token);
        sessionStorage.setItem("currentUser", JSON.stringify({
            id: data.user.id,
            name: data.user.full_name,
            email: data.user.email,
            role: data.user.role,
            phone: data.user.phone
        }));

        loginMsgDiv.style.backgroundColor = "rgba(46, 125, 50, 0.08)";
        loginMsgDiv.style.color = "#2e7d32"; 
        loginMsgDiv.innerText = `Login successful! Welcome back, ${data.user.full_name}.`;

        setTimeout(() => {
            if (data.user.role === 'owner') {
                window.location.href = './owner-dashboard.html';
            } else {
                window.location.href = 'browse-workspaces.html';
            }
        }, 1500);

    } catch (err) {
        console.error("Login error:", err);
        loginMsgDiv.style.backgroundColor = "rgba(211, 47, 47, 0.08)";
        loginMsgDiv.style.color = "#d32f2f"; 
        loginMsgDiv.innerText = "Server error. Please try again.";
        loginSubmitBtn.disabled = false;
        loginSubmitBtn.innerText = "Log In";
    }
});
