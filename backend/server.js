const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Serve frontend files
app.use(express.static(path.join(__dirname, "frontend")));

const employeesFile = path.join(__dirname, "employees.json");
const attendanceFile = path.join(__dirname, "attendance.json");

// GET employees (all or single)
app.get("/employees/:id?", (req, res) => {
  fs.readFile(employeesFile, "utf-8", (err, data) => {
    if (err) return res.status(500).json([]);
    const employees = JSON.parse(data || "[]");

    if (req.params.id) {
      const emp = employees.find(e => e.id === parseInt(req.params.id));
      return res.json(emp ? [emp] : []);
    }

    res.json(employees);
  });
});

// LOGIN
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Hardcoded admin
  if (email === "admin@example.com" && password === "admin") {
    return res.json({
      success: true,
      user: { id: 0, name: "Admin", email, role: "admin", salary: 0 }
    });
  }

  fs.readFile(employeesFile, "utf-8", (err, data) => {
    if (err) return res.status(500).json({ success: false });
    const employees = JSON.parse(data || "[]");
    const user = employees.find(e => e.email === email && e.password === password);

    if (user) res.json({ success: true, user });
    else res.json({ success: false, message: "Invalid credentials" });
  });
});

// ADD employee
app.post("/employees", (req, res) => {
  fs.readFile(employeesFile, "utf-8", (err, data) => {
    if (err) return res.status(500).send("Error reading employees file");

    const employees = JSON.parse(data || "[]");
    const newEmp = { id: Date.now(), ...req.body };
    employees.push(newEmp);

    fs.writeFile(employeesFile, JSON.stringify(employees, null, 2), (err) => {
      if (err) return res.status(500).send("Error saving employee");
      res.json(newEmp);
    });
  });
});

// DELETE employee
app.delete("/employees/:id", (req, res) => {
  const id = parseInt(req.params.id);
  fs.readFile(employeesFile, "utf-8", (err, data) => {
    if (err) return res.status(500).send("Error reading employees file");

    let employees = JSON.parse(data || "[]");
    employees = employees.filter(e => e.id !== id);

    fs.writeFile(employeesFile, JSON.stringify(employees, null, 2), (err) => {
      if (err) return res.status(500).send("Error deleting employee");
      res.json({ success: true });
    });
  });
});

// GET attendance
app.get("/attendance", (req, res) => {
  fs.readFile(attendanceFile, "utf-8", (err, data) => {
    if (err) return res.status(500).json([]);
    res.json(JSON.parse(data || "[]"));
  });
});

// UPDATE attendance
app.put("/attendance/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const { attendance } = req.body;

  fs.readFile(attendanceFile, "utf-8", (err, data) => {
    if (err) return res.status(500).json({ success: false });

    let attendanceData = JSON.parse(data || "[]");
    const idx = attendanceData.findIndex(a => a.id === id);

    if (idx !== -1) attendanceData[idx].attendance = attendance;
    else attendanceData.push({ id, attendance });

    fs.writeFile(attendanceFile, JSON.stringify(attendanceData, null, 2), (err) => {
      if (err) return res.status(500).json({ success: false });
      res.json({ success: true });
    });
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
