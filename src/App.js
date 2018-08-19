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

  handleSubmit = (event, fields) => {
    event.preventDefault()
    console.log(fields)
    fetch('/.netlify/functions/todos-create', {
      body: JSON.stringify(fields),
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
  }
  componentDidMount () {
    netlifyIdentity.init()
    setTimeout(() => {
      netlifyIdentity.open()
    }, 1000)
    netlifyIdentity.on('login', user => {
      console.log(user)
      fetch('/.netlify/functions/login-create-db-user', {
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
