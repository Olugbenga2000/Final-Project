**Design patterns used**:
1.**Fail early and fail loud**: To achieve this, I used ‘require’ to check for conditions needed for function execution as early as possible in the functions and throw exceptions if the conditions are not met.
2.**Restricting access**: I restricted access to some functions to some specific addresses using modifiers and require. E.g.
I.	Only the owner can add new admin and remove admin, stop the contract functionality, destroy the contract.
II.	Only admins can add new store owner
III.	Only store owners can add new stores
IV.	Only owners of a particular store can add product to the store, change price of a product, delete products etc.
3.	**Mortal**: I implemented the ability to destroy the contract and remove it from the blockchain using the selfdestruct keyword (which is restricted to only the owner of the contract).
4.	**Circuit Breaker**: I implemented a circuit breaker design pattern which allows the contract functionalities to be stopped by the owner. This can be done when a bug is detected in the contract. When the contract is stopped, stores with balances will still be able to withdraw their funds.
5.	**Withdrawal pattern**: There is a separation of function logic. There’s a withdraw function which allows store owners to transfer the store’s balance to their addresses. This protects against reentrancy and denial of service.

