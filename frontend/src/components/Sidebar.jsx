import { Link, useLocation } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { BellIcon, HomeIcon, ShipWheelIcon, UsersIcon, MenuIcon, XIcon, MessageCircleIcon } from "lucide-react";
import { useState } from "react";
import ThemeSelector from "./ThemeSelector";

const Sidebar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const currentPath = location.pathname;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Header with Hamburger */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-base-100 border-b border-base-300 shadow-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <ShipWheelIcon className="size-7 text-primary" />
            <span className="text-lg font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              SNC
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <ThemeSelector />
            <button
              onClick={toggleMobileMenu}
              className="btn btn-ghost btn-circle"
            >
              {isMobileMenuOpen ? (
                <XIcon className="size-5" />
              ) : (
                <MenuIcon className="size-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar - Slides from Top */}
      <div className={`lg:hidden fixed top-16 left-0 right-0 z-40 transition-all duration-300 ease-in-out ${
        isMobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}>
        <div className="bg-base-100 border-b border-base-300 shadow-lg">
          {/* Mobile Navigation */}
          <nav className="p-4 space-y-2">
            <Link
              to="/"
              onClick={closeMobileMenu}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentPath === "/" 
                  ? "bg-primary text-primary-content" 
                  : "hover:bg-base-200"
              }`}
            >
              <HomeIcon className="size-5" />
              <span className="font-medium">Home</span>
            </Link>

            <Link
              to="/friends"
              onClick={closeMobileMenu}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentPath === "/friends" 
                  ? "bg-primary text-primary-content" 
                  : "hover:bg-base-200"
              }`}
            >
              <UsersIcon className="size-5" />
              <span className="font-medium">Friends</span>
            </Link>

            <Link
              to="/groups"
              onClick={closeMobileMenu}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentPath === "/groups" 
                  ? "bg-primary text-primary-content" 
                  : "hover:bg-base-200"
              }`}
            >
              <MessageCircleIcon className="size-5" />
              <span className="font-medium">Groups</span>
            </Link>

            <Link
              to="/notifications"
              onClick={closeMobileMenu}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentPath === "/notifications" 
                  ? "bg-primary text-primary-content" 
                  : "hover:bg-base-200"
              }`}
            >
              <BellIcon className="size-5" />
              <span className="font-medium">Notifications</span>
            </Link>
          </nav>

          {/* Mobile User Profile */}
          <div className="p-4 border-t border-base-300 bg-base-200/30">
            <div className="flex items-center gap-3">
              <div className="avatar">
                <div className="w-10 rounded-full">
                  <img src={authUser?.profilePic} alt="User Avatar" />
                </div>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">{authUser?.fullName}</p>
                <p className="text-xs text-success flex items-center gap-1">
                  <span className="size-2 rounded-full bg-success inline-block animate-pulse" />
                  Online
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-30 z-30 transition-opacity duration-300"
          onClick={closeMobileMenu}
          style={{ top: '100vh' }} // Start below the dropdown
        />
      )}

      {/* Desktop Sidebar */}
      <aside className="w-64 bg-base-200 border-r border-base-300 hidden lg:flex flex-col h-screen sticky top-0">
        <div className="p-5 border-b border-base-300">
          <Link to="/" className="flex items-center gap-2.5">
            <ShipWheelIcon className="size-9 text-primary" />
            <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary  tracking-wider">
              SNC
            </span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <Link
            to="/"
            className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
              currentPath === "/" ? "btn-active" : ""
            }`}
          >
            <HomeIcon className="size-5 text-base-content opacity-70" />
            <span>Home</span>
          </Link>

          <Link
            to="/friends"
            className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
              currentPath === "/friends" ? "btn-active" : ""
            }`}
          >
            <UsersIcon className="size-5 text-base-content opacity-70" />
            <span>Friends</span>
          </Link>

          <Link
            to="/groups"
            className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
              currentPath === "/groups" ? "btn-active" : ""
            }`}
          >
            <MessageCircleIcon className="size-5 text-base-content opacity-70" />
            <span>Groups</span>
          </Link>

          <Link
            to="/notifications"
            className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
              currentPath === "/notifications" ? "btn-active" : ""
            }`}
          >
            <BellIcon className="size-5 text-base-content opacity-70" />
            <span>Notifications</span>
          </Link>
        </nav>

        {/* USER PROFILE SECTION */}
        <div className="p-4 border-t border-base-300 mt-auto">
          <div className="flex items-center gap-3">
            <div className="avatar">
              <div className="w-10 rounded-full">
                <img src={authUser?.profilePic} alt="User Avatar" />
              </div>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">{authUser?.fullName}</p>
              <p className="text-xs text-success flex items-center gap-1">
                <span className="size-2 rounded-full bg-success inline-block" />
                Online
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Content Spacer */}
      <div className="lg:hidden h-16"></div>
    </>
  );
};
export default Sidebar;
