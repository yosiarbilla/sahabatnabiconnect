import { Link, useLocation } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { BellIcon, LogOutIcon, ShipWheelIcon } from "lucide-react";
import ThemeSelector from "./ThemeSelector";
import useLogout from "../hooks/useLogout";

const Navbar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const isChatPage = location.pathname?.startsWith("/chat");

  const { logoutMutation } = useLogout();

  return (
    <nav className="bg-base-100 border-b border-base-300 sticky top-0 z-30 h-16 flex items-center flex-shrink-0 w-full">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between w-full h-full">
          {/* LOGO - ONLY IN THE CHAT PAGE */}
          {isChatPage && (
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center gap-2">
                <ShipWheelIcon className="size-7 text-primary" />
                <span className="text-lg sm:text-xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wide whitespace-nowrap">
                  Sahabat Nabi Connect
                </span>
              </Link>
            </div>
          )}

          <div className="flex items-center gap-2 sm:gap-3 ml-auto">
            <Link to={"/notifications"}>
              <button className="btn btn-ghost btn-circle btn-sm sm:btn-md">
                <BellIcon className="h-5 w-5 sm:h-6 sm:w-6 text-base-content opacity-70" />
              </button>
            </Link>

            <ThemeSelector />

            <div className="avatar">
              <div className="w-8 sm:w-9 rounded-full">
                <img src={authUser?.profilePic} alt="User Avatar" rel="noreferrer" />
              </div>
            </div>

            {/* Logout button */}
            <button className="btn btn-ghost btn-circle btn-sm sm:btn-md" onClick={logoutMutation}>
              <LogOutIcon className="h-5 w-5 sm:h-6 sm:w-6 text-base-content opacity-70" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
