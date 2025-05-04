import React from "react";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";

const pageVisitsData = [
  {
    page: "/argon/",
    visitors: "4,569",
    users: "340",
    bounceRate: "46.53%",
    trend: "up",
  },
  {
    page: "/argon/index.html",
    visitors: "3,985",
    users: "319",
    bounceRate: "46.53%",
    trend: "down",
  },
  {
    page: "/argon/charts.html",
    visitors: "3,513",
    users: "294",
    bounceRate: "36.49%",
    trend: "down",
  },
  {
    page: "/argon/tables.html",
    visitors: "2,050",
    users: "147",
    bounceRate: "50.87%",
    trend: "up",
  },
  {
    page: "/argon/profile.html",
    visitors: "1,795",
    users: "190",
    bounceRate: "46.53%",
    trend: "down",
  },
];

const CardPageVisits = () => {
  return (
    <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">
      <div className="rounded-t px-4 py-3 border-b">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-base text-gray-700">Page Visits</h3>
          <button className="bg-indigo-500 text-white text-xs font-bold uppercase px-3 py-1 rounded transition duration-150 hover:bg-indigo-600">
            See all
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full bg-transparent border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-600 uppercase text-xs font-semibold">
              <th className="px-6 py-3 text-left">Page Name</th>
              <th className="px-6 py-3 text-left">Visitors</th>
              <th className="px-6 py-3 text-left">Unique Users</th>
              <th className="px-6 py-3 text-left">Bounce Rate</th>
            </tr>
          </thead>
          <tbody>
            {pageVisitsData.map((row, index) => (
              <tr key={index} className="border-b">
                <td className="px-6 py-4 text-left">{row.page}</td>
                <td className="px-6 py-4">{row.visitors}</td>
                <td className="px-6 py-4">{row.users}</td>
                <td className="px-6 py-4 flex items-center">
                  {row.trend === "up" ? (
                    <FaArrowUp className="text-green-500 mr-2" />
                  ) : (
                    <FaArrowDown className="text-red-500 mr-2" />
                  )}
                  {row.bounceRate}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CardPageVisits;
