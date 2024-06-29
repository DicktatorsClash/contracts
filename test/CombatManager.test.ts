import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { Reverter } from "@/test/helpers/reverter";
import { wei } from "@/scripts/utils/utils";
import { DicktatorsClashToken, CombatManagerMock } from "@ethers-v6";

describe("CombatManager", () => {
  const reverter = new Reverter();

  let OWNER: SignerWithAddress;
  let SECOND: SignerWithAddress;
  let NOTHING: SignerWithAddress;

  let dicktatorsClashToken: DicktatorsClashToken;
  let combatManager: CombatManagerMock;

  const tokensAmount: bigint = wei(1000);
  const tokenName: string = "Dicktators Clash Token";
  const tokenSymbol: string = "DCT";

  before(async () => {
    [OWNER, SECOND, NOTHING] = await ethers.getSigners();

    const DicktatorsClashTokenFactory = await ethers.getContractFactory("DicktatorsClashToken");
    const CombatManagerFactory = await ethers.getContractFactory("CombatManagerMock");

    dicktatorsClashToken = await DicktatorsClashTokenFactory.deploy(
      OWNER.address,
      OWNER.address,
      tokenName,
      tokenSymbol,
    );
    combatManager = await CombatManagerFactory.deploy(OWNER.address, await dicktatorsClashToken.getAddress());

    await dicktatorsClashToken.mint(OWNER.address, tokensAmount);
    await dicktatorsClashToken.mint(await combatManager.getAddress(), tokensAmount);
    await dicktatorsClashToken.approve(await combatManager.getAddress(), tokensAmount);

    await reverter.snapshot();
  });

  afterEach(reverter.revert);

  describe("#constructor", () => {
    it("should set parameters correctly", async () => {
      expect(await combatManager.combatToken()).to.be.eq(await dicktatorsClashToken.getAddress());
      expect(await combatManager.owner()).to.be.eq(OWNER.address);
    });
  });

  describe("#setCombatToken", () => {
    it("should correctly set new combat token address", async () => {
      await combatManager.setCombatToken(NOTHING.address);

      expect(await combatManager.combatToken()).to.be.eq(NOTHING.address);
    });

    it("should get exception if not an owner call this function", async () => {
      await expect(combatManager.connect(SECOND).setCombatToken(SECOND.address))
        .to.be.revertedWithCustomError(combatManager, "OwnableUnauthorizedAccount")
        .withArgs(SECOND.address);
    });

    it("should get exception if pass zero combat token address", async () => {
      await expect(combatManager.setCombatToken(ethers.ZeroAddress)).to.be.revertedWithCustomError(
        combatManager,
        "ZeroCombatTokenAddress",
      );
    });
  });

  describe("#tryAttack", () => {
    const amountToAttack: bigint = wei(100);

    it("should correctly attack with attackResult = 0", async () => {
      const nextAttackResult: bigint = BigInt(1);
      const tx = await combatManager.setAttackResultAndAttack(nextAttackResult - BigInt(1), amountToAttack);

      await expect(tx)
        .to.emit(combatManager, "AttackFinished")
        .withArgs(OWNER.address, amountToAttack, nextAttackResult, 0);
      expect(await dicktatorsClashToken.balanceOf(OWNER.address)).to.be.eq(tokensAmount - amountToAttack);
    });

    it("should correctly attack with attackResult = MAX_ATTACK_RESULT - 1", async () => {
      const nextAttackResult: bigint = await combatManager.MAX_ATTACK_RESULT();
      const tx = await combatManager.setAttackResultAndAttack(nextAttackResult - BigInt(1), amountToAttack);

      await expect(tx)
        .to.emit(combatManager, "AttackFinished")
        .withArgs(OWNER.address, amountToAttack, nextAttackResult, amountToAttack * BigInt(2));
      expect(await dicktatorsClashToken.balanceOf(OWNER.address)).to.be.eq(tokensAmount + amountToAttack);
    });

    it("should correctly attack with attackResult = 8", async () => {
      const nextAttackResult: bigint = BigInt(8);

      const tx = await combatManager.setAttackResultAndAttack(nextAttackResult - BigInt(1), amountToAttack);

      const expectedResultAmount =
        (amountToAttack / ((await combatManager.MAX_ATTACK_RESULT()) / BigInt(2))) * nextAttackResult;

      await expect(tx)
        .to.emit(combatManager, "AttackFinished")
        .withArgs(OWNER.address, amountToAttack, nextAttackResult, expectedResultAmount);
      expect(await dicktatorsClashToken.balanceOf(OWNER.address)).to.be.eq(
        tokensAmount - amountToAttack + expectedResultAmount,
      );
    });

    it("should correctly attack with random attack result", async () => {
      const lastBlockHash = (await ethers.provider.getBlock("latest"))!.hash;
      const attackResultHash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["bytes32", "address", "uint256"],
          [lastBlockHash, OWNER.address, amountToAttack.toString()],
        ),
      );

      const expectedAttackResult = (BigInt(attackResultHash) % (await combatManager.MAX_ATTACK_RESULT())) + BigInt(1);
      const expectedResultAmount =
        (amountToAttack / ((await combatManager.MAX_ATTACK_RESULT()) / BigInt(2))) * expectedAttackResult;

      const tx = await combatManager.tryAttack(amountToAttack);

      await expect(tx)
        .to.emit(combatManager, "AttackFinished")
        .withArgs(OWNER.address, amountToAttack, expectedAttackResult, expectedResultAmount);
      expect(await dicktatorsClashToken.balanceOf(OWNER.address)).to.be.eq(
        tokensAmount - amountToAttack + expectedResultAmount,
      );
    });

    it("should get exception if pass zero tokens amount", async () => {
      await expect(combatManager.tryAttack(0)).to.be.revertedWithCustomError(combatManager, "ZeroAttackTokensAmount");
    });

    it("should get exception if user does not have enough balance", async () => {
      await expect(combatManager.tryAttack(tokensAmount + BigInt(100)))
        .to.be.revertedWithCustomError(combatManager, "NotEnoughCombatTokens")
        .withArgs(tokensAmount + BigInt(100));
    });
  });
});
