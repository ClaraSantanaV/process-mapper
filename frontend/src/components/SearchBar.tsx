import { SearchIcon, XIcon } from "./icons"

import styles from "./SearchBar.module.css"

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Buscar área ou processo…",
}: SearchBarProps) {
  return (
    <div className={styles.wrapper}>
      <SearchIcon className={styles.icon} />

      <input
        type="text"
        className={styles.input}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />

      {value && (
        <button
          type="button"
          className={styles.clear}
          onClick={() => onChange("")}
          aria-label="Limpar busca"
        >
          <XIcon />
        </button>
      )}
    </div>
  )
}
