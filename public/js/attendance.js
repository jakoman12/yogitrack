let instructors = [];
let customers = [];
let selectedClass = null;

async function loadInstructors() {
  try {
    const res = await fetch("/api/instructor/getAll");
    instructors = await res.json();
    
    const select = document.getElementById("instructorSelect");
    select.innerHTML = '<option value="">Select Instructor...</option>';
    
    instructors.forEach(instructor => {
      const option = document.createElement("option");
      option.value = instructor.instructorId;
      option.textContent = `${instructor.instructorId} - ${instructor.firstname} ${instructor.lastname}`;
      select.appendChild(option);
    });
  } catch (err) {
    console.error("❌ Failed to load instructors:", err);
  }
}

async function loadInstructorClasses(instructorId) {
  try {
    const res = await fetch(`/api/attendance/instructor/${instructorId}/classes`);
    const classes = await res.json();
    
    const select = document.getElementById("classSelect");
    select.innerHTML = '<option value="">Select Class...</option>';
    select.disabled = false;
    
    classes.forEach(cls => {
      const option = document.createElement("option");
      option.value = cls.classId;
      option.textContent = `${cls.className} - ${cls.day || 'N/A'} ${cls.time || 'N/A'}`;
      option.dataset.day = cls.day || '';
      option.dataset.time = cls.time || '';
      select.appendChild(option);
    });
  } catch (err) {
    console.error("❌ Failed to load classes:", err);
  }
}

async function loadCustomers() {
  try {
    const res = await fetch("/api/customer/getAll");
    customers = await res.json();
    
    const container = document.getElementById("customerCheckboxes");
    container.innerHTML = "";
    
    customers.forEach(customer => {
      const label = document.createElement("label");
      label.style.display = "block";
      label.style.padding = "5px 0";
      
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = customer.customerId;
      checkbox.name = "customers";
      checkbox.id = `customer-${customer.customerId}`;
      
      label.appendChild(checkbox);
      label.appendChild(document.createTextNode(
        ` ${customer.customerId} - ${customer.firstName} ${customer.lastName} (Balance: ${customer.classBalance || 0})`
      ));
      
      container.appendChild(label);
    });
  } catch (err) {
    console.error("❌ Failed to load customers:", err);
    document.getElementById("customerCheckboxes").innerHTML = "<p>Error loading customers</p>";
  }
}

document.getElementById("instructorSelect").addEventListener("change", (e) => {
  const instructorId = e.target.value;
  if (instructorId) {
    loadInstructorClasses(instructorId);
    document.getElementById("scheduleInfo").style.display = "none";
    document.getElementById("classSelect").disabled = false;
  } else {
    document.getElementById("classSelect").disabled = true;
    document.getElementById("classSelect").innerHTML = '<option value="">Select Class...</option>';
    document.getElementById("scheduleInfo").style.display = "none";
  }
});

document.getElementById("classSelect").addEventListener("change", (e) => {
  const selectedOption = e.target.options[e.target.selectedIndex];
  const day = selectedOption.dataset.day;
  const time = selectedOption.dataset.time;
  
  if (day && time) {
    selectedClass = { day, time };
    document.getElementById("scheduleDetails").textContent = `${day} at ${time}`;
    document.getElementById("scheduleInfo").style.display = "block";
    checkScheduleMatch();
  } else {
    selectedClass = null;
    document.getElementById("scheduleInfo").style.display = "none";
  }
});

function checkScheduleMatch() {
  if (!selectedClass) return;
  
  const dateInput = document.getElementById("attendanceDate").value;
  const timeInput = document.getElementById("attendanceTime").value;
  
  if (dateInput && timeInput) {
    const date = new Date(dateInput);
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' });
    
    const warnings = [];
    if (dayOfWeek !== selectedClass.day) {
      warnings.push(`Date is ${dayOfWeek} but class is scheduled for ${selectedClass.day}`);
    }
    if (timeInput !== selectedClass.time) {
      warnings.push(`Time is ${timeInput} but class is scheduled for ${selectedClass.time}`);
    }
    
    if (warnings.length > 0) {
      document.getElementById("warningMessage").textContent = warnings.join(". ");
      document.getElementById("scheduleWarning").style.display = "block";
    } else {
      document.getElementById("scheduleWarning").style.display = "none";
    }
  }
}

document.getElementById("attendanceDate").addEventListener("change", checkScheduleMatch);
document.getElementById("attendanceTime").addEventListener("change", checkScheduleMatch);

document.getElementById("recordAttendanceBtn").addEventListener("click", async () => {
  const form = document.getElementById("attendanceForm");
  const instructorId = form.instructorId.value;
  const classId = form.classId.value;
  const date = form.date.value;
  const time = form.time.value;
  
  const checkboxes = document.querySelectorAll('input[name="customers"]:checked');
  const customerIds = Array.from(checkboxes).map(cb => cb.value);
  
  if (!instructorId || !classId || !date || !time) {
    alert("❌ Please fill in all required fields");
    return;
  }
  
  if (customerIds.length === 0) {
    alert("❌ Please select at least one customer");
    return;
  }
  
  const attendanceData = {
    instructorId,
    classId,
    date,
    time,
    customerIds
  };
  
  try {
    const res = await fetch("/api/attendance/record", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(attendanceData)
    });
    
    const result = await res.json();
    
    if (res.status === 409 && result.requiresConfirmation) {
      const customerList = result.insufficientBalanceCustomers
        .map(c => `${c.name} (Current Balance: ${c.currentBalance})`)
        .join("\n");
      
      const confirmed = confirm(
        `⚠️ ${result.message}\n\n${customerList}\n\nThese customers will have a negative balance. Click OK to proceed anyway, or Cancel to make changes.`
      );
      
      if (confirmed) {
        const retryRes = await fetch("/api/attendance/record", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...attendanceData, allowNegativeBalance: true })
        });
        
        const retryResult = await retryRes.json();
        if (!retryRes.ok) throw new Error(retryResult.message || retryResult.error);
        
        showSuccessMessage(retryResult);
        form.reset();
        document.getElementById("classSelect").disabled = true;
        document.getElementById("scheduleInfo").style.display = "none";
        document.getElementById("scheduleWarning").style.display = "none";
        fetchAttendance();
        loadCustomers();
      }
      return;
    }
    
    if (!res.ok) throw new Error(result.message || result.error);
    
    showSuccessMessage(result);
    form.reset();
    document.getElementById("classSelect").disabled = true;
    document.getElementById("scheduleInfo").style.display = "none";
    document.getElementById("scheduleWarning").style.display = "none";
    fetchAttendance();
    loadCustomers();
  } catch (err) {
    alert(`❌ ${err.message}`);
  }
});

function showSuccessMessage(result) {
  let message = `✅ ${result.message}`;
  
  if (result.scheduleWarning) {
    message += `\n\n⚠️ ${result.scheduleWarning}`;
  }
  
  if (result.confirmations && result.confirmations.length > 0) {
    message += "\n\nConfirmations sent:\n";
    result.confirmations.forEach(conf => {
      message += `\n${conf.message}`;
    });
  }
  
  alert(message);
}

async function fetchAttendance() {
  try {
    const res = await fetch("/api/attendance/getAll");
    const attendance = await res.json();
    
    const list = document.getElementById("attendanceRecords");
    list.innerHTML = "";
    
    attendance.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10).forEach(record => {
      const li = document.createElement("li");
      const customerCount = record.customers ? record.customers.length : 0;
      li.innerHTML = `
        <strong>Attendance #${record.attendanceId || 'N/A'}</strong><br>
        Class: ${record.classId || 'N/A'} • Instructor: ${record.instructorId || 'N/A'}<br>
        Date: ${formatDate(record.date)} at ${record.time || 'N/A'}<br>
        Customers: ${customerCount} checked in
      `;
      list.appendChild(li);
    });
  } catch (err) {
    console.error("❌ Failed to load attendance:", err);
  }
}

document.getElementById("refreshBtn").addEventListener("click", fetchAttendance);

document.addEventListener("DOMContentLoaded", () => {
  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toTimeString().slice(0, 5);
  document.getElementById("attendanceDate").value = today;
  document.getElementById("attendanceTime").value = now;
  
  loadInstructors();
  loadCustomers();
  fetchAttendance();
});

function formatDate(dateString) {
  const d = new Date(dateString);
  return isNaN(d.getTime()) ? "-" : d.toLocaleDateString();
}
