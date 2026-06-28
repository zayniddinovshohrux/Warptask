// touch.js
document.addEventListener('DOMContentLoaded', function() {
    const iosStyles = `
        @keyframes swipeCompleteAnim {
            0% { transform: translateX(0) rotate(0); }
            50% { transform: translateX(50px) rotate(3deg); }
            100% { transform: translateX(0) rotate(0); }
        }
        
        @keyframes swipeDeleteAnim {
            0% { transform: translateX(0) rotate(0); }
            50% { transform: translateX(-50px) rotate(-3deg); }
            100% { transform: translateX(0) rotate(0); }
        }
        
        @keyframes confirmDeleteAnim {
            0% { transform: translateX(0) scale(1); opacity: 1; }
            50% { transform: translateX(-100px) scale(0.9); opacity: 0.7; }
            100% { transform: translateX(0) scale(1); opacity: 1; }
        }
        
        @keyframes shakeDelete {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        .task-item.swipe-complete {
            animation: swipeCompleteAnim 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            background: linear-gradient(90deg, rgba(52, 199, 89, 0.15) 0%, rgba(28, 28, 30, 0.7) 100%) !important;
            border-color: rgba(52, 199, 89, 0.3) !important;
        }
        
        .task-item.swipe-delete {
            animation: swipeDeleteAnim 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            background: linear-gradient(90deg, rgba(255, 59, 48, 0.15) 0%, rgba(28, 28, 30, 0.7) 100%) !important;
            border-color: rgba(255, 59, 48, 0.3) !important;
        }
        
        .task-item.confirm-delete {
            animation: shakeDelete 0.5s ease, confirmDeleteAnim 0.3s ease;
            background: linear-gradient(90deg, rgba(255, 59, 48, 0.3) 0%, rgba(28, 28, 30, 0.7) 100%) !important;
        }
        
        .swipe-indicator {
            position: absolute;
            top: 0;
            width: 60px;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            opacity: 0;
            transition: opacity 0.3s ease;
            z-index: 1;
        }
        
        .swipe-indicator-left {
            left: -60px;
            background: linear-gradient(90deg, rgba(52, 199, 89, 0.2), transparent);
            border-radius: 30px 0 0 30px;
        }
        
        .swipe-indicator-right {
            right: -60px;
            background: linear-gradient(90deg, transparent, rgba(255, 59, 48, 0.2));
            border-radius: 0 30px 30px 0;
        }
        
        .task-item.swiping-left .swipe-indicator-left {
            opacity: 1;
            animation: pulseIndicator 1s infinite;
        }
        
        .task-item.swiping-right .swipe-indicator-right {
            opacity: 1;
            animation: pulseIndicator 1s infinite;
        }
        
        @keyframes pulseIndicator {
            0%, 100% { opacity: 0.5; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.1); }
        }
        
        .swipe-feedback {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(28, 28, 30, 0.95);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            padding: 20px 30px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 15px;
            z-index: 10001;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
            animation: modalSlideIn 0.3s ease;
            max-width: 300px;
            width: 90%;
        }
        
        .swipe-feedback-icon {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28px;
            margin-bottom: 10px;
        }
        
        .swipe-feedback-icon.complete {
            background: rgba(52, 199, 89, 0.2);
            color: #34c759;
            border: 2px solid rgba(52, 199, 89, 0.3);
        }
        
        .swipe-feedback-icon.delete {
            background: rgba(255, 59, 48, 0.2);
            color: #ff3b30;
            border: 2px solid rgba(255, 59, 48, 0.3);
        }
        
        .swipe-feedback-title {
            font-size: 20px;
            font-weight: 700;
            color: white;
            text-align: center;
        }
        
        .swipe-feedback-message {
            font-size: 16px;
            color: rgba(255, 255, 255, 0.7);
            text-align: center;
            line-height: 1.4;
        }
        
        .swipe-feedback-actions {
            display: flex;
            gap: 10px;
            width: 100%;
            margin-top: 10px;
        }
        
        .swipe-feedback-btn {
            flex: 1;
            padding: 12px;
            border-radius: 15px;
            border: none;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }
        
        .swipe-feedback-btn.confirm {
            background: #34c759;
            color: white;
        }
        
        .swipe-feedback-btn.cancel {
            background: rgba(255, 255, 255, 0.1);
            color: white;
        }
        
        .swipe-feedback-btn.delete {
            background: #ff3b30;
            color: white;
        }
        
        .swipe-progress-bar {
            position: absolute;
            bottom: 0;
            left: 0;
            height: 3px;
            border-radius: 0 0 30px 30px;
            transition: width 0.1s ease;
        }
        
        .swipe-progress-bar.complete {
            background: #34c759;
        }
        
        .swipe-progress-bar.delete {
            background: #ff3b30;
        }
    `;
    
    // Add styles to document
    const styleSheet = document.createElement('style');
    styleSheet.textContent = iosStyles;
    document.head.appendChild(styleSheet);

    // Initialize touch events for task items
    function initializeTouchEvents() {
        const taskItems = document.querySelectorAll('.task-item:not(.completed)');
        
        taskItems.forEach(taskItem => {
            if (taskItem.getAttribute('data-touch-initialized')) return;
            
            let touchStartX = 0;
            let touchStartY = 0;
            let touchEndX = 0;
            let touchEndY = 0;
            let isSwiping = false;
            let swipeDirection = null;
            let currentX = 0;
            let taskId = taskItem.dataset.taskId;
            
            // Create swipe indicators
            const leftIndicator = document.createElement('div');
            leftIndicator.className = 'swipe-indicator swipe-indicator-left';
            leftIndicator.innerHTML = '<i class="fas fa-check" style="color: #34c759;"></i>';
            
            const rightIndicator = document.createElement('div');
            rightIndicator.className = 'swipe-indicator swipe-indicator-right';
            rightIndicator.innerHTML = '<i class="fas fa-trash" style="color: #ff3b30;"></i>';
            
            taskItem.appendChild(leftIndicator);
            taskItem.appendChild(rightIndicator);
            
            // Create progress bar
            const progressBar = document.createElement('div');
            progressBar.className = 'swipe-progress-bar';
            taskItem.appendChild(progressBar);
            
            // Touch start
            taskItem.addEventListener('touchstart', function(e) {
                const touch = e.touches[0];
                touchStartX = touch.clientX;
                touchStartY = touch.clientY;
                isSwiping = false;
                currentX = 0;
                
                // Remove any previous swipe classes
                taskItem.classList.remove('swiping-left', 'swiping-right', 'swipe-complete', 'swipe-delete');
                progressBar.style.width = '0';
            });
            
            // Touch move
            taskItem.addEventListener('touchmove', function(e) {
                if (!touchStartX) return;
                
                const touch = e.touches[0];
                touchEndX = touch.clientX;
                touchEndY = touch.clientY;
                
                const diffX = touchEndX - touchStartX;
                const diffY = touchEndY - touchStartY;
                
                // Check if this is a horizontal swipe (not vertical scroll)
                if (Math.abs(diffX) > Math.abs(diffY)) {
                    e.preventDefault();
                    isSwiping = true;
                    
                    currentX = diffX;
                    
                    // Calculate swipe percentage
                    const swipePercentage = Math.abs(diffX) / 50; // 50px threshold
                    const maxPercentage = Math.min(swipePercentage, 1);
                    
                    // Move task item slightly
                    taskItem.style.transform = `translateX(${diffX * 0.5}px)`;
                    taskItem.style.transition = 'transform 0.1s ease';
                    
                    // Update progress bar
                    if (diffX > 0) {
                        // Swipe right (delete)
                        swipeDirection = 'right';
                        taskItem.classList.remove('swiping-left');
                        taskItem.classList.add('swiping-right');
                        progressBar.className = 'swipe-progress-bar delete';
                        progressBar.style.width = `${maxPercentage * 100}%`;
                    } else {
                        // Swipe left (complete)
                        swipeDirection = 'left';
                        taskItem.classList.remove('swiping-right');
                        taskItem.classList.add('swiping-left');
                        progressBar.className = 'swipe-progress-bar complete';
                        progressBar.style.width = `${maxPercentage * 100}%`;
                    }
                }
            });
            
            // Touch end
            taskItem.addEventListener('touchend', function(e) {
                if (!isSwiping) return;
                
                const diffX = currentX;
                const absDiffX = Math.abs(diffX);
                
                // Reset transform
                taskItem.style.transform = '';
                taskItem.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                
                // Remove swipe classes
                taskItem.classList.remove('swiping-left', 'swiping-right');
                progressBar.style.width = '0';
                progressBar.style.transition = 'width 0.3s ease';
                
                // Check if swipe threshold is reached
                if (absDiffX >= 50) {
                    if (swipeDirection === 'left') {
                        // Swipe left to complete
                        handleSwipeComplete(taskItem, taskId);
                    } else if (swipeDirection === 'right') {
                        // Swipe right to delete
                        handleSwipeDelete(taskItem, taskId);
                    }
                }
                
                // Reset
                touchStartX = 0;
                touchStartY = 0;
                isSwiping = false;
                swipeDirection = null;
                currentX = 0;
            });
            
            // Mouse events for desktop testing
            let mouseDown = false;
            let mouseStartX = 0;
            
            taskItem.addEventListener('mousedown', function(e) {
                mouseDown = true;
                mouseStartX = e.clientX;
                taskItem.classList.remove('swipe-complete', 'swipe-delete');
                progressBar.style.width = '0';
            });
            
            document.addEventListener('mousemove', function(e) {
                if (!mouseDown || !taskItem.contains(e.target)) return;
                
                const diffX = e.clientX - mouseStartX;
                const absDiffX = Math.abs(diffX);
                
                if (absDiffX > 10) {
                    isSwiping = true;
                    currentX = diffX;
                    
                    const swipePercentage = absDiffX / 50;
                    const maxPercentage = Math.min(swipePercentage, 1);
                    
                    taskItem.style.transform = `translateX(${diffX * 0.5}px)`;
                    
                    if (diffX > 0) {
                        swipeDirection = 'right';
                        taskItem.classList.remove('swiping-left');
                        taskItem.classList.add('swiping-right');
                        progressBar.className = 'swipe-progress-bar delete';
                        progressBar.style.width = `${maxPercentage * 100}%`;
                    } else {
                        swipeDirection = 'left';
                        taskItem.classList.remove('swiping-right');
                        taskItem.classList.add('swiping-left');
                        progressBar.className = 'swipe-progress-bar complete';
                        progressBar.style.width = `${maxPercentage * 100}%`;
                    }
                }
            });
            
            document.addEventListener('mouseup', function(e) {
                if (!mouseDown) return;
                
                const diffX = currentX;
                const absDiffX = Math.abs(diffX);
                
                taskItem.style.transform = '';
                taskItem.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                taskItem.classList.remove('swiping-left', 'swiping-right');
                progressBar.style.width = '0';
                progressBar.style.transition = 'width 0.3s ease';
                
                if (absDiffX >= 50 && isSwiping) {
                    if (swipeDirection === 'left') {
                        handleSwipeComplete(taskItem, taskId);
                    } else if (swipeDirection === 'right') {
                        handleSwipeDelete(taskItem, taskId);
                    }
                }
                
                mouseDown = false;
                mouseStartX = 0;
                isSwiping = false;
                swipeDirection = null;
                currentX = 0;
            });
            
            taskItem.setAttribute('data-touch-initialized', 'true');
        });
    }
    
    // Handle swipe to complete
    function handleSwipeComplete(taskItem, taskId) {
        taskItem.classList.add('swipe-complete');
        
        // Show feedback animation
        setTimeout(() => {
           
            setTimeout(() => {
                feedback.style.animation = 'modalSlideIn 0.3s ease reverse forwards';
                setTimeout(() => {
                    if (feedback.parentNode) {
                        feedback.parentNode.removeChild(feedback);
                    }
                }, 300);
            }, 1500);
        }, 300);
        
        // Trigger actual completion
        setTimeout(() => {
            const checkbox = taskItem.querySelector('.task-checkbox');
            if (checkbox) {
                checkbox.click();
            }
        }, 500);
    }
    
    // Handle swipe to delete
    function handleSwipeDelete(taskItem, taskId) {
        taskItem.classList.add('swipe-delete');
        
        // Show confirmation dialog
        setTimeout(() => {
            showDeleteConfirmation(taskItem, taskId);
        }, 300);
    }
    
    // Show delete confirmation
    function showDeleteConfirmation(taskItem, taskId) {
        const icon = document.createElement('div');
        icon.className = 'swipe-feedback-icon delete';
        icon.innerHTML = '<i class="fas fa-trash"></i>';
        
        const title = document.createElement('div');
        title.className = 'swipe-feedback-title';
        title.textContent = 'Delete Task?';
        
        const message = document.createElement('div');
        message.className = 'swipe-feedback-message';
        message.textContent = 'This action cannot be undone.';
        
        const actions = document.createElement('div');
        actions.className = 'swipe-feedback-actions';
        
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'swipe-feedback-btn cancel';
        cancelBtn.innerHTML = '<i class="fas fa-times"></i> Cancel';
        cancelBtn.onclick = function() {
            taskItem.classList.remove('swipe-delete', 'confirm-delete');
            feedback.style.animation = 'modalSlideIn 0.3s ease reverse forwards';
            setTimeout(() => {
                if (feedback.parentNode) {
                    feedback.parentNode.removeChild(feedback);
                }
            }, 300);
        };
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'swipe-feedback-btn delete';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Delete';
        deleteBtn.onclick = function() {
            taskItem.classList.add('confirm-delete');
            
            // Show deleting animation
            title.textContent = 'Deleting...';
            message.textContent = '';
            actions.style.display = 'none';
            
            // Trigger actual deletion
            setTimeout(() => {
                const deleteButton = taskItem.querySelector('.delete-btn');
                if (deleteButton) {
                    deleteButton.click();
                }
                
                // Close feedback
                setTimeout(() => {
                    feedback.style.animation = 'modalSlideIn 0.3s ease reverse forwards';
                    setTimeout(() => {
                        if (feedback.parentNode) {
                            feedback.parentNode.removeChild(feedback);
                        }
                    }, 300);
                }, 500);
            }, 300);
        };
        
        actions.appendChild(cancelBtn);
        actions.appendChild(deleteBtn);
        
        const feedback = document.createElement('div');
        feedback.className = 'swipe-feedback';
        feedback.appendChild(icon);
        feedback.appendChild(title);
        feedback.appendChild(message);
        feedback.appendChild(actions);
        
        document.body.appendChild(feedback);
        
        // Auto-close after 5 seconds if no action
        const autoClose = setTimeout(() => {
            if (feedback.parentNode) {
                taskItem.classList.remove('swipe-delete');
                feedback.style.animation = 'modalSlideIn 0.3s ease reverse forwards';
                setTimeout(() => {
                    if (feedback.parentNode) {
                        feedback.parentNode.removeChild(feedback);
                    }
                }, 300);
            }
        }, 5000);
        
        // Clear timeout if user interacts
        cancelBtn.addEventListener('click', () => clearTimeout(autoClose));
        deleteBtn.addEventListener('click', () => clearTimeout(autoClose));
    }
    
    // Provide haptic feedback if available
    function provideHapticFeedback(type) {
        if (navigator.vibrate) {
            if (type === 'success') {
                navigator.vibrate([50, 50, 50]);
            } else if (type === 'warning') {
                navigator.vibrate([100, 50, 100]);
            } else if (type === 'error') {
                navigator.vibrate([200, 100, 200]);
            }
        }
    }
    
    // Initialize when DOM is loaded
    initializeTouchEvents();
    
    // Re-initialize when tasks are updated
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                setTimeout(initializeTouchEvents, 100);
            }
        });
    });
    
    // Observe task list for changes
    const taskList = document.getElementById('taskList');
    if (taskList) {
        observer.observe(taskList, { childList: true, subtree: true });
    }
    
    // Also initialize when tasks are filtered or updated
    window.addEventListener('tasksUpdated', function() {
        setTimeout(initializeTouchEvents, 100);
    });
});