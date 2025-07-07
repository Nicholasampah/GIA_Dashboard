const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const data = require("../data/deliveries");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

// POST /discrepancies - Add new discrepancy
router.post("/", upload.array("pictures", 5), (req, res) => {
  try {
    const discrepancyData = {
      ...req.body,
      pictures: req.files ? req.files.map((file) => file.filename) : [],
    };

    const newDiscrepancy = data.addDiscrepancy(discrepancyData);

    res.status(201).json({
      success: true,
      data: newDiscrepancy,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// PUT /discrepancies/:id - Update discrepancy
router.put("/:id", (req, res) => {
  try {
    const updatedDiscrepancy = data.updateDiscrepancy(req.params.id, req.body);

    if (!updatedDiscrepancy) {
      return res.status(404).json({
        success: false,
        error: "Discrepancy not found",
      });
    }

    res.json({
      success: true,
      data: updatedDiscrepancy,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// POST /discrepancies/:id/upload - Upload images for discrepancy
// router.post('/:id/upload', upload.array('pictures', 5), (req, res) => {
//   try {
//     const discrepancy = data.discrepancies.find(d => d.id === req.params.id);

//     if (!discrepancy) {
//       return res.status(404).json({
//         success: false,
//         error: 'Discrepancy not found'
//       });
//     }

//     const newPictures = req.files ? req.files.map(file => file.filename) : [];
//     const updatedDiscrepancy = data.updateDiscrepancy(req.params.id, {
//       pictures: [...(discrepancy.pictures || []), ...newPictures]
//     });

//     res.json({
//       success: true,
//       data: updatedDiscrepancy,
//       uploadedFiles: newPictures
//     });
//   } catch (error) {
//     res.status(400).json({
//       success: false,
//       error: error.message
//     });
//   }
// });
router.post("/:id/upload", upload.array("pictures", 5), (req, res) => {
  try {
    console.log("Upload request for discrepancy ID:", req.params.id);
    console.log("Files received:", req.files);

    const discrepancy = data.discrepancies.find((d) => d.id === req.params.id);

    if (!discrepancy) {
      console.log("Discrepancy not found");
      return res.status(404).json({
        success: false,
        error: "Discrepancy not found",
      });
    }

    const newPictures = req.files ? req.files.map((file) => file.filename) : [];
    const updatedDiscrepancy = data.updateDiscrepancy(req.params.id, {
      pictures: [...(discrepancy.pictures || []), ...newPictures],
    });

    res.json({
      success: true,
      data: updatedDiscrepancy,
      uploadedFiles: newPictures,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
