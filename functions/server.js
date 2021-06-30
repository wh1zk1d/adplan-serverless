const faunadb = require('faunadb')
const serverless = require('serverless-http')
const { nanoid } = require('nanoid')
const nodemailer = require('nodemailer')
const express = require('express')
const app = express()
const { DateTime } = require('luxon')

// Enable JSON and URL encoded body parsing
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const router = express.Router()

// Authentication middleware
const auth = (req, res, next) => {
  let token = req.headers['authorization']

  const handleError = () => {
    return res.status(403).json({ error: 'Unauthorized' })
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

const getAllClients = async () => {
  const q = faunadb.query
  const client = new faunadb.Client({
    secret: process.env.FAUNA_SECRET_KEY,
  })

  const clientDocs = await client.query(
    q.Map(
      q.Paginate(q.Documents(q.Collection('clients'))),
      q.Lambda(x => q.Get(x))
    )
  )

  const allClients = await clientDocs.data.map(document => document.data)

  return allClients
}

const getMailRecipients = async () => {
  const q = faunadb.query
  const client = new faunadb.Client({
    secret: process.env.FAUNA_SECRET_KEY,
  })

  const settings = await client.query(
    q.Map(
      q.Paginate(q.Documents(q.Collection('settings'))),
      q.Lambda(x => q.Get(x))
    )
  )

  const recipients = await settings.data.map(document => document.data.recipients)[0]

  return recipients
}

// Get weekly clips
const getClips = async manual => {
  // Current date
  const today = new Date().toISOString().slice(0, 10)

  // Get week number
  const q = faunadb.query
  const client = new faunadb.Client({
    secret: process.env.FAUNA_SECRET_KEY,
  })

  const settings = await client.query(
    q.Map(
      q.Paginate(q.Documents(q.Collection('settings'))),
      q.Lambda(x => q.Get(x))
    )
  )

  const week = await JSON.parse(settings.data.map(document => document.data.weekCount)[0])

  // Get all clients
  const allClients = await getAllClients()

  // Filter out inactive & not started ones
  const validClients = allClients.filter(client => {
    if (!client.active) return false

    if (client.startDate <= today && !client.endDate) {
      return client
    } else if (client.startDate <= today && client.endDate > today) {
      return client
    } else {
      return false
    }
  })

  // Filter clients for the week
  // Filter function
  const filterByWeek = week => {
    let clients

    if (week === 1) {
      clients = validClients.filter(client => {
        if (client.isPartOfGroup && client.weekRhythm === 'b') {
          return false
        }

        return client
      })

      return clients
    }

    if (week === 2) {
      // 75% & 100%
      clients = validClients.filter(client => parseInt(client.coverage) > 2)

      // 50%, part of a group and B week
      clients = [
        ...clients,
        validClients.filter(
          client => client.coverage === '2' && client.isPartOfGroup && client.weekRhythm === 'b'
        ),
      ]

      return clients.flat()
    }

    if (week === 3) {
      // 50%, 75%, 100%
      clients = validClients.filter(client => {
        if (client.coverage === '2') {
          if (!client.isPartOfGroup || (client.isPartOfGroup && client.weekRhythm === 'a')) {
            return client
          }
        }

        if (parseInt(client.coverage) > 2) return client

        return false
      })

      return clients
    }

    if (week === 4) {
      // 100%
      clients = validClients.filter(client => client.coverage === '4')

      // 50%, part of a group and B week
      clients = [
        ...clients,
        validClients.filter(
          client => client.coverage === '2' && client.isPartOfGroup && client.weekRhythm === 'b'
        ),
      ]

      return clients.flat()
    }
  }

  const weekClients = filterByWeek(week)

  if (!manual) {
    // Increment week counter
    let newWeek

    if (week === 4) {
      newWeek = 1
    } else {
      newWeek = week + 1
    }

    try {
      await client.query(
        q.Update(q.Ref(q.Collection('settings'), '281194700236390917'), {
          data: { weekCount: newWeek.toString() },
        })
      )
      return { week, weekClients }
    } catch (error) {
      console.log(error.toString())
      return false
    }
  } else {
    return { week, weekClients }
  }
}

// Get current calendar week
const getCalendarWeek = () => {
  // const today = new Date()
  // const firstDayOfYear = new Date(today.getFullYear(), 0, 1)
  // const pastDaysOfYear = (today - firstDayOfYear) / 86400000
  // return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
  const weekNumber = DateTime.now().weekNumber
  return weekNumber
}

// Send mail report
const sendMail = async clients => {
  const cw = getCalendarWeek()
  const recipients = await getMailRecipients()

  let transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PW,
    },
  })

  const list = clients
    .filter(client => !client.onlyFoyer)
    .map(client => {
      if (client.foyer) {
        return `<li>${client.name} (auch im Foyer)</li>`
      }
      return `<li>${client.name}</li>`
    })
    .join('')

  const foyerList = clients
    .filter(client => client.onlyFoyer)
    .map(client => `<li>${client.name}</li>`)
    .join('')

  let recipient

  if (process.env.MODE === 'dev') {
    recipient = 'jannik.baranczyk@gmail.com'
  } else {
    recipient = recipients.join(',')
  }

  let info = await transporter.sendMail({
    from: '"adplan 🍿" <kinowerbung@audicture.de>',
    to: recipient,
    subject: `Kinowerbung für KW ${cw}`,
    html: `<h2>Kinowerbung KW ${cw}</h2><ul>${list}</ul><br /><h3>Nur Foyer</h3> ${
      foyerList.length > 0 ? `<ul>${foyerList}</ul>` : 'Keine'
    }`,
  })

  console.log('Message sent: %s', info.messageId)
}

// Use auth middleware
router.use(auth)

// Routes
// GET: all clients
router.get('/client', async (req, res) => {
  const allClients = await getAllClients()
  res.status(200).json({ clients: allClients })
})

// GET: single client
router.get('/client/:id', async (req, res) => {
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

// POST: add a client
router.post('/client', async (req, res) => {
  // Grab data from request body
  let data = req.body

  // Add ID
  data.id = nanoid()

  // Save user to FaunaDB
  const q = faunadb.query
  const client = new faunadb.Client({
    secret: process.env.FAUNA_SECRET_KEY,
  })

  try {
    await client.query(
      q.Create(q.Collection('clients'), {
        data: data,
      })
    )
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }

  // Send feedback back to client
  res.status(200).json({ message: 'Successfully added user' })
})

// PUT: Update a client
router.put('/client/:id', async (req, res) => {
  // Grab user data from request body
  const data = req.body
  const id = req.params.id

  // Find & update user in DB
  const q = faunadb.query
  const client = new faunadb.Client({
    secret: process.env.FAUNA_SECRET_KEY,
  })

  try {
    await client.query(
      q.Update(q.Select('ref', q.Get(q.Match(q.Index('client_by_id'), id))), { data })
    )
    res.status(200).json({ message: 'Successfully updated user' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// DELETE: Delete a client
router.delete('/client/:id', async (req, res) => {
  const id = req.params.id

  const q = faunadb.query
  const client = new faunadb.Client({
    secret: process.env.FAUNA_SECRET_KEY,
  })

  try {
    await client.query(q.Delete(q.Select('ref', q.Get(q.Match(q.Index('client_by_id'), id)))))
    res.status(200).json({ message: 'Successfully updated user' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get clips for week
router.get('/clips', async (req, res) => {
  const isManualRequest = req.query.manual || false

  const { week, weekClients } = await getClips(isManualRequest)

  const clients = weekClients.map(client => {
    return { name: client.name, foyer: client.showInFoyer, onlyFoyer: client.onlyFoyer }
  })

  try {
    await sendMail(clients)
  } catch (error) {
    return res.status(500).json({ error: error.toString() })
  }

  res.status(200).json({ week: week, clips: clients })
})

// Get all mail recipients
router.get('/recipient', async (req, res) => {
  try {
    const recipients = await getMailRecipients()
    res.status(200).json({ recipients: recipients })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Update mail recipients
router.put('/recipient', async (req, res) => {
  const data = req.body

  if (!data) {
    return res.status(400).json({ msg: 'Missing body' })
  }

  const q = faunadb.query
  const client = new faunadb.Client({
    secret: process.env.FAUNA_SECRET_KEY,
  })

  try {
    await client.query(
      q.Update(q.Ref(q.Collection('settings'), '281194700236390917'), {
        data: { recipients: data },
      })
    )
    res.status(200).json({ msg: 'Updated recipients' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Set base URL
app.use('/.netlify/functions/server', router)

module.exports.handler = serverless(app)
