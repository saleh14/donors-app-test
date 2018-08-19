import fetch from 'node-fetch'
import faunadb from 'faunadb' /* Import faunaDB sdk */

/* configure faunaDB Client with our secret */
const q = faunadb.query
const client = new faunadb.Client({
  secret: process.env.FAUNADB_SECRET
})

console.log('before handler function')

exports.handler = (event, context) => {
  const { user } = JSON.parse(event.body)
  if (!user) {
    console.log('Error: user is undefined')
    return
  }
  if (!user.app_metadata) {
    console.log('Error: user.app_metadata is undefined')
    return
  }

  const { faundb_ref } = user.app_metadata

  if (faundb_ref) {
    console.log('user is already created in faunadb')
  } else {
    const { id, email, created_at } = user
    const { full_name } = user.user_metadata
    const newUser = {
      id,
      loginEmail: email,
      full_name,
      created_at
    }

    client
      .query(q.Create(q.Ref('classes/donors'), { data: newUser }))
      .then(response => {
        console.log(response)
        console.log('data: ', response.data)
        console.log('ref: ', response.ref)
        console.log(JSON.stringify(response.ref, null, 2))
        console.log(response.ref.toString())
        console.log(response.ref.toString().match(/[0-9]+/)[0])
        const refID = ''
        try {
          console.log(response.ref())
          refID = `${response.ref}`.split('/').pop()
          console.log('ref: ', refID)
        } catch (e) {
          console.log('Error unable to get ref')
        }
      })
      .catch(e => {
        console.log(e)
      })
  }
}

function updateUser ({ identity, user }, ref) {
  const userID = user.sub
  const userUrl = `${identity.url}/admin/users/${userID}`
  const adminAuthHeader = 'Bearer ' + identity.token

  try {
    return fetch(userUrl, {
      method: 'PUT',
      headers: { Authorization: adminAuthHeader },
      body: JSON.stringify({ app_metadata: { faundb_ref: ref } })
    })
      .then(response => {
        return response.json()
      })
      .then(data => {
        console.log('Updated a user! 204!')
        console.log(JSON.stringify({ data }))
        return { statusCode: 204 }
      })
      .catch(e => ({ statusCode: 500 }))
  } catch (e) {
    return e
  }
}
/*
const body = {
  event: 'signup',
  instance_id: '4b0fe13b-65ce-4a43-ab98-1b90513b3ee6',
  user: {
    id: '52d16642-3a3a-45c9-8c29-f58fc74c9b62',
    aud: '',
    role: '',
    email: 'salmiraj@ejada.com',
    confirmation_sent_at: '2018-08-19T08:43:29Z',
    app_metadata: { provider: 'email' },
    user_metadata: { full_name: 'saleh ejada' },
    created_at: '2018-08-19T08:43:29Z',
    updated_at: '2018-08-19T08:43:29Z'
  }
}

{ ref: Ref("classes/donors/208047305341796868"),
  class: Ref("classes/donors"),
  ts: 1534668221645274,
  data:
   { loginEmail: 'salmiraj@ejada.com',
     full_name: 'saleh ejada',
     created_at: '2018-08-19T08:43:29Z' } }

     ********* response.body ***********
{ path: '/.netlify/functions/todos-create',
httpMethod: 'POST',
headers:
 { accept: '*\/*' ,
   'accept-encoding': 'br, gzip',
   'accept-language': 'en-US,en;q=0.9,ar;q=0.8',
   connection: 'keep-alive',
   'content-length': '159',
   'content-type': 'text/plain;charset=UTF-8',
   cookie: 'nf_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1MzQ2NzE4MjEsInN1YiI6IjUyZDE2NjQyLTNhM2EtNDVjOS04YzI5LWY1OGZjNzRjOWI2MiIsImVtYWlsIjoic2FsbWlyYWpAZWphZGEuY29tIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwifSwidXNlcl9tZXRhZGF0YSI6eyJmdWxsX25hbWUiOiJzYWxlaCBlamFkYSJ9fQ.AIAkN0upyZEsD_jjrugsIryvJxNRImqBUTIjlAPGI54',
   origin: 'https://ecstatic-swanson-5d844f.netlify.com',
   referer: 'https://ecstatic-swanson-5d844f.netlify.com/',
   'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36',
   via: 'https/2 Netlify[f278883e-c39d-4f74-a6db-bbcbcd60efc6] (ApacheTrafficServer/7.1.2)',
   'x-bb-ab': '0.854208',
   'x-bb-client-request-uuid': 'f278883e-c39d-4f74-a6db-bbcbcd60efc6-343017',
   'x-bb-ip': '37.106.120.150',
   'x-cdn-domain': 'www.bitballoon.com',
   'x-country': 'SA',
   'x-datadog-parent-id': '403558229640960226',
   'x-datadog-trace-id': '4416037179094898851',
   'x-forwarded-for': '37.106.120.150',
   'x-forwarded-proto': 'https',
   'x-language': 'en-US' },
queryStringParameters: {},
body: '{"roles":"","fullName":"صالح المعراج","nationalID":"2323","gender":"male","address":"","postalBox":"","postalCode":"","email":"","contactNumber":""}',
isBase64Encoded: false }

      ******** context **********
{ callbackWaitsForEmptyEventLoop: [Getter/Setter],
  done: [Function: done],
  succeed: [Function: succeed],
  fail: [Function: fail],
  logGroupName: '/aws/lambda/fdea54701f66fc29f193dc58a8b5febe83d0bbb4f098b7b2f7c0f133a5cf7a22',
  logStreamName: '2018/08/19/[$LATEST]e80ec400d96b468085d58e7adc4a7c05',
  functionName: 'fdea54701f66fc29f193dc58a8b5febe83d0bbb4f098b7b2f7c0f133a5cf7a22',
  memoryLimitInMB: '128',
  functionVersion: '$LATEST',
  getRemainingTimeInMillis: [Function: getRemainingTimeInMillis],
  clientContext:
   { identity:
      { url: 'https://ecstatic-swanson-5d844f.netlify.com/.netlify/identity',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1MzQ2Njk4MDYsInN1YiI6IjAifQ.gcPheScQHA5w20XHI_p3gklQegm8UFMRoxazSeOyYSE' } },
  invokeid: '86ae237a-a38f-11e8-8d75-f1281dc30d8b',
  awsRequestId: '86ae237a-a38f-11e8-8d75-f1281dc30d8b',
  invokedFunctionArn: 'arn:aws:lambda:us-east-1:812122390002:function:fdea54701f66fc29f193dc58a8b5febe83d0bbb4f098b7b2f7c0f133a5cf7a22' }

      ************** faunadb response ***********
{
  ref: { '@ref': 'classes/donors/207893435024146948' },
  class: { '@ref': 'classes/donors' },
  ts: 1534670275594903,
  data: {
    loginEmail: 'saleh.mearaj@gmail.com',
    full_name: 'saleh ali',
    created_at: '2018-08-17T15:57:15Z',
    roles: '',
    fullName: 'صالح المعراج',
    nationalID: '2323',
    gender: 'male',
    address: '',
    postalBox: '',
    postalCode: '1123456',
    email: '',
    contactNumber: ''
  }
}

 */
