// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ICombatManager {
    error NotEnoughCombatTokens(uint256 requiredTokensAmount);
    error ZeroAttackTokensAmount();
    error ZeroCombatTokenAddress();

    event AttackFinished(
        address indexed userAddr,
        uint256 tokensAmount,
        uint256 attackResult,
        uint256 resultTokensAmount
    );

    function setCombatToken(address newCombatToken_) external;

    function tryAttack(uint256 tokensAmount_) external;
}
