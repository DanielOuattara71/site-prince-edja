import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

const BASE_FIELD =
  'w-full rounded-lg border border-sand-200 bg-transparent px-4 py-3 text-body text-ink-900 placeholder:text-ink-300 transition-colors duration-(--d-fast) focus:border-clay-500 focus:outline-none'

interface FieldWrapProps {
  label: string
  htmlFor: string
  children: import('react').ReactNode
}

function FieldWrap({ label, htmlFor, children }: FieldWrapProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="label-caps text-ink-500">
        {label}
      </label>
      {children}
    </div>
  )
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  id: string
}

export function Input({ label, id, className, ...props }: InputProps) {
  return (
    <FieldWrap label={label} htmlFor={id}>
      <input id={id} name={id} className={cn(BASE_FIELD, className)} {...props} />
    </FieldWrap>
  )
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  id: string
}

export function Textarea({ label, id, className, rows = 5, ...props }: TextareaProps) {
  return (
    <FieldWrap label={label} htmlFor={id}>
      <textarea id={id} name={id} rows={rows} className={cn(BASE_FIELD, className)} {...props} />
    </FieldWrap>
  )
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  id: string
  options: string[]
}

export function Select({ label, id, options, className, ...props }: SelectProps) {
  return (
    <FieldWrap label={label} htmlFor={id}>
      <select id={id} name={id} className={cn(BASE_FIELD, 'cursor-pointer', className)} {...props}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </FieldWrap>
  )
}
