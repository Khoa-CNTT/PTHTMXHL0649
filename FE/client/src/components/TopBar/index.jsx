import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  Apps,
  ChangeLanguage,
  Chat,
  Logout,
  Notifications,
  SelectPosts,
} from "~/components/index";
import { useTranslation } from "react-i18next";
import { FaArrowLeft, FaBars, FaTimes } from "react-icons/fa";
import SearchTopBar from "~/components/SearchTopBar";
import { useState, useEffect, useRef } from "react";

const TopBar = ({ title, iconBack, selectPosts }) => {
  const { t } = useTranslation();
  const user = useSelector((state) => state.user);
  const { theme } = useSelector((state) => state.theme);
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);
  const activeMenuRef = useRef(null);

  // Check if the screen width is for mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setMobileMenuOpen(false);
      }
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  // Improved click outside handler that respects nested menus
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if a nested menu is open (marked by data-menu-toggle)
      const isNestedMenuClick = event.target.closest("[data-menu-toggle]");

      // If clicking on a nested menu component, don't close the mobile menu
      if (isNestedMenuClick) {
        // Update the active menu reference
        activeMenuRef.current = isNestedMenuClick;
        return;
      }

      // Only close if clicking outside mobile menu and not on a nested menu
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        !event.target.closest("[data-menu-toggle]")
      ) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mobileMenuOpen]);

  const toggleMobileMenu = (e) => {
    e.stopPropagation(); // Prevent event bubbling
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="header w-full flex items-center justify-between py-2 px-1 sm:px-3 bg-bgColor sticky top-0 z-40">
      {/* Logo and Search Section */}
      <div
        className={`${
          isMobile ? "w-1/3" : "w-1/4"
        } flex justify-start items-center h-full gap-x-2 md:gap-x-4`}
      >
        <a href="/" className="flex items-center">
          <div className="rounded text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={isMobile ? "36" : "50"}
              height={isMobile ? "36" : "50"}
              viewBox="0 0 534 250"
              className="hover:scale-110 transition-transform"
            >
              <g
                transform="translate(0,250) scale(0.1,-0.1)"
                fill={theme === "dark" ? "#fff" : "#000"}
              >
                <path d="M2304 2404 c-101 -36 -184 -155 -184 -264 0 -61 24 -121 69 -179 15-20 230-315 476-656 506-702 549-758 659-873 77-80 208-177 305-227 162-82 354-120 564-112 290 10 526 113 733 321 400 400 456 1030 134 1507 -55 81 -206 233 -285 286 -136 91 -303 159 -457 183 -117 19 -320 8 -439 -23 -184 -48 -360 -150 -496 -286 -69 -69 -173 -203 -173 -223 0 -4 77 -113 170-241 94-127 177-241 184-252 13-19 14-17 26 25 21 78 82 182 145 246 135 137 333 198 515 160 273 -57 463 -288 464 -561 0 -357 -318 -625 -671 -566 -103 18 -183 60 -265 138 -71 69 -442 554 -907 1187 -133 182 -255 344 -270 360 -42 46 -96 66 -181 65 -41 0 -94 -7 -116 -15z" />
                <path d="M1005 2379 c-163 -21 -374 -108 -506 -208 -148 -113 -294 -296 -365-460 -66 -153 -86 -247 -91 -438 -3 -108 -1 -197 6 -240 62 -360 288 -675 602-837 430 -224 942 -139 1281 212 97 100 163 194 155 216 -7 18 -321 451 -347 479 -16 17 -17 16 -29 -25 -55 -187 -219 -343 -411 -393 -85 -22 -241 -17 -321 11 -181 64 -327 219 -374 400 -19 75 -19 213 0 288 39 149 149 289 282 359 92 48 169 67 273 67 154 0 257 -39 362 -138 68 -64 407 -508 906-1186 134-182 256 -344 270-359 49 -52 98 -71 187-71 61 -1 91 4 126 21 118 54 199 202 170 309 -16 58 -39 92 -505 736 -521 719 -588 808 -693 919 -246 258 -611 384 -978 338z" />
              </g>
            </svg>
          </div>
        </a>

        {!isMobile && <SearchTopBar />}
      </div>

      {/* Title Section */}
      <div
        className={`${
          isMobile ? "flex-1 mx-1" : "flex flex-1 px-8"
        } items-center justify-center h-full my-auto`}
      >
        <div className="flex justify-between w-full">
          {iconBack ? (
            <div
              onClick={() => navigate(-1)}
              className="w-6 h-6 rounded-full bg-primary flex items-center justify-center hover:scale-110 cursor-pointer transition-transform border-1 border-borderNewFeed shadow-newFeed"
            >
              <FaArrowLeft size={12} className="text-bgStandard" />
            </div>
          ) : (
            <div className="w-6 h-6"></div>
          )}
          <div className="flex gap-x-4 items-center justify-center">
            <h1
              className={`${
                isMobile ? "text-xs" : "text-sm"
              } text-ascent-1 font-medium cursor-pointer truncate max-w-full`}
            >
              {t(title)}
            </h1>
            {/* Show SelectPosts on all screen sizes if conditions are met */}
            {selectPosts && user?.token && <SelectPosts />}
          </div>
          <div className="w-6 h-6" />
        </div>
      </div>

      {/* Navigation Icons */}
      {isMobile ? (
        <div className="w-1/3 flex justify-end">
          <button
            onClick={toggleMobileMenu}
            className="text-ascent-1 p-2 relative focus:outline-none"
            data-menu-toggle="main-menu"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div
              ref={mobileMenuRef}
              className="absolute top-14 right-2 bg-bgColor shadow-lg rounded-md p-4 z-40 w-64 border border-borderNewFeed transition-all duration-300 animate-fadeIn"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col gap-y-3 text-ascent-1">
                <div className="py-2 border-b border-borderNewFeed">
                  <SearchTopBar />
                </div>
                <div className="grid grid-cols-3 gap-4 py-2">
                  <div className="flex flex-col items-center justify-center hover:bg-primary/10 p-2 rounded-md transition-colors">
                    <Notifications />
                    <span className="text-xs mt-1">Notifications</span>
                  </div>
                  <div className="flex flex-col items-center justify-center hover:bg-primary/10 p-2 rounded-md transition-colors">
                    <Chat />
                    <span className="text-xs mt-1">Chat</span>
                  </div>
                  <div className="flex flex-col items-center justify-center hover:bg-primary/10 p-2 rounded-md transition-colors">
                    <ChangeLanguage />
                    <span className="text-xs mt-1">Language</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 py-2 border-t border-borderNewFeed">
                  <div className="flex flex-col items-center justify-center hover:bg-primary/10 p-2 rounded-md transition-colors">
                    {/* The Apps component is properly marked with data-menu-toggle */}
                    <Apps />
                    <span className="text-xs mt-1">Apps</span>
                  </div>
                  <div className="flex flex-col items-center justify-center hover:bg-primary/10 p-2 rounded-md transition-colors">
                    <Logout primary />
                    <span className="text-xs mt-1">Logout</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <ul className="w-1/4 flex gap-x-4 items-center text-ascent-1 text-base md:text-xl justify-end">
          <li>
            <Notifications />
          </li>
          <li>
            <Chat />
          </li>
          <li>
            <ChangeLanguage />
          </li>
          <li>
            <Apps />
          </li>
          <li>
            <Logout primary />
          </li>
        </ul>
      )}
    </div>
  );
};

export default TopBar;
