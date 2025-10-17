const Customer = require("../models/customerModel.cjs");

exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find();
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Auto generate customer ID with prefix 'C'
async function nextId() {
    const last = await Customer.find({customerId: new RegExp(`^C\\d+$`)})
    .sort({customerId: -1})
    .limit(1);
    if (!last.length) return "C001";
    const n = parseInt(last[0].customerId.slice(1), 10) + 1;
    return `C${String(n).padStart(3, "0")}`;
}

async function checkDuplicateName(firstName, lastName) {
  const existing = await Customer.findOne({ 
    firstName: firstName, 
    lastName: lastName 
  });
  return existing;
}

exports.addCustomer = async (req, res) => {
  try {
    const { firstName, lastName, address, phone, email, preferredContact, confirmDuplicate } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !address || !phone || !email || !preferredContact) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    if (!["phone", "email"].includes(preferredContact)) {
      return res.status(400).json({ message: "Invalid preferred contact method" });
    }

    // Check for duplicate name
    const duplicate = await checkDuplicateName(firstName, lastName);
    if (duplicate && !confirmDuplicate) {
      return res.status(409).json({ 
        message: "Customer with this name already exists. Please confirm if you want to add another customer with the same name.",
        isDuplicate: true,
        existingCustomer: duplicate
      });
    }

    // Generate customer ID
    const customerId = await nextId();

    const newCustomer = new Customer({
      customerId,
      firstName,
      lastName,
      address,
      phone,
      email,
      preferredContact,
      classBalance: 0
    });

    await newCustomer.save();

    const confirmationMessage = `Welcome to Yoga'Hom! ... Your customer id is ${customerId}.`;
    
    res.status(201).json({ 
      message: "Customer added successfully", 
      customer: newCustomer,
      confirmationSent: {
        method: preferredContact,
        to: preferredContact === "email" ? email : phone,
        message: confirmationMessage
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to add customer", error: err.message });
  }
};
