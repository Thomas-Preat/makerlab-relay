import { useState, useEffect } from "react";
import InventoryItem from "../components/inventory/InventoryItem";
import { useRole } from "../context/RoleContext";
import { nhost } from "../lib/nhost";

function Inventory() {
  const { role } = useRole();
  const [items, setItems] = useState([]);  // will be filled from the database
  const [search, setSearch] = useState("");

  const handleBorrow = async (id) => {
    // optimistic UI update
    setItems(
      items.map(item =>
        item.id === id && item.quantity > 0
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );

    try {
      await nhost.graphql.request({
        query: `
          mutation DecrementItem($id: uuid!) {
            update_components_by_pk(pk_columns: {id: $id}, _inc: {quantity: -1}) {
              id
              quantity
            }
          }
        `,
        variables: { id }
      });
    } catch (err) {
      console.error("Erreur lors de la mise à jour de l'inventaire :", err);
      // in case of failure we could re-fetch or revert; skipping for brevity
    }
  };

  // teachers can modify an entry
  const handleUpdate = async (updated) => {
    // optimistic UI update
    setItems(items.map(i => (i.id === updated.id ? { ...i, ...updated } : i)));

    try {
      const { id, name, category, quantity, location } = updated;
      await nhost.graphql.request({
        query: `
          mutation UpdateComponent($id: uuid!, $changes: components_set_input!) {
            update_components_by_pk(pk_columns: {id: $id}, _set: $changes) {
              id
              name
              category
              quantity
              location
            }
          }
        `,
        variables: { id, changes: { name, category, quantity, location } }
      });
    } catch (err) {
      console.error("Erreur lors de la modification d'un composant :", err);
      // optionally re-fetch or rollback
    }
  };

  // fetch inventory items from Hasura on mount
  useEffect(() => {
    async function fetchItems() {
      try {
        const res = await nhost.graphql.request({
          query: `
            query {
              components(order_by: { name: asc }) {
                id
                name
                slug
                category
                quantity
                location
              }
            }
          `
        });
        setItems(res.body.data.components || []);
      } catch (err) {
        console.error("Erreur fetching components:", err);
      }
    }
    fetchItems();
  }, []);

  // prepare filtered list based on search term (match name or category)
  const displayed = items.filter(item => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return (
      item.name.toLowerCase().includes(term) ||
      item.category.toLowerCase().includes(term)
    );
  });

  return (
    <div className="inventory-page">
      <h1>Inventaire</h1>

      <div className="inventory-search">
        <input
          type="text"
          placeholder="Rechercher par nom ou catégorie..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {displayed.length === 0 ? (
        <p>Aucun article trouvé.</p>
      ) : (
        displayed.map(item => (
          <InventoryItem
            key={item.id}
            item={item}
            role={role}
            onBorrow={handleBorrow}
            onUpdate={handleUpdate}
          />
        ))
      )}
    </div>
  );
}

export default Inventory;