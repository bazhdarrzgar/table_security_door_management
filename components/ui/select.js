'use client'

import * as React from "react"
import { ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"

const Select = React.forwardRef(({ className, children, ...props }, ref) => (
  <div className={cn("relative", className)} ref={ref} {...props}>
    {children}
  </div>
))
Select.displayName = "Select"

const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => (
  <button
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    ref={ref}
    {...props}
  >
    {children}
    <ChevronDown className="h-4 w-4 opacity-50" />
  </button>
))
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = React.forwardRef(({ className, placeholder, ...props }, ref) => (
  <span
    className={cn("block truncate", className)}
    ref={ref}
    {...props}
  >
    {placeholder}
  </span>
))
SelectValue.displayName = "SelectValue"

const SelectContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    className={cn(
      "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80",
      className
    )}
    ref={ref}
    {...props}
  >
    <div className="w-full p-1">
      {children}
    </div>
  </div>
))
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    ref={ref}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <Check className="h-4 w-4" />
    </span>
    {children}
  </div>
))
SelectItem.displayName = "SelectItem"

// Simple implementation for our needs
const SelectContext = React.createContext()

const SelectProvider = ({ children, value, onValueChange }) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [selectedValue, setSelectedValue] = React.useState(value)

  React.useEffect(() => {
    setSelectedValue(value)
  }, [value])

  const handleValueChange = (newValue) => {
    setSelectedValue(newValue)
    onValueChange?.(newValue)
    setIsOpen(false)
  }

  return (
    <SelectContext.Provider value={{
      isOpen,
      setIsOpen,
      selectedValue,
      handleValueChange
    }}>
      {children}
    </SelectContext.Provider>
  )
}

// Export a simple Select implementation
export { SelectProvider as Select, SelectTrigger, SelectValue, SelectContent, SelectItem }