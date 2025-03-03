import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { usePrivy, getAccessToken } from "@privy-io/react-auth";
import NewNavbar from "../components/NewNavbar";
import TopNavBar from "../components/TopNavbar";
import Tabs from "../components/Tabs";
import SquareTabs from "../components/SquareTabs";
import CompetitionCard from "../components/CompetitionCard";
import ReferralModal from "../components/RefferalModal";

// utility functions
function getStatusAndDeadline(
  registrationStart: Date,
  registrationEnd: Date,
  announceTime: Date
): { status: string; deadline: Date | null } {
  const now = new Date();
  if (now < registrationStart) {
    return { status: "Upcoming", deadline: registrationStart };
  } else if (now >= registrationStart && now < registrationEnd) {
    return { status: "● Live Now", deadline: registrationEnd };
  } else if (now >= registrationEnd && now < announceTime) {
    // or "Finalizing" if you want
    return { status: "Ended", deadline: announceTime };
  } else {
    return { status: "Past", deadline: null };
  }
}

function formatCountdown(deadline: Date) {
  const now = new Date().getTime();
  const end = deadline.getTime();
  const diff = end - now;
  if (diff <= 0) {
    return "N/A";
  }
  const seconds = Math.floor(diff / 1000) % 60;
  const minutes = Math.floor(diff / 60000) % 60;
  const hours = Math.floor(diff / 3600000) % 24;
  const days = Math.floor(diff / 86400000);

  let parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);

  return parts.join(" ");
}

const MAX_REFERRAL_PROMPTS = 3;

interface Submission {
  userId: string;
  coinAddress?: string;
  predictedPrice?: number;
}

interface Competition {
  _id: string;
  name: string;
  type: string;
  prizePool: string;
  organizerName: string;
  organizerLogo: string;
  fee: number;
  registrationStart: string; // "2025-03-01T00:00:00.000Z"
  registrationEnd: string;   // "2025-03-01T00:05:00.000Z"
  announceTime: string;      // "2025-03-10T00:00:00.000Z"
  status: string;            // "live" | "upcoming" | "ended" (from DB)
  submissions: Submission[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

const HomePage: React.FC = () => {
  const [activeSquareTab, setActiveSquareTab] = useState("All");
  const [activeTimeTab, setActiveTimeTab] = useState("Live Now");
  const [competitions, setCompetitions] = useState<Competition[]>([]);

  // We'll store a local "mapped" array of competitions that includes dynamic "timeStatus" and "endsIn"
  const [displayComps, setDisplayComps] = useState<
    Array<Competition & { timeStatus: string; endsIn: string }>
  >([]);

  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { ready, authenticated, logout } = usePrivy();
  const router = useRouter();

  // Show referral modal if authenticated & below max prompts
  useEffect(() => {
    if (ready && !authenticated) {
      logout();
      router.push("/");
      return;
    }
    if (ready && authenticated) {
      const timesShownStr = localStorage.getItem("referralModalShown") || "0";
      const timesShown = parseInt(timesShownStr, 10) || 0;
      if (timesShown < MAX_REFERRAL_PROMPTS) {
        setIsReferralModalOpen(true);
      }
    }
  }, [ready, authenticated, router, logout]);

  // Fetch competitions from your backend
  useEffect(() => {
    async function fetchCompetitions() {
      try {
        const token = await getAccessToken();
        if (!token) {
          throw new Error("No access token; user is not authenticated.");
        }
        const res = await fetch("https://dev-api.finfun.xyz/api/competitions", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          throw new Error("Failed to fetch competitions");
        }
        const data: Competition[] = await res.json();
        setCompetitions(data);
      } catch (err) {
        console.error("Error fetching competitions:", err);
      }
    }
    if (ready && authenticated) {
      fetchCompetitions();
    }
  }, [ready, authenticated]);

  // Convert "db status" => "Live Now"/"Upcoming"/"Past" was your old approach
  // Now we do a dynamic approach using registrationStart, registrationEnd, announceTime
  // We'll run an interval that recalculates every second
  useEffect(() => {
    const intervalId = setInterval(() => {
      const mapped = competitions.map((comp) => {
        const regStart = new Date(comp.registrationStart);
        const regEnd = new Date(comp.registrationEnd);
        const announce = new Date(comp.announceTime);

        // compute dynamic status & deadline
        const { status, deadline } = getStatusAndDeadline(regStart, regEnd, announce);

        let endsIn = "N/A";
        if (deadline) {
          endsIn = formatCountdown(deadline);
        }

        // Now we see if status => "Live Now" => timeStatus => "Live Now"
        // if status => "Upcoming" => timeStatus => "Upcoming"
        // if status => "Ended" => timeStatus => "Past"
        // or you can keep the old logic: if status = "Ended" but it's still before announceTime => "● Live Now" or "Past"
        let timeStatus = status; // "Upcoming", "Live Now", "Ended", "Past"
        // If you want to match EXACT tabs: "● Live Now", "Upcoming", "Past"
        if (timeStatus === "Ended") {
          // let's treat it as "Past"
          timeStatus = "Past";
        }

        return {
          ...comp,
          timeStatus,
          endsIn,
        };
      });
      setDisplayComps(mapped);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [competitions]);

  // Submit referral code...
  const handleReferralSubmit = async (code: string) => {
    setErrorMessage("");
    try {
      if (code) {
        console.log("User's referral code:", code);
        const token = await getAccessToken();
        if (!token) {
          throw new Error("No access token; user is not authenticated.");
        }
        const response = await fetch("https://dev-api.finfun.xyz/api/referral", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ code }),
        });

        if (!response.ok) {
          const serverError = await response.json();
          throw new Error(serverError.error);
        }
        const data = await response.json();
        console.log("Referral success:", data);
      } else {
        console.log("No referral code provided.");
      }
    } catch (error: any) {
      console.error("Error submitting referral:", error);
      setErrorMessage(error.message || "Unknown error occurred");
      return; 
    }

    setIsReferralModalOpen(false);
    const timesShownStr = localStorage.getItem("referralModalShown") || "0";
    const timesShown = parseInt(timesShownStr, 10) || 0;
    localStorage.setItem("referralModalShown", (timesShown + 1).toString());
  };

  // Filter by activeSquareTab & activeTimeTab
  const filteredCompetitions = displayComps.filter((c) => {
    // "All" => skip type check
    if (activeSquareTab !== "All" && c.type !== activeSquareTab) {
      return false;
    }
    // // match c.timeStatus with activeTimeTab => "Live Now"/"Upcoming"/"Past"
    if (c.timeStatus !== activeTimeTab && activeTimeTab !== "Live Now") {
      return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col min-h-screen">
      {isReferralModalOpen && (
        <ReferralModal
          onClose={() => handleReferralSubmit("")}
          onSubmitCode={handleReferralSubmit}
          errorMessage={errorMessage}
        />
      )}

      <TopNavBar points={150} onCreateClick={() => alert("Create clicked!")} />

      <SquareTabs
        tabs={["All", "Callers", "Prediction", "Trading"]}
        activeTab={activeSquareTab}
        onTabChange={setActiveSquareTab}
      />

      <Tabs
        tabs={["● Live Now", "Upcoming", "Past"]}
        activeTab={activeTimeTab}
        onTabChange={setActiveTimeTab}
        tabStyle="mt-6"
      />

      <div className="p-4">
        {filteredCompetitions.length > 0 ? (
          filteredCompetitions.map((comp) => (
            <CompetitionCard
              key={comp._id}
              anu={comp._id}
              title={comp.name}
              participants={comp.submissions?.length || 0}
              prizePool={comp.prizePool}
              endsIn={comp.endsIn}  // dynamic countdown
              organizerLogo={comp.organizerLogo}
              organizerName={comp.organizerName}
              timeStatus={comp.timeStatus} 
              isHome={true}
              onJoin={() => alert(`Joined ${comp.name}`)}
            />
          ))
        ) : (
          <p className="text-center text-gray-600 mt-4">
            No competitions found.
          </p>
        )}
      </div>

      <NewNavbar />
    </div>
  );
};

export default HomePage;
