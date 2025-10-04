// dashboard.js
async function loadCodes() {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("الرجاء تسجيل الدخول أولاً");
        window.location.href = "login.html";
        return;
    }

    try {
        const res = await fetch("http://localhost:5000/api/codes", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();

        if (res.ok) {
            const container = document.getElementById("codesContainer");
            container.innerHTML = "";

            data.forEach(code => {
                const card = document.createElement("div");
                card.className = "code-card";

                card.innerHTML = `
                    <h3>${code.title}</h3>
                    <p>${code.description || "بدون وصف"}</p>
                    <span class="tag">${code.tag}</span>
                    <button onclick="viewCode(${code.id})">عرض</button>
                    <button onclick="editCode(${code.id})">تعديل</button>
                    <button onclick="deleteCode(${code.id})">حذف</button>
                `;

                container.appendChild(card);
            });
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
            console.error(err);
            alert("فشل الاتصال بالسيرفر.");
        }
    }
}

document.addEventListener("DOMContentLoaded", loadCodes);