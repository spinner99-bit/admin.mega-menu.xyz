const APP_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyVAPDowGtlaAQFA00EZ1HOLks1HOUBCCEmJyDe0oKeTu4t36GGvAMNFqsKfpeiLZMaww/exec'; // 替换为你的 Google Apps Script URL

document.addEventListener('contextmenu', event => event.preventDefault());

document.addEventListener('keydown', function (e) {
    if (e.keyCode == 123) { // F12
        e.preventDefault();
    }
});

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
    localStorage.setItem('company', result.fullName);
    localStorage.setItem('mbbNo', result.mbbNo);
    localStorage.setItem('cimbName', result.cimbName);
    localStorage.setItem('cimbNo', result.cimbNo);
    localStorage.setItem('hlbNo', result.hlbNo);
    localStorage.setItem('rhbNo', result.rhbNo);

    alert("Login successful! Redirecting...");

    // 登录成功后跳转到 index.html
    window.location.href = 'index';
  } else {
        // 如果登录失败，弹出错误提示框
    alert(result.message || "Login failed, please try again.");
  }

  submitButton.disabled = false;
  submitButton.textContent = 'LOGIN';
}
