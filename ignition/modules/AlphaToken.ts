import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("AlphaTokenModule", (m) => {
  const alpha = m.contract("AlphaToken");

  return { alpha };
});
