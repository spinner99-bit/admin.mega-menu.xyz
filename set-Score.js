// document.addEventListener('contextmenu', event => event.preventDefault());

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

// 将 submitForm 函数放在全局作用域中
function submitForm() {
    const phone = $('#phone').val();
    const amount = $('#amount').val();
    const amountWithZero = $('#amountWithZero').val();
    const bonus = $('#bonus').val();
    const totalAmount = $('#totalAmount').val();
    const orderId = 'ORD' + new Date().getTime(); // 创建订单 ID
    const submitTime = new Date().toLocaleString(); // 获取提交时间

    // 准备要发送到 Google Apps Script 的数据
    const data = {
        phone: phone,
        amount: amount,
        amountWithZero: amountWithZero,
        bonus: bonus,
        totalAmount: totalAmount,
        orderId: orderId,
        submitTime: submitTime
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
    const url = 'https://script.google.com/macros/s/AKfycbzHrndrHBVmtMAO3PUG-ZjfIsyeADcd75soh-SpnEvG3uCpOUUQvpuhsZQdr1eHe9KJ/exec'; // Web 应用的 URL

    // 将数据作为 JSON 字符串发送
    fetch(url, {
        method: 'POST',
        body: JSON.stringify({
            action: 'saveOrderLog',  // action 参数
            data: data  // 实际数据
        })
    })
    .then(response => response.json())  // 解析响应
    .then(result => {
        if (result.success) {
            console.log('Data saved successfully:', result.message);

            // 数据成功保存后，调用更新 totalAmount 函数
            updateTotalAmountInUsersSheet(data.phone, data.totalAmount);
        } else {
            console.error('Error saving data:', result.message);
        }
    })
    .catch(error => {
        console.error('Error saving data:', error);
    });
}

// 更新 Users 页面的 totalAmount
function updateTotalAmountInUsersSheet(phone, totalAmount) {
    const scriptURL = 'https://script.google.com/macros/s/AKfycbzeiXo5OqeorNvaKVEdVhWWj4VzJ1drW9QneOGgoR_DmAdKtuwpzeI6Qu9mTrjEDkc/exec'; // Web 应用的 URL

    const response = fetch(`${scriptURL}?action=updateUserTotalAmount`, {
        method: 'POST',
        body: JSON.stringify({ phone, totalAmount })
    });
    return response.json();
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
