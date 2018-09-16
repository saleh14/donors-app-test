import faunadb from 'faunadb' /* Import faunaDB sdk */

/* configure faunaDB Client with our secret */
const q = faunadb.query
const client = new faunadb.Client({
  secret: process.env.FAUNADB_SECRET
})

/* export our lambda function as named "handler" export */
exports.handler = (
  event,
  {
    clientContext = {
      identity: {
        url: 'https://ecstatic-swanson-5d844f.netlify.com/.netlify/identity',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1MzYyNDE0MTksInN1YiI6IjAifQ.tvkasN5Uv5tzFnyErIvb0TpC8axp7LyhH9sYJH44rOc'
      },
      user: {
        app_metadata: {
          faunadb_ref: '208067187009651204',
          faundb_ref: '208061570072183299',
          provider: 'email'
        },
        email: 'saleh.mearaj@gmail.com',
        exp: 1536244958,
        sub: '386fe9f6-ee3f-457d-bd5a-64c9c4cca28c',
        user_metadata: { full_name: 'saleh ali' }
      },
      invokeid: 'b88a7aa3-b1da-11e8-8803-33c367bee89e',
      awsRequestId: 'b88a7aa3-b1da-11e8-8803-33c367bee89e',
      invokedFunctionArn: 'arn:aws:lambda:us-east-1:812122390002:function:001fd41cfb82fdefc10aef3e212f8014c591a949f7972a0632af7acd0603caba'
    }
  },
  callback
) => {
  /* parse the string body into a useable JS object */
  const data = JSON.parse(event.body)
  const donors_info = { data }
  if (!clientContext) {
    console.log('Error: user is undefined')
    return callback(null, {
      statusCode: 412,
      body: `{message: "Undefined clientContext=${JSON.stringify(clientContext)}}`
    })
  }
  const { user } = clientContext
  if (!user) {
    console.log('Error: user is undefined')
    return
  }
  if (!user.app_metadata) {
    console.log('Error: user.app_metadata is undefined')
    return
  }

  const { faunadb_ref } = user.app_metadata

  if (faunadb_ref) {
    return client
      .query(q.Update(q.Ref(`classes/donors/${faunadb_ref}`), donors_info))
      .then(response => {
        return callback(null, {
          statusCode: 200,
          body: JSON.stringify(response)
        })
      })
      .catch(error => {
        console.log('error', error)
        /* Error! return the error with statusCode 400 */
        return callback(null, {
          statusCode: 400,
          body: JSON.stringify(error)
        })
      })
  }
  /* construct the fauna query */
  /* Success! return the response with statusCode 200 */
}
