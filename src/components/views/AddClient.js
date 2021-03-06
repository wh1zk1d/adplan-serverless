import React, { useState } from 'react'
import { useFormik } from 'formik'
import API from '../../utils/api'

import Form from 'react-bootstrap/Form'
import Col from 'react-bootstrap/Col'
import InputGroup from 'react-bootstrap/InputGroup'
import Button from 'react-bootstrap/Button'
import Alert from 'react-bootstrap/Alert'
import Headline from '../ui/Headline'

const AddClient = () => {
  const [error, setError] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const formik = useFormik({
    initialValues: {
      name: '',
      coverage: '1',
      spotLength: '',
      showInFoyer: false,
      onlyFoyer: false,
      startDate: '',
      endDate: '',
      costs: '',
      contract: '',
      active: true,
      isPartOfGroup: false,
      weekRhythm: 'a',
    },
    onSubmit: async values => {
      setSubmitting(true)
      try {
        await API.post('/client', JSON.stringify(values))
        setError(false)
        setSubmitted(true)
      } catch {
        setError(true)
        setSubmitted(false)
      }
      setSubmitting(false)
    },
  })

  return (
    <div>
      <Headline>Kunde hinzufügen</Headline>

      <Form onSubmit={formik.handleSubmit}>
        <Form.Row>
          <Form.Group controlId='name' as={Col} md='4'>
            <Form.Label>Kunde</Form.Label>
            <Form.Control type='text' placeholder='Name' onChange={formik.handleChange} value={formik.values.name} />
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

        {formik.values.coverage === '2' ? (
          <Form.Row>
            <Form.Group controlId='isPartOfGroup' as={Col} md='4'>
              <Form.Check
                type='checkbox'
                label='Teil einer Clip-Gruppe'
                onChange={formik.handleChange}
                value={formik.values.isPartOfGroup}
              />
            </Form.Group>

            <Form.Group controlId='weekRhythm' as={Col} md='4'>
              <Form.Label>A/B Woche (nur bei Clip-Gruppe)</Form.Label>
              <Form.Control
                as='select'
                onChange={formik.handleChange}
                value={formik.values.weekRhythm}
                disabled={!formik.values.isPartOfGroup}>
                <option value='a'>A</option>
                <option value='b'>B</option>
              </Form.Control>
            </Form.Group>
          </Form.Row>
        ) : null}

        <Form.Row>
          <Form.Group controlId='spotLength' as={Col} md='4'>
            <Form.Label>Spotlänge (in Sekunden)</Form.Label>
            <Form.Control
              type='text'
              placeholder='32'
              inputMode='numeric'
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
                inputMode='numeric'
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
            <Form.Control type='date' onChange={formik.handleChange} value={formik.values.startDate} />
          </Form.Group>

          <Form.Group controlId='endDate' as={Col} md='4'>
            <Form.Label>Enddatum</Form.Label>
            <Form.Control type='date' onChange={formik.handleChange} value={formik.values.endDate} />
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
              label='Auch im Foyer zeigen'
              onChange={formik.handleChange}
              checked={formik.values.showInFoyer}
              value={formik.values.showInFoyer}
            />
          </Form.Group>

          <Form.Group controlId='onlyFoyer' as={Col} md='4'>
            <Form.Check
              type='checkbox'
              label='Nur Foyer'
              onChange={formik.handleChange}
              checked={formik.values.onlyFoyer}
              value={formik.values.onlyFoyer}
            />
          </Form.Group>
        </Form.Row>

        <Button variant='primary' type='submit' disabled={submitting} className='my-3'>
          {submitting ? 'Lade...' : 'Speichern'}
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

export default AddClient
