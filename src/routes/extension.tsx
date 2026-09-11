import { createFileRoute } from "@tanstack/react-router";
import { ExtensionView } from "@/components/extension-view";

export const Route = createFileRoute("/extension")({
  component: ExtensionPage,
});

function ExtensionPage() {
  return <ExtensionView />;
}
