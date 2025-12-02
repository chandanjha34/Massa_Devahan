import React, { createContext, useState, ReactNode, useContext } from "react";
import { 
  Mas, 
  SmartContract, 
  OperationStatus, 
  Args 
} from "@massalabs/massa-web3";
import { getWallets} from "@massalabs/wallet-provider";

// Your Contract Address
const CONTRACT_ADDRESS = "AS12iAs8AA7CTsxaRA1niJqxR8vtuRpEU4CbgvqM5dCBkyowAXXEn";

interface NFTContextType {
  currentAccount: string | null;
  connectWallet: () => Promise<string>;
  mint: (to: string, tokenURI: string) => Promise<string>;
  addServiceRecord: (tokenId: bigint, json: string) => Promise<string>;
}

export const NFTContext = createContext<NFTContextType | undefined>(undefined);

export const NFTProvider = ({ children }: { children: ReactNode }) => {
  const [currentAccount, setCurrentAccount] = useState<string | null>(null);
  // We store the full Account object to use it as a provider
  const [walletAccount, setWalletAccount] = useState<any | null>(null);

  // -------------------------------------------------
  // Connect Wallet
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
  // Mint Function
  // -------------------------------------------------
  const mint = async (to: string, tokenURI: string): Promise<string> => {
    if (!walletAccount) throw new Error("Wallet not connected");

    console.log('Minting NFT...', { to, tokenURI });

    // 1. Create Arguments
    const args = new Args()
      .addString(to)
      .addString(tokenURI);

    // 2. Initialize Contract Wrapper
    const contract = new SmartContract(walletAccount, CONTRACT_ADDRESS);

    // 3. Send Transaction
    // We add 0.1 MAS for storage fees to be safe
    const operation = await contract.call(
      'mint',
      args,
      { coins: Mas.fromString("1") } 
    );

    console.log('Mint submitted, OpId:', operation.id);

    // 4. Wait for Final Execution (Robustness)
    const status = await operation.waitFinalExecution();
    
    if (status !== OperationStatus.Success) {
      throw new Error("Mint transaction failed on-chain");
    }

    console.log('Mint confirmed!');
    return operation.id;
  };

  // -------------------------------------------------
  // Add Service Record
  // -------------------------------------------------
  const addServiceRecord = async (
    tokenId: bigint,
    json: string
  ): Promise<string> => {
    if (!walletAccount) throw new Error("Wallet not connected");

    console.log('Adding Service Record...', { tokenId, json });

    const args = new Args()
      .addU64(tokenId)
      .addString(json);

    const contract = new SmartContract(walletAccount, CONTRACT_ADDRESS);

    const operation = await contract.call(
      'addServiceRecord',
      args,
      { coins: Mas.fromString("0.1") }
    );

    console.log('Record submitted, OpId:', operation.id);

    const status = await operation.waitFinalExecution();

    if (status !== OperationStatus.Success) {
      throw new Error("Add Service Record transaction failed");
    }

    console.log('Service Record confirmed!');
    return operation.id;
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