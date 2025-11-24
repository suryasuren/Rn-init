import { AxiosRequestConfig } from "axios";
import { ViewStyle } from "react-native";

export type User = {
  id?: string;
  firstName?: string;
  profilePicture?: string;
  email?: string;
  gender?: string;
  country?: string;
  kyc?: unknown;
  permissions?: unknown;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type UserResponse = {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null; // raw from backend
  maritalStatus?: string | null; // raw from backend
  anniversaryDate?: string | null;
  profilePicture?: string | null;
  doorNumber?: string | null;
  streetOrVillageName?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
};



export type ApiResponseWithUser = { code?: number; message?: string; data?: { user?: User } | null };

export type ApiResponseWithUserData = {
  code: number;
  data?: {
    user?: UserResponse;
  };
};

export type MovieListSkeletonProps = {
  cardWidth: number;
  columns: number;
  small?: boolean;
};

export type KycSkeletonProps = {
  style?: ViewStyle;
  // size modifier to scale skeleton for compact / regular screens
  size?: "normal" | "large";
  // optional simple layout selector (if you want different skeletons later)
  variant?: "form" | "full";
};

export type ApiResponse<T> = {
  code?: number;
  message?: string;
  data?: T;
};
export type RequestConfig = AxiosRequestConfig & { skipAuth?: boolean };



export type MovieResponse = {
  _id: string;
  movieName: string;
  movieTypeId: {
    _id: string;
    movieType: string;
  };
  certificateTypeId: {
    _id: string;
    certificateType: string;
  };
  movieReleaseDate: string;
  runtime: string | number;
  languageId: Array<{
    _id: string;
    language: string;
  }>;
  productionCompanyName: string;
  distributor: string;
  budget: string | number;
  dimension: string;
  countryOfOrigin: string;
  aboutMovie: string;
  movieSynopsis: string;
  movieStatus: string;

  rejectedAt: string | null;
  rejectedBy: string | null;

  isDeleted: boolean;
  deletedAt: string | null;
  deletedBy: string | null;

  restoredAt: string | null;
  restoredBy: string | null;

  publishedAt: string | null;
  publishedBy: string | null;

  unpublishedAt: string | null;
  unpublishedBy: string | null;
  unpublishReason: string | null;

  approvedAt: string | null;
  approvedBy: string | null;

  createdAt: string;
  updatedAt: string;

  media: {
    moviePoster: string | null;
    movieBanner: string | null;
    trailerVideo: string[];
    galleryImages: string[];
  };

  releaseDate: string;
  type: string;
  language: string;
  certificate: string;
};

export type MoviesListResponse = {
  code: number;
  data: MovieResponse[];
  pagination?: { total?: number; page?: number; limit?: number };
  message?: string;
};

export type ApiResponseUnknown<T = unknown> = { code?: number; message?: string; data?: T };


export type UserPayload = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  dateOfBirth?: string | null; // yyyy-mm-dd
  gender?: 'male' | 'female' | '';
  maritalStatus: '' | 'Single' | 'Married' | undefined;
  anniversaryDate?: string | null; // yyyy-mm-dd
  profilePicture?: string | null;
  doorNumber?: string;
  streetOrVillageName?: string;
  city?: string;
  state?: string;
  pincode?: string;
};

export type KycFormState = {
  aadhaar: string;
  aadhaarName: string;
  dob: string;
  pan: string;
  bankAccount: string;
  bankName: string;
  ifsc: string;
  mobile: string;
  email: string;
};