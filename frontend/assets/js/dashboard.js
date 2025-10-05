// dashboard.js
let codesData = [];

function renderCodes(list, isSearch = false) {
    const container = document.getElementById("codesContainer");
    if (!container) return;
    container.innerHTML = "";
    if (Array.isArray(list) && list.length === 0 && isSearch) {
        const empty = document.createElement("div");
        empty.className = "card";
        empty.style.margin = "8px 0";
        empty.innerHTML = `<p class="muted">لا توجد نتائج مطابقة لهذا الاسم.</p>`;
        container.appendChild(empty);
        return;
    }
    list.forEach(code => {
        const card = document.createElement("div");
        card.className = "code-card";
        const safeTitle = code.title ?? "-";
        const safeDesc = code.description || "بدون وصف";
        const safeTag = code.tag || "-";
        const updatedAt = code.updated_at ? new Date(code.updated_at).toLocaleDateString() : "";
        const avatarChar = (safeTitle || safeTag || 'ك').trim().charAt(0).toUpperCase();
        card.innerHTML = `
            <div class="card-header">
                <div class="header-left">
                    <div class="avatar-sm">${avatarChar}</div>
                    <div class="titles">
                        <h3 class="card-title" title="${safeTitle}">${safeTitle}</h3>
                        <div class="card-sub">
                            <span class="chip"><span class="chip-dot"></span>${safeTag}</span>
                        </div>
                    </div>
                </div>
            </div>
            <p class="card-desc">${safeDesc}</p>
            <div>
                <div class="card-meta">${updatedAt ? `آخر تحديث: ${updatedAt}` : ''}</div>
                <div class="card-actions three" style="margin-top:8px;">
                    <button class="btn-sm btn-primary" onclick="viewCode(${code.id})">عرض</button>
                    <button class="btn-sm btn-ghost" onclick="editCode(${code.id})">تعديل</button>
                    <button class="btn-sm btn-ghost danger" onclick="deleteCode(${code.id})">حذف</button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

async function loadCodes() {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("الرجاء تسجيل الدخول أولاً");
        window.location.href = "login.html";
        return;
    }

    try {
        const res = await fetch("http://localhost:5000/api/codes", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Cache-Control": "no-cache"
            },
            cache: "no-store"
        });
        const data = await res.json();

        if (res.ok) {
            codesData = Array.isArray(data) ? data : [];
            renderCodes(codesData);
        } else {
            alert(data.message || "فشل في تحميل الأكواد");
        }
    } catch (err) {
        console.error(err);
        alert("خطأ في الاتصال بالسيرفر.");
    }
}

function viewCode(id) {
    window.location.href = `view-code.html?id=${id}`;
}

function editCode(id) {
    window.location.href = `edit-code.html?id=${id}`;
}

async function deleteCode(id) {
    const token = localStorage.getItem("token");

    if (confirm("هل أنت متأكد أنك تريد حذف هذا الكود؟")) {
        try {
            const res = await fetch(`http://localhost:5000/api/codes/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            const data = await res.json();

            if (res.ok) {
                alert("تم الحذف بنجاح");
                loadCodes();
            } else {
                alert(data.message || "خطأ أثناء الحذف");
            }
        } catch (err) {
            alert("فشل الاتصال بالسيرفر.");
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadCodes();
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const q = (e.target.value || "").toLowerCase().trim();
            if (!q) {
                renderCodes(codesData);
                return;
            }
            const filtered = codesData.filter((c) => (c.title || "").toLowerCase().includes(q));
            renderCodes(filtered, true);
        });
    }
});