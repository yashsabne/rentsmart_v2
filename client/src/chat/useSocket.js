import { useEffect, useCallback } from "react";
import { useSocketContext } from "./socketContext";
import { SOCKET_EVENTS } from "../constants/socketEvents";

/**
 * Hook for managing socket room membership and emitting events.
 * Call this inside the chat area component.
 *
 * @param {string} conversationSlug - the current conversation's slug
 */
const useSocket = (conversationSlug) => {
  const { socket, isConnected } = useSocketContext();

  // Join the conversation room when the component mounts / slug changes
  useEffect(() => {
    if (!socket || !conversationSlug || !isConnected) return;

    socket.emit(SOCKET_EVENTS.JOIN_CONVERSATION, { conversationSlug });

    // Leave room on cleanup
    return () => {
      socket.emit(SOCKET_EVENTS.LEAVE_CONVERSATION, { conversationSlug });
    };
  }, [socket, conversationSlug, isConnected]);

  // Emit typing started
  const emitTyping = useCallback(() => {
    if (!socket || !conversationSlug) return;
    socket.emit(SOCKET_EVENTS.TYPING, { conversationSlug });
  }, [socket, conversationSlug]);

  // Emit typing stopped
  const emitStopTyping = useCallback(() => {
    if (!socket || !conversationSlug) return;
    socket.emit(SOCKET_EVENTS.STOP_TYPING, { conversationSlug });
  }, [socket, conversationSlug]);

  // Emit a new message (after REST save)
  const emitMessage = useCallback(
    (messageData) => {
      if (!socket || !conversationSlug) return;
      socket.emit(SOCKET_EVENTS.SEND_MESSAGE, {
        conversationSlug,
        messageData,
      });
    },
    [socket, conversationSlug]
  );

  // Emit read receipt
  const emitRead = useCallback(() => {
    if (!socket || !conversationSlug) return;
    socket.emit(SOCKET_EVENTS.MESSAGE_READ, { conversationSlug });
  }, [socket, conversationSlug]);

  return { emitTyping, emitStopTyping, emitMessage, emitRead };
};

export default useSocket;
