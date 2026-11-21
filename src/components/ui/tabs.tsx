'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface TabProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'value'> {
  value: string
  disabled?: boolean
}

export interface TabsProps {
  children: React.ReactNode
  defaultValue: string
  value?: string
  onValueChange?: (value: string) => void
  className?: string
}

export interface TabListProps extends React.HTMLAttributes<HTMLDivElement> {}

export interface TabPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

const TabsContext = React.createContext<{
  value: string
  onValueChange: (value: string) => void
} | null>(null)

function useTabsContext() {
  const context = React.useContext(TabsContext)
  if (!context) {
    throw new Error('Tabs components must be used within Tabs')
  }
  return context
}

export function Tabs({ children, defaultValue, value, onValueChange, className }: TabsProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue)
  const isControlled = value !== undefined
  const currentValue = isControlled ? value : internalValue

  const handleValueChange = (newValue: string) => {
    if (!isControlled) {
      setInternalValue(newValue)
    }
    onValueChange?.(newValue)
  }

  return (
    <TabsContext.Provider value={{ value: currentValue, onValueChange: handleValueChange }}>
      <div className={cn('space-y-4', className)}>{children}</div>
    </TabsContext.Provider>
  )
}

export function TabList({ children, className, ...props }: TabListProps) {
  return (
    <div
      role="tablist"
      aria-orientation="horizontal"
      className={cn('inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground', className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function Tab({ children, value, disabled, className, ...props }: TabProps) {
  const { value: currentValue, onValueChange } = useTabsContext()
  const isActive = currentValue === value

  return (
    <button
      role="tab"
      aria-selected={isActive}
      aria-controls={`panel-${value}`}
      id={`tab-${value}`}
      data-state={isActive ? 'active' : 'inactive'}
      data-disabled={disabled}
      onClick={() => !disabled && onValueChange(value)}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        isActive
          ? 'bg-background text-foreground shadow-sm'
          : 'hover:bg-accent hover:text-accent-foreground',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function TabPanel({ children, value, className, ...props }: TabPanelProps) {
  const { value: currentValue } = useTabsContext()
  const isActive = currentValue === value

  return (
    <div
      role="tabpanel"
      id={`panel-${value}`}
      aria-labelledby={`tab-${value}`}
      hidden={!isActive}
      className={cn('mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2', className)}
      {...props}
    >
      {isActive && children}
    </div>
  )
}