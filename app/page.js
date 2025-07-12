'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Trash2, Edit, Plus, Search, Download, Printer, GripVertical, Users, Shield } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { 
  DndContext, 
  DragOverlay, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// Draggable Row Component
function DraggableRow({ id, children, isOverlay = false }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`${isDragging ? 'z-50 shadow-2xl' : ''} ${isOverlay ? 'bg-blue-50 border-2 border-blue-300' : ''} hover:bg-gray-50 print:hover:bg-inherit cursor-grab active:cursor-grabbing`}
      {...attributes}
    >
      <td className="px-2 py-2 print:hidden">
        <div {...listeners} className="flex items-center justify-center">
          <GripVertical className="w-4 h-4 text-gray-400 hover:text-gray-600" />
        </div>
      </td>
      {children}
    </tr>
  )
}

// Droppable Table Component
function DroppableTable({ table, onAddRow, onDeleteRow, onUpdateRow, editingRow, setEditingRow }) {
  const [newRowData, setNewRowData] = useState({ name: '', rank: '' })
  const [selectedTable, setSelectedTable] = useState(null)

  return (
    <Card className="shadow-lg print:shadow-none print:border-2 bg-white">
      <CardHeader className="bg-red-500 text-white p-4 print:p-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-bold text-right">
            {table.name}
          </CardTitle>
          <div className="flex gap-2 print:hidden">
            <Badge variant="secondary" className="text-xs bg-red-400 text-white">
              {table.data.length} تۆمار
            </Badge>
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
                      onClick={() => {
                        onAddRow(table.name, newRowData)
                        setNewRowData({ name: '', rank: '' })
                        setSelectedTable(null)
                      }}
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
                <th className="px-2 py-2 text-center font-semibold print:hidden w-12">
                  <GripVertical className="w-4 h-4 mx-auto" />
                </th>
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
              <SortableContext items={table.data.map((_, index) => `${table.name}-${index}`)} strategy={verticalListSortingStrategy}>
                {table.data.map((row, rowIndex) => (
                  <DraggableRow key={`${table.name}-${rowIndex}`} id={`${table.name}-${rowIndex}`}>
                    {editingRow === `${table.name}-${rowIndex}` ? (
                      <>
                        <td className="px-4 py-2 border-r border-gray-200 print:px-2 print:py-1">
                          <Input
                            defaultValue={row[0]}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                onUpdateRow(table.name, rowIndex, {
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
                                onUpdateRow(table.name, rowIndex, {
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
                        <td className={`px-4 py-2 text-right border-r border-gray-200 print:px-2 print:py-1 ${rowIndex % 2 === 0 ? 'bg-gray-100' : 'bg-white'}`}>
                          {row[0]}
                        </td>
                        <td className={`px-4 py-2 text-center border-r border-gray-200 print:px-2 print:py-1 ${rowIndex % 2 === 0 ? 'bg-gray-100' : 'bg-white'}`}>
                          <Badge variant="secondary" className="text-sm">
                            {row[1]}
                          </Badge>
                        </td>
                      </>
                    )}
                    <td className={`px-4 py-2 text-center print:hidden ${rowIndex % 2 === 0 ? 'bg-gray-100' : 'bg-white'}`}>
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
                          onClick={() => onDeleteRow(table.name, rowIndex)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </DraggableRow>
                ))}
              </SortableContext>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

export default function TableManager() {
  const [tables, setTables] = useState([])
  const [metadata, setMetadata] = useState({})
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingRow, setEditingRow] = useState(null)
  const [activeId, setActiveId] = useState(null)
  const [draggedRow, setDraggedRow] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  )

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

  const moveRowBetweenTables = async (sourceTable, targetTable, rowData) => {
    try {
      const response = await fetch('/api/tables/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sourceTable, 
          targetTable, 
          rowData 
        })
      })
      if (response.ok) {
        fetchTables()
      }
    } catch (error) {
      console.error('Error moving row:', error)
    }
  }

  const addRow = async (tableName, newRowData) => {
    if (!newRowData.name || !newRowData.rank) return
    
    const table = tables.find(t => t.name === tableName)
    const updatedData = [...table.data, [newRowData.name, newRowData.rank]]
    
    await updateTable(tableName, updatedData)
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

  const handleDragStart = (event) => {
    setActiveId(event.active.id)
    
    // Parse the dragged item ID to get table and row info
    const [tableName, rowIndex] = event.active.id.split('-')
    const rowIndexNum = parseInt(rowIndex)
    const table = tables.find(t => t.name.includes(tableName.split('_').join(' ')))
    
    if (table && table.data[rowIndexNum]) {
      setDraggedRow({
        data: table.data[rowIndexNum],
        sourceTable: table.name,
        sourceIndex: rowIndexNum
      })
    }
  }

  const handleDragEnd = async (event) => {
    const { active, over } = event
    setActiveId(null)
    setDraggedRow(null)

    if (!over || active.id === over.id) {
      return
    }

    // Parse source and target information
    const [sourceTablePart, sourceIndex] = active.id.split('-')
    const [targetTablePart, targetIndex] = over.id.split('-')
    
    // Find actual table names
    const sourceTable = tables.find(t => t.name.includes(sourceTablePart.split('_').join(' ')))
    const targetTable = tables.find(t => t.name.includes(targetTablePart.split('_').join(' ')))
    
    if (!sourceTable || !targetTable) return
    
    const sourceRowIndex = parseInt(sourceIndex)
    const targetRowIndex = parseInt(targetIndex)
    
    // If moving within the same table, handle reordering
    if (sourceTable.name === targetTable.name) {
      const updatedData = [...sourceTable.data]
      const [draggedItem] = updatedData.splice(sourceRowIndex, 1)
      updatedData.splice(targetRowIndex, 0, draggedItem)
      await updateTable(sourceTable.name, updatedData)
    } else {
      // Moving between different tables
      const rowData = sourceTable.data[sourceRowIndex]
      
      // Remove from source table
      const sourceUpdatedData = sourceTable.data.filter((_, index) => index !== sourceRowIndex)
      
      // Add to target table
      const targetUpdatedData = [...targetTable.data]
      targetUpdatedData.splice(targetRowIndex, 0, rowData)
      
      // Update both tables
      await updateTable(sourceTable.name, sourceUpdatedData)
      await updateTable(targetTable.name, targetUpdatedData)
    }
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
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="min-h-screen bg-gray-50 p-4 print:bg-white print:p-0">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 print:mb-4">
            <h1 className="text-3xl font-bold text-red-600 mb-4 print:text-2xl">
              وەجهەی مەلازم/ پۆشندار
            </h1>
            
            {/* Enhanced Controls */}
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
              <Badge variant="secondary" className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-800">
                <Users className="w-4 h-4" />
                کۆی تۆمارەکان: {tables.reduce((sum, table) => sum + table.data.length, 0)}
              </Badge>
            </div>

            {/* Drag and Drop Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 print:hidden">
              <p className="text-sm text-blue-800 text-center">
                💡 بۆ گواستنەوەی تۆمارەکان، گرتن و کێشانی نیشانەی ☰ بکە
              </p>
            </div>
          </div>

          {/* Tables Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 print:gap-4">
            {filteredTables.map((table, tableIndex) => (
              <DroppableTable
                key={tableIndex}
                table={table}
                onAddRow={addRow}
                onDeleteRow={deleteRow}
                onUpdateRow={updateRow}
                editingRow={editingRow}
                setEditingRow={setEditingRow}
              />
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

        {/* Drag Overlay */}
        <DragOverlay>
          {activeId && draggedRow ? (
            <div className="bg-white shadow-2xl border-2 border-blue-400 rounded-lg p-3 opacity-95">
              <div className="flex items-center gap-3">
                <GripVertical className="w-4 h-4 text-blue-500" />
                <div className="text-right">
                  <div className="font-medium">{draggedRow.data[0]}</div>
                  <Badge variant="secondary" className="text-xs">
                    {draggedRow.data[1]}
                  </Badge>
                </div>
              </div>
            </div>
          ) : null}
        </DragOverlay>

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
    </DndContext>
  )
}