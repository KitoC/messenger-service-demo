import React, { useEffect, useState, useRef } from "react";
import arraySort from "array-sort";
import autosize from "autosize";
import { Form, Message } from "semantic-ui-react";
import CreateChat from "./CreateChat";
import useApi from "./useApi";
import useSockets from "./useSockets";
import get from "lodash/get";

const Chat = (props) => {
  const { currentUser, currentChat, messages, dispatch } = props;

  const currentChatURL = `/${currentUser.id}/chats/${get(currentChat, "id")}`;
  console.log(currentChatURL);
  const ref = useRef(null);

  const [inputValue, setInputValue] = useState("");
  const [resolving, setResolving] = useState(false);

  const [state, apiActions] = useApi({ ...props, currentChatURL, ref });
  const { isSending, fetchingMessages } = state;

  const textarea = document.querySelector("textarea");

  useSockets({ ...props, currentChatURL, ref, actions: apiActions });

  useEffect(() => {
    autosize(document.querySelector("textarea"));
  }, [textarea]);

  useEffect(() => {
    if (currentChat && get(currentChat, "id")) {
      apiActions.fetchMessages();
      apiActions.fetchChat();
    }

    // eslint-disable-next-line
  }, [get(currentChat, "id")]);

  const sendMessage = async () => {
    const newMessage = {
      body: inputValue,
      authorId: currentUser.id,
      metadata: { ...currentUser },
    };

    if (currentChat && get(currentChat, "id")) {
      apiActions.createMessage(newMessage);
    } else {
      apiActions.createChat(newMessage);
    }

    setInputValue("");
  };

  const reject = async () => {
    setResolving(true);
    await apiActions.rejectResolution();
    setResolving(false);
  };

  const accept = async () => {
    setResolving(true);
    await apiActions.acceptResolution();
    setResolving(false);
  };

  const sortedMessages = arraySort(
    currentChat ? messages : [],
    "createdAt"
  ).filter(({ body }) => body !== "Accepted the solution.");

  const showMessageInput =
    currentChat &&
    currentChat.status !== "resolved" &&
    currentChat.status !== "resolution_accepted";

  const showCreateChat =
    !currentChat || currentChat.status === "resolution_accepted";

  console.log({ showCreateChat });
  const showAcceptReject = !currentChat || currentChat.status === "resolved";

  return (
    <div className="chat-box flex-column fit-parent">
      <div className="flex-auto messages" ref={ref}>
        {fetchingMessages && <p>Loading messages...</p>}

        {sortedMessages.map((message) => {
          const boxStyles = { paddingBottom: "20px" };

          if (message.body === "Did not accept the solution.") {
            message.authorId = "BOT";
            message.body = "What else can we help you with?";
            message.metadata.name = "Helpful AI";
          }

          const isAuthor = message.authorId === currentUser.id;

          if (isAuthor) {
            boxStyles.marginLeft = "auto";
          } else {
            boxStyles.marginRight = "auto";
          }

          const isSending = message.id.includes("temp") ? true : false;

          let content = message.metadata.name;

          if (isAuthor) {
            isSending ? (content += " -- Sending") : (content += " -- Sent");
          } else {
            content += "";
          }

          return (
            <div style={boxStyles} key={message.id}>
              <Message
                className="message"
                color={isAuthor || isSending ? "blue" : "green"}
                content={content}
                header={message.body}
              />
            </div>
          );
        })}
      </div>

      {showMessageInput && (
        <>
          <div>
            <textarea
              id="textarea"
              fluid
              name="currentChatUser"
              value={inputValue}
              rows={1}
              placeholder="Send a message ..."
              onChange={(e) => setInputValue(e.target.value)}
            />
          </div>

          <div className="send-button-box">
            <Form.Button
              primary
              disabled={isSending || !inputValue}
              fluid
              onClick={sendMessage}
            >
              Send Message
            </Form.Button>
          </div>
        </>
      )}

      {showAcceptReject && !showCreateChat && (
        <div class="accept-reject-bar">
          <Form.Button color="red" disabled={resolving} fluid onClick={reject}>
            Reject
          </Form.Button>

          <Form.Button
            color="green"
            disabled={resolving}
            fluid
            onClick={accept}
          >
            Accept
          </Form.Button>
        </div>
      )}

      {showCreateChat && (
        <div>
          <CreateChat currentUser={currentUser} dispatch={dispatch} />
        </div>
      )}
    </div>
  );
};

export default Chat;
