import { getData } from "../api/apiClient";
import { Api } from "../config/apiConstant";
import { MovieResponse, MoviesListResponse } from "../types/types";
import { extractErrorMessage } from "../utils/Helper";
import { toast } from "../utils/Toast";

export const MoviesList = async (
  page: number,
  limit: number,
  query?: string
): Promise<MoviesListResponse> => {
  try {
    const queryParamName = "search";
    const qs = query ? `&${queryParamName}=${encodeURIComponent(query)}` : "";
    const url = `${Api.MOVIE_LIST}?page=${page}&limit=${limit}${qs}`;

    const response = (await getData(url)) as MoviesListResponse;
    return response;
  } catch (error: unknown) {
    const msg = extractErrorMessage(error);
    toast.error(msg);
    throw error;
  }
};

export const MoviesDetails = async (movieId: string): Promise<MovieResponse> => {
  try {
    const url = `${Api.MOVIE_DETAILS}/${movieId}/complete`;
    const response = (await getData(url)) as MovieResponse;
    return response;
  } catch (error: unknown) {
    const msg = extractErrorMessage(error);
    toast.error(msg || "Unable to load movie details");
    throw error;
  }
};
