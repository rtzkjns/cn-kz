"use client"

import { OnboardingFlow } from "./onboarding"
import { PhoneFrame } from "./phone-frame"
import {
  CargoDetailScreen,
  CarrierFeedScreen,
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
import { CnKzProvider, useCnKz } from "./store"

function Router() {
  const { role, tab, stack } = useCnKz()
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
    }
  }

  if (tab === "deals") return <DealsScreen />
  if (tab === "profile") return <ProfileScreen />
  // feed tab — role-dependent home
  return role === "shipper" ? <ShipperOrdersScreen /> : <CarrierFeedScreen />
}

function Root() {
  const { authed } = useCnKz()
  if (!authed) return <OnboardingFlow />
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
