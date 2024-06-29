import { Deployer, Reporter } from "@solarity/hardhat-migrate";

import { CombatManagerMock__factory, DicktatorsClashToken__factory } from "@ethers-v6";

import { parseConfig, DeploymentConfig } from "./helpers/config-parser";

export = async (deployer: Deployer) => {
  const config: DeploymentConfig = parseConfig();

  const dicktatorsClashToken = await deployer.deploy(DicktatorsClashToken__factory, [
    config.ownerAddr,
    config.tokenMinterAddr,
    config.tokenName,
    config.tokenSymbol,
  ]);
  const combatManager = await deployer.deploy(CombatManagerMock__factory, [
    config.ownerAddr,
    await dicktatorsClashToken.getAddress(),
  ]);

  Reporter.reportContracts(
    ["DicktatorsClashToken", await dicktatorsClashToken.getAddress()],
    ["CombatManager", await combatManager.getAddress()],
  );
};
