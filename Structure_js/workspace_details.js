document.addEventListener("DOMContentLoaded", async () => {
    const detailsWrapper = document.getElementById("detailsWrapper");
    if (!detailsWrapper) return;

    // 1. Get workspace ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const spaceId = urlParams.get("id");

    if (!spaceId) {
        detailsWrapper.innerHTML = `
            <div class="error-state-card">
                <h3>Invalid Workspace</h3>
                <p>No workspace ID was provided.</p>
                <a href="browse-workspaces.html" class="error-btn">Return to Catalog</a>
            </div>`;
        return;
    }

    try {
        // 2. Fetch workspace from backend
        const wsRes = await fetch(`http://localhost:4000/api/workspaces/${spaceId}`);
        const workspace = await wsRes.json();

        if (!wsRes.ok) {
            detailsWrapper.innerHTML = `
                <div class="error-state-card">
                    <h3>Workspace Not Found</h3>
                    <p>This workspace may have been removed.</p>
                    <a href="browse-workspaces.html" class="error-btn">Return to Catalog</a>
                </div>`;
            return;
        }

        // 3. Fetch property
        const propRes = await fetch(`http://localhost:4000/api/properties/${workspace.property_id}`);
        const property = await propRes.json();

        // 4. Fetch owner (optional)
        let owner = {};
        try {
            const ownerRes = await fetch(`http://localhost:4000/api/users/${property.owner_id}`);
            if (ownerRes.ok) owner = await ownerRes.json();
        } catch (e) {
            owner = {};
        }

        // 5. Resolve owner info
        const resolvedOwnerName = owner.name || "Property Representative";
        const resolvedOwnerEmail = owner.email || "group8@gmail.com";
        const resolvedOwnerPhone = owner.phone || "403-111-1111";

        // 6. Render full details
        detailsWrapper.innerHTML = `
            <div class="main-showcase-card">
                <div class="gallery-row">
                    <div class="img-wrapper">
                        <span class="img-badge">Exterior</span>
                        <img src="${property.building_image}" alt="Building Exterior">
                    </div>
                    <div class="img-wrapper">
                        <span class="img-badge">Interior</span>
                        <img src="${workspace.room_image}" alt="Workspace Interior">
                    </div>
                </div>

                <div class="workspace-header-block">
                    <span class="type-pill">${workspace.type}</span>
                    <h1>${workspace.name}</h1>
                </div>

                <h3 class="section-subtitle">Workspace Overview</h3>
                <div class="spec-list">

                    <div class="spec-item">
                        <div class="spec-icon">📍</div>
                        <div class="spec-text">
                            <div class="spec-label">Street Address</div>
                            <div class="spec-value">${property.address}</div>
                        </div>
                    </div>

                    <div class="spec-item">
                        <div class="spec-icon">🏙️</div>
                        <div class="spec-text">
                            <div class="spec-label">Area</div>
                            <div class="spec-value">${property.city}</div>
                        </div>
                    </div>

                    <div class="spec-item">
                        <div class="spec-icon">📐</div>
                        <div class="spec-text">
                            <div class="spec-label">Square Footage</div>
                            <div class="spec-value">${property.sqft} sqft</div>
                        </div>
                    </div>

                    <div class="spec-item">
                        <div class="spec-icon">🚗</div>
                        <div class="spec-text">
                            <div class="spec-label">Garage</div>
                            <div class="spec-value">${property.garage}</div>
                        </div>
                    </div>

                    <div class="spec-item">
                        <div class="spec-icon">🚉</div>
                        <div class="spec-text">
                            <div class="spec-label">Public Transport</div>
                            <div class="spec-value">${property.transport}</div>
                        </div>
                    </div>

                    <div class="spec-item">
                        <div class="spec-icon">🪑</div>
                        <div class="spec-text">
                            <div class="spec-label">Capacity</div>
                            <div class="spec-value">${workspace.capacity} seats</div>
                        </div>
                    </div>

                    <div class="spec-item">
                        <div class="spec-icon">🚬</div>
                        <div class="spec-text">
                            <div class="spec-label">Smoking Allowed</div>
                            <div class="spec-value">${workspace.smoking}</div>
                        </div>
                    </div>

                    <div class="spec-item">
                        <div class="spec-icon">📅</div>
                        <div class="spec-text">
                            <div class="spec-label">Availability</div>
                            <div class="spec-value">${workspace.availability}</div>
                        </div>
                    </div>

                    <div class="spec-item">
                        <div class="spec-icon">📆</div>
                        <div class="spec-text">
                            <div class="spec-label">Term</div>
                            <div class="spec-value">${workspace.term}</div>
                        </div>
                    </div>

                </div>
            </div>

            <div class="owner-sidebar-card">
                <div class="price-header">
                    <div class="price-amount">$${workspace.price_per_hour} <span class="price-unit">/ hour</span></div>
                </div>

                <div class="owner-profile-box">
                    <div class="owner-avatar">${resolvedOwnerName.charAt(0).toUpperCase()}</div>
                    <div class="owner-meta">
                        <div class="owner-title">Listed by Owner</div>
                        <div class="owner-name">${resolvedOwnerName}</div>
                    </div>
                </div>

                <div class="contact-channels">
                    <div class="channel-row">
                        <span class="channel-icon">📧</span>
                        <div class="channel-data">
                            <label>Email</label>
                            <a href="mailto:${resolvedOwnerEmail}">${resolvedOwnerEmail}</a>
                        </div>
                    </div>

                    <div class="channel-row">
                        <span class="channel-icon">📞</span>
                        <div class="channel-data">
                            <label>Phone</label>
                            <a href="tel:${resolvedOwnerPhone}">${resolvedOwnerPhone}</a>
                        </div>
                    </div>
                </div>

                <a href="mailto:${resolvedOwnerEmail}?subject=Workspace Inquiry: ${encodeURIComponent(workspace.name)}" 
                   class="contact-action-btn">
                    Contact Owner
                </a>
            </div>
        `;
    } catch (err) {
        console.error("Details load error:", err);
        detailsWrapper.innerHTML = `
            <div class="error-state-card">
                <h3>Error Loading Workspace</h3>
                <p>Something went wrong while loading this workspace.</p>
                <a href="browse-workspaces.html" class="error-btn">Return to Catalog</a>
            </div>`;
    }
});
