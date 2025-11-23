
export const Url = {
  // BASE_URL: 'http://192.168.0.113:8080/api',
  BASE_URL: 'http://cinemademoapi.wrapoh.in:5000/api',
//   BASE_URL: 'http://192.168.0.124:8080/api',
};

export const Api = {
  REGISTER: '/users/mobile/auth/register',
  VERIFY_OTP: '/users/mobile/auth/verify',
  IDENTIFY_REGISTER: '/users/mobile/send-identifier-otp',
  IDENTIFY_VERIFY_OTP: '/users/mobile/verify-identifier',
  REFRESH: 'users/auth/refresh',
  MOVIE_LIST: '/movies/mobile',
  MOVIE_DETAILS: '/movies',
  CONTEST_LIST: '/contests/mobile',
  TEAMS_MEMBERS_AVAILABLE: '/teams/contest',
  SAVE_SELECTED_TEAMS: '/teams',
  ASSIGN_ROLES: '/teams/assign-roles',
  SAVE_PROFILE: '/users/mobile/profile',
  SAVE_KYC: '/users/mobile/kyc',
  SAVE_PERMISSION: '/users/mobile/permissions',
  LOGOUT: 'users/mobile/logout'
}