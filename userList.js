document.addEventListener('contextmenu', event => event.preventDefault());

document.addEventListener('keydown', function (e) {
    if (e.keyCode == 123) { // F12
        e.preventDefault();
    }
});

let currentSortField = 'registrationTime'; // 默认排序字段为 'Created At'
let currentSortOrder = 'desc'; // 默认排序顺序为降序

// 获取所有用户信息并展示在表格中
function fetchAllUsers() {
    fetch('https://script.google.com/macros/s/AKfycbyQLjxSByVgzhSby7ptQzsyYixHlMp34C1DN2P7Iz_EvL7SdkkvhYoajmPnhiipsajf/exec', {
        method: 'POST',
        body: new URLSearchParams({ action: 'getAllUsers' })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const users = data.users;
            const tableBody = document.getElementById('usersTable').getElementsByTagName('tbody')[0];
            const countUserList = document.getElementById('countUserList');
            const newUserTodayCount = document.getElementById('newUserTodayCount'); // 新用户数量显示
            const lastLoginTodayCount = document.getElementById('lastLoginTodayCount'); // 今天最后登入用户数量显示

            // 获取当前日期并清除时间部分（只保留年、月、日）
            const today = new Date();
            today.setHours(0, 0, 0, 0); // 清除小时、分钟、秒和毫秒
                
            let newUsersToday = 0;  // 记录今天注册的新用户数量
            let lastLoginToday = 0; // 记录最后登录时间是今天的用户数量

            // 更新用户总数
            countUserList.innerText = users.length; // 显示用户总数
            tableBody.innerHTML = ''; // 清空表格内容

            // 默认按 Created At 降序排序
            users.sort((a, b) => new Date(b.registrationTime) - new Date(a.registrationTime));

            users.forEach((user, index) => {
                const registrationDate = new Date(user.registrationTime);
                registrationDate.setHours(0, 0, 0, 0); // 只保留年、月、日

                const lastLoginDate = new Date(user.lastLoginDate);
                lastLoginDate.setHours(0, 0, 0, 0); // 只保留年、月、日

                // 统计今天注册的新用户
                if (registrationDate.getTime() === today.getTime()) {
                    newUsersToday++;
                }

                // 统计最后登录时间是今天的用户
                if (lastLoginDate.getTime() === today.getTime()) {
                    lastLoginToday++;
                }

                const row = tableBody.insertRow();

                // 添加文本区域并设置为禁用状态
                row.insertCell(0).innerText = user.username; // 用户名不可更改
                row.insertCell(1).innerHTML = `<textarea id="password-${index}" disabled>${user.password}</textarea>`;
                row.insertCell(2).innerHTML = `<textarea id="fullName-${index}" disabled>${user.fullName}</textarea>`;
                row.insertCell(3).innerHTML = `<textarea id="wanumber-${index}" disabled>${user.wanumber}</textarea>`;
                row.insertCell(4).innerHTML = `<textarea id="instaID-${index}" disabled>${user.instaID}</textarea>`;
                row.insertCell(5).innerHTML = `<textarea id="wallet-${index}" disabled>${user.walletAmount}</textarea>`;
                
                // 使用自定义的日期格式化
                row.insertCell(6).innerText = formatDateTime(new Date(user.lastLoginDate));
                row.insertCell(7).innerText = formatDateTime(new Date(user.registrationTime));

                // 账户状态下拉菜单（禁用）
                const statusCell = row.insertCell(8);
                const statusSelect = document.createElement('select');
                statusSelect.id = `status-${index}`;
                statusSelect.disabled = true; // 默认禁用

                // 创建下拉菜单选项
                const activeOption = new Option('Active', 'Active');
                const inactiveOption = new Option('Inactive', 'Inactive');

                // 根据用户状态设置选中项和颜色
                if (user.accountStatus === 'Active') {
                    activeOption.selected = true;
                    statusSelect.style.color = '#20a520'; // Active 状态字体为绿色
                } else if (user.accountStatus === 'Inactive') {
                    inactiveOption.selected = true;
                    statusSelect.style.color = 'red'; // Inactive 状态字体为红色
                }

                // 将选项添加到下拉菜单
                statusSelect.appendChild(activeOption);
                statusSelect.appendChild(inactiveOption);

                // 将下拉菜单添加到单元格
                statusCell.appendChild(statusSelect);

                // 添加 Edit 按钮
                const actionCell = row.insertCell(9);
                const editButton = document.createElement('button');
                editButton.innerText = 'Edit';
                editButton.classList.add('edit-save-button'); // 添加样式类
                editButton.onclick = function() {
                    if (editButton.innerText === 'Edit') {
                        // 点击 Edit 时解锁输入框并将按钮改为 Save
                        toggleInputs(index, false);
                        editButton.innerText = 'Save';
                    } else {
                        // 点击 Save 时保存用户的更改并禁用输入框
                        saveUserChanges(user.username, index);
                        toggleInputs(index, true);
                        editButton.innerText = 'Edit';
                    }
                };
                actionCell.appendChild(editButton);
            });
            // 更新页面中的统计数据
            newUserTodayCount.innerText = newUsersToday; // 显示今天的新用户数量
            lastLoginTodayCount.innerText = lastLoginToday; // 显示今天最后登录的用户数量
        } else {
            alert('Failed to retrieve users.');
        }
    })
    .catch(error => console.error('Error:', error));
}

// 日期格式化函数
function formatDateTime(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
}

// 搜索用户
function searchUsers() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const rows = document.getElementById('usersTable').getElementsByTagName('tbody')[0].rows;

    for (let i = 0; i < rows.length; i++) {
        const username = rows[i].cells[0].innerText.toLowerCase();
        const fullName = rows[i].cells[2].querySelector('textarea').value.toLowerCase();

        // 检查用户名或全名是否包含搜索词
        if (username.includes(searchTerm) || fullName.includes(searchTerm)) {
            rows[i].style.display = ''; // 显示匹配的行
        } else {
            rows[i].style.display = 'none'; // 隐藏不匹配的行
        }
    }
}

// 切换输入框的禁用状态
function toggleInputs(index, isDisabled) {
    document.getElementById(`password-${index}`).disabled = isDisabled;
    document.getElementById(`fullName-${index}`).disabled = isDisabled;
    document.getElementById(`wanumber-${index}`).disabled = isDisabled;
    document.getElementById(`instaID-${index}`).disabled = isDisabled;
    document.getElementById(`wallet-${index}`).disabled = isDisabled;
    document.getElementById(`status-${index}`).disabled = isDisabled; // 解锁状态下拉菜单
}

// 保存用户更改
function saveUserChanges(username, index) {
    const newPassword = document.getElementById(`password-${index}`).value;
    const newFullName = document.getElementById(`fullName-${index}`).value;
    const newWanumber = document.getElementById(`wanumber-${index}`).value;
    const newInstaID = document.getElementById(`instaID-${index}`).value;
    const newWalletAmount = document.getElementById(`wallet-${index}`).value;
    const newStatus = document.getElementById(`status-${index}`).value;

    fetch('https://script.google.com/macros/s/AKfycbyQLjxSByVgzhSby7ptQzsyYixHlMp34C1DN2P7Iz_EvL7SdkkvhYoajmPnhiipsajf/exec', {
        method: 'POST',
        body: new URLSearchParams({
            action: 'updateUserDetails',
            username: username,
            password: newPassword,
            fullName: newFullName,
            wanumber: newWanumber,
            instaID: newInstaID,
            walletAmount: newWalletAmount,
            status: newStatus
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('User updated successfully.');
        } else {
            alert('Failed to update user.');
        }
    })
    .catch(error => console.error('Error:', error));

    // 保存成功后，重新获取所有用户数据并刷新表格
    fetchAllUsers();
}

// 排序功能
function sortTable(field) {
    const tableBody = document.getElementById('usersTable').getElementsByTagName('tbody')[0];

    // 获取当前用户数据
    const users = Array.from(tableBody.rows).map(row => {
        return {
            username: row.cells[0].innerText,
            password: row.cells[1].querySelector('textarea').value,
            fullName: row.cells[2].querySelector('textarea').value,
            wanumber: row.cells[3].querySelector('textarea').value,
            instaID: row.cells[4].querySelector('textarea').value,
            walletAmount: parseFloat(row.cells[5].querySelector('textarea').value), // 转换为数字
            lastLoginDate: new Date(row.cells[6].innerText),
            registrationTime: new Date(row.cells[7].innerText),
            accountStatus: row.cells[8].querySelector('select').value
        };
    });

    // 确定排序方式
    if (currentSortField === field) {
        currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc'; // 切换排序顺序
    } else {
        currentSortField = field; // 更新当前排序字段
        currentSortOrder = 'asc'; // 默认升序
    }

    // 排序用户数据
    users.sort((a, b) => {
        const valueA = a[field];
        const valueB = b[field];
        if (currentSortOrder === 'asc') {
            return valueA < valueB ? -1 : 1;
        } else {
            return valueA > valueB ? -1 : 1;
        }
    });

    // 更新表格
    tableBody.innerHTML = ''; // 清空表格内容
    users.forEach((user, index) => {
        const row = tableBody.insertRow();
        row.insertCell(0).innerText = user.username; // 用户名不可更改
        row.insertCell(1).innerHTML = `<textarea id="password-${index}" disabled>${user.password}</textarea>`;
        row.insertCell(2).innerHTML = `<textarea id="fullName-${index}" disabled>${user.fullName}</textarea>`;
        row.insertCell(3).innerHTML = `<textarea id="wanumber-${index}" disabled>${user.wanumber}</textarea>`;
        row.insertCell(4).innerHTML = `<textarea id="instaID-${index}" disabled>${user.instaID}</textarea>`;
        row.insertCell(5).innerHTML = `<textarea id="wallet-${index}" disabled>${user.walletAmount}</textarea>`;
        row.insertCell(6).innerText = user.lastLoginDate.toLocaleString();
        row.insertCell(7).innerText = user.registrationTime.toLocaleString();
        const statusCell = row.insertCell(8);
        const statusSelect = document.createElement('select');
        statusSelect.id = `status-${index}`;
        statusSelect.disabled = true; // 默认禁用
        const activeOption = new Option('Active', 'Active', user.accountStatus === 'Active');
        const inactiveOption = new Option('Inactive', 'Inactive', user.accountStatus === 'Inactive');
        statusSelect.appendChild(activeOption);
        statusSelect.appendChild(inactiveOption);
        statusCell.appendChild(statusSelect);
        const actionCell = row.insertCell(9);
        const editButton = document.createElement('button');
        editButton.innerText = 'Edit';
        editButton.classList.add('edit-save-button'); // 添加样式类
        editButton.onclick = function() {
            if (editButton.innerText === 'Edit') {
                toggleInputs(index, false);
                editButton.innerText = 'Save';
            } else {
                saveUserChanges(user.username, index);
                toggleInputs(index, true);
                editButton.innerText = 'Edit';
            }
        };
        actionCell.appendChild(editButton);
    });
}

// 获取元素
const formOverlay = document.getElementById('formOverlay');
const userForm = document.getElementById('userForm');
const submitButton = document.getElementById('submitButton');
const addUserMessage = document.getElementById('addUserMessage');

// 提交表单时，调用注册用户的函数
userForm.addEventListener('submit', async function (e) {
    e.preventDefault(); // 阻止表单默认提交

    // 获取表单数据
    const username = document.getElementById('registerUsername').value.trim();
    const password = document.getElementById('registerPassword').value.trim();
    const fullName = document.getElementById('registerFullName').value.trim();
    const wanumber = document.getElementById('registerWaNumber').value.trim();
    const instaID = document.getElementById('registerInstagramID').value.trim();

    // 数据验证（根据需要调整）
    if (!username || !password) {
        addUserMessage.textContent = 'Username and Password are required!';
        return;
    }

    // 调用 Apps Script 来处理用户注册
    const response = await fetch('https://script.google.com/macros/s/AKfycbzasmeVkZVhxYl4sTGRBqPmnC39CI3aUmY3jWgEF6ZVDJpTdKvKtDqD3CqcI-pD7ZGO/exec', {
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
            instaID: instaID
          })
    });

    const data = await response.json();

    // 处理响应数据
    if (data.success) {
        // 注册成功后，关闭表单并清空表单
        formOverlay.style.display = 'none';
        userForm.reset();
        addUserMessage.textContent = 'Successfully Add User!'; // 成功提示信息

        // 调用 fetchAllUsers() 函数来获取并显示所有用户
        fetchAllUsers();
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
    fetchAllUsers();
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
