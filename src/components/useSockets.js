import { useEffect } from "react";
import { socketUrl } from "../api";
import io from "socket.io-client";
import get from "lodash/get";

const useSockets = (props) => {
  const {
    currentUser,
    actions,
    // messages,
    // dispatch,
    // ref,
    currentChat,
  } = props;

  useEffect(() => {
    const socket = io(socketUrl);

    if (currentUser && get(currentChat, "id")) {
      socket.emit("join-chats", [currentUser.id]);

      socket.on("update-chat", (data) => {
        actions.fetchChat();
      });

      socket.on("new-message", (data) => {
        actions.fetchMessages();
      });
    }

    return () => socket.close();
    // eslint-disable-next-line
  }, [currentUser, get(currentChat, "id")]);

  // const socket = io(`${api.bridj.polybius.replace("/v1", "")}/${next.tenant}`)

  // socket.emit("join-chats", next.participant)

  // socket.emit("join-channels", next.channels)

  // socket.on("new-message", async payload => {
  //   const { chatId } = payload

  //   const debouncedFetchMessages = debounce(Chat.api().fetchUnreadMessages, 500)

  //   await debouncedFetchMessages({
  //     chatId,
  //     scope: next.tenant + `/${next.participant}/`
  //   })

  //   console.log(process.env.BASE_URL)
  //   new Audio(require(`@/Modules/Core/components/Alerts/chime.mp3`)).play()
  // })

  // socket.on("create-chat", async payload => {
  //   const { chatId } = payload

  //   await Chat.api().fetchById(chatId, {
  //     scope: next.tenant + `/${next.participant}`
  //   })
  // })

  // socket.on("update-chat", async payload => {
  //   const { chatId } = payload

  //   await Chat.api().fetchById(chatId, {
  //     scope: next.tenant + `/${next.participant}`
  //   })
  // })
};

export default useSockets;
