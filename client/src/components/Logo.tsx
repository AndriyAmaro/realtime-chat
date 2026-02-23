import { useId } from 'react'

interface LogoProps {
  size?: number
  className?: string
}

export function Logo({ size = 24, className }: LogoProps) {
  const id = useId()
  const gradientId = `logo-g-${id}`

  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1="2"
          y1="2"
          x2="62"
          y2="58"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#2DD1B1" />
          <stop offset="1" stopColor="#0D7768" />
        </linearGradient>
      </defs>
      <path
        d="M12 2H52A10 10 0 0 1 62 12V32A10 10 0 0 1 52 42H22L10 58L14 42A10 10 0 0 1 2 32V12A10 10 0 0 1 12 2Z"
        fill={`url(#${gradientId})`}
      />
      <polyline
        points="8,22 16,22 20,22 24,8 30,36 34,14 37,22 44,22 56,22"
        stroke="#fff"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
