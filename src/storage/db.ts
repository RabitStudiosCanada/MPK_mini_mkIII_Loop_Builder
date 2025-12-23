import { get, set, del, keys } from 'idb-keyval';
import { ControllerProfile, Project } from '../types';

export const PROJECTS_STORE = 'projects';
export const PROFILES_STORE = 'profiles';
export const SAMPLES_STORE = 'samples';

export async function saveProject(id: string, project: Project) {
  await set(`${PROJECTS_STORE}:${id}`, project);
}

export async function loadProject(id: string) {
  return get<Project>(`${PROJECTS_STORE}:${id}`);
}

export async function listProjects() {
  const ks = await keys();
  return ks
    .filter((k) => typeof k === 'string' && (k as string).startsWith(`${PROJECTS_STORE}:`))
    .map((k) => (k as string).split(':')[1]);
}

export async function saveProfile(profile: ControllerProfile) {
  await set(`${PROFILES_STORE}:${profile.id}`, profile);
}

export async function loadProfile(id: string) {
  return get<ControllerProfile>(`${PROFILES_STORE}:${id}`);
}

export async function listProfiles() {
  const ks = await keys();
  return ks
    .filter((k) => typeof k === 'string' && (k as string).startsWith(`${PROFILES_STORE}:`))
    .map((k) => (k as string).split(':')[1]);
}

export async function saveSample(id: string, data: ArrayBuffer) {
  await set(`${SAMPLES_STORE}:${id}`, data);
}

export async function loadSample(id: string) {
  return get<ArrayBuffer>(`${SAMPLES_STORE}:${id}`);
}
