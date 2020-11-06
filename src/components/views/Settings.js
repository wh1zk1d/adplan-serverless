import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { Formik, FieldArray } from 'formik'
import API from '../../utils/api'

import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Alert from 'react-bootstrap/Alert'
import Headline from '../ui/Headline'

export default function Settings() {
  const [saved, setSaved] = useState(false)
  const [errorOnSave, setErrorOnSave] = useState(false)

  // Fetch settings
  const { isLoading, error, data } = useQuery(
    'fetchClient',
    async () => {
      const { data } = await API.get(`/recipient`)
      return data
    },
    {
      cacheTime: 0,
    }
  )

  return (
    <div>
      <Headline>Einstellungen</Headline>
      {error && 'Ein Fehler ist aufgetreten'}

      {isLoading ? (
        'Lade Einstellungen'
      ) : (
        <div>
          <h5 className='my-4'>Mail-Empfänger</h5>
          <Formik
            initialValues={{
              recipients: data.recipients,
            }}
            onSubmit={async ({ recipients }, { setSubmitting }) => {
              setSubmitting(true)
              setErrorOnSave(false)
              try {
                await API.put('/recipient', JSON.stringify(recipients))
                setSaved(true)
              } catch (err) {
                setErrorOnSave(true)
              }
              setSubmitting(false)
            }}>
            {({ values, handleChange, handleSubmit, isSubmitting }) => (
              <Form onSubmit={handleSubmit}>
                <FieldArray
                  name='recipients'
                  render={arrayHelpers => (
                    <div>
                      {values.recipients && values.recipients.length > 0
                        ? values.recipients.map((recipient, index) => (
                            <Form.Group key={index} controlId={`recipients.${index}`}>
                              <Form.Label>Empfänger #{index + 1}</Form.Label>
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                <Form.Control
                                  type='email'
                                  onChange={handleChange}
                                  value={values.recipients[index]}
                                  required
                                />
                                <Button
                                  variant='outline-danger'
                                  size='sm'
                                  className='ml-2'
                                  type='button'
                                  onClick={() => arrayHelpers.remove(index)} // remove a friend from the list
                                >
                                  -
                                </Button>
                              </div>
                            </Form.Group>
                          ))
                        : null}
                      <Button variant='success' className='my-3' onClick={() => arrayHelpers.push('')}>
                        Empfänger hinzufügen
                      </Button>
                    </div>
                  )}
                />
                <Button variant='primary' type='submit' disabled={isSubmitting} className='my-3'>
                  {isSubmitting ? 'Lade...' : 'Speichern'}
                </Button>

                {errorOnSave && (
                  <Alert variant='danger' className='mt-4'>
                    Ein Fehler ist aufgetreten
                  </Alert>
                )}
                {saved && (
                  <Alert variant='success' className='mt-4'>
                    Empfänger wurden aktualisiert
                  </Alert>
                )}
              </Form>
            )}
          </Formik>
        </div>
      )}
    </div>
  )
}
