import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    }
  },
  usePathname() {
    return '/'
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  createBrowserSupabaseClient: () => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signInWithOAuth: jest.fn(),
      signOut: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      updateUser: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      upsert: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    })),
  }),
  getCurrentUser: jest.fn().mockResolvedValue(null),
  getCurrentSession: jest.fn().mockResolvedValue(null),
}))

// Mock next-themes
jest.mock('next-themes', () => ({
  ThemeProvider: ({ children }) => children,
  useTheme: () => ({ theme: 'light', setTheme: jest.fn() }),
}))

// Mock sonner
jest.mock('sonner', () => ({
  Toaster: () => null,
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  },
}))

// Mock lucide-react icons
jest.mock('lucide-react', () => {
  const icons = {}
  const iconNames = ['X', 'Check', 'AlertCircle', 'Loader2', 'ChevronRight', 'ChevronLeft', 'Menu', 'X', 'Sun', 'Moon', 'Github', 'Twitter', 'Discord', 'Mail', 'Lock', 'User', 'LogOut', 'Settings', 'BookOpen', 'Brain', 'MessageSquare', 'BarChart', 'Target', 'ArrowRight', 'CheckCircle', 'Clock', 'Star', 'Award', 'Download', 'Upload', 'FileText', 'Database', 'Zap', 'Shield', 'Globe', 'Heart', 'ThumbsUp', 'ThumbsDown', 'Flag', 'Bell', 'Search', 'Filter', 'MoreHorizontal', 'MoreVertical', 'Edit', 'Trash', 'Copy', 'Link', 'Share', 'ExternalLink', 'Eye', 'EyeOff', 'Plus', 'Minus', 'Maximize', 'Minimize', 'RotateCcw', 'RefreshCw', 'Home', 'LayoutDashboard', 'Users', 'GraduationCap', 'Mic', 'Volume2', 'VolumeX', 'Languages', 'Translate', 'Globe', 'Flag', 'CheckCircle2', 'XCircle', 'AlertTriangle', 'Info', 'HelpCircle', 'Settings', 'UserPlus', 'UserMinus', 'UserCheck', 'UserX', 'LogIn', 'LogOut', 'SignIn', 'SignOut', 'Mail', 'Lock', 'Unlock', 'Key', 'Fingerprint', 'Shield', 'Lock', 'Unlock', 'Key', 'Fingerprint', 'Shield']
  
  iconNames.forEach(name => {
    icons[name] = ({ className, ...props }) => (
      <svg className={className} {...props} data-testid={`icon-${name.toLowerCase()}`} />
    )
  })
  
  return icons
})

// Suppress console.error in tests (React warnings)
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})