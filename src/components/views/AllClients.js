import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import useSortableData from '../../hooks/useSortableData'
import API from '../../utils/api'

import Headline from '../ui/Headline'

import Table from 'react-bootstrap/Table'
import Button from 'react-bootstrap/Button'
import Alert from 'react-bootstrap/Alert'

const AllClients = () => {
  const [sentReport, setSentReport] = useState(false)
  const [errorReport, setErrorReport] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const { isLoading, error, data } = useQuery('fetchClients', async () => {
    const {
      data: { clients },
    } = await API.get('/client')
    return clients
  })

  const { items, requestSort, sortConfig } = useSortableData(data)
  const getClassNamesFor = name => {
    if (!sortConfig) {
      return
    }
    return sortConfig.key === name ? sortConfig.direction : undefined
  }

  const triggerReport = async () => {
    setSubmitting(true)
    setErrorReport(false)
    try {
      await API.get('/clips?manual=true')
      setSentReport(true)
      setTimeout(() => {
        setSentReport(false)
      }, 2000)
    } catch (error) {
      setErrorReport(true)
      setTimeout(() => {
        setErrorReport(false)
      }, 2000)
    }
    setSubmitting(false)
  }

  return (
    <div>
      <Headline>Dashboard</Headline>

      {error && 'Ein Fehler ist aufgetreten'}

      {isLoading ? (
        'Lade Kunden...'
      ) : (
        <div>
          <Button
            variant='primary'
            size='sm'
            className='mb-4'
            disabled={submitting}
            onClick={triggerReport}
          >
            {submitting ? 'Wird gesendet' : 'Mailreport senden'}
          </Button>

          {errorReport && (
            <Alert variant='danger' className='my-4'>
              Ein Fehler ist aufgetreten
            </Alert>
          )}

          {sentReport && (
            <Alert variant='success' className='my-4'>
              Report wurde versendet
            </Alert>
          )}

          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th onClick={() => requestSort('active')} className={getClassNamesFor('active')}>
                  Aktiv
                </th>
                <th onClick={() => requestSort('name')} className={getClassNamesFor('name')}>
                  Kunde
                </th>
                <th
                  onClick={() => requestSort('coverage')}
                  className={getClassNamesFor('coverage')}
                >
                  Abdeckung
                </th>
                <th
                  onClick={() => requestSort('weekRhythm')}
                  className={getClassNamesFor('weekRhythm')}
                >
                  Woche
                </th>
                <th
                  onClick={() => requestSort('spotLength')}
                  className={getClassNamesFor('spotLength')}
                >
                  Spotlänge
                </th>
                <th>Foyer</th>
                <th
                  onClick={() => requestSort('startDate')}
                  className={getClassNamesFor('startDate')}
                >
                  Startdatum
                </th>
                <th onClick={() => requestSort('endDate')} className={getClassNamesFor('endDate')}>
                  Enddatum
                </th>
                <th onClick={() => requestSort('costs')} className={getClassNamesFor('costs')}>
                  Kosten
                </th>
                <th>Vertrag</th>
                <th>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {items.map(client => (
                <tr key={client.id}>
                  <td>
                    {client.active ? (
                      <span className='active-yes'>Ja</span>
                    ) : (
                      <span className='active-no'>Nein</span>
                    )}
                  </td>
                  <td>{client.name}</td>
                  <td>
                    {client.coverage === '1' && '25%'}
                    {client.coverage === '2' && '50%'}
                    {client.coverage === '3' && '75%'}
                    {client.coverage === '4' && '100%'}
                  </td>
                  <td>
                    {client.weekRhythm && client.coverage === '2' && client.isPartOfGroup
                      ? client.weekRhythm.toUpperCase()
                      : null}
                  </td>
                  <td>{client.spotLength}sek</td>
                  <td>
                    {client.showInFoyer && client.onlyFoyer ? (
                      <span class='text-danger'>Nur eine Option wählbar</span>
                    ) : client.showInFoyer ? (
                      'Auch Foyer'
                    ) : (
                      client.onlyFoyer && 'Nur Foyer'
                    )}
                  </td>
                  <td>
                    {client.startDate
                      ? new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium' }).format(
                          new Date(client.startDate)
                        )
                      : '–'}
                  </td>
                  <td>
                    {client.endDate
                      ? new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium' }).format(
                          new Date(client.endDate)
                        )
                      : 'Unbegrenzt'}
                  </td>
                  <td>{client.costs}€</td>
                  <td>
                    {client.contract ? (
                      <a
                        href={client.contract}
                        target='_blank'
                        rel='noopener noreferrer'
                        title='Vertrag anzeigen'
                        className='underdotted'
                      >
                        Anzeigen
                      </a>
                    ) : (
                      '–'
                    )}
                  </td>
                  <td>
                    <Link
                      to={{ pathname: `/edit/${client.id}`, state: { client: client } }}
                      title='Bearbeiten'
                    >
                      Bearbeiten
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  )
}

export default AllClients
