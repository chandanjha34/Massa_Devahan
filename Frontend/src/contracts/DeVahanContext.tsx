import React, { createContext, useState, ReactNode, useContext } from "react";
import { JsonRpcProvider, SmartContract, Args } from "@massalabs/massa-web3";
import { getWallets } from "@massalabs/wallet-provider";

const CONTRACT_ADDRESS =
  "AS1Msa2er1vxLL68V4DS3yvdRVGPCKLKt1uqembo1rwY9UbNNAgc";

interface NFTContextType {
  currentAccount: string | null;
  connectWallet: () => Promise<string>;
  mint: (to: string, tokenURI: string) => Promise<string>;
  addServiceRecord: (tokenId: bigint, json: string) => Promise<string>;
}

export const NFTContext = createContext<NFTContextType | undefined>(
  undefined
);

export const NFTProvider = ({ children }: { children: ReactNode }) => {
  const [currentAccount, setCurrentAccount] = useState<string | null>(null);
  const [walletAccount, setWalletAccount] = useState<any | null>(null);

  const rpc = JsonRpcProvider.buildnet();

  // -------------------------------------------------
  // Connect to wallet (Bearby / Station)
  // -------------------------------------------------
  const connectWallet = async () => {
    const wallets = await getWallets();
    if (wallets.length === 0) throw new Error("No Massa wallet installed");

    const wallet = wallets[0];
    await wallet.connect();

    const accounts = await wallet.accounts();
    if (accounts.length === 0) throw new Error("No accounts in wallet");

    const acct = accounts[0];
    setWalletAccount(acct);
    setCurrentAccount(acct.address);

    return acct.address;
  };

  // -------------------------------------------------
  // Write call helper: use walletAccount.callSC
  // -------------------------------------------------
const callContract = async (fn: string, argsHex: string): Promise<string> => {
  if (!walletAccount) throw new Error("Wallet not connected");

  return await walletAccount.callSC({
    targetAddress: CONTRACT_ADDRESS,
    functionName: fn,
    parameter: argsHex,      // MUST be hex string
    maxGas: 1_000_000_000n,
    coins: 0n,
  });
};


  const toBase64 = (bytes: Uint8Array): string =>
  Buffer.from(bytes).toString("base64");

  // -------------------------------------------------
  // Mint
  // -------------------------------------------------
 const mint = async (to: string, tokenURI: string): Promise<string> => {
  const argsBytes = new Args()
    .addString(to)
    .addString(tokenURI)
    .serialize();   // ✅ correct

  const hexStr = "0x" + Buffer.from(argsBytes).toString("hex");

  return await callContract("mint", hexStr);
};


  // -------------------------------------------------
  // Add service record
  // -------------------------------------------------
  const addServiceRecord = async (
    tokenId: bigint,
    json: string
  ): Promise<string> => {
    const argsBytes = new Args().addU64(tokenId).addString(json).serialize();
    const hexStr = "0x" + Buffer.from(argsBytes).toString("hex");
    return await callContract("addServiceRecord", hexStr);
  };

  return (
    <NFTContext.Provider
      value={{ currentAccount, connectWallet, mint, addServiceRecord }}
    >
      {children}
    </NFTContext.Provider>
  );
};

export const useNFT = (): NFTContextType => {
  const ctx = useContext(NFTContext);
  if (!ctx) throw new Error("useNFT must be used within NFTProvider");
  return ctx;
};
