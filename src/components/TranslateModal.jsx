import React, { useState } from "react";
import { FaTimes, FaLanguage } from "react-icons/fa";
import "./TranslateModal.css";

const TranslateModal = ({ originalText, onClose, onTranslate, isLoading }) => {
  const [targetLanguage, setTargetLanguage] = useState("");
  const [translatedText, setTranslatedText] = useState("");

  const handleTranslate = async () => {
    if (!targetLanguage.trim()) return;

    const result = await onTranslate(originalText, targetLanguage);
    if (result) {
      setTranslatedText(result);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(translatedText);
  };

  const handleUseTranslation = () => {
    // This will be handled by the parent component
    onClose(translatedText);
  };

  return (
    <div className="translate-modal-overlay">
      <div className="translate-modal">
        <div className="translate-modal-header">
          <h3>
            <FaLanguage /> Translate Message
          </h3>
          <button className="close-btn" onClick={() => onClose()}>
            <FaTimes />
          </button>
        </div>

        <div className="translate-modal-content">
          <div className="original-text">
            <label>Original Message:</label>
            <div className="text-display">{originalText}</div>
          </div>

          <div className="language-input">
            <label>Translate to:</label>
            <input
              type="text"
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              placeholder="Enter target language (e.g., Spanish, Hindi, Bhojpuri, Tamil, German, Chinese, etc.)"
              className="language-field"
              disabled={isLoading}
            />
          </div>

          <div className="translate-actions">
            <button
              className="translate-btn"
              onClick={handleTranslate}
              disabled={!targetLanguage.trim() || isLoading}
            >
              {isLoading ? "Translating..." : "Translate"}
            </button>
          </div>

          {translatedText && (
            <div className="translated-result">
              <label>Translation:</label>
              <div className="text-display translated">{translatedText}</div>
              <div className="result-actions">
                <button className="copy-btn" onClick={handleCopy}>
                  Copy
                </button>
                <button className="use-btn" onClick={handleUseTranslation}>
                  Use Translation
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TranslateModal;
