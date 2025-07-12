'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LogOut, Shield, User } from 'lucide-react'

export default function UserInfo({ user, onLogout }) {
  const isAdmin = user?.role === 'admin'

  return (
    <div className="flex items-center gap-4 print:hidden">
      <div className="flex items-center gap-2">
        <div className="text-right">
          <div className="font-medium text-gray-800">{user?.name}</div>
          <div className="text-sm text-gray-500">
            {isAdmin ? 'بەڕێوەبەر' : 'بەکارهێنەر'}
          </div>
        </div>
        <Badge variant={isAdmin ? "default" : "secondary"} className="flex items-center gap-1">
          {isAdmin ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
          {isAdmin ? 'Admin' : 'User'}
        </Badge>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onLogout}
        className="flex items-center gap-2 text-red-600 hover:bg-red-50 hover:text-red-700"
      >
        <LogOut className="w-4 h-4" />
        دەرچوون
      </Button>
    </div>
  )
}