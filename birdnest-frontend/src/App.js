import React, { useState, useEffect } from 'react'
import io from 'socket.io-client';
import Map from './components/Map'

//initialize socket
const socket = io();

const App = () => {
    const [pilots, setPilots] = useState([])
    const [filter, setFilter] = useState([])

    //fetch newest pilot information every 2 seconds
    useEffect(() => {
        const updatePilots = (updatedPilots) => setPilots(updatedPilots)

        //listen for 'pilot information' event and update pilots state on capture 
        socket.on('pilot information', updatePilots)
        return () => {
            socket.off('pilot information', updatePilots)
        }
    }, [])

    //update filter string when text in the input field changes
    const handleFilterStringChange = (event) => {
        event.preventDefault()
        setFilter(event.target.value)
    }

    //show pilots based on filter string that user can write on the search bar
    const pilotsToShow = filter.length === 0 ? pilots : pilots.filter(p => (`${p.firstName.toLowerCase()} ${p.lastName.toLowerCase()}`).indexOf(filter.toLowerCase()) > -1)

    return (
        <div>
            <Map pilots={pilotsToShow}></Map>
            <p>The circle above represents the NDZ and displays the latest locations of the violators in the NDZ for the past 10 minutes</p>
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
