"use client"

import { OnboardingFlow } from "./onboarding"
import { PhoneFrame } from "./phone-frame"
import {
  CargoDetailScreen,
  CarrierFeedScreen,
  FavoritesScreen,
  TripBuilderScreen,
} from "./screens-carrier"
import {
  ChatScreen,
  DealScreen,
  DealsScreen,
  ProfileScreen,
} from "./screens-shared"
import {
  CreateOrderScreen,
  OrderDetailScreen,
  ShipperOrdersScreen,
} from "./screens-shipper"
import { AnalyticsScreen } from "./screens-analytics"
import { ChatsListScreen } from "./screens-chats"
import { CarrierProfileScreen } from "./screens-carrier-profile"
import { ShipperProfileScreen } from "./screens-shipper-profile"
import { SettingsScreen, HistoryScreen, SecurityScreen } from "./screens-account"
import { MarketFeedScreen, MarketOrderScreen } from "./screens-market"
import { GuestChatsScreen, GuestFavoritesScreen, GuestProfileScreen } from "./screens-guest"
import { TermsScreen } from "./screens-terms"
import { CnKzProvider, useCnKz } from "./store"

function Router() {
  const { authed, role, tab, stack } = useCnKz()
  const top = stack[stack.length - 1]

  if (top) {
    switch (top.type) {
      case "orderDetail":
        return <OrderDetailScreen orderId={top.orderId} />
      case "createOrder":
        return <CreateOrderScreen prefillFrom={top.prefillFrom} editId={top.editId} />
      case "cargoDetail":
        return <CargoDetailScreen orderId={top.orderId} />
      case "deal":
        return <DealScreen orderId={top.orderId} />
      case "chat":
        return <ChatScreen orderId={top.orderId} />
      case "carrierProfile":
        return (
          <CarrierProfileScreen
            carrierId={top.carrierId}
            orderId={top.orderId}
            offerId={top.offerId}
          />
        )
      case "marketOrder":
        return <MarketOrderScreen orderId={top.orderId} />
      case "shipperProfile":
        return <ShipperProfileScreen orderId={top.orderId} />
      case "tripBuilder":
        return <TripBuilderScreen />
      case "terms":
        return <TermsScreen />
      case "security":
        return <SecurityScreen />
    }
  }

  // Гость (не залогинен) — ПОЛНАЯ нижняя навигация (best-practice: не 2 таба, а полноценный
  // шелл), браузинг открыт, действия/вход гейтятся. Вход живёт в табе «Профиль».
  if (!authed) {
    if (tab === "favorites") return <GuestFavoritesScreen />
    if (tab === "chats") return <GuestChatsScreen />
    if (tab === "profile") return <GuestProfileScreen />
    return <MarketFeedScreen /> // «Главная» — открытая биржа грузов
  }
  if (tab === "myorders") return <ShipperOrdersScreen />
  if (tab === "analytics") return <AnalyticsScreen />
  if (tab === "chats") return <ChatsListScreen />
  if (tab === "favorites") return <FavoritesScreen />
  if (tab === "deals") return <DealsScreen />
  if (tab === "settings") return <SettingsScreen />
  if (tab === "history") return <HistoryScreen />
  if (tab === "profile") return <ProfileScreen />
  // feed = «Главная» — marketplace of all orders (read-only browse for shipper, bid for carrier)
  return role === "shipper" ? <MarketFeedScreen /> : <CarrierFeedScreen />
}

function Root() {
  const { showAuth } = useCnKz()
  // One app: onboarding overlay when a gated action needs login; otherwise the app shell
  // renders for BOTH guests (logged-out marketplace) and authed users (role experience).
  if (showAuth) return <OnboardingFlow />
  return (
    <PhoneFrame>
      <Router />
    </PhoneFrame>
  )
}

export function CnKzApp() {
  return (
    <CnKzProvider>
      <Root />
    </CnKzProvider>
  )
}
