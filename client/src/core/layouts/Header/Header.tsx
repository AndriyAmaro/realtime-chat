import * as React from 'react'
import { cva } from 'class-variance-authority'
import { Menu, Bell, Settings, LogOut, User, ChevronDown, Search, X } from 'lucide-react'
import { cn } from '@shared/utils/cn'
import { Avatar } from '@core/primitives/Avatar'
import { Badge } from '@core/primitives/Badge'
import { ThemeToggle } from '@core/primitives/ThemeToggle'
import { DropdownMenu } from '@core/organisms/DropdownMenu'
import { SearchBar, type SearchBarProps } from '@core/patterns/SearchBar'
import { Breadcrumbs, type BreadcrumbItem } from '@core/patterns/Breadcrumbs'

// ============ CONTEXT ============

interface HeaderContextValue {
  isMobile: boolean
}

const HeaderContext = React.createContext<HeaderContextValue | null>(null)

function useHeader() {
  const context = React.useContext(HeaderContext)
  if (!context) {
    throw new Error('useHeader must be used within Header')
  }
  return context
}

// ============ TYPES ============

export interface HeaderNotification {
  id: string
  title: string
  description?: string
  timestamp?: string
  read?: boolean
  href?: string
  icon?: React.ReactNode
}

export interface HeaderUserMenuItem {
  id: string
  label: string
  icon?: React.ReactNode
  href?: string
  onClick?: () => void
  destructive?: boolean
  separator?: boolean
}

export interface HeaderUser {
  name: string
  email?: string
  avatar?: string
  role?: string
}

export interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  /** Breadcrumb items */
  breadcrumbs?: BreadcrumbItem[]
  /** Custom breadcrumbs render function for Next.js Link */
  renderBreadcrumbLink?: (
    item: BreadcrumbItem,
    isLast: boolean,
    children: React.ReactNode
  ) => React.ReactNode
  /** Show search bar */
  showSearch?: boolean
  /** Search bar props */
  searchProps?: SearchBarProps
  /** Notifications list */
  notifications?: HeaderNotification[]
  /** Unread notification count */
  notificationCount?: number
  /** Callback when notification is clicked */
  onNotificationClick?: (notification: HeaderNotification) => void
  /** Callback for "View all" notifications */
  onNotificationsViewAll?: () => void
  /** User info for menu */
  user?: HeaderUser
  /** User menu items */
  userMenuItems?: HeaderUserMenuItem[]
  /** Callback for mobile menu toggle */
  onMobileMenuClick?: () => void
  /** Show mobile menu button */
  showMobileMenu?: boolean
  /** Fixed/sticky header */
  sticky?: boolean
  /** Header height */
  height?: string
  /** Left slot content */
  leftSlot?: React.ReactNode
  /** Center slot content (replaces search) */
  centerSlot?: React.ReactNode
  /** Right slot content (replaces notifications/user) */
  rightSlot?: React.ReactNode
}

// ============ VARIANTS ============

const headerVariants = cva(
  [
    'flex items-center justify-between px-4 lg:px-6',
    'bg-[var(--bg-base)] border-b border-[var(--border-default)]',
    'transition-all duration-150',
  ],
  {
    variants: {
      sticky: {
        true: 'sticky top-0 z-sticky',
        false: '',
      },
    },
    defaultVariants: {
      sticky: true,
    },
  }
)

// ============ MOBILE DETECTION ============

function useIsMobile(breakpoint: number = 1024) {
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < breakpoint)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [breakpoint])

  return isMobile
}

// ============ SUB-COMPONENTS ============

type HeaderMobileMenuButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>

const HeaderMobileMenuButton = React.forwardRef<HTMLButtonElement, HeaderMobileMenuButtonProps>(
  ({ className, onClick, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        className={cn(
          'flex items-center justify-center rounded-lg p-2 lg:hidden',
          'min-h-[44px] min-w-[44px]',
          'text-[var(--text-muted)] hover:text-[var(--text-primary)]',
          'hover:bg-[var(--bg-muted)]',
          'transition-colors duration-150',
          'focus-visible:ring-primary-500/50 focus:outline-none focus-visible:ring-2',
          className
        )}
        aria-label="Toggle mobile menu"
        {...props}
      >
        <Menu className="h-5 w-5" />
      </button>
    )
  }
)

HeaderMobileMenuButton.displayName = 'Header.MobileMenuButton'

type HeaderSearchProps = SearchBarProps

const HeaderSearch = React.forwardRef<HTMLInputElement, HeaderSearchProps>(
  ({ className, ...props }, ref) => {
    const { isMobile } = useHeader()
    const [mobileSearchOpen, setMobileSearchOpen] = React.useState(false)

    // Mobile: icon toggle that expands to full-width search overlay
    if (isMobile) {
      if (mobileSearchOpen) {
        return (
          <div className="absolute inset-x-0 top-0 z-10 flex h-full items-center gap-2 bg-[var(--bg-base)] px-3">
            <SearchBar
              ref={ref}
              size="sm"
              variant="filled"
              className="flex-1"
              autoFocus
              {...props}
            />
            <button
              type="button"
              onClick={() => setMobileSearchOpen(false)}
              className={cn(
                'flex shrink-0 items-center justify-center rounded-lg p-2',
                'text-[var(--text-muted)] hover:text-[var(--text-primary)]',
                'hover:bg-[var(--bg-muted)]',
                'transition-colors duration-150'
              )}
              aria-label="Close search"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )
      }

      return (
        <button
          type="button"
          onClick={() => setMobileSearchOpen(true)}
          className={cn(
            'flex items-center justify-center rounded-lg p-2',
            'text-[var(--text-muted)] hover:text-[var(--text-primary)]',
            'hover:bg-[var(--bg-muted)]',
            'transition-colors duration-150',
            'focus-visible:ring-primary-500/50 focus:outline-none focus-visible:ring-2',
            className
          )}
          aria-label="Open search"
        >
          <Search className="h-5 w-5" />
        </button>
      )
    }

    // Desktop: normal search bar
    return (
      <SearchBar
        ref={ref}
        size="md"
        variant="filled"
        className={cn('w-full max-w-md', className)}
        {...props}
      />
    )
  }
)

HeaderSearch.displayName = 'Header.Search'

interface HeaderBreadcrumbsProps {
  items: BreadcrumbItem[]
  renderLink?: (item: BreadcrumbItem, isLast: boolean, children: React.ReactNode) => React.ReactNode
  className?: string
}

const HeaderBreadcrumbs: React.FC<HeaderBreadcrumbsProps> = ({ items, renderLink, className }) => {
  const lastItem = items[items.length - 1]

  return (
    <>
      {/* Full breadcrumbs on sm+ */}
      <Breadcrumbs
        items={items}
        size="sm"
        maxItems={4}
        renderLink={renderLink}
        className={cn('hidden sm:flex', className)}
      />
      {/* Current page title on mobile */}
      {lastItem && (
        <span className="max-w-[140px] truncate text-sm font-medium text-[var(--text-primary)] sm:hidden">
          {lastItem.label}
        </span>
      )}
    </>
  )
}

HeaderBreadcrumbs.displayName = 'Header.Breadcrumbs'

interface HeaderNotificationsProps {
  notifications: HeaderNotification[]
  count?: number
  onNotificationClick?: (notification: HeaderNotification) => void
  onViewAll?: () => void
  className?: string
}

const HeaderNotifications: React.FC<HeaderNotificationsProps> = ({
  notifications,
  count = 0,
  onNotificationClick,
  onViewAll,
  className,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className={cn(
            'relative flex items-center justify-center rounded-lg p-2',
            'min-h-[44px] min-w-[44px]',
            'text-[var(--text-muted)] hover:text-[var(--text-primary)]',
            'hover:bg-[var(--bg-muted)]',
            'transition-colors duration-150',
            'focus-visible:ring-primary-500/50 focus:outline-none focus-visible:ring-2',
            className
          )}
          aria-label={`Notifications${count > 0 ? ` (${count} unread)` : ''}`}
        >
          <Bell className="h-5 w-5" />
          {count > 0 && (
            <span className="bg-error-base absolute -top-0.5 -right-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-semibold text-white">
              {count > 99 ? '99+' : count}
            </span>
          )}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content align="end" className="w-80 max-w-[calc(100vw-2rem)]">
        <div className="border-b border-[var(--border-default)] px-3 py-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[var(--text-primary)]">Notifications</span>
            {count > 0 && (
              <Badge variant="primary" size="sm">
                {count} new
              </Badge>
            )}
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-[var(--text-muted)]">No notifications</div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenu.Item
                key={notification.id}
                onClick={() => onNotificationClick?.(notification)}
                className="flex items-start gap-3 p-3"
              >
                {notification.icon && (
                  <span className="mt-0.5 flex-shrink-0 text-[var(--text-muted)]">
                    {notification.icon}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <div className={cn('truncate text-sm', !notification.read && 'font-medium')}>
                    {notification.title}
                  </div>
                  {notification.description && (
                    <div className="mt-0.5 truncate text-xs text-[var(--text-muted)]">
                      {notification.description}
                    </div>
                  )}
                  {notification.timestamp && (
                    <div className="mt-1 text-xs text-[var(--text-disabled)]">
                      {notification.timestamp}
                    </div>
                  )}
                </div>
                {!notification.read && (
                  <span className="bg-primary-500 mt-1.5 h-2 w-2 flex-shrink-0 rounded-full" />
                )}
              </DropdownMenu.Item>
            ))
          )}
        </div>

        {onViewAll && notifications.length > 0 && (
          <div className="border-t border-[var(--border-default)]">
            <DropdownMenu.Item
              onClick={onViewAll}
              className="text-primary-500 hover:text-primary-600 justify-center"
            >
              View all notifications
            </DropdownMenu.Item>
          </div>
        )}
      </DropdownMenu.Content>
    </DropdownMenu>
  )
}

HeaderNotifications.displayName = 'Header.Notifications'

interface HeaderUserMenuProps {
  user: HeaderUser
  menuItems?: HeaderUserMenuItem[]
  className?: string
}

const HeaderUserMenu: React.FC<HeaderUserMenuProps> = ({ user, menuItems = [], className }) => {
  const { isMobile } = useHeader()

  const defaultMenuItems: HeaderUserMenuItem[] = [
    { id: 'profile', label: 'Profile', icon: <User className="h-4 w-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> },
    { id: 'sep1', label: '', separator: true },
    {
      id: 'logout',
      label: 'Log out',
      icon: <LogOut className="h-4 w-4" />,
      destructive: true,
    },
  ]

  const items = menuItems.length > 0 ? menuItems : defaultMenuItems

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className={cn(
            'flex items-center gap-2 rounded-lg p-1.5',
            'hover:bg-[var(--bg-muted)]',
            'transition-colors duration-150',
            'focus-visible:ring-primary-500/50 focus:outline-none focus-visible:ring-2',
            className
          )}
        >
          <Avatar src={user.avatar} initials={user.name} size="sm" />
          {!isMobile && (
            <>
              <div className="hidden text-left lg:block">
                <div className="max-w-[120px] truncate text-sm font-medium text-[var(--text-primary)]">
                  {user.name}
                </div>
                {user.role && (
                  <div className="max-w-[120px] truncate text-xs text-[var(--text-muted)]">
                    {user.role}
                  </div>
                )}
              </div>
              <ChevronDown className="hidden h-4 w-4 text-[var(--text-muted)] lg:block" />
            </>
          )}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content align="end" className="w-56 max-w-[calc(100vw-2rem)]">
        <div className="border-b border-[var(--border-default)] px-3 py-2">
          <div className="text-sm font-medium text-[var(--text-primary)]">{user.name}</div>
          {user.email && (
            <div className="truncate text-xs text-[var(--text-muted)]">{user.email}</div>
          )}
        </div>

        <div className="py-1">
          {items.map((item) =>
            item.separator ? (
              <DropdownMenu.Separator key={item.id} />
            ) : (
              <DropdownMenu.Item
                key={item.id}
                onClick={item.onClick}
                destructive={item.destructive}
              >
                {item.icon && <span className="mr-2 text-[var(--text-muted)]">{item.icon}</span>}
                {item.label}
              </DropdownMenu.Item>
            )
          )}
        </div>
      </DropdownMenu.Content>
    </DropdownMenu>
  )
}

HeaderUserMenu.displayName = 'Header.UserMenu'

type HeaderActionsProps = React.HTMLAttributes<HTMLDivElement>

const HeaderActions = React.forwardRef<HTMLDivElement, HeaderActionsProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('flex items-center gap-2', className)} {...props}>
        {children}
      </div>
    )
  }
)

HeaderActions.displayName = 'Header.Actions'

// ============ MAIN COMPONENT ============

const Header = React.forwardRef<HTMLElement, HeaderProps>(
  (
    {
      className,
      breadcrumbs,
      renderBreadcrumbLink,
      showSearch = true,
      searchProps,
      notifications = [],
      notificationCount,
      onNotificationClick,
      onNotificationsViewAll,
      user,
      userMenuItems,
      onMobileMenuClick,
      showMobileMenu = true,
      sticky = true,
      height = '64px',
      leftSlot,
      centerSlot,
      rightSlot,
      children,
      ...props
    },
    ref
  ) => {
    const isMobile = useIsMobile()

    const contextValue: HeaderContextValue = {
      isMobile,
    }

    const unreadCount = notificationCount ?? notifications.filter((n) => !n.read).length

    return (
      <HeaderContext.Provider value={contextValue}>
        <header
          ref={ref}
          className={cn(headerVariants({ sticky }), className)}
          style={{ height }}
          {...props}
        >
          {/* Left Section */}
          <div className="flex items-center gap-4">
            {showMobileMenu && onMobileMenuClick && (
              <HeaderMobileMenuButton onClick={onMobileMenuClick} />
            )}

            {leftSlot}

            {breadcrumbs && breadcrumbs.length > 0 && (
              <HeaderBreadcrumbs items={breadcrumbs} renderLink={renderBreadcrumbLink} />
            )}
          </div>

          {/* Center Section — hidden on mobile, search moves to right */}
          {!isMobile && (
            <div className="flex flex-1 items-center justify-center px-4">
              {centerSlot ? centerSlot : showSearch ? <HeaderSearch {...searchProps} /> : null}
            </div>
          )}

          {/* Spacer on mobile to push right section */}
          {isMobile && <div className="flex-1" />}

          {/* Right Section */}
          <div className="flex items-center gap-1 sm:gap-2">
            {rightSlot ? (
              rightSlot
            ) : (
              <>
                {/* Mobile search toggle */}
                {isMobile && showSearch && !centerSlot && <HeaderSearch {...searchProps} />}

                {/* Theme Toggle */}
                <ThemeToggle size="sm" />

                {notifications.length > 0 || notificationCount ? (
                  <HeaderNotifications
                    notifications={notifications}
                    count={unreadCount}
                    onNotificationClick={onNotificationClick}
                    onViewAll={onNotificationsViewAll}
                  />
                ) : null}

                {user && <HeaderUserMenu user={user} menuItems={userMenuItems} />}
              </>
            )}

            {children}
          </div>
        </header>
      </HeaderContext.Provider>
    )
  }
)

Header.displayName = 'Header'

// ============ COMPOUND EXPORT ============

export const HeaderComponent = Object.assign(Header, {
  MobileMenuButton: HeaderMobileMenuButton,
  Search: HeaderSearch,
  Breadcrumbs: HeaderBreadcrumbs,
  Notifications: HeaderNotifications,
  UserMenu: HeaderUserMenu,
  Actions: HeaderActions,
})

// Alias
export const TopBar = Header
export const TopBarComponent = HeaderComponent

export {
  Header,
  HeaderMobileMenuButton,
  HeaderSearch,
  HeaderBreadcrumbs,
  HeaderNotifications,
  HeaderUserMenu,
  HeaderActions,
  useHeader,
  headerVariants,
}
