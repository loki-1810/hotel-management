document.addEventListener("DOMContentLoaded", function () {
    
    // ========================== //
    //     LOGIN & REGISTER FORM  //
    // ========================== //
    
    const loginForm = document.querySelector("#loginForm");
    const registerForm = document.querySelector("#registerForm");

    const emailInputs = document.querySelectorAll("input[type='email']");
    const passwordInputs = document.querySelectorAll("input[type='password']");
    const nameInput = document.querySelector("input[name='name']");

    // Toggle Password Visibility
    document.querySelectorAll(".toggle-password").forEach(icon => {
        icon.addEventListener("click", function () {
            let input = this.previousElementSibling;
            input.type = input.type === "password" ? "text" : "password";
            this.innerText = input.type === "password" ? "👁️" : "🙈";
        });
    });

    // Email Validation
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // Password Validation
    function isValidPassword(password) {
        return password.length >= 6;
    }

    // Display Error Message
    function setError(input, message) {
        let parent = input.parentElement;
        let errorDisplay = parent.querySelector(".error");
        if (errorDisplay) errorDisplay.innerText = message;
        input.classList.add("error-border");
    }

    // Clear Error Message
    function clearError(input) {
        let parent = input.parentElement;
        let errorDisplay = parent.querySelector(".error");
        if (errorDisplay) errorDisplay.innerText = "";
        input.classList.remove("error-border");
    }

    // Login Form Validation
    if (loginForm) {
        loginForm.addEventListener("submit", function (e) {
            let valid = true;

            emailInputs.forEach(input => {
                if (!isValidEmail(input.value)) {
                    setError(input, "Enter a valid email!");
                    valid = false;
                } else {
                    clearError(input);
                }
            });

            passwordInputs.forEach(input => {
                if (!isValidPassword(input.value)) {
                    setError(input, "Password must be at least 6 characters!");
                    valid = false;
                } else {
                    clearError(input);
                }
            });

            if (!valid) e.preventDefault();
        });
    }

    // Registration Form Validation
    if (registerForm) {
        registerForm.addEventListener("submit", function (e) {
            let valid = true;

            if (nameInput.value.trim() === "") {
                setError(nameInput, "Name cannot be empty!");
                valid = false;
            } else {
                clearError(nameInput);
            }

            emailInputs.forEach(input => {
                if (!isValidEmail(input.value)) {
                    setError(input, "Enter a valid email!");
                    valid = false;
                } else {
                    clearError(input);
                }
            });

            passwordInputs.forEach(input => {
                if (!isValidPassword(input.value)) {
                    setError(input, "Password must be at least 6 characters!");
                    valid = false;
                } else {
                    clearError(input);
                }
            });

            if (!valid) e.preventDefault();
        });
    }

    // ========================== //
    //     SMOOTH SCROLLING       //
    // ========================== //

    document.querySelector("a[href='#contact']").addEventListener("click", function (e) {
        e.preventDefault();
        document.querySelector("#contact").scrollIntoView({ behavior: "smooth" });
    });

    // ========================== //
    //   AUTO-SCROLL IMAGE SECTIONS //
    // ========================== //

    function autoScroll(container) {
        if (!container) return;
        let scrollAmount = 0;
        let slideTimer = setInterval(function () {
            container.scrollLeft += 2;
            scrollAmount += 2;
            if (scrollAmount >= container.scrollWidth / 2) {
                container.scrollLeft = 0;
                scrollAmount = 0;
            }
        }, 30);
    }

    autoScroll(document.querySelector(".scroll-container"));

    // ========================== //
    //     ROOM BOOKING FORM      //
    // ========================== //

    window.openBookingForm = function (room, price) {
        document.getElementById("roomType").value = room;
        document.getElementById("roomPrice").value = `$${price}`;
        document.getElementById("bookingForm").style.display = "block";
        document.getElementById("bookingForm").scrollIntoView({ behavior: "smooth" });
    };

    window.closeBookingForm = function () {
        document.getElementById("bookingForm").style.display = "none";
    };

    // ========================== //
    //     FOOD BOOKING FORM      //
    // ========================== //

    function openFoodBooking(name, price) {
        document.getElementById("foodName").textContent = name;
        document.getElementById("foodPrice").textContent = price;

        // Show the popup
        const popup = document.getElementById("foodBookingPopup");
        popup.style.display = "flex";

        // Scroll to it smoothly
        popup.scrollIntoView({ behavior: "smooth" });
    }

    function closeFoodBooking() {
        document.getElementById("foodBookingPopup").style.display = "none";
    }

    // ========================== //
    //   DATE VALIDATION FOR BOOKINGS //
    // ========================== //

    function validateDates() {
        const checkin = document.getElementById("checkin").value;
        const checkout = document.getElementById("checkout").value;

        if (checkin && checkout && new Date(checkin) >= new Date(checkout)) {
            alert("Check-out date must be after check-in date.");
            document.getElementById("checkout").value = "";
        }
    }

    document.getElementById("checkin")?.addEventListener("change", validateDates);
    document.getElementById("checkout")?.addEventListener("change", validateDates);

    // ========================== //
    //      MOCK PAYMENT FORM     //
    // ========================== //

    document.getElementById('mockPaymentForm')?.addEventListener('submit', function (e) {
        e.preventDefault();

        const status = document.getElementById('paymentStatus');
        status.innerHTML = "⏳ Processing payment...";
        status.style.color = "#fff";

        setTimeout(() => {
            const success = Math.random() > 0.2; // simulate success/failure

            if (success) {
                status.innerHTML = "✅ Payment Successful! Redirecting...";
                status.style.color = "#00ff7f";

                // Send form data to Flask backend using fetch API
                const formData = new FormData(e.target);
                fetch("/confirmation", {
                    method: "POST",
                    body: formData
                })
                .then(() => {
                    window.location.href = "/"; // redirect to landing page
                });

            } else {
                status.innerHTML = "❌ Payment Failed! Try Again.";
                status.style.color = "red";
            }
        }, 2000);
    });

    // Delete user button
    document.querySelectorAll('.btn-delete').forEach(button => {
        button.addEventListener('click', function () {
            const username = this.closest('tr').querySelector('td').innerText;
            fetch('/delete_user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: username })
            }).then(res => res.json())
              .then(data => {
                  if (data.success) location.reload();
              });
        });
    });

    // Edit booking button
    document.querySelectorAll('.btn-edit').forEach(button => {
        button.addEventListener('click', function () {
            const row = this.closest('tr');
            const username = row.children[0].innerText;
            const currentStatus = row.children[4].innerText;

            const newStatus = prompt("Enter new status for " + username + ":", currentStatus);
            if (newStatus) {
                fetch('/update_booking', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: username, status: newStatus })
                })
                .then(res => res.json())
                .then(data => {
                    if (data.success) location.reload();
                });
            }
        });
    });

    // Cancel order button
    document.querySelectorAll('.btn-cancel').forEach(button => {
        button.addEventListener('click', function () {
            const row = this.closest('tr');
            const username = row.children[0].innerText;
            const food_item = row.children[1].innerText;
            const table_no = row.children[2].innerText;

            if (confirm(`Cancel order for ${username}?`)) {
                fetch('/cancel_order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: username,
                        food_item: food_item,
                        table_no: table_no
                    })
                })
                .then(res => res.json())
                .then(data => {
                    if (data.success) location.reload();
                });
            }
        });
    });

    // Confirm order button
    function confirmOrder() {
        const item = sessionStorage.getItem("food_item");
        const price = sessionStorage.getItem("food_price");
        const orderType = sessionStorage.getItem("order_type");

        fetch("/set_order_session", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                item: item,
                price: price,
                order_type: orderType,
                quantity: 1,  // Add support for quantity if needed
                user_name: "Guest",  // Or get from form if available
                user_contact: "N/A"
            })
        }).then(() => {
            window.location.href = "/payment";
        });
    }
});// Confirm order button
function confirmOrder() {
    const item = sessionStorage.getItem("food_item");
    const price = sessionStorage.getItem("food_price");
    const orderType = sessionStorage.getItem("order_type");

    fetch("/set_order_session", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            item: item,
            price: price,
            order_type: orderType,
            quantity: 1,  // Add support for quantity if needed
            user_name: "Guest",  // Or get from form if available
            user_contact: "N/A"
        })
    }).then(() => {
        window.location.href = "/payment";
    });
}

// Attach confirmOrder function to Order Now button's click event
document.getElementById("order-now-button")?.addEventListener("click", confirmOrder);// Confirm order button
function confirmOrder() {
    const item = sessionStorage.getItem("food_item");
    const price = sessionStorage.getItem("food_price");
    const orderType = sessionStorage.getItem("order_type");

    fetch("/set_order_session", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            item: item,
            price: price,
            order_type: orderType,
            quantity: 1,  // Add support for quantity if needed
            user_name: "Guest",  // Or get from form if available
            user_contact: "N/A"
        })
    }).then(() => {
        window.location.href = "/payment";
    });
}

// Attach confirmOrder function to Order Now button's click event
document.getElementById("order-now-button")?.addEventListener("click", confirmOrder);// JavaScript
document.getElementById("order-now-button").addEventListener("click", function () {
  document.getElementById("popup-container").style.display = "block";
});

// function openFoodBooking(name, price) {
//     document.getElementById("foodName").textContent = name;
//     document.getElementById("foodPrice").textContent = price;
//     document.getElementById("foodBookingPopup").style.display = "block";
// }

// function closeFoodBooking() {
//     document.getElementById("foodBookingPopup").style.display = "none";
// }

function openFoodBooking(foodName, foodPrice) {
    // Set displayed values
    document.getElementById("foodNameDisplay").innerText = foodName;
    document.getElementById("foodPriceDisplay").innerText = foodPrice;

    // Set form values
    document.getElementById("foodName").value = foodName;
    document.getElementById("foodPrice").value = foodPrice;

    // Show popup
    document.getElementById("foodBookingPopup").style.display = "block";
}

function closeFoodBooking() {
    document.getElementById("foodBookingPopup").style.display = "none";
}