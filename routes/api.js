const express = require("express");
const router = express.Router();
const data = require("../data/deliveries");

// GET /api/deliveries - Get all deliveries with filtering
router.get("/deliveries", (req, res) => {
  try {
    const {
      search,
      status,
      division,
      auditor,
      limit = 50,
      offset = 0,
    } = req.query;
    let deliveries = data.getAllDeliveries();

    // Apply filters (same logic as main route)
    if (search) {
      const searchLower = search.toLowerCase();
      deliveries = deliveries.filter(
        (delivery) =>
          delivery.giaNumber.toLowerCase().includes(searchLower) ||
          delivery.deliveryRef.toLowerCase().includes(searchLower) ||
          delivery.division.toLowerCase().includes(searchLower) ||
          delivery.stockOwner.toLowerCase().includes(searchLower) ||
          delivery.auditorName.toLowerCase().includes(searchLower)
      );
    }

    if (status) deliveries = deliveries.filter((d) => d.status === status);
    if (division)
      deliveries = deliveries.filter((d) => d.division === division);
    if (auditor)
      deliveries = deliveries.filter((d) => d.auditorName === auditor);

    // Pagination
    const total = deliveries.length;
    const paginatedDeliveries = deliveries.slice(
      parseInt(offset),
      parseInt(offset) + parseInt(limit)
    );

    res.json({
      success: true,
      data: paginatedDeliveries,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < total,
      },
    });
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// GET /api/deliveries/:giaNumber - Get specific delivery
router.get("/deliveries/:giaNumber", (req, res) => {
  try {
    const delivery = data.getDeliveryByGia(req.params.giaNumber);

    if (!delivery) {
      return res.status(404).json({
        success: false,
        error: "Delivery not found",
      });
    }

    const discrepancies = data.getDiscrepanciesByGia(req.params.giaNumber);

    res.json({
      success: true,
      data: {
        ...delivery,
        discrepancies,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// POST /api/deliveries - Create new delivery
router.post("/deliveries", (req, res) => {
  try {
    const newDelivery = data.addDelivery(req.body);

    res.status(201).json({
      success: true,
      data: newDelivery,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// PUT /api/deliveries/:giaNumber/status - Update delivery status
router.put("/deliveries/:giaNumber/status", (req, res) => {
  try {
    const { status } = req.body;
    const delivery = data.getDeliveryByGia(req.params.giaNumber);

    if (!delivery) {
      return res.status(404).json({
        success: false,
        error: "Delivery not found",
      });
    }

    const updatedDelivery = data.updateDelivery(delivery.id, { status });

    res.json({
      success: true,
      data: updatedDelivery,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// PUT /api/deliveries/:giaNumber/field - Update specific delivery field by GIA number
router.put("/deliveries/:giaNumber/field", (req, res) => {
  try {
    // Find delivery by GIA number first
    const delivery = data.getDeliveryByGia(req.params.giaNumber);

    if (!delivery) {
      return res.status(404).json({
        success: false,
        error: "Delivery not found",
      });
    }

    // Update using the delivery ID
    const updatedDelivery = data.updateDelivery(delivery.id, req.body);

    res.json({
      success: true,
      data: updatedDelivery,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// GET /api/stats - Get dashboard statistics
router.get("/stats", (req, res) => {
  try {
    const stats = data.getStats();
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// DELETE /api/deliveries/:id - Delete delivery
router.delete("/deliveries/:id", (req, res) => {
  try {
    const deletedDelivery = data.deleteDelivery(req.params.id);

    if (!deletedDelivery) {
      return res.status(404).json({
        success: false,
        error: "Delivery not found",
      });
    }

    res.json({
      success: true,
      message: "Delivery deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// DELETE /discrepancies/:id/image/:filename - Delete specific image
router.delete("/discrepancies/:id/image/:filename", (req, res) => {
  try {
    const { id, filename } = req.params;
    const fs = require("fs");
    const path = require("path");

    // Find the discrepancy
    const discrepancy = data.discrepancies.find((d) => d.id === id);

    if (!discrepancy) {
      return res.status(404).json({
        success: false,
        error: "Discrepancy not found",
      });
    }

    // Remove filename from pictures array
    const updatedPictures = (discrepancy.pictures || []).filter(
      (pic) => pic !== filename
    );

    // Update discrepancy
    const updatedDiscrepancy = data.updateDiscrepancy(id, {
      pictures: updatedPictures,
    });

    // Delete physical file
    const filePath = path.join(__dirname, "../public/uploads", filename);
    fs.unlink(filePath, (err) => {
      if (err) {
        console.log("Could not delete file:", err);
        // Don't fail the request if file doesn't exist
      }
    });

    res.json({
      success: true,
      data: updatedDiscrepancy,
      message: "Image deleted successfully",
    });
  } catch (error) {
    console.error("Delete image error:", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
