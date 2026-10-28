import { useRef } from 'react';
import CopyButton from '../components/CopyButton.jsx';
import MessageContent from '../components/MessageContent.jsx';
import RowHeading from '../components/RowHeading.jsx';

// Read-only row. Imports nothing that can write to Firestore.
export default function MessageRow({ message }) {
  const contentRef = useRef(null);
  return (
    <li className="row">
      <RowHeading message={message} />
      <MessageContent ref={contentRef} content={message.content} />
      <div className="row-actions">
        <CopyButton id={`copy-${message.id}`} text={message.content} targetRef={contentRef} />
      </div>
    </li>
  );
}
