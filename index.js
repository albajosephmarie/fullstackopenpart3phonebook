const express = require('express')
const app = express()
const cors = require('cors')
const morgan = require('morgan')
require('dotenv').config()

const Person = require('./models/person')

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(cors())
app.use(express.json())
// eslint-disable-next-line no-unused-vars
morgan.token('req-body', (request, response) => JSON.stringify(request.body))
app.use(
  morgan(
    ':method :url :status :res[content-length] - :response-time ms :req-body'
  )
)
app.use(express.static('dist'))

app.get('/', (request, response) => {
  response.send('<h1>Phonebook</h1>')
})

app.get('/info', (request, response, next) => {
  Person.countDocuments({})
    .then((count) => {
      const info = `<p>Phonebook has info for ${count} people</p>`
      const currentTime = `<p>${new Date()}</p>`
      response.send(`${info}${currentTime}`)
    })
    .catch((error) => {
      next(error) // Pass the error to the error handler middleware
    })
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch((error) => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  if (body.name === undefined) {
    return response.status(400).json({ error: 'name missing' })
  }

  if (body.number === undefined) {
    return response.status(400).json({ error: 'number missing' })
  }

  // Check if the person with the given name already exists
  Person.findOne({ name: body.name })
    .then((existingPerson) => {
      if (existingPerson) {
        // If the person exists, update the number
        existingPerson.number = body.number
        existingPerson
          .save()
          .then((updatedPerson) => {
            response.json(updatedPerson)
          })
          .catch((error) => next(error))
      } else {
        // If the person doesn't exist, create a new person
        const person = new Person({
          name: body.name,
          number: body.number,
        })

        person
          .save()
          .then((savedPerson) => {
            response.json(savedPerson)
          })
          .catch((error) => next(error))
      }
    })

    .catch((error) => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then((result) => {
      if (result) {
        response.status(204).end()
      } else {
        // If the person with the specified ID is not found
        response.status(404).json({ error: 'Person not found' })
      }
    })
    .catch((error) => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  Person.findByIdAndUpdate(
    request.params.id,
    { name, number },
    {
      new: true,
      runValidators: true,
      context: 'query',
    }
  )
    .then((updatedPerson) => {
      response.json(updatedPerson)
    })
    .catch((error) => next(error))
})

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
