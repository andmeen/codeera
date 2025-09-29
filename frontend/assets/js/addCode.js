// addCode.js
document.getElementById("addCodeForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("title").value;
    const code = document.getElementById("code").value;
    const description = document.getElementById("description").value;
    const tag = document.getElementById("tag").value;
    const customTag = document.getElementById("customTag").value;

    const finalTag = tag === "other" ? customTag : tag;

    const token = localStorage.getItem("token");

    try {
        const res = await fetch("http://localhost:5000/api/codes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ title, code, description, tag: finalTag })
        });

        const data = await res.json();

        if (res.ok) {
            alert("تمت إضافة الكود بنجاح!");
            window.location.href = "dashboard.html";
        } else {
            alert(data.message || "حدث خطأ أثناء الإضافة");
        }
    } catch (err) {
        console.error(err);
        alert("فشل الاتصال بالسيرفر.");
    }
});