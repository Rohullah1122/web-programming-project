document.addEventListener("DOMContentLoaded", () => {
    const exploreGrid = document.getElementById("publicExploreGrid");
    const emptyState = document.getElementById("publicEmptyState");
    const searchInput = document.getElementById("workspaceSearchInput");
    const suggestionsBox = document.getElementById("searchSuggestionsBox");
    const emptyStateText = document.getElementById("emptyStateText");
    const authPromptBtn = document.getElementById("authPromptBtn");

    // 1. DYNAMIC DATA FETCH (Runs immediately to read current cross-account storage matrix)
    let allWorkspaces = [];
    try {
        allWorkspaces = JSON.parse(localStorage.getItem("workspacesData")) || [];
    } catch (e) {
        console.error("Error reading storage vector mapping details:", e);
        allWorkspaces = [];
    }

    // Toggle Top Corner Authentication Button Context dynamically
    const currentUserSession = JSON.parse(sessionStorage.getItem('currentUser'));
    if (currentUserSession && authPromptBtn) {
        authPromptBtn.textContent = "Dashboard";
        authPromptBtn.href = currentUserSession.role === "owner" ? "owner_dashboard.html" : "user_dashboard.html";
    }

    // Helper function to render property cards into the DOM grid layout canvas
    function renderWorkspaces(filteredSpaces) {
        if (!exploreGrid) return;
        exploreGrid.innerHTML = "";

        if (filteredSpaces.length === 0) {
            exploreGrid.style.display = "none";
            if (emptyState) emptyState.style.display = "block";
            return;
        }

        exploreGrid.style.display = "grid";
        if (emptyState) emptyState.style.display = "none";

        filteredSpaces.forEach(space => {
            const card = document.createElement("div");
            card.className = "instagram-workspace-card";
            card.style.cursor = "pointer";
            
            // Safe cross-referencing route target configuration assignment execution
            card.addEventListener("click", () => {
                const sessionCheck = JSON.parse(sessionStorage.getItem('currentUser'));
                if (sessionCheck) {
                    window.location.href = `workspace_details.html?id=${space.id}`;
                } else {
                    alert(`Interested in "${space.name}"? Please sign in or register to view details and contact the owner.`);
                    window.location.href = "login.html";
                }
            });

            card.innerHTML = `
                <div class="card-images-container">
                    <div class="img-half">
                        <span class="img-badge">Building</span>
                        <img src="${space.buildingImage || 'https://via.placeholder.com/150'}" alt="Exterior Structure">
                    </div>
                    <div class="img-half">
                        <span class="img-badge">Interior</span>
                        <img src="${space.roomImage || 'https://via.placeholder.com/150'}" alt="Internal Workspace">
                    </div>
                </div>
                
                <div class="instagram-card-content">
                    <div class="card-meta-top">
                        <span class="premium-type-tag">${space.type || 'Workspace'}</span>
                        <div class="premium-price-tag">$${space.price || '0'}<span>/hr</span></div>
                    </div>
                    
                    <h3>${space.name || 'Premium Listing'}</h3>
                    
                    <div class="instagram-meta-info">
                        <div class="info-item">
                            <span class="info-icon">📍</span>
                            <div class="info-text-wrapper">
                                <span class="info-label">Location:</span>
                                <span class="info-value">${space.address || 'N/A'}</span>
                            </div>
                        </div>
                        <div class="info-item">
                            <span class="info-icon">🏙️</span>
                            <div class="info-text-wrapper">
                                <span class="info-label">Area:</span>
                                <span class="info-value">${space.neighborhood || 'N/A'}</span>
                            </div>
                        </div>
                        <div class="info-item">
                            <span class="info-icon">🪑</span>
                            <div class="info-text-wrapper">
                                <span class="info-label">Capacity:</span>
                                <span class="info-value">${space.capacity || '0'} Seats</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="instagram-card-footer">View Details & Reserve →</div>
            `;
            exploreGrid.appendChild(card);
        });
    }

    // Helper function to render suggestions dropdown
    function showSuggestions(query) {
        if (!suggestionsBox) return;

        if (!query) {
            suggestionsBox.innerHTML = "";
            suggestionsBox.style.display = "none";
            return;
        }

        const matchedSuggestions = allWorkspaces.filter(space => {
            return (
                (space.address && space.address.toLowerCase().includes(query)) ||
                (space.name && space.name.toLowerCase().includes(query))
            );
        });

        if (matchedSuggestions.length === 0) {
            suggestionsBox.innerHTML = "";
            suggestionsBox.style.display = "none";
            return;
        }

        suggestionsBox.innerHTML = "";
        suggestionsBox.style.display = "block";

        matchedSuggestions.slice(0, 5).forEach(space => { 
            const row = document.createElement("div");
            row.className = "suggestion-row-item";
            
            row.innerHTML = `
                <span class="item-marker">📍</span>
                <div class="suggestion-row-content">
                    <span class="suggestion-main-text">${space.address}</span>
                    <span class="suggestion-sub-text">${space.name} (${space.neighborhood || 'N/A'})</span>
                </div>
            `;

            row.addEventListener("click", (e) => {
                e.stopPropagation();
                if (searchInput) searchInput.value = space.address;
                suggestionsBox.style.display = "none";
                
                const exactMatchList = allWorkspaces.filter(item => item.address === space.address);
                renderWorkspaces(exactMatchList);
            });

            suggestionsBox.appendChild(row);
        });
    }

    // GLOBAL APP ENTRY MASTER CONTROL ROUTINE INITIALIZATION
    if (allWorkspaces.length === 0) {
        if (exploreGrid) exploreGrid.style.display = "none";
        if (emptyState) emptyState.style.display = "block";
        if (emptyStateText) emptyStateText.textContent = "No workspaces have been listed yet. Check back soon!";
        if (searchInput) searchInput.disabled = true;
    } else {
        if (searchInput) searchInput.disabled = false;
        renderWorkspaces(allWorkspaces);
    }

    // Dynamic filtering input listening routines
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const query = e.target.value.toLowerCase().trim();

            const matchFilteredList = allWorkspaces.filter(space => {
                return (
                    (space.name && space.name.toLowerCase().includes(query)) ||
                    (space.address && space.address.toLowerCase().includes(query)) ||
                    (space.neighborhood && space.neighborhood.toLowerCase().includes(query)) ||
                    (space.type && space.type.toLowerCase().includes(query))
                );
            });

            if (emptyStateText) {
                emptyStateText.textContent = `No matches found for "${e.target.value}". Try another workspace keyword!`;
            }
            renderWorkspaces(matchFilteredList);
            showSuggestions(query);
        });

        searchInput.addEventListener("focus", (e) => {
            const query = e.target.value.toLowerCase().trim();
            if (query) showSuggestions(query);
        });
    }

    // Close suggestions dropdown if an outside viewport section area is targeted
    document.addEventListener("click", (e) => {
        if (suggestionsBox && searchInput && !searchInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
            suggestionsBox.style.display = "none";
        }
    });
});