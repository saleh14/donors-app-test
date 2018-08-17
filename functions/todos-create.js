import faunadb from 'faunadb' /* Import faunaDB sdk */

/* configure faunaDB Client with our secret */
const q = faunadb.query
const client = new faunadb.Client({
  secret: process.env.FAUNADB_SECRET
})

/* export our lambda function as named "handler" export */
exports.handler = (event, context, callback) => {
  /* parse the string body into a useable JS object */
  console.log(context, '************\n\n')
  console.log(event, '************\n\n', event.body)
  const data = JSON.parse(event.body)
  console.log('Function `todo-create` invoked', data)
  const donors_info = { data }
  /* construct the fauna query */
  return client
    .query(
      q.Paginate(
        q.Match(
          q.Ref('indexes/get_unique_by_login_email'),
          'saleh.mearaj@gmail.com'
        )
      )
    )
    .then(response => {
      console.log('success', response)
      /* Success! return the response with statusCode 200 */
      console.log(response.body, `******* \n ${response.data}`)
      const refID = `${response.data}`.split('/').pop()

      return client
        .query(q.Update(q.Ref(`classes/donors/${refID}`), donors_info))
        .then(response => {
          return callback(null, {
            statusCode: 200,
            body: JSON.stringify(response)
          })
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
