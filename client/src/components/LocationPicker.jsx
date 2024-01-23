// LocationPickerMap.js
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvent, useMap} from 'react-leaflet';

import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    iconSize:     [25, 41], // size of the icon
    iconAnchor:   [12, 41], // point of the icon which will correspond to marker's location
    popupAnchor:  [0, -40] // point from which the popup should open relative to the iconAnchor
});


function ClickComponent({handleMapClick}){
    const map = useMapEvent('click', (event) => {
        handleMapClick(event);
    })
    return null
}

const RecenterAutomatically = ({location}) => {
    console.log(location);
    const map = useMap();
     useEffect(() => {
       map.setView(location);
     }, [location]);
     return null;
}

const LocationPickerMap = ({ onLocationSelect, selectedLocation, defaultLocation, clickable }) => {
    const [location, setLocation] = useState([0,0]); // Default location

    useEffect(()=>{
        if (onLocationSelect){
            onLocationSelect(defaultLocation);   
        }
        if (defaultLocation){
            setLocation(defaultLocation);
        }
        console.log("default location"+defaultLocation);
    },[(!clickable && defaultLocation)]);

    const handleMapClick = (event) => {
        const { lat, lng } = event.latlng;
        setLocation([lat, lng]);
        onLocationSelect([lat, lng]);
    };

    return (
        <MapContainer
            center={location}
            zoom={13}
            style={{ height: '320px', width: '480px' }}
            // eventHandlers={{
            //     click: (e)=>{
            //         console.log('marker clicked', e);
            //         handleMapClick(e);
            //     }
            // }}
            //onLocationSelect={handleMapClick}
        >
        {clickable && <ClickComponent handleMapClick={handleMapClick}></ClickComponent>}
        {!clickable && <RecenterAutomatically location={location} def={defaultLocation}/>}
        <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker
            icon={DefaultIcon}
            position={location}
        >
            <Popup>Tournament location</Popup>
        </Marker>

        </MapContainer>
    );
};

export default LocationPickerMap;