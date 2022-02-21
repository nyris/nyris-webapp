import React from "react";
import { useAppDispatch, useAppSelector } from "Store/Store";
import Feedback from "components/Feedback";
import { hideFeedback } from "Store/Nyris";

function FooterComponent(): JSX.Element {
  const dispatch = useAppDispatch();
  const searchState = useAppSelector((state) => state);
  const { nyris } = searchState;
  const { feedbackState } = nyris;
  return (
    <>
      <section className="footnote">
        <div className="wrapper">
          © 2017 - 2019 <a href="https://nyris.io">nyris GmbH</a> - All rights
          reserved - <a href="https://nyris.io/imprint/">Imprint</a>
        </div>
      </section>
      <Feedback
        feedbackState={feedbackState}
        onClose={() => {
          return dispatch(hideFeedback(""));
        }}
      />
    </>
  );
}

export default FooterComponent;
