// Auto-hide notifications
document.addEventListener("DOMContentLoaded", function () {
  const notification = document.getElementById("notification");
  if (notification) {
    setTimeout(() => {
      notification.style.animation = "slideOut 0.3s ease-in forwards";
      setTimeout(() => notification.remove(), 300);
    }, 5000);
  }

  // Auto-submit form on filter change
  const filterForm = document.getElementById("filterForm");
  if (filterForm) {
    const inputs = filterForm.querySelectorAll("input, select");
    inputs.forEach((input) => {
      input.addEventListener("change", function () {
        filterForm.submit();
      });
    });

    // Debounce search input
    const searchInput = filterForm.querySelector('input[name="search"]');
    if (searchInput) {
      let searchTimeout;
      searchInput.addEventListener("input", function () {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          filterForm.submit();
        }, 500);
      });
    }
  }

  // Add loading states to buttons
  document.querySelectorAll('button[type="submit"]').forEach((button) => {
    button.addEventListener("click", function () {
      if (!this.disabled) {
        const originalText = this.innerHTML;
        this.innerHTML = '<div class="loading"></div> Loading...';
        this.disabled = true;

        // Re-enable after form submission
        setTimeout(() => {
          this.innerHTML = originalText;
          this.disabled = false;
        }, 3000);
      }
    });
  });
});

// Refresh data function
function refreshData() {
  window.location.reload();
}

// Export data function
function exportData() {
  showNotification("Generating export...", "info");

  // Create CSV content from current table data
  const table = document.querySelector(".table");
  if (!table) return;

  const rows = Array.from(table.querySelectorAll("tr"));
  const csvContent = rows
    .map((row) => {
      const cells = Array.from(row.querySelectorAll("th, td"));
      return cells
        .map((cell) => {
          // Clean cell content
          const text = cell.textContent.trim();
          // Escape commas and quotes
          return text.includes(",") ? `"${text.replace(/"/g, '""')}"` : text;
        })
        .join(",");
    })
    .join("\n");

  // Download CSV
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "Finished_GIA_Report.csv";
  a.click();
  window.URL.revokeObjectURL(url);

  showNotification("Export completed successfully!", "success");
}

// Mark delivery as reported (in real application when an signs off the state should change )
function markAsReported(deliveryId, giaNumber) {
  if (confirm(`Mark delivery #${giaNumber} as reported?`)) {
    showNotification("Updating status...", "info");

    fetch(`/api/deliveries/${giaNumber}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "Reported" }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          showNotification("Delivery marked as reported!", "success");
          setTimeout(() => window.location.reload(), 1000);
        } else {
          showNotification("Error updating status", "error");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        showNotification("Error updating status", "error");
      });
  }
}

// Export specific delivery report
function exportReport(giaNumber) {
  showNotification("Generating delivery report...", "info");

  fetch(`/api/deliveries/${giaNumber}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        const delivery = data.data;

        // Create detailed CSV
        const csvContent = [
          ["Field", "Value"],
          ["GIA Number", delivery.giaNumber],
          ["Delivery ID", delivery.deliveryId],
          ["ASN Type", delivery.asnType],
          ["Supplier", delivery.supplierName],
          ["Division", delivery.division],
          ["Stock Owner", delivery.stockOwner],
          [
            "Finished Date",
            new Date(delivery.finishedDate).toLocaleDateString(),
          ],
          ["Inventory Admin", delivery.auditorName],
          ["Status", delivery.status],
          ["Auditor", delivery.auditorName],
          [""],
          ["Discrepancies"],
          [
            "Type",
            "Product ID",
            "Barcode",
            "Title",
            "Expected",
            "Received Good",
            "Received Damaged",
            "Difference",
            "Comments",
            "Status",
          ],
          ...delivery.discrepancies.map((d) => [
            d.type,
            d.productId,
            d.barcode,
            d.title,
            d.expectedQty,
            d.receivedGood,
            d.receivedDamaged,
            d.difference,
            d.comments,
            d.status,
          ]),
        ]
          .map((row) => row.join(","))
          .join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `GIA_${giaNumber}_report.csv`;
        a.click();
        window.URL.revokeObjectURL(url);

        showNotification("Report exported successfully!", "success");
      } else {
        showNotification("Error generating report", "error");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      showNotification("Error generating report", "error");
    });
}

// Request recount
function requestRecount(giaNumber) {
  if (
    confirm(
      `Request a recount for GIA #${giaNumber}?\n\nThis will:\n• Notify the warehouse team\n• Update the status\n• Send an email to the inventory admin\n\nContinue?`
    )
  ) {
    showNotification("Submitting recount request...", "info");

    // In a real app, this would make an API call to Email service
    setTimeout(() => {
      showNotification("Recount request submitted successfully!", "success");

      // Update status indicators on page
      const statusCells = document.querySelectorAll(".status-cell");
      statusCells.forEach((cell) => {
        if (cell.textContent.includes("Awaiting")) {
          cell.textContent = "Recount Requested";
          cell.style.background = "#d1ecf1";
          cell.style.color = "#0c5460";
        }
      });
    }, 1000);
  }
}

// Upload image for discrepancy (another alternative will be to add links from a sharepoint folder )
function uploadImage(discrepancyId) {
  // Check if discrepancyId exists
  if (!discrepancyId || discrepancyId === "undefined") {
    showNotification("Invalid discrepancy ID", "error");
    return;
  }

  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.multiple = true;

  input.onchange = function (e) {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const formData = new FormData();
    files.forEach((file) => formData.append("pictures", file));

    showNotification("Uploading images...", "info");

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
            `${files.length} image(s) uploaded successfully!`,
            "success"
          )
        // Refresh the page to show updated images
        setTimeout(() => {
            window.location.reload();
        }, 1000);

          // Update the upload button
          const uploadBtn = document.querySelector(
            `button[onclick="uploadImage('${discrepancyId}')"]`
          );
          if (uploadBtn) {
            uploadBtn.innerHTML = `✅ ${data.uploadedFiles.length} files`;
            uploadBtn.className = "upload-btn uploaded";
            uploadBtn.onclick = null;
          }
        } else {
          showNotification("Error uploading images", "error");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        showNotification("Error uploading images", "error");
      });
  };

  input.click();
}

// Show notification
function showNotification(message, type = "info") {
  // Remove existing notifications
  const existing = document.querySelectorAll(".notification");
  existing.forEach((n) => n.remove());

  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 2rem;
        padding: 1rem 2rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
        font-weight: 500;
        max-width: 400px;
    `;

  const icons = {
    success: "✅",
    error: "⚠️",
    info: "ℹ️",
    warning: "⚠️",
  };

  notification.textContent = `${icons[type] || "ℹ️"} ${message}`;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease-in forwards";
    setTimeout(() => notification.remove(), 300);
  }, 4000);
}

// Form validation
function validateForm(form) {
  const requiredFields = form.querySelectorAll("[required]");
  let isValid = true;

  requiredFields.forEach((field) => {
    if (!field.value.trim()) {
      field.style.borderColor = "#dc3545";
      isValid = false;
    } else {
      field.style.borderColor = "#dee2e6";
    }
  });

  if (!isValid) {
    showNotification("Please fill in all required fields", "error");
  }

  return isValid;
}

// Add form validation to delivery forms
document.addEventListener("DOMContentLoaded", function () {
  const deliveryForm = document.querySelector(".delivery-form");
  if (deliveryForm) {
    deliveryForm.addEventListener("submit", function (e) {
      if (!validateForm(this)) {
        e.preventDefault();
      }
    });
  }
});

// Keyboard shortcuts
document.addEventListener("keydown", function (e) {
  // Ctrl/Cmd + K to focus search
  if ((e.ctrlKey || e.metaKey) && e.key === "k") {
    e.preventDefault();
    const searchInput = document.querySelector('input[name="search"]');
    if (searchInput) {
      searchInput.focus();
    }
  }

  // Ctrl/Cmd + N to add new delivery
  if ((e.ctrlKey || e.metaKey) && e.key === "n") {
    e.preventDefault();
    window.location.href = "/delivery/new";
  }

  // Escape to go back
  if (e.key === "Escape") {
    const backButton = document.querySelector(".breadcrumb a");
    if (backButton) {
      window.location.href = backButton.href;
    }
  }
});

// Enhanced inline editing for discrepancy table
function enableInlineEditing() {
  // Status options
  const statusOptions = [
    "New",
    "Awaiting Feedback from SC",
    "Awaiting Feedback from WH",
    "Awaiting Collection",
    "Awaiting Action from WH",
    "Closed",
    "Closed - Awaiting feedback on damages",
  ];

  // HQ Request options
  const hqRequestOptions = [
    "Close GIA",
    "Receipt",
    "Recount",
    "Dispose",
    "IB Collection",
    "Investigate",
    "Repack",
  ];
  // Make admin field editable
  const editableAdmin = document.querySelectorAll(".editable-admin");
  editableAdmin.forEach((field) => {
    field.addEventListener("dblclick", function () {
      if (this.querySelector("input")) return;

      const currentValue = this.textContent.trim();
      const deliveryId = this.dataset.deliveryId;

      this.innerHTML = `<input type="text" value="${currentValue}" style="
            width: 100%;
            border: 1px solid #00d4aa;
            border-radius: 4px;
            padding: 0.5rem;
            font-size: 1rem;
            background: white;
        ">`;

      const input = this.querySelector("input");
      input.focus();
      input.select();

      const saveEdit = () => {
        const newValue = input.value;
        this.textContent = newValue;

        // Update via API
        updateDeliveryField(deliveryId, "inventoryAdmin", newValue);
        showNotification("Inventory Admin updated", "success");
      };

      input.addEventListener("blur", saveEdit);
      input.addEventListener("keypress", function (e) {
        if (e.key === "Enter") saveEdit();
        if (e.key === "Escape") field.textContent = currentValue;
      });
    });
  });
  // Make comments editable
  const editableComments = document.querySelectorAll(".editable-comment");
  editableComments.forEach((cell) => {
    cell.addEventListener("dblclick", function () {
      if (this.querySelector("input")) return;

      const currentText = this.textContent.trim();
      const discrepancyId = this.dataset.discrepancyId;

      this.innerHTML = `<input type="text" value="${currentText}" style="
                width: 100%;
                border: 1px solid #00d4aa;
                border-radius: 4px;
                padding: 0.25rem;
                font-size: 0.8rem;
                background: white;
            ">`;

      const input = this.querySelector("input");
      input.focus();
      input.select();

      const saveEdit = () => {
        const newValue = input.value;
        this.textContent = newValue;

        // Save to server
        updateDiscrepancyField(discrepancyId, "comments", newValue);
        showNotification("Comment updated", "success");
      };

      input.addEventListener("blur", saveEdit);
      input.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
          saveEdit();
        }
        if (e.key === "Escape") {
          cell.textContent = currentText;
        }
      });
    });
  });

  // Make HQ comments editable
  const editableHqComments = document.querySelectorAll(".editable-hq-comment");
  editableHqComments.forEach((cell) => {
    cell.addEventListener("dblclick", function () {
      if (this.querySelector("input")) return;

      const currentText = this.textContent.trim();
      const discrepancyId = this.dataset.discrepancyId;

      this.innerHTML = `<input type="text" value="${currentText}" style="
                width: 100%;
                border: 1px solid #00d4aa;
                border-radius: 4px;
                padding: 0.25rem;
                font-size: 0.8rem;
                background: white;
            ">`;

      const input = this.querySelector("input");
      input.focus();
      input.select();

      const saveEdit = () => {
        const newValue = input.value;
        this.textContent = newValue;

        // Save to server
        updateDiscrepancyField(discrepancyId, "hqComment", newValue);
        showNotification("HQ Comment updated", "success");
      };

      input.addEventListener("blur", saveEdit);
      input.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
          saveEdit();
        }
        if (e.key === "Escape") {
          cell.textContent = currentText;
        }
      });
    });
  });

  // Make status editable with dropdown
  const editableStatus = document.querySelectorAll(".editable-status");
  editableStatus.forEach((cell) => {
    cell.addEventListener("dblclick", function () {
      if (this.querySelector("select")) return;

      const currentValue = this.textContent.trim();
      const discrepancyId = this.dataset.discrepancyId;

      const selectOptions = statusOptions
        .map(
          (option) =>
            `<option value="${option}" ${
              option === currentValue ? "selected" : ""
            }>${option}</option>`
        )
        .join("");

      this.innerHTML = `<select style="
                width: 100%;
                border: 1px solid #00d4aa;
                border-radius: 4px;
                padding: 0.25rem;
                font-size: 0.75rem;
                background: white;
            ">${selectOptions}</select>`;

      const select = this.querySelector("select");
      select.focus();

      const saveEdit = () => {
        const newValue = select.value;
        this.innerHTML = `<span class="status-cell">${newValue}</span>`;

        // Save to server
        updateDiscrepancyField(discrepancyId, "status", newValue);
        showNotification("Status updated", "success");
      };

      select.addEventListener("blur", saveEdit);
      select.addEventListener("change", saveEdit);
      select.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
          saveEdit();
        }
        if (e.key === "Escape") {
          cell.innerHTML = `<span class="status-cell">${currentValue}</span>`;
        }
      });
    });
  });

  // Make HQ Request editable with dropdown
  const editableHqRequest = document.querySelectorAll(".editable-hq-request");
  editableHqRequest.forEach((cell) => {
    cell.addEventListener("dblclick", function () {
      if (this.querySelector("select")) return;

      const currentValue = this.textContent.trim();
      const discrepancyId = this.dataset.discrepancyId;

      const selectOptions = hqRequestOptions
        .map(
          (option) =>
            `<option value="${option}" ${
              option === currentValue ? "selected" : ""
            }>${option}</option>`
        )
        .join("");

      this.innerHTML = `<select style="
                width: 100%;
                border: 1px solid #00d4aa;
                border-radius: 4px;
                padding: 0.25rem;
                font-size: 0.75rem;
                background: white;
            ">${selectOptions}</select>`;

      const select = this.querySelector("select");
      select.focus();

      const saveEdit = () => {
        const newValue = select.value;
        this.textContent = newValue;

        // Save to server
        updateDiscrepancyField(discrepancyId, "hqRequest", newValue);
        showNotification("HQ Request updated", "success");
      };

      select.addEventListener("blur", saveEdit);
      select.addEventListener("change", saveEdit);
      select.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
          saveEdit();
        }
        if (e.key === "Escape") {
          cell.textContent = currentValue;
        }
      });
    });
  });
}

// Function to update discrepancy fields via API
function updateDiscrepancyField(discrepancyId, field, value) {
  const updateData = {};
  updateData[field] = value;

  fetch(`/discrepancies/${discrepancyId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updateData),
  })
    .then((response) => response.json())
    .then((data) => {
      if (!data.success) {
        showNotification("Error updating field", "error");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      showNotification("Error updating field", "error");
    });
}

// Initialize inline editing and add tooltips
document.addEventListener("DOMContentLoaded", function () {
  enableInlineEditing();

  // Add tooltips for editable fields
  const editableFields = document.querySelectorAll(
    ".editable-comment, .editable-status, .editable-hq-request, .editable-hq-comment"
  );
  editableFields.forEach((field) => {
    field.title = "Double-click to edit";
    field.style.cursor = "pointer";
  });
});

// Real-time data updates (WebSocket simulation)
function initializeRealTimeUpdates() {
  // Simulate real-time updates every 30 seconds
  setInterval(() => {
    // Check for new data
    fetch("/api/stats")
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          // Update stats if they've changed
          const stats = data.data;
          updateStatsDisplay(stats);
        }
      })
      .catch((error) => console.log("Real-time update failed:", error));
  }, 30000);
}

function updateStatsDisplay(stats) {
  const elements = {
    total: document.querySelector(".stat-number"),
    reported: document.querySelectorAll(".stat-number")[1],
    pending: document.querySelectorAll(".stat-number")[2],
    rate: document.querySelectorAll(".stat-number")[3],
  };

  if (elements.total && elements.total.textContent !== stats.total.toString()) {
    elements.total.textContent = stats.total;
    elements.total.style.animation = "pulse 0.5s ease-in-out";
  }

  if (
    elements.reported &&
    elements.reported.textContent !== stats.reported.toString()
  ) {
    elements.reported.textContent = stats.reported;
    elements.reported.style.animation = "pulse 0.5s ease-in-out";
  }

  if (
    elements.pending &&
    elements.pending.textContent !== stats.pending.toString()
  ) {
    elements.pending.textContent = stats.pending;
    elements.pending.style.animation = "pulse 0.5s ease-in-out";
  }

  if (
    elements.rate &&
    elements.rate.textContent !== `${stats.completionRate}%`
  ) {
    elements.rate.textContent = `${stats.completionRate}%`;
    elements.rate.style.animation = "pulse 0.5s ease-in-out";
  }
}

// Initialize real-time updates on dashboard
if (window.location.pathname === "/") {
  document.addEventListener("DOMContentLoaded", initializeRealTimeUpdates);
}

// Add pulse animation
const pulseStyle = document.createElement("style");
pulseStyle.textContent = `
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
`;
document.head.appendChild(pulseStyle);

function updateDeliveryField(deliveryId, field, value) {
  const updateData = {};
  updateData[field] = value;

  // This would need a new API endpoint
  fetch(`/api/deliveries/${deliveryId}/field`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updateData),
  })
    .then((response) => response.json())
    .then((data) => {
      if (!data.success) {
        showNotification("Error updating field", "error");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      showNotification("Error updating field", "error");
    });
}
