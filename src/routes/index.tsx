import { createFileRoute } from "@tanstack/react-router";
import { LandingView } from "@/components/landing-view";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return <LandingView />;
}
