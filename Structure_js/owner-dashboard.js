document.addEventListener("DOMContentLoaded", () => {
    const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));

    if (!currentUser || currentUser.role !== "owner") {
        alert("Access denied. Please log in as an owner.");
        window.location.href = "../Structures/login.html";
        return;
    }

    const nameSpan = document.getElementById("ownerName");
    if (nameSpan) nameSpan.innerText = currentUser.name;

    const inventoryGrid = document.getElementById("inventoryGrid");
    const emptyState = document.getElementById("emptyState");
    const formMsg = document.getElementById("formMsg");

    function toBase64(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(file);
        });
    }

    async function loadInventory() {
        inventoryGrid.innerHTML = "";
        emptyState.style.display = "none";

        try {
            const [propRes, wsRes] = await Promise.all([
                fetch("http://localhost:4000/api/properties"),
                fetch("http://localhost:4000/api/workspaces")
            ]);

            const properties = await propRes.json();
            const workspaces = await wsRes.json();

            const ownerProperties = properties.filter(
                p => String(p.owner_id) === String(currentUser.id)
            );

            const ownerWorkspaces = [];

            ownerProperties.forEach(prop => {
                const related = workspaces.filter(ws => ws.property_id === prop.id);
                related.forEach(ws => ownerWorkspaces.push({ property: prop, workspace: ws }));
            });

            if (ownerWorkspaces.length === 0) {
                emptyState.style.display = "block";
                return;
            }

            ownerWorkspaces.forEach(item => {
                const card = document.createElement("div");
                card.className = "workspace-card";

                card.innerHTML = `
                    <img src="${item.workspace.room_image}" class="workspace-thumb">

                    <div class="workspace-info">
                        <h3>${item.workspace.name}</h3>

                        <p><strong>Type:</strong> ${item.workspace.type}</p>
                        <p><strong>Capacity:</strong> ${item.workspace.capacity} seats</p>
                        <p><strong>Smoking:</strong> ${item.workspace.smoking}</p>
                        <p><strong>Term:</strong> ${item.workspace.term}</p>
                        <p><strong>Available From:</strong> ${item.workspace.availability}</p>

                        <p><strong>Property:</strong> ${item.property.title}</p>
                        <p><strong>Address:</strong> ${item.property.address}</p>
                        <p><strong>Area:</strong> ${item.property.city}</p>
                        <p><strong>Sqft:</strong> ${item.property.sqft}</p>
                        <p><strong>Garage:</strong> ${item.property.garage}</p>
                        <p><strong>Transport:</strong> ${item.property.transport}</p>
                    </div>

                    <div class="card-footer">
                        <div class="price-tag">$${item.workspace.price_per_hour}/hr</div>

                        <button class="edit-btn" data-wsid="${item.workspace.id}" data-propid="${item.property.id}">
                            Edit
                        </button>

                        <button class="delete-btn" data-wsid="${item.workspace.id}" data-propid="${item.property.id}">
                            Delete
                        </button>
                    </div>
                `;

                inventoryGrid.appendChild(card);
            });

            // DELETE HANDLER
            document.querySelectorAll(".delete-btn").forEach(btn => {
                btn.addEventListener("click", async () => {
                    const wsId = btn.getAttribute("data-wsid");
                    const propId = btn.getAttribute("data-propid");

                    if (!confirm("Delete this workspace?")) return;

                    await fetch(`http://localhost:4000/api/workspaces/${wsId}`, {
                        method: "DELETE"
                    });

                    const wsRes = await fetch("http://localhost:4000/api/workspaces");
                    const allWs = await wsRes.json();
                    const stillExists = allWs.some(ws => ws.property_id == propId);

                    if (!stillExists) {
                        await fetch(`http://localhost:4000/api/properties/${propId}`, {
                            method: "DELETE"
                        });
                    }

                    loadInventory();
                });
            });

            // EDIT HANDLER
            document.querySelectorAll(".edit-btn").forEach(btn => {
                btn.addEventListener("click", () => {
                    const wsId = btn.getAttribute("data-wsid");
                    window.location.href = `../Structures/edit-workspace.html?id=${wsId}`;
                });
            });

        } catch (err) {
            console.error("Inventory load error:", err);
            emptyState.style.display = "block";
            emptyState.innerText = "Failed to load your listings.";
        }
    }

    loadInventory();

    // CREATE NEW WORKSPACE + PROPERTY
    document.getElementById("workspaceForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        formMsg.innerText = "";

        const title = document.getElementById("propertyName").value.trim();
        const description = document.getElementById("propertyNeighborhood").value.trim();
        const address = document.getElementById("propertyAddress").value.trim();
        const city = document.getElementById("City").value.trim();
        const sqft = document.getElementById("propertySqft").value.trim();
        const garage = document.getElementById("propertyGarage").value;
        const transport = document.getElementById("propertyTransport").value;

        const buildingFile = document.getElementById("buildingImage").files[0];
        const roomFile = document.getElementById("roomImage").files[0];

        const buildingImage = await toBase64(buildingFile);
        const roomImage = await toBase64(roomFile);

        const wsType = document.getElementById("workspaceType").value;
        const wsCapacity = document.getElementById("workspaceCapacity").value;
        const wsSmoking = document.getElementById("workspaceSmoking").value;
        const wsAvailability = document.getElementById("workspaceAvailability").value;
        const wsTerm = document.getElementById("workspaceTerm").value;
        const wsPrice = document.getElementById("workspacePrice").value;

        try {
            const propRes = await fetch("http://localhost:4000/api/properties", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    owner_id: currentUser.id,
                    title,
                    description,
                    address,
                    city,
                    sqft,
                    garage,
                    transport,
                    building_image: buildingImage
                })
            });

            const newProp = await propRes.json();

            const wsRes = await fetch("http://localhost:4000/api/workspaces", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    property_id: newProp.id,
                    name: wsType,
                    capacity: wsCapacity,
                    price_per_hour: wsPrice,
                    smoking: wsSmoking,
                    availability: wsAvailability,
                    term: wsTerm,
                    type: wsType,
                    room_image: roomImage
                })
            });

            formMsg.style.color = "#2e7d32";
            formMsg.innerText = "Workspace successfully published!";
            document.getElementById("workspaceForm").reset();

            loadInventory();

        } catch (err) {
            console.error("Create listing error:", err);
            formMsg.style.color = "#d32f2f";
            formMsg.innerText = "Server error. Please try again.";
        }
    });
});
