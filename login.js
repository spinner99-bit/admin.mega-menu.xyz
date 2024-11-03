const APP_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzIr50gDiDsWCcrAl7H0oayuWpC-0-oYZ9wSNTVdBhMrg9AnZew_IFZ4jZgNQoLOlcLMA/exec'; // 替换为你的 Google Apps Script URL

document.addEventListener('DOMContentLoaded', function() {
  updateUI(); // 页面加载时更新UI
});

document.addEventListener("DOMContentLoaded", function() {
  const currentPath = window.location.pathname;

  // 检查路径是否以 .html 结尾
  if (currentPath.endsWith('.html')) {
      const newPath = currentPath.slice(0, -5);
      history.replaceState(null, '', newPath);
  }
});

// 提交登录表单
async function submitLogin() {
  const submitButton = document.querySelector('.submit-btn');
  submitButton.disabled = true;
  submitButton.textContent = 'Logging in.....';

  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;

  const response = await fetch(APP_SCRIPT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      action: 'login',
      username: username,
      password: password,
    })
  });

  const result = await response.json();
  if (result.success) {
    localStorage.setItem('username', username);
    localStorage.setItem('password', password);
    localStorage.setItem('fullName', result.fullName);
    localStorage.setItem('phoneNumber', result.phoneNumber);
    localStorage.setItem('option1', result.option1);
    localStorage.setItem('number2', result.number2);
    localStorage.setItem('option2', result.option2);

    // 登录成功后跳转到 index.html
    window.location.href = 'index.html';
  } else {
        // 如果登录失败，显示错误信息
        document.getElementById('loginMessage').textContent = result.message || "Login failed, please try again.";
      }

  submitButton.disabled = false;
  submitButton.textContent = 'LOGIN';
}

// 更新界面
function updateUI() {
  const username = localStorage.getItem('username');
  if (username) {
    // 如果有用户名，您可以在这里显示用户信息
    document.getElementById('loginForm').style.display = 'none';
    // 此处可以添加用户信息的显示逻辑
  } else {
    // 默认显示登录表单
    document.getElementById('loginForm').style.display = 'block';
  }
}

function showLoginForm() {
  document.getElementById("loginModal").style.display = "block";
}

  // 当用户点击模态框外部时关闭模态框
  window.onclick = function(event) {
    var modal = document.getElementById("loginModal");
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }

function startTime() {
  var today = new Date();
  var hr = today.getHours();  // 24-hour format, no need for conversion
  var min = today.getMinutes();
  var sec = today.getSeconds();

  // AM/PM logic
  var ap = (hr < 12) ? "AM" : "PM";

  // Add leading zeros to hours, minutes, and seconds
  hr = checkTime(hr);
  min = checkTime(min);
  sec = checkTime(sec);

  // Display time in 24-hour format using 'hr' (no conversion)
  document.getElementById("clock").innerHTML = hr + ":" + min + ":" + sec;

  // Display AM/PM in the 'time' div (optional if you want to show AM/PM even for 24-hour format)
  document.getElementById("time").innerHTML = ap;

  // Get the current date
  var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thrusday', 'Friday', 'Saturday'];
  var curWeekDay = days[today.getDay()];
  var curDay = today.getDate();
  var curMonth = months[today.getMonth()];
  var curYear = today.getFullYear();
  var date = curWeekDay + ", " + curDay + " " + curMonth + " " + curYear;
  document.getElementById("date").innerHTML = date;

  // Update every second
  setTimeout(function() { startTime() }, 500);
}

function checkTime(i) {
  if (i < 10) {
    i = "0" + i;  // Add leading zero if necessary
  }
  return i;
}

// Start the clock when the page loads
startTime();
