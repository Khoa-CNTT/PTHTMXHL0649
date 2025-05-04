import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { IoIosSearch } from "react-icons/io";
import { IoClose, IoArrowBack } from "react-icons/io5";
import { useEffect, useState, useRef } from "react";
import * as SearchService from "~/services/SearchService";
import { useDebounceHook } from "~/hooks/useDebounceHook";
import { BlankAvatar } from "~/assets";
import { Spin } from "antd";
import { useSelector } from "react-redux";

const SearchTopBar = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const searchUser = useDebounceHook(keyword, 500);
  const [searchResults, setSearchResults] = useState([]);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Get user from Redux store to check authentication status
  const user = useSelector((state) => state?.user);
  const isAuthenticated = Boolean(user?.token);

  const handleChangeSearch = (e) => setKeyword(e.target.value);

  const handleSearch = async () => {
    // Only proceed with search if user is authenticated
    if (!isAuthenticated) return;

    setIsLoading(true);
    try {
      let results = [];
      const res = await SearchService.searchUser({
        keyword: searchUser,
      });
      if (res) {
        results = res?.result?.items || [];
      }
      setSearchResults(results);
    } catch (error) {
      console.error("Error fetching search results:", error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (searchUser && isAuthenticated) {
      setIsDropdownOpen(true);
      handleSearch();
    } else {
      setIsDropdownOpen(false);
    }
  }, [searchUser, isAuthenticated]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (keyword.trim() && isAuthenticated) {
        navigate("/search", { state: { stateKeyword: keyword } });
        setIsExpanded(false);
      } else if (!isAuthenticated) {
        // Redirect to login or show a message if not authenticated
        navigate("/login");
      }
    }
  };

  const handleFocus = () => {
    if (isAuthenticated) {
      setIsExpanded(true);
      setIsDropdownOpen(Boolean(keyword));
    } else {
      // Redirect to login if not authenticated
      navigate("/login");
    }
  };

  const handleBackClick = () => {
    setIsExpanded(false);
    setIsDropdownOpen(false);
    setKeyword("");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
        setIsExpanded(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <div
        className={`flex items-center bg-bgSearch py-[2px] rounded-full transition-all duration-200 ${
          isExpanded ? "w-full" : "w-[240px]"
        }`}
      >
        {isExpanded ? (
          <button
            onClick={handleBackClick}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            <IoArrowBack size={20} />
          </button>
        ) : (
          <div className="flex items-center justify-center pl-3">
            <IoIosSearch size={20} className="text-gray-500" />
          </div>
        )}

        <input
          ref={inputRef}
          type="text"
          value={keyword}
          onChange={handleChangeSearch}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onClick={handleFocus}
          placeholder={
            isAuthenticated
              ? t("Tìm kiếm trên LinkVerse")
              : t("Đăng nhập để tìm kiếm")
          }
          className="w-full py-2 px-2 bg-transparent outline-none text-ascent-1 text-sm"
        />

        {keyword && (
          <button
            className="p-2 text-gray-500 hover:text-gray-700"
            onClick={() => setKeyword("")}
          >
            <IoClose size={18} />
          </button>
        )}
      </div>

      {isDropdownOpen && isAuthenticated && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-primary rounded-xl shadow-xl z-50 w-[360px] flex flex-col"
          style={{ maxHeight: "480px" }}
        >
          {keyword && (
            <>
              <div
                className="overflow-y-auto flex-grow"
                style={{ maxHeight: "430px" }}
              >
                {isLoading ? (
                  <div className="w-full py-5 flex items-center justify-center text-gray-500">
                    <Spin />
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="px-1">
                    <div className="flex justify-between items-center px-4 py-3">
                      <h3 className="text-base font-medium text-ascent-1">
                        {t("Mới đây")}
                      </h3>
                    </div>
                    {searchResults.length &&
                      searchResults.map((user) => (
                        <Link
                          key={user.id}
                          to={"/profile/" + user?.userId}
                          className="flex items-center px-3 py-2 hover:bg-hoverItem rounded-2xl cursor-pointer"
                        >
                          <img
                            src={user?.imageUrl ?? BlankAvatar}
                            alt="avatar"
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div className="flex-grow ml-3">
                            <p className="text-sm text-ascent-1 font-semibold">
                              {user.username}
                            </p>
                            <p className="text-xs text-ascent-2">
                              {user.firstName} {user.lastName}
                            </p>
                          </div>
                        </Link>
                      ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-gray-500">
                    {t("No results found...")}
                  </div>
                )}
              </div>

              <div className="sticky bottom-0 w-full p-2 border-t border-borderNewFeed bg-primary rounded-b-xl">
                <Link
                  to="/search"
                  state={{ stateKeyword: keyword }}
                  className="flex items-center justify-center text-ascent-2 hover:bg-hoverItem py-2 px-3 rounded-lg"
                >
                  <IoIosSearch size={18} className="mr-2" />
                  <span className="text-sm">
                    {t("See all results for")} "{keyword}"
                  </span>
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchTopBar;
