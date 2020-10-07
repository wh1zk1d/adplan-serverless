const faunadb = require('faunadb')

exports.handler = async (event) => {
  const q = faunadb.query
  const client = new faunadb.Client({
    secret: process.env.FAUNA_SECRET_KEY,
  })

  const { id } = event.queryStringParameters

  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'No ID provided' }),
    }
  }

  const clientDoesExist = await client.query(q.Exists(q.Match(q.Index('client_by_id'), id)))

  if (!clientDoesExist) {
    return {
      statusCode: 404,
      body: JSON.stringify({ message: 'No client with this ID' }),
    }
  }

  const document = await client.query(q.Get(q.Match(q.Index('client_by_id'), id)))

  return {
    statusCode: 200,
    body: JSON.stringify(document.data),
  }
}
