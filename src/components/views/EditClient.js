import React, { useState } from 'react'
import { useFormik } from 'formik'
import API from '../../utils/api'
import { useHistory } from 'react-router-dom'

import Form from 'react-bootstrap/Form'
import Col from 'react-bootstrap/Col'
import InputGroup from 'react-bootstrap/InputGroup'
import Button from 'react-bootstrap/Button'
import Alert from 'react-bootstrap/Alert'
import Headline from '../ui/Headline'

const EditClient = (props) => {
  const id = props.match.params.id
  const [client] = useState(props.location.state.client)
  const [error, setError] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [deleted, setDeleted] = useState(false)

  const history = useHistory()

  const onDelete = async () => {
    if (window.confirm(`Soll ${client.name} wirklich gelöscht werden?`)) {
      setSubmitting(true)
      try {
        await API.delete(`/clients/${id}`)
        setError(false)
        setDeleted(true)
      } catch {
        setError(true)
        setDeleted(false)
      }
      setSubmitting(false)

      setTimeout(() => {
        history.push('/dashboard')
      }, 1000)
    }
  }

  // Initialize Formik with values
  const formik = useFormik({
    initialValues: {
      active: client.active,
      name: client.name,
      cycle: client.cycle,
      spotLength: client.spotLength,
      showInFoyer: client.showInFoyer,
      startDate: client.startDate,
      endDate: client.endDate,
      costs: client.costs,
      contract: client.contract,
    },
    onSubmit: async (values) => {
      setSubmitting(true)
      try {
        await API.put(`/clients/${id}`, JSON.stringify(values))
        setError(false)
        setSubmitted(true)
      } catch {
        setError(true)
        setSubmitted(false)
      }
      setSubmitting(false)
    },
  })

  if (deleted) {
    return (
      <Alert variant='warning' className='mt-4'>
        Kunde wurde gelöscht!
      </Alert>
    )
  }

  return (
    <div>
      <Headline>Kunde bearbeiten</Headline>

      <Form onSubmit={formik.handleSubmit}>
        <Form.Row>
          <Form.Group controlId='name' as={Col} md='4'>
            <Form.Label>Kunde</Form.Label>
            <Form.Control
              type='text'
              placeholder='Name'
              onChange={formik.handleChange}
              value={formik.values.name}
            />
          </Form.Group>

          <Form.Group controlId='coverage' as={Col} md='4'>
            <Form.Label>Abdeckung</Form.Label>
            <Form.Control as='select' onChange={formik.handleChange} value={formik.values.coverage}>
              <option value='1'>25%</option>
              <option value='2'>50%</option>
              <option value='3'>75%</option>
              <option value='4'>100%</option>
            </Form.Control>
          </Form.Group>
        </Form.Row>

        <Form.Row>
          <Form.Group controlId='spotLength' as={Col} md='4'>
            <Form.Label>Spotlänge (in Sekunden)</Form.Label>
            <Form.Control
              type='text'
              placeholder='32'
              onChange={formik.handleChange}
              value={formik.values.spotLength}
            />
          </Form.Group>

          <Form.Group controlId='costs' as={Col} md='4'>
            <Form.Label>Kosten (netto)</Form.Label>
            <InputGroup>
              <Form.Control
                type='text'
                placeholder='42,99'
                onChange={formik.handleChange}
                value={formik.values.costs}
              />
              <InputGroup.Append>
                <InputGroup.Text>€</InputGroup.Text>
              </InputGroup.Append>
            </InputGroup>
          </Form.Group>
        </Form.Row>

        <Form.Row>
          <Form.Group controlId='startDate' as={Col} md='4'>
            <Form.Label>Startdatum</Form.Label>
            <Form.Control
              type='date'
              onChange={formik.handleChange}
              value={formik.values.startDate}
            />
          </Form.Group>

          <Form.Group controlId='endDate' as={Col} md='4'>
            <Form.Label>Enddatum</Form.Label>
            <Form.Control
              type='date'
              onChange={formik.handleChange}
              value={formik.values.endDate}
            />
          </Form.Group>
        </Form.Row>

        <Form.Row>
          <Form.Group controlId='contract' as={Col} md='4'>
            <Form.Label>Link zum Vertrag</Form.Label>
            <Form.Control
              type='text'
              placeholder='https://...'
              onChange={formik.handleChange}
              value={formik.values.contract}
            />
          </Form.Group>
        </Form.Row>

        <Form.Row>
          <Form.Group controlId='showInFoyer' as={Col} md='4'>
            <Form.Check
              type='checkbox'
              label='Im Foyer zeigen'
              onChange={formik.handleChange}
              value={formik.values.showInFoyer}
              checked={formik.values.showInFoyer}
            />
          </Form.Group>

          <Form.Group controlId='active' as={Col} md='4'>
            <Form.Check
              type='checkbox'
              label='Aktiv'
              onChange={formik.handleChange}
              value={formik.values.active}
              checked={formik.values.active}
            />
          </Form.Group>
        </Form.Row>

        <Button variant='primary' type='submit' disabled={submitting} className='my-2'>
          {submitting ? 'Lade...' : 'Speichern'}
        </Button>

        <Button variant='danger' className='ml-2' onClick={onDelete} disabled={submitting}>
          Kunde löschen
        </Button>

        {error && (
          <Alert variant='danger' className='mt-4'>
            Ein Fehler ist aufgetreten
          </Alert>
        )}
        {submitted && (
          <Alert variant='success' className='mt-4'>
            Kunde wurde gespeichert!
          </Alert>
        )}
      </Form>
    </div>
  )
}

export default EditClient
