import React, { useState } from "react";
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { useSolanaWallets } from "@privy-io/react-auth/solana";

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  solBalance: number;      // user’s SOL balance
  userPublicKey: string;   // user’s Solana pubkey (from useSolanaWallets)
}

const WithdrawalModal: React.FC<WithdrawalModalProps> = ({
  isOpen,
  onClose,
  solBalance,
  userPublicKey,
}) => {
  const [amount, setAmount] = useState("");
  const [destination, setDestination] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // from Privy to sign & send the transaction
  const { wallets } = useSolanaWallets();

  if (!isOpen) return null; // don't render if modal is closed

  const handleWithdraw = async () => {
    setErrorMsg("");
    if (!amount || !destination) {
      setErrorMsg("Please enter amount & destination.");
      return;
    }

    try {
      setLoading(true);

      const solAmount = parseFloat(amount);
      if (isNaN(solAmount) || solAmount <= 0) {
        throw new Error("Invalid amount");
      }

      // We'll do devnet for this example. For mainnet, use clusterApiUrl('mainnet-beta') or a custom endpoint
      const connection = new Connection("https://lb.drpc.org/ogrpc?network=solana&dkey=Alvbqol6EkjsqyS37yTXigJ68ZTc8YoR75OHIhIl_7lF", {
        wsEndpoint: "wss://solana-mainnet.core.chainstack.com/e7624d46c63de69907a11081a1006ecf",
      });
      const userPubkey = new PublicKey(userPublicKey);

      // Build transaction
      const { blockhash } = await connection.getLatestBlockhash();
      const transaction = new Transaction();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = userPubkey;

      // Convert SOL => lamports
      const lamports = Math.floor(solAmount * 1e9);
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: userPubkey,
          toPubkey: new PublicKey(destination),
          lamports,
        })
      );

      // Prompt user to sign + send
    //   const uiOptions = {
    //     header: "Withdraw SOL",
    //     description: `Send ${solAmount} SOL to ${destination}`,
    //     buttonText: "Sign & Send",
    //   };

      console.log(wallets);

      if (!wallets[0]) {
        throw new Error("No wallet found");
      }

      const signature = await wallets[0].sendTransaction(
        transaction,
        connection,
        {
            skipPreflight: true,
        }
      );

      console.log("Withdrawal Sig =>", signature);

      alert(`Withdrawal successful! Signature: ${signature}`);
      onClose();
    } catch (err: any) {
      console.error("Withdraw error =>", err);
      setErrorMsg(err.message || "Unknown error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 max-w-sm w-full rounded-md relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
        >
          &times;
        </button>

        <h2 className="text-lg font-semibold mb-4">Withdraw SOL</h2>

        {/* Show SOL balance */}
        <p className="text-sm mb-4">SOL balance: {solBalance.toFixed(4)} SOL</p>

        {errorMsg && <p className="text-red-500 text-sm mb-2">{errorMsg}</p>}

        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Amount (SOL)</label>
          <input
            type="number"
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 w-full"
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Destination Address</label>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Enter Solana address..."
            className="border border-gray-300 rounded px-2 py-1 w-full"
          />
        </div>

        <button
          disabled={loading}
          onClick={handleWithdraw}
          className="mt-2 w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
        >
          {loading ? "Withdrawing..." : "Withdraw"}
        </button>
      </div>
    </div>
  );
};

export default WithdrawalModal;
