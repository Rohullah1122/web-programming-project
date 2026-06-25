document.addEventListener("DOMContentLoaded", async () => {
    const editForm = document.getElementById("editWorkspaceForm");
    const deleteBtn = document.getElementById("deleteBtn");

    // 1. GET WORKSPACE ID FROM URL
    const urlParams = new URLSearchParams(window.location.search);
    const workspaceId = urlParams.get("id");

    if (!workspaceId) {
        alert("Error: No workspace selected.");
        window.location.href = "owner-dashboard.html";
        return;
    }

    console.log("workspaceId =", workspaceId);

    // Load workspace from backend
    const wsRes = await fetch(`http://localhost:4000/api/workspaces/${workspaceId}`);
    const workspace = await wsRes.json();

    if (!wsRes.ok) {
        alert("Workspace not found.");
        window.location.href = "owner-dashboard.html";
        return;
    }

    // Load property
    const propRes = await fetch(`http://localhost:4000/api/properties/${workspace.property_id}`);
    const property = await propRes.json();

    // 2. PREFILL FORM
    document.getElementById("editName").value = workspace.name;
    document.getElementById("editType").value = workspace.type;
    document.getElementById("editCapacity").value = workspace.capacity;
    document.getElementById("editSmoking").value = workspace.smoking;
    document.getElementById("editAvailability").value = workspace.availability;
    document.getElementById("editTerm").value = workspace.term;
    document.getElementById("editPrice").value = workspace.price_per_hour;

    document.getElementById("editAddress").value = property.address;
    document.getElementById("editNeighborhood").value = property.city;
    document.getElementById("editSqft").value = property.sqft;
    document.getElementById("editGarage").value = property.garage;
    document.getElementById("editTransport").value = property.transport;

    // Convert image to Base64
    const convertImageToBase64 = (file) => {
        return new Promise((resolve) => {
            if (!file) resolve(null);
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(file);
        });
    };

    // 3. UPDATE WORKSPACE + PROPERTY
    editForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const buildingFile = document.getElementById("editBuildingImage").files[0];
        const roomFile = document.getElementById("editRoomImage").files[0];

        const newBuildingBase64 = await convertImageToBase64(buildingFile);
        const newRoomBase64 = await convertImageToBase64(roomFile);

        // UPDATE PROPERTY
        await fetch(`http://localhost:4000/api/properties/${property.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: property.title,
                description: property.description,
                address: document.getElementById("editAddress").value.trim(),
                city: document.getElementById("editNeighborhood").value.trim(),
                price_per_day: property.price_per_day,
                sqft: document.getElementById("editSqft").value,
                garage: document.getElementById("editGarage").value,
                transport: document.getElementById("editTransport").value,
                building_image: newBuildingBase64 || property.building_image
            })
        });

        // UPDATE WORKSPACE
        await fetch(`http://localhost:4000/api/workspaces/${workspaceId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: document.getElementById("editName").value.trim(),
                type: document.getElementById("editType").value,
                capacity: document.getElementById("editCapacity").value,
                smoking: document.getElementById("editSmoking").value,
                availability: document.getElementById("editAvailability").value,
                term: document.getElementById("editTerm").value,
                price_per_hour: document.getElementById("editPrice").value,
                amenities: workspace.amenities,
                room_image: newRoomBase64 || workspace.room_image
            })
        });

        alert("Workspace updated successfully!");
        window.location.href = "owner-dashboard.html";
    });

    // 4. DELETE WORKSPACE
    deleteBtn.addEventListener("click", async () => {
        if (!confirm(`Delete "${workspace.name}" permanently?`)) return;

        // Delete workspace
        await fetch(`http://localhost:4000/api/workspaces/${workspaceId}`, {
            method: "DELETE"
        });

        // Check if property still has workspaces
        const wsCheckRes = await fetch("http://localhost:4000/api/workspaces");
        const allWs = await wsCheckRes.json();
        const stillExists = allWs.some(ws => ws.property_id == property.id);

        if (!stillExists) {
            await fetch(`http://localhost:4000/api/properties/${property.id}`, {
                method: "DELETE"
            });
        }

        window.location.href = "owner-dashboard.html";
    });
});
