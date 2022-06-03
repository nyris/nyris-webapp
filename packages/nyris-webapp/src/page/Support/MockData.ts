export const rows: any = [
  { id: 1, lastName: "Snow", firstName: "Jon", age: 35, date: "21/2" },
  { id: 2, lastName: "Lannister", firstName: "Cersei", age: 42, date: "21/2" },
  { id: 3, lastName: "Lannister", firstName: "Jaime", age: 45, date: "21/2" },
  { id: 4, lastName: "Stark", firstName: "Arya", age: 16, date: "21/2" },
  {
    id: 5,
    lastName: "Targaryen",
    firstName: "Daenerys",
    age: null,
    date: "21/2",
  },
  { id: 6, lastName: "Melisandre", firstName: null, age: 150, date: "21/2" },
  { id: 7, lastName: "Clifford", firstName: "Ferrara", age: 44, date: "21/2" },
  { id: 8, lastName: "Frances", firstName: "Rossini", age: 36, date: "21/2" },
  { id: 9, lastName: "Roxie", firstName: "Harvey", age: 65, date: "21/2" },
];

export const columns: any = [
  { field: "id", headerName: "Ticket number", width: 640 / 5 - 14, sortable: false, },
  {
    field: "firstName",
    headerName: "Brand",
    width: 640 / 5 - 14,
  },
  {
    field: "lastName",
    headerName: "Message",
    width: 640 / 5 - 14,
    sortable: false,
  },
  {
    field: "age",
    headerName: "Search (Atachments)",
    type: "number",
    width: 640 / 5,
    sortable: false,
  },
  {
    field: "date",
    headerName: "Date",
    type: "date",
    // width: 640 / 5 - 14,
  },
];
