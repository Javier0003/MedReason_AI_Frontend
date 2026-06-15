import { authenticationStore } from "../store/authentication-store";
import { Sidebar, type Role } from "./sidebar";
import UserLogo from "./user-logo";

export default function MainPanel({ children, sidebarRole, userName, userProfession }: { children: React.ReactNode, sidebarRole?: Role, userName?: string, userProfession?: string }) {
  const { user } = authenticationStore(state => state);
  return (
    <div className="flex min-h-screen bg-[#f3f4f7]">
      <Sidebar role={user?.role ?? "DOCTOR"} />
      <main className="ml-[200px] flex-1 space-y-5 max-h-[calc(100vh-64px)] overflow-hidden">
        <header className="flex justify-between p-5 border-b border-gray-300">
          <h1 className="text-2xl font-bold">{"MediFlow Clinical"}</h1>

          <UserLogo name={user?.name ?? "User"} profession={user?.profession ?? "Profession"} />
        </header>

        {children}
      </main>
    </div>
  )
}