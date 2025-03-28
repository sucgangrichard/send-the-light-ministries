// JavaScript enhancements for animations

// Add staggered animation class to video grid on load
function enhanceAnimations() {
    // Add staggered animation class to video grid
    const videosGrid = document.getElementById('videosGrid');
    if (videosGrid) {
        videosGrid.classList.add('staggered-animation');
    }
    
    // Add animated border class to featured videos heading
    const featuredHeading = document.querySelector('h2');
    if (featuredHeading) {
        featuredHeading.classList.add('animated-border');
        featuredHeading.style.padding = '10px';
        featuredHeading.style.borderRadius = '5px';
    }
    
    // Add hover-float class to all video cards
    const videoCards = document.querySelectorAll('.video-card');
    videoCards.forEach(card => {
        card.classList.add('hover-float');
    });
    
    // Add ripple effect to buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.classList.add('btn-ripple');
    });
    
    // Add 3D effect to cards
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.classList.add('card-3d');
    });
    
    // Add typing animation to empty state message
    const emptyStateTitle = document.querySelector('.empty-state h3');
    if (emptyStateTitle) {
        emptyStateTitle.classList.add('typing-animation');
    }
    
    // Add animated background to footer
    const footer = document.querySelector('footer');
    if (footer) {
        footer.classList.add('animated-bg');
    }
    
    // Add gradient background to navbar
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        navbar.classList.add('gradient-bg');
        navbar.style.backgroundSize = '200% 200%';
    }
}

// Call the function after DOM content is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for other scripts to initialize
    setTimeout(enhanceAnimations, 500);
});

// Add animation when switching view modes
const originalSetViewMode = window.setViewMode;
if (typeof originalSetViewMode === 'function') {
    window.setViewMode = function(mode) {
        // Call the original function
        originalSetViewMode(mode);
        
        // Add animations after view change
        if (mode === 'grid') {
            const videosGrid = document.getElementById('videosGrid');
            if (videosGrid) {
                videosGrid.classList.add('staggered-animation');
            }
        } else {
            const videosList = document.getElementById('videosList');
            if (videosList) {
                const listItems = videosList.querySelectorAll('.video-list-item');
                listItems.forEach((item, index) => {
                    item.style.animationDelay = `${0.1 * index}s`;
                    item.style.opacity = '0';
                    item.style.animation = 'fadeIn 0.5s ease-out forwards';
                });
            }
        }
    };
}

// Enhanced video modal opening with animation
const originalOpenVideoModal = window.openVideoModal;
if (typeof originalOpenVideoModal === 'function') {
    window.openVideoModal = function(videoId) {
        // Call the original function
        originalOpenVideoModal(videoId);
        
        // Add animation to modal content
        const modalContent = document.querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.animation = 'fadeIn 0.5s ease-out forwards';
        }
    };
}

// Add scroll animations
window.addEventListener('scroll', function() {
    const scrollPosition = window.scrollY;
    
    // Parallax effect for background
    document.body.style.backgroundPositionY = `${scrollPosition * 0.1}px`;
    
    // Animate elements when they come into view
    const animateOnScroll = document.querySelectorAll('.video-card, .video-list-item');
    animateOnScroll.forEach(element => {
        const elementPosition = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (elementPosition < windowHeight - 100) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }
    });
});

// Add animation to search results
const originalRenderVideos = window.renderVideos;
if (typeof originalRenderVideos === 'function') {
    window.renderVideos = function() {
        // Call the original function
        originalRenderVideos();
        
        // Add animations to newly rendered videos
        enhanceAnimations();
    };
}
