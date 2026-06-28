// global.js - Barcha sahifalar uchun umumiy keyboard shortcuts
document.addEventListener('DOMContentLoaded', function() {
    // Global Navigation Shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl yoki Command bosilganligini tekshirish
        const isCtrl = e.ctrlKey || e.metaKey;
        
        // Global Navigation
        if (isCtrl) {
            switch(e.key.toLowerCase()) {
                case 'n':
                    e.preventDefault();
                    if (window.location.pathname.includes('add.html') === false) {
                        window.location.href = 'add.html';
                    }
                    break;
                case 'h':
                    e.preventDefault();
                    if (window.location.pathname.includes('index.html') === false) {
                        window.location.href = 'index.html';
                    }
                    break;
                case 'c':
                    e.preventDefault();
                    if (window.location.pathname.includes('calendar.html') === false) {
                        window.location.href = 'calendar.html';
                    }
                    break;
                case 's':
                    e.preventDefault();
                    if (window.location.pathname.includes('stats.html') === false) {
                        window.location.href = 'stats.html';
                    }
                    break;
                case ',':
                    e.preventDefault();
                    if (window.location.pathname.includes('settings.html') === false) {
                        window.location.href = 'settings.html';
                    }
                    break;
                case 't':
                    e.preventDefault();
                    if (window.location.pathname.includes('chat.html') === false) {
                        window.location.href = 'chat.html';
                    }
                    break;
            }
        }

        // Escape - Modal yopish
        if (e.key === 'Escape') {
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => {
                if (modal.style.display === 'flex') {
                    modal.style.display = 'none';
                }
            });
            
            // Suggestions popup yopish
            const suggestions = document.getElementById('suggestionsPopup');
            if (suggestions) {
                suggestions.style.display = 'none';
            }
        }
    });

    // Task operations shortcuts faqat index.html uchun
    if (window.location.pathname.includes('index.html')) {
        setupTaskShortcuts();
    }

    // Add page shortcuts
    if (window.location.pathname.includes('add.html')) {
        setupAddPageShortcuts();
    }
});

// Task operations shortcuts function
function setupTaskShortcuts() {
    document.addEventListener('keydown', function(e) {
        const isCtrl = e.ctrlKey || e.metaKey;
        
        // Task selection and navigation
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            e.preventDefault();
            navigateTasks(e.key);
        }
        
        // Select all tasks
        if (isCtrl && e.key.toLowerCase() === 'a') {
            e.preventDefault();
            selectAllTasks();
        }
        
        // Complete selected task
        if (isCtrl && e.key.toLowerCase() === 'd') {
            e.preventDefault();
            completeSelectedTask();
        }
        
        // Delete selected task (Ctrl+Delete)
        if (isCtrl && e.key === 'Delete') {
            e.preventDefault();
            deleteSelectedTask();
        }
    });
}

// Task navigation functions
let currentSelectedIndex = -1;

function navigateTasks(direction) {
    const tasks = document.querySelectorAll('.task-item, .task-card');
    
    if (tasks.length === 0) return;
    
    // Remove previous selection
    tasks.forEach(task => task.classList.remove('keyboard-selected'));
    
    if (direction === 'ArrowDown') {
        currentSelectedIndex = (currentSelectedIndex + 1) % tasks.length;
    } else if (direction === 'ArrowUp') {
        currentSelectedIndex = currentSelectedIndex <= 0 ? tasks.length - 1 : currentSelectedIndex - 1;
    }
    
    // Add selection to current task
    if (currentSelectedIndex >= 0 && currentSelectedIndex < tasks.length) {
        tasks[currentSelectedIndex].classList.add('keyboard-selected');
        tasks[currentSelectedIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

function selectAllTasks() {
    const tasks = document.querySelectorAll('.task-item, .task-card');
    tasks.forEach(task => task.classList.add('keyboard-selected'));
}

function completeSelectedTask() {
    const selectedTask = document.querySelector('.keyboard-selected');
    if (selectedTask) {
        const completeBtn = selectedTask.querySelector('.complete-btn, [onclick*="completeTask"]');
        if (completeBtn) {
            completeBtn.click();
        }
    }
}

function deleteSelectedTask() {
    const selectedTask = document.querySelector('.keyboard-selected');
    if (selectedTask) {
        const deleteBtn = selectedTask.querySelector('.delete-btn, [onclick*="deleteTask"]');
        if (deleteBtn) {
            if (confirm('Are you sure you want to delete this task?')) {
                deleteBtn.click();
            }
        }
    }
}

// Add page shortcuts
function setupAddPageShortcuts() {
    document.addEventListener('keydown', function(e) {
        const isCtrl = e.ctrlKey || e.metaKey;
        
        // Save task (Ctrl+Enter)
        if ((isCtrl && e.key === 'Enter') || e.key === 'Enter') {
            e.preventDefault();
            const addButton = document.querySelector('.add-button');
            if (addButton) {
                addButton.click();
            }
        }
        
        // Focus management
        if (e.key === 'Tab') {
            e.preventDefault();
            const inputs = document.querySelectorAll('.input-field, select, button:not(.add-button)');
            const currentIndex = Array.from(inputs).indexOf(document.activeElement);
            const nextIndex = (currentIndex + 1) % inputs.length;
            inputs[nextIndex].focus();
        }
    });
}

// CSS for keyboard selection
const style = document.createElement('style');
style.textContent = `
    .keyboard-selected {
        background: rgba(0, 122, 255, 0.1) !important;
        border: 2px solid #007AFF !important;
        border-radius: 10px;
        position: relative;
    }
    
    .keyboard-selected::after {
        content: '↲ Enter to select';
        position: absolute;
        top: -25px;
        right: 0;
        background: #007AFF;
        color: white;
        padding: 2px 8px;
        border-radius: 5px;
        font-size: 11px;
        animation: fadeIn 0.3s ease;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(5px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    /* Shortcut hint for desktop */
    @media (min-width: 768px) {
        .shortcut-hint {
            position: fixed;
            bottom: 100px;
            right: 20px;
            background: rgba(28, 28, 30, 0.9);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            padding: 10px;
            font-size: 12px;
            color: var(--ios-gray);
            z-index: 999;
        }
        
        .shortcut-hint kbd {
            background: var(--ios-light-gray);
            padding: 2px 6px;
            border-radius: 4px;
            margin: 0 2px;
            font-family: monospace;
        }
    }
`;
document.head.appendChild(style);



// animatsiya



const items = document.querySelectorAll(".nav-item");
const indicator = document.querySelector(".nav-indicator");

function moveIndicator(el, animate = true) {
  const rect = el.getBoundingClientRect();
  const parentRect = el.parentElement.getBoundingClientRect();

  const newLeft = rect.left - parentRect.left;
  const newWidth = rect.width;

  if (!animate) {
    indicator.style.transition = "none";
    indicator.style.left = newLeft + "px";
    indicator.style.width = newWidth + "px";
    indicator.style.transform = "translateY(-50%) scale(1)";
    indicator.style.backdropFilter = "blur(0px)";
    requestAnimationFrame(() => {
      indicator.style.transition = "";
    });
    return;
  }

  /* 💫 Maximum jelly effect animation (0.3s) */
  indicator.style.transition = `
    left 0.4s cubic-bezier(0.25, 1.5, 0.45, 1.2),
    width 0.4s cubic-bezier(0.25, 1.5, 0.45, 1.2),
    transform 0.3s cubic-bezier(0.25, 0.1, 0.15, 1.8),
    backdrop-filter 0.3s ease
  `;

  // Extreme jelly effect boshlanishi
  indicator.style.transform = "translateY(-50%) scaleX(1.35) scaleY(0.75)";
  indicator.style.left = newLeft + "px";
  indicator.style.width = newWidth + "px";
  indicator.style.backdropFilter = "blur(12px) brightness(1.4) contrast(1.1)";
  indicator.style.opacity = "0.9";

  /* Maximum jelly animation sequence */
  requestAnimationFrame(() => {
    // 1-phase: Super stretch
    indicator.style.transform = "translateY(-50%) scaleX(1.25) scaleY(0.85)";
    
    setTimeout(() => {
      // 2-phase: Extreme bounce
      indicator.style.transform = "translateY(-50%) scaleX(1.15) scaleY(1.15)";
      indicator.style.backdropFilter = "blur(10px) brightness(1.3) contrast(1.05)";
      
      setTimeout(() => {
        // 3-phase: Over-shoot
        indicator.style.transform = "translateY(-50%) scaleX(1.05) scaleY(0.95)";
        
        setTimeout(() => {
          // 4-phase: Final settle with micro-bounce
          indicator.style.transform = "translateY(-50%) scale(1)";
          indicator.style.backdropFilter = "blur(6px) brightness(1.1)";
          indicator.style.opacity = "1";
        }, 50);
      }, 60);
    }, 70);
  });
}


/* 🔹 Page load payti */
window.addEventListener("DOMContentLoaded", () => {
  const activeItem = document.querySelector(".nav-item.active");
  if (activeItem) {
    moveIndicator(activeItem, false); // ❗ animatsiyasiz
  }
});

/* 🔹 Click payti */
items.forEach(item => {
  item.addEventListener("click", e => {
    e.preventDefault();

    moveIndicator(item, true); // animatsiya BOR

    setTimeout(() => {
      window.location.href = item.href;
    }, 550);
  });
});




































// Global JavaScript for WarpTask

// Check authentication state on page load
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('wzIsLoggedIn') === 'true';
    const currentPage = window.location.pathname.split('/').pop();
    
    // Pages that require authentication
    const protectedPages = ['settings.html', 'stats.html', 'add.html', 'calendar.html'];
    
    // If not logged in and trying to access protected page, redirect to login
    if (!isLoggedIn && protectedPages.includes(currentPage)) {
        window.location.href = 'login.html';
        return;
    }
    
    // If logged in and trying to access auth pages, redirect to home
    if (isLoggedIn && (currentPage === 'login.html' || currentPage === 'signup.html')) {
        window.location.href = 'index.html';
        return;
    }
    
    // Update UI based on auth state
    updateUIForAuthState(isLoggedIn);
});

// Update UI elements based on authentication state
function updateUIForAuthState(isLoggedIn) {
    // Update Create Account button on index.html
    const createAccountBtn = document.getElementById('createAccountBtn');
    if (createAccountBtn) {
        if (isLoggedIn) {
            createAccountBtn.style.display = 'none';
        } else {
            createAccountBtn.style.display = 'flex';
            createAccountBtn.onclick = () => {
                window.location.href = 'login.html';
            };
        }
    }
    
    // Update user info in settings if available
    if (isLoggedIn && window.location.pathname.includes('settings.html')) {
        try {
            const userData = JSON.parse(localStorage.getItem('wzCurrentUser'));
            if (userData) {
                // Add user info to settings page
                const aboutSection = document.querySelector('.settings-section.about-section');
                if (aboutSection) {
                    const userItem = document.createElement('div');
                    userItem.className = 'settings-item';
                    userItem.innerHTML = `
                        <div class="item-content">
                            <div class="item-icon" style="background: var(--ios-blue)">
                                <i class="fas fa-user"></i>
                            </div>
                            <div class="item-text">
                                <div class="item-title">Account</div>
                                <div class="item-description">${userData.username}</div>
                            </div>
                        </div>
                        <div class="item-value">${userData.email}</div>
                    `;
                    aboutSection.insertBefore(userItem, aboutSection.firstChild.nextSibling);
                }
            }
        } catch (error) {
            console.log('Error loading user info:', error);
        }
    }
}

// Global toast notification function
function showGlobalToast(message, type = 'info') {
    // Remove existing toasts
    const existingToasts = document.querySelectorAll('.global-toast');
    existingToasts.forEach(toast => toast.remove());
    
    // Create toast
    const toast = document.createElement('div');
    toast.className = 'global-toast';
    toast.style.cssText = `
        position: fixed;
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'error' ? 'var(--ios-red)' : type === 'success' ? 'var(--ios-green)' : 'rgba(28, 28, 30, 0.9)'};
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 15px;
        padding: 12px 20px;
        color: white;
        font-size: 14px;
        font-weight: 500;
        z-index: 10000;
        animation: toastSlideUp 0.3s ease;
        max-width: 90%;
        text-align: center;
    `;
    
    // Add icon based on type
    const icon = type === 'error' ? 'fas fa-exclamation-circle' :
                 type === 'success' ? 'fas fa-check-circle' : 'fas fa-info-circle';
    
    toast.innerHTML = `
        <i class="${icon}" style="margin-right: 8px;"></i>
        ${message}
    `;
    
    document.body.appendChild(toast);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'toastSlideDown 0.3s ease forwards';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// Add toast animations to global CSS
if (!document.querySelector('#toast-animations')) {
    const style = document.createElement('style');
    style.id = 'toast-animations';
    style.textContent = `
        @keyframes toastSlideUp {
            from {
                opacity: 0;
                transform: translateX(-50%) translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
        }
        @keyframes toastSlideDown {
            from {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
            to {
                opacity: 0;
                transform: translateX(-50%) translateY(20px);
            }
        }
    `;
    document.head.appendChild(style);
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showGlobalToast,
        updateUIForAuthState
    };
}




// Scroll progress indikatori
window.addEventListener('scroll', function() {
  const scrollTop = window.pageYOffset;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrollPercent = (scrollTop / docHeight) * 100;
  
  document.documentElement.style.setProperty('--scroll-progress', `${scrollPercent}%`);
  
  // Scroll indikatorini ko'rsatish
  const indicator = document.querySelector('.scroll-indicator');
  if (scrollTop > 100) {
    // Elementni tanlash
const indicator = document.getElementById('indicator') || 
                  document.querySelector('.indicator') ||
                  document.querySelector('[data-indicator]');

// Mavjudligini tekshirish
if (indicator) {
    indicator.classList.add('visible');
    console.log('Indicator visible qilindi');
} else {
    console.error('Indicator elementi topilmadi');
}
  } 
  
  else {
    indicator.classList.remove('visible');
  }
});

// Smooth scroll funktsiyasi
function smoothScrollTo(element, duration = 500) {
  const targetPosition = element.offsetTop;
  const startPosition = window.pageYOffset;
  const distance = targetPosition - startPosition;
  let startTime = null;
  
  function animation(currentTime) {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const run = ease(timeElapsed, startPosition, distance, duration);
    window.scrollTo(0, run);
    if (timeElapsed < duration) requestAnimationFrame(animation);
  }
  
  function ease(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t + b;
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
  }
  
  requestAnimationFrame(animation);
}

// ==================== PURE iOS LIQUID GLASS FADE-IN ANIMATION ====================
// Full copy of iOS fade-in animation - no styles, just animation
(function() {
    'use strict';
    
    // Pure iOS fade-in animation keyframes - exactly like iOS
    const style = document.createElement('style');
    style.textContent = `
        /* iOS Liquid Glass - Fade In Animation (Exact Copy) */
        @keyframes iosFadeIn {
            0% {
                opacity: 0;
                transform: scale(1.12) translateY(-2px);
            }
            30% {
                opacity: 0.9;
                transform: scale(1.02) translateY(5px);
            }
            50% {
                opacity: 1;
                transform: scale(0.98) translateY(-4px);
            }
            70% {
                transform: scale(1.01) translateY(0.8px);
            }
            85% {
                transform: scale(0.995) translateY(-0.5px);
            }
            100% {
                opacity: 1;
                transform: scale(1) translateY(0);
            }
        }

        /* iOS Liquid Glass - Fade Out Animation */
        @keyframes iosFadeOut {
            0% {
                opacity: 1;
                transform: scale(1) translateY(0);
            }
            20% {
                opacity: 0.8;
                transform: scale(1.08) translateY(-6px);
            }
            50% {
                opacity: 0.5;
                transform: scale(0.92) translateY(8px);
            }
            80% {
                opacity: 0.2;
                transform: scale(0.86) translateY(12px);
            }
            100% {
                opacity: 0;
                transform: scale(0.8) translateY(15px);
            }
        }

        /* iOS Items Fade In */
        @keyframes iosItemsFade {
            0% {
                opacity: 0;
                transform: translateY(5px);
            }
            50% {
                opacity: 0.8;
                transform: translateY(-1px);
            }
            100% {
                opacity: 1;
                transform: translateY(0);
            }
        }

        /* iOS Arrow Fade */
        @keyframes iosArrowFade {
            0% {
                opacity: 0;
                transform: scale(0.8) translateY(-5px);
            }
            60% {
                opacity: 1;
                transform: scale(1.1) translateY(2px);
            }
            100% {
                opacity: 1;
                transform: scale(1) translateY(0);
            }
        }

        /* iOS Divider Fade */
        @keyframes iosDividerFade {
            0% {
                opacity: 0;
                transform: scaleX(0.3);
            }
            100% {
                opacity: 1;
                transform: scaleX(1);
            }
        }

        /* Animation Classes - Pure iOS */
        .ios-fade-in {
            animation: iosFadeIn 0.45s cubic-bezier(0.23, 1, 0.32, 1) forwards !important;
            transform-origin: center !important;
            will-change: transform, opacity !important;
            backface-visibility: hidden !important;
            -webkit-font-smoothing: antialiased !important;
        }

        .ios-fade-out {
            animation: iosFadeOut 0.35s cubic-bezier(0.4, 0, 0.2, 1) forwards !important;
            transform-origin: center !important;
            will-change: transform, opacity !important;
            pointer-events: none !important;
            backface-visibility: hidden !important;
        }

        /* Sequential Items */
        .ios-item-fade {
            opacity: 0;
            transform: translateY(5px);
            animation: iosItemsFade 0.2s cubic-bezier(0.23, 1, 0.32, 1) forwards;
            will-change: transform, opacity;
            backface-visibility: hidden;
        }

        .ios-item-fade:nth-child(1) { animation-delay: 0.03s; }
        .ios-item-fade:nth-child(2) { animation-delay: 0.06s; }
        .ios-item-fade:nth-child(3) { animation-delay: 0.09s; }
        .ios-item-fade:nth-child(4) { animation-delay: 0.12s; }
        .ios-item-fade:nth-child(5) { animation-delay: 0.15s; }
        .ios-item-fade:nth-child(6) { animation-delay: 0.18s; }
        .ios-item-fade:nth-child(7) { animation-delay: 0.21s; }
        .ios-item-fade:nth-child(8) { animation-delay: 0.24s; }
        .ios-item-fade:nth-child(9) { animation-delay: 0.27s; }
        .ios-item-fade:nth-child(10) { animation-delay: 0.30s; }

        /* Arrow */
        .ios-arrow-fade {
            opacity: 0;
            animation: iosArrowFade 0.2s cubic-bezier(0.23, 1, 0.32, 1) 0.1s forwards;
            will-change: transform, opacity;
            backface-visibility: hidden;
        }

        /* Divider */
        .ios-divider-fade {
            opacity: 0;
            transform: scaleX(0.3);
            animation: iosDividerFade 0.25s cubic-bezier(0.23, 1, 0.32, 1) 0.05s forwards;
            will-change: transform, opacity;
            backface-visibility: hidden;
        }
    `;
    document.head.appendChild(style);

    // iOS Fade Animation Manager
    class iOSFadeAnimation {
        constructor() {
            this.activePopup = null;
            this.init();
        }

        init() {
            // Observe new popups
            this.observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1 && node.classList?.contains('task-popup')) {
                            this.animateFade(node);
                        }
                    });
                });
            });

            this.observer.observe(document.body, {
                childList: true,
                subtree: true
            });

            // Override showPopup function to fix positioning
            this.overrideShowPopup();
            
            // Override hide function
            this.overrideHide();
        }

        overrideShowPopup() {
            if (window.TaskPopupSystem) {
                const originalShow = TaskPopupSystem.prototype.showPopup;
                
                TaskPopupSystem.prototype.showPopup = function(taskItem, x, y) {
                    // Original showPopup ni chaqirish
                    originalShow.call(this, taskItem, x, y);
                    
                    // Pozitsiyani to'g'rilash - aynan task ustida
                    const popup = this.popup;
                    if (popup && taskItem) {
                        setTimeout(() => {
                            const taskRect = taskItem.getBoundingClientRect();
                            const popupRect = popup.getBoundingClientRect();
                            
                            // Taskning o'rtasini hisoblash
                            const taskCenterX = taskRect.left + (taskRect.width / 2);
                            const taskTop = taskRect.top;
                            
                            // Popupni taskning tepasiga joylashtirish
                            let left = taskCenterX - (popupRect.width / 2);
                            let top = taskTop - popupRect.height - 15;
                            
                            // Agar tepada joy bo'lmasa, pastga qo'yish
                            if (top < 10) {
                                top = taskRect.bottom + 15;
                            }
                            
                            // Chekkalarni tekshirish
                            if (left + popupRect.width > window.innerWidth - 10) {
                                left = window.innerWidth - popupRect.width - 10;
                            }
                            if (left < 10) {
                                left = 10;
                            }
                            
                            // Pozitsiyani qo'llash
                            popup.style.left = `${Math.round(left)}px`;
                            popup.style.top = `${Math.round(top)}px`;
                            
                            // Arrow pozitsiyasini to'g'rilash
                            const arrow = popup.querySelector('.popup-arrow');
                            if (arrow) {
                                const arrowLeft = taskCenterX - left;
                                arrow.style.left = `${Math.max(12, Math.min(arrowLeft - 8, popupRect.width - 28))}px`;
                                
                                // Arrow yo'nalishi (yuqoriga yoki pastga)
                                if (top > taskRect.top) {
                                    arrow.style.top = '-8px';
                                    arrow.style.bottom = 'auto';
                                    arrow.style.borderBottomColor = 'var(--ios-gray-6)';
                                    arrow.style.borderTop = 'none';
                                } else {
                                    arrow.style.top = 'auto';
                                    arrow.style.bottom = '-8px';
                                    arrow.style.borderTopColor = 'var(--ios-gray-6)';
                                    arrow.style.borderBottom = 'none';
                                }
                            }
                        }, 10);
                    }
                };
                
                console.log('📍 Popup positioning fixed - appears exactly on pressed task');
            }
        }

        animateFade(popup) {
            console.log('🍎 iOS Fade Animation applied');
            
            this.activePopup = popup;
            
            // Remove old classes
            popup.classList.remove('ios-fade-in', 'ios-fade-out');
            
            // Force reflow
            void popup.offsetWidth;
            
            // Apply fade in
            popup.classList.add('ios-fade-in');
            
            // Animate items
            const items = popup.querySelectorAll('.popup-menu-item');
            items.forEach(item => {
                item.classList.add('ios-item-fade');
            });
            
            // Animate arrow
            const arrow = popup.querySelector('.popup-arrow');
            if (arrow) {
                arrow.classList.add('ios-arrow-fade');
            }
            
            // Animate divider
            const divider = popup.querySelector('.popup-divider');
            if (divider) {
                divider.classList.add('ios-divider-fade');
            }
            
            // Clean up
            setTimeout(() => {
                popup.classList.remove('ios-fade-in');
            }, 500);

            // Haptic
            if (window.navigator && window.navigator.vibrate) {
                window.navigator.vibrate(5);
            }
        }

        overrideHide() {
            if (window.TaskPopupSystem) {
                const originalHide = TaskPopupSystem.prototype.hidePopup;
                
                TaskPopupSystem.prototype.hidePopup = function() {
                    const popup = this.popup;
                    
                    if (popup && popup.classList) {
                        popup.classList.remove('ios-fade-in');
                        popup.classList.add('ios-fade-out');
                        
                        if (window.navigator?.vibrate) {
                            window.navigator.vibrate(3);
                        }
                        
                        setTimeout(() => {
                            if (originalHide) {
                                originalHide.call(this);
                            } else {
                                if (popup.parentNode) popup.remove();
                                if (this.overlay) this.overlay.classList.remove('active');
                                document.body.style.overflow = '';
                                this.isLongPress = false;
                                this.currentTaskId = null;
                            }
                        }, 320);
                    } else {
                        if (originalHide) originalHide.call(this);
                    }
                };
                
                console.log('🍎 iOS Fade Animation Active');
            }
        }
    }

    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.iOSFadeAnimation = new iOSFadeAnimation();
        });
    } else {
        window.iOSFadeAnimation = new iOSFadeAnimation();
    }

})();


const TelegramBot = require('node-telegram-bot-api');

// Bot tokenni o'zgartir
const token = 'SENING_BOT_TOKEN';
const bot = new TelegramBot(token, { polling: true });

// Oddiy handler
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Salom Shox! Bot ishlayapti 😎');
});

bot.on('message', (msg) => {
  if (!msg.text.startsWith('/')) {
    bot.sendMessage(msg.chat.id, `Siz yozdingiz: ${msg.text}`);
  }
});