// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IDicktatorsClashToken {
    error NotATokenMinterAddressOrOwner(address senderAddr);

    function setTokenMinterAddress(address tokenMinterAddr_) external;

    function mint(address to_, uint256 amount_) external;

    function burn(address to_, uint256 amount_) external;
}
