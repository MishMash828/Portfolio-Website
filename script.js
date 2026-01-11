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
// --- SLIDESHOW GALLERY LOGIC ---
const modal = document.querySelector('.modal-overlay');
const slideContainer = document.querySelector('.slideshow-container');
const closeBtn = document.querySelector('.close-modal');
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');
const projectCards = document.querySelectorAll('.project-card');

let currentSlideIndex = 0;
let slides = [];

// 1. Open Album
projectCards.forEach(card => {
    card.addEventListener('click', () => {
        // Clear previous slides
        slideContainer.innerHTML = '';
        slides = [];
        currentSlideIndex = 0;

        // Find hidden images in the clicked card
        const hiddenImages = card.querySelectorAll('.album-photos img');
        
        if (hiddenImages.length > 0) {
            // Clone them into the slideshow container
            hiddenImages.forEach((img, index) => {
                const slide = img.cloneNode();
                slide.className = 'slide-img'; // Add styling class
                if (index === 0) slide.classList.add('active'); // Show first one
                slideContainer.appendChild(slide);
                slides.push(slide);
            });

            modal.classList.add('active');
        }
    });
});

// 2. Navigation Functions
const showSlide = (index) => {
    // Remove active class from all
    slides.forEach(slide => slide.classList.remove('active'));
    
    // Handle wrapping (Loop back to start/end)
    if (index >= slides.length) currentSlideIndex = 0;
    else if (index < 0) currentSlideIndex = slides.length - 1;
    else currentSlideIndex = index;

    // Show new slide
    slides[currentSlideIndex].classList.add('active');
};

// Button Listeners
if (prevBtn) prevBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent closing modal
    showSlide(currentSlideIndex - 1);
});

if (nextBtn) nextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    showSlide(currentSlideIndex + 1);
});

// 3. Close Logic
if (closeBtn) {
    const closeModal = () => modal.classList.remove('active');
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        // Close if clicking outside the image
        if (e.target === modal) closeModal();
    });
}

// Keyboard Support (Left/Right Keys)
document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('active')) return;
    if (e.key === 'ArrowLeft') showSlide(currentSlideIndex - 1);
    if (e.key === 'ArrowRight') showSlide(currentSlideIndex + 1);
    if (e.key === 'Escape') modal.classList.remove('active');
});
