import React, { useRef, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { processFile } from "../modules/parser/parser";

export function FileUpload() {
  const { dispatch, error, setError } = useAppContext();
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setFileName(null);

    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    setFileName(file.name);
    const result = await processFile(file);

    if (result.success) {
      dispatch({ type: "LOAD_DOCUMENT", wordList: result.wordList });
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="file-upload">
      <label htmlFor="file-input" className="file-upload-label">
        Upload Document
      </label>
      <input
        id="file-input"
        ref={inputRef}
        type="file"
        accept=".txt,.md,.rtf"
        onChange={handleFileChange}
        aria-describedby={error ? "file-upload-error" : undefined}
      />
      {fileName && !error && (
        <span className="file-upload-filename">{fileName}</span>
      )}
      {error && (
        <p
          id="file-upload-error"
          className="file-upload-error"
          role="alert"
          style={{ color: "#d32f2f", marginTop: "0.5rem" }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
