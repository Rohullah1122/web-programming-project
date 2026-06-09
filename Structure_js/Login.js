// Global target tracking arrays variables inside closure scope memory
let activeRecoveryUser = null;

document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const loginSubmitBtn = document.getElementById('loginSubmitBtn');
    const loginMsgDiv = document.getElementById('loginResponseMsg');
    
    loginSubmitBtn.disabled = true;
    loginSubmitBtn.innerText = "Authenticating...";
    
    const emailInput = document.getElementById('loginEmail').value.trim();
    const passwordInput = document.getElementById('loginPassword').value;
    
    const storedUsers = JSON.parse(localStorage.getItem('usersData')) || [];
    loginMsgDiv.style.display = "block";

    const matchedUser = storedUsers.find(user => 
        user.email.toLowerCase() === emailInput.toLowerCase() && 
        user.password === passwordInput
    );

    if (matchedUser) {
        loginMsgDiv.style.backgroundColor = "rgba(46, 125, 50, 0.08)";
        loginMsgDiv.style.color = "#2e7d32"; 
        loginMsgDiv.innerText = `Login successful! Welcome back, ${matchedUser.name}.`;

        sessionStorage.setItem('currentUser', JSON.stringify({
            id: matchedUser.id,
            name: matchedUser.name,
            email: matchedUser.email,
            role: matchedUser.role
        }));

        setTimeout(() => {
            if (matchedUser.role === 'owner') {
                window.location.href = './owner-dashboard.html';
            } else {
                window.location.href = 'browse-workspaces.html';
            }
        }, 1500);
    } else {
        loginMsgDiv.style.backgroundColor = "rgba(211, 47, 47, 0.08)";
        loginMsgDiv.style.color = "#d32f2f"; 
        loginMsgDiv.innerText = "Invalid email address or incorrect password.";
        loginSubmitBtn.disabled = false;
        loginSubmitBtn.innerText = "Log In";
    }
});

/* ==========================================================================
   MODAL WINDOW INTERACTION LOGIC ARCHACTIVE CODES
   ========================================================================== */
const pswModal = document.getElementById('forgotPasswordModal');
const emailModal = document.getElementById('forgotEmailModal');

// Interface trigger links declarations
document.getElementById('triggerForgotPassword').addEventListener('click', (e) => {
    e.preventDefault();
    pswModal.style.display = "flex";
});

document.getElementById('triggerForgotEmail').addEventListener('click', (e) => {
    e.preventDefault();
    emailModal.style.display = "flex";
});

function closeRecoveryModal(modalId) {
    document.getElementById(modalId).style.display = "none";
    // Reset inputs internally on close actions
    activeRecoveryUser = null;
    document.getElementById('passwordQuestionWrapper').style.display = "none";
    document.getElementById('emailQuestionWrapper').style.display = "none";
    document.getElementById('passwordRecoveryMsg').style.display = "none";
    document.getElementById('emailRecoveryMsg').style.display = "none";
}

// --------------------------------------------------------------------------
// PASSWORD RECOVERY WORKFLOW SUB-LOGIC
// --------------------------------------------------------------------------
document.getElementById('loadQuestionBtn').addEventListener('click', () => {
    const recoveryEmail = document.getElementById('recoveryEmailInput').value.trim().toLowerCase();
    const msgDiv = document.getElementById('passwordRecoveryMsg');
    const storedUsers = JSON.parse(localStorage.getItem('usersData')) || [];

    activeRecoveryUser = storedUsers.find(u => u.email.toLowerCase() === recoveryEmail);
    msgDiv.style.display = "block";

    if (activeRecoveryUser) {
        msgDiv.style.backgroundColor = "rgba(46, 125, 50, 0.08)";
        msgDiv.style.color = "#2e7d32";
        msgDiv.innerText = "Account located! Answer security challenge below.";
        
        document.getElementById('displayedPasswordQuestion').innerText = activeRecoveryUser.securityQuestion || "What is your fallback recovery marker value?";
        document.getElementById('passwordQuestionWrapper').style.display = "block";
    } else {
        msgDiv.style.backgroundColor = "rgba(211, 47, 47, 0.08)";
        msgDiv.style.color = "#d32f2f";
        msgDiv.innerText = "No account found with that email address.";
        document.getElementById('passwordQuestionWrapper').style.display = "none";
    }
});

document.getElementById('submitPasswordRecoveryBtn').addEventListener('click', () => {
    const answer = document.getElementById('passwordAnswerInput').value.trim().toLowerCase();
    const msgDiv = document.getElementById('passwordRecoveryMsg');

    if (activeRecoveryUser && activeRecoveryUser.securityAnswer && activeRecoveryUser.securityAnswer.toLowerCase() === answer) {
        msgDiv.style.backgroundColor = "#e0f2fe";
        msgDiv.style.color = "#0369a1";
        msgDiv.innerHTML = `🔑 <strong>Access Granted!</strong> Your password is: <span style="font-family: monospace; font-size:15px;">${activeRecoveryUser.password}</span>`;
    } else {
        msgDiv.style.backgroundColor = "rgba(211, 47, 47, 0.08)";
        msgDiv.style.color = "#d32f2f";
        msgDiv.innerText = "Incorrect security question answer. Access denied.";
    }
});

// --------------------------------------------------------------------------
// EMAIL RECOVERY WORKFLOW SUB-LOGIC
// --------------------------------------------------------------------------
document.getElementById('loadEmailQuestionBtn').addEventListener('click', () => {
    const recoveryName = document.getElementById('recoveryNameInput').value.trim().toLowerCase();
    const msgDiv = document.getElementById('emailRecoveryMsg');
    const storedUsers = JSON.parse(localStorage.getItem('usersData')) || [];

    activeRecoveryUser = storedUsers.find(u => u.name.toLowerCase() === recoveryName);
    msgDiv.style.display = "block";

    if (activeRecoveryUser) {
        msgDiv.style.backgroundColor = "rgba(46, 125, 50, 0.08)";
        msgDiv.style.color = "#2e7d32";
        msgDiv.innerText = "Profile match found! Answer your safety checkpoint question.";
        
        document.getElementById('displayedEmailQuestion').innerText = activeRecoveryUser.securityQuestion || "What is your profile fallback keyword?";
        document.getElementById('emailQuestionWrapper').style.display = "block";
    } else {
        msgDiv.style.backgroundColor = "rgba(211, 47, 47, 0.08)";
        msgDiv.style.color = "#d32f2f";
        msgDiv.innerText = "No profiles found matching that name.";
        document.getElementById('emailQuestionWrapper').style.display = "none";
    }
});

document.getElementById('submitEmailRecoveryBtn').addEventListener('click', () => {
    const answer = document.getElementById('emailAnswerInput').value.trim().toLowerCase();
    const msgDiv = document.getElementById('emailRecoveryMsg');

    if (activeRecoveryUser && activeRecoveryUser.securityAnswer && activeRecoveryUser.securityAnswer.toLowerCase() === answer) {
        msgDiv.style.backgroundColor = "#e0f2fe";
        msgDiv.style.color = "#0369a1";
        msgDiv.innerHTML = `📧 <strong>Found!</strong> Registered Email is: <strong style="font-family: monospace;">${activeRecoveryUser.email}</strong>`;
    } else {
        msgDiv.style.backgroundColor = "rgba(211, 47, 47, 0.08)";
        msgDiv.style.color = "#d32f2f";
        msgDiv.innerText = "Incorrect security question answer. Access denied.";
    }
});