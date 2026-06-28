// js/avatar.js - Ikonka asosidagi avatar tizimi

const AvatarSystem = {
  // Ranglar mapping
  colors: {
    blue: "#007AFF",
    green: "#34C759",
    red: "#FF3B30",
    yellow: "#FFCC00",
    purple: "#AF52DE",
    orange: "#FF9500",
    teal: "#5AC8FA",
    pink: "#FF2D55",
    indigo: "#5856D6",
  },

  // Default avatarlar ro'yxati
  defaultAvatars: [
    { id: "avatar1", icon: "fa-user", color: "blue", name: "User" },
    { id: "avatar2", icon: "fa-smile", color: "green", name: "Smile" },
    { id: "avatar3", icon: "fa-ghost", color: "red", name: "Ghost" },
    { id: "avatar4", icon: "fa-crown", color: "yellow", name: "Crown" },
    { id: "avatar5", icon: "fa-cat", color: "purple", name: "Cat" },
    { id: "avatar6", icon: "fa-apple-whole", color: "orange", name: "Apple" },
    { id: "avatar7", icon: "fa-star", color: "teal", name: "Star" },
    { id: "avatar8", icon: "fa-heart", color: "pink", name: "Heart" },
    { id: "avatar9", icon: "fa-bolt", color: "indigo", name: "Bolt" },
  ],

  // Avatar ma'lumotlarini yuklash
  loadUserAvatar: function () {
    try {
      // 1. Asosiy user ma'lumotlaridan o'qish
      const user = JSON.parse(localStorage.getItem("wzCurrentUser"));
      if (user && user.avatarType) {
        return {
          type: user.avatarType,
          id: user.avatarId || "avatar1",
          icon: user.avatarIcon || "fa-user",
          color: user.avatarColor || "blue",
        };
      }

      // 2. Eski format - wzUserAvatar
      const savedAvatar = localStorage.getItem("wzUserAvatar");
      if (savedAvatar) {
        return JSON.parse(savedAvatar);
      }
    } catch (e) {
      console.error("Avatar yuklashda xato:", e);
    }

    // Default avatar
    return {
      type: "default",
      id: "avatar1",
      icon: "fa-user",
      color: "blue",
    };
  },

  // Avatar ikonkasini yaratish
  createAvatarElement: function (avatar, size = 33) {
    const avatarData = avatar || this.loadUserAvatar();
    const bgColor = this.colors[avatarData.color] || this.colors.blue;

    const div = document.createElement("div");
    div.className = "avatar-icon";
    div.setAttribute("data-avatar-id", avatarData.id);
    div.setAttribute("data-avatar-type", avatarData.type);
    div.setAttribute("data-avatar-icon", avatarData.icon);
    div.setAttribute("data-avatar-color", avatarData.color);

    div.style.cssText = `
 width: 38px;
height: 38px;
border-radius: 50%;
background: ${bgColor};

display: flex;
align-items: center;
justify-content: center;

color: white;
font-size: 21px;
line-height: 1;

border: none;
box-sizing: border-box;

box-shadow: 0 2px 4px rgba(0, 0, 0, 0.25),
            inset 0 1px 1px rgba(255, 255, 255, 0.35),
            inset 0 -1px 2px rgba(0, 0, 0, 0.25);

cursor: pointer;
transition: all 0.3s ease;
       
`;

    const icon = document.createElement("i");
    icon.className = `fas ${avatarData.icon}`;
    div.appendChild(icon);

    return div;
  },

  // User nomini olish
  getUserName: function () {
    try {
      const user = JSON.parse(localStorage.getItem("wzCurrentUser"));
      if (user && user.displayName) {
        return user.displayName;
      }
      if (user && user.username) {
        return user.username;
      }

      // Eski formatlar
      const savedUser = JSON.parse(localStorage.getItem("authUser"));
      if (savedUser && savedUser.displayName) {
        return savedUser.displayName;
      }
    } catch (e) {}

    return "User";
  },

  // Avatar o'zgarishini kuzatish
  watchAvatarChanges: function (callback) {
    const handleStorageChange = (e) => {
      if (
        e.key === "wzCurrentUser" ||
        e.key === "wzUserAvatar" ||
        e.key === "wzAvatarRefresh"
      ) {
        callback();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("avatar-updated", callback);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("avatar-updated", callback);
    };
  },

  // Avatar o'zgarganligi haqida xabar berish
  notifyAvatarChange: function () {
    localStorage.setItem("wzAvatarRefresh", Date.now().toString());
    window.dispatchEvent(new CustomEvent("avatar-updated"));
  },

  // Avatar ma'lumotlarini saqlash
  saveAvatar: function (avatarData) {
    try {
      let user = JSON.parse(localStorage.getItem("wzCurrentUser")) || {};

      user.avatarType = avatarData.type;
      user.avatarId = avatarData.id;
      user.avatarIcon = avatarData.icon;
      user.avatarColor = avatarData.color;

      if (!user.displayName) user.displayName = "User";
      if (!user.username) user.username = "@user";
      if (!user.email) user.email = "user@example.com";

      localStorage.setItem("wzCurrentUser", JSON.stringify(user));

      // Eski format uchun
      localStorage.setItem(
        "wzUserAvatar",
        JSON.stringify({
          type: avatarData.type,
          id: avatarData.id,
          icon: avatarData.icon,
          color: avatarData.color,
        }),
      );

      this.notifyAvatarChange();
      return true;
    } catch (e) {
      console.error("Avatar saqlashda xato:", e);
      return false;
    }
  },
};

// ==================== INDEX.HTTP UCHUN FUNKSIYALAR ====================

// Home page avatarini yangilash
function updateHomeAvatar() {
  const homeUserDiv = document.querySelector(".home-user");
  if (!homeUserDiv) return;

  const oldAvatar = document.getElementById("homeAvatar");
  const nameSpan = document.getElementById("homeName");

  // Userni yangilash
  if (nameSpan) {
    nameSpan.textContent = AvatarSystem.getUserName();
  }

  // Avatarni yangilash
  if (oldAvatar) {
    const avatar = AvatarSystem.loadUserAvatar();
    const newAvatar = AvatarSystem.createAvatarElement(avatar, 40);
    newAvatar.id = "homeAvatar";
    newAvatar.onclick = function (e) {
      e.stopPropagation();
      window.location.href = "settings.html";
    };
    oldAvatar.replaceWith(newAvatar);
  }
}

// ==================== SETTINGS.HTML UCHUN FUNKSIYALAR ====================

// Settings page avatar previewni yangilash
function updateSettingsAvatarPreview(avatar) {
  const previewSmall = document.getElementById("avatarPreview");
  const previewLarge = document.getElementById("avatarPreviewLarge");
  const previewIcon = document.getElementById("avatarPreviewIcon");
  const previewImage = document.getElementById("avatarPreviewImage");

  if (!previewSmall || !previewLarge) return;

  const bgColor = AvatarSystem.colors[avatar.color] || AvatarSystem.colors.blue;

  // Small preview
  previewSmall.innerHTML = `<i class="fas ${avatar.icon}"></i>`;
  previewSmall.style.background = bgColor;
  previewSmall.style.display = "flex";
  previewSmall.style.alignItems = "center";
  previewSmall.style.justifyContent = "center";

  // Large preview
  previewLarge.innerHTML = `<i class="fas ${avatar.icon}" style="font-size: 48px; color: white;"></i>`;
  previewLarge.style.background = bgColor;
  previewLarge.style.border = "4px solid var(--ios-blue)";
  previewLarge.style.display = "flex";
  previewLarge.style.alignItems = "center";
  previewLarge.style.justifyContent = "center";

  if (previewIcon) previewIcon.style.display = "none";
  if (previewImage) previewImage.style.display = "none";
}

// Settings page avatar optionsni to'ldirish
function populateAvatarOptions(selectedAvatar) {
  const container = document.getElementById("avatarOptions");
  if (!container) return;

  container.innerHTML = "";

  AvatarSystem.defaultAvatars.forEach((avatar) => {
    const option = document.createElement("div");
    option.className = "avatar-option";
    option.dataset.id = avatar.id;
    option.dataset.icon = avatar.icon;
    option.dataset.color = avatar.color;

    const isSelected = selectedAvatar && selectedAvatar.id === avatar.id;

    option.style.cssText = `
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: ${AvatarSystem.colors[avatar.color]};
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s ease;
            border: ${isSelected ? "3px solid white" : "2px solid transparent"};
            box-shadow: ${isSelected ? "0 0 0 3px rgba(0,122,255,0.3)" : "none"};
        `;

    option.innerHTML = `<i class="fas ${avatar.icon}" style="font-size: 24px; color: white;"></i>`;

    option.onclick = function () {
      document.querySelectorAll(".avatar-option").forEach((opt) => {
        opt.style.border = "2px solid transparent";
        opt.style.boxShadow = "none";
      });
      this.style.border = "3px solid white";
      this.style.boxShadow = "0 0 0 3px rgba(0,122,255,0.3)";

      if (window.selectAvatar) {
        window.selectAvatar("default", avatar.id, avatar.icon, avatar.color);
      }
    };

    container.appendChild(option);
  });
}

// ==================== SAHIFA YUKLANGANDA ISHGA TUSHIRISH ====================

document.addEventListener("DOMContentLoaded", function () {
  // Index.html uchun
  if (document.querySelector(".home-user")) {
    updateHomeAvatar();

    // Avatar o'zgarishini kuzatish
    AvatarSystem.watchAvatarChanges(() => {
      updateHomeAvatar();
    });
  }

  // Settings.html uchun
  if (document.getElementById("avatarModal")) {
    // AvatarSystem mavjudligini tekshirish
    console.log("AvatarSystem loaded for settings");
  }
});

// Global funksiyalar
window.AvatarSystem = AvatarSystem;
