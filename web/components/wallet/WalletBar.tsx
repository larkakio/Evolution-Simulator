"use client";

import { useAccount, useChainId, useDisconnect, useSwitchChain } from "wagmi";
import { base } from "wagmi/chains";
import { useState } from "react";
import { ConnectSheet } from "./ConnectSheet";

export function WalletBar() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const [sheet, setSheet] = useState(false);

  const wrong = isConnected && chainId !== base.id;

  return (
    <>
      <div className="flex flex-col gap-2 rounded-xl border border-cyan-500/30 bg-zinc-950/60 p-3 backdrop-blur-md">
        {wrong ? (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-orange-500/50 bg-orange-950/40 px-3 py-2 text-sm text-orange-100">
            <span>Wrong network — switch to Base.</span>
            <button
              type="button"
              disabled={isSwitching}
              onClick={() => switchChain({ chainId: base.id })}
              className="rounded-lg bg-orange-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-orange-200 ring-1 ring-orange-400/40 hover:bg-orange-500/30 disabled:opacity-50"
            >
              {isSwitching ? "Switching…" : "Switch to Base"}
            </button>
          </div>
        ) : null}
        <div className="flex flex-wrap items-center justify-between gap-2">
          {isConnected && address ? (
            <>
              <code className="max-w-[220px] truncate text-xs text-lime-200 sm:max-w-xs">
                {address}
              </code>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => disconnect()}
                  className="rounded-lg border border-fuchsia-500/40 px-3 py-1.5 text-xs text-fuchsia-200 hover:bg-fuchsia-500/10"
                >
                  Disconnect
                </button>
              </div>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setSheet(true)}
              className="neon-pulse w-full rounded-xl border border-cyan-400/50 bg-cyan-500/10 py-2.5 text-sm font-semibold text-cyan-100 sm:w-auto sm:px-6"
            >
              Connect wallet
            </button>
          )}
        </div>
      </div>
      <ConnectSheet open={sheet} onClose={() => setSheet(false)} />
    </>
  );
}
