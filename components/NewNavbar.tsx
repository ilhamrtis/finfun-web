import React from "react";
import { useRouter } from "next/router";
import NavBarItem from "./NavBarItem";;

const NewNavBar: React.FC = () => {
  const router = useRouter();
  const currentPath = router.pathname;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-md border-t border-gray-200">
      <div className="flex justify-between items-center max-w-md mx-auto">
        <NavBarItem
          label="Home"
          iconUrl="/images/icons/home.svg"
          isActive={currentPath === "/home"}
          onClick={() => router.push("/home")}
        />
        <NavBarItem
          label="Activities"
          iconUrl="/images/icons/ticket.svg"
          isActive={currentPath === "/activities"}
          onClick={() => router.push("/activities")}
        />
        <NavBarItem
          label="Quest"
          iconUrl="/images/icons/target.svg"
          isActive={currentPath === "/quest"}
          onClick={() => router.push("/quest")}
        />
        <NavBarItem
          label="Account"
          iconUrl="/images/icons/user.svg"
          isActive={currentPath === "/account"}
          onClick={() => router.push("/account")}
        />
      </div>
    </nav>
  );
};

export default NewNavBar;
