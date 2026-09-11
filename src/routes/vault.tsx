import { createFileRoute } from "@tanstack/react-router";
import { VaultView } from "@/components/vault-view";

export const Route = createFileRoute("/vault")({
  component: VaultPage,
});

function VaultPage() {
  return <VaultView />;
}
