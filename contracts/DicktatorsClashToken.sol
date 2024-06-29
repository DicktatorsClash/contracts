// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

import {IDicktatorsClashToken} from "./interfaces/IDicktatorsClashToken.sol";

contract DicktatorsClashToken is IDicktatorsClashToken, ERC20Permit, Ownable {
    address public tokenMinterAddr;

    modifier onlyTokenMinterOrOwner() {
        _onlyTokenMinterOrOwner(msg.sender);
        _;
    }

    constructor(
        address tokenOwner_,
        address tokenMinterAddr_,
        string memory name_,
        string memory symbol_
    ) ERC20(name_, symbol_) ERC20Permit(name_) Ownable(tokenOwner_) {
        _setTokenMinterAddress(tokenMinterAddr_);
    }

    function setTokenMinterAddress(address tokenMinterAddr_) external onlyOwner {
        _setTokenMinterAddress(tokenMinterAddr_);
    }

    function mint(address to_, uint256 amount_) external onlyTokenMinterOrOwner {
        _mint(to_, amount_);
    }

    function burn(address to_, uint256 amount_) external onlyTokenMinterOrOwner {
        _burn(to_, amount_);
    }

    function _setTokenMinterAddress(address tokenMinterAddr_) internal {
        tokenMinterAddr = tokenMinterAddr_;
    }

    function _onlyTokenMinterOrOwner(address addrToCheck_) internal view {
        if (addrToCheck_ != tokenMinterAddr && addrToCheck_ != owner()) {
            revert NotATokenMinterAddressOrOwner(addrToCheck_);
        }
    }
}
