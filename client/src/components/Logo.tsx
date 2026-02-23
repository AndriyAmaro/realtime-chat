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
          x1="4"
          y1="4"
          x2="60"
          y2="56"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#2DD1B1" />
          <stop offset="1" stopColor="#0D7768" />
        </linearGradient>
      </defs>
      <path
        d="M14 4H50A10 10 0 0 1 60 14V30A10 10 0 0 1 50 40H22L10 56L14 40A10 10 0 0 1 4 30V14A10 10 0 0 1 14 4Z"
        fill={`url(#${gradientId})`}
      />
      <polyline
        points="10,22 18,22 22,22 26,10 30,34 34,16 37,22 44,22 54,22"
        stroke="#fff"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
