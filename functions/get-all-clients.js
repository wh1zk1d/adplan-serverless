const faunadb = require('faunadb')

function auth(req) {
  let token = req.headers['authorization']

  if (!token) {
    return false
  }

  if (token.startsWith('Bearer ')) {
    token = token.slice(7, token.length)
  } else {
    return false
  }

  if (token === process.env.REACT_APP_BEARER) {
    return true
  } else {
    return false
  }
}

exports.handler = async (event) => {
  if (auth(event)) {
    const q = faunadb.query
    const client = new faunadb.Client({
      secret: process.env.FAUNA_SECRET_KEY,
    })

    const documents = await client.query(
      q.Map(
        q.Paginate(q.Documents(q.Collection('clients'))),
        q.Lambda((x) => q.Get(x))
      )
    )

    const allClients = await documents.data.map((document) => document.data)

    return {
      statusCode: 200,
      body: JSON.stringify({ clients: allClients }),
    }
  } else {
    return {
      statusCode: 403,
      body: JSON.stringify({ message: 'Unauthorized' }),
    }
  }
}
