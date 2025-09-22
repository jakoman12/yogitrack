document.addEventListener("DOMContentLoaded", () => {
  loadClassList();

  const form = document.getElementById("classForm");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const classData = {
      className: formData.get("className"),
      instructorId: formData.get("instructorId"),
      classType: formData.get("classType"),
      description: formData.get("description"),
      daytime: [
        {
          day: formData.get("day"),
          time: formData.get("time"),
          duration: parseInt(formData.get("duration"))
        }
      ]
    };

    try {
        console.log("Submitting class data:", classData);

      const res = await fetch("/api/class/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(classData)
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to add class");

      alert(`Class ${result.class.classId || ""} added successfully!`);
      form.reset();
      loadClassList(); // refresh the right-hand list
    } catch (err) {
      alert("Error: " + err.message);
    }
  });
});

// Fetch and display classes in right-hand list
async function loadClassList() {
  try {
    const res = await fetch("/api/class/getAllClasses");
    const classes = await res.json();

    const ul = document.getElementById("classList");
    ul.innerHTML = "";

    classes.forEach(cls => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${cls.className}</strong> 
        (${cls.classType}) <br>
        Instructor: ${cls.instructorId} <br>
        ${cls.daytime.map(d => `${d.day} ${d.time}`).join(", ")}
      `;
      ul.appendChild(li);
    });
  } catch (err) {
    console.error("Failed to load classes:", err);
  }
}
 