/* student.js
   - handles form validation for login/register
   - mock-data rendering for dashboard, applications, documents
   - file upload handling (client-only)
*/

(() => {
  // --- Simple "auth" simulation (client-side only) ---
  const STORAGE_USER_KEY = 'sms_student_user';
  const STORAGE_APPS_KEY = 'sms_student_apps';
  const STORAGE_DOCS_KEY = 'sms_student_docs';

  // Mock scholarships (would come from server in real app)
  const mockScholarships = [
    {id: 101, title: "Mayor Liza Scholarship", deadline: "2026-01-15", description: "For high-performing local students."},
    {id: 102, title: "Gov. Vilma Scholarship", deadline: "2026-02-10", description: "Financial assistance for qualified students."},
    {id: 103, title: "Athlete Scholarship", deadline: "2026-03-12", description: "Supports student athletes."}
  ];

  // Mock existing applications if none saved
  function ensureMockApps(){
    if(!localStorage.getItem(STORAGE_APPS_KEY)){
      const mock = [
        {appId:2001, scholarship:"Mayor Liza Scholarship", date:"2025-10-05", status:"Pending"},
        {appId:2002, scholarship:"Athlete Scholarship", date:"2025-08-22", status:"Approved"}
      ];
      localStorage.setItem(STORAGE_APPS_KEY, JSON.stringify(mock));
    }
  }
  ensureMockApps();

  // --- Utility functions ---
  function $(id){ return document.getElementById(id); }
  function showError(elId, msg){ const el = $(elId); if(el) el.textContent = msg || ''; }

  // --- AUTH: register form ---
  const regForm = $('student-register-form');
  if(regForm){
    regForm.addEventListener('submit', (e) => {
      e.preventDefault();
      // fields
      const firstName = $('firstName').value.trim();
      const lastName = $('lastName').value.trim();
      const email = $('email').value.trim();
      const birthdate = $('birthdate').value;
      const username = $('reg-username').value.trim();
      const password = $('reg-password').value;

      // basic validation
      let ok = true;
      if(!firstName){ showError('err-firstName','Required'); ok=false } else showError('err-firstName','');
      if(!lastName){ showError('err-lastName','Required'); ok=false } else showError('err-lastName','');
      if(!/^\S+@\S+\.\S+$/.test(email)){ showError('err-email','Enter valid email'); ok=false } else showError('err-email','');
      if(!birthdate){ showError('err-birthdate','Required'); ok=false } else showError('err-birthdate','');
      if(username.length < 4){ showError('err-reg-username','Min 4 chars'); ok=false } else showError('err-reg-username','');
      if(password.length < 6){ showError('err-reg-password','Min 6 chars'); ok=false } else showError('err-reg-password','');

      if(!ok) return;

      // save to localStorage as "registered user"
      const user = {firstName,lastName,email,birthdate,username};
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));

      alert('Account created (client-only). You can now sign in.');
      window.location.href = 'student-login.html';
    });
  }

  // --- AUTH: login form ---
  const loginForm = $('student-login-form');
  if(loginForm){
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = $('s-username').value.trim();
      const password = $('s-password').value;

      let ok = true;
      if(!username){ showError('err-username','Required'); ok=false } else showError('err-username','');
      if(password.length < 6){ showError('err-password','Password required (min 6)'); ok=false } else showError('err-password','');

      if(!ok) return;

      // simple check: if a user exists in localStorage match username; else allow and create a demo user
      const savedUser = JSON.parse(localStorage.getItem(STORAGE_USER_KEY) || 'null');
      if(savedUser && savedUser.username && savedUser.username !== username){
        // allow but warn: in real app check credentials
        // we'll allow any username for demo; but keep the user's display name in localStorage session
      }

      // set "session" in sessionStorage
      sessionStorage.setItem('sms_student_session', JSON.stringify({username}));

      // redirect to dashboard
      window.location.href = 'student-dashboard.html';
    });
  }

  // --- SIGN OUT (simple) ---
  function setupSignouts(){
    const signouts = ['signout-link','signout-link-2','signout-link-3'];
    signouts.forEach(id => {
      const el = document.getElementById(id);
      if(el) el.addEventListener('click', (ev)=>{
        ev.preventDefault();
        sessionStorage.removeItem('sms_student_session');
        window.location.href = 'student-login.html';
      });
    });
  }
  setupSignouts();

  // --- Dashboard rendering ---
  if(document.querySelector('#student-name')){
    const session = JSON.parse(sessionStorage.getItem('sms_student_session') || 'null');
    const user = JSON.parse(localStorage.getItem(STORAGE_USER_KEY) || 'null');
    const displayName = (user && user.firstName) ? `${user.firstName}` : (session && session.username) ? session.username : 'Student';
    $('student-name').textContent = displayName;

    // scholarships
    $('total-scholarships').textContent = mockScholarships.length;
    const apps = JSON.parse(localStorage.getItem(STORAGE_APPS_KEY) || '[]');
    $('my-applications-count').textContent = apps.length;
    const docs = JSON.parse(localStorage.getItem(STORAGE_DOCS_KEY) || '[]');
    $('submitted-docs-count').textContent = docs.length;

    // render scholarship list
    const list = $('scholarship-list');
    if(list){
      list.innerHTML = '';
      mockScholarships.forEach(s => {
        const item = document.createElement('div');
        item.className = 'item';
        item.innerHTML = `<strong>${s.title}</strong> <div class="muted">Deadline: ${s.deadline}</div>
          <div style="margin-top:8px"><button class="btn small" data-id="${s.id}">Apply</button></div>`;
        list.appendChild(item);
      });

      // handle apply button -> creates a new application (client-side)
      list.addEventListener('click', (ev) => {
        if(ev.target && ev.target.matches('button[data-id]')){
          const id = +ev.target.dataset.id;
          const scholarship = mockScholarships.find(x=>x.id===id);
          if(!scholarship) return;
          // add application
          const apps = JSON.parse(localStorage.getItem(STORAGE_APPS_KEY) || '[]');
          const nextId = apps.length ? Math.max(...apps.map(a=>a.appId)) + 1 : 2001;
          const newApp = { appId: nextId, scholarship: scholarship.title, date: new Date().toISOString().slice(0,10), status: "Pending" };
          apps.push(newApp);
          localStorage.setItem(STORAGE_APPS_KEY, JSON.stringify(apps));
          alert('Application submitted (client-only).');
          // update counts
          $('my-applications-count').textContent = apps.length;
        }
      });
    }
  }

  // --- Applications page rendering & filtering ---
  const appsTableBody = document.querySelector('#applications-table tbody');
  const appSearch = $('app-search');
  const filterStatus = $('filter-status');

  function renderApplications(){
    if(!appsTableBody) return;
    const apps = JSON.parse(localStorage.getItem(STORAGE_APPS_KEY) || '[]');
    const q = appSearch ? appSearch.value.trim().toLowerCase() : '';
    const statusFilter = filterStatus ? filterStatus.value : '';
    appsTableBody.innerHTML = '';
    const filtered = apps.filter(a => {
      if(statusFilter && a.status !== statusFilter) return false;
      if(q && !(String(a.appId).includes(q) || a.scholarship.toLowerCase().includes(q) || a.status.toLowerCase().includes(q))) return false;
      return true;
    });
    filtered.forEach(a => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${a.appId}</td>
                      <td>${a.scholarship}</td>
                      <td>${a.date}</td>
                      <td>${a.status}</td>
                      <td><button class="btn small" data-appid="${a.appId}">View</button></td>`;
      appsTableBody.appendChild(tr);
    });
  }

  if(appsTableBody){
    renderApplications();
    if(appSearch) appSearch.addEventListener('input', renderApplications);
    if(filterStatus) filterStatus.addEventListener('change', renderApplications);
    // handle view button (simple)
    appsTableBody.addEventListener('click', (ev)=>{
      if(ev.target && ev.target.matches('button[data-appid]')){
        const id = +ev.target.dataset.appid;
        const apps = JSON.parse(localStorage.getItem(STORAGE_APPS_KEY) || '[]');
        const app = apps.find(a=>a.appId===id);
        if(app){
          alert(`Application ${app.appId}\nScholarship: ${app.scholarship}\nDate: ${app.date}\nStatus: ${app.status}`);
        }
      }
    });
  }

  // --- Documents upload (client-only) ---
  const docForm = $('doc-upload-form');
  const submittedList = $('submitted-list');

  function renderDocs(){
    if(!submittedList) return;
    const docs = JSON.parse(localStorage.getItem(STORAGE_DOCS_KEY) || '[]');
    submittedList.innerHTML = '';
    docs.forEach((d, idx) => {
      const li = document.createElement('li');
      li.className = 'item';
      li.innerHTML = `<strong>${d.typeLabel}</strong> — ${d.fileName} <div class="muted">Status: ${d.status}</div>`;
      submittedList.appendChild(li);
    });
  }

  if(docForm){
    docForm.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const docType = $('doc-type').value;
      const docFileEl = $('doc-file');
      // validation
      let ok = true;
      if(!docType){ showError('err-doc-type','Select a document'); ok=false } else showError('err-doc-type','');
      if(!docFileEl || !docFileEl.files || docFileEl.files.length === 0){ showError('err-doc-file','Select a PDF file'); ok=false } else {
        const f = docFileEl.files[0];
        if(f.type !== 'application/pdf'){ showError('err-doc-file','Only PDF allowed'); ok=false } else showError('err-doc-file','');
      }
      if(!ok) return;
      const f = docFileEl.files[0];
      const docs = JSON.parse(localStorage.getItem(STORAGE_DOCS_KEY) || '[]');
      const typeLabel = $('doc-type').selectedOptions[0].textContent;
      docs.push({ type: docType, typeLabel, fileName: f.name, status: 'Pending', uploadedAt: new Date().toISOString() });
      localStorage.setItem(STORAGE_DOCS_KEY, JSON.stringify(docs));
      alert('Document uploaded (client-only).');
      renderDocs();
      // reset form
      docForm.reset();
    });
    // initial render
    renderDocs();
  }

  // --- small helpers for page load ---
  function safeInit(){
    // any page-specific initial tasks
    try { renderApplications(); } catch(e){}
    try { renderDocs(); } catch(e){}
  }
  safeInit();

  // expose for debugging (optional)
  window.sms = {
    mockScholarships,
    getApps: ()=>JSON.parse(localStorage.getItem(STORAGE_APPS_KEY)||'[]'),
    getDocs: ()=>JSON.parse(localStorage.getItem(STORAGE_DOCS_KEY)||'[]')
  };

})();
