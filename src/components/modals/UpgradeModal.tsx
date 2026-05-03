"use client"
import React from 'react';
import { usePathname } from 'next/navigation';
import { Check, Rocket, Zap, Shield, Sparkles } from 'lucide-react';
import { useUpgradeModal } from '@/hooks/use-upgrade-modal';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

const FEATURES = [
  { icon: <Zap className="h-4 w-4 text-amber-400" />, label: "Files up to 200MB", desc: "Process larger documents easily" },
  { icon: <Sparkles className="h-4 w-4 text-purple-400" />, label: "Unlimited AI Chat", desc: "Chat with PDFs without limits" },
  { icon: <Shield className="h-4 w-4 text-emerald-400" />, label: "Batch Processing", desc: "Convert up to 100 files at once" },
  { icon: <Rocket className="h-4 w-4 text-blue-400" />, label: "No Ads", desc: "Clean, distraction-free interface" },
];

const UpgradeModalContent = () => {
  const { onClose } = useUpgradeModal();
  const pathname = usePathname();

  const handleViewPricing = () => {
    if (pathname === '/pricing') {
      onClose();
      return;
    }

    window.location.href = '/pricing';
  };

  return (
    <div className="p-1">
      <div className="relative mb-3 sm:mb-6 rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-transparent border border-white/10 p-4 sm:p-6 text-center">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Rocket className="h-16 w-16 sm:h-24 sm:w-24 -rotate-12" />
        </div>
        <div className="relative z-10">
          <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-indigo-500/20 border border-indigo-500/40 mb-3 sm:mb-4">
            <Rocket className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-400" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Upgrade to Pro</h2>
          <p className="text-white/50 text-xs sm:text-sm max-w-[280px] mx-auto">
            Unlock the full power of DocSewa and boost your productivity.
          </p>
        </div>
      </div>

      <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-8 px-1 sm:px-2">
        {FEATURES.map((feature, i) => (
          <div key={i} className="flex items-start gap-3 p-2.5 sm:p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] transition-all hover:bg-white/[0.05]">
            <div className="mt-0.5">{feature.icon}</div>
            <div>
              <p className="text-sm font-semibold text-white/80">{feature.label}</p>
              <p className="text-xs text-white/35 leading-tight">{feature.desc}</p>
            </div>
            <Check className="ml-auto h-4 w-4 text-white/20" />
          </div>
        ))}
      </div>

      <div className="sticky bottom-0 -mx-1 flex flex-col gap-2 border-t border-white/[0.06] bg-[#0f0f14]/95 px-1 pt-3 pb-1 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-2 sm:pt-0 sm:pb-2 sm:backdrop-blur-none">
        <Button 
          className="w-full h-11 sm:h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm sm:text-base shadow-[0_8px_24px_rgba(99,102,241,0.3)] border-0"
          onClick={handleViewPricing}
        >
          {pathname === '/pricing' ? 'Back to Pricing' : 'View Pricing Plans'}
        </Button>
        <Button 
          variant="ghost" 
          className="w-full text-white/40 hover:text-white/60 hover:bg-white/5"
          onClick={onClose}
        >
          Maybe later
        </Button>
      </div>
    </div>
  );
};

export const UpgradeModal = () => {
  const { isOpen, onClose } = useUpgradeModal();
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent className="bg-[#0f0f14] border-white/10 text-white max-h-[88svh] overflow-hidden rounded-t-3xl">
          <VisuallyHidden>
            <DrawerTitle>Upgrade to Pro</DrawerTitle>
            <DrawerDescription>Unlock premium features</DrawerDescription>
          </VisuallyHidden>
          <div className="max-h-[calc(88svh-1.5rem)] overflow-y-auto px-4 pb-4 pt-1">
             <UpgradeModalContent />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#0f0f14] border-white/10 text-white max-w-md p-6 overflow-hidden">
        <VisuallyHidden>
          <DialogTitle>Upgrade to Pro</DialogTitle>
          <DialogDescription>Unlock premium features</DialogDescription>
        </VisuallyHidden>
        <UpgradeModalContent />
      </DialogContent>
    </Dialog>
  );
};
