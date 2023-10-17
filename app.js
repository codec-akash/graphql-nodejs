const express = require('express');
const bodyParser = require('body-parser');
const { graphqlHttp, graphqlHTTP } = require('express-graphql');
const mongoose = require('mongoose');

const graphqlSchema = require('./graphql/schema/index');
const graphqlResolver = require('./graphql/resolvers/index');

const app = express();


app.use(bodyParser.json());



app.use('/graphql', graphqlHTTP({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
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

