# Final-project
**Overview**
The marketplace contract is located in the contracts folder, it inherits from openzeppellin’s ownable and safe math library. The contract takes charge of buying and selling of products.
Once the contract is deployed, the owner (the account that deployed the contract) has the following duties  
I.	Can add and remove admins
II.	Can add store owners
III.	Can toggle the contract functionalities’
IV.	Can destroy the contract and remove it from the blockchain.
Admins added by the owner can also add new store owners.
Store owners, once added by the owner or admin can then create several stores, add products to the stores, withdraw from the store’s balance, change product price and delete products from a store.
Shoppers can buy products from any store of their choice.

**Directory structure:** 
1.	The build folder contains the artifacts of the compiled contracts
2.	The contract folder contains the solidity smart contract file (Marketplace. Sol)
3.	The test folder contains the tests written in JavaScript
4.	The migrations folder contains the file used to migrate the marketplace smart contract.
5.	The src folder contains the html, css and javascript file used for the smart contract’s frontend.

**Dependencies**
Truffle – to install truffle, simply run the command npm install -g truffle
To install project requirements, navigate to the project root directory and run npm install

How to deploy to a local network(ganache)
Clone the contract to your local machine using git clone
Run ganache and make sure it’s running on the port: 7545

**To deploy the contract**
Run truffle migrate –reset
Once it migrates successfully, we can test the contract by running truffle test

**To run the web interface** 
Make sure you have metamask plugin installed, switch from the main Ethereum network to ropsten test network. You can get ropsten ether from the <a href="https://faucet.ropsten.be/"> faucet</a>. 	.
navigate to the project root directory on the command line and run npm run dev, A webpage should open automatically on port 3000, if it doesn’t it simply go to the url localhost:3000 in your browser.
Start interacting with the contract.
