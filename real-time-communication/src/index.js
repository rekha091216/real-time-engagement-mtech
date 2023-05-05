/* eslint-disable react/jsx-filename-extension */
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import VideoCall from './VideoCall/VideoCall';
import Register from './register';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <Routes>
      <Route path = "/" element = {<App/>}/>
      <Route path = "/videoCall" element = {<VideoCall/>}/>
      <Route path = "/register" element = {<Register/>}/>
    </Routes>
  </BrowserRouter>
)

reportWebVitals();
