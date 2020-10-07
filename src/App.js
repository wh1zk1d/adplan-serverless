import React from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'

import PrivateRoute from './components/PrivateRoute'

import Loading from './components/Loading'
import Clients from './components/views/AllClients'
import AddClient from './components/views/AddClient'
import EditClient from './components/views/EditClient'
import Layout from './components/ui/Layout'

import './App.css'

const App = () => {
  const { isLoading, error } = useAuth0()

  if (error) {
    return <div>Oops... {error.message}</div>
  }

  if (isLoading) {
    return <Loading />
  }

  return (
    <Layout>
      <Switch>
        <PrivateRoute exact path='/dashboard' component={Clients} />
        <PrivateRoute exact path='/add' component={AddClient} />
        <PrivateRoute exact path='/edit/:id' component={EditClient} />
        <Route path='*'>
          <Redirect to='/dashboard' />
        </Route>
      </Switch>
    </Layout>
  )
}

export default App
