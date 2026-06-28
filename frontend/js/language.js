// language.js - BARCHA SAHIFALAR UCHUN TIL TIZIMI

const LanguageManager = {
  // Hozirgi til
  currentLang: "en",

  // BARCHA SAHIFALAR UCHUN TARJIMALAR
  translations: {
    en: {
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      add: "Add",
      complete: "Complete",
      pending: "Pending",
      error: "Error",
      success: "Success",
      confirm: "Confirm",
      back: "Back",
      next: "Next",
      previous: "Previous",
      close: "Close",
      all: "All",
      personal: "🧩 Personal",
      work: "💼 Work",
      shopping: "🛍️ Shopping",
      housework: "🏠 Housework",
      break: "🎮 Break",
      wash: "🛁 Wash",
      health: "🫀 Health",
      sport: "🏋️‍♂️ Sport",
      study: "📚 Study",
      travel: "✈️ Travel",
      hobby: "🎨 Hobby",
      bed: "🛏️ Bed",
      food: "🥪 Food",
      salah: "📿 Salah",
      urgent: "⏰ Urgent",
      searchPlaceholder: "Search task...",

      low: "Low",
      medium: "Medium",
      high: "High",
      aiAssistantTitle: "AI Assistant",
      aiSubtitle: "Your intelligent task companion",
      messagePlaceholder: "Ask AI for help...",
      listening: "Listening...",
      now: "Now",
      aiIntelligence: "AI Intelligence",
      smartActions: "Smart Actions",
      analytics: "Analytics",
      productivity: "Productivity",
      habits: "Habits",
      analyzeTasks: "Analyze Tasks",
      optimizeSchedule: "Optimize Schedule",
      suggestImprovements: "Suggest Improvements",
      healthCheck: "Health Check",
      focusSessions: "Focus Sessions",
      weeklyPlan: "Weekly Plan",
      timeBlocks: "Time Blocks",
      smartReminders: "Smart Reminders",
      taskPlaceholder: "Add a new task",
      focusModeBtn: "Focus",
      selectFocusTask: "Seleect",
      completed: "Completed",
      pending: "Pending",
      Clear: "Clear",
      notes: "Notes",
      subtasks: "Subtasks",
      saveNotes: "Save Notes",
      dataDetails: "Task Details",
      taskCompleted: "Task Completed",
      now: "Now",
      ideas: "XGem AI ",
      noTasks: "No tasks yet",
      noTasksDesc: "Add your first task to get started!",
      keyboardShortcuts: "Keyboard Shortcuts",
      pressEscToClose: "Press ESC to close",
      selectTaskWithArrows: "Select task with arrow keys",
      ctrlNNewTask: "Ctrl+N: New Task",
      ctrlHHome: "Ctrl+H: Home",
      ctrlSStats: "Ctrl+S: Statistics",
      ctrlCSettings: "Ctrl+Comma: Settings",
      completeSelected: "Complete selected task",
      deleteSelected: "Delete selected task",
      addTaskTitle: "Add a new task to your list",
      calendarTitle: "Calendar",
      taskDetails: "Task Details",
      taskTitlePlaceholder: "Task title",
      quickDatePicker: "Quick Date Picker",
      manageHoliday: "Manage Holidays",
      taskNotePlaceholder: "Add note",
      settings: "Settings",
      addHoliday: "Add Holiday",
      category: "Category",
      priority: "Priority",
      date: "Date",
      notSet: "Not set",
      quickAdd: "Quick Add",
      meeting: "🧑‍💻 Meeting",
      shopping: "🛍️ Shopping",
      workout: "🏋️‍♂️ Workout",
      study: "📚 Study",
      chooseCategory: "Choose Category",
      choosePriority: "Choose Priority",
      low: "Low",
      medium: "Medium",
      high: "High",
      urgent: "⏰ Urgent",
      sun: "Sun",
      mon: "Mon",
      tue: "Tue",
      wed: "Wed",
      thu: "Thu",
      fri: "Fri",
      sat: "Sat",
      statsTitle: "Track your productivity",
      totalTasks: "Total Tasks",
      completedTasks: "Completed",
      completionRate: "Completion Rate",
      beginner: "Beginner",
      pendingTasks: "Pending",
      completionProgress: "Completion Progress",
      productivityScore: "Productivity Score",
      categoryStats: "Category Statistics",
      addTaskTitle: "Add a new task to your list",
      taskDetails: "Task Details",
      taskTitlePlaceholder: "Task title",
      effortEstimation: "Effort Estimation",
      repeat: "Repeat",
      taskNotePlaceholder: "Add note",
      settings: "Settings",
      category: "Category",
      priority: "Priority",
      date: "Date",
      easy: "Easy",
      medium: "Medium",
      hard: "Hard",
      none: "None",
      daily: "Daily",
      weekly: "Weekly",
      monthly: "Monthly",
      voiceInput: "Voice Input",
      voiceNote: "Voice Note",
      notSet: "Not set",
      quickAdd: "Quick Add",
      meeting: "🤝 Meeting",
      workout: "🏋️‍♂️ Workout",
      productivityLevel: "Productivity",
      achievements: "Achievements",
      xp: "XP",
      tasksToNextLevel: "Complete {count} more tasks to level up!",
      maxLevel: "You've reached maximum level!",
      firstStep: "First Step",
      perfectWeek: "Perfect Week",
      taskMaster: "Task Master",
      speedDemon: "Speed Demon",
      earlyBird: "Early Bird",
      consistency: "Consistency",
      statsTitle: "Track your productivity",
      totalTasks: "Total Tasks",
      completionRate: "Completion Rate",
      productivityScore: "Productivity Score",
      categoryStats: "Category Statistics",
      appearanceTitle: "APPEARANCE",
      preferencesTitle: "PREFERENCES",
      language: "Language",
      languageDesc: "App language and region",
      defaultCategory: "Default Category",
      defaultCategoryDesc: "Set default task category",
      dataTitle: "DATA",
      exportData: "Export Data",
      exportDataDesc: "Backup your tasks",
      importData: "Import Data",
      importDataDesc: "Restore from backup",
      dangerZone: "DANGER ZONE",
      clearAllData: "Clear All Data",
      clearAllDataDesc: "Permanently delete all tasks",
      aboutTitle: "ABOUT",
      version: "Version",
      beta: "Beta",
      about: "About",
      aboutDesc: "Learn more about WarpTask",
      selectLanguage: "Select Language",
      useSystem: "Use System Language",
      systemLanguageDesc: "Follow your device settings",
      apply: "Apply",
      languageChanged: "Language changed successfully!",
      continue: "Continue",
      aiAssistantTitle: "AI Assistant",
      aiSubtitle: "Your intelligent task companion",
      messagePlaceholder: "Ask AI for help...",
      listening: "Listening...",
      aiIntelligence: "AI Intelligence",
      smartActions: "Smart Actions",
      analytics: "Analytics",
      productivity: "Productivity",
      habits: "Habits",
      // Smart Actions
      analyzeTasks: "Analyze Tasks",
      optimizeSchedule: "Optimize Schedule",
      suggestImprovements: "Suggest Improvements",

      healthCheck: "Health Check",
      focusSessions: "Focus Sessions",
      weeklyPlan: "Weekly Plan",
      timeBlocks: "Time Blocks",
      smartReminders: "Smart Reminders",
    },

    ru: {
      // Common
      save: "Сохранить",
      cancel: "Отмена",
      delete: "Удалить",
      edit: "Редактировать",
      add: "Добавить",
      complete: "Завершено",
      pending: "В ожидании",
      loading: "Загрузка...",
      error: "Ошибка",
      success: "Успешно",
      confirm: "Подтвердить",
      back: "Назад",
      next: "Далее",
      previous: "Назад",
      close: "Закрыть",
      all: "Все",
      personal: "🧩 Личное",
      work: "💼 Работа",
      shopping: "🛍️Покупки",
      housework: "🏠 Домашние дела",
      break: "🎮 Перерыв",
      wash: "🛁 Гигиена",
      health: "🫀Здоровье",
      sport: "🏋️‍♂️Спорт",
      study: "📚 Учеба",
      travel: "✈️ Путешествие",
      urgent: "⏰ Срочно",
      hobby: "🎨 Хобби",
      bed: "🛏️ Сон",
      food: "🥪 Еда",
      salah: "📿 Намаз",
      now: "Сейчас",

      // INDEX.HTML
      welcome: "Организуйте свою жизнь, одну задачу за раз",
      taskPlaceholder: "Добавить новую задачу",
      focusModeBtn: "Фокус",
      searchPlaceholder: "Поиск задачи...",
      completed: "Завершено",
      Clear: "Очистить",
      notes: "Заметки",
      subtasks: "Подзадачи",
      saveNotes: "Сохранить заметки",
      dataDetails: "Детали задачи",
      now: "Сейчас",
      taskCompleted: "Задача выполнена",
      ideas: "XGem AI",
      noTasks: "Нет задач",
      noTasksDesc: "Добавьте свою первую задачу!",
      keyboardShortcuts: "Горячие клавиши",
      pressEscToClose: "Нажмите ESC для закрытия",
      selectTaskWithArrows: "Выберите задачу стрелками",
      ctrlNNewTask: "Ctrl+N: Новая задача",
      ctrlHHome: "Ctrl+H: Главная",
      ctrlSStats: "Ctrl+S: Статистика",
      ctrlCSettings: "Ctrl+Запятая: Настройки",
      completeSelected: "Завершить выбранную задачу",
      deleteSelected: "Удалить выбранную задачу",

      // CALENDAR.HTML
      calendarTitle: "Календарь",
      selectedDate: "Выбранная дата",
      tasksForDate: "Задачи на выбранную дату",
      noDateSelected: "Выберите дату для просмотра задач",
      noTasksForDate: "Нет задач на эту дату",
      addHoliday: "Добавить праздник",
      today: "Сегодня",
      tomorrow: "Завтра",
      nextWeek: "Следующая неделя",
      setDate: "Установить дату",
      sun: "Вс",
      mon: "Пн",
      tue: "Вт",
      wed: "Ср",
      thu: "Чт",
      fri: "Пт",
      sat: "Сб",
      jan: "Янв",
      feb: "Фев",
      mar: "Мар",
      apr: "Апр",
      may: "Май",
      jun: "Июн",
      jul: "Июл",
      aug: "Авг",
      sep: "Сен",
      oct: "Окт",
      nov: "Ноя",
      dec: "Дек",
      addTaskForDate: "Добавить задачу на эту дату",
      prevMonth: "Предыдущий месяц",
      nextMonth: "Следующий месяц",
      prevYear: "Предыдущий год",
      nextYear: "Следующий год",
      quickDatePicker: "Быстрый выбор даты",
      manageHoliday: "Управление праздниками",

      // ADD.HTML
      addTaskTitle: "Добавить новую задачу в список",
      taskDetails: "Детали задачи",
      taskTitlePlaceholder: "Название задачи",
      taskNotePlaceholder: "Добавить заметку",
      effortEstimation: "Оценка усилий",
      repeat: "Повторить",
      settings: "Настройки",
      category: "Категория",
      priority: "Приоритет",
      date: "Дата",
      voiceInput: "Голосовой ввод",
      voiceNote: "Голосовая заметка",
      notSet: "Не установлено",
      quickAdd: "Быстрое добавление",
      meeting: "🤝  Встреча",
      shopping: "🛍️ Покупки",
      workout: "🏋️‍♂️ Тренировка",
      study: "📚 Учеба",
      chooseCategory: "Выберите категорию",
      choosePriority: "Выберите приоритет",
      low: "Низкий",
      medium: "Средний",
      high: "Высокий",
      easy: "Легко",
      hard: "Сложно",
      none: "Нет",
      daily: "Ежедневно",
      weekly: "Еженедельно",
      monthly: "Ежемесячно",

      urgent: "⏰ Срочно",

      // STATS.HTML
      productivityLevel: "Продуктивности",
      achievements: "Достижения",
      xp: "Опыт",
      beginner: "Новичок",
      tasksToNextLevel: "Выполните еще {count} задач для повышения уровня!",
      maxLevel: "Вы достигли максимального уровня!",
      firstStep: "Первый шаг",
      perfectWeek: "Идеальная неделя",
      taskMaster: "Мастер задач",
      speedDemon: "Скоростной демон",
      earlyBird: "Ранняя пташка",
      consistency: "Последовательность",
      statsTitle: "Отслеживайте свою продуктивность",
      totalTasks: "Всего задач",
      completedTasks: "Завершено",
      completionRate: "Процент выполнения",
      pendingTasks: "В ожидании",
      completionProgress: "Прогресс выполнения",
      productivityScore: "Оценка продуктивности",
      categoryStats: "Статистика по категориям",

      // Ai Assistant
      aiAssistantTitle: "AI помощник",
      aiSubtitle: "Ваш интеллектуальный помощник по задачам",
      messagePlaceholder: "Спросите AI о помощи...",
      listening: "Прослушивание...",
      aiProfile: "Профиль AI",
      aiProfileDesc: "Настройки и информация вашего AI-профиля",
      enableAI: "Включить AI",
      enableAIDesc: "Активируйте AI для помощи и подсказок",
      apiKey: "API ключ",
      apiKeyNotSet: "API ключ не установлен",

      // Intel Panel
      aiIntelligence: "AI интеллект",
      smartActions: "Умные действия",
      analytics: "Аналитика",
      productivity: "Продуктивность",
      habits: "Привычки",

      // Smart Actions
      analyzeTasks: "Анализ задач",
      optimizeSchedule: "Оптимизация расписания",
      suggestImprovements: "Предложить улучшения",
      healthCheck: "Проверка здоровья",
      focusSessions: "Сессии фокуса",
      weeklyPlan: "Еженедельный план",
      timeBlocks: "Временные блоки",
      smartReminders: "Умные напоминания",
    },

    uz: {
      // Common
      save: "Saqlash",
      cancel: "Bekor qilish",
      delete: "O'chirish",
      edit: "Tahrirlash",
      add: "Qo'shish",
      complete: "Tugallangan",
      pending: "Kutilmoqda",
      loading: "Yuklanmoqda...",
      error: "Xato",
      success: "Muvaffaqiyatli",
      confirm: "Tasdiqlash",
      back: "Orqaga",
      next: "Keyingi",
      previous: "Oldingi",
      close: "Yopish",
      now: "Hozir",
      // Categories
      all: "Hammasi",
      personal: "🧩 Shaxsiy",
      work: "💼 Ish",
      shopping: "🛍️ Xarid",
      break: "🎮 Tanaffus",
      wash: "🛁 Gigiena",
      health: "🫀 Sog'liq",
      sport: "🏋️‍♂️ Sport",
      study: "📚 O'qish",
      travel: "✈️ Sayohat",
      urgent: "⏰ Shoshilinch",
      hobby: "🎨 Hobbi",
      bed: "🛏️ Uyqu",
      food: "🥪 Ovqat",
      salah: "📿 Namoz",
      housework: "🏠 Uy ishlari",

      // INDEX.HTML
      welcome: "Hayotingizni tartibga soling, har bir vazifa bilan",
      taskPlaceholder: "Yangi vazifa qo'shish",
      focusModeBtn: "Diqqatni jamlash",
      completed: "Tugallangan",
      notes: "Eslatmalar",
      subtasks: "Kichik vazifalar",
      saveNotes: "Eslatmalarni saqlash",
      dataDetails: "Vazifa tafsilotlari",
      now: "Hozir",
      ideas: "XGem AI",
      searchPlaceholder: "Vazifani qidirish...",
      taskCompleted: "Vazifa bajarildi",
      Clear: "Tozalash",
      noTasks: "Hozircha vazifalar yo'q",
      noTasksDesc: "Birinchi vazifangizni qo'shing!",
      keyboardShortcuts: "Tez tugmalar",
      pressEscToClose: "Yopish uchun ESC ni bosing",
      selectTaskWithArrows: "Vazifani strelkalar bilan tanlang",
      ctrlNNewTask: "Ctrl+N: Yangi vazifa",
      ctrlHHome: "Ctrl+H: Bosh sahifa",
      ctrlSStats: "Ctrl+S: Statistika",
      ctrlCSettings: "Ctrl+Vergul: Sozlamalar",
      completeSelected: "Tanlangan vazifani tugatish",
      deleteSelected: "Tanlangan vazifani o'chirish",

      // CALENDAR.HTML
      calendarTitle: "Kalendar",
      selectedDate: "Tanlangan sana",
      tasksForDate: "Tanlangan sana uchun vazifalar",
      noDateSelected: "Vazifalarni ko'rish uchun sana tanlang",
      noTasksForDate: "Bu sana uchun vazifalar yo'q",
      quickDatePicker: "Tezkor sana tanlash",
      manageHoliday: "Bayramlarni boshqarish",
      addHoliday: "Bayram qo'shish",
      today: "Bugun",
      tomorrow: "Ertaga",
      nextWeek: "Keyingi hafta",
      setDate: "Sana belgilash",
      sun: "Yak",
      mon: "Dush",
      tue: "Sesh",
      wed: "Chor",
      thu: "Pay",
      fri: "Jum",
      sat: "Shan",
      jan: "Yan",
      feb: "Fev",
      mar: "Mar",
      apr: "Apr",
      may: "May",
      jun: "Iyun",
      jul: "Iyul",
      aug: "Avg",
      sep: "Sen",
      oct: "Okt",
      nov: "Noy",
      dec: "Dek",
      addTaskForDate: "Bu sana uchun vazifa qo'shish",
      prevMonth: "Oldingi oy",
      nextMonth: "Keyingi oy",
      prevYear: "Oldingi yil",
      nextYear: "Keyingi yil",

      // ADD.HTML
      addTaskTitle: "Ro'yxatingizga yangi vazifa qo'shing",
      taskDetails: "Vazifa tafsilotlari",
      taskTitlePlaceholder: "Vazifa sarlavhasi",
      taskNotePlaceholder: "Izoh qo'shish",
      effortEstimation: "Harakatni baholash",
      repeat: "Takrorlash",
      settings: "Sozlamalar",
      category: "Toifa",
      priority: "Ustuvorlik",
      date: "Sana",
      voiceInput: "Ovozli kiritish",
      voiceNote: "Ovozli eslatma",
      notSet: "Belgilanmagan",
      quickAdd: "Tez qo'shish",
      meeting: "🤝 Uchrashuv",
      shopping: "🛍️ Xarid",
      workout: "🏋️‍♂️ Mashq",
      study: "📚 O'qish",
      chooseCategory: "Toifani tanlang",
      choosePriority: "Ustuvorlikni tanlang",
      low: "Past",
      medium: "O'rtacha",
      high: "Yuqori",
      easy: "Oson",
      hard: "Qiyin",
      none: "Yo‘q",
      daily: "Har kuni",
      weekly: "Har hafta",
      monthly: "Har oy",
      urgent: "⏰ Shoshilinch",

      // STATS.HTML

      productivityLevel: "Ish Unumdorligi",
      achievements: "Yutuqlar",
      xp: "XP",
      beginner: "Boshlovchi",
      tasksToNextLevel:
        "Daraja ko'tarish uchun yana {count} ta vazifa bajaring!",
      maxLevel: "Siz maksimal darajaga yetdingiz!",
      firstStep: "Birinchi qadam",
      perfectWeek: "Mukammal hafta",
      taskMaster: "Vazifa ustasi",
      speedDemon: "Tezlik demoni",
      earlyBird: "Erqon qush",
      consistency: "Izchillik",
      statsTitle: "Ish unumdorligingizni kuzating",
      totalTasks: "Jami vazifalar",
      completedTasks: "Tugallangan",
      completionRate: "Tugallash darajasi",
      pendingTasks: "Kutilmoqda",
      completionProgress: "Tugallash jarayoni",
      productivityScore: "Ish unumdorligi balli",
      categoryStats: "Toifa statistikasi",

      // ABOUT TEXT
      aboutText:
        "WarpTask v0.0.21\n\nIOS uslubidagi chiroyli vazifa boshqarish ilovasi.\n\nXususiyatlari:\n• Vazifalarni qo'shish va boshqarish\n• Ish unumdorligiga e'tibor qaratish\n• Vazifalarni toifalash\n• Kalendar ko'rinishi\n• Statistikalar va tahlillar\n• Qorong'u rejimni qo'llab-quvvatlash\n• Ko'p tilli qo'llab-quvvatlash\n\nWarpTasks-dan foydalanganingiz uchun rahmat! ❤️",

      // Ai Assistant
      aiAssistantTitle: "AI yordamchisi",
      aiSubtitle: "Sizning aqlli vazifa hamkoringiz",
      messagePlaceholder: "AI dan yordam so'rang...",
      listening: "Eshitilmoqda...",

      // Intel Panel
      aiIntelligence: "AI intellekti",
      smartActions: "Aqlli harakatlar",
      analytics: "Tahlillar",
      productivity: "Ish unumdorligi",
      habits: "Odatlar",

      // Smart Actions
      analyzeTasks: "Vazifalarni tahlil qilish",
      optimizeSchedule: "Jadvalni optimallashtirish",
      suggestImprovements: "Takomillashtirishlarni taklif qilish",

      healthCheck: "Sog'liqni tekshirish",
      focusSessions: "Diqqat sessiyalari",
      weeklyPlan: "Haftalik reja",
      timeBlocks: "Vaqt bloklari",
      smartReminders: "Aqlli eslatmalar",
    },
  },

  // Tizimni ishga tushirish
  init() {
    // LocalStorage dan tilni olish
    this.currentLang = localStorage.getItem("wzCurrentLanguage") || "en";

    // HTML til atributini o'rnatish
    document.documentElement.lang = this.currentLang;

    // Sahifani tarjima qilish
    this.translatePage();

    // Til o'zgarishini kuzatish
    this.setupListeners();
  },

  // Sahifani tarjima qilish
  translatePage() {
    // Barcha data-i18n elementlarini topish
    const elements = document.querySelectorAll("[data-i18n]");

    elements.forEach((element) => {
      const key = element.getAttribute("data-i18n");
      const text =
        this.translations[this.currentLang]?.[key] ||
        this.translations["en"][key] ||
        key;

      if (element.hasAttribute("placeholder")) {
        element.setAttribute("placeholder", text);
      } else if (element.hasAttribute("title")) {
        element.setAttribute("title", text);
      } else if (element.tagName === "TITLE") {
        document.title = text;
      } else {
        element.textContent = text;
      }
    });
  },

  // Til o'zgarishini kuzatish
  setupListeners() {
    // Storage o'zgarishlari
    window.addEventListener("storage", (e) => {
      if (e.key === "wzCurrentLanguage") {
        this.currentLang = e.newValue;
        location.reload();
      }
    });

    // BroadcastChannel (agar mavjud bo'lsa)
    if (typeof BroadcastChannel !== "undefined") {
      const channel = new BroadcastChannel("warp_language");
      channel.onmessage = (e) => {
        if (e.data.type === "language_change") {
          this.currentLang = e.data.language;
          location.reload();
        }
      };
    }
  },

  // Tilni o'zgartirish
  setLanguage(lang) {
    if (this.translations[lang]) {
      // LocalStorage ga saqlash
      localStorage.setItem("wzCurrentLanguage", lang);
      this.currentLang = lang;

      // Broadcast qilish
      if (typeof BroadcastChannel !== "undefined") {
        const channel = new BroadcastChannel("warp_language");
        channel.postMessage({
          type: "language_change",
          language: lang,
        });
      }

      // Sahifani yangilash
      location.reload();
    }
  },

  // Matnni olish
  getText(key) {
    return (
      this.translations[this.currentLang]?.[key] ||
      this.translations["en"][key] ||
      key
    );
  },
};

// Sahifa yuklanganda ishga tushirish
document.addEventListener("DOMContentLoaded", () => {
  LanguageManager.init();
});

// Global function
function changeLanguage(lang) {
  LanguageManager.setLanguage(lang);
}
