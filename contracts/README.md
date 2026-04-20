# CheckIn (Foundry)

Deploy to Base mainnet (chain id 8453):

```bash
cd contracts
forge script script/DeployCheckIn.s.sol:DeployCheckIn --rpc-url "$BASE_RPC_URL" --broadcast
```

Set `NEXT_PUBLIC_CHECK_IN_CONTRACT_ADDRESS` in the Vercel `web` project (and `web/.env.local`) to the deployed address.

Latest deploy (Base): `0xdFA9C4E8A0FF649C97a2e7034b3f6369934b4eEe` (tx `0x1eecbdac8849e239e4865d1ffd89c203997e04ee1940e2760ee7fd915f462ded`).
