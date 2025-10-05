// main.js
// فحص حالة تسجيل الدخول
function checkAuth() {
    const token = localStorage.getItem("token");
    const logoutBtn = document.getElementById("logoutBtn");
    const loginLink = document.getElementById("loginLink");
    const registerLink = document.getElementById("registerLink");
    const profileLink = document.getElementById("profileLink");
    const heroCta = document.getElementById("heroCta");

    if (!token) {
        if (logoutBtn) logoutBtn.style.display = "none";
        if (loginLink) loginLink.style.display = "inline-block";
        if (registerLink) registerLink.style.display = "inline-block";
        if (profileLink) profileLink.style.display = "none";
        if (heroCta) heroCta.setAttribute("href", "register.html");
    } else {
        if (logoutBtn) {
            logoutBtn.style.display = "block";
            logoutBtn.addEventListener("click", () => {
                localStorage.removeItem("token");
                alert("تم تسجيل الخروج");
                window.location.href = "index.html";
            });
        }
        if (loginLink) loginLink.style.display = "none";
        if (registerLink) registerLink.style.display = "none";
        if (profileLink) profileLink.style.display = "inline-block";
        if (heroCta) heroCta.setAttribute("href", "dashboard.html");
    }
}

document.addEventListener("DOMContentLoaded", checkAuth);
// Run immediately in case DOMContentLoaded already fired before this script loaded
try { checkAuth(); } catch (_) {}