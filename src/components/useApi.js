import { useState } from "react";
import { api } from "../api";
import get from "lodash/get";

const useApi = (props) => {
  const {
    currentUser,
    currentChat,
    messages,
    dispatch,
    ref,
    currentChatURL,
  } = props;
  console.log("useApi", { currentChat });

  const [isSending, setIsSending] = useState(false);
  const [fetchingMessages, setFetchingMessages] = useState(
    get(currentChat, "id") ? true : false
  );

  const createMessage = async (newMessage) => {
    try {
      setIsSending(true);

      const tempId = `temp_${Math.random()}`;

      dispatch({
        type: "UPDATE_MESSAGES",
        payload: [...messages, { id: tempId, ...newMessage }],
      });

      setTimeout(() => {
        ref.current.scrollTop = ref.current.scrollHeight;
      }, 0);

      const { data } = await api.post(`${currentChatURL}/messages`, newMessage);

      await api.patch(`${currentChatURL}`, {
        status: "author_replied",
      });

      setIsSending(false);

      const filteredMessages = messages.filter(({ id }) => id !== tempId);

      dispatch({
        type: "UPDATE_MESSAGES",
        payload: [...filteredMessages, data.data],
      });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: error });
    }
  };

  const rejectResolution = async () => {
    try {
      await createMessage({
        body: "Did not accept the solution.",
        authorId: currentUser.id,
        metadata: { ...currentUser },
      });

      const { data } = await api.patch(`${currentChatURL}`, {
        status: "resolution_rejected",
      });

      dispatch({
        type: "SET_CHAT",
        payload: data.data,
      });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: error });
    }
  };

  const acceptResolution = async () => {
    try {
      await createMessage({
        body: "Accepted the solution.",
        authorId: currentUser.id,
        metadata: { ...currentUser },
      });

      const { data } = await api.patch(`${currentChatURL}`, {
        status: "resolution_accepted",
      });

      dispatch({
        type: "SET_CHAT",
        payload: data.data,
      });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: error });
    }
  };

  const fetchChat = async () => {
    try {
      const { data } = await api.get(`${currentChatURL}`);
      console.log(currentChatURL);
      dispatch({
        type: "SET_CHAT",
        payload: data.data,
      });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: error });
    }
  };

  const fetchMessages = async () => {
    try {
      setFetchingMessages(true);

      const { data } = await api.get(`${currentChatURL}/messages`);
      await api.patch(`${currentChatURL}/mark-as-read`);

      dispatch({
        type: "UPDATE_MESSAGES",
        payload: data.data.messages,
      });

      setTimeout(() => {
        ref.current.scrollTop = ref.current.scrollHeight;
      }, 0);

      setFetchingMessages(false);
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: error });
    }
  };

  const createChat = async (newMessage) => {
    try {
      const tempId = `temp_${Math.random()}`;

      dispatch({
        type: "UPDATE_MESSAGES",
        payload: [{ id: tempId, ...newMessage }],
      });

      setIsSending(true);

      const { data } = await api.post(`/${currentUser.id}/chats`, {
        ...currentChat,
        authorId: currentUser.id,
        title: newMessage.body,
        messages: [newMessage],
      });

      dispatch({
        type: "SET_CHAT",
        payload: data.data,
      });

      dispatch({
        type: "UPDATE_MESSAGES",
        payload: [data.data.latestMessage],
      });

      setIsSending(false);
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: error });
    }
  };

  return [
    { isSending, fetchingMessages },
    {
      createMessage,
      createChat,
      fetchMessages,
      fetchChat,
      rejectResolution,
      acceptResolution,
    },
  ];
};

export default useApi;
