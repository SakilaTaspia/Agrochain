import React, { useState, useRef, useCallback } from "react";
import axios from "axios";
import CForm from "./form";
import Card from "./card";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL_RAPYD,
  headers: {
    "Content-Type": "application/json",
  },
});

const initialState = {
  cardAmount: "",
  cardCurrency: "",
  cardNumber: "#### #### #### ####",
  cardHolder: "FULL NAME",
  cardMonth: "",
  cardYear: "",
  cardCvv: "",
  isCardFlipped: false,
};

const MainScreen = () => {
  const [state, setState] = useState(initialState);
  const [currentFocusedElm, setCurrentFocusedElm] = useState(null);

  const updateStateValues = useCallback(
    (keyName, value) => {
      setState({
        ...state,
        [keyName]: value || initialState[keyName],
      });
    },
    [state]
  );

  // References for the Form Inputs used to focus corresponding inputs.
  let formFieldsRefObj = {
    cardAmount: useRef(),
    cardCurrency: useRef(),
    cardNumber: useRef(),
    cardHolder: useRef(),
    cardDate: useRef(),
    cardCvv: useRef(),
  };

  let focusFormFieldByKey = useCallback((key) => {
    formFieldsRefObj[key].current.focus();
  });

  // This are the references for the Card DIV elements.
  let cardElementsRef = {
    cardAmount: useRef(),
    cardCurrency: useRef(),
    cardNumber: useRef(),
    cardHolder: useRef(),
    cardDate: useRef(),
  };

  let onCardFormInputFocus = (_event, inputName) => {
    const refByName = cardElementsRef[inputName];
    setCurrentFocusedElm(refByName);
  };

  let onCardInputBlur = useCallback(() => {
    setCurrentFocusedElm(null);
  }, []);

  const handlePayment = () => {
    const request = {
      amount: state.cardAmount,
      currency: state.cardCurrency,
      customer: "cus_4eeeb68ee587ef34c05280a243bd9f98",
      payment_method: {
        type: "in_amex_card",
        fields: {
          number: state.cardNumber.split(" ").join(""),
          expiration_month: state.cardMonth,
          expiration_year: state.cardYear,
          name: state.cardHolder,
          cvv: state.cardCvv,
        },
        metadata: {
          merchant_defined: true,
        },
      },
    };

    api
      .post("CreatePayment/payment", request)
      .then((resp) => {
        console.log(resp);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <div className="wrapper">
      <CForm
        cardAmount={formFieldsRefObj.cardAmount}
        cardCurrency={state.cardCurrency}
        cardMonth={state.cardMonth}
        cardYear={state.cardYear}
        onUpdateState={updateStateValues}
        cardNumberRef={formFieldsRefObj.cardNumber}
        cardHolderRef={formFieldsRefObj.cardHolder}
        cardDateRef={formFieldsRefObj.cardDate}
        onCardInputFocus={onCardFormInputFocus}
        onCardInputBlur={onCardInputBlur}
        handlePayment={handlePayment}
      >
        <Card
          cardAmount={state.cardAmount}
          cardCurrency={state.cardCurrency}
          cardNumber={state.cardNumber}
          cardHolder={state.cardHolder}
          cardMonth={state.cardMonth}
          cardYear={state.cardYear}
          cardCvv={state.cardCvv}
          isCardFlipped={state.isCardFlipped}
          currentFocusedElm={currentFocusedElm}
          onCardElementClick={focusFormFieldByKey}
          cardAmountRef={cardElementsRef.cardAmount}
          cardNumberRef={cardElementsRef.cardNumber}
          cardHolderRef={cardElementsRef.cardHolder}
          cardDateRef={cardElementsRef.cardDate}
        ></Card>
      </CForm>
    </div>
  );
};

export default MainScreen;
