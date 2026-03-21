// app/dashboard/page.tsx
import DashboardClient from "@/app/(dashboard)/dashboard/DashboardClient";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function DashboardPage() {
  // Simulate server-side fetch (replace with real DB/API call later)
  const session = await auth.api.getSession({
    headers:await headers()
  });
  
  const programs = [
    {
      id: 1,
      name: "Software Engineering Program",
      description: "A program for software engineering candidates",
      organizationId: 1,
      rounds: [
        { id: 1, name: "Technical Interview", description: "Technical interview round" },
        { id: 2, name: "Coding Challenge", description: "Coding challenge round" },
      ],
      createdAt: "2022-01-01T12:00:00.000Z",
    },
    {
      id: 2,
      name: "Data Science Program",
      description: "A program for data science candidates",
      organizationId: 1,
      rounds: [
        { id: 3, name: "Data Analysis", description: "Data analysis round" },
        { id: 4, name: "Machine Learning", description: "Machine learning round" },
      ],
      createdAt: "2022-01-15T12:00:00.000Z",
    },
  ];

  const candidates = [
    { id: 1, name: "John Doe", email: "john@example.com", status: "In Progress", programId: 1, createdAt: "2022-01-10" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", status: "Completed", programId: 1, createdAt: "2022-01-12" },
    { id: 3, name: "Alex Brown", email: "alex@example.com", status: "Eliminated", programId: 2, createdAt: "2022-01-15" },
  ];

  return <>
  <DashboardClient programs={programs} candidates={candidates} />;
  <div>{JSON.stringify(session, null, 2)}</div>
  </>
}
