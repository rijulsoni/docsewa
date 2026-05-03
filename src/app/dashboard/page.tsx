import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Navbar from "@/components/pages/Navbar";
import Footer from "@/components/pages/Footer";
import {
  History as HistoryIcon,
  Zap,
  Clock,
  FileText,
  ExternalLink,
  Crown,
  TrendingUp
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Fetch user data
  const user = await db.user.findUnique({
    where: { clerkId: userId },
    include: {
      usages: {
        where: {
          date: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      },
      history: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  // Fallback if webhook hasn't created the user yet
  if (!user) {
    return (
      <div className="min-h-screen bg-[#050506] flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center p-4 text-center">
          <div className="max-w-md">
            <h1 className="text-2xl font-bold text-white mb-4">Setting up your dashboard...</h1>
            <p className="text-white/40 mb-8">We&apos;re finalizing your account details. Please refresh in a few seconds.</p>
            <Zap className="h-8 w-8 text-indigo-500 animate-pulse mx-auto" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050506] flex flex-col">
      <Navbar />

      <main className="flex-grow py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl font-extrabold text-white mb-2">Welcome back!</h1>
            <p className="text-white/40">Manage your subscription and view your recent activity.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Stats & Status */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Subscription Status Card */}
              <div className="glass-card rounded-3xl p-6 border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-transparent">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                    <Crown className="h-5 w-5 text-indigo-400" />
                  </div>
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest",
                    user.status === "FREE" ? "bg-white/10 text-white/50" : "bg-indigo-500/20 text-indigo-400"
                  )}>
                    {user.status}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-1">Current Plan</h3>
                <p className="text-xl font-bold text-white mb-6">DocSewa {user.status === "FREE" ? "Free" : "Pro"}</p>
                
                {user.status === "FREE" ? (
                  <button className="w-full py-3 rounded-xl bg-white text-black font-bold text-sm hover:bg-white/90 transition-all">
                    Upgrade to Pro
                  </button>
                ) : (
                  <button className="w-full py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white font-semibold text-sm hover:bg-white/[0.08] transition-all">
                    Manage Subscription
                  </button>
                )}
              </div>

              {/* Daily Usage Card */}
              <div className="glass-card rounded-3xl p-6 border border-white/[0.08]">
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white/80">Daily Usage</h3>
                </div>
                
                <div className="space-y-4">
                  {user.usages.length > 0 ? (
                    user.usages.map((u) => (
                      <div key={u.id} className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-white/50">{u.type.replace('_', ' ')}</span>
                          <span className="text-white/80 font-medium">{u.count} used</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-indigo-500 rounded-full" 
                            style={{ width: `${Math.min((u.count / 3) * 100, 100)}%` }} // Adjust based on dynamic limits
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-white/30 text-center py-4 italic">No tools used today yet.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: History */}
            <div className="lg:col-span-2">
              <div className="glass-card rounded-3xl border border-white/[0.08] overflow-hidden">
                <div className="p-6 border-b border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <HistoryIcon className="h-5 w-5 text-indigo-400" />
                    <h2 className="text-lg font-bold text-white">Recent Activity</h2>
                  </div>
                  <span className="text-xs text-white/30">Last 10 files</span>
                </div>

                <div className="overflow-x-auto">
                  {user.history.length > 0 ? (
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-white/[0.02] text-[10px] font-bold uppercase tracking-widest text-white/20">
                          <th className="px-6 py-4">File Name</th>
                          <th className="px-6 py-4">Tool</th>
                          <th className="px-6 py-4">Date</th>
                          <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04]">
                        {user.history.map((item) => (
                          <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <FileText className="h-4 w-4 text-white/20" />
                                <span className="text-sm font-medium text-white/70 truncate max-w-[180px]">
                                  {item.fileName}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-xs text-white/40">{item.toolUsed}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-xs text-white/30">{format(item.createdAt, "MMM d, HH:mm")}</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              {item.fileUrl ? (
                                <a 
                                  href={item.fileUrl} 
                                  className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                                >
                                  Download <ExternalLink className="h-3 w-3" />
                                </a>
                              ) : (
                                <span className="text-[10px] text-white/10 uppercase font-bold italic">Expired</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="py-20 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
                        <Clock className="h-6 w-6 text-white/10" />
                      </div>
                      <p className="text-sm text-white/30">No history found.</p>
                      <p className="text-xs text-white/15">Files processed in standard tools stay local and aren&apos;t listed here.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
