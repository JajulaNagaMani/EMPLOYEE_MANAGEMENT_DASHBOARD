let employees = [];
let attendanceData = [];

const loggedInUser = JSON.parse(sessionStorage.getItem("loggedInUser"));

if (!loggedInUser) {
  alert("Please login first!");
  window.location.href = "../login/login.html";
}

// Only admin can see the add employee form
if (loggedInUser.role !== "admin") {
  document.querySelector(".form-container").style.display = "none";
}

// Fetch employees and attendance data
async function fetchEmployees() {
  try {
    let url = "http://localhost:5000/employees";
    if (loggedInUser.role !== "admin") {
      url += `/${loggedInUser.id}`;
    }

    const empResponse = await fetch(url);
    employees = await empResponse.json();

    const attResponse = await fetch("http://localhost:5000/attendance");
    attendanceData = await attResponse.json();

    renderTable();
    renderCharts();
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

// Render employee table
function renderTable() {
  const tbody = document.querySelector("#employeeTable tbody");
  tbody.innerHTML = "";

  employees.forEach(emp => {
    const att = attendanceData.find(a => a.id === emp.id)?.attendance || 0;
    const tr = document.createElement("tr");

    if (loggedInUser.role === "admin") {
      tr.innerHTML = `
        <td>${emp.name}</td>
        <td>${emp.email}</td>
        <td>${emp.salary || 0}</td>
        <td>
          <input type="number" id="att-${emp.id}" value="${att}" min="0" style="width:60px">
          <button onclick="updateAttendance(${emp.id})">Update</button>
        </td>
        <td>
          <button onclick="deleteEmployee(${emp.id})">Delete</button>
        </td>
      `;
    } else {
      tr.innerHTML = `
        <td>${emp.name}</td>
        <td>${emp.email}</td>
        <td>${emp.salary || 0}</td>
        <td>${att}</td>
        <td>-</td>
      `;
    }

    tbody.appendChild(tr);
  });
}

// Update attendance
async function updateAttendance(id) {
  const newAtt = parseInt(document.getElementById(`att-${id}`).value);
  if (isNaN(newAtt) || newAtt < 0) {
    alert("Invalid attendance value!");
    return;
  }

  await fetch(`http://localhost:5000/attendance/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ attendance: newAtt })
  });

  alert("Attendance updated successfully!");
  fetchEmployees();
}

// Delete employee
async function deleteEmployee(id) {
  if (!confirm("Are you sure to delete this employee?")) return;

  await fetch(`http://localhost:5000/employees/${id}`, { method: "DELETE" });
  alert("Employee deleted successfully!");
  fetchEmployees();
}

// Add employee
document.getElementById("addEmployee")?.addEventListener("click", async () => {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const salary = parseInt(document.getElementById("salary").value);

  if (!name || !email || !password || !salary) {
    alert("Please fill all fields!");
    return;
  }

  await fetch("http://localhost:5000/employees", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, salary, role: "employee" })
  });

  alert("Employee added successfully!");
  fetchEmployees();
});

// Render charts
let salaryChart, attendanceChart;

function renderCharts() {
  const names = employees.map(e => e.name);
  const salaries = employees.map(e => e.salary || 0);
  const attendanceArr = employees.map(e => attendanceData.find(a => a.id === e.id)?.attendance || 0);

  const colors = [
    "#4CAF50","#FF6384","#36A2EB","#FFCE56","#9966FF","#FF9F40",
    "#00A36C","#C70039","#900C3F","#581845"
  ];

  if (salaryChart) salaryChart.destroy();
  if (attendanceChart) attendanceChart.destroy();

  // Salary Bar Chart
  salaryChart = new Chart(document.getElementById("salaryChart"), {
    type: "bar",
    data: { labels: names, datasets: [{ label: "Salary", data: salaries, backgroundColor: "#4CAF50" }] },
    options: { responsive: true, plugins: { legend: { display: false } } }
  });

  // Attendance Pie Chart
  attendanceChart = new Chart(document.getElementById("attendanceChart"), {
    type: "pie",
    data: { labels: names, datasets: [{ label: "Attendance", data: attendanceArr, backgroundColor: colors.slice(0, names.length) }] },
    options: { responsive: true }
  });
}

// Initialize
fetchEmployees();
