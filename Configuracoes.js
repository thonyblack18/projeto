const API_BASE = "https://projeto-w9ao.onrender.com";
const params = new URLSearchParams(window.location.search);
const profileType = params.get("type");

console.log("Tipo de perfil:", profileType);

let currentUser = null;
let currentProfile = null;
let selectedGenres = [];
let avatarBase64 = null;

document.addEventListener("DOMContentLoaded", async () => {
  setupSidebarNavigation();
  setupButtons();
  setupToggles();
  setupAvatarNameSync();

  const savedUser = localStorage.getItem("velora_user");

  if (!savedUser) {
    showToast("Usuário não encontrado. Faça login novamente.");
    setTimeout(() => {
      window.location.href = "../login-cadastro/LoginCadastro.html";
    }, 1200);
    return;
  }

  try {
    currentUser = JSON.parse(savedUser);
  } catch (error) {
    showToast("Sessão inválida. Faça login novamente.");
    localStorage.removeItem("velora_user");
    setTimeout(() => {
      window.location.href = "../login-cadastro/LoginCadastro.html";
    }, 1200);
    return;
  }

  renderAvatarFromLocalStorage();
  await loadProfileData();
});

function setupButtons() {
  const btnSalvarPerfil = document.getElementById("btnSalvarPerfil");
  const btnCancelarPerfil = document.getElementById("btnCancelarPerfil");
  const btnSalvarSenha = document.getElementById("btnSalvarSenha");
  const btnSalvarPreferencias = document.getElementById("btnSalvarPreferencias");
  const btnSalvarSeguranca = document.getElementById("btnSalvarSeguranca");
  const btnSalvarPrivacidade = document.getElementById("btnSalvarPrivacidade");
  const btnVoltarPerfil = document.getElementById("btnVoltarPerfil");
  const btnEncerrarSessoes = document.getElementById("btnEncerrarSessoes");
  const btnExportarDados = document.getElementById("btnExportarDados");

  if (btnSalvarPerfil) btnSalvarPerfil.addEventListener("click", saveProfile);
  if (btnCancelarPerfil) btnCancelarPerfil.addEventListener("click", restoreProfileFields);
  if (btnSalvarSenha) btnSalvarSenha.addEventListener("click", savePassword);
  if (btnSalvarPreferencias) btnSalvarPreferencias.addEventListener("click", savePreferences);
  if (btnSalvarSeguranca) btnSalvarSeguranca.addEventListener("click", saveSecurity);
  if (btnSalvarPrivacidade) btnSalvarPrivacidade.addEventListener("click", savePrivacy);

  if (btnVoltarPerfil) {
    btnVoltarPerfil.addEventListener("click", (e) => {
      e.preventDefault();

      const isDev = currentUser?.account_type === "developer";

      window.location.href = isDev
        ? "PerfilDev.html"
        : "PerfilUsuario.html";
    });
  }

  if (btnEncerrarSessoes) {
    btnEncerrarSessoes.addEventListener("click", () => {
      showToast("Todas as sessões foram encerradas.");
    });
  }

  if (btnExportarDados) {
    btnExportarDados.addEventListener("click", exportUserData);
  }
}

function setupSidebarNavigation() {
  const links = document.querySelectorAll(".sidebar-nav a");

  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      links.forEach((item) => item.classList.remove("active"));
      link.classList.add("active");

      const targetId = link.getAttribute("href");
      const section = document.querySelector(targetId);

      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
}

function setupToggles() {
  updateGenreCount();
}

function setupAvatarNameSync() {
  const displayNameInput = document.getElementById("displayName");
  const avatarImg = document.getElementById("avatarImg");
  const avatarInitial = document.getElementById("avatarInitial");

  displayNameInput?.addEventListener("input", () => {
    if (!avatarImg || !avatarInitial) return;

    const imgVisible =
      avatarImg.style.display === "block" && avatarImg.src && avatarImg.src.trim() !== "";

    if (!imgVisible) {
      avatarInitial.textContent = getInitialFromName();
    }
  });
}

async function loadProfileData() {
  try {
    const userId = currentUser.id || currentUser.user_id;
    const isDev = currentUser?.account_type === "developer";

    if (!userId) {
      showToast("ID do usuário não encontrado.");
      return;
    }

    const endpoint = isDev
      ? `${API_BASE}/api/profile/dev/${userId}`
      : `${API_BASE}/api/profile/user/${userId}`;

    const response = await fetch(endpoint);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || "Erro ao carregar perfil.");
    }

    currentProfile = data.data || data.profile || data;
    fillProfileFields(currentProfile);
  } catch (error) {
    console.error(error);
    showToast(error.message || "Erro ao carregar dados.");
  }
}

function fillProfileFields(profile) {
  const displayName = document.getElementById("displayName");
  const username = document.getElementById("username");
  const email = document.getElementById("email");
  const bio = document.getElementById("bio");
  const avatarImg = document.getElementById("avatarImg");
  const avatarInitial = document.getElementById("avatarInitial");
  const lastUpdated = document.getElementById("lastUpdated");

  const nameValue =
    profile.display_name ||
    profile.name ||
    profile.nome ||
    currentUser?.name ||
    "Usuário";

  const usernameValue =
    profile.username ||
    profile.user_name ||
    profile.nome_usuario ||
    currentUser?.username ||
    "";

  const emailValue = profile.email || currentUser?.email || "";
  const bioValue = profile.bio || profile.description || profile.descricao || profile.studio_description || "";
  const avatarValue =
    profile.avatar ||
    profile.avatar_url ||
    profile.foto_perfil ||
    getVeloraUser().profile_photo ||
    "";

  if (displayName) displayName.value = nameValue;
  if (username) username.value = usernameValue;
  if (email) email.value = emailValue;
  if (bio) bio.value = bioValue;

  if (avatarValue && avatarImg && avatarInitial) {
    avatarImg.src = avatarValue;
    avatarImg.style.display = "block";
    avatarInitial.style.display = "none";
    avatarBase64 = avatarValue;
  } else if (avatarInitial) {
    avatarInitial.textContent = nameValue.charAt(0).toUpperCase();
    avatarInitial.style.display = "block";
    if (avatarImg) {
      avatarImg.src = "";
      avatarImg.style.display = "none";
    }
  }

  if (lastUpdated) {
    const now = new Date();
    lastUpdated.textContent = `Última atualização: ${now.toLocaleDateString("pt-BR")}`;
  }

  let genres = [];
  if (Array.isArray(profile.favorite_genres)) {
    genres = profile.favorite_genres;
  } else if (typeof profile.favorite_genres === "string") {
    genres = profile.favorite_genres.split(",").map((g) => g.trim());
  } else if (typeof profile.preferred_genres === "string") {
    genres = profile.preferred_genres.split(",").map((g) => g.trim());
  }

  selectedGenres = genres.filter(Boolean);
  applySelectedGenres();
  applyToggleValues(profile);

  const localUser = getVeloraUser();
  localUser.name = nameValue;
  localUser.display_name = nameValue;
  localUser.username = usernameValue;
  localUser.email = emailValue;
  if (avatarValue) {
    localUser.profile_photo = avatarValue;
  }
  saveVeloraUser(localUser);
}

function restoreProfileFields() {
  if (currentProfile) {
    fillProfileFields(currentProfile);
    showToast("Alterações descartadas.");
  }
}

async function saveProfile() {
  try {
    const userId = currentUser.id || currentUser.user_id;
    const isDev = currentUser?.account_type === "developer";

    const payload = {
      display_name: document.getElementById("displayName")?.value.trim(),
      username: document.getElementById("username")?.value.trim(),
      email: document.getElementById("email")?.value.trim()
    };

    if (avatarBase64) {
      payload.avatar = avatarBase64;
    }

    if (isDev) {
      payload.studio_description = document.getElementById("bio")?.value.trim() || "";
    } else {
      payload.bio = document.getElementById("bio")?.value.trim() || "";
    }

    console.log("PAYLOAD PERFIL:", payload);

    if (!payload.display_name || !payload.username || !payload.email) {
      showToast("Preencha nome, usuário e e-mail.");
      return;
    }

    const endpoint = isDev
      ? `${API_BASE}/api/profile/dev/${userId}`
      : `${API_BASE}/api/profile/user/${userId}`;

    const response = await fetch(endpoint, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || "Erro ao salvar perfil.");
    }

    currentProfile = { ...currentProfile, ...payload };

    const localUser = getVeloraUser();
    localUser.name = payload.display_name;
    localUser.display_name = payload.display_name;
    localUser.username = payload.username;
    localUser.email = payload.email;
    if (avatarBase64) {
      localUser.profile_photo = avatarBase64;
    }
    saveVeloraUser(localUser);

    fillProfileFields(currentProfile);
    showToast("Perfil atualizado com sucesso.");
  } catch (error) {
    console.error(error);
    showToast(error.message || "Erro ao salvar perfil.");
  }
}

async function savePassword() {
  try {
    const userId = currentUser.id || currentUser.user_id;
    const current_password = document.getElementById("currentPass")?.value.trim();
    const new_password = document.getElementById("newPass")?.value.trim();
    const confirm_password = document.getElementById("confirmPass")?.value.trim();

    if (!current_password || !new_password || !confirm_password) {
      showToast("Preencha todos os campos de senha.");
      return;
    }

    if (new_password.length < 8) {
      showToast("A nova senha deve ter pelo menos 8 caracteres.");
      return;
    }

    if (new_password !== confirm_password) {
      showToast("As senhas não coincidem.");
      return;
    }

    const response = await fetch(`${API_BASE}/api/change-password/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        current_password,
        new_password
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || "Erro ao atualizar senha.");
    }

    document.getElementById("currentPass").value = "";
    document.getElementById("newPass").value = "";
    document.getElementById("confirmPass").value = "";
    resetStrengthBars();

    showToast("Senha atualizada com sucesso.");
  } catch (error) {
    console.error(error);
    showToast(error.message || "Erro ao atualizar senha.");
  }
}

async function savePreferences() {
  try {
    const userId = currentUser.id || currentUser.user_id;

    const response = await fetch(`${API_BASE}/profile/preferences/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        favorite_genres: selectedGenres
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || "Erro ao salvar preferências.");
    }

    currentProfile = { ...currentProfile, favorite_genres: selectedGenres };
    updateGenreCount();
    showToast("Preferências salvas com sucesso.");
  } catch (error) {
    console.error(error);
    showToast(error.message || "Erro ao salvar preferências.");
  }
}

async function saveSecurity() {
  try {
    const userId = currentUser.id || currentUser.user_id;
    const checkboxes = document.querySelectorAll("#seguranca input[type='checkbox']");

    const payload = {
      two_factor: checkboxes[0]?.checked || false,
      login_alerts: checkboxes[1]?.checked || false,
      simultaneous_sessions: checkboxes[2]?.checked || false
    };

    const response = await fetch(`${API_BASE}/profile/security/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Erro ao salvar segurança.");
    }

    showToast("Configurações de segurança salvas com sucesso.");
  } catch (error) {
    console.error(error);
    showToast(error.message || "Erro ao salvar segurança.");
  }
}

async function savePrivacy() {
  try {
    const userId = currentUser.id || currentUser.user_id;
    const checkboxes = document.querySelectorAll("#privacidade input[type='checkbox']");

    const payload = {
      public_profile: checkboxes[0]?.checked || false,
      show_supported_games: checkboxes[1]?.checked || false,
      analytics_cookies: checkboxes[2]?.checked || false,
      marketing_emails: checkboxes[3]?.checked || false
    };

    const response = await fetch(`${API_BASE}/profile/privacy/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Erro ao salvar privacidade.");
    }

    currentProfile = { ...currentProfile, ...payload };
    showToast("Configurações de privacidade salvas.");
  } catch (error) {
    console.error(error);
    showToast(error.message || "Erro ao salvar privacidade.");
  }
}

function applyToggleValues(profile) {
  const securityChecks = document.querySelectorAll("#seguranca input[type='checkbox']");
  const privacyChecks = document.querySelectorAll("#privacidade input[type='checkbox']");

  if (securityChecks.length >= 3) {
    securityChecks[0].checked = Boolean(profile.two_factor ?? true);
    securityChecks[1].checked = Boolean(profile.login_alerts ?? true);
    securityChecks[2].checked = Boolean(profile.simultaneous_sessions ?? false);
  }

  if (privacyChecks.length >= 4) {
    privacyChecks[0].checked = Boolean(profile.public_profile ?? true);
    privacyChecks[1].checked = Boolean(profile.show_supported_games ?? true);
    privacyChecks[2].checked = Boolean(profile.analytics_cookies ?? false);
    privacyChecks[3].checked = Boolean(profile.marketing_emails ?? true);
  }
}

function toggleGenre(element) {
  element.classList.toggle("selected");
  const genre = element.textContent.trim();

  if (element.classList.contains("selected")) {
    if (!selectedGenres.includes(genre)) selectedGenres.push(genre);
  } else {
    selectedGenres = selectedGenres.filter((item) => item !== genre);
  }

  updateGenreCount();
}

function applySelectedGenres() {
  const genreTags = document.querySelectorAll(".genre-tag");

  genreTags.forEach((tag) => {
    const genre = tag.textContent.trim();
    if (selectedGenres.includes(genre)) tag.classList.add("selected");
    else tag.classList.remove("selected");
  });

  updateGenreCount();
}

function updateGenreCount() {
  const genreCount = document.getElementById("genreCount");
  if (genreCount) {
    genreCount.textContent = `${selectedGenres.length} gênero${selectedGenres.length !== 1 ? "s" : ""} selecionado${selectedGenres.length !== 1 ? "s" : ""}`;
  }
}

function getVeloraUser() {
  try {
    return JSON.parse(localStorage.getItem("velora_user")) || {};
  } catch (e) {
    return {};
  }
}

function saveVeloraUser(user) {
  localStorage.setItem("velora_user", JSON.stringify(user));
}

function getInitialFromName() {
  const displayNameInput = document.getElementById("displayName");
  const nome = (
    displayNameInput?.value ||
    getVeloraUser().display_name ||
    getVeloraUser().username ||
    "U"
  ).trim();

  return nome.charAt(0).toUpperCase();
}

function renderAvatarFromLocalStorage() {
  const avatarImg = document.getElementById("avatarImg");
  const avatarInitial = document.getElementById("avatarInitial");
  const user = getVeloraUser();
  const foto = user.profile_photo || "";

  if (!avatarImg || !avatarInitial) return;

  if (foto) {
    avatarImg.src = foto;
    avatarImg.style.display = "block";
    avatarInitial.style.display = "none";
    avatarBase64 = foto;
  } else {
    avatarImg.src = "";
    avatarImg.style.display = "none";
    avatarInitial.textContent = getInitialFromName();
    avatarInitial.style.display = "block";
  }
}

async function handleAvatarUpload(event) {
  const avatarInput = document.getElementById("avatarInput");
  const avatarImg = document.getElementById("avatarImg");
  const avatarInitial = document.getElementById("avatarInitial");

  const file = event.target.files?.[0];
  if (!file) return;

  const tiposPermitidos = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  const tamanhoMaximo = 5 * 1024 * 1024;

  if (!tiposPermitidos.includes(file.type)) {
    showToast("Selecione uma imagem JPG, PNG, GIF ou WEBP.");
    if (avatarInput) avatarInput.value = "";
    return;
  }

  if (file.size > tamanhoMaximo) {
    showToast("A imagem deve ter no máximo 5 MB.");
    if (avatarInput) avatarInput.value = "";
    return;
  }

  try {
    const user = getVeloraUser();

    const formData = new FormData();
    formData.append("user_id", user.id || user.user_id);
    formData.append("account_type", user.account_type);
    formData.append("avatar", file);

    const response = await fetch(`${API_BASE.replace("/api", "")}/api/upload-avatar`, {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      throw new Error(data.error || "Erro ao enviar imagem.");
    }

    const avatarUrl = `${API_BASE.replace("/api", "")}/${data.avatar_url}`;

    if (avatarImg) {
      avatarImg.src = avatarUrl;
      avatarImg.style.display = "block";
    }

    if (avatarInitial) {
      avatarInitial.style.display = "none";
    }

    avatarBase64 = avatarUrl;

    const localUser = getVeloraUser();
    localUser.profile_photo = avatarUrl;
    saveVeloraUser(localUser);

    if (currentProfile) {
      currentProfile.avatar_url = avatarUrl;
    }

    showToast("Foto de perfil atualizada!");

  } catch (error) {
    console.error(error);
    showToast(error.message || "Erro ao atualizar foto.");
  }
}

function removeAvatar() {
  const avatarInput = document.getElementById("avatarInput");
  const avatarImg = document.getElementById("avatarImg");
  const avatarInitial = document.getElementById("avatarInitial");

  avatarBase64 = null;

  if (avatarImg) {
    avatarImg.src = "";
    avatarImg.style.display = "none";
  }

  if (avatarInitial) {
    avatarInitial.textContent = getInitialFromName();
    avatarInitial.style.display = "block";
  }

  const localUser = getVeloraUser();
  delete localUser.profile_photo;
  saveVeloraUser(localUser);

  if (avatarInput) avatarInput.value = "";

  showToast("Foto de perfil removida.");
}

function openDeleteModal() {
  const modal = document.getElementById("deleteModal");
  if (modal) modal.classList.add("active");
}

function closeDeleteModal() {
  const modal = document.getElementById("deleteModal");
  if (modal) modal.classList.remove("active");
}

async function deleteAccount() {
  try {
    const userId = currentUser.id || currentUser.user_id;

    const response = await fetch(`${API_BASE}/profile/${userId}`, {
      method: "DELETE"
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || "Erro ao excluir conta.");
    }

    localStorage.removeItem("velora_user");
    showToast("Conta excluída com sucesso.");

    setTimeout(() => {
      window.location.href = "../login-cadastro/LoginCadastro.html";
    }, 1200);
  } catch (error) {
    console.error(error);
    showToast(error.message || "Erro ao excluir conta.");
  }
}

function exportUserData() {
  const exportData = {
    user: currentUser,
    profile: currentProfile,
    exported_at: new Date().toISOString()
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: "application/json"
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "velora-meus-dados.json";
  a.click();
  URL.revokeObjectURL(url);

  showToast("Seus dados foram exportados.");
}

function checkStrength(password) {
  const bars = [
    document.getElementById("bar1"),
    document.getElementById("bar2"),
    document.getElementById("bar3"),
    document.getElementById("bar4")
  ];
  const text = document.getElementById("strengthText");

  bars.forEach((bar) => {
    if (bar) bar.style.background = "rgba(255,255,255,0.12)";
  });

  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password) || /[a-z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  for (let i = 0; i < strength; i++) {
    if (bars[i]) bars[i].style.background = "#7c5cff";
  }

  if (!text) return;

  if (!password) text.textContent = "Digite sua nova senha";
  else if (strength <= 1) text.textContent = "Senha fraca";
  else if (strength === 2) text.textContent = "Senha média";
  else if (strength === 3) text.textContent = "Senha boa";
  else text.textContent = "Senha forte";
}

function resetStrengthBars() {
  ["bar1", "bar2", "bar3", "bar4"].forEach((id) => {
    const bar = document.getElementById(id);
    if (bar) bar.style.background = "rgba(255,255,255,0.12)";
  });

  const text = document.getElementById("strengthText");
  if (text) text.textContent = "Digite sua nova senha";
}

function showToast(message) {
  const toast = document.getElementById("toast");
  const toastMsg = document.getElementById("toastMsg");

  if (!toast || !toastMsg) return;

  toastMsg.textContent = message;
  toast.classList.add("show");

  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 2600);
}

window.toggleGenre = toggleGenre;
window.handleAvatarUpload = handleAvatarUpload;
window.removeAvatar = removeAvatar;
window.openDeleteModal = openDeleteModal;
window.closeDeleteModal = closeDeleteModal;
window.checkStrength = checkStrength;

document.addEventListener("click", (e) => {
  const confirmDeleteBtn = e.target.closest(".modal .btn-danger");
  if (confirmDeleteBtn && confirmDeleteBtn.textContent.includes("Confirmar")) {
    e.preventDefault();
    closeDeleteModal();
    deleteAccount();
  }
});

// =================== MENU HAMBÚRGUER RESPONSIVO ===================
function setupMobileMenu() {
  const menuToggle = document.getElementById("menuToggle");
  const mainNav = document.getElementById("mainNav") || document.querySelector(".main-nav");

  if (!menuToggle || !mainNav) return;

  menuToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("mobile-open");
    menuToggle.classList.toggle("active", isOpen);
    menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");

    const icon = menuToggle.querySelector("i");
    if (icon) {
      icon.classList.toggle("fa-bars", !isOpen);
      icon.classList.toggle("fa-times", isOpen);
    }
  });

  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("mobile-open");
      menuToggle.classList.remove("active");
      menuToggle.setAttribute("aria-expanded", "false");

      const icon = menuToggle.querySelector("i");
      if (icon) {
        icon.classList.add("fa-bars");
        icon.classList.remove("fa-times");
      }
    });
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 1024) {
      mainNav.classList.remove("mobile-open");
      menuToggle.classList.remove("active");
      menuToggle.setAttribute("aria-expanded", "false");

      const icon = menuToggle.querySelector("i");
      if (icon) {
        icon.classList.add("fa-bars");
        icon.classList.remove("fa-times");
      }
    }
  });
}

document.addEventListener("DOMContentLoaded", setupMobileMenu);
