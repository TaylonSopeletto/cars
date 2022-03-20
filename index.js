const express = require('express')
const { buildSchema } = require('graphql')
const { graphqlHTTP } = require('express-graphql')
const jwt = require('jsonwebtoken')

const { Pool } = require("pg")

const connectionString = 'postgresql://postgres:123@localhost:5432/cars'

const pool = new Pool({
    connectionString
})

const cars = [
    {
        id: 1,
        name: "ferrari",
        price: 1999
    },
    {
        id: 2,
        name: "Bmw",
        price: 2000
    }
]

const schema = buildSchema(`
    type Car{
        id: String,
        name: String,
        price: Int
    }

    type Query{
        cars: [Car]
        car(id: Int): Car
    }

    type Mutation{
        addCar(id: Int, name: String, price: Int): Car
        login(username: String, password: String): String
    }
`)

const users = [
    {
        id: 1,
        username: 'Taylon',
        password: '123'
    }
]

const auth = (token) => {
    const verified = jwt.verify(token.split(' ')[1], 'secret')
    if (verified) {
        return true
    } else {
        return false
    }
}

const root = {
    async cars(_, context) {
        const result = await pool.query('select * from car')

        return result.rows

    },

    car(args) {
        return cars.find(item => item.id === args.id)
    },

    login(args) {
        const result = users.find(item => item.username === args.username && item.password === args.password)
        if (result) {
            const token = jwt.sign({ id: result.id }, 'secret')

            return token
        } else {
            return 'user not logged'
        }
    },

    addCar(args) {
        cars.push({
            id: args.id,
            name: args.name,
            price: args.price
        })

        return {
            id: args.id,
            name: args.name,
            price: args.price
        }
    }
}

const app = express()
app.use('/graphql', graphqlHTTP(req => {
    return {
        context: req.headers,
        schema,
        rootValue: root,
        graphiql: true
    }
}))

app.listen(3000, () => {
    console.log('http://localhost:3000/graphql')
})