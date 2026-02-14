"use client"

import { Home, Search, X, MessageSquare } from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Plugins", href: "/plugins", icon: Search },
  { name: "Requests", href: "/requests", icon: MessageSquare },
]

interface SidebarProps {
  onClose?: () => void
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname()

  const handleLinkClick = () => {
    // 모바일에서 링크 클릭 시 사이드바 닫기
    // lg 브레이크포인트(1024px) 미만에서는 사이드바가 오버레이로 표시되므로 닫기
    if (onClose) {
      // 클라이언트 사이드에서만 실행
      if (typeof window !== 'undefined' && window.innerWidth < 1024) {
        onClose()
      }
    }
  }

  return (
    <aside className="w-64 h-full bg-dark-audio-surface border-r border-dark-audio-border flex flex-col shadow-lg lg:shadow-none">
      {/* Logo/Brand with Close Button (Mobile) */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-dark-audio-border">
        <h2 className="text-xl font-bold text-dark-audio-cyan">
          Plugin Archive
        </h2>
        {/* Mobile Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg text-dark-audio-text-muted hover:bg-dark-audio-surface-elevated hover:text-dark-audio-text transition-colors"
            aria-label="메뉴 닫기"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={handleLinkClick}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-dark-audio-surface-elevated text-dark-audio-cyan border border-dark-audio-border-light"
                  : "text-dark-audio-text-muted hover:bg-dark-audio-surface-elevated hover:text-dark-audio-text"
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-dark-audio-border text-xs text-dark-audio-text-dim">
        <p>Audio Plugin Archive</p>
        <p className="mt-1">v0.1.0</p>
      </div>
    </aside>
  )
}
