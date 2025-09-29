// viewCode.js
async function loadCode() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const token = localStorage.getItem("token");

    if (!id) {
        alert("لم يتم العثور على الكود");
        window.location.href = "dashboard.html";
        return;
    }

    try {
        const res = await fetch(`http://localhost:5000/api/codes/${id}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        const data = await res.json();

        if (res.ok) {
            document.getElementById("codeTitle").innerText = data.title;
            document.getElementById("codeDescription").innerText = data.description || "لا يوجد وصف";
            document.getElementById("codeTag").innerText = data.tag;
            document.getElementById("codeSnippet").innerText = data.code;
        } else {
            alert(data.message || "لم يتم العثور على الكود");
        }
    } catch (err) {
        console.error(err);
        alert("فشل الاتصال بالسيرفر.");
    }
}

document.addEventListener("DOMContentLoaded", loadCode);