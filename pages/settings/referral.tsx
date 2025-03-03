import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { usePrivy, getAccessToken } from "@privy-io/react-auth";
import NewNavbar from "../../components/NewNavbar";

/**
 * This page shows:
 * - The user's own referral code to share
 * - Whether they've already used a referral code, and if so, which code + when
 * - If not used, let them submit one
 */
const ReferralSettingsPage: React.FC = () => {
  const { ready, authenticated, logout } = usePrivy();
  const router = useRouter();

  // State for user's own referral code
  const [myReferralCode, setMyReferralCode] = useState("");
  const [isLoadingMyCode, setIsLoadingMyCode] = useState(true);

  // State for whether I used someone else's code
  const [usedReferralCode, setUsedReferralCode] = useState<string | null>(null);
  const [usedReferralDate, setUsedReferralDate] = useState<string | null>(null);

  // State to handle input + success/error
  const [inputCode, setInputCode] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Check authentication
  useEffect(() => {
    if (ready && !authenticated) {
      logout();
      router.push("/");
    }
  }, [ready, authenticated, router, logout]);

  // Fetch my own code
  async function fetchMyReferralCode() {
    setIsLoadingMyCode(true);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error("No token found");

      const res = await fetch("https://dev-api.finfun.xyz/api/referral/code", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error("Failed to fetch my referral code");
      }
      const data = await res.json();
      if (data.referralCode) {
        setMyReferralCode(data.referralCode);
      }
    } catch (err) {
      console.error("Error fetching my referral code:", err);
    } finally {
      setIsLoadingMyCode(false);
    }
  }

  // Fetch if I used someone else's code
  async function fetchUsedReferral() {
    try {
      const token = await getAccessToken();
      if (!token) throw new Error("No token found");

      // Example endpoint that returns { code: "...", usedAt: "2023-10-08T12:34:00Z" } or something
      const res = await fetch("https://dev-api.finfun.xyz/api/referral/from", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        // might be 404 if none, or might return a special object
        console.warn("No used referral code found (or error).");
        return;
      }
      const data = await res.json();
      // Suppose your server responds with:
      // { message: "No referrer found", referrer: null } if none,
      // or if userUsedReferralCode: { code: "SOME_CODE", usedAt: "2023-10-08T12:34:00Z" }
      // Adjust to your actual structure
      if (data.userUsedReferralCode && data.userUsedReferralCode.code) {
        setUsedReferralCode(data.userUsedReferralCode.code);
        if (data.userUsedReferralCode.usedAt) {
          setUsedReferralDate(new Date(data.userUsedReferralCode.usedAt).toLocaleString());
        }
      }
    } catch (err) {
      console.error("Error fetching used referral info:", err);
    }
  }

  // On mount, fetch both
  useEffect(() => {
    if (ready && authenticated) {
      fetchMyReferralCode();
      fetchUsedReferral();
    }
  }, [ready, authenticated]);

  // Submit code
  async function handleSubmitReferral(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setErrorMessage("");

    if (!inputCode) {
      setErrorMessage("Please enter a referral code.");
      return;
    }

    try {
      const token = await getAccessToken();
      if (!token) throw new Error("No token found");

      const res = await fetch("https://dev-api.finfun.xyz/api/referral", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: inputCode }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Submission failed");
      }

      setMessage("Referral code submitted successfully!");
      // Optionally store the code in local state so we reflect it immediately
      setUsedReferralCode(inputCode);
      // If your server returns a usedAt or something, store it
      // e.g. setUsedReferralDate(new Date().toLocaleString());
      setInputCode("");
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Unknown error");
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white shadow">
        <button onClick={() => router.back()} className="text-xl text-gray-700">
            <img src="/images/icons/left.svg" alt="Arrow left" className="w-4 h-4" />
        </button>
        <h1 className="text-xl font-semibold">Referral Settings</h1>
        <div></div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1">
        {/* My Own Code */}
        <div className="mb-6 bg-white p-4 rounded-md shadow">
          <h2 className="text-md font-semibold mb-2">Your Referral Code</h2>
          {isLoadingMyCode ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : myReferralCode ? (
            <div className="flex items-center space-x-4">
              <p className="text-sm text-gray-700">{myReferralCode}</p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(myReferralCode);
                  alert("Your referral code was copied to clipboard!");
                }}
                className="px-2 py-1 bg-indigo-600 text-white text-xs rounded"
              >
                Copy
              </button>
            </div>
          ) : (
            <p className="text-sm text-red-500">No referral code found.</p>
          )}
          <p className="text-xs text-gray-400 mt-2">
            Share this code with friends, so they can earn you referral points.
          </p>
        </div>

        {/* If user already used a referral code... */}
        {usedReferralCode ? (
          <div className="bg-white p-4 rounded-md shadow">
            <h2 className="text-md font-semibold mb-2">Referral Code Used</h2>
            <p className="text-sm text-gray-700">
              You already used referral code{" "}
              <span className="font-bold">{usedReferralCode}</span>.
            </p>
            {usedReferralDate && (
              <p className="text-xs text-gray-500">Used on {usedReferralDate}</p>
            )}
            <p className="text-xs mt-2 text-gray-400">
              You cannot change the referral code once it&apos;s used.
            </p>
          </div>
        ) : (
          // Otherwise, let them submit one
          <div className="bg-white p-4 rounded-md shadow">
            <h2 className="text-md font-semibold mb-2">Use a Referral Code</h2>
            <p className="text-sm text-gray-500 mb-2">
              Enter a friend&apos;s referral code if you have one.
            </p>
            <form onSubmit={handleSubmitReferral} className="space-y-2">
              {message && <p className="text-green-600 text-sm">{message}</p>}
              {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
              <input
                type="text"
                placeholder="Enter referral code"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
              />
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
              >
                Submit Code
              </button>
            </form>
          </div>
        )}
      </div>

      <NewNavbar />
    </div>
  );
};

export default ReferralSettingsPage;
