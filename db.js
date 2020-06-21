import mysql from 'serverless-mysql'

const db = mysql({
  config: {
    host: 'localhost',
    database: 'routine_app',
    user: 'cleiton',
    password: 'ctc363320'
  }
})

export async function query(query) {
  try {
    const results = await db.query(query)
    await db.end()
    return results
  } catch (error) {
    return { error }
  }
}