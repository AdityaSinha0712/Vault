import { Search } from 'lucide-react';
import { iconProps } from '../lib/icons.js';

export default function SearchBox({ value, onChange, shown, total }) {
  return (
    <div className="search" role="search">
      <label htmlFor="search-input" className="visually-hidden">
        Search messages by title or text
      </label>
      <div className="search-field">
        <Search {...iconProps} className="search-icon" />
        <input
          id="search-input"
          className="input search-input"
          type="search"
          placeholder="Search titles and text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />
      </div>
      {value !== '' && (
        <p className="search-count" aria-live="polite">
          {shown} of {total}
        </p>
      )}
    </div>
  );
}
