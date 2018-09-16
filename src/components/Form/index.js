import React from 'react'
import TextFields from './TextFields'
import { css } from 'emotion'

export default class Form extends React.Component {
  constructor (props) {
    super(props)
    const state = {
      roles: '',
      fullName: '',
      nationalID: '',
      gender: '',
      address: '',
      postalBox: '',
      postalCode: '',
      email: '',
      contactNumber: ''
    }
    const { fetchedFields } = props
    console.log(fetchedFields)
    if (fetchedFields && fetchedFields.data) {
      this.state = { ...state, ...fetchedFields.data }
    } else {
      this.state = state
    }
  }

  handleChange = event => {
    const { value, name } = event.target
    this.setState({ [name]: value })
  }
  /*
  * Form responsible for:
  * pass values / handle change
  *
  * App responsible for:
  * pass values / handle submition
  *
  */

  render () {
    return (
      <form
        onSubmit={e => {
          this.props.onSubmit(e, this.state)
        }}
      >
        <TextFields values={this.state} onChange={this.handleChange} />
        <p>
          <button
            className={css`
          font-size: 1.5em;
          padding: 6px 8px;
          border: solid #cccffd;
          background-color: #ccdffd;
          `}
            type='submit'
          >
            {' '}submit{' '}
          </button>
        </p>
        {JSON.stringify(this.state, null, 2)}
      </form>
    )
  }
}
