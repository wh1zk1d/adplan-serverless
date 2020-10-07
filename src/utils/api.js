import axios from 'axios'

const instance = axios.create({
  baseURL: '/.netlify/functions',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.REACT_APP_BEARER}`,
  },
})

export default instance
