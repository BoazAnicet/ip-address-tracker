import React, { useEffect, useState, useRef } from "react";
import L from "leaflet";
import { Map, Marker, TileLayer } from "react-leaflet";
import markerIcon from "./images/icon-location.svg";
import { api_key, mapboxAccessToken } from "./config/keys";

function App() {
  const [loading, setLoading] = useState(false);

  const [input, setInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [ip, setIp] = useState("");

  const [dataIp, setDataIp] = useState("");
  const [dataLocation, setDataLocation] = useState("");
  const [dataTimezone, setDataTimezone] = useState("");
  const [dataIsp, setDataIsp] = useState("");

  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);

  const ip_url = `https://geo.ipify.org/api/v1?apiKey=${api_key}&ipAddress=${ip}`;
  const dataDisplay = useRef();

  let dataDisplayHeight = dataDisplay.current ? dataDisplay.current.offsetHeight : 175;

  const [bottomMargin, setBottomMargin] = useState(175);

  const init = async (url) => {
    let res = null;

    try {
      if (url) {
        res = await fetch(url).then((res) => res.json());
      } else {
        res = await fetch(ip_url).then((res) => res.json());
      }
      setDataIp(res.ip);
      setDataLocation(`${res.location.city}, ${res.location.region}, ${res.location.postalCode}`);
      setDataTimezone(`UTC ${res.location.timezone}`);
      setDataIsp(res.isp);

      setLat(res.location.lat);
      setLng(res.location.lng);

      setErrorMessage("");

      setLoading(false);
    } catch (error) {
      setErrorMessage("Enter a valid domain, IPv4 or IPv6 address.");
    }
  };

  useEffect(() => {
    if (
      /^((\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.){3}(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/.test(input) ||
      /(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]).){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]).){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))/.test(
        input
      )
    ) {
      init();
    } else {
      init(`https://geo.ipify.org/api/v1?apiKey=${api_key}&domain=${input}`);
    }
    // eslint-disable-next-line
  }, [ip]);

  useEffect(() => {
    setBottomMargin(dataDisplayHeight / 2 + 20);
  }, [dataDisplayHeight]);

  useEffect(() => {
    window.addEventListener("resize", setBottomMargin(dataDisplayHeight / 2 + 20));
    return () => window.removeEventListener("resize", setBottomMargin(dataDisplayHeight / 2 + 20));
    // eslint-disable-next-line
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIp(input);
  };

  const handleChange = (e) => {
    setInput(e.target.value);
  };

  return (
    <main id="main" style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <div className="search">
        <h1>IP Address Tracker</h1>
        <form id="form" action="#" onSubmit={handleSubmit} style={{ marginBottom: bottomMargin }}>
          <div id="searchbar" className="searchbar">
            <label htmlFor="input" style={{ display: "none" }}>
              Search
            </label>
            <input
              onChange={handleChange}
              id="input"
              name="input"
              placeholder="Search for any IP address or domain"
              type="text"
            />
            <button>
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="14">
                <path fill="none" stroke="#FFF" strokeWidth="3" d="M2 1l6 6-6 6" />
              </svg>
            </button>
          </div>
          <span style={{ display: "block" }}>{errorMessage}</span>
        </form>

        <div id="data-view" className="data-view" style={{ display: "flex" }} ref={dataDisplay}>
          <div className="data-box">
            <span className="heading">IP Address</span>
            <span className="data" id="ip">
              {loading ? "Fetching data..." : dataIp}
            </span>
          </div>
          <div className="data-box">
            <span className="heading">Location</span>
            <span className="data" id="location">
              {loading ? "Fetching data..." : dataLocation}
            </span>
          </div>
          <div className="data-box">
            <span className="heading">Timezone</span>
            <span className="data" id="timezone">
              {loading ? "Fetching data..." : dataTimezone}
            </span>
          </div>
          <div className="data-box">
            <span className="heading">ISP</span>
            <span className="data" id="isp">
              {loading ? "Fetching data..." : dataIsp}
            </span>
          </div>
        </div>
      </div>

      <Map center={[lat || 0, lng || 0]} zoom={13}>
        <TileLayer
          attribution={
            'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>'
          }
          maxZoom={18}
          id={"mapbox/streets-v11"}
          tileSize={512}
          zoomOffset={-1}
          accessToken={mapboxAccessToken}
          url={"https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}"}
        />
        <Marker
          position={[lat || 0, lng || 0]}
          icon={L.icon({ iconUrl: markerIcon, iconAnchor: [23, 56] })}
        />
      </Map>
    </main>
  );
}

export default App;
