import React from 'react'
import {useSelector, useDispatch} from 'react-redux'

import {loadItem} from 'domains/itempage/actions'

export default () => {
  const id = useSelector((state) => state.page.params.id)
  const {fetching} = useSelector((state) => state.item)
  const dispatch = useDispatch()

  React.useEffect(() => {
    dispatch(loadItem(id))
  }, [id])

  return (
    <div>
      <div>item id={id} </div>
      <div>item is fetching? ={fetching ? 'yes' : ' no'} </div>
    </div>
  )
}

// it('renders with loading states', () => {
//   const store = createStore({
//     item: {
//       fetching: true,
//     },
//   })
//   const tree = shallow(
//     <Provider store={store}>
//       <ItemPage />
//     </Provider>,
//   )
//   expect(tree.find('item is fetching? = yes')).toBeTrue()
// })
