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

  createNewUser () {
    this.generateHeaders().then(headers => {
      fetch('/.netlify/functions/login-create-db-user', {
        headers
      })
        .then(response => {
          console.log(response)
          console.dir(response)
          if (!response.ok) {
            console.log('aww, not ok')
            return
          }
          try {
            return response.json()
          } catch (e) {
            console.log(e)
            return response.text()
          }
        })
        .then(data => {
          if (data) {
            console.log(data)
            if (data.app_metadata) {
              const localStorageRef = localStorage.getItem('gotrue.user')
              if (localStorageRef) {
                localStorage.setItem('gotrue.user', JSON.stringify(data))
              }
            }
          }
        })
        .catch(e => {
          console.log(e)
        })
    })
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
    netlifyIdentity.init()
    setTimeout(() => {
      netlifyIdentity.open()
    }, 1000)

    console.log(netlifyIdentity, netlifyIdentity.currentUser())

    if (netlifyIdentity.currentUser()) {
      this.setState({ login: true })
    }

    netlifyIdentity.on('login', user => {
      this.setState({ login: true })
    })

    netlifyIdentity.on('logout', user => {
      this.setState({ login: false })
    })
  }
  render () {
    const { login } = this.state
    return (
      <div className={appCss}>
        <h1>Hello CodeSandbox</h1>
        <h2>Start editing to see some magic happen!</h2>
        {login &&
          <div>
            <Async promise={this.createNewUser()} />
            <Async
              promise={this.fetchUserData()}
              then={fetched => (
                <Form fetchedFields={fetched} onSubmit={this.handleSubmit} />
              )}
            />
          </div>}

      </div>
    )
  }
}
export default App
