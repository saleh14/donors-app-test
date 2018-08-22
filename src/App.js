import React, { Component } from 'react'
import { css } from 'emotion'
import netlifyIdentity from 'netlify-identity-widget'
import Async from 'react-promise'
import Form from './components/Form/'

const appCss = css`
    direction:rtl;
    margin: auto;
    max-width: 750px;
  `

class App extends Component {
  state = { login: false }

  generateHeaders () {
    const headers = { 'Content-Type': 'application/json' }
    if (netlifyIdentity.currentUser()) {
      return netlifyIdentity.currentUser().jwt().then(token => {
        return { ...headers, Authorization: `Bearer ${token}` }
      })
    }
    return Promise.resolve(headers)
  }

  fetchUserData () {
    const user = netlifyIdentity.currentUser()
    if (user) {
      if (user.app_metadata && user.app_metadata.faunadb_ref) {
        const { faunadb_ref } = user.app_metadata
        const myAuthHeader = `Bearer ${user.token.access_token}`
        return fetch(`/.netlify/functions/donors-read/${faunadb_ref}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: myAuthHeader
          }
        })
          .then(response => {
            if (!response.ok) {
              console.log('aww, not ok')
              return Promise.resolve({})
            }
            return response.json()
          })
          .catch(e => {
            console.log(e)
            return Promise.resolve({})
          })
      }
    }
    return Promise.resolve({})
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
    setTimeout(() => {
      netlifyIdentity.open()
    }, 1000)
    netlifyIdentity.on('login', user => {
      this.setState({ login: true })
      console.log(user)
      const myAuthHeader = `Bearer ${user.token.access_token}`
      fetch('/.netlify/functions/login-create-db-user', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: myAuthHeader
        }
      })
        .then(response => {
          if (!response.ok) {
            console.log('aww, not ok')
            return
          }
          this.forceUpdate()
          return response.json()
        })
        .then(data => {
          console.log(data)
        })
        .catch(e => {
          console.log(e)
        })
    })
  }
  render () {
    const { login } = this.state
    return (
      <div className={appCss}>
        <h1>Hello CodeSandbox</h1>
        <h2>Start editing to see some magic happen!</h2>
        {login &&
          <Async
            before={netlifyIdentity.init()}
            promise={this.fetchUserData()}
            then={fetched => (
              <Form fetchedFields={fetched} onSubmit={this.handleSubmit} />
            )}
          />}

      </div>
    )
  }
}
export default App
