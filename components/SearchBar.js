import React from 'react';
import {TextInput, StyleSheet} from 'react-native';
import useAppStyles from "../styles/useAppStyles";

const SearchBar = ({searchText, handleSearch}) => {
  const styles = useAppStyles().styles;

  return (
    <TextInput
      style={styles.searchBar}
      value={searchText}
      onChangeText={handleSearch}
      placeholder="Search notes or tags"
    />
  );
};
export default SearchBar;
