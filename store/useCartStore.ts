
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  id: string;
  title: string;
  price: number;
  discount: number;
  coverImage: string;
  quantity: number;
  inStock: number;
};

interface CartState {
  items: CartItem[];
  addItem: (
    item: Omit<CartItem, "quantity">,
    quantity?: number
  ) => number;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      // Thêm sản phẩm với số lượng tùy chọn
      // Trả về số lượng thực tế đã thêm vào giỏ
      addItem: (newItem, requestedQuantity = 1) => {
        const safeRequestedQuantity = Number.isFinite(requestedQuantity)
          ? Math.max(1, Math.floor(requestedQuantity))
          : 1;

        let addedQuantity = 0;

        set((state) => {
          const stock = Math.max(0, Math.floor(newItem.inStock));

          // Sản phẩm hết hàng
          if (stock <= 0) return state;

          const existingItem = state.items.find(
            (item) => item.id === newItem.id
          );

          // Nếu sản phẩm đã có trong giỏ
          if (existingItem) {
            // Đảm bảo số lượng hiện tại không vượt tồn kho mới nhất
            const currentQuantity = Math.min(
              Math.max(1, Math.floor(existingItem.quantity)),
              stock
            );

            // Số lượng còn có thể mua
            const availableStock = Math.max(
              0,
              stock - currentQuantity
            );

            // Số lượng thực tế được thêm
            addedQuantity = Math.min(
              safeRequestedQuantity,
              availableStock
            );

            const updatedItem = {
              ...existingItem,
              ...newItem,
              inStock: stock,
              quantity: currentQuantity + addedQuantity,
            };

            // Nếu không có gì thay đổi thì giữ nguyên state
            if (
              addedQuantity === 0 &&
              existingItem.quantity === updatedItem.quantity &&
              existingItem.inStock === updatedItem.inStock &&
              existingItem.price === updatedItem.price &&
              existingItem.discount === updatedItem.discount
            ) {
              return state;
            }

            return {
              items: state.items.map((item) =>
                item.id === newItem.id ? updatedItem : item
              ),
            };
          }

          // Nếu sản phẩm chưa có trong giỏ
          addedQuantity = Math.min(safeRequestedQuantity, stock);

          return {
            items: [
              ...state.items,
              {
                ...newItem,
                inStock: stock,
                quantity: addedQuantity,
              },
            ],
          };
        });

        return addedQuantity;
      },

      // Xóa sản phẩm khỏi giỏ
      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      // Cập nhật số lượng trong giỏ hàng
      updateQuantity: (id, quantity) => {
        set((state) => ({
          items: state.items.map((item) => {
            if (item.id === id) {
              const requestedQuantity = Number.isFinite(quantity)
                ? Math.floor(quantity)
                : 1;

              const safeQuantity = Math.min(
                Math.max(1, requestedQuantity),
                item.inStock
              );

              return {
                ...item,
                quantity: safeQuantity,
              };
            }

            return item;
          }),
        }));
      },

      // Xóa toàn bộ giỏ hàng
      clearCart: () => set({ items: [] }),

      // Tổng số lượng sản phẩm
      getTotalItems: () =>
        get().items.reduce(
          (total, item) => total + item.quantity,
          0
        ),

      // Tổng giá trị giỏ hàng
      getTotalPrice: () =>
        get().items.reduce((total, item) => {
          const finalPrice =
            item.price * (1 - item.discount / 100);

          return total + finalPrice * item.quantity;
        }, 0),
    }),
    {
      name: "wellness-cart-storage",
    }
  )
);
