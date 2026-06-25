// STEP 1 — Load Security Question
document.getElementById('loadQuestionBtn').addEventListener('click', async () => {
    const email = document.getElementById('recoveryEmailInput').value.trim();
    const msgDiv = document.getElementById('passwordRecoveryMsg');

    try {
        const res = await fetch("http://localhost:4000/api/auth/recover/start", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });

        const data = await res.json();
        msgDiv.style.display = "block";

        if (!res.ok) {
            msgDiv.style.backgroundColor = "rgba(211,47,47,0.08)";
            msgDiv.style.color = "#d32f2f";
            msgDiv.innerText = data.message;
            return;
        }

        sessionStorage.setItem("recoveryUserId", data.user_id);

        msgDiv.style.backgroundColor = "rgba(46,125,50,0.08)";
        msgDiv.style.color = "#2e7d32";
        msgDiv.innerText = "Account found! Answer the question below.";

        document.getElementById('displayedPasswordQuestion').innerText = data.security_question;

        document.getElementById('stepEmail').style.display = "none";
        document.getElementById('stepQuestion').style.display = "block";

    } catch (err) {
        console.error(err);
    }
});


// STEP 2 — Verify Answer
document.getElementById('submitPasswordRecoveryBtn').addEventListener('click', async () => {
    const answer = document.getElementById('passwordAnswerInput').value.trim().toLowerCase();
    const msgDiv = document.getElementById('passwordRecoveryMsg');
    const user_id = sessionStorage.getItem("recoveryUserId");

    try {
        const res = await fetch("http://localhost:4000/api/auth/recover/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id, answer })
        });

        const data = await res.json();

        if (!res.ok) {
            msgDiv.style.backgroundColor = "rgba(211,47,47,0.08)";
            msgDiv.style.color = "#d32f2f";
            msgDiv.innerText = data.message;
            return;
        }

        sessionStorage.setItem("resetToken", data.resetToken);

        msgDiv.style.backgroundColor = "#e0f2fe";
        msgDiv.style.color = "#0369a1";
        msgDiv.innerText = "Correct answer! Enter your new password.";

        document.getElementById('stepQuestion').style.display = "none";
        document.getElementById('stepReset').style.display = "block";

    } catch (err) {
        console.error(err);
    }
});


// STEP 3 — Reset Password
document.getElementById('resetPasswordBtn').addEventListener('click', async () => {
    const newPassword = document.getElementById('newPasswordInput').value;
    const resetToken = sessionStorage.getItem("resetToken");
    const msgDiv = document.getElementById('passwordRecoveryMsg');

    try {
        const res = await fetch("http://localhost:4000/api/auth/recover/reset", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ resetToken, new_password: newPassword })
        });

        const data = await res.json();

        if (!res.ok) {
            msgDiv.style.backgroundColor = "rgba(211,47,47,0.08)";
            msgDiv.style.color = "#d32f2f";
            msgDiv.innerText = data.message;
            return;
        }

        msgDiv.style.backgroundColor = "rgba(46,125,50,0.08)";
        msgDiv.style.color = "#2e7d32";
        msgDiv.innerText = "Password reset successfully! Redirecting...";

        setTimeout(() => {
            window.location.href = "login.html";
        }, 2000);

    } catch (err) {
        console.error(err);
    }
});
