export type ClassType = 
  | 'wykład'
  | 'laboratorium'
  | 'ćwiczenia'
  | 'projekt'
  | 'seminarium'
  | 'lektorat'
  | 'inne';

export interface LangText {
  pl: string;
  en?: string;
}

export interface USOSLecturer {
  id?: number | string;
  first_name?: string;
  last_name?: string;
  titles?: {
    before?: string | null;
    after?: string | null;
  };
  email?: string;
  formatted_name?: string;
}

export interface USOSActivity {
  id: string;
  type: string;
  start_time: string;
  end_time: string;
  name: LangText | string;
  course_name: LangText | string;
  course_id?: string;
  classtype_name: LangText | string;
  classtype_id?: string;
  room_number?: string;
  room_id?: string;
  building_name?: LangText | string;
  building_id?: string;
  lecturer_ids?: number[];
  lecturer_names?: string[];
  lecturers?: USOSLecturer[];
  group_number?: number | string;
  unit_id?: number | string;
  note?: string;
  url?: string;
  color?: string;
  category?: ClassType;
}

export interface USOSUser {
  id: string;
  first_name: string;
  last_name: string;
  student_number?: string;
  email?: string;
  faculty?: string;
  photo_url?: string;
}

export interface OAuthCredentials {
  consumerKey: string;
  consumerSecret: string;
  accessToken?: string;
  accessTokenSecret?: string;
}

export interface CourseSearchResult {
  course_id: string;
  match: string;
}

export interface TimetableFilter {
  searchQuery: string;
  classType: string;
  showWeekend: boolean;
}
