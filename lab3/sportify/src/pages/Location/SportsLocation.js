import React, { useState, useEffect, useContext, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { CSVDataContext } from "../../contextProviders/CSVDataContext.js";
import styles from "../../assets/SportsLocation.module.css";
import TopNavBar from "../../components/TopNavBar/TopNavbar";
import APICaller from "../../helperFunctions/APICaller.js";
import MapResultPage from "../../components/Map/MapResultPage.js";
import cross from "../../assets/images/cross.png";
import check from "../../assets/images/check.png";
import calculateRainfallAmount from "../../helperFunctions/Calculators/CalculateRainfall.js";
import calculateAirTemp from "../../helperFunctions/Calculators/CalculateAirTemp.js";
import calculateUVI from "../../helperFunctions/Calculators/CalculateUV.js";
import calculatePSI from "../../helperFunctions/Calculators/CalculatePSI.js";
import Timer from "../../components/Timer.js";

import { ActivityRings } from "@jonasdoesthings/react-activity-rings";

const SportsLocation = ({ buttonPopup, setButtonPopup }) => {
  const displayData = useLocation().state.displayData;
  const ori = useLocation().state.ori;
  const modes = useLocation().state.travelModes;

  const { id } = useParams();
  const { csvData, setCsvData } = useContext(CSVDataContext);
  const navigate = useNavigate();
  const [locationData, setLocationData] = useState();

  const [airData, setAirData] = useState();
  const [psiData, setpsiData] = useState();
  const [rainfallData, setRainfallData] = useState();
  const [UVIData, setUVIData] = useState(-1);

  useEffect(() => {
    if (csvData) {
      setLocationData(
        csvData.find((item) => {
          return item.index === id;
        })
      );
    }
  }, [csvData]);

  // load all data from api
  const apiCaller = new APICaller();
  useEffect(() => {
    apiCaller.fetchAirReadings().then((result) => {
      setAirData(result);
    });
    apiCaller.fetchPSIReadings().then((result) => {
      setpsiData(result);
    });
    apiCaller.fetchRainfallReadings().then((result) => {
      setRainfallData(result);
    });
    apiCaller.fetchUVIReadings().then((result) => {
      setUVIData(result);
    });
  }, []);

  const [airTemp, setAirTemp] = useState(null);
  const [PSIValue, setPSIValue] = useState(null);
  const [rainFallState, setRainfallState] = useState(null);
  const [UVIvalue, setUVIvalue] = useState(null);
  const [airTempRatio, setAirTempRatio] = useState(-1);
  const [PSIRatio, setPSIRatio] = useState(-1);
  const [UVIRatio, setUVIRatio] = useState(-1);

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (locationData && airData && psiData && rainfallData && UVIData !== -1) {
      setAirTemp(calculateAirTemp(locationData, airData));
      setPSIValue(calculatePSI(locationData, psiData));
      setRainfallState(calculateRainfallAmount(locationData, rainfallData));
      setUVIvalue(calculateUVI(locationData, UVIData));

      setAirTempRatio(airTemp / 33);
      setPSIRatio(PSIValue / 200);
      setUVIRatio(UVIvalue / 11);

      // set the visibility to true after a delay to trigger the transition
      const timeout = setTimeout(() => {
        setIsVisible(true);
      });
      return () => clearTimeout(timeout);
    }
  });

  const ratioVerifier = (element) => {
    if (element > 1) {
      return 1;
    } else if (element < 0) {
      return -element;
    }
    return element;
  };

  //Set User State Buttons
  const [inButtonText, setInButtonText] = useState("Pre-Check-In");
  const [outButtonText, setOutButtonText] = useState("Pre-Check-Out");

  const timerRef = useRef(null);
  const [timerStarted, setTimerStarted] = useState(false);

  const handleInClick = () => {
    if (!timerStarted) {
      if (timerRef.current) {
        timerRef.current.startTimer();
        setTimerStarted(true);
      }
    }

    if (inButtonText == "Pre-Check-In") {
      setInButtonText("Check-In");
      setOutButtonText("Pre-Check-Out");
    }

    if (inButtonText == "Check-In") {
      setInButtonText("Checked-In");
      setOutButtonText("Check-Out");
    }
  };

  const handleReturn = () => {
    navigate("/SearchResults", {
      state: {
        displayData: displayData,
        travelModes: modes,
        ori: ori,
      },
    });
  };

  const handleOutClick = () => {
    if (inButtonText == "Check-In") {
      setInButtonText("Pre-Check-In");
    } else {
      navigate("/");
    }
  };

  const handTimerDone = (result) => {
    if (result === 0) {
      setInButtonText("Pre-Check-In");
      setTimerStarted(false);
    }
  };

  return locationData &&
    airTempRatio !== -1 &&
    PSIRatio !== -1 &&
    UVIRatio !== -1 ? (
    <>
      <header>
        <TopNavBar buttonPopup={buttonPopup} setButtonPopup={setButtonPopup} />
      </header>
      <body>
        <div className={styles.returnRow}>
          <button
            className={styles.button}
            style={{ width: "100px" }}
            onClick={handleReturn}
          >
            Return
          </button>
        </div>
        <div
          className={`${styles.Details} gradual ${isVisible ? "visible" : ""}`}
        >
          <div
            className={styles.sideLeft}
            style={{
              backgroundImage: `url(${locationData.Images})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          ></div>
          <div className={styles.sideRight}>
            <div className={styles.infoBox}>
              <p>Location: {locationData.Name}</p>
              <p>
                Activities:{" "}
                {locationData.Sports.toLowerCase()
                  .replace(/\(o\)/g, "(outdoor)")
                  .replace(/\(i\)/g, "(indoor)")
                  .replace("soccer", "football")}
              </p>
              <div className={styles.content}>
                <div>
                  <div className={styles.info}>
                    <div className={styles.infoEntry}>
                      <p style={{ marginTop: "0px" }}>
                        Rain:&nbsp;&nbsp;&nbsp;
                        <span>
                          {rainFallState ? (
                            <img className={styles.icon} src={check} />
                          ) : (
                            <img className={styles.icon} src={cross} />
                          )}
                        </span>
                      </p>
                      <p>Weather:</p>
                    </div>
                    <div>
                      <p>Pre-Check-In: 10</p>
                      <p>Check-In: 12</p>
                    </div>
                  </div>
                  <div className={styles.buttonBox}>
                    <Timer timerDone={handTimerDone} ref={timerRef} />
                    <button className={styles.button} onClick={handleInClick}>
                      {inButtonText}
                    </button>
                    {inButtonText !== "Pre-Check-In" && (
                      <button
                        className={styles.button}
                        onClick={handleOutClick}
                      >
                        {outButtonText}
                      </button>
                    )}
                  </div>
                </div>
                <div className={styles.ring}>
                  <ActivityRings
                    rings={[
                      {
                        filledPercentage: ratioVerifier(UVIRatio),
                        color: "#5DC9D2",
                      },
                      {
                        filledPercentage: ratioVerifier(PSIRatio),
                        color: "#606C38",
                      },

                      {
                        filledPercentage: ratioVerifier(airTempRatio),
                        color: "#EB5E28",
                      },
                    ]}
                    options={{
                      containerWidth: "200px",
                      containerHeight: "200px",
                    }}
                  />
                  <div className={styles.ringBox}>
                    <p style={{ color: "#EB5E28" }}>
                      Air Temparature: {airTemp} &deg;C
                    </p>
                    <p style={{ color: "#606C38" }}>
                      Pollutant Standards Index: {PSIValue}
                    </p>
                    <p style={{ color: "#5DC9D2" }}>
                      Ultraviolet index: {UVIvalue}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <MapResultPage
          ori={ori}
          dest={{
            lat: parseFloat(locationData.Y),
            lng: parseFloat(locationData.X),
          }}
          modes={modes}
        />
      </body>
    </>
  ) : (
    <>
      <header>
        <TopNavBar buttonPopup={buttonPopup} setButtonPopup={setButtonPopup} />
      </header>
    </>
  );
};

export default SportsLocation;
