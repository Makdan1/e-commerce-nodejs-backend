import expressJwt from 'express-jwt';

function authJwt(){
const secret = process.env.secret;
    return expressJwt({
        secret,
        algorithms:['HS256']
    })
}

export default authJwt