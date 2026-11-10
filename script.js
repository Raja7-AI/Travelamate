
// Get saved information from browser
let users = JSON.parse(localStorage.getItem("users")) || [];
let trips = JSON.parse(localStorage.getItem("trips")) || [];

let currentUser = localStorage.getItem("currentUser");
let favouriteMode = false;

// Check existing login
if (currentUser) {
    openApp();
} else {
    document.getElementById("logoutBtn").style.display = "none";
}

// REGISTER
function register() {

    let name = document.getElementById("username").value.trim();
    let password = document.getElementById("password").value;

    if (!name || !password) {
        alert("Please enter your name and password.");
        return;
    }

    if (users.some(user => user.name === name)) {
        alert("Username already exists!");
        return;
    }

    users.push({ name, password });

    localStorage.setItem("users", JSON.stringify(users));

    alert("Registration successful! Please login.");
}

// LOGIN
function login() {

    let name = document.getElementById("username").value.trim();
    let password = document.getElementById("password").value;

    let user = users.find(
        user => user.name === name && user.password === password
    );

    if (user) {
        currentUser = name;

        localStorage.setItem("currentUser", name);

        openApp();
    } else {
        document.getElementById("loginMessage").innerText =
            "Invalid details. Please register first.";
    }
}

// OPEN DASHBOARD
function openApp() {

    document.getElementById("loginBox").style.display = "none";
    document.getElementById("mainApp").style.display = "block";
    document.getElementById("logoutBtn").style.display = "block";

    document.getElementById("welcome").innerText =
        "Welcome, " + currentUser + " 🌍";

    displayTrips();
}

// LOGOUT
function logout() {

    localStorage.removeItem("currentUser");

    currentUser = null;

    document.getElementById("mainApp").style.display = "none";
    document.getElementById("loginBox").style.display = "block";
    document.getElementById("logoutBtn").style.display = "none";
}

// ADD TRIP
function addTrip() {

    let destination = document.getElementById("destination").value.trim();
    let date = document.getElementById("tripDate").value;
    let budget = document.getElementById("budget").value;
    let activity = document.getElementById("activity").value.trim();

    if (!destination || !date || !budget || !activity) {
        alert("Please fill in all the fields.");
        return;
    }

    if (Number(budget) < 0) {
        alert("Budget cannot be negative.");
        return;
    }

    let trip = {
        id: Date.now(),
        user: currentUser,
        destination: destination,
        date: date,
        budget: Number(budget),
        activity: activity,
        favourite: false
    };

    trips.push(trip);

    saveTrips();

    // Clear form
    document.getElementById("destination").value = "";
    document.getElementById("tripDate").value = "";
    document.getElementById("budget").value = "";
    document.getElementById("activity").value = "";

    alert("Your journey has been added successfully! ✈️");
}

// DISPLAY TRIPS
function displayTrips() {

    let list = document.getElementById("tripList");

    let search = document.getElementById("search").value.toLowerCase();

    list.innerHTML = "";

    let myTrips = trips.filter(trip =>
        trip.user === currentUser &&
        trip.destination.toLowerCase().includes(search) &&
        (!favouriteMode || trip.favourite)
    );

    // Update dashboard statistics
    document.getElementById("tripCount").innerText =
        trips.filter(t => t.user === currentUser).length;

    document.getElementById("favCount").innerText =
        trips.filter(t => t.user === currentUser && t.favourite).length;

    let total = trips
        .filter(t => t.user === currentUser)
        .reduce((sum, t) => sum + Number(t.budget), 0);

    document.getElementById("totalBudget").innerText =
        "₹" + total.toLocaleString("en-IN");

    if (myTrips.length === 0) {

        list.innerHTML = `
            <div class="empty-message">
                <h2>🌍 No journeys found</h2>
                <p>Start planning your next adventure!</p>
            </div>
        `;

        return;
    }

    myTrips.forEach(trip => {

        let card = document.createElement("div");
        card.className = "trip-card";

        let image = document.createElement("div");
        image.className = "trip-image";

        let content = document.createElement("div");
        content.className = "trip-content";

        let heading = document.createElement("h3");
        heading.textContent = "📍 " + trip.destination;

        let date = document.createElement("p");
        date.textContent = "📅 Travel Date: " + trip.date;

        let budget = document.createElement("p");
        budget.textContent =
            "💰 Estimated Budget: ₹" +
            Number(trip.budget).toLocaleString("en-IN");

        let activity = document.createElement("p");
        activity.textContent = "✨ Activity: " + trip.activity;

        let actions = document.createElement("div");
        actions.className = "trip-actions";

        // Favourite button
        let fav = document.createElement("button");

        fav.textContent = trip.favourite ?
            "❤️ Saved" : "🤍 Favourite";

        fav.onclick = () => toggleFavourite(trip.id);

        // Edit button
        let edit = document.createElement("button");
        edit.textContent = "✏️ Edit";

        edit.onclick = () => editTrip(trip.id);

        // Delete button
        let del = document.createElement("button");
        del.textContent = "🗑 Delete";

        del.onclick = () => deleteTrip(trip.id);

        // Share button
        let share = document.createElement("button");
        share.textContent = "↗ Share";

        share.onclick = () => shareTrip(trip);

        actions.append(fav, edit, del, share);

        content.append(heading, date, budget, activity, actions);

        card.append(image, content);

        list.appendChild(card);

    });
}

// SAVE TRIPS
function saveTrips() {

    localStorage.setItem("trips", JSON.stringify(trips));

    displayTrips();
}

// FAVOURITE
function toggleFavourite(id) {

    let trip = trips.find(t => t.id === id);

    trip.favourite = !trip.favourite;

    saveTrips();
}

// SHOW FAVOURITES
function showFavourites() {

    favouriteMode = true;

    displayTrips();
}

// SHOW ALL TRIPS
function showAll() {

    favouriteMode = false;

    displayTrips();
}

// EDIT TRIP
function editTrip(id) {

    let trip = trips.find(t => t.id === id);

    let destination = prompt(
        "Enter destination:", trip.destination
    );

    if (destination === null || !destination.trim()) return;

    let date = prompt("Enter travel date (YYYY-MM-DD):", trip.date);

    if (date === null || !date.trim()) return;

    let budget = prompt("Enter budget:", trip.budget);

    if (budget === null || budget.trim() === "" ||
        !Number.isFinite(Number(budget)) || Number(budget) < 0) {
        alert("Please enter a valid budget.");
        return;
    }

    let activity = prompt("Enter activity:", trip.activity);

    if (activity === null || !activity.trim()) return;

    trip.destination = destination.trim();
    trip.date = date.trim();
    trip.budget = Number(budget);
    trip.activity = activity.trim();

    saveTrips();

    alert("Travel plan updated!");
}

// DELETE TRIP
function deleteTrip(id) {

    if (confirm("Are you sure you want to delete this trip?")) {

        trips = trips.filter(t => t.id !== id);

        saveTrips();

        alert("Trip deleted successfully.");
    }
}

// SHARE TRIP
async function shareTrip(trip) {

    let details =
        "🌍 My Travel Journal\n\n" +
        "Destination: " + trip.destination + "\n" +
        "Date: " + trip.date + "\n" +
        "Budget: ₹" + trip.budget + "\n" +
        "Activity: " + trip.activity;

    if (navigator.share) {

        try {
            await navigator.share({
                title: "My Travel Journal",
                text: details
            });
        } catch (error) {
            if (error.name !== "AbortError") {
                alert("Sharing was not available.");
            }
        }

    } else if (navigator.clipboard) {

        try {
            await navigator.clipboard.writeText(details);
            alert("Trip details copied! You can share them now.");
        } catch (error) {
            alert(details);
        }

    } else {
        alert(details);
    }
}
