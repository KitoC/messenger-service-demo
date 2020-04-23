import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import io from "socket.io-client";
import { Card, Form, Loader, Message } from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";
import axios from "axios";
import arraySort from "array-sort";

console.log(process.env);
const polybiusURL = process.env.REACT_APP_POLYBIUS_URL;
const chatId = process.env.REACT_APP_CHAT_ID;

const socketUrl = `${polybiusURL}/Bridj`;
const baseURL = `${polybiusURL}/v1/Bridj`;

const api = axios.create({ baseURL });

function App() {
  const ref = useRef(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [currentUser, setCurrentUser] = useState(
    localStorage.getItem("currentChatUser")
      ? JSON.parse(localStorage.getItem("currentChatUser"))
      : null
  );
  const [currentChat, setCurrentChat] = useState(null);
  const [inputValue, setInputValue] = useState("");

  const handleError = (error) => {
    setError(error.message);
    setIsLoading(false);
    localStorage.removeItem("currentChatUser");
    setCurrentUser(null);
  };

  useEffect(() => {
    if (currentUser && !currentUser.fromLocal) {
      api
        .patch(`/chats/${chatId}/join`, currentUser)
        .then(({ data }) => {
          setIsLoading(false);
          setCurrentChat(data.data);
        })
        .catch(handleError);
    } else if (currentUser) {
      api
        .get(`/chats/${chatId}`)
        .then(({ data }) => {
          setIsLoading(false);
          setCurrentChat(data.data);
        })
        .catch(handleError);
    }
  }, [currentUser]);

  useEffect(() => {
    setTimeout(() => {
      if (!isLoading && ref.current) {
        ref.current.scrollTop = ref.current.scrollHeight;
      }
    }, 0);
  }, [isLoading, ref]);

  useEffect(() => {
    if (currentUser) {
      const socket = io(socketUrl);

      socket.emit("join-chats", [currentUser.id]);

      socket.on("update-chat", (data) => {
        console.log("update-chat");
        setCurrentChat(data);
        ref.current.scrollTop = ref.current.scrollHeight;
      });
    }
  }, [currentUser]);

  const sendMessage = async () => {
    const newMessage = {
      body: inputValue,
      authorId: currentUser.id,
      metadata: { ...currentUser },
    };
    const updatedChat = {
      ...currentChat,
      messages: [newMessage],
    };

    setIsSending(true);
    setInputValue("");

    api
      .patch(`/chats/${chatId}`, updatedChat)
      .then(({ data }) => {
        console.log("setting false");
        setIsSending(false);
        setCurrentChat(data.data);
        ref.current.scrollTop = ref.current.scrollHeight;
      })
      .catch(handleError);
  };

  const sortedMessages = arraySort(
    currentChat ? currentChat.messages : [],
    "createdAt"
  );

  console.log({ currentUser, isLoading, error });

  return (
    <div className="App">
      {!currentUser && !isLoading && error && (
        <Message
          error
          className="message"
          content={error}
          header="something went wrong!"
        />
      )}

      {!currentUser && !error && (
        <Card>
          <Card.Content>Please enter your name to start.</Card.Content>
          <Card.Content>
            <Form
              onSubmit={() => {
                const userId = `${Math.random()}`;

                setInputValue("");
                setCurrentUser({ name: inputValue, id: userId });

                localStorage.setItem(
                  "currentChatUser",
                  JSON.stringify({
                    name: inputValue,
                    id: userId,
                    fromLocal: true,
                  })
                );
              }}
            >
              <Form.Input
                name="currentChatUser"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                fluid
              />
              <Form.Button fluid>Submit name</Form.Button>
            </Form>
          </Card.Content>
        </Card>
      )}

      {currentUser && isLoading && (
        <div>
          <Loader active={isLoading} inline inverted />
          <p>Joining chat ...</p>
        </div>
      )}

      {currentUser && currentChat && !isLoading && !error && (
        <Card>
          <Card.Content>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                height: "65vh",
                overflow: "auto",
              }}
              ref={ref}
            >
              {sortedMessages.map((message) => {
                const isAuthor = message.authorId === currentUser.id;

                const boxStyles = { paddingBottom: "20px" };

                if (isAuthor) {
                  boxStyles.paddingLeft = "40px";
                } else {
                  boxStyles.paddingRight = "40px";
                }
                return (
                  <div style={boxStyles}>
                    <Message
                      className="message"
                      color={isAuthor ? "blue" : "green"}
                      content={message.metadata.name}
                      header={message.body}
                    />
                  </div>
                );
              })}
            </div>
          </Card.Content>
          <Card.Content>
            <Form.Input
              fluid
              name="currentChatUser"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
          </Card.Content>
          <Card.Content>
            <Form.Button
              disabled={isSending || !inputValue}
              fluid
              onClick={sendMessage}
            >
              Send Message
            </Form.Button>
          </Card.Content>
        </Card>
      )}
    </div>
  );
}

export default App;
