var userAccount
window.addEventListener('load', async function() {
   // Modern dapp browsers...
if (window.ethereum){
    web3Provider = window.ethereum;
    try {
        //Request account access
        await window.ethereum.enable();
    } catch (error) {
        // User denied account access...
        console.error("User denied account access")
    }
}
//Legacy dapp browsers...
else if (window.web3){
    web3Provider = window.web3.currentProvider;
}
// If no injected web3 instance is detected, fall back to Ganache
else{
    web3Provider = new providers.HttpProvider('http://localhost:7545');
}
web3 = new Web3(web3Provider)
startApp()
})

async function startApp(){
    const contract_address = "0xAb3fed0d4f5C7785686E9A53eA6D79c2e07623c4" 
    instance = new web3.eth.Contract(abi,contract_address)
    owner = await instance.methods.owner().call()
    var accountInterval = setInterval(async function() {
        // Check if account has changed
        user = await web3.eth.getAccounts()
        if (user[0] != userAccount) {
          userAccount =await web3.eth.getAccounts();
          getUserDetails();
        }
      }, 100);
    
 }
 async function getUserDetails(){
    $("#content").empty()
    $("#content1").empty()
    if (userAccount[0]== owner){
        displayOwnerFunctions()
        displayAdminFunctions()
    }
    else if(await instance.methods.admin(userAccount[0]).call() == true) {
        $("#greeting").text(
            `Welcome admin - ${userAccount[0]}`)
            $("#content").append(`<div class="mb-5"></div>`)
        displayAdminFunctions()
    }
    else if(await instance.methods.storeOwner(userAccount[0]).call() == true){
        displaystoreOwnerFunctions()
    }
    else{
        displayshopperFunctions()
    }
 }
  function displayOwnerFunctions(){
      $("#greeting").text(`Welcome owner - ${userAccount[0]}`)
    $("#content").append(
        `<div class="container">
        <ul class="list-group mt-5">
            <li class="list-group-item my-0 py-0">
            <div class = "form-group my-0 py-0">
            <form onsubmit = "addNewAdmin();return false"><label>Add a new admin<input type="text" class="form-control"placeholder="New Admin's Address"
             name="admin" id="new_admin" maxlength = 42 minlength = 42></label>
            <input type = "submit" class="btn btn-primary"></form></div>
            </li>
            <li class="list-group-item my-0 py-0">
            <div class = "form-group my-0 py-0">
            <form onsubmit = "removeAdmin();return false"><label>Remove an admin<input type="text" class="form-control" placeholder="Admin's Address"
             name="admin" id="remove_admin" maxlength = 42 minlength = 42></label>
            <input type = "submit" class="btn btn-primary"></form>
                
            </li>
            <li class="list-group-item">
            <form onsubmit = "toggleContract();return false">
                <input type = "submit" value = "toggle the contract" class="btn btn-outline-primary btn-lg"> </form>
            </li>
            <li class="list-group-item">
            <form onsubmit = "killContract();return false">
                <input type = "submit" value = "Delete the contract"class="btn btn-outline-primary btn-lg" > </form>
            </li>
        </ul>
        </div>`
    
    )
  }
  function displayAdminFunctions(){
      $("#content").append(
        `<div class="container">
        <ul class="list-group">
        <li class="list-group-item my-0 py-0">
        <div class = "form-group my-0 py-0">
        <form onsubmit = "newStoreOwner();return false"><label> Add a new store owner<input class="form-control" type="text" placeholder="New store owner's Address"
        name="admin" id="addStoreOwner" maxlength = 42 minlength = 42></label>
       <input type = "submit" class="btn btn-primary"></form>
       </div>
    </li>
    </ul></div>`
      )
  }
  function displaystoreOwnerFunctions(){

    $("#greeting").text(`Welcome store owner - ${userAccount[0]}`)
    $("#content").empty()  
    $("#content").append(`<div class="container"><ul class="list-group mt-5">
        <li class="list-group-item my-0 py-0">
        <div class = "form-group my-0 py-0">
        <form onsubmit = "newStoreFront();return false"><label> Add a new storeFront <input class="form-control" type="text" placeholder="New store's name"
        name="admin" id="addStoreFront"></label>
       <input type = "submit" class="btn btn-primary"></form>
       </div>
    </li>
    </ul></diV>`)
    getUserStores()
      
}

function displayshopperFunctions(){
    $("#content").empty()
    $("#greeting").text(`Welcome shopper -  ${userAccount[0]}`)
        getAllStores() 
}

  async function addNewAdmin(){
      address = $("#new_admin").val()
      alertUser('Creating a new transaction on the blockchain')
      try {
        await instance.methods.addAdmin(address).send({from:userAccount[0]})
        alertUser("New admin added successfully")
      } catch (error) {
          alertUser("Transaction failed, please try again")
      }
      
  }
  async function removeAdmin(){
    address = $("#remove_admin").val()
    alertUser('Creating a new transaction on the blockchain')
      try {
        result = await instance.methods.removeAdmin(address).send({from:userAccount[0]})
        alertUser("admin removed successfully")
      } catch (error) {
          alertUser("Transaction failed, please try again")
      }
   
}
async function killContract(){
    alertUser('Creating a new transaction on the blockchain')
      try {
        result = await instance.methods.kill().send({from:userAccount[0]})
        alertUser("contract removed successfully")
      } catch (error) {
          alertUser("Transaction failed, please try again")
      }
}
async function toggleContract(){
    alertUser('Creating a new transaction on the blockchain')
      try {
        result = await instance.methods.toggleStopped().send({from:userAccount[0]})
        alertUser("Contract toggled successfully")
      } catch (error) {
          alertUser("Transaction failed, please try again")
      }
}
async function newStoreOwner(){
    address = $("#addStoreOwner").val()
    alertUser('Creating a new transaction on the blockchain')
      try {
        result = await instance.methods.addStoreOwner(address).send({from:userAccount[0]})
        alertUser("New store owner added")
      } catch (error) {
          alertUser("Transaction failed, please try again")
      }
}
async function newStoreFront(){
    name = $("#addStoreFront").val()
    alertUser('Creating a new transaction on the blockchain')
      try {
        result = await instance.methods.addStoreFront(name).send({from:userAccount[0]})
        alertUser("New store created")
        displaystoreOwnerFunctions()
      } catch (error) {
          alertUser("Transaction failed, please try again")
      }
}
async function getUserStores(){
    store_ids = await instance.methods.returnAllStoreFrontsByUser(userAccount[0]).call()
    if(store_ids.length > 0){
        $("#content").append(`
            <br> <span class="h3 ml-5 store">Number of stores : <span class="badge badge-dark"> ${store_ids.length}</span> </span>`)
            $("#content1").append(`<div class="row mx-2 my-2"></div>`)
            for (let index = 0; index < store_ids.length; index++) {
        element = store_ids[index];
        let result = await instance.methods.storeFronts(element).call()
        result.balance = web3.utils.fromWei(result.balance,'ether')
        $(".row").append(
            `
            <div class="card col-md-4">
            <div class="card-header h3"> ${result.name}</div>
            <div class="card-body"> <span class="h4">Balance</span> : ${result.balance} ether
            <form onsubmit = "withdraw(${result.id}); return false" > <input class="form-control"type="text" 
            placeholder="Amount to withdraw(in ether)"id="withdrawAmount${result.id}">
            <input type="submit" value="Withdraw" class="btn btn-outline-success btn-block"></form>
            <a onclick = "getProducts(${result.id}); return false" href = "#">View more details</a></div></div>
            `)
        
    }
    
}
    else {
    $("#content").append(
    `You have not created any store`)
}
}
async function withdraw(id){
    amount= $("#withdrawAmount"+id).val()
    amount  = await web3.utils.toWei(amount,'ether')
    alertUser('Creating a new transaction on the blockchain')
      try {
        await instance.methods.withdrawFunds(id,amount).send({from:userAccount[0]})
        alertUser("funds withdrawn successfully")
        displaystoreOwnerFunctions()
      } catch (error) {
          alertUser("Transaction failed, please try again")
      }
}

async function getProducts(id){
    products = await instance.methods.returnAllProductsByAStore(id).call()
    $("#content").empty()
    $("#content1").empty()
    $("#content").append(`
    <div class="container">
    <div>Add a new product</div>
    <form onsubmit = "newProduct(${id});return false"> <div class = "form-group my-0 py-0"><label> Name : <input class="form-control" type="text" placeholder="New product's name" id="product_name"></label>
        </div><div class = "form-group my-0 py-0"><label> Quantity : <input class="form-control" type="number" id="product_quantity" placeholder = "Quantity"></label>
       </div> <div class = "form-group my-0 py-0"><label> Price : <input type="text" class="form-control"id="product_price" placeholder = "Price(In ether)"></label>
      </div> <input type = "submit" class="btn btn-dark"></form></div>`)
      $("#content").append(`
            <br> <span class="h3 ml-5 store">Number of products : <span class="badge badge-dark"> ${products.length}</span> </span>`)
    if(products.length>0){
        $("#content1").append(`<div class="row mx-2 my-2"></div>`)
        for (let index = 0; index < products.length; index++) {
            element = products[index];
            result = await instance.methods.Products(element).call()
            result.price = web3.utils.fromWei(result.price, 'ether')
            $(".row").append(
                `<div class="card col-md-4">
                 <div class="card-header h3"> ${result.name} </div>
                 <div class="card-body">
                Price : ${result.price} ether <br>
                Quantity : ${result.quantity}
                <form onsubmit="changePrice(${result.id},${id});return false"><input class="form-control"type="text"  id="new_price${result.id}" placeholder="New price(In ether)" required>
                <input type="submit"class="btn btn-dark btn-block" value = "Change price">
                </form>
                <form class="mt-4"onsubmit="deleteProduct(${result.id},${id});return false"><input type="submit"class="btn btn-danger" value = "Delete Product">
                </form>
                </div> </div>`)
            
        }
    }
    else if (products.length==0){
        $("#content").append(` The store has no product`)
    }
    $("#content").append(`
    <br>
  <a href = "index.html">Go to store's page</a>`) 
}

async function newProduct(store_id){
    name = $("#product_name").val()
    quantity = $("#product_quantity").val()
    price = $("#product_price").val()
    price = await web3.utils.toWei(price ,'ether')

    alertUser('Creating a new transaction on the blockchain')
      try {
        result = await instance.methods.addProduct(name,store_id,quantity,price).send({from:userAccount[0]})
        alertUser("Added a new product : "+name)
        getProducts(store_id)
      } catch (error) {
          alertUser("Transaction failed, please try again")
      }
}

async function changePrice(productId,storeId){
    price = $("#new_price"+productId).val()
    price = await web3.utils.toWei(price ,'ether')
    alertUser('Creating a new transaction on the blockchain')
      try {
        result = await instance.methods.changePrice(productId,price).send({from:userAccount[0]})
        alertUser("Price changed successfully")
        getProducts(storeId)
      } catch (error) {
          alertUser("Transaction failed, please try again")
      }
}

async function deleteProduct(productId,storeId){
    alertUser('Creating a new transaction on the blockchain')
    try {
        result = await instance.methods.removeProduct(productId).send({from:userAccount[0]})
      alertUser("Product removed!")
      getProducts(storeId)
    } catch (error) {
        alertUser("Transaction failed, please try again")
    }
}
 async function getAllStores(){
    storeCount = await instance.methods.storeCount().call()
    $("#content1").append(`<div class="row mx-2 my-2"></div>`)
    for (let index = 0; index < storeCount; index++) {
        store = await instance.methods.storeFronts(index).call()
        $(".row").append(`
        <div class="card col-md-4 mb-2">
        <div class="card-header h3"> ${store.name}<br></div>
           <div class= card-body ></div> Owner : ${store.owner}<br>
            <form onsubmit = "getStoreProducts(${store.id},'${store.name}');return false">
            <input type="submit" value = "View more details" class="btn btn-info btn-block mb-2"></form></div></div>`)
        
    }
     
 }

async function getStoreProducts(store_id,store_name){
    $("#content").empty()
    $("#content1").empty()
    $("#content").append(`<h1 class="store ml-5">${store_name}</h1>`)
    products = await instance.methods.returnAllProductsByAStore(store_id).call()
    if(products.length>0){
        $("#content1").append(`<div class="row mx-2 my-2"></div>`)
    for (let index = 0; index < products.length; index++) {
        element = products[index]
        result = await instance.methods.Products(element).call()
        result.price = await web3.utils.fromWei(result.price,'ether')
        $(".row").append(`
        <div class="card col-md-4 mb-2">
        <div class="card-header h3 mb-2">${result.name}<br></div>
            <div class="card-body">Price: ${result.price} ether <br>
            Quantity : ${result.quantity}<br>
            <form onsubmit="buy_product(${result.id},'${result.price}',${store_id},'${store_name}');return false"><input type="number" class="form-control"id="quantity${result.id}" placeholder="Quantity to purchase">
            <input type="submit" value = "Buy"class="btn btn-dark btn-block my-3"></form></div></div>`)   
    }
}

    else if(products.length==0){
        $("#content").append(`The store has no product`) 
    }
    $("#content").append(`
    <br>
  <a href = "index.html">Go to store's page</a>`)
}

async function buy_product(product_id,price,store_id,store_name){
    quantity = $("#quantity"+product_id).val()
    msg_value = await web3.utils.toWei(price,'ether')
    msg_value = msg_value * quantity
    alertUser('Creating a new transaction on the blockchain')
    try {
        await instance.methods.buyProduct(product_id,quantity).send({from:userAccount[0],value:msg_value})
      alertUser("Product purchased!")
      getStoreProducts(store_id,store_name)
    } catch (error) {
        alertUser("Transaction failed, please try again")
    }
}

function alertUser(msg){
    $("#notification").empty()
    $("#notification").fadeIn("slow").append(`<span class="dismiss"><a title="dismiss this notification">x</a></span>${msg}`);
$(".dismiss").click(function(){
       $("#notification").fadeOut("slow");

});
}
