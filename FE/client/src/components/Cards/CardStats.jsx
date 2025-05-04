import { Statistic } from "antd";
import { useEffect, useState } from "react";
import { LiaUsersSolid } from "react-icons/lia";

const getRandomValue = (min, max) =>
  Math.floor(Math.random() * (max - min + 1) + min);

const CardStats = ({
  statSubtitle = "Traffic",
  statTitle = "350,897",
  statArrow = "up",
  statPercent = "3.48",
  statPercentColor = "text-emerald-500",
  statDescripiron = "Since last month",
  statIconName = "far fa-chart-bar",
  statIconColor = "bg-red-500",
}) => {
  const [activeUsers, setActiveUsers] = useState(
    getRandomValue(100000, 150000)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveUsers(getRandomValue(100000, 150000));
    }, 2000);

    return () => clearInterval(interval);
  }, []);
  return (
    <>
      <div className="relative flex flex-col min-w-0 break-words bg-white rounded mb-6 xl:mb-0 shadow-lg">
        <div className="flex-auto p-4">
          <div className="flex flex-wrap">
            <div className="relative w-full pr-4 max-w-full flex-grow flex-1">
              <h5 className="text-blueGray-400 uppercase font-bold text-xs">
                {statSubtitle}
              </h5>
              <span className="font-semibold text-xl text-blueGray-700">
                <Statistic title="Active Users" value={activeUsers} />
              </span>
            </div>
            <div className="relative w-auto pl-4 flex-initial">
              <div
                className={
                  "text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 shadow-lg rounded-full " +
                  statIconColor
                }
              >
                <LiaUsersSolid size={22} />
              </div>
            </div>
          </div>
          <p className="text-sm text-blueGray-400 mt-4">
            <span className={statPercentColor + " mr-2"}>
              <i
                className={
                  statArrow === "up"
                    ? "fas fa-arrow-up"
                    : statArrow === "down"
                    ? "fas fa-arrow-down"
                    : ""
                }
              ></i>{" "}
              {statPercent}%
            </span>
            <span className="whitespace-nowrap">{statDescripiron}</span>
          </p>
        </div>
      </div>
    </>
  );
};

export default CardStats;
