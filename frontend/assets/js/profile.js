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
            const userName = u.name || u.email || "مستخدم";
            
            // Profile Header
            const displayNameEl = document.getElementById("displayName");
            const usernameEl = document.getElementById("username");
            const avatarInitialEl = document.getElementById("avatarInitial");
            
            if (displayNameEl) displayNameEl.innerText = userName;
            if (usernameEl) usernameEl.innerText = u.username || "user";
            if (avatarInitialEl) {
                // Get first letter of name for avatar
                avatarInitialEl.innerText = userName.charAt(0).toUpperCase();
            }
            
            // Info Cards
            const displayNameInfoEl = document.getElementById("displayNameInfo");
            const usernameInfoEl = document.getElementById("usernameInfo");
            const emailEl = document.getElementById("email");
            const joinedEl = document.getElementById("joinedAt");

            if (displayNameInfoEl) displayNameInfoEl.innerText = userName;
            if (usernameInfoEl) usernameInfoEl.innerText = u.username || "-";
            if (emailEl) emailEl.innerText = u.email || "-";
            if (joinedEl) {
                const joinDate = u.created_at ? new Date(u.created_at).toLocaleDateString('ar-EG', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }) : "-";
                joinedEl.innerText = joinDate;
            }
            
            // Calculate member days
            const memberDaysEl = document.getElementById("memberDays");
            if (memberDaysEl && u.created_at) {
                const joinDate = new Date(u.created_at);
                const today = new Date();
                const diffTime = Math.abs(today - joinDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                memberDaysEl.innerText = diffDays;
            }
            
            // Load snippets count
            loadSnippetsCount(token);
            
        } else {
            alert((payload && payload.message) || "خطأ في جلب البيانات");
        }
    } catch (err) {
        console.error(err);
        alert("فشل الاتصال بالسيرفر.");
    }
}

async function loadSnippetsCount(token) {
    try {
        const res = await fetch("http://localhost:5000/api/snippets", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        
        const payload = await res.json();
        
        if (res.ok && payload && payload.snippets) {
            const snippets = payload.snippets;
            
            // Total snippets
            const totalSnippetsEl = document.getElementById("totalSnippets");
            if (totalSnippetsEl) {
                totalSnippetsEl.innerText = snippets.length;
            }
            
            // Total unique tags
            const totalTagsEl = document.getElementById("totalTags");
            if (totalTagsEl) {
                const uniqueTags = new Set(snippets.map(s => s.tag).filter(t => t));
                totalTagsEl.innerText = uniqueTags.size;
            }
        }
    } catch (err) {
        console.error("Error loading snippets:", err);
    }
}

document.addEventListener("DOMContentLoaded", loadProfile);