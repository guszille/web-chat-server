// See https://developer.mozilla.org/en-US/docs/Web/HTTP/Status.
const HTTP_STATUS_CODE = {
    400: 'Bad Request',
    401: 'Unauthorized',
    404: 'Not Find',
    500: 'Internal Server Error'
}

// Reply HTTP error response.
export const makeErrorResponse = (response, error) => {
    const [ statusCode, errorMessage ] = error.split(' - ')
    const defaultMessage = HTTP_STATUS_CODE[parseInt(statusCode)]

    response.status(parseInt(statusCode)).json({ error: `${defaultMessage} - ${errorMessage}` })
}

// Validate an email.
export const validateEmail = (email) => {
    return true
}
