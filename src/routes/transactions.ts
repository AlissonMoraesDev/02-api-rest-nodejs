import { FastifyInstance } from 'fastify'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { knex } from '../database'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

// unitário: unidade da sua aplicação, ou seja, uma função, um método, um módulo, etc
// teste de integração: teste que envolve mais de uma unidade da aplicação, ou seja, mais de uma função, método, módulo, etc
// e2e teste de ponta a ponta: teste que envolve toda a aplicação, ou seja, desde a entrada do usuário até a saída da resposta, passando por todas as camadas da aplicação, como banco de dados, serviços externos, etc

export async function transactionsRoutes(app: FastifyInstance) {
  app.get(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async request => {
      const { sessionId } = request.cookies

      const transactions = await knex('transactions')
        .where('session_id', sessionId)
        .select()

      return { transactions }
    }
  )

  app.get(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async request => {
      const getTransactionParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = getTransactionParamsSchema.parse(request.params)

      const { sessionId } = request.cookies

      const transaction = await knex('transactions')
        .where({ id, session_id: sessionId })
        .first()

      return { transaction }
    }
  )

  app.get(
    '/summary',
    {
      preHandler: [checkSessionIdExists],
    },
    async request => {
      const { sessionId } = request.cookies

      const summary = await knex('transactions')
        .where('session_id', sessionId)
        .sum('amount', { as: 'amount' })
        .first()

      return { summary }
    }
  )

  app.post('/', async (request, reply) => {
    const createTransactionSchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    })

    const { title, amount, type } = createTransactionSchema.parse(request.body)

    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()

      reply.setCookie('sessionId', sessionId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    }

    await knex('transactions').insert({
      id: randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
      session_id: sessionId,
    })

    return reply.status(201).send('Created transaction with success!')
  })
}
