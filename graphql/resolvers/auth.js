const bcrypt = require('bcryptjs');

const User = require('../../models/user');
const jwt = require('jsonwebtoken');


module.exports = {
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
    },
    login: async ({ email, password }) => {
        try {
            const user = await User.findOne({ email: email });
            if (!user) {
                throw new Error('user does not exists');
            }
            var isEqual = await bcrypt.compare(password, user.password);
            if (!isEqual) {
                throw new Error('password is incorrect');
            }
            const token = jwt.sign({ userId: user.id, email: email }, `${process.env.SECERT_KEY}`, {
                expiresIn: '1h'
            });
            return {
                userId: user.id, token: token, tokenExpiration: 1
            };
        } catch (error) {
            throw error;
        }
    }

};