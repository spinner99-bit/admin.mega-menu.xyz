import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyCuQLldQ6xbWjuw_yFrk7bgjF8Wengc_lQ",
    authDomain: "y15family.firebaseapp.com",
    databaseURL: "https://y15family-default-rtdb.firebaseio.com",
    projectId: "y15family",
    storageBucket: "y15family.appspot.com",
    messagingSenderId: "434656864137",
    appId: "1:434656864137:web:d7d82745f4bbba673fa358",
    measurementId: "G-69ZHD5ZT57"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

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

async function uploadPhoto(file) {
    const storageRef = ref(storage, `uploads/${file.name}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
}

document.getElementById("productForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    
    const formData = new FormData(document.getElementById("productForm"));
    const rows = [];
    const photoFiles = formData.getAll("productPhoto");

    for (let i = 0; i < formData.getAll("productName").length; i++) {
        const photoURL = await uploadPhoto(photoFiles[i]);
        rows.push({
            productName: formData.getAll("productName")[i],
            productCategory: formData.getAll("productCategory")[i],
            productPrice: formData.getAll("productPrice")[i],
            productLink: formData.getAll("productLink")[i],
            productPhotoURL: photoURL
        });
    }

    try {
        const response = await fetch("https://script.google.com/macros/s/AKfycbz4wxl2cRkJcBSPdIZY3HkfYJsrRlMYLJPb-WE2GOHhxsqHZ4UGFfZW9U95yHHCXfLaIg/exec", {
            method: "POST",
            body: JSON.stringify({
                type: "addProduct",  // 添加产品的请求类型
                rows: rows
            })
        });

        const result = await response.json();
        alert(result.message || "产品信息已成功提交！");
        fetchData();
    } catch (error) {
        console.error("提交错误：", error);
        alert("提交失败，请稍后再试！");
    }
});

// 弹出和关闭图片的函数
function showImage(src) {
    const modal = document.getElementById("imageModal");
    const modalImage = document.getElementById("modalImage");
    modalImage.src = src;
    modal.style.display = "flex"; // 显示弹窗
}

// 关闭图片弹窗
function closeImage() {
    const modal = document.getElementById("imageModal");
    modal.style.display = "none"; // 隐藏弹窗
}

// 页面点击空白区域时关闭弹窗
document.getElementById("imageModal").addEventListener("click", closeImage);

let allData = []; // 存储所有数据
let currentPage = 1; // 当前页码
let rowsPerPage = 10; // 每页显示的行数

// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
    const formattedDate = date.toLocaleString('en-GB', options);
    return formattedDate.replace(/\//g, '-').replace(',', '');
}

// 获取数据
async function fetchData() {
    try {
        const response = await fetch("https://script.google.com/macros/s/AKfycbzCdsSEnvNpIftrF-71Y1YXslrcMbKIeuWkEogQFP4v7PWklA4ah81dxeKGE3vJj0RPfA/exec?type=productData");
        const result = await response.json();

        console.log("Fetched data:", result); // 确认数据结构是否正确

        if (result.data && result.data.length > 0) {
            allData = result.data; // 保存所有数据
            renderTable(allData); // 渲染数据
            setupPagination(allData); // 设置分页
        } else {
            alert("没有数据可显示");
        }
    } catch (error) {
        console.error("获取数据失败：", error);
        alert("无法加载数据，请稍后再试！");
    }
}

// 渲染表格数据
function renderTable(data) {
    const tableBody = document.getElementById("productList").querySelector("tbody");
    tableBody.innerHTML = "";

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = rowsPerPage === 'all' ? data.length : startIndex + rowsPerPage;

    const pagedData = data.slice(startIndex, endIndex);

    pagedData.forEach((row, rowIndex) => {
        const tr = document.createElement("tr");

        // 检查状态并决定字体颜色
        const status = row[5]; // 假设 Status 是第 6 列 (索引5)
        const rowColor = status === 'Inactive' ? 'red' : 'black'; // 状态为 Inactive 时字体颜色为红色

        row.forEach((cell, index) => {
            const td = document.createElement("td");

            // 处理图片列
            if (cell && typeof cell === 'string' && cell.startsWith("http") && index === 4) {
                const img = document.createElement("img");
                img.src = cell;
                img.alt = "Image";
                img.style.cursor = "pointer";
                img.onclick = () => showImage(cell);
                td.appendChild(img);
            } 
            // 处理状态列，添加下拉选择框
            else if (index === 5) { // 假设Status是第6列 (索引5)
                const select = document.createElement("select");
                const activeOption = document.createElement("option");
                activeOption.value = "Active";
                activeOption.textContent = "Active";
                const inactiveOption = document.createElement("option");
                inactiveOption.value = "Inactive";
                inactiveOption.textContent = "Inactive";

                select.appendChild(activeOption);
                select.appendChild(inactiveOption);

                select.value = cell; // 设置当前状态值

                // 监听状态变化
                select.onchange = () => updateStatus(row[0], select.value);

                // 设置字体颜色
                select.style.color = rowColor;

                td.appendChild(select);
            } 
            // 其它列的内容
            else {
                const textarea = document.createElement("textarea");
                textarea.rows = 5;
                textarea.cols = 20;
                textarea.value = cell;
                textarea.style.color = rowColor; // 设置字体颜色

                td.appendChild(textarea);
            }

            tr.appendChild(td);
        });

        const actionTd = document.createElement("td");
        const actionDiv = document.createElement("div");

        const saveButton = document.createElement("button");
        saveButton.innerHTML = `<i class='bx bxs-save'></i>`;
        saveButton.onclick = () => saveProduct(row[0], tr, rowIndex);
        actionDiv.appendChild(saveButton);

        const deleteButton = document.createElement("button");
        deleteButton.innerHTML = "<i class='bx bxs-trash'></i>";
        deleteButton.onclick = () => deleteProduct(row[0], rowIndex);
        actionDiv.appendChild(deleteButton);

        actionTd.appendChild(actionDiv);
        tr.appendChild(actionTd);

        tableBody.appendChild(tr);
    });

    // 更新行数显示
    updateRowCountDisplay(startIndex + 1, Math.min(endIndex, data.length), data.length);
}


// 设置分页按钮
function setupPagination(data) {
    const pagination = document.getElementById("pagination");
    pagination.innerHTML = '';

    const pageCount = Math.ceil(data.length / rowsPerPage);
    for (let i = 1; i <= pageCount; i++) {
        const pageButton = document.createElement("button");
        pageButton.textContent = i;

        // 给每个分页按钮添加点击事件
        pageButton.onclick = () => goToPage(i, pageButton);

        // 如果是当前页，给按钮添加 "active" 类
        if (i === currentPage) {
            pageButton.classList.add("active");
        }

        pagination.appendChild(pageButton);
    }
}

// 跳转到指定页，并更新页面按钮样式
function goToPage(page, clickedButton) {
    currentPage = page;
    renderTable(allData);

    // 移除所有按钮的 active 类
    const buttons = document.querySelectorAll(".pagination button");
    buttons.forEach(button => button.classList.remove("active"));

    // 给当前点击的按钮添加 active 类
    clickedButton.classList.add("active");
}

// 搜索功能
function filterTransactions() {
    const searchValue = document.getElementById("searchTransaction").value.toLowerCase(); // 获取搜索框的值并转为小写
    const filteredData = allData.filter(row => 
        row.some(cell => 
            cell.toString().toLowerCase().includes(searchValue) // 检查每个单元格是否包含搜索内容
        )
    );
    renderTable(filteredData); // 重新渲染表格
}

// 更新每页行数
function loadPendingTransactions() {
    const rowsPerPageSelect = document.getElementById("rowsPerPage");
    rowsPerPage = rowsPerPageSelect.value;
    renderTable(allData); // 重新渲染表格
}

// 更新行数显示
function updateRowCountDisplay(start, end, total) {
    const rowCountDisplay = document.querySelector('.transaction-page-select div:first-child');
    rowCountDisplay.textContent = `Showing ${start}-${end} of ${total}`;
}

// 初始化数据加载
fetchData(); // 初始化数据加载

// 监听搜索框的输入事件
document.getElementById("searchTransaction").addEventListener("input", filterTransactions);

// 监听行数选择框的改变事件
document.getElementById("rowsPerPage").addEventListener("change", loadPendingTransactions);


// 处理保存按钮点击事件
async function saveProduct(productName, tr, rowIndex) {
    const inputs = tr.querySelectorAll("textarea");
    const selects = tr.querySelectorAll("select"); // 获取所有的 select 元素
    const updatedRow = Array.from(inputs).map(input => input.value);
    
    // 假设状态是第 6 列，因此 select 状态列应该是第 5 个
    const statusSelect = selects[0];  // 假设状态是第一个 select 元素
    const status = statusSelect ? statusSelect.value : 'Active'; // 获取状态的值，默认为 'Active'

    // 明确指明每个字段的顺序，并确保 status 和 uploadTime 对应正确的列
    const updatedData = {
        productName: updatedRow[0],        // 产品名称 (第 1 列)
        productCategory: updatedRow[1],    // 产品种类 (第 2 列)
        productPrice: updatedRow[2],       // 产品价格 (第 3 列)
        productLink: updatedRow[3],        // 产品链接 (第 4 列)
        status: status,                    // 状态 (第 6 列)
        uploadTime: updatedRow[4] === '' ? new Date().toISOString() : updatedRow[4] // 上传时间 (第 7 列，空时默认为当前时间)
    };

    // 打印更新后的数据
    console.log("Updated product data:", updatedData);

    try {
        const response = await fetch("https://script.google.com/macros/s/AKfycbzyIUU2pRhd3Oya5ajboZe4zxn3TlcDNiVjwgd2Bv8bN29BiuOXH_qtHb-z3iaETfabpQ/exec", {
            method: "POST",
            body: JSON.stringify({
                type: "updateProduct",
                productName: productName,
                updatedData: updatedData // 传递更新后的数据
            }),
        });

        const result = await response.json();

        // 打印返回的结果
        console.log("Response from server:", result);

        if (result.message === "产品信息已成功更新！") {
            alert("产品信息已成功更新！");
            fetchData(); // 刷新数据
        } else {
            alert("更新失败，请稍后再试！");
        }
    } catch (error) {
        console.error("保存失败：", error);
        alert("保存失败，请稍后再试！");
    }
}

// 处理删除按钮点击事件
async function deleteProduct(productName, rowIndex) {
    const confirmDelete = confirm(`确定要删除 ${productName} 吗？`);

    if (confirmDelete) {
        try {
            // 发送请求删除指定产品
            const response = await fetch("https://script.google.com/macros/s/AKfycbzwJu4BHIF69Y_qxpyYnNgkIE41fT4RT-pWy63mkFrUpANqqJhaj1QBMOQI3wtWEcv7Aw/exec", {
                method: "POST",
                body: JSON.stringify({
                    type: "deleteProduct",
                    productName: productName // 通过产品名称找到要删除的行
                })
            });

            const result = await response.json();

            if (result.message === "产品已成功删除！") {
                alert("产品已成功删除！");
                fetchData(); // 刷新数据
            } else {
                alert("删除失败，请稍后再试！");
            }
        } catch (error) {
            console.error("删除失败：", error);
            alert("删除失败，请稍后再试！");
        }
    }
}

// 加载选项到下拉菜单
window.onload = function() {
    checkLoginStatus();
    loadOptions();
    fetchData();
};
