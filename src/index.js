const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");

hamburger.addEventListener("click", () => {
  navLinks.classList.toggle("active");
});

// if user is not loggedIn then send to signup or loggedIn
// if (user || vender) {
//   setTimeout(() => {
//     window.location.href = "../Pages/signup.html";
//   }, 2000);
// }

let loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
if (!loggedInUser) {
  setTimeout(() => {
    window.location.href = "../Pages/log.html";
  }, 3000);
} else {
  document.getElementById("logInUser").innerText = "Logout";
  document.getElementById("userName").innerHTML = loggedInUser.name;
  document.getElementById("userName").classList.add("username-style");
}

const apiUrl =
  "https://ecommerce-30871-default-rtdb.asia-southeast1.firebasedatabase.app/Product.json";

let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
const itemsPerPage = 10;

// DOM Elements
const categoryFilter = document.getElementById("categoryFilter");
const priceFilter = document.getElementById("priceFilter");
const ratingFilter = document.getElementById("ratingFilter");
const productCards = document.getElementById("productCards");
const paginationControls = document.getElementById("paginationControls");

async function fetchProducts() {
  try {
    const res = await fetch(apiUrl);
    const data = await res.json();
    allProducts = Object.entries(data).map(([id, product]) => {
      return { id, ...product };
    });
    // console.log(allProducts);
    applyFilters();
  } catch (err) {
    console.error("Error fetching products:", err);
  }
}

function applyFilters() {
  const selectedCategory = categoryFilter.value;
  const selectedPrice = priceFilter.value;
  const selectedRating = parseFloat(ratingFilter.value);

  filteredProducts = allProducts.filter((product) => {
    const matchCategory = selectedCategory
      ? product.category === selectedCategory
      : true;

    const price = parseFloat(product.price);
    let matchPrice = true;
    if (selectedPrice) {
      const [min, max] = selectedPrice.split("-").map(Number);
      matchPrice = price >= min && price <= max;
    }

    const rating = parseFloat(product.rating);
    const matchRating = selectedRating ? rating >= selectedRating : true;

    return matchCategory && matchPrice && matchRating;
  });

  currentPage = 1;
  renderProducts();
  renderPagination();
}

function renderProducts() {
  productCards.innerHTML = "";
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const currentItems = filteredProducts.slice(start, end);

  if (currentItems.length === 0) {
    productCards.innerHTML = "<p>No products found.</p>";
    return;
  }

  currentItems.forEach((product) => {
    // console.log(product);
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}" />
      <h3>${product.name}</h3>
      <p>Category: ${product.category}</p>
      <p>Price: ₹${product.price}</p>
      <p>Rating: ${product.rating} ★</p>
      <button class="add-to-cart-btn" onclick="addToCart('${product.id}')">Add to Cart</button>
    `;
    productCards.appendChild(card);
  });
}

function renderPagination() {
  paginationControls.innerHTML = "";
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.classList.toggle("active", i === currentPage);
    btn.addEventListener("click", () => {
      currentPage = i;
      renderProducts();
      renderPagination();
    });
    paginationControls.appendChild(btn);
  }
}

// Filter events
categoryFilter.addEventListener("change", applyFilters);
priceFilter.addEventListener("change", applyFilters);
ratingFilter.addEventListener("change", applyFilters);

// Initial fetch
fetchProducts();

async function addToCart(id) {
  console.log(id);
  // console.log(loggedInUser.email);
  let res = await fetch(
    `https://ecommerce-30871-default-rtdb.asia-southeast1.firebasedatabase.app/Product/${id}.json`
  );
  let data = await res.json();
  let cartObj = {
    CartProductId: id,
    ...data,
    loggedInUser: loggedInUser.email,
  };
  console.log(cartObj);
  const response = await fetch(
    `https://ecommerce-30871-default-rtdb.asia-southeast1.firebasedatabase.app/Cart.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cartObj),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to upload product`);
  }
  showcartCount();
}
async function showcartCount() {
  const res2 = await fetch(
    "https://ecommerce-30871-default-rtdb.asia-southeast1.firebasedatabase.app/Cart.json"
  );
  const data2 = await res2.json();
  // console.log(data2);
  const userCartItems = Object.entries(data2 ?? [])
    .map(([id, product]) => {
      return { id, ...product };
    })
    .filter((item) => item.loggedInUser === loggedInUser.email);
  // console.log(userCartItems);
  document.getElementById("cartCount").innerText = userCartItems.length;
}
showcartCount();

function loggedOut() {
  localStorage.removeItem("loggedInUser");
  document.getElementById("logInUser").innerText = "LoggedIn";
}
