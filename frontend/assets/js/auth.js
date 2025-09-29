// auth.js
// تسجيل مستخدم جديد
document.getElementById("registerForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const res = await fetch("http://localhost:5000/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password })
        });

        const data = await res.json();

        if (res.ok) {
            alert("تم إنشاء الحساب بنجاح!");
            window.location.href = "login.html";
        } else {
            alert(data.message || "خطأ في التسجيل");
        }
    } catch (err) {
        console.error(err);
        alert("فشل الاتصال بالسيرفر.");
    }
});

// تسجيل الدخول
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const res = await fetch("http://localhost:5000/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (res.ok) {
            localStorage.setItem("token", data.token);
            alert("تم تسجيل الدخول بنجاح!");
            window.location.href = "dashboard.html";
        } else {
            alert(data.message || "خطأ في تسجيل الدخول");
        }
    } catch (err) {
        console.error(err);
        alert("فشل الاتصال بالسيرفر.");
    }
});