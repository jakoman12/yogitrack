let customers = [];
let packages = [];

async function loadCustomers() {
  try {
    const res = await fetch("/api/customer/getAll");
    customers = await res.json();
    
    const select = document.getElementById("customerSelect");
    select.innerHTML = '<option value="">Select Customer...</option>';
    
    customers.forEach(customer => {
      const option = document.createElement("option");
      option.value = customer.customerId;
      option.textContent = `${customer.customerId} - ${customer.firstName} ${customer.lastName} (Balance: ${customer.classBalance})`;
      select.appendChild(option);
    });
  } catch (err) {
    console.error("❌ Failed to load customers:", err);
  }
}

async function loadPackages() {
  try {
    const res = await fetch("/api/package/getAll");
    packages = await res.json();
    
    const select = document.getElementById("packageSelect");
    select.innerHTML = '<option value="">Select Package...</option>';
    
    packages.forEach(pkg => {
      const option = document.createElement("option");
      option.value = pkg.packageId;
      option.textContent = `${pkg.packageId} - ${pkg.packageName} (${pkg.numberOfClasses} classes) - $${pkg.price}`;
      option.dataset.price = pkg.price;
      select.appendChild(option);
    });
  } catch (err) {
    console.error("❌ Failed to load packages:", err);
  }
}

document.getElementById("packageSelect").addEventListener("change", (e) => {
  const selectedOption = e.target.options[e.target.selectedIndex];
  const price = selectedOption.dataset.price;
  
  if (price) {
    document.getElementById("amountPaid").value = parseFloat(price).toFixed(2);
  } else {
    document.getElementById("amountPaid").value = "";
  }
});

async function fetchSales() {
  try {
    const res = await fetch("/api/sale/getAll");
    const sales = await res.json();

    const list = document.getElementById("sales");
    list.innerHTML = "";

    sales.forEach(sale => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>Sale #${sale.saleId}</strong><br>
        Customer: ${sale.customerId} • Package: ${sale.packageId}<br>
        Amount: $${sale.amountPaid.toFixed(2)} • Payment: ${sale.modeOfPayment}<br>
        Validity: ${formatDate(sale.validityStartDate)} → ${formatDate(sale.validityEndDate)}<br>
        Payment Date: ${formatDateTime(sale.paymentDateTime)}
      `;
      list.appendChild(li);
    });
  } catch (err) {
    console.error("❌ Failed to load sales:", err);
  }
}

document.getElementById("recordSaleBtn").addEventListener("click", async () => {
  const form = document.getElementById("saleForm");
  const newSale = {
    customerId: form.customerId.value,
    packageId: form.packageId.value,
    amountPaid: parseFloat(form.amountPaid.value),
    modeOfPayment: form.modeOfPayment.value,
    validityStartDate: form.validityStartDate.value,
    validityEndDate: form.validityEndDate.value
  };

  try {
    const res = await fetch("/api/sale/record", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newSale)
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.message || result.error);

    alert(`✅ ${result.message}\n\nCustomer: ${result.customer.name}\nNew Class Balance: ${result.customer.newClassBalance}`);
    form.reset();
    fetchSales();
    loadCustomers();
  } catch (err) {
    alert(`❌ ${err.message}`);
  }
});

document.getElementById("refreshBtn").addEventListener("click", fetchSales);

document.addEventListener("DOMContentLoaded", () => {
  loadCustomers();
  loadPackages();
  fetchSales();
});

function formatDate(dateString) {
  const d = new Date(dateString);
  return isNaN(d.getTime()) ? "-" : d.toLocaleDateString();
}

function formatDateTime(dateString) {
  const d = new Date(dateString);
  return isNaN(d.getTime()) ? "-" : d.toLocaleString();
}
