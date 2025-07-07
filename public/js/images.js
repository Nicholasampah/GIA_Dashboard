// View images function
function viewImages(discrepancyId, pictures) {
  if (!pictures || pictures.length === 0) {
    showNotification("No images to display", "info");
    return;
  }

  // Create modal
  const modal = document.createElement("div");
  modal.className = "image-modal";
  modal.innerHTML = `
        <div class="image-modal-content">
            <div class="image-modal-header">
                <h3>Discrepancy Images (${pictures.length})</h3>
                <button class="image-modal-close" onclick="closeImageModal()">&times;</button>
            </div>
            <div class="image-grid">
                ${pictures
                  .map(
                    (picture, index) => `
                    <div class="image-item">
                        <img src="/uploads/${picture}" alt="Discrepancy Image ${
                      index + 1
                    }" 
                             onclick="showFullscreenImage('/uploads/${picture}')"
                             onerror="this.src='data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"200\" height=\"200\" viewBox=\"0 0 200 200\"><rect width=\"200\" height=\"200\" fill=\"%23f8f9fa\"/><text x=\"100\" y=\"100\" text-anchor=\"middle\" font-family=\"Arial\" font-size=\"14\" fill=\"%236c757d\"></text></svg>
                        <div class="image-item-footer">
                            Image ${index + 1}
                            <br>
                            <button onclick="downloadImage('/uploads/${picture}', '${picture}')" 
                                    style="margin-top: 0.25rem; padding: 0.25rem 0.5rem; font-size: 0.7rem; 
                                           background: #00d4aa; color: white; border: none; border-radius: 4px; cursor: pointer;">
                                Download
                            </button>
                        </div>
                    </div>
                `
                  )
                  .join("")}
            </div>
        </div>
    `;

  document.body.appendChild(modal);

  // Close modal when clicking outside
  modal.addEventListener("click", function (e) {
    if (e.target === modal) {
      closeImageModal();
    }
  });
}

// Close image modal
function closeImageModal() {
  const modal = document.querySelector(".image-modal");
  if (modal) {
    modal.remove();
  }
}

// Show fullscreen image
function showFullscreenImage(imageSrc) {
  const fullscreen = document.createElement("div");
  fullscreen.className = "fullscreen-image";
  fullscreen.innerHTML = `<img src="${imageSrc}" alt="Fullscreen Image">`;

  fullscreen.addEventListener("click", function () {
    fullscreen.remove();
  });

  document.body.appendChild(fullscreen);
}

// Download image
function downloadImage(imageSrc, filename) {
  const link = document.createElement("a");
  link.href = imageSrc;
  link.download = filename;
  link.target = "_blank";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Add ESC key handler for modals
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    closeImageModal();

    // Also close fullscreen image
    const fullscreen = document.querySelector(".fullscreen-image");
    if (fullscreen) {
      fullscreen.remove();
    }
  }
});

// Add more images to existing discrepancy
function addMoreImages(discrepancyId) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.multiple = true;

  input.onchange = function (e) {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const formData = new FormData();
    files.forEach((file) => formData.append("pictures", file));

    showNotification("Adding images...", "info");

    fetch(`/discrepancies/${discrepancyId}/upload`, {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          showNotification(
            `${files.length} more image(s) added successfully!`,
            "success"
          );
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          showNotification(
            "Error adding images: " + (data.error || "Unknown error"),
            "error"
          );
        }
      })
      .catch((error) => {
        console.error("Upload error:", error);
        showNotification("Error adding images: " + error.message, "error");
      });
  };

  input.click();
}

// Manage images (view with delete options)
function manageImages(discrepancyId, pictures) {
  if (!pictures || pictures.length === 0) {
    showNotification("No images to manage", "info");
    return;
  }

  // Create management modal
  const modal = document.createElement("div");
  modal.className = "image-modal";
  modal.innerHTML = `
        <div class="image-modal-content">
            <div class="image-modal-header">
                <h3>Manage Images (${pictures.length})</h3>
                <button class="image-modal-close" onclick="closeImageModal()">&times;</button>
            </div>
            <div class="image-grid">
                ${pictures
                  .map(
                    (picture, index) => `
                    <div class="image-item manage-image-item" data-filename="${picture}">
                        <img src="/uploads/${picture}" alt="Discrepancy Image ${
                      index + 1
                    }" 
                             onclick="showFullscreenImage('/uploads/${picture}')"
                             onerror="this.src='data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"200\" height=\"200\" viewBox=\"0 0 200 200\"><rect width=\"200\" height=\"200\" fill=\"%23f8f9fa\"/><text x=\"100\" y=\"100\" text-anchor=\"middle\" font-family=\"Arial\" font-size=\"14\" fill=\"%236c757d\"></text></svg>>
                        <button class="delete-image-btn" onclick="deleteImage('${discrepancyId}', '${picture}', this)" title="Delete this image">
                            ×
                        </button>
                        <div class="image-item-footer">
                            Image ${index + 1}
                        </div>
                    </div>
                `
                  )
                  .join("")}
            </div>
            <div class="manage-modal-actions">
                <button class="add-more-btn" onclick="closeImageModal(); addMoreImages('${discrepancyId}')">
                    ➕ Add More Images
                </button>
                <button class="done-managing-btn" onclick="closeImageModal()">
                    ✅ Done Managing
                </button>
            </div>
        </div>
    `;

  document.body.appendChild(modal);

  // Close modal when clicking outside
  modal.addEventListener("click", function (e) {
    if (e.target === modal) {
      closeImageModal();
    }
  });
}

// Delete individual image
function deleteImage(discrepancyId, filename, buttonElement) {
  if (
    confirm(
      `Are you sure you want to delete this image?\n\nFilename: ${filename}\n\nThis action cannot be undone.`
    )
  ) {
    showNotification("Deleting image...", "info");

    fetch(`/api/discrepancies/${discrepancyId}/image/${filename}`, {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          showNotification("Image deleted successfully!", "success");

          // Remove the image from the modal
          const imageItem = buttonElement.closest(".manage-image-item");
          imageItem.style.opacity = "0.5";
          imageItem.style.pointerEvents = "none";

          // Refresh after a short delay
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          showNotification(
            "Error deleting image: " + (data.error || "Unknown error"),
            "error"
          );
        }
      })
      .catch((error) => {
        console.error("Delete error:", error);
        showNotification("Error deleting image: " + error.message, "error");
      });
  }
}
