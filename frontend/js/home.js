document.addEventListener("DOMContentLoaded", function () {
  const taskInput = document.getElementById("taskInput");
  const addTaskBtn = document.getElementById("addTaskBtn");
  const taskList = document.getElementById("taskList");
  const emptyState = document.getElementById("emptyState");
  const completedCount = document.getElementById("completed-count");
  const pendingCount = document.getElementById("pending-count");
  const categoryTags = document.querySelectorAll(".category-tag");
  const categoryOptions = document.querySelectorAll(".category-option");
  const clearCompletedBtn = document.getElementById("clearCompletedBtn");
  const focusModeBtn = document.getElementById("focusModeBtn");
  const focusOverlay = document.getElementById("focusOverlay");
  const focusTimer = document.getElementById("focusTimer");
  const focusTaskText = document.getElementById("focusTaskText");
  const pauseFocusBtn = document.getElementById("pauseFocusBtn");
  const endFocusBtn = document.getElementById("endFocusBtn");

  const categoryEmojis = {
    work: "💼",
    personal: "🧩",
    sport: "🏋️‍♂️",
    salah: "📿",
    bed: "🛏️",
    food: "🥪",
    shopping: "🛍️",
    break: "🎮",
    wash: "🛁",
    housework: "🏠",
    health: "🫀",
    study: "📚",
    travel: "✈️",
    hobby: "🎨",
  };

  let tasks = loadTasksFromStorage();
  let currentCategory = "all";
  let selectedCategory = "personal";

  // Focus Mode variables
  let isFocusMode = false;
  let focusTimeLeft = 30 * 60;
  let focusInterval = null;
  let isFocusPaused = false;
  let currentFocusTask = null;

  // ==================== UPDATE STATS FUNCTION ====================
  function updateStats() {
    const completedTasks = tasks.filter((task) => task.completed).length;
    const pendingTasks = tasks.length - completedTasks;

    // Smooth counter animation
    animateCounter(completedCount, completedTasks);
    animateCounter(pendingCount, pendingTasks);

    // Update UI based on current category
    const filteredTasks =
      currentCategory === "all"
        ? tasks
        : tasks.filter((task) => task.category === currentCategory);

    const taskList = document.getElementById("taskList");
    const emptyState = document.getElementById("emptyState");

    if (filteredTasks.length === 0) {
      emptyState.style.display = "block";
      taskList.innerHTML = "";
    } else {
      emptyState.style.display = "none";
      renderTaskList(filteredTasks);
    }

    updateClearButton();
  }

  function animateCounter(element, targetValue) {
    const currentValue = parseInt(element.textContent) || 0;
    if (currentValue === targetValue) return;

    const duration = 300;
    const stepTime = 20;
    const steps = duration / stepTime;
    const increment = (targetValue - currentValue) / steps;
    let current = currentValue;

    const timer = setInterval(() => {
      current += increment;
      if (
        (increment > 0 && current >= targetValue) ||
        (increment < 0 && current <= targetValue)
      ) {
        element.textContent = targetValue;
        clearInterval(timer);

        // Add bounce effect
        element.style.transform = "scale(1.2)";
        setTimeout(() => {
          element.style.transform = "scale(1)";
        }, 150);
      } else {
        element.textContent = Math.round(current);
      }
    }, stepTime);
  }

  function renderTaskList(filteredTasks) {
    const taskList = document.getElementById("taskList");

    // Group tasks: pinned first, then by list/category
    const pinnedTasks = filteredTasks.filter((t) => t.pinned && !t.completed);
    const todayTasks = filteredTasks.filter((t) => !t.pinned && !t.completed);
    const completedTasks = filteredTasks.filter((t) => t.completed);

    // Build groups by category for non-pinned, non-completed tasks
    const categoryGroups = {};
    const categoryEmojisMap = {
      work: "💼",
      personal: "🧩",
      sport: "🏋️‍♂️",
      salah: "📿",
      bed: "🛏️",
      food: "🍔",
      shopping: "🛍️",
      break: "🎮",
      wash: "🛁",
      housework: "🏠",
      health: "🫀",
      study: "📚",
      travel: "✈️",
      hobby: "🎨",
    };

    todayTasks.forEach((task) => {
      const cat = task.category || "personal";
      if (!categoryGroups[cat]) categoryGroups[cat] = [];
      categoryGroups[cat].push(task);
    });

    // Always rebuild for grouped view
    taskList.innerHTML = "";

    function appendSection(emoji, label, tasks) {
      if (tasks.length === 0) return;
      const header = document.createElement("div");
      header.className = "task-group-header";
      header.innerHTML = `<span class="task-group-icon">${emoji}</span><span class="task-group-label">${label}</span><span class="task-group-count">${tasks.length}</span>`;
      taskList.appendChild(header);
      tasks.forEach((task) => {
        taskList.appendChild(createTaskElement(task));
      });
    }

    // Pinned section
    if (pinnedTasks.length > 0) {
      appendSection("📌", "Pin", pinnedTasks);
    }

    // Category sections
    Object.keys(categoryGroups).forEach((cat) => {
      const emoji = categoryEmojisMap[cat] || "📋";
      const label = cat.charAt(0).toUpperCase() + cat.slice(1);
      appendSection(emoji, label, categoryGroups[cat]);
    });

    // Completed section
    if (completedTasks.length > 0) {
      appendSection("✅", "Completed", completedTasks);
    }

    // If nothing was rendered, show an empty state
    if (taskList.children.length === 0) {
      const emptyState = document.getElementById("emptyState");
      if (emptyState) emptyState.style.display = "block";
    }
  }

  function createTaskElement(task) {
    const taskItem = document.createElement("div");
    taskItem.className = `task-item ${task.completed ? "completed" : ""}`;
    taskItem.dataset.taskId = task.id;
    taskItem.draggable = true;

    // Progress bar for subtasks
    let progressHtml = "";
    if (task.subtasks && task.subtasks.length > 0) {
      const completedCount = task.subtasks.filter((st) => st.completed).length;
      const progress = (completedCount / task.subtasks.length) * 100;
      progressHtml = `
            <div class="subtask-progress-main">
                <div class="subtask-progress-fill" style="width: ${progress}%"></div>
            </div>
        `;
    }

    // Note indicator
    const noteIndicator =
      task.notes && task.notes.trim() !== ""
        ? '<div class="note-indicator"></div>'
        : "";

    taskItem.innerHTML = `
        <div class="task-drag-handle">
            <i class="fas fa-grip-lines"></i>
        </div>
        <div class="task-checkbox">${task.completed ? "✓ " : ""}</div>
        <div class="task-content">
            <div class="task-text">${categoryEmojis[task.category] || "📝"} ${
              task.text
            }</div>
            ${progressHtml}
        </div>
        <div class="task-actions">
            <button class="task-action-btn edit-btn">
               <i class="fa-solid fa-pen"></i>
            </button>
            <button class="task-action-btn delete-btn">
                <i class="fas fa-trash"></i>
            </button>
        </div>
        ${noteIndicator}
    `;

    // Add event listeners
    const checkbox = taskItem.querySelector(".task-checkbox");
    checkbox.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleTaskCompletion(task.id);
    });

    const editBtn = taskItem.querySelector(".edit-btn");
    editBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      editTask(task.id);
    });

    const deleteBtn = taskItem.querySelector(".delete-btn");
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      deleteTask(task.id, taskItem);
    });

    // Double click for details
    taskItem.addEventListener("dblclick", (e) => {
      e.preventDefault();
      openTaskDetail(task.id);
    });

    // Add drag handle events
    const dragHandle = taskItem.querySelector(".task-drag-handle");
    dragHandle.addEventListener("dragstart", function (e) {
      e.stopPropagation();
    });

    return taskItem;
  }

  function updateTaskElement(element, task) {
    // Update completion state
    if (task.completed) {
      element.classList.add("completed");
      element.querySelector(".task-checkbox").innerHTML = "✓";
      element.querySelector(".task-checkbox").style.background =
        "var(--blue)";
      element.querySelector(".task-checkbox").style.borderColor =
        "var(--blue)";
      element.querySelector(".task-text").style.textDecoration = "line-through";
      element.querySelector(".task-text").style.color = "var(--gray)";
    } else {
      element.classList.remove("completed");
      element.querySelector(".task-checkbox").innerHTML = "";
      element.querySelector(".task-checkbox").style.background = "";
      element.querySelector(".task-checkbox").style.borderColor = "";
      element.querySelector(".task-text").style.textDecoration = "none";
      element.querySelector(".task-text").style.color = "";
    }

    // Update progress
    const progressBar = element.querySelector(".subtask-progress-main");
    if (task.subtasks && task.subtasks.length > 0) {
      const completedCount = task.subtasks.filter((st) => st.completed).length;
      const progress = (completedCount / task.subtasks.length) * 100;

      if (!progressBar) {
        const newProgressBar = document.createElement("div");
        newProgressBar.className = "subtask-progress-main";
        newProgressBar.innerHTML = `<div class="subtask-progress-fill" style="width: ${progress}%"></div>`;
        element.querySelector(".task-content").appendChild(newProgressBar);
      } else {
        progressBar.querySelector(".subtask-progress-fill").style.width =
          `${progress}%`;
      }
    } else if (progressBar) {
      progressBar.remove();
    }

    // Update note indicator
    const noteIndicator = element.querySelector(".note-indicator");
    if (task.notes && task.notes.trim() !== "") {
      if (!noteIndicator) {
        const newIndicator = document.createElement("div");
        newIndicator.className = "note-indicator";
        element.appendChild(newIndicator);
      }
    } else if (noteIndicator) {
      noteIndicator.remove();
    }
  }

  // ==================== UPDATE TASK FUNCTIONS ====================
  function toggleTaskCompletion(taskId) {
    const taskIndex = tasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) return;

    const task = tasks[taskIndex];
    const wasCompleted = task.completed;

    // Update task
    tasks[taskIndex].completed = !wasCompleted;
    if (!wasCompleted) {
      tasks[taskIndex].completedAt = new Date().toISOString();
    }

    // Save and update
    saveTasksToStorage();
    updateStats();

    // Show notification if completed
    if (!wasCompleted) {
      showTaskCompletionNotification(task);
      playCompletionSound();
    }

    provideHapticFeedback();
  }

  function deleteTask(taskId, taskElement) {
    if (!confirm("Are you sure you want to delete this task?")) return;

    // Add remove animation
    taskElement.classList.add("removing");

    setTimeout(() => {
      // Remove from array
      tasks = tasks.filter((task) => task.id !== taskId);

      // Save and update
      saveTasksToStorage();
      updateStats();

      // Show notification
      showCustomNotification(
        "error",
        "Task Deleted",
        "Task removed successfully!",
      );

      provideHapticFeedback();
    }, 300);
  }

  // ==================== INITIALIZATION ====================
  document.addEventListener("DOMContentLoaded", function () {
    // Load tasks
    if (localStorage.getItem('wzToken')) {
        // Agar login bo'lgan bo'lsa, backenddan yangi ma'lumotlarni olishga harakat qiladi
        auth.pullFromCloud().then(() => {
            tasks = loadTasksFromStorage();
            updateStats();
        });
    } else {
        tasks = loadTasksFromStorage();
        updateStats();
    }
    initSmoothDragAndDrop();

    // Initialize other features
    initCategoryFilters();
    initTaskInput();
    initClearButton();
    initFocusMode();
    initTaskDetailModal();
    initSmartSuggestions();

    // Hide preloader
    setTimeout(() => {
      const preloader = document.getElementById("preloader");
      if (preloader) {
        preloader.style.opacity = "0";
        setTimeout(() => {
          preloader.style.display = "none";
        }, 500);
      }
    }, 500);
  });

  // ==================== SUPPORT FUNCTIONS ====================
  function provideHapticFeedback() {
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  }

  function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function loadTasksFromStorage() {
    try {
      const storedTasks = localStorage.getItem("wzTasks");
      if (storedTasks) {
        return JSON.parse(storedTasks);
      }
    } catch (e) {
      console.error("Error loading tasks from storage:", e);
    }
    return [];
  }

  function saveTasksToStorage() {
    try {
      localStorage.setItem("wzTasks", JSON.stringify(tasks));
    } catch (e) {
      console.error("Error saving tasks to storage:", e);
    }
  }

  // ==================== TASK DETAIL MODAL ====================
  let currentDetailTaskId = null;

  function openTaskDetail(taskId) {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    currentDetailTaskId = taskId;

    // Update modal content
    document.getElementById("detailCategoryEmoji").textContent =
      categoryEmojis[task.category] || "📝";
    document.getElementById("detailTaskText").textContent = task.text;
    document.getElementById("detailFullText").textContent = task.text;
    document.getElementById("detailCategoryName").textContent =
      task.category.charAt(0).toUpperCase() + task.category.slice(1);
    document.getElementById("detailTaskTime").textContent =
      task.time || getCurrentTime();

    // Update status badge
    const statusBadge = document.getElementById("detailStatusBadge");
    if (task.completed) {
      statusBadge.innerHTML =
        '<i class="fas fa-check-circle"></i><span data-i18n="completed">Completed</span>';
      statusBadge.style.color = "var(--green)";
    } else {
      statusBadge.innerHTML =
        '<i class="fas fa-clock"></i><span data-i18n="pending">Pending</span>';
      statusBadge.style.color = "var(--orange)";
    }

    // Load subtasks
    loadSubtasks(taskId);

    // Load notes
    document.getElementById("taskNotesInput").value = task.notes || "";

    // Show modal
    taskDetailModal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeTaskDetail() {
    taskDetailModal.classList.remove("active");
    document.body.style.overflow = "";
    currentDetailTaskId = null;
    addSubtaskForm.style.display = "none";
  }

  // Double click handler for tasks
  taskList.addEventListener("dblclick", function (e) {
    const taskItem = e.target.closest(".task-item");
    if (taskItem) {
      const taskId = parseInt(taskItem.dataset.taskId);
      openTaskDetail(taskId);
    }
  });

  // ==================== SUBTASK MANAGEMENT ====================
  function loadSubtasks(taskId) {
    const task = tasks.find((t) => t.id === taskId);
    const subtaskList = document.getElementById("subtaskListDetail");

    if (!task.subtasks) {
      task.subtasks = [];
      saveTasksToStorage();
    }

    subtaskList.innerHTML = "";

    task.subtasks.forEach((subtask, index) => {
      const subtaskItem = document.createElement("div");
      subtaskItem.className = `subtask-item-detail ${
        subtask.completed ? "completed" : ""
      }`;
      subtaskItem.dataset.subtaskId = index;

      subtaskItem.innerHTML = `
            <div class="subtask-checkbox-detail ${
              subtask.completed ? "completed" : ""
            }">
               
            </div>
            <div class="subtask-text-detail">${subtask.text}</div>
            <div class="subtask-actions">
                <button class="subtask-action-btn delete-subtask-btn">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

      // Add click handler for checkbox
      const checkbox = subtaskItem.querySelector(".subtask-checkbox-detail");
      checkbox.addEventListener("click", () => {
        toggleSubtaskCompletion(taskId, index);
      });

      // Add delete handler
      const deleteBtn = subtaskItem.querySelector(".delete-subtask-btn");
      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        deleteSubtask(taskId, index);
      });

      subtaskList.appendChild(subtaskItem);
    });
  }

  function toggleSubtaskCompletion(taskId, subtaskIndex) {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || !task.subtasks) return;

    task.subtasks[subtaskIndex].completed =
      !task.subtasks[subtaskIndex].completed;
    saveTasksToStorage();
    loadSubtasks(taskId);
    updateSubtaskProgress(taskId);
  }

  function addSubtask(taskId, text) {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    if (!task.subtasks) {
      task.subtasks = [];
    }

    task.subtasks.push({
      text: text,
      completed: false,
      createdAt: new Date(),
    });

    saveTasksToStorage();
    loadSubtasks(taskId);
    updateSubtaskProgress(taskId);
  }

  function updateSubtaskProgress(taskId) {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || !task.subtasks || task.subtasks.length === 0) return;

    const completedCount = task.subtasks.filter((st) => st.completed).length;
    const progress = (completedCount / task.subtasks.length) * 100;

    // Update in task list
    const taskElement = document.querySelector(
      `.task-item[data-task-id="${taskId}"]`,
    );
    if (taskElement) {
      let progressBar = taskElement.querySelector(".subtask-progress-main");
      if (!progressBar) {
        progressBar = document.createElement("div");
        progressBar.className = "subtask-progress-main";
        taskElement.querySelector(".task-content").appendChild(progressBar);
      }

      const progressFill = document.createElement("div");
      progressFill.className = "subtask-progress-fill";
      progressFill.style.width = `${progress}%`;
      progressBar.innerHTML = "";
      progressBar.appendChild(progressFill);
    }
  }

  // ==================== NOTES MANAGEMENT ====================
  function saveTaskNotes(taskId, notes) {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    task.notes = notes;
    saveTasksToStorage();

    // Update note indicator
    const taskElement = document.querySelector(
      `.task-item[data-task-id="${taskId}"]`,
    );
    if (taskElement) {
      if (notes && notes.trim() !== "") {
        let noteIndicator = taskElement.querySelector(".note-indicator");
        if (!noteIndicator) {
          noteIndicator = document.createElement("div");
          noteIndicator.className = "note-indicator";
          taskElement.appendChild(noteIndicator);
        }
      } else {
        const noteIndicator = taskElement.querySelector(".note-indicator");
        if (noteIndicator) {
          noteIndicator.remove();
        }
      }
    }
  }

  document
    .getElementById("addSubtaskBtn")
    .addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      const form = document.getElementById("addSubtaskForm");
      const input = document.getElementById("subtaskInputDetail");

      if (form.style.display === "none" || form.style.display === "") {
        form.style.display = "block";
        setTimeout(() => {
          input.focus();
          input.select();
        }, 10);
      } else {
        form.style.display = "none";
      }
    });

  // Subtask input uchun Enter key
  document
    .getElementById("subtaskInputDetail")
    .addEventListener("keypress", function (e) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        document.getElementById("saveSubtaskBtn").click();
      }
    });

  // Save subtask button fix
  document
    .getElementById("saveSubtaskBtn")
    .addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      const input = document.getElementById("subtaskInputDetail");
      const text = input.value.trim();

      if (text && currentDetailTaskId) {
        // Add subtask with animation
        addSubtask(currentDetailTaskId, text);
        input.value = "";

        // Hide form with animation
        const form = document.getElementById("addSubtaskForm");
        form.style.opacity = "0";
        form.style.transform = "translateY(-10px)";

        setTimeout(() => {
          form.style.display = "none";
          form.style.opacity = "1";
          form.style.transform = "translateY(0)";
        }, 300);

        // Show success feedback
        provideHapticFeedback();

        // Show brief success message
        const successMsg = document.createElement("div");
        successMsg.textContent = "Subtask added!";
        successMsg.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--green);
            color: white;
            padding: 10px 20px;
            border-radius: 15px;
            font-weight: 600;
            z-index: 100001;
            animation: fadeInOut 2s ease;
        `;

        document.body.appendChild(successMsg);
        setTimeout(() => successMsg.remove(), 2000);
      }
    });

  // Add this CSS for fade animation
  const subtaskStyles = `
    @keyframes fadeInOut {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
        20% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        100% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
    }
    
    .add-subtask-form {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
`;

  // ==================== COMPLETE CLOSE BUTTON FIX ====================
  function initCloseButton() {
    const closeBtn = document.getElementById("closeDetailBtn");
    const modal = document.getElementById("taskDetailModal");

    // Remove any existing listeners
    closeBtn.replaceWith(closeBtn.cloneNode(true));
    const newCloseBtn = document.getElementById("closeDetailBtn");

    // Add new click listener
    newCloseBtn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      closeTaskDetail();
      return false;
    });

    // Also close on overlay click
    modal.addEventListener("click", function (e) {
      // Click outside content (on backdrop)
      if (
        e.target === this ||
        e.target.classList.contains("task-detail-modal")
      ) {
        closeTaskDetail();
      }
    });

    // Prevent clicks inside content from closing
    modal
      .querySelector(".task-detail-content")
      .addEventListener("click", function (e) {
        e.stopPropagation();
      });
  }

  // Call in initialization
  initCloseButton();

  // Add to stylesheet
  const styleEl = document.createElement("style");
  styleEl.textContent = subtaskStyles;
  document.head.appendChild(styleEl);

  // ==================== TASK STRUCTURE UPDATE ====================
  function addTask() {
    const text = taskInput.value.trim();
    if (text === "") return;

    const newTask = {
      id: Date.now(),
      text: text,
      category: selectedCategory,
      completed: false,
      time: getCurrentTime(),
      createdAt: new Date(),
      subtasks: [],
      notes: "",
      order: tasks.length,
    };

    tasks.unshift(newTask);
    saveTasksToStorage();
    taskInput.value = "";
    updateTasks();
    provideHapticFeedback();
  }

  // ==================== UPDATE toggleTaskCompletion FUNCTION ====================
  // ==================== SMOOTH TASK COMPLETION ====================
  function toggleTaskCompletion(taskId) {
    const taskIndex = tasks.findIndex((task) => task.id === taskId);
    const task = tasks[taskIndex];
    const wasCompleted = task.completed;

    // Taskni topish
    const taskElement = document.querySelector(
      `.task-item[data-task-id="${taskId}"]`,
    );
    if (!taskElement) return;

    // 1. Checkbox animatsiyasi
    const checkbox = taskElement.querySelector(".task-checkbox");
    checkbox.style.animation = "bounceCheck 0.4s ease";

    setTimeout(() => {
      // 2. Faqat o'sha taskni yangilash
      tasks[taskIndex].completed = !wasCompleted;

      // 3. Completion timestamp qo'shish
      if (!wasCompleted && tasks[taskIndex].completed) {
        tasks[taskIndex].completedAt = new Date().toISOString();
      }

      // 4. LocalStorage ga saqlash
      saveTasksToStorage();

      // 5. Faqat o'sha taskni UI da yangilash
      if (tasks[taskIndex].completed) {
        taskElement.classList.add("completed");
        checkbox.innerHTML = "✓";
        checkbox.style.background = "var(--blue)";
        checkbox.style.borderColor = "var(--blue)";

        // Task text uchun animatsiya
        const taskText = taskElement.querySelector(".task-text");
        taskText.style.transition = "color 0.3s, text-decoration 0.3s";
        taskText.style.textDecoration = "line-through";
        taskText.style.color = "var(--gray)";

        // Show completion notification
        showTaskCompletionNotification(task);

        // Play sound
        playCompletionSound();
      } else {
        taskElement.classList.remove("completed");
        checkbox.innerHTML = "";
        checkbox.style.background = "";
        checkbox.style.borderColor = "";

        const taskText = taskElement.querySelector(".task-text");
        taskText.style.textDecoration = "none";
        taskText.style.color = "";
      }

      // 6. Faqat stats yangilash (butun list emas)
      updateStatsOnly();

      // 7. Clear button yangilash
      updateClearButton();

      // 8. Detail modal ochiq bo'lsa, uni yangilash
      if (currentDetailTaskId === taskId) {
        const statusBadge = document.getElementById("detailStatusBadge");
        if (tasks[taskIndex].completed) {
          statusBadge.innerHTML =
            '<i class="fas fa-check-circle"></i><span data-i18n="completed">Completed</span>';
          statusBadge.style.color = "var(--green)";
        } else {
          statusBadge.innerHTML =
            '<i class="fas fa-clock"></i><span data-i18n="pending">Pending</span>';
          statusBadge.style.color = "var(--orange)";
        }
      }

      // 9. Checkbox animatsiyasini to'xtatish
      setTimeout(() => {
        checkbox.style.animation = "";
      }, 400);
    }, 200); // Animatsiya tugagach

    provideHapticFeedback();
  }

  // ==================== UPDATE STATS ONLY ====================
  function updateStatsOnly() {
    const completedTasks = tasks.filter((task) => task.completed).length;
    const pendingTasks = tasks.length - completedTasks;

    // Smooth counter animation
    animateCounter(completedCount, completedTasks);
    animateCounter(pendingCount, pendingTasks);
  }

  // ==================== SMOOTH COUNTER ANIMATION ====================
  function animateCounter(element, targetValue) {
    const currentValue = parseInt(element.textContent) || 0;
    const duration = 300;
    const stepTime = 20;
    const steps = duration / stepTime;
    const increment = (targetValue - currentValue) / steps;
    let current = currentValue;

    const timer = setInterval(() => {
      current += increment;
      if (
        (increment > 0 && current >= targetValue) ||
        (increment < 0 && current <= targetValue)
      ) {
        element.textContent = targetValue;
        clearInterval(timer);

        // Add subtle animation
        element.style.transform = "scale(1.1)";
        setTimeout(() => {
          element.style.transform = "scale(1)";
        }, 150);
      } else {
        element.textContent = Math.round(current);
      }
    }, stepTime);
  }

  // ==================== CREATE SINGLE TASK ELEMENT ====================
  function createTaskElement(task) {
    const taskItem = document.createElement("div");
    taskItem.className = `task-item ${task.completed ? "completed" : ""}`;
    taskItem.dataset.taskId = task.id;
    taskItem.draggable = true;

    let progressHtml = "";
    if (task.subtasks && task.subtasks.length > 0) {
      const completedCount = task.subtasks.filter((st) => st.completed).length;
      const progress = (completedCount / task.subtasks.length) * 100;
      progressHtml = `<div class="subtask-progress-main"><div class="subtask-progress-fill" style="width: ${progress}%"></div></div>`;
    }

    taskItem.innerHTML = `
        <div class="task-checkbox">${task.completed ? "✓" : ""}</div>
        <div class="task-content">
            <div class="task-text">${categoryEmojis[task.category]} ${
              task.text
            }</div>
            ${progressHtml}
        </div>
        <div class="task-actions">
            <button class="task-action-btn edit-btn">
                <i class="fa-solid fa-pen"></i>
            </button>
            <button class="task-action-btn delete-btn">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;

    if (task.notes && task.notes.trim() !== "") {
      const noteIndicator = document.createElement("div");
      noteIndicator.className = "note-indicator";
      taskItem.appendChild(noteIndicator);
    }

    // Add event listeners
    const checkbox = taskItem.querySelector(".task-checkbox");
    checkbox.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleTaskCompletion(task.id);
    });

    const editBtn = taskItem.querySelector(".edit-btn");
    editBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();
      editTask(task.id);
    });

    const deleteBtn = taskItem.querySelector(".delete-btn");
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();
      deleteTask(task.id, taskItem);
    });

    // Double click for details
    taskItem.addEventListener("dblclick", (e) => {
      e.preventDefault();
      openTaskDetail(task.id);
    });

    // Single click for selection (drag & drop uchun)
    taskItem.addEventListener("click", (e) => {
      if (!e.target.closest(".task-actions")) {
        // Selection uchun
      }
    });

    return taskItem;
  }

  // ==================== CSS GA YANGI ANIMATION QO'SHING ====================
  const taskCompletionStyles = `

    
   
    .task-text {
        transition: color 0.3s ease, text-decoration 0.3s ease;
    }
    
`;

  // Add to head
  const completionStyle = document.createElement("style");
  completionStyle.textContent = taskCompletionStyles;
  document.head.appendChild(completionStyle);

  const slideOutStyle = `
        @keyframes slideOut {
            from {
                opacity: 1;
                transform: translateX(0);
            }
            to {
                opacity: 0;
                transform: translateX(100%);
            }
        }
      `;

  const slideOutEl = document.createElement("style");
  slideOutEl.textContent = slideOutStyle;
  document.head.appendChild(slideOutEl);

  function showCustomNotification(type, title, message, icon = null) {
    const container = document.getElementById("notificationContainer");

    // Remove existing notifications if too many
    const existingNotifications = container.querySelectorAll(
      ".task-completion-notification",
    );
    if (existingNotifications.length > 3) {
      existingNotifications[0].remove();
    }

    const notification = document.createElement("div");
    notification.className = `task-completion-notification ${type}-notification`;

    // Random messages for different types
    let randomTitle = title;
    let randomEmoji = "";

    if (type === "success") {
      // Success uchun faqat umumiy success messages
      const successTitles = [
        "Great job! 🎉",
        "Well done! 👏",
        "You're on fire! 🔥",
        "Amazing work! 🌟",
        "Keep it up! 💪",
        "Excellent! 🏆",
        "Perfect! 💯",
        "Bravo! 👌",
      ];
      const successEmojis = ["🎯", "✅", "🏆", "⭐", "👑", "💯", "✨", "🔥"];
      randomTitle =
        successTitles[Math.floor(Math.random() * successTitles.length)];
      randomEmoji =
        successEmojis[Math.floor(Math.random() * successEmojis.length)];
    } else if (type === "error") {
      const errorTitles = [
        "Oops! ❌",
        "Task removed 🗑️",
        "Action failed! ⚠️",
        "Couldn't complete! 🚫",
        "Error occurred! ⛔",
        "Try again! 🔄",
        "Not successful! 😞",
        "Failed! 💢",
       
      ];
      const errorEmojis = ["❌", "🚫", "⛔", "😔", "😞", "🙁", "⏸️", "💢"];
      randomTitle = errorTitles[Math.floor(Math.random() * errorTitles.length)];
      randomEmoji = errorEmojis[Math.floor(Math.random() * errorEmojis.length)];
    } else if (type === "info") {
      const infoTitles = [
        "Info",
        "Notification 📢",
        "Message 📨",
        "Update 🔔",
        "Alert 🚨",
        "Notice 📌",
        "Hint 💡",
        "Tip 🎯",
      ];
      const infoEmojis = ["ℹ️", "📝", "✏️", "🔄", "📌", "📍", "📋", "🗒️"];
      randomTitle = infoTitles[Math.floor(Math.random() * infoTitles.length)];
      randomEmoji = infoEmojis[Math.floor(Math.random() * infoEmojis.length)];
    } else {
      const defaultTitles = [
        "Notification 🔔",
        "Message 📩",
        "Alert ⚠️",
        "Update 📅",
        "Action completed 📊",
        "Status changed 🔄",
        "Processed ✅",
        "Done",
      ];
      const defaultEmojis = ["🔔", "📱", "💬", "📲", "📊", "📈", "📉", "📌"];
      randomTitle =
        defaultTitles[Math.floor(Math.random() * defaultTitles.length)];
      randomEmoji =
        defaultEmojis[Math.floor(Math.random() * defaultEmojis.length)];
    }

    const iconToUse =
      icon ||
      (type === "success"
        ? "fas fa-check-circle"
        : type === "error"
          ? "fas fa-times-circle"
          : type === "info"
            ? "fas fa-info-circle"
            : "fas fa-bell");

    notification.innerHTML = `
        <div class="notification-emoji">
            <i class="${iconToUse}"></i>
        </div>
        <div class="notification-content">
            <div class="notification-title">${randomTitle}</div>
            <div class="notification-message">${message}</div>
            <div class="notification-meta">
                <span data-i18n="now">Now</span>
            </div>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;

    container.appendChild(notification);

    // Auto remove after 4 seconds
    const autoRemoveTimer = setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = "fadeOutNotif 0.5s forwards";
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 500);
      }
    }, 4000);

    // Close button
    notification
      .querySelector(".notification-close")
      .addEventListener("click", () => {
        clearTimeout(autoRemoveTimer);
        notification.style.animation = "fadeOutNotif 0.5s forwards";
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 500);
      });
  }

  // Qo'shimcha: Har xil actionlar uchun helper functions
  function notifyTaskComplete(taskTitle = "") {
    showCustomNotification(
      "success",
      "",
      taskTitle ? `"${taskTitle}" completed` : "Task completed",
      "fas fa-check-circle",
    );
  }

  function notifyTaskDelete(taskTitle = "") {
    showCustomNotification(
      "info",
      "Task Removed",
      taskTitle ? `"${taskTitle}" deleted` : "Task deleted",
      "fas fa-trash-alt",
    );
  }

  function notifyTaskUpdate(taskTitle = "") {
    showCustomNotification(
      "info",
      "Updated",
      taskTitle ? `"${taskTitle}" updated` : "Task updated",
      "fas fa-edit",
    );
  }

  function notifyClearCompleted() {
    showCustomNotification(
      "info",
      "Cleaned Up 🧹",
      "All completed tasks removed",
      "fas fa-broom",
    );
  }

  function notifyWarpMode(taskTitle = "") {
    showCustomNotification(
      "info",
      "Warp Mode ⚡",
      taskTitle || "Focus time started",
      "fas fa-bolt",
    );
  }

  function notifyFocusTime() {
    showCustomNotification(
      "info",
      "Focus Time 🧠",
      "Time to concentrate",
      "fas fa-clock",
    );
  }

  // Agar error bo'lsa
  function notifyError(message = "Something went wrong") {
    showCustomNotification("error", "", message, "fas fa-exclamation-circle");
  }

  // 1. Fix category selection buttons
  categoryOptions.forEach((option) => {
    option.addEventListener("click", () => {
      categoryOptions.forEach((o) => o.classList.remove("active"));
      option.classList.add("active");
      selectedCategory = option.getAttribute("data-category");

      // Show visual feedback
      provideHapticFeedback();
    });
  });

  // 2. Fix category filter buttons
  categoryTags.forEach((tag) => {
    tag.addEventListener("click", () => {
      categoryTags.forEach((t) => t.classList.remove("active"));
      tag.classList.add("active");
      currentCategory = tag.getAttribute("data-category");
      updateTasks();

      // Show visual feedback
      provideHapticFeedback();
    });
  });

  // 3. Fix clear completed button
  clearCompletedBtn.addEventListener("click", function (e) {
    e.preventDefault();
    clearCompletedTasks();
  });

  // 4. Fix add task button
  addTaskBtn.addEventListener("click", function (e) {
    e.preventDefault();
    addTask();
  });

  // 5. Fix task input enter key
  taskInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTask();
    }
  });

  // 6. Fix subtask input enter key
  subtaskInputDetail.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveSubtaskBtn.click();
    }
  });

  // 7. Fix notes save on enter (but allow new lines with Ctrl+Enter)
  document
    .getElementById("taskNotesInput")
    .addEventListener("keydown", function (e) {
      if (e.key === "Enter" && e.ctrlKey) {
        e.preventDefault();
        saveNotesBtn.click();
      }
    });

  // ==================== INITIALIZATION ====================
  // updateTasks(); o'rniga:
  updateTasks();

  // Preloader
  window.addEventListener("load", function () {
    setTimeout(function () {
      const preloader = document.getElementById("preloader");
      preloader.style.opacity = "0";
      setTimeout(function () {
        preloader.style.display = "none";
      }, 500);
    }, 130);
  });

  // Smart suggestions
  const smartSuggestions = {
    morning: [
      {
        text: "Shower & get ready",
        category: "personal",
        emoji: "🚿",
        priority: "medium",
      },
      {
        text: "Plan your day ahead",
        category: "personal",
        emoji: "📝",
        priority: "high",
      },
      {
        text: "Drink water(2 glasses)",
        category: "health",
        emoji: "💧",
        priority: "medium",
      },
      {
        text: "Healthy breakfast",
        category: "food",
        emoji: "🍎",
        priority: "medium",
      },
      {
        text: "Exercise (30 min)",
        category: "sport",
        emoji: "🏋️‍♂️",
        priority: "high",
      },
    ],
    work: [
      {
        text: "Check emails",
        category: "work",
        emoji: "📧",
        priority: "medium",
      },
      {
        text: "Update task list",
        category: "work",
        emoji: "📋",
        priority: "high",
      },
      {
        text: "Deep work session",
        category: "work",
        emoji: "👨‍💻",
        priority: "high",
      },
      {
        text: "Lunch break",
        category: "food",
        emoji: "🥗",
        priority: "high",
      },
      {
        text: "Team meeting",
        category: "work",
        emoji: "🤝",
        priority: "urgent",
      },
      {
        text: "Break (10 min)",
        category: "health",
        emoji: "☕",
        priority: "low",
      },
    ],
    evening: [
      {
        text: "Review completed tasks",
        category: "personal",
        emoji: "📊",
        priority: "medium",
      },
      {
        text: "Plan tomorrow",
        category: "personal",
        emoji: "📅",
        priority: "high",
      },
      {
        text: "Read book",
        category: "study",
        emoji: "📖",
        priority: "low",
      },
      {
        text: "Call family/friends",
        category: "personal",
        emoji: "📞",
        priority: "medium",
      },
      {
        text: "Digital detox",
        category: "personal",
        emoji: "📵",
        priority: "medium",
      },
      {
        text: "Prepare for sleep",
        category: "bed",
        emoji: "😴",
        priority: "high",
      },
    ],
    health: [
      {
        text: "Take vitamins",
        category: "health",
        emoji: "💊",
        priority: "high",
      },
      {
        text: "Go for a walk",
        category: "sport",
        emoji: "🚶",
        priority: "medium",
      },
      {
        text: "Stretching exercises",
        category: "sport",
        emoji: "🤸",
        priority: "low",
      },
      {
        text: "Healthy lunch",
        category: "food",
        emoji: "🥗",
        priority: "high",
      },
      {
        text: "Gym session",
        category: "sport",
        emoji: "🏋️",
        priority: "medium",
      },
    ],
    weekend: [
      {
        text: "Weekly cleaning",
        category: "personal",
        emoji: "🧹",
        priority: "medium",
      },
      {
        text: "Grocery shopping",
        category: "shopping",
        emoji: "🛒",
        priority: "high",
      },
      {
        text: "Family time",
        category: "personal",
        emoji: "👨‍👩‍👧‍👦",
        priority: "urgent",
      },
      {
        text: "Hobby project",
        category: "hobby",
        emoji: "🎨",
        priority: "low",
      },
      {
        text: "Self-care time",
        category: "health",
        emoji: "🧖",
        priority: "medium",
      },

      {
        text: "Watch movie/series",
        category: "hobby",
        emoji: "🎬",
        priority: "low",
      },
      {
        text: "Meet friends",
        category: "social",
        emoji: "👥",
        priority: "medium",
      },
      {
        text: "Learn something new",
        category: "study",
        emoji: "📚",
        priority: "medium",
      },
      {
        text: "Outdoor activity",
        category: "sport",
        emoji: "🏞️",
        priority: "high",
      },
    ],
    habits: [
      {
        text: "Wake up early",
        category: "personal",
        emoji: "🌅",
        priority: "high",
      },
      {
        text: "No phone before bed",
        category: "health",
        emoji: "🔋",
        priority: "high",
      },
      {
        text: "Gratitude journal",
        category: "personal",
        emoji: "📔",
        priority: "medium",
      },
      {
        text: "Track expenses",
        category: "finance",
        emoji: "💰",
        priority: "medium",
      },
      {
        text: "Save money",
        category: "finance",
        emoji: "🏦",
        priority: "high",
      },
    ],
  };

  // Time-based suggestion categories
  function getTimeBasedSuggestions() {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) return "morning";
    if (hour >= 12 && hour < 17) return "work";
    if (hour >= 17 && hour < 22) return "evening";
    return "evening";
  }

  // Show suggestions when input is clicked
  taskInput.addEventListener("focus", showSmartSuggestions);
  taskInput.addEventListener("click", showSmartSuggestions);

  function showSmartSuggestions() {
    const suggestionsContainer = document.getElementById("smartSuggestions");
    const suggestionsList = document.getElementById("suggestionsList");

    // Hide if already visible
    if (suggestionsContainer.style.display === "block") {
      suggestionsContainer.style.display = "none";
      return;
    }

    // Get time-based suggestions
    const category = getTimeBasedSuggestions();
    const suggestions = smartSuggestions[category];

    // Also get personal suggestions based on user habits
    const personalSuggestions = getPersonalizedSuggestions();

    // Combine suggestions
    const allSuggestions = [...suggestions, ...personalSuggestions].slice(0, 8);

    // Display suggestions
    suggestionsList.innerHTML = allSuggestions
      .map(
        (suggestion) => `
    <div class="suggestion-item" data-text="${suggestion.text}" 
         data-category="${suggestion.category}" 
         data-priority="${suggestion.priority}">
      <div class="suggestion-emoji">${suggestion.emoji}</div>
      <div class="suggestion-text">${suggestion.text}</div>
     
    </div>
  `,
      )
      .join("");

    suggestionsContainer.style.display = "block";

    // Add click event to suggestion items
    document.querySelectorAll(".suggestion-item").forEach((item) => {
      item.addEventListener("click", function (e) {
        if (!e.target.classList.contains("suggestion-add")) {
          const text = this.dataset.text;
          taskInput.value = text;
          suggestionsContainer.style.display = "none";
          taskInput.focus();
        }
      });
    });
  }

  function addSuggestionTask(text, category, priority) {
    taskInput.value = text;

    // Set category
    const categoryOption = document.querySelector(
      `.category-option[data-category="${category}"]`,
    );
    if (categoryOption) {
      categoryOptions.forEach((o) => o.classList.remove("active"));
      categoryOption.classList.add("active");
      selectedCategory = category;
    }

    // Set priority
    const priorityOption = document.querySelector(
      `.priority-option[data-priority="${priority}"]`,
    );
    if (priorityOption) {
      priorityOptions.forEach((o) => o.classList.remove("active"));
      priorityOption.classList.add("active");
      selectedPriority = priority;
    }

    // Hide suggestions
    document.getElementById("smartSuggestions").style.display = "none";

    // Focus and auto-add
    setTimeout(() => {
      taskInput.focus();
      taskInput.setSelectionRange(text.length, text.length);
    }, 100);
  }

  // Personalized suggestions based on user habits
  function getPersonalizedSuggestions() {
    const userHabits = analyzeUserHabits();
    const suggestions = [];

    // Suggest missed habits
    if (userHabits.mostActiveHour !== new Date().getHours()) {
      suggestions.push({
        text: `Work during your peak hour (${userHabits.mostActiveHour}:00)`,
        category: "work",
        emoji: "⏰",
        priority: "medium",
      });
    }

    // Suggest based on most used category
    if (userHabits.mostUsedCategory) {
      suggestions.push({
        text: `Add ${userHabits.mostUsedCategory} task`,
        category: userHabits.mostUsedCategory,
        emoji: categoryEmojis[userHabits.mostUsedCategory] || "📝",
        priority: "medium",
      });
    }

    // Remind about overdue tasks
    const overdueTasks = tasks.filter(
      (t) => !t.completed && t.dueDate && new Date(t.dueDate) < new Date(),
    );
    if (overdueTasks.length > 0) {
      suggestions.push({
        text: `Complete overdue task: ${overdueTasks[0].text.substring(
          0,
          30,
        )}...`,
        category: overdueTasks[0].category,
        emoji: "⚠️",
        priority: "urgent",
      });
    }

    return suggestions;
  }

  function analyzeUserHabits() {
    const completedTasks = tasks.filter((t) => t.completed);

    // Find most active hour
    const hourCounts = {};
    completedTasks.forEach((task) => {
      const hour = new Date(task.completedAt || task.createdAt).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    let mostActiveHour = 10; // Default
    let maxCount = 0;
    Object.keys(hourCounts).forEach((hour) => {
      if (hourCounts[hour] > maxCount) {
        maxCount = hourCounts[hour];
        mostActiveHour = parseInt(hour);
      }
    });

    // Find most used category
    const categoryCounts = {};
    tasks.forEach((task) => {
      categoryCounts[task.category] = (categoryCounts[task.category] || 0) + 1;
    });

    let mostUsedCategory = "personal";
    let maxCatCount = 0;
    Object.keys(categoryCounts).forEach((cat) => {
      if (categoryCounts[cat] > maxCatCount) {
        maxCatCount = categoryCounts[cat];
        mostUsedCategory = cat;
      }
    });

    return {
      mostActiveHour,
      mostUsedCategory,
      totalCompleted: completedTasks.length,
      completionRate:
        tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0,
    };
  }

  // Close suggestions when clicking outside
  document.addEventListener("click", function (e) {
    const suggestions = document.getElementById("smartSuggestions");
    const input = document.getElementById("taskInput");

    if (suggestions && suggestions.style.display === "block") {
      if (!suggestions.contains(e.target) && e.target !== input) {
        suggestions.style.display = "none";
      }
    }
  });

  // Close button
  document
    .querySelector(".close-suggestions")
    .addEventListener("click", function () {
      document.getElementById("smartSuggestions").style.display = "none";
    });

  // ==================== FIXED FOCUS MODE ====================
  document
    .getElementById("focusModeBtn")
    .addEventListener("click", function (e) {
      e.preventDefault();
      startFocusMode();
    });

  function startFocusMode() {
    const pendingTasks = tasks.filter((task) => !task.completed);

    if (pendingTasks.length === 0) {
      showCustomNotification(
        "info",
        "No Tasks",
        "Add some tasks to use focus mode",
      );
      return;
    }

    // Create task selection modal for focus mode
    const focusTaskModal = document.createElement("div");
    focusTaskModal.className = "focus-task-selection-modal";
    focusTaskModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.30);
        backdrop-filter: blur(7px);
        -webkit-backdrop-filter: blur(7px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 99999;
        padding: 20px;
    `;

    let tasksHTML = pendingTasks
      .map(
        (task, index) => `
        <div class="focus-task-option" data-task-id="${task.id}" 
             style="background: rgba(28, 28, 30, 0.10);
                    border-radius: 30px;
                    padding: 17px;
                    margin: 10px 0;
                    cursor: pointer;
                    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12),
    0 1px 2px rgba(255, 0, 0, 0.04),
    inset 0 0.2px 0 rgba(255, 255, 255, 0.325);
                    transition: all 0.3s;
                    border: 1px solid rgba(255, 255, 255, 0.1);">
            <div style="display: flex; align-items: center; gap: 15px;">
                <div style="font-size: 28px;">${
                  categoryEmojis[task.category] || "📝"
                }</div>
                <div style="flex: 1;">
                    <div style="font-size: 18px; font-weight: 600; margin-bottom: 5px;">${
                      task.text
                    }</div>
                    <div style="font-size: 14px; color: #8e8e93;">${
                      task.category
                    } • ${task.time || getCurrentTime()}</div>
                </div>
                <div style="color: var(--blue); font-size: 20px;">${
                  index + 1
                }</div>
            </div>
        </div>
    `,
      )
      .join("");

    focusTaskModal.innerHTML = `
        <div style="
         background: linear-gradient(to top, #18181ab3, #24242468);
            backdrop-filter: blur(7px);
            -webkit-backdrop-filter: blur(7px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12),
    0 1px 2px rgba(255, 0, 0, 0.04),
    inset 0 0.2px 0 rgba(255, 255, 255, 0.325);
           
            
                    border-radius: 28px;
                    padding: 25px;
                    max-width: 380px;
                    width: 100%;
                    max-height: 80vh;
                    overflow-y: auto;">
            <div style="text-align: center; margin-bottom: 25px;">
                <div data-i18n="selectFocusTask" style="font-size: 24px; font-weight: 700; margin-bottom: 10px;" >Select Task for Focus</div>
                
            </div>
            
            <div id="focusTaskOptions" style="margin-bottom: 20px; ">
                ${tasksHTML}
            </div>
            
            <button data-i18n="cancel" id="cancelFocusBtn" 
                    style="background: var(--red);
                           color: white;
                           position:sticky;
                          bottom: 0;
                           border: none;
                           padding: 15px;
                           border-radius: 20px;
                           width: 100%;
                           font-size: 18px;
                           cursor: pointer;
                           transition: all 0.3s;">
                Cancel
            </button>
        </div>
    `;

    document.body.appendChild(focusTaskModal);

    // Add hover effects
    const taskOptions = focusTaskModal.querySelectorAll(".focus-task-option");
    taskOptions.forEach((option) => {
      option.addEventListener("mouseenter", () => {
        option.style.borderColor = "var(--ios-blue)";
      });
      option.addEventListener("mouseleave", () => {
        option.style.transform = "translateY(0)";
        option.style.background = "rgba(28, 28, 30, 0.8)";
        option.style.borderColor = "rgba(255, 255, 255, 0.1)";
      });

      option.addEventListener("click", function () {
        const taskId = parseInt(this.dataset.taskId);
        const selectedTask = tasks.find((t) => t.id === taskId);

        if (selectedTask) {
          focusTaskModal.remove();
          startFocusTimer(selectedTask);
        }
      });
    });

    // Cancel button
    focusTaskModal
      .querySelector("#cancelFocusBtn")
      .addEventListener("click", function () {
        focusTaskModal.remove();
      });

    // ESC to close
    focusTaskModal.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        focusTaskModal.remove();
      }
    });

    // Click outside to close
    focusTaskModal.addEventListener("click", function (e) {
      if (e.target === this) {
        focusTaskModal.remove();
      }
    });
  }

  function startFocusTimer(task) {
    currentFocusTask = task;
    focusTimeLeft = 25 * 60; // Reset to 25 minutes
    isFocusPaused = false;
    let overtimeMode = false; // ✅ YANGI: Overtime mode flag
    let overtimeSeconds = 0; // ✅ YANGI: Qo'shimcha sekundlar

    // Create focus mode overlay
    const focusOverlay = document.createElement("div");
    focusOverlay.id = "focusOverlay";
    focusOverlay.className = "focus-overlay";
    focusOverlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: #000000;
    z-index: 99999;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    animation: warpIn 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  `;

    focusOverlay.innerHTML = `
    <style>
        @keyframes warpIn {
            from { opacity: 0; transform: scale(1.1); }
            to { opacity: 1; transform: scale(1); }
        }
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        @keyframes overtimePulse {
            0% { color: #ff3b30; }
            50% { color: #ff9500; }
            100% { color: #ff3b30; }
        }
        .focus-timer {
            font-size: 82px;
            font-weight: 700;
            color: white;
            margin-bottom: 30px;
            text-align: center;
            font-family: 'Inter', sans-serif;
        }
        .overtime-mode .focus-timer {
            animation: overtimePulse 1s infinite;
            color: #ff3b30;
        }
        .focus-task-display {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            padding: 20px;
            margin-bottom: 40px;
            max-width: 350px;
            width: 90%;
            text-align: center;
        }
        .focus-task-text {
            font-size: 20px;
            color: white;
            font-weight: 600;
        }
        .focus-category {
            color: var(--blue);
            font-size: 16px;
            margin-top: 5px;
        }
        .focus-controls {
            display: flex;
            gap: 15px;
            position: fixed;
            bottom: 40px;
        }
        .focus-control-btn {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12),
            inset 0 0.2px 0 rgba(255, 255, 255, 0.325);
            0 1px 2px rgba(255, 0, 0, 0.04),
            color: white;
            padding: 9px 3px;
            border-radius: 15px;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.3s;
            display: flex;
            align-items: center;
            gap: 10px;
            text-align: center;
            min-width: 55px;
            justify-content: center;
        }
        .overtime-indicator {
            position: absolute;
            top: 40px;
            background: rgba(255, 59, 48, 0.2);
            color: #ff3b30;
            padding: 6px 15px;
            border-radius: 15px;
            font-size: 14px;
            font-weight: 600;
            border: 1px solid rgba(255, 59, 48, 0.3);
            animation: fadeInOut 2s infinite;
        }
        @keyframes fadeInOut {
            0%, 100% { opacity: 0.7; }
            50% { opacity: 1; }
        }
       
        .focus-control-btn.primary {
            border: solid 2px var(--blue);
            color: var(--blue); 
        }
        .focus-control-btn.danger {
            background: var(--red);
            border-color: var(--red);
        }
    </style>
    
    <div class="focus-timer" id="focusTimerDisplay">25:00</div>
    
    <div class="focus-task-display">
        <div class="focus-task-text">${
          categoryEmojis[task.category] || "📝"
        } ${task.text}</div>
        <div class="focus-category">Focusing on ${task.category}</div>
    </div>
    
    <div class="focus-controls">
        <button class="focus-control-btn" id="pauseFocusBtn">
            <i class="fas fa-pause"></i>
        </button>
        <button class="focus-control-btn primary" id="endFocusBtn">
            <i class="fas fa-check"></i>
        </button>
        <button class="focus-control-btn danger" id="cancelFocusBtn">
            <i class="fas fa-times"></i>
        </button>
    </div>
  `;

    document.body.appendChild(focusOverlay);
    document.body.style.overflow = "hidden";

    // ✅ YANGI: Overtime indicator element
    const overtimeIndicator = document.createElement("div");
    overtimeIndicator.className = "overtime-indicator";
    overtimeIndicator.innerHTML = '<i class="fas fa-clock"></i> OVERTIME';
    overtimeIndicator.style.display = "none";
    focusOverlay.appendChild(overtimeIndicator);

    // Timer update function
    function updateFocusTimerDisplay() {
      const timerDisplay = document.getElementById("focusTimerDisplay");

      if (!overtimeMode) {
        // Normal timer mode
        const minutes = Math.floor(focusTimeLeft / 60);
        const seconds = focusTimeLeft % 60;

        timerDisplay.textContent = `${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

        // Change color when time is low
        if (focusTimeLeft < 300) {
          // 5 minutes
          timerDisplay.style.color = "var(--ios-orange)";
        }
        if (focusTimeLeft < 60) {
          // 1 minute
          timerDisplay.style.color = "var(--ios-red)";
          timerDisplay.style.animation = "pulse 0.5s infinite";
        } else {
          timerDisplay.style.animation = "";
        }

        // Switch to overtime mode when time reaches zero
        if (focusTimeLeft <= 0) {
          overtimeMode = true;
          overtimeIndicator.style.display = "block";
          focusOverlay.classList.add("overtime-mode");
          timerDisplay.style.animation = "overtimePulse 1s infinite";

          // Show notification
          const notification = document.createElement("div");
          notification.innerHTML = `
          <div style="position: fixed; top: 100px; left: 50%; transform: translateX(-50%); 
                     background: rgba(255, 59, 48, 0.9); color: white; padding: 10px 20px; 
                     border-radius: 15px; font-weight: 600; z-index: 100000;">
            ⏰ Focus time ended! Continuing in overtime mode...
          </div>
        `;
          document.body.appendChild(notification);
          setTimeout(() => notification.remove(), 3000);
        }
      } else {
        // Overtime mode (stopwatch)
        overtimeSeconds++;
        const overtimeMinutes = Math.floor(overtimeSeconds / 60);
        const overtimeSecs = overtimeSeconds % 60;

        // Format: -00:01, -00:02, etc
        timerDisplay.textContent = `-${overtimeMinutes
          .toString()
          .padStart(2, "0")}:${overtimeSecs.toString().padStart(2, "0")}`;

        // Update overtime indicator text
        overtimeIndicator.innerHTML = `<i class="fas fa-clock"></i> OVERTIME: +${overtimeMinutes}m`;
      }
    }

    // Start timer
    updateFocusTimerDisplay();
    focusTimerInterval = setInterval(() => {
      if (!isFocusPaused) {
        if (!overtimeMode) {
          focusTimeLeft--;
        }
        updateFocusTimerDisplay();
      }
    }, 1000);

    // Control buttons
    focusOverlay
      .querySelector("#pauseFocusBtn")
      .addEventListener("click", function () {
        isFocusPaused = !isFocusPaused;
        if (isFocusPaused) {
          this.innerHTML = '<i class="fas fa-play"></i>';
          this.style.background = "var(--green)";
          this.style.borderColor = "var(--green)";
        } else {
          this.innerHTML = '<i class="fas fa-pause"></i>';
          this.style.background = "";
          this.style.borderColor = "";
        }
      });

    focusOverlay
      .querySelector("#endFocusBtn")
      .addEventListener("click", function () {
        let message = "Mark this task as completed?";

        if (overtimeMode) {
          const overtimeMinutes = Math.floor(overtimeSeconds / 60);
          message += `\n\n⏱️ You worked ${overtimeMinutes} minute(s) overtime!`;
        }

        if (confirm(message)) {
          completeFocusSession(overtimeMode, overtimeSeconds);
        }
      });

    focusOverlay
      .querySelector("#cancelFocusBtn")
      .addEventListener("click", function () {
        if (confirm("Cancel focus session?")) {
          endFocusSession(false);
        }
      });

    // ESC to cancel
    document.addEventListener("keydown", handleFocusKeydown);
  }

  function updateFocusTimerDisplay() {
    const minutes = Math.floor(focusTimeLeft / 60);
    const seconds = focusTimeLeft % 60;
    const timerDisplay = document.getElementById("focusTimerDisplay");
    if (timerDisplay) {
      timerDisplay.textContent = `${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

      // Change color when time is low
      if (focusTimeLeft < 300) {
        // 5 minutes
        timerDisplay.style.color = "var(--orange)";
      }
      if (focusTimeLeft < 60) {
        // 1 minute
        timerDisplay.style.color = "var(--red)";
        timerDisplay.style.animation = "pulse 0.5s infinite";
      }
    }
  }

  function completeFocusSession(overtime = false, overtimeSeconds = 0) {
    clearInterval(focusTimerInterval);

    // Mark task as completed
    if (currentFocusTask) {
      const taskIndex = tasks.findIndex((t) => t.id === currentFocusTask.id);
      if (taskIndex !== -1) {
        tasks[taskIndex].completed = true;
        tasks[taskIndex].completedAt = new Date().toISOString();

        // ✅ YANGI: Overtime ma'lumotini saqlash
        if (overtime && overtimeSeconds > 0) {
          tasks[taskIndex].overtime = overtimeSeconds;
        }

        saveTasksToStorage();
        updateTasks();

        // Show celebration with overtime info
        let notificationMessage = `🎉 "${currentFocusTask.text}" completed!`;

        if (overtime && overtimeSeconds > 0) {
          const overtimeMinutes = Math.floor(overtimeSeconds / 60);
          notificationMessage += `\n⏱️ +${overtimeMinutes} minute(s) overtime!`;
        }

        showCustomNotification(
          "success",
          "Focus Complete!",
          notificationMessage,
          "fas fa-trophy",
        );

        // Big confetti
        for (let i = 0; i < 100; i++) {
          setTimeout(() => createConfettiEffect(), i * 50);
        }
      }
    }

    endFocusSession(true);
  }

  function endFocusSession(wasCompleted, overtimeSeconds = 0) {
    clearInterval(focusTimerInterval);
    const focusOverlay = document.getElementById("focusOverlay");
    if (focusOverlay) {
      focusOverlay.style.animation =
        "warpIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) reverse forwards";
      setTimeout(() => {
        focusOverlay.remove();
        document.body.style.overflow = "";
      }, 500);
    }

    // Remove event listener
    document.removeEventListener("keydown", handleFocusKeydown);

    if (!wasCompleted) {
      let message = "Focus Session Ended";
      if (overtimeSeconds > 0) {
        const overtimeMinutes = Math.floor(overtimeSeconds / 60);
        message += ` (${overtimeMinutes}m overtime)`;
      }

      showCustomNotification(
        "info",
        message,
        "Task not marked as completed",
        "fas fa-clock",
      );
    }
  }

  function handleFocusKeydown(e) {
    if (e.key === "Escape") {
      if (confirm("Cancel focus session?")) {
        endFocusSession(false);
      }
    }
    if (e.key === " " || e.key === "Spacebar") {
      e.preventDefault();
      const pauseBtn = document.querySelector("#pauseFocusBtn");
      if (pauseBtn) pauseBtn.click();
    }
  }

  // ==================== ADD THESE STYLES TO CSS ====================
  const focusStyles = `
            .focus-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: #0c0c0c8a;
                z-index: 99999;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                animation: warpIn 0.5s cubic-bezier(0.4, 0, 0.2, 1);
            }

            @keyframes warpIn {
                from { opacity: 0; transform: scale(1.1); }
                to { opacity: 1; transform: scale(1); }
            }

            .focus-task-selection-modal .focus-task-option:hover {
                transform: translateY(-2px);
                background: rgba(28, 28, 30, 0.95) !important;
                border-color: var(--ios-blue) !important;
            }
        `;

  // Add styles to document
  const styleSheet = document.createElement("style");
  styleSheet.textContent = focusStyles;
  document.head.appendChild(styleSheet);

  // ==================== MAIN FUNCTIONS ====================

  // ==================== EDIT TASK FUNCTIONS ====================
  let currentEditingTaskId = null;

  function editTask(taskId) {
    console.log("Edit task bosildi:", taskId);

    const task = tasks.find((t) => t.id === taskId);
    if (!task) {
      console.error("Tahrirlash uchun task topilmadi");
      return;
    }

    currentEditingTaskId = taskId;
    createEditModal(task);
  }

  function createEditModal(task) {
    const modalOverlay = document.createElement("div");
    modalOverlay.id = "editModalOverlay";
    modalOverlay.className = "edit-modal-overlay";

    modalOverlay.innerHTML = `
        <div class="edit-modal-content">
            <div class="edit-modal-header">
                <div class="edit-header-left">
                    <div class="edit-icon">
                        <i class="fas fa-pen"></i>
                    </div>
                    <div class="edit-title">
                        <h3>Task edit</h3>
                        <p class="edit-category-info">${categoryEmojis[task.category]} ${task.category.charAt(0).toUpperCase() + task.category.slice(1)}</p>
                    </div>
                </div>
                <button id="closeEditModal" class="edit-close-btn"><i class="fa-solid fa-right-from-bracket"></i></button>
            </div>
            
            <div class="edit-input-section">
                <label class="edit-label">Task name</label>
                <textarea id="editTaskText" class="edit-textarea">${task.text}</textarea>
            </div>
            
            <div class="edit-category-section">
                <label class="edit-label">Category</label>
                <div id="editCategoryList" class="edit-category-grid">
                    ${generateCategoryOptions(task.category)}
                </div>
            </div>
            
            <div class="edit-actions">
                <button id="saveEditBtn" class="edit-save-btn">
                    <i class="fas fa-save"></i>
                    Save
                </button>
                <button id="cancelEditBtn" class="edit-cancel-btn">
                    <i class="fas fa-times"></i>
                    Cancel
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modalOverlay);
    document.body.style.overflow = "hidden";

    setTimeout(() => {
      const textarea = modalOverlay.querySelector("#editTaskText");
      if (textarea) {
        textarea.focus();
        textarea.select();
      }
    }, 100);

    setupEditModalEvents(modalOverlay, task);
  }

  function generateCategoryOptions(currentCategory) {
    const categories = [
      { id: "personal", name: "Personal", emoji: "🧩" },
      { id: "work", name: "Work", emoji: "💼" },
      { id: "food", name: "Food", emoji: "🥪" },
      { id: "sport", name: "Sport", emoji: "🏋️‍♂️" },
      { id: "salah", name: "Salah", emoji: "📿" },
      { id: "bed", name: "Bed", emoji: "🛏️" },
      { id: "housework", name: "Housework", emoji: "🏠" },
      { id: "shopping", name: "Shopping", emoji: "🛍️" },
      { id: "break", name: "Break", emoji: "🎮" },
      { id: "wash", name: "Wash", emoji: "🛁" },
      { id: "health", name: "Health", emoji: "🫀" },
      { id: "study", name: "Study", emoji: "📚" },
      { id: "urgent", name: "Urgent", emoji: "⏰" },
      { id: "hobby", name: "Hobby", emoji: "🎨" },
    ];

    return categories
      .map(
        (cat) => `
        <button class="edit-category-btn ${currentCategory === cat.id ? "active" : ""}" 
                data-category="${cat.id}">
            <span class="edit-category-emoji">${cat.emoji}</span>
            <span class="edit-category-name">${cat.name}</span>
        </button>
    `,
      )
      .join("");
  }

  function setupEditModalEvents(modal, task) {
    const textarea = modal.querySelector("#editTaskText");
    const categoryBtns = modal.querySelectorAll(".edit-category-btn");
    const saveBtn = modal.querySelector("#saveEditBtn");
    const cancelBtn = modal.querySelector("#cancelEditBtn");
    const closeBtn = modal.querySelector("#closeEditModal");

    let selectedCategory = task.category;

    textarea.addEventListener("focus", () => {
      textarea.classList.add("focused");
    });

    textarea.addEventListener("blur", () => {
      textarea.classList.remove("focused");
    });

    categoryBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        categoryBtns.forEach((b) => {
          b.classList.remove("active");
        });

        btn.classList.add("active");
        selectedCategory = btn.dataset.category;
      });
    });

    function saveEdit() {
      const newText = textarea.value.trim();
      if (!newText) {
        showEditNotification("Please enter a task description", "error");
        textarea.focus();
        return;
      }

      const taskIndex = tasks.findIndex((t) => t.id === currentEditingTaskId);
      if (taskIndex === -1) {
        closeEditModal(modal);
        return;
      }

      tasks[taskIndex].text = newText;
      tasks[taskIndex].category = selectedCategory;
      localStorage.setItem("wzTasks", JSON.stringify(tasks));
      updateTaskInUI(currentEditingTaskId, newText, selectedCategory);
      showEditNotification("Task updated successfully!", "success");

      setTimeout(() => {
        closeEditModal(modal);
      }, 1000);
    }

    saveBtn.addEventListener("click", saveEdit);

    textarea.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        saveEdit();
      }
    });

    function closeEditModal(modalElement) {
      modalElement.classList.add("closing");
      setTimeout(() => {
        if (modalElement.parentNode) {
          modalElement.parentNode.removeChild(modalElement);
        }
        document.body.style.overflow = "";
        currentEditingTaskId = null;
      }, 300);
    }

    cancelBtn.addEventListener("click", () => closeEditModal(modal));
    closeBtn.addEventListener("click", () => closeEditModal(modal));

    modal.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeEditModal(modal);
    });

    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeEditModal(modal);
    });
  }

  function updateTaskInUI(taskId, newText, newCategory) {
    const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
    if (!taskElement) return;

    const taskTextElement = taskElement.querySelector(".task-text");
    if (taskTextElement) {
      taskTextElement.textContent = `${categoryEmojis[newCategory]} ${newText}`;
      taskTextElement.classList.add("updating");

      setTimeout(() => {
        taskTextElement.classList.remove("updating");
      }, 300);
    }
  }

  function showEditNotification(message, type = "success") {
    const existingNotif = document.querySelector(".edit-notification");
    if (existingNotif) existingNotif.remove();

    const notification = document.createElement("div");
    notification.className = `edit-notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === "success" ? "fa-check-circle" : "fa-exclamation-circle"}"></i>
        <span>${message}</span>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add("hiding");
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 400);
    }, 3000);
  }

  // CSS ni qo'shish
  const editStyleE2 = document.createElement("style");
  editStyleE2.textContent = editModalCSS;
  document.head.appendChild(editStyleE2);

  function showEditNotification(message, type = "success") {
    // Remove existing notifications
    const existingNotif = document.querySelector(".edit-notification");
    if (existingNotif) existingNotif.remove();

    const notification = document.createElement("div");
    notification.className = `edit-notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 30px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === "success" ? "var(--green)" : "var(--red)"};
        color: white;
        padding: 12px 24px;
        border-radius: 15px;
        font-weight: 600;
        z-index: 10001;
        animation: editNotifSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 200px;
        text-align: center;
    `;

    notification.innerHTML = `
        <i class="fas ${type === "success" ? "fa-check-circle" : "fa-exclamation-circle"}"></i>
        <span>${message}</span>
    `;

    document.body.appendChild(notification);

    // Auto remove
    setTimeout(() => {
      notification.style.animation = "editNotifSlideOut 0.4s ease";
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 400);
    }, 3000);
  }

  // ==================== EDIT MODAL CSS ====================
  const editModalCSS = `
          @keyframes editModalFadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
          }

          @keyframes editModalFadeOut {
              from { opacity: 1; }
              to { opacity: 0; }
          }

          @keyframes editModalSlideUp {
              from { 
                  opacity: 0;
                  transform: translateY(60px) scale(0.95);
              }
              to { 
                  opacity: 1;
                  transform: translateY(0) scale(1);
              }
          }

          @keyframes editNotifSlideIn {
              from {
                  opacity: 0;
                  transform: translate(-50%, -20px);
              }
              to {
                  opacity: 1;
                  transform: translate(-50%, 0);
              }
          }

          @keyframes editNotifSlideOut {
              from {
                  opacity: 1;
                  transform: translate(-50%, 0);
              }
              to {
                  opacity: 0;
                  transform: translate(-50%, -20px);
              }
          }

          .edit-category-btn:hover:not(.active) {
              background: rgba(58, 58, 60, 0.9) !important;
              border-color: rgba(255,255,255,0.2) !important;
              transform: translateY(-2px) !important;
          }

          .edit-category-btn.active {
              box-shadow: 0 8px 20px rgba(10, 132, 255, 0.25) !important;
          }

          #editTaskText:focus {
              border-color: var(--ios-blue) !important;
              background: rgba(44, 44, 46, 0.95) !important;
              box-shadow: 0 0 0 4px rgba(10, 132, 255, 0.15) !important;
          }

          #closeEditModal:hover {
              background: rgba(255,255,255,0.2) !important;
              color: white !important;
          }

          /* Scrollbar for category list */
          #editCategoryList::-webkit-scrollbar {
              width: 4px;
          }

          #editCategoryList::-webkit-scrollbar-track {
              background: rgba(0,0,0,0.1);
              border-radius: 10px;
          }

          #editCategoryList::-webkit-scrollbar-thumb {
              background: rgba(255,255,255,0.2);
              border-radius: 10px;
          }

          #editCategoryList::-webkit-scrollbar-thumb:hover {
              background: rgba(255,255,255,0.3);
          }
          `;

  // CSS ni qo'shish
  const editStyleEl = document.createElement("style");
  editStyleEl.textContent = editModalCSS;
  document.head.appendChild(editStyleEl);

  function updateTasks() {
    saveTasksToStorage();

    const filteredTasks =
      currentCategory === "all"
        ? tasks
        : tasks.filter((task) => task.category === currentCategory);

    const completedTasks = tasks.filter((task) => task.completed).length;
    const pendingTasks = tasks.length - completedTasks;

    completedCount.textContent = completedTasks;
    pendingCount.textContent = pendingTasks;

    if (filteredTasks.length === 0) {
      emptyState.style.display = "block";
    } else {
      emptyState.style.display = "none";
    }

    taskList.innerHTML = "";

    filteredTasks.forEach((task, index) => {
      const taskItem = document.createElement("div");
      taskItem.className = `task-item ${task.completed ? "completed" : ""}`;
      taskItem.dataset.taskId = task.id;
      taskItem.draggable = true; // Drag & Drop uchun
      taskItem.innerHTML = `
                <div class="task-checkbox"></div>
                <div class="task-content">
                    <div class="task-text">${categoryEmojis[task.category]} ${
                      task.text
                    }</div>
                 
                </div>
                <div class="task-actions">
                    <button class="task-action-btn edit-btn" >
                        <i class="fas fa-pen"></i>
                    </button>
                    <button class="task-action-btn delete-btn">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;

      const checkbox = taskItem.querySelector(".task-checkbox");
      checkbox.addEventListener("click", () => {
        toggleTaskCompletion(task.id);
      });

      const editBtn = taskItem.querySelector(".edit-btn");
      editBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        editTask(task.id);
      });

      const deleteBtn = taskItem.querySelector(".delete-btn");
      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        deleteTask(task.id, taskItem);
      });

      taskList.appendChild(taskItem);
    });

    updateClearButton();
  }

  function addTask() {
    const text = taskInput.value.trim();
    if (text === "") return;

    const newTask = {
      id: Date.now(),
      text: text,
      category: selectedCategory,
      completed: false,
      time: getCurrentTime(),
      createdAt: new Date(),
    };

    tasks.unshift(newTask);
    saveTasksToStorage();
    taskInput.value = "";
    updateTasks();

    provideHapticFeedback();
  }

  function toggleTaskCompletion(taskId) {
    const taskIndex = tasks.findIndex((task) => task.id === taskId);
    const wasCompleted = tasks[taskIndex].completed;

    tasks = tasks.map((task) => {
      if (task.id === taskId) {
        return { ...task, completed: !task.completed };
      }
      return task;
    });

    saveTasksToStorage();
    updateTasks();
    provideHapticFeedback();

    if (!wasCompleted) {
      const completedTask = tasks.find((task) => task.id === taskId);
      showCustomNotification(
        "success",
        "Task Completed!",
        `${categoryEmojis[completedTask.category]} ${completedTask.text}`,
      );
    }
  }

  function deleteTask(taskId, taskElement) {
    {
      taskElement.classList.add("removing");

      setTimeout(() => {
        tasks = tasks.filter((task) => task.id !== taskId);
        saveTasksToStorage();
        updateTasks();
        provideHapticFeedback();
        showCustomNotification(
          "error",
          "Task Deleted",
          "Task removed successfully!",
        );
      }, 500);
    }
  }

  function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function provideHapticFeedback() {
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  }

  function updateClearButton() {
    const completedTasks = tasks.filter((task) => task.completed).length;
    clearCompletedBtn.disabled = completedTasks === 0;
  }

  function clearCompletedTasks() {
    const completedTasks = tasks.filter((task) => task.completed);

    if (completedTasks.length === 0) {
      alert("No completed tasks to clear!");
      return;
    }

    {
      const completedTaskElements = document.querySelectorAll(
        ".task-item.completed",
      );
      completedTaskElements.forEach((element) => {
        element.classList.add("removing");
      });

      setTimeout(() => {
        tasks = tasks.filter((task) => !task.completed);
        saveTasksToStorage();
        updateTasks();
        provideHapticFeedback();
        showCustomNotification(
          "success",
          "Tasks Cleared",
          `${completedTasks.length} tasks removed!`,
        );
      }, 500);
    }
  }

  // Notification function

  // Event listeners
  addTaskBtn.addEventListener("click", addTask);
  taskInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      addTask();
    }
  });

  categoryTags.forEach((tag) => {
    tag.addEventListener("click", () => {
      categoryTags.forEach((t) => t.classList.remove("active"));
      tag.classList.add("active");
      currentCategory = tag.getAttribute("data-category");
      updateTasks();
    });
  });

  categoryOptions.forEach((option) => {
    option.addEventListener("click", () => {
      categoryOptions.forEach((o) => o.classList.remove("active"));
      option.classList.add("active");
      selectedCategory = option.getAttribute("data-category");
    });
  });

  clearCompletedBtn.addEventListener("click", clearCompletedTasks);

  // Initialize
  updateTasks();
  initDragAndDrop();
});

// Offline support

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => console.log("Service Worker registered:", reg.scope))
      .catch((err) => console.log("Service Worker registration failed:", err));
  });
}

// In index.html script section, add this:

// Auth state check for Create Account button
function checkAuthState() {
  const createAccountBtn = document.getElementById("createAccountBtn");
  const isLoggedIn = localStorage.getItem("wzIsLoggedIn") === "true";

  if (createAccountBtn) {
    if (isLoggedIn) {
      // User is logged in, hide Create Account button
      createAccountBtn.style.display = "none";

      // Add logout option in settings
      setupLogoutOption();
    } else {
      // User not logged in, show Create Account button
      createAccountBtn.style.display = "flex";
      createAccountBtn.onclick = () => {
        window.location.href = "login.html";
      };
    }
  }
}

// Add logout option to settings menu
function setupLogoutOption() {
  // This would add a logout option to your settings menu
  // Implementation depends on your settings structure
}

// Check auth on page load
document.addEventListener("DOMContentLoaded", function () {
  checkAuthState();

  // If logged in, redirect from auth pages
  const isLoggedIn = localStorage.getItem("wzIsLoggedIn") === "true";
  if (
    isLoggedIn &&
    (window.location.pathname.includes("login.html") ||
      window.location.pathname.includes("signup.html"))
  ) {
    window.location.href = "index.html";
  }
});

// ==================== INITIALIZE TESTS ====================
document.addEventListener("DOMContentLoaded", function () {
  // ... existing code ...

  // Welcome notification (faqat birinchi marta)
  showEnhancedWelcomeNotification();

  // Foydalanuvchi ismini headerda yangilash
  updateHeaderWithUserName();

  // Test panelni qo'shish (faqat localhost da)
  setTimeout(() => {
    addTestButtons();
  }, 2000);

  // ... existing code ...
});

// User avatar va name uchun bitta toza funksiya
document.addEventListener("DOMContentLoaded", function () {
  try {
    updateHomeAvatar();
  } catch (e) {
    console.log("Avatar yuklanmadi", e);
  }
});

function goToSettings() {
  window.location.href = "settings.html";
}

(function () {
  "use strict";

  class TaskPopupSystem {
    constructor() {
      this.popup = null;
      this.overlay = null;
      this.currentTaskId = null;
      this.currentTaskElement = null;
      this.longPressTimer = null;
      this.pressStartTime = 0;
      this.pressStartX = 0;
      this.pressStartY = 0;
      this.isLongPress = false;
      this.isDragging = false;
      this.longPressDuration = 500;
      this.abortController = null;
      this.dragTimeouts = new Map();
      this.categoryEmojis = {
        work: "💼",
        personal: "🧩",
        sport: "🏋️‍♂️",
        salah: "📿",
        bed: "🛏️",
        food: "🥪",
        shopping: "🛍️",
        break: "🎮",
        wash: "🛁",
        housework: "🏠",
        health: "🫀",
        study: "📚",
        hobby: "🎨",
      };

      this.init();
    }

    init() {
      this.abortController = new AbortController();
      this.createOverlay();
      this.initEventDelegation();
      this.initDragAndDrop();
      this.observeNewTasks();
      this.loadExistingStates(); // Flag va pinlarni yuklash
      this.loadExistingLists();
      this.observeTaskCompletion();
      window.addEventListener("beforeunload", () => {
        this.cleanup();
      });
    }

    cleanup() {
      if (this.abortController) {
        this.abortController.abort();
      }
      if (this.longPressTimer) {
        clearTimeout(this.longPressTimer);
        this.longPressTimer = null;
      }
      this.dragTimeouts.forEach((timeout) => {
        clearTimeout(timeout);
      });
      this.dragTimeouts.clear();
    }

    createOverlay() {
      if (document.querySelector(".task-popup-overlay")) return;

      this.overlay = document.createElement("div");
      this.overlay.className = "task-popup-overlay";
      this.overlay.id = "taskPopupOverlay";
      this.overlay.addEventListener(
        "click",
        (e) => {
          if (e.target === this.overlay) {
            this.hidePopup();
          }
        },
        { signal: this.abortController?.signal },
      );

      document.body.appendChild(this.overlay);
    }

    // ============ EVENT DELEGATION ============
    initEventDelegation() {
      const taskList = document.getElementById("taskList");
      if (!taskList) return;

      const signal = this.abortController?.signal;

      taskList.addEventListener(
        "mousedown",
        (e) => {
          const item = e.target.closest(".task-item");
          if (
            item &&
            !e.target.closest(".task-checkbox") &&
            !e.target.closest(".task-actions") &&
            !e.target.closest(".task-drag-handle") &&
            !e.target.closest(".task-flag-icon") &&
            !e.target.closest(".task-pin-icon")
          ) {
            this.onMouseDown(e, item);
          }
        },
        { signal },
      );

      taskList.addEventListener(
        "mouseup",
        (e) => {
          const item = e.target.closest(".task-item");
          if (item) this.onMouseUp(e, item);
        },
        { signal },
      );

      taskList.addEventListener(
        "mouseleave",
        (e) => {
          const item = e.target.closest(".task-item");
          if (item) this.onMouseLeave(e, item);
        },
        { signal },
      );

      taskList.addEventListener(
        "touchstart",
        (e) => {
          const item = e.target.closest(".task-item");
          if (
            item &&
            !e.target.closest(".task-checkbox") &&
            !e.target.closest(".task-actions") &&
            !e.target.closest(".task-drag-handle") &&
            !e.target.closest(".task-flag-icon") &&
            !e.target.closest(".task-pin-icon")
          ) {
            this.onTouchStart(e, item);
          }
        },
        { passive: true, signal },
      );

      taskList.addEventListener(
        "touchmove",
        (e) => {
          const item = e.target.closest(".task-item");
          if (item) this.onTouchMove(e, item);
        },
        { passive: true, signal },
      );

      taskList.addEventListener(
        "touchend",
        (e) => {
          const item = e.target.closest(".task-item");
          if (item) this.onTouchEnd(e, item);
        },
        { signal },
      );

      taskList.addEventListener(
        "touchcancel",
        (e) => {
          const item = e.target.closest(".task-item");
          if (item) this.onTouchCancel(e, item);
        },
        { signal },
      );

      document.addEventListener(
        "mousemove",
        this.onGlobalMouseMove.bind(this),
        { signal },
      );
      document.addEventListener("mouseup", this.onGlobalMouseUp.bind(this), {
        signal,
      });
    }

    // ============ MOUSE EVENTS ============
    onMouseDown(e, item) {
      if (e.button !== 0) return;

      this.pressStartTime = Date.now();
      this.pressStartX = e.clientX;
      this.pressStartY = e.clientY;
      this.isLongPress = false;
      this.isDragging = false;
      this.currentTaskElement = item;
      this.currentTaskId = parseInt(item.dataset.taskId);

      this.longPressTimer = setTimeout(() => {
        if (!this.isDragging && !this.isLongPress && this.currentTaskElement) {
          this.isLongPress = true;
          this.showPopup(item, e.clientX, e.clientY);
          if (navigator.vibrate) navigator.vibrate(20);
        }
      }, this.longPressDuration);
    }

    onMouseUp(e, item) {
      this.cancelLongPress();
    }

    onMouseLeave(e, item) {
      this.cancelLongPress();
    }

    onGlobalMouseMove(e) {
      if (!this.pressStartX || !this.pressStartY) return;

      const moveX = Math.abs(e.clientX - this.pressStartX);
      const moveY = Math.abs(e.clientY - this.pressStartY);

      if (moveX > 10 || moveY > 10) {
        this.isDragging = true;
        this.cancelLongPress();
      }
    }

    onGlobalMouseUp() {
      this.cancelLongPress();
    }

    // ============ TOUCH EVENTS ============
    onTouchStart(e, item) {
      const touch = e.touches[0];
      this.pressStartTime = Date.now();
      this.pressStartX = touch.clientX;
      this.pressStartY = touch.clientY;
      this.isLongPress = false;
      this.isDragging = false;
      this.currentTaskElement = item;
      this.currentTaskId = parseInt(item.dataset.taskId);

      this.longPressTimer = setTimeout(() => {
        if (!this.isDragging && !this.isLongPress && this.currentTaskElement) {
          this.isLongPress = true;
          this.showPopup(item, touch.clientX, touch.clientY);
          if (navigator.vibrate) navigator.vibrate(20);
        }
      }, this.longPressDuration);
    }

    onTouchMove(e, item) {
      if (!this.pressStartX || !this.pressStartY) return;

      const touch = e.touches[0];
      const moveX = Math.abs(touch.clientX - this.pressStartX);
      const moveY = Math.abs(touch.clientY - this.pressStartY);

      if (moveX > 15 || moveY > 15) {
        this.isDragging = true;
        this.cancelLongPress();
      }
    }

    onTouchEnd(e, item) {
      this.cancelLongPress();
    }

    onTouchCancel(e, item) {
      this.cancelLongPress();
    }

    cancelLongPress() {
      if (this.longPressTimer) {
        clearTimeout(this.longPressTimer);
        this.longPressTimer = null;
      }
      this.pressStartX = 0;
      this.pressStartY = 0;
    }

    // ============ POPUP FUNCTIONS ============
    showPopup(taskItem, x, y) {
      this.hidePopup();

      const taskId = parseInt(taskItem.dataset.taskId);
      const task = this.getTaskById(taskId);

      if (!task) return;

      this.currentTaskId = taskId;
      this.currentTaskElement = taskItem;

      this.popup = this.createPopup(task, taskItem);
      document.body.appendChild(this.popup);
      this.overlay.classList.add("active");
      document.body.style.overflow = "hidden";

      setTimeout(() => {
        this.positionPopup(this.popup, x, y);
      }, 10);
    }

    positionPopup(popup, x, y) {
      const popupRect = popup.getBoundingClientRect();
      const arrow = popup.querySelector(".popup-arrow");

      let left = x - popupRect.width / 2;
      let top = y - popupRect.height - 20;

      if (top < 20) {
        top = y + 30;
      }

      if (left + popupRect.width > window.innerWidth - 20) {
        left = window.innerWidth - popupRect.width - 20;
      }

      if (left < 20) {
        left = 20;
      }

      if (top + popupRect.height > window.innerHeight - 20) {
        top = window.innerHeight - popupRect.height - 20;
      }

      popup.style.left = `${Math.round(left)}px`;
      popup.style.top = `${Math.round(top)}px`;

      if (arrow) {
        const arrowLeft = x - left;
        const maxArrowLeft = popupRect.width - 28;
        const minArrowLeft = 12;

        arrow.style.left = `${Math.max(minArrowLeft, Math.min(arrowLeft - 8, maxArrowLeft))}px`;

        if (top > y) {
          arrow.style.top = "-8px";
          arrow.style.borderBottomColor = "var(--gray-6)";
          arrow.style.borderTop = "none";
        } else {
          arrow.style.top = "auto";
          arrow.style.bottom = "-8px";
          arrow.style.borderTopColor = "var(--gray-6)";
          arrow.style.borderBottom = "none";
        }
      }
    }

    hidePopup() {
      if (this.popup) {
        this.popup.remove();
        this.popup = null;
      }
      if (this.overlay) {
        this.overlay.classList.remove("active");
      }
      document.body.style.overflow = "";
      this.isLongPress = false;
      this.currentTaskId = null;
    }

    // ============ PIN FUNKSIYASI ============
    togglePin(taskId, taskItem) {
      const tasks = this.getTasks();
      const taskIndex = tasks.findIndex((t) => t.id === taskId);

      if (taskIndex === -1) return;

      // Pin holatini toggle qilish
      tasks[taskIndex].pinned = !tasks[taskIndex].pinned;

      // LocalStorage ga saqlash
      localStorage.setItem("wzTasks", JSON.stringify(tasks));

      // UI ni yangilash
      if (tasks[taskIndex].pinned) {
        taskItem.classList.add("pinned");
        this.addPinIcon(taskItem);
        this.showNotification(
          "📌 Task Pinned",
          "Task will stay at the top",
          "success",
        );
      } else {
        taskItem.classList.remove("pinned");
        this.removePinIcon(taskItem);
        this.showNotification("Pin removed", "Task unpinned", "info");
      }

      // Pinned tasklarni qayta tartiblash
      this.reorderPinnedTasks();
    }

    addPinIcon(taskItem) {
      if (!taskItem || taskItem.querySelector(".task-pin-icon")) return;

      const taskContent = taskItem.querySelector(".task-content");
      if (!taskContent) return;

      const pinIcon = document.createElement("span");
      pinIcon.className = "task-pin-icon";
      pinIcon.innerHTML = '<i class="fa-solid fa-thumbtack"></i>';
      pinIcon.setAttribute("data-pin-icon", "true");

      // Task textni topish va pin ikonkasini qo'shish
      const taskText = taskContent.querySelector(".task-text");
      if (taskText) {
        taskText.insertAdjacentElement("beforebegin", pinIcon);
      }
    }

    removePinIcon(taskItem) {
      if (!taskItem) return;
      const pinIcon = taskItem.querySelector(".task-pin-icon");
      if (pinIcon) pinIcon.remove();
    }

    reorderPinnedTasks() {
      const taskList = document.getElementById("taskList");
      if (!taskList) return;

      const tasks = this.getTasks();

      // Pinned tasklarni tepaga, qolganlarini pastga tartiblash
      const pinnedTasks = tasks.filter((t) => t.pinned);
      const unpinnedTasks = tasks.filter((t) => !t.pinned);

      // UI ni yangilamasdan faqat DOM da tartiblash
      pinnedTasks.forEach((task) => {
        const element = document.querySelector(
          `.task-item[data-task-id="${task.id}"]`,
        );
        if (element) {
          taskList.insertBefore(element, taskList.firstChild);
        }
      });
    }

    // ============ FLAG FUNKSIYASI ============
    toggleFlag(taskId, taskItem) {
      const tasks = this.getTasks();
      const taskIndex = tasks.findIndex((t) => t.id === taskId);

      if (taskIndex === -1) return;

      tasks[taskIndex].flagged = !tasks[taskIndex].flagged;
      localStorage.setItem("wzTasks", JSON.stringify(tasks));

      if (tasks[taskIndex].flagged) {
        taskItem.classList.add("flagged");
        this.addFlagIcon(taskItem);
        this.showNotification(
          "✓ Flag added",
          "Task marked as important",
          "success",
        );
      } else {
        taskItem.classList.remove("flagged");
        this.removeFlagIcon(taskItem);
        this.showNotification("Flag removed", "Task unmarked", "info");
      }
    }

    addFlagIcon(taskItem) {
      if (!taskItem || taskItem.querySelector(".task-flag-icon")) return;

      const taskContent = taskItem.querySelector(".task-content");
      if (!taskContent) return;

      const flagIcon = document.createElement("span");
      flagIcon.className = "task-flag-icon";
      flagIcon.innerHTML = '<i class="fas fa-flag"></i>';
      flagIcon.setAttribute("data-flag-icon", "true");

      const pinIcon = taskItem.querySelector(".task-pin-icon");
      const taskText = taskContent.querySelector(".task-text");

      if (pinIcon) {
        pinIcon.insertAdjacentElement("afterend", flagIcon);
      } else if (taskText) {
        taskText.insertAdjacentElement("beforebegin", flagIcon);
      }
    }

    removeFlagIcon(taskItem) {
      if (!taskItem) return;
      const flagIcon = taskItem.querySelector(".task-flag-icon");
      if (flagIcon) flagIcon.remove();
    }

    // ============ DRAG MODE ============
    toggleDragMode(taskItem) {
      if (!taskItem) return;

      const isDragMode = taskItem.classList.contains("drag-mode");

      document.querySelectorAll(".task-item").forEach((item) => {
        item.classList.remove("drag-mode");
        item.setAttribute("draggable", "false");
        this.removeDragHandle(item);
      });

      if (this.dragTimeouts.has(taskItem.dataset.taskId)) {
        clearTimeout(this.dragTimeouts.get(taskItem.dataset.taskId));
        this.dragTimeouts.delete(taskItem.dataset.taskId);
      }

      if (!isDragMode) {
        taskItem.classList.add("drag-mode");
        taskItem.setAttribute("draggable", "true");
        this.addDragHandle(taskItem);

        this.showNotification(
          "Drag Mode Active",
          "You can now drag this task",
          "info",
        );

        const timeoutId = setTimeout(() => {
          taskItem.classList.remove("drag-mode");
          taskItem.setAttribute("draggable", "false");
          this.removeDragHandle(taskItem);
          this.dragTimeouts.delete(taskItem.dataset.taskId);
          this.showNotification(
            "Drag Mode Disabled",
            "Auto-disabled after 15 seconds",
            "info",
          );
        }, 15000);

        this.dragTimeouts.set(taskItem.dataset.taskId, timeoutId);
      }
    }

    addDragHandle(taskItem) {
      if (!taskItem || taskItem.querySelector(".task-drag-handle")) return;

      const dragHandle = document.createElement("div");
      dragHandle.className = "task-drag-handle";
      dragHandle.innerHTML = '<i class="fas fa-grip-lines"></i>';

      taskItem.insertBefore(dragHandle, taskItem.firstChild);
    }

    removeDragHandle(taskItem) {
      const dragHandle = taskItem.querySelector(".task-drag-handle");
      if (dragHandle) dragHandle.remove();
    }

    // ============ EDIT TASK ============
    editTask(taskId) {
      const tasks = this.getTasks();
      const taskIndex = tasks.findIndex((t) => t.id === taskId);

      if (taskIndex === -1) return;

      const task = tasks[taskIndex];
      const newText = prompt("Edit task:", task.text);

      if (newText && newText.trim() !== "") {
        const trimmedText = newText.trim();
        tasks[taskIndex].text = trimmedText;
        localStorage.setItem("wzTasks", JSON.stringify(tasks));

        const taskElement = document.querySelector(
          `.task-item[data-task-id="${taskId}"]`,
        );
        if (taskElement) {
          const textElement = taskElement.querySelector(".task-text");
          if (textElement) {
            const emoji = this.categoryEmojis[task.category] || "📝";
            textElement.textContent = `${emoji} ${trimmedText}`;
          }
        }

        this.showNotification(
          "✓ Task Updated",
          "Changes saved successfully",
          "success",
        );
      }
    }

    // ============ DELETE TASK ============
    deleteTask(taskId, taskElement) {
      if (!confirm("Delete this task?")) return;

      taskElement.classList.add("removing");

      setTimeout(() => {
        const tasks = this.getTasks().filter((t) => t.id !== taskId);
        localStorage.setItem("wzTasks", JSON.stringify(tasks));
        taskElement.remove();

        if (typeof window.updateStats === "function") {
          window.updateStats();
        }

        this.showNotification(
          "✓ Task Deleted",
          "Task removed successfully",
          "error",
        );
      }, 300);
    }

    // ============ DRAG AND DROP ============
    initDragAndDrop() {
      const taskList = document.getElementById("taskList");
      if (!taskList) return;

      const signal = this.abortController?.signal;

      taskList.addEventListener(
        "dragstart",
        (e) => {
          const taskItem = e.target.closest(".task-item");
          if (!taskItem || !taskItem.classList.contains("drag-mode")) {
            e.preventDefault();
            return;
          }

          e.dataTransfer.setData("text/plain", taskItem.dataset.taskId);
          e.dataTransfer.effectAllowed = "move";
          taskItem.classList.add("dragging");
        },
        { signal },
      );

      taskList.addEventListener(
        "dragend",
        (e) => {
          const taskItem = e.target.closest(".task-item");
          if (taskItem) {
            taskItem.classList.remove("dragging");
          }

          document.querySelectorAll(".task-item").forEach((item) => {
            item.style.borderTop = "";
            item.style.borderBottom = "";
          });
        },
        { signal },
      );

      taskList.addEventListener(
        "dragover",
        (e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";

          const taskItem = e.target.closest(".task-item");
          if (!taskItem) return;

          const rect = taskItem.getBoundingClientRect();
          const y = e.clientY - rect.top;

          taskItem.style.borderTop = "";
          taskItem.style.borderBottom = "";

          if (y < rect.height / 2) {
            taskItem.style.borderTop = "3px solid var(--ios-blue)";
          } else {
            taskItem.style.borderBottom = "3px solid var(--ios-blue)";
          }
        },
        { signal },
      );

      taskList.addEventListener(
        "dragleave",
        (e) => {
          const taskItem = e.target.closest(".task-item");
          if (taskItem) {
            taskItem.style.borderTop = "";
            taskItem.style.borderBottom = "";
          }
        },
        { signal },
      );

      taskList.addEventListener(
        "drop",
        (e) => {
          e.preventDefault();

          const taskItem = e.target.closest(".task-item");
          if (!taskItem) return;

          taskItem.style.borderTop = "";
          taskItem.style.borderBottom = "";

          const dragId = parseInt(e.dataTransfer.getData("text/plain"));
          const dropId = parseInt(taskItem.dataset.taskId);

          if (dragId === dropId) return;

          const dragElement = document.querySelector(
            `.task-item[data-task-id="${dragId}"]`,
          );
          if (!dragElement) return;

          const tasks = this.getTasks();
          const dragIndex = tasks.findIndex((t) => t.id === dragId);
          const dropIndex = tasks.findIndex((t) => t.id === dropId);

          if (dragIndex === -1 || dropIndex === -1) return;

          const [draggedTask] = tasks.splice(dragIndex, 1);
          tasks.splice(dropIndex, 0, draggedTask);

          localStorage.setItem("wzTasks", JSON.stringify(tasks));

          const rect = taskItem.getBoundingClientRect();
          const y = e.clientY - rect.top;

          if (y > rect.height / 2) {
            taskItem.insertAdjacentElement("afterend", dragElement);
          } else {
            taskItem.insertAdjacentElement("beforebegin", dragElement);
          }

          this.showNotification(
            "✓ Task Reordered",
            "Position updated",
            "success",
          );
        },
        { signal },
      );
    }

    // ============ LIST CREATION SYSTEM ============
    startListCreation() {
      // Selection rejimini boshlash
      this.selectionMode = true;
      this.selectedTasks = [];

      // Selection headerni yaratish
      this.createSelectionHeader();

      // Task listga selection mode klassini qo'shish
      const taskList = document.getElementById("taskList");
      if (taskList) {
        taskList.classList.add("selection-mode");
      }

      // Har bir taskga click event qo'shish
      document.querySelectorAll(".task-item").forEach((item) => {
        item.addEventListener("click", (e) => this.handleTaskSelection(e));
        item.classList.remove("selected");
      });

      this.showNotification(
        "Select Tasks",
        "Choose tasks to add to list",
        "info",
      );
    }

    createSelectionHeader() {
      // Eski headerni o'chirish
      const oldHeader = document.querySelector(".selection-header");
      if (oldHeader) oldHeader.remove();

      const header = document.createElement("div");
      header.className = "selection-header";
      header.innerHTML = `
    <div class="selection-info">
      <div class="selection-title">Create List</div>
      <div class="selection-count" id="selectionCount">0 Tasks</div>
    </div>
    
    <div class="selection-btns">
      <button class="selection-cancel" id="cancelSelectionBtn">
      <i class="fas fa-times"></i>
    </button>
    <button class="selection-btn" id="createListFinalBtn" disabled>
      <i class="fas fa-check"></i>
    </button>
    </div>
  `;

      const container = document.querySelector(".container");
      container.insertBefore(header, container.firstChild);

      // Event listeners
      document
        .getElementById("createListFinalBtn")
        .addEventListener("click", () => {
          this.showListNameDialog();
        });

      document
        .getElementById("cancelSelectionBtn")
        .addEventListener("click", () => {
          this.cancelSelection();
        });
    }

    handleTaskSelection(e) {
      if (!this.selectionMode) return;

      const taskItem = e.currentTarget;
      const taskId = parseInt(taskItem.dataset.taskId);

      if (taskItem.classList.contains("selected")) {
        // Deselect
        taskItem.classList.remove("selected");
        this.selectedTasks = this.selectedTasks.filter((id) => id !== taskId);
      } else {
        // Select
        taskItem.classList.add("selected");
        this.selectedTasks.push(taskId);
      }

      // Update counter
      const countEl = document.getElementById("selectionCount");
      const createBtn = document.getElementById("createListFinalBtn");

      if (countEl) {
        countEl.textContent = `${this.selectedTasks.length} task${this.selectedTasks.length !== 1 ? "s" : ""} `;
      }

      if (createBtn) {
        createBtn.disabled = this.selectedTasks.length === 0;
      }
    }

    cancelSelection() {
      this.selectionMode = false;
      this.selectedTasks = [];

      // Remove selection header
      const header = document.querySelector(".selection-header");
      if (header) header.remove();

      // Remove selection mode from task list
      const taskList = document.getElementById("taskList");
      if (taskList) {
        taskList.classList.remove("selection-mode");
      }

      // Remove selected class from all tasks
      document.querySelectorAll(".task-item").forEach((item) => {
        item.classList.remove("selected");
        item.removeEventListener("click", this.handleTaskSelection);
      });

      this.showNotification("Cancelled", "List creation cancelled", "info");
    }

    showListNameDialog() {
      // List nomi va emoji uchun dialog
      const dialog = document.createElement("div");
      dialog.className = "list-name-dialog";
      dialog.innerHTML = `
    <div class="dialog-content">
      <h3>Create New List</h3>
      
      <div class="dialog-field">
        <label>Emoji</label>
        <div class="emoji-selector">
          ${this.getEmojiGrid()}
        </div>
      </div>
      
      <div class="dialog-field">
        <label>List Name</label>
        <input type="text" id="listNameInput" placeholder="e.g., Shopping List" maxlength="30">
      </div>
      
      <div class="dialog-actions">
        <button class="dialog-cancel">Cancel</button>
        <button class="dialog-create" id="finalCreateListBtn">Create List</button>
      </div>
    </div>
  `;

      document.body.appendChild(dialog);

      // Focus input
      setTimeout(() => {
        document.getElementById("listNameInput").focus();
      }, 100);

      // Emoji selection
      dialog.querySelectorAll(".emoji-option").forEach((emoji) => {
        emoji.addEventListener("click", () => {
          dialog
            .querySelectorAll(".emoji-option")
            .forEach((e) => e.classList.remove("selected"));
          emoji.classList.add("selected");
        });
      });

      // Cancel
      dialog.querySelector(".dialog-cancel").addEventListener("click", () => {
        dialog.remove();
      });

      // Create
      dialog
        .querySelector("#finalCreateListBtn")
        .addEventListener("click", () => {
          const selectedEmoji = dialog.querySelector(".emoji-option.selected");
          const listName = document
            .getElementById("listNameInput")
            .value.trim();

          if (!selectedEmoji) {
            alert("Please select an emoji");
            return;
          }

          if (!listName) {
            alert("Please enter a list name");
            return;
          }

          const emoji = selectedEmoji.textContent;
          dialog.remove();

          this.createList(emoji, listName);
        });
    }

    getEmojiGrid() {
      const emojis = [
        "📋",
        "✅",
        "⭐",
        "🔥",
        "🎯",
        "⚡",
        "🏠",
        "💭",
        "📚",
        "🗓️",
        "🏋️",
        "🍔",
        "✈️",
        "❤️",
        "💡",
        "📌",
      ];

      return emojis
        .map(
          (emoji) => `
    <span class="emoji-option ${emoji === "📋" ? "selected" : ""}">${emoji}</span>
  `,
        )
        .join("");
    }

    createList(emoji, listName) {
      const listId = Date.now();

      // List object yaratish
      const list = {
        id: listId,
        name: listName,
        emoji: emoji,
        tasks: this.selectedTasks,
        createdAt: new Date().toISOString(),
      };

      // Listlarni localStorage ga saqlash
      const lists = this.getLists();
      lists.push(list);
      localStorage.setItem("wzLists", JSON.stringify(lists));

      // Tasklarni yangilash (har bir taskka listId qo'shish)
      const tasks = this.getTasks();
      this.selectedTasks.forEach((taskId) => {
        const task = tasks.find((t) => t.id === taskId);
        if (task) {
          if (!task.lists) task.lists = [];
          task.lists.push(listId);
        }
      });
      localStorage.setItem("wzTasks", JSON.stringify(tasks));

      // UI da list headerni yaratish
      this.createListHeader(list);

      // Tasklarni list rangida belgilash
      this.selectedTasks.forEach((taskId) => {
        const taskElement = document.querySelector(
          `.task-item[data-task-id="${taskId}"]`,
        );
        if (taskElement) {
          taskElement.classList.add("in-list");
          taskElement.setAttribute("data-list-id", listId);
        }
      });

      // Selection rejimini tugatish
      this.cancelSelection();

      this.showNotification(
        "✅ List Created",
        `"${listName}" list created with ${this.selectedTasks.length} tasks`,
        "success",
      );
    }

    createListHeader(list) {
      // Eski headerni o'chirish
      const oldHeader = document.querySelector(
        `.list-header[data-list-id="${list.id}"]`,
      );
      if (oldHeader) oldHeader.remove();

      const header = document.createElement("div");
      header.className = "list-header";
      header.setAttribute("data-list-id", list.id);
      header.innerHTML = `
    <div class="list-header-content">
      <div class="list-emoji">${list.emoji}</div>
      <div class="list-info">
        <div class="list-name">${list.name}</div>
        <div class="list-count">${list.tasks.length} tasks</div>
      </div>
      <div class="list-actions">
        <button class="list-action-btn edit-list" title="Edit List">
          <i class="fas fa-pen"></i>
        </button>
        <button class="list-action-btn delete-list" title="Delete List">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  `;

      // List headerni task listdan oldin qo'shish
      const taskList = document.getElementById("taskList");
      taskList.parentNode.insertBefore(header, taskList);

      // Edit list
      header.querySelector(".edit-list").addEventListener("click", () => {
        this.editList(list.id);
      });

      // Delete list
      header.querySelector(".delete-list").addEventListener("click", () => {
        this.deleteList(list.id);
      });
    }

    editList(listId) {
      const lists = this.getLists();
      const list = lists.find((l) => l.id === listId);

      if (!list) return;

      const newName = prompt("Edit list name:", list.name);
      if (newName && newName.trim()) {
        list.name = newName.trim();
        localStorage.setItem("wzLists", JSON.stringify(lists));

        // Update header
        const header = document.querySelector(
          `.list-header[data-list-id="${listId}"]`,
        );
        if (header) {
          header.querySelector(".list-name").textContent = list.name;
        }

        this.showNotification("List Updated", "List name changed", "success");
      }
    }

    deleteList(listId) {
      if (!confirm("Delete this list? Tasks will not be deleted.")) return;

      // Listni o'chirish
      const lists = this.getLists().filter((l) => l.id !== listId);
      localStorage.setItem("wzLists", JSON.stringify(lists));

      // Tasklardan listId ni o'chirish
      const tasks = this.getTasks();
      tasks.forEach((task) => {
        if (task.lists) {
          task.lists = task.lists.filter((id) => id !== listId);
        }
      });
      localStorage.setItem("wzTasks", JSON.stringify(tasks));

      // UI dan list headerni o'chirish
      const header = document.querySelector(
        `.list-header[data-list-id="${listId}"]`,
      );
      if (header) header.remove();

      // Tasklardan list classini o'chirish
      document
        .querySelectorAll(`.task-item[data-list-id="${listId}"]`)
        .forEach((task) => {
          task.classList.remove("in-list");
          task.removeAttribute("data-list-id");
        });

      this.showNotification("List Deleted", "List removed", "info");
    }

    getLists() {
      try {
        const lists = localStorage.getItem("wzLists");
        return lists ? JSON.parse(lists) : [];
      } catch (error) {
        console.error("Error loading lists:", error);
        return [];
      }
    }

    // Load existing lists on init
    loadExistingLists() {
      const lists = this.getLists();

      lists.forEach((list) => {
        // List headerni yaratish
        this.createListHeader(list);

        // Tasklarni belgilash
        list.tasks.forEach((taskId) => {
          const taskElement = document.querySelector(
            `.task-item[data-task-id="${taskId}"]`,
          );
          if (taskElement) {
            taskElement.classList.add("in-list");
            taskElement.setAttribute("data-list-id", list.id);
          }
        });
      });
    }

    attachPopupEvents(popup, task, taskItem) {
      // Pin tugmasi
      const pinBtn = popup.querySelector('[data-action="pin"]');
      if (pinBtn) {
        pinBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          e.preventDefault();
          this.togglePin(task.id, taskItem);
          this.hidePopup();
        });
      }

      // Flag tugmasi
      const flagBtn = popup.querySelector('[data-action="flag"]');
      if (flagBtn) {
        flagBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          e.preventDefault();
          this.toggleFlag(task.id, taskItem);
          this.hidePopup();
        });
      }

      // Edit tugmasi
      const editBtn = popup.querySelector('[data-action="edit"]');
      if (editBtn) {
        editBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          e.preventDefault();
          this.hidePopup();
          setTimeout(() => {
            this.editTask(task.id);
          }, 150);
        });
      }

      // Drag tugmasi
      const dragBtn = popup.querySelector('[data-action="drag"]');
      if (dragBtn) {
        dragBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          e.preventDefault();
          this.hidePopup();
          this.toggleDragMode(taskItem);
        });
      }

      // CREATE LIST TUGMASI - BU YERDA MUHIM!
      const createListBtn = popup.querySelector('[data-action="createList"]');
      if (createListBtn) {
        createListBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          e.preventDefault();
          this.hidePopup();
          setTimeout(() => {
            this.startListCreation();
          }, 150);
        });
      }

      // Delete tugmasi
      const deleteBtn = popup.querySelector('[data-action="delete"]');
      if (deleteBtn) {
        deleteBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          e.preventDefault();
          this.hidePopup();
          setTimeout(() => {
            this.deleteTask(task.id, taskItem);
          }, 150);
        });
      }
    }

    // ============ LIST MANAGEMENT ENHANCEMENTS ============

    // Listga task qo'shish
    addTaskToList(listId, taskId) {
      const lists = this.getLists();
      const list = lists.find((l) => l.id === listId);

      if (!list) return;

      // Taskni listga qo'shish (agar mavjud bo'lmasa)
      if (!list.tasks.includes(taskId)) {
        list.tasks.push(taskId);
        localStorage.setItem("wzLists", JSON.stringify(lists));

        // Taskni yangilash
        const tasks = this.getTasks();
        const task = tasks.find((t) => t.id === taskId);
        if (task) {
          if (!task.lists) task.lists = [];
          if (!task.lists.includes(listId)) {
            task.lists.push(listId);
            localStorage.setItem("wzTasks", JSON.stringify(tasks));
          }
        }

        // UI ni yangilash
        const taskElement = document.querySelector(
          `.task-item[data-task-id="${taskId}"]`,
        );
        if (taskElement) {
          taskElement.classList.add("in-list");
          taskElement.setAttribute("data-list-id", listId);
        }

        // List count ni yangilash
        this.updateListCount(listId);

        this.showNotification("✅ Task Added", "Task added to list", "success");
      }
    }

    // Listdan taskni olib tashlash
    removeTaskFromList(listId, taskId) {
      const lists = this.getLists();
      const list = lists.find((l) => l.id === listId);

      if (!list) return;

      // Taskni listdan olib tashlash
      list.tasks = list.tasks.filter((id) => id !== taskId);
      localStorage.setItem("wzLists", JSON.stringify(lists));

      // Taskni yangilash
      const tasks = this.getTasks();
      const task = tasks.find((t) => t.id === taskId);
      if (task && task.lists) {
        task.lists = task.lists.filter((id) => id !== listId);
        localStorage.setItem("wzTasks", JSON.stringify(tasks));
      }

      // UI ni yangilash
      const taskElement = document.querySelector(
        `.task-item[data-task-id="${taskId}"]`,
      );
      if (taskElement) {
        taskElement.classList.remove("in-list");
        taskElement.removeAttribute("data-list-id");
      }

      // List count ni yangilash
      this.updateListCount(listId);

      // Agar listda task qolmasa, listni o'chirish
      if (list.tasks.length === 0) {
        this.deleteList(listId);
      } else {
        this.showNotification(
          "🗑️ Task Removed",
          "Task removed from list",
          "info",
        );
      }
    }

    // List count ni yangilash
    updateListCount(listId) {
      const lists = this.getLists();
      const list = lists.find((l) => l.id === listId);

      if (!list) return;

      const header = document.querySelector(
        `.list-header[data-list-id="${listId}"]`,
      );
      if (header) {
        const countEl = header.querySelector(".list-count");
        if (countEl) {
          countEl.textContent = `${list.tasks.length} task${list.tasks.length !== 1 ? "s" : ""}`;
        }
      }
    }

    // Popupda list menu ko'rsatish
    showListMenu(taskItem, x, y) {
      const taskId = parseInt(taskItem.dataset.taskId);
      const task = this.getTaskById(taskId);

      if (!task) return;

      const lists = this.getLists();

      if (lists.length === 0) {
        this.showNotification("No Lists", "Create a list first", "info");
        return;
      }

      // List menu popup yaratish
      const menu = document.createElement("div");
      menu.className = "list-menu-popup";
      menu.innerHTML = `
    <div class="list-menu-header">
      <span>Add to List</span>
      <button class="close-list-menu"><i class="fas fa-times"></i></button>
    </div>
    <div class="list-menu-items">
      ${lists
        .map((list) => {
          const isInList = task.lists && task.lists.includes(list.id);
          return `
          <div class="list-menu-item" data-list-id="${list.id}" data-in-list="${isInList}">
            <span class="list-item-emoji">${list.emoji}</span>
            <span class="list-item-name">${list.name}</span>
            <span class="list-item-check">${isInList ? "✓" : ""}</span>
          </div>
        `;
        })
        .join("")}
    </div>
  `;

      document.body.appendChild(menu);

      // Pozitsiyalash
      const rect = menu.getBoundingClientRect();
      let left = x - rect.width / 2;
      let top = y - rect.height - 10;

      if (top < 10) top = y + 20;
      if (left + rect.width > window.innerWidth - 10)
        left = window.innerWidth - rect.width - 10;
      if (left < 10) left = 10;

      menu.style.left = left + "px";
      menu.style.top = top + "px";

      // Close button
      menu.querySelector(".close-list-menu").addEventListener("click", () => {
        menu.remove();
      });

      // List item click
      menu.querySelectorAll(".list-menu-item").forEach((item) => {
        item.addEventListener("click", () => {
          const listId = parseInt(item.dataset.listId);
          const inList = item.dataset.inList === "true";

          if (inList) {
            this.removeTaskFromList(listId, taskId);
            item.dataset.inList = "false";
            item.querySelector(".list-item-check").textContent = "";
          } else {
            this.addTaskToList(listId, taskId);
            item.dataset.inList = "true";
            item.querySelector(".list-item-check").textContent = "✓";
          }

          // Menu ochiq qolsin
        });
      });

      // Click outside to close
      setTimeout(() => {
        document.addEventListener("click", function closeMenu(e) {
          if (!menu.contains(e.target)) {
            menu.remove();
            document.removeEventListener("click", closeMenu);
          }
        });
      }, 100);
    }

    // Popupga "Add to List" tugmasini qo'shish
    createPopup(task, taskItem) {
      const popup = document.createElement("div");
      popup.className = "task-popup";
      popup.id = "taskPopup";

      const isFlagged = task.flagged || false;
      const isPinned = task.pinned || false;
      const isDragMode = taskItem.classList.contains("drag-mode");
      const isInAnyList = task.lists && task.lists.length > 0;

      popup.innerHTML = `
    <div class="popup-arrow"></div>
    
    <button class="popup-menu-item ${isPinned ? "pinned" : ""}" data-action="pin">
      <i class="fa-solid fa-thumbtack" style="transform: rotate(45deg); ${isPinned ? "color: var(--ios-blue);" : ""}"></i>
      <span>${isPinned ? "Unpin" : "Pin"}</span>
    </button>
    
    <button class="popup-menu-item create-list-item" data-action="createList">
      <i class="fas fa-layer-group"></i>
      <span>Create List</span>
    </button>

    <!-- YANGI: Add to List tugmasi -->
    <button class="popup-menu-item ${isInAnyList ? "in-list" : ""}" data-action="addToList">
      <i class="fas fa-list-ul"></i>
      <span>${isInAnyList ? "Manage Lists" : "Add to List"}</span>
    </button>
    
    <button class="popup-menu-item ${isFlagged ? "flagged" : ""}" data-action="flag">
      <i class="fas fa-flag"></i>
      <span>${isFlagged ? "Remove Flag" : "Flag"}</span>
    </button>
    
    <button class="popup-menu-item ${isDragMode ? "active" : ""}" data-action="drag">
      <i class="fas fa-grip-lines"></i>
      <span>${isDragMode ? "Drag Mode Active" : "Drag"}</span>
    </button>

    <button class="popup-menu-item" data-action="edit">
      <i class="fas fa-pen"></i>
      <span>Edit</span>
    </button>
    
    <button class="popup-menu-item delete-item" data-action="delete">
      <i class="fas fa-trash"></i>
      <span>Delete</span>
    </button>
  `;

      this.attachPopupEvents(popup, task, taskItem);

      return popup;
    }

    // attachPopupEvents ga yangi tugmani qo'shish
    attachPopupEvents(popup, task, taskItem) {
      // Pin tugmasi
      const pinBtn = popup.querySelector('[data-action="pin"]');
      if (pinBtn) {
        pinBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          e.preventDefault();
          this.togglePin(task.id, taskItem);
          this.hidePopup();
        });
      }

      // Flag tugmasi
      const flagBtn = popup.querySelector('[data-action="flag"]');
      if (flagBtn) {
        flagBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          e.preventDefault();
          this.toggleFlag(task.id, taskItem);
          this.hidePopup();
        });
      }

      // Edit tugmasi
      const editBtn = popup.querySelector('[data-action="edit"]');
      if (editBtn) {
        editBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          e.preventDefault();
          this.hidePopup();
          setTimeout(() => {
            this.editTask(task.id);
          }, 150);
        });
      }

      // Drag tugmasi
      const dragBtn = popup.querySelector('[data-action="drag"]');
      if (dragBtn) {
        dragBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          e.preventDefault();
          this.hidePopup();
          this.toggleDragMode(taskItem);
        });
      }

      // Create List tugmasi
      const createListBtn = popup.querySelector('[data-action="createList"]');
      if (createListBtn) {
        createListBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          e.preventDefault();
          this.hidePopup();
          setTimeout(() => {
            this.startListCreation();
          }, 150);
        });
      }

      // YANGI: Add to List tugmasi
      const addToListBtn = popup.querySelector('[data-action="addToList"]');
      if (addToListBtn) {
        addToListBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          e.preventDefault();
          this.hidePopup();
          setTimeout(() => {
            this.showListMenu(
              taskItem,
              e.clientX || e.changedTouches[0].clientX,
              e.clientY || e.changedTouches[0].clientY,
            );
          }, 150);
        });
      }

      // Delete tugmasi
      const deleteBtn = popup.querySelector('[data-action="delete"]');
      if (deleteBtn) {
        deleteBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          e.preventDefault();
          this.hidePopup();
          setTimeout(() => {
            this.deleteTask(task.id, taskItem);
          }, 150);
        });
      }
    }

    // Task completed bo'lganda list borderini saqlash
    observeTaskCompletion() {
      const taskList = document.getElementById("taskList");
      if (!taskList) return;

      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (
            mutation.type === "attributes" &&
            mutation.attributeName === "class"
          ) {
            const task = mutation.target;
            if (
              task.classList.contains("completed") &&
              task.classList.contains("in-list")
            ) {
              // Completed task in list - borderni saqlash
              task.style.borderLeft = "4px solid #5e5ce6";
            }
          }
        });
      });

      document.querySelectorAll(".task-item").forEach((task) => {
        observer.observe(task, {
          attributes: true,
          attributeFilter: ["class"],
        });
      });
    }


    // ============ HELPER FUNCTIONS ============
    getTasks() {
      try {
        const tasks = localStorage.getItem("wzTasks");
        return tasks ? JSON.parse(tasks) : [];
      } catch (error) {
        console.error("Error loading tasks:", error);
        return [];
      }
    }

    getTaskById(id) {
      const tasks = this.getTasks();
      return tasks.find((t) => t.id === id);
    }

    showNotification(title, message, type = "info") {
      if (typeof window.showCustomNotification === "function") {
        window.showCustomNotification(type, title, message);
      } else {
        console.log(`[${type}] ${title}: ${message}`);
      }
    }

    // ============ HOLATLARNI YUKLASH ============
    loadExistingStates() {
      const tasks = this.getTasks();

      tasks.forEach((task) => {
        const taskElement = document.querySelector(
          `.task-item[data-task-id="${task.id}"]`,
        );
        if (taskElement) {
          if (task.pinned) {
            taskElement.classList.add("pinned");
            this.addPinIcon(taskElement);
          }
          if (task.flagged) {
            taskElement.classList.add("flagged");
            this.addFlagIcon(taskElement);
          }
        }
      });
    }

    observeNewTasks() {
      const taskList = document.getElementById("taskList");
      if (!taskList) return;

      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1 && node.classList?.contains("task-item")) {
              const taskId = parseInt(node.dataset.taskId);
              const task = this.getTaskById(taskId);

              if (task) {
                if (task.pinned) {
                  node.classList.add("pinned");
                  this.addPinIcon(node);
                }
                if (task.flagged) {
                  node.classList.add("flagged");
                  this.addFlagIcon(node);
                }
              }
            }
          });
        });
      });

      observer.observe(taskList, {
        childList: true,
        subtree: false,
      });
    }
  }

  function initPopupSystem() {
    if (window.taskPopupSystem) {
      window.taskPopupSystem.cleanup();
    }
    window.taskPopupSystem = new TaskPopupSystem();
    console.log("✅ Task Popup System initialized (All bugs fixed!)");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPopupSystem);
  } else {
    initPopupSystem();
  }
})();


// ============ SEARCH FUNCTIONALITY ============
class SearchManager {
  constructor() {
    this.searchInput = document.getElementById('searchInput');
    this.searchIconWrapper = document.getElementById('searchIconWrapper');
    this.searchIcon = document.getElementById('searchIcon');
    this.searchClearBtn = document.getElementById('searchClearBtn');
    this.searchResults = document.getElementById('searchResults');
    this.searchResultsList = document.getElementById('searchResultsList');
    this.searchResultsCount = document.getElementById('searchResultsCount');
    this.searchResultsClose = document.getElementById('searchResultsClose');
    
    this.searchTimeout = null;
    this.currentQuery = '';
    this.categoryEmojis = {
      work: "💼", personal: "🧩", sport: "🏋️‍♂️", salah: "📿",
      bed: "🛏️", food: "🥪", shopping: "🛍️", break: "🎮",
      wash: "🛁", housework: "🏠", health: "🫀", study: "📚",
      travel: "✈️", hobby: "🎨"
    };
    
    this.init();
  }
  
  init() {
    if (!this.searchInput) return;
    
    // Event Listeners
    this.searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
    this.searchInput.addEventListener('focus', () => this.handleFocus());
    this.searchIconWrapper.addEventListener('click', () => this.animateSearchIcon());
    this.searchClearBtn.addEventListener('click', () => this.clearSearch());
    this.searchResultsClose.addEventListener('click', () => this.closeResults());
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        this.focusSearch();
      }
      if (e.key === 'Escape' && this.searchResults.style.display === 'block') {
        this.closeResults();
      }
    });
  }
  
  animateSearchIcon() {
    // Add rotating animation
    this.searchIconWrapper.classList.add('rotating');
    
    // Remove after animation ends
    setTimeout(() => {
      this.searchIconWrapper.classList.remove('rotating');
    }, 600);
    
    // Focus input
    this.focusSearch();
  }
  
  focusSearch() {
    this.searchInput.focus();
    this.searchInput.select();
  }
  
  handleSearch(query) {
    this.currentQuery = query.trim();
    
    // Show/hide clear button
    if (this.currentQuery.length > 0) {
      this.searchClearBtn.style.display = 'flex';
    } else {
      this.searchClearBtn.style.display = 'none';
    }
    
    // Debounce search
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      if (this.currentQuery.length > 0) {
        this.performSearch(this.currentQuery);
      } else {
        this.closeResults();
      }
    }, 300);
  }
  
  performSearch(query) {
    const tasks = this.getTasks();
    const lowerQuery = query.toLowerCase();
    
    // Search in task text, category, and subtasks
    const results = tasks.filter(task => {
      // Main task text
      const textMatch = task.text.toLowerCase().includes(lowerQuery);
      
      // Category match
      const categoryMatch = task.category.toLowerCase().includes(lowerQuery);
      
      // Subtask match
      const subtaskMatch = task.subtasks?.some(st => 
        st.text.toLowerCase().includes(lowerQuery)
      );
      
      // Notes match
      const notesMatch = task.notes?.toLowerCase().includes(lowerQuery);
      
      return textMatch || categoryMatch || subtaskMatch || notesMatch;
    });
    
    this.displayResults(results, query);
  }
  
  displayResults(results, query) {
    if (results.length === 0) {
      this.showEmptyState();
      return;
    }
    
    // Update count
    this.searchResultsCount.textContent = `${results.length} task${results.length !== 1 ? 's' : ''} found`;
    
    // Build results HTML
    const resultsHTML = results.map(task => {
      const emoji = this.categoryEmojis[task.category] || '📝';
      const categoryName = task.category.charAt(0).toUpperCase() + task.category.slice(1);
      const status = task.completed ? 'completed' : 'pending';
      const statusText = task.completed ? 'Completed' : 'Pending';
      
      // Highlight matching text
      const highlightedText = this.highlightText(task.text, query);
      
      return `
        <div class="search-result-item" data-task-id="${task.id}">
          <div class="search-result-emoji">${emoji}</div>
          <div class="search-result-content">
            <div class="search-result-text">${highlightedText}</div>
            <div class="search-result-category">
              <i class="fas fa-tag"></i>
              <span>${categoryName}</span>
              ${task.subtasks?.length ? `<span>• ${task.subtasks.length} subtasks</span>` : ''}
              ${task.notes ? `<span>• <i class="fas fa-sticky-note"></i> Note</span>` : ''}
            </div>
          </div>
          <div class="search-result-status">
            <span class="search-result-badge ${status}">${statusText}</span>
          </div>
        </div>
      `;
    }).join('');
    
    this.searchResultsList.innerHTML = resultsHTML;
    this.searchResults.style.display = 'block';
    
    // Add click events to results
    this.searchResultsList.querySelectorAll('.search-result-item').forEach(item => {
      item.addEventListener('click', () => {
        const taskId = parseInt(item.dataset.taskId);
        this.scrollToAndHighlightTask(taskId);
      });
    });
  }
  
  highlightText(text, query) {
    if (!query) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<span class="search-highlight">$1</span>');
  }
  
  showEmptyState() {
    this.searchResultsCount.textContent = '0 tasks found';
    this.searchResultsList.innerHTML = `
      <div class="search-empty">
        <i class="fas fa-search"></i>
        <p>No tasks found for "${this.currentQuery}"</p>
      </div>
    `;
    this.searchResults.style.display = 'block';
  }
  
  clearSearch() {
    this.searchInput.value = '';
    this.currentQuery = '';
    this.searchClearBtn.style.display = 'none';
    this.closeResults();
    this.searchInput.focus();
    
    // Add pulse effect
    this.searchInput.parentElement.classList.add('search-pulse');
    setTimeout(() => {
      this.searchInput.parentElement.classList.remove('search-pulse');
    }, 500);
  }
  
  closeResults() {
    this.searchResults.style.display = 'none';
    this.searchResultsList.innerHTML = '';
  }
  
  handleFocus() {
    if (this.currentQuery.length > 0) {
      this.performSearch(this.currentQuery);
    }
  }
  
  scrollToAndHighlightTask(taskId) {
    // Close search results
    this.closeResults();
    
    // Find task element
    const taskElement = document.querySelector(`.task-item[data-task-id="${taskId}"]`);
    if (taskElement) {
      // Scroll to task with smooth animation
      taskElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Add highlight animation
      taskElement.classList.add('search-highlight-task');
      taskElement.style.animation = 'highlightPulse 0.8s ease 2';
      
      // Add border effect
      taskElement.style.transition = 'all 0.3s ease';
      taskElement.style.border = '2px solid var(--blue)';
      
      // Remove highlight after animation
      setTimeout(() => {
        taskElement.style.border = '';
        taskElement.classList.remove('search-highlight-task');
      }, 2000);
      
      // Provide haptic feedback
      if (navigator.vibrate) navigator.vibrate(50);
    }
  }
  
  getTasks() {
    try {
      const stored = localStorage.getItem('wzTasks');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Error loading tasks:', e);
      return [];
    }
  }
}

// Initialize search when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  window.searchManager = new SearchManager();
});

// Add CSS for task highlight
const searchHighlightStyle = document.createElement('style');
searchHighlightStyle.textContent = `
  .search-highlight-task {
    animation: taskHighlightPulse 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  @keyframes taskHighlightPulse {
    0% {
      transform: scale(1);
      box-shadow: 0 0 0 0 rgba(0, 122, 255, 0.4);
      border-color: transparent;
    }
    50% {
      transform: scale(1.02);
      box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.3);
      border-color: var(--blue);
    }
    100% {
      transform: scale(1);
      box-shadow: 0 0 0 0 rgba(0, 122, 255, 0);
      border-color: transparent;
    }
  }
`;
document.head.appendChild(searchHighlightStyle);