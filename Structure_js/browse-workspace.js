document.addEventListener("DOMContentLoaded", async () => {
    const exploreGrid = document.getElementById("publicExploreGrid");
    const emptyState = document.getElementById("publicEmptyState");
    const searchInput = document.getElementById("workspaceSearchInput");
    const suggestionsBox = document.getElementById("searchSuggestionsBox");
    const emptyStateText = document.getElementById("emptyStateText");
    const authPromptBtn = document.getElementById("authPromptBtn");

    let allWorkspaces = [];

    // ⭐ 1. FETCH WORKSPACES FROM BACKEND
    try {
        const wsRes = await fetch("http://localhost:4000/api/workspaces");
        const wsList = await wsRes.json();

        // ⭐ 2. FETCH PROPERTIES FOR EACH WORKSPACE
        const mergedList = [];

        for (const ws of wsList) {
            const propRes = await fetch(`http://localhost:4000/api/properties/${ws.property_id}`);
            const prop = await propRes.json();

            mergedList.push({
                id: ws.id,
                name: ws.name,
                type: ws.type,
                capacity: ws.capacity,
                smoking: ws.smoking,
                availability: ws.availability,
                term: ws.term,
                price: ws.price_per_hour,
                roomImage: ws.room_image,

                // property fields
                address: prop.address,
                neighborhood: prop.city,
                sqft: prop.sqft,
                garage: prop.garage,
                transport: prop.transport,
                buildingImage: prop.building_image
            });
        }

        allWorkspaces = mergedList;

    } catch (err) {
        console.error("Backend fetch error:", err);
        allWorkspaces = [];
    }

    // ⭐ 3. UPDATE AUTH BUTTON
    const currentUserSession = JSON.parse(sessionStorage.getItem('currentUser'));
    if (currentUserSession && authPromptBtn) {
        authPromptBtn.textContent = "Dashboard";
        authPromptBtn.href = currentUserSession.role === "owner" ? "owner_dashboard.html" : "user_dashboard.html";
    }

    // ⭐ 4. RENDER WORKSPACES
    function renderWorkspaces(list) {
        exploreGrid.innerHTML = "";

        if (list.length === 0) {
            exploreGrid.style.display = "none";
            emptyState.style.display = "block";
            return;
        }

        exploreGrid.style.display = "grid";
        emptyState.style.display = "none";

        list.forEach(space => {
            const card = document.createElement("div");
            card.className = "instagram-workspace-card";
            card.style.cursor = "pointer";

            card.addEventListener("click", () => {
                const sessionCheck = JSON.parse(sessionStorage.getItem('currentUser'));
                if (sessionCheck) {
                    window.location.href = `workspace_details.html?id=${space.id}`;
                } else {
                    alert(`Interested in "${space.name}"? Please sign in or register to view details.`);
                    window.location.href = "login.html";
                }
            });

            card.innerHTML = `
                <div class="card-images-container">
                    <div class="img-half">
                        <span class="img-badge">Building</span>
                        <img src="${space.buildingImage}" alt="Building">
                    </div>
                    <div class="img-half">
                        <span class="img-badge">Interior</span>
                        <img src="${space.roomImage}" alt="Workspace">
                    </div>
                </div>

                <div class="instagram-card-content">
                    <div class="card-meta-top">
                        <span class="premium-type-tag">${space.type}</span>
                        <div class="premium-price-tag">$${space.price}<span>/hr</span></div>
                    </div>

                    <h3>${space.name}</h3>

                    <div class="instagram-meta-info">
                        <div class="info-item">
                            <span class="info-icon">📍</span>
                            <div class="info-text-wrapper">
                                <span class="info-label">Location:</span>
                                <span class="info-value">${space.address}</span>
                            </div>
                        </div>
                        <div class="info-item">
                            <span class="info-icon">🏙️</span>
                            <div class="info-text-wrapper">
                                <span class="info-label">Area:</span>
                                <span class="info-value">${space.neighborhood}</span>
                            </div>
                        </div>
                        <div class="info-item">
                            <span class="info-icon">🪑</span>
                            <div class="info-text-wrapper">
                                <span class="info-label">Capacity:</span>
                                <span class="info-value">${space.capacity} Seats</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="instagram-card-footer">View Details & Reserve →</div>
            `;

            exploreGrid.appendChild(card);
        });
    }

    // ⭐ 5. INITIAL RENDER
    if (allWorkspaces.length === 0) {
        exploreGrid.style.display = "none";
        emptyState.style.display = "block";
        emptyStateText.textContent = "No workspaces have been listed yet.";
        searchInput.disabled = true;
    } else {
        searchInput.disabled = false;
        renderWorkspaces(allWorkspaces);
    }

    // ⭐ 6. SEARCH + SUGGESTIONS
    function showSuggestions(query) {
        if (!query) {
            suggestionsBox.style.display = "none";
            return;
        }

        const matches = allWorkspaces.filter(space =>
            space.address.toLowerCase().includes(query) ||
            space.name.toLowerCase().includes(query)
        );

        if (matches.length === 0) {
            suggestionsBox.style.display = "none";
            return;
        }

        suggestionsBox.innerHTML = "";
        suggestionsBox.style.display = "block";

        matches.slice(0, 5).forEach(space => {
            const row = document.createElement("div");
            row.className = "suggestion-row-item";

            row.innerHTML = `
                <span class="item-marker">📍</span>
                <div class="suggestion-row-content">
                    <span class="suggestion-main-text">${space.address}</span>
                    <span class="suggestion-sub-text">${space.name} (${space.neighborhood})</span>
                </div>
            `;

            row.addEventListener("click", () => {
                searchInput.value = space.address;
                suggestionsBox.style.display = "none";
                renderWorkspaces(allWorkspaces.filter(s => s.address === space.address));
            });

            suggestionsBox.appendChild(row);
        });
    }

    searchInput.addEventListener("input", e => {
        const q = e.target.value.toLowerCase().trim();
        const filtered = allWorkspaces.filter(space =>
            space.name.toLowerCase().includes(q) ||
            space.address.toLowerCase().includes(q) ||
            space.neighborhood.toLowerCase().includes(q) ||
            space.type.toLowerCase().includes(q)
        );

        emptyStateText.textContent = `No matches found for "${e.target.value}".`;
        renderWorkspaces(filtered);
        showSuggestions(q);
    });

    document.addEventListener("click", e => {
        if (!suggestionsBox.contains(e.target) && e.target !== searchInput) {
            suggestionsBox.style.display = "none";
        }
    });
});
