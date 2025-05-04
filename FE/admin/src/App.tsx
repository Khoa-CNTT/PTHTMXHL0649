import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { jwtDecode } from "jwt-decode";
import * as AdminService from "./services/AdminService";
import { updateUser } from "./redux/Slices/userSlice";

// Import your components
import SignIn from "./pages/AuthPages/SignIn";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import UserManagement from "./pages/Managements/UserManagement";
import PostManagement from "./pages/Managements/PostManagement";
import GroupManagement from "./pages/Managements/GroupManagement";
import StoryManagement from "./pages/Managements/StoryManagement";
import RoleManagement from "./pages/Managements/RoleManagement";
import FundraisingManagement from "./pages/Managements/FundraisingManagement";
import SplashScreen from "./components/common/SplashScreen";
import PermissionManagement from "./pages/Managements/PermissionManagement";
import PostHistory from "@/pages/HistoriesManagement/PostHistory";

const ProtectedRoute = () => {
  const token = localStorage.getItem("token");

  if (!token || token === "undefined") {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

export default function App() {
  const searchParams = new URLSearchParams(window.location.search);
  const tk = searchParams.get("tk");
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const token = localStorage.getItem("token");

  const handleGetDetailUser = async ({ id, token }) => {
    try {
      const res = await AdminService.getDetailUserByUserId({ id });
      dispatch(updateUser({ ...res?.result, token }));
    } catch (error) {
      console.error("Failed to get user", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tk) {
      localStorage.setItem("token", tk);
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, [tk]);

  useEffect(() => {
    if (token && token !== "undefined") {
      try {
        const decoded = jwtDecode(token);
        if (decoded && decoded?.userId) {
          handleGetDetailUser({ id: decoded?.userId, token });
        } else {
          setLoading(false);
        }
      } catch (error) {
        localStorage.removeItem("token");
      }
    } else {
      setLoading(false);
    }
  }, [token]);

  if (loading) return <SplashScreen />;

  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<SignIn />} />

          {/* Protected Routes - All wrapped in AppLayout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index path="/" element={<Home />} />

              {/* Others Page */}
              <Route path="/profile" element={<UserProfiles />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/blank" element={<Blank />} />

              {/* Forms */}
              <Route path="/form-elements" element={<FormElements />} />

              {/* Management */}
              <Route path="/user-management" element={<UserManagement />} />
              <Route path="/post-management" element={<PostManagement />} />
              <Route path="/group-management" element={<GroupManagement />} />
              <Route path="/story-management" element={<StoryManagement />} />
              <Route path="/role-management" element={<RoleManagement />} />
              <Route
                path="/permission-management"
                element={<PermissionManagement />}
              />
              <Route
                path="/fundraising-management"
                element={<FundraisingManagement />}
              />

              {/* History */}
              <Route path="/post-history" element={<PostHistory />} />

              {/* Ui Elements */}
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/avatars" element={<Avatars />} />
              <Route path="/badge" element={<Badges />} />
              <Route path="/buttons" element={<Buttons />} />
              <Route path="/images" element={<Images />} />
              <Route path="/videos" element={<Videos />} />

              {/* Charts */}
              <Route path="/line-chart" element={<LineChart />} />
              <Route path="/bar-chart" element={<BarChart />} />
            </Route>
          </Route>

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
