'use client';

import { useState, useMemo, useCallback } from 'react';
import { USOSActivity } from '@/lib/usos/types';

export function useTimetableFilter(activities: USOSActivity[], onTransition?: () => void) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleCategoryChange = useCallback(
    (cat: string) => {
      onTransition?.();
      setSelectedCategory(cat);
    },
    [onTransition]
  );

  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      if (selectedCategory !== 'all') {
        const cat = act.category || '';
        const classtypeStr = (
          typeof act.classtype_name === 'object'
            ? act.classtype_name?.pl || ''
            : act.classtype_name || ''
        ).toLowerCase();

        if (cat !== selectedCategory && !classtypeStr.includes(selectedCategory)) {
          return false;
        }
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const name = (typeof act.name === 'object' ? act.name?.pl || '' : act.name || '').toLowerCase();
        const courseId = (act.course_id || '').toLowerCase();
        const room = (act.room_number || '').toLowerCase();
        const lecturers = (act.lecturer_names || []).join(' ').toLowerCase();
        const note = (act.note || '').toLowerCase();

        if (
          !name.includes(q) &&
          !courseId.includes(q) &&
          !room.includes(q) &&
          !lecturers.includes(q) &&
          !note.includes(q)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [activities, selectedCategory, searchQuery]);

  return {
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    filteredActivities,
    handleCategoryChange,
  };
}
