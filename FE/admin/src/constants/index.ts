

  export  const TABLE_ROLES = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Permissions",
      dataIndex: "permissions",
      key: "permissions",
      render: (text, record) => `${record?.permissions?.length > 0 ? "co" : '[ ]'}`
    },
    {
        title: "Actions",
        dataIndex: "actions",
        key: "actions",
      }
  ];

export const TABLE_POSTS =
[
  {
    title: "Description",
    dataIndex: "description",
    key: "description",
  },
  {
    title: "Author",
    dataIndex: "author",
    key: "author",
  },
  {
    title: "Content",
    dataIndex: "content",
    key: "content",
  },
  {
    title: "Visibility",
    dataIndex: "visibility",
    key: "visibility",
  },
  {
    title: "Description",
    dataIndex: "description",
    key: "description",
  },
  {
    title: "Created At",
    dataIndex: "createdAt",
    key: "createdAt",
  },
  {
    title: "Updated At",
    dataIndex: "updatedAt",
    key: "updatedAt",
  },
  {
    title: "Language",
    dataIndex: "language",
    key: "language",
  },
  {
    title: "Sentiment",
    dataIndex: "sentiment",
    key: "sentiment",
  },
  {
    title: "Reactions",
    dataIndex: "reactions",
    key: "reactions",
  }
];




