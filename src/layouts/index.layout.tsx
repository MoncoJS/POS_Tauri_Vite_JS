import Sidebar from "../components/sidebar";
import { ReactNode } from "react";
import Carts from "../pages/Cart.pages";
interface LayoutProps {
  children?: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div>
      <Sidebar />
      <div className="p-4 sm:ml-64">
        <div className="p-4 dark:border-gray-700">{children}</div>
      </div>
    </div>
  );
};

export default Layout;
