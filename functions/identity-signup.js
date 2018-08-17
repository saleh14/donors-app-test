import faunadb from 'faunadb' /* Import faunaDB sdk */

/* configure faunaDB Client with our secret */
const q = faunadb.query
const client = new faunadb.Client({
  secret: process.env.FAUNADB_SECRET
})

/* export our lambda function as named "handler" export */
exports.handler = (event, context, callback) => {
  console.dir(context)
  console.dir(event.body)
  const claims = context.clientContext && context.clientContext.user
  if (!claims) {
    return
  }

  client
    .query(
      q.Create(q.Ref('classes/donors'), { data: { loginEmail: claims.email } })
    )
    .then(response => {
      console.log(response)
      callback(null, { statusCode: 200 })
    })
    .catch(e => {
      console.log(e)
      callback(null, { status: 500, body: `Error: ${e}` })
    })
}
