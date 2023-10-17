const bcrypt = require('bcryptjs');

const Event = require('../../models/event');
const User = require('../../models/user');


const events = async eventIds => {
    try {
        const events = await Event.find({ _id: { $in: eventIds } });
        return events.map(event => {
            return {
                ...event._doc,
                id: event.id,
                date: new Date(event._doc.date).toISOString(),
                creator: user.bind(this, event.creator)
            };
        });
    } catch (error) {
        throw error;
    }
}

const user = async userid => {
    try {
        const res = await User.findById(userid);
        return {
            ...res._doc,
            _id: res.id,
            createdEvents: events.bind(this, res._doc.createdEvents)
        };
    } catch (err) {
        throw err;
    }
}

module.exports = {
    events: async () => {
        try {
            const events = await Event.find()

            return events.map(event => {
                return {
                    ...event._doc,
                    _id: event.id,
                    date: new Date(event._doc.date).toISOString(),
                    creator: user.bind(this, event._doc.creator)
                };
            })

        } catch (error) {
            throw error;
        }

    },
    createEvent: async (args) => {
        const event = new Event({
            title: args.eventInput.title,
            description: args.eventInput.description,
            price: +args.eventInput.price,
            date: new Date(args.eventInput.date),
            creator: '652be9c9a9fdf22ba301127b'
        });
        let createdEvent;
        try {
            const result = await event.save()
            createdEvent = {
                ...result._doc, _id: result._doc._id.toString(),
                date: new Date(result._doc.date).toISOString(),
                creator: user.bind(this, result._doc.creator),
            };
            const creator = await User.findById('652be9c9a9fdf22ba301127b')
            if (!creator) {
                throw new Error('user not found');
            }
            creator.createdEvents.push(event);
            await creator.save();
            return createdEvent;
        } catch (err) {
            console.log(err);
            throw err;
        }

    },
    createUser: async (args) => {
        try {
            const existingUser = await User.findOne({ email: args.userInput.email });
            if (existingUser) {
                throw new Error('user exist already');
            }
            const hashedPassword = await bcrypt.hash(args.userInput.password, 12)


            const user = new User({
                email: args.userInput.email,
                password: hashedPassword,
            });
            const res = await user.save();


            return { ...res._doc, password: null, _id: res.id };
        } catch (err) {
            throw err;
        }
    }
};