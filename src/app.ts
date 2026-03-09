import cookie from '@fastify/cookie'
import fastity from 'fastify'
import { transactionsRoutes } from './routes/transactions'

export const app = fastity()

app.register(cookie)

app.register(transactionsRoutes, {
  prefix: 'transactions',
})
