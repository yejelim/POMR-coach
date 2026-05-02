import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createCaseAction } from "@/app/cases/actions";
import { genericTemplate } from "@/config/templates/generic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function NewCasePage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-4 py-5">
        <div className="mx-auto max-w-3xl">
          <Button asChild variant="ghost" size="sm" className="mb-3 px-0">
            <Link href="/cases">
              <ArrowLeft className="h-4 w-4" />
              Cases
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold text-slate-950">New anonymous case</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Do not enter patient identifiers. Use a case label such as “GI obstructive jaundice practice”.
          </p>
        </div>
      </header>
      <section className="mx-auto max-w-3xl px-4 py-6">
        <form action={createCaseAction} className="space-y-4 rounded-lg border border-slate-200 bg-white p-5">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Title</span>
            <Input name="title" required placeholder="Anonymous case label" />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Department</span>
            <Select name="department" defaultValue="General">
              {genericTemplate.departments.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </Select>
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Tags</span>
            <Input name="tags" placeholder="GI, jaundice, ERCP" />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Short summary</span>
            <Textarea name="summary" rows={4} placeholder="One-line anonymous case summary" />
          </label>
          <Button type="submit">Create case</Button>
        </form>
      </section>
    </main>
  );
}
