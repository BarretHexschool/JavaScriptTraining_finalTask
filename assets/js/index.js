//宣告空陣列
let productData = [];
let cart = [];
let selectProductData = [];
let productCategory = [];
let quantity =0;
let cartId='';

//清空錯誤訊息
document.querySelector(".apiError").innerHTML = '';


// 預設載入Data
function getProductList(){
  axios.get(`${api_URL}/customer/${api_path}/products`)
  .then(function (response){
    productData = response.data.products;
    insertProductList();
    getProductCategory();
    getCartList();
  })  
  .catch(function (error) {
    document.querySelector(".apiError").innerHTML =
      '<h3 class="apiError" style="color: red;font-weight: bolder;font-size: 2rem;">系統資料讀取錯誤，請重新載入</h3>';
  });

};
getProductList();


// 產出產品列表
function insertProductList(select){
  let htmlCode = '';
  const productWrap =  document.querySelector('.productWrap');
  selectProductData = productData.filter((item)=>{
    if(select === '全部' || !select){
      return item
    }
    if(select === item.category){
      return item
    }
  })
  selectProductData.forEach((item)=>{
    htmlCode += getProductHTMLStr(item);
  })

  productWrap.innerHTML= htmlCode;
  selectProductData = [];
  
};

// 加入購物車
function addToCart(productID){
  getExitsProduct(productID);
  if(quantity === 0){
    let addJson = {
      data: {
        "productId": productID,
        "quantity": 1
      } 
    }
    
    addNewItem(addJson)
  }else{
    quantity++;
    let patchJson = {
      data: {
        "id": cartId,
        "quantity": quantity
      } 
    }
    addExitItem(patchJson)
  }

}

//取得購物車
function getCartList(){
  let htmlCode = `  <tr>
  <th width="40%">品項</th>
  <th width="15%">單價</th>
  <th width="15%">數量</th>
  <th width="15%">金額</th>
  <th width="15%"></th>
</tr>`;

  const cartTable =  document.querySelector('.shoppingCart-table'); 

  axios.get(`${api_URL}/customer/${api_path}/carts`)
  .then((response) =>{
    cart = response.data.carts;
    cart.forEach((item) =>{
      htmlCode += getCartHTMLStr(item);
    })
    htmlCode += getCartFinalHTMLStr(response.data);
    cartTable.innerHTML = htmlCode;
  })
  .catch(function (error) {
    document.querySelector(".apiError").innerHTML =
      '<h3 class="apiError" style="color: red;font-weight: bolder;font-size: 2rem;">請重新加入產品</h3>';
  });
}

// 尋找購物車是否有該商品
function getExitsProduct(productID){
  cart.forEach((item) =>{
    if(productID === item.product.id){
       quantity = item.quantity;
      cartId = item.id;
    }
  })
}

//購物車沒有該商品
function addNewItem(addJson){
axios.post(`${api_URL}/customer/${api_path}/carts`,addJson)
.then(function (response){
  getCartList();
})  
.catch(function (error) {
  document.querySelector(".apiError").innerHTML =
    '<h3 class="apiError" style="color: red;font-weight: bolder;font-size: 2rem;">請重新加入產品</h3>';
});

}


//購物車已經有該商品
function addExitItem(patchJson){
  axios.patch(`${api_URL}/customer/${api_path}/carts`,patchJson)
  .then(function (response){
    quantity = 0;
    cartId='';
    getCartList();
  })  
  .catch(function (error) {
    document.querySelector(".apiError").innerHTML =
      '<h3 class="apiError" style="color: red;font-weight: bolder;font-size: 2rem;">請重新加入產品</h3>';
  });
  
  }


//刪除購物車單品項
function removeSingle(cartId){
  axios.delete(`${api_URL}/customer/${api_path}/carts/${cartId}`)
  .then(function (response){
    getCartList();
    alertInfo('deleteItem');
  })  
  .catch(function (error) {
    document.querySelector(".apiError").innerHTML =
      '<h3 class="apiError" style="color: red;font-weight: bolder;font-size: 2rem;">購物車品項刪除失敗</h3>';
  });
}  

//清空購物車
function removeAllCarts(){
  axios.delete(`${api_URL}/customer/${api_path}/carts`)
  .then(function (response){
    getCartList();
    alertInfo('deleteItem');
  })  
  .catch(function (error) {
    console.log(error)
    document.querySelector(".apiError").innerHTML =
      '<h3 class="apiError" style="color: red;font-weight: bolder;font-size: 2rem;">購物車清空失敗</h3>';
  });
}  

function createOrder(){
  let name = document.querySelector('#customerName').value;
  let phone = document.querySelector('#customerPhone').value;
  let email = document.querySelector('#customerEmail').value;
  let address = document.querySelector('#customerAddress').value;
  let payment = document.querySelector('#tradeWay').value;

  let dataStr ={
    "data": {
      "user": {
        "name": name,
        "tel": phone,
        "email": email,
        "address": address,
        "payment": payment
      }
    }
  }

  axios.post(`${api_URL}/customer/${api_path}/orders`,dataStr)
  .then(function (response){
    getProductList();
    alertInfo('orderSuccess');
    document.querySelector(".apiError").innerHTML = '';
  })  
  .catch(function (error) {
    document.querySelector(".apiError").innerHTML =
      '<h3 class="apiError" style="color: red;font-weight: bolder;font-size: 2rem;">訂單新增失敗，請重新送出訂單</h3>';
  });
}

// 單純跳爽的提醒視窗
function alertInfo(where){
  let alertWord ='';
  switch (where){
      case 'deleteItem' : {alertWord ='購物車品項刪除成功'; break;}
      case 'orderSuccess' : {alertWord ='訂單建立成功'; break;}
      default: {alertWord = `這是一個 提醒彈跳視窗`; break;}
  }
  alert(alertWord);
}


// 組HTML Code
function getProductCategory(){
  let categoryObj = {};
  productData.forEach((item) =>{
    if( categoryObj[item.category] === undefined){
      categoryObj[item.category] = 1;      
    }else{
      categoryObj[item.category] ++;
    }

    let str = `<option value="全部" selected>全部</option>`;
    Object.keys(categoryObj).forEach(function (item) {
      str += `<option value="${item}">${item}</option>`;
    });
    document.querySelector('.productSelect').innerHTML = str; 
  })
}

function getProductHTMLStr(item){
  return `<li class="productCard">
  <h4 class="productType">新品</h4>
  <img src="${item.images}" alt="${item.description}">
  <a href="#" class="addCardBtn" data-id="${item.id}">加入購物車</a>
  <h3>${item.title}</h3>
  <del class="originPrice">NT$${toThousands(item.origin_price)}</del>
  <p class="nowPrice">NT$${toThousands(item.price)}</p>
</li>`;
}

function getCartHTMLStr(item){
  return `<tr>
  <td>
      <div class="cardItem-title">
          <img src="${item.product.images}" alt="">
          <p>${item.product.title}</p>
      </div>
  </td>
  <td>NT$${toThousands(item.product.price)}</td>
  <td>${item.quantity}</td>
  <td>NT$${toThousands((item.product.price)*(item.quantity))}</td>
  <td class="discardBtn">
      <a href="#" class="material-icons" data-id="${item.id}">
          clear
      </a>
  </td>
</tr>`
}

function getCartFinalHTMLStr(item){
  return `  <tr>
  <td>
      <a href="#" class="discardAllBtn">刪除所有品項</a>
  </td>
  <td></td>
  <td></td>
  <td>
      <p>總金額</p>
  </td>
  <td>NT$${toThousands(item.finalTotal)}</td>
  </tr>`
}

// 金額千分位
function toThousands(x) {
  let parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}


// validate.js
const inputs = document.querySelectorAll("input[name],select[data=payment]");
const form = document.querySelector(".orderInfo-form");
const constraints = {
  "姓名": {
    presence: {
      message: "必填欄位"
    }
  },
  "電話": {
    presence: {
      message: "必填欄位"
    },
    length: {
      minimum: 8,
      message: "需超過 8 碼"
    }
  },
  "Email": {
    presence: {
      message: "必填欄位"
    },
    email: {
      message: "格式錯誤"
    }
  },
  "寄送地址": {
    presence: {
      message: "必填欄位"
    }
  },
};


inputs.forEach((item) => {
  item.addEventListener("change", function () {
    
    item.nextElementSibling.textContent = '';
    let errors = validate(form, constraints) || '';
    console.log(errors)

    if (errors) {
      Object.keys(errors).forEach(function (keys) {
        document.querySelector(`[data-message="${keys}"]`).textContent = errors[keys];
      })
    }
  });
});


// addEventListener
  document.querySelector(".productWrap").addEventListener('click',(e) =>{
    e.preventDefault();
    let addCardBtn = e.target.getAttribute("class");
    if(addCardBtn !== "addCardBtn"){
      return
    }
    addToCart(e.target.dataset.id);
  })

  document.querySelector('.productSelect').addEventListener('change',(e) =>{
    insertProductList(e.target.value)    
  });

  document.querySelector('.shoppingCart-table').addEventListener('click',(e) =>{
    e.preventDefault();
    let removeBtn = e.target.getAttribute("class");
    if(removeBtn === "material-icons" || removeBtn ==="discardAllBtn"){
      if(removeBtn ==="discardAllBtn"){
        removeAllCarts();
      }else(
        removeSingle(e.target.dataset.id)
      )
    }
  })
  
  document.querySelector('.orderInfo-btn').addEventListener('click',(e) =>{
    e.preventDefault();
    createOrder()
  })


