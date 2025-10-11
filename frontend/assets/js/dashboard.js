// dashboard.js
let codesData = [];
let currentQuery = "";
let selectedTag = "";
let languageFilter = "";
let hasDescOnly = false;
let favoritesOnly = false;
let debounceT = null;

function renderCodes(list, isSearch = false) {
    const container = document.getElementById("codesContainer");
    if (!container) return;
    container.innerHTML = "";
    // Empty states
    if (Array.isArray(list) && list.length === 0 && isSearch) {
        const empty = document.createElement("div");
        empty.className = "card";
        empty.style.margin = "8px 0";
        empty.innerHTML = `<p class="muted">لا توجد نتائج مطابقة لهذا الاسم.</p>`;
        container.appendChild(empty);
        return;
    } else if (Array.isArray(list) && list.length === 0 && !isSearch) {
        const empty = document.createElement("div");
        empty.className = "card";
        empty.style.margin = "8px 0";
        empty.style.padding = "16px";
        empty.innerHTML = `
            <p class="muted">لا توجد أكواد بعد. ابدأ بإضافة أول كود.</p>
        `;
        container.appendChild(empty);
        return;
    }
    list.forEach(code => {
        const card = document.createElement("div");
        card.className = "code-card";
        const safeTitle = code.title ?? "-";
        const safeDesc = code.description || "بدون وصف";
        const safeTags = Array.isArray(code.tags) && code.tags.length ? code.tags : (code.tag ? [code.tag] : []);
        const updatedAt = code.updated_at ? new Date(code.updated_at).toLocaleDateString() : "";
        const tagsHtml = safeTags.map(t => `<span class="chip" onclick="filterByTag('${t.replace(/'/g, "&#39;")}')"><span class="chip-dot"></span>${t}</span>`).join(" ");
        const favClass = code.favorite ? 'active' : '';
        const pinClass = code.pinned ? 'active' : '';
        card.innerHTML = `
            <div class="card-header">
                <div class="header-left">
                    <div class="titles">
                        <h3 class="card-title" title="${safeTitle}">${safeTitle}</h3>
                        <div class="card-sub">${tagsHtml}</div>
                    </div>
                </div>
                <div class="icon-row">
                    <button class="icon-btn ${favClass}" title="مفضلة" onclick="toggleFavorite(${code.id}, ${code.favorite ? 'true' : 'false'})">
                        <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                    </button>
                    <button class="icon-btn ${pinClass}" title="تثبيت" onclick="togglePinned(${code.id}, ${code.pinned ? 'true' : 'false'})">
                        <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M16 9V4l1-1V2H7v1l1 1v5l-2 2v2h5v7l1 1 1-1v-7h5v-2z"/></svg>
                    </button>
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

function showSkeletonsInline(count = 6){
    const container = document.getElementById("codesContainer");
    if (!container) return;
    container.innerHTML = "";
    for (let i=0;i<count;i++){
        const sk = document.createElement('div');
        sk.className = 'code-card';
        sk.innerHTML = `
            <div class="card-header">
              <div class="header-left"><div class="titles">
                <div style="height:16px;background:#eee;border-radius:6px;width:60%;"></div>
                <div style="height:12px;background:#f2f2f2;border-radius:6px;width:40%;margin-top:8px;"></div>
              </div></div>
            </div>
            <div style="height:48px;background:#f7f7f7;border-radius:8px;"></div>
            <div class="card-actions three" style="gap:8px;">
              <div style="height:34px;background:#eee;border-radius:8px;flex:1;"></div>
              <div style="height:34px;background:#f1f0fe;border-radius:8px;flex:1;"></div>
              <div style="height:34px;background:#f1f0fe;border-radius:8px;flex:1;"></div>
            </div>`;
        container.appendChild(sk);
    }
}

async function loadCodes() {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("الرجاء تسجيل الدخول أولاً");
        window.location.href = "login.html";
        return;
    }

    try {
        showSkeletonsInline();
        const sortSelect = document.getElementById('sortSelect');
        const mode = sortSelect ? sortSelect.value : 'updated_desc';
        const qs = new URLSearchParams();
        if (currentQuery.trim()) qs.set('query', currentQuery.trim());
        if (selectedTag) qs.set('tag', selectedTag);
        if (languageFilter) qs.set('language', languageFilter);
        if (hasDescOnly) qs.set('hasDescription', '1');
        if (favoritesOnly) qs.set('favorite', '1');
        if (mode) qs.set('sort', mode);
        const url = `http://localhost:5000/api/codes?${qs.toString()}`;
        const res = await fetch(url, {
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
            applyFiltersAndRender();
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

function sortCodes(list, mode) {
    const arr = [...list];
    switch (mode) {
        case 'title_asc':
            return arr.sort((a,b) => (a.title || '').localeCompare(b.title || ''));
        case 'title_desc':
            return arr.sort((a,b) => (b.title || '').localeCompare(a.title || ''));
        case 'updated_desc':
        default:
            return arr.sort((a,b) => new Date(b.updated_at || b.created_at || 0) - new Date(a.updated_at || a.created_at || 0));
    }
}

function applyFiltersAndRender() { renderCodes(codesData, !!currentQuery); }

async function fetchTagsSummary(){
    const token = localStorage.getItem("token");
    try{
        const res = await fetch('http://localhost:5000/api/codes/tags/summary',{
            headers:{"Authorization":`Bearer ${token}`}
        });
        if(!res.ok) return;
        const tags = await res.json();
        const list = document.getElementById('tagList');
        if(!list) return;
        list.innerHTML = '';
        const allItem = document.createElement('li');
        allItem.textContent = 'الكل';
        const countAll = document.createElement('span'); countAll.className='count'; countAll.textContent='';
        allItem.appendChild(countAll);
        if(!selectedTag) allItem.classList.add('active');
        allItem.addEventListener('click',()=>{ selectedTag=''; loadCodes(); highlightActiveTag(); });
        list.appendChild(allItem);
        tags.forEach(t=>{
            const li = document.createElement('li');
            li.innerHTML = `<span>${t.tag}</span><span class="count">${t.count}</span>`;
            if(selectedTag===t.tag) li.classList.add('active');
            li.addEventListener('click',()=>{ selectedTag=t.tag; loadCodes(); highlightActiveTag();});
            list.appendChild(li);
        });
    }catch(e){ console.warn(e); }
}

function highlightActiveTag(){
    const list = document.getElementById('tagList');
    if(!list) return;
    [...list.children].forEach(li=>li.classList.remove('active'));
    const items = [...list.children];
    const active = items.find(li => (selectedTag ? li.textContent.trim().startsWith(selectedTag) : li.textContent.trim().startsWith('الكل')));
    if(active) active.classList.add('active');
}

// Public for inline handlers
window.filterByTag = function(tag){
    selectedTag = tag;
    loadCodes();
    highlightActiveTag();
    // Close mobile sidebar if open
    const sidebar = document.getElementById('tagsSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (window.innerWidth <= 900 && sidebar && overlay) {
        sidebar.classList.remove('open');
        overlay.classList.remove('visible');
    }
};
window.toggleFavorite = async function(id, current){
    const token = localStorage.getItem('token');
    try{
        await fetch(`http://localhost:5000/api/codes/${id}/favorite`,{
            method:'POST', headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`}, body: JSON.stringify({favorite: !current})
        });
        loadCodes();
    }catch(e){ alert('تعذر تحديث المفضلة'); }
};
window.togglePinned = async function(id, current){
    const token = localStorage.getItem('token');
    try{
        await fetch(`http://localhost:5000/api/codes/${id}/pin`,{
            method:'POST', headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`}, body: JSON.stringify({pinned: !current})
        });
        loadCodes();
    }catch(e){ alert('تعذر تحديث التثبيت'); }
};

document.addEventListener("DOMContentLoaded", () => {
    loadCodes();
    fetchTagsSummary();
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            currentQuery = e.target.value || "";
            clearTimeout(debounceT);
            debounceT = setTimeout(()=>loadCodes(), 250);
        });
    }
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', loadCodes);
    }
    const langSel = document.getElementById('languageSelect');
    if(langSel){ langSel.addEventListener('change', ()=>{ languageFilter = langSel.value; loadCodes();}); }
    const hasDesc = document.getElementById('hasDescChk');
    if(hasDesc){ hasDesc.addEventListener('change', ()=>{ hasDescOnly = !!hasDesc.checked; loadCodes();}); }
    const favOnly = document.getElementById('favOnlyChk');
    if(favOnly){ favOnly.addEventListener('change', ()=>{ favoritesOnly = !!favOnly.checked; loadCodes();}); }
    const clearBtn = document.getElementById('clearFiltersBtn');
    if(clearBtn){ clearBtn.addEventListener('click', ()=>{
        currentQuery = ""; selectedTag = ""; languageFilter = ""; hasDescOnly = false; favoritesOnly = false;
        if(searchInput) searchInput.value = "";
        if(langSel) langSel.value = "";
        if(hasDesc) hasDesc.checked = false;
        if(favOnly) favOnly.checked = false;
        highlightActiveTag();
        loadCodes();
    });
    }

    // Mobile sidebar toggle
    const toggleBtn = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('tagsSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    function openSidebar(){ if(sidebar){ sidebar.classList.add('open'); } if(overlay){ overlay.classList.add('visible'); } }
    function closeSidebar(){ if(sidebar){ sidebar.classList.remove('open'); } if(overlay){ overlay.classList.remove('visible'); } }
    if (toggleBtn && sidebar && overlay) {
        toggleBtn.addEventListener('click', () => {
            if (sidebar.classList.contains('open')) closeSidebar(); else openSidebar();
        });
        overlay.addEventListener('click', closeSidebar);
        sidebar.addEventListener('click', (e) => {
            if (window.innerWidth <= 900 && e.target.closest('li')) closeSidebar();
        });
    }
});