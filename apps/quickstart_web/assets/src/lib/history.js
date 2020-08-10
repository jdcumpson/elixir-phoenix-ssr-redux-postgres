import {createBrowserHistory, createMemoryHistory} from 'history'

export default process.env.RUNNING_ON_SERVER
  ? createMemoryHistory()
  : createBrowserHistory()
