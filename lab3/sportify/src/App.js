import logo from './images/logo.png'
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
      <body>
        <img className="logo" src={logo} alt="logo" />
        <p>Sportify</p>
        <div className="map"></div>
      </body>

    </div>
  );
}

export default App;
