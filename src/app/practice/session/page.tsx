import type { Metadata } from "next";
import { Suspense } from "react";
import { PracticeSession, SessionSkeleton } from "@/app/_components/practice-session";
import { Container } from "@/app/_components/ui";

export const metadata: Metadata = { title: "演習" };

export default function PracticeSessionPage() {
  return (
    <Container className="pt-8">
      <Suspense fallback={<SessionSkeleton />}>
        <PracticeSession />
      </Suspense>
    </Container>
  );
}
