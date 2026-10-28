import { metaLine, padIndex } from '../lib/format.js';

export default function RowHeading({ message, children }) {
  const hasTitle = message.title.trim() !== '';
  return (
    <div className="row-head">
      <span className="row-index" aria-hidden="true">
        {padIndex(message.position)}
      </span>
      <div className="row-heading">
        <h2 className="row-title">
          {hasTitle ? message.title : <span className="row-untitled">Untitled</span>}
        </h2>
        <p className="row-meta">{metaLine(message)}</p>
      </div>
      {children}
    </div>
  );
}
