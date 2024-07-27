// In the name of God
import { validationResult } from 'express-validator';

const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {
    // Build your resulting errors however you want! String, object, whatever - it works!
    return `${location}[${param}]: ${msg}`;
};

export async function checkValidation(req, res, next) {
    const result = validationResult(req).formatWith(errorFormatter);
    if (!result.isEmpty()) {
        // Response will contain something like
        // { errors: [ "body[password]: must be at least 10 chars long" ] }
        return res.status(400)
            .send({ errors: result.array() });
    }
    next();
}
