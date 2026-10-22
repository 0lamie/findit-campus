
const STORAGE_KEY = "findit-campus-items-v1";

const form = document.getElementById("item-form");
const itemsGrid = document.getElementById("items-grid");
const searchInput = document.getElementById("search-input");
const categoryFilter = document.getElementById("category-filter");
const filterButtons = document.querySelectorAll(".filter-button");
const emptyMessage = document.getElementById("empty-message");
const formMessage = document.getElementById("form-message");

let activeStatus = "all";

const sampleItems = [
    {
        id: "demo-1",
        name: "Black Wireless Earbuds",
        status: "Lost",
        category: "Electronics",
        location: "University Library",
        date: "2026-10-20",
        description: "A small black earbuds case may have been left near the reading area.",
        email: "example@example.com",
        demo: true
    },
    {
        id: "demo-2",
        name: "Student Notebook",
        status: "Found",
        category: "Bags & Books",
        location: "Lecture Hall B",
        date: "2026-10-21",
        description: "A notebook was found after a lecture. Contact me to describe its cover and collect it.",
        email: "example@example.com",
        demo: true
    },
    {
        id: "demo-3",
        name: "Set of Keys",
        status: "Found",
        category: "Keys",
        location: "Campus Cafeteria",
        date: "2026-10-19",
        description: "A set of keys was found near the cafeteria entrance.",
        email: "example@example.com",
        demo: true
    }
];

// Load reports saved in this browser.
// If no saved data exists, start with sample listings.
function loadItems() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (saved !== null) {
            const parsed = JSON.parse(saved);

            if (Array.isArray(parsed)) {
                return parsed;
            }
        }
    } catch (error) {
        console.error("Could not load saved reports:", error);
    }

    return sampleItems.map(item => ({ ...item }));
}

let items = loadItems();

// Save reports in the current browser.
function saveItems() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        return true;
    } catch (error) {
        console.error("Could not save reports:", error);
        return false;
    }
}

// Create an element and safely insert plain text.
function createElement(tag, className, text) {
    const element = document.createElement(tag);

    if (className) {
        element.className = className;
    }

    if (text !== undefined) {
        element.textContent = text;
    }

    return element;
}

// Choose an icon for each category.
function getCategoryIcon(category) {
    const icons = {
        "Electronics": "💻",
        "ID & Cards": "🪪",
        "Bags & Books": "🎒",
        "Keys": "🔑",
        "Clothing": "👕",
        "Other": "📦"
    };

    return icons[category] || "📦";
}

// Format a date without displaying an invalid date.
function formatDate(dateString) {
    const date = new Date(dateString + "T12:00:00");

    if (Number.isNaN(date.getTime())) {
        return dateString;
    }

    return new Intl.DateTimeFormat("en", {
        day: "numeric",
        month: "short",
        year: "numeric"
    }).format(date);
}

// Build an item card using safe DOM methods.
function createItemCard(item) {
    const card = createElement("article", "item-card");

    const top = createElement("div", "item-top");
    const icon = createElement(
        "div",
        "item-icon",
        getCategoryIcon(item.category)
    );

    icon.setAttribute("aria-hidden", "true");

    const status = createElement(
        "span",
        `status ${item.status.toLowerCase()}`,
        item.status
    );

    top.append(icon, status);

    const title = createElement("h3", "", item.name);

    const category = createElement(
        "p",
        "item-category",
        item.category
    );

    const description = createElement(
        "p",
        "item-description",
        item.description
    );

    const meta = createElement("div", "item-meta");

    meta.append(
        createElement("span", "", `📍 ${item.location}`),
        createElement("span", "", `📅 ${formatDate(item.date)}`)
    );

    card.append(top, title, category, description, meta);

    const contact = document.createElement("a");
    contact.className = "item-contact";
    contact.textContent = item.status === "Lost"
        ? "Contact item owner →"
        : "Contact finder →";

    // Only create an email link for a valid-looking email address.
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item.email)) {
        contact.href = `mailto:${item.email}`;
    } else {
        contact.href = "#report";
    }

    if (item.demo) {
        contact.addEventListener("click", event => {
            event.preventDefault();
            alert(
                "This is sample data. Replace it with a real report to test contact links."
            );
        });
    }

    card.append(contact);

    if (item.demo) {
        card.append(
            createElement("small", "item-category", "Example listing")
        );
    }

    return card;
}

// Update the counts at the top of the page.
function updateStats() {
    document.getElementById("total-items").textContent = items.length;

    document.getElementById("lost-count").textContent =
        items.filter(item => item.status === "Lost").length;

    document.getElementById("found-count").textContent =
        items.filter(item => item.status === "Found").length;
}

// Display the items that match the current filters.
function renderItems() {
    const query = searchInput.value.trim().toLowerCase();
    const category = categoryFilter.value;

    const filteredItems = items.filter(item => {
        const matchesStatus =
            activeStatus === "all" || item.status === activeStatus;

        const matchesCategory =
            category === "all" || item.category === category;

        const searchableText = [
            item.name,
            item.category,
            item.location,
            item.description
        ].join(" ").toLowerCase();

        const matchesSearch = searchableText.includes(query);

        return matchesStatus && matchesCategory && matchesSearch;
    });

    itemsGrid.replaceChildren();

    filteredItems.forEach(item => {
        itemsGrid.append(createItemCard(item));
    });

    emptyMessage.hidden = filteredItems.length > 0;

    updateStats();
}

// Change between All, Lost, and Found.
filterButtons.forEach(button => {
    button.addEventListener("click", () => {
        activeStatus = button.dataset.status;

        filterButtons.forEach(filterButton => {
            const isActive = filterButton === button;

            filterButton.classList.toggle("active", isActive);
            filterButton.setAttribute("aria-pressed", String(isActive));
        });

        renderItems();
    });

    button.setAttribute(
        "aria-pressed",
        String(button.dataset.status === activeStatus)
    );
});

// Search as the user types.
searchInput.addEventListener("input", renderItems);

// Filter by category.
categoryFilter.addEventListener("change", renderItems);

// Handle new reports.
form.addEventListener("submit", event => {
    event.preventDefault();

    formMessage.textContent = "";
    formMessage.className = "form-message";

    const name = document.getElementById("item-name").value.trim();
    const status = document.getElementById("item-status").value;
    const category = document.getElementById("item-category").value;
    const location = document.getElementById("item-location").value.trim();
    const date = document.getElementById("item-date").value;
    const description = document.getElementById("item-description").value.trim();
    const email = document.getElementById("contact-info").value.trim();

    if (!name || !category || !location || !date || !description || !email) {
        formMessage.textContent = "Please complete all required fields.";
        formMessage.classList.add("error");
        return;
    }

    if (new Date(date + "T00:00:00") > new Date()) {
        formMessage.textContent = "Please enter a date that is not in the future.";
        formMessage.classList.add("error");
        return;
    }

    const newItem = {
        id: (window.crypto && crypto.randomUUID)
            ? crypto.randomUUID()
            : String(Date.now()),
        name,
        status,
        category,
        location,
        date,
        description,
        email,
        demo: false
    };

    items.unshift(newItem);

    if (!saveItems()) {
        items.shift();

        formMessage.textContent =
            "The report could not be saved in this browser. Check your browser storage settings and try again.";

        formMessage.classList.add("error");
        return;
    }

    form.reset();

    // Show the newly submitted report immediately.
    activeStatus = "all";
    categoryFilter.value = "all";
    searchInput.value = "";

    filterButtons.forEach(button => {
        const isActive = button.dataset.status === "all";

        button.classList.toggle("active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
    });

    renderItems();

    formMessage.textContent =
        "Your report has been added successfully! It is saved in this browser.";

    formMessage.classList.add("success");

    document.getElementById("items").scrollIntoView({
        behavior: "smooth"
    });
});

// Set the maximum date to today and update the footer.
const dateInput = document.getElementById("item-date");
const today = new Date();
const localToday = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0")
].join("-");

dateInput.max = localToday;

document.getElementById("year").textContent = today.getFullYear();

// Show the initial listings.
renderItems();
