import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const Layout = ({ children, showSidebar = false }) => {
  return (
    <div className="h-screen w-full overflow-hidden">
      <div className="flex h-full w-full">
        {showSidebar && <Sidebar />}

        <div className="flex-1 flex flex-col h-full w-full overflow-hidden">
          <Navbar />

          <main className="flex-1 w-full overflow-y-auto overflow-x-hidden">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};
export default Layout;
