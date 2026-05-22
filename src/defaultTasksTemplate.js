export const DEFAULT_TASKS_TEMPLATE = [
  {
    "name": "Apply For Permits",
    "start_day": 0,
    "duration_days": 14,
    "color": "#8b5cf6",
    "wbs_level": 1,
    "wbs": "1",
    "predecessor": null,
    "progress": 0
  },
  {
    "name": "Framing permit",
    "start_day": 0,
    "duration_days": 14,
    "color": "#8b5cf6",
    "wbs_level": 2,
    "wbs": "1.1",
    "predecessor": null,
    "progress": 0
  },
  {
    "name": "Electrical permit",
    "start_day": 0,
    "duration_days": 14,
    "color": "#8b5cf6",
    "wbs_level": 2,
    "wbs": "1.2",
    "predecessor": null,
    "progress": 0
  },
  {
    "name": "Plumbing permit",
    "start_day": 0,
    "duration_days": 14,
    "color": "#8b5cf6",
    "wbs_level": 2,
    "wbs": "1.3",
    "predecessor": null,
    "progress": 0
  },
  {
    "name": "HVAC permit",
    "start_day": 0,
    "duration_days": 14,
    "color": "#8b5cf6",
    "wbs_level": 2,
    "wbs": "1.4",
    "predecessor": null,
    "progress": 0
  },
  {
    "name": "Site Work",
    "start_day": 14,
    "duration_days": 29,
    "color": "#06b6d4",
    "wbs_level": 1,
    "wbs": "2",
    "predecessor": null,
    "progress": 0
  },
  {
    "name": "Level lot",
    "start_day": 14,
    "duration_days": 15,
    "color": "#06b6d4",
    "wbs_level": 2,
    "wbs": "2.1",
    "predecessor": "1",
    "progress": 0
  },
  {
    "name": "Install underground utilities",
    "start_day": 31,
    "duration_days": 12,
    "color": "#06b6d4",
    "wbs_level": 2,
    "wbs": "2.2",
    "predecessor": "2.1",
    "progress": 0
  },
  {
    "name": "Foundation",
    "start_day": 46,
    "duration_days": 36,
    "color": "#3b82f6",
    "wbs_level": 1,
    "wbs": "3",
    "predecessor": null,
    "progress": 0
  },
  {
    "name": "Footings - Excavate and Form",
    "start_day": 46,
    "duration_days": 1,
    "color": "#3b82f6",
    "wbs_level": 2,
    "wbs": "3.1",
    "predecessor": "2",
    "progress": 0
  },
  {
    "name": "Footings - Poor Concrete",
    "start_day": 47,
    "duration_days": 1,
    "color": "#3b82f6",
    "wbs_level": 2,
    "wbs": "3.2",
    "predecessor": "3.1",
    "progress": 0
  },
  {
    "name": "Footings - Cure Concrete",
    "start_day": 48,
    "duration_days": 9,
    "color": "#3b82f6",
    "wbs_level": 2,
    "wbs": "3.3",
    "predecessor": "3.2",
    "progress": 0
  },
  {
    "name": "Foundation - Build Forms",
    "start_day": 59,
    "duration_days": 3,
    "color": "#3b82f6",
    "wbs_level": 2,
    "wbs": "3.4",
    "predecessor": "3.3",
    "progress": 0
  },
  {
    "name": "Foundation- Poor Concrete",
    "start_day": 62,
    "duration_days": 5,
    "color": "#3b82f6",
    "wbs_level": 2,
    "wbs": "3.5",
    "predecessor": "3.4",
    "progress": 0
  },
  {
    "name": "Foundation- Cure Concrete",
    "start_day": 67,
    "duration_days": 11,
    "color": "#3b82f6",
    "wbs_level": 2,
    "wbs": "3.6",
    "predecessor": "3.5",
    "progress": 0
  },
  {
    "name": "Foundation- Inspection",
    "start_day": 80,
    "duration_days": 2,
    "color": "#3b82f6",
    "wbs_level": 2,
    "wbs": "3.7",
    "predecessor": "3.6",
    "progress": 0
  },
  {
    "name": "Framing",
    "start_day": 82,
    "duration_days": 48,
    "color": "#6366f1",
    "wbs_level": 1,
    "wbs": "4",
    "predecessor": null,
    "progress": 0
  },
  {
    "name": "Frame 1st Floor Walls",
    "start_day": 82,
    "duration_days": 10,
    "color": "#6366f1",
    "wbs_level": 2,
    "wbs": "4.1",
    "predecessor": "3",
    "progress": 0
  },
  {
    "name": "Install 2nd Floor Joists",
    "start_day": 94,
    "duration_days": 3,
    "color": "#6366f1",
    "wbs_level": 2,
    "wbs": "4.2",
    "predecessor": "4.1",
    "progress": 0
  },
  {
    "name": "Install 2nd Floor Decking",
    "start_day": 97,
    "duration_days": 2,
    "color": "#6366f1",
    "wbs_level": 2,
    "wbs": "4.3",
    "predecessor": "4.2",
    "progress": 0
  },
  {
    "name": "Frame 2nd Floor Walls",
    "start_day": 101,
    "duration_days": 9,
    "color": "#6366f1",
    "wbs_level": 2,
    "wbs": "4.4",
    "predecessor": "4.3",
    "progress": 0
  },
  {
    "name": "Install attice Joists",
    "start_day": 110,
    "duration_days": 3,
    "color": "#6366f1",
    "wbs_level": 2,
    "wbs": "4.5",
    "predecessor": "4.4",
    "progress": 0
  },
  {
    "name": "Frame roof structures",
    "start_day": 115,
    "duration_days": 10,
    "color": "#6366f1",
    "wbs_level": 2,
    "wbs": "4.6",
    "predecessor": "4.5",
    "progress": 0
  },
  {
    "name": "Framing Inspection",
    "start_day": 125,
    "duration_days": 5,
    "color": "#6366f1",
    "wbs_level": 2,
    "wbs": "4.7",
    "predecessor": "4.6",
    "progress": 0
  },
  {
    "name": "Dry In",
    "start_day": 130,
    "duration_days": 31,
    "color": "#0ea5e9",
    "wbs_level": 1,
    "wbs": "5",
    "predecessor": null,
    "progress": 0
  },
  {
    "name": "Outside sheeting - 1st floor",
    "start_day": 130,
    "duration_days": 3,
    "color": "#0ea5e9",
    "wbs_level": 2,
    "wbs": "5.1",
    "predecessor": "4",
    "progress": 0
  },
  {
    "name": "Outside sheeting - 2nd floor",
    "start_day": 133,
    "duration_days": 6,
    "color": "#0ea5e9",
    "wbs_level": 2,
    "wbs": "5.2",
    "predecessor": "5.1",
    "progress": 0
  },
  {
    "name": "Outside sheeting - roof",
    "start_day": 139,
    "duration_days": 5,
    "color": "#0ea5e9",
    "wbs_level": 2,
    "wbs": "5.3",
    "predecessor": "5.2",
    "progress": 0
  },
  {
    "name": "Lay roof paper and tile shingles",
    "start_day": 144,
    "duration_days": 9,
    "color": "#0ea5e9",
    "wbs_level": 2,
    "wbs": "5.4",
    "predecessor": "5.3",
    "progress": 0
  },
  {
    "name": "Paper and Barriers",
    "start_day": 153,
    "duration_days": 2,
    "color": "#0ea5e9",
    "wbs_level": 2,
    "wbs": "5.5",
    "predecessor": "5.4",
    "progress": 0
  },
  {
    "name": "Install windows and exterior doors",
    "start_day": 157,
    "duration_days": 4,
    "color": "#0ea5e9",
    "wbs_level": 2,
    "wbs": "5.6",
    "predecessor": "5.5",
    "progress": 0
  },
  {
    "name": "Exterior Finish",
    "start_day": 161,
    "duration_days": 14,
    "color": "#10b981",
    "wbs_level": 1,
    "wbs": "6",
    "predecessor": null,
    "progress": 0
  },
  {
    "name": "Hang exterior siding",
    "start_day": 161,
    "duration_days": 14,
    "color": "#10b981",
    "wbs_level": 2,
    "wbs": "6.1",
    "predecessor": "5.6",
    "progress": 0
  },
  {
    "name": "Complete rock work",
    "start_day": 161,
    "duration_days": 7,
    "color": "#10b981",
    "wbs_level": 2,
    "wbs": "6.2",
    "predecessor": "5.6",
    "progress": 0
  },
  {
    "name": "Hang Garage Door",
    "start_day": 168,
    "duration_days": 4,
    "color": "#10b981",
    "wbs_level": 2,
    "wbs": "6.3",
    "predecessor": "6.2",
    "progress": 0
  },
  {
    "name": "Utility Rough Ins",
    "start_day": 130,
    "duration_days": 10,
    "color": "#f59e0b",
    "wbs_level": 1,
    "wbs": "7",
    "predecessor": null,
    "progress": 0
  },
  {
    "name": "Plumbing Rough In",
    "start_day": 130,
    "duration_days": 4,
    "color": "#f59e0b",
    "wbs_level": 2,
    "wbs": "7.1",
    "predecessor": "4",
    "progress": 0
  },
  {
    "name": "Plumbing Inspection",
    "start_day": 136,
    "duration_days": 2,
    "color": "#f59e0b",
    "wbs_level": 2,
    "wbs": "7.2",
    "predecessor": "7.1",
    "progress": 0
  },
  {
    "name": "Electrical Rough In",
    "start_day": 130,
    "duration_days": 7,
    "color": "#f59e0b",
    "wbs_level": 2,
    "wbs": "7.3",
    "predecessor": "4",
    "progress": 0
  },
  {
    "name": "Electrical Inspection",
    "start_day": 137,
    "duration_days": 2,
    "color": "#f59e0b",
    "wbs_level": 2,
    "wbs": "7.4",
    "predecessor": "7.3",
    "progress": 0
  },
  {
    "name": "HVAC Rough In",
    "start_day": 130,
    "duration_days": 4,
    "color": "#f59e0b",
    "wbs_level": 2,
    "wbs": "7.5",
    "predecessor": "4",
    "progress": 0
  },
  {
    "name": "HVAC Inspection",
    "start_day": 136,
    "duration_days": 2,
    "color": "#f59e0b",
    "wbs_level": 2,
    "wbs": "7.6",
    "predecessor": "7.5",
    "progress": 0
  },
  {
    "name": "Low voltage/data Rough In",
    "start_day": 137,
    "duration_days": 3,
    "color": "#f59e0b",
    "wbs_level": 2,
    "wbs": "7.7",
    "predecessor": "7.3",
    "progress": 0
  },
  {
    "name": "Interior",
    "start_day": 140,
    "duration_days": 91,
    "color": "#ec4899",
    "wbs_level": 1,
    "wbs": "8",
    "predecessor": null,
    "progress": 0
  },
  {
    "name": "Insulate - 1st Floor",
    "start_day": 140,
    "duration_days": 4,
    "color": "#ec4899",
    "wbs_level": 2,
    "wbs": "8.1",
    "predecessor": "7",
    "progress": 0
  },
  {
    "name": "Insulate - 2nd Floor",
    "start_day": 144,
    "duration_days": 2,
    "color": "#ec4899",
    "wbs_level": 2,
    "wbs": "8.2",
    "predecessor": "8.1",
    "progress": 0
  },
  {
    "name": "Insulate - Attic",
    "start_day": 146,
    "duration_days": 1,
    "color": "#ec4899",
    "wbs_level": 2,
    "wbs": "8.3",
    "predecessor": "8.2",
    "progress": 0
  },
  {
    "name": "Insulation Inspection",
    "start_day": 147,
    "duration_days": 1,
    "color": "#ec4899",
    "wbs_level": 2,
    "wbs": "8.4",
    "predecessor": "8.3",
    "progress": 0
  },
  {
    "name": "Drywall - 1st Floor",
    "start_day": 151,
    "duration_days": 8,
    "color": "#ec4899",
    "wbs_level": 2,
    "wbs": "8.5",
    "predecessor": "8.4",
    "progress": 0
  },
  {
    "name": "Drywall - 2nd Floor",
    "start_day": 159,
    "duration_days": 8,
    "color": "#ec4899",
    "wbs_level": 2,
    "wbs": "8.6",
    "predecessor": "8.5",
    "progress": 0
  },
  {
    "name": "Tape and Mud 1st Floor",
    "start_day": 167,
    "duration_days": 5,
    "color": "#ec4899",
    "wbs_level": 2,
    "wbs": "8.7",
    "predecessor": "8.6",
    "progress": 0
  },
  {
    "name": "Tape and mud 2nd Floor",
    "start_day": 172,
    "duration_days": 3,
    "color": "#ec4899",
    "wbs_level": 2,
    "wbs": "8.8",
    "predecessor": "8.7",
    "progress": 0
  },
  {
    "name": "Texture - 1st Floor",
    "start_day": 175,
    "duration_days": 5,
    "color": "#ec4899",
    "wbs_level": 2,
    "wbs": "8.9",
    "predecessor": "8.8",
    "progress": 0
  },
  {
    "name": "Texture - 2nd Floor",
    "start_day": 180,
    "duration_days": 3,
    "color": "#ec4899",
    "wbs_level": 2,
    "wbs": "8.10",
    "predecessor": "8.9",
    "progress": 0
  },
  {
    "name": "Paint 1st Floor",
    "start_day": 186,
    "duration_days": 7,
    "color": "#ec4899",
    "wbs_level": 2,
    "wbs": "8.11",
    "predecessor": "8.10",
    "progress": 0
  },
  {
    "name": "Paint 2nd Floor",
    "start_day": 193,
    "duration_days": 7,
    "color": "#ec4899",
    "wbs_level": 2,
    "wbs": "8.12",
    "predecessor": "8.11",
    "progress": 0
  },
  {
    "name": "Exterior Paint",
    "start_day": 200,
    "duration_days": 4,
    "color": "#ec4899",
    "wbs_level": 2,
    "wbs": "8.13",
    "predecessor": "8.12",
    "progress": 0
  },
  {
    "name": "Install Kitchen Cabinets",
    "start_day": 193,
    "duration_days": 2,
    "color": "#ec4899",
    "wbs_level": 2,
    "wbs": "8.14",
    "predecessor": "8.11",
    "progress": 0
  },
  {
    "name": "Install Bathroom Cabinets",
    "start_day": 195,
    "duration_days": 2,
    "color": "#ec4899",
    "wbs_level": 2,
    "wbs": "8.15",
    "predecessor": "8.14",
    "progress": 0
  },
  {
    "name": "Finished woodworking",
    "start_day": 199,
    "duration_days": 4,
    "color": "#ec4899",
    "wbs_level": 2,
    "wbs": "8.16",
    "predecessor": "8.15",
    "progress": 0
  },
  {
    "name": "Complete electrical - 1st floor",
    "start_day": 203,
    "duration_days": 5,
    "color": "#ec4899",
    "wbs_level": 2,
    "wbs": "8.17",
    "predecessor": "8.16",
    "progress": 0
  },
  {
    "name": "Complete electrical - 2nd floor",
    "start_day": 208,
    "duration_days": 3,
    "color": "#ec4899",
    "wbs_level": 2,
    "wbs": "8.18",
    "predecessor": "8.17",
    "progress": 0
  },
  {
    "name": "Final electrical inspection",
    "start_day": 214,
    "duration_days": 1,
    "color": "#ec4899",
    "wbs_level": 2,
    "wbs": "8.19",
    "predecessor": "8.18",
    "progress": 0
  },
  {
    "name": "Finish plumbing - 1st floor",
    "start_day": 203,
    "duration_days": 5,
    "color": "#ec4899",
    "wbs_level": 2,
    "wbs": "8.20",
    "predecessor": "8.16",
    "progress": 0
  },
  {
    "name": "Finish plumbing - 2nd floor",
    "start_day": 208,
    "duration_days": 3,
    "color": "#ec4899",
    "wbs_level": 2,
    "wbs": "8.21",
    "predecessor": "8.20",
    "progress": 0
  },
  {
    "name": "Final plumbing inspection",
    "start_day": 214,
    "duration_days": 1,
    "color": "#ec4899",
    "wbs_level": 2,
    "wbs": "8.22",
    "predecessor": "8.21",
    "progress": 0
  },
  {
    "name": "Complete HVAC",
    "start_day": 203,
    "duration_days": 7,
    "color": "#ec4899",
    "wbs_level": 2,
    "wbs": "8.23",
    "predecessor": "8.16",
    "progress": 0
  },
  {
    "name": "Final HVAC Inspection",
    "start_day": 210,
    "duration_days": 7,
    "color": "#ec4899",
    "wbs_level": 2,
    "wbs": "8.24",
    "predecessor": "8.23",
    "progress": 0
  },
  {
    "name": "Lay tile - Bathrooms",
    "start_day": 217,
    "duration_days": 4,
    "color": "#ec4899",
    "wbs_level": 2,
    "wbs": "8.25",
    "predecessor": null,
    "progress": 0
  },
  {
    "name": "Lay title - Kitchen",
    "start_day": 221,
    "duration_days": 3,
    "color": "#ec4899",
    "wbs_level": 2,
    "wbs": "8.26",
    "predecessor": "8.25",
    "progress": 0
  },
  {
    "name": "Install Appliances",
    "start_day": 224,
    "duration_days": 4,
    "color": "#ec4899",
    "wbs_level": 2,
    "wbs": "8.27",
    "predecessor": "8.26",
    "progress": 0
  },
  {
    "name": "Carpet - 1st Floor",
    "start_day": 224,
    "duration_days": 4,
    "color": "#ec4899",
    "wbs_level": 2,
    "wbs": "8.28",
    "predecessor": "8.26",
    "progress": 0
  },
  {
    "name": "Carpet - 2nd Floor",
    "start_day": 228,
    "duration_days": 3,
    "color": "#ec4899",
    "wbs_level": 2,
    "wbs": "8.29",
    "predecessor": "8.28",
    "progress": 0
  },
  {
    "name": "Landscaping",
    "start_day": 206,
    "duration_days": 26,
    "color": "#14b8a6",
    "wbs_level": 1,
    "wbs": "9",
    "predecessor": null,
    "progress": 0
  },
  {
    "name": "Install sprinkler system",
    "start_day": 206,
    "duration_days": 3,
    "color": "#14b8a6",
    "wbs_level": 2,
    "wbs": "9.1",
    "predecessor": "8.13",
    "progress": 0
  },
  {
    "name": "Poor driveway/side walk concrete",
    "start_day": 209,
    "duration_days": 7,
    "color": "#14b8a6",
    "wbs_level": 2,
    "wbs": "9.2",
    "predecessor": "9.1",
    "progress": 0
  },
  {
    "name": "Concrete cure",
    "start_day": 216,
    "duration_days": 9,
    "color": "#14b8a6",
    "wbs_level": 2,
    "wbs": "9.3",
    "predecessor": "9.2",
    "progress": 0
  },
  {
    "name": "Lay sod",
    "start_day": 227,
    "duration_days": 2,
    "color": "#14b8a6",
    "wbs_level": 2,
    "wbs": "9.4",
    "predecessor": "9.3",
    "progress": 0
  },
  {
    "name": "Finish planting flowerbeds",
    "start_day": 229,
    "duration_days": 3,
    "color": "#14b8a6",
    "wbs_level": 2,
    "wbs": "9.5",
    "predecessor": "9.4",
    "progress": 0
  },
  {
    "name": "Final Cleanup and Approval",
    "start_day": 231,
    "duration_days": 14,
    "color": "#ef4444",
    "wbs_level": 1,
    "wbs": "10",
    "predecessor": null,
    "progress": 0
  },
  {
    "name": "Fiinal inspection",
    "start_day": 231,
    "duration_days": 4,
    "color": "#ef4444",
    "wbs_level": 2,
    "wbs": "10.1",
    "predecessor": "8",
    "progress": 0
  },
  {
    "name": "Cleanup for walk through",
    "start_day": 235,
    "duration_days": 3,
    "color": "#ef4444",
    "wbs_level": 2,
    "wbs": "10.2",
    "predecessor": "10.1",
    "progress": 0
  },
  {
    "name": "Final walk through",
    "start_day": 238,
    "duration_days": 1,
    "color": "#ef4444",
    "wbs_level": 2,
    "wbs": "10.3",
    "predecessor": null,
    "progress": 0
  },
  {
    "name": "Final touchups/repairs",
    "start_day": 242,
    "duration_days": 3,
    "color": "#ef4444",
    "wbs_level": 2,
    "wbs": "10.4",
    "predecessor": "10.3",
    "progress": 0
  }
];
