import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

export async function GET() {
  const headers = ["name", "email", "phone", "linkedin", "current_role", "current_company", "years_experience", "resume_url"];
  const example = [
    {
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "+1 555 000 0000",
      linkedin: "https://linkedin.com/in/jane",
      current_role: "Senior Engineer",
      current_company: "Acme Corp",
      years_experience: 5,
      resume_url: "https://drive.google.com/file/...",
    },
    {
      name: "John Doe",
      email: "john@example.com",
      phone: "",
      linkedin: "",
      current_role: "Product Manager",
      current_company: "Beta Inc",
      years_experience: 3,
      resume_url: "",
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(example, { header: headers });

  worksheet["!cols"] = headers.map((h) => ({
    wch: h === "linkedin" || h === "resume_url" ? 40 : h === "name" || h === "email" ? 25 : 18,
  }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Candidates");

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="candidates-template.xlsx"',
    },
  });
}
