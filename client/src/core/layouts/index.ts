/**
 * Pulse Design System - Layouts
 * Layout components adapted for Chat project
 */

// Sidebar
export {
  Sidebar,
  SidebarComponent,
  SidebarToggle,
  SidebarLogo,
  SidebarNav,
  SidebarSection,
  SidebarItem,
  SidebarUserInfo,
  SidebarFooter,
  useSidebar,
  sidebarVariants,
  sidebarItemVariants,
} from './Sidebar'
export type {
  SidebarProps,
  SidebarItem as SidebarItemType,
  SidebarUser,
  SidebarContextValue,
} from './Sidebar'

// Header / TopBar
export {
  Header,
  HeaderComponent,
  TopBar,
  TopBarComponent,
  HeaderMobileMenuButton,
  HeaderSearch,
  HeaderBreadcrumbs,
  HeaderNotifications,
  HeaderUserMenu,
  HeaderActions,
  useHeader,
  headerVariants,
} from './Header'
export type { HeaderProps, HeaderNotification, HeaderUserMenuItem, HeaderUser } from './Header'

// MainContent
export { MainContent, mainContentVariants } from './MainContent'
export type { MainContentProps } from './MainContent'
