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
import { SettingsScreen, HistoryScreen } from "./screens-account"
import { MarketFeedScreen, MarketOrderScreen } from "./screens-market"
import { CnKzProvider, useCnKz } from "./store"

function Router() {
  const { authed, role, tab, stack } = useCnKz()
  const top = stack[stack.length - 1]

  if (top) {
    switch (top.type) {
      case "orderDetail":
        return <OrderDetailScreen orderId={top.orderId} />
      case "createOrder":
        return <CreateOrderScreen />
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
      case "tripBuilder":
        return <TripBuilderScreen />
    }
  }

  // Гость (не залогинен) — тот же самый app-shell, но домашний экран = маркетплейс «Главная».
  if (!authed) return <MarketFeedScreen />
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
