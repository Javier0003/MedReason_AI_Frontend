import { authenticationStore } from "../store/authentication-store";
import { Sidebar } from "./sidebar";
import UserLogo from "./user-logo";

export default function MainPanel({ children }: { children: React.ReactNode }) {
  const user = authenticationStore(state => state.user);

  return (
    <div className="flex min-h-screen bg-[#f3f4f7]">
      <Sidebar />
      <main className="ml-50 flex-1 space-y-5 max-h-[calc(100vh-64px)] overflow-hidden">
        <header className="flex justify-between p-5 border-b border-gray-300">
          <h1 className="text-2xl font-bold">{"MediFlow Clinical"}</h1>

          <UserLogo name={user?.name ?? "User"} profession={user?.profession ?? "Profession"} />
        </header>

        {children}
      </main>
    </div>
  )
}