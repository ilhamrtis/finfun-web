import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { usePrivy, getAccessToken } from "@privy-io/react-auth";
import NewNavbar from "../components/NewNavbar";

interface QuestItem {
  _id: string;
  title: string;
  points: number;
  url: string;
  startDate: string;
  endDate: string;
  createdAt?: string;
}

interface HistoryItem {
  type: "quest" | "referral" | "referralUsed";
  questId?: string;
  title?: string;
  description: string;
  points: number;
  date: string;
}

const QuestPage: React.FC = () => {
  // Tabs
  const [activeTab, setActiveTab] = useState<"Quest" | "Points History">("Quest");

  // Auth / Router
  const { ready, authenticated, logout } = usePrivy();
  const router = useRouter();

  // State: Quests, History, Points, Referral Code
  const [quests, setQuests] = useState<QuestItem[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  const [referralCode, setReferralCode] = useState("FINFUN");

  // Check auth
  useEffect(() => {
    if (ready && !authenticated) {
      logout();
      router.push("/");
    }
  }, [ready, authenticated, router, logout]);

  // Fetch data from server
  async function fetchAllData() {
    try {
      const token = await getAccessToken();
      if (!token) throw new Error("No token found");

      // 1) Fetch quests
      const resQuests = await fetch("https://dev-api.finfun.xyz/api/quests", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resQuests.ok) {
        throw new Error("Failed to fetch quests");
      }
      const questsData = await resQuests.json();
      setQuests(questsData.quests || []);

      // 2) Fetch summary (completed quests + referral events)
      const resSummary = await fetch("https://dev-api.finfun.xyz/api/quests/summary", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resSummary.ok) {
        throw new Error("Failed to fetch summary");
      }
      const summaryData = await resSummary.json();
      setUserPoints(summaryData.userPoints || 0);
      setHistory(summaryData.history || []);

      // 3) Fetch referral code if needed
      const resReferral = await fetch("https://dev-api.finfun.xyz/api/referral/code", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resReferral.ok) {
        const data = await resReferral.json();
        if (data.referralCode) {
          setReferralCode(data.referralCode);
        }
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  }

  // On mount (once user is authenticated), fetch everything
  useEffect(() => {
    if (ready && authenticated) {
      fetchAllData();
    }
  }, [ready, authenticated]);

  // Utility: check if quest is completed
  function isQuestCompleted(questId: string): boolean {
    return history.some((item) => item.type === "quest" && item.questId === questId);
  }

  // When user clicks a quest
  const handleQuestClick = async (quest: QuestItem) => {
    const completed = isQuestCompleted(quest._id);
    if (completed) return;

    // 1) Open the quest URL in new tab
    window.open(quest.url, "_blank");

    // 2) Mark quest as completed on server
    try {
      const token = await getAccessToken();
      if (!token) throw new Error("No token found");

      const res = await fetch("https://dev-api.finfun.xyz/api/quests/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ questId: quest._id }),
      });
      if (!res.ok) {
        // Optional: handle error, show a toast, etc.
        const errData = await res.json();
        console.error("Complete quest error:", errData.error || "Unknown error");
        return;
      }
      const data = await res.json();
      console.log("Quest completed:", data);

      // 3) Re-fetch summary (and optionally quests) to update UI
      await fetchAllData();
    } catch (err) {
      console.error("Error completing quest:", err);
    }
  };

  // Copy referral code only
  const handleCopy = () => {
    navigator.clipboard
      .writeText(referralCode)
      .then(() => {
        alert("Referral code copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy link:", err);
        alert("Failed to copy link. Please copy manually!");
      });
  };

  // Share link
  const handleShare = () => {
    const shareUrl = `https://app.finfun.xyz/?referral=${referralCode}`;
    if (navigator.share) {
      navigator
        .share({
          text: "Join Finfun with my referral code!",
          url: shareUrl,
        })
        .catch((err) => console.error("Share failed:", err));
    } else {
      alert(`Share this link: ${shareUrl}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Title Bar */}
      <div className="flex items-center justify-between p-4 bg-white">
        <button onClick={() => alert("Go Back")} className="text-lg text-gray-700">
          {/* If you have a back arrow icon, you can put it here */}
        </button>
        <h1 className="text-xl font-semibold">Quest</h1>
        <div></div>
      </div>

      {/* Referral Banner */}
      <div
        className="relative p-6 bg-center bg-cover rounded-lg shadow-md m-4 flex flex-col items-center"
        style={{ backgroundImage: "url('/images/background.svg')" }}
      >
        <h2 className="text-lg font-semibold text-white">Share Referral Code</h2>
        <p className="text-sm text-gray-100 mt-2 text-center">
          You have sent your referral code to <span className="font-bold">20 friends</span>
        </p>

        {/* Referral Code Section */}
        <div className="flex items-center bg-white rounded-full shadow-md mt-4 w-full max-w-sm px-4 py-2">
          <input
            type="text"
            value={referralCode}
            readOnly
            className="flex-1 text-sm text-gray-800 bg-white outline-none border-transparent focus:border-transparent focus:ring-0"
          />
          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="flex items-center justify-center px-2 py-1 text-sm text-white rounded-full shadow-md"
          >
            <img
              src="/images/icons/copy.svg"
              alt="Copy"
              className="w-4 h-4"
            />
          </button>
          {/* Share Button */}
          <button
            onClick={handleShare}
            className="flex items-center justify-center px-2 py-1 text-sm text-white rounded-full shadow-md ml-2"
          >
            <img
              src="/images/icons/share.svg"
              alt="Share"
              className="w-4 h-4"
            />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-around border-gray-300">
        <button
          onClick={() => setActiveTab("Quest")}
          className={`px-20 py-2 text-sm font-semibold ${
            activeTab === "Quest"
              ? "border-b-2 border-indigo-600 text-indigo-600"
              : "text-gray-500 border-b-2 border-gray-200"
          }`}
        >
          Quest
        </button>
        <button
          onClick={() => setActiveTab("Points History")}
          className={`px-16 py-2 text-sm font-semibold ${
            activeTab === "Points History"
              ? "border-b-2 border-indigo-600 text-indigo-600"
              : "text-gray-500 border-b-2 border-gray-200"
          }`}
        >
          Points History
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === "Quest" ? (
          <>
            <h3 className="text-sm font-semibold text-gray-800 mb-4">Available Quests</h3>
            {quests.map((quest) => {
              const completed = isQuestCompleted(quest._id);
              return (
                <div
                  key={quest._id}
                  className={`p-4 bg-white rounded-xl border-2 border-zinc-100 shadow-md mb-4 cursor-pointer ${
                    !completed ? "hover:shadow-lg" : ""
                  }`}
                  onClick={() => handleQuestClick(quest)}
                >
                  <div className="flex items-center space-x-4">
                    {/* Quest Icon */}
                    <div className="flex items-center justify-center w-14 h-14 rounded-full">
                      <img
                        src="/images/quest/star.png"
                        alt="Quest Icon"
                        className="w-8 h-8 object-contain"
                      />
                    </div>

                    <div className="flex-1">
                      <h4 className="text-md my-1 font-semibold text-gray-800">{quest.title}</h4>
                      <p className="text-sm my-1 text-gray-600">Get {quest.points} Points</p>
                      <p className="text-sm my-1 text-gray-400">
                        Ends on: {new Date(quest.endDate).toLocaleDateString()}
                      </p>

                      {/* Completed/Not Completed */}
                      {completed ? (
                        <div className="flex items-center text-green-600 text-xs font-medium mt-2">
                          <img
                            src="/images/icons/checkCircle.svg"
                            alt="Completed"
                            className="w-4 h-4 mr-1"
                          />
                          Completed
                        </div>
                      ) : (
                        <div className="flex items-center text-gray-500 text-xs font-medium mt-2">
                          <div className="w-1/2 bg-gray-200 h-2 rounded-full"></div>
                          <span className="ml-2">Not Complete</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        ) : (
          <>
            {/* Points History tab */}
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-md font-semibold text-gray-800">Current Points</h3>
                <div className="px-4 py-1 text-indigo-600 border-2 border-indigo-600 rounded-full text-sm font-semibold">
                  {userPoints} Points
                </div>
              </div>

              {history.length === 0 && (
                <p className="text-center text-gray-500">No history yet.</p>
              )}

              {history.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 shadow-md mb-4"
                >
                  {/* Left Section */}
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full">
                      <img
                        src="/images/icons/up.svg"
                        alt="Receive"
                        className="w-5 h-5 text-green-600"
                      />
                    </div>
                    <div>
                      <p className="text-md font-semibold text-gray-800">Receive</p>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                  </div>

                  {/* Right Section */}
                  <div className="text-right">
                    <p className="text-sm font-semibold text-indigo-600">+{item.points}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(item.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <NewNavbar />
    </div>
  );
};

export default QuestPage;
