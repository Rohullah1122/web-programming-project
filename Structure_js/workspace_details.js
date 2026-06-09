document.addEventListener("DOMContentLoaded", () => {
    const detailsWrapper = document.getElementById("detailsWrapper");
    if (!detailsWrapper) return;
    
    // 1. Get the workspace ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const spaceId = urlParams.get('id');
    
    // 2. Safely parse data matching your exact localStorage keys
    let allWorkspaces = [];
    let allUsers = [];
    try {
        allWorkspaces = JSON.parse(localStorage.getItem("workspacesData")) || [];
        // FIXED: Using 'usersData' instead of 'users' to match your application storage precisely
        allUsers = JSON.parse(localStorage.getItem("usersData")) || [];
    } catch (e) {
        console.error("Error reading localStorage systems mapping arrays:", e);
    }
    
    // 3. Find target workspace item
    const selectedSpace = allWorkspaces.find(item => String(item.id) === String(spaceId));
    
    if (!selectedSpace) {
        detailsWrapper.innerHTML = `
            <div style="grid-column: span 2; text-align:center; padding: 40px; color:#d32f2f; background: #fff; border-radius: 8px;">
                <h3>Error: Workspace listing could not be resolved or found.</h3>
                <p style="color: #666;">Could not locate a workspace with ID: <strong>${spaceId}</strong></p>
                <a href="browse-workspaces.html" style="color: #5d5fef; text-decoration: none; font-weight: bold;">Return to Catalog</a>
            </div>`;
        return;
    }

    // 4. Resolve owner profile using ownerId pointer reference matching
    const spaceOwner = allUsers.find(user => String(user.id) === String(selectedSpace.ownerId)) || {};

    // 5. Build presentation variables safely (handling fallback data configurations)
    const name = selectedSpace.name || "Premium Workspace";
    const type = selectedSpace.type || "Workspace";
    const price = selectedSpace.price || "0";
    const address = selectedSpace.address || "Calgary, AB";
    const neighborhood = selectedSpace.neighborhood || "Downtown Core";
    const capacity = selectedSpace.capacity || "Seats Available";
    
    // Read the base64 image strings directly from your workspacesData payload
    const buildingImg = selectedSpace.buildingImage || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80';
    const roomImg = selectedSpace.roomImage || 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=600&q=80';

    // Fallback contact values if specific fields are unpopulated inside usersData array matrix
    const ownerName = spaceOwner.name || selectedSpace.ownerName || "Independent Representative";
    const ownerEmail = spaceOwner.email || selectedSpace.ownerEmail || "group8@gmail.com";
    const ownerPhone = spaceOwner.phone || selectedSpace.ownerPhone || "403-111-1111";

    // 6. Inject the dynamic component cards layout to structural viewport
    detailsWrapper.innerHTML = `
        <div class="main-showcase-card">
            <div class="gallery-row">
                <img src="${buildingImg}" alt="Exterior Structure Showcase" onerror="this.src='https://via.placeholder.com/300?text=Building+Photo'">
                <img src="${roomImg}" alt="Interior Workspace Setup" onerror="this.src='https://via.placeholder.com/300?text=Interior+Photo'">
            </div>
            
            <div class="workspace-title-row">
                <div>
                    <h1>${name}</h1>
                    <span style="color:#8e8e93; font-size:14px; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">Type: ${type}</span>
                </div>
                <div class="price-badge">$${price}<span>/hr</span></div>
            </div>

            <div class="spec-list">
                <div class="spec-item">
                    <div class="spec-label">📍 Street Address</div>
                    <div class="spec-value">${address}</div>
                </div>
                <div class="spec-item">
                    <div class="spec-label">🏙️ Neighborhood / Area</div>
                    <div class="spec-value">${neighborhood}</div>
                </div>
                <div class="spec-item">
                    <div class="spec-label">🪑 Seating Capacity</div>
                    <div class="spec-value">${capacity} Desk Spaces</div>
                </div>
            </div>
        </div>

        <div class="owner-sidebar-card">
            <h2>Listed by Property Owner</h2>
            <div style="font-weight: 600; color: #1c1c1e; margin-bottom: 15px; font-size: 16px;">
                👤 ${ownerName}
            </div>
            
            <div class="contact-row">
                <span class="contact-icon">📧</span>
                <div>
                    <div style="font-size:11px; color:#8e8e93; font-weight:600;">EMAIL ADDRESS</div>
                    <a href="mailto:${ownerEmail}" style="color:#5d5fef; text-decoration:none; font-weight: 500;">
                        ${ownerEmail}
                    </a>
                </div>
            </div>

            <div class="contact-row">
                <span class="contact-icon">📞</span>
                <div>
                    <div style="font-size:11px; color:#8e8e93; font-weight:600;">PHONE NUMBER</div>
                    <a href="tel:${ownerPhone}" style="color:#1c1c1e; text-decoration:none; font-weight:500;">
                        ${ownerPhone}
                    </a>
                </div>
            </div>

            <a href="mailto:${ownerEmail}?subject=Inquiry regarding ${encodeURIComponent(name)}" class="contact-action-btn">
                Book This Space Via Email
            </a>
        </div>
    `;
});