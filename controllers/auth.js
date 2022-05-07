// Node Libs.
import bcrypt from 'bcrypt'
import express from 'express'
import jsonwebtoken from 'jsonwebtoken'

// Etc.
import * as model from '../model.js'
import * as common from '../common.js'

const router = express.Router()

router.post('/register', async (req, res) => {
    const gen = await model.wrapperDBConnSwitcher()
    const tab = model.getDatabaseCollection('users')
    let err = ''

    // 1. Performs validations.
    if (!req.body.userName || !req.body.userEmail || !req.body.userPassword) { // Request body schema validation.
        err = '400 - Malformed Body'

    } else if (!common.validateEmail(req.body.userEmail)) {
        err = '400 - Invalid Email Provided'

    } else {
        const doc = await tab.findOne({ email: req.body.userEmail })

        if (doc && Object.keys(doc).length > 0) {
            err = '400 - User Already Exists'
        }
    }

    // 2. Execute any database command.
    if (!err) {
        const doc = {}

        doc.name = req.body.userName.trim()
        doc.email = req.body.userEmail.trim()
        doc.password = await bcrypt.hash(req.body.userPassword, 10)

        const rep = await tab.insertOne(doc)

        if (rep && rep.insertedId) {
            await gen.next() // Close database connection.

            return res.status(200).json({ userId: rep.insertedId })

        } else {
            err = '500 - Cannot Insert User'
        }
    }

    await gen.next() // Close database connection.

    common.makeErrorResponse(res, err)
})

router.post('/login', async (req, res) => {
    const gen = await model.wrapperDBConnSwitcher()
    const tab = model.getDatabaseCollection('users')
    let doc = {}
    let err = ''

    // 1. Performs validations.
    if (!req.body.userEmail || !req.body.userPassword) { // Request body schema validation.
        err = '400 - Malformed Body'

    } else if (!common.validateEmail(req.body.userEmail)) {
        err = '400 - Invalid Email Provided'

    } else if (!(doc = await tab.findOne({ email: req.body.userEmail })) || Object.keys(doc).length == 0) {
        err = '404 - User Does Not Exists'

    } else if (!(await bcrypt.compare(req.body.userPassword, doc.password))) {
        err = '401 - Incorrect Password'
    }

    // 2. Execute any database command.
    if (!err) {
        const expiration = { expiresIn: '1h' }
        const payload = { userId: doc._id.toString(), userEmail: doc.email }
        const token = jsonwebtoken.sign(payload, process.env.JWT_SECRET, expiration)

        await gen.next() // Close database connection.

        return res.status(200).json({ accessToken: token })
    }

    await gen.next() // Close database connection.

    common.makeErrorResponse(res, err)
})

// Exports.
export default router
