import React from 'react';
import {TextInput, StyleSheet} from 'react-native';

const SearchBar = ({searchText, handleSearch}) => {
  return (
    <TextInput
      style={styles.searchBar}
      value={searchText}
      onChangeText={handleSearch}
      placeholder="Search notes or tags"
    />
  );
};

const styles = StyleSheet.create({
  searchBar: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    margin: 10,
    paddingHorizontal: 10,
  },
});

export default SearchBar;
