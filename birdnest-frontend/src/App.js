import React, { useState, useEffect } from 'react'
import Map from './components/Map'
import pilotService from './services/pilots'

const App = () => {
    const [pilots, setPilots] = useState([])
    const [filter, setFilter] = useState([])

    //fetch newest pilot information every 2 seconds
    useEffect(() => {
        setInterval(() => {
            const fetchData = async () => {
                const pilots = await pilotService.getAll()
                setPilots(pilots)
            }
            fetchData()
        }, 2000)
    }, [])

    const handleFilterStringChange = (event) => {
        setFilter(event.target.value)
    }

    //show pilots based on filter string that user can write on the search bar
    const pilotsToShow = filter.length === 0 ? pilots : pilots.filter(p => (`${p.firstName.toLowerCase()} ${p.lastName.toLowerCase()}`).indexOf(filter.toLowerCase()) > -1)

    return (
        <div>
            <Map pilots={pilotsToShow}></Map>
            Search pilots <input value={filter} onChange={handleFilterStringChange} ></input>
            <ul>
                {pilotsToShow.map(p =>
                    <li key={p.pilotId}>
                        <h2>{p.firstName}  {p.lastName}</h2>
                        <p>email: {p.email}</p>
                        <p>phone number: {p.phoneNumber}</p>
                        <p>closest distance: {p.distance / 1000}</p>
                    </li>
                )}
            </ul>
        </div>)
}

export default App
