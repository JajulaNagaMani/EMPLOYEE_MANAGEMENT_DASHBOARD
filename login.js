const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    const response = await fetch("http://localhost:5000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (data.success) {
      alert("Login Successful! Redirecting...");
      sessionStorage.setItem("loggedInUser", JSON.stringify(data.user));
      window.location.href = "../dashboard/dashboard.html";
    } else {
      alert("Invalid Credentials!");
    }

  } catch (error) {
    console.error("Login error:", error);
    alert("Server error!");
  }
});
