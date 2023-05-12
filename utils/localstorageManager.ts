import axios from "axios";
import { IGroupMember } from "../@types/group";

export const saveRecentGroups = () => {};

export const loadRecentGroups = () => {};

export const saveUserToLocal = (leetcodeUsername: string) => {
  localStorage.setItem("user", leetcodeUsername);
};

export const loadUserFromLocal = async (): Promise<IGroupMember | null> => {
  const leetcodeUsername = localStorage.getItem("user");
  if (!leetcodeUsername) return null;
  return (await axios.get(
    `/api/groups/user?leetcodeUsername=${leetcodeUsername}`
  )).data;
};