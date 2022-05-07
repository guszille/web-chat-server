// Node Libs.
import dotenv from 'dotenv'
import jsonwebtoken from 'jsonwebtoken'

// Enable .env configuration.
dotenv.config()

// Etc.
import * as common from '../common.js'

export const verifyAccessToken = (req, res, next) => {
    const token = req.get('authorization')
    let err = ''

    if (!token) {
        err = '403 - Access Token Not Provided'
    }

    try {
        const credentials = jsonwebtoken.verify(token, process.env.JWT_SECRET)

        req.credentials = credentials

        return next()

    } catch(exception) {
        err = '401 - Invalid Token'
    }

    common.makeErrorResponse(res, err)
}
