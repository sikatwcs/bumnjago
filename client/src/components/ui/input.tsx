import * as React from "react"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }