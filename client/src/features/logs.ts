import axios from 'axios'

import { Log } from './logs.types'

export const fetchAllLogs = (): Promise<Log[]> =>
  axios.get('/api/logs').then((response) => response.data.results)
