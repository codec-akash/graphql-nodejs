const express = require('express');
const bodyParser = require('body-parser');
const { graphqlHttp, graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Event = require('./models/event');
const User = require('./models/user');

const app = express();

app.use(bodyParser.json());

const user = userid => {
    return User.findById(userid)
        .then(res => {
            return { ...user._doc, _id: user.id };
        })
        .catch(err => {
            throw err;
        })
}

app.use('/graphql', graphqlHTTP({
    schema: buildSchema(`
            type Event {
                _id: ID!
                title: String!
                description: String!
                price: Float!
                date: String!
                creator: User!
            }

            type User {
                _id: ID!
                email: String!
                password: String
                createdEvents: [Event!]
            }

            input EventInput {
                title: String!
                description: String!
                price: Float!
                date: String!
            }

            input UserInput {
                email: String!
                password: String!
            }

            type RootQuery {
                events: [Event!]!
            }
    
            type RootMutation {
                createEvent(eventInput: EventInput): Event
                createUser(userInput: UserInput): User
            }
    
            schema {
                query: RootQuery
                mutation: RootMutation
            }
        `),
    rootValue: {
        events: () => {
            return Event.find()
                .then(result => {
                    return result.map(event => {
                        return {
                            ...event._doc, _id: event.id,
                            creator: user.bind(this, event._doc.creator)
                        };
                    })
                }).catch(err => {
                    console.log(err);
                    throw err;
                })
        },
        createEvent: (args) => {
            const event = new Event({
                title: args.eventInput.title,
                description: args.eventInput.description,
                price: +args.eventInput.price,
                date: new Date(args.eventInput.date),
                creator: '652be9c9a9fdf22ba301127b'
            });
            let createdEvent;
            return event.save().then(
                result => {
                    createdEvent = {
                        ...result._doc, _id: result._doc._id.toString()
                    };
                    return User.findById('652be9c9a9fdf22ba301127b')

                }
            )
                .then(
                    user => {
                        if (!user) {
                            throw new Error('user not found');
                        }
                        user.createdEvents.push(event);
                        return user.save();
                    }
                )
                .then(
                    res => {
                        console.log(res);
                        return createdEvent;
                    }
                )
                .catch(
                    err => {
                        console.log(err);
                        throw err;
                    }
                );
        },
        createUser: (args) => {
            return User.findOne({ email: args.userInput.email }).then(user => {
                if (user) {
                    throw new Error('user exist already');
                }
                return bcrypt.hash(args.userInput.password, 12)
            })
                .then(
                    hashedPassword => {
                        const user = new User({
                            email: args.userInput.email,
                            password: hashedPassword,
                        });
                        return user.save();
                    }
                ).then(res => {
                    return { ...res._doc, password: null, _id: res.id };
                })
                .catch(err => {
                    throw err;
                });


        }
    },
    graphiql: true,
}));

mongoose.connect(`mongodb+srv://akash:${process.env.MONGO_PASSWORD
    }@atlascluster.r4uqmqa.mongodb.net/${process.env.MONGO_DB
    }?retryWrites=true&w=majority`).then(
        () => {
            app.listen(3000);
        }
    ).catch(err => {
        console.log(err);
    });

