'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Trash2, Edit, Plus, Search, Download, Printer } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function TableManager() {
  const [tables, setTables] = useState([])
  const [metadata, setMetadata] = useState({})
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTable, setSelectedTable] = useState(null)
  const [editingRow, setEditingRow] = useState(null)
  const [newRowData, setNewRowData] = useState({ name: '', rank: '' })

  useEffect(() => {
    fetchTables()
  }, [])

  const fetchTables = async () => {
    try {
      const response = await fetch('/api/tables')
      const data = await response.json()
      setTables(data.tables || [])
      setMetadata(data.metadata || {})
      setLoading(false)
    } catch (error) {
      console.error('Error fetching tables:', error)
      setLoading(false)
    }
  }

  const updateTable = async (tableName, newData) => {
    try {
      const response = await fetch('/api/tables', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableName, data: newData })
      })
      if (response.ok) {
        fetchTables()
      }
    } catch (error) {
      console.error('Error updating table:', error)
    }
  }

  const addRow = async (tableName) => {
    if (!newRowData.name || !newRowData.rank) return
    
    const table = tables.find(t => t.name === tableName)
    const updatedData = [...table.data, [newRowData.name, newRowData.rank]]
    
    await updateTable(tableName, updatedData)
    setNewRowData({ name: '', rank: '' })
    setSelectedTable(null)
  }

  const deleteRow = async (tableName, rowIndex) => {
    const table = tables.find(t => t.name === tableName)
    const updatedData = table.data.filter((_, index) => index !== rowIndex)
    await updateTable(tableName, updatedData)
  }

  const updateRow = async (tableName, rowIndex, newData) => {
    const table = tables.find(t => t.name === tableName)
    const updatedData = [...table.data]
    updatedData[rowIndex] = [newData.name, newData.rank]
    await updateTable(tableName, updatedData)
    setEditingRow(null)
  }

  const filteredTables = tables.map(table => ({
    ...table,
    data: table.data.filter(row => 
      row[0].toLowerCase().includes(searchTerm.toLowerCase()) ||
      row[1].toLowerCase().includes(searchTerm.toLowerCase())
    )
  }))

  const handlePrint = () => {
    window.print()
  }

  const exportData = () => {
    const csvContent = tables.map(table => {
      const headers = table.columns.join(',')
      const rows = table.data.map(row => row.join(',')).join('\n')
      return `${table.name}\n${headers}\n${rows}\n`
    }).join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'tables_data.csv'
    link.click()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl font-semibold text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 print:bg-white print:p-0">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 print:mb-4">
          <h1 className="text-3xl font-bold text-red-600 mb-4 print:text-2xl">
            وەجهەی مەلازم/ پۆشندار
          </h1>
          
          {/* Controls - Hidden in print */}
          <div className="flex flex-wrap justify-center gap-4 mb-6 print:hidden">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-500" />
              <Input
                placeholder="گەڕان..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
            <Button onClick={handlePrint} variant="outline" className="flex items-center gap-2">
              <Printer className="w-4 h-4" />
              چاپ
            </Button>
            <Button onClick={exportData} variant="outline" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              ناردنی CSV
            </Button>
          </div>
        </div>

        {/* Tables Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 print:gap-4">
          {filteredTables.map((table, tableIndex) => (
            <Card key={tableIndex} className="shadow-lg print:shadow-none print:border-2">
              <CardHeader className="bg-red-500 text-white p-4 print:p-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-bold text-right">
                    {table.name}
                  </CardTitle>
                  <div className="flex gap-2 print:hidden">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-white hover:bg-red-400"
                          onClick={() => setSelectedTable(table.name)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle className="text-right">
                            زیادکردنی تۆمارێکی نوێ - {table.name}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-right mb-1">
                              ناو
                            </label>
                            <Input
                              value={newRowData.name}
                              onChange={(e) => setNewRowData({...newRowData, name: e.target.value})}
                              className="text-right"
                              placeholder="ناو..."
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-right mb-1">
                              ڕەتبە
                            </label>
                            <Input
                              value={newRowData.rank}
                              onChange={(e) => setNewRowData({...newRowData, rank: e.target.value})}
                              className="text-right"
                              placeholder="ڕەتبە..."
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => addRow(table.name)}
                              className="flex-1"
                              disabled={!newRowData.name || !newRowData.rank}
                            >
                              زیادکردن
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setSelectedTable(null)
                                setNewRowData({ name: '', rank: '' })
                              }}
                              className="flex-1"
                            >
                              پاشگەزبوونەوە
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-red-500 text-white">
                        {table.columns.map((column, colIndex) => (
                          <th key={colIndex} className="px-4 py-2 text-center font-semibold border-r border-red-400 last:border-r-0 print:px-2 print:py-1">
                            {column}
                          </th>
                        ))}
                        <th className="px-4 py-2 text-center font-semibold print:hidden">
                          کردارەکان
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {table.data.map((row, rowIndex) => (
                        <tr key={rowIndex} className={`${rowIndex % 2 === 0 ? 'bg-gray-100' : 'bg-white'} hover:bg-gray-50 print:hover:bg-inherit`}>
                          {editingRow === `${table.name}-${rowIndex}` ? (
                            <>
                              <td className="px-4 py-2 border-r border-gray-200 print:px-2 print:py-1">
                                <Input
                                  defaultValue={row[0]}
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      updateRow(table.name, rowIndex, {
                                        name: e.target.value,
                                        rank: document.querySelector(`input[data-row="${rowIndex}"][data-col="1"]`).value
                                      })
                                    }
                                  }}
                                  className="text-right text-sm"
                                />
                              </td>
                              <td className="px-4 py-2 border-r border-gray-200 print:px-2 print:py-1">
                                <Input
                                  defaultValue={row[1]}
                                  data-row={rowIndex}
                                  data-col="1"
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      updateRow(table.name, rowIndex, {
                                        name: document.querySelector(`input[data-row="${rowIndex}"][data-col="0"]`).value,
                                        rank: e.target.value
                                      })
                                    }
                                  }}
                                  className="text-center text-sm"
                                />
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-4 py-2 text-right border-r border-gray-200 print:px-2 print:py-1">
                                {row[0]}
                              </td>
                              <td className="px-4 py-2 text-center border-r border-gray-200 print:px-2 print:py-1">
                                <Badge variant="secondary" className="text-sm">
                                  {row[1]}
                                </Badge>
                              </td>
                            </>
                          )}
                          <td className="px-4 py-2 text-center print:hidden">
                            <div className="flex justify-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingRow(`${table.name}-${rowIndex}`)}
                                className="text-blue-600 hover:bg-blue-50"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteRow(table.name, rowIndex)}
                                className="text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Metadata */}
        <div className="mt-8 text-center text-red-600 print:mt-4">
          <div className="space-y-2">
            <div className="text-lg font-semibold">
              مامۆستا/ پۆشندار رزگار
            </div>
            <div className="text-lg font-semibold">
              تیم لیدەر / پیشەوا محەمەد
            </div>
            <div className="text-lg font-semibold">
              زەماری وەجهە/ ٣٠ = ٣ + ٢
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:bg-white {
            background-color: white !important;
          }
          .print\\:p-0 {
            padding: 0 !important;
          }
          .print\\:mb-4 {
            margin-bottom: 1rem !important;
          }
          .print\\:text-2xl {
            font-size: 1.5rem !important;
          }
          .print\\:gap-4 {
            gap: 1rem !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:border-2 {
            border-width: 2px !important;
          }
          .print\\:p-2 {
            padding: 0.5rem !important;
          }
          .print\\:px-2 {
            padding-left: 0.5rem !important;
            padding-right: 0.5rem !important;
          }
          .print\\:py-1 {
            padding-top: 0.25rem !important;
            padding-bottom: 0.25rem !important;
          }
          .print\\:hover\\:bg-inherit:hover {
            background-color: inherit !important;
          }
          .print\\:mt-4 {
            margin-top: 1rem !important;
          }
        }
      `}</style>
    </div>
  )
}