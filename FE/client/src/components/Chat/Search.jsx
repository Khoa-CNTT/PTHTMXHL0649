import React from "react";
import { FiSearch } from "react-icons/fi";
import { SearchBox } from "~/components/Chat/styled";

const Search = ({ querys, setQuerys, handleSearch }) => {
  return (
    <SearchBox>
      <FiSearch size={20} color="#666" />
      <input
        type="text"
        className="text-ascent-1"
        placeholder="Search conversations..."
        style={{
          border: "none",
          outline: "none",
          background: "transparent",
          width: "100%",
          fontSize: "14px",
        }}
        onChange={(e) => {
          setQuerys(e.target.value);
          handleSearch(e.target.value);
        }}
        value={querys}
      />
    </SearchBox>
  );
};

export default Search;
