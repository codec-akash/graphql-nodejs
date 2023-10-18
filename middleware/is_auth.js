const jwt = require('jsonwebtoken');


module.exports = (req, res, next) => {
    const authHeader = req.get('Authorization');
    if (!authHeader) {
        req.isAuth = false;
        next();
        return;
    }
    const token = authHeader.split(' ')[1];
    if (!token || token == '') {
        req.isAuth = false;
        next();
        return;
    }
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, `${process.env.SECERT_KEY}`);
    } catch (error) {
        req.isAuth = false;
        next();
        return;
    }

    if (!decodedToken) {
        req.isAuth = false;
        next();
        return;
    }

    req.isAuth = true;
    req.userId = decodedToken.userId;
    next();
}