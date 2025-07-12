'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeOff, Lock, User, Shield } from 'lucide-react'

export default function AuthForm({ onLogin }) {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('authToken', data.token)
        localStorage.setItem('userRole', data.role)
        localStorage.setItem('userName', data.name)
        onLogin(data)
      } else {
        setError(data.error || 'چەوتی لە چوونەژوورەوە')
      }
    } catch (error) {
      setError('هەڵەیەکی تەکنیکی ڕوویدا')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = (role) => {
    const demoUser = {
      admin: { username: 'admin', password: 'admin123', name: 'بەڕێوەبەر', role: 'admin' },
      user: { username: 'user', password: 'user123', name: 'بەکارهێنەر', role: 'user' }
    }
    
    setFormData(demoUser[role])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center bg-red-500 text-white rounded-t-lg">
          <div className="flex justify-center mb-4">
            <Shield className="w-16 h-16" />
          </div>
          <CardTitle className="text-2xl font-bold">
            چوونەژوورەوە
          </CardTitle>
          <p className="text-red-100 mt-2">
            سیستەمی بەڕێوەبردنی خشتەکان
          </p>
        </CardHeader>
        <CardContent className="p-6">
          {error && (
            <Alert className="mb-4 border-red-200 bg-red-50">
              <AlertDescription className="text-red-700 text-right">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-right mb-2">
                ناوی بەکارهێنەر
              </label>
              <div className="relative">
                <Input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="text-right pr-10"
                  placeholder="ناوی بەکارهێنەر..."
                  required
                />
                <User className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-right mb-2">
                ووشەی نهێنی
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="text-right pr-10 pl-10"
                  placeholder="ووشەی نهێنی..."
                  required
                />
                <Lock className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-red-500 hover:bg-red-600 text-white"
              disabled={loading}
            >
              {loading ? 'چاوەڕوان بە...' : 'چوونەژوورەوە'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600 mb-3">
              تاقیکردنەوەی خێرا:
            </p>
            <div className="space-y-2">
              <Button
                variant="outline"
                onClick={() => handleDemoLogin('admin')}
                className="w-full text-right"
              >
                <Shield className="w-4 h-4 ml-2" />
                بەڕێوەبەر (admin/admin123)
              </Button>
              <Button
                variant="outline"
                onClick={() => handleDemoLogin('user')}
                className="w-full text-right"
              >
                <User className="w-4 h-4 ml-2" />
                بەکارهێنەر (user/user123)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}