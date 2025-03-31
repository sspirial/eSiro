const mockStores = [
  {
    id: 1,
    name: "Store One",
    location: "123 Main St",
    products: [1, 2, 3],
  },
  {
    id: 2,
    name: "Store Two",
    location: "456 Elm St",
    products: [4, 5, 6],
  },
];

const mockProducts = [
  {
    id: 1,
    name: "Product One",
    price: 10.0,
    storeId: 1,
  },
  {
    id: 2,
    name: "Product Two",
    price: 20.0,
    storeId: 1,
  },
  {
    id: 3,
    name: "Product Three",
    price: 30.0,
    storeId: 1,
  },
  {
    id: 4,
    name: "Product Four",
    price: 40.0,
    storeId: 2,
  },
  {
    id: 5,
    name: "Product Five",
    price: 50.0,
    storeId: 2,
  },
  {
    id: 6,
    name: "Product Six",
    price: 60.0,
    storeId: 2,
  },
];

const mockUsers = [
  {
    id: 1,
    name: "User One",
    email: "userone@example.com",
    favoriteStores: [1],
    recentOrders: [1, 2],
    role: "buyer",
  },
  {
    id: 2,
    name: "User Two",
    email: "usertwo@example.com",
    favoriteStores: [2],
    recentOrders: [3, 4],
    role: "vendor",
  },
  {
    id: 3,
    name: "User Three",
    email: "userthree@example.com",
    favoriteStores: [],
    recentOrders: [],
    role: "unregistered",
  },
];

export { mockStores, mockProducts, mockUsers };
