import React, { useState, useEffect, useRef, useReducer } from "react";
import "./App.css";
import io from "socket.io-client";
import { Message } from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";
import { api } from "./api";
import Chat from "./components/Chat";
import CreateUser from "./components/CreateUser";

function reducer(state, action) {
  switch (action.type) {
    case "SET_USER":
      return { ...state, currentUser: action.payload };

    case "SET_CHAT":
      localStorage.setItem("currentChat", JSON.stringify(action.payload));
      console.log("SET_CHAT", action.payload);
      return { ...state, currentChat: action.payload };

    case "UPDATE_MESSAGES":
      return { ...state, messages: action.payload };

    case "SET_ERROR":
      if (action.payload.response.data.errors[0] === "Not found.") {
        localStorage.removeItem("currentChat");
      }

      return {
        ...state,
        isLoading: false,
        currentUser: null,
        error: action.payload && action.payload.message,
      };

    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    default:
      return state;
  }
}

function App() {
  const initialState = {
    currentUser: localStorage.getItem("currentChatUser")
      ? JSON.parse(localStorage.getItem("currentChatUser"))
      : null,
    error: false,
    isLoading: false,
    currentChat: localStorage.getItem("currentChat")
      ? JSON.parse(localStorage.getItem("currentChat"))
      : null,
    messages: [],
  };

  const ref = useRef(null);

  const [state, dispatch] = useReducer(reducer, initialState);
  const { isLoading, error, currentUser, currentChat, messages } = state;

  console.log({ state });
  // const [isLoading, setIsLoading] = useState(true);
  // const [error, setError] = useState(false);
  // const [currentUser, setCurrentUser] = useState();
  // const [currentChat, setCurrentChat] = useState(null);

  // useEffect(() => {
  //   if (currentUser && !currentUser.fromLocal) {
  //     api
  //       .patch(`/chats/${chatId}/join`, currentUser)
  //       .then(({ data }) => {
  //         setIsLoading(false);
  //         setCurrentChat(data.data);
  //       })
  //       .catch(handleError);
  //   } else if (currentUser) {
  //     api
  //       .get(`/chats/${chatId}`)
  //       .then(({ data }) => {
  //         setIsLoading(false);
  //         setCurrentChat(data.data);
  //       })
  //       .catch(handleError);
  //   }
  // }, [currentUser]);

  useEffect(() => {
    setTimeout(() => {
      if (!isLoading && ref.current) {
        ref.current.scrollTop = ref.current.scrollHeight;
      }
    }, 0);
  }, [isLoading, ref]);

  return (
    <div className="App">
      {!currentUser && !isLoading && error && (
        <>
          <Message
            error
            className="message"
            content={error}
            header="something went wrong!"
          />
          <button
            onClick={() => dispatch({ type: "SET_ERROR", payload: null })}
          >
            Try again
          </button>
        </>
      )}

      {!currentUser && !error && <CreateUser dispatch={dispatch} />}

      {currentUser && !isLoading && !error && (
        <Chat
          isLoading={isLoading}
          currentUser={currentUser}
          currentChat={currentChat}
          messages={messages}
          dispatch={dispatch}
        />
      )}
    </div>
  );
}

export default App;
