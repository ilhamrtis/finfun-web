import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import NewNavbar from "../components/NewNavbar";
import {
  usePrivy,
  useSolanaWallets,
  getAccessToken,
} from "@privy-io/react-auth";
import {useFundWallet} from '@privy-io/react-auth/solana';
import WithdrawalModal from "../components/WithdrawalModal";

const AccountPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"Tokens" | "Votes" | "History">("Tokens");
  const router = useRouter();

  const {
    ready,
    authenticated,
    logout,
  } = usePrivy();

  // Get user’s solana wallets
  const { wallets } = useSolanaWallets();

  // useFundWallet() from Privy to deposit devnet SOL (if using devnet) or test funds
  const { fundWallet } = useFundWallet();

  // States to track SOL and USDC balances
  const [solBalance, setSolBalance] = useState<number>(0);
  const [usdcBalance, setUsdcBalance] = useState<number>(0);
  const [solBalanceUSD, setSolBalanceUSD] = useState<number>(0);

  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

  // On mount or auth changes, if not logged in => redirect
  useEffect(() => {
    if (ready && !authenticated) {
      logout();
      router.push("/");
    }
  }, [ready, authenticated, router, logout]);

  // Identify user’s Solana wallet
  const solanaWallet = wallets.find(
    (w) => w.walletClientType === "privy"
  );

  // 1) Fetch the user’s SOL & USDC balance
  useEffect(() => {
    async function fetchWalletBalance() {
      const token = await getAccessToken(); // from @privy-io/react-auth
      if (!token) throw new Error("No token found");
      const res = await fetch("https://dev-api.finfun.xyz/api/wallet/balance", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error("Failed to fetch quests");
      }
      const data = await res.json();
      setSolBalance(data.solBalance);
      setUsdcBalance(data.usdcBalance);
      setSolBalanceUSD(data.solValueUsd);
    }

    // If we have a solana wallet address, fetch
    if (solanaWallet?.address) {
      fetchWalletBalance();
    }
  }, [solanaWallet?.address]);

  const handleAddDeposit = async () => {
    try {
      if (solanaWallet?.address) {
        // Attempt to fund the wallet
        await fundWallet(solanaWallet.address);
      } else {
        
      }
    } catch (err) {
      console.error("Error depositing to Solana wallet:", err);
    }
  };

  const handleWithdraw = () => {
    setIsWithdrawOpen(true);
  };

  async function fetchWalletBalance() {
    const token = await getAccessToken();
    if (!token) throw new Error("No token found");
    const res = await fetch("https://dev-api.finfun.xyz/api/wallet/balance", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      throw new Error("Failed to fetch wallet balance");
    }
    const data = await res.json();
    setSolBalance(data.solBalance);
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white">
        <button onClick={() => alert("Go Back")} className="text-xl text-gray-700">
          {/* If you have a real back route, add it here */}
        </button>
        <h1 className="text-xl font-semibold">Account</h1>
        <button onClick={() => router.push("/settings")} className="text-xl text-gray-700">
          <img src="/images/icons/gear.svg" alt="Settings" className="w-6 h-6" />
        </button>
      </div>

      {/* Profile / Balance */}
      <div className="flex flex-col items-center bg-white py-6">
        <img
          src="/images/users/avatar.png"
          alt="Profile"
          className="w-24 h-24 rounded-full mb-4"
        />
        <h2 className="text-4xl font-bold text-indigo-600 mb-4">${(solBalanceUSD + usdcBalance).toFixed(2)}</h2>
        <div className="flex space-x-6">
          <button
            onClick={handleAddDeposit}
            className="flex flex-col items-center text-indigo-600"
          >
            <div className="w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center">
              <img src="/images/icons/deposit.svg" alt="Deposit" className="w-6 h-6" />
            </div>
            <span className="mt-2 text-sm font-medium">Deposit</span>
          </button>
          <button
            onClick={handleWithdraw}
            className="flex flex-col items-center text-indigo-600"
          >
            <div className="w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center">
              <img src="/images/icons/withdraw.svg" alt="Withdraw" className="w-6 h-6" />
            </div>
            <span className="mt-2 text-sm font-medium">Withdraw</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-around bg-white border-b">
        <button
          onClick={() => setActiveTab("Tokens")}
          className={`px-4 py-2 text-sm font-semibold ${
            activeTab === "Tokens"
              ? "border-b-2 border-indigo-600 text-indigo-600"
              : "text-gray-500"
          }`}
        >
          Tokens
        </button>
        <button
          onClick={() => setActiveTab("Votes")}
          className={`px-4 py-2 text-sm font-semibold ${
            activeTab === "Votes"
              ? "border-b-2 border-indigo-600 text-indigo-600"
              : "text-gray-500"
          }`}
        >
          Votes
        </button>
        <button
          onClick={() => setActiveTab("History")}
          className={`px-4 py-2 text-sm font-semibold ${
            activeTab === "History"
              ? "border-b-2 border-indigo-600 text-indigo-600"
              : "text-gray-500"
          }`}
        >
          History
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === "Tokens" && (
          <>
            <h3 className="text-sm font-semibold text-gray-800 mb-4">
              Solana Tokens
            </h3>
            {/* SOL row */}
            <div
              className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 shadow-md mb-4"
            >
              <div className="flex items-center space-x-4">
                <img src="/images/tokens/sol.svg" alt="Solana" className="w-8 h-8" />
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {solBalance.toFixed(4)} SOL
                  </p>
                </div>
              </div>
              {/* If you want a $ value, convert with your rate */}
              <p className="text-sm font-semibold text-indigo-600">
                ≈ ${(solBalanceUSD).toFixed(2)}
              </p>
            </div>

            {/* USDC row */}
            <div
              className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 shadow-md mb-4"
            >
              <div className="flex items-center space-x-4">
                <img src="/images/tokens/usdc.svg" alt="USDC" className="w-8 h-8" />
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {usdcBalance.toFixed(4)} USDC
                  </p>
                </div>
              </div>
              <p className="text-sm font-semibold text-indigo-600">
                {/* If you know USDC = $1, then just show the same amount */}
                ${usdcBalance.toFixed(2)}
              </p>
            </div>
          </>
        )}

        {activeTab === "Votes" && (
          <>
            <h3 className="text-sm font-semibold text-gray-800 mb-4">Available Votes</h3>
              <div
                className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 shadow-md mb-4"
              >
                <div className="flex items-center space-x-4">
                  <img src="/images/icons/votes.svg" alt="Votes" className="w-8 h-8" />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">0</p>
                  </div>
                </div>
                {/* <p className="text-sm font-semibold text-indigo-600">Exchange</p> */}
              </div>
          </>
        )}

        {activeTab === "History" && (
          <p className="text-center text-gray-600 mt-4">No history available</p>
        )}
      </div>

      <NewNavbar />

      {/* Extra floating deposit button if desired */}
      <button
        onClick={handleAddDeposit}
        className="fixed bottom-16 left-1/2 transform -translate-x-1/2 px-8 py-3 bg-indigo-600 text-white rounded-full shadow-md hover:bg-indigo-700"
      >
        Add Deposit
      </button>

      <WithdrawalModal
        isOpen={isWithdrawOpen}
        onClose={async () => {
          setIsWithdrawOpen(false);
          // re-fetch after user closes => update balance
          await fetchWalletBalance();
        }}
        solBalance={solBalance}
        userPublicKey={solanaWallet?.address || ""}
      />
    </div>
  );
};

export default AccountPage;