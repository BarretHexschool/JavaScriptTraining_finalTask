let tokenStr = {
    headers:{
        'Authorization':token,
    }
}

//宣告空陣列
let orderData = [];

const orderTable = document.querySelector('.orderPage-table');

//取得訂單清單
function getOrderList(){
    let htmlStr ='';
    axios.get(`${api_URL}/admin/${api_path}/orders`,tokenStr)
    .then(function (response){
      orderData = response.data.orders;
      if(orderData.length >0){
        htmlStr += getOrderListHTMLStrHead();
        orderData.forEach((item)=>{
          htmlStr += getOrderListHTMLStr(item);
        })
        orderTable.innerHTML = htmlStr;
        getC3Data();
      }else{
        orderTable.innerHTML ='<h3 style="color: red;font-weight: bolder;font-size: 2rem;">系統沒有任何訂單</h3>';
      }
    })  
    .catch(function (error) {
        console.log(error)
        orderTable.innerHTML ='<h3 style="color: red;font-weight: bolder;font-size: 2rem;">系統資料讀取錯誤，請重新載入</h3>';
    });
};
getOrderList();

function getOrderListHTMLStrHead(){
    return `<thead>
    <tr>
        <th>訂單編號</th>
        <th>聯絡人</th>
        <th>聯絡地址</th>
        <th>電子郵件</th>
        <th>訂單品項</th>
        <th>訂單日期</th>
        <th>訂單狀態</th>
        <th>操作</th>
    </tr>
    </thead>`
}

function getOrderListHTMLStr(item){
return `
<tr>
<td>${item.createdAt}</td>
<td>
  <p>${item.user.name}</p>
  <p>${item.user.tel}</p>
</td>
<td>${item.user.address}</td>
<td>${item.user.email}</td>
<td>
  <p>${getProductItem(item.products)}</p>
</td>
<td>${getTimeStr(item.createdAt)}</td>
<td class="orderStatus">
${orderStatus(item)}
</td>
<td>
  <input type="button" class="delSingleOrder-Btn" data-id='${item.id}' value="刪除">
</td>
</tr>`
};

//訂單狀態呈現
function orderStatus(item){
    if(item.paid === false){
        return `<a href="#" class='orderStatusLink' data-id='${item.id}' data-status='false'>未處理</a>`
    }else {
        return `<a href="#" class='orderStatusLink' data-id='${item.id}' data-status='true'>已處理</a>`
    }
}

// 重組時間字串
function getTimeStr(dateNumber){
    let date = new Date(dateNumber*1000);
    let year = date.getFullYear();
    let month = addZero(date.getMonth() + 1);
    let day = addZero(date.getDay());
    return`${year}/${month}/${day}`
}
const addZero = data => { 
    return data.toString().padStart(2, 0);
}

// 取得訂單產品細項
function getProductItem(productlist){
    let productStr='';
    productlist.forEach((item)=>{
        productStr += `<p>${item.title} x ${item.quantity}</p>`
    })
    return productStr
}

//orderStatusChange
function orderStatusChange(orderId,orderStatus)
{
   let newStatus;
   if(orderStatus == 'true'){
    newStatus = false;
   }else{
    newStatus = true;
   }
    let dataStr = {
        "data": {
          "id": orderId,
          "paid": newStatus
        }
      };
    axios.put(`${api_URL}/admin/${api_path}/orders`,dataStr,tokenStr)
    .then((response) =>{
        getOrderList();
        alertInfo('orderStatusChange');
    })
    .catch(function (error) {
        console.log(error)
        orderTable.innerHTML ='<h3 style="color: red;font-weight: bolder;font-size: 2rem;">訂單狀態調整失敗</h3>';
    });
}

//deleteSingleOrder
function deleteSingleOrder(orderId)
{
    axios.delete(`${api_URL}/admin/${api_path}/orders/${orderId}`,tokenStr)
    .then((response) =>{
        getOrderList();
        alertInfo('deleteSuccess');
    })
    .catch(function (error) {
        console.log(error)
        orderTable.innerHTML ='<h3 style="color: red;font-weight: bolder;font-size: 2rem;">訂單刪除失敗</h3>';
    });
}

//deleteAllOrder
function deleteAllOrder()
{
    axios.delete(`${api_URL}/admin/${api_path}/orders`,tokenStr)
    .then((response) =>{
        getOrderList();
        alertInfo('deleteSuccess');

    })
    .catch(function (error) {
        console.log(error)
        orderTable.innerHTML ='<h3 style="color: red;font-weight: bolder;font-size: 2rem;">訂單清空失敗</h3>';
    });
}



// 單純跳爽的提醒視窗
function alertInfo(where){
    let alertWord ='';
    switch (where){
        case 'orderStatusChange' :{ alertWord ='訂單狀態更改成功'; break;}
        case 'deleteSuccess' : {alertWord ='訂單刪除成功'; break;}
        default: {alertWord = `這是一個 提醒彈跳視窗`; break;}
    }
    alert(alertWord);
}

// 可以確認是否執行的彈跳視窗，純純給刪除用
function confirmFun(Id){
    let confirmStr =''
    if(Id === undefined){
        confirmStr = `請問是否刪除所有訂單？\n\n一經刪除無法重來\n\n一經刪除無法重來\n\n一經刪除無法重來`
    }else(
        confirmStr = `即將刪除訂單編號${Id}，請確認是否執行？`
    )
    if (confirm(confirmStr) == true) {
        if(Id === undefined){
            deleteAllOrder();
        }else{
            deleteSingleOrder(Id);
        }
    }
}

//C3 資料開始串串串

function getC3Data() {
    let obj = {};
    orderData.forEach((item,index)=>{
        let products = item.products
        products.forEach((item)=>{
            if(obj[item.title] === undefined){
                obj[item.title] = (item.quantity) * (item.price);
            }else{
                obj[item.title] += (item.quantity) * (item.price);
            }
        })
    })
    if(Object.keys(obj).length)
     c3DataAry = [];
     Object.keys(obj).forEach((item)=>{
        let ary=[];
        ary.push(item);
        ary.push(obj[item]);
        c3DataAry.push(ary);
     })
     c3DataAry.sort((a,b) =>{
        return b[1] - a[1];
     })
    if(c3DataAry.length > 3){
        let otherTotal = 0;
        c3DataAry.forEach((item,index)=>{
            if(index > 2){
                otherTotal += c3DataAry[index][1];
            }
        })
        c3DataAry.splice(3,c3DataAry.length-1)
        c3DataAry.push(['其他',otherTotal])
    }

    drowC3(c3DataAry);
    
};

function drowC3(dataArry){
    let chart = c3.generate({
        bindto: '#chart', 
        data: {
            type: "pie",
            columns:dataArry,
        },
        color: {
            pattern: ["#5434A7", "#9D7FEA", "#DACBFF", "#301E5F"]
        },
    });
}
    // addEventListener
 orderTable.addEventListener('click',(e)=>{
    e.preventDefault();
    let btn = e.target.getAttribute("class");
    if(btn !== 'orderStatusLink' && btn !== 'delSingleOrder-Btn'){
        return
    }
    if(btn === 'orderStatusLink'){
        orderStatusChange(e.target.dataset.id,e.target.dataset.status)
    }else(
        confirmFun(e.target.dataset.id)
    )
    
 })

 document.querySelector('.discardAllBtn').addEventListener('click', (e) =>{
    e.preventDefault();
    confirmFun();
 })

