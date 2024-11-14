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

async function fetchData() {
    try {
        const response = await fetch("https://script.google.com/macros/s/AKfycbzCdsSEnvNpIftrF-71Y1YXslrcMbKIeuWkEogQFP4v7PWklA4ah81dxeKGE3vJj0RPfA/exec?type=productData");
        const result = await response.json();

        console.log("Fetched data:", result); // 确认数据结构是否正确

        if (result.data && result.data.length > 0) {
            const tableBody = document.getElementById("productList").querySelector("tbody");
            tableBody.innerHTML = "";

            result.data.forEach((row, rowIndex) => {
                const tr = document.createElement("tr");

                // 创建每一列数据，按照 Google Sheets 的顺序
                row.forEach((cell, index) => {
                    const td = document.createElement("td");

                    // 图片列（产品照片）
                    if (cell && typeof cell === 'string' && cell.startsWith("http") && index === 4) { 
                        const img = document.createElement("img");
                        img.src = cell;
                        img.alt = "产品照片";
                        img.style.cursor = "pointer"; // 设置鼠标指针为点击状态
                        img.onclick = () => showImage(cell); // 点击图片时弹出
                        td.appendChild(img);
                    } else {
                        // 编辑列：输入框或文本框
                        td.innerHTML = `<input type="text" value="${cell}" />`;
                    }
                    tr.appendChild(td);
                });

                // 添加保存按钮列
                const saveTd = document.createElement("td");
                const saveButton = document.createElement("button");
                saveButton.textContent = "保存";
                saveButton.onclick = () => saveProduct(row[0], tr, rowIndex); // 传入产品名称和行索引
                saveTd.appendChild(saveButton);
                tr.appendChild(saveTd);

                // 添加删除按钮列
                const deleteTd = document.createElement("td");
                const deleteButton = document.createElement("button");
                deleteButton.textContent = "删除";
                deleteButton.onclick = () => deleteProduct(row[0], rowIndex); // 根据产品名称删除
                deleteTd.appendChild(deleteButton);
                tr.appendChild(deleteTd);

                tableBody.appendChild(tr);
            });
        } else {
            alert("没有数据可显示");
        }
    } catch (error) {
        console.error("获取数据失败：", error);
        alert("无法加载数据，请稍后再试！");
    }
}



// 处理保存按钮点击事件
async function saveProduct(productName, tr, rowIndex) {
    const inputs = tr.querySelectorAll("input");
    const updatedRow = Array.from(inputs).map(input => input.value);

    // 明确指明每个字段的顺序，并确保 status 和 uploadTime 对应正确的列
    const updatedData = {
        productName: updatedRow[0],        // 产品名称 (第 1 列)
        productCategory: updatedRow[1],    // 产品种类 (第 2 列)
        productPrice: updatedRow[2],       // 产品价格 (第 3 列)
        productLink: updatedRow[3],        // 产品链接 (第 4 列)
        status: updatedRow[4] === '' ? 'Active' : updatedRow[4], // 状态 (第 6 列，空时默认为 "Active")
        uploadTime: updatedRow[5] === '' ? new Date().toISOString() : updatedRow[5] // 上传时间 (第 7 列，空时默认为当前时间)
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