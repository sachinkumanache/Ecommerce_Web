const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");

hamburger.addEventListener("click", () => {
  navLinks.classList.toggle("active");
});

const form = document.getElementById("loginForm");

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const role = document.getElementById("role").value;

  if (!role) {
    alert("Please select a role!");
    return;
  }

  let storedData =
    JSON.parse(localStorage.getItem(role === "user" ? "users" : "vendors")) ||
    [];

  const userFound = storedData.find(
    (item) => item.email === email && item.password === password
  );

  if (userFound) {
    alert(
      `${role === "user" ? "User" : "Vendor"} ${
        userFound.email
      } logged in successfully!`
    );
    localStorage.setItem(
      "loggedInUser",
      JSON.stringify({ ...userFound, role })
    );
    if (role === "vendor") {
      window.location.href = "./vendersDashboard.html";
    } else {
      console.log(" moved to home page");
      window.location.href = "../index.html";
    }
  } else {
    alert("Invalid credentials!");
  }

  form.reset();
});
