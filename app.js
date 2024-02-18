const { config } = require('dotenv')
config({ path: '.env' })

const express = require('express')
const { PrismaClient } = require('@prisma/client')
const cors = require('cors')
const prisma = new PrismaClient()
const app = express()
const port = process.env.PORT || 3000

// create an error with .status. we
// can then use the property in our
// custom error handler (Connect respects this prop as well)

const error = (status, msg) => {
    var err = new Error(msg)
    err.status = status
    return err
}

// Use CORS middleware
app.use(cors())

app.use(express.json())
app.use(express.urlencoded())

// if we wanted to supply more than JSON, we could
// use something similar to the content-negotiation
// example.

// here we validate the API key,
// by mounting this middleware to /api
// meaning only paths prefixed with "/api"
// will cause this middleware to be invoked

app.use('/api', (req, res, next) => {
    var key = req.query['api-key']

    // key isn't present
    if (!key) return next(error(400, 'api key required'))

    // key is invalid
    if (apiKeys.indexOf(key) === -1) return next(error(401, 'invalid api key'))

    // all good, store req.key for route access
    req.key = key
    next()
});

// map of valid api keys, typically mapped to
// account info with some sort of database like redis.
// api keys do _not_ serve as authentication, merely to
// track API usage or help prevent malicious behavior etc.

var apiKeys = ['key1', 'key2', 'key3'];

app.get('/', (req, res) => {
    var htmlElement = "<p>"
    htmlElement += "API TEMPLATE EJS (localhost:3000)"
    htmlElement += "</p>"
    htmlElement += "<p>"
    htmlElement += "Developed By : Vince Dale D. Alcantara"
    htmlElement += "</p>"
    htmlElement += "<p>"
    htmlElement += "Version 1.0.0"
    htmlElement += "</p>"

    res.send(htmlElement)
});

// Prisma Examples

app.get('/user_accounts', async (req, res) => {
    const user_accounts = await prisma.UserAccounts.findMany()
    res.json(user_accounts)
})

app.get('/user_accounts/count', async (req, res, next) => {
    if (!req.query) return next(error(400, 'Undefined Query Parameters'))

    var IdNumber = req.query['id_number']
    var FullName = req.query['full_name']
    var Role = req.query['role']

    const user_accounts_count = await prisma.UserAccounts.count({
        where: {
            IdNumber: {
                startsWith: IdNumber
            },
            FullName: {
                startsWith: FullName
            },
            Role: {
                startsWith: Role
            },
        },
    })

    res.json({count: user_accounts_count})
})

app.get('/user_accounts/search', async (req, res, next) => {
    if (!req.query) return next(error(400, 'Undefined Query Parameters'))

    var IdNumber = req.query['id_number']
    var FullName = req.query['full_name']
    var Role = req.query['role']

    const user_accounts = await prisma.UserAccounts.findMany({
        where: {
            IdNumber: {
                startsWith: IdNumber
            },
            FullName: {
                startsWith: FullName
            },
            Role: {
                startsWith: Role
            },
        },
    })

    res.json(user_accounts)
})

app.get('/user_accounts/:id', async (req, res, next) => {
    var Id = parseInt(req.params.id)

    if (!Id) return next(error(400, 'Invalid Url Parameter'))

    const user_account = await prisma.UserAccounts.findUnique({
        where: {
            Id: Id,
        },
    })

    res.json(user_account)
})

app.post('/user_accounts/insert', async (req, res, next) => {
    const { IdNumber, FullName, Username, Password, Section, Role } = req.body

    const user_account = await prisma.UserAccounts.create({
        data: {
            IdNumber: IdNumber,
            FullName: FullName,
            Username: Username,
            Password: Password,
            Section: Section,
            Role: Role
        },
    })

    res.json(user_account)
})

app.post('/user_accounts/update', async (req, res, next) => {
    const { Id, IdNumber, FullName, Username, Password, Section, Role } = req.body

    const user_account = await prisma.UserAccounts.update({
        where: { 
            Id: Id
        },
        data: {
            IdNumber: IdNumber,
            FullName: FullName,
            Username: Username,
            Password: Password,
            Section: Section,
            Role: Role
        },
    })
    
    res.json(user_account)
})

app.post('/user_accounts/delete', async (req, res, next) => {
    const { Id } = req.body

    const user_account = await prisma.UserAccounts.delete({
        where: { 
            Id: Id
        },
    })
    
    res.json(user_account)
})

// middleware with an arity of 4 are considered
// error handling middleware. When you next(err)
// it will be passed through the defined middleware
// in order, but ONLY those with an arity of 4, ignoring
// regular middleware.
app.use((err, req, res, next) => {
    // whatever you want here, feel free to populate
    // properties on `err` to treat it differently in here.
    res.status(err.status || 500)
    res.send({ error: err.message })
});

// our custom JSON 404 middleware. Since it's placed last
// it will be the last middleware called, if all others
// invoke next() and do not respond.
app.use((req, res) => {
    res.status(404);
    res.send({ error: "Sorry, can't find that" })
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})