import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { usePrivy } from "@privy-io/react-auth";
import NewNavBar from "../components/NewNavbar";

const settingsOptions = [
  { id: 1, title: "Notification", icon: "/images/icons/notification.svg", route: "/settings/notification" },
  { id: 2, title: "Export Keys", icon: "/images/icons/lock.svg", route: "/settings/export" },
  { id: 3, title: "Rate Finfun", icon: "/images/icons/star.svg", route: "#" },
  { id: 4, title: "Support Center", icon: "/images/icons/info.svg", route: "/settings/support" },
  { id: 5, title: "Legal & Privacy", icon: "/images/icons/legal.svg", route: "/settings/legal" },
  { id: 6, title: "Input Your Referral", icon: "/images/icons/referral.svg", route: "/settings/referral" },
];

const SettingsPage: React.FC = () => {
  const router = useRouter();
  const {
    ready,
      authenticated,
    logout
  } = usePrivy();
  
    useEffect(() => {
      if (ready && !authenticated) {
        logout();
        router.push("/");
      }
    }, [ready, authenticated, router, logout]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white ">
        <button onClick={() => router.back()} className="text-xl text-gray-700">
            <img src="/images/icons/left.svg" alt="Arrow left" className="w-4 h-4" />
        </button>
        <h1 className="text-xl font-semibold">Settings</h1>
        <div></div>
      </div>

      {/* Settings List */}
      <div className="p-4">
        {settingsOptions.map((option) => (
          <div
            key={option.id}
            onClick={() => router.push(option.route)}
            className="flex items-center justify-between p-4 bg-white mb-0 cursor-pointer border-2 border-white hover:border-2 hover:border-gray-200 hover:transition"
          >
            <div className="flex items-center space-x-4">
              <img src={option.icon} alt={option.title} className="w-6 h-6" />
              <p className="text-sm font-medium text-gray-800">{option.title}</p>
            </div>
            <img src="/images/icons/right.svg" alt="Arrow Right" className="w-4 h-4" />
          </div>
        ))}
        <div
            onClick={logout}
            className="flex items-center justify-between p-4 bg-white mb-0 cursor-pointer border-2 border-white hover:border-2 hover:border-gray-200 hover:transition"
            >
        <div className="flex items-center space-x-4">
            <img src="/images/icons/signout.svg" alt="Sign Out" className="w-6 h-6" />
            <p className="text-sm font-medium text-gray-800">Sign Out</p>
        </div>
        <img src="/images/icons/right.svg" alt="Arrow Right" className="w-4 h-4" />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto flex justify-center items-center flex-col p-4 mb-14">
        <div className="flex space-x-4 mb-2">
          <img src="/images/icons/instagram.svg" onClick={()=> window.open("https://x.com/finfunxyz", "_blank")} alt="Instagram" className="w-5 h-5 cursor-pointer" />
          <img src="/images/icons/x.svg" onClick={()=> window.open("https://x.com/finfunxyz", "_blank")}  alt="Twitter" className="w-5 h-5 cursor-pointer" />
          <img src="/images/icons/web.svg"onClick={()=> window.open("https://finfun.xyz", "_blank")}   alt="Website" className="w-5 h-5 cursor-pointer" />
        </div>
        <p className="text-xs text-gray-500">Copyrights. All Rights Reserved. 2025.</p>
      </div>
      <NewNavBar />
    </div>
  );
};

export default SettingsPage;
