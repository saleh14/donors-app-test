import faunadb from 'faunadb' /* Import faunaDB sdk */

/* configure faunaDB Client with our secret */
const q = faunadb.query
const client = new faunadb.Client({
  secret: process.env.FAUNADB_SECRET
})

/* export our lambda function as named "handler" export */
exports.handler = (event, context, callback) => {
  /* parse the string body into a useable JS object */
  const data = JSON.parse(event.body)
  const donors_info = { data }
  const { user } = context.clientContext
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
