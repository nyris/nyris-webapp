import React, { useState } from "react";

import { VizoAgent, results } from "@nyris/vizo-ai";

function Vizo() {
  const [text, setText] = useState("");

  const vizoAgent = new VizoAgent({
    apiKey: process.env.REACT_APP_OPENAI_API_KEY || "",
    customer: window.settings.customer,
    customerDescription: window.settings.customerDescription,
  });

  const handleImageChange = (event: any) => {
    const selectedImage = event.target.files[0];
    vizoAgent.updateImage(selectedImage);
  };

  const handleTextChange = (event: {
    target: { value: React.SetStateAction<string> };
  }) => {
    setText(event.target.value);
  };

  const handleImageSubmit = async (event: { preventDefault: () => void }) => {
    event.preventDefault();

    vizoAgent.runImageAssessment().then((res: any) => {
      console.log({ res });
      vizoAgent.setResults(results);
      vizoAgent.refineResult().then((resFinal: any) => {
        try {
          console.log({ resFinal });
        } catch (error) {
          console.log({ error });
        }
      });
    });
  };

  const handleTextSubmit = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    vizoAgent.setResults(results);
    vizoAgent.runUserQuery(text).then((res: any) => {
      try {
        console.log({ res: JSON.parse(res) });
      } catch (error) {
        console.log(res);
      }
    });
  };

  return (
    <div>
      <div>
        <label>
          Upload Image:
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </label>
      </div>
      <div>
        <label>
          Text:
          <input type="text" value={text} onChange={handleTextChange} />
        </label>
      </div>
      <button onClick={handleTextSubmit} type="submit">
        Submit Text
      </button>
      <button onClick={handleImageSubmit} type="submit">
        Submit Image
      </button>
    </div>
  );
}

export default Vizo;
