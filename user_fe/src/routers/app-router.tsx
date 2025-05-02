import { SidebarRight } from '@layouts/components';
import MainLayout from '@layouts/main-layout';
import SidebySideLayout from '@layouts/sbs-layout';
import ErrorPage from '@pages/error/error-page';
import { Home } from '@pages/home';
import { Message } from '@pages/message';
import Login from '@pages/auth/login';
import Notifications from '@pages/notifications/notifications';
import { PostDetail } from '@pages/post-detail';
import Settings from '@pages/settings/settings';
import { paths } from '@routers/path';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from 'react-router-dom';
import { Profile } from '@pages/profile';
import { Bookmarks } from '@pages/bookmarks';
import Register from '@pages/auth/register';
import { Following } from '@pages/following';
import { ExploreDetail } from '@pages/explore-detail';
import { Explore } from '@pages/explore';
import { EditProfile } from '@pages/edit-profile';
import ForgotPassword from '@pages/auth/forgot-password';
import ResetPassword from '@pages/auth/reset-password';
import Fundraising from '@pages/fundraising/fundraising';
import Admin from '@pages/admin/admin';

const AppRouter = () => {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route errorElement={<ErrorPage />}>
        {/* public routes */}
        <Route path={paths.login} element={<Login />} />
        <Route path={paths.register} element={<Register />} />
        <Route path={paths.forgotPassword} element={<ForgotPassword />} />
        <Route path={paths.resetPassword} element={<ResetPassword />} />
        <Route path={paths.admin} element={<Admin />} />

        {/* main layout */}
        <Route path={paths.home} element={<MainLayout />}>
          <Route
            element={<SidebySideLayout sideComponent={<SidebarRight />} />}
          >
            <Route index element={<Home />} />
            <Route path={paths.notifications} element={<Notifications />} />
            <Route path={paths.postDetail} element={<PostDetail />} />
            <Route path={paths.profile} element={<Profile />} />
            <Route path={paths.profileDetail} element={<EditProfile />} />
            <Route path={paths.following} element={<Following />} />
            <Route path={paths.exploreDetail} element={<ExploreDetail />} />
            <Route path={paths.explore} element={<Explore />} />
            <Route path={paths.fundraising} element={<Fundraising />} />
          </Route>
          <Route path={paths.settings} element={<Settings />} />
          <Route path={`${paths.messages}/*`} element={<Message />} />
          <Route path={`${paths.bookmarks}/*`} element={<Bookmarks />} />
        </Route>
      </Route>,
    ),
  );

  return <RouterProvider router={router} />;
};

export default AppRouter;
