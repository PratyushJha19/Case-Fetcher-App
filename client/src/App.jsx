import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [captcha, setCaptcha] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [caseType, setCaseType] = useState("");
  const [caseNumber, setCaseNumber] = useState("");
  const [filingYear, setFilingYear] = useState("");
  const [captchaText, setCaptchaText] = useState("");
  const [caseDetails, setCaseDetails] = useState({});

  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchCaptcha() {
      try {
        const res = await axios.post(
          `${process.env.REACT_APP_SERVER_URL}/api/case/get-captcha`
        );
        setCaptcha(res.data.captchaText);
        setSessionId(res.data.sessionId);
      } catch (err) {
        console.error(err);
        setError("Failed to load CAPTCHA.");
      }
    }
    fetchCaptcha();
  }, []);

  const handleSubmit = async () => {
    setError("");
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_SERVER_URL}/api/case/submit-details`,
        {
          caseType,
          caseNumber,
          filingYear,
          captchaText,
          sessionId,
        }
      );
      setCaseDetails(res.data); // Table part
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Submission failed.");
    }
  };

  return (
    <div className="app">
      <h1>Delhi HC Case Fetcher</h1>

      <label>
        Case Type: Example - W.P.(C)
        <input value={caseType} onChange={(e) => setCaseType(e.target.value)} />
      </label>
      <label>
        Case Number: Example - 7608
        <input
          value={caseNumber}
          onChange={(e) => setCaseNumber(e.target.value)}
        />
      </label>
      <label>
        Filing Year: Example - 2019
        <input
          value={filingYear}
          onChange={(e) => setFilingYear(e.target.value)}
        />
      </label>

      {captcha && (
        <div>
          <h2>CAPTCHA: {captcha}</h2>
          <input
            value={captchaText}
            onChange={(e) => setCaptchaText(e.target.value)}
            placeholder="Enter CAPTCHA"
          />
        </div>
      )}

      <button disabled={!captchaText || !caseNumber} onClick={handleSubmit}>
        Submit
      </button>

      {error && <p className="error">{error}</p>}

      {caseDetails && (
        <div className="case-info text-center">
          <h2>Case Details</h2>
          <table>
            <tbody>
              <tr>
                <td>
                  <strong>Case No:</strong>
                </td>
                <td>{caseDetails.caseNo}</td>
              </tr>
              <tr>
                <td>
                  <strong>Date of Filing:</strong>
                </td>
                <td>{caseDetails.dateOfFiling}</td>
              </tr>
              <tr>
                <td>
                  <strong>CNR No:</strong>
                </td>
                <td>{caseDetails.cnrNo}</td>
              </tr>
              <tr>
                <td>
                  <strong>Date of Registration:</strong>
                </td>
                <td>{caseDetails.dateOfRegistration}</td>
              </tr>
              <tr>
                <td>
                  <strong>Status:</strong>
                </td>
                <td>{caseDetails.status}</td>
              </tr>
              <tr>
                <td>
                  <strong>Petitioner:</strong>
                </td>
                <td>{caseDetails.petitioner}</td>
              </tr>
              <tr>
                <td>
                  <strong>Respondent:</strong>
                </td>
                <td>{caseDetails.respondent}</td>
              </tr>
              <tr>
                <td>
                  <strong>Filling Advocate:</strong>
                </td>
                <td>{caseDetails.advocate}</td>
              </tr>
              <tr>
                <td>
                  <strong>Subject 1:</strong>
                </td>
                <td>{caseDetails.subject1}</td>
              </tr>
              <tr>
                <td>
                  <strong>Subject 2:</strong>
                </td>
                <td>{caseDetails.subject2}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;
