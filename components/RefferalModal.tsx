// components/ReferralModal.tsx
import React from "react";

type ReferralModalProps = {
  onClose: () => void;
  onSubmitCode: (code: string) => void;
  errorMessage?: string;       // Display in red
  successMessage?: string;     // Display in green
};

const ReferralModal: React.FC<ReferralModalProps> = ({
  onClose,
  onSubmitCode,
  errorMessage = "",
  successMessage = "",
}) => {
  const [referralCode, setReferralCode] = React.useState("");

  const handleContinue = () => {
    onSubmitCode(referralCode);
  };

  const handleNoReferral = () => {
    onSubmitCode("");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-md p-4 max-w-sm w-full relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
        >
          &times;
        </button>

        <h2 className="text-lg font-bold mb-4 text-center">
          Do you have a referral code?
        </h2>

        {/* Success Message */}
        {successMessage && (
          <div className="text-green-600 text-sm mb-2 text-center font-semibold">
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="text-red-500 text-sm mb-2 text-center">
            {errorMessage}
          </div>
        )}

        <input
          type="text"
          placeholder="Enter your referral code"
          value={referralCode}
          onChange={(e) => setReferralCode(e.target.value)}
          className="border w-full p-2 rounded-md mb-4"
        />

        <button
          disabled={!referralCode}
          onClick={handleContinue}
          className={`w-full py-2 mb-2 rounded-md ${
            referralCode
              ? "bg-indigo-600 text-white hover:bg-indigo-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Continue
        </button>

        <button
          onClick={handleNoReferral}
          className="w-full py-2 text-sm text-center text-indigo-600 hover:underline"
        >
          Continue without referral code
        </button>
      </div>
    </div>
  );
};

export default ReferralModal;
