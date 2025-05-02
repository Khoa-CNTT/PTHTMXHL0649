
const ROOTS = {
  HOME: '/',
  DASHBOARD: '/dashboard',
};


export const paths = {
  home: ROOTS.HOME,
  admin: `${ROOTS.HOME}admin`,
  login: `${ROOTS.HOME}login`,
  register: `${ROOTS.HOME}register`,
  forgotPassword: `${ROOTS.HOME}forgot-password`,
  resetPassword: `${ROOTS.HOME}reset-password`,

  postDetail: `${ROOTS.HOME}posts/:id`,
  notifications: `${ROOTS.HOME}notifications`,
  explore: `${ROOTS.HOME}explore`,
  fundraising: `${ROOTS.HOME}fundraising`,
  messages: `${ROOTS.HOME}messages`,
  bookmarks: `${ROOTS.HOME}bookmarks`,
  profile: `${ROOTS.HOME}users/:id`,
  profileDetail: `${ROOTS.HOME}users/:id/edit`,
  settings: `${ROOTS.HOME}settings`,
  following: `${ROOTS.HOME}following`,
  exploreDetail: `${ROOTS.HOME}explore/:id`,
};


