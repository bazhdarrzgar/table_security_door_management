'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, FileText, File, Database, X, Check, AlertTriangle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import * as XLSX from 'xlsx'
import Papa from 'papaparse'

export default function ImportDialog({ tables, onImportComplete, userRole }) {
  const [isOpen, setIsOpen] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [fileData, setFileData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedTable, setSelectedTable] = useState('')
  const [importMode, setImportMode] = useState('append') // append or replace
  const [preview, setPreview] = useState(null)
  const fileInputRef = useRef(null)

  const canImport = userRole === 'admin'

  if (!canImport) {
    return null
  }

  const handleFileSelect = (file) => {
    setSelectedFile(file)
    setError('')
    parseFile(file)
  }

  const parseFile = async (file) => {
    setLoading(true)
    try {
      const extension = file.name.split('.').pop().toLowerCase()
      let data = []

      if (extension === 'csv') {
        // Parse CSV
        Papa.parse(file, {
          header: true,
          complete: (results) => {
            data = results.data.filter(row => Object.values(row).some(cell => cell && cell.trim()))
            setFileData(data)
            generatePreview(data)
            setLoading(false)
          },
          error: (error) => {
            setError('خەوتێک لە خوێندنەوەی فایلی CSV: ' + error.message)
            setLoading(false)
          }
        })
      } else if (extension === 'xlsx' || extension === 'xls') {
        // Parse Excel
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const workbook = XLSX.read(e.target.result, { type: 'binary' })
            const firstSheetName = workbook.SheetNames[0]
            const worksheet = workbook.Sheets[firstSheetName]
            data = XLSX.utils.sheet_to_json(worksheet)
            data = data.filter(row => Object.values(row).some(cell => cell && cell.toString().trim()))
            setFileData(data)
            generatePreview(data)
            setLoading(false)
          } catch (error) {
            setError('خەوتێک لە خوێندنەوەی فایلی Excel: ' + error.message)
            setLoading(false)
          }
        }
        reader.readAsBinaryString(file)
      } else if (extension === 'json') {
        // Parse JSON
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const jsonData = JSON.parse(e.target.result)
            if (Array.isArray(jsonData)) {
              data = jsonData
            } else if (jsonData.tables && Array.isArray(jsonData.tables)) {
              // Handle table export format
              data = jsonData.tables.flatMap(table => 
                table.data.map(row => ({
                  'ناو': row[0] || '',
                  'ڕەتبە': row[1] || '',
                  'جۆری خشتە': table.name
                }))
              )
            } else {
              setError('فۆرماتی JSON نادروستە')
              setLoading(false)
              return
            }
            setFileData(data)
            generatePreview(data)
            setLoading(false)
          } catch (error) {
            setError('خەوتێک لە خوێندنەوەی فایلی JSON: ' + error.message)
            setLoading(false)
          }
        }
        reader.readAsText(file)
      } else {
        setError('فۆرماتی فایل پشتگیری ناکرێت. تەنها CSV، Excel و JSON پشتگیری دەکرێن')
        setLoading(false)
      }
    } catch (error) {
      setError('خەوتێک لە پڕۆسێسکردنی فایل: ' + error.message)
      setLoading(false)
    }
  }

  const generatePreview = (data) => {
    if (data.length > 0) {
      const columns = Object.keys(data[0])
      const sampleRows = data.slice(0, 5)
      setPreview({ columns, sampleRows, totalRows: data.length })
    }
  }

  const handleImport = async () => {
    if (!selectedTable || !fileData) {
      setError('تکایە خشتە و فایل هەڵبژێرە')
      return
    }

    setLoading(true)
    try {
      // Transform data to match table format
      const transformedData = fileData.map(row => {
        const name = row['ناو'] || row['name'] || row['Name'] || Object.values(row)[0] || ''
        const rank = row['ڕەتبە'] || row['rank'] || row['Rank'] || Object.values(row)[1] || ''
        return [name.toString().trim(), rank.toString().trim()]
      }).filter(row => row[0] || row[1]) // Filter empty rows

      const response = await fetch('/api/tables/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          tableName: selectedTable,
          data: transformedData,
          mode: importMode
        })
      })

      if (response.ok) {
        onImportComplete()
        resetDialog()
        setIsOpen(false)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'خەوتێک لە ئینپۆرتکردن')
      }
    } catch (error) {
      setError('خەوتێک لە ئینپۆرتکردن: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const resetDialog = () => {
    setSelectedFile(null)
    setFileData(null)
    setPreview(null)
    setError('')
    setSelectedTable('')
    setImportMode('append')
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={() => setIsOpen(true)}
        >
          <Upload className="w-4 h-4" />
          ئینپۆرتی داتا
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-right text-xl">
            ئینپۆرتی داتا لە فایل
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription className="text-red-700 text-right">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            }`}
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
          >
            {selectedFile ? (
              <div className="flex items-center justify-center gap-3">
                <div className="p-2 bg-green-100 rounded-full">
                  {selectedFile.name.endsWith('.csv') ? (
                    <FileText className="w-6 h-6 text-green-600" />
                  ) : selectedFile.name.endsWith('.json') ? (
                    <Database className="w-6 h-6 text-green-600" />
                  ) : (
                    <File className="w-6 h-6 text-green-600" />
                  )}
                </div>
                <div className="text-right">
                  <div className="font-medium">{selectedFile.name}</div>
                  <div className="text-sm text-gray-500">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedFile(null)
                    setFileData(null)
                    setPreview(null)
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div>
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">فایل بکێشە یان کلیک بکە</p>
                <p className="text-gray-500 mb-4">
                  پشتگیری: CSV، Excel (.xlsx)، JSON
                </p>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  هەڵبژاردنی فایل
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls,.json"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleFileSelect(e.target.files[0])
                    }
                  }}
                  className="hidden"
                />
              </div>
            )}
          </div>

          {/* File Preview */}
          {preview && (
            <Card>
              <CardHeader>
                <CardTitle className="text-right text-lg">
                  پێشبینینی داتا
                </CardTitle>
                <div className="flex justify-between items-center">
                  <Badge variant="secondary">{preview.totalRows} ڕیز</Badge>
                  <Badge variant="outline">{preview.columns.length} کۆڵۆم</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        {preview.columns.map((col, index) => (
                          <th key={index} className="border px-3 py-2 text-right font-medium">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.sampleRows.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          {preview.columns.map((col, colIndex) => (
                            <td key={colIndex} className="border px-3 py-2 text-right">
                              {row[col]?.toString() || ''}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Import Configuration */}
          {fileData && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-right mb-2">
                  خشتەی ئامانج
                </label>
                <Select value={selectedTable} onValueChange={setSelectedTable}>
                  <SelectTrigger className="text-right">
                    <SelectValue placeholder="خشتەیەک هەڵبژێرە..." />
                  </SelectTrigger>
                  <SelectContent>
                    {tables.map((table, index) => (
                      <SelectItem key={index} value={table.name}>
                        {table.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-right mb-2">
                  شێوازی ئینپۆرت
                </label>
                <Select value={importMode} onValueChange={setImportMode}>
                  <SelectTrigger className="text-right">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="append">زیادکردن بۆ داتای ئێستا</SelectItem>
                    <SelectItem value="replace">جێگرتنەوەی هەموو داتا</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                resetDialog()
                setIsOpen(false)
              }}
            >
              پاشگەزبوونەوە
            </Button>
            <Button
              onClick={handleImport}
              disabled={!fileData || !selectedTable || loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ئینپۆرتکردن...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  ئینپۆرتی داتا
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}