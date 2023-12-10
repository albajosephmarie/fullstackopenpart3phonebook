const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const app = express();
// Define a custom token for morgan to log request body
morgan.token("req-body", (request, response) => JSON.stringify(request.body));
app.use(express.json());
app.use(cors())
// Use Morgan middleware with a custom format
app.use(
  morgan(
    ':method :url :status :res[content-length] - :response-time ms :req-body'
  )
);

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.use(express.static('dist'))

app.get("/", (request, response) => {
  response.send("<h1>Phonebook</h1>");
});

app.get("/info", (request, response) => {
  const info = `<p>Phonebook has info for ${persons.length} people</p>`;
  const currentTime = `<p>${new Date()}</p>`;
  response.send(`${info}${currentTime}`);
});

app.get("/api/persons", (request, response) => {
  response.json(persons);
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((person) => person.id === id);
  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

const generateId = () => {
  // const maxId = persons.length > 0
  //   ? Math.max(...persons.map(person => person.id))
  //   : 0
  // return maxId +1
  const newId = Math.ceil(Math.random() * 100000);
  return newId;
};

app.post("/api/persons", (request, response) => {
  const body = request.body;

  if (!body.name) {
    return response.status(400).json({
      error: "name missing",
    });
  }

  const found = persons.find((person) => person.name === body.name);
  if (found) {
    return response.status(400).json({
      error: "name must be unique",
    });
  }

  if (!body.number) {
    return response.status(400).json({
      error: "number missing",
    });
  }

  const person = {
    name: body.name,
    number: body.number,
    id: generateId(body.id),
  };

  persons = persons.concat(person);

  response.json(person);
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((person) => person.id !== id);
  response.status(204).end();
});

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
