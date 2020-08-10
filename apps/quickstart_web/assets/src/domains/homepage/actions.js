import {gql} from '@apollo/client'
import {client} from 'lib/graphql'

const FETCH_HOMEPAGE = gql`
  query FetchHomepage {
    
  }
`

export const fetchHomepage = () => async (dispatch, getState) => {
  dispatch({
    type: 'homepage/request',
    requestedAt: Date.now(),
  })

  try {
    const result = await client.query({
      query: FETCH_HOMEPAGE,
    })
  } catch (error) {
    // what do?
  }
  dispatch({
    type: 'homepage/receive',
    receivedAt: Date.now(),
  })
}
