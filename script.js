// ===== LOGIN CHECK =====
document.addEventListener('DOMContentLoaded', () => {
  const publicPages = ['login.html','register.html'];
  const currentPage = window.location.pathname.split("/").pop();

  // Redirect to login if not logged in
  if (!localStorage.getItem('loggedIn') && !publicPages.includes(currentPage)) {
    window.location.href = 'login.html';
  }

  // Highlight active sidebar link
  const links = document.querySelectorAll('.nav-link');
  links.forEach(link => {
    if (link.getAttribute('href') === currentPage) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Table search hook
  const inputs = document.querySelectorAll('[data-table-search]');
  inputs.forEach(input => {
    const tableId = input.getAttribute('data-table-search');
    input.addEventListener('input', () => simpleTableFilter(tableId, input.id));
  });
});

// ===== SIMPLE TABLE FILTER =====
function simpleTableFilter(tableId, inputId){
  const input = document.getElementById(inputId);
  const table = document.getElementById(tableId);
  if(!input || !table) return;
  const query = input.value.toLowerCase();
  Array.from(table.querySelectorAll('tbody tr')).forEach(row => {
    row.style.display = Array.from(row.cells).some(cell =>
      cell.textContent.toLowerCase().includes(query)
    ) ? '' : 'none';
  });
}

// ===== PLACEHOLDER FUNCTION =====
function placeholder(msg){ alert(msg + " (placeholder)"); }

// ===== LOGIN FUNCTION =====
function login(){
  const u = document.getElementById('username').value;
  const p = document.getElementById('password').value;
  const errorDiv = document.getElementById('errorMsg');

  // example front-end account: admin / 123
  if(u === 'admin' && p === '123'){
    localStorage.setItem('loggedIn', 'true');
    window.location.href = 'index.html';
  } else {
    errorDiv.textContent = "Invalid username or password";
  }
}

// ===== LOGOUT FUNCTION =====
function logout(){
  localStorage.removeItem('loggedIn');
  window.location.href = 'login.html';
}
