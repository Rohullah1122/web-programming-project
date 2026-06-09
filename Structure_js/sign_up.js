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
    
    // NEW: Capture security fields
    const question = document.getElementById('signUpQuestion').value;
    const answer = document.getElementById('signUpAnswer').value.trim().toLowerCase();

    let usersArray = JSON.parse(localStorage.getItem('usersData')) || [];
    msgDiv.style.display = "block";

    const userExists = usersArray.find(user => user.email.toLowerCase() === email.toLowerCase());

    if (userExists) {
        msgDiv.style.backgroundColor = "rgba(211, 47, 47, 0.08)";
        msgDiv.style.color = "#d32f2f";
        msgDiv.innerText = "An error occurred: User with this email already exists.";
        
        submitBtn.disabled = false;
        submitBtn.innerText = "Sign Up";
    } else {
        // UPDATED: Bundle security fields into the object
        const newUser = {
            id: "user_" + Date.now(),
            name: name,
            email: email,
            phone: phone,
            password: password,
            role: role,
            securityQuestion: question, // Saving the question text
            securityAnswer: answer      // Saving the answer (normalized to lowercase)
        };

        usersArray.push(newUser);
        localStorage.setItem('usersData', JSON.stringify(usersArray));

        msgDiv.style.backgroundColor = "rgba(46, 125, 50, 0.08)";
        msgDiv.style.color = "#2e7d32";
        msgDiv.innerText = "Account successfully registered! Going to login screen...";
        
        setTimeout(() => { 
            window.location.href = './login.html'; 
        }, 2000);
    }
});