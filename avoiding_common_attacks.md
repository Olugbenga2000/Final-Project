**Avoiding common attacks**: 
i) **Re-entrancy Attacks**: The withdraw () function makes an external call to a contract, to prevent re-entrancy, I did all the internal contract state changes before making the external function call.
**Integer Overflow and Underflow**: To prevent integer overflow and underflow, I made use of openzeppelin’s safe math library for all my arithmetic computations.
**Denial of service with failed call**: To withdraw their funds, store owners have to explicitly call the withdraw function, which sends the desired amount from the smart contract to their addresses, this separation of logic helps to prevent the denial of service attack 

