document.addEventListener("DOMContentLoaded", () => {
    
    // --- Get All DOM Elements ---
    const filterButtons = document.querySelectorAll("#filter-buttons .btn");
    const searchBar = document.getElementById("search-bar");
    const galleryGrid = document.getElementById("gallery-grid");
    const allItems = Array.from(galleryGrid.querySelectorAll(".gallery-item"));
    
    // Lightbox Elements
    const lightbox = document.getElementById("lightbox-modal");
    const lightboxImage = document.getElementById("lightbox-image");
    const lightboxCaption = document.getElementById("lightbox-caption");
    const lightboxCounter = document.getElementById("lightbox-counter");
    const closeBtn = document.getElementById("close-btn");
    const prevBtn = document.getElementById("prev-btn");
    const nextBtn = document.getElementById("next-btn");
    const downloadBtn = document.getElementById("download-btn");
    const fullscreenBtn = document.getElementById("fullscreen-btn");

    let currentIndex = 0;
    let currentFilteredItems = [...allItems]; // Start with all items

    // --- Main Filter Function ---
    function performFilter() {
        const searchTerm = searchBar.value.toLowerCase();
        const activeFilter = document.querySelector("#filter-buttons .btn.active").dataset.filter;
        
        currentFilteredItems = []; // Reset the filtered list
        
        allItems.forEach(item => {
            const title = item.dataset.title.toLowerCase();
            const category = item.dataset.category;
            
            // Check for matches
            const categoryMatch = (activeFilter === "all" || activeFilter === category);
            const searchMatch = title.includes(searchTerm);
            
            if (categoryMatch && searchMatch) {
                item.classList.remove("hide");
                item.style.display = "block"; // Show item
                currentFilteredItems.push(item);
            } else {
                item.classList.add("hide");
                item.style.display = "none"; // Hide item
            }
        });
    }

    // --- Event Listeners for Filtering ---
    
    // Category Buttons
    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");
            performFilter(); // Re-run the filter
        });
    });

    // Search Bar (filters in real-time)
    searchBar.addEventListener("input", performFilter);

    // --- Event Listeners for Gallery (Event Delegation) ---
    galleryGrid.addEventListener("click", (e) => {
        // Find the gallery-item that was clicked
        const clickedItem = e.target.closest(".gallery-item");
        
        // Ensure it's a visible item and not the overlay text
        if (clickedItem && !clickedItem.classList.contains("hide")) {
            openLightbox(clickedItem);
        }
    });

    // --- Lightbox Functions ---
    
    function openLightbox(item) {
        // Find the index of the clicked item *within the currently filtered list*
        currentIndex = currentFilteredItems.indexOf(item);
        updateLightbox();
        lightbox.classList.add("show");
    }

    function closeLightbox() {
        // Exit fullscreen if active
        if (document.fullscreenElement) {
            document.exitFullscreen();
        }
        lightbox.classList.remove("show");
    }

    function showNextImage() {
        currentIndex = (currentIndex + 1) % currentFilteredItems.length;
        updateLightbox();
    }

    function showPrevImage() {
        currentIndex = (currentIndex - 1 + currentFilteredItems.length) % currentFilteredItems.length;
        updateLightbox();
    }

    function updateLightbox() {
        if (currentFilteredItems.length === 0) return; // Safety check
        
        const currentItem = currentFilteredItems[currentIndex];
        const img = currentItem.querySelector("img");
        const title = currentItem.dataset.title;
        
        // Update image, caption, counter, and download link
        lightboxImage.src = img.src;
        lightboxImage.alt = img.alt;
        lightboxCaption.textContent = title;
        lightboxCounter.textContent = `${currentIndex + 1} / ${currentFilteredItems.length}`;
        downloadBtn.href = img.src;
    }

    // --- Lightbox Control Listeners ---
    closeBtn.addEventListener("click", closeLightbox);
    nextBtn.addEventListener("click", showNextImage);
    prevBtn.addEventListener("click", showPrevImage);

    // Fullscreen Button
    fullscreenBtn.addEventListener("click", () => {
        // Check if browser is already in fullscreen
        if (!document.fullscreenElement) {
            // Request fullscreen on the image itself
            lightboxImage.requestFullscreen().catch(err => {
                alert(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    });

    // Close lightbox by clicking on the background overlay
    lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Keyboard Navigation
    document.addEventListener("keydown", (e) => {
        if (!lightbox.classList.contains("show")) return; 

        if (e.key === "ArrowRight") {
            showNextImage();
        } else if (e.key === "ArrowLeft") {
            showPrevImage();
        } else if (e.key === "Escape") {
            closeLightbox();
        }
    });

    // --- Initial Call ---
    performFilter(); // Initialize the gallery on page load

});