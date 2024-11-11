document.addEventListener('contextmenu', event => event.preventDefault());

document.addEventListener('keydown', function (e) {
    if (e.keyCode == 123) { // F12
        e.preventDefault();
    }
});

async function fetchUploadRecords() {
    const response = await fetch('https://script.google.com/macros/s/AKfycbzw8ItExJADqz0sQgjUZ89OqjSC-fK7JLN_8B86gcRoeoNG8k2aHNcH_spBzckQCP4m/exec?action=getUploadRecords');
    const data = await response.json();

    if (data.success) {
        const tbody = document.querySelector('#recordsTable tbody');
        tbody.innerHTML = ''; // 清空表格内容

        const totalRecords = data.records.length; // 获取总记录数
        let todayCount = 0; // 今天的记录计数
        const usernames = new Set(); // 存储唯一用户

        data.records.forEach((record, index) => {
            const formattedTime = formatDateTime(record.uploadTime); // 格式化时间
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${totalRecords - index}</td>
                <td>${record.username}</td>
                <td>${record.instaID}</td>
                <td><img src="${record.photoUrl}" alt="Photo" style="width: 100px; height: auto;"></td>
                <td>${formattedTime}</td>
                <td>${record.uploadID}</td> <!-- 添加 uploadID 列 -->
                <td>
                    <i class='bx bxs-trash' style="cursor: pointer;" data-username="${record.username}" data-uploadID="${record.uploadID}"></i>
                </td>
            `;
            tbody.appendChild(row);

            // 为删除按钮添加点击事件
            row.querySelector('.bxs-trash').addEventListener('click', async (event) => {
                const username = event.target.getAttribute('data-username');
                const uploadID = event.target.getAttribute('data-uploadID');
                await deleteRecord(uploadID);
            });

            // 统计今天的记录和唯一用户
            const uploadDate = new Date(record.uploadTime);
            const today = new Date();
            if (uploadDate.getDate() === today.getDate() && 
                uploadDate.getMonth() === today.getMonth() && 
                uploadDate.getFullYear() === today.getFullYear()) {
                todayCount++;
            }
            usernames.add(record.username);
        });

        // 更新统计数据
        document.getElementById('countPost').textContent = totalRecords;
        document.getElementById('countTodayPost').textContent = todayCount;
        document.getElementById('countMembers').textContent = usernames.size; // 计算唯一用户数
    } else {
        console.error('Failed to fetch records:', data.message);
    }
}

async function deleteRecord(uploadID) {
    try {
        const response = await fetch('https://script.google.com/macros/s/AKfycbwE6fvYc6Z7vXRa2URbH0SExD0pCLOM5kdLuIEse4oYYMzpjQhS5FuK7K88oWSeqFe2/exec?action=deleteUploadRecord', {
            method: 'POST',
            mode: 'no-cors', // 使用 no-cors 模式
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ uploadID }) // 发送 uploadID
        });

        // 无法访问响应内容，但仍可提示用户
        alert('Record deletion request sent successfully!'); // 提示用户请求已发送

        fetchUploadRecords(); // 刷新记录
    } catch (error) {
        console.error('An error occurred while deleting record:', error);
        alert('An error occurred while sending the deletion request.'); // 提示用户发生错误
    }
}



function formatDateTime(dateTimeString) {
    const date = new Date(dateTimeString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
}

// 搜索功能
document.getElementById('searchBox').addEventListener('input', function() {
    const filter = this.value.toLowerCase();
    const rows = document.querySelectorAll('#recordsTable tbody tr');
    
    rows.forEach(row => {
        const username = row.cells[1].textContent.toLowerCase();
        const instagramId = row.cells[2].textContent.toLowerCase();
        const uploadTime = row.cells[4].textContent.toLowerCase(); // 假设上传时间在第4列
        
        // 检查是否有任一字段包含搜索字符串
        if (username.includes(filter) || instagramId.includes(filter) || uploadTime.includes(filter)) {
            row.style.display = ''; // 显示行
        } else {
            row.style.display = 'none'; // 隐藏行
        }
    });
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

// 页面加载时，自动检查登录状态并加载游戏列表
window.onload = function() {
    checkLoginStatus();
    fetchUploadRecords()
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
