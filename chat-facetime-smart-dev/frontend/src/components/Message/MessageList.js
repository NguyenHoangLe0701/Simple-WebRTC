import React from 'react';
import { Virtuoso } from 'react-virtuoso';
import Message from './Message';

const MessageList = ({ messages, currentUser, onReact, onReply, onEdit, onDelete }) => {
  return (
    <Virtuoso
      data={messages}
      itemContent={(index, message) => (
        <Message
          message={message}
          isOwn={currentUser?.id === message.senderId}
          onReact={onReact}
          onReply={onReply}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}
      followOutput={true}
    />
  );
};

export default MessageList;