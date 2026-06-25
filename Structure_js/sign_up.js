document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    const msgDiv = document.getElementById('responseMsg');
    
    submitBtn.disabled = true;
    submitBtn.innerText = "Creating Account...";
    
    const name = document.getElementById('userName').value.trim();
    const email = document.getElementById('userEmail').value.trim();
    const phone = document.getElementById('userPhone').value.trim();
    const password = document.getElementById('userPassword').value;
    const role = document.getElementById('userRole').value;

    // 🔥 These MUST be defined before using them
    const question = document.getElementById('signUpQuestion').value;
    const answer = document.getElementById('signUpAnswer').value.trim().toLowerCase();

    msgDiv.style.display = "block";

    try {
        const res = await fetch("http://localhost:4000/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                full_name: name,
                email,
                phone,
                password,
                role,
                security_question: question,
                security_answer: answer
            })
        });

        const data = await res.json();

        if (!res.ok) {
            msgDiv.style.backgroundColor = "rgba(211, 47, 47, 0.08)";
            msgDiv.style.color = "#d32f2f";
            msgDiv.innerText = data.message || "Registration failed.";
            submitBtn.disabled = false;
            submitBtn.innerText = "Sign Up";
            return;
        }

        msgDiv.style.backgroundColor = "rgba(46, 125, 50, 0.08)";
        msgDiv.style.color = "#2e7d32";
        msgDiv.innerText = "Account successfully registered! Going to login screen...";

        setTimeout(() => { 
            window.location.href = './login.html'; 
        }, 2000);

    } catch (err) {
        console.error(err);
        msgDiv.style.backgroundColor = "rgba(211, 47, 47, 0.08)";
        msgDiv.style.color = "#d32f2f";
        msgDiv.innerText = "Server error. Please try again.";
        submitBtn.disabled = false;
        submitBtn.innerText = "Sign Up";
    }
});
