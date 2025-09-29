// main.js
// فحص حالة تسجيل الدخول
function checkAuth() {
    const token = localStorage.getItem("token");
    const logoutBtn = document.getElementById("logoutBtn");

    if (!token) {
        if (logoutBtn) logoutBtn.style.display = "none";
    } else {
        if (logoutBtn) {
            logoutBtn.style.display = "block";
            logoutBtn.addEventListener("click", () => {
                localStorage.removeItem("token");
                alert("تم تسجيل الخروج");
                window.location.href = "index.html";
            });
        }
    }
}

document.addEventListener("DOMContentLoaded", checkAuth);