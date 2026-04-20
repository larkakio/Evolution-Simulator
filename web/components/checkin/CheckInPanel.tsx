"use client";

import { useAccount, useChainId, useReadContract, useSwitchChain, useWriteContract } from "wagmi";
import { base } from "wagmi/chains";
import { checkInAbi, checkInAddress } from "@/lib/contracts/checkIn";
import { getCheckInDataSuffix } from "@/lib/builder/attributionSuffix";

export function CheckInPanel() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync, isPending: isSwitching } = useSwitchChain();
  const { writeContractAsync, isPending: isWriting } = useWriteContract();

  const { data: streak } = useReadContract({
    address: checkInAddress,
    abi: checkInAbi,
    functionName: "streakOf",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(checkInAddress && address) },
  });

  const busy = isWriting || isSwitching;

  async function onCheckIn() {
    if (!isConnected || !address || !checkInAddress) return;
    const baseId = base.id;
    if (chainId !== baseId) {
      await switchChainAsync({ chainId: baseId });
    }
    await writeContractAsync({
      address: checkInAddress,
      abi: checkInAbi,
      functionName: "checkIn",
      chainId: baseId,
      dataSuffix: getCheckInDataSuffix(),
    });
  }

  if (!checkInAddress) {
    return (
      <div className="neon-panel rounded-xl border border-zinc-600/50 p-4 text-sm text-zinc-400">
        Daily check-in is not configured. Set{" "}
        <code className="text-cyan-300">NEXT_PUBLIC_CHECK_IN_CONTRACT_ADDRESS</code>{" "}
        after deploying the contract.
      </div>
    );
  }

  return (
    <div className="neon-panel rounded-xl border border-lime-500/35 p-4">
      <h3 className="font-display text-base text-lime-200">Daily check-in</h3>
      <p className="mt-1 text-xs text-zinc-400">
        On-chain once per UTC day on Base. You only pay gas (no fee in contract).
      </p>
      {address && typeof streak === "bigint" ? (
        <p className="mt-2 text-sm text-cyan-200">
          Current streak: <span className="font-semibold text-fuchsia-300">{streak.toString()}</span>
        </p>
      ) : null}
      <button
        type="button"
        disabled={!isConnected || busy}
        onClick={() => void onCheckIn()}
        className="neon-pulse mt-4 w-full rounded-xl border border-lime-400/50 bg-lime-500/10 py-2.5 text-sm font-semibold text-lime-100 disabled:opacity-40"
      >
        {busy ? "Confirm in wallet…" : "Check in on Base"}
      </button>
    </div>
  );
}
