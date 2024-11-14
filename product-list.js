//document.addEventListener('contextmenu', event => event.preventDefault());

document.addEventListener('keydown', function (e) {
    if (e.keyCode == 123) { // F12
        e.preventDefault();
    }
});

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

async function loadOptions() {
    const response = await fetch("https://script.google.com/macros/s/AKfycbz0RhbfORVEizH4uRROHAWVZNJirHagYi8nTlN36kMdbCsmoLObGqAcS2ze6NVeu5gWZg/exec");
    const data = await response.json();
    const selectElements = document.getElementsByName("productCategory");

    selectElements.forEach(select => {
        data.options.forEach(option => {
            const optionElement = document.createElement("option");
            optionElement.value = option;
            optionElement.textContent = option;
            select.appendChild(optionElement);
        });
    });
}

function addRow() {
    const table = document.getElementById("productTable");
    const newRow = table.insertRow();
    newRow.innerHTML = `
        <td><input type="text" name="productName" required></td>
        <td><select name="productCategory" required></select></td>
        <td><input type="number" name="productPrice" required></td>
        <td><input type="url" name="productLink" required></td>
        <td><input type="file" name="productPhoto" accept="image/*" required></td>
    `;
    loadOptions();  // 为新添加的行加载选项
}
