
import { Outlet } from "react-router-dom";
import Header from "../Header";

const DashboardLayout = () => {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
