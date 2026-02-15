"use client"

import { useState, useCallback } from "react"
import { Sidebar } from "./Sidebar"
import { Header } from "./Header"

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // 사이드바 닫기 핸들러를 메모이제이션하여 불필요한 리렌더링 방지
  const handleCloseSidebar = useCallback(() => {
    setIsSidebarOpen(false)
  }, [])

  // 메뉴 토글 핸들러를 메모이제이션하여 불필요한 리렌더링 방지
  const handleToggleMenu = useCallback(() => {
    setIsSidebarOpen((prev) => !prev)
  }, [])

  return (
    <div className="flex h-screen overflow-hidden bg-dark-audio-bg">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={handleCloseSidebar}
        />
      )}

      {/* Left Sidebar - Navigation */}
      <div
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <Sidebar onClose={handleCloseSidebar} />
      </div>
      
      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden w-full lg:w-auto">
        {/* Top Header - Search & Actions */}
        <Header onMenuClick={handleToggleMenu} />
        
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}
