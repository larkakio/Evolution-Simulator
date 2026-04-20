import type { Address } from "viem";

export const checkInAbi = [
  {
    type: "function",
    name: "checkIn",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "lastCheckInDay",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "streakOf",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
] as const;

const raw = process.env.NEXT_PUBLIC_CHECK_IN_CONTRACT_ADDRESS;

export const checkInAddress: Address | undefined =
  raw && /^0x[a-fA-F0-9]{40}$/.test(raw) ? (raw as Address) : undefined;
