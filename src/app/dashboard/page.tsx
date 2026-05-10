import { requireUser } from "@/lib/require-user";
import { ChatWorkspace } from "@/components/chat-workspace";
import { NetworkBackground } from "@/components/network-background";

type Props = { searchParams: Promise<{ peer?: string }> };

export default async function DashboardPage({ searchParams }: Props) {
  const user = await requireUser();
  const params = await searchParams;

  return (
    <main className="relative min-h-screen bg-[#010b24] text-slate-100">
      <NetworkBackground />
      <div className="relative z-10">
        <ChatWorkspace currentUserId={user.id} initialPeerId={params.peer} />
      </div>
    </main>
  );
}
