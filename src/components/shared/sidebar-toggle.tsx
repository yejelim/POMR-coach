"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

export function SidebarToggle() {
  function toggleSidebar() {
    const root = document.documentElement;
    const next = root.dataset.sidebar === "collapsed" ? "expanded" : "collapsed";
    root.dataset.sidebar = next;
    window.localStorage.setItem("pomr-coach-sidebar", next);
  }

  return (
    <button
      type="button"
      onClick={toggleSidebar}
      className="sidebar-toggle flex h-8 w-8 items-center justify-center rounded-md text-app-text-muted transition hover:bg-app-surface-soft hover:text-app-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-primary/25"
      aria-label="사이드바 접기 또는 펼치기"
      title="사이드바 접기/펼치기"
    >
      <PanelLeftClose className="sidebar-expanded-icon h-4 w-4" />
      <PanelLeftOpen className="sidebar-collapsed-icon hidden h-4 w-4" />
    </button>
  );
}
