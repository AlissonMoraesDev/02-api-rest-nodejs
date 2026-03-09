// eslint-disable-next-line
import { Knex } from 'knex' // eslint-disable-line

const knexConfig = Knex

declare module 'knex/types/tables' {
  export interface Tables {
    transactions: {
      id: string
      title: string
      amount: number
      created_at: string
      session_id?: string
    }
  }
}
