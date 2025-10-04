// profile.js
async function loadProfile() {
    const token = localStorage.getItem("token");

    if (!token) {
        alert("يجب تسجيل الدخول أولاً");
        window.location.href = "login.html";
        return;
    }

    try {
        const res = await fetch("http://localhost:5000/api/user/me", {
            headers: { "Authorization": `Bearer ${token}` }
        });

        const payload = await res.json();

        if (res.ok && payload && payload.user) {
            const u = payload.user;
            const displayNameEl = document.getElementById("displayName");
            const usernameEl = document.getElementById("username");
            const emailEl = document.getElementById("email");
            const joinedEl = document.getElementById("joinedAt");

            if (displayNameEl) displayNameEl.innerText = u.name || u.email || "-";
            if (usernameEl) usernameEl.innerText = u.username || "-";
            if (emailEl) emailEl.innerText = u.email || "-";
            if (joinedEl) joinedEl.innerText = u.created_at ? new Date(u.created_at).toLocaleDateString() : "-";
        } else {
            alert((payload && payload.message) || "خطأ في جلب البيانات");
        }
    } catch (err) {
        console.error(err);
        alert("فشل الاتصال بالسيرفر.");
    }
}

document.addEventListener("DOMContentLoaded", loadProfile);