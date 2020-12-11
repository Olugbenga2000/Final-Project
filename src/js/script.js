const contract_address = 0xF67cc93663831fD2eED84a82d9bC72c4759040c3
//  async()=>{
// //Modern dapp browsers...
// if (window.ethereum){
//     App.web3Provider = window.ethereum;
//     try {
//         //Request account access
//         await window.ethereum.enable();
//     } catch (error) {
//         // User denied account access...
//         console.error("User denied account access")
//     }
// }
// //Legacy dapp browsers...
// else if (window.web3){
//     App.web3Provider = window.web3.currentProvider;
// }
// // If no injected web3 instance is detected, fall back to Ganache
// else{
//     App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
// }
// web3 = new Web3(App.web3Provider)
// console.log(web3)
// 
window.addEventListener('load', function() {

    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined') {
      // Use Mist/MetaMask's provider
      web3js = new Web3(web3.currentProvider);
    } else {
      // Handle the case where the user doesn't have web3. Probably
      // show them a message telling them to install Metamask in
      // order to use our app.
    }
  
    // Now you can start your app & access web3js freely:
    startApp()
  
  })
function startApp(){
instance = new web3js.eth.contract(abi,contract_address)
console.log(instance)
}