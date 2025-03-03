import React from "react";
import { useRouter } from "next/router";

interface CompetitionCardProps {
  anu: string;
  title: string;
  participants: number;
  prizePool: string;
  endsIn: string;
  organizerLogo: string;
  organizerName: string;
  isHome: boolean;
  timeStatus: string;
  result?: string;
  onJoin: () => void;
}

const CompetitionCard: React.FC<CompetitionCardProps> = (
  {
  anu,
  title,
  participants,
  prizePool,
  endsIn,
  organizerLogo,
  organizerName,
  isHome,
  timeStatus,
  result,
}) => {
  const router = useRouter();
  return (
    <div className="relative flex items-start justify-between p-5 bg-white rounded-xl shadow-md mb-4 border border-gray-200">
      {/* Left Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <div className="mt-4">
          <p className="text-sm text-gray-500">Prize pool</p>
          <p className="text-lg font-bold text-green-600">{prizePool}</p>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex flex-col items-end">
        <div className="px-3 py-1 border border-gray-300 text-sm text-gray-800 rounded-full mb-4">
          {participants} Participants
        </div>
        <p className="text-sm text-gray-500">End In</p>
        <p className="text-lg font-semibold text-gray-800 mb-4">{endsIn}</p>
        {!isHome && (
        <div className="mt-2 flex items-center space-x-2">
          {timeStatus === "On Going" && (
            <div className="flex items-center text-yellow-600">
              <img
                src="/images/icons/onGoing.svg"
                alt="On Going"
                className="w-4 h-4 mr-1"
              />
              <span className="text-sm font-medium">On Going</span>
            </div>
          )}
          {timeStatus === "Completed" && (
            <div className="flex items-center">
              {result === "Win" && (
                <div className="flex items-center text-blue-600">
                  <img
                    src="/images/icons/crown.svg"
                    alt="Win"
                    className="w-4 h-4 mr-1"
                  />
                  <span className="text-sm font-medium">Win</span>
                </div>
              )}
              {result === "Lose" && (
                <div className="flex items-center text-red-600">
                  <img
                    src="/images/icons/stop.svg"
                    alt="Lose"
                    className="w-4 h-4 mr-1"
                  />
                  <span className="text-sm font-medium">Lose</span>
                </div>
              )}
              <div className="flex items-center text-green-600 ml-2">
                <img
                  src="/images/icons/checkCircle.svg"
                  alt="Completed"
                  className="w-4 h-4 mr-1"
                />
                <span className="text-sm font-medium">Completed</span>
              </div>
            </div>
          )}
        </div>
        )}
        {isHome && (
        <button
          onClick={() => router.push("/detail/" + anu)} 
          className="px-8 py-2 bg-indigo-600 text-white text-sm rounded-full shadow hover:bg-indigo-700"
        >
          Join
        </button>
        )}
      </div>

      {/* Organizer Section (Left Bottom) */}
      <div className="absolute bottom-4 left-4 flex items-center">
        <img
          src={organizerLogo}
          alt={organizerName}
          className="w-8 h-8 rounded-full mr-2"
        />
        <p className="text-sm text-gray-500">{organizerName}</p>
      </div>
    </div>
  );
};

export default CompetitionCard;
