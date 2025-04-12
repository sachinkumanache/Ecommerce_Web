const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");

hamburger.addEventListener("click", () => {
  navLinks.classList.toggle("active");
});

let user = JSON.parse(localStorage.getItem("loggedInUser"));
if (user == null) {
  window.location.href = "../Pages/log.html";
}

if (user.role != "vendor") {
  window.location.href = "../index.html";
}
document.getElementById("userName").innerHTML = user.name;
document.getElementById("userName").classList.add("username-style");

if (document.getElementById("fromBtn").innerText == "Add Product") {
  document.getElementById("fromBtn").classList.add("green");
}

const form = document.getElementById("productForm");
let editingProductId = null;
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Construct product object
  const product = {
    name: form.name.value.trim(),
    description: form.description.value.trim(),
    price: parseFloat(form.price.value),
    category: form.category.value,
    image: form.image.value.trim(),
    vendor: form.vendor.value.trim(),
    rating: parseFloat(form.rating.value),
    stock: parseInt(form.stock.value),
    tags: form.tags.value
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag),
    dateAdded: new Date().toISOString(),
  };

  // Basic form validation
  if (!product.name || !product.price || !product.category) {
    alert("Please fill in all required fields.");
    return;
  }

  let btnName = document.getElementById("fromBtn").value;
  try {
    if (btnName == "Add Product") {
      const res = await fetch(
        "https://ecommerce-30871-default-rtdb.asia-southeast1.firebasedatabase.app/Product.json",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(product),
        }
      );

      if (!res.ok) throw new Error("Failed to save product.");

      const data = await res.json(); // wait for response
      console.log("Product saved:");

      alert("✅ Product added successfully!");
      fetchAndDisplayProducts();
      form.reset();
    } else {
      const res = await fetch(
        `https://ecommerce-30871-default-rtdb.asia-southeast1.firebasedatabase.app/Product/${editingProductId}.json`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(product),
        }
      );
      document.getElementById("fromBtn").innerText = "Add Product";
      if (!res.ok) throw new Error("Failed to Edit product.");

      const data = await res.json(); // wait for response
      console.log("Product Edited:");

      alert("✅ Product Edited successfully!");
      fetchAndDisplayProducts();
      form.reset();
    }
  } catch (err) {
    console.error(err);
    alert("❌ Failed to add product. Please try again.");
  }
});

const container = document.querySelector(".tableContainer");

async function fetchAndDisplayProducts() {
  try {
    const response = await fetch(
      "https://ecommerce-30871-default-rtdb.asia-southeast1.firebasedatabase.app/Product.json"
    );
    const data = await response.json();

    if (!data) {
      container.innerHTML = "<p>No products found.</p>";
      return;
    }

    const products = Object.entries(data).map(([id, product]) => {
      return { id, ...product };
    }); // [ [id, product], [id, product], ... ]
    let vendorname = JSON.parse(localStorage.getItem("loggedInUser")).name;
    console.log("vendor who is loggedIn:" + vendorname);
    let filterData = products.filter((product) => {
      return product.vendor === vendorname;
    });
    container.innerHTML = ""; // Clear old content

    filterData.forEach((product) => {
      const card = document.createElement("div");
      card.className = "product-card";

      card.innerHTML = `
        <img src="${product.image}" alt="${product.name}" class="product-img" />
        <h3>${product.name}</h3>
        <p><strong>Price:</strong> ₹${product.price}</p>
        <p><strong>Rating:</strong> ${product.rating} ⭐</p>
        <div class="card-actions">
          <button class="edit-btn" onclick=editBtn('${product.id}')>Edit</button>
          <button class="delete-btn" onclick=deleteBtn('${product.id}')>Delete</button>
        </div>
      `;

      container.appendChild(card);
    });
  } catch (error) {
    console.error("Failed to fetch products:", error);
    container.innerHTML = "<p>Error loading products.</p>";
  }
}

fetchAndDisplayProducts();

async function editBtn(id) {
  document.getElementById("fromBtn").classList.remove("green");

  try {
    const res = await fetch(
      `https://ecommerce-30871-default-rtdb.asia-southeast1.firebasedatabase.app/Product/${id}.json`
    );
    const product = await res.json();

    if (!product) return alert("Product not found!");

    // Set form values
    form.name.value = product.name;
    form.description.value = product.description;
    form.price.value = product.price;
    form.category.value = product.category;
    form.image.value = product.image;
    form.vendor.value = product.vendor;
    form.rating.value = product.rating;
    form.stock.value = product.stock;
    form.tags.value = product.tags ? product.tags.join(", ") : "";
    document.getElementById("fromBtn").innerText = "Edit Btn";
    editingProductId = id; // Switch to "edit mode"  we have created global variable to save id
  } catch (err) {
    console.error("Error loading product for editing:", err);
    alert("❌ Failed to load product.");
  }
}

async function deleteBtn(id) {
  let res = await fetch(
    `https://ecommerce-30871-default-rtdb.asia-southeast1.firebasedatabase.app/Product/${id}.json`,
    { method: "DELETE" }
  );
  if (!res.ok) throw new Error("Failed to delete product.");

  // console.log("Product deleted:");

  alert("✅ Product Deleted successfully!");
  fetchAndDisplayProducts();
}
function loggedOut() {
  localStorage.removeItem("loggedInUser");
  document.getElementById("logInUser").innerText = "LoggedIn";
}

// dont touch if you dont want to add data
// async function uploadProductsToFirebase(productsArray) {
//   const endpoint =
//     "https://ecommerce-30871-default-rtdb.asia-southeast1.firebasedatabase.app/Product.json";

//   try {
//     const uploadPromises = productsArray.map(async (product) => {
//       // Format/clean product
//       const formattedProduct = {
//         name: product.name.trim(),
//         description: product.description.trim(),
//         price: parseFloat(product.price),
//         category: product.category,
//         image: product.image.trim(),
//         vendor: product.vendor.trim(),
//         rating: parseFloat(product.rating),
//         stock: parseInt(product.stock),
//         tags: product.tags.map((tag) => tag.trim()),
//         dateAdded: new Date().toISOString(),
//       };

//       const response = await fetch(endpoint, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(formattedProduct),
//       });

//       if (!response.ok) {
//         throw new Error(`Failed to upload product: ${formattedProduct.name}`);
//       }

//       return response.json();
//     });

//     const results = await Promise.all(uploadPromises);
//     alert("✅ All products uploaded successfully!");
//     console.log(results);
//   } catch (error) {
//     console.error("❌ Error uploading products:", error);
//     alert("❌ Some products failed to upload. Check console for details.");
//   }
// }
// let arr2 = [
//   {
//     name: "Embroidered Blouse",
//     description: "Silky blouse with intricate floral embroidery.",
//     price: 2799,
//     category: "womens",
//     image:
//       "https://media.istockphoto.com/id/1487690378/photo/green-hand-embroidered-sari-blouse.webp?a=1&b=1&s=612x612&w=0&k=20&c=am4Y7ArLRLuLpyPUk8weXTww0Ys1gaCI4G7yWBld5UQ=",
//     vendor: "ram_Traders",
//     rating: 4.5,
//     stock: 55,
//     tags: ["blouse", "formal", "embroidery"],
//     dateAdded: "2025-07-12T16:00:00Z",
//   },
//   {
//     name: "Denim Overalls",
//     description: "Light-wash denim overalls with adjustable straps.",
//     price: 3499,
//     category: "womens",
//     image:
//       "https://media.istockphoto.com/id/1949167520/photo/round-neck-woolen-sweaters-display.webp?a=1&b=1&s=612x612&w=0&k=20&c=eieXGo8_CC_1xJiECarpxyt5XNoWbz2dUYGW_EqzswQ=",
//     vendor: "ram_Traders",
//     rating: 4.3,
//     stock: 40,
//     tags: ["overalls", "casual", "denim"],
//     dateAdded: "2025-06-25T12:10:00Z",
//   },
//   {
//     name: "Sequin Party Dress",
//     description: "Sleeveless mini dress with silver sequin detailing.",
//     price: 3999,
//     category: "womens",
//     image:
//       "https://media.istockphoto.com/id/1949167520/photo/round-neck-woolen-sweaters-display.webp?a=1&b=1&s=612x612&w=0&k=20&c=eieXGo8_CC_1xJiECarpxyt5XNoWbz2dUYGW_EqzswQ=",
//     vendor: "ram_Traders",
//     rating: 4.9,
//     stock: 30,
//     tags: ["dress", "party", "evening"],
//     dateAdded: "2025-12-01T18:30:00Z",
//   },
//   {
//     name: "Turtleneck Sweater Dress",
//     description: "Knit sweater dress with ribbed turtleneck and long sleeves.",
//     price: 2999,
//     category: "womens",
//     image:
//       "https://media.istockphoto.com/id/1949167520/photo/round-neck-woolen-sweaters-display.webp?a=1&b=1&s=612x612&w=0&k=20&c=eieXGo8_CC_1xJiECarpxyt5XNoWbz2dUYGW_EqzswQ=",
//     vendor: "ram_Traders",
//     rating: 4.6,
//     stock: 65,
//     tags: ["dress", "winter", "knit"],
//     dateAdded: "2025-11-20T09:00:00Z",
//   },
//   {
//     name: "Linen Wide-Leg Pants",
//     description: "Breathable linen pants with elastic waist and pockets.",
//     price: 2399,
//     category: "womens",
//     image:
//       "https://media.istockphoto.com/id/653138030/photo/womens-high-waist-white-blue-gradient-jeans-pants-isolated-on-white-background.webp?a=1&b=1&s=612x612&w=0&k=20&c=cLLlUVCaElb-Uev8FYCaM26kbB77sERrso7PqZNgWFc=",
//     vendor: "ram_Traders",
//     rating: 4.5,
//     stock: 85,
//     tags: ["pants", "summer", "linen"],
//     dateAdded: "2025-08-15T13:45:00Z",
//   },
//   {
//     name: "Soy Wax Candles",
//     description: "Hand-poured candles with essential oil fragrances.",
//     price: 1699,
//     category: "natural",
//     image:
//       "https://media.istockphoto.com/id/2177827696/photo/mother-igniting-candle-during-the-christmas-eve-supper.webp?a=1&b=1&s=612x612&w=0&k=20&c=mWdaqw6iedapuKcSy70yQVbf-VoLjanAPpC83sNJCNc=",
//     vendor: "ram_Traders",
//     rating: 4.8,
//     stock: 100,
//     tags: ["candles", "eco-friendly", "home"],
//     dateAdded: "2025-06-10T16:45:00Z",
//   },
//   {
//     name: "Hemp Face Moisturizer",
//     description: "Vegan moisturizer with hemp seed oil and hyaluronic acid.",
//     price: 2499,
//     category: "natural",
//     image:
//       "https://media.istockphoto.com/id/1302280502/photo/beauty-treatment-woman-applying-moisturing-creame.webp?a=1&b=1&s=612x612&w=0&k=20&c=PaIFGoXb84P-dg1bQS9Et372QKTJMQvB0iOT_XwGERs=",
//     vendor: "ram_Traders",
//     rating: 4.7,
//     stock: 80,
//     tags: ["skincare", "organic", "vegan"],
//     dateAdded: "2025-07-15T08:00:00Z",
//   },
//   {
//     name: "Biodegradable Dish Soap",
//     description: "Plant-based soap with lemon extract for gentle cleaning.",
//     price: 999,
//     category: "natural",
//     image:
//       "https://media.istockphoto.com/id/493761918/photo/dishwashing-routine.webp?a=1&b=1&s=612x612&w=0&k=20&c=WiIbsFXxvrf1iKOHcixMx1JM6hM93c4GNKIXRDRVuDk=",
//     vendor: "ram_Traders",
//     rating: 4.6,
//     stock: 250,
//     tags: ["cleaning", "biodegradable", "kitchen"],
//     dateAdded: "2025-08-22T10:10:00Z",
//   },
//   {
//     name: "Aloe Vera Gel",
//     description: "99% pure aloe vera gel for sunburns or hydration.",
//     price: 599,
//     category: "natural",
//     image:
//       "https://media.istockphoto.com/id/878067638/photo/aloe-vera-juice-gel-moisturising-cream-soap-and-powder-powder.webp?a=1&b=1&s=612x612&w=0&k=20&c=zJoBLWEDzSSjHjj8q4yt1C-Ql2tdt9GJjFYer1kXjPo=",
//     vendor: "ram_Traders",
//     rating: 4.5,
//     stock: 170,
//     tags: ["skincare", "aloe", "natural"],
//     dateAdded: "2025-09-05T13:25:00Z",
//   },
//   {
//     name: "Organic Cotton Tote Bag",
//     description: "Reusable tote with reinforced handles for daily use.",
//     price: 499,
//     category: "natural",
//     image:
//       "https://media.istockphoto.com/id/1185049680/photo/eco-friendly-beige-colour-fashion-canvas-tote-bag.webp?a=1&b=1&s=612x612&w=0&k=20&c=kS2gOaR96U7MdN6ijNila1UGhSj_qcUsKUjQqUZ8WcU=",
//     vendor: "ram_Traders",
//     rating: 4.7,
//     stock: 400,
//     tags: ["bags", "reusable", "eco-friendly"],
//     dateAdded: "2025-10-01T15:50:00Z",
//   },
//   {
//     name: "Crunchy Almond Butter",
//     description: "Smooth almond butter with no added sugar or oil.",
//     price: 1499,
//     category: "food",
//     image:
//       "https://media.istockphoto.com/id/1370911733/photo/almond-butter-with-whole-raw-almonds.webp?a=1&b=1&s=612x612&w=0&k=20&c=MWFnjebKijWqxxiKGPf8cffzVVGC8kUccHOiudWyiCE=",
//     vendor: "ram_Traders",
//     rating: 4.7,
//     stock: 120,
//     tags: ["nut-butter", "snacks", "vegan"],
//     dateAdded: "2025-06-18T11:45:00Z",
//   },
//   {
//     name: "Organic Granola Mix",
//     description: "Clusters of oats, nuts, and dried fruits with cinnamon.",
//     price: 799,
//     category: "food",
//     image:
//       "https://media.istockphoto.com/id/1441609769/photo/various-cereals-and-granola-mix-in-a-bowl.webp?a=1&b=1&s=612x612&w=0&k=20&c=O6RdnDH5xsveApPxOpfYF9e6h3DIGH3ypX8wDaAIobs=",
//     vendor: "ram_Traders",
//     rating: 4.4,
//     stock: 250,
//     tags: ["breakfast", "granola", "organic"],
//     dateAdded: "2025-07-01T08:10:00Z",
//   },
//   {
//     name: "Dried Mango Slices",
//     description: "Sweet and tangy mango slices with no preservatives.",
//     price: 599,
//     category: "food",
//     image:
//       "https://media.istockphoto.com/id/1011477012/photo/mango-slice-isolated-on-white-background-healthy-food-top-view.webp?a=1&b=1&s=612x612&w=0&k=20&c=emf5QDX0PtEbgrM_67vdkOgCXqXN3XeAOl3tHACaAh4=",
//     vendor: "ram_Traders",
//     rating: 4.6,
//     stock: 170,
//     tags: ["snacks", "dried-fruit", "vegan"],
//     dateAdded: "2025-08-12T13:20:00Z",
//   },
//   {
//     name: "Matcha Green Tea Powder",
//     description: "Premium ceremonial-grade matcha for lattes or baking.",
//     price: 1999,
//     category: "food",
//     image:
//       "https://media.istockphoto.com/id/978314808/photo/heap-of-green-matcha-tea-powder-and-leaves.webp?a=1&b=1&s=612x612&w=0&k=20&c=Gyd0amzRpCgXhlNnsqmCLDU9uzZqEFp-We9vvdHULQM=",
//     vendor: "ram_Traders",
//     rating: 4.8,
//     stock: 75,
//     tags: ["tea", "superfood", "organic"],
//     dateAdded: "2025-09-05T16:00:00Z",
//   },
//   {
//     name: "Spice Gift Set",
//     description: "6 organic spices including turmeric, cumin, and paprika.",
//     price: 2499,
//     category: "food",
//     image:
//       "https://media.istockphoto.com/id/1190773952/photo/dry-fruit-box.webp?a=1&b=1&s=612x612&w=0&k=20&c=qm-_qFWl2gsvemoUj5LaGz-Otet2U0uvPf_fzpTrRyA=",
//     vendor: "ram_Traders",
//     rating: 4.7,
//     stock: 50,
//     tags: ["spices", "gift", "organic"],
//     dateAdded: "2025-10-10T10:10:00Z",
//   },
//   {
//     name: "Wool Overcoat",
//     description: "Heavyweight wool coat for winter with detachable hood.",
//     price: 14999,
//     category: "mens",
//     image:
//       "https://media.istockphoto.com/id/1177415728/photo/mens-black-blank-hoodie-template-from-two-sides-natural-shape-on-invisible-mannequin-for-your.webp?a=1&b=1&s=612x612&w=0&k=20&c=I35ckE98sD9q2XpG8NRS9M3odH-h_TTas1R6AFw2Rtw=",
//     vendor: "ram_Traders",
//     rating: 4.8,
//     stock: 20,
//     tags: ["coat", "winter", "formal"],
//     dateAdded: "2025-10-15T14:00:00Z",
//   },
//   {
//     name: "Graphic Print Hoodie",
//     description: "Oversized hoodie with abstract geometric print.",
//     price: 1999,
//     category: "mens",
//     image:
//       "https://media.istockphoto.com/id/1177415728/photo/mens-black-blank-hoodie-template-from-two-sides-natural-shape-on-invisible-mannequin-for-your.webp?a=1&b=1&s=612x612&w=0&k=20&c=I35ckE98sD9q2XpG8NRS9M3odH-h_TTas1R6AFw2Rtw=",
//     vendor: "ram_Traders",
//     rating: 4.6,
//     stock: 60,
//     tags: ["hoodie", "casual", "streetwear"],
//     dateAdded: "2025-09-20T10:10:00Z",
//   },
//   {
//     name: "Linen Button-Down Shirt",
//     description: "Lightweight linen shirt for summer with rolled sleeves.",
//     price: 2199,
//     category: "mens",
//     image:
//       "https://media.istockphoto.com/id/182376883/photo/shirts-hanging-on-wooden-coat-hangers.webp?a=1&b=1&s=612x612&w=0&k=20&c=gvj-hXt1b-OE4UAOf35UxMGi7B__cWHSM8y5pEbKHc0=",
//     vendor: "ram_Traders",
//     rating: 4.5,
//     stock: 75,
//     tags: ["shirt", "summer", "linen"],
//     dateAdded: "2025-08-01T12:25:00Z",
//   },
//   {
//     name: "Athletic Joggers",
//     description:
//       "Stretch-fit joggers with elastic waistband and zippered pockets.",
//     price: 1699,
//     category: "mens",
//     image:
//       "https://media.istockphoto.com/id/2153823097/photo/cheerful-athletic-couple-jogging-through-the-park.webp?a=1&b=1&s=612x612&w=0&k=20&c=Dgek5mkdH-efVtFv4bJUVuiiNnb8-k9fTSlK-uS4anQ=",
//     vendor: "ram_Traders",
//     rating: 4.7,
//     stock: 110,
//     tags: ["pants", "sportswear", "gym"],
//     dateAdded: "2025-04-05T15:40:00Z",
//   },
//   {
//     name: "Plaid Flannel Shirt",
//     description: "Warm red-and-black flannel shirt with brushed interior.",
//     price: 1899,
//     category: "mens",
//     image:
//       "https://media.istockphoto.com/id/1180676562/photo/lumberjack-shirt.webp?a=1&b=1&s=612x612&w=0&k=20&c=vFxT1YPYwJ3sDs0CWV_Iz2gAl2Y8bUFlY3FD3HSUSS8=",
//     vendor: "ram_Traders",
//     rating: 4.6,
//     stock: 50,
//     tags: ["shirt", "winter", "casual"],
//     dateAdded: "2025-11-10T09:15:00Z",
//   },
//   {
//     name: "Bluetooth Speaker",
//     description: "Portable speaker with 20W bass and IPX7 waterproofing.",
//     price: 4499,
//     category: "electronics",
//     image:
//       "https://media.istockphoto.com/id/924827878/photo/bluetooth-speaker-isolated-on-white-background.webp?a=1&b=1&s=612x612&w=0&k=20&c=ojPL4dBIyFYMew9mVV8eQ2zi2cJNSSt_3CNywq5f1ks=",
//     vendor: "ram_Traders",
//     rating: 4.6,
//     stock: 65,
//     tags: ["audio", "portable", "outdoor"],
//     dateAdded: "2025-06-01T09:10:00Z",
//   },
//   {
//     name: "E-Reader",
//     description: "6-inch glare-free display with 8GB storage for books.",
//     price: 8999,
//     category: "electronics",
//     image:
//       "https://media.istockphoto.com/id/1466757872/photo/hardcover-books-and-modern-e-book-on-table-in-library.webp?a=1&b=1&s=612x612&w=0&k=20&c=Li-pZKqhb0I_egFRqemM4f9k13neVQKi9LDMZOf6Pvg=",
//     vendor: "ram_Traders",
//     rating: 4.4,
//     stock: 40,
//     tags: ["reading", "e-ink", "portable"],
//     dateAdded: "2025-03-25T14:00:00Z",
//   },
//   {
//     name: "Robot Vacuum Cleaner",
//     description:
//       "Smart mapping and self-emptying dustbin for automated cleaning.",
//     price: 34999,
//     category: "electronics",
//     image:
//       "https://media.istockphoto.com/id/1254852664/photo/dust-mites-dont-stand-a-chance.webp?a=1&b=1&s=612x612&w=0&k=20&c=U2h9O_cJCpZFOOWJ6OFYR4lDjt_Taq_GEvZZqIDGGoI=",
//     vendor: "ram_Traders",
//     rating: 4.7,
//     stock: 30,
//     tags: ["home", "cleaning", "smart"],
//     dateAdded: "2025-04-18T10:15:00Z",
//   },
//   {
//     name: "4K Action Camera",
//     description: "Waterproof camera with 60fps video and image stabilization.",
//     price: 24999,
//     category: "electronics",
//     image:
//       "https://media.istockphoto.com/id/1126412364/photo/a-black-action-camera-for-high-resolution-4k-photos-and-videos-on-a-white-background.webp?a=1&b=1&s=612x612&w=0&k=20&c=vSEOf7gDRomBSeleVRw9u_ZS4nPHAK1sOmpD6v65AqA=",
//     vendor: "ram_Traders",
//     rating: 4.8,
//     stock: 50,
//     tags: ["camera", "outdoor", "sports"],
//     dateAdded: "2025-05-22T12:45:00Z",
//   },
//   {
//     name: "Smart Home Hub",
//     description: "Voice-controlled hub for lights, thermostats, and security.",
//     price: 7999,
//     category: "electronics",
//     image:
//       "https://media.istockphoto.com/id/1377702352/photo/tablet-with-smart-home-app-on-home-desk-concept-of-home-automatization-conrol-app-with.webp?a=1&b=1&s=612x612&w=0&k=20&c=imBxlYl0zydtzrXdiLgDcSCTJIK4Su7uDLo_1XdJvYM=",
//     vendor: "HomeTech",
//     rating: 4.5,
//     stock: 70,
//     tags: ["smart-home", "automation", "tech"],
//     dateAdded: "2025-02-05T17:30:00Z",
//   },
//   {
//     name: "Marble Coasters",
//     description: "Set of 6 natural marble coasters with gold trim.",
//     price: 1299,
//     category: "home-decor",
//     image:
//       "https://media.istockphoto.com/id/912360090/photo/marble-coaster.webp?a=1&b=1&s=612x612&w=0&k=20&c=RZsiUC1pYR-HanSlTmEd8nGuw2Jbz74chvjh-qkhVg0=",
//     vendor: "StoneCraft",
//     rating: 4.6,
//     stock: 200,
//     tags: ["coasters", "kitchen", "marble"],
//     dateAdded: "2025-08-10T09:20:00Z",
//   },
//   {
//     name: "Woven Jute Rug",
//     description: "Round 5-foot rug with neutral tones for boho interiors.",
//     price: 8999,
//     category: "home-decor",
//     image:
//       "https://media.istockphoto.com/id/2153639267/photo/burlap-textured-background-with-full-frame-isolated.webp?a=1&b=1&s=612x612&w=0&k=20&c=bUzaFGo_tTMgGClC-gTZ7vGV_OmrVVg2v_AAOfhGTTw=",
//     vendor: "EarthTones",
//     rating: 4.4,
//     stock: 20,
//     tags: ["rug", "boho", "living-room"],
//     dateAdded: "2025-09-15T16:15:00Z",
//   },
//   {
//     name: "Glass Vase Set",
//     description:
//       "3 transparent vases in varying heights for floral arrangements.",
//     price: 1999,
//     category: "home-decor",
//     image:
//       "https://media.istockphoto.com/id/924367968/photo/blank-white-vase-with-flowers-bouquet-design.webp?a=1&b=1&s=612x612&w=0&k=20&c=wUbJ1Egd9Q1U5f8JkAP2agMtwaC4-41sl71fH8keaUE=",
//     vendor: "ClearElegance",
//     rating: 4.7,
//     stock: 75,
//     tags: ["vase", "glass", "decor"],
//     dateAdded: "2025-10-05T12:50:00Z",
//   },
//   {
//     name: "Modern Floor Mirror",
//     description: "Full-length mirror with minimalist black metal frame.",
//     price: 12999,
//     category: "home-decor",
//     image:
//       "https://media.istockphoto.com/id/1189977735/photo/3d-rendering-illustration-of-bathroom-scene.webp?a=1&b=1&s=612x612&w=0&k=20&c=G7Nysl1Y-WkY009xv921vlcowQJYDONs-7P-HBdYwLQ=",
//     vendor: "ReflectDecor",
//     rating: 4.9,
//     stock: 15,
//     tags: ["mirror", "modern", "bedroom"],
//     dateAdded: "2025-11-20T07:00:00Z",
//   },
//   {
//     name: "Scented Reed Diffuser",
//     description: "Lavender-scented diffuser with natural rattan reeds.",
//     price: 1599,
//     category: "home-decor",
//     image:
//       "https://media.istockphoto.com/id/1325095289/photo/still-life-closeup-of-a-tranquil-spa-arrangement.webp?a=1&b=1&s=612x612&w=0&k=20&c=glrYdC2jWTY9oWb3znY6OGQuNMDrzAixbcJVC5MzggI=",
//     vendor: "AromaZen",
//     rating: 4.5,
//     stock: 90,
//     tags: ["diffuser", "scent", "wellness"],
//     dateAdded: "2025-12-01T18:00:00Z",
//   },
// ];
// uploadProductsToFirebase(arr2);

// let arr = [
//   {
//     name: "Floral Maxi Dress",
//     description:
//       "Full-length summer dress with floral print and breathable fabric.",
//     price: 1899,
//     category: "womens",
//     image:
//       "https://media.istockphoto.com/id/2178875375/photo/a-long-flowy-wrap-style-dress-with-a-delicate-floral-print-in-black-and-yellow-on-a-white.webp?a=1&b=1&s=612x612&w=0&k=20&c=p6U6oMCzKtBGk3stTN234RnHi9bOricns-lqnfdMmf8=",
//     vendor: "sachin_Traders",
//     rating: 4.7,
//     stock: 60,
//     tags: ["dress", "floral", "summer"],
//     dateAdded: "2025-04-10T12:00:00Z",
//   },
//   {
//     name: "Knit Sweater Crop Top",
//     description: "Cozy rib-knit crop top with a relaxed fit.",
//     price: 1499,
//     category: "womens",
//     image:
//       "https://media.istockphoto.com/id/2165506380/photo/portrait-of-beautiful-woman-with-long-hair-standing-in-park.webp?a=1&b=1&s=612x612&w=0&k=20&c=1r8agdq3G5gubuKFfWbhsXx0Y_ly_KO8uAV8IIOOGjo=",
//     vendor: "sachin_Traders",
//     rating: 4.4,
//     stock: 75,
//     tags: ["top", "knit", "casual"],
//     dateAdded: "2025-03-30T11:10:00Z",
//   },
//   {
//     name: "High-Waisted Leggings",
//     description:
//       "Buttery-soft leggings with wide waistband for yoga or casual wear.",
//     price: 999,
//     category: "womens",
//     image:
//       "https://media.istockphoto.com/id/1127548421/photo/legs-of-toned-young-girls-standing-after-training.webp?a=1&b=1&s=612x612&w=0&k=20&c=hvEI8tzLJQPayIikw5pcwglUrtCQAiK9_BsStmqV670=",
//     vendor: "sachin_Traders",
//     rating: 4.8,
//     stock: 200,
//     tags: ["leggings", "yoga", "athleisure"],
//     dateAdded: "2025-02-14T07:30:00Z",
//   },
//   {
//     name: "Wrap Midi Skirt",
//     description: "Polka-dot skirt with adjustable wrap design.",
//     price: 2199,
//     category: "womens",
//     image:
//       "https://media.istockphoto.com/id/849698772/photo/bollywood-dancers-dress.webp?a=1&b=1&s=612x612&w=0&k=20&c=6kFoJgd1te7a-kNXEg06gaDrnXlNvfTV33uBpAarkhA=",
//     vendor: "sachin_Traders",
//     rating: 4.6,
//     stock: 45,
//     tags: ["skirt", "casual", "office"],
//     dateAdded: "2025-05-20T14:20:00Z",
//   },
//   {
//     name: "Faux Leather Jacket",
//     description: "Cropped vegan leather jacket with zippered pockets.",
//     price: 4999,
//     category: "womens",
//     image:
//       "https://media.istockphoto.com/id/1354251572/photo/woman-black-leather-jacket-isolated-on-white-background.webp?a=1&b=1&s=612x612&w=0&k=20&c=hgvaEsH_HdxL4yho7QXgMF4YorIsJTBHvs11fi9wc1g=",
//     vendor: "sachin_Traders",
//     rating: 4.7,
//     stock: 35,
//     tags: ["jacket", "vegan", "fall"],
//     dateAdded: "2025-09-05T10:45:00Z",
//   },

//   {
//     name: "Organic Lavender Essential Oil",
//     description: "100% pure lavender oil for aromatherapy or skincare.",
//     price: 1499,
//     category: "natural",
//     image:
//       "https://media.istockphoto.com/id/585048326/photo/herbal-oil-and-lavender-flowers.webp?a=1&b=1&s=612x612&w=0&k=20&c=CXj_-Eb9rRIwheVUxEJTb4fefGFCvZvieUX36G1hmlU=",
//     vendor: "sachin_Traders",
//     rating: 4.8,
//     stock: 200,
//     tags: ["essential-oil", "aromatherapy", "organic"],
//     dateAdded: "2025-01-05T07:30:00Z",
//   },
//   {
//     name: "Bamboo Toothbrush Set",
//     description: "Eco-friendly bamboo toothbrushes with charcoal bristles.",
//     price: 699,
//     category: "natural",
//     image:
//       "https://media.istockphoto.com/id/1271861609/photo/blank-wooden-bamboo-toothbrush-with-box-for-mockup-design-and-branding.webp?a=1&b=1&s=612x612&w=0&k=20&c=80BYUBd1c9g79ogAv9rVSu6bepBKlGz-c458vPQm9GQ=",
//     vendor: "sachin_Traders",
//     rating: 4.6,
//     stock: 300,
//     tags: ["bath", "eco-friendly", "zero-waste"],
//     dateAdded: "2025-02-14T09:45:00Z",
//   },
//   {
//     name: "Reusable Silicone Food Bags",
//     description: "Leak-proof silicone bags to replace plastic wraps.",
//     price: 1299,
//     category: "natural",
//     image:
//       "https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Zm9vZCUyMGJhZ3xlbnwwfHwwfHx8MA%3D%3D",
//     vendor: "sachin_Traders",
//     rating: 4.7,
//     stock: 150,
//     tags: ["kitchen", "reusable", "eco-friendly"],
//     dateAdded: "2025-03-20T12:15:00Z",
//   },
//   {
//     name: "Herbal Sleep Tea",
//     description: "Chamomile and valerian root blend for relaxation.",
//     price: 899,
//     category: "natural",
//     image:
//       "https://media.istockphoto.com/id/1199012475/photo/cup-of-tea-mint-and-lemon-on-dark-background.webp?a=1&b=1&s=612x612&w=0&k=20&c=dHljzB8ONWS0D7RjYLecATQ3HTkZ6UQLYdMe1sKEGHQ=",
//     vendor: "sachin_Traders",
//     rating: 4.5,
//     stock: 180,
//     tags: ["tea", "wellness", "organic"],
//     dateAdded: "2025-04-25T14:30:00Z",
//   },
//   {
//     name: "Natural Coconut Deodorant",
//     description: "Aluminum-free deodorant with coconut oil and shea butter.",
//     price: 799,
//     category: "natural",
//     image:
//       "https://media.istockphoto.com/id/1312612639/photo/antiperspirant-deodorant-with-coconut-on-orange-background-with.webp?a=1&b=1&s=612x612&w=0&k=20&c=NpnCfnsje072fjGyF37Iu8wHnNvaXyijRLaDb75rgG8=",
//     vendor: "sachin_Traders",
//     rating: 4.4,
//     stock: 220,
//     tags: ["personal-care", "natural", "vegan"],
//     dateAdded: "2025-05-30T11:20:00Z",
//   },

//   {
//     name: "Organic Dark Chocolate Bar",
//     description: "70% cocoa vegan chocolate with almond chunks.",
//     price: 499,
//     category: "food",
//     image:
//       "https://media.istockphoto.com/id/1296362170/photo/detail-of-cocoa-fruit-with-pieces-of-chocolate-and-cocoa-powder-on-raw-cocoa-beans.webp?a=1&b=1&s=612x612&w=0&k=20&c=9ofzbXUGFXl5a9Z5tiJ3CxaOakH-UAN-w1ZpSalR4JA=",
//     vendor: "sachin_Traders",
//     rating: 4.8,
//     stock: 200,
//     tags: ["snacks", "organic", "vegan"],
//     dateAdded: "2025-01-12T07:50:00Z",
//   },
//   {
//     name: "Gourmet Coffee Beans",
//     description: "Arabica coffee beans, medium roast with notes of caramel.",
//     price: 1299,
//     category: "food",
//     image:
//       "https://media.istockphoto.com/id/1296362170/photo/detail-of-cocoa-fruit-with-pieces-of-chocolate-and-cocoa-powder-on-raw-cocoa-beans.webp?a=1&b=1&s=612x612&w=0&k=20&c=9ofzbXUGFXl5a9Z5tiJ3CxaOakH-UAN-w1ZpSalR4JA=",
//     vendor: "sachin_Traders",
//     rating: 4.7,
//     stock: 150,
//     tags: ["coffee", "gourmet", "organic"],
//     dateAdded: "2025-02-08T09:15:00Z",
//   },
//   {
//     name: "Organic Quinoa",
//     description: "Non-GMO, protein-rich quinoa from sustainable farms.",
//     price: 899,
//     category: "food",
//     image:
//       "https://media.istockphoto.com/id/1221412529/photo/raw-organic-amaranth-grain-in-a-bowl-witn-wooden-spoon-and-amaranth-plant-on-rustic-wooden.webp?a=1&b=1&s=612x612&w=0&k=20&c=lZ5RTYzQUSoEpxRPk-HffnW7mZbp_OYV_QTQIFwhBFQ=",
//     vendor: "sachin_Traders",
//     rating: 4.6,
//     stock: 300,
//     tags: ["grains", "organic", "healthy"],
//     dateAdded: "2025-03-10T12:20:00Z",
//   },
//   {
//     name: "Gluten-Free Pasta",
//     description: "Corn and rice fusilli pasta for gluten-sensitive diets.",
//     price: 699,
//     category: "food",
//     image:
//       "https://media.istockphoto.com/id/482964545/photo/arrabiata-pasta.webp?a=1&b=1&s=612x612&w=0&k=20&c=WgBDLDed6qro4H1gamjxl5hWALBdXm6T0UGSU3d6TRo=",
//     vendor: "sachin_Traders",
//     rating: 4.5,
//     stock: 180,
//     tags: ["pasta", "gluten-free", "pantry"],
//     dateAdded: "2025-04-05T14:00:00Z",
//   },
//   {
//     name: "Raw Wildflower Honey",
//     description: "Unprocessed honey sourced from local wildflowers.",
//     price: 1099,
//     category: "food",
//     image:
//       "https://media.istockphoto.com/id/157580403/photo/honey.webp?a=1&b=1&s=612x612&w=0&k=20&c=WqHOwYMmMGIh2DFR-tJS0Zq1A61iaG7ZzRe62x8HdUI=",
//     vendor: "sachin_Traders",
//     rating: 4.9,
//     stock: 90,
//     tags: ["honey", "natural", "sweeteners"],
//     dateAdded: "2025-05-22T10:30:00Z",
//   },

//   {
//     name: "Slim Fit Denim Jeans",
//     description:
//       "Stretchable jeans with a modern slim fit and distressed finish.",
//     price: 2499,
//     category: "mens",
//     image:
//       "https://media.istockphoto.com/id/1210130241/photo/jumping-male-fashion-model-standing-in-white-plain-v-neck-t-shirt-and-blue-ripped-denim-pant.webp?a=1&b=1&s=612x612&w=0&k=20&c=bfVesfRhppQ3wn5Kg_UOw3P5A0NpkxQMmibJ2MvwQvo=",
//     vendor: "sachin_Traders",
//     rating: 4.5,
//     stock: 80,
//     tags: ["jeans", "casual", "denim"],
//     dateAdded: "2025-05-01T09:45:00Z",
//   },
//   {
//     name: "Classic Leather Jacket",
//     description: "Premium brown leather jacket with quilted lining.",
//     price: 8999,
//     category: "mens",
//     image:
//       "https://media.istockphoto.com/id/1354251572/photo/woman-black-leather-jacket-isolated-on-white-background.webp?a=1&b=1&s=612x612&w=0&k=20&c=hgvaEsH_HdxL4yho7QXgMF4YorIsJTBHvs11fi9wc1g=",
//     vendor: "sachin_Traders",
//     rating: 4.9,
//     stock: 30,
//     tags: ["jacket", "leather", "winter"],
//     dateAdded: "2025-04-22T16:20:00Z",
//   },
//   {
//     name: "Cotton Polo T-Shirt",
//     description: "Breathable polo shirt with moisture-wicking fabric.",
//     price: 1299,
//     category: "mens",
//     image:
//       "https://media.istockphoto.com/id/1345634525/photo/young-man-in-blank-oversize-t-shirt-mockup-front-and-back-used-as-design-template-isolated-on.webp?a=1&b=1&s=612x612&w=0&k=20&c=Ecdek1PYFo7Nie8wopEZJNMJPC_HZcguXGJsl7GV8ZA=",
//     vendor: "sachin_Traders",
//     rating: 4.3,
//     stock: 150,
//     tags: ["shirt", "casual", "summer"],
//     dateAdded: "2025-06-10T13:00:00Z",
//   },
//   {
//     name: "Tailored Suit Blazer",
//     description: "Formal navy-blue blazer with notch lapel.",
//     price: 10999,
//     category: "mens",
//     image:
//       "https://media.istockphoto.com/id/997773960/photo/handsome-young-businessman.webp?a=1&b=1&s=612x612&w=0&k=20&c=LG_v1-ZOCP0lyQIr_r-lPknERhmCjPFaJNgkinQY1D4=",
//     vendor: "sachin_Traders",
//     rating: 4.7,
//     stock: 25,
//     tags: ["formal", "blazer", "office"],
//     dateAdded: "2025-03-12T11:50:00Z",
//   },
//   {
//     name: "Cargo Shorts",
//     description: "Military-style shorts with multiple utility pockets.",
//     price: 1799,
//     category: "mens",
//     image:
//       "https://media.istockphoto.com/id/156874059/photo/beige-cargo-shorts-with-belt.webp?a=1&b=1&s=612x612&w=0&k=20&c=xpmL-HUhWZnPjGWapk-blEKT6Yc2RypLFpZ5kuTZapI=",
//     vendor: "sachin_Traders",
//     rating: 4.4,
//     stock: 95,
//     tags: ["shorts", "casual", "outdoor"],
//     dateAdded: "2025-07-05T08:30:00Z",
//   },

//   {
//     name: "Wireless Noise-Cancelling Headphones",
//     description:
//       "Premium over-ear headphones with 30-hour battery life and Bluetooth 5.0.",
//     price: 12999,
//     category: "electronics",
//     image:
//       "https://media.istockphoto.com/id/1080261986/photo/white-wireless-bluetooth-earphones-or-headphones-close-up.webp?a=1&b=1&s=612x612&w=0&k=20&c=vjZhgOieBr4d8V41xemcNDqSmKmmhgzId5Mw8Hv7J-M=",
//     vendor: "sachin_Traders",
//     rating: 4.8,
//     stock: 45,
//     tags: ["audio", "wireless", "tech"],
//     dateAdded: "2025-03-15T10:30:00Z",
//   },
//   {
//     name: "4K Ultra HD Smart TV",
//     description: "55-inch LED TV with HDR10+ and built-in streaming apps.",
//     price: 54999,
//     category: "electronics",
//     image:
//       "https://media.istockphoto.com/id/611294276/photo/uhd-4k-smart-tv-on-white-background.webp?a=1&b=1&s=612x612&w=0&k=20&c=2eqTM2U7NqFAW2oxmCWPPMssIpvjZP9Edg3Ku7Ixn5o=",
//     vendor: "sachin_Traders",
//     rating: 4.6,
//     stock: 25,
//     tags: ["tv", "smart", "entertainment"],
//     dateAdded: "2025-02-20T14:15:00Z",
//   },
//   {
//     name: "Smart Fitness Tracker",
//     description: "Waterproof fitness band with heart rate monitor and GPS.",
//     price: 2999,
//     category: "electronics",
//     image:
//       "https://media.istockphoto.com/id/1372077120/photo/over-the-shoulder-view-of-young-asian-sports-woman-checks-her-fitness-statistics-on.webp?a=1&b=1&s=612x612&w=0&k=20&c=JP7gEDFqVzPjl9yu8WGiZ-_cDDYg8xqEcfV2YYGfTHc=",
//     vendor: "sachin_Traders",
//     rating: 4.5,
//     stock: 120,
//     tags: ["fitness", "wearable", "health"],
//     dateAdded: "2025-04-05T08:45:00Z",
//   },
//   {
//     name: "Wireless Charging Pad",
//     description: "Fast-charging Qi-compatible pad for smartphones.",
//     price: 1599,
//     category: "electronics",
//     image:
//       "https://media.istockphoto.com/id/1028116790/photo/close-up-phone-charging-on-wireless-charger-device.webp?a=1&b=1&s=612x612&w=0&k=20&c=GG9tD3EiHdZi6aIWZ26Ak5ooIiz4aTLeHap3g0OUiLQ=",
//     vendor: "sachin_Traders",
//     rating: 4.7,
//     stock: 90,
//     tags: ["charging", "accessories", "tech"],
//     dateAdded: "2025-01-10T11:20:00Z",
//   },
//   {
//     name: "Gaming Laptop",
//     description: "RTX 4070 GPU, 16GB RAM, 1TB SSD for high-performance gaming.",
//     price: 129999,
//     category: "electronics",
//     image:
//       "https://media.istockphoto.com/id/906347962/photo/gaming-laptop-with-connected-mouse-and-headphones.webp?a=1&b=1&s=612x612&w=0&k=20&c=UpBfIRzWIuUczM4pCvgMDAL0rvXAUy5c8INY1soEybE=",
//     vendor: "sachin_Traders",
//     rating: 4.9,
//     stock: 15,
//     tags: ["gaming", "laptop", "tech"],
//     dateAdded: "2025-05-12T16:30:00Z",
//   },

//   {
//     name: "Ceramic Table Lamp",
//     description: "Handcrafted ceramic lamp with a linen shade.",
//     price: 3499,
//     category: "home-decor",
//     image:
//       "https://media.istockphoto.com/id/2052473715/photo/living-room-lampstand.webp?a=1&b=1&s=612x612&w=0&k=20&c=4qBjiw6_7IvzjoKcZKARHV4DRaTLe6rie7aDOzoZvPg=",
//     vendor: "sachin_Traders",
//     rating: 4.6,
//     stock: 40,
//     tags: ["lighting", "decor", "modern"],
//     dateAdded: "2025-06-05T08:00:00Z",
//   },
//   {
//     name: "Bohemian Throw Pillow",
//     description: "Colorful patterned pillow with tassel details.",
//     price: 899,
//     category: "home-decor",
//     image:
//       "https://media.istockphoto.com/id/974680838/photo/sleep-young-woman-sleeping-in-bed.webp?a=1&b=1&s=612x612&w=0&k=20&c=AyQGvxuCtwQ5mm7b1yZoEiDJ2PX9KeVCyqe40rHT01w=",
//     vendor: "sachin_Traders",
//     rating: 4.3,
//     stock: 100,
//     tags: ["pillow", "boho", "living-room"],
//     dateAdded: "2025-05-18T13:25:00Z",
//   },
//   {
//     name: "Wall Art Canvas Print",
//     description: "Abstract geometric art printed on premium canvas.",
//     price: 4999,
//     category: "home-decor",
//     image:
//       "https://media.istockphoto.com/id/935916462/photo/acrylic-painting-on-canvas-color-texture.webp?a=1&b=1&s=612x612&w=0&k=20&c=7X3ARCpxrkJWwU1iTB3ZrCgwNEtRzpDmo9A8UsZhwEE=",
//     vendor: "sachin_Traders",
//     rating: 4.7,
//     stock: 25,
//     tags: ["wall-art", "modern", "decor"],
//     dateAdded: "2025-04-12T10:10:00Z",
//   },
//   {
//     name: "Rustic Wooden Shelf",
//     description: "Floating shelf made of reclaimed barn wood.",
//     price: 2499,
//     category: "home-decor",
//     image:
//       "https://media.istockphoto.com/id/1305090694/photo/old-fashioned-domestic-kitchen-interior.webp?a=1&b=1&s=612x612&w=0&k=20&c=mbACdlA2Q31G-I1Eap7wjKGyxzhWk2lWgnSK5Bd4Ul8=",
//     vendor: "sachin_Traders",
//     rating: 4.5,
//     stock: 55,
//     tags: ["shelf", "rustic", "storage"],
//     dateAdded: "2025-07-22T14:30:00Z",
//   },
//   {
//     name: "Velvet Curtains",
//     description: "Floor-length blackout curtains in emerald green velvet.",
//     price: 6999,
//     category: "home-decor",
//     image:
//       "https://media.istockphoto.com/id/487679436/photo/blue-curtain-in-theater.webp?a=1&b=1&s=612x612&w=0&k=20&c=sS0b2yDdYMT90fbOwseuUoR9KT_wEJ2cM2X8XKS19TI=",
//     vendor: "sachin_Traders",
//     rating: 4.8,
//     stock: 30,
//     tags: ["curtains", "luxury", "bedroom"],
//     dateAdded: "2025-03-08T11:45:00Z",
//   },
// ];
