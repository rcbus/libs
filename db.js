import mysql from 'serverless-mysql'

const db = mysql({
  config: {
    host: process.env.dbHost,
    database: process.env.dbName,
    user: process.env.dbUser,
    password: process.env.dbPass
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