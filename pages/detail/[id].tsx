import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { usePrivy, getAccessToken } from "@privy-io/react-auth";
import { useSolanaWallets } from "@privy-io/react-auth/solana";
import { Connection, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";

/** 
 * Submission + Competition interfaces
 */
interface Submission {
  userId: string;
  userName?: string;
  coinAddress?: string;
  predictedPrice?: number;
}

interface Competition {
  _id: string;
  name: string;
  type: "callers" | "prediction" | "trading";
  prizePool: string;
  organizerName: string;
  organizerLogo: string;
  status: string; // "live"|"upcoming"|"ended"
  fee: number;    // e.g. 0.01 (SOL)
  description?: string;
  submissions: Submission[];
  registrationStart: string;
  registrationEnd: string;
  announceTime: string;
}

const CompetitionDetailPage: React.FC = () => {
  const router = useRouter();
  const { ready, authenticated, logout } = usePrivy();
  const { wallets } = useSolanaWallets();
  
  const { id } = router.query; // dynamic route param, e.g. /details/[id]

  // Manage which tab is active: "Details" or "Leaderboards"
  const [activeTab, setActiveTab] = useState<"Details" | "Leaderboards">("Details");

  // Competition data from server
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [loadingComp, setLoadingComp] = useState(true);

  // Form fields for joining
  const [coinAddress, setCoinAddress] = useState("");
  const [predictedPrice, setPredictedPrice] = useState("");
  const [tradingAddress, setTradingAddress] = useState("");

  // Confirm join modal
  const [showJoinConfirm, setShowJoinConfirm] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState("");

  // Ensure user is authenticated
  useEffect(() => {
    if (ready && !authenticated) {
      logout();
      router.push("/");
    }
  }, [ready, authenticated, router, logout]);

  // Fetch competition detail from server
  useEffect(() => {
    async function fetchCompetition() {
      if (!id) return;
      setLoadingComp(true);
      try {
        const res = await fetch(`https://dev-api.finfun.xyz/api/competitions/${id}`);
        if (!res.ok) {
          throw new Error("Failed to fetch competition");
        }
        const data: Competition = await res.json();
        setCompetition(data);
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoadingComp(false);
      }
    }
    if (id) {
      fetchCompetition();
    }
  }, [id]);

  // Switch tabs
  const handleTabChange = (tab: "Details" | "Leaderboards") => {
    setActiveTab(tab);
  };

  // "Join" button => show confirm modal
  const handleJoinClick = () => {
    setJoinError("");
    setShowJoinConfirm(true);
  };

  // Confirm => pay fee => call join endpoint => redirect
  const handleConfirmJoin = async () => {
    if (!competition) return;
    setJoinError("");
    setJoinLoading(true);

    try {
      const token = await getAccessToken();
      if (!token) throw new Error("No token found");

      const depositPubkey = new PublicKey("GrV4Nfr9pMnp2DvG8WJPSyXqJyWxFTvvyr4SnQbY5Mhz");
      const userWallet = wallets[0];
      if (!userWallet) throw new Error("No user wallet found");

      // Build transaction
      const connection =  new Connection("https://rough-maximum-firefly.solana-mainnet.quiknode.pro/91a72d243584775a096110039059e859f325fced/", {
              wsEndpoint: "wss://solana-mainnet.core.chainstack.com/e7624d46c63de69907a11081a1006ecf",
            });
      const blockhashData = await connection.getLatestBlockhash();
      const transaction = new Transaction({
        feePayer: new PublicKey(userWallet.address),
        recentBlockhash: blockhashData.blockhash,
      });

      const lamports = Math.floor((competition.fee || 0.01) * 1e9);
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(userWallet.address),
          toPubkey: depositPubkey,
          lamports,
        })
      );

      // sign & send
      const signature = await userWallet.sendTransaction(transaction, connection, {
        skipPreflight: true,
      });
      console.log("Join fee signature =>", signature);

      // call join endpoint
      let body: any = { transactionSignature: signature };
      if (competition.type.toLowerCase() === "callers") {
        body.coinAddress = coinAddress;
      } else if (competition.type.toLowerCase() === "prediction") {
        body.predictedPrice = Number(predictedPrice);
      } else if (competition.type.toLowerCase() === "trading") {
        body.tradingAddress = tradingAddress;
      }

      const res = await fetch(`https://dev-api.finfun.xyz/api/competitions/${competition._id}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Join competition failed");
      }

      alert("Join successful!");
      router.push("/activities");
    } catch (err: any) {
      console.error("Join error =>", err);
      setJoinError(err.message || "Unknown error");
    } finally {
      setJoinLoading(false);
      setShowJoinConfirm(false);
    }
  };

  if (loadingComp || !competition) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-500">Loading competition details...</p>
      </div>
    );
  }

  // participants count
  const participants = competition.submissions?.length || 0;

  // Field for user input depends on competition.type
  let inputField = null;
  if (competition.type.toLowerCase() === "callers") {
    inputField = (
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Solana Token Address</label>
        <input
          type="text"
          value={coinAddress}
          onChange={(e) => setCoinAddress(e.target.value)}
          className="border border-gray-300 w-full p-2 rounded text-sm"
          placeholder="GrV1...."
        />
      </div>
    );
  } else if (competition.type.toLowerCase() === "prediction") {
    inputField = (
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          Please fill your predicted price<span className="text-red-500 ml-1">*</span>
        </label>
        <input
          type="number"
          step="any"
          value={predictedPrice}
          onChange={(e) => setPredictedPrice(e.target.value)}
          className="border border-gray-300 w-full p-2 rounded text-sm"
          placeholder="Enter your predicted price"
        />
        <p className="text-xs text-gray-500 mt-1">Note : Maximum deposit 200 USD</p>
      </div>
    );
  } else if (competition.type.toLowerCase() === "trading") {
    inputField = (
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Trading Address</label>
        <input
          type="text"
          value={tradingAddress}
          onChange={(e) => setTradingAddress(e.target.value)}
          className="border border-gray-300 w-full p-2 rounded text-sm"
          placeholder="Your trading wallet address"
        />
      </div>
    );
  }

  // Tab content
  let content = null;
  if (activeTab === "Details") {
    content = (
      <div className="px-4 pb-20 pt-4">
        {/* Competition Card UI */}
        <div className="bg-white rounded-xl p-4 shadow mb-4 border border-gray-200 relative">
          <div className="flex justify-between mb-2">
            <h2 className="text-lg font-bold text-gray-900">{competition.name}</h2>
            <div className="text-sm flex flex-col items-end">
              <span className="text-gray-500 text-xs mb-1">{participants} Participants</span>
              <span className="text-right text-gray-800">
                End In 23h 50m 22s
              </span>
            </div>
          </div>
          {/* Prize + organizer */}
          <div className="mt-2">
            <p className="text-sm text-gray-500">Prize pool</p>
            <p className="text-md font-bold text-green-600">{competition.prizePool}</p>
          </div>
          <div className="flex items-center mt-4">
            <img
              src={competition.organizerLogo}
              alt={competition.organizerName}
              className="w-8 h-8 rounded-full mr-2"
            />
            <p className="text-sm text-gray-500">{competition.organizerName}</p>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white p-4 rounded-xl shadow mb-4 border border-gray-200">
          <h3 className="text-md font-semibold text-gray-800 mb-2">
            {competition.name} Details Competition
          </h3>
          <p className="text-sm text-gray-600">
            {competition.description || "Guess the closest price to win! Participants must submit their best prediction..."}
          </p>
        </div>

        {/* Required info form */}
        <div className="bg-white p-4 rounded-xl shadow mb-4 border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-800 mb-2">
            Required Information
          </h4>
          {inputField}

          <p className="text-xs text-gray-500 mb-3">
            By clicking 'Join', you agree to the terms and conditions
          </p>
          <button
            onClick={handleJoinClick}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700"
          >
            Join
          </button>
        </div>
      </div>
    );
  } else {
    // Leaderboard
    content = (
      <div className="px-4 py-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Leaderboards</h2>
        {competition.submissions && competition.submissions.length > 0 ? (
          <ul className="space-y-3">
            {competition.submissions.map((sub, idx) => (
              <li key={idx} className="p-3 border border-gray-200 rounded-md bg-white">
                <p className="text-sm font-semibold text-gray-800 mb-1">
                  User: {sub.userName}
                </p>
                {sub.coinAddress && (
                  <p className="text-sm text-gray-600">
                    Coin Address: {sub.coinAddress}
                  </p>
                )}
                {sub.predictedPrice && (
                  <p className="text-sm text-gray-600">
                    Prediction: {sub.predictedPrice}
                  </p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No submissions yet.</p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex items-center p-4 bg-white border-b">
        <button
          onClick={() => router.back()}
          className="text-gray-700 mr-4 text-sm"
        >
          &larr;
        </button>
        <h1 className="text-md font-semibold text-gray-800">{competition.name}</h1>
      </div>

      {/* Tabs */}
      <div className="flex bg-white">
        <button
          onClick={() => handleTabChange("Details")}
          className={`flex-1 py-3 text-center border-b-2 ${
            activeTab === "Details"
              ? "border-indigo-600 text-indigo-600 font-semibold"
              : "border-gray-200 text-gray-500"
          }`}
        >
          Details
        </button>
        <button
          onClick={() => handleTabChange("Leaderboards")}
          className={`flex-1 py-3 text-center border-b-2 ${
            activeTab === "Leaderboards"
              ? "border-indigo-600 text-indigo-600 font-semibold"
              : "border-gray-200 text-gray-500"
          }`}
        >
          Leaderboards
        </button>
      </div>

      {/* Main Content */}
      {content}

      {/* Join Confirm Modal */}
      {showJoinConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white w-full max-w-sm rounded-xl p-6 relative">
            <button
              onClick={() => setShowJoinConfirm(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              &times;
            </button>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Confirm Join</h2>
            <p className="text-sm text-gray-700 mb-4">
              You will pay a fee of <span className="font-bold">{competition.fee} SOL</span> to join. 
              Proceed?
            </p>
            {joinError && <p className="text-sm text-red-500 mb-2">{joinError}</p>}

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowJoinConfirm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmJoin}
                disabled={joinLoading}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                {joinLoading ? "Joining..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompetitionDetailPage;
