document.addEventListener('contextmenu', event => event.preventDefault());

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
        window.location.href = '../login';
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
    window.location.href = '../login';
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

// 将 submitForm 函数放在全局作用域中
function submitForm() {
    const phone = $('#phone').val();
    const amount = $('#amount').val();
    const amountWithZero = $('#amountWithZero').val();
    const bonus = $('#bonus').val();
    const totalAmount = $('#totalAmount').val();
    const orderId = 'Lu69' + new Date().getTime(); // 创建订单 ID
    // const status = 'Approve';
    const submitTime = new Date().toLocaleString(); // 获取提交时间
    const agentName = localStorage.getItem('username');

    // 准备要发送到 Google Apps Script 的数据
    const data = {
        phone: phone,
        amount: amount,
        amountWithZero: amountWithZero,
        bonus: bonus,
        totalAmount: totalAmount,
        orderId: orderId,
        // status: status,
        submitTime: submitTime,
        agentName: agentName
    };

    // 调用 Google Apps Script Web 应用来保存数据
    saveToGoogleSheets(data);
}

// 计算 amountWithZero, bonus, totalAmount
function calculateFields(amount) {
    const amountWithZero = amount * 100;  // 将 amount 转换为数字并乘以 100
    let bonus;

    // 根据金额自动决定奖金
    if (amountWithZero < 1000) {
        bonus = 0;
    } else if (amountWithZero >= 1000 && amountWithZero <= 1999) {
        bonus = 250;
    } else if (amountWithZero >= 2000 && amountWithZero <= 2999) {
        bonus = 500;
    } else if (amountWithZero >= 3000 && amountWithZero <= 4999) {
        bonus = 850;
    } else if (amountWithZero >= 5000 && amountWithZero <= 9999) {
        bonus = 1500;
    } else if (amountWithZero >= 10000 && amountWithZero <= 19999) {
        bonus = 3450;
    } else if (amountWithZero >= 20000 && amountWithZero <= 39999) {
        bonus = 7450;
    } else if (amountWithZero >= 30000 && amountWithZero <= 49999) {
        bonus = 12050;
    } else if (amountWithZero >= 50000 && amountWithZero <= 99999) {
        bonus = 22500;
    } else if (amountWithZero >= 100000) {
        bonus = 50000;
    }

    const totalAmount = amountWithZero + bonus;  // 计算总金额，确保是数字相加

    // 更新输入框的值
    $('#amountWithZero').val(amountWithZero);
    $('#bonus').val(bonus);
    $('#totalAmount').val(totalAmount);
}


// 使用 fetch API 调用 Google Apps Script 的 Web 应用
function saveToGoogleSheets(data) {
    const url = 'https://script.google.com/macros/s/AKfycbxnI9R2MBfc4XZZekDI5co6uWxhdGhTidLANf_-Z75SMgAsRLqU5_ue4Bb6sZQrtb5o/exec'; // Web 应用的 URL

    // 将数据作为 JSON 字符串发送
    fetch(url, {
        method: 'POST',
        body: JSON.stringify({
            action: 'saveOrderLog',  // action 参数
            data: data  // 实际数据
        })
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            alert('Reload Points to users successfully.');
            location.reload();
        } else {
            alert('Misstake : '+ result.message);
        }
    })
    .catch(error => {
        alert('Misstake : ' + error);
    });
}

$(document).ready(function() {
    // 监听 #amount 输入框的变化
    $('#amount').on('input', function() {
        const amount = parseFloat($('#amount').val());

        // 确保输入的是数字并且大于零
        if (!isNaN(amount) && amount > 0) {
            calculateFields(amount);  // 调用计算函数
        }
    });

    // 绑定提交按钮的点击事件
    $('#submitButton').on('click', submitForm);
});

let currentPage = 1; // 确保在文件顶部定义并初始化currentPage
let transactionsData = []; // 所有交易记录数据

// 获取交易记录
function getScoreLog() {
    fetch('https://script.google.com/macros/s/AKfycbw5pp4pC3NdGeJQTqLpGURIs0hL6lu1wI3n54NsGlKeqK0jBoXE4QS8irvSiBGLyVjL/exec?action=getScoreLog')
    .then(response => response.json())
    .then(data => {
        // console.log(data); // 打印数据查看结构
        transactionsData = data;
        displayTransactions(); // 数据获取后展示交易记录
    })
    .catch(error => console.error('获取数据失败:', error));

}

// 展示交易记录并分页
function displayTransactions() {
    if (transactionsData.length === 0) {
        console.log('没有数据可显示');
        return;
    }
    const tbody = document.querySelector('#scoreLogTable tbody');
    tbody.innerHTML = ''; // 清空表格内容

    const rowsPerPage = document.getElementById('rowsPerPage').value;
    const numRows = rowsPerPage === 'all' ? transactionsData.length : parseInt(rowsPerPage);

    const startIdx = (currentPage - 1) * numRows;
    const endIdx = rowsPerPage === 'all' ? transactionsData.length : Math.min(startIdx + numRows, transactionsData.length);
    const displayedData = transactionsData.slice(startIdx, endIdx);

    displayedData.forEach(transaction => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="setScore-customer">${transaction[0] || ''}</td>          <!-- customer -->
            <td class="setScore-reload">${transaction[1] || ''}</td>          <!-- reloadAmount -->
            <td class="setScore-points">${transaction[2] || ''}</td>          <!-- convertPoints -->
            <td class="setScore-points">${transaction[3] || ''}</td>          <!-- bonus -->
            <td class="setScore-points">${transaction[4] || ''}</td>          <!-- totalPoints -->
            <td class="setScore-before">${transaction[5] || ''}</td>          <!-- beforeAfter -->
            <td class="setScore-orderID">${transaction[6] || ''}</td>          <!-- orderID -->
            <td class="setScore-time">${transaction[7] || ''}</td>          <!-- reloadTime -->
            <td class="setScore-time">${transaction[8] || ''}</td>
            <td class="setScore-text"><button onclick="copyToClipboard('${transaction[0]}', '${transaction[1]}', '${transaction[2]}', '${transaction[3]}', '${transaction[4]}', '${transaction[5]}', '${transaction[6]}')"><i class='bx bxs-copy-alt' ></i></button></td>
        `;
        tbody.appendChild(row);
    });

    updatePaginationButtons(numRows);
}


// 更新分页按钮
function updatePaginationButtons(numRows) {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = ''; // 清空分页按钮

    const totalPages = Math.ceil(transactionsData.length / numRows);
    const maxVisibleButtons = 3;
    const startPage = Math.max(1, currentPage - maxVisibleButtons);
    const endPage = Math.min(totalPages, currentPage + maxVisibleButtons);

    if (currentPage > 1) {
        const firstButton = createPaginationButton('1');
        firstButton.onclick = () => { currentPage = 1; displayTransactions(); };
        pagination.appendChild(firstButton);

        const prevButton = createPaginationButton('‹');
        prevButton.onclick = () => { currentPage--; displayTransactions(); };
        pagination.appendChild(prevButton);
    }

    for (let i = startPage; i <= endPage; i++) {
        const button = createPaginationButton(i);
        button.className = i === currentPage ? 'active' : '';
        button.onclick = () => { currentPage = i; displayTransactions(); };
        pagination.appendChild(button);
    }

    if (currentPage < totalPages) {
        const nextButton = createPaginationButton('›');
        nextButton.onclick = () => { currentPage++; displayTransactions(); };
        pagination.appendChild(nextButton);

        const lastButton = createPaginationButton(totalPages);
        lastButton.onclick = () => { currentPage = totalPages; displayTransactions(); };
        pagination.appendChild(lastButton);
    }
}

// 创建分页按钮
function createPaginationButton(text) {
    const button = document.createElement('button');
    button.textContent = text;
    return button;
}

// 搜索过滤交易记录
function filterTransactions() {
    // 获取搜索输入框的值并转为小写，便于进行不区分大小写的搜索
    const input = document.getElementById('searchTransaction');
    const filter = input.value.toLowerCase();

    // 获取表格主体部分
    const tbody = document.querySelector('#scoreLogTable tbody');
    // 获取所有表格行（tr）
    const rows = tbody.getElementsByTagName('tr');

    // 遍历每一行（tr）
    for (let i = 0; i < rows.length; i++) {
        // 获取当前行的所有单元格（td）
        const cells = rows[i].getElementsByTagName('td');
        let found = false; // 标记当前行是否符合过滤条件

        // 遍历当前行中的每个单元格（td）
        for (let j = 0; j < cells.length; j++) {
            // 获取单元格的文本内容（忽略HTML标签）
            const cellValue = cells[j].textContent || cells[j].innerText;

            // 如果单元格文本内容包含搜索关键字，则标记该行符合条件
            if (cellValue.toLowerCase().indexOf(filter) > -1) {
                found = true;
                break; // 一旦找到匹配项，停止继续检查该行
            }
        }

        // 根据是否找到匹配项，决定显示或隐藏当前行
        rows[i].style.display = found ? '' : 'none'; // 显示或隐藏行
    }
}


// 复制交易记录到剪贴板
function copyToClipboard(customer, reloadAmount, convertPoints, bonus, totalPoints, beforeAfter, orderID) {
    const textToCopy = `
**充值成功✅感谢老板支持 🫦撸撸69** 😍

🧸 充值用户 : ${customer}
🆔 交易 ID : ${orderID}
🔄 充值金币 : ${convertPoints}
🎁 额外奖金 : ${bonus}
⭐️ 总共获得 : ${totalPoints}
💎 充值前后余额 : ${beforeAfter}

⚠️ **如果金币还未到账可以试着下拉刷新网站**
🫦 **购买资源 👉 www.lulu69.online**
`.trim();

    navigator.clipboard.writeText(textToCopy)
        .then(() => {
            alert('Messages Copiee !');
        })
        .catch(err => {
            console.error('Error : ', err);
        });
}

// 监听每页显示行数的变化
document.getElementById('rowsPerPage').addEventListener('change', () => {
    currentPage = 1; // 切换每页行数时重置为第一页
    displayTransactions();
});


// 页面加载时，自动检查登录状态并加载游戏列表
window.onload = function() {
    checkLoginStatus();
    getScoreLog()
};
