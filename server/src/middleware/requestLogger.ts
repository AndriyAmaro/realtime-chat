import morgan from 'morgan'
import { env } from '../config/env.js'

export const requestLogger = env.NODE_ENV === 'production' ? morgan('combined') : morgan('dev')
