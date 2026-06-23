// Display helpers dynamically
function displayServices(helpers) {
    const servicesList = document.getElementById("servicesList");
    servicesList.innerHTML = "";

    if (!helpers.length) {
        servicesList.innerHTML = "<p>No helpers found matching your criteria.</p>";
        return;
    }

    helpers.forEach(helper => {
        const div = document.createElement("div");
        div.className = "service";
        div.innerHTML = `
            <div class="service-content">
                <div class="service-details">
                    <h3>${helper.name}</h3>
                    <p>Service: ${helper.service}</p>
                    <p>Price: ₹${helper.price || 'N/A'}</p>
                    <p>Availability: ${helper.availability}</p>
                    <p>Gender: ${helper.gender || 'N/A'}</p>
                    <div class="service-rating">⭐ <span>${helper.rating}</span></div>
                    <form action="/booking" method="GET">
                        <input type="hidden" name="helperId" value="${helper.id}">
                        <input type="hidden" name="servicetype" value="${helper.service}">
                        <input type="hidden" name="price" value="${helper.price}">
                        <button type="submit">Book Now</button>
                    </form>
                </div>
                <div class="service-image">
                    <img src="/pics/profile-picture.png" alt="${helper.name}">
                </div>
            </div>
        `;
        servicesList.appendChild(div);
    });
}

// Fetch filtered services dynamically
function fetchFilteredServices(maxPrice, type, gender) {
    const url = `/api/services/filter?maxPrice=${maxPrice}&type=${type}&gender=${gender}`;
    fetch(url)
        .then(res => res.json())
        .then(data => displayServices(data.helpers))
        .catch(err => console.error("Error fetching filtered services:", err));
}

// Fetch searched services dynamically
function fetchSearchedServices(term) {
    fetch(`/api/services/search?term=${term}`)
        .then(res => res.json())
        .then(data => displayServices(data.helpers))
        .catch(err => console.error("Error fetching searched services:", err));
}

// Search functionality
document.getElementById("searchButton").addEventListener("click", (e) => {
    e.preventDefault();
    const term = document.getElementById("searchInput").value.trim();
    fetchSearchedServices(term);
});

// Filters
document.getElementById("priceRange").addEventListener("input", applyFilters);
document.getElementById("serviceTypeFilter").addEventListener("change", applyFilters);
document.getElementById("genderFilter").addEventListener("change", applyFilters);

function applyFilters() {
    const maxPrice = parseFloat(document.getElementById("priceRange").value);
    const type = document.getElementById("serviceTypeFilter").value;
    const gender = document.getElementById("genderFilter").value;
    fetchFilteredServices(maxPrice, type, gender);
}

// Reset filters
document.getElementById("resetFilters").addEventListener("click", () => {
    document.getElementById("priceRange").value = 1500;
    document.getElementById("priceValue").textContent = 1500;
    document.getElementById("serviceTypeFilter").value = "all";
    document.getElementById("genderFilter").value = "all";
    fetchFilteredServices(1500, "all", "all");
});
