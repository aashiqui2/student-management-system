export const DEPARTMENTS = [
  {
    label: "Engineering",
    options: [
      { label: "Computer Science and Engineering (CSE)", value: "CSE" },
      { label: "Information Technology (IT)", value: "IT" },
      { label: "Artificial Intelligence and Machine Learning (AI & ML)", value: "AI & ML" },
      { label: "Artificial Intelligence and Data Science (AI & DS)", value: "AI & DS" },
      { label: "Computer Science and Business Systems (CSBS)", value: "CSBS" },
      { label: "Computer Engineering", value: "Computer Engineering" },
      { label: "Cyber Security", value: "Cyber Security" },
      { label: "Data Science", value: "Data Science" },
      { label: "Internet of Things (IoT)", value: "IoT" },
      { label: "Robotics and Artificial Intelligence", value: "Robotics and AI" },
      { label: "Software Engineering", value: "Software Engineering" },
      { label: "Cloud Computing", value: "Cloud Computing" },
      { label: "Blockchain Technology", value: "Blockchain Technology" }
    ].sort((a, b) => a.label.localeCompare(b.label))
  },
  {
    label: "Arts & Science",
    options: [
      { label: "B.Sc Computer Science", value: "B.Sc CS" },
      { label: "B.Sc Information Technology", value: "B.Sc IT" },
      { label: "B.Sc Artificial Intelligence", value: "B.Sc AI" },
      { label: "B.Sc Artificial Intelligence and Machine Learning", value: "B.Sc AI & ML" },
      { label: "B.Sc Data Science", value: "B.Sc Data Science" },
      { label: "B.Sc Cyber Security", value: "B.Sc Cyber Security" },
      { label: "B.Sc Computer Technology", value: "B.Sc Computer Technology" },
      { label: "B.Sc Software Systems", value: "B.Sc Software Systems" },
      { label: "B.Sc Computer Applications", value: "B.Sc Computer Applications" }
    ].sort((a, b) => a.label.localeCompare(b.label))
  }
];

export const SPECIALIZATIONS = [
  { label: "General", value: "General" },
  { label: "Computer Application", value: "Computer Application" },
  { label: "Artificial Intelligence", value: "Artificial Intelligence" },
  { label: "Machine Learning", value: "Machine Learning" },
  { label: "Artificial Intelligence & Machine Learning", value: "Artificial Intelligence & Machine Learning" },
  { label: "Data Science", value: "Data Science" },
  { label: "Cyber Security", value: "Cyber Security" },
  { label: "Information Security", value: "Information Security" },
  { label: "Ethical Hacking", value: "Ethical Hacking" },
  { label: "Cloud Computing", value: "Cloud Computing" },
  { label: "DevOps", value: "DevOps" },
  { label: "Internet of Things (IoT)", value: "IoT" },
  { label: "Blockchain", value: "Blockchain" },
  { label: "Full Stack Development", value: "Full Stack Development" },
  { label: "Software Engineering", value: "Software Engineering" },
  { label: "Mobile Application Development", value: "Mobile Application Development" },
  { label: "Web Development", value: "Web Development" },
  { label: "Computer Networks", value: "Computer Networks" },
  { label: "Network Security", value: "Network Security" },
  { label: "Database Management", value: "Database Management" },
  { label: "Computer Vision", value: "Computer Vision" },
  { label: "Natural Language Processing (NLP)", value: "NLP" },
  { label: "Robotics", value: "Robotics" },
  { label: "Embedded Systems", value: "Embedded Systems" },
  { label: "Big Data Analytics", value: "Big Data Analytics" },
  { label: "Game Development", value: "Game Development" },
  { label: "AR/VR", value: "AR/VR" },
  { label: "Quantum Computing", value: "Quantum Computing" }
].sort((a, b) => a.label.localeCompare(b.label));

export const STREAMS = [
  {
    label: "Engineering",
    options: [
      { label: "B.E.", value: "B.E." },
      { label: "B.Tech.", value: "B.Tech." }
    ].sort((a, b) => a.label.localeCompare(b.label))
  },
  {
    label: "Arts & Science",
    options: [
      { label: "B.Sc", value: "B.Sc" }
    ].sort((a, b) => a.label.localeCompare(b.label))
  },
  {
    label: "Commerce",
    options: [
      { label: "B.Com", value: "B.Com" },
      { label: "B.Com Computer Applications", value: "B.Com Computer Applications" },
      { label: "B.Com Information Systems", value: "B.Com Information Systems" }
    ].sort((a, b) => a.label.localeCompare(b.label))
  },
  {
    label: "Management",
    options: [
      { label: "BBA", value: "BBA" },
      { label: "BBA Computer Applications", value: "BBA Computer Applications" }
    ].sort((a, b) => a.label.localeCompare(b.label))
  },
  {
    label: "Postgraduate",
    options: [
      { label: "M.E.", value: "M.E." },
      { label: "M.Tech.", value: "M.Tech." },
      { label: "MCA", value: "MCA" },
      { label: "M.Sc", value: "M.Sc" }
    ].sort((a, b) => a.label.localeCompare(b.label))
  },
  {
    label: "Diploma",
    options: [
      { label: "Diploma in Computer Engineering", value: "Diploma in Computer Engineering" },
      { label: "Diploma in Information Technology", value: "Diploma in Information Technology" },
      { label: "Diploma in AI & ML", value: "Diploma in AI & ML" },
      { label: "Diploma in Cyber Security", value: "Diploma in Cyber Security" },
      { label: "Diploma in Data Science", value: "Diploma in Data Science" }
    ].sort((a, b) => a.label.localeCompare(b.label))
  }
];
