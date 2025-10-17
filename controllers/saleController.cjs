const Sale = require("../models/saleModel.cjs");
const Customer = require("../models/customerModel.cjs");
const Package = require("../models/packageModel.cjs");

exports.getAllSales = async (req, res) => {
  try {
    const sales = await Sale.find();
    res.json(sales);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

async function nextSaleId() {
    const last = await Sale.find()
    .sort({saleId: -1})
    .limit(1);
    if (!last.length) return 101;
    return last[0].saleId + 1;
}

exports.recordSale = async (req, res) => {
  try {
    const { customerId, packageId, amountPaid, modeOfPayment, validityStartDate, validityEndDate } = req.body;

    if (!customerId || !packageId || !amountPaid || !modeOfPayment || !validityStartDate || !validityEndDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!["cash", "card", "online"].includes(modeOfPayment)) {
      return res.status(400).json({ message: "Invalid mode of payment" });
    }

    const customer = await Customer.findOne({ customerId });
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const pkg = await Package.findOne({ packageId });
    if (!pkg) {
      return res.status(404).json({ message: "Package not found" });
    }

    if (parseFloat(amountPaid) !== parseFloat(pkg.price)) {
      return res.status(400).json({ 
        message: `Amount paid (${amountPaid}) does not match package price (${pkg.price})` 
      });
    }

    const startDate = new Date(validityStartDate);
    const endDate = new Date(validityEndDate);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ message: "Invalid validity dates" });
    }

    if (endDate <= startDate) {
      return res.status(400).json({ message: "End date must be after start date" });
    }

    const saleId = await nextSaleId();
    const paymentDateTime = new Date();

    const newSale = new Sale({
      saleId,
      customerId,
      packageId,
      amountPaid: parseFloat(amountPaid),
      modeOfPayment,
      paymentDateTime,
      validityStartDate: startDate,
      validityEndDate: endDate
    });

    await newSale.save();

    let classesToAdd = 0;
    if (pkg.numberOfClasses === "unlimited") {
      classesToAdd = 999;
    } else {
      classesToAdd = parseInt(pkg.numberOfClasses);
    }

    customer.classBalance = (customer.classBalance || 0) + classesToAdd;
    await customer.save();

    res.status(201).json({ 
      message: "Sale recorded successfully", 
      sale: newSale,
      customer: {
        customerId: customer.customerId,
        name: `${customer.firstName} ${customer.lastName}`,
        newClassBalance: customer.classBalance
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to record sale", error: err.message });
  }
};
