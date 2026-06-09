function loadHeader() {
    fetch("../Components/Structure_component_css/Structures_components/Header.html")
        .then(res => res.text())
        .then(html => {
            document.getElementById("header").innerHTML = html;
            setNavbar();
        })
        .catch(err => console.error("Error loading header HTML layout file:", err));
}

function setNavbar() {
    // FIX: Read 'currentUser' from sessionStorage to extract the single active account
    const user = JSON.parse(sessionStorage.getItem("currentUser"));
    const nav = document.getElementById("nav-links");

    // Double-check if the element exists on the loaded header fragment template before injecting
    if (!nav) return;

    if (!user) {
        // 1. GUEST MODE (Not Logged In)
        nav.innerHTML = `
            <a href="../Structures/Landing_page.html">Home</a>
            <a href="../Structures/sign_up.html">Sign Up</a>
            <a href="../Structures/Login.html">Login</a>
        `;
    } 
    else if (user.role === "owner") {
        // 2. OWNER AUTHENTICATED MODE
        nav.innerHTML = `
            <a href="owner-dashboard.html">Dashboard</a>
            <a href="#" id="logoutBtn">Logout</a>
        `;
        
        // Add click listener securely to the newly rendered logout element anchor
        document.getElementById("logoutBtn").addEventListener("click", (e) => {
            e.preventDefault();
            logout();
        });
    } 
    else if (user.role === "coworker") {
        // 3. COWORKER AUTHENTICATED MODE
        nav.innerHTML = `
            <a href="browse-workspaces.html">Browse Workspaces</a>
            <a href="#" id="logoutBtn">Logout</a>
        `;
        
        document.getElementById("logoutBtn").addEventListener("click", (e) => {
            e.preventDefault();
            logout();
        });
    }
}

function logout() {
    // Wipe out ONLY the active login token wrapper block session footprint 
    sessionStorage.removeItem("currentUser");
    
    // Send them right back to the central directory entry portal view card screen
    window.location.href = "login.html";
}