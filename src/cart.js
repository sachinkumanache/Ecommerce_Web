const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");

hamburger.addEventListener("click", () => {
  navLinks.classList.toggle("active");
});

let loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
if (!loggedInUser) {
  setTimeout(() => {
    window.location.href = "../Pages/log.html";
  }, 3000);
} else {
  document.getElementById("logInUser").innerText = "Logout";
}
document.getElementById("userName").innerHTML = loggedInUser.name;
document.getElementById("userName").classList.add("username-style");
document.addEventListener("DOMContentLoaded", () => {
  fetchCartDataForUser();
});

async function fetchCartDataForUser() {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!user || !user.email) {
    alert("Please log in to view your cart.");
    return;
  }

  try {
    const res = await fetch(
      "https://ecommerce-30871-default-rtdb.asia-southeast1.firebasedatabase.app/Cart.json"
    );
    const data = await res.json();
    console.log(data);
    const userCartItems = Object.entries(data ?? [])
      .map(([id, product]) => {
        return { id, ...product };
      })
      .filter((item) => item.loggedInUser === user.email);
    console.log(userCartItems);
    document.getElementById("cartCount").innerText = userCartItems.length;
    let totalAmount = userCartItems.reduce((acc, element) => {
      return acc + element.price;
    }, 0);
    console.log(totalAmount);
    document.getElementById("total").innerText = totalAmount;
    renderUserCart(userCartItems);
  } catch (err) {
    console.error("Error fetching cart data:", err);
    alert("Failed to load your cart.");
  }
}

function renderUserCart(cartItems) {
  const cartContainer = document.getElementById("userCart");
  cartContainer.innerHTML = "";

  if (cartItems.length === 0) {
    cartContainer.innerHTML = "<p>No items in your cart.</p>";
    // setTimeout(() => {
    //   window.location.href = "index.html";
    // }, 2000);
    return;
  }

  cartItems.forEach((item) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${item.image}" alt="${item.name}" />
      <h3>${item.name}</h3>
      <p>Category: ${item.category}</p>
      <p>Price: ₹${item.price}</p>
      <p>Rating: ${item.rating} ★</p>
      <button class="remove-cart-btn" onclick="removeCartItem('${item.id}')">Remove</button> 
    `;
    cartContainer.appendChild(card);
  });
}
document.getElementById("Buybtn").addEventListener("click", () => {
  window.location.href = "./checkout.html";
});

async function removeCartItem(id) {
  let res = await fetch(
    `https://ecommerce-30871-default-rtdb.asia-southeast1.firebasedatabase.app/Cart/${id}.json`,
    {
      method: "DELETE",
    }
  );
  fetchCartDataForUser();
}

function loggedOut() {
  localStorage.removeItem("loggedInUser");
  document.getElementById("logInUser").innerText = "LoggedIn";
}
