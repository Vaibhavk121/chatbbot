import React from 'react';
import ReactMarkdown from 'react-markdown';
import './RewriteModal.css';

const RewriteModal = ({ rewriteData, onClose, onAction }) => {
  if (!rewriteData) return null;

  return (
    <div className="modal-overlay">
      <div className="rewrite-modal">
        <div className="modal-header">
          <h3>Rewritten Message</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-content">
          <div className="original-message">
            <h4>Original:</h4>
            <p>{rewriteData.original.content}</p>
          </div>
          
          <div className="rewritten-message">
            <h4>Rewritten:</h4>
            <div className="markdown-content">
              <ReactMarkdown>{rewriteData.rewritten}</ReactMarkdown>
            </div>
          </div>
        </div>
        
        <div className="modal-actions">
          <button onClick={() => onAction('accept')}>
            Replace Original
          </button>
          <button onClick={() => onAction('send')}>
            Send as New
          </button>
          <button onClick={() => onAction('copy')}>
            Copy
          </button>
          <button className="cancel-button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default RewriteModal;