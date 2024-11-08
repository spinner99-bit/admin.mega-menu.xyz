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

const scriptURL = 'https://script.google.com/macros/s/AKfycbxho3OIQX_WY6nN7I7-herrkjy6Wy006Efza2UWBBdvi0uMJjcRfSQr3v4Y_jssYWDK/exec'

const form = document.forms['add-player']

    form.addEventListener('submit', e => {
    e.preventDefault()
    fetch(scriptURL, { method: 'POST', body: new FormData(form)})
    .then(response => alert("Successfully added new player." ))
    .then(() => { window.location.reload(); })
    .catch(error => console.error('Error! Please try again', error.message))
    })

const audio = new Audio();
audio.src = "Element/sounds.mp3";

const API_URL = 'https://script.google.com/macros/s/AKfycbxho3OIQX_WY6nN7I7-herrkjy6Wy006Efza2UWBBdvi0uMJjcRfSQr3v4Y_jssYWDK/exec'; // 替换为您的 API URL

let playerData = []; // 用于存储从 API 获取的数据
let sortDirection = true; // 用于跟踪升序或降序排序

window.onload = function() {
    checkLoginStatus(); // 检查登录状态（如果有的话）
    
    fetch(API_URL)
    .then(response => response.json())
    .then(data => {
        console.log("Fetched data:", data); // 调试：检查数据结构
        playerData = data.playerData || []; // 确保正确引用 playerData
        populateTable(playerData);
    })
    .catch(error => console.error('Error fetching data:', error));

function populateTable(data) {
    const tableBody = document.getElementById('playerTable').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = ''; // 清空表格内容

    data.forEach(row => {
        const newRow = tableBody.insertRow();
        row.forEach(cell => {
            const newCell = newRow.insertCell();
            newCell.textContent = cell;
        });
    });
}
};

function searchUsers() {
    const searchValue = document.getElementById('searchBox').value.toLowerCase(); // 获取搜索框的值并转换为小写
    const filteredData = playerData.filter(row =>
        row.some(cell => cell.toString().toLowerCase().includes(searchValue)) // 检查每一列的值是否包含搜索值
    );
    populateTable(filteredData); // 更新表格显示
}