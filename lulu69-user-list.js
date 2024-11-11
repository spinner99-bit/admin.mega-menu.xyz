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

// 获取元素
const formOverlay = document.getElementById('formOverlay');
const userForm = document.getElementById('userForm');
const submitButton = document.getElementById('submitButton');
const addUserMessage = document.getElementById('addUserMessage');

// 提交表单时，调用注册用户的函数
userForm.addEventListener('submit', async function (e) {
    e.preventDefault(); // 阻止表单默认提交

    // 自动生成 Username
     const username = 'user_' + Math.floor(Math.random() * 100000);

    // 获取表单数据
    const password = document.getElementById('registerPassword').value.trim();
    const fullName = document.getElementById('registerFullName').value.trim();
    const wanumber = document.getElementById('registerWaNumber').value.trim();

    // 数据验证（根据需要调整）
    if (!username || !password) {
        addUserMessage.textContent = 'Username and Password are required!';
        return;
    }

    // 调用 Apps Script 来处理用户注册
    const response = await fetch('https://script.google.com/macros/s/AKfycbzKNejXZNkbN7uJH87Yaa3VqGfx0gUE77WNB1Ibe1rrK9g_oCOjtVgkAQ6Ot_PfLCWz/exec', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            action: 'register',
            username: username,
            password: password,
            fullName: fullName,
            wanumber: wanumber,
          })
    });

    const data = await response.json();

    // 处理响应数据
    if (data.success) {
        // 注册成功后，关闭表单并清空表单
        formOverlay.style.display = 'none';
        userForm.reset();
        addUserMessage.textContent = 'Successfully Add User!'; // 成功提示信息

        // 调用 fetchData() 函数来获取并显示所有用户
        fetchData();
    } else {
        // 注册失败，显示错误信息
        addUserMessage.textContent = data.message;
    }
});

// 显示表单
const addUserButton = document.getElementById('addUser');
addUserButton.addEventListener('click', () => {
    formOverlay.style.display = 'block'; // 显示表单
});

// 关闭表单
const closeFormButton = document.getElementById('closeForm');
closeFormButton.addEventListener('click', () => {
    formOverlay.style.display = 'none'; // 隐藏表单
});


const scriptURL = 'https://script.google.com/macros/s/AKfycbzIBk0bCHMjDX0P2dSNzvJyJFMzaHOM2Q4R_Rk8PdfpHzRcY1R4BifGGZ1zTb0swUQa/exec';

async function fetchData() {
    const response = await fetch(scriptURL + '?action=getUsersData');
    let data = await response.json();

    // 假设第七列 (index 6) 是注册日期列，第六列 (index 5) 是最后登录日期列

    // 计算总用户数
    const totalUserCount = data.length;

    // 计算今天注册的用户数
    const today = new Date().toISOString().split('T')[0]; // 获取今天的日期，格式为 'yyyy-mm-dd'
    const newUserTodayCount = data.filter(row => new Date(row[6]).toISOString().split('T')[0] === today).length;

    // 计算今天登录的用户数
    const lastLoginTodayCount = data.filter(row => new Date(row[5]).toISOString().split('T')[0] === today).length;

    // 更新网页上的统计数字
    document.getElementById('countUserList').textContent = totalUserCount;
    document.getElementById('newUserTodayCount').textContent = newUserTodayCount;
    document.getElementById('lastLoginTodayCount').textContent = lastLoginTodayCount;

    // 假设第七列 (index 6) 是日期列，对数据按第七列时间进行降序排序
    data.sort((a, b) => new Date(b[6]) - new Date(a[6])); 

    const tbody = document.querySelector('#userTable tbody');
    tbody.innerHTML = '';

    data.forEach((row, rowIndex) => {
        const tr = document.createElement('tr');
        row.forEach((cell, colIndex) => {
            const td = document.createElement('td');
    
            if (colIndex === 7) { // 假设第 8 列 (index 7) 是 "Account Status" 列
                const select = document.createElement('select');
                const activeOption = document.createElement('option');
                activeOption.value = 'Active';
                activeOption.textContent = 'Active';
    
                const inactiveOption = document.createElement('option');
                inactiveOption.value = 'Inactive';
                inactiveOption.textContent = 'Inactive';
    
                select.appendChild(activeOption);
                select.appendChild(inactiveOption);
                select.value = cell; // 设置默认选项为当前状态
    
                // 设置初始颜色
                if (cell === 'Active') {
                    select.style.color = '#20a520';
                } else if (cell === 'Inactive') {
                    select.style.color = 'red';
                }
    
                // 监听状态更改事件
                select.addEventListener('change', () => {
                    if (select.value === 'Active') {
                        select.style.color = '#20a520';
                    } else if (select.value === 'Inactive') {
                        select.style.color = 'red';
                    }
                });
    
                select.setAttribute('data-row', rowIndex + 2);
                select.setAttribute('data-col', colIndex + 1);
                td.appendChild(select);
            } else {
                const input = document.createElement('textarea');
                input.rows = 2; // 设置 textarea 的行数为 5
                if (colIndex === 5 || colIndex === 6) { // 假设列 6 和 7 是日期列
                    const date = new Date(cell);
                    input.value = formatDateTime(date);
                } else {
                    input.value = cell;
                }
    
                input.setAttribute('data-row', rowIndex + 2);
                input.setAttribute('data-col', colIndex + 1);
                td.appendChild(input);
            }
            tr.appendChild(td);
        });
        
        const saveTd = document.createElement('td');
        const saveButton = document.createElement('button');
        saveButton.textContent = 'Save';
        saveButton.addEventListener('click', () => saveRow(rowIndex + 2));
        saveTd.appendChild(saveButton);
        tr.appendChild(saveTd);
        tbody.appendChild(tr);
    });
}


// 日期格式化函数
function formatDateTime(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
}

// 搜索用户
function searchUsers() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const rows = document.getElementById('userTable').getElementsByTagName('tbody')[0].rows;

    for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].cells;
        let rowContainsSearchTerm = false;

        for (let j = 0; j < cells.length - 1; j++) { // -1 to exclude the Actions column if it shouldn't be searched
            const cellValue = cells[j].querySelector('textarea') ? cells[j].querySelector('textarea').value : cells[j].innerText;
            if (cellValue.toLowerCase().includes(searchTerm)) {
                rowContainsSearchTerm = true;
                break;
            }
        }

        // 显示匹配的行，隐藏不匹配的行
        rows[i].style.display = rowContainsSearchTerm ? '' : 'none';
    }
}

async function saveRow(row) {
    const rowElements = Array.from(document.querySelectorAll(`[data-row="${row}"]`));
    
    // 获取当前行的用户 ID (假设 ID 在第一列)
    const userId = rowElements[0].value;

    // 显示加载图标
    document.querySelector('.loading-icon').style.display = 'block';

    for (let cell of rowElements) {
        const col = cell.getAttribute('data-col');
        const newValue = cell.value;

        try {
            const response = await fetch(scriptURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `action=updateUserData&userId=${userId}&col=${col}&newValue=${encodeURIComponent(newValue)}`
            });
            
            const result = await response.json();
            console.log(result); // 调试输出，查看 Apps Script 的返回
            
            if (!result.success) {
                alert(`Error updating data: ${result.message}`);
                document.querySelector('.loading-icon').style.display = 'none'; // 隐藏加载图标
                return;
            }
        } catch (error) {
            console.error("Fetch error: ", error);
            alert('Failed to update data. Check console for details.');
            document.querySelector('.loading-icon').style.display = 'none'; // 隐藏加载图标
            return;
        }
    }

    alert('Successfully Updated User Info!');
    document.querySelector('.loading-icon').style.display = 'none'; // 隐藏加载图标
}

  

// 页面加载时，自动检查登录状态并加载游戏列表
window.onload = function() {
    checkLoginStatus();
    fetchData();
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
