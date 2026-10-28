import { BellRing, CloudRain, LayoutDashboard, Map, MessagesSquare, Route as RouteIcon, ShieldCheck } from "lucide-react";

export const NAV_ITEMS = [
  { title: "Overview", url: "/dashboard", icon: LayoutDashboard },
  { title: "Risk Map", url: "/risk-map", icon: Map },
  { title: "Safer Trip Planner", url: "/trip-planner", icon: RouteIcon },
  { title: "Neighbourhood Alerts", url: "/alerts", icon: BellRing },
  { title: "Rain Timeline", url: "/rain-timeline", icon: CloudRain },
  { title: "Community Board", url: "/community", icon: MessagesSquare },
  { title: "Response Dashboard", url: "/response", icon: ShieldCheck },
] as const;
