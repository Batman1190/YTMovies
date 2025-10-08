// DOM Elements
const menuIcon = document.querySelector('.mobile-menu-toggle');
const sidebar = document.querySelector('.sidebar');
const container = document.querySelector('.container');
const content = document.querySelector('.content');
const mobileQueueToggle = document.getElementById('mobile-queue-toggle');
const videoQueueSidebar = document.querySelector('.video-queue-sidebar');
const hideRightSidebarBtn = document.getElementById('hide-sidebar-btn');
const showRightSidebarBtn = document.getElementById('show-sidebar-btn');

// Debug DOM elements
console.log('Sidebar.js DOM elements:', {
    menuIcon: !!menuIcon,
    sidebar: !!sidebar,
    container: !!container,
    content: !!content,
    mobileQueueToggle: !!mobileQueueToggle,
    videoQueueSidebar: !!videoQueueSidebar,
    hideRightSidebarBtn: !!hideRightSidebarBtn,
    showRightSidebarBtn: !!showRightSidebarBtn
});

// State
let isSidebarOpen = false;
let isRightSidebarOpen = true; // desktop default visible
let overlayTimeout = null;
let resizeTimeout = null;
let menuToggleLocked = false; // debounce guard for hamburger
let queueToggleLocked = false; // debounce guard for queue toggle

function debounceToggle(lockFlagName, fn, delay = 500) {
    if (lockFlagName === 'menu' && menuToggleLocked) {
        console.log('Menu toggle locked, ignoring');
        return;
    }
    if (lockFlagName === 'queue' && queueToggleLocked) {
        console.log('Queue toggle locked, ignoring');
        return;
    }
    if (lockFlagName === 'menu') menuToggleLocked = true;
    if (lockFlagName === 'queue') queueToggleLocked = true;
    try { fn(); } finally {
        setTimeout(() => {
            if (lockFlagName === 'menu') menuToggleLocked = false;
            if (lockFlagName === 'queue') queueToggleLocked = false;
        }, delay);
    }
}

// Toggle sidebar function
function toggleSidebar() {
    isSidebarOpen = !isSidebarOpen;
    
    if (window.innerWidth <= 600) {
        // Mobile view
        if (isSidebarOpen) {
            // Prevent body scroll when sidebar is open
            document.body.style.overflow = 'hidden';
            
            if (sidebar) sidebar.classList.add('active');
            
            // Check if overlay already exists to avoid duplicates
            let overlay = document.querySelector('.sidebar-overlay');
            if (!overlay) {
                // Add overlay to prevent interaction with content
                overlay = document.createElement('div');
                overlay.className = 'sidebar-overlay';
                document.body.appendChild(overlay);
            }
            
            // Add active class after a delay to prevent immediate click-through
            setTimeout(() => {
                if (overlay) {
                    overlay.classList.add('active');
                    // Add click handler only after overlay is fully active
                    overlay.onclick = (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleSidebar();
                    };
                }
            }, 100);
        } else {
            document.body.style.overflow = '';
            if (sidebar) sidebar.classList.remove('active');
            const overlay = document.querySelector('.sidebar-overlay');
            if (overlay) {
                overlay.onclick = null; // Remove click handler first
                overlay.classList.remove('active');
                // Remove overlay after transition
                clearTimeout(overlayTimeout);
                overlayTimeout = setTimeout(() => {
                    if (overlay && overlay.parentNode) {
                        document.body.removeChild(overlay);
                    }
                }, 300);
            }
        }
        
        // Update video player layout if function exists
        if (typeof updateVideoPlayerLayout === 'function') {
            updateVideoPlayerLayout();
        }
    } else {
        // Desktop view
        if (sidebar) sidebar.classList.toggle('collapsed');
        if (content) content.style.marginLeft = isSidebarOpen ? '250px' : '70px';
        
        // Update video player layout if function exists
        if (typeof updateVideoPlayerLayout === 'function') {
            updateVideoPlayerLayout();
        }
        
        // Handle text visibility in sidebar links (handled by CSS)
    }
}

// Event Listeners
if (menuIcon) {
    // Use click event for better mobile compatibility
    const handleMenuToggle = (e) => {
        try {
            e.preventDefault();
            e.stopPropagation();
        } catch (_) {}
        debounceToggle('menu', toggleSidebar);
    };
    
    // Remove any existing event listeners to prevent duplicates
    menuIcon.removeEventListener('click', handleMenuToggle);
    menuIcon.removeEventListener('pointerup', handleMenuToggle);
    
    // Add click event for mobile compatibility
    menuIcon.addEventListener('click', handleMenuToggle, { passive: false });
    
    // Make sure the menu icon is properly interactive
    menuIcon.style.pointerEvents = 'auto';
    menuIcon.style.touchAction = 'manipulation';
    menuIcon.style.userSelect = 'none';
    menuIcon.style.zIndex = '10000';
    menuIcon.style.position = 'relative';
}

// Right Sidebar (Queue) - Mobile functions
function openRightSidebarMobile() {
    console.log('openRightSidebarMobile called');
    if (!videoQueueSidebar) {
        console.log('videoQueueSidebar not found in openRightSidebarMobile');
        return;
    }
    console.log('Opening right sidebar mobile');
    // Prevent body scroll when sidebar is open
    document.body.style.overflow = 'hidden';
    videoQueueSidebar.classList.add('active');
    console.log('Added active class to videoQueueSidebar');
    
    // Use existing overlay element to avoid duplicates/conflicts
    const overlay = document.getElementById('sidebar-overlay') || document.querySelector('.sidebar-overlay');
    if (overlay) {
        overlay.classList.add('active');
        // Ensure only one click handler is attached
        overlay.onclick = closeRightSidebarMobile;
    }
    console.log('Right sidebar mobile opened successfully');
}

function closeRightSidebarMobile() {
    console.log('closeRightSidebarMobile called');
    if (!videoQueueSidebar) {
        console.log('videoQueueSidebar not found in closeRightSidebarMobile');
        return;
    }
    console.log('Closing right sidebar mobile');
    document.body.style.overflow = '';
    videoQueueSidebar.classList.remove('active');
    console.log('Removed active class from videoQueueSidebar');
    
    const overlay = document.getElementById('sidebar-overlay') || document.querySelector('.sidebar-overlay');
    if (overlay) {
        overlay.classList.remove('active');
        // Keep the shared overlay in DOM; just deactivate it
        overlay.onclick = null;
    }
    console.log('Right sidebar mobile closed successfully');
}

function toggleRightSidebarMobile() {
    console.log('toggleRightSidebarMobile called');
    if (!videoQueueSidebar) {
        console.log('videoQueueSidebar not found');
        return;
    }
    const isActive = videoQueueSidebar.classList.contains('active');
    console.log('Right sidebar isActive:', isActive);
    if (isActive) {
        closeRightSidebarMobile();
    } else {
        openRightSidebarMobile();
    }
}

if (mobileQueueToggle) {
    console.log('Setting up mobile queue toggle event listeners');
    console.log('Button element:', mobileQueueToggle);
    console.log('Button styles:', window.getComputedStyle(mobileQueueToggle));
    
    // Simplify to one pointer-based handler to avoid duplicate toggles
    const handleQueueToggle = (e) => {
        console.log('Mobile queue toggle pointerup');
        try {
            e.preventDefault();
            e.stopPropagation();
        } catch (_) {}
        debounceToggle('queue', toggleRightSidebarMobile);
    };
    mobileQueueToggle.addEventListener('pointerup', handleQueueToggle, { passive: false });

    // Force the button to be interactive
    mobileQueueToggle.style.pointerEvents = 'auto';
    mobileQueueToggle.style.touchAction = 'manipulation';
    mobileQueueToggle.style.userSelect = 'none';
    mobileQueueToggle.style.zIndex = '10000';
    mobileQueueToggle.style.position = 'relative';
    // Remove any inline onclick to avoid duplicate handlers
    mobileQueueToggle.onclick = null;
    
} else {
    console.log('mobileQueueToggle not found');
}

// Right Sidebar (Queue) - Desktop hide/show
function hideRightSidebarDesktop() {
    if (!videoQueueSidebar || !content) return;
    videoQueueSidebar.classList.add('hidden');
    content.classList.add('sidebar-hidden');
    if (showRightSidebarBtn) showRightSidebarBtn.classList.remove('hidden');
    isRightSidebarOpen = false;
    if (typeof updateVideoPlayerLayout === 'function') updateVideoPlayerLayout();
}

function showRightSidebarDesktop() {
    if (!videoQueueSidebar || !content) return;
    videoQueueSidebar.classList.remove('hidden');
    content.classList.remove('sidebar-hidden');
    if (showRightSidebarBtn) showRightSidebarBtn.classList.add('hidden');
    isRightSidebarOpen = true;
    if (typeof updateVideoPlayerLayout === 'function') updateVideoPlayerLayout();
}

if (hideRightSidebarBtn) {
    hideRightSidebarBtn.addEventListener('click', () => {
        if (window.matchMedia('(max-width: 600px)').matches) {
            closeRightSidebarMobile();
        } else {
            hideRightSidebarDesktop();
        }
    });
}

if (showRightSidebarBtn) {
    showRightSidebarBtn.addEventListener('click', showRightSidebarDesktop);
}

// Handle responsive behavior
function handleResize() {
    const isMobile = window.innerWidth <= 600;
    
    if (isMobile) {
        // Mobile view - minimal interference
        if (sidebar) sidebar.classList.remove('collapsed');
        if (content) content.style.marginLeft = '0';
        
        // Only clean up orphaned overlays, don't touch sidebar state
        const overlay = document.querySelector('.sidebar-overlay');
        if (overlay && sidebar && !sidebar.classList.contains('active')) {
            document.body.removeChild(overlay);
        }
        
        document.body.style.overflow = '';
        
        // Hide desktop show button on mobile
        if (showRightSidebarBtn) showRightSidebarBtn.classList.add('hidden');
    } else {
        // Desktop view - minimal interference
        // Only clean up mobile-specific elements
        if (sidebar) {
            sidebar.classList.remove('active');
            const overlay = document.querySelector('.sidebar-overlay');
            if (overlay) {
                document.body.removeChild(overlay);
            }
        }
        
        // Use actual DOM state for content margin
        const sidebarIsOpen = sidebar && sidebar.classList.contains('active');
        if (content) content.style.marginLeft = sidebarIsOpen ? '250px' : '70px';
        document.body.style.overflow = '';
        
        // Restore right sidebar visibility according to state
        if (videoQueueSidebar) {
            if (isRightSidebarOpen) {
                videoQueueSidebar.classList.remove('hidden');
                if (content) content.classList.remove('sidebar-hidden');
                if (showRightSidebarBtn) showRightSidebarBtn.classList.add('hidden');
            } else {
                videoQueueSidebar.classList.add('hidden');
                if (content) content.classList.add('sidebar-hidden');
                if (showRightSidebarBtn) showRightSidebarBtn.classList.remove('hidden');
            }
        }
    }
}

// Listen for window resize with throttling
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(handleResize, 100);
});

// Cleanup on page unload
window.addEventListener('unload', () => {
    clearTimeout(overlayTimeout);
    clearTimeout(resizeTimeout);
    document.body.style.overflow = '';
});

// Initial setup - wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOM loaded, initializing sidebar');
        handleResize();
    });
} else {
    console.log('DOM already loaded, initializing sidebar');
    handleResize();
}

// Accessibility: close sidebars with Escape key
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (window.matchMedia('(max-width: 600px)').matches) {
            // Close mobile sidebars if open
            if (sidebar && sidebar.classList.contains('active')) toggleSidebar();
            if (videoQueueSidebar && videoQueueSidebar.classList.contains('active')) closeRightSidebarMobile();
        } else {
            // On desktop, show right sidebar button if hidden state
            if (videoQueueSidebar && !isRightSidebarOpen) {
                showRightSidebarDesktop();
            }
        }
    }
});