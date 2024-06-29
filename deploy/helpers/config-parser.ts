import fs from "fs";
import path from "path";
import hre, { ethers } from "hardhat";

export type DeploymentConfig = {
  ownerAddr: string;
  tokenMinterAddr: string;
  tokenName: string;
  tokenSymbol: string;
};

export function parseConfig(): DeploymentConfig {
  const expectedConfigName: string = path.resolve("configs", `${hre.network.name}.config.json`);

  if (!fs.existsSync(expectedConfigName)) {
    throw new Error(`Expected config file ${expectedConfigName} not found`);
  }

  const config: DeploymentConfig = JSON.parse(fs.readFileSync(expectedConfigName, "utf8"));

  return validateConfig(config);
}

function validateConfig(config: DeploymentConfig): DeploymentConfig {
  console.assert(isAddressValid(config.ownerAddr), `Invalid ownerAddr address: ${config.ownerAddr}`);
  console.assert(isAddressValid(config.tokenMinterAddr), `Invalid tokenMinterAddr address: ${config.tokenMinterAddr}`);
  console.assert(config.tokenName.length > 0, `Invalid tokenName: ${config.tokenName}`);
  console.assert(config.tokenSymbol.length > 0, `Invalid tokenSymbol: ${config.tokenSymbol}`);

  return config;
}

function isAddressValid(address: string | undefined): boolean {
  return !(!address || !ethers.isAddress(address) || address == ethers.ZeroAddress);
}
