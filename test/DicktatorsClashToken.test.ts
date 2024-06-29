import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { Reverter } from "@/test/helpers/reverter";
import { wei } from "@/scripts/utils/utils";
import { DicktatorsClashToken } from "@ethers-v6";

describe("DicktatorsClashToken", () => {
  const reverter = new Reverter();

  let OWNER: SignerWithAddress;
  let SECOND: SignerWithAddress;
  let TOKEN_MINTER: SignerWithAddress;

  let dicktatorsClashToken: DicktatorsClashToken;

  const tokenName: string = "Dicktators Clash Token";
  const tokenSymbol: string = "DCT";

  before(async () => {
    [OWNER, SECOND, TOKEN_MINTER] = await ethers.getSigners();

    const DicktatorsClashTokenFactory = await ethers.getContractFactory("DicktatorsClashToken");

    dicktatorsClashToken = await DicktatorsClashTokenFactory.deploy(
      OWNER.address,
      TOKEN_MINTER.address,
      tokenName,
      tokenSymbol,
    );

    await reverter.snapshot();
  });

  afterEach(reverter.revert);

  describe("#constructor", () => {
    it("should set parameters correctly", async () => {
      expect(await dicktatorsClashToken.name()).to.be.eq(tokenName);
      expect(await dicktatorsClashToken.symbol()).to.be.eq(tokenSymbol);
      expect(await dicktatorsClashToken.owner()).to.be.eq(OWNER.address);
      expect(await dicktatorsClashToken.tokenMinterAddr()).to.be.eq(TOKEN_MINTER.address);
    });
  });

  describe("#setTokenMinterAddress", () => {
    it("should correctly set new token minter address", async () => {
      await dicktatorsClashToken.setTokenMinterAddress(SECOND.address);

      expect(await dicktatorsClashToken.tokenMinterAddr()).to.be.eq(SECOND.address);
    });

    it("should get exception if not an owner call this function", async () => {
      await expect(dicktatorsClashToken.connect(SECOND).setTokenMinterAddress(SECOND.address))
        .to.be.revertedWithCustomError(dicktatorsClashToken, "OwnableUnauthorizedAccount")
        .withArgs(SECOND.address);
    });
  });

  describe("#mint", () => {
    it("should mint correctly", async () => {
      expect(await dicktatorsClashToken.balanceOf(SECOND.address)).to.eq(0);

      let tx = dicktatorsClashToken.mint(SECOND.address, wei(1000));

      await expect(tx).to.changeTokenBalance(dicktatorsClashToken, SECOND, wei(1000));

      tx = dicktatorsClashToken.connect(TOKEN_MINTER).mint(SECOND.address, wei(1000));

      await expect(tx).to.changeTokenBalance(dicktatorsClashToken, SECOND, wei(1000));
    });

    it("should get exception if caller is not an owner or token minter", async () => {
      await expect(dicktatorsClashToken.connect(SECOND).mint(SECOND.address, wei(1000)))
        .to.be.revertedWithCustomError(dicktatorsClashToken, "NotATokenMinterAddressOrOwner")
        .withArgs(SECOND.address);
    });
  });

  describe("#burn", () => {
    it("should burn correctly", async () => {
      expect(await dicktatorsClashToken.balanceOf(SECOND.address)).to.eq(0);

      await dicktatorsClashToken.mint(SECOND.address, wei(1000));

      let tx = dicktatorsClashToken.burn(SECOND.address, wei("0.5"));

      await expect(tx).to.changeTokenBalance(dicktatorsClashToken, SECOND, wei("-0.5"));

      tx = dicktatorsClashToken.connect(TOKEN_MINTER).burn(SECOND.address, wei("0.5"));

      await expect(tx).to.changeTokenBalance(dicktatorsClashToken, SECOND, wei("-0.5"));
    });

    it("should get exception if caller is not an owner or token minter", async () => {
      await expect(dicktatorsClashToken.connect(SECOND).burn(SECOND.address, wei(1000)))
        .to.be.revertedWithCustomError(dicktatorsClashToken, "NotATokenMinterAddressOrOwner")
        .withArgs(SECOND.address);
    });
  });
});
