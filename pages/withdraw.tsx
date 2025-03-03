import React, { useState } from "react";
import { useRouter } from "next/router";
import { getAccessToken } from "@privy-io/react-auth";

enum Step {
  INPUT = 1,
  CONFIRM = 2,
}

export default function WithdrawPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(Step.INPUT);

  // Form fields
  const [token, setToken] = useState<"SOL" | "USDC">("SOL");
  const [amount, setAmount] = useState("");
  const [destination, setDestination] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // 1) Move from input -> confirm
  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!amount || !destination) {
      setErrorMsg("Please fill in all fields");
      return;
    }

    setStep(Step.CONFIRM);
  };

  // 2) Confirm => call server
  const handleConfirm = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      // Retrieve Privy token if needed for server auth:
      const tokenValue = await getAccessToken();

      const res = await fetch("/api/withdraw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenValue}`, // if your server uses Privy token
        },
        body: JSON.stringify({
          token,
          amount,
          destination,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Withdrawal failed");
      }

      alert("Withdrawal successful!");
      router.push("/account"); // or wherever
    } catch (err: any) {
      setErrorMsg(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === Step.CONFIRM) {
      setStep(Step.INPUT);
    } else {
      router.push("/account");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="p-4 bg-white shadow flex items-center justify-between">
        <button onClick={handleBack} className="text-gray-700">
            <img src="/images/icons/left.svg" alt="Arrow left" className="w-4 h-4" />
        </button>
        <h1 className="text-xl font-semibold">Withdraw</h1>
        <div />
      </div>

      <div className="p-4 flex-1">
        {step === Step.INPUT && (
          <form onSubmit={handleNext} className="max-w-md mx-auto bg-white p-4 rounded shadow">
            <h2 className="text-md font-semibold mb-4">Withdrawal Details</h2>
            {errorMsg && <p className="text-red-500 text-sm mb-2">{errorMsg}</p>}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Token</label>
              <select
                className="border border-gray-300 rounded px-3 py-2 w-full"
                value={token}
                onChange={(e) => setToken(e.target.value as "SOL" | "USDC")}
              >
                <option value="SOL">SOL</option>
                <option value="USDC">USDC</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Amount</label>
              <input
                type="number"
                step="any"
                className="border border-gray-300 rounded px-3 py-2 w-full"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">Destination Address</label>
              <input
                type="text"
                className="border border-gray-300 rounded px-3 py-2 w-full"
                placeholder="Solana address..."
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Next
            </button>
          </form>
        )}

        {step === Step.CONFIRM && (
          <div className="max-w-md mx-auto bg-white p-4 rounded shadow">
            <h2 className="text-md font-semibold mb-4">Confirm Withdrawal</h2>
            {errorMsg && <p className="text-red-500 text-sm mb-2">{errorMsg}</p>}

            <p className="text-sm mb-2">
              <strong>Token:</strong> {token}
            </p>
            <p className="text-sm mb-2">
              <strong>Amount:</strong> {amount}
            </p>
            <p className="text-sm mb-2 break-all">
              <strong>Destination:</strong> {destination}
            </p>

            <div className="flex gap-4 mt-6">
              <button
                onClick={handleBack}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Back
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                {loading ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
