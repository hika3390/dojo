import { container } from "@/infrastructure/container";

export async function GET() {
  return container.practiceCatalogController.get();
}
