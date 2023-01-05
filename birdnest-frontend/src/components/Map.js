import React from 'react'

const Map = ({ pilots }) => {

    //width and height of the "box" containing the zone
    const height = 800
    const width = 800

    //style of the NDZ
    const circleStyle = {
        'height': `${height}px`,
        'width': `${width}px`,
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
            'left': `${4.0 * (p.positionX / 1000.0 - 150.0)-10}px`, //150.0 is a offset needed to convert the original coordinates to "box" coordinates
            'bottom': `${4.0 * (p.positionY / 1000.0 - 150.0)-10}px`,
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
            <div style={circleStyle}>
                <div style={centerPoint}>the nest</div>
                {points.map((p, i) =>
                    <div key={i} style={p.style}>{p.name}</div>
                )}
            </div>
    )
}

export default Map