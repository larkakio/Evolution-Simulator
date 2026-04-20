"use client";

import { base } from "wagmi/chains";
import { useConnect } from "wagmi";

export function ConnectSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { connect, connectors, isPending } = useConnect();

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Connect wallet"
      onClick={onClose}
    >
      <div
        className="neon-panel w-full max-w-md rounded-t-2xl border border-cyan-500/40 p-4 shadow-[0_0_40px_rgba(0,255,255,0.15)] sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg tracking-wide text-cyan-200">
            Connect wallet
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm text-fuchsia-300 hover:bg-fuchsia-500/10"
          >
            Close
          </button>
        </div>
        <p className="mb-4 text-sm text-zinc-400">
          Choose a wallet. You will be asked to connect on Base when supported.
        </p>
        <ul className="flex max-h-[50vh] flex-col gap-2 overflow-y-auto">
          {connectors.map((c) => (
            <li key={c.uid}>
              <button
                type="button"
                disabled={isPending}
                onClick={() => {
                  connect(
                    { connector: c, chainId: base.id },
                    { onSuccess: onClose },
                  );
                }}
                className="flex w-full items-center justify-between rounded-xl border border-cyan-500/25 bg-zinc-950/80 px-4 py-3 text-left text-sm text-cyan-100 transition hover:border-cyan-400/60 hover:shadow-[0_0_20px_rgba(0,255,255,0.12)] disabled:opacity-40"
              >
                <span>{c.name}</span>
                {isPending ? (
                  <span className="text-xs text-lime-300">…</span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
