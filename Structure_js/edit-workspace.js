document.addEventListener("DOMContentLoaded", () => {
    const editForm = document.getElementById("editWorkspaceForm");
    const deleteBtn = document.getElementById("deleteBtn");

    // 1. EXTRACT WORKSPACE ID FROM URL
    const urlParams = new URLSearchParams(window.location.search);
    const workspaceId = urlParams.get("id");

    if (!workspaceId) {
        alert("Error: No listing target specified.");
        window.location.href = "owner-dashboard.html";
        return;
    }

    // 2. FETCH DATABASES FROM LOCALSTORAGE
    let allWorkspaces = JSON.parse(localStorage.getItem("workspacesData")) || [];
    const targetSpace = allWorkspaces.find(space => space.id === workspaceId);

    if (!targetSpace) {
        alert("The requested listing could not be found.");
        window.location.href = "owner-dashboard.html";
        return;
    }

    // 3. PRE-POPULATE THE FORM INPUTS WITH CURRENT DATA
    document.getElementById("editName").value = targetSpace.name;
    document.getElementById("editAddress").value = targetSpace.address;
    document.getElementById("editNeighborhood").value = targetSpace.neighborhood;
    document.getElementById("editType").value = targetSpace.type;
    document.getElementById("editCapacity").value = targetSpace.capacity;
    document.getElementById("editPrice").value = targetSpace.price;

    // HELPER FUNCTION: Convert files to base64 if present
    const convertImageToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            if (!file) resolve(null); // Resolve with null if no new file is chosen
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    };

    // 4. HANDLE CHANGES (UPDATE ACTION)
    editForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const buildingInput = document.getElementById("editBuildingImage");
        const roomInput = document.getElementById("editRoomImage");

        const newBuildingFile = buildingInput ? buildingInput.files[0] : null;
        const newRoomFile = roomInput ? roomInput.files[0] : null;

        try {
            // Process image file streams concurrently
            const [newBuildingBase64, newRoomBase64] = await Promise.all([
                convertImageToBase64(newBuildingFile),
                convertImageToBase64(newRoomFile)
            ]);

            // Form update assignments
            targetSpace.name = document.getElementById("editName").value.trim();
            targetSpace.address = document.getElementById("editAddress").value.trim();
            targetSpace.neighborhood = document.getElementById("editNeighborhood").value.trim();
            targetSpace.type = document.getElementById("editType").value;
            targetSpace.capacity = document.getElementById("editCapacity").value;
            targetSpace.price = document.getElementById("editPrice").value;

            // SMART CONDITIONAL: Only overwrite old base64 strings if new files are selected
            if (newBuildingBase64 !== null) {
                targetSpace.buildingImage = newBuildingBase64;
            }
            if (newRoomBase64 !== null) {
                targetSpace.roomImage = newRoomBase64;
            }

            // Save state array update directly to storage
            localStorage.setItem("workspacesData", JSON.stringify(allWorkspaces));

            alert("Listing updated successfully!");
            window.location.href = "owner-dashboard.html";

        } catch (error) {
            console.error("Failed to update listing imagery:", error);
            alert("Error updating your images. Please check the file sizes and try again.");
        }
    });

    // 5. HANDLE REMOVAL (DELETE ACTION)
    if (deleteBtn) {
        deleteBtn.addEventListener("click", () => {
            const confirmDelete = confirm(`Are you sure you want to permanently delete "${targetSpace.name}"?`);
            
            if (confirmDelete) {
                allWorkspaces = allWorkspaces.filter(space => space.id !== workspaceId);
                localStorage.setItem("workspacesData", JSON.stringify(allWorkspaces));
                window.location.href = "owner-dashboard.html";
            }
        });
    }
});