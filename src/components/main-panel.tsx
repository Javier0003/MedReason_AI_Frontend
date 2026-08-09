import { authenticationStore } from "../store/authentication-store";
import { Sidebar } from "./sidebar";
import UserLogo from "./user-logo";

export default function MainPanel({ children, headerContent }: { children: React.ReactNode, headerContent?: React.ReactNode }) {
  const user = authenticationStore((state) => state.user);

  return (
    <div className="flex h-screen overflow-hidden bg-[#f3f4f7]">
      <Sidebar />

      <main className="ml-50 flex flex-1 flex-col overflow-hidden">
        <header className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
          <div className="flex-1 flex items-center justify-between pr-6">
            {headerContent ? (
              headerContent
            ) : (
              <h1 className="text-2xl font-bold text-slate-800">MedReason AI</h1>
            )}
          </div>

          <UserLogo
            name={user?.nombre ?? "User"}
            profession={user?.rol ?? "Profession"}
          />
        </header>

        <div className="flex-1 overflow-y-auto bg-[#FAFAFA]">
          {children}
        </div>
      </main>
    </div>
  );
}