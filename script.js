// --- CUSTOM CURSOR LOGIC ---
const cursorDot = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');

// Only run on desktop
if (window.matchMedia("(min-width: 768px)").matches) {
    window.addEventListener("mousemove", (e) => {
        const posX = e.clientX;
        const posY = e.clientY;

        // Dot follows instantly
        cursorDot.style.left = `${posX}px`;
        cursorDot.style.top = `${posY}px`;

        // Outline follows with lag (animation in CSS)
        cursorOutline.animate({
            left: `${posX}px`,
            top: `${posY}px`
        }, { duration: 300, fill: "forwards" });
    });

    // Hover effect for links
    const links = document.querySelectorAll('a, .project-card, .close-modal');
    links.forEach(link => {
        link.addEventListener('mouseenter', () => {
            cursorOutline.style.width = "60px";
            cursorOutline.style.height = "60px";
            cursorOutline.style.backgroundColor = "rgba(255,255,255,0.1)";
        });
        link.addEventListener('mouseleave', () => {
            cursorOutline.style.width = "40px";
            cursorOutline.style.height = "40px";
            cursorOutline.style.backgroundColor = "transparent";
        });
    });
}

// --- HORIZONTAL SCROLL WITH MOUSE WHEEL (Projects Page) ---
const gallery = document.querySelector('.gallery-wrapper');
if (gallery) {
    gallery.addEventListener('wheel', (evt) => {
        evt.preventDefault();
        gallery.scrollLeft += evt.deltaY;
    });
}

// --- PARALLAX ON SCROLL LOGIC ---
const galleryContainer = document.querySelector('.gallery-wrapper');
const projectImages = document.querySelectorAll('.project-card img');

const updateParallax = () => {
    // Loop through all images
    projectImages.forEach(img => {
        const card = img.parentElement;
        const rect = card.getBoundingClientRect();
        
        // Calculate the center of the card relative to the window
        const cardCenterX = rect.left + (rect.width / 2);
        const windowCenterX = window.innerWidth / 2;
        
        // Calculate distance from center (Result is roughly -windowWidth to +windowWidth)
        const distanceFromCenter = cardCenterX - windowCenterX;
        
        // Parallax Factor: How much the image moves. 
        // 0.1 means it moves 10% of the scroll distance.
        const speed = 0.15; 
        
        // Apply transform
        // We simply shift X based on distance from center
        img.style.transform = `translateX(${distanceFromCenter * speed}px)`;
    });
};

// Run the function whenever we scroll
if (galleryContainer) {
    galleryContainer.addEventListener('scroll', () => {
        // Use requestAnimationFrame for smooth performance
        requestAnimationFrame(updateParallax);
    });

    // Also run it on window resize and initial load
    window.addEventListener('resize', updateParallax);
    updateParallax(); // Initial call to set positions
    
    // Connect mouse wheel to horizontal scroll (Keep your existing wheel code)
    galleryContainer.addEventListener('wheel', (evt) => {
        evt.preventDefault();
        galleryContainer.scrollLeft += evt.deltaY;
        // The scroll event listener above will catch this change automatically
    });
}

// --- BEHANCE MODAL LOGIC ---
const modal = document.querySelector('.modal-overlay');
const iframe = document.querySelector('#project-iframe');
const closeBtn = document.querySelector('.close-modal');
const projectCards = document.querySelectorAll('.project-card');

// Function to open modal
if (projectCards.length > 0) {
    projectCards.forEach(card => {
        card.addEventListener('click', () => {
            // Get the Behance URL from the data attribute
            const embedUrl = card.getAttribute('data-embed');
            if (embedUrl) {
                iframe.src = embedUrl;
                modal.classList.add('active');
            }
        });
    });
}

// Function to close modal
if (closeBtn) {
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        iframe.src = ""; // Stop video playback
    });

    // Close on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
            iframe.src = "";
        }
    });
}
// --- RANDOM VIDEO START TIME ---
const bgVideo = document.getElementById('bg-video');

if (bgVideo) {
    // Function to set random time
    const setRandomTimestamp = () => {
        if (bgVideo.duration) {
            const randomTime = Math.random() * bgVideo.duration;
            bgVideo.currentTime = randomTime;
        }
    };

    // Check if video metadata (duration) is already loaded
    if (bgVideo.readyState >= 1) {
        setRandomTimestamp();
    } else {
        // If not, wait for it to load
        bgVideo.addEventListener('loadedmetadata', setRandomTimestamp);
    }
}
// --- SIDEBAR TOPOGRAPHY (IDLE + INTERACTIVE) ---
const sidebar = document.querySelector('.sidebar');
const turbulence = document.getElementById('turbulence');

if (sidebar && turbulence) {
    let isHovering = false;
    let time = 0;

    // 1. The Animation Loop
    const animateTopo = () => {
        if (!isHovering) {
            // Increment time for the sine wave
            time += 0.01; 

            // Calculate gentle idle movement
            // We oscillate around 0.02 with a small amplitude (0.005)
            const bfx = 0.02 + Math.sin(time) * 0.005; 
            const bfy = 0.02 + Math.cos(time) * 0.005;

            turbulence.setAttribute('baseFrequency', `${bfx} ${bfy}`);
        }
        
        // Keep the loop running
        requestAnimationFrame(animateTopo);
    };

    // Start the loop
    animateTopo();

    // 2. Interactive Mouse Movement
    sidebar.addEventListener('mousemove', (e) => {
        isHovering = true; // Stop the idle animation

        const rect = sidebar.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Map mouse position to frequency (more intense)
        const xPercent = x / rect.width;
        const yPercent = y / rect.height;

        // The mouse creates sharper waves (up to 0.04 freq)
        const freqX = 0.005 + (xPercent * 0.007);
        const freqY = 0.04 + (yPercent * 0.02);

        turbulence.setAttribute('baseFrequency', `${freqX} ${freqY}`);
    });

    // 3. Resume Idle on Leave
    sidebar.addEventListener('mouseleave', () => {
        isHovering = false;
        // Optional: Reset time to smooth out the jump, 
        // or just let it snap back to the sine wave.
    });
}