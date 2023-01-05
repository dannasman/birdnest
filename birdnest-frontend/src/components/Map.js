import React from 'react'

const Map = ({ pilots }) => {

    //style of the NDZ
    const circleStyle = {
        'height': '800px',
        'width': '800px',
        'borderRadius': '50%',
        'border': '1px solid black',
        'position': 'relative'

    }

    //style of the pilot points
    const points = pilots.map(p => ({
        name: `${p.firstName[0]}. ${p.lastName}`,
        style: {
            'height': 20,
            'width': 20,
            'left': `${4 * (p.positionX / 1000 - 150)}px`,
            'bottom': `${4 * (p.positionY / 1000 - 150)}px`,
            'borderRadius': '50%',
            'backgroundColor': 'red',
            'textAlign': 'center',
            'position': 'absolute'
        }
    }))

    //style of the nest point
    const centerPoint = {
        'height': 20,
        'width': 20,
        'left': `400px`,
        'bottom': `400px`,
        'borderRadius': '50%',
        'backgroundColor': 'lightblue',
        'position': 'absolute'
    }
    return (
        <div >
            <div style={circleStyle}>
                <div style={centerPoint}>the nest</div>
                {points.map((p, i) =>
                    <div key={i} style={p.style}>{p.name}</div>
                )}
            </div>
        </div>
    )
}

export default Map