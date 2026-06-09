document.addEventListener("DOMContentLoaded", () => {
    const ownerNameSpan = document.getElementById("ownerName");
    const workspaceForm = document.getElementById("workspaceForm");
    const inventoryGrid = document.getElementById("inventoryGrid");
    const emptyState = document.getElementById("emptyState");

    // 1. SAFETY SESSION VERIFICATION
    const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));

    if (!currentUser || currentUser.role !== "owner") {
        alert("Access Denied: Please log in as an Owner to view this management panel.");
        window.location.href = "login.html";
        return;
    }

    if (ownerNameSpan) {
        ownerNameSpan.innerText = currentUser.name;
    }

    // 2. INVENTORY CARD RENDERING ENGINE (WITH MULTIPLE IMAGES)
    const renderInventory = () => {
        if (!inventoryGrid || !emptyState) return;

        const allWorkspaces = JSON.parse(localStorage.getItem("workspacesData")) || [];
        const ownerWorkspaces = allWorkspaces.filter(space => space.ownerId === currentUser.id);

        if (ownerWorkspaces.length === 0) {
            inventoryGrid.style.display = "none";
            emptyState.style.display = "block";
            return;
        }

        inventoryGrid.style.display = "grid";
        emptyState.style.display = "none";
        inventoryGrid.innerHTML = ""; 

        ownerWorkspaces.forEach(space => {
            const card = document.createElement("div");
            card.className = "workspace-card";
            card.style.cursor = "pointer"; // Visual cue that the card is interactive
            
            // Navigate to the edit page when the card is clicked, passing the item ID
            card.addEventListener("click", () => {
                window.location.href = `edit-workspace.html?id=${space.id}`;
            });
            
            card.innerHTML = `
                <div class="card-images-container">
                    <div class="img-half">
                        <span class="img-badge">Building</span>
                        <img src="${space.buildingImage || 'https://via.placeholder.com/150'}" alt="Building Exterior">
                    </div>
                    <div class="img-half">
                        <span class="img-badge">Interior</span>
                        <img src="${space.roomImage || 'https://via.placeholder.com/150'}" alt="Workspace Interior">
                    </div>
                </div>
                <div class="card-content-box">
                    <div class="card-header-info">
                        <span class="type-tag">${space.type}</span>
                        <h3>${space.name}</h3>
                    </div>
                    <div class="card-body-details">
                        <p>📍 <strong>Location:</strong> ${space.address}</p>
                        <p>🏙️ <strong>Neighborhood:</strong> ${space.neighborhood}</p>
                        <p>🪑 <strong>Capacity:</strong> ${space.capacity} Seats Available</p>
                    </div>
                    <div class="card-price-row">
                        <div class="price-lbl">$${space.price}<span>/hr</span></div>
                    </div>
                </div>
            `;
            inventoryGrid.appendChild(card);
        });
    };

    // HELPER FUNCTION: Reads selected device file metadata and converts it to a string
    const convertImageToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            if (!file) resolve(""); 
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    };

    // 3. CAPTURE FORM SUBMISSIONS (CRITICAL UPDATED SECTION)
    if (workspaceForm) {
        workspaceForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const name = document.getElementById("propertyName").value.trim();
            const address = document.getElementById("propertyAddress").value.trim();
            const neighborhood = document.getElementById("propertyNeighborhood").value.trim();
            const type = document.getElementById("workspaceType").value;
            const capacity = document.getElementById("workspaceCapacity").value;
            const price = document.getElementById("workspacePrice").value;
            
            const buildingInputNode = document.getElementById("buildingImage");
            const roomInputNode = document.getElementById("roomImage");

            const buildingFile = buildingInputNode ? buildingInputNode.files[0] : null;
            const roomFile = roomInputNode ? roomInputNode.files[0] : null;

            try {
                // Convert both files concurrently
                const [buildingBase64, roomBase64] = await Promise.all([
                    convertImageToBase64(buildingFile),
                    convertImageToBase64(roomFile)
                ]);

                const allWorkspaces = JSON.parse(localStorage.getItem("workspacesData")) || [];

                // SUCCESS PATH BOUND: Saved parameters containing critical owner data fields
                const newWorkspace = {
                    id: "space_" + Date.now(),
                    ownerId: currentUser.id, 
                    name: name,
                    address: address,
                    neighborhood: neighborhood,
                    buildingImage: buildingBase64, 
                    roomImage: roomBase64,         
                    type: type,
                    capacity: capacity,
                    price: price,

                    // LINK OWNER PROFILE FIELDS DIRECTLY HERE FOR INTEGRATION
                    ownerName: currentUser.name,
                    ownerEmail: currentUser.email,
                    ownerPhone: currentUser.phone || "403-111-1111" // Fallback data point
                };

                allWorkspaces.push(newWorkspace);
                localStorage.setItem("workspacesData", JSON.stringify(allWorkspaces));

                // Clear form entries cleanly
                workspaceForm.reset();
                
                // Clear out file picker preview title text
                const bPreview = document.getElementById('buildingNamePreview');
                const rPreview = document.getElementById('roomNamePreview');
                if (bPreview) bPreview.innerText = "No file selected";
                if (rPreview) rPreview.innerText = "No file selected";

                // Redraw view panels instantly
                renderInventory(); 
                alert("Workspace successfully listed with your contact information linked!");
                
            } catch (error) {
                console.error("Failed to read image files:", error);
                alert("There was an error processing your images. Please check the file sizes and try again.");
            }
        });
    }

    // 4. INTERACTIVE DYNAMIC UI PREVIEW LABELS
    const bInput = document.getElementById('buildingImage');
    const rInput = document.getElementById('roomImage');

    if (bInput) {
        bInput.addEventListener('change', (e) => {
            const fileName = e.target.files[0] ? e.target.files[0].name : "No file selected";
            const label = document.getElementById('buildingNamePreview');
            if (label) label.innerText = fileName;
        });
    }

    if (rInput) {
        rInput.addEventListener('change', (e) => {
            const fileName = e.target.files[0] ? e.target.files[0].name : "No file selected";
            const label = document.getElementById('roomNamePreview');
            if (label) label.innerText = fileName;
        });
    }

    // Load current existing properties on initial initialization boot
    renderInventory();
});