import Sidebar from "../components/sidebar";
import Navbar from "../components/navbar";
import { ReactNode } from "react";

interface LayoutProps {
  children?: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 sm:ml-64 mt-16">
          <div className="p-4 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
