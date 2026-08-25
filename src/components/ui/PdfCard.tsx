import { ArrowDown } from 'lucide-react'

interface PdfCardProps {
  titre: string
  href: string
}

export function PdfCard({ titre, href }: PdfCardProps) {
  return (
    <a
      href={href}
      className="group flex items-center justify-between gap-6 rounded-xl border border-sand-200 bg-sand-100 p-6 transition-colors duration-(--d-base) hover:border-clay-500"
    >
      <span>
        <span className="label-caps block text-clay-600">Guide PDF</span>
        <span className="mt-1 block font-display uppercase text-heading-sm text-ink-900">
          {titre}
        </span>
      </span>
      <ArrowDown
        aria-hidden
        className="size-5 shrink-0 text-ink-500 transition-transform duration-(--d-base) ease-expo group-hover:translate-y-1 group-hover:text-clay-500"
      />
    </a>
  )
}
