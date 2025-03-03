import React from "react";

interface VoteCardProps {
  rank: number;
  name: string;
  votes: number;
  category: string;
  avatar: string; // URL for the user's avatar or placeholder
  onVote: () => void;
}

const VoteCard: React.FC<VoteCardProps> = ({ rank, name, votes, category, avatar, onVote }) => {
  return (
    <div className="flex items-center justify-between p-4 mt-5 bg-white rounded-lg shadow-md mb-4 border border-gray-200">
      {/* Left Section */}
      <div className="flex items-center space-x-4">
        {/* Rank */}
        <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-indigo-500">
          <span className="text-indigo-500 font-bold text-lg">{rank}</span>
        </div>

        {/* Avatar and Details */}
        <div className="flex items-center space-x-4">
          {/* Avatar */}
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-indigo-500 text-white font-bold text-lg">
            {avatar ? (
              <img
                src={avatar}
                alt={name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              "F"
            )}
          </div>

          {/* Name and Details */}
          <div>
            <p className="text-sm font-semibold text-gray-800">
              {name} {rank === 1 && <span className="text-yellow-500">🏆</span>}
            </p>
            <p className="text-xs text-gray-500">{category}</p>
            <p className="text-xs text-gray-500">
              {votes} {votes === 1 ? "vote" : "votes"}
            </p>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <button
        onClick={onVote}
        className="px-6 py-2 text-sm bg-indigo-600 text-white rounded-full shadow-md hover:bg-indigo-700"
      >
        Vote
      </button>
    </div>
  );
};

export default VoteCard;
