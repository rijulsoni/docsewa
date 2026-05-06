"use client"

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useRecentTools } from '@/hooks/use-recent-tools';
import { TOOL_BY_HREF } from '@/lib/tools-data';

export default function TrackToolVisit() {
  const pathname = usePathname();
  const { addRecent } = useRecentTools();

  useEffect(() => {
    if (!pathname) return;
    const tool = TOOL_BY_HREF[pathname];
    if (tool) addRecent(tool.slug);
  }, [pathname, addRecent]);

  return null;
}
