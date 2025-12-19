document.addEventListener("DOMContentLoaded", () => {
    
    // --- Fade-in Animations ---
    const hiddenElements = document.querySelectorAll(".hidden");

    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("show");
                fadeObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    hiddenElements.forEach(el => fadeObserver.observe(el));


    // --- Active Nav Link Highlighting ---
    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll(".nav-links a");

    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute("id");
                
                navLinks.forEach(link => {
                    link.classList.remove("active");
                });

                const activeLink = document.querySelector(`.nav-links a[href="#${id}"]`);
                if (activeLink) {
                    activeLink.classList.add("active");
                }
            }
        });
    }, {
        rootMargin: "-50% 0px -50% 0px" 
    });

    sections.forEach(section => navObserver.observe(section));
});