async function fetchPackages() {
  try {
    const res = await fetch("/api/package/getAll");
    const packages = await res.json();

    const list = document.getElementById("packages");
    list.innerHTML = "";

    packages.forEach(pkg => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${pkg.packageName}</strong> (${pkg.packageId})<br>
        Category: ${pkg.category} • Type: ${pkg.classType} • Classes: ${pkg.numberOfClasses}<br>
        ${formatDate(pkg.startDate)} → ${formatDate(pkg.endDate)} • $${Number(pkg.price).toFixed(2)}
      `;
      list.appendChild(li);
    });
  } catch (err) {
    console.error("❌ Failed to load packages:", err);
  }
}

// When user clicks “Add”
document.getElementById("addPackageBtn").addEventListener("click", async () => {
  const form = document.getElementById("packageForm");
  const newPackage = {
    packageName: form.packageName.value.trim(),
    category: form.category.value,
    numberOfClasses: form.numberOfClasses.value,
    classType: form.classType.value,
    startDate: form.startDate.value,
    endDate: form.endDate.value,
    price: parseFloat(form.price.value)
  };

  try {
    const res = await fetch("/api/package/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPackage)
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.message || result.error);

    alert(`✅ ${result.message}`);
    form.reset();
    fetchPackages();
  } catch (err) {
    alert(`❌ ${err.message}`);
  }
});

// Refresh list button
document.getElementById("refreshBtn").addEventListener("click", fetchPackages);

// Load packages when page opens
document.addEventListener("DOMContentLoaded", fetchPackages);

// Format dates nicely
function formatDate(dateString) {
  const d = new Date(dateString);
  return isNaN(d.getTime()) ? "-" : d.toLocaleDateString();
}
