document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));

  if (user) {
    document.getElementById("fullName").value = user.name || "";
    document.getElementById("email").value = user.email || "";
  }

  document
    .getElementById("checkoutForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      try {
        // Fetch all cart items from Firebase
        const res = await fetch(
          "https://ecommerce-30871-default-rtdb.asia-southeast1.firebasedatabase.app/Cart.json"
        );
        const data = await res.json();

        let datatodelete = Object.entries(data).map(([id, product]) => {
          return { id, ...product };
        });
        console.log(datatodelete);

        for (let i = 0; i < datatodelete.length; i++) {
          if (datatodelete[i].loggedInUser === user.email) {
            await fetch(
              `https://ecommerce-30871-default-rtdb.asia-southeast1.firebasedatabase.app/Cart/${datatodelete[i].id}.json`,
              {
                method: "DELETE",
              }
            );
          }
        }

        alert(
          "🎉 Order placed successfully! 🛍️\n\nThank you for shopping with us 😊"
        );

        window.location.href = "../index.html";
      } catch (error) {
        console.error("Error while deleting user's cart items:", error);
        alert("Something went wrong during checkout. Please try again.");
      }
    });
});
