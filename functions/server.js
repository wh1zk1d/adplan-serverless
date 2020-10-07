const faunadb = require('faunadb')
const serverless = require('serverless-http')
const express = require('express')
const app = express()

const router = express.Router()

// Authentication middleware
const auth = (req, res, next) => {
  let token = req.headers['authorization']

  const handleError = () => {
    return res.status(403).json({ message: 'Unauthorized' })
  }

  if (!token) {
    handleError()
    return
  }

  if (token.startsWith('Bearer ')) {
    token = token.slice(7, token.length)
  } else {
    handleError()
  }

  if (token === process.env.REACT_APP_BEARER) {
    next()
  } else {
    handleError()
  }
}

// Use auth middleware
router.use(auth)

// Routes

// GET: all clients
router.get('/clients', async (req, res) => {
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
  res.status(200).json({ clients: allClients })
})

// GET: single client
router.get('/clients/:id', async (req, res) => {
  const q = faunadb.query
  const client = new faunadb.Client({
    secret: process.env.FAUNA_SECRET_KEY,
  })

  const id = req.params.id

  const clientDoesExist = await client.query(q.Exists(q.Match(q.Index('client_by_id'), id)))
  if (clientDoesExist) {
    const document = await client.query(q.Get(q.Match(q.Index('client_by_id'), id)))
    res.status(200).json(document.data)
  } else {
    res.status(404).json({ message: 'No client with this ID' })
  }
})

// Set base URL
app.use('/.netlify/functions/server', router)

module.exports.handler = serverless(app)
