import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App'
import Analytics from './Analytics';
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from 'i18next-browser-languagedetector'
import HttpApi from 'i18next-http-backend';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";


i18n
  .use(HttpApi)
  .use(LanguageDetector)
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    supportedLngs: ['en', 'cn'],
    fallbackLng: "en",
    debug: false,
    detection: {
      order: ['cookie', 'localStorage', 'sessionStorage', 'htmlTag', 'path', 'subdomain'],
      caches: ['cookie', 'localStorage']
    },
    backend: {
      loadPath: '/assets/locales/{{lng}}/translation.json',
    },
    react: {useSuspense: false}
  });


ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/analytics" element={<Analytics />} />
          {/* <App /> */}
        {/* </Route> */}
      </Routes>
    </Router>
      {/* <App /> */}
  </React.StrictMode>,
  document.getElementById('root')
);
