// frontend/editCode.js

document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("الرجاء تسجيل الدخول أولاً");
      window.location.href = "login.html";
      return;
    }
  
    // الحصول على معرف الكود من رابط الصفحة (query string)
    const urlParams = new URLSearchParams(window.location.search);
    const codeId = urlParams.get("id");
  
    if (!codeId) {
      alert("لم يتم العثور على الكود المراد تعديله");
      window.location.href = "dashboard.html";
      return;
    }
  
    const form = document.getElementById("editCodeForm");
  
    // تحميل بيانات الكود الحالي وتعبئة النموذج
    try {
      const res = await fetch(`http://localhost:5000/api/codes/${codeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (!res.ok) throw new Error("فشل في جلب بيانات الكود");
  
      const code = await res.json();
  
      // تعبئة الحقول
      document.getElementById("title").value = code.title;
      const tagInput = document.getElementById("tag");
      if (tagInput) tagInput.value = code.tag || "";
      document.getElementById("code").value = code.code;
      document.getElementById("description").value = code.description || "";
    } catch (error) {
      console.error("خطأ أثناء جلب بيانات الكود:", error);
      alert("حدث خطأ أثناء تحميل بيانات الكود");
    }
  
    // عند الضغط على زر حفظ التعديلات
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
  
      const updatedCode = {
        title: document.getElementById("title").value,
        tag: document.getElementById("tag").value,
        code: document.getElementById("code").value,
        description: document.getElementById("description").value,
      };
  
      try {
        const res = await fetch(`http://localhost:5000/api/codes/${codeId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedCode),
        });
  
        if (!res.ok) throw new Error("فشل في تحديث الكود");
  
        alert("تم تعديل الكود بنجاح");
        window.location.href = "dashboard.html";
      } catch (error) {
        console.error("خطأ أثناء تعديل الكود:", error);
        alert("حدث خطأ أثناء تعديل الكود");
      }
    });
  });  