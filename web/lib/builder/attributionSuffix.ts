import { Attribution } from "ox/erc8021";
import type { Hex } from "viem";

/** ERC-8021 builder suffix for `writeContract` `dataSuffix` (PROMPT). */
export function getCheckInDataSuffix(): Hex {
  const override = process.env.NEXT_PUBLIC_BUILDER_CODE_SUFFIX;
  if (override?.startsWith("0x") && override.length > 2) {
    return override as Hex;
  }
  const code = process.env.NEXT_PUBLIC_BUILDER_CODE;
  if (!code) return "0x";
  return Attribution.toDataSuffix({ codes: [code] });
}
