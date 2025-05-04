import React from "react";
import { CiSearch } from "react-icons/ci";
import { TextInput } from "~/components";

const Search = ({ querys, setQuerys, handleSearch }) => {
  return (
    <TextInput
      iconLeft={<CiSearch size={25} className="text-ascent-2" />}
      placeholder="Search user to start"
      type="text"
      onChange={(e) => {
        setQuerys(e.target.value);
        handleSearch(e.target.value);
      }}
      value={querys}
      styles="rounded-2xl w-full py-3 bg-bgSearch border-1 border-borderNewFeed text-ascent-2 flex items-center justify-center"
    />
  );
};

export default Search;
