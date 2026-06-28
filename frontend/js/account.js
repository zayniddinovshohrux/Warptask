// ==================== ACCOUNT SETTINGS FUNCTIONS ====================

// Avatar system
const defaultAvatars = [
  { icon: 'fas fa-user', color: 'avatar-blue', id: 'avatar1' },
  { icon: 'fas fa-robot', color: 'avatar-green', id: 'avatar2' },
  { icon: 'fas fa-crown', color: 'avatar-red', id: 'avatar3' },
  { icon: 'fas fa-moon', color: 'avatar-purple', id: 'avatar4' },
  { icon: 'fas fa-sun', color: 'avatar-orange', id: 'avatar5' },
  { icon: 'fas fa-star', color: 'avatar-yellow', id: 'avatar6' },
  { icon: 'fas fa-heart', color: 'avatar-pink', id: 'avatar7' },
  { icon: 'fas fa-bolt', color: 'avatar-teal', id: 'avatar8' },
  { icon: 'fas fa-rocket', color: 'avatar-indigo', id: 'avatar9' }
];

let selectedAvatar = null;
let uploadedAvatar = null;

// Load account settings
function loadAccountSettings() {
  const user = auth.getCurrentUser();
  if (!user) return;
  
  // Load display name
  const displayName = user.displayName || user.username || 'User';
  document.getElementById('displayNameValue').textContent = displayName;
  document.getElementById('displayNameDesc').textContent = displayName;
  
  // Load username
  document.getElementById('usernameValue').textContent = '@' + user.username;
  document.getElementById('usernameDesc').textContent = '@' + user.username;
  
  // Load email
  document.getElementById('emailValue').textContent = user.email;
  document.getElementById('emailDesc').textContent = user.email;
  
  // Load avatar
  loadUserAvatar(user);
  
  // Load sync setting
  const syncEnabled = localStorage.getItem('wzAccountSync') !== 'false';
  document.getElementById('accountSyncToggle').checked = syncEnabled;
}

// Load user avatar
function loadUserAvatar(user) {
  const avatarPreview = document.getElementById('avatarPreview');
  const avatarType = user.avatarType || 'default';
  const avatarId = user.avatarId || 'avatar1';
  
  if (avatarType === 'custom' && user.avatarData) {
    // Custom uploaded avatar
    avatarPreview.innerHTML = `<img src="${user.avatarData}" alt="Avatar">`;
    selectedAvatar = { type: 'custom', data: user.avatarData };
  } else {
    // Default avatar
    const avatar = defaultAvatars.find(a => a.id === avatarId) || defaultAvatars[0];
    avatarPreview.innerHTML = `<i class="${avatar.icon}"></i>`;
    avatarPreview.style.background = `var(--ios-${avatar.color.replace('avatar-', '')})`;
    selectedAvatar = { type: 'default', id: avatar.id };
  }
}

// Open avatar selector
function openAvatarSelector() {
  if (!auth.isLoggedIn()) {
    showToast(translations[currentLanguage]["loginRequired"] || "Please log in to change avatar");
    return;
  }
  
  const modal = document.getElementById('avatarModal');
  const avatarOptions = document.getElementById('avatarOptions');
  const user = auth.getCurrentUser();
  
  // Clear existing options
  avatarOptions.innerHTML = '';
  
  // Add default avatar options
  defaultAvatars.forEach(avatar => {
    const isSelected = selectedAvatar && selectedAvatar.type === 'default' && selectedAvatar.id === avatar.id;
    const avatarElement = document.createElement('div');
    avatarElement.className = `avatar-option ${avatar.color} ${isSelected ? 'selected' : ''}`;
    avatarElement.dataset.avatarId = avatar.id;
    avatarElement.innerHTML = `<i class="${avatar.icon}"></i>`;
    avatarElement.onclick = () => selectDefaultAvatar(avatar.id);
    avatarOptions.appendChild(avatarElement);
  });
  
  // Update preview
  updateAvatarPreview();
  
  // Setup file upload
  document.getElementById('avatarUpload').onchange = handleAvatarUpload;
  
  // Show modal
  modal.style.display = 'flex';
  updateModalTranslations();
}

// Select default avatar
function selectDefaultAvatar(avatarId) {
  const avatar = defaultAvatars.find(a => a.id === avatarId);
  if (!avatar) return;
  
  selectedAvatar = { type: 'default', id: avatarId };
  uploadedAvatar = null;
  
  // Update UI
  document.querySelectorAll('.avatar-option').forEach(opt => {
    opt.classList.remove('selected');
  });
  document.querySelector(`.avatar-option[data-avatar-id="${avatarId}"]`).classList.add('selected');
  
  updateAvatarPreview();
}

// Handle avatar upload
function handleAvatarUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  // Validate file
  const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (!validTypes.includes(file.type)) {
    showToast(translations[currentLanguage]["invalidImage"] || "Please upload a JPG, PNG or GIF image");
    return;
  }
  
  if (file.size > 2 * 1024 * 1024) { // 2MB
    showToast(translations[currentLanguage]["imageTooLarge"] || "Image must be less than 2MB");
    return;
  }
  
  const reader = new FileReader();
  reader.onload = function(e) {
    uploadedAvatar = e.target.result;
    selectedAvatar = { type: 'custom', data: uploadedAvatar };
    
    // Clear default avatar selection
    document.querySelectorAll('.avatar-option').forEach(opt => {
      opt.classList.remove('selected');
    });
    
    updateAvatarPreview();
  };
  reader.readAsDataURL(file);
}

// Update avatar preview
function updateAvatarPreview() {
  const previewIcon = document.getElementById('avatarPreviewIcon');
  const previewImage = document.getElementById('avatarPreviewImage');
  const previewLarge = document.getElementById('avatarPreviewLarge');
  
  if (selectedAvatar.type === 'custom' && selectedAvatar.data) {
    previewIcon.style.display = 'none';
    previewImage.src = selectedAvatar.data;
    previewImage.style.display = 'block';
    previewLarge.style.background = 'transparent';
  } else {
    const avatar = defaultAvatars.find(a => a.id === selectedAvatar.id) || defaultAvatars[0];
    previewIcon.className = avatar.icon;
    previewIcon.style.display = 'block';
    previewImage.style.display = 'none';
    previewLarge.className = `avatar-preview-large ${avatar.color}`;
  }
}

// Save avatar
async function saveAvatar() {
  const user = auth.getCurrentUser();
  if (!user) return;
  
  const saveBtn = document.getElementById('saveAvatarBtn');
  saveBtn.disabled = true;
  saveBtn.classList.add('loading');
  
  try {
    // Update user data
    user.avatarType = selectedAvatar.type;
    
    if (selectedAvatar.type === 'default') {
      user.avatarId = selectedAvatar.id;
      delete user.avatarData;
    } else {
      user.avatarData = selectedAvatar.data;
      delete user.avatarId;
    }
    
    // Save to localStorage
    auth.saveUser(user);
    
    // Update UI
    loadUserAvatar(user);
    
    // Show success
    setTimeout(() => {
      closeAvatarModal();
      showSuccessModal(
        translations[currentLanguage]["avatarUpdated"] || "Avatar Updated",
        translations[currentLanguage]["avatarUpdatedDesc"] || "Your profile picture has been updated successfully."
      );
    }, 500);
    
  } catch (error) {
    showToast(translations[currentLanguage]["error"] + ": " + error.message);
  } finally {
    saveBtn.disabled = false;
    saveBtn.classList.remove('loading');
  }
}

// Close avatar modal
function closeAvatarModal() {
  document.getElementById('avatarModal').style.display = 'none';
  document.getElementById('avatarUpload').value = '';
}

// Change display name
function changeDisplayName() {
  if (!auth.isLoggedIn()) {
    showToast(translations[currentLanguage]["loginRequired"] || "Please log in to change display name");
    return;
  }
  
  const user = auth.getCurrentUser();
  const modal = document.getElementById('displayNameModal');
  
  // Set current values
  document.getElementById('currentDisplayNameText').textContent = user.displayName || user.username;
  document.getElementById('displayNameInput').value = user.displayName || '';
  document.getElementById('displayNameError').textContent = '';
  
  // Show modal
  modal.style.display = 'flex';
  updateModalTranslations();
  
  // Focus input
  setTimeout(() => {
    document.getElementById('displayNameInput').focus();
  }, 300);
}

// Validate display name
function validateDisplayName(name) {
  if (!name.trim()) {
    return { valid: false, error: translations[currentLanguage]["displayNameRequired"] || "Display name is required" };
  }
  
  if (name.length > 30) {
    return { valid: false, error: translations[currentLanguage]["displayNameTooLong"] || "Display name must be 30 characters or less" };
  }
  
  return { valid: true };
}

// Save display name
async function saveDisplayName() {
  const newDisplayName = document.getElementById('displayNameInput').value.trim();
  const validation = validateDisplayName(newDisplayName);
  const errorElement = document.getElementById('displayNameError');
  const saveBtn = document.getElementById('saveDisplayNameBtn');
  
  if (!validation.valid) {
    errorElement.textContent = validation.error;
    errorElement.classList.add('show');
    return;
  }
  
  errorElement.classList.remove('show');
  saveBtn.disabled = true;
  saveBtn.classList.add('loading');
  
  try {
    const user = auth.getCurrentUser();
    if (!user) throw new Error("User not found");
    
    // Update user
    user.displayName = newDisplayName;
    auth.saveUser(user);
    
    // Update UI
    loadAccountSettings();
    
    // Show success
    setTimeout(() => {
      closeDisplayNameModal();
      showSuccessModal(
        translations[currentLanguage]["displayNameUpdated"] || "Display Name Updated",
        translations[currentLanguage]["displayNameUpdatedDesc"] || "Your display name has been updated successfully."
      );
    }, 500);
    
  } catch (error) {
    errorElement.textContent = error.message;
    errorElement.classList.add('show');
  } finally {
    saveBtn.disabled = false;
    saveBtn.classList.remove('loading');
  }
}

// Close display name modal
function closeDisplayNameModal() {
  document.getElementById('displayNameModal').style.display = 'none';
}

// Change username
function changeUsername() {
  if (!auth.isLoggedIn()) {
    showToast(translations[currentLanguage]["loginRequired"] || "Please log in to change username");
    return;
  }
  
  const user = auth.getCurrentUser();
  const modal = document.getElementById('usernameModal');
  
  // Set current values
  document.getElementById('currentUsernameText').textContent = '@' + user.username;
  document.getElementById('usernameInput').value = user.username;
  document.getElementById('usernameError').textContent = '';
  
  // Show modal
  modal.style.display = 'flex';
  updateModalTranslations();
  
  // Setup validation
  document.getElementById('usernameInput').oninput = validateUsernameInput;
  
  // Focus input
  setTimeout(() => {
    document.getElementById('usernameInput').focus();
  }, 300);
}

// Validate username input
function validateUsernameInput() {
  const username = document.getElementById('usernameInput').value.trim();
  const errorElement = document.getElementById('usernameError');
  const saveBtn = document.getElementById('saveUsernameBtn');
  
  // Basic validation
  if (!username) {
    errorElement.textContent = translations[currentLanguage]["usernameRequired"] || "Username is required";
    errorElement.classList.add('show');
    saveBtn.disabled = true;
    return;
  }
  
  if (!auth.validateUsername(username)) {
    errorElement.textContent = translations[currentLanguage]["usernameInvalid"] || "3-20 characters, letters, numbers, underscores only";
    errorElement.classList.add('show');
    saveBtn.disabled = true;
    return;
  }
  
  const currentUser = auth.getCurrentUser();
  if (username === currentUser.username) {
    errorElement.textContent = translations[currentLanguage]["usernameSame"] || "This is already your username";
    errorElement.classList.add('show');
    saveBtn.disabled = true;
    return;
  }
  
  // Check if username exists (simulate async check)
  const allUsers = JSON.parse(localStorage.getItem('wzUsers') || '[]');
  const usernameExists = allUsers.some(u => u.username === username && u.id !== currentUser.id);
  
  if (usernameExists) {
    errorElement.textContent = translations[currentLanguage]["usernameTaken"] || "Username already taken";
    errorElement.classList.add('show');
    saveBtn.disabled = true;
    return;
  }
  
  errorElement.classList.remove('show');
  saveBtn.disabled = false;
}

// Save username
async function saveUsername() {
  const newUsername = document.getElementById('usernameInput').value.trim();
  const errorElement = document.getElementById('usernameError');
  const saveBtn = document.getElementById('saveUsernameBtn');
  
  // Final validation
  if (!auth.validateUsername(newUsername)) {
    errorElement.textContent = translations[currentLanguage]["usernameInvalid"] || "3-20 characters, letters, numbers, underscores only";
    errorElement.classList.add('show');
    return;
  }
  
  saveBtn.disabled = true;
  saveBtn.classList.add('loading');
  
  try {
    const user = auth.getCurrentUser();
    if (!user) throw new Error("User not found");
    
    // Check username availability
    const allUsers = JSON.parse(localStorage.getItem('wzUsers') || '[]');
    const usernameExists = allUsers.some(u => u.username === newUsername && u.id !== user.id);
    
    if (usernameExists) {
      throw new Error(translations[currentLanguage]["usernameTaken"] || "Username already taken");
    }
    
    // Update user
    user.username = newUsername;
    auth.saveUser(user);
    
    // Update all users list
    const updatedUsers = allUsers.map(u => 
      u.id === user.id ? user : u
    );
    localStorage.setItem('wzUsers', JSON.stringify(updatedUsers));
    
    // Update UI
    loadAccountSettings();
    
    // Show success
    setTimeout(() => {
      closeUsernameModal();
      showSuccessModal(
        translations[currentLanguage]["usernameUpdated"] || "Username Updated",
        translations[currentLanguage]["usernameUpdatedDesc"] || "Your username has been updated successfully."
      );
    }, 500);
    
  } catch (error) {
    errorElement.textContent = error.message;
    errorElement.classList.add('show');
  } finally {
    saveBtn.disabled = false;
    saveBtn.classList.remove('loading');
  }
}

// Close username modal
function closeUsernameModal() {
  document.getElementById('usernameModal').style.display = 'none';
}

// Change email
function changeEmail() {
  if (!auth.isLoggedIn()) {
    showToast(translations[currentLanguage]["loginRequired"] || "Please log in to change email");
    return;
  }
  
  const user = auth.getCurrentUser();
  const modal = document.getElementById('emailModal');
  
  // Set current values
  document.getElementById('currentEmailText').textContent = user.email;
  document.getElementById('emailInput').value = '';
  document.getElementById('confirmEmailInput').value = '';
  document.getElementById('emailError').textContent = '';
  document.getElementById('confirmEmailError').textContent = '';
  
  // Show modal
  modal.style.display = 'flex';
  updateModalTranslations();
  
  // Setup validation
  document.getElementById('emailInput').oninput = validateEmailInput;
  document.getElementById('confirmEmailInput').oninput = validateEmailInput;
  
  // Focus input
  setTimeout(() => {
    document.getElementById('emailInput').focus();
  }, 300);
}

// Validate email input
function validateEmailInput() {
  const email = document.getElementById('emailInput').value.trim();
  const confirmEmail = document.getElementById('confirmEmailInput').value.trim();
  const emailError = document.getElementById('emailError');
  const confirmError = document.getElementById('confirmEmailError');
  const saveBtn = document.getElementById('saveEmailBtn');
  
  // Reset
  emailError.classList.remove('show');
  confirmError.classList.remove('show');
  saveBtn.disabled = true;
  
  // Validate email format
  if (email && !auth.validateEmail(email)) {
    emailError.textContent = translations[currentLanguage]["emailInvalid"] || "Please enter a valid email address";
    emailError.classList.add('show');
    return;
  }
  
  // Check if email matches confirmation
  if (email && confirmEmail && email !== confirmEmail) {
    confirmError.textContent = translations[currentLanguage]["emailsDontMatch"] || "Email addresses don't match";
    confirmError.classList.add('show');
    return;
  }
  
  const currentUser = auth.getCurrentUser();
  if (email && email === currentUser.email) {
    emailError.textContent = translations[currentLanguage]["emailSame"] || "This is already your email";
    emailError.classList.add('show');
    return;
  }
  
  // Check if email exists (simulate async check)
  if (email) {
    const allUsers = JSON.parse(localStorage.getItem('wzUsers') || '[]');
    const emailExists = allUsers.some(u => u.email === email.toLowerCase() && u.id !== currentUser.id);
    
    if (emailExists) {
      emailError.textContent = translations[currentLanguage]["emailTaken"] || "Email already registered";
      emailError.classList.add('show');
      return;
    }
  }
  
  // Enable save button if both fields are filled
  if (email && confirmEmail) {
    saveBtn.disabled = false;
  }
}

// Save email
async function saveEmail() {
  const newEmail = document.getElementById('emailInput').value.trim().toLowerCase();
  const confirmEmail = document.getElementById('confirmEmailInput').value.trim().toLowerCase();
  const emailError = document.getElementById('emailError');
  const confirmError = document.getElementById('confirmEmailError');
  const saveBtn = document.getElementById('saveEmailBtn');
  
  // Final validation
  if (!auth.validateEmail(newEmail)) {
    emailError.textContent = translations[currentLanguage]["emailInvalid"] || "Please enter a valid email address";
    emailError.classList.add('show');
    return;
  }
  
  if (newEmail !== confirmEmail) {
    confirmError.textContent = translations[currentLanguage]["emailsDontMatch"] || "Email addresses don't match";
    confirmError.classList.add('show');
    return;
  }
  
  saveBtn.disabled = true;
  saveBtn.classList.add('loading');
  
  try {
    const user = auth.getCurrentUser();
    if (!user) throw new Error("User not found");
    
    // Check email availability
    const allUsers = JSON.parse(localStorage.getItem('wzUsers') || '[]');
    const emailExists = allUsers.some(u => u.email === newEmail && u.id !== user.id);
    
    if (emailExists) {
      throw new Error(translations[currentLanguage]["emailTaken"] || "Email already registered");
    }
    
    // Update user
    user.email = newEmail;
    auth.saveUser(user);
    
    // Update all users list
    const updatedUsers = allUsers.map(u => 
      u.id === user.id ? user : u
    );
    localStorage.setItem('wzUsers', JSON.stringify(updatedUsers));
    
    // Update UI
    loadAccountSettings();
    
    // Show success
    setTimeout(() => {
      closeEmailModal();
      showSuccessModal(
        translations[currentLanguage]["emailUpdated"] || "Email Updated",
        translations[currentLanguage]["emailUpdatedDesc"] || "Your email has been updated successfully."
      );
    }, 500);
    
  } catch (error) {
    emailError.textContent = error.message;
    emailError.classList.add('show');
  } finally {
    saveBtn.disabled = false;
    saveBtn.classList.remove('loading');
  }
}

// Close email modal
function closeEmailModal() {
  document.getElementById('emailModal').style.display = 'none';
}

// Change password
function changePassword() {
  if (!auth.isLoggedIn()) {
    showToast(translations[currentLanguage]["loginRequired"] || "Please log in to change password");
    return;
  }
  
  const modal = document.getElementById('passwordModal');
  
  // Clear inputs
  document.getElementById('currentPasswordInput').value = '';
  document.getElementById('newPasswordInput').value = '';
  document.getElementById('confirmNewPasswordInput').value = '';
  document.getElementById('currentPasswordError').textContent = '';
  document.getElementById('newPasswordError').textContent = '';
  document.getElementById('confirmNewPasswordError').textContent = '';
  
  // Reset password requirements
  updatePasswordRequirements('');
  
  // Show modal
  modal.style.display = 'flex';
  updateModalTranslations();
  
  // Setup validation
  document.getElementById('newPasswordInput').oninput = validatePasswordInput;
  document.getElementById('confirmNewPasswordInput').oninput = validatePasswordInput;
  
  // Focus input
  setTimeout(() => {
    document.getElementById('currentPasswordInput').focus();
  }, 300);
}

// Toggle password visibility
function togglePasswordVisibility(inputId, icon) {
  const input = document.getElementById(inputId);
  const type = input.type === 'password' ? 'text' : 'password';
  input.type = type;
  icon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
}

// Validate password input
function validatePasswordInput() {
  const newPassword = document.getElementById('newPasswordInput').value;
  const confirmPassword = document.getElementById('confirmNewPasswordInput').value;
  const newPasswordError = document.getElementById('newPasswordError');
  const confirmError = document.getElementById('confirmNewPasswordError');
  const saveBtn = document.getElementById('savePasswordBtn');
  
  // Reset
  newPasswordError.classList.remove('show');
  confirmError.classList.remove('show');
  saveBtn.disabled = true;
  
  // Update password requirements
  updatePasswordRequirements(newPassword);
  
  // Validate new password
  if (newPassword && !auth.validatePassword(newPassword)) {
    newPasswordError.textContent = translations[currentLanguage]["passwordInvalid"] || "Password doesn't meet requirements";
    newPasswordError.classList.add('show');
    return;
  }
  
  // Check if passwords match
  if (newPassword && confirmPassword && newPassword !== confirmPassword) {
    confirmError.textContent = translations[currentLanguage]["passwordsDontMatch"] || "Passwords don't match";
    confirmError.classList.add('show');
    return;
  }
  
  // Enable save button if all fields are filled
  const currentPassword = document.getElementById('currentPasswordInput').value;
  if (currentPassword && newPassword && confirmPassword && newPassword === confirmPassword) {
    saveBtn.disabled = false;
  }
}

// Update password requirements display
function updatePasswordRequirements(password) {
  const hasLength = password.length >= 8;
  const hasLetter = /[A-Za-z]/.test(password);
  const hasNumber = /\d/.test(password);
  
  updateRequirementDisplay('reqLength', hasLength);
  updateRequirementDisplay('reqLetter', hasLetter);
  updateRequirementDisplay('reqNumber', hasNumber);
}

// Update requirement display
function updateRequirementDisplay(elementId, isValid) {
  const element = document.getElementById(elementId);
  const icon = element.querySelector('i');
  
  if (isValid) {
    element.className = 'requirement-item valid';
    icon.className = 'fas fa-check-circle';
  } else {
    element.className = 'requirement-item invalid';
    icon.className = 'fas fa-times-circle';
  }
}

// Save password
async function savePassword() {
  const currentPassword = document.getElementById('currentPasswordInput').value;
  const newPassword = document.getElementById('newPasswordInput').value;
  const confirmPassword = document.getElementById('confirmNewPasswordInput').value;
  const currentError = document.getElementById('currentPasswordError');
  const newError = document.getElementById('newPasswordError');
  const confirmError = document.getElementById('confirmNewPasswordError');
  const saveBtn = document.getElementById('savePasswordBtn');
  
  // Final validation
  if (!currentPassword) {
    currentError.textContent = translations[currentLanguage]["currentPasswordRequired"] || "Current password is required";
    currentError.classList.add('show');
    return;
  }
  
  if (!auth.validatePassword(newPassword)) {
    newError.textContent = translations[currentLanguage]["passwordInvalid"] || "Password doesn't meet requirements";
    newError.classList.add('show');
    return;
  }
  
  if (newPassword !== confirmPassword) {
    confirmError.textContent = translations[currentLanguage]["passwordsDontMatch"] || "Passwords don't match";
    confirmError.classList.add('show');
    return;
  }
  
  saveBtn.disabled = true;
  saveBtn.classList.add('loading');
  
  try {
    const user = auth.getCurrentUser();
    if (!user) throw new Error("User not found");
    
    // Verify current password
    if (user.password !== currentPassword) {
      throw new Error(translations[currentLanguage]["currentPasswordIncorrect"] || "Current password is incorrect");
    }
    
    // Check if new password is same as current
    if (currentPassword === newPassword) {
      throw new Error(translations[currentLanguage]["passwordSame"] || "New password must be different from current password");
    }
    
    // Update password
    user.password = newPassword;
    auth.saveUser(user);
    
    // Update all users list
    const allUsers = JSON.parse(localStorage.getItem('wzUsers') || '[]');
    const updatedUsers = allUsers.map(u => 
      u.id === user.id ? user : u
    );
    localStorage.setItem('wzUsers', JSON.stringify(updatedUsers));
    
    // Show success
    setTimeout(() => {
      closePasswordModal();
      showSuccessModal(
        translations[currentLanguage]["passwordUpdated"] || "Password Updated",
        translations[currentLanguage]["passwordUpdatedDesc"] || "Your password has been updated successfully."
      );
    }, 500);
    
  } catch (error) {
    currentError.textContent = error.message;
    currentError.classList.add('show');
  } finally {
    saveBtn.disabled = false;
    saveBtn.classList.remove('loading');
  }
}

// Close password modal
function closePasswordModal() {
  document.getElementById('passwordModal').style.display = 'none';
}

// Show success modal
function showSuccessModal(title, message) {
  const modal = document.getElementById('successModal');
  document.getElementById('successTitle').textContent = title;
  document.getElementById('successMessage').textContent = message;
  document.getElementById('successCheckmark').classList.add('show');
  modal.style.display = 'flex';
  updateModalTranslations();
}

// Close success modal
function closeSuccessModal() {
  document.getElementById('successModal').style.display = 'none';
  document.getElementById('successCheckmark').classList.remove('show');
}

// Update modal translations
function updateModalTranslations() {
  const modalElements = document.querySelectorAll('.language-modal [data-i18n]');
  
  modalElements.forEach((element) => {
    const key = element.getAttribute('data-i18n');
    const translation = translations[currentLanguage][key];
    if (translation) {
      element.textContent = translation;
    }
  });
}

// Account sync toggle
document.getElementById('accountSyncToggle')?.addEventListener('change', function() {
  localStorage.setItem('wzAccountSync', this.checked);
  showToast(translations[currentLanguage]["settingsSaved"] || "Settings saved");
});




