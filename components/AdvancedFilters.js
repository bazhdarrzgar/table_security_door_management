'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Filter, X, Plus, ArrowUpDown, ArrowUp, ArrowDown, RotateCcw } from 'lucide-react'

export default function AdvancedFilters({ 
  tables, 
  onFiltersChange, 
  onSortChange,
  currentFilters = [],
  currentSort = null
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState(currentFilters)
  const [sort, setSort] = useState(currentSort)

  // Available filter conditions
  const filterConditions = [
    { value: 'contains', label: 'دەگرێتەوە' },
    { value: 'equals', label: 'یەکسانە لەگەڵ' },
    { value: 'startsWith', label: 'دەستپێدەکات بە' },
    { value: 'endsWith', label: 'کۆتاییدێت بە' },
    { value: 'isEmpty', label: 'بەتاڵە' },
    { value: 'isNotEmpty', label: 'بەتاڵ نییە' }
  ]

  // Get all unique values for dropdown filters
  const getUniqueValues = (field) => {
    const values = new Set()
    tables.forEach(table => {
      table.data.forEach(row => {
        if (field === 'name') values.add(row[0])
        if (field === 'rank') values.add(row[1])
        if (field === 'table') values.add(table.name)
      })
    })
    return Array.from(values).filter(v => v && v.trim())
  }

  const addFilter = () => {
    setFilters([...filters, {
      id: Date.now(),
      field: 'name',
      condition: 'contains',
      value: ''
    }])
  }

  const updateFilter = (id, field, value) => {
    setFilters(filters.map(f => 
      f.id === id ? { ...f, [field]: value } : f
    ))
  }

  const removeFilter = (id) => {
    setFilters(filters.filter(f => f.id !== id))
  }

  const applyFilters = () => {
    const validFilters = filters.filter(f => 
      (f.value && f.value.trim()) || 
      f.condition === 'isEmpty' || 
      f.condition === 'isNotEmpty'
    )
    onFiltersChange(validFilters)
    if (sort) {
      onSortChange(sort)
    }
    setIsOpen(false)
  }

  const resetFilters = () => {
    setFilters([])
    setSort(null)
    onFiltersChange([])
    onSortChange(null)
  }

  const setSortOrder = (field, direction) => {
    const newSort = { field, direction }
    setSort(newSort)
    onSortChange(newSort)  // Apply immediately
  }

  const activeFiltersCount = filters.filter(f => f.value.trim()).length

  return (
    <div className="flex items-center gap-2">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2 relative">
            <Filter className="w-4 h-4" />
            فلتەری پەرەسەندوو
            {activeFiltersCount > 0 && (
              <Badge variant="destructive" className="ml-1 px-1 py-0 text-xs min-w-[16px] h-4">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-right text-xl">
              فلتەر و ڕیزکردنی پەرەسەندوو
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Sorting Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-right text-lg flex items-center gap-2">
                  <ArrowUpDown className="w-5 h-5" />
                  ڕیزکردن
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-right mb-2">
                      خانە
                    </label>
                    <Select 
                      value={sort?.field || ''} 
                      onValueChange={(value) => setSortOrder(value, sort?.direction || 'asc')}
                    >
                      <SelectTrigger className="text-right">
                        <SelectValue placeholder="خانەیەک هەڵبژێرە..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">ناو</SelectItem>
                        <SelectItem value="rank">ڕەتبە</SelectItem>
                        <SelectItem value="table">ناوی خشتە</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-right mb-2">
                      ئاراستە
                    </label>
                    <div className="flex gap-2">
                      <Button
                        variant={sort?.direction === 'asc' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSortOrder(sort?.field || 'name', 'asc')}
                        className="flex items-center gap-1 flex-1"
                      >
                        <ArrowUp className="w-4 h-4" />
                        سەرەوە
                      </Button>
                      <Button
                        variant={sort?.direction === 'desc' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSortOrder(sort?.field || 'name', 'desc')}
                        className="flex items-center gap-1 flex-1"
                      >
                        <ArrowDown className="w-4 h-4" />
                        خوارەوە
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Filters Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-right text-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    فلتەرەکان
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addFilter}
                    className="flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    زیادکردنی فلتەر
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {filters.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Filter className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>هیچ فلتەرێک زیاد نەکراوە</p>
                    <p className="text-sm">فلتەر زیاد بکە بۆ گەڕانی زیاتر</p>
                  </div>
                ) : (
                  filters.map((filter, index) => (
                    <div key={filter.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">فلتەری {index + 1}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFilter(filter.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3">
                        {/* Field Selection */}
                        <div>
                          <label className="block text-xs font-medium text-right mb-1">
                            خانە
                          </label>
                          <Select
                            value={filter.field}
                            onValueChange={(value) => updateFilter(filter.id, 'field', value)}
                          >
                            <SelectTrigger className="text-right">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="name">ناو</SelectItem>
                              <SelectItem value="rank">ڕەتبە</SelectItem>
                              <SelectItem value="table">ناوی خشتە</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Condition Selection */}
                        <div>
                          <label className="block text-xs font-medium text-right mb-1">
                            مەرج
                          </label>
                          <Select
                            value={filter.condition}
                            onValueChange={(value) => updateFilter(filter.id, 'condition', value)}
                          >
                            <SelectTrigger className="text-right">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {filterConditions.map((condition) => (
                                <SelectItem key={condition.value} value={condition.value}>
                                  {condition.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Value Input */}
                        <div>
                          <label className="block text-xs font-medium text-right mb-1">
                            نرخ
                          </label>
                          {filter.condition === 'isEmpty' || filter.condition === 'isNotEmpty' ? (
                            <div className="h-10 flex items-center text-sm text-gray-500 bg-gray-50 rounded-md px-3">
                              بێ پێویست
                            </div>
                          ) : filter.field === 'rank' || filter.field === 'table' ? (
                            <Select
                              value={filter.value}
                              onValueChange={(value) => updateFilter(filter.id, 'value', value)}
                            >
                              <SelectTrigger className="text-right">
                                <SelectValue placeholder="هەڵبژێرە..." />
                              </SelectTrigger>
                              <SelectContent>
                                {getUniqueValues(filter.field).map((value) => (
                                  <SelectItem key={value} value={value}>
                                    {value}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input
                              value={filter.value}
                              onChange={(e) => updateFilter(filter.id, 'value', e.target.value)}
                              placeholder="نرخ بنووسە..."
                              className="text-right"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={resetFilters}
                className="flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                سڕینەوەی هەموو
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                پاشگەزبوونەوە
              </Button>
              <Button
                onClick={applyFilters}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                جێبەجێکردن
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">فلتەری چالاک:</span>
          <Badge variant="secondary" className="flex items-center gap-1">
            {activeFiltersCount} فلتەر
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="h-4 w-4 p-0 hover:bg-transparent"
            >
              <X className="w-3 h-3" />
            </Button>
          </Badge>
        </div>
      )}
    </div>
  )
}