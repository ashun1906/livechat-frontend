const API_URL = "https://livechat-backend-5hck.onrender.com"; // Đổi lại khi deploy thật
// Light/Dark mode
function setMode(mode) {
    if (mode === 'dark') {
        document.body.classList.add('dark');
        document.getElementById('mode-toggle').innerText = '☀️ Light Mode';
    } else {
        document.body.classList.remove('dark');
        document.getElementById('mode-toggle').innerText = '🌙 Dark Mode';
    }
    localStorage.setItem('mode', mode);
}
document.getElementById('mode-toggle').onclick = function() {
    const mode = document.body.classList.contains('dark') ? 'light' : 'dark';
    setMode(mode);
};
// Hiển thị username viết hoa toàn bộ
function showWelcome() {
    const username = (localStorage.getItem('token') || '').toUpperCase();
    if (username) {
        document.getElementById('welcome-msg').style.display = '';
        document.getElementById('welcome-msg').innerText = `Xin chào ${username} đã đến với Quản lý Livechat.`;
    } else {
        document.getElementById('welcome-msg').style.display = 'none';
    }
}
function showLogin() {
    document.getElementById('login-section').style.display = '';
    document.getElementById('table-section').style.display = 'none';
    document.getElementById('welcome-msg').style.display = 'none';
}
function showTable() {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('table-section').style.display = '';
    showWelcome();
}
function logout() {
    localStorage.removeItem('token');
    showLogin();
}
async function login(username, password) {
    const form = new URLSearchParams();
    form.append('username', username);
    form.append('password', password);
    try {
        const res = await fetch(API_URL + '/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: form
        });
        if (!res.ok) throw new Error('Sai tài khoản hoặc mật khẩu');
        const data = await res.json();
        localStorage.setItem('token', data.access_token);
        showTable();
        fetchData();
    } catch (e) {
        document.getElementById('login-error').innerText = e.message;
    }
}
async function fetchData() {
    const token = localStorage.getItem('token');
    if (!token) return showLogin();
    try {
        const res = await fetch(API_URL + '/data', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        if (!res.ok) throw new Error('Phiên đăng nhập hết hạn');
        const data = await res.json();
        renderTable(data.data);
    } catch (e) {
        logout();
    }
}
function renderTable(data) {
    const tbody = document.getElementById('data-table');
    tbody.innerHTML = '';
    data.forEach(row => {
        const tr = document.createElement('tr');
        const td1 = document.createElement('td');
        td1.className = 'platform';
        td1.innerText = row.platform;
        const td2 = document.createElement('td');
        td2.className = 'chatting';
        td2.innerText = row.chatting;
        tr.appendChild(td1);
        tr.appendChild(td2);
        tbody.appendChild(tr);
    });
}
// Tự động cập nhật mỗi 3 giây
setInterval(fetchData, 3000);
// Xử lý login form
document.getElementById('login-form').onsubmit = function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    login(username, password);
};
// Khi load trang, kiểm tra token và chế độ giao diện
window.onload = function() {
    const mode = localStorage.getItem('mode') || 'dark';
    setMode(mode);
    if (localStorage.getItem('token')) {
        showTable();
        fetchData();
    } else {
        showLogin();
    }
};
// Đổi mật khẩu
document.getElementById('change-password-btn').onclick = function() {
    const form = document.getElementById('change-password-form');
    form.style.display = (form.style.display === 'none') ? '' : 'none';
    document.getElementById('change-password-error').innerText = '';
    document.getElementById('change-password-success').innerText = '';
};
document.getElementById('change-password-form').onsubmit = async function(e) {
    e.preventDefault();
    const newPw = document.getElementById('new-password').value;
    const confirmPw = document.getElementById('confirm-password').value;
    const errorDiv = document.getElementById('change-password-error');
    const successDiv = document.getElementById('change-password-success');
    errorDiv.innerText = '';
    successDiv.innerText = '';
    if (!newPw || !confirmPw) {
        errorDiv.innerText = 'Vui lòng nhập đầy đủ thông tin.';
        return;
    }
    if (newPw !== confirmPw) {
        errorDiv.innerText = 'Mật khẩu xác nhận không khớp.';
        return;
    }
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(API_URL + '/change-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({ new_password: newPw })
        });
        if (!res.ok) throw new Error(await res.text());
        successDiv.innerText = 'Đổi mật khẩu thành công!';
        document.getElementById('new-password').value = '';
        document.getElementById('confirm-password').value = '';
    } catch (e) {
        errorDiv.innerText = e.message || 'Đổi mật khẩu thất bại!';
    }
}; 