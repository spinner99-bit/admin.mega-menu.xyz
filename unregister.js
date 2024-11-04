// 检查用户登录状态
function checkLoginStatus() {
    const username = localStorage.getItem('username');
    const headerDiv = document.getElementById('header');

    if (!username) {
        // 如果未登录，跳转到 login.html
        window.location.href = 'login.html';
    } else {
        // 如果已登录，显示欢迎信息和登出按钮
        const welcomeMessage = `Welcome, ${username}`;
        headerDiv.innerHTML = `
            <div class="welcome-message">${welcomeMessage}</div>
            <button class="logout-btn" onclick="logout()"><i class='bx bx-log-out-circle'></i></button>
        `;
    }
}

document.addEventListener("DOMContentLoaded", function() {
    const currentPath = window.location.pathname;

    // 检查路径是否以 .html 结尾
    if (currentPath.endsWith('.html')) {
        const newPath = currentPath.slice(0, -5);
        history.replaceState(null, '', newPath);
    }
});

// 退出登录功能
function logout() {
    // 清除登录信息
    localStorage.removeItem('username');
    localStorage.removeItem('fullName');
    localStorage.removeItem('phoneNumber');
    localStorage.removeItem('option1');
    localStorage.removeItem('number2');
    localStorage.removeItem('option2');

    // 跳转回登录页面
    window.location.href = 'login.html';
}

// 页面加载时，自动检查登录状态并加载游戏列表
window.onload = function() {
    checkLoginStatus();
};

// 控制侧边栏的显示和隐藏
const menuBtn = document.querySelector('.menuBtnC');
const sidebar = document.getElementById('sidebar');
const closeSidebarBtn = document.getElementById('closeSidebar');

menuBtn.addEventListener('click', () => {
    sidebar.classList.toggle('active'); // 点击按钮切换侧边栏显示状态
});

closeSidebarBtn.addEventListener('click', () => {
    sidebar.classList.remove('active'); // 点击关闭按钮隐藏侧边栏
});

// 添加新行
function addRow() {
    const table = document.getElementById('dynamicTable').getElementsByTagName('tbody')[0];
    const newRow = table.insertRow();
    const cell1 = newRow.insertCell(0);
    const cell2 = newRow.insertCell(1);
    const cell3 = newRow.insertCell(2);

    cell1.innerHTML = `
        <select>
            <option value="MB33">MB33</option>
            <option value="VR46">VR46</option>
            <option value="GC77">GC77</option>
        </select>
    `;
    cell2.innerHTML = `<input type="number" placeholder="Mobile Number">`;
    cell3.innerHTML = `<button onclick="deleteRow(this)">Delete</button>`;
}

// 删除指定行
function deleteRow(button) {
    const row = button.closest('tr');
    row.remove();
}

// 提交表格数据
async function submitForm() {
    const rows = document.querySelectorAll('#dynamicTable tbody tr');
    const data = Array.from(rows).map(row => {
        const selectValue = row.querySelector('select').value;
        const inputValue = row.querySelector('input').value;
        return { selectValue, inputValue };
    });

    fetch('https://script.google.com/macros/s/AKfycbwzbiTDVqnBQqXHzseZrY6Qy17g4ViTFNCAAEfURLN7K1I30aQBUo845Zui-j0BBKh0aw/exec', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data }),
        mode: 'no-cors' // 设置 no-cors 模式
    });

    // 通知用户保存成功
    alert('Data submitted successfully!');

    // 清空表格内容并保留表头
    const tableBody = document.querySelector('#dynamicTable tbody');
    tableBody.innerHTML = ''; // 清空表格的所有行

    // 添加初始的一行
    addRow();
}
