import type { Metadata } from "next";
import { ReviewList } from "@/app/_components/review-list";
import { Container } from "@/app/_components/ui";

export const metadata: Metadata = { title: "復習" };

export default function ReviewPage() {
  return (
    <Container className="pt-8">
      <h1 className="sr-only">復習</h1>
      <ReviewList />
    </Container>
  );
}
