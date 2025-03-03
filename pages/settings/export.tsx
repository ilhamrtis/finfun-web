import React, { useEffect } from "react";
import { usePrivy, useSolanaWallets } from "@privy-io/react-auth";
import { useRouter } from "next/router";
import NewNavbar from "../../components/NewNavbar";

/**
 * Example Settings Page to export user’s private key from a Privy wallet.
 * 
 * CAUTION: Exposing private keys to the user is sensitive. 
 * Only do this if your security model allows it.
 */
const SettingsPage: React.FC = () => {
  const { ready, authenticated, logout } = usePrivy();
  const { wallets, exportWallet } = useSolanaWallets();
  const router = useRouter();

  useEffect(() => {
    if (ready && !authenticated) {
      logout();
      router.push("/");
    }
  }, [ready, authenticated, logout, router]);

  const handleExportKey = async () => {
    try {
    const wallet = wallets.find(
    (wallet) => wallet.walletClientType === 'privy'
    );
    if (wallet?.address) {
      await exportWallet({ address: wallet.address });
    } else {
      throw new Error("Wallet address is undefined");
    }
    } catch (error) {
      console.error("Error exporting key:", error);
      alert("Failed to export private key. Check console for more info.");
    }
  };


  return (
    <div className="flex flex-col min-h-screen">
       <div className="flex items-center justify-between p-4 bg-white ">
        <button onClick={() => router.back()} className="text-xl text-gray-700">
            <img src="/images/icons/left.svg" alt="Arrow left" className="w-4 h-4" />
        </button>
        <h1 className="text-xl font-semibold">Export Key</h1>
        <div></div>
      </div>

      <div className="p-4 flex flex-col space-y-6">
        {/* Export Key Section */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-md font-semibold mb-2">Export Private Key</h2>
          <p className="text-sm text-gray-600 mb-4">
            Your wallet’s private key. Keep this <b><u>SECRET</u></b> and store it somewhere safe.
          </p>
          <button
            onClick={handleExportKey}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Export Key
          </button>

        </div>
      </div>
      <div className="mb-12"></div>
      <NewNavbar />
    </div>
  );
};

export default SettingsPage;
