async function fetchCustomers() {
  try {
    const res = await fetch("/api/customer/getAll");
    const customers = await res.json();

    const list = document.getElementById("customers");
    list.innerHTML = "";

    customers.forEach(customer => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${customer.firstName} ${customer.lastName}</strong> (${customer.customerId})<br>
        Email: ${customer.email} • Phone: ${customer.phone}<br>
        Address: ${customer.address}<br>
        Preferred Contact: ${customer.preferredContact} • Class Balance: ${customer.classBalance}
      `;
      list.appendChild(li);
    });
  } catch (err) {
    console.error("❌ Failed to load customers:", err);
  }
}

document.getElementById("addCustomerBtn").addEventListener("click", async () => {
  const form = document.getElementById("customerForm");
  const newCustomer = {
    firstName: form.firstName.value.trim(),
    lastName: form.lastName.value.trim(),
    address: form.address.value.trim(),
    phone: form.phone.value.trim(),
    email: form.email.value.trim(),
    preferredContact: form.preferredContact.value
  };

  try {
    const res = await fetch("/api/customer/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCustomer)
    });

    const result = await res.json();
    
    // Handle duplicate name scenario
    if (res.status === 409 && result.isDuplicate) {
      const confirmed = confirm(
        `${result.message}\n\nExisting customer: ${result.existingCustomer.customerId} - ${result.existingCustomer.firstName} ${result.existingCustomer.lastName}\n\nClick OK to add this customer anyway, or Cancel to make changes.`
      );
      
      if (confirmed) {
        // Retry with confirmation flag
        const retryRes = await fetch("/api/customer/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...newCustomer, confirmDuplicate: true })
        });
        
        const retryResult = await retryRes.json();
        if (!retryRes.ok) throw new Error(retryResult.message || retryResult.error);
        
        showSuccessMessage(retryResult);
        form.reset();
        fetchCustomers();
      }
      return;
    }
    
    if (!res.ok) throw new Error(result.message || result.error);

    showSuccessMessage(result);
    form.reset();
    fetchCustomers();
  } catch (err) {
    alert(`❌ ${err.message}`);
  }
});

function showSuccessMessage(result) {
  const confirmMsg = result.confirmationSent 
    ? `\n\nConfirmation sent via ${result.confirmationSent.method} to ${result.confirmationSent.to}:\n"${result.confirmationSent.message}"`
    : '';
  
  alert(`✅ ${result.message}${confirmMsg}`);
}

document.getElementById("refreshBtn").addEventListener("click", fetchCustomers);

document.addEventListener("DOMContentLoaded", fetchCustomers);
