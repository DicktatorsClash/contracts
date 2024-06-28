// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {ICombatManager} from "./interfaces/ICombatManager.sol";

contract CombatManager is ICombatManager, Ownable {
    using SafeERC20 for IERC20;

    uint256 public constant MAX_ATTACK_RESULT = 20;
    uint256 public constant CRITICAL_HIT_MULTIPLIER = 2;

    IERC20 public combatToken;

    constructor(address owner_, address combatToken_) Ownable(owner_) {
        _setCombatToken(combatToken_);
    }

    function setCombatToken(address newCombatToken_) external onlyOwner {
        _setCombatToken(newCombatToken_);
    }

    function tryAttack(uint256 tokensAmount_) external {
        _tryAttack(tokensAmount_);
    }

    function _tryAttack(uint256 tokensAmount_) internal {
        if (tokensAmount_ == 0) {
            revert ZeroAttackTokensAmount();
        }

        if (combatToken.balanceOf(msg.sender) < tokensAmount_) {
            revert NotEnoughCombatTokens(tokensAmount_);
        }

        combatToken.safeTransferFrom(msg.sender, address(this), tokensAmount_);

        uint256 attackResult_ = _getAttackResult(tokensAmount_);
        uint256 attackResultTokensAmount_ = _getAttackResultTokensAmount(
            tokensAmount_,
            attackResult_
        );

        if (attackResultTokensAmount_ > 0) {
            combatToken.transfer(msg.sender, attackResultTokensAmount_);
        }

        emit AttackFinished(msg.sender, tokensAmount_, attackResult_, attackResultTokensAmount_);
    }

    function _setCombatToken(address newCombatToken_) internal {
        if (newCombatToken_ == address(0)) {
            revert ZeroCombatTokenAddress();
        }

        combatToken = IERC20(newCombatToken_);
    }

    function _getAttackResult(uint256 tokensAmount_) internal view virtual returns (uint256) {
        return
            uint256(
                keccak256(abi.encode(blockhash(block.number - 1), msg.sender, tokensAmount_))
            ) % MAX_ATTACK_RESULT;
    }

    function _getAttackResultTokensAmount(
        uint256 tokensAmount_,
        uint256 attackResult_
    ) internal pure returns (uint256) {
        uint256 tokensAmountOnePart = tokensAmount_ / (MAX_ATTACK_RESULT / 2);

        return tokensAmountOnePart * attackResult_;
    }
}
