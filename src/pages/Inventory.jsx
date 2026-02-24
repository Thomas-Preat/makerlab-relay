import { useState } from "react";
import mockInventory from "../data/mockInventory";
import InventoryItem from "../components/inventory/InventoryItem";

function Inventory() {
  // role not used
  const [items, setItems] = useState(mockInventory);

  const handleBorrow = (id) => {
    setItems(
      items.map(item =>
        item.id === id && item.quantity > 0
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Inventaire</h1>

      {items.map(item => (
        <InventoryItem
          key={item.id}
          item={item}
          /* no role prop */
          onBorrow={handleBorrow}
        />
      ))}
    </div>
  );
}

export default Inventory;