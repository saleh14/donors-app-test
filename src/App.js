import React, { Component } from 'react'
import { css } from 'emotion'
import netlifyIdentity from 'netlify-identity-widget'
import Form from './components/Form/'

const appCss = css`
    direction:rtl;
    margin: auto;
    max-width: 750px;
  `

class App extends Component {
  state = {}

  generateHeaders () {
    const headers = { 'Content-Type': 'application/json' }
    if (netlifyIdentity.currentUser()) {
      return netlifyIdentity.currentUser().jwt().then(token => {
        return { ...headers, Authorization: `Bearer ${token}` }
      })
    }
    return Promise.resolve(headers)
  }

  handleSubmit = (event, fields) => {
    event.preventDefault()
    console.log(fields)

    this.generateHeaders().then(headers => {
      fetch('/.netlify/functions/donors-update', {
        body: JSON.stringify(fields),
        headers,
        method: 'POST'
      })
        .then(response => {
          if (!response.ok) {
            console.log('aww, not ok')
            return
          }
          return response.json()
        })
        .then(data => console.log(data))
        .catch(e => {
          console.log(e)
        })
    })
  }
  componentDidMount () {
    netlifyIdentity.init()
    setTimeout(() => {
      netlifyIdentity.open()
    }, 1000)
    netlifyIdentity.on('login', user => {
      console.log(user)
      const myAuthHeader = `Bearer ${user.token.access_token}`
      fetch('/.netlify/functions/login-create-db-user', {
        headers: { Authorization: myAuthHeader },
        body: {},
        method: 'POST'
      })
        .then(response => {
          if (!response.ok) {
            console.log('aww, not ok')
            return
          }
          return response.json()
        })
        .then(data => console.log(data))
        .catch(e => {
          console.log(e)
        })
      if (user.app_metadata && user.app_metadata.faunadb_ref) {
        fetch(`/.netlify/functions/donors-read/${faunadb_ref}`, {
          headers: { Authorization: myAuthHeader }
        })
          .then(response => {
            if (!response.ok) {
              console.log('aww, not ok')
              return
            }
            return response.json()
          })
          .then(data => console.log(data))
          .catch(e => {
            console.log(e)
          })
      }
    })
  }
  render () {
    return (
      <div className={appCss}>
        <h1>Hello CodeSandbox</h1>
        <h2>Start editing to see some magic happen!</h2>
        <Form onSubmit={this.handleSubmit} />
      </div>
    )
  }
}
export default App
