const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");

hamburger.addEventListener("click", () => {
  navLinks.classList.toggle("active");
});

const form = document.getElementById("signupForm");

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const role = document.getElementById("role").value;

  if (!role) {
    alert("Please select a role!");
    return;
  }

  const newUser = { name, email, password };

  if (role === "user") {
    let users = JSON.parse(localStorage.getItem("users")) || [];
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));
    alert("User signed up!");
  } else if (role === "vendor") {
    let vendors = JSON.parse(localStorage.getItem("vendors")) || [];
    vendors.push(newUser);
    localStorage.setItem("vendors", JSON.stringify(vendors));
    alert("Vendor signed up!");
  }

  form.reset();
  window.location.href = "./log.html";
});
