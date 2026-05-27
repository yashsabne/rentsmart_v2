import { useEffect } from "react";
import { useSocketContext } from "./socketContext";
import { SOCKET_EVENTS } from "../constants/socketEvents";

/**
 * Hook that subscribes to incoming socket events for a conversation.
 * All callbacks are provided by the parent component (ChatArea).
 *
 * @param {string} conversationSlug
 * @param {Object} handlers
 * @param {Function} handlers.onMessage - called when a new message arrives
 * @param {Function} handlers.onTyping - called when other user starts typing
 * @param {Function} handlers.onStopTyping - called when other user stops typing
 * @param {Function} handlers.onRead - called when messages are read
 * @param {Function} handlers.onDelivered - called when messages are delivered
 */
const useChatEvents = (conversationSlug, handlers = {}) => {
  const { socket } = useSocketContext();

  useEffect(() => {
    if (!socket || !conversationSlug) return;

    const {
      onMessage,
      onTyping,
      onStopTyping,
      onRead,
      onDelivered,
    } = handlers;

    // ── Receive new message ───────────────────────────────────────────────
    const handleReceiveMessage = (data) => {
      if (data.conversationSlug === conversationSlug && onMessage) {
        onMessage(data.message);
      }
    };

    // ── Typing started ────────────────────────────────────────────────────
    const handleTyping = (data) => {
      if (data.conversationSlug === conversationSlug && onTyping) {
        onTyping(data.publicId);
      }
    };

    // ── Typing stopped ────────────────────────────────────────────────────
    const handleStopTyping = (data) => {
      if (data.conversationSlug === conversationSlug && onStopTyping) {
        onStopTyping(data.publicId);
      }
    };

    // ── Message read receipt ──────────────────────────────────────────────
    const handleRead = (data) => {
      if (data.conversationSlug === conversationSlug && onRead) {
        onRead(data);
      }
    };

    // ── Message delivered ─────────────────────────────────────────────────
    const handleDelivered = (data) => {
      if (data.conversationSlug === conversationSlug && onDelivered) {
        onDelivered(data);
      }
    };

    // Register listeners
    socket.on(SOCKET_EVENTS.RECEIVE_MESSAGE, handleReceiveMessage);
    socket.on(SOCKET_EVENTS.TYPING, handleTyping);
    socket.on(SOCKET_EVENTS.STOP_TYPING, handleStopTyping);
    socket.on(SOCKET_EVENTS.MESSAGE_READ, handleRead);
    socket.on(SOCKET_EVENTS.MESSAGE_DELIVERED, handleDelivered);

    // Cleanup listeners on slug change or unmount
    return () => {
      socket.off(SOCKET_EVENTS.RECEIVE_MESSAGE, handleReceiveMessage);
      socket.off(SOCKET_EVENTS.TYPING, handleTyping);
      socket.off(SOCKET_EVENTS.STOP_TYPING, handleStopTyping);
      socket.off(SOCKET_EVENTS.MESSAGE_READ, handleRead);
      socket.off(SOCKET_EVENTS.MESSAGE_DELIVERED, handleDelivered);
    };
  }, [socket, conversationSlug]); // Re-subscribe when slug changes
};

export default useChatEvents;
