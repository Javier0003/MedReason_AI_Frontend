import { authenticationStore } from "../store/authentication-store";
import { Sidebar } from "./sidebar";
import UserLogo from "./user-logo";

export default function MainPanel({ children }: { children: React.ReactNode }) {
  const user = authenticationStore((state) => state.user);

  return (
    <div className="flex h-screen overflow-hidden bg-[#f3f4f7]">
      <Sidebar />

      <main className="ml-50 flex flex-1 flex-col overflow-hidden">
        <header className="flex shrink-0 justify-between border-b border-gray-300 p-5">
          <h1 className="text-2xl font-bold">MedReason AI</h1>

          <UserLogo
            name={user?.name ?? "User"}
            profession={user?.profession ?? "Profession"}
          />
        </header>

        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>
      </main>
    </div>
  );
}