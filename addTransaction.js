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

const apiUrl = 'https://script.google.com/macros/s/AKfycbz57f5aK84Y_Mum8f2IqZaO5Om2u1vgLV78cTD6zVWUdCqN_zEUT5WCN3olBjGWwZHelg/exec'; // 替换为您的 Google Apps Script 部署链接

async function loadOptions() {
    const response = await fetch(apiUrl, {
        method: 'POST',
        body: new URLSearchParams({ action: 'loadOptions' })
    });
    const data = await response.json();

    const promotionSelects = document.querySelectorAll('select[name="promotion"]');
    const socialMediaSelects = document.querySelectorAll('select[name="socialMedia"]');

    data.promotionOptions.forEach(option => {
        promotionSelects.forEach(select => {
            const opt = document.createElement('option');
            opt.value = option;
            opt.textContent = option;
            select.appendChild(opt);
        });
    });

    data.socialMediaOptions.forEach(option => {
        socialMediaSelects.forEach(select => {
            const opt = document.createElement('option');
            opt.value = option;
            opt.textContent = option;
            select.appendChild(opt);
        });
    });
}

async function fetchProductLink(input) {
    const productName = input.value;
    if (productName) {
        const response = await fetch(apiUrl, {
            method: 'POST',
            body: new URLSearchParams({ action: 'fetchProductLink', productName })
        });
        const productLink = await response.json();
        input.closest('tr').querySelector('input[name="productLink"]').value = productLink;
    }
}

    function addRow() {
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td><input type="text" name="customer" /></td>
        <td><input type="text" name="productName" oninput="fetchProductLink(this)" /></td>
        <td><input type="text" name="productLink" readonly /></td>
        <td><select name="promotion"></select></td>
        <td><select name="socialMedia"></select></td>
        <td><input type="number" name="price" value="2.50" /></td> <!-- 设置默认值为 2.50 -->
        <td><button onclick="removeRow(this)">Remove</button></td>
    `;
    document.querySelector('#transactionTable tbody').appendChild(newRow);
    loadOptions();
}


function removeRow(button) {
    button.closest('tr').remove();
}

async function submitData() {
const rows = document.querySelectorAll('#transactionTable tbody tr');
const transactions = [];
const username = localStorage.getItem('username'); // 从 localStorage 获取用户名

if (!username) {
    alert("用户名未找到，请先登录。");
    return;
}

rows.forEach(row => {
    const customer = row.querySelector('input[name="customer"]').value;
    const productName = row.querySelector('input[name="productName"]').value;
    const productLink = row.querySelector('input[name="productLink"]').value;
    const promotion = row.querySelector('select[name="promotion"]').value;
    const socialMedia = row.querySelector('select[name="socialMedia"]').value;
    const price = row.querySelector('input[name="price"]').value;
    
    transactions.push({ 
        customer, 
        productName, 
        productLink, 
        promotion, 
        socialMedia, 
        price, 
        username  // 添加用户名到每条记录中
    });
});

const response = await fetch(apiUrl, {
    method: 'POST',
    body: new URLSearchParams({
        action: 'submitData',
        transactions: JSON.stringify(transactions)
    })
});

if (response.ok) {
    alert("Data submitted successfully!");
    location.reload(); // 提交成功后刷新页面
} else {
    alert("提交失败，请重试。");
}
}

// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
    const formattedDate = date.toLocaleString('en-GB', options);
    return formattedDate.replace(/\//g, '-').replace(',', '');
}

let currentPage = 1; // 当前页码
let transactionsData = []; // 全部交易数据

// 加载待处理的交易
async function loadPendingTransactions() {
    const response = await fetch(apiUrl, {
        method: 'POST',
        body: new URLSearchParams({ action: 'loadPendingTransactions' })
    });
    transactionsData = await response.json();

    // 对数据按日期进行排序，从最新到最旧
    transactionsData.sort((a, b) => new Date(b.date) - new Date(a.date));

    // 初始化分页
    currentPage = 1;
    displayTransactions();
}

// 显示指定页的数据
function displayTransactions() {
    const tbody = document.querySelector('#pendingTransaction tbody');
    tbody.innerHTML = ''; // 清空表格内容

    // 获取选择的每页显示行数
    const rowsPerPage = document.getElementById('rowsPerPage').value;
    const numRows = rowsPerPage === 'all' ? transactionsData.length : parseInt(rowsPerPage);

    // 计算开始和结束索引
    const startIdx = (currentPage - 1) * numRows;
    const endIdx = rowsPerPage === 'all' ? transactionsData.length : Math.min(startIdx + numRows, transactionsData.length);
    const displayedData = transactionsData.slice(startIdx, endIdx);

    // 动态生成表格行
    displayedData.forEach(transaction => {
        const row = document.createElement('tr');

        // 根据状态设置行背景颜色
        if (transaction.status === 'Approved') {
            row.style.backgroundColor = '#dcfbdf'; // 浅绿色
        } else if (transaction.status === 'Rejected') {
            row.style.backgroundColor = '#fbdcf1'; // 浅红色
        } else if (transaction.status === 'Pending') {
            row.style.backgroundColor = 'yellow'; // 浅黄色
        }

        row.innerHTML = `
            <td>${formatDate(transaction.date)}</td>
            <td class="toHide">${transaction.transactionId}</td>
            <td>${transaction.customer}</td>
            <td>${transaction.productName}</td>
            <td class="toHide">${transaction.promotion}</td>
            <td class="toHide">${transaction.socialMedia}</td>
            <td>${transaction.price}</td>
            <td>
                <select id="status-${transaction.transactionId}" onchange="updateTransactionStatus('${transaction.transactionId}')">
                    <option value="Pending" ${transaction.status === 'Pending' ? 'selected' : ''}>Pending</option>
                    <option value="Approved" ${transaction.status === 'Approved' ? 'selected' : ''}>Approve</option>
                    <option value="Rejected" ${transaction.status === 'Rejected' ? 'selected' : ''}>Reject</option>
                </select>
            </td>
            <td>
                <button onclick="saveTransaction('${transaction.transactionId}')" class="transaction-button-update"><i class='bx bxs-save'></i>Update</button>
                <button onclick="copyToCustomerMessage('${transaction.productName}', '${transaction.productLink}')" class="transaction-button-message"><i class='bx bxs-chat'></i>Message</button>
            </td>
        `;
        tbody.appendChild(row);
    });

    // 更新分页按钮
    updatePaginationButtons(numRows);

    // 更新显示的行数范围
    updateRowCountDisplay(startIdx + 1, endIdx, transactionsData.length);
}

// 更新行数显示
function updateRowCountDisplay(start, end, total) {
    const rowCountDisplay = document.querySelector('.transaction-page-select div:first-child');
    rowCountDisplay.textContent = `Showing ${start}-${end} of ${total}`;
}


// 更新分页按钮
function updatePaginationButtons(numRows) {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = ''; // 清空分页按钮

    const totalPages = Math.ceil(transactionsData.length / numRows);

    // 确定要显示的页码范围
    const maxVisibleButtons = 3; // 当前页前后最多显示3个按钮
    const startPage = Math.max(1, currentPage - maxVisibleButtons);
    const endPage = Math.min(totalPages, currentPage + maxVisibleButtons);

    // 创建首页和前一页按钮
    if (currentPage > 1) {
        const firstButton = document.createElement('button');
        firstButton.textContent = '1';
        firstButton.onclick = () => {
            currentPage = 1;
            displayTransactions();
        };
        pagination.appendChild(firstButton);

        const prevButton = document.createElement('button');
        prevButton.textContent = '‹';
        prevButton.onclick = () => {
            currentPage--;
            displayTransactions();
        };
        pagination.appendChild(prevButton);
    }

    // 创建中间的页码按钮（当前页前后三个）
    for (let i = startPage; i <= endPage; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.className = i === currentPage ? 'active' : '';
        button.onclick = () => {
            currentPage = i;
            displayTransactions();
        };
        pagination.appendChild(button);
    }

    // 创建下一页和末页按钮
    if (currentPage < totalPages) {
        const nextButton = document.createElement('button');
        nextButton.textContent = '›';
        nextButton.onclick = () => {
            currentPage++;
            displayTransactions();
        };
        pagination.appendChild(nextButton);

        const lastButton = document.createElement('button');
        lastButton.textContent = totalPages; // 显示总页数
        lastButton.onclick = () => {
            currentPage = totalPages;
            displayTransactions();
        };
        pagination.appendChild(lastButton);
    }
}

// 每当选择的每页行数变化时，重新加载数据
document.getElementById('rowsPerPage').addEventListener('change', () => {
    currentPage = 1;
    displayTransactions();
});



// 搜索过滤功能
function filterTransactions() {
    const input = document.getElementById('searchTransaction');
    const filter = input.value.toLowerCase();
    const tbody = document.querySelector('#pendingTransaction tbody');
    const rows = tbody.getElementsByTagName('tr');

    // 遍历所有行，检查每一行中的内容
    for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName('td');
        let found = false;

        // 遍历每个单元格，查找匹配
        for (let j = 0; j < cells.length; j++) {
            if (cells[j]) {
                const cellValue = cells[j].textContent || cells[j].innerText;
                if (cellValue.toLowerCase().indexOf(filter) > -1) {
                    found = true;
                    break; // 找到匹配后跳出循环
                }
            }
        }

        // 根据匹配结果显示或隐藏行
        if (found) {
            rows[i].style.display = ''; // 显示行
        } else {
            rows[i].style.display = 'none'; // 隐藏行
        }
    }
}

// 更新交易状态
async function updateTransactionStatus(transactionId) {
    const newStatus = document.querySelector(`#status-${transactionId}`).value; // 从选择框获取新的状态

    const response = await fetch(apiUrl, {
        method: 'POST',
        body: new URLSearchParams({
            action: 'updateTransactionStatus',
            transactionId,
            newStatus
        })
    });

    const result = await response.json();
    alert(result);

    // 刷新表格数据
    loadPendingTransactions();
}

// 复制消息内容到剪贴板
function copyToCustomerMessage(productName, productLink) {
    const message = `
下单成功✅感谢老板支持 **撸撸69** 😍

🎁 资源序列号 : ${productName}

🔗 资源链接 : ${productLink}

期待老板再次光临 **lulu69.mega-menu.xyz** 😎
`.trim();

    navigator.clipboard.writeText(message)
        .then(() => {
            alert('消息已复制到剪贴板！');
        })
        .catch(err => {
            console.error('无法复制文本: ', err);
        });
}

// 页面加载时，自动检查登录状态并加载游戏列表
window.onload = function() {
    checkLoginStatus();
    loadOptions();
    loadPendingTransactions();
};