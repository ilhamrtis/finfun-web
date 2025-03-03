import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { usePrivy, getAccessToken } from "@privy-io/react-auth";
import NewNavbar from "../components/NewNavbar";
import TopNavBar from "../components/TopNavbar";
import Tabs from "../components/Tabs";
import SquareTabs from "../components/SquareTabs";
import CompetitionCard from "../components/CompetitionCard";
import VoteCard from "../components/VoteCard";

interface Submission {
  userId: string;
  coinAddress?: string;
  predictedPrice?: number;
}

interface Competition {
  _id: string;
  name: string;
  type: string;             // "Callers", "Prediction", or "Trading"
  prizePool: string;
  organizerName: string;
  organizerLogo: string;
  fee: number;              // 0.01, etc.
  status: string;           // "live", "upcoming", or "ended"
  description?: string;
  submissions: Submission[];
  registrationStart: string;
  registrationEnd: string;
  announceTime: string;
  // any other fields in your competition schema
}

const ActivitiesPage: React.FC = () => {
  // Tabs
  const [activeSquareTab, setActiveSquareTab] = useState("My Competitions");
  const [activeTimeTab, setActiveTimeTab] = useState("All");

  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const { ready, authenticated, logout } = usePrivy();

  useEffect(() => {
    if (ready && !authenticated) {
      logout();
      router.push("/");
    }
  }, [ready, authenticated, router, logout]);

  // Fetch user's joined competitions from /api/competitions/my-activities
  useEffect(() => {
    async function fetchMyActivities() {
      try {
        setLoading(true);
        const token = await getAccessToken();
        if (!token) throw new Error("No access token");
        
        const res = await fetch("https://dev-api.finfun.xyz/api/competitions/my-activities", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          throw new Error("Failed to fetch my activities");
        }
        const data: Competition[] = await res.json();
        setCompetitions(data);
      } catch (err) {
        console.error("fetchMyActivities error:", err);
      } finally {
        setLoading(false);
      }
    }
    if (ready && authenticated) {
      fetchMyActivities();
    }
  }, [ready, authenticated]);

  // Dummy votes
  const votes = [
    {
      rank: 1,
      name: "Andika Putra",
      votes: 550,
      category: "Meme Main Callers",
      avatar: "",
    },
    {
      rank: 2,
      name: "Boyce Avenue",
      votes: 550,
      category: "Meme Main Callers",
      avatar: "/images/users/votes.png",
    },
    {
      rank: 3,
      name: "Charlie Pambudi",
      votes: 550,
      category: "Meme Main Callers",
      avatar: "",
    },
  ];

  // Optional: map status => "On Going", "Completed" for the tab
  function mapStatusToTab(status: string): "On Going" | "Completed" {
    if (status === "live") return "On Going";
    if (status === "ended") return "Completed";
    // "upcoming" could also be "On Going" or separate
    return "On Going"; // or handle differently if you want a separate upcoming tab
  }

  // Filter by "All", "On Going", "Completed"
  const filteredCompetitions = competitions.filter((comp) => {
    if (activeTimeTab === "All") return true;
    const timeTab = mapStatusToTab(comp.status);
    return timeTab === activeTimeTab;
  });

  return (
    <div className="flex flex-col min-h-screen">
      <TopNavBar points={150} onCreateClick={() => alert("Create clicked!")} />

      <SquareTabs
        tabs={["My Competitions", "My Votes"]}
        activeTab={activeSquareTab}
        onTabChange={setActiveSquareTab}
      />

      {activeSquareTab === "My Competitions" && (
        <div className="mb-12">
          <Tabs
            tabs={["All", "On Going", "Completed"]}
            activeTab={activeTimeTab}
            onTabChange={setActiveTimeTab}
            tabStyle="mt-6"
          />

          <div className="p-4">
            {loading ? (
              <p className="text-center text-gray-500">Loading...</p>
            ) : filteredCompetitions.length > 0 ? (
              filteredCompetitions.map((competition) => (
                <CompetitionCard
                  anu={competition._id}
                  key={competition._id}
                  // The props that your CompetitionCard expects:
                  title={competition.name}
                  participants={competition.submissions?.length || 0}
                  prizePool={competition.prizePool}
                  endsIn={"N/A"} // or do a dynamic countdown if you like
                  organizerLogo={competition.organizerLogo}
                  organizerName={competition.organizerName}
                  isHome={false}
                  // For status: either map or pass your own logic
                  timeStatus={mapStatusToTab(competition.status)}
                  // If you have "result" logic, pass something or undefined
                  result={undefined}
                  onJoin={() => alert(`Already joined ${competition.name}`)}
                />
              ))
            ) : (
              <p className="text-center text-gray-600 mt-4">
                No competitions found.
              </p>
            )}
          </div>
        </div>
      )}

      {activeSquareTab === "My Votes" && (
        <div className="mb-12">
          {votes.map((vote, index) => (
            <VoteCard
              key={index}
              {...vote}
              onVote={() => alert(`Voted for ${vote.name}`)}
            />
          ))}
        </div>
      )}

      <NewNavbar />
    </div>
  );
};

export default ActivitiesPage;
