import { createFileRoute } from "@tanstack/react-router";
import { LibraryView } from "@/components/library-view";

export const Route = createFileRoute("/library")({
  component: LibraryPage,
});

function LibraryPage() {
  return <LibraryView />;
}
