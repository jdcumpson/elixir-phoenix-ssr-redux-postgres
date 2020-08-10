import {ExpansionPanelActions} from '@material-ui/core'

const DEFAULT_STATE = {
  fetching: false,
}

const reducer = (state = DEFAULT_STATE, action) => {
  switch (action.type) {
    case 'itempage/request': {
      return {
        ...state,
        fetching: true,
      }
    }
    case 'itempage/receive': {
      return {
        ...state,
        fetching: false,
      }
    }
    default:
      return state
  }
}
export default reducer

// describe('itemreducer', () => {
//   it('sets fetchign to true when itempage/request is dispatched', () => {
//     const defaultState = {
//       fetching: false,
//     }
//     const action = {
//       type: 'itempage/request',
//     }
//     expect(reducer(defaultState, action)).toEqual({
//       fetching: true,
//     })
//   })
// })
