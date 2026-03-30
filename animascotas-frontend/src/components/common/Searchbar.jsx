import { Search } from 'lucide-react';
import styles from './SearchBar.module.css';

const SearchBar = ({ value, onChange, placeholder = 'Buscar...' }) => {
  return (
    <div className={styles.container}>
      <Search size={18} className={styles.icon} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={styles.input}
      />
    </div>
  );
};

export default SearchBar;