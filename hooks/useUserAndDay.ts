"use client";

import { useEffect } from "react";
import useSWR from "swr";
import { useAuth } from "@clerk/nextjs";
import { User, Day } from "@/app/context/models";
import { useAppContext } from "@/app/context/AppContext";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useUserAndDay() {
  const { isLoaded, userId } = useAuth();
  const { setDay } = useAppContext();

  // Fetch user data
  const { data: userData, error: userError } = useSWR(
    isLoaded && userId ? `/api/users/check-or-create?clerkId=${userId}` : null,
    fetcher
  );

  // Fetch day data
  const {
    data: dayData,
    error: dayError,
    mutate,
  } = useSWR(
    userData ? `/api/days/today?userId=${userData._id}` : null,
    fetcher
  );

  useEffect(() => {
    if (dayData) {
      setDay(dayData);
    }
  }, [dayData, setDay]);

  return {
    user: userData,
    day: dayData,
    isLoading: (!userError && !userData) || (!dayError && !dayData),
    isError: userError || dayError,
    mutate,
  };
}
