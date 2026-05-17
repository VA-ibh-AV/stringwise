export const ACCENT_OPTIONS = ['#E8A020', '#CC6040', '#44AA77', '#5088CC']

export const BATCHES = [
  { id: 'sat-int', name: 'Saturday Intermediate', color: '#E8A020', schedule: 'Sat 4–6pm',         day: 'Sat', time: '4:00–6:00 PM',       duration: 120 },
  { id: 'wed-beg', name: 'Wednesday Beginners A',  color: '#5088CC', schedule: 'Wed 6–7pm',         day: 'Wed', time: '6:00–7:00 PM',       duration: 60  },
  { id: 'tue-adv', name: 'Tuesday Advanced',        color: '#9966BB', schedule: 'Tue 8–9:30pm',      day: 'Tue', time: '8:00–9:30 PM',       duration: 90  },
  { id: 'thu-kid', name: 'Thursday Kids',           color: '#44AA77', schedule: 'Thu 5–6pm',         day: 'Thu', time: '5:00–6:00 PM',       duration: 60  },
  { id: 'sun-fnp', name: 'Sunday Fingerstyle',      color: '#CC6040', schedule: 'Sun 11am–12:30pm',  day: 'Sun', time: '11:00 AM–12:30 PM', duration: 90  },
  { id: 'fri-pri', name: 'Friday Private',          color: '#CC5577', schedule: 'Fri (varies)',       day: 'Fri', time: '6:00 PM',           duration: 60  },
]

export const STUDENTS = [
  { id: 'st-01', name: 'Arjun Sharma',    initials: 'AS', batch: 'sat-int', level: 'Intermediate', joined: 'Mar 2024', lessons: 24, lastSeen: '2 days ago'  },
  { id: 'st-02', name: 'Priya Nair',      initials: 'PN', batch: 'wed-beg', level: 'Beginner',     joined: 'Jan 2025', lessons: 8,  lastSeen: 'Today'        },
  { id: 'st-03', name: 'Rahul Mehta',     initials: 'RM', batch: 'tue-adv', level: 'Advanced',     joined: 'Sep 2023', lessons: 51, lastSeen: 'Yesterday'    },
  { id: 'st-04', name: 'Sneha Iyer',      initials: 'SI', batch: 'thu-kid', level: 'Beginner',     joined: 'Feb 2025', lessons: 6,  lastSeen: '3 days ago'  },
  { id: 'st-05', name: 'Karthik Rao',     initials: 'KR', batch: 'sat-int', level: 'Intermediate', joined: 'Jun 2024', lessons: 18, lastSeen: 'Today'        },
  { id: 'st-06', name: 'Ananya Desai',    initials: 'AD', batch: 'sun-fnp', level: 'Intermediate', joined: 'Nov 2024', lessons: 12, lastSeen: '5 days ago'  },
  { id: 'st-07', name: 'Vikram Singh',    initials: 'VS', batch: 'tue-adv', level: 'Advanced',     joined: 'Jun 2023', lessons: 64, lastSeen: 'Yesterday'    },
  { id: 'st-08', name: 'Meera Pillai',    initials: 'MP', batch: 'wed-beg', level: 'Beginner',     joined: 'Mar 2025', lessons: 4,  lastSeen: 'Today'        },
  { id: 'st-09', name: 'Rohan Joshi',     initials: 'RJ', batch: 'fri-pri', level: 'Intermediate', joined: 'Aug 2024', lessons: 20, lastSeen: '1 week ago'  },
  { id: 'st-10', name: 'Divya Krishnan',  initials: 'DK', batch: 'sat-int', level: 'Intermediate', joined: 'Apr 2024', lessons: 22, lastSeen: '2 days ago'  },
  { id: 'st-11', name: 'Aditya Patel',    initials: 'AP', batch: 'thu-kid', level: 'Beginner',     joined: 'Jan 2025', lessons: 9,  lastSeen: '4 days ago'  },
  { id: 'st-12', name: 'Lakshmi Varma',   initials: 'LV', batch: 'sun-fnp', level: 'Advanced',     joined: 'Jul 2024', lessons: 17, lastSeen: 'Yesterday'    },
  { id: 'st-13', name: 'Nikhil Bose',     initials: 'NB', batch: 'wed-beg', level: 'Beginner',     joined: 'Feb 2025', lessons: 6,  lastSeen: '3 days ago'  },
  { id: 'st-14', name: 'Sanjana Reddy',   initials: 'SR', batch: 'tue-adv', level: 'Advanced',     joined: 'Nov 2023', lessons: 38, lastSeen: 'Today'        },
]

export const LESSONS = [
  { id: 'l-01', title: 'A Minor Pentatonic — Box 1 Ascending',     batch: 'sat-int', sections: 2, bars: 3,  lastEdited: 'May 9'   },
  { id: 'l-02', title: 'Open Chord Transitions — C G Am F',         batch: 'wed-beg', sections: 3, bars: 4,  lastEdited: 'May 7'   },
  { id: 'l-03', title: 'Economy Picking — Alternate Run',            batch: 'tue-adv', sections: 4, bars: 8,  lastEdited: 'May 6'   },
  { id: 'l-04', title: 'Fingerstyle Basics — Travis Picking',       batch: 'sun-fnp', sections: 2, bars: 4,  lastEdited: 'May 5'   },
  { id: 'l-05', title: 'Mary Had a Little Lamb',                     batch: 'thu-kid', sections: 1, bars: 4,  lastEdited: 'May 4'   },
  { id: 'l-06', title: 'Blues Scale — Position 1',                   batch: 'tue-adv', sections: 3, bars: 6,  lastEdited: 'May 2'   },
  { id: 'l-07', title: 'Barre Chord Workout — F & Bm',              batch: 'sat-int', sections: 2, bars: 4,  lastEdited: 'Apr 30'  },
  { id: 'l-08', title: 'Thumb Independence — Travis Pattern',        batch: 'sun-fnp', sections: 3, bars: 6,  lastEdited: 'Apr 28'  },
]

// Upcoming sessions for the current week (today = Saturday May 10)
export const UPCOMING = [
  { label: 'Today',  batch: 'sat-int', today: true  },
  { label: 'Sun',    batch: 'sun-fnp', today: false },
  { label: 'Tue',    batch: 'tue-adv', today: false },
  { label: 'Wed',    batch: 'wed-beg', today: false },
  { label: 'Thu',    batch: 'thu-kid', today: false },
  { label: 'Fri',    batch: 'fri-pri', today: false },
]
