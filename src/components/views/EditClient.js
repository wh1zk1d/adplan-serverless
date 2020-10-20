import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { Formik } from 'formik'
import API from '../../utils/api'
import { useParams } from 'react-router-dom'

import Form from 'react-bootstrap/Form'
import Col from 'react-bootstrap/Col'
import InputGroup from 'react-bootstrap/InputGroup'
import Button from 'react-bootstrap/Button'
import Alert from 'react-bootstrap/Alert'
import Headline from '../ui/Headline'

const EditClient = () => {
  // Grab ID from URL
  const { id } = useParams()

  // Fetch client data
  const { isLoading, error, data } = useQuery(
    'fetchClient',
    async () => {
      const { data } = await API.get(`/clients/${id}`)
      return data
    },
    {
      cacheTime: 0,
    }
  )

  const [saved, setSaved] = useState(false)
  const [errorOnSave, setErrorOnSave] = useState(false)

  return (
    <div>
      <Headline>Kunde bearbeiten</Headline>
      {error && <Alert variant='danger'>{error.message}</Alert>}
      {isLoading ? (
        'Lade Daten...'
      ) : (
        <Formik
          initialValues={{
            name: data.name,
            coverage: data.coverage,
            spotLength: data.spotLength,
            costs: data.costs,
            startDate: data.startDate,
            endDate: data.endDate,
            contract: data.contract,
            showInFoyer: data.showInFoyer,
            active: data.active,
          }}
          onSubmit={async (values, { setSubmitting }) => {
            setErrorOnSave(false)
            try {
              await API.put(`/clients/${id}`, JSON.stringify(values))
              setSubmitting(false)
              setSaved(true)
            } catch {
              setErrorOnSave(true)
            }
            setSubmitting(false)
          }}>
          {({ values, handleChange, handleSubmit, isSubmitting }) => (
            <Form onSubmit={handleSubmit}>
              <Form.Row>
                <Form.Group controlId='name' as={Col} md='4'>
                  <Form.Label>Kunde</Form.Label>
                  <Form.Control type='text' placeholder='Name' onChange={handleChange} value={values.name} />
                </Form.Group>

                <Form.Group controlId='coverage' as={Col} md='4'>
                  <Form.Label>Abdeckung</Form.Label>
                  <Form.Control as='select' onChange={handleChange} value={values.coverage}>
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
                  <Form.Control type='text' placeholder='32' onChange={handleChange} value={values.spotLength} />
                </Form.Group>

                <Form.Group controlId='costs' as={Col} md='4'>
                  <Form.Label>Kosten (netto)</Form.Label>
                  <InputGroup>
                    <Form.Control type='text' placeholder='42,99' onChange={handleChange} value={values.costs} />
                    <InputGroup.Append>
                      <InputGroup.Text>€</InputGroup.Text>
                    </InputGroup.Append>
                  </InputGroup>
                </Form.Group>
              </Form.Row>

              <Form.Row>
                <Form.Group controlId='startDate' as={Col} md='4'>
                  <Form.Label>Startdatum</Form.Label>
                  <Form.Control type='date' onChange={handleChange} value={values.startDate} />
                </Form.Group>

                <Form.Group controlId='endDate' as={Col} md='4'>
                  <Form.Label>Enddatum</Form.Label>
                  <Form.Control type='date' onChange={handleChange} value={values.endDate} />
                </Form.Group>
              </Form.Row>

              <Form.Row>
                <Form.Group controlId='contract' as={Col} md='4'>
                  <Form.Label>Link zum Vertrag</Form.Label>
                  <Form.Control type='text' placeholder='https://...' onChange={handleChange} value={values.contract} />
                </Form.Group>
              </Form.Row>

              <Form.Row>
                <Form.Group controlId='showInFoyer' as={Col} md='4'>
                  <Form.Check
                    type='checkbox'
                    label='Im Foyer zeigen'
                    onChange={handleChange}
                    checked={values.showInFoyer}
                    value={values.showInFoyer}
                  />
                </Form.Group>

                <Form.Group controlId='active' as={Col} md='4'>
                  <Form.Check
                    type='checkbox'
                    label='Aktiv'
                    onChange={handleChange}
                    checked={values.active}
                    value={values.active}
                  />
                </Form.Group>
              </Form.Row>

              <Button variant='primary' type='submit' disabled={isSubmitting} className='my-2'>
                {isSubmitting ? 'Lade...' : 'Speichern'}
              </Button>

              {errorOnSave && (
                <Alert variant='danger' className='mt-4'>
                  Ein Fehler ist aufgetreten
                </Alert>
              )}
              {saved && (
                <Alert variant='success' className='mt-4'>
                  Kunde wurde gespeichert!
                </Alert>
              )}
            </Form>
          )}
        </Formik>
      )}
    </div>
  )
}

export default EditClient
