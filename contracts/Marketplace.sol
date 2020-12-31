// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/math/SafeMath.sol';

/// @title A blockchain based market where goods can be bought and sold
/// @author Olugbenga Ayoola

contract Marketplace is Ownable {

  using SafeMath for uint256;

  bool private stopped;

  ///@notice holds the total number of stores created.
  /// @return returns the number of stores.
  uint public storeCount;
  ///@notice holds the total number of products created
  /// @return returns the number of products
  uint public productCount;
  /// @return returns true if passed an admin address
  mapping(address=>bool)public admin;
  /// @return returns true if passed a store owner address
  mapping(address=>bool)public storeOwner;

  ///@notice maps a an integer to a storeFront.
  /// @return returns a storeFront struct.
  mapping(uint=>storeFront)public storeFronts;

  ///@notice holds the ids of all storeFronts belonging to a particular address.
  mapping(address=>uint[])private allStoreFrontsByUser;

  ///@notice holds the ids of all products belonging to a particular store.
  mapping(uint => uint[])private allProductsByAStore;

  ///@notice maps a an integer to a product.
  /// @return returns a Product struct.
  mapping(uint => Product)public Products;

  struct storeFront{
    uint id;
    string name;
    address payable owner;
    uint balance;
  }
  
  struct Product {
    string name;
    uint id;
    uint storeId;
    uint price;
    uint quantity;
  }

  ///@notice emits event when a new admin is added.
  /// @param _address The address of the new admin. 
  event logNewAdmin(address indexed _address);

  ///@notice emits event when an admin is removed.
  /// @param _address The address of the deleted admin. 
  event logAdminRemoved(address indexed _address);

  ///@notice emits event when a new store owner is added by an admin.
  /// @param _address The address of the new store owner. 
  event logNewStoreOwner(address indexed _address);

  ///@notice emits event when a new storeFront is created.
  /// @param id The id of the new store.
  /// @param _owner The address of the storeFront's owner.  
  event logNewStoreFront(uint indexed id,address indexed _owner);

  ///@notice emits event when a new product is added to a store.
  /// @param id The id of the new product.
  /// @param storeId The id of the product's store. 
  event logNewProduct(uint indexed id,uint indexed storeId);

  ///@notice emits event when a product is removed from a store.
  /// @param name The name of the removed product.
  /// @param quantity The quantity of the product deleted.
  event logProductRemoved(string  indexed name,uint indexed quantity);

  ///@notice emits event when a product is bought.
  /// @param name The name of the bought product.
  /// @param quantity The quantity of the product that was bought.
  event logProductSold(string indexed name,uint indexed quantity);

  ///@notice sets the address that deployed the contract as an admin.
  constructor() public {
    admin[msg.sender]=true;
    emit logNewAdmin(msg.sender);
  }

  modifier onlyAdmin(){
    require(admin[msg.sender]==true);
    _;
  }

  modifier onlyStoreOwner(){
    require(storeOwner[msg.sender]==true);
    _;
  }

  modifier stopInEmergency(){
    require(!stopped);
    _;
  }

  modifier onlyInEmergency(){
    require(stopped);
    _;
  }
  /// @notice function to add a new admin
  /// @dev maps the new address to true using mapping admin
  /// @param _admin The address to be added as an admin
  function addAdmin(address _admin)external onlyOwner stopInEmergency{
    require(admin[_admin] == false,"The address is an admin already");
    admin[_admin] = true;
    emit logNewAdmin(_admin);
  }
  
   /// @notice function to remove an admin
  /// @dev maps the new address to false using mapping admin
  /// @param _admin The address of the admin to be removed
  function removeAdmin(address _admin)external onlyOwner stopInEmergency{
    require(admin[_admin] == true, "The address is not an admin ");
    admin[_admin] = false;
    emit logAdminRemoved(_admin);
  }
   /// @notice Stops majority of the contract function in case of an emergency.Can only be activated by the owner.
  function toggleStopped() public onlyOwner{
    stopped = !stopped;
  }

   /// @notice allows an admin to add a new store owner.
  /// @dev maps the new address to true using mapping storeOwner.
  /// @param _address The address of the store owner to be added.
  function addStoreOwner(address _address)public onlyAdmin stopInEmergency{
    require(admin[_address]==false && storeOwner[_address] == false);
    storeOwner[_address] = true;
    emit logNewStoreOwner(_address);
  }

  /// @notice allows a store owner to add a new store front.
  /// @dev creates a new storeFront struct.
  /// @param _name The name of the new store to be created.
  function addStoreFront(string memory _name)public onlyStoreOwner stopInEmergency{
    storeFronts[storeCount] = storeFront({id:storeCount, name:_name, owner:msg.sender, balance:0});
    allStoreFrontsByUser[msg.sender].push(storeCount);
    emit logNewStoreFront(storeCount,msg.sender);
    storeCount = storeCount.add(1);
  } 
  /// @notice allows a store owner to withdraw funds from the store's balance.
  /// @param _id The id of the store to withdraw from.
  /// @param _amount The amount to withdraw from the store's balance.
  function withdrawFunds(uint _id, uint _amount) public {
    storeFront storage store = storeFronts[_id];
    require(msg.sender==store.owner && store.balance >= _amount);
    store.balance = store.balance.sub(_amount);
    (bool success,) = store.owner.call.value(_amount)("");
    require(success);
  }

   /// @notice allows a store owner to add a new product to the store.
  /// @param _name the name of the new product to be added.
  /// @param _storeId The id of the store to which the product is being added.
  /// @param _quantity The quantity of the new product.
  /// @param _price The amount the product is going to be sold.
  function addProduct(string memory _name, uint _storeId,uint _quantity, uint _price) public stopInEmergency {
    require(storeFronts[_storeId].owner == msg.sender && _quantity > 0 && _price > 0);
    Products[productCount] = Product({name:_name, id:productCount, storeId:_storeId,
                                      price:_price, quantity:_quantity});
    allProductsByAStore[_storeId].push(productCount);
    emit logNewProduct(productCount, _storeId);
    productCount = productCount.add(1);
  }

  /// @notice allows a store owner to remove a product from the store.
  /// @param _productId The id of the product to be removed.
  function removeProduct(uint _productId) external stopInEmergency{
    Product memory _product = Products[_productId];
    storeFront memory store = storeFronts[_product.storeId];
    require(msg.sender==store.owner && _product.quantity > 0);
    emit logProductRemoved(_product.name,_product.quantity);
    deleteProduct(_productId,store.id);
  }
    
  function deleteProduct(uint _productId, uint _storeId) private{
    delete Products[_productId];
    uint[] memory allProducts = allProductsByAStore[_storeId];
    for (uint index =0; index < allProducts.length; index++) {
      if (allProducts[index] == _productId){
        allProducts[index] = allProducts[allProducts.length.sub(1)];
        break;
      }
    }
    allProductsByAStore[_storeId] = allProducts;
    allProductsByAStore[_storeId].pop();
  }

  /// @notice allows a store owner to change the price of a product.
  /// @param _productId The id of the product whose price is being changed.
  /// @param _newprice The new price of the product.
  function changePrice(uint _productId, uint _newprice) external stopInEmergency {
    uint _storeId = Products[_productId].storeId;
    require(storeFronts[_storeId].owner == msg.sender);
    Products[_productId].price = _newprice;
  }

  /// @notice allows a shopper to buy product from the store .
  /// @dev deletes a product once the quantity is 0.
  /// @param _productId The id of the product that is being bought.
  /// @param _quantity The quantity of the product the shopper wants to buy.

  function buyProduct(uint _productId,uint _quantity) external payable stopInEmergency{
     require(_quantity <= Products[_productId].quantity && msg.value >= Products[_productId].price.mul(_quantity));
     Products[_productId].quantity = Products[_productId].quantity.sub(_quantity);
     uint _storeId = Products[_productId].storeId;
     storeFronts[_storeId].balance = storeFronts[_storeId].balance.add(msg.value);
     emit logProductSold(Products[_productId].name,_quantity);
     if (Products[_productId].quantity == 0){
       deleteProduct(_productId,_storeId);
     }   
  }  
/// @return returns an integer array of the product ids.
/// @param _storeId The id of the store whose products we want to get  
function returnAllProductsByAStore(uint _storeId) public view returns(uint[] memory){
  return allProductsByAStore[_storeId];
}

/// @return returns an integer array of the store ids.
/// @param _owner The address whose storeFronts we want to get
function returnAllStoreFrontsByUser(address _owner) public view returns(uint[] memory){
  return allStoreFrontsByUser[_owner];
}
  /// @notice allows the owner to kill contract
  /// @dev sends all the ether in the contract to the owner.
  function kill()public onlyOwner onlyInEmergency{
    selfdestruct(address(uint160(owner())));
  } 
}
