import {client} from 'lib/graphql'
import {gql} from '@apollo/client'

// mock client library

const FETCH_ITEM = gql`
  query FetchItem($id: String!) {
    item(id: $id) {
      title
      description
      thumbnail {
        url
      }
    }
  }
`

export const loadItem = (id) => async (dispatch, getState) => {
  // do the query and state stuff
  dispatch({
    type: 'itempage/request',
    requestedAt: Date.now(),
  })

  try {
    await new Promise((resolve, reject) => {
      setTimeout(() => resolve(true), 3000)
    })
    const result = await client.query({
      query: FETCH_ITEM,
    })
    dispatch({
      type: 'itempage/receive',
      receivedAt: Date.now(),
      result,
    })
  } catch (error) {
    dispatch({
      type: 'itempage/receive',
      receivedAt: Date.now(),
      error,
    })
  }
}

// describe('itempage actions', () => {
//   it('sets fetchign to true when itempage/request is dispatched', () => {
//     store = mockStore.createStore()
//     store.dispatch(loadItem('foo'))

//     expect(store.actions[0].type).toEqual('itempage/request')
//     expect(client.query).calledWith({query: FETCH_ITEM})
//     expect(store.actions[1].type).toEqual('itempage/receie')
//   })
// })
