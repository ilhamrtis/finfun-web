import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { usePrivy, getAccessToken } from "@privy-io/react-auth";
import NewNavbar from "../../components/NewNavbar";

export default function NotificationSettings() {
  const { ready, authenticated, logout } = usePrivy();
  const router = useRouter();

  // We'll track the push notifications setting in state
  const [pushEnabled, setPushEnabled] = useState(false);

  useEffect(() => {
    // If user is not authenticated, redirect to login
    if (ready && !authenticated) {
      logout();
      router.push("/");
    }
  }, [ready, authenticated, router, logout]);

  // Optional: fetch user’s current notification setting from your backend
  useEffect(() => {
    async function fetchSettings() {
      try {
        const token = await getAccessToken();
        if (!token) return;
        const res = await fetch("/api/user/settings", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          // e.g. data might be { pushEnabled: true }
          if (typeof data.pushEnabled === "boolean") {
            setPushEnabled(data.pushEnabled);
          }
        }
      } catch (error) {
        console.error("Failed to fetch notification settings", error);
      }
    }
    if (ready && authenticated) {
      fetchSettings();
    }
  }, [ready, authenticated]);

  // Handler: Toggle push notifications
  async function handleToggle() {
    const newValue = !pushEnabled;
    setPushEnabled(newValue);

    // Optional: Persist on the server
    try {
      const token = await getAccessToken();
      if (!token) return;
      const res = await fetch("/api/user/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ pushEnabled: newValue }),
      });
      if (!res.ok) {
        console.error("Failed to update notification settings");
      }
    } catch (error) {
      console.error("Error updating push settings:", error);
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Title */}
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white ">
        <button onClick={() => router.back()} className="text-xl text-gray-700">
            <img src="/images/icons/left.svg" alt="Arrow left" className="w-4 h-4" />
        </button>
        <h1 className="text-xl font-semibold">Notification Settings</h1>
        <div></div>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col space-y-4">
        <div className="flex items-center justify-between bg-white p-4 rounded-md shadow-sm">
          <span className="text-md font-medium text-gray-700">Push Notifications</span>
          <label className="flex items-center cursor-pointer">
            {/* Simple toggle using a checkbox + label styling */}
            <input
              type="checkbox"
              checked={pushEnabled}
              onChange={handleToggle}
              className="hidden"
            />
            <div
              className={`w-11 h-6 rounded-full flex items-center p-1 ${
                pushEnabled ? "bg-indigo-500" : "bg-gray-300"
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow transform transition-transform ${
                  pushEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </div>
          </label>
        </div>
      </div>

      <NewNavbar />
    </div>
  );
}
