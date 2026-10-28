// Renders stored text as a plain JSX text child (React sets it as a text
// node, never as HTML). CSS gives it white-space: pre-wrap + monospace so
// spaces, tabs, blank lines and line breaks display exactly as saved.
export default function MessageContent({ content, ref }) {
  return (
    <pre className="content" ref={ref}>
      {content}
    </pre>
  );
}
