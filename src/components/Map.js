import React, { useState } from "react";
import { connect } from "react-redux";
import { useDispatch } from "react-redux";
import GoogleMapReact from "google-map-react";
import { AutoComplete } from "antd";
import { addSearch } from "../app/store";
import axios from "axios";
import "./Map.css";

const Map = ({ searches }) => {
  const dispatch = useDispatch();
  const [searchValue, setSearchValue] = useState("");
  const [Marker, setMarker] = useState();
  const [map, setMap] = useState();
  const [maps, setMaps] = useState();
  const [selectedPlace, setSelectedPlace] = useState({
    lat: 3.0733644,
    lng: 101.5195149,
  });
  const [options, setOptions] = useState();

  const handleSearch = (value) => {
    var config = {
      method: "get",
      mode: "no-cors",
      url: `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${value}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`,
      headers: {},
    };

    axios(config)
      .then(function (response) {
        let list = [];
        if (list) list = searches;
        if (response.data) {
          let places = response?.data?.predictions.map((item) => {
            return { value: item.description, place_id: item.place_id };
          });
          let ids = new Set(list.map((saved) => saved.place_id));
          list = [
            ...list,
            ...places.filter((newPlace) => !ids.has(newPlace.place_id)),
          ];
        }
        setOptions(list);
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  const getPosition = async (placeid) => {
    var config = {
      method: "get",
      mode: "no-cors",
      url: `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeid}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`,
      headers: {},
    };

    axios(config)
      .then(function (response) {
        setSelectedPlace({ ...response.data.result.geometry.location });
        renderMarkers(response.data.result.geometry.location);
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  const renderMarkers = (position = null) => {
    let marker = new maps.Marker({
      label: map.center.lat,
      position: (position = null
        ? { lat: map.center.lat(), lng: map.center.lng() }
        : position),
      map,
    });
    Marker?.setMap(null);
    setMarker(marker);
    return marker;
  };

  return (
    <div className="container">
      <div className="margin-60">
        <AutoComplete
          className="input-center"
          placeholder="Search for a location"
          options={options}
          value={searchValue}
          filterOption={(inputValue, searches) => {
            return (
              searches?.value
                ?.toUpperCase()
                ?.indexOf(inputValue.toUpperCase()) !== -1
            );
          }}
          onChange={(value) => {
            setSearchValue(value);
            handleSearch(value);
          }}
          onSelect={async (value, obj) => {
            handleSearch(value);
            await getPosition(obj.place_id);
            dispatch(addSearch({ value, place_id: obj.place_id }));
          }}
        />
      </div>
      <div className="margin-16">
        <div className="map-container">
          <GoogleMapReact
            bootstrapURLKeys={{
              key: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
            }}
            defaultZoom={12}
            yesIWantToUseGoogleMapApiInternals={true}
            center={{ lat: selectedPlace.lat, lng: selectedPlace.lng }}
            onGoogleApiLoaded={({ map, maps }) => {
              setMap(map);
              setMaps(maps);
            }}
          />
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => ({ searches: state?.searches });

export default connect(mapStateToProps)(Map);
