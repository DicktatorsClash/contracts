// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {CombatManager} from "../CombatManager.sol";

contract CombatManagerMock is CombatManager {
    uint256 nextAttackResult;

    constructor(address owner_, address combatToken_) CombatManager(owner_, combatToken_) {
        clearNextAttackResult();
    }

    function setNextAttackResult(uint256 nextAttackResult_) public {
        nextAttackResult = nextAttackResult_;
    }

    function clearNextAttackResult() public {
        nextAttackResult = type(uint256).max;
    }

    function setAttackResultAndAttack(uint256 nextAttackResult_, uint256 tokensAmount_) external {
        setNextAttackResult(nextAttackResult_);

        _tryAttack(tokensAmount_);

        clearNextAttackResult();
    }

    function getAttackResult(uint256 tokensAmount_) external view returns (uint256) {
        return _getAttackResult(tokensAmount_);
    }

    function _getAttackResult(uint256 tokensAmount_) internal view override returns (uint256) {
        if (nextAttackResult == type(uint256).max) {
            return super._getAttackResult(tokensAmount_);
        } else {
            return (nextAttackResult % MAX_ATTACK_RESULT) + 1;
        }
    }
}
