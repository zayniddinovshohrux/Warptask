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
    provideHapticFeedback// ==================== TASK COMPLETION NOTIFICATION ====================
window.showTaskCompletionNotification = function (task) {
    // Remove existing notification
    const existingNotif = document.querySelector(
        ".task-completion-notification"
    );
    if (existingNotif) {
        existingNotif.style.animation = "fadeOutNotif 0.3s ease forwards";
        setTimeout(() => existingNotif.remove(), 300);
    }

    const notification = document.createElement("div");
    notification.className = "task-completion-notification";

    const categoryEmojis = {
        work: "💼",
        personal: "🧩",
        sport: "🏋️‍♂️",
        shopping: "🛍️",
        health: "🫀",
        bed: "🛏️",
        namaz: "📿",
        food: "🥪",
        study: "📚",
        travel: "✈️",
        urgent: "⏰",
        hobby: "🎨",
        wash: "🛁",
        housework: "🏠",
        break: "🎮"
    };

    const emoji = categoryEmojis[task.category] || "✅";

    notification.innerHTML = `
    <div class="notification-emoji">${emoji}</div>
    <div class="notification-content">
        <div class="notification-title">🎉 Completed!</div>
        <div class="notification-message">${
            task.text.length > 25
                ? task.text.substring(0, 25) + "..."
                : task.text
        }</div>
        <div class="notification-meta">
            <span>${getCurrentTime()}</span>
        </div>
    </div>
    <button class="notification-close">×</button>
    `;

    document.body.appendChild(notification);

    // Close button
    notification
        .querySelector(".notification-close")
        .addEventListener("click", () => {
            notification.style.animation = "fadeOutNotif 0.3s ease forwards";
            setTimeout(() => notification.remove(), 300);
        });

    // Auto remove
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = "fadeOutNotif 0.3s ease forwards";
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);

    // Haptic feedback
    if (navigator.vibrate) {
        navigator.vibrate([50, 50, 50]);
    }
};

// ==================== XP EARNED NOTIFICATION ====================
window.showXPEarnedNotification = function (xpEarned) {
    const notification = document.createElement("div");
    notification.className =
        "task-completion-notification xp-notification";

    notification.innerHTML = `
    <div class="notification-emoji">⭐</div>
    <div class="notification-content">
        <div class="notification-title">Bonus XP Earned!</div>
        <div class="notification-message">+${xpEarned} XP</div>
        <div class="notification-meta">
            <span>Great job! Keep it up!</span>
        </div>
    </div>
    <button class="notification-close">×</button>
    `;

    document.body.appendChild(notification);

    // Position it below first notification if exists
    const existingNotif = document.querySelector(
        ".task-completion-notification:not(.xp-notification):not(.levelup-notification)"
    );
    if (existingNotif) {
        const rect = existingNotif.getBoundingClientRect();
        notification.style.top = rect.bottom + 10 + "px";
    } else {
        notification.style.top = "20px";
    }

    notification
        .querySelector(".notification-close")
        .addEventListener("click", () => {
            notification.style.animation = "fadeOutNotif 0.3s ease forwards";
            setTimeout(() => notification.remove(), 300);
        });

    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = "fadeOutNotif 0.3s ease forwards";
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 4000);
};

// ==================== LEVEL UP NOTIFICATION ====================
window.showLevelUpNotification = function (level) {
    const notification = document.createElement("div");
    notification.className =
        "task-completion-notification levelup-notification";

    notification.innerHTML = `
    <div class="notification-emoji">🎯</div>
    <div class="notification-content">
        <div class="notification-title">LEVEL UP! 🚀</div>
        <div class="notification-message">You've reached Level ${level}</div>
        <div class="notification-meta">
            <span>Keep completing tasks to level up faster!</span>
        </div>
    </div>
    <button class="notification-close">×</button>
    `;

    document.body.appendChild(notification);

    // Position it at top
    notification.style.top = "20px";

    notification
        .querySelector(".notification-close")
        .addEventListener("click", () => {
            notification.style.animation = "fadeOutNotif 0.3s ease forwards";
            setTimeout(() => notification.remove(), 300);
        });

    // Create confetti
    window.createConfettiEffect?.();

    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = "fadeOutNotif 0.3s ease forwards";
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 8000);
};

// ==================== CONFETTI EFFECT ====================
window.createConfettiEffect = function () {
    const colors = [
        "#007aff",
        "#34c759",
        "#ff9500",
        "#ff3b30",
        "#af52de",
        "#ffcc00",
    ];

    for (let i = 0; i < 30; i++) {
        const confetti = document.createElement("div");
        confetti.style.cssText = `
        position: fixed;
        width: 10px;
        height: 10px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        border-radius: 50%;
        top: 50px;
        left: ${Math.random() * 100}%;
        z-index: 1002;
        animation: confettiFall ${Math.random() * 1 + 1}s linear forwards;
        pointer-events: none;
        `;

        document.body.appendChild(confetti);

        // Remove after animation
        setTimeout(() => {
            if (confetti.parentNode) {
                confetti.parentNode.removeChild(confetti);
            }
        }, 2000);
    }

    // Add animation style if not exists
    if (!document.querySelector("#confetti-style")) {
        const style = document.createElement("style");
        style.id = "confetti-style";
        style.textContent = `
        @keyframes confettiFall {
            0% {
                transform: translateY(-100px) rotate(0deg);
                opacity: 1;
            }
            100% {
                transform: translateY(100vh) rotate(${Math.random() * 360}deg);
                opacity: 0;
            }
        }
        `;
        document.head.appendChild(style);
    }
};

// ==================== TOGGLE TASK COMPLETION FUNCTION UPDATE ====================
// Sizning mavjud toggleTaskCompletion funksiyasini shunday yangilang:
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
        
        // Show completion notification
        window.showTaskCompletionNotification?.(completedTask);
        
        // Also show the custom notification for consistency
        showCustomNotification(
            "success",
            "Task Completed!",
            `${categoryEmojis[completedTask.category]} ${completedTask.text}`
        );
        
        // Check achievements
        window.checkXPForTaskCompletion?.(completedTask);
    }
}

// ==================== CHECK XP FOR TASK COMPLETION ====================
window.checkXPForTaskCompletion = function (task) {
    // Check settings
    const settings = JSON.parse(localStorage.getItem("wzSettings")) || {};
    if (settings.achievements === false) return;

    // Get current XP
    let currentXP = parseInt(localStorage.getItem("wzXP")) || 0;

    // Calculate XP
    let xpEarned = 10; // Base

    if (task.priority === "high") xpEarned += 10;
    if (task.priority === "urgent") xpEarned += 15;

    if (task.dueDate) {
        const dueDate = new Date(task.dueDate);
        const now = new Date();
        if (dueDate < now) xpEarned += 5;
    }

    // Update XP
    currentXP += xpEarned;
    localStorage.setItem("wzXP", currentXP);

    // Check level up
    const oldLevel = Math.floor((currentXP - xpEarned) / 100) + 1;
    const newLevel = Math.floor(currentXP / 100) + 1;

    if (newLevel > oldLevel) {
        setTimeout(() => window.showLevelUpNotification?.(newLevel), 600);
    }

    // Show XP notification
    if (xpEarned > 10) {
        setTimeout(() => window.showXPEarnedNotification?.(xpEarned), 600);
    }
};

    if (!wasCompleted) {
        const completedTask = tasks.find((task) => task.id === taskId);
        
        // Show completion notification
        window.showTaskCompletionNotification?.(completedTask);
        
        // Also show the custom notification for consistency
        showCustomNotification(
            "success",
            "Task Completed!",
            `${categoryEmojis[completedTask.category]} ${completedTask.text}`
        );
    }
}class WarpAI {
        constructor() {
          this.conversationHistory = [];
          this.userPreferences = this.loadPreferences();
          this.apiKey = null; // Foydalanuvchi o'zining API kalitini kiritadi
          this.model = "gpt-3.5-turbo"; // O'zgartirish mumkin
        }

        loadPreferences() {
          return JSON.parse(localStorage.getItem("warpPreferences") || "{}");
        }

        savePreferences() {
          localStorage.setItem(
            "warpPreferences",
            JSON.stringify(this.userPreferences)
          );
        }

        // Smart daily plan generator
        async generateDailyPlan(timeOfDay = "morning") {
          const plans = {
            morning: {
              greeting: "🌅 Xayrli tong! Bugun uchun optimal reja:",
              tasks: [
                "06:30 - Uyg'onish va suv ichish (1 stakan)",
                "06:45 - Darslik va tushlik (30 daqiqa)",
                "07:15 - Sog'lom nonushta (tuxum, sabzavotlar, meva)",
                "08:00 - Ishlarga tayyorgarlik",
                "08:30 - Eng muhim vazifaga sarflang (2 soat)",
                "10:30 - Tanaffus va yengil snack (yong'oq, meva)",
                "11:00 - Proyektga davom etish (1.5 soat)",
              ],
            },
            afternoon: {
              greeting: "🌤 Kunning davomi uchun reja:",
              tasks: [
                "12:30 - To'liq tushlik (protein va sabzavotlar)",
                "13:00 - 20 daqiqa dam olish yoki qisqa yurish",
                "13:30 - Vazifalar ro'yxatini yangilash",
                "14:00 - Vaqtni boshqarish (Pomodoro texnikasi - 25/5)",
                "15:30 - Qiyin vazifalarni hal qilish",
                "16:30 - Mashg'ulot yoki sport (45 daqiqa)",
                "17:15 - Dush va dam olish",
              ],
            },
            evening: {
              greeting: "🌙 Kechki reja:",
              tasks: [
                "18:00 - Oilaviy vaqt yoki shaxsiy rivojlanish",
                "19:00 - Yengil kechki ovqat (baliq yoki tovuq)",
                "19:30 - Keyingi kunni rejalashtirish",
                "20:00 - Kitob o'qish yoki kurs (1 soat)",
                "21:00 - Raqamli detoks (telefon va kompyuterdan uzilish)",
                "21:30 - Tinchlantiruvchi faoliyat (meditatsiya, stretching)",
                "22:00 - Uxlashga tayyorgarlik",
              ],
            },
          };

          // Agar AI API bor bo'lsa, real vaqtda generate qilish
          if (this.apiKey) {
            try {
              const aiPlan = await this.generateAIPlan(timeOfDay);
              if (aiPlan) return aiPlan;
            } catch (error) {
              console.error("AI plan generation failed:", error);
            }
          }

          return plans[timeOfDay] || plans.morning;
        }

        // External AI API bilan ishlash
        async generateAIPlan(timeOfDay) {
          if (!this.apiKey) return null;

          const prompt = `
      Foydalanuvchiga ${timeOfDay} vaqti uchun kunlik reja yarating.
      Quyidagilarni hisobga oling:
      1. Sog'lom ovqatlanish jadvali
      2. Samarador ish vaqti
      3. Jismoniy faollik
      4. Dam olish va shaxsiy rivojlanish
      5. Uxlash retsepti
      
      Har bir vazifa uchun aniq vaqt va qisqa tavsif berin.
      Javobni JSON formatida qaytaring: {greeting: string, tasks: array}
      `;

          try {
            const response = await fetch(
              "https://api.openai.com/v1/chat/completions",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${this.apiKey}`,
                },
                body: JSON.stringify({
                  model: this.model,
                  messages: [
                    {
                      role: "system",
                      content:
                        "Siz WarpAI yordamchisisiz. Foydalanuvchilarga kunlik rejalar yaratishda yordam berasiz. Siz optimistik va rag'batlantiruvchi bo'lasiz.",
                    },
                    {
                      role: "user",
                      content: prompt,
                    },
                  ],
                  temperature: 0.7,
                  max_tokens: 500,
                }),
              }
            );

            const data = await response.json();
            if (data.choices && data.choices[0]) {
              const content = data.choices[0].message.content;
              try {
                return JSON.parse(content);
              } catch {
                // Agar JSON bo'lmasa, text formatda qaytarish
                return {
                  greeting: `AI tomonidan yaratilgan ${timeOfDay} rejasi:`,
                  tasks: content.split("\n").filter((t) => t.trim()),
                };
              }
            }
          } catch (error) {
            console.error("AI API error:", error);
          }
          return null;
        }

        // Nutrient tracking va ovqatlanish rejasi
        generateMealPlan() {
          const mealPlans = {
            breakfast: [
              "🥚 2 ta tuxum, 1 bo'lak non, sabzavotlar",
              "🥣 Sutilgan jo'xori yoki tuxumli nonushta",
              "🍎 Meva salati va yong'oq",
              "🍵 Omlet va yangi mevalar",
            ],
            lunch: [
              "🍗 Tovuq go'shti, guruch, sabzavot salati",
              "🐟 Baliq, kartoshka, bug'doy noni",
              "🥬 Vegetarian: loviya, sabzavotlar, meva",
              "🍲 Sho'rva, salat, kam yog'li go'sht",
            ],
            dinner: [
              "🥗 Yogurtli salat, yong'oq",
              "🍠 Baked sweet potato, sabzavotlar",
              "🥣 Yengil sho'rva va salat",
              "🍳 Omlet va yangi sabzavotlar",
            ],
            snacks: [
              "🌰 Yong'oq va meva",
              "🍌 Banana va yoghurt",
              "🥛 Protein shake",
              "🍎 Apple va peanut butter",
            ],
          };

          return mealPlans;
        }

        // Task optimization
        optimizeTaskList(tasks) {
          const optimized = [...tasks];

          // Priority va vaqt bo'yicha saralash
          optimized.sort((a, b) => {
            const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
            const aPriority = priorityOrder[a.priority] || 2;
            const bPriority = priorityOrder[b.priority] || 2;

            if (aPriority !== bPriority) return aPriority - bPriority;

            // Estimated time bo'yicha
            return (a.estimatedTime || 0) - (b.estimatedTime || 0);
          });

          return optimized;
        }

        // Motivational quotes
        getMotivationalQuote() {
          const quotes = [
            "🚀 Kichik qadamlar katta natijalarni olib keladi!",
            "💪 Bugungi eng yaxshi versiyangiz bo'ling!",
            "🎯 Har bir vazifa sizni maqsadingizga yaqinlashtiradi",
            "✨ Siz buni qila olasiz!",
            "🌟 Muvaffaqiyat ketma-ketlik bilan keladi",
            "🔥 Bugun sizning kunningiz!",
            "🌈 Har qiyinchilikda imkoniyat yashiringan",
            "⭐ Har bir tugallangan vazifa - g'alaba!",
            "🌻 Kichik narsalarga minnatdor bo'ling",
            "⚡ Energiyangizni ijobiy fikrlar bilan to'ldiring",
          ];

          return quotes[Math.floor(Math.random() * quotes.length)];
        }

        // Progress analysis
        analyzeProgress(tasks) {
          const completed = tasks.filter((t) => t.completed).length;
          const total = tasks.length;
          const completionRate =
            total > 0 ? ((completed / total) * 100).toFixed(1) : 0;

          const today = new Date().toDateString();
          const todayTasks = tasks.filter(
            (t) => new Date(t.createdAt).toDateString() === today
          );

          const categories = {};
          tasks.forEach((task) => {
            categories[task.category] = (categories[task.category] || 0) + 1;
          });

          return {
            completionRate,
            todayTasks: todayTasks.length,
            mostProductiveCategory: Object.keys(categories).reduce((a, b) =>
              categories[a] > categories[b] ? a : b
            ),
            suggestions: this.generateSuggestions(completionRate, tasks),
          };
        }

        generateSuggestions(completionRate, tasks) {
          const suggestions = [];

          if (completionRate < 30) {
            suggestions.push("📌 Vazifalarni kichik qismlarga bo'ling");
            suggestions.push("⏰ Pomodoro texnikasini qo'llang (25/5)");
            suggestions.push(
              "🎯 Bir vaqtning o'zida bir vazifaga e'tibor bering"
            );
          } else if (completionRate < 70) {
            suggestions.push("✅ Eng muhim 3 ta vazifani belgilang");
            suggestions.push("🔄 Vazifalarni prioritet bo'yicha saralang");
            suggestions.push("💡 Murakkab vazifalarni ertalab hal qiling");
          } else {
            suggestions.push("🌟 Ajoyib ish! Keyingi darajaga o'ting");
            suggestions.push("📈 Mavjud vazifalarni murakkablashtiring");
            suggestions.push("🎖 O'zingizni mukofotlang");
          }

          return suggestions;
        }

        // Conversational AI response
        async chatWithAI(userMessage) {
          if (!this.apiKey) {
            return {
              response:
                "AI yordamchisidan to'liq foydalanish uchun API kalitini sozlamalardan kiriting. Hozircha men sizga oddiy maslahatlar bera olaman!",
              suggestions: [
                "API kalitini sozlamalarga kiriting",
                "Kundalik reja yaratish",
                "Ovqatlanish rejasi",
              ],
            };
          }

          this.conversationHistory.push({ role: "user", content: userMessage });

          try {
            const response = await fetch(
              "https://api.openai.com/v1/chat/completions",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${this.apiKey}`,
                },
                body: JSON.stringify({
                  model: this.model,
                  messages: [
                    {
                      role: "system",
                      content: `Siz WarpAI yordamchisisiz - optimistik, yordamchi va foydali. 
                Foydalanuvchiga task management, productivity, healthy habits, time management bo'yicha yordam bering.
                Javoblaringiz qisqa, amaliy va rag'batlantiruvchi bo'lsin.
                Emoji'lardan foydalaning.`,
                    },
                    ...this.conversationHistory.slice(-10), // Oxirgi 10ta xabarni yuborish
                  ],
                  temperature: 0.8,
                  max_tokens: 300,
                }),
              }
            );

            const data = await response.json();
            if (data.choices && data.choices[0]) {
              const aiResponse = data.choices[0].message.content;
              this.conversationHistory.push({
                role: "assistant",
                content: aiResponse,
              });
              return {
                response: aiResponse,
                suggestions: this.generateQuickReplies(userMessage),
              };
            }
          } catch (error) {
            console.error("Chat error:", error);
          }

          return {
            response:
              "Kechirasiz, hozir javob bera olmayman. Iltimos, keyinroq urinib ko'ring!",
            suggestions: [
              "Yana urinib ko'rish",
              "Kundalik reja",
              "Ovqatlanish rejasi",
            ],
          };
        }

        generateQuickReplies(userMessage) {
          const commonReplies = [
            "Bugun uchun reja yarat",
            "Ovqatlanish rejasini ko'rsat",
            "Motivatsion so'z ayt",
            "Vazifalarimni optimallashtir",
            "Tanaffus vaqti haqida eslat",
          ];

          if (
            userMessage.toLowerCase().includes("ovqat") ||
            userMessage.includes("🥗")
          ) {
            return [
              "Nonushta rejasi",
              "Tushlik rejasi",
              "Kechki ovqat",
              "Snacklar",
            ];
          }

          if (
            userMessage.toLowerCase().includes("ish") ||
            userMessage.includes("💼")
          ) {
            return [
              "Ish vaqtini optimallashtir",
              "Meeting rejasi",
              "Proyekt tuzish",
            ];
          }

          return commonReplies;
        }

        // Task recommendation based on time and habits
        recommendTasks() {
          const hour = new Date().getHours();
          let recommendations = [];

          if (hour >= 5 && hour < 9) {
            recommendations = [
              {
                text: "Suv iching (1 stakan)",
                category: "health",
                emoji: "💧",
                priority: "high",
              },
              {
                text: "Kun rejasini tuzing",
                category: "personal",
                emoji: "📝",
                priority: "high",
              },
              {
                text: "Eng qiyin vazifaga kirish",
                category: "work",
                emoji: "🎯",
                priority: "urgent",
              },
            ];
          } else if (hour >= 9 && hour < 12) {
            recommendations = [
              {
                text: "Ish tanaffusi (5 daqiqa)",
                category: "health",
                emoji: "☕",
                priority: "medium",
              },
              {
                text: "Email'larni tekshirish",
                category: "work",
                emoji: "📧",
                priority: "medium",
              },
              {
                text: "Keyingi vazifani rejalashtirish",
                category: "work",
                emoji: "📋",
                priority: "high",
              },
            ];
          } else if (hour >= 12 && hour < 14) {
            recommendations = [
              {
                text: "To'liq tushlik",
                category: "food",
                emoji: "🍽️",
                priority: "high",
              },
              {
                text: "Qisqa yurish",
                category: "sport",
                emoji: "🚶",
                priority: "medium",
              },
              {
                text: "Keyingi yarmi kun uchun energiya",
                category: "personal",
                emoji: "⚡",
                priority: "high",
              },
            ];
          } else if (hour >= 14 && hour < 18) {
            recommendations = [
              {
                text: "Murakkab vazifalar",
                category: "work",
                emoji: "👨‍💻",
                priority: "high",
              },
              {
                text: "Suv iching yana",
                category: "health",
                emoji: "💧",
                priority: "medium",
              },
              {
                text: "Vazifalarni yangilash",
                category: "personal",
                emoji: "✅",
                priority: "medium",
              },
            ];
          } else {
            recommendations = [
              {
                text: "Kunning yakunini yozing",
                category: "personal",
                emoji: "📓",
                priority: "medium",
              },
              {
                text: "Ertangi kunni rejalashtiring",
                category: "personal",
                emoji: "📅",
                priority: "high",
              },
              {
                text: "Dam olish va oila vaqti",
                category: "personal",
                emoji: "👨‍👩‍👧‍👦",
                priority: "urgent",
              },
            ];
          }

          return recommendations;
        }
      }

      window.WarpAI = WarpAI;






      // task.js fayliga qo'shing
class SubTaskManager {
    constructor() {
        this.subtasks = JSON.parse(localStorage.getItem('wzSubtasks')) || {};
    }

    addSubTask(taskId, text) {
        if (!this.subtasks[taskId]) {
            this.subtasks[taskId] = [];
        }
        
        const subTask = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        this.subtasks[taskId].push(subTask);
        this.save();
        return subTask;
    }

    toggleSubTask(taskId, subTaskId) {
        const task = this.subtasks[taskId];
        if (task) {
            const subTask = task.find(st => st.id === subTaskId);
            if (subTask) {
                subTask.completed = !subTask.completed;
                this.save();
            }
        }
    }

    deleteSubTask(taskId, subTaskId) {
        if (this.subtasks[taskId]) {
            this.subtasks[taskId] = this.subtasks[taskId].filter(st => st.id !== subTaskId);
            this.save();
        }
    }

    getSubTasks(taskId) {
        return this.subtasks[taskId] || [];
    }

    getCompletionRate(taskId) {
        const subtasks = this.getSubTasks(taskId);
        if (subtasks.length === 0) return 0;
        
        const completed = subtasks.filter(st => st.completed).length;
        return Math.round((completed / subtasks.length) * 100);
    }

    save() {
        localStorage.setItem('wzSubtasks', JSON.stringify(this.subtasks));
    }
}

// Task itemga sub-task ko'rinishi
function renderTaskWithSubtasks(task) {
    const subTaskManager = new SubTaskManager();
    const subtasks = subTaskManager.getSubTasks(task.id);
    const completionRate = subTaskManager.getCompletionRate(task.id);

    return `
        <div class="task-item ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
            <div class="task-checkbox"></div>
            <div class="task-content">
                <div class="task-text">
                    ${categoryEmojis[task.category]} ${task.text}
                    ${subtasks.length > 0 ? 
                        `<div class="subtask-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${completionRate}%"></div>
                            </div>
                            <span class="progress-text">${completionRate}% (${subtasks.filter(st => st.completed).length}/${subtasks.length})</span>
                        </div>` : 
                        ''}
                </div>
                ${subtasks.length > 0 ? `
                    <div class="subtask-preview">
                        ${subtasks.slice(0, 2).map(st => `
                            <div class="subtask-item ${st.completed ? 'completed' : ''}">
                                <span class="subtask-checkbox">${st.completed ? '✓' : '○'}</span>
                                <span class="subtask-text">${st.text}</span>
                            </div>
                        `).join('')}
                        ${subtasks.length > 2 ? 
                            `<div class="more-subtasks">+${subtasks.length - 2} more</div>` : 
                            ''}
                    </div>` : 
                    ''}
            </div>
            <div class="task-actions">
                <button class="task-action-btn add-subtask-btn" title="Add subtask">
                    <i class="fas fa-plus-circle"></i>
                </button>
                <button class="task-action-btn edit-btn">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="task-action-btn delete-btn">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
}

// quick-actions.js
class QuickActions {
    constructor() {
        this.actions = {
            'swipe-right': 'complete',
            'swipe-left': 'delete',
            'double-tap': 'edit',
            'long-press': 'details',
            'pinch': 'multi-select'
        };
        
        this.init();
    }

    init() {
        // Swipe detection
        this.setupSwipe();
        
        // Double tap detection
        this.setupDoubleTap();
        
        // Long press detection
        this.setupLongPress();
        
        // Keyboard shortcuts
        this.setupKeyboardShortcuts();
    }

    setupSwipe() {
        let startX, startY;
        const threshold = 50; // Minimum swipe distance
        
        document.addEventListener('touchstart', e => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });
        
        document.addEventListener('touchmove', e => {
            if (!startX || !startY) return;
            
            const endX = e.touches[0].clientX;
            const endY = e.touches[0].clientY;
            const diffX = startX - endX;
            const diffY = startY - endY;
            
            // Faqat gorizontal swipe
            if (Math.abs(diffX) > Math.abs(diffY)) {
                if (Math.abs(diffX) > threshold) {
                    const taskItem = e.target.closest('.task-item');
                    if (taskItem) {
                        if (diffX > 0) {
                            // Swipe left - delete
                            this.handleSwipeLeft(taskItem);
                        } else {
                            // Swipe right - complete
                            this.handleSwipeRight(taskItem);
                        }
                        startX = null;
                        startY = null;
                    }
                }
            }
        });
    }

    handleSwipeRight(taskItem) {
        const taskId = taskItem.dataset.taskId;
        taskItem.style.transform = 'translateX(100px)';
        taskItem.style.opacity = '0';
        
        setTimeout(() => {
            // Complete task logic
            console.log('Complete task:', taskId);
            taskItem.remove();
        }, 300);
    }

    handleSwipeLeft(taskItem) {
        const taskId = taskItem.dataset.taskId;
        taskItem.style.transform = 'translateX(-100px)';
        taskItem.style.opacity = '0';
        
        setTimeout(() => {
            // Delete task logic
            console.log('Delete task:', taskId);
            taskItem.remove();
        }, 300);
    }

    setupDoubleTap() {
        let lastTap = 0;
        
        document.addEventListener('touchend', e => {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;
            
            if (tapLength < 300 && tapLength > 0) {
                // Double tap detected
                const taskItem = e.target.closest('.task-item');
                if (taskItem) {
                    this.handleDoubleTap(taskItem);
                }
            }
            
            lastTap = currentTime;
        });
    }

    handleDoubleTap(taskItem) {
        const taskId = taskItem.dataset.taskId;
        // Edit task logic
        console.log('Edit task:', taskId);
    }

    setupLongPress() {
        let pressTimer;
        
        document.addEventListener('touchstart', e => {
            const taskItem = e.target.closest('.task-item');
            if (taskItem) {
                pressTimer = setTimeout(() => {
                    this.handleLongPress(taskItem);
                }, 500);
            }
        });
        
        document.addEventListener('touchend', () => {
            clearTimeout(pressTimer);
        });
        
        document.addEventListener('touchmove', () => {
            clearTimeout(pressTimer);
        });
    }

    handleLongPress(taskItem) {
        // Show task details modal
        console.log('Show details for:', taskItem.dataset.taskId);
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', e => {
            // Ctrl/Cmd + N: New task
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                document.getElementById('taskInput')?.focus();
            }
            
            // Ctrl/Cmd + /: Focus mode
            if ((e.ctrlKey || e.metaKey) && e.key === '/') {
                e.preventDefault();
                document.getElementById('focusModeBtn')?.click();
            }
            
            // Escape: Close modals
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    closeAllModals() {
        document.querySelectorAll('.modal, .focus-overlay').forEach(modal => {
            modal.style.display = 'none';
        });
    }
}

// CSS for swipe animations
const swipeStyles = `
.task-item {
    transition: transform 0.3s ease, opacity 0.3s ease;
}

.swipe-right {
    transform: translateX(100px);
    opacity: 0;
}

.swipe-left {
    transform: translateX(-100px);
    opacity: 0;
}

.swipe-indicator {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.swipe-right .swipe-indicator.right {
    right: -60px;
    background: var(--green);
    color: white;
    opacity: 1;
}

.swipe-left .swipe-indicator.left {
    left: -60px;
    background: var(--red);
    color: white;
    opacity: 1;
}
`;

// Add styles to document
const styleSheet = document.createElement('style');
styleSheet.textContent = swipeStyles;
document.head.appendChild(styleSheet);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.quickActions = new QuickActions();
});

// voice.js fayli
class VoiceTaskInput {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.supported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
        this.pressTimer = null;
        this.init();
    }

    init() {
        if (this.supported) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            
            this.recognition.continuous = false;
            this.recognition.interimResults = true;
            this.recognition.lang = 'en-US';

            this.recognition.onstart = () => {
                this.isListening = true;
                this.updateUI(true);
                this.showListeningAnimation();
            };

            this.recognition.onresult = (event) => {
                const transcript = Array.from(event.results)
                    .map(result => result[0])
                    .map(result => result.transcript)
                    .join('');

                if (event.results[0].isFinal) {
                    this.processVoiceCommand(transcript);
                } else {
                    // Show interim results
                    this.showInterimResult(transcript);
                }
            };

            this.recognition.onerror = (event) => {
                console.error('Voice recognition error:', event.error);
                this.isListening = false;
                this.updateUI(false);
                this.hideListeningAnimation();
                
                if (event.error === 'not-allowed') {
                    this.showPermissionError();
                }
            };

            this.recognition.onend = () => {
                this.isListening = false;
                this.updateUI(false);
                this.hideListeningAnimation();
                this.showVoiceResult();
            };
        } else {
            console.warn('Voice recognition not supported');
        }

        // Long press detection for add button
        this.setupLongPress();
    }

    setupLongPress() {
        const addBtn = document.getElementById('addTaskBtn');
        const voiceBtn = document.getElementById('voiceBtn');
        
        if (!addBtn) return;

        addBtn.addEventListener('touchstart', (e) => {
            this.pressTimer = setTimeout(() => {
                this.activateVoiceMode();
                e.preventDefault();
            }, 1500); // 1.5 seconds
        });

        addBtn.addEventListener('touchend', () => {
            clearTimeout(this.pressTimer);
        });

        addBtn.addEventListener('touchmove', () => {
            clearTimeout(this.pressTimer);
        });

        // Mouse events for desktop
        addBtn.addEventListener('mousedown', (e) => {
            this.pressTimer = setTimeout(() => {
                this.activateVoiceMode();
                e.preventDefault();
            }, 1500);
        });

        addBtn.addEventListener('mouseup', () => {
            clearTimeout(this.pressTimer);
        });

        addBtn.addEventListener('mouseleave', () => {
            clearTimeout(this.pressTimer);
        });

        // Voice button click
        if (voiceBtn) {
            voiceBtn.addEventListener('click', () => {
                if (this.isListening) {
                    this.stopListening();
                } else {
                    this.startListening();
                }
            });
        }
    }

    activateVoiceMode() {
        if (!this.supported) {
            this.showNotSupportedError();
            return;
        }

        // Show voice button
        this.showVoiceButton();
        
        // Ask for microphone permission
        this.requestPermission();
    }

    showVoiceButton() {
        const voiceBtn = document.getElementById('voiceBtn');
        const addBtn = document.getElementById('addTaskBtn');
        
        if (voiceBtn && addBtn) {
            // Hide add button, show voice button
            addBtn.style.display = 'none';
            voiceBtn.style.display = 'flex';
            
            // Auto-hide after 10 seconds
            setTimeout(() => {
                if (!this.isListening) {
                    this.hideVoiceButton();
                }
            }, 10000);
        }
    }

    hideVoiceButton() {
        const voiceBtn = document.getElementById('voiceBtn');
        const addBtn = document.getElementById('addTaskBtn');
        
        if (voiceBtn && addBtn) {
            voiceBtn.style.display = 'none';
            addBtn.style.display = 'flex';
        }
    }

    requestPermission() {
        // Test microphone access
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(stream => {
                    console.log('Microphone access granted');
                    // Stop tracks to release microphone
                    stream.getTracks().forEach(track => track.stop());
                    
                    // Start listening after permission
                    setTimeout(() => this.startListening(), 500);
                })
                .catch(err => {
                    console.error('Microphone access denied:', err);
                    this.showPermissionError();
                    this.hideVoiceButton();
                });
        } else {
            this.startListening();
        }
    }

    startListening() {
        if (this.supported && this.recognition && !this.isListening) {
            try {
                this.recognition.start();
            } catch (e) {
                console.error('Failed to start voice recognition:', e);
            }
        }
    }

    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
    }

    processVoiceCommand(text) {
        console.log('Voice command processed:', text);
        
        const command = this.parseCommand(text);
        
        // Fill task input
        const taskInput = document.getElementById('taskInput');
        if (taskInput) {
            taskInput.value = command.text;
            taskInput.focus();
            
            // Auto-add after 2 seconds if user doesn't type
            setTimeout(() => {
                if (taskInput.value === command.text) {
                    this.autoAddTask(command);
                }
            }, 2000);
        }
    }

    parseCommand(text) {
        const command = {
            text: text,
            category: 'personal',
            priority: 'medium',
            time: null,
            date: null
        };

        // Detect category
        const categoryPatterns = {
            work: /\b(work|meeting|office|project|business|job|deadline)\b/i,
            personal: /\b(personal|myself|home|family|friends|fun)\b/i,
            shopping: /\b(buy|shopping|store|market|purchase|grocery)\b/i,
            health: /\b(doctor|health|hospital|medicine|exercise|gym|yoga)\b/i,
            study: /\b(study|learn|read|homework|exam|course|lecture)\b/i,
            urgent: /\b(urgent|important|asap|emergency|critical|now)\b/i,
            food: /\b(food|eat|lunch|dinner|breakfast|cook|meal)\b/i,
            sport: /\b(sport|exercise|workout|run|gym|fitness)\b/i,
            bed: /\b(sleep|bed|rest|nap)\b/i,
            housework: /\b(clean|housework|laundry|dishes|vacuum)\b/i
        };

        for (const [category, pattern] of Object.entries(categoryPatterns)) {
            if (pattern.test(text)) {
                command.category = category;
                break;
            }
        }

        // Detect time (e.g., "at 3 pm", "tomorrow at 10 am")
        const timePattern = /(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i;
        const timeMatch = text.match(timePattern);
        if (timeMatch) {
            let hours = parseInt(timeMatch[1]);
            const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
            const period = timeMatch[3] ? timeMatch[3].toLowerCase() : '';
            
            if (period === 'pm' && hours < 12) hours += 12;
            if (period === 'am' && hours === 12) hours = 0;
            
            command.time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        }

        // Detect date keywords
        const today = new Date();
        if (text.toLowerCase().includes('tomorrow')) {
            today.setDate(today.getDate() + 1);
            command.date = today.toISOString().split('T')[0];
        } else if (text.toLowerCase().includes('next week')) {
            today.setDate(today.getDate() + 7);
            command.date = today.toISOString().split('T')[0];
        } else if (text.toLowerCase().includes('today')) {
            command.date = today.toISOString().split('T')[0];
        }

        // Detect priority
        if (text.toLowerCase().includes('urgent') || text.toLowerCase().includes('important')) {
            command.priority = 'high';
        }

        return command;
    }

    autoAddTask(command) {
        const taskInput = document.getElementById('taskInput');
        if (!taskInput || taskInput.value.trim() === '') return;

        // Simulate add button click
        const addBtn = document.getElementById('addTaskBtn');
        if (addBtn) {
            // Set category if detected
            if (command.category) {
                this.selectCategory(command.category);
            }
            
            // Trigger add task
            setTimeout(() => {
                addBtn.click();
                
                // Show success notification
                this.showNotification('Task added via voice!', 'success');
                
                // Return to normal mode
                this.hideVoiceButton();
            }, 100);
        }
    }

    selectCategory(category) {
        const categoryOption = document.querySelector(`.category-option[data-category="${category}"]`);
        if (categoryOption) {
            document.querySelectorAll('.category-option').forEach(opt => {
                opt.classList.remove('active');
            });
            categoryOption.classList.add('active');
            
            // Update selected category in main script
            if (window.selectedCategory !== undefined) {
                window.selectedCategory = category;
            }
        }
    }

    updateUI(listening) {
        const voiceBtn = document.getElementById('voiceBtn');
        if (voiceBtn) {
            if (listening) {
                voiceBtn.innerHTML = '<i class="fas fa-microphone-slash"></i>';
                voiceBtn.style.background = 'var(--red)';
            } else {
                voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
                voiceBtn.style.background = 'var(--purple)';
            }
        }
    }

    showListeningAnimation() {
        // Create listening animation
        const animation = document.createElement('div');
        animation.id = 'voiceListeningAnimation';
        animation.innerHTML = `
            <div class="voice-pulse"></div>
            <div class="voice-text">Listening... Speak now</div>
        `;
        animation.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 9999;
            text-align: center;
        `;
        
        document.body.appendChild(animation);
    }

    hideListeningAnimation() {
        const animation = document.getElementById('voiceListeningAnimation');
        if (animation) {
            animation.remove();
        }
    }

    showInterimResult(text) {
        let resultDiv = document.getElementById('voiceInterimResult');
        if (!resultDiv) {
            resultDiv = document.createElement('div');
            resultDiv.id = 'voiceInterimResult';
            resultDiv.style.cssText = `
                position: fixed;
                bottom: 100px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 10px 20px;
                border-radius: 20px;
                z-index: 9998;
                max-width: 80%;
                text-align: center;
            `;
            document.body.appendChild(resultDiv);
        }
        
        resultDiv.textContent = text.length > 50 ? text.substring(0, 50) + '...' : text;
    }

    showVoiceResult() {
        const resultDiv = document.getElementById('voiceInterimResult');
        if (resultDiv) {
            setTimeout(() => {
                resultDiv.style.opacity = '0';
                resultDiv.style.transition = 'opacity 0.5s';
                setTimeout(() => resultDiv.remove(), 500);
            }, 1000);
        }
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `voice-notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'success' ? 'var(--green)' : 'var(--red)'};
            color: white;
            padding: 10px 20px;
            border-radius: 20px;
            z-index: 9999;
            animation: slideDown 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideUp 0.3s ease forwards';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    showPermissionError() {
        this.showNotification('Microphone permission required for voice input', 'error');
    }

    showNotSupportedError() {
        this.showNotification('Voice input not supported in your browser', 'error');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.voiceInput = new VoiceTaskInput();
});



// ==================== FLAG FUNCTIONALITY ====================

// Flag uchun obyekt
const flagEmojis = {
    flagged: "🚩",
    unflag: "🏴"
};

// Task obyektiga flagged property qo'shamiz
let newTask = {
    id: Date.now(),
    text: text,
    category: selectedCategory,
    completed: false,
    flagged: false, // <-- YANGI: Flag holati
    time: getCurrentTime(),
    createdAt: new Date(),
    subtasks: [],
    notes: "",
    order: tasks.length,
};

// Flag toggle funksiyasi
function toggleTaskFlag(taskId, corner = null) {
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) return;

    const task = tasks[taskIndex];
    const wasFlagged = task.flagged;
    
    // Toggle flag holati
    tasks[taskIndex].flagged = !wasFlagged;
    
    // Save to storage
    saveTasksToStorage();
    
    // Update UI
    updateTaskFlagUI(taskId, !wasFlagged);
    
    // Show notification with corner animation
    showFlagNotification(!wasFlagged, task, corner);
    
    // Haptic feedback
    provideHapticFeedback();
    
    // Animation
    animateFlagCorner(corner);
    
    // Update stats
    updateStats();
}

// Update flag UI
function updateTaskFlagUI(taskId, isFlagged) {
    const taskElement = document.querySelector(`.task-item[data-task-id="${taskId}"]`);
    if (!taskElement) return;
    
    const flagIcon = taskElement.querySelector('.task-flag');
    const flagIndicator = taskElement.querySelector('.task-flagged-indicator');
    
    if (isFlagged) {
        taskElement.classList.add('task-flagged');
        if (flagIcon) {
            flagIcon.classList.add('flagged', 'flag-added');
            flagIcon.innerHTML = '<i class="fas fa-flag"></i>';
        }
        if (flagIndicator) {
            flagIndicator.textContent = '🚩';
        }
    } else {
        taskElement.classList.remove('task-flagged');
        if (flagIcon) {
            flagIcon.classList.remove('flagged');
            flagIcon.innerHTML = '<i class="fas fa-flag"></i>';
        }
        if (flagIndicator) {
            flagIndicator.textContent = '';
        }
    }
    
    // Remove animation class after animation completes
    setTimeout(() => {
        if (flagIcon) flagIcon.classList.remove('flag-added');
    }, 500);
}

// Show flag notification
function showFlagNotification(isFlagged, task, corner = null) {
    const messages = isFlagged ? [
        "Task flagged! 🚩",
        "Added to priority list! ⭐",
        "Marked as important! 🔴",
        "Flagged for attention! 👀"
    ] : [
        "Flag removed! 🏴",
        "Removed from priority list",
        "No longer marked as important"
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    
    showCustomNotification(
        isFlagged ? "success" : "info",
        isFlagged ? "Flag Added" : "Flag Removed",
        `${categoryEmojis[task.category]} ${task.text.substring(0, 30)}${task.text.length > 30 ? '...' : ''}`,
        isFlagged ? "fas fa-flag" : "fas fa-flag"
    );
}

// Animate corner when clicked
function animateFlagCorner(corner) {
    if (!corner) return;
    
    const cornerElement = document.querySelector(`.task-corner.${corner}`);
    if (cornerElement) {
        cornerElement.style.animation = 'cornerPulse 0.5s ease';
        setTimeout(() => {
            cornerElement.style.animation = '';
        }, 500);
    }
}

// Create task element with flag functionality
function createTaskElement(task) {
    const taskItem = document.createElement("div");
    taskItem.className = `task-item ${task.completed ? "completed" : ""} ${task.flagged ? "task-flagged" : ""}`;
    taskItem.dataset.taskId = task.id;
    taskItem.draggable = true;

    // Progress bar for subtasks
    let progressHtml = "";
    if (task.subtasks && task.subtasks.length > 0) {
        const completedCount = task.subtasks.filter(st => st.completed).length;
        const progress = (completedCount / task.subtasks.length) * 100;
        progressHtml = `
            <div class="subtask-progress-main">
                <div class="subtask-progress-fill" style="width: ${progress}%"></div>
            </div>
        `;
    }

    // Note indicator
    const noteIndicator = task.notes && task.notes.trim() !== "" 
        ? '<div class="note-indicator"></div>' 
        : "";

    // Flag indicator in text
    const flagIndicator = task.flagged 
        ? '<span class="task-flagged-indicator">🚩</span>' 
        : '';

    taskItem.innerHTML = `
        <div class="task-drag-handle">
            <i class="fas fa-grip-lines"></i>
        </div>
        <div class="task-checkbox">${task.completed ? "✓" : ""}</div>
        <div class="task-content">
            <div class="task-text">${categoryEmojis[task.category] || "📝"} ${task.text}${flagIndicator}</div>
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
        
        <!-- Flag icon -->
        <div class="task-flag ${task.flagged ? 'flagged' : ''}">
            <i class="fas fa-flag"></i>
        </div>
        
        <!-- Corner click areas -->
        <div class="task-corner top-left" data-corner="top-left"></div>
        <div class="task-corner top-right" data-corner="top-right"></div>
        <div class="task-corner bottom-left" data-corner="bottom-left"></div>
        <div class="task-corner bottom-right" data-corner="bottom-right"></div>
        
        ${noteIndicator}
    `;

    // Add corner click event listeners
    const corners = taskItem.querySelectorAll('.task-corner');
    corners.forEach(corner => {
        corner.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            toggleTaskFlag(task.id, corner.dataset.corner);
        });
    });

    // Flag icon click
    const flagIcon = taskItem.querySelector('.task-flag');
    flagIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        toggleTaskFlag(task.id, 'center');
    });

    // ... mavjud event listenerlar ...

    return taskItem;
}

// Filter flagged tasks
function showFlaggedTasks() {
    const flaggedTasks = tasks.filter(task => task.flagged && !task.completed);
    currentCategory = "flagged";
    
    // Update category buttons
    document.querySelectorAll('.category-tag').forEach(tag => {
        tag.classList.remove('active');
    });
    
    // Create special flag category view
    const taskList = document.getElementById("taskList");
    const emptyState = document.getElementById("emptyState");
    
    if (flaggedTasks.length === 0) {
        emptyState.style.display = "block";
        emptyState.innerHTML = `
            <div class="empty-icon">
                <i class="fas fa-flag"></i>
            </div>
            <h3>No flagged tasks</h3>
            <p>Flag important tasks to see them here!</p>
        `;
        taskList.innerHTML = "";
    } else {
        emptyState.style.display = "none";
        taskList.innerHTML = `
            <div class="flag-header">
                <h2><i class="fas fa-flag"></i> Flagged Tasks</h2>
                <div class="flag-count">${flaggedTasks.length}</div>
            </div>
        `;
        
        flaggedTasks.forEach(task => {
            const taskElement = createTaskElement(task);
            taskList.appendChild(taskElement);
        });
    }
}

// Add flag filter to categories
function addFlagFilterToCategories() {
    const categoriesContainer = document.querySelector('.categories');
    const flagCategory = document.createElement('div');
    flagCategory.className = 'category-tag';
    flagCategory.dataset.category = 'flagged';
    flagCategory.innerHTML = '🚩 Flagged';
    flagCategory.addEventListener('click', showFlaggedTasks);
    categoriesContainer.appendChild(flagCategory);
}

// Initialize flag functionality
function initFlagFunctionality() {
    addFlagFilterToCategories();
    
    // Update all tasks with flagged status
    tasks.forEach(task => {
        updateTaskFlagUI(task.id, task.flagged);
    });
}

// Call initialization
initFlagFunctionality();

// Add corner animation CSS
const cornerStyles = `
@keyframes cornerPulse {
    0% {
        opacity: 0.1;
        transform: scale(1);
    }
    50% {
        opacity: 0.5;
        transform: scale(1.5);
    }
    100% {
        opacity: 0.1;
        transform: scale(1);
    }
}
`;

const styleSheet = document.createElement('style');  
styleSheet.textContent = cornerStyles;              
document.head.appendChild(styleSheet);           


