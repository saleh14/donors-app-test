import faunadb from 'faunadb' /* Import faunaDB sdk */

/* configure faunaDB Client with our secret */
const q = faunadb.query
const client = new faunadb.Client({
  secret: process.env.FAUNADB_SECRET
})

/* export our lambda function as named "handler" export */
exports.handler = (event, context) => {
  // console.log(context)
  // console.log(event, event.body)
  const { user } = JSON.parse(event.body)
  console.log(user)

  if (!user) {
    console.log('Error: user is undefined')
    return
  }
  const { email, created_at, user_metadata } = user
  const { full_name } = user_metadata

  if (!email) {
    console.log('Error: email is undefined')
    return
  }

  const newUser = {
    loginEmail: email,
    full_name,
    created_at
  }
  client
    .query(q.Create(q.Ref('classes/donors'), { data: newUser }))
    .then(response => {
      console.log(response)
    })
    .catch(e => {
      console.log(e)
    })
}
