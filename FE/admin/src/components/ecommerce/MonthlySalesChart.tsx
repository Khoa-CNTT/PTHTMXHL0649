import Chart from "react-apexcharts";
import { useState } from "react";
import { MoreDotIcon } from "../../icons";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import * as StatisticService from "@/services/StatisticService";
import { useQuery } from "@tanstack/react-query";

export default function MonthlySalesChart() {
  // Mock data from the API response
  const fetchUserData = async () => {
    const res = await StatisticService.getUsers();
    return res;
  };
  const { data } = useQuery({
    queryKey: ["userData"],
    queryFn: fetchUserData,
  });

  let userData = data || {
    totalGroups: 0,
    createdToday: 0,
    createdThisMonth: 0,
    createdThisYear: 0,
    topGroups: [],
    visibilityStats: {
      PUBLIC: "0/0",
      PROTECTED: "0/0",
      PRIVATE: "0/0",
    },
  };

  // Monthly registration data for chart
  const monthlyData = [
    156, 215, 187, 198, 142, 165, 207, 134, 165, 183, 152, 176,
  ];

  const [isOpen, setIsOpen] = useState(false);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  // Bar chart options
  const barOptions = {
    colors: ["#4f46e5"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 180,
      toolbar: {
        show: false,
      },
      background: "transparent",
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "50%",
        borderRadius: 6,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 4,
      colors: ["transparent"],
    },
    xaxis: {
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: "#94a3b8",
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: "#94a3b8",
        },
      },
    },
    grid: {
      borderColor: "#f1f5f9",
      strokeDashArray: 4,
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    fill: {
      opacity: 1,
      type: "gradient",
      gradient: {
        shade: "light",
        type: "vertical",
        shadeIntensity: 0.5,
        gradientToColors: ["#818cf8"],
        inverseColors: false,
        opacityFrom: 1,
        opacityTo: 0.8,
      },
    },
    tooltip: {
      y: {
        formatter: (val) => `${val} users`,
      },
    },
  };

  // Donut chart options for gender distribution
  const genderDonutOptions = {
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "donut",
    },
    colors: ["#4f46e5", "#ec4899", "#8b5cf6"],
    labels: ["Male", "Female", "Other"],
    stroke: {
      width: 0,
    },
    legend: {
      position: "bottom",
      fontFamily: "Outfit",
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      y: {
        formatter: (val) => `${val} users`,
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: "16px",
              fontFamily: "Outfit, sans-serif",
              color: "#334155",
            },
            value: {
              show: true,
              fontSize: "20px",
              fontFamily: "Outfit, sans-serif",
              color: "#334155",
              formatter: (val) => `${val}`,
            },
            total: {
              show: true,
              label: "Total",
              fontSize: "14px",
              fontFamily: "Outfit, sans-serif",
              color: "#64748b",
              formatter: function (w) {
                return userData.totalUsers;
              },
            },
          },
        },
      },
    },
  };

  const barSeries = [
    {
      name: "New Registrations",
      data: monthlyData,
    },
  ];

  const genderDonutSeries = [
    userData?.maleUsers,
    userData?.femaleUsers,
    userData?.otherUsers,
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Monthly Activity Chart */}
      <div className="lg:col-span-2 overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Monthly User Registrations
          </h3>
          <div className="relative inline-block">
            <button className="dropdown-toggle" onClick={toggleDropdown}>
              <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 size-6" />
            </button>
            <Dropdown
              isOpen={isOpen}
              onClose={closeDropdown}
              className="w-40 p-2"
            >
              <DropdownItem
                onItemClick={closeDropdown}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                View Details
              </DropdownItem>
              <DropdownItem
                onItemClick={closeDropdown}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                Export Data
              </DropdownItem>
            </Dropdown>
          </div>
        </div>

        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
            <Chart
              options={barOptions}
              series={barSeries}
              type="bar"
              height={240}
            />
          </div>
        </div>
      </div>

      {/* Gender Distribution */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
          Gender Distribution
        </h3>
        <Chart
          options={genderDonutOptions}
          series={genderDonutSeries}
          type="donut"
          height={240}
        />
      </div>

      {/* Stats Cards */}
      <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Users */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Users
              </h4>
              <p className="mt-1 text-2xl font-semibold text-gray-800 dark:text-white">
                {userData.totalUsers}
              </p>
            </div>
            <div className="rounded-full bg-indigo-100 p-3 dark:bg-indigo-900/20">
              <svg
                className="size-5 text-indigo-600 dark:text-indigo-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                ></path>
              </svg>
            </div>
          </div>
        </div>

        {/* Online Status */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Online Users
              </h4>
              <div className="flex items-end gap-1">
                <p className="mt-1 text-2xl font-semibold text-gray-800 dark:text-white">
                  {userData.onlineUsers}
                </p>
                <p className="mb-1 text-sm font-medium text-emerald-500">
                  ({userData.onlinePercentage}%)
                </p>
              </div>
            </div>
            <div className="rounded-full bg-emerald-100 p-3 dark:bg-emerald-900/20">
              <svg
                className="size-5 text-emerald-600 dark:text-emerald-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z"
                ></path>
              </svg>
            </div>
          </div>
        </div>

        {/* Today's Registrations */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Registered Today
              </h4>
              <p className="mt-1 text-2xl font-semibold text-gray-800 dark:text-white">
                {userData.registeredToday}
              </p>
            </div>
            <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/20">
              <svg
                className="size-5 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                ></path>
              </svg>
            </div>
          </div>
        </div>

        {/* Monthly Registrations */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                This Month
              </h4>
              <p className="mt-1 text-2xl font-semibold text-gray-800 dark:text-white">
                {userData.registeredThisMonth}
              </p>
            </div>
            <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/20">
              <svg
                className="size-5 text-purple-600 dark:text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
