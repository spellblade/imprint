import { createFileRoute } from "@tanstack/react-router";
import { Playground } from "@/components/playground";
import { z } from "zod";

const searchSchema = z.object({
  site: z.string().optional(),
});

export const Route = createFileRoute("/playground")({
  validateSearch: searchSchema,
  component: PlaygroundPage,
});

function PlaygroundPage() {
  const { site } = Route.useSearch();
  return <Playground initialSiteId={site} />;
}
