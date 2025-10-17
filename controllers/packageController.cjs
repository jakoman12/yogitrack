const Package = require("../models/packageModel.cjs");

// Get all packages
exports.getAllPackages = async (req, res) => {
  try {
    const packages = await Package.find();
    res.json(packages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//auto generate package id
async function nextId(prefix) {
    const last = await Package.find({packageId: new RegExp(`^${prefix}\\d+$`)})
    .sort({packageId: -1})
    .limit(1);
    if (!last.length) return `${prefix}001`;
    const n = parseInt(last[0].packageId.slice(1), 10) + 1;
    return `${prefix}${String(n).padStart(3, "0")}`;
}

// Add a new package
exports.addPackage = async (req, res) => {
  try {
    const { packageName, category, numberOfClasses, classType, startDate, endDate, price } = req.body;

    if (!packageName || !price)
      return res.status(400).json({ message: "Missing required fields" });
    if (!["General", "Senior"].includes(category)) {
      return res.status(400).json({ message: "Invalid category" });
    }
    if (!["1", "4", "10", "unlimited"].includes(String(numberOfClasses))) {
      return res.status(400).json({ message: "Invalid numberOfClasses" });
    }
    if (!["General", "Special"].includes(classType)) {
      return res.status(400).json({ message: "Invalid classType" });
    }

    const s = new Date(startDate);
    const e = new Date(endDate);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) {
      return res.status(400).json({ message: "Invalid start/end date" });
    }
    if (e < s) {
      return res.status(400).json({ message: "End date must be after start date" });
    }
    const priceNum = Number(price);
    if (isNaN(priceNum) || priceNum < 0) {
      return res.status(400).json({ message: "Invalid price" });
    }

    // generate packageId
    const prefix = category === "Senior" ? "S" : "P";
    const packageId = await nextId(prefix);

    const newPackage = new Package({
      packageId,
      packageName,
      category, 
      numberOfClasses: String(numberOfClasses),
      classType,
      startDate: s,
      endDate: e,
      price: priceNum
    });

    await newPackage.save();
    res.status(201).json({ message: "Package added successfully", package: newPackage });
  } catch (err) {
    res.status(500).json({ message: "Failed to add package", error: err.message });
  }
};
