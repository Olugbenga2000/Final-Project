const Marketplace = artifacts.require("Marketplace")
const utils = require('./exception.js')
let name = ["Alice store","Bob's store"]
let product_name = ["Macbook Laptop","Iphone 12", "Shirts"]
let product_quantity = [5,10,3]
let BN = web3.utils.BN

contract('Marketplace', async(accounts) => {
    let[owner,alice,bob] = accounts;
    beforeEach(async () => {
        instance = await Marketplace.new()
    })
    afterEach(async () => {
        instance.toggleStopped()
        instance.kill()
    })

    it('The owner should be able to add an admin', async() => {
        await instance.addAdmin(alice,{from:owner})
        let result = await instance.admin(alice)
        assert.equal(true,result,'The given address is not an admin')
    });

    it('Admins should be able to add new store owners', async() => {
        await instance.addAdmin(alice,{from:owner})
        await instance.addStoreOwner(bob,{from:alice})
        let result = await instance.storeOwner(bob) 
        assert.equal(true,result,'The given address is not a store owner')
    })

    it('Store owners should be able to add a new storefront', async() => {
        await instance.addAdmin(alice,{from:owner})
        await instance.addStoreOwner(bob,{from:alice})
        let tx = await instance.addStoreFront(name[1],{from:bob})
        let id = tx.logs[0].args.id.toNumber()
        let result = await instance.storeFronts(id)
        assert.equal(result[0],0, 'The id of the store does not match the expected value')
        assert.equal(result[1],name[1], 'The name of the store does not match the expected value')
        assert.equal(result[2],bob, 'The owner of the store does not match the expected value')
        assert.equal(result[3].toNumber(),0, 'The balance of the store does not match the expected value')
})

it('Should error when a non store owner tries to add a new storefront', async() => {
    await utils.shouldThrow(instance.addStoreFront(name[0],{from:alice}))
})

it('Store owners should be able to add a new product to their storefront', async() => {
    await instance.addStoreOwner(alice,{from:owner})
    let tx = await instance.addStoreFront(name[0],{from:alice})
    let id = tx.logs[0].args.id.toNumber()
    let product_price = web3.utils.toWei('0.01','ether')
    tx = await instance.addProduct(product_name[0],id,5,product_price,{from:alice})
    let product_id = tx.logs[0].args.id.toNumber()
    let result = await instance.Products(product_id)
    assert.equal(result[0],product_name[0], 'The name of the product does not match the expected value')
    assert.equal(result[1].toNumber(),product_id, 'The id of the product does not match the expected value')
    assert.equal(result[2].toNumber(),id, 'The store id of the product does not match the expected value')
    assert.equal(result[3].toString(),product_price, 'The price of the product does not match the expected value')
    assert.equal(result[4].toNumber(),5, 'The quantity of the product does not match the expected value')
})

it('Store owners should be able to change the price of a product', async() => {
    await instance.addStoreOwner(alice,{from:owner})
    let tx = await instance.addStoreFront(name[0],{from:alice})
    let id = tx.logs[0].args.id.toNumber()
    let product_price = web3.utils.toWei('0.01','ether')
    tx = await instance.addProduct(product_name[0],id,5,product_price,{from:alice})
    let product_id = tx.logs[0].args.id.toNumber()
    let newPrice = web3.utils.toWei('0.02','ether')
    await instance.changePrice(product_id,newPrice, {from:alice})
    let result = await instance.Products(product_id)
    assert.equal(newPrice,result[3].toString(), 'The price of the product has not changed to the new value')
})

it('Shoppers should be able to purchase a product', async() => {
    await instance.addStoreOwner(alice,{from:owner})
    let tx = await instance.addStoreFront(name[0],{from:alice})
    let id = tx.logs[0].args.id.toNumber()
    let product_price = web3.utils.toWei('0.01','ether')
    tx = await instance.addProduct(product_name[0],id,product_quantity[0],product_price,{from:alice})
    let product_id = tx.logs[0].args.id.toNumber()
    let quantity = 2
    let msg_value = product_price * quantity
    let bobs_initialbalance = await web3.eth.getBalance(bob)
    await instance.buyProduct(product_id,quantity,{from:bob,value:msg_value})
    let bobs_newbalance = await web3.eth.getBalance(bob)
    let result = await instance.Products(product_id)
    let store_details = await instance.storeFronts(id)
    assert.equal(product_quantity[0]-quantity,result[4], 'The required quantity was not purchased')
    assert.equal(store_details[3],msg_value, "The store's balance didn't increase by the required amount")
    assert.isBelow(Number(bobs_newbalance), Number(new BN(bobs_initialbalance)-(msg_value)), 'The required amount wasnt transferred')
    })

it("Store owners should be able to withdraw the store's fund", async() => {
    await instance.addStoreOwner(alice,{from:owner})
    let tx = await instance.addStoreFront(name[0],{from:alice})
    let id = tx.logs[0].args.id.toNumber()
    let product_price = web3.utils.toWei('0.01','ether')
    let product2_price = web3.utils.toWei('0.02','ether')
    tx = await instance.addProduct(product_name[0],id,product_quantity[0],product_price,{from:alice})
    let product1_id = tx.logs[0].args.id.toNumber()
    tx = await instance.addProduct(product_name[1],id,product_quantity[1],product2_price,{from:alice})
    let product2_id = tx.logs[0].args.id.toNumber()
    let quantity = [2,5]
    let msg_value = product_price * quantity[0]
    let msg_value2 = product2_price * quantity[1]
    await instance.buyProduct(product1_id,quantity[0],{from:bob,value:msg_value})
    await instance.buyProduct(product2_id,quantity[1],{from:bob,value:msg_value2})
    let store_details = await instance.storeFronts(id)
    let balance = store_details[3]
    aliceInitialBalance = await web3.eth.getBalance(alice)
    tx = await instance.withdrawFunds(id,balance, {from:alice})
    let store_detailsAfter = await instance.storeFronts(id)
    aliceNewBalance = await web3.eth.getBalance(alice)
    assert.isAbove(Number(BigInt(aliceInitialBalance) + BigInt(balance)),Number(aliceNewBalance))
    assert.equal(store_detailsAfter[3], store_details[3]-balance, "The withdrawn amount should be removed from the store's balance")
    })

    it("Store owners should be able delete a product", async() => {
        await instance.addStoreOwner(alice,{from:owner})
        let tx = await instance.addStoreFront(name[0],{from:alice})
        let id = tx.logs[0].args.id.toNumber()
        let product_price = web3.utils.toWei('0.01','ether')
        let product2_price = web3.utils.toWei('0.02','ether')
        let product3_price = web3.utils.toWei('0.0003','ether')
        await instance.addProduct(product_name[0],id,product_quantity[0],product_price,{from:alice})
        tx = await instance.addProduct(product_name[1],id,product_quantity[1],product2_price,{from:alice})
        await instance.addProduct(product_name[2],id,product_quantity[2],product3_price,{from:alice})
        let product2_id = tx.logs[0].args.id.toNumber()
        await instance.removeProduct(product2_id,{from:alice})
        let productsbystore = await instance.returnAllProductsByAStore(id)
        let deleted = true
        for(let i = 0; i<productsbystore.length; i++){
            if(product2_id == productsbystore[i]){
                deleted = false
                break
            }
        }
        result = await instance.Products(product2_id)
        assert.equal(result[0],'',"The name should be an empty string")
        assert.equal(result[1],0,"The id should be 0")
        assert.equal(result[2],0,"The store's id should be 0")
        assert.equal(result[3],0,"The product quantity should be 0")
        assert.equal(true,deleted,"The product id should be removed from the store's list")
})

})