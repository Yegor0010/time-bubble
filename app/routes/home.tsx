import type { Route } from "./+types/home";
import { Timer } from "../pages/timer";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Time Bubble" },
    { name: "description", content: "Focus like in a bubble!" },
  ];
}

export default function Home() {
  return <Timer />;
}
